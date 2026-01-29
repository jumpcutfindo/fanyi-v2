import json
import os
import sys
from .types import AppFD, OutgoingLogPayload

# Setup stream for writing logs
log_stream = os.fdopen(AppFD.LOGS, "w", encoding="utf-8", closefd=False)
sys.stdout = log_stream

def info(message: str) -> None:
    print(json.dumps(OutgoingLogPayload(type="info", message=message)), file=log_stream)
    log_stream.flush()

def error(message: str) -> None:
    print(json.dumps(OutgoingLogPayload(type="error", message=message)), file=log_stream)
    log_stream.flush()

def debug(message: str) -> None:
    print(json.dumps(OutgoingLogPayload(type="debug", message=message)), file=log_stream)
    log_stream.flush()