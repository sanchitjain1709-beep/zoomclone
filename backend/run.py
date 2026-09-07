import os
import socket
import threading
import uvicorn

def start_port_bridge(target_port: int):
    """
    Ensure BOTH 8000 and 8080 respond.
    If FastAPI is on 8080, forward 8000 -> 8080.
    If FastAPI is on 8000, forward 8080 -> 8000.
    This permanently eliminates Railway Target Port mismatch 502 Bad Gateway errors.
    """
    alt_port = 8000 if target_port != 8000 else 8080

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
            print(f"[Port Bridge] Listening on 0.0.0.0:{alt_port} -> forwarding to 127.0.0.1:{target_port}", flush=True)
            while True:
                client_sock, _ = server.accept()
                try:
                    target_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    target_sock.connect(("127.0.0.1", target_port))
                    t1 = threading.Thread(target=forward, args=(client_sock, target_sock), daemon=True)
                    t2 = threading.Thread(target=forward, args=(target_sock, client_sock), daemon=True)
                    t1.start()
                    t2.start()
                except Exception:
                    client_sock.close()
        except Exception as e:
            print(f"[Port Bridge] Could not bind port {alt_port}: {e}", flush=True)

    t = threading.Thread(target=listener, daemon=True)
    t.start()

if __name__ == "__main__":
    port_env = os.environ.get("PORT", "8080")
    try:
        port = int(port_env)
    except (ValueError, TypeError):
        port = 8080

    start_port_bridge(port)

    print(f"Starting Zoom Clone FastAPI Server on 0.0.0.0:{port}...", flush=True)
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, access_log=True)
