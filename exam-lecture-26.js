// المحاضرة 26: تطبيقات التناسب الطردي (المعدلات، التحويل بين العملات والوحدات) والتناسب العكسي
(() => {
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  const INV = "التناسب عكسي: إذا زادت إحدى الكميتين نقصت الأخرى، وحاصل ضربهما ثابت (نضرب الصف في نفسه).";
  const U = (h, n, few, many) => `${h.A(n)} ${n >= 3 && n <= 10 ? few : many}`;
  const DIR = "التناسب طردي: نضرب طرفين في وسطين.";
  window.EXAMS[26] = {
    title: "اختبار محاكي: تطبيقات التناسب الطردي والعكسي", minutes: 25,
    blueprint: [["together", 3], ["fracRate", 2], ["machines", 3], ["pump", 2], ["conv", 4], ["food", 3], ["workers", 3], ["hours", 2], ["elevator", 2]],
    skills: {
      together: { title: "عمل آلتين معًا بمعدلين مختلفين", from: 0, to: 230, gen(R, h) {
        const A = h.A, a = R.int(2, 9) * 100, b = R.int(2, 20) * 10, tb = R.pick([2, 4, 5]), t = R.int(2, 9) * tb, v = a * t + b * t / tb;
        return { style: "t", sig: `${a}:${b}:${tb}:${t}`, body: `طابعة تطبع ${A(a)} كلمة في ثانية، وأخرى تطبع ${A(b)} كلمة في ${A(tb)} ثوانٍ. إذا عملتا معًا ${U(h, t, "ثوانٍ", "ثانية")}، كم كلمة تطبعان؟`,
          ...h.numOptions(R, h.d(v), [h.d(a * t + b * t), h.d((a + b) * t / tb), h.d(a * t)]),
          steps: [`الأولى في ${U(h, t, "ثوانٍ", "ثانية")}: ${A(a)} × ${A(t)} = ${A(a * t)} كلمة.`, `الثانية: ${A(b)} ← ${A(tb)} ، س ← ${A(t)} ، س = ${h.frac(`${A(b)} × ${A(t)}`, A(tb))} = ${A(b * t / tb)} كلمة.`, `المجموع = ${A(v)} كلمة.`], explanation: A(v) };
      } },
      fracRate: { title: "تناسب طردي بكسور", from: 230, to: 380, gen(R, h) {
        const A = h.A, [p, q] = R.pick([[2, 3], [3, 4], [1, 2], [3, 5]]), H = R.int(2, 9), v = p / q * 2 * H; if (!Number.isInteger(v)) return null;
        return { style: "f", sig: `${p}:${q}:${H}`, body: `إذا كان أحمد يستطيع عمل ${h.frac(A(p), A(q))} صفحة إنترنت في نصف ساعة، فكم صفحة يعمل في ${A(H)} ساعات؟`,
          ...h.strOptions(R, `${A(v)} صفحة`, [`${A(v + 1)} صفحة`, `${A(H)} صفحة`, `${A(v / 2 | 0 || v + 2)} صفحة`]),
          steps: [DIR, `${h.frac(A(p), A(q))} ← ${h.frac("١", "٢")} ساعة ، س ← ${A(H)} ساعات.`, `س = ${h.frac(A(p), A(q))} × ${A(H)} ÷ ${h.frac("١", "٢")} = ${h.frac(A(p), A(q))} × ${A(H)} × ٢ = ${A(v)} صفحة.`], explanation: `${A(v)} صفحة` };
      } },
      machines: { title: "آلات متساوية الكفاءة تعطّل بعضها", from: 380, to: 550, gen(R, h) {
        const A = h.A, n = R.int(3, 8), per = R.int(2, 30) * 50, P = n * per, k = R.int(1, n - 1), v = (n - k) * per;
        return { style: "m", sig: `${n}:${per}:${k}`, body: `إذا كانت ${A(n)} مولدات تعمل بكفاءة متساوية لتنتج ${A(P)} واط، وتعطّل ${k === 1 ? "أحدها" : A(k) + " منها"}، فكم يكون إنتاج الباقية؟`,
          ...h.numOptions(R, h.d(v), [h.d(P - k * 100 > 0 ? P - k * 100 : v + per), h.d(per), h.d(v + per)]),
          steps: [`إنتاج المولد الواحد = ${A(P)} ÷ ${A(n)} = ${A(per)} واط.`, `الباقية ${A(n - k)} مولدات ، فإنتاجها = ${A(n - k)} × ${A(per)} = ${A(v)} واط.`], explanation: A(v) };
      } },
      pump: { title: "التناسب الطردي بين الكمية والزمن", from: 550, to: 670, gen(R, h) {
        const A = h.A, r = R.int(5, 40), t = R.pick([5, 10, 12, 15, 20]), q = r * t, t2 = R.int(2, 12) * 4, q2 = r * t2; if (t2 === t) return null;
        return { style: "p", sig: `${r}:${t}:${t2}`, body: `مضخة تضخ ${A(q)} جالون في ${A(t)} دقيقة، كم دقيقة تحتاج لتضخ ${A(q2)} جالون؟`, ...h.numOptions(R, h.d(t2), [h.d(t2 + 4), h.d(Math.round(q * t / q2) || t2 + 2), h.d(t + t2)]),
          steps: [DIR, `${A(q)} ← ${A(t)} ، و ${A(q2)} ← س.`, `س = ${h.frac(`${A(t)} × ${A(q2)}`, A(q))} = ${A(t2)} دقيقة.`], explanation: A(t2) };
      } },
      conv: { title: "التحويل بين العملات والوحدات والمقارنة", from: 670, to: 1030, gen(R, h) {
        const A = h.A, mode = R.pick(["unit", "eur", "dinar", "kwd"]);
        let base, x, y, steps, body;
        if (mode === "unit") { const m = R.int(5, 30), km = Math.round(m * 1.6) + R.pick([-3, 0, 3]); x = m * 1.6; y = km;
          body = h.cmpBody("إذا كان ١ ميل = ١,٦ كيلومتر", `${A(m)} ميل`, `${A(km)} كيلومتر`); steps = [`${A(m)} ميل = ${A(m)} × ١,٦ = ${h.fx(h.d(x.toFixed(1)))} كيلومتر.`]; }
        else if (mode === "eur") { const rate = R.pick(["3.78", "4.05", "3.95", "4.1"]), n = R.int(5, 20), r = R.int(Math.round(n * +rate) - 4, Math.round(n * +rate) + 4); x = n * +rate; y = r;
          body = h.cmpBody(`إذا كان ١ يورو = ${h.fx(h.d(rate))} ريال`, `${A(n)} يورو`, `${A(r)} ريال`); steps = [`${A(n)} يورو = ${A(n)} × ${h.fx(h.d(rate))} = ${h.fx(h.mul(h.d(n), h.d(rate)))} ريال.`, "تقريب سريع: اضرب في العدد الصحيح الأقرب ثم انظر للفرق."]; }
        else if (mode === "dinar") { const d = R.pick([90, 80, 120]), rr = R.int(3, 15), dn = Math.round(rr * d / 100) + R.pick([-2, 1, 3]); x = rr * d / 100; y = dn;
          body = h.cmpBody(`إذا علمت أن ١٠٠ ريال = ${A(d)} دينار`, `${A(rr)} ريال`, `${A(dn)} دينار`); steps = [`${A(rr)} ريال = ${h.frac(`${A(rr)} × ${A(d)}`, "١٠٠")} = ${h.fx(h.d(String(x)))} دينار.`]; }
        else { const r = R.pick([1350, 1250, 1200]), k = R.int(2, 9), rv = R.int(Math.round(k * r / 100) - 6, Math.round(k * r / 100) + 6); x = k * r / 100; y = rv;
          body = h.cmpBody(`إذا علمت أن ${A(r)} ريال = ١٠٠ دينار كويتي`, `${A(k)} دينار كويتي`, `${A(rv)} ريال`); steps = [`${A(k)} دينار = ${h.frac(`${A(k)} × ${A(r)}`, "١٠٠")} = ${h.fx(h.d(String(x)))} ريال.`]; }
        if (Math.abs(x - y) < .01) return null;
        return { style: mode, sig: `${mode}${x}:${y}`, body, ...h.cmpAnswer(h.d(x.toFixed(2)), h.d(y)), steps: ["نحوّل القيمتين إلى الوحدة نفسها ثم نقارن.", ...steps, `إذن ${rel(x, y)}.`], explanation: rel(x, y) };
      } },
      food: { title: "التناسب العكسي: الأشخاص ومدة كفاية الغذاء", from: 1030, to: 1230, gen(R, h) {
        const A = h.A, p = R.int(4, 30), d = R.int(4, 30), T = p * d, add = R.int(1, 10), sub = R.next() < .3, p2 = sub ? p - add : p + add; if (p2 <= 0 || T % p2) return null; const v = T / p2;
        return { style: "f" + sub, sig: `${p}:${d}:${add}:${sub}`, body: `${A(p)} شخصًا يكفيهم الغذاء لمدة ${U(h, d, "أيام", "يومًا")}، فإذا ${sub ? "غادر منهم" : "أُضيف إليهم"} ${U(h, add, "أشخاص", add === 1 ? "شخص" : add === 2 ? "شخصان" : "شخصًا")}، فما المدة التي يكفيهم فيها الغذاء؟`,
          ...h.strOptions(R, `${A(v)} أيام`, [`${A(sub ? d - 1 : d + 1)} أيام`, `${A(Math.round(d * p2 / p))} أيام`, `${A(v + 2)} أيام`].map(x => x === `${A(v)} أيام` ? `${A(v + 3)} أيام` : x)),
          steps: [INV, `الكمية الثابتة = ${A(p)} × ${A(d)} = ${A(T)}.`, `المدة = ${A(T)} ÷ ${A(p2)} = ${A(v)} أيام.`], explanation: `${A(v)} أيام` };
      } },
      workers: { title: "التناسب العكسي: العمال وعدد الأيام", from: 1230, to: 1510, gen(R, h) {
        const A = h.A, w = R.int(2, 60), d = R.int(2, 20), T = w * d, ask = R.pick(["days", "workers"]);
        if (ask === "workers") { const d2 = R.int(1, d - 1 || 1); if (T % d2 || d2 === d) return null; const v = T / d2;
          return { style: "w", sig: `w${w}:${d}:${d2}`, body: `ينهي ${A(w)} عاملًا بناء منزل في ${A(d)} أيام، كم عاملًا يستطيعون بناء المنزل في ${A(d2)} ${d2 === 2 ? "يومين" : "أيام"}؟`.replace("في ٢ يومين", "في يومين"),
            ...h.numOptions(R, h.d(v), [h.d(Math.round(w * d2 / d) || v + 3), h.d(v + w), h.d(w + d - d2)]),
            steps: [INV, `العمل الكلي = ${A(w)} × ${A(d)} = ${A(T)} يوم عمل.`, `عدد العمال = ${A(T)} ÷ ${A(d2)} = ${A(v)} عاملًا.`], explanation: A(v) }; }
        const w2 = R.int(2, 60); if (T % w2 || w2 === w) return null; const v = T / w2;
        return { style: "d", sig: `d${w}:${d}:${w2}`, body: `يستطيع ${A(w)} عمال إنجاز عمل ما في ${A(d)} يومًا، كم يومًا يستغرق ${A(w2)} عمال لإنجاز هذا العمل؟`,
          ...h.numOptions(R, h.d(v), [h.d(Math.round(d * w2 / w) || v + 2), h.d(v + 1), h.d(Math.abs(d + w - w2) || v + 4)]),
          steps: [INV, `العمل الكلي = ${A(w)} × ${A(d)} = ${A(T)}.`, `الأيام = ${A(T)} ÷ ${A(w2)} = ${A(v)} أيام.`], explanation: A(v) };
      } },
      hours: { title: "التناسب العكسي: ساعات العمل اليومية وعدد الأيام", from: 1310, to: 1460, gen(R, h) {
        const A = h.A, hr = R.int(2, 9), d = R.int(2, 9), d2 = R.int(1, 9), v = hr * d / d2; if (d2 === d || !Number.isInteger(v * 2) || v > 24) return null;
        return { style: "h", sig: `${hr}:${d}:${d2}`, body: `إذا كان خالد يعمل في اليوم ${A(hr)} ساعات وينجز العمل في ${A(d)} أيام، فكم ساعة يحتاج يوميًا لينجز العمل في ${d2 === 1 ? "يوم واحد" : d2 === 2 ? "يومين" : A(d2) + " أيام"}؟`,
          ...h.numOptions(R, h.d(String(v)), [h.d(String(hr * d2 / d)), h.d(String(v + 1)), h.d(String(hr + d - d2 > 0 ? hr + d - d2 : v + 2))]),
          steps: [INV, `مجموع الساعات = ${A(hr)} × ${A(d)} = ${A(hr * d)} ساعة.`, `الساعات اليومية = ${A(hr * d)} ÷ ${A(d2)} = ${h.fx(h.d(String(v)))} ساعة.`], explanation: h.fx(h.d(String(v))) };
      } },
      elevator: { title: "التكافؤ في سعة مصعد", from: 1510, to: 1699, gen(R, h) {
        const A = h.A, men = R.pick([10, 12, 15, 20, 24]), k = R.pick([1.2, 1.5, 2]), kids = men * k, inside = R.int(1, men - 1), v = (men - inside) * k; if (!Number.isInteger(kids) || !Number.isInteger(v)) return null;
        return { style: "e", sig: `${men}:${kids}:${inside}`, body: `مصعد يحمل ${A(men)} رجلًا أو ${A(kids)} طفلًا. إذا كان المصعد يحمل ${A(inside)} رجلًا، فكم طفلًا يمكن أن نضيف إليه؟`,
          ...h.numOptions(R, h.d(v), [h.d(kids - inside), h.d(men - inside), h.d(v + 2)]),
          steps: [`المساحة المتبقية تكفي ${A(men)} − ${A(inside)} = ${A(men - inside)} رجال.`, `${A(men)} رجلًا ← ${A(kids)} طفلًا ، و ${A(men - inside)} ← س.`, `س = ${h.frac(`${A(kids)} × ${A(men - inside)}`, A(men))} = ${A(v)} أطفال.`], explanation: A(v) };
      } }
    }
  };
})();
