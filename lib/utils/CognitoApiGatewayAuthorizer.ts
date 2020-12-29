import { CfnAuthorizer, CfnAuthorizerProps, IAuthorizer } from "@aws-cdk/aws-apigateway";
import { Construct } from "@aws-cdk/core";

export class CognitoApiGatewayAuthorizer extends CfnAuthorizer implements IAuthorizer {
  public readonly authorizerId: string;

  constructor(scope: Construct, id: string, props: CfnAuthorizerProps) {
    super(scope, id, props);

    this.authorizerId = this.ref;
  }
}
