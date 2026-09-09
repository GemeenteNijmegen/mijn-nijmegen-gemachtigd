import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Aspects, Stage, StageProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppStack as AppStack } from './AppStack';
import { Configurable } from './Configuration';
import { Statics } from './Statics';

interface MainStageProps extends StageProps, Configurable { }

/**
 * Main cdk app stage
 */
export class AppStage extends Stage {

  constructor(scope: Construct, id: string, props: MainStageProps) {
    super(scope, id, props);
    Tags.of(this).add('Project', Statics.projectName);
    Aspects.of(this).add(new PermissionsBoundaryAspect());

    /**
     * Main stack of this project
     * TODO you probably want to rename this stack
     */
    new AppStack(this, 'app-stack', { // Translates to mijn-services-stack
      env: props.configuration.deploymentEnvironment,
      configuration: props.configuration,
    });

  }

}