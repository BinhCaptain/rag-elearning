import zipfile
import xml.etree.ElementTree as ET
import sys

def read_docx(path):
    try:
        with zipfile.ZipFile(path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            text = []
            for para in tree.findall('.//w:p', ns):
                para_text = []
                for run in para.findall('.//w:r/w:t', ns):
                    if run.text:
                        para_text.append(run.text)
                if para_text:
                    text.append(''.join(para_text))
            return '\n'.join(text)
    except Exception as e:
        return str(e)

print(read_docx(r'D:\Binh_KL\Code\Thesis_Proposal_NguyenThanhBinh.docx'))
