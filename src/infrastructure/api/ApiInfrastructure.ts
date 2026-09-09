import { DomainName, HttpApi } from 'aws-cdk-lib/aws-apigatewayv2';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGatewayv2DomainProperties } from 'aws-cdk-lib/aws-route53-targets';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { Statics } from '../../Statics';


export class ApiInfrastructure extends Construct {
  readonly api: HttpApi;
  readonly originDomainName: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Gebruik bestaande Route53 hostedzone
    const zoneId = StringParameter.valueForStringParameter(this, Statics.ssmMijnNijmegenZoneId);
    const zoneName = StringParameter.valueForStringParameter(this, Statics.ssmMijnNijmegenZoneName);

    const zone = HostedZone.fromHostedZoneAttributes(this, 'mijn-nijmegen-zone', {
      hostedZoneId: zoneId,
      zoneName,
    });

    //  Intern domein voor de gemachtigd api
    this.originDomainName = `${Statics.apiOriginRecordName}.${zoneName}`;

    const certificate = new Certificate(this, 'api-certificate', {
      domainName: this.originDomainName,
      validation: CertificateValidation.fromDns(zone),
    });

    const domainName = new DomainName(this, 'api-domain-name', {
      domainName: this.originDomainName,
      certificate,
    });

    // Http hier ook voldoende, geen RestAPI denk ik, want we hebben al cloudfront
    // Pipeline is nog niet gedeployed, dus we kunnen nu nog gemakkelijk naar rest

    this.api = new HttpApi(this, 'api', {
      description: 'Mijn Nijmegen Gemachtigd API',
      // Standaard url uit
      disableExecuteApiEndpoint: true,
      defaultDomainMapping: {
        domainName,
      },
    });

    // DNS verwijzen naar api
    new ARecord(this, 'api-alias-record', {
      zone,
      recordName: Statics.apiOriginRecordName,
      target: RecordTarget.fromAlias(
        new ApiGatewayv2DomainProperties(
          domainName.regionalDomainName,
          domainName.regionalHostedZoneId,
        ),
      ),
    });

    // Api origin bijv. gemachtigd-api.mijn.mijn-dev.csp-nijmegen.nl
    // Voor Mijn Nijmegen Clpudfront behaviour
    new StringParameter(this, 'CloudFrontOriginDomain', {
      parameterName: Statics.ssmCloudFrontOriginDomain,
      stringValue: this.originDomainName,
    });


    // TODO: kunnen we nog op de api gateway zetten als authorizer. Maar nu misschien overkill.
    // Ook omdat we al overal de sessie controleren.
    // Anders dit secret delen met Mijn Nijmegen cloudfront en iedere keer controleren in
    // Lambda authorizer op de gateway

    // new Secret(this, 'cloud-front-origi-secret', {
    //   secretName: Statics.cloudFrontOriginSecretName,
    //   description: 'Secret used to verify requests from Mijn Nijmegen CloudFront',
    //   generateSecretString: {
    //     passwordLength: 64,
    //     excludePunctuation: true,
    //   },
    // });

  }
}
