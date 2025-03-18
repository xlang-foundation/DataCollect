import{g as M,u as N,a as R,d as T}from"./zone-BezZfHLL.js";import{d as I,v as s,o as U,k as q,i as b,y as A,g as a,a as l,B as i,Q as O,c as Q,p as m,D as y,R as S,f as k,_ as j}from"./index-BCQt0Us0.js";import"./request-wLIDLjxB.js";const G={class:"zone-container"},H={class:"header"},J=I({__name:"index",setup(K){const f=s(!1),v=s(!1),r=s(!1),c=s(!1),g=s([]),d=s(),o=s({id:0,name:""}),w={name:[{required:!0,message:"请输入区域名称",trigger:"blur"}]},p=async()=>{try{f.value=!0;const t=await M();g.value=t}catch(t){console.error("Failed to fetch zones:",t)}finally{f.value=!1}},x=()=>{c.value=!1,o.value={id:0,name:""},r.value=!0},C=t=>{c.value=!0,o.value={...t},r.value=!0},V=async()=>{d.value&&await d.value.validate(async t=>{if(t)try{v.value=!0,c.value?(await N(o.value.id,o.value.name),y.success("更新成功")):(await R(o.value.name),y.success("添加成功")),r.value=!1,p()}catch(e){console.error("Operation failed:",e)}finally{v.value=!1}})},B=async t=>{try{await S.confirm(`确定要删除区域 "${t.name}" 吗？`,"警告",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}),await T(t.id),y.success("删除成功"),p()}catch(e){e!=="cancel"&&console.error("Failed to delete zone:",e)}},z=()=>{d.value&&d.value.resetFields()};return U(()=>{p()}),(t,e)=>{const u=i("el-button"),_=i("el-table-column"),D=i("el-table"),E=i("el-input"),Z=i("el-form-item"),F=i("el-form"),L=i("el-dialog"),$=O("loading");return k(),q("div",G,[b("div",H,[e[4]||(e[4]=b("h2",null,"区域管理",-1)),a(u,{type:"primary",onClick:x},{default:l(()=>e[3]||(e[3]=[m("添加区域")])),_:1})]),A((k(),Q(D,{data:g.value,border:"",style:{width:"100%"}},{default:l(()=>[a(_,{prop:"id",label:"ID",width:"80"}),a(_,{prop:"name",label:"区域名称"}),a(_,{label:"操作",width:"200"},{default:l(({row:n})=>[a(u,{type:"primary",size:"small",onClick:h=>C(n)},{default:l(()=>e[5]||(e[5]=[m(" 编辑 ")])),_:2},1032,["onClick"]),a(u,{type:"danger",size:"small",onClick:h=>B(n)},{default:l(()=>e[6]||(e[6]=[m(" 删除 ")])),_:2},1032,["onClick"])]),_:1})]),_:1},8,["data"])),[[$,f.value]]),a(L,{modelValue:r.value,"onUpdate:modelValue":e[2]||(e[2]=n=>r.value=n),title:c.value?"编辑区域":"添加区域",width:"500px",onClose:z},{footer:l(()=>[a(u,{onClick:e[1]||(e[1]=n=>r.value=!1)},{default:l(()=>e[7]||(e[7]=[m("取消")])),_:1}),a(u,{type:"primary",onClick:V,loading:v.value},{default:l(()=>e[8]||(e[8]=[m(" 确定 ")])),_:1},8,["loading"])]),default:l(()=>[a(F,{ref_key:"formRef",ref:d,model:o.value,rules:w,"label-width":"100px"},{default:l(()=>[a(Z,{label:"区域名称",prop:"name"},{default:l(()=>[a(E,{modelValue:o.value.name,"onUpdate:modelValue":e[0]||(e[0]=n=>o.value.name=n)},null,8,["modelValue"])]),_:1})]),_:1},8,["model"])]),_:1},8,["modelValue","title"])])}}}),Y=j(J,[["__scopeId","data-v-29fc2117"]]);export{Y as default};
