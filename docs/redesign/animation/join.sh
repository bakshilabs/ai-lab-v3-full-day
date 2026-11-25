#!/bin/sh
# Joins the recorded parts of the film and adds the sound track. Usage: sh join.sh <output folder>
# It expects part-0.mp4 to part-7.mp4 and sound.wav, which record.mjs writes, and it writes eco-town-film.mp4.
# The joined film is encoded again in two passes at a fixed bitrate, so that the whole film stays under 90 MB.
set -e
cd "$1"
: > parts.txt
for i in 0 1 2 3 4 5 6 7; do echo "file 'part-$i.mp4'" >> parts.txt; done
ffmpeg -loglevel error -y -f concat -safe 0 -i parts.txt -an -c:v libx264 -preset medium -b:v 315k -pass 1 -passlogfile pass -f null /dev/null
ffmpeg -loglevel error -y -f concat -safe 0 -i parts.txt -i sound.wav -map 0:v -map 1:a -c:v libx264 -preset medium -b:v 315k -pass 2 -passlogfile pass -pix_fmt yuv420p -c:a aac -b:a 96k -shortest -movflags +faststart eco-town-film.mp4
rm -f parts.txt pass-*
ls -la eco-town-film.mp4
