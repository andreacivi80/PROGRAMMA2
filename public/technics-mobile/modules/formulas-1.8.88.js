(() => {
  const shell = document.querySelector("main.shell"),
    nav = document.querySelector(".departmentnav");
  if (!shell || !nav || document.getElementById("formulaWorkspace")) return;
  const style = document.createElement("style");
  style.id = "formulas-style-v1875";
  style.textContent = `
  .departmentnav button[data-workspace="formulas"]{border-color:#72a7a0!important;color:#17685f!important;background:#eef8f6!important}.departmentnav button[data-workspace="formulas"].active{background:#17685f!important;color:#fff!important}
  .formulaworkspace{display:none}.shell[data-workspace="formulas"]{--workspace-accent:#17685f;--workspace-soft:#eef8f6}.shell[data-workspace="formulas"] .hero,.shell[data-workspace="formulas"] #message,.shell[data-workspace="formulas"] #result,.shell[data-workspace="formulas"] #production,.shell[data-workspace="formulas"] #openPackingHome,.shell[data-workspace="formulas"] #modeShortcut,.shell[data-workspace="formulas"] #planningLookup,.shell[data-workspace="formulas"] .salesorders{display:none!important}.shell[data-workspace="formulas"] .formulaworkspace{display:grid;gap:9px}
  .formulahead{display:grid;gap:8px;padding:12px;border:1px solid #b9d8d2;border-radius:15px;background:#fff}.formulahead header{display:flex;align-items:center;justify-content:space-between}.formulahead h2{margin:0;color:#15564f;font:800 19px/1 Georgia,serif}.formulahead small{color:#617b75;font-size:7px;font-weight:900}.formulasearch{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px}.formulasearch input{min-width:0;height:45px;padding:0 12px;border:1px solid #bcd3ce;border-radius:10px;color:#173e35;font-size:14px;font-weight:850;text-transform:uppercase}.formulasearch button{padding:0 14px;border:0;border-radius:10px;background:#17685f;color:#fff;font-size:9px;font-weight:950}.formulastatus{min-height:16px;color:#617b75;font-size:8px;font-weight:850}.formulastatus.error{color:#a33a35}.formularesult{display:grid;gap:8px}.formularoot{overflow:hidden;border:1px solid #b9d8d2;border-radius:14px;background:#fff}.formularoot>header{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 8px;padding:11px;background:linear-gradient(135deg,#15564f,#238074);color:#fff}.formularoot>header b{font-size:16px}.formularoot>header span{grid-column:1;min-width:0;font-size:11px;font-weight:850}.formulatype{grid-row:1/3;grid-column:2;align-self:center;padding:4px 6px;border-radius:7px;background:#ffffff20;font-size:7px;font-weight:900}.formulameta{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#dbe9e5}.formulameta span{display:grid;gap:2px;padding:7px 4px;background:#f8fbfa;color:#667b75;font-size:6px;text-align:center;text-transform:uppercase}.formulameta b{color:#173e35;font-size:12px;white-space:nowrap}.formulasection{overflow:hidden;border:1px solid #d5e4df;border-radius:12px;background:#fff}.formulasection>h3{margin:0;padding:8px 10px;background:#e9f4f1;color:#15564f;font-size:9px}.formulaempty{padding:12px;color:#75857f;font-size:8px}.formulanodes{display:grid}.formulanode{border-bottom:1px solid #e4ece9}.formulanode:last-child{border:0}.formulanodehead{display:grid;grid-template-columns:minmax(68px,.55fr) minmax(0,1.4fr) auto;gap:3px 7px;align-items:center;width:100%;padding:8px;border:0;background:#fff;text-align:left}.formulanodehead b{color:#15564f;font-size:10px;white-space:nowrap}.formulanodehead strong{min-width:0;color:#243e37;font-size:8px;line-height:1.25}.formulanodehead em{grid-row:1/3;grid-column:3;color:#17685f;font-size:17px;font-style:normal}.formulanodehead small{grid-column:1/3;color:#768780;font-size:7px}.formulanodehead small span{margin-right:7px;white-space:nowrap}.formulanodedetail{display:grid;gap:7px;padding:8px;background:#f5faf8}.formuladetailnav{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}.formuladetailnav button{min-height:34px;padding:3px;border:1px solid #bad3cd;border-radius:8px;background:#fff;color:#17685f;font-size:7px;font-weight:950}.formuladetailnav button.active{border-color:#17685f;background:#17685f;color:#fff}.formulaunit{overflow:hidden;border:1px solid #d4e3df;border-radius:9px;background:#fff}.formulaunit.hidden{display:none}.formulaunit h4{margin:0;padding:6px 8px;background:#edf6f3;color:#15564f;font-size:8px}.formulaunit>div{display:grid;gap:4px;padding:7px}.formulainci,.formulastock,.formuladoc,.formulaparent{display:grid;grid-template-columns:minmax(70px,.7fr) minmax(0,1.3fr) auto;gap:3px 7px;align-items:center;padding:6px;border-radius:7px;background:#f8fbfa}.formulainci b,.formulastock b,.formuladoc b,.formulaparent b{color:#173e35;font-size:8px}.formulainci span,.formulastock span,.formuladoc span,.formulaparent span{min-width:0;color:#647a73;font-size:7px;overflow-wrap:anywhere}.formulainci .formulacas{display:block;color:#173e35;font-size:7.5px;font-weight:900;white-space:normal;word-break:normal}.formulainci small,.formulastock small,.formuladoc small,.formulaparent small{color:#17685f;font-size:7px;font-weight:900;white-space:nowrap}.formuladoc button{min-height:30px;border:0;border-radius:7px;background:#17685f;color:#fff;font-size:7px;font-weight:950}.formuladoc{grid-template-columns:minmax(75px,.65fr) minmax(0,1.35fr) auto}.formuladossier{padding:6px;border-left:3px solid #7caea4;background:#f8fbfa;color:#566e67;font-size:7px}.formulaviewer{position:fixed;inset:0;z-index:20000;display:grid;grid-template-rows:auto 1fr;background:#102b25}.formulaviewer.hidden{display:none}.formulaviewer header{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:6px;padding:max(7px,env(safe-area-inset-top)) 8px 7px;color:#fff}.formulaviewer strong{overflow:hidden;font-size:9px;text-overflow:ellipsis;white-space:nowrap}.formulaviewer button{display:grid;width:28px;height:28px;padding:0;place-items:center;border:1px solid #ffffff55;border-radius:50%;background:#fff;color:#15564f;font-size:15px;line-height:1}.formuladocumentpages{overflow:auto;padding:8px;background:#d8dfdc;text-align:center}.formuladocumentpages canvas{display:block;max-width:100%;height:auto;margin:0 auto 8px;background:#fff;box-shadow:0 1px 7px #0003}.formuladocumentpages img{display:block;max-width:100%;max-height:100%;margin:auto;background:#fff;object-fit:contain}.formuladocumentmessage{padding:24px 12px;color:#173e35;font-size:12px;font-weight:800;text-align:center}.formulaactive{padding:6px 8px;border-radius:8px;background:#e8f5ef;color:#17654f;font-size:8px;font-weight:900}.formulaactive.inactive{background:#fff0ed;color:#9b352e}@media(max-width:430px){.departmentnav{grid-template-columns:repeat(6,minmax(72px,1fr))!important}.formulameta{grid-template-columns:repeat(2,1fr)}.formuladetailnav{grid-template-columns:repeat(2,1fr)}}`;
  document.head.append(style);
  const compactStyle = document.createElement("style");
  compactStyle.textContent = `.formulacolheads,.formulanodehead{display:grid;grid-template-columns:minmax(64px,.58fr) minmax(0,1.42fr) 48px;gap:3px 7px;align-items:center}.formulacolheads{padding:5px 8px;border-bottom:1px solid #dde9e5;background:#f8fbfa;color:#6b7e78;font-size:6px;font-weight:950;text-transform:uppercase}.formulacolheads span:last-child{text-align:right}.formulanodehead{width:100%;padding:8px;border:0;background:#fff;text-align:left}.formulanodehead b{font-size:9px}.formulapct{color:#17685f;font-size:8px;font-weight:950;text-align:right;white-space:nowrap}.formulastockline{grid-row:2;grid-column:2/4;color:#768780;font-size:6.5px}.formularoot>.formulanodehead{grid-template-columns:minmax(82px,.65fr) minmax(0,1.35fr)}.formularoot>.formulanodehead small{grid-row:2;grid-column:1/3}.formulanodehead[aria-expanded="true"]{background:#eef8f5}.formulastock{grid-template-columns:minmax(0,1fr) auto!important;gap:2px 8px!important;padding:7px 8px!important}.formulastocklot{color:#15564f;font-size:11px;font-weight:950;white-space:nowrap}.formulastockqty{color:#173e35;font-size:11px;font-weight:950;white-space:nowrap}.formulastockplace{grid-column:1/3;color:#425f57;font-size:7px;font-weight:850}.formulastockwarehouse{grid-column:1/3;color:#81908b;font-size:6.5px}@media(max-width:430px){.departmentnav{grid-template-columns:repeat(3,minmax(0,1fr))!important;overflow:visible!important}.departmentnav button{min-width:0!important}}`;
  document.head.append(compactStyle);
  const interactionStyle = document.createElement("style");
  interactionStyle.textContent = `
  .formulanodedetail .formuladetailhead .formuladetailback,.formulanodedetail .formuladetailhead .formuladetailclose,body .formulaviewer header button{display:grid!important;width:26px!important;min-width:26px!important;max-width:26px!important;height:26px!important;min-height:26px!important;max-height:26px!important;box-sizing:border-box!important;flex:0 0 26px!important;place-items:center!important;padding:0!important;margin:0!important;border:1px solid #b9d8d2!important;border-radius:50%!important;background:#fff!important;color:#15564f!important;font-family:Arial,sans-serif!important;font-size:14px!important;font-weight:900!important;line-height:1!important;aspect-ratio:1/1!important}
  .formulahead{gap:5px;padding:8px 9px;border-radius:11px}.formulahead h2{font-size:17px}.formulasearch input{height:39px}.formulastatus{min-height:12px}.formulasuggestions{display:grid;max-height:210px;overflow:auto;border:1px solid #b9d8d2;border-radius:9px;background:#fff;box-shadow:0 8px 22px #163f3622}.formulasuggestions.hidden{display:none}.formulasuggestions button{display:grid;grid-template-columns:minmax(62px,.4fr) minmax(0,1.6fr) auto;gap:5px;align-items:center;min-height:34px;padding:5px 7px;border:0;border-bottom:1px solid #e4eeeb;background:#fff;text-align:left}.formulasuggestions button:last-child{border-bottom:0}.formulasuggestions button:focus,.formulasuggestions button:hover{background:#edf7f4}.formulasuggestions b{color:#15564f;font-size:8px;white-space:nowrap}.formulasuggestions span{min-width:0;color:#314c45;font-size:7.5px;font-weight:850}.formulasuggestions small{color:#9b352e;font-size:5.5px;white-space:nowrap}
  .formularoot>header{display:flex;align-items:flex-start;gap:7px;padding:8px 9px}.formularoottitle{display:grid;min-width:0;flex:1;gap:2px}.formularoottitle b{font-size:15px;line-height:1;white-space:nowrap}.formularoottitle span{min-width:0;overflow:visible;font-size:9px;font-weight:850;line-height:1.2;white-space:normal;overflow-wrap:break-word}.formularootactions{display:flex;flex:none;align-items:center;gap:4px}.formularootactions small{padding:3px 5px;border-radius:6px;background:#ffffff1f;font-size:6px;font-weight:950;white-space:nowrap}.formularootactions .formulaactive{background:#dff4e9;color:#155b47}.formularootopen{min-height:27px;padding:3px 7px;border:1px solid #ffffff66;border-radius:7px;background:#fff;color:#15564f;font-size:7px;font-weight:950}
  .formulameta button{display:flex;min-width:0;align-items:center;justify-content:center;gap:4px;padding:5px 3px;border:0;background:#f8fbfa;color:#667b75;font-size:6px;text-transform:uppercase}.formulameta button:focus,.formulameta button:hover{background:#edf7f4;color:#15564f}.formulameta b{color:#173e35;font-size:10px;white-space:nowrap}.formulasection>h3{padding:6px 8px}.formulanodehead{display:block!important;padding:0!important}.formulanodeopen{display:grid;grid-template-columns:minmax(62px,.55fr) minmax(0,1.45fr) 45px;gap:1px 6px;align-items:center;width:100%;padding:4px 7px 2px;border:0;background:#fff;text-align:left}.formulanodeopen[aria-expanded="true"]{background:#eef8f5}.formulanodeopen b{color:#15564f;font-size:9px;white-space:nowrap}.formulanodeopen strong{min-width:0;color:#243e37;font-size:7.5px;line-height:1.08}.formulanodeopen .formulapct{font-size:7.5px}.formulainventorylink{display:flex;width:100%;min-height:18px;align-items:center;justify-content:flex-start;gap:3px;padding:0 7px 2px;border:0;background:#fff;color:#55716a;font-size:6.5px;font-weight:900;line-height:1;text-align:left;white-space:nowrap}.formulainventorylink::after{content:'›';color:#17685f;font-size:11px;line-height:.6}.formulainventorylink:hover,.formulainventorylink:focus{background:#edf7f4;color:#15564f}
  .formulanodedetail{position:fixed;z-index:19980;inset:max(62px,env(safe-area-inset-top)) max(8px,calc((100vw - 680px)/2)) max(8px,env(safe-area-inset-bottom));display:grid;grid-template-rows:auto auto minmax(0,1fr);gap:4px;overflow:hidden;padding:6px;border:1px solid #a9c9c2;border-radius:14px;background:#f5faf8;box-shadow:0 16px 60px #102b2580}.formulanodedetail.hidden{display:none}.formuladetailhead{display:flex;align-items:center;gap:6px;min-width:0;padding:2px 2px 5px}.formuladetailhead b{flex:none;color:#15564f;font-size:11px;white-space:nowrap}.formuladetailhead span{min-width:0;flex:1;overflow:hidden;color:#304c44;font-size:8px;font-weight:850;text-overflow:ellipsis;white-space:nowrap}.formuladetailclose{display:grid!important;width:25px!important;min-width:25px!important;max-width:25px!important;height:25px!important;min-height:25px!important;max-height:25px!important;aspect-ratio:1/1;box-sizing:border-box;padding:0!important;margin-right:6px;flex:0 0 25px!important;place-items:center;border:1px solid #b9d8d2;border-radius:999px!important;background:#fff;color:#15564f;font-size:14px;line-height:1}.formuladetailnav{gap:3px}.formuladetailnav button{min-height:28px;padding:2px;font-size:6.5px}.formulaunit{min-height:0;overflow:auto}.formulaunit h4{position:sticky;z-index:1;top:0;padding:4px 6px;font-size:7px}.formulastockheading{display:flex;align-items:center;justify-content:space-between;gap:6px}.formulastockheading span{min-width:0}.formulastockheading strong{flex:none;color:#15564f;font-size:8px;white-space:nowrap}.formulaunit>div{gap:2px;padding:4px}.formulainci,.formulastock,.formuladoc,.formulaparent{gap:2px 5px;padding:4px 5px;border-radius:5px}.formuladoc{grid-template-columns:58px minmax(0,1fr) 36px}.formuladoc b{font-size:6.5px;white-space:nowrap}.formuladoc span{overflow:hidden;font-size:6.5px;text-overflow:ellipsis;white-space:nowrap}.formuladoc button{min-height:24px;padding:2px;font-size:6px}.formulastock{padding:5px 6px!important}.formulastocklot,.formulastockqty{font-size:9px!important}.formulastockplace{font-size:6.5px!important}.formulastockwarehouse{font-size:6px!important}.formulaparent small{display:none}.formulatreefilterrow{position:sticky;z-index:2;top:0;padding:3px!important;background:#fff}.formulatreefilter{width:100%;height:31px;padding:0 8px;border:1px solid #bad3cd;border-radius:7px;color:#173e35;font-size:8px;font-weight:850}
  .formulaback{position:fixed;z-index:19990;left:max(8px,env(safe-area-inset-left));bottom:max(10px,env(safe-area-inset-bottom));display:flex;align-items:center;gap:5px;min-height:36px;padding:5px 10px;border:1px solid #b9d8d2;border-radius:18px;background:#fff;color:#15564f;box-shadow:0 5px 18px #102b2540;font-size:8px;font-weight:950}.formulaback.hidden{display:none}.formulaback span{font-size:15px}.formulaviewer .formulaback{display:none}
  .formuladetailback{display:grid;width:25px;min-width:25px;height:25px;padding:0;place-items:center;border:1px solid #b9d8d2;border-radius:50%;background:#fff;color:#15564f;font-size:14px;font-weight:950}.formulaparent[data-formula-related-id]{width:100%;border:0;text-align:left;cursor:pointer}.formulaparent[data-formula-related-id]:hover,.formulaparent[data-formula-related-id]:focus{background:#e9f5f1}.formulaparent[data-formula-related-id] small{display:block!important}.formulaparent[data-formula-related-id] small::after{content:' ›';font-size:11px}
  [data-formula-tree-list]>.formulaparent small{display:block!important}.formulaparent.hidden{display:none!important}.formularelations{grid-column:1/-1;border-top:1px solid #dce9e5}.formularelations summary{padding:7px 5px;color:#17685f;font-size:7px;font-weight:950;cursor:pointer}.formularelations .formulaparent{margin-top:2px}
  @media(max-width:430px){.formularoot>header{gap:4px}.formularoottitle{gap:2px}.formularoottitle b{font-size:13px}.formularoottitle span{font-size:8px}.formularootactions small{font-size:5.5px}.formularootopen{padding:2px 5px}.formulameta{grid-template-columns:repeat(4,1fr)}.formulameta button{font-size:5.3px}.formulameta b{font-size:8px}.formulanodeopen{grid-template-columns:minmax(57px,.52fr) minmax(0,1.48fr) 42px}.formuladoc{grid-template-columns:55px minmax(0,1fr) 34px}.formulanodedetail{inset:max(58px,env(safe-area-inset-top)) 5px max(5px,env(safe-area-inset-bottom));border-radius:12px}}
  `;
  document.head.append(interactionStyle);
  const relatedStockStyle = document.createElement("style");
  relatedStockStyle.textContent = `.formulanodeopen{padding:3px 7px 0}.formulainventorylink{min-height:12px;padding:0 7px 2px;font-size:6px}.formulaparent{padding:3px 5px}.formulaparent[data-formula-related-id] .formulaparentsuffix{display:block!important}.formulaparent[data-formula-related-id] .formulaparentsuffix::after{content:' ›';font-size:11px}.formulaparentstock{grid-row:2;grid-column:1;color:#55716a!important;font-size:6px!important;font-weight:900;line-height:1!important;white-space:nowrap!important}.formulaparentdesc{grid-row:1/3;grid-column:2;align-self:center;line-height:1.08}.formulaparentsuffix{grid-row:1/3;grid-column:3;align-self:center}`;
  document.head.append(relatedStockStyle);
  const costLayoutStyle = document.createElement("style");
  costLayoutStyle.id = "formulas-cost-layout-v1899";
  costLayoutStyle.textContent = `
  .formulacolheads,.formulanodeopen{grid-template-columns:70px minmax(0,1fr) 62px!important;gap:2px 7px!important}
  .formulacolheads{padding:5px 8px!important}
  .formulanodehead{display:grid!important;grid-template-columns:minmax(100px,.82fr) minmax(0,1.18fr)!important;align-items:center;border-bottom:1px solid #e4eeeb;background:#fff}
  .formulanodeopen{grid-column:1/3;grid-template-rows:auto!important;width:100%;padding:6px 8px 4px!important;align-items:center!important}
  .formulanodeopen>b{grid-column:1;grid-row:1;font-size:10.5px!important;line-height:1.15!important}
  .formulanodeopen>strong{grid-column:2;grid-row:1;font-size:8.5px!important;line-height:1.14!important}
  .formulanodeopen>.formulapct{grid-column:3;grid-row:1;color:#125f55;font-size:11px!important;font-weight:950;text-align:right;white-space:nowrap}
  .formulacosts{grid-column:2;grid-row:2;display:flex;min-width:0;min-height:21px;align-items:center;justify-content:flex-end;gap:12px;padding:1px 8px 4px;color:#516c65;font-size:8px;font-weight:900;line-height:1.1}
  .formulacosts span{display:flex;min-width:0;align-items:baseline;gap:3px;white-space:nowrap}.formulacosts b{color:#174f46;font-size:9px;white-space:nowrap}
  .formulainventorylink{grid-column:1;grid-row:2;min-height:21px!important;padding:1px 2px 4px 8px!important;font-size:8px!important;overflow:hidden;text-overflow:ellipsis}
  .formulanodeopen>.formulatypecompact,.formulanodehead:not(:has(>.formulacosts)) .formulapct{font-size:8px!important;line-height:1.05;white-space:normal;text-align:right}
  .formulaalternativelog{margin-top:1px}.formulaaltfilters{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:5px!important;padding:7px!important}.formulaaltfilters input{width:100%;height:34px!important;padding:0 7px!important;font-size:8px!important;line-height:34px}.formulaaltfilters input[type='date']{min-width:0;color-scheme:light}.formulaaltrow{grid-template-columns:66px minmax(0,1fr) 62px!important;gap:3px 7px!important;padding:7px 8px!important;text-align:left}.formulaaltrow time{font-size:7px!important;white-space:nowrap}.formulaaltrow>b{font-size:9px!important}.formulaaltrow>strong{font-size:8px!important;line-height:1.18!important;white-space:normal;overflow-wrap:break-word}.formulaaltrow .formulaaltdesc{font-size:7.5px!important;line-height:1.2!important;white-space:normal}.formulaaltrow .formulaaltmetrics{font-size:7px!important;line-height:1.35}.formulaaltrow small{font-size:6.5px!important}
  .formulaaltrow .formulaaltarrow{display:none!important}.formulaaltrow .formulaaltdesc{grid-column:1/3!important;padding-top:2px}.formulaaltrow small{grid-column:1/4!important}
  .formulaaltrow>time{grid-column:1;grid-row:1}.formulaaltrow>b{grid-column:2;grid-row:1}.formulaaltrow>strong{grid-column:1/3;grid-row:2}.formulaaltrow .formulaaltdesc{grid-row:3}.formulaaltrow .formulaaltmetrics{grid-column:3;grid-row:1/5!important}.formulaaltrow>small{grid-column:1/3!important;grid-row:4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .formulaaltgroup{overflow:hidden;border-top:1px solid #dfeae7;background:#fff}.formulaaltgroup:first-child{border-top:0}.formulaaltgrouphead{display:grid;grid-template-columns:66px minmax(0,1fr) 76px;gap:2px 7px;width:100%;padding:7px 8px;border:0;background:#f5faf8;text-align:left}.formulaaltgrouphead time{color:#667d76;font-size:7px}.formulaaltgrouphead b{color:#15564f;font-size:9px}.formulaaltgrouphead strong{grid-column:1/3;min-width:0;color:#2d4941;font-size:8px;line-height:1.18}.formulaaltgrouphead em{grid-column:3;grid-row:1/3;color:#174f46;font-size:6.5px;font-style:normal;font-weight:950;text-align:right;white-space:nowrap}.formulaaltgrouphead small{grid-column:1/4;color:#6b7e78;font-size:6.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.formulaaltgroup h4{margin:0;padding:4px 8px;background:#e8f3f0;color:#15564f;font-size:6.5px;text-transform:uppercase}.formulaaltchoice{display:grid;grid-template-columns:66px minmax(0,1fr) 76px;gap:2px 7px;width:100%;padding:6px 8px;border:0;border-top:1px solid #e5eeeb;background:#fff;text-align:left}.formulaaltchoice>b{color:#15564f;font-size:8.5px}.formulaaltchoice>strong{min-width:0;color:#304c44;font-size:7.5px;line-height:1.16}.formulaaltchoice>span{grid-column:3;grid-row:1/3;color:#174f46;font-size:6.5px;font-weight:950;text-align:right;white-space:nowrap}.formulaaltchoice>small{grid-column:1/3;color:#70817c;font-size:6.2px}
  .formulamaterialaudit{overflow:hidden;margin-top:1px;border:1px solid #c8d8d3;border-radius:11px;background:#fff}.formulamaterialaudit>summary{display:flex;align-items:center;gap:6px;padding:8px 9px;color:#15564f;font-size:8px;font-weight:950;cursor:pointer;list-style:none}.formulamaterialaudit>summary::-webkit-details-marker{display:none}.formulamaterialaudit>summary::after{content:'+';margin-left:3px;font-size:14px}.formulamaterialaudit[open]>summary::after{content:'−'}.formulamaterialaudit>summary b{margin-left:auto;padding:3px 5px;border-radius:6px;background:#eef3f1;color:#536b64;font-size:6px}.formulaauditfilters{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:5px!important;padding:7px!important;border-top:1px solid #e0ebe8;background:#f8fbfa}.formulaauditfilters>input[type='search']{grid-column:1/3;width:100%;height:34px;padding:0 8px;border:1px solid #bad3cd;border-radius:7px;color:#173e35;font-size:8px;font-weight:850}.formulaauditfilters button{height:32px;border:0;border-radius:7px;background:#17685f;color:#fff;font-size:7px;font-weight:950}.formulaauditfilters button.secondary{border:1px solid #bad3cd;background:#fff;color:#17685f}.formulaauditstatus{grid-column:1/3;color:#647a73;font-size:6.5px;font-weight:850}.formulaauditgroups{display:grid;gap:3px;padding:5px;background:#f6faf8}.formulaauditgroup{overflow:hidden;border:1px solid #d8e4e0;border-radius:8px;background:#fff}.formulaauditgroup>summary{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;padding:7px;color:#294b42;font-size:7.5px;font-weight:950;cursor:pointer;list-style:none}.formulaauditgroup>summary b{font-size:9px}.formulaauditrow{display:grid;grid-template-columns:64px minmax(0,1fr) 64px;gap:2px 7px;width:100%;padding:6px 7px;border:0;border-top:1px solid #e5eeeb;background:#fff;text-align:left}.formulaauditrow>b{color:#15564f;font-size:9px;white-space:nowrap}.formulaauditrow>strong{min-width:0;color:#304c44;font-size:8px;line-height:1.18}.formulaauditrow>em{color:#6b4339;font-size:6.5px;font-style:normal;font-weight:950;text-align:right}.formulaauditrow>small{grid-column:1/4;color:#697c76;font-size:6.3px;white-space:normal}.formulaauditrow.warn{border-left:3px solid #bd694f}.formulaauditrow.old{border-left:3px solid #bd9a4f}
  .formularoot>header{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:5px!important}.formularoottitle{grid-column:1;width:100%}.formularoottitle span{font-size:9px!important}.formularootactions{grid-column:1;display:flex!important;width:100%;align-items:center;gap:4px!important}.formularootactions .formulametacost{display:flex;min-width:0;flex:1;align-items:baseline;justify-content:center;gap:5px;padding:4px 7px}.formularootactions .formulametacost b{font-size:10px}
  @media(max-width:360px){.formulacolheads,.formulanodeopen{grid-template-columns:64px minmax(0,1fr) 58px!important}.formulanodehead{grid-template-columns:94px minmax(0,1fr)!important}.formulacosts{gap:7px;padding-right:6px;font-size:7px}.formulacosts b{font-size:8px}.formulainventorylink{font-size:7px!important}}
  `;
  document.head.append(costLayoutStyle);
  const integrityStyle = document.createElement("style");
  integrityStyle.id = "formulas-integrity-v1890";
  integrityStyle.textContent = `
  body.formula-detail-open{overflow:hidden!important;overscroll-behavior:none!important}
  .formulanodedetail{overscroll-behavior:contain;touch-action:pan-y}
  .formulaunit{overscroll-behavior:contain;touch-action:pan-y;scrollbar-gutter:stable}
  .formulaunit>div,[data-formula-tree-list]{min-width:0}
  .formulainci{grid-template-columns:minmax(92px,.9fr) minmax(0,1.1fr) auto;align-items:start}
  .formulainci b,.formulainci span,.formulainci small{min-width:0;max-width:100%}
  .formulainci b{font-size:clamp(6.7px,2vw,8px);line-height:1.22;white-space:normal;word-break:normal;overflow-wrap:break-word;hyphens:none}
  .formulainci>span{font-size:clamp(6.3px,1.85vw,7px);line-height:1.22;white-space:normal;word-break:normal;overflow-wrap:break-word;hyphens:none}
  .formulainci .formulacas{line-height:1.2;overflow-wrap:normal;word-break:normal}
  .formuladoc{align-items:start}
  .formuladoc b{padding-top:4px}
  .formuladoc span{display:block!important;overflow:visible!important;font-size:clamp(6.2px,1.8vw,7px)!important;line-height:1.22!important;text-overflow:clip!important;white-space:normal!important;word-break:normal!important;overflow-wrap:break-word!important;hyphens:none!important}
  .formuladoc button{align-self:center}
  .formulastock{grid-template-columns:minmax(0,1fr) auto!important;column-gap:12px!important;row-gap:3px!important}
  .formulastockplace{min-width:0;padding-top:1px;line-height:1.2;white-space:normal!important;word-break:normal!important;overflow-wrap:break-word!important}
  .formulastockwarehouse{min-width:0;padding-top:2px;border-top:1px solid #e5efec;line-height:1.22;white-space:normal!important;word-break:normal!important;overflow-wrap:break-word!important;hyphens:none!important}
  .formuladetailhead span{display:-webkit-box;overflow:hidden;text-overflow:clip;white-space:normal;word-break:normal;overflow-wrap:break-word;-webkit-box-orient:vertical;-webkit-line-clamp:2;line-clamp:2;line-height:1.18}
  .formulaparentdesc,.formulanodeopen strong,.formularoottitle span{white-space:normal;word-break:normal;overflow-wrap:break-word;hyphens:none}
  .formuladoccheck{display:grid;gap:4px;padding:5px!important;background:#f6faf8}.formuladocprogress{display:flex;align-items:center;justify-content:space-between;gap:6px;color:#58716a;font-size:6.5px;font-weight:900}.formuladocprogress b{color:#15564f;font-size:7px}.formuladocbadges{display:flex!important;flex-wrap:wrap;gap:3px!important;padding:0!important}.formuladocbadge{padding:3px 5px;border:1px solid #d2dfdb;border-radius:99px;background:#fff;color:#778883;font-size:6px;font-weight:900;white-space:nowrap}.formuladocbadge.present{border-color:#a9d4c4;background:#e5f5ee;color:#17634f;cursor:pointer}.formuladocbadge.present:focus{outline:1px solid #17634f;outline-offset:1px}.formuladocsearch{display:block;width:100%;height:17px;margin-top:8px;padding:0 8px;border:1px solid #bad3cd;border-radius:7px;color:#173e35;font-size:6.3px;font-weight:850}.formuladocsectiontitle{margin:5px 4px 1px;color:#315f55;font-size:6px;font-weight:950;letter-spacing:.35px;text-transform:uppercase}.formuladocsectiontitle.obsolete{margin-top:7px;padding-top:5px;border-top:1px solid #dce8e4;color:#71817c}.formuladoclist{display:grid;gap:2px!important;padding:4px!important}.formuladoc.current{border-left:3px solid #42a879}.formuladoc.previous{border-left:3px solid #bdc9c5;opacity:.82}.formuladoc.current,.formuladoc.previous{grid-template-columns:52px minmax(0,1fr) 34px;align-items:start}.formuladoc.current>button,.formuladoc.previous>button{align-self:center;width:34px;min-width:34px;height:24px;min-height:24px;padding:0}.formuladocmeta{display:block!important;color:#71847d!important;font-size:5.8px!important}.formuladocstate{display:inline-block;margin-left:4px;padding:2px 4px;border-radius:5px;background:#e5f5ee;color:#17634f;font-size:5.5px;font-weight:950}.formuladocstate.previous{background:#eef1f0;color:#70807b}.formuladocobsolete{margin:0 0 4px}.formuladocprevious{margin:0}
  .formuladoccategorychoices{display:grid;gap:3px;padding:4px;border:1px solid #b9d8d2;border-radius:7px;background:#fff}.formuladoccategorychoices.hidden{display:none}.formuladoccategoryhead{display:flex;align-items:center;justify-content:space-between;gap:7px;min-height:27px;color:#15564f;font-size:6.2px;font-weight:950}.formuladoccategoryhead .formuladetailclose{margin:0!important}.formuladoccategorylist{display:grid;gap:3px}.formuladoccategorychoice{display:grid;grid-template-columns:58px minmax(0,1fr);gap:7px;align-items:center;width:100%;min-height:29px;padding:4px 6px;border:0;border-left:3px solid #42a879;border-radius:5px;background:#f6faf8;color:#314c45;text-align:left}.formuladoccategorychoice.previous{border-left-color:#bdc9c5;opacity:.8}.formuladoccategorychoice b{display:grid;gap:2px;align-content:center;font-size:5.8px;line-height:1.1;white-space:nowrap}.formuladoccategorychoice span{min-width:0;font-size:6.2px;line-height:1.25;white-space:normal;overflow-wrap:break-word}.formuladoccategorychoice small{display:block;color:#71847d;font-size:5.3px;font-weight:900;line-height:1.1}
  .formuladocsubcategorytitle{margin:2px 1px;color:#58716a;font-size:5.8px;font-weight:950;text-transform:uppercase}
  .formularootactions{display:grid!important;grid-template-columns:auto auto auto;gap:3px 4px!important;justify-items:end}.formulametacost{grid-column:1/4;display:flex;min-width:112px;align-items:baseline;justify-content:center;gap:5px;padding:4px 7px;border-radius:7px;background:#dff4e9;color:#155b47;font-size:6.5px;font-weight:950;text-align:center;white-space:nowrap}.formulametacost b{font-size:10px}.formulaprice{display:grid;grid-column:3;grid-row:1/3;align-self:center;gap:1px;text-align:right;white-space:nowrap}.formulaprice b{color:#15564f;font-size:7px}.formulaprice small{color:#647a73;font-size:5.7px;font-weight:900}.formulainventorylink{font-weight:950!important}.formulaalternative{display:grid;grid-template-columns:58px minmax(0,1fr) auto;gap:2px 6px;align-items:center;width:100%;padding:5px 6px;border:0;border-bottom:1px solid #e3ece9;background:#fff;text-align:left}.formulaalternative:last-child{border-bottom:0}.formulaalternative b{color:#15564f;font-size:8px;white-space:nowrap}.formulaalternative span{min-width:0;color:#304c44;font-size:7px;font-weight:850}.formulaalternative strong{color:#15564f;font-size:7px;white-space:nowrap}.formulaalternative small{grid-column:1/3;color:#647a73;font-size:6px}.formulaalternative em{grid-column:3;grid-row:2;color:#55716a;font-size:6px;font-style:normal;font-weight:900;white-space:nowrap}.formulaalternative.cheaper strong{color:#17714f}.formulaalternative.cheaper::after{content:'PREZZO INFERIORE';grid-column:1/4;color:#17714f;font-size:5.5px;font-weight:950;text-align:right}.formulameta{grid-template-columns:repeat(5,minmax(0,1fr))}
  .formulaalternativelog{overflow:hidden;border:1px solid #b9d8d2;border-radius:11px;background:#fff}.formulaalternativelog>summary{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:8px 9px;color:#15564f;font-size:8px;font-weight:950;cursor:pointer;list-style:none}.formulaalternativelog>summary::-webkit-details-marker{display:none}.formulaalternativelog>summary::after{content:'+';font-size:14px}.formulaalternativelog[open]>summary::after{content:'−'}.formulaalternativelog>summary b{margin-left:auto;padding:3px 5px;border-radius:6px;background:#e8f5ef;color:#17654f;font-size:6px}.formulaaltfilters{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:6px;border-top:1px solid #e0ebe8;background:#f8fbfa}.formulaaltfilters input{min-width:0;height:32px;padding:0 6px;border:1px solid #bad3cd;border-radius:7px;color:#173e35;font-size:7px;font-weight:850}.formulaaltfilters input[type='search']{grid-column:1/3}.formulaaltfilters button{height:29px;border:0;border-radius:7px;background:#17685f;color:#fff;font-size:6.5px;font-weight:950}.formulaaltfilters button.secondary{border:1px solid #bad3cd;background:#fff;color:#17685f}.formulaaltstatus{grid-column:1/3;color:#647a73;font-size:6px;font-weight:850}.formulaaltrows{display:grid;max-height:330px;overflow:auto}.formulaaltrow{display:grid;grid-template-columns:50px minmax(0,1fr) 50px;gap:2px 5px;align-items:center;padding:5px 7px;border-top:1px solid #e5eeeb}.formulaaltrow time{color:#647a73;font-size:6px;font-weight:900}.formulaaltrow b{color:#15564f;font-size:7.5px;white-space:nowrap}.formulaaltrow strong{min-width:0;color:#304c44;font-size:7px}.formulaaltrow .formulaaltarrow{grid-column:1;color:#71847d;font-size:10px;text-align:center}.formulaaltrow .formulaaltdesc{grid-column:2;color:#536c65;font-size:6.5px}.formulaaltrow .formulaaltmetrics{grid-column:3;grid-row:1/3;color:#15564f;font-size:5.8px;font-weight:900;text-align:right;white-space:nowrap}.formulaaltrow small{grid-column:1/4;color:#71847d;font-size:5.5px}
  @media(max-width:430px){
    .formulainci{grid-template-columns:minmax(84px,.92fr) minmax(0,1.08fr) auto}
    .formuladoc{grid-template-columns:52px minmax(0,1fr) 34px}
    .formulastock{column-gap:10px!important}
  }`;
  document.head.append(integrityStyle);
  // Il layout mobile dei costi deve essere l'ultima regola applicata: le
  // regole storiche di integrita non devono ricomprimere titolo e valori.
  document.head.append(costLayoutStyle);
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
  section.innerHTML = `<div class="formulahead"><header><h2>Formule</h2><small>DISTINTE · DOCUMENTI · GIACENZE</small></header><form id="formulaSearch" class="formulasearch"><input name="code" autocomplete="off" spellcheck="false" placeholder="Codice o descrizione formula / RS" aria-label="Codice o descrizione formula o ricerca e sviluppo"><button>Cerca</button></form><div class="formulasuggestions hidden" data-formula-suggestions></div><div id="formulaStatus" class="formulastatus">Inserisci il codice o parte della descrizione.</div></div><div id="formulaResult" class="formularesult"></div><details class="formulaalternativelog"><summary>Nuovi alternativi materie prime <b>ULTIMI 3 MESI</b></summary><div class="formulaaltfilters"><input type="date" data-alt-from aria-label="Data iniziale alternativi"><input type="date" data-alt-to aria-label="Data finale alternativi"><input type="search" data-alt-query placeholder="Cerca codice o descrizione" aria-label="Cerca alternativo per codice o descrizione"><button type="button" data-alt-show>Mostra periodo</button><button type="button" class="secondary" data-alt-reset>Ultimi 3 mesi</button><div class="formulaaltstatus" data-alt-status>Apri per verificare i nuovi alternativi.</div></div><div class="formulaaltrows" data-alt-rows></div></details>`;
  nav.insertAdjacentElement("afterend", section);
  section.querySelector("#formulaSearch input").placeholder = "Codice o descrizione";
  const alternativePanel = section.querySelector(".formulaalternativelog");
  alternativePanel.innerHTML = `<summary>Nuovi alternativi materie prime <b>ULTIMI 3 MESI</b></summary><form id="formulaAlternativeRange" class="schedulerange formulaaltfilters"><label>Dal <input name="from" type="date" lang="it-IT" data-alt-from required><output data-alt-date="from">gg/mm/aaaa</output></label><label>Al <input name="to" type="date" lang="it-IT" data-alt-to required><output data-alt-date="to">gg/mm/aaaa</output></label><input type="search" data-alt-query placeholder="Cerca codice o descrizione" aria-label="Cerca alternativo per codice o descrizione"><button type="button" data-alt-show>Mostra periodo</button><button type="button" class="secondary" data-alt-reset>Ultimi 3 mesi</button><div class="formulaaltstatus" data-alt-status>Apri per verificare i nuovi alternativi.</div></form><div class="formulaaltrows" data-alt-rows></div>`;
  const materialAuditPanel = document.createElement("details");
  materialAuditPanel.className = "formulamaterialaudit";
  materialAuditPanel.innerHTML = `<summary>Materie prime codificate da verificare <b>7000–7999</b></summary><form id="formulaMaterialAuditRange" class="schedulerange formulaauditfilters"><label>Dal <input name="from" type="date" lang="it-IT"><output data-audit-date="from">gg/mm/aaaa</output></label><label>Al <input name="to" type="date" lang="it-IT"><output data-audit-date="to">gg/mm/aaaa</output></label><input type="search" data-audit-query placeholder="Cerca codice o descrizione"><button type="button" data-audit-show>Mostra</button><button type="button" class="secondary" data-audit-reset>Azzera filtri</button><div class="formulaauditstatus" data-audit-status>Apri per eseguire il controllo Technics.</div></form><div class="formulaauditgroups" data-audit-groups></div>`;
  alternativePanel.insertAdjacentElement("afterend", materialAuditPanel);
  const viewer = document.createElement("div");
  viewer.className = "formulaviewer hidden";
  viewer.innerHTML =
    '<header><strong>Documento</strong><button type="button" aria-label="Chiudi documento">×</button></header><div class="formuladocumentpages" aria-live="polite"></div>';
  document.body.append(viewer);
  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "formulaback hidden";
  backButton.innerHTML = "<span>←</span><b>Torna</b>";
  document.body.append(backButton);
  const result = section.querySelector("#formulaResult"),
    status = section.querySelector("#formulaStatus"),
    form = section.querySelector("#formulaSearch");
  const bridges = () =>
    window.TECHNICS_BRIDGES || [
      location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8792"
        : "https://paintball-california-des-configure.trycloudflare.com",
    ];
  let currentCode = "",
    currentData = null,
    refreshTimer = 0,
    requestToken = 0,
    activeBridge = "",
    documentObjectUrl = "",
    lastExpandedButton = null,
    formulaScrollY = 0;
  const detailHistory = new WeakMap();
  const documentChecklistTokens = new WeakMap();
  const documentCategoryMaps = new WeakMap();
  const documentTopicMaps = new WeakMap();
  const syncDetailScrollLock = () =>
    document.body.classList.toggle(
      "formula-detail-open",
      Boolean(result?.querySelector(".formulanodedetail:not(.hidden)")),
    );
  const resetFormulaSession = () => {
    clearTimeout(refreshTimer);
    requestToken += 1;
    currentCode = "";
    currentData = null;
    lastExpandedButton = null;
    form.elements.code.value = "";
    result.innerHTML = "";
    status.classList.remove("error");
    status.textContent = "Inserisci il codice della formula.";
    viewer.classList.add("hidden");
    viewer.querySelector(".formuladocumentpages").innerHTML = "";
    document.body.classList.remove("formula-detail-open");
    backButton.dataset.mode = "formula";
    backButton.classList.add("hidden");
    try {
      sessionStorage.removeItem("technics-formula-code-v1875");
    } catch {}
  };
  const updateBackButton = () => {
    const workspace = shell.dataset.workspace;
    if (backButton.dataset.mode === "inventory" && workspace === "inventory") {
      backButton.classList.remove("hidden");
      backButton.querySelector("b").textContent = "Torna a Formule";
      return;
    }
    backButton.dataset.mode = "formula";
    backButton.classList.toggle(
      "hidden",
      workspace !== "formulas" || !currentData,
    );
    backButton.querySelector("b").textContent = lastExpandedButton
      ? "Torna alla formula"
      : "Torna su";
  };
  const esc = (value) => {
      const el = document.createElement("div");
      el.textContent = String(value ?? "");
      return el.innerHTML;
    },
    num = (value) =>
      new Intl.NumberFormat("it-IT", { maximumFractionDigits: 6 }).format(
        Number(value) || 0,
      ),
    num2 = (value) =>
      new Intl.NumberFormat("it-IT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(value) || 0),
    euro = (value) =>
      new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }).format(Number(value) || 0),
    displayDate = (value) => {
      const raw = String(value || "").trim();
      if (!raw) return "—";
      const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
      return match ? `${match[3]}/${match[2]}/${match[1]}` : raw;
    },
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
            cacheMs: quiet || /\/api\/formulas\/(search|suggest)/.test(path) ? 0 : 12000,
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
    `<article class="formulanode" data-formula-id="${node.id}"><div class="formulanodehead"><button type="button" class="formulanodeopen" data-formula-expand="${node.id}" aria-expanded="false"><b>${esc(node.code)}</b><strong>${esc(node.description)}</strong>${relation === "component" ? `<span class="formulapct">${pct(node.percentage)}%</span>` : `<span class="formulapct">${esc(node.type || "Apri")}</span>`}</button><button type="button" class="formulainventorylink" data-formula-inventory="${esc(node.code)}">Giacenza ${num2(node.totalStock)} ${esc(node.unit || "")}</button>${relation === "component" ? `<span class="formulacosts"><span>Prezzo/kg <b>${euro(node.unitCost)}</b></span><span>Quota <b>${euro(node.costContribution)}</b></span></span>` : ""}</div><div class="formulanodedetail hidden"></div></article>`;
  const sectionBlock = (title, items, relation) => {
    const ordered = relation === "component"
      ? [...items].sort(
          (a, b) => Number(b.percentage || 0) - Number(a.percentage || 0),
        )
      : items;
    return `<section class="formulasection" data-formula-section="${relation}"><h3>${esc(title)} · ${ordered.length}</h3>${ordered.length ? `${relation === "component" ? '<div class="formulacolheads"><span>Codice</span><span>Componente</span><span>%</span></div>' : ""}<div class="formulanodes">${ordered.map((x) => nodeRow(x, relation)).join("")}</div>` : '<div class="formulaempty">Nessun collegamento presente in Technics.</div>'}</section>`;
  };
  const renderRoot = (data) => {
    const a = data.article,
      parents = Array.isArray(data.parents) ? data.parents : [],
      prefix = `${String(a.code).toUpperCase()}-`,
      packaged = parents.filter((parent) =>
        String(parent.code).toUpperCase().startsWith(prefix),
      );
    const alternatives = Array.isArray(data.alternatives) ? data.alternatives : [];
    result.innerHTML = `<article class="formularoot"><header><div class="formularoottitle"><b>${esc(a.code)}</b><span>${esc(a.description)}</span></div><div class="formularootactions"><span class="formulametacost">COSTO FORMULA<b>${euro(data.formulaCost)}/${esc(a.unit || "UM")}</b></span><small>${esc(a.type)}</small><small class="formulaactive ${a.active ? "" : "inactive"}">${a.active ? "ATTIVO" : "NON ATTIVO"}</small><button type="button" class="formularootopen" data-formula-expand="${a.id}" aria-expanded="false">Scheda</button></div></header><div class="formulameta"><button type="button" data-formula-summary="component">Distinta<b>${a.componentCount}</b></button><button type="button" data-formula-summary="parent">Confezionati<b>${packaged.length}</b></button><button type="button" data-formula-summary="inci">INCI<b>${a.inciCount}</b></button><button type="button" data-formula-summary="alternative">Alternativi<b>${alternatives.length}</b></button><button type="button" data-formula-summary="stock">Giacenza<b>${num2(a.totalStock)} ${esc(a.unit)}</b></button></div><div class="formulanodedetail hidden" data-root-detail></div></article>${sectionBlock("DISTINTA BASE · MATERIE PRIME", data.components || [], "component")}${sectionBlock("CONFEZIONATI", packaged, "parent")}`;
    updateBackButton();
  };
  const renderRelated = (item, suffix = "Apri") =>
    `<button type="button" class="formulaparent" data-formula-related-id="${Number(item.id) || 0}"><b>${esc(item.code)}</b><span class="formulaparentdesc">${esc(item.description)}</span><small class="formulaparentsuffix">${esc(suffix)}</small><span class="formulaparentstock">Giacenza ${num2(item.totalStock)} ${esc(item.unit || "")}</span></button>`;
  const checklistLabels = ["Scheda di sicurezza", "Scheda tecnica", "Halal", "Kosher", "Solventi", "Ossido di etilene", "VOC", "Composizione", "Food contact / Additivi", "Allergeni", "Glutine", "OGM / GMO", "Origine animale / BSE-TSE", "Palm oil / RSPO", "Vegano", "CMR / SVHC", "Nanomateriali", "Metalli pesanti", "Microplastiche", "Formaldeide", "Ftalati", "IPA / PAH", "Nitrosammine", "Melamina", "Lattice", "Antibiotici / Ormoni", "PFAS", "Pesticidi", "REACH", "ISO 16128", "Dossier regolatorio", "Dichiarazione", "PIF", "Altri documenti"];
  const documentButton = (document, articleId, previous = false) => {
    const categories = (document.analysis?.categories || []).map((item) => item.label),
      search = [document.name, document.description, document.category, document.analysis?.revision, ...categories].join(" ").toLocaleUpperCase("it-IT");
    return `<article class="formuladoc ${previous ? "previous" : "current"}" data-formula-document-row data-search="${esc(search)}"><b>${esc(displayDate(document.date))}<span class="formuladocmeta">${esc(document.source || "ARCHIVIO")}${document.analysis?.pageCount ? ` · ${document.analysis.pageCount} pag.` : ""}</span></b><span title="${esc(document.name)}">${esc(document.name)}${document.analysis?.revision ? `<i class="formuladocstate${previous ? " previous" : ""}">REV. ${esc(document.analysis.revision)}</i>` : previous ? '<i class="formuladocstate previous">REVISIONE PRECEDENTE</i>' : ""}</span><button type="button" data-formula-document="${esc(document.key)}" data-article="${articleId}" data-attachment="${document.attachmentId || 0}" data-source="${esc(document.source)}" data-name="${esc(document.name)}">Apri</button></article>`;
  };
  const documentActionAttributes = (document, articleId) =>
    `data-formula-document="${esc(document.key)}" data-article="${articleId}" data-attachment="${document.attachmentId || 0}" data-source="${esc(document.source)}" data-name="${esc(document.name)}"`;
  const categoryDocumentRows = (documents, articleId) => documents.map((item) =>
    `<button type="button" data-formula-category-choice class="formuladoccategorychoice${item.revisionState === "previous" ? " previous" : ""}" ${documentActionAttributes(item, articleId)}><b><span>${esc(displayDate(item.date))}</span><small>${item.revisionState === "previous" ? "PRECEDENTE" : "CORRENTE"}</small></b><span>${esc(item.name)}</span></button>`
  ).join("");
  const renderDocumentChecklist = (section, payload, articleId) => {
    if (!section) return;
    const documents = Array.isArray(payload?.documents) ? payload.documents : [],
      current = documents.filter((item) => item.revisionState !== "previous"),
      previous = documents.filter((item) => item.revisionState === "previous"),
      documentsByCategory = new Map(),
      analyzed = documents.filter((item) => item.analysis).length;
    [...current, ...previous]
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
      .forEach((item) => ((item.analysis?.categories || []).length ? item.analysis.categories : [{ label: "Altri documenti" }]).forEach((category) => {
        const matches = documentsByCategory.get(category.label) || [];
        if (!matches.includes(item)) matches.push(item);
        documentsByCategory.set(category.label, matches);
      }));
    documentCategoryMaps.set(section, documentsByCategory);
    section.innerHTML = `<h4>DOCUMENTI · CHECKLIST E REVISIONI</h4><div class="formuladoccheck"><div class="formuladocprogress"><span>Analisi contenuto reale</span><b>${payload?.complete ? "COMPLETA" : `${analyzed}/${documents.length} · IN CORSO`}</b></div><div class="formuladocbadges">${checklistLabels.map((label) => { const matches = documentsByCategory.get(label) || [], latest = matches[0]; return latest ? `<span role="button" tabindex="0" class="formuladocbadge present" ${matches.length === 1 ? documentActionAttributes(latest, articleId) : `data-formula-category="${esc(label)}" data-article="${articleId}"`} aria-label="${matches.length === 1 ? "Apri" : "Mostra"} ${esc(label)}${matches.length > 1 ? `: ${matches.length} documenti` : `: ${esc(latest.name)}`}" title="${matches.length === 1 ? `Apri: ${esc(latest.name)}` : `Mostra ${matches.length} documenti`}">✓ ${esc(label)}${matches.length > 1 ? ` · ${matches.length}` : ""}</span>` : `<span class="formuladocbadge">${esc(label)}</span>`; }).join("")}</div><div class="formuladoccategorychoices hidden" data-formula-category-choices></div><input class="formuladocsearch" type="search" placeholder="Cerca documento" aria-label="Cerca documento, categoria o revisione"></div><div class="formuladocsectiontitle">Documenti correnti · ${current.length}</div><div class="formuladoclist">${current.length ? current.map((item) => documentButton(item, articleId)).join("") : '<div class="formulaempty">Nessun documento corrente.</div>'}</div>${previous.length ? `<div class="formuladocobsolete"><div class="formuladocsectiontitle obsolete">Documentazione obsoleta · revisioni superate · ${previous.length}</div><div class="formuladoclist formuladocprevious">${previous.map((item) => documentButton(item, articleId, true)).join("")}</div></div>` : ""}`;
  };
  const loadDocumentChecklist = async (detail, articleId) => {
    const token = (documentChecklistTokens.get(detail) || 0) + 1;
    documentChecklistTokens.set(detail, token);
    const initialCheck = detail.querySelector('[data-formula-part="docs"] .formuladoccheck');
    if (initialCheck && !initialCheck.querySelector('.formuladocbadges'))
      initialCheck.insertAdjacentHTML('beforeend', `<div class="formuladocbadges">${checklistLabels.map((label) => `<span class="formuladocbadge">${esc(label)}</span>`).join('')}</div>`);
    let remaining = 1;
    while (remaining > 0 && detail.isConnected && !detail.classList.contains("hidden") && documentChecklistTokens.get(detail) === token) {
      try {
        const payload = await api(`/api/formulas/document-checklist?articleId=${articleId}&limit=2&fresh=${Date.now()}`, true);
        if (documentChecklistTokens.get(detail) !== token) return;
        renderDocumentChecklist(detail.querySelector('[data-formula-part="docs"]'), payload.result, articleId);
        remaining = Number(payload.result?.remaining || 0);
        if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, 250));
      } catch (error) {
        const target = detail.querySelector(".formuladocprogress b");
        if (target) target.textContent = "RIPRESA AUTOMATICA";
        return;
      }
    }
  };
  const renderDetail = (data, canGoBack = false) => {
    const docs = (Array.isArray(data.documents) ? data.documents : [])
        .filter((d) => d.exists !== false)
        .sort((a, b) =>
          String(b.date || "").localeCompare(String(a.date || "")),
        ),
      stock = (Array.isArray(data.stock) ? data.stock : []).filter(
        (s) => Number(s.quantity) > 0,
      ),
      stockTotal = stock.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0,
      ),
      inci = Array.isArray(data.inci) ? data.inci : [],
      alternatives = Array.isArray(data.alternatives) ? data.alternatives : [],
      children = Array.isArray(data.components) ? data.components : [],
      parents = Array.isArray(data.parents) ? data.parents : [],
      isPackaged = String(data.article.code || "").includes("-") ||
        /prodotto finito|confezion/i.test(String(data.article.type || "")),
      treeLabel = children.length ? "Distinta" : "Collegamenti",
      defaultPart = children.length
        ? "tree"
        : inci.length
          ? "inci"
          : docs.length
            ? "docs"
            : "stock",
      active = (part) => (defaultPart === part ? "active" : ""),
      hidden = (part) => (defaultPart === part ? "" : "hidden");
    if (!isPackaged)
      children.sort(
        (a, b) => Number(b.percentage || 0) - Number(a.percentage || 0),
      );
    const alternativeRows = alternatives.map((item) => `<button type="button" class="formulaalternative${Number(item.unitCost) > 0 && Number(data.article.unitCost) > 0 && Number(item.unitCost) < Number(data.article.unitCost) ? " cheaper" : ""}" data-formula-related-id="${Number(item.id) || 0}"><b>${esc(item.code)}</b><span>${esc(item.description)}</span><strong>${euro(item.unitCost)}/${esc(item.unit || "UM non indicata")}</strong><small>Giacenza ${num2(item.totalStock)} ${esc(item.unit || "UM non indicata")}${item.relation ? ` · ${esc(item.relation)}` : ""}</small><em>${Number(data.article.unitCost) > 0 ? `${Number(item.unitCost) - Number(data.article.unitCost) >= 0 ? "+" : ""}${euro(Number(item.unitCost) - Number(data.article.unitCost))}` : ""}</em></button>`).join("");
    return `<header class="formuladetailhead">${canGoBack ? '<button type="button" class="formuladetailback" data-formula-related-back aria-label="Torna alla distinta precedente">←</button>' : ""}<b>${esc(data.article.code)}</b><span>${esc(data.article.description)}</span><button type="button" class="formuladetailclose" data-formula-close-detail aria-label="Chiudi scheda">×</button></header><div class="formuladetailnav"><button class="${active("docs")}" type="button" data-formula-jump="docs">Documenti ${docs.length}</button><button class="${active("inci")}" type="button" data-formula-jump="inci">INCI ${inci.length}</button><button class="${active("stock")}" type="button" data-formula-jump="stock">Giacenze ${stock.length}</button><button type="button" data-formula-jump="alternative">Alternativi ${alternatives.length}</button><button type="button" data-formula-jump="tree">${treeLabel} ${children.length || parents.length}</button></div><section class="formulaunit ${hidden("docs")}" data-formula-part="docs"><h4>DOCUMENTI · CHECKLIST E REVISIONI</h4><div class="formuladoccheck"><div class="formuladocprogress"><span>Analisi contenuto reale</span><b>AVVIO…</b></div></div><div class="formuladoclist">${docs.length ? docs.map((d) => documentButton(d, data.article.id)).join("") : '<div class="formulaempty">Nessun file apribile collegato.</div>'}</div></section><section class="formulaunit ${hidden("inci")}" data-formula-part="inci"><h4>COMPOSIZIONE INCI</h4><div>${inci.length ? inci.map((i) => `<article class="formulainci"><b>${esc(i.name || "INCI")}</b><span>${i.cas ? `<span class="formulacas">CAS ${esc(i.cas)}</span>` : ""}${i.function ? esc(i.function) : ""}</span><small>${i.composition == null ? "" : `${pct(i.composition)}%`}</small></article>`).join("") : '<div class="formulaempty">Nessun INCI collegato.</div>'}</div></section><section class="formulaunit ${hidden("stock")}" data-formula-part="stock"><h4 class="formulastockheading"><span>GIACENZE POSITIVE · LOTTI · UBICAZIONI</span><strong>TOTALE ${num2(stockTotal)} ${esc(data.article.unit)}</strong></h4><div>${stock.length ? stock.map((s) => `<article class="formulastock"><b class="formulastocklot">LOTTO ${esc(s.lot || "—")}</b><strong class="formulastockqty">${num2(s.quantity)} ${esc(data.article.unit)}</strong><span class="formulastockplace">UBICAZIONE ${esc(s.location || "NON INDICATA")}</span><span class="formulastockwarehouse">${esc(s.warehouse || "")}</span></article>`).join("") : '<div class="formulaempty">Nessuna giacenza positiva.</div>'}</div></section><section class="formulaunit hidden" data-formula-part="alternative"><h4>ALTERNATIVI TECHNICS · PREZZO E GIACENZA</h4><div>${alternativeRows || '<div class="formulaempty">Nessun alternativo collegato.</div>'}</div></section><section class="formulaunit hidden" data-formula-part="tree"><h4>${children.length ? (isPackaged ? "DISTINTA BASE DEL CONFEZIONATO · BULK E PACKAGING" : "DISTINTA BASE · COMPOSIZIONE E PERCENTUALI") : "PASSAGGI SUCCESSIVI"}</h4><div class="formulatreefilterrow"><input class="formulatreefilter" type="search" placeholder="Cerca per codice o descrizione" aria-label="Cerca per codice o descrizione"></div><div data-formula-tree-list>${children.map((x) => renderRelated(x, isPackaged ? "Documenti" : `${pct(x.percentage)}%`)).join("")}${parents.length ? (children.length ? `<details class="formularelations"><summary>PASSAGGI SUCCESSIVI · ${parents.length}</summary>${parents.map((x) => renderRelated(x)).join("")}</details>` : parents.map((x) => renderRelated(x)).join("")) : ""}${!children.length && !parents.length ? '<div class="formulaempty">Nessun ulteriore collegamento.</div>' : ""}</div></section>`;
  };
  const showDefaultDetailPart = (detail, data) => {
    if (!detail || !Array.isArray(data?.components) || !data.components.length)
      return;
    detail
      .querySelectorAll("[data-formula-part]")
      .forEach((part) =>
        part.classList.toggle("hidden", part.dataset.formulaPart !== "tree"),
      );
    detail
      .querySelectorAll("[data-formula-jump]")
      .forEach((button) =>
        button.classList.toggle("active", button.dataset.formulaJump === "tree"),
      );
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
      if (lastExpandedButton === button) lastExpandedButton = null;
      updateBackButton();
      syncDetailScrollLock();
      return;
    }
    result
      .querySelectorAll('[data-formula-expand][aria-expanded="true"]')
      .forEach((openButton) => {
        if (openButton === button) return;
        openButton.setAttribute("aria-expanded", "false");
        const openArticle =
          openButton.closest("[data-formula-id]") ||
          openButton.closest(".formularoot");
        openArticle
          ?.querySelector(":scope > .formulanodedetail")
          ?.classList.add("hidden");
      });
    button.disabled = true;
    try {
      const payload = await api(`/api/formulas/item?id=${id}`);
      detail.innerHTML = renderDetail(payload.result);
      showDefaultDetailPart(detail, payload.result);
      detailHistory.set(detail, []);
      detail.classList.remove("hidden");
      loadDocumentChecklist(detail, payload.result.article.id);
      button.setAttribute("aria-expanded", "true");
      lastExpandedButton = button;
      updateBackButton();
      syncDetailScrollLock();
    } catch (error) {
      detail.innerHTML = `<div class="formulaempty">${esc(error.message)}</div>`;
      detail.classList.remove("hidden");
      syncDetailScrollLock();
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
        `/api/formulas/search?code=${encodeURIComponent(code)}&fresh=${Date.now()}`,
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
        Boolean(result.querySelector(".formulanodedetail:not(.hidden)")) ||
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
    closeSuggestions();
    load(code);
  });
  const suggestions = section.querySelector("[data-formula-suggestions]");
  let suggestionTimer = 0, suggestionToken = 0;
  const closeSuggestions = () => { suggestions.classList.add("hidden"); suggestions.innerHTML = ""; };
  form.elements.code.addEventListener("input", () => {
    clearTimeout(suggestionTimer);
    const query = form.elements.code.value.trim();
    if (query.length < 2) { closeSuggestions(); return; }
    const token = ++suggestionToken;
    suggestionTimer = setTimeout(async () => {
      try {
        const payload = await api(`/api/formulas/suggest?q=${encodeURIComponent(query)}&fresh=${Date.now()}`, true);
        if (token !== suggestionToken) return;
        const rows = Array.isArray(payload.suggestions) ? payload.suggestions : [];
        suggestions.innerHTML = rows.length ? rows.map(item => `<button type="button" data-formula-suggestion="${esc(item.code)}"><b>${esc(item.code)}</b><span>${esc(item.description)}</span>${item.active ? "" : "<small>NON ATTIVO</small>"}</button>`).join("") : '<div class="formulaempty">Nessuna formula corrispondente.</div>';
        suggestions.classList.remove("hidden");
      } catch { closeSuggestions(); }
    }, 220);
  });
  suggestions.addEventListener("click", event => {
    const button = event.target.closest("[data-formula-suggestion]");
    if (!button) return;
    const code = button.dataset.formulaSuggestion;
    form.elements.code.value = code;
    currentCode = code;
    closeSuggestions();
    load(code);
  });
  const alternativeLog = section.querySelector(".formulaalternativelog"),
    alternativeRange = section.querySelector("#formulaAlternativeRange"),
    alternativeFrom = section.querySelector("[data-alt-from]"),
    alternativeTo = section.querySelector("[data-alt-to]"),
    alternativeQuery = section.querySelector("[data-alt-query]"),
    alternativeStatus = section.querySelector("[data-alt-status]"),
    alternativeRows = section.querySelector("[data-alt-rows]");
  let alternativeLogTimer = 0, alternativeLogToken = 0;
  const updateAlternativeDateDisplays = () => {
    for (const output of alternativeRange.querySelectorAll("[data-alt-date]")) {
      const value = alternativeRange.elements[output.dataset.altDate]?.value || "";
      output.textContent = value ? value.split("-").reverse().join("/") : "gg/mm/aaaa";
    }
  };
  const inputDate = (date) => {
    const year = date.getFullYear(), month = String(date.getMonth() + 1).padStart(2, "0"), day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const resetAlternativePeriod = () => {
    const to = new Date(), from = new Date(to);
    from.setMonth(from.getMonth() - 3);
    alternativeFrom.value = inputDate(from);
    alternativeTo.value = inputDate(to);
    alternativeQuery.value = "";
    updateAlternativeDateDisplays();
  };
  const scheduleAlternativeLog = () => {
    clearTimeout(alternativeLogTimer);
    alternativeLogTimer = setTimeout(() => {
      if (alternativeLog.open && !document.hidden && shell.dataset.workspace === "formulas") loadAlternativeLog(true);
      else scheduleAlternativeLog();
    }, 15000);
  };
  const groupAlternativeRows = (rows) => {
    const byDate = new Map();
    for (const row of rows) {
      if (!byDate.has(row.date)) byDate.set(row.date, []);
      byDate.get(row.date).push(row);
    }
    const groups = [];
    for (const [date, dateRows] of byDate) {
      const adjacency = new Map(), articles = new Map();
      for (const row of dateRows) {
        articles.set(row.source.id, row.source);
        articles.set(row.alternative.id, row.alternative);
        if (!adjacency.has(row.source.id)) adjacency.set(row.source.id, new Set());
        if (!adjacency.has(row.alternative.id)) adjacency.set(row.alternative.id, new Set());
        adjacency.get(row.source.id).add(row.alternative.id);
        adjacency.get(row.alternative.id).add(row.source.id);
      }
      const visited = new Set();
      for (const start of adjacency.keys()) {
        if (visited.has(start)) continue;
        const stack = [start], ids = [];
        while (stack.length) {
          const id = stack.pop();
          if (visited.has(id)) continue;
          visited.add(id); ids.push(id);
          for (const neighbor of adjacency.get(id) || []) if (!visited.has(neighbor)) stack.push(neighbor);
        }
        const rootId = ids.reduce((best, id) => id > best ? id : best, ids[0]),
          root = articles.get(rootId),
          alternatives = ids.filter((id) => id !== rootId).map((id) => articles.get(id)).sort((a, b) => a.code.localeCompare(b.code, "it")),
          rootRows = dateRows.filter((row) => row.source.id === rootId),
          anyRows = dateRows.filter((row) => ids.includes(row.source.id) && ids.includes(row.alternative.id)),
          user = rootRows.find((row) => row.user)?.user || anyRows.find((row) => row.user)?.user || null;
        groups.push({ date, root, alternatives, user });
      }
    }
    return groups.sort((a, b) => String(b.date).localeCompare(String(a.date)) || b.root.id - a.root.id);
  };
  const renderAlternativeLog = (data) => {
    const rows = Array.isArray(data?.rows) ? data.rows : [], groups = groupAlternativeRows(rows);
    alternativeStatus.textContent = `${groups.length} codici · ${rows.length} collegamenti · Technics verificato ${new Date(data.readAt).toLocaleTimeString("it-IT")} · sola lettura`;
    alternativeRows.innerHTML = groups.length ? groups.map((group) => `<article class="formulaaltgroup"><button type="button" class="formulaaltgrouphead" data-alt-open="${esc(group.root.code)}"><time>${esc(displayDate(group.date))}</time><b>${esc(group.root.code)}</b><strong>${esc(group.root.description)}</strong><em>Prezzo codice<br>${euro(group.root.unitCost)}/${esc(group.root.unit || "UM")}</em><small>${group.user ? `Utente ${esc(group.user.name || group.user.login || group.user.id)}${group.user.login && group.user.name ? ` · ${esc(group.user.login)}` : ""}` : "Utente non presente nel log Technics"}</small></button><h4>${group.alternatives.length} alternativ${group.alternatives.length === 1 ? "o" : "i"}</h4>${group.alternatives.map((alternative) => `<button type="button" class="formulaaltchoice" data-alt-open="${esc(alternative.code)}"><b>${esc(alternative.code)}</b><strong>${esc(alternative.description)}</strong><span>Prezzo alternativo<br>${euro(alternative.unitCost)}/${esc(alternative.unit || "UM")}</span><small>Giacenza ${num2(alternative.stock)} ${esc(alternative.unit || "UM")}</small></button>`).join("")}</article>`).join("") : '<div class="formulaempty">Nessun nuovo alternativo nel periodo selezionato.</div>';
  };
  const loadAlternativeLog = async (quiet = false) => {
    const token = ++alternativeLogToken;
    if (!quiet) alternativeStatus.textContent = "Lettura nuovi alternativi…";
    try {
      const payload = await api(`/api/formulas/alternatives-log?from=${encodeURIComponent(alternativeFrom.value)}&to=${encodeURIComponent(alternativeTo.value)}&q=${encodeURIComponent(alternativeQuery.value.trim())}&fresh=${Date.now()}`, true);
      if (token !== alternativeLogToken) return;
      renderAlternativeLog(payload.result);
    } catch (error) {
      if (token !== alternativeLogToken) return;
      alternativeStatus.textContent = error.message || "Nuovi alternativi non disponibili.";
    }
    scheduleAlternativeLog();
  };
  resetAlternativePeriod();
  const alternativeCalendar = window.TechnicsRangeCalendar?.attach(alternativeRange, { onApply: () => { updateAlternativeDateDisplays(); loadAlternativeLog(); } });
  alternativeRange.addEventListener("change", updateAlternativeDateDisplays);
  alternativeLog.addEventListener("toggle", () => { if (alternativeLog.open) loadAlternativeLog(); else clearTimeout(alternativeLogTimer); });
  section.querySelector("[data-alt-show]").addEventListener("click", () => loadAlternativeLog());
  section.querySelector("[data-alt-reset]").addEventListener("click", () => { alternativeCalendar?.reset(); resetAlternativePeriod(); loadAlternativeLog(); });
  alternativeQuery.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); loadAlternativeLog(); } });
  alternativeRows.addEventListener("click", (event) => { const button = event.target.closest("[data-alt-open]"); if (!button) return; const code = button.dataset.altOpen; form.elements.code.value = code; currentCode = code; load(code); result.scrollIntoView({ block: "start", behavior: "smooth" }); });
  const materialAuditRange = section.querySelector("#formulaMaterialAuditRange"),
    materialAuditQuery = section.querySelector("[data-audit-query]"),
    materialAuditStatus = section.querySelector("[data-audit-status]"),
    materialAuditGroups = section.querySelector("[data-audit-groups]");
  let materialAuditTimer = 0,
    materialAuditToken = 0,
    materialAuditSignature = "",
    materialAuditData = null;
  const updateMaterialAuditDates = () => {
    for (const output of materialAuditRange.querySelectorAll("[data-audit-date]")) {
      const value = materialAuditRange.elements[output.dataset.auditDate]?.value || "";
      output.textContent = value ? value.split("-").reverse().join("/") : "gg/mm/aaaa";
    }
  };
  const materialAuditRow = (row, kind) => {
    const statusLabel = kind === "old"
      ? `Ultimo acquisto ${displayDate(row.lastPurchase)}`
      : row.formulaCount > 0
        ? `Mai acquistata · ${row.formulaCount} formul${row.formulaCount === 1 ? "a" : "e"}`
        : "Mai acquistata · mai in formula";
    const facts = [
      row.articleDate ? `Codificata ${displayDate(row.articleDate)}` : "",
      `${euro(row.unitCost)}/${esc(row.unit || "UM")}`,
      row.alternativeCount ? `${row.alternativeCount} alternativ${row.alternativeCount === 1 ? "o" : "i"}` : "Nessun alternativo",
    ].filter(Boolean).join(" · ");
    return `<button type="button" class="formulaauditrow ${kind === "old" ? "old" : "warn"}" data-audit-open="${esc(row.code)}"><b>${esc(row.code)}</b><strong>${esc(row.description)}</strong><em>${esc(statusLabel)}</em><small>${facts}</small></button>`;
  };
  const materialAuditDefinitions = [
    ["neverPurchasedNeverFormula", "Mai acquistate · mai entrate in formula", "never"],
    ["neverPurchasedInFormula", "Mai acquistate · presenti in formula", "formula"],
    ["purchasedBefore2018", "Ultimo acquisto precedente al 2018", "old"],
  ];
  const populateMaterialAuditGroup = (details) => {
    if (!details.open || details.dataset.loaded === "1" || !materialAuditData) return;
    const definition = materialAuditDefinitions.find(([key]) => key === details.dataset.auditGroup),
      rows = definition ? materialAuditData[definition[0]] || [] : [],
      container = details.querySelector("[data-audit-list]");
    container.innerHTML = rows.length
      ? rows.map((row) => materialAuditRow(row, definition[2])).join("")
      : '<div class="formulaempty">Nessuna materia prima in questa categoria.</div>';
    details.dataset.loaded = "1";
  };
  const renderMaterialAudit = (data) => {
    materialAuditData = data;
    const total = materialAuditDefinitions.reduce((sum, [key]) => sum + Number(data?.counts?.[key] || 0), 0);
    materialAuditPanel.querySelector(":scope > summary b").textContent = `${total} RISULTATI`;
    materialAuditStatus.textContent = `${total} materie prime · Technics verificato ${new Date(data.readAt).toLocaleTimeString("it-IT")} · sola lettura`;
    materialAuditGroups.innerHTML = materialAuditDefinitions.map(([key, label]) => `<details class="formulaauditgroup" data-audit-group="${key}"><summary><span>${label}</span><b>${Number(data?.counts?.[key] || 0)}</b></summary><div data-audit-list></div></details>`).join("");
  };
  const scheduleMaterialAudit = () => {
    clearTimeout(materialAuditTimer);
    materialAuditTimer = setTimeout(() => {
      if (materialAuditPanel.open && !document.hidden && shell.dataset.workspace === "formulas") loadMaterialAudit(true);
      else scheduleMaterialAudit();
    }, 15000);
  };
  const loadMaterialAudit = async (quiet = false) => {
    const token = ++materialAuditToken,
      from = materialAuditRange.elements.from.value,
      to = materialAuditRange.elements.to.value,
      query = materialAuditQuery.value.trim();
    if (!quiet) materialAuditStatus.textContent = "Controllo materie prime in Technics…";
    try {
      const payload = await api(`/api/formulas/material-audit?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&q=${encodeURIComponent(query)}&fresh=${Date.now()}`, true);
      if (token !== materialAuditToken) return;
      const data = payload.result,
        signature = JSON.stringify([data.counts, ...materialAuditDefinitions.map(([key]) => (data[key] || []).map((row) => [row.id, row.lastPurchase, row.formulaCount, row.alternativeCount]))]);
      if (!quiet || signature !== materialAuditSignature) {
        materialAuditSignature = signature;
        renderMaterialAudit(data);
      } else {
        const total = materialAuditDefinitions.reduce((sum, [key]) => sum + Number(data?.counts?.[key] || 0), 0);
        materialAuditStatus.textContent = `${total} materie prime · Technics verificato ${new Date(data.readAt).toLocaleTimeString("it-IT")} · sola lettura`;
      }
    } catch (error) {
      if (token !== materialAuditToken) return;
      materialAuditStatus.textContent = error.message || "Controllo materie prime non disponibile.";
    }
    scheduleMaterialAudit();
  };
  updateMaterialAuditDates();
  const materialAuditCalendar = window.TechnicsRangeCalendar?.attach(materialAuditRange, { onApply: () => { updateMaterialAuditDates(); loadMaterialAudit(); } });
  materialAuditRange.addEventListener("change", updateMaterialAuditDates);
  materialAuditPanel.addEventListener("toggle", () => { if (materialAuditPanel.open) loadMaterialAudit(); else clearTimeout(materialAuditTimer); });
  materialAuditGroups.addEventListener("toggle", (event) => { const details = event.target.closest("[data-audit-group]"); if (details) populateMaterialAuditGroup(details); }, true);
  materialAuditGroups.addEventListener("click", (event) => { const button = event.target.closest("[data-audit-open]"); if (!button) return; const code = button.dataset.auditOpen; form.elements.code.value = code; currentCode = code; load(code); result.scrollIntoView({ block: "start", behavior: "smooth" }); });
  section.querySelector("[data-audit-show]").addEventListener("click", () => loadMaterialAudit());
  section.querySelector("[data-audit-reset]").addEventListener("click", () => { materialAuditCalendar?.reset(); materialAuditRange.elements.from.value = ""; materialAuditRange.elements.to.value = ""; materialAuditQuery.value = ""; updateMaterialAuditDates(); loadMaterialAudit(); });
  materialAuditQuery.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); loadMaterialAudit(); } });
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
    const summary = event.target.closest("[data-formula-summary]");
    if (summary) {
      const target = summary.dataset.formulaSummary;
      if (target === "component" || target === "parent") {
        result
          .querySelector(`[data-formula-section="${target}"]`)
          ?.scrollIntoView({ block: "start", behavior: "smooth" });
        return;
      }
      const root = result.querySelector(".formularoot"),
        rootDetail = root?.querySelector(":scope > .formulanodedetail"),
        rootOpen = root?.querySelector(":scope > header [data-formula-expand]");
      if (rootDetail?.classList.contains("hidden") && rootOpen)
        await expand(rootOpen);
      rootDetail
        ?.querySelector(`[data-formula-jump="${target}"]`)
        ?.click();
      return;
    }
    const closeDetail = event.target.closest("[data-formula-close-detail]");
    if (closeDetail) {
      const detail = closeDetail.closest(".formulanodedetail"),
        article =
          detail?.closest("[data-formula-id]") ||
          detail?.closest(".formularoot"),
        openButton = article?.querySelector(
          ":scope > .formulanodehead [data-formula-expand], :scope > header [data-formula-expand]",
        );
      detail?.classList.add("hidden");
      openButton?.setAttribute("aria-expanded", "false");
      if (lastExpandedButton === openButton) lastExpandedButton = null;
      if (detail) detailHistory.delete(detail);
      updateBackButton();
      syncDetailScrollLock();
      return;
    }
    const relatedBack = event.target.closest("[data-formula-related-back]");
    if (relatedBack) {
      const detail = relatedBack.closest(".formulanodedetail"),
        history = detailHistory.get(detail) || [],
        previous = history.pop();
      if (detail && previous) {
        detail.innerHTML = previous.html;
        detailHistory.set(detail, history);
        detail.querySelector(`[data-formula-part="${previous.part}"]`)?.scrollTo(0, previous.scrollTop || 0);
      }
      return;
    }
    const related = event.target.closest("[data-formula-related-id]");
    if (related) {
      const id = Number(related.dataset.formulaRelatedId),
        detail = related.closest(".formulanodedetail");
      if (!id || !detail) return;
      const activePart = detail.querySelector("[data-formula-part]:not(.hidden)"),
        history = detailHistory.get(detail) || [];
      history.push({
        html: detail.innerHTML,
        part: activePart?.dataset.formulaPart || "tree",
        scrollTop: activePart?.scrollTop || 0,
      });
      related.disabled = true;
      try {
        const payload = await api(`/api/formulas/item?id=${id}`);
        detailHistory.set(detail, history);
        detail.innerHTML = renderDetail(payload.result, true);
        showDefaultDetailPart(detail, payload.result);
        loadDocumentChecklist(detail, payload.result.article.id);
      } catch (error) {
        history.pop();
        detailHistory.set(detail, history);
        related.disabled = false;
        status.classList.add("error");
        status.textContent = error.message || "Scheda collegata non disponibile.";
      }
      return;
    }
    const inventoryLink = event.target.closest("[data-formula-inventory]");
    if (inventoryLink) {
      const code = inventoryLink.dataset.formulaInventory;
      formulaScrollY = window.scrollY;
      backButton.dataset.mode = "inventory";
      document
        .querySelector('.departmentnav [data-workspace="inventory"]')
        ?.click();
      setTimeout(() => {
        const inventoryForm = document.getElementById("form"),
          codeInput = inventoryForm?.elements?.code,
          lotInput = inventoryForm?.elements?.lot;
        if (!inventoryForm || !codeInput) return;
        codeInput.value = code;
        if (lotInput) lotInput.value = "";
        codeInput.dispatchEvent(new Event("input", { bubbles: true }));
        codeInput.value = code;
        inventoryForm.requestSubmit();
        updateBackButton();
        window.scrollTo({ top: 0, behavior: "instant" });
      }, 80);
      return;
    }
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
    const categoryClose = event.target.closest("[data-formula-category-close]");
    if (categoryClose) {
      categoryClose.closest("[data-formula-category-choices]")?.classList.add("hidden");
      return;
    }
    const topic = event.target.closest("[data-formula-topic]");
    if (topic) {
      const docsSection = topic.closest('[data-formula-part="docs"]'),
        picker = topic.closest("[data-formula-category-choices]"),
        target = picker?.querySelector("[data-formula-topic-results]"),
        label = topic.dataset.formulaTopic,
        matches = documentTopicMaps.get(docsSection)?.get(label) || [];
      if (!target || !matches.length) return;
      target.innerHTML = `<div class="formuladocsubcategorytitle">${esc(label)} · ${matches.length} DOCUMENTI</div><div class="formuladoccategorylist">${categoryDocumentRows(matches, topic.dataset.article)}</div>`;
      target.scrollIntoView({ block: "nearest", behavior: "smooth" });
      return;
    }
    const category = event.target.closest("[data-formula-category]");
    if (category) {
      const docsSection = category.closest('[data-formula-part="docs"]'),
        picker = docsSection?.querySelector("[data-formula-category-choices]"),
        label = category.dataset.formulaCategory,
        matches = documentCategoryMaps.get(docsSection)?.get(label) || [];
      if (!picker || !matches.length) return;
      const topics = new Map();
      matches.forEach((item) => (item.analysis?.topics || []).forEach((entry) => {
        const rows = topics.get(entry.label) || [];
        if (!rows.includes(item)) rows.push(item);
        topics.set(entry.label, rows);
      }));
      const classified = new Set([...topics.values()].flat()),
        unclassified = matches.filter((item) => !classified.has(item));
      if (unclassified.length) topics.set("Altri contenuti verificati", unclassified);
      if (!topics.size) topics.set("Documenti verificati", matches);
      documentTopicMaps.set(docsSection, topics);
      const topicBadges = [...topics.entries()].map(([topicLabel, rows]) => `<span role="button" tabindex="0" class="formuladocbadge present" ${rows.length === 1 ? documentActionAttributes(rows[0], category.dataset.article) : `data-formula-topic="${esc(topicLabel)}" data-article="${category.dataset.article}"`} aria-label="${rows.length === 1 ? "Apri" : "Mostra"} ${esc(topicLabel)}">✓ ${esc(topicLabel)}${rows.length > 1 ? ` · ${rows.length}` : ""}</span>`).join("");
      picker.innerHTML = `<div class="formuladoccategoryhead"><strong>${esc(label)} · CONTENUTI VERIFICATI</strong><button type="button" class="formuladetailclose" data-formula-category-close aria-label="Chiudi elenco documenti">×</button></div><div class="formuladocsubcategorytitle">Seleziona l'argomento</div><div class="formuladocbadges">${topicBadges}</div><div data-formula-topic-results></div>`;
      picker.classList.remove("hidden");
      picker.scrollIntoView({ block: "nearest", behavior: "smooth" });
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
  result.addEventListener("keydown", (event) => {
    const badge = event.target.closest('.formuladocbadge.present[role="button"]');
    if (badge && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      badge.click();
    }
  });
  result.addEventListener("input", (event) => {
    const documentSearch = event.target.closest(".formuladocsearch");
    if (documentSearch) {
      const query = documentSearch.value.trim().toLocaleUpperCase("it-IT"), unit = documentSearch.closest('[data-formula-part="docs"]');
      unit?.querySelectorAll("[data-formula-document-row]").forEach((row) => row.classList.toggle("hidden", Boolean(query) && !String(row.dataset.search || "").includes(query)));
      const obsolete = unit?.querySelector(".formuladocobsolete");
      if (obsolete) obsolete.classList.toggle("hidden", Boolean(query) && !obsolete.querySelector('[data-formula-document-row]:not(.hidden)'));
      return;
    }
    const filter = event.target.closest(".formulatreefilter");
    if (!filter) return;
    const query = filter.value.trim().toLocaleUpperCase("it-IT"),
      tree = filter
        .closest('[data-formula-part="tree"]')
        ?.querySelector("[data-formula-tree-list]");
    tree?.querySelectorAll(".formulaparent").forEach((row) => {
      row.classList.toggle(
        "hidden",
        Boolean(query) &&
          !row.textContent.toLocaleUpperCase("it-IT").includes(query),
      );
    });
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
  backButton.addEventListener("click", () => {
    if (
      backButton.dataset.mode === "inventory" &&
      shell.dataset.workspace === "inventory"
    ) {
      document
        .querySelector('.departmentnav [data-workspace="formulas"]')
        ?.click();
      backButton.dataset.mode = "formula";
      setTimeout(() => {
        window.scrollTo({ top: formulaScrollY, behavior: "instant" });
        updateBackButton();
      }, 100);
      return;
    }
    if (lastExpandedButton) {
      const target = lastExpandedButton;
      expand(target);
      target.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("technics-workspace-change", (event) => {
    if (event.detail.workspace !== "formulas") {
      const preserveInventoryReturn =
        event.detail.workspace === "inventory" &&
        backButton.dataset.mode === "inventory";
      if (!preserveInventoryReturn) resetFormulaSession();
      else clearTimeout(refreshTimer);
      updateBackButton();
      return;
    }
    if (currentCode && currentData) schedule();
    updateBackButton();
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
