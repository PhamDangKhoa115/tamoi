/* Short-lived sparks outside #app so DOM reconciliation cannot consume them. */
(function(){'use strict';var modules=window.TamOiFXModules=window.TamOiFXModules||{};
modules.spark=function(ctx){
 var layer=null,bursts=new Set();
 function clear(){bursts.forEach(function(b){b.remove();});bursts.clear();if(layer){layer.remove();layer=null;}}
 function click(e){
  if(!ctx.enabled())return;
  var target=e.target.closest('[data-tamoi-spark]');
  if(!target||target.disabled||!ctx.root.contains(target))return;
  var box=target.getBoundingClientRect();if(!box.width||!box.height)return;
  if(!layer){layer=document.createElement('div');layer.className='tamoi-fx-layer';layer.setAttribute('aria-hidden','true');document.body.appendChild(layer);}
  if(bursts.size>=4){var old=bursts.values().next().value;ctx.cancelOwner(old);old.remove();bursts.delete(old);}
  var burst=document.createElement('div');burst.className='tamoi-fx-burst';
  burst.style.left=(e.detail===0?box.left+box.width/2:e.clientX)+'px';
  burst.style.top=(e.detail===0?box.top+box.height/2:e.clientY)+'px';
  layer.appendChild(burst);bursts.add(burst);
  var completion=target.dataset.tamoiSpark==='success'||(target.dataset.tamoiSpark==='completion'&&target.textContent.trim()==='Nhận giấy chứng nhận');
  var count=completion?10:8,radius=completion?68:48,finished=0;
  for(var i=0;i<count;i++){
   var line=document.createElement('span');line.className='tamoi-fx-spark';burst.appendChild(line);
   var angle=(360*i/count)+'deg';
   var animation=ctx.animate(line,[{transform:'rotate('+angle+') translateX(4px) scaleX(1)',opacity:.9},{transform:'rotate('+angle+') translateX('+radius+'px) scaleX(.15)',opacity:0}],{duration:620,easing:'ease-out'},burst);
   if(animation)animation.finished.catch(function(){}).then(function(){if(++finished===count){burst.remove();bursts.delete(burst);if(!bursts.size&&layer){layer.remove();layer=null;}}});
  }
 }
 document.addEventListener('click',click,true);
 return {reset:clear,destroy:function(){document.removeEventListener('click',click,true);clear();}};
};})();
