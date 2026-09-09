import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Session } from '@gemeentenijmegen/session';

export async function requireSession(cookies: string | undefined, dynamoDBClient: DynamoDBClient): Promise<Session | undefined> {
  const session = new Session(cookies ?? '', dynamoDBClient);
  const found = await session.init();
  if (!found || !session.isLoggedIn()) {
    return undefined;
  }
  return session;
}
