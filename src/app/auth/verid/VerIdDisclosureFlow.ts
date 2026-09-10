import { assertDisclosureV1JwtPayload, ICacheManager, VeridDisclosureClient } from '@ver-id/node-client';
import { z } from 'zod';
import { VerIdDisclosureConfig } from './VerIdConfiguration';
import { logger } from '../../../observability/Logger';
import { AuthenticationFlow } from '../AuthenticationFlow';
import { AuthenticationResult } from '../AuthenticationResult';

/**
 * Dit is de mapping die in VerID Studio is ingesteld voor deze disclosure flow, geen vast SDK-type.
 * Vandaar zelf valideren voordat we het als sessie-data vertrouwen.
 * Scopes staat apart in de Oath scope string, niet in de encoded jwt
 */
const disclosureMappingSchema = z.object({
  identifier: z.object({
    value: z.string(),
  }),
  type: z.object({
    value: z.string(),
  }),
  clientBsn: z.object({
    value: z.string(),
  }),
  kvkNumber: z.object({
    value: z.string(),
  }),
  scopes: z.object({
    value: z.array(z.string()),
  }),
});

export class VerIdDisclosureFlow implements AuthenticationFlow {
  private readonly client: VeridDisclosureClient;
  // Alleen nodig voor complete()/finalize(). start() gebruikt dit niet, dus login geeft dit gewoon niet mee.
  private readonly clientSecret?: string;

  constructor(config: VerIdDisclosureConfig, cacheManager: ICacheManager, clientSecret?: string) {
    this.clientSecret = clientSecret;
    this.client = new VeridDisclosureClient({
      issuerUri: config.issuerUri,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      options: { cacheManager },
    });
  }

  async start(): Promise<string> {
    // Genereert een PKCE code verifier en code challenge en een random state
    // Slaat het op in de cache die we meegegeven hebben (session) met prefix verid
    // Bouwt url en geeft url terug
    const { disclosureUrl } = await this.client.generateDisclosureUrl();
    return disclosureUrl;
  }

  async complete(callbackUrl: URL): Promise<AuthenticationResult> {
    if (!this.clientSecret) {
      throw new Error('VerID client secret ontbreekt, nodig om de disclosure af te ronden');
    }
    logger.info('VerID aanroep  finalize met', { callbackUrl });
    let disclosureResponse;
    try {
      disclosureResponse = await this.client.finalize({
        clientAuth: { client_secret: this.clientSecret },
        callbackParams: callbackUrl,
      });
    } catch (error) {
      logger.error('VerID finalize mislukt', {
        name: error instanceof Error ? error.name : undefined,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        type: (error as { type?: string }).type,
        typeDescription: (error as { type_description?: string }).type_description,
      });
      throw error;
    }
    logger.info('Finalize aanroep gelukt', { ...disclosureResponse });
    const jwt = await this.client.decode(disclosureResponse, assertDisclosureV1JwtPayload);
    logger.info('Decode aanroep levert jwt', { jwt });
    const mapping = disclosureMappingSchema.parse(jwt.payload.mapping);
    logger.info('Mapping aanroep gelukt', { ...mapping });
    return {
      method: 'IDWallet',
      identifier: mapping.identifier.value,
      type: mapping.type.value,
      clientBsn: mapping.clientBsn.value,
      kvkNumber: mapping.kvkNumber.value,
      scopes: mapping.scopes.value,
    };
  }
}
