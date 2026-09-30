(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const format = value => new Intl.NumberFormat('it-IT', {maximumFractionDigits: 3}).format(value);
  const printDate = () => new Intl.DateTimeFormat('it-IT', {weekday:'long',day:'2-digit',month:'long',year:'numeric',timeZone:'Europe/Rome'}).format(new Date());
  const api = async url => {
    const {response,payload} = await globalThis.TechnicsDataClient.fetchJson(`${globalThis.__technicsBridgeUrl}${url}`, {cache:'no-store', headers:{'Cache-Control':'no-store'}}, {attempts:1,cacheMs:0});
    if (!response.ok || payload?.ok !== true) throw Error(payload?.error || 'Dati Technics temporaneamente non disponibili.');
    return payload;
  };
  const combineReports = reports => {
    if (!reports.length) return null;
    const articles = new Map(), stockRows = new Map(), clients = reports.map(report => report.client);
    for (const report of reports) {
      if (report.readOnly !== true || report.dataAuthority !== 'Technics' || !Array.isArray(report.rows) || !Array.isArray(report.catalog?.articles)) throw Error('Inventario non qualificato.');
      for (const article of report.catalog.articles) {
        const existing = articles.get(article.articleId);
        if (existing) {
          if (existing.code !== article.code || existing.description !== article.description || existing.unit !== article.unit) throw Error('Anagrafica articolo discordante.');
          existing.linkedClients.push(report.client.name);
          existing.hasPositiveStock ||= article.hasPositiveStock;
        } else articles.set(article.articleId, {...article, ownerName:report.client.name, linkedClients:[report.client.name]});
      }
      for (const row of report.rows) {
        if (!Number.isSafeInteger(row.stockRowId) || row.stockRowId <= 0 || !Number.isFinite(row.quantity) || row.quantity <= 0 || !articles.has(row.articleId)) throw Error('Riga stock non qualificata.');
        const existing = stockRows.get(row.stockRowId);
        if (existing) {
          if (existing.articleId !== row.articleId || existing.quantity !== row.quantity || existing.unit !== row.unit || existing.lot !== row.lot || existing.location !== row.location) throw Error('Riga stock discordante.');
        } else stockRows.set(row.stockRowId, {...row});
      }
    }
    const catalogArticles = [...articles.values()], rows = [...stockRows.values()];
    const positive = new Set(rows.map(row => row.articleId));
    for (const article of catalogArticles) article.hasPositiveStock = positive.has(article.articleId);
    return {client:{name:clients.map(client => client.name).join(' + ')},clients,rows,articleCount:positive.size,
      catalog:{articles:catalogArticles,articleCount:catalogArticles.length,withoutPositiveStockCount:catalogArticles.length-positive.size},
      readAt:reports.map(report => report.readAt).sort().at(-1),dataAuthority:'Technics',readOnly:true,
      sharedArticleCount:catalogArticles.filter(article => article.linkedClients.length > 1).length};
  };
  const previewHtml = (report, showZero = false) => {
    const byArticle = new Map();
    for (const row of report.rows) {const entries = byArticle.get(row.articleId) || []; entries.push(row); byArticle.set(row.articleId, entries)}
    const visibleArticles = showZero ? report.catalog.articles : report.catalog.articles.filter(article => article.hasPositiveStock);
    const multipleClients = report.clients.length > 1;
    let lastOwner = '';
    const rows = visibleArticles.flatMap(article => {
      const heading = multipleClients && article.ownerName !== lastOwner ? [`<tr class="clientgroup" data-client-heading="${escape(article.ownerName)}"><th colspan="4">${escape(article.ownerName)}</th></tr>`] : [];
      lastOwner = article.ownerName;
      const stock = byArticle.get(article.articleId) || [];
      const shared = article.linkedClients.length > 1 ? `<small class="shared">Condiviso con ${escape(article.linkedClients.slice(1).join(', '))}; mostrato una volta</small>` : '';
      if (!stock.length) return [...heading,`<tr data-no-positive-stock="true" data-owner="${escape(article.ownerName)}"><td><b>${escape(article.code)}</b><small>${escape(article.description)}</small>${shared}<small class="nostock">Nessuna giacenza positiva</small></td><td></td><td></td><td></td></tr>`];
      const lots = new Map();
      for (const row of stock) {
        // The exact lot string is significant: leading zeroes are never normalized.
        const key = `${row.articleId}\u0000${row.lot}`;
        if (!lots.has(key)) lots.set(key, []);
        lots.get(key).push(row);
      }
      return [...heading,...[...lots.values()].map((lotRows,index) => {
        const first=lotRows[0];
        const locations=lotRows.map(row=>`<span class="stocklocation" style="display:block;min-height:1.4em" data-stock-row-id="${escape(row.stockRowId)}">${escape(row.location) || '—'}</span>`).join('');
        const quantities=lotRows.map(row=>`<span class="stockquantity" style="display:block;min-height:1.4em" data-stock-row-id="${escape(row.stockRowId)}">${format(row.quantity)} ${escape(row.unit)}</span>`).join('');
        return `<tr data-stock-row="true" data-stock-lot="${escape(first.lot)}" data-owner="${escape(article.ownerName)}"><td><b>${escape(first.code)}</b><small>${escape(first.description)}</small>${index===0?shared:''}</td><td>${escape(first.lot) || '—'}</td><td>${locations}</td><td>${quantities}</td></tr>`;
      })];
    }).join('');
    return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Inventario clienti · ${escape(report.client.name)}</title><style>*{box-sizing:border-box}body{margin:0;padding:18px;font:12px system-ui,sans-serif;color:#173e35}header{border-bottom:2px solid #17624d;padding-bottom:10px}h1{margin:0 0 5px;font-size:23px}header strong{font-size:15px}p{margin:5px 0}table{width:100%;border-collapse:collapse;table-layout:fixed;margin-top:14px}th,td{text-align:center;padding:8px;border-bottom:1px solid #dce7df;overflow-wrap:anywhere;vertical-align:top}th{background:#e9f4ee}th:first-child{width:43%;text-align:left}td:first-child{text-align:left}th:nth-child(2){width:18%}th:nth-child(3){width:19%}th:nth-child(4){width:20%}td:last-child{text-align:center;white-space:nowrap}small{display:block;color:#617168}.shared{color:#17624d;font-weight:700}.clientgroup th{background:#dceee2;color:#174d40;font-size:13px;text-align:left}.nostock{color:#8b5b18;font-weight:800}.note{font-size:10px;color:#5d7066;margin-top:14px}@media screen and (max-width:600px){body{padding:8px}table,tbody{display:block;width:100%;font-size:12px}thead{display:none}tr.clientgroup{display:block;margin:12px 0 4px}tr.clientgroup th{display:block;width:100%;padding:8px}tr[data-stock-row]{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 5px;margin:0 0 7px;border:1px solid #dce7df;border-radius:8px;padding:6px;break-inside:avoid}tr[data-stock-row] td{min-width:0;display:block;padding:4px 2px;border:0;text-align:left;overflow-wrap:anywhere}tr[data-stock-row] td:first-child{grid-column:1/-1;border-bottom:1px solid #e5eee8;padding-bottom:6px}tr[data-stock-row] td:not(:first-child):before{display:block;margin-bottom:3px;color:#617168;font-size:10px;font-weight:800}tr[data-stock-row] td:nth-child(2):before{content:"Lotto"}tr[data-stock-row] td:nth-child(3):before{content:"Ubicazione"}tr[data-stock-row] td:nth-child(4):before{content:"Giacenza"}tr[data-stock-row] td:last-child{white-space:normal}tr[data-no-positive-stock]{display:block;padding:7px;border-bottom:1px solid #dce7df}tr[data-no-positive-stock] td{display:block;width:100%;border:0}}@page{size:A4 portrait;margin:12mm}@media print{body{padding:0}thead{display:table-header-group}table{display:table}tbody{display:table-row-group}tr{display:table-row;break-inside:avoid;border:0}td{display:table-cell;border-bottom:1px solid #dce7df;padding:2px 5px;line-height:1.2}td:before{display:none}.clientgroup{break-after:avoid}}</style></head><body><header><h1>Inventario clienti</h1><strong>${escape(report.client.name)}</strong><p>${printDate()}</p><p>${showZero ? `${report.catalog.articleCount} articoli associati · ${report.articleCount} con giacenza positiva · ${report.catalog.withoutPositiveStockCount} senza giacenza positiva` : `${report.articleCount} articoli con giacenza positiva`}</p><p>${report.rows.length} righe positive</p>${report.sharedArticleCount ? `<p>${report.sharedArticleCount} articoli collegati a più clienti; mostrati una sola volta.</p>` : ''}</header><table><thead><tr><th>Articolo</th><th>Lotto</th><th>Ubicazione</th><th>Giacenza</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  };
  function install() {
    if (document.getElementById('customerInventoryLauncher')) return;
    const anchor = document.getElementById('inventoryItemOptimization');
    if (!anchor?.parentElement) return false;
    const launcher = document.createElement('section');
    launcher.id = 'customerInventoryLauncher';
    launcher.className = 'customerinventorylauncher';
    launcher.innerHTML = '<button type="button" id="customerInventoryOpen"><span>▦</span><b>Inventario clienti</b><small>Giacenze positive per fornitore Technics</small><i>›</i></button>';
    anchor.insertAdjacentElement('beforebegin', launcher);
    const style = document.createElement('style');
    style.textContent = '.customerinventorylauncher{margin:8px 0}.shell:not([data-workspace="inventory"]) .customerinventorylauncher{display:none}.customerinventorylauncher>button{width:100%;min-height:48px;display:grid;grid-template-columns:30px 1fr auto;grid-template-rows:auto auto;align-items:center;gap:1px 8px;padding:7px 9px;border:1px solid #c4d8cf;border-radius:11px;background:#f8fbf9;color:#174d40;text-align:left}.customerinventorylauncher span{grid-row:1/3}.customerinventorylauncher b{font-size:11px}.customerinventorylauncher small{font-size:8px}.customerinventorylauncher i{grid-column:3;grid-row:1/3;font-style:normal}.customerinventoryoverlay{position:fixed;z-index:2147482550;inset:0;display:grid;place-items:center;padding:9px;background:#10251fd9}.customerinventoryoverlay[hidden]{display:none}.customerinventorycard{width:min(920px,100%);height:min(94svh,1000px);display:grid;grid-template-rows:auto auto auto 1fr auto;overflow:hidden;border-radius:14px;background:#fff;color:#173e35}.customerinventorycard header,.customerinventorycard footer{display:flex;align-items:center;gap:8px;padding:10px;background:#edf5f1}.customerinventorycard header strong{flex:1}.customerinventorycard button{min-height:40px}.customerinventorycard input{min-height:42px;width:calc(100% - 20px);margin:10px;border:1px solid #a9c5b6;border-radius:8px;padding:8px;font-size:16px}.customerinventorychoices{display:flex;gap:5px;overflow:auto;padding:0 10px 8px}.customerinventorychoices button{flex:0 0 auto;border:1px solid #c4d8cf;border-radius:8px;background:#fff;padding:6px 10px}.customerinventorycard iframe{width:100%;height:100%;border:0;background:#fff}.customerinventorycard footer span{flex:1;font-size:11px}.customerinventorycard footer button{border:1px solid #adc9ba;border-radius:8px;background:#fff;color:#174d40;padding:0 12px}@media(max-width:390px){.customerinventorycard header{padding:8px}.customerinventorycard footer{flex-wrap:wrap}}';
    style.textContent += '.customerinventorycard{grid-template-rows:auto auto auto auto auto auto 1fr auto}.customerinventoryfavorites,.customerinventoryselected{display:flex;gap:6px;flex-wrap:wrap;padding:0 10px 8px}.customerinventoryselected:empty{display:none}.customerinventoryfavorites button,.customerinventoryselected button{border:1px solid #b3cdbf;border-radius:8px;background:#eaf5ee;color:#174d40;padding:4px 9px;font-size:11px;font-weight:700}.customerinventoryfavorites button[aria-pressed="true"],.customerinventorychoices button[aria-pressed="true"],.customerinventoryselected button{background:#17624d;color:#fff;border-color:#17624d}.customerinventoryfavorites button[aria-pressed="true"]:before,.customerinventorychoices button[aria-pressed="true"]:before{content:"✓ ";font-weight:900}.customerinventorycard .customerinventorytoggle{display:flex;align-items:center;gap:7px;padding:0 10px 8px;font-size:12px;font-weight:700}.customerinventorycard .customerinventorytoggle input{width:18px;height:18px;min-height:18px;margin:0;padding:0;accent-color:#17624d}';
    style.textContent += '.customerinventoryreadonly{color:#17624d;font-size:9px;font-weight:900;white-space:nowrap}.customerinventorycard{height:auto;max-height:94svh;display:flex;flex-direction:column;overflow:auto}.customerinventorycard header,.customerinventorycard footer{flex:0 0 auto}.customerinventorycard header [data-close],.customerinventorypreviewcard [data-preview-close]{box-sizing:border-box;flex:0 0 32px;width:32px;height:32px;margin-left:auto;padding:0;border:0;border-radius:50%;background:#dce8e2;color:#174d40;font:700 20px/1 Arial,sans-serif;display:grid;place-items:center}.customerinventorychoices{flex:0 1 auto;max-height:25svh}.customerinventorycard footer{min-height:52px}.customerinventorypreview{position:fixed;z-index:2147482560;inset:0;display:grid;place-items:center;padding:9px;background:#10251fe8}.customerinventorypreview[hidden]{display:none}.customerinventorypreviewcard{box-sizing:border-box;width:min(920px,100%);height:min(94svh,1000px);display:grid;grid-template-rows:auto minmax(0,1fr);overflow:hidden;border-radius:14px;background:#fff;color:#173e35;box-shadow:0 18px 70px #0007}.customerinventorypreviewcard>header{display:flex;align-items:center;gap:8px;padding:9px 10px;background:#edf5f1}.customerinventorypreviewcard>header strong{flex:1;font-size:14px}.customerinventorypreviewcard iframe{width:100%;height:100%;border:0;background:#fff}@media(max-width:390px){.customerinventorypreview{padding:0}.customerinventorypreviewcard{height:100svh;border-radius:0}}';
    style.textContent += '.customerinventorypreviewcard{height:auto;max-height:94svh;display:flex;flex-direction:column}.customerinventorypreviewcard iframe{flex:0 1 auto;height:120px;min-height:120px;max-height:72svh}@media(max-width:390px){.customerinventorypreviewcard{height:auto;max-height:100svh;border-radius:0}}.customerinventoryresult{min-height:160px;flex:1 1 auto;overflow:hidden;margin:0 10px 8px;border:1px solid #c4d8cf;border-radius:9px}.customerinventoryresult[hidden]{display:none}.customerinventoryresult iframe{width:100%;min-height:160px;height:42svh;display:block}';
    style.textContent += '.customerinventorycard header [data-close],.customerinventorypreviewcard [data-preview-close]{min-width:32px;max-width:32px;min-height:32px;max-height:32px;flex:0 0 32px;aspect-ratio:1}.customerinventoryserverpages{overflow:auto;min-height:160px;max-height:70svh;padding:10px;background:#e9efec}.customerinventoryserverpages img{display:block;width:min(794px,100%);height:auto;margin:0 auto 12px;background:#fff;box-shadow:0 2px 10px #0002}.customerinventorypreviewcard footer{display:flex;gap:8px;flex-wrap:wrap;padding:10px}.customerinventorypreviewcard footer button{min-height:38px;border:1px solid #17624d;border-radius:8px;background:#17624d;color:#fff;font-weight:800}@media(max-width:390px){.customerinventorypreviewcard footer button{flex:1 1 100%}}';
    style.textContent += '.customerinventorylauncher span{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:#dceee6;font-size:15px}';
    document.head.appendChild(style);
    const overlay = document.createElement('div');
    overlay.className = 'customerinventoryoverlay';
    overlay.hidden = true;
    overlay.innerHTML = '<section class="customerinventorycard" role="dialog" aria-modal="true" aria-label="Inventario clienti"><header><strong>Inventario clienti</strong><small class="customerinventoryreadonly">Sola lettura</small><button type="button" data-close aria-label="Chiudi">×</button></header><input type="search" aria-label="Cerca ragione sociale" placeholder="Cerca ragione sociale (almeno 3 lettere)"><div class="customerinventorychoices"></div><footer><span>Seleziona una ragione sociale Technics.</span><button type="button" data-preview disabled>Anteprima</button></footer></section>';
    overlay.querySelector('.customerinventorychoices').insertAdjacentHTML('beforebegin', '<div class="customerinventoryfavorites" aria-label="Clienti preferiti"></div>');
    overlay.querySelector('.customerinventorychoices').insertAdjacentHTML('beforebegin', '<div class="customerinventoryselected" aria-label="Altri clienti selezionati"></div>');
    overlay.querySelector('.customerinventorychoices').insertAdjacentHTML('afterend', '<label class="customerinventorytoggle"><input type="checkbox">Mostra anche giacenza zero</label><div class="customerinventoryresult" hidden><iframe title="Risultato Inventario clienti"></iframe></div>');
    document.body.appendChild(overlay);
    const preview=document.createElement('div');preview.className='customerinventorypreview';preview.hidden=true;preview.innerHTML='<section class="customerinventorypreviewcard" role="dialog" aria-modal="true" aria-label="Anteprima Inventario clienti"><header><strong>Anteprima · Inventario clienti</strong><span data-print-status role="status"></span><button type="button" data-preview-close aria-label="Chiudi">×</button></header><div class="customerinventoryserverpages"></div><footer><button type="button" data-print-target="corridor">Stampa su Corridoio</button><button type="button" data-print-target="warehouse">Stampa in Magazzino</button></footer></section>';document.body.appendChild(preview);
    const input = overlay.querySelector('input'), choices = overlay.querySelector('.customerinventorychoices'), dataFrame=overlay.querySelector('.customerinventoryresult iframe'), resultBox=overlay.querySelector('.customerinventoryresult'), status = overlay.querySelector('footer span'), previewButton = overlay.querySelector('[data-preview]');
    const printerChoice=document.createElement('select');printerChoice.dataset.standardPrinterTarget='';printerChoice.setAttribute('aria-label','Stampante Inventario clienti');printerChoice.innerHTML='<option value="">Scegli stampante</option><option value="corridor">Corridoio</option><option value="warehouse">Magazzino</option>';previewButton.before(printerChoice);
    printerChoice.onchange=()=>{directPrint?.invalidate();clearPages();preview.hidden=true;render();status.textContent='Destinazione cambiata: generare una nuova anteprima.'};
    let directPrint=null;try{directPrint=globalThis.TechnicsCustomerStandardPrint?.createSession('customer')||null}catch{}
    const pageUrls=[];
    const clearPages=()=>{while(pageUrls.length)URL.revokeObjectURL(pageUrls.pop());preview.querySelector('.customerinventoryserverpages').replaceChildren()};
    const showZero = overlay.querySelector('.customerinventorytoggle input');
    const favorites = overlay.querySelector('.customerinventoryfavorites');
    const selectedChips = overlay.querySelector('.customerinventoryselected');
    let timer, sequence = 0, searchSequence = 0, selected = null;
    const favoriteClients = [
      {id:8785,name:'PROMOITALIA GROUP SPA'},
      {id:10131,name:'PROFESSIONAL DIETETICS S.p.A'},
    ];
    const selectedClients = new Map();
    const activeClients = () => [...selectedClients.values()].sort((a,b) => {
      const ai=favoriteClients.findIndex(item => item.id===a.id),bi=favoriteClients.findIndex(item => item.id===b.id);
      return (ai<0?100:ai)-(bi<0?100:bi) || a.name.localeCompare(b.name,'it') || a.id-b.id;
    });
    const syncButtons = () => {
      selectedChips.replaceChildren();
      for(const client of activeClients().filter(item=>!favoriteClients.some(favorite=>favorite.id===item.id))){const chip=document.createElement('button');chip.type='button';chip.dataset.clientId=String(client.id);chip.textContent=`✓ ${client.name} ×`;chip.setAttribute('aria-label',`Rimuovi ${client.name}`);chip.onclick=()=>{selectedClients.delete(client.id);syncButtons();showZero.checked=false;loadClients(activeClients())};selectedChips.appendChild(chip)}
      for(const button of overlay.querySelectorAll('.customerinventoryfavorites button,.customerinventorychoices button'))button.setAttribute('aria-pressed',String(selectedClients.has(Number(button.dataset.clientId))));
    };
    const render = () => {
      if (!selected) return;
      const html=previewHtml(selected, showZero.checked);
      dataFrame.srcdoc=html;resultBox.hidden=false;
      previewButton.disabled = !printerChoice.value || (showZero.checked ? selected.catalog.articleCount : selected.articleCount) === 0;
    };
    showZero.onchange = () => {directPrint?.invalidate();clearPages();preview.hidden=true;render()};
    const close = () => {preview.hidden=true;overlay.hidden = true; sequence++;searchSequence++;directPrint?.invalidate();clearPages()};
    overlay.querySelector('[data-close]').onclick = close;
    overlay.addEventListener('click', event => {if (event.target === overlay) close()});
    launcher.querySelector('button').onclick = () => {overlay.hidden = false; input.focus()};
    const loadClients = async clients => {
      const selection = ++sequence, searchAtLoad = searchSequence;
      selected = null; preview.hidden=true;previewButton.disabled = true; directPrint?.invalidate();clearPages();dataFrame.removeAttribute('srcdoc');resultBox.hidden=true;
      if (!clients.length) {status.textContent = 'Seleziona uno o più clienti.';return}
      status.textContent = 'Lettura giacenze…';
      try {
        const reports = await Promise.all(clients.map(async client => {
          const {report} = await api('/api/inventory/clients/report?clientId=' + encodeURIComponent(client.id));
          if (report.client.id !== client.id) throw Error('Cliente non qualificato.');
          return report;
        }));
        if (selection !== sequence || overlay.hidden) return;
        selected = combineReports(reports);
        render();
        if(searchAtLoad===searchSequence)status.textContent = `${clients.length} client${clients.length===1?'e':'i'} · ${selected.articleCount} articoli con giacenza positiva · ${selected.rows.length} righe positive`;
      } catch (error) {if (selection === sequence && searchAtLoad===searchSequence) status.textContent = error.message}
    };
    for (const client of favoriteClients) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = client.name; button.dataset.clientId = String(client.id); button.setAttribute('aria-pressed','false');
      button.onclick = () => {
        clearTimeout(timer);searchSequence++;input.value='';choices.replaceChildren();
        if (selectedClients.has(client.id)) selectedClients.delete(client.id); else selectedClients.set(client.id,client);
        syncButtons();
        showZero.checked=false;
        loadClients(activeClients());
      };
      favorites.appendChild(button);
    }
    input.addEventListener('input', () => {
      clearTimeout(timer);
      const term = input.value.trim(), token = ++searchSequence;
      choices.replaceChildren();
      status.textContent = term.length < 3 ? 'Inserisci almeno tre lettere.' : 'Ricerca in Technics…';
      if (term.length < 3) return;
      timer = setTimeout(async () => {
        try {
          const {clients} = await api('/api/inventory/clients/search?q=' + encodeURIComponent(term));
          if (token !== searchSequence || overlay.hidden) return;
          status.textContent = clients.length ? 'Aggiungi o rimuovi clienti dalla selezione.' : 'Nessuna ragione sociale trovata.';
          for (const client of clients) {
            const button = document.createElement('button');
            button.type = 'button'; button.textContent = client.name;button.dataset.clientId=String(client.id);
            button.onclick = () => {if(selectedClients.has(client.id))selectedClients.delete(client.id);else selectedClients.set(client.id,client);syncButtons();showZero.checked=false;loadClients(activeClients())};
            choices.appendChild(button);
          }
          syncButtons();
        } catch (error) {if (token === searchSequence && !overlay.hidden) status.textContent = error.message}
      }, 250);
    });
    previewButton.onclick = async () => {
      if(!selected||previewButton.disabled)return;
      previewButton.disabled=true;clearPages();preview.querySelector('[data-print-status]').textContent='Preparazione anteprima server…';
      try{
        if(!directPrint)throw Error('Stampa diretta non configurata.');
        const result=await directPrint.preview({clientIds:activeClients().map(client=>client.id),includeZeroStock:showZero.checked,printerTarget:printerChoice.value});
        const pages=preview.querySelector('.customerinventoryserverpages');
        for(const [index,blob] of result.pages.entries()){
          const url=URL.createObjectURL(blob);pageUrls.push(url);const img=document.createElement('img');img.src=url;img.alt=`Pagina ${index+1} di ${result.pageCount} Inventario clienti`;pages.appendChild(img);
        }
        preview.querySelector('[data-print-status]').textContent=`${result.pageCount} pagine server`;
        for(const button of preview.querySelectorAll('[data-print-target]')){button.hidden=button.dataset.printTarget!==printerChoice.value;button.dataset.confirm='';button.textContent=button.dataset.printTarget==='warehouse'?'Stampa in Magazzino':'Stampa su Corridoio'}
        preview.hidden=false;
      }catch(error){directPrint?.invalidate();clearPages();status.textContent=error.message||'Anteprima server non disponibile.'}
      finally{previewButton.disabled=!selected||!printerChoice.value||(!showZero.checked&&selected.articleCount===0)}
    };
    preview.addEventListener('click',async event=>{
      if(event.target===preview||event.target.closest('[data-preview-close]')){preview.hidden=true;directPrint?.invalidate();clearPages();return}
      const button=event.target.closest('[data-print-target]');if(!button)return;
      const target=button.dataset.printTarget;
      try{
        if(!directPrint?.ready())throw Error('Anteprima scaduta: aggiornarla.');
        if(button.dataset.confirm!==target){for(const other of preview.querySelectorAll('[data-print-target]')){other.dataset.confirm='';other.textContent=other.dataset.printTarget==='warehouse'?'Stampa in Magazzino':'Stampa su Corridoio'}button.dataset.confirm=target;button.textContent=directPrint.confirm(target);return}
        button.dataset.confirm='';button.disabled=true;button.textContent='Invio in corso…';await directPrint.print(target);button.textContent='Documento accettato dalla stampante';preview.querySelector('[data-print-status]').textContent='Invio accettato; uscita del foglio non verificata.';
      }catch(error){button.dataset.confirm='';button.textContent=target==='warehouse'?'Stampa in Magazzino':'Stampa su Corridoio';preview.querySelector('[data-print-status]').textContent=error.message||'Stampa non disponibile.'}
      finally{button.disabled=!directPrint?.ready()}
    });
    return true;
  }
  if (!install()) {
    const observer = new MutationObserver(() => {if (install()) observer.disconnect()});
    observer.observe(document.documentElement, {childList:true,subtree:true});
  }
})();
