// المحاضرة 45: مساحة المربع ومحيطه وقطره وتطبيقاتها
(() => {
  const LAW = "مساحة المربع = طول الضلع × نفسه = ½ × (طول القطر)² ، ومحيطه = ٤ × طول الضلع ، وقطره = الضلع × √{٢}.";
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  window.EXAMS[45] = {
    title: "اختبار محاكي: مساحة المربع ومحيطه", minutes: 25,
    blueprint: [["basic", 3], ["diag", 3], ["equal", 2], ["inner", 2], ["split", 3], ["fence", 3], ["toSq", 3], ["cmp", 3], ["scale", 2]],
    skills: {
      basic: { title: "مساحة المربع ومحيطه", from: 0, to: 300, gen(R, h) {
        const A = h.A, s = R.int(2, 30), mode = R.pick(["area", "perim", "fromArea", "fromPerim"]);
        const map = { area: [`مربع طول ضلعه ${A(s)} سم. فما مساحته؟`, s * s, [4 * s, 2 * s, s * s + s]], perim: [`مربع طول ضلعه ${A(s)} سم. فما محيطه؟`, 4 * s, [s * s, 2 * s, 4 * s + 4]],
          fromArea: [`مربع مساحته ${A(s * s)} سم². فما محيطه؟`, 4 * s, [s, s * s / 2 | 0 || s + 4, 4 * s + 4]], fromPerim: [`مربع محيطه ${A(4 * s)} سم. فما مساحته؟`, s * s, [4 * s, s * s * 4, 2 * s]] }[mode];
        return { style: mode, sig: `${mode}${s}`, body: map[0], ...h.numOptions(R, h.d(map[1]), map[2].map(x => h.d(x))),
          steps: [LAW, mode === "fromArea" ? `الضلع = ${h.rad(1, s * s)} = ${A(s)} ، والمحيط = ٤ × ${A(s)} = ${A(4 * s)}.` : mode === "fromPerim" ? `الضلع = ${A(4 * s)} ÷ ٤ = ${A(s)} ، والمساحة = ${A(s)}² = ${A(s * s)}.` : `= ${A(map[1])}.`], explanation: A(map[1]) };
      } },
      diag: { title: "مساحة المربع بدلالة قطره", from: 180, to: 360, gen(R, h) {
        const A = h.A, mode = R.pick(["area", "diag", "side"]);
        if (mode === "area") { const d = R.int(2, 15) * 2, v = d * d / 2;
          return { style: "a", sig: `a${d}`, body: `مربع طول قطره ${A(d)} سم. فما مساحته؟`, ...h.numOptions(R, h.d(v), [h.d(d * d), h.d(4 * d), h.d(v / 2)]),
            steps: [LAW, `المساحة = ½ × ${A(d)}² = ½ × ${A(d * d)} = ${A(v)} سم².`], explanation: A(v) }; }
        const s = R.int(2, 15);
        if (mode === "diag") return { style: "d", sig: `d${s}`, body: `مربع طول ضلعه ${A(s)} سم. فما طول قطره؟`, ...h.strOptions(R, h.rad(s, 2), [A(2 * s), h.rad(s, 3), A(s * s)]),
          steps: ["القطر يقسم المربع إلى مثلثين ٤٥ – ٤٥ – ٩٠.", `القطر = ${A(s)} × √{٢} = ${h.rad(s, 2)} سم.`], explanation: h.rad(s, 2) };
        return { style: "s", sig: `s${s}`, body: `مربع طول قطره ${h.rad(s, 2)} سم. فما مساحته؟`, ...h.numOptions(R, h.d(s * s), [h.d(2 * s * s), h.d(4 * s), h.d(s * s + s)]),
          steps: [`الضلع = ${h.rad(s, 2)} ÷ √{٢} = ${A(s)}.`, `المساحة = ${A(s)}² = ${A(s * s)} سم². (أو ½ × القطر² = ½ × ${A(2 * s * s)})`], explanation: A(s * s) };
      } },
      equal: { title: "مربع مساحته مضاعف لمحيطه عدديًا", from: 480, to: 720, gen(R, h) {
        const A = h.A, k = R.pick([1, 2, 3, 4, 5]), s = 4 * k, P = 4 * s;
        return { style: "e" + k, sig: `${k}`, body: `مربع مساحته ${k === 1 ? "تساوي" : k === 2 ? "ضعف" : A(k) + " أمثال"} محيطه عدديًا. فما طول محيطه؟`, ...h.numOptions(R, h.d(P), [h.d(s), h.d(s * s), h.d(P + 4)]),
          steps: [`ض² = ${A(k)} × ٤ض ، نقسم على ض: ض = ${A(4 * k)}.`, `المحيط = ٤ × ${A(s)} = ${A(P)}.`], explanation: A(P) };
      } },
      inner: { title: "المربع الداخلي بعد إطار منتظم", from: 360, to: 480, gen(R, h) {
        const A = h.A, s = R.int(6, 30), b = R.int(1, Math.floor((s - 2) / 2)), in_ = s - 2 * b, ask = R.pick(["area", "frame"]), v = ask === "area" ? in_ * in_ : s * s - in_ * in_;
        return { style: ask, sig: `${s}:${b}:${ask}`, body: `لوحة مربعة طول ضلعها ${A(s)} سم ، أحيطت من الداخل بإطار عرضه ${A(b)} سم من كل جانب. ${ask === "area" ? "فما مساحة الجزء الداخلي المربع؟" : "فما مساحة الإطار؟"}`,
          ...h.numOptions(R, h.d(v), [h.d(ask === "area" ? (s - b) ** 2 : s * s - (s - b) ** 2), h.d(ask === "area" ? s * s - in_ * in_ : in_ * in_), h.d(v + s)]),
          steps: [`ضلع الداخل = ${A(s)} − ٢ × ${A(b)} = ${A(in_)}.`, ask === "area" ? `المساحة = ${A(in_)}² = ${A(v)}.` : `الإطار = ${A(s)}² − ${A(in_)}² = ${A(s * s)} − ${A(in_ * in_)} = ${A(v)}.`], explanation: A(v) };
      } },
      split: { title: "مربع مقسم إلى مستطيلات متطابقة", from: 1080, to: 1200, gen(R, h) {
        const A = h.A, n = R.int(2, 6), w = R.int(1, 6), s = n * w, ask = R.pick(["area", "perim"]), v = ask === "area" ? s * w : 2 * (s + w);
        return { style: ask + n, sig: `${n}:${w}:${ask}`, body: `إذا كان محيط مربع ${A(4 * s)} سم وقُسم إلى ${A(n)} مستطيلات متطابقة متجاورة، فأوجد ${ask === "area" ? "مساحة" : "محيط"} المستطيل الصغير`,
          ...h.numOptions(R, h.d(v), ask === "area" ? [h.d(s * s), h.d(s * s / 2), h.d(v + w)] : [h.d(4 * s), h.d(2 * s + w), h.d(v + 2)]),
          steps: [`ضلع المربع = ${A(4 * s)} ÷ ٤ = ${A(s)} ، وعرض المستطيل = ${A(s)} ÷ ${A(n)} = ${A(w)}.`, `المستطيل ${A(s)} × ${A(w)}.`, ask === "area" ? `المساحة = ${A(v)} سم².` : `المحيط = ٢ × (${A(s)} + ${A(w)}) = ${A(v)} سم.`], explanation: A(v) };
      } },
      fence: { title: "سور حول أرض مربعة والمتبقي من السلك", from: 1140, to: 1240, gen(R, h) {
        const A = h.A, s = R.int(5, 40), extra = R.int(1, 30), L = 4 * s + extra;
        return { style: "f", sig: `${s}:${extra}`, body: `مع محمد سلك طوله ${A(L)} م ، يريد أن يبني به سورًا حول أرض مربعة طول ضلعها ${A(s)} م. فكم يتبقى من السلك بالمتر؟`, ...h.numOptions(R, h.d(extra), [h.d(L - s), h.d(L - 2 * s), h.d(extra + s)]),
          steps: [`محيط الأرض = ٤ × ${A(s)} = ${A(4 * s)} م.`, `المتبقي = ${A(L)} − ${A(4 * s)} = ${A(extra)} م.`], explanation: A(extra) };
      } },
      toSq: { title: "مستطيل يصبح مربعًا بعد تعديل بعديه", from: 1240, to: 1440, gen(R, h) {
        const A = h.A, s = R.int(4, 20), a = R.int(1, 5), l = s + a, w = s - a, P = 2 * (l + w), ask = R.pick(["area", "side"]);
        return { style: ask, sig: `${s}:${a}:${ask}`, body: `مستطيل محيطه ${A(P)} ، نقص طوله بمقدار ${A(a)} وزاد عرضه ${A(a)} فأصبح مربعًا. ${ask === "area" ? "أوجد مساحة المربع" : "أوجد طول المستطيل الأصلي"}`,
          ...h.numOptions(R, h.d(ask === "area" ? s * s : l), ask === "area" ? [h.d(l * w), h.d(P), h.d((s + 1) ** 2)] : [h.d(s), h.d(w), h.d(l + a)]),
          steps: ["النقص في الطول يساوي الزيادة في العرض، فالمحيط لا يتغير.", `ضلع المربع = ${A(P)} ÷ ٤ = ${A(s)}.`, ask === "area" ? `المساحة = ${A(s)}² = ${A(s * s)}.` : `الطول الأصلي = ${A(s)} + ${A(a)} = ${A(l)}.`], explanation: A(ask === "area" ? s * s : l) };
      } },
      cmp: { title: "المقارنة بين مستطيل ومربع", from: 1440, to: 1600, gen(R, h) {
        const A = h.A, k = R.int(2, 5), w = R.int(2, 8), l = k * w, S = l * w, q = R.int(Math.max(2, l - 4), l + 4);
        return { style: "c", sig: `${k}:${w}:${q}`, body: `قارن بين:\nالقيمة الأولى: طول مستطيل مساحته ${A(S)} وطوله ${A(k)} أمثال عرضه\nالقيمة الثانية: طول ضلع مربع مساحته ${A(q * q)}`, ...h.cmpAnswer(h.d(l), h.d(q)),
          steps: [`${A(k)}ع × ع = ${A(S)} ، فالعرض = ${A(w)} والطول = ${A(l)}.`, `ضلع المربع = ${h.rad(1, q * q)} = ${A(q)}.`, `إذن ${rel(l, q)}.`], explanation: rel(l, q) };
      } },
      scale: { title: "أثر تغيير طول الضلع على المساحة والمحيط", from: 0, to: 600, gen(R, h) {
        const A = h.A, k = R.int(2, 5), ask = R.pick(["area", "perim"]), v = ask === "area" ? k * k : k;
        const word = n => n === 2 ? "مرتين" : `${A(n)} مرات`;
        return { style: ask + k, sig: `${k}:${ask}`, body: `إذا ضُرب طول ضلع مربع في ${A(k)} ، فكم مرة ${ask === "area" ? "تتضاعف مساحته" : "يتضاعف محيطه"}؟`, ...h.strOptions(R, word(v), [word(ask === "area" ? k : k * k), word(2 * k), word(v + 1)]),
          steps: [ask === "area" ? `المساحة = (${A(k)}ض)² = ${A(k * k)} ض².` : `المحيط = ٤ × ${A(k)}ض = ${A(k)} × ٤ض.`, `تتضاعف ${word(v)}.`], explanation: word(v) };
      } }
    }
  };
})();
