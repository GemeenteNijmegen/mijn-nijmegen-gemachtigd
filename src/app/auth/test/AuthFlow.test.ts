import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { HomeRequestHandler } from '../../home/HomeRequestHandler';
import { requireSession } from '../../shared/auth/requireSession';
import { AuthenticationFlow } from '../AuthenticationFlow';
import { AuthenticationResult } from '../AuthenticationResult';
import { AuthRequestHandler } from '../AuthRequestHandler';
import volledigSample from './samples/verid/bewindvoerder-volledig.json';

process.env.SESSION_TABLE = 'test-sessions';

const dynamoMock = mockClient(DynamoDBClient);

beforeEach(() => {
  dynamoMock.reset();
});

function fakeFlow(outcome: AuthenticationResult | Error): AuthenticationFlow {
  return {
    start: async () => 'https://verid.example/disclosure',
    complete: async () => {
      if (outcome instanceof Error) { throw outcome; }
      return outcome;
    },
  };
}

test('geldige disclosure geeft een nieuwe sessie, home toont de scopes', async () => {
  const authResult: AuthenticationResult = { method: 'IDWallet', ...volledigSample };

  let storedItem: Record<string, any> | undefined;
  dynamoMock.on(PutItemCommand).callsFake((input) => {
    storedItem = input.Item;
    return {};
  });

  const authHandler = new AuthRequestHandler({
    callbackUrl: new URL('https://gemachtigd.example/gemachtigd/auth/verid/callback?code=abc&state=xyz'),
    dynamoDBClient: new DynamoDBClient({}),
    flow: fakeFlow(authResult),
  });

  const response = await authHandler.handleRequest();
  expect(response.statusCode).toBe(302);
  expect(response.headers?.Location).toBe('/gemachtigd/home');
  expect(response.cookies?.[0]).toContain('session=');

  // Vervolgrequest: dezelfde cookie terug, sessie ophalen, home laten renderen.
  const sessionId = /session=([^;]+)/.exec(response.cookies![0])![1];
  dynamoMock.on(GetItemCommand).resolves({ Item: storedItem });

  const session = await requireSession(`session=${sessionId}`, new DynamoDBClient({}));
  expect(session).toBeDefined();

  const homeResponse = await new HomeRequestHandler({ session }).handleRequest();
  expect(homeResponse.body).toContain('BWBR0015703:read');
  expect(homeResponse.body).toContain('BWBR0003850:read');
});

test('ongeldige disclosure geeft een veilige foutresponse, geen sessie', async () => {
  const authHandler = new AuthRequestHandler({
    callbackUrl: new URL('https://gemachtigd.example/gemachtigd/auth/verid/callback?code=abc&state=xyz'),
    dynamoDBClient: new DynamoDBClient({}),
    flow: fakeFlow(new Error('ongeldige disclosure mapping')),
  });

  const response = await authHandler.handleRequest();

  expect(response.statusCode).toBe(400);
  expect(response.cookies).toBeUndefined();
  expect(response.body).not.toContain('ongeldige disclosure mapping');
  expect(dynamoMock.commandCalls(PutItemCommand)).toHaveLength(0);
});
