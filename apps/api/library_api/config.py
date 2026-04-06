from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    database_url: str
    grpc_bind_addr: str
    fine_per_day_cents: int

    @staticmethod
    def from_env() -> "Settings":
        return Settings(
            database_url=os.getenv("DATABASE_URL", "postgresql://lms:lms@localhost:5432/lms"),
            grpc_bind_addr=os.getenv("GRPC_BIND_ADDR", "0.0.0.0:50051"),
            fine_per_day_cents=int(os.getenv("FINE_PER_DAY_CENTS", "50")),
        )
