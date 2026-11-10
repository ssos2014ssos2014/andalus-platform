// المحاضرة 35: المضاعف المشترك الأصغر والقاسم المشترك الأكبر في مسائل لفظية
(() => {
  const g = (a, b) => b ? g(b, a % b) : a, l = (a, b) => a / g(a, b) * b;
  const LCM = "المضاعف المشترك الأصغر: أصغر عدد يقبل القسمة على الأعداد كلها، ونحصل عليه بتحليل الأعداد إلى عواملها الأولية وأخذ العوامل المشتركة وغير المشتركة بأعلى قوة.";
  const GCD = "القاسم المشترك الأكبر: أكبر عدد تقبل الأعداد القسمة عليه دون باقٍ.";
  const H = (h, n) => n === 1 ? "ساعة" : n === 2 ? "ساعتين" : n <= 10 ? `${h.A(n)} ساعات` : `${h.A(n)} ساعة`;
  window.EXAMS[35] = {
    title: "اختبار محاكي: المضاعف المشترك الأصغر والقاسم المشترك الأكبر", minutes: 25,
    blueprint: [["lcm", 3], ["meet", 3], ["week", 2], ["runners", 3], ["square", 4], ["families", 3], ["kits", 3], ["groups", 3]],
    skills: {
      lcm: { title: "أصغر عدد يقبل القسمة على عدة أعداد", from: 0, to: 190, gen(R, h) {
        const A = h.A, ns = R.shuffle([4, 5, 6, 8, 9, 10, 12, 15]).slice(0, R.pick([2, 3])).sort((a, b) => a - b), v = ns.reduce(l); if (v > 400) return null;
        return { style: "l" + ns.length, sig: ns.join(":"), body: `لدينا سلم نستطيع عدّ درجاته ${ns.map(A).join(" ، و")} ${ns.length > 2 ? "" : ""}درجات في كل مرة دون أن يتبقى شيء، فما أقل عدد ممكن لدرجات السلم؟`,
          ...h.numOptions(R, h.d(v), [h.d(ns.reduce((a, b) => a * b) === v ? v * 2 : ns.reduce((a, b) => a * b)), h.d(v + ns[0]), h.d(v / 2 | 0 || v + 10)]),
          steps: [LCM, `م.م.أ (${ns.map(A).join(" ، ")}) = ${A(v)}.`, `تحقق: ${ns.map(n => `${A(v)} ÷ ${A(n)} = ${A(v / n)}`).join(" ، ")}.`], explanation: A(v) };
      } },
      meet: { title: "عدد مرات الالتقاء لحدثين متكررين", from: 190, to: 390, gen(R, h) {
        const A = h.A, a = R.int(3, 12), b = R.int(3, 12); if (a === b) return null; const m = l(a, b), T = R.int(1, 6), v = Math.floor(T * 60 / m); if (m > 90 || v < 1) return null;
        return { style: "m", sig: `${a}:${b}:${T}`, body: `قطار يصل إلى المحطة كل ${A(a)} دقائق، وقطار آخر يصل كل ${A(b)} دقائق، فإذا تحركا في اللحظة نفسها، فكم مرة يلتقيان في أول ${H(h, T)} (دون حساب لحظة البداية)؟`,
          ...h.numOptions(R, h.d(v), [h.d(v + 1), h.d(Math.max(1, v - 1)), h.d(Math.floor(T * 60 / (a + b)))]),
          steps: [`يلتقيان كل م.م.أ (${A(a)} ، ${A(b)}) = ${A(m)} دقيقة.`, `${H(h, T)} = ${A(T * 60)} دقيقة.`, `عدد المرات = ${A(T * 60)} ÷ ${A(m)} ≈ ${A(v)} (نأخذ العدد الصحيح فقط).`], explanation: A(v) };
      } },
      week: { title: "التقاء جدولين أسبوعيين", from: 390, to: 470, gen(R, h) {
        const A = h.A, p = R.int(2, 6), q = R.int(2, 6), ov = Math.max(0, p + q - 7), w = R.int(4, 20), v = ov * w; if (!ov) return null;
        return { style: "w", sig: `${p}:${q}:${w}`, body: `محمد يزور والده مرة في كل يوم من أول ${A(p)} أيام في الأسبوع، وأحمد يزور والده مرة في كل يوم من آخر ${A(q)} أيام في الأسبوع، فكم مرة يلتقيان خلال ${A(w)} أسبوعًا؟`,
          ...h.numOptions(R, h.d(v), [h.d(w), h.d((ov + 1) * w), h.d(p + q)]),
          steps: [`أيام الأسبوع ٧ ، ومجموع الأيام ${A(p)} + ${A(q)} = ${A(p + q)} ، فتتداخل ${A(p + q)} − ٧ = ${A(ov)} ${ov === 1 ? "يوم" : "أيام"} في الأسبوع.`, `خلال ${A(w)} أسبوعًا: ${A(ov)} × ${A(w)} = ${A(v)} مرة.`], explanation: A(v) };
      } },
      runners: { title: "التقاء عداءين عند نقطة البداية", from: 470, to: 640, gen(R, h) {
        const A = h.A, a = R.int(6, 30), b = R.int(6, 30); if (a === b) return null; const v = l(a, b); if (v > 300 || v === a * b && R.next() < .3) return null;
        return { style: "r", sig: `${a}:${b}`, body: `يجري عدّاءان في مضمار دائري، يقطع الأول المضمار في ${A(a)} دقيقة ويقطعه الثاني في ${A(b)} دقيقة. إذا انطلقا في الوقت نفسه وفي الاتجاه نفسه، فإنهما يلتقيان لأول مرة عند نقطة البداية بعد:`,
          ...h.strOptions(R, `${A(v)} دقيقة`, [`${A(a * b === v ? v * 2 : a * b)} دقيقة`, `${A(a + b)} دقيقة`, `${A(v / 2 | 0 || v + 10)} دقيقة`]),
          steps: ["يعود كل عدّاء إلى نقطة البداية عند مضاعفات زمنه، فيلتقيان عند المضاعف المشترك الأصغر.", `م.م.أ (${A(a)} ، ${A(b)}) = ${A(v)} دقيقة.`], explanation: `${A(v)} دقيقة` };
      } },
      square: { title: "أكبر مربع يقسم مستطيلًا", from: 640, to: 960, gen(R, h) {
        const A = h.A, k = R.int(2, 15), p = R.int(2, 9), q = R.int(2, 9); if (g(p, q) !== 1 || p === q) return null; const a = k * p, b = k * q, ask = R.pick(["side", "side", "count"]), v = ask === "side" ? k : p * q;
        return { style: ask, sig: `${a}:${b}:${ask}`, body: ask === "side" ? `أرض مستطيلة الشكل أبعادها ${A(a)} م و ${A(b)} م ، نريد تغطيتها ببلاط مربع متساوٍ دون قص. فما أطول ضلع ممكن للمربع؟` : `مستطيل بعداه ${A(a)} سم و ${A(b)} سم ، قُسّم إلى أكبر مربعات متساوية ممكنة. فكم عدد المربعات؟`,
          ...h.numOptions(R, h.d(v), ask === "side" ? [h.d(k * 2), h.d(Math.max(1, k - 1)), h.d(g(a, b) === k && k > 2 ? k / 2 | 0 : k + 1)] : [h.d(p + q), h.d(k * k), h.d(v + p)]),
          steps: [GCD, `ق.م.أ (${A(a)} ، ${A(b)}) = ${A(k)} ، فأكبر ضلع للمربع ${A(k)}.`, ask === "count" ? `عدد المربعات = (${A(a)} ÷ ${A(k)}) × (${A(b)} ÷ ${A(k)}) = ${A(p)} × ${A(q)} = ${A(v)}.` : `تحقق: ${A(a)} ÷ ${A(k)} = ${A(p)} ، و ${A(b)} ÷ ${A(k)} = ${A(q)}.`], explanation: A(v) };
      } },
      families: { title: "أكبر عدد يمكن خدمته بحصص غير متساوية", from: 720, to: 900, gen(R, h) {
        const A = h.A, x = R.int(2, 9) * 12, y = R.int(2, 9) * 12, p = R.pick([1, 1, 2]), q = R.pick([2, 3]), v = Math.min(Math.floor(x / p), Math.floor(y / q)); if (p === q) return null;
        return { style: "f", sig: `${x}:${y}:${p}:${q}`, body: `إذا كان لدينا ${A(x)} كيس أرز و ${A(y)} كيس سكر، فما أكبر عدد من الأسر يمكنها أن تأخذ ${p === 1 ? "كيسًا" : "كيسين"} من الأرز و ${q === 2 ? "كيسين" : A(q) + " أكياس"} من السكر؟`,
          ...h.numOptions(R, h.d(v), [h.d(g(x, y)), h.d(Math.max(Math.floor(x / p), Math.floor(y / q))), h.d(v + 2)]),
          steps: [`الأرز يكفي ${A(x)} ÷ ${A(p)} = ${A(Math.floor(x / p))} أسرة.`, `السكر يكفي ${A(y)} ÷ ${A(q)} = ${A(Math.floor(y / q))} أسرة.`, `العدد الأصغر هو الذي يحدد: ${A(v)} أسرة.`], explanation: A(v) };
      } },
      kits: { title: "عدد القطع الكاملة من مكونين", from: 960, to: 1188, gen(R, h) {
        const A = h.A, p = R.int(2, 6), q = R.int(2, 6), X = R.int(10, 40), Y = R.int(10, 40), v = Math.min(Math.floor(X / p), Math.floor(Y / q));
        return { style: "k", sig: `${p}:${q}:${X}:${Y}`, body: `نستطيع صنع طاولة باستخدام ${A(p)} مستطيلات و ${A(q)} مربعات. إذا كان لدينا ${A(X)} مستطيلًا و ${A(Y)} مربعًا، فكم طاولة نستطيع أن نصنع؟`,
          ...h.numOptions(R, h.d(v), [h.d(Math.max(Math.floor(X / p), Math.floor(Y / q))), h.d(Math.floor((X + Y) / (p + q))) === h.d(v) ? h.d(v + 1) : h.d(Math.floor((X + Y) / (p + q))), h.d(v + 2)]),
          steps: [`المستطيلات تكفي ${A(X)} ÷ ${A(p)} = ${A(Math.floor(X / p))} طاولة.`, `المربعات تكفي ${A(Y)} ÷ ${A(q)} = ${A(Math.floor(Y / q))} طاولة.`, `الأقل يحدد العدد: ${A(v)} طاولة.`], explanation: A(v) };
      } },
      groups: { title: "أكبر عدد من المجموعات المتساوية", from: 640, to: 960, gen(R, h) {
        const A = h.A, k = R.int(3, 18), p = R.int(2, 7), q = R.int(2, 7); if (g(p, q) !== 1 || p === q) return null; const a = k * p, b = k * q;
        return { style: "g", sig: `${a}:${b}`, body: `لدى معلم ${A(a)} قلمًا و ${A(b)} دفترًا، ويريد توزيعها على أكبر عدد من الطلاب بحيث يأخذ كل طالب العدد نفسه من الأقلام والعدد نفسه من الدفاتر دون أن يتبقى شيء. فكم طالبًا؟`,
          ...h.numOptions(R, h.d(k), [h.d(l(a, b) > 500 ? k + 2 : l(a, b)), h.d(p + q), h.d(k * 2)]),
          steps: [GCD, `ق.م.أ (${A(a)} ، ${A(b)}) = ${A(k)} طالبًا.`, `يأخذ كل طالب ${A(p)} أقلام و ${A(q)} دفاتر.`], explanation: A(k) };
      } }
    }
  };
})();
