import { PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { Statics } from '../Statics';
import { MijnNijmegenCloudFrontReference } from './MijnNijmegenCloudFrontReference';

interface StaticResourcesBucketProps {
  cloudFront: MijnNijmegenCloudFrontReference;
}

export class StaticResourcesBucket extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props: StaticResourcesBucketProps) {
    super(scope, id);

    this.bucket = new Bucket(this, 'statics-bucket-gemachtigd', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
    });

    this.bucket.addToResourcePolicy(new PolicyStatement({
      principals: [new ServicePrincipal('cloudfront.amazonaws.com')],
      actions: ['s3:GetObject'],
      resources: [`${this.bucket.bucketArn}/gemachtigd/static/*`],
      conditions: {
        StringEquals: {
          'AWS:SourceArn': props.cloudFront.distributionArn,
        },
      },
    }));

    /**
         * Mijn Nijmegen uses this param to give cloudfront access
         */
    new StringParameter(this, 'static-bucket-arn-gemachtigd', {
      parameterName: Statics.ssmStaticResourcesBucketArn,
      stringValue: this.bucket.bucketArn,
      description: 'Bucket arn statics gemachtigd',
    });
  }
}