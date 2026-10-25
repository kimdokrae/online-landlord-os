import type { NextConfig } from "next";
const publicMode=process.env.APP_MODE==='public-demo';
const config: NextConfig = { devIndicators: false, poweredByHeader: false,
  distDir:publicMode?'.next-public':process.env.APP_MODE==='local-template'?'.next-local':'.next',
  async headers(){return publicMode?[{source:'/:path*',headers:[
    {key:'Content-Security-Policy',value:"default-src 'self'; connect-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; script-src 'self' 'unsafe-inline'"+(process.env.NODE_ENV==='development'?" 'unsafe-eval'":"")+"; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"},
    {key:'X-Public-Demo',value:'v1'},
  ]}]:[];},
};
export default config;
