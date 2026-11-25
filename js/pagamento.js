/* =========================================================
   RAÍZES DO NORDESTE — pagamento.js
   Formulário de pagamento (cartão ou Pix simulado) e criação
   do pedido a partir do carrinho atual.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('[data-form-pagamento]');
  if (!form) return;

  preencherResumo();
  alternarCamposPorMetodo();

  form.querySelectorAll('input[name="metodo"]').forEach((radio) => {
    radio.addEventListener('change', alternarCamposPorMetodo);
  });

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (!validarFormulario(form)) return;

    const botao = form.querySelector('[type="submit"]');
    botao.disabled = true;
    botao.textContent = 'Processando pagamento...';

    // Simula a chamada a um gateway de pagamento.
    setTimeout(() => {
      const pedido = criarPedidoAPartirDoCarrinho();
      localStorage.removeItem(RN.CHAVES.CARRINHO);
      window.location.href = `pedido.html?id=${pedido.id}`;
    }, 1200);
  });

  function preencherResumo() {
    const { subtotal, desconto, taxa, total } = calcularTotalCarrinho();
    const subtotalEl = document.querySelector('[data-pg-subtotal]');
    const taxaEl = document.querySelector('[data-pg-taxa]');
    const totalEl = document.querySelector('[data-pg-total]');
    const linhaDesconto = document.querySelector('[data-pg-linha-desconto]');
    const descontoEl = document.querySelector('[data-pg-desconto]');
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

    if (total === 0) {
      const aviso = document.createElement('div');
      aviso.className = 'aviso aviso-info';
      aviso.textContent = 'Seu carrinho está vazio. Volte ao cardápio para adicionar itens antes de pagar.';
      form.prepend(aviso);
      form.querySelector('[type="submit"]').disabled = true;
    }
  }

  function alternarCamposPorMetodo() {
    const metodo = form.querySelector('input[name="metodo"]:checked')?.value;
    const camposCartao = document.querySelector('[data-campos-cartao]');
    const camposPix = document.querySelector('[data-campos-pix]');
    if (camposCartao) camposCartao.style.display = metodo === 'cartao' ? '' : 'none';
    if (camposPix) camposPix.style.display = metodo === 'pix' ? '' : 'none';
  }

  function validarFormulario(form) {
    let valido = true;
    const metodo = form.querySelector('input[name="metodo"]:checked')?.value;

    limparErros(form);

    obrigatorio(form, 'endereco', 'Informe o endereço de entrega.');

    if (metodo === 'cartao') {
      obrigatorio(form, 'numeroCartao', 'Informe o número do cartão.');
      obrigatorio(form, 'validade', 'Informe a validade.');
      obrigatorio(form, 'cvv', 'Informe o CVV.');
      const numero = form.numeroCartao?.value.replace(/\s/g, '') || '';
      if (numero && (numero.length < 13 || numero.length > 19 || !/^\d+$/.test(numero))) {
        marcarInvalido(form, 'numeroCartao', 'Número de cartão inválido.');
        valido = false;
      }
    }

    form.querySelectorAll('[data-obrigatorio-erro]').forEach((el) => {
      if (el.dataset.obrigatorioErro === 'true') valido = false;
    });

    return valido;

    function obrigatorio(form, nome, mensagem) {
      const campo = form[nome];
      if (!campo) return;
      if (!campo.value.trim()) {
        marcarInvalido(form, nome, mensagem);
        valido = false;
      }
    }
  }

  function marcarInvalido(form, nome, mensagem) {
    const campo = form[nome];
    if (!campo) return;
    const wrapper = campo.closest('.campo');
    if (!wrapper) return;
    wrapper.classList.add('invalido');
    wrapper.dataset.obrigatorioErro = 'true';
    const erro = wrapper.querySelector('.campo-erro');
    if (erro) erro.textContent = mensagem;
  }

  function limparErros(form) {
    form.querySelectorAll('.campo.invalido').forEach((wrapper) => {
      wrapper.classList.remove('invalido');
      delete wrapper.dataset.obrigatorioErro;
    });
  }
});
