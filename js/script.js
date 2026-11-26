/* =========================================================
   RAÍZES DO NORDESTE — script.js
   Comportamento comum a todas as páginas: menu responsivo,
   contador do carrinho, estado de sessão, seletor de unidade
   (cardápio por unidade) e aviso de privacidade/LGPD.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  ativarMenuMobile();
  atualizarContadorCarrinho();
  ativarAreaDoUsuario();
  ativarSeletorDeUnidade();
  ativarAvisoLGPD();
});

function ativarMenuMobile() {
  const botao = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!botao || !links) return;

  botao.addEventListener('click', () => {
    const aberto = links.classList.toggle('aberto');
    botao.setAttribute('aria-expanded', String(aberto));
  });
}

function atualizarContadorCarrinho() {
  const contador = document.querySelector('.contador-carrinho');
  if (!contador) return;
  const carrinho = RN.lerJSON(RN.CHAVES.CARRINHO, []);
  const total = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
  contador.textContent = total;
  contador.style.display = total > 0 ? 'flex' : 'none';
}

function ativarAreaDoUsuario() {
  const area = document.querySelector('[data-area-usuario]');
  if (!area) return;

  const raiz = document.body.dataset.raiz || '';
  const usuario = RN.usuarioAtual();
  if (usuario) {
    area.innerHTML = `
      <a href="${raiz}pages/perfil.html" title="Meu perfil" aria-label="Meu perfil">👤 ${usuario.nome.split(' ')[0]}</a>
      <a href="#" data-sair title="Sair">Sair</a>
    `;
    area.querySelector('[data-sair]').addEventListener('click', (ev) => {
      ev.preventDefault();
      localStorage.removeItem(RN.CHAVES.USUARIO);
      window.location.reload();
    });
  } else {
    area.innerHTML = `<a href="${raiz}pages/login.html">Entrar</a>`;
  }
}

/* Requisito: visualização de cardápio dinâmico por unidade.
   Mostra a unidade atual em qualquer página que tenha o marcador
   [data-area-unidade] e permite trocar a unidade — o cardápio e o
   totem passam a refletir apenas os itens/preços daquela unidade. */
function ativarSeletorDeUnidade() {
  const area = document.querySelector('[data-area-unidade]');
  if (!area) return;

  const atualId = RN.unidadeAtual();
  area.innerHTML = `
    <label class="seletor-unidade">
      <span aria-hidden="true">📍</span>
      <select data-select-unidade aria-label="Escolher unidade">
        ${RN.UNIDADES.map((u) => `<option value="${u.id}" ${u.id === atualId ? 'selected' : ''}>${u.nome}</option>`).join('')}
      </select>
    </label>
  `;

  area.querySelector('[data-select-unidade]').addEventListener('change', (ev) => {
    RN.definirUnidade(ev.target.value);
    window.dispatchEvent(new CustomEvent('rn:unidade-alterada', { detail: { unidade: ev.target.value } }));
    // Recarrega para que páginas sem escuta dinâmica também atualizem o cardápio.
    window.location.reload();
  });
}

/* Exige login em páginas restritas (chamar no <script> da página). */
function exigirLogin(destinoLogin = 'login.html') {
  if (!RN.estaLogado()) {
    window.location.href = destinoLogin;
  }
}

/* Exige perfil de administrador. */
function exigirAdmin(destino = 'login.html') {
  const usuario = RN.usuarioAtual();
  if (!usuario || usuario.perfil !== 'admin') {
    window.location.href = destino;
  }
}

/* Exige qualquer perfil interno da operação (admin/gerente, atendente
   ou cozinha) — usado pelo painel interno, que serve aos três atores
   com permissões distintas dentro da mesma tela. */
function exigirEquipeInterna(destino = 'login.html') {
  const usuario = RN.usuarioAtual();
  const perfisPermitidos = ['admin', 'atendente', 'cozinha'];
  if (!usuario || !perfisPermitidos.includes(usuario.perfil)) {
    window.location.href = destino;
  }
}

/* ---------------- LGPD: aviso de privacidade ----------------
   Exibe um banner fixo, na primeira visita, informando o uso de
   dados (localStorage) e pedindo o consentimento do usuário, com
   link para a Política de Privacidade completa. */
function ativarAvisoLGPD() {
  if (RN.temConsentimentoLGPD()) return;
  if (document.querySelector('[data-lgpd-banner]')) return;

  const raiz = document.body.dataset.raiz || '';
  const banner = document.createElement('div');
  banner.className = 'lgpd-banner';
  banner.setAttribute('data-lgpd-banner', '');
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Aviso de privacidade');
  banner.innerHTML = `
    <p>
      Usamos armazenamento local do navegador para lembrar seu carrinho, login e pontos de fidelidade.
      Ao continuar navegando, você concorda com nossa
      <a href="${raiz}privacidade.html">Política de Privacidade</a>, conforme a LGPD.
    </p>
    <div class="lgpd-banner-acoes">
      <button type="button" class="btn btn-primario" data-lgpd-aceitar>Aceitar e continuar</button>
    </div>
  `;
  document.body.appendChild(banner);

  banner.querySelector('[data-lgpd-aceitar]').addEventListener('click', () => {
    RN.registrarConsentimentoLGPD('banner');
    banner.remove();
  });
}
