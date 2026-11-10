// المحاضرة 34: متتابعات الكسور، الأنماط في الأشكال الدائرية، الحد النوني للمتتابعة الحسابية
(() => {
  const g = (a, b) => b ? g(b, a % b) : a;
  const S = (h, x) => x < 0 ? `−${h.A(-x)}` : h.A(x);
  // كسر مختلط من بسط ومقام: ٢ ¼ ⇢ "٢ ⟦١/٤⟧"
  const MX = (h, n, d) => { const k = g(Math.abs(n), d); n /= k; d /= k; if (d === 1) return S(h, n); const w = Math.trunc(n / d), r = Math.abs(n % d); return w ? `${S(h, w)} ${h.frac(h.A(r), h.A(d))}` : `${n < 0 ? "−" : ""}${h.frac(h.A(r), h.A(d))}`; };
  const DEC = (h, x) => Number.isInteger(x) ? S(h, x) : (x < 0 ? "−" : "") + h.fx(h.d(String(Math.abs(x))));
  const nth = "الحد رقم ن = الحد الأول + (ن − ١) × أساس المتتابعة (الفرق الثابت).";
  window.EXAMS[34] = {
    title: "اختبار محاكي: متتابعات الكسور والحد النوني", minutes: 25,
    blueprint: [["frac", 4], ["altDec", 2], ["grow", 3], ["fibLike", 2], ["nth", 5], ["cmpNth", 3], ["negPow", 3], ["findN", 2]],
    skills: {
      frac: { title: "متتابعة حسابية بكسور (الحد الناقص)", from: 0, to: 270, gen(R, h) {
        const d = R.pick([2, 3, 4, 5, 8]), step = R.int(1, d - 1), a = R.int(1, 5) * d, n = 5, terms = Array.from({ length: n }, (_, i) => a + i * step), miss = R.int(1, 3);
        if (g(step, d) !== 1 && d !== 4) return null;
        const show = terms.map((t, i) => i === miss ? "......" : MX(h, t, d)).join(" ، "), v = MX(h, terms[miss], d);
        return { style: "f" + d, sig: `${d}:${step}:${a}:${miss}`, body: `أكمل المتتابعة: ${show}`, ...h.strOptions(R, v, [MX(h, terms[miss] + 1, d), MX(h, terms[miss] - 1, d), MX(h, terms[miss] + step, d)].map(x => x === v ? MX(h, terms[miss] + 2 * step + 1, d) : x)),
          steps: ["نوحّد المقامات لنرى الفرق الثابت بسهولة.", `الحدود: ${terms.map(t => h.frac(h.A(t), h.A(d))).join(" ، ")} ، والفرق = ${h.frac(h.A(step), h.A(d))}.`, `الحد الناقص = ${h.frac(h.A(terms[miss]), h.A(d))} = ${v}.`], explanation: v };
      } },
      altDec: { title: "نمط يتناوب فيه فرقان", from: 270, to: 490, gen(R, h) {
        const a = R.int(15, 40) / 2 + 10, p = R.pick([1.5, 1, 2, 2.5]), q = R.pick([0.5, 1, 1.5]); if (p === q) return null; const s = [a]; for (let i = 0; i < 5; i++) s.push(s[i] - (i % 2 ? q : p)); const v = s[5] - p;
        return { style: "a", sig: `${a}:${p}:${q}`, body: `أكمل النمط: ${s.map(x => DEC(h, x)).join(" ، ")} ، ....`, ...h.strOptions(R, DEC(h, v), [DEC(h, s[5] - q), DEC(h, v - 1), DEC(h, s[5] - p - q)].map(x => x === DEC(h, v) ? DEC(h, v + 2) : x)),
          steps: [`الفروق تتناوب: −${DEC(h, p)} ، −${DEC(h, q)} ، −${DEC(h, p)} ، ...`, `آخر فرق كان −${DEC(h, q)} ، فالتالي −${DEC(h, p)}.`, `${DEC(h, s[5])} − ${DEC(h, p)} = ${DEC(h, v)}.`], explanation: DEC(h, v) };
      } },
      grow: { title: "أعداد في دائرة بفروق متزايدة", from: 1080, to: 1130, gen(R, h) {
        const A = h.A, a = R.int(1, 9), d = R.int(1, 4), n = 8, s = [a]; for (let i = 1; i < n; i++) s.push(s[i - 1] + d + i - 1); const miss = R.int(4, 6), v = s[miss];
        return { style: "g", sig: `${a}:${d}:${miss}`, body: `أعداد مرتبة في دائرة باتجاه عقارب الساعة: ${s.map((x, i) => i === miss ? "س" : A(x)).join(" ، ")}. أوجد قيمة س`, ...h.numOptions(R, h.d(v), [h.d(v + 1), h.d(v - 2), h.d(s[miss - 1] + (s[miss - 1] - s[miss - 2]))]),
          steps: [`الفروق: +${A(d)} ، +${A(d + 1)} ، +${A(d + 2)} ، ... (تزيد واحدًا).`, `س = ${A(s[miss - 1])} + ${A(d + miss - 1)} = ${A(v)}.`, `تحقق: ${A(v)} + ${A(d + miss)} = ${A(s[miss + 1])}.`], explanation: A(v) };
      } },
      fibLike: { title: "كل حد مجموع الحدين قبله", from: 1120, to: 1210, gen(R, h) {
        const A = h.A, a = R.int(1, 5), b = R.pick([a, a + 1, 2 * a]), s = [a, b]; for (let i = 2; i < 8; i++) s.push(s[i - 1] + s[i - 2]); const miss = R.int(5, 6), v = s[miss];
        return { style: "f", sig: `${a}:${b}:${miss}`, body: `ما قيمة س في النمط: ${s.map((x, i) => i === miss ? "س" : A(x)).join(" ، ")}؟`, ...h.numOptions(R, h.d(v), [h.d(v + s[0]), h.d(v - 2), h.d(s[miss - 1] * 2)]),
          steps: ["كل حد = مجموع الحدين السابقين له.", `س = ${A(s[miss - 2])} + ${A(s[miss - 1])} = ${A(v)}.`, `تحقق: ${A(s[miss - 1])} + ${A(v)} = ${A(s[miss + 1])}.`], explanation: A(v) };
      } },
      nth: { title: "الحد النوني في المتتابعة الحسابية", from: 1290, to: 1480, gen(R, h) {
        const A = h.A, a = R.int(-10, 30), d = R.pick([-5, -3, -2, 2, 3, 4, 5, 6, 7]), n = R.int(10, 60), v = a + (n - 1) * d, s = [0, 1, 2, 3].map(i => a + i * d);
        return { style: "n" + (d > 0), sig: `${a}:${d}:${n}`, body: `أوجد الحد رقم ${A(n)} في المتتابعة ${s.map(x => S(h, x)).join(" ، ")} ، ....`, ...h.strOptions(R, S(h, v), [S(h, a + n * d), S(h, n * d), S(h, v - a)].map(x => x === S(h, v) ? S(h, v + d) : x)),
          steps: [nth, `الأول = ${S(h, a)} ، والأساس = ${S(h, d)}.`, `الحد = ${S(h, a)} + (${A(n)} − ١) × ${d < 0 ? `(${S(h, d)})` : S(h, d)} = ${S(h, a)} ${d * (n - 1) < 0 ? "−" : "+"} ${A(Math.abs((n - 1) * d))} = ${S(h, v)}.`], explanation: S(h, v) };
      } },
      cmpNth: { title: "المقارنة بين حدين من متتابعتين", from: 1480, to: 1600, gen(R, h) {
        const A = h.A, a1 = R.int(1, 10), d1 = R.int(2, 6), a2 = R.int(50, 150), d2 = R.int(1, 3), n = R.pick([50, 100, 200]), x = a1 + (n - 1) * d1, y = a2 + (n - 1) * d2;
        const s1 = [0, 1, 2, 3].map(i => A(a1 + i * d1)).join(" ، "), s2 = [0, 1, 2].map(i => A(a2 + i * d2)).join(" ، ");
        return { style: "c", sig: `${a1}:${d1}:${a2}:${d2}:${n}`, body: `قارن بين:\nالقيمة الأولى: الحد رقم ${A(n)} في المتتابعة ${s1} ، ....\nالقيمة الثانية: الحد رقم ${A(n)} في المتتابعة ${s2} ، ....`, ...h.cmpAnswer(h.d(x), h.d(y)),
          steps: [nth, `الأولى: ${A(a1)} + ${A(n - 1)} × ${A(d1)} = ${A(x)}.`, `الثانية: ${A(a2)} + ${A(n - 1)} × ${A(d2)} = ${A(y)}. إذن ${x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان"}.`], explanation: x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان" };
      } },
      negPow: { title: "حدود المتتابعة (−١) أس ن", from: 1600, to: 1903, gen(R, h) {
        const A = h.A, n = R.int(1000, 9999999), k = R.pick([1, 1, 2, 3, 5]), v = (n % 2 ? -1 : 1) * k, last = n % 10;
        return { style: "p" + (n % 2), sig: `${n}:${k}`, body: `أوجد الحد رقم ${A(n)} في المتتابعة التي حدها العام ${k === 1 ? "" : A(k) + " × "}(−١) أس ن ، حيث ن عدد طبيعي`,
          ...h.strOptions(R, S(h, v), [S(h, -v), k === 1 ? A(n) : A(k * 2), k === 1 ? `−${A(n)}` : "صفر"]),
          steps: ["(−١) أس زوجي = ١ ، و (−١) أس فردي = −١.", `رقم آحاد ${A(n)} هو ${A(last)} ، فالعدد ${n % 2 ? "فردي" : "زوجي"}.`, `الحد = ${k === 1 ? "" : A(k) + " × "}(${n % 2 ? "−١" : "١"}) = ${S(h, v)}.`], explanation: S(h, v) };
      } },
      findN: { title: "إيجاد رتبة حد معلوم", from: 1290, to: 1480, gen(R, h) {
        const A = h.A, a = R.int(1, 20), d = R.int(2, 7), n = R.int(10, 80), v = a + (n - 1) * d;
        return { style: "f", sig: `${a}:${d}:${n}`, body: `في المتتابعة ${[0, 1, 2, 3].map(i => A(a + i * d)).join(" ، ")} ، .... ما رتبة الحد الذي قيمته ${A(v)}؟`, ...h.numOptions(R, h.d(n), [h.d(n - 1), h.d(n + 1), h.d(Math.round(v / d))]),
          steps: [nth, `${A(v)} = ${A(a)} + (ن − ١) × ${A(d)} ، أي (ن − ١) = ${A(v - a)} ÷ ${A(d)} = ${A(n - 1)}.`, `ن = ${A(n)}.`], explanation: A(n) };
      } }
    }
  };
})();
