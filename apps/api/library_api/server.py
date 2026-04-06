from concurrent.futures import ThreadPoolExecutor
import os

import grpc

from .config import Settings
from .db import Database
from .migrate import run_migrations, run_seed
from .repositories import LibraryRepository
from .service import LibraryService

from library.v1 import library_pb2_grpc


def serve() -> None:
    run_migrations()
    if os.getenv("RUN_SEED_ON_START", "0") == "1":
        run_seed()

    settings = Settings.from_env()
    db = Database(settings.database_url)
    repo = LibraryRepository(db)

    server = grpc.server(ThreadPoolExecutor(max_workers=10))
    library_pb2_grpc.add_LibraryServiceServicer_to_server(
        LibraryService(repo=repo, fine_per_day_cents=settings.fine_per_day_cents),
        server,
    )

    server.add_insecure_port(settings.grpc_bind_addr)
    server.start()
    print(f"gRPC server listening on {settings.grpc_bind_addr}")
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
