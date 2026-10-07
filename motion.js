(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function letterMarkup(text,wordClass,charClass){
    let index=0;
    return text.split(/(\s+)/).map(word=>/\s/.test(word)?word:`<span class="${wordClass}">${[...word].map(c=>`<span class="${charClass}" style="--char-index:${index++}">${esc(c)}</span>`).join('')}</span>`).join('');
  }
  const headingNodes=[...document.querySelectorAll('.type-statement,.type-manifesto')];
  for(const el of headingNodes){
    const parts=el.innerHTML.split(/<br\s*\/?>/i);
    const accessibleText=parts.map(part=>{const temp=document.createElement('div');temp.innerHTML=part;return temp.textContent}).join(' ');
    el.innerHTML=parts.map((part,i)=>`<span class="motion-line" aria-hidden="true" style="--line-index:${i}"><span class="motion-line-inner">${part}</span></span>`).join('');
    el.insertAdjacentHTML('afterbegin',`<span class="visually-hidden">${esc(accessibleText)}</span>`);
    for(const line of el.querySelectorAll('.motion-line-inner')){
      const walker=document.createTreeWalker(line,NodeFilter.SHOW_TEXT),nodes=[];
      while(walker.nextNode())nodes.push(walker.currentNode);
      for(const node of nodes){const template=document.createElement('template');template.innerHTML=letterMarkup(node.textContent,'motion-word','motion-char');node.replaceWith(template.content)}
    }
  }
  for(const title of document.querySelectorAll('.world-name')){
    const text=title.textContent;
    title.innerHTML=`<span class="visually-hidden">${esc(text)}</span><span aria-hidden="true">${letterMarkup(text,'title-word','title-char')}</span>`;
  }
  const fades=[...document.querySelectorAll('.type-statement-cn,.intro-bottom,.closing-top')];
  fades.forEach(el=>el.classList.add('motion-fade'));
  const animated=[...headingNodes,...fades];
  const revealObserver=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('motion-entered');revealObserver.unobserve(entry.target)}
  },{threshold:.12,rootMargin:'0px 0px -30px 0px'});
  for(const el of animated){if(reduced.matches)el.classList.add('motion-entered');else revealObserver.observe(el)}
  reduced.addEventListener('change',()=>{if(reduced.matches){animated.forEach(el=>el.classList.add('motion-entered'));revealObserver.disconnect()}});

  // Keep the entire text in the layout and for screen readers while typing it visually.
  function prepareTyping(el){
    const lines=el.innerHTML.split(/<br\s*\/?>/i).map(part=>{const temp=document.createElement('div');temp.innerHTML=part;return temp.textContent});
    function chars(text){return [...text].map(c=>`<span class="tw-char">${esc(c)}</span>`).join('')}
    const visual=lines.map(line=>line.split(/(\s+)/).map(token=>/\s|[\u3400-\u9fff]/.test(token)?chars(token):`<span class="tw-word">${chars(token)}</span>`).join('')).join('<br>');
    el.classList.add('typewriter');
    el.innerHTML=`<span class="visually-hidden">${esc(lines.join(' '))}</span><span class="tw-visual" aria-hidden="true">${visual}</span>`;
    return {el,chars:[...el.querySelectorAll('.tw-char')],delay:el.tagName==='P'?22:30};
  }
  const typingGroups=[
    ['#work-title','.work-preface p'],
    ['.closing h2','.closing-main>div>p']
  ].map(selectors=>({items:selectors.map(s=>prepareTyping(document.querySelector(s))),visible:false,item:0,char:0,timer:0,caret:null,done:false,started:false}));
  function clearTypingTimer(group){clearTimeout(group.timer);group.timer=0}
  function clearTypingCaret(group){group.caret?.classList.remove('tw-caret');group.caret=null}
  function completeTyping(group){
    clearTypingTimer(group);clearTypingCaret(group);group.done=true;
    group.items.forEach(item=>{item.chars.forEach(c=>c.classList.add('tw-visible'));item.el.dataset.typing='complete'});
  }
  function resetTyping(group){
    clearTypingTimer(group);clearTypingCaret(group);group.item=0;group.char=0;group.done=false;
    group.items.forEach(item=>{item.chars.forEach(c=>c.classList.remove('tw-visible'));item.el.dataset.typing='pending'});
  }
  function scheduleTyping(group,delay){clearTypingTimer(group);if(group.visible&&!document.hidden&&!group.done)group.timer=setTimeout(()=>typeNext(group),delay)}
  function typeNext(group){
    group.timer=0;if(!group.visible||document.hidden||group.done)return;
    if(reduced.matches){completeTyping(group);return}
    const item=group.items[group.item];
    if(!item){group.done=true;group.timer=setTimeout(()=>clearTypingCaret(group),700);return}
    item.el.dataset.typing='typing';
    if(group.char>=item.chars.length){item.el.dataset.typing='complete';group.item++;group.char=0;if(group.item===group.items.length){group.done=true;group.timer=setTimeout(()=>clearTypingCaret(group),1100)}else scheduleTyping(group,350);return}
    clearTypingCaret(group);
    const char=item.chars[group.char++];char.classList.add('tw-visible','tw-caret');group.caret=char;
    const value=char.textContent;
    const delay=/\s/.test(value)?20:item.delay+(/[.!?。！？]/.test(value)?170:/[,，、]/.test(value)?80:0);
    scheduleTyping(group,delay);
  }
  const typingObserver=new IntersectionObserver(entries=>{
    for(const entry of entries){
      const group=typingGroups.find(g=>g.items[0].el.parentElement===entry.target);
      if(entry.isIntersecting&&entry.intersectionRatio>=.2&&!group.visible){group.visible=true;group.started=true;if(reduced.matches)completeTyping(group);else if(!group.done)scheduleTyping(group,180)}
      else if(!entry.isIntersecting){group.visible=false;if(group.started)completeTyping(group)}
    }
  },{threshold:[0,.2],rootMargin:'-78px 0px -25px 0px'});
  typingGroups.forEach(group=>{if(reduced.matches)completeTyping(group);else resetTyping(group);typingObserver.observe(group.items[0].el.parentElement)});
  document.addEventListener('visibilitychange',()=>{typingGroups.forEach(group=>{if(document.hidden)clearTypingTimer(group);else if(group.visible&&!group.done)scheduleTyping(group,100);else if(group.done)clearTypingCaret(group)})});
  reduced.addEventListener('change',()=>{if(reduced.matches)typingGroups.forEach(completeTyping)});

  const root=document.documentElement,dialog=document.querySelector('#art-dialog');
  function makeCursor(parent){const el=document.createElement('div');el.className='square-cursor';el.setAttribute('aria-hidden','true');el.innerHTML='<span class="square-cursor-box"><span>查看 ↗</span></span>';parent.append(el);return el}
  const cursors=[makeCursor(document.body),makeCursor(dialog)];
  let targetX=0,targetY=0,x=0,y=0,frame=0,visible=false,lastTarget=null;
  function setCursorState(target){
    const art=!!target?.closest('[data-art]');
    const interactive=!!target?.closest('a,button,[role="button"],video');
    const dark=!!target?.closest('.dark-surface,dialog,.site-nav.is-dark');
    cursors.forEach(c=>{c.classList.toggle('is-art',art);c.classList.toggle('is-link',interactive&&!art);c.classList.toggle('is-dark',dark)});
  }
  function paint(){
    frame=0;
    if(!visible)return;
    const ease=reduced.matches?1:.42;
    x+=(targetX-x)*ease;y+=(targetY-y)*ease;
    cursors.forEach(c=>{c.style.transform=`translate3d(${x}px,${y}px,0)`});
    if(Math.abs(targetX-x)+Math.abs(targetY-y)>.15)frame=requestAnimationFrame(paint);
  }
  function hideCursor(){visible=false;root.classList.remove('has-square-cursor');cursors.forEach(c=>c.classList.remove('is-visible','is-pressed'));cancelAnimationFrame(frame);frame=0}
  document.addEventListener('pointermove',e=>{
    if(!fine.matches||e.pointerType!=='mouse'){hideCursor();return}
    targetX=e.clientX;targetY=e.clientY;
    if(!visible){x=targetX;y=targetY;visible=true;root.classList.add('has-square-cursor');cursors.forEach(c=>c.classList.add('is-visible'))}
    if(e.target!==lastTarget){lastTarget=e.target;setCursorState(lastTarget)}
    if(!frame)frame=requestAnimationFrame(paint);
  },{passive:true});
  document.addEventListener('pointerover',e=>{lastTarget=e.target;setCursorState(lastTarget)},{passive:true});
  document.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')cursors.forEach(c=>c.classList.add('is-pressed'));else hideCursor()},{passive:true});
  document.addEventListener('pointerup',()=>cursors.forEach(c=>c.classList.remove('is-pressed')),{passive:true});
  document.addEventListener('pointercancel',hideCursor,{passive:true});
  document.documentElement.addEventListener('pointerleave',hideCursor);
  window.addEventListener('blur',hideCursor);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hideCursor()});
  document.addEventListener('keydown',e=>{if(e.key==='Tab')hideCursor()});
  fine.addEventListener('change',hideCursor);
  dialog.addEventListener('close',()=>{lastTarget=null;hideCursor()});
  window.addEventListener('scroll',()=>{if(visible){lastTarget=document.elementFromPoint(targetX,targetY);setCursorState(lastTarget)}},{passive:true});
})();
