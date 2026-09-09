import { HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { LogoutFunction } from '../../app/logout/logout-function';
import { SessionsTable } from '../SessionsTable';
import { applyPageLambdaDefaults, createLambdaLogGroup } from '../shared/PageLambda';

interface LogoutFeatureProps {
  httpApi: HttpApi;
  sessionsTable: SessionsTable;
}

export class LogoutFeature extends Construct {
  constructor(scope: Construct, id: string, props: LogoutFeatureProps) {
    super(scope, id);

    const logoutFunction = new LogoutFunction(this, 'logout-function', {
      description: 'Gemachtigd - logout',
      tracing: Tracing.ACTIVE,
      logGroup: createLambdaLogGroup(this, 'logout-function'),
    });
    applyPageLambdaDefaults(logoutFunction);
    logoutFunction.addEnvironment('SESSION_TABLE', props.sessionsTable.table.tableName);
    props.sessionsTable.table.grantReadWriteData(logoutFunction);

    props.httpApi.addRoutes({
      path: '/gemachtigd/logout',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('integration-logout-function', logoutFunction),
    });
  }
}
