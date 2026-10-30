import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {dirname,resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist'),port=Number(process.env.PORT||5191);
const mime={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const file=resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+'/')&&!file.startsWith(root+'\\')&&file!==root){res.writeHead(403);return res.end();}const path=file===root?resolve(root,'index.html'):file;await stat(path);res.setHeader('Content-Type',mime[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end('Dosya bulunamadı');}}).listen(port,'127.0.0.1',()=>console.log(`Sonsuz Fraktal Evreni: http://127.0.0.1:${port}`));
