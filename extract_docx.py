import zipfile
import xml.etree.ElementTree as ET
import sys

def read_docx(path):
    try:
        with zipfile.ZipFile(path) as docx:
            # document.xml contains the text
            tree = ET.parse(docx.open('word/document.xml'))
            root = tree.getroot()
            
            # extract text
            texts = []
            for elem in root.iter():
                if elem.tag.endswith('}t'):
                    if elem.text:
                        texts.append(elem.text)
                elif elem.tag.endswith('}p'):
                    texts.append('\n')
            
            # Post-process to fix newlines
            content = ''.join(texts)
            # Remove consecutive newlines
            return '\n'.join(line for line in content.split('\n') if line.strip())
            
    except Exception as e:
        return f"Error reading document: {e}"

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extract_docx.py <input.docx> <output.txt>")
        sys.exit(1)
        
    in_file = sys.argv[1]
    out_file = sys.argv[2]
    
    text = read_docx(in_file)
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(text)
    print("Done")
