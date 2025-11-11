# Sistema Temporário de Solicitação de Consultas e Exames – SEMUS Bacabal

📘 **Contexto**

Durante o período de migração entre plataformas oficiais de regulação municipal, foi necessário desenvolver rapidamente uma solução temporária de solicitação de consultas e exames para garantir a continuidade do atendimento nas Unidades Básicas de Saúde (UBS) do município de Bacabal–MA.

A aplicação foi projetada e entregue em um prazo reduzido, com foco em funcionalidade, simplicidade e automação.

## ⚙️ Arquitetura e Tecnologias

A aplicação foi construída utilizando um stack React + TypeScript, com integração automatizada via Google Apps Script e persistência dos dados no Google Sheets.

### 🧱 Frontend

- **Framework**: React 18 (via create-react-app com TypeScript)
- **Linguagem**: TypeScript, garantindo tipagem estática e maior segurança no código
- **Roteamento**: React Router DOM v6, utilizado para gerenciar as rotas internas e isolar áreas do sistema (ex: tela de login, formulário e confirmação de envio)
- **Requisições HTTP**: Axios, responsável por enviar os dados dos formulários para o endpoint do Google Apps Script
- **Criptografia**: crypto-js foi implementado para criptografar informações sensíveis, como identificadores ou tokens de autenticação de cada UBS
- **Estilização**: CSS modular e componentes reativos, priorizando usabilidade em ambientes de baixo desempenho (como computadores das UBS)

### 🧩 Backend / Integração

- **Tecnologia**: Google Apps Script (Web App mode)
- **Função**: Receber via POST os dados enviados pelo Axios e gravar automaticamente na planilha central do Google Sheets
- **Validação**: O script validava campos obrigatórios e aplicava formatação padronizada para evitar inconsistências de digitação
- **Resposta**: Retornava mensagens JSON com status de sucesso ou erro, exibidas ao usuário na interface React

### 🗄️ Banco de Dados

- **Google Sheets** foi utilizado como base de dados temporária
- Cada linha representava uma solicitação com informações como:
  - UBS de origem (identificada pelo usuário logado)
  - Nome do paciente
  - Tipo de solicitação (consulta ou exame)
  - Especialidade
  - Data e status de processamento

### 🌐 Hospedagem e Deploy

- O frontend foi hospedado na plataforma **Netlify**, que ofereceu:
  - Deploy contínuo a partir do repositório GitHub
  - SSL automático e versionamento integrado
  - Build otimizado via react-scripts build

## 👥 Estrutura de Usuários

- Cada UBS possuía um usuário associado a um link de acesso (sem necessidade de autenticação complexa)
- Esses usuários faziam o papel de atendentes, responsáveis por preencher e enviar os formulários
- O setor regulador, por sua vez, acessava a planilha centralizada no Google Sheets para tratar as solicitações em tempo real

## 🔄 Fluxo de Dados

1. O atendente acessa o sistema web (React) e preenche o formulário
2. Ao enviar, o frontend envia os dados via Axios POST para o endpoint do Google Apps Script
3. O Apps Script processa, valida e grava os dados no Google Sheets
4. O sistema retorna uma confirmação visual no frontend
5. O setor responsável visualiza e gerencia as solicitações diretamente na planilha

## ⚡ Resultados e Benefícios

- 🚀 **Entrega rápida** (em poucos dias) utilizando ferramentas low-code
- 💰 **Baixo custo operacional** — uso gratuito de Netlify, Google Sheets e Apps Script
- 🔐 **Segurança básica** via criptografia de dados e controle de origem por UBS
- 🔄 **Automação total** da coleta e organização de solicitações
- 🧩 **Fácil migração** para o novo sistema oficial, com exportação dos dados em formato estruturado

## 🧠 Considerações Técnicas

Essa solução demonstrou o poder de combinar tecnologias modernas de frontend (React + TypeScript) com serviços em nuvem low-code (Google Apps Script + Sheets) para entregar valor rapidamente em ambientes públicos.

O sistema garantiu continuidade operacional durante a transição e serviu como ponte digital confiável entre a equipe de atendimento das UBS e o setor regulador municipal.

## 🚀 Tecnologias Utilizadas

- React 18
- TypeScript
- React Router DOM v6
- Axios
- Crypto-JS
- Netlify Functions (proxy para Google Sheets)
- Google Apps Script
- Google Sheets API

## 📋 Funcionalidades

- Formulário de solicitação de consultas e exames
- Validação de dados em tempo real (CPF, CNS, telefone)
- Autenticação por unidade de saúde
- Integração automática com Google Sheets
- Interface responsiva para diferentes dispositivos
- Painel administrativo para gerenciamento

## 🛠️ Scripts Disponíveis

No diretório do projeto, você pode executar:

### `npm start`

Executa o aplicativo no modo de desenvolvimento.
Abra [http://localhost:3000](http://localhost:3000) para visualizá-lo no navegador.

### `npm test`

Inicia o executor de testes no modo de observação interativo.

### `npm run build`

Compila o aplicativo para produção na pasta `build`.

### `npm run eject`

**Nota: esta é uma operação irreversível. Uma vez que você `eject`, não há como voltar!**

Se você não estiver satisfeito com as escolhas de ferramentas e configurações de compilação, pode `eject` a qualquer momento.
