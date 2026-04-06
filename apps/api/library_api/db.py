from contextlib import contextmanager
from typing import Iterator

import psycopg
from psycopg.rows import dict_row


class Database:
    def __init__(self, dsn: str) -> None:
        self._dsn = dsn

    @contextmanager
    def conn(self) -> Iterator[psycopg.Connection]:
        connection = psycopg.connect(self._dsn, autocommit=True, row_factory=dict_row)
        try:
            yield connection
        finally:
            connection.close()
