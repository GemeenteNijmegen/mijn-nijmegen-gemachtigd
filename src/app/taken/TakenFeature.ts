import { HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { SessionsTable } from '../../infrastructure/SessionsTable';
import { applyPageLambdaDefaults, createLambdaLogGroup } from '../../infrastructure/shared/PageLambda';
import { Statics } from '../../Statics';
import { TakenFunction } from './taken-function';

interface TakenFeatureProps {
  httpApi: HttpApi;
  sessionsTable: SessionsTable;
}

export class TakenFeature extends Construct {
  constructor(scope: Construct, id: string, props: TakenFeatureProps) {
    super(scope, id);

    const takenFunction = new TakenFunction(this, 'taken-function', {
      description: 'Gemachtigd - takenpagina',
      tracing: Tracing.ACTIVE,
      logGroup: createLambdaLogGroup(this, 'taken-function'),
    });
    applyPageLambdaDefaults(takenFunction);
    takenFunction.addEnvironment('SESSION_TABLE', props.sessionsTable.table.tableName);
    takenFunction.addEnvironment('ZAKEN_APIGATEWAY_BASEURL', StringParameter.valueForStringParameter(this, Statics.ssmZaakAggregatorApiGatewayEndpointUrl));

    const zakenApiKey = Secret.fromSecretNameV2(this, 'zakenapikey', Statics.zaakAggregatorApiGatewayApiKey);
    zakenApiKey.grantRead(takenFunction);
    takenFunction.addEnvironment('ZAKEN_APIGATEWAY_APIKEY', zakenApiKey.secretArn);

    props.sessionsTable.table.grantReadData(takenFunction);

    props.httpApi.addRoutes({
      path: Statics.basePath + '/taken',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('integration-taken-function', takenFunction),
    });
  }
}
