import{g as $,u as q,a as R,d as S}from"./label-CmwT2Tjh.js";import{d as A,P as G,x as c,o as O,k as P,i as x,z as j,g as l,t as u,u as o,a as t,C as i,T as H,c as J,p as b,G as _,U as K,f as C,_ as Q}from"./index-D8SYNlsh.js";const W={class:"label-container"},X={class:"header"},Y=A({__name:"index",setup(Z){const{t:e}=G(),v=c(!1),g=c(!1),d=c(!1),p=c(!1),w=c([]),m=c(),s=c({id:0,label:""}),k={label:[{required:!0,message:e("validation.required"),trigger:"blur"}]},y=async()=>{try{v.value=!0;const n=await $();w.value=n}catch(n){console.error("Failed to fetch labels:",n)}finally{v.value=!1}},L=()=>{p.value=!1,s.value={id:0,label:""},d.value=!0},V=n=>{p.value=!0,s.value={...n},d.value=!0},B=async()=>{m.value&&await m.value.validate(async n=>{if(n)try{g.value=!0,p.value?(await q(s.value.id,s.value.label),_.success(e("common.success"))):(await R(s.value.label),_.success(e("common.success"))),d.value=!1,y()}catch(a){console.error("Operation failed:",a),_.error(e("common.error"))}finally{g.value=!1}})},D=async n=>{try{await K.confirm(e("label.deleteConfirm"),e("common.tip"),{confirmButtonText:e("common.confirm"),cancelButtonText:e("common.cancel"),type:"warning"}),await S(n.id),_.success(e("common.success")),y()}catch(a){a!=="cancel"&&(console.error("Failed to delete label:",a),_.error(e("common.error")))}},E=()=>{m.value&&m.value.resetFields()};return O(()=>{y()}),(n,a)=>{const f=i("el-button"),h=i("el-table-column"),N=i("el-table"),F=i("el-input"),M=i("el-form-item"),T=i("el-form"),z=i("el-dialog"),I=H("loading");return C(),P("div",W,[x("div",X,[x("h2",null,u(o(e)("label.labelManagement")),1),l(f,{type:"primary",onClick:L},{default:t(()=>[b(u(o(e)("label.addLabel")),1)]),_:1})]),j((C(),J(N,{data:w.value,border:"",style:{width:"100%"}},{default:t(()=>[l(h,{prop:"id",label:"ID",width:"80"}),l(h,{prop:"label",label:o(e)("label.labelName")},null,8,["label"]),l(h,{label:o(e)("common.operation"),width:"200"},{default:t(({row:r})=>[l(f,{type:"primary",size:"small",onClick:U=>V(r)},{default:t(()=>[b(u(o(e)("common.edit")),1)]),_:2},1032,["onClick"]),l(f,{type:"danger",size:"small",onClick:U=>D(r)},{default:t(()=>[b(u(o(e)("common.delete")),1)]),_:2},1032,["onClick"])]),_:1},8,["label"])]),_:1},8,["data"])),[[I,v.value]]),l(z,{modelValue:d.value,"onUpdate:modelValue":a[2]||(a[2]=r=>d.value=r),title:p.value?o(e)("label.editLabel"):o(e)("label.addLabel"),width:"500px",onClose:E},{footer:t(()=>[l(f,{onClick:a[1]||(a[1]=r=>d.value=!1)},{default:t(()=>[b(u(o(e)("common.cancel")),1)]),_:1}),l(f,{type:"primary",onClick:B,loading:g.value},{default:t(()=>[b(u(o(e)("common.confirm")),1)]),_:1},8,["loading"])]),default:t(()=>[l(T,{ref_key:"formRef",ref:m,model:s.value,rules:k,"label-width":"100px"},{default:t(()=>[l(M,{label:o(e)("label.labelName"),prop:"label"},{default:t(()=>[l(F,{modelValue:s.value.label,"onUpdate:modelValue":a[0]||(a[0]=r=>s.value.label=r)},null,8,["modelValue"])]),_:1},8,["label"])]),_:1},8,["model"])]),_:1},8,["modelValue","title"])])}}}),ae=Q(Y,[["__scopeId","data-v-4b94eb96"]]);export{ae as default};
