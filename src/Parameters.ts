import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Aspects, Stack, Stage, StageProps, Tags } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { Statics } from './Statics';

export interface ParameterStageProps extends StageProps, Configurable { }

/**
 * Stage for creating SSM parameters. This needs to run
 * before stages that use them.
 */
export class ParameterStage extends Stage {
  constructor(scope: Construct, id: string, props: ParameterStageProps) {
    super(scope, id, props);
    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);
    Aspects.of(this).add(new PermissionsBoundaryAspect());
    new ParameterStack(this, 'stack');
  }
}

/**
 * Stack that creates ssm parameters for the application.
 * These need to be present before stacks that use them.
 */
export class ParameterStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    /**
     * Niet-geheime VerID disclosure config. issuerUri/clientId/redirectUri zijn hier placeholders,
     * vervang die door de echte waarden uit VerID Studio in deze code (niet handmatig in SSM aanpassen,
     * dat wordt bij de volgende deploy weer overschreven met wat hier staat).
     */
    new StringParameter(this, 'verid-disclosure-config', {
      parameterName: Statics.ssmVerIdDisclosureConfig,
      stringValue: JSON.stringify({
        issuerUri: 'https://replace-me.verid.example',
        clientId: 'replace-me',
        redirectUri: 'https://replace-me.example/gemachtigd/auth/verid/callback',
      }),
      description: 'Ver.ID disclosure config (issuerUri/clientId/redirectUri) voor deze omgeving.',
    });

    /**
     * Client secret voor de verid disclosure flow. Placeholder waarde bij aanmaak, na deploy handmatig
     * vervangen door de echte waarde uit Ver.id Studio.
     */
    new Secret(this, 'verid-disclosure-secret', {
      secretName: Statics.veridDisclosureCredentialsSecretName,
      description: 'Client secret voor de Ver.ID disclosure flow.',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ clientSecret: '' }),
        generateStringKey: 'clientSecret',
      },
    });
  }
}
