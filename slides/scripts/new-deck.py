#!/usr/bin/env python3
"""Assemble a deck: deck-engine.html + your slides fragment -> one HTML file.

    /usr/bin/python3 new-deck.py slides-fragment.html out.html \
        --title "Advance Year 2 — The Formation Year" [--name "ADVANCE YEAR 2"] \
        [--theme dark]

The fragment is just the <section class="slide"> blocks, nothing else. Writing the
slides in their own file and letting this drop them between the SLIDES markers
avoids hand-editing a 700-line file (and the comment-nesting trap that comes with
pasting HTML that contains `-->` into a commented region).
"""
import re, sys, os

a = sys.argv[1:]
if len(a) < 2:
    sys.exit(__doc__)
frag_path, out_path = a[0], a[1]
def flag(n, d=None):
    return a[a.index('--' + n) + 1] if '--' + n in a else d
title = flag('title', 'Deck')
name = flag('name', title.split('—')[0].strip().upper())
theme = flag('theme', 'default')

engine = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'deck-engine.html')
html = open(engine, encoding='utf-8').read()
frag = open(frag_path, encoding='utf-8').read()

# Never silently overwrite a deck: back it up, and shout if it holds slides that
# aren't in the fragment (someone edited in the browser without saving back).
if os.path.exists(out_path):
    prev = open(out_path, encoding='utf-8').read()
    m = re.search(r'<!-- SLIDES:START -->([\s\S]*?)<!-- SLIDES:END -->', prev)
    bak_dir = os.path.join(os.path.dirname(os.path.abspath(out_path)), '.bak')
    os.makedirs(bak_dir, exist_ok=True)
    base = os.path.basename(out_path)[:-5]
    n = len([f for f in os.listdir(bak_dir) if f.startswith(base + '-')]) + 1
    bak = os.path.join(bak_dir, f'{base}-{n:03d}.html')
    open(bak, 'w', encoding='utf-8').write(prev)
    if m and ' '.join(m.group(1).split()) != ' '.join(frag.split()):
        print(f'WARNING: {out_path} differed from {frag_path} — it may hold browser edits '
              f'that are about to be replaced. Previous version saved to {bak}')

html, n = re.subn(r'<!-- SLIDES:START -->.*?<!-- SLIDES:END -->',
                  lambda _: '<!-- SLIDES:START -->\n' + frag + '\n<!-- SLIDES:END -->',
                  html, flags=re.S)
if n != 1:
    sys.exit(f'expected 1 SLIDES block in the engine, found {n}')
html = html.replace('<title>DECK TITLE</title>', f'<title>{title}</title>')
html = html.replace('>DECK TITLE<', f'>{name}<')

# --fx: boldness. calm ships nothing extra; the rest inject the effects layer and
# set the switches it reads. Per-slide effects (data-fx="ember"…) need >= keynote.
fx = flag('fx', 'calm')
if fx not in ('calm', 'editorial', 'keynote', 'max'):
    sys.exit('--fx must be calm | editorial | keynote | max')
attrs = f'data-theme="{theme}"'
if fx != 'calm':
    effects = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'effects.html')
    html = html.replace('</head>', open(effects, encoding='utf-8').read() + '\n</head>', 1)
    attrs += ' data-fx-kinetic="1" data-fx-kb="1"'
    if fx in ('keynote', 'max'):
        attrs += f' data-fx-trans="{flag("trans", "zoom")}"'
    if fx == 'max':
        attrs += ' data-fx-grain="1"'
html = html.replace('<html lang="en" data-theme="default">', f'<html lang="en" {attrs}>')
open(out_path, 'w', encoding='utf-8').write(html)
count = len(re.findall(r'<section[^>]*class="slide', frag))
print(f'{out_path}: {count} slides, theme {theme}, fx {fx}')
