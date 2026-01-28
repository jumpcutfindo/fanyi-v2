import sys

# Setup stream for writing messages
# We use stdout for transfer of data
sys.stdout = open(sys.stdout.fileno(), "w", encoding="utf-8", closefd=False)


def write_and_send(data: str) -> None:
    """Writes data to stdout and flushes it"""
    sys.stdout.write(data + "\n")
    sys.stdout.flush()
