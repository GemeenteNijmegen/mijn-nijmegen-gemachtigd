import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ApiGatewayV2Response, Response } from '@gemeentenijmegen/apigateway-http/lib/V2/Response';
import { Session } from '@gemeentenijmegen/session';
import { AuthenticationFlow } from './AuthenticationFlow';
import loginErrorTemplate from './templates/login-error.mustache';
import { errorReason } from '../../observability/errorReason';
import { logger } from '../../observability/Logger';
import { render } from '../shared/ui/render';

export interface AuthRequestHandlerProps {
  callbackUrl: URL;
  queryStringParamError?: string;
  dynamoDBClient: DynamoDBClient;
  flow: AuthenticationFlow;
}

export class AuthRequestHandler {
  constructor(private readonly props: AuthRequestHandlerProps) {}

  async handleRequest(): Promise<ApiGatewayV2Response> {
    logger.info('Callback ontvangen');

    if (this.props.queryStringParamError) {
      logger.info('Wallet heeft de disclosure geannuleerd of afgewezen', { error: this.props.queryStringParamError });
      return this.loginErrorResponse();
    }

    let result;
    try {
      result = await this.props.flow.complete(this.props.callbackUrl);
      logger.info('Disclosure gecontroleerd');
    } catch (error) {
      logger.error('Disclosure controleren mislukt', { reason: errorReason(error) });
      return this.loginErrorResponse();
    }

    const session = new Session('', this.props.dynamoDBClient);
    await session.createSession({
      loggedin: { BOOL: true },
      method: { S: result.method },
      identifier: { S: result.identifier },
      type: { S: result.type },
      clientBsn: { S: result.clientBsn },
      kvkNumber: { S: result.kvkNumber },
      scopes: { S: result.scopes.join(',') },
    });
    logger.info('Sessie aangemaakt');
    logger.info('Login afgerond');

    return Response.redirect('/gemachtigd/home', 302, [session.getCookie()]);
  }

  private loginErrorResponse(): ApiGatewayV2Response {
    const html = render(loginErrorTemplate, { title: 'Inloggen mislukt', loggedIn: false });
    return Response.html(html, 400);
  }
}
