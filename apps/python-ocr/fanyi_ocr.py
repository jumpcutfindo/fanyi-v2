import glob
import os
import json
from shutil import rmtree
import sys
import easyocr
import jieba

def handle_pyinstaller_folders():
    try:
        # pylint: disable=protected-access,no-member
        base_path = sys._MEIPASS

        # Create a file "fanyi" in this folder
        # This acts as an indicator that this folder belongs to fanyi
        open(os.path.join(base_path, 'fanyi'), encoding='utf-8', mode = 'w').close()

        # Go to parent folder of MEIPASS
        temp_dir = os.path.abspath(os.path.join(base_path, '..'))

        temp_folders = glob.glob(os.path.join(temp_dir, '_MEI*'))

        print(f"Found {len(temp_folders)} temp folders matching _MEI* pattern", file=sys.stderr)

        for folder in temp_folders:
            # Check if file "fanyi" exists in the folder
            if not os.path.exists(os.path.join(folder, 'fanyi')):
                print(f"Folder {folder} does not contain file 'fanyi', skipping delete", file=sys.stderr)
                continue

            # Check that this isn't the current temp file being used
            if folder == base_path:
                print(f"Folder {folder} is the current temp file being used, skipping delete", file=sys.stderr)
                continue

            # Delete old folder
            print(f"Deleting old folder: {folder}", file=sys.stderr)
            rmtree(folder)
    except Exception:
        print("Exception occurred when trying to handle PyInstaller folders", file=sys.stderr)
        print(Exception, file=sys.stderr)
        return


def ocr_and_segment(image_path, reader):
    """
    Performs OCR and text segmentation on an image given its file path.
    """
    try:
        # Pass the file path directly to easyocr.readtext()
        results = reader.readtext(image_path)

        # Extract the segmented text from the results
        text = "".join([result[1] for result in results])
        seg_list = jieba.cut(text, cut_all=False)

        return {
            "results": list(
                map(
                    lambda result: {
                        # Convert coordinates to integers
                        "coordinates": list(
                            map(lambda point: [int(point[0]), int(point[1])], result[0])
                        ),
                        "text": result[1],
                        "confidence": result[2],
                    },
                    results,
                )
            ),
            "segmented_text": list(seg_list),
        }

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

    handle_pyinstaller_folders()

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

                    ocr_result = ocr_and_segment(image_path, reader)

                    # JSON stringify and send
                    sys.stdout.write(json.dumps(ocr_result) + "\n")
                    sys.stdout.flush()

                except Exception as e:
                    print(f"Error during OCR execution: {e}", file=sys.stderr)
                    sys.stderr.flush()
                    sys.stdout.write("ERROR\n")
                    sys.stdout.flush()

            elif command == "exit":
                print("Received 'exit' command. Shutting down.", file=sys.stderr)
                sys.exit(0)
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
