// المحاضرة 47: المساحات المظللة
(() => {
  const RULE = "المربع المرسوم من منتصفات أضلاع مربع = ½ مساحته ، والمثلث المرسوم من منتصفات أضلاع مثلث متطابق الأضلاع = ¼ مساحته ، والمساحة المظللة = طرح أو جمع مساحات أشكال معروفة.";
  const N = (h, x) => Number.isInteger(x) ? h.A(x) : h.fx(h.d(String(+x.toFixed(2))));
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  window.EXAMS[47] = {
    title: "اختبار محاكي: المساحات المظللة", minutes: 25,
    blueprint: [["midSq", 4], ["midTri", 3], ["subtract", 4], ["twoTri", 3], ["grid", 3], ["cmp", 3], ["triRect", 4]],
    skills: {
      midSq: { title: "مربعات متداخلة من منتصفات الأضلاع", from: 0, to: 250, gen(R, h) {
        const A = h.A, k = R.int(1, 3), small = R.int(1, 6), ask = R.pick(["big", "small"]), sArea = small * small, big = sArea * 2 ** k;
        return { style: ask + k, sig: `${k}:${small}:${ask}`, body: `في الشكل ${A(k + 1)} مربعات متداخلة، كل مربع مرسوم من منتصفات أضلاع المربع الأكبر منه. ${ask === "big" ? `إذا كان طول ضلع أصغر مربع ${A(small)} ، فاحسب مساحة أكبر مربع` : `إذا كانت مساحة أكبر مربع ${A(big)} ، فاحسب مساحة أصغر مربع`}`,
          ...h.numOptions(R, h.d(ask === "big" ? big : sArea), ask === "big" ? [h.d(sArea * 2 * k), h.d(big * 2), h.d(sArea * 4 ** k)] : [h.d(big / 2), h.d(big / (2 * k + 1) | 0 || sArea + 1), h.d(sArea * 2)]),
          steps: [RULE, `كل مربع = ضعف مساحة المربع الذي بداخله، وعندنا ${A(k)} ${k === 1 ? "انتقال" : "انتقالات"}.`, ask === "big" ? `أصغر مربع = ${A(sArea)} ، والأكبر = ${A(sArea)} × ${A(2 ** k)} = ${A(big)}.` : `الأصغر = ${A(big)} ÷ ${A(2 ** k)} = ${A(sArea)}.`], explanation: A(ask === "big" ? big : sArea) };
      } },
      midTri: { title: "مثلث متطابق الأضلاع مقسم من منتصفات أضلاعه", from: 250, to: 450, gen(R, h) {
        const A = h.A, T = R.int(2, 16) * 16, lvl = R.int(1, 2), shaded = R.pick([1, 3]), one = T / 4 ** lvl, v = lvl === 1 ? one * shaded : one * shaded * 3;
        const desc = lvl === 1 ? `ظُلّل ${shaded === 1 ? "المثلث الأوسط" : "المثلثات الثلاثة الطرفية"}` : `ثم قُسم كل مثلث طرفي بالطريقة نفسها وظُلّل ${shaded === 1 ? "المثلث الأوسط" : "ثلاثة مثلثات طرفية"} في كل منها`;
        return { style: "t" + lvl + shaded, sig: `${T}:${lvl}:${shaded}`, body: `مثلث متطابق الأضلاع مساحته ${A(T)} ، رُسم داخله مثلث من منتصفات أضلاعه فانقسم إلى ٤ مثلثات متطابقة${lvl === 2 ? "" : "، و"}${desc}. احسب مساحة المظلل`,
          ...h.numOptions(R, h.d(v), [h.d(T / 2), h.d(T / 4), h.d(v * 2)]),
          steps: [RULE, `كل مثلث صغير = ${A(T)} ÷ ٤ = ${A(T / 4)}.`, lvl === 2 ? `في المستوى الثاني كل مثلث = ${A(T / 4)} ÷ ٤ = ${A(one)} ، والمظلل = ${A(shaded * 3)} × ${A(one)} = ${A(v)}.` : `المظلل = ${A(shaded)} × ${A(one)} = ${A(v)}.`], explanation: A(v) };
      } },
      subtract: { title: "المساحة المظللة = الكبرى − غير المظللة", from: 450, to: 900, gen(R, h) {
        const A = h.A, L = R.int(6, 20), W = R.int(4, L), s = R.int(1, Math.min(L, W) - 2), mode = R.pick(["sq", "circleSq"]);
        if (mode === "sq") { const v = L * W - s * s;
          return { style: "s", sig: `s${L}:${W}:${s}`, body: `مستطيل بعداه ${A(L)} سم و ${A(W)} سم ، قُصّ من داخله مربع طول ضلعه ${A(s)} سم. ما مساحة الجزء المتبقي (المظلل)؟`, ...h.numOptions(R, h.d(v), [h.d(L * W), h.d(L * W - 4 * s), h.d(s * s)]),
            steps: [RULE, `مساحة المستطيل = ${A(L * W)} ، ومساحة المربع = ${A(s * s)}.`, `المظلل = ${A(L * W)} − ${A(s * s)} = ${A(v)} سم².`], explanation: A(v) }; }
        const k = R.int(2, 3), side = 2 * s, v = side * side - s * s * k;
        if (v <= 0) return null;
        return { style: "m", sig: `m${s}:${k}`, body: `مربع كبير طول ضلعه ${A(side)} سم ، بداخله ${A(k)} مربعات صغيرة غير مظللة طول ضلع كل منها ${A(s)} سم. ما مساحة الجزء المظلل؟`, ...h.numOptions(R, h.d(v), [h.d(side * side), h.d(s * s * k), h.d(v + s)]),
          steps: [`مساحة الكبير = ${A(side)}² = ${A(side * side)}.`, `غير المظلل = ${A(k)} × ${A(s * s)} = ${A(k * s * s)}.`, `المظلل = ${A(v)} سم².`], explanation: A(v) };
      } },
      twoTri: { title: "مستطيل منه مثلثان غير مظللين", from: 900, to: 1050, gen(R, h) {
        const A = h.A, b = R.int(4, 14), H = R.int(4, 12), t = R.int(1, H - 1), t2 = H - t, top = R.int(1, b - 1), v = b * H - b * t / 2 - b * t2 / 2;
        return { style: "t", sig: `${b}:${H}:${t}`, body: `مستطيل طوله ${A(b)} سم وارتفاعه ${A(H)} سم ، رُسم فيه مثلثان غير مظللين: قاعدة الأول الضلع العلوي وارتفاعه ${A(t)} سم ، وقاعدة الثاني الضلع السفلي وارتفاعه ${A(t2)} سم ، ورأساهما يلتقيان في نقطة واحدة. ما مساحة المظلل؟`,
          ...h.numOptions(R, h.d(v), [h.d(b * H), h.d(b * H - b * t), h.d(v / 2)]),
          steps: [`مساحة المستطيل = ${A(b)} × ${A(H)} = ${A(b * H)}.`, `المثلثان = ½ × ${A(b)} × ${A(t)} + ½ × ${A(b)} × ${A(t2)} = ½ × ${A(b)} × ${A(H)} = ${N(h, b * H / 2)}.`, `المظلل = ${A(b * H)} − ${N(h, b * H / 2)} = ${N(h, v)} (أي نصف المستطيل دائمًا).`], explanation: N(h, v) };
      } },
      grid: { title: "شكل مقسم إلى مثلثات متطابقة", from: 1050, to: 1310, gen(R, h) {
        const A = h.A, c = R.int(2, 4), r = R.int(1, 3), s = R.int(1, 4), n = 2 * c * r, k = R.int(1, n - 1), cell = s * s, tri = cell / 2, v = k * tri;
        return { style: "g", sig: `${c}:${r}:${s}:${k}`, body: `مستطيل مقسم إلى ${A(c * r)} مربعات متطابقة طول ضلع كل منها ${A(s)} سم ، وكل مربع مقسوم بقطره إلى مثلثين متطابقين، فأصبح فيه ${A(n)} مثلثًا. إذا ظُلّل ${A(k)} ${k <= 10 ? "مثلثات" : "مثلثًا"} منها، فما المساحة المظللة؟`,
          ...h.strOptions(R, `${N(h, v)} سم²`, [`${A(k * cell)} سم²`, `${N(h, v + tri)} سم²`, `${A(k)} سم²` === `${N(h, v)} سم²` ? `${N(h, v * 3)} سم²` : `${A(k)} سم²`]),
          steps: [`مساحة المربع الصغير = ${A(s)}² = ${A(cell)} ، والمثلث نصفه = ${N(h, tri)}.`, `المظلل = ${A(k)} × ${N(h, tri)} = ${N(h, v)} سم².`], explanation: `${N(h, v)} سم²` };
      } },
      cmp: { title: "المقارنة بين المساحة المظللة وعدد", from: 1050, to: 1310, gen(R, h) {
        const A = h.A, s = R.int(2, 8), k = R.pick([1, 2, 3]), v = k * s * s / 2, w = v + R.pick([-1, 0, 1, 2]);
        return { style: "c", sig: `${s}:${k}:${w}`, body: h.cmpBody(`مربع طول ضلعه ${A(2 * s)} سم مقسم إلى ٤ مربعات متساوية، وظُلّل ${k === 1 ? "مثلث هو نصف أحدها" : `${A(k)} مثلثات كل منها نصف مربع صغير`}`, "مساحة المظلل", `${A(w)} سم²`), ...h.cmpAnswer(h.d(String(v)), h.d(w)),
          steps: [`المربع الصغير = ${A(s)}² = ${A(s * s)} ، والمثلث = ${N(h, s * s / 2)}.`, `المظلل = ${A(k)} × ${N(h, s * s / 2)} = ${N(h, v)}.`, `إذن ${rel(v, w)}.`], explanation: rel(v, w) };
      } },
      triRect: { title: "مثلث رسم داخل مستطيل قاعدته ضلع المستطيل", from: 1310, to: 2023, gen(R, h) {
        const A = h.A, L = R.int(4, 20), W = R.int(2, 14), ask = R.pick(["tri", "rest"]), tri = L * W / 2;
        return { style: ask, sig: `${L}:${W}:${ask}`, body: `مستطيل بعداه ${A(L)} سم و ${A(W)} سم ، رُسم داخله مثلث قاعدته أحد ضلعي الطول ورأسه على الضلع المقابل. ${ask === "tri" ? "فما مساحة المثلث؟" : "فما مساحة الجزء من المستطيل خارج المثلث؟"}`,
          ...h.strOptions(R, `${N(h, tri)} سم²`, [`${A(L * W)} سم²`, `${N(h, tri / 2)} سم²`, `${A(L + W)} سم²` === `${N(h, tri)} سم²` ? `${N(h, tri + 2)} سم²` : `${A(L + W)} سم²`]),
          steps: ["قاعدة المثلث = طول المستطيل، وارتفاعه = عرض المستطيل.", `مساحة المثلث = ½ × ${A(L)} × ${A(W)} = ${N(h, tri)} = نصف المستطيل.`, ask === "rest" ? `الباقي = ${A(L * W)} − ${N(h, tri)} = ${N(h, tri)}.` : `الجواب ${N(h, tri)}.`], explanation: `${N(h, tri)} سم²` };
      } }
    }
  };
})();
