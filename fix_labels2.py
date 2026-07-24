import sys
sys.stdout.reconfigure(encoding='utf-8')

path = 'C:/Users/paule/OneDrive/Desktop/Arabix Theme/pnaSindhiWeb/lib/translate.js'

with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Fix the broken 🤖 insertion (was inserted without quotes + concatenation)
c = c.replace(
    'return out ? 🤖 String(out).trim() : null;',
    "return out ? '\\U0001f916 ' + String(out).trim() : null;"
)

# Also fix Azure - ensure it has proper quotes
c = c.replace(
    "if (out) return '☁️ ' + out;",
    "if (out) return '\\u2601\\ufe0f ' + out;"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Fixed OK')
