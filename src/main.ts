import * as cdk from '@aws-cdk/core';
import { PipelineStack } from '../src/pipeline-stack';

const app = new cdk.App();

new PipelineStack(app, 'Route53-Pipeline', {
  name: 'Route53',
  env: {
    account: '138847631892',
    region: 'us-east-1',
  },
});