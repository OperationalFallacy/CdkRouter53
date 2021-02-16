
import { PublicHostedZone, CrossAccountZoneDelegationRecord } from '@aws-cdk/aws-route53';
import { AccountPrincipal } from '@aws-cdk/aws-iam';
import { Stack, Construct, StackProps } from '@aws-cdk/core';

export class DelegationStack extends Stack {
  
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // In the account containing the HostedZone
    const parentZone = new PublicHostedZone(this, 'HostedZone', {
      zoneName: 'naumenko.ca',
      // A principal which is trusted to assume a role for zone delegation
      crossAccountZoneDelegationPrincipal: new AccountPrincipal('116907314417')
    });

    const subZone = new PublicHostedZone(this, 'SubZone', {
      zoneName: 'sub.naumenko.ca'
    });
    
    if (parentZone.crossAccountZoneDelegationRole) {
      new CrossAccountZoneDelegationRecord(this, 'delegate', {
        delegatedZone: subZone,
        parentHostedZoneId: parentZone.hostedZoneId,
        // The delegation role in the parent account
        delegationRole: parentZone.crossAccountZoneDelegationRole
      });
    }
  }
}
