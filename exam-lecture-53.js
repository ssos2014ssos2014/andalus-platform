// المحاضرة 53: حل المعادلات بالتعويض وتجريب الخيارات، ومسائل الأوراق النقدية
(() => {
  const TIP = "طريقة سريعة: عوّض الخيارات في المعادلة، والخيار الذي يحققها هو الحل.";
  const g = (a, b) => b ? g(b, a % b) : a;
  window.EXAMS[53] = {
    title: "اختبار محاكي: المعادلات بالتعويض والأوراق النقدية", minutes: 25,
    blueprint: [["fracEq", 4], ["powEq", 2], ["divExpr", 3], ["roots", 2], ["posInt", 2], ["linFrac", 3], ["notes", 4], ["tryOpt", 4]],
    skills: {
      fracEq: { title: "معادلة كسرية بالمقلوب", from: 0, to: 120, gen(R, h) {
        const A = h.A, c = R.pick([3, 5, 7, 9, 11]), a = R.int(c - 2 > 1 ? 2 : 1, 12), x = R.int(2, 12), b = R.int(1, 9); const lhs = b * c; if ((a * c - b * x) <= 0) return null;
        // a/x − b/c = d/x  →  (a − d)/x = b/c → x = c(a − d)/b ؛ نختار d
        const d = a - b * x / c; if (!Number.isInteger(d) || d <= 0) return null;
        return { style: "f", sig: `${a}:${b}:${c}:${x}`, body: `إذا كان ${h.frac(A(a), "س")} − ${h.frac(A(b), A(c))} = ${h.frac(A(d), "س")} ، فإن س = ؟`, ...h.numOptions(R, h.d(x), [h.d(x + 1), h.d(c), h.d(Math.max(1, x - 1)) === h.d(c) ? h.d(x + 2) : h.d(Math.max(1, x - 1))]),
          steps: [TIP, `${h.frac(A(a), "س")} − ${h.frac(A(d), "س")} = ${h.frac(A(b), A(c))} ، أي ${h.frac(A(a - d), "س")} = ${h.frac(A(b), A(c))}.`, `س = ${A(c)} × ${A(a - d)} ÷ ${A(b)} = ${A(x)}.`], explanation: A(x) };
      } },
      powEq: { title: "معادلة بأس واحد في الطرفين", from: 200, to: 290, gen(R, h) {
        const A = h.A, n = R.pick([2, 3, 4]), base = R.pick([10, 5, 3, 2, 4]), c = R.int(1, 5), x = base - c, rhs = base ** n; if (x <= 0) return null;
        return { style: "p" + n, sig: `${n}:${base}:${c}`, body: `إذا كان ${h.frac("١", `(س + ${A(c)})${["", "", "²", "³", "⁴"][n]}`)} = ${h.frac("١", A(rhs))} ، فأوجد س`, ...h.numOptions(R, h.d(x), [h.d(base), h.d(x + 2), h.d(rhs - c)]),
          steps: [`${A(rhs)} = ${A(base)}${["", "", "²", "³", "⁴"][n]}.`, `إذن س + ${A(c)} = ${A(base)} ، س = ${A(x)}.`], explanation: A(x) };
      } },
      divExpr: { title: "قيمة س التي تجعل مقدارًا يقبل القسمة", from: 290, to: 400, gen(R, h) {
        const A = h.A, a = R.int(2, 9), b = R.int(1, 20), k = R.pick([3, 5, 7, 9, 11]); const ok = [], bad = [];
        for (let x = 2; x <= 9; x++) ((a * x - b) % k === 0 && a * x - b > 0 ? ok : bad).push(x); if (ok.length !== 1 || bad.length < 3) return null;
        return { style: "d", sig: `${a}:${b}:${k}`, body: `ما قيمة س التي تجعل العدد ${A(a)}س − ${A(b)} يقبل القسمة على ${A(k)}؟`, ...h.strOptions(R, A(ok[0]), R.shuffle(bad).slice(0, 3).map(A)),
          steps: [TIP, `عند س = ${A(ok[0])}: ${A(a)} × ${A(ok[0])} − ${A(b)} = ${A(a * ok[0] - b)} = ${A(k)} × ${A((a * ok[0] - b) / k)} ✓.`], explanation: A(ok[0]) };
      } },
      roots: { title: "القيم الممكنة للمجهول", from: 770, to: 840, gen(R, h) {
        const A = h.A, mode = R.pick(["x3", "x2", "x4"]);
        const m = { x3: ["س³ − س² = صفر", "٠ ، ١", ["١ ، −١", "٠ ، −١", "١ ، ٢"], "س²(س − ١) = صفر ، إذن س = ٠ أو س = ١."], x2: ["س² = س", "٠ ، ١", ["١ فقط", "٠ ، −١", "−١ ، ١"], "س² − س = صفر ، س(س − ١) = صفر ، إذن س = ٠ أو ١."], x4: ["س³ = س", "٠ ، ١ ، −١", ["٠ ، ١", "١ ، −١", "١ فقط"], "س³ − س = س(س − ١)(س + ١) = صفر ، إذن س = ٠ أو ١ أو −١."] }[mode];
        return { style: mode, sig: mode, body: `إذا كان ${m[0]} ، فإنه من الممكن أن تكون قيمة س:`, ...h.strOptions(R, m[1], m[2]), steps: [m[3], "لا تقسم على س؛ فقد تكون س صفرًا فتضيع حلًا."], explanation: m[1] };
      } },
      posInt: { title: "حلول بأعداد صحيحة موجبة", from: 840, to: 940, gen(R, h) {
        const A = h.A, n = R.int(5, 15), v = R.int(1, n - 1);
        return { style: "p", sig: `${n}:${v}`, body: `إذا كان س + ص = ${A(n)} ، حيث س و ص أعداد صحيحة موجبة، فأي الآتي ممكن؟`, ...h.strOptions(R, `س = ${A(v)}`, [`س = ${A(n)}`, `ص = ${A(n)}`, `ص = ${A(n + 2)}`]),
          steps: ["ص موجبة، أي ص ≥ ١ ، فلا يمكن أن تكون س = " + `${A(n)} أو أكثر.`, `س = ${A(v)} تعطي ص = ${A(n - v)} موجبة ✓.`], explanation: `س = ${A(v)}` };
      } },
      linFrac: { title: "معادلة بكسور للمجهول", from: 940, to: 1020, gen(R, h) {
        const A = h.A, a = R.pick([2, 3, 4, 5]), b = R.pick([3, 4, 5, 6]); if (a === b) return null; const p = R.int(2, 4), L = a * b / g(a, b), x = L * R.int(1, 6), v = p * x / a - x / b; if (!Number.isInteger(v) || v <= 0) return null;
        return { style: "l", sig: `${a}:${b}:${p}:${x}`, body: `إذا كان ${h.frac(`${A(p)}س`, A(a))} − ${h.frac("س", A(b))} = ${A(v)} ، أوجد قيمة س`, ...h.numOptions(R, h.d(x), [h.d(x + L), h.d(v), h.d(Math.max(1, x - L)) === h.d(v) ? h.d(x * 2) : h.d(Math.max(1, x - L))]),
          steps: [TIP, `نضرب في ${A(L)}: ${A(p * L / a)}س − ${A(L / b)}س = ${A(v * L)}.`, `${A(p * L / a - L / b)}س = ${A(v * L)} ، س = ${A(x)}.`], explanation: A(x) };
      } },
      notes: { title: "مسائل الأوراق النقدية", from: 1020, to: 1500, gen(R, h) {
        const A = h.A, [a, b] = R.pick([[500, 200], [100, 50], [50, 10], [500, 100], [200, 50]]), na = R.int(1, 8), nb = R.int(1, 8), T = na * a + nb * b, ask = R.pick(["b", "a"]);
        const v = ask === "b" ? nb : na;
        return { style: ask, sig: `${a}:${b}:${na}:${nb}:${ask}`, body: `إذا كان مع محمد ${A(T)} ريال من فئتي ${A(a)} و ${A(b)} ريال، وكان عدد الأوراق معه ${A(na + nb)} أوراق، فكم ورقة معه من فئة ${A(ask === "b" ? b : a)} ريال؟`,
          ...h.numOptions(R, h.d(v), [h.d(ask === "b" ? na : nb), h.d(v + 1), h.d(Math.max(1, v - 1))]),
          steps: [TIP, `نفرض عدد أوراق ${A(a)} = س ، وعدد أوراق ${A(b)} = ${A(na + nb)} − س.`, `${A(a)}س + ${A(b)}(${A(na + nb)} − س) = ${A(T)} ، أي ${A(a - b)}س = ${A(T - b * (na + nb))} ، س = ${A(na)}.`, `أوراق ${A(b)} = ${A(nb)} ، وأوراق ${A(a)} = ${A(na)}.`], explanation: A(v) };
      } },
      tryOpt: { title: "اختيار الحل بالتعويض", from: 400, to: 770, gen(R, h) {
        const A = h.A, x = R.int(1, 9), a = R.int(2, 6), b = R.int(1, 9), c = R.int(2, 5), rhs = a * x + b, lhs = c * x + (rhs - c * x);
        const k = rhs - c * x; if (k === b || a <= c || k < 0) return null;
        return { style: "t", sig: `${x}:${a}:${b}:${c}`, body: `إذا كان ${A(a)}س + ${A(b)} = ${A(c)}س ${k >= 0 ? "+" : "−"} ${A(Math.abs(k))} ، فإن س = ؟`, ...h.numOptions(R, h.d(x), [h.d(x + 1), h.d(x + 2), h.d(Math.max(1, x - 1)) === h.d(x) ? h.d(x + 3) : h.d(Math.max(1, x - 1))]),
          steps: [TIP, `${A(a - c)}س = ${k >= 0 ? A(k) : "−" + A(-k)} − ${A(b)} = ${A(k - b)}${(a - c) < 0 ? "" : ""}.`.replace(/= (\d|[٠-٩])/, "= $1"), `س = ${A(x)}. تحقق: ${A(a * x + b)} = ${A(c * x + k)} ✓.`], explanation: A(x) };
      } }
    }
  };
})();
