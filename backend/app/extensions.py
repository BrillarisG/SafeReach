from flask_socketio import SocketIO

socketio = SocketIO(async_mode="eventlet", json=None, ping_timeout=30, ping_interval=20)
