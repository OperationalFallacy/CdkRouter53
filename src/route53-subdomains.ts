
import { PublicHostedZone, CrossAccountZoneDelegationRecord } from '@aws-cdk/aws-route53';
import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { Role, CompositePrincipal, AccountPrincipal, ManagedPolicy, Effect, PolicyStatement } from '@aws-cdk/aws-iam'; 

export class stackSettings {
  readonly stacksettings?: {
    readonly environment?: string
  }
}

export class SubdomainsStack extends Stack {
  
  constructor(scope: Construct, id: string, props?: StackProps, stackconfig?: stackSettings) {
    super(scope, id, props);

    // different account
    const subZone = new PublicHostedZone(this, 'SubZone', {
      zoneName: stackconfig?.stacksettings?.environment! + '.naumenko.ca',
      comment: 'Hosted zone for ' + stackconfig?.stacksettings?.environment!
    });
    
    const delegationRole = Role.fromRoleArn(this, 'Role', 'arn:aws:iam::208334959160:role/DnsDelegation');

    new CrossAccountZoneDelegationRecord(this, 'delegate', {
      delegatedZone: subZone,
      parentHostedZoneId: 'Z13DSS2EHP77UM',
      // The delegation role in the parent account
      delegationRole: delegationRole
    });
  }
}

export class DelegationRoleStack extends Stack {
  
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Pipeline can't do lookups, so zone is hardcoded for time being 
    // const zone = PublicHostedZone.fromLookup(this, 'zone', {
    //   domainName: "naumenko.ca"
    // });

    const zone = 'Z13DSS2EHP77UM';

    // This creates policy to allow sub-account make changes in tld
    const dns_policy = new ManagedPolicy(this, 'DnsPolicy', {
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['route53:ChangeResourceRecordSets'],
          resources: ['arn:aws:route53:::hostedzone/' + zone ],
        }),
      ],
    });


    const delegation_role = new Role(this, 'DelegationRole', {
    roleName: 'DnsDelegation',
      assumedBy: new CompositePrincipal(
        new AccountPrincipal('164411640669'),
        new AccountPrincipal('116907314417')
      )
    });

    dns_policy.attachToRole(delegation_role)
    
  }
}