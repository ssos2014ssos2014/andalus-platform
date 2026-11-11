// المحاضرة 52: المسائل اللفظية (المعادلات وتجريب الخيارات)
(() => {
  const N = (h, x) => Number.isInteger(x) ? h.A(x) : h.fx(h.d(String(+x.toFixed(2))));
  const TIP = "حيلة سريعة: جرّب الخيارات في شروط المسألة، والخيار الذي يحققها كلها هو الصحيح.";
  window.EXAMS[52] = {
    title: "اختبار محاكي: المسائل اللفظية", minutes: 25,
    blueprint: [["two", 3], ["sys", 3], ["chain", 3], ["inc", 2], ["frac", 3], ["digits", 3], ["divRem", 2], ["rev", 3], ["ages", 2]],
    skills: {
      two: { title: "شيئان مجموعهما معلوم وأحدهما مضاعف الآخر", from: 0, to: 230, gen(R, h) {
        const A = h.A, k = R.int(2, 5), x = R.int(3, 30), S = x * (k + 1), [a, b] = R.pick([["الكتاب", "الحقيبة"], ["القلم", "الكتاب"], ["الكرة", "المضرب"]]), askSmall = R.next() < .6;
        return { style: "t" + askSmall, sig: `${k}:${x}:${askSmall}`, body: `${a.replace("ال", "")} و${b.replace("ال", "")} قيمتهما معًا ${A(S)} ريال، إذا كان سعر ${b} ${k === 2 ? "ضعف" : A(k) + " أمثال"} سعر ${a}، فأوجد سعر ${askSmall ? a : b}`,
          ...h.strOptions(R, `${A(askSmall ? x : k * x)} ريال`, [`${A(askSmall ? k * x : x)} ريال`, `${A(S / 2 | 0)} ريال`, `${A((askSmall ? x : k * x) + k)} ريال`]),
          steps: [`نفرض سعر ${a} = س ، فسعر ${b} = ${A(k)}س.`, `س + ${A(k)}س = ${A(S)} ، ${A(k + 1)}س = ${A(S)} ، س = ${A(x)}.`, TIP], explanation: `${A(askSmall ? x : k * x)} ريال` };
      } },
      sys: { title: "معادلتان بمجهولين", from: 230, to: 400, gen(R, h) {
        const A = h.A, x = R.int(5, 40), y = R.int(2, 30), a = R.int(2, 4), c = R.int(a + 2, 10), d = R.int(1, 3); if (c === a * d) return null; const s1 = a * x + y, s2 = c * x + d * y;
        return { style: "s", sig: `${x}:${y}:${a}:${c}:${d}`, body: `إذا كان ثمن ${A(a)} آلات حاسبة وقلم = ${A(s1)} ريال، وثمن ${A(c)} آلات حاسبة و${d === 1 ? " قلم" : d === 2 ? " قلمين" : ` ${A(d)} أقلام`} = ${A(s2)} ريال، فكم سعر الآلة الحاسبة؟`,
          ...h.numOptions(R, h.d(x), [h.d(y), h.d(x + 5), h.d(Math.round(s1 / a))]),
          steps: [`${A(a)}س + ص = ${A(s1)} ، ${A(c)}س + ${A(d)}ص = ${A(s2)}.`, `نضرب الأولى في ${A(d)} ونطرح: ${A(c - a * d)}س = ${A(s2 - d * s1)}.`, `س = ${A(x)} ريال.`], explanation: A(x) };
      } },
      chain: { title: "ثلاثة أشياء مرتبطة بنسب", from: 400, to: 700, gen(R, h) {
        const A = h.A, x = R.int(2, 15) * 4 * 10, s = x / 2, t = s / 2, T = x + s + t, ask = R.pick([1, 2, 3]), v = [x, s, t][ask - 1];
        return { style: "c" + ask, sig: `${x}:${ask}`, body: `اشترت امرأة ٣ عطور، قيمة الثاني نصف قيمة الأول، وقيمة الثالث نصف قيمة الثاني، وكان المجموع ${A(T)} ريال. ما سعر العطر ${["", "الأول", "الثاني", "الثالث"][ask]}؟`,
          ...h.numOptions(R, h.d(v), [x, s, t, T / 3].filter(z => z !== v).slice(0, 3).map(z => h.d(Math.round(z)))),
          steps: ["نفرض الأول = ٤س ، فالثاني = ٢س ، والثالث = س.", `٧س = ${A(T)} ، س = ${A(t)}.`, `المطلوب = ${A(v)} ريال.`], explanation: A(v) };
      } },
      inc: { title: "أشياء تزيد بفرق ثابت", from: 1300, to: 1400, gen(R, h) {
        const A = h.A, n = R.int(3, 5), d = R.int(1, 10), a = R.int(20, 120), T = n * a + d * n * (n - 1) / 2;
        return { style: "i", sig: `${n}:${d}:${a}`, body: `اشترى رجل ${A(n)} سلع، كل سلعة تزيد عن التي قبلها بـ ${A(d)} ريال، فإذا دفع ${A(T)} ريال، فما ثمن السلعة الأولى؟`, ...h.numOptions(R, h.d(a), [h.d(a + d), h.d(Math.round(T / n)), h.d(a - d > 0 ? a - d : a + 2 * d)]),
          steps: [`المجموع = ${A(n)}س + (${Array.from({ length: n }, (_, i) => A(i * d)).join(" + ")}) = ${A(n)}س + ${A(d * n * (n - 1) / 2)}.`, `${A(n)}س = ${A(T - d * n * (n - 1) / 2)} ، س = ${A(a)}.`], explanation: A(a) };
      } },
      frac: { title: "عدد أُضيف إليه مثله وأجزاؤه", from: 1370, to: 1450, gen(R, h) {
        const A = h.A, parts = R.pick([[1, 0.5, 0.25], [1, 0.5], [0.5, 0.25], [1, 1 / 3], [2, 0.5]]), base = 12 * R.int(1, 6), mult = 1 + parts.reduce((a, b) => a + b), T = base * mult; if (!Number.isInteger(T)) return null;
        const txt = parts.map(p => p === 1 ? "مثله" : p === 2 ? "مثليه" : p === 0.5 ? "نصفه" : p === 0.25 ? "ربعه" : "ثلثه").join(" و");
        return { style: parts.join(","), sig: `${parts.join(",")}:${base}`, body: `ما العدد الذي إذا أضيف إليه ${txt} يصبح ${A(T)}؟`, ...h.numOptions(R, h.d(base), [h.d(base + 6), h.d(base - 6 > 0 ? base - 6 : base + 12), h.d(Math.round(T / 2))]),
          steps: [`العدد × (١ + ${parts.map(p => N(h, p)).join(" + ")}) = ${A(T)} ، أي العدد × ${N(h, mult)} = ${A(T)}.`, `العدد = ${A(base)}.`, `تحقق: ${A(base)} + ${parts.map(p => N(h, base * p)).join(" + ")} = ${A(T)}.`], explanation: A(base) };
      } },
      digits: { title: "عدد من رقمين بشروط على أرقامه", from: 1450, to: 1520, gen(R, h) {
        const A = h.A, u = R.int(1, 7), d = R.int(1, 9 - u), t = u + d, n = 10 * t + u, s = t + u, k = R.pick([3, 5, 2]), q = R.pick([7, 3, 2, 5]); if ((k * s) % q) return null; const res = k * s / q;
        const cands = []; for (let m = 10; m < 100; m++) { const tt = Math.floor(m / 10), uu = m % 10; if (tt - uu === d && (k * (tt + uu)) % q === 0 && k * (tt + uu) / q === res) cands.push(m); } if (cands.length !== 1) return null;
        const wrong = [n + 10, n - 10, n + 11].filter(z => z > 9 && z < 100 && z !== n).slice(0, 3); if (wrong.length < 3) wrong.push(n + 1);
        return { style: "d", sig: `${n}:${k}:${q}`, body: `عدد مكوّن من آحاد وعشرات، العشرات أكبر من الآحاد بـ ${A(d)} ، وإذا أوجدنا ${A(k)} أمثال مجموع رقميه ثم قسمناه على ${A(q)} كان الناتج ${A(res)}. فما هو العدد؟`,
          ...h.strOptions(R, A(n), wrong.slice(0, 3).map(A)),
          steps: [TIP, `مجموع الرقمين = ${A(res)} × ${A(q)} ÷ ${A(k)} = ${A(s)} ، والفرق بينهما ${A(d)}.`, `الرقمان ${A(t)} و ${A(u)} ، فالعدد ${A(n)}.`], explanation: A(n) };
      } },
      divRem: { title: "عدد يقبل القسمة على أعداد وله باقٍ مع آخر", from: 1520, to: 1580, gen(R, h) {
        const A = h.A, [p, q] = R.pick([[7, 3], [4, 5], [6, 5], [3, 8]]), m = R.pick([9, 11, 13]), r = R.int(1, m - 1), L = p * q, cands = []; for (let n = L; n < 1000; n += L) if (n % m === r) cands.push(n); if (!cands.length) return null;
        const v = cands[0], wrong = [v + L, v - L, v + m].filter(z => z > 0 && z % m !== r || z % L !== 0).slice(0, 3);
        return { style: "r", sig: `${p}:${q}:${m}:${r}`, body: `عدد يقبل القسمة على ${A(p)} و ${A(q)} بدون باقٍ، وباقي قسمته على ${A(m)} هو ${A(r)}. فأي الأعداد الآتية يحقق ذلك؟`, ...h.strOptions(R, A(v), wrong.map(A)),
          steps: [TIP, `${A(v)} ÷ ${A(L)} = ${A(v / L)} (يقبل القسمة على ${A(p)} و ${A(q)}).`, `${A(v)} ÷ ${A(m)} = ${A(Math.floor(v / m))} والباقي ${A(r)} ✓.`], explanation: A(v) };
      } },
      rev: { title: "العمليات العكسية", from: 1560, to: 1800, gen(R, h) {
        const A = h.A, k = R.int(2, 9), c = R.int(1, 20), x = R.int(1, 20) / (R.next() < .4 ? 2 : 1), v = k * x + c;
        return { style: "r", sig: `${k}:${c}:${x}`, body: `ضُرب عدد في ${A(k)} وجُمع عليه ${A(c)} فأصبح الناتج ${N(h, v)}. فما هو العدد؟`, ...h.strOptions(R, N(h, x), [N(h, (v + c) / k), N(h, v / k), N(h, x + 1)].map(z => z === N(h, x) ? N(h, x + 2) : z)),
          steps: ["نعكس العمليات: نطرح أولًا ثم نقسم.", `${N(h, v)} − ${A(c)} = ${N(h, v - c)}.`, `${N(h, v - c)} ÷ ${A(k)} = ${N(h, x)}.`], explanation: N(h, x) };
      } },
      ages: { title: "مجموع عمرين والفرق بينهما", from: 1800, to: 2250, gen(R, h) {
        const A = h.A, a = R.int(10, 60), b = R.int(5, a - 1), ask = R.pick(["big", "small"]);
        return { style: ask, sig: `${a}:${b}:${ask}`, body: `مجموع عمري أب وابنه ${A(a + b)} سنة، والفرق بين عمريهما ${A(a - b)} سنة. فكم عمر ${ask === "big" ? "الأب" : "الابن"}؟`, ...h.numOptions(R, h.d(ask === "big" ? a : b), [h.d(ask === "big" ? b : a), h.d(Math.round((a + b) / 2)), h.d((ask === "big" ? a : b) + 2)]),
          steps: [`الأكبر = (المجموع + الفرق) ÷ ٢ = (${A(a + b)} + ${A(a - b)}) ÷ ٢ = ${A(a)}.`, `الأصغر = (المجموع − الفرق) ÷ ٢ = ${A(b)}.`], explanation: A(ask === "big" ? a : b) };
      } }
    }
  };
})();
