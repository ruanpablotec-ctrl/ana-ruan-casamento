import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/supabase/admin';
const schema = z.object({ token: z.string().min(10).max(2000), answers: z.record(z.enum(['yes', 'no'])) });
export async function POST(req: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'RSVP ainda não está configurado.' }, { status: 503 });
  const parsed = schema.safeParse(await req.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: 'Resposta inválida.' }, { status: 400 });
  try { const payload = JSON.parse(Buffer.from(parsed.data.token, 'base64url').toString()); if (payload.exp < Date.now()) throw new Error(); const allowed = new Set<string>(payload.ids); if (Object.keys(parsed.data.answers).length !== allowed.size || Object.keys(parsed.data.answers).some(id => !allowed.has(id))) throw new Error();
    const db = adminDb(); const result = await Promise.all(Object.entries(parsed.data.answers).map(([id, answer]) => db.from('guests').update({ rsvp_status: answer === 'yes' ? 'confirmed' : 'declined', confirmed_at: new Date().toISOString() }).eq('id', id)));
    if (result.some(r => r.error)) throw new Error(); return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Convite expirado ou resposta inválida. Busque seu convite novamente.' }, { status: 400 }); }
}
