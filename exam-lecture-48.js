// المحاضرة 48: مساحة الدائرة ومحيطها والأشكال المرسومة داخلها
(() => {
  const LAW = "مساحة الدائرة = ط نق² ، ومحيطها = ٢ ط نق = ط × القطر.";
  const TR = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20]];
  const P = (h, k) => k === 1 ? "ط" : `${Number.isInteger(k) ? h.A(k) : h.fx(h.d(String(k)))} ط`;
  const N = (h, x) => Number.isInteger(x) ? h.A(x) : h.fx(h.d(String(+x.toFixed(2))));
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  window.EXAMS[48] = {
    title: "اختبار محاكي: مساحة الدائرة ومحيطها", minutes: 25,
    blueprint: [["basic", 4], ["semi", 3], ["inSq", 3], ["inRect", 2], ["hex", 2], ["shade", 4], ["row", 3], ["cmp", 3]],
    skills: {
      basic: { title: "مساحة الدائرة ومحيطها", from: 0, to: 450, gen(R, h) {
        const A = h.A, r = R.int(1, 15), mode = R.pick(["area", "circ", "a2c", "c2a", "diam"]);
        const m = { area: [`دائرة نصف قطرها ${A(r)} سم. فما مساحتها؟`, r * r, [2 * r, r * r * 2, 4 * r]], circ: [`دائرة نصف قطرها ${A(r)} سم. فما محيطها؟`, 2 * r, [r * r, r, 4 * r]], diam: [`دائرة قطرها ${A(2 * r)} سم. فما مساحتها؟`, r * r, [4 * r * r, 2 * r, 2 * r * r]],
          a2c: [`دائرة مساحتها ${P(h, r * r)} سم². فما محيطها؟`, 2 * r, [r, r * r, 4 * r]], c2a: [`دائرة محيطها ${P(h, 2 * r)} سم. فما مساحتها؟`, r * r, [2 * r, 4 * r * r, 2 * r * r]] }[mode];
        const opts = [...new Set(m[2].filter(x => x !== m[1]))].concat([m[1] + 1, m[1] + 2]).slice(0, 3);
        return { style: mode, sig: `${mode}${r}`, body: m[0], ...h.strOptions(R, P(h, m[1]), opts.map(x => P(h, x))),
          steps: [LAW, mode === "a2c" ? `نق² = ${A(r * r)} ، نق = ${A(r)} ، المحيط = ٢ × ${A(r)} ط = ${P(h, 2 * r)}.` : mode === "c2a" ? `٢ نق = ${A(2 * r)} ، نق = ${A(r)} ، المساحة = ${A(r)}² ط = ${P(h, r * r)}.` : mode === "diam" ? `نق = ${A(2 * r)} ÷ ٢ = ${A(r)} ، المساحة = ${P(h, r * r)}.` : `= ${P(h, m[1])}.`], explanation: P(h, m[1]) };
      } },
      semi: { title: "المثلث المرسوم في نصف دائرة قائم الزاوية", from: 450, to: 720, gen(R, h) {
        const A = h.A, [a, b, c] = R.pick(TR), ask = R.pick(["circ", "area"]), v = ask === "circ" ? c : c * c / 4;
        return { style: ask, sig: `${a}:${b}:${ask}`, body: `مثلث مرسوم داخل دائرة، أحد أضلاعه قطر الدائرة، وطولا ضلعيه الآخرين ${A(a)} و ${A(b)}. احسب ${ask === "circ" ? "محيط" : "مساحة"} الدائرة`,
          ...h.strOptions(R, P(h, v), (ask === "circ" ? [2 * c, a + b, c / 2] : [c * c, c, c * c / 2]).map(x => P(h, x))),
          steps: ["المثلث المرسوم على القطر تكون زاويته المقابلة للقطر قائمة.", `القطر = √{${A(a)}² + ${A(b)}²} = ${A(c)}.`, ask === "circ" ? `المحيط = ط × ${A(c)} = ${P(h, c)}.` : `نق = ${N(h, c / 2)} ، المساحة = (${N(h, c / 2)})² ط = ${P(h, v)}.`], explanation: P(h, v) };
      } },
      inSq: { title: "مربع مرسوم داخل دائرة (قطره = قطر الدائرة)", from: 600, to: 900, gen(R, h) {
        const A = h.A, s = R.int(2, 12), ask = R.pick(["area", "circ"]), v = ask === "area" ? s * s / 2 : null;
        return { style: ask, sig: `${s}:${ask}`, body: `مربع مرسوم داخل دائرة طول ضلعه ${A(s)}. احسب ${ask === "area" ? "مساحة" : "محيط"} الدائرة`,
          ...h.strOptions(R, ask === "area" ? P(h, v) : `${h.rad(s, 2)} ط`, ask === "area" ? [P(h, s * s), P(h, s * s / 4), P(h, 2 * s)] : [P(h, 2 * s), P(h, s), `${h.rad(s, 3)} ط`]),
          steps: ["قطر المربع = قطر الدائرة.", `قطر المربع = ${A(s)} √{٢} ، فنق = ⟦${A(s)} √{٢}/٢⟧.`, ask === "area" ? `المساحة = ط × نق² = ط × ⟦${A(s * s)} × ٢/٤⟧ = ${P(h, v)}.` : `المحيط = ط × القطر = ${h.rad(s, 2)} ط.`], explanation: ask === "area" ? P(h, v) : `${h.rad(s, 2)} ط` };
      } },
      inRect: { title: "مستطيل مرسوم داخل دائرة", from: 600, to: 900, gen(R, h) {
        const A = h.A, [a, b, c] = R.pick(TR), v = c * c / 4;
        return { style: "r", sig: `${a}:${b}`, body: `مستطيل بعداه ${A(a)} و ${A(b)} مرسوم داخل دائرة تمر برؤوسه الأربعة. احسب مساحة الدائرة`, ...h.strOptions(R, P(h, v), [P(h, c * c), P(h, a * b), P(h, c)]),
          steps: ["قطر المستطيل = قطر الدائرة.", `القطر = √{${A(a)}² + ${A(b)}²} = ${A(c)} ، نق = ${N(h, c / 2)}.`, `المساحة = ${P(h, v)}.`], explanation: P(h, v) };
      } },
      hex: { title: "سداسي منتظم داخل دائرة (ضلعه = نصف القطر)", from: 900, to: 1100, gen(R, h) {
        const A = h.A, s = R.int(2, 15), ask = R.pick(["circ", "area"]), v = ask === "circ" ? 2 * s : s * s;
        return { style: ask, sig: `${s}:${ask}`, body: `سداسي منتظم مرسوم داخل دائرة طول ضلعه ${A(s)} سم. احسب ${ask === "circ" ? "محيط" : "مساحة"} الدائرة`, ...h.strOptions(R, P(h, v), (ask === "circ" ? [s, 6 * s, s * s] : [2 * s, 4 * s * s, 6 * s]).map(x => P(h, x))),
          steps: ["طول ضلع السداسي المنتظم المرسوم في دائرة = نصف قطرها.", `نق = ${A(s)}.`, `${ask === "circ" ? "المحيط = ٢ ط نق" : "المساحة = ط نق²"} = ${P(h, v)}.`], explanation: P(h, v) };
      } },
      shade: { title: "المساحة المظللة بين مربع ودائرة", from: 1350, to: 1860, gen(R, h) {
        const A = h.A, s = R.pick([2, 4, 6, 8, 10, 12, 20]), r = s / 2, mode = R.pick(["all", "all", "quarter", "pi"]);
        if (mode === "pi") { const ans = `${A(s * s)} − ${P(h, r * r)}`;
          return { style: "p", sig: `p${s}`, body: `مربع طول ضلعه ${A(s)} سم مرسوم بداخله دائرة تمس أضلاعه. ما مساحة الجزء المظلل خارج الدائرة وداخل المربع؟`, ...h.strOptions(R, ans, [`${A(s * s)} − ${P(h, s * s)}`, `${A(4 * s)} − ${P(h, s)}`, `${A(s * s)} − ${P(h, 2 * r)}`]),
            steps: [`قطر الدائرة = ضلع المربع ، فنق = ${A(r)}.`, `المظلل = مساحة المربع − مساحة الدائرة = ${A(s * s)} − ${P(h, r * r)}.`], explanation: ans }; }
        const v = (s * s - 3.14 * r * r) / (mode === "quarter" ? 4 : 1);
        return { style: mode, sig: `${mode}${s}`, body: `مربع طول ضلعه ${A(s)} سم مرسوم بداخله دائرة تمس أضلاعه الأربعة. ${mode === "quarter" ? "ما مساحة الجزء المظلل في أحد أركان المربع؟" : "ما مساحة الأجزاء المظللة خارج الدائرة؟"} (ط = ٣,١٤)`,
          ...h.numOptions(R, h.d(v.toFixed(2).replace(/\.?0+$/, "")), [h.d((v * 2).toFixed(2).replace(/\.?0+$/, "")), h.d((s * s - 3.14 * r).toFixed(2).replace(/\.?0+$/, "")), h.d((3.14 * r * r).toFixed(2).replace(/\.?0+$/, ""))]),
          steps: [`مساحة المربع = ${A(s * s)} ، ومساحة الدائرة = ٣,١٤ × ${A(r)}² = ${N(h, 3.14 * r * r)}.`, `المظلل = ${A(s * s)} − ${N(h, 3.14 * r * r)} = ${N(h, s * s - 3.14 * r * r)}${mode === "quarter" ? ` ، والركن الواحد ربعه = ${N(h, v)}` : ""}.`], explanation: N(h, v) };
      } },
      row: { title: "دوائر متطابقة داخل مستطيل", from: 1860, to: 2100, gen(R, h) {
        const A = h.A, n = R.int(2, 4), d = R.pick([2, 4, 6, 8, 10]), r = d / 2, ask = R.pick(["circle", "rect"]);
        return { style: ask + n, sig: `${n}:${d}:${ask}`, body: `${A(n)} دوائر متطابقة متجاورة داخل مستطيل، تمس كل منها ضلعي المستطيل العلوي والسفلي، وعرض المستطيل ${A(d)}. احسب ${ask === "circle" ? "مساحة الدائرة الواحدة" : "مساحة المستطيل"}`,
          ...(ask === "circle" ? h.strOptions(R, P(h, r * r), [P(h, d * d), P(h, d), P(h, n * r * r)]) : h.numOptions(R, h.d(n * d * d), [h.d(d * d), h.d(n * d), h.d(2 * (n * d + d))])),
          steps: [`قطر كل دائرة = عرض المستطيل = ${A(d)} ، فنق = ${A(r)}.`, ask === "circle" ? `المساحة = ${P(h, r * r)}.` : `طول المستطيل = ${A(n)} × ${A(d)} = ${A(n * d)} ، والمساحة = ${A(n * d)} × ${A(d)} = ${A(n * d * d)}.`], explanation: ask === "circle" ? P(h, r * r) : A(n * d * d) };
      } },
      cmp: { title: "المقارنات في الدائرة", from: 0, to: 3299, gen(R, h) {
        const A = h.A, mode = R.pick(["double", "circ"]);
        if (mode === "double") { const k = R.int(2, 4), w = R.pick([k, k * k, 2 * k]);
          return { style: "d", sig: `d${k}:${w}`, body: h.cmpBody(`إذا ضُرب نصف قطر دائرة في ${A(k)}`, "عدد المرات التي تتضاعف بها المساحة", A(w)), ...h.cmpAnswer(h.d(k * k), h.d(w)),
            steps: [`المساحة الجديدة = ط (${A(k)}نق)² = ${A(k * k)} ط نق².`, `تتضاعف ${A(k * k)} مرة، فـ ${rel(k * k, w)}.`], explanation: rel(k * k, w) }; }
        const r = R.int(2, 10), w = Math.round(2 * 3.14 * r) + R.pick([-2, 0, 2]), x = 2 * Math.PI * r;
        return { style: "c", sig: `c${r}:${w}`, body: h.cmpBody(`دائرة نصف قطرها ${A(r)}`, "محيط الدائرة", A(w)), ...h.cmpAnswer(h.d(x.toFixed(3)), h.d(w)),
          steps: [`المحيط = ٢ ط × ${A(r)} = ${A(2 * r)} ط ≈ ${N(h, 2 * 3.14 * r)}.`, `إذن ${rel(x, w)}.`], explanation: rel(x, w) };
      } }
    }
  };
})();
