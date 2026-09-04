# Meu Segundo Cérebro

Hub pessoal com cinco áreas: notas conectadas, workflows visuais, ideias,
checklist e finanças com uma assessora que entende português. Feito como um
canvas do Claude Design e publicado como site estático na Vercel.

## O que tem em cada área

**Segundo Cérebro** — bloco de notas de verdade. Clique numa nota para abrir e
editar (título, tipo, tags, corpo). Anexa imagem, print, vídeo do YouTube/Vimeo
e link. Liga uma nota na outra e vê tudo num grafo estilo Obsidian: bolinha
clara é nota, bolinha roxa é tag; arrasta os nós, dá zoom com o scroll, clica
para abrir.

**Workflows** — editor de blocos estilo n8n. Arrasta o bloco, puxa de qualquer
uma das 4 bolinhas para conectar do lado que quiser, solta no vazio para já
criar o próximo bloco ligado. Cada bloco tem cor, anotação e sub-blocos
(duplo clique entra um nível, com trilha de navegação no topo). `Organizar`
arruma o fluxo em camadas, `delete` apaga o que estiver selecionado.

**Ideias** — a lista continua igual, e cada ideia ganhou um bloco de notas e o
mesmo editor de workflow para planejar a execução.

**Finanças pessoais** — controle completo de receitas e despesas com categorização customizável, tags de destino, filtros por mês e uma assessora IA (Ana):

- **Tags de Destino / Origem**: adicione tags granulares a cada lançamento para identificar onde ou como gastou (ex: `#Outback`, `#iFood`, `#Combustível`). As tags aparecem como chips visuais na lista de lançamentos e podem ser removidas com um clique (`×`).
- **Edição Retroativa de Tags**: em qualquer lançamento já cadastrado, clique em `+ tag` para abrir o mini-editor inline e adicionar ou alterar tags a qualquer momento.
- **Lançamentos Retroativos e Filtro por Mês**: defina a data do gasto no seletor de data para lançar em meses passados ou retrasados. Use a barra de filtros no topo (`todos`, `set/26`, `ago/26`, `jul/26`...) ou clique nas barras do gráfico de evolução para recalcular instantaneamente as métricas de receita, despesa, saldo e o detalhamento por categoria daquele período específico.
- **Ranking de Destinos Frequentes**: card visual que exibe os totais gastos por tag no período filtrado.
- **Assessora Ana com IA (GPT-4o mini ⚡)**: entende linguagem natural livre, cadastra transações com tags e datas retroativas, gerencia contas e metas, edita tags de lançamentos existentes e gera relatórios analíticos específicos por tag ou por mês (ex: *"quanto gastei no restaurante X mês passado?"*).
- **Chave de API Configurável**: clique no badge `GPT-4o mini ⚡` no topo do chat para visualizar ou atualizar a chave da OpenAI. Fica salva com segurança no seu navegador (`localStorage`).
- **Modo Offline**: se nenhuma chave estiver configurada ou a rede falhar, a assessora entra no modo offline com regras locais inteligentes para saldo, categorias e tags.

| Você escreve | Ela faz |
| --- | --- |
| `gastei 82 no mercado` | lança saída na categoria Alimentação |
| `dia 15 de agosto gastei 240 no Outback com a tag Jantar` | lança com data retroativa e tag `#Jantar` |
| `adicione a tag Almoço no último gasto` | atualiza retroativamente as tags do lançamento |
| `quanto gastei no Outback mês passado?` | gera relatório específico da tag e do período |
| `entrou 2400 de freela` | lança entrada na categoria Trabalho |
| `crie a categoria Consultoria` | registra nova categoria para uso |
| `paguei a energia` | marca a conta como paga e lança a saída |
| `conta de luz 186 vence dia 12` | cria a conta a pagar |
| `guardei 500 na reserva` | soma na meta |
| `criar meta Reserva 10000` | cria nova meta de economia |
| `como estão minhas finanças em agosto?` | gera um relatório completo com diagnósticos do mês |
| `desfaz` | remove o último lançamento dela |

## Onde os dados ficam

Tudo é salvo no **localStorage do navegador** — sem servidor e sem conta. Isso
significa que os dados são só daquele navegador e não sincronizam entre
aparelhos. O rodapé do hub mostra `salvo neste navegador · limpar`, e `limpar`
zera todos os dados salvos.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `Meu Segundo Cerebro.dc.html` | **Fonte.** Markup + lógica do canvas. É o único arquivo que se edita. |
| `support.js` | Runtime do Claude Design, usado em desenvolvimento. |
| `standalone/index.html` | **Build.** Página única e autocontida — é o que a Vercel publica. |
| `tools/build.mjs` | Gera o standalone a partir da fonte. |
| `tools/check.mjs` | Confere tags, sintaxe do JS e bindings antes do build. |
| `vercel.json` | Aponta a raiz pública para `standalone/`. |

## Editar e publicar

```bash
node tools/check.mjs    # tags balanceadas, JS válido, bindings existentes
node tools/build.mjs    # regenera standalone/index.html
npx serve standalone    # olhar antes de subir
git commit -am "..." && git push
```

Cada push na `main` gera um deploy de produção.

### Detalhes do formato que economizam tempo

O `standalone/index.html` é um shell que carrega o documento inteiro como uma
string JSON e, em runtime, **troca o `documentElement` por ela**. Consequências
práticas:

- `title`, `meta` e favicon têm que estar no `<head>` do `.dc.html`. Mexer no
  `<head>` do shell não tem efeito depois da troca.
- O `build.mjs` escapa `</` e `<!--` no payload (senão o `<script>` é cortado
  ao meio) e valida o round-trip antes de gravar.

No template (`.dc.html`), duas armadilhas do runtime:

- **`style` é dividido por `;`**, então um valor com `;` dentro — qualquer
  `data:image/...;base64,` — é truncado. Imagem entra por `ref`, não por style.
- O `<x-dc>` cru continua no DOM (só recebe `display:none`), então um
  `src="{{ x }}"` faz o navegador **buscar o binding literal**. Por isso imagem
  vira `background-image` e player (`iframe`/`video`) é montado por `ref`.
