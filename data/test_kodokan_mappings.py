"""Tests for explicit Kodokan syllabus → reference mappings."""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from data.kodokan_merge import (
    load_mappings,
    load_unmapped,
    merge,
    resolve_kodokan,
    validate_mappings,
)

DATA_DIR = Path(__file__).parent


@pytest.fixture
def judo() -> dict:
    return json.loads((DATA_DIR / "judotechnieken.json").read_text(encoding="utf-8"))


@pytest.fixture
def kodokan() -> dict:
    return json.loads((DATA_DIR / "kodokan-techniques.json").read_text(encoding="utf-8"))


@pytest.fixture
def mappings() -> dict[str, str]:
    return load_mappings()


@pytest.fixture
def unmapped() -> set[str]:
    return load_unmapped()


@pytest.fixture
def by_name(kodokan: dict) -> dict[str, dict]:
    return {t["name"]: t for t in kodokan["techniques"]}


def test_mappings_file_is_complete(judo, kodokan, mappings, unmapped):
    errors = validate_mappings(judo, kodokan, mappings, unmapped)
    assert errors == [], "\n".join(errors)


def test_every_technique_accounted_for(judo, mappings, unmapped):
    syllabus_ids = {t["id"] for t in judo["techniques"]}
    assert set(mappings) | unmapped == syllabus_ids


def test_no_overlap_between_mapped_and_unmapped(mappings, unmapped):
    assert set(mappings).isdisjoint(unmapped)


def test_all_kodokan_targets_exist(kodokan, mappings):
    names = {t["name"] for t in kodokan["techniques"]}
    missing = {k: v for k, v in mappings.items() if v not in names}
    assert missing == {}


# --- Regression: armklemmen serie couplings (EUJJJS rijtjes) ---


@pytest.mark.parametrize(
    ("syllabus_id", "kodokan_name", "youtube_id"),
    [
        ("udi-hishigi-juji-katame", "Ude-hishigi-juji-gatame", "OWgSOlCuMXw"),
        ("ude-hishigi", "Ude-hishigi-ude-gatame", "SBf0aTma1VI"),
        ("ude-garami", "Ude-garami", "AIlTvZb4RlE"),
        ("hiza-gatame", "Ude-hishigi-hiza-gatame", "H2HtAJdiJcE"),
        ("yoko-ude-hishigi", "Ude-hishigi-waki-gatame", "8F5p1zuJRG0"),
    ],
)
def test_armklemmen_mappings(syllabus_id, kodokan_name, youtube_id, mappings, by_name):
    assert mappings[syllabus_id] == kodokan_name
    hit = by_name[kodokan_name]
    assert youtube_id in hit["youtube"]


def test_ude_hishigi_not_juji_gatame(mappings):
    """1e serie #3 is ude-gatame; juji-gatame is already #1 (udi-hishigi-juji-katame)."""
    assert mappings["ude-hishigi"] == "Ude-hishigi-ude-gatame"
    assert mappings["ude-hishigi"] != mappings["udi-hishigi-juji-katame"]


def test_gyaku_juji_arm_lock_not_choked(mappings, unmapped):
    """Gyaku Juji in kansetsu_waza must not map to Gyaku-juji-jime (a strangulation)."""
    assert "gyaku-juji" in unmapped
    assert mappings.get("gyaku-juji") != "Gyaku-juji-jime"


def test_same_serie_no_duplicate_video_in_1e_armklemmen(judo, mappings, by_name):
    """Within 1e serie armklemmen, each mapped technique should have a distinct video."""
    serie = [
        t for t in judo["techniques"]
        if t.get("series") == "1e serie" and t["category"] == "kansetsu_waza"
    ]
    videos: list[str] = []
    for tech in serie:
        kname = mappings.get(tech["id"])
        if not kname:
            continue
        url = by_name[kname].get("youtube", "")
        videos.append(url.split("/")[-1])
    assert len(videos) == len(set(videos)), f"duplicate videos in 1e serie: {videos}"


@pytest.mark.parametrize(
    "syllabus_id",
    [
        "kami-sankaku-gatame",
        "kata-oesa-gatame",
        "narabi-juji-jime",
        "tsukomi-jime",
        "kami-ude-juji-gatame",
        "kami-hiza-katame",
        "hiza-gatame-2",
        "ude-hishigi-hiza-katame",
        "uri-shiho-gatame",
    ],
)
def test_doubtful_couplings_stay_unmapped(syllabus_id, unmapped):
    assert syllabus_id in unmapped


def test_no_duplicate_kodokan_video_per_mapping(mappings, by_name):
    """Each mapped syllabus technique should own its Kodokan YouTube clip."""
    seen: dict[str, str] = {}
    for sid, kname in mappings.items():
        url = by_name[kname].get("youtube", "")
        vid = url.split("/")[-1]
        if vid in seen:
            pytest.fail(f"{sid} shares video {vid} with {seen[vid]} via {kname}")
        seen[vid] = sid


def test_sasae_tsurikomi_ashi_has_kodokan_video(judo, mappings, by_name):
    """Regression: Kodokan reference was missing YouTube; mapped syllabus should get clip after merge."""
    kname = mappings["sasae-tsuri-komi-ashi"]
    assert kname == "Sasae-tsurikomi-ashi"
    assert by_name[kname].get("youtube")
    tech = next(t for t in judo["techniques"] if t["id"] == "sasae-tsuri-komi-ashi")
    assert tech.get("youtube"), "re-run kodokan_merge.py --write after adding Kodokan clip"
    data, unexpected = merge()
    assert unexpected == []
    assert data["meta"]["kodokan_matched"] == 70


@pytest.mark.parametrize(
    ("syllabus_id", "kodokan_name", "youtube_id"),
    [
        ("ippon-seoi-nage", "Ippon-seoi-nage", "FQnOlCxo4oI"),
        ("morote-seoi-nage", "Seoi-nage", "zIq0xI0ogxk"),
    ],
)
def test_seoi_variants_use_distinct_kodokan_clips(syllabus_id, kodokan_name, youtube_id, mappings, by_name):
    assert mappings[syllabus_id] == kodokan_name
    assert youtube_id in by_name[kodokan_name]["youtube"]


def test_resolve_returns_none_for_unmapped(unmapped, mappings, by_name):
    for tid in unmapped:
        assert resolve_kodokan(tid, mappings, unmapped, by_name) is None
