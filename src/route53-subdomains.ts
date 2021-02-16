
import { PublicHostedZone, CrossAccountZoneDelegationRecord } from '@aws-cdk/aws-route53';
import { AccountPrincipal } from '@aws-cdk/aws-iam';
import { Stack, Construct, StackProps } from '@aws-cdk/core';

export class stackSettings {
  readonly stacksettings?: {
    readonly environment?: string
  }
}

export class SubdomainsStack extends Stack {
  
  constructor(scope: Construct, id: string, props?: StackProps, stackconfig?: stackSettings) {
    super(scope, id, props);

    const zone = PublicHostedZone.fromLookup(this, 'zone', {
      domainName: "naumenko.ca"
    });

    // In the account containing the HostedZone
    const parentZone = new PublicHostedZone(this, 'HostedZone', {
      zoneName: zone.zoneName,
      // A principal which is trusted to assume a role for zone delegation
      crossAccountZoneDelegationPrincipal: new AccountPrincipal('116907314417'),
      comment: 'Parent zone for ' + zone.zoneName
    });

    const subZone = new PublicHostedZone(this, 'SubZone', {
      zoneName: stackconfig?.stacksettings?.environment! + '.naumenko.ca',
      comment: 'Hosted zone for ' + stackconfig?.stacksettings?.environment!
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
