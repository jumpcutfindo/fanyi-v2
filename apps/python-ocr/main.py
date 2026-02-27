import json
import os
import sys
from app.utils import handle_pyinstaller_folders
from app.ipc import write_and_send
from app.processor import Processor
from app import logger
from app.types import AppFD, OutgoingModelReadyPayload

in_stream = (
  os.environ.get("ENV") == "development"
  and sys.stdin
  or os.fdopen(AppFD.DATA_IN, "r", encoding="utf-8", closefd=False)
)

public_path = os.environ.get("PUBLIC_PATH")
user_data_path = os.environ.get("USER_DATA_PATH")


def main():
  # On start, immediately try to fix leaked temp folders
  handle_pyinstaller_folders()

  logger.info("Setting up processor...")
  processor = Processor(public_path, user_data_path)

  logger.info("Processor ready to accept commands")
  write_and_send(OutgoingModelReadyPayload(action="model_ready"))

  for line in in_stream:
    try:
      payload = json.loads(line.strip())
      processor.process(payload["action"], payload)
    except Exception as e:
      logger.error(f"Failed to process payload: {e}")


if __name__ == "__main__":
  main()
