export type StudioToteAssetMap = Readonly<Record<string, string>>;

export const resolveStudioToteAsset = (
  name: string,
  baseUrl: string,
  overrides?: StudioToteAssetMap,
): string => overrides?.[name] ?? `${baseUrl}${name}`;
