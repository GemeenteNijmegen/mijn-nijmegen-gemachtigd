import { assertAttestedFlatV1JwtPayload, ICacheManager, VeridDisclosureClient } from '@ver-id/node-client';
import { z } from 'zod';
import { VerIdDisclosureConfig } from './VerIdConfiguration';
import { AuthenticationFlow } from '../AuthenticationFlow';
import { AuthenticationResult } from '../AuthenticationResult';

/**
 * Dit is de mapping die in VerID Studio is ingesteld voor deze disclosure flow, geen vast SDK-type.
 * Vandaar zelf valideren voordat we het als sessie-data vertrouwen.
 * Scopes staat apart in de Oath scope string, niet in de encoded jwt
 */
const disclosureMappingSchema = z.object({
  identifier: z.string(),
  type: z.string(),
  clientBsn: z.string(),
  kvkNumber: z.string(),
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
    const disclosureResponse = await this.client.finalize({
      clientAuth: { client_secret: this.clientSecret },
      callbackParams: callbackUrl,
    });
    const jwt = await this.client.decode(disclosureResponse, assertAttestedFlatV1JwtPayload);
    const mapping = disclosureMappingSchema.parse(jwt.payload.output[0]?.mapping);

    return {
      method: 'IDWallet',
      identifier: mapping.identifier,
      type: mapping.type,
      clientBsn: mapping.clientBsn,
      kvkNumber: mapping.kvkNumber,
      scopes: disclosureResponse.scope.split(' ').filter(Boolean),
    };
  }
}
