# Guild Briefings

Briefings de party estilizados para RPGs de **fantasia** — um dossiê diegético
da companhia de aventureiros, pra mostrar aos jogadores na mesa (tablet/TV).
PWA, React + Vite.

É o equivalente fantasia do conceito de "mission briefings" do Lancer, mas um
projeto próprio (do zero) e voltado a D&D 5e e afins.

> **Inspirado no [Lancer Briefings](https://github.com/Kuenaimaku/lancer-briefings)**
> (Kuenaimaku) — a ideia de um briefing diegético pra mostrar aos jogadores na
> mesa vem de lá. Este projeto é uma releitura própria pra fantasia, escrita do
> zero (não é fork), com import de fichas do D&D Beyond.

## Demo

Página de demonstração no GitHub Pages:
**https://flippelt.github.io/guild-briefings/**

A demo roda em **modo efêmero** (build com `VITE_DEMO=true`): a party fictícia
recarrega a cada acesso e **nada é salvo** — pode mexer à vontade.

## Como funciona

Os personagens entram de duas formas:

1. **Import do D&D Beyond (por link)** — cole o **link do personagem público**
   (ex.: `https://www.dndbeyond.com/characters/123456789`) e o app busca o JSON.
   Extrai nome, raça, classes/nível, atributos (com bônus raciais/feats),
   retrato, história e **PV aproximado**. Fallback: colar o JSON manualmente.
2. **Manual** — formulário pra qualquer sistema, sem depender do DDB.

Tudo persiste no **localStorage** do dispositivo (cada tablet lembra do seu
dossiê). Os campos importados podem ser **editados** no cartaz.

### Como a busca por link funciona (e o D&D Beyond)

O D&D Beyond **não tem API pública oficial**; o endpoint é não-oficial e só
serve personagens **públicos**. O navegador costuma ser bloqueado por **CORS**
ao chamá-lo direto, então a busca tenta, em ordem:

1. **direto** (caso o endpoint permita CORS);
2. **`/.netlify/functions/ddb-character`** — uma *Netlify Function* (proxy
   server-side, mesma origem do app → sem CORS, sem terceiros). É o caminho
   limpo no deploy de Netlify (ex.: o deploy privado da mesa).
3. um **proxy público de CORS** como último recurso (dev/demo).

> **Importar por link depende do deploy no Netlify.** A *Netlify Function*
> (`netlify/functions/ddb-character.mjs`) é o proxy confiável e sem terceiros —
> o Netlify a detecta automaticamente (pasta `netlify/functions/`), sem
> configuração. No **GitHub Pages** (estático, sem função) o link pode não
> funcionar (depende do DDB liberar CORS ou de um proxy público); ali use o
> fallback de **colar JSON**, que sempre funciona.

Nada é armazenado pelo proxy — ele só repassa o JSON do personagem que o
próprio usuário pediu.

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

## Publicação na mesa (Netlify, opcional)

O app é estático: cada aparelho guarda seu estado no `localStorage` e o seed vem
do `briefing.json`. O auto-refresh **mescla** (não apaga) — adições locais ainda
não publicadas são preservadas.

Para publicar **de um aparelho para todos** (deploy no Netlify), há um backend
opcional em `netlify/functions/` usando **Netlify Blobs**:

- `GET /api/briefing` — devolve o briefing publicado (cai pro estático se vazio).
- `POST /api/publish` — guarda o briefing (header `x-publish-key`).

No painel do Netlify, defina:

| Variável | Onde | Valor |
| --- | --- | --- |
| `VITE_BRIEFING_URL` | build | `/api/briefing` |
| `VITE_PUBLISH_URL` | build | `/api/publish` |
| `PUBLISH_KEY` | runtime (secreta) | uma senha à sua escolha |

Com isso aparecem o botão **Publicar** (abas Quests/Crônicas) e o **sincronizar
com o D&D Beyond** (aba Aventureiros), e importar jogador **auto-publica** (pede
a senha na 1ª vez). Sem essas variáveis (ex.: GitHub Pages), o app fica
só-leitura do estático — sem regressão.

## Licença

Código sob **MIT** (ver [LICENSE](LICENSE)). As fontes em `public/fonts/` são de
terceiros (uso pessoal/não-comercial) e mantêm suas próprias licenças — ver
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

## Aviso

Não afiliado à Wizards of the Coast nem ao D&D Beyond. "D&D" e "D&D Beyond" são
marcas de seus respectivos donos. Esta ferramenta apenas lê dados de
personagens que o próprio usuário cola.
