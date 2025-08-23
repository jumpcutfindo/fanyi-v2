import sys
import easyocr
import jieba
import os


def ocr_and_segment(image_path, reader):
    """
    Performs OCR and text segmentation on an image given its file path.
    """
    try:
        # Pass the file path directly to easyocr.readtext()
        results = reader.readtext(image_path)

        text = "".join([result[1] for result in results])
        seg_list = jieba.cut(text, cut_all=False)
        segmented_text = " ".join(seg_list)
        return segmented_text

    except Exception as e:
        # Re-raise exceptions with a custom message for better debugging
        raise RuntimeError(f"OCR or segmentation failed: {e}") from e


def main():
    # Force UTF-8 encoding for stdout and stderr to handle Chinese characters
    sys.stdout = open(sys.stdout.fileno(), "w", encoding="utf-8", closefd=False)
    sys.stderr = open(sys.stderr.fileno(), "w", encoding="utf-8", closefd=False)

    print(
        "Initializing OCR and segmentation models. This may take a moment...",
        file=sys.stderr,
    )

    try:
        # Initialize EasyOCR reader once
        reader = easyocr.Reader(["ch_sim"])

        # Perform a dummy call to 'jieba' to ensure the dictionary is loaded
        _ = list(jieba.cut("初始化", cut_all=False))

        print("Models are ready. Awaiting 'run-ocr' command...", file=sys.stderr)

        sys.stderr.flush()

        while True:
            # Read a single line for the command
            command = sys.stdin.readline().strip()

            if command == "run-ocr":
                try:
                    # Read the full file path from stdin
                    image_path = sys.stdin.readline().strip()

                    if not image_path or not os.path.exists(image_path):
                        print(
                            f"Error: Invalid or non-existent image path received: {image_path}",
                            file=sys.stderr,
                        )
                        sys.stdout.write("ERROR\n")
                        sys.stdout.flush()
                        continue

                    segmented_text = ocr_and_segment(image_path, reader)
                    sys.stdout.write(segmented_text + "\n")
                    sys.stdout.flush()

                except Exception as e:
                    print(f"Error during OCR execution: {e}", file=sys.stderr)
                    sys.stdout.write("ERROR\n")
                    sys.stdout.flush()

            elif command == "exit":
                print("Received 'exit' command. Shutting down.", file=sys.stderr)
                break

            elif not command:
                # This case handles EOF (End of File), which signifies the pipe has been closed
                print("End of input stream detected. Shutting down.", file=sys.stderr)
                break

            else:
                print(
                    f"Unknown command received: '{command}'. Awaiting 'run-ocr'.",
                    file=sys.stderr,
                )

    except Exception as e:
        print(f"Fatal error in main loop: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
