
import { Construct, Stage, StageProps } from '@aws-cdk/core';
import { SubdomainsStack, stackSettings } from './route53-subdomains';

export class SubdomainStage extends Stage {
  constructor(scope: Construct, id: string, props: StageProps, stackconfig: stackSettings) {
    super(scope, id, props);

    new SubdomainsStack(this, 'naumenko-ca', {
      env: {
        region : 'us-east-1'
      }
    },
    stackconfig);
  }
}