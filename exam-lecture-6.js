// المحاضرة 6: الزوجي والفردي، المتوسط، المثلث، الزوايا، المساحات المظللة، الاحتمالات، زوايا الساعة، الدوائر، السرعات
(() => {
  const SUP = n => String(n).split("").map(d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]).join("");
  window.EXAMS[6] = {
    title: "اختبار محاكي: الأعداد والمتوسط والهندسة والسرعات", minutes: 25,
    blueprint: [["evenOdd", 2], ["mean", 3], ["tri", 3], ["angles", 4], ["shaded", 2], ["prob", 3], ["clock", 2], ["circle", 2], ["speed", 3]],
    skills: {
      evenOdd: { title: "الأعداد الزوجية والفردية والأعداد المتتالية", from: 0, to: 240, gen(R, h) {
        const A = h.A, style = R.pick(["diff", "consec"]);
        if (style === "diff") { const a = R.int(3, 5), b = R.int(2, a), oddMin = 10 ** (a - 1) + 1, evMax = 10 ** b - 2, big = R.next() < .5;
          const v = big ? (10 ** a - 1) - (10 ** (b - 1)) : oddMin - evMax; if (v <= 0) return null;
          const q = big ? `أكبر عدد فردي مكوّن من ${A(a)} أرقام وأصغر عدد زوجي مكوّن من ${A(b)} أرقام` : `أصغر عدد فردي مكوّن من ${A(a)} أرقام وأكبر عدد زوجي مكوّن من ${A(b)} أرقام`;
          const x = big ? 10 ** a - 1 : oddMin, y = big ? 10 ** (b - 1) : evMax;
          return { style, sig: `d:${a}${b}${big}`, body: `أوجد الفرق بين ${q}`, ...h.numOptions(R, h.d(v), [h.d(v + 1), h.d(v + 2), h.d(Math.abs(x - y - 10))]),
            steps: [`${big ? "أكبر عدد فردي" : "أصغر عدد فردي"} من ${A(a)} أرقام = ${A(x)}.`, `${big ? "أصغر عدد زوجي" : "أكبر عدد زوجي"} من ${A(b)} أرقام = ${A(y)}.`, `الفرق = ${A(x)} − ${A(y)} = ${A(v)}.`], explanation: A(v) }; }
        const m = R.int(1, 30), k = R.pick([3, 5]), sum = k * m, dbl = R.next() < .5, given = dbl ? 2 * sum : sum, big = m + (k - 1) / 2;
        return { style, sig: `c:${m}${k}${dbl}`, body: `إذا كان ${dbl ? "ضعف " : ""}مجموع ${A(k)} أعداد صحيحة متتالية يساوي ${A(given)}، فما العدد الأكبر منها؟`, ...h.numOptions(R, h.d(big), [h.d(m), h.d(big + 1), h.d(given / k | 0 || big + 2)]),
          steps: [dbl ? `المجموع = ${A(given)} ÷ ٢ = ${A(sum)}.` : `المجموع = ${A(sum)}.`, `العدد الأوسط = المجموع ÷ عدد الأعداد = ${A(sum)} ÷ ${A(k)} = ${A(m)}.`, `الأعداد: ${Array.from({ length: k }, (_, i) => A(m - (k - 1) / 2 + i)).join(" ، ")}، والأكبر ${A(big)}. (ويمكن تجريب الخيارات)`], explanation: A(big) };
      } },
      mean: { title: "المتوسط الحسابي", from: 240, to: 620, gen(R, h) {
        const A = h.A, style = R.pick(["list", "seq", "pow"]);
        if (style === "list") { const n = R.int(4, 6), m = R.int(5, 40), xs = Array.from({ length: n - 1 }, () => R.int(1, 2 * m)); const last = n * m - xs.reduce((a, b) => a + b, 0); if (last < 1) return null; xs.push(last); const ys = R.shuffle(xs);
          return { style, sig: `l:${ys.join(",")}`, body: `ما المتوسط الحسابي للقيم: ${ys.map(A).join(" ، ")} ؟`, ...h.numOptions(R, h.d(m), [h.d(m + 1), h.d(Math.max(...ys)), h.d(n * m / (n - 1) | 0 || m + 2)]),
            steps: ["المتوسط = مجموع القيم ÷ عددها.", `المجموع = ${ys.map(A).join(" + ")} = ${A(n * m)}.`, `المتوسط = ${A(n * m)} ÷ ${A(n)} = ${A(m)}.`], explanation: A(m) }; }
        if (style === "seq") { const a = R.int(1, 20), d = R.int(2, 9), n = R.int(5, 30), l = a + (n - 1) * d; if ((a + l) % 2) return null; const v = (a + l) / 2;
          return { style, sig: `s:${a}${d}${n}`, body: `أوجد المتوسط الحسابي للأعداد: ${A(a)} ، ${A(a + d)} ، ${A(a + 2 * d)} ، … ، ${A(l)} (تزيد بمقدار ثابت)`, ...h.numOptions(R, h.d(v), [h.d(l), h.d(v + d), h.d(a + l)]),
            steps: ["إذا كانت الأعداد تزيد بمقدار ثابت (متتابعة حسابية) فالمتوسط = (أقل عدد + أكبر عدد) ÷ ٢.", `(${A(a)} + ${A(l)}) ÷ ٢ = ${A(a + l)} ÷ ٢ = ${A(v)}.`], explanation: A(v) }; }
        const b = R.pick([2, 3, 5]), n = R.int(10, 60) * 2, mean = n / 2, other = R.pick([mean, n - 1, mean + 1, n]);
        return { style, sig: `p:${b}${n}:${other}`, body: h.cmpBody(`إذا كان ${A(b)}^أ × ${A(b)}^ب = ${A(b)}${SUP(n)}`, "متوسط أ و ب", A(other)).replace(/\^أ/, "ᵃ").replace(/\^ب/, "ᵇ").replace("ᵃ", " أس أ").replace("ᵇ", " أس ب"),
          ...h.cmpAnswer(h.d(mean), h.d(other)),
          steps: [`عند ضرب الأسس المتشابهة نجمع الأسس: أ + ب = ${A(n)}.`, `متوسط أ و ب = (أ + ب) ÷ ٢ = ${A(n)} ÷ ٢ = ${A(mean)}.`, `نقارن ${A(mean)} بـ ${A(other)}.`], explanation: A(mean) };
      } },
      tri: { title: "المثلث: المساحة والمحيط", from: 620, to: 820, gen(R, h) {
        const A = h.A, style = R.pick(["equi", "iso", "pyth"]);
        if (style === "equi") { const l = R.int(1, 6) * 2, c = l * l / 4, ans = h.rad(c, 3);
          return { style, sig: `e:${l}`, body: `مثلث متطابق الأضلاع طول ضلعه ${A(l)} سم، فما مساحته؟`, ...h.strOptions(R, ans, [h.rad(c * 2, 3), A(l * l / 2), h.rad(c, 2), A(3 * l)]),
            steps: ["مساحة المثلث المتطابق الأضلاع = (ل² ÷ ٤) × √٣.", `= (${A(l)}² ÷ ٤) × √٣ = (${A(l * l)} ÷ ٤) × √٣ = ${ans} سم².`], explanation: ans }; }
        if (style === "iso") { const s = R.int(2, 6), a = R.int(2, 5), b = R.int(1, 9), side = a * s + b, k = R.int(1, 4), base = R.int(3, 2 * side - 1); if (base >= 2 * side) return null; const c = base - k * s; if (c === 0) return null;
          const baseExpr = c > 0 ? `${A(k)}س + ${A(c)}` : `${A(k)}س − ${A(-c)}`, p = 2 * side + base;
          return { style, sig: `i:${s}${a}${b}${k}${base}`, body: `مثلث متطابق الضلعين، طول أحد ضلعيه المتطابقين ${A(side)} سم والآخر ${A(a)}س + ${A(b)} ، وطول قاعدته ${baseExpr} ، فما محيطه؟`, ...h.numOptions(R, h.d(p), [h.d(2 * side + s), h.d(3 * side), h.d(p + 2)]),
            steps: ["الضلعان المتطابقان متساويان.", `${A(a)}س + ${A(b)} = ${A(side)} ← ${A(a)}س = ${A(side - b)} ← س = ${A(s)}.`, `القاعدة = ${A(base)} سم، والمحيط = ${A(side)} + ${A(side)} + ${A(base)} = ${A(p)} سم.`], explanation: A(p) }; }
        const [a, b, c] = R.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15]]), area = a * b;
        return { style, sig: `p:${a}${b}`, body: `مثلث متطابق الضلعين طول كل من ضلعيه المتطابقين ${A(c)} سم وطول قاعدته ${A(2 * b)} سم، فما مساحته؟`, ...h.numOptions(R, h.d(area), [h.d(2 * area), h.d(c * b), h.d(a * c)]),
          steps: ["الارتفاع من الرأس ينصف القاعدة في المثلث المتطابق الضلعين، فيتكون مثلث قائم.", `نصف القاعدة ${A(b)} والوتر ${A(c)}، فالارتفاع ${A(a)} (أضلاع فيثاغورث المشهورة ${A(a)}، ${A(b)}، ${A(c)}).`, `المساحة = ½ × القاعدة × الارتفاع = ½ × ${A(2 * b)} × ${A(a)} = ${A(area)} سم².`], explanation: A(area) };
      } },
      angles: { title: "الزوايا ومجموع زوايا المضلع", from: 820, to: 1200, gen(R, h) {
        const A = h.A, style = R.pick(["sum", "sides", "ext", "each"]);
        if (style === "sum") { const n = R.int(5, 15), v = (n - 2) * 180;
          return { style, sig: `s:${n}`, body: `ما مجموع قياسات الزوايا الداخلية لمضلع عدد أضلاعه ${A(n)} ؟`, ...h.numOptions(R, h.d(v), [h.d(n * 180), h.d(360), h.d((n - 1) * 180)]),
            steps: ["مجموع الزوايا الداخلية لأي مضلع = (ن − ٢) × ١٨٠°.", `(${A(n)} − ٢) × ١٨٠ = ${A(n - 2)} × ١٨٠ = ${A(v)}°.`], explanation: A(v) }; }
        if (style === "sides" || style === "each") { const n = R.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 36]), ex = 360 / n, inn = 180 - ex;
          if (style === "each") return { style, sig: `e:${n}`, body: `ما قياس الزاوية الداخلية لمضلع منتظم عدد أضلاعه ${A(n)} ؟`, ...h.numOptions(R, h.d(inn), [h.d(ex), h.d((n - 2) * 180), h.d(inn + 10)]),
            steps: [`الزاوية الخارجية للمضلع المنتظم = ٣٦٠ ÷ ${A(n)} = ${A(ex)}°.`, `الزاوية الداخلية = ١٨٠ − ${A(ex)} = ${A(inn)}°.`], explanation: A(inn) };
          return { style, sig: `n:${n}`, body: `أوجد عدد أضلاع مضلع منتظم قياس زاويته الداخلية ${A(inn)}°`, ...h.numOptions(R, h.d(n), [h.d(n + 1), h.d(n * 2), h.d(Math.max(3, n - 2))]),
            steps: ["عدد أضلاع المضلع المنتظم = ٣٦٠ ÷ (١٨٠ − الزاوية الداخلية).", `= ٣٦٠ ÷ (١٨٠ − ${A(inn)}) = ٣٦٠ ÷ ${A(ex)} = ${A(n)} أضلاع.`], explanation: A(n) }; }
        const a = R.int(20, 80), b = R.int(20, 80); if (a + b >= 170) return null;
        return { style, sig: `x:${a}${b}`, body: `في مثلث، قياس زاويتين داخليتين ${A(a)}° و ${A(b)}°، فما قياس الزاوية الخارجية المقابلة لهما (عند الرأس الثالث)؟`, ...h.numOptions(R, h.d(a + b), [h.d(180 - a - b), h.d(360 - a - b), h.d(Math.abs(a - b) || 10)]),
          steps: ["الزاوية الخارجية للمثلث = مجموع الزاويتين الداخليتين البعيدتين عنها.", `= ${A(a)} + ${A(b)} = ${A(a + b)}°. (والزاوية الداخلية المجاورة لها ${A(180 - a - b)}° لأن مجموعهما ١٨٠°)`], explanation: A(a + b) };
      } },
      shaded: { title: "المساحات المظللة والكسور (الأسطوانة)", from: 1200, to: 1320, gen(R, h) {
        const A = h.A, style = R.pick(["cyl", "ratio"]);
        if (style === "cyl") { const fr = R.pick([[1, 6, 1, 2], [1, 4, 1, 2], [1, 3, 2, 3], [1, 5, 1, 2], [1, 4, 3, 4], [1, 6, 2, 3]]), [a, b, c, d] = fr; const diff = c / d - a / b, L = R.int(1, 6) * (b * d / (c * b - a * d)) * (c * b - a * d); const V = L / diff;
          if (!Number.isInteger(V) || !Number.isInteger(L)) return null;
          return { style, sig: `c:${fr}:${L}`, body: `أسطوانة مملوءة حتى ${A(a)}/${A(b)} سعتها، فإذا أضفنا ${A(L)} لترات امتلأت إلى ${A(c)}/${A(d)} سعتها، فما سعة الأسطوانة؟`, ...h.numOptions(R, h.d(V), [h.d(L), h.d(L * b), h.d(V / 2)]),
            steps: [`الجزء الذي ملأته اللترات المضافة = ${A(c)}/${A(d)} − ${A(a)}/${A(b)}.`, `= ${A(L)}/${A(V)} من السعة، أي أن ${A(L)} لترات تمثل هذا الجزء.`, `السعة = ${A(L)} ÷ (${A(c)}/${A(d)} − ${A(a)}/${A(b)}) = ${A(V)} لترًا. (ويمكن الحل بالرسم بتقسيم الأسطوانة)`], explanation: A(V) }; }
        const kinds = [["مثلث رأسه على ضلع مستطيل وقاعدته الضلع المقابل", 2], ["مثلث يصل بين منتصفات أضلاع مثلث", 4], ["مربع رؤوسه منتصفات أضلاع مربع، ثم مربع ثالث بالطريقة نفسها داخله (المظلل نصف الثالث)", 8]];
        const [txt, r] = R.pick(kinds), big = R.int(2, 12) * r;
        return { style, sig: `r:${r}:${big}`, body: `مساحة الشكل الكامل ${A(big)} سم²، والجزء المظلل ${txt}. فما مساحة الجزء المظلل؟`, ...h.numOptions(R, h.d(big / r), [h.d(big / 2 === big / r ? big / 4 : big / 2), h.d(big - big / r), h.d(big / r * 3)]),
          steps: [`نسبة المساحة المظللة إلى الشكل الكامل في هذه الحالة ١ : ${A(r)} كما في جدول المحاضرة.`, `المظلل = ${A(big)} ÷ ${A(r)} = ${A(big / r)} سم².`], explanation: A(big / r) };
      } },
      prob: { title: "الاحتمالات", from: 1320, to: 1780, gen(R, h) {
        const A = h.A, style = R.pick(["die", "bag", "total"]), g = (x, y) => y ? g(y, x % y) : x, F = (n, d) => { const k = g(n, d); return `${A(n / k)}/${A(d / k)}`; };
        if (style === "die") { const ev = R.pick([["عدد أولي", [2, 3, 5]], ["عدد زوجي", [2, 4, 6]], ["عدد أكبر من ٤", [5, 6]], ["عدد يقبل القسمة على ٣", [3, 6]], ["عدد أقل من ٣", [1, 2]], ["العدد ٧", []]]);
          const ans = ev[1].length ? F(ev[1].length, 6) : "صفر";
          return { style, sig: `d:${ev[0]}`, body: `ما احتمال ظهور ${ev[0]} عند رمي حجر نرد مرقّم من ١ إلى ٦ مرة واحدة؟`, ...h.strOptions(R, ans, ["١/٦", "١/٢", "١/٣", "٢/٣", "صفر", "١"].filter(x => x !== ans)),
            steps: ["الاحتمال = عدد مرات وقوع الحدث ÷ عدد عناصر فضاء العينة (٦).", ev[1].length ? `النتائج المناسبة: ${ev[1].map(A).join(" ، ")} ← عددها ${A(ev[1].length)}، فالاحتمال ${A(ev[1].length)}/٦ = ${ans}.` : "لا توجد نتيجة مناسبة، فالاحتمال صفر (حدث مستحيل)."], explanation: ans }; }
        if (style === "bag") { const r = R.int(1, 9), b = R.int(1, 9), w = R.int(1, 9), t = r + b + w, ans = F(r, t);
          return { style, sig: `b:${r}${b}${w}`, body: `كيس فيه ${A(r)} كرات حمراء و ${A(b)} زرقاء و ${A(w)} بيضاء، سُحبت كرة عشوائيًا، فما احتمال أن تكون حمراء؟`, ...h.strOptions(R, ans, [F(r, b + w), F(b, t), F(r + 1, t), `${A(r)}/${A(t + 1)}`]),
            steps: [`فضاء العينة = ${A(r)} + ${A(b)} + ${A(w)} = ${A(t)} كرة.`, `احتمال الحمراء = ${A(r)}/${A(t)}${ans !== `${A(r)}/${A(t)}` ? ` = ${ans}` : ""}.`], explanation: ans }; }
        const fr = R.pick([[1, 2, 1, 4], [1, 3, 1, 6], [1, 4, 1, 4], [2, 5, 1, 5], [1, 3, 1, 3]]), [a, b, c, d] = fr, yN = d * b - c * b - a * d, yD = b * d; const k = R.int(2, 9);
        const gy = g(yN, yD), yn = yN / gy, yd = yD / gy, cnt = k * yn, tot = cnt / yn * yd;
        return { style, sig: `t:${fr}:${cnt}`, body: `كيس فيه كرات حمراء وخضراء وصفراء، إذا كان احتمال الخضراء ${A(a)}/${A(b)} واحتمال الحمراء ${A(c)}/${A(d)}، وعدد الكرات الصفراء ${A(cnt)}، فما مجموع الكرات؟`, ...h.numOptions(R, h.d(tot), [h.d(cnt * 2), h.d(tot + cnt), h.d(cnt * yd)]),
          steps: [`احتمال الخضراء والحمراء معًا = ${A(a)}/${A(b)} + ${A(c)}/${A(d)}، فاحتمال الصفراء = ١ − ذلك = ${A(yn)}/${A(yd)}.`, `${A(cnt)} كرة تمثل ${A(yn)}/${A(yd)} من الكرات، فالمجموع = ${A(cnt)} ÷ ${A(yn)} × ${A(yd)} = ${A(tot)} كرة.`], explanation: A(tot) };
      } },
      clock: { title: "زوايا الساعة", from: 1500, to: 1840, gen(R, h) {
        const A = h.A, H = R.int(1, 12), M = R.pick([0, 10, 20, 30, 40, 50, 15, 45]); const raw = Math.abs(30 * H - 5.5 * M), v = raw > 180 ? 360 - raw : raw; if (!Number.isInteger(v)) return null;
        const tt = `${A(H)}:${A(String(M).padStart(2, "0"))}`;
        return { style: "c", sig: `${H}:${M}`, body: `ما قياس الزاوية الصغرى بين عقربي الساعات والدقائق عند الساعة ${tt} ؟`, ...h.numOptions(R, h.d(v), [h.d(360 - v === v ? v + 30 : 360 - v), h.d(Math.abs(30 * H - 6 * M) % 360 || v + 15), h.d(v + 30 > 180 ? v - 30 : v + 30)]),
          steps: ["عقرب الدقائق يتحرك ٦° كل دقيقة، وعقرب الساعات ٣٠° كل ساعة (ونصف درجة كل دقيقة).", `القانون: | الساعات × ٣٠ − الدقائق × ٥,٥ | = | ${A(H)} × ٣٠ − ${A(M)} × ٥,٥ | = | ${A(30 * H)} − ${h.fx(h.mul(h.d(M), h.d("5.5")))} | = ${A(raw)}°.`,
            raw > 180 ? `الناتج أكبر من ١٨٠° فالصغرى = ٣٦٠ − ${A(raw)} = ${A(v)}°.` : `الزاوية الصغرى = ${A(v)}°.`], explanation: A(v) };
      } },
      circle: { title: "الدائرة والمناطق المظللة", from: 1840, to: 2200, gen(R, h) {
        const A = h.A, style = R.pick(["rect", "three", "four", "quarter"]);
        if (style === "rect") { const t0 = R.pick([[6, 8, 10], [3, 4, 5], [5, 12, 13], [12, 16, 20], [8, 15, 17], [9, 12, 15]]), kk = R.int(1, 3), [a, b, c] = t0.map(x => x * kk), r2 = c * c, num = r2 % 4 === 0 ? `${A(r2 / 4)}ط` : `${A(r2)}/٤ ط`, ans = `${num} − ${A(a * b)}`;
          return { style, sig: `r:${a}${b}`, body: `مستطيل بعداه ${A(a)} سم و ${A(b)} سم مرسوم داخل دائرة تمر برؤوسه، فما مساحة المنطقة داخل الدائرة وخارج المستطيل؟`, ...h.strOptions(R, ans, [`${A(r2)}ط − ${A(a * b)}`, `${A(c)}ط − ${A(a * b)}`, `${num} + ${A(a * b)}`, `${A(a * b)} − ${num}`]),
            steps: ["قطر الدائرة هو نفسه قطر المستطيل.", `قطر المستطيل من فيثاغورث (${A(a)}، ${A(b)}، ${A(c)}) = ${A(c)}، فنصف القطر = ${h.fx(h.div(h.d(c), h.d(2)))}.`, `مساحة الدائرة = ط نق² = ${num}، ومساحة المستطيل = ${A(a * b)}.`, `المطلوب = ${ans} سم².`], explanation: ans }; }
        if (style === "three") { const r1 = R.int(1, 6), r2 = R.int(r1, 9), Rr = r1 + r2, sh = Rr * Rr - r1 * r1 - r2 * r2, ask = R.pick(["area", "ratio"]);
          if (ask === "area") return { style, sig: `t:${r1}${r2}a`, body: `دائرتان نصفا قطريهما ${A(r1)} و ${A(r2)} متماستان داخل دائرة كبرى تمسهما ويمر قطرها بمركزيهما، فما مساحة المنطقة المظللة (داخل الكبرى وخارج الصغيرتين)؟`,
            ...h.strOptions(R, `${A(sh)}ط`, [`${A(Rr * Rr)}ط`, `${A(r1 * r1 + r2 * r2)}ط`, `${A(sh + 2)}ط`, `${A(Rr)}ط`]),
            steps: [`نصف قطر الكبرى = ${A(r1)} + ${A(r2)} = ${A(Rr)}.`, `الكبرى = ${A(Rr * Rr)}ط ، والصغيرتان = ${A(r1 * r1)}ط + ${A(r2 * r2)}ط.`, `المظلل = ${A(Rr * Rr)}ط − ${A(r1 * r1 + r2 * r2)}ط = ${A(sh)}ط.`], explanation: `${A(sh)}ط` };
          const g = (x, y) => y ? g(y, x % y) : x, k = g(r1 * r1, sh), ans = `${A(r1 * r1 / k)} : ${A(sh / k)}`;
          return { style, sig: `t:${r1}${r2}r`, body: `دائرتان نصفا قطريهما ${A(r1)} و ${A(r2)} متماستان داخل دائرة كبرى تمسهما ويمر قطرها بمركزيهما، فما نسبة مساحة الدائرة الصغرى (نصف قطرها ${A(r1)}) إلى المنطقة المظللة؟`,
            ...h.strOptions(R, ans, [`${A(sh / k)} : ${A(r1 * r1 / k)}`, `${A(r1)} : ${A(Rr)}`, `١ : ${A(Rr * Rr)}`, `${A(r1 * r1)} : ${A(Rr * Rr)}`]),
            steps: [`الكبرى ${A(Rr * Rr)}ط، والمظلل = ${A(Rr * Rr)}ط − (${A(r1 * r1)}ط + ${A(r2 * r2)}ط) = ${A(sh)}ط.`, `النسبة = ${A(r1 * r1)}ط : ${A(sh)}ط = ${ans}.`], explanation: ans }; }
        if (style === "four") { const r = R.int(1, 12), s = 2 * r, ans = `${A(s * s)} − ${A(r * r)}ط`;
          return { style, sig: `f:${r}`, body: `أربع دوائر متطابقة ومتماسة مثنى مثنى، نصف قطر كل منها ${A(r)} سم، فما مساحة المنطقة المحصورة بينها؟`, ...h.strOptions(R, ans, [`${A(s * s)} − ${A(4 * r * r)}ط`, `${A(r * r)}ط − ${A(s * s)}`, `${A(4 * r * r)} − ${A(r * r)}ط` === ans ? `${A(s * s)} + ${A(r * r)}ط` : `${A(4 * r * r)} − ${A(r * r)}ط`, `${A(s)} − ط`]),
            steps: [`بوصل مراكز الدوائر نحصل على مربع طول ضلعه ${A(s)} سم.`, `المظلل = مساحة المربع − مساحة دائرة كاملة (أربعة أرباع) = ${A(s * s)} − ط × ${A(r)}² = ${ans}.`], explanation: ans }; }
        const r = R.int(1, 20) * 2, ans = `${A(2 * r)} + ${A(r / 2)}ط`;
        return { style, sig: `q:${r}`, body: `شكل ربع دائرة طول نصف قطرها ${A(r)} سم، فما محيط الشكل؟`, ...h.strOptions(R, ans, [`${A(r / 2)}ط`, `${A(r)} + ${A(r / 2)}ط`, `${A(2 * r)} + ${A(2 * r)}ط`, `${A(2 * r)} + ${A(r)}ط`]),
          steps: ["محيط ربع الدائرة = نصف القطر + نصف القطر + ربع محيط الدائرة.", `محيط الدائرة = ٢ ط نق = ${A(2 * r)}ط ، وربعه = ${A(r / 2)}ط.`, `المحيط = ${A(r)} + ${A(r)} + ${A(r / 2)}ط = ${ans} سم.`], explanation: ans };
      } },
      speed: { title: "السرعات (المسافة = السرعة × الزمن)", from: 2240, to: 2676, gen(R, h) {
        const A = h.A, style = R.pick(["basic", "avg", "opp", "chase", "laps"]);
        if (style === "basic") { const v = R.int(4, 24) * 5, t = R.int(2, 9), d = v * t;
          return { style, sig: `b:${v}${t}`, body: `قطعت سيارة مسافة ${A(d)} كم في ${A(t)} ساعات، فما سرعتها؟`, ...h.numOptions(R, h.d(v), [h.d(d * t), h.d(v + 10), h.d(d / (t + 1) | 0 || v - 5)]),
            steps: ["مثلث السرعة: المسافة = السرعة × الزمن، فالسرعة = المسافة ÷ الزمن.", `السرعة = ${A(d)} ÷ ${A(t)} = ${A(v)} كم/س.`], explanation: A(v) }; }
        if (style === "avg") { const [v1, v2] = R.pick([[60, 40], [30, 20], [60, 30], [90, 60], [40, 10], [80, 20], [75, 50], [120, 80], [12, 6], [20, 5]]), av = 2 * v1 * v2 / (v1 + v2);
          return { style, sig: `a:${v1}${v2}`, body: `يذهب أحمد إلى عمله بسرعة ${A(v1)} كم/س ويعود بالطريق نفسه بسرعة ${A(v2)} كم/س، فما سرعته المتوسطة ذهابًا وإيابًا؟`, ...h.numOptions(R, h.d(av), [h.d((v1 + v2) / 2), h.d(v1 - v2), h.d(av + 5)]),
            steps: ["السرعة المتوسطة لمسافتين متساويتين = (٢ × حاصل ضرب السرعتين) ÷ مجموعهما، وليست متوسط السرعتين.", `= (٢ × ${A(v1)} × ${A(v2)}) ÷ (${A(v1)} + ${A(v2)}) = ${A(2 * v1 * v2)} ÷ ${A(v1 + v2)} = ${A(av)} كم/س.`], explanation: A(av) }; }
        if (style === "opp") { const v1 = R.int(20, 60), v2 = R.int(20, 60), t = R.int(2, 12), d = (v1 + v2) * t;
          return { style, sig: `o:${v1}${v2}${t}`, body: `تسير سيارتان في اتجاهين متعاكسين، سرعة الأولى ${A(v1)} كم/س وسرعة الثانية ${A(v2)} كم/س، فكم ساعة تحتاجان لتصبح المسافة بينهما ${A(d)} كم؟`, ...h.numOptions(R, h.d(t), [h.d(t * 2), h.d(t + 1), h.d(Math.round(d / Math.abs(v1 - v2 || 1)) % 97 || t + 3)]),
            steps: ["في الاتجاهين المتعاكسين نجمع السرعتين.", `السرعة = ${A(v1)} + ${A(v2)} = ${A(v1 + v2)} كم/س.`, `الزمن = ${A(d)} ÷ ${A(v1 + v2)} = ${A(t)} ساعات.`], explanation: A(t) }; }
        if (style === "chase") { const v2 = R.int(3, 9), v1 = v2 + R.int(1, 4), t = R.int(10, 80), gap = (v1 - v2) * t;
          return { style, sig: `c:${v1}${v2}${gap}`, body: `كلب يلاحق أرنبًا والمسافة بينهما ${A(gap)} قدمًا، والكلب يقفز ${A(v1)} أقدام في الثانية والأرنب ${A(v2)} أقدام في الثانية، فبعد كم ثانية يلحق الكلب بالأرنب؟`, ...h.numOptions(R, h.d(t), [h.d(Math.round(gap / (v1 + v2)) || t + 2), h.d(gap), h.d(t * 2)]),
            steps: ["زمن اللحاق = المسافة بينهما ÷ الفرق بين السرعتين.", `= ${A(gap)} ÷ (${A(v1)} − ${A(v2)}) = ${A(gap)} ÷ ${A(v1 - v2)} = ${A(t)} ثانية.`], explanation: A(t) }; }
        const laps = R.int(10, 40), per = R.int(1, 5) * 100, mins = R.pick([30, 45, 60, 90, 100, 120]), D = laps * per, v = D / mins; if (!Number.isInteger(v)) return null;
        return { style, sig: `l:${laps}${per}${mins}`, body: `يقطع رجل ${A(laps)} دورة في ${A(mins)} دقيقة حول ملعب محيطه ${A(per)} م، فما سرعة الرجل بالمتر في الدقيقة؟`, ...h.numOptions(R, h.d(v), [h.d(D), h.d(per / mins * 10 | 0 || v + 10), h.d(v * 2)]),
          steps: [`المسافة = المحيط × عدد الدورات = ${A(per)} × ${A(laps)} = ${A(D)} م.`, `السرعة = المسافة ÷ الزمن = ${A(D)} ÷ ${A(mins)} = ${A(v)} م/دقيقة.`], explanation: A(v) };
      } }
    }
  };
})();
