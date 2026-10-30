# tazthedoctor-site
Página de artista de TazTheDoctor (Thales Reiser Pedreira), o ninja dos beats: produção
musical, mixagem, guitarra e baixo em gravações, ensaios e shows, com foco em estúdio.
Mesma base técnica do `dev-landing` (site único, conteúdo em JSON).

## Regras
- Astro + Tailwind CSS. Nada de frameworks extras (React, Vue, bibliotecas de UI) sem
  perguntar. Formulário via Web3Forms ou Formspree, sem backend.
- Todo o conteúdo fica em `content/site.json` (validado por `src/lib/schema.ts`) e as
  imagens em `src/assets/site/`. Nenhum texto do site fixo em `src/`.
- Textos em português do Brasil, com personalidade (underground, direto), sem exagero:
  nada de "o melhor", números de seguidores ou plays, shows, parceiros, prêmios, discografia
  ou citações que não existam. `revisao.termos_vetados` reprova os termos no `npm test`.
- Lançamentos: só o que está publicado e verificável no SoundCloud ou no YouTube (título,
  data e link reais). Hoje há uma faixa (em duas versões) e dois Shorts.
- Contato público: só o e-mail `tazthedoctor@gmail.com`. Sem WhatsApp nem telefone.
- Players do SoundCloud e do YouTube só carregam depois do clique (`Player.astro`). Nenhum
  iframe, script ou imagem de terceiros no carregamento da página.
- Fotos: os originais ficam em `fotos-originais/` (fora do Git, via `.git/info/exclude`) e
  nunca são commitados. Só versões tratadas entram em `src/assets/site/`: rotação aplicada,
  recorte, lado maior até 1600 px, sem nenhum metadado (`tests/fotos.test.ts` confere). Antes
  de commitar, confira que nada de `fotos-originais/` está no stage.
- `em_construcao: true` mostra o aviso, as caixas "A completar" e marca `noindex`. Só passe
  para `false` com a chave do formulário e sem itens em `a_completar`; o schema reprova.
- Acessível (rótulos, contraste AA em todos os pares do teste, foco visível, `alt`
  descritivo) e responsivo (legível a 360 px). Animações respeitam `prefers-reduced-motion`
  e o conteúdo aparece sem JS. Meta: 95+ no Lighthouse mobile.
- Rode `npm run check`, `npm test` e `npm run build` antes de dizer que terminou.
- Nunca commitar `.env`, credenciais ou dados pessoais além do que já é público.
- Deploy só pelo GitHub Actions (Cloudflare Pages, projeto `tazthedoctor`). O token existe
  apenas como secret do repositório (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`);
  nunca peça, imprima ou grave o valor.
- CI enxuto: um job de build (mais o `ci-ok`), sem matrizes nem jobs extras.
- Commits, branches e PRs em inglês (Conventional Commits), sem atribuição a IA.

## Comandos
- `npm run dev`
- `npm run build`
- `npm run check`
- `npm test`
- `npx astro preview --port 4381` (parar com `npx astro preview stop`)
