import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('lib/translate.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Bump cache version
content = content.replace(
    "TRANSLATION_CACHE_VERSION = 'v3-headline-perfective'",
    "TRANSLATION_CACHE_VERSION = 'v4-headline-strict-final'"
)

# 2. Update rule 2 with more verb examples including چڙهيو/چڙهي
content = content.replace(
    "Verbs MUST agree with the subject gender — men/masculine nouns: ڪيو، ويو، چيو، پهتو; women/feminine nouns: ڪئي، وئي، چئي، پهتي.",
    "Verbs MUST agree with the subject gender — men/masculine nouns: ڪيو، ويو، چيو، پهتو، چڙهيو، ٿيو; women/feminine nouns: ڪئي، وئي، چئي، پهتي، چڙهي، ٿي."
)

# 3. Replace rule 3 with stricter instruction
old_rule3 = "3. HEADLINE STYLE: for events that already happened, use perfective/past verb forms (ڪري ڇڏيو، ڪيو، ڏنو، ٿي ويو، قائم ڪيو). NEVER end a news headline with simple present ڪري ٿو / ڪري ٿي for a completed event — that is English-style literal translation and wrong in Sindhi news. Example: \"study warns\" → تحقيق خبردار ڪري ڇڏيو (NOT تحقيق خبردار ڪري ٿي); \"sets record\" → رڪارڊ قائم ڪري ڇڏيو (NOT قائم ڪري ٿو)."

new_rule3 = "3. CRITICAL HEADLINE RULE: A Sindhi news headline for a past/completed event MUST end with a past perfective verb. NEVER end with present tense ٿو or ٿي — that is always wrong in Sindhi newspaper headlines. Examples: \"expansion accelerates\" → توسيع تيز ٿي وئي (NOT تيز ڪري ٿو or تيز ٿي); \"theft increases by 300%\" → چوري ۾ 300 سيڪڙو واڌ ٿي وئي (NOT واڌ ٿي); \"study warns\" → تحقيق خبردار ڪري ڇڏيو (NOT تحقيق خبردار ڪري ٿي); \"sets record\" → رڪارڊ قائم ڪري ڇڏيو (NOT قائم ڪري ٿو). These are firm rules, not suggestions."

content = content.replace(old_rule3, new_rule3)

# 4. Add post-processing function after the viaGemini function (before viaAzure)
# Find the insertion point - after the viaGemini function's closing }
post_process_code = """

// ---- Post-processing: fix headlines ending with present tense ----
function fixHeadlineEnding(text) {
  // Only apply to short texts (likely headlines) ending with present tense
  if (!text || text.length > 120) return text;
  const trimmed = text.trim();
  // Check if headline ends with ٿو or ٿي (present tense - wrong for news headlines)
  if (!trimmed.endsWith('ٿو') && !trimmed.endsWith('ٿي')) return text;
  // Replace common wrong present endings with correct past perfective
  // In Sindhi news, headlines must use past tense for completed events
  if (trimmed.endsWith('ٿو')) {
    return trimmed.slice(0, -1) + ' ويو';
  }
  if (trimmed.endsWith('ٿي')) {
    // check if the pattern is "verb + ٿي" → it should be "verb + وئي"
    // Words like سنڌي, ٿي (just the ending) - only fix when it's a standalone present tense
    return trimmed.slice(0, -1) + ' وئي';
  }
  return text;
}

"""

insert_point = """}
if (!key) return null;"""
content = content.replace(
    "}\n\n// ---- Provider 1: Azure / Microsoft Translator ----",
    post_process_code + "\n// ---- Provider 1: Azure / Microsoft Translator ----"
)

with open('lib/translate.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("DONE")
