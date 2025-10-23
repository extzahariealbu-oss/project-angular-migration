// fix-console-monitor-v2.js
// Fixes lines where }); expect(consoleMonitor was added on same line
const fs = require('fs');
const path = require('path');

const files = [
  'e2e/products-detail.spec.ts',
  'e2e/products-form.spec.ts',
  'e2e/products-list.spec.ts'
];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const fixed = [];
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line has "); expect(consoleMonitor" pattern (sometimes with extra spaces)
    if (line.includes('}); expect(consoleMonitor')) {
      changed = true;
      // Split the line properly
      const parts = line.split(/\s*\}\);\s*expect\(consoleMonitor\.hasErrors\(\)\)\.toBe\(false\);/);
      if (parts.length === 2) {
        // Add proper closing with newline and then the expect on next line
        const indent = line.match(/^(\s*)/)[1];
        fixed.push(parts[0] + '});');
        fixed.push(indent + 'expect(consoleMonitor.hasErrors()).toBe(false);');
        
        // Check if there's a trailing }); on the next line that should be removed
        if (i + 1 < lines.length && lines[i + 1].trim() === '});') {
          i++; // Skip the next line (it's the proper test closing)
          fixed.push(lines[i]);
        }
        continue;
      }
    }
    
    // Check for lines with extra spaces before });
    if (line.includes('}); expect(consoleMonitor')) {
      changed = true;
      const indent = line.match(/^(\s*)/)[1];
      // Extract the statement before });
      const match = line.match(/^(\s*)(.+?)\s+\}\);\s*expect\(consoleMonitor\.hasErrors\(\)\)\.toBe\(false\);/);
      if (match) {
        fixed.push(match[1] + match[2] + '});');
        fixed.push(match[1] + 'expect(consoleMonitor.hasErrors()).toBe(false);');
        
        // Check if there's a spurious }); on the next line
        if (i + 1 < lines.length && lines[i + 1].trim() === '});') {
          i++; // Skip it
          fixed.push(lines[i]);
        }
        continue;
      }
    }
    
    fixed.push(line);
  }

  if (changed) {
    fs.writeFileSync(file, fixed.join('\n'), 'utf8');
    console.log(`Fixed: ${file}`);
  }
});

console.log('Done.');
