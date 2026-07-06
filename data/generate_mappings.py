"""One-time helper to bootstrap kodokan_mappings.json from legacy merge logic."""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

DATA_DIR = Path(__file__).parent

# Overrides for school-name variants with a verified Kodokan equivalent.
# Do NOT add doubtful couplings here — put those in unmapped via kodokan_mappings.json.
OVERRIDES: dict[str, str] = {
    "hon-geza-gatame": "Kesa-gatame",
    "ude-hishigi": "Ude-hishigi-ude-gatame",
    "hiza-gatame": "Ude-hishigi-hiza-gatame",
    "hara-katame": "Ude-hishigi-hara-gatame",
    "ashi-katame": "Ude-hishigi-ashi-gatame",
    "yoko-ude-hishigi": "Ude-hishigi-waki-gatame",
    "sode-guruma": "Sode-guruma-jime",
    "taware-gaeshi": "Tawara-gaeshi",
    "kata-ha-jime": "Kataha-jime",
}


def compact_key(text: str) -> str:
    s = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"[^a-z0-9]+", "", s)
    for a, b in [
        ("barai", "harai"),
        ("gesa", "kesa"),
        ("geza", "kesa"),
        ("oesa", "kesa"),
        ("katame", "gatame"),
        ("udi", "ude"),
        ("uri", "yoko"),
    ]:
        s = s.replace(a, b)
    return s


def first_name(name: str) -> str:
    return name.split("/")[0].strip()


def auto_match(
    technique: dict, lookup: dict[str, dict], by_name: dict[str, dict]
) -> str | None:
    tid = technique["id"]
    if tid in OVERRIDES:
        return OVERRIDES[tid]
    keys = [compact_key(tid), compact_key(first_name(technique["name"]))]
    for key in keys:
        if key in lookup:
            return lookup[key]["name"]
    return None


def main() -> None:
    judo = json.loads((DATA_DIR / "judotechnieken.json").read_text(encoding="utf-8"))
    kodokan = json.loads((DATA_DIR / "kodokan-techniques.json").read_text(encoding="utf-8"))

    lookup: dict[str, dict] = {}
    for tech in kodokan["techniques"]:
        lookup.setdefault(compact_key(tech["name"]), tech)
    by_name = {t["name"]: t for t in kodokan["techniques"]}

    mappings: dict[str, str] = {}
    unmapped: list[str] = []

    for technique in judo["techniques"]:
        tid = technique["id"]
        hit = auto_match(technique, lookup, by_name)
        if hit:
            mappings[tid] = hit
        else:
            unmapped.append(tid)

    notes = {
        "ude-hishigi": "EUJJJS 1e serie #3; shortened name for ude-gatame (juji-gatame is #1)",
        "gyaku-juji": "Arm lock in 3e serie; no Kodokan 100-techniques entry — left unmapped",
        "kami-sankaku-gatame": "School name; Kodokan lists as Sankaku-jime",
        "morote-seoi-nage": "School variant; maps to Seoi-nage",
    }

    out = {
        "schema_version": 1,
        "description": (
            "Explicit syllabus technique id → Kodokan official name. "
            "Every technique must appear in either mappings or unmapped."
        ),
        "mappings": dict(sorted(mappings.items())),
        "unmapped": sorted(unmapped),
        "notes": notes,
    }

    path = DATA_DIR / "kodokan_mappings.json"
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(mappings)} mappings, {len(unmapped)} unmapped -> {path}")


if __name__ == "__main__":
    main()
