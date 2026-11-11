// المحاضرة 51: متوازي المستطيلات والمكعب والأسطوانة (الحجم والمساحة)
(() => {
  const BOX = "حجم متوازي المستطيلات = الطول × العرض × الارتفاع ، ومساحته الجانبية = محيط القاعدة × الارتفاع ، والكلية = ٢ (ط×ع + ط×ر + ع×ر) ، و ١ م³ = ١٠٠٠ لتر.";
  const P = (h, k) => k === 1 ? "ط" : `${Number.isInteger(k) ? h.A(k) : h.fx(h.d(String(k)))} ط`;
  const N = (h, x) => Number.isInteger(x) ? h.A(x) : h.fx(h.d(String(+x.toFixed(3))));
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  window.EXAMS[51] = {
    title: "اختبار محاكي: متوازي المستطيلات والمكعب والأسطوانة", minutes: 25,
    blueprint: [["vol", 3], ["wrap", 3], ["fill", 2], ["lat", 2], ["cubes", 3], ["cube", 4], ["cylV", 3], ["cylA", 2], ["cmp", 2]],
    skills: {
      vol: { title: "حجم متوازي المستطيلات", from: 0, to: 320, gen(R, h) {
        const A = h.A, l = R.int(2, 12), w = R.int(2, 10), ht = R.int(2, 10), V = l * w * ht, miss = R.pick(["V", "dim"]);
        if (miss === "dim") { const c = R.int(1, 4), x = w - c; if (x <= 0) return null;
          return { style: "d", sig: `d${l}:${w}:${ht}:${c}`, body: `متوازي مستطيلات حجمه ${A(V)} ، وأبعاده ${A(l)} و ${A(ht)} و س + ${A(c)}. أوجد قيمة س`, ...h.numOptions(R, h.d(x), [h.d(w), h.d(x + 2), h.d(V / l | 0)]),
            steps: [BOX, `${A(l)} × ${A(ht)} × (س + ${A(c)}) = ${A(V)} ، أي س + ${A(c)} = ${A(w)}.`, `س = ${A(x)}.`], explanation: A(x) }; }
        return { style: "v", sig: `v${l}:${w}:${ht}`, body: `متوازي مستطيلات أبعاده ${A(l)} سم و ${A(w)} سم و ${A(ht)} سم. فما حجمه؟`, ...h.numOptions(R, h.d(V), [h.d(2 * (l * w + l * ht + w * ht)), h.d(l + w + ht), h.d(V / 2 | 0 || V + 2)]),
          steps: [BOX, `الحجم = ${A(l)} × ${A(w)} × ${A(ht)} = ${A(V)} سم³.`], explanation: A(V) };
      } },
      wrap: { title: "المساحة الكلية (تغليف علبة)", from: 320, to: 450, gen(R, h) {
        const A = h.A, l = R.int(2, 20), w = R.int(2, 15), ht = R.int(2, 12), T = 2 * (l * w + l * ht + w * ht);
        return { style: "w", sig: `${l}:${w}:${ht}`, body: `نريد تغليف هدية على شكل متوازي مستطيلات أبعاده ${A(l)} و ${A(w)} و ${A(ht)} سم. كم سم² نحتاج من الورق؟`, ...h.numOptions(R, h.d(T), [h.d(T / 2), h.d(l * w * ht), h.d(T + 2 * l)]),
          steps: [BOX, `ط×ع = ${A(l * w)} ، ط×ر = ${A(l * ht)} ، ع×ر = ${A(w * ht)}.`, `المساحة الكلية = ٢ × ${A(l * w + l * ht + w * ht)} = ${A(T)} سم².`], explanation: A(T) };
      } },
      fill: { title: "زمن ملء خزان", from: 450, to: 700, gen(R, h) {
        const A = h.A, l = R.int(1, 4), w = R.int(1, 3), ht = R.int(1, 3), r = R.pick([250, 500, 1000, 200]), L = l * w * ht * 1000, t = L / r; if (!Number.isInteger(t)) return null;
        return { style: "f", sig: `${l}:${w}:${ht}:${r}`, body: `صنبور يدفع ${A(r)} لتر في الدقيقة، ما الوقت اللازم ليملأ خزانًا على شكل متوازي مستطيلات أبعاده ${A(l)} م و ${A(w)} م و ${A(ht)} م؟`,
          ...h.strOptions(R, `${A(t)} دقيقة`, [`${A(l * w * ht)} دقيقة`, `${A(t * 2)} دقيقة`, `${A(t + 2)} دقيقة`]),
          steps: [`الحجم = ${A(l)} × ${A(w)} × ${A(ht)} = ${A(l * w * ht)} م³ = ${A(L)} لتر.`, `الزمن = ${A(L)} ÷ ${A(r)} = ${A(t)} دقيقة.`], explanation: `${A(t)} دقيقة` };
      } },
      lat: { title: "المساحة الجانبية = محيط القاعدة × الارتفاع", from: 120, to: 320, gen(R, h) {
        const A = h.A, l = R.int(2, 15), w = R.int(2, 12), ht = R.int(2, 10), v = 2 * (l + w) * ht;
        return { style: "l", sig: `${l}:${w}:${ht}`, body: `غرفة على شكل متوازي مستطيلات طولها ${A(l)} م وعرضها ${A(w)} م وارتفاعها ${A(ht)} م. نريد طلاء جدرانها الأربعة فقط. ما مساحة الطلاء؟`, ...h.numOptions(R, h.d(v), [h.d(v + 2 * l * w), h.d(l * w * ht), h.d((l + w) * ht)]),
          steps: [BOX, `محيط القاعدة = ٢ × (${A(l)} + ${A(w)}) = ${A(2 * (l + w))}.`, `المساحة الجانبية = ${A(2 * (l + w))} × ${A(ht)} = ${A(v)} م² (بدون السقف والأرضية).`], explanation: A(v) };
      } },
      cubes: { title: "عدد المكعبات التي توضع في صندوق", from: 1700, to: 1900, gen(R, h) {
        const A = h.A, k = R.pick([1, 2, 3]), a = R.int(1, 5) * k, b = R.int(1, 5) * k, c = R.int(1, 4) * k, v = (a / k) * (b / k) * (c / k);
        return { style: "c" + k, sig: `${a}:${b}:${c}:${k}`, body: `متوازي مستطيلات أبعاده ${A(a)} و ${A(b)} و ${A(c)} ، نريد أن نضع به مكعبات متطابقة طول حرف كل منها ${A(k)}. كم مكعبًا يمكن أن نضع؟`, ...h.numOptions(R, h.d(v), [h.d(a * b * c), h.d(v * 2), h.d((a + b + c) / k)]),
          steps: [`على كل بُعد: ${A(a)} ÷ ${A(k)} = ${A(a / k)} ، ${A(b)} ÷ ${A(k)} = ${A(b / k)} ، ${A(c)} ÷ ${A(k)} = ${A(c / k)}.`, `العدد = ${A(a / k)} × ${A(b / k)} × ${A(c / k)} = ${A(v)} مكعبًا.`], explanation: A(v) };
      } },
      cube: { title: "حجم المكعب ومساحته", from: 1900, to: 2200, gen(R, h) {
        const A = h.A, e = R.int(2, 12), mode = R.pick(["face", "half", "vol", "area"]);
        if (mode === "face") return { style: "f", sig: `f${e}`, body: `مكعب مساحة أوجهه (مساحته الكلية) ${A(6 * e * e)} م². كم طول حرفه؟`, ...h.numOptions(R, h.d(e), [h.d(e * e), h.d(e + 1), h.d(6 * e)]),
          steps: ["المساحة الكلية للمكعب = ٦ ل².", `ل² = ${A(6 * e * e)} ÷ ٦ = ${A(e * e)} ، ل = ${A(e)}.`], explanation: A(e) };
        if (mode === "half") { const V = e ** 3, l = 2 * e, w = e, ht = e; 
          return { style: "h", sig: `h${e}`, body: `حجم مكعب يساوي نصف حجم متوازي مستطيلات أبعاده ${A(l)} و ${A(w)} و ${A(ht)}. فما طول حرف المكعب؟`, ...h.numOptions(R, h.d(e), [h.d(l), h.d(e * e), h.d(e + 1)]),
            steps: [`حجم المتوازي = ${A(l * w * ht)} ، نصفه = ${A(V)}.`, `ل³ = ${A(V)} ، إذن ل = ${A(e)}.`], explanation: A(e) }; }
        const v = mode === "vol" ? e ** 3 : 6 * e * e;
        return { style: mode, sig: `${mode}${e}`, body: `مكعب طول حرفه ${A(e)} سم. فما ${mode === "vol" ? "حجمه" : "مساحته الكلية"}؟`, ...h.numOptions(R, h.d(v), mode === "vol" ? [h.d(6 * e * e), h.d(3 * e), h.d(e * e)] : [h.d(e ** 3), h.d(4 * e * e), h.d(e * e)]),
          steps: [mode === "vol" ? `الحجم = ل³ = ${A(e)}³ = ${A(v)} سم³.` : `المساحة الكلية = ٦ × ${A(e)}² = ${A(v)} سم².`], explanation: A(v) };
      } },
      cylV: { title: "حجم الأسطوانة = ط نق² × ع", from: 2200, to: 2700, gen(R, h) {
        const A = h.A, r = R.int(1, 8), ht = R.int(2, 15), mode = R.pick(["V", "d", "h"]), V = r * r * ht;
        if (mode === "h") return { style: "h", sig: `h${r}:${ht}`, body: `أسطوانة حجمها ${P(h, V)} سم³ ونصف قطر قاعدتها ${A(r)} سم. فما ارتفاعها؟`, ...h.numOptions(R, h.d(ht), [h.d(V / r | 0), h.d(ht * 2), h.d(ht + r)]),
          steps: [`ط × ${A(r)}² × ع = ${P(h, V)}.`, `ع = ${A(V)} ÷ ${A(r * r)} = ${A(ht)} سم.`], explanation: A(ht) };
        return { style: mode, sig: `${mode}${r}:${ht}`, body: mode === "d" ? `أسطوانة قطر قاعدتها ${A(2 * r)} سم وارتفاعها ${A(ht)} سم. فما حجمها؟` : `أسطوانة نصف قطر قاعدتها ${A(r)} سم وارتفاعها ${A(ht)} سم. فما حجمها؟`,
          ...h.strOptions(R, P(h, V), [P(h, 4 * r * r * ht), P(h, 2 * r * ht), P(h, r * ht)].map(x => x === P(h, V) ? P(h, V + ht) : x)),
          steps: ["حجم الأسطوانة = ط نق² × ع.", mode === "d" ? `نق = ${A(2 * r)} ÷ ٢ = ${A(r)}.` : "", `الحجم = ط × ${A(r * r)} × ${A(ht)} = ${P(h, V)}.`].filter(Boolean), explanation: P(h, V) };
      } },
      cylA: { title: "المساحة الجانبية والكلية للأسطوانة", from: 2200, to: 3049, gen(R, h) {
        const A = h.A, r = R.int(1, 8), ht = R.int(2, 15), tot = R.next() < .5, v = tot ? 2 * r * ht + 2 * r * r : 2 * r * ht;
        return { style: "a" + tot, sig: `${r}:${ht}:${tot}`, body: `أسطوانة نصف قطر قاعدتها ${A(r)} سم وارتفاعها ${A(ht)} سم. فما مساحتها ${tot ? "الكلية" : "الجانبية"}؟`,
          ...h.strOptions(R, P(h, v), [P(h, r * r * ht), P(h, tot ? 2 * r * ht : 2 * r * ht + 2 * r * r), P(h, r * ht)].map(x => x === P(h, v) ? P(h, v + 2) : x)),
          steps: ["المساحة الجانبية = ٢ ط نق × ع ، والكلية = الجانبية + مساحة القاعدتين (٢ ط نق²).", `الجانبية = ${P(h, 2 * r * ht)}${tot ? ` ، والقاعدتان = ${P(h, 2 * r * r)} ، فالكلية = ${P(h, v)}` : ""}.`], explanation: P(h, v) };
      } },
      cmp: { title: "المقارنة بين حجوم مكعبات", from: 1930, to: 2000, gen(R, h) {
        const A = h.A, a = R.int(1, 4), n = R.pick([8, 27, 64, 100, 50]), [b, bt] = R.pick([[0.5, "½"], [1, "١"], [0.25, "¼"]]), x = a ** 3, y = n * b ** 3;
        return { style: "c", sig: `${a}:${n}:${b}`, body: `قارن بين:\nالقيمة الأولى: حجم مكعب طول حرفه ${A(a)} سم\nالقيمة الثانية: حجم ${A(n)} مكعبًا طول حرف كل منها ${bt} سم`, ...h.cmpAnswer(h.d(String(x)), h.d(String(y))),
          steps: [`الأولى = ${A(a)}³ = ${A(x)}.`, `الثانية = ${A(n)} × (${bt})³ = ${N(h, y)}.`, `إذن ${rel(x, y)}.`], explanation: rel(x, y) };
      } }
    }
  };
})();
