# Plano de Melhoria Contínua dos Labs Pré-Existentes

Este documento estabelece o diagnóstico técnico, a arquitetura de evolução e o roteiro de implementação para os **8 experimentos pré-existentes** do laboratório (desenvolvidos antes do ciclo recente de expansão). O objetivo é equalizar esses experimentos ao novo patamar de fidelidade física, síntese visual, conformidade com o **padrão HUD 14.1** e usabilidade escalável.

---

## 1. Visão Geral e Princípios de Arquitetura

Os 5 labs adicionados recentemente (Jelly, Pendulum, Morphogenesis, Sandpile, Physarum) e os 5 novos labs desta iteração (Ferrofluid, Ink, Attractor, Ripples, Galaxy) estabeleceram uma nova régua técnica no repositório:
- **Zero bibliotecas externas 3D**: Canvas 2D ou WebGL 2.0 puro com otimização manual de draw calls e gerenciamento estrito de memória sem GC no render loop.
- **Integração numérica rigorosa**: RK4, Symplectic Leapfrog, Euler semi-implícito, autômatos celulares e EDPs (Equações Diferenciais Parciais) resolvidas em malha discreta.
- **HUD 14.1 Standard**: Divisão em 4 zonas fixas (Z1 Identidade via `LabCaption`, Z2 Ações primárias no topo direito, Z3 Painel de controles deslizantes/presets, Z4 Dica de interação na base central).

Os labs anteriores a esse ciclo apresentam ideias criativas sólidas, mas diferem em consistência de HUD, profundidade de controles e precisão dos motores de simulação. Abaixo está o plano detalhado de melhoria para cada um deles.

---

## 2. Diagnóstico e Roteiro por Experimento

### 2.1 RGB Keyboard Engine (`/playground/keyboard`)
- **Estado Atual**: Teclado 3D em CSS transforms, síntese de oscilador Web Audio básico e seleção de cores RGB.
- **Limitações Identificadas**:
  - Não segue a anatomia HUD 14.1 (falta `LabCaption`, botões soltos na interface).
  - Áudio monótono: ondas senoidais/quadradas simples sem resposta acústica de switches mecânicos.
  - Padrões de luz limitados a presets estáticos.
- **Plano de Melhoria**:
  1. **Motor Acústico de Switches Mecânicos**: Implementar sintetizador de resposta ao impulso em Web Audio para simular diferentes switches mecânicos:
     - *Blue (Clicky)*: Clique tátil duplo em alta frequência (~3.2 kHz) com decaimento curto e ressonância de mola.
     - *Brown (Tactile)*: Bumping tátil com atenuação intermediária e harmônicos graves de carcaça.
     - *Red (Linear)*: Batida profunda (*thock*) de fundo de curso (*bottom-out*) sem clique de ativação.
  2. **Efeitos de Iluminação Dinâmica**:
     - Modo de onda reativa (*reactive ripple*): cada tecla pressionada propaga ondas de fótons no plano do teclado.
     - Modo espectrograma de áudio (se houver microfone ou áudio tocando).
  3. **Suporte a Web MIDI API**: Permitir conexão com teclados musicais e controladores MIDI USB/Bluetooth para digitação física real no canvas.
  4. **Conformidade HUD 14.1**: Migrar para `LabCaption` (Z1), controles modais/gaveta (Z3) e ações rápidas (Z2).

---

### 2.2 Matrix Digital Rain (`/playground/matrix`)
- **Estado Atual**: Chuva 2D clássica de caracteres Katakana caindo por colunas com efeito de parallax simples.
- **Limitações Identificadas**:
  - Falta profundidade volumétrica e iluminação de pós-processamento.
  - Não segue a estrutura HUD 14.1.
- **Plano de Melhoria**:
  1. **Modo Câmera 3D Volumétrica**:
     - Permitir rotação em órbita 3D e travessia pelo meio dos feixes de código (câmera em primeira pessoa que mergulha na torrente digital).
     - Profundidade de campo (*depth-of-field*) via blur proporcional à distância Z.
  2. **Injeção de Mensagem Interativa**:
     - Campo de texto no HUD onde o usuário digita uma palavra e ela é codificada/decodificada em tempo real no fluxo de caracteres.
  3. **Pós-Processamento CRT Shader**:
     - Simulação de tubo de raios catódicos: scanlines horizontais, curvatura de lente esférica (*barrel distortion*), aberração cromática nas bordas e fosforescência P31 verde.
  4. **Conformidade HUD 14.1**: Adicionar `LabCaption` e painel de densidade/velocidade em Z3.

---

### 2.3 Particle Text Physics (`/playground/explosion`)
- **Estado Atual**: Dispersão de partículas por repulsão do mouse e retorno elástico com molas simples.
- **Limitações Identificadas**:
  - Texto fixo no código, sem personalização pelo usuário em tempo real.
  - Física puramente radial e mola de Hooke sem amortecimento configurável.
- **Plano de Melhoria**:
  1. **Editor de Texto em Tempo Real**:
     - Permitir que o visitante digite qualquer texto ou escolha emojis/ícones SVG para conversão dinâmica em nuvem de partículas vetoriais.
  2. **Campos de Força Interativos**:
     - Modo *Vortex*: o cursor gera um redemoinho tangencial rodopiando o texto.
     - Modo *Gravidade*: o texto desaba por gravidade newtoniana colidindo com o chão do canvas.
     - Modo *Onda de Choque*: clique gera uma detonação com estilhaços balísticos e rastro de fumaça.
  3. **Coloração por Dinâmica de Partículas**:
     - Partículas aceleradas mudam de espectro (dourado incandescente em alta velocidade, esfriando para ciano no repouso).
  4. **Conformidade HUD 14.1**: Migrar caption e controles para Z1-Z4.

---

### 2.4 Retro Vaporwave (`/playground/vaporwave`)
- **Estado Atual**: Wireframe de terreno em Canvas 2D com sol e linhas de perspectiva Outrun.
- **Limitações Identificadas**:
  - Render estático em looping de offset, sem física ou interatividade dinâmica rica.
- **Plano de Melhoria**:
  1. **Veículo Synthwave Procedural 3D**:
     - Renderizar modelo wireframe de um carro esportivo estilo anos 80 acelerando pela rodovia infinita.
     - Direção interativa com mouse/teclado, faróis com facho volumétrico iluminando as elevações do terreno.
  2. **Sintetizador Arpeggiator Synthwave em Web Audio**:
     - Linha de baixo synthwave arpejada sincronizada com a velocidade do grid (*BPM escalável*).
     - Bateria 808 procedural com tom reverberaço retro.
  3. **Ciclo Atmosférico e Terrenos Dinâmicos**:
     - Variação procedural de relevo (montanhas de Perlin noise, vales de neon, horizontes com cidades cyberpunk distantes).
     - Ciclo de cores crepúsculo/madrugada em degradê gradiente.
  4. **Conformidade HUD 14.1**: Migrar para `LabCaption` e controles de velocidade/névoa em Z3.

---

### 2.5 Neon Sign Generator (`/playground/neon`)
- **Estado Atual**: Letreiro neon estilizado com SVG filters e efeito de flicker básico.
- **Limitações Identificadas**:
  - Customização limitada e efeitos puramente visuais sem modelagem da física dos gases nobres.
- **Plano de Melhoria**:
  1. **Física da Descarga em Tubos de Gás Rarefeito**:
     - Simulação de gás neon (laranja-avermelhado), argônio/mercúrio (azul claro), hélio (amarelo/rosa) e criptônio (branco luminoso).
     - Falha de eletrodo: oscilação estocástica de centelhamento e segmentos com quebra de vácuo.
     - Síntese de áudio do zumbido elétrico de 60Hz do transformador de alta tensão (*hum* característico de neon).
  2. **Editor Completo de Sinalização**:
     - Múltiplas linhas de texto, seleção de fontes de caligrafia de tubo contínuo, suportes de fixação e fiação realista.
  3. **Efeito de Vidro e Chuva Reflexiva**:
     - Camada de gotas de chuva condensadas em vidro em frente ao letreiro, refratando o brilho das letras.
  4. **Conformidade HUD 14.1**: Atualizar layout para os 4 quadrantes oficiais.

---

### 2.6 Orbital Field Simulator (`/playground/orbit`)
- **Estado Atual**: Partículas orbitando um centro gravitacional usando integração simples de Euler.
- **Limitações Identificadas**:
  - Falha na conservação de energia a longo prazo (órbitas decaem ou explodem com Euler de 1ª ordem).
  - Poucas opções de configuração gravitacional.
- **Plano de Melhoria**:
  1. **Atualização para Integrador Simplético / RK4**:
     - Substituir o integrador Euler pelo integrador de Verlet/Leapfrog simplético ou Runge-Kutta de 4ª ordem, garantindo conservação do momento angular e trajetórias elípticas fechadas perpétuas.
  2. **Modo Sandbox Multicorpos**:
     - Permitir que o usuário insira múltiplos corpos celestes com massa configurável (estrelas binárias, planetas com luas, cinturão de asteroides).
     - Cálculo de pontos de Lagrange (L1 a L5).
  3. **Visualização do Potencial Gravitacional**:
     - Renderização de linhas de contorno equipotenciais de campo escalar em tempo real.
  4. **Conformidade HUD 14.1**: Equalizar componentes de controle e caption.

---

### 2.7 Fluid Simulation (`/playground/fluid`)
- **Estado Atual**: Simulação de fluidos em GPU WebGL 2.0 (equações de Navier-Stokes).
- **Limitações Identificadas**:
  - Boa base de shaders, mas controles densos e desalinhados da estética do HUD 14.1.
  - Falta suporte a obstáculos dinâmicos e partículas advectadas.
- **Plano de Melhoria**:
  1. **Inserção de Obstáculos e Vórtices de Kármán**:
     - Permitir desenhar obstáculos sólidos circulares ou aerofólios no fluxo para demonstrar desprendimento de vórtices (*von Kármán vortex shedding*).
  2. **Sistema de Partículas Advectadas**:
     - Traçadores de tinta de alta densidade que se movem de acordo com o campo vetorial de velocidade da grade de pressão.
  3. **Paletas de Mistura Reativa**:
     - Esquemas térmicos e de densidade química com blending suave.
  4. **Conformidade HUD 14.1**: Refatorar o HUD com `LabCaption` e drawer lateral de configurações limpo.

---

### 2.8 Chladni Resonance Patterns (`/playground/chladni`)
- **Estado Atual**: Partículas vibratórias em placa ressonante 2D quadrada com geração de frequência em Web Audio.
- **Limitações Identificadas**:
  - Limitado a placas quadradas.
  - A renderização é 2D pura sem sensação de profundidade de deformação da chapa metálica.
- **Plano de Melhoria**:
  1. **Geometrias de Placa Estendidas**:
     - Suporte a placas circulares (funções de Bessel) e placas retangulares com razões de aspecto variáveis.
  2. **Iluminação 3D de Relevo Topográfico**:
     - Calcular os gradientes normais da amplitude modal para gerar iluminação especular realista simulando a curvatura física da placa sob vibração.
  3. **Sintetizador Harmônico de Placa**:
     - Afinar os nós de oscilador Web Audio para gerar timbre acústico metálico com múltiplos harmônicos correspondentes aos autovalores da equação de onda biharmônica.
  4. **Conformidade HUD 14.1**: Migrar para `LabCaption` e drawer padronizado.

---

## 3. Matriz de Prioridades e Cronograma

| Fase | Foco Principal | Labs Contemplados | Entregáveis |
|---|---|---|---|
| **Fase 1: HUD 14.1 Equalization** | Padronização de interface | `keyboard`, `matrix`, `explosion`, `vaporwave`, `neon`, `orbit`, `fluid`, `chladni` | Substituição de overlays antigos por `LabCaption`, Z2 actions, Z3 sliding panels e Z4 tips |
| **Fase 2: Audio & Retrô Overhaul** | Motores sonoros e visuais | `keyboard`, `chladni`, `vaporwave`, `neon` | Síntese de switches em Web Audio, Delorean 3D synthwave, zumbido e física de plasma neon |
| **Fase 3: Física & Cinemática Avançada** | Integradores matemáticos | `orbit`, `explosion`, `matrix`, `fluid` | RK4 e conservação orbital, obstáculos de Navier-Stokes, chuva Matrix 3D volumétrica |

---

## 4. Conclusão

Com a conclusão deste plano e sua implementação progressiva (um lab por vez, conforme preconizado no `CLAUDE.md`), todos os 21 experimentos do laboratório compartilharão rigor matemático, fidelidade gráfica exemplar, acessibilidade em telas móveis e desktop, e uma linguagem de design unificada.
