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

**Finanças pessoais** — tudo que já existia mais um chat com a Ana. Escreve do
jeito que se pensa e ela lança nas métricas:

| Você escreve | Ela faz |
| --- | --- |
| `gastei 82 no mercado` | lança saída em Alimentação |
| `entrou 2400 de freela` | lança entrada em Trabalho |
| `paguei a energia` | marca a conta como paga e lança a saída |
| `conta de luz 186 vence dia 12` | cria a conta a pagar |
| `guardei 500 na reserva` | soma na meta |
| `desfaz` | remove o último lançamento dela |

E responde: `qual meu saldo`, `quanto gastei em alimentação`, `quanto posso
gastar`, `quais contas vencem`, `onde mais gastei`, `como está o mês`.

> A Ana roda **no próprio navegador**, com um interpretador de português escrito
> à mão — sem chave de API, sem custo e funciona offline. Se um dia quiser IA de
> verdade (entender frase solta, conversar sobre o histórico), o caminho é uma
> rota serverless na Vercel guardando a chave no servidor; o chat já está pronto
> para trocar a função `anaAnswer` por uma chamada de rede.

## Onde os dados ficam

Tudo é salvo no **localStorage do navegador** — sem servidor e sem conta. Isso
significa que os dados são só daquele navegador e não sincronizam entre
aparelhos. O rodapé do hub mostra `salvo neste navegador · limpar`, e `limpar`
volta ao conteúdo de exemplo.

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
