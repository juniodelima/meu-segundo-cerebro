#!/usr/bin/env node
// Regenera standalone/index.html a partir do canvas (.dc.html).
//
// O standalone é um "shell" que carrega dois payloads:
//   script[type="__bundler/manifest"] → assets (support.js em gzip+base64)
//   script[type="__bundler/template"] → o documento inteiro, como string JSON
// Em runtime o shell troca document.documentElement pelo template parseado, então
// tudo que precisa chegar ao navegador (title, meta, o canvas) vive no .dc.html —
// mexer no <head> do shell não tem efeito depois da troca.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "Meu Segundo Cerebro.dc.html");
const OUT = join(root, "standalone", "index.html");
const BS = String.fromCharCode(92); // barra invertida, à prova de escape do shell

const shell = readFileSync(OUT, "utf8");

const manifestRaw = shell.match(/<script type="__bundler\/manifest">\n([\s\S]*?)\n  <\/script>/);
if (!manifestRaw) throw new Error("manifest nao encontrado no shell");
const manifest = JSON.parse(manifestRaw[1]);
const uuid = Object.keys(manifest).find((k) => manifest[k].mime === "text/javascript");
if (!uuid) throw new Error("uuid do support.js nao encontrado no manifest");

// O template referencia o asset pelo uuid; o shell troca por um blob: URL.
const doc = readFileSync(SRC, "utf8").replace('src="./support.js"', `src="${uuid}"`);

// O payload vai dentro de um <script> inline. O parser de HTML encerraria a tag
// ao ver "</script", e "<!--" o joga no estado escapado — então as duas sequências
// viram escapes \u de JSON, que o JSON.parse desfaz para o texto original.
const payload = JSON.stringify(doc)
  .replace(/<\//g, () => "<" + BS + "u002F")
  .replace(/<!--/g, () => "<" + BS + "u0021--");

// --- validação: o payload tem que voltar a ser exatamente o documento ---
if (payload.includes("</")) throw new Error("sobrou '</' no payload — o script seria cortado");
if (payload.includes("<!--")) throw new Error("sobrou '<!--' no payload");
let parsed;
try { parsed = JSON.parse(payload); }
catch (e) { throw new Error("payload nao e JSON valido: " + e.message); }
if (parsed !== doc) throw new Error("round-trip falhou: o JSON nao reproduz o documento");

const SLOT = /(<script type="__bundler\/template">\n)[\s\S]*?(\n  <\/script>)/;
if (!SLOT.test(shell)) throw new Error("slot do template nao encontrado — o shell mudou de formato?");
const next = shell.replace(SLOT, (_m, open, close) => open + payload + close);

writeFileSync(OUT, next);
console.log(
  `standalone/index.html ${next === shell ? "já estava atualizado" : "atualizado"}` +
  ` · template ${payload.length} bytes · ${doc.length} bytes de fonte`
);
