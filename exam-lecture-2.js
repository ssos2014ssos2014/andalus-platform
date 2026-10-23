// المحاضرة 2: قسمة الأعداد العشرية، والضرب والقسمة على قوى العشرة، ومسائلها اللفظية
// كل مهارة مربوطة بالدقائق التي شُرحت فيها داخل المقطع (from/to بالثواني)
(() => {
  const NAMES = ["أحمد", "سعد", "خالد", "فهد", "عبدالله", "محمد", "علي", "يوسف", "فيصل", "سلمان"];
  const R4 = "قاعدة ٤ (قسمة العشرية): نجعل عدد الأرقام بعد الفاصلة في البسط مساويًا لعددها في المقام بإضافة أصفار، ثم نحذف الفواصل ونقسم.";
  const R5 = "قاعدة ٥ (قوى العشرة): الضرب في ١٠ أو ١٠٠ أو ١٠٠٠ يحرّك الفاصلة يمينًا بعدد الأصفار، والقسمة تحرّكها يسارًا بعدد الأصفار.";
  const tens = n => 10 ** n;
  const mv = (h, n) => n === 1 ? "خانة واحدة" : n === 2 ? "خانتين" : h.A(n) + " خانات";
  const pl = (h, s) => s === 1 ? "منزلة واحدة" : s === 2 ? "منزلتان" : h.A(s) + " منازل";
  const T = (h, n) => h.d(tens(n));                      // ١٠ ، ١٠٠ ، ١٠٠٠ …
  const cmpWord = (h, a, b) => h.cmp(a, b) > 0 ? "إذن القيمة الأولى أكبر." : h.cmp(a, b) < 0 ? "إذن القيمة الثانية أكبر." : "إذن القيمتان متساويتان.";

  // خطوات قسمة عددين عشريين بطريقة المحاضرة (والناتج معروف مسبقًا لأننا نبني السؤال منه)
  function divSteps(h, a, b, q) {
    const s = Math.max(a.s, b.s);
    const A = a.i * tens(s - a.s), B = b.i * tens(s - b.s);
    return [
      `نكتب القسمة على صورة كسر: ${h.fx(a)} ÷ ${h.fx(b)}.`,
      s ? `نوحّد عدد المنازل بعد الفاصلة في البسط والمقام بإضافة أصفار (${pl(h, s)}): ${h.pad(a, s)} ÷ ${h.pad(b, s)}.` : "لا توجد فواصل في البسط والمقام.",
      `نحذف الفواصل من البسط والمقام معًا، فلا تتغير القيمة: ${h.A(A)} ÷ ${h.A(B)}.`,
      `نقسم: ${h.A(A)} ÷ ${h.A(B)} = ${h.fx(q)}.`,
      `للتأكد: ${h.fx(q)} × ${h.fx(b)} = ${h.fx(h.mul(q, b))} ✓`
    ];
  }
  // ضرب أو قسمة على قوة من قوى العشرة
  function p10Steps(h, x, n, op, r) {
    return [
      `${op === "×" ? "الضرب في" : "القسمة على"} ${h.A(tens(n))}: عدد الأصفار ${h.A(n)}، فنحرّك الفاصلة ${mv(h, n)} إلى ${op === "×" ? "اليمين" : "اليسار"}.`,
      `${h.fx(x)} ${op} ${h.A(tens(n))} = ${h.fx(r)} ، ونكمل بأصفار إن احتجنا لخانات إضافية.`
    ];
  }
  const qOf = (h, R) => R.pick([h.d(R.int(2, 9)), h.d(R.int(11, 60)), h.d(R.int(1, 9) * 10), h.d(`${R.int(1, 9)}.${R.int(1, 9)}`), h.d(R.int(2, 9) * 100)]);

  window.EXAMS[2] = {
    title: "اختبار محاكي: قسمة العشرية والضرب والقسمة على قوى العشرة",
    minutes: 25,
    blueprint: [["divDec", 4], ["divSum", 2], ["cmpDiv", 2], ["capacity", 2], ["prodDiv", 1], ["pow10", 3], ["units", 1],
      ["chain10", 2], ["fracDec", 2], ["fill", 2], ["tiny", 1], ["missing", 1], ["profit", 1]],
    skills: {
      // ---------------------------------------------------------------
      divDec: { title: "قسمة الأعداد العشرية (توحيد المنازل وحذف الفواصل)", from: 0, to: 420, gen(R, h) {
        const b = h.shift(h.d(R.pick([R.int(1, 9), R.int(1, 9), R.int(11, 25)])), R.int(1, 3));
        if (b.s === 0) return null;
        const q = qOf(h, R), a = h.mul(q, b);
        if (a.s > 4 || a.i > 99999) return null;
        const style = R.pick(["direct", "x", "frac"]);
        const body = style === "x" ? `إذا كان س × ${h.fx(b)} = ${h.fx(a)} ، فما قيمة س ؟`
          : style === "frac" ? `ما قيمة الكسر: البسط ${h.fx(a)} والمقام ${h.fx(b)} ؟` : `ما ناتج ${h.fx(a)} ÷ ${h.fx(b)} ؟`;
        return { style, sig: `${style}:${h.str(a)}/${h.str(b)}`, body, ...h.numOptions(R, q, [h.shift(q, 1), h.shift(q, -1), h.shift(q, 2)]),
          steps: [...(style === "x" ? [`س = ${h.fx(a)} ÷ ${h.fx(b)} (نقسم الطرفين على ${h.fx(b)}).`] : []), ...divSteps(h, a, b, q)],
          explanation: `${R4} الناتج ${h.fx(q)}.` };
      } },
      // ---------------------------------------------------------------
      divSum: { title: "مجموع القسمة على ٠,١ و ٠,٠١ و ٠,٠٠١", from: 420, to: 570, gen(R, h) {
        const same = R.next() < .5;
        const base = R.pick(["1", "10", "0.1", "0.01", "5", "2", "3", "0.2", "0.5", "20", "0.3", "4"]);
        const ns = R.shuffle([1, 2, 3, 4]).slice(0, 3).sort();
        const parts = ns.map(n => { const x = same ? h.d(base) : h.d(R.pick(["1", "2", "3", "5", "0.1", "0.2", "0.5", "10"])); return { x, n, v: h.mul(x, T(h, n)) }; });
        const k = parts[0].x;
        const v = h.add(...parts.map(p => p.v));
        const wrong = [h.add(...parts.map(p => h.mul(p.x, T(h, p.n - 1)))), h.add(...parts.map(p => h.mul(p.x, T(h, p.n + 1)))), h.add(parts[0].v, parts[1].v)];
        return { style: same ? "sum" : "mix", sig: `${parts.map(p => h.str(p.x) + "/" + p.n).join("+")}`, body: `ما قيمة ${parts.map(p => `${h.fx(p.x)} ÷ ${h.fx({ i: 1, s: p.n })}`).join(" + ")} ؟`,
          ...h.numOptions(R, v, wrong),
          steps: ["القسمة على ٠,١ تعني الضرب في ١٠، وعلى ٠,٠١ تعني الضرب في ١٠٠، وعلى ٠,٠٠١ تعني الضرب في ١٠٠٠ (بعد توحيد المنازل وحذف الفواصل).",
            ...parts.map(p => `${h.fx(p.x)} ÷ ${h.fx({ i: 1, s: p.n })} = ${h.fx(p.x)} × ${h.A(tens(p.n))} = ${h.fx(p.v)}`),
            `نجمع النواتج: ${parts.map(p => h.fx(p.v)).join(" + ")} = ${h.fx(v)}.`],
          explanation: `${R4} الناتج ${h.fx(v)}.` };
      } },
      // ---------------------------------------------------------------
      cmpDiv: { title: "المقارنة بعد قسمة العشرية", from: 570, to: 690, extra: [[960, 1020]], gen(R, h) {
        const style = R.pick(["sum", "two"]);
        if (style === "two") {
          const q = h.d(R.pick([R.int(11, 99), R.int(2, 9) * 10]));
          const b1 = { i: R.int(1, 9), s: R.int(2, 3) }, b2 = { i: R.int(1, 9), s: R.int(1, 2) };
          const q2 = R.pick([q, h.shift(q, 1), h.shift(q, -1)]);
          const a1 = h.mul(q, b1), a2 = h.mul(q2, b2);
          return { style, sig: `two:${h.str(a1)}/${h.str(b1)}:${h.str(a2)}/${h.str(b2)}`, body: h.cmpBody("", `${h.fx(a1)} ÷ ${h.fx(b1)}`, `${h.fx(a2)} ÷ ${h.fx(b2)}`), ...h.cmpAnswer(q, q2),
            steps: ["نحسب القيمة الأولى:", ...divSteps(h, a1, b1, q).slice(1, 4), "ونحسب القيمة الثانية:", ...divSteps(h, a2, b2, q2).slice(1, 4), cmpWord(h, q, q2)], explanation: R4 };
        }
        const x = { i: R.int(1, 9), s: 1 }, y = { i: x.i, s: 2 };   // مثل ٠,٣ ÷ ٠,٠٣ + ٠,٠٣ ÷ ٠,٣
        const v = h.add(h.d(10), h.d("0.1"));
        const other = R.pick([v, h.d(10), h.d("10.01"), h.d(11)]);
        return { style, sig: `sum:${x.i}:${h.str(other)}`, body: h.cmpBody("", `${h.fx(x)} ÷ ${h.fx(y)} + ${h.fx(y)} ÷ ${h.fx(x)}`, h.fx(other)), ...h.cmpAnswer(v, other),
          steps: [`${h.fx(x)} ÷ ${h.fx(y)}: نوحّد المنازل ${h.pad(x, 2)} ÷ ${h.fx(y)} ونحذف الفواصل: ${h.A(x.i * 10)} ÷ ${h.A(y.i)} = ١٠.`,
            `${h.fx(y)} ÷ ${h.fx(x)}: نوحّد المنازل ${h.fx(y)} ÷ ${h.pad(x, 2)} ونحذف الفواصل: ${h.A(y.i)} ÷ ${h.A(x.i * 10)} = ٠,١.`,
            `المجموع = ١٠ + ٠,١ = ١٠,١.`, `نقارن ١٠,١ بـ ${h.fx(other)}: ${cmpWord(h, v, other)}`], explanation: R4 };
      } },
      // ---------------------------------------------------------------
      capacity: { title: "مسائل السعة والعدد (الطرود والعلب)", from: 690, to: 900, gen(R, h) {
        const u = R.pick([h.d("0.5"), h.d("0.6"), h.d("0.8"), h.d("0.4"), h.d("0.25"), h.d("0.2")]);
        const n = R.int(2, 12) * R.pick([5, 10, 20]), tot = h.mul(u, h.d(n));
        if (tot.s > 0 && R.next() < .5) return null;
        const style = R.pick(["count", "cost"]);
        const obj = R.pick([["طائرة شحن", "طرد", "سعتها", "لملئها"], ["مستودع", "علبة", "سعته", "لملئه"], ["شاحنة", "صندوق", "سعتها", "لملئها"]]);
        if (style === "cost") {
          const price = h.d(R.pick([50, 100, 20, 25, 200])), cost = h.mul(price, h.d(n));
          return { style, sig: `cost:${h.str(u)}:${n}:${h.str(price)}`, body: `${obj[0]} ${obj[2]} ${h.fx(tot)} متر مكعب، نريد أن نضع فيها ${obj[1] === "علبة" ? "علبًا" : obj[1] + "ًا"} سعة الواحد ${h.fx(u)} متر مكعب، وتكلفة الواحد ${h.fx(price)} ريال. فكم التكلفة الكلية بالريال؟`,
            ...h.numOptions(R, cost, [h.mul(price, tot), h.shift(cost, 1), h.mul(price, h.d(Math.round(n / 2)))]),
            steps: [`نوجد العدد أولًا: العدد = السعة الكلية ÷ سعة الواحد = ${h.fx(tot)} ÷ ${h.fx(u)}.`, ...divSteps(h, tot, u, h.d(n)).slice(1, 4),
              `التكلفة الكلية = العدد × تكلفة الواحد = ${h.A(n)} × ${h.fx(price)} = ${h.fx(cost)} ريال.`], explanation: R4 };
        }
        return { style, sig: `count:${h.str(u)}:${n}`, body: `لدينا عدد من ${obj[1] === "علبة" ? "العلب" : "الصناديق"} حجم الواحد منها ${h.fx(u)} متر مكعب، نريد تخزينها في ${obj[0]} ${obj[2]} ${h.fx(tot)} متر مكعب. فكم ${obj[1] === "علبة" ? "علبة" : "صندوقًا"} تلزم ${obj[3]}؟`,
          ...h.numOptions(R, h.d(n), [h.d(n * 10), h.mul(u, tot), h.d(Math.round(n / 10) || n + 10)]),
          steps: [`العدد = السعة الكلية ÷ حجم الواحد = ${h.fx(tot)} ÷ ${h.fx(u)}.`, ...divSteps(h, tot, u, h.d(n)).slice(1)], explanation: R4 };
      } },
      // ---------------------------------------------------------------
      prodDiv: { title: "ضرب نواتج القسمة", from: 900, to: 960, gen(R, h) {
        const b = R.pick([h.d("0.2"), h.d("0.5"), h.d("0.1"), h.d("0.4")]);
        const nums = [R.pick([1, 2, 4]), R.pick([2, 4, 6, 8]), R.pick([10, 20, 40, 50])].map(h.d);
        const qs = nums.map(n => h.d(h.str(n) * 10 / (b.i)));      // n ÷ ٠,k = (١٠ n) ÷ k
        if (qs.some(q => !Number.isInteger(Number(h.str(q))))) return null;
        const v = h.mul(...qs);
        return { style: "prod", sig: `${h.str(b)}:${nums.map(h.str).join(",")}`, body: `ما قيمة (${nums.map(n => `${h.fx(n)} ÷ ${h.fx(b)}`).join(") × (")}) ؟`,
          ...h.numOptions(R, v, [h.shift(v, 1), h.shift(v, -1), h.d(Number(h.str(v)) * 2 / 5 || 1)]),
          steps: [`نقسم كل كسر على حدة بتوحيد المنازل وحذف الفواصل (نضرب البسط والمقام في ١٠):`, ...nums.map((n, i) => `${h.fx(n)} ÷ ${h.fx(b)} = ${h.A(Number(h.str(n)) * 10)} ÷ ${h.A(b.i)} = ${h.fx(qs[i])}`),
            `ثم نضرب النواتج: ${qs.map(h.fx).join(" × ")} = ${h.fx(v)}.`], explanation: R4 };
      } },
      // ---------------------------------------------------------------
      pow10: { title: "الضرب والقسمة على قوى العشرة (تحريك الفاصلة)", from: 1020, to: 1320, gen(R, h) {
        const style = R.pick(["mul", "div", "missing"]);
        const x = R.pick([R.dec(0, 9, R.int(1, 3)), h.d(R.int(2, 99)), { i: R.int(1, 9), s: R.int(1, 3) }]);
        const n = R.int(1, 3);
        if (style === "missing") {
          const r = h.mul(x, T(h, n));
          return { style, sig: `m:${h.str(x)}:${n}`, body: `ما العدد الذي إذا ضربناه في ${h.A(tens(n))} كان الناتج ${h.fx(r)} ؟`,
            ...h.numOptions(R, x, [h.shift(x, -1), h.shift(x, 1), r]),
            steps: [`المطلوب = ${h.fx(r)} ÷ ${h.A(tens(n))}.`, ...p10Steps(h, r, n, "÷", x)], explanation: R5 };
        }
        const r = style === "mul" ? h.mul(x, T(h, n)) : h.shift(x, n);
        const op = style === "mul" ? "×" : "÷";
        return { style, sig: `${style}:${h.str(x)}:${n}`, body: `ما ناتج ${h.fx(x)} ${op} ${h.A(tens(n))} ؟`,
          ...h.numOptions(R, r, [style === "mul" ? h.shift(x, n) : h.mul(x, T(h, n)), h.shift(r, 1), h.shift(r, -1)]),
          steps: p10Steps(h, x, n, op, r), explanation: R5 };
      } },
      // ---------------------------------------------------------------
      units: { title: "تحويل الوحدات (جرام وكيلوجرام، متر وسنتيمتر…)", from: 1320, to: 1380, gen(R, h) {
        const U = R.pick([["جرام", "كيلوجرام", 3], ["مليلتر", "لتر", 3], ["سنتيمتر", "متر", 2], ["متر", "كيلومتر", 3], ["مليمتر", "سنتيمتر", 1]]);
        const big = R.dec(0, 9, R.int(1, 2)), small = h.mul(big, T(h, U[2]));
        const shown = R.pick([small, h.shift(small, 1), h.mul(small, h.d(10))]);
        const flip = R.next() < .5;
        const first = flip ? `${h.fx(big)} ${U[1]}` : `${h.fx(shown)} ${U[0]}`, second = flip ? `${h.fx(shown)} ${U[0]}` : `${h.fx(big)} ${U[1]}`;
        const v1 = flip ? small : shown, v2 = flip ? shown : small;
        return { style: "u", sig: `${U[1]}:${h.str(big)}:${h.str(shown)}:${flip}`, body: h.cmpBody("", first, second), ...h.cmpAnswer(v1, v2),
          steps: [`نوحّد الوحدة قبل المقارنة: ١ ${U[1]} = ${h.A(tens(U[2]))} ${U[0]}.`, `نحوّل: ${h.fx(big)} ${U[1]} = ${h.fx(big)} × ${h.A(tens(U[2]))} = ${h.fx(small)} ${U[0]} (نحرّك الفاصلة ${mv(h, U[2])} إلى اليمين).`,
            `نقارن ${h.fx(small)} ${U[0]} بـ ${h.fx(shown)} ${U[0]}: ${cmpWord(h, v1, v2)}`], explanation: R5 };
      } },
      // ---------------------------------------------------------------
      chain10: { title: "سلاسل الضرب والجمع مع ٠,١ و ١٠ و ١٠٠", from: 1380, to: 1530, extra: [[1680, 1830]], gen(R, h) {
        const style = R.pick(["chain", "sumMul", "sumDiv"]);
        if (style === "chain") {
          const fs = R.shuffle([T(h, R.int(1, 3)), { i: 1, s: R.int(1, 3) }, T(h, R.int(1, 3)), { i: 1, s: R.int(1, 3) }, ...(R.next() < .5 ? [h.d(R.int(2, 9) * 10)] : [])]);
          const v = h.mul(...fs);
          if (v.s > 5 || v.i > 999999) return null;
          return { style, sig: `c:${fs.map(h.str).join("x")}`, body: `ما قيمة ${fs.map(h.fx).join(" × ")} ؟`, ...h.numOptions(R, v, [h.shift(v, 1), h.shift(v, -1), h.shift(v, 2)]),
            steps: ["نجمع كل ١٠ أو ١٠٠ أو ١٠٠٠ مع ٠,١ أو ٠,٠١ أو ٠,٠٠١ المقابل له، لأن كل زوج يلغي بعضه أو يحرّك الفاصلة.", ...h.multSteps(fs)], explanation: R5 };
        }
        const k = h.d(R.pick(["0.1", "0.2", "0.5", "0.3"])), ns = [R.int(1, 2), R.int(1, 2), R.int(2, 3)];
        const parts = ns.map(n => style === "sumMul" ? h.mul(k, T(h, n)) : h.shift(k, n));
        const v = h.add(...parts), op = style === "sumMul" ? "×" : "÷";
        return { style, sig: `${style}:${h.str(k)}:${ns.join("")}`, body: `ما قيمة ${ns.map(n => `${h.fx(k)} ${op} ${h.A(tens(n))}`).join(" + ")} ؟`,
          ...h.numOptions(R, v, [h.mul(h.add(...parts), h.d(10)), h.shift(v, 1), h.add(parts[0], parts[2])]),
          steps: [...ns.map((n, i) => `${h.fx(k)} ${op} ${h.A(tens(n))} = ${h.fx(parts[i])} (نحرّك الفاصلة ${mv(h, n)} إلى ${op === "×" ? "اليمين" : "اليسار"})`),
            "ثم نجمع النواتج بمحاذاة الفواصل:", ...h.colSteps(parts)], explanation: R5 };
      } },
      // ---------------------------------------------------------------
      fracDec: { title: "تحويل الكسور العشرية والأعداد الكسرية", from: 1830, to: 2070, extra: [[1560, 1680]], gen(R, h) {
        const style = R.pick(["sum", "mixed"]);
        if (style === "mixed") {
          const w1 = R.int(1, 9), n1 = R.int(1, 9), w2 = R.int(1, 9), n2 = R.int(1, 9);
          const v = h.add(h.d(`${w1}.${n1}`), h.d(`${w2}.0${n2}`));
          const other = R.pick([v, h.add(v, h.d("0.1")), h.sub(v, h.d("0.01")), h.d(`${w1 + w2}.${n1}${n2}`)]);
          return { style, sig: `m:${w1}${n1}${w2}${n2}:${h.str(other)}`, body: h.cmpBody("", h.fx(other), `${h.A(w1)} و ${h.A(n1)}/١٠ + ${h.A(w2)} و ${h.A(n2)}/١٠٠`), ...h.cmpAnswer(other, v),
            steps: [`نحوّل الكسر الذي مقامه ١٠ إلى منزلة عشرية واحدة، والذي مقامه ١٠٠ إلى منزلتين: ${h.A(n1)}/١٠ = ${h.fx({ i: n1, s: 1 })} و ${h.A(n2)}/١٠٠ = ${h.fx({ i: n2, s: 2 })}.`,
              `فيصبح العددان: ${h.fx(h.d(`${w1}.${n1}`))} و ${h.fx(h.d(`${w2}.0${n2}`))}.`, ...h.colSteps([h.d(`${w1}.${n1}`), h.d(`${w2}.0${n2}`)]),
              `نقارن ${h.fx(other)} بـ ${h.fx(v)}: ${cmpWord(h, other, v)}`], explanation: R5 };
        }
        const d = R.int(1, 9), terms = R.shuffle([[d, 3], [d * 10, 3], [d * 100, 1], [d, 2]]).slice(0, 3);
        const vals = terms.map(([n, p]) => h.shift(h.d(n), p)), v = h.add(...vals);
        return { style, sig: `s:${terms.map(t => t.join("/")).join("+")}`, body: `ما قيمة ${terms.map(([n, p]) => `${h.A(n)}/${h.A(tens(p))}`).join(" + ")} ؟`,
          ...h.numOptions(R, v, [h.add(...vals.map(x => h.shift(x, 1))), h.add(...vals.map(x => h.shift(x, -1))), h.add(vals[0], vals[1])]),
          steps: ["كل كسر مقامه ١٠ أو ١٠٠ أو ١٠٠٠: نحرّك الفاصلة في البسط إلى اليسار بعدد أصفار المقام.", ...terms.map(([n, p], i) => `${h.A(n)}/${h.A(tens(p))} = ${h.fx(vals[i])}`),
            "ثم نجمع بمحاذاة الفواصل:", ...h.colSteps(vals)], explanation: R5 };
      } },
      // ---------------------------------------------------------------
      fill: { title: "مسائل التعبئة: متى نقرّب لأعلى ومتى لأسفل", from: 2070, to: 2460, gen(R, h) {
        const style = R.pick(["toFill", "canFill", "cloth"]);
        const unit = style === "cloth" ? R.dec(2, 5, 1) : h.d(R.int(2, 5));
        const big = R.dec(10, 40, 1);
        const exact = Number(h.str(big)) / Number(h.str(unit));
        if (Number.isInteger(exact) || exact < 3) return null;
        const fl = Math.floor(exact), ce = Math.ceil(exact);
        if (style === "cloth") {
          return { style, sig: `c:${h.str(unit)}:${h.str(big)}`, body: `إذا كان الثوب الواحد يحتاج ${h.fx(unit)} متر من القماش، ولدينا لفة من القماش طولها ${h.fx(big)} متر، فكم ثوبًا يمكن تفصيله؟`,
            ...h.numOptions(R, h.d(fl), [h.d(ce), h.d(fl - 1), h.d(ce + 2)]),
            steps: [`عدد الأثواب = ${h.fx(big)} ÷ ${h.fx(unit)} ≈ ${h.fx(h.d(exact.toFixed(2)))}.`,
              `لا يمكن تفصيل جزء من ثوب، والقماش الباقي لا يكفي ثوبًا كاملًا، فنقرّب لأسفل: ${h.A(fl)} أثواب.`,
              `للتأكد: ${h.A(fl)} × ${h.fx(unit)} = ${h.fx(h.mul(h.d(fl), unit))} ≤ ${h.fx(big)}، و ${h.A(ce)} × ${h.fx(unit)} = ${h.fx(h.mul(h.d(ce), unit))} أكبر من الطول المتاح.`], explanation: "مسائل التعبئة" };
        }
        const toFill = style === "toFill";
        const ans = toFill ? ce : fl;
        return { style, sig: `${style}:${h.str(unit)}:${h.str(big)}`,
          body: toFill ? `غلاية ماء سعتها ${h.fx(big)} لتر، كم كوبًا يلزم لملء الغلاية إذا كانت سعة الكوب ${h.fx(unit)} لتر؟`
            : `غلاية ماء سعتها ${h.fx(big)} لتر، كم كوبًا ممتلئًا يمكن أن نملأ منها إذا كانت سعة الكوب ${h.fx(unit)} لتر؟`,
          ...h.numOptions(R, h.d(ans), [h.d(toFill ? fl : ce), h.d(toFill ? ce + 1 : fl - 1), h.d(toFill ? ce + 2 : fl + 2)]),
          steps: [`${h.fx(big)} ÷ ${h.fx(unit)} ≈ ${h.fx(h.d(exact.toFixed(2)))}، والناتج ليس عددًا صحيحًا.`,
            toFill ? `لملء الغلاية نحتاج أكواب تغطي كل السعة، و${h.A(fl)} أكواب لا تكفي (${h.fx(h.mul(h.d(fl), unit))} لتر فقط)، فنقرّب لأعلى: ${h.A(ce)} أكواب.`
              : `الكوب لا يُحسب إلا ممتلئًا، والماء الباقي بعد ${h.A(fl)} أكواب لا يملأ كوبًا آخر، فنقرّب لأسفل: ${h.A(fl)} أكواب.`,
            "انتبه لصيغة السؤال كما نبّه المعلم: «يلزم لملء الغلاية» تقريب لأعلى، و«تملؤه الغلاية» تقريب لأسفل."], explanation: "مسائل التعبئة" };
      } },
      // ---------------------------------------------------------------
      tiny: { title: "كم مرة يتسع: كأس ٠,٠٠٤ لتر وإناء ٤ لترات", from: 2460, to: 2550, gen(R, h) {
        const k = R.int(1, 9), p = R.int(2, 3), cup = { i: k, s: p }, m = R.pick([1, 2, 3, 5, 10]), vessel = h.d(k * m);
        const n = h.mul(h.d(m), T(h, p));
        return { style: "t", sig: `${h.str(cup)}:${m}`, body: `كأس سعته ${h.fx(cup)} لتر، نريد استخدامه لملء إناء سعته ${h.fx(vessel)} لتر، فكم كأسًا نحتاج؟`,
          ...h.numOptions(R, n, [h.shift(n, 1), h.shift(n, -1), h.shift(n, -2)]),
          steps: [`عدد الكؤوس = سعة الإناء ÷ سعة الكأس = ${h.fx(vessel)} ÷ ${h.fx(cup)}.`, ...divSteps(h, vessel, cup, n).slice(1, 4)], explanation: R4 };
      } },
      // ---------------------------------------------------------------
      missing: { title: "إيجاد العامل المجهول (استبعاد الخيارات بآخر رقم)", from: 2550, to: 2640, gen(R, h) {
        const x = R.int(2, 9), m = h.d(`${R.int(1, 9)}.${R.int(1, 9)}`), p = h.mul(h.d(x), m);
        const opts = [x, x - 1, x + 1, x + 2].filter(v => v > 0);
        return { style: "m", sig: `${x}:${h.str(m)}`, body: `ما العدد الذي إذا ضربته في ${h.fx(m)} يصبح الناتج ${h.fx(p)} ؟`,
          ...h.numOptions(R, h.d(x), opts.slice(1).map(h.d)),
          steps: [`نستبعد الخيارات بآخر رقم كما في المحاضرة: آخر رقم في ${h.fx(m)} هو ${h.A(m.i % 10)}، وآخر رقم في الناتج ${h.A(p.i % 10)}.`,
            `نبحث عن الخيار الذي إذا ضُرب في ${h.A(m.i % 10)} انتهى بـ ${h.A(p.i % 10)}: ${h.A(x)} × ${h.A(m.i % 10)} = ${h.A(x * (m.i % 10))} ✓.`,
            `للتأكد: ${h.A(x)} × ${h.fx(m)} = ${h.fx(p)}.`, `أو بالقسمة: ${h.fx(p)} ÷ ${h.fx(m)} = ${h.A(x)}.`], explanation: "استبعاد الخيارات" };
      } },
      // ---------------------------------------------------------------
      profit: { title: "مسائل الربح (شراء بالجملة وبيع بالمفرد)", from: 2640, to: 2956, gen(R, h) {
        const k = R.pick([2, 4, 5]), unitCost = R.pick([h.d("1.25"), h.d("0.5"), h.d("1.5"), h.d("2.5"), h.d("0.75")]);
        const buy = h.mul(unitCost, h.d(k)), gain = R.pick([h.d("1.25"), h.d("0.5"), h.d("1.5"), h.d("2.5"), h.d(1)]);
        const sell = h.add(unitCost, gain), cnt = R.int(2, 8) * 5, target = h.mul(gain, h.d(cnt));
        const item = R.pick([["ألعاب", "لعبة", "الواحدة"], ["أقلام", "قلمًا", "الواحد"], ["دفاتر", "دفترًا", "الواحد"], ["كرات", "كرة", "الواحدة"]]);
        const DUAL = { "ألعاب": "لعبتين", "أقلام": "قلمين", "دفاتر": "دفترين", "كرات": "كرتين" };
        const group = k === 2 ? DUAL[item[0]] : `${h.A(k)} ${item[0]}`;
        return { style: "p", sig: `${k}:${h.str(unitCost)}:${h.str(gain)}:${cnt}`,
          body: `تاجر يشتري كل ${group} بسعر ${h.fx(buy)} ريال، ويبيع ${item[2]} بـ ${h.fx(sell)} ريال. فكم ${item[1]} يبيع ليربح ${h.fx(target)} ريال؟`,
          ...h.numOptions(R, h.d(cnt), [h.d(cnt / 5 * 2 || cnt + 5), h.d(cnt + 5), h.d(cnt * 2)]),
          steps: [`تكلفة الواحدة = ${h.fx(buy)} ÷ ${h.A(k)} = ${h.fx(unitCost)} ريال.`, `ربح الواحدة = سعر البيع − التكلفة = ${h.fx(sell)} − ${h.fx(unitCost)} = ${h.fx(gain)} ريال.`,
            `العدد المطلوب = الربح المطلوب ÷ ربح الواحدة = ${h.fx(target)} ÷ ${h.fx(gain)} = ${h.A(cnt)}.`,
            "خطأ شائع: قسمة الربح على سعر البيع بدل ربح الواحدة."], explanation: "مسائل الربح" };
      } }
    }
  };
})();
