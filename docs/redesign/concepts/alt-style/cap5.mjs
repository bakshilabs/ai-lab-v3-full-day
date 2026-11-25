// Draws the second material test and its comparisons: node cap5.mjs <scale> <folder>
import { open } from '../lib.mjs'; import fs from 'fs'; import { execFileSync } from 'child_process';
const scale = +(process.argv[2] || 1.5), dir = process.argv[3] || 'pictures-5'; fs.mkdirSync(dir, { recursive: true });
const { p, close } = await open(scale);
await p.evaluate(async () => { window.T2 = await import('/concepts/alt-style/treat2.js'); T2.show(); }); await p.waitForTimeout(300);
const box = await p.locator('.stage canvas').first().boundingBox();
await p.screenshot({ path: `${dir}/eco-C.jpg`, type: 'jpeg', quality: 90, clip: { x: box.x, y: box.y, width: 640, height: 494 } }); await close();
execFileSync('python3', ['-c', `
from PIL import Image
def pair(a,b,out):
    A=Image.open(a); B=Image.open(b); o=Image.new('RGB',(A.size[0]*2+12,A.size[1]),'#1f2a44'); o.paste(A,(0,0)); o.paste(B,(A.size[0]+12,0)); o.save(out,quality=90)
pair('pictures-4/car-town.jpg','${dir}/eco-C.jpg','${dir}/car-town-beside-C.jpg'); pair('pictures-4/eco-B.jpg','${dir}/eco-C.jpg','${dir}/B-beside-C.jpg')
`]);
