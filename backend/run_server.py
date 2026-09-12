"""Entry point for the PyInstaller-frozen backend executable.

Not used in normal development (that still runs `uvicorn app.main:app
--reload`) — this is what Electron's main process spawns in a packaged
build, since a frozen exe has no `uvicorn` CLI to invoke.
"""

import multiprocessing
import os

import uvicorn

from app.main import app

if __name__ == "__main__":
    # Defensive: prevents a frozen Windows exe from recursively re-launching
    # itself if anything down the stack ever reaches for multiprocessing.
    multiprocessing.freeze_support()

    port = int(os.environ.get("CHURCH_PORT", "8001"))
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
