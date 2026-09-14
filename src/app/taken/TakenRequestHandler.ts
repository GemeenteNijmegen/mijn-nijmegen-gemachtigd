import { ApiGatewayV2Response, Response } from '@gemeentenijmegen/apigateway-http/lib/V2/Response';
import { Session } from '@gemeentenijmegen/session';
import { environmentVariables } from '@gemeentenijmegen/utils';
import { TaakSummariesResponseSchema } from './TaakSchema';
import { EventParams } from './taken.lambda';
import taakTemplate from './templates/taak.mustache';
import takenTemplate from './templates/taken.mustache';
import { logger } from '../../observability/Logger';
import { render } from '../shared/ui/render';
import { ZakenAggregatorConnector } from '../zaken/ZakenAggregatorConnector';

export interface TakenRequestHandlerProps {
  session?: Session;
}

export class TakenRequestHandler {
  private connector: ZakenAggregatorConnector;

  constructor(private readonly props: TakenRequestHandlerProps) {
    const env = environmentVariables(['ZAKEN_APIGATEWAY_BASEURL', 'ZAKEN_APIGATEWAY_APIKEY']);
    this.connector = new ZakenAggregatorConnector({
      baseUrl: new URL(env.ZAKEN_APIGATEWAY_BASEURL),
      apiKeySecretName: env.ZAKEN_APIGATEWAY_APIKEY,
      timeout: 30000,
    });
  }

  async handleRequest(params: EventParams): Promise<ApiGatewayV2Response> {
    if (!this.props.session?.isLoggedIn()) {
      return Response.redirect('/login');
    }
    if (!params.taakId) {
      return this.list(params);
    }
    return Response.error(400);
  }

  async list(params: EventParams) {
    let hasTimeout = false;
    let taken;
    const isJson = params.responseType == 'json';

    const timeout = 30000;
    this.connector.setTimeout(timeout);
    logger.info('Fetching taken', { isJson: isJson, taakId: params.taakId, xsrfToken: params.xsrfToken, timeout });

    try {
      taken = await this.takenList();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'TimeoutError') {
        logger.error('Fetching taken timed out', { isJson: isJson, taakId: params.taakId, xsrfToken: params.xsrfToken, timeout });
        hasTimeout = true;
      }
    }
    if (isJson) {
      if (hasTimeout) {
        return Response.json({ error: 'Het ophalen van gegevens duurde te lang…' }, 408);
      }
      return Response.json({ elements: [taken] });
    }

    const data = {
      taken: taken?.results ?? [],
      incomplete_results: taken?.incompleteResults ?? false,
      xsrf_token: this.props.session?.getValue('xsrf_token'),
      timeout: hasTimeout,
    };
    // render page
    logger.info('Rendering taken', { isJson: isJson, taakId: params.taakId, xsrfToken: params.xsrfToken, timeout, takenCount: data.taken.length });
    const html = render(takenTemplate, { title: 'Taken', loggedIn: true }, data, { taak: taakTemplate });

    return Response.html(html, 200, this.props.session?.getCookie());

  }

  private async takenList() {
    const endpoint = '/taken';
    const clientBsn = this.props.session?.getValue('clientBsn');
    if (!clientBsn) {
      logger.error('No clientBsn found in session');
      throw new Error('No clientBsn found in session');
    }
    const json = await this.connector.fetch(endpoint, clientBsn);
    try {
      return TaakSummariesResponseSchema.parse(json);
    } catch (error) {
      logger.error('Failed parsing taken');
      throw (error);
    }
  }
}
