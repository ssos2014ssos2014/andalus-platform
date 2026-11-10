// المحاضرة 36: قوانين مهمة (المرتبات، الزكاة، الأعداد المحصورة، الترتيب، المصافحات، العمل المشترك، الأعمدة، الزاوية بين العقربين)
(() => {
  const g = (a, b) => b ? g(b, a % b) : a;
  const fx = (h, x) => Number.isInteger(x) ? h.A(x) : h.fx(h.d(String(+x.toFixed(2))));
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  const ang = (H, M) => { const a = Math.abs(30 * (H % 12) - 5.5 * M); return Math.min(a, 360 - a); };
  window.EXAMS[36] = {
    title: "اختبار محاكي: قوانين مهمة في القدرات الكمي", minutes: 25,
    blueprint: [["salary", 2], ["zakat", 2], ["count", 3], ["ranks", 3], ["circle", 1], ["sum", 2], ["hands", 2], ["work", 3], ["poles", 3], ["clock", 3]],
    skills: {
      salary: { title: "قانون تساوي المرتبات", from: 0, to: 180, gen(R, h) {
        const A = h.A, i1 = R.int(2, 10) * 10, i2 = i1 + R.int(1, 5) * 10, t = R.int(5, 60), s2 = R.int(5, 30) * 100, s1 = s2 + t * (i2 - i1), hall = R.next() < .4;
        return { style: hall ? "h" : "s", sig: `${s1}:${i1}:${s2}:${i2}`, body: hall ? `قاعة سعرها ${A(s2)} ريال وعلى كل مدعو ${A(i2)} ريال، وقاعة ثانية سعرها ${A(s1)} ريال وعلى كل مدعو ${A(i1)} ريال، فبعد كم مدعوًا تتساوى تكلفة القاعتين؟` : `موظف راتبه ${A(s2)} ريال ويزيد كل شهر ${A(i2)} ريالًا، وموظف آخر راتبه ${A(s1)} ريال ويزيد كل شهر ${A(i1)} ريالًا، فبعد كم شهرًا يتساوى الراتبان؟`,
          ...h.numOptions(R, h.d(t), [h.d(t + 10), h.d(Math.round(s1 / i2)), h.d(Math.max(1, t - 5))]),
          steps: ["زمن التساوي = فرق المرتبات ÷ فرق الزيادات.", `= (${A(s1)} − ${A(s2)}) ÷ (${A(i2)} − ${A(i1)}) = ${A(s1 - s2)} ÷ ${A(i2 - i1)} = ${A(t)}.`], explanation: A(t) };
      } },
      zakat: { title: "قانون الزكاة (٢,٥٪ = جزء من ٤٠)", from: 180, to: 420, gen(R, h) {
        const A = h.A, z = R.int(2, 40) * 50, T = z * 40, rev = R.next() < .5;
        return { style: rev ? "r" : "z", sig: `${z}:${rev}`, body: rev ? `رجل أخرج زكاة ماله وكانت ${A(z)} ريال، فما المبلغ الذي أخرج عليه الزكاة إذا كانت نسبة الزكاة ٢,٥٪ من المبلغ الكلي؟` : `رجل عنده مبلغ ${A(T)} ريال، فما قيمة زكاته إذا علمت أن نسبة الزكاة ٢,٥٪؟`,
          ...h.numOptions(R, h.d(rev ? T : z), rev ? [h.d(z * 25), h.d(z * 4), h.d(T / 2)] : [h.d(T / 25), h.d(T / 4), h.d(z * 2)]),
          steps: ["٢,٥٪ = ⟦٢,٥/١٠٠⟧ = ⟦١/٤٠⟧.", rev ? `المبلغ الكلي = ٤٠ × مبلغ الزكاة = ٤٠ × ${A(z)} = ${A(T)} ريال.` : `مبلغ الزكاة = المبلغ ÷ ٤٠ = ${A(T)} ÷ ٤٠ = ${A(z)} ريال.`], explanation: A(rev ? T : z) };
      } },
      count: { title: "عدد الأعداد المحصورة", from: 420, to: 960, gen(R, h) {
        const A = h.A, a = R.int(1, 30), b = a + R.int(20, 150), mode = R.pick(["between", "fromTo", "even", "odd", "pages"]);
        let v, body, st;
        if (mode === "between") { v = b - a - 1; body = `كم عددًا صحيحًا محصورًا بين ${A(a)} و ${A(b)}؟`; st = [`بين (دون الطرفين) = الأكبر − الأصغر − ١.`, `${A(b)} − ${A(a)} − ١ = ${A(v)}.`]; }
        else if (mode === "fromTo" || mode === "pages") { v = b - a + 1; body = mode === "pages" ? `قرأ أحمد من صفحة ${A(a)} إلى صفحة ${A(b)} ، فكم صفحة قرأ؟` : `كم عددًا صحيحًا من ${A(a)} إلى ${A(b)}؟`; st = ["من … إلى (مع الطرفين) = الأكبر − الأصغر + ١.", `${A(b)} − ${A(a)} + ١ = ${A(v)}.`]; }
        else { const ev = mode === "even", f = a % 2 === (ev ? 0 : 1) ? a + 2 : a + 1, l0 = b % 2 === (ev ? 0 : 1) ? b - 2 : b - 1; v = (l0 - f) / 2 + 1; body = `كم عددًا ${ev ? "زوجيًا" : "فرديًا"} محصورًا بين ${A(a)} و ${A(b)}؟`; st = [`أول عدد ${ev ? "زوجي" : "فردي"} بعد ${A(a)} هو ${A(f)} ، وآخر عدد قبل ${A(b)} هو ${A(l0)}.`, `العدد = ⟦${A(l0)} − ${A(f)}/٢⟧ + ١ = ${A(v)}.`]; }
        return { style: mode, sig: `${mode}:${a}:${b}`, body, ...h.numOptions(R, h.d(v), [h.d(v + 1), h.d(v - 1), h.d(v + 2)]), steps: st, explanation: A(v) };
      } },
      ranks: { title: "مسائل الترتيب في صف", from: 960, to: 1440, gen(R, h) {
        const A = h.A, mode = R.pick(["total", "back", "between", "middle"]), f = R.int(5, 25), bk = R.int(5, 25);
        if (mode === "total") { const v = f + bk - 1;
          return { style: "t", sig: `t${f}:${bk}`, body: `ترتيب محمد في الفصل هو ${A(f)} من الأمام، وترتيبه من الخلف ${A(bk)} ، فكم عدد طلاب الفصل؟`, ...h.numOptions(R, h.d(v), [h.d(f + bk), h.d(v - 1), h.d(f + bk + 1)]),
            steps: ["العدد = الترتيب من الأمام + الترتيب من الخلف − ١ (لأن محمدًا حُسب مرتين).", `${A(f)} + ${A(bk)} − ١ = ${A(v)}.`], explanation: A(v) }; }
        if (mode === "back") { const T = f + bk - 1;
          return { style: "b", sig: `b${f}:${T}`, body: `ترتيب محمد في الفصل هو ${A(f)} من الأمام، وكان عدد طلاب الصف ${A(T)} ، فكم يكون ترتيبه من الخلف؟`, ...h.numOptions(R, h.d(bk), [h.d(T - f), h.d(bk + 1), h.d(T - f + 2)]),
            steps: ["الترتيب من الخلف = العدد − الترتيب من الأمام + ١.", `${A(T)} − ${A(f)} + ١ = ${A(bk)}.`], explanation: A(bk) }; }
        if (mode === "between") { const a = R.int(2, 20), b = a + R.int(5, 25), v = b - a - 1;
          return { style: "w", sig: `w${a}:${b}`, body: `ترتيب محمد في الفصل هو ${A(a)} وترتيب أخيه ${A(b)} ، فكم طالبًا بينهما؟`, ...h.numOptions(R, h.d(v), [h.d(b - a), h.d(b - a + 1), h.d(v - 1)]),
            steps: ["عدد من بينهما = الفرق بين الترتيبين − ١.", `${A(b)} − ${A(a)} − ١ = ${A(v)}.`], explanation: A(v) }; }
        const m = R.int(10, 40), v = 2 * m - 1;
        return { style: "m", sig: `m${m}`, body: `إذا كان ترتيب محمد في الفصل من البداية أو من النهاية هو ${A(m)} ، فما عدد طلاب الفصل؟`, ...h.numOptions(R, h.d(v), [h.d(2 * m), h.d(2 * m + 1), h.d(m)]),
          steps: ["ترتيبه واحد من الجهتين فهو في المنتصف.", `العدد = ${A(m)} + ${A(m)} − ١ = ${A(v)}.`], explanation: A(v) };
      } },
      circle: { title: "الترتيب في طابور دائري", from: 1440, to: 1740, gen(R, h) {
        const A = h.A, a = R.int(5, 20), b = R.int(5, 20), v = a + b - 2;
        return { style: "c", sig: `${a}:${b}`, body: `محمد وخالد يقفان في طابور دائري، إذا بدأنا العد من خالد كان ترتيب محمد ${A(a)} ، وإذا بدأنا العد بالعكس من خالد يكون ترتيب محمد ${A(b)} ، فكم عدد أفراد الطابور؟`, ...h.numOptions(R, h.d(v), [h.d(a + b - 1), h.d(a + b), h.d(v - 1)]),
          steps: ["في الدائرة يُحسب خالد ومحمد في العدّين كليهما.", `العدد = ${A(a)} + ${A(b)} − ٢ = ${A(v)}.`], explanation: A(v) };
      } },
      sum: { title: "مجموع الأعداد المتتالية: ن(ن + ١) ÷ ٢", from: 1740, to: 2160, gen(R, h) {
        const A = h.A, n = R.int(10, 60), mode = R.pick(["all", "evenFromOdd"]);
        if (mode === "all") { const v = n * (n + 1) / 2;
          return { style: "a", sig: `a${n}`, body: `ما مجموع الأعداد الطبيعية من ١ إلى ${A(n)}؟`, ...h.numOptions(R, h.d(v), [h.d(n * n), h.d(n * (n - 1) / 2), h.d(v + n)]),
            steps: ["مجموع الأعداد من ١ إلى ن = ⟦ن(ن + ١)/٢⟧.", `= ⟦${A(n)} × ${A(n + 1)}/٢⟧ = ${A(v)}.`], explanation: A(v) }; }
        const k = R.int(10, 40), odd = k * k, even = k * (k + 1);
        return { style: "e", sig: `e${k}`, body: `إذا كان ١ + ٣ + ٥ + ... + ${A(2 * k - 1)} = ${A(odd)} ، فأوجد ٢ + ٤ + ٦ + ... + ${A(2 * k)}`, ...h.numOptions(R, h.d(even), [h.d(odd), h.d(odd + 2), h.d(odd + 2 * k + 2)]),
          steps: [`عدد الحدود في كل مجموعة ${A(k)} ، وكل عدد زوجي يزيد ١ عن نظيره الفردي.`, `المجموع = ${A(odd)} + ${A(k)} × ١ = ${A(even)}.`], explanation: A(even) };
      } },
      hands: { title: "عدد المصافحات: ن(ن − ١) ÷ ٢", from: 1740, to: 2280, gen(R, h) {
        const A = h.A, n = R.int(4, 25), v = n * (n - 1) / 2, rev = R.next() < .4;
        return { style: rev ? "r" : "h", sig: `${n}:${rev}`, body: rev ? `تقابل عدد من الطلاب في الطابور الصباحي وصافح كل منهم الآخر، وكان عدد المصافحات ${A(v)} ، فكم عدد الطلاب؟` : `اجتمع ${A(n)} أشخاص في مؤتمر، فإذا أراد كل منهم أن يصافح الآخرين، فكم عدد المصافحات؟`,
          ...h.numOptions(R, h.d(rev ? n : v), rev ? [h.d(n + 1), h.d(n - 1), h.d(Math.round(Math.sqrt(v)))] : [h.d(n * (n - 1)), h.d(n * (n + 1) / 2), h.d(v - n)]),
          steps: ["عدد المصافحات = ⟦ن(ن − ١)/٢⟧.", rev ? `⟦ن(ن − ١)/٢⟧ = ${A(v)} ، أي ن(ن − ١) = ${A(2 * v)} = ${A(n)} × ${A(n - 1)} ، إذن ن = ${A(n)}.` : `= ⟦${A(n)} × ${A(n - 1)}/٢⟧ = ${A(v)}.`], explanation: A(rev ? n : v) };
      } },
      work: { title: "قانون زمن العمل المشترك", from: 2280, to: 2700, gen(R, h) {
        const A = h.A, mode = R.pick(["together", "together", "drain"]), a = R.int(2, 8), b = R.int(2, 10); if (a === b) return null;
        if (mode === "drain") { if (b <= a) return null; const T = a * b / (b - a), m = T * 60; if (!Number.isInteger(m)) return null;
          return { style: "d", sig: `d${a}:${b}`, body: `حنفية تملأ الحوض في ${A(a)} ساعات، وحنفية تفرغه في ${A(b)} ساعات. إذا فُتحت الحنفيتان معًا في وقت واحد، فما المدة بالدقائق لملء الحوض؟`.replace("في ٢ ساعات", "في ساعتين"),
            ...h.numOptions(R, h.d(m), [h.d(a * b / (a + b) * 60 | 0), h.d(m + 30), h.d((b - a) * 60)]),
            steps: ["الملء يُجمع والتفريغ يُطرح: ⟦١/الزمن⟧ = ⟦١/" + A(a) + "⟧ − ⟦١/" + A(b) + "⟧.", `= ⟦${A(b - a)}/${A(a * b)}⟧ ، فالزمن = ⟦${A(a * b)}/${A(b - a)}⟧ ساعة = ${fx(h, T)} ساعة.`, `بالدقائق: ${A(m)} دقيقة.`], explanation: A(m) }; }
        const T = a * b / (a + b), m = T * 60; if (!Number.isInteger(m)) return null;
        return { style: "t", sig: `t${a}:${b}`, body: `يطلي وليد غرفته في ${A(a)} ساعات، ويطليها صديقه في ${A(b)} ساعات، فكم دقيقة تستغرق الغرفة إذا عملا معًا؟`.replace("في ٢ ساعات", "في ساعتين"),
          ...h.numOptions(R, h.d(m), [h.d((a + b) / 2 * 60), h.d(Math.min(a, b) * 60), h.d(m + 12)]),
          steps: ["⟦١/الزمن المطلوب⟧ = ⟦١/زمن الأول⟧ + ⟦١/زمن الثاني⟧.", `= ⟦١/${A(a)}⟧ + ⟦١/${A(b)}⟧ = ⟦${A(a + b)}/${A(a * b)}⟧ ، فالزمن = ⟦${A(a * b)}/${A(a + b)}⟧ ساعة.`, `بالدقائق: ⟦${A(a * b)}/${A(a + b)}⟧ × ٦٠ = ${A(m)} دقيقة.`], explanation: A(m) };
      } },
      poles: { title: "قانون الأعمدة والأشجار", from: 2700, to: 3240, gen(R, h) {
        const A = h.A, mode = R.pick(["count", "dist", "gap"]), gap = R.pick([5, 10, 11, 20, 25, 50]), n = R.int(6, 40), D = gap * (n - 1);
        if (mode === "count") return { style: "c", sig: `c${gap}:${n}`, body: `طريق طوله ${A(D)} متر، كم مصباحًا يلزم لإنارته من بدايته إلى نهايته إذا كانت المسافة بين كل مصباحين ${A(gap)} مترًا؟`, ...h.numOptions(R, h.d(n), [h.d(n - 1), h.d(n + 1), h.d(n - 2)]),
          steps: ["عدد الأعمدة = ⟦المسافة الكلية/المسافة البينية⟧ + ١.", `= ⟦${A(D)}/${A(gap)}⟧ + ١ = ${A(n - 1)} + ١ = ${A(n)}.`], explanation: A(n) };
        if (mode === "dist") return { style: "d", sig: `d${gap}:${n}`, body: `وُضعت ${A(n)} نخلة على استقامة واحدة، فإذا كانت المسافة بين كل نخلة وأخرى ${A(gap)} م ، فإن المسافة بين النخلة الأولى والأخيرة هي:`, ...h.numOptions(R, h.d(D), [h.d(gap * n), h.d(gap * (n + 1)), h.d(D - gap * 2)]),
          steps: ["المسافة الكلية = المسافة البينية × (العدد − ١).", `= ${A(gap)} × ${A(n - 1)} = ${A(D)} م.`], explanation: A(D) };
        return { style: "g", sig: `g${gap}:${n}`, body: `طريق طوله ${A(D)} متر وُضعت فيه ${A(n)} مظلة على مسافات متساوية من البداية إلى النهاية، فكم المسافة بين كل مظلتين؟`, ...h.numOptions(R, h.d(gap), [h.d(Math.round(D / n)) === h.d(gap) ? h.d(gap + 1) : h.d(Math.round(D / n)), h.d(gap + 2), h.d(Math.max(1, gap - 1))]),
          steps: [`عدد المسافات = العدد − ١ = ${A(n - 1)}.`, `المسافة البينية = ${A(D)} ÷ ${A(n - 1)} = ${A(gap)} م.`], explanation: A(gap) };
      } },
      clock: { title: "الزاوية بين عقربي الساعة", from: 3240, to: 4304, gen(R, h) {
        const A = h.A, mode = R.pick(["ang", "ang", "move", "cmp"]);
        if (mode === "move") { const hrs = R.int(1, 5), mins = R.pick([0, 5, 10, 20, 30]), deg = hrs * 360 + mins * 6;
          const ans = `${hrs === 1 ? "ساعة" : hrs === 2 ? "ساعتين" : A(hrs) + " ساعات"}${mins ? ` و ${A(mins)} دقائق` : ""}`.replace(" و ٢٠ دقائق", " و ٢٠ دقيقة").replace(" و ٣٠ دقائق", " ونصف");
          const alt = (hh, mm) => `${hh === 1 ? "ساعة" : hh === 2 ? "ساعتين" : A(hh) + " ساعات"}${mm ? ` و ${A(mm)} دقائق` : ""}`.replace(" و ٢٠ دقائق", " و ٢٠ دقيقة").replace(" و ٣٠ دقائق", " ونصف");
          return { style: "m", sig: `m${deg}`, body: `إذا تحرك عقرب الدقائق زاوية قدرها ${A(deg)}° ، فكم ساعة يتحرك عقرب الساعات؟`, ...h.strOptions(R, ans, [alt(hrs, mins + 10), alt(hrs + 1, mins), alt(hrs, mins ? 0 : 15)]),
            steps: ["عندما يتحرك عقرب الدقائق ٣٦٠° يتحرك الزمن ساعة واحدة، وكل دقيقة = ٦°.", `${A(deg)} = ${A(hrs)} × ٣٦٠ + ${A(mins * 6)} ، أي ${A(hrs)} ساعات و ${A(mins * 6)} ÷ ٦ = ${A(mins)} دقيقة.`], explanation: ans }; }
        if (mode === "cmp") { const t1 = [R.int(1, 12), 0], t2 = [R.int(1, 12), R.pick([5, 10, 15, 20, 25, 35, 40])], x = ang(...t1), y = ang(...t2); if (x === y) return null;
          const T = ([H, M]) => `${A(H)}:${M < 10 ? "٠" : ""}${A(M)}`;
          return { style: "c", sig: `c${t1}:${t2}`, body: h.cmpBody("", `الزاوية الصغرى بين العقربين عند الساعة ${T(t1)}`, `الزاوية الصغرى بين العقربين عند الساعة ${T(t2)}`), ...h.cmpAnswer(h.d(String(x)), h.d(String(y))),
            steps: ["الزاوية = | ٣٠ × عدد الساعات − ⟦١١/٢⟧ × عدد الدقائق | ، وإن زادت على ١٨٠° نطرحها من ٣٦٠°.", `عند ${T(t1)}: ${fx(h, x)}° ، وعند ${T(t2)}: ${fx(h, y)}°.`, `إذن ${rel(x, y)}.`], explanation: rel(x, y) }; }
        const H = R.int(1, 12), M = R.pick([0, 10, 15, 20, 30, 40, 45, 50]), raw = Math.abs(30 * (H % 12) - 5.5 * M), v = Math.min(raw, 360 - raw); if (!Number.isInteger(v)) return null;
        return { style: "a", sig: `a${H}:${M}`, body: `إذا كانت الساعة ${A(H)}:${M < 10 ? "٠" : ""}${A(M)} ، فما الزاوية الصغرى بين العقربين؟`, ...h.strOptions(R, `${A(v)}°`, [`${A(360 - v)}°`, `${A(Math.abs(30 * H - 6 * M) % 360 === v ? v + 10 : Math.abs(30 * H - 6 * M) % 360)}°`, `${A(v + 15)}°`]),
          steps: ["الزاوية = | ٣٠ × عدد الساعات − ⟦١١/٢⟧ × عدد الدقائق |.", `= | ٣٠ × ${A(H % 12)} − ⟦١١/٢⟧ × ${A(M)} | = | ${A(30 * (H % 12))} − ${fx(h, 5.5 * M)} | = ${fx(h, raw)}°.`, raw > 180 ? `أكبر من ١٨٠° فالصغرى = ٣٦٠ − ${fx(h, raw)} = ${A(v)}°.` : `الزاوية الصغرى = ${A(v)}°.`], explanation: `${A(v)}°` };
      } }
    }
  };
})();
