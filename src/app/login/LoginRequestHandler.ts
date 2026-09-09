import { ApiGatewayV2Response, Response } from '@gemeentenijmegen/apigateway-http/lib/V2/Response';
import { logger } from '../../observability/Logger';
import { AuthenticationFlow } from '../auth/AuthenticationFlow';

const KNOWN_METHODS = ['IDWallet'];

export interface RequestParams {
  method?: string;
}

export interface LoginRequestHandlerProps {
  flow: AuthenticationFlow;
}

export class LoginRequestHandler {
  constructor(private readonly props: LoginRequestHandlerProps) {}

  async handleRequest(params: RequestParams): Promise<ApiGatewayV2Response> {
    logger.info('Login request ontvangen', { method: params.method });

    if (!params.method || !KNOWN_METHODS.includes(params.method)) {
      logger.info('Onbekende inlogmethode geweigerd', { method: params.method });
      return Response.error(400);
    }
    logger.info('Methode gekozen', { method: params.method });

    const disclosureUrl = await this.props.flow.start();
    logger.info('Ver.ID disclosure gestart');

    return Response.redirect(disclosureUrl);
  }
}
