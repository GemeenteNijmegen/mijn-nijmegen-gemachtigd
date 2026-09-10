import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ApiGatewayV2Response, Response } from '@gemeentenijmegen/apigateway-http/lib/V2/Response';
import { APIGatewayProxyEventV2, Context } from 'aws-lambda';

import { TakenRequestHandler } from './TakenRequestHandler';
import { errorReason } from '../../observability/errorReason';
import { logger } from '../../observability/Logger';
import { bindRequestLogging, resetRequestLogging, withCorrelationId } from '../../observability/RequestLogging';
import { requireSession } from '../shared/auth/requireSession';
import { withSecurityHeaders } from '../shared/ui/securityHeaders';

const dynamoDBClient = new DynamoDBClient({});

export async function handler(event: APIGatewayProxyEventV2, context: Context): Promise<ApiGatewayV2Response> {
  const correlationId = bindRequestLogging(context);
  try {
    const session = await requireSession(event.cookies?.join(';'), dynamoDBClient);
    const requestHandler = new TakenRequestHandler({ session });
    const params = parseEvent(event);
    const response = await requestHandler.handleRequest(params);
    return withSecurityHeaders(withCorrelationId(response, correlationId));
  } catch (error) {
    logger.error('Taken mislukt', { reason: errorReason(error) });
    return withSecurityHeaders(withCorrelationId(Response.error(500), correlationId));
  } finally {
    resetRequestLogging();
  }
}

export interface EventParams {
  taakId?: string;
  xsrfToken?: string;
  responseType?: 'json' | 'html';
}

function parseEvent(event: APIGatewayProxyEventV2): EventParams {
  return {
    taakId: event?.pathParameters?.taakid,
    xsrfToken: event?.headers?.xsrftoken,
    responseType: event?.headers?.accept == 'application/json' ? 'json' : 'html',
  };
}