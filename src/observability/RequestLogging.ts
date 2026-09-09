import { ApiGatewayV2Response } from '@gemeentenijmegen/apigateway-http/lib/V2/Response';
import type { Context } from 'aws-lambda';
import { logger } from './Logger';
import { xRayTraceId } from './xRayTraceId';

/** Geeft de correlation id terug zodat de handler die ook als X-Correlation-Id kan meesturen. */
export function bindRequestLogging(context: Context): string {
  const correlationId = xRayTraceId();
  logger.addContext(context);
  logger.appendKeys({ correlationId });
  return correlationId;
}

// appendKeys blijft op een warme container hangen tot je hem zelf opruimt, dus dit hoort in de finally.
export function resetRequestLogging(): void {
  logger.resetKeys();
}

export function withCorrelationId(response: ApiGatewayV2Response, correlationId: string): ApiGatewayV2Response {
  return { ...response, headers: { ...response.headers, 'X-Correlation-Id': correlationId } };
}
