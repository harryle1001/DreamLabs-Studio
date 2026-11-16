#!/usr/bin/env node
/* Static server để test: node serve.js 4101  -> http://127.0.0.1:4101/_A.html */
const http=require('http'),fs=require('fs'),path=require('path'),R=__dirname,port=+process.argv[2]||4100;
const T={html:'text/html; charset=utf-8',css:'text/css',js:'text/javascript',json:'application/json',webmanifest:'application/manifest+json',svg:'image/svg+xml',webp:'image/webp',avif:'image/avif',png:'image/png',jpg:'image/jpeg',woff2:'font/woff2',mp4:'video/mp4',webm:'video/webm',mp3:'audio/mpeg'};
http.createServer((q,s)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=path.join(R,p);
  if(!f.startsWith(R)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){s.writeHead(404);return s.end('404')}
  const st=fs.statSync(f),type=T[path.extname(f).slice(1)]||'application/octet-stream',r=q.headers.range;
  if(r){const m=/bytes=(\d*)-(\d*)/.exec(r),a=+m[1]||0,b=m[2]?+m[2]:st.size-1;s.writeHead(206,{'Content-Type':type,'Content-Range':`bytes ${a}-${b}/${st.size}`,'Accept-Ranges':'bytes','Content-Length':b-a+1});return fs.createReadStream(f,{start:a,end:b}).pipe(s)}
  s.writeHead(200,{'Content-Type':type,'Content-Length':st.size,'Accept-Ranges':'bytes','Cache-Control':'no-store'});fs.createReadStream(f).pipe(s)}).listen(port,'127.0.0.1',()=>console.log('http://127.0.0.1:'+port));
