// المحاضرة 12: المقارنة بين الجذور (التربيع والقيم التقريبية)، الجذور التكعيبية، جذر العدد العشري
(() => {
  const NS = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15];
  const SUP = n => String(n).split("").map(x => "⁰¹²³⁴⁵⁶⁷⁸⁹"[x]).join("");
  const T = { 2: "1.4", 3: "1.7", 5: "2.2", 6: "2.4", 7: "2.6", 8: "2.8" };
  const ap = (h, x) => h.fx(h.d(x.toFixed(1)));
  // مقارنة عددين حقيقيين (بعد التقريب بست منازل)
  const cmpR = (h, x, y) => h.cmpAnswer(h.d(Math.round(x * 1e6)), h.d(Math.round(y * 1e6)));
  const rel = (x, y) => x > y + 1e-9 ? "القيمة الأولى أكبر" : x < y - 1e-9 ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  window.EXAMS[12] = {
    title: "اختبار محاكي: المقارنة بين الجذور والجذور التكعيبية وجذر العدد العشري", minutes: 25,
    blueprint: [["sq", 3], ["big", 2], ["pow", 2], ["approx", 2], ["sumCmp", 3], ["intCmp", 2], ["mix", 2], ["diff", 2], ["cube", 2], ["decSq", 2], ["decCube", 1], ["cubeSq", 1]],
    skills: {
      sq: { title: "المقارنة بالتربيع (جذور منفردة أو مضروبة)", from: 0, to: 200, gen(R, h) {
        const A = h.A, a = R.int(2, 12), c = R.int(2, 12), b = R.pick(NS), d = R.pick(NS); if (a === c || b === d) return null;
        const x = a * a * b, y = c * c * d; if (Math.max(x, y) / Math.min(x, y) > 1.7) return null;
        return { style: x > y ? "g" : "l", sig: `${a}:${b}:${c}:${d}`, body: h.cmpBody("", h.rad(a, b), h.rad(c, d)), ...cmpR(h, x, y),
          steps: ["الجذور مضروبة في أعداد، فنربّع القيمتين مع ترك الإشارات كما هي.", `(${h.rad(a, b)})² = ${A(a * a)} × ${A(b)} = ${A(x)} ، و (${h.rad(c, d)})² = ${A(c * c)} × ${A(d)} = ${A(y)}.`, `${A(x)} ${x > y ? ">" : "<"} ${A(y)} ، إذن ${rel(x, y)}.`], explanation: rel(x, y) };
      } },
      big: { title: "مقارنة جذر عدد كبير بعدد صحيح", from: 200, to: 280, gen(R, h) {
        const A = h.A, k = R.pick([R.int(15, 99), R.int(10, 30) * 10]), r = R.int(1, Math.max(2, k)) * (R.next() < .5 ? -1 : 1), N = k * k + r; if (N < 2) return null;
        const sw = R.next() < .5, f = sw ? A(k) : h.rad(1, N), s = sw ? h.rad(1, N) : A(k), x = sw ? k * k : N, y = sw ? N : k * k;
        return { style: sw ? "s" : "n", sig: `${N}:${k}`, body: h.cmpBody("", f, s), ...cmpR(h, x, y),
          steps: ["نربّع القيمتين للتخلص من الجذر.", `${A(k)}² = ${A(k * k)} ، و (${h.rad(1, N)})² = ${A(N)}.`, `${A(x)} ${x > y ? ">" : "<"} ${A(y)} ، إذن ${rel(x, y)}.`], explanation: rel(x, y) };
      } },
      pow: { title: "مقارنة قوى كسور جذرية", from: 280, to: 420, gen(R, h) {
        const A = h.A, a = R.int(2, 6), b = R.int(2, 6), m = R.pick([2, 4, 6]), n = R.pick([2, 4, 6]), da = a ** (m / 2), db = b ** (n / 2); if (da > 250 || db > 250 || (a === b && m === n)) return null;
        const f = `(${h.frac("١", h.rad(1, a))})${SUP(m)}`, s = `(${h.frac("١", h.rad(1, b))})${SUP(n)}`;
        return { style: da === db ? "e" : "n", sig: `${a}:${m}:${b}:${n}`, body: h.cmpBody("", f, s), ...cmpR(h, 1 / da, 1 / db),
          steps: [`(${h.rad(1, a)})² = ${A(a)} ، فالقيمة الأولى = ${h.frac("١", A(da))}.`, `والقيمة الثانية = ${h.frac("١", A(db))}.`, da === db ? "الكسران متساويان." : `الكسران بسطهما واحد، فالأكبر صاحب المقام الأصغر: ${rel(1 / da, 1 / db)}.`], explanation: rel(1 / da, 1 / db) };
      } },
      approx: { title: "القيم التقريبية للجذور المهمة", from: 480, to: 600, gen(R, h) {
        const ks = Object.keys(T).map(Number), a = R.pick(ks), b = R.pick(ks), mode = R.pick(["sum", "int", "coef"]);
        let body, val, steps, sig;
        if (mode === "sum") { if (a >= b) return null; val = h.add(h.d(T[a]), h.d(T[b])); body = `${h.rad(1, a)} + ${h.rad(1, b)}`; sig = `s${a}:${b}`;
          steps = [`${h.rad(1, a)} ≈ ${h.fx(h.d(T[a]))} ، و ${h.rad(1, b)} ≈ ${h.fx(h.d(T[b]))}.`, `المجموع ≈ ${h.fx(val)}.`]; }
        else if (mode === "int") { const k = R.int(1, 9); val = h.add(h.d(k), h.d(T[a])); body = `${h.A(k)} + ${h.rad(1, a)}`; sig = `i${k}:${a}`;
          steps = [`${h.rad(1, a)} ≈ ${h.fx(h.d(T[a]))}.`, `${h.A(k)} + ${h.fx(h.d(T[a]))} = ${h.fx(val)}.`]; }
        else { const k = R.int(2, 5); val = h.mul(h.d(k), h.d(T[a])); body = h.rad(k, a); sig = `c${k}:${a}`;
          steps = [`${h.rad(1, a)} ≈ ${h.fx(h.d(T[a]))}.`, `${h.A(k)} × ${h.fx(h.d(T[a]))} = ${h.fx(val)}.`]; }
        return { style: mode, sig, body: `ما القيمة التقريبية للمقدار ${body} ؟`, ...h.numOptions(R, val, [h.add(val, h.d("0.3")), h.sub(val, h.d("0.3")), h.add(val, h.d("1"))]),
          steps: ["نستخدم القيم التقريبية: √٢ ≈ ١,٤ ، √٣ ≈ ١,٧ ، √٥ ≈ ٢,٢ ، √٦ ≈ ٢,٤ ، √٧ ≈ ٢,٦ ، √٨ ≈ ٢,٨.", ...steps], explanation: h.fx(val) };
      } },
      sumCmp: { title: "المقارنة عند جمع الجذور (التقريب)", from: 600, to: 900, gen(R, h) {
        const A = h.A, a = R.int(2, 80), b = R.int(2, 80); if (Number.isInteger(Math.sqrt(a)) && Number.isInteger(Math.sqrt(b))) return null;
        const x = Math.sqrt(a) + Math.sqrt(b), mode = R.pick(["root", "int"]);
        if (mode === "int") { const k = Math.round(x) + R.pick([-1, 1]); if (k < 2 || Math.abs(x - k) < .3) return null;
          return { style: "i", sig: `i${a}:${b}:${k}`, body: h.cmpBody("", `${h.rad(1, a)} + ${h.rad(1, b)}`, h.rad(1, k * k)), ...cmpR(h, x, k),
            steps: ["الجذور مجموعة، فنستخدم القيم التقريبية بدل التربيع.", `${h.rad(1, a)} ≈ ${ap(h, Math.sqrt(a))} ، و ${h.rad(1, b)} ≈ ${ap(h, Math.sqrt(b))} ، فالمجموع ≈ ${ap(h, x)}.`, `${h.rad(1, k * k)} = ${A(k)} ، إذن ${rel(x, k)}.`], explanation: rel(x, k) }; }
        const c = Math.round(x * x) + R.int(-25, 25), y = Math.sqrt(c); if (c < 2 || Math.abs(x - y) < .3 || Number.isInteger(y)) return null;
        return { style: "r", sig: `r${a}:${b}:${c}`, body: h.cmpBody("", `${h.rad(1, a)} + ${h.rad(1, b)}`, h.rad(1, c)), ...cmpR(h, x, y),
          steps: ["الجذور مجموعة، فنقرّب كل جذر إلى أقرب مربع كامل.", `${h.rad(1, a)} ≈ ${ap(h, Math.sqrt(a))} ، و ${h.rad(1, b)} ≈ ${ap(h, Math.sqrt(b))} ، فالمجموع ≈ ${ap(h, x)}.`, `${h.rad(1, c)} ≈ ${ap(h, y)} ، إذن ${rel(x, y)}.`], explanation: rel(x, y) };
      } },
      intCmp: { title: "مقارنة عدد بمجموع جذور", from: 900, to: 1020, gen(R, h) {
        const A = h.A, mode = R.pick(["nn", "ab"]);
        if (mode === "nn") { const n = R.int(5, 150), x = n, y = 2 * Math.sqrt(n);
          return { style: "n", sig: `n${n}`, body: h.cmpBody("", A(n), `${h.rad(1, n)} + ${h.rad(1, n)}`), ...cmpR(h, x, y),
            steps: [`${h.rad(1, n)} + ${h.rad(1, n)} = ${h.rad(2, n)}.`, `${h.rad(1, n)} ≈ ${ap(h, Math.sqrt(n))} ، فالقيمة الثانية ≈ ${ap(h, y)}.`, `إذن ${rel(x, y)}.`], explanation: rel(x, y) }; }
        const k = R.int(6, 25), sq = k * k + R.int(-k, k), a = R.int(1, sq - 1), b = sq - a, y = Math.sqrt(sq); if (sq === k * k) return null;
        return { style: "a", sig: `a${k}:${a}:${b}`, body: h.cmpBody("", A(k), h.rad(1, `${A(a)} + ${A(b)}`)), ...cmpR(h, k, y),
          steps: [`نجمع ما تحت الجذر أولًا: ${A(a)} + ${A(b)} = ${A(sq)}.`, `نربّع القيمتين: ${A(k)}² = ${A(k * k)} مقابل ${A(sq)}.`, `إذن ${rel(k, y)}.`], explanation: rel(k, y) };
      } },
      mix: { title: "مقارنة عدد + جذر", from: 1020, to: 1230, gen(R, h) {
        const A = h.A, p = R.int(2, 9), q = R.int(2, 9); if (p === q || Number.isInteger(Math.sqrt(p)) && Number.isInteger(Math.sqrt(q))) return null;
        const x = p + Math.sqrt(q), y = q + Math.sqrt(p);
        return { style: p < q ? "a" : "b", sig: `${p}:${q}`, body: h.cmpBody("", `${A(p)} + ${h.rad(1, q)}`, `${A(q)} + ${h.rad(1, p)}`), ...cmpR(h, x, y),
          steps: ["نعوّض بالقيم التقريبية للجذور.", `القيمة الأولى ≈ ${A(p)} + ${ap(h, Math.sqrt(q))} = ${ap(h, x)} ، والثانية ≈ ${A(q)} + ${ap(h, Math.sqrt(p))} = ${ap(h, y)}.`, `إذن ${rel(x, y)} (العدد الصحيح الأكبر خارج الجذر هو الذي يرجّح).`], explanation: rel(x, y) };
      } },
      diff: { title: "جذر الفرق والفرق بين الجذرين", from: 1300, to: 1540, gen(R, h) {
        const A = h.A, m = R.pick([2, 3, 5, 6, 7]), p = R.int(2, 5), q = R.int(1, p - 1), a = p * p * m, b = q * q * m, plus = R.next() < .4;
        const x = plus ? Math.sqrt(a) + Math.sqrt(b) : Math.sqrt(a) - Math.sqrt(b), y = Math.sqrt(plus ? a + b : a - b), sw = R.next() < .5;
        const f = `${h.rad(1, a)} ${plus ? "+" : "−"} ${h.rad(1, b)}`, s = h.rad(1, `${A(a)} ${plus ? "+" : "−"} ${A(b)}`);
        return { style: (plus ? "p" : "m") + sw, sig: `${a}:${b}:${plus}:${sw}`, body: h.cmpBody("", sw ? s : f, sw ? f : s), ...cmpR(h, sw ? y : x, sw ? x : y),
          steps: [`${h.rad(1, a)} ${plus ? "+" : "−"} ${h.rad(1, b)} = ${h.rad(p, m)} ${plus ? "+" : "−"} ${h.radS(q, m)} = ${h.radS(plus ? p + q : p - q, m)} ≈ ${ap(h, x)}.`, `${h.rad(1, `${A(a)} ${plus ? "+" : "−"} ${A(b)}`)} = ${h.rad(1, plus ? a + b : a - b)} ≈ ${ap(h, y)}.`, `إذن ${rel(sw ? y : x, sw ? x : y)}. (تذكّر: جذر المجموع أصغر من مجموع الجذرين، وجذر الفرق أكبر من فرق الجذرين).`], explanation: rel(sw ? y : x, sw ? x : y) };
      } },
      cube: { title: "الجذور التكعيبية المهمة", from: 1560, to: 1740, gen(R, h) {
        const A = h.A, mode = R.pick(["v", "v", "inv", "nest"]);
        if (mode === "nest") { const k = R.pick([2, 3]), N = k ** 6;
          return { style: "n", sig: `n${k}`, body: `ما قيمة ${h.rad(1, h.rad(1, N, 3))} ؟`, ...h.numOptions(R, h.d(k), [h.d(k * k), h.d(k ** 3), h.d(k * 2 + 1)]),
            steps: [`نبدأ من الداخل: ${h.rad(1, N, 3)} = ${A(k * k)} لأن ${A(k * k)} × ${A(k * k)} × ${A(k * k)} = ${A(N)}.`, `${h.rad(1, k * k)} = ${A(k)}.`], explanation: A(k) }; }
        const k = R.int(2, 10), N = k ** 3;
        if (mode === "inv") return { style: "i", sig: `i${k}`, body: `إذا كان ${h.rad(1, "س", 3)} = ${A(k)} ، فما قيمة س؟`, ...h.numOptions(R, h.d(N), [h.d(k * k), h.d(3 * k), h.d(N + k)]),
          steps: ["نكعّب الطرفين للتخلص من الجذر التكعيبي.", `س = ${A(k)} × ${A(k)} × ${A(k)} = ${A(N)}.`], explanation: A(N) };
        return { style: "v", sig: `v${k}`, body: `ما قيمة ${h.rad(1, N, 3)} ؟`, ...h.numOptions(R, h.d(k), [h.d(k + 1), h.d(Math.round(N / 3)), h.d(k * k)]),
          steps: [`نبحث عن عدد إذا ضُرب في نفسه ثلاث مرات أعطى ${A(N)}.`, `${A(k)} × ${A(k)} × ${A(k)} = ${A(N)} ، إذن ${h.rad(1, N, 3)} = ${A(k)}.`], explanation: A(k) };
      } },
      decSq: { title: "الجذر التربيعي للعدد العشري", from: 1740, to: 2120, gen(R, h) {
        const k = R.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 15, 25]), s = R.int(1, 3), v = h.shift(h.d(k), s), sq = h.shift(h.d(k * k), 2 * s);
        if (sq.s < 1 || (k >= 11 && s === 3)) return null; const cmpMode = R.next() < .25;
        if (cmpMode) { const w = R.pick([v, h.shift(h.d(k), s + 1), h.shift(h.d(k * k), s)]);
          return { style: "c", sig: `c${k}:${s}:${h.str(w)}`, body: h.cmpBody("", h.rad(1, h.fx(sq)), h.fx(w)), ...h.cmpAnswer(v, w),
            steps: [`نحذف الفاصلة: ${h.rad(1, k * k)} = ${h.A(k)}.`, `عدد الأرقام بعد الفاصلة ${h.A(2 * s)} ، ونصفها ${h.A(s)} ، فيكون الجذر = ${h.fx(v)}.`, `نقارن ${h.fx(v)} مع ${h.fx(w)}.`], explanation: h.cmpAnswer(v, w).options[h.cmpAnswer(v, w).correct] }; }
        return { style: "v" + s, sig: `${k}:${s}`, body: `ما قيمة ${h.rad(1, h.fx(sq))} ؟`, ...h.numOptions(R, v, [h.shift(v, 1), h.shift(v, -1), h.shift(h.d(k * k), s)]),
          steps: [`نحذف الفاصلة ونوجد جذر العدد: ${h.rad(1, k * k)} = ${h.A(k)}.`, `عدد الأرقام بعد الفاصلة ${h.A(2 * s)} ، فنضع الفاصلة في الناتج بعد نصفها (${h.A(s)}) من اليمين.`, `الناتج = ${h.fx(v)}.`], explanation: h.fx(v) };
      } },
      decCube: { title: "الجذر التكعيبي للعدد العشري", from: 1740, to: 2320, gen(R, h) {
        const k = R.int(1, 9), s = R.int(1, 2), v = h.shift(h.d(k), s), cu = h.shift(h.d(k ** 3), 3 * s);
        return { style: "c" + s, sig: `${k}:${s}`, body: `ما قيمة ${h.rad(1, h.fx(cu), 3)} ؟`, ...h.numOptions(R, v, [h.shift(v, 1), h.shift(v, -1), h.shift(h.d(k), 3 * s)]),
          steps: [`نحذف الفاصلة ونوجد الجذر التكعيبي: ${h.rad(1, k ** 3, 3)} = ${h.A(k)}.`, `عدد الأرقام بعد الفاصلة ${h.A(3 * s)} ، فنضع الفاصلة في الناتج بعد ثلثها (${h.A(s)}).`, `الناتج = ${h.fx(v)}.`], explanation: h.fx(v) };
      } },
      cubeSq: { title: "مقارنة جذر تكعيبي بجذر تربيعي", from: 2660, to: 2830, gen(R, h) {
        const A = h.A, a = R.int(2, 30), b = R.int(2, 10); if (a * a === b ** 3) return null; if (Number.isInteger(Math.cbrt(a)) && Number.isInteger(Math.sqrt(b))) return null;
        const x = a * a, y = b ** 3;
        return { style: x > y ? "g" : "l", sig: `${a}:${b}`, body: h.cmpBody("", h.rad(1, a, 3), h.rad(1, b)), ...cmpR(h, x, y),
          steps: ["نرفع القيمتين للقوة السادسة (المضاعف المشترك للدليلين ٣ و ٢).", `(${h.rad(1, a, 3)})⁶ = ${A(a)}² = ${A(x)} ، و (${h.rad(1, b)})⁶ = ${A(b)}³ = ${A(y)}.`, `إذن ${rel(x, y)}. ويمكن أيضًا المقارنة بالتقريب.`], explanation: rel(x, y) };
      } }
    }
  };
})();
