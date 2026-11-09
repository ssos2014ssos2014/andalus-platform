// المحاضرة 15: قوانين الأسس (قوة القوة، ضرب وقسمة الأساسات المتشابهة، الأضعاف، الإشارة السالبة)
(() => {
  const SUP = n => String(n).split("").map(x => "⁰¹²³⁴⁵⁶⁷⁸⁹"[x]).join("");
  const P = (h, b, e) => e === 1 ? (typeof b === "number" ? h.A(b) : b) : `${typeof b === "number" ? h.A(b) : b}${SUP(e)}`;
  const MUL = { 2: "ضعف", 3: "ثلاثة أضعاف", 4: "أربعة أضعاف", 8: "ثمانية أضعاف", 9: "تسعة أضعاف", 5: "خمسة أضعاف" };
  window.EXAMS[15] = {
    title: "اختبار محاكي: قوانين الأسس", minutes: 25,
    blueprint: [["powPow", 2], ["eqPow", 2], ["conv", 2], ["mono", 2], ["after", 1], ["mulDiv", 3], ["mult", 3], ["big", 1], ["neg", 2], ["numFrac", 1], ["simp", 2], ["mixed", 1], ["negCmp", 2]],
    skills: {
      powPow: { title: "العدد المرفوع لأكثر من أس (نضرب الأسس)", from: 0, to: 80, gen(R, h) {
        const b = R.int(2, 9), m = R.int(2, 6), n = R.int(2, 6), z = R.next() < .15;
        if (z) return { style: "z", sig: `z${b}:${m}`, body: `ما قيمة ((${P(h, b, m)})${SUP(n)}) أس صفر ؟`, ...h.strOptions(R, "١", ["صفر", P(h, b, m * n), h.A(b)]),
          steps: ["أي عدد (غير الصفر) أسه صفر يساوي ١ مهما كان داخل القوس."], explanation: "١" };
        return { style: "p", sig: `${b}:${m}:${n}`, body: `(${P(h, b, m)})${SUP(n)} = ؟`, ...h.strOptions(R, P(h, b, m * n), [P(h, b, m + n), P(h, b * n, m), P(h, b, m * n + 1)]),
          steps: ["العدد المرفوع لأكثر من أس نضرب الأسس في بعضها.", `${h.A(m)} × ${h.A(n)} = ${h.A(m * n)} ، إذن الناتج ${P(h, b, m * n)}.`], explanation: P(h, b, m * n) };
      } },
      eqPow: { title: "إيجاد الأس بتوحيد الأساسات", from: 80, to: 190, gen(R, h) {
        const A = h.A, b = R.pick([2, 3, 5]), k = R.int(2, 4), m = R.int(2, 6), B = b ** k; if (B > 125) return null; const n = k * m;
        return { style: "k" + k, sig: `${b}:${k}:${m}`, body: `إذا كان ${A(b)} أس ن = ${P(h, B, m)} ، فما قيمة ن؟`, ...h.numOptions(R, h.d(n), [h.d(m), h.d(k + m), h.d(B)]),
          steps: [`${A(B)} = ${P(h, b, k)} ، فإن ${P(h, B, m)} = (${P(h, b, k)})${SUP(m)} = ${P(h, b, n)}.`, `الأساسات متساوية فالأسس متساوية: ن = ${A(n)}.`], explanation: A(n) };
      } },
      conv: { title: "معادلة أسية بأساسين أحدهما قوة للآخر", from: 150, to: 350, gen(R, h) {
        const A = h.A, [B, b, k] = R.pick([[4, 2, 2], [9, 3, 2], [8, 2, 3], [25, 5, 2], [27, 3, 3]]), x = R.int(1, 5), p = R.int(0, 3), q = R.int(1, 6);
        // B^(س + p) = b^(q س)  ⇔ k(س+p) = q س ⇔ س = k p / (q − k)
        if (q === k) return null; const num = k * p, den = q - k; if (num % den || num / den !== x) return null;
        return { style: "p" + p, sig: `${B}:${p}:${q}`, body: `إذا كان ${A(B)} أس (س${p ? " + " + A(p) : ""}) = ${A(b)} أس (${q === 1 ? "" : A(q)}س) ، فما قيمة س؟`,
          ...h.numOptions(R, h.d(x), [h.d(x + 1), h.d(p || x + 2), h.d(x * 2)]),
          steps: [`${A(B)} = ${P(h, b, k)} ، فالطرف الأيمن يصبح ${A(b)} أس (${A(k)}(س${p ? " + " + A(p) : ""})).`, `نساوي الأسس: ${A(k)}س${p ? " + " + A(k * p) : ""} = ${q === 1 ? "" : A(q)}س.`, den === 1 ? `س = ${A(num)}.` : `${A(den)}س = ${A(num)} ، إذن س = ${A(x)}.`], explanation: A(x) };
      } },
      mono: { title: "رفع حاصل ضرب متغيرات لأس", from: 350, to: 470, gen(R, h) {
        const a = R.int(1, 5), b = R.int(1, 5), c = R.int(1, 6), n = R.int(2, 4), V = ["س", "ص", "ع"], f = (x, y, z) => `${P(h, "س", x)} ${P(h, "ص", y)} ${P(h, "ع", z)}`;
        const ans = f(a * n, b * n, c * n);
        return { style: "n" + n, sig: `${a}:${b}:${c}:${n}`, body: `العبارة (${f(a, b, c)})${SUP(n)} تكافئ:`, ...h.strOptions(R, ans, [f(a + n, b + n, c + n), f(a * n, b * n, c), f(a * n, b + n, c * n), f(a, b, c * n)]),
          steps: ["نضرب أس كل متغير داخل القوس في الأس الخارجي.", `${V.map((v, i) => `${v}: ${h.A([a, b, c][i])} × ${h.A(n)} = ${h.A([a, b, c][i] * n)}`).join(" ، ")}.`, `الناتج ${ans}.`], explanation: ans };
      } },
      after: { title: "إيجاد المتغير من قوته ثم التعويض", from: 470, to: 510, gen(R, h) {
        const A = h.A, r = R.int(2, 6), n = R.pick([2, 3, 4]), N = r ** n, k = R.int(2, 6); if (N > 1300) return null;
        return { style: "n" + n, sig: `${r}:${n}:${k}`, body: `إذا كانت ${P(h, "ص", n)} = ${A(N)} ، حيث ص موجب، فإن ${A(k)}ص = ....`, ...h.numOptions(R, h.d(k * r), [h.d(k * r + k), h.d(N), h.d(k + r)]),
          steps: [`${A(N)} = ${P(h, r, n)} ، إذن ص = ${A(r)}.`, `${A(k)}ص = ${A(k)} × ${A(r)} = ${A(k * r)}.`], explanation: A(k * r) };
      } },
      mulDiv: { title: "ضرب وقسمة الأساسات المتشابهة", from: 510, to: 790, gen(R, h) {
        const b = R.int(2, 9), m = R.int(2, 12), n = R.int(2, 9), op = R.pick(["×", "÷", "same"]);
        if (op === "same") { const c = R.int(2, 9), e = R.int(2, 7); if (b === c || b * c > 99) return null;
          return { style: "s", sig: `s${b}:${c}:${e}`, body: `${P(h, b, e)} × ${P(h, c, e)} = ؟`, ...h.strOptions(R, P(h, b * c, e), [P(h, b * c, 2 * e), P(h, b + c, e), P(h, b * c, e * e)]),
            steps: ["الأساسات مختلفة والأسس متساوية، فنضرب الأساسات ونُبقي الأس.", `${h.A(b)} × ${h.A(c)} = ${h.A(b * c)} ، الناتج ${P(h, b * c, e)}.`], explanation: P(h, b * c, e) }; }
        if (op === "÷" && m <= n) return null; const e = op === "×" ? m + n : m - n;
        return { style: op, sig: `${op}${b}:${m}:${n}`, body: op === "×" ? `${P(h, b, m)} × ${P(h, b, n)} = ؟` : `${h.frac(P(h, b, m), P(h, b, n))} = ؟`,
          ...h.strOptions(R, P(h, b, e), [P(h, b, op === "×" ? m * n : m + n), P(h, op === "×" ? b * b : b, e), P(h, b, op === "×" ? Math.abs(m - n) || e + 1 : e + 1)]),
          steps: [op === "×" ? "عند ضرب الأساسات المتشابهة نجمع الأسس." : "عند قسمة الأساسات المتشابهة نطرح الأسس.", `${h.A(m)} ${op === "×" ? "+" : "−"} ${h.A(n)} = ${h.A(e)} ، الناتج ${P(h, b, e)}.`], explanation: P(h, b, e) };
      } },
      mult: { title: "أضعاف العدد الأسي ونصفه", from: 790, to: 1030, gen(R, h) {
        const mode = R.pick(["up", "up", "half"]);
        if (mode === "half") { const [b, w, k] = R.pick([[2, "نصف", 1], [2, "ربع", 2], [2, "ثُمن", 3], [3, "ثُلث", 1], [3, "تُسع", 2]]), n = R.int(k + 2, 120);
          return { style: "h" + w, sig: `h${b}:${k}:${n}`, body: `ما هو ${w} العدد ${P(h, b, n)} ؟`, ...h.strOptions(R, P(h, b, n - k), [P(h, b, Math.ceil(n / (b ** k))), P(h, b, n + k), P(h, b === 2 ? 1 : 2, n) === P(h, b, n - k) ? P(h, b, n - k - 1) : P(h, b, n - 2 * k)]),
            steps: [`${w} العدد = العدد ÷ ${h.A(b ** k)} = ${h.frac(P(h, b, n), P(h, b, k))}.`, `نطرح الأسس: ${h.A(n)} − ${h.A(k)} = ${h.A(n - k)} ، الناتج ${P(h, b, n - k)}.`], explanation: P(h, b, n - k) }; }
        const [b, f, k] = R.pick([[3, 3, 1], [2, 2, 1], [2, 4, 2], [2, 8, 3], [3, 9, 2], [5, 5, 1]]), n = R.int(2, 40);
        return { style: "u" + f, sig: `u${b}:${f}:${n}`, body: `${MUL[f]} العدد ${P(h, b, n)} هو ....`, ...h.strOptions(R, P(h, b, n + k), [P(h, b, n * f), P(h, b * f, n), P(h, b, n + f + (f === k ? 1 : 0))]),
          steps: [`${MUL[f]} العدد = ${h.A(f)} × ${P(h, b, n)}${k > 1 ? ` ، و ${h.A(f)} = ${P(h, b, k)}` : ""}.`, `${P(h, b, k)} × ${P(h, b, n)} = ${P(h, b, n + k)} (نجمع الأسس).`], explanation: P(h, b, n + k) };
      } },
      big: { title: "قوة حاصل ضرب أساسات متشابهة", from: 1030, to: 1110, gen(R, h) {
        const b = R.int(2, 9), m = R.int(2, 6), n = R.int(2, 6), k = R.pick([2, 3, 5, 10]), e = (m + n) * k;
        return { style: "k" + k, sig: `${b}:${m}:${n}:${k}`, body: `ما قيمة (${P(h, b, m)} × ${P(h, b, n)})${SUP(k)} ؟`, ...h.strOptions(R, P(h, b, e), [P(h, b, m * n * k), P(h, b, m + n + k), P(h, b * k, m + n)]),
          steps: [`داخل القوس: ${P(h, b, m)} × ${P(h, b, n)} = ${P(h, b, m + n)}.`, `(${P(h, b, m + n)})${SUP(k)} = ${P(h, b, e)}.`], explanation: P(h, b, e) };
      } },
      neg: { title: "الإشارة السالبة مع الأسس", from: 1110, to: 1380, gen(R, h) {
        const n = R.int(2, 12), inside = R.next() < .5, ev = n % 2 === 0;
        // inside: −س (−س)ⁿ ؛ else: −س (−سⁿ)
        const sign = inside ? (ev ? -1 : 1) : 1, ans = `${sign < 0 ? "−" : ""}${P(h, "س", n + 1)}`, opp = `${sign < 0 ? "" : "−"}${P(h, "س", n + 1)}`;
        return { style: (inside ? "i" : "o") + ev, sig: `${n}:${inside}`, body: inside ? `تبسيط المقدار −س (−س)${SUP(n)}` : `تبسيط المقدار −س (−${P(h, "س", n)})`,
          ...h.strOptions(R, ans, [opp, P(h, "س", n), `−${P(h, "س", n)}`]),
          steps: inside ? [`الأس ${h.A(n)} ${ev ? "زوجي فيلغي الإشارة السالبة داخل القوس: (−س)" + SUP(n) + " = " + P(h, "س", n) : "فردي فتبقى الإشارة: (−س)" + SUP(n) + " = −" + P(h, "س", n)}.`, `${ev ? "−س × " + P(h, "س", n) : "−س × −" + P(h, "س", n)} = ${ans}.`] : ["سالب × سالب = موجب.", `−س × (−${P(h, "س", n)}) = ${ans}.`], explanation: ans };
      } },
      numFrac: { title: "قيمة كسر أسي عددي بالتحليل", from: 1380, to: 1460, gen(R, h) {
        const A = h.A, p = R.pick([2, 3, 5]), t = R.int(1, 4), N = p * p * t, v = p * t * t; if (N > 60) return null;
        return { style: "p" + p, sig: `${p}:${t}`, body: `ما قيمة ${h.frac(P(h, N, 2), P(h, p, 3))} ؟`, ...h.numOptions(R, h.d(v), [h.d(v + p), h.d(N), h.d(t * t)]),
          steps: [`نحلل: ${A(N)} = ${A(p)} × ${A(p)} × ${A(t)} ، إذن ${P(h, N, 2)} = ${P(h, p, 4)} × ${P(h, t, 2)}.`, `${h.frac(`${P(h, p, 4)} × ${P(h, t, 2)}`, P(h, p, 3))} = ${A(p)} × ${A(t * t)} = ${A(v)}.`], explanation: A(v) };
      } },
      simp: { title: "تبسيط مقادير أسية", from: 1460, to: 1640, gen(R, h) {
        const A = h.A, b = R.pick([2, 3, 5]), mode = R.pick(["frac", "frac", "eq"]);
        if (mode === "eq") { const m = R.int(2, 9), k = R.int(2, 4); if ((m * k) % 2) return null; const y = m * k / 2;
          return { style: "e", sig: `e${m}:${k}`, body: `إذا كان ${Array(k).fill(P(h, "س", m)).join(" × ")} = س أس (٢ص) ، فإن ص = ؟`, ...h.numOptions(R, h.d(y), [h.d(m * k), h.d(m), h.d(y + 1)]),
            steps: [`نجمع الأسس: ${Array(k).fill(A(m)).join(" + ")} = ${A(m * k)}.`, `٢ص = ${A(m * k)} ، إذن ص = ${A(y)}.`], explanation: A(y) }; }
        const m = R.int(2, 6), n = R.int(2, 3), k = R.int(0, 4), j = R.int(2, 12), e = m * n + k - j; if (e < 1 || e > 15) return null;
        const top = `(${P(h, b, m)})${SUP(n)}${k ? " × " + P(h, b, k) : ""}`;
        return { style: "f" + (k > 0), sig: `${b}:${m}:${n}:${k}:${j}`, body: `أوجد قيمة ${h.frac(top, P(h, b, j))}`, ...h.strOptions(R, P(h, b, e), [P(h, b, m + n + k - j > 0 ? m + n + k - j : e + 2), P(h, b, e + 1), P(h, b, Math.abs(e - 2) || e + 3)]),
          steps: [`(${P(h, b, m)})${SUP(n)} = ${P(h, b, m * n)}${k ? ` ، ثم × ${P(h, b, k)} = ${P(h, b, m * n + k)}` : ""}.`, `نقسم بطرح الأسس: ${A(m * n + k)} − ${A(j)} = ${A(e)}.`, `الناتج ${P(h, b, e)}.`], explanation: P(h, b, e) };
      } },
      mixed: { title: "تحليل الأساس المركب إلى أساسات أولية", from: 1640, to: 2040, gen(R, h) {
        const A = h.A, [B, p, q, ep, eq] = R.pick([[12, 2, 3, 2, 1], [6, 2, 3, 1, 1], [18, 3, 2, 2, 1], [10, 2, 5, 1, 1]]), n = R.int(3, 12), a = R.int(1, ep * n - 1), b = R.int(1, eq * n);
        const x = ep * n - a, y = eq * n - b, f = (u, v) => v === 0 ? P(h, p, u) : `${P(h, p, u)} × ${P(h, q, v)}`, ans = f(x, y);
        return { style: "b" + B, sig: `${B}:${n}:${a}:${b}`, body: `ما قيمة ${h.frac(P(h, B, n), `${P(h, p, a)} × ${P(h, q, b)}`)} ؟`,
          ...h.strOptions(R, ans, [f(n - a, n - b), f(x + 1, y), f(ep * n + a, eq * n + b), f(x, y + 1)]),
          steps: [`${A(B)} = ${ep === 1 ? A(p) : P(h, p, ep)} × ${eq === 1 ? A(q) : P(h, q, eq)} ، إذن ${P(h, B, n)} = ${P(h, p, ep * n)} × ${P(h, q, eq * n)}.`, `نطرح أسس الأساسات المتشابهة: ${A(p)}: ${A(ep * n)} − ${A(a)} = ${A(x)} ، و ${A(q)}: ${A(eq * n)} − ${A(b)} = ${A(y)}.`, `الناتج ${ans}.`], explanation: ans };
      } },
      negCmp: { title: "مقارنة قوى الكسور والأسس السالبة", from: 2040, to: 2358, gen(R, h) {
        const A = h.A, a = R.int(2, 9), m = R.int(2, 6), n = R.int(2, 6), k = m + n + R.int(-2, 2);
        const f = `(${h.frac("١", A(a))})${SUP(m)} × (${h.frac("١", A(a))})${SUP(n)}`, s = `${A(a)} أس (−${A(k)})`, e1 = m + n;
        return { style: k === e1 ? "e" : k < e1 ? "l" : "g", sig: `${a}:${m}:${n}:${k}`, body: h.cmpBody("", f, s), ...h.cmpAnswer(h.d(k), h.d(e1)),
          steps: [`القيمة الأولى = ${h.frac("١", P(h, a, e1))} (نجمع الأسس).`, `القيمة الثانية = ${h.frac("١", P(h, a, k))} لأن الأس السالب يقلب العدد.`, e1 === k ? "القيمتان متساويتان." : `البسط واحد، فالأكبر صاحب المقام الأصغر: ${e1 < k ? "القيمة الأولى أكبر" : "القيمة الثانية أكبر"}.`], explanation: e1 === k ? "القيمتان متساويتان" : e1 < k ? "القيمة الأولى أكبر" : "القيمة الثانية أكبر" };
      } }
    }
  };
})();
