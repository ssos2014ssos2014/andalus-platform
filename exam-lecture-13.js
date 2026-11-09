// المحاضرة 13: حل المعادلات الجذرية، الجذور المتداخلة، الجذر النوني والأسس الكسرية
(() => {
  const SUP = n => String(n).split("").map(x => "⁰¹²³⁴⁵⁶⁷⁸⁹"[x]).join("");
  const NM = { 2: "التربيعي", 3: "التكعيبي", 4: "الرابع", 5: "الخامس", 6: "السادس" };
  window.EXAMS[13] = {
    title: "اختبار محاكي: المعادلات الجذرية والجذر النوني", minutes: 25,
    blueprint: [["rep", 2], ["rootEq", 2], ["coef", 2], ["nest", 2], ["self", 1], ["expEq", 2], ["multi", 2], ["cubeFrac", 2], ["decPm", 2], ["nth", 3], ["fracPow", 2], ["eqRoots", 2]],
    skills: {
      rep: { title: "معادلة جذرية بمجموع جذور متكررة", from: 0, to: 110, gen(R, h) {
        const A = h.A, a = R.pick([2, 3, 5, 6, 7]), k = R.int(2, 5), x = k * k * a;
        return { style: "r" + k, sig: `${a}:${k}`, body: `إذا كان ${h.rad(1, "س")} = ${Array(k).fill(h.rad(1, a)).join(" + ")} ، فإن س = ؟`,
          ...h.numOptions(R, h.d(x), [h.d(k * a), h.d(k + a), h.d(x * a)]),
          steps: [`الطرف الأيمن جذور متشابهة: ${h.rad(k, a)}.`, `نربّع الطرفين: س = (${h.rad(k, a)})² = ${A(k * k)} × ${A(a)}.`, `س = ${A(x)}.`], explanation: A(x) };
      } },
      rootEq: { title: "جذر تربيعي يساوي جذرًا تكعيبيًا", from: 110, to: 190, gen(R, h) {
        const A = h.A, k = R.int(2, 9), n = R.pick([3, 3, 4]), N = k ** n; if (N > 10000) return null; const x = k * k;
        return { style: "n" + n, sig: `${k}:${n}`, body: `إذا كان ${h.rad(1, "س")} = ${h.rad(1, N, n)} ، فما قيمة س؟`,
          ...h.numOptions(R, h.d(x), [h.d(k), h.d(Math.round(N / 2)), h.d(k ** 3 === x ? x + 1 : k ** 3)]),
          steps: [`نبسّط الطرف الأيمن: ${h.rad(1, N, n)} = ${A(k)}.`, `${h.rad(1, "س")} = ${A(k)} ، نربّع الطرفين: س = ${A(x)}.`], explanation: A(x) };
      } },
      coef: { title: "معادلة: عدد × جذر = عدد", from: 190, to: 310, gen(R, h) {
        const A = h.A, a = R.int(2, 6), b = R.pick([2, 3, 4, 5]), r = R.int(2, 9), c = a * r; if ((r * r) % b) return null; const x = r * r / b;
        return { style: "c", sig: `${a}:${b}:${r}`, body: `إذا كان ${A(a)} × ${h.rad(1, `${A(b)}س`)} = ${A(c)} ، فأوجد قيمة س`,
          ...h.numOptions(R, h.d(x), [h.d(r * r), h.d(r), h.d(c * c / b | 0 || x + 2)]),
          steps: [`نقسم الطرفين على ${A(a)}: ${h.rad(1, `${A(b)}س`)} = ${A(r)}.`, `نربّع الطرفين: ${A(b)}س = ${A(r * r)}.`, `س = ${A(r * r)} ÷ ${A(b)} = ${A(x)}.`], explanation: A(x) };
      } },
      nest: { title: "جذر داخل جذر", from: 310, to: 500, gen(R, h) {
        const A = h.A, a = R.pick([2, 3, 4, 6, 8, 12]), b = R.pick([1, 2, 3]), c = R.int(2, 8), c2 = c * c; if (c2 % a) return null; const m = c2 / a, x = m * m / b; if (!Number.isInteger(x) || x > 400) return null;
        const inner = b === 1 ? "س" : `${A(b)}س`;
        return { style: "b" + b, sig: `${a}:${b}:${c}`, body: `إذا كان ${h.rad(1, `${A(a)}${h.rad(1, inner)}`)} = ${A(c)} ، فأوجد قيمة س`,
          ...h.numOptions(R, h.d(x), [h.d(m), h.d(x * 2), h.d(c2)]),
          steps: [`نربّع الطرفين: ${A(a)}${h.rad(1, inner)} = ${A(c2)}.`, `نقسم على ${A(a)}: ${h.rad(1, inner)} = ${A(m)} ، ونربّع مرة أخرى: ${inner} = ${A(m * m)}.`, `س = ${A(x)}.`], explanation: A(x) };
      } },
      self: { title: "جذر مجموع س وجذر س²", from: 500, to: 670, gen(R, h) {
        const A = h.A, c = R.int(1, 10) * 2, x = c * c / 2;
        return { style: "s", sig: `${c}`, body: `إذا كان ${h.rad(1, `س + ${h.rad(1, "س²")}`)} = ${A(c)} ، فأوجد قيمة س`,
          ...h.numOptions(R, h.d(x), [h.d(c * c), h.d(c), h.d(c / 2)]),
          steps: [`${h.rad(1, "س²")} = س (س موجبة)، فما تحت الجذر الكبير = س + س = ٢س.`, `${h.rad(1, "٢س")} = ${A(c)} ، نربّع: ٢س = ${A(c * c)}.`, `س = ${A(x)}.`], explanation: A(x) };
      } },
      expEq: { title: "معادلة أسية تحت الجذر", from: 670, to: 780, gen(R, h) {
        const A = h.A, t = R.pick([2, 3, 5]), n = R.int(2, 5), a = t * t, b = t ** n; if (b > 3200) return null;
        return { style: "e" + t, sig: `${t}:${n}`, body: `إذا كان الجذر التربيعي للعدد (${A(a)} أس ص) يساوي ${A(b)} ، فكم قيمة ص؟`,
          ...h.numOptions(R, h.d(n), [h.d(n * 2), h.d(n - 1 || n + 2), h.d(n + 1)]),
          steps: [`الجذر التربيعي يقسم الأس على ٢، و ${A(a)} = ${A(t)}² ، فالطرف الأيمن = ${A(t)} أس ص.`, `${A(b)} = ${A(t)}${SUP(n)} ، إذن ${A(t)} أس ص = ${A(t)}${SUP(n)}.`, `ص = ${A(n)}.`], explanation: A(n) };
      } },
      multi: { title: "جذور متداخلة متكررة", from: 780, to: 1000, gen(R, h) {
        const A = h.A, k = R.pick([2, 2, 3]), c = R.pick(k === 2 ? [2, 3, 4, 5, 6, 7, 8, 9, 10] : [2, 3]), x = c ** (2 ** k);
        let e = "س"; for (let i = 0; i < k; i++) e = h.rad(1, e);
        return { style: "k" + k, sig: `${k}:${c}`, body: `إذا كان ${e} = ${A(c)} ، فإن قيمة س = ؟`,
          ...h.numOptions(R, h.d(x), [h.d(c ** k), h.d(c * 2 ** k), h.d(c ** (2 ** (k - 1)))]),
          steps: [`نربّع الطرفين ${A(k)} مرات (مرة لكل جذر).`, `بعد كل تربيع: ${Array.from({ length: k }, (_, i) => A(c ** (2 ** (i + 1)))).join(" ← ")}.`, `س = ${A(x)}.`], explanation: A(x) };
      } },
      cubeFrac: { title: "معادلة جذر تكعيبي يساوي كسرًا", from: 960, to: 1110, gen(R, h) {
        const A = h.A, k = R.int(2, 9), sq = R.next() < .4 && k <= 3, den = sq ? k ** 6 : k ** 3;
        const ans = h.frac("١", A(den));
        return { style: sq ? "q" : "c", sig: `${k}:${sq}`, body: `إذا كان ${h.rad(1, "س", 3)} = ${h.frac("١", A(k))} ، فإن ${sq ? "س²" : "س"} = ؟`,
          ...h.strOptions(R, ans, [h.frac("١", A(k * k)), h.frac("١", A(sq ? k ** 3 : k * 3)), A(den), h.frac("١", A(sq ? k ** 4 : k ** 2 * 2))]),
          steps: ["نكعّب الطرفين للتخلص من الجذر التكعيبي.", `س = ${h.frac("١", `${A(k)}³`)} = ${h.frac("١", A(k ** 3))}.`, ...(sq ? [`س² = ${h.frac("١", `${A(k ** 3)}²`)} = ${ans}.`] : [])], explanation: ans };
      } },
      decPm: { title: "حل م² = عدد عشري (موجب وسالب)", from: 1110, to: 1240, gen(R, h) {
        const k = R.int(2, 9), s = R.int(1, 3), v = h.shift(h.d(k), s), sq = h.shift(h.d(k * k), 2 * s);
        const o = x => `±${h.fx(x)}`, ans = o(v);
        return { style: "s" + s, sig: `${k}:${s}`, body: `إذا كانت م² = ${h.fx(sq)} ، فإن م = ؟`,
          ...h.strOptions(R, ans, [o(h.shift(v, 1)), o(h.shift(v, -1)), h.fx(v), o(h.shift(h.d(k * k), s))]),
          steps: [`م = ±${h.rad(1, h.fx(sq))} (لأن مربع العدد السالب موجب أيضًا).`, `${h.rad(1, k * k)} = ${h.A(k)} ، وعدد المنازل العشرية ${h.A(2 * s)} نصفها ${h.A(s)}.`, `م = ${ans}.`], explanation: ans };
      } },
      nth: { title: "قاعدة الجذر النوني: ⁿ√سᵐ = س^(م/ن)", from: 1240, to: 1560, gen(R, h) {
        const A = h.A, a = R.pick([2, 3, 5, 10]), n = R.pick([2, 3, 4, 5]), q = R.int(1, 3), m = n * q, v = a ** q; if (a ** m > 1e6 && a !== 10 || m > 12) return null;
        const form = R.next() < .5, inner = form || a ** m > 99999 ? `${A(a)}${SUP(m)}` : A(a ** m);
        return { style: (form ? "p" : "n") + n, sig: `${a}:${n}:${q}:${form}`, body: `أوجد الجذر ${NM[n]} للعدد ${inner}`.replace("الجذر التربيعي للعدد", "قيمة الجذر التربيعي للعدد"),
          ...h.numOptions(R, h.d(v), [h.d(a ** (q + 1)), h.d(a * n), h.d(q === 1 ? a + n : a ** (q - 1))]),
          steps: [`القاعدة: ${h.rad(1, "سᵐ", n)} = س أس ${h.frac("م", "ن")}.`, `${form ? "" : `${inner} = ${A(a)}${SUP(m)} ، `}فالجذر = ${A(a)} أس ${h.frac(A(m), A(n))} = ${A(a)}${SUP(q)}.`, `= ${A(v)}.`], explanation: A(v) };
      } },
      fracPow: { title: "الأسس الكسرية (½ و ⅓)", from: 1560, to: 1720, gen(R, h) {
        const A = h.A, k = R.pick([2, 3, 4]), N = k ** 6, s = k ** 3, c = k ** 2, op = R.pick(["×", "÷"]), v = op === "×" ? s * c : s / c;
        return { style: op, sig: `${k}:${op}`, body: `ما قيمة: (${A(N)}) أس ½ ${op} (${A(N)}) أس ⅓ ؟`,
          ...h.numOptions(R, h.d(v), op === "×" ? [h.d(N), h.d(s), h.d(s + c)] : [h.d(c), h.d(s), h.d(v * 2)]),
          steps: [`الأس ½ يعني الجذر التربيعي: ${h.rad(1, N)} = ${A(s)}.`, `الأس ⅓ يعني الجذر التكعيبي: ${h.rad(1, N, 3)} = ${A(c)}.`, `${A(s)} ${op} ${A(c)} = ${A(v)}.`], explanation: A(v) };
      } },
      eqRoots: { title: "معادلة بين جذرين مختلفي الدليل", from: 1720, to: 1894, gen(R, h) {
        const A = h.A, a = R.pick([2, 3, 4]), b = R.pick([3, 4, 5]), k = R.pick([2, 3]); if (a === b) return null; const N = k ** b, x = k ** a; if (N > 300) return null;
        return { style: `${a}${b}`, sig: `${a}:${b}:${k}`, body: `إذا كان ${h.rad(1, "س", a)} = ${h.rad(1, N, b)} ، فأوجد قيمة س`,
          ...h.numOptions(R, h.d(x), [h.d(k), h.d(N), h.d(x * k === N ? x + 1 : x * k)]),
          steps: [`نبسّط الطرف الأيمن: ${h.rad(1, N, b)} = ${A(k)} لأن ${A(k)}${SUP(b)} = ${A(N)}.`, `${h.rad(1, "س", a)} = ${A(k)} ، نرفع الطرفين للقوة ${A(a)}: س = ${A(k)}${SUP(a)}.`, `س = ${A(x)}.`], explanation: A(x) };
      } }
    }
  };
})();
