/* Once-on-entry, readable throughout; no hidden CSS state or scroll loop. */
(function(){'use strict';var modules=window.TamOiFXModules=window.TamOiFXModules||{};
modules.reveal=function(ctx,el){
 var revision=ctx.revision(el),style=getComputedStyle(el);
 // Refuse a second animation on an element already owning motion or a transform.
 if(style.translate!=='none')return;
 var originals=el.getAnimations().filter(function(a){return a instanceof CSSAnimation&&a.playState!=='finished';});
 if(originals.some(function(a){return a.effect.getTiming().iterations===Infinity;}))return;
 if(originals.length){Promise.allSettled(originals.map(function(a){return a.finished;})).then(function(){if(ctx.enabled()&&el.isConnected&&ctx.revision(el)===revision)modules.reveal(ctx,el);});return;}
 ctx.animate(el,[{opacity:0,translate:'0 30px'},{opacity:1,translate:'0 0'}],{duration:800,easing:'cubic-bezier(.16,1,.3,1)'},el);
};})();
