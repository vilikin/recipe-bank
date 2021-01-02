import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deployment from "@aws-cdk/aws-s3-deployment";

export class StaticWebSiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "StaticWebSiteBucket", {
      bucketName: "recipe-bank-static-web-site",
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
    });

    new s3deployment.BucketDeployment(this, "StaticWebSiteDeployment", {
      sources: [s3deployment.Source.asset("../ui/build")],
      destinationBucket: bucket,
    });
  }
}
