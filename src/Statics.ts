export class Statics {
  static readonly projectName: string = 'mijn-nijmegen-gemachtigd';
  static readonly sessionTableName: string = 'mijn-nijmegen-gemachtigd-sessions';

  /**
   * Repo information
   */

  static readonly repository: string = 'mijn-nijmegen-gemachtigd';
  static readonly repositoryOwner: string = 'GemeenteNijmegen';


  // MARK: ENVIRONMENTS
  static readonly buildEnvironment = {
    account: '836443378780',
    region: 'eu-central-1',
  };

  static readonly developmentEnvironment = {
    account: '590184009539',
    region: 'eu-central-1',
  };

  static readonly acceptanceEnvironment = {
    account: '021929636313',
    region: 'eu-central-1',
  };

  static readonly productionEnvironment = {
    account: '740606269759',
    region: 'eu-central-1',
  };


  // MARK: Mijn Nijmegen Gemachtigd infrastructure

  /**
   * DNS record name used for the API Gateway origin behind Mijn Nijmegen CloudFront.
   */
  static readonly apiOriginRecordName = 'gemachtigd-api';
  /**
   * SSM parameter containing the API Gateway origin domain used by Mijn Nijmegen CloudFront.
   */
  static readonly ssmCloudFrontOriginDomain = '/cdk/mijn-nijmegen-gemachtigd/cloudfront/origin-domain';
  /**
   * SSM param with statics bucketname. Used by Mijn Nijmegen Cloudfront.
   */
  static readonly ssmStaticResourcesBucketArn ='/cdk/mijn-nijmegen-gemachtigd/statics/bucket-arn';

  /**
   * VerID disclosure config (issuerUri, clientId, redirectUri) em secret.
   */
  static readonly ssmVerIdDisclosureConfig = '/cdk/mijn-nijmegen-gemachtigd/verid/disclosure/config';
  static readonly veridDisclosureCredentialsSecretName = 'mijn-nijmegen-gemachtigd/verid/disclosure/credentials';

  // TODO: willen we secret origin header vanuit Cloudfront? Of is het nu overkill in deze fase?
  // /**
  //  * Header used by Mijn Nijmegen CloudFront to identify requests to the Gemachtigd API.
  //  */
  // static readonly cloudFrontOriginHeaderName = 'x-mijn-nijmegen-origin';

  // /**
  //  * Secret used by Mijn Nijmegen CloudFront to authenticate requests to the Gemachtigd API.
  //  */
  // static readonly cloudFrontOriginSecretName = 'mijn-nijmegen-gemachtigd/cloudfront-origin-secret';


  // Mijn Nijmegen Statics

  /**
   * Mijn Nijmegen Cloudfront
   * Nodig om de S3 statics bucket te verbinden van gemachtigd
   */

  static readonly ssmMijnNijmegenCloudFrontDistributionArn = '/cdk/mijn-nijmegen/cloudfront/distribution-arn';
  static readonly ssmMijnNijmegenCloudFrontDistributionId = '/cdk/mijn-nijmegen/cloudfront/distribution-id';
  static readonly ssmMijnNijmegenCloudFrontDomainName = '/cdk/mijn-nijmegen/cloudfront/domain-name';

  /**
   * KMS key used for session table in Mijn Nijmegen
   */


  static readonly ssmMijnNijmegenDataKeyArn: string = '/cdk/mijn-nijmegen/kms-datakey-arn';

  /**
   * OpenID Connect configuration
   */
  static readonly _OIDCClientID: string = '/cdk/mijn-nijmegen/oidc/client-id';
  static readonly _OIDCClientSecret: string = '/cdk/mijn-nijmegen/oidc/clientsecret';
  static readonly _OIDCClientWellKnown: string = '/cdk/mijn-nijmegen/oidc/well-knonw-url';
  static readonly _OIDCClientRedirectUrl: string = '/cdk/mijn-nijmegen/oidc/redirect-url';


  // MARK: API config (mTLS)
  /**
   * Certificate private key for mTLS
   */
  static readonly secretMTLSPrivateKey: string = '/cdk/mijn-nijmegen/mtls-privatekey';

  /**
   * Certificate for mTLS
   */
  static readonly ssmMTLSClientCert: string = '/cdk/mijn-nijmegen/mtls-clientcert';

  /**
    * Root CA for mTLS (PKIO root)
    */
  static readonly ssmMTLSRootCA: string = '/cdk/mijn-nijmegen/mtls-rootca';


  /**
   * URL for the API Gateway for zaken
   * This will be extracted and hosted on a stable domain later
   */
  static readonly ssmZaakAggregatorApiGatewayEndpointUrl: string = '/cdk/mijn-nijmegen/zaken-api-url';

  /**
   * Zaak aggregator API GATEWAY API Key
   */
  static readonly zaakAggregatorApiGatewayApiKey: string = '/cdk/mijn-nijmegen/zaken-api-key';


  static readonly ssmMijnNijmegenZoneId: string = '/cdk/mijn-nijmegen/zones/csp-id';
  static readonly ssmMijnNijmegenZoneName: string = '/cdk/mijn-nijmegen/zones/csp-name';


  // MARK: ZGW configuration

  static readonly ssmOpenZaakUserId: string = '/cdk/mijn-nijmegen/vip-jwt-userid';
  static readonly ssmOpenZaakClientId: string = '/cdk/mijn-nijmegen/vip-jwt-clientid';
  static readonly ssmOpenZaakBaseUrl: string = '/cdk/mijn-nijmegen/vip-base-url';
  static readonly ssmOpenZaakTakenBaseUrl: string = '/cdk/mijn-nijmegen/taken-base-url';

  static readonly ssmOpenKlantSecret = '/cdk/mijn-nijmegen/open-klant/api-key';
  static readonly ssmOpenKlantEndpoint = '/cdk/mijn-nijmegen/open-klant/endpoint';

  // MARK: NOTIFY configuration
  static readonly ssmNotifySecret = '/cdk/mijn-nijmegen/notify/secret';
  static readonly ssmNotifyServiceId = '/cdk/mijn-nijmegen/notify/service-id';
  static readonly ssmNotifyBaseUrl = '/cdk/mijn-nijmegen/notify/base-url';
  static readonly ssmNotifyEmailTemplateId = '/cdk/mijn-nijmegen/notify/email-template-id';
  static readonly ssmNotifySmsTemplateId = '/cdk/mijn-nijmegen/notify/sms-template-id';

  static readonly ssmSubmissionstorageBaseUrl: string = '/cdk/mijn-nijmegen/submissionstorage-base-url';
  /**
   * Secrets for zaken
   */
  static readonly vipJwtSecret: string = '/cdk/mijn-nijmegen/vip-jwttoken-new';
  static readonly vipTakenSecret: string = '/cdk/mijn-nijmegen/vip-takentoken-new';

  static readonly submissionstorageKey: string = '/cdk/mijn-nijmegen/submissionstorage-key';

  // MARK: HaalCentraal configuration
  static readonly ssmHaalCentraalCert = '/cdk/mijn-nijmegen/haal-centraal/cert';
  static readonly ssmHaalCentraalPrivateKey = '/cdk/mijn-nijmegen/haal-centraal/private-key';
  static readonly ssmHaalCentraalApiKey = '/cdk/mijn-nijmegen/haal-centraal/api-key';
  static readonly ssmHaalCentraalBaseUrl = '/cdk/mijn-nijmegen/haal-centraal/base-url';

  // MARK: DEMO producten arc params
  static readonly ssmProductenArcApiKey = '/cdk/mijn-nijmegen/arc/api-key';
  static readonly ssmProductenArcBaseUrl = '/cdk/mijn-nijmegen/arc/base-url';

}
