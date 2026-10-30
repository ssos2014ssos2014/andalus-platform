// المحاضرة 7: النسبة، النسبة المئوية، المتتابعات، خانة الآحاد، متباينة المثلث، المثلث الثلاثيني الستيني، التباديل والتوافيق
(() => {
  const g = (x, y) => y ? g(y, x % y) : x;
  const fact = n => n <= 1 ? 1 : n * fact(n - 1);
  window.EXAMS[7] = {
    title: "اختبار محاكي: النسبة والنسبة المئوية والمتتابعات والتباديل", minutes: 25,
    blueprint: [["ratioChain", 2], ["ratioPart", 2], ["ratioPct", 2], ["pctCmp", 2], ["pctOf", 2], ["pctRev", 3], ["pctFig", 1], ["seq", 3], ["units", 3], ["triIneq", 1], ["tri3060", 1], ["perm", 2]],
    skills: {
      ratioChain: { title: "ربط نسبتين (أ : ب و ب : ج ← أ : ج)", from: 0, to: 160, gen(R, h) {
        const A = h.A, a = R.int(1, 9), b = R.int(1, 9), b2 = R.int(1, 9), c = R.int(1, 9); if (g(a, b) > 1 || g(b2, c) > 1) return null;
        const L = b * b2 / g(b, b2), x = a * (L / b), z = c * (L / b2), k = g(x, z), ans = `${A(x / k)} : ${A(z / k)}`;
        return { style: "c", sig: `${a}${b}${b2}${c}`, body: `إذا كانت نسبة أ : ب = ${A(a)} : ${A(b)} ، ونسبة ب : ج = ${A(b2)} : ${A(c)} ، فما نسبة أ : ج ؟`,
          ...h.strOptions(R, ans, [`${A(a)} : ${A(c)}`, `${A(z / k)} : ${A(x / k)}`, `${A(a * b2)} : ${A(b * c + 1)}`, `${A(a + b2)} : ${A(b + c)}`]),
          steps: ["نوحّد قيمة ب في النسبتين بالضرب (كما في المحاضرة).", `ب في الأولى ${A(b)} وفي الثانية ${A(b2)}، نجعلها ${A(L)}: نضرب الأولى في ${A(L / b)} والثانية في ${A(L / b2)}.`,
            `أ : ب : ج = ${A(x)} : ${A(L)} : ${A(z)} ، إذن أ : ج = ${A(x)} : ${A(z)}${k > 1 ? ` = ${ans}` : ""}.`], explanation: ans };
      } },
      ratioPart: { title: "إيجاد جزء من الكل باستخدام النسبة", from: 100, to: 200, gen(R, h) {
        const A = h.A, d = R.pick([3, 4, 5, 6, 7, 8, 9, 10]), n = R.int(1, d - 1), total = d * R.int(3, 12); if (g(n, d) > 1) return null;
        const who = R.pick([["مدرسة بها", "طالبًا", "الناجحين", "الراسبين"], ["فصل فيه", "طالبًا", "الحاضرين", "الغائبين"], ["صندوق فيه", "كرة", "الكرات الحمراء", "الكرات غير الحمراء"]]);
        const ask = R.pick(["rest", "part"]), part = total * n / d, rest = total - part, v = ask === "rest" ? rest : part;
        return { style: ask, sig: `${n}/${d}:${total}:${ask}`, body: `${who[0]} ${A(total)} ${who[1]}، ونسبة ${who[2]} إلى الكل ${A(n)} : ${A(d)} ، فما عدد ${ask === "rest" ? who[3] : who[2]}؟`,
          ...h.numOptions(R, h.d(v), [h.d(ask === "rest" ? part : rest), h.d(total / d), h.d(total - n)]),
          steps: [`نسبة ${who[2]} إلى الكل ${A(n)} : ${A(d)} أي ${A(n)}/${A(d)} من العدد${ask === "rest" ? `، فنسبة ${who[3]} = ${A(d - n)}/${A(d)}` : ""}.`,
            `العدد = ${A(ask === "rest" ? d - n : n)}/${A(d)} × ${A(total)} = ${A(v)}.`], explanation: A(v) };
      } },
      ratioPct: { title: "النسب والنسب المئوية من أعداد (الناجحون والراسبون)", from: 200, to: 400, gen(R, h) {
        const A = h.A, [p, f] = R.pick([[2, 1], [3, 1], [4, 1], [3, 2], [1, 1], [4, 3], [9, 1]]), k = R.int(10, 60), P = p * k, F = f * k, T = P + F;
        const ask = R.pick(["fp", "pt", "pctP", "pctF"]);
        if (ask === "pctP" || ask === "pctF") { const num = ask === "pctP" ? P : F, pc = h.div(h.d(num * 100), h.d(T)); if (!pc || pc.s > 1) return null;
          return { style: ask, sig: `${ask}:${P}:${F}`, body: `مدرسة بها ${A(T)} طالبًا نجح منهم ${A(P)} طالبًا، فما النسبة المئوية لل${ask === "pctP" ? "ناجحين" : "راسبين"}؟`,
            ...h.strOptions(R, `${h.fx(pc)}٪`, [`${h.fx(h.sub(h.d(100), pc))}٪`, `${A(num)}٪`, `${h.fx(h.div(h.d(num * 100), h.d(ask === "pctP" ? F : P)) || h.d(1))}٪`, `${A(Math.round(num / T * 10))}٪`]),
            steps: [`عدد ${ask === "pctP" ? "الناجحين" : "الراسبين"} = ${A(num)}${ask === "pctF" ? ` (${A(T)} − ${A(P)})` : ""}.`, `النسبة المئوية = (${A(num)} ÷ ${A(T)}) × ١٠٠ = ${h.fx(pc)}٪.`], explanation: `${h.fx(pc)}٪` }; }
        const [x, y] = ask === "fp" ? [F, P] : [P, T], kk = g(x, y), ans = `${A(x / kk)} : ${A(y / kk)}`;
        return { style: ask, sig: `${ask}:${P}:${F}`, body: `مدرسة بها ${A(T)} طالبًا نجح منهم ${A(P)} طالبًا، فما نسبة ${ask === "fp" ? "الراسبين إلى الناجحين" : "الناجحين إلى الكل"}؟`,
          ...h.strOptions(R, ans, [`${A(y / kk)} : ${A(x / kk)}`, ask === "fp" ? `${A(F / g(F, T))} : ${A(T / g(F, T))}` : `${A(P / g(P, F))} : ${A(F / g(P, F))}`, `${A(x / kk + 1)} : ${A(y / kk)}`, `١ : ${A(y / kk + 1)}`]),
          steps: [`عدد الراسبين = ${A(T)} − ${A(P)} = ${A(F)}.`, `النسبة = ${A(x)} : ${A(y)} ، ونبسطها بالقسمة على ${A(kk)}: ${ans}. (انتبه لترتيب الطرفين كما في السؤال)`], explanation: ans };
      } },
      pctCmp: { title: "المقارنة بين نسبتين مئويتين", from: 420, to: 540, gen(R, h) {
        const A = h.A, style = R.pick(["swap", "money"]);
        if (style === "swap") { const a = R.int(1, 9) * 10, b = R.int(1, 9) * 10, other = R.pick([[b, a], [b, a + 10], [b + 10, a]]);
          const v1 = a * b, v2 = other[0] * other[1];
          return { style, sig: `s:${a}${b}:${other}`, body: h.cmpBody("", `${A(a)}٪ من ${A(b)}`, `${A(other[0])}٪ من ${A(other[1])}`), ...h.cmpAnswer(h.d(v1), h.d(v2)),
            steps: ["س٪ من ص = (س × ص) ÷ ١٠٠ ، لذلك س٪ من ص = ص٪ من س دائمًا.", `القيمة الأولى = ${A(a)} × ${A(b)} ÷ ١٠٠ = ${h.fx(h.div(h.d(v1), h.d(100)))}.`, `القيمة الثانية = ${A(other[0])} × ${A(other[1])} ÷ ١٠٠ = ${h.fx(h.div(h.d(v2), h.d(100)))}.`], explanation: "" }; }
        const s1 = R.int(2, 9) * 1000, p1 = R.pick([10, 20, 25, 30, 40, 50]), s2 = R.int(2, 9) * 1000, p2 = R.pick([10, 20, 25, 30, 40, 50]), v1 = s1 * p1 / 100, v2 = s2 * p2 / 100;
        return { style, sig: `m:${s1}${p1}${s2}${p2}`, body: h.cmpBody("ما يوفّره كل موظف من راتبه:", `الأول راتبه ${A(s1)} ريال ويوفّر منه ${A(p1)}٪`, `الثاني راتبه ${A(s2)} ريال ويوفّر منه ${A(p2)}٪`), ...h.cmpAnswer(h.d(v1), h.d(v2)),
          steps: [`ما يوفّره الأول = ${A(p1)}٪ × ${A(s1)} = ${A(v1)} ريال.`, `ما يوفّره الثاني = ${A(p2)}٪ × ${A(s2)} = ${A(v2)} ريال.`, v1 > v2 ? "إذن القيمة الأولى أكبر." : v1 < v2 ? "إذن القيمة الثانية أكبر." : "إذن القيمتان متساويتان."], explanation: "" };
      } },
      pctOf: { title: "حساب النسبة المئوية من عدد ومكمّلها", from: 520, to: 780, gen(R, h) {
        const A = h.A, style = R.pick(["comp", "dec", "plain"]);
        if (style === "dec") { const p = R.pick([10, 20, 25, 30, 40, 50, 60, 75, 80, 90]), x = { i: R.int(1, 9), s: 1 }, v = h.div(h.mul(h.d(p), x), h.d(100));
          return { style, sig: `d:${p}:${h.str(x)}`, body: `كم قيمة ${A(p)}٪ من ${h.fx(x)} ؟`, ...h.numOptions(R, v, [h.shift(v, -1), h.shift(v, 1), h.mul(h.d(p), x)]),
            steps: [`${A(p)}٪ = ${A(p)} ÷ ١٠٠ = ${h.fx(h.div(h.d(p), h.d(100)))}.`, `${h.fx(h.div(h.d(p), h.d(100)))} × ${h.fx(x)} = ${h.fx(v)} (بقاعدة ضرب العشرية).`], explanation: h.fx(v) }; }
        const tot = R.int(2, 99) * 10, p = R.pick([10, 20, 30, 40, 60, 70, 75, 80, 90, 25, 35, 65]), comp = 100 - p, vComp = tot * comp / 100, vP = tot * p / 100;
        if (!Number.isInteger(vComp)) return null;
        if (style === "comp") return { style, sig: `c:${tot}:${p}`, body: `إذا كانت مساحة منطقة ${A(tot)} كم² تقريبًا، ونسبة المياه فيها ${A(p)}٪، فما مساحة اليابسة؟`, ...h.numOptions(R, h.d(vComp), [h.d(vP), h.d(tot - p), h.d(vComp * 10)]),
          steps: [`نسبة اليابسة = ١٠٠٪ − ${A(p)}٪ = ${A(comp)}٪.`, `مساحة اليابسة = ${A(comp)}٪ × ${A(tot)} = ${A(comp)}/١٠٠ × ${A(tot)} = ${A(vComp)} كم².`], explanation: A(vComp) };
        return { style, sig: `p:${tot}:${p}`, body: `ما قيمة ${A(p)}٪ من ${A(tot)} ؟`, ...h.numOptions(R, h.d(vP), [h.d(vComp), h.d(tot / p | 0 || vP + 1), h.d(vP * 10)]),
          steps: [`${A(p)}٪ من ${A(tot)} = ${A(p)}/١٠٠ × ${A(tot)} = ${A(vP)}.`], explanation: A(vP) };
      } },
      pctRev: { title: "إيجاد الكل من نسبته المئوية", from: 620, to: 800, gen(R, h) {
        const A = h.A, p = R.pick([5, 10, 15, 20, 25, 40, 50, 75, 30, 60]), whole = R.int(2, 40) * (100 / g(100, p)), part = whole * p / 100; if (!Number.isInteger(part) || whole > 2000) return null;
        const style = R.pick(["num", "race", "money"]);
        const body = style === "num" ? `إذا كان ${A(p)}٪ من عدد ما هو ${A(part)} ، فأوجد العدد.`
          : style === "race" ? `أنهى متسابق ${A(p)}٪ من السباق في ${A(part)} دقيقة، فكم دقيقة يحتاج لينهيه كاملًا (بنفس السرعة)؟`
          : `لدى ${R.pick(["محمد", "خالد", "سعد"])} ${A(part)} ريالًا وهو يمثل ${A(p)}٪ من مصروفه، فكم مصروفه؟`;
        return { style, sig: `${style}:${p}:${part}`, body, ...h.numOptions(R, h.d(whole), [h.d(part * p / 100 | 0 || part + 1), h.d(part + p), h.d(whole * 2)]),
          steps: ["المطلوب هو الكل، والمعلوم جزء منه بنسبته: الكل = الجزء × ١٠٠ ÷ النسبة.", `الكل = ${A(part)} × ١٠٠ ÷ ${A(p)} = ${A(whole)}.`, `للتأكد: ${A(p)}٪ من ${A(whole)} = ${A(part)} ✓`], explanation: A(whole) };
      } },
      pctFig: { title: "النسبة المئوية في شكل (المربعات الصغيرة)", from: 780, to: 900, gen(R, h) {
        const A = h.A, p = R.pick([10, 15, 20, 25, 30, 40, 5, 12]), whole = R.int(2, 20) * (100 / g(100, p)), n = whole * p / 100; if (!Number.isInteger(n) || whole > 400) return null;
        return { style: "f", sig: `${p}:${n}`, body: `مربع كبير مقسم إلى مربعات صغيرة متطابقة، إذا كانت المربعات الصغيرة المظللة وعددها ${A(n)} تمثل ${A(p)}٪ من المربع الكبير، فكم عدد المربعات الصغيرة داخل الشكل كله؟`,
          ...h.numOptions(R, h.d(whole), [h.d(n * 10), h.d(whole - n), h.d(n + p)]),
          steps: [`${A(p)}٪ من الشكل كله = ${A(n)} مربعات.`, `الشكل كله = ${A(n)} × ١٠٠ ÷ ${A(p)} = ${A(whole)} مربعًا.`], explanation: A(whole) };
      } },
      seq: { title: "المتتابعات الحسابية (الحد النوني وترتيب الحد)", from: 900, to: 1110, gen(R, h) {
        const A = h.A, a = R.int(-5, 9), d = R.int(2, 9), style = R.pick(["nth", "pos", "member"]), S = x => x < 0 ? `−${A(-x)}` : A(x);
        const show = [0, 1, 2].map(i => S(a + i * d)).join(" ، ");
        if (style === "nth") { const n = R.pick([10, 20, 25, 50, 100, 101]), v = a + (n - 1) * d;
          return { style, sig: `n:${a}${d}${n}`, body: `أوجد الحد رقم ${A(n)} في المتتابعة: ${show} ، …`, ...h.strOptions(R, S(v), [S(a + n * d), S(n * d), S(v - a), S(v + d * 2)]),
            steps: ["الحد النوني = الحد الأول + (ن − ١) × الأساس.", `الأساس = ${A(d)} ، فالحد رقم ${A(n)} = ${S(a)} + (${A(n)} − ١) × ${A(d)} = ${S(a)} + ${A((n - 1) * d)} = ${S(v)}.`], explanation: S(v) }; }
        if (style === "pos") { const n = R.int(8, 60), last = a + (n - 1) * d;
          return { style, sig: `p:${a}${d}${n}`, body: `ما ترتيب الحد ${S(last)} في المتتابعة: ${show} ، … ؟`, ...h.numOptions(R, h.d(n), [h.d(n - 1), h.d(n + 1), h.d(Math.round((last - a) / d) * 2 || n + 3)]),
            steps: ["ترتيب الحد = (الحد الأخير − الحد الأول + الأساس) ÷ الأساس.", `= (${S(last)} − ${S(a)} + ${A(d)}) ÷ ${A(d)} = ${A(last - a + d)} ÷ ${A(d)} = ${A(n)}.`], explanation: A(n) }; }
        const k = R.int(3, 9), start = -2 * k, ok = R.next() < .5, X = ok ? k * R.int(20, 90) : k * R.int(20, 90) + R.int(1, k - 1);
        return { style, sig: `m:${k}:${X}`, body: `هل العدد ${A(X)} أحد حدود المتتابعة: ${[0, 1, 2, 3].map(i => S(start + i * k)).join(" ، ")} ، … ؟`, options: ["نعم", "لا", "لا يمكن التحديد", "فقط إذا كان زوجيًا"], correct: ok ? 0 : 1,
          steps: [`حدود المتتابعة كلها مضاعفات للعدد ${A(k)} (تزيد بمقدار ${A(k)} وفيها الصفر).`, `${A(X)} ÷ ${A(k)} = ${ok ? A(X / k) + " بدون باقٍ" : "عدد غير صحيح"} ، إذن ${ok ? "هو أحد حدودها" : "ليس من حدودها"}.`], explanation: ok ? "نعم" : "لا" };
      } },
      units: { title: "رقم الآحاد في القوى", from: 1110, to: 1480, gen(R, h) {
        const A = h.A, b = R.pick([2, 3, 4, 7, 8, 9, 5, 6, 12, 13, 17, 22]), e = R.int(5, 99), v = Number(BigInt(b % 10) ** BigInt(e % 4 + 4) % 10n);
        const sup = String(e).split("").map(x => "⁰¹²³⁴⁵⁶⁷⁸⁹"[x]).join(""), last = b % 10, r = e % 4;
        const cyc = [1, 2, 3, 4].map(k => Number(BigInt(last) ** BigInt(k) % 10n));
        return { style: "u", sig: `${b}^${e}`, body: `ما رقم الآحاد في ناتج ${A(b)}${sup} ؟`, ...h.strOptions(R, A(v), R.shuffle([...new Set([...cyc, last, (last * 2) % 10, 0, 6, 1, 4, 9])].filter(x => x !== v)).slice(0, 3).map(A)),
          steps: ["رقم الآحاد يتكرر كل ٤ قوى، فننظر إلى آحاد الأساس فقط ونقسم الأس على ٤.", last === 5 || last === 6 || last === 1 || last === 0 ? `آحاد الأساس ${A(last)}، وأي قوة له آحادها ${A(last)}.` : `آحاد القوى: ${cyc.map((c, i) => `${A(last)}${"¹²³⁴"[i]} ← ${A(c)}`).join(" ، ")}.`,
            last === 5 || last === 6 || last === 1 ? `إذن رقم الآحاد ${A(v)}.` : `${A(e)} ÷ ٤ يبقى ${A(r)}${r === 0 ? " (أي مضاعف لـ ٤ فنأخذ القوة الرابعة)" : ""}، فرقم الآحاد مثل ${A(last)}${"⁴¹²³"[r]} = ${A(v)}.`], explanation: A(v) };
      } },
      triIneq: { title: "متباينة المثلث (فترة الضلع الثالث)", from: 1500, to: 1620, gen(R, h) {
        const A = h.A, a = R.int(2, 15), b = R.int(a, 20), lo = b - a, hi = a + b, style = R.pick(["range", "which"]);
        if (style === "range") return { style, sig: `r:${a}${b}`, body: `مثلث طولا ضلعين من أضلاعه ${A(a)} سم و ${A(b)} سم، أوجد الفترة التي يقع فيها طول الضلع الثالث.`,
          ...h.strOptions(R, `بين ${A(lo)} و ${A(hi)}`, [`بين ${A(a)} و ${A(b)}`, `بين ${A(lo)} و ${A(b)}`, `بين ${A(b)} و ${A(hi)}`, `بين ${A(lo + 1)} و ${A(hi - 1)}`]),
          steps: ["مجموع أي ضلعين في المثلث أكبر من الثالث، والفرق بينهما أصغر من الثالث.", `${A(b)} − ${A(a)} < الثالث < ${A(b)} + ${A(a)} ← ${A(lo)} < الثالث < ${A(hi)}.`], explanation: "" };
        const good = R.int(lo + 1, hi - 1), bad = R.shuffle([lo, hi, hi + 1, hi + 3, Math.max(0, lo - 1)].filter(x => x !== good && x > 0)).slice(0, 3);
        return { style, sig: `w:${a}${b}${good}`, body: `مثلث طولا ضلعين من أضلاعه ${A(a)} سم و ${A(b)} سم، أي مما يلي يمكن أن يكون طول الضلع الثالث؟`, ...h.strOptions(R, A(good), bad.map(A)),
          steps: [`الضلع الثالث يجب أن يكون أكبر من ${A(b)} − ${A(a)} = ${A(lo)} وأصغر من ${A(b)} + ${A(a)} = ${A(hi)}.`, `${A(good)} هو الخيار الوحيد الواقع بين ${A(lo)} و ${A(hi)} (لا يساوي أيًا منهما).`], explanation: A(good) };
      } },
      tri3060: { title: "المثلث الثلاثيني الستيني", from: 1620, to: 1840, gen(R, h) {
        const A = h.A, c = R.int(1, 12) * 2, style = R.pick(["s30", "s60", "circle"]);
        if (style === "circle") { const s = c / 2, ans = `${A(c)}ط`;
          return { style, sig: `c:${c}`, body: `مثلث قائم مرسوم داخل دائرة ووتره قطرها، فإذا كانت إحدى زواياه ٣٠° وطول الضلع المقابل لها ${A(s)} سم، فما محيط الدائرة؟`, ...h.strOptions(R, ans, [`${A(s)}ط`, `${A(c * c / 4)}ط`, `${A(2 * c)}ط`, `${A(c)}`]),
            steps: [`الضلع المقابل لـ ٣٠° = نصف الوتر، فالوتر = ٢ × ${A(s)} = ${A(c)} سم.`, "الوتر هنا هو قطر الدائرة (المثلث قائم ومرسوم في نصف دائرة).", `المحيط = القطر × ط = ${ans} سم.`], explanation: ans }; }
        if (style === "s30") return { style, sig: `a:${c}`, body: `مثلث قائم الزاوية فيه زاوية ٣٠°، وطول وتره ${A(c)} سم، فما طول الضلع المقابل للزاوية ٣٠°؟`, ...h.strOptions(R, A(c / 2), [h.rad(c / 2, 3), A(c), A(c / 4 || 1) === A(c / 2) ? A(c + 1) : A(c / 4), h.rad(c / 2, 2)].filter(Boolean)),
          steps: ["في المثلث الثلاثيني الستيني: الضلع المقابل لـ ٣٠° = ½ الوتر.", `= ½ × ${A(c)} = ${A(c / 2)} سم.`], explanation: A(c / 2) };
        const ans = h.rad(c / 2, 3);
        return { style, sig: `b:${c}`, body: `مثلث قائم الزاوية فيه زاوية ٣٠°، وطول وتره ${A(c)} سم، فما طول الضلع المقابل للزاوية ٦٠°؟`, ...h.strOptions(R, ans, [A(c / 2), h.rad(c, 3), h.rad(c / 2, 2), A(c)]),
          steps: ["في المثلث الثلاثيني الستيني: الضلع المقابل لـ ٦٠° = (√٣ ÷ ٢) × الوتر.", `= (√٣ ÷ ٢) × ${A(c)} = ${ans} سم.`], explanation: ans };
      } },
      perm: { title: "التباديل والتوافيق", from: 1840, to: 2077, gen(R, h) {
        const A = h.A, style = R.pick(["fact", "P", "C", "circ"]);
        if (style === "fact") { const n = R.int(3, 7), v = fact(n);
          return { style, sig: `f:${n}`, body: `بكم طريقة يمكن ترتيب ${A(n)} كتب مختلفة على رف في صف واحد؟`, ...h.numOptions(R, h.d(v), [h.d(n * n), h.d(fact(n - 1)), h.d(n * (n - 1))]),
            steps: [`ترتيب ${A(n)} أشياء مختلفة = ${A(n)}! (مضروب العدد).`, `${A(n)}! = ${Array.from({ length: n }, (_, i) => A(n - i)).join(" × ")} = ${A(v)}.`], explanation: A(v) }; }
        if (style === "circ") { const n = R.int(4, 7), v = fact(n - 1);
          return { style, sig: `o:${n}`, body: `بكم طريقة يستطيع ${A(n)} أشخاص أن يجلسوا حول طاولة دائرية؟`, ...h.numOptions(R, h.d(v), [h.d(fact(n)), h.d(n * (n - 1)), h.d(v / 2)]),
            steps: ["التباديل الدائرية لـ ن من الأشخاص = (ن − ١)!", `(${A(n)} − ١)! = ${A(n - 1)}! = ${Array.from({ length: n - 1 }, (_, i) => A(n - 1 - i)).join(" × ")} = ${A(v)}.`], explanation: A(v) }; }
        const n = R.int(5, 10), r = R.int(2, 4), P = fact(n) / fact(n - r), C = P / fact(r);
        if (style === "P") return { style, sig: `p:${n}${r}`, body: `بكم طريقة يمكن اختيار ${A(r)} طلاب من ${A(n)} لشغل ${A(r)} مناصب مختلفة (رئيس، نائب${r > 2 ? "، أمين…" : ""})؟ (الترتيب مهم)`, ...h.numOptions(R, h.d(P), [h.d(C), h.d(n * r), h.d(fact(n))]),
          steps: ["الترتيب مهم ← تباديل.", `عدد التباديل = ${Array.from({ length: r }, (_, i) => A(n - i)).join(" × ")} (نضرب ${A(r)} أعداد تنازليًا من ${A(n)}) = ${A(P)}.`], explanation: A(P) };
        return { style, sig: `c:${n}${r}`, body: `بكم طريقة يمكن اختيار لجنة من ${A(r)} طلاب من بين ${A(n)} طلاب؟ (الترتيب غير مهم)`, ...h.numOptions(R, h.d(C), [h.d(P), h.d(n * r), h.d(C + n)]),
          steps: ["الترتيب غير مهم ← توافيق.", `التوافيق = التباديل ÷ ${A(r)}! = (${Array.from({ length: r }, (_, i) => A(n - i)).join(" × ")}) ÷ (${Array.from({ length: r }, (_, i) => A(r - i)).join(" × ")}) = ${A(P)} ÷ ${A(fact(r))} = ${A(C)}.`], explanation: A(C) };
      } }
    }
  };
})();
