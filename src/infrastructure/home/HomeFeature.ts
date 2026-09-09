import { HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { HomeFunction } from '../../app/home/home-function';
import { SessionsTable } from '../SessionsTable';
import { applyPageLambdaDefaults, createLambdaLogGroup } from '../shared/PageLambda';

interface HomeFeatureProps {
  httpApi: HttpApi;
  sessionsTable: SessionsTable;
}

export class HomeFeature extends Construct {
  constructor(scope: Construct, id: string, props: HomeFeatureProps) {
    super(scope, id);

    const homeFunction = new HomeFunction(this, 'home-function', {
      description: 'Gemachtigd - homepagina',
      tracing: Tracing.ACTIVE,
      logGroup: createLambdaLogGroup(this, 'home-function'),
    });
    applyPageLambdaDefaults(homeFunction);
    homeFunction.addEnvironment('SESSION_TABLE', props.sessionsTable.table.tableName);
    props.sessionsTable.table.grantReadData(homeFunction);

    props.httpApi.addRoutes({
      path: '/gemachtigd/home',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('integration-home-function', homeFunction),
    });
  }
}
