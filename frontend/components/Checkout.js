import { useMutation } from '@apollo/client';
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import gql from 'graphql-tag';
import { useRouter } from 'next/router';
import nProgress from 'nprogress';
import { useState } from 'react';
import styled from 'styled-components';
import { useCart } from '../lib/cartState';
import SickButton from './styles/SickButton';
import { CURRENT_USER_QUERY } from './User';

const CheckoutFormStyles = styled.form`
  box-shadow: 0 1px 2px 2px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 5px;
  padding: 1rem;
  display: grid;
  grid-gap: 1rem;
`;

const ErrorText = styled.p`
  font-size: 12px;
`;

const stripeLib = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION($token: String!) {
    checkout(token: $token) {
      id
      charge
      total
      items {
        id
        name
      }
    }
  }
`;

function CheckoutForm() {
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { closeCart } = useCart();
  const [checkout, { error: graphQLError }] = useMutation(
    CREATE_ORDER_MUTATION,
    {
      refetchQueries: [{ query: CURRENT_USER_QUERY }],
    }
  );

  async function handleSubmit(e) {
    // 1. Stop form from submitting and turn the loader on
    e.preventDefault();
    setLoading(true);

    // 2. Start the page transition
    nProgress.start();

    // 3. Create the payment method via stripe (Token comes back here if successful)
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    // 4. Handle any errors from stripe
    if (error) {
      setError(error);
      nProgress.done();
      return; // Stops the checkout from happening
    }

    // 5. Send the toek from step 3 to our keystone server, via a custom mutation
    const order = await checkout({
      variables: {
        token: paymentMethod.id,
      },
    });

    // 6. Change the page to view the order
    router.push({
      pathname: '/order/[id]',
      query: { id: order.data.checkout.id },
    });

    // 7. Close the cart
    closeCart();

    // 8. Turn the loader off
    setLoading(false);
    nProgress.done();
  }
  return (
    <CheckoutFormStyles onSubmit={handleSubmit}>
      {error && <ErrorText>{error.message}</ErrorText>}
      {graphQLError && <ErrorText>{graphQLError.message}</ErrorText>}
      <CardElement />
      <SickButton>Check Out Now</SickButton>
    </CheckoutFormStyles>
  );
}

function Checkout() {
  return (
    <Elements stripe={stripeLib}>
      <CheckoutForm />
    </Elements>
  );
}

export { Checkout };
