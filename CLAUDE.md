# CLAUDE.md

Guia de contexto para trabalhar neste repositório com Claude Code. Este arquivo documenta como o projeto **realmente** é construído hoje — não é um padrão aspiracional. Se um Lab existente contradiz uma regra aqui, a regra vence para código **novo**; não retrofit no código antigo sem necessidade.

## 1. Visão geral

Portfólio pessoal (Filipe Louro) construído em Next.js. Tem duas partes bem distintas:

- **Site principal (`/`)**: hero, portfolio/serviços e contato, navegados como abas client-side (não são rotas reais) via `NavProvider` + `AnimatePresence`.
- **Playground/Lab (`/playground/*`)**: uma coleção de experiências visuais interativas independentes ("Labs") — teclado RGB, campo orbital, buraco negro (raymarching WebGL2), chuva Matrix, explosão de texto em partículas, cidade vaporwave e gerador de letreiro neon. Cada Lab é uma demo técnica isolada, sem dependência entre si.

Existe ainda uma terceira área, `/projects/{backend,frontend,saas}`, que simula uma IDE (explorer de arquivos + editor + terminal falsos) para apresentar três projetos fictícios/reais do portfólio. Não é um "Lab" — é conteúdo de apresentação, com estrutura copiada entre os três (ver seção 15).

Ao pedir um "novo Lab", isso significa: uma nova rota em `app/playground/<slug>/`, com card correspondente no índice do Playground.

## 2. Stack real

- **Next.js 16** (App Router), **React 19**, **TypeScript 5** (`strict: true`)
- **Tailwind CSS v4** via `@tailwindcss/postcss` — não existe `tailwind.config.*`, configuração é CSS-first em `app/globals.css`
- **Framer Motion** para transições/animação de UI (não usado dentro de loops de canvas/WebGL)
- **Canvas 2D e WebGL2 puros** (sem Three.js, sem react-three-fiber) — todo Lab gráfico é feito na mão
- **react-hook-form + zod** (`@hookform/resolvers/zod`) — usado no formulário de contato
- **lucide-react** para ícones, **clsx + tailwind-merge** via helper `cn()` em `lib/utils.ts`
- Alias de import: `@/*` aponta para a raiz do projeto (ver `tsconfig.json`)
- Sem framework de testes configurado (nenhum Jest/Vitest/Playwright)

**Gerenciador de pacotes: Yarn Classic (v1)** — o `yarn.lock` está no formato `# yarn lockfile v1`. Nunca use `npm install` neste repo (gera `package-lock.json` duplicado) nem rode `corepack use yarn@stable`/`yarn set version` (migra para Yarn Berry e quebra o lockfile). Use sempre `yarn install` / `yarn add`.

## 3. Estrutura do projeto

```text
app/
├── layout.tsx              # Root layout: fonte Inter, Navbar, NavProvider
├── page.tsx                 # Home: troca de "abas" client-side (não são rotas)
├── globals.css
├── playground/
│   ├── page.tsx              # Índice do Lab (grid de cards -> cada experiência)
│   ├── keyboard/  orbit/  blackhole/  matrix/  explosion/  vaporwave/  neon/
│   │   └── <cada um segue o padrão da seção 5>
├── projects/
│   ├── backend/  frontend/  saas/
│   │   └── page.tsx + _components/{IDE,CodeEditor,FileExplorer,Terminal}.tsx + _data/projectFiles.ts
components/
├── navbar.tsx                # Contém EXPERIMENT_NAMES: mapa slug -> nome exibido no Lab
├── template-wrapper.tsx       # Wrapper de transição (framer-motion) usado por várias páginas
├── providers/nav-provider.tsx # Contexto da aba ativa da Home
├── sections/{hero,services,contact}.tsx
└── ui/spotlight-card.tsx      # Card com spotlight que segue o mouse (usado no índice do Lab)
lib/utils.ts                  # cn() — merge de classes Tailwind
```

## 4. O conceito de Lab

Um Lab é uma experiência visual/interativa **autocontida**: tem sua própria rota, seus próprios componentes/hooks/utils, e não importa nada de outro Lab. Um Lab novo deve:

- ter um propósito claro (uma ideia/efeito, não várias misturadas);
- não alterar nenhum outro Lab existente;
- seguir a linguagem visual do Playground (fundo `bg-slate-950`, cards com `backdrop-blur`, glow por cor de destaque própria do Lab — ver `SpotlightCard`);
- manter toda a lógica de simulação isolada em hooks/utils daquele Lab;
- reutilizar `components/`, `lib/utils.ts` (`cn`) quando fizer sentido, sem forçar reuso onde não há um problema real de duplicação;
- funcionar em diferentes tamanhos de tela (ver seção 12).

### Padrão real observado (não é uniforme, e está tudo bem)

Todos os Labs seguem: **`page.tsx` (Server Component, define `metadata`) → `_components/<Nome>Scene.tsx` ("use client", só refs + JSX + pouco state de UI) → `_hooks/use<Algo>.ts` (toda a lógica imperativa: setup de canvas/WebGL, loop de `requestAnimationFrame`, resize, listeners, cleanup)**.

Variações legítimas que já existem e não devem ser "corrigidas":
- `_utils/` nem sempre existe (ex.: `explosion` não tem — a classe `Particle` mora dentro do próprio hook porque é pequena e só usada ali).
- Alguns Labs têm um componente extra `_components/<Nome>Styles.tsx` com `<style jsx global>` (keyboard, neon, orbit) para CSS que Tailwind não cobre bem (keyframes customizados, `input[type=range]`, `:active`). Outros (blackhole, matrix, explosion, vaporwave) fazem tudo com classes Tailwind inline e não precisam disso.
- Onde há painel de configuração (keyboard, neon, orbit), o estado de config vive em `useState` no nível do Scene/página e é passado para o hook; onde não há UI de configuração (blackhole, matrix, vaporwave), o hook não recebe config nenhuma.

Regra prática: **estado React (`useState`) só para valores que precisam re-renderizar JSX** (cor escolhida, texto, painel aberto/fechado). **Tudo que muda a cada frame do loop de animação vive em `useRef`**, nunca em `useState` — evita re-render a 60fps.

## 5. Arquitetura recomendada para um novo Lab

```text
app/playground/<lab>/
├── page.tsx          # Server Component. Só `metadata` + monta o Scene. Sem lógica.
├── _components/
│   └── <Nome>Scene.tsx   # "use client". Refs do canvas/container + JSX de overlay/controles.
├── _hooks/
│   └── use<Nome>.ts      # Toda a lógica: setup, loop de animação, resize, cleanup.
└── _utils/                # Opcional: só crie se houver algo puro/reutilizável de fato
    ├── types.ts              # Tipos/interfaces do domínio do Lab
    └── constants.ts          # Constantes, geradores de dados, shaders GLSL, etc.
```

- **`page.tsx`**: composição da rota (metadata, layout mínimo). Nunca deve concentrar lógica de simulação.
- **`_components`**: JSX + refs. Pode ter subcomponentes de UI (paineis de controle, HUD) quando o Scene principal ficaria grande demais.
- **`_hooks`**: onde vive o `useEffect` com o loop de renderização, listeners de mouse/touch/teclado/resize, e o cleanup.
- **`_utils`**: funções puras, tipos, constantes e — quando for o caso — shaders GLSL como template strings (ver `blackhole/_utils/shaders.ts`).

Se o Lab precisar de algo diferente disso, não force a estrutura — o padrão é uma orientação, não uma regra cega.

### Checklist ao criar um Lab novo

Além da pasta em si, dois arquivos compartilhados precisam ser tocados:

1. **`app/playground/page.tsx`**: adicionar um `<SpotlightCard>` novo dentro do grid, com ícone `lucide-react`, cor de destaque própria (ex.: `hover:border-<cor>-500/50`) e link para a nova rota.
2. **`components/navbar.tsx`**: adicionar a entrada no objeto `EXPERIMENT_NAMES` (slug → nome exibido no breadcrumb do Lab).

## 6. Regra mais importante — código para humanos lerem

> O código deve ser escrito para ser facilmente compreendido por um desenvolvedor humano, não para parecer impressionante.

- nomes claros e específicos (nunca `processData`, `handleThing`, `doSomething`);
- funções e componentes com uma responsabilidade clara cada;
- fluxo lógico fácil de seguir lendo de cima para baixo;
- abstrações só quando agregam valor real — três linhas parecidas são melhores que uma abstração prematura;
- evite componentes/funções gigantes: se um Scene está fazendo setup de canvas, física e UI de controles tudo junto, é sinal de que a física deveria estar no hook.

**Clareza > esperteza. Simplicidade > abstração. Manutenibilidade > quantidade de código.**

## 7. Regra de comentários

**Por padrão, não escreva comentários.** Nomes bons, funções pequenas e estrutura clara substituem comentários que só descrevem "o que" o código faz (`// atualiza o estado`, `// cria o componente`).

Um comentário só se justifica quando explica um **porquê** que não dá para deduzir lendo o código:
- um workaround por comportamento estranho de uma API do browser;
- uma decisão matemática/física não óbvia (ex.: por que uma constante de gravidade tem aquele valor);
- uma limitação específica de WebGL/Canvas;
- o motivo de uma decisão que poderia parecer errada sem contexto.

Mesmo nesses casos, o comentário explica o *porquê*, nunca repete o *o quê*.

> Nota: vários arquivos existentes (ex.: `shaders.ts`, `use-explosion.ts`) têm comentários explicativos em pt-br, alguns "o quê" e alguns "por quê". Isso é dívida existente — não precisa ser removido, mas código **novo** segue a regra acima.

## 8. Evitar "código de IA"

- não crie abstrações só para parecer sofisticado;
- não crie dezenas de helpers para operações usadas uma única vez;
- não crie interfaces/tipos para objetos que só existem em um lugar sem necessidade real;
- não transforme uma operação simples em múltiplas camadas de indireção;
- não crie arquivos novos só para separar poucas linhas — olhe o padrão real da seção 4 (ex.: `explosion` não tem `_utils/` porque não precisa).

Escreva código que alguém consiga abrir daqui a seis meses e entender sem arqueologia.

## 9. TypeScript

- `strict: true` já está ativo — não enfraqueça isso;
- evite `any`; se precisar de um escape hatch, prefira `unknown` + narrowing;
- evite casts (`as`) desnecessários — geralmente indicam um tipo mal desenhado;
- tipos/interfaces só onde ajudam a entender o domínio (veja `_utils/types.ts` nos Labs existentes: `OrbitConfig`, `RGBConfig`, `Building`, etc.) — não crie um `type` para cada primitivo.

## 10. React / Next.js

- Siga o padrão existente: `page.tsx` como Server Component sempre que possível (só `metadata` + composição); `"use client"` no Scene e nos hooks que tocam `canvas`, `window`, `document`, eventos ou WebGL.
- Não adicione `"use client"` a um componente que não precisa de estado, efeitos ou APIs de browser.
- Cuidado com SSR: qualquer acesso a `window`/`document`/`navigator` tem que estar dentro de `useEffect` ou atrás de um guard (`typeof window !== 'undefined'`), nunca no corpo do componente.

## 11. Performance

O Playground é a vitrine técnica do portfólio — performance é parte do produto, não um detalhe.

- evite causar re-render de React a cada frame (ver regra `useRef` vs `useState` na seção 4);
- evite alocar objetos novos dentro do loop de animação quando dá para reaproveitar;
- sempre `cancelAnimationFrame` no cleanup do `useEffect`;
- sempre remova listeners (`resize`, `mousemove`, `keydown`, etc.) no cleanup;
- capar `devicePixelRatio` em mobile (o padrão do projeto é `Math.min(window.devicePixelRatio, 1 a 1.5)`, e algo mais agressivo em telas < 768px — ver `blackhole` e `matrix`);
- reduzir densidade/contagem de partículas em telas pequenas (`window.innerWidth < 768` já é o critério usado em vários Labs);
- preferir canvas offscreen para conteúdo estático que não muda por frame (ver `vaporwave`, que pré-renderiza a cidade num canvas separado).

## 12. WebGL / Canvas

- Shaders GLSL ficam em `_utils/shaders.ts` como template strings exportadas (`vertexShaderSource`, `fragmentShaderSource`) — nunca inline dentro do componente/JSX.
- Toda lógica de renderização (setup do contexto, compilação de shader, loop, resize) fica no hook, nunca no componente React — o componente só segura os refs.
- Sempre tratar resize explicitamente: recalcular `canvas.width/height` e `gl.viewport`/`ctx.scale` — nunca assumir que o canvas herda o tamanho do CSS automaticamente.
- Sempre liberar recursos no cleanup: `gl.deleteProgram`, `deleteShader`, `deleteBuffer`, `deleteVertexArray` para WebGL; para Canvas 2D, remover listeners é suficiente (não há recursos de GPU para liberar).
- Manter o React fora do loop de render: nenhum `setState` dentro de `requestAnimationFrame`, a menos que seja algo que realmente precisa virar UI (ex.: um contador visível).

## 13. Dependências

Antes de instalar qualquer pacote novo:

1. verifique o `package.json` — talvez já exista algo que resolve;
2. verifique se uma API nativa do browser (Canvas, WebGL, `IntersectionObserver`, etc.) já resolve sem lib;
3. considere o impacto no bundle de uma página que já é pesada em gráficos;
4. **`gl-matrix` já está no `package.json` mas não é importado em lugar nenhum do código atual** — antes de adicionar matemática vetorial nova, verifique se faz sentido finalmente usá-la em vez de instalar outra lib equivalente.

Se uma dependência nova for realmente necessária, explique no resultado final: qual, por quê, o que ela resolve, e por que uma alternativa existente não serve.

## 14. Design

Novos Labs devem parecer parte do mesmo Playground, mas não são obrigados a copiar o layout de outro Lab pixel a pixel:

- fundo escuro (`bg-slate-950`/preto), tipografia via fonte `Inter` global;
- cards com `border-white/10`, `bg-white/5` ou similar, `backdrop-blur`, cantos arredondados (`rounded-xl`/`rounded-2xl`) — ver `SpotlightCard`;
- cada Lab tem sua própria cor de destaque (cyan no keyboard, laranja no blackhole, verde no matrix, etc.) usada em bordas de hover, glow e textos de ação;
- overlays de texto/HUD usam `pointer-events-none` onde não são interativos, e `mix-blend-*`/`drop-shadow` para efeitos de leitura sobre a cena.

## 15. Acessibilidade e responsividade

- inputs e botões de controle devem ter `aria-label` quando não há texto visível (ver `exploding-canvas.tsx`);
- controles (sliders, botões de cor) devem funcionar por teclado e touch, não só mouse;
- toda cena com canvas/WebGL precisa responder a resize (listener de `resize`, sem assumir uma resolução fixa) e reduzir carga em mobile (ver seção 11);
- a experiência visual (animação constante) não deve ser o único jeito de entender o que o Lab faz — títulos/legendas em texto sempre presentes.

## 16. Processo de trabalho

**Antes de implementar:**
1. Entender exatamente o que foi pedido.
2. Ler o código relacionado (Lab parecido, componente compartilhado).
3. Procurar se já existe algo no projeto que resolve parte do problema.
4. Planejar a mudança (arquivos a criar/tocar) antes de escrever código.

**Durante:**
- mudanças pequenas e coerentes com o que foi pedido;
- não fazer refatoração não solicitada em código vizinho;
- não adicionar comentários desnecessários;
- preservar o comportamento e o visual dos Labs existentes.

**Depois, antes de considerar concluído:**
- `yarn lint` (ESLint via `eslint-config-next`);
- `tsc --noEmit` (ou o check que o `next build` já faz) para erros de tipo;
- `yarn build` para garantir que a rota compila;
- abrir a rota no navegador e testar o caminho feliz e casos de borda, olhar o console por erros;
- testar em desktop e, se aplicável, em uma viewport mobile;
- conferir que o cleanup do `useEffect` realmente roda (sem leak ao navegar para fora e voltar);
- conferir que nenhum Lab existente quebrou.

## 17. Git

Não faça commit nem crie branch automaticamente — isso é feito manualmente. Quando fizer sentido registrar boas práticas para quem (ou qual sessão) for commitar depois:
- mudanças focadas (um Lab ou uma correção por commit, não misture os dois);
- mensagens de commit claras e no imperativo, descrevendo o quê e não "vários ajustes";
- não misturar refatoração com feature na mesma mudança sem necessidade.

## 18. Débitos técnicos conhecidos (não corrigir sem pedir)

Registrados aqui para não serem confundidos com bugs a corrigir de surpresa numa tarefa não relacionada:

- `gl-matrix` está instalado mas não é usado em nenhum arquivo.
- `app/globals.css` ainda referencia `--font-geist-sans`/`--font-geist-mono` (sobra do boilerplate do `create-next-app`), mas o projeto usa a fonte `Inter` via `next/font/google` em `app/layout.tsx` — essas variáveis não têm efeito.
- `app/projects/{backend,frontend,saas}` têm `IDE.tsx`, `CodeEditor.tsx`, `FileExplorer.tsx`, `Terminal.tsx` praticamente duplicados entre os três, com pequenas diferenças de conteúdo/cor por projeto — duplicação intencional até aqui, não um Lab, não mexer a menos que peçam para unificar.
- O `README.md` na raiz ainda é o boilerplate padrão do `create-next-app`, sem nada específico deste projeto.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
