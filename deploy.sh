mkdir ./ui/build # As the dir is referenced in infra project, it needs to exist already here

cd infra || exit 1
npm run cdk deploy RecipeBankInfra -- --outputs-file stack-outputs.json --require-approval never || exit 1

REACT_APP_API_BASE_URL=$(jq .RecipeBankInfra.ApiBaseUrl stack-outputs.json -r)
REACT_APP_COGNITO_USER_POOL_ID=$(jq .RecipeBankInfra.CognitoUserPoolId stack-outputs.json -r)
REACT_APP_COGNITO_USER_POOL_CLIENT_ID=$(jq .RecipeBankInfra.CognitoUserPoolClientId stack-outputs.json -r)
REACT_APP_AWS_DEFAULT_REGION="$AWS_DEFAULT_REGION"

export REACT_APP_API_BASE_URL
export REACT_APP_COGNITO_USER_POOL_ID
export REACT_APP_COGNITO_USER_POOL_CLIENT_ID
export REACT_APP_AWS_DEFAULT_REGION

rm stack-outputs.json

cd ../ui || exit 1
yarn install || exit 1
yarn run build || exit 1

cd ../infra || exit 1
npm run cdk deploy RecipeBankStaticWebSite -- --require-approval never || exit 1
