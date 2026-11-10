// المحاضرة 44: مساحة المستطيل ومحيطه وتطبيقاتهما
(() => {
  const LAW = "مساحة المستطيل = الطول × العرض ، والمحيط = ٢ × (الطول + العرض) ، ونصف المحيط = الطول + العرض.";
  window.EXAMS[44] = {
    title: "اختبار محاكي: مساحة المستطيل ومحيطه", minutes: 25,
    blueprint: [["basic", 3], ["wire", 3], ["ap", 4], ["seat", 2], ["total", 2], ["ratio", 3], ["divided", 3], ["perimX", 2], ["two", 2]],
    skills: {
      basic: { title: "مساحة المستطيل ومحيطه", from: 0, to: 180, gen(R, h) {
        const A = h.A, l = R.int(3, 30), w = R.int(2, l - 1), ask = R.pick(["area", "perim"]), v = ask === "area" ? l * w : 2 * (l + w);
        return { style: ask, sig: `${l}:${w}:${ask}`, body: `مستطيل طوله ${A(l)} سم وعرضه ${A(w)} سم. فما ${ask === "area" ? "مساحته" : "محيطه"}؟`, ...h.numOptions(R, h.d(v), [h.d(ask === "area" ? 2 * (l + w) : l * w), h.d(l + w), h.d(v + 2)]),
          steps: [LAW, ask === "area" ? `المساحة = ${A(l)} × ${A(w)} = ${A(v)} سم².` : `المحيط = ٢ × (${A(l)} + ${A(w)}) = ${A(v)} سم.`], explanation: A(v) };
      } },
      wire: { title: "سلك مُشكَّل على هيئة مستطيل", from: 180, to: 300, gen(R, h) {
        const A = h.A, l = R.int(3, 25), w = R.int(1, l - 1), P = 2 * (l + w), mode = R.pick(["len", "diff"]);
        if (mode === "len") return { style: "l", sig: `l${l}:${w}`, body: `سلك طوله ${A(P)} سم تم تشكيله على شكل مستطيل عرضه ${A(w)} سم. فما طوله؟`, ...h.numOptions(R, h.d(l), [h.d(P - w), h.d(P / 2), h.d(P - 2 * w)]),
          steps: ["طول السلك = محيط المستطيل.", `الطول + العرض = ${A(P)} ÷ ٢ = ${A(P / 2)}.`, `الطول = ${A(P / 2)} − ${A(w)} = ${A(l)} سم.`], explanation: A(l) };
        return { style: "d", sig: `d${l}:${w}`, body: `سلك طوله ${A(P)} سم تم طيّه على شكل مستطيل مساحته ${A(l * w)} سم². أوجد الفرق بين الطول والعرض`, ...h.numOptions(R, h.d(l - w), [h.d(l + w), h.d(l), h.d(l - w + 2)]),
          steps: [`الطول + العرض = ${A(P / 2)} ، والطول × العرض = ${A(l * w)}.`, `العددان: ${A(l)} و ${A(w)}.`, `الفرق = ${A(l - w)}.`], explanation: A(l - w) };
      } },
      ap: { title: "الأبعاد من المساحة والمحيط", from: 1020, to: 1320, gen(R, h) {
        const A = h.A, l = R.int(3, 25), w = R.int(2, l - 1), S = l * w, P = 2 * (l + w), ask = R.pick(["len", "diff", "wid"]), v = ask === "len" ? l : ask === "wid" ? w : l - w;
        return { style: ask, sig: `${l}:${w}:${ask}`, body: `مستطيل مساحته ${A(S)} سم² ومحيطه ${A(P)} سم. ${ask === "len" ? "فكم طوله؟" : ask === "wid" ? "فكم عرضه؟" : "أوجد الفرق بين طوله وعرضه"}`,
          ...h.numOptions(R, h.d(v), [h.d(ask === "len" ? w : ask === "wid" ? l : l + w), h.d(v + 1), h.d(P / 2)]),
          steps: [`الطول + العرض = ${A(P)} ÷ ٢ = ${A(P / 2)} ، والطول × العرض = ${A(S)}.`, `نبحث عن عددين مجموعهما ${A(P / 2)} وحاصل ضربهما ${A(S)}: ${A(l)} و ${A(w)}.`, `المطلوب = ${A(v)}.`], explanation: A(v) };
      } },
      seat: { title: "عدد الأشخاص حسب المساحة", from: 480, to: 600, gen(R, h) {
        const A = h.A, l = R.int(2, 10) * 10, w = R.int(1, 8) * 10, k = R.int(2, 6), v = l * w * k;
        return { style: "s", sig: `${l}:${w}:${k}`, body: `أرض طولها ${A(l)} م وعرضها ${A(w)} م ، في كل متر مربع يجلس ${A(k)} أشخاص. كم شخصًا يستطيع الجلوس؟`, ...h.numOptions(R, h.d(v), [h.d(l * w), h.d(2 * (l + w) * k), h.d(v / 2)]),
          steps: [`المساحة = ${A(l)} × ${A(w)} = ${A(l * w)} م².`, `العدد = ${A(l * w)} × ${A(k)} = ${A(v)} شخصًا.`], explanation: A(v) };
      } },
      total: { title: "مجموع أطوال مستطيلات مختلفة", from: 360, to: 480, gen(R, h) {
        const A = h.A, n = R.pick([50, 100, 200, 40]), m = R.int(1, n - 1), a = R.int(5, 20), b = a + R.int(1, 10), v = m * a + (n - m) * b;
        return { style: "t", sig: `${n}:${m}:${a}:${b}`, body: `إذا كان هناك ${A(n)} مستطيل، وكان أول ${A(m)} منها طول كل واحد ${A(a)} سم، وطول كل واحد من الباقي ${A(b)} سم، فما مجموع أطوال المستطيلات كلها؟`,
          ...h.numOptions(R, h.d(v), [h.d(n * b), h.d(n * a), h.d(v + b)]),
          steps: [`الأولى: ${A(m)} × ${A(a)} = ${A(m * a)} سم.`, `الباقي ${A(n - m)} × ${A(b)} = ${A((n - m) * b)} سم.`, `المجموع = ${A(v)} سم.`], explanation: A(v) };
      } },
      ratio: { title: "الطول مضاعف للعرض أو جزء منه", from: 2280, to: 2640, gen(R, h) {
        const A = h.A, k = R.int(2, 4), w = R.int(2, 15), l = k * w, P = 2 * (l + w), ask = R.pick(["area", "len"]);
        return { style: ask + k, sig: `${k}:${w}:${ask}`, body: `أرض مستطيلة محاطة بسياج طوله ${A(P)} مترًا، وعرضها يساوي ${k === 2 ? "نصف" : k === 3 ? "ثلث" : "ربع"} طولها. فما ${ask === "area" ? "مساحة الأرض بالمتر المربع" : "طول الأرض"}؟`,
          ...h.numOptions(R, h.d(ask === "area" ? l * w : l), ask === "area" ? [h.d(P), h.d(l * w * 2), h.d(l * w - w)] : [h.d(w), h.d(P / 2), h.d(l + w)]),
          steps: [`نصف المحيط = ${A(P / 2)} = الطول + العرض = ${A(k)}ع + ع = ${A(k + 1)}ع.`, `العرض = ${A(w)} م ، والطول = ${A(l)} م.`, ask === "area" ? `المساحة = ${A(l)} × ${A(w)} = ${A(l * w)} م².` : `الطول = ${A(l)} م.`], explanation: A(ask === "area" ? l * w : l) };
      } },
      divided: { title: "مستطيل مقسم إلى أجزاء متساوية", from: 2160, to: 2640, gen(R, h) {
        const A = h.A, mode = R.pick(["rects", "tris"]);
        if (mode === "rects") { const n = R.int(3, 6), w = R.int(1, 5), l0 = R.int(1, 4), L = n * l0, P = 2 * (L + w), v = l0 * w;
          return { style: "r", sig: `r${n}:${w}:${l0}`, body: `مستطيل محيطه ${A(P)} سم ، قُسم إلى ${A(n)} مستطيلات متساوية متجاورة على طوله، وعرضه ${A(w)} سم. أوجد مساحة المستطيل الواحد`, ...h.numOptions(R, h.d(v), [h.d(L * w), h.d(v + w), h.d(P / n | 0 || v + 2)]),
            steps: [`الطول + العرض = ${A(P / 2)} ، فالطول = ${A(P / 2)} − ${A(w)} = ${A(L)}.`, `طول المستطيل الصغير = ${A(L)} ÷ ${A(n)} = ${A(l0)}.`, `مساحته = ${A(l0)} × ${A(w)} = ${A(v)} سم².`], explanation: A(v) }; }
        const w = R.int(2, 6), l = 2 * w, n = R.pick([2, 4, 6, 8]);
        return { style: "t", sig: `${n}:${m}:${a}:${b}`, body: `إذا كان هناك ${A(n)} مستطيل، وكان أول ${A(m)} منها طول كل واحد ${A(a)} سم، وطول كل واحد من الباقي ${A(b)} سم، فما مجموع أطوال المستطيلات كلها؟`,
          ...h.numOptions(R, h.d(v), [h.d(n * b), h.d(n * a), h.d(v + b)]),
          steps: [`الأولى: ${A(m)} × ${A(a)} = ${A(m * a)} سم.`, `الباقي ${A(n - m)} × ${A(b)} = ${A((n - m) * b)} سم.`, `المجموع = ${A(v)} سم.`], explanation: A(v) };
      } },
      ratio: { title: "الطول مضاعف للعرض أو جزء منه", from: 2280, to: 2640, gen(R, h) {
        const A = h.A, k = R.int(2, 4), w = R.int(2, 15), l = k * w, P = 2 * (l + w), ask = R.pick(["area", "len"]);
        return { style: ask + k, sig: `${k}:${w}:${ask}`, body: `أرض مستطيلة محاطة بسياج طوله ${A(P)} مترًا، وعرضها يساوي ${k === 2 ? "نصف" : k === 3 ? "ثلث" : "ربع"} طولها. فما ${ask === "area" ? "مساحة الأرض بالمتر المربع" : "طول الأرض"}؟`,
          ...h.numOptions(R, h.d(ask === "area" ? l * w : l), ask === "area" ? [h.d(P), h.d(l * w * 2), h.d(l * w - w)] : [h.d(w), h.d(P / 2), h.d(l + w)]),
          steps: [`نصف المحيط = ${A(P / 2)} = الطول + العرض = ${A(k)}ع + ع = ${A(k + 1)}ع.`, `العرض = ${A(w)} م ، والطول = ${A(l)} م.`, ask === "area" ? `المساحة = ${A(l)} × ${A(w)} = ${A(l * w)} م².` : `الطول = ${A(l)} م.`], explanation: A(ask === "area" ? l * w : l) };
      } },
      divided: { title: "مستطيل مقسم إلى أجزاء متساوية", from: 2160, to: 2640, gen(R, h) {
        const A = h.A, mode = R.pick(["rects", "tris"]);
        if (mode === "rects") { const n = R.int(3, 6), w = R.int(1, 5), l0 = R.int(1, 4), L = n * l0, P = 2 * (L + w), v = l0 * w;
          return { style: "r", sig: `r${n}:${w}:${l0}`, body: `مستطيل محيطه ${A(P)} سم ، قُسم إلى ${A(n)} مستطيلات متساوية متجاورة على طوله، وعرضه ${A(w)} سم. أوجد مساحة المستطيل الواحد`, ...h.numOptions(R, h.d(v), [h.d(L * w), h.d(v + w), h.d(P / n | 0 || v + 2)]),
            steps: [`الطول + العرض = ${A(P / 2)} ، فالطول = ${A(P / 2)} − ${A(w)} = ${A(L)}.`, `طول المستطيل الصغير = ${A(L)} ÷ ${A(n)} = ${A(l0)}.`, `مساحته = ${A(l0)} × ${A(w)} = ${A(v)} سم².`], explanation: A(v) }; }
        const w = R.int(2, 6), l = 2 * w, cols = l / 1 | 0, rows = w, sq = l * w, tri = 2 * l * w / (l / w * w) ; const n = R.pick([2, 4, 6, 8]), cells = 2 * l * w / 4, triA = l * w / (2 * cells / 2); 
        const unit = 1, totalTris = 2 * (l / 2) * (w / 1) ; const Sone = (l * w) / (l * w / 2 * 1) ; if (!Number.isInteger(n)) return null;
        const per = l * w / (l * w), area = n * per / 1;
        return { style: "t", sig: `t${w}:${n}`, body: `مستطيل طوله ${A(l)} سم وعرضه ${A(w)} سم ، قُسم إلى مربعات طول ضلع كل منها ١ سم ثم قُسم كل مربع بقطره إلى مثلثين متساويين. أوجد مساحة ${A(n)} مثلثات منها`,
          ...h.strOptions(R, `${h.A(n / 2)} سم²`, [`${A(n)} سم²`, `${A(n * 2)} سم²`, `${A(n / 2 + 1)} سم²`]),
          steps: ["مساحة المربع الصغير = ١ × ١ = ١ سم² ، والمثلث نصفه = ½ سم².", `مساحة ${A(n)} مثلثات = ${A(n)} × ½ = ${A(n / 2)} سم².`], explanation: `${A(n / 2)} سم²` };
      } },
      perimX: { title: "إيجاد مجهول في أبعاد المستطيل من محيطه", from: 2280, to: 2340, gen(R, h) {
        const A = h.A, w = R.int(2, 10), c = R.int(1, 6), x = R.int(2, 12), l = x + c, P = 2 * (l + w);
        return { style: "x", sig: `${w}:${c}:${x}`, body: `إذا كان محيط مستطيل = ${A(P)} سم ، وعرضه ${A(w)} وطوله س + ${A(c)} ، فما قيمة س؟`, ...h.numOptions(R, h.d(x), [h.d(l), h.d(x + 1), h.d(P / 2 - c)]),
          steps: [`نصف المحيط = ${A(P / 2)} = (س + ${A(c)}) + ${A(w)}.`, `س = ${A(P / 2)} − ${A(c + w)} = ${A(x)}.`], explanation: A(x) };
      } },
      two: { title: "المقارنة بين مستطيلين", from: 300, to: 360, gen(R, h) {
        const A = h.A, b = R.int(3, 15), k = R.int(2, 3), a = k * b, ask = R.pick(["sum", "diff"]), v = ask === "sum" ? a + b : a - b;
        return { style: ask, sig: `${b}:${k}:${ask}`, body: `مستطيلان، طول الأول ${k === 2 ? "ضعف" : "ثلاثة أمثال"} طول الثاني، وطول الثاني ${A(b)}. فما ${ask === "sum" ? "مجموع طوليهما" : "الفرق بين طوليهما"}؟`,
          ...h.numOptions(R, h.d(v), [h.d(a), h.d(ask === "sum" ? a - b : a + b), h.d(v + k)]),
          steps: [`طول الأول = ${A(k)} × ${A(b)} = ${A(a)}.`, `${ask === "sum" ? "المجموع" : "الفرق"} = ${A(v)}.`], explanation: A(v) };
      } }
    }
  };
})();
