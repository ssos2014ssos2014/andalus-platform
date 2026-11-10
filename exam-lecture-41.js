// المحاضرة 41: متباينة المثلث، المثلث المتطابق الضلعين، نظرية فيثاغورس ومثلثاتها المشهورة
(() => {
  const TR = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 12, 15], [12, 16, 20], [1.5, 2, 2.5], [20, 21, 29]];
  const N = (h, x) => Number.isInteger(x) ? h.A(x) : h.fx(h.d(String(x)));
  const PY = "في المثلث القائم: (الوتر)² = مجموع مربعي الضلعين الآخرين. لإيجاد الوتر: ربّع واجمع ثم خذ الجذر، ولإيجاد ضلع: ربّع واطرح ثم خذ الجذر.";
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  window.EXAMS[41] = {
    title: "اختبار محاكي: متباينة المثلث وفيثاغورس", minutes: 25,
    blueprint: [["ineq", 3], ["ineqCmp", 2], ["perim", 1], ["isos", 3], ["circle", 1], ["hyp", 4], ["leg", 4], ["two", 3], ["triple", 3]],
    skills: {
      ineq: { title: "متباينة المثلث: الضلع الثالث بين الفرق والمجموع", from: 0, to: 200, gen(R, h) {
        const A = h.A, a = R.int(3, 12), b = R.int(a + 1, 20), lo = b - a, hi = a + b, not = R.next() < .6;
        const valid = Array.from({ length: hi - lo - 1 }, (_, i) => lo + 1 + i), invalid = [lo, hi, hi + 1, hi + 2, Math.max(1, lo - 1)].filter(x => x > 0);
        if (valid.length < 3) return null;
        const ans = not ? R.pick(invalid) : R.pick(valid), others = R.shuffle(not ? valid : invalid).slice(0, 3);
        return { style: "i" + not, sig: `${a}:${b}:${not}:${ans}`, body: `مثلث طولا ضلعين فيه ${A(a)} سم و ${A(b)} سم ، فأيّ مما يأتي ${not ? "لا يصلح" : "يصلح"} أن يكون طول الضلع الثالث؟`, ...h.strOptions(R, A(ans), others.map(A)),
          steps: ["مجموع أي ضلعين أكبر من الضلع الثالث، والفرق بينهما أصغر منه.", `${A(b)} − ${A(a)} < الضلع الثالث < ${A(b)} + ${A(a)} ، أي ${A(lo)} < الضلع < ${A(hi)}.`, `${A(ans)} ${not ? "خارج" : "داخل"} هذا المدى.`], explanation: A(ans) };
      } },
      ineqCmp: { title: "المقارنة بمدى الضلع الثالث", from: 200, to: 280, gen(R, h) {
        const A = h.A, a = R.int(3, 9), b = R.int(a, 12), hi = a + b, w = hi + R.pick([0, 1, 3]);
        return { style: "c", sig: `${a}:${b}:${w}`, body: h.cmpBody(`أضلاع مثلث هي ${A(a)} ، ${A(b)} ، س`, "س", A(w)), options: h.cmpAnswer(h.d(0), h.d(0)).options, correct: 1,
          steps: [`س < ${A(a)} + ${A(b)} = ${A(hi)}.`, `إذن س أصغر من ${A(hi)} ، و ${A(w)} ≥ ${A(hi)} فالقيمة الثانية أكبر دائمًا.`], explanation: "القيمة الثانية أكبر" };
      } },
      perim: { title: "أضلاع مثلث مختلف الأضلاع أطوالها أعداد متتالية", from: 280, to: 420, gen(R, h) {
        const A = h.A, s = R.int(3, 15), P = 3 * s + 3, big = s + 2, ask = R.next() < .5;
        return { style: "p" + ask, sig: `${s}:${ask}`, body: `مثلث مختلف الأضلاع أطوال أضلاعه أعداد صحيحة متتالية، مجموع أطوالها ${A(P)} سم وطول ضلعه الأكبر ${A(big)} سم. ${ask ? "ما طول أصغر الأضلاع؟" : "ما طول الضلع الأوسط؟"}`,
          ...h.numOptions(R, h.d(ask ? s : s + 1), [h.d(ask ? s + 1 : s), h.d(big), h.d(Math.max(1, s - 1))]),
          steps: [`الضلعان الآخران مجموعهما ${A(P)} − ${A(big)} = ${A(P - big)}.`, `وهما عددان متتاليان أصغر من ${A(big)}: ${A(s)} و ${A(s + 1)}.`], explanation: A(ask ? s : s + 1) };
      } },
      isos: { title: "المثلث المتطابق الضلعين والمتطابق الأضلاع", from: 420, to: 640, gen(R, h) {
        const A = h.A, mode = R.pick(["eq60", "expr", "axis"]);
        if (mode === "eq60") { const s = R.int(4, 20);
          return { style: "e", sig: `e${s}`, body: `في المثلث أ ب ج ، إذا كان أ ب = أ ج = ${A(s)} سم وقياس الزاوية أ = ٦٠° ، فما طول ب ج؟`, ...h.numOptions(R, h.d(s), [h.d(s * 2), h.d(s / 2 | 0 || s + 2), h.d(s + 1)]),
            steps: ["المثلث متطابق الضلعين، فزاويتا القاعدة متساويتان: (١٨٠ − ٦٠) ÷ ٢ = ٦٠°.", "كل زواياه ٦٠° فهو متطابق الأضلاع.", `ب ج = ${A(s)} سم.`], explanation: A(s) }; }
        const p = R.int(2, 4), q = p + R.int(1, 2), x = R.int(5, 25), c1 = R.int(0, 30), c2 = (p * x + c1) - q * x;
        const L = c1 ? `${A(p)}س + ${A(c1)}` : `${A(p)}س`, Rt = c2 >= 0 ? `${A(q)}س + ${A(c2)}` : `${A(q)}س − ${A(-c2)}`;
        return { style: mode, sig: `${mode}${p}:${q}:${x}:${c1}`, body: mode === "axis" ? `إذا كان أ ب محور تماثل لمثلث، وطولا الضلعين المتماثلين ${L} و ${Rt} ، أوجد س` : `مثلث متطابق الضلعين، طول أحد الضلعين المتطابقين ${L} والآخر ${Rt}. ما قيمة س؟`,
          ...h.numOptions(R, h.d(x), [h.d(x + 5), h.d(Math.max(1, x - 3)), h.d(Math.abs(c1 - c2) || x + 2)]),
          steps: ["الضلعان المتطابقان متساويان.", `${L} = ${Rt}.`, `${A(q - p)}س = ${A(c1 - c2)} ، إذن س = ${A(x)}.`], explanation: A(x) };
      } },
      circle: { title: "مثلث رأسه مركز الدائرة", from: 640, to: 720, gen(R, h) {
        const A = h.A, b = R.int(3, 8) * 10, v = 180 - 2 * b;
        return { style: "c", sig: `${b}`, body: `في دائرة مركزها م ، رُسم مثلث رأسه م ورأساه الآخران على الدائرة، وقياس كل من زاويتي القاعدة ${A(b)}°. ما قياس زاوية الرأس س؟`, ...h.strOptions(R, `${A(v)}°`, [`${A(b)}°`, `${A(180 - b)}°`, `${A(v + 10)}°`].map(z => z === `${A(v)}°` ? `${A(v + 20)}°` : z)),
          steps: ["ضلعا المثلث من المركز نصفا قطر، فهو متطابق الضلعين.", `س = ١٨٠ − ${A(b)} − ${A(b)} = ${A(v)}°.`], explanation: `${A(v)}°` };
      } },
      hyp: { title: "إيجاد الوتر بنظرية فيثاغورس", from: 720, to: 1050, gen(R, h) {
        const [a, b, c] = R.pick(TR), k = Number.isInteger(a) ? R.pick([1, 1, 2, 3]) : R.pick([1, 2, 4]), [x, y, z] = [a * k, b * k, c * k]; if (z > 120) return null;
        return { style: "h", sig: `${x}:${y}`, body: `مثلث قائم الزاوية طولا ضلعي القائمة ${N(h, x)} سم و ${N(h, y)} سم ، فما طول الوتر؟`, ...h.strOptions(R, N(h, z), [N(h, x + y), N(h, z + 1), N(h, Math.abs(y - x) + z - y || z + 2)].map(w => w === N(h, z) ? N(h, z + 2) : w)),
          steps: [PY, `الوتر² = ${N(h, x)}² + ${N(h, y)}² = ${N(h, x * x)} + ${N(h, y * y)} = ${N(h, z * z)}.`, `الوتر = ${N(h, z)} سم (من مضاعفات المثلث ${a === 1.5 ? "١,٥ ، ٢ ، ٢,٥" : `${h.A(a)} ، ${h.A(b)} ، ${h.A(c)}`}).`], explanation: N(h, z) };
      } },
      leg: { title: "إيجاد ضلع القائمة بنظرية فيثاغورس", from: 720, to: 1050, gen(R, h) {
        const [a, b, c] = R.pick(TR), k = Number.isInteger(a) ? R.pick([1, 2, 3]) : R.pick([1, 2, 4]), [x, y, z] = [a * k, b * k, c * k]; if (z > 120) return null; const sw = R.next() < .5, given = sw ? x : y, v = sw ? y : x;
        return { style: "l", sig: `${given}:${z}`, body: `مثلث قائم الزاوية طول وتره ${N(h, z)} سم وطول أحد ضلعي القائمة ${N(h, given)} سم ، أوجد طول الضلع الآخر`, ...h.strOptions(R, N(h, v), [N(h, z - given), N(h, z + given), N(h, v + 1)].map(w => w === N(h, v) ? N(h, v + 2) : w)),
          steps: [PY, `الضلع² = ${N(h, z)}² − ${N(h, given)}² = ${N(h, z * z)} − ${N(h, given * given)} = ${N(h, v * v)}.`, `الضلع = ${N(h, v)} سم.`], explanation: N(h, v) };
      } },
      two: { title: "مثلثان قائمان مشتركان في ضلع", from: 1050, to: 1340, gen(R, h) {
        const A = h.A, mode = R.pick(["split", "quad"]);
        if (mode === "split") { const h0 = R.pick([12, 5, 8, 15]), base = { 12: [5, 16], 5: [12, 12], 8: [6, 15], 15: [8, 20] }[h0], d1 = base[0], d2 = base[1], hyp2 = Math.sqrt(h0 * h0 + d2 * d2), v = Math.sqrt(h0 * h0 + d1 * d1);
          if (!Number.isInteger(hyp2) || !Number.isInteger(v)) return null;
          return { style: "s", sig: `s${h0}:${d1}:${d2}`, body: `مثلث أ ب ج قائم الزاوية في ب ، والنقطة د على ب ج حيث ب د = ${A(d1)} و ب ج = ${A(d2)} ، و أ ج = ${A(hyp2)}. أوجد طول أ د`, ...h.numOptions(R, h.d(v), [h.d(hyp2 - (d2 - d1)), h.d(h0), h.d(v + 1)]),
            steps: [`من المثلث أ ب ج: أ ب² = ${A(hyp2)}² − ${A(d2)}² = ${A(hyp2 * hyp2 - d2 * d2)} ، أ ب = ${A(h0)}.`, `من المثلث أ ب د: أ د² = ${A(h0)}² + ${A(d1)}² = ${A(v * v)}.`, `أ د = ${A(v)}.`], explanation: A(v) }; }
        const [p, q, r] = R.pick([[5, 12, 13], [6, 8, 10], [9, 12, 15]]), [s1, s2] = R.pick([[5, 12], [3, 4], [12, 9]].filter(([u, w]) => Number.isInteger(Math.sqrt(r * r - u * u)) && u < r) ) || [], other = s1 ? Math.sqrt(r * r - s1 * s1) : null; if (!other) return null;
        return { style: "q", sig: `q${p}:${q}:${s1}`, body: `شكل رباعي أ ب ج د فيه زاويتان قائمتان عند ب و د ، والقطر أ ج يقسمه إلى مثلثين قائمين. إذا كان أ ب = ${A(p)} و ب ج = ${A(q)} و ج د = ${A(s1)} ، فأوجد أ د`, ...h.numOptions(R, h.d(other), [h.d(r), h.d(other + 1), h.d(Math.abs(q - s1) || other + 2)]),
          steps: [`أ ج² = ${A(p)}² + ${A(q)}² = ${A(r * r)} ، أ ج = ${A(r)}.`, `أ د² = ${A(r)}² − ${A(s1)}² = ${A(other * other)}.`, `أ د = ${A(other)}.`], explanation: A(other) };
      } },
      triple: { title: "مثلثات فيثاغورس المشهورة", from: 780, to: 1000, gen(R, h) {
        const A = h.A, [a, b, c] = R.pick(TR), k = Number.isInteger(a) ? R.pick([1, 2, 10]) : 1, t = [a * k, b * k, c * k], ok = t.map(x => N(h, x)).join(" ، ");
        const bad = [[t[0], t[1], t[2] + 1], [t[0] + 1, t[1], t[2]], [t[0], t[1] + 2, t[2] + 1]].map(x => x.map(y => N(h, y)).join(" ، "));
        return { style: "t", sig: t.join(":"), body: "أي مجموعة مما يلي تصلح أن تكون أطوال أضلاع مثلث قائم الزاوية؟", ...h.strOptions(R, ok, bad),
          steps: ["نتحقق: مربع الأكبر = مجموع مربعي الآخرين.", `${N(h, t[0])}² + ${N(h, t[1])}² = ${N(h, t[0] ** 2 + t[1] ** 2)} = ${N(h, t[2])}² ✓.`, `المثلثات المشهورة: (٣ ، ٤ ، ٥) ، (٥ ، ١٢ ، ١٣) ، (٦ ، ٨ ، ١٠) ، (١,٥ ، ٢ ، ٢,٥) ومضاعفاتها.`], explanation: ok };
      } }
    }
  };
})();
