## Rifa Aí

Aplicação de rifas com frontend em Next.js e backend em FastAPI + SQLite, integrada ao Stripe Checkout.

### Requisitos
- Node.js 18+ e npm
- Python 3.11+
- Conta no Stripe (obtenha uma secret key)

### Estrutura
- `app/`: Next.js (rotas, componentes e API routes)
- `api/`: FastAPI (API e banco de dados)
- `rifa.db`: banco SQLite (ignorado pelo git)

### Variáveis de ambiente
Crie o arquivo `.env.local` na raiz do projeto para o Next.js:

```bash
STRIPE_SECRET_KEY=sk_live_... # sua Secret Key do Stripe
# Opcional: usado para montar as URLs de retorno do checkout em dev/prod
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Observação: Nunca commit suas chaves. O `.gitignore` já evita subir o `.env.local`.

### Instalação
Frontend (Next.js):
```bash
npm install
```

Backend (FastAPI):
```bash
python -m venv api/.venv
source api/.venv/bin/activate
pip install -r api/requirements.txt
```

### Executando localmente
Terminal 1 (backend):
```bash
source api/.venv/bin/activate
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

Terminal 2 (frontend):
```bash
npm run dev
```

Aplicação: `http://localhost:3000`  
API FastAPI: `http://localhost:8000`

### Pagamentos (Stripe Checkout)
- A rota `POST /api/checkout` cria uma sessão de Checkout no Stripe e redireciona o usuário.
- Páginas de retorno:
  - Sucesso: `/success`
  - Cancelamento: `/cancel`
- O formulário `components/purchase-form.tsx` envia os dados para `/api/checkout`.

Importante: A confirmação de compra e marcação dos números como vendidos deve acontecer após a confirmação do pagamento (webhook do Stripe). Próximo passo sugerido:
1. Criar um webhook do Stripe (evento `checkout.session.completed` ou `payment_intent.succeeded`).
2. No webhook, validar o evento com a assinatura do Stripe.
3. Ao confirmar, chamar o backend (FastAPI) para registrar a compra (`/api/purchase`) e marcar os números como vendidos.

### Deploy
#### Frontend (Vercel)
1. Conecte seu repositório GitHub à Vercel.
2. Defina variáveis de ambiente no projeto Vercel:
   - `STRIPE_SECRET_KEY` (Production e Preview)
   - `NEXT_PUBLIC_APP_URL` (ex.: `https://seu-dominio.vercel.app`)
3. Deploy pela Vercel.

#### Backend (Render/Railway/Fly/EC2…)
1. Suba o serviço FastAPI (por exemplo, Render.com):
   - Start command: `uvicorn api.main:app --host 0.0.0.0 --port 8000`
   - Defina `DATABASE_URL` se quiser trocar de SQLite para Postgres.
   - Habilite CORS (já liberado no código).
2. Aponte o webhook do Stripe para uma rota pública (Next.js ou FastAPI).

#### Webhook do Stripe (sugestão)
- Opção A (Next.js): criar `app/api/stripe/webhook/route.ts` que valida o evento e chama o FastAPI.
- Opção B (FastAPI): criar `/api/stripe/webhook` e processar diretamente no backend Python.

### Scripts úteis
```bash
# Next.js
npm run dev       # desenvolvimento
npm run build     # build de produção
npm run start     # executar build localmente
```

### Notas
- Os dados de rifas e compras no backend Python usam SQLite por padrão. Para produção, use Postgres (defina `DATABASE_URL`). 
- As rotas em `app/api/*` que simulavam dados in-memory foram mantidas para exemplo; o fluxo de checkout usa `app/api/checkout`.


