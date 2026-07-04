from flask_socketio import SocketIO

socketio = SocketIO(async_mode="threading", json=None, ping_timeout=30, ping_interval=20)
