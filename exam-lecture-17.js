// المحاضرة 17: الأس السالب ومقارنة القوى بتوحيد الأساس أو الأس
(() => {
  const SUP = n => (n < 0 ? "⁻" : "") + String(Math.abs(n)).split("").map(x => "⁰¹²³⁴⁵⁶⁷⁸⁹"[x]).join("");
  const P = (h, b, e) => e === 1 ? (typeof b === "number" ? h.A(b) : b) : `${typeof b === "number" ? h.A(b) : b}${SUP(e)}`;
  const S = (h, x) => x < 0 ? `−${h.A(-x)}` : h.A(x);
  const g = (a, b) => b ? g(b, a % b) : a;
  const F = (h, n, d) => { const k = g(Math.abs(n), Math.abs(d)); n /= k; d /= k; if (d < 0) { n = -n; d = -d; } return d === 1 ? S(h, n) : `${n < 0 ? "−" : ""}${h.frac(h.A(Math.abs(n)), h.A(d))}`; };
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  const cmpI = (h, x, y) => h.cmpAnswer(h.d(x), h.d(y));
  window.EXAMS[17] = {
    title: "اختبار محاكي: الأس السالب ومقارنة القوى", minutes: 25,
    blueprint: [["negVal", 2], ["recip", 1], ["ten", 3], ["eqCube", 1], ["negNeg", 1], ["sci", 2], ["sumNeg", 1], ["evenNeg", 2], ["negVar", 1], ["triple", 1], ["negBase", 1], ["recipRoot", 1], ["powCmp", 3], ["signCmp", 1], ["facCmp", 1], ["fracExp", 1], ["mixCmp", 1]],
    skills: {
      negVal: { title: "الأس السالب يقلب العدد", from: 0, to: 120, gen(R, h) {
        const A = h.A, frac = R.next() < .45;
        if (frac) { const [p, q] = R.pick([[2, 3], [3, 5], [2, 5], [3, 4], [1, 2], [1, 3], [4, 5]]), n = R.int(1, 3), ans = F(h, q ** n, p ** n);
          return { style: "f", sig: `f${p}:${q}:${n}`, body: `ما قيمة (${h.frac(A(p), A(q))})${SUP(-n)} ؟`, ...h.strOptions(R, ans, [F(h, p ** n, q ** n) === ans ? F(h, q ** n + 1, p ** n) : F(h, p ** n, q ** n), `−${F(h, q ** n, p ** n)}`, F(h, q * n, p * n) === ans ? F(h, q ** n, p ** n + 1) : F(h, q * n, p * n)]),
            steps: ["الأس السالب يقلب الكسر ويصبح الأس موجبًا.", `(${h.frac(A(p), A(q))})${SUP(-n)} = ${n > 1 ? `(${h.frac(A(q), A(p))})${SUP(n)} = ` : ""}${ans}.`], explanation: ans }; }
        const a = R.int(2, 10), n = R.int(1, 5); if (a ** n > 10000) return null; const ans = F(h, 1, a ** n);
        return { style: "i", sig: `i${a}:${n}`, body: `ما قيمة ${P(h, a, -n)} ؟`, ...h.strOptions(R, ans, [`−${A(a ** n)}`, A(a ** n), F(h, 1, a * n) === ans ? `−${ans}` : F(h, 1, a * n)]),
          steps: ["الأس السالب لا يجعل العدد سالبًا، بل يقلبه.", `${P(h, a, -n)} = ${h.frac("١", P(h, a, n))} = ${ans}.`], explanation: ans };
      } },
      recip: { title: "مقلوب قوة سالبة", from: 40, to: 120, gen(R, h) {
        const A = h.A, a = R.int(2, 9), n = R.int(2, 5), v = a ** n; if (v > 10000) return null;
        return { style: "r", sig: `${a}:${n}`, body: `ما قيمة ${h.frac("١", P(h, a, -n))} ؟`, ...h.strOptions(R, A(v), [F(h, 1, v), `−${A(v)}`, A(a * n)]),
          steps: ["العدد ذو الأس السالب في المقام ينتقل إلى البسط بأس موجب.", `${h.frac("١", P(h, a, -n))} = ${P(h, a, n)} = ${A(v)}.`], explanation: A(v) };
      } },
      ten: { title: "عمليات على قوى العشرة السالبة", from: 120, to: 240, gen(R, h) {
        const a = R.int(1, 12), b = R.int(1, 12), mode = R.pick(["mul", "div", "rdiv"]);
        const e = mode === "mul" ? b - a : mode === "div" ? b - a : a - b;
        const body = mode === "mul" ? `${P(h, 10, -a)} × (${h.frac("١", h.A(10))})${SUP(-b)}` : mode === "div" ? h.frac(P(h, 10, -a), P(h, 10, -b)) : `${h.frac("١", P(h, 10, -a))} ÷ ${h.frac("١", P(h, 10, -b))}`;
        const ans = P(h, 10, e);
        return { style: mode, sig: `${mode}${a}:${b}`, body: `ما قيمة ${body} ؟`, ...h.strOptions(R, ans, [P(h, 10, -e === e ? e + 1 : -e), P(h, 10, -(a + b)), P(h, 10, a + b === e ? e + 2 : a + b)]),
          steps: mode === "mul" ? [`(${h.frac("١", "١٠")})${SUP(-b)} = ${P(h, 10, b)}.`, `${P(h, 10, -a)} × ${P(h, 10, b)} = ١٠ أس (−${h.A(a)} + ${h.A(b)}) = ${ans}.`]
            : mode === "div" ? ["عند القسمة نطرح الأسس.", `(−${h.A(a)}) − (−${h.A(b)}) = ${S(h, e)} ، الناتج ${ans}.`]
              : [`${h.frac("١", P(h, 10, -a))} = ${P(h, 10, a)} ، و ${h.frac("١", P(h, 10, -b))} = ${P(h, 10, b)}.`, `${P(h, 10, a)} ÷ ${P(h, 10, b)} = ${ans}.`], explanation: ans };
      } },
      eqCube: { title: "معادلة فيها أسس سالبة", from: 240, to: 400, gen(R, h) {
        const A = h.A, s = R.int(2, 4), n = R.pick([2, 3]), t = s ** n, p = R.pick([2, 3, 4, 5]), r = R.pick([1, 2, 3, 4].filter(x => (t * p) % x === 0 && t * p / x > 1)), q = t * p / r; if (!r || q > 99) return null;
        return { style: "n" + n, sig: `${s}:${n}:${p}:${r}`, body: `إذا كانت ${P(h, "س", n)} = ${h.frac(P(h, p, -1), P(h, q, -1))} × ${A(r)} ، حيث س موجبة، أوجد قيمة س`, ...h.numOptions(R, h.d(s), [h.d(t), h.d(s + 1), h.d(q)]),
          steps: [`${h.frac(P(h, p, -1), P(h, q, -1))} = ${h.frac(A(q), A(p))} (كل منهما ينقلب).`, `${P(h, "س", n)} = ${h.frac(A(q), A(p))} × ${A(r)} = ${A(t)}.`, `س = ${A(s)}.`], explanation: A(s) };
      } },
      negNeg: { title: "قوة سالبة لقوة سالبة", from: 400, to: 430, gen(R, h) {
        const A = h.A, a = R.int(2, 6), m = R.int(1, 4), n = R.int(1, 2), neg = R.next() < .4, v = a ** (m * n); if (v > 5000) return null;
        const base = neg ? `(−${A(a)})` : A(a), val = neg && (m * n) % 2 ? -v : v;
        return { style: "n" + neg, sig: `${a}:${m}:${n}:${neg}`, body: `ما قيمة (${P(h, base, -m)})${SUP(-n)} ؟`, ...h.strOptions(R, S(h, val), [S(h, -val), F(h, 1, val), F(h, -1, val)]),
          steps: ["نضرب الأسس: سالب × سالب = موجب.", `(−${A(m)}) × (−${A(n)}) = ${A(m * n)} ، الناتج ${P(h, base, m * n)} = ${S(h, val)}.`], explanation: S(h, val) };
      } },
      sci: { title: "القسمة على قوى العشرة السالبة", from: 430, to: 870, gen(R, h) {
        const mode = R.pick(["val", "exp"]);
        if (mode === "exp") { const k = R.int(11, 99), s = R.int(1, 2), n = R.int(1, 4), big = h.shift(h.d(k), s), small = h.shift(big, n);
          return { style: "e", sig: `e${k}:${s}:${n}`, body: `إذا كان ${h.fx(small)} = ${h.fx(big)} × ١٠ أس ن ، أوجد قيمة ن`, ...h.strOptions(R, S(h, -n), [S(h, n), S(h, -n - 1), S(h, -n + 1 || n + 1)]),
            steps: [`١٠ أس ن = ${h.frac(h.fx(small), h.fx(big))}.`, `انتقلت الفاصلة ${h.A(n)} منازل إلى اليسار، أي قسمة على ${h.A(10 ** n)}.`, `${h.frac("١", h.A(10 ** n))} = ${P(h, 10, -n)} ، إذن ن = ${S(h, -n)}.`], explanation: S(h, -n) }; }
        const c = R.int(1, 9), k = R.pick([1, 2, 3, 4, 5]), m = R.int(3, 8), s = R.int(1, m), num = h.shift(h.d(c * k), s), v = h.shift(h.d(c), s - m); if (v.s > 0) return null;
        return { style: "v", sig: `v${c}:${k}:${m}:${s}`, body: `ما قيمة ${h.frac(h.fx(num), `${h.A(k)} × ${P(h, 10, -m)}`)} ؟`, ...h.numOptions(R, v, [h.shift(v, 1), h.shift(v, -1), h.d(c * k)]),
          steps: [`${P(h, 10, -m)} في المقام تنتقل إلى البسط: ${h.fx(num)} × ${P(h, 10, m)} ÷ ${h.A(k)}.`, `${h.fx(num)} × ${h.A(10 ** m)} = ${h.fx(h.shift(h.d(c * k), s - m))}.`, `÷ ${h.A(k)} = ${h.fx(v)}.`], explanation: h.fx(v) };
      } },
      sumNeg: { title: "مجموع حدود فيها أسس سالبة", from: 870, to: 1000, gen(R, h) {
        const A = h.A, a = R.pick([2, 4, 5, 10, 20, 25]), v = h.add(h.d(2 * a), h.div(h.d(2), h.d(a)));
        return { style: "a" + a, sig: `${a}`, body: `ما قيمة المقدار ${A(a)} + ${P(h, a, -1)} + ${h.frac("١", A(a))} + ${h.frac("١", P(h, a, -1))} ؟`,
          ...h.numOptions(R, v, [h.d(2 * a), h.add(h.d(a), h.div(h.d(1), h.d(a))), h.add(v, h.d(1))]),
          steps: [`${P(h, a, -1)} = ${h.frac("١", A(a))} ، و ${h.frac("١", P(h, a, -1))} = ${A(a)}.`, `المقدار = ${A(a)} + ${h.frac("١", A(a))} + ${h.frac("١", A(a))} + ${A(a)} = ${A(2 * a)} + ${h.frac("٢", A(a))}.`, `= ${h.fx(v)}.`], explanation: h.fx(v) };
      } },
      evenNeg: { title: "حل معادلة بأس سالب", from: 1000, to: 1310, gen(R, h) {
        const A = h.A, mode = R.pick(["val", "val", "cmp"]);
        if (mode === "cmp") { const a = R.int(2, 9), n = R.pick([3, 5]), c = R.int(2, 9); const x = 1 / a, y = 1 / c;
          return { style: "c", sig: `c${a}:${n}:${c}`, body: h.cmpBody(`إذا كان ${P(h, "س", n)} = ${P(h, a, -n)}`, "س", h.frac("١", A(c))), ...h.cmpAnswer(h.d(c), h.d(a)),
            steps: [`الأسان متساويان والأس فردي: س = ${P(h, a, -1)} = ${h.frac("١", A(a))}.`, `نقارن ${h.frac("١", A(a))} مع ${h.frac("١", A(c))}: الكسر ذو المقام الأصغر أكبر.`, `إذن ${rel(x, y)}.`], explanation: rel(x, y) }; }
        const r = R.int(2, 4), k = R.pick([2, 4]), m = R.int(1, 3), a = r ** m, e = k * m, base = R.next() < .5;
        const rhs = base ? P(h, r, -e) : P(h, a, -k), ans = F(h, 1, a);
        return { style: "v" + base, sig: `${r}:${k}:${m}:${base}`, body: `إذا كان ${P(h, "س", k)} = ${rhs} ، حيث س موجبة، أوجد قيمة س`, ...h.strOptions(R, ans, [A(a), F(h, 1, a * a), F(h, 1, a * 2)]),
          steps: [base ? `${rhs} = (${P(h, r, -m)})${SUP(k)} ، فالأسان متساويان.` : "الأسان متساويان فالأساسان متساويان.", `س = ${base ? P(h, r, -m) : P(h, a, -1)} = ${ans}.`], explanation: ans };
      } },
      negVar: { title: "تبسيط مقدار جبري بأس سالب", from: 1310, to: 1350, gen(R, h) {
        const A = h.A, k = R.int(2, 9), neg = R.next() < .5, ans = `${neg ? "−" : ""}${h.frac(A(k), "س")}`;
        return { style: "n" + neg, sig: `${k}:${neg}`, body: `المقدار ${neg ? "−" : ""}(${h.frac("١", A(k))} س)${SUP(-1)} بعد التبسيط هو:`,
          ...h.strOptions(R, ans, [`${neg ? "−" : ""}${h.frac("س", A(k))}`, `${neg ? "" : "−"}${h.frac(A(k), "س")}`, `${neg ? "" : "−"}${h.frac("س", A(k))}`]),
          steps: [`الأس −١ يقلب ما داخل القوس: (${h.frac("س", A(k))})${SUP(-1)} = ${h.frac(A(k), "س")}.`, neg ? "الإشارة السالبة خارج القوس تبقى كما هي." : "", `الناتج ${ans}.`].filter(Boolean), explanation: ans };
      } },
      triple: { title: "حاصل ضرب قوى بأسس سالبة", from: 1390, to: 1500, gen(R, h) {
        const A = h.A, a = R.pick([2, 3, 5, 10]), b = R.pick([3, 7, 11, 13]), n = R.int(2, 4), extra = R.int(0, 1), v = a ** extra;
        return { style: "x" + extra, sig: `${a}:${b}:${n}:${extra}`, body: `قيمة المقدار ${P(h, a, n + extra)} × (${h.frac(A(a), A(b))})${SUP(-n)} × (${h.frac("١", A(b))})${SUP(n)}`,
          ...h.numOptions(R, h.d(v), [h.d(b), h.d(a * b), h.d(v === 1 ? 0 : 1)]),
          steps: [`(${h.frac(A(a), A(b))})${SUP(-n)} = ${h.frac(P(h, b, n), P(h, a, n))}.`, `${P(h, a, n + extra)} × ${h.frac(P(h, b, n), P(h, a, n))} × ${h.frac("١", P(h, b, n))}: تختصر ${P(h, a, n)} و ${P(h, b, n)}.`, `الناتج = ${A(v)}.`], explanation: A(v) };
      } },
      negBase: { title: "قسمة قوى أساسها سالب", from: 1680, to: 1720, gen(R, h) {
        const A = h.A, a = R.int(2, 3), m = R.int(1, 4), n = R.int(1, 3), e = m + n, v = (-a) ** e; if (Math.abs(v) > 3000) return null;
        return { style: "e" + (e % 2), sig: `${a}:${m}:${n}`, body: `ما قيمة ${h.frac(`(−${A(a)})${SUP(m)}`, `(−${A(a)})${SUP(-n)}`)} ؟`, ...h.strOptions(R, S(h, v), [S(h, -v), S(h, (-a) ** Math.abs(m - n) === v ? -v * a : (-a) ** Math.abs(m - n)), F(h, 1, v)]),
          steps: ["نطرح الأسس: الأس = " + `${A(m)} − (−${A(n)}) = ${A(e)}.`, `(−${A(a)})${SUP(e)} = ${S(h, v)} (${e % 2 ? "الأس فردي فالناتج سالب" : "الأس زوجي فالناتج موجب"}).`], explanation: S(h, v) };
      } },
      recipRoot: { title: "س أس −١ يساوي كسرًا جذريًا", from: 1720, to: 1800, gen(R, h) {
        const A = h.A, m = R.pick([2, 3, 5, 6]), k = R.int(1, 4), b = m * k, ans = k === 1 ? h.rad(1, m) : h.rad(k, m);
        return { style: "r", sig: `${m}:${k}`, body: `إذا كان ${P(h, "س", -1)} = ${h.frac(h.rad(1, m), A(b))} ، فإن س = ؟`, ...h.strOptions(R, ans, [h.rad(b, m), h.rad(k + 1, m), h.frac(h.rad(1, m), A(b))]),
          steps: [`س هو مقلوب الكسر: س = ${h.frac(A(b), h.rad(1, m))}.`, `نضرب في ${h.rad(1, m)}: ${h.frac(h.rad(b, m), A(m))} = ${ans}.`], explanation: ans };
      } },
      powCmp: { title: "المقارنة بتوحيد الأساسات أو الأسس", from: 1990, to: 2290, gen(R, h) {
        const A = h.A, mode = R.pick(["base", "exp", "frac"]);
        if (mode === "base") { const b = R.pick([2, 3]), k = R.pick([2, 3]), B = b ** k, m = R.int(5, 40), n = k * m + R.int(-3, 3);
          return { style: "b", sig: `b${b}:${k}:${m}:${n}`, body: h.cmpBody("", P(h, b, n), P(h, B, m)), ...cmpI(h, n, k * m),
            steps: [`نوحّد الأساسات: ${A(B)} = ${P(h, b, k)} ، إذن ${P(h, B, m)} = ${P(h, b, k * m)}.`, `نقارن الأسس: ${A(n)} و ${A(k * m)}.`, `إذن ${rel(n, k * m)}.`], explanation: rel(n, k * m) }; }
        if (mode === "exp") { const [a, p, b, q] = R.pick([[2, 4, 3, 3], [2, 3, 3, 2], [3, 2, 2, 3], [2, 5, 3, 3], [5, 2, 3, 3]]), t = R.int(5, 30), x = a ** p, y = b ** q;
          return { style: "e", sig: `e${a}:${p}:${b}:${q}:${t}`, body: h.cmpBody("", P(h, a, p * t), P(h, b, q * t)), ...cmpI(h, x, y),
            steps: [`نوحّد الأسس: ${P(h, a, p * t)} = (${P(h, a, p)})${SUP(t)} = ${P(h, x, t)} ، و ${P(h, b, q * t)} = ${P(h, y, t)}.`, `الأسان متساويان، فنقارن الأساسين ${A(x)} و ${A(y)}.`, `إذن ${rel(x, y)}.`], explanation: rel(x, y) }; }
        const n = R.int(10, 40), m = R.int(5, 20), x = n - 1, y = 2 * m - 2;
        return { style: "f", sig: `f${n}:${m}`, body: h.cmpBody("", `نصف ${P(h, 2, n)}`, `ربع ${P(h, 4, m)}`), ...cmpI(h, x, y),
          steps: [`نصف ${P(h, 2, n)} = ${P(h, 2, n)} ÷ ٢ = ${P(h, 2, x)}.`, `ربع ${P(h, 4, m)} = ${P(h, 4, m - 1)} = ${P(h, 2, y)}.`, `إذن ${rel(x, y)}.`], explanation: rel(x, y) };
      } },
      signCmp: { title: "مقارنة قوى (−س) عندما س ≠ صفر", from: 1800, to: 1990, gen(R, h) {
        const A = h.A, ev = R.pick([2, 4, 6]), od = R.pick([3, 5, 7, 9]), k = R.int(2, 10);
        return { style: "s", sig: `${ev}:${od}:${k}`, body: h.cmpBody("إذا كانت س ≠ صفر", `(−س)${SUP(ev)}`, `${A(k)} × (−س)${SUP(od)}`), options: h.cmpAnswer(h.d(0), h.d(0)).options, correct: 3,
          steps: [`نجرّب س = ١: الأولى = ١ ، الثانية = ${A(k)} × (−١) = −${A(k)} ، فالأولى أكبر.`, `نجرّب س = −١: الأولى = ١ ، الثانية = ${A(k)} × ١ = ${A(k)} ، فالثانية أكبر.`, "النتيجة تغيّرت، إذن المعلومات غير كافية."], explanation: "المعلومات غير كافية" };
      } },
      facCmp: { title: "المقارنة بإخراج العامل المشترك", from: 2290, to: 2380, gen(R, h) {
        const A = h.A, b = R.pick([2, 3, 5]), n = R.int(3, 9), d = R.int(1, 3), k = b ** d + R.int(-3, 6), x = b ** d;
        if (k < 2) return null;
        return { style: "c", sig: `${b}:${n}:${d}:${k}`, body: h.cmpBody("", P(h, b, n + d), `${P(h, b, n)} × ${A(k)}`), ...cmpI(h, x, k),
          steps: [`${P(h, b, n + d)} = ${P(h, b, n)} × ${d > 1 ? `${P(h, b, d)} = ${P(h, b, n)} × ` : ""}${A(x)}.`, `العامل ${P(h, b, n)} مشترك، فنقارن ${A(x)} مع ${A(k)}.`, `إذن ${rel(x, k)}.`], explanation: rel(x, k) };
      } },
      fracExp: { title: "معادلة أسها كسر", from: 2380, to: 2440, gen(R, h) {
        const A = h.A, b = R.int(2, 9), d = R.pick([2, 3]), k = R.int(1, 3), N = b ** k, x = d * k; if (N > 800) return null;
        return { style: "d" + d, sig: `${b}:${d}:${k}`, body: `إذا كان ${A(b)} أس (${h.frac("س", A(d))}) = ${A(N)} ، أوجد قيمة س`, ...h.numOptions(R, h.d(x), [h.d(k), h.d(x + d), h.d(N)]),
          steps: [`${A(N)} = ${P(h, b, k)}.`, `${h.frac("س", A(d))} = ${A(k)} ، إذن س = ${A(x)}.`], explanation: A(x) };
      } },
      mixCmp: { title: "تبسيط حاصل ضرب قوى موجبة وسالبة ثم المقارنة", from: 1600, to: 1680, gen(R, h) {
        const A = h.A, a = R.int(2, 4), b = R.int(3, 5), m = R.int(4, 7), n = R.int(1, m - 1), e = m - n, v = (a * b) ** e, k = R.int(5, 13), w = 2 ** k; if (a === b || v > 5000) return null;
        return { style: "m", sig: `${a}:${b}:${m}:${n}:${k}`, body: h.cmpBody("", P(h, 2, k), `${P(h, a, m)} × ${P(h, b, m)} × ${P(h, a, -n)} × ${P(h, b, -n)}`), ...cmpI(h, w, v),
          steps: [`القيمة الثانية = ${P(h, a, e)} × ${P(h, b, e)} = ${P(h, a * b, e)} = ${A(v)}.`, `القيمة الأولى = ${A(w)}.`, `إذن ${rel(w, v)}.`], explanation: rel(w, v) };
      } }
    }
  };
})();
