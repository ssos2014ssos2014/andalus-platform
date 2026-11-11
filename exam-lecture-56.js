// المحاضرة 56: المقارنة مع المتباينات والتجربة بالتعويض
(() => {
  const TIP = "في المقارنات مع شروط: جرّب قيمًا مختلفة تحقق الشرط (صحيحة وكسرية وأصغر قيمة وأكبرها). إن تغيّر اتجاه المقارنة فالمعلومات غير كافية.";
  const idx = { gt: 0, lt: 1, eq: 2, na: 3 };
  // يحدد العلاقة بتجريب عينة كبيرة من القيم
  const judge = (samples, f, g) => { let gt = 0, lt = 0, eq = 0; for (const s of samples) { const d = f(...s) - g(...s); if (Math.abs(d) < 1e-9) eq++; else if (d > 0) gt++; else lt++; } return gt && !lt && !eq ? "gt" : lt && !gt && !eq ? "lt" : eq && !gt && !lt ? "eq" : "na"; };
  const range = (a, b, n, int) => int ? Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i) : Array.from({ length: n }, (_, i) => a + (b - a) * (i + .5) / n);
  const mk = (h, cond, first, second, rel, sig, steps) => { const o = h.cmpAnswer(h.d(0), h.d(0)).options; return { style: rel, sig, body: h.cmpBody(cond, first, second), options: o, correct: idx[rel], steps: [TIP, ...steps], explanation: o[idx[rel]] }; };
  const name = { gt: "القيمة الأولى أكبر دائمًا", lt: "القيمة الثانية أكبر دائمًا", eq: "القيمتان متساويتان دائمًا", na: "الاتجاه يتغير بحسب القيمة، فالمعلومات غير كافية" };
  window.EXAMS[56] = {
    title: "اختبار محاكي: المقارنات مع المتباينات", minutes: 25,
    blueprint: [["lin", 5], ["frac", 4], ["consec", 3], ["posInt", 3], ["order", 2], ["pow", 4], ["sign", 3]],
    skills: {
      lin: { title: "مقارنة مقدارين خطيين بشرط متباينة", from: 0, to: 90, gen(R, h) {
        const A = h.A, k = R.int(1, 9), a = R.int(1, 4), b = R.int(0, 9), c = R.int(1, 9), d = R.int(1, 3), up = R.next() < .7;
        const samples = (up ? [k + .001, k + .5, k + 1, k + 3, k + 10, k + 100] : [k - .001, k - .5, k - 1, k - 5, 0, -10]).map(x => [x]);
        const f = x => a * x + b, gf = x => (c * x + k * c) / (d * c) ; const g2 = x => (c + c * x) / d;
        const rel = judge(samples, x => a * x + b, x => (k * c + c * x) / (c + d));
        const second = h.frac(`${A(k * c)} + ${A(c)}س`, A(c + d));
        return mk(h, `إذا كان س ${up ? ">" : "<"} ${A(k)}`, `${a === 1 ? "" : A(a)}س${b ? " + " + A(b) : ""}`, second, rel, `${k}:${a}:${b}:${c}:${d}:${up}`,
          [`عند س = ${A(up ? k + 1 : k - 1)}: الأولى = ${h.fx(h.d(String(+(a * (up ? k + 1 : k - 1) + b).toFixed(2))))} ، والثانية = ${h.fx(h.d(String(+((k * c + c * (up ? k + 1 : k - 1)) / (c + d)).toFixed(2))))}.`, `${name[rel]}.`]);
      } },
      frac: { title: "أي المقادير أكبر عندما يكون العدد بين صفر و١", from: 90, to: 225, gen(R, h) {
        const A = h.A, mode = R.pick(["x", "xy"]);
        if (mode === "x") { const ex = [["س", x => x], ["س²", x => x * x], ["√{س}", x => Math.sqrt(x)], [h.frac("١", "س"), x => 1 / x], ["س³", x => x ** 3]], pick = R.shuffle(ex).slice(0, 4), big = R.next() < .6;
          const xs = [.1, .3, .5, .8, .95]; const order = pick.map(([n, f]) => [n, xs.map(f)]); const best = order.find(([, v]) => order.every(([, w]) => v.every((z, i) => big ? z >= w[i] : z <= w[i])));
          if (!best) return null;
          return { style: "x" + big, sig: pick.map(p => p[0]).join(",") + big, body: `إذا كان ٠ < س < ١ ، فأيّ الآتي ${big ? "أكبر" : "أصغر"}؟`, ...h.strOptions(R, best[0], pick.filter(p => p[0] !== best[0]).map(p => p[0])),
            steps: [TIP, "جرّب س = ½: " + pick.map(([n, f]) => `${n} = ${h.fx(h.d(String(+f(.5).toFixed(3))))}`).join(" ، ") + ".", `الأ${big ? "كبر" : "صغر"} ${best[0]}.`], explanation: best[0] }; }
        const ex = [[h.frac("ص", "س"), (x, y) => y / x], [h.frac("س", "ص"), (x, y) => x / y], [`(${h.frac("س", "ص")})²`, (x, y) => (x / y) ** 2], [`(${h.frac("ص", "س")})²`, (x, y) => (y / x) ** 2]];
        return { style: "xy", sig: "xy", body: "إذا كان ص > ١ ، و ١ > س > صفر ، فأيّ الآتي أكبر؟", ...h.strOptions(R, ex[3][0], ex.slice(0, 3).map(e => e[0])),
          steps: [TIP, "جرّب ص = ٢ و س = ½: ⟦ص/س⟧ = ٤ ، ⟦س/ص⟧ = ¼ ، (⟦ص/س⟧)² = ١٦.", "الأكبر (⟦ص/س⟧)² لأن ⟦ص/س⟧ > ١ وتربيعه يكبّره."], explanation: ex[3][0] };
      } },
      consec: { title: "أعداد صحيحة متتالية مرتبة", from: 225, to: 1000, gen(R, h) {
        const A = h.A, isC = R.next() < .6, mode = R.pick(["ac_bd", "cb_ba"]);
        const samples = []; for (let d = -3; d <= 5; d++) { if (isC) samples.push([d + 3, d + 2, d + 1, d]); else for (const g1 of [1, 2, 3]) for (const g2 of [1, 2, 4]) for (const g3 of [1, 3]) samples.push([d + g1 + g2 + g3, d + g2 + g3, d + g3, d]); }
        const [f, g, L, Rr] = mode === "ac_bd" ? [(a, b, c, d) => a - c, (a, b, c, d) => b - d, "أ − ج", "ب − د"] : [(a, b, c, d) => a - b, (a, b, c, d) => c - d, "أ − ب", "ج − د"];
        const rel = judge(samples, f, g);
        return mk(h, `إذا كان أ > ب > ج > د ، وهي أعداد صحيحة${isC ? " متتالية" : ""}`, L, Rr, rel, `${isC}:${mode}`, [isC ? "في الأعداد المتتالية الفرق بين كل عددين متجاورين ١." : "الأعداد ليست بالضرورة متتالية، فالفروق قد تختلف.", `${name[rel]}.`]);
      } },
      posInt: { title: "أعداد صحيحة موجبة بشرط مجموع", from: 225, to: 450, gen(R, h) {
        const A = h.A, n = R.int(6, 14), k = R.int(2, 6), samples = []; for (let x = 1; x < n; x++) { const z = n - 2 * x; if (z >= 1) samples.push([x, z]); }
        const rel = judge(samples, () => k, (x) => x); if (!samples.length) return null;
        return mk(h, `إذا كانت س ، ص ، ع أعدادًا صحيحة موجبة، س + ص + ع = ${A(n)} ، س = ص`, A(k), "س", rel, `${n}:${k}`, [`٢س + ع = ${A(n)} ، و ع ≥ ١ ، فالقيم الممكنة لـ س: ${samples.map(s => A(s[0])).join(" ، ")}.`, `نقارنها بـ ${A(k)}: ${name[rel]}.`]);
      } },
      order: { title: "ترتيب أعداد موجبة وحواصل الضرب", from: 1000, to: 1100, gen(R, h) {
        const mode = R.pick(["ad_bc", "a_bc"]), samples = []; for (let d = 1; d <= 4; d++) for (let c = d + 1; c <= 6; c++) for (let b = c + 1; b <= 8; b++) for (let a = b + 1; a <= 12; a++) samples.push([a, b, c, d]);
        const [f, g, L, Rr] = mode === "ad_bc" ? [(a, b, c, d) => a * d, (a, b, c, d) => b * c, "أ × د", "ب × ج"] : [(a, b, c, d) => a + d, (a, b, c, d) => b + c, "أ + د", "ب + ج"];
        const rel = judge(samples, f, g);
        return mk(h, "إذا كان أ > ب > ج > د ، وهي أعداد صحيحة موجبة", L, Rr, rel, mode, ["جرّب: (٥ ، ٤ ، ٢ ، ١) ثم (١٠ ، ٣ ، ٢ ، ١).", `${name[rel]}.`]);
      } },
      pow: { title: "قوى عدد سالب بين −١ وصفر", from: 1100, to: 1700, gen(R, h) {
        const A = h.A, m = R.int(2, 7), n = R.int(2, 7), k = R.pick([1, 2, 6, 10]), lo = R.pick([[-1, 0], [0, 1]]);
        const sup = x => String(x).replace(/\d/g, c => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c]);
        const samples = range(lo[0] + .01, lo[1] - .01, 30).map(x => [x]);
        const rel = judge(samples, x => x ** m, x => k * x ** n);
        return mk(h, `إذا كان ${lo[0] < 0 ? "−١" : "٠"} < هـ < ${lo[1] === 0 ? "٠" : "١"}`, `هـ${sup(m)}`, `${k === 1 ? "" : A(k) + " × "}هـ${sup(n)}`, rel, `${m}:${n}:${k}:${lo}`,
          [lo[0] < 0 ? "هـ سالبة: الأس الزوجي يعطي موجبًا، والفردي يعطي سالبًا." : "هـ موجبة أقل من ١: كلما زاد الأس صغرت القيمة.", `جرّب هـ = ${lo[0] < 0 ? "−½" : "½"}: الأولى ${h.fx(h.d(String(+((lo[0] < 0 ? -.5 : .5) ** m).toFixed(4))))} ، والثانية ${h.fx(h.d(String(+(k * (lo[0] < 0 ? -.5 : .5) ** n).toFixed(4))))}.`, `${name[rel]}.`]);
      } },
      sign: { title: "مقارنات بإشارات مختلفة", from: 1700, to: 2041, gen(R, h) {
        const mode = R.pick(["xy_sum", "x2_y", "xy_x"]), samples = []; for (const x of [-5, -2, -1, -.5, -.1]) for (const y of [.1, .5, 1, 2, 5]) samples.push([x, y]);
        const m = { xy_sum: [(x, y) => x * y, (x, y) => x + y, "س × ص", "س + ص"], x2_y: [(x, y) => x * x, (x, y) => y, "س²", "ص"], xy_x: [(x, y) => x * y, (x, y) => x, "س × ص", "س"] }[mode];
        const rel = judge(samples, m[0], m[1]);
        return mk(h, "إذا كان س < ٠ < ص", m[2], m[3], rel, mode, ["جرّب: (س = −٢ ، ص = ٥) ثم (س = −½ ، ص = ½).", `${name[rel]}.`]);
      } }
    }
  };
})();
