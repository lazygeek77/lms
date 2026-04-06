import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PROTO_GEN_PATH = ROOT / "packages" / "proto" / "gen" / "python"
if str(PROTO_GEN_PATH) not in sys.path:
    sys.path.insert(0, str(PROTO_GEN_PATH))

from library_api.server import serve


if __name__ == "__main__":
    serve()
