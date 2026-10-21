// محرّك الاختبار المحاكي: يولّد أسئلة جديدة في كل محاولة من قوالب لكل مهارة
window.EXAMS = window.EXAMS || {};
window.ExamEngine = (() => {
  // ---------- أعداد عشرية دقيقة (عدد صحيح + عدد المنازل) ----------
  const P = n => 10 ** n;
  const d = (v) => { // d("2.14") أو d(3)
    const s = String(v); const neg = s.startsWith("-"); const [a, b = ""] = s.replace("-", "").split(".");
    return norm({ i: (neg ? -1 : 1) * parseInt(a + b, 10), s: b.length });
  };
  function norm(x) { let { i, s } = x; while (s > 0 && i % 10 === 0) { i /= 10; s--; } return { i, s }; }
  const up = (x, s) => x.i * P(s - x.s);
  const add = (...xs) => { const s = Math.max(...xs.map(x => x.s)); return norm({ i: xs.reduce((t, x) => t + up(x, s), 0), s }); };
  const sub = (a, ...bs) => { const s = Math.max(a.s, ...bs.map(x => x.s)); return norm({ i: bs.reduce((t, x) => t - up(x, s), up(a, s)), s }); };
  const mul = (...xs) => norm(xs.reduce((t, x) => ({ i: t.i * x.i, s: t.s + x.s }), { i: 1, s: 0 }));
  const shift = (x, k) => norm(k >= 0 ? { i: x.i, s: x.s + k } : { i: x.i * P(-k), s: x.s }); // ÷10^k
  const cmp = (a, b) => { const s = Math.max(a.s, b.s); return Math.sign(up(a, s) - up(b, s)); };
  const eq = (a, b) => cmp(a, b) === 0;
  function str(x) {
    const neg = x.i < 0; let t = String(Math.abs(x.i));
    if (x.s > 0) { t = t.padStart(x.s + 1, "0"); t = t.slice(0, -x.s) + "." + t.slice(-x.s); }
    return (neg ? "-" : "") + t;
  }
  const ar = s => String(s).replace(/(\d)\.(\d)/g, "$1,$2").replace(/[0-9]/g, c => "٠١٢٣٤٥٦٧٨٩"[c]);
  const fx = x => ar(str(x)); // للعرض
  const pad = (x, s) => { const t = str(x); const [a, b = ""] = t.split("."); return ar(a + "." + b.padEnd(s, "0")); };

  // ---------- مولّد أرقام عشوائي قابل للتكرار ----------
  function rng(seed) {
    let a = seed >>> 0;
    const next = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const R = {
      next,
      int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
      pick: arr => arr[Math.floor(next() * arr.length)],
      shuffle: arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
      // عدد عشري عشوائي: wMin..wMax للجزء الصحيح، وعدد منازل s، وآخر رقم غير صفري
      dec: (wMin, wMax, s) => { const w = R.int(wMin, wMax); let f = 0; for (let k = 0; k < s; k++) f = f * 10 + R.int(k === s - 1 ? 1 : 0, 9); return norm({ i: w * P(s) + f, s }); }
    };
    return R;
  }

  // ---------- بناء الخيارات ----------
  // correct: عدد عشري، wrong: مرشحات خاطئة (أعداد)، يكمل بالإزاحة إن نقصت
  function numOptions(R, correct, wrong) {
    const out = [correct];
    const tryAdd = x => { if (x && x.i >= 0 && !out.some(o => eq(o, x))) out.push(x); };
    wrong.forEach(tryAdd);
    const fill = [shift(correct, 1), shift(correct, -1), add(correct, { i: 1, s: correct.s || 1 }), sub(correct, { i: 1, s: correct.s || 1 }), shift(correct, 2), add(correct, d(1))];
    for (const f of fill) { if (out.length >= 4) break; tryAdd(f); }
    const opts = R.shuffle(out.slice(0, 4));
    return { options: opts.map(fx), correct: opts.findIndex(o => eq(o, correct)) };
  }
  const CMP = ["القيمة الأولى أكبر", "القيمة الثانية أكبر", "القيمتان متساويتان", "المعلومات غير كافية"];
  const cmpAnswer = (a, b) => ({ options: CMP, correct: cmp(a, b) > 0 ? 0 : cmp(a, b) < 0 ? 1 : 2 });
  const cmpBody = (lead, first, second) => `${lead ? lead + "\n" : ""}قارن بين:\nالقيمة الأولى: ${first}\nالقيمة الثانية: ${second}`;

  // ---------- تجميع الاختبار ----------
  // def: { minutes, blueprint: [[skillKey, count]], skills: { key: { title, from, to, gen(R, h) } } }
  function build(def, seed, usedSigs) {
    const R = rng(seed);
    const used = new Set(usedSigs || []);
    const items = [];
    for (const [key, count] of def.blueprint) {
      const sk = def.skills[key];
      const styleCount = {};
      for (let n = 0; n < count; n++) {
        let q = null;
        for (let tries = 0; tries < 60; tries++) {
          const c = sk.gen(R, H);
          if (!c) continue;
          const sig = key + "|" + c.sig;
          if (used.has(sig) || items.some(x => x.sig === sig)) continue;
          // نوّع الأسلوب داخل الاختبار نفسه ما أمكن
          if (c.style && styleCount[c.style] && tries < 25) continue;
          q = { ...c, sig, skill: key }; break;
        }
        // إذا استُنفدت كل الصيغ الجديدة (بعد عشرات المحاولات) نسمح بصيغة قديمة لا تتكرر داخل الاختبار نفسه
        for (let tries = 0; !q && tries < 60; tries++) {
          const c = sk.gen(R, H);
          if (c && !items.some(x => x.sig === key + "|" + c.sig)) q = { ...c, sig: key + "|" + c.sig, skill: key, repeat: true };
        }
        if (q) { styleCount[q.style] = 1; items.push(q); }
      }
    }
    return R.shuffle(items).map((q, i) => ({ ...q, n: i + 1 }));
  }
  const H = { d, add, sub, mul, shift, cmp, eq, str, ar, fx, pad, numOptions, cmpAnswer, cmpBody, P };
  const fmtTime = sec => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  return { build, H, rng, fmtTime };
})();
