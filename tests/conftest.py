import sys
from pathlib import Path
import copy
import pytest
from fastapi.testclient import TestClient

# Ensure src/ is importable
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from app import app, activities


@pytest.fixture
def client():
    """Provide a TestClient for the FastAPI app."""
    return TestClient(app)


@pytest.fixture(autouse=True)
def reset_activities():
    """Deep-copy and restore the in-memory activities between tests."""
    original = copy.deepcopy(activities)
    yield
    activities.clear()
    activities.update(original)
