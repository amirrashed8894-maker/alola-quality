/* مقاسات الموالح — العلا · جدول مشترك لبرامج الاستلام والإنتاج والجودة · v2 (18/11/2026)
   الجدول: Oranges and Lemons size in Egypt (العدد في كرتونة 15 ك ← القطر بالمم).
   أي قطر لمقاس مش في الجدول أو لعبوة مش 14/15 ك/جامبو بيتحسب «تقريبي»:
   العدد المكافئ لـ 15 ك = العدد × 15 ÷ وزن العبوة ← أقرب صف في الجدول. وزن الحبة التقريبي = وزن العبوة ÷ العدد. */
(function(G){'use strict';
const TABLE=[[36,92,95],[40,88,92],[48,84,88],[56,81,84],[64,77,81],[72,73,77],[80,69,73],[88,65,69],[100,61,65],[113,57,61],[125,53,57],[138,49,53],[150,45,49],[162,41,45],[189,37,41],[216,33,37]];
const OR15=[36,48,56,64,72,80,88,100,113,125],LEM=[72,88,100,113,125,138,150,162,216];
const GROUPS={orange:{name:'برتقال',vars:['أبو سرة','صيفي','بلدي']},lemon:{name:'ليمون',vars:['ليمون']},mand:{name:'أفندي',vars:['كلمنتينا','فريمونت','موركيت كيني','موركيت إسباني']}};
const VARIETIES=[].concat(GROUPS.orange.vars,GROUPS.lemon.vars,GROUPS.mand.vars);
const PACKS=[
 {id:'open7',g:'orange',label:'كرتون أوبن توب 7 ك',carton:'أوبن توب 7 ك',pk:'كرتون',kg:7,sizes:[20,24,28,32]},
 {id:'closed7',g:'orange',label:'كرتون مقفول 7 ك',carton:'مقفول صغير 7 ك',pk:'كرتون',kg:7,sizes:[36,42,48]},
 {id:'c14',g:'orange',label:'كرتون مقفول 14 ك',carton:'مقفول 14 ك',pk:'كرتون',kg:14,sizes:OR15},
 {id:'c15',g:'orange',label:'كرتون مقفول 15 ك',carton:'مقفول 15 ك',pk:'كرتون',kg:15,sizes:OR15},
 {id:'jumbo',g:'orange',label:'جامبو بلاستيك 15 ك',carton:'جامبو بلاستيك 15 ك',pk:'صندوق بلاستيك',kg:0,sizes:OR15},
 {id:'l14',g:'lemon',label:'كرتون 14 ك',carton:'مقفول 14 ك',pk:'كرتون',kg:14,sizes:LEM},
 {id:'l15',g:'lemon',label:'كرتون 15 ك',carton:'مقفول 15 ك',pk:'كرتون',kg:15,sizes:LEM},
 {id:'m2',g:'mand',label:'صندوق بلاستيك 2 ك',carton:'صندوق 2 ك',pk:'صندوق بلاستيك',kg:2,free:true},
 {id:'m5',g:'mand',label:'صندوق بلاستيك 5 ك',carton:'صندوق 5 ك',pk:'صندوق بلاستيك',kg:5,free:true},
 {id:'m7',g:'mand',label:'صندوق بلاستيك 7 ك',carton:'صندوق 7 ك',pk:'صندوق بلاستيك',kg:7,free:true},
 {id:'m10',g:'mand',label:'صندوق بلاستيك 10 ك',carton:'صندوق 10 ك',pk:'صندوق بلاستيك',kg:10,free:true}];
const PK=Object.fromEntries(PACKS.map(p=>[p.id,p]));
const num=v=>{const x=parseFloat(String(v??'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)));return isFinite(x)?x:0};
function groupOf(v){const s=String(v||'').toLowerCase();if(!s)return '';
 if(/ليمون|lemon|لمون/.test(s))return 'lemon';
 if(/موركيت|موركوت|مركوت|كلمنت|كليمنت|فريمونت|فرمونت|أفندي|افندي|يوسف|mur|clem|frem|mand/.test(s))return 'mand';
 if(/سرة|سره|navel|صيفي|فالنسيا|valencia|بلدي|baladi|برتقال|orange/.test(s))return 'orange';return ''}
const packsFor=g=>PACKS.filter(p=>p.g===g);
const kgOfText=t=>{const m=String(t||'').match(/(\d+(?:\.\d+)?)\s*(?:ك|kg|كجم|كيلو)/i)||String(t||'').match(/(\d+(?:\.\d+)?)/);return m?+m[1]:0};
/* يحوّل نوع الكرتون/الصندوق المكتوب في البرامج (زي «مقفول صغير 7 ك») لعبوة من الجدول حسب الصنف */
function packOf(g,carton,pk){const c=String(carton||'');if(!g)return null;if(PK[c]&&PK[c].g===g)return PK[c];const k=kgOfText(c);
 if(g==='orange'){if(/جامبو|jumbo/i.test(c))return PK.jumbo;if(/أوبن|اوبن|open/i.test(c)&&k===7)return PK.open7;if(k===7)return PK.closed7;if(k===14)return PK.c14;if(k===15)return PK.c15;return null}
 if(g==='lemon'){if(k===14)return PK.l14;if(k===15)return PK.l15;return null}
 if(g==='mand'){return PACKS.find(p=>p.g==='mand'&&p.kg===k)||null}return null}
/* المقاسات المسموحة: [] = لسه ما اتحددش الصنف/العبوة · null = إدخال حر (الأفندي: المهندس يكتب العدد) */
function sizesFor(g,pack){if(!g)return [];if(g==='mand')return null;if(!pack)return [];return pack.sizes.map(String)}
/* تصدير: مقاسات العبوة فقط («أكبر من/أصغر من» خارج). البرتقال: 125 في 14/15 ك والجامبو خارج التصدير (بيقف عند 113). الليمون: كل مقاسات العبوة. */
function isExport(g,pack,count){const k=String(count||'');if(!g||!pack||!pack.sizes)return false;if(!pack.sizes.map(String).includes(k))return false;if(g==='orange'&&num(k)>113)return false;return true}
function nearest(eq){let b=TABLE[0];TABLE.forEach(r=>{if(Math.abs(r[0]-eq)<Math.abs(b[0]-eq))b=r});return b}
/* info: القطر (من الجدول أو تقريبي) + وزن الحبة التقريبي.  wKg = وزن العبوة الفعلي لو متسجل (اختياري) */
function info(g,pack,count,wKg){const n=num(count);if(!(n>0)||!g)return null;const kg=pack&&pack.kg||0;const net=num(wKg)>0?num(wKg):kg;
 const o={count:n,dia:'',approx:false,gw:net?Math.round(net*1000/n):0,eq:0,out:''};
 const direct=g!=='mand'&&(!kg||kg>=14)&&TABLE.find(r=>r[0]===n);
 if(direct){o.dia=direct[1]+'–'+direct[2];return o}
 const base=kg||num(wKg)||(g!=='mand'?15:0);if(!base)return o.gw?o:null;
 o.eq=Math.round(n*15/base);o.approx=true;
 if(o.eq>TABLE[TABLE.length-1][0]*1.08){o.dia='أقل من '+TABLE[TABLE.length-1][1];o.out='small'}
 else if(o.eq<TABLE[0][0]*0.92){o.dia='أكبر من '+TABLE[0][2];o.out='big'}
 else{const r=nearest(o.eq);o.dia=r[1]+'–'+r[2]}return o}
/* للأفندي في الاستلام (شرائح وزن): القطر التقريبي من وزن الحبة = العدد المكافئ لـ 15 ك = 15000 ÷ وزن الحبة */
function infoByWeight(g){g=num(g);if(!(g>0))return null;const eq=15000/g;let dia;if(eq>TABLE[TABLE.length-1][0]*1.08)dia='أقل من '+TABLE[TABLE.length-1][1];else if(eq<TABLE[0][0]*0.92)dia='أكبر من '+TABLE[0][2];else{const r=nearest(eq);dia=r[1]+'–'+r[2]}return{dia,approx:true,gw:Math.round(g),eq:Math.round(eq)}}
function text(o,opt){if(!o)return '';opt=opt||{};const a=[];if(o.dia)a.push((o.approx?'قطر ≈ ':'قطر ')+o.dia+' مم');if(o.gw&&!opt.noW)a.push('≈ '+o.gw+' جم/حبة');let s=a.join(' · ');if(s&&o.approx&&!opt.short)s+=' (تقريبي)';return s}
/* صيغة مختصرة للجداول الضيقة (PDF): «≈69–73 مم · 350 جم» */
function compact(o){if(!o)return '';const a=[];if(o.dia)a.push((o.approx?'≈':'')+o.dia+' مم');if(o.gw)a.push(o.gw+' جم');return a.join(' · ')}
/* شريحة وزن (أفندي في الاستلام): مدى القطر التقريبي + عدد الحبات التقريبي في الصندوق لو وزنه معروف */
function band(lo,hi,crateKg){lo=num(lo);hi=num(hi);const inf=!(hi>0)||hi>=1e8;const rowW=w=>nearest(15000/w);let dia='';
 if(lo>0&&!inf){const a=rowW(lo),b=rowW(hi);dia=Math.min(a[1],b[1])+'–'+Math.max(a[2],b[2])}else if(!inf){dia='أقل من '+rowW(hi)[2]}else if(lo>0){dia='أكبر من '+rowW(lo)[1]}
 const o={dia,approx:true,gw:0,cnt:''};const k=num(crateKg);if(k>0){const c1=!inf?Math.round(k*1000/hi):0,c2=lo>0?Math.round(k*1000/lo):0;o.cnt=c1&&c2?c1+'–'+c2:c1?'أكثر من '+c1:c2?'أقل من '+c2:''}return o}
function bandText(o,crateKg){if(!o)return '';let s=o.dia?'قطر ≈ '+o.dia+' مم':'';if(o.cnt)s+=(s?' · ':'')+'≈ '+o.cnt+' حبة/صندوق '+num(crateKg)+' ك';return s}
const NOTE='القطر من جدول مقاسات البرتقال والليمون في مصر (عدد الحبات في كرتونة 15 ك). «تقريبي» = عبوة غير 14/15 ك أو أفندي: العدد × 15 ÷ وزن العبوة ← أقرب صف. وزن الحبة = وزن العبوة ÷ العدد.';
G.ALS={VER:2,compact,band,bandText,TABLE,GROUPS,VARIETIES,PACKS,PK,groupOf,packsFor,packOf,sizesFor,isExport,info,infoByWeight,text,nearest,kgOfText,NOTE};
})(typeof window!=='undefined'?window:globalThis);
