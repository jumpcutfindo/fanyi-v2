import json
import os
import sys
from .types import AppFD, OutgoingDataPayload

# Setup stream for writing messages
out_stream = os.environ.get("ENV") == "development" and sys.stdout or os.fdopen(AppFD.DATA_OUT, "w", encoding="utf-8", closefd=False)


def write_and_send(data: OutgoingDataPayload) -> None:
  """Writes data to stdout and flushes it"""
  out_stream.write(json.dumps(data))
  out_stream.flush()
