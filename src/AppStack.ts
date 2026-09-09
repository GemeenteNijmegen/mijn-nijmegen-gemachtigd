import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiInfrastructure } from './api/ApiInfrastructure';
import { Configurable } from './Configuration';
import { getMijnNijmegenCloudFront } from './infrastructure/MijnNijmegenCloudFrontReference';
import { StaticResourcesBucket } from './infrastructure/StaticResourcesBucket';

interface AppStackProps extends StackProps, Configurable { }

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, private readonly props: AppStackProps) {
    super(scope, id, props);

    new ApiInfrastructure(this, 'api-infrastructure');

    const cloudFront = getMijnNijmegenCloudFront(this);
    new StaticResourcesBucket(this, 'static-resources', { cloudFront });
  }
}
