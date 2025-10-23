// fix-console-monitor-splits.js
// Node 16+
// Searches for the console monitor check injected mid-line and fixes bracket/paren closures.
const fs = require('fs');
const path = require('path');

const PATTERN = '; expect(consoleMonitor.hasErrors()).toBe(false);';
const exts = new Set(['.ts', '.tsx', '.js', '.jsx']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function computeClosers(prefix) {
  // Best-effort bracket balance, ignoring brackets inside quotes/backticks.
  const stack = [];
  let inSingle = false, inDouble = false, inBacktick = false;
  let escaped = false;
  for (let i = 0; i < prefix.length; i++) {
    const ch = prefix[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (!inDouble && !inBacktick && ch === '\'' ) { inSingle = !inSingle; continue; }
    if (!inSingle && !inBacktick && ch === '"'   ) { inDouble = !inDouble; continue; }
    if (!inSingle && !inDouble  && ch === '`'    ) { inBacktick = !inBacktick; continue; }
    if (inSingle || inDouble || inBacktick) continue;

    if (ch === '(' || ch === '{' || ch === '[') stack.push(ch);
    else if (ch === ')' || ch === '}' || ch === ']') {
      if (stack.length) {
        const top = stack[stack.length - 1];
        if ((top === '(' && ch === ')') || (top === '{' && ch === '}') || (top === '[' && ch === ']')) {
          stack.pop();
        }
      }
    }
  }
  let closers = '';
  while (stack.length) {
    const open = stack.pop();
    closers += (open === '(' ? ')' : open === '{' ? '}' : ']');
  }
  return closers;
}

function fixLine(line) {
  let idx = line.indexOf(PATTERN);
  if (idx === -1) return null; // no change
  let changed = false;
  let out = '';
  let start = 0;

  while (idx !== -1) {
    const pre = line.slice(start, idx);
    const hasNonWsBefore = pre.trim().length > 0;
    const endsWithSemicolon = /\;\s*$/.test(pre);
    if (hasNonWsBefore && !endsWithSemicolon) {
      const closers = computeClosers(pre);
      // Insert closers + semicolon before the pattern
      out += pre + closers + '; ' + PATTERN;
      changed = true;
      start = idx + PATTERN.length;
    } else {
      // Leave as-is
      out += line.slice(start, idx + PATTERN.length);
      start = idx + PATTERN.length;
    }
    idx = line.indexOf(PATTERN, start);
  }
  out += line.slice(start);
  return changed ? out : null;
}

function processFile(file) {
  const ext = path.extname(file);
  if (!exts.has(ext)) return;
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes(PATTERN)) return;
  const lines = content.split(/\r?\n/);
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const fixed = fixLine(lines[i]);
    if (fixed !== null) {
      lines[i] = fixed;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log(`Fixed: ${file}`);
  }
}

function main() {
  const root = process.cwd();
  const files = walk(root);
  for (const f of files) processFile(f);
  console.log('Done.');
}

main();
