// المحاضرة 22: النسبة المئوية للمكسب والخسارة (الزيادة والنقص)
(() => {
  const P = (h, x) => `${h.A(x)}٪`;
  const opts = (h, R, v, w) => h.strOptions(R, P(h, v), [...new Set(w.filter(x => x > 0 && x !== v))].slice(0, 3).map(x => P(h, x)).concat([P(h, v + 5), P(h, v + 10), P(h, Math.abs(v - 5) || v + 15)]).slice(0, 4));
  const ITEMS = [["خزانة ملابس"], ["ثلاجة"], ["سيارة"], ["دراجة"], ["غسالة"], ["طاولة"]];
  window.EXAMS[22] = {
    title: "اختبار محاكي: النسبة المئوية للزيادة والنقص", minutes: 25,
    blueprint: [["inc", 4], ["dec", 4], ["addTo", 3], ["two", 4], ["bulk", 3], ["speed", 2], ["newPrice", 2], ["orig", 2]],
    skills: {
      inc: { title: "النسبة المئوية للزيادة", from: 0, to: 230, gen(R, h) {
        const A = h.A, r = R.pick([2, 4, 5, 8, 10, 12, 15, 20, 25, 40, 50]), o = R.int(2, 80) * (100 / [1, 2, 4, 5, 10, 20, 25, 50, 100].find(x => (r * x) % 100 === 0)), n = o + o * r / 100; if (!Number.isInteger(n) || o > 9000) return null;
        const [it] = R.pick(ITEMS);
        return { style: "i", sig: `${o}:${r}`, body: `${it} كان ثمنها ${A(o)} ريال، وزاد ثمنها إلى ${A(n)} ريال، فأوجد النسبة المئوية للزيادة`,
          ...opts(h, R, r, [Math.round((n - o) / n * 100), Math.round(n / o * 100), (n - o) / 10 | 0]),
          steps: ["النسبة المئوية للزيادة = مقدار الزيادة ÷ الأصلي × ١٠٠.", `مقدار الزيادة = ${A(n)} − ${A(o)} = ${A(n - o)}.`, `${h.frac(A(n - o), A(o))} × ١٠٠ = ${P(h, r)}. (نقسم على السعر الأصلي لا الجديد)`], explanation: P(h, r) };
      } },
      dec: { title: "النسبة المئوية للنقص", from: 0, to: 120, gen(R, h) {
        const A = h.A, r = R.pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]), o = R.int(2, 60) * 20, n = o - o * r / 100; if (!Number.isInteger(n) || n <= 0) return null;
        const [it] = R.pick(ITEMS);
        return { style: "d", sig: `${o}:${r}`, body: `انخفض سعر ${it} من ${A(o)} ريال إلى ${A(n)} ريال، فما النسبة المئوية للنقص؟`,
          ...opts(h, R, r, [Math.round((o - n) / n * 100), Math.round(n / o * 100), 100 - r]),
          steps: ["النسبة المئوية للنقص = مقدار النقص ÷ الأصلي × ١٠٠.", `مقدار النقص = ${A(o)} − ${A(n)} = ${A(o - n)}.`, `${h.frac(A(o - n), A(o))} × ١٠٠ = ${P(h, r)}.`], explanation: P(h, r) };
      } },
      addTo: { title: "الإضافة إلى عدد ونسبة الزيادة", from: 230, to: 380, gen(R, h) {
        const A = h.A, y = R.int(2, 40) * 4, k = R.pick([25, 50, 75, 100, 150, 200, 250, 300, 400, 500]), x = y * k / 100; if (!Number.isInteger(x)) return null;
        return { style: "a", sig: `${x}:${y}`, body: `إذا أضفنا ${A(x)} إلى ${A(y)} ، فإن نسبة الزيادة هي:`, ...opts(h, R, k, [Math.round(x / (x + y) * 100), k + 100, Math.round(y / x * 100)]),
          steps: [`الأصلي = ${A(y)} ، ومقدار الزيادة = ${A(x)}.`, `نسبة الزيادة = ${h.frac(A(x), A(y))} × ١٠٠ = ${P(h, k)}.`, "يمكن أن تزيد النسبة على ١٠٠٪ عندما تكون الزيادة أكبر من الأصلي."], explanation: P(h, k) };
      } },
      two: { title: "الخصم على أحد شيئين والنسبة على المجموع", from: 380, to: 790, gen(R, h) {
        const A = h.A, a = R.int(2, 9) * 100, b = R.int(2, 9) * 100, d = R.pick([25, 50, 20, 40, 10]), T = a + b, disc = b * d / 100, r = disc / T * 100, ask = R.pick(["disc", "paid"]); if (!Number.isInteger(r)) return null;
        const v = ask === "disc" ? r : 100 - r;
        return { style: ask, sig: `${a}:${b}:${d}:${ask}`, body: `اشترت سيدة سجادتين، الأولى بسعر ${A(a)} ريال والثانية بسعر ${A(b)} ريال، فحصلت على خصم ${A(d)}٪ على الثانية. احسب النسبة المئوية ${ask === "disc" ? "للخصم على السجادتين" : "لما دفعته من السعر الأصلي"}`,
          ...opts(h, R, v, [d, ask === "disc" ? 100 - r : r, d / 2]),
          steps: [`مجموع السعر الأصلي = ${A(a)} + ${A(b)} = ${A(T)} ريال.`, `مقدار الخصم = ${A(d)}٪ × ${A(b)} = ${A(disc)} ريال${ask === "paid" ? ` ، فما دفعته = ${A(T - disc)} ريال` : ""}.`, `النسبة = ${h.frac(A(ask === "disc" ? disc : T - disc), A(T))} × ١٠٠ = ${P(h, v)}.`], explanation: P(h, v) };
      } },
      bulk: { title: "نسبة التخفيض عند الشراء بالجملة", from: 790, to: 910, gen(R, h) {
        const A = h.A, u = R.int(2, 30) * 10, n = R.pick([4, 5, 10, 20]), T = u * n, r = R.pick([5, 10, 15, 20, 25, 30]), paid = T - T * r / 100; if (!Number.isInteger(paid)) return null;
        return { style: "b", sig: `${u}:${n}:${r}`, body: `سعر قطعة القماش ${A(u)} ريال، إذا اشترى رجل ${A(n)} قطع بسعر ${A(paid)} ريال، فما نسبة التخفيض؟`,
          ...opts(h, R, r, [Math.round((T - paid) / paid * 100), (T - paid) / n | 0, Math.round(paid / T * 100)]),
          steps: [`السعر الأصلي = ${A(u)} × ${A(n)} = ${A(T)} ريال.`, `مقدار التخفيض = ${A(T)} − ${A(paid)} = ${A(T - paid)} ريال.`, `نسبة التخفيض = ${h.frac(A(T - paid), A(T))} × ١٠٠ = ${P(h, r)}.`], explanation: P(h, r) };
      } },
      speed: { title: "نسبة التغير في السرعة أو الطول", from: 910, to: 974, gen(R, h) {
        const A = h.A, o = R.int(4, 24) * 5, r = R.pick([10, 20, 25, 30, 40, 50, 60]), up = R.next() < .4, n = up ? o + o * r / 100 : o - o * r / 100; if (!Number.isInteger(n)) return null;
        const [w, u] = R.pick([["سيارة سرعتها", "كم/س"], ["قطعة حبل طولها", "سم"], ["خزان يتسع", "لترًا"]]);
        return { style: (up ? "u" : "d") + u, sig: `${o}:${r}:${up}:${u}`, body: `${w} ${A(o)} ${u} ${up ? "زادت" : "انخفضت"} إلى ${A(n)} ${u} ، كم النسبة المئوية ${up ? "للزيادة" : "للانخفاض"}؟`,
          ...opts(h, R, r, [Math.round(Math.abs(n - o) / n * 100), Math.abs(n - o), Math.round(n / o * 100)]),
          steps: [`مقدار التغير = ${A(Math.abs(n - o))} ${u}.`, `النسبة = ${h.frac(A(Math.abs(n - o)), A(o))} × ١٠٠ = ${P(h, r)}.`], explanation: P(h, r) };
      } },
      newPrice: { title: "السعر الجديد بعد زيادة أو خصم", from: 0, to: 974, gen(R, h) {
        const A = h.A, o = R.int(2, 50) * 20, r = R.pick([5, 10, 15, 20, 25, 30, 40, 50]), up = R.next() < .5, n = up ? o * (100 + r) / 100 : o * (100 - r) / 100; if (!Number.isInteger(n)) return null;
        return { style: "n" + up, sig: `${o}:${r}:${up}`, body: `سعر سلعة ${A(o)} ريال، ${up ? "زاد سعرها" : "خُفِّض سعرها"} بنسبة ${A(r)}٪ ، فكم سعرها الجديد؟`,
          ...h.numOptions(R, h.d(n), [h.d(up ? o * (100 - r) / 100 : o * (100 + r) / 100), h.d(o * r / 100), h.d(up ? o + r : o - r)]),
          steps: [`مقدار ${up ? "الزيادة" : "الخصم"} = ${A(r)}٪ × ${A(o)} = ${A(o * r / 100)} ريال.`, `السعر الجديد = ${A(o)} ${up ? "+" : "−"} ${A(o * r / 100)} = ${A(n)} ريال.`], explanation: `${A(n)} ريال` };
      } },
      orig: { title: "إيجاد السعر الأصلي من السعر بعد التغير", from: 0, to: 974, gen(R, h) {
        const A = h.A, r = R.pick([10, 20, 25, 50, 60, 75]), up = R.next() < .5, o = R.int(2, 40) * 20, n = up ? o * (100 + r) / 100 : o * (100 - r) / 100; if (!Number.isInteger(n)) return null;
        const wrong = up ? Math.round(n * (100 - r) / 100) : Math.round(n * (100 + r) / 100);
        return { style: "o" + up, sig: `${o}:${r}:${up}`, body: `بعد ${up ? "زيادة" : "خصم"} ${A(r)}٪ أصبح سعر سلعة ${A(n)} ريال، فكم كان سعرها الأصلي؟`,
          ...h.numOptions(R, h.d(o), [h.d(wrong === o ? o + 20 : wrong), h.d(up ? n - r : n + r), h.d(o + 40)]),
          steps: [`السعر الجديد يمثل ${A(up ? 100 + r : 100 - r)}٪ من الأصلي.`, `الأصلي = ${A(n)} × ${h.frac("١٠٠", A(up ? 100 + r : 100 - r))} = ${A(o)} ريال.`, `تنبيه: لا نحسب ${A(r)}٪ من السعر الجديد، لأن النسبة محسوبة على الأصلي.`], explanation: `${A(o)} ريال` };
      } }
    }
  };
})();
