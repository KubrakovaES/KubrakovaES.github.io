(function(){
const G=10,A=2,L=54,TOL=0.05;
const cv=document.getElementById('cv'),c=cv.getContext('2d');
const $=id=>document.getElementById(id);
const ang=$('ang'),spd=$('spd'),tm=$('tm'),play=$('play'),st=$('st'),ro=$('ro');
let m,t=0,run=false,last=0;
function f(x){return x.toFixed(2).replace('.',',')}
function setup(){
 const a=+ang.value*Math.PI/180,v=+spd.value,vx=v*Math.cos(a),vy=v*Math.sin(a);
 const fly=2*vy/G,tc=L/vx,dh=vy*tc-(G+A)*tc*tc/2,reach=tc<=fly,hit=reach&&Math.abs(dh)<=TOL;
 const end=hit?tc:fly;
 const pk=Math.min(vy/G,end);
 const ymax=Math.max(10,vy*pk-G*pk*pk/2,A*end*end/2)*1.12,xmax=Math.max(65,vx*end*1.08);
 m={vx,vy,tc,dh,reach,hit,end,ymax,xmax};
 $('angV').textContent=ang.value;$('spdV').textContent=spd.value;
 t=0;draw();
}
function ticks(max){const s=[1,2,5,10,20,50,100,200];for(const k of s)if(max/k<=8)return k;return 500}
function draw(){
 const W=cv.width,H=cv.height,p={l:52,r:18,t:18,b:40},w=W-p.l-p.r,h=H-p.t-p.b;
 const X=x=>p.l+x/m.xmax*w,Y=y=>p.t+h-y/m.ymax*h;
 c.clearRect(0,0,W,H);c.font='13px Manrope,sans-serif';c.lineWidth=1;
 let k=ticks(m.xmax);c.fillStyle='#5b7680';
 for(let x=0;x<=m.xmax;x+=k){c.strokeStyle='#e3eef1';c.beginPath();c.moveTo(X(x),p.t);c.lineTo(X(x),p.t+h);c.stroke();c.fillText(x,X(x)-6,H-p.b+18)}
 k=ticks(m.ymax);for(let y=0;y<=m.ymax;y+=k){c.strokeStyle='#e3eef1';c.beginPath();c.moveTo(p.l,Y(y));c.lineTo(p.l+w,Y(y));c.stroke();c.fillText(y,p.l-30,Y(y)+4)}
 c.fillText('x, м',W-48,H-6);c.fillText('y, м',6,14);
 c.strokeStyle='#0f2a33';c.lineWidth=2;c.beginPath();c.moveTo(p.l,Y(0));c.lineTo(p.l+w,Y(0));c.stroke();
 c.setLineDash([4,5]);c.strokeStyle='#0fa3a3';c.lineWidth=1.5;c.beginPath();c.moveTo(X(L),Y(0));c.lineTo(X(L),p.t);c.stroke();
 // full path faint
 c.strokeStyle='rgba(31,95,191,.25)';c.beginPath();for(let i=0;i<=120;i++){const s=m.end*i/120;const y=m.vy*s-G*s*s/2;i?c.lineTo(X(m.vx*s),Y(y)):c.moveTo(X(0),Y(0))}c.stroke();c.setLineDash([]);
 c.strokeStyle='#1f5fbf';c.lineWidth=3;c.beginPath();for(let i=0;i<=120;i++){const s=t*i/120;const y=m.vy*s-G*s*s/2;i?c.lineTo(X(m.vx*s),Y(y)):c.moveTo(X(0),Y(0))}c.stroke();
 const px=m.vx*t,py=Math.max(0,m.vy*t-G*t*t/2),lh=A*t*t/2,done=t>=m.end-1e-9;
 // lantern
 const lx=X(L),ly=Y(lh);
 if(done&&m.hit){c.strokeStyle='#e7851c';c.lineWidth=3;for(let i=0;i<12;i++){const q=i*Math.PI/6;c.beginPath();c.moveTo(lx+12*Math.cos(q),ly+12*Math.sin(q));c.lineTo(lx+26*Math.cos(q),ly+26*Math.sin(q));c.stroke()}c.fillStyle='#e7851c';c.beginPath();c.arc(lx,ly,8,0,7);c.fill()}
 else{c.fillStyle='#0fa3a3';c.strokeStyle='#0b7f84';c.lineWidth=2;c.beginPath();c.roundRect?c.roundRect(lx-10,ly-14,20,24,6):c.rect(lx-10,ly-14,20,24);c.fill();c.stroke();c.fillStyle='#fff6c8';c.beginPath();c.arc(lx,ly-2,5,0,7);c.fill();
  c.fillStyle='#1f5fbf';c.beginPath();c.arc(X(px),Y(py),7,0,7);c.fill()}
 tm.value=Math.round(t/m.end*1000);$('tV').textContent=f(t);
 ro.innerHTML='Снаряд: x = '+f(px)+' м, y = '+f(py)+' м<br>Фонарик: h = '+f(lh)+' м';
 if(!done){st.className='status';st.textContent=run?'Полёт…':'Нажмите «Пуск».'}
 else if(m.hit){st.className='status hit';st.textContent='Попадание! t = '+f(m.tc)+' с, высота '+f(A*m.tc*m.tc/2)+' м.'}
 else if(!m.reach){st.className='status miss';st.textContent='Промах: снаряд упал, не долетев до фонарика.'}
 else{st.className='status miss';st.textContent='Промах: на вертикали фонарика снаряд '+(m.dh>0?'выше':'ниже')+' на '+f(Math.abs(m.dh))+' м.'}
}
function loop(ts){if(!run)return;const dt=Math.min(.05,(ts-last)/1000);last=ts;t=Math.min(m.end,t+dt);draw();if(t>=m.end){run=false;play.textContent='▶ Пуск';if(window.ymGoal&&m.hit)ymGoal('fonarik_hit');return}requestAnimationFrame(loop)}
function start(){if(t>=m.end)t=0;run=true;play.textContent='❚❚ Пауза';last=performance.now();requestAnimationFrame(loop)}
play.onclick=()=>{if(run){run=false;play.textContent='▶ Пуск';draw()}else start()};
$('reset').onclick=()=>{run=false;play.textContent='▶ Пуск';t=0;draw()};
[ang,spd].forEach(e=>e.oninput=()=>{run=false;play.textContent='▶ Пуск';setup()});
tm.oninput=()=>{run=false;play.textContent='▶ Пуск';t=tm.value/1000*m.end;draw()};
document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{ang.value=b.dataset.a;spd.value=b.dataset.v;setup();start()});
setup();
})();
