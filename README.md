# tazthedoctor-site

Página de artista de **TazTheDoctor** (Thales Reiser Pedreira), o ninja dos beats:
produtor musical, mixagem, guitarra e baixo em gravações, ensaios e shows. Cria da Vila Nova,
Porto Alegre/RS.

Feita em **Astro + Tailwind CSS**, na mesma base do site de dev: todo o conteúdo fica em um
arquivo JSON validado, as fotos são otimizadas no build e o deploy é na Cloudflare Pages.

## Antes de publicar de verdade

O site sai com o aviso "Site em construção" (mais `noindex`). Falta:

| O quê | Onde | Hoje |
| --- | --- | --- |
| Chave do formulário (Web3Forms ou Formspree) | `secoes` › `contato` › `chave` | vazia: modo de demonstração, nada é enviado (o e-mail funciona) |
| Próximos lançamentos | `secoes` › `musica` › `itens` (e apagar o item de `a_completar`) | uma faixa do SoundCloud e dois Shorts do YouTube |

Depois, troque `"em_construcao": true` por `false`. O schema **reprova o build** se o
e-mail for provisório (`@example.com`), se o formulário estiver ativo sem chave (preencha a
chave ou desligue a seção com `"ativo": false`) ou se ainda houver itens em `a_completar`.
Enquanto `em_construcao` for `true`, cada `a_completar` aparece na página como uma caixa
tracejada "A completar".

## Como rodar

Requer Node.js 24 (veja `.nvmrc`).

```bash
npm install
npm run dev       # servidor local em http://localhost:4321
npm run build     # site estático em dist/
npm run check     # tipos e templates
npm test          # schema, contraste, termos vetados, SEO, fotos sem metadados
npx astro preview --port 4381   # serve dist/; pare com: npx astro preview stop
```

## Estrutura

```
content/
├── site.json                  # todo o conteúdo do site
└── politica-de-privacidade.md # texto da página /politica-de-privacidade
src/
├── components/   # Hero, Servicos, Musica + Player, Sobre, Equipamento, Plataformas,
│                 # Contato, Rodape, Revelar, AvisoCookies, ACompletar, ...
├── layouts/Base.astro  # head, tema, aviso "em construção", cabeçalho
├── lib/          # schema (Zod), SEO e JSON-LD, players, imagem de compartilhamento, contraste
├── assets/site/  # fotos já tratadas (otimizadas de novo no build)
└── pages/        # index, política de privacidade, 404, og.png e robots.txt
tests/            # node --test
```

## Editar o conteúdo

Tudo fica em `content/site.json`, validado por `src/lib/schema.ts`: um erro de digitação
falha o build com o caminho do campo.

| Chave | Conteúdo |
| --- | --- |
| `em_construcao` | `true` mostra o aviso, as caixas "A completar" e marca as páginas `noindex` |
| `site` | nome, título e descrição (SEO, até 170 caracteres), `url` de produção |
| `artista` | nome artístico, nome, apelido, bairro, cidade, UF, ano, gêneros e perfis (JSON-LD) |
| `tema` | cores (incluindo `cor_spray`), fontes (`fonte_titulo`, `fonte_texto`, `fonte_tag`, `fonte_tinta`; Google Fonts servidas pelo próprio site) e `animacoes` (`sutil` ou `nenhuma`) |
| `contato` | e-mail público e o assunto que já vem preenchido no `mailto:` |
| `rastreamento` | `google_analytics` e `meta_pixel`, opcionais; com um deles aparece o aviso de cookies (LGPD) |
| `revisao.termos_vetados` | palavras que os textos nunca podem usar (exageros, números, "discografia"); o `npm test` reprova |
| `secoes` | lista ordenada das seções; a ordem do JSON é a ordem da página |

Tipos de seção: `hero`, `servicos`, `musica`, `sobre`, `equipamento`, `plataformas`,
`contato` e `rodape`. Todas aceitam `id` (âncora), `menu` (link no cabeçalho), `ativo: false`
(esconde sem apagar) e `fundo` (`palco`, `superficie` ou `creme`; sem ele, os dois fundos
escuros se alternam).

As faixas rolantes vêm do JSON: `hero.faixa` (palavras da faixa abaixo do hero) e
`contato.faixa` (a chamada da faixa que fecha o contato, ao lado de `contato.email`). Elas só
repetem o que já está na página, então ficam escondidas dos leitores de tela.

### Lançamentos (`musica.itens`)

Só entra o que está publicado. Cada item tem `titulo`, `formato` ("Faixa", "Vídeo curto"),
`data` (`AAAA-MM-DD`), `url` (https) e, conforme a `plataforma`:

- `soundcloud`: `faixa_id`, o número da faixa. Pegue em
  `https://soundcloud.com/oembed?format=json&url=<link da faixa>` (está no `src` do iframe,
  depois de `tracks%2F`).
- `youtube`: `video_id` (os 11 caracteres do link) e `vertical: true` para Shorts.

Os players **não carregam nada antes do clique**: a página mostra uma capa gerada (sem imagem
de terceiros) que é um link para a plataforma; com JavaScript, o clique troca a capa pelo
player do SoundCloud ou do YouTube (`youtube-nocookie.com`).

### Fotos

Os originais ficam em `fotos-originais/`, que **nunca vai para o Git** (está em
`.git/info/exclude`). Só versões tratadas entram em `src/assets/site/`:

1. aplique a rotação do EXIF e recorte no formato do lugar (hero 3:4, Sobre e Equipamento 4:5,
   redes 1:1);
2. limite o lado maior a 1600 px e salve em JPEG ou WebP de boa qualidade;
3. remova **todos** os metadados (EXIF, XMP, IPTC, ICC). Com o sharp, basta não usar
   `withMetadata()`:

   ```js
   await sharp('fotos-originais/foto.jpg').rotate().resize(1280, 1600).jpeg({ quality: 84, mozjpeg: true }).toFile('src/assets/site/foto.jpg');
   ```

4. aponte no JSON com um `alt` descritivo: `{ "src": "foto.jpg", "alt": "..." }`.

`tests/fotos.test.ts` reprova qualquer foto em `src/assets/site/` com EXIF, XMP, IPTC, ICC,
rotação pendente ou lado maior acima de 1600 px. Arquivos HEIC do iPhone precisam ser
convertidos para JPEG antes (o sharp desta máquina não lê HEIC).

### Identidade visual

A paleta saiu das próprias fotos (cores dominantes extraídas com o sharp): fundo de palco
quase preto `#15110A` e superfície `#272012` (borda escura do sunburst), texto creme `#F0E4D2`
(luz do estúdio), âmbar `#D1932B` (o sunburst da Les Paul) nos botões, laranja `#F9702F`
(visor dos pedais Zoom) e verde-água `#ADE3BB` (luz do estúdio) nos destaques, e uma faixa creme
nas redes, mais um laranja spray `#FF6A1A`, um pouco mais saturado, para a tinta, as faixas e
os adesivos. Títulos em Anton, texto em Manrope; o nome no hero mistura a pichação da Sedgwick
Ave Display ("TheDoctor") com a tinta escorrendo da Rubik Wet Paint ("Taz").
`tests/contraste.test.ts` confere 4,5:1 (WCAG AA) em todos os pares usados, inclusive sobre o
brilho âmbar, o grão, a faixa creme e o laranja spray.

Camada de rua (`global.css`, fim do arquivo): filtro SVG que deixa a borda do nome áspera, grão
de fotocópia, foto do hero em duotone da paleta com fita crepe, adesivo "ninja dos beats",
cartazes lambe-lambe levemente tortos nos trabalhos, medidores de LED, adesivos nas redes e
faixas rolantes. As animações (entrada do hero, revelação "colando o cartaz" ao rolar, glitch
raro no nome, equalizador, faixas, hover, carimbo nos botões) respeitam
`prefers-reduced-motion` e `animacoes: "nenhuma"`, e todo o conteúdo aparece sem JavaScript.

### Formulário

[Web3Forms](https://web3forms.com) (padrão) ou [Formspree](https://formspree.io), sem backend.
Em `chave`, use a access key (Web3Forms) ou o id do formulário (Formspree); as duas são
públicas por natureza. Com `chave` vazia, o formulário não envia nada e indica o e-mail.

## SEO

Gerado no build: título, descrição, `canonical`, Open Graph, `twitter:card`, imagem de
compartilhamento `/og.png` (1200×630, com a foto da guitarra), JSON-LD (`MusicGroup` com as
faixas e `Person`), `sitemap-index.xml` e `robots.txt`. Enquanto `em_construcao` for `true`,
as páginas têm `noindex`.

## Publicação (Cloudflare Pages)

O GitHub Actions (`.github/workflows/ci.yml`) roda em um único job: `check`, `test`, `build` e,
se os secrets existirem, o deploy no projeto **`tazthedoctor`** da Cloudflare Pages:

- **push na `main`:** produção em `https://tazthedoctor.pages.dev`
- **pull request:** prévia por branch, com o link no resumo da execução
- o projeto é criado pela API no primeiro deploy, se ainda não existir
- sem os secrets, o deploy só emite um aviso e o CI continua verde
- `ci-ok` é o check único para usar como obrigatório na `main`

### Configuração (uma vez)

1. Na Cloudflare, em **My Profile › API Tokens › Create Token › Custom token**, crie um token
   com uma única permissão: **Account › Cloudflare Pages › Edit**, restrito à sua conta (pode
   ser o mesmo tipo de token do site de dev).
2. Copie o **Account ID** da página inicial do painel da Cloudflare.
3. Grave os dois como secrets do repositório (o `gh` pede o valor sem exibi-lo):

   ```bash
   gh secret set CLOUDFLARE_API_TOKEN --repo thalesreiser/tazthedoctor-site
   gh secret set CLOUDFLARE_ACCOUNT_ID --repo thalesreiser/tazthedoctor-site
   ```

4. Opcional: domínio próprio em **Workers & Pages › tazthedoctor › Custom domains**, e então
   atualize `site.url`.

Enquanto o repositório for privado, os minutos do Actions são limitados: o CI usa um job de
build e o `ci-ok`, com cache do npm, e o Dependabot roda uma vez por mês.

## Licença

[MIT](LICENSE)
