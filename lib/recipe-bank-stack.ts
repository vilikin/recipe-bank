import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { AttributeType } from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda-nodejs";
import * as apigateway from "@aws-cdk/aws-apigateway";

export class RecipeBankStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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

    const apiKey = new apigateway.ApiKey(this, "DefaultApiKey", {
      apiKeyName: "RecipeBankDefaultApiKey",
    });

    new apigateway.UsagePlan(this, "DefaultUsagePlan", {
      name: "RecipeBankDefaultUsagePlan",
      apiKey,
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        },
      ],
    });

    const recipesResource = api.root.addResource("recipes", {
      defaultMethodOptions: {
        apiKeyRequired: true,
      },
    });

    recipesResource.addMethod("POST", new apigateway.LambdaIntegration(addRecipeHandler));
    recipesResource.addMethod("GET", new apigateway.LambdaIntegration(listRecipesHandler));
  }
}
