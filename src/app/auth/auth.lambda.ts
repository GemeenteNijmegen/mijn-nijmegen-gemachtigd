import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ApiGatewayV2Response, Response } from '@gemeentenijmegen/apigateway-http/lib/V2/Response';
import { environmentVariables } from '@gemeentenijmegen/utils';
import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { AuthRequestHandler } from './AuthRequestHandler';
import { VerIdCache } from './verid/VerIdCache';
import { getVerIdClientSecret, getVerIdDisclosureConfig } from './verid/VerIdConfiguration';
import { VerIdDisclosureFlow } from './verid/VerIdDisclosureFlow';
import { errorReason } from '../../observability/errorReason';
import { logger } from '../../observability/Logger';
import { bindRequestLogging, resetRequestLogging, withCorrelationId } from '../../observability/RequestLogging';
import { withSecurityHeaders } from '../shared/ui/securityHeaders';

const dynamoDBClient = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);

export async function handler(event: APIGatewayProxyEventV2, context: Context): Promise<ApiGatewayV2Response> {
  const correlationId = bindRequestLogging(context);
  try {
    const { SESSION_TABLE } = environmentVariables(['SESSION_TABLE']);
    const cache = new VerIdCache(documentClient, SESSION_TABLE);
    const config = getVerIdDisclosureConfig();
    const clientSecret = await getVerIdClientSecret();
    const flow = new VerIdDisclosureFlow(config, cache, clientSecret);
    // redirectUri is de vaste, geconfigureerde callback url. Alleen de query (code/state/error) komt uit het request.
    const callbackUrl = new URL(`${config.redirectUri}?${event.rawQueryString}`);

    const requestHandler = new AuthRequestHandler({
      callbackUrl,
      queryStringParamError: event.queryStringParameters?.error,
      dynamoDBClient,
      flow,
    });
    const response = await requestHandler.handleRequest();
    return withSecurityHeaders(withCorrelationId(response, correlationId));
  } catch (error) {
    logger.error('Callback mislukt', { reason: errorReason(error) });
    return withSecurityHeaders(withCorrelationId(Response.error(500), correlationId));
  } finally {
    resetRequestLogging();
  }
}
