import { render } from '@testing-library/react';
import { CssVarsProvider } from '@mui/joy/styles';
import { graphql } from 'msw';
import { setupServer } from 'msw/node';
import 'whatwg-fetch';
import '../matchMedia';

import { AppContextProvider } from '../../../context';
import SavedPage, { getServerSideProps } from '../../../pages/saved';

const handlers = [
  graphql.query('ListProducts', async (req, res, ctx) => {
    return res(
      ctx.data({
        product: [{
          id: 'X0bZdiabca',
          user: 'molly_member',
          category: 'clothing',
          name: 'Air Jordan 15',
          price: 250,
          date: '2023-02-09T06:43:08.000Z',
          discount: 0,
          quantity: 1,
          description: 'Never worn',
          images: [
            'https://images.pexels.com/whatever',
          ],
          attributes: [
            { id: '1', name: 'Condition', value: 'New' },
          ],
        }],
      }),
    );
  }),
  graphql.query('CategoryChildren', async (req, res, ctx) => {
    return res(
      ctx.data({
        categoryChildren: [{
          slug: 'cars',
          name: 'Cars',
        }],
      }),
    );
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

jest.mock('next/router', () => ({
  useRouter() {
    return {
      query: { slug: '123' },
    };
  },
}));

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => null),
      },
    };
  },
  initReactI18next: {
    type: '3rdParty',
    init: () => null,
  },
}));

const renderView = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { props } = await getServerSideProps({} as any) as any;
  props && render(
    <CssVarsProvider>
      <AppContextProvider>
        <SavedPage
          locale={props.locale}
          category={props.category}
        />
      </AppContextProvider>
    </CssVarsProvider>
  );
};

test('Renders', async () => {
  renderView();
  await new Promise(resolve => setTimeout(resolve, 500));
});

test('With Saved Products', async () => {
  localStorage.setItem('saved', '["X0bZdiabca"]');
  renderView();
  await new Promise(resolve => setTimeout(resolve, 500));
});

test('With Zero Saved Products', async () => {
  localStorage.setItem('saved', '[]');
  renderView();
  await new Promise(resolve => setTimeout(resolve, 500));
});
