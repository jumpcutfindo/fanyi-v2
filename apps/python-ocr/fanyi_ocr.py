import sys
import easyocr
import jieba


def main():
    try:
        image_data = sys.stdin.buffer.read()
        
        reader = easyocr.Reader(['ch_sim', 'en'])
        results = reader.readtext(image_data)
        
        text = "".join([result[1] for result in results])
        
        # Run segmentation on the decoded text string
        seg_list = jieba.cut(text, cut_all=False)
        
        # Join the segmented words into a single string
        segmented_text = " ".join(seg_list)
        
        # Encode the final segmented text to a UTF-8 byte stream
        encoded_text = segmented_text.encode('utf-8')
        
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