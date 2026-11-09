// المحاضرة 11: التكرار تحت الجذر، ضرب الجذور، قسمة الجذور والضرب في المرافق
(() => {
  const g = (a, b) => b ? g(b, a % b) : a;
  const PR = [2, 3, 5, 6, 7, 10, 11, 13];
  const S = (h, x) => x < 0 ? `−${h.A(-x)}` : h.A(x);
  // صيغة: م√ن + ث
  const lin = (h, c, m, k) => {
    const r = Math.abs(c) === 1 ? h.rad(1, m) : h.rad(Math.abs(c), m);
    if (c < 0 && k > 0) return `${h.A(k)} − ${r}`;
    const head = (c < 0 ? "−" : "") + r;
    return k === 0 ? head : `${head} ${k > 0 ? "+" : "−"} ${h.A(Math.abs(k))}`;
  };
  // كسر جذري: (ب√ن) ÷ م بأبسط صورة
  const rfrac = (h, b, n, d) => { const [o, i] = h.simp(n); b *= o; n = i; const gg = g(Math.abs(b), d); b /= gg; d /= gg; const top = n === 1 ? h.A(b) : h.rad(b, n); return d === 1 ? top : h.frac(top, h.A(d)); };
  window.EXAMS[11] = {
    title: "اختبار محاكي: التكرار تحت الجذر وضرب الجذور وقسمتها", minutes: 25,
    blueprint: [["repSum", 3], ["sqFrac", 2], ["mul", 2], ["conj", 3], ["ratio", 2], ["conjDen", 2], ["cross", 1], ["diff", 2], ["fracRoots", 2], ["same", 1], ["recip", 2], ["prod", 1], ["divR", 1]],
    skills: {
      repSum: { title: "التكرار تحت الجذر (مجموع عدد مكرر)", from: 0, to: 440, gen(R, h) {
        const A = h.A, mode = R.pick(["val", "val", "count", "self"]);
        if (mode === "self") {
          const a = R.int(7, 29);
          return { style: "s", sig: `s${a}`, body: `إذا كان ${h.rad(1, `${A(a)} + ${A(a)} + ${A(a)} + … + ${A(a)}`)} = ${A(a)} ، فكم مرة تكرر العدد ${A(a)} تحت الجذر؟`,
            ...h.numOptions(R, h.d(a), [h.d(a * a), h.d(2), h.d(a * 2)]),
            steps: [`نفرض أن العدد تكرر ن مرة، فيصبح ما تحت الجذر = ن × ${A(a)}.`, `${h.rad(1, `ن × ${A(a)}`)} = ${A(a)} ، نربع الطرفين: ن × ${A(a)} = ${A(a * a)}.`, `ن = ${A(a * a)} ÷ ${A(a)} = ${A(a)} مرة.`], explanation: `${A(a)} مرة` };
        }
        if (mode === "count") {
          const a = R.pick([2, 3, 5, 6, 7]), t = R.int(2, 4), k = a * t, n = a * t * t; if (n > 60) return null;
          return { style: "c", sig: `c${a}:${t}`, body: `إذا كان ${h.rad(1, `${A(a)} + ${A(a)} + … + ${A(a)}`)} = ${A(k)} ، فكم مرة تكرر العدد ${A(a)}؟`,
            ...h.numOptions(R, h.d(n), [h.d(k), h.d(k * 2), h.d(n + a)]),
            steps: [`ما تحت الجذر = ن × ${A(a)} ، ونربع الطرفين: ن × ${A(a)} = ${A(k)}² = ${A(k * k)}.`, `ن = ${A(k * k)} ÷ ${A(a)} = ${A(n)}.`], explanation: A(n) };
        }
        const n = R.int(2, 6), s = R.int(4, 30); if ((s * s) % n) return null; const a = s * s / n; if (a < 4 || a > 200 || a === s) return null;
        const terms = Array(n).fill(A(a)).join(" + ");
        return { style: "v" + n, sig: `v${n}:${a}`, body: `ما قيمة ${h.rad(1, terms)} ؟`, ...h.numOptions(R, h.d(s), [h.d(a), h.d(s * n), h.d(s + n)]),
          steps: [`العدد ${A(a)} مكرر ${A(n)} مرات، ومجموع العدد المكرر = أحده × عدد مرات التكرار: ${A(n)} × ${A(a)} = ${A(n * a)}.`, `${h.rad(1, n * a)} = ${A(s)}.`], explanation: A(s) };
      } },
      sqFrac: { title: "جذر كسر بسطه مجموع عددين", from: 440, to: 540, gen(R, h) {
        const A = h.A, c = R.pick([2, 3, 4, 5, 10]), q = R.pick([2, 3, 5, 6, 7, 10, 11, 4, 9, 16, 25]), tot = q * c, a = R.int(1, tot - 1) * 5, b0 = tot * 5 - a;
        if (b0 <= 0 || a % 5 || tot * 5 > 400) return null;
        const num = a + b0, den = c * 5, inner = num / den, ans = h.radS(1, inner);
        return { style: "f" + c, sig: `${a}:${b0}:${den}`, body: `ما قيمة ${h.rad(1, h.frac(`${A(a)} + ${A(b0)}`, A(den)))} ؟`,
          ...h.strOptions(R, ans, [h.radS(1, inner + 1), h.radS(2, inner), h.rad(1, num), A(inner)]),
          steps: [`نجمع البسط أولًا: ${A(a)} + ${A(b0)} = ${A(num)}.`, `نقسم: ${A(num)} ÷ ${A(den)} = ${A(inner)}.`, ans === h.rad(1, inner) ? `الناتج = ${ans}.` : `${h.rad(1, inner)} = ${ans}.`], explanation: ans };
      } },
      mul: { title: "ضرب الجذور", from: 540, to: 760, gen(R, h) {
        const A = h.A, a = R.int(1, 6), c = R.int(2, 6), b = R.pick(PR), d = R.pick(PR); if (b === d && R.next() < .6) return null;
        const ans = h.radS(a * c, b * d);
        return { style: b === d ? "e" : "n", sig: `${a}:${b}:${c}:${d}`, body: `ما ناتج ${h.rad(a, b)} × ${h.rad(c, d)} ؟`,
          ...h.strOptions(R, ans, [h.radS(a + c, b * d), h.radS(a * c, b + d), h.rad(1, a * c * b * d), h.radS(a * c + 1, b * d)]),
          steps: ["نضرب الأعداد خارج الجذور في بعضها، والأعداد داخل الجذور في بعضها.", `خارج الجذر: ${A(a)} × ${A(c)} = ${A(a * c)} ، داخل الجذر: ${A(b)} × ${A(d)} = ${A(b * d)}.`, `${h.rad(a * c, b * d)}${ans !== h.rad(a * c, b * d) ? ` = ${ans}` : ""}.`], explanation: ans };
      } },
      conj: { title: "ضرب المرافقين (الأول في الأول − الأخير في الأخير)", from: 760, to: 900, gen(R, h) {
        const A = h.A, p = R.int(5, 30), q = R.int(1, 3), r = R.pick([2, 3, 5]), v = p - q * q * r; if (v <= 0 || v > 20) return null;
        const tq = q === 1 ? h.rad(1, r) : h.rad(q, r), useInt = R.next() < .3, tq2 = useInt ? A(q) : tq, v2 = useInt ? p - q * q : v; if (v2 <= 0) return null;
        return { style: useInt ? "i" : "r", sig: `${p}:${q}:${r}:${useInt}`, body: `ما قيمة (${h.rad(1, p)} + ${tq2}) (${h.rad(1, p)} − ${tq2}) ؟`,
          ...h.numOptions(R, h.d(v2), [h.d(p + (useInt ? q * q : q * q * r)), h.d(Math.abs(v2 - 1) || v2 + 2), h.d(v2 * 2)]),
          steps: ["القوسان مترافقان، فنضرب الأول في الأول ونطرح منه الأخير في الأخير.", `${h.rad(1, p)} × ${h.rad(1, p)} = ${A(p)} ، و ${tq2} × ${tq2} = ${A(useInt ? q * q : q * q * r)}.`, `${A(p)} − ${A(useInt ? q * q : q * q * r)} = ${A(v2)}.`], explanation: A(v2) };
      } },
      ratio: { title: "التخلص من الجذر في المقام", from: 900, to: 1100, gen(R, h) {
        const A = h.A, b = R.pick([2, 3, 5, 6, 7, 10, 15]), a = R.int(1, 4) * R.pick([1, b, 2]); if (a > 30) return null;
        const ans = rfrac(h, a, b, b);
        return { style: a % b ? "n" : "m", sig: `${a}:${b}`, body: `أوجد في أبسط صورة: ${h.frac(A(a), h.rad(1, b))}`,
          ...h.strOptions(R, ans, [rfrac(h, a, b, 1) === ans ? h.frac(h.rad(1, b), A(a)) : rfrac(h, a, b, 1), h.frac(A(a), A(b)), rfrac(h, b, a, a) === ans ? rfrac(h, a + 1, b, b) : rfrac(h, b, a, a), rfrac(h, a, b, 2 * b)]),
          steps: [`نضرب البسط والمقام في ${h.rad(1, b)}: ${h.frac(`${A(a)} × ${h.rad(1, b)}`, `${h.rad(1, b)} × ${h.rad(1, b)}`)} = ${h.frac(h.rad(a, b), A(b))}.`, `نختصر: ${ans}.`], explanation: ans };
      } },
      conjDen: { title: "الضرب في مرافق المقام", from: 1100, to: 1240, gen(R, h) {
        const A = h.A, [m, c] = R.pick([[2, 1], [3, 1], [5, 1], [3, 2], [5, 2], [7, 2], [10, 3], [11, 3], [6, 2], [8, 3]]), s = R.next() < .5 ? 1 : -1, D = m - c * c, k = Math.abs(D) * R.int(1, 5);
        if (k < 2) return null; const co = k / D, cst = -s * co * c;
        const ans = lin(h, co, m, cst), den = `${h.rad(1, m)} ${s > 0 ? "+" : "−"} ${A(c)}`;
        return { style: s > 0 ? "p" : "m", sig: `${m}:${c}:${s}:${k}`, body: `أوجد في أبسط صورة: ${h.frac(A(k), den)}`,
          ...h.strOptions(R, ans, [lin(h, co, m, -cst), lin(h, -co, m, cst), lin(h, k, m, -s * k * c), lin(h, co + (co > 0 ? 1 : -1), m, cst)]),
          steps: [`مرافق المقام هو ${h.rad(1, m)} ${s > 0 ? "−" : "+"} ${A(c)} ، نضرب فيه البسط والمقام.`, `المقام = (${h.rad(1, m)})² − ${A(c)}² = ${A(m)} − ${A(c * c)} = ${S(h, D)}.`, `البسط = ${A(k)} (${h.rad(1, m)} ${s > 0 ? "−" : "+"} ${A(c)}) ، وبالقسمة على ${S(h, D)} يكون الناتج ${ans}.`], explanation: ans };
      } },
      cross: { title: "تبسيط حاصل ضرب كسرين جذريين", from: 1320, to: 1470, gen(R, h) {
        const A = h.A, p = R.pick([2, 3, 5, 7, 11]), q = R.pick([2, 3, 5, 7, 13]); if (p === q) return null;
        const ans = h.rad(1, p * q);
        return { style: "x", sig: `${p}:${q}`, body: `بسّط المقدار: ${h.frac(A(p), h.rad(1, q))} × ${h.frac(A(q), h.rad(1, p))}`,
          ...h.strOptions(R, ans, [h.rad(1, p * q + 1), A(p * q), h.rad(1, p + q), h.frac(A(p * q), h.rad(1, p * q * 2))]),
          steps: [`كل عدد يساوي جذره × جذره: ${A(p)} = ${h.rad(1, p)} × ${h.rad(1, p)}.`, `نختصر ${h.rad(1, p)} مع ${h.rad(1, p)} و ${h.rad(1, q)} مع ${h.rad(1, q)} فيبقى ${h.rad(1, q)} × ${h.rad(1, p)}.`, `الناتج = ${ans}.`], explanation: ans };
      } },
      diff: { title: "جمع وطرح كسور جذرية متشابهة", from: 1480, to: 1560, gen(R, h) {
        const A = h.A, m = R.pick([2, 3, 5, 6, 7]), k = R.int(2, 5), plus = R.next() < .35, n = k * k * m;
        const ans = plus ? rfrac(h, 2 * k, m, m) : "صفر";
        return { style: plus ? "p" : "z", sig: `${m}:${k}:${plus}`, body: `أوجد قيمة ${h.frac(h.rad(1, n), A(m))} ${plus ? "+" : "−"} ${h.frac(A(k), h.rad(1, m))}`,
          ...h.strOptions(R, ans, plus ? ["صفر", h.rad(1, m), rfrac(h, k, m, m), A(2 * k)] : [A(1), h.rad(1, m), rfrac(h, 2 * k, m, m), A(k)]),
          steps: [`${h.rad(1, n)} = ${h.rad(k, m)} ، فالكسر الأول = ${h.frac(h.rad(k, m), A(m))}.`, `نضرب الكسر الثاني بسطًا ومقامًا في ${h.rad(1, m)}: ${h.frac(A(k), h.rad(1, m))} = ${h.frac(h.rad(k, m), A(m))}.`, plus ? `المجموع = ${h.frac(h.rad(2 * k, m), A(m))} = ${ans}.` : "الكسران متساويان، فالفرق = صفر."], explanation: ans };
      } },
      fracRoots: { title: "قسمة مقدار جذري بعد التبسيط", from: 1600, to: 1720, gen(R, h) {
        const A = h.A, m = R.pick([2, 3, 5]), a = R.int(2, 5), p = R.int(2, 4), b = R.int(1, 3), q = R.int(1, 3), top = a * p - b * q; if (top <= 0) return null;
        const c = R.pick([1, 2, 3, 4, 5].filter(x => top % x === 0 && x > 1)); if (!c) return null; const v = top / c;
        return { style: "r" + m, sig: `${m}:${a}:${p}:${b}:${q}:${c}`, body: `أوجد قيمة ${h.frac(`${h.rad(a, p * p * m)} − ${h.rad(b, q * q * m)}`, h.rad(c, m))}`,
          ...h.numOptions(R, h.d(v), [h.d(top), h.d(v + 1), h.d(a * p)]),
          steps: [`نبسط الجذرين: ${h.rad(a, p * p * m)} = ${h.rad(a * p, m)} ، و ${h.rad(b, q * q * m)} = ${h.radS(b * q, m)}.`, `البسط = ${h.radS(a * p, m)} − ${h.radS(b * q, m)} = ${h.radS(top, m)}.`, `${h.radS(top, m)} ÷ ${h.rad(c, m)} = ${A(top)} ÷ ${A(c)} = ${A(v)}.`], explanation: A(v) };
      } },
      same: { title: "قسمة مجموع جذور متشابهة", from: 1720, to: 1830, gen(R, h) {
        const A = h.A, m = R.pick([2, 3, 5, 7, 11, 13]), t = R.pick([2, 3, 5, 6, 4, 9]), n = m * t, k = R.int(2, 3);
        const ans = h.radS(1, t), sum = x => Array(k).fill(h.rad(1, x)).join(" + ");
        return { style: "s" + k, sig: `${m}:${t}:${k}`, body: `ما قيمة ${h.frac(sum(n), sum(m))} ؟`,
          ...h.strOptions(R, ans, [A(t), h.radS(k, t), h.radS(1, t + 1), A(k)]),
          steps: [`البسط = ${h.rad(k, n)} ، والمقام = ${h.rad(k, m)}.`, `نختصر العدد ${A(k)}: ${h.frac(h.rad(1, n), h.rad(1, m))} = ${h.rad(1, h.frac(A(n), A(m)))} = ${h.rad(1, t)}.`, `الناتج = ${ans}.`], explanation: ans };
      } },
      recip: { title: "مقلوب مقدار جذري والقسمة", from: 1830, to: 2040, gen(R, h) {
        const A = h.A, [b, d] = R.pick([[3, 2], [2, 3], [5, 2], [2, 5], [3, 5], [5, 3]]), a = R.int(1, 4), c = R.int(1, 4);
        const ans = rfrac(h, a, b * d, c * d), x = h.frac(A(1), a === 1 ? h.rad(1, b) : h.rad(a, b)), y = h.frac(A(1), c === 1 ? h.rad(1, d) : h.rad(c, d));
        return { style: "r", sig: `${a}:${b}:${c}:${d}`, body: `إذا كانت س = ${x} ، ص = ${y}\nفأوجد قيمة ${h.frac("١", "س")} ÷ ${h.frac("١", "ص")}`,
          ...h.strOptions(R, ans, [rfrac(h, c, b * d, a * b), rfrac(h, a, b * d, c * b) === ans ? rfrac(h, a, b * d, 1) : rfrac(h, a, b * d, c * b), h.rad(1, b * d), rfrac(h, a * c, b * d, 1)]),
          steps: [`مقلوب س = ${a === 1 ? h.rad(1, b) : h.rad(a, b)} ، ومقلوب ص = ${c === 1 ? h.rad(1, d) : h.rad(c, d)}.`, `${h.frac(a === 1 ? h.rad(1, b) : h.rad(a, b), c === 1 ? h.rad(1, d) : h.rad(c, d))} نضربه بسطًا ومقامًا في ${h.rad(1, d)}.`, `= ${h.frac(a === 1 ? h.rad(1, b * d) : h.rad(a, b * d), A(c * d))}${ans !== h.frac(a === 1 ? h.rad(1, b * d) : h.rad(a, b * d), A(c * d)) ? ` = ${ans}` : ""}.`], explanation: ans };
      } },
      prod: { title: "جذر حاصل ضرب عدة أعداد", from: 2040, to: 2110, gen(R, h) {
        const A = h.A, s = R.int(6, 30), N = s * s, divs = []; for (let i = 2; i <= 100; i++) if (N % i === 0) divs.push(i);
        const a = R.pick(divs), b = R.pick(divs.filter(x => (N / a) % x === 0)); if (!b) return null; const c = N / a / b; if (c < 2 || c > 100 || a === b && b === c) return null;
        return { style: "p", sig: `${[a, b, c].sort((x, y) => x - y).join(":")}`, body: `أوجد ${h.rad(1, `${A(a)} × ${A(b)} × ${A(c)}`)}`,
          ...h.numOptions(R, h.d(s), [h.d(s + 2), h.d(a + b + c), h.d(s * 2)]),
          steps: [`نحلل الأعداد ونجمعها في أزواج متساوية: ${A(a)} × ${A(b)} × ${A(c)} = ${A(N)} = ${A(s)} × ${A(s)}.`, `${h.rad(1, `${A(s)} × ${A(s)}`)} = ${A(s)}.`], explanation: A(s) };
      } },
      divR: { title: "قسمة جذر على جذر", from: 2110, to: 2275, gen(R, h) {
        const A = h.A, q = R.pick([2, 3, 5, 6, 7]), t = R.pick([2, 3, 5, 7, 4, 9, 8, 12]), p = q * t; if (p > 120) return null;
        const ans = h.radS(1, t);
        return { style: "d", sig: `${p}:${q}`, body: `أوجد ناتج ${h.frac(h.rad(1, p), h.rad(1, q))}`,
          ...h.strOptions(R, ans, [A(t), h.rad(1, p - q), h.radS(1, t + 1), A(q)]),
          steps: [`${h.frac(h.rad(1, p), h.rad(1, q))} = ${h.rad(1, h.frac(A(p), A(q)))}.`, `${A(p)} ÷ ${A(q)} = ${A(t)} ، فالناتج = ${ans}.`, "ويمكن الحل بالضرب في المرافق ثم الاختصار، والنتيجة واحدة."], explanation: ans };
      } }
    }
  };
})();
