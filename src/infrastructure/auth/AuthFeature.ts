import { HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { AuthFunction } from '../../app/auth/auth-function';
import { VERID_CONFIG_ENV_VAR, VERID_SECRET_ARN_ENV_VAR } from '../../app/auth/verid/VerIdConfiguration';
import { LoginFunction } from '../../app/login/login-function';
import { Statics } from '../../Statics';
import { SessionsTable } from '../SessionsTable';
import { applyPageLambdaDefaults, createLambdaLogGroup } from '../shared/PageLambda';
import { Duration } from 'aws-cdk-lib';

interface AuthFeatureProps {
  httpApi: HttpApi;
  sessionsTable: SessionsTable;
}

/**
 * SSM-config en secret worden hier alleen gelezen. Ze worden aangemaakt in ParameterStack, die in de
 * pipeline voor deze stage draait.
 */
export class AuthFeature extends Construct {
  constructor(scope: Construct, id: string, props: AuthFeatureProps) {
    super(scope, id);

    const verIdConfigJson = StringParameter.valueForStringParameter(this, Statics.ssmVerIdDisclosureConfig);
    const verIdSecret = Secret.fromSecretNameV2(this, 'verid-secret', Statics.veridDisclosureCredentialsSecretName);

    const loginFunction = new LoginFunction(this, 'login-function', {
      description: 'Gemachtigd - start de Ver.ID disclosure login',
      timeout: Duration.seconds(6),
      tracing: Tracing.ACTIVE,
      logGroup: createLambdaLogGroup(this, 'login-function'),
    });
    applyPageLambdaDefaults(loginFunction);
    loginFunction.addEnvironment(VERID_CONFIG_ENV_VAR, verIdConfigJson);
    loginFunction.addEnvironment('SESSION_TABLE', props.sessionsTable.table.tableName);
    // login gebruikt de tabel alleen voor de verid cache state/PKCE, geen sessies.
    props.sessionsTable.table.grantReadWriteData(loginFunction);

    const authFunction = new AuthFunction(this, 'auth-function', {
      description: 'Gemachtigd - Ver.ID disclosure callback',
      timeout: Duration.seconds(10),
      tracing: Tracing.ACTIVE,
      logGroup: createLambdaLogGroup(this, 'auth-function'),
    });
    applyPageLambdaDefaults(authFunction);
    authFunction.addEnvironment(VERID_CONFIG_ENV_VAR, verIdConfigJson);
    authFunction.addEnvironment(VERID_SECRET_ARN_ENV_VAR, verIdSecret.secretArn);
    authFunction.addEnvironment('SESSION_TABLE', props.sessionsTable.table.tableName);
    props.sessionsTable.table.grantReadWriteData(authFunction);
    // alleen de callback (dus auth) mag het client secret lezen, login heeft dat nooit nodig.
    verIdSecret.grantRead(authFunction);

    props.httpApi.addRoutes({
      path: '/gemachtigd/login',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('integration-login-function', loginFunction),
    });
    props.httpApi.addRoutes({
      path: '/gemachtigd/auth/verid/callback',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('integration-auth-function', authFunction),
    });
  }
}
