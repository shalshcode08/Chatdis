import { treaty } from "@elysiajs/eden";
import type { App } from "@/app/api/[[...slugs]]/route";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000");

export const client = treaty<App>(apiBaseUrl).api;
