import{g as ae}from"./zone-CZlDrG7f.js";import{s as ne}from"./user-J7qrPAQr.js";import{d as H,s as y,r as z,v as Z,k as J,F as Y,x as oe,c as x,j as U,b as M,w as N,e as B,y as ie,z as le,i as $,E as O,o as V,p as se,_ as ue}from"./index-CiQqSHAU.js";import"./request-CR0pEiE3.js";/*!
 * qrcode.vue v3.6.0
 * A Vue.js component to generate QRCode. Both support Vue 2 and Vue 3
 * © 2017-PRESENT @scopewu(https://github.com/scopewu)
 * MIT License.
 */var A=function(){return A=Object.assign||function(f){for(var u,s=1,c=arguments.length;s<c;s++){u=arguments[s];for(var g in u)Object.prototype.hasOwnProperty.call(u,g)&&(f[g]=u[g])}return f},A.apply(this,arguments)};var k;(function(l){var f=function(){function a(e,t,r,n){if(this.version=e,this.errorCorrectionLevel=t,this.modules=[],this.isFunction=[],e<a.MIN_VERSION||e>a.MAX_VERSION)throw new RangeError("Version value out of range");if(n<-1||n>7)throw new RangeError("Mask value out of range");this.size=e*4+17;for(var i=[],o=0;o<this.size;o++)i.push(!1);for(var o=0;o<this.size;o++)this.modules.push(i.slice()),this.isFunction.push(i.slice());this.drawFunctionPatterns();var d=this.addEccAndInterleave(r);if(this.drawCodewords(d),n==-1)for(var v=1e9,o=0;o<8;o++){this.applyMask(o),this.drawFormatBits(o);var E=this.getPenaltyScore();E<v&&(n=o,v=E),this.applyMask(o)}c(0<=n&&n<=7),this.mask=n,this.applyMask(n),this.drawFormatBits(n),this.isFunction=[]}return a.encodeText=function(e,t){var r=l.QrSegment.makeSegments(e);return a.encodeSegments(r,t)},a.encodeBinary=function(e,t){var r=l.QrSegment.makeBytes(e);return a.encodeSegments([r],t)},a.encodeSegments=function(e,t,r,n,i,o){if(r===void 0&&(r=1),n===void 0&&(n=40),i===void 0&&(i=-1),o===void 0&&(o=!0),!(a.MIN_VERSION<=r&&r<=n&&n<=a.MAX_VERSION)||i<-1||i>7)throw new RangeError("Invalid value");var d,v;for(d=r;;d++){var E=a.getNumDataCodewords(d,t)*8,C=g.getTotalBits(e,d);if(C<=E){v=C;break}if(d>=n)throw new RangeError("Data too long")}for(var p=0,R=[a.Ecc.MEDIUM,a.Ecc.QUARTILE,a.Ecc.HIGH];p<R.length;p++){var h=R[p];o&&v<=a.getNumDataCodewords(d,h)*8&&(t=h)}for(var m=[],w=0,_=e;w<_.length;w++){var S=_[w];u(S.mode.modeBits,4,m),u(S.numChars,S.mode.numCharCountBits(d),m);for(var I=0,P=S.getData();I<P.length;I++){var D=P[I];m.push(D)}}c(m.length==v);var L=a.getNumDataCodewords(d,t)*8;c(m.length<=L),u(0,Math.min(4,L-m.length),m),u(0,(8-m.length%8)%8,m),c(m.length%8==0);for(var b=236;m.length<L;b^=253)u(b,8,m);for(var T=[];T.length*8<m.length;)T.push(0);return m.forEach(function(G,Q){return T[Q>>>3]|=G<<7-(Q&7)}),new a(d,t,T,i)},a.prototype.getModule=function(e,t){return 0<=e&&e<this.size&&0<=t&&t<this.size&&this.modules[t][e]},a.prototype.getModules=function(){return this.modules},a.prototype.drawFunctionPatterns=function(){for(var e=0;e<this.size;e++)this.setFunctionModule(6,e,e%2==0),this.setFunctionModule(e,6,e%2==0);this.drawFinderPattern(3,3),this.drawFinderPattern(this.size-4,3),this.drawFinderPattern(3,this.size-4);for(var t=this.getAlignmentPatternPositions(),r=t.length,e=0;e<r;e++)for(var n=0;n<r;n++)e==0&&n==0||e==0&&n==r-1||e==r-1&&n==0||this.drawAlignmentPattern(t[e],t[n]);this.drawFormatBits(0),this.drawVersion()},a.prototype.drawFormatBits=function(e){for(var t=this.errorCorrectionLevel.formatBits<<3|e,r=t,n=0;n<10;n++)r=r<<1^(r>>>9)*1335;var i=(t<<10|r)^21522;c(i>>>15==0);for(var n=0;n<=5;n++)this.setFunctionModule(8,n,s(i,n));this.setFunctionModule(8,7,s(i,6)),this.setFunctionModule(8,8,s(i,7)),this.setFunctionModule(7,8,s(i,8));for(var n=9;n<15;n++)this.setFunctionModule(14-n,8,s(i,n));for(var n=0;n<8;n++)this.setFunctionModule(this.size-1-n,8,s(i,n));for(var n=8;n<15;n++)this.setFunctionModule(8,this.size-15+n,s(i,n));this.setFunctionModule(8,this.size-8,!0)},a.prototype.drawVersion=function(){if(!(this.version<7)){for(var e=this.version,t=0;t<12;t++)e=e<<1^(e>>>11)*7973;var r=this.version<<12|e;c(r>>>18==0);for(var t=0;t<18;t++){var n=s(r,t),i=this.size-11+t%3,o=Math.floor(t/3);this.setFunctionModule(i,o,n),this.setFunctionModule(o,i,n)}}},a.prototype.drawFinderPattern=function(e,t){for(var r=-4;r<=4;r++)for(var n=-4;n<=4;n++){var i=Math.max(Math.abs(n),Math.abs(r)),o=e+n,d=t+r;0<=o&&o<this.size&&0<=d&&d<this.size&&this.setFunctionModule(o,d,i!=2&&i!=4)}},a.prototype.drawAlignmentPattern=function(e,t){for(var r=-2;r<=2;r++)for(var n=-2;n<=2;n++)this.setFunctionModule(e+n,t+r,Math.max(Math.abs(n),Math.abs(r))!=1)},a.prototype.setFunctionModule=function(e,t,r){this.modules[t][e]=r,this.isFunction[t][e]=!0},a.prototype.addEccAndInterleave=function(e){var t=this.version,r=this.errorCorrectionLevel;if(e.length!=a.getNumDataCodewords(t,r))throw new RangeError("Invalid argument");for(var n=a.NUM_ERROR_CORRECTION_BLOCKS[r.ordinal][t],i=a.ECC_CODEWORDS_PER_BLOCK[r.ordinal][t],o=Math.floor(a.getNumRawDataModules(t)/8),d=n-o%n,v=Math.floor(o/n),E=[],C=a.reedSolomonComputeDivisor(i),p=0,R=0;p<n;p++){var h=e.slice(R,R+v-i+(p<d?0:1));R+=h.length;var m=a.reedSolomonComputeRemainder(h,C);p<d&&h.push(0),E.push(h.concat(m))}for(var w=[],_=function(S){E.forEach(function(I,P){(S!=v-i||P>=d)&&w.push(I[S])})},p=0;p<E[0].length;p++)_(p);return c(w.length==o),w},a.prototype.drawCodewords=function(e){if(e.length!=Math.floor(a.getNumRawDataModules(this.version)/8))throw new RangeError("Invalid argument");for(var t=0,r=this.size-1;r>=1;r-=2){r==6&&(r=5);for(var n=0;n<this.size;n++)for(var i=0;i<2;i++){var o=r-i,d=(r+1&2)==0,v=d?this.size-1-n:n;!this.isFunction[v][o]&&t<e.length*8&&(this.modules[v][o]=s(e[t>>>3],7-(t&7)),t++)}}c(t==e.length*8)},a.prototype.applyMask=function(e){if(e<0||e>7)throw new RangeError("Mask value out of range");for(var t=0;t<this.size;t++)for(var r=0;r<this.size;r++){var n=void 0;switch(e){case 0:n=(r+t)%2==0;break;case 1:n=t%2==0;break;case 2:n=r%3==0;break;case 3:n=(r+t)%3==0;break;case 4:n=(Math.floor(r/3)+Math.floor(t/2))%2==0;break;case 5:n=r*t%2+r*t%3==0;break;case 6:n=(r*t%2+r*t%3)%2==0;break;case 7:n=((r+t)%2+r*t%3)%2==0;break;default:throw new Error("Unreachable")}!this.isFunction[t][r]&&n&&(this.modules[t][r]=!this.modules[t][r])}},a.prototype.getPenaltyScore=function(){for(var e=0,t=0;t<this.size;t++){for(var r=!1,n=0,i=[0,0,0,0,0,0,0],o=0;o<this.size;o++)this.modules[t][o]==r?(n++,n==5?e+=a.PENALTY_N1:n>5&&e++):(this.finderPenaltyAddHistory(n,i),r||(e+=this.finderPenaltyCountPatterns(i)*a.PENALTY_N3),r=this.modules[t][o],n=1);e+=this.finderPenaltyTerminateAndCount(r,n,i)*a.PENALTY_N3}for(var o=0;o<this.size;o++){for(var r=!1,d=0,i=[0,0,0,0,0,0,0],t=0;t<this.size;t++)this.modules[t][o]==r?(d++,d==5?e+=a.PENALTY_N1:d>5&&e++):(this.finderPenaltyAddHistory(d,i),r||(e+=this.finderPenaltyCountPatterns(i)*a.PENALTY_N3),r=this.modules[t][o],d=1);e+=this.finderPenaltyTerminateAndCount(r,d,i)*a.PENALTY_N3}for(var t=0;t<this.size-1;t++)for(var o=0;o<this.size-1;o++){var v=this.modules[t][o];v==this.modules[t][o+1]&&v==this.modules[t+1][o]&&v==this.modules[t+1][o+1]&&(e+=a.PENALTY_N2)}for(var E=0,C=0,p=this.modules;C<p.length;C++){var R=p[C];E=R.reduce(function(w,_){return w+(_?1:0)},E)}var h=this.size*this.size,m=Math.ceil(Math.abs(E*20-h*10)/h)-1;return c(0<=m&&m<=9),e+=m*a.PENALTY_N4,c(0<=e&&e<=2568888),e},a.prototype.getAlignmentPatternPositions=function(){if(this.version==1)return[];for(var e=Math.floor(this.version/7)+2,t=Math.floor((this.version*8+e*3+5)/(e*4-4))*2,r=[6],n=this.size-7;r.length<e;n-=t)r.splice(1,0,n);return r},a.getNumRawDataModules=function(e){if(e<a.MIN_VERSION||e>a.MAX_VERSION)throw new RangeError("Version number out of range");var t=(16*e+128)*e+64;if(e>=2){var r=Math.floor(e/7)+2;t-=(25*r-10)*r-55,e>=7&&(t-=36)}return c(208<=t&&t<=29648),t},a.getNumDataCodewords=function(e,t){return Math.floor(a.getNumRawDataModules(e)/8)-a.ECC_CODEWORDS_PER_BLOCK[t.ordinal][e]*a.NUM_ERROR_CORRECTION_BLOCKS[t.ordinal][e]},a.reedSolomonComputeDivisor=function(e){if(e<1||e>255)throw new RangeError("Degree out of range");for(var t=[],r=0;r<e-1;r++)t.push(0);t.push(1);for(var n=1,r=0;r<e;r++){for(var i=0;i<t.length;i++)t[i]=a.reedSolomonMultiply(t[i],n),i+1<t.length&&(t[i]^=t[i+1]);n=a.reedSolomonMultiply(n,2)}return t},a.reedSolomonComputeRemainder=function(e,t){for(var r=t.map(function(v){return 0}),n=function(v){var E=v^r.shift();r.push(0),t.forEach(function(C,p){return r[p]^=a.reedSolomonMultiply(C,E)})},i=0,o=e;i<o.length;i++){var d=o[i];n(d)}return r},a.reedSolomonMultiply=function(e,t){if(e>>>8||t>>>8)throw new RangeError("Byte out of range");for(var r=0,n=7;n>=0;n--)r=r<<1^(r>>>7)*285,r^=(t>>>n&1)*e;return c(r>>>8==0),r},a.prototype.finderPenaltyCountPatterns=function(e){var t=e[1];c(t<=this.size*3);var r=t>0&&e[2]==t&&e[3]==t*3&&e[4]==t&&e[5]==t;return(r&&e[0]>=t*4&&e[6]>=t?1:0)+(r&&e[6]>=t*4&&e[0]>=t?1:0)},a.prototype.finderPenaltyTerminateAndCount=function(e,t,r){return e&&(this.finderPenaltyAddHistory(t,r),t=0),t+=this.size,this.finderPenaltyAddHistory(t,r),this.finderPenaltyCountPatterns(r)},a.prototype.finderPenaltyAddHistory=function(e,t){t[0]==0&&(e+=this.size),t.pop(),t.unshift(e)},a.MIN_VERSION=1,a.MAX_VERSION=40,a.PENALTY_N1=3,a.PENALTY_N2=3,a.PENALTY_N3=40,a.PENALTY_N4=10,a.ECC_CODEWORDS_PER_BLOCK=[[-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],[-1,13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]],a.NUM_ERROR_CORRECTION_BLOCKS=[[-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],[-1,1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],[-1,1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]],a}();l.QrCode=f;function u(a,e,t){if(e<0||e>31||a>>>e)throw new RangeError("Value out of range");for(var r=e-1;r>=0;r--)t.push(a>>>r&1)}function s(a,e){return(a>>>e&1)!=0}function c(a){if(!a)throw new Error("Assertion error")}var g=function(){function a(e,t,r){if(this.mode=e,this.numChars=t,this.bitData=r,t<0)throw new RangeError("Invalid argument");this.bitData=r.slice()}return a.makeBytes=function(e){for(var t=[],r=0,n=e;r<n.length;r++){var i=n[r];u(i,8,t)}return new a(a.Mode.BYTE,e.length,t)},a.makeNumeric=function(e){if(!a.isNumeric(e))throw new RangeError("String contains non-numeric characters");for(var t=[],r=0;r<e.length;){var n=Math.min(e.length-r,3);u(parseInt(e.substring(r,r+n),10),n*3+1,t),r+=n}return new a(a.Mode.NUMERIC,e.length,t)},a.makeAlphanumeric=function(e){if(!a.isAlphanumeric(e))throw new RangeError("String contains unencodable characters in alphanumeric mode");var t=[],r;for(r=0;r+2<=e.length;r+=2){var n=a.ALPHANUMERIC_CHARSET.indexOf(e.charAt(r))*45;n+=a.ALPHANUMERIC_CHARSET.indexOf(e.charAt(r+1)),u(n,11,t)}return r<e.length&&u(a.ALPHANUMERIC_CHARSET.indexOf(e.charAt(r)),6,t),new a(a.Mode.ALPHANUMERIC,e.length,t)},a.makeSegments=function(e){return e==""?[]:a.isNumeric(e)?[a.makeNumeric(e)]:a.isAlphanumeric(e)?[a.makeAlphanumeric(e)]:[a.makeBytes(a.toUtf8ByteArray(e))]},a.makeEci=function(e){var t=[];if(e<0)throw new RangeError("ECI assignment value out of range");if(e<128)u(e,8,t);else if(e<16384)u(2,2,t),u(e,14,t);else if(e<1e6)u(6,3,t),u(e,21,t);else throw new RangeError("ECI assignment value out of range");return new a(a.Mode.ECI,0,t)},a.isNumeric=function(e){return a.NUMERIC_REGEX.test(e)},a.isAlphanumeric=function(e){return a.ALPHANUMERIC_REGEX.test(e)},a.prototype.getData=function(){return this.bitData.slice()},a.getTotalBits=function(e,t){for(var r=0,n=0,i=e;n<i.length;n++){var o=i[n],d=o.mode.numCharCountBits(t);if(o.numChars>=1<<d)return 1/0;r+=4+d+o.bitData.length}return r},a.toUtf8ByteArray=function(e){e=encodeURI(e);for(var t=[],r=0;r<e.length;r++)e.charAt(r)!="%"?t.push(e.charCodeAt(r)):(t.push(parseInt(e.substring(r+1,r+3),16)),r+=2);return t},a.NUMERIC_REGEX=/^[0-9]*$/,a.ALPHANUMERIC_REGEX=/^[A-Z0-9 $%*+.\/:-]*$/,a.ALPHANUMERIC_CHARSET="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:",a}();l.QrSegment=g})(k||(k={}));(function(l){(function(f){var u=function(){function s(c,g){this.ordinal=c,this.formatBits=g}return s.LOW=new s(0,1),s.MEDIUM=new s(1,0),s.QUARTILE=new s(2,3),s.HIGH=new s(3,2),s}();f.Ecc=u})(l.QrCode||(l.QrCode={}))})(k||(k={}));(function(l){(function(f){var u=function(){function s(c,g){this.modeBits=c,this.numBitsCharCount=g}return s.prototype.numCharCountBits=function(c){return this.numBitsCharCount[Math.floor((c+7)/17)]},s.NUMERIC=new s(1,[10,12,14]),s.ALPHANUMERIC=new s(2,[9,11,13]),s.BYTE=new s(4,[8,16,16]),s.KANJI=new s(8,[8,10,12]),s.ECI=new s(7,[0,0,0]),s}();f.Mode=u})(l.QrSegment||(l.QrSegment={}))})(k||(k={}));var F=k,q="L",K={L:F.QrCode.Ecc.LOW,M:F.QrCode.Ecc.MEDIUM,Q:F.QrCode.Ecc.QUARTILE,H:F.QrCode.Ecc.HIGH},de=function(){try{new Path2D().addPath(new Path2D)}catch{return!1}return!0}();function W(l){return l in K}function j(l,f){f===void 0&&(f=0);var u=[];return l.forEach(function(s,c){var g=null;s.forEach(function(a,e){if(!a&&g!==null){u.push("M".concat(g+f," ").concat(c+f,"h").concat(e-g,"v1H").concat(g+f,"z")),g=null;return}if(e===s.length-1){if(!a)return;g===null?u.push("M".concat(e+f,",").concat(c+f," h1v1H").concat(e+f,"z")):u.push("M".concat(g+f,",").concat(c+f," h").concat(e+1-g,"v1H").concat(g+f,"z"));return}a&&g===null&&(g=e)})}),u.join("")}function ee(l,f,u,s){var c=s.width,g=s.height,a=s.x,e=s.y,t=l.length+u*2,r=Math.floor(f*.1),n=t/f,i=(c||r)*n,o=(g||r)*n,d=a==null?l.length/2-i/2:a*n,v=e==null?l.length/2-o/2:e*n,E=null;if(s.excavate){var C=Math.floor(d),p=Math.floor(v),R=Math.ceil(i+d-C),h=Math.ceil(o+v-p);E={x:C,y:p,w:R,h}}return{x:d,y:v,h:o,w:i,excavation:E}}function te(l,f){return l.slice().map(function(u,s){return s<f.y||s>=f.y+f.h?u:u.map(function(c,g){return g<f.x||g>=f.x+f.w?c:!1})})}var X={value:{type:String,required:!0,default:""},size:{type:Number,default:100},level:{type:String,default:q,validator:function(l){return W(l)}},background:{type:String,default:"#fff"},foreground:{type:String,default:"#000"},margin:{type:Number,required:!1,default:0},imageSettings:{type:Object,required:!1,default:function(){return{}}},gradient:{type:Boolean,required:!1,default:!1},gradientType:{type:String,required:!1,default:"linear",validator:function(l){return["linear","radial"].indexOf(l)>-1}},gradientStartColor:{type:String,required:!1,default:"#000"},gradientEndColor:{type:String,required:!1,default:"#fff"}},fe=A(A({},X),{renderAs:{type:String,required:!1,default:"canvas",validator:function(l){return["canvas","svg"].indexOf(l)>-1}}}),ce=H({name:"QRCodeSvg",props:X,setup:function(l){var f=z(0),u=z(""),s,c=function(){var a=l.value,e=l.level,t=l.margin,r=t>>>0,n=W(e)?e:q,i=F.QrCode.encodeText(a,K[n]).getModules();if(f.value=i.length+r*2,l.imageSettings.src){var o=ee(i,l.size,r,l.imageSettings);s={x:o.x+r,y:o.y+r,width:o.w,height:o.h},o.excavation&&(i=te(i,o.excavation))}u.value=j(i,r)},g=function(){if(!l.gradient)return null;var a=l.gradientType==="linear"?{x1:"0%",y1:"0%",x2:"100%",y2:"100%"}:{cx:"50%",cy:"50%",r:"50%",fx:"50%",fy:"50%"};return y(l.gradientType==="linear"?"linearGradient":"radialGradient",A({id:"qr-gradient"},a),[y("stop",{offset:"0%",style:{stopColor:l.gradientStartColor}}),y("stop",{offset:"100%",style:{stopColor:l.gradientEndColor}})])};return c(),Z(c),function(){return y("svg",{width:l.size,height:l.size,"shape-rendering":"crispEdges",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 ".concat(f.value," ").concat(f.value)},[y("defs",{},[g()]),y("rect",{width:"100%",height:"100%",fill:l.background}),y("path",{fill:l.gradient?"url(#qr-gradient)":l.foreground,d:u.value}),l.imageSettings.src&&y("image",A({href:l.imageSettings.src},s))])}}}),he=H({name:"QRCodeCanvas",props:X,setup:function(l,f){var u=z(null),s=z(null),c=function(){var a=l.value,e=l.level,t=l.size,r=l.margin,n=l.background,i=l.foreground,o=l.gradient,d=l.gradientType,v=l.gradientStartColor,E=l.gradientEndColor,C=r>>>0,p=W(e)?e:q,R=u.value;if(R){var h=R.getContext("2d");if(h){var m=F.QrCode.encodeText(a,K[p]).getModules(),w=m.length+C*2,_=s.value,S={x:0,y:0,width:0,height:0},I=l.imageSettings.src&&_!=null&&_.naturalWidth!==0&&_.naturalHeight!==0;if(I){var P=ee(m,l.size,C,l.imageSettings);S={x:P.x+C,y:P.y+C,width:P.w,height:P.h},P.excavation&&(m=te(m,P.excavation))}var D=window.devicePixelRatio||1,L=t/w*D;if(R.height=R.width=t*D,h.scale(L,L),h.fillStyle=n,h.fillRect(0,0,w,w),o){var b=void 0;d==="linear"?b=h.createLinearGradient(0,0,w,w):b=h.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2),b.addColorStop(0,v),b.addColorStop(1,E),h.fillStyle=b}else h.fillStyle=i;de?h.fill(new Path2D(j(m,C))):m.forEach(function(T,G){T.forEach(function(Q,re){Q&&h.fillRect(re+C,G+C,1,1)})}),I&&h.drawImage(_,S.x,S.y,S.width,S.height)}}};J(c),Z(c);var g=f.attrs.style;return function(){return y(Y,[y("canvas",A(A({},f.attrs),{ref:u,style:A(A({},g),{width:"".concat(l.size,"px"),height:"".concat(l.size,"px")})})),l.imageSettings.src&&y("img",{ref:s,src:l.imageSettings.src,style:{display:"none"},onLoad:c})])}}}),ve=H({name:"Qrcode",render:function(){var l=this.$props,f=l.renderAs,u=l.value,s=l.size,c=l.margin,g=l.level,a=l.background,e=l.foreground,t=l.imageSettings,r=l.gradient,n=l.gradientType,i=l.gradientStartColor,o=l.gradientEndColor;return y(f==="svg"?ce:he,{value:u,size:s,margin:c,level:g,background:a,foreground:e,imageSettings:t,gradient:r,gradientType:n,gradientStartColor:i,gradientEndColor:o})},props:fe});const ge={class:"task-container"},me={class:"link-section"},pe={class:"link-row"},Ce={class:"qrcode-row"},Ee={class:"task-info"},we=H({__name:"index",setup(l){const f=z([]),u=z(""),s=z({serverUrl:localStorage.getItem("taskServerUrl")||window.location.origin,description:localStorage.getItem("taskDescription")||"请点击链接完成拍照和标记",zoneId:"",photographerName:""}),c=oe(()=>u.value?`${s.value.description}

任务链接：${u.value}`:""),g=async()=>{try{const i=await ae();f.value=i}catch(i){console.error("Failed to fetch zones:",i)}},a=()=>{localStorage.setItem("taskServerUrl",s.value.serverUrl)},e=()=>{localStorage.setItem("taskDescription",s.value.description)},t=async()=>{try{const i=s.value.serverUrl.replace(/\/$/,""),o=new URLSearchParams;if(s.value.photographerName){const v=await ne(s.value.photographerName);if(v.success)o.append("name_token",v.token);else{O.error("获取名称签名失败");return}}const d=o.toString();u.value=`${i}/zone/${s.value.zoneId}${d?"?"+d:""}`}catch(i){console.error("Failed to generate link:",i),O.error("生成链接失败")}},r=async()=>{try{await navigator.clipboard.writeText(u.value),O.success("链接已复制到剪贴板")}catch{O.error("复制失败")}},n=async()=>{try{await navigator.clipboard.writeText(c.value),O.success("完整任务信息已复制到剪贴板")}catch{O.error("复制失败")}};return J(()=>{g()}),(i,o)=>{const d=B("el-input"),v=B("el-form-item"),E=B("el-option"),C=B("el-select"),p=B("el-button"),R=B("el-form");return V(),x("div",ge,[o[9]||(o[9]=U("div",{class:"header"},[U("h2",null,"分派任务")],-1)),M(R,{model:s.value,"label-width":"120px",class:"task-form"},{default:N(()=>[M(v,{label:"服务器地址"},{default:N(()=>[M(d,{modelValue:s.value.serverUrl,"onUpdate:modelValue":o[0]||(o[0]=h=>s.value.serverUrl=h),placeholder:"请输入服务器地址",onChange:a},null,8,["modelValue"])]),_:1}),M(v,{label:"任务说明"},{default:N(()=>[M(d,{modelValue:s.value.description,"onUpdate:modelValue":o[1]||(o[1]=h=>s.value.description=h),type:"textarea",rows:3,placeholder:"请输入任务说明",onChange:e},null,8,["modelValue"])]),_:1}),M(v,{label:"选择区域"},{default:N(()=>[M(C,{modelValue:s.value.zoneId,"onUpdate:modelValue":o[2]||(o[2]=h=>s.value.zoneId=h),placeholder:"请选择区域"},{default:N(()=>[(V(!0),x(Y,null,le(f.value,h=>(V(),se(E,{key:h.id,label:h.name,value:h.id},null,8,["label","value"]))),128))]),_:1},8,["modelValue"])]),_:1}),M(v,{label:"拍摄者姓名"},{default:N(()=>[M(d,{modelValue:s.value.photographerName,"onUpdate:modelValue":o[3]||(o[3]=h=>s.value.photographerName=h),placeholder:"请输入拍摄者姓名"},null,8,["modelValue"])]),_:1}),M(v,null,{default:N(()=>[M(p,{type:"primary",onClick:t,disabled:!s.value.zoneId},{default:N(()=>o[6]||(o[6]=[$(" 生成链接 ")])),_:1},8,["disabled"])]),_:1}),u.value?(V(),x(Y,{key:0},[M(v,{label:"任务链接"},{default:N(()=>[U("div",me,[U("div",pe,[M(d,{modelValue:u.value,"onUpdate:modelValue":o[4]||(o[4]=h=>u.value=h),readonly:""},{append:N(()=>[M(p,{onClick:r},{default:N(()=>o[7]||(o[7]=[$("复制链接")])),_:1})]),_:1},8,["modelValue"])]),U("div",Ce,[M(ve,{value:u.value,width:200,height:200,margin:2,class:"qrcode"},null,8,["value"])])])]),_:1}),M(v,{label:"完整任务信息"},{default:N(()=>[U("div",Ee,[M(d,{modelValue:c.value,"onUpdate:modelValue":o[5]||(o[5]=h=>c.value=h),type:"textarea",rows:4,readonly:""},{append:N(()=>[M(p,{onClick:n},{default:N(()=>o[8]||(o[8]=[$("复制全部")])),_:1})]),_:1},8,["modelValue"])])]),_:1})],64)):ie("",!0)]),_:1},8,["model"])])}}}),ye=ue(we,[["__scopeId","data-v-30b44d86"]]);export{ye as default};
