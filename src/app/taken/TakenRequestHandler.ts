import { ApiGatewayV2Response, Response } from '@gemeentenijmegen/apigateway-http/lib/V2/Response';
import { Session } from '@gemeentenijmegen/session';
import { render } from '../shared/ui/render';
import takenTemplate from './templates/taken.mustache';

export interface TakenRequestHandlerProps {
  session?: Session;
}

export class TakenRequestHandler {
  constructor(private readonly props: TakenRequestHandlerProps) { }

  async handleRequest(): Promise<ApiGatewayV2Response> {
    if (!this.props.session?.isLoggedIn()) {
      return Response.redirect('/gemachtigd/login');
    }

    const html = render(takenTemplate, { title: 'Taken', loggedIn: true }, {
      identifier: this.props.session.getValue('identifier'),
      type: this.props.session.getValue('type'),
      clientBsn: this.props.session.getValue('clientBsn'),
      kvkNumber: this.props.session.getValue('kvkNumber'),
    });
    return Response.html(html);
  }
}
