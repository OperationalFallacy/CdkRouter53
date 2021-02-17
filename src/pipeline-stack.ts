import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as actions from '@aws-cdk/aws-codepipeline-actions';
import * as cdk from '@aws-cdk/core';
import { CdkPipeline, CdkStage, SimpleSynthAction } from '@aws-cdk/pipelines';
import { SubdomainStage, DelegationRoleStage } from './app-stages';

export interface PipelineStackProps extends cdk.StackProps {
  name: string;
}

export class PipelineStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);
    
    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, 'Pipeline', {
      pipelineName: `${props.name}-DeliveryPipeline`,
      cloudAssemblyArtifact,
      sourceAction: new actions.GitHubSourceAction({
        actionName: 'GitHub',
        output: sourceArtifact,
        oauthToken: cdk.SecretValue.secretsManager('github-token-new'),
        trigger: actions.GitHubTrigger.WEBHOOK,
        owner: 'OperationalFallacy',
        repo: 'CdkRouter53',
        branch: 'feature/initial_commit',
      }),

      synthAction: SimpleSynthAction.standardYarnSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        environment: {
          privileged: true,
        }
      })
    })
    
    new DelegationRoleStage(this, 'prod', {
      env: {
        region: 'us-east-1',
        account: '116907314417'
      }
    }
    );

    const CreateSubDomains = pipeline.addStage('SubDomains');
    const devapp = new SubdomainStage(this, 'dev', {
      env: { 
        region: 'us-east-1',
        account: '164411640669' 
      }
    },
    {
      stacksettings: {
        environment: 'dev'
      }
    });

    const prodapp = new SubdomainStage(this, 'prod', {
      env: { 
        region: 'us-east-1',
        account: '116907314417' 
      }
    },
    {
      stacksettings: {
        environment: 'prod'
      }
    });

    function RunNextActionInParallel(s: CdkStage) {
      let currentRunOrder = s.nextSequentialRunOrder(0)
      s.nextSequentialRunOrder(1-currentRunOrder)
    }

    CreateSubDomains.addApplication(devapp);
    RunNextActionInParallel(CreateSubDomains);
    CreateSubDomains.addApplication(prodapp);
    RunNextActionInParallel(CreateSubDomains);

  }
}
