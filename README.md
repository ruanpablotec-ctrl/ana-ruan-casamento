# Ana & Ruan — site de casamento

Aplicação Next.js 14 + TypeScript, Supabase/PostgreSQL e pronta para deploy na Vercel. O conteúdo é compartilhado por todos os visitantes via banco online; o site não usa armazenamento local como banco de dados. Nenhuma chave PIX, endereço ou foto foi inventada. Os detalhes ainda não fornecidos ficam como “a confirmar” e podem ser preenchidos no painel.

## Rodar localmente

1. Instale Node.js 20 ou superior.
2. Execute `npm install`.
3. Copie `.env.example` para `.env.local` e preencha as variáveis do Supabase.
4. Execute `npm run dev` e abra `http://localhost:3000`.

Sem credenciais Supabase o site público abre com placeholders, mas RSVP, presentes e painel requerem o backend conectado.

## Supabase e banco

1. Crie um projeto em [supabase.com](https://supabase.com/).
2. No SQL Editor, execute todo o arquivo [`supabase/schema.sql`](supabase/schema.sql).
3. Em Project Settings → API, copie Project URL e `anon` public key para `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Copie `service_role` para `SUPABASE_SERVICE_ROLE_KEY`. Essa chave é usada somente em rotas servidoras para buscar convidado e registrar RSVP/presente; nunca a coloque em variável `NEXT_PUBLIC_*`.
5. Configure `NEXT_PUBLIC_SITE_URL` para o endereço de produção (por exemplo `https://anaruan.vercel.app`).

RLS protege as tabelas. Dados de convidados e contribuições não têm leitura pública. O site consulta esses dados apenas no servidor com a chave de serviço após validação; o painel usa sessão autenticada e políticas `is_admin()`.

## Criar o administrador

1. Em Supabase → Authentication → Users, crie o usuário com e-mail e senha.
2. Copie o UUID desse usuário.
3. No SQL Editor, execute `insert into public.admins(user_id) values ('UUID-DO-USUARIO');`.
4. Acesse `/admin/login` e entre com as credenciais. O middleware exige sessão Supabase para `/admin`.

Não há senha padrão nem administrador embutido no código. Para remover um administrador, apague sua linha de `public.admins`.

## Configurar o casamento

No `/admin`, use **Informações do casamento** para nome, data, foto principal e de história, texto, igreja, endereço e horário da cerimônia, local/endereço/horário da recepção, chave PIX, beneficiário, instituição, QR Code e cor de destaque. Para fotos, use URLs públicas https; para produção, carregue-as no Supabase Storage ou em outro armazenamento público confiável e cole a URL. Crie um bucket `wedding-media` no Storage se quiser centralizar as imagens.

No site os horários dos detalhes são editáveis. Use as abas **Programação** e **Galeria** no painel para adicionar, editar e excluir eventos e URLs públicas de fotos. A lista de presentes é criada com seis sugestões simbólicas editáveis pelo painel quando `schema.sql` é executado.

## Convidados e acompanhantes

No painel, adicione uma linha por convidado. Use o mesmo valor em **Grupo/família** para vincular pessoas que devem receber e responder ao convite juntas; o RSVP encontra o nome exato e mostra as pessoas do grupo. Telefone e observações são opcionais. O RSVP só grava `confirmed` ou `declined` para IDs da família retornada por token temporário, e registra `confirmed_at`.

## Presentes e PIX

Cadastre presentes simbólicos em `/admin`, altere preço e disponibilidade e publique. O convidado registra uma intenção de presente; ela permanece **Pendente** até que o administrador confira o pagamento e marque **Recebido**. O site nunca interpreta a escolha como pagamento confirmado. PIX é uma transferência externa: o registro não verifica liquidação automaticamente.

## Deploy na Vercel

1. Coloque este projeto em um repositório Git privado/público sob seu controle.
2. Importe o repositório em [vercel.com](https://vercel.com/) e selecione Next.js.
3. Configure as quatro variáveis do `.env.example` nas Project Settings da Vercel (Preview e Production conforme desejar).
4. Faça deploy. O primeiro endereço será parecido com `anaruan.vercel.app`.
5. Confirme que o usuário administrador está cadastrado no projeto Supabase correto e teste o RSVP em uma janela anônima.

## Domínio próprio

Na Vercel, abra o projeto → Settings → Domains e adicione `anaruan.com.br` e/ou `www.anaruan.com.br`. Configure no provedor DNS os registros que a Vercel indicar (normalmente A para apex e CNAME para `www`), aguarde validação e atualize `NEXT_PUBLIC_SITE_URL` para `https://www.anaruan.com.br`, depois faça novo deploy. A Vercel provisiona HTTPS após validar DNS.

## Estado de produção e limites conhecidos

O projeto está preparado para Supabase e Vercel, mas não está publicado: não foram fornecidos acesso às contas nem credenciais, portanto nenhum banco remoto, usuário admin ou URL pública pôde ser provisionado neste ambiente. A chave `service_role` permite que os endpoints do RSVP/contribuições gravem com privilégio elevado; preserve-a como segredo e considere adicionar CAPTCHA/rate limiting antes de divulgação ampla. Upload de fotos e gerenciamento completo de galeria/programação ainda dependem do Storage/Tables do Supabase; os campos do casamento aceitam URLs públicas.
