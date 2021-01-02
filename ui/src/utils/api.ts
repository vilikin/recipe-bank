import { Auth } from "aws-amplify";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface Image {
  size: string;
  url: string;
}

interface Recipe {
  name: string;
  url?: string;
  images?: Image[];
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
