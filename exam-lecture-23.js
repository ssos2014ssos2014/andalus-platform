// المحاضرة 23: نسبة الربح في التقسيط والتخفيض، الزيادة في مساحة المربع والدائرة، السعر الأصلي في الربح والخسارة
(() => {
  const P = (h, x) => `${h.A(x)}٪`;
  const K = { 2: "الضعف", 3: "ثلاثة أضعاف", 4: "أربعة أضعاف", 5: "خمسة أضعاف" };
  const sOpts = (h, R, v, w) => h.strOptions(R, P(h, v), [...new Set(w.filter(x => x > 0 && x !== v))].map(x => P(h, x)).concat([P(h, v + 10), P(h, v + 20), P(h, Math.abs(v - 10) || v + 30)]).filter((x, i, a) => a.indexOf(x) === i && x !== P(h, v)).slice(0, 3));
  const ITEM = ["تلفازًا", "جوالًا", "حاسوبًا", "مكيفًا"];
  window.EXAMS[23] = {
    title: "اختبار محاكي: الربح والخسارة والزيادة في المساحة", minutes: 25,
    blueprint: [["install", 3], ["bulk", 2], ["areaK", 3], ["areaP", 3], ["sellP", 3], ["sellL", 2], ["costP", 4], ["costL", 4]],
    skills: {
      install: { title: "نسبة الربح في البيع بالتقسيط", from: 0, to: 110, gen(R, h) {
        const A = h.A, price = R.int(4, 20) * 10000, years = R.int(1, 3), r = R.pick([10, 15, 20, 25, 30, 50]), total = price * (100 + r) / 100, m = total / (12 * years); if (!Number.isInteger(m)) return null;
        return { style: "y" + years, sig: `${price}:${years}:${r}`, body: `شخص اشترى سيارة بـ ${A(price)} ريال بالتقسيط على ${years === 1 ? "سنة" : years === 2 ? "سنتين" : A(years) + " سنوات"}، حيث يدفع ${A(m)} ريال في الشهر. كم نسبة ربح الشركة؟`,
          ...sOpts(h, R, r, [Math.round((total - price) / total * 100), r / 2, r * 2]),
          steps: [`عدد الأشهر = ${A(12 * years)} شهرًا ، فالمدفوع كله = ${A(m)} × ${A(12 * years)} = ${A(total)} ريال.`, `الربح = ${A(total)} − ${A(price)} = ${A(total - price)} ريال.`, `نسبة الربح = ${h.frac(A(total - price), A(price))} × ١٠٠ = ${P(h, r)}.`], explanation: P(h, r) };
      } },
      bulk: { title: "نسبة التخفيض عند شراء عدة قطع", from: 110, to: 230, gen(R, h) {
        const A = h.A, u = R.int(10, 99) * 10, n = R.pick([5, 10, 20]), T = u * n, r = R.pick([5, 8, 10, 12, 15, 20]), paid = T * (100 - r) / 100; if (!Number.isInteger(paid)) return null;
        return { style: "b", sig: `${u}:${n}:${r}`, body: `سعر الجوال ${A(u)} ريال، إذا اشترينا ${A(n)} جوالات بـ ${A(paid)} ريال، فما نسبة التخفيض؟`, ...sOpts(h, R, r, [Math.round((T - paid) / paid * 100), 100 - r]),
          steps: [`السعر بلا تخفيض = ${A(u)} × ${A(n)} = ${A(T)} ريال.`, `التخفيض = ${A(T)} − ${A(paid)} = ${A(T - paid)} ريال.`, `النسبة = ${h.frac(A(T - paid), A(T))} × ١٠٠ = ${P(h, r)}.`], explanation: P(h, r) };
      } },
      areaK: { title: "الزيادة في مساحة المربع والدائرة عند مضاعفة البعد", from: 230, to: 430, gen(R, h) {
        const A = h.A, k = R.int(2, 5), v = (k * k - 1) * 100, sq = R.next() < .5;
        if (R.next() < .25) { const [w, f, q] = R.pick([["النصف", 2, "75"], ["الربع", 4, "93.75"], ["الخمس", 5, "96"]]), Q = h.fx(h.d(q)) + "٪";
          return { style: "h" + sq, sig: `h${f}:${sq}`, body: `${sq ? "مربع نقص طول ضلعه" : "دائرة نقص نصف قطرها"} إلى ${w}، فكم النسبة المئوية للنقص في ${sq ? "مساحته" : "مساحتها"}؟`,
            ...h.strOptions(R, Q, [h.fx(h.d(String(100 - 100 / f))) + "٪", h.fx(h.d(String(100 / f / f))) + "٪", "٥٠٪"].map(x => x === Q ? "٢٥٪" : x)),
            steps: [`المساحة الجديدة = (${h.frac("١", A(f))})² = ${h.frac("١", A(f * f))} من الأصلية.`, `النقص = ١ − ${h.frac("١", A(f * f))} = ${h.frac(A(f * f - 1), A(f * f))} = ${Q}.`], explanation: Q }; }
        return { style: sq ? "s" : "c", sig: `${k}:${sq}`, body: sq ? `مربع زاد طول ضلعه إلى ${K[k]}، فكم النسبة المئوية للزيادة في مساحته؟` : `دائرة زاد نصف قطرها إلى ${K[k]}، فكم النسبة المئوية للزيادة في مساحتها؟`,
          ...h.strOptions(R, P(h, v), [P(h, (k - 1) * 100), P(h, k * k * 100), P(h, (k * k + 1) * 100)]),
          steps: [`إذا تضاعف ${sq ? "الضلع" : "نصف القطر"} ${A(k)} مرات تتضاعف المساحة ${A(k)}² = ${A(k * k)} مرة.`, `الزيادة = ${A(k * k)} − ١ = ${A(k * k - 1)} أمثال المساحة الأصلية.`, `النسبة = ${A(k * k - 1)} × ١٠٠٪ = ${P(h, v)}.`], explanation: P(h, v) };
      } },
      areaP: { title: "التغير في المساحة عند زيادة البعد بنسبة مئوية", from: 230, to: 430, gen(R, h) {
        const A = h.A, p = R.pick([10, 20, 30, 40, 50, 60, 100]), up = R.next() < .7, f = up ? 100 + p : 100 - p; if (f <= 0) return null;
        const v = Math.abs(f * f / 100 - 100), sq = R.next() < .5;
        if (!Number.isInteger(v)) return null;
        return { style: (up ? "u" : "d") + sq, sig: `${p}:${up}:${sq}`, body: `${sq ? "مربع" : "دائرة"} ${up ? "زاد" : "نقص"} ${sq ? "طول ضلعه" : "نصف قطرها"} بنسبة ${A(p)}٪ ، فكم النسبة المئوية ${up ? "للزيادة" : "للنقص"} في ${sq ? "مساحته" : "مساحتها"}؟`,
          ...h.strOptions(R, P(h, v), [P(h, p), P(h, 2 * p), P(h, up ? p * p / 100 : 100 - v)].map(x => x === P(h, v) ? P(h, v + 5) : x)),
          steps: [`البعد الجديد = ${h.frac(A(f), "١٠٠")} من الأصلي، والمساحة تتناسب مع مربع البعد.`, `المساحة الجديدة = (${h.frac(A(f), "١٠٠")})² = ${h.frac(A(f * f), "١٠٠٠٠")} = ${P(h, f * f / 100)} من الأصلية.`, `${up ? "الزيادة" : "النقص"} = ${P(h, v)} (وليست ${P(h, up ? 2 * p : p)}).`], explanation: P(h, v) };
      } },
      sellP: { title: "سعر البيع في حالة الربح", from: 430, to: 700, gen(R, h) {
        const A = h.A, c = R.int(5, 90) * 100, r = R.pick([5, 10, 15, 20, 25, 30, 40, 50]), s = c * (100 + r) / 100; if (!Number.isInteger(s)) return null;
        return { style: "p", sig: `${c}:${r}`, body: `اشترى رجل ${R.pick(ITEM)} بـ ${A(c)} ريال وباعه بربح ${A(r)}٪ ، فما ثمن البيع؟`,
          ...h.numOptions(R, h.d(s), [h.d(c * (100 - r) / 100), h.d(c + r), h.d(c * r / 100)]),
          steps: ["الشراء يقابله ١٠٠٪ ، والبيع يقابله ١٠٠٪ + نسبة الربح = " + `${A(100 + r)}٪.`, `البيع = ${A(c)} × ${h.frac(A(100 + r), "١٠٠")} = ${A(s)} ريال.`], explanation: `${A(s)} ريال` };
      } },
      sellL: { title: "سعر البيع في حالة الخسارة", from: 430, to: 700, gen(R, h) {
        const A = h.A, c = R.int(5, 90) * 100, r = R.pick([5, 10, 15, 20, 25, 30, 40]), s = c * (100 - r) / 100; if (!Number.isInteger(s)) return null;
        return { style: "l", sig: `${c}:${r}`, body: `اشترى تاجر بضاعة بـ ${A(c)} ريال ثم باعها بخسارة ${A(r)}٪ ، فبكم باعها؟`,
          ...h.numOptions(R, h.d(s), [h.d(c * (100 + r) / 100), h.d(c - r), h.d(c * r / 100)]),
          steps: [`البيع يقابله ١٠٠٪ − ${A(r)}٪ = ${A(100 - r)}٪ من الشراء.`, `البيع = ${A(c)} × ${h.frac(A(100 - r), "١٠٠")} = ${A(s)} ريال.`], explanation: `${A(s)} ريال` };
      } },
      costP: { title: "سعر الشراء من سعر البيع ونسبة الربح", from: 700, to: 900, gen(R, h) {
        const A = h.A, r = R.pick([10, 20, 25, 50, 60, 75]), c = R.int(4, 80) * 20, s = c * (100 + r) / 100; if (!Number.isInteger(s)) return null;
        const wrong = Math.round(s * (100 - r) / 100);
        return { style: "cp", sig: `${c}:${r}`, body: `باع رجل ${R.pick(ITEM)} بمبلغ ${A(s)} ريال وقد ربح فيه ${A(r)}٪ ، فبكم اشتراه؟`,
          ...h.numOptions(R, h.d(c), [h.d(wrong === c ? c + 40 : wrong), h.d(s - r), h.d(Math.round(s * (100 + r) / 100))]),
          steps: [`الشراء ← ١٠٠٪ ، والبيع ← ${A(100 + r)}٪ = ${A(s)} ريال.`, `الشراء = ${A(s)} × ${h.frac("١٠٠", A(100 + r))} = ${A(c)} ريال.`, `تنبيه: لا نطرح ${A(r)}٪ من سعر البيع، فالنسبة محسوبة على سعر الشراء.`], explanation: `${A(c)} ريال` };
      } },
      costL: { title: "السعر الأصلي من سعر البيع ونسبة الخسارة", from: 900, to: 1110, gen(R, h) {
        const A = h.A, r = R.pick([10, 20, 25, 40, 50]), c = R.int(4, 80) * 20, s = c * (100 - r) / 100; if (!Number.isInteger(s)) return null;
        const wrong = Math.round(s * (100 + r) / 100);
        return { style: "cl", sig: `${c}:${r}`, body: `باع رجل جوالًا بمبلغ ${A(s)} ريال وكانت نسبة الخسارة ${A(r)}٪ ، أوجد السعر الأصلي للجوال`,
          ...h.numOptions(R, h.d(c), [h.d(wrong === c ? c + 40 : wrong), h.d(s + r), h.d(Math.round(s * (100 - r) / 100))]),
          steps: [`الأصلي ← ١٠٠٪ ، والبيع ← ${A(100 - r)}٪ = ${A(s)} ريال.`, `الأصلي = ${A(s)} × ${h.frac("١٠٠", A(100 - r))} = ${A(c)} ريال.`, "تحقق بالخيارات: نطرح النسبة من الخيار فيجب أن يعطي سعر البيع."], explanation: `${A(c)} ريال` };
      } }
    }
  };
})();
