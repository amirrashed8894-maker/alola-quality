/* Shared quality-report core — used by the iPhone PWA and the Al-Ola Station desktop app. Keep identical in both. */
(function(G){'use strict';
const QC={VER:1,FMT:'alola-qc',ROTMAX:5,WTOL:5,
normCtype(c){c=String(c||'').trim();if(!c)return c;const k=+((c.match(/(\d+)/)||[])[1]||0);if(/أوبن|اوبن|open/i.test(c)&&k===7)return 'أوبن توب 7 ك';if(/مقفول|كرتون|^\d/.test(c)){if(k===7)return 'مقفول صغير 7 ك';if(k===14)return 'مقفول 14 ك';if(k===15)return 'مقفول 15 ك'}return c},
nomW(c){const k=+((String(c||'').match(/(\d+(?:\.\d+)?)\s*ك/)||[])[1]||0);return k||0},
wFlag(r){const nm=QC.nomW(r.c),w=parseFloat(r.w);if(!nm||!(w>0))return '';const d=(w-nm)/nm*100;return Math.abs(d)>QC.WTOL?(d>0?'+':'')+(w-nm).toFixed(2)+' ك عن الاسمي '+nm+' ك':''},
DEFTOL:{'أولى':10,'وسط':15,'ثانية':20},
/* v26: قائمة المسببات من أمير بالترتيب + «أخرى» بنص حر («أخرى: …») */
ROTS:['نتشة','عفن السرة','تبحير','بقع زيتية','عفن بني','عفن ابيض','ليونة','ذبابة','قطيع عالي','جروح','لسعة شمس'],
L:{variety:["أبو سرة","صيفي","بلدي","ليمون","كلمنتينا","فريمونت","موركيت كيني","موركيت إسباني"],size:["20","24","28","32","36","40","42","48","56","64","72","80","88","100","113","125","138","150","162","216"],carton:["أوبن توب 7 ك","مقفول صغير 7 ك","مقفول 14 ك","مقفول 15 ك","جامبو بلاستيك","صندوق 2 ك","صندوق 5 ك","صندوق 7 ك","صندوق 10 ك"],grade:["أولى","وسط","ثانية"],pack:["كرتون","صندوق بلاستيك"],loc:["الصالة","الثلاجة"],brand:["العلا","الحسن","كوكلو"],exporter:["العلا","الحسن","صن فروت"],
def:["خدش / جرح","كدمات / ضغط","تشوه شكل","حرق شمس","أكروس","أكروس حلقي","خدوش رياح","حشرات / قشرية","حجم مخالف","أخرى"]}};
QC.L.rot=QC.ROTS.concat(['أخرى']);QC.isOther=t=>t==='أخرى'||String(t||'').startsWith('أخرى: ');
/* القطر ووزن الحبة للمقاس (من sizes.js المشترك) — نص خفيف في الشاشة والتقرير */
QC.szInfo=(r,opt)=>{const A=G.ALS;if(!A||!r||!r.s)return '';const g=A.groupOf(r.v);if(!g)return '';const pk=A.packOf(g,r.c,r.pk);/* v26: الحسابات بالوزن الفعلي (الميزان) مش الاسمي */const w=N(r.w),nk=pk&&pk.kg||0;const pk2=w>0&&pk&&nk<14?Object.assign({},pk,{kg:w}):pk;const t=A.text(A.info(g,pk2,r.s,w>0?w:nk),opt);return t};
QC.actW=r=>{const n=parseFloat(r&&r.n),w=parseFloat(r&&r.w);return n>0&&w>0?Math.round(w*1000/n):0};
QC.normGrade=g=>{g=String(g??'').trim();return /^(تانية|تانيه|ثانيه)$/.test(g)?'ثانية':g};
const N=v=>{const x=parseFloat(String(v??'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)));return isFinite(x)?x:0};
const r1=x=>Math.round(x*10)/10;
QC.esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
QC.rotN=r=>(r.rots||[]).reduce((t,x)=>t+N(x.n),0);
QC.rotTxt=r=>(r.rots||[]).filter(x=>N(x.n)>0||x.t).map(x=>((N(x.n)||'')+' '+(x.t||'')).trim()).join('، ');
QC.used=rep=>rep.rows.filter(r=>N(r.n)||r.v||QC.rotN(r)||N(r.dn));
QC.tol=(rep,g)=>{g=QC.normGrade(g);const tl=rep.tol||QC.DEFTOL;const t=tl[g]??(g==='ثانية'?tl['تانية']:undefined);return t===''||t==null?null:N(t)};
QC.res=(rep,r)=>{const n=N(r.n),rn=QC.rotN(r),dn=N(r.dn);const tol=r.g?QC.tol(rep,r.g):null;
 if(!n)return(rn||dn)?{pct:'',rp:'',txt:'ناقص — عدد الحبات',st:'inc',tol:tol??''}:{pct:'',rp:'',txt:'',st:'',tol:tol??''};
 const pct=r1(dn/n*100),rp=r1(rn/n*100);
 if(!(N(r.w)>0))return{pct,rp,txt:'ناقص — الوزن',st:'inc',tol:tol??''};
 if(rn*100>QC.ROTMAX*n)return{pct,rp,txt:'مرفوض — أعفان',st:'rej',tol:tol??''};
 if(!r.g||tol==null)return{pct,rp,txt:'ناقص — الدرجة',st:'inc',tol:''};
 return dn*100>tol*n?{pct,rp,txt:'مخالف — تشوهات',st:'nc',tol}:{pct,rp,txt:'مطابق',st:'ok',tol}};
QC.summ=rep=>{const u=QC.used(rep).map((r,i)=>({...r,i:i+1,R:QC.res(rep,r)}));const d=u.filter(r=>['ok','rej','nc'].includes(r.R.st));
 const a={rows:u,tot:u.length,done:d.length,ok:0,rej:0,nc:0,inc:u.filter(r=>r.R.st==='inc').length,fr:0,rf:0,df:0,kg:0,kgN:0,rotT:{},defT:{},byGr:{},byV:{},byF:{},byL:{}};
 d.forEach(r=>{a[r.R.st]++;a.fr+=N(r.n);a.rf+=QC.rotN(r);a.df+=N(r.dn);if(N(r.w)){a.kg+=N(r.w);a.kgN++}
  (r.rots||[]).forEach(x=>{if(N(x.n)>0){const k=x.t||'غير محدد';a.rotT[k]=(a.rotT[k]||0)+N(x.n)}});if(N(r.dn)>0){const k=r.dt||'غير محدد';a.defT[k]=(a.defT[k]||0)+N(r.dn)}
  [['byGr',QC.normGrade(r.g)||'—'],['byV',r.v||'—'],['byF',r.gr],['byL',r.ln]].forEach(([b,k])=>{if(!k)return;const o=a[b][k]=a[b][k]||{n:0,fr:0,ok:0,rej:0,nc:0,rot:{}};o.n++;o.fr+=N(r.n);o[r.R.st]++;(r.rots||[]).forEach(x=>{if(N(x.n)>0&&x.t)o.rot[x.t]=(o.rot[x.t]||0)+N(x.n)})})});
 const P=(x,t)=>t?r1(x/t*100):0;u.filter(r=>r.R.st==='inc').forEach(r=>{a.fr+=N(r.n);a.rf+=QC.rotN(r);a.df+=N(r.dn)});a.okp=P(a.ok,a.tot);a.rejp=P(a.rej,a.tot);a.ncp=P(a.nc,a.tot);a.rp=P(a.rf,a.fr);a.dp=P(a.df,a.fr);a.avgW=a.kgN?Math.round(a.kg/a.kgN*100)/100:0;
 a.rotS=Object.entries(a.rotT).sort((x,y)=>y[1]-x[1]);a.defS=Object.entries(a.defT).sort((x,y)=>y[1]-x[1]);a.pallets=[...new Set(u.map(r=>(r.p||'').toUpperCase()).filter(Boolean))];a.varieties=[...new Set(u.map(r=>r.v).filter(Boolean))];return a};
QC.missing=rep=>{const o=[];rep.rows.forEach((r,i)=>{const m=[];if(!(N(r.w)>0))m.push('الوزن');if(!(N(r.n)>0))m.push('المقاس (عدد الحبات)');if(!(r.phW||[]).length)m.push('صورة الميزان');if(!r.g)m.push('الدرجة');if(m.length)o.push('كرتونة '+(i+1)+': ناقص '+m.join(' و '))});return o};
QC.diversity=rep=>{const rs=rep.rows,k=rs.map(r=>(r.c||'')+'|'+(r.s||''));const w=[];if(rs.length<4)w.push('عدد الكراتين '+rs.length+' بس — المطلوب 4 كراتين في كل فحص');const dup=k.filter((x,i)=>k.indexOf(x)!==i);if(dup.length)w.push('فيه كراتين بنفس نوع الكرتون والمقاس ('+[...new Set(dup)].map(x=>x.replace('|',' · مقاس ')).join('، ')+') — المطلوب 4 كراتين بأنواع/مقاسات مختلفة');return w};
/* v18: جزء التاريخ في الكود = تاريخ الفحص (rep.date) مش يوم الإصدار */
QC.code=(d,day)=>{d=d||new Date();const p=x=>String(x).padStart(2,'0');const dd=/^\d{4}-\d{2}-\d{2}$/.test(String(day||''))?String(day).replace(/-/g,''):`${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}`;return `QC-${dd}-${p(d.getHours())}${p(d.getMinutes())}-${Math.random().toString(36).slice(2,6).toUpperCase()}`};
QC.CSS=`.qcr{font-family:'Cairo',Tahoma,sans-serif;color:#1d2420;background:#fff;width:794px;padding:22px 30px 20px;font-size:10.5px;line-height:1.45;direction:rtl;position:relative;box-sizing:border-box}
.qcr *{box-sizing:border-box}.qcr .cd{position:absolute;top:7px;left:12px;font-size:7.5px;color:#9ca3af;direction:ltr}
.qcr .hd{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1d2420;padding-bottom:6px}.qcr .hd img{height:44px}.qcr .hd b{font-size:17px;display:block}.qcr .hd small{color:#6b7280;font-size:9px}
.qcr .inf{display:grid;grid-template-columns:repeat(6,1fr);margin:6px 0 8px;border-bottom:1px solid #d9dedb}.qcr .inf div{padding:3px 6px 5px;font-weight:700;font-size:10.5px}.qcr .inf i{display:block;font-style:normal;color:#6b7280;font-size:8px;font-weight:400}
.qcr .vb{display:grid;grid-template-columns:1.35fr 1fr;border:1.5px solid #1d2420;border-radius:8px;overflow:hidden;margin-bottom:8px}.qcr .vt{padding:9px 12px;border-left:1px solid #d9dedb}.qcr .vt i{font-style:normal;color:#6b7280;font-size:9px;display:block}.qcr .vt b{display:block;font-size:24px;line-height:1.25}.qcr .vt span{display:block;font-size:10.5px;margin-top:3px;font-weight:600}.qcr .vt span em{font-style:normal;display:block;font-weight:400}
.qcr .v-ok .vt b,.qcr .c-ok{color:#1f8a12}.qcr .v-bad .vt b,.qcr .c-rej,.qcr .c-nc{color:#b91c1c}.qcr .v-inc .vt b,.qcr .c-inc{color:#b45309}.qcr .v-ok{border-color:#1f8a12}.qcr .v-bad{border-color:#b91c1c}.qcr .v-inc{border-color:#b45309}
.qcr .kp{display:grid;grid-template-columns:1fr 1fr}.qcr .kp div{padding:6px 10px;border-bottom:1px solid #eceeed;border-left:1px solid #eceeed}.qcr .kp div:nth-child(2n){border-left:0}.qcr .kp div:nth-child(n+3){border-bottom:0}.qcr .kp i{font-style:normal;color:#6b7280;font-size:8.5px;display:block}.qcr .kp b{font-size:18px}.qcr .kp small{color:#6b7280;font-size:8.5px;margin-right:4px}.qcr .kp .x b{color:#b91c1c}
.qcr h3{font-size:12.5px;margin:10px 0 4px;padding-bottom:2px;border-bottom:1.5px solid #1d2420;display:flex;justify-content:space-between;align-items:baseline}.qcr h3 small{font-weight:400;color:#6b7280;font-size:8.5px}
.qcr h4{font-size:10.5px;margin:7px 0 3px;color:#374151}
.qcr table{border-collapse:collapse;width:100%;font-size:9.5px}.qcr th{background:#f1f3f2;border-bottom:1.5px solid #1d2420;padding:4px 3px;font-weight:700;font-size:8.5px;color:#374151}.qcr td{border-bottom:1px solid #e3e6e4;padding:4px 3px;text-align:center;vertical-align:middle}.qcr td.l,.qcr th.l{text-align:right}.qcr td small{display:block;color:#6b7280;font-size:7.5px}.qcr td b{font-size:10.5px}
.qcr tr.t td{font-weight:700;border-top:1.5px solid #1d2420;border-bottom:0;background:#fafbfa}.qcr .dec{font-weight:700;white-space:nowrap}.qcr .hi{font-weight:700;color:#b91c1c}
.qcr .mc{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:6px;font-size:9.5px}.qcr .mc b{display:block;font-size:9px;color:#6b7280;font-weight:400}.qcr .mc span{display:inline-block;margin-left:10px;font-weight:600}
.qcr .cb{border:1px solid #c9cfcb;border-radius:8px;margin:0 0 8px;overflow:hidden}.qcr .cbh{display:flex;align-items:center;gap:8px;background:#f1f3f2;padding:5px 9px;border-bottom:1px solid #d9dedb}.qcr .cbh .n{background:#1d2420;color:#fff;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:10px}.qcr .cbh b{font-size:11.5px}.qcr .cbh .dec{margin-right:auto;font-size:11.5px}
.qcr .cbg{display:grid;grid-template-columns:repeat(6,1fr);padding:4px 6px}.qcr .cbg div{padding:2px 4px;font-weight:600;font-size:9.5px}.qcr .cbg i{display:block;font-style:normal;color:#6b7280;font-size:7.5px;font-weight:400}.qcr .cbg small{display:block;font-weight:400;color:#6b7280;font-size:7.5px}
.qcr .cbr{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:3px 10px 6px;border-top:1px dashed #d9dedb}.qcr .cbr b{display:block;font-size:8.5px;color:#6b7280;font-weight:400}.qcr .cbr div div{font-weight:600;font-size:10px}.qcr .cbn{padding:2px 10px 6px;font-size:9.5px}
.qcr .prw{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:0 8px 8px}.qcr .pr{border:1px solid #d9dedb;border-radius:5px;overflow:hidden}.qcr .pr img{display:block;width:100%;height:165px;object-fit:cover}.qcr .pr.w img{object-fit:contain;background:#f6f6f6}.qcr .pr .pl{font-size:9px;padding:2px 6px;font-weight:600;background:#fafbfa;border-top:1px solid #e3e6e4}.qcr .pr .pl small{font-weight:400;color:#6b7280;margin-right:4px}
.qcr .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}.qcr .bar{display:inline-block;height:5px;background:#9aa39e;vertical-align:middle;border-radius:2px}.qcr .ex{font-size:8px;color:#6b7280;margin:4px 0}
.qcr .end{page-break-inside:avoid}.qcr .sg{display:grid;grid-template-columns:1fr 1fr 1fr;margin-top:12px;font-size:10px}.qcr .ft{display:flex;align-items:center;gap:6px;margin-top:10px;font-size:9.5px;justify-content:flex-end}.qcr .ft img{height:20px;filter:grayscale(1)}`;
QC.issued=rep=>{if(rep.createdAt)return new Date(rep.createdAt);const m=String(rep.code||'').match(/QC-(\d{4})(\d\d)(\d\d)-(\d\d)(\d\d)/);return m?new Date(+m[1],m[2]-1,+m[3],+m[4],+m[5]):null};
QC.hm=d=>d?String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'):'—';
QC.next=rep=>{const d=QC.issued(rep);return d?new Date(d.getTime()+QC.EVERY*60000):null};QC.EVERY=30;
/* v25: التقرير — فوق: الخلاصة (النتيجة، النسب، أهم مشكلة في كل كرتونة) · تحت: الشرح المفصل لكل كرتونة بصورها */
QC.html=(rep,base)=>{base=base||'';const a=QC.summ(rep),e=QC.esc,P=x=>a.fr?r1(x/a.fr*100):0;const bad=a.rej+a.nc;const iss=QC.issued(rep),nx=QC.next(rep);
 const DEC={ok:'✓ مطابق',rej:'✗ مرفوض — مسببات',nc:'✗ مخالف — تشوهات',inc:'⚠ ناقص'};const dec=r=>r.R.st==='inc'?'⚠ '+r.R.txt:(DEC[r.R.st]||'—');
 const topRot=r=>{const L=(r.rots||[]).filter(x=>N(x.n)>0).sort((x,y)=>N(y.n)-N(x.n));return L[0]?(L[0].t||'غير محدد'):''};
 const why=r=>r.R.st==='rej'?`ك${r.i}: مسببات ${r.R.rp}%${topRot(r)?' ('+e(topRot(r))+')':''}`:r.R.st==='nc'?`ك${r.i}: تشوه ${r.R.pct}% > حد ${r.R.tol}%${r.dt?' ('+e(r.dt)+')':''}`:r.R.st==='inc'?`ك${r.i}: ${e(r.R.txt.replace('ناقص — ','ناقص '))}`:'';
 const vcls=!a.tot||a.inc?'v-inc':bad?'v-bad':'v-ok';
 const vword=!a.tot?'لا توجد كراتين':a.inc?'غير مكتمل':bad?'خارج المواصفات':'مطابق';
 const vline=!a.tot?'':a.inc?`${a.inc} من ${a.tot} كراتين ناقصة البيانات${bad?` · ${bad} خارج المواصفات`:''}`:bad?`${bad} من ${a.tot} كراتين — ${a.rej} مرفوضة مسببات · ${a.nc} مخالفة تشوهات`:`كل الكراتين (${a.tot}) داخل المواصفات`;
 const vwhy=a.rows.filter(r=>r.R.st!=='ok').map(why).filter(Boolean).join(' · ');
 const top=(s)=>s.length?s.slice(0,3).map(([k,n])=>`<span>${e(k)} ${n} حبة (${P(n)}%)</span>`).join(''):'<span>لا يوجد</span>';
 const mx=s=>s.length?s[0][1]:1;const bt=(s,lab)=>`<table><tr><th class="l">${lab}</th><th>حبات</th><th>%</th><th style="width:34%"></th></tr>${s.length?s.map(([k,n])=>`<tr><td class="l">${e(k)}</td><td>${n}</td><td>${P(n)}%</td><td class="l"><span class="bar" style="width:${Math.max(3,Math.round(n/mx(s)*100))}%"></span></td></tr>`).join(''):'<tr><td colspan="4">لا يوجد</td></tr>'}<tr class="t"><td class="l">الإجمالي</td><td>${s.reduce((t,x)=>t+x[1],0)}</td><td>${P(s.reduce((t,x)=>t+x[1],0))}%</td><td></td></tr></table>`;
 const grp=(o,lab)=>{const k=Object.keys(o);return k.length?`<table><tr><th class="l">${lab}</th><th>كراتين</th><th>مطابق</th><th>مرفوض</th><th>مخالف</th><th>% قبول</th></tr>${k.map(x=>{const g=o[x];return `<tr><td class="l">${e(x)}</td><td>${g.n}</td><td>${g.ok}</td><td>${g.rej}</td><td>${g.nc}</td><td>${g.n?Math.round(g.ok/g.n*100):0}%</td></tr>`}).join('')}</table>`:''};
 const ttl=r=>[r.v,r.s?'مقاس '+r.s:'',r.c].filter(Boolean).join(' · ');
 const rows=a.rows.map(r=>{const rs=r.R.st;return `<tr><td><b>${r.i}</b></td><td class="l"><b>${e(r.v||'—')}</b><small>مقاس ${e(r.s||'—')} · ${e(r.c||'')}</small></td><td>${e(QC.normGrade(r.g)||'—')}</td><td dir="ltr">${e(r.p||'—')}</td><td class="${rs==='rej'?'hi':''}">${r.R.rp===''?'—':r.R.rp+'%'}<small>${QC.rotN(r)} حبة</small></td><td class="l">${e(topRot(r)||'—')}</td><td class="${rs==='nc'?'hi':''}">${r.R.pct===''?'—':r.R.pct+'%'}<small>${r.R.tol!==''?'حد '+r.R.tol+'%':''}</small></td><td class="l">${N(r.dn)>0?e(r.dt||'غير محدد'):'—'}</td><td class="dec c-${rs}">${e(dec(r))}</td></tr>`}).join('');
 const nph=a.rows.reduce((t,r)=>t+(r.phW||[]).length+(r.rots||[]).reduce((q,x)=>q+(x.ph||[]).length,0)+(r.phD||[]).length+(r.ph||[]).length,0);
 const ph=(u,t,s,w)=>`<div class="pr${w?' w':''}"><img src="${u}"><div class="pl">${e(t)}${s?`<small>${e(s)}</small>`:''}</div></div>`;
 const blk=r=>{const L=[];(r.phW||[]).forEach(u=>L.push(ph(u,'الميزان: '+(N(r.w)||'—')+' ك','الوزن الفعلي',1)));
  (r.rots||[]).forEach(x=>(x.ph||[]).forEach(u=>L.push(ph(u,'مسبب: '+(x.t||'غير محدد'),(N(x.n)||0)+' حبة'))));(r.phD||[]).forEach(u=>L.push(ph(u,'تشوه: '+(r.dt||'غير محدد'),(N(r.dn)||0)+' حبة')));(r.ph||[]).forEach(u=>L.push(ph(u,'صورة عامة','')));
  const rowsP=[];for(let k=0;k<L.length;k+=3)rowsP.push(`<div class="prw">${L.slice(k,k+3).join('')}</div>`);
  const szt=QC.szInfo(r,{short:1}),aw=QC.actW(r);const rotL=(r.rots||[]).filter(x=>N(x.n)>0||x.t);
  return `<div class="cb"><div class="cbh"><span class="n">${r.i}</span><b>${e(ttl(r)||'كرتونة '+r.i)}</b><span class="dec c-${r.R.st}">${e(dec(r))}</span></div>
<div class="cbg"><div><i>الوقت</i>${e(r.time||'—')}</div><div><i>الدرجة</i>${e(QC.normGrade(r.g)||'—')}</div><div><i>الباليت</i><span dir="ltr">${e(r.p||'—')}</span></div><div><i>التعبئة / الاسم</i>${e(r.pk||'—')}<small>${e(r.b||'')}</small></div><div><i>المزرعة / الخط</i>${e(r.gr||'—')}<small>${e([r.ln,r.loc].filter(Boolean).join(' · '))}</small></div><div><i>المقاس = الحبات / الوزن الفعلي</i>${N(r.n)||'—'} حبة · ${N(r.w)||'—'} ك<small>${e([szt||(aw?aw+' جم/حبة':'')].filter(Boolean).join(' · '))}</small></div></div>
<div class="cbr"><div><b>المسببات — ${QC.rotN(r)} حبة${r.R.rp!==''?' = '+r.R.rp+'% (حد '+QC.ROTMAX+'%)':''}</b><div>${rotL.length?rotL.map(x=>e(((N(x.n)||'')+' '+(x.t||'غير محدد')).trim())).join(' · '):'لا يوجد'}</div></div><div><b>التشوهات — ${N(r.dn)} حبة${r.R.pct!==''?' = '+r.R.pct+'%':''}${r.R.tol!==''?' (حد '+r.R.tol+'%)':''}</b><div>${N(r.dn)>0?e(r.dt||'غير محدد'):'لا يوجد'}</div></div></div>
${r.note?`<div class="cbn"><b>ملاحظة:</b> ${e(r.note)}</div>`:''}${rowsP.join('')}</div>`};
 return `<div class="qcr${nph?' hasph':''}"><div class="cd">${e(rep.code)}</div><div class="hd"><div><b>تقرير فحص الجودة</b><small>شركة العلا لفرز الحاصلات الزراعية — إدارة الجودة</small></div><img src="${base}alola_logo.png"></div>
<div class="inf"><div><i>المُصدّر</i>${e(rep.exp||'—')}</div><div><i>التاريخ / الوردية</i>${e(rep.date)} ${e(rep.shift||'')}</div><div><i>مهندس الجودة</i>${e(rep.insp||'—')}</div><div><i>وقت الإصدار</i>${QC.hm(iss)}</div><div><i>الفحص القادم</i>${QC.hm(nx)}</div><div><i>رقم الفحص</i><span dir="ltr" style="font-size:9px">${e(rep.code||'—')}</span></div></div>
<div class="vb ${vcls}"><div class="vt"><i>النتيجة</i><b>${vword}</b><span>${vline}${vwhy?`<em>${vwhy}</em>`:''}</span></div>
<div class="kp"><div><i>مطابق</i><b>${a.ok}/${a.tot}</b><small>${a.okp}%</small></div><div class="${a.rp>QC.ROTMAX?'x':''}"><i>المسببات من الحبات</i><b>${a.rp}%</b><small>${a.rf} من ${a.fr} · حد ${QC.ROTMAX}%</small></div><div><i>التشوهات من الحبات</i><b>${a.dp}%</b><small>${a.df} حبة</small></div><div><i>متوسط الوزن الفعلي</i><b>${a.avgW||'—'}</b><small>ك</small></div></div></div>
<table><tr><th>#</th><th class="l">الكرتونة</th><th>الدرجة</th><th>الباليت</th><th>مسببات</th><th class="l">أهم مسبب</th><th>تشوه</th><th class="l">أهم عيب</th><th>القرار</th></tr>${rows}
<tr class="t"><td></td><td class="l">الإجمالي ${a.tot} كراتين</td><td></td><td></td><td>${a.rp}%<small>${a.rf} حبة</small></td><td></td><td>${a.dp}%<small>${a.df} حبة</small></td><td></td><td>${a.ok} مطابق</td></tr></table>
${rep.notes?`<div class="ex" style="color:#1d2420;font-size:9.5px"><b>ملاحظات المهندس:</b> ${e(rep.notes)}</div>`:''}
<h3>المسببات والتشوهات — الإجمالي</h3><div class="two"><div><h4>المسببات (${a.rf} حبة = ${a.rp}%)</h4>${bt(a.rotS,'المسبب')}</div><div><h4>التشوهات (${a.df} حبة = ${a.dp}%)</h4>${bt(a.defS,'العيب')}<div class="ex">حد التشوه: أولى ${QC.tol(rep,'أولى')}% · وسط ${QC.tol(rep,'وسط')}% · ثانية ${QC.tol(rep,'ثانية')}%</div></div></div>
${Object.keys(a.byGr).length>1||Object.keys(a.byV).length>1?`<div class="two"><div>${grp(a.byGr,'الدرجة')}</div><div>${grp(a.byV,'الصنف')}</div></div>`:''}
<h3 class="pb">الشرح المفصل لكل كرتونة <small>${nph} صورة · القاعدة: مسببات &gt; ${QC.ROTMAX}% = مرفوض · تشوه فوق حد الدرجة = مخالف</small></h3>
${a.rows.map(blk).join('')}
<div class="end"><div class="sg"><div>مهندس الجودة: ${e(rep.insp||'..............')}</div><div>التوقيع: ..............</div><div>مدير الجودة: ..............</div></div>
<div class="ft"><img src="${base}rashed_logo_gray.png"><span>يعتمد: شركة الراشد للتجارة</span></div></div></div>`};
G.QC=QC})(typeof window!=='undefined'?window:globalThis);
