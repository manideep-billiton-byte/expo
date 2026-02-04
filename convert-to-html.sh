#!/bin/bash

# Convert Markdown to HTML (can be printed to PDF from browser)

echo "=========================================="
echo "📄 Converting Documentation to HTML"
echo "=========================================="
echo ""

INPUT_FILE="COMPLETE_PROJECT_DOCUMENTATION.md"
OUTPUT_FILE="EventHub_Complete_Documentation.html"

if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Input file not found: $INPUT_FILE"
    exit 1
fi

echo "📖 Input: $INPUT_FILE"
echo "📄 Output: $OUTPUT_FILE"
echo ""

# Create HTML with embedded CSS
cat > "$OUTPUT_FILE" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EventHub - Complete Project Documentation</title>
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
        
        .toc {
            background: #f0f9ff;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 30px 0;
        }
        
        .toc h2 {
            margin-top: 0;
            border: none;
        }
        
        .toc ul {
            list-style: none;
            padding-left: 0;
        }
        
        .toc li {
            margin: 8px 0;
        }
        
        .toc a {
            color: #2563eb;
            text-decoration: none;
        }
        
        .toc a:hover {
            text-decoration: underline;
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
        
        blockquote {
            border-left: 4px solid #fbbf24;
            background: #fffbeb;
            padding: 15px;
            margin: 20px 0;
        }
        
        .architecture-diagram {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            font-family: monospace;
            white-space: pre;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ Print to PDF</button>
    <div class="container">
EOF

# Convert markdown to HTML (basic conversion)
python3 << 'PYTHON_SCRIPT' >> "$OUTPUT_FILE"
import re
import sys

with open('COMPLETE_PROJECT_DOCUMENTATION.md', 'r') as f:
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
PYTHON_SCRIPT

# Close HTML
cat >> "$OUTPUT_FILE" << 'EOF'
    </div>
    <script>
        // Add smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    </script>
</body>
</html>
EOF

echo "✅ HTML created successfully!"
echo ""
echo "📄 File: $OUTPUT_FILE"
echo ""
echo "📋 To convert to PDF:"
echo "  1. Open the HTML file in Chrome/Firefox"
echo "  2. Press Ctrl+P (or Cmd+P on Mac)"
echo "  3. Select 'Save as PDF'"
echo "  4. Click 'Save'"
echo ""
echo "Opening in browser..."
xdg-open "$OUTPUT_FILE" 2>/dev/null || open "$OUTPUT_FILE" 2>/dev/null || echo "Please open $OUTPUT_FILE in your browser"
