var v=Object.defineProperty;var m=Object.getOwnPropertySymbols;var w=Object.prototype.hasOwnProperty,y=Object.prototype.propertyIsEnumerable;var c=(s,t,i)=>t in s?v(s,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):s[t]=i,o=(s,t)=>{for(var i in t||(t={}))w.call(t,i)&&c(s,i,t[i]);if(m)for(var i of m(t))y.call(t,i)&&c(s,i,t[i]);return s};var r=(s,t,i)=>(c(s,typeof t!="symbol"?t+"":t,i),i);import{G as M}from"./vendor.34f1e898.js";const b=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const h of e)if(h.type==="childList")for(const n of h.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&a(n)}).observe(document,{childList:!0,subtree:!0});function i(e){const h={};return e.integrity&&(h.integrity=e.integrity),e.referrerpolicy&&(h.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?h.credentials="include":e.crossorigin==="anonymous"?h.credentials="omit":h.credentials="same-origin",h}function a(e){if(e.ep)return;e.ep=!0;const h=i(e);fetch(e.href,h)}};b();var g=Math.PI*2,D=function(s){this.$element,this.direction,this.speed,this.x_sign=1,this.y_sign=1,this.lasttic,this.lastdistance,this.delta_x,this.delta_y,this.delta_t,this.pp=[],this.hits,this.maxHits,this.alive,this.radius,this.maxRadius,this.growthRate,this.onDeath,this.startTime,this.dataCollector=null,this.lastMissTime,this.totalMisses,this.last_x,this.last_y,this.explosion_sound,this.setPosition=function(t,i,a,e){this.$element.offset({left:t,top:i}),this.last_x=t,this.last_y=i},this.setRadius=function(t){t=Math.min(t,this.maxRadius),this.radius=t,this.$element.css("width",t*2),this.$element.css("height",t*2),this.$element.css("border-radius",t)},this.tic=function(){if(!!this.alive&&!(Date.now()<this.startAfter)){this.$element.css("visibility","visible"),this.delta_t=Date.now()-this.lasttic,this.delta_t>500&&(this.delta_t=500);var t=this.$element.offset(),i=t.left,a=t.top,e=this.delta_t*this.speed;this.lastdistance=e;var h=i+Math.cos(this.direction)*e*this.x_sign,n=a+Math.sin(this.direction)*e*this.y_sign;this.delta_x=h-i,this.delta_y=n-a,this.delta_x>0&&h>$(window).width()-this.$element.width()?this.x_sign=this.x_sign*-1:this.delta_x<0&&h<0&&(this.x_sign=this.x_sign*-1),this.delta_y>0&&n>$(window).height()-this.$element.height()?this.y_sign=this.y_sign*-1:this.delta_y<0&&n<0&&(this.y_sign=this.y_sign*-1),this.direction=this.direction%g,this.setPosition(h,n,"tic",{x:i,y:a,dist:e,delta_t:this.delta_t}),this.setRadius(this.radius+this.radius*this.growthRate*this.delta_t),this.lasttic=Date.now()}},this.clickHandler=function(t){if(!!this.alive&&(this.hits++,this.hits>=this.maxHits)){if(this.alive=0,this.dataCollector&&this.dataCollector.event({event:"targetHit",latency:Date.now()-this.startTime,radius:this.radius,speed:this.speed,misses:this.totalMisses}),this.explosion_sound)try{this.explosion_sound.currentTime=0,this.explosion_sound.play()}catch(i){alert(JSON.stringify(i))}this.shrapnelManager&&this.shrapnelManager.create(Math.floor(this.radius/10+Math.random()*6-3),{x:this.$element.offset().left,y:this.$element.offset().top,radius:this.radius,direction:this.direction,x_sign:this.x_sign,y_sign:this.y_sign}),this.onDeath&&this.onDeath(),this.$element.length&&(this.$element.off(),$("body").off(),this.$element.remove(),this.alive=0)}},this.remove=function(t){this.$element.length&&(this.$element.off(),$("body").off(),this.$element.remove(),this.alive=0)},this.missHandler=function(t){var i=t.pageX,a=t.pageY;this.$element.offset();var e=Math.floor(Math.sqrt(Math.pow(i-(this.last_x+this.radius),2)+Math.pow(a-(this.last_y+this.radius),2)));return this.totalMisses++,this.dataCollector&&this.dataCollector.event({event:"targetMiss",dist:e,mousePos:[i,a],lastPos:[Math.floor(this.last_x),Math.floor(this.last_y)],latency:Date.now()-this.startTime,radius:this.radius,speed:this.speed,miss:this.totalMisses}),this.lastMissTime=Date.now(),!1},this.startIn=t=>{this.startAfter=Date.now()+t,console.log(`this.startAfter ${this.startAfter} alive: ${this.alive} t: ${t}`)},this.init=function(t){console.log("target.init(), params=",t),this.startAfter=t.startAfter||0,this.maxRadius=t.maxRadius||200,this.initialRadius=t.initialRadius||100,this.growthRate=t.growthRate,this.alive=t.alive||1,this.hits=t.hits||0,this.maxHits=t.maxHits||1,this.direction=t.direction||Math.random()*g,this.speed=t.speed,this.lasttic=Date.now(),this.startTime=this.lasttic,this.totalMisses=0,$("#explosion_sound").length!=0&&(this.explosion_sound=document.getElementById("explosion_sound")),(!this.$element||this.$element.length==0)&&(this.$element=$("<div id=target></div>"),this.$element.css("visibility","hidden"),this.setRadius(this.initialRadius),$("body").append(this.$element));const a=(()=>($(window).width(),$(window).height(),{x:Math.floor(Math.random()*($(window).width()-this.radius*2)),y:Math.floor(Math.random()*($(window).height()-this.radius*2))}))();this.setPosition(a.x,a.y,"init"),this.$element.bind("touchstart",function(e){this.clickHandler(e),e.stopPropagation()}.bind(this)),this.$element.bind("mousedown",function(e){this.clickHandler(e),e.stopPropagation()}.bind(this)),$("body").bind("touchstart",function(e){this.missHandler(e),e.stopPropagation()}.bind(this)),$("body").bind("mousedown",function(e){this.missHandler(e),e.stopPropagation()}.bind(this)),t&&t.dataCollector&&(this.dataCollector=t.dataCollector,this.dataCollector.event({event:"newTarget",radius:this.radius,speed:this.speed}))},this.init(s)},u=Math.PI*2,T=function(s){this.$element,this.direction,this.speed,this.speedDecayRate,this.deathSpeed,this.x_sign=1,this.y_sign=1,this.lasttic,this.lastdistance,this.delta_x,this.delta_y,this.delta_t,this.pp=[],this.hits,this.maxHits,this.alive,this.size,this.minSize,this.maxSize,this.growthRate,this.onDeath,this.maxAge,this.startTime,this.rotation,this.rotationRate,this.red=255,this.alpha=1,this.setPosition=function(t,i,a,e){this.pp.length>10||(this.pp.push({t:this.delta_t,x:t,y:i}),this.$element.offset({left:t,top:i}))},this.getAge=function(){return this.startTime?Date.now()-this.startTime:0},this.die=function(){this.alive=0,this.$element.length&&this.$element.remove()},this.tic=function(){if(this.alive!=0){if(this.getAge()>=this.maxAge||this.speed<=this.deathSpeed){this.die();return}this.$element.length==0&&this.init(),this.delta_t=Date.now()-this.lasttic,this.delta_t>500&&(this.delta_t=500);var t=this.$element.offset(),i=t.left,a=t.top,e=this.delta_t*this.speed;this.lastdistance=e;var h=i+Math.cos(this.direction)*e*this.x_sign,n=a+Math.sin(this.direction)*e*this.y_sign;this.delta_x=h-i,this.delta_y=n-a,this.delta_x>0&&h>$(window).width()-this.$element.width()?this.x_sign=this.x_sign*-1:this.delta_x<0&&h<0&&(this.x_sign=this.x_sign*-1),this.delta_y>0&&n>$(window).height()-this.$element.height()?this.y_sign=this.y_sign*-1:this.delta_y<0&&n<0&&(this.y_sign=this.y_sign*-1),this.direction=this.direction%u,this.setPosition(h,n,"tic",{x:i,y:a,dist:e,delta_t:this.delta_t}),this.$element.offset({left:h,top:n}),this.speed=this.speed-this.speed*this.speedDecayRate*this.delta_t,this.rotation+=this.rotationRate*this.delta_t,this.rotationRate-=this.rotationRate*this.speedDecayRate*this.delta_t,this.$element.css("transform","rotate("+this.rotation*10+"deg)"),this.lasttic=Date.now()}},this.init=function(t){this.startTime=Date.now(),this.maxAge=32e3-Math.random()*300,this.alive=1,this.hits=0,this.maxHits=1,t.hasOwnProperty("direction")?(this.direction=t.direction+(Math.random()*1-.5),this.y_sign=t.y_sign,this.x_sign=t.x_sign):this.direction=Math.random()*u,this.speed=.07+Math.pow(4*Math.random(),-2)/2,this.speed=Math.min(this.speed,1),this.speedDecayRate=.002,this.deathSpeed=.05,this.rotation=0,this.rotationRate=Math.random()/3,this.minSize=5,this.maxSize=40,this.size=Math.random()*(this.maxSize-this.minSize)+this.minSize,this.lasttic=Date.now(),(!this.$element||this.$element.length==0)&&(this.$element=$("<div id=shrapnel"+Math.floor(Math.random()*101010)+"></div>"),this.$element.addClass("shrapnel"),this.$element.css("border-left",this.size*.86+"px solid transparent"),this.$element.css("border-right",this.size*.86+"px solid transparent"),this.$element.css("border-top",this.size+"px solid #f00"),$("body").append(this.$element)),this.setPosition(t.x+Math.random()*t.radius*2-t.radius,t.y+Math.random()*t.radius*2-t.radius,"init")},this.init(s)},R=function(){this.shrapnel=[],this.maxDuration=10,this.lastIndex=0,this.tics=0,this.efficiency=0,this.duration=0,this.timePerIteration=[],this.dataCollector=null,this.debug=0,this.create=function(s,t){for(var i=0;i<s;i++)this.shrapnel.push(new T(t))},this.tic=function(){if(this.shrapnel.length!=0){var s=Date.now();for(this.tics=0,debug==1&&(this.timePerIteration=[]);Date.now()-s<this.maxDuration&&this.shrapnel.length>0&&(this.tics++,this.lastIndex=Math.max(-1,Math.min(this.lastIndex,this.shrapnel.length)-1),this.lastIndex==-1&&(this.lastIndex=this.shrapnel.length-1),!(this.shrapnel[this.lastIndex]._tic&&this.shrapnel[this.lastIndex]._tic==s));)this.shrapnel[this.lastIndex].tic(),this.shrapnel[this.lastIndex]._tic=s,this.shrapnel[this.lastIndex].alive||this.shrapnel.splice(this.lastIndex,1),debug==1&&(this.timePerIteration.length==0?this.timePerIteration.push(Date.now()-s):this.timePerIteration.push(Date.now()-s));debug==1&&this.dataCollector&&this.dataCollector.event({debug,event:"ShrapnelTic",timePerIter:this.timePerIteration}),this.tics>0&&(this.duration=Date.now()-s),this.tics>0&&(this.efficiency=this.tics/this.duration)}}},P=function(){this.debug=0,this.debug&&(this.$element=$("<div id=datacollector></div>"),this.$element.css("position","fixed"),this.$element.css("left","100px"),this.$element.css("width","80%"),this.$element.css("height","100px"),this.$element.css("bottom","100px"),this.$element.css("overflow-y","scroll"),this.$element.css("background","rgba(200,200,200,.5)"),this.$element.css("padding","2px 2px 2px 2px"),this.$element.css("border-style","solid"),this.$element.css("border-width","1px"),this.$element.css("font-size",".75em"),$("body").append(this.$element)),this.data=[],this.startTime=Date.now(),this.event=function(s){s||(s={undefined:!0}),s.hasOwnProperty("event")||(s.event="undefined"),s.hasOwnProperty("time")||(s.time=Date.now()),this.data.push(s),this.debug&&this.$element.prepend(Date.now()-this.startTime+"	"+JSON.stringify(s)+"<br>")},this.click=function(s){s.hasOwnProperty("event")||(s.event="click"),this.event(s),console.log(s)}};function I(s,t,i){return Math.floor(Math.sqrt(Math.pow(t-(s.last_x+s.radius),2)+Math.pow(i-(s.last_y+s.radius),2)))}class S{constructor(t){r(this,"report",()=>{console.log(this.params)});r(this,"newTarget",(t,i)=>{this.state.targetNum++,i?(this.params=o(o({},this.params),i),this.params.target={}):i={};const{params:a,state:e}=this;a.target=new D(a);const{target:h}=a;return h.shrapnelManager=this.params.shrapnelManager,t||(t=0),h.startIn(t),e.audioReady==0&&(h.explosion_sound.load(),e.audioReady=1),h});r(this,"startGame",t=>{const{state:i,params:a}=this;i.targetNum=0,a.dataCollector=new DataCollector,a.shrapnelManager=new ShrapnelManager,a.shrapnelManager.dataCollector=dataCollector,console.log("SingleMovingTarget.startGame, targetParams=",targetParams);const e=o(o({},this.params),t);newTarget(null,e),$(document).mousemove(this.onMouseMove).bind(this),tic()});r(this,"tic",()=>{const{target:t,shrapnelManager:i}=this.params,{state:a,newTarget:e}=this;t.tic(),i.tic(),a.delta_t=Date.now()-a.lastTicTime,t.alive||e(1500),a.lastTicTime=Date.now()});r(this,"onMouseMove",t=>{const{params:i}=this;i.mX=t.pageX,i.mY=t.pageY,i.distanceToTarget=I(target,mX,mY)});this.params={dataCollector:null,shrapnelManager:null,target:null,debug:1},this.params=o(o({},this.params),t),this.state={mX:0,mY:0,distanceToTarget:0,lastTicTime:0,delta_t:0,lastError:0,audioReady:0,targetNum:0}}}var l={initialRadius:100,maxRadius:200,speed:.1,growthRate:1e-4};const p=new M({name:"Settings"});var C=p.addFolder("Game Selector");C.add({Restart:function(){target.remove(),x(l)}},"Restart");var d=p.addFolder("Target Settings");d.add(l,"initialRadius",10,200).onFinishChange(function(){console.log(`getValue = ${this.getValue()}`)});d.add(l,"maxRadius",10,200);d.add(l,"speed",0,.2);d.add(l,"growthRate",0,.001);let f=null;function x(s){const t=new P,i=new R;i.dataCollector=t,f=new S({dataCollector:t,shrapnelManager:i}),f.newTarget(null,s),_()}function _(){requestAnimationFrame(_),f.tic()}window.onload=x;
