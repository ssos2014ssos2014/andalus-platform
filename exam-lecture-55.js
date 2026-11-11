// المحاضرة 55: تمارين الكسور بالرسم، وتمارين الكلمات (أكبر من / أصغر من)
(() => {
  const g = (a, b) => b ? g(b, a % b) : a;
  const FR = (h, a, b) => { const k = g(a, b); return h.frac(h.A(a / k), h.A(b / k)); };
  const NAME = { "1/2": "نصف", "1/3": "ثلث", "1/4": "ربع", "1/5": "خمس", "1/6": "سدس", "1/7": "سبع", "1/8": "ثمن", "3/4": "ثلاثة أرباع", "2/3": "ثلثي", "3/5": "ثلاثة أخماس", "5/6": "خمسة أسداس" };
  const W = (a, b) => NAME[`${a}/${b}`];
  const DRAW = "ارسم الكل مستطيلًا مقسمًا إلى أجزاء متساوية بعدد المقام المشترك، ثم ظلّل ما يدل عليه كل كسر.";
  window.EXAMS[55] = {
    title: "اختبار محاكي: الكسور بالرسم وتمارين الكلمات", minutes: 25,
    blueprint: [["tank", 4], ["parts", 4], ["leave", 3], ["spend", 4], ["words", 4], ["half", 3], ["fof", 2]],
    skills: {
      tank: { title: "إضافة كمية تنقل الخزان من كسر إلى آخر", from: 0, to: 280, gen(R, h) {
        const A = h.A, [[a, b], [c, d]] = R.pick([[[1, 4], [3, 4]], [[1, 6], [1, 2]], [[1, 3], [2, 3]], [[1, 4], [1, 2]], [[1, 5], [3, 5]], [[1, 3], [5, 6]]]), L = b * d / g(b, d), parts = c * L / d - a * L / b, u = R.int(2, 10), V = u * parts, cap = u * L;
        return { style: `${a}${b}${c}${d}`, sig: `${a}/${b}:${c}/${d}:${u}`, body: `خزان ماء ممتلئ حتى ${W(a, b)}ه، أضيف إليه ${A(V)} لترًا فأصبح ممتلئًا حتى ${W(c, d)}ه. فما سعة الخزان كاملًا؟`.replace("ثلثيه", "ثلثيه"),
          ...h.numOptions(R, h.d(cap), [h.d(V * 2), h.d(cap + V), h.d(V)]),
          steps: [DRAW, `الفرق = ${FR(h, c, d)} − ${FR(h, a, b)} = ${FR(h, parts, L)} من الخزان = ${A(V)} لترًا.`, `الجزء (${FR(h, 1, L)}) = ${A(u)} ، فالسعة = ${A(u)} × ${A(L)} = ${A(cap)} لترًا.`], explanation: A(cap) };
      } },
      parts: { title: "أجزاء معلومة والباقي معلوم", from: 280, to: 500, gen(R, h) {
        const A = h.A, [[a, b], [c, d]] = R.pick([[[1, 4], [1, 2]], [[1, 3], [1, 2]], [[1, 4], [1, 3]], [[1, 5], [1, 2]], [[1, 6], [1, 3]]]), L = b * d / g(b, d), rest = L - a * L / b - c * L / d, u = R.int(2, 12), V = u * rest, T = u * L;
        return { style: "p", sig: `${a}/${b}:${c}/${d}:${u}`, body: `ثلاثة حفروا بئرًا، بحيث حفر الأول ${W(a, b)} البئر، والثاني ${W(c, d)} البئر، والثالث ${A(V)} مترًا. فكم عمق البئر؟`,
          ...h.numOptions(R, h.d(T), [h.d(V * 2), h.d(T + V), h.d(V * 3)]),
          steps: [DRAW, `ما حفره الأول والثاني = ${FR(h, a, b)} + ${FR(h, c, d)} = ${FR(h, L - rest, L)} ، والباقي ${FR(h, rest, L)} = ${A(V)} م.`, `العمق = ${A(V)} × ${FR(h, L, rest)} = ${A(T)} م.`], explanation: A(T) };
      } },
      leave: { title: "مغادرة كسور متتالية من الباقي", from: 600, to: 800, gen(R, h) {
        const A = h.A, [p, q] = R.pick([[2, 3], [2, 4], [3, 4], [2, 5], [4, 3]]), rem = R.int(2, 10), T = rem * p * q / ((p - 1) * (q - 1)); if (!Number.isInteger(T)) return null;
        const after1 = T - T / p; if (!Number.isInteger(after1)) return null;
        return { style: "l", sig: `${p}:${q}:${rem}`, body: `غادر القاعة ${W(1, p)} عدد الطلاب، ثم غادر ${W(1, q)} الباقين، فتبقى فيها ${A(rem)} طلاب. فما عدد الطلاب في القاعة؟`, ...h.numOptions(R, h.d(T), [h.d(after1), h.d(rem * p), h.d(T + rem)]),
          steps: [`بعد المغادرة الثانية بقي ${FR(h, q - 1, q)} الباقين = ${A(rem)} ، فالباقون بعد الأولى = ${A(after1)}.`, `بعد الأولى بقي ${FR(h, p - 1, p)} الكل = ${A(after1)} ، فالكل = ${A(T)}.`], explanation: A(T) };
      } },
      spend: { title: "صرف كسور متتالية من الباقي", from: 800, to: 980, gen(R, h) {
        const A = h.A, fr = R.pick([[8, 7, 6], [5, 4, 3], [4, 3, 2], [6, 5, 4], [3, 4]]), base = fr.reduce((a, b) => a * b, 1), k = R.int(1, 6) * 100, T = base * k / (fr.length === 2 ? 1 : 1);
        let r = T; const st = []; for (const f of fr) { const s = r / f; st.push([f, r, s]); r -= s; } if (!st.every(([, , s]) => Number.isInteger(s))) return null;
        return { style: "s" + fr.length, sig: `${fr.join("")}:${k}`, body: `أخذ شخص قرضًا بمبلغ ${A(T)} ريال، ${st.map(([f], i) => i === 0 ? `صرف ${W(1, f)}ه في الديون` : i === 1 ? `وصرف ${W(1, f)} الباقي في المأكل` : `وصرف ${W(1, f)} الباقي في العلاج`).join("، ")}. فكم ريالًا تبقى معه؟`,
          ...h.numOptions(R, h.d(r), [h.d(T - st.reduce((a, [, , s]) => a + T / st[0][0], 0) > 0 ? T - st.length * (T / st[0][0]) : r + k), h.d(r + st[st.length - 1][2]), h.d(T / 2)]),
          steps: st.map(([f, rr, s]) => `${W(1, f)} ${A(rr)} = ${A(s)} ، فيبقى ${A(rr - s)}.`).concat([`المتبقي = ${A(r)} ريال. (انتبه: كل كسر من الباقي لا من المبلغ الأصلي)`]), explanation: A(r) };
      } },
      words: { title: "تمارين «أكبر من» و«أصغر من» بالرسم", from: 960, to: 1727, gen(R, h) {
        const A = h.A, K = R.int(30, 90) * 100, a = R.int(2, 9) * 100, b = R.int(2, 9) * 100, M = K - b, S = M + a, ask = R.pick(["S", "M"]);
        return { style: ask, sig: `${K}:${a}:${b}:${ask}`, body: `مرتب سليمان أكبر من مرتب محمد بـ ${A(a)} ريال، ومرتب محمد أصغر من مرتب خالد بمقدار ${A(b)} ريال. فما مرتب ${ask === "S" ? "سليمان" : "محمد"} إذا كان مرتب خالد ${A(K)} ريال؟`,
          ...h.numOptions(R, h.d(ask === "S" ? S : M), [h.d(K + a), h.d(K + a + b), h.d(ask === "S" ? M : S)]),
          steps: ["نرسم: خالد في الأعلى، ومحمد أقل منه، وسليمان أعلى من محمد.", `محمد = ${A(K)} − ${A(b)} = ${A(M)}.`, `سليمان = ${A(M)} + ${A(a)} = ${A(S)}.`], explanation: A(ask === "S" ? S : M) };
      } },
      half: { title: "كسر من عدد مضافًا إليه عدد", from: 500, to: 600, gen(R, h) {
        const A = h.A, [a, b] = R.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]), x = b * R.int(2, 15), c = R.int(1, 20), v = a * x / b + c;
        return { style: "h", sig: `${a}/${b}:${x}:${c}`, body: `عدد إذا أخذنا ${W(a, b)}ه وأضفنا إليه ${A(c)} كان الناتج ${A(v)}. فما العدد؟`.replace("ثلثيه", "ثلثيه"), ...h.numOptions(R, h.d(x), [h.d(v - c), h.d(v * b / a | 0), h.d(x + b)]),
          steps: [`${FR(h, a, b)} العدد = ${A(v)} − ${A(c)} = ${A(v - c)}.`, `العدد = ${A(v - c)} × ${FR(h, b, a)} = ${A(x)}.`], explanation: A(x) };
      } },
      fof: { title: "كسر من كسر من عدد", from: 980, to: 1200, gen(R, h) {
        const A = h.A, [a, b] = R.pick([[1, 2], [1, 3], [2, 3], [3, 4], [1, 4]]), [c, d] = R.pick([[1, 2], [1, 5], [2, 5], [3, 4], [1, 3]]), N = b * d * R.int(1, 10), v = a * c * N / (b * d);
        return { style: "o", sig: `${a}/${b}:${c}/${d}:${N}`, body: `كم يساوي ${FR(h, a, b)} من ${FR(h, c, d)} العدد ${A(N)}؟`, ...h.numOptions(R, h.d(v), [h.d(c * N / d), h.d(a * N / b), h.d(v * 2)]),
          steps: [`${FR(h, c, d)} × ${A(N)} = ${A(c * N / d)}.`, `${FR(h, a, b)} × ${A(c * N / d)} = ${A(v)}.`], explanation: A(v) };
      } }
    }
  };
})();
