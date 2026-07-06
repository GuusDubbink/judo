"""Deprecated — use data/kodokan_merge.py instead.

This module remains as a thin wrapper for backwards compatibility.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from data.kodokan_merge import main  # noqa: E402

if __name__ == "__main__":
    main()
