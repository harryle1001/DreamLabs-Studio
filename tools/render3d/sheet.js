// node sheet.js out.png a.png b.png ... → xếp 2 cột, mỗi ô 800 rộng
const sharp=require('/tmp/claude-0/-home-user/2c805972-97eb-57ae-8841-14adfe365124/scratchpad/npm/node_modules/sharp');
(async()=>{const [out,...fs]=process.argv.slice(2);const cw=+(process.env.CW||800),ch=Math.round(cw*791/1280),cols=+(process.env.COLS||2),rows=Math.ceil(fs.length/cols);
const comp=await Promise.all(fs.map(async(f,i)=>({input:await sharp(f).resize(cw,ch).toBuffer(),left:(i%cols)*cw,top:Math.floor(i/cols)*ch})));
await sharp({create:{width:cw*cols,height:ch*rows,channels:3,background:'#808080'}}).composite(comp).png().toFile(out)})();
