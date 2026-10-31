import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
const tables = ['guests','gifts','event_schedule','gallery'];
export async function GET(req: Request) { const db=createClient(); const {data:{user}}=await db.auth.getUser(); const table=new URL(req.url).searchParams.get('table'); if(!user||!table||!tables.includes(table)) return NextResponse.json({error:'Unauthorized'},{status:401}); const {data,error}=await db.from(table).select('*').order('sort_order',{ascending:true}); return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({data}); }
