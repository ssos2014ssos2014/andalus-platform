// المحاضرة 39: المضلعات (مجموع الزوايا الداخلية والخارجية، المضلع المنتظم، الرباعيات والمعين)
(() => {
  const D = (h, x) => `${Number.isInteger(x) ? h.A(x) : h.fx(h.d(String(+x.toFixed(2))))}°`;
  const NAME = { 3: "مثلث", 4: "رباعي", 5: "خماسي", 6: "سداسي", 7: "سباعي", 8: "ثماني", 9: "تساعي", 10: "عشاري", 12: "اثنا عشري" };
  const nm = (h, n) => NAME[n] ? `مضلع ${NAME[n]}` : `مضلع عدد أضلاعه ${h.A(n)}`;
  const LAW = "مجموع الزوايا الداخلية لمضلع عدد أضلاعه ن = (ن − ٢) × ١٨٠° ، ومجموع زواياه الخارجية = ٣٦٠° دائمًا.";
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  window.EXAMS[39] = {
    title: "اختبار محاكي: المضلعات وزواياها", minutes: 25,
    blueprint: [["sum", 3], ["regIn", 3], ["regEx", 3], ["quad", 3], ["pent", 2], ["hexLine", 2], ["rhombus", 3], ["cmp", 2], ["findN", 3]],
    skills: {
      sum: { title: "مجموع الزوايا الداخلية للمضلع", from: 0, to: 360, gen(R, h) {
        const n = R.int(4, 30), v = (n - 2) * 180;
        return { style: "s", sig: `${n}`, body: `ما مجموع قياسات الزوايا الداخلية لـ${nm(h, n)}؟`, ...h.strOptions(R, D(h, v), [D(h, n * 180), D(h, (n - 1) * 180), D(h, 360)].map(x => x === D(h, v) ? D(h, v + 180) : x)),
          steps: [LAW, `= (${h.A(n)} − ٢) × ١٨٠ = ${h.A(n - 2)} × ١٨٠ = ${D(h, v)}.`], explanation: D(h, v) };
      } },
      regIn: { title: "قياس الزاوية الداخلية للمضلع المنتظم", from: 0, to: 600, gen(R, h) {
        const n = R.pick([4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]), v = (n - 2) * 180 / n;
        return { style: "r", sig: `${n}`, body: `ما قياس الزاوية الداخلية لـ${nm(h, n)} منتظم؟`, ...h.strOptions(R, D(h, v), [D(h, 360 / n), D(h, 180 - 360 / n + 10), D(h, (n - 2) * 180)].map(x => x === D(h, v) ? D(h, v - 10) : x)),
          steps: [`مجموع الزوايا = (${h.A(n)} − ٢) × ١٨٠ = ${h.A((n - 2) * 180)}°.`, `الزاوية = ${h.A((n - 2) * 180)} ÷ ${h.A(n)} = ${D(h, v)}.`, `أو: ١٨٠ − الزاوية الخارجية (${D(h, 360 / n)}) = ${D(h, v)}.`], explanation: D(h, v) };
      } },
      regEx: { title: "الزاوية الخارجية للمضلع المنتظم = ٣٦٠ ÷ ن", from: 600, to: 1200, gen(R, h) {
        const n = R.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 36]), v = 360 / n, rev = R.next() < .4;
        if (rev) return { style: "n", sig: `n${n}`, body: `مضلع منتظم قياس زاويته الخارجية ${D(h, v)} ، فكم عدد أضلاعه؟`, ...h.numOptions(R, h.d(n), [h.d(n + 2), h.d(Math.round(180 / v) || n - 1), h.d(n - 1)]),
          steps: ["الزاوية الخارجية للمنتظم = ⟦٣٦٠/ن⟧.", `ن = ٣٦٠ ÷ ${h.A(v)} = ${h.A(n)} أضلاع.`], explanation: h.A(n) };
        return { style: "e", sig: `e${n}`, body: `الشكل ${NAME[n] ? NAME[n] : "مضلع"} منتظم${NAME[n] ? "" : ` عدد أضلاعه ${h.A(n)}`}، مُدّ أحد أضلاعه فتكوّنت زاوية خارجية س. أوجد قيمة س`, ...h.strOptions(R, D(h, v), [D(h, 180 - v), D(h, 180 / n), D(h, v + 10)]),
          steps: ["مجموع الزوايا الخارجية لأي مضلع ٣٦٠°.", `في المنتظم: س = ٣٦٠ ÷ ${h.A(n)} = ${D(h, v)}.`], explanation: D(h, v) };
      } },
      quad: { title: "زوايا الشكل الرباعي (مجموعها ٣٦٠°)", from: 540, to: 720, gen(R, h) {
        const A = h.A, a = R.int(6, 14) * 10, b = R.int(6, 14) * 10 - 5, rest = 360 - a - b, mode = R.pick(["equal", "sum"]); if (rest <= 20) return null;
        if (mode === "equal") { if (rest % 2) return null; const x = rest / 2;
          return { style: "e", sig: `e${a}:${b}`, body: `شكل رباعي قياس زاويتين فيه ${D(h, a)} و ${D(h, b)} ، والزاويتان الأخريان متساويتان قياس كل منهما س. أوجد قيمة س`, ...h.strOptions(R, D(h, x), [D(h, rest), D(h, (180 - a - b + 360) / 2 | 0), D(h, x + 10)].map(z => z === D(h, x) ? D(h, x - 10) : z)),
            steps: ["مجموع زوايا الشكل الرباعي = (٤ − ٢) × ١٨٠ = ٣٦٠°.", `س + س = ٣٦٠ − ${A(a)} − ${A(b)} = ${A(rest)}.`, `س = ${D(h, x)}.`], explanation: D(h, x) }; }
        return { style: "s", sig: `s${a}:${b}`, body: `شكل رباعي قياس زاويتين فيه ${D(h, a)} و ${D(h, b)} ، والزاويتان الأخريان س و ص. أوجد س + ص`, ...h.strOptions(R, D(h, rest), [D(h, 180 - (a + b - 180)), D(h, rest / 2), D(h, rest + 10)].map(z => z === D(h, rest) ? D(h, rest + 20) : z)),
          steps: ["مجموع زوايا الرباعي ٣٦٠°.", `س + ص = ٣٦٠ − ${A(a)} − ${A(b)} = ${D(h, rest)}.`], explanation: D(h, rest) };
      } },
      pent: { title: "مضلع فيه زوايا قائمة وزوايا متساوية", from: 720, to: 840, gen(R, h) {
        const A = h.A, n = R.pick([5, 6]), r = R.int(1, n - 2), k = n - r, S = (n - 2) * 180, x = (S - 90 * r) / k; if (!Number.isInteger(x) || x >= 180) return null;
        return { style: "p" + n, sig: `${n}:${r}`, body: `شكل ${NAME[n]} فيه ${A(r)} ${r === 1 ? "زاوية قائمة" : r === 2 ? "زاويتان قائمتان" : "زوايا قائمة"}، وبقية زواياه متساوية قياس كل منها س. أوجد قيمة س`,
          ...h.strOptions(R, D(h, x), [D(h, (360 - 90 * r) / k | 0 || x + 10), D(h, S / n), D(h, x + 15)].map(z => z === D(h, x) ? D(h, x - 15) : z)),
          steps: [`مجموع زوايا ال${NAME[n]} = (${A(n)} − ٢) × ١٨٠ = ${A(S)}°.`, `${A(k)}س = ${A(S)} − ${A(r)} × ٩٠ = ${A(S - 90 * r)}.`, `س = ${D(h, x)}.`], explanation: D(h, x) };
      } },
      hexLine: { title: "مضلع منتظم يرتكز على مستقيم", from: 1140, to: 1380, gen(R, h) {
        const n = R.pick([5, 6, 8, 10, 12]), ex = 360 / n, both = R.next() < .5, v = both ? 2 * ex : ex;
        return { style: "h" + both, sig: `${n}:${both}`, body: `${nm(h, n)} منتظم يرتكز أحد أضلاعه على مستقيم، ومُدّ ذلك الضلع من طرفيه فتكوّنت زاويتان خارجيتان س و ص. أوجد ${both ? "س + ص" : "قيمة س"}`,
          ...h.strOptions(R, D(h, v), [D(h, 180 - ex), D(h, both ? 360 - 2 * ex : 2 * ex), D(h, v + 10)].map(z => z === D(h, v) ? D(h, v + 20) : z)),
          steps: [`الزاوية الداخلية = ١٨٠ − ⟦٣٦٠/${h.A(n)}⟧ = ${D(h, 180 - ex)}.`, `كل زاوية خارجية = ١٨٠ − ${h.A(180 - ex)} = ${D(h, ex)}.`, both ? `س + ص = ${D(h, v)}.` : `س = ${D(h, v)}.`], explanation: D(h, v) };
      } },
      rhombus: { title: "زوايا متوازي الأضلاع والمعين", from: 480, to: 2397, gen(R, h) {
        const A = h.A, p = R.int(1, 7), q = R.int(p + 1, 9), x = 180 / (p + q); if (!Number.isInteger(x)) return null; const ask = R.pick(["big", "small", "opp"]);
        const big = q * x, small = p * x, v = ask === "small" ? small : big;
        return { style: ask, sig: `${p}:${q}:${ask}`, body: `${R.pick(["معين", "متوازي أضلاع"])} قياس زاويتين متجاورتين فيه ${A(p)}س و ${A(q)}س. أوجد قياس ${ask === "small" ? "الزاوية الحادة" : ask === "big" ? "الزاوية المنفرجة" : "الزاوية المقابلة للزاوية " + A(q) + "س"}`,
          ...h.strOptions(R, D(h, v), [D(h, ask === "small" ? big : small), D(h, x), D(h, 360 / (p + q))].map(z => z === D(h, v) ? D(h, v + 10) : z)),
          steps: ["في متوازي الأضلاع والمعين: كل زاويتين متجاورتين مجموعهما ١٨٠° ، وكل زاويتين متقابلتين متساويتان.", `${A(p)}س + ${A(q)}س = ١٨٠ ، أي س = ${A(x)}.`, `الزاوية المطلوبة = ${D(h, v)}.`], explanation: D(h, v) };
      } },
      cmp: { title: "المقارنة بمجموع زوايا مضلع", from: 1500, to: 1680, gen(R, h) {
        const n = R.pick([5, 6, 7, 8, 9]), S = (n - 2) * 180, w = S + R.pick([-60, 0, 60, -180]), ext = R.next() < .3;
        const x = ext ? 360 : S;
        return { style: "c" + ext, sig: `${n}:${w}:${ext}`, body: h.cmpBody(`إذا كان الشكل الذي أمامك ${NAME[n]}`, `مجموع زوايا الشكل ${ext ? "الخارجية" : "الداخلية"}`, D(h, w)), ...h.cmpAnswer(h.d(x), h.d(w)),
          steps: [ext ? "مجموع الزوايا الخارجية لأي مضلع = ٣٦٠°." : `مجموع الزوايا الداخلية = (${h.A(n)} − ٢) × ١٨٠ = ${h.A(S)}°.`, "ملاحظة: إذا لم يُذكر نوع الزوايا نعتبرها داخلية.", `إذن ${rel(x, w)}.`], explanation: rel(x, w) };
      } },
      findN: { title: "إيجاد عدد الأضلاع", from: 0, to: 1200, gen(R, h) {
        const n = R.pick([5, 6, 7, 8, 9, 10, 12, 15, 20]), mode = R.pick(["sum", "interior"]), S = (n - 2) * 180, I = S / n;
        if (mode === "interior" && !Number.isInteger(I)) return null;
        return { style: mode, sig: `${mode}${n}`, body: mode === "sum" ? `مضلع مجموع زواياه الداخلية ${D(h, S)} ، فكم عدد أضلاعه؟` : `مضلع منتظم قياس زاويته الداخلية ${D(h, I)} ، فكم عدد أضلاعه؟`,
          ...h.numOptions(R, h.d(n), [h.d(n - 2), h.d(n + 1), h.d(n + 2)]),
          steps: mode === "sum" ? [`(ن − ٢) × ١٨٠ = ${h.A(S)}.`, `ن − ٢ = ${h.A(S)} ÷ ١٨٠ = ${h.A(n - 2)} ، إذن ن = ${h.A(n)}.`] : [`الزاوية الخارجية = ١٨٠ − ${h.A(I)} = ${h.A(180 - I)}°.`, `ن = ٣٦٠ ÷ ${h.A(180 - I)} = ${h.A(n)}.`], explanation: h.A(n) };
      } }
    }
  };
})();
