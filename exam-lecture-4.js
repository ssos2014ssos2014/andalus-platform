// المحاضرة 4: الجذور
(() => {
  const APPROX = { 2: "1.4", 3: "1.7", 5: "2.2", 6: "2.4", 7: "2.6", 8: "2.8" };
  const SUP = n => String(n).split("").map(d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]).join("");
  const SQ = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
  window.EXAMS[4] = {
    title: "اختبار محاكي: الجذور", minutes: 25,
    blueprint: [["like", 3], ["props", 2], ["perfect", 3], ["subst", 1], ["mulRoots", 2], ["ration", 2], ["cmpIn", 2], ["cmpApx", 3], ["decRoot", 2], ["rootEq", 2], ["nth", 2]],
    skills: {
      like: { title: "جمع وطرح الجذور المتشابهة وتبسيطها", from: 0, to: 440, extra: [[720, 780]], gen(R, h) {
        const A = h.A, k = R.pick([2, 3, 5, 6, 7]), style = R.pick(["add", "simp"]);
        if (style === "add") {
          const a = R.int(2, 9), b = R.int(1, 7), c = R.int(1, a + b - 1), r = a + b - c;
          return { style, sig: `a:${a}${b}${c}:${k}`, body: `ما قيمة ${h.rad(a, k)} + ${h.rad(b, k)} − ${h.rad(c, k)} ؟`,
            ...h.strOptions(R, h.radS(r, k), [h.radS(a + b + c, k), h.rad(1, r * k), h.radS(r, k * 2 === 4 ? 3 : k + 1), A(r)]),
            steps: ["الجذور المتشابهة (نفس العدد تحت الجذر) نجمع ونطرح معاملاتها فقط، والجذر كما هو.", `${A(a)} + ${A(b)} − ${A(c)} = ${A(r)} ، فالناتج ${h.radS(r, k)}.`], explanation: h.radS(r, k) };
        }
        const m1 = R.int(2, 5), m2 = R.int(1, m1 - 1), n1 = m1 * m1 * k, n2 = m2 * m2 * k, r = m1 - m2;
        return { style, sig: `s:${n1}-${n2}`, body: `ما قيمة ${h.rad(1, n1)} − ${h.rad(1, n2)} ؟`, ...h.strOptions(R, h.radS(r, k), [h.radS(1, n1 - n2), h.radS(m1 + m2, k), h.rad(1, k * r + 1), A(r)]),
          steps: [`نحلل ما تحت الجذر إلى مربع كامل × عدد: ${A(n1)} = ${A(m1 * m1)} × ${A(k)} و ${A(n2)} = ${A(m2 * m2)} × ${A(k)}.`, `${h.rad(1, n1)} = ${h.rad(m1, k)} و ${h.rad(1, n2)} = ${h.rad(m2, k)}.`,
            `صارت جذورًا متشابهة: ${h.rad(m1, k)} − ${h.rad(m2, k)} = ${h.radS(r, k)}. (تنبيه: ${h.rad(1, n1)} − ${h.rad(1, n2)} لا يساوي ${h.rad(1, n1 - n2)})`], explanation: h.radS(r, k) };
      } },
      props: { title: "خصائص الجذور (الضرب والقسمة والتربيع)", from: 0, to: 440, extra: [[720, 840]], gen(R, h) {
        const A = h.A, style = R.pick(["sq3", "mul", "div"]);
        if (style === "sq3") { const k = R.pick([2, 3, 5, 6, 7]), c = R.int(2, 4), v = c * c * k;
          return { style, sig: `q:${k}:${c}`, body: `ما قيمة (${Array(c).fill(h.rad(1, k)).join(" + ")})² ؟`, ...h.numOptions(R, h.d(v), [h.d(c * k), h.d(c * c), h.d(v * c)]),
            steps: [`نجمع ما داخل القوس أولًا: ${Array(c).fill(h.rad(1, k)).join(" + ")} = ${h.rad(c, k)}.`, `ثم نربّع: (${h.rad(c, k)})² = ${A(c)}² × ${A(k)} = ${A(c * c)} × ${A(k)} = ${A(v)}.`], explanation: A(v) }; }
        if (style === "mul") { const r = R.int(2, 12), a = R.pick([2, 3, 5, 6, 7].filter(x => (r * r) % x === 0)) || 1; if (a === 1) return null; const b = r * r / a;
          return { style, sig: `m:${a}x${b}`, body: `ما قيمة ${h.rad(1, a)} × ${h.rad(1, b)} ؟`, ...h.numOptions(R, h.d(r), [h.d(a * b), h.d(a + b), h.d(r * 2)]),
            steps: ["خاصية الضرب: √أ × √ب = √(أ × ب).", `${h.rad(1, a)} × ${h.rad(1, b)} = ${h.rad(1, `${A(a)} × ${A(b)}`)} = ${h.rad(1, a * b)} = ${A(r)}.`], explanation: A(r) }; }
        const q = R.int(2, 9), b = R.pick([2, 3, 5, 6, 7]), a = q * q * b;
        return { style, sig: `d:${a}/${b}`, body: `ما قيمة ${h.rad(1, a)} ÷ ${h.rad(1, b)} ؟`, ...h.numOptions(R, h.d(q), [h.d(q * q), h.d(a / b * 2), h.d(q + 1)]),
          steps: ["خاصية القسمة: √أ ÷ √ب = √(أ ÷ ب).", `${h.rad(1, a)} ÷ ${h.rad(1, b)} = ${h.rad(1, `${A(a)} ÷ ${A(b)}`)} = ${h.rad(1, q * q)} = ${A(q)}.`], explanation: A(q) };
      } },
      perfect: { title: "المربعات الكاملة (جذور يجب حفظها)", from: 440, to: 660, extra: [[760, 840]], gen(R, h) {
        const A = h.A, style = R.pick(["sum", "prod", "frac"]);
        if (style === "sum") { const m = R.pick([9, 16, 25, 36, 49, 64, 81, 100]), c = R.pick([4, 9, 16]), v = Math.sqrt(c) * Math.sqrt(m);
          return { style, sig: `s:${m}:${c}`, body: `ما قيمة ${h.rad(1, Array(c).fill(A(m)).join(" + "))} ؟`, ...h.numOptions(R, h.d(v), [h.d(Math.sqrt(m) * c), h.d(m), h.d(v + Math.sqrt(m))]),
            steps: [`الجمع المتكرر ضرب: ${Array(c).fill(A(m)).join(" + ")} = ${A(c)} × ${A(m)}.`, `${h.rad(1, `${A(c)} × ${A(m)}`)} = ${h.rad(1, c)} × ${h.rad(1, m)} = ${A(Math.sqrt(c))} × ${A(Math.sqrt(m))} = ${A(v)}.`], explanation: A(v) }; }
        if (style === "prod") { const b = R.int(2, 9), v = b * b;
          return { style, sig: `p:${b}`, body: `ما قيمة ${h.rad(1, Array(4).fill(A(b)).join(" × "))} ؟`, ...h.numOptions(R, h.d(v), [h.d(b), h.d(b * b * b), h.d(2 * b)]),
            steps: [`نجمع كل عددين متماثلين تحت الجذر: ${A(b)} × ${A(b)} × ${A(b)} × ${A(b)} = (${A(b)} × ${A(b)})².`, `جذر المربع يلغي التربيع: الناتج ${A(b)} × ${A(b)} = ${A(v)}.`], explanation: A(v) }; }
        const p = R.int(1, 9), q = R.int(p + 1, 12), c = R.int(1, 5), d = R.int(c + 1, 9);
        const g = (x, y) => y ? g(y, x % y) : x, num = p * c, den = q * d, gg = g(num, den);
        const ans = `${A(num / gg)}/${A(den / gg)}`;
        return { style, sig: `f:${p}/${q}:${c}/${d}`, body: `ما قيمة ${h.rad(1, `${A(p * p)}/${A(q * q)}`)} × ${A(c)}/${A(d)} ؟`,
          ...h.strOptions(R, ans, [`${A(p * p * c)}/${A(q * q * d)}`, `${A(p + c)}/${A(q + d)}`, `${A(den / gg)}/${A(num / gg)}`, `${A(num / gg + 1)}/${A(den / gg)}`]),
          steps: [`جذر الكسر = جذر البسط ÷ جذر المقام: ${h.rad(1, `${A(p * p)}/${A(q * q)}`)} = ${A(p)}/${A(q)}.`, `نضرب الكسرين: ${A(p)}/${A(q)} × ${A(c)}/${A(d)} = ${A(num)}/${A(den)} = ${ans}.`], explanation: ans };
      } },
      subst: { title: "التعويض بقيم جذرية", from: 620, to: 700, gen(R, h) {
        const A = h.A, k = R.pick([2, 3, 5]), m = R.pick([2, 3, 5]), c = R.pick([2, 3, 4, 5]), neg = R.next() < .5, v = c * k * m * (neg ? -1 : 1);
        const S = x => (x < 0 ? "−" : "") + A(Math.abs(x));
        return { style: neg ? "n" : "p", sig: `${k}:${m}:${c}:${neg}`, body: `إذا كانت ب = ${h.rad(1, k)} ، ق = ${h.rad(1, m)} ، فأوجد قيمة ${neg ? "−" : ""}${A(c)} ب² ق²`,
          ...h.strOptions(R, S(v), [S(-v), S(c * Math.sqrt(k * m) | 0 || c * 2), S((neg ? -1 : 1) * c * k * m * k), S((neg ? -1 : 1) * (c + k + m))]),
          steps: [`ب² = (${h.rad(1, k)})² = ${A(k)} ، ق² = (${h.rad(1, m)})² = ${A(m)}.`, `${neg ? "−" : ""}${A(c)} × ${A(k)} × ${A(m)} = ${S(v)}.`], explanation: S(v) };
      } },
      mulRoots: { title: "ضرب الجذور (الخارج × الخارج والداخل × الداخل) والمرافق", from: 880, to: 1080, gen(R, h) {
        const A = h.A, style = R.pick(["mul", "conj"]);
        if (style === "mul") { const a = R.int(2, 6), b = R.int(2, 6), k = R.pick([2, 3, 5, 6]), m = R.pick([2, 3, 5, 6]), out = a * b, inn = k * m;
          const ans = h.radS(out, inn);
          return { style, sig: `m:${a}${k}${b}${m}`, body: `ما قيمة ${h.rad(a, k)} × ${h.rad(b, m)} ؟`, ...h.strOptions(R, ans, [h.radS(a + b, inn), h.radS(out, k + m), h.rad(out, inn) === ans ? h.radS(out * 2, inn) : h.rad(out, inn), A(out * inn)]),
            steps: ["نضرب الأعداد خارج الجذور في بعضها، والأعداد داخل الجذور في بعضها.", `${A(a)} × ${A(b)} = ${A(out)} ، و ${A(k)} × ${A(m)} = ${A(inn)} ، فيكون ${h.rad(out, inn)}${ans !== h.rad(out, inn) ? ` ونبسّطه إلى ${ans}` : ""}.`], explanation: ans }; }
        const a = R.pick([3, 5, 6, 7, 10, 11]), b = R.pick([2, 3, 5].filter(x => x < a)), v = a - b;
        return { style, sig: `c:${a}:${b}`, body: `ما قيمة (${h.rad(1, a)} + ${h.rad(1, b)}) (${h.rad(1, a)} − ${h.rad(1, b)}) ؟`, ...h.numOptions(R, h.d(v), [h.d(a + b), h.d(a * b - b), h.d(v * 2)]),
          steps: ["حاصل ضرب المرافقين: نضرب الأول في الأول والأخير في الأخير فقط (الحدود الوسطى تُلغى).", `(${h.rad(1, a)})² − (${h.rad(1, b)})² = ${A(a)} − ${A(b)} = ${A(v)}.`], explanation: A(v) };
      } },
      ration: { title: "التخلص من الجذر في المقام", from: 1000, to: 1100, gen(R, h) {
        const A = h.A, style = R.pick(["simple", "conj"]);
        if (style === "simple") { const k = R.pick([2, 3, 5, 6, 7, 10, 11, 13]), c = R.int(1, 9), n = c * k, ans = h.rad(c, k);
          return { style, sig: `s:${n}/${k}`, body: `أوجد أبسط صورة لـ ${A(n)} ÷ ${h.rad(1, k)}`, ...h.strOptions(R, ans, [h.rad(n, k), h.rad(c * 2, k), A(c), h.rad(1, n)]),
            steps: [`نضرب البسط والمقام في ${h.rad(1, k)} (مرافق المقام): (${A(n)} × ${h.rad(1, k)}) ÷ (${h.rad(1, k)} × ${h.rad(1, k)}).`, `= (${h.rad(n, k)}) ÷ ${A(k)} = ${ans}.`], explanation: ans }; }
        const b = R.pick([1, 2, 3]), a = b * b + R.pick([1, 1, 2]), c = (a - b * b) * R.int(2, 9), q0 = c / (a - b * b), ans = `${h.rad(q0, a)} + ${A(q0 * b)}`;
        return { style, sig: `c:${c}/${a}`, body: `أوجد أبسط صورة لـ ${A(c)} ÷ (${h.rad(1, a)} − ${A(b)})`, ...h.strOptions(R, ans, [`${h.rad(q0, a)} − ${A(q0 * b)}`, `${h.rad(1, a)} + ${A(b)}`, h.rad(q0, a), `${A(q0)} + ${h.rad(1, a)}`]),
          steps: [`نضرب البسط والمقام في المرافق (${h.rad(1, a)} + ${A(b)}).`, `المقام: (${h.rad(1, a)})² − ${A(b)}² = ${A(a)} − ${A(b * b)} = ${A(a - b * b)}.`, `البسط: ${A(c)} × (${h.rad(1, a)} + ${A(b)})، ونقسم على ${A(a - b * b)}: ${ans}.`], explanation: ans };
      } },
      cmpIn: { title: "المقارنة بإدخال المعامل تحت الجذر أو بالتربيع", from: 1100, to: 1220, extra: [[0, 440]], gen(R, h) {
        const A = h.A, style = R.pick(["coef", "sq"]);
        if (style === "coef") { let a = R.int(2, 12), k = R.pick([2, 3, 5, 6, 7, 11]), b = R.int(2, 12), m = R.pick([2, 3, 5, 6, 7, 11]); if (a * a * k === b * b * m && R.next() < .7) return null;
          return { style, sig: `c:${a}${k}:${b}${m}`, body: h.cmpBody("", h.rad(a, k), h.rad(b, m)), ...h.cmpAnswer(h.d(a * a * k), h.d(b * b * m)),
            steps: ["ندخل المعامل تحت الجذر بتربيعه: أ√ب = √(أ² × ب).", `${h.rad(a, k)} = ${h.rad(1, `${A(a * a)} × ${A(k)}`)} = ${h.rad(1, a * a * k)}`, `${h.rad(b, m)} = ${h.rad(1, `${A(b * b)} × ${A(m)}`)} = ${h.rad(1, b * b * m)}`,
              `نقارن ما تحت الجذرين: ${A(a * a * k)} و ${A(b * b * m)}.`], explanation: "" }; }
        const M = R.int(20, 300), N = M * M + R.pick([-1, 1]) * R.int(1, 2 * M);
        return { style, sig: `q:${N}:${M}`, body: h.cmpBody("", h.rad(1, N), A(M)), ...h.cmpAnswer(h.d(N), h.d(M * M)),
          steps: ["نربّع الطرفين فيزول الجذر ولا يتغير اتجاه المقارنة.", `(${h.rad(1, N)})² = ${A(N)} ، و ${A(M)}² = ${A(M * M)}.`, N > M * M ? "إذن القيمة الأولى أكبر." : "إذن القيمة الثانية أكبر."], explanation: "" };
      } },
      cmpApx: { title: "المقارنة بالقيم التقريبية للجذور", from: 1220, to: 1600, gen(R, h) {
        const A = h.A, ks = [2, 3, 5, 6, 7, 8];
        const k1 = R.pick(ks), k2 = R.pick(ks), a = R.int(1, 4), b = R.int(1, 4);
        const v1 = Math.sqrt(k1) + a, v2 = Math.sqrt(k2) + b;
        if (Math.abs(v1 - v2) < 0.25 || k1 === k2) return null;
        const t1 = `${h.rad(1, k1)} + ${A(a)}`, t2 = `${A(b)} + ${h.rad(1, k2)}`;
        return { style: "a", sig: `${k1}${a}:${k2}${b}`, body: h.cmpBody("", t1, t2), ...h.cmpAnswer(h.d(v1.toFixed(2)), h.d(v2.toFixed(2))),
          steps: ["إذا كانت الجذور مجموعة مع أعداد نستخدم القيم التقريبية المحفوظة: √٢ ≈ ١,٤ ، √٣ ≈ ١,٧ ، √٥ ≈ ٢,٢ ، √٦ ≈ ٢,٤ ، √٧ ≈ ٢,٦ ، √٨ ≈ ٢,٨.",
            `القيمة الأولى ≈ ${h.fx(h.d(APPROX[k1]))} + ${A(a)} = ${h.fx(h.add(h.d(APPROX[k1]), h.d(a)))}.`, `القيمة الثانية ≈ ${A(b)} + ${h.fx(h.d(APPROX[k2]))} = ${h.fx(h.add(h.d(APPROX[k2]), h.d(b)))}.`,
            v1 > v2 ? "إذن القيمة الأولى أكبر." : "إذن القيمة الثانية أكبر."], explanation: "" };
      } },
      decRoot: { title: "جذر العدد العشري (التربيعي والتكعيبي)", from: 1620, to: 1800, gen(R, h) {
        const A = h.A, style = R.pick(["sq", "cube", "cmp"]);
        if (style === "cube") { const k = R.int(1, 9), s = R.int(1, 2), r = { i: k, s }, c = h.mul(r, r, r);
          return { style, sig: `c:${h.str(r)}`, body: `ما قيمة ${h.rad(1, h.fx(c), 3)} ؟`, ...h.numOptions(R, r, [h.shift(r, 1), h.shift(r, -1), h.mul(r, r)]),
            steps: [`نحذف الفاصلة ونوجد الجذر التكعيبي للعدد ${A(c.i)}: ${h.rad(1, c.i, 3)} = ${A(k)}.`, `عدد الأرقام بعد الفاصلة ${A(c.s)}، نقسمه على ٣ = ${A(c.s / 3)}، فنضع الفاصلة بعد ${A(c.s / 3)} من اليمين: ${h.fx(r)}.`], explanation: h.fx(r) }; }
        const k = R.int(1, 15), s = R.int(1, 3), r = { i: k, s }, q = h.mul(r, r);
        if (style === "cmp") { const other = R.pick([r, h.shift(r, 1), q]); return { style, sig: `m:${h.str(q)}:${h.str(other)}`, body: h.cmpBody("", h.rad(1, h.fx(q)), h.fx(other)), ...h.cmpAnswer(r, other),
          steps: [`نحذف الفاصلة: ${h.rad(1, A(q.i))} = ${A(k)}.`, `عدد المنازل ${A(q.s)}، نصفها ${A(q.s / 2)}، فالجذر = ${h.fx(r)}.`, `نقارن ${h.fx(r)} بـ ${h.fx(other)}.`], explanation: h.fx(r) }; }
        return { style, sig: `s:${h.str(q)}`, body: `ما قيمة ${h.rad(1, h.fx(q))} ؟`, ...h.numOptions(R, r, [h.shift(r, 1), h.shift(r, -1), q]),
          steps: [`قاعدة ٧: نحذف الفاصلة ونوجد جذر العدد ${A(q.i)}: ${h.rad(1, q.i)} = ${A(k)}.`, `عدد الأرقام بعد الفاصلة في ${h.fx(q)} هو ${A(q.s)}، نصفه ${A(q.s / 2)}، فنضع الفاصلة بعد ${A(q.s / 2)} من اليمين: ${h.fx(r)}.`], explanation: h.fx(r) };
      } },
      rootEq: { title: "معادلات تحتوي على جذور", from: 1830, to: 1950, gen(R, h) {
        const A = h.A, style = R.pick(["sum", "coef"]);
        if (style === "sum") { const k = R.pick([2, 3, 5]), c = R.int(2, 4), x = c * c * k;
          return { style, sig: `s:${k}:${c}`, body: `إذا كان ${h.rad(1, "س")} = ${Array(c).fill(h.rad(1, k)).join(" + ")} ، فإن س = `, ...h.numOptions(R, h.d(x), [h.d(c * k), h.d(c * c), h.d(x * 3)]),
            steps: [`نجمع الطرف الأيمن: ${Array(c).fill(h.rad(1, k)).join(" + ")} = ${h.rad(c, k)}.`, `نربّع الطرفين لنتخلص من الجذر: س = (${h.rad(c, k)})² = ${A(c * c)} × ${A(k)} = ${A(x)}.`], explanation: A(x) }; }
        const m = R.pick([2, 3, 5]), c = R.int(2, 4), t = m * R.int(1, 4), d = c * t, x = t * t / m;
        if (!Number.isInteger(x)) return null;
        return { style, sig: `c:${c}:${m}:${d}`, body: `إذا كان ${A(c)} × ${h.rad(1, `${A(m)}س`)} = ${A(d)} ، فأوجد قيمة س`, ...h.numOptions(R, h.d(x), [h.d(t), h.d(t * t), h.d(d / m)]),
          steps: [`نجعل الجذر وحده: ${h.rad(1, `${A(m)}س`)} = ${A(d)} ÷ ${A(c)} = ${A(t)}.`, `نربّع الطرفين: ${A(m)}س = ${A(t * t)}.`, `س = ${A(t * t)} ÷ ${A(m)} = ${A(x)}.`], explanation: A(x) };
      } },
      nth: { title: "الجذر النوني والأس الكسري", from: 1950, to: 2052, gen(R, h) {
        const A = h.A, opts = [[2, 5, 32], [3, 4, 81], [2, 6, 64], [2, 3, 8], [3, 3, 27], [4, 3, 64], [5, 3, 125], [2, 4, 16], [10, 3, 1000], [3, 5, 243], [2, 10, 1024], [6, 3, 216], [7, 3, 343], [4, 4, 256], [5, 4, 625], [2, 7, 128], [2, 8, 256], [9, 3, 729], [8, 3, 512], [6, 2, 36], [7, 2, 49], [11, 2, 121], [12, 2, 144]];
        const [b, n, v] = R.pick(opts), style = R.pick(["root", "pow"]);
        if (style === "root") return { style, sig: `r:${v}:${n}`, body: `ما قيمة ${h.rad(1, v, n)} ؟`, ...h.numOptions(R, h.d(b), [h.d(b + 1), h.d(v / n | 0 || b * 2), h.d(b * b)]),
          steps: [`الجذر النوني: نبحث عن العدد الذي إذا رفعناه للقوة ${A(n)} أعطى ${A(v)}.`, `${A(v)} = ${Array(n).fill(A(b)).join(" × ")} = ${A(b)}${SUP(n)} ، إذن ${h.rad(1, v, n)} = ${A(b)}.`], explanation: A(b) };
        const m = R.int(2, 4), val = b ** m; if (val > 9999) return null;
        return { style, sig: `p:${v}:${m}/${n}`, body: `ما قيمة ${h.rad(1, `${A(v)}${"⁰¹²³⁴⁵⁶⁷⁸⁹"[m]}`, n)} ؟`, ...h.numOptions(R, h.d(val), [h.d(b), h.d(b * m), h.d(val * b)]),
          steps: ["قاعدة ٩: الجذر النوني لعدد مرفوع لقوة = العدد مرفوعًا لأس كسري (القوة ÷ دليل الجذر).", `${A(v)} = ${A(b)}${SUP(n)} ، فيكون ${A(v)}${SUP(m)} = ${A(b)}${SUP(n * m)} ، وجذره النوني ${A(b)} أس (${A(n * m)} ÷ ${A(n)}) = ${A(b)}${SUP(m)} = ${A(val)}.`], explanation: A(val) };
      } }
    }
  };
})();
