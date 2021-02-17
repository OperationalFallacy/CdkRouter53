
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
      parentHostedZoneId: 'Z00775473R1PDFS2LSXJT',
      // The delegation role in the parent account
      delegationRole: delegationRole
    });
  }
}

export class DelegationRoleStack extends Stack {
  
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const zone = PublicHostedZone.fromLookup(this, 'zone', {
      domainName: "dns.naumenko.ca."
    });

    // This creates a new boundary
    const dns_policy = new ManagedPolicy(this, 'DnsPolicy', {
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['route53:ChangeResourceRecordSets'],
          resources: ['arn:aws:route53:::hostedzone/' + zone.hostedZoneId ],
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