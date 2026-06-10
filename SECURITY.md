# Política de Segurança

Este é um projeto pessoal/hobby (PWA de briefing de RPG). Ainda assim, levamos
relatos de segurança a sério.

## Como reportar uma vulnerabilidade

**Não** abra uma issue pública para vulnerabilidades.

Use o canal privado do GitHub: aba **Security → Report a vulnerability**
(Private vulnerability reporting) deste repositório. Como alternativa, envie um
e-mail para **web@icl.com.br** com:

- descrição da vulnerabilidade e impacto;
- passos para reproduzir;
- versão/commit afetado.

Procuramos responder em até alguns dias. Após a correção, podemos creditar quem
reportou, se desejar.

## Escopo

- O app roda inteiramente no navegador; dados de campanha ficam em `localStorage`
  (e, no deploy demo do GitHub Pages, são fictícios).
- A importação de fichas do D&D Beyond ocorre via função serverless (no deploy
  privado), sem armazenar credenciais.

Relatos sobre dependências de terceiros também são bem-vindos — o repositório usa
Dependabot, CodeQL e dependency-review para reduzir essa superfície.
