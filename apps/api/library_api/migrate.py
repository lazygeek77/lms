from pathlib import Path

from .config import Settings
from .db import Database


def run_migrations() -> None:
    settings = Settings.from_env()
    db = Database(settings.database_url)

    migrations_dir = Path(__file__).resolve().parents[3] / "packages" / "db" / "migrations"
    migration_files = sorted(migrations_dir.glob("*.sql"))

    with db.conn() as conn:
        for file_path in migration_files:
            sql = file_path.read_text()
            conn.execute(sql)


def run_seed() -> None:
    settings = Settings.from_env()
    db = Database(settings.database_url)
    seed_file = Path(__file__).resolve().parents[3] / "packages" / "db" / "seed.sql"

    with db.conn() as conn:
        conn.execute(seed_file.read_text())


if __name__ == "__main__":
    run_migrations()
    run_seed()
