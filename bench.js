module.exports=()=>{const t=process.hrtime.bigint();let x=0;for(let i=0;i<3e7;i++)x+=Math.sqrt(i)%7;
const c=require('crypto');const t2=process.hrtime.bigint();for(let i=0;i<20000;i++)c.createHash('sha256').update('x'+i).digest('hex');
const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync(':memory:');d.exec('CREATE TABLE t(a,b)');const s=d.prepare('INSERT INTO t VALUES(?,?)');const t3=process.hrtime.bigint();d.exec('BEGIN');for(let i=0;i<100000;i++)s.run(i,'v'+i);d.exec('COMMIT');const t4=process.hrtime.bigint();
return {cpuLoopMs:Number(t2-t)/1e6,sha256x20kMs:Number(t3-t2)/1e6,sqliteInsert100kMs:Number(t4-t3)/1e6}}
