import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuthFeature } from './app/auth/AuthFeature';
import { HomeFeature } from './app/home/HomeFeature';
import { LogoutFeature } from './app/logout/LogoutFeature';
import { Configurable } from './Configuration';
import { ApiInfrastructure } from './infrastructure/api/ApiInfrastructure';
import { getMijnNijmegenCloudFront } from './infrastructure/MijnNijmegenCloudFrontReference';
import { SessionsTable } from './infrastructure/SessionsTable';
import { StaticResourcesBucket } from './infrastructure/StaticResourcesBucket';
import { StaticResourcesDeployment } from './infrastructure/StaticResourcesDeployment';

interface AppStackProps extends StackProps, Configurable { }

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, private readonly props: AppStackProps) {
    super(scope, id, props);

    const api = new ApiInfrastructure(this, 'api-infrastructure');
    const sessionsTable = new SessionsTable(this, 'sessions-table');
    new AuthFeature(this, 'auth-feature', { httpApi: api.api, sessionsTable });
    new HomeFeature(this, 'home-feature', { httpApi: api.api, sessionsTable });
    new LogoutFeature(this, 'logout-feature', { httpApi: api.api, sessionsTable });

    const cloudFront = getMijnNijmegenCloudFront(this);
    const statics = new StaticResourcesBucket(this, 'static-resources', { cloudFront });
    new StaticResourcesDeployment(this, 'static-resources-deployment', { bucket: statics.bucket, cloudFront });
  }
}
