import os
import re

def refactor_templates(base_dir):
    pattern_use_state = re.compile(r'const\s+\[customData,\s*setCustomData\]\s*=\s*useState<any>\(initialCustomData\s*\|\|\s*null\);')
    pattern_use_effect = re.compile(
        r'useEffect\(\(\)\s*=>\s*\{\s*if\s*\(window\.parent\s*&&\s*window\.parent\s*!==\s*window\)\s*\{\s*'
        r'const\s*handleMessage\s*=\s*\(event:\s*MessageEvent\)\s*=>\s*\{\s*'
        r'if\s*\(event\.data\?\.type\s*===\s*"MONOLITH_CUSTOMIZATION"\)\s*\{\s*'
        r'setCustomData\(event\.data\.data\);\s*\}\s*\};\s*'
        r'window\.addEventListener\("message",\s*handleMessage\);\s*'
        r'window\.parent\.postMessage\(\{\s*type:\s*"MONOLITH_REQUEST_STATE"\s*\},.*?\);\s*'
        r'return\s*\(\)\s*=>\s*window\.removeEventListener\("message",\s*handleMessage\);\s*'
        r'\}\s*\},\s*\[\]\);', re.DOTALL)
    
    modified_files = []
    
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if pattern_use_state.search(content) and pattern_use_effect.search(content):
                    # Replace with useCustomization hook
                    new_content = pattern_use_state.sub('const customData = useCustomization();', content)
                    new_content = pattern_use_effect.sub('', new_content)
                    
                    # Check if import is missing
                    if 'useCustomization' not in new_content:
                        import_statement = 'import { useCustomization } from "@/hooks/useCustomization";\n'
                        # insert after last import
                        last_import = new_content.rfind('import ')
                        if last_import != -1:
                            end_of_line = new_content.find('\n', last_import)
                            new_content = new_content[:end_of_line+1] + import_statement + new_content[end_of_line+1:]
                        else:
                            new_content = import_statement + new_content
                            
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    modified_files.append(filepath)
    print(f"Modified {len(modified_files)} files")

if __name__ == '__main__':
    refactor_templates(r'c:\Users\lenovo\Downloads\PRIME PROJECT\app\templates')
