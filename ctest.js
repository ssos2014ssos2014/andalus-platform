// الاختبارات التي ينشئها المعلم: التوليد بمستويات صعوبة، وعرض الرموز، وتحليل النتيجة
(() => {
  const AR = v => String(v ?? "").replace(/[0-9]/g, c => "٠١٢٣٤٥٦٧٨٩"[c]);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const LEVELS = ["الأساسي (مطابق لمستوى المحاضرات)", "المستوى ١ — أعلى قليلًا", "المستوى ٢ — متوسط الصعوبة", "المستوى ٣ — صعب", "المستوى ٤ — صعب جدًا", "المستوى ٥ — تحدٍّ (أعلى مستوى)"];
  const LETTERS = ["أ", "ب", "ج", "د"];
  const SUPS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  // ---------- تحويل رموز الأسئلة (الجذور والكسور والأسس) إلى HTML ----------
  function supHtml(s) { return esc(s).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => `<sup class="ex">${[...m].map(c => "٠١٢٣٤٥٦٧٨٩"[SUPS.indexOf(c)]).join("")}</sup>`); }
  function plain(s) { return String(s ?? "").split(/(⟦[^⟧]*⟧)/).map(p => { const m = p.match(/^⟦([^/⟧]*)\/([^⟧]*)⟧$/); return m ? `<span class="frc"><span class="fn">${supHtml(m[1])}</span><span class="fd">${supHtml(m[2])}</span></span>` : supHtml(p); }).join(""); }
  function toHtml(s) {
    return String(s ?? "").split(/((?:[⁰¹²³⁴⁵⁶⁷⁸⁹]*)√\{[^}]*\})/).map(p => {
      const m = p.match(/^([⁰¹²³⁴⁵⁶⁷⁸⁹]*)√\{([^}]*)\}$/);
      if (!m) return plain(p).replace(/\n/g, "<br>");
      const idx = m[1] ? `<sup class="ridx">${[...m[1]].map(c => "٠١٢٣٤٥٦٧٨٩"[SUPS.indexOf(c)]).join("")}</sup>` : "";
      return `<span class="rad"><span class="rsign">${idx}<span class="rs">√</span></span><span class="rin">${plain(m[2])}</span></span>`;
    }).join("");
  }
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
            q = { body: c.body, options: c.options, correct: c.correct, steps: c.steps || [], explanation: c.explanation || "", skill: p.sk.title, key: p.key, lid: p.l.id, ltitle: `${sub === "quant" ? "الكمي" : "اللفظي"} — ${p.l.title}`, from: p.sk.from || 0, level: lvl };
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
  window.CTEST = { LEVELS, LETTERS, AR, esc, toHtml, generate, analyze, band, advice, mmss };
})();
