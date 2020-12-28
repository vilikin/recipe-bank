import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { AttributeType } from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda-nodejs";
import * as apigateway from "@aws-cdk/aws-apigateway";
import { AuthorizationType } from "@aws-cdk/aws-apigateway";
import * as cognito from "@aws-cdk/aws-cognito";
import { CognitoApiGatewayAuthorizer } from "./CognitoApiGatewayAuthorizer";

export class RecipeBankStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: "RecipeBankUsers",
    });

    const userPoolClient = userPool.addClient("UserPoolClient", {
      userPoolClientName: "RecipeBankApp",
    });

    const table = new dynamodb.Table(this, "RecipesTable", {
      tableName: "recipes",
      partitionKey: {
        name: "uuid",
        type: AttributeType.STRING,
      },
    });

    const addRecipeHandler = new lambda.NodejsFunction(this, "AddRecipeHandler");
    table.grantWriteData(addRecipeHandler);

    const listRecipesHandler = new lambda.NodejsFunction(this, "ListRecipesHandler");
    table.grantReadData(listRecipesHandler);

    const api = new apigateway.RestApi(this, "Api", {
      restApiName: "RecipeBankApi",
    });

    const cognitoAuthorizer = new CognitoApiGatewayAuthorizer(this, "CognitoAuthorizer", {
      name: "CognitoAuthorizer",
      type: AuthorizationType.COGNITO,
      providerArns: [userPool.userPoolArn],
      identitySource: "method.request.header.Authorization",
      restApiId: api.restApiId,
    });

    const recipesResource = api.root.addResource("recipes", {
      defaultMethodOptions: {
        authorizer: cognitoAuthorizer,
        authorizationType: AuthorizationType.COGNITO,
      },
    });

    recipesResource.addMethod("POST", new apigateway.LambdaIntegration(addRecipeHandler));
    recipesResource.addMethod("GET", new apigateway.LambdaIntegration(listRecipesHandler));
  }
}
