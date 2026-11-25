/* =========================================================
   RAÍZES DO NORDESTE — pedido.js
   Criação de pedidos (a partir do carrinho web ou de um pedido
   avulso, como o do totem), consulta por id e renderização da
   linha do tempo de status na página do pedido.

   Cada pedido carrega `unidade` (unidade/filial que atenderá o
   pedido) e `canal` (web, totem ou app), atendendo ao requisito
   de cardápio por unidade e de multicanalidade do projeto.
   ========================================================= */

const STATUS_PEDIDO = ['recebido', 'preparo', 'pronto', 'entregue'];
const ROTULOS_STATUS = {
  recebido: 'Pedido recebido',
  preparo: 'Em preparo',
  pronto: 'Pronto para retirada/entrega',
  entregue: 'Entregue',
};
const ROTULOS_CANAL = { web: 'Site', totem: 'Totem', app: 'App' };

/**
 * Cria um pedido. Por padrão usa o carrinho web (RN.CHAVES.CARRINHO),
 * a unidade atualmente selecionada e aplica o cupom salvo, se houver.
 * Outros canais (ex.: totem) podem passar `itens` e `canal` explícitos.
 *
 * @param {{itens?: Array<{id:number, quantidade:number}>, canal?: string, unidadeId?: string}} opcoes
 */
function criarPedidoAPartirDoCarrinho(opcoes = {}) {
  const canal = opcoes.canal || 'web';
  const unidadeId = opcoes.unidadeId || RN.unidadeAtual();
  const itensBrutos = opcoes.itens || RN.lerJSON(RN.CHAVES.CARRINHO, []);
  const usuario = RN.usuarioAtual();

  const itens = itensBrutos.map((item) => {
    const prato = RN.buscarPratoPorId(item.id);
    if (!prato) return null;
    const preco = RN.precoNaUnidade(prato, unidadeId);
    return { id: prato.id, nome: prato.nome, preco, quantidade: item.quantidade };
  }).filter(Boolean);

  const subtotal = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);

  // Cupom de promoção (requisito: promoções e campanhas). Aplicado apenas
  // no canal web, onde existe o campo de cupom no carrinho.
  const codigoCupom = canal === 'web' ? RN.lerJSON(RN.CHAVES.CUPOM, null) : null;
  const promo = RN.buscarPromocaoPorCupom(codigoCupom);
  const desconto = promo ? Math.round(subtotal * (promo.percentual / 100) * 100) / 100 : 0;

  // Pedidos feitos no totem são retirados no balcão da própria unidade,
  // portanto não têm taxa de entrega.
  const taxa = canal === 'totem' ? 0 : 6.0;
  const total = Math.max(subtotal - desconto, 0) + taxa;

  const unidade = RN.buscarUnidadePorId(unidadeId);

  const pedido = {
    id: RN.gerarId('PED'),
    itens,
    subtotal,
    desconto,
    cupom: promo ? promo.codigo : null,
    taxa,
    total,
    status: 'recebido',
    criadoEm: new Date().toISOString(),
    clienteNome: usuario ? usuario.nome : 'Cliente balcão',
    clienteEmail: usuario ? usuario.email : null,
    unidadeId: unidadeId,
    unidadeNome: unidade ? unidade.nome : unidadeId,
    canal,
  };

  const pedidos = RN.lerJSON(RN.CHAVES.PEDIDOS, []);
  pedidos.unshift(pedido);
  RN.salvarJSON(RN.CHAVES.PEDIDOS, pedidos);

  // Concede pontos de fidelidade: 1 ponto a cada R$ 1 gasto (pontos em
  // dobro acima de R$ 60, conforme a campanha "Ponto em dobro").
  if (usuario) {
    const pontosAtuais = RN.lerJSON(RN.CHAVES.FIDELIDADE, {});
    const multiplicador = total > 60 ? 2 : 1;
    pontosAtuais[usuario.email] = (pontosAtuais[usuario.email] || 0) + Math.floor(total) * multiplicador;
    RN.salvarJSON(RN.CHAVES.FIDELIDADE, pontosAtuais);
  }

  if (canal === 'web') {
    localStorage.removeItem(RN.CHAVES.CUPOM);
  }

  return pedido;
}

function buscarPedidoPorId(id) {
  const pedidos = RN.lerJSON(RN.CHAVES.PEDIDOS, []);
  return pedidos.find((p) => p.id === id);
}

document.addEventListener('DOMContentLoaded', () => {
  const painel = document.querySelector('[data-painel-pedido]');
  if (!painel) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const pedido = id ? buscarPedidoPorId(id) : null;

  if (!pedido) {
    painel.innerHTML = `<div class="vazio">Pedido não encontrado. <a href="cardapio.html">Fazer um novo pedido →</a></div>`;
    return;
  }

  renderizarPedido(pedido);

  function renderizarPedido(pedido) {
    const indiceAtual = STATUS_PEDIDO.indexOf(pedido.status);

    const trilha = STATUS_PEDIDO.map((status, i) => {
      const classe = i < indiceAtual ? 'concluido' : i === indiceAtual ? 'ativo' : '';
      return `<li class="${classe}">${ROTULOS_STATUS[status]}</li>`;
    }).join('');

    const itensHtml = pedido.itens.map((item) => `
      <div class="resumo-linha">
        <span>${item.quantidade}× ${item.nome}</span>
        <span>${RN.formatarMoeda(item.preco * item.quantidade)}</span>
      </div>
    `).join('');

    const linhaDesconto = pedido.desconto > 0 ? `
      <div class="resumo-linha desconto"><span>Desconto (cupom ${pedido.cupom || ''})</span><span>− ${RN.formatarMoeda(pedido.desconto)}</span></div>
    ` : '';

    painel.innerHTML = `
      <ol class="trilha-passos">${trilha}</ol>
      <div class="painel">
        <p style="margin-bottom:0.3rem;"><strong>Pedido</strong> ${pedido.id}</p>
        <p style="color:#5a4f43; font-size:0.9rem;">Realizado em ${new Date(pedido.criadoEm).toLocaleString('pt-BR')}</p>
        <p style="color:#5a4f43; font-size:0.9rem;">Unidade: <strong>${pedido.unidadeNome || '—'}</strong> · Canal: <strong>${ROTULOS_CANAL[pedido.canal] || pedido.canal}</strong></p>
        <div class="resumo-pedido mt-4">
          ${itensHtml}
          ${linhaDesconto}
          <div class="resumo-linha"><span>Taxa de entrega</span><span>${RN.formatarMoeda(pedido.taxa)}</span></div>
          <div class="resumo-linha total"><span>Total</span><span>${RN.formatarMoeda(pedido.total)}</span></div>
        </div>
      </div>
    `;
  }

  // Simula avanço automático de status para fins de demonstração.
  if (STATUS_PEDIDO.indexOf(pedido.status) < STATUS_PEDIDO.length - 1) {
    setTimeout(() => {
      const pedidos = RN.lerJSON(RN.CHAVES.PEDIDOS, []);
      const atual = pedidos.find((p) => p.id === pedido.id);
      if (atual) {
        const proximo = STATUS_PEDIDO[STATUS_PEDIDO.indexOf(atual.status) + 1];
        if (proximo) {
          atual.status = proximo;
          RN.salvarJSON(RN.CHAVES.PEDIDOS, pedidos);
          renderizarPedido(atual);
        }
      }
    }, 6000);
  }
});
