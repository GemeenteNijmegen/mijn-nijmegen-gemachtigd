import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ApiGatewayV2Response, Response } from '@gemeentenijmegen/apigateway-http/lib/V2/Response';
import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { LogoutRequestHandler } from './LogoutRequestHandler';
import { errorReason } from '../../observability/errorReason';
import { logger } from '../../observability/Logger';
import { bindRequestLogging, resetRequestLogging, withCorrelationId } from '../../observability/RequestLogging';
import { withSecurityHeaders } from '../shared/ui/securityHeaders';

const dynamoDBClient = new DynamoDBClient({});

export async function handler(event: APIGatewayProxyEventV2, context: Context): Promise<ApiGatewayV2Response> {
  const correlationId = bindRequestLogging(context);
  try {
    const requestHandler = new LogoutRequestHandler({ cookies: event.cookies?.join(';'), dynamoDBClient });
    const response = await requestHandler.handleRequest();
    return withSecurityHeaders(withCorrelationId(response, correlationId));
  } catch (error) {
    logger.error('Logout mislukt', { reason: errorReason(error) });
    return withSecurityHeaders(withCorrelationId(Response.error(500), correlationId));
  } finally {
    resetRequestLogging();
  }
}
