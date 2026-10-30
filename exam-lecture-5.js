// المحاضرة 5: الأشكال الرباعية (المربع، المستطيل، متوازي الأضلاع، المعين، شبه المنحرف) وعدّ الأشكال
(() => {
  const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20]];
  window.EXAMS[5] = {
    title: "اختبار محاكي: الأشكال الرباعية", minutes: 25,
    blueprint: [["square", 3], ["rect", 3], ["remain", 2], ["triHalf", 2], ["ratio", 1], ["rhombus", 4], ["para", 2], ["trap", 3], ["cntRect", 2], ["cntSq", 2]],
    skills: {
      square: { title: "المربع: المساحة والمحيط والقطر", from: 0, to: 360, extra: [[720, 780]], gen(R, h) {
        const A = h.A, style = R.pick(["diag", "perim", "alg", "diagLen"]);
        if (style === "diag") { const d = R.int(2, 12) * 2, a = d * d / 2;
          return { style, sig: `d:${d}`, body: `مربع طول قطره ${A(d)} سم، فما مساحته؟`, ...h.numOptions(R, h.d(a), [h.d(d * d), h.d(d * 4), h.d(a / 2)]),
            steps: ["مساحة المربع = ½ × مربع طول القطر (لأن قطريه متساويان ومتعامدان).", `المساحة = ½ × ${A(d)}² = ½ × ${A(d * d)} = ${A(a)} سم².`], explanation: A(a) }; }
        if (style === "perim") { const l = R.int(3, 15), p = 4 * l;
          return { style, sig: `p:${l}`, body: `مربع محيطه ${A(p)} سم، فما مساحته؟`, ...h.numOptions(R, h.d(l * l), [h.d(p), h.d(l * 2), h.d(p * p / 4)]),
            steps: [`طول الضلع = المحيط ÷ ٤ = ${A(p)} ÷ ٤ = ${A(l)} سم.`, `المساحة = الضلع × نفسه = ${A(l)} × ${A(l)} = ${A(l * l)} سم².`], explanation: A(l * l) }; }
        if (style === "diagLen") { const l = R.int(2, 12), ans = h.rad(l, 2);
          return { style, sig: `l:${l}`, body: `مربع طول ضلعه ${A(l)} سم، فما طول قطره؟`, ...h.strOptions(R, ans, [h.rad(l, 3), A(2 * l), h.rad(1, l), A(l * l)]),
            steps: ["قطر المربع = طول الضلع × √٢ (من فيثاغورس: ق² = ل² + ل²).", `القطر = ${ans} سم.`], explanation: ans }; }
        const a = R.int(2, 6), b = R.int(a + 1, 9), c = R.int(1, 9), x = R.int(2, 9); const e = (a * x + c), d2 = b * x - e; if (d2 <= 0) return null;
        return { style, sig: `a:${a}${b}${c}${x}`, body: `مربع طول أحد أضلاعه ${A(a)}س + ${A(c)} وطول ضلع آخر ${A(b)}س − ${A(d2)} ، فما قيمة س؟`, ...h.numOptions(R, h.d(x), [h.d(x + 1), h.d(x * 2), h.d(Math.max(1, x - 1))]),
          steps: ["أضلاع المربع متساوية، فنساوي التعبيرين.", `${A(a)}س + ${A(c)} = ${A(b)}س − ${A(d2)}`, `${A(c)} + ${A(d2)} = ${A(b)}س − ${A(a)}س ← ${A(c + d2)} = ${A(b - a)}س ← س = ${A(x)}.`], explanation: A(x) };
      } },
      rect: { title: "المستطيل: المساحة والمحيط والقطر", from: 300, to: 700, extra: [[1140, 1200]], gen(R, h) {
        const A = h.A, style = R.pick(["diag", "perim", "area"]);
        if (style === "diag") { const [w, l, d] = R.pick(TRIPLES), p = 2 * (l + w);
          return { style, sig: `d:${l}${w}`, body: `مستطيل طوله يزيد عن عرضه بمقدار ${A(l - w)} سم، وطول قطره ${A(d)} سم، فما محيطه؟`, ...h.numOptions(R, h.d(p), [h.d(l * w), h.d(2 * d), h.d(l + w)]),
            steps: ["القطر يقسم المستطيل إلى مثلثين قائمين، فنستخدم أضلاع فيثاغورث المشهورة.", `أطوال الأضلاع ${A(w)} ، ${A(l)} ، ${A(d)} (الفرق بين الطول والعرض ${A(l - w)} ✓).`, `المحيط = (الطول + العرض) × ٢ = (${A(l)} + ${A(w)}) × ٢ = ${A(p)} سم.`], explanation: A(p) }; }
        if (style === "perim") { const w = R.int(2, 12), l = R.int(w + 1, 20), p = 2 * (l + w);
          return { style, sig: `p:${l}${w}`, body: `مستطيل محيطه ${A(p)} سم وعرضه ${A(w)} سم، فما طوله؟`, ...h.numOptions(R, h.d(l), [h.d(p - w), h.d(p / 2), h.d(p / 4)]),
            steps: [`نصف المحيط = الطول + العرض = ${A(p)} ÷ ٢ = ${A(p / 2)}.`, `الطول = ${A(p / 2)} − ${A(w)} = ${A(l)} سم.`], explanation: A(l) }; }
        const w = R.int(2, 12), l = R.int(w + 1, 20), a = l * w;
        return { style, sig: `a:${l}${w}`, body: `مستطيل مساحته ${A(a)} سم² وطوله ${A(l)} سم، فما محيطه؟`, ...h.numOptions(R, h.d(2 * (l + w)), [h.d(l + w), h.d(a / 2), h.d(4 * l)]),
          steps: [`العرض = المساحة ÷ الطول = ${A(a)} ÷ ${A(l)} = ${A(w)} سم.`, `المحيط = (${A(l)} + ${A(w)}) × ٢ = ${A(2 * (l + w))} سم.`], explanation: A(2 * (l + w)) };
      } },
      remain: { title: "المساحة المتبقية (غرفة وسجادة)", from: 780, to: 840, gen(R, h) {
        const A = h.A, a = R.int(4, 12), b = R.int(a, 15), c = R.int(2, a - 1), sq = R.next() < .6, w = sq ? c : R.int(1, c), rug = c * w, rem = a * b - rug;
        return { style: sq ? "s" : "r", sig: `${a}${b}${c}${w}`, body: `غرفة مستطيلة أبعادها ${A(a)} م و ${A(b)} م، نريد فرشها بسجادة ${sq ? `مربعة طول ضلعها ${A(c)} م` : `مستطيلة أبعادها ${A(c)} م و ${A(w)} م`}، فما مساحة الجزء المتبقي من الغرفة؟`,
          ...h.numOptions(R, h.d(rem), [h.d(a * b), h.d(rug), h.d(2 * (a + b) - 2 * (c + w))]),
          steps: [`مساحة الغرفة = ${A(a)} × ${A(b)} = ${A(a * b)} م².`, `مساحة السجادة = ${A(c)} × ${A(w)} = ${A(rug)} م².`, `المتبقي = ${A(a * b)} − ${A(rug)} = ${A(rem)} م².`], explanation: A(rem) };
      } },
      triHalf: { title: "المثلث داخل الرباعي = نصف مساحته", from: 840, to: 1080, gen(R, h) {
        const A = h.A, shape = R.pick(["مستطيل", "مربع", "متوازي أضلاع"]), a = R.int(2, 12) * 2, b = shape === "مربع" ? a : R.int(2, 15);
        const Q = a * b, T = Q / 2, rev = R.next() < .4, def = { "مستطيل": "المستطيل", "مربع": "المربع", "متوازي أضلاع": "متوازي الأضلاع" }[shape];
        const dims = shape === "مربع" ? `مربع طول ضلعه ${A(a)} سم` : shape === "مستطيل" ? `مستطيل بعداه ${A(a)} سم و ${A(b)} سم` : `متوازي أضلاع قاعدته ${A(a)} سم وارتفاعه ${A(b)} سم`;
        if (rev) return { style: "rev", sig: `r:${shape}${a}${b}`, body: `رُسم مثلث رأسه على أحد أضلاع ${shape} وقاعدته الضلع المقابل، فإذا كانت مساحة المثلث ${A(T)} سم²، فما مساحة ${def}؟`, ...h.numOptions(R, h.d(Q), [h.d(T), h.d(T * 4), h.d(T + 10)]),
          steps: ["قاعدة ٢: المثلث الذي رأسه على أحد أضلاع الرباعي وقاعدته الضلع المقابل مساحته نصف مساحة الرباعي.", `مساحة ${def} = ٢ × ${A(T)} = ${A(Q)} سم².`], explanation: A(Q) };
        return { style: "dir", sig: `d:${shape}${a}${b}`, body: `${dims}، رُسم داخله مثلث رأسه على أحد الأضلاع وقاعدته الضلع المقابل، فما مساحة المثلث؟`, ...h.numOptions(R, h.d(T), [h.d(Q), h.d(T / 2), h.d(a + b)]),
          steps: [`مساحة ${def} = ${A(a)} × ${A(b)} = ${A(Q)} سم².`, "قاعدة ٢: مساحة المثلث = ½ مساحة الرباعي (قاعدته وارتفاعه هما ضلع الرباعي وارتفاعه).", `مساحة المثلث = ${A(Q)} ÷ ٢ = ${A(T)} سم².`], explanation: A(T) };
      } },
      ratio: { title: "نسبة مساحة الجزء المظلل", from: 1080, to: 1140, gen(R, h) {
        const A = h.A, fr = [[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [1, 5]], f1 = R.pick(fr), f2 = R.pick(fr);
        const g = (x, y) => y ? g(y, x % y) : x, n = f1[0] * f2[0], d = f1[1] * f2[1], gg = g(n, d), ans = `${A(n / gg)}/${A(d / gg)}`;
        return { style: "r", sig: `${f1}:${f2}`, body: `داخل مستطيل كبير ظُلّل مستطيل صغير طوله ${A(f1[0])}/${A(f1[1])} طول الكبير وعرضه ${A(f2[0])}/${A(f2[1])} عرض الكبير، فما نسبة مساحة الجزء المظلل إلى مساحة المستطيل الكبير؟`,
          ...h.strOptions(R, ans, [`${A(f1[0] + f2[0])}/${A(f1[1] + f2[1])}`, `${A(f1[0])}/${A(f1[1] * f2[1])}`, `${A(d / gg)}/${A(n / gg)}`, `${A(n / gg)}/${A(d / gg + 1)}`]),
          steps: ["المساحة = الطول × العرض، فنسبة المساحة = نسبة الطول × نسبة العرض.", `${A(f1[0])}/${A(f1[1])} × ${A(f2[0])}/${A(f2[1])} = ${A(n)}/${A(d)} = ${ans}.`], explanation: ans };
      } },
      rhombus: { title: "المعين: المساحة والضلع والزوايا", from: 360, to: 700, extra: [[1200, 1440]], gen(R, h) {
        const A = h.A, style = R.pick(["area", "side", "other", "angle"]);
        if (style === "angle") { const [p, q] = R.pick([[2, 3], [1, 2], [1, 3], [1, 5], [4, 5], [2, 7], [1, 4]]), x = 180 / (p + q); if (!Number.isInteger(x)) return null; const big = R.next() < .5;
          return { style, sig: `g:${p}${q}${big}`, body: `في معين، قياس زاويتين متجاورتين ${A(p)}س و ${A(q)}س ، فما قياس ${big ? "الزاوية الكبرى" : "الزاوية الصغرى"}؟`, ...h.numOptions(R, h.d((big ? q : p) * x), [h.d(x), h.d((big ? p : q) * x), h.d(90)]),
            steps: ["كل زاويتين متجاورتين في المعين مجموعهما ١٨٠°.", `${A(p)}س + ${A(q)}س = ١٨٠ ← ${A(p + q)}س = ١٨٠ ← س = ${A(x)}.`, `الزاوية ${big ? "الكبرى" : "الصغرى"} = ${A(big ? q : p)} × ${A(x)} = ${A((big ? q : p) * x)}°.`], explanation: A((big ? q : p) * x) }; }
        const t0 = R.pick(TRIPLES), kk = R.int(1, 3), [a, b, c] = R.shuffle([t0[0], t0[1]]).concat(t0[2]).map(x => x * kk), d1 = 2 * a, d2 = 2 * b, area = d1 * d2 / 2;
        if (style === "area") return { style, sig: `a:${d1}${d2}`, body: `معين طولا قطريه ${A(d1)} سم و ${A(d2)} سم، فما مساحته؟`, ...h.numOptions(R, h.d(area), [h.d(d1 * d2), h.d(4 * c), h.d(area / 2)]),
          steps: ["مساحة المعين = ½ × حاصل ضرب القطرين.", `المساحة = ½ × ${A(d1)} × ${A(d2)} = ${A(area)} سم².`], explanation: A(area) };
        if (style === "side") return { style, sig: `s:${d1}${d2}`, body: `معين طولا قطريه ${A(d1)} سم و ${A(d2)} سم، فما محيطه؟`, ...h.numOptions(R, h.d(4 * c), [h.d(2 * (d1 + d2)), h.d(c), h.d(area)]),
          steps: ["قطرا المعين متعامدان وينصف كل منهما الآخر، فيتكوّن مثلث قائم ضلعاه نصفا القطرين.", `نصفا القطرين ${A(a)} و ${A(b)}، فالضلع = ${A(c)} (من أضلاع فيثاغورث المشهورة).`, `المحيط = ٤ × ${A(c)} = ${A(4 * c)} سم.`], explanation: A(4 * c) };
        return { style, sig: `o:${c}${d1}`, body: `معين طول ضلعه ${A(c)} سم وطول أحد قطريه ${A(d1)} سم، فما مساحته؟`, ...h.numOptions(R, h.d(area), [h.d(c * d1), h.d(c * c), h.d(area * 2)]),
          steps: [`نصف القطر المعلوم = ${A(a)}، والضلع ${A(c)}، فنصف القطر الآخر = ${A(b)} (فيثاغورث: ${A(a)}، ${A(b)}، ${A(c)}).`, `القطر الآخر = ${A(d2)} سم.`, `المساحة = ½ × ${A(d1)} × ${A(d2)} = ${A(area)} سم².`], explanation: A(area) };
      } },
      para: { title: "متوازي الأضلاع (القاعدة × الارتفاع)", from: 600, to: 700, extra: [[1440, 1560]], gen(R, h) {
        const A = h.A, style = R.pick(["area", "cmp", "height"]);
        if (style === "cmp") { const a = R.int(3, 12), b = R.int(3, 12);
          return { style, sig: `c:${a}${b}`, body: h.cmpBody(`مستطيل بعداه ${A(a)} و ${A(b)}، ومتوازي أضلاع (ليس مستطيلًا) طولا ضلعيه ${A(a)} و ${A(b)}.`, "مساحة المستطيل", "مساحة متوازي الأضلاع"), options: ["القيمة الأولى أكبر", "القيمة الثانية أكبر", "القيمتان متساويتان", "المعلومات غير كافية"], correct: 0,
            steps: [`مساحة المستطيل = ${A(a)} × ${A(b)} = ${A(a * b)}.`, `مساحة متوازي الأضلاع = القاعدة × الارتفاع، والارتفاع ضلع قائم في مثلث وتره الضلع المائل ${A(b)}، فهو أقل من ${A(b)}.`, `إذن مساحة متوازي الأضلاع أقل من ${A(a * b)}، والقيمة الأولى أكبر.`], explanation: "" }; }
        const bse = R.int(3, 15), ht = R.int(2, 12), area = bse * ht, side = ht + R.int(1, 4);
        if (style === "height") return { style, sig: `h:${bse}${ht}`, body: `متوازي أضلاع مساحته ${A(area)} سم² وطول قاعدته ${A(bse)} سم، فما ارتفاعه؟`, ...h.numOptions(R, h.d(ht), [h.d(area - bse), h.d(area / 2), h.d(ht + 2)]),
          steps: ["مساحة متوازي الأضلاع = القاعدة × الارتفاع.", `الارتفاع = ${A(area)} ÷ ${A(bse)} = ${A(ht)} سم.`], explanation: A(ht) };
        return { style, sig: `a:${bse}${ht}${side}`, body: `متوازي أضلاع طول قاعدته ${A(bse)} سم، وطول ضلعه المائل ${A(side)} سم، وارتفاعه ${A(ht)} سم، فما مساحته؟`, ...h.numOptions(R, h.d(area), [h.d(bse * side), h.d(2 * (bse + side)), h.d(area / 2)]),
          steps: ["مساحة متوازي الأضلاع = القاعدة × الارتفاع (وليس × الضلع المائل).", `المساحة = ${A(bse)} × ${A(ht)} = ${A(area)} سم².`], explanation: A(area) };
      } },
      trap: { title: "شبه المنحرف", from: 1560, to: 1740, gen(R, h) {
        const A = h.A, style = R.pick(["area", "h", "bow"]);
        if (style === "bow") { const s = R.int(2, 6) * 2, m = R.int(1, s / 2 - 1) * 2, one = (s + m) / 2 * (s / 2), tot = 2 * one;
          return { style, sig: `b:${s}${m}`, body: `مربع طول ضلعه ${A(s)} سم، الجزء المظلل منه يتكون من شبهي منحرف متطابقين، قاعدتا كل منهما ${A(s)} سم و ${A(m)} سم وارتفاعه ${A(s / 2)} سم، فما مساحة الجزء المظلل؟`,
            ...h.numOptions(R, h.d(tot), [h.d(one), h.d(s * s), h.d(s * s - tot === tot ? tot + 2 : s * s - tot)]),
            steps: ["مساحة شبه المنحرف = (مجموع القاعدتين ÷ ٢) × الارتفاع.", `مساحة الواحد = (${A(s)} + ${A(m)}) ÷ ٢ × ${A(s / 2)} = ${A(one)} سم².`, `المظلل = ٢ × ${A(one)} = ${A(tot)} سم².`], explanation: A(tot) }; }
        const b1 = R.int(2, 12), b2 = b1 + R.int(1, 8) * 2 - (R.next() < .5 ? 0 : 0), ht = R.int(2, 10); if ((b1 + b2) % 2 && ht % 2) return null; const area = (b1 + b2) * ht / 2;
        if (style === "h") return { style, sig: `h:${b1}${b2}${ht}`, body: `شبه منحرف قاعدتاه المتوازيتان ${A(b1)} سم و ${A(b2)} سم ومساحته ${A(area)} سم²، فما ارتفاعه؟`, ...h.numOptions(R, h.d(ht), [h.d(area / (b1 + b2) | 0 || ht + 1), h.d(ht * 2), h.d(ht + 1)]),
          steps: ["المساحة = (مجموع القاعدتين ÷ ٢) × الارتفاع.", `${A(area)} = (${A(b1)} + ${A(b2)}) ÷ ٢ × ع = ${h.fx(h.div(h.d(b1 + b2), h.d(2)))} × ع ← ع = ${A(ht)} سم.`], explanation: A(ht) };
        return { style, sig: `a:${b1}${b2}${ht}`, body: `شبه منحرف قاعدتاه المتوازيتان ${A(b1)} سم و ${A(b2)} سم وارتفاعه ${A(ht)} سم، فما مساحته؟`, ...h.numOptions(R, h.d(area), [h.d((b1 + b2) * ht), h.d(b1 * b2), h.d(area + ht)]),
          steps: ["مساحة شبه المنحرف = (مجموع القاعدتين ÷ ٢) × الارتفاع.", `= (${A(b1)} + ${A(b2)}) ÷ ٢ × ${A(ht)} = ${h.fx(h.div(h.d(b1 + b2), h.d(2)))} × ${A(ht)} = ${A(area)} سم².`], explanation: A(area) };
      } },
      cntRect: { title: "عدد المستطيلات في شكل", from: 1740, to: 1830, gen(R, h) {
        const A = h.A, T = n => n * (n + 1) / 2, row = R.next() < .3, m = row ? 1 : R.int(2, 5), n = R.int(row ? 3 : 2, row ? 10 : 7), v = T(m) * T(n);
        return { style: row ? "row" : "grid", sig: `${m}x${n}`, body: row ? `شريط مقسوم إلى ${A(n)} مربعات متجاورة في صف واحد، كم عدد المستطيلات في الشكل (بما فيها المربعات)؟` : `شبكة مستطيلة مقسومة إلى ${A(m)} صفوف و ${A(n)} أعمدة من المربعات المتساوية، كم عدد المستطيلات في الشكل (بما فيها المربعات)؟`,
          ...h.numOptions(R, h.d(v), [h.d(m * n), h.d(T(m) + T(n)), h.d(v + m * n)]),
          steps: ["عدد المستطيلات = (مجموع ١ + ٢ + … حتى عدد الأعمدة) × (مجموع ١ + ٢ + … حتى عدد الصفوف).", `${Array.from({ length: n }, (_, i) => A(i + 1)).join(" + ")} = ${A(T(n))}${m > 1 ? ` ، و ${Array.from({ length: m }, (_, i) => A(i + 1)).join(" + ")} = ${A(T(m))}` : " ، والصف واحد = ١"}.`, `العدد = ${A(T(n))} × ${A(T(m))} = ${A(v)}.`], explanation: A(v) };
      } },
      cntSq: { title: "عدد المربعات في شكل", from: 1830, to: 1986, gen(R, h) {
        const A = h.A, n = R.int(2, 6), m = R.next() < .5 ? n : R.int(n + 1, 8), extra = m === n && R.next() < .4;
        const parts = Array.from({ length: n }, (_, i) => (m - i) * (n - i)), inner = parts.reduce((a, b) => a + b, 0), v = inner + (extra ? 1 : 0);
        return { style: m === n ? (extra ? "x" : "n") : "r", sig: `${m}x${n}:${extra}`,
          body: m === n ? `شبكة مربعة مقسومة إلى ${A(n)} × ${A(n)} مربعات صغيرة متساوية${extra ? "، وحولها مربع خارجي أكبر" : ""}. كم عدد المربعات في الشكل؟` : `شبكة مستطيلة من المربعات الصغيرة المتساوية، فيها ${A(n)} صفوف و ${A(m)} أعمدة. كم عدد المربعات في الشكل؟`,
          ...h.numOptions(R, h.d(v), [h.d(m * n), h.d(inner + (extra ? 0 : 1)), h.d(m * n + n)]),
          steps: [m === n ? "عدد المربعات في شبكة ن × ن = ١² + ٢² + … + ن²." : "نعدّ المربعات حسب مقاسها: مربعات ١×١ ثم ٢×٢ وهكذا، وعدد مربعات المقاس ك = (الأعمدة − ك + ١) × (الصفوف − ك + ١).",
            `${parts.map((x, i) => m === n ? `${A(n - i)}²` : `${A(m - i)}×${A(n - i)}`).reverse().join(" + ")} = ${A(inner)}.`, extra ? `ونضيف المربع الخارجي: ${A(inner)} + ١ = ${A(v)}.` : `العدد = ${A(v)}.`], explanation: A(v) };
      } }
    }
  };
})();
