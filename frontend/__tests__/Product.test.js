import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import Product from '../components/Product';
import { fakeItem } from '../lib/testUtils';
import { CartStateProvider } from '../lib/cartState';

const product = fakeItem();

describe('<Product />', () => {
  it('renders out the price tag and title', () => {
    const { container } = render(
      <MockedProvider>
        <CartStateProvider>
          <Product product={product} />
        </CartStateProvider>
      </MockedProvider>
    );
    const priceTag = screen.getByText('£50');
    expect(priceTag).toBeInTheDocument();
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '/product/abc123');
    expect(link).toHaveTextContent(product.name);
  });

  it('renders and matches the snapshot', () => {
    const { container } = render(
      <MockedProvider>
        <CartStateProvider>
          <Product product={product} />
        </CartStateProvider>
      </MockedProvider>
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the image properly', () => {
    const { container } = render(
      <MockedProvider>
        <CartStateProvider>
          <Product product={product} />
        </CartStateProvider>
      </MockedProvider>
    );
    const image = screen.getByAltText(product.name);
    expect(image).toBeInTheDocument();
  });
});
