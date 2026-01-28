import os
import sys
import json
from app.utils import handle_pyinstaller_folders
from app.engine import OCRAnalyzer


def main():
    # Setup streams
    sys.stdout = open(sys.stdout.fileno(), "w", encoding="utf-8", closefd=False)
    sys.stderr = open(sys.stderr.fileno(), "w", encoding="utf-8", closefd=False)

    handle_pyinstaller_folders()

    print("Initializing models...", file=sys.stderr)
    analyzer = OCRAnalyzer()
    print("Ready. Awaiting commands...", file=sys.stderr)

    for line in sys.stdin:
        command = line.strip()

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

                ocr_result = analyzer.ocr_and_segment(image_path)

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


if __name__ == "__main__":
    main()
