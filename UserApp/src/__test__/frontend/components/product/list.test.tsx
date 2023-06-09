import { useAppContext } from '../../../../context';
import { render } from '@testing-library/react';
import ProductList from '../../../../components/product/list';

const products = [{
  user: 'molly_member',
  id: '123',
  category: 'cars',
  name: 'Used Truck',
  price: 0,
  quantity: 1,
  description: 'Heavy-duty',
  date: new Date().toISOString(),
  discount: 0,
  images: [
    'https://images.pexels.com/photos' +
    '/930398/pexels-photo-930398.jpeg?auto=compress&cs=tinysrgb&w=1600',
  ],
  attributes: [
    { id: '1', name: 'Condition', value: 'New' },
  ],
}, {
  user: 'string',
  id: 'string',
  category: 'string',
  name: 'string',
  price: 1,
  quantity: 1,
  description: 'string',
  date: new Date().toISOString(),
  discount: 0,
  images: [
    'https://images.pexels.com/photos' +
    '/930398/pexels-photo-930398.jpeg?auto=compress&cs=tinysrgb&w=1600',
  ],
  attributes: [
    { id: '1', name: 'Condition', value: 'New' },
    { id: '3', name: 'Condition', value: '500' },
    { id: '11', name: 'Color', value: '#ff0000' },
  ],
}];

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
  render(
    <ProductList products={products} />
  );
};

jest.mock('../../../../context');

const mockUseAppContext = useAppContext as jest.MockedFunction<typeof useAppContext>;

test('Renders (By Newest)', async () => {
  mockUseAppContext.mockReturnValue({
    refinement: {
      sort: 'date-new',
      search: '',
      filters: [],
    },
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  renderView();
});

test('Renders (By Oldest)', async () => {
  mockUseAppContext.mockReturnValue({
    refinement: {
      sort: 'date-old',
      search: '',
      filters: [],
    },
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  renderView();
});

test('Renders (By Highest Price)', async () => {
  mockUseAppContext.mockReturnValue({
    refinement: {
      sort: 'price-high',
      search: '',
      filters: [],
    },
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  renderView();
});

test('Renders (By Lowest Price)', async () => {
  mockUseAppContext.mockReturnValue({
    refinement: {
      sort: 'price-low',
      search: '',
      filters: [],
    },
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  renderView();
});

test('Search by name', async () => {
  mockUseAppContext.mockReturnValue({
    refinement: {
      sort: 'date-new',
      search: 'Used Truck',
      filters: [],
    },
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  renderView();
});

test('Search by user', async () => {
  mockUseAppContext.mockReturnValue({
    refinement: {
      sort: 'date-new',
      search: 'molly_member',
      filters: [],
    },
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  renderView();
});

test('Search by category', async () => {
  mockUseAppContext.mockReturnValue({
    refinement: {
      sort: 'date-new',
      search: 'cars',
      filters: [],
    },
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  renderView();
});

test('With filters', async () => {
  mockUseAppContext.mockReturnValue({
    refinement: {
      sort: 'date-new',
      search: '',
      filters: [
        { id: '1', selection: ['New'] },
        { id: 'PRICE', selection: { min: null, max: null } },
      ],
    },
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  renderView();
});

test('With filters', async () => {
  mockUseAppContext.mockReturnValue({
    refinement: {
      sort: 'date-new',
      search: '',
      filters: [
        { id: '1', selection: ['Used'] },
      ],
    },
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  renderView();
});

test('With filters', async () => {
  mockUseAppContext.mockReturnValue({
    refinement: {
      sort: 'date-new',
      search: '',
      filters: [
        { id: '1', selection: [] },
        { id: 'PRICE', selection: { min: 100, max: 200 } },
      ],
    },
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  renderView();
});

test('With filters', async () => {
  mockUseAppContext.mockReturnValue({
    refinement: {
      sort: 'date-new',
      search: '',
      filters: [
        { id: '1', selection: null },
        { id: '2', selection: '#ffffff' },
        { id: '3', selection: { min: 100, max: 200 } },
      ],
    },
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  renderView();
});

test('Color filter', async () => {
  mockUseAppContext.mockReturnValue({
    refinement: {
      sort: 'date-new',
      search: '',
      filters: [
        { id: '11', selection: '#ff0000' },
      ],
    },
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  renderView();
});

test('Color filter', async () => {
  mockUseAppContext.mockReturnValue({
    refinement: {
      sort: 'date-new',
      search: '',
      filters: [
        { id: '11', selection: '#ffffff' },
      ],
    },
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  renderView();
});
