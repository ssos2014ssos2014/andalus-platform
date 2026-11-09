// الشهادات: النصوص والتوقيعات وتصميم الشهادة (SVG) والطباعة والتحميل
(() => {
  const AR = v => String(v ?? "").replace(/[0-9]/g, c => "٠١٢٣٤٥٦٧٨٩"[c]);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const SCHOOLS = {
    andalus: { name: "ثانوية الأندلس بترقش", female: false, logo: "logo.png",
      sign: [["مدير المدرسة", "أ. عبدالعزيز بن عبده الألمعي"], ["مشرف المنصة", "أ. أحمد بن علي موسى المشيبي"], ["وكيل المدرسة", "أ. علي بن جابر الألمعي"]] },
    asma: { name: "ثانوية أسماء بنت أبي بكر بمحايل عسير", female: true, logo: "logo-asma.png", lw: 176,
      sign: [["مديرة المدرسة", "أ. شمعة محمد عمر"], ["مشرفة المنصة", "أ. عبدية علي موسى الدارسي"]] }
  };
  const KINDS = {
    attend: { title: "شهادة تميّز في الحضور", label: "التميّز في حضور المحاضرات",
      text: (s, x) => `يسر إدارة ${s.name} أن تمنح ${s.female ? "الطالبة" : "الطالب"} {الاسم} هذه الشهادة؛ تقديرًا ${s.female ? "لانتظامها وحرصها" : "لانتظامه وحرصه"} على حضور محاضرات منصة التأسيس والتدريب لاختبار القدرات العامة، حيث ${s.female ? "أتمّت" : "أتمّ"} مشاهدة ${AR(x.watched || 0)} محاضرة، متمنين ${s.female ? "لها" : "له"} دوام التفوق والنجاح.` },
    exams: { title: "شهادة تفوّق في الاختبارات", label: "التفوّق في الاختبارات المحاكية",
      text: (s, x) => `يسر إدارة ${s.name} أن تمنح ${s.female ? "الطالبة" : "الطالب"} {الاسم} هذه الشهادة؛ تقديرًا ${s.female ? "لتفوقها" : "لتفوقه"} في الاختبارات المحاكية بمنصة التأسيس والتدريب لاختبار القدرات العامة، حيث ${s.female ? "اجتازت" : "اجتاز"} ${AR(x.passed || 0)} ${(x.passed || 0) >= 3 && (x.passed || 0) <= 10 ? "اختبارات" : "اختبارًا"} بنجاح${x.avg ? ` بمتوسط ${AR(x.avg)}٪` : ""}، متمنين ${s.female ? "لها" : "له"} دوام التفوق والنجاح.` },
    both: { title: "شهادة تميّز وتفوّق", label: "التميّز الشامل (حضور واختبارات)",
      text: (s, x) => `يسر إدارة ${s.name} أن تمنح ${s.female ? "الطالبة" : "الطالب"} {الاسم} هذه الشهادة؛ تقديرًا ${s.female ? "لتميزها" : "لتميزه"} في منصة التأسيس والتدريب لاختبار القدرات العامة، حيث ${s.female ? "أتمّت" : "أتمّ"} مشاهدة ${AR(x.watched || 0)} محاضرة، و${s.female ? "اجتازت" : "اجتاز"} ${AR(x.passed || 0)} اختبارًا محاكيًا${x.avg ? ` بمتوسط ${AR(x.avg)}٪` : ""}، سائلين الله ${s.female ? "لها" : "له"} دوام التوفيق والنجاح.` }
  };
  const school = k => SCHOOLS[k] || SCHOOLS.andalus;
  const MOE = "moe-logo.png";
  const fmtDate = iso => {
    const d = iso ? new Date(iso) : new Date();
    let hij = ""; try { hij = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-arab", { day: "numeric", month: "long", year: "numeric" }).format(d); } catch {}
    let gr = ""; try { gr = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-arab", { day: "numeric", month: "long", year: "numeric" }).format(d); } catch { gr = AR(d.toISOString().slice(0, 10)); }
    return { hij, gr };
  };
  // c: { title, body, school, issued_at, id, full_name }
  function svg(c, logoHref, moeHref) {
    const s = school(c.school), { hij, gr } = fmtDate(c.issued_at), W = 1123, H = 794;
    const logo = logoHref !== undefined ? logoHref : s.logo, moe = moeHref !== undefined ? moeHref : MOE;
    const signs = s.sign, n = signs.length, colW = (W - 200) / n;
    const signSvg = signs.map(([role, name], i) => { const x = W - 100 - colW * (i + .5);
      return `<text x="${x}" y="660" text-anchor="middle" font-size="19" fill="#7a5a12" font-weight="700">${esc(role)}</text>
        <line x1="${x - 110}" y1="700" x2="${x + 110}" y2="700" stroke="#c9a54a" stroke-width="1.2" stroke-dasharray="4 4"/>
        <text x="${x}" y="728" text-anchor="middle" font-size="19" fill="#173a4a" font-weight="700">${esc(name)}</text>`; }).join("");
    // الوسط: شعار وزارة التعليم ، واليسار: شعار المدرسة وتحته التاريخ
    const emblem = moe ? `<image href="${esc(moe)}" x="${W / 2 - 74}" y="54" width="148" height="112" preserveAspectRatio="xMidYMid meet"/>` : "";
    const schoolLogo = logo ? `<image href="${esc(logo)}" x="115" y="62" width="150" height="62" preserveAspectRatio="xMidYMid meet"/>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" direction="rtl" font-family="Tajawal, 'Noto Kufi Arabic', 'Segoe UI', Tahoma, Arial, sans-serif">
  <defs>
    <linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8c766"/><stop offset=".5" stop-color="#b8862b"/><stop offset="1" stop-color="#e8c766"/></linearGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf6"/><stop offset="1" stop-color="#f6efdc"/></linearGradient>
    <pattern id="pt" width="46" height="46" patternUnits="userSpaceOnUse"><path d="M23 4 L42 23 L23 42 L4 23 Z" fill="none" stroke="#1f6f78" stroke-opacity=".06" stroke-width="1.2"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#pt)"/>
  <rect x="22" y="22" width="${W - 44}" height="${H - 44}" fill="none" stroke="url(#gd)" stroke-width="10"/>
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="#1f6f78" stroke-width="2"/>
  <rect x="48" y="48" width="${W - 96}" height="${H - 96}" fill="none" stroke="#c9a54a" stroke-width="1"/>
  ${[[60, 60], [W - 60, 60], [60, H - 60], [W - 60, H - 60]].map(([x, y]) => `<g transform="translate(${x},${y})"><path d="M0 -16 L16 0 L0 16 L-16 0 Z" fill="url(#gd)"/><circle r="5" fill="#1f6f78"/></g>`).join("")}
  ${["المملكة العربية السعودية", "وزارة التعليم", "الإدارة العامة للتعليم بمنطقة عسير", s.name].map((t, i) => `<text x="${W - 250}" y="${86 + i * 24}" text-anchor="middle" font-size="16.5" fill="#173a4a" font-weight="700">${esc(t)}</text>`).join("")}
  ${schoolLogo}
  <text x="190" y="${logo ? 146 : 110}" text-anchor="middle" font-size="14.5" fill="#6b7c84">${esc(hij)}</text>
  <text x="190" y="${logo ? 168 : 136}" text-anchor="middle" font-size="14.5" fill="#6b7c84">${esc(gr)}</text>
  ${emblem}
  <text x="${W / 2}" y="232" text-anchor="middle" font-size="50" font-weight="800" fill="#1f6f78">${esc(c.title || "شهادة شكر وتقدير")}</text>
  <path d="M${W / 2 - 170} 252 Q ${W / 2} 268 ${W / 2 + 170} 252" fill="none" stroke="url(#gd)" stroke-width="3"/>
  <text x="${W / 2}" y="300" text-anchor="middle" font-size="20" fill="#6b5a2e">منصة التأسيس والتدريب لاختبار القدرات العامة</text>
  <text x="${W / 2}" y="368" text-anchor="middle" font-size="40" font-weight="800" fill="#7a5a12">${esc(c.full_name || "")}</text>
  <foreignObject x="150" y="392" width="${W - 300}" height="210"><div xmlns="http://www.w3.org/1999/xhtml" style="direction:rtl;text-align:center;font-family:Tajawal,'Noto Kufi Arabic','Segoe UI',Tahoma,Arial,sans-serif;font-size:23px;line-height:1.85;color:#22343c">${esc(String(c.body || "").replace(/{الاسم}/g, c.full_name || ""))}</div></foreignObject>
  ${signSvg}
</svg>`;
  }
  const dataCache = {};
  async function logoDataUrl(src) {
    if (!src) return null; if (dataCache[src]) return dataCache[src];
    try { const b = await (await fetch(src)).blob(); return dataCache[src] = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); }); } catch { return null; }
  }
  async function toPng(c) {
    const s = school(c.school), href = s.logo ? await logoDataUrl(s.logo) : null, moe = await logoDataUrl(MOE);
    const str = svg(c, s.logo ? (href || "") : null, moe || ""), img = new Image();
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(str);
    await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = url; });
    const cv = document.createElement("canvas"); cv.width = 2246; cv.height = 1588;
    const g = cv.getContext("2d"); g.drawImage(img, 0, 0, cv.width, cv.height);
    return new Promise(r => cv.toBlob(r, "image/png"));
  }
  async function download(c) {
    try { const blob = await toPng(c), a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `شهادة-${(c.full_name || "").split(" ")[0]}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); return true; }
    catch { print(c); return false; }
  }
  function print(c) {
    const w = window.open("", "_blank"); if (!w) return alert("اسمح بالنوافذ المنبثقة للطباعة.");
    w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(c.title)}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"><style>@page{size:A4 landscape;margin:0}html,body{margin:0;background:#fff}svg{width:100vw;height:auto;display:block}@media print{svg{width:297mm;height:210mm}}</style></head><body>${svg(c, school(c.school).logo ? new URL(school(c.school).logo, location.href).href : null, new URL(MOE, location.href).href)}<script>let d=0;const go=()=>{if(d++)return;print()};document.fonts&&document.fonts.ready.then(()=>setTimeout(go,400));setTimeout(go,2500)<\/script></body></html>`);
    w.document.close();
  }
  window.CERT = { SCHOOLS, KINDS, school, svg, download, print, fmtDate, AR };
})();
