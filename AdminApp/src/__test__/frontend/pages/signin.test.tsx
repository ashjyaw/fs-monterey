import { CssVarsProvider } from '@mui/joy/styles';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql } from 'msw';
import { setupServer } from 'msw/node';
import 'whatwg-fetch';
import '../matchMedia';

import Signin from '../../../pages/signin';
import { AppContextProvider } from '../../../context';

const handlers = [
  graphql.query('signin', async (req, res, ctx) => {
    const json = await req.json();
    if (json.query.indexOf('molly_member') >= 0) {
      return res(
        ctx.data({
          signin: {
            username: 'molly_member',
            accessToken: 'whatever',
            name: 'Molly Member',
          },
        }),
      );
    } else {
      return res(
        ctx.errors([
          {
            message: 'Unexpected error.',
          },
        ]),
      );
    }
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

jest.mock('next/router', () => ({ push: jest.fn() }));

const renderView = async () => {
  render(
    <CssVarsProvider>
      <AppContextProvider>
        <Signin />
      </AppContextProvider>
    </CssVarsProvider>,
  );
};

test('Success', async () => {
  await renderView();
  const username = screen.getByPlaceholderText('Enter your username');
  await userEvent.type(username, 'molly_member');
  const passwd = screen.getByLabelText('password');
  await userEvent.type(passwd, 'mollymember');
  fireEvent.click(screen.getByLabelText('signin'));
  await waitFor(() => {
    expect(localStorage.getItem('user')).not.toBe(null);
  });
});

test('Fail', async () => {
  renderView();
  let alerted = false;
  window.alert = () => {
    alerted = true;
  };
  const username = screen.getByPlaceholderText('Enter your username');
  await userEvent.type(username, 'molly_memb');
  const passwd = screen.getByPlaceholderText('•••••••');
  await userEvent.type(passwd, 'mollymember');
  fireEvent.click(screen.getByLabelText('signin'));
  await waitFor(() => {
    expect(alerted).toBe(true);
  });
  expect(localStorage.getItem('user')).toBe(null);
});

test('User initially in localStorage', async () => {
  const user = {
    name: 'Molly Member',
    username: 'molly_member',
    accessToken: 'whatever',
  };
  localStorage.setItem('user', JSON.stringify(user));
  render(
    <AppContextProvider>
      <div>a child component</div>
    </AppContextProvider>,
  );
  await waitFor(() => {
    expect(localStorage.getItem('user')).not.toBe(null);
  });
});
