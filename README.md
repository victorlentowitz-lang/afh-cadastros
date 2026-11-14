# AFH Cadastros

Sistema web de cadastros para a **AFH Guarapuava** (Associação de Apoio às Famílias com Hanseníase e Demais Doenças).
Projeto Integrador de Matemática II – 3º ano C – Colégio Estadual Visconde de Guarapuava.

**Integrantes:** Victor Lentowitz e Levi Vale

## O problema

Os cadastros das famílias atendidas pela AFH ficam em fichas de papel. É difícil achar uma ficha, aparecem cadastros repetidos e não há controle de quem já recebeu a cesta básica no mês.

## O que esta versão faz (Sprint 1)

| Funcionalidade | Requisito / História |
|---|---|
| Login com e-mail e senha, com validação e mensagem "E-mail ou senha incorretos" | RF01 · HU01 |
| Senhas guardadas como hash SHA-256 (nunca em texto puro) e saída automática após 30 min sem uso | RNF02 |
| Cadastro de família com validação dos campos obrigatórios | RF02 · HU02 |
| Cadastro dos membros da família | RF03 |
| Validação do CPF (dígitos verificadores) e bloqueio de CPF repetido | RF06 · HU03 |
| Busca por nome (sem precisar de acento) ou por CPF | RF04 · HU04 |
| Edição dos dados da família e marcar como inativa | RF05 · RF12 · HU05 |
| Registrar entrega, com aviso se a família já recebeu cesta no mês | RF07 · HU06 |
| Lista de famílias que ainda não receberam cesta no mês | RF08 · HU07 |
| Histórico de entregas da família, do mais recente para o mais antigo | RF10 |
| Relatório do mês: famílias ativas, doações por tipo e lista de entregas, com opção de imprimir | RF11 · HU10 |
| Layout responsivo: no celular o menu vira barra fixa embaixo e a lista vira cartões | RNF03 · Protótipo |

As telas seguem o protótipo do Figma da Etapa 3 (cores, fonte Inter, tamanhos e componentes do guia de estilo).

## Como abrir

Não precisa instalar nada.

1. Baixe o projeto (botão **Code → Download ZIP**) ou clone o repositório.
2. Abra o arquivo `index.html` no Google Chrome.

Ou acesse pelo GitHub Pages (link no topo do repositório, se estiver ativado).

### Contas de teste

| Perfil | E-mail | Senha |
|---|---|---|
| Administradora | patricia@afh.org.br | afh2026 |
| Voluntário | pedro@afh.org.br | afh2026 |

O sistema já vem com 4 famílias de exemplo (dados fictícios). Os dados ficam salvos no navegador (localStorage). Para voltar aos dados de exemplo, apague os dados do site no navegador.

## Estrutura de pastas

```
afh-cadastros/
├── index.html          → tela de login
├── inicio.html         → resumo do mês, busca e famílias que faltam receber
├── familias.html       → lista e busca de famílias
├── familia-form.html   → cadastro e edição de família
├── familia.html        → ficha da família (dados, membros e histórico)
├── relatorios.html     → relatório do mês
├── em-breve.html       → tela de Doações (próxima sprint)
├── css/
│   └── style.css       → guia de estilo do protótipo (cores, fonte, componentes)
├── js/
│   ├── auth.js         → login, hash da senha e sessão
│   ├── dados.js        → famílias, CPF, entregas (localStorage)
│   └── layout.js       → menu e janela de registrar entrega
└── docs/
    ├── sprint-1.md     → backlog e quadro da sprint
    └── retrospectiva.md
```

## Tecnologias

HTML, CSS e JavaScript puro (sem frameworks), para rodar em qualquer computador ou celular com Chrome.

## Próxima sprint

- Tela de Doações e total de atendimentos no relatório
- Registro de atendimentos de fisioterapia e psicossocial (RF09 · HU08)
- Perfil "voluntário" sem acesso às anotações de saúde (RF13)
- Trocar o localStorage por um banco de dados
