// تحليل النتائج في لوحة المعلم: (١) التدريب على المحاضرات (٢) الاختبارات التي ينشئها المعلم ومقارنتها وقياس التحسن
(() => {
  let X; // سياق لوحة المعلم: { h, sb, AR, flash, SCHOOL, TEST_ID, lectures, wa, state }
  const band = p => CTEST.band(p), col = p => band(p)[1];
  const avg = a => a.length ? a.reduce((t, x) => t + x, 0) / a.length : 0;
  const median = a => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const sd = a => { if (a.length < 2) return 0; const m = avg(a); return Math.sqrt(avg(a.map(x => (x - m) ** 2))); };
  const R0 = v => Math.round(v);
  const P = v => X.AR(R0(v)) + "٪";
  const dt = s => new Date(s).toLocaleDateString("ar-SA-u-nu-arab", { day: "numeric", month: "short", year: "numeric" });
  const dtt = s => new Date(s).toLocaleString("ar-SA-u-nu-arab", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const tfmt = s => { s = Math.max(0, Math.round(s || 0)); return X.AR(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`); };
  const html = s => { const e = document.createElement("span"); e.innerHTML = s; return e; };
  const lecTitle = id => { const l = (X.lectures || []).find(x => x.id === id); return l ? l.title : `المحاضرة ${X.AR(id)}`; };
  const skillDef = (lid, key) => { const d = window.EXAMS && window.EXAMS[lid]; return d && d.skills && d.skills[key]; };
  const ranges = sk => [[sk.from, sk.to], ...(sk.extra || [])].map(([a, b]) => `${tfmt(a)} – ${tfmt(b)}`).join(" ، ");

  // ---------- الرسوم البيانية ----------
  function hbars(rows, opt = {}) {
    const h = X.h, max = opt.max || 100;
    return h("div", { class: "ana-bars" }, rows.map(r => h("div", { class: "ana-row" },
      h("div", { class: "ana-lbl", title: typeof r.label === "string" ? r.label : "" }, r.label),
      h("div", { class: "ana-track" }, h("i", { style: `width:${Math.max(0, Math.min(100, r.value / max * 100))}%;background:${r.color || col(opt.count ? 70 : r.value)}` })),
      h("div", { class: "ana-val" }, opt.count ? X.AR(r.value) : P(r.value), r.note && h("small", null, r.note)))));
  }
  function histogram(vals) {
    const bins = Array(10).fill(0); vals.forEach(v => { bins[Math.min(9, Math.floor(v / 10))]++; });
    const mx = Math.max(1, ...bins), W = 600, H = 190, bw = W / 10;
    const bars = bins.map((c, i) => { const bh = c / mx * (H - 46), x = W - (i + 1) * bw + 6, y = H - 26 - bh;
      return `<rect x="${x}" y="${y}" width="${bw - 12}" height="${bh}" rx="5" fill="${col(i * 10 + 5)}"></rect>${c ? `<text x="${x + (bw - 12) / 2}" y="${y - 5}" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">${X.AR(c)}</text>` : ""}
        <text x="${x + (bw - 12) / 2}" y="${H - 8}" text-anchor="middle" font-size="11" fill="currentColor" opacity=".7">${X.AR(i * 10)}–${X.AR(i === 9 ? 100 : i * 10 + 9)}</text>`; }).join("");
    return html(`<svg class="ana-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="توزيع الدرجات">${bars}</svg>`);
  }
  function lineChart(labels, series) {
    const W = 640, H = 250, L = 70, Rr = 60, T = 34, B = 30, n = labels.length;
    const xOf = i => n === 1 ? W / 2 : W - Rr - i * (W - L - Rr) / (n - 1), yOf = v => T + (100 - v) / 100 * (H - T - B);
    let g = [0, 25, 50, 75, 100].map(v => `<line x1="${L - 30}" x2="${W - 20}" y1="${yOf(v)}" y2="${yOf(v)}" stroke="currentColor" opacity=".12"></line><text x="${L - 36}" y="${yOf(v) + 4}" text-anchor="end" font-size="11" fill="currentColor" opacity=".6">${X.AR(v)}</text>`).join("");
    g += labels.map((t, i) => `<text x="${xOf(i)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="currentColor" opacity=".75">${CTEST.esc(String(t).slice(0, 18))}</text>`).join("");
    series.forEach(s => {
      const pts = s.points.map((v, i) => v == null ? null : [xOf(i), yOf(v), v]).filter(Boolean);
      if (pts.length > 1) g += `<polyline fill="none" stroke="${s.color}" stroke-width="3" stroke-linejoin="round" points="${pts.map(p => p[0] + "," + p[1]).join(" ")}"></polyline>`;
      g += pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${s.color}"></circle><text x="${p[0]}" y="${p[1] - 10}" text-anchor="middle" font-size="12" font-weight="700" fill="${s.color}">${X.AR(R0(p[2]))}</text>`).join("");
    });
    const legend = series.map((s, i) => `<g transform="translate(${W - 20 - i * 120}, 14)"><rect x="-12" y="-9" width="12" height="4" fill="${s.color}"></rect><text x="-18" y="-5" text-anchor="end" font-size="12" fill="currentColor">${CTEST.esc(s.name)}</text></g>`).join("");
    return html(`<svg class="ana-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="رسم تطور النتائج">${g}${series.length > 1 ? legend : ""}</svg>`);
  }
  const kpi = (k, v, s) => X.h("div", { class: "stat" }, X.h("div", { class: "v" }, v), X.h("div", { class: "k" }, k), s && X.h("div", { class: "s" }, s));
  const panel = (title, ...kids) => X.h("section", { class: "panel" }, X.h("h2", null, title), ...kids);
  const table = (heads, rows) => X.h("div", { class: "table-wrap" }, X.h("table", null, X.h("thead", null, X.h("tr", null, heads.map(t => X.h("th", null, t)))), X.h("tbody", null, rows)));
  const sg = (v, d = 0, suf = "") => X.h("span", null, X.h("bdi", { dir: "ltr" }, (v >= 0 ? "+" : "−") + X.AR(Math.abs(v).toFixed(d)).replace(".", "٫")), suf);
  const num = (v, d = 2) => X.h("bdi", { dir: "ltr" }, (v < 0 ? "−" : "") + X.AR(Math.abs(v).toFixed(d)).replace(".", "٫"));
  const chip = p => X.h("span", { class: "ana-chip", style: `background:${col(p)}` }, P(p));

  // ---------- النافذة المنبثقة والطباعة ----------
  function modal(title, body) {
    const h = X.h;
    const box = h("div", { class: "ana-modal", role: "dialog", "aria-modal": "true", "aria-label": title });
    const close = () => { box.remove(); document.removeEventListener("keydown", esc); };
    const esc = e => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", esc);
    const content = h("div", { class: "ana-modal-body" }, body);
    box.append(h("div", { class: "ana-modal-card" },
      h("div", { class: "ana-modal-head" }, h("strong", null, title),
        h("div", { class: "row", style: "gap:6px" }, h("button", { class: "btn ghost sm", onclick: () => printNode(title, content) }, "🖨 طباعة / PDF"), h("button", { class: "btn sm", onclick: close }, "إغلاق ✕"))),
      content));
    box.addEventListener("click", e => { if (e.target === box) close(); });
    document.body.append(box);
  }
  function printNode(title, node, parts) {
    CTEST.printDoc({ title, sub: X.SCHOOL.name, school: X.SCHOOL.key, parts: parts || [node.innerHTML] });
  }

  // =====================================================================
  // (١) التدريب على المحاضرات
  // =====================================================================
  let PASS = null;
  async function passMark() { if (PASS != null) return PASS; const { data } = await X.sb.from("settings").select("pass_mark").eq("id", 1).maybeSingle(); PASS = (data && data.pass_mark) || 70; return PASS; }
  async function loadTraining(f) {
    const args = { p_lecture: f.lecture ? +f.lecture : null, p_nid: f.nid ? toLatinDigits(f.nid) : null, p_days: f.days ? +f.days : null };
    const { data, error } = await X.sb.rpc("admin_training_attempts", args);
    if (!error) return { rows: data || [], full: true };
    if (!/admin_training_attempts|function|schema cache/i.test(error.message)) throw error;
    // قبل تشغيل update-v21.sql: نتائج دون تفاصيل المهارات
    let q = X.sb.from("attempts").select("id, submitted_at, national_id, lecture_id, mode, score, total, percent, passed, duration_sec, students!inner(full_name, phone, school)")
      .eq("students.school", X.SCHOOL.key).neq("national_id", X.TEST_ID).not("submitted_at", "is", null).order("submitted_at", { ascending: false }).limit(3000);
    if (args.p_nid) q = q.eq("national_id", args.p_nid);
    if (args.p_lecture) q = q.eq("lecture_id", args.p_lecture);
    if (args.p_days) q = q.gte("submitted_at", new Date(Date.now() - args.p_days * 864e5).toISOString());
    const r = await q; if (r.error) throw r.error;
    return { rows: r.data.map(x => ({ ...x, full_name: x.students?.full_name, phone: x.students?.phone, skills: null })), full: false };
  }
  function trainingStats(rows) {
    const byStu = {}, byLec = {}, skills = {};
    [...rows].sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at)).forEach(r => {
      const s = byStu[r.national_id] ||= { nid: r.national_id, name: r.full_name || r.national_id, phone: r.phone, rows: [], lec: {} };
      s.rows.push(r);
      const sl = s.lec[r.lecture_id] ||= { tries: 0, first: r.percent, best: 0, last: 0, passed: false, passAt: null };
      sl.tries++; sl.best = Math.max(sl.best, r.percent); sl.last = r.percent; if (r.passed && !sl.passed) { sl.passed = true; sl.passAt = sl.tries; }
      const L = byLec[r.lecture_id] ||= { lid: r.lecture_id, pcts: [], firsts: [], pass: 0, n: 0, students: new Set() };
      L.pcts.push(r.percent); L.n++; if (r.passed) L.pass++; if (!L.students.has(r.national_id)) { L.students.add(r.national_id); L.firsts.push(r.percent); }
      if (r.skills) for (const [k, v] of Object.entries(r.skills)) { const S = skills[`${r.lecture_id}|${k}`] ||= { lid: r.lecture_id, key: k, ok: 0, n: 0, stu: {} }; S.ok += v[0]; S.n += v[1]; const st = S.stu[r.national_id] ||= [0, 0]; st[0] += v[0]; st[1] += v[1]; }
    });
    const passTries = Object.values(byStu).flatMap(s => Object.values(s.lec).filter(l => l.passAt).map(l => l.passAt));
    return { byStu, byLec, skills, passTries };
  }
  async function training(ctx) {
    X = ctx; const h = X.h, F = X.state.tr ||= { lecture: "", days: "", nid: "" };
    const wrap = h("div");
    const lsel = h("select", { onchange: e => { F.lecture = e.target.value; run(); } }, h("option", { value: "" }, "كل المحاضرات"), X.lectures.map(l => h("option", { value: String(l.id), selected: F.lecture === String(l.id) }, l.title)));
    const dsel = h("select", { onchange: e => { F.days = e.target.value; run(); } }, [["", "كل الفترات"], ["7", "آخر ٧ أيام"], ["30", "آخر ٣٠ يومًا"], ["90", "آخر ٣ أشهر"]].map(([v, t]) => h("option", { value: v, selected: F.days === v }, t)));
    const nin = h("input", { type: "text", placeholder: "رقم هوية طالب (اختياري)", value: F.nid, onchange: e => { F.nid = e.target.value.trim(); run(); } });
    const out = h("div", null, h("p", { class: "muted" }, "جارٍ تحميل النتائج…"));
    async function run() {
      out.replaceChildren(h("p", { class: "muted" }, "جارٍ تحميل النتائج وتحليلها…"));
      try { const { rows, full } = await loadTraining(F); out.replaceChildren(...drawTraining(rows, full)); }
      catch (e) { out.replaceChildren(h("div", { class: "alert err" }, e.message)); }
    }
    wrap.append(h("section", { class: "panel ana-filters" }, h("h2", null, "🎯 نتائج التدريب على المحاضرات"),
      h("p", { class: "small muted", style: "margin-top:0" }, "كل محاولات الطلاب في اختبارات المحاضرات، مع تحليل المهارات وتقرير فردي لكل طالب ونسخة من التحليل الذي ظهر له بعد كل اختبار."),
      h("div", { class: "row", style: "gap:10px;flex-wrap:wrap" }, lsel, dsel, nin, h("button", { class: "btn", onclick: run }, "تحديث"))), out);
    run();
    return wrap;
  }
  function drawTraining(rows, full) {
    const h = X.h, st = trainingStats(rows), stus = Object.values(st.byStu), pcts = rows.map(r => r.percent);
    if (!rows.length) return [h("section", { class: "panel" }, h("p", { class: "muted", style: "margin:0" }, "لا توجد اختبارات مسلَّمة بهذه الشروط بعد."))];
    const passRate = rows.filter(r => r.passed).length / rows.length * 100, durs = rows.map(r => r.duration_sec).filter(x => x > 0);
    const lecs = Object.values(st.byLec).sort((a, b) => a.lid - b.lid);
    const skills = Object.values(st.skills).map(s => ({ ...s, pct: s.ok / s.n * 100, def: skillDef(s.lid, s.key) })).filter(s => s.n >= 3).sort((a, b) => a.pct - b.pct);
    const out = [];
    if (!full) out.push(h("div", { class: "alert warn" }, "لعرض تحليل المهارات شغّل ملف update-v21.sql مرة واحدة في Supabase ← SQL Editor، ثم حدّث الصفحة. تظهر الدرجات الآن دون تفاصيل المهارات."));
    out.push(h("div", { class: "kpis" },
      kpi("المحاولات المسلَّمة", X.AR(rows.length)), kpi("الطلاب المختبرون", X.AR(stus.length)), kpi("متوسط الدرجات", P(avg(pcts)), `الوسيط ${P(median(pcts))}`),
      kpi("نسبة الاجتياز", P(passRate), "من كل المحاولات"), kpi("متوسط المحاولات حتى الاجتياز", st.passTries.length ? X.AR(avg(st.passTries).toFixed(1)).replace(".", "٫") : "—"),
      kpi("متوسط زمن الاختبار", durs.length ? tfmt(avg(durs)) + " د" : "—")));
    out.push(h("div", { class: "ana-grid" },
      panel("📊 توزيع الدرجات", histogram(pcts), h("p", { class: "small muted" }, "عدد المحاولات في كل فئة من الدرجات.")),
      panel("🏅 مستويات الطلاب (أفضل نتيجة لكل طالب في كل محاضرة)", (() => {
        const best = stus.flatMap(s => Object.values(s.lec).map(l => l.best)), names = ["ممتاز", "جيد جدًا", "جيد", "يحتاج إلى تقوية", "يحتاج إلى خطة علاجية"];
        const cnt = names.map(n => best.filter(p => band(p)[0] === n).length);
        return hbars(names.map((n, i) => ({ label: n, value: cnt[i], color: [95, 80, 65, 50, 20].map(col)[i] })), { count: true, max: Math.max(1, ...cnt) });
      })())));
    out.push(panel("📚 الأداء في كل محاضرة", h("p", { class: "small muted", style: "margin-top:0" }, "الشريط: متوسط كل المحاولات. وتحته: متوسط المحاولة الأولى، ونسبة الاجتياز، وعدد الطلاب."),
      hbars(lecs.map(L => ({ label: lecTitle(L.lid), value: avg(L.pcts), note: `أول محاولة ${P(avg(L.firsts))} · اجتياز ${P(L.pass / L.n * 100)} · ${X.AR(L.students.size)} طالب` })))));
    if (skills.length) out.push(panel("🔍 المهارات الأضعف عند الطلاب", h("p", { class: "small muted", style: "margin-top:0" }, "نسبة الإجابات الصحيحة في كل مهارة من كل المحاولات، مرتبة من الأضعف. استعملها لتحديد ما تعيد شرحه."),
      table(["المهارة", "المحاضرة", "الصحيح", "الطلاب دون ٦٠٪", "مكانها في المقطع"], skills.slice(0, 25).map(s => {
        const weakStu = Object.values(s.stu).filter(v => v[1] && v[0] / v[1] < .6).length;
        return h("tr", null, h("td", null, s.def ? html(CTEST.toHtml(s.def.title)) : s.key), h("td", { class: "small" }, lecTitle(s.lid)), h("td", null, chip(s.pct), " ", h("span", { class: "small muted" }, `${X.AR(s.ok)} / ${X.AR(s.n)}`)),
          h("td", null, X.AR(weakStu)), h("td", { class: "small" }, s.def ? ranges(s.def) : "—"));
      }))));
    // الطلاب
    const stuRows = stus.map(s => { const L = Object.values(s.lec); return { s, tries: s.rows.length, passed: L.filter(l => l.passed).length, lecs: L.length, best: avg(L.map(l => l.best)), last: s.rows[s.rows.length - 1].submitted_at }; }).sort((a, b) => b.best - a.best);
    out.push(panel("👥 الطلاب — تقرير فردي لكل طالب", table(["#", "الطالب", "المحاولات", "المحاضرات المجتازة", "متوسط أفضل النتائج", "آخر اختبار", ""], stuRows.map((r, i) => h("tr", null,
      h("td", null, X.AR(i + 1)), h("td", null, r.s.name), h("td", null, X.AR(r.tries)), h("td", null, `${X.AR(r.passed)} من ${X.AR(r.lecs)}`), h("td", null, chip(r.best)), h("td", { class: "small" }, dt(r.last)),
      h("td", { style: "white-space:nowrap" }, h("button", { class: "btn sm", onclick: () => studentTraining(r.s, full) }, "📄 تقرير الطالب")))))));
    // السجل
    out.push(panel("🗂 سجل المحاولات", h("div", { class: "row ana-noprint", style: "margin-bottom:10px" }, h("button", { class: "btn ghost", onclick: () => exportTraining(rows, stuRows) }, "⬇ تصدير إلى Excel")),
      table(["التاريخ", "الطالب", "المحاضرة", "الدرجة", "النسبة", "النتيجة", ""], rows.slice(0, 600).map(r => h("tr", null,
        h("td", { class: "small" }, dtt(r.submitted_at)), h("td", null, r.full_name || r.national_id), h("td", { class: "small" }, lecTitle(r.lecture_id)), h("td", null, `${X.AR(r.score)}/${X.AR(r.total)}`), h("td", null, chip(r.percent)),
        h("td", { class: r.passed ? "chip-pass" : "chip-fail" }, r.passed ? "اجتاز" : "يحتاج مراجعة"),
        h("td", { style: "white-space:nowrap" }, h("div", { class: "row", style: "gap:6px;flex-wrap:nowrap" },
          h("button", { class: "btn sm", onclick: () => attemptView(r) }, "التحليل"),
          X.wa(r.phone, r.full_name || "", `السلام عليكم ${r.full_name || ""}،\nنتيجتك في اختبار ${lecTitle(r.lecture_id)}: ${r.score} من ${r.total} (${r.percent}%).\n`),
          h("button", { class: "btn ghost sm", onclick: async () => {
            if (!confirm(`حذف اختبار ${r.full_name || r.national_id} في ${lecTitle(r.lecture_id)}؟`)) return;
            const { error } = await X.sb.from("attempts").delete().eq("id", r.id); if (error) return X.flash("err", error.message);
            X.rerender();
          } }, "حذف")))))),
      rows.length > 600 && h("p", { class: "small muted" }, `يُعرض أحدث ٦٠٠ محاولة من ${X.AR(rows.length)}، والتصدير يشمل الجميع.`)));
    return out;
  }
  function exportTraining(rows, stuRows) {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.map(r => ({ "التاريخ": new Date(r.submitted_at).toLocaleString("ar-SA-u-nu-latn"), "الطالب": r.full_name || "", "رقم الهوية": r.national_id, "المحاضرة": lecTitle(r.lecture_id), "الدرجة": r.score, "من": r.total, "النسبة": r.percent, "النتيجة": r.passed ? "اجتاز" : "يحتاج مراجعة", "الزمن (ث)": r.duration_sec || "" }))), "المحاولات");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stuRows.map(r => ({ "الطالب": r.s.name, "رقم الهوية": r.s.nid, "المحاولات": r.tries, "المحاضرات المجتازة": r.passed, "المحاضرات المختبرة": r.lecs, "متوسط أفضل النتائج": R0(r.best) }))), "الطلاب");
    XLSX.writeFile(wb, "تحليل-التدريب.xlsx");
  }
  async function studentTraining(s, full) {
    const h = X.h, rows = s.rows, st = trainingStats(rows), L = st.byStu[s.nid].lec, pcts = rows.map(r => r.percent);
    const skills = Object.values(st.skills).map(k => ({ ...k, pct: k.ok / k.n * 100, def: skillDef(k.lid, k.key) })).sort((a, b) => a.pct - b.pct);
    const weak = skills.filter(k => k.pct < 60), strong = skills.filter(k => k.pct >= 85);
    const body = h("div", null,
      h("div", { class: "kpis" }, kpi("المحاولات", X.AR(rows.length)), kpi("المحاضرات المجتازة", `${X.AR(Object.values(L).filter(l => l.passed).length)} من ${X.AR(Object.keys(L).length)}`),
        kpi("متوسط الدرجات", P(avg(pcts))), kpi("أفضل نتيجة", P(Math.max(...pcts))), kpi("آخر نشاط", dt(rows[rows.length - 1].submitted_at))),
      rows.length > 1 && panel("📈 تطور الدرجات عبر المحاولات", lineChart(rows.map(r => `م${X.AR(r.lecture_id)}`), [{ name: "النسبة", color: "#1f6f78", points: pcts }])),
      panel("📚 النتيجة في كل محاضرة", table(["المحاضرة", "المحاولات", "الأولى", "الأفضل", "الأخيرة", "الحالة"], Object.entries(L).sort((a, b) => a[0] - b[0]).map(([lid, l]) => h("tr", null,
        h("td", null, lecTitle(+lid)), h("td", null, X.AR(l.tries)), h("td", null, chip(l.first)), h("td", null, chip(l.best)), h("td", null, chip(l.last)),
        h("td", { class: l.passed ? "chip-pass" : "chip-fail" }, l.passed ? `اجتاز (في المحاولة ${X.AR(l.passAt)})` : "لم يجتز بعد"))))),
      full && skills.length ? panel("🔍 المهارات", weak.length ? h("p", null, "⚠️ ", h("strong", null, "تحتاج إلى علاج: "), weak.map(k => k.def ? k.def.title : k.key).join("، ")) : h("p", null, "🌟 لا توجد مهارة تحت ٦٠٪."),
        strong.length ? h("p", null, "💪 ", h("strong", null, "نقاط القوة: "), strong.slice(0, 8).map(k => k.def ? k.def.title : k.key).join("، ")) : null,
        table(["المهارة", "المحاضرة", "الصحيح", "مكانها في المقطع"], skills.map(k => h("tr", null, h("td", null, k.def ? html(CTEST.toHtml(k.def.title)) : k.key), h("td", { class: "small" }, lecTitle(k.lid)),
          h("td", null, chip(k.pct), " ", h("span", { class: "small muted" }, `${X.AR(k.ok)} / ${X.AR(k.n)}`)), h("td", { class: "small" }, k.pct >= 85 ? "متقنة ✓" : k.def ? ranges(k.def) : "—"))))) : null,
      panel("🗂 المحاولات (اضغط لعرض التحليل الذي ظهر للطالب)", table(["التاريخ", "المحاضرة", "النسبة", "النتيجة", ""], [...rows].reverse().map(r => h("tr", null, h("td", { class: "small" }, dtt(r.submitted_at)), h("td", null, lecTitle(r.lecture_id)), h("td", null, chip(r.percent)),
        h("td", { class: r.passed ? "chip-pass" : "chip-fail" }, r.passed ? "اجتاز" : "يحتاج مراجعة"), h("td", null, h("button", { class: "btn sm ana-noprint", onclick: () => attemptView(r) }, "التحليل")))))));
    modal(`تقرير التدريب — ${s.name}`, body);
  }
  // نسخة من التحليل الفردي الذي يظهر للطالب بعد الاختبار المحاكي
  async function attemptView(r) {
    const h = X.h;
    const { data, error } = await X.sb.from("attempts").select("items, mode, score, total, percent, passed, duration_sec, lecture_id, submitted_at").eq("id", r.id).maybeSingle();
    if (error || !data) return alert(error ? error.message : "تعذر تحميل المحاولة.");
    const pm = await passMark(), def = window.EXAMS && window.EXAMS[data.lecture_id];
    const head = h("section", { class: "panel" }, h("div", { class: "score" },
      h("div", { class: "ring", style: `--p:${data.percent};--c:var(${data.passed ? "--ok" : "--warn"})` }, h("span", null, X.AR(data.percent) + "٪")),
      h("div", { style: "flex:1;min-width:220px" },
        h("h2", { class: "verdict " + (data.passed ? "pass" : "fail"), style: "margin:0 0 6px" }, data.passed ? "اجتاز الاختبار المحاكي" : data.percent >= pm - 20 ? "اقترب من الاجتياز" : "يحتاج إلى مراجعة المحاضرة"),
        h("p", { style: "margin:0" }, `${r.full_name || r.national_id} · ${lecTitle(data.lecture_id)}`),
        h("p", { class: "small muted", style: "margin:4px 0 0" }, `الدرجة ${X.AR(data.score)} من ${X.AR(data.total)} · نسبة الاجتياز ${X.AR(pm)}٪ · ${data.duration_sec ? "الزمن " + tfmt(data.duration_sec) + " · " : ""}${dtt(data.submitted_at)}`))));
    if (data.mode !== "generated" || !Array.isArray(data.items) || !def) return modal(`تحليل اختبار — ${r.full_name || ""}`, h("div", null, head, h("p", { class: "muted" }, "هذا الاختبار من بنك الأسئلة القديم، ولا تتوفر له تفاصيل المهارات.")));
    const per = {}; data.items.forEach(it => { const p = per[it.skill] ||= { ok: 0, n: 0 }; p.n++; if (it.chosen === it.correct) p.ok++; });
    const wrong = data.items.filter(it => it.chosen !== it.correct);
    const body = h("div", null, head,
      panel("نتيجته في كل مهارة", table(["المهارة", "الدرجة", "راجعها في المقطع (دقيقة)"], Object.keys(def.skills).filter(k => per[k]).map(k => { const p = per[k], sk = def.skills[k];
        return h("tr", null, h("td", null, html(CTEST.toHtml(sk.title))), h("td", { class: p.ok === p.n ? "chip-pass" : "chip-fail" }, `${X.AR(p.ok)} من ${X.AR(p.n)}`), h("td", { class: "small" }, p.ok === p.n ? "متقنة ✓" : ranges(sk))); }))),
      wrong.length ? panel(`الأسئلة التي لم يُجب عنها صحيحًا (${X.AR(wrong.length)})`, h("ol", { class: "review" }, wrong.map(it => { const sk = def.skills[it.skill] || { title: it.skill, from: 0, to: 0 };
        return h("li", { class: "wrong" }, h("div", { class: "small muted" }, `السؤال ${X.AR(it.n)} · `, html(CTEST.toHtml(sk.title))), h("div", { class: "rv-q" }, html(CTEST.toHtml(it.body))),
          h("div", { class: "rv-ans" }, h("div", { class: "rv-bad" }, h("span", null, "إجابته"), h("strong", null, it.chosen == null ? "لم يُجب" : html(CTEST.toHtml(it.options[it.chosen]))), h("em", null, "✗")),
            h("div", { class: "rv-good" }, h("span", null, "الإجابة الصحيحة"), h("strong", null, html(CTEST.toHtml(it.options[it.correct]))), h("em", null, "✓"))),
          h("div", { class: "rv-steps" }, h("h4", null, "📘 طريقة الحل خطوة بخطوة"), h("ol", null, (it.steps && it.steps.length ? it.steps : [it.explanation]).map(t => h("li", null, html(CTEST.toHtml(t)))))),
          h("p", { class: "a tip" }, "📍 مكان الشرح في المقطع: ", h("strong", null, ranges(sk))));
      }))) : panel("الأسئلة", h("p", { style: "margin:0" }, "أجاب عن جميع الأسئلة إجابة صحيحة 🎉")));
    modal(`تحليل اختبار ${lecTitle(data.lecture_id)} — ${r.full_name || ""}`, body);
  }

  // =====================================================================
  // (٢) الاختبارات التي ينشئها المعلم
  // =====================================================================
  const cache = {};
  async function examFull(id) {
    if (cache[id]) return cache[id];
    const [e, r] = await Promise.all([
      X.sb.from("custom_exams").select("id, code, title, delivery, level, sections, created_at").eq("id", id).single(),
      X.sb.from("custom_results").select("national_id, answers, score, total, percent, source, submitted_at, students(full_name, phone, school)").eq("exam_id", id)]);
    if (e.error) throw e.error; if (r.error) throw r.error;
    const results = r.data.filter(x => x.national_id !== X.TEST_ID).map(x => ({ ...x, name: x.students?.full_name || x.national_id, an: CTEST.analyze(e.data.sections, x.answers) }));
    return cache[id] = { exam: e.data, results };
  }
  async function custom(ctx) {
    X = ctx; const h = X.h, C = X.state.cu ||= { mode: "one", exam: null, cmp: [] };
    const { data: exams, error } = await X.sb.from("custom_exams").select("id, code, title, delivery, level, created_at, custom_results(count)").eq("school", X.SCHOOL.key).order("created_at", { ascending: true });
    if (error) throw new Error(/custom_exams/.test(error.message) ? "شغّل ملف update-v17.sql في Supabase أولًا." : error.message);
    const cnt = x => (x.custom_results && x.custom_results[0] && x.custom_results[0].count) || 0;
    const wrap = h("div"), out = h("div");
    const modeBtn = (k, t) => h("button", { class: C.mode === k ? "btn" : "btn ghost", onclick: () => { C.mode = k; draw(); } }, t);
    const draw = () => {
      wrap.replaceChildren(h("section", { class: "panel ana-filters" }, h("h2", null, "🧪 نتائج الاختبارات المنشأة"),
        h("div", { class: "row", style: "gap:8px;flex-wrap:wrap" }, modeBtn("one", "📊 تحليل اختبار"), modeBtn("cmp", "📈 مقارنة الاختبارات وقياس التحسن")),
        !exams.length ? h("p", { class: "muted" }, "لم تنشئ اختبارات بعد. أنشئها من تبويب «إنشاء اختبار».")
          : C.mode === "one" ? h("div", { class: "row", style: "gap:10px;flex-wrap:wrap;margin-top:12px" }, h("select", { onchange: e => { C.exam = e.target.value || null; draw(); } },
            h("option", { value: "" }, "اختر اختبارًا…"), [...exams].reverse().map(x => h("option", { value: x.id, selected: C.exam === x.id }, `${x.title} (${x.code}) — ${X.AR(cnt(x))} نتيجة`))))
            : h("div", { style: "margin-top:12px" }, h("p", { class: "small muted", style: "margin:0 0 6px" }, "اختر اختبارين أو أكثر بترتيبها الزمني (من الأقدم إلى الأحدث):"),
              h("div", { class: "ana-checks" }, exams.map(x => h("label", null, h("input", { type: "checkbox", checked: C.cmp.includes(x.id), onchange: e => { C.cmp = e.target.checked ? [...C.cmp, x.id] : C.cmp.filter(i => i !== x.id); draw(); } }),
                ` ${x.title} `, h("span", { class: "small muted" }, `(${dt(x.created_at)} · ${X.AR(cnt(x))} نتيجة)`)))))), out);
      out.replaceChildren(h("p", { class: "muted" }, "…"));
      if (C.mode === "one") { if (!C.exam) return out.replaceChildren(); examFull(C.exam).then(d => out.replaceChildren(...drawExam(d))).catch(e => out.replaceChildren(h("div", { class: "alert err" }, e.message))); }
      else { const ids = exams.filter(x => C.cmp.includes(x.id)).map(x => x.id); if (ids.length < 2) return out.replaceChildren(h("section", { class: "panel" }, h("p", { class: "muted", style: "margin:0" }, "اختر اختبارين على الأقل للمقارنة.")));
        Promise.all(ids.map(examFull)).then(ds => out.replaceChildren(...drawCompare(ds))).catch(e => out.replaceChildren(h("div", { class: "alert err" }, e.message))); }
    };
    draw();
    return wrap;
  }
  function itemAnalysis(exam, results) {
    const ranked = [...results].sort((a, b) => b.an.pct - a.an.pct), k = Math.max(1, Math.round(ranked.length * .27));
    const top = new Set(ranked.slice(0, k)), low = new Set(ranked.slice(-k));
    const items = [];
    exam.sections.forEach((s, si) => s.questions.forEach((q, qi) => {
      const ch = results.map(r => r.answers && r.answers[si] ? r.answers[si][qi] : null), n = results.length || 1;
      const ok = ch.filter(c => c === q.correct).length, blank = ch.filter(c => c == null).length;
      const dist = [0, 1, 2, 3].map(o => ch.filter(c => c === o).length);
      const pTop = [...top].filter(r => r.answers?.[si]?.[qi] === q.correct).length / top.size, pLow = [...low].filter(r => r.answers?.[si]?.[qi] === q.correct).length / low.size;
      const wrongOpt = [0, 1, 2, 3].filter(o => o !== q.correct).sort((a, b) => dist[b] - dist[a])[0];
      items.push({ si, qi, s, q, p: ok / n * 100, blank: blank / n * 100, D: results.length >= 6 ? pTop - pLow : null, dist, wrongOpt });
    }));
    return items;
  }
  function drawExam({ exam, results }) {
    const h = X.h;
    if (!results.length) return [h("section", { class: "panel" }, h("p", { class: "muted", style: "margin:0" }, "لا توجد نتائج لهذا الاختبار بعد."))];
    const pcts = results.map(r => r.an.pct), out = [];
    const total = exam.sections.reduce((t, s) => t + s.questions.length, 0);
    out.push(h("div", { class: "kpis" }, kpi("المختبرون", X.AR(results.length)), kpi("متوسط الدرجات", P(avg(pcts)), `${X.AR((avg(results.map(r => r.an.score))).toFixed(1)).replace(".", "٫")} من ${X.AR(total)}`),
      kpi("الوسيط", P(median(pcts))), kpi("أعلى / أدنى", `${P(Math.max(...pcts))} / ${P(Math.min(...pcts))}`), kpi("الانحراف المعياري", num(sd(pcts), 1), "كلما كبر زاد تفاوت الطلاب"),
      kpi("٦٠٪ فأعلى", P(pcts.filter(p => p >= 60).length / pcts.length * 100))));
    const names = ["ممتاز", "جيد جدًا", "جيد", "يحتاج إلى تقوية", "يحتاج إلى خطة علاجية"], cnt = names.map(n => pcts.filter(p => band(p)[0] === n).length);
    const subj = ["quant", "verbal"].map(sub => ({ sub, v: results.map(r => r.an.subj.find(x => x.sub === sub)).filter(Boolean).map(x => x.pct) })).filter(x => x.v.length);
    const secs = exam.sections.map((s, i) => ({ label: s.name, value: avg(results.map(r => r.an.bySec[i].pct)) }));
    out.push(h("div", { class: "ana-grid" }, panel("📊 توزيع الدرجات", histogram(pcts)),
      panel("🏅 مستويات الطلاب", hbars(names.map((n, i) => ({ label: n, value: cnt[i], color: [95, 80, 65, 50, 20].map(col)[i] })), { count: true, max: Math.max(1, ...cnt) })),
      panel("📐 الكمي واللفظي والأقسام", hbars([...subj.map(x => ({ label: x.sub === "quant" ? "الكمي" : "اللفظي", value: avg(x.v) })), ...(secs.length > subj.length ? secs : [])]))));
    // المهارات
    const sk = {};
    results.forEach(r => r.an.skills.forEach(s => { const k = `${s.lid}|${s.skill}`, b = sk[k] ||= { ...s, ok: 0, n: 0, weak: 0, stu: 0 }; b.ok += s.ok; b.n += s.n; b.stu++; if (s.pct < 60) b.weak++; }));
    const skills = Object.values(sk).map(b => ({ ...b, pct: b.ok / b.n * 100 })).sort((a, b) => a.pct - b.pct);
    out.push(panel("🔍 تحليل المهارات لجميع الطلاب", h("p", { class: "small muted", style: "margin-top:0" }, "نسبة الإجابات الصحيحة في كل مهارة، وعدد الطلاب الذين كانت نسبتهم فيها أقل من ٦٠٪."),
      hbars(skills.slice(0, 12).map(s => ({ label: s.skill, value: s.pct, note: s.ltitle }))),
      h("details", { style: "margin-top:12px" }, h("summary", { style: "cursor:pointer;font-weight:700" }, `جدول كل المهارات (${X.AR(skills.length)})`),
        table(["المهارة", "المحاضرة", "الصحيح", "الطلاب دون ٦٠٪", "للمراجعة من الدقيقة"], skills.map(s => h("tr", null, h("td", null, s.skill), h("td", { class: "small" }, s.ltitle),
          h("td", null, chip(s.pct), " ", h("span", { class: "small muted" }, `${X.AR(s.ok)} / ${X.AR(s.n)}`)), h("td", null, `${X.AR(s.weak)} من ${X.AR(s.stu)}`), h("td", { class: "small" }, CTEST.mmss(s.from))))))));
    // تحليل الأسئلة
    const items = itemAnalysis(exam, results);
    const diff = p => p >= 80 ? "سهل" : p >= 40 ? "متوسط" : "صعب";
    out.push(panel("🧩 تحليل الأسئلة (السهولة والتمييز والمشتتات)", h("p", { class: "small muted", style: "margin-top:0" }, "معامل التمييز = نسبة إجابة الأعلى ٢٧٪ صحيحًا − نسبة الأدنى ٢٧٪. السؤال الجيد تمييزه ٠٫٣ فأكثر، وإن كان أقل من ٠٫١ أو سالبًا فراجع صياغته أو مفتاحه. «المشتت الأقوى» هو الخيار الخاطئ الأكثر اختيارًا."),
      table(["القسم", "السؤال", "المهارة", "نسبة الصحيح", "الصعوبة", "التمييز", "المشتت الأقوى", "متروك", ""], items.map(it => h("tr", { class: it.D != null && it.D < .1 ? "ana-flag" : "" },
        h("td", { class: "small" }, it.s.name), h("td", null, X.AR(it.qi + 1)), h("td", { class: "small" }, it.q.skill), h("td", null, chip(it.p)), h("td", { class: "small" }, diff(it.p)),
        h("td", null, it.D == null ? "—" : num(it.D)), h("td", { class: "small" }, it.dist[it.wrongOpt] ? `${CTEST.LETTERS[it.wrongOpt]} (${P(it.dist[it.wrongOpt] / results.length * 100)})` : "—"),
        h("td", { class: "small" }, it.blank ? P(it.blank) : "—"),
        h("td", null, h("button", { class: "linkbtn ana-noprint", onclick: () => modal(`${it.s.name} — السؤال ${X.AR(it.qi + 1)}`, h("div", null, h("div", { class: "qbody" }, html(CTEST.toHtml(it.q.body))),
          table(["الخيار", "عدد من اختاره", ""], it.q.options.map((o, oi) => h("tr", { style: oi === it.q.correct ? "background:#e9f7ef" : "" }, h("td", null, `${CTEST.LETTERS[oi]}) `, html(CTEST.toHtml(o))), h("td", null, X.AR(it.dist[oi])), h("td", null, oi === it.q.correct ? "✓ الصحيحة" : "")))),
          h("ol", { style: "line-height:1.9" }, (it.q.steps || []).map(t => h("li", null, html(CTEST.toHtml(t)))))) ) }, "عرض")))))));
    // الطلاب
    const ranked = [...results].sort((a, b) => b.an.pct - a.an.pct);
    const sub = (r, k) => { const x = r.an.subj.find(s => s.sub === k); return x ? chip(x.pct) : "—"; };
    out.push(panel("👥 ترتيب الطلاب والتقارير الفردية", h("div", { class: "row ana-noprint", style: "gap:8px;margin-bottom:10px" },
        h("button", { class: "btn ghost", onclick: () => exportExam(exam, results, skills, items) }, "⬇ تصدير التحليل إلى Excel"), h("button", { class: "btn ghost", onclick: () => allReports(exam, ranked) }, "🖨 طباعة تقارير كل الطلاب")),
      table(["#", "الطالب", "الدرجة", "النسبة", "الكمي", "اللفظي", "المستوى", "النوع", ""], ranked.map((r, i) => h("tr", null, h("td", null, X.AR(i + 1)), h("td", null, r.name),
        h("td", null, `${X.AR(r.an.score)} / ${X.AR(r.an.total)}`), h("td", null, chip(r.an.pct)), h("td", null, sub(r, "quant")), h("td", null, sub(r, "verbal")),
        h("td", { class: "small", style: `color:${col(r.an.pct)};font-weight:700` }, band(r.an.pct)[0]), h("td", { class: "small" }, r.source === "paper" ? "ورقي" : "محوسب"),
        h("td", { style: "white-space:nowrap" }, h("div", { class: "row", style: "gap:6px;flex-wrap:nowrap" }, h("button", { class: "btn sm", onclick: () => customReport(exam, r) }, "📄 التقرير"),
          X.wa(r.students?.phone, r.name, `السلام عليكم ${r.name}،\nنتيجتك في «${exam.title}»: ${r.an.score} من ${r.an.total} (${r.an.pct}%).\n`))))))));
    // من لم يختبر
    const nonBox = h("div", { class: "small muted" }, "…");
    X.sb.from("students").select("national_id, full_name, is_test").eq("school", X.SCHOOL.key).then(({ data }) => {
      const done = new Set(results.map(r => r.national_id)), rest = (data || []).filter(s => !s.is_test && s.national_id !== X.TEST_ID && !done.has(s.national_id));
      nonBox.replaceChildren(rest.length ? h("details", null, h("summary", { style: "cursor:pointer;font-weight:700" }, `${X.AR(rest.length)} طالب لم يختبروا بعد`), h("p", { style: "line-height:2" }, rest.map(s => s.full_name).join("، "))) : "اختبر جميع الطلاب المسجلين ✓");
    });
    out.push(panel("🚫 لم يختبروا", nonBox));
    return out;
  }
  function customReport(exam, r) {
    const d = { title: exam.title, student: r.name, school: r.students?.school || X.SCHOOL.key, sections: exam.sections, answers: r.answers };
    const body = html(CTEST.reportHtml(d)); body.style.display = "block";
    modal(`تقرير ${r.name} — ${exam.title}`, body);
  }
  function allReports(exam, ranked) {
    printNode(`تقارير الطلاب — ${exam.title}`, null, ranked.map(r => CTEST.reportHtml({ title: exam.title, student: r.name, school: r.students?.school || X.SCHOOL.key, sections: exam.sections, answers: r.answers })));
  }
  function exportExam(exam, results, skills, items) {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([...results].sort((a, b) => b.an.pct - a.an.pct).map((r, i) => {
      const o = { "الترتيب": i + 1, "الطالب": r.name, "رقم الهوية": r.national_id, "الدرجة": r.an.score, "من": r.an.total, "النسبة": r.an.pct, "المستوى": band(r.an.pct)[0] };
      r.an.subj.forEach(s => { o[s.sub === "quant" ? "الكمي ٪" : "اللفظي ٪"] = s.pct; }); r.an.bySec.forEach(s => { o[s.name + " ٪"] = s.pct; });
      o["النوع"] = r.source === "paper" ? "ورقي" : "محوسب"; return o; })), "الطلاب");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(skills.map(s => ({ "المهارة": s.skill, "المحاضرة": s.ltitle, "الصحيح": s.ok, "عدد الإجابات": s.n, "النسبة": R0(s.pct), "طلاب دون ٦٠٪": s.weak }))), "المهارات");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(items.map(it => ({ "القسم": it.s.name, "السؤال": it.qi + 1, "المهارة": it.q.skill, "نسبة الصحيح": R0(it.p), "التمييز": it.D == null ? "" : +it.D.toFixed(2), "أ": it.dist[0], "ب": it.dist[1], "ج": it.dist[2], "د": it.dist[3], "الصحيحة": CTEST.LETTERS[it.q.correct] }))), "الأسئلة");
    XLSX.writeFile(wb, `تحليل-${exam.code}.xlsx`);
  }
  // ---------- المقارنة وقياس التحسن ----------
  function drawCompare(ds) {
    const h = X.h, out = [], labels = ds.map(d => d.exam.title);
    const sAvg = (d, sub) => { const v = d.results.map(r => r.an.subj.find(x => x.sub === sub)).filter(Boolean).map(x => x.pct); return v.length ? avg(v) : null; };
    const series = [{ name: "المتوسط العام", color: "#1f6f78", points: ds.map(d => d.results.length ? avg(d.results.map(r => r.an.pct)) : null) }];
    if (ds.some(d => sAvg(d, "quant") != null) && ds.some(d => sAvg(d, "verbal") != null)) series.push({ name: "الكمي", color: "#c38b2a", points: ds.map(d => sAvg(d, "quant")) }, { name: "اللفظي", color: "#8e44ad", points: ds.map(d => sAvg(d, "verbal")) });
    // الطلاب
    const stu = {};
    ds.forEach((d, i) => d.results.forEach(r => { const s = stu[r.national_id] ||= { nid: r.national_id, name: r.name, phone: r.students?.phone, school: r.students?.school, p: Array(ds.length).fill(null), res: Array(ds.length).fill(null) }; s.p[i] = r.an.pct; s.res[i] = r; }));
    const list = Object.values(stu).map(s => { const t = s.p.map((v, i) => [v, i]).filter(x => x[0] != null); const delta = t.length >= 2 ? t[t.length - 1][0] - t[0][0] : null; return { ...s, n: t.length, delta }; });
    const two = list.filter(s => s.delta != null), up = two.filter(s => s.delta >= 5), down = two.filter(s => s.delta <= -5);
    const status = d => d == null ? ["—", "#888"] : d >= 5 ? ["تحسّن ⬆", "#1e8449"] : d <= -5 ? ["تراجع ⬇", "#c0392b"] : ["ثبات ↔", "#d68910"];
    out.push(h("div", { class: "kpis" }, kpi("الاختبارات المقارنة", X.AR(ds.length)), kpi("طلاب في اختبارين فأكثر", X.AR(two.length)),
      kpi("تحسّن", X.AR(up.length), two.length ? P(up.length / two.length * 100) + " منهم" : ""), kpi("تراجع", X.AR(down.length), two.length ? P(down.length / two.length * 100) + " منهم" : ""),
      kpi("متوسط التغير", two.length ? sg(avg(two.map(s => s.delta)), 1, " نقطة") : "—", "من أول اختبار إلى آخر اختبار لكل طالب"),
      kpi("تغير المتوسط العام", (() => { const a = series[0].points.filter(v => v != null); return a.length >= 2 ? sg(a[a.length - 1] - a[0], 1, " نقطة") : "—"; })())));
    out.push(panel("📈 تطور متوسط الطلاب عبر الاختبارات", lineChart(labels, series),
      table(["الاختبار", "التاريخ", "المختبرون", "المتوسط", "الكمي", "اللفظي", "٦٠٪ فأعلى"], ds.map(d => { const p = d.results.map(r => r.an.pct), q = sAvg(d, "quant"), v = sAvg(d, "verbal");
        return h("tr", null, h("td", null, d.exam.title), h("td", { class: "small" }, dt(d.exam.created_at)), h("td", null, X.AR(d.results.length)), h("td", null, p.length ? chip(avg(p)) : "—"), h("td", null, q == null ? "—" : chip(q)), h("td", null, v == null ? "—" : chip(v)), h("td", null, p.length ? P(p.filter(x => x >= 60).length / p.length * 100) : "—")); }))));
    // المهارات المشتركة
    const sk = {};
    ds.forEach((d, i) => d.results.forEach(r => r.an.skills.forEach(s => { const k = `${s.lid}|${s.skill}`, b = sk[k] ||= { skill: s.skill, ltitle: s.ltitle, v: ds.map(() => [0, 0]) }; b.v[i][0] += s.ok; b.v[i][1] += s.n; })));
    const shared = Object.values(sk).map(b => { const p = b.v.map(([o, n]) => n ? o / n * 100 : null), t = p.filter(x => x != null); return { ...b, p, delta: t.length >= 2 ? t[t.length - 1] - t[0] : null }; }).filter(b => b.delta != null).sort((a, b) => a.delta - b.delta);
    if (shared.length) out.push(panel("🔍 تطور المهارات المشتركة بين الاختبارات", h("p", { class: "small muted", style: "margin-top:0" }, "المهارات التي ظهرت في اختبارين أو أكثر، مرتبة من الأكثر تراجعًا إلى الأكثر تحسنًا."),
      table(["المهارة", ...labels, "التغير"], shared.map(b => { const [t, c] = status(b.delta); return h("tr", null, h("td", null, b.skill, h("br"), h("span", { class: "small muted" }, b.ltitle)), ...b.p.map(v => h("td", null, v == null ? "—" : chip(v))),
        h("td", { style: `color:${c};font-weight:700;white-space:nowrap` }, sg(R0(b.delta)), " ", t.split(" ")[1] || "")); }))));
    // جدول الطلاب
    const sorted = [...list].sort((a, b) => (b.delta ?? -999) - (a.delta ?? -999));
    out.push(panel("👥 تحسن كل طالب", h("div", { class: "row ana-noprint", style: "margin-bottom:10px" }, h("button", { class: "btn ghost", onclick: () => {
        const ws = XLSX.utils.json_to_sheet(sorted.map(s => { const o = { "الطالب": s.name, "رقم الهوية": s.nid }; labels.forEach((l, i) => { o[l] = s.p[i] ?? ""; }); o["التغير"] = s.delta ?? ""; o["الحالة"] = status(s.delta)[0]; return o; }));
        const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "التحسن"); XLSX.writeFile(wb, "مقارنة-الاختبارات.xlsx"); } }, "⬇ تصدير إلى Excel")),
      table(["الطالب", ...labels, "التغير", "الحالة", ""], sorted.map(s => { const [t, c] = status(s.delta); return h("tr", null, h("td", null, s.name), ...s.p.map(v => h("td", null, v == null ? h("span", { class: "muted" }, "لم يختبر") : chip(v))),
        h("td", { style: `color:${c};font-weight:700` }, s.delta == null ? "—" : sg(s.delta)), h("td", { style: `color:${c};font-weight:700;white-space:nowrap` }, t),
        h("td", null, s.n >= 1 && h("button", { class: "btn sm", onclick: () => studentCompare(ds, s) }, "📄 تقرير التحسن"))); }))));
    return out;
  }
  function studentCompare(ds, s) {
    const h = X.h, idx = ds.map((d, i) => i).filter(i => s.res[i]), labels = idx.map(i => ds[i].exam.title);
    const sub = (i, k) => { const x = s.res[i].an.subj.find(y => y.sub === k); return x ? x.pct : null; };
    const series = [{ name: "النسبة الكلية", color: "#1f6f78", points: idx.map(i => s.p[i]) }];
    if (idx.some(i => sub(i, "quant") != null) && idx.some(i => sub(i, "verbal") != null)) series.push({ name: "الكمي", color: "#c38b2a", points: idx.map(i => sub(i, "quant")) }, { name: "اللفظي", color: "#8e44ad", points: idx.map(i => sub(i, "verbal")) });
    const sk = {};
    idx.forEach((i, j) => s.res[i].an.skills.forEach(x => { const k = `${x.lid}|${x.skill}`, b = sk[k] ||= { skill: x.skill, ltitle: x.ltitle, from: x.from, p: idx.map(() => null) }; b.p[j] = x.pct; }));
    const rows = Object.values(sk).map(b => { const t = b.p.filter(v => v != null); return { ...b, delta: t.length >= 2 ? t[t.length - 1] - t[0] : null, last: t[t.length - 1] }; });
    const stillWeak = rows.filter(b => b.last < 60), improved = rows.filter(b => b.delta != null && b.delta >= 20);
    const body = h("div", null,
      h("div", { class: "kpis" }, kpi("الاختبارات", X.AR(idx.length)), kpi("الأول", P(s.p[idx[0]])), kpi("الأخير", P(s.p[idx[idx.length - 1]])), kpi("التغير", s.delta == null ? "—" : sg(s.delta, 0, " نقطة"))),
      panel("📈 تطور النتائج", lineChart(labels, series)),
      improved.length ? h("p", null, "⬆ ", h("strong", null, "تحسّن بوضوح في: "), improved.map(b => b.skill).join("، ")) : null,
      stillWeak.length ? h("p", null, "⚠️ ", h("strong", null, "ما زال يحتاج إلى علاج في: "), stillWeak.map(b => `${b.skill} (${b.ltitle}، من الدقيقة ${CTEST.mmss(b.from)})`).join("، ")) : h("p", null, "🌟 لا توجد مهارة تحت ٦٠٪ في آخر اختبار."),
      panel("🔍 المهارات عبر الاختبارات", table(["المهارة", ...labels, "التغير"], rows.sort((a, b) => (a.last ?? 0) - (b.last ?? 0)).map(b => h("tr", null, h("td", null, b.skill, h("br"), h("span", { class: "small muted" }, b.ltitle)),
        ...b.p.map(v => h("td", null, v == null ? "—" : chip(v))), h("td", { style: "font-weight:700" }, b.delta == null ? "—" : sg(R0(b.delta))))))),
      h("div", { class: "row ana-noprint", style: "gap:6px;flex-wrap:wrap" }, idx.map(i => h("button", { class: "btn ghost sm", onclick: () => customReport(ds[i].exam, s.res[i]) }, `تقرير «${ds[i].exam.title}»`))));
    modal(`تقرير التحسن — ${s.name}`, body);
  }

  window.ANALYTICS = { training, custom };
})();
