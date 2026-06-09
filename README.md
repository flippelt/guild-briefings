# Guild Briefings

Briefings de party estilizados para RPGs de **fantasia** — um dossiê diegético
da companhia de aventureiros, pra mostrar aos jogadores na mesa (tablet/TV).
PWA, React + Vite.

É o equivalente fantasia do conceito de "mission briefings" do Lancer, mas um
projeto próprio (do zero) e voltado a D&D 5e e afins.

## Como funciona

Os personagens entram de duas formas:

1. **Import do D&D Beyond (JSON colado)** — abra a ficha **pública** do
   personagem em
   `https://character-service.dndbeyond.com/character/v5/character/<ID>`
   (o `<ID>` está na URL da ficha no D&D Beyond), copie o JSON e cole no painel
   "Importar do D&D Beyond". O parsing extrai nome, raça, classes/nível,
   atributos (com bônus raciais/feats), retrato e **PV aproximado**.
2. **Manual** — formulário pra qualquer sistema, sem depender do DDB.

Tudo persiste no **localStorage** do dispositivo (cada tablet lembra do seu
dossiê). Os campos importados podem ser **editados** no cartão.

### Por que JSON colado (e não busca por ID)?

O D&D Beyond **não tem API pública oficial**. O endpoint usado pela comunidade
é não-oficial, só serve personagens públicos, e o navegador é bloqueado por
CORS de chamá-lo direto. Colar o JSON é **iniciado pelo usuário** (sem
scraping), evita CORS e não depende de servidor. Buscar por ID via proxy é
possível no futuro, mas é mais frágil e área-cinza de ToS.

### Sobre CA

A CA do DDB depende de itens equipados, feats e talentos — calcular fora do app
é pouco confiável. Por isso a CA **não é importada**; preencha no cartão
(botão "editar"). PV é aproximado (base + mod. de CON × nível + bônus) e também
editável.

## Desenvolvimento

```bash
npm install
npm run dev      # servidor de dev
npm run build    # build de produção (tsc + vite)
npm run test     # vitest
```

## Aviso

Não afiliado à Wizards of the Coast nem ao D&D Beyond. "D&D" e "D&D Beyond" são
marcas de seus respectivos donos. Esta ferramenta apenas lê dados de
personagens que o próprio usuário cola.
