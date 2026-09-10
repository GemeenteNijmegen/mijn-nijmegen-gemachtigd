import { ApiGatewayV2Response, Response } from '@gemeentenijmegen/apigateway-http/lib/V2/Response';
import { Session } from '@gemeentenijmegen/session';
import homeTemplate from './templates/home.mustache';
import { render } from '../shared/ui/render';

export interface HomeRequestHandlerProps {
  session?: Session;
}

export class HomeRequestHandler {
  constructor(private readonly props: HomeRequestHandlerProps) { }

  async handleRequest(): Promise<ApiGatewayV2Response> {
    if (!this.props.session?.isLoggedIn()) {
      return Response.redirect('/login');
    }

    const scopesValue: string = this.props.session.getValue('scopes') ?? '';
    const scopes = scopesValue ? scopesValue.split(',') : [];

    // Tijdelijk: toont hier letterlijk de disclosure-kenmerken voor de demo, wordt later vervangen door echte content.
    const html = render(homeTemplate, { title: 'Home', loggedIn: true }, {
      scopes,
      identifier: this.props.session.getValue('identifier'),
      type: this.props.session.getValue('type'),
      clientBsn: this.props.session.getValue('clientBsn'),
      kvkNumber: this.props.session.getValue('kvkNumber'),
    });
    return Response.html(html);
  }
}
