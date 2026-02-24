import os
import sys
from typing import Any

from . import logger
from . import ipc
from .dictionary import Dictionary
from .engine import OCRAnalyzer
from .types import OutgoingErrorPayload, OutgoingOcrResultPayload

class Processor:
    def __init__(self, public_path: str, user_data_path: str):
        logger.info("Initializing dictionary...")
        self.dictionary = Dictionary(public_path, user_data_path)

        logger.info("Initializing models...")
        self.analyzer = OCRAnalyzer(jieba_dict_path=self.dictionary.get_jieba_dict_path())

        pass

    def process(self, command: str, data: Any):
        match (command):
                case 'run_ocr':
                    logger.debug(f"Received 'run_ocr' command with image path {data['image_path']}")
                    
                    if not data['image_path'] or not os.path.exists(data['image_path']):
                        logger.error(
                            f"Error: Invalid or non-existent image path received: {data['image_path']}",
                        )
                        ipc.write_and_send(OutgoingErrorPayload(action="error", message="Invalid image path"))
                    
                    try:
                        ocr_result = self.analyzer.ocr_and_segment(data['image_path'])

                        ipc.write_and_send(OutgoingOcrResultPayload(
                            action="ocr_result",
                            data=ocr_result
                        ))
                    except Exception as e:
                        logger.error(f"Error during OCR execution: {e}")

                        ipc.write_and_send(OutgoingErrorPayload(
                            action="error",
                            message=str(e)
                        ))
                case 'exit':
                    logger.info("Received 'exit' command. Shutting down.")
                    sys.exit(0)
                case _:
                    logger.info(f"Unknown command received: '{command}'")