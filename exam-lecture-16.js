// المحاضرة 16: جمع وطرح الأساسات المتشابهة (العامل المشترك)، الأس الزوجي والفردي للعدد السالب، التعويض
(() => {
  const SUP = n => String(n).split("").map(x => "⁰¹²³⁴⁵⁶⁷⁸⁹"[x]).join("");
  const P = (h, b, e) => e === 1 ? (typeof b === "number" ? h.A(b) : b) : `${typeof b === "number" ? h.A(b) : b}${SUP(e)}`;
  const S = (h, x) => x < 0 ? `−${h.A(-x)}` : h.A(x);
  const N = (h, b) => b < 0 ? `(−${h.A(-b)})` : h.A(b);
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  const cmpI = (h, x, y) => h.cmpAnswer(h.d(x), h.d(y));
  window.EXAMS[16] = {
    title: "اختبار محاكي: جمع الأساسات وطرحها والأس الزوجي والفردي", minutes: 25,
    blueprint: [["mulSame", 1], ["ppDiv", 1], ["factor", 2], ["repDiv", 2], ["facDiv", 2], ["cmpDiff", 1], ["seq", 1], ["sumEq", 1], ["dbl", 2], ["neg", 3], ["repNeg", 1], ["simp", 2], ["signCmp", 2], ["negOne", 1], ["poly", 2]],
    skills: {
      mulSame: { title: "ضرب أساسات مختلفة لها الأس نفسه", from: 0, to: 110, gen(R, h) {
        const a = R.int(2, 7), b = R.int(2, 7), e = R.int(2, 9); if (a === b || a * b > 40) return null;
        return { style: "m", sig: `${a}:${b}:${e}`, body: `ما قيمة ${P(h, a, e)} × ${P(h, b, e)} ؟`, ...h.strOptions(R, P(h, a * b, e), [P(h, a * b, 2 * e), P(h, a + b, e), P(h, a, e * b)]),
          steps: ["الأسس متساوية، فنضرب الأساسات ونُبقي الأس.", `${h.A(a)} × ${h.A(b)} = ${h.A(a * b)} ، الناتج ${P(h, a * b, e)}.`], explanation: P(h, a * b, e) };
      } },
      ppDiv: { title: "قوة القوة ثم القسمة", from: 110, to: 150, gen(R, h) {
        const b = R.int(2, 9), m = R.int(3, 20), n = R.int(2, 3), k = R.int(1, m * n - 1), e = m * n - k;
        return { style: "p", sig: `${b}:${m}:${n}:${k}`, body: `ما قيمة المقدار (${P(h, b, m)})${SUP(n)} ÷ ${P(h, b, k)} ؟`, ...h.strOptions(R, P(h, b, e), [P(h, b, m + n - k > 0 ? m + n - k : e + 2), P(h, b, e + 1), P(h, b, m * n + k)]),
          steps: [`(${P(h, b, m)})${SUP(n)} = ${P(h, b, m * n)}.`, `${P(h, b, m * n)} ÷ ${P(h, b, k)} = ${P(h, b, e)} (نطرح الأسس).`], explanation: P(h, b, e) };
      } },
      factor: { title: "جمع الأساسات المتشابهة بأخذ العامل المشترك", from: 150, to: 310, gen(R, h) {
        const A = h.A, b = R.int(2, 5), n = R.int(2, 6), d = R.int(1, 3), m = n + d, sign = R.next() < .3 ? -1 : 1, form = R.next() < .5, v = b ** m + sign * b ** n, c = b ** d + sign;
        if (!form && v > 5000) return null;
        const ans = form ? `${A(c)} × ${P(h, b, n)}` : A(v);
        return { style: (form ? "f" : "v") + sign, sig: `${b}:${m}:${n}:${sign}:${form}`, body: `ما قيمة ${P(h, b, m)} ${sign > 0 ? "+" : "−"} ${P(h, b, n)} ؟`,
          ...(form ? h.strOptions(R, ans, [P(h, b, m + n), P(h, b, sign > 0 ? m + n : d), `${A(b ** d)} × ${P(h, b, n)}`, `${A(c + 1)} × ${P(h, b, n)}`]) : h.numOptions(R, h.d(v), [h.d(b ** (sign > 0 ? m + n : d) > 9999 ? v + b : b ** (sign > 0 ? m + n : d)), h.d(v + b ** n), h.d(c)])),
          steps: [`نأخذ العامل المشترك وهو الأس الأصغر ${P(h, b, n)}: ${P(h, b, n)} (${P(h, b, d)} ${sign > 0 ? "+" : "−"} ١).`, `${P(h, b, d)} ${sign > 0 ? "+" : "−"} ١ = ${A(c)} ، فالناتج = ${A(c)} × ${P(h, b, n)}${form ? "" : ` = ${A(c)} × ${A(b ** n)} = ${A(v)}`}.`, "تنبيه: عند الجمع أو الطرح لا نجمع الأسس ولا نطرحها."], explanation: ans };
      } },
      repDiv: { title: "قسمة مجموع حدود متكررة", from: 310, to: 400, gen(R, h) {
        const A = h.A, b = R.int(2, 5), k = R.pick([2, 3, 4, 5]), n = R.int(2, 9), down = R.int(0, 1), v = down ? k * b : k;
        return { style: "d" + down, sig: `${b}:${k}:${n}:${down}`, body: `ما قيمة ${h.frac(Array(k).fill(P(h, b, n)).join(" + "), P(h, b, n - down))} ؟`,
          ...h.numOptions(R, h.d(v), [h.d(down ? k : k * b), h.d(b), h.d(v + 1)]),
          steps: [`البسط = ${A(k)} × ${P(h, b, n)}.`, down ? `${h.frac(`${A(k)} × ${P(h, b, n)}`, P(h, b, n - 1))} = ${A(k)} × ${A(b)} = ${A(v)}.` : `نختصر ${P(h, b, n)} مع المقام فيبقى ${A(k)}.`], explanation: A(v) };
      } },
      facDiv: { title: "العامل المشترك ثم القسمة", from: 400, to: 590, gen(R, h) {
        const A = h.A, b = R.int(2, 9), n = R.int(2, 12), mode = R.pick(["plus", "minus"]);
        if (mode === "plus") { const ans = P(h, b, n);
          return { style: "p", sig: `p${b}:${n}`, body: `ما قيمة ${h.frac(`${P(h, b, n + 1)} + ${P(h, b, n)}`, A(b + 1))} ؟`, ...h.strOptions(R, ans, [P(h, b, n + 1), P(h, b, 2 * n + 1), P(h, b, n - 1)]),
            steps: [`البسط = ${P(h, b, n)} (${A(b)} + ١) = ${P(h, b, n)} × ${A(b + 1)}.`, `نختصر ${A(b + 1)} مع المقام: الناتج ${ans}.`], explanation: ans }; }
        const d = R.int(1, 3), v = b ** d - 1; if (v > 999) return null;
        return { style: "m", sig: `m${b}:${n}:${d}`, body: `ما قيمة ${h.frac(`${P(h, b, n + d)} − ${P(h, b, n)}`, P(h, b, n))} ؟`, ...h.numOptions(R, h.d(v), [h.d(v + 1), h.d(b ** d), h.d(b * d)]),
          steps: [`نأخذ ${P(h, b, n)} عاملًا مشتركًا: ${P(h, b, n)} (${P(h, b, d)} − ١).`, `نختصر مع المقام: ${P(h, b, d)} − ١ = ${A(v)}.`], explanation: A(v) };
      } },
      cmpDiff: { title: "مقارنة فرق قوتين بقوة", from: 590, to: 670, gen(R, h) {
        const A = h.A, b = R.int(2, 5), n = R.int(2, 4), k = R.pick([n, n - 1, n + 1]), x = b ** (n + 1) - b ** n, y = b ** k;
        return { style: "c", sig: `${b}:${n}:${k}`, body: h.cmpBody("", `${P(h, b, n + 1)} − ${P(h, b, n)}`, P(h, b, k)), ...cmpI(h, x, y),
          steps: [`القيمة الأولى = ${P(h, b, n)} (${A(b)} − ١) = ${A(b - 1)} × ${A(b ** n)} = ${A(x)}.`, `القيمة الثانية = ${A(y)}.`, `إذن ${rel(x, y)}.`], explanation: rel(x, y) };
      } },
      seq: { title: "مجموع قوى متتالية", from: 670, to: 720, gen(R, h) {
        const A = h.A, b = R.pick([2, 3]), k = R.int(3, 5), sum = Array.from({ length: k }, (_, i) => b ** (i + 1)).reduce((s, x) => s + x, 0), dv = R.pick([2, 3, 5, 6, 10, 15].filter(x => sum % x === 0)); if (!dv) return null;
        const v = sum / dv;
        return { style: "s" + b, sig: `${b}:${k}:${dv}`, body: `ما قيمة ${h.frac(Array.from({ length: k }, (_, i) => P(h, b, i + 1)).join(" + "), A(dv))} ؟`, ...h.numOptions(R, h.d(v), [h.d(v + 1), h.d(b ** k / dv | 0 || v + 2), h.d(sum)]),
          steps: [`نحسب كل حد: ${Array.from({ length: k }, (_, i) => A(b ** (i + 1))).join(" + ")} = ${A(sum)}.`, `${A(sum)} ÷ ${A(dv)} = ${A(v)}.`], explanation: A(v) };
      } },
      sumEq: { title: "مجموع قوتين يساوي قوة", from: 720, to: 790, gen(R, h) {
        const A = h.A, [a, m, b, n, B, e] = R.pick([[2, 5, 2, 2, 6, 2], [3, 3, 3, 2, 6, 2], [2, 4, 3, 2, 5, 2], [2, 3, 2, 0, 3, 2], [5, 2, 2, 1, 3, 3], [2, 6, 6, 2, 10, 2]]), p = R.int(2, 4), x = e * p;
        const t2 = n === 0 ? "١" : P(h, b, n);
        return { style: "s", sig: `${a}:${m}:${b}:${n}:${p}`, body: `إذا كان (${P(h, a, m)} + ${t2})${SUP(p)} = ${A(B)} أس س ، فإن س = ؟`, ...h.numOptions(R, h.d(x), [h.d(p), h.d(m + n), h.d(x + p)]),
          steps: [`داخل القوس: ${A(a ** m)} + ${A(b ** n)} = ${A(a ** m + b ** n)} = ${P(h, B, e)}.`, `(${P(h, B, e)})${SUP(p)} = ${P(h, B, x)} ، إذن س = ${A(x)}.`], explanation: A(x) };
      } },
      dbl: { title: "تكرار القوة بعدد أساسها", from: 790, to: 1030, gen(R, h) {
        const A = h.A, b = R.int(2, 4), n = R.int(5, 120), mode = R.pick(["cmp", "val"]), terms = Array(b).fill(P(h, b, n)).join(" + ");
        if (mode === "cmp") { const k = R.pick([n, n + 1, n + 2]);
          return { style: "c", sig: `c${b}:${n}:${k}`, body: h.cmpBody("", terms, P(h, b, k)), ...cmpI(h, n + 1, k),
            steps: [`القيمة الأولى = ${A(b)} × ${P(h, b, n)} = ${P(h, b, n + 1)}.`, `نقارن ${P(h, b, n + 1)} مع ${P(h, b, k)}: ${rel(n + 1, k)}.`], explanation: rel(n + 1, k) }; }
        const c = R.int(2, 9), ans = `${A(1 + b * b)} × ${P(h, b, n)}`;
        return { style: "v", sig: `v${b}:${n}`, body: `ما قيمة ${P(h, b, n)} + ${P(h, b, n + 2)} ؟`, ...h.strOptions(R, ans, [P(h, b, 2 * n + 2), `${A(b * b)} × ${P(h, b, n)}`, `${A(b + 1)} × ${P(h, b, n)}`, P(h, b, n + 3)]),
          steps: [`العامل المشترك ${P(h, b, n)}: ${P(h, b, n)} (١ + ${P(h, b, 2)}).`, `١ + ${A(b * b)} = ${A(1 + b * b)} ، الناتج ${ans}.`], explanation: ans };
      } },
      neg: { title: "الأس الزوجي والفردي للعدد السالب", from: 1030, to: 1590, gen(R, h) {
        const A = h.A, a = R.int(2, 6), mode = R.pick(["val", "cmp", "cmpOut", "frac"]);
        if (mode === "val") { const n = R.int(2, 5), v = (-a) ** n; if (Math.abs(v) > 3000) return null;
          return { style: "v" + (n % 2), sig: `v${a}:${n}`, body: `ما قيمة (−${A(a)})${SUP(n)} ؟`, ...h.strOptions(R, S(h, v), [S(h, -v), S(h, -a * n), S(h, a * n)]),
            steps: [`${A(a)}${SUP(n)} = ${A(Math.abs(v))}.`, n % 2 ? "الأس فردي فيبقى الناتج سالبًا." : "الأس زوجي فيصبح الناتج موجبًا.", `الناتج ${S(h, v)}.`], explanation: S(h, v) }; }
        if (mode === "frac") { const m = R.pick([2, 4, 6]), n = R.pick([3, 5]);
          return { style: "f", sig: `f${a}:${m}:${n}`, body: h.cmpBody("", `(−${h.frac("١", A(a))})${SUP(m)}`, `(−${h.frac("١", A(a))})${SUP(n)}`), options: h.cmpAnswer(h.d(1), h.d(0)).options, correct: 0,
            steps: [`الأولى أسها زوجي فهي موجبة: ${h.frac("١", A(a ** m))}.`, "الثانية أسها فردي فهي سالبة.", "أي عدد موجب أكبر من أي عدد سالب: القيمة الأولى أكبر."], explanation: "القيمة الأولى أكبر" }; }
        const m = R.int(2, 7), n = R.int(2, 7); if (m === n) return null;
        const out = mode === "cmpOut", x = out ? -(a ** m) : (-a) ** m, y = out ? -(a ** n) : (-a) ** n;
        const f = out ? `−${P(h, a, m)}` : `(−${A(a)})${SUP(m)}`, s = out ? `−${P(h, a, n)}` : `(−${A(a)})${SUP(n)}`;
        return { style: mode + (m % 2) + (n % 2), sig: `${mode}${a}:${m}:${n}`, body: h.cmpBody("", f, s), ...cmpI(h, x, y),
          steps: out ? ["الإشارة السالبة خارج القوة فالقيمتان سالبتان دائمًا.", `الأولى = ${S(h, x)} ، الثانية = ${S(h, y)}.`, `في الأعداد السالبة الأكبر هو الأقرب للصفر: ${rel(x, y)}.`]
            : [`الأس الزوجي يعطي ناتجًا موجبًا والفردي سالبًا.`, `الأولى = ${S(h, x)} ، الثانية = ${S(h, y)}.`, `إذن ${rel(x, y)}.`], explanation: rel(x, y) };
      } },
      repNeg: { title: "تكرار عدد سالب جمعًا مقابل الرفع لأس", from: 1590, to: 1700, gen(R, h) {
        const A = h.A, a = R.int(2, 4), k = R.int(3, 6), x = -a * k, y = (-a) ** k;
        return { style: "k" + (k % 2), sig: `${a}:${k}`, body: h.cmpBody("", Array(k).fill(`−${A(a)}`).join(" "), `(−${A(a)})${SUP(k)}`), ...cmpI(h, x, y),
          steps: [`القيمة الأولى جمع: ${A(k)} × (−${A(a)}) = ${S(h, x)}.`, `القيمة الثانية ضرب: (−${A(a)})${SUP(k)} = ${S(h, y)}.`, `إذن ${rel(x, y)}.`], explanation: rel(x, y) };
      } },
      simp: { title: "تبسيط مقدار جبري بقسمة كل حد على المقام", from: 1700, to: 1900, gen(R, h) {
        const p = R.int(1, 4), q = R.int(1, 4), e = R.int(1, 3), f = R.int(1, 3), V = (x, y) => [x ? P(h, "س", x) : "", y ? P(h, "ص", y) : ""].filter(Boolean).join(" ");
        const ans = `${P(h, "س", p)} + ${P(h, "ص", q)}`;
        return { style: "s", sig: `${p}:${q}:${e}:${f}`, body: `تبسيط المقدار ${h.frac(`${V(p + e, f)} + ${V(e, q + f)}`, V(e, f))}`,
          ...h.strOptions(R, ans, [`${P(h, "س", p + e)} + ${P(h, "ص", q + f)}`, `${P(h, "س", p)} ${P(h, "ص", q)}`, `${P(h, "س", p)} − ${P(h, "ص", q)}`, `${P(h, "س", p + 1)} + ${P(h, "ص", q)}`]),
          steps: ["نقسم كل حد في البسط على المقام منفردًا.", `${h.frac(V(p + e, f), V(e, f))} = ${P(h, "س", p)} ، و ${h.frac(V(e, q + f), V(e, f))} = ${P(h, "ص", q)}.`, `الناتج ${ans}.`], explanation: ans };
      } },
      signCmp: { title: "مقارنة قوى متغير حسب إشارته", from: 1900, to: 2600, gen(R, h) {
        const A = h.A, ev = R.pick([2, 4, 6, 8]), od = R.pick([3, 5, 7]), a = R.int(1, 10), b = R.int(1, 10), mode = R.pick(["neg", "neg", "nz"]);
        const ta = `${a === 1 ? "" : A(a)}${P(h, "س", ev)}`, tb = `${b === 1 ? "" : A(b)}${P(h, "س", od)}`;
        if (mode === "neg") { const sw = R.next() < .5;
          return { style: "n" + sw, sig: `n${a}:${ev}:${b}:${od}:${sw}`, body: h.cmpBody("إذا كانت س < صفر", sw ? tb : ta, sw ? ta : tb), options: h.cmpAnswer(h.d(0), h.d(0)).options, correct: sw ? 1 : 0,
            steps: [`س سالبة: الأس الزوجي ${A(ev)} يجعل ${ta} موجبًا، والأس الفردي ${A(od)} يجعل ${tb} سالبًا.`, `الموجب أكبر من السالب دائمًا، إذن ${sw ? "القيمة الثانية أكبر" : "القيمة الأولى أكبر"}.`], explanation: sw ? "القيمة الثانية أكبر" : "القيمة الأولى أكبر" }; }
        return { style: "z", sig: `z${a}:${ev}:${b}:${od}`, body: h.cmpBody("إذا كانت س ≠ صفر", tb, ta), options: h.cmpAnswer(h.d(0), h.d(0)).options, correct: 3,
          steps: [`نجرّب س = −١: القيمة الأولى = ${S(h, -b)} ، الثانية = ${A(a)} ، فالثانية أكبر.`, `نجرّب قيمة موجبة كبيرة أو صغيرة فتتغير النتيجة حسب س.`, "النتيجة تتغير، إذن المعلومات غير كافية."], explanation: "المعلومات غير كافية" };
      } },
      negOne: { title: "(−١) أس عدد + مقلوب العدد", from: 2030, to: 2290, gen(R, h) {
        const A = h.A, n = R.int(5, 60), ev = n % 2 === 0, ans = ev ? h.frac(A(n + 1), A(n)) : `−${h.frac(A(n - 1), A(n))}`;
        return { style: "e" + ev, sig: `${n}`, body: `ما قيمة (−١)${SUP(n)} + ${A(n)} أس (−١) ؟`,
          ...h.strOptions(R, ans, [ev ? `−${h.frac(A(n - 1), A(n))}` : h.frac(A(n + 1), A(n)), h.frac("١", A(n)), h.frac("١", A(n - 1)), "−١"]),
          steps: [`(−١)${SUP(n)} = ${ev ? "١ (الأس زوجي)" : "−١ (الأس فردي)"}.`, `${A(n)} أس (−١) = ${h.frac("١", A(n))} (المقلوب).`, `${ev ? "١" : "−١"} + ${h.frac("١", A(n))} = ${ans}.`], explanation: ans };
      } },
      poly: { title: "التعويض في مقدار جبري", from: 2290, to: 2600, gen(R, h) {
        const A = h.A, x = R.pick([1, -1, 2, -2]), a = R.int(1, 3), b = R.int(1, 3), c = R.int(1, 9), d = R.int(1, 5), v = a * x ** 3 - b * x * x + c * x - d;
        const coef = (k, t) => `${k === 1 ? "" : A(k)}${t}`;
        return { style: "x" + x, sig: `${x}:${a}:${b}:${c}:${d}`, body: `إذا كان س = ${S(h, x)} ، أوجد ${coef(a, "س³")} − ${coef(b, "س²")} + ${coef(c, "س")} − ${A(d)}`,
          ...h.strOptions(R, S(h, v), [S(h, -v), S(h, a * Math.abs(x) ** 3 - b * x * x + c * Math.abs(x) - d) === S(h, v) ? S(h, v + 2) : S(h, a * Math.abs(x) ** 3 - b * x * x + c * Math.abs(x) - d), S(h, v - 2 * d), S(h, v + 1)]),
          steps: [`س³ = ${S(h, x ** 3)} ، س² = ${A(x * x)}.`, `${A(a)}(${S(h, x ** 3)}) − ${A(b)}(${A(x * x)}) + ${A(c)}(${S(h, x)}) − ${A(d)} = ${S(h, a * x ** 3)} − ${A(b * x * x)} ${c * x < 0 ? "− " + A(-c * x) : "+ " + A(c * x)} − ${A(d)}.`, `= ${S(h, v)}.`], explanation: S(h, v) };
      } }
    }
  };
})();
