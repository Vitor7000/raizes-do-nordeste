# Atores do Diagrama de Casos de Uso e Multicanalidade

Este documento existe para apoiar o **Diagrama de Casos de Uso** do projeto, mapeando
cada ator exigido pelo roteiro ao que efetivamente existe (ou é simulado) no código
do protótipo `Raízes do Nordeste`.

## 1. Os 5 atores exigidos

| Ator | Papel no negócio | Onde aparece no código |
|---|---|---|
| **Cliente** | Navega pelo cardápio (por unidade), monta o carrinho, aplica cupom, faz login/cadastro, paga o pedido, acompanha o status e acumula pontos de fidelidade. | `pages/cardapio.html`, `pages/carrinho.html`, `pages/pagamento.html`, `pages/pedido.html`, `pages/perfil.html`, `pages/fidelidade.html`, `pages/login.html`, `pages/cadastro.html`. Perfil salvo como `perfil: 'cliente'` em `RN.CHAVES.USUARIOS`. |
| **Atendente** | Acompanha os pedidos da unidade do início ao fim, avança status, confirma a entrega/retirada ao cliente. Não precisa ver indicadores financeiros consolidados da rede. | `pages/admin.html`, quando logado com `perfil: 'atendente'` (conta de demonstração `atendente@raizes.com`). O painel oculta a receita total, mas libera todos os status, inclusive "Entregue". |
| **Cozinha** | Vê apenas a fila de produção (recebido → em preparo → pronto) e avança o preparo dos pratos. Não lida com pagamento, cliente ou dados financeiros. | `pages/admin.html`, quando logado com `perfil: 'cozinha'` (conta de demonstração `cozinha@raizes.com`). A tabela filtra pedidos já entregues, oculta estatísticas de clientes/receita e limita o avanço de status a "recebido/preparo/pronto". |
| **Gerente/Administrador** | Enxerga tudo: todos os pedidos, de todas as unidades, indicadores financeiros (receita total) e a base de clientes cadastrados. | `pages/admin.html`, quando logado com `perfil: 'admin'` (conta de demonstração `admin@raizes.com`). |
| **Sistema de Pagamento Externo** | Ator não-humano que autoriza o pagamento (cartão/Pix). No protótipo é simulado (sem chamadas de rede reais), mas o fluxo, a tela e o texto explicativo já indicam esse papel. | `pages/pagamento.html` + `js/pagamento.js` (simula "Processando pagamento..." antes de criar o pedido). Também citado explicitamente na `pages/privacidade.html`, seção 5, como o único terceiro com quem dados de pagamento seriam compartilhados em produção. |

### Sobre "Atendente" e "Cozinha" dividirem a mesma tela

O código usa **uma única página** (`pages/admin.html`) para os três atores internos
(Gerente/Administrador, Atendente e Cozinha), mas com **permissões e visões
diferentes conforme o perfil logado** — o que é uma decisão de implementação válida
e documentada, não uma ausência do ator. No diagrama de casos de uso, os três devem
aparecer como atores distintos, cada um associado aos casos de uso que pode
realizar (ex.: "Avançar status do pedido" é compartilhado por Atendente e Cozinha,
mas com generalização/restrição diferente; "Consultar receita" é exclusivo do
Gerente/Administrador).

Concretamente, no `pages/admin.html`:

- `exigirEquipeInterna()` (em `js/script.js`) permite a entrada de qualquer um dos
  três perfis (`admin`, `atendente`, `cozinha`), mas cada um vê um título de painel
  diferente (`ROTULOS_PERFIL`) e um aviso contextual (`AVISOS_PERFIL`).
- A Cozinha tem a tabela pré-filtrada (`STATUS_VISIVEIS_COZINHA`) e o `<select>` de
  status por linha é limitado às opções de produção.
- Estatísticas financeiras (`[data-stat-financeira]`) e de clientes
  (`[data-stat-clientes]`) só aparecem para o perfil `admin`.

## 2. Multicanalidade (Web / Totem / App)

O roteiro pede que a análise de requisitos trate o sistema como multicanal. O
protótipo implementa dois canais reais e documenta o terceiro:

- **Web** (`canal: 'web'`): fluxo completo cardápio → carrinho → cupom → pagamento
  → acompanhamento, feito pelo Cliente autenticado ou visitante.
- **Totem** (`canal: 'totem'`): `pages/totem.html` simula um totem de
  autoatendimento fisicamente instalado em **uma unidade fixa** (parametrizado por
  `?unidade=` na URL, como uma configuração de fábrica do equipamento). Ao
  confirmar, o totem agora cria um pedido de verdade, através da mesma função
  `criarPedidoAPartirDoCarrinho()` usada pelo site, apenas passando
  `canal: 'totem'` — por isso pedidos do totem aparecem no painel do
  Atendente/Cozinha junto com os do site, cada um identificado por uma coluna
  "Canal" na tabela.
- **App** (`canal: 'app'`, conceitual): o protótipo não implementa um aplicativo
  nativo separado, mas a arquitetura já foi pensada para suportá-lo sem
  retrabalho: toda a lógica de negócio (cardápio por unidade, promoções,
  carrinho, criação de pedido, fidelidade) vive em `js/dados.js`, `js/carrinho.js`
  e `js/pedido.js`, desacoplada da camada visual HTML/CSS. Um app nativo ou
  híbrido consumiria essas mesmas regras (hoje via `localStorage`; em produção,
  via uma API REST) e apenas informaria `canal: 'app'` ao criar o pedido — o
  modelo de dados do pedido já reserva esse valor (ver `ROTULOS_CANAL` em
  `js/pedido.js`). Isso deve ser explicado na análise de requisitos como a
  estratégia de multicanalidade adotada, mesmo sem uma interface de app
  entregue no código.

## 3. Cardápio por unidade (apoio ao caso de uso "Consultar cardápio")

Cada unidade (`RN.UNIDADES` em `js/dados.js`) tem endereço e horário próprios, e
cada prato (`RN.CARDAPIO`) declara em quais unidades está disponível
(`unidades: [...]`) e, opcionalmente, um preço específico por unidade
(`precoPorUnidade`). O cardápio (`pages/cardapio.html`) e o totem
(`pages/totem.html`) filtram os itens pela unidade selecionada, e o pedido
criado carrega `unidadeId`/`unidadeNome`, permitindo ao Gerente filtrar pedidos
por unidade no painel interno.

## 4. Promoções e campanhas (apoio ao caso de uso "Aplicar promoção")

`RN.PROMOCOES` (em `js/dados.js`) modela campanhas de destaque (exibidas como
banner no cardápio) e cupons (aplicáveis no carrinho, com desconto percentual
refletido no resumo do pedido e no pedido final). Isso cobre o requisito de
promoções/campanhas citado no roteiro, que antes não existia no protótipo.
