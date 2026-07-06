# App Store Connect — listing fields

Copy-paste source for the three App Store Connect fields that aren't already
covered by `listing-nl.md` / `listing-en.md` (Name, Subtitle, Description,
Keywords all exist there — this file adds **Promotional Text**, and gives an
ASC-ready **Keywords** string plus notes on field limits).

Primary locale for the store listing is **Dutch** (`nl-NL`) since the app UI
itself is Dutch-only. English is a secondary/fallback locale if you add one in
ASC.

---

## Promotional Text (170 chars max)

Shown above the Description on the product page. Unlike Description/Keywords,
it can be edited **any time without triggering App Review** — good for
seasonal notes ("nieuwe technieken toegevoegd", exam-season reminders, etc.).
Not indexed for search, so no need to stuff keywords here.

**Dutch (nl-NL):**

```
Oefen de judotechnieken van EUJJJS wanneer je maar wilt — geen account, geen
advertenties, gratis. Ideaal ter voorbereiding op je band-examen.
```
(133 chars)

**English (en-US, optional secondary locale):**

```
Practise EUJJJS judo techniques anytime — no account, no ads, free. Great
prep for your belt exam.
```
(101 chars)

---

## Description (4000 chars max)

Use the existing full description from `listing-nl.md` / `listing-en.md` as-is
— both are well under the limit. No change needed.

---

## Keywords (100 chars max, comma-separated, no spaces after commas)

App Store Connect keyword rules:
- 100-character limit for the **whole field**, not per word
- Comma-separated, **no space** after the comma (spaces waste characters)
- Don't repeat words already in the app **Name** ("Judo Quiz") or **Subtitle**
  — those are already indexed for search
- Don't use plurals of a word already there (singular covers both)
- No spaces within multi-word phrases if a hyphen/no-space variant saves room

**Dutch (nl-NL)** — name "Judo Quiz" + subtitle "Oefen judotechnieken (EUJJJS)"
already cover judo/quiz/techniek/EUJJJS, so keywords focus on new terms:

```
band,examen,nage waza,ne waza,worp,houdgreep,armklem,verwurging,woordenlijst,sport
```
(97 chars)

**English (en-US)** — name/subtitle already cover judo/quiz/practise/EUJJJS:

```
belt,exam,throw,pin,armlock,choke,nage waza,ne waza,glossary,martial arts
```
(74 chars)

---

## Field reference (for future edits)

| Field | Max length | Re-review needed? | Indexed for search? |
|-------|-----------|--------------------|----------------------|
| App Name | 30 chars | Yes | Yes |
| Subtitle | 30 chars | Yes | Yes |
| Promotional Text | 170 chars | **No** | No |
| Description | 4000 chars | Yes | No (not directly; Apple does parse it lightly) |
| Keywords | 100 chars total | Yes | Yes |

Source: existing `listing-nl.md` (name/subtitle/description/keywords),
current app scope in `AGENT.md` §1 and §14.4 (store copy already drafted;
no personal data collected).
