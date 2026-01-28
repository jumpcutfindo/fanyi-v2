import sys

# Setup stream for writing logs
# We use stderr for logging only
sys.stderr = open(sys.stderr.fileno(), "w", encoding="utf-8", closefd=False)


def info(message: str) -> None:
    print(message, file=sys.stderr)


def error(message: str) -> None:
    print(message, file=sys.stderr)


def debug(message: str) -> None:
    print(message, file=sys.stderr)
