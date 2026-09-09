export interface AuthenticationResult {
  method: string;
  identifier: string;
  type: string;
  clientBsn: string;
  kvkNumber: string;
  scopes: string[];
}
