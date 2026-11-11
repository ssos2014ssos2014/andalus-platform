// المحاضرة 49: علاقات الدوائر والمساحات المظللة فيها
(() => {
  const P = (h, k) => k === 1 ? "ط" : `${Number.isInteger(k) ? h.A(k) : h.fx(h.d(String(k)))} ط`;
  const PM = (h, k, c) => `${P(h, k)} − ${h.A(c)}`;
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  const TR = [[6, 8, 10], [3, 4, 5], [5, 12, 13], [9, 12, 15], [8, 15, 17]];
  window.EXAMS[49] = {
    title: "اختبار محاكي: علاقات الدوائر والمساحات المظللة", minutes: 25,
    blueprint: [["inner", 3], ["ratio", 3], ["twoIn", 3], ["seg", 3], ["maxP", 2], ["quarter", 3], ["mult", 3], ["growC", 2], ["ring", 2]],
    skills: {
      inner: { title: "دائرة صغيرة قطرها نصف قطر الكبيرة", from: 0, to: 220, gen(R, h) {
        const A = h.A, r = R.int(1, 8), Rr = 2 * r, ask = R.pick(["shade", "big"]), v = ask === "shade" ? 3 * r * r : 4 * r * r;
        return { style: ask, sig: `${r}:${ask}`, body: ask === "shade" ? `دائرتان، قطر الصغرى يساوي نصف قطر الكبرى ويمر بمركزها، ونصف قطر الصغرى ${A(r)}. احسب مساحة الجزء المظلل داخل الكبرى وخارج الصغرى` : `دائرتان، قطر الصغرى يساوي نصف قطر الكبرى، ومساحة الصغرى ${P(h, r * r)}. احسب مساحة الكبرى`,
          ...h.strOptions(R, P(h, v), [P(h, ask === "shade" ? 4 * r * r : 2 * r * r), P(h, ask === "shade" ? r * r : 8 * r * r), P(h, v + r)]),
          steps: ["ملاحظة: مساحة الدائرة الكبرى = ٤ × مساحة الصغرى (لأن نصف قطرها ضعف نصف قطر الصغرى).", `الصغرى = ${P(h, r * r)} ، والكبرى (نق = ${A(Rr)}) = ${P(h, 4 * r * r)}.`, ask === "shade" ? `المظلل = ${P(h, 4 * r * r)} − ${P(h, r * r)} = ${P(h, v)}.` : `الكبرى = ${P(h, v)}.`], explanation: P(h, v) };
      } },
      ratio: { title: "النسبة بين مساحتي دائرتين = مربع النسبة بين نصفي قطريهما", from: 220, to: 420, gen(R, h) {
        const A = h.A, a = R.int(1, 5), b = R.int(a + 1, 8); if (a === b) return null; const ans = `${A(a * a)} : ${A(b * b)}`;
        const mode = R.pick(["radii", "area"]);
        return { style: mode, sig: `${a}:${b}:${mode}`, body: mode === "radii" ? `دائرتان م و ن نصفا قطريهما ${A(a)} و ${A(b)}. أوجد النسبة بين مساحة م إلى مساحة ن` : `إذا كانت مساحة الدائرة الصغرى ${P(h, a * a * 4)} ونصف قطر الكبرى ${A(2 * b)} ، فأوجد النسبة بين مساحة الصغرى إلى الكبرى`,
          ...h.strOptions(R, ans, [`${A(a)} : ${A(b)}`, `${A(b * b)} : ${A(a * a)}`, `${A(2 * a)} : ${A(2 * b)}` === `${A(a)} : ${A(b)}` ? `${A(a)} : ${A(b * b)}` : `${A(a * a)} : ${A(b)}`]),
          steps: mode === "radii" ? [`المساحتان ${P(h, a * a)} و ${P(h, b * b)}.`, `النسبة = ${ans} (مربع نسبة نصفي القطرين).`] : [`نق الصغرى = ${A(2 * a)} ، ونق الكبرى = ${A(2 * b)}.`, `النسبة = ${A(2 * a)}² : ${A(2 * b)}² = ${ans}.`], explanation: ans };
      } },
      twoIn: { title: "دائرتان داخل دائرة على قطرها", from: 420, to: 600, gen(R, h) {
        const A = h.A, r1 = R.int(1, 6), r2 = R.int(1, 6), Rr = r1 + r2, v = Rr * Rr - r1 * r1 - r2 * r2;
        return { style: "t", sig: `${r1}:${r2}`, body: `دائرتان متماستان نصفا قطريهما ${A(r1)} و ${A(r2)} ، تقعان على قطر دائرة كبيرة وتمس كل منهما الكبيرة من الداخل. أوجد مساحة الجزء المظلل داخل الكبيرة وخارج الدائرتين`,
          ...h.strOptions(R, P(h, v), [P(h, Rr * Rr), P(h, r1 * r1 + r2 * r2), P(h, v + 2)].map(x => x === P(h, v) ? P(h, v + 4) : x)),
          steps: [`قطر الكبيرة = ${A(2 * r1)} + ${A(2 * r2)} = ${A(2 * Rr)} ، فنصف قطرها ${A(Rr)}.`, `المظلل = ${P(h, Rr * Rr)} − ${P(h, r1 * r1)} − ${P(h, r2 * r2)} = ${P(h, v)}.`], explanation: P(h, v) };
      } },
      seg: { title: "أطوال قطع مستقيمة متداخلة", from: 600, to: 900, gen(R, h) {
        const A = h.A, AB = R.int(12, 40), AN = R.int(Math.ceil(AB / 2) + 1, AB - 2), BM = R.int(AB - AN + 1, AB - 2), v = AN + BM - AB; if (v <= 0) return null;
        return { style: "s", sig: `${AB}:${AN}:${BM}`, body: `النقاط أ ، م ، ن ، ب على مستقيم واحد بهذا الترتيب. إذا كان أ ب = ${A(AB)} ، أ ن = ${A(AN)} ، ب م = ${A(BM)} ، فأوجد طول م ن`, ...h.numOptions(R, h.d(v), [h.d(AB - AN), h.d(AB - BM), h.d(v + 2)]),
          steps: ["الجزء م ن محسوب في أ ن وفي ب م معًا.", `م ن = أ ن + ب م − أ ب = ${A(AN)} + ${A(BM)} − ${A(AB)} = ${A(v)}.`], explanation: A(v) };
      } },
      maxP: { title: "أي الأشكال أكبر محيطًا", from: 1350, to: 1420, gen(R, h) {
        const A = h.A, r = R.int(2, 6), l = R.int(5, 15), w = R.int(2, l), t = R.int(4, 12), s = R.int(4, 12);
        const shapes = [[`دائرة نصف قطرها ${A(r)} سم`, 2 * Math.PI * r], [`مستطيل بعداه ${A(l)} و ${A(w)} سم`, 2 * (l + w)], [`مثلث متطابق الأضلاع طول ضلعه ${A(t)} سم`, 3 * t], [`مربع طول ضلعه ${A(s)} سم`, 4 * s]];
        const vals = shapes.map(x => x[1]).sort((a, b) => b - a); if (vals[0] - vals[1] < 1.5) return null; const best = shapes.find(x => x[1] === vals[0]);
        return { style: "m", sig: `${r}:${l}:${w}:${t}:${s}`, body: "أي الأشكال الآتية أكبر محيطًا؟", ...h.strOptions(R, best[0], shapes.filter(x => x !== best).map(x => x[0])),
          steps: shapes.map(([n, v]) => `${n}: المحيط ≈ ${h.fx(h.d(v.toFixed(1)))}`).concat([`الأكبر: ${best[0]}.`]), explanation: best[0] };
      } },
      quarter: { title: "مستطيل داخل ربع دائرة", from: 1420, to: 1700, gen(R, h) {
        const A = h.A, [a, b, c] = R.pick(TR), num = c * c / 4, ans = PM(h, num, a * b);
        return { style: "q", sig: `${a}:${b}`, body: `ربع دائرة مركزها رأس مستطيل بعداه ${A(a)} و ${A(b)} ، والرأس المقابل للمستطيل يقع على قوس ربع الدائرة. أوجد مساحة الجزء المظلل من ربع الدائرة خارج المستطيل`,
          ...h.strOptions(R, ans, [PM(h, c * c, a * b), `${P(h, num)} + ${A(a * b)}`, PM(h, num, (a * b) / 2)]),
          steps: [`نصف القطر = قطر المستطيل = √{${A(a)}² + ${A(b)}²} = ${A(c)}.`, `مساحة ربع الدائرة = ¼ × ${A(c * c)} ط = ${P(h, num)}.`, `المظلل = ${P(h, num)} − ${A(a)} × ${A(b)} = ${ans}.`], explanation: ans };
      } },
      mult: { title: "محيط دائرة مضاعف لمحيط أخرى", from: 1800, to: 2100, gen(R, h) {
        const A = h.A, k = R.int(2, 4), r = R.int(1, 6), Rr = k * r, v = Rr * Rr, w = v + R.pick([-r, 0, r]) * 2;
        return { style: "m", sig: `${k}:${r}:${w}`, body: h.cmpBody(`محيط الدائرة م = ${A(k)} أمثال محيط الدائرة ن التي نصف قطرها ${A(r)} سم`, "مساحة الدائرة م", P(h, w)), ...h.cmpAnswer(h.d(v), h.d(w)),
          steps: [`محيط ن = ${P(h, 2 * r)} ، فمحيط م = ${P(h, 2 * Rr)} ، أي نق(م) = ${A(Rr)}.`, `مساحة م = ${P(h, v)}.`, `إذن ${rel(v, w)}.`], explanation: rel(v, w) };
      } },
      growC: { title: "أثر تغيير المحيط على المساحة", from: 1800, to: 3522, gen(R, h) {
        const A = h.A, k = R.int(2, 5), word = n => n === 2 ? "مرتين" : `${A(n)} مرات`;
        return { style: "g" + k, sig: `${k}`, body: `إذا تضاعف محيط دائرة ${word(k)} ، فكم مرة تتضاعف مساحتها؟`, ...h.strOptions(R, word(k * k), [word(k), word(2 * k), word(k * k + 1)]),
          steps: [`المحيط يتناسب مع نصف القطر، فنق يتضاعف ${word(k)}.`, `المساحة تتناسب مع نق² ، فتتضاعف ${A(k)}² = ${word(k * k)}.`], explanation: word(k * k) };
      } },
      ring: { title: "مساحة الحلقة بين دائرتين متحدتي المركز", from: 0, to: 600, gen(R, h) {
        const A = h.A, r = R.int(1, 8), Rr = r + R.int(1, 6), v = Rr * Rr - r * r;
        return { style: "r", sig: `${r}:${Rr}`, body: `دائرتان لهما المركز نفسه، نصفا قطريهما ${A(r)} سم و ${A(Rr)} سم. أوجد مساحة الحلقة المحصورة بينهما`, ...h.strOptions(R, P(h, v), [P(h, (Rr - r) ** 2), P(h, Rr * Rr + r * r), P(h, 2 * (Rr - r))].map(x => x === P(h, v) ? P(h, v + 1) : x)),
          steps: [`مساحة الحلقة = ${P(h, Rr * Rr)} − ${P(h, r * r)} = ${P(h, v)}.`], explanation: P(h, v) };
      } }
    }
  };
})();
