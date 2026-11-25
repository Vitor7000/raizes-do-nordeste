/* =========================================================
   RAÍZES DO NORDESTE — dados.js
   Fonte única de dados: unidades, cardápio por unidade,
   promoções, chaves de storage e helpers compartilhados por
   todas as páginas do site.
   ========================================================= */

const RN = (function () {
  const CHAVES = {
    CARRINHO: 'rn_carrinho',
    USUARIO: 'rn_usuario_logado',
    USUARIOS: 'rn_usuarios',
    PEDIDOS: 'rn_pedidos',
    FIDELIDADE: 'rn_pontos_fidelidade',
    UNIDADE: 'rn_unidade_selecionada',
    CONSENTIMENTO_LGPD: 'rn_consentimento_lgpd',
    CUPOM: 'rn_cupom_aplicado',
  };

  // ---------------- Unidades (filiais) ----------------
  // Requisito funcional: cardápio dinâmico por unidade. Cada unidade tem
  // seu próprio endereço/horário e pode ter itens exclusivos ou preços
  // diferentes (ver `precoPorUnidade` e `unidades` em cada prato).
  const UNIDADES = [
    { id: 'recife', nome: 'Recife — Boa Viagem', cidade: 'Recife/PE', endereco: 'Av. Boa Viagem, 1200', horario: '11h às 22h' },
    { id: 'fortaleza', nome: 'Fortaleza — Beira-Mar', cidade: 'Fortaleza/CE', endereco: 'Av. Beira-Mar, 340', horario: '11h30 às 23h' },
    { id: 'salvador', nome: 'Salvador — Pelourinho', cidade: 'Salvador/BA', endereco: 'Largo do Pelourinho, 55', horario: '10h às 22h' },
  ];
  const UNIDADE_PADRAO = 'recife';

  // ---------------- Cardápio ----------------
  // `unidades`: lista de ids de unidades onde o prato está disponível.
  // `precoPorUnidade`: sobrescreve o preço-base para unidades específicas
  // (ex.: itens regionais custam menos na própria região de origem).
  const CARDAPIO = [
    { id: 1, categoria: 'pratos', nome: 'Baião de Dois', desc: 'Arroz, feijão-de-corda, queijo coalho e carne-seca desfiada.', preco: 34.9, emoji: '🍚', unidades: ['recife', 'fortaleza', 'salvador'] },
    { id: 2, categoria: 'pratos', nome: 'Carne de Sol na Nata', desc: 'Carne de sol grelhada com nata de leite, macaxeira frita e vinagrete.', preco: 42.5, emoji: '🥩', unidades: ['recife', 'fortaleza', 'salvador'], precoPorUnidade: { fortaleza: 39.9 } },
    { id: 3, categoria: 'pratos', nome: 'Escondidinho de Charque', desc: 'Purê de macaxeira gratinado com charque desfiado.', preco: 36.0, emoji: '🍲', unidades: ['recife', 'salvador'] },
    { id: 4, categoria: 'pratos', nome: 'Galinha de Capoeira ao Molho Pardo', desc: 'Galinha caipira cozida lentamente com molho encorpado.', preco: 39.9, emoji: '🍗', unidades: ['recife', 'fortaleza', 'salvador'] },
    { id: 5, categoria: 'bebidas', nome: 'Suco de Cajá', desc: 'Polpa de cajá batida na hora com água ou leite.', preco: 9.5, emoji: '🥭', unidades: ['recife', 'fortaleza', 'salvador'] },
    { id: 6, categoria: 'bebidas', nome: 'Cajuína Gelada', desc: 'Refrigerante natural de caju, tradição do Piauí e Ceará.', preco: 8.0, emoji: '🧃', unidades: ['fortaleza', 'recife'] },
    { id: 7, categoria: 'bebidas', nome: 'Café de Coador com Rapadura', desc: 'Café coado na hora, adoçado com rapadura.', preco: 6.5, emoji: '☕', unidades: ['recife', 'fortaleza', 'salvador'] },
    { id: 8, categoria: 'sobremesas', nome: 'Cartola', desc: 'Banana frita, queijo coalho derretido, canela e açúcar.', preco: 18.0, emoji: '🍌', unidades: ['recife', 'fortaleza', 'salvador'] },
    { id: 9, categoria: 'sobremesas', nome: 'Bolo de Rolo', desc: 'Massa fina enrolada com goiabada cremosa, receita pernambucana.', preco: 14.0, emoji: '🍰', unidades: ['recife'], precoPorUnidade: { recife: 12.5 } },
    { id: 10, categoria: 'sobremesas', nome: 'Doce de Leite com Queijo Coalho', desc: 'Clássica dupla nordestina, servida em taça.', preco: 16.5, emoji: '🍮', unidades: ['recife', 'fortaleza', 'salvador'] },
    { id: 11, categoria: 'lanches', nome: 'Tapioca de Carne de Sol', desc: 'Goma de tapioca recheada com carne de sol e queijo coalho.', preco: 22.0, emoji: '🌮', unidades: ['recife', 'fortaleza', 'salvador'] },
    { id: 12, categoria: 'lanches', nome: 'Acarajé', desc: 'Bolinho de feijão-fradinho frito no azeite de dendê, com vatapá.', preco: 17.0, emoji: '🧆', unidades: ['salvador'] },
  ];

  const CATEGORIAS = [
    { id: 'todos', nome: 'Todos' },
    { id: 'pratos', nome: 'Pratos' },
    { id: 'lanches', nome: 'Lanches' },
    { id: 'bebidas', nome: 'Bebidas' },
    { id: 'sobremesas', nome: 'Sobremesas' },
  ];

  // ---------------- Promoções e campanhas ----------------
  const PROMOCOES = [
    {
      id: 'combo-nordestino',
      titulo: 'Combo Nordestino',
      descricao: 'Baião de Dois + Suco de Cajá com 10% de desconto no pedido.',
      tipo: 'destaque',
      ativa: true,
      unidades: ['recife', 'fortaleza', 'salvador'],
    },
    {
      id: 'chegada',
      titulo: 'Bem-vindo(a) de volta',
      descricao: 'Use o cupom RAIZES10 e ganhe 10% de desconto no carrinho.',
      tipo: 'cupom',
      codigo: 'RAIZES10',
      percentual: 10,
      ativa: true,
      unidades: ['recife', 'fortaleza', 'salvador'],
    },
    {
      id: 'fidelidade-bonus',
      titulo: 'Ponto em dobro no Clube Raízes',
      descricao: 'Clientes cadastrados ganham pontos em dobro em pedidos acima de R$ 60.',
      tipo: 'destaque',
      ativa: true,
      unidades: ['recife', 'fortaleza', 'salvador'],
    },
  ];

  function promocoesAtivas(unidadeId) {
    return PROMOCOES.filter((p) => p.ativa && (!unidadeId || p.unidades.includes(unidadeId)));
  }

  function buscarPromocaoPorCupom(codigo) {
    if (!codigo) return null;
    const alvo = codigo.trim().toUpperCase();
    return PROMOCOES.find((p) => p.tipo === 'cupom' && p.ativa && p.codigo === alvo) || null;
  }

  // ---------------- Helpers de armazenamento ----------------
  function lerJSON(chave, valorPadrao) {
    try {
      const bruto = localStorage.getItem(chave);
      return bruto ? JSON.parse(bruto) : valorPadrao;
    } catch (e) {
      console.error('Erro ao ler', chave, e);
      return valorPadrao;
    }
  }

  function salvarJSON(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
  }

  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function gerarId(prefixo) {
    return `${prefixo}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
  }

  function buscarPratoPorId(id) {
    return CARDAPIO.find((p) => p.id === Number(id));
  }

  // ---------------- Unidades: helpers ----------------
  function buscarUnidadePorId(id) {
    return UNIDADES.find((u) => u.id === id) || null;
  }

  function unidadeAtual() {
    const salva = lerJSON(CHAVES.UNIDADE, null);
    return buscarUnidadePorId(salva) ? salva : UNIDADE_PADRAO;
  }

  function definirUnidade(id) {
    if (!buscarUnidadePorId(id)) return false;
    salvarJSON(CHAVES.UNIDADE, id);
    return true;
  }

  function itensDisponiveisNaUnidade(unidadeId) {
    const alvo = unidadeId || unidadeAtual();
    return CARDAPIO.filter((prato) => prato.unidades.includes(alvo)).map((prato) => ({
      ...prato,
      preco: (prato.precoPorUnidade && prato.precoPorUnidade[alvo]) || prato.preco,
    }));
  }

  function precoNaUnidade(prato, unidadeId) {
    const alvo = unidadeId || unidadeAtual();
    return (prato.precoPorUnidade && prato.precoPorUnidade[alvo]) || prato.preco;
  }

  function usuarioAtual() {
    return lerJSON(CHAVES.USUARIO, null);
  }

  function estaLogado() {
    return !!usuarioAtual();
  }

  // ---------------- LGPD / privacidade ----------------
  function temConsentimentoLGPD() {
    return !!lerJSON(CHAVES.CONSENTIMENTO_LGPD, null);
  }

  function registrarConsentimentoLGPD(origem = 'banner') {
    salvarJSON(CHAVES.CONSENTIMENTO_LGPD, { aceito: true, origem, em: new Date().toISOString() });
  }

  return {
    CHAVES,
    UNIDADES,
    UNIDADE_PADRAO,
    CARDAPIO,
    CATEGORIAS,
    PROMOCOES,
    promocoesAtivas,
    buscarPromocaoPorCupom,
    lerJSON,
    salvarJSON,
    formatarMoeda,
    gerarId,
    buscarPratoPorId,
    buscarUnidadePorId,
    unidadeAtual,
    definirUnidade,
    itensDisponiveisNaUnidade,
    precoNaUnidade,
    usuarioAtual,
    estaLogado,
    temConsentimentoLGPD,
    registrarConsentimentoLGPD,
  };
})();
