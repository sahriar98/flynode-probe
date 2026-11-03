const http=require('http'),os=require('os'),fs=require('fs'),{execSync}=require('child_process');
const {WebSocketServer}=require('ws');
const sh=c=>{try{return execSync(c,{timeout:5000}).toString().trim()}catch(e){return 'ERR: '+String(e.message).split('\n')[0]}};
let db=null,dbErr=null,dbPath=process.env.DB_PATH||'./probe.db';
try{const {DatabaseSync}=require('node:sqlite');db=new DatabaseSync(dbPath);db.exec('PRAGMA journal_mode=WAL');db.exec('CREATE TABLE IF NOT EXISTS boots(id INTEGER PRIMARY KEY, at TEXT)');db.prepare('INSERT INTO boots(at) VALUES(?)').run(new Date().toISOString())}catch(e){dbErr=String(e.message)}
const server=http.createServer((req,res)=>{
 if(req.url==='/'){res.end('ok');return}
 if(req.url==='/bench'){res.end(JSON.stringify(require('./bench')()));return}
 const info={node:process.version,port:process.env.PORT,cpus:os.cpus().length,memTotalMB:Math.round(os.totalmem()/1048576),memFreeMB:Math.round(os.freemem()/1048576),
  cgroupMemMax:sh('cat /sys/fs/cgroup/memory.max || cat /sys/fs/cgroup/memory/memory.limit_in_bytes'),rssMB:Math.round(process.memoryUsage().rss/1048576),
  df:sh('df -h . | tail -1'),mounts:sh('mount | grep -E " /(data|app|workspace)?" | head -5'),cwd:process.cwd(),
  ffmpeg:sh('ffmpeg -version | head -1'),sqlite:dbErr?{error:dbErr}:{boots:db.prepare('SELECT count(*) c, min(at) first, max(at) last FROM boots').get()},
  dbPath,writableCwd:(()=>{try{fs.writeFileSync('.w','1');return true}catch(e){return e.message}})(),uptimeS:Math.round(process.uptime())};
 res.setHeader('content-type','application/json');res.end(JSON.stringify(info,null,1))});
new WebSocketServer({server,path:'/ws'}).on('connection',w=>w.on('message',m=>w.send('echo:'+m)));
server.listen(process.env.PORT||3000,'0.0.0.0');
