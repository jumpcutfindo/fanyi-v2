import json
import os
import sys
from app.utils import handle_pyinstaller_folders
from app.ipc import write_and_send
from app.engine import OCRAnalyzer
from app.dictionary import Dictionary
from app import logger
from app.types import AppFD, OutgoingErrorPayload, OutgoingModelReadyPayload, OutgoingOcrResultPayload

in_stream = os.fdopen(AppFD.DATA_IN, "r", encoding="utf-8", closefd=False)

def main():
    handle_pyinstaller_folders()

    args = sys.argv[0].split('|||')

    logger.info("Initializing dictionary...")
    dictionary = Dictionary(public_path=args[0], user_data_path=args[1])

    logger.info("Initializing models...")
    analyzer = OCRAnalyzer()

    write_and_send(OutgoingModelReadyPayload(action="model_ready"))

    for line in in_stream:
        command = json.loads(line.strip())
        
        match command['action']:
            case 'run_ocr':
                logger.debug(f"Received 'run_ocr' command with image path {command['image_path']}")
                
                if not command['image_path'] or not os.path.exists(command['image_path']):
                    logger.error(
                        f"Error: Invalid or non-existent image path received: {command['image_path']}",
                    )
                    write_and_send(OutgoingErrorPayload(action="error", message="Invalid image path"))
                    continue
                
                try:
                    ocr_result = analyzer.ocr_and_segment(command['image_path'])

                    write_and_send(OutgoingOcrResultPayload(
                        action="ocr_result",
                        data=ocr_result
                    ))
                except Exception as e:
                    logger.error(f"Error during OCR execution: {e}")

                    write_and_send(OutgoingErrorPayload(
                        action="error",
                        message=str(e)
                    ))
                break
            case 'exit':
                logger.info("Received 'exit' command. Shutting down.")
                sys.exit(0)
            case _:
                logger.info(f"Unknown command received: '{command['action']}'")


if __name__ == "__main__":
    main()
