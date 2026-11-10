// المحاضرة 29: تطبيقات المتوسط، الوسيط والمنوال والمدى، الاحتمال، مبدأ العد والتوافيق والتباديل
(() => {
  const g = (a, b) => b ? g(b, a % b) : a;
  const F = (h, n, d) => { const k = g(n, d); return d / k === 1 ? h.A(n / k) : h.frac(h.A(n / k), h.A(d / k)); };
  const fact = n => n <= 1 ? 1 : n * fact(n - 1), C = (n, r) => fact(n) / (fact(r) * fact(n - r)), P = (n, r) => fact(n) / fact(n - r);
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  const NUM = { 3: "ثلاثة", 4: "أربعة", 5: "خمسة", 6: "ستة", 7: "سبعة", 8: "ثمانية" };
  window.EXAMS[29] = {
    title: "اختبار محاكي: الوسيط والمنوال والمدى والاحتمال والعد", minutes: 25,
    blueprint: [["rows", 2], ["groups", 2], ["evenMean", 1], ["range", 2], ["median", 2], ["mmCmp", 2], ["mode", 2], ["prob", 3], ["arrange", 2], ["doors", 2], ["probTwo", 1], ["combo", 2], ["perm", 1]],
    skills: {
      rows: { title: "صفوف يزيد كل منها بعدد ثابت", from: 0, to: 110, gen(R, h) {
        const A = h.A, n = R.pick([3, 4, 5]), d = R.int(1, 4), a = R.int(4, 20), S = n * a + d * n * (n - 1) / 2, k = R.int(1, n), v = a + (k - 1) * d;
        return { style: "r" + n, sig: `${n}:${d}:${a}:${k}`, body: `قاعة بها ${A(n)} صفوف، كل صف يزيد عن الذي قبله بـ ${A(d)} ${d === 1 ? "مقعد" : d === 2 ? "مقعدين" : "مقاعد"}، ومجموع المقاعد ${A(S)} مقعدًا. أوجد عدد مقاعد الصف ${["", "الأول", "الثاني", "الثالث", "الرابع", "الخامس"][k]}`,
          ...h.numOptions(R, h.d(v), [h.d(v + d), h.d(Math.max(1, v - d)), h.d(Math.round(S / n))]),
          steps: [`الأعداد بفرق ثابت، فالمتوسط = ${A(S)} ÷ ${A(n)} = ${h.fx(h.d(String(S / n)))} ${n % 2 ? "وهو الصف الأوسط" : ""}.`, `الصفوف: ${Array.from({ length: n }, (_, i) => A(a + i * d)).join(" ، ")}.`, `الصف المطلوب = ${A(v)} مقعدًا.`], explanation: A(v) };
      } },
      groups: { title: "مجموع أول أعداد متتالية وآخرها", from: 110, to: 230, gen(R, h) {
        const A = h.A, n = R.pick([6, 8, 10]), k = R.int(2, n / 2), a = R.int(5, 50), first = Array.from({ length: k }, (_, i) => a + i).reduce((x, y) => x + y), v = first + k * (n - k);
        return { style: "g", sig: `${n}:${k}:${a}`, body: `${NUM[n] || A(n)} أعداد متتالية، إذا كان مجموع أول ${A(k)} أعداد ${A(first)} ، فما مجموع آخر ${A(k)} أعداد؟`,
          ...h.numOptions(R, h.d(v), [h.d(first + n - k), h.d(v + 1), h.d(first + k)]),
          steps: [`أول الأعداد: متوسط أول ${A(k)} = ${h.fx(h.d(String(first / k)))} ، فالأعداد تبدأ من ${A(a)}.`, `كل عدد من آخر ${A(k)} أعداد يزيد عن نظيره بمقدار ${A(n - k)}.`, `المجموع = ${A(first)} + ${A(k)} × ${A(n - k)} = ${A(v)}.`], explanation: A(v) };
      } },
      evenMean: { title: "متوسط أعداد زوجية متتالية بالرموز", from: 230, to: 380, gen(R, h) {
        const A = h.A, n = R.pick([2, 4, 6]), big = R.next() < .6, off = n - 1, ans = big ? `ن + ${A(off)}` : `ن − ${A(off)}`;
        return { style: "e" + n + big, sig: `${n}:${big}`, body: `إذا كان متوسط ${NUM[n] || "عددين"} ${n === 2 ? "زوجيين متتاليين" : "أعداد زوجية متتالية"} هو ن ، فإن ${big ? "أكبر" : "أصغر"} هذه الأعداد هو:`,
          ...h.strOptions(R, ans, [`ن ${big ? "+" : "−"} ${A(off + 1)}`, `ن ${big ? "−" : "+"} ${A(off)}`, `ن ${big ? "+" : "−"} ${A(off + 2)}`]),
          steps: [`عدد الأعداد زوجي فالمتوسط ن يقع بين العددين الأوسطين، وهما ن − ١ و ن + ١.`, `الأعداد: ${Array.from({ length: n }, (_, i) => { const o = -off + 2 * i; return o === 0 ? "ن" : `ن ${o > 0 ? "+" : "−"} ${A(Math.abs(o))}`; }).join(" ، ")}.`, `${big ? "أكبرها" : "أصغرها"} ${ans}.`], explanation: ans };
      } },
      range: { title: "المدى = أكبر قيمة − أصغر قيمة", from: 380, to: 590, gen(R, h) {
        const A = h.A, mode = R.pick(["calc", "pair"]);
        if (mode === "pair") { const r = R.int(10, 40), a = R.int(10, 40), ans = `${A(a)} ، ${A(a + r)}`;
          return { style: "p", sig: `p${r}:${a}`, body: `مدى أعمار ${A(5)} أشخاص هو ${A(r)} ، فكم يكون عمر الأصغر والأكبر؟`, ...h.strOptions(R, ans, [`${A(a)} ، ${A(a + r + 3)}`, `${A(a + 2)} ، ${A(a + r - 4)}`, `${A(r)} ، ${A(a + r)}`]),
            steps: ["المدى = أكبر قيمة − أصغر قيمة.", `${A(a + r)} − ${A(a)} = ${A(r)} ✓.`], explanation: ans }; }
        const n = R.int(5, 8), list = Array.from({ length: n }, () => R.int(10, 99)), v = Math.max(...list) - Math.min(...list);
        return { style: "c", sig: `c${list.join(",")}`, body: `ما مدى البيانات: ${list.map(A).join(" ، ")}؟`, ...h.numOptions(R, h.d(v), [h.d(list[list.length - 1] - list[0] > 0 ? list[list.length - 1] - list[0] : v + 3), h.d(Math.max(...list)), h.d(v + 2)]),
          steps: [`أكبر قيمة ${A(Math.max(...list))} ، وأصغر قيمة ${A(Math.min(...list))}.`, `المدى = ${A(v)}.`], explanation: A(v) };
      } },
      median: { title: "الوسيط بعد ترتيب البيانات", from: 380, to: 670, gen(R, h) {
        const A = h.A, n = R.pick([5, 6, 7]), list = Array.from({ length: n }, () => R.int(10, 40)), s = [...list].sort((a, b) => a - b), v = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
        const fx = x => Number.isInteger(x) ? A(x) : h.fx(h.d(String(x)));
        return { style: "m" + (n % 2), sig: list.join(","), body: `أطوال ${A(n)} أشجار في حديقة هي ${list.map(A).join(" ، ")} قدمًا، أوجد الوسيط لهذه الأطوال`,
          ...h.strOptions(R, fx(v), [fx(list[Math.floor(n / 2)]) === fx(v) ? fx(v + 1) : fx(list[Math.floor(n / 2)]), fx(Math.round(list.reduce((a, b) => a + b) / n)) === fx(v) ? fx(v + 2) : fx(Math.round(list.reduce((a, b) => a + b) / n)), fx(v - 1)]),
          steps: ["نرتب البيانات تصاعديًا أولًا (لا نأخذ الأوسط قبل الترتيب).", `${s.map(A).join(" ، ")}.`, n % 2 ? `الوسيط هو القيمة الوسطى = ${A(v)}.` : `عدد القيم زوجي، فالوسيط = (${A(s[n / 2 - 1])} + ${A(s[n / 2])}) ÷ ٢ = ${fx(v)}.`], explanation: fx(v) };
      } },
      mmCmp: { title: "المقارنة بين المتوسط والوسيط", from: 670, to: 1030, gen(R, h) {
        const A = h.A, n = 4, list = Array.from({ length: n }, () => R.int(12, 19) * 5), s = [...list].sort((a, b) => a - b), rest = s.slice(1), mean = rest.reduce((a, b) => a + b) / 3, med = rest[1];
        return { style: "c", sig: list.join(","), body: `درجات طالب في ٤ اختبارات هي ${list.map(A).join(" ، ")} ، ثم حذفت المدرسة الدرجة الأدنى له.\nقارن بين:\nالقيمة الأولى: المتوسط\nالقيمة الثانية: الوسيط`, ...h.cmpAnswer(h.d(mean.toFixed(2)), h.d(med)),
          steps: [`بعد حذف ${A(s[0])}: ${rest.map(A).join(" ، ")}.`, `المتوسط = ${A(rest.reduce((a, b) => a + b))} ÷ ٣ = ${h.fx(h.d(mean.toFixed(2)))} ، والوسيط = ${A(med)}.`, `إذن ${rel(mean, med)}.`], explanation: rel(mean, med) };
      } },
      mode: { title: "المنوال: القيمة الأكثر تكرارًا", from: 1030, to: 1190, gen(R, h) {
        const A = h.A, m = R.int(3, 12), b = R.int(2, 15), x = R.int(15, 40); if (b === m || x === m || x === b) return null; const list = [m, m, m, b, b, x], S = list.reduce((a, c) => a + c);
        return { style: "m", sig: `${m}:${b}:${x}`, body: `إذا كان المنوال لـ ٦ أعداد هو ${A(m)} ، وكان ${A(b)} ، ${A(b)} ، س من بين هذه الأعداد التي مجموعها ${A(S)} ، فإن س = ؟`,
          ...h.numOptions(R, h.d(x), [h.d(x + m), h.d(S - 2 * b - m), h.d(x - b > 0 ? x - b : x + 2)]),
          steps: [`المنوال ${A(m)} يتكرر أكثر من ${A(b)} الذي تكرر مرتين، فلا بد أن يتكرر ${A(m)} ثلاث مرات.`, `الأعداد: ${A(m)} ، ${A(m)} ، ${A(m)} ، ${A(b)} ، ${A(b)} ، س.`, `س = ${A(S)} − ${A(3 * m + 2 * b)} = ${A(x)}.`], explanation: A(x) };
      } },
      prob: { title: "احتمال سحب بطاقة مرقمة", from: 1190, to: 1400, gen(R, h) {
        const A = h.A, N = R.int(8, 30), mode = R.pick(["div", "odd", "even"]), k = R.pick([3, 4, 5, 6]);
        const cnt = mode === "div" ? Math.floor(N / k) : mode === "odd" ? Math.ceil(N / 2) : Math.floor(N / 2), pct = R.next() < .3 && (cnt * 100) % N === 0;
        const ans = pct ? `${A(cnt * 100 / N)}٪` : F(h, cnt, N), wrongs = pct ? [`${A(100 - cnt * 100 / N)}٪`, `${A(cnt)}٪`, `${A(cnt * 100 / N + 10)}٪`] : [F(h, N - cnt, N), F(h, cnt, N + 1), F(h, cnt + 1, N)];
        return { style: mode + pct, sig: `${N}:${mode}:${k}:${pct}`, body: `صندوق فيه بطاقات مرقمة من ١ إلى ${A(N)} ، سُحبت منه بطاقة واحدة. فما احتمال أن يكون رقمها ${mode === "div" ? `يقبل القسمة على ${A(k)}` : mode === "odd" ? "فرديًا" : "زوجيًا"}؟`,
          ...h.strOptions(R, ans, wrongs.map(w => w === ans ? F(h, cnt, N + 2) : w)),
          steps: ["الاحتمال = عدد النتائج المطلوبة ÷ عدد كل النتائج.", `عدد البطاقات ${mode === "div" ? `التي تقبل القسمة على ${A(k)}` : mode === "odd" ? "الفردية" : "الزوجية"} = ${A(cnt)} من ${A(N)}.`, `الاحتمال = ${F(h, cnt, N)}${pct ? ` = ${ans}` : ""}.`], explanation: ans };
      } },
      arrange: { title: "ترتيب أشخاص في مقاعد", from: 1400, to: 1620, gen(R, h) {
        const A = h.A, n = R.int(3, 6), v = fact(n), seats = R.int(0, 1);
        return { style: "a" + n, sig: `${n}`, body: `ذهب ${A(n)} أصدقاء إلى السينما، بكم طريقة يستطيعون الجلوس على ${A(n)} كراسٍ في صف واحد؟`, ...h.numOptions(R, h.d(v), [h.d(n * n), h.d(n), h.d(v / 2 | 0 || v + 2)]),
          steps: ["الكرسي الأول له " + `${A(n)} اختيارات ، والثاني ${A(n - 1)} ، وهكذا.`, `عدد الطرق = ${Array.from({ length: n }, (_, i) => A(n - i)).join(" × ")} = ${A(v)}.`], explanation: A(v) };
      } },
      doors: { title: "مبدأ العد: الدخول والخروج من أبواب", from: 1620, to: 1820, gen(R, h) {
        const A = h.A, n = R.int(3, 12), other = R.next() < .55, v = other ? n * (n - 1) : n * n;
        return { style: "d" + other, sig: `${n}:${other}`, body: `في مصنع ${A(n)} أبواب، بكم طريقة يستطيع العامل الدخول والخروج ${other ? "من باب آخر" : "من أي باب"}؟`, ...h.numOptions(R, h.d(v), [h.d(other ? n * n : n * (n - 1)), h.d(2 * n), h.d(n)]),
          steps: ["مبدأ العد: عدد الطرق = حاصل ضرب عدد طرق كل اختيار.", `الدخول ${A(n)} طرق ، والخروج ${other ? `${A(n - 1)} طرق (غير باب الدخول)` : `${A(n)} طرق (يجوز الباب نفسه)`}.`, `${A(n)} × ${A(other ? n - 1 : n)} = ${A(v)}.`], explanation: A(v) };
      } },
      probTwo: { title: "احتمال اختيار شخصين من مجموعة فرعية", from: 1820, to: 1940, gen(R, h) {
        const A = h.A, N = R.int(10, 30), k = R.int(2, 6), num = k * (k - 1), den = N * (N - 1), ans = F(h, num, den);
        return { style: "p", sig: `${N}:${k}`, body: `في فصل عدد طلابه ${A(N)} طالبًا، يوجد ${A(k)} طلاب منهم اسمهم محمد. ما احتمال اختيار طالبين عشوائيًا كلاهما اسمه محمد؟`,
          ...h.strOptions(R, ans, [F(h, 2 * k, N * (N - 1)), F(h, k, N), F(h, k * k, N * N)].map(w => w === ans ? F(h, num, den + 2) : w)),
          steps: [`احتمال الأول = ${h.frac(A(k), A(N))} ، وبعده يبقى ${A(k - 1)} من ${A(N - 1)}.`, `الاحتمال = ${h.frac(A(k), A(N))} × ${h.frac(A(k - 1), A(N - 1))} = ${ans}.`], explanation: ans };
      } },
      combo: { title: "التوافيق: الاختيار دون اعتبار الترتيب", from: 2000, to: 2200, gen(R, h) {
        const A = h.A, n = R.int(4, 9), r = R.int(2, Math.min(4, n - 1)), v = C(n, r);
        return { style: "c", sig: `${n}:${r}`, body: `بكم طريقة يختار مدير شركة ${A(r)} موظفين من ${A(n)} بطريقة عشوائية ليذهبوا إلى الدوام المسائي؟`, ...h.numOptions(R, h.d(v), [h.d(P(n, r)), h.d(n * r), h.d(v + n)]),
          steps: ["الترتيب غير مهم (اختيار عشوائي) فنستخدم التوافيق.", `ق = ${h.frac(Array.from({ length: r }, (_, i) => A(n - i)).join(" × "), Array.from({ length: r }, (_, i) => A(r - i)).join(" × "))} = ${A(v)}.`, `لو كان الترتيب مهمًا (تباديل) لكان الناتج ${A(P(n, r))}.`], explanation: A(v) };
      } },
      perm: { title: "التباديل: تكوين رمز دون تكرار", from: 2200, to: 2381, gen(R, h) {
        const A = h.A, digits = R.pick([[1, 3, 5, 7, 9], [2, 4, 6, 8], [1, 2, 3, 4, 5, 6], [0, 2, 4, 6, 8]]), n = digits.length, r = R.int(2, Math.min(4, n)), v = P(n, r);
        return { style: "p", sig: `${digits.join("")}:${r}`, body: `بكم طريقة يمكن تكوين رقم سري مكوّن من ${A(r)} خانات باستخدام الأرقام (${digits.map(A).join(" ، ")}) دون تكرار أي رقم؟`, ...h.numOptions(R, h.d(v), [h.d(C(n, r)), h.d(n ** r), h.d(n * r)]),
          steps: ["الترتيب مهم في الرقم السري فنستخدم التباديل.", `عدد الطرق = ${Array.from({ length: r }, (_, i) => A(n - i)).join(" × ")} = ${A(v)}.`], explanation: A(v) };
      } }
    }
  };
})();
