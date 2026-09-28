(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const format = value => new Intl.NumberFormat('it-IT', {maximumFractionDigits: 3}).format(value);
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
    let lastOwner = '';
    const rows = visibleArticles.flatMap(article => {
      const heading = article.ownerName !== lastOwner ? [`<tr class="clientgroup" data-client-heading="${escape(article.ownerName)}"><th colspan="4" style="background:#dceee2;color:#174d40;font-size:13px;text-align:left">${escape(article.ownerName)}</th></tr>`] : [];
      lastOwner = article.ownerName;
      const stock = byArticle.get(article.articleId) || [];
      const ownership = `<small class="owner">${escape(article.ownerName)}${article.linkedClients.length > 1 ? ` · Condiviso con ${escape(article.linkedClients.slice(1).join(', '))}; mostrato una volta` : ''}</small>`;
      if (!stock.length) return [...heading,`<tr data-no-positive-stock="true" data-owner="${escape(article.ownerName)}"><td><b>${escape(article.code)}</b><small>${escape(article.description)}</small>${ownership}<small class="nostock">Nessuna giacenza positiva</small></td><td></td><td></td><td></td></tr>`];
      return [...heading,...stock.map(row => `<tr data-stock-row="true" data-stock-row-id="${row.stockRowId}" data-owner="${escape(article.ownerName)}"><td><b>${escape(row.code)}</b><small>${escape(row.description)}</small>${ownership}</td><td>${escape(row.lot) || '—'}</td><td>${escape(row.location) || '—'}</td><td>${format(row.quantity)} ${escape(row.unit)}</td></tr>`)];
    }).join('');
    return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Inventario clienti · ${escape(report.client.name)}</title><style>*{box-sizing:border-box}body{margin:0;padding:18px;font:12px system-ui,sans-serif;color:#173e35}header{border-bottom:2px solid #17624d;padding-bottom:10px}h1{margin:0 0 5px;font-size:23px}header strong{font-size:15px}p{margin:5px 0}table{width:100%;border-collapse:collapse;table-layout:fixed;margin-top:14px}th,td{text-align:left;padding:8px;border-bottom:1px solid #dce7df;overflow-wrap:anywhere;vertical-align:top}th{background:#e9f4ee}th:first-child{width:43%}td:last-child{text-align:right;white-space:nowrap}small{display:block;color:#617168}.owner{color:#17624d;font-weight:700}.nostock{color:#8b5b18;font-weight:800}.note{font-size:10px;color:#5d7066;margin-top:14px}@media(max-width:600px){body{padding:10px}table,tbody,tr,td{display:block;width:100%}thead{display:none}tr{border:1px solid #dce7df;border-radius:8px;padding:5px;margin:8px 0}td{border:0;text-align:left!important;white-space:normal!important;padding:4px}td:nth-child(2):before{content:'Lotto: ';font-weight:800}td:nth-child(3):before{content:'Ubicazione: ';font-weight:800}td:nth-child(4):before{content:'Giacenza fisica: ';font-weight:800}}@media print{body{padding:0}thead{display:table-header-group}table{display:table}tbody{display:table-row-group}tr{display:table-row;break-inside:avoid;border:0}td{display:table-cell;border-bottom:1px solid #dce7df;padding:5px}td:before{display:none}}</style></head><body><header><h1>Inventario clienti</h1><strong>${escape(report.client.name)}</strong><p>${showZero ? `${report.catalog.articleCount} articoli associati · ${report.articleCount} con giacenza positiva · ${report.catalog.withoutPositiveStockCount} senza giacenza positiva` : `${report.articleCount} articoli con giacenza positiva`}</p><p>${report.rows.length} righe positive</p>${report.sharedArticleCount ? `<p>${report.sharedArticleCount} articoli collegati a più clienti; mostrati una sola volta.</p>` : ''}</header><table><thead><tr><th>Articolo e cliente</th><th>Lotto</th><th>Ubicazione</th><th>Giacenza fisica</th></tr></thead><tbody>${rows}</tbody></table><p class="note">Fonte Technics: QtaGiac. ${showZero ? 'I codici senza giacenza positiva sono mostrati senza lotto, ubicazione o quantità. ' : ''}Le righe stock nulle, zero o negative non vengono mostrate. Nessun totale tra articoli diversi. Lettura ${escape(report.readAt)}.</p></body></html>`;
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
    document.head.appendChild(style);
    const overlay = document.createElement('div');
    overlay.className = 'customerinventoryoverlay';
    overlay.hidden = true;
    overlay.innerHTML = '<section class="customerinventorycard" role="dialog" aria-modal="true" aria-label="Inventario clienti"><header><strong>Inventario clienti</strong><button type="button" data-close aria-label="Chiudi">×</button></header><input type="search" aria-label="Cerca ragione sociale" placeholder="Cerca ragione sociale (almeno 3 lettere)"><div class="customerinventorychoices"></div><iframe title="Anteprima stampabile inventario clienti"></iframe><footer><span>Seleziona una ragione sociale Technics.</span><button type="button" data-print disabled>Stampa anteprima</button></footer></section>';
    overlay.querySelector('.customerinventorychoices').insertAdjacentHTML('beforebegin', '<div class="customerinventoryfavorites" aria-label="Clienti preferiti"></div>');
    overlay.querySelector('.customerinventorychoices').insertAdjacentHTML('beforebegin', '<div class="customerinventoryselected" aria-label="Altri clienti selezionati"></div>');
    overlay.querySelector('.customerinventorychoices').insertAdjacentHTML('afterend', '<label class="customerinventorytoggle"><input type="checkbox">Mostra anche giacenza zero</label>');
    document.body.appendChild(overlay);
    const input = overlay.querySelector('input'), choices = overlay.querySelector('.customerinventorychoices'), frame = overlay.querySelector('iframe'), status = overlay.querySelector('footer span'), print = overlay.querySelector('[data-print]');
    const showZero = overlay.querySelector('.customerinventorytoggle input');
    const favorites = overlay.querySelector('.customerinventoryfavorites');
    const selectedChips = overlay.querySelector('.customerinventoryselected');
    let timer, sequence = 0, searchSequence = 0, selected = null;
    const favoriteClients = [
      {id:8785,name:'PROMOITALIA GROUP SPA'},
      {id:11685,name:'NYUMA PHARMA S.R.L.'},
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
      frame.srcdoc = previewHtml(selected, showZero.checked);
      print.disabled = (showZero.checked ? selected.catalog.articleCount : selected.articleCount) === 0;
    };
    showZero.onchange = render;
    const close = () => {overlay.hidden = true; sequence++;searchSequence++};
    overlay.querySelector('[data-close]').onclick = close;
    overlay.addEventListener('click', event => {if (event.target === overlay) close()});
    launcher.querySelector('button').onclick = () => {overlay.hidden = false; input.focus()};
    const loadClients = async clients => {
      const selection = ++sequence, searchAtLoad = searchSequence;
      selected = null; print.disabled = true; frame.removeAttribute('srcdoc');
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
    print.onclick = () => {if (selected && !print.disabled) frame.contentWindow?.print()};
    return true;
  }
  if (!install()) {
    const observer = new MutationObserver(() => {if (install()) observer.disconnect()});
    observer.observe(document.documentElement, {childList:true,subtree:true});
  }
})();
