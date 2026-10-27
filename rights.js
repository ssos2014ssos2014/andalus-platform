// حقوق الملكية الفكرية + تذييل الصفحات
(() => {
  const SIG = "c1bb487a7eaf000a5230399842979fa3966033e1f444041335c769c11e29e28f";
  const SIGTXT = "أحمد علي موسى المشيبي | معلم اللغة الإنجليزية | علي جابر علي الألمعي | وكيل الشؤون التعليمية | ثانوية الأندلس بترقش | 1447هـ / 2026م";
  const el = (t, c, html) => { const e = document.createElement(t); if (c) e.className = c; if (html != null) e.innerHTML = html; return e; };
  function open() {
    if (document.getElementById("ip-modal")) return;
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
            <img src="logo.png" alt="شعار ثانوية الأندلس" class="ip-logo">
            <div class="ip-p"><span class="ip-av">أ</span><em>فكرة وتنفيذ</em><b>أ. أحمد علي موسى المشيبي</b><span>معلم اللغة الإنجليزية</span></div>
            <div class="ip-p"><span class="ip-av">ع</span><b>أ. علي جابر علي الألمعي</b><span>وكيل الشؤون التعليمية</span></div>
            <p class="ip-school">ثانوية الأندلس بترقش — منطقة عسير</p>
          </div>
          <dl class="ip-tbl">
            <div><dt>اسم النظام</dt><dd>منصة التأسيس والتدريب لاختبار القدرات العامة</dd></div>
            <div><dt>فكرة وتنفيذ</dt><dd>معلم اللغة الإنجليزية أ. أحمد علي موسى المشيبي<br>وكيل الشؤون التعليمية أ. علي جابر علي الألمعي</dd></div>
            <div><dt>سنة الإنشاء</dt><dd>١٤٤٧هـ / ٢٠٢٦م</dd></div>
            <div><dt>الإصدار</dt><dd>١.٠ — رؤية ٢٠٣٠</dd></div>
          </dl>
          <div class="ip-sig"><b>🔏 التوقيع الرقمي المشفر (SHA-256)</b><code dir="ltr">${SIG}</code>
            <small>يمكن التحقق من هذا التوقيع عبر أي أداة SHA-256 بتشفير النص: ${SIGTXT}</small></div>
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
    if (document.getElementById("ip-foot")) return;
    const f = el("footer", "ip-foot"); f.id = "ip-foot";
    f.innerHTML = `<img src="logo.png" alt="" aria-hidden="true"><span>© ١٤٤٧هـ ثانوية الأندلس بترقش — جميع الحقوق محفوظة</span><button type="button">🛡 حقوق الملكية الفكرية</button>`;
    f.querySelector("button").onclick = open;
    document.body.append(f);
  }
  window.IPRights = { open, footer };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", footer); else footer();
})();
