/* Individual translate composes with the existing transform-based hover/wiggle. */
(function(){'use strict';var modules=window.TamOiFXModules=window.TamOiFXModules||{};
modules.magnet=function(ctx){
 var fine=matchMedia('(hover: hover) and (pointer: fine)'),active=null,rect=null,frame=0,point=null,position=[0,0];
 function reset(){if(frame)cancelAnimationFrame(frame);frame=0;point=null;if(active)ctx.cancelOwner(active);active=null;rect=null;position=[0,0];}
 function move(e){
  if(!ctx.enabled()||!fine.matches||e.pointerType!=='mouse'){reset();return;}
  var target=e.target.closest('[data-tamoi-magnet]');
  if(!target||target.disabled||!ctx.root.contains(target)||document.activeElement===target){reset();return;}
  if(target!==active){reset();if(getComputedStyle(target).translate!=='none')return;active=target;rect=target.getBoundingClientRect();}
  point=[e.clientX,e.clientY];if(frame)return;
  frame=requestAnimationFrame(function(){frame=0;if(!active||!active.isConnected){reset();return;}
   var next=[Math.max(-10,Math.min(10,(point[0]-rect.left-rect.width/2)*.22)),Math.max(-10,Math.min(10,(point[1]-rect.top-rect.height/2)*.22))];
   if(Math.abs(next[0]-position[0])+Math.abs(next[1]-position[1])<.2)return;
   var current=getComputedStyle(active).translate;if(current==='none')current='0px 0px';ctx.cancelOwner(active);
   ctx.animate(active,[{translate:current},{translate:next[0]+'px '+next[1]+'px'}],{duration:220,easing:'ease-out',fill:'forwards'},active,true);position=next;
  });
 }
 function leave(e){if(!e.relatedTarget||!active||!active.contains(e.relatedTarget))reset();}
 document.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerout',leave,{passive:true});document.addEventListener('focusin',reset);document.addEventListener('click',reset);window.addEventListener('scroll',reset,{passive:true});window.addEventListener('blur',reset);window.addEventListener('resize',reset);fine.addEventListener('change',reset);
 return {reset:reset,destroy:function(){reset();document.removeEventListener('pointermove',move);document.removeEventListener('pointerout',leave);document.removeEventListener('focusin',reset);document.removeEventListener('click',reset);window.removeEventListener('scroll',reset);window.removeEventListener('blur',reset);window.removeEventListener('resize',reset);fine.removeEventListener('change',reset);}};
};})();
