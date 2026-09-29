#!/bin/sh
# Rebuilds the three woff2 files next to this script from the fontsource packages (DESIGN-DIRECTION.md 4.1).
# Needs fontTools with brotli: `uv venv ftvenv && uv pip install fonttools brotli`, then FT=ftvenv/bin sh build-fonts.sh
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
FS="$HERE/../../../node_modules/@fontsource-variable"
FT="${FT:-}"
TMP=$(mktemp -d)
U="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2032-2033,U+2039-203A,U+20AC,U+2122,U+2190-2193,U+2212"
FEAT="kern,liga,calt,ccmp,locl,mark,mkmk,lnum,pnum,tnum"

# Fraunces: SOFT 100 always; WONK 0 upright, 1 italic; weights 400 to 700 upright, 300 to 600 italic; opsz kept.
"${FT:+$FT/}fonttools" varLib.instancer "$FS/fraunces/files/fraunces-latin-full-normal.woff2" SOFT=100 WONK=0 wght=400:700 -o "$TMP/fr-n.woff2" -q
"${FT:+$FT/}fonttools" varLib.instancer "$FS/fraunces/files/fraunces-latin-full-italic.woff2" SOFT=100 WONK=1 wght=300:600 -o "$TMP/fr-i.woff2" -q
"${FT:+$FT/}pyftsubset" "$TMP/fr-n.woff2" --unicodes="$U" --layout-features="$FEAT" --flavor=woff2 --output-file="$HERE/fraunces-soft-latin.woff2"
"${FT:+$FT/}pyftsubset" "$TMP/fr-i.woff2" --unicodes="$U" --layout-features="$FEAT" --flavor=woff2 --output-file="$HERE/fraunces-soft-latin-italic.woff2"
# Figtree: the fontsource Latin file, trimmed to the same character set.
"${FT:+$FT/}pyftsubset" "$FS/figtree/files/figtree-latin-wght-normal.woff2" --unicodes="$U" --layout-features="$FEAT" --flavor=woff2 --output-file="$HERE/figtree-latin.woff2"
ls -l "$HERE"/*.woff2
