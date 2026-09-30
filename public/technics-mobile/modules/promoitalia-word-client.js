// Browser-only, read-only DOCX export from the already loaded public plan.
(() => {
  'use strict';
  const clean = value => String(value ?? '').trim();
  const DATE = /^\d{4}-\d{2}-\d{2}$/;
  const xml = value => clean(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
  const date = value => `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}`;
  const qty = value => { const [whole, decimal] = String(Math.round(Number(value) * 1000) / 1000).split('.'); return whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (decimal ? `,${decimal}` : ''); };
  const key = row => `${clean(row.baseCode)}\u0000${clean(row.unit).toUpperCase()}`;
  const validNumber = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
  const roundUpTwoSignificantPieces = value => {
    const pieces = Math.ceil(value);
    if (pieces <= 0) return 0;
    const step = 10 ** Math.max(0, Math.floor(Math.log10(pieces)) - 1);
    return Math.ceil(pieces / step) * step;
  };
  const romeDay = (now = new Date()) => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  };

  const splitStockByKnownProduct=(()=>{
// Stock breakdown for a document preview. Linked rows prove an ERP lot reference,
// but r.QtaReale is demand, not a physical reservation. All numbers here are
// explicitly projected pieces, capped by actual positive stock per row/lot.
const clean=value=>String(value??'').trim();
const valid=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0;
const bad=code=>Object.assign(new Error(code),{code,status:503});
const almost=(a,b)=>Math.abs(a-b)<1e-6;

function splitStockByKnownProduct(stockRows,destinations,stockTotal){
 if(!Array.isArray(stockRows)||!Array.isArray(destinations)||!valid(stockTotal))throw bad('INVALID_STOCK_SPLIT_INPUT');
 const rows=[],byId=new Map();let sum=0;
 for(const source of stockRows){
  if(!valid(source.Quantity)||source.Quantity<=0)continue;
  const id=Number(source.StockRowId),lot=clean(source.Lot);
  if(!Number.isSafeInteger(id)||id<=0||byId.has(id))throw bad('DUPLICATE_OR_INVALID_STOCK_ROW');
  const row={id,lot,code:clean(source.Code),quantity:source.Quantity,remaining:source.Quantity,uses:new Map()};
  rows.push(row);byId.set(id,row);sum+=row.quantity;
 }
 if(!almost(sum,stockTotal))throw bad('STOCK_DETAIL_TOTAL_MISMATCH');
 const unique=[],seenMaterial=new Map();
 for(const d of destinations){
  if(!valid(d.Pieces)||d.Pieces<=0)continue;
  const id=Number(d.MaterialRowId),code=clean(d.ProductCode);
  if(Number.isSafeInteger(id)&&id>0){
   const fingerprint=JSON.stringify([code,clean(d.MaterialLot),d.Pieces,Boolean(d.AllocationVerified),d.StockRowId]);
   if(seenMaterial.has(id)){if(seenMaterial.get(id)!==fingerprint)throw bad('CONFLICTING_MATERIAL_ROW');continue}
   seenMaterial.set(id,fingerprint);
  }
  unique.push({...d,ProductCode:code,MaterialLot:clean(d.MaterialLot)});
 }
 unique.sort((a,b)=>clean(a.Date).localeCompare(clean(b.Date))||Number(a.MaterialRowId||0)-Number(b.MaterialRowId||0)||a.ProductCode.localeCompare(b.ProductCode));
 const demand=new Map(),totalDemand=new Map(),order=[];let unidentifiedDemandPieces=0;
 for(const d of unique){if(!d.ProductCode){unidentifiedDemandPieces+=d.Pieces;continue}if(!demand.has(d.ProductCode)){demand.set(d.ProductCode,0);totalDemand.set(d.ProductCode,0);order.push(d.ProductCode)}demand.set(d.ProductCode,demand.get(d.ProductCode)+d.Pieces);totalDemand.set(d.ProductCode,totalDemand.get(d.ProductCode)+d.Pieces)}
 const add=(row,code,pieces,kind)=>{
  if(pieces<=0)return;
  const use=row.uses.get(code)||{ProductCode:code,Pieces:0,LinkedPieces:0,ProjectedPieces:0};
  use.Pieces+=pieces;use[kind]+=pieces;row.uses.set(code,use);row.remaining-=pieces;demand.set(code,demand.get(code)-pieces);
 };
 // First honor exact ERP material-row → stock-row + lot evidence.
 for(const d of unique){
  if(!d.ProductCode||d.AllocationVerified!==true||!d.MaterialLot)continue;
  const row=byId.get(Number(d.StockRowId));
  if(!row||row.lot!==d.MaterialLot)continue;
  add(row,d.ProductCode,Math.min(d.Pieces,row.remaining,demand.get(d.ProductCode)), 'LinkedPieces');
 }
 // Remaining product demand is known through OV→OP, but its material lot is not.
 // Offer a deterministic, explicitly unverified split; never assert it is booked.
 for(const row of rows)for(const code of order){
  const pieces=Math.min(row.remaining,demand.get(code));
  add(row,code,pieces,'ProjectedPieces');
 }
 const lots=new Map();
 for(const row of rows){
  const key=row.code+'\0'+row.lot;
  if(!lots.has(key))lots.set(key,{Code:row.code,Lot:row.lot,Quantity:0,ProductUses:[],FreePieces:0,SourceStockRowIds:[]});
  const group=lots.get(key);group.Quantity+=row.quantity;group.FreePieces+=row.remaining;group.SourceStockRowIds.push(row.id);
  for(const use of row.uses.values()){
   let combined=group.ProductUses.find(x=>x.ProductCode===use.ProductCode);
   if(!combined){combined={ProductCode:use.ProductCode,Pieces:0,LinkedPieces:0,ProjectedPieces:0};group.ProductUses.push(combined)}
   combined.Pieces+=use.Pieces;combined.LinkedPieces+=use.LinkedPieces;combined.ProjectedPieces+=use.ProjectedPieces;
  }
 }
 const result=[...lots.values()];
 for(const lot of result){
  if(!almost(lot.ProductUses.reduce((n,x)=>n+x.Pieces,0)+lot.FreePieces,lot.Quantity))throw bad('STOCK_SPLIT_OVERALLOCATION');
 }
 const products=order.map(code=>{const pieces=result.flatMap(lot=>lot.ProductUses).filter(use=>use.ProductCode===code).reduce((n,use)=>n+use.Pieces,0),uncovered=demand.get(code);if(!almost(pieces+uncovered,totalDemand.get(code)))throw bad('PRODUCT_DEMAND_NOT_CONSERVED');return{ProductCode:code,DemandPieces:totalDemand.get(code),ProjectedStockPieces:pieces,UncoveredPieces:uncovered}});
 return{lots:result,products,unidentifiedDemandPieces};
}

return splitStockByKnownProduct;})();
  const buildPromoitaliaSnapshot=(()=>{
// Server counterpart of the approved424 quantity rule; compare with browser oracle in tests.
const clean=v=>String(v??'').trim(),valid=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
const bad=(code,status=400)=>Object.assign(new Error(code),{code,status});
function roundUpTwoSignificantPieces(value){const pieces=Math.ceil(value);if(pieces<=0)return 0;const step=10**Math.max(0,Math.floor(Math.log10(pieces))-1);return Math.ceil(pieces/step)*step}
function buildPromoitaliaSnapshot(plan,selection,documentDate){
 if(plan?.client?.id!==8785||plan.dataAuthority!=='Technics'||plan.readOnly!==true||!Array.isArray(plan.items))throw bad('UNVERIFIED_SOURCE',503);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(documentDate)||!Array.isArray(selection)||!selection.length||selection.length>250)throw bad('INVALID_SELECTION');
 const available=new Map(plan.items.map(item=>[clean(item.baseCode)+'\0'+clean(item.unit).toUpperCase(),item])),seen=new Set();
 const rows=selection.map(chosen=>{const key=clean(chosen?.baseCode)+'\0'+clean(chosen?.unit).toUpperCase();if(seen.has(key))throw bad('DUPLICATE_SELECTION');seen.add(key);if(chosen?.finalQuantity!==undefined)throw bad('UNSUPPORTED_OVERRIDE');const item=available.get(key);if(!item)throw bad('STALE_SELECTION',409);
  const due=(item.schedule||[]).filter(e=>/^\d{4}-\d{2}-\d{2}$/.test(clean(e.requestedDate))&&e.requestedDate>=documentDate);
  if(!due.length)throw bad('NO_FUTURE_DELIVERY');if(!due.every(e=>valid(e.requiredQuantity)&&e.requiredQuantity>0&&Array.isArray(e.ovNumbers)&&e.ovNumbers.length))throw bad('INVALID_DELIVERY');
  const required=due.reduce((n,e)=>n+e.requiredQuantity,0),stock=item.onHandQuantity;if(!valid(required)||!valid(stock))throw bad('INVALID_QUANTITY',503);
  const missing=Math.max(0,required-stock),margin=stock-required,proposal=clean(item.unit).toUpperCase()==='PZ'?(margin>1000?0:margin>=0?1000:roundUpTwoSignificantPieces(missing)+1000):missing;
  let remaining=stock,firstShortageDate='';for(const entry of due){const consumed=Math.min(remaining,entry.requiredQuantity);remaining-=consumed;if(!firstShortageDate&&entry.requiredQuantity>consumed)firstShortageDate=entry.requestedDate}
  const deliveries=due.map(e=>({Date:e.requestedDate,OV:[...new Set(e.ovNumbers.map(clean).filter(Boolean))],Required:e.requiredQuantity}));if(deliveries.some(e=>!e.OV.length||e.OV.some(ov=>/^OP/i.test(ov))))throw bad('INVALID_OV');
  const destinations=(item.destinations||[]).filter(e=>/^\d{4}-\d{2}-\d{2}$/.test(clean(e.requestedDate))&&e.requestedDate>=documentDate&&valid(e.requiredPieces)&&e.requiredPieces>0).map(e=>({
    MaterialRowId:e.materialRowId==null?null:Number(e.materialRowId),ProductCode:clean(e.productCode),ProductLot:clean(e.productLot),MaterialLot:clean(e.materialLot),Pieces:e.requiredPieces,
    AllocationVerified:e.allocationVerified===true,StockRowId:e.stockRowId==null?null:Number(e.stockRowId),Date:e.requestedDate,
  }));
  const stockRows=(item.stockRows||[]).filter(e=>valid(e.quantity)&&e.quantity>0).map(e=>({
    Code:clean(e.code),Lot:clean(e.lot),Quantity:e.quantity,StockRowId:Number(e.stockRowId),
  }));
  const split=splitStockByKnownProduct(stockRows,destinations,stock);
  return{Code:clean(item.baseCode),Description:clean(item.descriptions?.[0]),Unit:clean(item.unit),Required:required,Stock:stock,Missing:missing,
    FirstShortageDate:firstShortageDate,FinalQuantity:proposal,StockRows:split.lots,ProductDemand:split.products,
    UnidentifiedDemandPieces:split.unidentifiedDemandPieces,Destinations:destinations,Deliveries:deliveries};
 });return{documentType:'PACKAGING_PROMOITALIA',documentDate,client:'PROMOITALIA GROUP SPA',rows};
}

return buildPromoitaliaSnapshot;})();
  function buildSnapshot(items,selected,documentDate=romeDay()) {
    if(!Array.isArray(items)||!(selected instanceof Set)||!selected.size)throw Error('Selezione non valida.');
    const selection=[...selected].map(key=>{const [baseCode,unit]=key.split('\u0000');return{baseCode,unit}});
    return buildPromoitaliaSnapshot({client:{id:8785},dataAuthority:'Technics',readOnly:true,items},selection,documentDate);
  }

  const field = (value, bold = false, size = 19) => `<w:r><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="${size}"/>${bold ? '<w:b/>' : ''}</w:rPr><w:t xml:space="preserve">${xml(value)}</w:t></w:r>`;
  const paragraph = (value, { bold = false, size = 19, align = 'left', after = 0 } = {}) => `<w:p><w:pPr><w:spacing w:after="${after}"/><w:jc w:val="${align}"/></w:pPr>${field(value, bold, size)}</w:p>`;
  const cell = (value, width, { span = 0, fill = 'FFFFFF', bold = false, size = 19, align = 'left' } = {}) => `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${span ? `<w:gridSpan w:val="${span}"/>` : ''}<w:shd w:fill="${fill}"/><w:tcMar><w:top w:w="100" w:type="dxa"/><w:left w:w="95" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:right w:w="95" w:type="dxa"/></w:tcMar></w:tcPr>${paragraph(value, { bold, size, align })}</w:tc>`;
  const row = (cells, header = false) => `<w:tr><w:trPr><w:cantSplit/>${header ? '<w:tblHeader/>' : ''}</w:trPr>${cells.join('')}</w:tr>`;
  const widths = [1500, 4000, 1650, 1650, 1650, 2700, 1830], total = widths.reduce((a, b) => a + b, 0);
  function documentXml(payload) {
    if (payload?.documentType !== 'PACKAGING_PROMOITALIA' || !DATE.test(payload.documentDate) || !Array.isArray(payload.rows) || !payload.rows.length || payload.rows.length > 250) throw Error('Documento non valido.');
    const label = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${payload.documentDate}T12:00:00Z`));
    const header = row(['Codice', 'Articolo / OV', 'Necessari', 'Giacenza', 'Mancanti', 'Pezzi mancanti già per la consegna del', 'Pz minimi da inviare ad IRA'].map((name, index) => cell(name, widths[index], { bold: true, fill: 'E8EEEC', size: 18, align: 'center' })), true);
    const entries = payload.rows.map((item, index) => {
      if (!clean(item.Code) || ![item.Required, item.Stock, item.Missing, item.FinalQuantity].every(validNumber) || item.Missing !== Math.max(0, item.Required - item.Stock) || !Array.isArray(item.Deliveries) || !item.Deliveries.length) throw Error('Riga non valida.');
      const fill = index % 2 ? 'F7FAF8' : 'FFFFFF';
      const values = [item.Code, item.Description, `${qty(item.Required)} ${item.Unit}`, `${qty(item.Stock)} ${item.Unit}`, `${qty(item.Missing)} ${item.Unit}`, item.FirstShortageDate?date(item.FirstShortageDate):'—', `${qty(item.FinalQuantity)} ${item.Unit}`];
      const main = row(values.map((value, column) => cell(value, widths[column], { fill, bold: column === 0 || column === 6, align: 'center' })));
      const stock = (item.StockRows || []).flatMap(entry => {
        const parts=(entry.ProductUses||[]).map(use=>{const evidence=use.LinkedPieces&&use.ProjectedPieces?` (${qty(use.LinkedPieces)} collegati + ${qty(use.ProjectedPieces)} previsti)`:use.LinkedPieces?' (collegati)':' (previsti)';return `${use.ProductCode||'Prodotto da verificare'} · lotto ${entry.Lot||'—'} · ${qty(use.Pieces)} ${item.Unit}${evidence}`});
        if(entry.FreePieces>0)parts.push(`${qty(entry.FreePieces)} ${item.Unit} liberi`);
        return [row([cell(parts.join('; ')||`Lotto ${entry.Lot||'—'} · ${qty(entry.Quantity)} ${item.Unit} liberi`,total,{span:7,fill,size:17})])];
      }).join('');
      const productDemand=(item.ProductDemand||[]).filter(entry=>entry.UncoveredPieces>0).map(entry=>row([cell(`${entry.ProductCode} · domanda ${qty(entry.DemandPieces)} ${item.Unit} · da ricevere ${qty(entry.UncoveredPieces)} ${item.Unit}`,total,{span:7,fill,size:17})])).join('');
      const stockNote=row([cell('Previsti = ripartizione prevista; lotto materiale da confermare.',total,{span:7,fill,size:16})]);
      const deliveries = item.Deliveries.map(entry => {
        if (!DATE.test(entry.Date) || entry.Date < payload.documentDate || !validNumber(entry.Required) || !entry.Required || !Array.isArray(entry.OV) || !entry.OV.length) throw Error('Consegna non valida.');
        return row([cell(`${date(entry.Date)}  ·  OV ${entry.OV.join(', ')}  ·  ${qty(entry.Required)} ${item.Unit}`, total, { span: 7, fill, size: 17 })]);
      }).join('');
      if (Math.abs(item.Deliveries.reduce((sum, entry) => sum + entry.Required, 0) - item.Required) > 0.001) throw Error('Totale consegne non coerente.');
      return main + stock + productDemand + stockNote + deliveries;
    }).join('');
    const table = `<w:tbl><w:tblPr><w:tblW w:w="${total}" w:type="dxa"/><w:jc w:val="center"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D9D9D9"/><w:bottom w:val="single" w:sz="4" w:color="D9D9D9"/><w:insideH w:val="single" w:sz="4" w:color="D9D9D9"/><w:insideV w:val="single" w:sz="4" w:color="D9D9D9"/></w:tblBorders></w:tblPr><w:tblGrid>${widths.map(width => `<w:gridCol w:w="${width}"/>`).join('')}</w:tblGrid>${header}${entries}</w:tbl>`;
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraph(label, { bold: true, size: 30, after: 100 })}${paragraph(payload.client, { bold: true, size: 20, after: 180 })}${table}<w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="800" w:right="840" w:bottom="800" w:left="840" w:header="0" w:footer="0"/></w:sectPr></w:body></w:document>`;
  }

  const crcTable = Array.from({ length: 256 }, (_, index) => { let crc = index; for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1; return crc >>> 0; });
  const crc32 = bytes => { let crc = 0xffffffff; for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; };
  function zip(files) {
    const encoder = new TextEncoder(), local = [], central = []; let offset = 0;
    for (const [name, source] of Object.entries(files)) {
      const data = encoder.encode(source), filename = encoder.encode(name), crc = crc32(data);
      const head = new Uint8Array(30 + filename.length), h = new DataView(head.buffer);
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, filename.length, true); head.set(filename, 30);
      local.push(head, data);
      const entry = new Uint8Array(46 + filename.length), e = new DataView(entry.buffer);
      e.setUint32(0, 0x02014b50, true); e.setUint16(4, 20, true); e.setUint16(6, 20, true); e.setUint32(16, crc, true); e.setUint32(20, data.length, true); e.setUint32(24, data.length, true); e.setUint16(28, filename.length, true); e.setUint32(42, offset, true); entry.set(filename, 46);
      central.push(entry); offset += head.length + data.length;
    }
    const end = new Uint8Array(22), view = new DataView(end.buffer), centralSize = central.reduce((sum, entry) => sum + entry.length, 0);
    view.setUint32(0, 0x06054b50, true); view.setUint16(8, central.length, true); view.setUint16(10, central.length, true); view.setUint32(12, centralSize, true); view.setUint32(16, offset, true);
    const result = new Uint8Array(offset + centralSize + end.length); let position = 0;
    for (const part of [...local, ...central, end]) { result.set(part, position); position += part.length; }
    return result;
  }
  function renderDocx(payload) {
    const bytes = zip({
      '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
      '_rels/.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
      'word/document.xml': documentXml(payload),
    });
    return { bytes, fileName: `Promoitalia-${payload.documentDate}.docx`, contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  }
  function download(payload) {
    if (payload.documentDate !== romeDay()) throw Error('È cambiato il giorno: aggiornare l’anteprima.');
    const doc = renderDocx(payload), url = URL.createObjectURL(new Blob([doc.bytes], { type: doc.contentType })), link = document.createElement('a');
    link.href = url; link.download = doc.fileName; link.hidden = true; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
    return doc;
  }
  window.PromoitaliaWordClient = Object.freeze({ buildSnapshot, renderDocx, download, romeDay });
})();
