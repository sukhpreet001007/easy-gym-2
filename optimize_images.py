
import re
import os

filepath = r'c:\Users\Satvir\Desktop\easy-gym-2\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add decoding="async" to all images that don't have it
content = re.sub(r'<img(?!.*?decoding=)', r'<img decoding="async"', content)

# Add loading="lazy" to all images that don't have loading="lazy" or loading="eager"
# and are not the hero images (we already added attributes to those or will handle them)
# Actually, it's safer to just target specific ones or add it to all and then fix the hero ones.
# But we already fixed the hero ones.

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
