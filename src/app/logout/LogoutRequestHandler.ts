import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ApiGatewayV2Response, Response } from '@gemeentenijmegen/apigateway-http/lib/V2/Response';
import { Session } from '@gemeentenijmegen/session';
import logoutTemplate from './templates/logout.mustache';
import { logger } from '../../observability/Logger';
import { render } from '../shared/ui/render';

export interface LogoutRequestHandlerProps {
  cookies?: string;
  dynamoDBClient: DynamoDBClient;
}

export class LogoutRequestHandler {
  constructor(private readonly props: LogoutRequestHandlerProps) {}

  async handleRequest(): Promise<ApiGatewayV2Response> {
    const session = new Session(this.props.cookies ?? '', this.props.dynamoDBClient);
    if (await session.init()) {
      await session.updateSession({ loggedin: { BOOL: false } });
      logger.info('Sessie uitgelogd');
    }

    /**
     * Session heeft geen delete, dus loggedin false is de invalidatie. Voor de cookie is een lege
     * sessie (geen sessionId) al genoeg: getCookie() zet dan gewoon een leeg waarde-cookie.
     */
    const clearedCookie = new Session('', this.props.dynamoDBClient).getCookie();
    const html = render(logoutTemplate, { title: 'Uitgelogd', loggedIn: false });
    return Response.html(html, 200, [clearedCookie]);
  }
}
