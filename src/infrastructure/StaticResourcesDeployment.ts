import * as path from 'path';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { MijnNijmegenCloudFrontReference } from './MijnNijmegenCloudFrontReference';

interface StaticResourcesDeploymentProps {
  bucket: Bucket;
  cloudFront: MijnNijmegenCloudFrontReference;
}

export class StaticResourcesDeployment extends Construct {
  constructor(scope: Construct, id: string, props: StaticResourcesDeploymentProps) {
    super(scope, id);

    const distribution = Distribution.fromDistributionAttributes(this, 'mijn-nijmegen-distribution', {
      distributionId: props.cloudFront.distributionId,
      domainName: props.cloudFront.domainName,
    });

    new BucketDeployment(this, 'deployment', {
      sources: [Source.asset(path.join(__dirname, '..', 'app', 'static-resources', 'static'))],
      destinationBucket: props.bucket,
      destinationKeyPrefix: 'gemachtigd/static',
      distribution,
      distributionPaths: ['/gemachtigd/static/*'],
    });
  }
}
