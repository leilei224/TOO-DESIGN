(() => {
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const data=window.PORTFOLIO;if(!data?.projects)return;
  const projects=new Map(data.projects.map(p=>[p.id,p]));
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const worlds=[
    {id:'mc',name:'美陈活动',title:'Spaces that spark joy.',text:'用一点想象，打破日常。<br>让商业场景，成为值得停留的地方。',picks:['mc-0004','mc-0096','mc-0008']},
    {id:'jq',name:'街区空间',title:'Places to get lost in.',text:'在街角发现新鲜，在空间里遇见生活。<br>把场所，变成有性格的目的地。',picks:['jq-0225','jq-0172','jq-0218']},
    {id:'ks',name:'品牌快闪',title:'Experiences that stay.',text:'用短暂的相遇，留下鲜明的记忆。<br>让品牌与人，产生真实的连接。',picks:['ks-0246','ks-0229','ks-0306']},
    {id:'ip',name:'IP 设计',title:'Characters to fall for.',text:'从一个角色，走进一个世界。<br>给想象以性格，也给陪伴以形状。',picks:['ip-0489','ip-0482','ip-0399']}
  ];
  // User-selected projects lead each category; all other projects remain reachable.
  worlds.forEach(w=>{if(data.featured?.categories?.[w.id]?.length)w.picks=data.featured.categories[w.id]});
  const catName=id=>worlds.find(c=>c.id===id)?.name||'TOO-DESIGN';
  const pad=n=>String(n).padStart(2,'0');
  worlds.forEach(w=>{w.projectIds=[...new Set([...w.picks,...data.projects.filter(p=>p.category===w.id).map(p=>p.id)])].filter(id=>projects.get(id)?.category===w.id)});
  function picture(id,i){const p=projects.get(id);if(!p)return '';return `<button class="world-picture" data-art="${p.id}" aria-label="查看${esc(p.title)}"><span class="picture-window"><img src="${esc(p.cover)}" alt="${esc(p.title)}" width="${p.width}" height="${p.height}" loading="lazy" decoding="async"></span><span class="picture-caption"><span>${esc(p.title)}</span><span>${pad(i+1)} ↗</span></span><span class="view-cursor" aria-hidden="true">查看 ↗</span></button>`;}
  $('#worlds').innerHTML=worlds.map((w,i)=>`<section class="world-row" id="category-${w.id}" aria-labelledby="world-title-${w.id}"><div class="world-inner"><h3 class="world-title" id="world-title-${w.id}"><button class="world-trigger" data-world="${i}" aria-expanded="${i===0}" aria-controls="world-projects-${w.id}"><span class="world-no">[ 0${i+1} ]</span><span class="world-name">${w.title}</span><span class="world-arrow" aria-hidden="true">↗</span></button></h3><p class="world-description"><span>${w.name}</span><br>${w.text}</p><div class="world-projects" id="world-projects-${w.id}"><div class="world-pictures" id="world-pictures-${w.id}" role="group" aria-label="${w.name}项目，可横向浏览">${w.projectIds.map(picture).join('')}</div><div class="world-controls"><button class="all-projects" data-directory="${w.id}">全部 ${w.projectIds.length} 个项目 <span aria-hidden="true">↗</span></button><div class="world-pagination"><span class="world-range" aria-live="polite"></span><button data-page="-1" aria-label="${w.name}上一组项目">←</button><button data-page="1" aria-label="${w.name}下一组项目"><span>下一组 </span>→</button></div></div></div></div></section>`).join('');
  $('#stage-nav').innerHTML=worlds.map((w,i)=>`<button data-world="${i}" aria-current="${i===0}">${w.name}</button>`).join('');

  function updateProjectRange(row){
    const strip=row.querySelector('.world-pictures'),cards=[...strip.children],bounds=strip.getBoundingClientRect();
    const visibleCards=cards.map((card,i)=>({i,rect:card.getBoundingClientRect()})).filter(({rect})=>rect.right>bounds.left+8&&rect.left<bounds.right-8);
    if(!visibleCards.length)return;
    row.querySelector('.world-range').textContent=`${pad(visibleCards[0].i+1)}–${pad(visibleCards.at(-1).i+1)} / ${pad(cards.length)}`;
    row.querySelector('[data-page="-1"]').disabled=strip.scrollLeft<4;
    row.querySelector('[data-page="1"]').disabled=strip.scrollLeft>=strip.scrollWidth-strip.clientWidth-4;
  }
  $$('.world-row').forEach(row=>{
    const strip=row.querySelector('.world-pictures');
    strip.addEventListener('scroll',()=>updateProjectRange(row),{passive:true});
    new ResizeObserver(()=>updateProjectRange(row)).observe(strip);
    row.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>{
      const card=strip.firstElementChild,step=card.offsetWidth+parseFloat(getComputedStyle(strip).gap),count=Math.max(1,Math.floor((strip.clientWidth+parseFloat(getComputedStyle(strip).gap))/step));
      strip.scrollBy({left:Number(b.dataset.page)*step*count,behavior:reduced.matches?'instant':'smooth'});
    }));
  });

  const hero=$('#home'),heroStage=$('#type-stage'),heroDeck=$('#type-deck');
  const heroIds=(data.featured?.hero||[]).filter(id=>projects.has(id));
  const panini={id:'panini',title:'PANINI',category:'ip',cover:'assets/2026/panini-main.webp',width:664,height:850,images:[{src:'assets/2026/panini-main.webp',alt:'PANINI',width:664,height:850}]};
  function getProject(id){return id==='panini'?panini:projects.get(id)}
  let heroIndex=0,heroPaused=reduced.matches,heroVisible=true,heroTimer=0,heroHover=false;
  heroDeck.innerHTML=heroIds.map((id,i)=>{const p=projects.get(id);return `<button class="type-case${i===0?' is-current':''}" data-art="${p.id}" aria-label="查看${esc(p.title)}" ${i?'inert aria-hidden="true"':''}><span class="type-case-image"><img src="${esc(p.heroCover||p.cover)}" alt="${esc(p.title)}" width="${p.heroWidth||p.width}" height="${p.heroHeight||p.height}" ${i?'loading="lazy"':'fetchpriority="high"'} decoding="async" draggable="false"></span><span class="type-case-caption"><span><small>${catName(p.category)}</small><strong>${esc(p.title)}</strong></span><span class="type-open" aria-hidden="true">↗</span></span></button>`}).join('');
  $('#type-pages').innerHTML=heroIds.map((id,i)=>`<button data-hero-page="${i}" aria-label="展示${esc(projects.get(id).title)}" aria-pressed="${i===0}">${pad(i+1)}</button>`).join('');
  const heroCases=$$('.type-case'),heroPages=$$('[data-hero-page]');
  function paintHeroPause(){const b=$('#type-pause');b.setAttribute('aria-pressed',String(heroPaused));b.setAttribute('aria-label',heroPaused?'继续案例轮播':'暂停案例轮播');b.textContent=heroPaused?'▷':'Ⅱ'}
  function resetHeroTimer(){clearTimeout(heroTimer);const focusHeld=hero.contains(document.activeElement)&&document.activeElement!==$('#type-pause');if(!heroPaused&&heroVisible&&!document.hidden&&!heroHover&&!focusHeld&&heroIds.length>1)heroTimer=setTimeout(()=>showHero(heroIndex+1,false),5500)}
  function showHero(index,announce=true){
    heroIndex=(index+heroIds.length)%heroIds.length;
    heroCases.forEach((c,i)=>{const active=i===heroIndex;c.classList.toggle('is-current',active);c.inert=!active;c.setAttribute('aria-hidden',String(!active));if(active)c.querySelector('img').loading='eager'});
    heroPages.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===heroIndex)));
    $('#type-count').textContent=`${pad(heroIndex+1)} / ${pad(heroIds.length)}`;
    if(announce)$('#type-announcement').textContent=`${projects.get(heroIds[heroIndex]).title}，第 ${heroIndex+1} 个，共 ${heroIds.length} 个精选案例`;
    resetHeroTimer();
  }
  heroPages.forEach(b=>b.addEventListener('click',()=>showHero(Number(b.dataset.heroPage))));
  $('#type-prev').addEventListener('click',()=>showHero(heroIndex-1));
  $('#type-next').addEventListener('click',()=>showHero(heroIndex+1));
  $('#type-pause').addEventListener('click',()=>{heroPaused=!heroPaused;paintHeroPause();resetHeroTimer()});
  heroDeck.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();showHero(heroIndex+(e.key==='ArrowRight'?1:-1));heroCases[heroIndex].focus({preventScroll:true})});
  heroDeck.addEventListener('pointerenter',()=>{heroHover=true;resetHeroTimer()});
  heroDeck.addEventListener('pointerleave',()=>{heroHover=false;resetHeroTimer()});
  hero.addEventListener('focusin',resetHeroTimer);hero.addEventListener('focusout',()=>queueMicrotask(resetHeroTimer));
  new IntersectionObserver(([entry])=>{heroVisible=entry.isIntersecting;resetHeroTimer()}).observe(hero);
  document.addEventListener('visibilitychange',resetHeroTimer);
  function resetHeroPointer(){heroStage.style.setProperty('--pointer-x','0');heroStage.style.setProperty('--pointer-y','0')}
  heroStage.addEventListener('pointermove',e=>{if(!fine.matches||reduced.matches)return;const r=heroStage.getBoundingClientRect();heroStage.style.setProperty('--pointer-x',String(clamp((e.clientX-r.left)/r.width)*2-1));heroStage.style.setProperty('--pointer-y',String(clamp((e.clientY-r.top)/r.height)*2-1))});
  heroStage.addEventListener('pointerleave',resetHeroPointer);


  const scrollStage=$('#world-scroll'),sticky=$('#world-sticky'),rows=$$('.world-row'),nav=$('#site-nav'),intro=$('#intro-title');
  const words=intro.textContent.trim().split(/\s+/);intro.innerHTML=words.map(w=>`<span class="word">${esc(w)}</span>`).join(' ');
  const wordEls=$$('.reveal-text .word');let expanded=470,collapsed=48,scrollFrame=0,currentWorld=-1;
  function measureStage(){const mobile=innerWidth<=600;collapsed=mobile?38:44;expanded=Math.max(300,Math.min(sticky.clientHeight-112-collapsed*3,mobile?410:510));const pictureH=Math.max(92,Math.min(mobile?185:240,expanded-216));sticky.style.setProperty('--expanded',`${expanded}px`);sticky.style.setProperty('--collapsed',`${collapsed}px`);sticky.style.setProperty('--picture-h',`${pictureH}px`);paintScroll();rows.forEach(updateProjectRange)}
  function paintScroll(){
    scrollFrame=0;const nh=nav.offsetHeight,rect=scrollStage.getBoundingClientRect(),travel=Math.max(1,scrollStage.offsetHeight-sticky.offsetHeight),progress=clamp((nh-rect.top)/travel),phase=progress*3.65,base=Math.min(3,Math.floor(phase)),blend=base===3?0:smooth((phase-base-.35)/.6);
    const weights=rows.map((_,i)=>reduced.matches?1:i===base?1-blend:i===base+1?blend:0);
    const active=base<3&&blend>.5?base+1:base;
    rows.forEach((row,i)=>{const w=weights[i],content=smooth((w-.08)/.82);row.style.height=`${collapsed+(expanded-collapsed)*w}px`;row.style.opacity=String(.12+.88*w);row.style.setProperty('--content-opacity',content.toFixed(4));const contentGroup=row.querySelector('.world-projects');contentGroup.inert=w<.5;contentGroup.setAttribute('aria-hidden',String(w<.5));row.querySelector('.world-trigger').setAttribute('aria-expanded',String(w>=.5))});
    sticky.style.setProperty('--stage-progress',progress.toFixed(4));
    if(active!==currentWorld){currentWorld=active;$('#stage-count').textContent=`0${active+1} / 04`;$$('#stage-nav button').forEach((b,i)=>b.setAttribute('aria-current',String(i===active)))}
    const dark=$('#work').getBoundingClientRect().top<nh*.7;nav.classList.toggle('is-dark',dark);nav.classList.toggle('on-type-home',$('#home').getBoundingClientRect().bottom>nh);
    const introRect=intro.getBoundingClientRect(),read=clamp((innerHeight*.9-introRect.top)/(introRect.height+innerHeight*.23));wordEls.forEach((w,i)=>{const amount=reduced.matches?1:clamp((read*(words.length+2)-i)/2);w.style.opacity=String(.16+.84*amount);w.style.transform=`translateY(${(1-amount)*18}px) rotate(${(1-amount)*2}deg)`});
  }
  function onScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(paintScroll)}
  function goWorld(index,updateURL=true){index=clamp(index,0,3);const target=rows[index];if(reduced.matches){target.scrollIntoView({behavior:'instant'});}else{const top=scrollY+scrollStage.getBoundingClientRect().top-nav.offsetHeight,travel=scrollStage.offsetHeight-sticky.offsetHeight;window.scrollTo({top:top+travel*(index+.07)/3.65,behavior:'smooth'})}if(updateURL)history.replaceState(null,'',location.pathname+`#category-${worlds[index].id}`)}
  $$('[data-world]').forEach(b=>b.addEventListener('click',()=>goWorld(Number(b.dataset.world))));
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const hash=a.getAttribute('href');if(!hash)return;e.preventDefault();history.pushState(null,'',location.pathname+hash);if(hash.startsWith('#category-')){const i=worlds.findIndex(w=>hash===`#category-${w.id}`);if(i>=0)goWorld(i,false)}else document.getElementById(hash.slice(1))?.scrollIntoView({behavior:reduced.matches?'instant':'smooth'})}));
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',measureStage);
  window.addEventListener('hashchange',()=>{const i=worlds.findIndex(w=>location.hash===`#category-${w.id}`);if(i>=0)goWorld(i,false)});
  reduced.addEventListener('change',()=>{heroPaused=reduced.matches;paintHeroPause();resetHeroTimer();resetHeroPointer();measureStage()});
  $$('.world-picture').forEach(b=>b.addEventListener('pointermove',e=>{if(!fine.matches||reduced.matches)return;const r=b.getBoundingClientRect();b.style.setProperty('--cx',`${e.clientX-r.left}px`);b.style.setProperty('--cy',`${e.clientY-r.top}px`)}));

  const dialog=$('#art-dialog'),artView=$('.art-view');let art=null,artIndex=0,artOpener=null,directoryCategory='mc',directoryScroll=0;
  function categoryProjects(id){return worlds.find(w=>w.id===id)?.projectIds||[]}
  function showDialog(button){if(!dialog.open){artOpener=button;dialog.showModal();document.body.style.overflow='hidden';$('#close-art').focus()}}
  function paintArt(){
    if(!art)return;const images=art.images.slice(0,2),im=images[artIndex],ids=categoryProjects(art.category),position=ids.indexOf(art.id),next=projects.get(ids[(position+1)%ids.length]),previous=projects.get(ids[position-1]);
    $('#art-detail').hidden=false;$('#project-directory').hidden=true;
    $('#art-title').textContent=art.title;$('#art-category').textContent=catName(art.category);
    $('#art-image').src=im.src;$('#art-image').alt=im.alt||art.title;$('#art-counter').textContent=`图片 ${pad(artIndex+1)} / ${pad(images.length)}`;
    $('#art-prev').hidden=images.length<2;$('#art-next').hidden=images.length<2;
    $('#project-position').textContent=position<0?`${catName(art.category)} · ${ids.length} 个项目`:`项目 ${pad(position+1)} / ${pad(ids.length)}`;
    $('#project-prev').disabled=!previous;$('#previous-project-title').textContent=previous?.title||'已是第一个项目';
    $('#next-project-title').textContent=next?.title||'';$('#next-project-label').textContent=position===ids.length-1?'回到第一个项目 ↗':'下一个项目 →';
    artView.classList.remove('is-zoomed');$('#art-zoom').setAttribute('aria-pressed','false');$('#art-zoom').textContent='原图尺寸 ＋';artView.scrollTo(0,0);
  }
  function openArt(id,button){const project=getProject(id);if(!project)return;const fromDirectory=dialog.open&&!$('#project-directory').hidden;if(fromDirectory)directoryScroll=$('#directory-grid').scrollTop;art=project;artIndex=0;paintArt();showDialog(button);if(fromDirectory)$('#open-directory').focus()}
  function nextArt(step){if(!art)return;artIndex=(artIndex+step+Math.min(art.images.length,2))%Math.min(art.images.length,2);paintArt()}
  function nextProject(step){if(!art)return;const ids=categoryProjects(art.category),position=ids.indexOf(art.id);if(step<0&&position<=0)return;art=projects.get(ids[(position+step+ids.length)%ids.length]);artIndex=0;paintArt();if($('#project-prev').disabled&&document.activeElement===$('#project-prev'))$('#project-next').focus()}
  function showDirectory(category,button){
    if(directoryCategory!==category)directoryScroll=0;directoryCategory=category;
    $('#art-detail').hidden=true;$('#project-directory').hidden=false;
    $('#art-category').textContent='TOO-DESIGN / PROJECT INDEX';$('#art-title').textContent='全部项目';
    const ids=categoryProjects(category);$('#directory-count').textContent=`${catName(category)} · ${ids.length} 个项目`;
    $$('#directory-categories button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));
    $('#directory-grid').innerHTML=ids.map((id,i)=>{const p=projects.get(id);return `<button class="directory-project" data-art="${p.id}" aria-label="查看${esc(p.title)}"><span class="directory-image"><img src="${esc(p.cover)}" alt="" width="${p.width}" height="${p.height}" loading="lazy" decoding="async"></span><span class="directory-caption"><span><small>${pad(i+1)}</small>${esc(p.title)}</span><span aria-hidden="true">↗</span></span></button>`}).join('');
    $('#directory-grid').scrollTop=directoryScroll;const alreadyOpen=dialog.open;showDialog(button);
    if(alreadyOpen&&button===$('#open-directory'))$(`#directory-categories [data-category="${category}"]`).focus();
  }
  $('#directory-categories').innerHTML=worlds.map(w=>`<button data-category="${w.id}" aria-pressed="false">${w.name}<span>${w.projectIds.length}</span></button>`).join('');
  $$('#directory-categories button').forEach(b=>b.addEventListener('click',()=>showDirectory(b.dataset.category,b)));
  $$('[data-directory]').forEach(b=>b.addEventListener('click',()=>showDirectory(b.dataset.directory,b)));
  $('#open-directory').addEventListener('click',e=>showDirectory(art.category,e.currentTarget));
  $('#project-prev').addEventListener('click',()=>nextProject(-1));$('#project-next').addEventListener('click',()=>nextProject(1));
  document.addEventListener('click',e=>{const b=e.target.closest('[data-art]');if(b)openArt(b.dataset.art,b)});
  $('#close-art').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.style.overflow='';art=null;if(artOpener?.isConnected)artOpener.focus({preventScroll:true})});
  $('#art-prev').addEventListener('click',()=>nextArt(-1));$('#art-next').addEventListener('click',()=>nextArt(1));
  dialog.addEventListener('keydown',e=>{if(!$('#project-directory').hidden)return;if(e.key==='ArrowLeft'){e.preventDefault();e.shiftKey?nextProject(-1):nextArt(-1)}if(e.key==='ArrowRight'){e.preventDefault();e.shiftKey?nextProject(1):nextArt(1)}});
  $('#art-zoom').addEventListener('click',()=>{const zoom=artView.classList.toggle('is-zoomed');$('#art-zoom').setAttribute('aria-pressed',String(zoom));$('#art-zoom').textContent=zoom?'适合屏幕 －':'原图尺寸 ＋';artView.scrollTo(0,0)});
  $('#year').textContent=new Date().getFullYear();
  measureStage();paintHeroPause();resetHeroTimer();
  document.fonts.ready.then(()=>{measureStage();const i=worlds.findIndex(w=>location.hash===`#category-${w.id}`);if(i>=0)goWorld(i,false);else if(location.hash)document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant'});const id=new URLSearchParams(location.search).get('project');if(id&&projects.has(id))openArt(id,null)});
})();
