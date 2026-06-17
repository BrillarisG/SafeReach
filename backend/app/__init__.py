from flask import Flask
from flask_cors import CORS
from sentry_sdk.integrations.flask import FlaskIntegration
import sentry_sdk

from .config import Config
from .extensions import socketio
from .routes.health import health_bp
from .routes.http_fallback import api_bp
from .websocket import register_socket_handlers


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config())

    if app.config.get("SENTRY_DSN"):
        sentry_sdk.init(
            dsn=app.config["SENTRY_DSN"],
            integrations=[FlaskIntegration()],
            traces_sample_rate=0.05,
            environment=app.config["SAFE_REACH_ENV"],
        )

    CORS(app, origins=[app.config["FRONTEND_ORIGIN"]], supports_credentials=True)
    socketio.init_app(app, cors_allowed_origins=[app.config["FRONTEND_ORIGIN"]])

    app.register_blueprint(health_bp)
    app.register_blueprint(api_bp, url_prefix="/api/v1")
    register_socket_handlers(socketio)
    return app
