// Builds the TechTerms Hunspell dictionary from cspell's word lists.
//
//   npm ci && npm run build
//
// Every @cspell/dict-* package in package.json is read from node_modules, at
// the version pinned there, and its words are written to one .dic with the
// .aff beside it. Each package's license goes in TechTerms/LICENSES, and
// NOTICE lists them all.
import { gunzipSync } from "node:zlib";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { Trie, importTrie } from "cspell-trie-lib";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "TechTerms");
const dicDir = join(out, "styles", "config", "dictionaries");
const licDir = join(out, "LICENSES");
mkdirSync(dicDir, { recursive: true });
mkdirSync(licDir, { recursive: true });

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const dicts = Object.keys(pkg.devDependencies).filter((n) => n.startsWith("@cspell/dict-")).sort();

// The word files in a package, wherever it keeps them.
function wordFiles(dir) {
  const found = [];
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (name === "node_modules") continue;
    if (statSync(path).isDirectory()) found.push(...wordFiles(path));
    else if (/\.(txt|trie)(\.gz)?$/.test(name)) found.push(path);
  }
  return found;
}

function* wordsIn(path) {
  let text = readFileSync(path);
  if (path.endsWith(".gz")) text = gunzipSync(text);
  text = text.toString("utf8");
  if (/\.trie(\.gz)?$/.test(path)) {
    yield* new Trie(importTrie(text.split("\n"))).words();
    return;
  }
  for (const line of text.split("\n")) yield line;
}

// A plain word, or null for what Hunspell can't hold: a comment, a phrase,
// cspell's compound and forbidden markers, a `/`, which starts flags, or a
// leading symbol.
function clean(line) {
  const word = line.split(" #")[0].trim();
  if (!word || word.startsWith("#") || /\s|\//.test(word)) return null;
  if (/^[!~+*]|[*+]$/.test(word)) return null;
  // Vale's tokenizer never yields a word that starts with a symbol.
  if (!/^[\p{L}\p{N}]/u.test(word)) return null;
  return word;
}

const words = new Set();
const notice = [];
for (const name of dicts) {
  const dir = join(root, "node_modules", name);
  const meta = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  if (meta.license !== "MIT") throw new Error(`${name} is ${meta.license}, not MIT`);

  let count = 0;
  for (const file of wordFiles(dir)) {
    for (const line of wordsIn(file)) {
      const word = clean(line);
      if (word && !words.has(word)) {
        words.add(word);
        count++;
      }
    }
  }

  const short = basename(name);
  const license = join(dir, "LICENSE");
  if (!existsSync(license)) throw new Error(`${name} has no LICENSE`);
  writeFileSync(join(licDir, `${short}.txt`), readFileSync(license));
  notice.push(`- ${name}@${meta.version} (${count} words): LICENSES/${short}.txt`);
}

// Every word takes a plural and a possessive; a word ending in s takes only
// the possessive.
const sorted = [...words].sort();
const dic = sorted.map((w) => `${w}/${w.endsWith("s") ? "M" : "SM"}`);
writeFileSync(join(dicDir, "techterms.dic"), `${dic.length}\n${dic.join("\n")}\n`);
writeFileSync(
  join(dicDir, "techterms.aff"),
  `SET UTF-8
ICONV 1
ICONV ’ '

SFX S Y 2
SFX S 0 s [^sxz]
SFX S 0 es [sxz]

SFX M Y 1
SFX M 0 's .
`,
);

writeFileSync(
  join(out, "NOTICE"),
  `TechTerms is built from the word lists of these packages, each under the
MIT license. The full text of each license is in LICENSES/.

${notice.join("\n")}
`,
);

// What a repackager has to carry along, for the library's license check.
const licenses = dicts.map((n) => `LICENSES/${basename(n)}.txt`);
writeFileSync(join(out, "meta.json"), `${JSON.stringify({ license_files: ["LICENSE", "NOTICE", ...licenses] }, null, 2)}\n`);

console.log(`${sorted.length} words from ${dicts.length} dictionaries`);
