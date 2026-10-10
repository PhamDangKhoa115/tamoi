/* Additive controller: DOM stays owned by the original runtime. */
(function(){'use strict';
 if(window.TamOiFX)return;
 var root=document.getElementById('app'),modules=window.TamOiFXModules||{},motion=matchMedia('(prefers-reduced-motion: reduce)'),records=new WeakMap(),waiting=new Set(),animations=new Map(),started=0,intersections=0,initializations=0,destroyed=false,suspended=false;
 var supported=!!(root&&Element.prototype.animate&&window.IntersectionObserver&&window.MutationObserver&&window.CSS&&CSS.supports('translate','1px 1px'));
 function enabled(){return supported&&!destroyed&&!suspended&&!motion.matches;}
 function cancelOwner(owner){var set=animations.get(owner);if(set){set.forEach(function(a){a.cancel();});animations.delete(owner);}}
 function animate(el,frames,options,owner,retain){
  if(!enabled()||!el.isConnected)return null;
  var a=el.animate(frames,options);started++;var set=animations.get(owner);if(!set){set=new Set();animations.set(owner,set);}set.add(a);
  function release(){set.delete(a);if(!set.size)animations.delete(owner);}
  a.finished.then(function(){if(!retain){a.cancel();release();}},release);return a;
 }
 var ctx={root:root,enabled:enabled,animate:animate,cancelOwner:cancelOwner,revision:function(el){return records.get(el);}};
 function key(el){return el.getAttribute('data-tamoi-fx-key')||'static';}
 function enter(el){var record=records.get(el);if(!record||record.started)return;record.started=true;waiting.delete(el);observer.unobserve(el);if(enabled()&&modules[record.type])modules[record.type](ctx,el);}
 var observer=supported?new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){intersections++;enter(entry.target);}});},{threshold:.08}):null;
 function prepare(el){
  var type=el.getAttribute('data-tamoi-fx');if(type!=='split'&&type!=='reveal')return;
  var old=records.get(el),value=key(el);if(old&&old.key===value&&old.type===type)return;
  cancelOwner(el);if(type==='split')el.querySelectorAll('.tamoi-fx-word').forEach(cancelOwner);
  initializations++;records.set(el,{key:value,type:type,started:!enabled()});
  if(enabled()){waiting.add(el);observer.observe(el);}else if(observer){observer.unobserve(el);waiting.delete(el);}
 }
 function scan(node){if(node.nodeType!==1)return;if(node.matches('[data-tamoi-fx]'))prepare(node);node.querySelectorAll('[data-tamoi-fx]').forEach(prepare);}
 var mutation=supported?new MutationObserver(function(changes){
  changes.forEach(function(change){if(change.type==='attributes')prepare(change.target);else change.addedNodes.forEach(scan);});
  waiting.forEach(function(el){if(!el.isConnected){observer.unobserve(el);waiting.delete(el);}});
  animations.forEach(function(set,owner){if(!owner.isConnected)cancelOwner(owner);else set.forEach(function(a){if(a.effect&&a.effect.target&&!a.effect.target.isConnected)a.cancel();});});
 }):null;
 var spark=supported&&modules.spark?modules.spark(ctx):null,magnet=supported&&modules.magnet?modules.magnet(ctx):null;
 function stop(){animations.forEach(function(set,owner){cancelOwner(owner);});if(spark)spark.reset();if(magnet)magnet.reset();waiting.forEach(function(el){var record=records.get(el);if(record)record.started=true;observer.unobserve(el);});waiting.clear();}
 function preference(){if(motion.matches)stop();}
 if(supported){scan(root);mutation.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['data-tamoi-fx-key','data-tamoi-fx']});motion.addEventListener('change',preference);}
 function destroy(){if(destroyed)return;stop();destroyed=true;if(mutation)mutation.disconnect();if(observer)observer.disconnect();if(spark)spark.destroy();if(magnet)magnet.destroy();motion.removeEventListener('change',preference);window.removeEventListener('pagehide',pagehide);window.removeEventListener('pageshow',pageshow);}
 function pagehide(){suspended=true;stop();}
 function pageshow(e){suspended=false;if(e.persisted&&supported&&!destroyed)scan(root);}
 window.addEventListener('pagehide',pagehide);window.addEventListener('pageshow',pageshow);
 window.TamOiFX={destroy:destroy,stats:function(){var count=0;animations.forEach(function(set){count+=set.size;});return {enabled:enabled(),supported:supported,reducedMotion:motion.matches,modules:Object.keys(modules),intersections:intersections,initializations:initializations,started:started,active:count,waiting:waiting.size,bursts:document.querySelectorAll('.tamoi-fx-burst').length};}};
})();
