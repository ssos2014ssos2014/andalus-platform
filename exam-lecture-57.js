// المحاضرة 57: الحل بالعكس
(() => {
  const RULE = "الحل بالعكس: نبدأ من الناتج في نهاية المسألة ونتحرك إلى الخلف، ونعكس كل عملية (الجمع ← طرح ، الضرب ← قسمة ، والعكس).";
  const num = (h, R, v, w) => h.numOptions(R, h.d(v), [...new Set(w.filter(x => x > 0 && x !== v && Number.isInteger(x)))].slice(0, 3).map(x => h.d(x)).concat([h.d(v + 3), h.d(v + 6), h.d(v + 9)]).slice(0, 3));
  window.EXAMS[57] = {
    title: "اختبار محاكي: الحل بالعكس", minutes: 25,
    blueprint: [["divAdd", 4], ["give", 4], ["multSub", 4], ["train", 4], ["chain", 4], ["daily", 4]],
    skills: {
      divAdd: { title: "قسمة ثم إضافة", from: 0, to: 80, gen(R, h) {
        const A = h.A, k = R.int(2, 9), c = R.int(1, 20), x = k * R.int(2, 15), v = x / k + c;
        return { style: "d", sig: `${k}:${c}:${x}`, body: `عدد عند قسمته على ${A(k)} وإضافة ${A(c)} للناتج ينتج ${A(v)}. فما العدد؟`, ...num(h, R, x, [v * k, (v + c) * k, v - c]),
          steps: [RULE, `${A(v)} − ${A(c)} = ${A(v - c)}.`, `${A(v - c)} × ${A(k)} = ${A(x)}.`], explanation: A(x) };
      } },
      give: { title: "أعطت جزءًا ثم أخذت مبلغًا", from: 80, to: 200, gen(R, h) {
        const A = h.A, [p, q, w] = R.pick([[1, 2, "نصف"], [1, 3, "ثلث"], [1, 4, "ربع"], [2, 3, "ثلثي"]]), x = q * R.int(4, 40), c = R.int(5, 40), v = x - x * p / q + c;
        return { style: `g${p}${q}`, sig: `${p}:${q}:${x}:${c}`, body: `أعطت سلمى ${w} ما لديها لأختها، ثم أخذت من أبيها ${A(c)} ريالًا فأصبح ما لديها ${A(v)} ريالًا. فكم كان معها في البداية؟`,
          ...num(h, R, x, [(v + c) * q / (q - p), v * 2, (v - c) * 2]),
          steps: [RULE, `قبل أن تأخذ من أبيها: ${A(v)} − ${A(c)} = ${A(v - c)}.`, `هذا ${h.frac(h.A(q - p), h.A(q))} ما كان معها ، فالبداية = ${A(v - c)} × ${h.frac(h.A(q), h.A(q - p))} = ${A(x)} ريال.`], explanation: A(x) };
      } },
      multSub: { title: "ضرب ثم طرح", from: 200, to: 290, gen(R, h) {
        const A = h.A, k = R.int(2, 9), c = R.int(1, 20), x = R.int(1, 15), v = k * x - c; if (v <= 0) return null;
        const W = k === 2 ? "ضعف" : k === 5 ? "خمسة أمثال" : k === 7 ? "سبعة أمثال" : `${A(k)} أمثال`;
        return { style: "m", sig: `${k}:${c}:${x}`, body: `${W} عدد مطروحًا منه ${A(c)} يساوي ${A(v)}. فما هو العدد؟`, ...num(h, R, x, [(v - c) / k, v / k | 0, x + 1]),
          steps: [RULE, `${A(v)} + ${A(c)} = ${A(v + c)}.`, `${A(v + c)} ÷ ${A(k)} = ${A(x)}.`], explanation: A(x) };
      } },
      train: { title: "ركاب ينزلون ويصعدون في محطات", from: 290, to: 700, gen(R, h) {
        const A = h.A, st = R.int(2, 3), up = R.int(2, 8), x0 = 2 ** st * R.int(3, 12); let x = x0; const log = [];
        for (let i = 0; i < st; i++) { const half = x / 2; x = half + up; log.push(x); }
        if (!Number.isInteger(x)) return null;
        return { style: "t" + st, sig: `${st}:${up}:${x0}`, body: `مرّ قطار بـ ${A(st)} محطات، في كل محطة نزل نصف عدد الركاب وصعد ${A(up)} ركاب، حتى وصل إلى ما بعد المحطة الأخيرة وكان بالقطار ${A(x)} راكبًا. كم كان عدد الركاب في البداية؟`,
          ...num(h, R, x0, [x * 2, (x - up) * 2, x0 + up]),
          steps: [RULE, `في كل محطة نعكس: نطرح ${A(up)} ثم نضرب في ٢.`, `الأعداد بعد المحطات: ${log.map(A).join(" ← ")}.`, `العدد في البداية = ${A(x0)} راكبًا.`], explanation: A(x0) };
      } },
      chain: { title: "سلسلة عمليات على عدد مجهول", from: 700, to: 950, gen(R, h) {
        const A = h.A, m = R.int(2, 6), a = R.int(1, 15), d = R.int(2, 6), x = R.int(1, 20); const y = m * x + a; if (y % d) return null; const v = y / d;
        return { style: "c", sig: `${m}:${a}:${d}:${x}`, body: `فكّر خالد في عدد، ضربه في ${A(m)} ثم أضاف ${A(a)} ثم قسم الناتج على ${A(d)} فحصل على ${A(v)}. ما العدد الذي فكّر فيه؟`, ...num(h, R, x, [(v * d + a) / m, v * d, (v - a) * d / m]),
          steps: [RULE, `${A(v)} × ${A(d)} = ${A(v * d)}.`, `${A(v * d)} − ${A(a)} = ${A(v * d - a)}.`, `${A(v * d - a)} ÷ ${A(m)} = ${A(x)}.`], explanation: A(x) };
      } },
      daily: { title: "مضاعفة ثم صرف كل يوم", from: 950, to: 1168, gen(R, h) {
        const A = h.A, days = R.int(2, 3), sp = R.int(5, 40), x0 = R.int(sp, 80); let x = x0; const log = [];
        for (let i = 0; i < days; i++) { x = 2 * x - sp; log.push(x); } if (x <= 0 || log.some(z => z <= 0)) return null;
        return { style: "d" + days, sig: `${days}:${sp}:${x0}`, body: `مع أحمد مبلغ، وفي كل يوم يتضاعف ما معه ثم يصرف ${A(sp)} ريالًا. بعد ${A(days)} أيام أصبح معه ${A(x)} ريالًا. فكم كان معه في البداية؟`,
          ...num(h, R, x0, [x / 2 | 0, (x - sp) / 2, x0 + sp]),
          steps: [RULE, `في كل يوم نعكس: نضيف ${A(sp)} ثم نقسم على ٢.`, `من النهاية: ${[...log].reverse().map(A).join(" ← ")} ← ${A(x0)}.`, `المبلغ في البداية = ${A(x0)} ريالًا.`], explanation: A(x0) };
      } }
    }
  };
})();
