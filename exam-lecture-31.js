// المحاضرة 31: تطبيقات الفرق بين مربعين
(() => {
  const DS = "س² − ص² = (س − ص)(س + ص).";
  const S = (h, x) => x < 0 ? `−${h.A(-x)}` : h.A(x);
  const fx = (h, x) => Number.isInteger(x) ? S(h, x) : (x < 0 ? "−" : "") + h.fx(h.d(String(Math.abs(+x.toFixed(3)))));
  window.EXAMS[31] = {
    title: "اختبار محاكي: تطبيقات الفرق بين مربعين", minutes: 25,
    blueprint: [["find", 4], ["solve", 3], ["fourth", 2], ["big", 4], ["powFrac", 2], ["recip", 2], ["recipXY", 2], ["sqrt", 3], ["ratio", 2]],
    skills: {
      find: { title: "إيجاد س − ص أو س + ص من الفرق بين مربعين", from: 0, to: 80, gen(R, h) {
        const A = h.A, a = R.int(2, 12), b = R.int(2, 12), D = a * b, givenSum = R.next() < .6, k = givenSum ? b : a, v = givenSum ? a : b;
        return { style: "f" + givenSum, sig: `${a}:${b}:${givenSum}`, body: `إذا كان س² − ص² = ${A(D)} ، س ${givenSum ? "+" : "−"} ص = ${A(k)} ، فأوجد س ${givenSum ? "−" : "+"} ص`,
          ...h.numOptions(R, h.d(v), [h.d(D - k > 0 ? D - k : v + 2), h.d(D + k), h.d(v + 1)]),
          steps: [DS, `${A(D)} = (س ${givenSum ? "−" : "+"} ص) × ${A(k)}.`, `س ${givenSum ? "−" : "+"} ص = ${A(D)} ÷ ${A(k)} = ${A(v)}.`], explanation: A(v) };
      } },
      solve: { title: "إيجاد س أو ص من معادلتين", from: 80, to: 280, gen(R, h) {
        const A = h.A, x = R.int(2, 15), y = R.int(1, x - 1), s = x + y, d = x - y, ask = R.pick(["x", "y"]), v = ask === "x" ? x : y; if ((x * x - y * y) > 400) return null;
        return { style: ask, sig: `${x}:${y}:${ask}`, body: `إذا كان س + ص = ${A(s)} ، س² − ص² = ${A(s * d)} ، فإن ${ask === "x" ? "س" : "ص"} = ؟`,
          ...h.numOptions(R, h.d(v), [h.d(ask === "x" ? y : x), h.d(d), h.d(v + 1)]),
          steps: [DS, `س − ص = ${A(s * d)} ÷ ${A(s)} = ${A(d)}.`, `بجمع المعادلتين: ٢س = ${A(s)} + ${A(d)} ، س = ${A(x)}${ask === "y" ? ` ، ثم ص = ${A(s)} − ${A(x)} = ${A(y)}` : ""}.`], explanation: A(v) };
      } },
      fourth: { title: "س⁴ − ص⁴ = (س² − ص²)(س² + ص²)", from: 280, to: 420, gen(R, h) {
        const A = h.A, mode = R.pick(["sq", "lin"]);
        if (mode === "sq") { const p = R.int(2, 15), q = R.int(1, 15), v = p * q;
          return { style: "s", sig: `s${p}:${q}`, body: `إذا كان س² + ص² = ${A(p)} ، س² − ص² = ${A(q)} ، فإن س⁴ − ص⁴ = ؟`, ...h.numOptions(R, h.d(v), [h.d(p + q), h.d(p * p - q * q > 0 ? p * p - q * q : v + 3), h.d(v * 2)]),
            steps: ["س⁴ − ص⁴ = (س²)² − (ص²)² = (س² − ص²)(س² + ص²).", `= ${A(q)} × ${A(p)} = ${A(v)}.`], explanation: A(v) }; }
        const s = R.int(2, 9), d = R.int(1, 6), q = R.int(2, 20), v = s * d * q;
        return { style: "l", sig: `l${s}:${d}:${q}`, body: `إذا كان س + ص = ${A(s)} ، س − ص = ${A(d)} ، س² + ص² = ${A(q)} ، فإن س⁴ − ص⁴ = ؟`, ...h.numOptions(R, h.d(v), [h.d(s * d), h.d(s * d + q), h.d(v / s | 0 || v + 2)]),
          steps: [`س² − ص² = (س − ص)(س + ص) = ${A(d)} × ${A(s)} = ${A(s * d)}.`, `س⁴ − ص⁴ = (س² − ص²)(س² + ص²) = ${A(s * d)} × ${A(q)} = ${A(v)}.`], explanation: A(v) };
      } },
      big: { title: "الفرق بين مربعي عددين كبيرين", from: 420, to: 520, gen(R, h) {
        const A = h.A, a = R.pick([R.int(51, 999), R.int(10, 99) * 10, 1000, 100, 1001]), d = R.pick([1, 2, 3, 4, 5, 10]), b = a - d, v = d * (a + b);
        return { style: "b" + d, sig: `${a}:${d}`, body: `أوجد قيمة ${A(a)}² − ${A(b)}²`, ...h.numOptions(R, h.d(v), [h.d(d * d), h.d(a + b), h.d(v + d)]),
          steps: [DS, `= (${A(a)} − ${A(b)})(${A(a)} + ${A(b)}) = ${A(d)} × ${A(a + b)}.`, `= ${A(v)}.`], explanation: A(v) };
      } },
      powFrac: { title: "تبسيط كسر بالتحليل إلى فرق مربعين", from: 520, to: 720, gen(R, h) {
        const A = h.A, b = R.int(2, 9), v = b * (b + 1);
        return { style: "p", sig: `${b}`, body: `أوجد قيمة ${h.frac(`${A(b)}⁴ − ${A(b)}²`, `${A(b)}² − ${A(b)}`)}`, ...h.numOptions(R, h.d(v), [h.d(b * b), h.d(b ** 3), h.d(b * (b - 1))]),
          steps: [`البسط = ${A(b)}² (${A(b)}² − ١) = ${A(b)}² (${A(b)} − ١)(${A(b)} + ١) ، والمقام = ${A(b)} (${A(b)} − ١).`, `نختصر ${A(b)} (${A(b)} − ١) فيبقى ${A(b)} × (${A(b)} + ١).`, `= ${A(b)} × ${A(b + 1)} = ${A(v)}.`], explanation: A(v) };
      } },
      recip: { title: "(س − ١÷س)(س + ١÷س) = س² − ١÷س²", from: 720, to: 790, gen(R, h) {
        const A = h.A, k = R.pick([2, 4, 5, 10, 8]), v = k - 1 / k;
        return { style: "r", sig: `${k}`, body: `إذا كان س² = ${A(k)} ، أوجد (س − ${h.frac("١", "س")})(س + ${h.frac("١", "س")})`,
          ...h.strOptions(R, fx(h, v), [fx(h, k + 1 / k), fx(h, k - 1), fx(h, k)]),
          steps: ["حاصل ضرب مجموع حدين في الفرق بينهما = مربع الأول − مربع الثاني.", `= س² − ${h.frac("١", "س²")} = ${A(k)} − ${h.frac("١", A(k))} = ${fx(h, v)}.`], explanation: fx(h, v) };
      } },
      recipXY: { title: "الفرق بين مربعين لمقلوبات", from: 790, to: 960, gen(R, h) {
        const A = h.A, a = R.int(1, 9), b = R.int(1, 9), swap = R.next() < .5, v = swap ? -(a * b) : a * b;
        return { style: "x" + swap, sig: `${a}:${b}:${swap}`, body: `إذا كان ${h.frac("١", "س")} − ${h.frac("١", "ص")} = ${A(a)} ، ${h.frac("١", "س")} + ${h.frac("١", "ص")} = ${A(b)} ، أوجد ${swap ? `${h.frac("١", "ص²")} − ${h.frac("١", "س²")}` : `${h.frac("١", "س²")} − ${h.frac("١", "ص²")}`}`,
          ...h.strOptions(R, S(h, v), [S(h, -v), S(h, a + b), S(h, a * a + b * b)]),
          steps: [`${h.frac("١", "س²")} − ${h.frac("١", "ص²")} = (${h.frac("١", "س")} − ${h.frac("١", "ص")})(${h.frac("١", "س")} + ${h.frac("١", "ص")}) = ${A(a)} × ${A(b)} = ${A(a * b)}.`, swap ? `المطلوب عكس الترتيب فتتغير الإشارة: ${S(h, v)}.` : `الناتج ${A(v)}.`], explanation: S(h, v) };
      } },
      sqrt: { title: "جذر الفرق بين مربعين", from: 960, to: 1000, gen(R, h) {
        const A = h.A, [d, s] = R.pick([[2, 200], [2, 50], [1, 49], [1, 81], [4, 100], [2, 72], [3, 75], [8, 50], [5, 125], [2, 98], [1, 121], [9, 100]]), a = (s + d) / 2, b = (s - d) / 2; if (!Number.isInteger(a)) return null; const v = Math.sqrt(d * s);
        if (!Number.isInteger(v)) return null;
        return { style: "s", sig: `${a}:${b}`, body: `ما قيمة ${h.rad(1, `${A(a)}² − ${A(b)}²`)} ؟`, ...h.numOptions(R, h.d(v), [h.d(a - b), h.d(v + 2), h.d(Math.round(Math.sqrt(a + b)) || v + 4)]),
          steps: [DS, `ما تحت الجذر = (${A(a)} − ${A(b)})(${A(a)} + ${A(b)}) = ${A(d)} × ${A(s)} = ${A(d * s)}.`, `${h.rad(1, d * s)} = ${A(v)}.`], explanation: A(v) };
      } },
      ratio: { title: "قسمة الفرق بين مربعين على الفرق", from: 1000, to: 1104, gen(R, h) {
        const A = h.A, n = R.int(3, 19), dd = R.pick([1, 2]), v = n / dd, plus = R.next() < .6;
        const given = dd === 1 ? A(n) : h.frac(A(n), "٢"), ans = fx(h, v);
        return { style: "r" + plus, sig: `${n}:${dd}:${plus}`, body: `إذا كان ${h.frac("س² − ص²", plus ? "س − ص" : "س + ص")} = ${given} ، أوجد س ${plus ? "+" : "−"} ص`,
          ...h.strOptions(R, ans, [fx(h, v * 2), fx(h, v + 1), fx(h, v - 1 || v + 2)]),
          steps: [DS, `${h.frac(`(س − ص)(س + ص)`, plus ? "س − ص" : "س + ص")} = س ${plus ? "+" : "−"} ص بعد الاختصار.`, `إذن س ${plus ? "+" : "−"} ص = ${ans}.`], explanation: ans };
      } }
    }
  };
})();
