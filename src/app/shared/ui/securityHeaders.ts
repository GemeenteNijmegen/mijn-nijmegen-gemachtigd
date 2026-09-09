import { ApiGatewayV2Response } from '@gemeentenijmegen/apigateway-http/lib/V2/Response';

/**
 * Andere Nijmegen-apps zetten dit soort headers vaak centraal via een CloudFront ResponseHeadersPolicy
 * op hun eigen distributie. De HTML in deze repo loopt via de API Gateway-origin achter Mijn Nijmegen's CloudFront,
 * en die distributie is niet van deze repo. We krijgen via SSM alleen distributionId/domainName om ernaar te
 * verwijzen (bucketpolicy, cache-invalidatie), dat is geen bewerkbare resource: de behaviors zitten in de
 * CDK-code van de andere repo, en die wijzigen we hier niet. Vandaar dat elke Lambda-response deze headers
 * zelf meekrijgt in plaats van dat het bij de CDN geregeld wordt. Niet fraai, maar voor nu even prima
 */
const CSP = [
  "default-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "connect-src 'self'",
  "style-src 'self'",
  "script-src 'self'",
  "font-src 'self'",
  "img-src 'self' data:",
  "object-src 'none'",
].join('; ');

const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': CSP,
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
};

export function withSecurityHeaders(response: ApiGatewayV2Response): ApiGatewayV2Response {
  return { ...response, headers: { ...response.headers, ...SECURITY_HEADERS } };
}
