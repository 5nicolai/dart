# 🎯 Dart Pro – Steel-Dart-Zähler

Ein umfangreicher Steel-Dart-Zähler als Web-App. Er läuft im Browser, lässt sich auf dem Handy wie eine App installieren und funktioniert auch **ohne Internet**.

**➡ App öffnen: https://5nicolai.github.io/dart/**

- X01 (101 bis 901 oder frei) mit Legs, Sets, Double-/Master-In und -Out
- Cricket (Standard und Cut-Throat)
- Training: Around the Clock, Bob's 27, Shanghai, Checkout-Training
- Solo oder mit bis zu 8 Spielern, auch mit Gästen
- Eingabe als ganze Aufnahme **oder** Dart für Dart
- Automatischer Finish-Rechner
- Ausführliche Statistik mit Average-Verlauf
- Alle Daten bleiben auf deinem Gerät

---

## Inhalt

1. [Auf dem Pixel 8 installieren](#1-auf-dem-pixel-8-installieren)
2. [Schnellstart](#2-schnellstart)
3. [Spielmodi erklärt](#3-spielmodi-erklärt)
4. [Eingabe während des Spiels](#4-eingabe-während-des-spiels)
5. [Statistiken erklärt](#5-statistiken-erklärt)
6. [Einstellungen](#6-einstellungen)
7. [Daten & Datenschutz](#7-daten--datenschutz)
8. [Fehlerbehebung](#8-fehlerbehebung)
9. [Für Entwickler](#9-für-entwickler)

---

## 1. Auf dem Pixel 8 installieren

1. **Chrome** auf dem Pixel 8 öffnen.
2. **https://5nicolai.github.io/dart/** aufrufen.
3. Oben rechts auf das Menü **⋮** tippen.
4. **„App installieren“** wählen (bei manchen Versionen heißt es **„Zum Startbildschirm hinzufügen“**) und bestätigen.
5. Auf dem Startbildschirm erscheint das Dartscheiben-Icon **Dart Pro**. Die App startet im Vollbild ohne Browserleiste.

**Offline:** Nach dem ersten Öffnen ist alles auf dem Handy gespeichert. Die App funktioniert dann auch ohne Netz, zum Beispiel in der Kneipe oder im Keller.

**Updates:** Gibt es eine neue Version, erscheint unten der Hinweis **„Neue Version verfügbar → Aktualisieren“**. Ein Tipp darauf genügt, deine Daten bleiben erhalten.

> Tipp: Während eines Spiels bleibt das Display an. Das lässt sich in den Einstellungen abschalten.

---

## 2. Schnellstart

1. **Spieler anlegen:** Startseite → **Spieler** → **+ Neu**, Name eingeben und Farbe wählen. Nur Profile bekommen eine dauerhafte Statistik.
2. **Spiel wählen:** **X01**, **Cricket** oder **Training**.
3. **Spieler auswählen:** Profile antippen. Die Reihenfolge des Antippens ist die Wurfreihenfolge. Mit **+ Gast** spielt jemand ohne Profil mit, mit 🔀 wird gemischt.
   Ein einzelner Spieler genügt, dann heißt der Button **▶ Solo starten**.
4. **Regeln einstellen**, zum Beispiel 501, Double-Out, First to 3 Legs.
5. **Werfen und eintragen.** Am Ende kommt automatisch die Zusammenfassung mit allen Werten.

Ein angefangenes Spiel bleibt gespeichert. Auf der Startseite erscheint dann **▶ Weiterspielen**, auch wenn du die App zwischendurch schließt.

---

## 3. Spielmodi erklärt

### X01 (101 / 170 / 301 / 501 / 701 / 901 / frei)
Jeder Spieler startet mit derselben Punktzahl und zieht seine Aufnahmen davon ab. Wer zuerst genau auf **0** kommt, gewinnt das Leg.

| Regel | Bedeutung |
|---|---|
| **Straight-In** | Jeder Dart zählt sofort. |
| **Double-In** | Die Punkte zählen erst ab dem ersten getroffenen Doppel. |
| **Master-In** | Wie Double-In, aber auch ein Triple öffnet. |
| **Double-Out** | Der letzte Dart muss ein Doppel sein (Bull = Doppel 25). Das ist der Standard. |
| **Master-Out** | Der letzte Dart muss ein Doppel oder Triple sein. |
| **Straight-Out** | Jeder Dart darf beenden. |

**Überworfen (Bust):** Geht der Rest unter 0, landet er bei Double-/Master-Out auf genau 1 oder kommt man ohne gültigen letzten Dart auf 0, zählt die ganze Aufnahme nicht. Der Rest springt auf den Stand vor der Aufnahme zurück.

**Legs & Sets:**
- *First to 3 Legs*: Wer zuerst 3 Legs gewinnt, gewinnt das Match.
- *Best of 5 Legs*: Höchstens 5 Legs, also gewinnt ebenfalls, wer zuerst 3 hat. Bei „Best of“ sind nur ungerade Zahlen möglich.
- Mit **Sets > 1** braucht man pro Set die eingestellten Legs. Das Match gewinnt, wer zuerst die nötigen Sets hat.
- **Anwurf:** Der Anwurf wechselt mit jedem Leg, in Sets auch zu Beginn jedes Sets. Ein oranger Punkt ● zeigt, wer angeworfen hat.

### Cricket
Gespielt werden nur **15, 16, 17, 18, 19, 20 und Bull**. Jede Zahl muss dreimal getroffen werden, um sie zu „schließen“ (Single = 1, Double = 2, Triple = 3 Treffer). Anzeige: `/` = 1, `✕` = 2, `Ⓧ` = geschlossen.
- **Standard:** Triffst du eine eigene geschlossene Zahl, die ein Gegner noch offen hat, bekommst **du** die Punkte. Gewonnen hat, wer alles geschlossen hat und mindestens so viele Punkte wie alle anderen hat.
- **Cut-Throat:** Die Punkte gehen an die **Gegner**, die die Zahl noch offen haben. Gewonnen hat, wer alles geschlossen hat und die **wenigsten** Punkte hat.
- Solo endet das Spiel, sobald alles geschlossen ist. Dann zählt vor allem die MPR.

### Around the Clock (Training)
Triff 1, 2, 3 … 20 und optional Bull der Reihe nach. Pro Dart tippst du **✓ Treffer** oder **✗ Daneben**. Einstellbar ist, was als Treffer zählt: die ganze Zahl, nur Single, nur Doppel oder nur Triple. Ziel sind möglichst wenige Darts.

### Bob's 27 (Doppel-Training)
Du startest mit **27 Punkten** und wirfst pro Runde 3 Darts auf ein Doppel: D1, D2 … D20, zum Schluss Bull. Jeder Treffer bringt den Doppelwert, zum Beispiel 3 Treffer auf D5 = +30. Ohne Treffer wird der Doppelwert einmal abgezogen. Fällt dein Stand **unter 0**, ist das Spiel vorbei. Maximal sind 1437 Punkte möglich.

### Shanghai
Runde 1 geht auf die 1, Runde 2 auf die 2 und so weiter, wahlweise 7, 10 oder 20 Runden. Single zählt die Zahl einfach, Double doppelt, Triple dreifach. Wer in einer Aufnahme **Single, Double und Triple** der Rundenzahl trifft, wirft einen **Shanghai** und gewinnt sofort. Sonst gewinnt die höchste Punktzahl.

### Checkout-Training
Die App lost Finishes aus deinem Bereich aus (2–40, 41–100, 61–120, 101–170 oder 2–170) und zeigt den empfohlenen Weg. Du hast 3, 6 oder 9 Darts pro Finish und tippst ein, mit wie vielen Darts du es geschafft hast. Am Ende siehst du deine Quote.

---

## 4. Eingabe während des Spiels

Oben rechts wechselst du zwischen den beiden Eingabearten: **S·D·T** steht für Einzeldart, **123** für Aufnahme. Die zuletzt genutzte Art merkt sich die App.

### Aufnahme (Summe)
- Die Summe der 3 Darts eintippen und **OK** drücken.
- **Schnelltasten** für häufige Werte: 26, 41, 45, 60, 81, 85, 100, 140, 180.
- **Rest XY** trägt genau deinen Rest ein, also das Finish. **0 / Bust** steht für keine Punkte.
- Unmögliche Werte wie 179 oder 163 werden abgelehnt.
- **Finish-Abfrage:** Bei einem Check-out fragt die App, mit **wie vielen Darts** du beendet hast und **wie viele davon aufs Doppel** gingen. Bei einem Rest von 100 oder weniger fragt sie auch nach Aufnahmen ohne Finish, wie viele Darts aufs Doppel gingen. Nur so lässt sich die **Check-out-Quote** korrekt berechnen, denn bei einer Summe weiß die App nicht, wohin die einzelnen Darts gingen.

### Einzeldart
- Zuerst **Double** oder **Triple** antippen, dann die Zahl. Ohne Auswahl zählt Single.
- **25** steht für Single Bull, mit Double ausgewählt für **Bull (50)**. **Miss / 0** bedeutet daneben.
- Darts aufs Doppel, Bust und Finish erkennt die App selbst, Rückfragen gibt es keine.
- Der Finish-Vorschlag passt sich nach jedem Dart an die verbleibenden Darts an.

### Rückgängig ↶
Nimmt den letzten Eintrag zurück, also eine Aufnahme oder einen einzelnen Dart. Das geht beliebig oft, auch über Leg- und Set-Grenzen. Auch ein schon beendetes Spiel lässt sich auf der Zusammenfassung mit **↶ Letzter Wurf** wieder öffnen.

### Spielmenü ☰
**Pause** führt zurück zum Hauptmenü, das Spiel bleibt erhalten. **Spiel abbrechen** löscht das Spiel, es wird nicht gewertet.

### Finish-Rechner
Die App berechnet für jeden Rest bis 170 den Weg mit den wenigsten Darts. Dabei bevorzugt sie gängige Doppel (D20, D16, D18 …) und T20/T19 zum Stellen. Sie berücksichtigt den Out-Modus und die Darts, die in der Aufnahme noch übrig sind. Die „Bogeys“ 159, 162, 163, 165, 166, 168 und 169 sind mit 3 Darts nicht zu checken. Dann erscheint „Kein Finish möglich – stellen“.

---

## 5. Statistiken erklärt

Unter **Statistik** wählst du oben den Spieler. Gezählt werden nur **beendete** Spiele mit Spielerprofilen.

| Wert | Bedeutung |
|---|---|
| **Ø 3 Darts (3-Dart-Average)** | Durchschnittliche Punkte pro Aufnahme: geworfene Punkte ÷ Darts × 3. Ein Bust zählt mit 0 Punkten. |
| **First 9** | Average der ersten 3 Aufnahmen (9 Darts) jedes Legs. Er zeigt dein Scoring, bevor es ans Finish geht. |
| **Check-out-Quote** | Gecheckte Legs ÷ Darts aufs Doppel. 1 Finish bei 4 Darts aufs Doppel ergibt 25 %. |
| **High Finish** | Höchster Rest, den du ausgemacht hast. |
| **Bestes Leg** | Wenigste Darts für ein gewonnenes Leg. Ein 9-Darter ist das Maximum bei 501. |
| **Höchste Aufnahme** | Höchste Punktzahl in einer Aufnahme. |
| **180 / 140+ / 100+ / 60+** | Anzahl Aufnahmen in diesen Bereichen (140+ = 140–179, 100+ = 100–139, 60+ = 60–99). |
| **MPR (Cricket)** | Marks per Round: zählende Treffer pro 3 Darts. Triple 20 = 3 Marks. |
| **Trainingsrekorde** | Wenigste Darts bei ATC, höchste Punkte bei Bob's 27 und Shanghai, Quoten im Checkout-Training. |

Das Diagramm **Average-Verlauf** zeigt Ø und First 9 der letzten 40 X01-Spiele. Antippen zeigt die genauen Werte.

Unter **Verlauf** findest du alle beendeten Spiele, filterbar nach X01, Cricket und Training. Ein Tipp öffnet die Zusammenfassung mit Legs-Übersicht, dort lässt sich ein Spiel auch löschen. **Revanche** startet dasselbe Spiel noch einmal, dann wirft der nächste Spieler an.

---

## 6. Einstellungen

| Einstellung | Wirkung |
|---|---|
| **Vibration** | Kurzes haptisches Feedback bei jedem Tipp. |
| **Score-Ansage** | Liest jede Aufnahme vor (deutsche Sprachausgabe des Handys). „Game shot“ beim Leg-Gewinn. |
| **Bildschirm anlassen** | Das Display geht während eines Spiels nicht aus. |
| **Standard-Eingabe bei X01** | Aufnahme (Summe) oder Einzeldart. |

---

## 7. Daten & Datenschutz

- Alles wird **nur lokal im Browser** deines Geräts gespeichert (`localStorage`). Es gibt keinen Server, kein Konto und kein Tracking.
- Andere Geräte sehen deine Daten nicht. Um auf ein neues Handy umzuziehen: **Einstellungen → Sicherung exportieren** (JSON-Datei), auf dem neuen Gerät **Sicherung importieren**.
- ⚠️ **Löschst du die Website-Daten** von Chrome oder deinstallierst die App, ist die Statistik weg. Mach also ab und zu eine Sicherung.
- **Alle Daten löschen** in den Einstellungen setzt die App komplett zurück.

---

## 8. Fehlerbehebung

| Problem | Lösung |
|---|---|
| **App zeigt eine alte Version** | App schließen und neu öffnen, dann auf den blauen Hinweis **„Aktualisieren“** tippen. Hilft das nicht: in Chrome die Seite öffnen und neu laden. |
| **„App installieren“ fehlt im Menü** | Die Seite muss über **https://** geöffnet sein und einmal vollständig geladen haben. Kurz warten und neu laden. Alternativ „Zum Startbildschirm hinzufügen“ nutzen. |
| **Statistik ist leer** | Es zählen nur **beendete** Spiele und nur **Spielerprofile**, keine Gäste. |
| **Daten weg** | Wahrscheinlich wurden die Browserdaten gelöscht. Eine exportierte Sicherung lässt sich wieder importieren. |
| **Keine Sprachausgabe** | In den Android-Einstellungen eine deutsche Text-in-Sprache-Stimme installieren und die Medienlautstärke prüfen. |
| **Display geht trotzdem aus** | Den Energiesparmodus prüfen. Manche Modi blockieren das Wachhalten. |

---

## 9. Für Entwickler

Reines HTML, CSS und JavaScript (ES-Module). Es gibt **keinen Build-Schritt und keine Abhängigkeiten**. GitHub Pages liefert die Dateien direkt aus dem `main`-Branch aus.

### Projektstruktur

```
index.html                 App-Shell, lädt js/app.js
manifest.webmanifest       PWA-Manifest (Name, Icons, Vollbild)
sw.js                      Service Worker (Offline-Cache, Versionsnummer!)
.nojekyll                  GitHub Pages liefert alle Dateien unverändert aus
css/app.css                Design-Tokens, Layout, Komponenten
icons/                     App-Icons (SVG + PNG 192/512 + maskable)
js/app.js                  Router (#/home, #/setup/x01, #/play …), SW-Registrierung
js/store.js                localStorage mit Schema-Version, Migration, Export/Import
js/stats.js                Kennzahlen (Average, First 9, Quote, Rekorde)
js/engine/darts.js         Dart-Modell { s: Segment, m: Multiplikator }
js/engine/checkout.js      Finish-Rechner
js/engine/x01.js           X01-Regeln, Legs/Sets, Anwurf
js/engine/cricket.js       Cricket & Cut-Throat
js/engine/training.js      ATC, Bob's 27, Shanghai, Checkout-Training
js/engine/index.js         Verzeichnis aller Spieltypen
js/ui/dom.js               h()-Helfer, Dialoge, Toasts, Vibration, Sprachausgabe
js/ui/actions.js           Match anlegen, Ereignis hinzufügen, Undo, Revanche
js/ui/components/chart.js  SVG-Liniendiagramm
js/ui/screens/*.js         Ein Modul pro Bildschirm
tests/                     Browser-Tests für die Spiellogik
```

### Architektur: Ereignisprotokoll + Replay
Ein Match speichert nur seine **Konfiguration** und eine Liste von **Ereignissen**, zum Beispiel `{t:"v", v:100}` für eine Aufnahme oder `{t:"d", s:20, m:3}` für einen Dart. Der Spielstand entsteht immer durch erneutes Abspielen: `replay(config, events)` in den Engine-Modulen. Die Engines sind reine Funktionen ohne DOM. Daraus folgt:
- **Undo** = letztes Ereignis entfernen.
- **Fortsetzen** nach dem Schließen der App funktioniert automatisch.
- **Statistiken** werden immer konsistent aus denselben Daten berechnet.

### Lokal starten
```bash
python -m http.server 8000
# dann http://localhost:8000 öffnen
```
Wegen der ES-Module und des Service Workers ist ein lokaler Server nötig, `file://` funktioniert nicht.

### Tests
Bei laufendem Server **http://localhost:8000/tests/** öffnen. Die erste Zeile zeigt `RESULT: X passed, 0 failed`.
Headless, zum Beispiel mit Edge/Chrome:
```bash
msedge --headless --virtual-time-budget=8000 --dump-dom http://localhost:8000/tests/
```

### Neue Version veröffentlichen
1. Code ändern und Tests prüfen.
2. In `sw.js` die Konstante **`VERSION` erhöhen** (z. B. `dartpro-v2`). Neue Dateien in die `ASSETS`-Liste eintragen.
3. Nach `main` pushen. GitHub Pages baut automatisch, das dauert ca. 1 Minute.
4. Installierte Apps zeigen beim nächsten Öffnen „Neue Version verfügbar“.

Ändert sich das Datenformat, wird `SCHEMA` in `js/store.js` erhöht und `migrate()` ergänzt.
