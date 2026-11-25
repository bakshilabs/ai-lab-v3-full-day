"""Makes the welcome film of the new Eco Town game (owner, 25 Nov 2026): game/videos/welcome/eco-town-welcome.mp4, .jpg and .vtt.

Florence (Kokoro-82M, voice af_bella, the game's own voice for her) introduces Eco Town, says how each level works and shows the six places.
The pictures are the levels' own recordings (docs/redesign/concepts/.../pictures/) and pictures of the game's town page.
The words are placeholders, like every word in the new game (owner: no OpenAI for this build).

  python3 voice/welcome-film.py <kokoro_dir> <town_pictures_dir> <work_dir>
  <kokoro_dir>: model.onnx and voices.bin; <town_pictures_dir>: town-start.png and town-dusk.png (1920 x 1080 screenshots of
  eco-town/concepts/game/index.html: the empty town, and the finished town at dusk)
"""
import os, subprocess, sys, json
from PIL import Image, ImageDraw, ImageFont

KDIR, TOWN, WORK = sys.argv[1:4]
HERE = os.path.dirname(os.path.abspath(__file__))
C = os.path.join(HERE, '..', '..', '..', 'docs', 'redesign', 'concepts')
OUT = os.path.join(HERE, '..', 'game', 'videos', 'welcome')
W, H, FPS = 1920, 1080, 24
BOLD = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'

# each shot: picture, the band of the picture to use (y0, y1: below the game's own corner labels; the game's band of words is left out
# except in the shots that show how a level works), the title chip, and Florence's lines
LV = lambda p: os.path.join(C, p)
SHOTS = [
  (os.path.join(TOWN, 'town-start.png'), (130, 890), 'Welcome to Eco Town', ['Hello. I am Florence, your AI helper.', 'Welcome to Eco Town. It is a small town beside a river, and today you will plan it with me, one place at a time.']),
  (LV('levels/land/pictures/hill-1440/03-ask-word.jpg'), (0, 810), 'Ask Florence', ['In every place, you tap a word to finish a sentence. Then you ask me to suggest plans.']),
  (LV('levels/land/pictures/hill-1440/04-plans.jpg'), (0, 810), 'Three plans', ['I suggest three plans. Then you press the big button to test them all in the town.']),
  (LV('levels/land/pictures/hill-1440/06-test-rain.jpg'), (76, 560), 'Test them', ['You watch what happens to every plan.']),
  (LV('levels/land/pictures/hill-1440/14-results.jpg'), (0, 810), 'You choose', ['Then you look at what happened, and you choose the plan you think is best. After that, you build it.']),
  (LV('levels/land/pictures/hill-1440/22-break-home-6.jpg'), (76, 560), '1  Land', ['First, Land. Heavy rain is coming. Where should the homes go?']),
  (LV('levels/getting-around/pictures/park-direct-middle-1440/27-play-all-joined-bridge-left.jpg'), (76, 560), '2  Getting around', ['Second, Getting around. Draw the paths, so that people can walk to the shops.']),
  (LV('trial/pictures/sunny-timber-lot-1440/36-home-open.jpg'), (76, 560), '3  Homes', ['Third, Homes. Build a home that keeps your family warm all winter.']),
  (LV('levels/food/pictures/indoor-farm-1440/34-break-winter-shelves.jpg'), (76, 560), '4  Food', ['Fourth, Food. Grow fresh food for the market, even when it snows.']),
  (LV('levels/power/pictures/wind-sun-battery-1440/39-day-5-lit-tree.jpg'), (76, 560), '5  Power', ['Fifth, Power. Keep the lights on through a long winter night.']),
  (LV('levels/school/pictures/good-plan-1440/27-bus-crossing.jpg'), (76, 560), '6  School', ['Sixth, School. Walk with your friends to school.']),
  (os.path.join(TOWN, 'town-dusk.png'), (130, 890), 'Your town', ['Every place you plan becomes part of your town. When all six are planned, the whole town lights up.', 'Press the Eco Town card to begin. I will see you there.']),
]

def frame(path, band, title):
  im = Image.open(path).convert('RGB'); s = W / im.width; im = im.resize((W, round(im.height * s)), Image.LANCZOS)
  y0, y1 = round(band[0] * s), round(band[1] * s); cw = min(W, round((y1 - y0) * 16 / 9)); x0 = (W - cw) // 2
  im = im.crop((x0, y0, x0 + cw, y1)).resize((W, H), Image.LANCZOS)
  d = ImageDraw.Draw(im); f = ImageFont.truetype(BOLD, 54); tw = d.textlength(title, font=f)
  bx, by, pw, ph = 110, 84, tw + 64, 92  # inside the part that the slow push in keeps
  d.rounded_rectangle((bx, by + 7, bx + pw, by + ph + 7), 46, fill=(176, 138, 27))
  d.rounded_rectangle((bx, by, bx + pw, by + ph), 46, fill=(255, 210, 87), outline=(59, 42, 30), width=4)
  d.text((bx + 32, by + 14), title, font=f, fill=(59, 42, 30))
  return im

def stamp(t):
  h, r = divmod(t, 3600); m, r = divmod(r, 60); return f'{int(h):02d}:{int(m):02d}:{r:06.3f}'

os.makedirs(WORK, exist_ok=True); os.makedirs(OUT, exist_ok=True)
from kokoro_onnx import Kokoro
import soundfile as sf, numpy as np
k = Kokoro(os.path.join(KDIR, 'model.onnx'), os.path.join(KDIR, 'voices.bin'))
GAP, LEAD, TAIL = 0.35, 0.6, 0.9
cues, parts, t = [], [], 0.0
for i, (pic, top, title, lines) in enumerate(SHOTS):
  frame(pic, top, title).save(os.path.join(WORK, f's{i:02d}.png'))
  audio, sr = [np.zeros(int(LEAD * 24000), dtype=np.float32)], 24000; at = t + LEAD
  for ln in lines:
    a, sr = k.create(ln, voice='af_bella', speed=0.95, lang='en-gb'); a = a.astype(np.float32)
    cues.append((at, at + len(a) / sr, ln)); at += len(a) / sr + GAP
    audio += [a, np.zeros(int(GAP * sr), dtype=np.float32)]
  audio.append(np.zeros(int(TAIL * sr), dtype=np.float32)); wav = np.concatenate(audio)
  sf.write(os.path.join(WORK, f's{i:02d}.wav'), wav, sr); dur = len(wav) / sr; parts.append(dur); t += dur
  print(f'shot {i} {title}: {dur:.1f} s')

# each shot: a slow push in on its picture, with its voice; shots joined with a short cross-fade
clips = []
for i, dur in enumerate(parts):
  n = round(dur * FPS); o = os.path.join(WORK, f's{i:02d}.mp4'); clips.append(o)
  z = f"zoompan=z='1+0.05*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s={W}x{H}:fps={FPS}"
  subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-loop', '1', '-i', os.path.join(WORK, f's{i:02d}.png'), '-i', os.path.join(WORK, f's{i:02d}.wav'),
    '-filter_complex', f'[0:v]scale={W*2}:{H*2},{z},format=yuv420p[v]', '-map', '[v]', '-map', '1:a', '-t', f'{dur:.3f}',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-b:a', '128k', o], check=True)
lst = os.path.join(WORK, 'list.txt'); open(lst, 'w').write(''.join(f"file '{c}'\n" for c in clips))
mp4 = os.path.join(OUT, 'eco-town-welcome.mp4')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-maxrate', '1400k', '-bufsize', '2800k',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '128k', mp4], check=True)
frame(SHOTS[0][0], SHOTS[0][1], SHOTS[0][2]).resize((960, 540)).save(os.path.join(OUT, 'eco-town-welcome.jpg'), quality=85)
open(os.path.join(OUT, 'eco-town-welcome.vtt'), 'w').write('WEBVTT\n\n' + '\n'.join(f'{stamp(a)} --> {stamp(b)}\n{x}\n' for a, b, x in cues))
print(f'film: {t:.1f} s, {os.path.getsize(mp4) / 1e6:.1f} MB')
