import os
import sys
from pathlib import Path

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker


def _resolve_app_dir() -> Path:
    """Where church.db and uploads/ live.

    Priority: an explicit CHURCH_DATA_DIR (set by the Electron main process to
    a per-user data folder, so an app update never wipes user data) > next to
    the frozen .exe (PyInstaller sets sys.frozen) > the backend/ source
    checkout (plain `uvicorn app.main:app` dev workflow).
    """
    env_dir = os.environ.get("CHURCH_DATA_DIR")
    if env_dir:
        return Path(env_dir)
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent.parent


def _resolve_resources_dir() -> Path:
    """Where bundled read-only assets (the built frontend) live.

    Deliberately separate from APP_DIR: this points at the app's own install
    location (next to the frozen .exe), which an auto-update is free to
    replace — unlike APP_DIR, which must never move or be wiped.
    """
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent.parent


APP_DIR = _resolve_app_dir()
APP_DIR.mkdir(parents=True, exist_ok=True)

RESOURCES_DIR = _resolve_resources_dir()

SQLALCHEMY_DATABASE_URL = f"sqlite:///{(APP_DIR / 'church.db').as_posix()}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def sync_missing_columns() -> None:
    """Adds columns that exist on the model but not yet in the SQLite table.

    Stopgap for schema evolution during active development, since v1 has no
    Alembic migrations (see plan scope cuts). Only additive, never drops or
    renames — safe to run on every startup against an existing church.db.
    """
    inspector = inspect(engine)
    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            if not inspector.has_table(table.name):
                continue
            existing_columns = {col["name"] for col in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name in existing_columns:
                    continue
                col_type = column.type.compile(dialect=engine.dialect)
                default_clause = ""
                if column.default is not None and column.default.is_scalar:
                    value = column.default.arg
                    if isinstance(value, bool):
                        default_clause = f" DEFAULT {1 if value else 0}"
                    elif isinstance(value, (int, float)):
                        default_clause = f" DEFAULT {value}"
                    elif isinstance(value, str):
                        default_clause = f" DEFAULT '{value}'"
                conn.execute(
                    text(f'ALTER TABLE "{table.name}" ADD COLUMN "{column.name}" {col_type}{default_clause}')
                )
