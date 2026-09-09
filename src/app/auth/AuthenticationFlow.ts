import { AuthenticationResult } from './AuthenticationResult';

export interface AuthenticationFlow {
  start(): Promise<string>;
  complete(callbackUrl: URL): Promise<AuthenticationResult>;
}
