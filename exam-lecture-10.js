// المحاضرة 10: الجذور (الجذور المهمة، التبسيط، الجمع والطرح، الجذور مع الكسور)
(() => {
  const SQ = [2, 3, 5, 6, 7, 10, 11];
  const g = (a, b) => b ? g(b, a % b) : a;
  const F = (h, n, d) => d === 1 ? h.A(n) : h.frac(h.d(n), h.d(d));
  window.EXAMS[10] = {
    title: "اختبار محاكي: الجذور وتبسيطها والعمليات عليها", minutes: 25,
    blueprint: [["table", 2], ["simplify", 3], ["addSub", 3], ["sumRoots", 2], ["quot", 2], ["fracSum", 2], ["rootDiv", 2], ["mixSub", 2], ["prodFrac", 2], ["subst", 1], ["sqSum", 1], ["invSum", 2]],
    skills: {
      table: { title: "الجذور المهمة التي يجب حفظها", from: 0, to: 160, gen(R, h) {
        const A = h.A, n = R.int(2, 15), x = n * n;
        return { style: "t", sig: `${n}`, body: `ما قيمة ${h.rad(1, x)} ؟`, ...h.numOptions(R, h.d(n), [h.d(n + 1), h.d(n - 1), h.d(x / 2 | 0)]),
          steps: [`نبحث عن عدد إذا ضُرب في نفسه أعطى ${A(x)}.`, `${A(n)} × ${A(n)} = ${A(x)} ، إذن ${h.rad(1, x)} = ${A(n)}.`, "احفظ مربعات الأعداد من ١ إلى ١٥ فهي تختصر الوقت كثيرًا."], explanation: A(n) };
      } },
      simplify: { title: "تبسيط الجذر", from: 40, to: 300, gen(R, h) {
        const A = h.A, k = R.int(2, 7), m = R.pick(SQ), n = k * k * m;
        return { style: "s", sig: `${n}`, body: `بسّط: ${h.rad(1, n)}`, ...h.strOptions(R, h.rad(k, m), [h.rad(m, k * k), h.rad(k + 1, m), h.rad(k, m + 1), h.rad(2 * k, m)]),
          steps: [`نحلل ${A(n)} إلى حاصل ضرب أكبر مربع كامل في عدد: ${A(n)} = ${A(k * k)} × ${A(m)}.`, `${h.rad(1, n)} = ${h.rad(1, k * k)} × ${h.rad(1, m)} = ${h.rad(k, m)}.`], explanation: h.rad(k, m) };
      } },
      addSub: { title: "جمع الجذور وطرحها", from: 280, to: 480, gen(R, h) {
        const A = h.A, m = R.pick([2, 3, 5]), a = R.int(1, 6), k1 = R.int(2, 4), k2 = R.int(1, 4), b = R.int(1, 3), sign = R.next() < .5 ? 1 : -1;
        const n1 = k1 * k1 * m, r = a * 1 + sign * b * k1 + k2; if (r <= 0) return null;
        const body = `ما قيمة ${h.rad(a, m)} ${sign > 0 ? "+" : "−"} ${h.rad(b, n1)} + ${h.rad(k2, m)} ؟`;
        return { style: sign > 0 ? "p" : "m", sig: `${a}:${b}:${n1}:${k2}:${sign}`, body,
          ...h.strOptions(R, h.radS(r, m), [h.radS(a + sign * b + k2 > 0 ? a + sign * b + k2 : r + 2, m === 2 ? 3 : 2), h.radS(r + 1, m), h.rad(1, a * a * m + n1), A(r)]),
          steps: [`نبسط الجذر غير المتشابه: ${h.rad(1, n1)} = ${h.rad(k1, m)} ، فيصبح ${h.rad(b, n1)} = ${h.rad(b * k1, m)}.`, "الجذور المتشابهة (نفس ما تحت الجذر) نجمع أو نطرح معاملاتها فقط.", `(${A(a)} ${sign > 0 ? "+" : "−"} ${A(b * k1)} + ${A(k2)}) ${h.rad(1, m)} = ${h.radS(r, m)}.`], explanation: h.radS(r, m) };
      } },
      sumRoots: { title: "ناتج جمع جذرين بعد التبسيط", from: 480, to: 600, gen(R, h) {
        const A = h.A, m = R.pick([2, 3, 5, 6]), a = R.int(2, 5), b = R.int(1, 4); if (a === b) return null;
        const x = a * a * m, y = b * b * m, minus = R.next() < .3, r = minus ? Math.abs(a - b) : a + b;
        return { style: minus ? "m" : "p", sig: `${x}:${y}:${minus}`, body: `أوجد ناتج ${h.rad(1, x)} ${minus ? "−" : "+"} ${h.rad(1, y)}`,
          ...h.strOptions(R, h.radS(r, m), [h.radS(1, minus ? Math.abs(x - y) : x + y), h.radS(r + 1, m), h.radS(r, m + 1), A(r)]),
          steps: [`${h.rad(1, x)} = ${h.rad(1, a * a)} × ${h.rad(1, m)} = ${h.rad(a, m)} ، و ${h.rad(1, y)} = ${h.radS(b, m)}.`, `${h.rad(a, m)} ${minus ? "−" : "+"} ${h.radS(b, m)} = ${h.radS(r, m)}.`, `تنبيه: ${h.rad(1, x)} ${minus ? "−" : "+"} ${h.rad(1, y)} لا يساوي ${h.rad(1, minus ? Math.abs(x - y) : x + y)}.`], explanation: h.radS(r, m) };
      } },
      quot: { title: "قسمة الجذور", from: 600, to: 760, gen(R, h) {
        const A = h.A, m = R.pick([2, 3, 5]), a = R.int(3, 6), b = R.int(1, a - 1), x = a * a * m, y = b * b * m, r = a - b;
        return { style: "q", sig: `${x}:${y}`, body: `أوجد قيمة (${h.rad(1, x)} − ${h.rad(1, y)}) ÷ ${h.rad(1, m)}`,
          ...h.strOptions(R, A(r), [A(a + b), h.radS(r, m), A(r * m), A(a)]),
          steps: [`نبسط البسط: ${h.rad(1, x)} = ${h.rad(a, m)} و ${h.rad(1, y)} = ${h.radS(b, m)}.`, `${h.rad(a, m)} − ${h.radS(b, m)} = ${h.radS(r, m)}.`, `${h.radS(r, m)} ÷ ${h.rad(1, m)} = ${A(r)}.`], explanation: A(r) };
      } },
      fracSum: { title: "جذر مجموع كسرين لهما المقام نفسه", from: 760, to: 840, gen(R, h) {
        const A = h.A, d = R.pick([2, 3, 5]), sq = R.int(1, 3), tot = sq * sq * d * d, a = R.int(1, tot - 1), b = tot - a; if (a % d === 0 || b % d === 0) return null;
        const inner = tot / d, ans = h.radS(sq, d);
        return { style: "f", sig: `${a}:${b}:${d}`, body: `ما قيمة ${h.rad(1, `${h.frac(h.d(a), h.d(d))} + ${h.frac(h.d(b), h.d(d))}`)} ؟`,
          ...h.strOptions(R, ans, [h.radS(1, d), h.radS(2 * sq, d), A(sq * d), h.radS(sq, d + 1)]),
          steps: [`المقامان متساويان فنجمع البسطين: ${A(a)} + ${A(b)} = ${A(tot)}.`, `ما تحت الجذر = ${A(tot)} ÷ ${A(d)} = ${A(inner)}.`, `${h.rad(1, inner)} = ${ans}.`], explanation: ans };
      } },
      rootDiv: { title: "قسمة جذر على مجموع جذرين", from: 840, to: 920, gen(R, h) {
        const A = h.A, m = R.pick([2, 3, 5]), k = R.pick([4, 9, 16, 36, 64]), n = k * m, q = Math.sqrt(k) / 2; if (!Number.isInteger(q * 2)) return null;
        const ans = Number.isInteger(q) ? A(q) : h.frac(h.d(Math.sqrt(k)), h.d(2));
        return { style: "d", sig: `${n}:${m}`, body: `ما قيمة ${h.rad(1, n)} ÷ (${h.rad(1, m)} + ${h.rad(1, m)}) ؟`,
          ...h.strOptions(R, ans, [A(Math.sqrt(k)), A(k), A(k / 2 | 0 || k + 1), A(Math.sqrt(k) * 2)]),
          steps: [`المقام: ${h.rad(1, m)} + ${h.rad(1, m)} = ${h.rad(2, m)}.`, `البسط: ${h.rad(1, n)} = ${h.rad(1, k)} × ${h.rad(1, m)} = ${h.rad(Math.sqrt(k), m)}.`, `${h.rad(Math.sqrt(k), m)} ÷ ${h.rad(2, m)} = ${A(Math.sqrt(k))} ÷ ٢ = ${ans}.`], explanation: ans };
      } },
      mixSub: { title: "جذر عدد صحيح مطروحًا منه كسر", from: 920, to: 1080, gen(R, h) {
        const A = h.A, T = R.pick([[5, 3, 4], [10, 6, 8], [13, 5, 12], [5, 4, 3], [13, 12, 5], [10, 8, 6], [17, 8, 15], [17, 15, 8], [25, 7, 24], [25, 24, 7]]), [c, a, b] = T;
        // √(w − a²/c²) حيث w عدد صحيح = (a²+b²)/c²... نستخدم: √(1 − a²/c²) = b/c ، أو √(k − ...)
        const w = R.pick([1, 4]), A2 = w === 4 ? (2 * a) : a, C2 = c, B2 = w === 4 ? 2 * b : b;
        const ans = h.frac(h.d(B2 / g(B2, C2)), h.d(C2 / g(B2, C2)));
        return { style: "x" + w, sig: `${w}:${a}:${c}`, body: `ما قيمة ${h.rad(1, `${A(w)} − ${h.frac(h.d(A2 * A2), h.d(C2 * C2))}`)} ؟`,
          ...h.strOptions(R, ans, [h.frac(h.d(C2), h.d(B2)), h.frac(h.d(A2), h.d(C2)), h.frac(h.d(B2 + 1), h.d(C2)), h.frac(h.d(B2), h.d(C2 + 1))]),
          steps: [`نوحّد المقامات: ${A(w)} = ${h.frac(h.d(w * C2 * C2), h.d(C2 * C2))}.`, `${h.frac(h.d(w * C2 * C2), h.d(C2 * C2))} − ${h.frac(h.d(A2 * A2), h.d(C2 * C2))} = ${h.frac(h.d(B2 * B2), h.d(C2 * C2))}.`, `نأخذ جذر البسط وجذر المقام: ${h.frac(h.d(B2), h.d(C2))}${g(B2, C2) > 1 ? ` = ${ans}` : ""}.`], explanation: ans };
      } },
      prodFrac: { title: "جذر حاصل ضرب كسرين", from: 1080, to: 1240, gen(R, h) {
        const A = h.A, style = R.pick(["ff", "dec"]);
        if (style === "dec") { const p = R.int(1, 9), q = R.int(2, 9); if (g(p, q) > 1 || p === q) return null; const dec = R.pick([["٠,٢٥", 1, 2], ["٠,٠٤", 1, 5], ["٠,٠١", 1, 10]]);
          const num = p * dec[1], den = q * dec[2], gg = g(num, den), ans = h.frac(h.d(num / gg), h.d(den / gg));
          return { style, sig: `d:${p}:${q}:${dec[0]}`, body: `ما قيمة ${h.rad(1, `${h.frac(h.d(p * p), h.d(q * q))} × ${dec[0]}`)} ؟`,
            ...h.strOptions(R, ans, [h.frac(h.d(p), h.d(q)), h.frac(h.d(num / gg), h.d(den / gg + 1)), F(h, den / gg, num / gg), h.frac(h.d(p * p), h.d(q * q * dec[2]))]),
            steps: [`نحوّل العدد العشري إلى كسر: ${dec[0]} = ${h.frac(h.d(1), h.d(dec[2] * dec[2]))}.`, `جذر الأول = ${h.frac(h.d(p), h.d(q))} ، وجذر الثاني = ${h.frac(h.d(1), h.d(dec[2]))}.`, `الناتج = ${h.frac(h.d(p), h.d(q))} × ${h.frac(h.d(1), h.d(dec[2]))} = ${ans}.`], explanation: ans }; }
        const a = R.int(1, 5), b = R.int(2, 6), c = R.int(1, 6), d = R.int(2, 9); if (a >= b || g(a, b) > 1) return null;
        // √(a/b × (b·c²)/(a·d²)) = c/d
        const n2 = b * c * c, d2 = a * d * d, gg = g(c, d), ans = h.frac(h.d(c / gg), h.d(d / gg)); if (n2 > 200 || d2 > 300 || c === d) return null;
        return { style, sig: `f:${a}:${b}:${c}:${d}`, body: `ما قيمة ${h.rad(1, `${h.frac(h.d(a), h.d(b))} × ${h.frac(h.d(n2), h.d(d2))}`)} ؟`,
          ...h.strOptions(R, ans, [F(h, d / gg, c / gg), h.frac(h.d(c * c), h.d(d * d)), h.frac(h.d(c), h.d(d + 1)), h.frac(h.d(c + 1), h.d(d))]),
          steps: ["نضرب الكسرين أولًا ونختصر قبل أخذ الجذر.", `${h.frac(h.d(a), h.d(b))} × ${h.frac(h.d(n2), h.d(d2))} = ${h.frac(h.d(c * c), h.d(d * d))}.`, `${h.rad(1, h.frac(h.d(c * c), h.d(d * d)))} = ${ans}.`], explanation: ans };
      } },
      subst: { title: "التعويض بجذر", from: 1240, to: 1320, gen(R, h) {
        const A = h.A, m = R.pick([2, 3, 5]), k = R.int(1, 5), neg = R.next() < .6, v = (neg ? -1 : 1) * k * m * m;
        const S = x => x < 0 ? `−${A(-x)}` : A(x);
        return { style: neg ? "n" : "p", sig: `${m}:${k}:${neg}`, body: `إذا كانت ب = ق = ${h.rad(1, m)} ، فأوجد قيمة ${neg ? "−" : ""}${k === 1 ? "" : A(k)}ب² ق²`,
          ...h.numOptions(R, h.d(v), [h.d(-v), h.d((neg ? -1 : 1) * k * m), h.d((neg ? -1 : 1) * k * m * m * m)]),
          steps: [`ب² = (${h.rad(1, m)})² = ${A(m)} ، و ق² = ${A(m)}.`, `ب² ق² = ${A(m)} × ${A(m)} = ${A(m * m)}.`, `${neg ? "−" : ""}${A(k)} × ${A(m * m)} = ${S(v)}.`], explanation: S(v) };
      } },
      sqSum: { title: "مربع مجموع جذور متشابهة", from: 1320, to: 1520, gen(R, h) {
        const A = h.A, m = R.pick([2, 3, 5, 6, 7]), n = R.int(2, 4), v = n * n * m;
        const body = `ما قيمة (${Array(n).fill(h.rad(1, m)).join(" + ")})² ؟`;
        return { style: "s", sig: `${m}:${n}`, body, ...h.numOptions(R, h.d(v), [h.d(n * m), h.d(n * m * m), h.d(n * n * m * m)]),
          steps: [`المجموع داخل القوس = ${h.rad(n, m)}.`, `(${h.rad(n, m)})² = ${A(n * n)} × ${A(m)} = ${A(v)}.`], explanation: A(v) };
      } },
      invSum: { title: "جذر مجموع مقلوبي مربعين", from: 1520, to: 1733, gen(R, h) {
        const A = h.A, [a, b, c] = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]), gg = g(c, a * b), ans = h.frac(h.d(c / gg), h.d(a * b / gg));
        return { style: "i", sig: `${a}:${b}`, body: `أوجد قيمة ${h.rad(1, `${h.frac(h.d(1), h.d(a * a))} + ${h.frac(h.d(1), h.d(b * b))}`)}`,
          ...h.strOptions(R, ans, [h.frac(h.d(1), h.d(a + b)), h.frac(h.d(a + b), h.d(a * b)), h.frac(h.d(1), h.d(c)), h.frac(h.d(c), h.d(a * b + 1))]),
          steps: [`نوحد المقامات: ${h.frac(h.d(1), h.d(a * a))} + ${h.frac(h.d(1), h.d(b * b))} = ${h.frac(h.d(a * a + b * b), h.d(a * a * b * b))}.`, `${A(a * a + b * b)} مربع كامل = ${A(c)}² ، والمقام = (${A(a)} × ${A(b)})².`, `الجذر = ${h.frac(h.d(c), h.d(a * b))}${gg > 1 ? ` = ${ans}` : ""}.`], explanation: ans };
      } }
    }
  };
})();
