# Sistema de Avaliação de Performance

Este projeto é uma plataforma completa para avaliação de performance de colaboradores, líderes e equipes, permitindo o acompanhamento de ciclos de avaliação, autoavaliações, avaliações 360°, gestão de critérios, trilhas de desenvolvimento, OKRs, PDIs e pesquisas de clima organizacional. O sistema foi desenvolvido para facilitar processos de RH, gestão e comitês, promovendo evolução contínua e transparência.

## Principais Ferramentas Utilizadas

- **Backend:**
  - [NestJS](https://nestjs.com/) (Node.js)
  - [Prisma ORM](https://www.prisma.io/) (SQLite)
  - [bcrypt](https://github.com/kelektiv/node.bcrypt.js) (hash de senhas)
  - [xlsx](https://github.com/SheetJS/sheetjs) (importação de dados)
  - [JSZip](https://github.com/Stuk/jszip) (importação em massa)
- **Frontend:**
  - [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/) (build e dev server)
  - [TailwindCSS](https://tailwindcss.com/) (estilização)

## Como Rodar o Projeto

### 1. Clonar o repositório
```bash
git clone https://github.com/lumendesp/Sistema-de-Avaliacao-de-Performance.git
cd Sistema-de-Avaliacao-de-Performance
```

### 2. Instalar dependências
#### Backend
```bash
cd backend
pnpm install
```
#### Frontend
```bash
cd ../frontend
pnpm install
```

### 3. Configurar o banco de dados
No diretório `backend`, configure o arquivo `.env` com a variável `DATABASE_URL` (por padrão já vem configurado para SQLite).

### 4. Rodar as migrações e seed
```bash
cd backend
npx prisma migrate reset # Reseta e aplica as migrações
npx prisma db seed       # Popula o banco com dados iniciais
```

### 5. Iniciar o backend
```bash
pnpm start
```

### 6. Iniciar o frontend
```bash
cd ../frontend
pnpm run dev
```

Acesse o sistema em [http://localhost:5173](http://localhost:5173) (frontend) e [http://localhost:3000](http://localhost:3000) (backend API).

---

Para dúvidas, sugestões ou contribuições, fique à vontade para abrir issues ou pull requests!
