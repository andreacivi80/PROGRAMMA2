(() => {
  const bridgeUrl = String(window.__technicsBridgeUrl || '').replace(/\/$/, '');
  const button = () => document.getElementById('sendPickingMail');
  const escapeHtml = value => {
    const element = document.createElement('div');
    element.textContent = String(value ?? '');
    return element.innerHTML;
  };
  const show = (...args) => window.__technicsShowPickingOverlay(...args);
  const readJson = async response => {
    try { return await response.json(); }
    catch { return { ok: false, error: `Risposta non valida dal servizio mail (HTTP ${response.status}).` }; }
  };
  const recipients = {
    to: 'confezionamento@iralab.it · rossella.crippa@iralab.it · alessandro.zummo@iralab.it',
    cc: 'andrea.cividini@iralab.it · stefano.migliorati@iralab.it · logistica@iralab.it',
  };
  const target = () => {
    const state = window.__technicsPickingState?.() || {};
    if (state.group?.id) return { multi: true, confirmed: !!state.group.confirmed, groupId: state.group.id, details: (state.plans || []).map(plan => plan.order).filter(Boolean) };
    if (state.current?.order && state.session?.created) return { multi: false, confirmed: !!state.session.confirmed, opNumber: state.current.order.number, year: state.current.year, details: [state.current.order] };
    return null;
  };
  const sync = () => {
    const current = target();
    const anchor = document.getElementById(current?.multi ? 'closePickingGroup' : 'closePickingList');
    const actions = anchor?.closest('.pickingendactions');
    let control = button();
    if (!current?.confirmed || !actions) { control?.remove(); return; }
    if (!control) {
      control = document.createElement('button');
      control.id = 'sendPickingMail';
      control.className = 'pickingmailbutton';
      control.type = 'button';
      actions.append(control);
    }
    const state = control.dataset.state;
    const label = state === 'sending' ? 'Invio mail…' : state === 'sent' ? 'Mail inviata' : state === 'queued' || state === 'uncertain' ? 'Verifica invio' : 'Invia mail';
    if (control.textContent !== label) control.textContent = label;
    control.disabled = state === 'sending';
  };
  const model = () => {
    const current = target();
    if (!current) return null;
    const rows = current.details.map(order => ({ op: String(order.number || '').padStart(6, '0'), ov: String(order.ovNumber || '—'), code: String(order.articleCode || '—'), description: String(order.articleName || '—') }));
    const now = new Date(), date = now.toLocaleDateString('it-IT'), fileDate = [String(now.getDate()).padStart(2, '0'), String(now.getMonth() + 1).padStart(2, '0'), now.getFullYear()].join('-');
    const body = 'Buongiorno a tutti,\n\nin allegato la lista di prelievo del materiale pronto.\n\n' + rows.map(row => `OP: ${row.op}\nOV: ${row.ov}\nCodice: ${row.code}\nDescrizione: ${row.description}`).join('\n\n');
    return { current, rows, body, subject: `Lista di prelievo${current.multi ? ' multi-OP' : ''} · ${date}`, attachment: `Lista di prelievo${current.multi ? ' multi-OP' : ''} ${fileDate}.pdf` };
  };
  const query = current => current.multi ? `groupId=${encodeURIComponent(current.groupId)}` : `op=${encodeURIComponent(current.opNumber)}&year=${encodeURIComponent(current.year)}`;
  const success = () => {
    const control = button();
    if (control) { control.dataset.state = 'sent'; sync(); }
    show('success', 'MAIL INVIATA CON SUCCESSO', 'Lista di prelievo inviata con PDF allegato.', '', '<button data-pick-close>Continua</button>');
  };
  const uncertain = message => {
    const control = button();
    if (control) { control.dataset.state = 'uncertain'; sync(); }
    show('duplicate', 'ESITO INVIO DA VERIFICARE', message || 'Non è possibile stabilire se la mail sia già partita. Verifica lo stato prima di inviarla di nuovo.', '', '<button data-pick-close>Chiudi</button><button data-check-picking-mail>Verifica stato</button>');
  };
  const inProgress = () => {
    const control = button();
    if (control) { control.dataset.state = 'queued'; sync(); }
    show('duplicate', 'INVIO MAIL IN CORSO', 'Questa lista è già in invio. Non è stato avviato un secondo invio.', '', '<button data-pick-close>Chiudi</button><button data-check-picking-mail>Verifica stato</button>');
  };
  const failed = message => {
    const control = button();
    if (control) { control.dataset.state = 'failed'; sync(); }
    show('error', 'MAIL NON INVIATA', message || 'Invio non riuscito.', '', '<button data-pick-close>Chiudi</button><button data-retry-picking-mail>Riprova</button>');
  };
  const checkStatus = async () => {
    const current = target();
    if (!current?.confirmed) return;
    try {
      const response = await window.TechnicsTransport.fetch(`${bridgeUrl}/api/picking/mail-status?${query(current)}&fresh=${Date.now()}`, { headers: { 'ngrok-skip-browser-warning': '1' } });
      const status = await readJson(response);
      if (status.state === 'sent') return success();
      if (status.state === 'failed') return failed(status.error);
      if (status.inProgress) return inProgress();
      return uncertain(status.deliveryUncertain ? 'Il servizio è stato riavviato mentre la mail risultava in coda. Controlla la posta inviata prima di riprovare.' : 'Invio non confermato. Controlla la posta inviata prima di riprovare.');
    } catch { uncertain('Stato non raggiungibile. Controlla la posta inviata prima di riprovare.'); }
  };
  const preview = () => {
    const current = model();
    if (!current) return;
    if (button()?.dataset.state === 'queued' || button()?.dataset.state === 'uncertain') return checkStatus();
    const content = `<div class="pickingmailconfirm">Sto inviando la mail, confermi?</div><div class="pickingmailpreview"><div><b>Da</b><span>Emanuele Bonanomi &lt;emanuele.bonanomi@iralab.it&gt;</span></div><div><b>A</b><span>${recipients.to}</span></div><div><b>Cc</b><span>${recipients.cc}</span></div><div><b>Oggetto</b><span>${escapeHtml(current.subject)}</span></div><div><b>Testo</b><p>${escapeHtml(current.body)}</p></div><div class="attachment">📎 ${escapeHtml(current.attachment)}</div></div>`;
    const actions = current.current.confirmed ? '<button data-pick-cancel>Annulla</button><button data-send-picking-mail-now>Conferma e invia</button>' : '<button data-pick-close>Chiudi anteprima</button><button disabled>Chiudi la lista per inviare</button>';
    show('preview', 'ANTEPRIMA MAIL', 'Sto inviando la mail, confermi?', content, actions);
  };
  let requestInFlight = false;
  const request = async (resend = false) => {
    const current = model();
    if (!current?.current.confirmed || requestInFlight) return;
    requestInFlight = true;
    const control = button();
    if (control) { control.dataset.state = 'sending'; sync(); }
    show('duplicate', 'INVIO MAIL…', 'Preparazione PDF e invio tramite Microsoft Graph in corso.', '', '<button disabled>Invio mail…</button>');
    try {
      const operationId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const body = current.current.multi ? { groupId: current.current.groupId, operationId, resend } : { opNumber: current.current.opNumber, year: current.current.year, operationId, resend };
      const response = await window.TechnicsTransport.fetch(`${bridgeUrl}/api/picking/mail`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '1' }, body: JSON.stringify(body) });
      const payload = await readJson(response);
      if (!response.ok || !payload.ok) {
        if (payload.alreadySent) {
          if (control) { control.dataset.state = 'sent'; sync(); }
          show('duplicate', 'MAIL GIÀ INVIATA', 'Hai già inviato questa mail. Vuoi rimandarla?', '', '<button data-pick-cancel>Annulla</button><button data-confirm-picking-resend>Rimanda mail</button>');
          return;
        }
        if (payload.inProgress) return inProgress();
        if (payload.deliveryUncertain) return uncertain(payload.error);
        return uncertain(payload.error || `Invio non confermato (HTTP ${response.status}). Verifica lo stato prima di riprovare.`);
      }
      for (let attempt = 0; attempt < 240; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const statusResponse = await window.TechnicsTransport.fetch(`${bridgeUrl}/api/picking/mail-status?${query(current.current)}&fresh=${Date.now()}`);
        const status = await readJson(statusResponse);
        if (status.state === 'sent') return success();
        if (status.state === 'failed') return failed(status.error || 'Invio Microsoft Graph non riuscito.');
        if (status.deliveryUncertain) return uncertain('Esito dell’invio incerto dopo il riavvio del servizio. Controlla la posta inviata prima di riprovare.');
      }
      return uncertain('Conferma invio non ricevuta entro 120 secondi. Verifica lo stato prima di riprovare.');
    } catch { uncertain('Collegamento interrotto durante l’invio. La mail potrebbe essere partita: verifica lo stato prima di riprovare.'); }
    finally { requestInFlight = false; }
  };
  document.addEventListener('click', event => {
    if (event.target.closest('#sendPickingMail')) { event.preventDefault(); event.stopImmediatePropagation(); preview(); }
    else if (event.target.closest('[data-send-picking-mail-now]')) { event.preventDefault(); event.stopImmediatePropagation(); void request(false); }
    else if (event.target.closest('[data-confirm-picking-resend]')) { event.preventDefault(); event.stopImmediatePropagation(); void request(true); }
    else if (event.target.closest('[data-retry-picking-mail]')) { event.preventDefault(); event.stopImmediatePropagation(); void request(false); }
    else if (event.target.closest('[data-check-picking-mail]')) { event.preventDefault(); event.stopImmediatePropagation(); void checkStatus(); }
  }, true);
  new MutationObserver(sync).observe(document.body, { childList: true, subtree: true });
  window.__technicsPickingMailGraphCandidate = { sync, preview, request, model, checkStatus };
  sync();
})();
