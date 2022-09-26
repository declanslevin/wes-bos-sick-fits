import { KeystoneContext } from '@keystone-next/types';
import { CartItemCreateInput } from '../.keystone/schema-types';
import { Session } from '../types';

export default async function addToCart(
  root: any,
  { productId }: { productId: string },
  context: KeystoneContext
): Promise<CartItemCreateInput> {
  console.log('Adding to CART!!');
  // 1. Query the current user to see if they're signed in
  const sesh = context.session as Session;
  if (!sesh.itemId) {
    throw new Error('You muse be logged in to do this!');
  }
  // 2. Query the current user's cart
  const allCartItems = await context.lists.CartItem.findMany({
    where: {
      user: {
        id: sesh.itemId,
      },
      product: {
        id: productId,
      },
    },
    resolveFields: 'id,quantity',
  });

  const [existingCartItem] = allCartItems;
  // 3. See if the current item is in their cart
  // 4. If it is, increment by 1
  if (existingCartItem) {
    console.log(existingCartItem);
    console.log(
      `This item is already ${existingCartItem.quantity} in the cart, increment by 1!`
    );
    return await context.lists.CartItem.updateOne({
      id: existingCartItem.id,
      data: { quantity: existingCartItem.quantity + 1 },
    });
  }

  // 4. If it isn't, create a new cart item
  return await context.lists.CartItem.createOne({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: sesh.itemId } },
    },
  });
}
