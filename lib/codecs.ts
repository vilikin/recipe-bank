import { Codec, GetType, optional, string } from "purify-ts/Codec";

export const RecipeCodec = Codec.interface({
  uuid: string,
  name: string,
  url: optional(string),
});

export type Recipe = GetType<typeof RecipeCodec>;
