// المحاضرة 14: الأسس المهمة وطرق حل المعادلة الأسية
(() => {
  const SUP = n => String(n).split("").map(x => "⁰¹²³⁴⁵⁶⁷⁸⁹"[x]).join("");
  const S = (h, x) => x < 0 ? `−${h.A(-x)}` : h.A(x);
  // أس متغير: «٣ أس (س + ١)»
  const pw = (b, e) => /^[٠-٩]+$/.test(e) ? `${b}${SUP([...e].map(c => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).join(""))}` : / /.test(e) || /^[٠-٩]/.test(e) ? `${b} أس (${e})` : `${b} أس ${e}`;
  const lin = (h, p, q, v = "س") => `${p === 1 ? "" : h.A(p)}${v}${q ? (q > 0 ? " + " : " − ") + h.A(Math.abs(q)) : ""}`;
  const POW = { 2: 8, 3: 5, 4: 4, 5: 4, 6: 3, 7: 3, 10: 4 };
  const sOpts = (h, R, v, w) => h.strOptions(R, S(h, v), w.map(x => S(h, x)));
  window.EXAMS[14] = {
    title: "اختبار محاكي: المعادلات الأسية", minutes: 25,
    blueprint: [["zero", 2], ["sameExp", 2], ["sameBase", 3], ["thenEval", 2], ["cube", 2], ["frac", 2], ["powK", 2], ["prod", 2], ["factor", 1], ["self", 1], ["diff", 1], ["even", 2], ["sym", 2]],
    skills: {
      zero: { title: "أي عدد أس صفر = ١", from: 190, to: 600, gen(R, h) {
        const A = h.A, b = R.int(2, 9), p = R.pick([1, 1, 2, 3]), q = R.int(-9, 9) * p; if (!q) return null; const v = -q / p;
        return { style: p === 1 ? "a" : "b", sig: `${b}:${p}:${q}`, body: `إذا كان ${pw(A(b), lin(h, p, q))} = ١ ، فما قيمة س؟`, ...sOpts(h, R, v, [-v, v + 1, 0, q]),
          steps: ["أي عدد (غير الصفر) أسه صفر يساوي ١ ، فالأس يجب أن يساوي صفرًا.", `${lin(h, p, q)} = صفر ، إذن س = ${S(h, v)}.`], explanation: S(h, v) };
      } },
      sameExp: { title: "الأسس متساوية والأساسات مختلفة ← الأس = صفر", from: 540, to: 680, gen(R, h) {
        const A = h.A, a = R.int(2, 9), b = R.int(2, 9), k = R.int(1, 7) * (R.next() < .5 ? 1 : -1), m = R.int(2, 9); if (a === b || m === k) return null;
        const x = -k, ask = R.next() < .5, d = x + m;
        if (!ask) return { style: "x", sig: `x${a}:${b}:${k}`, body: `إذا كان ${pw(A(a), lin(h, 1, k))} = ${pw(A(b), lin(h, 1, k))} ، فما قيمة س؟`, ...sOpts(h, R, x, [-x, 1, 0, a - b]),
          steps: ["الأسان متساويان والأساسان مختلفان، فلا تتحقق المساواة إلا إذا كان الأس صفرًا (الطرفان = ١).", `${lin(h, 1, k)} = صفر ، إذن س = ${S(h, x)}.`], explanation: S(h, x) };
        if (!d) return null; const ans = d === 1 ? "١" : d === -1 ? "−١" : `${d < 0 ? "−" : ""}${h.frac("١", A(Math.abs(d)))}`, w = v => v === 1 ? "١" : v === -1 ? "−١" : `${v < 0 ? "−" : ""}${h.frac("١", A(Math.abs(v)))}`;
        return { style: "e", sig: `e${a}:${b}:${k}:${m}`, body: `إذا كان ${pw(A(a), lin(h, 1, k))} = ${pw(A(b), lin(h, 1, k))} ، فما قيمة ${h.frac("١", lin(h, 1, m))} ؟`,
          ...h.strOptions(R, ans, [w(-d), w(m), w(d + 1) === ans ? w(d + 2) : w(d + 1), w(m - k) === ans ? "صفر" : w(m - k)]),
          steps: ["الأسان متساويان والأساسان مختلفان، فالأس = صفر.", `${lin(h, 1, k)} = صفر ، إذن س = ${S(h, x)}.`, `نعوّض: ${h.frac("١", `${S(h, x)} + ${A(m)}`)} = ${ans}.`], explanation: ans };
      } },
      sameBase: { title: "توحيد الأساسات ثم مساواة الأسس", from: 760, to: 910, gen(R, h) {
        const A = h.A, B = R.pick([2, 3, 4, 5, 9]), p = R.int(1, 3), x = R.int(-1, 4), q = R.int(-3, 3), e = p * x + q, N = B ** e; if (e < 1 || N > 70000) return null;
        return { style: `${p}`, sig: `${B}:${p}:${x}:${q}`, body: `إذا كان ${pw(A(B), lin(h, p, q))} = ${A(N)} ، فأوجد قيمة س`,
          ...sOpts(h, R, x, [x + 1, x - 1 || x + 2, e]),
          steps: [`نكتب الطرف الأيمن بالأساس نفسه: ${A(N)} = ${A(B)}${SUP(e)}.`, `الأساسات متساوية فالأسس متساوية: ${lin(h, p, q)} = ${A(e)}.`, p === 1 ? `س = ${A(e)} − (${S(h, q)}) = ${S(h, x)}.` : `${A(p)}س = ${S(h, e - q)} ، إذن س = ${S(h, x)}.`], explanation: S(h, x) };
      } },
      thenEval: { title: "إيجاد قيمة مقدار أسي بعد إيجاد س", from: 680, to: 790, gen(R, h) {
        const A = h.A, b = R.pick([2, 3, 5]), x = R.int(1, POW[b] - 1), k = R.int(1, 3), N = b ** x, v = b ** (x + k); if (x + k > POW[b] + 1) return null;
        return { style: "k" + k, sig: `${b}:${x}:${k}`, body: `إذا كان ${pw(A(b), "س")} = ${A(N)} ، فأوجد قيمة ${pw(A(b), `س + ${A(k)}`)}`,
          ...h.numOptions(R, h.d(v), [h.d(N + k), h.d(N * k), h.d(b ** (x + k + 1))]),
          steps: [`${A(N)} = ${A(b)}${SUP(x)} ، إذن س = ${A(x)}.`, `${pw(A(b), `س + ${A(k)}`)} = ${A(b)}${SUP(x + k)} = ${A(v)}.`, `أو مباشرة: ${pw(A(b), "س")} × ${A(b)}${SUP(k)} = ${A(N)} × ${A(b ** k)} = ${A(v)}.`], explanation: A(v) };
      } },
      cube: { title: "معادلة مكعب مقدار يساوي عددًا", from: 910, to: 1040, gen(R, h) {
        const A = h.A, r = R.pick([2, 3, 4, 5, 10, 20, 30]), a = R.int(1, 9), x = r - a, N = r ** 3, n = R.pick([2, 3]); if (n === 2) { if (r > 30) return null; }
        const M = r ** n;
        return { style: "n" + n, sig: `${r}:${a}:${n}`, body: `إذا كان ${h.frac("١", `(س + ${A(a)})${SUP(n)}`)} = ${h.frac("١", A(M))} ، فإن س = ؟`,
          ...sOpts(h, R, x, [r, r + a, M - a]),
          steps: [`المقامان متساويان: (س + ${A(a)})${SUP(n)} = ${A(M)}.`, `${A(M)} = ${A(r)}${SUP(n)} ، إذن س + ${A(a)} = ${A(r)}${n === 2 ? " (القيمة الموجبة)" : ""}.`, `س = ${S(h, x)}.`], explanation: S(h, x) };
      } },
      frac: { title: "أساس كسري", from: 1040, to: 1150, gen(R, h) {
        const A = h.A, [p, q] = R.pick([[2, 3], [3, 4], [2, 5], [3, 5], [1, 2], [1, 3]]), n = R.int(2, 3), k = R.int(1, 6), flip = R.next() < .4, x = (flip ? -n : n) - k;
        const top = flip ? q ** n : p ** n, bot = flip ? p ** n : q ** n;
        return { style: flip ? "f" : "n", sig: `${p}:${q}:${n}:${k}:${flip}`, body: `إذا كان ${pw(`(${h.frac(A(p), A(q))})`, `س + ${A(k)}`)} = ${h.frac(A(top), A(bot))} ، أوجد س`,
          ...sOpts(h, R, x, [n + k, (flip ? n : -n) - k, n]),
          steps: [`${h.frac(A(top), A(bot))} = (${h.frac(A(flip ? q : p), A(flip ? p : q))})${SUP(n)}${flip ? ` = (${h.frac(A(p), A(q))}) أس (−${A(n)})` : ""}.`, `نساوي الأسس: س + ${A(k)} = ${S(h, flip ? -n : n)}.`, `س = ${S(h, x)}.`], explanation: S(h, x) };
      } },
      powK: { title: "إذا كان أ^س = ب فإن أ^(ك س) = بᵏ", from: 1150, to: 1270, gen(R, h) {
        const A = h.A, a = R.int(2, 9), b = R.int(2, 7), k = R.int(2, 4); if (a === b || b ** k > 3000) return null; const v = b ** k;
        return { style: "k" + k, sig: `${a}:${b}:${k}`, body: `إذا كان ${pw(A(a), "س")} = ${A(b)} ، فإن ${pw(A(a), `${A(k)}س`)} = ؟`,
          ...h.numOptions(R, h.d(v), [h.d(b * k), h.d(a * k), h.d(b ** (k + 1))]),
          steps: [`${pw(A(a), `${A(k)}س`)} = (${pw(A(a), "س")})${SUP(k)}.`, `نعوّض: ${A(b)}${SUP(k)} = ${A(v)}.`], explanation: A(v) };
      } },
      prod: { title: "إيجاد مجهولين من معادلتين أسيتين", from: 1270, to: 1360, gen(R, h) {
        const A = h.A, a = R.int(2, 6), b = R.int(2, 6), x = R.int(2, POW[a] - 1), y = R.int(2, POW[b] - 1), op = R.pick(["×", "+", "−"]); if (a === b) return null;
        const v = op === "×" ? x * y : op === "+" ? x + y : x - y;
        return { style: op, sig: `${a}:${b}:${x}:${y}:${op}`, body: `إذا كان ${pw(A(a), "س")} = ${A(a ** x)} ، ${pw(A(b), "ص")} = ${A(b ** y)}\nفما ناتج س ${op} ص ؟`,
          ...sOpts(h, R, v, [op === "×" ? x + y : x * y, v + 1, v - 2]),
          steps: [`${A(a ** x)} = ${A(a)}${SUP(x)} ، إذن س = ${A(x)}.`, `${A(b ** y)} = ${A(b)}${SUP(y)} ، إذن ص = ${A(y)}.`, `س ${op} ص = ${S(h, v)}.`], explanation: S(h, v) };
      } },
      factor: { title: "التحليل لإيجاد عدد مربع", from: 1590, to: 1680, gen(R, h) {
        const A = h.A, f = R.pick([4, 9, 25, 16, 36]), r = Math.sqrt(f), m = R.int(11, 150), fx = r === 2 ? "٢ × ٢" : r === 3 ? "٣ × ٣" : r === 5 ? "٥ × ٥" : r === 4 ? "٤ × ٤" : "٦ × ٦";
        return { style: "f" + f, sig: `${f}:${m}`, body: `إذا كان ${A(f * m)} × ${A(m)} = ${fx} × ن² ، حيث ن موجب، أوجد ن`,
          ...h.numOptions(R, h.d(m), [h.d(m * r), h.d(m * f), h.d(r)]),
          steps: [`${A(f * m)} = ${A(f)} × ${A(m)} ، فالطرف الأيسر = ${fx} × ${A(m)} × ${A(m)}.`, `بالمقارنة: ن² = ${A(m)} × ${A(m)} ، إذن ن = ${A(m)}.`], explanation: A(m) };
      } },
      self: { title: "س أس س", from: 1680, to: 1750, gen(R, h) {
        const A = h.A, s = R.pick([2, 3, 4]), k = R.pick([0, 1]), N = s ** (s + k);
        return { style: "k" + k, sig: `${s}:${k}`, body: `إذا كان ${pw("س", "س")}${k ? " × س" : ""} = ${A(N)} ، فما قيمة س؟ (س عدد طبيعي)`,
          ...h.numOptions(R, h.d(s), [h.d(s + 1), h.d(s * s), h.d(N / s)]),
          steps: [k ? `س أس س × س = س أس (س + ١).` : "نبحث عن عدد إذا رُفع لنفسه أعطى العدد.", `${A(N)} = ${A(s)}${SUP(s + k)} = ${A(s)} أس (${A(s)}${k ? " + ١" : ""}).`, `إذن س = ${A(s)}.`], explanation: A(s) };
      } },
      diff: { title: "الفرق بين قوتين متساويتي الأس", from: 1750, to: 1870, gen(R, h) {
        const A = h.A, a = R.int(3, 9), b = a - R.int(1, 2), mode = R.pick([0, 1]), rhs = mode ? a - b : 0;
        return { style: "m" + mode, sig: `${a}:${b}:${mode}`, body: `إذا كان ${pw(A(a), "ك")} − ${pw(A(b), "ك")} = ${rhs ? A(rhs) : "صفر"} ، فإن قيمة ك = ؟`,
          ...h.strOptions(R, mode ? "١" : "صفر", mode ? ["صفر", "٢", A(a - b + 1) === "٢" ? "٣" : A(a - b + 1)] : ["١", "٢", "−١"]),
          steps: mode ? [`نجرّب ك = ١: ${A(a)} − ${A(b)} = ${A(a - b)} ✓.`, "الأس الذي يحقق المساواة هو ١."] : [`${pw(A(a), "ك")} = ${pw(A(b), "ك")} والأساسان مختلفان، فالأس = صفر.`, "تحقق: ١ − ١ = صفر."], explanation: mode ? "١" : "صفر" };
      } },
      even: { title: "الأس الزوجي يعطي قيمتين (±)", from: 1990, to: 2335, gen(R, h) {
        const A = h.A, r = R.int(2, 5), n = R.pick([2, 3, 4, 5, 6]), N = r ** n; if (N > 5000) return null; const ev = n % 2 === 0, cmp = R.next() < .45;
        if (cmp) { const opts = h.cmpAnswer(h.d(0), h.d(0)).options, corr = ev ? 3 : 2;
          return { style: "c" + ev, sig: `c${r}:${n}`, body: h.cmpBody(`إذا كان ${pw("س", A(n))} = ${A(N)}`, "س", A(r)), options: opts, correct: corr,
            steps: [ev ? `الأس زوجي، فإن س = ${A(r)} أو س = −${A(r)}.` : `الأس فردي، فإن س = ${A(r)} فقط.`, ev ? "قد تكون القيمتان متساويتين وقد تكون الأولى أصغر، إذن المعلومات غير كافية." : "إذن القيمتان متساويتان."], explanation: opts[corr] }; }
        const ans = ev ? `±${A(r)}` : A(r);
        return { style: "v" + ev, sig: `v${r}:${n}`, body: `إذا كان ${pw("س", A(n))} = ${A(N)} ، فإن قيمة س = ؟`,
          ...h.strOptions(R, ans, ev ? [A(r), `−${A(r)}`, `±${A(N / r)}`] : [`±${A(r)}`, `−${A(r)}`, A(N / r)]),
          steps: [`${A(N)} = ${A(r)}${SUP(n)}.`, ev ? `الأس زوجي، فإن س = ${A(r)} أو س = −${A(r)} ، أي ±${A(r)}.` : `الأس فردي، فإن س = ${A(r)} فقط.`], explanation: ans };
      } },
      sym: { title: "التعويض بقيمتين متعاكستين في الإشارة", from: 1360, to: 1480, gen(R, h) {
        const A = h.A, t = R.int(1, 5), c = R.int(-6, 6), n = R.pick([2, 2, 3, 4]), y1 = t ** n + c, y2 = (-t) ** n + c;
        const fx = `س${SUP(n)}${c ? (c > 0 ? " + " : " − ") + A(Math.abs(c)) : ""}`;
        return { style: "n" + n, sig: `${t}:${c}:${n}`, body: h.cmpBody(`إذا كانت ص = ${fx}`, `قيمة ص عندما س = ${A(t)}`, `قيمة ص عندما س = −${A(t)}`), ...h.cmpAnswer(h.d(y1 + 1000), h.d(y2 + 1000)),
          steps: [`عند س = ${A(t)}: ص = ${A(t ** n)}${c ? (c > 0 ? " + " : " − ") + A(Math.abs(c)) : ""} = ${S(h, y1)}.`, `عند س = −${A(t)}: (−${A(t)})${SUP(n)} = ${S(h, (-t) ** n)} ، فإن ص = ${S(h, y2)}.`, n % 2 === 0 ? "الأس زوجي فالإشارة تختفي والقيمتان متساويتان." : "الأس فردي فتبقى الإشارة السالبة، والقيمة الأولى أكبر."], explanation: n % 2 === 0 ? "القيمتان متساويتان" : "القيمة الأولى أكبر" };
      } }
    }
  };
})();
