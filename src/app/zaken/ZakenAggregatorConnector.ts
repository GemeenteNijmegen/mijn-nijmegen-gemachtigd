import { AWS } from '@gemeentenijmegen/utils';
import { logger } from '../../observability/Logger';


interface ZakenAggregatorConnectorOptions {
  /**
   * The baseurl for the api you're connecting to
   */
  baseUrl: URL;

  /**
   * The secret name for the AWS secret the apikey is stored in
   * This will be used to (lazily) retrieve the API key on first use
   */
  apiKeySecretName: string;

  /**
   * If set, the fetch will abort after this amount of time, throwing
   * an error. You're expected to handle this error yourself.
   * On timeout, the error will be of type `DOMException` with the name `TimeoutError`
   */
  timeout?: number;

}

/**
 * Manages connections to the zaakaggregator service
 */
export class ZakenAggregatorConnector {
  private keyName: string;
  private apiKey?: string;
  private baseUrl: URL;
  private timeout?: number;

  constructor(options: ZakenAggregatorConnectorOptions) {
    this.keyName = options.apiKeySecretName;
    this.baseUrl = options.baseUrl;
    this.timeout = options.timeout;
  }

  setTimeout(timeout: number) {
    this.timeout = timeout;
  }

  async getApiKey(): Promise<string> {
    if (!this.apiKey) {
      this.apiKey = await AWS.getSecret(this.keyName);
      if (!this.apiKey) {
        throw Error('No API key found');
      }
    }
    return this.apiKey;
  }

  async fetch(endpoint: string, userBsn: string, params?: URLSearchParams) {
    const url = this.createUrlForRequest(endpoint, userBsn, params);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': await this.getApiKey(),
          //application/octet-stream required for binary response from gatewayV1
          'Accept': 'application/octet-stream,application/json',
          'Content-Type': 'application/json',
        },
        signal: (this.timeout) ? AbortSignal.timeout(this.timeout) : undefined,
      });

      if (!response.ok) {
        logger.error(`Zakenaggregator returned HTTP ${response.status}: ${response || 'empty response'}`);
        throw new Error(`Zakenaggregator returned HTTP ${response.status}: ${response || 'empty response'}`);
      }
      const json = await response.json() as any;
      if (process.env.DEBUG == 'True') {
        console.debug(`response for ${endpoint}`, JSON.stringify(json));
      }
      return json;
    } catch (err) {
      console.info('fetch error', err);
      throw err;
    }
  }

  private createUrlForRequest(endpoint: string, userBsn: string, params?: URLSearchParams) {
    const url = new URL(this.baseUrl);
    url.pathname = endpoint;
    const allParams = new URLSearchParams({
      userType: 'person',
      userIdentifier: userBsn,
    });
    if (params) {
      for (let [key, val] of params.entries()) {
        allParams.append(key, val);
      }
    }
    url.search = allParams.toString();
    return url;
  }
}
