
import { Construct, Stage, StageProps } from '@aws-cdk/core';
import { SubdomainsStack, DelegationRoleStack, stackSettings } from './route53-subdomains';

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

export class DelegationRoleStage extends Stage {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    new DelegationRoleStack(this, 'dns-naumenko-ca', {
      env: {
        region : 'us-east-1'
      }
    });
  }
}