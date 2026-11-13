(()=>{'use strict';
const KEY='cuaderno.lakeflow.progress.v1';let done=[];
try{const parsed=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(parsed))done=[...new Set(parsed.filter(n=>Number.isInteger(n)&&n>=1&&n<=17))];}catch{}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(done));}catch{const notice=document.createElement('p');notice.setAttribute('role','status');notice.textContent='El navegador no permite guardar el progreso. Se conservará solo mientras esta página esté abierta.';document.querySelector('.complete-box,.course-aside')?.append(notice);}}
const lesson=Number(document.querySelector('[data-lesson]')?.dataset.lesson);
function render(){
  const next=Array.from({length:17},(_,i)=>i+1).find(n=>!done.includes(n));
  document.querySelectorAll('[data-status]').forEach(e=>{const complete=done.includes(Number(e.dataset.status));e.textContent=complete?'✓':'';e.classList.toggle('is-done',complete);e.setAttribute('aria-label',complete?'Completada':'Sin completar');});
  // Recorrido de 17 casillas (portada y /cursos/)
  document.querySelectorAll('[data-step]').forEach(e=>{const n=Number(e.dataset.step);e.classList.toggle('is-done',done.includes(n));e.classList.toggle('is-next',n===next);});
  const p=document.querySelector('#course-progress');if(p)p.value=done.length;
  const label=document.querySelector('#progress-label');if(label&&(done.length||p))label.textContent=`${done.length} de 17 lecciones completadas`;
  const b=document.querySelector('#mark-complete');if(b){b.textContent=done.includes(lesson)?'Completada ✓':'Marcar como completada';b.setAttribute('aria-pressed',String(done.includes(lesson)));}
  const resume=document.querySelector('#resume');if(resume){resume.href=`/cursos/lakeflow/leccion-${done.length&&next?next:1}/`;resume.textContent=!done.length?'Empezar el curso':next?`Continuar por la lección ${next}`:'Repasar el curso';}
}
document.querySelector('#mark-complete')?.addEventListener('click',()=>{done=done.includes(lesson)?done.filter(n=>n!==lesson):[...done,lesson];persist();render();});
document.querySelector('#reset-progress')?.addEventListener('click',()=>{if(confirm('¿Quieres borrar el progreso de este curso en este navegador?')){done=[];persist();render();}});
const normalize=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
document.querySelector('#lesson-search')?.addEventListener('input',e=>{const q=normalize(e.target.value.trim());let count=0;document.querySelectorAll('[data-search]').forEach(row=>{row.hidden=!normalize(row.dataset.search).includes(q);if(!row.hidden)count++;});document.querySelectorAll('.module').forEach(m=>m.hidden=![...m.querySelectorAll('li')].some(l=>!l.hidden));document.querySelector('#no-results').hidden=count>0;});
document.querySelectorAll('.prose pre').forEach(pre=>{const btn=document.createElement('button');btn.className='copy-code';btn.textContent='Copiar';btn.setAttribute('aria-label','Copiar código');btn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pre.querySelector('code')?.textContent||'');btn.textContent='Copiado ✓';}catch{btn.textContent='Selecciona el código';const range=document.createRange();range.selectNodeContents(pre.querySelector('code'));const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);}setTimeout(()=>btn.textContent='Copiar',2000);});pre.append(btn);});
render();

// Pipeline de la portada: cada evento recorre Bronze, Silver y Gold.
// Sin JavaScript o con movimiento reducido quedan los valores estáticos del HTML.
const pipe=document.querySelector('[data-pipeline]');
if(pipe&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const $=s=>pipe.querySelector(s);
  const feed=$('[data-feed]'),elBronze=$('[data-bronze]'),elSilver=$('[data-silver]'),elDropped=$('[data-dropped]'),elAvg=$('[data-avg]'),elRule=$('[data-rule]');
  let id=4821,bronze=1284,silver=1251,dropped=33,sum=silver*23.4;
  const int=n=>n.toLocaleString('es-ES');
  const money=n=>n.toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
  const pulse=el=>{const s=el.closest('.stage');s.classList.remove('pulse');void s.offsetWidth;s.classList.add('pulse');};
  setInterval(()=>{
    if(document.hidden)return;
    const valid=Math.random()>.12;
    const amount=valid?Math.round((4+Math.random()*52)*100)/100:-Math.round((1+Math.random()*9)*100)/100;
    const li=document.createElement('li');li.className='in';li.textContent=`{"ticket":"T-${++id}","amount":${amount.toFixed(2)}}`;
    feed.prepend(li);feed.lastElementChild.remove();
    setTimeout(()=>{elBronze.textContent=int(++bronze);pulse(elBronze);},450);
    setTimeout(()=>{
      if(valid){elSilver.textContent=int(++silver);pulse(elSilver);}
      else{elDropped.textContent=int(++dropped);elRule.classList.add('flash');setTimeout(()=>elRule.classList.remove('flash'),700);}
    },900);
    if(valid)setTimeout(()=>{sum+=amount;elAvg.textContent=money(sum/silver);pulse(elAvg);},1350);
  },1700);
}
})();
