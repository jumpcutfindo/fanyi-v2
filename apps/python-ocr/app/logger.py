import os
import sys
from .types import AppFD 

# Setup stream for writing logs
log_stream = os.fdopen(AppFD.LOGS, "w", encoding="utf-8", closefd=False)
sys.stdout = log_stream

def info(message: str) -> None:
    print(message, file=log_stream)
    log_stream.flush()

def error(message: str) -> None:
    print(message, file=log_stream)
    log_stream.flush()

def debug(message: str) -> None:
    print(message, file=log_stream)
    log_stream.flush()