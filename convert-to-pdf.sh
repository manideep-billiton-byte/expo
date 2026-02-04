#!/bin/bash

# Script to convert Markdown documentation to PDF
# Requires: pandoc and texlive

echo "=========================================="
echo "📄 Converting Documentation to PDF"
echo "=========================================="
echo ""

# Check if pandoc is installed
if ! command -v pandoc &> /dev/null; then
    echo "❌ pandoc is not installed"
    echo ""
    echo "Install with:"
    echo "  Ubuntu/Debian: sudo apt-get install pandoc texlive-latex-base texlive-fonts-recommended texlive-latex-extra"
    echo "  macOS: brew install pandoc basictex"
    echo ""
    exit 1
fi

INPUT_FILE="COMPLETE_PROJECT_DOCUMENTATION.md"
OUTPUT_FILE="EventHub_Complete_Documentation.pdf"

if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Input file not found: $INPUT_FILE"
    exit 1
fi

echo "📖 Input: $INPUT_FILE"
echo "📄 Output: $OUTPUT_FILE"
echo ""

echo "🔄 Converting to PDF..."

pandoc "$INPUT_FILE" \
    -o "$OUTPUT_FILE" \
    --pdf-engine=pdflatex \
    --toc \
    --toc-depth=3 \
    --number-sections \
    -V geometry:margin=1in \
    -V fontsize=11pt \
    -V documentclass=report \
    -V colorlinks=true \
    -V linkcolor=blue \
    -V urlcolor=blue \
    --highlight-style=tango \
    --metadata title="EventHub - Complete Project Documentation" \
    --metadata author="Billiton Event Management Team" \
    --metadata date="$(date '+%B %d, %Y')"

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ PDF CREATED SUCCESSFULLY!"
    echo "=========================================="
    echo ""
    echo "📄 File: $OUTPUT_FILE"
    echo "📊 Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
    echo ""
    echo "Open with: xdg-open $OUTPUT_FILE"
    echo ""
else
    echo ""
    echo "❌ PDF conversion failed"
    echo ""
    echo "Alternative: Use online converter"
    echo "  1. Go to: https://www.markdowntopdf.com/"
    echo "  2. Upload: $INPUT_FILE"
    echo "  3. Download the PDF"
    echo ""
fi
