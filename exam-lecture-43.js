// المحاضرة 43: مساحة المثلث ومحيطه، والمثلثات المحصورة بين مستقيمين متوازيين
(() => {
  const AR_ = "مساحة المثلث = ½ × القاعدة × الارتفاع ، ومنه: ٢ × المساحة = القاعدة × الارتفاع.";
  const N = (h, x) => Number.isInteger(x) ? h.A(x) : h.fx(h.d(String(x)));
  const E = (h, p, c) => `${p === 1 ? "" : h.A(p)}س${c ? (c > 0 ? ` + ${h.A(c)}` : ` − ${h.A(-c)}`) : ""}`;
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  window.EXAMS[43] = {
    title: "اختبار محاكي: مساحة المثلث ومحيطه", minutes: 25,
    blueprint: [["area", 3], ["perimIso", 3], ["perimSolve", 2], ["base", 3], ["sumProd", 3], ["ratioH", 2], ["parallel", 3], ["shared", 2], ["areaCmp", 3]],
    skills: {
      area: { title: "مساحة المثلث = ½ القاعدة × الارتفاع", from: 0, to: 180, gen(R, h) {
        const b = R.int(2, 30), ht = R.int(2, 30), v = b * ht / 2, right = R.next() < .4;
        return { style: "a" + right, sig: `${b}:${ht}:${right}`, body: right ? `مثلث قائم الزاوية طولا ضلعي القائمة فيه ${h.A(b)} سم و ${h.A(ht)} سم. فما مساحته؟` : `مثلث طول قاعدته ${h.A(b)} سم وارتفاعه ${h.A(ht)} سم. فما مساحته؟`,
          ...h.strOptions(R, `${N(h, v)} سم²`, [`${h.A(b * ht)} سم²`, `${N(h, v + b)} سم²`, `${h.A(b + ht)} سم²`].map(x => x === `${N(h, v)} سم²` ? `${N(h, v + 1)} سم²` : x)),
          steps: [AR_, right ? "في المثلث القائم يكون أحد ضلعي القائمة قاعدة والآخر ارتفاعًا." : "", `المساحة = ½ × ${h.A(b)} × ${h.A(ht)} = ${N(h, v)} سم².`].filter(Boolean), explanation: `${N(h, v)} سم²` };
      } },
      perimIso: { title: "محيط مثلث متطابق الضلعين بدلالة مجهول", from: 180, to: 400, gen(R, h) {
        const A = h.A, x = R.int(2, 9), p = R.int(2, 5), c = R.int(-5, 8), s = p * x + c, base = R.int(3, 20); if (s <= 2) return null; const k = R.pick([1, "e"]);
        const P = 2 * s + base;
        return { style: "p", sig: `${x}:${p}:${c}:${base}`, body: `مثلث متطابق الضلعين، طول أحد ضلعيه المتطابقين ${A(s)} سم وطول الآخر ${E(h, p, c)} ، وطول قاعدته ${A(base)} سم. أوجد محيط المثلث`,
          ...h.numOptions(R, h.d(P), [h.d(s + base), h.d(P + x), h.d(2 * base + s)]),
          steps: ["الضلعان المتطابقان متساويان.", `${E(h, p, c)} = ${A(s)} ، إذن س = ${A(x)}.`, `المحيط = ${A(s)} + ${A(s)} + ${A(base)} = ${A(P)} سم.`], explanation: A(P) };
      } },
      perimSolve: { title: "إيجاد مجهول من المحيط", from: 400, to: 480, gen(R, h) {
        const A = h.A, cs = [[2, R.int(1, 8)], [1, R.int(1, 8)], [1, 0]], x = R.int(1, 8), P = cs.reduce((t, [p, c]) => t + p * x + c, 0);
        return { style: "s", sig: `${cs.map(z => z.join(",")).join(";")}:${x}`, body: `محيط المثلث ${A(P)} سم ، وأطوال أضلاعه ${cs.map(([p, c]) => E(h, p, c)).join(" ، ")}. فما قيمة س؟`,
          ...h.numOptions(R, h.d(x), [h.d(x + 1), h.d(Math.max(1, x - 1)), h.d(Math.round(P / 3))]),
          steps: ["المحيط = مجموع أطوال الأضلاع.", `${cs.map(([p, c]) => E(h, p, c)).join(" + ")} = ${A(P)} ، أي ٤س + ${A(cs[0][1] + cs[1][1])} = ${A(P)}.`, `س = ${A(x)}.`], explanation: A(x) };
      } },
      base: { title: "إيجاد القاعدة أو الارتفاع من المساحة", from: 1080, to: 1200, gen(R, h) {
        const A = h.A, b = R.int(2, 20), ht = R.int(2, 20), S = b * ht / 2, ask = R.pick(["b", "h", "cmp"]); if (!Number.isInteger(S)) return null;
        if (ask === "cmp") { const w = b + R.pick([-1, 0, 1]);
          return { style: "c", sig: `c${b}:${ht}:${w}`, body: h.cmpBody(`مثلث مساحته ${A(S)} سم² وارتفاعه ${A(ht)} سم`, `${A(w)} سم`, "طول القاعدة"), ...h.cmpAnswer(h.d(w), h.d(b)),
            steps: [AR_, `القاعدة = ٢ × ${A(S)} ÷ ${A(ht)} = ${A(b)} سم.`, `إذن ${rel(w, b)}.`], explanation: rel(w, b) }; }
        const v = ask === "b" ? b : ht, g = ask === "b" ? ht : b;
        return { style: ask, sig: `${ask}${b}:${ht}`, body: `مثلث مساحته ${A(S)} سم² و${ask === "b" ? "ارتفاعه" : "طول قاعدته"} ${A(g)} سم. فما ${ask === "b" ? "طول قاعدته" : "ارتفاعه"}؟`,
          ...h.numOptions(R, h.d(v), [h.d(S / g | 0 || v + 1), h.d(v * 2), h.d(v + 1)]),
          steps: [AR_, `${ask === "b" ? "القاعدة" : "الارتفاع"} = ٢ × ${A(S)} ÷ ${A(g)} = ${A(v)} سم.`], explanation: A(v) };
      } },
      sumProd: { title: "قاعدة وارتفاع من مجموعهما أو الفرق بينهما والمساحة", from: 1200, to: 1500, gen(R, h) {
        const A = h.A, b = R.int(2, 14), ht = R.int(2, 14), S = b * ht / 2, mode = R.pick(["sum", "diff"]); if (!Number.isInteger(S) || b === ht) return null;
        if (mode === "sum") { const v = Math.abs(b - ht);
          return { style: "s", sig: `s${b}:${ht}`, body: `مجموع قاعدة مثلث وارتفاعه ${A(b + ht)} ومساحته ${A(S)} ، فما الفرق بين القاعدة والارتفاع؟`, ...h.numOptions(R, h.d(v), [h.d(v + 2), h.d(b + ht), h.d(Math.max(1, v - 1))]),
            steps: [`ق + ع = ${A(b + ht)} ، و ق × ع = ٢ × ${A(S)} = ${A(2 * S)}.`, `عددان مجموعهما ${A(b + ht)} وحاصل ضربهما ${A(2 * S)}: ${A(Math.max(b, ht))} و ${A(Math.min(b, ht))}.`, `الفرق = ${A(v)}.`], explanation: A(v) }; }
        const d = ht - b; if (d <= 0) return null;
        return { style: "d", sig: `d${b}:${ht}`, body: `مثلث يزيد ارتفاعه عن قاعدته بمقدار ${A(d)} سم ، ومساحته ${A(S)} سم². فما طول ارتفاعه؟`, ...h.numOptions(R, h.d(ht), [h.d(b), h.d(ht + d), h.d(ht + 1)]),
          steps: [`ق × ع = ٢ × ${A(S)} = ${A(2 * S)}.`, `نبحث عن عددين الفرق بينهما ${A(d)} وحاصل ضربهما ${A(2 * S)}: ${A(b)} و ${A(ht)}.`, `الارتفاع = ${A(ht)} سم.`], explanation: A(ht) };
      } },
      ratioH: { title: "الارتفاع مضاعف للقاعدة", from: 1500, to: 1620, gen(R, h) {
        const A = h.A, k = R.int(2, 4), b = R.int(2, 8), ht = k * b, S = b * ht / 2; if (!Number.isInteger(S)) return null;
        return { style: "r", sig: `${k}:${b}`, body: `إذا كان ارتفاع مثلث = ${k === 2 ? "ضعف" : A(k) + " أضعاف"} قاعدته وكانت مساحته ${A(S)} ، فما طول قاعدته؟`, ...h.numOptions(R, h.d(b), [h.d(ht), h.d(b + 1), h.d(Math.round(S / k))]),
          steps: [`ق × ${A(k)}ق = ٢ × ${A(S)} = ${A(2 * S)} ، أي ق² = ${A(2 * S / k)}.`, `ق = ${A(b)}.`], explanation: A(b) };
      } },
      parallel: { title: "مثلثات محصورة بين مستقيمين متوازيين", from: 2400, to: 2640, gen(R, h) {
        const A = h.A, b1 = R.int(2, 9), b2 = R.int(2, 9), mode = R.pick(["cmp", "ratio", "same"]);
        if (mode === "same") return { style: "s", sig: `s${b1}`, body: h.cmpBody("المستقيمان م و ل متوازيان، والقطعة ب ج على المستقيم ل ، و أ و د نقطتان على المستقيم م", "مساحة المثلث أ ب ج", "مساحة المثلث د ب ج"), options: h.cmpAnswer(h.d(0), h.d(0)).options, correct: 2,
          steps: ["المثلثان لهما القاعدة نفسها ب ج.", "ورأساهما على مستقيم يوازي القاعدة، فالارتفاع واحد.", "إذن المساحتان متساويتان."], explanation: "القيمتان متساويتان" };
        if (mode === "ratio") { const S1 = b1 * R.int(2, 6);
          return { style: "r", sig: `r${b1}:${b2}:${S1}`, body: `مثلثان رأساهما على أحد مستقيمين متوازيين وقاعدتاهما على الآخر، طول قاعدة الأول ${A(b1)} سم ومساحته ${A(S1)} سم² ، وطول قاعدة الثاني ${A(b2)} سم. فما مساحة الثاني؟`,
            ...h.strOptions(R, `${N(h, S1 * b2 / b1)} سم²`, [`${A(S1)} سم²`, `${N(h, S1 * b1 / b2)} سم²`, `${N(h, S1 + b2 - b1)} سم²`].map(x => x === `${N(h, S1 * b2 / b1)} سم²` ? `${N(h, S1 * b2 / b1 + 1)} سم²` : x)),
            steps: ["الارتفاع واحد، فالنسبة بين المساحتين = النسبة بين القاعدتين.", `${h.frac("م٢", A(S1))} = ${h.frac(A(b2), A(b1))} ، م٢ = ${N(h, S1 * b2 / b1)} سم².`], explanation: `${N(h, S1 * b2 / b1)} سم²` }; }
        if (b1 === b2) return null;
        return { style: "c", sig: `c${b1}:${b2}`, body: h.cmpBody(`مثلثان رأساهما على أحد مستقيمين متوازيين وقاعدتاهما على المستقيم الآخر، طول قاعدة الأول ${A(b1)} سم وطول قاعدة الثاني ${A(b2)} سم`, "مساحة المثلث الأول", "مساحة المثلث الثاني"), ...h.cmpAnswer(h.d(b1), h.d(b2)),
          steps: ["الارتفاعان متساويان (المسافة بين المتوازيين).", "النسبة بين المساحتين = النسبة بين القاعدتين.", `إذن ${rel(b1, b2)}.`], explanation: rel(b1, b2) };
      } },
      shared: { title: "مثلثات تشترك في رأس وقاعدتاها على مستقيم واحد", from: 2400, to: 2922, gen(R, h) {
        const A = h.A, x = R.int(2, 8), k = R.pick([1, 2, 3]), S = R.int(3, 20);
        return { style: "s" + k, sig: `${x}:${k}:${S}`, body: `مثلثان د ج ب و د ج أ يشتركان في الرأس د ، وقاعدتاهما ج ب و ج أ على مستقيم واحد، حيث ج ب = ${A(k * x)} و ج أ = ${A(x)}. إذا كانت مساحة د ج أ = ${A(S)} ، فما مساحة د ج ب؟`,
          ...h.numOptions(R, h.d(k * S), [h.d(S), h.d(S + k), h.d(2 * k * S)]),
          steps: ["المثلثان لهما الارتفاع نفسه من الرأس د ، فالنسبة بين المساحتين = النسبة بين القاعدتين.", `${h.frac("م", A(S))} = ${h.frac(A(k * x), A(x))} = ${A(k)}.`, `المساحة = ${A(k * S)}.`], explanation: A(k * S) };
      } },
      areaCmp: { title: "المقارنة بين مساحتي مثلثين", from: 480, to: 1080, gen(R, h) {
        const A = h.A, b1 = R.int(2, 12), h1 = R.int(2, 12), b2 = R.int(2, 12), h2 = R.int(2, 12), x = b1 * h1, y = b2 * h2;
        return { style: "c", sig: `${b1}:${h1}:${b2}:${h2}`, body: `قارن بين:\nالقيمة الأولى: مساحة مثلث قاعدته ${A(b1)} وارتفاعه ${A(h1)}\nالقيمة الثانية: مساحة مثلث قاعدته ${A(b2)} وارتفاعه ${A(h2)}`, ...h.cmpAnswer(h.d(x), h.d(y)),
          steps: [`الأولى = ½ × ${A(b1)} × ${A(h1)} = ${N(h, x / 2)}.`, `الثانية = ½ × ${A(b2)} × ${A(h2)} = ${N(h, y / 2)}.`, `إذن ${rel(x, y)}.`], explanation: rel(x, y) };
      } }
    }
  };
})();
