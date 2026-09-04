# Meu Segundo Cérebro

Hub pessoal para capturar, organizar e recuperar ideias. Feito como um canvas do
Claude Design e publicado como site estático na Vercel.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `Meu Segundo Cerebro.dc.html` | **Fonte.** O canvas do Claude Design (artboards, componentes, lógica). |
| `support.js` | Runtime do Claude Design usado pelo arquivo `.dc.html` em desenvolvimento. |
| `standalone/index.html` | **Build de produção.** Página única, autocontida, sem dependências externas. É o que a Vercel publica. |
| `vercel.json` | Configuração do deploy (aponta a raiz pública para `standalone/`). |

## Rodar localmente

```bash
npx serve standalone
```

Depois abra o endereço que aparecer no terminal.

## Deploy na Vercel

O projeto é estático — não há etapa de build.

- **Framework Preset:** `Other`
- **Build Command:** deixar vazio
- **Output Directory:** `standalone` (já definido em `vercel.json`)

Cada `git push` na branch `main` gera um novo deploy de produção.

## Atualizando o site

1. Edite o canvas (`Meu Segundo Cerebro.dc.html`) no Claude Design.
2. Exporte o standalone novamente, substituindo `standalone/index.html`.
3. Reaplique os metadados no `<head>` do arquivo exportado — o export vem com
   `<title>Bundled Page</title>` e **sem** `<meta name="viewport">`. É preciso
   trocar o título e adicionar viewport, description, theme-color e og:*,
   além de `lang="pt-BR"` na tag `<html>`.
4. Commit e push.
