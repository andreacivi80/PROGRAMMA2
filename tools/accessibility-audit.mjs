import { readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8").replace(/\s+/g, " ");
const index = readFileSync("index.html", "utf8");
const css = ["src/styles.css", "src/appEnhancements.css", "src/lessonEnhancements.css", "src/themePacks.css", "src/wordGames.css"].map(file => readFileSync(file, "utf8")).join("\n").replace(/\s+/g, " ");
const checks = {
  italianDocumentLanguage: index.includes('<html lang="it">'),
  zoomIsNotBlocked: !/maximum-scale|user-scalable\s*=\s*no/i.test(index),
  responsiveViewport: index.includes("width=device-width") && index.includes("viewport-fit=cover"),
  keyboardFocus: css.includes(":focus-visible") && css.includes("summary, input, textarea, select):focus-visible"),
  reducedMotion: css.includes("prefers-reduced-motion:reduce"),
  horizontalOverflowGuard: css.includes("html,body,#root{max-width:100%;overflow-x:hidden}"),
  longTextWrapping: css.includes("overflow-wrap: anywhere"),
  narrowPhoneLayout: css.includes("@media (max-width: 430px)") && css.includes("padding: 7px 10px 22px"),
  largeTextReflows: css.includes(".app.text-large .audioControl") && css.includes(".app.text-large :is(.adaptiveLevels, .compactLevelPicker > div)"),
  completeDarkSurfaces: [".lessonCard", ".readingPanel", ".themePackPanel", ".reviewPanel", ".deepGuide article"].every(selector => css.includes(selector)),
  liveSaveStatus: app.includes('role="status" aria-live="polite"'),
  labelledNavigation: app.includes('aria-label="Navigazione principale"') && app.includes("aria-current="),
  decorativeNavIconsHidden: ["⌂", "◇", "✦", "↗"].every(icon => app.includes(`<b aria-hidden="true">${icon}</b>`)),
  labelledDialogs: app.includes('role="dialog"') && app.includes('aria-modal="true"') && app.includes('aria-labelledby="resume-title"') && app.includes('role="alertdialog"') && app.includes("autoFocus"),
  escapeClosesOverlays: app.includes('event.key !== "Escape"') && app.includes('window.addEventListener("keydown", closeOverlay)'),
  skipButtonsContained: css.includes(".themeQuizNav,.reviewNav") && css.includes("grid-template-columns:1fr") && css.includes(".lessonCard>.bottomSkip{position:static!important"),
};
const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
console.log(JSON.stringify({ checks, failed }, null, 2));
if (failed.length) process.exit(1);
