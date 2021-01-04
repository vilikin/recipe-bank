import { Auth } from "aws-amplify";
import {
  AddRecipePayload,
  Recipe,
} from "../../../infra/src/lambdas/common/codecs";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface GetPreSignedUploadUrlResponse {
  uuid: string;
  signedUrl: string;
}

async function getIdToken(): Promise<string> {
  const session = await Auth.currentSession();
  return session.getIdToken().getJwtToken();
}

export async function listRecipes(): Promise<Recipe[]> {
  const token = await getIdToken();
  const request = new Request(`${API_BASE_URL}recipes`, {
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${token}`,
    }),
  });

  return await fetch(request).then((r) => r.json());
}

export async function addRecipe(
  addRecipePayload: AddRecipePayload
): Promise<void> {
  const token = await getIdToken();

  const request = new Request(`${API_BASE_URL}recipes`, {
    method: "POST",
    headers: new Headers({
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(addRecipePayload),
  });

  await fetch(request);
}

export async function uploadImage(file: File): Promise<string> {
  const token = await getIdToken();

  console.log("Retrieving pre signed upload url for image");
  const getPreSignedUploadUrlRequest = new Request(
    `${API_BASE_URL}actions/get-pre-signed-upload-url`,
    {
      method: "POST",
      body: JSON.stringify({
        contentType: file.type,
      }),
      headers: new Headers({
        Authorization: `Bearer ${token}`,
      }),
    }
  );

  const { uuid, signedUrl }: GetPreSignedUploadUrlResponse = await fetch(
    getPreSignedUploadUrlRequest
  ).then((r) => r.json());

  console.log(`Initiating upload for image uuid ${uuid}`);

  const uploadRequest = new Request(signedUrl, {
    method: "PUT",
    headers: new Headers({
      "Content-Type": file.type,
    }),
    body: file,
  });

  await fetch(uploadRequest);
  console.log("Image upload complete");

  return uuid;
}
