import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/supabase/admin';
const bodySchema = z.object({ name: z.string().trim().min(2).max(100) });
export async function POST(req: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'RSVP ainda não está configurado.' }, { status: 503 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: 'Informe seu nome completo.' }, { status: 400 });
  const db = adminDb(); const needle = parsed.data.name.replace(/[,%()]/g, ' ').trim();
  const { data: guests, error } = await db.from('guests').select('id,name,group_id,group_name,rsvp_status').ilike('name', `%${needle}%`).limit(8);
  if (error) return NextResponse.json({ error: 'Não foi possível buscar seu convite agora.' }, { status: 500 });
  const exact = (guests || []).find(g => g.name.toLocaleLowerCase('pt-BR') === parsed.data.name.toLocaleLowerCase('pt-BR'));
  if (!exact) return NextResponse.json({ error: 'Não encontramos esse nome. Confira a grafia ou fale com os noivos.' }, { status: 404 });
  const { data: group } = exact.group_id
    ? await db.from('guests').select('id,name,rsvp_status').or(`id.eq.${exact.group_id},group_id.eq.${exact.group_id}`).order('name')
    : exact.group_name
      ? await db.from('guests').select('id,name,rsvp_status').eq('group_name', exact.group_name).order('name')
      : await db.from('guests').select('id,name,rsvp_status').eq('id', exact.id);
  const household = group?.length ? group : [exact];
  const token = Buffer.from(JSON.stringify({ ids: household.map(g => g.id), exp: Date.now() + 10 * 60 * 1000 })).toString('base64url');
  return NextResponse.json({ main_name: exact.name, guests: household, token });
}
