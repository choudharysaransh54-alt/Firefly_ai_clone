import os
import sys
import tempfile
from pathlib import Path

import pytest

# Point the app at a throwaway SQLite file *before* it is imported, and make sure the
# optional LLM path is off so tests are deterministic and offline.
_tmp_dir = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite:///{Path(_tmp_dir) / 'test.db'}"
os.environ.pop("ANTHROPIC_API_KEY", None)
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    # Entering the context runs the lifespan: tables are created and demo data is seeded.
    with TestClient(app) as test_client:
        yield test_client
