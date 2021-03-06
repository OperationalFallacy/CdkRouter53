const { AwsCdkTypeScriptApp } = require('projen');

const project = new AwsCdkTypeScriptApp({
  name: 'CdkRouter53',
  authorName: 'Roman Naumenko',
  authorAddress: 'roman@naumenko.ca',
  repository: 'https://github.com/OperationalFallacy/CdkRouter53',
  description: 'CDK example to create cross account Route53 delegated zones using native CDK features',
  keywords: ['cdk', 'dns', 'route53'],
  cdkVersion: '1.89.0',
  cdkDependencies: ['@aws-cdk/aws-iam', '@aws-cdk/aws-datapipeline', '@aws-cdk/aws-iam', '@aws-cdk/pipelines', '@aws-cdk/aws-route53', '@aws-cdk/aws-codepipeline-actions', '@aws-cdk/aws-codepipeline'],
  cdkTestDependencies: ['@aws-cdk/assert'],
  devDeps: [ '@types/node' ],
  gitignore: ['__snapshots__', 'LICENSE'],
  rebuildBot: false,
  // Not using this service
  dependabot: false,
  license: 'Apache-2.0',
  // Not using github - however enable it to see example of build workflow for CDK
  buildWorkflow: false,
  mergify: false,
  buildWorkflow: false,
  context: {
    '@aws-cdk/core:newStyleStackSynthesis': true,
    '@aws-cdk/core:enableStackNameDuplicates': true,
    'aws-cdk:enableDiffNoFail': true
  }
});

project.synth();
