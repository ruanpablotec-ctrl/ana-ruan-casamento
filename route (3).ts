import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/supabase/admin';
const schema = z.object({ gift_id: z.string().uuid().nullable(), gift_name: z.string().trim().min(2).max(120), amount: z.number().positive().max(100000), contributor_name: z.string().trim().min(2).max(100) });
export async function POST(req: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Presentes ainda não estão configurados.' }, { status: 503 });
  const parsed = schema.safeParse(await req.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: 'Confira nome e valor do presente.' }, { status: 400 });
  const { error } = await adminDb().from('contributions').insert({ ...parsed.data, status: 'pending' });
  return error ? NextResponse.json({ error: 'Não foi possível registrar o presente.' }, { status: 500 }) : NextResponse.json({ ok: true }, { status: 201 });
}
