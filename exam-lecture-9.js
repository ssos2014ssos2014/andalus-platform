// المحاضرة 9: التوازي، معادلة الدائرة، المكعب ومتوازي المستطيلات، المجسمات، الوسيط والمنوال، القطاعات الدائرية، النسبة المئوية
(() => {
  window.EXAMS[9] = {
    title: "اختبار محاكي: الهندسة والمجسمات والإحصاء والنسبة المئوية", minutes: 25,
    blueprint: [["parallel", 2], ["circleEq", 2], ["cube", 3], ["cuboid", 2], ["solids", 2], ["medMode", 2], ["pie", 1], ["pctBasic", 2], ["phones", 2], ["successive", 3], ["sqArea", 1], ["cuts", 2]],
    skills: {
      parallel: { title: "الزوايا والمستقيمات المتوازية", from: 0, to: 280, gen(R, h) {
        const A = h.A, style = R.pick(["zig", "co", "alt"]);
        if (style === "zig") { const a = R.int(20, 80), b = R.int(20, 80);
          return { style, sig: `z:${a}:${b}`, body: `مستقيمان متوازيان، وبينهما نقطة رُسم منها قطعتان إلى المستقيمين فكوّنتا زاوية س، فإذا كانت الزاوية بين القطعة الأولى والمستقيم الأعلى ${A(a)}° وبين الثانية والمستقيم الأسفل ${A(b)}°، فما قيمة س؟`, ...h.numOptions(R, h.d(a + b), [h.d(180 - a - b), h.d(Math.abs(a - b) || 10), h.d(360 - a - b)]),
            steps: ["نرسم من رأس الزاوية مستقيمًا موازيًا للمستقيمين.", `فتنقسم س إلى زاويتين متبادلتين داخليًا مع ${A(a)}° و ${A(b)}°.`, `س = ${A(a)} + ${A(b)} = ${A(a + b)}°.`], explanation: A(a + b) }; }
        const a = R.int(30, 150); if (a === 90) return null;
        if (style === "co") return { style, sig: `c:${a}`, body: `مستقيمان متوازيان قطعهما مستقيم ثالث، فإذا كانت إحدى الزاويتين الداخليتين الواقعتين في جهة واحدة من القاطع ${A(a)}°، فما قياس الأخرى؟`, ...h.numOptions(R, h.d(180 - a), [h.d(a), h.d(360 - a), h.d(90 - a / 2 | 0 || a + 10)]),
          steps: ["الزاويتان الداخليتان في جهة واحدة من القاطع متكاملتان (مجموعهما ١٨٠°).", `الأخرى = ١٨٠ − ${A(a)} = ${A(180 - a)}°.`], explanation: A(180 - a) };
        return { style, sig: `a:${a}`, body: `مستقيمان متوازيان قطعهما مستقيم ثالث، فإذا كانت إحدى الزوايا ${A(a)}°، فما قياس الزاوية المتبادلة معها داخليًا؟`, ...h.numOptions(R, h.d(a), [h.d(180 - a), h.d(360 - a), h.d(a / 2 | 0 || a + 5)]),
          steps: ["الزوايا المتبادلة داخليًا متطابقة (وكذلك المتناظرة والمتبادلة خارجيًا).", `الزاوية المطلوبة = ${A(a)}°.`], explanation: A(a) };
      } },
      circleEq: { title: "معادلة الدائرة", from: 280, to: 440, gen(R, h) {
        const A = h.A, S = x => x < 0 ? `+ ${A(-x)}` : `− ${A(x)}`, style = R.pick(["write", "area"]);
        if (style === "write") { const l = R.int(-6, 6), k = R.int(-6, 6), r = R.int(2, 9); if (!l || !k) return null;
          const ans = `(س ${S(l)})² + (ص ${S(k)})² = ${A(r * r)}`, neg = x => x < 0 ? `−${A(-x)}` : A(x);
          return { style, sig: `w:${l}:${k}:${r}`, body: `اكتب معادلة الدائرة التي مركزها (${neg(l)} ، ${neg(k)}) ونصف قطرها ${A(r)} سم.`,
            ...h.strOptions(R, ans, [`(س ${S(-l)})² + (ص ${S(-k)})² = ${A(r * r)}`, `(س ${S(l)})² + (ص ${S(k)})² = ${A(r)}`, `(س ${S(k)})² + (ص ${S(l)})² = ${A(r * r)}`]),
            steps: ["الصورة العامة: (س − ل)² + (ص − ك)² = نق² حيث (ل ، ك) المركز.", `نعوّض ل = ${neg(l)} و ك = ${neg(k)} و نق² = ${A(r * r)}، مع الانتباه للإشارة: س − (${neg(l)}).`, `المعادلة: ${ans}.`], explanation: ans }; }
        const c = R.pick([2, 3, 4]), r2 = c * R.int(2, 12), rhs = r2 / c;
        return { style, sig: `a:${c}:${r2}`, body: `أوجد مساحة الدائرة التي معادلتها: ${c === 2 ? "½" : c === 3 ? "⅓" : "¼"} س² + ${c === 2 ? "½" : c === 3 ? "⅓" : "¼"} ص² = ${A(rhs)}`,
          ...h.strOptions(R, `${A(r2)}ط`, [`${A(rhs)}ط`, `${A(r2 * r2)}ط`, `${A(2 * r2)}ط`]),
          steps: [`نضرب طرفي المعادلة في ${A(c)}: س² + ص² = ${A(r2)} ، أي نق² = ${A(r2)}.`, `المساحة = ط نق² = ${A(r2)}ط.`], explanation: `${A(r2)}ط` };
      } },
      cube: { title: "المكعب", from: 440, to: 640, gen(R, h) {
        const A = h.A, l = R.int(2, 9), style = R.pick(["edges", "diag", "area", "vol"]);
        if (style === "edges") return { style, sig: `e:${l}`, body: `مكعب مجموع أطوال أحرفه ${A(12 * l)} سم، فما حجمه؟`, ...h.numOptions(R, h.d(l ** 3), [h.d(6 * l * l), h.d(l * l), h.d((12 * l) ** 2 / 12 | 0)]),
          steps: ["للمكعب ١٢ حرفًا متساوية.", `طول الحرف = ${A(12 * l)} ÷ ١٢ = ${A(l)} سم.`, `الحجم = ل³ = ${A(l)} × ${A(l)} × ${A(l)} = ${A(l ** 3)} سم³.`], explanation: A(l ** 3) };
        if (style === "diag") return { style, sig: `d:${l}`, body: `مكعب طول قطر أحد أوجهه ${h.rad(l, 2)} سم، فما حجمه؟`, ...h.numOptions(R, h.d(l ** 3), [h.d(2 * l ** 3), h.d(l * l), h.d(6 * l * l)]),
          steps: ["الوجه مربع، وقطر المربع = طول الضلع × √٢.", `إذن طول الحرف = ${A(l)} سم.`, `الحجم = ${A(l)}³ = ${A(l ** 3)} سم³.`], explanation: A(l ** 3) };
        if (style === "area") return { style, sig: `a:${l}`, body: `مكعب طول حرفه ${A(l)} سم، فما مساحته الكلية؟`, ...h.numOptions(R, h.d(6 * l * l), [h.d(4 * l * l), h.d(l ** 3), h.d(12 * l)]),
          steps: ["للمكعب ٦ أوجه مربعة متطابقة.", `المساحة الكلية = ٦ ل² = ٦ × ${A(l * l)} = ${A(6 * l * l)} سم².`, "(أما المساحة الجانبية فهي ٤ ل²)."], explanation: A(6 * l * l) };
        return { style, sig: `v:${l}`, body: `مكعب حجمه ${A(l ** 3)} سم³، فما مساحته الجانبية؟`, ...h.numOptions(R, h.d(4 * l * l), [h.d(6 * l * l), h.d(l * l), h.d(4 * l)]),
          steps: [`طول الحرف = الجذر التكعيبي لـ${A(l ** 3)} = ${A(l)} سم.`, `المساحة الجانبية = ٤ ل² = ٤ × ${A(l * l)} = ${A(4 * l * l)} سم².`], explanation: A(4 * l * l) };
      } },
      cuboid: { title: "متوازي المستطيلات", from: 640, to: 760, gen(R, h) {
        const A = h.A, style = R.pick(["vol", "lat", "cubeFrac"]);
        if (style === "cubeFrac") { const e = R.int(2, 6), f = R.pick([2, 4, 8]), V = e ** 3 * f, dims = R.shuffle([e, e * (f === 8 ? 2 : 1), e * (f === 2 ? 2 : f === 4 ? 4 : 4)]);
          const prod = dims[0] * dims[1] * dims[2]; if (prod !== V) return null;
          return { style, sig: `f:${dims.join("x")}:${f}`, body: `حجم مكعب يساوي ${f === 2 ? "½" : f === 4 ? "¼" : "⅛"} حجم متوازي مستطيلات أبعاده ${dims.map(A).join(" × ")} سم، فما طول حرف المكعب؟`, ...h.numOptions(R, h.d(e), [h.d(e * 2), h.d(e ** 2), h.d(e + 1)]),
            steps: [`حجم متوازي المستطيلات = ${dims.map(A).join(" × ")} = ${A(V)} سم³.`, `حجم المكعب = ${A(V)} ÷ ${A(f)} = ${A(V / f)} سم³.`, `طول الحرف = الجذر التكعيبي لـ${A(V / f)} = ${A(e)} سم.`], explanation: A(e) }; }
        const a = R.int(2, 10), b = R.int(2, 10), c = R.int(2, 10);
        if (style === "lat") return { style, sig: `l:${a}${b}${c}`, body: `متوازي مستطيلات طول قاعدته ${A(a)} سم وعرضها ${A(b)} سم وارتفاعه ${A(c)} سم، فما مساحته الجانبية؟`, ...h.numOptions(R, h.d(2 * (a + b) * c), [h.d(a * b * c), h.d(2 * (a * b + b * c + a * c)), h.d((a + b) * c)]),
          steps: ["المساحة الجانبية = محيط القاعدة × الارتفاع.", `= ٢ × (${A(a)} + ${A(b)}) × ${A(c)} = ${A(2 * (a + b))} × ${A(c)} = ${A(2 * (a + b) * c)} سم².`], explanation: A(2 * (a + b) * c) };
        return { style, sig: `v:${a}${b}${c}`, body: `متوازي مستطيلات أبعاده ${A(a)} سم و ${A(b)} سم و ${A(c)} سم، فما حجمه؟`, ...h.numOptions(R, h.d(a * b * c), [h.d(a + b + c), h.d(2 * (a * b + b * c + a * c)), h.d(a * b)]),
          steps: ["الحجم = الطول × العرض × الارتفاع.", `= ${A(a)} × ${A(b)} × ${A(c)} = ${A(a * b * c)} سم³.`], explanation: A(a * b * c) };
      } },
      solids: { title: "الأسطوانة والمخروط والكرة", from: 760, to: 900, gen(R, h) {
        const A = h.A, r = R.int(1, 9), hh = R.int(2, 12), style = R.pick(["cylV", "cylL", "coneV", "sphA"]);
        const v = { cylV: [r * r * hh, `حجم أسطوانة نصف قطر قاعدتها ${A(r)} سم وارتفاعها ${A(hh)} سم`, "الحجم = ط نق² × ع", `ط × ${A(r * r)} × ${A(hh)}`],
          cylL: [2 * r * hh, `المساحة الجانبية لأسطوانة نصف قطر قاعدتها ${A(r)} سم وارتفاعها ${A(hh)} سم`, "المساحة الجانبية = ٢ ط نق × ع", `٢ × ط × ${A(r)} × ${A(hh)}`],
          coneV: [r * r * hh / 3, `حجم مخروط نصف قطر قاعدته ${A(r)} سم وارتفاعه ${A(hh)} سم`, "حجم المخروط = ⅓ ط نق² × ع", `⅓ × ط × ${A(r * r)} × ${A(hh)}`],
          sphA: [4 * r * r, `مساحة سطح كرة نصف قطرها ${A(r)} سم`, "مساحة سطح الكرة = ٤ ط نق²", `٤ × ط × ${A(r * r)}`] }[style];
        if (!Number.isInteger(v[0])) return null;
        const ans = `${A(v[0])}ط`;
        return { style, sig: `${style}:${r}:${hh}`, body: `ما ${v[1]}؟`, ...h.strOptions(R, ans, [`${A(v[0] * 2)}ط`, `${A(style === "sphA" ? r * r : r * hh)}ط`, `${A(v[0] + r)}ط`, `${A(v[0] * 3)}ط`]),
          steps: [`القانون: ${v[2]}.`, `= ${v[3]} = ${ans}.`], explanation: ans };
      } },
      medMode: { title: "الوسيط والمنوال", from: 900, to: 1000, gen(R, h) {
        const A = h.A, style = R.pick(["median", "medianEven", "mode"]);
        if (style === "mode") { const m = R.int(2, 30), xs = R.shuffle([m, m, ...Array.from({ length: 4 }, () => R.int(1, 40)).filter(x => x !== m)]);
          if (new Set(xs.filter(x => x !== m)).size !== xs.length - 2) return null;
          return { style, sig: `m:${xs.join(",")}`, body: `أوجد المنوال للأعداد: ${xs.map(A).join(" ، ")}`, ...h.numOptions(R, h.d(m), xs.filter(x => x !== m).slice(0, 3).map(x => h.d(x))),
            steps: ["المنوال هو القيمة الأكثر تكرارًا.", `${A(m)} تكررت مرتين، وباقي القيم مرة واحدة، فالمنوال ${A(m)}.`], explanation: A(m) }; }
        const n = style === "median" ? 5 : 6, xs = [...new Set(Array.from({ length: 12 }, () => R.int(1, 50)))].slice(0, n); if (xs.length < n) return null;
        const sorted = [...xs].sort((a, b) => a - b), med = n % 2 ? h.d(sorted[2]) : h.div(h.d(sorted[2] + sorted[3]), h.d(2));
        return { style, sig: `d:${xs.join(",")}`, body: `أوجد الوسيط للأعداد: ${xs.map(A).join(" ، ")}`, ...h.numOptions(R, med, [...new Set([xs[Math.floor(n / 2)], sorted[1], sorted[n - 2], sorted[n - 1], sorted[0]])].filter(x => !h.eq(h.d(x), med)).slice(0, 3).map(x => h.d(x))),
          steps: ["الوسيط: القيمة التي تتوسط الأعداد بعد ترتيبها.", `بعد الترتيب: ${sorted.map(A).join(" ، ")}.`, n % 2 ? `العدد الأوسط هو ${h.fx(med)}.` : `عدد القيم زوجي، فنأخذ العددين الأوسطين (${A(sorted[2])} و ${A(sorted[3])}) ونقسم مجموعهما على ٢: ${h.fx(med)}.`], explanation: h.fx(med) };
      } },
      pie: { title: "القطاعات الدائرية (الزاوية المركزية)", from: 1000, to: 1100, gen(R, h) {
        const A = h.A, total = R.pick([90, 120, 180, 360, 240, 60]), part = total * R.pick([1, 2, 3, 4, 5, 6]) / 12, ang = part / total * 360;
        if (!Number.isInteger(part) || !Number.isInteger(ang)) return null;
        return { style: "p", sig: `${total}:${part}`, body: `مدرسة فيها ${A(total)} طالبًا، منهم ${A(part)} حصلوا على تقدير «ممتاز»، فإذا مُثّلت التقديرات بالقطاعات الدائرية، فما قياس زاوية قطاع «ممتاز»؟`,
          ...h.numOptions(R, h.d(ang), [h.d(part), h.d(360 - ang), h.d(ang / 2 | 0 || ang + 10)]),
          steps: ["قياس الزاوية المركزية للقطاع = (التكرار ÷ مجموع التكرارات) × ٣٦٠°.", `= (${A(part)} ÷ ${A(total)}) × ٣٦٠ = ${A(ang)}°.`], explanation: A(ang) };
      } },
      pctBasic: { title: "النسبة المئوية ونسبة الزيادة", from: 1100, to: 1300, gen(R, h) {
        const A = h.A, style = R.pick(["inc", "dec", "of"]);
        if (style === "of") { const p = R.pick([5, 10, 20, 25, 40, 50]), n = R.int(2, 60) * (100 / p) * (p === 40 ? 5 : 1), part = n * p / 100; if (!Number.isInteger(part)) return null;
          return { style, sig: `o:${p}:${part}`, body: `إذا كان ${A(p)}٪ من عدد ما هو ${A(part)}، فما العدد؟`, ...h.numOptions(R, h.d(n), [h.d(part * p), h.d(part + p), h.d(n / 2)]),
            steps: ["العدد = الجزء × ١٠٠ ÷ النسبة.", `= ${A(part)} × ١٠٠ ÷ ${A(p)} = ${A(n)}.`], explanation: A(n) }; }
        const old = R.pick([200, 250, 400, 500, 625, 800, 1000, 125]), p = R.pick([2, 4, 5, 8, 10, 20, 25, 40]), d = old * p / 100; if (!Number.isInteger(d)) return null;
        const nw = style === "inc" ? old + d : old - d;
        return { style, sig: `${style}:${old}:${p}`, body: `كان سعر سلعة ${A(old)} ريال، ثم ${style === "inc" ? "ارتفع" : "انخفض"} إلى ${A(nw)} ريال، فما نسبة ${style === "inc" ? "الزيادة" : "الانخفاض"}؟`,
          ...h.strOptions(R, `${A(p)}٪`, [`${A(d)}٪`, `${A(p * 2)}٪`, `${h.fx(h.div(h.d(d * 100), h.d(nw)) || h.d(p + 1))}٪`, `${A(p + 5)}٪`]),
          steps: [`مقدار ${style === "inc" ? "الزيادة" : "الانخفاض"} = ${A(Math.max(old, nw))} − ${A(Math.min(old, nw))} = ${A(d)}.`, `النسبة = (مقدار التغير ÷ السعر الأصلي) × ١٠٠ = ${A(d)} ÷ ${A(old)} × ١٠٠ = ${A(p)}٪.`, "تنبيه: نقسم على السعر الأصلي (قبل التغيير) لا الجديد."], explanation: `${A(p)}٪` };
      } },
      phones: { title: "مسائل الخصومات المتعددة (الجوالات)", from: 1300, to: 1700, gen(R, h) {
        const A = h.A, d1 = R.pick([50, 25, 20, 10]), d2 = R.pick([25, 50, 20, 40].filter(x => x !== d1)), x = R.int(4, 40) * 20;
        const tot = x + x * (100 - d1) / 100 + x * (100 - d2) / 100; if (!Number.isInteger(tot)) return null;
        const f = (300 - d1 - d2) / 100;
        return { style: "p", sig: `${d1}:${d2}:${x}`, body: `اشترى محمد ٣ جوالات متماثلة: الأول بكامل السعر، والثاني بخصم ${A(d1)}٪، والثالث بخصم ${A(d2)}٪، فدفع ${A(tot)} ريال، فكم سعر الجوال الأول؟`,
          ...h.numOptions(R, h.d(x), [h.d(Math.round(tot / 3)), h.d(x + 20), h.d(Math.round(tot / 2))]),
          steps: [`نفرض السعر س: س + ${A(100 - d1)}٪ س + ${A(100 - d2)}٪ س = ${A(tot)}.`, `${h.fx(h.d(f.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")))} س = ${A(tot)} ← س = ${A(tot)} ÷ ${h.fx(h.d(f.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")))} = ${A(x)}.`, "ويمكن تجريب الخيارات: نأخذ كل خيار ونحسب المبلغ الكلي ونقارنه."], explanation: A(x) };
      } },
      successive: { title: "النسب المئوية المتتالية", from: 1700, to: 1900, gen(R, h) {
        const A = h.A, style = R.pick(["dd", "ii", "restore"]);
        if (style === "restore") { const p = R.pick([20, 50, 60, 75, 80]), back = h.div(h.d(p * 100), h.d(100 - p));
          return { style, sig: `r:${p}`, body: `خفّض تاجر جميع أسعاره ${A(p)}٪ مدة شهر، فإذا أراد أن يعيد الأسعار الأصلية، فبكم في المئة يزيد الأسعار الجديدة؟`, ...h.strOptions(R, `${h.fx(back)}٪`, [`${A(p)}٪`, `${A(100 - p)}٪`, `${A(p * 2)}٪`]),
            steps: ["نفرض السعر الأصلي ١٠٠ ريال.", `بعد التخفيض يصبح ${A(100 - p)} ريال، ونحتاج زيادة ${A(p)} ريال لنعود إلى ١٠٠.`, `نسبة الزيادة = ${A(p)} ÷ ${A(100 - p)} × ١٠٠ = ${h.fx(back)}٪ (لأن النسبة تحسب من السعر الجديد الأصغر).`], explanation: `${h.fx(back)}٪` }; }
        const a = R.pick([10, 20, 30, 50]), b = R.pick([10, 20, 25, 50]), inc = style === "ii";
        const net = inc ? a + b + a * b / 100 : a + b - a * b / 100;
        if (!Number.isInteger(net * 10)) return null;
        const N = h.d(String(net));
        return { style, sig: `${style}:${a}:${b}`, body: `${inc ? "رُفع" : "خُفّض"} سعر سلعة ${A(a)}٪ ثم ${inc ? "رُفع" : "خُفّض"} السعر الجديد ${A(b)}٪، فما نسبة ${inc ? "الزيادة" : "التخفيض"} الكلية؟`,
          ...h.strOptions(R, `${h.fx(N)}٪`, [`${A(a + b)}٪`, `${A(Math.abs(a - b) || a + b + 5)}٪`, `${h.fx(h.add(N, h.d(inc ? 2 : -2)))}٪`]),
          steps: ["النسب المتتالية لا تُجمع مباشرة، لأن الثانية تُحسب من السعر الجديد.", `نفرض السعر ١٠٠: بعد ${A(a)}٪ يصبح ${A(inc ? 100 + a : 100 - a)}، ثم ${A(b)}٪ منه = ${h.fx(h.d(String((inc ? 100 + a : 100 - a) * b / 100)))}.`, `السعر النهائي = ${h.fx(h.d(String(inc ? 100 + net : 100 - net)))}، فالنسبة الكلية = ${h.fx(N)}٪.`], explanation: `${h.fx(N)}٪` };
      } },
      sqArea: { title: "نسبة الزيادة في مساحة المربع", from: 1900, to: 2000, gen(R, h) {
        const A = h.A, k = R.pick([2, 3, 4]), inc = (k * k - 1) * 100;
        const how = { 2: "ضاعفنا طول ضلعه (صار مثليه)", 3: "زدنا طول ضلعه بمقدار ضعفه (صار ثلاثة أمثاله)", 4: "صار طول ضلعه أربعة أمثاله" }[k];
        return { style: "s", sig: `${k}`, body: `مربع ${how}، فما النسبة المئوية للزيادة في مساحته؟`, ...h.strOptions(R, `${A(inc)}٪`, [`${A((k - 1) * 100)}٪`, `${A(k * k * 100)}٪`, `${A(k * 100)}٪`]),
          steps: ["نفرض طول الضلع ٢، فالمساحة ٤.", `بعد التغيير يصبح الضلع ${A(2 * k)} والمساحة ${A(4 * k * k)}.`, `الزيادة = ${A(4 * k * k - 4)}، ونسبتها = ${A(4 * k * k - 4)} ÷ ٤ × ١٠٠ = ${A(inc)}٪.`], explanation: `${A(inc)}٪` };
      } },
      cuts: { title: "قطع لوح الخشب (عدد القطع وعدد مرات القطع)", from: 2000, to: 2310, gen(R, h) {
        const A = h.A, p1 = R.int(3, 8), t = R.int(2, 9), T1 = (p1 - 1) * t, p2 = R.int(p1 + 1, 12), T2 = (p2 - 1) * t;
        return { style: "c", sig: `${p1}:${t}:${p2}`, body: `يحتاج نجّار ${A(T1)} دقيقة لقطع لوح من الخشب إلى ${A(p1)} قطع، فكم دقيقة يحتاج لقطع لوح مماثل إلى ${A(p2)} قطع؟`,
          ...h.numOptions(R, h.d(T2), [h.d(T1 / p1 * p2 | 0 || T2 + t), h.d(T2 + t), h.d(T2 - t)]),
          steps: [`عدد مرات القطع = عدد القطع − ١، فلعمل ${A(p1)} قطع نقطع ${p1 - 1 === 2 ? "مرتين" : A(p1 - 1) + " مرات"}.`, `زمن القطعة الواحدة = ${A(T1)} ÷ ${A(p1 - 1)} = ${A(t)} دقائق.`, `لعمل ${A(p2)} قطع نقطع ${A(p2 - 1)} مرات: ${A(p2 - 1)} × ${A(t)} = ${A(T2)} دقيقة.`], explanation: A(T2) };
      } }
    }
  };
})();
