/* Shared quality-report core — used by the iPhone PWA and the Al-Ola Station desktop app. Keep identical in both. */
(function(G){'use strict';
const QC={VER:1,FMT:'alola-qc',ROTMAX:5,WTOL:5,
normCtype(c){c=String(c||'').trim();if(!c)return c;const k=+((c.match(/(\d+)/)||[])[1]||0);if(/أوبن|اوبن|open/i.test(c)&&k===7)return 'أوبن توب 7 ك';if(/مقفول|كرتون|^\d/.test(c)){if(k===7)return 'مقفول صغير 7 ك';if(k===14)return 'مقفول 14 ك';if(k===15)return 'مقفول 15 ك'}return c},
nomW(c){const k=+((String(c||'').match(/(\d+(?:\.\d+)?)\s*ك/)||[])[1]||0);return k||0},
wFlag(r){const nm=QC.nomW(r.c),w=parseFloat(r.w);if(!nm||!(w>0))return '';const d=(w-nm)/nm*100;return Math.abs(d)>QC.WTOL?(d>0?'+':'')+(w-nm).toFixed(2)+' ك عن الاسمي '+nm+' ك':''},
DEFTOL:{'أولى':10,'وسط':15,'ثانية':20},
ROTS:['عفن أخضر','عفن أزرق','عفن حامضي','عفن الطرف العنقي — ديبلوديا','عفن الطرف العنقي — فوموبسيس','عفن أسود (ألترناريا)','أنثراكنوز','عفن بني (فيتوفثورا)','عفن رمادي (بوترايتس)','عفن ترايكوديرما','إصابة ذبابة الفاكهة','أضرار برودة','تبقع زيتي (أوليوسيلوزس)'],
L:{variety:["أبو سرة","صيفي","موركيت كيني","موركيت إسباني","ليمون"],size:["40","48","56","64","72","80","88","100","113","20","28","32","36","42"],carton:["أوبن توب 7 ك","مقفول صغير 7 ك","مقفول 14 ك","مقفول 15 ك"],grade:["أولى","وسط","ثانية"],pack:["كرتون","صندوق بلاستيك"],loc:["الصالة","الثلاجة"],brand:["العلا","الحسن","كوكلو"],exporter:["العلا","الحسن","صن فروت"],
def:["خدش / جرح","كدمات / ضغط","تشوه شكل","حرق شمس","أكروس","خدوش رياح","حشرات / قشرية","حجم مخالف","أخرى"]}};
QC.L.rot=QC.ROTS.concat(['أخرى']);
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
QC.missing=rep=>{const o=[];rep.rows.forEach((r,i)=>{const m=[];if(!(N(r.w)>0))m.push('الوزن');if(!(N(r.n)>0))m.push('عدد الحبات');if(!(r.phW||[]).length)m.push('صورة الميزان');if(!r.g)m.push('الدرجة');if(m.length)o.push('كرتونة '+(i+1)+': ناقص '+m.join(' و '))});return o};
QC.diversity=rep=>{const rs=rep.rows,k=rs.map(r=>(r.c||'')+'|'+(r.s||''));const w=[];if(rs.length<4)w.push('عدد الكراتين '+rs.length+' بس — المطلوب 4 كراتين في كل فحص');const dup=k.filter((x,i)=>k.indexOf(x)!==i);if(dup.length)w.push('فيه كراتين بنفس نوع الكرتون والمقاس ('+[...new Set(dup)].map(x=>x.replace('|',' · مقاس ')).join('، ')+') — المطلوب 4 كراتين بأنواع/مقاسات مختلفة');return w};
QC.code=d=>{d=d||new Date();const p=x=>String(x).padStart(2,'0');return `QC-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}-${Math.random().toString(36).slice(2,6).toUpperCase()}`};
QC.CSS=`.qcr{font-family:'Cairo',Tahoma,sans-serif;color:#111;background:#fff;width:794px;padding:24px 30px 22px;font-size:10.5px;line-height:1.4;direction:rtl;position:relative;box-sizing:border-box}
.qcr *{box-sizing:border-box}.qcr .cd{position:absolute;top:7px;left:12px;font-size:7.5px;color:#aaa;direction:ltr}
.qcr .hd{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #111;padding-bottom:5px}.qcr .hd img{height:46px;filter:grayscale(1)}.qcr .hd b{font-size:14px;display:block}.qcr .hd small{color:#666;font-size:9px}
.qcr h2{text-align:center;font-size:16px;margin:7px 0 4px}
.qcr .inf{display:grid;grid-template-columns:repeat(6,1fr);border:1px solid #777;margin:0 0 6px}.qcr .inf div{padding:3px 6px;border-left:1px solid #ccc;font-weight:600}.qcr .inf div:last-child{border-left:0}.qcr .inf i{display:block;font-style:normal;color:#777;font-size:8px;font-weight:400}.qcr .inf .nx{background:#eee}
.qcr .rb{display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr 1fr;border:1.5px solid #111;margin:0 0 6px}.qcr .rb>div{padding:4px 7px;border-left:1px solid #bbb}.qcr .rb>div:last-child{border-left:0}.qcr .rb b{display:block;font-size:15px}.qcr .rb i{display:block;font-style:normal;font-size:8px;color:#777}.qcr .rb .vd{background:#eee;font-weight:700;font-size:10.5px;display:flex;align-items:center}
.qcr table{border-collapse:collapse;width:100%;font-size:9.5px;margin-bottom:2px}.qcr th{background:#e4e4e4;border:1px solid #888;padding:3px;font-weight:700}.qcr td{border:1px solid #bbb;padding:2px 3px;text-align:center;vertical-align:middle}.qcr td.l{text-align:right}.qcr td small{display:block;color:#777;font-size:7.5px}
.qcr tr.t td{font-weight:700;background:#f1f1f1;border-top:1.5px solid #111}.qcr .ex{font-size:8px;color:#888;margin:0 0 6px}
.qcr h4{font-size:11px;margin:7px 0 3px;border-bottom:1px solid #999;padding-bottom:1px}.qcr .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.qcr .bar{display:inline-block;height:6px;background:#777;vertical-align:middle}.qcr .st-rej,.qcr .st-nc{font-weight:700;text-decoration:underline}
.qcr .wf{font-size:7px;color:#444;white-space:nowrap}.qcr .wph{height:30px;width:40px;object-fit:cover;display:block;margin:1px auto;border:1px solid #bbb}
.qcr .sw{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px}.qcr .swc{border:1px solid #999;page-break-inside:avoid}.qcr .swl{font-size:10px;padding:3px 6px;background:#eee;border-bottom:1px solid #bbb}.qcr .swl b{display:block;font-size:11px}.qcr .swc img{display:block;width:100%;height:300px;object-fit:contain;background:#f6f6f6;filter:grayscale(0)}.qcr .pc{border:1px solid #bbb;margin-bottom:5px;page-break-inside:avoid}.qcr .pc .pt{background:#eee;font-weight:700;padding:2px 6px;font-size:9.5px;border-bottom:1px solid #bbb}
.qcr .pg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px}.qcr .pr{border:1px solid #ccc;page-break-inside:avoid}.qcr .pr .pl{display:block;width:auto;max-width:none;flex:none;text-align:right;font-size:10px;padding:3px 5px;background:#f2f2f2;border-top:1px solid #ccc;font-weight:600}.qcr .pr .pl small{display:block;font-weight:400;color:#666;font-size:9px}.qcr .pr .pi{display:flex;flex-wrap:wrap;gap:4px}.qcr .pr img{display:block;width:100%;height:170px;object-fit:cover;filter:none}
.qcr .end{page-break-inside:avoid}.qcr .sg{display:grid;grid-template-columns:1fr 1fr 1fr;margin-top:8px;font-size:10px}.qcr .ft{display:flex;align-items:center;gap:6px;margin-top:10px;font-size:10px;justify-content:flex-end;direction:rtl}.qcr .ft img{height:22px;filter:grayscale(1)}`;
QC.issued=rep=>{if(rep.createdAt)return new Date(rep.createdAt);const m=String(rep.code||'').match(/QC-(\d{4})(\d\d)(\d\d)-(\d\d)(\d\d)/);return m?new Date(+m[1],m[2]-1,+m[3],+m[4],+m[5]):null};
QC.hm=d=>d?String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'):'—';
QC.next=rep=>{const d=QC.issued(rep);return d?new Date(d.getTime()+QC.EVERY*60000):null};QC.EVERY=30;
QC.html=(rep,base)=>{base=base||'';const a=QC.summ(rep),e=QC.esc,P=x=>a.fr?r1(x/a.fr*100):0;const bad=a.rej+a.nc;const iss=QC.issued(rep),nx=QC.next(rep);
 const verdict=!a.tot?'لا توجد كراتين':a.inc?`⚠ النتيجة: غير مكتمل — ${a.inc} من ${a.tot} كرتونة ناقصة البيانات (${e([...new Set(a.rows.filter(r=>r.R.st==='inc').map(r=>r.R.txt.replace('ناقص — ','')))].join('، '))})${bad?` · ${bad} خارج المواصفات`:''}`:bad===0?`✔ النتيجة: مطابق — كل الكراتين المفحوصة (${a.tot}) داخل المواصفات`:`✖ النتيجة: ${bad} من ${a.tot} كرتونة خارج المواصفات — ${a.rej} مرفوضة أعفان${a.rotS[0]?' (أكبر مسبب: '+e(a.rotS[0][0])+')':''}، ${a.nc} مخالفة تشوهات${a.defS[0]?' (أكبر عيب: '+e(a.defS[0][0])+')':''}`;
 const mx=s=>s.length?s[0][1]:1;const bt=(s,lab)=>`<table><tr><th>#</th><th>${lab}</th><th>حبات</th><th>%</th><th style="width:32%"></th></tr>${s.length?s.map(([k,n],j)=>`<tr><td>${j+1}</td><td class="l">${e(k)}</td><td>${n}</td><td>${P(n)}%</td><td class="l"><span class="bar" style="width:${Math.max(3,Math.round(n/mx(s)*100))}%"></span></td></tr>`).join(''):'<tr><td colspan="5">لا يوجد</td></tr>'}<tr class="t"><td></td><td class="l">الإجمالي</td><td>${s.reduce((t,x)=>t+x[1],0)}</td><td>${P(s.reduce((t,x)=>t+x[1],0))}%</td><td></td></tr></table>`;
 const grp=(o,lab)=>{const k=Object.keys(o);return k.length?`<table><tr><th>${lab}</th><th>كراتين</th><th>مطابق</th><th>مرفوض</th><th>مخالف</th><th>% قبول</th></tr>${k.map(x=>{const g=o[x];return `<tr><td class="l">${e(x)}</td><td>${g.n}</td><td>${g.ok}</td><td>${g.rej}</td><td>${g.nc}</td><td>${g.n?Math.round(g.ok/g.n*100):0}%</td></tr>`}).join('')}</table>`:''};
 const pcs=a.rows.map(r=>{const L=[];(r.rots||[]).forEach(x=>{if((x.ph||[]).length)L.push(['مسبب عفن: '+(x.t||'غير محدد'),(N(x.n)||0)+' حبة',x.ph])});if((r.phD||[]).length)L.push(['تشوه: '+(r.dt||'غير محدد'),(N(r.dn)||0)+' حبة',r.phD]);if((r.ph||[]).length)L.push(['صور عامة','',r.ph]);
  return L.flatMap(([t,s,l])=>l.map(u=>`<div class="pr"><img src="${u}"><div class="pl">كرتونة ${r.i}: ${e(t)}<small>${e([s,r.v,r.s,r.c].filter(Boolean).join(' · '))}</small></div></div>`)).join('')}).join('');
 const sws=a.rows.flatMap(r=>(r.phW||[]).map(u=>`<div class="swc"><div class="swl">كرتونة ${r.i} — ${e([r.v,r.s,r.c].filter(Boolean).join(' · '))}<b>الوزن المسجل: ${N(r.w)||'—'} ك${QC.nomW(r.c)?' · الاسمي '+QC.nomW(r.c)+' ك':''}${QC.wFlag(r)?' — ⚠ مختلف':''}</b></div><img src="${u}"></div>`)).join('');
 const nph=a.rows.reduce((t,r)=>t+(r.rots||[]).reduce((q,x)=>q+(x.ph||[]).length,0)+(r.phD||[]).length+(r.ph||[]).length,0);
 return `<div class="qcr"><div class="cd">${e(rep.code)}</div><div class="hd"><div><b>شركة العلا لفرز الحاصلات الزراعية</b><small>Al Ola Agricultural Crops Sorting — إدارة الجودة</small></div><img src="${base}alola_logo.png"></div>
<h2>تقرير فحص الجودة</h2>
<div class="inf"><div><i>المُصدّر</i>${e(rep.exp||'—')}</div><div><i>التاريخ / الوردية</i>${e(rep.date)} ${e(rep.shift||'')}</div><div><i>وقت الإصدار</i>${QC.hm(iss)}</div><div><i>مهندس الجودة</i>${e(rep.insp||'—')}</div><div><i>رقم الفحص</i><span style="direction:ltr;display:inline-block;font-size:9px">${e(rep.code||'—')}</span></div><div class="nx"><i>الفحص القادم (كل ${QC.EVERY} دقيقة)</i>${QC.hm(nx)}</div></div>
<div class="rb"><div class="vd">${verdict}</div><div>كراتين مفحوصة<b>${a.tot}</b><i>${a.fr} حبة · ${a.done} مكتملة${a.inc?' · '+a.inc+' ناقصة':''}</i></div><div>مطابق<b>${a.okp}%</b><i>${a.ok} كرتونة</i></div><div>مرفوض أعفان<b>${a.rejp}%</b><i>${a.rej} · عفن &gt; ${QC.ROTMAX}%</i></div><div>مخالف تشوهات<b>${a.ncp}%</b><i>${a.nc} · فوق حد الدرجة</i></div></div>
<h4>تفاصيل الكراتين المفحوصة</h4><table><tr><th>#</th><th>الصنف / المقاس</th><th>التعبئة / الكرتون</th><th>الدرجة</th><th>الباليت</th><th>حبات</th><th>الوزن ك</th><th>عفن</th><th>مسبب العفن</th><th>تشوه</th><th>نوع التشوه</th><th>القرار</th></tr>
${a.rows.map(r=>`<tr><td>${r.i}<small>${e(r.time)}</small></td><td class="l">${e(r.v)}<small>مقاس ${e(r.s)}</small></td><td class="l">${e(r.c)}<small>${e([r.pk==='صندوق بلاستيك'?'صندوق بلاستيك':'',r.b].filter(Boolean).join(' · '))}</small></td><td>${e(QC.normGrade(r.g))}</td><td>${e(r.p)}<small>${e([r.gr,r.ln].filter(Boolean).join(' · '))}</small></td><td>${N(r.n)||''}</td><td>${N(r.w)||''}${QC.wFlag(r)?`<div class="wf">⚠ ${e(QC.wFlag(r))}</div>`:''}${(r.phW||[]).length?`<img class="wph" src="${r.phW[0]}">`:''}</td><td>${QC.rotN(r)}<small>${r.R.rp===''?'':r.R.rp+'%'}</small></td><td class="l">${e(QC.rotTxt(r))}</td><td>${N(r.dn)}<small>${r.R.pct===''?'':r.R.pct+'%'}${r.R.tol!==''?' / حد '+r.R.tol+'%':''}</small></td><td class="l">${e(r.dt||'')}</td><td class="st-${r.R.st}">${e(r.R.txt)}</td></tr>`).join('')}
<tr class="t"><td colspan="5" class="l">الإجمالي</td><td>${a.fr}</td><td>${a.avgW?'م '+a.avgW:''}</td><td>${a.rf}<small>${a.rp}%</small></td><td></td><td>${a.df}<small>${a.dp}%</small></td><td></td><td>${a.ok} مطابق</td></tr></table>
<div class="ex">م = متوسط وزن الكرتونة. ⚠ = الوزن مختلف عن الاسمي بأكتر من ${QC.WTOL}%. ${a.rows.filter(r=>r.note).map(r=>'ك'+r.i+': '+e(r.note)).join(' · ')}</div>
<div class="two"><div><h4>مسببات الأعفان (${a.rf} حبة = ${a.rp}%)</h4>${bt(a.rotS,'المسبب')}<div class="ex">القاعدة: عفن الكرتونة ≤ ${QC.ROTMAX}% من حباتها مقبول، أكتر = مرفوضة.</div></div>
<div><h4>التشوهات (${a.df} حبة = ${a.dp}%)</h4>${bt(a.defS,'العيب')}<div class="ex">الحد المسموح: أولى ${QC.tol(rep,'أولى')}% · وسط ${QC.tol(rep,'وسط')}% · ثانية ${QC.tol(rep,'ثانية')}%.</div></div></div>
${Object.keys(a.byGr).length>1||Object.keys(a.byV).length>1?`<div class="two"><div>${grp(a.byGr,'الدرجة')}</div><div>${grp(a.byV,'الصنف')}</div></div>`:''}
${sws?`<h4>صور الميزان — للتأكد من رقم الوزن</h4><div class="sw">${sws}</div>`:''}
${pcs?`<h4>صور المسببات والتشوهات (${nph} صورة)</h4><div class="pg">${pcs}</div>`:''}
${rep.notes?`<div class="ex" style="color:#444;font-size:9.5px">ملاحظات المهندس: ${e(rep.notes)}</div>`:''}
<div class="end"><div class="sg"><div>مهندس الجودة: ${e(rep.insp||'..............')}</div><div>التوقيع: ..............</div><div>مدير الجودة: ..............</div></div>
<div class="ft"><img src="${base}rashed_logo_gray.png"><span>يعتمد: شركة الراشد للتجارة</span></div></div></div>`};
G.QC=QC})(typeof window!=='undefined'?window:globalThis);
