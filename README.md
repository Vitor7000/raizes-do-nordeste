# Raízes do Nordeste

Protótipo front-end de uma rede de restaurantes nordestinos. O projeto demonstra a navegação pelo cardápio, a montagem de pedidos e as interfaces para clientes e equipe.

## Acessos

- **Site publicado:** https://vitor7000.github.io/raizes-do-nordeste/
- **Repositório:** https://github.com/Vitor7000/raizes-do-nordeste
- **Entrar:** https://vitor7000.github.io/raizes-do-nordeste/entrar/

## Funcionalidades

- Cardápio e preços filtrados por unidade (Recife, Fortaleza e Salvador).
- Cadastro e login de clientes, com página de perfil, pedidos e pontos de fidelidade.
- Carrinho com cupom promocional `RAIZES10`.
- Fluxo de pagamento demonstrativo e acompanhamento de status do pedido.
- Painel interno com visões para gerente/administrador, atendente e cozinha.
- Modo totem de autoatendimento, com unidade configurável pela URL, por exemplo `pages/totem.html?unidade=fortaleza`.
- Páginas de cultura, destinos, forró, gastronomia e privacidade.
- Rota `/entrar/` que encaminha para a página de login.

### Contas de demonstração da equipe

| Perfil | E-mail | Senha |
|---|---|---|
| Gerente/Administrador | `admin@raizes.com` | `admin123` |
| Atendente | `atendente@raizes.com` | `atendente123` |
| Cozinha | `cozinha@raizes.com` | `cozinha123` |

Para experimentar o perfil de cliente, crie uma conta pela página **Criar conta** e depois entre com ela.

## Executar localmente

O projeto usa HTML, CSS e JavaScript puros, sem dependências de instalação. Na pasta raiz do repositório, inicie um servidor estático:

```powershell
python -m http.server 8000
```

Abra http://localhost:8000 no navegador. Encerre o servidor com `Ctrl+C`.

## Dados e limitações da demonstração

Os dados de usuários, carrinho, pedidos e fidelidade são mockados e armazenados no `localStorage` do navegador. Não há back-end, autenticação segura entre dispositivos nem processamento real de pagamentos; o pagamento e o avanço de status são simulados para demonstrar os fluxos da interface.

## Estrutura do projeto

```text
assets/       recursos estáticos
css/          estilos e responsividade
documentacao/ documentação de atores e casos de uso
entrar/       rota de entrada
js/           dados e lógica compartilhada da aplicação
pages/        páginas do site
index.html    página inicial
```

Mais detalhes sobre atores, permissões e canais estão em [`documentacao/atores-casos-de-uso.md`](documentacao/atores-casos-de-uso.md). O histórico de correções está em [`CORRECOES.md`](CORRECOES.md).
