/// <reference types="astro/client" />
/// <reference types="@astrojs/cloudflare" />

declare module 'cloudflare:workers' {
  export const env: import('./lib/contact').ContactEnv;
}
