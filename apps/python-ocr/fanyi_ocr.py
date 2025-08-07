# apps/python-backend/ocr_process.py
import sys
import pytesseract
from PIL import Image

def main():
    # Read image data from stdin
    try:
        image_data = sys.stdin.buffer.read()
        image = Image.open(image_data)
        text = pytesseract.image_to_string(image)
        print(text, end="")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()