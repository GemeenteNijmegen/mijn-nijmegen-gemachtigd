import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { requireSession } from '../requireSession';

process.env.SESSION_TABLE = 'test-sessions';
const dynamoMock = mockClient(DynamoDBClient);

beforeEach(() => {
  dynamoMock.reset();
});

test('geen cookie geeft geen sessie', async () => {
  const session = await requireSession(undefined, new DynamoDBClient({}));
  expect(session).toBeUndefined();
});

test('cookie zonder sessie in dynamodb geeft geen sessie', async () => {
  dynamoMock.on(GetItemCommand).resolves({});
  const session = await requireSession('session=onbekend', new DynamoDBClient({}));
  expect(session).toBeUndefined();
});

test('cookie met een uitgelogde sessie geeft geen sessie', async () => {
  dynamoMock.on(GetItemCommand).resolves({
    Item: { sessionid: { S: 'hash' }, data: { M: { loggedin: { BOOL: false } } }, ttl: { N: '123' } },
  });
  const session = await requireSession('session=bekend', new DynamoDBClient({}));
  expect(session).toBeUndefined();
});

test('cookie met een ingelogde sessie geeft de sessie terug', async () => {
  dynamoMock.on(GetItemCommand).resolves({
    Item: { sessionid: { S: 'hash' }, data: { M: { loggedin: { BOOL: true } } }, ttl: { N: '123' } },
  });
  const session = await requireSession('session=bekend', new DynamoDBClient({}));
  expect(session).toBeDefined();
});
