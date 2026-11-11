// المحاضرة 46 (جزءان): المعين ومتوازي الأضلاع، وتمرين السلم
(() => {
  const S1 = "الجزء الأول", S2 = "الجزء الثاني";
  const RH = "مساحة المعين = ½ × حاصل ضرب القطرين ، وقطراه متعامدان وينصف كل منهما الآخر ، وأضلاعه متساوية.";
  const PA = "مساحة متوازي الأضلاع = القاعدة × الارتفاع ، ومحيطه = مجموع أطوال أضلاعه.";
  const TR = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  const N = (h, x) => Number.isInteger(x) ? h.A(x) : h.fx(h.d(String(x)));
  window.EXAMS[46] = {
    title: "اختبار محاكي: المعين ومتوازي الأضلاع والأشكال المركبة", minutes: 25,
    blueprint: [["rhArea", 4], ["rhDiag", 4], ["rhPerim", 2], ["rhAngle", 2], ["paArea", 3], ["paCmp", 2], ["paPerim", 2], ["stairs", 3], ["triCmp", 2]],
    skills: {
      rhArea: { title: "مساحة المعين = ½ × القطر × القطر", seg: S1, from: 0, to: 360, gen(R, h) {
        const A = h.A, d1 = R.int(2, 20), d2 = R.int(2, 20), v = d1 * d2 / 2;
        return { style: "a", sig: `${d1}:${d2}`, body: `معين طولا قطريه ${A(d1)} سم و ${A(d2)} سم. أوجد مساحته`, ...h.strOptions(R, `${N(h, v)} سم²`, [`${A(d1 * d2)} سم²`, `${A(2 * (d1 + d2))} سم²`, `${N(h, v + d1)} سم²`]),
          steps: [RH, `المساحة = ½ × ${A(d1)} × ${A(d2)} = ${N(h, v)} سم².`], explanation: `${N(h, v)} سم²` };
      } },
      rhDiag: { title: "إيجاد القطر الآخر للمعين بفيثاغورس", seg: S1, from: 360, to: 720, gen(R, h) {
        const A = h.A, [a, b, c] = R.pick(TR), k = R.pick([1, 2]), [x, y, s] = [a * k, b * k, c * k], ask = R.pick(["diag", "area"]), d1 = 2 * x, d2 = 2 * y;
        return { style: ask, sig: `${x}:${y}:${ask}`, body: `معين طول ضلعه ${A(s)} سم وطول أحد قطريه ${A(d1)} سم. ${ask === "diag" ? "احسب طول القطر الآخر" : "احسب مساحة المعين"}`,
          ...h.numOptions(R, h.d(ask === "diag" ? d2 : d1 * d2 / 2), ask === "diag" ? [h.d(y), h.d(s), h.d(d2 + 2)] : [h.d(d1 * d2), h.d(s * s), h.d(d1 * y)]),
          steps: [`القطران متعامدان وينصف كل منهما الآخر، فنصف القطر المعلوم = ${A(x)}.`, `نصف القطر الآخر = √{${A(s)}² − ${A(x)}²} = ${A(y)} ، فالقطر الآخر = ${A(d2)}.`, ask === "diag" ? `القطر = ${A(d2)} سم.` : `المساحة = ½ × ${A(d1)} × ${A(d2)} = ${A(d1 * d2 / 2)} سم².`], explanation: A(ask === "diag" ? d2 : d1 * d2 / 2) };
      } },
      rhPerim: { title: "محيط المعين", seg: S1, from: 720, to: 900, gen(R, h) {
        const A = h.A, [a, b, c] = R.pick(TR), k = R.pick([1, 2]), [x, y, s] = [a * k, b * k, c * k], mode = R.pick(["diag", "side"]);
        if (mode === "side") return { style: "s", sig: `s${s}`, body: `معين طول ضلعه ${A(s)} سم. فما محيطه؟`, ...h.numOptions(R, h.d(4 * s), [h.d(2 * s), h.d(s * s), h.d(4 * s + 4)]), steps: ["أضلاع المعين الأربعة متساوية.", `المحيط = ٤ × ${A(s)} = ${A(4 * s)} سم.`], explanation: A(4 * s) };
        return { style: "d", sig: `d${x}:${y}`, body: `معين طولا قطريه ${A(2 * x)} سم و ${A(2 * y)} سم. فما محيطه؟`, ...h.numOptions(R, h.d(4 * s), [h.d(2 * (x + y)), h.d(4 * (x + y)), h.d(s)]),
          steps: [`نصفا القطرين ${A(x)} و ${A(y)} ، ومعهما الضلع يكوّنون مثلثًا قائمًا.`, `الضلع = √{${A(x)}² + ${A(y)}²} = ${A(s)}.`, `المحيط = ٤ × ${A(s)} = ${A(4 * s)} سم.`], explanation: A(4 * s) };
      } },
      rhAngle: { title: "زوايا المعين", seg: S1, from: 120, to: 300, gen(R, h) {
        const A = h.A, a = R.int(3, 16) * 10; if (a === 90) return null; const ask = R.pick(["adj", "opp"]), v = ask === "adj" ? 180 - a : a;
        return { style: ask, sig: `${a}:${ask}`, body: `معين قياس إحدى زواياه ${A(a)}°. فما قياس الزاوية ${ask === "adj" ? "المجاورة لها" : "المقابلة لها"}؟`, ...h.strOptions(R, `${A(v)}°`, [`${A(ask === "adj" ? a : 180 - a)}°`, `${A(360 - a)}°`, `${A(90)}°`].map(x => x === `${A(v)}°` ? `${A(v + 10)}°` : x)),
          steps: ["في المعين: كل زاويتين متجاورتين مجموعهما ١٨٠° ، وكل زاويتين متقابلتين متساويتان.", ask === "adj" ? `١٨٠ − ${A(a)} = ${A(v)}°.` : `المقابلة = ${A(a)}°.`], explanation: `${A(v)}°` };
      } },
      paArea: { title: "مساحة متوازي الأضلاع = القاعدة × الارتفاع", seg: S1, from: 940, to: 1300, gen(R, h) {
        const A = h.A, b = R.int(3, 20), ht = R.int(2, 15), slant = ht + R.int(1, 6), mode = R.pick(["area", "height"]);
        if (mode === "height") return { style: "h", sig: `h${b}:${ht}`, body: `متوازي أضلاع مساحته ${A(b * ht)} سم² وطول قاعدته ${A(b)} سم. فما ارتفاعه؟`, ...h.numOptions(R, h.d(ht), [h.d(2 * ht), h.d(b), h.d(ht + 1)]),
          steps: [PA, `الارتفاع = ${A(b * ht)} ÷ ${A(b)} = ${A(ht)} سم.`], explanation: A(ht) };
        return { style: "a", sig: `a${b}:${ht}:${slant}`, body: `متوازي أضلاع طول قاعدته ${A(b)} سم وارتفاعه ${A(ht)} سم وطول ضلعه المائل ${A(slant)} سم. فما مساحته؟`, ...h.numOptions(R, h.d(b * ht), [h.d(b * slant), h.d(b * ht / 2), h.d(2 * (b + slant))]),
          steps: [PA, "نستخدم الارتفاع العمودي لا الضلع المائل.", `المساحة = ${A(b)} × ${A(ht)} = ${A(b * ht)} سم².`], explanation: A(b * ht) };
      } },
      paCmp: { title: "المقارنة بين مستطيل ومتوازي أضلاع", seg: S1, from: 1300, to: 1500, gen(R, h) {
        const A = h.A, b = R.int(3, 12), ht = R.int(2, 9), mode = R.pick(["same", "slant"]);
        if (mode === "same") return { style: "s", sig: `s${b}:${ht}`, body: h.cmpBody(`مستطيل بعداه ${A(b)} و ${A(ht)} ، ومتوازي أضلاع قاعدته ${A(b)} وارتفاعه ${A(ht)}`, "مساحة المستطيل", "مساحة متوازي الأضلاع"), options: h.cmpAnswer(h.d(0), h.d(0)).options, correct: 2,
          steps: [`مساحة المستطيل = ${A(b)} × ${A(ht)} = ${A(b * ht)}.`, `مساحة متوازي الأضلاع = القاعدة × الارتفاع = ${A(b * ht)}.`, "القيمتان متساويتان."], explanation: "القيمتان متساويتان" };
        const sl = ht + R.int(1, 5);
        return { style: "l", sig: `l${b}:${ht}:${sl}`, body: h.cmpBody(`مستطيل بعداه ${A(b)} و ${A(sl)} ، ومتوازي أضلاع ضلعاه ${A(b)} و ${A(sl)} وارتفاعه ${A(ht)}`, "مساحة المستطيل", "مساحة متوازي الأضلاع"), options: h.cmpAnswer(h.d(0), h.d(0)).options, correct: 0,
          steps: [`المستطيل = ${A(b)} × ${A(sl)} = ${A(b * sl)}.`, `متوازي الأضلاع = ${A(b)} × ${A(ht)} = ${A(b * ht)} (الارتفاع أقصر من الضلع المائل).`, "القيمة الأولى أكبر."], explanation: "القيمة الأولى أكبر" };
      } },
      paPerim: { title: "محيط متوازي الأضلاع", seg: S1, from: 1000, to: 1200, gen(R, h) {
        const A = h.A, a = R.int(3, 20), b = R.int(2, 15), P = 2 * (a + b), ask = R.pick(["P", "side"]);
        return { style: ask, sig: `${a}:${b}:${ask}`, body: ask === "P" ? `متوازي أضلاع طولا ضلعين متجاورين فيه ${A(a)} سم و ${A(b)} سم. فما محيطه؟` : `متوازي أضلاع محيطه ${A(P)} سم وطول أحد أضلاعه ${A(a)} سم. فما طول الضلع المجاور له؟`,
          ...h.numOptions(R, h.d(ask === "P" ? P : b), ask === "P" ? [h.d(a + b), h.d(a * b), h.d(P + 2)] : [h.d(P - a), h.d(P / 2), h.d(b + 2)]),
          steps: ["كل ضلعين متقابلين متساويان، فالمحيط = ٢ × (مجموع ضلعين متجاورين).", ask === "P" ? `= ٢ × (${A(a)} + ${A(b)}) = ${A(P)} سم.` : `${A(P)} ÷ ٢ = ${A(P / 2)} ، والضلع = ${A(P / 2)} − ${A(a)} = ${A(b)} سم.`], explanation: A(ask === "P" ? P : b) };
      } },
      stairs: { title: "تمرين السلم: محيط الشكل الدرجي = ٢ × (الطول + الارتفاع)", seg: S2, from: 0, to: 100, gen(R, h) {
        const A = h.A, n = R.int(3, 6), steps = Array.from({ length: n }, () => R.int(1, 4)), rises = Array.from({ length: n }, () => R.int(1, 3)), W = steps.reduce((a, b) => a + b), H = rises.reduce((a, b) => a + b), v = 2 * (W + H);
        return { style: "s" + n, sig: `${steps.join("")}:${rises.join("")}`, body: `شكل على هيئة سلم من ${A(n)} درجات، أطوال الدرجات الأفقية ${steps.map(A).join(" ، ")} وارتفاعات الدرجات ${rises.map(A).join(" ، ")} (بالسنتيمتر). أوجد محيط الشكل`,
          ...h.numOptions(R, h.d(v), [h.d(W + H), h.d(v + 2), h.d(W * H)]),
          steps: ["محيط شكل السلم = ٢ × (مجموع الدرجات الأفقية + مجموع الارتفاعات) ، لأن كل الأجزاء الأفقية تساوي القاعدة والرأسية تساوي الارتفاع الكلي.", `الطول الكلي = ${A(W)} ، والارتفاع الكلي = ${A(H)}.`, `المحيط = ٢ × (${A(W)} + ${A(H)}) = ${A(v)} سم.`], explanation: A(v) };
      } },
      triCmp: { title: "قاعدة مثلث من مساحته وارتفاعه", seg: S2, from: 240, to: 330, gen(R, h) {
        const A = h.A, b = R.int(3, 20), ht = R.int(2, 16), S = b * ht / 2, w = b + R.pick([-1, 0, 1]); if (!Number.isInteger(S)) return null;
        return { style: "t", sig: `${b}:${ht}:${w}`, body: h.cmpBody(`مثلث مساحته ${A(S)} سم وارتفاعه ${A(ht)} سم`, "طول القاعدة", A(w)), ...h.cmpAnswer(h.d(b), h.d(w)),
          steps: ["٢ × المساحة = القاعدة × الارتفاع.", `القاعدة = ${A(2 * S)} ÷ ${A(ht)} = ${A(b)}.`, `إذن ${rel(b, w)}.`], explanation: rel(b, w) };
      } }
    }
  };
})();
