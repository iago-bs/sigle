# SIGLE Systems

Sistema de gerenciamento para lojas de eletrônicos construído com React, TypeScript, Electron e Supabase.

## 📋 Funcionalidades

- **Gerenciamento de Clientes**: Cadastro completo com validação de CPF, telefone e email
- **Gerenciamento de Equipamentos**: Controle de equipamentos com soft delete
- **Gerenciamento de Peças**: Controle de peças com soft delete
- **Controle de Estoque**: Movimentação e histórico de peças em estoque
- **Agendamentos**: Sistema básico de agendamentos
- **Modo Loja Única**: Sistema simplificado sem necessidade de login

## 🚀 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **npm** ou **yarn** (gerenciador de pacotes)
- **Git** - [Download](https://git-scm.com/)

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/iago-bs/sigle.git
cd sigle
```

### 2. Instale as dependências

```bash
npm install
```

Ou se preferir usar yarn:

```bash
yarn install
```

### 3. Configure o Supabase

O sistema utiliza Supabase como backend. Você precisará:

1. Criar uma conta no [Supabase](https://supabase.com/)
2. Criar um novo projeto
3. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Execute as migrações do banco de dados

Execute os scripts SQL localizados na pasta do projeto para criar as tabelas necessárias:

- `clients` - Tabela de clientes
- `equipments_manual` - Tabela de equipamentos
- `pieces_manual` - Tabela de peças
- `stock_parts` - Tabela de estoque

Certifique-se de que todas as tabelas possuem o campo `active` (BOOLEAN) para suporte ao soft delete.

## 🖥️ Executando o Projeto

### Modo Desenvolvimento (Web)

Para executar o projeto como aplicação web:

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`

### Modo Desenvolvimento (Electron)

Para executar como aplicação desktop:

```bash
npm run electron:dev
```

Este comando iniciará o servidor de desenvolvimento e abrirá a aplicação Electron automaticamente.

## 📦 Build para Produção

### Build Web

```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

### Build Electron (Desktop)

#### Windows

```bash
npm run electron:build:win
```

#### macOS

```bash
npm run electron:build:mac
```

#### Linux

```bash
npm run electron:build:linux
```

Os instaladores serão gerados na pasta `release/`.

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool e dev server
- **Electron** - Framework para aplicações desktop
- **Supabase** - Backend as a Service (PostgreSQL)
- **Tailwind CSS** - Framework CSS utility-first
- **Radix UI** - Componentes de UI acessíveis
- **React Hook Form** - Gerenciamento de formulários
- **date-fns** - Biblioteca para manipulação de datas
- **Lucide React** - Biblioteca de ícones

## 📁 Estrutura do Projeto

```
sigle/
├── electron/          # Arquivos do Electron
│   ├── main.cjs       # Processo principal do Electron
│   └── preload.cjs    # Script de preload
├── src/
│   ├── components/    # Componentes React
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilitários e configurações
│   ├── styles/        # Arquivos CSS
│   ├── types/         # Definições TypeScript
│   └── utils/         # Funções utilitárias
├── package.json       # Dependências e scripts
└── README.md          # Este arquivo
```

## 🔧 Solução de Problemas

### Erro ao executar Electron

Se encontrar erros ao executar o Electron pela primeira vez, tente:

```bash
npx electron-rebuild
```

### Erros de dependências

Limpe o cache e reinstale:

```bash
npm run clean
npm install
```

Ou:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Problemas com Supabase

Verifique se:
- As variáveis de ambiente estão configuradas corretamente
- As tabelas foram criadas no banco de dados
- A coluna `active` existe em todas as tabelas necessárias

## 📝 Validações Implementadas

O sistema inclui validações para:

- **CPF**: Validação completa com verificação de dígitos verificadores
- **Telefone**: Aceita formatos (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
- **Email**: Validação de formato padrão RFC 5322

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto é privado e de uso interno.

## 👤 Autor

**SIGLE Systems**

---

**Nota**: Este sistema está configurado para operar em modo loja única, sem necessidade de autenticação. Todas as funcionalidades estão disponíveis imediatamente após a inicialização.
