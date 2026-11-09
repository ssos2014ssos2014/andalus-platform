// المحاضرة 18: السرعة والمسافة والزمن (التحويلات، التوقفات، المسافة المتبقية، أوقات الانطلاق والوصول)
(() => {
  const clock = (h, mins) => { mins = ((mins % 720) + 720) % 720; let H = Math.floor(mins / 60), M = mins % 60; if (H === 0) H = 12; return `${h.A(H)}:${M < 10 ? "٠" : ""}${h.A(M)}`; };
  const hrs = (h, x) => { const w = Math.floor(x), f = x - w, u = w === 1 ? "ساعة" : w === 2 ? "ساعتين" : w <= 10 ? `${h.A(w)} ساعات` : `${h.A(w)} ساعة`; return f === 0 ? u : f === .5 ? (w ? `${u} ونصف` : "نصف ساعة") : `${h.fx(h.d(String(x)))} ساعة`; };
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  const U = (h, v, u) => `${h.A(v)} ${u}`;
  window.EXAMS[18] = {
    title: "اختبار محاكي: السرعة والمسافة والزمن", minutes: 25,
    blueprint: [["conv", 2], ["dist", 2], ["speedCmp", 2], ["speedMin", 2], ["timeMin", 2], ["perMin", 1], ["arrive", 2], ["remain", 3], ["stages", 2], ["fracTrip", 2], ["stops", 2], ["depart", 2]],
    skills: {
      conv: { title: "تحويل الوحدات (كم ، م ، كم/س إلى م/ث)", from: 0, to: 420, gen(R, h) {
        const A = h.A, mode = R.pick(["kmh", "ms", "km"]);
        if (mode === "kmh") { const v = R.int(1, 12) * 18, ans = v * 5 / 18;
          return { style: "a", sig: `a${v}`, body: `سرعة سيارة ${U(h, v, "كم/س")} ، كم تساوي بالمتر لكل ثانية؟`, ...h.numOptions(R, h.d(ans), [h.d(v * 18 / 5), h.d(ans * 2), h.d(v / 6)]),
            steps: [`للتحويل من كم/س إلى م/ث نضرب في ${h.frac("٥", "١٨")}.`, `${A(v)} × ${h.frac("٥", "١٨")} = ${A(ans)} م/ث.`], explanation: `${A(ans)} م/ث` }; }
        if (mode === "ms") { const v = R.int(1, 12) * 5, ans = v * 18 / 5;
          return { style: "b", sig: `b${v}`, body: `جسم يتحرك بسرعة ${U(h, v, "م/ث")} ، كم سرعته بالكيلومتر لكل ساعة؟`, ...h.numOptions(R, h.d(ans), [h.d(v * 5 / 18 | 0 || v + 3), h.d(v * 60), h.d(v * 3.6 / 2)]),
            steps: [`للتحويل من م/ث إلى كم/س نضرب في ${h.frac("١٨", "٥")} (عكس التحويل السابق).`, `${A(v)} × ${h.frac("١٨", "٥")} = ${A(ans)} كم/س.`], explanation: `${A(ans)} كم/س` }; }
        const k = R.int(2, 40), s = R.int(0, 1), km = h.shift(h.d(k), s), m = h.shift(km, -3);
        return { style: "c", sig: `c${k}:${s}`, body: `المسافة ${h.fx(km)} كم تساوي كم مترًا؟`, ...h.numOptions(R, m, [h.shift(m, 1), h.shift(m, -1), h.shift(m, 2)]),
          steps: ["من الوحدة الأكبر إلى الأصغر نضرب: ١ كم = ١٠٠٠ م.", `${h.fx(km)} × ١٠٠٠ = ${h.fx(m)} م.`], explanation: `${h.fx(m)} م` };
      } },
      dist: { title: "المسافة = السرعة × الزمن", from: 120, to: 780, gen(R, h) {
        const A = h.A, v = R.pick([R.int(2, 12), R.int(3, 12) * 10]), half = R.next() < .5, t = R.int(1, 8) + (half ? .5 : 0), d = v * t; if (!Number.isInteger(d)) return null;
        return { style: "h" + half, sig: `${v}:${t}`, body: `سرعة سيارة ${U(h, v, "كم/س")} ، فكم كيلومترًا تقطع في ${hrs(h, t)}؟`, ...h.numOptions(R, h.d(d), [h.d(v * Math.floor(t)), h.d(d + v), h.d(v * Math.ceil(t) + v)]),
          steps: ["المسافة = السرعة × الزمن.", `${A(v)} × ${h.fx(h.d(String(t)))} = ${A(d)} كم.`], explanation: `${A(d)} كم` };
      } },
      speedCmp: { title: "المقارنة بين سرعتين", from: 420, to: 540, gen(R, h) {
        const A = h.A, t1 = R.int(2, 8), t2 = R.int(2, 8), v1 = R.int(5, 15) * 10, v2 = v1 + R.pick([-20, -10, 0, 10, 20]), d1 = v1 * t1, d2 = v2 * t2; if (t1 === t2 || v2 <= 0) return null;
        const [n1, n2] = R.pick([["محمد", "خالد"], ["أحمد", "سعد"], ["فهد", "علي"]]);
        return { style: "c", sig: `${d1}:${t1}:${d2}:${t2}`, body: `يسير ${n1} مسافة ${A(d1)} كم في ${A(t1)} ساعات، ويسير ${n2} مسافة ${A(d2)} كم في ${A(t2)} ساعات.\nقارن بين:\nالقيمة الأولى: سرعة ${n1}\nالقيمة الثانية: سرعة ${n2}`, ...h.cmpAnswer(h.d(v1), h.d(v2)),
          steps: ["السرعة = المسافة ÷ الزمن.", `سرعة ${n1} = ${A(d1)} ÷ ${A(t1)} = ${A(v1)} كم/س ، وسرعة ${n2} = ${A(d2)} ÷ ${A(t2)} = ${A(v2)} كم/س.`, `إذن ${rel(v1, v2)}.`], explanation: rel(v1, v2) };
      } },
      speedMin: { title: "حساب السرعة والزمن بالدقائق", from: 540, to: 660, gen(R, h) {
        const A = h.A, v = R.int(4, 15) * 10, t = R.pick([30, 90, 120, 150, 180, 240, 270, 300]), d = v * t / 60; if (!Number.isInteger(d)) return null;
        const [a, b] = R.pick([["الرياض", "الدمام"], ["جدة", "مكة"], ["أبها", "جازان"], ["الطائف", "جدة"]]);
        return { style: "m", sig: `${v}:${t}`, body: `إذا كانت المسافة بين ${a} و${b} ${A(d)} كم ، فاحسب السرعة عندما تُقطع المسافة في ${A(t)} دقيقة`, ...h.strOptions(R, `${A(v)} كم/س`, [`${A(v + 10)} كم/س`, `${A(v - 10)} كم/س`, `${A(Math.round(d / t * 100))} كم/س`]),
          steps: [`نحوّل الزمن إلى ساعات: ${A(t)} ÷ ٦٠ = ${h.fx(h.d(String(t / 60)))} ساعة (${hrs(h, t / 60)}).`, `السرعة = ${A(d)} ÷ ${h.fx(h.d(String(t / 60)))} = ${A(v)} كم/س.`], explanation: `${A(v)} كم/س` };
      } },
      timeMin: { title: "الزمن بالدقائق = المسافة ÷ السرعة", from: 790, to: 1060, gen(R, h) {
        const A = h.A, v = R.pick([30, 40, 45, 50, 60, 75, 80, 90, 100, 120]), t = R.pick([20, 30, 40, 45, 48, 60, 80, 90, 120, 150]), d = v * t / 60; if (!Number.isInteger(d)) return null;
        return { style: "t", sig: `${v}:${t}`, body: `${R.pick(["محمد", "سعد", "خالد"])} يسافر ${A(d)} كم بسرعة ${A(v)} كم/س ، كم دقيقة تستغرق الرحلة كاملة؟`, ...h.numOptions(R, h.d(t), [h.d(t + 10), h.d(Math.abs(t - 20) || t + 15), h.d(Math.round(v / d * 60) === t ? t + 30 : Math.round(v / d * 60))]),
          steps: ["الزمن = المسافة ÷ السرعة.", `${A(d)} ÷ ${A(v)} = ${h.frac(A(d), A(v))} ساعة.`, `بالدقائق: ${h.frac(A(d), A(v))} × ٦٠ = ${A(t)} دقيقة.`], explanation: `${A(t)} دقيقة` };
      } },
      perMin: { title: "تحويل كم/ساعة إلى كم/دقيقة", from: 1060, to: 1110, gen(R, h) {
        const v = R.pick([30, 45, 60, 90, 120, 150, 180, 75, 105]), x = h.div(h.d(v), h.d(60));
        return { style: "p", sig: `${v}`, body: `إذا كانت ${h.frac("س كم", "دقيقة")} = ${h.frac(`${h.A(v)} كم`, "ساعة")} ، أوجد قيمة س`, ...h.numOptions(R, x, [h.add(x, h.d("1")), h.d(v / 6 | 0), h.add(x, h.d("0.5"))]),
          steps: ["الساعة = ٦٠ دقيقة، فنقسم على ٦٠.", `س = ${h.A(v)} ÷ ٦٠ = ${h.fx(x)}.`], explanation: h.fx(x) };
      } },
      arrive: { title: "وقت الوصول", from: 1110, to: 1310, gen(R, h) {
        const A = h.A, v = R.pick([60, 80, 100, 120]), start = R.int(5, 10), tm = R.pick([60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 225]), d = v * tm / 60; if (!Number.isInteger(d)) return null;
        const ans = clock(h, start * 60 + tm);
        return { style: "a", sig: `${v}:${start}:${tm}`, body: `انطلقت سيارة الساعة ${A(start)} صباحًا بسرعة ${A(v)} كم/س ، فإذا كانت المسافة المقطوعة ${A(d)} كم ، فمتى وصلت؟`,
          ...h.strOptions(R, ans, [clock(h, start * 60 + tm + 15), clock(h, start * 60 + tm - 15), (() => { const wm = Math.round((tm % 60) / 60 * 100); return wm < 60 && wm !== tm % 60 ? clock(h, start * 60 + Math.floor(tm / 60) * 60 + wm) : clock(h, start * 60 + tm + 30); })()]),
          steps: [`الزمن = ${A(d)} ÷ ${A(v)} = ${h.fx(h.div(h.d(d), h.d(v)))} ساعة = ${A(Math.floor(tm / 60))} ساعة و ${A(tm % 60)} دقيقة.`, `${A(start)}:٠٠ + ${A(Math.floor(tm / 60))}:${tm % 60 < 10 ? "٠" : ""}${A(tm % 60)} = ${ans}.`, "تنبيه: ٠,٢٥ ساعة = ١٥ دقيقة وليست ٢٥ دقيقة."], explanation: ans };
      } },
      remain: { title: "المسافة المقطوعة + المسافة المتبقية", from: 1310, to: 1680, gen(R, h) {
        const A = h.A, mode = R.pick(["km", "km", "time"]), v = R.pick([40, 50, 60, 70, 80, 90, 100, 120, 900, 800]), t = R.int(2, 4);
        if (mode === "time") { const v = R.pick([600, 750, 800, 900]), cov = R.int(3, 9) * 100 + R.pick([0, 35, 50]), rt = R.pick([30, 60, 90, 120]), rest = v * rt / 60, tot = cov + rest; if (!Number.isInteger(rest)) return null;
          return { style: "t", sig: `t${v}:${cov}:${rt}`, body: `ركب رجل طائرة فنظر إلى الشاشة فوجد سرعة الطائرة ${A(v)} كم/س ، وقد قطعت ${A(cov)} كم ، وتبقى لها ${A(rt)} دقيقة. فما المسافة الكلية؟`,
            ...h.strOptions(R, `${A(tot)} كم`, [`${A(tot + 100)} كم`, `${A(cov + v)} كم` === `${A(tot)} كم` ? `${A(tot - 100)} كم` : `${A(cov + v)} كم`, `${A(cov + rt)} كم`]),
            steps: [`المسافة المتبقية = ${A(v)} × ${h.fx(h.d(String(rt / 60)))} ساعة = ${A(rest)} كم.`, `المسافة الكلية = ${A(cov)} + ${A(rest)} = ${A(tot)} كم.`], explanation: `${A(tot)} كم` }; }
        const rem = R.int(1, 9) * 10, tot = v * t + rem; if (v > 150 || rem === v) return null;
        return { style: "k", sig: `k${v}:${t}:${rem}`, body: `رجل يسير من المنطقة أ إلى ب بسرعة ${A(v)} كم/س ، فإذا توقف بعد ${t === 2 ? "ساعتين" : A(t) + " ساعات"} وكانت المسافة المتبقية ${A(rem)} كم ، فكم المسافة الكلية بين أ و ب؟`,
          ...h.strOptions(R, `${A(tot)} كم`, [`${A(v * t)} كم`, `${A(v * t - rem)} كم`, `${A(v + rem)} كم`]),
          steps: [`المسافة المقطوعة = ${A(v)} × ${A(t)} = ${A(v * t)} كم.`, `الكلية = المقطوعة + المتبقية = ${A(v * t)} + ${A(rem)} = ${A(tot)} كم.`], explanation: `${A(tot)} كم` };
      } },
      stages: { title: "المقارنة بين رحلة واحدة ورحلة على مرحلتين", from: 1680, to: 1830, gen(R, h) {
        const A = h.A, v = R.int(3, 6) * 10, t = R.int(2, 4), a = Math.max(20, v + R.int(-2, 2) * 10), b = Math.max(20, v + R.int(-2, 3) * 10), ta = R.int(1, 2), tb = R.int(1, 2), x = v * t, y = a * ta + b * tb;
        const H = n => n === 1 ? "ساعة" : n === 2 ? "ساعتين" : `${A(n)} ساعات`;
        return { style: "s", sig: `${v}:${t}:${a}:${ta}:${b}:${tb}`, body: `قارن بين:\nالقيمة الأولى: المسافة التي يقطعها عدّاء يجري ${A(v)} كم/س لمدة ${H(t)}\nالقيمة الثانية: المسافة التي يقطعها عدّاء على مرحلتين: الأولى ${A(a)} كم/س لمدة ${H(ta)} ، والثانية ${A(b)} كم/س لمدة ${H(tb)}`,
          ...h.cmpAnswer(h.d(x), h.d(y)), steps: [`الأولى = ${A(v)} × ${A(t)} = ${A(x)} كم.`, `الثانية = ${A(a)} × ${A(ta)} + ${A(b)} × ${A(tb)} = ${A(y)} كم.`, `إذن ${rel(x, y)}.`], explanation: rel(x, y) };
      } },
      fracTrip: { title: "قطع جزء من المسافة بسرعة والباقي بسرعة أخرى", from: 1830, to: 2070, gen(R, h) {
        const A = h.A, [p, q, w] = R.pick([[2, 3, "ثلثي"], [1, 2, "نصف"], [1, 3, "ثلث"], [3, 4, "ثلاثة أرباع"]]), v1 = R.pick([30, 40, 60, 80, 90, 120]), v2 = R.pick([20, 30, 40, 45, 60]), D = R.pick([60, 90, 120, 180, 240, 360]);
        const d1 = D * p / q, d2 = D - d1, t = d1 / v1 + d2 / v2; if (!Number.isInteger(d1) || !Number.isInteger(t * 2) || t > 8) return null;
        const ans = hrs(h, t);
        return { style: w, sig: `${p}:${q}:${v1}:${v2}:${D}`, body: `سيارة تسير مسافة ${A(D)} كم ، تقطع ${w} هذه المسافة بسرعة ${A(v1)} كم/س وباقي المسافة بسرعة ${A(v2)} كم/س ، فما زمن الرحلة؟`,
          ...h.strOptions(R, ans, [hrs(h, t + .5), hrs(h, t - .5 > 0 ? t - .5 : t + 1), hrs(h, Math.round(D / ((v1 + v2) / 2) * 2) / 2 === t ? t + 1 : Math.round(D / ((v1 + v2) / 2) * 2) / 2)]),
          steps: [`الجزء الأول = ${h.frac(A(p), A(q))} × ${A(D)} = ${A(d1)} كم ، زمنه = ${A(d1)} ÷ ${A(v1)} = ${h.fx(h.d(String(d1 / v1)))} ساعة.`, `الباقي = ${A(d2)} كم ، زمنه = ${A(d2)} ÷ ${A(v2)} = ${h.fx(h.d(String(d2 / v2)))} ساعة.`, `زمن الرحلة = ${ans}.`], explanation: ans };
      } },
      stops: { title: "إضافة زمن التوقفات", from: 2070, to: 2420, gen(R, h) {
        const A = h.A, t = R.int(3, 12), s = R.pick([5, 10, 15, 20]), tot = t * 60 + (t - 1) * s;
        return { style: "s" + s, sig: `${t}:${s}`, body: `شخص يقطع المسافة من مدينة أ إلى مدينة ب في ${A(t)} ساعات. في كم دقيقة يقطع هذه المسافة شخص آخر إذا كان يتوقف ${A(s)} دقيقة بعد كل ساعة بنفس السرعة؟`,
          ...h.numOptions(R, h.d(tot), [h.d(t * 60 + t * s), h.d(t * 60), h.d(t * 60 + (t - 2) * s)]),
          steps: [`زمن السير = ${A(t)} × ٦٠ = ${A(t * 60)} دقيقة.`, `يتوقف بعد كل ساعة ما عدا الأخيرة (لأنه يصل): عدد التوقفات = ${A(t - 1)}.`, `الزمن الكلي = ${A(t * 60)} + ${A(t - 1)} × ${A(s)} = ${A(tot)} دقيقة.`], explanation: `${A(tot)} دقيقة` };
      } },
      depart: { title: "إيجاد وقت الخروج بالرجوع للخلف", from: 2420, to: 2687, gen(R, h) {
        const A = h.A, d = R.int(3, 9), n = R.int(1, 4), r = R.pick([15, 20, 30]), arr = R.int(5, 11) * 60 + R.pick([0, 30]), tot = d * 60 + n * r, ans = clock(h, arr - tot);
        return { style: "d" + r, sig: `${d}:${n}:${r}:${arr}`, body: `خرج أحمد من بيته إلى قريته، وكانت مدة قيادة السيارة ${A(d)} ساعات، وأخذ ${A(n)} استراحات مدة كل منها ${r === 30 ? "نصف ساعة" : A(r) + " دقيقة"}، ووصل القرية الساعة ${clock(h, arr)}. فمتى خرج من بيته؟`,
          ...h.strOptions(R, ans, [clock(h, arr - d * 60), clock(h, arr - tot + 30), clock(h, arr - tot - 30)]),
          steps: [`زمن الاستراحات = ${A(n)} × ${A(r)} = ${A(n * r)} دقيقة.`, `الزمن الكلي = ${A(d)} ساعات + ${A(n * r)} دقيقة.`, `نرجع من ${clock(h, arr)} بمقدار الزمن الكلي: ${ans}.`], explanation: ans };
      } }
    }
  };
})();
