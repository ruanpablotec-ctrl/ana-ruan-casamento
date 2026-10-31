import Wedding from '@/components/Wedding';
export const dynamic = 'force-dynamic';
export default async function Home() {
  let wedding: any = null; let gifts: any[] = []; let schedule: any[] = []; let gallery: any[] = [];
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const { createClient } = await import('@/lib/supabase/server'); const db = createClient();
    const [w, g, s, p] = await Promise.all([db.from('weddings').select('*').limit(1).maybeSingle(), db.from('gifts').select('*').eq('active', true).order('sort_order'), db.from('event_schedule').select('*').order('sort_order'), db.from('gallery').select('*').order('sort_order')]);
    wedding = w.data; gifts = g.data || []; schedule = s.data || []; gallery = p.data || [];
  }
  return <Wedding wedding={wedding} gifts={gifts} schedule={schedule} gallery={gallery}/>;
}
