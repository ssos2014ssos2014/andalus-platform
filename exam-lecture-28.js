// المحاضرة 28: الوسط الحسابي (المتوسط)
(() => {
  const M = "المتوسط = المجموع ÷ العدد ، ومنه: المجموع = المتوسط × العدد.";
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  const NUM = { 3: "ثلاثة", 4: "أربعة", 5: "خمسة", 6: "ستة", 7: "سبعة", 9: "تسعة" };
  const fx = (h, x) => Number.isInteger(x) ? h.A(x) : h.fx(h.d(String(+x.toFixed(2))));
  window.EXAMS[28] = {
    title: "اختبار محاكي: الوسط الحسابي", minutes: 25,
    blueprint: [["consec", 2], ["solveX", 2], ["findSum", 2], ["consecCmp", 2], ["commission", 1], ["capacity", 2], ["sequence", 1], ["meanCmp", 1], ["fix", 2], ["combined", 3], ["rest", 2], ["arith", 2], ["oddEven", 2]],
    skills: {
      consec: { title: "مجموع أعداد صحيحة متتالية ومتوسطها", from: 0, to: 110, gen(R, h) {
        const A = h.A, n = R.pick([3, 5, 7]), mid = R.int(10, 99), S = n * mid, ask = R.pick(["mean", "small", "big"]), v = ask === "mean" ? mid : ask === "small" ? mid - (n - 1) / 2 : mid + (n - 1) / 2;
        return { style: ask, sig: `${n}:${mid}:${ask}`, body: `مجموع ${NUM[n]} أعداد صحيحة متتالية = ${A(S)} ، ما ${ask === "mean" ? "متوسطها" : ask === "small" ? "أصغرها" : "أكبرها"}؟`,
          ...h.numOptions(R, h.d(v), [h.d(v + 1), h.d(Math.max(1, v - 1)), h.d(ask === "mean" ? mid + n : mid)]),
          steps: [M, `المتوسط = ${A(S)} ÷ ${A(n)} = ${A(mid)} ، وهو العدد الأوسط في الأعداد المتتالية.`, ask === "mean" ? "" : `الأعداد: ${Array.from({ length: n }, (_, i) => A(mid - (n - 1) / 2 + i)).join(" ، ")} ، فـ${ask === "small" ? "أصغرها" : "أكبرها"} ${A(v)}.`].filter(Boolean), explanation: A(v) };
      } },
      solveX: { title: "إيجاد مجهول من المتوسط", from: 110, to: 220, gen(R, h) {
        const A = h.A, cs = R.pick([[1, 2, 3], [1, 2], [1, 3], [2, 4], [1, 1, 2]]), x = R.int(2, 15), k = R.int(1, 30), n = cs.length + 1, S = cs.reduce((t, c) => t + c * x, 0) + k; if (S % n) return null; const m = S / n;
        const terms = cs.map(c => c === 1 ? "س" : `${A(c)}س`).concat([A(k)]).join(" ، ");
        return { style: "x" + cs.length, sig: `${cs.join("")}:${x}:${k}`, body: `إذا كان متوسط ${terms} هو ${A(m)} ، فما قيمة س؟`,
          ...h.numOptions(R, h.d(x), [h.d(x + 1), h.d(m), h.d(Math.max(1, x - 2))]),
          steps: [`المجموع = ${A(m)} × ${A(n)} = ${A(S)}.`, `${cs.map(c => c === 1 ? "س" : `${A(c)}س`).join(" + ")} + ${A(k)} = ${A(S)} ، أي ${A(cs.reduce((a, b) => a + b))}س = ${A(S - k)}.`, `س = ${A(x)}.`], explanation: A(x) };
      } },
      findSum: { title: "إيجاد مجموع من المتوسط", from: 220, to: 360, gen(R, h) {
        const A = h.A, known = Array.from({ length: R.int(1, 3) }, () => R.int(2, 40)), u = R.int(1, 2), n = known.length + u, m = R.int(10, 40), S = m * n, rest = S - known.reduce((a, b) => a + b); if (rest <= 0) return null;
        const vars = ["س", "ص"].slice(0, u), ask = R.pick(["vars", "all"]), v = ask === "vars" ? rest : S;
        return { style: ask + u, sig: `${known.join(",")}:${u}:${m}:${ask}`, body: `إذا كان متوسط الأعداد ${[...known.map(A), ...vars].join(" ، ")} يساوي ${A(m)} ، أوجد قيمة ${ask === "vars" ? vars.join(" + ") : [...known.map(A), ...vars].join(" + ")}`,
          ...h.numOptions(R, h.d(v), [h.d(ask === "vars" ? S : rest), h.d(m), h.d(v + m)]),
          steps: [`المجموع = ${A(m)} × ${A(n)} = ${A(S)}.`, ask === "vars" ? `${vars.join(" + ")} = ${A(S)} − (${known.map(A).join(" + ")}) = ${A(rest)}.` : "المطلوب هو المجموع نفسه."], explanation: A(v) };
      } },
      consecCmp: { title: "خصائص متوسط الأعداد المتتالية", from: 360, to: 600, gen(R, h) {
        const A = h.A, mode = R.pick(["diff", "cmp"]);
        if (mode === "diff") { const n = R.pick([5, 6, 7, 8]), k = R.int(2, n - 2), v = n - k, step = R.pick([1, 2]);
          return { style: "d", sig: `d${n}:${k}:${step}`, body: `لأي ${NUM[n] || A(n)} أعداد طبيعية ${step === 2 ? "فردية " : ""}متتالية، الفرق بين المتوسط الحسابي لأول ${A(k)} أعداد والمتوسط الحسابي لآخر ${A(k)} أعداد هو:`,
            ...h.numOptions(R, h.d(v * step), [h.d(k), h.d(0), h.d(v * step + 1)]),
            steps: [`جرّب أعدادًا: ${Array.from({ length: n }, (_, i) => A(1 + i * step)).join(" ، ")}.`, `كل عدد في المجموعة الأخيرة يزيد عن نظيره في الأولى بمقدار ${A(v * step)} ، فالمتوسط يزيد بالمقدار نفسه.`, `الفرق = ${A(v * step)}.`], explanation: A(v * step) }; }
        const n = R.pick([3, 5, 7, 9]), pos = R.pick(["mid", "first"]), idx = pos === "mid" ? (n + 1) / 2 : R.int(1, (n - 1) / 2);
        return { style: "c" + pos, sig: `c${n}:${idx}`, body: h.cmpBody("", `متوسط ${NUM[n]} أعداد متتالية`, `العدد ${["", "الأول", "الثاني", "الثالث", "الرابع", "الخامس"][idx]} من هذه الأعداد`), ...h.cmpAnswer(h.d((n + 1) / 2), h.d(idx)),
          steps: ["متوسط الأعداد المتتالية الفردية العدد هو العدد الأوسط.", `الأوسط هو العدد رقم ${A((n + 1) / 2)}.`, `إذن ${rel((n + 1) / 2, idx)}.`], explanation: rel((n + 1) / 2, idx) };
      } },
      commission: { title: "دخل ثابت ونسبة من متوسط أرباح", from: 600, to: 960, gen(R, h) {
        const A = h.A, sal = R.int(4, 12) * 1000, p = R.int(2, 5), prof = R.int(5, 20) * 10000, mo = R.int(2, 4), v = (sal + prof * p / 100) * mo;
        return { style: "c", sig: `${sal}:${p}:${prof}:${mo}`, body: `إذا كان راتب أحمد ${A(sal)} ريال شهريًا ويأخذ عمولة قدرها ${A(p)}٪ من أرباح الشركة، أوجد ما سيحصل عليه خلال ${A(mo)} أشهر إذا كان متوسط أرباح الشركة ${A(prof)} ريال شهريًا`,
          ...h.numOptions(R, h.d(v), [h.d(sal * mo + prof * p / 100), h.d(sal * mo), h.d((sal + prof * p / 100))]),
          steps: [`العمولة الشهرية = ${A(p)}٪ × ${A(prof)} = ${A(prof * p / 100)} ريال.`, `الدخل الشهري = ${A(sal)} + ${A(prof * p / 100)} = ${A(sal + prof * p / 100)} ريال.`, `خلال ${A(mo)} أشهر = ${A(v)} ريال.`], explanation: A(v) };
      } },
      capacity: { title: "عدد الأفراد من الحمولة والمتوسط", from: 960, to: 1200, gen(R, h) {
        const A = h.A, m = R.pick([60, 70, 75, 80, 90]), n = R.int(5, 16), C = m * n;
        return { style: "e", sig: `${m}:${n}`, body: `مصعد يستطيع حمل ${A(C)} كيلوجرام، فإذا كان المتوسط الحسابي لأوزان موظفي الشركة ${A(m)} كجم، فكم شخصًا يمكن أن يحمله المصعد؟`,
          ...h.numOptions(R, h.d(n), [h.d(n + 2), h.d(n - 1), h.d(Math.round(C / 100))]),
          steps: ["المجموع = المتوسط × العدد ، إذن العدد = المجموع ÷ المتوسط.", `العدد = ${A(C)} ÷ ${A(m)} = ${A(n)} أشخاص.`], explanation: A(n) };
      } },
      sequence: { title: "متتابعة كل حد فيها متوسط ما قبله", from: 1200, to: 1320, gen(R, h) {
        const A = h.A, a = R.int(1, 9), b = R.int(a + 1, 15); if ((a + b) % 2) return null; const m = (a + b) / 2, k = R.int(10, 40);
        return { style: "s", sig: `${a}:${b}:${k}`, body: `متتابعة حدها الأول ${A(a)} وحدها الثاني ${A(b)} ، وبدءًا من الحد الثالث كل حد فيها يساوي الوسط الحسابي لكل الحدود السابقة له. فما حدها رقم ${A(k)}؟`,
          ...h.numOptions(R, h.d(m), [h.d(b), h.d(a + b), h.d(m + 1)]),
          steps: [`الحد الثالث = (${A(a)} + ${A(b)}) ÷ ٢ = ${A(m)}.`, `الحد الرابع = (${A(a)} + ${A(b)} + ${A(m)}) ÷ ٣ = ${A(m)} أيضًا ، لأن إضافة عدد يساوي المتوسط لا تغيّره.`, `إذن كل الحدود من الثالث فما بعد = ${A(m)}.`], explanation: A(m) };
      } },
      meanCmp: { title: "المقارنة بالمتوسط الجبري", from: 1320, to: 1440, gen(R, h) {
        const A = h.A, k = R.int(1, 5), sign = R.pick([1, -1]);
        return { style: "m" + sign, sig: `${k}:${sign}`, body: h.cmpBody(`إذا كانت م ${sign > 0 ? "+" : "−"} ${A(k)} متوسط س ، ص`, h.frac("س + ص", "٢"), "م"), ...h.cmpAnswer(h.d(sign * k), h.d(0)),
          steps: [`${h.frac("س + ص", "٢")} هو متوسط س و ص = م ${sign > 0 ? "+" : "−"} ${A(k)}.`, `نقارن م ${sign > 0 ? "+" : "−"} ${A(k)} مع م: ${sign > 0 ? "الأولى أكبر" : "الثانية أكبر"} دائمًا.`], explanation: sign > 0 ? "القيمة الأولى أكبر" : "القيمة الثانية أكبر" };
      } },
      fix: { title: "تصحيح المتوسط بعد اكتشاف خطأ", from: 1440, to: 1560, gen(R, h) {
        const A = h.A, n = R.pick([5, 10, 20, 25]), m = R.int(60, 90), add = n * R.int(1, 4), up = R.next() < .7, nm = m + (up ? 1 : -1) * add / n, w = nm + R.pick([-1, 0, 1]);
        return { style: "f" + up, sig: `${n}:${m}:${add}:${up}:${w}`, body: h.cmpBody(`متوسط درجات ${A(n)} طلاب = ${A(m)}. إذا اكتشف المعلم خطأً في جمع الدرجات ووجد أن طالبًا ${up ? "له" : "زيد له"} ${A(add)} درجة ${up ? "فأضافها له" : "فحذفها منه"}`, "المتوسط بعد التعديل", A(w)),
          ...h.cmpAnswer(h.d(nm), h.d(w)),
          steps: [`المجموع القديم = ${A(m)} × ${A(n)} = ${A(m * n)}.`, `الجديد = ${A(m * n)} ${up ? "+" : "−"} ${A(add)} = ${A(m * n + (up ? add : -add))} ، والمتوسط = ${A(m * n + (up ? add : -add))} ÷ ${A(n)} = ${A(nm)}.`, `اختصارًا: يتغير المتوسط بمقدار ${A(add)} ÷ ${A(n)} = ${A(add / n)}. إذن ${rel(nm, w)}.`], explanation: rel(nm, w) };
      } },
      combined: { title: "متوسط مجموعتين معًا", from: 1560, to: 1800, gen(R, h) {
        const A = h.A, n1 = R.int(3, 10), n2 = R.int(3, 10), m1 = R.int(2, 20), m2 = R.int(2, 20), S = n1 * m1 + n2 * m2, v = S / (n1 + n2); if (!Number.isInteger(v * 2) || m1 === m2) return null;
        return { style: "c", sig: `${n1}:${m1}:${n2}:${m2}`, body: `${A(n1)} أعداد وسطها الحسابي ${A(m1)} ، و${A(n2)} أعداد أخرى وسطها الحسابي ${A(m2)} ، احسب المتوسط للجميع`,
          ...h.numOptions(R, h.d(String(v)), [h.d(String((m1 + m2) / 2)) , h.d(String(v + 1)), h.d(String(Math.max(m1, m2)))]),
          steps: [`مجموع الأولى = ${A(n1)} × ${A(m1)} = ${A(n1 * m1)} ، ومجموع الثانية = ${A(n2)} × ${A(m2)} = ${A(n2 * m2)}.`, `المجموع الكلي = ${A(S)} ، والعدد = ${A(n1 + n2)}.`, `المتوسط = ${A(S)} ÷ ${A(n1 + n2)} = ${fx(h, v)}. (ليس متوسط المتوسطين إلا إذا تساوى العددان)`], explanation: fx(h, v) };
      } },
      rest: { title: "متوسط الأعداد الباقية", from: 1800, to: 2040, gen(R, h) {
        const A = h.A, n = R.int(4, 9), k = R.int(1, n - 1), m = R.int(5, 40), mk = R.int(2, 40), S = n * m, Sk = k * mk, r = n - k, v = (S - Sk) / r; if (!Number.isInteger(v) || v <= 0) return null;
        return { style: "r", sig: `${n}:${k}:${m}:${mk}`, body: `${A(n)} أعداد وسطها الحسابي ${A(m)} ، ولكن أول ${A(k)} أعداد منها وسطها الحسابي ${A(mk)} ، فما المتوسط ${r === 1 ? "للعدد الباقي" : r === 2 ? "للعددين الباقيين" : `للأعداد الـ${A(r)} الباقية`}؟`,
          ...h.numOptions(R, h.d(v), [h.d(Math.abs(m - mk) || v + 2), h.d(v + 2), h.d(S - Sk)]),
          steps: [`مجموع الكل = ${A(n)} × ${A(m)} = ${A(S)} ، ومجموع الأولى = ${A(k)} × ${A(mk)} = ${A(Sk)}.`, `مجموع الباقي = ${A(S - Sk)} ، وعددها ${A(r)}.`, `المتوسط = ${A(S - Sk)} ÷ ${A(r)} = ${A(v)}.`], explanation: A(v) };
      } },
      arith: { title: "الوسط الحسابي لأعداد مرتبة بثبات", from: 2040, to: 2160, gen(R, h) {
        const A = h.A, a = R.int(10, 1500), d = R.pick([2, 3, 5, 10, 25, 50]), n = R.int(5, 8), list = Array.from({ length: n }, (_, i) => a + i * d), v = (list[0] + list[n - 1]) / 2;
        const shown = R.next() < .5 ? list : [...list].reverse();
        return { style: "a", sig: `${a}:${d}:${n}`, body: `أوجد المتوسط الحسابي للأعداد: ${shown.map(A).join(" ، ")}`,
          ...h.numOptions(R, h.d(String(v)), [h.d(String(v + d)), h.d(String(list[Math.floor(n / 2) - 1] === v ? v - d : list[Math.floor(n / 2) - 1])), h.d(String(v + d / 2))]),
          steps: ["الأعداد مرتبة بفرق ثابت، فالمتوسط = (الأول + الأخير) ÷ ٢ ، وهو الأوسط.", `(${A(list[0])} + ${A(list[n - 1])}) ÷ ٢ = ${fx(h, v)}.`], explanation: fx(h, v) };
      } },
      oddEven: { title: "أعداد فردية أو زوجية متتالية", from: 2160, to: 2752, gen(R, h) {
        const A = h.A, n = R.pick([5, 6, 7]), odd = R.next() < .5, start = R.int(5, 60) * 2 + (odd ? 1 : 0), list = Array.from({ length: n }, (_, i) => start + 2 * i), S = list.reduce((a, b) => a + b), ask = R.pick(["small", "first2", "first3"]);
        const v = ask === "small" ? start : ask === "first2" ? (list[0] + list[1]) / 2 : (list[0] + list[1] + list[2]) / 3;
        const given = R.next() < .5 ? `مجموعها ${A(S)}` : n % 2 ? `وسطها ${A(S / n)}` : `مجموعها ${A(S)}`;
        return { style: ask + odd, sig: `${n}:${start}:${ask}`, body: `${A(n)} أعداد ${odd ? "فردية" : "زوجية"} متتالية ${given} ، فما ${ask === "small" ? "أصغرها" : ask === "first2" ? "الوسط لأول عددين" : "الوسط لأول ثلاثة أعداد"}؟`,
          ...h.numOptions(R, h.d(v), [h.d(v + 2), h.d(S / n === v ? v - 2 : Math.round(S / n)), h.d(v - 1)]),
          steps: [`المتوسط = ${A(S)} ÷ ${A(n)} = ${fx(h, S / n)}${n % 2 ? " وهو العدد الأوسط" : ` ، والعددان الأوسطان ${A(S / n - 1)} و ${A(S / n + 1)}`}.`, `الأعداد: ${list.map(A).join(" ، ")}.`, `المطلوب = ${A(v)}.`], explanation: A(v) };
      } }
    }
  };
})();
