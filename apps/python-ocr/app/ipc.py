import json
import os
from .types import AppFD, OutgoingPayload

# Setup stream for writing messages
out_stream = os.fdopen(AppFD.DATA_OUT, "w", encoding="utf-8", closefd=False)

def write_and_send(data: OutgoingPayload) -> None:
    """Writes data to stdout and flushes it"""
    out_stream.write(json.dumps(data))
    out_stream.flush()  