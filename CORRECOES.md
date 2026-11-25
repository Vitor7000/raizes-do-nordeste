# Correções aplicadas — Raízes do Nordeste

Este documento lista o que foi alterado em relação à versão anterior do projeto,
organizado pelos 5 pontos apontados na avaliação.

---

## 1. LGPD e privacidade (era a lacuna mais crítica — 15 pontos)

**Antes:** nenhum aviso de consentimento, política de privacidade, checkbox de aceite
ou texto sobre uso de dados em qualquer página.

**Agora:**

- **Nova página `pages/privacidade.html`** — política de privacidade completa, com
  9 seções: controlador e canal do encarregado (DPO), quais dados são coletados,
  onde ficam armazenados (deixa explícito que é `localStorage`, sem back-end),
  finalidade e base legal de cada tratamento, compartilhamento com o Sistema de
  Pagamento Externo, direitos do titular (art. 18 da LGPD), retenção, cookies e
  alterações da política.
- **Banner de consentimento em todas as páginas** — a função `ativarAvisoLGPD()`
  em `js/script.js` injeta um banner fixo no rodapé da janela na primeira visita,
  explicando o uso de armazenamento local e linkando a política. O aceite é
  gravado em `rn_consentimento_lgpd` com data/hora e origem.
- **Checkbox de aceite obrigatório no cadastro** (`pages/cadastro.html`) — o
  formulário não é enviado sem o aceite, e o consentimento é gravado junto ao
  registro do usuário (`consentimentoLGPD: { aceito, em }`).
- **Aviso na página de pagamento** — texto explicando que o processamento é feito
  por um Sistema de Pagamento Externo, com link para a política.
- **Aviso de direitos no perfil** (`pages/perfil.html`) — orienta como corrigir ou
  excluir os dados.
- **Link "Política de Privacidade" no rodapé** de todas as páginas, no menu do
  rodapé da home e no rodapé do totem.
- Novos helpers em `js/dados.js`: `temConsentimentoLGPD()` e
  `registrarConsentimentoLGPD()`.

---

## 2. Cardápio dinâmico por unidade

**Antes:** `dados.js` tinha um único cardápio global; não existia o conceito de
unidade/filial.

**Agora:**

- **`RN.UNIDADES`** em `js/dados.js` — três unidades (Recife/Boa Viagem,
  Fortaleza/Beira-Mar, Salvador/Pelourinho), cada uma com endereço e horário.
- **Cada prato declara suas unidades** (`unidades: ['recife', ...]`) e pode ter
  **preço diferente por unidade** (`precoPorUnidade`). Exemplos: o Acarajé só
  existe em Salvador; o Bolo de Rolo só no Recife (e mais barato lá); a Carne de
  Sol é mais barata em Fortaleza.
- **Seletor de unidade no cabeçalho** de todas as páginas de cliente
  (`ativarSeletorDeUnidade()` em `js/script.js`), com a escolha persistida em
  `rn_unidade_selecionada`.
- **Cardápio, home e totem filtram por unidade** e exibem os preços daquela
  unidade — `RN.itensDisponiveisNaUnidade()` e `RN.precoNaUnidade()`.
- **Carrinho e pagamento recalculam** os valores conforme a unidade ativa.
- **O pedido guarda a unidade** (`unidadeId` / `unidadeNome`), e o painel interno
  ganhou um **filtro por unidade** e uma coluna "Unidade" na tabela.

---

## 3. Promoções e campanhas

**Antes:** apenas duas menções soltas a "desconto" em `fidelidade.html`.

**Agora:**

- **`RN.PROMOCOES`** em `js/dados.js` — campanhas com tipo (`destaque` ou
  `cupom`), descrição, percentual e unidades onde valem.
- **Banner de promoções no cardápio** (`pages/cardapio.html`), renderizado a
  partir das promoções ativas na unidade selecionada.
- **Seção "Promoções da semana" na home** (`index.html`).
- **Campo de cupom no carrinho** (`pages/carrinho.html` + `js/carrinho.js`) —
  o cupom `RAIZES10` aplica 10% de desconto, com validação, mensagem de
  sucesso/erro e uma linha "Desconto" no resumo.
- **Desconto propagado** para a tela de pagamento, para o pedido final e para a
  tela de acompanhamento do pedido.
- **Campanha de fidelidade implementada de fato**: pontos em dobro em pedidos
  acima de R$ 60 (`js/pedido.js`), com o texto correspondente em
  `pages/fidelidade.html`.

---

## 4. Atores do Diagrama de Casos de Uso (5 atores)

**Antes:** só existiam dois perfis reais (`admin` e cliente comum); o
`admin.html` fazia o papel de atendente e cozinha ao mesmo tempo, sem distinção.

**Agora:**

- **Três perfis internos distintos**: `admin` (Gerente/Administrador),
  `atendente` e `cozinha`, com contas de demonstração criadas automaticamente em
  `pages/login.html`:
  - `admin@raizes.com` / `admin123`
  - `atendente@raizes.com` / `atendente123`
  - `cozinha@raizes.com` / `cozinha123`
- **O painel interno muda conforme o perfil logado** (`pages/admin.html`):
  - **Gerente/Administrador**: vê tudo — todos os pedidos, todas as unidades,
    receita total e total de clientes cadastrados.
  - **Atendente**: vê todo o ciclo do pedido (inclusive marcar "Entregue"), mas
    sem os indicadores financeiros consolidados.
  - **Cozinha**: vê apenas a fila de produção (recebido → preparo → pronto), sem
    receita, sem base de clientes e sem a opção de status "Entregue".
  - Cada perfil recebe um título de painel e um aviso contextual próprios.
- **Nova função `exigirEquipeInterna()`** em `js/script.js` (a antiga
  `exigirAdmin()` foi mantida).
- **O Sistema de Pagamento Externo** está documentado como ator no fluxo de
  `pages/pagamento.html` e citado explicitamente na política de privacidade
  (seção 5) como o único terceiro com quem dados de pagamento seriam
  compartilhados em produção.
- **Nova documentação `documentacao/atores-casos-de-uso.md`** com uma tabela
  mapeando cada um dos 5 atores ao ponto correspondente do código, além da
  justificativa formal de por que Atendente e Cozinha compartilham a mesma tela
  com permissões distintas (e de como isso deve aparecer no diagrama).

---

## 5. Multicanalidade (App / Totem / Web)

**Antes:** existia `totem.html`, mas ele não criava pedidos de verdade (só
sorteava um número de senha aleatório) e não havia distinção de canal.

**Agora:**

- **Todo pedido carrega um `canal`** (`web`, `totem` ou `app`) —
  `js/pedido.js`, com `ROTULOS_CANAL`.
- **O totem agora cria pedidos reais** usando a mesma função
  `criarPedidoAPartirDoCarrinho()` do site, passando `canal: 'totem'`. A senha
  exibida deriva do id do pedido, e o pedido aparece na fila da cozinha/atendente.
- **O totem opera numa unidade fixa**, configurável por `?unidade=fortaleza` na
  URL — simulando a configuração de fábrica de um equipamento físico instalado em
  uma filial. O nome da unidade aparece no topo da tela do totem.
- **Coluna "Canal" no painel interno**, para a operação distinguir pedidos do
  site e do totem.
- **O canal "App" está tratado conceitualmente** (e documentado em
  `documentacao/atores-casos-de-uso.md`, seção 2): a lógica de negócio foi
  isolada em `js/dados.js`, `js/carrinho.js` e `js/pedido.js`, desacoplada da
  camada visual, de modo que um app nativo consumiria as mesmas regras e apenas
  informaria `canal: 'app'`. O modelo de dados já reserva esse valor.

---

## Arquivos alterados e criados

**Criados**

- `pages/privacidade.html`
- `documentacao/atores-casos-de-uso.md`
- `CORRECOES.md`

**Reescritos**

- `js/dados.js` — unidades, promoções, helpers de unidade e de LGPD
- `js/script.js` — banner LGPD, seletor de unidade, `exigirEquipeInterna()`
- `js/cardapio.js` — filtro por unidade, banner de promoções
- `js/carrinho.js` — preços por unidade, cupom e desconto
- `js/pedido.js` — unidade, canal, cupom e pontos em dobro no pedido
- `pages/admin.html` — permissões por perfil, filtro de unidade, coluna de canal
- `pages/totem.html` — unidade fixa, criação de pedido real

**Editados**

- `index.html` — seção de promoções, destaques por unidade, link da política
- `pages/cadastro.html` — checkbox de consentimento LGPD
- `pages/carrinho.html` — campo de cupom e linha de desconto
- `pages/pagamento.html` — aviso do pagamento externo e linha de desconto
- `pages/login.html` — contas de demonstração dos três perfis internos
- `pages/perfil.html` — aviso de direitos do titular
- `pages/fidelidade.html` — texto da campanha de pontos em dobro
- `js/pagamento.js` — exibição do desconto no resumo
- `css/style.css` — estilos do banner LGPD, seletor de unidade, cartões de
  promoção, campo de cupom e checkbox de consentimento
- Demais páginas (`cultura`, `destinos`, `forro`, `gastronomia`, `pedido`) —
  seletor de unidade no cabeçalho e link da política no rodapé
