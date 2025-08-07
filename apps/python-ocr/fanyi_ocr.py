import sys
import io
import easyocr

def main():
    try:
        image_data = sys.stdin.buffer.read()
        
        # Initialize the EasyOCR reader with the desired languages
        # 'ch_sim' is for Simplified Chinese, 'en' is for English
        # This will download the models on the first run
        reader = easyocr.Reader(['ch_sim', 'en'])
        
        # Read the text from the image data
        # Note: EasyOCR works directly with image bytes, so no need for Pillow
        results = reader.readtext(image_data)
        
        # Extract the text from the results and join them
        text = " ".join([result[1] for result in results])
        
        # Encode the text to a UTF-8 byte stream
        encoded_text = text.encode('utf-8')
        
        # Write the raw bytes directly to stdout
        sys.stdout.buffer.write(encoded_text)
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    # Force UTF-8 encoding for stdout and stderr to handle Chinese characters
    sys.stdout = open(sys.stdout.fileno(), 'w', encoding='utf-8', closefd=False)
    sys.stderr = open(sys.stderr.fileno(), 'w', encoding='utf-8', closefd=False)
    
    main()