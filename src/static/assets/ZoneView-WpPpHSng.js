import{g as k}from"./zone-D-iz7DPY.js";import{d as E,u as w,a as S,r as y,b as B,o as C,w as N,c as b,e as h,f as o,g as s,h as e,E as z,i as x,F as _,j as F,k as P,l as c,m,n as p,t as I,p as U,q as R,s as T,v as $,_ as j}from"./index-PZ0i1nac.js";const q={class:"language-switch"},D=E({__name:"ZoneView",setup(M){const u=F(),r=P(),{t:d,locale:v}=w(),g=S(),f=y(g.currentLanguage),L=l=>{g.setLanguage(l),v.value=l},a=B({zoneList:[],selectZoneId:void 0,name:""});C(()=>{const l=localStorage.getItem("name_token")||"";a.name=l.split("-")[0]});const V=()=>{r.push({path:`/takePhoto/${a.selectZoneId}`})};return N(()=>[u.params.zoneId],async(l,n)=>{if(l){const t=Number(l);u.fullPath!=="/zone"&&(!u.params.zoneId||t<=0)&&r.push({path:"/zone"}),a.zoneList=await k();const i=a.zoneList.find(Z=>Z.id===t);a.selectZoneId=(i==null?void 0:i.id)||void 0,a.selectZoneId&&a.selectZoneId<=0&&r.push({path:"/zone"})}},{immediate:!0}),(l,n)=>(c(),b(_,null,[h("div",q,[o(e(z),{modelValue:f.value,"onUpdate:modelValue":n[0]||(n[0]=t=>f.value=t),onChange:L,size:"small"},{default:s(()=>[o(e(m),{label:"中文",value:"zh-CN"}),o(e(m),{label:"English",value:"en-US"})]),_:1},8,["modelValue"])]),o(e(x),{"label-position":"top","label-width":"auto",class:"centered-container"},{default:s(()=>[o(e(p),{label:e(d)("zone.name")+"：","label-position":"top"},{default:s(()=>[h("div",null,I(a.name),1)]),_:1},8,["label"]),o(e(p),{label:e(d)("zone.zoneName")+"：","label-position":"top"},{default:s(()=>[o(e(z),{modelValue:a.selectZoneId,"onUpdate:modelValue":n[1]||(n[1]=t=>a.selectZoneId=t),placeholder:e(d)("zone.selectZone"),disabled:!!e(u).params.zoneId},{default:s(()=>[(c(!0),b(_,null,U(a.zoneList,t=>(c(),R(e(m),{key:t.id,label:t.name,value:t.id},null,8,["label","value"]))),128))]),_:1},8,["modelValue","placeholder","disabled"])]),_:1},8,["label"]),o(e(p),null,{default:s(()=>[o(e(T),{style:{margin:"0 auto"},type:"primary",onClick:n[2]||(n[2]=t=>V())},{default:s(()=>[$(I(e(d)("zone.startPhoto")),1)]),_:1})]),_:1})]),_:1})],64))}}),G=j(D,[["__scopeId","data-v-6dcd542b"]]);export{G as default};
