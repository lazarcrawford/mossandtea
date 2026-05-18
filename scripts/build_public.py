#!/usr/bin/env python3
"""Build deployable static assets into ./public.

Cloudflare Workers serves only this generated directory. Source files,
Supabase migrations, scripts, and local artifacts stay out of the public
asset root.
"""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SELECTED_ARCHIVE_SOURCE = ROOT / "assets" / "Moss and Tea Website"
SELECTED_ARCHIVE_FILES = (
    {path.name for path in SELECTED_ARCHIVE_SOURCE.iterdir()}
    if SELECTED_ARCHIVE_SOURCE.exists()
    else set()
)

FILES = [
    "index.html",
]

DIRS = [
    "admin",
    "css",
    "data",
    "hermitage",
    "images",
    "js",
    "portal",
    "telegram-console",
]


def copy_file(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def copy_dir(src: Path, dst: Path) -> None:
    if dst.exists():
        shutil.rmtree(dst)

    def ignore(directory: str, names: list[str]) -> set[str]:
        ignored = {"__pycache__", ".DS_Store"}.intersection(names)
        directory_path = Path(directory)
        rel = directory_path.relative_to(ROOT).as_posix()
        if rel == "images/irina":
            ignored.update(name for name in names if name in SELECTED_ARCHIVE_FILES)
        return ignored

    shutil.copytree(
        src,
        dst,
        ignore=ignore,
    )


def main() -> None:
    if PUBLIC.exists():
        shutil.rmtree(PUBLIC)
    PUBLIC.mkdir(parents=True)

    for file_name in FILES:
        copy_file(ROOT / file_name, PUBLIC / file_name)

    for dir_name in DIRS:
        copy_dir(ROOT / dir_name, PUBLIC / dir_name)

    print(f"Built public assets in {PUBLIC}")


if __name__ == "__main__":
    main()
