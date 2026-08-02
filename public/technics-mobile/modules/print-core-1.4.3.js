(()=>{
  const scaleFor=(containerWidth,sheetWidth=794,padding=20,min=.3)=>Math.min(1,Math.max(min,(Number(containerWidth||0)-padding)/sheetWidth));
  const fit=(stage,sheet)=>{
    if(!stage||!sheet)return 1;
    sheet.style.zoom="1";
    const scale=scaleFor(stage.clientWidth);
    sheet.style.zoom=String(scale);
    stage.classList.add("previewfit");
    stage.scrollLeft=0;
    return scale;
  };
  const center=(stage,page)=>{
    if(!stage||!page)return 0;
    const stageRect=stage.getBoundingClientRect(),pageRect=page.getBoundingClientRect();
    const delta=((pageRect.left+pageRect.right)-(stageRect.left+stageRect.right))/2;
    stage.scrollLeft=Math.max(0,stage.scrollLeft+delta);
    return stage.scrollLeft;
  };
  window.TechnicsPrintCore=Object.freeze({scaleFor,fit,center,version:"1.4.3"});
  document.documentElement.dataset.printCore="1.4.3";
})();
