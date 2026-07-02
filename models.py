"""Pydantic v2 models for judotechnieken.json.

Webapp-ready typed schema + loader with referential-integrity checks.

Usage:
    from models import load
    db = load("judotechnieken.json")
    db.by_belt("ge")            # techniques at yellow belt
    db.by_category("ashi_waza") # techniques in a category
    db.get("o-soto-gari")       # single technique by id
    db.validate_refs()          # list of broken counter/combination references
"""
from __future__ import annotations
from enum import Enum
from pathlib import Path
from typing import Optional
import json

from pydantic import BaseModel, Field, field_validator


class Belt(str, Enum):
    geel = "ge"
    oranje = "or"
    groen = "gr"
    blauw = "bl"
    bruin = "br"
    zwart = "zw"


class Domain(str, Enum):
    nage_waza = "nage_waza"   # standing / throwing
    ne_waza = "ne_waza"       # ground


class Technique(BaseModel):
    id: str
    name: str
    category: str
    domain: Domain
    belt: Optional[Belt] = None
    number: Optional[int] = None
    series: Optional[str] = None
    needs_review: bool = False
    description: Optional[str] = None
    youtube: Optional[str] = None


class Category(BaseModel):
    domain: Domain
    jp: str
    nl: str
    en: str


class Pair(BaseModel):
    """Base for name+id reference pairs (counters, combinations)."""
    source_ref: Optional[str] = None
    target_ref: Optional[str] = None
    needs_review: bool = False


class Counter(Pair):
    attack: str
    attack_id: Optional[str] = None
    counter: str
    counter_id: Optional[str] = None


class Combination(BaseModel):
    first: str
    first_id: Optional[str] = None
    then: str
    then_id: Optional[str] = None
    first_ref: Optional[str] = None
    then_ref: Optional[str] = None
    needs_review: bool = False


class GlossaryEntry(BaseModel):
    term: str
    nl: str


class CompetitionTerm(BaseModel):
    term: str
    nl: str


class Meta(BaseModel):
    source: str
    school: str
    language: str = "nl"
    schema_version: int = 1
    notes: str = ""
    ref_abbreviations: dict[str, str] = Field(default_factory=dict)


class JudoDB(BaseModel):
    meta: Meta
    belts: dict[str, str]
    categories: dict[str, Category]
    techniques: list[Technique]
    counters: list[Counter]
    combinations: list[Combination]
    glossary: list[GlossaryEntry]
    competition_terms: list[CompetitionTerm]

    @field_validator("techniques")
    @classmethod
    def _unique_ids(cls, v: list[Technique]) -> list[Technique]:
        ids = [t.id for t in v]
        dupes = {i for i in ids if ids.count(i) > 1}
        if dupes:
            raise ValueError(f"duplicate technique ids: {sorted(dupes)}")
        return v

    # --- query helpers ---
    def get(self, tid: str) -> Optional[Technique]:
        return next((t for t in self.techniques if t.id == tid), None)

    def by_belt(self, belt: str) -> list[Technique]:
        return [t for t in self.techniques if t.belt and t.belt.value == belt]

    def by_category(self, cat: str) -> list[Technique]:
        return [t for t in self.techniques if t.category == cat]

    def by_domain(self, domain: str) -> list[Technique]:
        return [t for t in self.techniques if t.domain.value == domain]

    def flagged(self) -> list[Technique]:
        return [t for t in self.techniques if t.needs_review]

    def validate_refs(self) -> list[str]:
        """Return human-readable list of broken counter/combination references."""
        ids = {t.id for t in self.techniques}
        problems: list[str] = []
        for c in self.counters:
            for name, rid in ((c.attack, c.attack_id), (c.counter, c.counter_id)):
                if rid is None or rid not in ids:
                    problems.append(f"counter -> unresolved technique '{name}'")
        for k in self.combinations:
            for name, rid in ((k.first, k.first_id), (k.then, k.then_id)):
                if rid is None or rid not in ids:
                    problems.append(f"combination -> unresolved technique '{name}'")
        return problems


def load(path: str | Path = "judotechnieken.json") -> JudoDB:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    return JudoDB.model_validate(data)


if __name__ == "__main__":
    import sys
    p = sys.argv[1] if len(sys.argv) > 1 else Path(__file__).with_name("judotechnieken.json")
    db = load(p)
    print(f"OK: parsed {len(db.techniques)} techniques, "
          f"{len(db.counters)} counters, {len(db.combinations)} combinations, "
          f"{len(db.glossary)} glossary, {len(db.competition_terms)} comp terms")
    print("belt counts:", {b: len(db.by_belt(b)) for b in db.belts})
    flagged = db.flagged()
    print(f"needs_review techniques ({len(flagged)}):", [t.name for t in flagged])
    refs = db.validate_refs()
    print(f"broken references ({len(refs)}):")
    for r in sorted(set(refs)):
        print("  -", r)
