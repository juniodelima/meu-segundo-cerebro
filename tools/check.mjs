#!/usr/bin/env node
// Verificação estática do canvas, para rodar antes de `node tools/build.mjs`.
// Pega o que mais quebra neste formato: tag desbalanceada, JS inválido e
// binding {{ x }} que não existe no renderVals.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "Meu Segundo Cerebro.dc.html"), "utf8");
const cut = src.indexOf('<script type="text/x-dc"');
if (cut < 0) throw new Error("bloco <script data-dc-script> nao encontrado");
const markup = src.slice(0, cut);
const logic = src.slice(cut);
let bad = 0;
const fail = (m) => { console.log("  ERRO  " + m); bad++; };

// 1) balanceamento das tags de controle e das divs
for (const tag of ["sc-if", "sc-for", "x-dc", "helmet"]) {
  const open = (markup.match(new RegExp("<" + tag + "[ >]", "g")) || []).length;
  const close = (markup.match(new RegExp("</" + tag + ">", "g")) || []).length;
  if (open !== close) fail(`<${tag}>: ${open} abre, ${close} fecha`);
}
const dOpen = (markup.match(/<div[ >]/g) || []).length;
const dClose = (markup.match(/<\/div>/g) || []).length;
if (dOpen !== dClose) fail(`<div>: ${dOpen} abre, ${dClose} fecha`);

// 2) sintaxe do JS da lógica
const body = logic.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/);
if (!body) fail("nao consegui isolar o corpo do script");
else {
  const f = join(mkdtempSync(join(tmpdir(), "dccheck-")), "logic.js");
  writeFileSync(f, "const DCLogic=class{};const React={createRef(){return{current:null}}};\n" + body[1]);
  try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); }
  catch (e) { fail("JS invalido:\n" + String(e.stderr || e.message).split("\n").slice(0, 6).join("\n")); }
}

// 3) todo {{ x }} do markup precisa existir como valor (ou ser variavel de laço)
const loopVars = new Set([...markup.matchAll(/as="([A-Za-z0-9_]+)"/g)].map((m) => m[1]));
loopVars.add("$index");
const rv = logic.slice(logic.indexOf("renderVals()"));
const keys = new Set([
  ...[...rv.matchAll(/^      ([A-Za-z_][A-Za-z0-9_]*):/gm)].map((m) => m[1]),
  // atalhos de objeto: `aiAnswer, aiSources, chips,`
  ...[...rv.matchAll(/^      ([A-Za-z_][A-Za-z0-9_, ]*),$/gm)].flatMap((m) => m[1].split(",").map((x) => x.trim()))
]);
const roots = new Set();
for (const m of markup.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)) {
  const e = m[1].trim();
  if (/^(true|false|-?\d)/.test(e)) continue;
  roots.add(e.split(/[.\s([]/)[0]);
}
const missing = [...roots].filter((r) => !loopVars.has(r) && !keys.has(r));
if (missing.length) fail("bindings sem valor no renderVals: " + missing.join(", "));

console.log(bad ? `\n${bad} problema(s) encontrado(s)` : `ok · ${roots.size} bindings, ${keys.size} valores, tags balanceadas`);
process.exit(bad ? 1 : 0);
