#!/bin/sh
# Joins the recorded parts of the film and adds the sound track. Usage: sh join.sh <output folder>
# It expects part-0.mp4 to part-7.mp4 and sound.wav, which record.mjs writes. It writes eco-town-film.mp4.
set -e
cd "$1"
: > parts.txt
for i in 0 1 2 3 4 5 6 7; do echo "file 'part-$i.mp4'" >> parts.txt; done
ffmpeg -loglevel error -y -f concat -safe 0 -i parts.txt -i sound.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 128k -shortest -movflags +faststart eco-town-film.mp4
rm parts.txt
ls -la eco-town-film.mp4
