"""
Convert HTML to DOCX using htmldocx for better style preservation
"""
from htmldocx import HtmlToDocx
from docx import Document

# Read the HTML file
with open('ProductPulse_Assignment.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Create a new Document
doc = Document()

# Create parser and add HTML to document
parser = HtmlToDocx()
parser.add_html_to_document(html_content, doc)

# Save the document
doc.save('ProductPulse_Assignment_Styled.docx')
print('Document saved: ProductPulse_Assignment_Styled.docx')
