import { Attribute } from '@/graphql/category/schema';
import { screen, fireEvent, render } from '@testing-library/react';
import AttributeNumber from '../../../../../components/attribute/number';

const priceAttribute = {
  id: '1',
  name: 'Price',
  category: 'NA',
  type: 'number',
};

const lengthAttribute: Attribute = {
  id: '2',
  name: 'Length',
  category: 'NA',
  type: 'number',
  min: 0,
  max: 100,
};

const renderView = async (attribute: Attribute) => {
  render(
    <AttributeNumber attribute={attribute} />
  );
};

jest.mock('../../../../../context', () => ({
  useAppContext: () => ({
    refinement: {
      search: '',
      sort: 'date-new',
      filters: [
        { id: '1', selection: undefined },
        { id: '2', selection: undefined },
      ],
    },
    setRefinement: () => (null),
  }),
}));

test('Render Range', async () => {
  renderView(priceAttribute);
});

test('Render Slider', async () => {
  renderView(lengthAttribute);
  const sliders = screen.getAllByRole('slider');
  fireEvent.change(sliders[0], { target: { value: 25 } });
});

test('Render Slider With Symbol', async () => {
  lengthAttribute.symbol = 'ft';
  renderView(lengthAttribute);
  const sliders = screen.getAllByRole('slider');
  fireEvent.change(sliders[0], { target: { value: 25 } });
});
