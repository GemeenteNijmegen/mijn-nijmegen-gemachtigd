import { AWS, environmentVariables } from '@gemeentenijmegen/utils';
import { z } from 'zod';

/**
 * Namen van de env vars die de infra-kant zet: de config json komt uit SSM (bij deploy gebakken),
 * de secret arn wijst naar Secrets Manager en wordt pas op runtime opgehaald.
 */
export const VERID_CONFIG_ENV_VAR = 'VERID_DISCLOSURE_CONFIG';
export const VERID_SECRET_ARN_ENV_VAR = 'VERID_DISCLOSURE_SECRET_ARN';

const configSchema = z.object({
  issuerUri: z.string().min(1),
  clientId: z.string().min(1),
  redirectUri: z.string().min(1),
});

const secretSchema = z.object({
  clientSecret: z.string().min(1),
});

export interface VerIdDisclosureConfig {
  issuerUri: string;
  clientId: string;
  redirectUri: string;
}

/**
 * generateDisclosureUrl() heeft geen client secret nodig, alleen finalize() in de callback wel.
 * Daarom los van elkaar: login leest het secret dan nooit uit en heeft er ook geen IAM voor nodig.
 */
export function getVerIdDisclosureConfig(): VerIdDisclosureConfig {
  const env = environmentVariables([VERID_CONFIG_ENV_VAR]);
  return configSchema.parse(JSON.parse(env[VERID_CONFIG_ENV_VAR]));
}

export async function getVerIdClientSecret(): Promise<string> {
  const env = environmentVariables([VERID_SECRET_ARN_ENV_VAR]);
  const secretString = await AWS.getSecret(env[VERID_SECRET_ARN_ENV_VAR]);
  const secret = secretSchema.parse(JSON.parse(secretString));
  return secret.clientSecret;
}
