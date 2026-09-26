'use strict';
let data, origin=null;
const content=document.getElementById('content');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=slug=>data.entries.find(e=>e.slug===slug);
const url=(slug,keep=true)=>'?paso='+encodeURIComponent(slug)+(keep&&origin&&origin!==slug?'&desde='+encodeURIComponent(origin):'');
const button=(href,label)=>`<a class="button" href="${esc(href)}">${esc(label)}</a>`;
const descriptions={
 'datos-listos-para-calcular':'Pulsar Calcular liquidación. La app prepara el resultado de esta versión.',
 'revisar-resultado-de-liquidacion':'Revisar importes y abrir Ver cálculo para consultar su origen; después, pulsar Previsualizar PDF. El reporte y los valores para JDE proceden de la misma versión de la liquidación.',
 'pdf-generado-y-archivado':'Abrir el PDF o continuar a Valores para JDE. El PDF v1 queda en la carpeta y los valores para JDE se preparan a partir de esa misma versión.',
 'revisar-valores-para-jde':'Revisar los valores para JDE y abrir Ver disponibilidad para reservar una regla libre. La regla todavía no está reservada.',
 'esperar-resultado-de-jde':'Continuar otro trabajo y, cuando esté disponible el reporte, pulsar Importar COSTOS JD. El intento conserva la liquidación v1 y los valores utilizados en JDE.',
 'importar-resultado-costos-jd':'Seleccionar el archivo del intento, revisar OI y conceptos y confirmar la importación. La comparación utiliza la liquidación y los valores para JDE correspondientes a ese intento.',
 'registrar-revision-y-preparar-correccion':'Registrar la revisión y elegir revisar nuevamente los datos antes del segundo intento. La liquidación v2 conserva los importes esperados y el primer intento permanece en el historial.',
 'revalidar-la-liquidacion-para-el-segundo-intento':'Revisar nuevamente soportes y bases, confirmar la liquidación v2 y generar su PDF y sus valores para JDE. Los importes esperados se mantienen y la versión anterior queda en el historial.',
 'entrega-costeo':'Revisar la lista de documentos y pulsar Entregar a Costeo. Costeo recibe OI v3, SIA v2, preliquidación v2 y los mismos soportes; el seguimiento logístico puede continuar.',
 'devolucion-registrada':'Consultar la devolución o volver a la bandeja mientras Importaciones completa el soporte. Al recibir la nueva versión, revisar los documentos y retomar la preparación.',
 'distribuir-un-cargo-compartido':'Elegir el concepto y la base de reparto, revisar el cálculo preliminar, ajustar y confirmar la distribución. El cargo se aplica sin duplicar la factura ni su obligación de pago.',
 'agrupar-documentos-para-seguimiento':'Elegir de dónde tomar los documentos, seleccionar las facturas y asignar C$2,200.00 y C$800.00. Al crear el seguimiento, PAG-1017 reúne C$3,000.00 y conserva el importe asociado a cada factura.',
 'seguimiento-con-aprobacion-informada':'Revisar la aprobación registrada. Abrir Actualizar seguimiento cuando se confirme otro avance. El seguimiento permanece abierto y la factura no se marca como pagada.'
};
function brief(e){
 if(descriptions[e.slug])return descriptions[e.slug];
 let text=e.action;
 if((text+' '+e.result).length<245)text+=' '+e.result;
 return text.replace(/\bH1\b/g,'la liquidación').replace(/\bH2\b/g,'los valores para JDE').replace(/; las altas independientes y agrupadas son alternativas\./g,'.');
}
function index(e){
 return `<nav class="index" aria-label="Imágenes de la propuesta">${data.chapters.map(c=>`<details ${c.members.includes(e.slug)&&innerWidth>850?'open':''}><summary>${esc(c.title)}</summary>${c.members.map(s=>`<a class="${s===e.slug?'active':''}" href="${url(s,false)}">${esc(get(s).title)}</a>`).join('')}</details>`).join('')}</nav>`;
}
function show(e,large){
 document.title=e.title+' · Gestión de Compras';
 const primary=e.primary&&!origin;
 const next=origin&&e.primary?null:e.next;
 const back=get(origin&&e.primary?origin:e.returnTo);
 const previous=e.previous&&primary?button(url(e.previous),'← Anterior'):!primary&&back&&next&&back.slug!==next?button(url(back.slug),'← Volver'):' ';
 const continuation=next?button(url(next),primary?'Siguiente →':'Ver resultado →'):primary?button('?vista=fin','Finalizar →'):back?button(url(back.slug),'Volver al recorrido'):button('?','Volver al recorrido');
 const branch=!primary?`<div class="branch"><span>Alternativa</span>${origin?`<a href="${url(origin,false)}">Volver al recorrido</a>`:back?`<a href="${url(back.slug)}">Volver a ${esc(back.title.toLowerCase())}</a>`:''}</div>`:'';
 if(large){
  content.innerHTML=`<section class="viewer large"><header class="viewer-head"><div><h2>${esc(e.title)}</h2><p>${esc(brief(e))}</p></div><div class="large-tools">${button(url(e.slug),'← Volver')}<button class="button" id="zoom" aria-pressed="false">Tamaño original</button></div></header><div class="image-scroll"><img id="mockup-image" src="${esc(e.image)}" alt="${esc(e.title)}"></div></section>`;
  document.getElementById('zoom').onclick=ev=>{const on=document.querySelector('.large').classList.toggle('original');ev.currentTarget.textContent=on?'Ajustar al ancho':'Tamaño original';ev.currentTarget.setAttribute('aria-pressed',String(on));};return;
 }
 content.innerHTML=`<div class="layout">${index(e)}<section class="viewer">${branch}<header class="viewer-head"><div><h2>${esc(e.title)}</h2><p>${esc(brief(e))}</p></div><nav class="pager" aria-label="Cambiar imagen">${button(url(e.slug)+'&vista=ampliada','Ver grande ↗')}${previous}${continuation}</nav></header><div class="image-scroll"><img id="mockup-image" src="${esc(e.image)}" alt="${esc(e.title)}"></div><div class="caption"><span>${primary?'Recorrido principal':'Alternativa del recorrido'} · ${primary?`${data.primary.indexOf(e.slug)+1} de ${data.primary.length}`:'misma propuesta'}</span>${origin?`<a href="${url(origin,false)}">Volver al recorrido</a>`:''}</div>${e.alternatives.length?`<details class="variants"><summary>Otras opciones en este paso</summary><ul>${e.alternatives.map(s=>`<li><a href="?paso=${encodeURIComponent(s)}&desde=${encodeURIComponent(origin||e.slug)}">${esc(get(s).title)}</a></li>`).join('')}</ul></details>`:''}</section></div>`;
}
function finish(){
 document.title='Fin del recorrido · Gestión de Compras';
 content.innerHTML=`<section class="viewer summary"><h2>Fin del recorrido</h2><p>El expediente conserva documentos, responsables, versiones y gestiones. Pagos y Contabilidad mantienen sus espacios propios; las operaciones de JDE y Getpay continúan en esos sistemas.</p><p>La propuesta queda lista para revisión visual. Los cálculos y las operaciones reales se validarán cuando se construya la demo.</p><div class="pager">${button(url(data.primary.at(-1),false),'← Volver al último paso')}${button(url(data.primary[0],false),'Volver al inicio')}</div></section>`;
}
(async()=>{
 try{
  const response=await fetch('data/guide.json',{cache:'no-cache'});if(!response.ok)throw Error('No disponible');data=await response.json();
  const query=new URLSearchParams(location.search);const slug=query.get('paso')||data.primary[0];const view=query.get('vista');
  origin=get(query.get('desde'))&&query.get('desde')!==slug?query.get('desde'):null;
  if(view==='fin'||view==='sintesis')finish();else{const e=get(slug);if(!e)throw Error('Paso no encontrado');show(e,view==='ampliada');}
  document.body.dataset.ready='true';
 }catch(error){content.innerHTML='<section class="error"><h2>No se pudo abrir esta imagen</h2><p>Vuelve al recorrido para continuar.</p><a class="button" href="?">Abrir el recorrido</a></section>';document.body.dataset.error=error.message;}
})();
