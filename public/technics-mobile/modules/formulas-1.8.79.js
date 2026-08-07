(() => {
  const shell = document.querySelector("main.shell"),
    nav = document.querySelector(".departmentnav");
  if (!shell || !nav || document.getElementById("formulaWorkspace")) return;
  const style = document.createElement("style");
  style.id = "formulas-style-v1875";
  style.textContent = `
  .departmentnav button[data-workspace="formulas"]{border-color:#72a7a0!important;color:#17685f!important;background:#eef8f6!important}.departmentnav button[data-workspace="formulas"].active{background:#17685f!important;color:#fff!important}
  .formulaworkspace{display:none}.shell[data-workspace="formulas"]{--workspace-accent:#17685f;--workspace-soft:#eef8f6}.shell[data-workspace="formulas"] .hero,.shell[data-workspace="formulas"] #message,.shell[data-workspace="formulas"] #result,.shell[data-workspace="formulas"] #production,.shell[data-workspace="formulas"] #openPackingHome,.shell[data-workspace="formulas"] #modeShortcut,.shell[data-workspace="formulas"] #planningLookup,.shell[data-workspace="formulas"] .salesorders{display:none!important}.shell[data-workspace="formulas"] .formulaworkspace{display:grid;gap:9px}
  .formulahead{display:grid;gap:8px;padding:12px;border:1px solid #b9d8d2;border-radius:15px;background:#fff}.formulahead header{display:flex;align-items:center;justify-content:space-between}.formulahead h2{margin:0;color:#15564f;font:800 19px/1 Georgia,serif}.formulahead small{color:#617b75;font-size:7px;font-weight:900}.formulasearch{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px}.formulasearch input{min-width:0;height:45px;padding:0 12px;border:1px solid #bcd3ce;border-radius:10px;color:#173e35;font-size:14px;font-weight:850;text-transform:uppercase}.formulasearch button{padding:0 14px;border:0;border-radius:10px;background:#17685f;color:#fff;font-size:9px;font-weight:950}.formulastatus{min-height:16px;color:#617b75;font-size:8px;font-weight:850}.formulastatus.error{color:#a33a35}.formularesult{display:grid;gap:8px}.formularoot{overflow:hidden;border:1px solid #b9d8d2;border-radius:14px;background:#fff}.formularoot>header{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 8px;padding:11px;background:linear-gradient(135deg,#15564f,#238074);color:#fff}.formularoot>header b{font-size:16px}.formularoot>header span{grid-column:1;min-width:0;font-size:11px;font-weight:850}.formulatype{grid-row:1/3;grid-column:2;align-self:center;padding:4px 6px;border-radius:7px;background:#ffffff20;font-size:7px;font-weight:900}.formulameta{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#dbe9e5}.formulameta span{display:grid;gap:2px;padding:7px 4px;background:#f8fbfa;color:#667b75;font-size:6px;text-align:center;text-transform:uppercase}.formulameta b{color:#173e35;font-size:12px;white-space:nowrap}.formulasection{overflow:hidden;border:1px solid #d5e4df;border-radius:12px;background:#fff}.formulasection>h3{margin:0;padding:8px 10px;background:#e9f4f1;color:#15564f;font-size:9px}.formulaempty{padding:12px;color:#75857f;font-size:8px}.formulanodes{display:grid}.formulanode{border-bottom:1px solid #e4ece9}.formulanode:last-child{border:0}.formulanodehead{display:grid;grid-template-columns:minmax(68px,.55fr) minmax(0,1.4fr) auto;gap:3px 7px;align-items:center;width:100%;padding:8px;border:0;background:#fff;text-align:left}.formulanodehead b{color:#15564f;font-size:10px;white-space:nowrap}.formulanodehead strong{min-width:0;color:#243e37;font-size:8px;line-height:1.25}.formulanodehead em{grid-row:1/3;grid-column:3;color:#17685f;font-size:17px;font-style:normal}.formulanodehead small{grid-column:1/3;color:#768780;font-size:7px}.formulanodehead small span{margin-right:7px;white-space:nowrap}.formulanodedetail{display:grid;gap:7px;padding:8px;background:#f5faf8}.formuladetailnav{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}.formuladetailnav button{min-height:34px;padding:3px;border:1px solid #bad3cd;border-radius:8px;background:#fff;color:#17685f;font-size:7px;font-weight:950}.formuladetailnav button.active{border-color:#17685f;background:#17685f;color:#fff}.formulaunit{overflow:hidden;border:1px solid #d4e3df;border-radius:9px;background:#fff}.formulaunit.hidden{display:none}.formulaunit h4{margin:0;padding:6px 8px;background:#edf6f3;color:#15564f;font-size:8px}.formulaunit>div{display:grid;gap:4px;padding:7px}.formulainci,.formulastock,.formuladoc,.formulaparent{display:grid;grid-template-columns:minmax(70px,.7fr) minmax(0,1.3fr) auto;gap:3px 7px;align-items:center;padding:6px;border-radius:7px;background:#f8fbfa}.formulainci b,.formulastock b,.formuladoc b,.formulaparent b{color:#173e35;font-size:8px}.formulainci span,.formulastock span,.formuladoc span,.formulaparent span{min-width:0;color:#647a73;font-size:7px;overflow-wrap:anywhere}.formulainci .formulacas{display:block;color:#173e35;font-size:7.5px;font-weight:900;white-space:normal;word-break:normal}.formulainci small,.formulastock small,.formuladoc small,.formulaparent small{color:#17685f;font-size:7px;font-weight:900;white-space:nowrap}.formuladoc button{min-height:30px;border:0;border-radius:7px;background:#17685f;color:#fff;font-size:7px;font-weight:950}.formuladoc{grid-template-columns:minmax(75px,.65fr) minmax(0,1.35fr) auto}.formuladossier{padding:6px;border-left:3px solid #7caea4;background:#f8fbfa;color:#566e67;font-size:7px}.formulaviewer{position:fixed;inset:0;z-index:20000;display:grid;grid-template-rows:auto 1fr;background:#102b25}.formulaviewer.hidden{display:none}.formulaviewer header{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;padding:max(10px,env(safe-area-inset-top)) 10px 10px;color:#fff}.formulaviewer strong{overflow:hidden;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.formulaviewer button{width:38px;height:38px;border:1px solid #ffffff44;border-radius:50%;background:#fff;color:#15564f;font-size:20px}.formuladocumentpages{overflow:auto;padding:8px;background:#d8dfdc;text-align:center}.formuladocumentpages canvas{display:block;max-width:100%;height:auto;margin:0 auto 8px;background:#fff;box-shadow:0 1px 7px #0003}.formuladocumentpages img{display:block;max-width:100%;max-height:100%;margin:auto;background:#fff;object-fit:contain}.formuladocumentmessage{padding:24px 12px;color:#173e35;font-size:12px;font-weight:800;text-align:center}.formulaactive{padding:6px 8px;border-radius:8px;background:#e8f5ef;color:#17654f;font-size:8px;font-weight:900}.formulaactive.inactive{background:#fff0ed;color:#9b352e}@media(max-width:430px){.departmentnav{grid-template-columns:repeat(6,minmax(72px,1fr))!important}.formulameta{grid-template-columns:repeat(2,1fr)}.formuladetailnav{grid-template-columns:repeat(2,1fr)}}`;
  document.head.append(style);
  const compactStyle = document.createElement("style");
  compactStyle.textContent = `.formulacolheads,.formulanodehead{display:grid;grid-template-columns:minmax(64px,.58fr) minmax(0,1.42fr) 48px;gap:3px 7px;align-items:center}.formulacolheads{padding:5px 8px;border-bottom:1px solid #dde9e5;background:#f8fbfa;color:#6b7e78;font-size:6px;font-weight:950;text-transform:uppercase}.formulacolheads span:last-child{text-align:right}.formulanodehead{width:100%;padding:8px;border:0;background:#fff;text-align:left}.formulanodehead b{font-size:9px}.formulapct{color:#17685f;font-size:8px;font-weight:950;text-align:right;white-space:nowrap}.formulastockline{grid-row:2;grid-column:2/4;color:#768780;font-size:6.5px}.formularoot>.formulanodehead{grid-template-columns:minmax(82px,.65fr) minmax(0,1.35fr)}.formularoot>.formulanodehead small{grid-row:2;grid-column:1/3}.formulanodehead[aria-expanded="true"]{background:#eef8f5}.formulastock{grid-template-columns:minmax(0,1fr) auto!important;gap:2px 8px!important;padding:7px 8px!important}.formulastocklot{color:#15564f;font-size:11px;font-weight:950;white-space:nowrap}.formulastockqty{color:#173e35;font-size:11px;font-weight:950;white-space:nowrap}.formulastockplace{grid-column:1/3;color:#425f57;font-size:7px;font-weight:850}.formulastockwarehouse{grid-column:1/3;color:#81908b;font-size:6.5px}@media(max-width:430px){.departmentnav{grid-template-columns:repeat(3,minmax(0,1fr))!important;overflow:visible!important}.departmentnav button{min-width:0!important}}`;
  document.head.append(compactStyle);
  const fitFormulaNavigation = () => {
    const mobile = matchMedia("(max-width:430px)").matches;
    for (const [name, value] of Object.entries(
      mobile
        ? {
            "grid-template-columns": "repeat(3,minmax(0,1fr))",
            overflow: "visible",
            width: "100%",
          }
        : { "grid-template-columns": "", overflow: "", width: "" },
    )) {
      if (value) nav.style.setProperty(name, value, "important");
      else nav.style.removeProperty(name);
    }
  };
  fitFormulaNavigation();
  addEventListener("resize", fitFormulaNavigation, { passive: true });
  const section = document.createElement("section");
  section.id = "formulaWorkspace";
  section.className = "formulaworkspace";
  section.innerHTML = `<div class="formulahead"><header><h2>Formule</h2><small>DISTINTE · DOCUMENTI · GIACENZE</small></header><form id="formulaSearch" class="formulasearch"><input name="code" autocomplete="off" spellcheck="false" placeholder="Codice formula o RS" aria-label="Codice formula o ricerca e sviluppo"><button>Cerca</button></form><div id="formulaStatus" class="formulastatus">Inserisci il codice della formula.</div></div><div id="formulaResult" class="formularesult"></div>`;
  nav.insertAdjacentElement("afterend", section);
  const viewer = document.createElement("div");
  viewer.className = "formulaviewer hidden";
  viewer.innerHTML =
    '<header><strong>Documento</strong><button type="button" aria-label="Chiudi documento">×</button></header><div class="formuladocumentpages" aria-live="polite"></div>';
  document.body.append(viewer);
  const result = section.querySelector("#formulaResult"),
    status = section.querySelector("#formulaStatus"),
    form = section.querySelector("#formulaSearch");
  const bridges = () =>
    window.TECHNICS_BRIDGES || [
      "https://student-tarot-occultist.ngrok-free.dev",
    ];
  let currentCode = "",
    currentData = null,
    refreshTimer = 0,
    requestToken = 0,
    activeBridge = "",
    documentObjectUrl = "";
  const esc = (value) => {
      const el = document.createElement("div");
      el.textContent = String(value ?? "");
      return el.innerHTML;
    },
    num = (value) =>
      new Intl.NumberFormat("it-IT", { maximumFractionDigits: 6 }).format(
        Number(value) || 0,
      ),
    pct = (value) =>
      new Intl.NumberFormat("it-IT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(value) || 0);
  const api = async (path, quiet = false) => {
    let last;
    for (const base of bridges()) {
      try {
        const { response, payload } = await TechnicsDataClient.fetchJson(
          `${base}${path}`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-store",
              "ngrok-skip-browser-warning": "1",
            },
          },
          {
            cacheMs: quiet ? 0 : 12000,
            attempts: quiet ? 1 : 2,
            message: "Dati formula temporaneamente non disponibili.",
          },
        );
        if (response.ok && payload?.ok) {
          activeBridge = base;
          return payload;
        }
        last = new Error(payload?.error || "Lettura formula non disponibile.");
      } catch (error) {
        last = error;
      }
    }
    throw last || new Error("Ponte Technics non disponibile.");
  };
  const nodeRow = (node, relation = "component") =>
    `<article class="formulanode" data-formula-id="${node.id}"><button type="button" class="formulanodehead" data-formula-expand="${node.id}" aria-expanded="false"><b>${esc(node.code)}</b><strong>${esc(node.description)}</strong><span class="formulapct">${relation === "component" ? `${pct(node.percentage)}%` : esc(node.type || "Apri")}</span><small class="formulastockline">Giacenza ${num(node.totalStock)}</small></button><div class="formulanodedetail hidden"></div></article>`;
  const sectionBlock = (title, items, relation) =>
    `<section class="formulasection"><h3>${esc(title)} · ${items.length}</h3>${items.length ? `${relation === "component" ? '<div class="formulacolheads"><span>Codice</span><span>Componente</span><span>%</span></div>' : ""}<div class="formulanodes">${items.map((x) => nodeRow(x, relation)).join("")}</div>` : '<div class="formulaempty">Nessun collegamento presente in Technics.</div>'}</section>`;
  const renderRoot = (data) => {
    const a = data.article,
      parents = Array.isArray(data.parents) ? data.parents : [],
      prefix = `${String(a.code).toUpperCase()}-`,
      packaged = parents.filter((parent) =>
        String(parent.code).toUpperCase().startsWith(prefix),
      );
    result.innerHTML = `<article class="formularoot"><header><b>${esc(a.code)}</b><span>${esc(a.description)}</span><small class="formulatype">${esc(a.type)}</small></header><div class="formulameta"><span>Distinta<b>${a.componentCount}</b></span><span>Confezionati<b>${packaged.length}</b></span><span>INCI<b>${a.inciCount}</b></span><span>Giacenza<b>${num(a.totalStock)} ${esc(a.unit)}</b></span></div><button type="button" class="formulanodehead" data-formula-expand="${a.id}" aria-expanded="false"><b>Scheda formula</b><strong>Documenti, INCI, giacenze e relazioni</strong><small><span class="formulaactive ${a.active ? "" : "inactive"}">${a.active ? "ARTICOLO ATTIVO" : "ARTICOLO NON ATTIVO"}</span></small></button><div class="formulanodedetail hidden" data-root-detail></div></article>${sectionBlock("DISTINTA BASE · MATERIE PRIME", data.components || [], "component")}${sectionBlock("CONFEZIONATI", packaged, "parent")}`;
  };
  const renderDetail = (data) => {
    const docs = (Array.isArray(data.documents) ? data.documents : [])
        .filter((d) => d.exists !== false)
        .sort((a, b) =>
          String(b.date || "").localeCompare(String(a.date || "")),
        ),
      stock = (Array.isArray(data.stock) ? data.stock : []).filter(
        (s) => Number(s.quantity) > 0,
      ),
      inci = Array.isArray(data.inci) ? data.inci : [],
      children = Array.isArray(data.components) ? data.components : [],
      parents = Array.isArray(data.parents) ? data.parents : [],
      defaultPart = inci.length ? "inci" : docs.length ? "docs" : "stock",
      active = (part) => (defaultPart === part ? "active" : ""),
      hidden = (part) => (defaultPart === part ? "" : "hidden");
    return `<div class="formuladetailnav"><button class="${active("docs")}" type="button" data-formula-jump="docs">Documenti ${docs.length}</button><button class="${active("inci")}" type="button" data-formula-jump="inci">INCI ${inci.length}</button><button class="${active("stock")}" type="button" data-formula-jump="stock">Giacenze ${stock.length}</button><button type="button" data-formula-jump="tree">Relazioni ${children.length + parents.length}</button></div><section class="formulaunit ${hidden("docs")}" data-formula-part="docs"><h4>DOCUMENTI APRIBILI · PIÙ RECENTI PRIMA</h4><div>${docs.length ? docs.map((d) => `<article class="formuladoc"><b>${esc(d.date || "Documento")}</b><span>${esc(d.name)}</span><button type="button" data-formula-document="${esc(d.key)}" data-article="${data.article.id}" data-attachment="${d.attachmentId || 0}" data-source="${esc(d.source)}" data-name="${esc(d.name)}">Apri</button></article>`).join("") : '<div class="formulaempty">Nessun file apribile collegato.</div>'}</div></section><section class="formulaunit ${hidden("inci")}" data-formula-part="inci"><h4>COMPOSIZIONE INCI</h4><div>${inci.length ? inci.map((i) => `<article class="formulainci"><b>${esc(i.name || "INCI")}</b><span>${i.cas ? `<span class="formulacas">CAS ${esc(i.cas)}</span>` : ""}${i.function ? esc(i.function) : ""}</span><small>${i.composition == null ? "" : `${pct(i.composition)}%`}</small></article>`).join("") : '<div class="formulaempty">Nessun INCI collegato.</div>'}</div></section><section class="formulaunit ${hidden("stock")}" data-formula-part="stock"><h4>GIACENZE POSITIVE · LOTTI · UBICAZIONI</h4><div>${stock.length ? stock.map((s) => `<article class="formulastock"><b class="formulastocklot">LOTTO ${esc(s.lot || "—")}</b><strong class="formulastockqty">${num(s.quantity)} ${esc(data.article.unit)}</strong><span class="formulastockplace">UBICAZIONE ${esc(s.location || "NON INDICATA")}</span><span class="formulastockwarehouse">${esc(s.warehouse || "")}</span></article>`).join("") : '<div class="formulaempty">Nessuna giacenza positiva.</div>'}</div></section><section class="formulaunit hidden" data-formula-part="tree"><h4>RELAZIONI E SOTTODISTINTE</h4><div>${children.map((x) => `<article class="formulaparent"><b>${esc(x.code)}</b><span>${esc(x.description)}</span><small>${pct(x.percentage)}%</small></article>`).join("")}${parents.map((x) => `<article class="formulaparent"><b>${esc(x.code)}</b><span>${esc(x.description)}</span><small>Utilizzato in</small></article>`).join("") || '<div class="formulaempty">Nessun ulteriore collegamento.</div>'}</div></section>`;
  };
  const expand = async (button) => {
    const article =
        button.closest("[data-formula-id]") || button.closest(".formularoot"),
      id = Number(button.dataset.formulaExpand),
      detail = article.querySelector(":scope > .formulanodedetail");
    if (!detail) return;
    if (!detail.classList.contains("hidden")) {
      detail.classList.add("hidden");
      button.setAttribute("aria-expanded", "false");
      return;
    }
    button.disabled = true;
    try {
      const payload = await api(`/api/formulas/item?id=${id}`);
      detail.innerHTML = renderDetail(payload.result);
      detail.classList.remove("hidden");
      button.setAttribute("aria-expanded", "true");
    } catch (error) {
      detail.innerHTML = `<div class="formulaempty">${esc(error.message)}</div>`;
      detail.classList.remove("hidden");
    } finally {
      button.disabled = false;
    }
  };
  const load = async (code, quiet = false) => {
    const token = ++requestToken;
    if (!quiet) {
      status.classList.remove("error");
      status.textContent = "Lettura distinta, collegamenti e documenti…";
      result.innerHTML = "";
    }
    try {
      const payload = await api(
        `/api/formulas/search?code=${encodeURIComponent(code)}${quiet ? `&fresh=${Date.now()}` : ""}`,
        quiet,
      );
      if (token !== requestToken) return;
      const signature = JSON.stringify([
        payload.result.article,
        payload.result.components,
        payload.result.parents,
      ]);
      if (!quiet || signature !== currentData?.signature) {
        currentData = { signature, data: payload.result };
        renderRoot(payload.result);
      }
      status.classList.remove("error");
      status.textContent = `Dati Technics verificati · ${new Date(payload.result.readAt).toLocaleTimeString("it-IT")} · sola lettura`;
      schedule();
    } catch (error) {
      if (token !== requestToken) return;
      status.classList.add("error");
      status.textContent = error.message || "Formula non disponibile.";
      schedule();
    }
  };
  const schedule = () => {
    clearTimeout(refreshTimer);
    if (!currentCode) return;
    refreshTimer = setTimeout(() => {
      if (
        document.hidden ||
        shell.dataset.workspace !== "formulas" ||
        !viewer.classList.contains("hidden") ||
        document.activeElement === form.elements.code
      )
        schedule();
      else load(currentCode, true);
    }, 15000);
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const code = form.elements.code.value.trim().toUpperCase();
    if (!code) {
      status.classList.add("error");
      status.textContent = "Inserisci un codice formula o RS.";
      return;
    }
    currentCode = code;
    try {
      sessionStorage.setItem("technics-formula-code-v1875", code);
    } catch {}
    load(code);
  });
  let pdfLibraryPromise;
  const pdfWorkerUrl = new URL("vendor/pdfjs/pdf.worker.mjs", document.baseURI)
    .href;
  const renderDocument = async (blob, name) => {
    const pages = viewer.querySelector(".formuladocumentpages");
    pages.innerHTML =
      '<div class="formuladocumentmessage">Apertura documento…</div>';
    const extension = (name.split(".").pop() || "").toLowerCase();
    if (extension === "pdf" || blob.type === "application/pdf") {
      pdfLibraryPromise ||= import("../vendor/pdfjs/pdf.mjs");
      const pdfjs = await pdfLibraryPromise;
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      const pdf = await pdfjs.getDocument({
        data: new Uint8Array(await blob.arrayBuffer()),
      }).promise;
      pages.innerHTML = "";
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber),
          baseViewport = page.getViewport({ scale: 1 }),
          available = Math.max(280, pages.clientWidth - 16),
          scale = Math.min(2, available / baseViewport.width),
          viewport = page.getViewport({ scale }),
          ratio = Math.min(devicePixelRatio || 1, 2),
          canvas = document.createElement("canvas"),
          context = canvas.getContext("2d", { alpha: false });
        canvas.width = Math.floor(viewport.width * ratio);
        canvas.height = Math.floor(viewport.height * ratio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        pages.append(canvas);
        await page.render({
          canvasContext: context,
          viewport,
          transform: ratio === 1 ? null : [ratio, 0, 0, ratio, 0, 0],
        }).promise;
      }
      return;
    }
    if (
      blob.type.startsWith("image/") ||
      /^(png|jpe?g|tiff?)$/.test(extension)
    ) {
      if (documentObjectUrl) URL.revokeObjectURL(documentObjectUrl);
      documentObjectUrl = URL.createObjectURL(blob);
      pages.innerHTML = `<img src="${documentObjectUrl}" alt="${esc(name)}">`;
      return;
    }
    if (documentObjectUrl) URL.revokeObjectURL(documentObjectUrl);
    documentObjectUrl = URL.createObjectURL(blob);
    pages.innerHTML = `<div class="formuladocumentmessage">Documento disponibile.<br><a href="${documentObjectUrl}" download="${esc(name)}">Apri o scarica il file</a></div>`;
  };
  result.addEventListener("click", async (event) => {
    const expandButton = event.target.closest("[data-formula-expand]");
    if (expandButton) {
      expand(expandButton);
      return;
    }
    const jump = event.target.closest("[data-formula-jump]");
    if (jump) {
      const detail = jump.closest(".formulanodedetail");
      detail
        ?.querySelectorAll("[data-formula-jump]")
        .forEach((button) =>
          button.classList.toggle("active", button === jump),
        );
      detail
        ?.querySelectorAll("[data-formula-part]")
        .forEach((part) =>
          part.classList.toggle(
            "hidden",
            part.dataset.formulaPart !== jump.dataset.formulaJump,
          ),
        );
      return;
    }
    const doc = event.target.closest("[data-formula-document]");
    if (!doc) return;
    const query = new URLSearchParams({
      articleId: doc.dataset.article,
      attachmentId: doc.dataset.attachment || "0",
      source: doc.dataset.source || "",
      name: doc.dataset.name || "",
    });
    viewer.querySelector("strong").textContent =
      `Apertura · ${doc.dataset.name}`;
    viewer.querySelector(".formuladocumentpages").innerHTML =
      '<div class="formuladocumentmessage">Caricamento…</div>';
    viewer.classList.remove("hidden");
    let last;
    for (const base of [activeBridge, ...bridges()].filter(
      (value, index, array) => value && array.indexOf(value) === index,
    )) {
      try {
        const response = await fetch(`${base}/api/formulas/document?${query}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-store",
            "ngrok-skip-browser-warning": "1",
          },
        });
        if (!response.ok) throw new Error("Documento non disponibile.");
        const blob = await response.blob();
        activeBridge = base;
        await renderDocument(blob, doc.dataset.name);
        viewer.querySelector("strong").textContent = doc.dataset.name;
        return;
      } catch (error) {
        last = error;
      }
    }
    viewer.querySelector(".formuladocumentpages").innerHTML =
      `<div class="formuladocumentmessage">${esc(last?.message || "Documento non disponibile.")}</div>`;
  });
  const closeViewer = () => {
    viewer.classList.add("hidden");
    viewer.querySelector(".formuladocumentpages").innerHTML = "";
    if (documentObjectUrl) {
      URL.revokeObjectURL(documentObjectUrl);
      documentObjectUrl = "";
    }
    schedule();
  };
  viewer.querySelector("button").addEventListener("click", closeViewer);
  window.addEventListener("technics-workspace-change", (event) => {
    if (event.detail.workspace !== "formulas") {
      clearTimeout(refreshTimer);
      return;
    }
    if (currentCode && currentData) schedule();
  });
  try {
    const saved = sessionStorage.getItem("technics-formula-code-v1875");
    if (saved) {
      form.elements.code.value = saved;
      currentCode = saved;
      if (shell.dataset.workspace === "formulas") load(saved);
    }
  } catch {}
})();
