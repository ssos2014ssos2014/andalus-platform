// المحاضرة 1: العمليات على الأعداد العشرية
// كل مهارة مربوطة بالدقائق التي شُرحت فيها داخل المقطع (from/to بالثواني)
(() => {
  const L = ["الآحاد", "الأجزاء من عشرة", "الأجزاء من مئة", "الأجزاء من ألف"];
  const NAMES = ["أحمد", "سعد", "خالد", "فهد", "عبدالله", "محمد", "علي", "يوسف", "فيصل", "سلمان"];
  const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
  const R1 = "قاعدة ١: ضع الفواصل تحت بعضها وأكمل الخانات الناقصة بأصفار ثم اجمع.";
  const R2 = "قاعدة ٢: عند طرح عشري من عدد صحيح اطرح كل رقم من ٩ والرقم الأخير من ١٠، ويقل الصحيح ١.";
  const R3 = "قاعدة ٣: اضرب بدون فواصل، ثم عُدّ الأرقام بعد الفواصل في كل الأعداد وضع الفاصلة بعددها.";

  window.EXAMS[1] = {
    title: "اختبار محاكي: العمليات على الأعداد العشرية",
    minutes: 25,
    blueprint: [["align", 2], ["series", 2], ["addsub", 2], ["fromWhole", 2], ["multiSub", 2], ["mult", 3], ["powers", 2],
      ["cmpPad", 2], ["cmpProduct", 2], ["square5", 1], ["bill", 2], ["daily", 1], ["container", 1]],
    skills: {
      // ---------------------------------------------------------------
      align: { title: "جمع الأعداد العشرية بمحاذاة الفاصلة", from: 0, to: 210, gen(R, h) {
        const s1 = R.int(1, 2), s2 = s1 === 1 ? 2 : R.pick([1, 2]);
        const a = R.dec(1, 9, s1), b = R.dec(1, 9, s2);
        if (a.s === b.s && R.next() < .6) return null; // نفضّل اختلاف عدد المنازل لاختبار المحاذاة
        const sum = h.add(a, b);
        // الخطأ الشائع: محاذاة الأرقام من اليمين بدل الفاصلة
        const mis = h.add(a.s >= b.s ? a : h.shift(a, b.s - a.s), a.s >= b.s ? h.shift(b, a.s - b.s) : b);
        const style = R.pick(["direct", "x", "story"]);
        const name = R.pick(NAMES);
        const body = style === "direct" ? `ما ناتج ${h.fx(a)} + ${h.fx(b)} ؟`
          : style === "x" ? `إذا كان س − ${h.fx(b)} = ${h.fx(a)} ، فما قيمة س ؟`
          : `اشترى ${name} كتابًا بـ ${h.fx(a)} ريال وقلمًا بـ ${h.fx(b)} ريال، فكم دفع؟`;
        return { style, sig: `${style}:${h.str(a)}+${h.str(b)}`, body, ...h.numOptions(R, sum, [mis, h.add(sum, h.d("0.1")), h.shift(sum, -1)]),
          explanation: `${R1} ${h.pad(a, Math.max(a.s, b.s))} + ${h.pad(b, Math.max(a.s, b.s))} = ${h.fx(sum)}` };
      } },
      // ---------------------------------------------------------------
      series: { title: "جمع متسلسلة المنازل (٧ + ٠,٧ + ٠,٠٧ …)", from: 210, to: 570, gen(R, h) {
        const style = R.pick(["same", "repeat", "mixed"]);
        let terms, k = R.int(1, 9);
        if (style === "same") { const w = R.int(1, 9); terms = [h.d(w), ...[1, 2, 3].map(p => ({ i: k, s: p }))]; k = w + "-" + k; }
        else if (style === "repeat") { terms = [h.d(k), ...[1, 2, 3].map(p => ({ i: k, s: p })), { i: k, s: R.int(2, 3) }]; }
        else { const ws = [R.int(1, 3), R.int(1, 3), R.int(1, 3), R.int(1, 3)]; terms = [h.d(`${ws[0]}.${ws[1]}`), h.d(`${ws[0]}.0${ws[2]}`), h.d(`${ws[0]}.${ws[1]}${ws[3]}`), h.d(`${ws[0]}.00${ws[2]}`)]; k = ws.join(""); }
        const sum = h.add(...terms);
        const naive = h.sub(sum, terms[terms.length - 1]); // نسي حدًّا
        return { style, sig: `${style}:${terms.map(h.str).join("+")}`, body: `ما قيمة المقدار ${terms.map(h.fx).join(" + ")} ؟`,
          ...h.numOptions(R, sum, [naive, h.sub(sum, h.d("0.01")), h.add(sum, h.d("0.1"))]),
          explanation: `${R1} رتّب الأعداد تحت بعضها خانة خانة واجمع كل خانة مع الحمل: الناتج ${h.fx(sum)}. انتبه للحدود المكررة.` };
      } },
      // ---------------------------------------------------------------
      addsub: { title: "الجمع والطرح معًا (٧,٦٥ + ٧,٣٥ − ٧,٢)", from: 570, to: 750, gen(R, h) {
        const w = R.int(2, 9), f = R.int(11, 89);
        const a = h.d(`${w}.${f}`), b = h.d(`${R.int(1, 9)}.${String(100 - f).padStart(2, "0")}`); // a + b عدد صحيح
        const c = R.dec(1, h.add(a, b).i / h.P(h.add(a, b).s) - 1, 1);
        const res = h.sub(h.add(a, b), c);
        const style = R.pick(["direct", "story"]);
        const body = style === "direct" ? `ما قيمة ${h.fx(a)} + ${h.fx(b)} − ${h.fx(c)} ؟`
          : `مع ${R.pick(NAMES)} ${h.fx(a)} ريال، وأعطاه والده ${h.fx(b)} ريال، ثم اشترى عصيرًا بـ ${h.fx(c)} ريال. كم بقي معه؟`;
        return { style, sig: `${style}:${h.str(a)}+${h.str(b)}-${h.str(c)}`, body,
          ...h.numOptions(R, res, [h.add(a, b, c), h.sub(h.add(a, b), h.shift(c, 1)), h.add(res, h.d(1))]),
          explanation: `اجمع أولًا: ${h.fx(a)} + ${h.fx(b)} = ${h.fx(h.add(a, b))} (لاحظ أن الكسرين يكملان بعضهما)، ثم اطرح ${h.fx(c)}: الناتج ${h.fx(res)}.` };
      } },
      // ---------------------------------------------------------------
      fromWhole: { title: "طرح عشري من عدد صحيح (قاعدة ٩ و١٠)", from: 750, to: 1080, gen(R, h) {
        const n = R.pick([1, 1, 1, 2, 3, 5, 10, 15, 20]);
        const s = R.int(2, 5);
        let x = R.dec(0, 0, s);
        if (R.next() < .4) x = { i: R.int(1, 9), s }; // مثل ٠,٠٠٠٧
        const res = h.sub(h.d(n), x);
        const style = R.pick(["direct", "missing", "cmp"]);
        if (style === "cmp") {
          const other = R.pick([res, h.shift(res, 1), h.add(res, { i: 1, s })]);
          return { style, sig: `cmp:${n}-${h.str(x)}:${h.str(other)}`, body: h.cmpBody("", `${h.fx(h.d(n))} − ${h.fx(x)}`, h.fx(other)), ...h.cmpAnswer(res, other),
            explanation: `${R2} ${h.fx(h.d(n))} − ${h.fx(x)} = ${h.fx(res)}، ثم قارن بعد إكمال الأصفار.` };
        }
        const body = style === "direct" ? `أوجد قيمة ${h.fx(h.d(n))} − ${h.fx(x)}` : `ما العدد الذي إذا أضيف إلى ${h.fx(x)} كان الناتج ${h.fx(h.d(n))} ؟`;
        const wrong9 = h.sub(h.d(n), h.add(x, { i: 1, s })); // نسي أن الأخير من ١٠
        return { style, sig: `${style}:${n}-${h.str(x)}`, body, ...h.numOptions(R, res, [wrong9, h.add(res, h.d(1)), { i: x.i, s: x.s }].filter(v => !h.eq(v, res))),
          explanation: `${R2} ${h.fx(h.d(n))} − ${h.fx(x)} = ${h.fx(res)}` };
      } },
      // ---------------------------------------------------------------
      multiSub: { title: "طرح عدة عشريات من صحيح (اجمع المتشابه أولًا)", from: 1080, to: 1380, gen(R, h) {
        const n = R.int(2, 9), k = R.int(1, 9), m = R.int(2, 3);
        const terms = Array.from({ length: m }, (_, p) => ({ i: k, s: p + 1 }));
        const tot = h.add(...terms), res = h.sub(h.d(n), tot);
        const style = R.pick(["direct", "story"]);
        const body = style === "direct" ? `ما قيمة ${h.ar(String(n))} − ${terms.map(h.fx).join(" − ")} ؟`
          : `خزان فيه ${h.ar(String(n))} لترات، سُحب منه ${terms.map(h.fx).join(" لتر ثم ")} لتر. كم لترًا بقي؟`;
        return { style, sig: `${style}:${n}-${k}x${m}`, body, ...h.numOptions(R, res, [h.add(h.d(n), tot), h.sub(h.d(n), h.add(tot, { i: 1, s: m })), h.sub(h.d(n - 1), tot)].filter(v => v.i >= 0 && !h.eq(v, res))),
          explanation: `الإشارات متشابهة (كلها طرح) فنجمع المطروحات أولًا: ${terms.map(h.fx).join(" + ")} = ${h.fx(tot)}، ثم ${h.ar(String(n))} − ${h.fx(tot)} = ${h.fx(res)} بقاعدة ٩ و١٠.` };
      } },
      // ---------------------------------------------------------------
      mult: { title: "ضرب الأعداد العشرية (عدّ المنازل)", from: 1380, to: 1500, extra: [[1710, 1800], [2280, 2370]], gen(R, h) {
        const style = R.pick(["chain", "two", "price", "area"]);
        let fs;
        if (style === "chain") fs = Array.from({ length: R.int(3, 4) }, () => R.pick([{ i: R.int(1, 5), s: R.int(1, 3) }, h.d(R.int(2, 5))]));
        else fs = [R.dec(0, 3, 1), R.dec(0, 2, R.int(1, 2))];
        if (fs.every(f => f.s === 0)) return null;
        const prod = h.mul(...fs);
        if (prod.i === 0) return null;
        const places = fs.reduce((t, f) => t + f.s, 0);
        const body = style === "price" ? `سعر الكيلو من التمر ${h.fx(fs[0])} ريال، فكم سعر ${h.fx(fs[1])} كيلو؟`
          : style === "area" ? `مستطيل طوله ${h.fx(fs[0])} م وعرضه ${h.fx(fs[1])} م، فما مساحته بالمتر المربع؟`
          : `ما قيمة ${fs.map(h.fx).join(" × ")} ؟`;
        if ((style === "price" || style === "area") && (fs[0].i === 0 || fs[1].i === 0)) return null;
        return { style, sig: `${style}:${fs.map(h.str).join("x")}`, body, ...h.numOptions(R, prod, [h.shift(prod, 1), h.shift(prod, -1), h.shift(prod, 2)]),
          explanation: `${R3} حاصل ضرب الأرقام بدون فواصل ${h.ar(String(Math.abs(fs.reduce((t, f) => t * f.i, 1))))}، وعدد المنازل ${h.ar(String(places))}، فالناتج ${h.fx(prod)}.` };
      } },
      // ---------------------------------------------------------------
      powers: { title: "قوى الأعداد العشرية ((٠,٢)³ و ٠,١ + ٠,١² …)", from: 1500, to: 1830, extra: [[2550, 2730]], gen(R, h) {
        const style = R.pick(["pow", "pow", "sum", "sumsq"]);
        const sup = ["", "", "²", "³", "⁴", "⁵"];
        if (style === "sumsq") {
          const a = { i: R.int(1, 9), s: 1 }, c = { i: R.int(1, 9), s: R.pick([1, 2]) };
          const v = h.add(h.mul(a, a), h.mul(c, c));
          return { style, sig: `sq:${h.str(a)}:${h.str(c)}`, body: `ما قيمة ${h.fx(a)}² + ${h.fx(c)}² ؟`, ...h.numOptions(R, v, [h.mul(h.add(a, c), h.d(2)), h.shift(v, -1), h.mul(h.add(a, c), h.add(a, c))]),
            explanation: `${h.fx(a)}² = ${h.fx(h.mul(a, a))} و ${h.fx(c)}² = ${h.fx(h.mul(c, c))} (اضرب ثم عُدّ المنازل)، والمجموع ${h.fx(v)}.` };
        }
        if (style === "pow") {
          const b = { i: R.int(1, 9), s: R.pick([1, 1, 2]) }, e = b.s === 2 || b.i > 5 ? 2 : R.int(2, 4);
          if (b.i ** e > 999) return null;
          const v = h.mul(...Array(e).fill(b));
          return { style, sig: `pow:${h.str(b)}^${e}`, body: `ما قيمة (${h.fx(b)})${sup[e]} ؟`, ...h.numOptions(R, v, [h.shift(v, -1), h.shift(v, 1), h.mul(b, h.d(e))]),
            explanation: `(${h.fx(b)})${sup[e]} تعني ضرب ${h.fx(b)} في نفسها ${h.ar(String(e))} مرات: ${h.ar(String(b.i ** e))} مع ${h.ar(String(b.s * e))} منازل عشرية، فالناتج ${h.fx(v)}.` };
        }
        const b = { i: R.pick([1, 1, 2, 3, 4, 5]), s: 1 }, m = R.int(2, 4);
        const parts = Array.from({ length: m }, (_, k) => h.mul(...Array(k + 1).fill(b)));
        const v = h.add(...parts);
        return { style, sig: `sum:${h.str(b)}:${m}`, body: `ما قيمة المقدار ${parts.map((_, k) => h.fx(b) + sup[k + 1]).join(" + ")} ؟`,
          ...h.numOptions(R, v, [h.mul(b, h.d(m)), h.shift(v, 1), h.sub(v, parts[0])]),
          explanation: `احسب كل قوة: ${parts.map(h.fx).join(" ، ")}، ثم اجمع مع ترتيب الفواصل: الناتج ${h.fx(v)}.` };
      } },
      // ---------------------------------------------------------------
      cmpPad: { title: "المقارنة بإكمال الأصفار", from: 1830, to: 1950, extra: [[2070, 2190]], gen(R, h) {
        const style = R.pick(["near", "zero", "len"]);
        let a, b;
        if (style === "zero") { a = R.dec(0, 0, R.int(1, 2)); b = a; }
        else if (style === "near") { const x = R.int(1, 9), y = R.int(1, 9); a = h.d(`0.${x}0${y}`); b = h.d(`0.${x}${y}`); }
        else { a = R.dec(0, 0, 3); b = R.dec(0, 0, 1); }
        if (R.next() < .5) [a, b] = [b, a];
        const show = style === "zero" ? [h.fx(a), h.pad(b, b.s + R.int(1, 2))] : [h.fx(a), h.fx(b)];
        return { style, sig: `${style}:${show.join("|")}`, body: h.cmpBody("", show[0], show[1]), ...h.cmpAnswer(a, b),
          explanation: `أكمل الخانات بأصفار حتى يتساوى عدد الأرقام بعد الفاصلة: ${h.pad(a, 3)} و ${h.pad(b, 3)}، ثم قارن كعددين صحيحين. الأصفار في آخر الجزء العشري لا تغيّر القيمة.` };
      } },
      // ---------------------------------------------------------------
      cmpProduct: { title: "المقارنة بعد ضرب العشرية", from: 1950, to: 2190, gen(R, h) {
        const fs = [{ i: R.int(1, 5) * (R.next() < .3 ? 10 : 1), s: R.int(0, 2) }, { i: R.int(2, 7), s: R.int(1, 2) }, ...(R.next() < .5 ? [{ i: R.int(1, 4), s: R.int(1, 3) }] : [])];
        const p = h.mul(...fs);
        if (p.i === 0) return null;
        const other = R.pick([p, h.shift(p, 1), h.shift(p, -1)]);
        return { style: "cmp", sig: `${fs.map(h.str).join("x")}:${h.str(other)}`, body: h.cmpBody("", fs.map(h.fx).join(" × "), h.fx(other)), ...h.cmpAnswer(p, other),
          explanation: `${R3} القيمة الأولى = ${h.fx(p)}. أكمل الأصفار ثم قارن بـ ${h.fx(other)}.` };
      } },
      // ---------------------------------------------------------------
      square5: { title: "تربيع العدد الذي آحاده ٥ (١,٥ × ١,٥)", from: 2190, to: 2280, gen(R, h) {
        const n = R.int(1, 14), form = R.pick(["n.5", "n.5", "0.n5"]);
        if (form === "0.n5" && n > 9) return null;
        const x = form === "n.5" ? h.d(`${n}.5`) : h.d(`0.${n}5`), sq = h.mul(x, x);
        const style = R.pick(["direct", "cmp"]) + (form === "0.n5" ? "s" : "");
        if (form === "0.n5") {
          return { style, sig: `s:${n}`, body: `ما قيمة (${h.fx(x)})² ؟`, ...h.numOptions(R, sq, [h.shift(sq, -1), h.d(`0.${n * (n + 1)}5`), h.shift(sq, 1)]),
            explanation: `${h.ar(String(n))} × ${h.ar(String(n + 1))} = ${h.ar(String(n * (n + 1)))} ثم نكتب ٢٥ بعدها: ${h.ar(String(n * (n + 1)))}٢٥، وعدد المنازل ٤، فالناتج ${h.fx(sq)}.` };
        }
        if (style === "cmp") {
          const other = R.pick([h.d(n * (n + 1)), h.d(`${n * (n + 1)}.5`), sq]);
          return { style, sig: `cmp:${n}:${h.str(other)}`, body: h.cmpBody("", `${h.fx(x)} × ${h.fx(x)}`, h.fx(other)), ...h.cmpAnswer(sq, other),
            explanation: `العدد الذي آحاده ٥: اضرب الرقم في التالي له ثم أضف ٢٥: ${h.ar(String(n))} × ${h.ar(String(n + 1))} = ${h.ar(String(n * (n + 1)))}، فالمربع ${h.fx(sq)}.` };
        }
        return { style, sig: `d:${n}`, body: `ما قيمة (${h.fx(x)})² ؟`, ...h.numOptions(R, sq, [h.d(n * n + 0.25), h.d(`${n * (n + 1)}.5`), h.shift(sq, 1)]),
          explanation: `اضرب ${h.ar(String(n))} في التالي له ${h.ar(String(n + 1))} = ${h.ar(String(n * (n + 1)))}، ثم أضف ٢٥ في المنزلتين العشريتين: ${h.fx(sq)}.` };
      } },
      // ---------------------------------------------------------------
      bill: { title: "مسألة الفاتورة اليومية (٧,٥ = ١٥ ÷ ٢)", from: 2370, to: 2550, gen(R, h) {
        const p = h.d(`${R.int(2, 12)}.5`), days = R.int(4, 15) * 2, total = h.mul(p, h.d(days));
        const kind = R.pick(["كهرباء", "ماء", "إنترنت"]);
        const style = R.pick(["cmp", "direct"]);
        const half = `${h.fx(p)} = ${h.ar(String(p.i))} ÷ ٢، فالقيمة ${h.ar(String(days))} × ${h.ar(String(p.i))} ÷ ٢ = ${h.ar(String(days / 2))} × ${h.ar(String(p.i))} = ${h.fx(total)}`;
        if (style === "cmp") {
          const other = h.add(total, h.d(R.pick([-10, -5, 5, 10, 15, 0])));
          return { style, sig: `cmp:${h.str(p)}:${days}:${h.str(other)}`, body: h.cmpBody(`فاتورة ${kind} قيمتها في اليوم ${h.fx(p)} ريال.`, `قيمة الفاتورة بعد ${h.ar(String(days))} يومًا`, `${h.fx(other)} ريال`), ...h.cmpAnswer(total, other),
            explanation: `${half} ريال، ثم قارن بـ ${h.fx(other)}.` };
        }
        return { style, sig: `d:${h.str(p)}:${days}`, body: `فاتورة ${kind} قيمتها في اليوم ${h.fx(p)} ريال، فكم قيمتها بعد ${h.ar(String(days))} يومًا؟`,
          ...h.numOptions(R, total, [h.mul(h.d(p.i), h.d(days)), h.add(total, p), h.sub(total, p)]), explanation: `${half} ريال.` };
      } },
      // ---------------------------------------------------------------
      daily: { title: "مسألة الزيادة اليومية (الجري)", from: 2730, to: 2820, gen(R, h) {
        const s = R.dec(1, 5, 1), inc = { i: R.int(1, 6), s: 1 };
        const i0 = R.int(0, 2), i1 = R.int(i0 + 3, 6), steps = i1 - i0;
        const v = h.add(s, h.mul(inc, h.d(steps)));
        const name = R.pick(NAMES), act = R.pick(["الجري", "المشي", "ركوب الدراجة"]);
        return { style: "d", sig: `${h.str(s)}:${h.str(inc)}:${i0}-${i1}`, body: `يمارس ${name} رياضة ${act}، إذا قطع يوم ${DAYS[i0]} ${h.fx(s)} كلم ويزيد كل يوم بمقدار ${h.fx(inc)} كلم، فكم يقطع يوم ${DAYS[i1]}؟`,
          ...h.numOptions(R, v, [h.add(s, h.mul(inc, h.d(steps + 1))), h.add(s, h.mul(inc, h.d(steps - 1))), h.add(s, inc)]),
          explanation: `عدد الزيادات من ${DAYS[i0]} إلى ${DAYS[i1]} = ${h.ar(String(steps))} (لا تحسب يوم البداية). المسافة = ${h.fx(s)} + ${h.ar(String(steps))} × ${h.fx(inc)} = ${h.fx(v)} كلم.` };
      } },
      // ---------------------------------------------------------------
      container: { title: "مسألة العلبة الفارغة (جزء من المحتوى)", from: 2820, to: 3104, gen(R, h) {
        const fr = R.pick([[1, 2, "نصف"], [3, 4, "ثلاثة أرباع"], [1, 4, "ربع"], [2, 3, "ثلثي"], [1, 3, "ثلث"]]);
        const can = { i: R.int(1, 6), s: 1 }, unit = { i: R.int(1, 8), s: 1 }; // unit = وزن الجزء الواحد
        const food = h.mul(unit, h.d(fr[1])), full = h.add(can, food), after = h.sub(full, h.mul(unit, h.d(fr[0])));
        const kind = R.pick([["علبة طعام", "أكل", "العلبة"], ["قارورة ماء", "شرب", "القارورة"], ["كيس أرز", "استعمال", "الكيس"]]);
        const style = R.pick(["can", "food"]);
        const ans = style === "can" ? can : food;
        return { style, sig: `${style}:${h.str(can)}:${h.str(unit)}:${fr[1]}/${fr[0]}`,
          body: `وزن ${kind[0]} وهي ممتلئة ${h.fx(full)} كجم، وبعد ${kind[1]} ${fr[2]} محتواها أصبح وزنها ${h.fx(after)} كجم، فما وزن ${style === "can" ? kind[2] + " فارغة" : "المحتوى كاملًا"}؟`,
          ...h.numOptions(R, ans, [style === "can" ? food : can, h.sub(full, after), unit, after].filter(v => !h.eq(v, ans))),
          explanation: `ارسم العلبة مقسومة إلى ${h.ar(String(fr[1]))} أجزاء. المأخوذ = ${h.fx(full)} − ${h.fx(after)} = ${h.fx(h.sub(full, after))} كجم، وهو ${h.ar(String(fr[0]))} من ${h.ar(String(fr[1]))} أجزاء، فالجزء الواحد ${h.fx(unit)} والمحتوى كله ${h.fx(food)} كجم، ووزن ${kind[2]} فارغة ${h.fx(full)} − ${h.fx(food)} = ${h.fx(can)} كجم.` };
      } }
    }
  };
})();
