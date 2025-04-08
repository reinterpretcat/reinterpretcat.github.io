import PyPDF2
import re
import os
import argparse
from collections import defaultdict

# Configurable section headers/skip patterns
DEFAULT_SECTION_HEADERS = [
    "Выражения с", "Глаголы", "Wörter", "СКАЧАНО"
]

class PdfTableExtractor:
    def __init__(self, skip_headers=None):
        self.skip_headers = skip_headers or DEFAULT_SECTION_HEADERS
    
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from a PDF file."""
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page_num in range(len(reader.pages)):
                page_text = reader.pages[page_num].extract_text()
                # Add separation between pages to avoid merging last line of a page with first line of next page
                text += page_text + "\n\n"
        return text
    
    def is_section_header(self, line):
        """Check if a line is a section header that should be skipped."""
        for header in self.skip_headers:
            if header in line:
                return True
        return False
    
    def preprocess_text(self, text):
        """Clean and preprocess text for extraction."""
        # Normalize line breaks
        text = re.sub(r'\r\n', '\n', text)
        
        # Fix common PDF extraction issues - combined words, etc.
        text = re.sub(r'aufh\s+ören', 'aufhören', text)
        text = re.sub(r'unm\s+öglich', 'unmöglich', text)
        
        # Remove specific unwanted strings
        text = text.replace("СКАЧАНО С WWW.SW.HELP - ПРИСОЕДИНЯЙСЯ!", "")
        
        # Remove website information and other irrelevant text
        for header in self.skip_headers:
            text = re.sub(rf'{header}.*?\n', '\n', text)
        
        return text
    
    def identify_entries(self, text):
        """
        Identify word entries in the text using improved pattern recognition.
        """
        entries = []
        
        # Clean and normalize text
        text = self.preprocess_text(text)
        
        # First pass: find complete entries (German word + conjugation + Russian translation)
        # This complex pattern captures different entry formats
        pattern = r'([a-zA-ZäöüÄÖÜß]+(?:\s[a-zA-ZäöüÄÖÜß\/]+)*)(?:\s*\(([^)]+)\))?\s*([а-яА-Я]+(?:\s*[а-яА-Я,\s\/\(\)\-]+)*)'
        
        matches = re.finditer(pattern, text)
        for match in matches:
            german_word = match.group(1).strip()
            conjugation = match.group(2).strip() if match.group(2) else ""
            russian = match.group(3).strip()
            
            # Skip if parts are missing
            if not german_word or not russian:
                continue
            
            # Detect if it's a verb based on conjugation
            tags = []
            if conjugation and re.search(r'er\s+[a-zäöü]+', conjugation):
                tags.append("verb")
            
            entries.append({
                'german_word': german_word,
                'conjugation': conjugation,
                'russian': russian,
                'tags': tags
            })
        
        # Second pass: find expressions with sein/haben
        sein_haben_pattern = r'([a-zA-ZäöüÄÖÜß\s\/]+)\s+(sein|haben)\s+([а-яА-Я\s\(\)\/\-]+)'
        sein_haben_matches = re.finditer(sein_haben_pattern, text)
        
        for match in sein_haben_matches:
            expression = match.group(1).strip()
            verb = match.group(2).strip()
            german_word = f"{expression} {verb}"
            russian = match.group(3).strip()
            
            # Skip if parts are missing
            if not expression or not russian:
                continue
            
            entries.append({
                'german_word': german_word,
                'conjugation': "",
                'russian': russian,
                'tags': ["expression"]
            })
        
        # Handle special cases for "einen Termin" phrases
        termin_pattern = r'(einen\s+Termin\s+[a-zA-ZäöüÄÖÜß\/]+)(?:\s*\(([^)]+)\))?\s*([а-яА-Я]+(?:\s*[а-яА-Я,\s\/\(\)\-]+)*)'
        termin_matches = re.finditer(termin_pattern, text)
        
        for match in termin_matches:
            german_word = match.group(1).strip()
            conjugation = match.group(2).strip() if match.group(2) else ""
            russian = match.group(3).strip()
            
            # Skip if parts are missing
            if not german_word or not russian:
                continue
            
            entries.append({
                'german_word': german_word,
                'conjugation': conjugation,
                'russian': russian,
                'tags': ["phrase", "verb"] if conjugation else ["phrase"]
            })
        
        # Post-processing to fix common issues
        processed_entries = []
        for entry in entries:
            # Fix aufhören and similar words that might be incorrectly split
            if re.match(r'aufh$|unm$', entry['german_word']):
                continue  # Skip broken entries
            
            # Skip entries without Russian translation
            if not entry['russian'] or entry['russian'] == '-':
                continue
            
            processed_entries.append(entry)
        
        return processed_entries
    
    def convert_to_markdown(self, entries):
        """Convert entries to markdown format with tags."""
        markdown_text = "# Description\n\n"
        
        for entry in entries:
            markdown_text += f"## {entry['german_word']}\n"
            markdown_text += f"- {entry['russian']}\n"
            markdown_text += f"* {entry['german_word']}\n"
            if entry['conjugation']:
                markdown_text += f"* ({entry['conjugation']})\n"

            
            # Add tags section
            if entry['tags']:
                tags_str = ", ".join(entry['tags'])
                markdown_text += f"> {tags_str}\n"
            
            markdown_text += "\n"
        
        return markdown_text
    
    def save_to_file(self, content, output_path):
        """Save content to a file."""
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Saved output to {output_path}")
    
    def process_pdf(self, pdf_path, output_path):
        """Process PDF and convert to markdown."""
        print(f"Processing {pdf_path}...")
        
        # Extract text
        text = self.extract_text_from_pdf(pdf_path)
        
        # Debug: Save raw text for inspection
        with open("debug_raw_text.txt", "w", encoding="utf-8") as f:
            f.write(text)
            
        # Identify entries
        entries = self.identify_entries(text)
        
        if not entries:
            print("No entries found in the PDF.")
            return
        
        # Convert to markdown
        markdown_text = self.convert_to_markdown(entries)
        
        # Save to file
        self.save_to_file(markdown_text, output_path)
        
        print(f"Successfully processed {len(entries)} entries.")
        print("\nFirst entry example:")
        print(markdown_text.split('\n\n')[0])
        print("\nLast entry example:")
        print(markdown_text.split('\n\n')[-2] if len(markdown_text.split('\n\n')) > 1 else "")


def main():
    parser = argparse.ArgumentParser(description='Extract table data from PDFs and convert to markdown.')
    parser.add_argument('pdf_path', help='Path to the PDF file')
    parser.add_argument('--output', '-o', default='output.md', help='Output markdown file path')
    parser.add_argument('--skip-headers', '-s', nargs='+', help='Section headers to skip (optional)')
    parser.add_argument('--debug', '-d', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    # Use custom headers if provided
    headers = args.skip_headers if args.skip_headers else DEFAULT_SECTION_HEADERS
    
    extractor = PdfTableExtractor(headers)
    extractor.process_pdf(args.pdf_path, args.output)

if __name__ == "__main__":
    main()