#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { InfraStack } from "../lib/infra-stack";
import { StaticWebSiteStack } from "../lib/static-web-site-stack";

const app = new cdk.App();

new InfraStack(app, "RecipeBankInfra", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new StaticWebSiteStack(app, "RecipeBankStaticWebSite", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
