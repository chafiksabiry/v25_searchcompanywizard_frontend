/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_DEPLOYMENT_MODE: any;
    readonly VITE_API_URL: string;
    readonly VITE_QIANKUN: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }