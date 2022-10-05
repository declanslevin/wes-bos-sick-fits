import { MockedProvider } from '@apollo/react-testing';
import { render, screen } from '@testing-library/react';
import SingleProduct, { SINGLE_ITEM_QUERY } from '../components/SingleProduct';
import { fakeItem } from '../lib/testUtils';

const product = fakeItem();

const mockedData = [
  {
    // when someone requests this query and variable combo
    request: {
      query: SINGLE_ITEM_QUERY,
      variables: {
        id: '123',
      },
    },
    // Return this data
    result: {
      data: {
        Product: product,
      },
    },
  },
];

describe('<SingleProduct />', () => {
  it('renders with proper data', async () => {
    const { container } = render(
      <MockedProvider mocks={mockedData}>
        <SingleProduct id="123" />
      </MockedProvider>
    );
    await screen.findByTestId('singleProduct');
    expect(container).toMatchSnapshot();
  });

  it('Errors when an item is not found', async () => {
    const errorMock = [
      {
        request: {
          query: SINGLE_ITEM_QUERY,
          variables: {
            id: '123',
          },
        },
        result: {
          errors: [{ message: 'Item not found!' }],
        },
      },
    ];

    const { container } = render(
      <MockedProvider mocks={errorMock}>
        <SingleProduct id="123" />
      </MockedProvider>
    );
    await screen.findByTestId('graphql-error');
    expect(container).toHaveTextContent('Shoot!');
    expect(container).toHaveTextContent('Item not found!');
    expect(container).toMatchSnapshot();
  });
});
