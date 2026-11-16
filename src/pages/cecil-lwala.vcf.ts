import { vcard } from '../content/vcard';

export const GET = () =>
  new Response(vcard(), { headers: { 'Content-Type': 'text/vcard; charset=utf-8' } });
