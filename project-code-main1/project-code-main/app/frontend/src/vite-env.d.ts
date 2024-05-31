/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MOCK: BoolString;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
