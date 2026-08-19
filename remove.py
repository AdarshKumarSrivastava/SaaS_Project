import re

path = r'C:\Users\lenovo\Downloads\ALL PROJECTS\hack in hills - manali\src\components\Tracks.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to remove the globalNavPath block
pattern = r'\s*\{\/\* Far Left Global Navigation Path \*\/\}\s*<div className=\{styles\.globalNavPath\}>.*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>'

# Actually, a safer way since HTML closing tags can be tricky with regex non-greedy dot
# I will use a simple state machine to remove everything from {/* Far Left Global Navigation Path */}
# to its matching closing div.

lines = content.split('\n')
out_lines = []
skip = False
div_count = 0

for line in lines:
    if '{/* Far Left Global Navigation Path */}' in line:
        skip = True
        div_count = 0
        
    if skip:
        div_count += line.count('<div')
        div_count -= line.count('</div')
        
        # If we reached 0 div_count and we've already started skipping (so it means we processed the div)
        # Wait, the first line might just have the comment, next line has the <div
        if div_count <= 0 and '<div' in line:
            # We just closed the div we opened!
            skip = False
        elif div_count <= 0 and '</div' in line:
            skip = False
        continue
    
    out_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(out_lines))
print('Removed successfully!')
