#!/usr/bin/env node
/* reel2 — trích 4 khung (đầu · 1/3 · 2/3 · cuối) TỪ FILE MP4 ĐÃ XUẤT, ghép thành một bảng để mở ra xem bằng mắt, kèm ffprobe.
   node tools/reel2/check.js <tên phim> [thư mục ra]   ->  <scratch>/shots/<tên>-check.png */
const {execFileSync}=require('child_process'),path=require('path'),fs=require('fs');
function check(name,outDir){const ROOT=path.join(__dirname,'../..'),mp4=path.join(ROOT,'media',`sm-${name}.mp4`);
  const pr=execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=codec_name,pix_fmt,width,height,nb_frames,duration','-of','csv=p=0',mp4]).toString().trim();
  const [codec,w,h,pix,dur,nb]=pr.split(','),N=+nb,W=+w,Hh=+h,idx=[0,Math.round(N/3),Math.round(N*2/3),N-1];
  const cw=W>Hh?640:W===Hh?400:320,tile=W>Hh?'2x2':'4x1',out=path.join(outDir,name+'-check.png');fs.mkdirSync(outDir,{recursive:true});
  execFileSync('ffmpeg',['-y','-loglevel','error','-i',mp4,'-vf',`select='${idx.map(n=>`eq(n\\,${n})`).join('+')}',scale=${cw}:-1,tile=${tile}:padding=4:color=0x333333`,'-fps_mode','passthrough','-frames:v','1',out]);
  return {out,probe:pr,kb:Math.round(fs.statSync(mp4).size/1024)}}
module.exports=check;
if(require.main===module){const [name,dir='/tmp/claude-0/-home-user/2c805972-97eb-57ae-8841-14adfe365124/scratchpad/M/shots']=process.argv.slice(2);const r=check(name,dir);console.log(name,r.kb+'KB',r.probe,'\n  ',r.out)}
