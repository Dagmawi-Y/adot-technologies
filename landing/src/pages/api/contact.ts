import type { APIRoute } from 'astro';
import { env } from 'node:process';
import { handleContact, type ContactEnv } from '@/lib/contact';
export const prerender = false;
export const POST: APIRoute = ({ request }) => handleContact(request, env as ContactEnv);
export const ALL: APIRoute = ({ request }) => handleContact(request, env as ContactEnv);
