#!/usr/bin/env python3
"""Build judotechnieken.json from transcribed docx contents."""
import json, re, unicodedata
from pathlib import Path

def slugify(name):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s

def norm(name):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", s).strip().lower()

DATA = {
 "ashi_waza": [
    ("O Soto Gari","ge",1,None,False),("De Ashi Barai","ge",2,None,False),
    ("Hiza Guruma","ge",3,None,False),("Ko Soto Gake","ge",4,None,False),
    ("O Uchi Gari","or",5,None,False),("Ko Uchi Gari","or",6,None,False),
    ("Okuri Ashi Barai","gr",7,None,False),("O Soto Guruma","zw",8,None,False),
    ("O Soto Otoshi","zw",9,None,False),("Ko Soto Gari","zw",10,None,False),
    ("Sasae Tsuri Komi Ashi","zw",11,None,False),("Harai Tsuri Komi Ashi","zw",12,None,False),
    ("Soto Gake",None,13,None,False),("Ko Uchi Maki Komi",None,14,None,False),
    ("Ashi Guruma",None,15,None,False),
 ],
 "koshi_waza": [
    ("Uki Goshi","ge",1,None,False),("Kubi Nage","ge",2,None,False),
    ("Tsuri Goshi","ge",3,None,False),("Koshi Guruma","ge",4,None,False),
    ("Harai Goshi","or",5,None,False),("Hane Goshi","or",6,None,False),
    ("Ushiro Goshi","gr",7,None,False),("Tsuri Komi Goshi","gr",8,None,False),
    ("Utsuri Goshi","bl",9,None,False),("Uchi Mata","bl",10,None,False),
 ],
 "kata_waza": [
    ("Ippon Seoi Nage / Kata Seoi","ge",1,None,False),("Morote Seoi Nage","ge",2,None,False),
    ("Kata Guruma","or",3,None,False),("Seoi Otoshi","bl",4,None,False),
    ("Hidari Kata Seoi","bl",5,None,False),
 ],
 "te_waza": [
    ("Tai Otoshi","ge",1,None,False),("Uki Otoshi","ge",2,None,False),
    ("Hiji Otoshi","or",3,None,False),("Sukui Nage","gr",4,None,False),
    ("Mochiage Otoshi","bl",5,None,False),
    ("Te Guruma",None,None,None,False),("Sumi Otoshi",None,None,None,False),
    ("Obi Otoshi",None,None,None,False),("Kata Ashi Dori",None,None,None,False),
    ("Ryo Ashi Dori",None,None,None,False),
 ],
 "sutemi_waza": [
    ("Tomoe Nage","or",1,None,False),("Yoko Tomoe","or",2,None,False),
    ("Tomoe Nage + klem","gr",3,None,False),("Soto Maki Komi","bl",4,None,False),
    ("Yoko Gake","bl",5,None,False),("Tani Otoshi","bl",6,None,False),
    ("Sumi Gaeshi","bl",7,None,False),("Uki Waza","bl",8,None,False),
    ("Kani Basami","br",9,None,False),("Yoko Otoshi","br",10,None,False),
    ("Hane Maki Komi","zw",11,None,False),("Ura Nage","zw",12,None,False),
    ("Yoko Guruma","zw",13,None,False),("Yoko Wakare",None,14,None,False),
    ("Taware Gaeshi",None,15,None,True),
 ],
 "osaekomi_waza": [
    ("Hon Geza Gatame","ge",1,None,True),
    ("Kata Gatame","ge",2,None,False),("Kami Shiho Gatame","ge",3,None,False),
    ("Kuzure Kami Shiho Gatame","ge",4,None,False),("Ushiro Gesa Gatame","ge",5,None,False),
    ("Yoko Shiho Gatame","ge",6,None,False),("Mune Gatame","or",7,None,False),
    ("Tate Shiho Gatame","gr",8,None,False),("Kuzure Gesa Gatame","bl",9,None,False),
    ("Kata Oesa Gatame","bl",10,None,True),
    ("Ura Gatame","zw",11,None,False),("Kashira Gatame","zw",12,None,False),
    ("Uri Shiho Gatame","zw",13,None,True),
    ("Kami Sankaku Gatame","zw",14,None,False),("Kuzure Yoko Shiho Gatame","zw",15,None,False),
    ("Tate Sankaku Gatame","zw",16,None,False),("Uki Gatame","zw",17,None,False),
 ],
 "kansetsu_waza": [
    ("Udi Hishigi Juji Katame","ge",1,"1e serie",True),
    ("Ude Garami","ge",2,"1e serie",False),("Ude Hishigi","ge",3,"1e serie",False),
    ("Hiza Gatame","ge",4,"1e serie",False),
    ("Kami Ude Juji Gatame","or",1,"2e serie",False),("Yoko Ude Hishigi","or",2,"2e serie",False),
    ("Kami Hiza Katame","or",3,"2e serie",False),
    ("Ude Hishigi Henkawaza","gr",1,"3e serie",False),("Gyaku Juji","gr",2,"3e serie",False),
    ("Shime Garami","gr",3,"3e serie",False),("Hiza Gatame","gr",4,"3e serie",False),
    ("Hara Katame","bl",1,"4e serie",False),("Ashi Katame","bl",2,"4e serie",False),
    ("Ude Garami Henkawaza","bl",3,"4e serie",False),
    ("Othen Karami","bl",4,"4e serie",True),
    ("Keza Garami","br",1,"5e serie",True),
    ("Kuzure Kami Shiho Garami","br",2,"5e serie",False),("Gyaku Kesa Garami","br",3,"5e serie",False),
    ("Mune Garami","br",4,"5e serie",False),("Mune Gyaku","br",5,"5e serie",False),
    ("Gyaku Te Kubi","zw",1,"6e serie",False),("Hiji Maki Komi","zw",2,"6e serie",False),
    ("Kuzure Hiji Maki Komi","zw",3,"6e serie",False),("Kanuki Katame","zw",4,"6e serie",False),
    ("Ude Hishigi Hiza Katame","zw",5,"6e serie",False),
 ],
 "jime_waza": [
    ("Kata Juji Jime","ge",1,"1e serie",False),("Gyaku Juji Jime","ge",2,"1e serie",False),
    ("Yoko Juji Jime","ge",3,"1e serie",False),("Ushiro Jime","or",4,"1e serie",False),
    ("Okuri Eri Jime","or",5,"1e serie",False),("Kata Ha Jime","or",6,"1e serie",False),
    ("Hadaka Jime","or",7,"1e serie",False),("Ebi Garami","gr",8,"1e serie",False),
    ("Tomoe Jime","gr",9,"1e serie",False),("Eri Jime","gr",10,"1e serie",False),
    ("Kensui Jime","gr",11,"1e serie",False),("Kata Jime","bl",12,"1e serie",False),
    ("Do Jime","bl",13,"1e serie",False),("Hiza Jime","bl",14,"1e serie",False),
    ("Tsukomi Jime","bl",15,"1e serie",True),
    ("Ebi Jime","bl",16,"1e serie",False),("Hasami Jime","bl",17,"1e serie",False),
    ("Othen Jime","bl",18,"1e serie",True),
    ("Narabi Juji Jime",None,1,"2e serie",False),("Katate Jime",None,2,"2e serie",False),
    ("Sode Guruma",None,3,"2e serie",False),("Hidari Ashi Jime",None,4,"2e serie",False),
    ("Kagato Jime",None,5,"2e serie",False),("Kami Shiho Jime",None,6,"2e serie",False),
    ("Kami Shiho Ashi Jime",None,7,"2e serie",False),("Kami Shiho Basami",None,8,"2e serie",False),
    ("Gyaku Okuri Eri",None,9,"2e serie",False),("Gaeshi Jime",None,10,"2e serie",False),
    ("Gyaku Gaeshi Jime",None,11,"2e serie",False),
 ],
}

CATEGORIES = {
 "ashi_waza":    {"domain":"nage_waza","jp":"Ashi Waza","nl":"beenworpen","en":"leg/foot throws"},
 "koshi_waza":   {"domain":"nage_waza","jp":"Koshi Waza","nl":"heupworpen","en":"hip throws"},
 "kata_waza":    {"domain":"nage_waza","jp":"Kata Waza","nl":"schouderworpen","en":"shoulder throws"},
 "te_waza":      {"domain":"nage_waza","jp":"Te Waza","nl":"armworpen","en":"arm/hand throws"},
 "sutemi_waza":  {"domain":"nage_waza","jp":"Sutemi Waza","nl":"offerworpen","en":"sacrifice throws"},
 "osaekomi_waza":{"domain":"ne_waza","jp":"Osae Komi Waza / Katame Waza","nl":"houdgrepen","en":"pins/holds"},
 "kansetsu_waza":{"domain":"ne_waza","jp":"Ude Kansetsu Waza","nl":"armklemmen","en":"arm locks"},
 "jime_waza":    {"domain":"ne_waza","jp":"Jime Waza","nl":"verwurgingen","en":"strangles/chokes"},
}

BELTS = {"ge":"geel","or":"oranje","gr":"groen","bl":"blauw","br":"bruin","zw":"zwart"}

techniques = []
used = {}
alias_index = {}
for cat, rows in DATA.items():
    for name, belt, number, series, review in rows:
        base = slugify(name.split("/")[0].strip())
        sid = base
        n = 2
        while sid in used:
            sid = f"{base}-{n}"; n += 1
        used[sid] = True
        techniques.append({
            "id": sid, "name": name, "category": cat,
            "domain": CATEGORIES[cat]["domain"], "belt": belt,
            "number": number, "series": series, "needs_review": review,
        })
        for alias in name.split("/"):
            an = norm(alias)
            alias_index.setdefault(an, sid)

def resolve(name):
    return alias_index.get(norm(name))

COUNTERS_RAW = [
 ("O Soto Gari","O Soto Gari","1e bw","1e bw"),
 ("O Soto Gari","Sumi Otoshi","1e bw","6e aw"),
 ("De Ashi Barai","De Ashi Barai","2e bw","2e bw"),
 ("Hiza Guruma","Hiza Guruma","3e bw","3e bw"),
 ("Ko Soto Gake","Uchi Mata","4e bw","10e hw"),
 ("Ko Soto Gake","O Uchi Gari","4e bw","5e bw"),
 ("Ko Soto Gake","Uki Waza","4e bw","8e sut"),
 ("O Uchi Gari","Yoko Guruma","5e bw","13e sut"),
 ("O Uchi Gari","Uchi Mata","5e bw","10e hw"),
 ("O Uchi Gari","Maki Komi","5e bw","4e sut"),
 ("O Uchi Gari","Kata Guruma","5e bw","3e sw"),
 ("Uki Goshi","Yoko Tomoe","1e hw","2e sut / 7e sut"),
 ("Uki Goshi","Yoko Gake","1e hw","5e sut"),
 ("Tsuri Goshi","Tani Otoshi","3e hw","6e sut"),
 ("Harai Goshi","Utsuri Goshi","5e hw","9e hw"),
 ("Harai Goshi","Utsuri Goshi","5e hw","9e hw"),
 ("Kata Seoi","Tani Otoshi","1e sw","6e sut"),
 ("Ippon Seoi Nage","Uki Waza","1e sw","8e sut"),
 ("Ippon Seoi Nage","O Soto Gari","1e sw","1e bw"),
 ("Tai Otoshi","Ura Nage","1e aw","12e sut"),
 ("Tai Otoshi","Ko soto gake","1e aw","4e bw"),
 ("Tomoe Nage","Ko Uchi Maki Komi","1e sut","14e bw"),
 ("Yoko Tomoe","O Uchi Gari","2e sut","5e bw"),
 ("Maki Komi","Tani Otoshi","4e sut","6e sut"),
 ("Maki Komi","Yoko Wakare","4e sut","14e sut"),
]

COMBOS_RAW = [
 ("O Soto Gari","Harai Goshi","1e bw","5e hw"),
 ("Hiza Guruma","Harai Goshi","3e bw","5e hw"),
 ("Ko Soto Gake","Sumi Gaeshi","4e bw","7e sut"),
 ("O Uchi Gari","Uchi Mata","5e bw","10e hw"),
 ("Ko Uchi Gari","O Uchi Gari","6e bw","5e bw"),
 ("Ko Uchi Gari","Hane Goshi","6e bw","6e hw"),
 ("Sasei Tsuri Komi Ashi","Ashi Guruma","11e bw","15e bw"),
 ("Harai Tsuri Komi Ashi","Yoko Wakare","12e bw","14e sut"),
 ("Harai Tsuri Komi Ashi","Ko Soto Gake","12e bw","4e bw"),
 ("Kubi Nage","Maki Komi","2e hw","4e sut"),
 ("Tsuri Komi Goshi","O Uchi Gari","8e hw","5e bw"),
 ("Tsuri Komi Goshi","Sode Tsuri Komi Goshi","8e hw","8e hw l"),
 ("Uchi Mata","O Uchi Gari","10e hw","5e bw"),
 ("Ippon Seoi Nage","Ko Uchi Gari","1e sw","6e bw"),
 ("Ippon Seoi Nage","Ko Uchi Maki Komi","1e sw","14e bw"),
 ("Tao Otoshi","O Uchi Gari","1e aw","5e bw"),
 ("Tai Otoshi","O Uchi Gari","1e aw","5e bw"),
]

def build_pairs(raw, a_key, b_key, aref_key, bref_key):
    out = []
    for a, b, aref, bref in raw:
        aid, bid = resolve(a), resolve(b)
        out.append({
            a_key: a, a_key+"_id": aid,
            b_key: b, b_key+"_id": bid,
            aref_key: aref, bref_key: bref,
            "needs_review": (aid is None or bid is None),
        })
    return out

counters = build_pairs(COUNTERS_RAW, "attack","counter","source_ref","target_ref")
combinations = build_pairs(COMBOS_RAW, "first","then","first_ref","then_ref")

GLOSSARY = [
 ("Arashi","storm"),("Ashi","voet/been"),
 ("Barai (ook harai)","vegen"),("Basami (ook hasami)","schaar"),
 ("Budo","verzamelnaam voor Japanse krijgskunsten"),("Bushido","erecode van de Japanse ridder"),
 ("Chusen","loting"),
 ("Dan","graad, klas"),("De","vooruitkomen(d)"),("Do","weg, romp"),("Dojo","judozaal, zaal"),("Dori","(mee)nemen"),
 ("Ebi","kreeft/schaar"),("Eri","revers/kraag"),
 ("Fusengachi","winnaar door opgave van de tegenstander"),
 ("Gaeshi (kaeshi)","tegenaanval/tegenworp"),("Gake","haken"),("Garami","oprollen, buigen"),("Gari","maaien"),
 ("Gatame (katame)","controle, (vast)houden"),("Geiko (keiko)","oefening"),("Gesa (kesa)","schuin"),("Go","vijf"),
 ("Gokyo (Gokio)","vijf series"),("Gonosen-no-kata","vorm van tegenworpen (overname-kata)"),("Goshi (koshi)","heup"),
 ("Guruma","rad, wiel"),("Gyaku (giaku)","omgekeerd"),
 ("Hadaka","naakt"),("Hajime","begin(nen)"),("Hane","vleugel"),("Han-so-ku-make","diskwalificatie"),
 ("Hantei","oordeel, (vrij:) scheidsrechterbeslissing"),("Hara","buik"),("Harai (barai)","vegen"),("Hasami (basami)","schaar"),
 ("Hidari","links"),("Hiji","elleboog"),("Hikiwake","gelijk, gelijkspel"),("Hishigi","klemmen, ontwrichten"),("Hon","basis"),
 ("Ichi","een"),("Idori","geknielde zit"),("Ippon","een punt, een zijde"),("Itsutsu-no-kata","vorm van vijf (kata van het technische judo-principe)"),
 ("Jigo","verdediging"),("Jigotai","verdedigingshouding"),("Jikan","tijd"),("Jime (shime)","verwurgen"),("Jitsu (jutsu)","techniek"),
 ("Ju","kunst; zacht"),("Judogi","judokleding"),("Judoka","judobeoefenaar"),("Juji","gekruist"),("Ju-no-kata","vorm van soepelheid (kata van soepelheid)"),
 ("Kachi","overwinning door opgave i.v.m. verwonding, ziekte of ongeval"),("Kaeshi (gaeshi)","tegenaanval, tegenworp"),("Kai (kwai)","gemeenschap"),
 ("Kake","uitvoeren"),("Kami","boven op"),("Kani (ebi)","kreeft, schaar"),("Kansetsu (Kwansetsu)","gewricht"),("Karate","lege hand"),
 ("Kata","schouder, een zijde, type/vorm"),("Katame (gatame)","controle, (vast)houden"),("Katame-no-kata","controle naar vorm (kata van controles in ne-waza)"),
 ("Katsu (Kwatsu)","reanimatiemethode"),("Keiko (geiko)","oefening"),("Kesa (gesa)","schuin"),("Kiai","roepen, kreet"),
 ("Kime-no-kata","vorm van zelfverdediging (kata van zelfverdediging)"),("Kimono","(judo)jas"),("Kio (kyo)","beginsel, groep"),("Ko","klein"),
 ("Koka","klein voordeel"),("Kodokan","tempel, judocentrum te Tokio"),("Kohaku-shiai","competitie met rood en wit"),("Komi","tegen, binnen"),
 ("Koshi (goshi)","heup"),("Koshiki-no-kata","antieke vorm"),("Kubi","nek, hals"),("Kumi-kata","manier van vastpakken/pakking"),
 ("Kuzure","variatie"),("Kuzushi","balans verstoren, evenwicht verbreken"),("Kyu","klas"),("Kyudo","boogschietkunst"),
 ("Ma","recht, rug"),("Mae","van voren"),("Maitta","opgeven, 'ik geef op'"),("Maki","oprollen"),("Maki-komi","oprol-worp"),
 ("Mata","dij(been)"),("Matte","stop, wacht"),("Migi","rechts"),("Mochi","met de handen pakken"),("Morote","met twee handen"),
 ("Mune","borst"),("Mudansha","kyu(graad) houder"),
 ("Nage","werpen"),("Nage-no-kata","werpen naar vorm (kata van vijftien basisworpen)"),("Nage-waza","werptechnieken"),
 ("Nami","normaal, gewoon"),("Ne","liggend"),("Ne-waza","grondtechnieken, grondjudo"),
 ("O","groot"),("Obi","band/gordel/riem"),("Okuri","zenden, sturen"),("Osae-komi","houdgreep"),("Otoshi","dropping, laten vallen"),
 ("Randori","vrij oefenen, oefenwedstrijd"),("Rei","groet, buiging"),("Renraku-waza","techniek van combinaties"),("Renzoku-waza","vervolgtechnieken"),
 ("Rio (ryo)","twee, beide"),("Ritsu-rei","staande houding"),("Ryu (riu)","school, methode"),
 ("Sabaki","draaien"),("Samurai (samoerai)","ridder, krijger"),("Sankaku","driehoek"),("Sasae","blokkeren"),("Sensei","leraar"),
 ("Seoi","rug, op de rug (mee)nemen"),("Shiai","competitie, wedstrijd"),("Shiaijo","competitie-oppervlakte, wedstrijdoppervlakte"),("Shihan","meester"),
 ("Shime (jime)","verwurgen"),("Shinpan","scheidsrechter"),("Shintai","verplaatsen zonder te draaien"),("Shiho","vier punten"),
 ("Shisei","houding"),("Shizentai","basishouding, normale houding"),("Sode","mouw(en)"),("Sono-mama","niet meer bewegen"),
 ("Sore-made","einde, slot"),("Soto","buitenwaarts"),("Sukui","lepel, oplepelen, opscheppen"),("Sumi","hoek"),("Sumo","Japans worstelen"),("Sutemi","opofferen"),
 ("Tachi","staand"),("Tai","lichaam"),("Tai-sabaki","lichaam draaien"),("Tanden","buik"),("Tandoku Renshyu","alleen oefenen"),
 ("Tani","vallei"),("Tatami","judomat"),("Tate","lengte, verticaal"),("Taware","rijstbaal"),("Te","hand"),("Toketa","verbroken"),
 ("Tokui","voorkeurtechniek, specialiteit"),("Tomoe","boog, cirkel"),("Tori","hij die uitvoert"),("Tsukuri","voorbereiden"),
 ("Tsuri","opliften"),("Tsuri-komi","trekken en opliften"),
 ("Uchi","binnen, binnenwaarts"),("Uchi-komi","herhaald indraaien"),("Ude","arm"),("Uke","hij die ondergaat"),("Ukemi","valbreken"),
 ("Uki","drijven"),("Ura","tegengesteld"),("Ushiro","van achteren"),("Utsuri","wisselen"),
 ("Wakare","scheiden, splitsen"),("Waza","kunst, techniek"),("Waza-ari","bijna punt, half punt"),("Waza-ari-awasete-ippon","tweemaal bijna punt wordt vol punt"),
 ("Yaku-soku-geiko","oefenen in beweging"),("Yama","berg"),("Yoko","zijde, kant"),("Yudansha","houder van een dangraad"),
 ("Yuko","groot voordeel"),("Yushei-gashi","winnaar door superioriteit"),
 ("Za","zitplaats"),("Za-rei","geknielde groet"),("Za-zen","meditatiezit (o.a. t.b.v. geknielde groet)"),("Zen","meditatie"),("Zori","slippers, sandalen"),
]
glossary = [{"term": t, "nl": m} for t, m in GLOSSARY]

COMP_TERMS = [
 ("rei","groet"),("hajime","beginnen"),("sore-made","einde"),("matte","(tijdelijke) stop"),
 ("ippon","vol punt score; als je dit scoort heb je meteen gewonnen"),
 ("waza-ari","halve ippon; twee keer waza-ari in een wedstrijd telt als ippon ('waza-ari-awasete-ippon')"),
 ("yuko","groot voordeel"),("koka","klein voordeel"),
 ("shido","straf omdat je (judotechnisch) iets gedaan hebt dat niet mag"),
 ("hansoku-make","diskwalificatie; vier keer een overtreding, gevaar voor jezelf, of onsportief gedrag"),
 ("osae-komi","er is een houdgreep"),
 ("toketa","degene die in de houdgreep lag is eruit gekomen; de houdgreep telt niet meer"),
 ("sonomama","tijdelijke stop van de actie"),
 ("yoshi","weer doorgaan na tijdelijke stop; wedstrijd gaat verder vanaf het stopgezette moment"),
 ("hiki wake","onbeslist; beide strijders hebben aan het einde een gelijk aantal punten"),
]
competition_terms = [{"term": t, "nl": m} for t, m in COMP_TERMS]

doc = {
 "meta": {
   "source": "Judotechnieken.docx",
   "school": "Eerste Utrechtse Judo en Ju Jutsu School",
   "language": "nl",
   "schema_version": 1,
   "notes": "Technique names transcribed verbatim from source; suspected typos kept as-is and marked needs_review. Belt codes map to kyu grade colors.",
   "ref_abbreviations": {"bw":"beenworp","hw":"heupworp","sw":"schouderworp","aw":"armworp","sut":"sutemi/offerworp"},
 },
 "belts": BELTS,
 "categories": CATEGORIES,
 "techniques": techniques,
 "counters": counters,
 "combinations": combinations,
 "glossary": glossary,
 "competition_terms": competition_terms,
}

out = Path("/sessions/great-amazing-sagan/mnt/judo/judotechnieken.json")
out.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
print("Wrote", out)
print("techniques:", len(techniques))
print("counters:", len(counters), "| combinations:", len(combinations))
print("glossary:", len(glossary), "| competition_terms:", len(competition_terms))
print("flagged techniques:", sum(t["needs_review"] for t in techniques))
print("unresolved counter refs:", sum(c["needs_review"] for c in counters))
print("unresolved combo refs:", sum(c["needs_review"] for c in combinations))
