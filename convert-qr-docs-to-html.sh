#!/bin/bash

INPUT="QR_CODE_SYSTEM_COMPLETE_DOCUMENTATION.md"
OUTPUT="QR_Code_System_Documentation.html"

echo "Converting $INPUT to $OUTPUT..."

python3 << 'PYTHON_SCRIPT' > "$OUTPUT"
import re

html_header = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code System - Complete Documentation</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
            pre, code { page-break-inside: avoid; }
            h1, h2, h3 { page-break-after: avoid; }
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            margin-top: 40px;
        }
        h2 {
            color: #1e40af;
            border-bottom: 2px solid #ddd;
            padding-bottom: 8px;
            margin-top: 30px;
        }
        h3 {
            color: #3b82f6;
            margin-top: 20px;
        }
        code {
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 15px 0;
        }
        pre code {
            background: transparent;
            color: #e2e8f0;
            padding: 0;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background: #2563eb;
            color: white;
            font-weight: 600;
        }
        tr:nth-child(even) {
            background: #f8fafc;
        }
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        .print-button:hover {
            background: #059669;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ Print to PDF</button>
    <div class="container">
'''

html_footer = '''
    </div>
</body>
</html>
'''

print(html_header)

with open('QR_CODE_SYSTEM_COMPLETE_DOCUMENTATION.md', 'r') as f:
    content = f.read()

# Convert headers
content = re.sub(r'^# (.+)$', r'<h1>\1</h1>', content, flags=re.MULTILINE)
content = re.sub(r'^## (.+)$', r'<h2>\1</h2>', content, flags=re.MULTILINE)
content = re.sub(r'^### (.+)$', r'<h3>\1</h3>', content, flags=re.MULTILINE)
content = re.sub(r'^#### (.+)$', r'<h4>\1</h4>', content, flags=re.MULTILINE)

# Convert code blocks
content = re.sub(r'```(\w+)?\n(.*?)\n```', r'<pre><code>\2</code></pre>', content, flags=re.DOTALL)

# Convert inline code
content = re.sub(r'`([^`]+)`', r'<code>\1</code>', content)

# Convert bold
content = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', content)

# Convert lists
lines = content.split('\n')
in_list = False
result = []
for line in lines:
    if line.strip().startswith('- ') or line.strip().startswith('* '):
        if not in_list:
            result.append('<ul>')
            in_list = True
        result.append(f'<li>{line.strip()[2:]}</li>')
    else:
        if in_list:
            result.append('</ul>')
            in_list = False
        result.append(line)

if in_list:
    result.append('</ul>')

content = '\n'.join(result)

# Convert paragraphs
content = re.sub(r'\n\n', r'</p><p>', content)
content = '<p>' + content + '</p>'

# Clean up
content = content.replace('<p></p>', '')
content = content.replace('<p><h', '<h')
content = content.replace('</h1></p>', '</h1>')
content = content.replace('</h2></p>', '</h2>')
content = content.replace('</h3></p>', '</h3>')
content = content.replace('<p><pre>', '<pre>')
content = content.replace('</pre></p>', '</pre>')
content = content.replace('<p><ul>', '<ul>')
content = content.replace('</ul></p>', '</ul>')

print(content)
print(html_footer)
PYTHON_SCRIPT

echo "✅ HTML created: $OUTPUT"
echo ""
echo "📋 To convert to PDF:"
echo "  1. Open $OUTPUT in Chrome/Firefox"
echo "  2. Press Ctrl+P"
echo "  3. Select 'Save as PDF'"
echo "  4. Click 'Save'"
echo ""
xdg-open "$OUTPUT" 2>/dev/null || open "$OUTPUT" 2>/dev/null
