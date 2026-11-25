/* =========================================================
   RAÍZES DO NORDESTE — carrinho.js
   Renderiza o carrinho (com preços da unidade atual), permite
   alterar quantidades, remover itens, aplicar cupom de
   promoção e calcula o resumo (subtotal, desconto, taxa, total).
   ========================================================= */

const TAXA_ENTREGA = 6.0;

document.addEventListener('DOMContentLoaded', () => {
  const lista = document.querySelector('[data-lista-carrinho]');
  if (!lista) return;

  renderizarCarrinho();
  ativarCupom();

  function obterCarrinhoDetalhado() {
    const carrinho = RN.lerJSON(RN.CHAVES.CARRINHO, []);
    return carrinho
      .map((item) => {
        const prato = RN.buscarPratoPorId(item.id);
        if (!prato) return null;
        return { ...prato, preco: RN.precoNaUnidade(prato), quantidade: item.quantidade };
      })
      .filter(Boolean);
  }

  function renderizarCarrinho() {
    const itens = obterCarrinhoDetalhado();
    const resumo = document.querySelector('[data-resumo-carrinho]');
    const botaoFinalizar = document.querySelector('[data-finalizar-pedido]');

    if (itens.length === 0) {
      lista.innerHTML = `<div class="vazio">Seu carrinho está vazio. <a href="cardapio.html">Ver o cardápio →</a></div>`;
      if (resumo) resumo.style.display = 'none';
      if (botaoFinalizar) desabilitarLink(botaoFinalizar, true);
      return;
    }

    if (resumo) resumo.style.display = '';
    if (botaoFinalizar) desabilitarLink(botaoFinalizar, false);

    lista.innerHTML = itens.map((item) => `
      <div class="linha-carrinho">
        <div>
          <strong>${item.emoji} ${item.nome}</strong><br>
          <span style="color:#5a4f43; font-size:0.88rem;">${RN.formatarMoeda(item.preco)} cada</span>
        </div>
        <div class="qtd-controle">
          <button type="button" aria-label="Diminuir quantidade" data-diminuir="${item.id}">−</button>
          <span>${item.quantidade}</span>
          <button type="button" aria-label="Aumentar quantidade" data-aumentar="${item.id}">+</button>
        </div>
        <strong>${RN.formatarMoeda(item.preco * item.quantidade)}</strong>
        <button type="button" class="btn btn-perigo" data-remover="${item.id}" aria-label="Remover item">Remover</button>
      </div>
    `).join('');

    lista.querySelectorAll('[data-aumentar]').forEach((b) => b.addEventListener('click', () => alterarQuantidade(Number(b.dataset.aumentar), 1)));
    lista.querySelectorAll('[data-diminuir]').forEach((b) => b.addEventListener('click', () => alterarQuantidade(Number(b.dataset.diminuir), -1)));
    lista.querySelectorAll('[data-remover]').forEach((b) => b.addEventListener('click', () => removerItem(Number(b.dataset.remover))));

    atualizarResumo(itens);
  }

  function desabilitarLink(link, desabilitado) {
    if (desabilitado) {
      link.setAttribute('aria-disabled', 'true');
      link.style.opacity = '0.5';
      link.style.pointerEvents = 'none';
    } else {
      link.removeAttribute('aria-disabled');
      link.style.opacity = '';
      link.style.pointerEvents = '';
    }
  }

  function alterarQuantidade(id, delta) {
    const carrinho = RN.lerJSON(RN.CHAVES.CARRINHO, []);
    const item = carrinho.find((i) => i.id === id);
    if (!item) return;
    item.quantidade += delta;
    const novoCarrinho = item.quantidade <= 0 ? carrinho.filter((i) => i.id !== id) : carrinho;
    RN.salvarJSON(RN.CHAVES.CARRINHO, novoCarrinho);
    renderizarCarrinho();
    if (typeof atualizarContadorCarrinho === 'function') atualizarContadorCarrinho();
  }

  function removerItem(id) {
    const carrinho = RN.lerJSON(RN.CHAVES.CARRINHO, []).filter((i) => i.id !== id);
    RN.salvarJSON(RN.CHAVES.CARRINHO, carrinho);
    renderizarCarrinho();
    if (typeof atualizarContadorCarrinho === 'function') atualizarContadorCarrinho();
  }

  function atualizarResumo(itens) {
    const subtotalEl = document.querySelector('[data-subtotal]');
    const taxaEl = document.querySelector('[data-taxa]');
    const totalEl = document.querySelector('[data-total]');
    const linhaDesconto = document.querySelector('[data-linha-desconto]');
    const descontoEl = document.querySelector('[data-desconto]');

    const { subtotal, desconto, taxa, total } = calcularTotalCarrinho();

    if (subtotalEl) subtotalEl.textContent = RN.formatarMoeda(subtotal);
    if (taxaEl) taxaEl.textContent = RN.formatarMoeda(taxa);
    if (totalEl) totalEl.textContent = RN.formatarMoeda(total);

    if (linhaDesconto && descontoEl) {
      if (desconto > 0) {
        linhaDesconto.style.display = '';
        descontoEl.textContent = `− ${RN.formatarMoeda(desconto)}`;
      } else {
        linhaDesconto.style.display = 'none';
      }
    }
  }

  /* Requisito: promoções e campanhas aplicáveis no carrinho via cupom. */
  function ativarCupom() {
    const form = document.querySelector('[data-form-cupom]');
    const mensagem = document.querySelector('[data-cupom-mensagem]');
    if (!form) return;

    const cupomAtual = RN.lerJSON(RN.CHAVES.CUPOM, null);
    if (cupomAtual && mensagem) {
      mensagem.innerHTML = `<div class="aviso aviso-sucesso">Cupom <strong>${cupomAtual}</strong> aplicado.</div>`;
    }

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const codigo = form.cupom.value.trim();
      const promo = RN.buscarPromocaoPorCupom(codigo);
      if (!promo) {
        mensagem.innerHTML = `<div class="aviso aviso-erro">Cupom inválido ou expirado.</div>`;
        return;
      }
      RN.salvarJSON(RN.CHAVES.CUPOM, promo.codigo);
      mensagem.innerHTML = `<div class="aviso aviso-sucesso">Cupom <strong>${promo.codigo}</strong> aplicado: ${promo.descricao}</div>`;
      renderizarCarrinho();
    });
  }
});

/* Usado pela página de carrinho e de pagamento para obter o total a
   cobrar (já considerando preço por unidade e cupom de desconto). */
function calcularTotalCarrinho() {
  const carrinho = RN.lerJSON(RN.CHAVES.CARRINHO, []);
  const subtotal = carrinho.reduce((soma, item) => {
    const prato = RN.buscarPratoPorId(item.id);
    return soma + (prato ? RN.precoNaUnidade(prato) * item.quantidade : 0);
  }, 0);

  const codigoCupom = RN.lerJSON(RN.CHAVES.CUPOM, null);
  const promo = RN.buscarPromocaoPorCupom(codigoCupom);
  const desconto = promo ? Math.round(subtotal * (promo.percentual / 100) * 100) / 100 : 0;

  const taxa = subtotal > 0 ? TAXA_ENTREGA : 0;
  const total = Math.max(subtotal - desconto, 0) + taxa;

  return { subtotal, desconto, taxa, total, cupom: promo ? promo.codigo : null };
}
