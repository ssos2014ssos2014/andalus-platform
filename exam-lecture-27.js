// المحاضرة 27 (جزءان): الضرب التبادلي بين ثلاث كميات، وأجزاء النسب وتوزيع المبالغ
(() => {
  const g = (a, b) => b ? g(b, a % b) : a;
  const S1 = "الجزء الأول", S2 = "الجزء الثاني";
  const R3 = (h, a) => { const k = a.reduce(g); return a.map(x => h.A(x / k)).join(" : "); };
  const ORD = ["الأول", "الثاني", "الثالث"];
  window.EXAMS[27] = {
    title: "اختبار محاكي: الضرب التبادلي وأجزاء النسب", minutes: 25,
    blueprint: [["joint", 3], ["jointDays", 2], ["fracWork", 2], ["ratioTotal", 3], ["perEvery", 3], ["shares", 2], ["partners", 2], ["diff", 2], ["angles", 1], ["relations", 2], ["chain", 2]],
    skills: {
      joint: { title: "الضرب التبادلي: عدد العمال لإنتاج كمية في مدة", seg: S1, from: 0, to: 310, gen(R, h) {
        const A = h.A, w = R.int(3, 8), d = R.int(3, 8), r = R.int(2, 6), P = w * d * r, w2 = R.int(3, 15), d2 = R.int(2, 9); if (d2 === d && w2 === w) return null; const P2 = w2 * d2 * r;
        return { style: "j", sig: `${w}:${d}:${r}:${w2}:${d2}`, body: `إذا كان ${A(w)} عمال يصنعون ${A(P)} قطعة قماش في ${A(d)} أيام، فكم عاملًا يصنع ${A(P2)} قطعة في ${A(d2)} أيام؟`,
          ...h.numOptions(R, h.d(w2), [h.d(w2 + 1), h.d(Math.round(P2 / P * w) || w2 + 3), h.d(Math.max(1, w2 - 2))]),
          steps: ["العمال والأيام والإنتاج: الإنتاج يتناسب طرديًا مع (العمال × الأيام)، فنضع المنتَج في المنتصف.", `${h.frac(`${A(w)} × ${A(d)}`, A(P))} = ${h.frac(`س × ${A(d2)}`, A(P2))}.`, `س = ${h.frac(`${A(w)} × ${A(d)} × ${A(P2)}`, `${A(P)} × ${A(d2)}`)} = ${A(w2)} عمال.`], explanation: A(w2) };
      } },
      jointDays: { title: "الضرب التبادلي: عدد الأيام بعدد عمال مختلف", seg: S1, from: 310, to: 600, gen(R, h) {
        const A = h.A, a = R.int(1, 5), d = R.int(3, 12) * 10, Q = R.int(2, 9) * 100, b = R.pick([2, 5, 10, 20]); if (b === a || (a * d) % b) return null; const v = a * d / b, Q2 = Q;
        return { style: "d", sig: `${a}:${d}:${Q}:${b}`, body: `إذا زرع ${a === 1 ? "مزارع" : A(a) + " مزارعين"} ${A(Q)} فسيلة في ${A(d)} يومًا، فكم يومًا يحتاج ${A(b)} عمال لزراعة نفس العدد من الفسائل؟`,
          ...h.numOptions(R, h.d(v), [h.d(d * b / a), h.d(v + 2), h.d(d / 10)].map(x => x)),
          steps: ["الكمية ثابتة، فالعلاقة بين العمال والأيام عكسية.", `العمل = ${A(a)} × ${A(d)} = ${A(a * d)} يوم عمل.`, `الأيام = ${A(a * d)} ÷ ${A(b)} = ${A(v)} أيام.`], explanation: A(v) };
      } },
      fracWork: { title: "إكمال جزء متبقٍ من عمل", seg: S1, from: 600, to: 800, gen(R, h) {
        const A = h.A, [p, q] = R.pick([[2, 5], [1, 3], [1, 4], [3, 5], [1, 2]]), hd = R.int(2, 6), dd = R.int(2, 6), h2 = R.int(1, 5); if (h2 === hd) return null;
        const total = hd * dd / (p / q), rest = total * (1 - p / q), v = rest / h2; if (!Number.isInteger(v)) return null;
        return { style: "f", sig: `${p}:${q}:${hd}:${dd}:${h2}`, body: `شخص يرسم كل يوم ${A(hd)} ساعات لمدة ${A(dd)} أيام فأكمل ${h.frac(A(p), A(q))} من اللوحة، ورسم باقي اللوحة كل يوم ${h2 === 1 ? "ساعة" : h2 === 2 ? "ساعتين" : A(h2) + " ساعات"}، فكم يومًا يكمل باقي اللوحة؟`,
          ...h.strOptions(R, `${A(v)} يوم`, [`${A(v + 3)} يوم`, `${A(Math.round(dd * hd / h2))} يوم`, `${A(Math.max(1, v - 2))} يوم`].map(x => x === `${A(v)} يوم` ? `${A(v + 5)} يوم` : x)),
          steps: [`ساعات العمل الأولى = ${A(hd)} × ${A(dd)} = ${A(hd * dd)} ساعة لإنجاز ${h.frac(A(p), A(q))} اللوحة، فاللوحة كاملة تحتاج ${A(total)} ساعة.`, `الباقي = ${h.frac(A(q - p), A(q))} يحتاج ${A(rest)} ساعة.`, `الأيام = ${A(rest)} ÷ ${A(h2)} = ${A(v)} يومًا.`], explanation: `${A(v)} يوم` };
      } },
      ratioTotal: { title: "إيجاد جزء من مجموع معلوم ونسبة", seg: S1, from: 800, to: 1080, gen(R, h) {
        const A = h.A, a = R.int(1, 7), b = R.int(1, 9), mode = R.pick(["parts", "whole", "bill"]); if (g(a, b) !== 1 || a === b) return null;
        if (mode === "bill") { const w = R.int(2, 9) * 10, k = R.pick([10, 15, 20, 25]);
          return { style: "b", sig: `b${w}:${k}`, body: `إذا كانت نسبة فاتورة المياه إلى فاتورة الكهرباء ١ : ${A(k)} ، فإذا كانت فاتورة المياه ${A(w)} ريال، فكم فاتورة الكهرباء؟`,
            ...h.numOptions(R, h.d(w * k), [h.d(w + k), h.d(w * (k + 1)), h.d(w * k / 2)]), steps: [`كل جزء = ${A(w)} ريال.`, `الكهرباء = ${A(k)} × ${A(w)} = ${A(w * k)} ريال.`], explanation: A(w * k) }; }
        const n = R.int(2, 12), T = (mode === "parts" ? a + b : b) * n;
        if (mode === "whole") { if (a >= b) return null; const v = (b - a) * n;
          return { style: "w", sig: `w${a}:${b}:${n}`, body: `رحلة استكشافية كانت نسبة الرجال إلى الجميع فيها ${A(a)} : ${A(b)} ، وعددهم جميعًا ${A(T)} ، فما عدد النساء؟`,
            ...h.numOptions(R, h.d(v), [h.d(a * n), h.d(T * a / (a + b) | 0 || v + 3), h.d(v + n)]),
            steps: ["النسبة هنا إلى الجميع، فمجموع الأجزاء = " + `${A(b)}.`, `الجزء = ${A(T)} ÷ ${A(b)} = ${A(n)} ، والرجال = ${A(a)} × ${A(n)} = ${A(a * n)}.`, `النساء = ${A(T)} − ${A(a * n)} = ${A(v)}.`], explanation: A(v) }; }
        const v = a * n;
        return { style: "p", sig: `p${a}:${b}:${n}`, body: `رحلة استكشافية بها نسبة الرجال إلى النساء ${A(a)} : ${A(b)} ، وعددهم جميعًا ${A(T)} ، فما عدد الرجال؟`,
          ...h.numOptions(R, h.d(v), [h.d(b * n), h.d(T * a / b | 0 || v + 2), h.d(v + a)]),
          steps: [`مجموع الأجزاء = ${A(a)} + ${A(b)} = ${A(a + b)}.`, `قيمة الجزء = ${A(T)} ÷ ${A(a + b)} = ${A(n)}.`, `الرجال = ${A(a)} × ${A(n)} = ${A(v)}.`], explanation: A(v) };
      } },
      perEvery: { title: "من بين كل عدد يوجد كذا", seg: S1, from: 1080, to: 1703, gen(R, h) {
        const A = h.A, k = R.pick([4, 5, 6, 8, 10, 12, 15]), m = R.int(1, k - 1), n = R.int(3, 15), T = k * n, ask = R.pick(["good", "bad"]);
        const [thing, good, bad] = R.pick([["تفاحة", "صالحة", "فاسدة"], ["جهاز", "صالحًا", "تالفًا"], ["بيضة", "سليمة", "مكسورة"]]);
        const v = ask === "good" ? m * n : (k - m) * n;
        return { style: ask, sig: `${k}:${m}:${n}:${ask}`, body: `من بين كل ${A(k)} ${thing} يوجد ${A(m)} ${good}، فإذا كان العدد الكلي ${A(T)} ${thing}، فكم عدد ${ask === "good" ? "الصالح" : "الفاسد"} منها؟`.replace("عدد الصالح", "الصالح").replace("عدد الفاسد", "غير الصالح"),
          ...h.numOptions(R, h.d(v), [h.d(ask === "good" ? (k - m) * n : m * n), h.d(T - m), h.d(v + n)]),
          steps: [`نسبة الصالح إلى الكل = ${A(m)} : ${A(k)} ، وغير الصالح ${A(k - m)} : ${A(k)}.`, `عدد المجموعات = ${A(T)} ÷ ${A(k)} = ${A(n)}.`, `المطلوب = ${A(ask === "good" ? m : k - m)} × ${A(n)} = ${A(v)}.`], explanation: A(v) };
      } },
      shares: { title: "توزيع الأجر حسب مدة العمل", seg: S1, from: 1240, to: 1390, gen(R, h) {
        const A = h.A, H = R.pick([6, 12]), f = [1, 1 / 2, 1 / 3], parts = f.map(x => H * x), sum = parts.reduce((a, b) => a + b), unit = R.int(2, 20) * 50, pay = sum * unit, who = R.int(0, 2), v = parts[who] * unit;
        return { style: "s" + who, sig: `${H}:${unit}:${who}`, body: `ثلاثة عمال عملوا لمدة ${A(H)} ${H <= 10 ? "ساعات" : "ساعة"} وتقاضوا خلالها ${A(pay)} ريال، حيث عمل الأول كامل المدة، والثاني نصف المدة، والثالث ثلث المدة. احسب نصيب ${ORD[who]}`,
          ...h.numOptions(R, h.d(v), [h.d(Math.round(pay / 3)), h.d(parts[(who + 1) % 3] * unit), h.d(v + unit)]),
          steps: [`ساعات العمل: ${parts.map(A).join(" : ")} ، ومجموعها ${A(sum)} ساعة.`, `أجر الساعة = ${A(pay)} ÷ ${A(sum)} = ${A(unit)} ريال.`, `نصيب ${ORD[who]} = ${A(parts[who])} × ${A(unit)} = ${A(v)} ريال.`], explanation: A(v) };
      } },
      partners: { title: "توزيع مبلغ حسب نسبة معلومة", seg: S2, from: 0, to: 60, gen(R, h) {
        const A = h.A, r = R.pick([[1, 2, 3], [2, 3, 5], [1, 3, 4], [2, 5, 3], [3, 4, 5]]), unit = R.int(2, 30) * 100, T = r.reduce((a, b) => a + b) * unit, big = R.next() < .6, v = (big ? Math.max(...r) : Math.min(...r)) * unit;
        return { style: "p" + big, sig: `${r.join("")}:${unit}:${big}`, body: `شركاء في شركة بنسبة ${r.map(A).join(" : ")} ، فكان الربح ${A(T)} ريال في نهاية العام. أوجد نصيب ${big ? "أكبر" : "أصغر"} مشارك منهم`,
          ...h.numOptions(R, h.d(v), [h.d(T / 3), h.d((big ? Math.min(...r) : Math.max(...r)) * unit), h.d(v * 2)]),
          steps: [`مجموع الأجزاء = ${r.map(A).join(" + ")} = ${A(r.reduce((a, b) => a + b))}.`, `قيمة الجزء = ${A(T)} ÷ ${A(r.reduce((a, b) => a + b))} = ${A(unit)}.`, `النصيب = ${A(big ? Math.max(...r) : Math.min(...r))} × ${A(unit)} = ${A(v)} ريال.`], explanation: A(v) };
      } },
      diff: { title: "النسبة مع الفرق بين نصيبين", seg: S2, from: 60, to: 200, gen(R, h) {
        const A = h.A, r = R.pick([[1, 2, 3], [1, 3, 5], [2, 3, 4], [1, 2, 4]]), unit = R.int(2, 40) * 10, d = (r[2] - r[0]) * unit, ans = r.map(x => A(x * unit)).join(" ، ");
        return { style: "d", sig: `${r.join("")}:${unit}`, body: `وُزِّع مبلغ على ٣ أشخاص بالنسب ${r.map(A).join(" : ")} ، فما المبلغ الذي أخذه كل منهم بالترتيب إذا علمت أن الفرق بين الأول والثالث = ${A(d)} ريال؟`,
          ...h.strOptions(R, ans, [r.map(x => A(x * unit * 2)).join(" ، "), r.map(x => A(x * unit + unit)).join(" ، "), [r[0], r[1] + 1, r[2]].map(x => A(x * unit)).join(" ، ")]),
          steps: [`الفرق بين الأول والثالث = ${A(r[2])} − ${A(r[0])} = ${A(r[2] - r[0])} أجزاء = ${A(d)} ريال.`, `قيمة الجزء = ${A(d)} ÷ ${A(r[2] - r[0])} = ${A(unit)}.`, `الأنصبة: ${ans}.`], explanation: ans };
      } },
      angles: { title: "زوايا مثلث بنسبة معلومة", seg: S2, from: 200, to: 310, gen(R, h) {
        const A = h.A, r = R.pick([[5, 3, 4], [1, 2, 3], [2, 3, 4], [1, 1, 2], [3, 4, 5], [1, 4, 7], [4, 5, 9]]), s = r.reduce((a, b) => a + b); if (180 % s) return null; const u = 180 / s, ans = r.map(x => A(x * u)).join(" ، ");
        return { style: "a", sig: r.join(""), body: `النسبة بين زوايا مثلث ${r.map(A).join(" : ")} ، فإن قياس زواياه على الترتيب:`,
          ...h.strOptions(R, ans, [[r[1], r[0], r[2]].map(x => A(x * u)).join(" ، "), r.map(x => A(x * 360 / s)).join(" ، "), r.map(x => A(x * u + 5)).join(" ، ")]),
          steps: ["مجموع زوايا المثلث = ١٨٠°.", `مجموع الأجزاء = ${A(s)} ، والجزء = ١٨٠ ÷ ${A(s)} = ${A(u)}°.`, `الزوايا: ${ans} (بالترتيب نفسه).`], explanation: ans };
      } },
      relations: { title: "مجموع كميات مرتبطة بعلاقات", seg: S2, from: 310, to: 480, gen(R, h) {
        const A = h.A, k = R.pick([4, 5, 8, 10]), m = R.int(2, 5), g0 = R.int(2, 20) * k * 10, cows = g0 / k, camels = g0 * m, T = g0 + cows + camels;
        return { style: "r", sig: `${k}:${m}:${g0}`, body: `إذا كان عدد البقر = ${h.frac("١", A(k))} عدد الماعز، وعدد الجمال = ${A(m)} أمثال عدد الماعز، فما عدد الماعز إذا كان مجموعها ${A(T)}؟`,
          ...h.numOptions(R, h.d(g0), [h.d(camels), h.d(Math.round(T / 3)), h.d(g0 + cows)]),
          steps: [`نفرض الماعز = س ، فالبقر = ${h.frac("س", A(k))} والجمال = ${A(m)}س.`, `س + ${h.frac("س", A(k))} + ${A(m)}س = ${A(T)} ، أي ${h.frac(A(k + 1 + m * k), A(k))} س = ${A(T)}.`, `س = ${A(g0)}. (أو جرّب الخيارات)`], explanation: A(g0) };
      } },
      chain: { title: "إيجاد نسبة من نسبتين مرتبطتين", seg: S2, from: 480, to: 1115, gen(R, h) {
        const A = h.A, mode = R.pick(["age", "income", "split"]);
        if (mode === "split") { const [a, b] = R.pick([[3, 4], [2, 3], [1, 2], [3, 5]]), [c, d] = R.pick([[1, 2], [1, 4], [3, 2], [1, 1]]); // الأول:الثاني = a:b ، الثالث:الثاني = c:d
          const p = [a * d, b * d, c * b], s = p.reduce((x, y) => x + y), unit = R.int(2, 20) * 10, T = s * unit, ans = p.map(x => A(x * unit)).join(" ، ");
          return { style: "s", sig: `s${a}${b}${c}${d}:${unit}`, body: `وُزِّع مبلغ ${A(T)} ريال على ٣ أشخاص بنسبة الأول إلى الثاني ${A(a)} : ${A(b)} ، ونسبة الثالث إلى الثاني ${A(c)} : ${A(d)} ، فما نصيب كل منهم على الترتيب؟`,
            ...h.strOptions(R, ans, [[p[1], p[0], p[2]].map(x => A(x * unit)).join(" ، "), [p[0], p[2], p[1]].map(x => A(x * unit)).join(" ، "), p.map(x => A(x * unit + 10)).join(" ، ")]),
            steps: [`نوحّد نصيب الثاني: الأول : الثاني : الثالث = ${p.map(A).join(" : ")}.`, `الجزء = ${A(T)} ÷ ${A(s)} = ${A(unit)}.`, `الأنصبة: ${ans}.`], explanation: ans }; }
        if (mode === "income") { const a = R.int(2, 3), b = R.int(2, 4), ans = `١ : ${A(a * b)}`;
          return { style: "i", sig: `i${a}:${b}`, body: `ثلاثة معارض: دخل الأول ${a === 2 ? "ضعف" : "ثلاثة أمثال"} دخل الثاني، ودخل الثالث ${A(b)} أمثال الأول، فما نسبة دخل الثاني إلى الثالث؟`,
            ...h.strOptions(R, ans, [`١ : ${A(b)}`, `${A(a * b)} : ١`, `١ : ${A(a + b)}`]),
            steps: ["نفرض دخل الثاني = ١.", `الأول = ${A(a)} ، والثالث = ${A(b)} × ${A(a)} = ${A(a * b)}.`, `الثاني : الثالث = ${ans}.`], explanation: ans }; }
        const a = R.pick([2, 3]), b = R.int(2, 5), ans = R3(h, [b, a]);
        return { style: "a", sig: `a${a}:${b}`, body: `عمر محمد ${a === 2 ? "نصف" : "ثلث"} عمر سعد، وعمر سعد ${A(b)} أضعاف عمر فهد، فما نسبة عمر محمد إلى عمر فهد؟`,
          ...h.strOptions(R, ans, [R3(h, [a, b]), `١ : ${A(a * b)}`, R3(h, [b * a, 1])].map(x => x === ans ? `${A(b + 1)} : ${A(a)}` : x)),
          steps: [`نفرض عمر فهد = ${A(a)} (لتسهيل القسمة) ، فعمر سعد = ${A(a * b)}.`, `عمر محمد = ${A(a * b)} ÷ ${A(a)} = ${A(b)}.`, `محمد : فهد = ${A(b)} : ${A(a)} = ${ans}.`], explanation: ans };
      } }
    }
  };
})();
