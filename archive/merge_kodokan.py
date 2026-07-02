import json
import re
import unicodedata

# Judo school id -> Kodokan official technique name
MANUAL: dict[str, str] = {
    "hon-geza-gatame": "Kesa-gatame",
    "kata-oesa-gatame": "Kata-gatame",
    "uri-shiho-gatame": "Yoko-shiho-gatame",
    "kami-sankaku-gatame": "Sankaku-jime",
    "ude-hishigi": "Ude-hishigi-juji-gatame",
    "hiza-gatame": "Ude-hishigi-hiza-gatame",
    "hiza-gatame-2": "Ude-hishigi-hiza-gatame",
    "hara-katame": "Ude-hishigi-hara-gatame",
    "ashi-katame": "Ude-hishigi-ashi-gatame",
    "yoko-ude-hishigi": "Ude-hishigi-waki-gatame",
    "kami-ude-juji-gatame": "Ude-hishigi-juji-gatame",
    "kami-hiza-katame": "Ude-hishigi-hiza-gatame",
    "ude-hishigi-hiza-katame": "Ude-hishigi-hiza-gatame",
    "gyaku-juji": "Gyaku-juji-jime",
    "sode-guruma": "Sode-guruma-jime",
    "tsukomi-jime": "Tsukkomi-jime",
    "morote-seoi-nage": "Seoi-nage",
    "taware-gaeshi": "Tawara-gaeshi",
    "narabi-juji-jime": "Nami-juji-jime",
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


def build_kodokan_lookup(techniques: list[dict]) -> dict[str, dict]:
    lookup: dict[str, dict] = {}
    for tech in techniques:
        keys = {compact_key(tech["name"])}
        for key in list(keys):
            lookup.setdefault(key, tech)
    return lookup


def match_technique(
    technique: dict, lookup: dict[str, dict], by_name: dict[str, dict]
) -> dict | None:
    tid = technique["id"]
    if tid in MANUAL:
        return by_name.get(MANUAL[tid])

    keys = [
        compact_key(tid),
        compact_key(first_name(technique["name"])),
    ]
    for key in keys:
        if key in lookup:
            return lookup[key]
    return None


def merge(judo_path: str, kodokan_path: str) -> tuple[dict, list[str]]:
    judo = json.load(open(judo_path, encoding="utf-8"))
    kodokan = json.load(open(kodokan_path, encoding="utf-8"))

    lookup = build_kodokan_lookup(kodokan["techniques"])
    by_name = {t["name"]: t for t in kodokan["techniques"]}

    unmatched: list[str] = []
    matched = 0

    for technique in judo["techniques"]:
        hit = match_technique(technique, lookup, by_name)
        if hit:
            matched += 1
            technique["description"] = hit["description"]
            if "youtube" in hit:
                technique["youtube"] = hit["youtube"]
        else:
            unmatched.append(technique["name"])

    judo["meta"]["kodokan_source"] = kodokan["source"]
    judo["meta"]["kodokan_matched"] = matched
    judo["meta"]["kodokan_unmatched"] = len(unmatched)

    return judo, unmatched


if __name__ == "__main__":
    import sys

    dry_run = "--dry-run" in sys.argv
    judo_path = "judotechnieken.json"
    kodokan_path = "kodokan-techniques.json"

    if dry_run:
        judo = json.load(open(judo_path, encoding="utf-8"))
        kodokan = json.load(open(kodokan_path, encoding="utf-8"))
        lookup = build_kodokan_lookup(kodokan["techniques"])
        by_name = {t["name"]: t for t in kodokan["techniques"]}
        for technique in judo["techniques"]:
            hit = match_technique(technique, lookup, by_name)
            if hit:
                print(f"OK   {technique['id']:32} -> {hit['name']}")
            else:
                print(f"MISS {technique['id']:32} | {technique['name']}")
        sys.exit(0)

    data, unmatched = merge(judo_path, kodokan_path)
    with open("judotechnieken.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Matched {data['meta']['kodokan_matched']}/{len(data['techniques'])} techniques")
    if unmatched:
        print("Unmatched:")
        for name in unmatched:
            print(f"  - {name}")
