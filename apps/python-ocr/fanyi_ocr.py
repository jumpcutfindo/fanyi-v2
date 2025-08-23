import sys
import easyocr
import jieba


def ocr_and_segment(image_data, reader):
    """
    Performs OCR and text segmentation on the given image data.
    """
    try:
        # Perform OCR using the pre-initialized reader
        results = reader.readtext(image_data)
        text = "".join([result[1] for result in results])

        # Run segmentation on the decoded text string
        seg_list = jieba.cut(text, cut_all=False)
        segmented_text = " ".join(seg_list)

        return segmented_text

    except Exception as e:
        # Propagate exceptions for logging in the main loop
        raise RuntimeError(f"OCR or segmentation failed: {e}") from e


def main():
    # Force UTF-8 encoding for stdout and stderr
    sys.stdout = open(sys.stdout.fileno(), "w", encoding="utf-8", closefd=False)
    sys.stderr = open(sys.stderr.fileno(), "w", encoding="utf-8", closefd=False)

    print(
        "Initializing OCR and segmentation models. This may take a moment...",
        file=sys.stderr,
    )

    try:
        # Initialize models once outside the loop
        reader = easyocr.Reader(["ch_sim"])

        # Perform a dummy call to 'jieba' to ensure the dictionary is loaded
        _ = list(jieba.cut("初始化", cut_all=False))

        print("Models are ready. Awaiting 'run-ocr' command...", file=sys.stderr)

        while True:
            # Read a single line for the command
            command = sys.stdin.readline().strip()

            if command == "run-ocr":
                print("Received 'run-ocr' command.", file=sys.stderr)
                try:
                    # Read the size of the incoming image data
                    size_str = sys.stdin.readline().strip()
                    if not size_str.isdigit():
                        print(
                            "Error: Expected image size after 'run-ocr' command.",
                            file=sys.stderr,
                        )
                        continue

                    print("Received image size:", size_str, file=sys.stderr)
                    image_size = int(size_str)

                    # Read the image data from stdin as a byte stream
                    image_data = sys.stdin.buffer.read(image_size)
                    print("Received image data with expected size", file=sys.stderr)

                    if len(image_data) < image_size:
                        print(
                            f"Error: Incomplete image data received. Expected {image_size} bytes, got {len(image_data)}.",
                            file=sys.stderr,
                        )
                        continue

                    # Process the image
                    print("Performing OCR and segmentation...", file=sys.stderr)
                    segmented_text = ocr_and_segment(image_data, reader)

                    print("OCR and segmentation completed.", file=sys.stderr)

                    # Write the result back to stdout
                    sys.stdout.write(segmented_text + "\n")
                    sys.stdout.flush()  # Ensure the output is sent immediately

                except Exception as e:
                    print(f"Error during OCR execution: {e}", file=sys.stderr)
                    # Indicate an error to the parent process
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
