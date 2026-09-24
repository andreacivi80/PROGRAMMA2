(() => {
  const style = document.createElement('style');
  style.textContent = `#result .locationbox{display:flex;align-items:center;gap:8px;flex-wrap:nowrap;overflow-x:auto;white-space:nowrap}#result .locationbox small,#result .locationbox strong{flex:0 0 auto;white-space:nowrap!important}#result .locationbox strong{margin-left:auto}.pickmovementinfo{display:inline-grid;place-items:center;width:22px;height:22px;margin-left:5px;padding:0;border:1px solid #a6c4b9;border-radius:50%;background:#fff;color:#155a48;font:700 14px/1 system-ui;vertical-align:middle}.pickmovementoverlay{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:12px;background:#152a2588}.pickmovementoverlay[hidden]{display:none}.pickmovementpanel{box-sizing:border-box;width:min(760px,100%);max-height:90vh;overflow:auto;border-radius:12px;background:white;padding:16px;box-shadow:0 16px 40px #0004}.pickmovementhead{display:flex;align-items:center;justify-content:space-between;gap:12px}.pickmovementhead h2{margin:0;font-size:18px}.pickmovementhead button{width:30px;height:30px;border-radius:50%;border:1px solid #b8c9c3;background:white;font-size:20px}.pickmovementpanel table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}.pickmovementpanel th,.pickmovementpanel td{padding:7px;border-bottom:1px solid #d7e4de;text-align:left}.pickmovementpanel th{background:#e8f3ef}.pickmovementpanel .arrival{background:#f3faf7;font-weight:700}.pickmovementpanel .quantity{text-align:right;white-space:nowrap}.pickmovementpanel td:nth-child(4){white-space:nowrap}.pickmovementscroll{overflow-x:auto}`;
  style.textContent += '.pickmovementpanel table{table-layout:fixed;font-size:10px}.pickmovementpanel th{font-size:9px}.pickmovementpanel th,.pickmovementpanel td{padding:4px 3px;overflow-wrap:anywhere}.pickmovementpanel th:nth-child(1){width:18%}.pickmovementpanel th:nth-child(2){width:21%}.pickmovementpanel th:nth-child(3){width:20%}.pickmovementpanel th:nth-child(4){width:16%}.pickmovementpanel th:nth-child(5){width:15%}.pickmovementpanel th:nth-child(6){width:10%}';
  style.textContent += '.pickdisposition{font-size:10px;line-height:1.15;min-height:36px;padding:3px 4px}.pickmovementinfo{box-sizing:border-box!important;display:inline-grid!important;flex:0 0 22px!important;width:22px!important;height:22px!important;min-height:22px!important;max-height:22px!important;padding:0!important;align-self:center}@media(max-width:390px){.pickmovementpanel{padding:12px}.pickmovementpanel table{display:block;margin-top:8px;font-size:12px}.pickmovementpanel tbody{display:block}.pickmovementpanel tr:first-child{display:none}.pickmovementpanel tr:not(:first-child){display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 8px;margin:8px 0;padding:8px;border:1px solid #d7e4de;border-radius:8px}.pickmovementpanel tr:not(:first-child) td{display:block;min-width:0;padding:0;border:0;overflow-wrap:normal;word-break:normal}.pickmovementpanel tr:not(:first-child) td::before{display:block;color:#5a7068;font-size:9px;font-weight:700}.pickmovementpanel tr:not(:first-child) td:nth-child(1)::before{content:"Data"}.pickmovementpanel tr:not(:first-child) td:nth-child(2)::before{content:"Descrizione"}.pickmovementpanel tr:not(:first-child) td:nth-child(3)::before{content:"Operatore"}.pickmovementpanel tr:not(:first-child) td:nth-child(4)::before{content:"Ubicazione"}.pickmovementpanel tr:not(:first-child) td:nth-child(5)::before{content:"Quantità"}.pickmovementpanel tr:not(:first-child) td:nth-child(6)::before{content:"UM"}.pickmovementpanel tr:not(:first-child) td:nth-child(5){text-align:left}.pickmovementscroll{overflow-x:hidden}}';
  document.head.append(style);

  const overlay = document.createElement('div');
  overlay.className = 'pickmovementoverlay';
  overlay.hidden = true;
  overlay.innerHTML = '<section class="pickmovementpanel" role="dialog" aria-modal="true" aria-labelledby="pickmovementtitle"><div class="pickmovementhead"><h2 id="pickmovementtitle">Elenco movimenti di magazzino</h2><button type="button" aria-label="Chiudi">×</button></div><p class="pickmovementidentity"></p><div class="pickmovementscroll"></div></section>';
  document.body.append(overlay);
  let requestSequence = 0;
  const close = () => { requestSequence += 1; overlay.hidden = true; };
  overlay.querySelector('button').addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !overlay.hidden) close(); });
  const cell = (row, value, className = '') => {
    const element = document.createElement('td');
    element.textContent = value ?? '';
    if (className) element.className = className;
    row.append(element);
  };
  const date = value => value ? String(value).slice(0, 10).split('-').reverse().join('/') : '—';
  const quantity = value => value == null ? '—' : Number(value).toLocaleString('it-IT', { maximumFractionDigits: 4 });
  const show = async (code, lot) => {
    const currentRequest = ++requestSequence;
    overlay.hidden = false;
    overlay.querySelector('.pickmovementidentity').textContent = `${code} · Lotto ${lot}`;
    const area = overlay.querySelector('.pickmovementscroll');
    area.textContent = 'Caricamento movimenti…';
    try {
      const base = window.__technicsBridgeUrl;
      if (!base) throw new Error('Collegamento dati non disponibile.');
      const url = new URL('/api/items/lookup', base);
      url.searchParams.set('code', code);
      url.searchParams.set('lot', lot);
      url.searchParams.set('commitmentDetails', 'native');
      url.searchParams.set('movementHistory', '1');
      const response = await fetch(url, { cache: 'no-store' });
      const payload = await response.json();
      if (currentRequest !== requestSequence || overlay.hidden) return;
      if (!response.ok || !payload?.ok) throw new Error(payload?.error || 'Movimenti non disponibili.');
      const history = payload.item?.movementHistory;
      if (history?.readOnly !== true || history?.dataAuthority !== 'Technics' || history.code !== code || history.lot !== lot || !Array.isArray(history.recentMovements) || history.recentMovements.length > 5 || !Number.isSafeInteger(history.movementCount) || history.movementCount < 0) throw new Error('Cronologia non disponibile per questo lotto.');
      const table = document.createElement('table');
      const head = document.createElement('tr');
      for (const label of ['Data', 'Descrizione', 'Operatore', 'Ubicazione', 'Quantità', 'UM']) {
        const th = document.createElement('th'); th.textContent = label; head.append(th);
      }
      table.append(head);
      const rows = [history.initialLoading, ...(history.recentMovements || [])].filter(Boolean);
      for (const [index, movement] of rows.entries()) {
        const tr = document.createElement('tr');
        if (index === 0 && history.initialLoading) tr.className = 'arrival';
        cell(tr, date(movement.date));
        cell(tr, movement.description);
        cell(tr, movement.operator || '—');
        cell(tr, movement.location || '—');
        cell(tr, quantity(movement.quantity), 'quantity');
        cell(tr, movement.unit || history.unit || '');
        table.append(tr);
      }
      area.replaceChildren(table);
      if (rows.length) {
        const count = document.createElement('p');
        count.textContent = `${history.movementCount} movimenti totali · ${history.recentMovements.length} più recenti`;
        area.prepend(count);
      }
      if (!rows.length) area.textContent = 'Nessun movimento trovato per questo lotto.';
    } catch (error) {
      if (currentRequest === requestSequence && !overlay.hidden) area.textContent = error?.message || 'Impossibile leggere i movimenti.';
    }
  };
  const enhance = () => {
    const picking = document.querySelector('#planningLookup .picklist');
    if (!picking || !picking.querySelector('.picklisttitle')?.textContent?.includes('APERTA')) return;
    for (const row of picking.querySelectorAll('.pickrow[data-picking-row-code]')) {
      const heading = row.querySelector(':scope > small > span');
      const lot = heading?.querySelector(':scope > strong')?.textContent?.trim();
      const code = row.dataset.pickingRowCode;
      if (!heading || !code || !lot || heading.querySelector('.pickmovementinfo')) continue;
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'pickmovementinfo'; button.textContent = 'i';
      button.setAttribute('aria-label', `Elenco movimenti di magazzino: ${code}, lotto ${lot}`);
      button.addEventListener('click', event => { event.preventDefault(); void show(code, lot); });
      heading.querySelector(':scope > strong')?.after(button);
    }
  };
  new MutationObserver(enhance).observe(document.querySelector('#planningLookup') || document.body, { childList: true, subtree: true });
  enhance();
})();
