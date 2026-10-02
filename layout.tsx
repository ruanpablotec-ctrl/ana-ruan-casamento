import type { Metadata } from 'next';
import './globals.css';
const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://anaruan.vercel.app';
export const metadata: Metadata = { metadataBase: new URL(url), title: 'Ana & Ruan — 10 de julho de 2027', description: 'Com alegria, convidamos você para celebrar o casamento de Ana & Ruan.', openGraph: { title: 'Ana & Ruan | 10 de julho de 2027', description: 'Uma data especial, feita para celebrar o amor. Confira os detalhes e confirme sua presença.', images: ['/og-wedding.svg'], type: 'website' }, icons: { icon: '/favicon.svg' } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
