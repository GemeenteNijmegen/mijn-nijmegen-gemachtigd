import { HomeRequestHandler } from '../HomeRequestHandler';

test('zonder sessie stuurt home terug naar login', async () => {
  const response = await new HomeRequestHandler({ session: undefined }).handleRequest();
  expect(response.statusCode).toBe(302);
  expect(response.headers?.Location).toBe('/login');
});
