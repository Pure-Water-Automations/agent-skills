#!/usr/bin/env python3
"""Dump the text of a .pptx (or .odp-style zip) as plain outline text.

    /usr/bin/python3 pptx-text.py deck.pptx [--media out_dir]

Stdlib only — no python-pptx needed (it may not be installed).
Prints one block per slide: shape paragraphs, table rows, picture count.
--media also extracts ppt/media/* so you can reuse the images in the HTML deck.
"""
import re, sys, os, zipfile

if len(sys.argv) < 2:
    sys.exit(__doc__)
src = sys.argv[1]
media = sys.argv[sys.argv.index('--media') + 1] if '--media' in sys.argv else None

z = zipfile.ZipFile(src)
slides = sorted((n for n in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml$', n)),
                key=lambda n: int(re.search(r'(\d+)', os.path.basename(n)).group(1)))

def texts(xml):
    return re.findall(r'<a:t>(.*?)</a:t>', xml, re.S)

for n in slides:
    xml = z.read(n).decode('utf-8', 'replace')
    print(f"\n===== {os.path.basename(n)} =====")
    for sp in re.findall(r'<p:sp>.*?</p:sp>', xml, re.S):
        paras = [''.join(texts(p)) for p in re.findall(r'<a:p>(.*?)</a:p>', sp, re.S)]
        paras = [p for p in paras if p.strip()]
        if paras:
            print(' | '.join(paras))
    for tbl in re.findall(r'<a:tbl>.*?</a:tbl>', xml, re.S):
        print('[TABLE]')
        for tr in re.findall(r'<a:tr .*?</a:tr>', tbl, re.S):
            cells = [' '.join(texts(tc)) for tc in re.findall(r'<a:tc>.*?</a:tc>', tr, re.S)]
            print('  ROW: ' + ' || '.join(cells))
    pics = len(re.findall(r'<p:pic>', xml))
    if pics:
        print(f'[{pics} PICTURE(S)]')
    notes = n.replace('slides/slide', 'notesSlides/notesSlide')
    if notes in z.namelist():
        t = ' '.join(texts(z.read(notes).decode('utf-8', 'replace'))).strip()
        if t:
            print('[NOTES] ' + t)

if media:
    os.makedirs(media, exist_ok=True)
    for n in z.namelist():
        if n.startswith('ppt/media/'):
            open(os.path.join(media, os.path.basename(n)), 'wb').write(z.read(n))
    print(f"\n[media extracted to {media}]", file=sys.stderr)
