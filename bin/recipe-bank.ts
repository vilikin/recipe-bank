#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { RecipeBankStack } from "../lib/recipe-bank-stack";

const app = new cdk.App();
new RecipeBankStack(app, "RecipeBankStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
