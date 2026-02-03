declare namespace Deno {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
  export namespace env {
    export function get(key: string): string | undefined;
  }
}

// Allow ESM imports from URLs
declare module "https://esm.sh/@supabase/supabase-js@2" {
  import type { SupabaseClient, CreateClientOptions } from "@supabase/supabase-js";
  export function createClient<T = any>(
    supabaseUrl: string,
    supabaseKey: string,
    options?: CreateClientOptions
  ): SupabaseClient<T>;
  export type { SupabaseClient, CreateClientOptions };
}

declare module "https://deno.land/std@*/*/node/crypto.ts" {
  export function createHmac(algorithm: string, key: string | Uint8Array): {
    update(data: string | Uint8Array): this;
    digest(encoding?: string): string;
  };
}

declare module "https://deno.land/std@0.177.0/node/crypto.ts" {
  export function createHmac(algorithm: string, key: string | Uint8Array): {
    update(data: string | Uint8Array): this;
    digest(encoding?: string): string;
  };
}

