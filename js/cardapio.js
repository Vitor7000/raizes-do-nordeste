/* =========================================================
   RAÍZES DO NORDESTE — cardapio.js
   Renderiza o cardápio DINÂMICO POR UNIDADE (filtra itens e
   preços conforme a unidade escolhida), aplica filtros de
   categoria/busca, exibe promoções ativas e envia itens para
   o carrinho.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const lista = document.querySelector('[data-lista-cardapio]');
  const filtros = document.querySelector('[data-filtros-cardapio]');
  const campoBusca = document.querySelector('[data-busca-cardapio]');
  const faixaPromo = document.querySelector('[data-promocoes]');
  const infoUnidade = document.querySelector('[data-info-unidade]');
  if (!lista) return;

  let categoriaAtiva = 'todos';
  let termoBusca = '';

  montarFiltros();
  renderizarInfoUnidade();
  renderizarPromocoes();
  renderizar();

  if (campoBusca) {
    campoBusca.addEventListener('input', (ev) => {
      termoBusca = ev.target.value.trim().toLowerCase();
      renderizar();
    });
  }

  function montarFiltros() {
    if (!filtros) return;
    filtros.innerHTML = RN.CATEGORIAS.map(
      (cat) => `<button class="filtro-chip" data-cat="${cat.id}" aria-pressed="${cat.id === 'todos'}">${cat.nome}</button>`
    ).join('');

    filtros.querySelectorAll('.filtro-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        categoriaAtiva = chip.dataset.cat;
        filtros.querySelectorAll('.filtro-chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
        chip.setAttribute('aria-pressed', 'true');
        renderizar();
      });
    });
  }

  function renderizarInfoUnidade() {
    if (!infoUnidade) return;
    const unidade = RN.buscarUnidadePorId(RN.unidadeAtual());
    if (!unidade) return;
    infoUnidade.innerHTML = `Exibindo cardápio da unidade <strong>${unidade.nome}</strong> (${unidade.endereco}, ${unidade.horario}). Troque a unidade no topo da página.`;
  }

  function renderizarPromocoes() {
    if (!faixaPromo) return;
    const promos = RN.promocoesAtivas(RN.unidadeAtual());
    if (promos.length === 0) {
      faixaPromo.innerHTML = '';
      return;
    }
    faixaPromo.innerHTML = promos.map((p) => `
      <div class="promo-cartao">
        <h4>${p.titulo}</h4>
        <p>${p.descricao}</p>
        ${p.tipo === 'cupom' ? `<span class="promo-cupom">${p.codigo}</span>` : ''}
      </div>
    `).join('');
  }

  function renderizar() {
    const cardapioDaUnidade = RN.itensDisponiveisNaUnidade(RN.unidadeAtual());

    const itens = cardapioDaUnidade.filter((prato) => {
      const passaCategoria = categoriaAtiva === 'todos' || prato.categoria === categoriaAtiva;
      const passaBusca = !termoBusca || prato.nome.toLowerCase().includes(termoBusca) || prato.desc.toLowerCase().includes(termoBusca);
      return passaCategoria && passaBusca;
    });

    if (itens.length === 0) {
      lista.innerHTML = `<div class="vazio">Nenhum prato encontrado nesta unidade. Tente outro termo, categoria ou unidade.</div>`;
      return;
    }

    lista.innerHTML = itens.map((prato) => `
      <article class="item-prato">
        <div class="item-prato-foto" aria-hidden="true">${prato.emoji}</div>
        <div>
          <h3 class="item-prato-nome">${prato.nome}</h3>
          <p class="item-prato-desc">${prato.desc}</p>
          <span class="item-prato-preco">${RN.formatarMoeda(prato.preco)}</span>
        </div>
        <div class="item-prato-acoes">
          <button class="btn btn-primario" data-add="${prato.id}">Adicionar</button>
        </div>
      </article>
    `).join('');

    lista.querySelectorAll('[data-add]').forEach((botao) => {
      botao.addEventListener('click', () => {
        adicionarAoCarrinho(Number(botao.dataset.add));
        const original = botao.textContent;
        botao.textContent = 'Adicionado ✓';
        botao.disabled = true;
        setTimeout(() => { botao.textContent = original; botao.disabled = false; }, 900);
      });
    });
  }

  function adicionarAoCarrinho(idPrato) {
    const carrinho = RN.lerJSON(RN.CHAVES.CARRINHO, []);
    const existente = carrinho.find((item) => item.id === idPrato);
    if (existente) {
      existente.quantidade += 1;
    } else {
      carrinho.push({ id: idPrato, quantidade: 1 });
    }
    RN.salvarJSON(RN.CHAVES.CARRINHO, carrinho);
    if (typeof atualizarContadorCarrinho === 'function') atualizarContadorCarrinho();
  }
});
