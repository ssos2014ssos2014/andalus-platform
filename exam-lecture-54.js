// المحاضرة 54: مسائل الأعمار (الحل بالتجربة وبالمعادلات)
(() => {
  const TIP = "خطوات الحل: ترجم المسألة بدقة، ثم جرّب الخيارات على المطلوب حتى يتحقق كل ما في السؤال.";
  const W = (h, k) => k === 2 ? "ضعف" : k === 3 ? "ثلاثة أمثال" : k === 4 ? "أربعة أمثال" : `${h.A(k)} أمثال`;
  const F = (k) => k === 2 ? "نصف" : k === 3 ? "ثلث" : k === 4 ? "ربع" : "خمس";
  const num = (h, R, v, w) => h.numOptions(R, h.d(v), [...new Set(w.filter(x => x > 0 && x !== v))].slice(0, 3).map(x => h.d(x)).concat([h.d(v + 2), h.d(v + 4), h.d(v + 6)]).slice(0, 3));
  window.EXAMS[54] = {
    title: "اختبار محاكي: مسائل الأعمار", minutes: 25,
    blueprint: [["fracThen", 4], ["multBefore", 4], ["diffAfter", 4], ["sum", 3], ["ratio", 3], ["father", 3], ["past", 3]],
    skills: {
      fracThen: { title: "جزء من عمر الآن ونسبة أخرى بعد سنوات", from: 0, to: 120, gen(R, h) {
        const A = h.A, k = R.pick([3, 4]), m = R.pick([2, 3]), t = R.int(2, 10); if (m >= k) return null;
        // a = b/k ، a + t = (b + t)/m  → b(m − k)/k... حل: m(b/k + t) = b + t → b(m/k − 1) = t − m t → b = t(m − 1)/(1 − m/k)
        const b = t * (m - 1) / (1 - m / k), a = b / k; if (!Number.isInteger(b) || !Number.isInteger(a) || a <= 0) return null; const ask = R.pick(["a", "b"]), v = ask === "a" ? a : b;
        return { style: `f${k}${m}`, sig: `${k}:${m}:${t}:${ask}`, body: `إذا كان عمر أمل ${F(k)} عمر أختها، وبعد ${A(t)} سنوات يصبح عمر أمل ${F(m)} عمر أختها، فكم عمر ${ask === "a" ? "أمل" : "أختها"} الآن؟`,
          ...num(h, R, v, [ask === "a" ? b : a, v + t, v * 2]), steps: [TIP, `جرّب: أمل ${A(a)} والأخت ${A(b)} (${A(a)} = ${F(k)} ${A(b)}).`, `بعد ${A(t)} سنوات: ${A(a + t)} و ${A(b + t)} ، و ${A(a + t)} = ${F(m)} ${A(b + t)} ✓.`], explanation: A(v) };
      } },
      multBefore: { title: "مضاعف العمر الآن وقبل سنوات", from: 120, to: 300, gen(R, h) {
        const A = h.A, k = R.pick([2, 3]), m = R.pick([4, 5, 3]), t = R.int(2, 10); if (m <= k) return null;
        // K = kS ، K − t = m(S − t) → kS − t = mS − mt → S = t(m − 1)/(m − k)
        const S = t * (m - 1) / (m - k), K = k * S; if (!Number.isInteger(S)) return null;
        return { style: `m${k}${m}`, sig: `${k}:${m}:${t}`, body: `عمر خالد الآن ${W(h, k)} عمر سالم، ولكن قبل ${A(t)} سنوات كان عمر خالد ${W(h, m)} عمر سالم. فكم عمر خالد الآن؟`, ...num(h, R, K, [S, K + t, K - t]),
          steps: [TIP, `جرّب: خالد ${A(K)} وسالم ${A(S)}.`, `قبل ${A(t)} سنوات: ${A(K - t)} و ${A(S - t)} ، و ${A(K - t)} = ${A(m)} × ${A(S - t)} ✓.`], explanation: A(K) };
      } },
      diffAfter: { title: "فرق ثابت بين عمرين", from: 300, to: 500, gen(R, h) {
        const A = h.A, d = R.int(10, 30), m = R.pick([2, 3, 4]), t = R.int(2, 10);
        // K = Z + d ، K + t = m(Z + t) → Z + d + t = mZ + mt → Z = (d + t − mt)/(m − 1)
        const Z = (d + t - m * t) / (m - 1), K = Z + d; if (!Number.isInteger(Z) || Z <= 0) return null;
        return { style: `d${m}`, sig: `${d}:${m}:${t}`, body: `يزيد عمر خالد عن عمر زياد بـ ${A(d)} سنة، وبعد ${A(t)} سنوات يصبح عمر خالد ${W(h, m)} عمر زياد. فما عمر خالد الآن؟`, ...num(h, R, K, [Z, K + t, d]),
          steps: [TIP, `الفرق بين العمرين ثابت دائمًا = ${A(d)}.`, `جرّب: خالد ${A(K)} وزياد ${A(Z)} ، وبعد ${A(t)} سنوات: ${A(K + t)} = ${A(m)} × ${A(Z + t)} ✓.`], explanation: A(K) };
      } },
      sum: { title: "مجموع الأعمار بعد سنوات أو قبلها", from: 500, to: 800, gen(R, h) {
        const A = h.A, n = R.int(2, 5), S = R.int(20, 120), t = R.int(2, 10), after = R.next() < .6, v = after ? S + n * t : S - n * t; if (v <= 0) return null;
        return { style: "s" + after, sig: `${n}:${S}:${t}:${after}`, body: `مجموع أعمار ${A(n)} إخوة الآن ${A(S)} سنة. فكم كان مجموع أعمارهم ${after ? "بعد" : "قبل"} ${A(t)} سنوات؟`.replace("كان مجموع أعمارهم بعد", "سيكون مجموع أعمارهم بعد"),
          ...num(h, R, v, [after ? S + t : S - t, S, after ? S + 2 * t : S - 2 * t]), steps: [`كل أخ ${after ? "يزيد" : "ينقص"} عمره ${A(t)} سنوات، وعددهم ${A(n)}.`, `${after ? "الزيادة" : "النقص"} = ${A(n)} × ${A(t)} = ${A(n * t)}.`, `المجموع = ${A(S)} ${after ? "+" : "−"} ${A(n * t)} = ${A(v)}.`], explanation: A(v) };
      } },
      ratio: { title: "نسبة بين عمرين الآن وبعد سنوات", from: 800, to: 1100, gen(R, h) {
        const A = h.A, [a, b] = R.pick([[1, 2], [2, 3], [3, 5], [1, 3], [3, 4]]), u = R.int(2, 8), t = R.int(2, 10), x = a * u + t, y = b * u + t, gg = ((p, q) => { while (q) [p, q] = [q, p % q]; return p; })(x, y);
        if (gg === 1 && (x > 40 || y > 40)) return null; const c = x / gg, d = y / gg, ask = R.pick(["s", "b"]), v = ask === "s" ? a * u : b * u;
        return { style: "r", sig: `${a}:${b}:${u}:${t}:${ask}`, body: `النسبة بين عمري أحمد ومحمد الآن ${A(a)} : ${A(b)} ، وبعد ${A(t)} سنوات تصبح ${A(c)} : ${A(d)}. فكم عمر ${ask === "s" ? "أحمد" : "محمد"} الآن؟`,
          ...num(h, R, v, [ask === "s" ? b * u : a * u, v + t, v + u]), steps: [TIP, `نفرض العمرين ${A(a)}ك و ${A(b)}ك ، فبعد ${A(t)} سنوات: (${A(a)}ك + ${A(t)}) : (${A(b)}ك + ${A(t)}) = ${A(c)} : ${A(d)}.`, `ك = ${A(u)} ، فأحمد ${A(a * u)} ومحمد ${A(b * u)}.`], explanation: A(v) };
      } },
      father: { title: "عمر الأب مضاعف لعمر الابن", from: 1100, to: 1400, gen(R, h) {
        const A = h.A, k = R.pick([3, 4, 5, 6]), m = R.pick([2, 3]), t = R.int(2, 20); if (m >= k) return null;
        // F = kS ، F + t = m(S + t) → S = t(m − 1)/(k − m)
        const S = t * (m - 1) / (k - m), Fa = k * S; if (!Number.isInteger(S) || Fa > 90) return null; const ask = R.pick(["f", "s"]), v = ask === "f" ? Fa : S;
        return { style: `f${k}${m}`, sig: `${k}:${m}:${t}:${ask}`, body: `عمر أب الآن ${W(h, k)} عمر ابنه، وبعد ${A(t)} ${t <= 10 ? "سنوات" : "سنة"} يصبح عمر الأب ${W(h, m)} عمر ابنه. فكم عمر ${ask === "f" ? "الأب" : "الابن"} الآن؟`,
          ...num(h, R, v, [ask === "f" ? S : Fa, v + t, ask === "f" ? Fa - S : S + k]), steps: [TIP, `جرّب: الابن ${A(S)} والأب ${A(Fa)}.`, `بعد ${A(t)}: ${A(Fa + t)} = ${A(m)} × ${A(S + t)} ✓.`], explanation: A(v) };
      } },
      past: { title: "عمر مضى وعمر سيأتي", from: 1400, to: 1705, gen(R, h) {
        const A = h.A, x = R.int(8, 40), a = R.int(2, 7), b = R.int(2, 7), mode = R.pick(["sum", "diff"]);
        if (mode === "sum") { const S = (x - a) + (x + b);
          return { style: "s", sig: `s${x}:${a}:${b}`, body: `إذا كان مجموع عمر سعد قبل ${A(a)} سنوات وعمره بعد ${A(b)} سنوات هو ${A(S)} سنة، فكم عمره الآن؟`, ...num(h, R, x, [S / 2 | 0, x + a, x - b]),
            steps: [`(س − ${A(a)}) + (س + ${A(b)}) = ${A(S)}.`, `٢س = ${A(S + a - b)} ، س = ${A(x)}.`], explanation: A(x) }; }
        const k = R.pick([2, 3]); const y = (k * (x - a) - (x + b)); if (y === 0) return null;
        const xx = (k * a + b) / (k - 1); if (!Number.isInteger(xx)) return null;
        return { style: "d", sig: `d${a}:${b}:${k}`, body: `عمر سعد بعد ${A(b)} سنوات سيكون ${W(h, k)} عمره قبل ${A(a)} سنوات. فكم عمره الآن؟`, ...num(h, R, xx, [xx + a, xx - b, k * a + b]),
          steps: [`س + ${A(b)} = ${A(k)}(س − ${A(a)}).`, `س + ${A(b)} = ${A(k)}س − ${A(k * a)} ، أي ${A(k - 1)}س = ${A(k * a + b)}.`, `س = ${A(xx)}.`], explanation: A(xx) };
      } }
    }
  };
})();
