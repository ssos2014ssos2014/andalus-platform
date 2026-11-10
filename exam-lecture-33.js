// المحاضرة 33: المتتابعات والأنماط العددية
(() => {
  const S = (h, x) => x < 0 ? `−${h.A(-x)}` : h.A(x);
  const L = (h, a) => a.map(x => S(h, x)).join(" ، ");
  const nOpts = (h, R, v, w) => h.strOptions(R, S(h, v), [...new Set(w.filter(x => x !== v))].map(x => S(h, x)).concat([S(h, v + 1), S(h, v - 1), S(h, v + 2)]).filter((x, i, a) => a.indexOf(x) === i && x !== S(h, v)).slice(0, 3));
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  window.EXAMS[33] = {
    title: "اختبار محاكي: المتتابعات والأنماط", minutes: 25,
    blueprint: [["grow", 3], ["mulAdd", 2], ["alt", 2], ["fact", 2], ["arith", 3], ["sticks", 2], ["neg", 2], ["cmp", 2], ["inter", 1], ["fib", 1], ["ones", 1], ["sumBack", 2], ["common", 1]],
    skills: {
      grow: { title: "فروق متزايدة بانتظام", from: 0, to: 50, gen(R, h) {
        const a = R.int(1, 20), d = R.int(1, 8), k = R.pick([1, 2]), n = R.int(4, 6), s = [a]; for (let i = 0; i < n; i++) s.push(s[i] + d + i * k); const v = s[n] + d + n * k; s.length = n + 1;
        return { style: "g" + k, sig: `${a}:${d}:${k}:${n}`, body: `أكمل الحد التالي: ${L(h, s)} ، ....`, ...nOpts(h, R, v, [s[n] + d + (n - 1) * k, v + k, s[n] + (s[n] - s[n - 1])]),
          steps: [`الفروق: ${s.slice(1).map((x, i) => "+" + h.A(x - s[i])).join(" ، ")} ، تزيد كل مرة ${h.A(k)}.`, `الفرق التالي = ${h.A(d + n * k)} ، فالحد التالي = ${h.A(s[n])} + ${h.A(d + n * k)} = ${h.A(v)}.`], explanation: S(h, v) };
      } },
      mulAdd: { title: "نمط: اضرب ثم أضف", from: 50, to: 340, gen(R, h) {
        const m = R.pick([2, 2, 3]), c = R.pick([1, 1, 2, -1]), a = R.int(0, 5), n = R.int(4, 6), s = [a]; for (let i = 0; i < n; i++) s.push(s[i] * m + c); if (s[n] > 2000) return null; const v = s[n] * m + c;
        return { style: `m${m}${c}`, sig: `${m}:${c}:${a}:${n}`, body: `ما العدد التالي في المتتابعة: ${L(h, s)} ، ....؟`, ...nOpts(h, R, v, [v - 1, v + 1, s[n] + (s[n] - s[n - 1])]),
          steps: [`كل حد = الحد السابق × ${h.A(m)} ${c > 0 ? "+" : "−"} ${h.A(Math.abs(c))}.`, `مثلًا: ${S(h, s[1])} × ${h.A(m)} ${c > 0 ? "+" : "−"} ${h.A(Math.abs(c))} = ${S(h, s[2])}.`, `التالي = ${S(h, s[n])} × ${h.A(m)} ${c > 0 ? "+" : "−"} ${h.A(Math.abs(c))} = ${S(h, v)}.`], explanation: S(h, v) };
      } },
      alt: { title: "نمط بعمليتين متناوبتين", from: 150, to: 960, gen(R, h) {
        const A = h.A, mode = R.pick(["addMul", "addAdd", "mulMul"]), a = R.int(2, 7), n = R.pick([5, 6]);
        const [o1, o2, desc] = mode === "addMul" ? (() => { const p = R.int(2, 5); return [x => x + p, x => x * 2, `+${A(p)} ثم ×٢`]; })() : mode === "addAdd" ? (() => { const p = R.int(2, 6), q = R.int(7, 12); return [x => x + p, x => x + q, `+${A(p)} ثم +${A(q)}`]; })() : (() => { const p = R.pick([2, 3]), q = R.pick([2, 3]); return [x => x * p, x => x * q, `×${A(p)} ثم ×${A(q)}`]; })();
        const s = [a]; for (let i = 0; i < n; i++) s.push(i % 2 ? o2(s[i]) : o1(s[i])); const v = n % 2 ? o2(s[n]) : o1(s[n]); if (v > 3000) return null;
        return { style: mode, sig: `${mode}:${a}:${desc}:${n}`, body: `أكمل الحد الناقص: ${L(h, s)} ، ....`, ...nOpts(h, R, v, [n % 2 ? o1(s[n]) : o2(s[n]), v + 2, s[n] * 2]),
          steps: [`النمط يتناوب بين عمليتين: ${desc}.`, `آخر عملية كانت ${n % 2 ? "الأولى" : "الثانية"}، فالعملية التالية ${n % 2 ? "الثانية" : "الأولى"}.`, `الحد الناقص = ${S(h, v)}.`], explanation: S(h, v) };
      } },
      fact: { title: "نمط الضرب في أعداد متزايدة", from: 400, to: 850, gen(R, h) {
        const st = R.pick([1, 2]), a = R.pick([1, 2, 3]), s = [a]; for (let i = 0; i < 5; i++) s.push(s[i] * (st + i)); const miss = R.next() < .5;
        if (miss) { const k = R.int(3, 4), v = s[k], show = s.map((x, i) => i === k ? "س" : S(h, x)).join(" ، ");
          return { style: "m", sig: `m${st}:${a}:${k}`, body: `في المتتابعة ${show} ، ما قيمة س؟`, ...nOpts(h, R, v, [s[k - 1] * 2, s[k + 1] / 2, v + s[k - 1]]),
            steps: [`كل حد = السابق × (${h.A(st)} ثم ${h.A(st + 1)} ثم ${h.A(st + 2)} ...).`, `س = ${S(h, s[k - 1])} × ${h.A(st + k - 1)} = ${S(h, v)} ، وتحقق: ${S(h, v)} × ${h.A(st + k)} = ${S(h, s[k + 1])}.`], explanation: S(h, v) }; }
        const v = s[5] * (st + 5);
        return { style: "n", sig: `n${st}:${a}`, body: `أكمل الحد التالي: ${L(h, s)} ، ....`, ...nOpts(h, R, v, [s[5] * 2, s[5] + s[4], s[5] * (st + 4)]),
          steps: [`الحدود تُضرب في ${h.A(st)} ، ${h.A(st + 1)} ، ${h.A(st + 2)} ، ... على التوالي.`, `التالي = ${S(h, s[5])} × ${h.A(st + 5)} = ${S(h, v)}.`], explanation: S(h, v) };
      } },
      arith: { title: "الحد النوني في متتابعة حسابية", from: 950, to: 1050, gen(R, h) {
        const A = h.A, a = R.int(5, 30), d = R.int(2, 9), n = R.int(6, 25), v = a + (n - 1) * d;
        return { style: "a", sig: `${a}:${d}:${n}`, body: `عدد المقاعد في المدرج الأول = ${A(a)} ، والثاني = ${A(a + d)} ، والثالث = ${A(a + 2 * d)} ، فكم عدد المقاعد في المدرج رقم ${A(n)}؟`,
          ...nOpts(h, R, v, [a + n * d, v - d, a * n]),
          steps: [`الفرق الثابت = ${A(d)}.`, `الحد رقم ن = الأول + (ن − ١) × الفرق = ${A(a)} + ${A(n - 1)} × ${A(d)}.`, `= ${A(v)}.`], explanation: A(v) };
      } },
      sticks: { title: "عدد الأعواد اللازمة لأشكال متصلة", from: 1200, to: 1500, gen(R, h) {
        const A = h.A, tri = R.next() < .5, n = R.int(8, 60), per = tri ? 2 : 3, v = per * n + 1;
        return { style: tri ? "t" : "s", sig: `${tri}:${n}`, body: tri ? `نستطيع صنع مثلث بـ ٣ أعواد، ومثلثين متصلين بـ ٥ أعواد، و٣ مثلثات بـ ٧ أعواد، فكم عودًا نحتاج لصنع ${A(n)} مثلثًا؟` : `إذا كانت ٤ أعواد تكوّن مربعًا، و٧ أعواد تكوّن مربعين متصلين، فكم عودًا يكوّن ${A(n)} مربعًا؟`,
          ...nOpts(h, R, v, [(per + 1) * n, per * n, v + per]),
          steps: [`كل شكل جديد يضيف ${A(per)} أعواد، والشكل الأول يحتاج ${A(per + 1)}.`, `العدد = ${A(per)} × ن + ١.`, `= ${A(per)} × ${A(n)} + ١ = ${A(v)}.`], explanation: A(v) };
      } },
      neg: { title: "متتابعات متناقصة والحد السالب", from: 1500, to: 1880, gen(R, h) {
        const mode = R.pick(["firstNeg", "next"]), a = R.int(15, 40), d = R.int(1, 4), s = [a]; let i = 0;
        if (mode === "firstNeg") { while (s[s.length - 1] >= 0 && i < 30) { s.push(s[s.length - 1] - (d + i)); i++; } const v = s[s.length - 1]; const shown = s.slice(0, 4);
          if (s.length < 6) return null;
          return { style: "f", sig: `f${a}:${d}`, body: `ما قيمة أول حد سالب في المتتابعة ${L(h, shown)} ، ....؟`, ...nOpts(h, R, v, [s[s.length - 2] - 1, v - 1, v + 2]),
            steps: [`الفروق: −${h.A(d)} ، −${h.A(d + 1)} ، −${h.A(d + 2)} ، ... (تزيد ١ كل مرة).`, `نكمل: ${L(h, s)}.`, `أول حد سالب = ${S(h, v)}.`], explanation: S(h, v) }; }
        const k = R.int(4, 10), t = [a]; for (let j = 0; j < 5; j++) t.push(t[j] - k * (j + 1)); const v = t[5] - k * 6, shown = t.slice(0, 5);
        return { style: "n", sig: `n${a}:${k}`, body: `أكمل النمط: ${L(h, shown)} ، ....`, ...nOpts(h, R, t[5], [t[5] - k, t[4] - k * 4, t[5] + k]),
          steps: [`الفروق: −${h.A(k)} ، −${h.A(2 * k)} ، −${h.A(3 * k)} ، −${h.A(4 * k)}.`, `الفرق التالي −${h.A(5 * k)} ، فالحد التالي = ${S(h, t[4])} − ${h.A(5 * k)} = ${S(h, t[5])}.`], explanation: S(h, t[5]) };
      } },
      cmp: { title: "المقارنة بين حدين في متتابعة", from: 1880, to: 2300, gen(R, h) {
        const A = h.A, mode = R.pick(["dec", "sign"]);
        if (mode === "sign") { const b = R.pick([2, 3]), m = R.int(10, 40), m2 = m + 1, s = [1, -b, b * b, -(b ** 3)], first = m % 2 ? 1 : -1;
          return { style: "s", sig: `s${b}:${m}`, body: h.cmpBody(`إذا كانت المتتابعة ${L(h, s)} ، ....`, `الحد رقم ${A(m)}`, `الحد رقم ${A(m2)}`), ...h.cmpAnswer(h.d(first), h.d(-first)),
            steps: ["الحدود ذات الترتيب الفردي موجبة، وذات الترتيب الزوجي سالبة.", `الحد رقم ${A(m)} ${m % 2 ? "موجب" : "سالب"} ، والحد رقم ${A(m2)} ${m2 % 2 ? "موجب" : "سالب"}.`, `الموجب أكبر من السالب: ${first > 0 ? "القيمة الأولى أكبر" : "القيمة الثانية أكبر"}.`], explanation: first > 0 ? "القيمة الأولى أكبر" : "القيمة الثانية أكبر" }; }
        const a = R.int(5, 20), d = R.int(2, 6), dec = R.next() < .7, s = [0, 1, 2, 3].map(i => dec ? a - i * d : a + i * d), p = R.int(20, 150), q = p + R.int(10, 200);
        return { style: "d" + dec, sig: `d${a}:${d}:${dec}:${p}:${q}`, body: h.cmpBody(`المتتالية ${L(h, s)} ، ....`, `الحد رقم ${A(p)}`, `الحد رقم ${A(q)}`), ...h.cmpAnswer(h.d(dec ? q : p), h.d(dec ? p : q)),
          steps: [`المتتالية ${dec ? "متناقصة" : "متزايدة"} بفرق ثابت ${A(d)}.`, `كلما تأخر ترتيب الحد ${dec ? "صغر" : "كبر"}.`, `إذن ${dec ? "القيمة الأولى أكبر" : "القيمة الثانية أكبر"}.`], explanation: dec ? "القيمة الأولى أكبر" : "القيمة الثانية أكبر" };
      } },
      inter: { title: "نمط يزيد وينقص (متتابعتان متداخلتان)", from: 2050, to: 2150, gen(R, h) {
        const a = R.int(5, 15), b = R.int(3, 12), d1 = R.int(1, 4), d2 = R.int(2, 6), s = []; for (let i = 0; i < 3; i++) s.push(a + i * d1, b + i * d2); const ans = `${S(h, a + 3 * d1)} ، ${S(h, b + 3 * d2)}`;
        return { style: "i", sig: `${a}:${b}:${d1}:${d2}`, body: `أوجد الحدين التاليين في النمط: ${L(h, s)} ، ....`, ...h.strOptions(R, ans, [`${S(h, b + 3 * d2)} ، ${S(h, a + 3 * d1)}`, `${S(h, a + 3 * d1 + 1)} ، ${S(h, b + 3 * d2)}`, `${S(h, a + 3 * d1)} ، ${S(h, b + 3 * d2 + d2)}`]),
          steps: ["النمط متتابعتان متداخلتان: الحدود الفردية الترتيب وحدها، والزوجية وحدها.", `الأولى: ${L(h, [a, a + d1, a + 2 * d1])} (+${h.A(d1)}) ، والثانية: ${L(h, [b, b + d2, b + 2 * d2])} (+${h.A(d2)}).`, `التاليان: ${ans}.`], explanation: ans };
      } },
      fib: { title: "نمط فيبوناتشي", from: 2150, to: 2200, gen(R, h) {
        const a = R.int(1, 4), b = R.int(a, 6), s = [a, b]; for (let i = 0; i < 4; i++) s.push(s[i] + s[i + 1]); const v = s[4] + s[5];
        return { style: "f", sig: `${a}:${b}`, body: `أكمل النمط التالي: ${L(h, s)} ، ....`, ...nOpts(h, R, v, [s[5] + (s[5] - s[4]), s[5] * 2, v + 1]),
          steps: ["كل حد = مجموع الحدين السابقين له.", `${S(h, s[4])} + ${S(h, s[5])} = ${S(h, v)}.`], explanation: S(h, v) };
      } },
      ones: { title: "مجموع قوى العدد ١", from: 2300, to: 2400, gen(R, h) {
        const A = h.A, n = R.int(50, 1500), neg = R.next() < .4, v = neg ? (n % 2 ? -1 : 0) : n;
        const body = neg ? `ما قيمة (−١)¹ + (−١)² + (−١)³ + ... + (−١) أس ${A(n)} ؟` : `ما قيمة ١¹ + ١² + ١³ + ... + ١ أس ${A(n)} ؟`;
        return { style: "o" + neg, sig: `${n}:${neg}`, body, ...h.strOptions(R, S(h, v), neg ? [S(h, n % 2 ? 0 : -1), "١", A(n)] : ["١", A(n - 1), A(n + 1)]),
          steps: neg ? ["(−١) أس فردي = −١ ، وأس زوجي = ١ ، فكل حدين متتاليين مجموعهما صفر.", `عدد الحدود ${A(n)} ${n % 2 ? "فردي فيبقى حد أخير = −١" : "زوجي فالمجموع صفر"}.`] : ["أي قوة للعدد ١ تساوي ١.", `عدد الحدود ${A(n)} ، فالمجموع = ${A(n)}.`], explanation: S(h, v) };
      } },
      sumBack: { title: "إيجاد الحد الأول من مجموع الحدود", from: 2400, to: 2580, gen(R, h) {
        const A = h.A, d = R.int(2, 5), k = R.int(4, 7), x = R.int(2, 12), rest = Array.from({ length: k - 1 }, (_, i) => d * (i + 1)), S0 = x + rest.reduce((a, b) => a + b);
        return { style: "s", sig: `${d}:${k}:${x}`, body: `حفر عامل حفرة في يوم، ثم حفر في اليوم الثاني بعمق ${A(d)} متر، والثالث ${A(2 * d)} متر، وهكذا كل يوم يزيد ${A(d)} عن الذي قبله. فإذا كان مجموع ما حفره حتى اليوم رقم ${A(k)} = ${A(S0)} مترًا، فما عمق ما حفره في اليوم الأول؟`,
          ...h.numOptions(R, h.d(x), [h.d(x + d), h.d(Math.max(1, x - 1)), h.d(d)]),
          steps: [`من اليوم الثاني إلى اليوم ${A(k)}: ${rest.map(A).join(" + ")} = ${A(S0 - x)} مترًا.`, `اليوم الأول = ${A(S0)} − ${A(S0 - x)} = ${A(x)} أمتار.`], explanation: A(x) };
      } },
      common: { title: "الأعداد المشتركة بين متتابعتين", from: 2580, to: 2735, gen(R, h) {
        const A = h.A, d1 = R.int(3, 6), d2 = R.int(5, 10); if (d1 === d2) return null; const c = R.int(10, 30), a = c - d1 * R.int(2, 3), b = c - d2 * R.int(1, 2), l = d1 * d2 / gcd(d1, d2), v = c + l; if (a <= 0 || b <= 0) return null;
        const s1 = Array.from({ length: 6 }, (_, i) => a + i * d1), s2 = Array.from({ length: 5 }, (_, i) => b + i * d2), nears = [v - 1, v + d1, v + d2].filter(x => !((x - a) % d1 === 0 && (x - b) % d2 === 0));
        return { style: "c", sig: `${d1}:${d2}:${c}:${a}:${b}`, body: `المتتابعة الأولى: ${L(h, s1)} ، ....\nالمتتابعة الثانية: ${L(h, s2)} ، ....\nإذا استمرت المتتابعتان بنفس النمط، أي الأعداد التالية يظهر في المتتابعتين معًا بعد ${A(c)}؟`,
          ...h.numOptions(R, h.d(v), nears.map(x => h.d(x))),
          steps: [`${A(c)} مشترك بينهما، والفرقان ${A(d1)} و ${A(d2)}.`, `الأعداد المشتركة تتكرر كل م.م.أ (${A(d1)} ، ${A(d2)}) = ${A(l)}.`, `العدد المشترك التالي = ${A(c)} + ${A(l)} = ${A(v)}.`], explanation: A(v) };
      } }
    }
  };
})();
