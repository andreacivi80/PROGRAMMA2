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

  function buildSnapshot(items, selected, documentDate = romeDay()) {
    if (!DATE.test(documentDate) || !Array.isArray(items) || !(selected instanceof Set) || selected.size < 1 || selected.size > 250) throw Error('Selezione Word non valida.');
    const available = new Map(items.map(item => [key(item), item]));
    const rows = [...selected].map(itemKey => {
      const item = available.get(itemKey);
      if (!item || !clean(item.baseCode) || !clean(item.unit)) throw Error('Selezione non presente nel piano Technics.');
      const due = (item.schedule || []).filter(entry => DATE.test(clean(entry.requestedDate)) && entry.requestedDate >= documentDate);
      if (!due.length) throw Error(`Nessuna consegna futura per ${item.baseCode}.`);
      if (!due.every(entry => validNumber(entry.requiredQuantity) && entry.requiredQuantity > 0 && Array.isArray(entry.ovNumbers) && entry.ovNumbers.length)) throw Error('Consegna OV non valida.');
      const required = due.reduce((sum, entry) => sum + entry.requiredQuantity, 0);
      const stock = item.onHandQuantity;
      if (!validNumber(required) || !validNumber(stock)) throw Error('Quantità Technics non valida.');
      const missing = Math.max(0, required - stock), margin = stock - required;
      const proposal = clean(item.unit).toUpperCase() === 'PZ' ? (margin > 1000 ? 0 : margin >= 0 ? 1000 : roundUpTwoSignificantPieces(missing) + 1000) : missing;
      let remaining=stock,firstShortageDate='';for(const entry of due){const consumed=Math.min(remaining,entry.requiredQuantity);remaining-=consumed;if(!firstShortageDate&&entry.requiredQuantity>consumed)firstShortageDate=entry.requestedDate}
      const deliveries = due.map(entry => ({ Date: entry.requestedDate, OV: [...new Set(entry.ovNumbers.map(clean).filter(Boolean))], Required: entry.requiredQuantity }));
      if (deliveries.some(entry => !entry.OV.length || entry.OV.some(ov => /^OP/i.test(ov)))) throw Error('Riferimento OV non valido.');
      const destinations=(item.destinations||[]).filter(entry=>DATE.test(clean(entry.requestedDate))&&entry.requestedDate>=documentDate&&validNumber(entry.requiredPieces)&&entry.requiredPieces>0).map(entry=>({
        ProductCode:clean(entry.productCode),ProductLot:clean(entry.productLot),MaterialLot:clean(entry.materialLot),Pieces:entry.requiredPieces,
        AllocationVerified:entry.allocationVerified===true,StockRowId:entry.stockRowId==null?null:Number(entry.stockRowId),Date:entry.requestedDate,
      }));
      const stockRows=(item.stockRows||[]).filter(entry=>validNumber(entry.quantity)&&entry.quantity>0).map(entry=>({
        Lot:clean(entry.lot),Quantity:entry.quantity,
        Uses:destinations.filter(d=>d.AllocationVerified&&d.StockRowId===Number(entry.stockRowId)&&d.MaterialLot===clean(entry.lot)).map(d=>({ProductCode:d.ProductCode,ProductLot:d.ProductLot,MaterialLot:d.MaterialLot,Pieces:d.Pieces})),
      }));
      return { Code:clean(item.baseCode), Description:clean(item.descriptions?.[0]), Unit:clean(item.unit), Required:required, Stock:stock, Missing:missing,
        FirstShortageDate:firstShortageDate,FinalQuantity:proposal,StockRows:stockRows,Destinations:destinations,Deliveries:deliveries };
    });
    return { documentType: 'PACKAGING_PROMOITALIA', documentDate, client: 'PROMOITALIA GROUP SPA', rows };
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
        const uses=new Map();for(const use of entry.Uses||[]){const id=`${use.ProductCode}\0${use.MaterialLot}`,group=uses.get(id)||{code:use.ProductCode,lot:use.MaterialLot,pieces:0};group.pieces+=use.Pieces;uses.set(id,group)}
        const lines=!uses.size?[`Lotto confezione ${entry.Lot||'—'} · giacenza ${qty(entry.Quantity)} ${item.Unit}; destinazione non assegnata`]:uses.size===1?(()=>{const use=[...uses.values()][0];return [`Prodotto ${use.code||'non verificato'} · lotto confezione ${use.lot} · giacenza ${qty(entry.Quantity)} ${item.Unit} (${qty(use.pieces)} previsti)`]})():[`Lotto confezione ${entry.Lot||'—'} · giacenza ${qty(entry.Quantity)} ${item.Unit}`,...[...uses.values()].map(use=>`Prodotto ${use.code||'non verificato'} · lotto confezione ${use.lot} · ${qty(use.pieces)} ${item.Unit} previsti`)];
        return lines.map(line=>row([cell(line,total,{span:7,fill,size:17})]));
      }).join('');
      const deliveries = item.Deliveries.map(entry => {
        if (!DATE.test(entry.Date) || entry.Date < payload.documentDate || !validNumber(entry.Required) || !entry.Required || !Array.isArray(entry.OV) || !entry.OV.length) throw Error('Consegna non valida.');
        return row([cell(`${date(entry.Date)}  ·  OV ${entry.OV.join(', ')}  ·  ${qty(entry.Required)} ${item.Unit}`, total, { span: 7, fill, size: 17 })]);
      }).join('');
      if (Math.abs(item.Deliveries.reduce((sum, entry) => sum + entry.Required, 0) - item.Required) > 0.001) throw Error('Totale consegne non coerente.');
      return main + stock + deliveries;
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
