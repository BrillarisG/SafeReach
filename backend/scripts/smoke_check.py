from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from app import create_app


def main() -> None:
    app = create_app()
    with app.test_client() as client:
        response = client.get("/health")
        assert response.status_code == 200, response.data
        print(response.get_json())


if __name__ == "__main__":
    main()
