// الاختبارات التي ينشئها المعلم: التوليد بمستويات صعوبة، وعرض الرموز، وتحليل النتيجة
(() => {
  const AR = v => String(v ?? "").replace(/[0-9]/g, c => "٠١٢٣٤٥٦٧٨٩"[c]);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const LEVELS = ["الأساسي (مطابق لمستوى المحاضرات)", "المستوى ١ — أعلى قليلًا", "المستوى ٢ — متوسط الصعوبة", "المستوى ٣ — صعب", "المستوى ٤ — صعب جدًا", "المستوى ٥ — تحدٍّ (أعلى مستوى)"];
  const LETTERS = ["أ", "ب", "ج", "د"];
  const SUPS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  // ---------- تحويل رموز الأسئلة (الجذور والكسور والأسس) إلى HTML ----------
  function supHtml(s) { return esc(s).replace(/⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => `<sup class="ex">${[...m].map(c => c === "⁻" ? "−" : "٠١٢٣٤٥٦٧٨٩"[SUPS.indexOf(c)]).join("")}</sup>`); }
  // الكسور ⟦بسط/مقام⟧ والجذور ⁿ√{…} مع دعم التداخل بينهما
  function mathTok(s) {
    s = String(s ?? ""); const out = []; let buf = "", i = 0;
    const flush = () => { if (buf) out.push({ t: "x", v: buf }); buf = ""; };
    const close = (j, o, c) => { let d = 0; for (; j < s.length; j++) { if (s[j] === o) d++; else if (s[j] === c && --d === 0) return j; } return -1; };
    while (i < s.length) {
      if (s[i] === "√" && s[i + 1] === "{") {
        const j = close(i + 1, "{", "}"); if (j < 0) { buf += s[i++]; continue; }
        const mm = buf.match(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+$/), idx = mm ? mm[0] : ""; if (idx) buf = buf.slice(0, -idx.length);
        flush(); out.push({ t: "r", idx, v: mathTok(s.slice(i + 2, j)) }); i = j + 1; continue;
      }
      if (s[i] === "⟦") {
        const j = close(i, "⟦", "⟧"); if (j < 0) { buf += s[i++]; continue; }
        const inner = s.slice(i + 1, j); let d = 0, k = -1;
        for (let q = 0; q < inner.length; q++) { const c = inner[q]; if (c === "{" || c === "⟦") d++; else if (c === "}" || c === "⟧") d--; else if (c === "/" && d === 0) { k = q; break; } }
        if (k < 0) { buf += s.slice(i, j + 1); i = j + 1; continue; }
        flush(); out.push({ t: "f", n: mathTok(inner.slice(0, k)), d: mathTok(inner.slice(k + 1)) }); i = j + 1; continue;
      }
      buf += s[i++];
    }
    flush(); return out;
  }
  const digAr = m => [...m].map(c => "٠١٢٣٤٥٦٧٨٩"[SUPS.indexOf(c)]).join("");
  function nodesHtml(ns) {
    return ns.map(n => n.t === "x" ? supHtml(n.v).replace(/\n/g, "<br>")
      : n.t === "f" ? `<span class="frc"><span class="fn">${nodesHtml(n.n)}</span><span class="fd">${nodesHtml(n.d)}</span></span>`
      : `<span class="rad"><span class="rsign">${n.idx ? `<sup class="ridx">${digAr(n.idx)}</sup>` : ""}<span class="rs">√</span></span><span class="rin">${nodesHtml(n.v)}</span></span>`).join("");
  }
  function plain(s) { return nodesHtml(mathTok(s)); }
  function toHtml(s) { return nodesHtml(mathTok(s)); }
  // ---------- مولد عشوائي بمستوى صعوبة ----------
  function levelR(R, L) {
    if (!L) return R;
    const X = Object.create(R);
    X.int = (a, b) => {
      // لا نغيّر الفهارس (تبدأ من صفر) ولا المدى الضيق
      if (a === 0 || b - a < 3) return R.int(a, b);
      const span = b - a, hi = b + Math.round(span * 0.45 * L), lo = Math.min(b, a + Math.round(span * 0.12 * L));
      return R.int(lo, hi);
    };
    return X;
  }
  const valid = c => c && Array.isArray(c.options) && c.options.length === 4 && c.correct >= 0 && c.correct <= 3 && new Set(c.options).size === 4
    && !/NaN|undefined|null|Infinity|[0-9]/.test([c.body, ...c.options].join(" ")) && String(c.body).length < 1800;
  const weightOf = (key, sub, L) => sub === "verbal" ? (key === "analogy" ? Math.max(1, 6 - L) : 1 + L * 0.7) : 1;
  // cfg: { level, lectures:[{id, section, title}], quant:{count,sections,minutes}, verbal:{...}, seed }
  function generate(cfg) {
    const R0 = ExamEngine.rng(cfg.seed || (Date.now() >>> 0)), H = ExamEngine.H, L = +cfg.level || 0, used = new Set(), out = [];
    for (const sub of ["quant", "verbal"]) {
      const sc = cfg[sub]; if (!sc || !(sc.count > 0) || !(sc.sections > 0)) continue;
      const lecs = cfg.lectures.filter(l => (l.section || "quant") === sub && window.EXAMS[l.id]);
      if (!lecs.length) throw new Error(`لم تختر محاضرات ${sub === "quant" ? "كمية" : "لفظية"} لها بنك أسئلة.`);
      const pool = lecs.flatMap(l => Object.entries(window.EXAMS[l.id].skills).map(([key, sk]) => ({ l, key, sk, w: weightOf(key, sub, L) })));
      const per = Array.from({ length: sc.sections }, (_, i) => Math.floor(sc.count / sc.sections) + (i < sc.count % sc.sections ? 1 : 0));
      // توزيع عادل على المحاضرات المختارة
      let order = [];
      per.forEach((n, si) => {
        const qs = [];
        for (let k = 0; k < n; k++) {
          if (!order.length) order = R0.shuffle(lecs.map(l => l.id));
          const lid = order.pop(), cands = pool.filter(p => p.l.id === lid), tot = cands.reduce((t, p) => t + p.w, 0);
          let q = null;
          for (let t = 0; t < 80 && !q; t++) {
            let r = R0.next() * tot, p = cands[0]; for (const c of cands) { r -= c.w; if (r <= 0) { p = c; break; } }
            const lvl = t < 50 ? L : 0;
            let c = null; try { c = p.sk.gen(levelR(R0, lvl), H); } catch { c = null; }
            if (!valid(c)) continue;
            const sig = `${p.l.id}|${p.key}|${c.sig}`; if (used.has(sig)) continue; used.add(sig);
            q = { body: c.body, options: c.options, correct: c.correct, steps: c.steps || [], explanation: c.explanation || "", skill: p.sk.title, key: p.key, lid: p.l.id, ltitle: `${sub === "quant" ? "الكمي" : "اللفظي"} — ${p.l.title}${p.sk.seg ? ` (${p.sk.seg})` : ""}`, from: p.sk.from || 0, level: lvl };
          }
          if (q) qs.push(q);
        }
        out.push({ name: `${sub === "quant" ? "القسم الكمي" : "القسم اللفظي"} ${sc.sections > 1 ? "(" + AR(si + 1) + ")" : ""}`.trim(), subject: sub, minutes: sc.minutes, questions: R0.shuffle(qs) });
      });
    }
    return out;
  }
  // ---------- التحليل ----------
  const mmss = s => `${AR(String(Math.floor((s || 0) / 60)).padStart(2, "0"))}:${AR(String(Math.round(s || 0) % 60).padStart(2, "0"))}`;
  function analyze(sections, answers) {
    let score = 0, total = 0; const bySec = [], bySkill = {};
    sections.forEach((s, si) => { let sc = 0;
      s.questions.forEach((q, qi) => { const ok = answers && answers[si] && answers[si][qi] === q.correct; total++; if (ok) { score++; sc++; }
        const k = `${q.lid}|${q.key}`; const b = bySkill[k] ||= { skill: q.skill, ltitle: q.ltitle, lid: q.lid, from: q.from, subject: s.subject, ok: 0, n: 0 }; b.n++; if (ok) b.ok++; });
      bySec.push({ name: s.name, subject: s.subject, ok: sc, n: s.questions.length, pct: s.questions.length ? Math.round(sc * 100 / s.questions.length) : 0 }); });
    const skills = Object.values(bySkill).map(b => ({ ...b, pct: Math.round(b.ok * 100 / b.n) })).sort((a, b) => a.pct - b.pct);
    const pct = total ? Math.round(score * 100 / total) : 0;
    const subj = ["quant", "verbal"].map(sub => { const ss = bySec.filter(x => x.subject === sub); const ok = ss.reduce((t, x) => t + x.ok, 0), n = ss.reduce((t, x) => t + x.n, 0); return n ? { sub, ok, n, pct: Math.round(ok * 100 / n) } : null; }).filter(Boolean);
    return { score, total, pct, bySec, skills, subj };
  }
  function band(p) { return p >= 90 ? ["ممتاز", "#1e8449"] : p >= 75 ? ["جيد جدًا", "#27ae60"] : p >= 60 ? ["جيد", "#d68910"] : p >= 40 ? ["يحتاج إلى تقوية", "#ca6f1e"] : ["يحتاج إلى خطة علاجية", "#c0392b"]; }
  function advice(an, female) {
    const t = female ? { you: "كِ", rev: "راجعي", prac: "تدرّبي", keep: "حافظي", start: "ابدئي" } : { you: "ك", rev: "راجع", prac: "تدرّب", keep: "حافظ", start: "ابدأ" };
    const weak = an.skills.filter(s => s.pct < 60), mid = an.skills.filter(s => s.pct >= 60 && s.pct < 85), strong = an.skills.filter(s => s.pct >= 85);
    const tips = [];
    an.subj.forEach(s => {
      if (s.sub === "quant") tips.push(s.pct < 60 ? `في الكمي: ${t.start} بمراجعة القوانين الأساسية، و${t.prac} على حل الأسئلة بتجريب الخيارات واستبعاد غير المنطقي منها.` : `في الكمي: ${t.keep} على سرعتك، واختصر الحسابات بالتقريب عندما تكون الخيارات متباعدة.`);
      else tips.push(s.pct < 60 ? `في اللفظي: اقرأ${female ? "ي" : ""} السؤال قبل النص، وحدّد${female ? "ي" : ""} العلاقة في التناظر بجملة مفيدة قبل النظر في الخيارات.` : `في اللفظي: ${t.keep} على قراءة النص بتركيز، وانتبه${female ? "ي" : ""} لأدوات الربط (لكن، لذلك، إذ) فهي مفتاح كثير من الإجابات.`);
    });
    tips.push("نظّم وقتك: لا تتوقف عند سؤال صعب أكثر من دقيقة، وضع عليه علامة وارجع إليه في آخر القسم.");
    const plan = [];
    if (weak.length) {
      plan.push({ title: "الأسبوع الأول — علاج نقاط الضعف", items: weak.slice(0, 6).map(s => `${t.rev} «${s.ltitle}» من الدقيقة ${mmss(s.from)} (مهارة: ${s.skill})، ثم أعد${female ? "ي" : ""} اختبار المحاضرة في المنصة حتى تتجاوز ٨٠٪.`) });
    }
    if (mid.length) plan.push({ title: weak.length ? "الأسبوع الثاني — التقوية" : "الأسبوع الأول — التقوية", items: mid.slice(0, 6).map(s => `${t.prac} على «${s.skill}» (${s.ltitle}) بحل اختبارين محاكيين، وراجع${female ? "ي" : ""} شرح الأسئلة الخاطئة.`) });
    plan.push({ title: "بعد ذلك — التثبيت", items: [`${t.prac} على اختبار شامل كل ٣ أيام بالوقت الكامل.`, strong.length ? `نقاط قوت${t.you}: ${strong.slice(0, 4).map(s => s.skill).join("، ")} — ${t.keep} عليها بالمراجعة الخفيفة.` : `استمر${female ? "ي" : ""} حتى تصبح كل مهارة فوق ٨٥٪.`] });
    return { weak, mid, strong, tips, plan };
  }
  // تقرير الطالب الفردي في الاختبار المنشأ (يُستخدم في صفحة الاستعلام وفي لوحة المعلم والطباعة)
  function donut(p, size, label) {
    const r = 42, c = 2 * Math.PI * r, col = band(p)[1];
    return `<svg class="rp-donut" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${AR(p)}٪"><circle cx="50" cy="50" r="${r}" fill="none" stroke="#e8eef0" stroke-width="11"/>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${(c * p / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 50 50)"/>
      <text x="50" y="${label ? 52 : 57}" text-anchor="middle" font-size="${label ? 21 : 23}" font-weight="800" fill="${col}" font-family="Tajawal,Tahoma,sans-serif">${AR(p)}٪</text>${label ? `<text x="50" y="69" text-anchor="middle" font-size="10" fill="#6b7c84" font-family="Tajawal,Tahoma,sans-serif">${esc(label)}</text>` : ""}</svg>`;
  }
  const rbar = (lbl, p, note) => `<div class="rp-bar"><span class="rp-lbl">${esc(lbl)}${note ? `<small>${esc(note)}</small>` : ""}</span><span class="rp-track"><i style="width:${p}%;background:${band(p)[1]}"></i></span><b style="color:${band(p)[1]}">${AR(p)}٪</b></div>`;
  function reportHtml(d) {
    const female = d.school === "asma", an = analyze(d.sections, d.answers), [bt, bc] = band(an.pct), adv = advice(an, female);
    const wrongs = d.sections.flatMap((s, si) => s.questions.map((q, qi) => ({ q, s, si, qi, ch: d.answers[si] && d.answers[si][qi] })).filter(x => x.ch !== x.q.correct));
    const blank = d.sections.reduce((t, s, si) => t + s.questions.filter((_, qi) => d.answers[si] == null || d.answers[si][qi] == null).length, 0);
    return `<div class="rp">
      <section class="panel rp-hero">
        <div class="rp-hero-main">${donut(an.pct, 150, "النتيجة الكلية")}
          <div><p class="rp-eyebrow">${esc(d.title)}</p><h1 class="rp-name">${esc(d.student)}</h1>
            <span class="rp-band" style="background:${bc}">${bt}</span>
            <div class="rp-facts"><span>✔️ صحيح <b>${AR(an.score)}</b></span><span>✖️ خطأ <b>${AR(an.total - an.score - blank)}</b></span><span>⭕ متروك <b>${AR(blank)}</b></span><span>📝 من <b>${AR(an.total)}</b></span></div></div></div>
        ${an.subj.length ? `<div class="rp-subj">${an.subj.map(s => `<div>${donut(s.pct, 96, s.sub === "quant" ? "الكمي" : "اللفظي")}<small>${AR(s.ok)} / ${AR(s.n)}</small></div>`).join("")}</div>` : ""}
      </section>
      <div class="rp-cols">
        <section class="panel"><h2>📋 الأداء في كل قسم</h2>${an.bySec.map(s => rbar(s.name, s.pct, `${AR(s.ok)} من ${AR(s.n)}`)).join("")}</section>
        <section class="panel"><h2>🧭 ملخص المستوى</h2>
          ${adv.strong.length ? `<p class="rp-tag ok">💪 <b>نقاط القوة:</b> ${adv.strong.slice(0, 6).map(s => esc(s.skill)).join("، ")}</p>` : ""}
          ${adv.mid.length ? `<p class="rp-tag mid">📈 <b>تحتاج إلى تقوية:</b> ${adv.mid.slice(0, 6).map(s => esc(s.skill)).join("، ")}</p>` : ""}
          ${adv.weak.length ? `<p class="rp-tag bad">⚠️ <b>تحتاج إلى علاج:</b> ${adv.weak.slice(0, 6).map(s => esc(s.skill)).join("، ")}</p>` : `<p class="rp-tag ok">🌟 لا توجد مهارة تحت ٦٠٪، أحسنت!</p>`}</section>
      </div>
      <section class="panel"><h2>🔍 تحليل المهارات</h2><div class="rp-chart">${an.skills.map(s => rbar(s.skill, s.pct, `${s.ltitle} · ${AR(s.ok)} / ${AR(s.n)}`)).join("")}</div></section>
      <section class="panel"><h2>💡 نصائح وتوصيات</h2><ul class="rp-list">${adv.tips.map(t => `<li>${esc(t)}</li>`).join("")}</ul></section>
      <section class="panel"><h2>🗓 الخطة العلاجية المقترحة</h2>${adv.plan.map(p => `<div class="rp-plan"><h3>${esc(p.title)}</h3><ul class="rp-list">${p.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("")}</section>
      <section class="panel"><h2>✍️ مراجعة الأسئلة الخاطئة (${AR(wrongs.length)})</h2>${wrongs.length ? wrongs.map(x => `<details class="rp-q"><summary><b>${esc(x.s.name)} — السؤال ${AR(x.qi + 1)}</b> <span class="small muted">· ${esc(x.q.skill)}</span></summary>
        <div class="qbody">${toHtml(x.q.body)}</div>
        <div class="rp-ans"><span class="bad">إجابتك: <b>${x.ch == null ? "لم تُجب" : toHtml(x.q.options[x.ch])}</b></span><span class="good">الصحيحة: <b>${toHtml(x.q.options[x.q.correct])}</b></span></div>
        <ol class="rp-steps">${(x.q.steps || []).map(st => `<li>${toHtml(st)}</li>`).join("")}</ol>
        <p class="small muted">📺 للمراجعة: ${esc(x.q.ltitle)} — من الدقيقة ${mmss(x.q.from)}</p></details>`).join("") : "<p>لا توجد أخطاء 🎉</p>"}</section>
    </div>`;
  }

  // ---------- طباعة التقارير بكليشة رسمية ثابتة أعلى كل صفحة وتوقيعات المسؤولين في آخر كل تقرير ----------
  // opt: { title, sub, school, parts: [html, ...], landscape }
  function printDoc(opt) {
    const key = opt.school || (window.SCHOOL && window.SCHOOL.key) || "andalus";
    const S = (window.SCHOOLS_INFO && window.SCHOOLS_INFO[key]) || window.SCHOOL || {}, C = window.CERT ? window.CERT.school(key) : { name: S.name, sign: [] };
    const base = location.href.replace(/[?#].*$/, "").replace(/[^/]*$/, ""), logo = new URL(S.logo || "logo.png", base).href, moe = new URL("moe-logo.png", base).href;
    const now = new Date(), d = window.CERT ? window.CERT.fmtDate(now.toISOString()) : { hij: "", gr: now.toLocaleDateString("ar-SA") };
    const signs = (C.sign || []).map(([r, n]) => `<div class="sg"><b>${esc(r)}</b><i></i><span>${esc(n)}</span></div>`).join("");
    const head = `<div class="lh"><div class="lh-r"><b>المملكة العربية السعودية</b><b>وزارة التعليم</b><b>الإدارة العامة للتعليم بمنطقة عسير</b><b>${esc(C.name || S.name || "")}</b></div>
      <div class="lh-c"><img src="${moe}" alt="وزارة التعليم"></div>
      <div class="lh-l"><img src="${logo}" alt=""><span>${esc(d.hij)}</span><span>الموافق ${esc(d.gr)}</span></div></div><div class="lh-rule"><i></i><i></i></div>`;
    const parts = (opt.parts || []).map((p, i, a) => `<section class="part${i < a.length - 1 ? " brk" : ""}">${p}<div class="signs">${signs}</div></section>`).join("");
    const w = window.open("", "_blank"); if (!w) return alert("اسمح بالنوافذ المنبثقة للطباعة.");
    w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(opt.title || "تقرير")}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}styles.css">
<style>
:root{--ink:#13293d;--ink-2:#3d5468;--muted:#6b7f8e;--tile:#1d6a84;--tile-deep:#144f63;--tile-soft:#e2eff3;--saffron:#c38b2a;--saffron-soft:#f6ead3;--paper:#fff;--surface:#fff;--line:#d7e0e4;--ok:#2c7a55;--warn:#b5523c;color-scheme:light}
@page{size:A4 ${opt.landscape ? "landscape" : "portrait"};margin:9mm 10mm 10mm}
*{-webkit-print-color-adjust:exact;print-color-adjust:exact}
html,body{background:#fff!important;color:#13293d;margin:0;font-family:Tajawal,"Noto Kufi Arabic",Tahoma,sans-serif}
table.doc{width:100%;border-collapse:collapse}table.doc>thead>tr>td,table.doc>tfoot>tr>td,table.doc>tbody>tr>td{padding:0;border:0;text-align:initial;background:none}
.lh{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;padding:4px 6px 6px}
.lh-r,.lh-l{display:flex;flex-direction:column;align-items:center;text-align:center;line-height:1.55;font-size:12.5px}
.lh-r b{font-weight:800;color:#144f63}.lh-l b{font-weight:700;color:#7a5a12}.lh-l span{color:#566;font-size:11.5px}
.lh-c img{height:84px;max-width:150px;object-fit:contain}.lh-l img{height:50px;max-width:150px;object-fit:contain;margin-bottom:3px}
.lh-rule{margin:0 0 10px}.lh-rule i{display:block;height:3px;background:linear-gradient(90deg,#e8c766,#b8862b,#e8c766)}.lh-rule i+i{height:1px;margin-top:2px;background:#1f6f78}
.ft{border-top:1px solid #c9a54a;margin-top:8px;padding-top:4px;display:flex;justify-content:space-between;font-size:10.5px;color:#6b7c84}
.doc-title{text-align:center;margin:2px 0 12px}.doc-title h1{margin:0;font-size:21px;color:#144f63}.doc-title p{margin:2px 0 0;color:#6b7c84;font-size:12.5px}
.part.brk{break-after:page}
.signs{display:grid;grid-template-columns:repeat(${Math.max(1, (C.sign || []).length)},1fr);gap:18px;margin-top:26px;break-inside:avoid}
.sg{text-align:center;font-size:13px}.sg b{display:block;color:#7a5a12}.sg i{display:block;border-bottom:1.3px dashed #c9a54a;height:34px;margin:0 18%}.sg span{display:block;font-weight:700;margin-top:5px;color:#173a4a}
.panel{box-shadow:none!important;border:1px solid #dfe7ea!important;border-radius:12px!important;padding:12px 14px!important;margin:0 0 10px!important;background:#fff!important;break-inside:auto}
.panel h2{font-size:16px;margin:0 0 8px;color:#144f63;break-after:avoid}
.kpis{grid-template-columns:repeat(3,1fr)!important;gap:8px!important;break-inside:avoid}.stat{box-shadow:none!important;padding:8px 10px!important}.stat .v{font-size:19px!important}
.ana-grid{grid-template-columns:1fr 1fr!important;gap:10px!important}.ana-grid>.panel{break-inside:avoid}
table{font-size:12px}thead{display:table-header-group}tr,.review li,.ana-row,details{break-inside:avoid}
.table-wrap{overflow:visible!important;border-radius:10px}.table-wrap th{background:#e2eff3!important}
.btn,.linkbtn,.ana-noprint,button{display:none!important}
details>summary{list-style:none;font-weight:700}
</style></head><body><table class="doc"><thead><tr><td>${head}</td></tr></thead>
<tfoot><tr><td><div class="ft"><span>${esc(C.name || S.name || "")} — منصة التأسيس والتدريب لاختبار القدرات العامة</span><span>طُبع في ${esc(d.hij)}</span></div></td></tr></tfoot>
<tbody><tr><td><div class="doc-title"><h1>${esc(opt.title || "")}</h1>${opt.sub ? `<p>${esc(opt.sub)}</p>` : ""}</div>${parts}</td></tr></tbody></table>
<script>document.querySelectorAll("details").forEach(x=>x.open=true);let k=0;const go=()=>{if(k++)return;print()};(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>setTimeout(go,600));setTimeout(go,3000)<\/script></body></html>`);
    w.document.close();
    // صيغة المؤنث في منصة الطالبات
    if (window.feminize && S.female) { const walk = n => { if (n.nodeType === 3) n.nodeValue = window.feminize(n.nodeValue); else if (n.nodeType === 1 && !/^(SCRIPT|STYLE)$/i.test(n.tagName)) n.childNodes.forEach(walk); }; try { walk(w.document.body); } catch {} }
  }
  window.CTEST = { LEVELS, LETTERS, AR, esc, toHtml, generate, analyze, band, advice, mmss, reportHtml, printDoc };
})();
