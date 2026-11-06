// حقوق الملكية الفكرية + تذييل الصفحات
(() => {
  const S = () => (window.SCHOOL ? window.SCHOOL.cur : null) || { name: "ثانوية الأندلس بترقش", region: "منطقة عسير", logo: "logo.png", credits: [], creditsLine: "", sig: "", sigText: "" };
  const el = (t, c, html) => { const e = document.createElement(t); if (c) e.className = c; if (html != null) e.innerHTML = html; return e; };
  function open() {
    if (document.getElementById("ip-modal")) return;
    const s = S();
    const bg = el("div", "ip-bg"); bg.id = "ip-modal"; bg.setAttribute("role", "dialog"); bg.setAttribute("aria-modal", "true"); bg.setAttribute("aria-label", "حقوق الملكية الفكرية");
    bg.innerHTML = `
      <div class="ip-card">
        <button class="ip-x" aria-label="إغلاق">×</button>
        <div class="ip-head">
          <div class="ip-shield"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/></svg></div>
          <h2>حقوق الملكية الفكرية</h2><small>Intellectual Property Rights</small>
        </div>
        <div class="ip-body">
          <div class="ip-people">
            <img src="${s.logo}" alt="شعار ${s.name}" class="ip-logo">
            ${s.credits.map(c => `<div class="ip-p"><span class="ip-av">${c.av}</span>${c.tag ? `<em>${c.tag}</em>` : ""}<b>${c.name}</b>${c.role ? `<span>${c.role}</span>` : ""}</div>`).join("")}
            <p class="ip-school">${s.name}${s.region ? " — " + s.region : ""}</p>
          </div>
          <dl class="ip-tbl">
            <div><dt>اسم النظام</dt><dd>منصة التأسيس والتدريب لاختبار القدرات العامة</dd></div>
            <div><dt>${s.creditsLabel || "فكرة وتنفيذ"}</dt><dd>${s.creditsLine}</dd></div>
            <div><dt>سنة الإنشاء</dt><dd>١٤٤٧هـ / ٢٠٢٦م</dd></div>
            <div><dt>الإصدار</dt><dd>١.٠ — رؤية ٢٠٣٠</dd></div>
          </dl>
          <div class="ip-sig"><b>🔏 التوقيع الرقمي المشفر (SHA-256)</b><code dir="ltr">${s.sig}</code>
            <small>يمكن التحقق من هذا التوقيع عبر أي أداة SHA-256 بتشفير النص: ${s.sigText}</small></div>
          <div class="ip-law"><b>⚖️ إشعار قانوني</b>
            <p>جميع حقوق الملكية الفكرية لهذه المنصة محفوظة لأصحابها. يُحظر نسخها أو توزيعها أو تعديلها أو الادعاء بملكيتها دون إذن كتابي صريح من المالك، وفقًا لنظام حماية حقوق المؤلف السعودي وأنظمة الملكية الفكرية الدولية.</p></div>
          <button class="ip-close">إغلاق</button>
        </div>
      </div>`;
    const close = () => bg.remove();
    bg.addEventListener("click", e => { if (e.target === bg) close(); });
    bg.querySelector(".ip-x").onclick = close; bg.querySelector(".ip-close").onclick = close;
    document.addEventListener("keydown", function k(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", k); } });
    document.body.append(bg); bg.querySelector(".ip-close").focus();
  }
  function footer() {
    const s = S();
    let f = document.getElementById("ip-foot");
    if (!f) { f = el("footer", "ip-foot"); f.id = "ip-foot"; document.body.append(f); }
    f.innerHTML = `<img src="${s.logo}" alt="" aria-hidden="true"><span>© ١٤٤٧هـ ${s.name} — جميع الحقوق محفوظة</span><button type="button">🛡 حقوق الملكية الفكرية</button>`;
    f.querySelector("button").onclick = open;
  }
  document.addEventListener("schoolchange", footer);
  window.IPRights = { open, footer };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", footer); else footer();
})();
