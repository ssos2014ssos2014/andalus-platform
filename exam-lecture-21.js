// المحاضرة 21: النسبة والنسبة المئوية، الجزء والكل، مسائل النسب المئوية
(() => {
  const g = (a, b) => b ? g(b, a % b) : a;
  const ratio = (h, a, b) => { const k = g(a, b); return `${h.A(a / k)} : ${h.A(b / k)}`; };
  const pct = (h, x) => Number.isInteger(x) ? `${h.A(x)}٪` : `${h.fx(h.d(x.toFixed(1)))}٪`;
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  const FAM = [[1, 4, "25"], [1, 2, "50"], [3, 4, "75"], [1, 3, "33.3"], [2, 3, "66.6"], [1, 8, "12.5"], [1, 16, "6.25"], [1, 5, "20"], [2, 5, "40"], [1, 10, "10"], [3, 8, "37.5"], [1, 20, "5"]];
  window.EXAMS[21] = {
    title: "اختبار محاكي: النسبة والنسبة المئوية", minutes: 25,
    blueprint: [["group", 2], ["famous", 2], ["grid", 3], ["pctOf", 2], ["reverse", 3], ["remain", 2], ["chain", 1], ["change", 2], ["timePct", 1], ["debt", 1], ["compl", 2], ["prob", 1], ["scale", 1], ["cmp", 1]],
    skills: {
      group: { title: "النسبة بين جزأين والنسبة المئوية للجزء", from: 240, to: 590, gen(R, h) {
        const A = h.A, T = R.int(4, 30) * 10, p = R.int(1, T / 10 - 1) * 10, f = T - p, ask = R.pick(["fp", "pt", "pp", "fp2"]);
        const [w1, w2] = R.pick([["الناجحين", "الراسبين"], ["الحاضرين", "الغائبين"], ["المشاركين", "غير المشاركين"]]);
        if (ask === "pp" || ask === "fp2") { const part = ask === "pp" ? p : f, v = part / T * 100; if (!Number.isInteger(v * 10)) return null;
          return { style: ask, sig: `${ask}${T}:${p}`, body: `مدرسة بها ${A(T)} طالبًا، منهم ${A(p)} من ${w1}. احسب النسبة المئوية لل${(ask === "pp" ? w1 : w2).slice(2)}`,
            ...h.strOptions(R, pct(h, v), [pct(h, 100 - v), pct(h, Math.round(part / (T - part) * 100)), pct(h, v + 10 > 100 ? v - 10 : v + 10)]),
            steps: ["النسبة المئوية = الجزء ÷ الكل × ١٠٠.", `عدد ${ask === "pp" ? w1 : w2} = ${A(part)} ، والكل = ${A(T)}.`, `${h.frac(A(part), A(T))} × ١٠٠ = ${pct(h, v)}.`], explanation: pct(h, v) }; }
        const ans = ask === "fp" ? ratio(h, f, p) : ratio(h, p, T);
        return { style: ask, sig: `${ask}${T}:${p}`, body: `مدرسة بها ${A(T)} طالبًا، منهم ${A(p)} من ${w1}. ما نسبة ${ask === "fp" ? `${w2} إلى ${w1}` : `${w1} إلى الكل`}؟`,
          ...h.strOptions(R, ans, [ask === "fp" ? ratio(h, p, f) : ratio(h, T, p), ask === "fp" ? ratio(h, f, T) : ratio(h, p, f), ratio(h, f + 1 === p ? f + 2 : f + 1, p)]),
          steps: [`عدد ${w2} = ${A(T)} − ${A(p)} = ${A(f)}.`, `النسبة = ${ask === "fp" ? `${A(f)} : ${A(p)}` : `${A(p)} : ${A(T)}`} ، وبالاختصار = ${ans}.`, "انتبه لترتيب طرفي النسبة كما ورد في السؤال."], explanation: ans };
      } },
      famous: { title: "النسب المئوية المشهورة", from: 0, to: 240, gen(R, h) {
        const [a, b, p] = R.pick(FAM), dir = R.next() < .5, P = h.fx(h.d(p)) + "٪", F = h.frac(h.A(a), h.A(b));
        const others = FAM.filter(x => x[2] !== p);
        if (dir) return { style: "f2p", sig: `f${a}:${b}`, body: `الكسر ${F} يساوي بالنسبة المئوية:`, ...h.strOptions(R, P, R.shuffle(others).slice(0, 3).map(x => h.fx(h.d(x[2])) + "٪")),
          steps: [`${F} × ١٠٠ = ${P}.`, "من النسب المشهورة: ¼ = ٢٥٪ ، ½ = ٥٠٪ ، ⅓ ≈ ٣٣,٣٪ ، ⅛ = ١٢,٥٪."], explanation: P };
        return { style: "p2f", sig: `p${a}:${b}`, body: `${P} تساوي في صورة كسر:`, ...h.strOptions(R, F, R.shuffle(others).slice(0, 3).map(x => h.frac(h.A(x[0]), h.A(x[1])))),
          steps: [`${P} = ${h.frac(h.fx(h.d(p)), "١٠٠")}.`, `وباختصار الكسر = ${F}.`], explanation: F };
      } },
      grid: { title: "نسبة الجزء المظلل في شكل مقسم", from: 590, to: 1800, gen(R, h) {
        const A = h.A, r = R.int(2, 6), c = R.int(3, 8), T = r * c, k = R.int(1, T - 1), mode = R.pick(["whole", "un", "pct", "more"]);
        const shape = `مستطيل مقسم إلى ${A(r)} صفوف × ${A(c)} أعمدة من المربعات المتطابقة، ظُلِّل منها ${A(k)} ${k <= 10 ? "مربعات" : "مربعًا"}.`;
        if (mode === "more") { const [p, q] = R.pick([[1, 2], [2, 3], [3, 4], [1, 3], [1, 4], [3, 5], [2, 5]]); if (T % q) return null; const need = T * p / q - k; if (need <= 0) return null;
          return { style: "m", sig: `m${r}:${c}:${k}:${p}:${q}`, body: `${shape}\nكم مربعًا آخر يلزم تظليله حتى تصبح نسبة المظلل إلى الشكل كله ${A(p)} : ${A(q)}؟`, ...h.numOptions(R, h.d(need), [h.d(need + 1), h.d(T * p / q), h.d(Math.max(1, need - 1) === need ? need + 2 : Math.max(1, need - 1))]),
            steps: [`عدد المربعات كلها = ${A(r)} × ${A(c)} = ${A(T)}.`, `المطلوب تظليله = ${h.frac(A(p), A(q))} × ${A(T)} = ${A(T * p / q)} مربعًا.`, `المظلل الآن ${A(k)} ، فيلزم ${A(T * p / q)} − ${A(k)} = ${A(need)}.`], explanation: A(need) }; }
        if (mode === "pct") { const v = k / T * 100; if (!Number.isInteger(v * 10)) return null; const w = Math.round(v) + R.pick([-4, 0, 4]);
          return { style: "p", sig: `p${r}:${c}:${k}:${w}`, body: h.cmpBody(shape, "النسبة المئوية للجزء المظلل", `${A(w)}٪`), ...h.cmpAnswer(h.d(v.toFixed(1)), h.d(w)),
            steps: [`عدد المربعات = ${A(T)} ، والمظلل ${A(k)}.`, `النسبة المئوية = ${h.frac(A(k), A(T))} × ١٠٠ = ${pct(h, v)}.`, `إذن ${rel(v, w)}.`], explanation: rel(v, w) }; }
        const ans = mode === "whole" ? ratio(h, k, T) : ratio(h, k, T - k);
        return { style: mode, sig: `${mode}${r}:${c}:${k}`, body: `${shape}\nما نسبة الجزء المظلل إلى ${mode === "whole" ? "الشكل كله" : "الجزء غير المظلل"}؟`,
          ...h.strOptions(R, ans, [mode === "whole" ? ratio(h, k, T - k) : ratio(h, k, T), ratio(h, T - k, T), ratio(h, k + 1, mode === "whole" ? T : T - k - 1 || T)]),
          steps: [`عدد المربعات كلها = ${A(r)} × ${A(c)} = ${A(T)} ، وغير المظلل = ${A(T - k)}.`, `النسبة = ${A(k)} : ${A(mode === "whole" ? T : T - k)} = ${ans}.`], explanation: ans };
      } },
      pctOf: { title: "حساب الجزء: النسبة × الكل", from: 2100, to: 2160, gen(R, h) {
        const dec = R.next() < .35, p = R.pick([5, 10, 15, 20, 25, 30, 40, 60, 70, 75, 80]);
        const N = dec ? h.d(R.pick(["0.8", "0.6", "0.5", "0.9", "1.2", "2.5", "0.4"])) : h.d(R.int(2, 40) * 20), v = h.div(h.mul(N, h.d(p)), h.d(100));
        return { style: dec ? "d" : "n", sig: `${p}:${h.str(N)}`, body: `كم قيمة ${h.A(p)}٪ من ${h.fx(N)}؟`, ...h.numOptions(R, v, [h.shift(v, -1), h.shift(v, 1), h.sub(N, v).s < 0 ? h.add(v, h.d(1)) : h.sub(N, v)]),
          steps: ["الجزء = النسبة × الكل.", `${h.frac(h.A(p), "١٠٠")} × ${h.fx(N)} = ${h.fx(v)}.`, dec ? "انتبه لموضع الفاصلة العشرية." : ""].filter(Boolean), explanation: h.fx(v) };
      } },
      reverse: { title: "إيجاد الكل من الجزء ونسبته", from: 2160, to: 3600, gen(R, h) {
        const A = h.A, mode = R.pick(["num", "present", "spend"]);
        if (mode === "present") { const ab = R.pick([20, 25, 40, 50, 60, 10, 30]), T = R.int(2, 20) * (100 / g(100, 100 - ab)), pres = T * (100 - ab) / 100; if (!Number.isInteger(pres) || T > 400) return null;
          return { style: "p", sig: `p${ab}:${T}`, body: `مدرسة بها عدد من الطلاب، إذا كان عدد الحاضرين ${A(pres)} طالبًا وكانت نسبة الغائبين ${A(ab)}٪ ، فكم عدد طلاب المدرسة؟`,
            ...h.numOptions(R, h.d(T), [h.d(Math.round(pres * 100 / ab)), h.d(pres + ab), h.d(T + 5)]),
            steps: [`نسبة الحاضرين = ١٠٠٪ − ${A(ab)}٪ = ${A(100 - ab)}٪.`, `${A(100 - ab)}٪ من العدد = ${A(pres)} ، فالعدد = ${A(pres)} × ${h.frac("١٠٠", A(100 - ab))} = ${A(T)}.`], explanation: A(T) }; }
        const p = R.pick([5, 10, 15, 20, 25, 30, 40, 60]), T = R.int(2, 40) * (100 / g(100, p)), v = T * p / 100; if (T > 3000 || (mode === "spend" && v < 11)) return null;
        const body = mode === "spend" ? `لدى محمد ${A(v)} ريالًا وهي تمثل ${A(p)}٪ من مصروفه، فكم مصروفه؟` : `إذا كان ${A(p)}٪ من عدد ما هو ${A(v)} ، فأوجد العدد`;
        return { style: mode, sig: `${mode}${p}:${T}`, body, ...h.numOptions(R, h.d(T), [h.d(v * p / 100 >= 1 ? Math.round(v * p / 100) : v + p), h.d(T / 10 | 0 || T + 10), h.d(T * 2)]),
          steps: ["الكل = الجزء × مقلوب النسبة.", `${A(v)} × ${h.frac("١٠٠", A(p))} = ${A(T)}.`], explanation: A(T) };
      } },
      remain: { title: "النسبة المتبقية بعد الصرف أو الطرح", from: 2400, to: 2640, gen(R, h) {
        const A = h.A, mode = R.pick(["money", "earth"]);
        if (mode === "earth") { const T = R.pick([510, 400, 600, 250, 800]), w = R.pick([70, 60, 75, 80]), v = T * (100 - w) / 100;
          return { style: "e", sig: `e${T}:${w}`, body: `إذا كانت مساحة منطقة ${A(T)} مليون م² تقريبًا، وكانت مساحة الماء فيها ${A(w)}٪ ، فأوجد مساحة اليابسة`,
            ...h.strOptions(R, `${A(v)} مليون م²`, [`${A(T * w / 100)} مليون م²`, `${A(v + 10)} مليون م²`, `${A(Math.round(T / w * 10))} مليون م²`]),
            steps: [`نسبة اليابسة = ١٠٠٪ − ${A(w)}٪ = ${A(100 - w)}٪.`, `${A(100 - w)}٪ × ${A(T)} = ${A(v)} مليون م².`], explanation: `${A(v)} مليون م²` }; }
        const T = R.pick([1000, 2000, 500, 1500, 4000]), a = R.int(50, 88), b = R.int(2, 95 - a), rest = 100 - a - b, v = T * rest / 100; if (rest <= 0 || !Number.isInteger(v)) return null;
        return { style: "m", sig: `m${T}:${a}:${b}`, body: `أعطى أب لابنه ${A(T)} ريال، وقال له: خصص ${A(a)}٪ للوقود و ${A(b)}٪ للدراسة. فكم المتبقي من المبلغ؟`,
          ...h.numOptions(R, h.d(v), [h.d(T * b / 100), h.d(T * (a - b) / 100 > 0 ? T * (a - b) / 100 : v + 50), h.d(v * 2)]),
          steps: [`المصروف = ${A(a)}٪ + ${A(b)}٪ = ${A(a + b)}٪ ، فالمتبقي ${A(rest)}٪.`, `${A(rest)}٪ × ${A(T)} = ${A(v)} ريال.`], explanation: A(v) };
      } },
      chain: { title: "نسبة من نسبة", from: 2640, to: 2800, gen(R, h) {
        const A = h.A, a = R.pick([10, 12, 20, 25, 40]), b = R.pick([20, 25, 50, 10]), v = (100 - a) * (100 - b) / 100; if (!Number.isInteger(v)) return null;
        return { style: "c", sig: `${a}:${b}`, body: `إذا كان ${A(a)}٪ من الطلاب لم يحضروا الاختبار، و ${A(b)}٪ من الحاضرين لم يجتازوه، فكم نسبة الطلاب الذين اجتازوا الاختبار من جميع الطلاب؟`,
          ...h.strOptions(R, `${A(v)}٪`, [`${A(100 - a - b)}٪`, `${A(100 - b)}٪`, `${A(100 - a)}٪`].map((x, i) => x === `${A(v)}٪` ? `${A(v + 5 + i)}٪` : x)),
          steps: [`الحاضرون = ${A(100 - a)}٪ من الطلاب.`, `المجتازون = ${A(100 - b)}٪ من الحاضرين = ${h.frac(A(100 - b), "١٠٠")} × ${A(100 - a)}٪ = ${A(v)}٪.`, "لا نطرح النسبتين مباشرة لأن الثانية من الحاضرين فقط."], explanation: `${A(v)}٪` };
      } },
      change: { title: "الزيادة والخصم بنسبة مئوية", from: 2820, to: 3240, gen(R, h) {
        const A = h.A, mode = R.pick(["ticket", "salary"]);
        if (mode === "ticket") { const p = R.int(20, 90) * 10, q = R.int(2, 5), r = R.pick([10, 20, 5, 25]), v = p * (100 + r) / 100 * q; if (!Number.isInteger(v)) return null;
          return { style: "t", sig: `t${p}:${q}:${r}`, body: `إذا كان سعر التذكرة ${A(p)} ريال، فما ثمن ${A(q)} تذاكر بعد زيادة ثمن التذكرة ${A(r)}٪؟`, ...h.numOptions(R, h.d(v), [h.d(p * q), h.d(p * q + r), h.d(p * (100 + r * q) / 100 * q | 0)]),
            steps: [`سعر التذكرة بعد الزيادة = ${A(p)} × ${h.frac(A(100 + r), "١٠٠")} = ${A(p * (100 + r) / 100)} ريال.`, `ثمن ${A(q)} تذاكر = ${A(p * (100 + r) / 100)} × ${A(q)} = ${A(v)} ريال.`], explanation: A(v) }; }
        const s = R.int(4, 12) * 1000, d = R.pick([9, 10, 5, 8, 12]), b = R.int(2, 10) * 100, v = s * (100 - d) / 100 + b;
        return { style: "s", sig: `s${s}:${d}:${b}`, body: `راتب أحمد ${A(s)} ريال، يُخصم منه ${A(d)}٪ ضريبة تقاعد ويُضاف له ${A(b)} ريال حوافز شهرية، فكم إجمالي راتبه؟`,
          ...h.numOptions(R, h.d(v), [h.d(s + b), h.d(s * (100 - d) / 100), h.d((s + b) * (100 - d) / 100)]),
          steps: [`بعد الخصم: ${A(s)} × ${h.frac(A(100 - d), "١٠٠")} = ${A(s * (100 - d) / 100)} ريال.`, `نضيف الحوافز: ${A(s * (100 - d) / 100)} + ${A(b)} = ${A(v)} ريال.`], explanation: A(v) };
      } },
      timePct: { title: "الزمن الكلي من نسبة الجزء المنجز", from: 3420, to: 3540, gen(R, h) {
        const A = h.A, [p, w] = R.pick([[25, "٢٥٪"], [20, "٢٠٪"], [50, "٥٠٪"], [10, "١٠٪"], [40, "٤٠٪"]]), t = R.int(2, 12), T = t * 100 / p; if (!Number.isInteger(T)) return null;
        return { style: "t", sig: `${p}:${t}`, body: `ينهي متسابق ${w} من السباق في ${A(t)} دقائق، فكم يحتاج لينهيه كاملًا؟`, ...h.numOptions(R, h.d(T), [h.d(T - t), h.d(t * p / 10 | 0 || T + 5), h.d(T + t)]),
          steps: [`${w} = ${h.frac(A(p), "١٠٠")} من السباق.`, `الزمن الكلي = ${A(t)} × ${h.frac("١٠٠", A(p))} = ${A(T)} دقيقة.`], explanation: `${A(T)} دقيقة` };
      } },
      debt: { title: "مجموع أجزاء بنسب مختلفة", from: 3720, to: 3900, gen(R, h) {
        const A = h.A, b = R.pick([20, 25, 30, 10, 15]), rest = 50 - b, x = R.int(1, 9) * 1000, T = x * 100 / rest; if (!Number.isInteger(T) || rest <= 0) return null;
        return { style: "d", sig: `${b}:${x}`, body: `توفي أب وعليه دين ولديه ٣ أولاد، فسدد الأول نصف الدين، والثاني ${A(b)}٪ ، والثالث ${A(x)} ريال وهو ما تبقى من الدين. فكم قيمة الدين كاملًا؟`,
          ...h.numOptions(R, h.d(T), [h.d(x * 2), h.d(T + 2000), h.d(Math.round(x * 100 / b))]),
          steps: [`الأول ٥٠٪ والثاني ${A(b)}٪ ، فالمتبقي للثالث = ١٠٠٪ − ${A(50 + b)}٪ = ${A(rest)}٪.`, `${A(rest)}٪ من الدين = ${A(x)} ، فالدين = ${A(x)} × ${h.frac("١٠٠", A(rest))} = ${A(T)} ريال.`], explanation: A(T) };
      } },
      compl: { title: "الجزء والنسبة المكملة", from: 3900, to: 4500, gen(R, h) {
        const A = h.A, p = R.pick([20, 25, 30, 40, 60, 75]), T = R.int(2, 30) * (100 / g(100, p)), part = T * p / 100, ask = R.pick(["total", "not", "fromNot"]); if (T > 3000) return null;
        const [who, act] = R.pick([["شخصًا في حفلة", "يشربون الشاي"], ["طالبًا", "يحبون الرياضيات"], ["زائرًا", "يفضلون القهوة"]]); if (part < 11) return null;
        if (ask === "fromNot") { const not = T - part;
          return { style: "fn", sig: `fn${p}:${T}`, body: `إذا كان ${A(p)}٪ من مجموعة ${act}، وعدد الذين لا ${act.replace(/^ي/, "ي")} ${A(not)} ، فكم عدد الذين ${act}؟`.replace("لا يشربون", "لا يشربون"),
            ...h.numOptions(R, h.d(part), [h.d(T), h.d(not * p / 100), h.d(part + p)]),
            steps: [`الذين لا ${act} نسبتهم ${A(100 - p)}٪ = ${A(not)} ، فالكل = ${A(not)} × ${h.frac("١٠٠", A(100 - p))} = ${A(T)}.`, `الذين ${act} = ${A(T)} − ${A(not)} = ${A(part)}.`], explanation: A(part) }; }
        const v = ask === "total" ? T : T - part;
        return { style: ask, sig: `${ask}${p}:${T}`, body: `إذا كان ${A(part)} ${who} ${act} وكانت نسبتهم ${A(p)}٪ ، فما عدد ${ask === "total" ? "الجميع" : `الذين لا ${act}`}؟`,
          ...h.numOptions(R, h.d(v), [h.d(ask === "total" ? T - part : T), h.d(part * p / 100 | 0 || v + 20), h.d(v + part)]),
          steps: [`الكل = ${A(part)} × ${h.frac("١٠٠", A(p))} = ${A(T)}.`, ask === "total" ? "هذا هو العدد الكلي." : `الذين لا ${act} = ${A(T)} − ${A(part)} = ${A(v)}.`], explanation: A(v) };
      } },
      prob: { title: "العدد الكلي من الاحتمال", from: 4560, to: 4680, gen(R, h) {
        const A = h.A, q = R.pick([2, 3, 4, 5, 6]), k = R.int(2, 10), T = q * k;
        return { style: "p", sig: `${q}:${k}`, body: `كيس فيه كرات حمراء وخضراء وصفراء، إذا كان احتمال اختيار الكرة الخضراء = ${h.frac("١", A(q))} ، وكان عدد الكرات الخضراء ${A(k)} ، فأوجد مجموع الكرات`,
          ...h.numOptions(R, h.d(T), [h.d(T + q), h.d(k + q), h.d(T * 2)]),
          steps: ["الاحتمال = عدد الكرات الخضراء ÷ مجموع الكرات.", `${h.frac("١", A(q))} = ${h.frac(A(k), "المجموع")} ، فالمجموع = ${A(k)} × ${A(q)} = ${A(T)}.`], explanation: A(T) };
      } },
      scale: { title: "من نسبة معلومة إلى نسبة أخرى من العدد نفسه", from: 4680, to: 4980, gen(R, h) {
        const A = h.A, a = R.pick([2, 4, 5, 10, 20, 25]), b = R.pick([10, 20, 30, 40, 50, 60, 75, 80]), v1 = R.int(2, 30) * 10, N = v1 * 100 / a, v2 = N * b / 100; if (a === b || !Number.isInteger(v2) || N > 20000) return null;
        return { style: "s", sig: `${a}:${b}:${v1}`, body: `${A(a)}٪ من عدد ما = ${A(v1)} ، كم يساوي ${A(b)}٪ من نفس العدد؟`, ...h.numOptions(R, h.d(v2), [h.d(N), h.d(v1 * b / a + v1), h.d(v2 - v1 > 0 ? v2 - v1 : v2 + v1)]),
          steps: [`العدد = ${A(v1)} × ${h.frac("١٠٠", A(a))} = ${A(N)}.`, `${A(b)}٪ منه = ${A(N)} × ${h.frac(A(b), "١٠٠")} = ${A(v2)}.`, `أو مباشرة: ${A(v1)} × ${h.frac(A(b), A(a))} = ${A(v2)}.`], explanation: A(v2) };
      } },
      cmp: { title: "المقارنة بين نسب مئوية", from: 2280, to: 5168, gen(R, h) {
        const A = h.A, mode = R.pick(["swap", "ab", "share"]);
        if (mode === "swap") { const a = R.int(1, 9) * 10, b = R.int(1, 9) * 10, x = a * b, y = b * a;
          return { style: "s", sig: `s${a}:${b}`, body: h.cmpBody("", `${A(a)}٪ من ${A(b)}`, `${A(b)}٪ من ${A(a)}`), ...h.cmpAnswer(h.d(x), h.d(y)),
            steps: [`${A(a)}٪ من ${A(b)} = ${h.frac(`${A(a)} × ${A(b)}`, "١٠٠")} ، و ${A(b)}٪ من ${A(a)} = ${h.frac(`${A(b)} × ${A(a)}`, "١٠٠")}.`, "الضرب إبدالي، إذن القيمتان متساويتان."], explanation: "القيمتان متساويتان" }; }
        if (mode === "share") { const p = R.pick([5, 10, 2, 4]), half = R.int(2, 10) * 1000, v = 2 * half * p / 100, w = v + R.pick([-100, 0, 100]);
          return { style: "h", sig: `h${p}:${half}:${w}`, body: h.cmpBody(`إذا كان نصيب أحد العاملين ${A(p)}٪ من مبيعات الشركة، وكانت نصف مبيعاتها ${A(half)} ريال`, "ما أخذه العامل", A(w)), ...h.cmpAnswer(h.d(v), h.d(w)),
            steps: [`المبيعات كلها = ${A(half)} × ٢ = ${A(2 * half)} ريال.`, `نصيب العامل = ${A(p)}٪ × ${A(2 * half)} = ${A(v)} ريال.`, `إذن ${rel(v, w)}.`], explanation: rel(v, w) }; }
        const p = R.pick([20, 30, 40, 25]), q = R.pick([10, 20, 50]), x = R.int(3, 30) * 10, y = R.int(3, 30) * 10, a = x * 100 / p, b = y * 100 / q; if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
        return { style: "ab", sig: `ab${p}:${x}:${q}:${y}`, body: h.cmpBody(`إذا كان ${A(p)}٪ من أ = ${A(x)} ، و ${A(q)}٪ من ب = ${A(y)}`, "أ", "ب"), ...h.cmpAnswer(h.d(a), h.d(b)),
          steps: [`أ = ${A(x)} × ${h.frac("١٠٠", A(p))} = ${A(a)}.`, `ب = ${A(y)} × ${h.frac("١٠٠", A(q))} = ${A(b)}.`, `إذن ${rel(a, b)}.`], explanation: rel(a, b) };
      } }
    }
  };
})();
