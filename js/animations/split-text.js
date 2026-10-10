/* Transient word fades; restore the original text node for exact resting typography. */
(function(){'use strict';var modules=window.TamOiFXModules=window.TamOiFXModules||{};
modules.split=function(ctx,heading){
 var revision=ctx.revision(heading);
 if(document.fonts&&document.fonts.status!=='loaded'){document.fonts.ready.then(function(){if(ctx.enabled()&&heading.isConnected&&ctx.revision(heading)===revision)modules.split(ctx,heading);});return;}
 if(heading.childElementCount)return;
 var text=heading.textContent,originalWidth=heading.style.getPropertyValue('width'),priority=heading.style.getPropertyPriority('width');
 var locked=heading.getBoundingClientRect().width+'px';heading.style.setProperty('width',locked);
 var fragment=document.createDocumentFragment(),words=[];
 text.split(/(\s+)/).forEach(function(part){if(!part)return;if(/\s/.test(part))fragment.appendChild(document.createTextNode(part));else{var word=document.createElement('span');word.className='tamoi-fx-word';word.textContent=part;words.push(word);fragment.appendChild(word);}});
 heading.replaceChildren(fragment);
 var animations=words.map(function(word,i){return ctx.animate(word,[{opacity:0,translate:"0 28px"},{opacity:1,translate:"0 0"}],{duration:850,delay:Math.min(i,12)*65,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'},heading);}).filter(Boolean);
 function restore(){
  // The runtime may already have restored its own tree during a state update.
  if(heading.textContent===text&&words.some(function(word){return word.parentElement===heading;}))heading.replaceChildren(document.createTextNode(text));
  if(heading.style.getPropertyValue('width')===locked){if(originalWidth)heading.style.setProperty('width',originalWidth,priority);else heading.style.removeProperty('width');}
 }
 Promise.allSettled(animations.map(function(a){return a.finished;})).then(restore);
};})();
