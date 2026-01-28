import os
import sys
import json
from app.utils import handle_pyinstaller_folders
from app.ipc import write_and_send
from app.engine import OCRAnalyzer
from app import logger


def main():
    handle_pyinstaller_folders()

    logger.info("Initializing models...")
    analyzer = OCRAnalyzer()
    logger.info("Models are ready. Awaiting 'run-ocr' command...")

    sys.stderr.flush()

    for line in sys.stdin:
        command = line.strip()

        if command == "run-ocr":
            try:
                # Read the full file path from stdin
                image_path = sys.stdin.readline().strip()

                if not image_path or not os.path.exists(image_path):
                    logger.info(
                        f"Error: Invalid or non-existent image path received: {image_path}",
                    )
                    write_and_send("ERROR")
                    continue

                ocr_result = analyzer.ocr_and_segment(image_path)

                # JSON stringify and send
                write_and_send(json.dumps(ocr_result))

            except Exception as e:
                logger.info(f"Error during OCR execution: {e}")
                sys.stderr.flush()

                write_and_send("ERROR")
        elif command == "exit":
            logger.info("Received 'exit' command. Shutting down.")
            sys.exit(0)
        elif not command:
            # This case handles EOF (End of File), which signifies the pipe has been closed
            logger.info("End of input stream detected. Shutting down.")
            break

        else:
            logger.info(
                f"Unknown command received: '{command}'. Awaiting 'run-ocr'."
            )


if __name__ == "__main__":
    main()
