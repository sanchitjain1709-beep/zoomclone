#!/usr/bin/env python3
"""
Uvicorn launcher shim.
Automatically catches and resolves unexpanded shell variables like '$PORT' or '${PORT}'
and starts a port bridge so both 8000 and 8080 respond to Railway health checks.
"""
import os
import socket
import sys
import threading

port_val = os.environ.get("PORT", "8080")
new_argv = []
for arg in sys.argv:
    if arg in ("$PORT", "${PORT}", "${PORT:-8000}", "${PORT:-8080}"):
        new_argv.append(port_val)
    elif arg.startswith("--port=$PORT") or arg.startswith("--port=${PORT}"):
        new_argv.append(f"--port={port_val}")
    else:
        new_argv.append(arg)

sys.argv = new_argv

try:
    target_int_port = int(port_val)
except (ValueError, TypeError):
    target_int_port = 8080

alt_port = 8000 if target_int_port != 8000 else 8080

def forward(src, dst):
    try:
        while True:
            data = src.recv(4096)
            if not data:
                break
            dst.sendall(data)
    except Exception:
        pass
    finally:
        try:
            src.close()
        except Exception:
            pass
        try:
            dst.close()
        except Exception:
            pass

def listener():
    try:
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind(("0.0.0.0", alt_port))
        server.listen(128)
        print(f"[Port Bridge] Listening on 0.0.0.0:{alt_port} -> forwarding to 127.0.0.1:{target_int_port}", flush=True)
        while True:
            client_sock, _ = server.accept()
            try:
                target_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                target_sock.connect(("127.0.0.1", target_int_port))
                t1 = threading.Thread(target=forward, args=(client_sock, target_sock), daemon=True)
                t2 = threading.Thread(target=forward, args=(target_sock, client_sock), daemon=True)
                t1.start()
                t2.start()
            except Exception:
                client_sock.close()
    except Exception as e:
        print(f"[Port Bridge] Could not bind port {alt_port}: {e}", flush=True)

threading.Thread(target=listener, daemon=True).start()

from uvicorn.main import main

if __name__ == "__main__":
    sys.exit(main())
