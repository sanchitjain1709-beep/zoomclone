#!/usr/bin/env python3
"""
Uvicorn launcher shim.
Automatically catches and resolves unexpanded shell variables like '$PORT' or '${PORT}'
when start commands are executed directly without a shell on cloud hosts like Railway.
"""
import os
import sys

port_val = os.environ.get("PORT", "8000")
new_argv = []
for arg in sys.argv:
    if arg in ("$PORT", "${PORT}", "${PORT:-8000}"):
        new_argv.append(port_val)
    elif arg.startswith("--port=$PORT") or arg.startswith("--port=${PORT}"):
        new_argv.append(f"--port={port_val}")
    else:
        new_argv.append(arg)

sys.argv = new_argv

from uvicorn.main import main

if __name__ == "__main__":
    sys.exit(main())
