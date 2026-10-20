# Gestão de Estudos — Ivatuba

Sistema missionário da **Igreja Adventista do Sétimo Dia de Ivatuba (PR)** para acompanhar interessados, estudantes da Bíblia, instrutores e o catálogo de séries de estudo.

Todos os dados ficam no **Firebase Firestore** (sincronização em tempo real). O acesso é protegido por **Firebase Authentication**.

## 🚀 Acesso em produção

Após o deploy pelo GitHub Pages:

**https://suitehub.github.io/gestao-estudos-ivatuba/**

## ✨ Funcionalidades

| Seção | Descrição |
| --- | --- |
| **Painel** | Visão geral em tempo real de interessados, estudantes, instrutores e decisões espirituais. |
| **Interessados** | Pessoas contatadas que ainda não iniciaram estudo. Contato por WhatsApp em 1 clique e funil missionário. |
| **Estudantes** | Alunos com estudo em andamento, com avanço de lição, série e porcentagem de conclusão. |
| **Instrutores** | Quadro de obreiros e os estudantes acompanhados por cada um. |
| **Usuários** | Cadastro de contas e permissões (admin, coordenador, líder local, instrutor). |
| **Catálogo** | Séries de estudo e total de lições (Ouvindo a Voz de Deus, O Grande Conflito, etc.). |

## 🔐 Autenticação e permissões

O acesso usa **Firebase Authentication**:

- **Google** — recomendado para o administrador.
- **E-mail + senha** — instrutores cadastrados pelo administrador. No primeiro acesso, a conta é criada automaticamente com a senha escolhida.

> Por segurança, só consegue entrar quem já foi **pré-cadastrado pelo administrador** na seção *Usuários* (ou o e-mail do administrador principal).

Os perfis são armazenados em `usuarios/{uid}`, usando o **UID do Firebase Auth** como ID do documento.

### Perfis disponíveis

- `admin` — Pastor / Administrador (gerencia séries e usuários)
- `distrital` — Coordenador
- `local` — Líder Local
- `membro` — Instrutor Bíblico

## 🗂️ Estrutura no Firestore

| Coleção | Conteúdo |
| --- | --- |
| `interessados` | Leads ainda sem estudo iniciado |
| `estudantes` | Alunos com estudo em andamento |
| `series` | Catálogo de séries e lições |
| `usuarios` | Perfis e permissões de acesso |

As regras de segurança estão em [`firestore.rules`](./firestore.rules) e o modelo de dados em [`firebase-blueprint.json`](./firebase-blueprint.json).

## 🛠️ Rodando localmente

**Pré-requisitos:** Node.js 20+ (ou Bun)

```bash
# 1. Instalar dependências
npm install --legacy-peer-deps

# 2. Rodar em desenvolvimento
npm run dev
```

Acesse **http://localhost:3000**.

### Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento na porta 3000 |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Pré-visualiza o build de produção |
| `npm run lint` | Verificação de tipos com TypeScript |

## 🚢 Deploy

O deploy é automático pelo **GitHub Actions** ([`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)):

1. Cada push na branch `main` dispara o workflow.
2. Ele instala dependências, roda o type check e faz o build.
3. O conteúdo de `dist/` é publicado no **GitHub Pages**.

> O build usa `VITE_BASE_PATH=/gestao-estudos-ivatuba/` para que os assets funcionem no subdiretório do Pages.

## ⚙️ Configuração do Firebase

Antes de usar, garanta no [Console do Firebase](https://console.firebase.google.com/):

1. **Authentication → Sign-in method**: ative **Google** e **E-mail/senha**.
2. **Firestore Database → Rules**: publique o conteúdo de [`firestore.rules`](./firestore.rules).
3. Faça login uma vez com Google usando o e-mail do administrador para criar o perfil `admin`.

As credenciais ficam em `firebase-applet-config.json`. Chaves web do Firebase são públicas por design — a segurança real vem das regras do Firestore.

## 📦 Tecnologias

React 19 · TypeScript · Vite · Tailwind CSS 4 · Firebase (Auth + Firestore) · Motion · Lucide Icons
