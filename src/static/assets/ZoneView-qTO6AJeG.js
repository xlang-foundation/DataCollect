import{g as I}from"./zone-D2t3miTo.js";import{d as _,r as b,w as z,c as p,a as s,u as a,E as Z,b as h,e as k,o as u,f as n,g as c,h as v,i as E,F as V,j as w,k as L,l as g,m as x,_ as y}from"./index-CfQoJ6uM.js";import"./request-D_3vaWm5.js";const B=_({__name:"ZoneView",setup(F){const l=h(),d=k(),e=b({zoneList:[],selectZoneId:void 0}),m=()=>{d.push({path:`/takePhoto/${e.selectZoneId}`})};return z(()=>[l.params.zoneId],async(r,o)=>{if(r){const t=Number(r);l.fullPath!=="/zone"&&(!l.params.zoneId||t<=0)&&d.push({path:"/zone"}),e.zoneList=await I();const i=e.zoneList.find(f=>f.id===t);e.selectZoneId=(i==null?void 0:i.id)||void 0,e.selectZoneId&&e.selectZoneId<=0&&d.push({path:"/zone"})}},{immediate:!0}),(r,o)=>(u(),p(a(Z),{"label-position":"top","label-width":"auto",class:"centered-container"},{default:s(()=>[n(a(c),{label:"工作区：","label-position":"top"},{default:s(()=>[n(a(v),{modelValue:e.selectZoneId,"onUpdate:modelValue":o[0]||(o[0]=t=>e.selectZoneId=t),placeholder:"请选择工作区域",disabled:!!a(l).params.zoneId},{default:s(()=>[(u(!0),E(V,null,w(e.zoneList,t=>(u(),p(a(L),{key:t.id,label:t.name,value:t.id},null,8,["label","value"]))),128))]),_:1},8,["modelValue","disabled"])]),_:1}),n(a(c),null,{default:s(()=>[n(a(g),{style:{margin:"0 auto"},type:"primary",onClick:o[1]||(o[1]=t=>m())},{default:s(()=>o[2]||(o[2]=[x(" 开始拍照 ")])),_:1})]),_:1})]),_:1}))}}),R=y(B,[["__scopeId","data-v-4c018803"]]);export{R as default};
