import re

path = r'C:\Users\paule\OneDrive\Desktop\Arabix Theme\pnaSindhiWeb\lib\translate.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Gemini label
content = content.replace(
    "return out ? String(out).trim() : null;\n  } catch (e) {\n    return null;\n  }\n}\n\n// ---- Post-processing: fix headlines ending with present tense ----",
    "return out ? '🤖 ' + String(out).trim() : null;\n  } catch (e) {\n    return null;\n  }\n}\n\n// ---- Post-processing: fix headlines ending with present tense ----",
    1  # only first occurrence (Gemini translate, not Gemini rewrite)
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done! Fixed translate.js")
