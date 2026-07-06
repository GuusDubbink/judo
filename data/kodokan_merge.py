"""Merge Kodokan descriptions and YouTube links into judotechnieken.json.

Mappings are explicit in kodokan_mappings.json — no fuzzy matching at merge time.
Run tests with: uv run pytest data/
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).parent
JUDO_PATH = DATA_DIR / "judotechnieken.json"
KODOKAN_PATH = DATA_DIR / "kodokan-techniques.json"
MAPPINGS_PATH = DATA_DIR / "kodokan_mappings.json"


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def load_mappings(path: Path = MAPPINGS_PATH) -> dict[str, str]:
    data = load_json(path)
    return data["mappings"]


def load_unmapped(path: Path = MAPPINGS_PATH) -> set[str]:
    data = load_json(path)
    return set(data.get("unmapped", []))


def validate_mappings(
    judo: dict[str, Any],
    kodokan: dict[str, Any],
    mappings: dict[str, str],
    unmapped: set[str],
) -> list[str]:
    """Return human-readable validation errors (empty = OK)."""
    syllabus_ids = {t["id"] for t in judo["techniques"]}
    kodokan_names = {t["name"] for t in kodokan["techniques"]}
    errors: list[str] = []

    overlap = set(mappings) & unmapped
    if overlap:
        errors.append(f"ids in both mappings and unmapped: {sorted(overlap)}")

    for sid, kname in sorted(mappings.items()):
        if sid not in syllabus_ids:
            errors.append(f"unknown syllabus id in mappings: {sid}")
        if kname not in kodokan_names:
            errors.append(f"unknown kodokan name for {sid}: {kname}")

    for sid in unmapped:
        if sid not in syllabus_ids:
            errors.append(f"unknown syllabus id in unmapped: {sid}")

    mapped_or_unmapped = set(mappings) | unmapped
    for tech in judo["techniques"]:
        if tech["id"] not in mapped_or_unmapped:
            errors.append(f"technique not in mappings or unmapped: {tech['id']}")

    return errors


def resolve_kodokan(
    syllabus_id: str,
    mappings: dict[str, str],
    unmapped: set[str],
    by_name: dict[str, dict],
) -> dict | None:
    if syllabus_id in unmapped:
        return None
    kname = mappings.get(syllabus_id)
    if not kname:
        return None
    return by_name.get(kname)


def merge(
    judo_path: Path = JUDO_PATH,
    kodokan_path: Path = KODOKAN_PATH,
    mappings_path: Path = MAPPINGS_PATH,
) -> tuple[dict[str, Any], list[str]]:
    judo = load_json(judo_path)
    kodokan = load_json(kodokan_path)
    mappings = load_mappings(mappings_path)
    unmapped = load_unmapped(mappings_path)

    errors = validate_mappings(judo, kodokan, mappings, unmapped)
    if errors:
        raise ValueError("Invalid kodokan mappings:\n  " + "\n  ".join(errors))

    by_name = {t["name"]: t for t in kodokan["techniques"]}
    unmatched: list[str] = []
    matched = 0

    for technique in judo["techniques"]:
        tid = technique["id"]
        hit = resolve_kodokan(tid, mappings, unmapped, by_name)
        if hit:
            matched += 1
            technique["description"] = hit["description"]
            if "youtube" in hit:
                technique["youtube"] = hit["youtube"]
            else:
                technique.pop("youtube", None)
        else:
            technique.pop("description", None)
            technique.pop("youtube", None)
            if tid not in unmapped:
                unmatched.append(technique["name"])

    judo["meta"]["kodokan_source"] = kodokan["source"]
    judo["meta"]["kodokan_matched"] = matched
    judo["meta"]["kodokan_unmatched"] = len(unmapped)

    return judo, unmatched


def main() -> None:
    dry_run = "--dry-run" in sys.argv
    write = "--write" in sys.argv

    judo = load_json(JUDO_PATH)
    kodokan = load_json(KODOKAN_PATH)
    mappings = load_mappings()
    unmapped = load_unmapped()
    by_name = {t["name"]: t for t in kodokan["techniques"]}

    errors = validate_mappings(judo, kodokan, mappings, unmapped)
    if errors:
        print("VALIDATION ERRORS:")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)

    if dry_run:
        for technique in judo["techniques"]:
            tid = technique["id"]
            hit = resolve_kodokan(tid, mappings, unmapped, by_name)
            if hit:
                print(f"OK   {tid:32} -> {hit['name']}")
            else:
                print(f"SKIP {tid:32} | {technique['name']}")
        sys.exit(0)

    data, unmatched = merge()
    if write:
        JUDO_PATH.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    print(f"Matched {data['meta']['kodokan_matched']}/{len(data['techniques'])} techniques")
    print(f"Explicitly unmapped: {len(unmapped)}")
    if unmatched:
        print("Unexpected unmatched:")
        for name in unmatched:
            print(f"  - {name}")


if __name__ == "__main__":
    main()
