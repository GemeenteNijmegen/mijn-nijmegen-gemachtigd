import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { Statics } from '../Statics';

export interface MijnNijmegenCloudFrontReference {
  distributionArn: string;
  distributionId: string;
  domainName: string;
}

export function getMijnNijmegenCloudFront(scope: Construct): MijnNijmegenCloudFrontReference {
  return {
    distributionArn: StringParameter.valueForStringParameter(scope, Statics.ssmMijnNijmegenCloudFrontDistributionArn),
    distributionId: StringParameter.valueForStringParameter(scope, Statics.ssmMijnNijmegenCloudFrontDistributionId),
    domainName: StringParameter.valueForStringParameter(scope, Statics.ssmMijnNijmegenCloudFrontDomainName),
  };
}