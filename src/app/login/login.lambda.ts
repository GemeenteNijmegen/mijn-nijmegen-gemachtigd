import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ApiGatewayV2Response, Response } from '@gemeentenijmegen/apigateway-http/lib/V2/Response';
import { environmentVariables } from '@gemeentenijmegen/utils';
import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { LoginRequestHandler } from './LoginRequestHandler';
import { errorReason } from '../../observability/errorReason';
import { logger } from '../../observability/Logger';
import { bindRequestLogging, resetRequestLogging, withCorrelationId } from '../../observability/RequestLogging';
import { VerIdCache } from '../auth/verid/VerIdCache';
import { getVerIdDisclosureConfig } from '../auth/verid/VerIdConfiguration';
import { VerIdDisclosureFlow } from '../auth/verid/VerIdDisclosureFlow';
import { withSecurityHeaders } from '../shared/ui/securityHeaders';

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function handler(event: APIGatewayProxyEventV2, context: Context): Promise<ApiGatewayV2Response> {
  const correlationId = bindRequestLogging(context);
  try {
    const { SESSION_TABLE } = environmentVariables(['SESSION_TABLE']);
    const cache = new VerIdCache(documentClient, SESSION_TABLE);
    const config = getVerIdDisclosureConfig();
    const flow = new VerIdDisclosureFlow(config, cache);
    const requestHandler = new LoginRequestHandler({ flow });
    const response = await requestHandler.handleRequest({ method: event.queryStringParameters?.method });
    return withSecurityHeaders(withCorrelationId(response, correlationId));
  } catch (error) {
    logger.error('Login mislukt', { reason: errorReason(error) });
    return withSecurityHeaders(withCorrelationId(Response.error(500), correlationId));
  } finally {
    resetRequestLogging();
  }
}
