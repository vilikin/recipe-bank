import * as cdk from "@aws-cdk/core";
import { CfnOutput, Duration } from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { AttributeType } from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda-nodejs";
import * as apigateway from "@aws-cdk/aws-apigateway";
import { AuthorizationType, Cors } from "@aws-cdk/aws-apigateway";
import * as cognito from "@aws-cdk/aws-cognito";
import { AccountRecovery } from "@aws-cdk/aws-cognito";
import * as s3 from "@aws-cdk/aws-s3";
import { HttpMethods } from "@aws-cdk/aws-s3";
import { CognitoApiGatewayAuthorizer } from "./utils/CognitoApiGatewayAuthorizer";
import { S3EventSource } from "@aws-cdk/aws-lambda-event-sources";
import { BUCKET_FOR_RAW_UPLOADED_IMAGES, BUCKET_FOR_RESIZED_IMAGES } from "./constants";

export class InfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: "RecipeBankUsers",
      selfSignUpEnabled: true,
      passwordPolicy: {
        requireSymbols: false,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      autoVerify: {
        email: true,
        phone: false,
      },
    });

    const userPoolClient = userPool.addClient("UserPoolClient", {
      userPoolClientName: "RecipeBankApp",
    });

    const recipesTable = new dynamodb.Table(this, "RecipesTable", {
      tableName: "recipes",
      partitionKey: {
        name: "uuid",
        type: AttributeType.STRING,
      },
    });

    const rawImagesBucket = new s3.Bucket(this, "ImagesBucket", {
      bucketName: BUCKET_FOR_RAW_UPLOADED_IMAGES,
      cors: [
        {
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          allowedMethods: [HttpMethods.PUT],
        },
      ],
    });

    const resizedImagesBucket = new s3.Bucket(this, "ResizedImagesBucket", {
      bucketName: BUCKET_FOR_RESIZED_IMAGES,
      cors: [
        {
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          allowedMethods: [HttpMethods.GET],
        },
      ],
    });

    const addRecipeHandler = new lambda.NodejsFunction(this, "AddRecipeHandler");
    recipesTable.grantWriteData(addRecipeHandler);

    const listRecipesHandler = new lambda.NodejsFunction(this, "ListRecipesHandler");
    recipesTable.grantReadData(listRecipesHandler);
    resizedImagesBucket.grantRead(listRecipesHandler);

    const getPreSignedUploadUrlHandler = new lambda.NodejsFunction(
      this,
      "GetPreSignedUploadUrlHandler"
    );

    rawImagesBucket.grantWrite(getPreSignedUploadUrlHandler);

    const processUploadedImagesHandler = new lambda.NodejsFunction(
      this,
      "ProcessUploadedImagesHandler",
      {
        memorySize: 512,
        timeout: Duration.minutes(1),
        bundling: {
          nodeModules: ["sharp"],
        },
      }
    );

    processUploadedImagesHandler.addEventSource(
      new S3EventSource(rawImagesBucket, {
        events: [s3.EventType.OBJECT_CREATED],
      })
    );

    rawImagesBucket.grantDelete(processUploadedImagesHandler);
    rawImagesBucket.grantRead(processUploadedImagesHandler);
    resizedImagesBucket.grantPut(processUploadedImagesHandler);

    const api = new apigateway.RestApi(this, "Api", {
      restApiName: "RecipeBankApi",
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },
    });

    const cognitoAuthorizer = new CognitoApiGatewayAuthorizer(this, "CognitoAuthorizer", {
      name: "CognitoAuthorizer",
      type: AuthorizationType.COGNITO,
      providerArns: [userPool.userPoolArn],
      identitySource: "method.request.header.Authorization",
      restApiId: api.restApiId,
    });

    const authorizerProps = {
      authorizer: cognitoAuthorizer,
      authorizationType: AuthorizationType.COGNITO,
    };

    const recipesResource = api.root.addResource("recipes");

    recipesResource.addMethod("POST", new apigateway.LambdaIntegration(addRecipeHandler), {
      ...authorizerProps,
    });

    recipesResource.addMethod("GET", new apigateway.LambdaIntegration(listRecipesHandler), {
      ...authorizerProps,
    });

    const actionsResource = api.root.addResource("actions");
    const getPreSignedUploadUrlResource = actionsResource.addResource("get-pre-signed-upload-url");

    getPreSignedUploadUrlResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(getPreSignedUploadUrlHandler),
      {
        ...authorizerProps,
      }
    );

    new CfnOutput(this, "CognitoUserPoolId", {
      value: userPool.userPoolId,
    });

    new CfnOutput(this, "CognitoUserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });

    new CfnOutput(this, "ApiBaseUrl", {
      value: api.deploymentStage.urlForPath(),
    });
  }
}
