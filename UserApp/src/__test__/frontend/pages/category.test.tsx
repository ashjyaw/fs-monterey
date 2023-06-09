import { render } from '@testing-library/react';
import { CssVarsProvider } from '@mui/joy/styles';
import { graphql } from 'msw';
import { setupServer } from 'msw/node';
import 'whatwg-fetch';
import '../matchMedia';

import CategoryPage from '../../../pages/category/[slug]';
import { getServerSideProps } from '../../../pages/category/[slug]';
import { AppContextProvider } from '../../../context';

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
  graphql.query('ListCategories', async (req, res, ctx) => {
    if (req.variables.slug === 'not-a-category') return res(
      ctx.data({
        category: [null],
      }),
    );

    return res(
      ctx.data({
        category: [{
          slug: 'cars',
          name: 'Cars',
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
  graphql.query('CategoryAncestors', async (req, res, ctx) => {
    return res(
      ctx.data({
        categoryAncestors: [{
          slug: 'cars',
          name: 'Cars',
        }],
      }),
    );
  }),
  graphql.query('CategoryAttributes', async (req, res, ctx) => {
    return res(
      ctx.data({
        categoryAttributes: [{
          id: '1',
          name: 'Color',
          type: 'color',
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

const renderView = async (slug: string) => {
  const { props } = await getServerSideProps({
    query: { slug: slug },
  } as any) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  props && render(
    <CssVarsProvider>
      <AppContextProvider>
        <CategoryPage
          locale={props.locale}
          category={props.category}
        />
      </AppContextProvider>
    </CssVarsProvider>
  );
};

test('Renders', async () => {
  renderView('cars');
  await new Promise(resolve => setTimeout(resolve, 500));
});

test('Redirect', async () => {
  renderView('not-a-category');
  await new Promise(resolve => setTimeout(resolve, 500));
});
