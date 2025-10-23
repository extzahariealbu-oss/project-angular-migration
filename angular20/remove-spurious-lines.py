#!/usr/bin/env python3
import re

files = [
    'e2e/products-detail.spec.ts',
    'e2e/products-form.spec.ts',
    'e2e/products-list.spec.ts'
]

for filepath in files:
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    skip_next = False
    
    for i, line in enumerate(lines):
        if skip_next:
            skip_next = False
            continue
            
        # If current line has expect(consoleMonitor and next line is just "  });"
        if 'expect(consoleMonitor.hasErrors()).toBe(false);' in line:
            if i + 1 < len(lines) and lines[i + 1].strip() == '});':
                new_lines.append(line)
                skip_next = True  # Skip the next " });" line
                continue
        
        new_lines.append(line)
    
    with open(filepath, 'w') as f:
        f.writelines(new_lines)
    
    print(f"Fixed: {filepath}")

print("Done!")
