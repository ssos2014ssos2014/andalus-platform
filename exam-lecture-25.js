// المحاضرة 25: التناسب الطردي
(() => {
  const STEP = "التناسب طردي: إذا زادت إحدى الكميتين زادت الأخرى بالنسبة نفسها، فنضرب طرفين في وسطين.";
  window.EXAMS[25] = {
    title: "اختبار محاكي: التناسب الطردي", minutes: 25,
    blueprint: [["workers", 3], ["rate", 4], ["timeFor", 3], ["maxCount", 3], ["resource", 3], ["priceDiff", 2], ["perHour", 3], ["unitFrac", 3]],
    skills: {
      workers: { title: "زيادة عدد العمال وزيادة الإنتاج", from: 0, to: 270, gen(R, h) {
        const A = h.A, w = R.int(2, 12) * 10, per = R.int(2, 9) * 10, out = w * per, add = R.int(1, 5) * 10, sub = R.next() < .25, w2 = sub ? w - add : w + add; if (w2 <= 0) return null; const v = w2 * per;
        return { style: "w" + sub, sig: `${w}:${per}:${add}:${sub}`, body: `ينتج ${A(w)} عاملًا في الشهر ${A(out)} متر من القماش، فإذا ${sub ? "نقص" : "زاد"} عدد العمال ${A(add)} ، فكم يكون إنتاجهم في الشهر؟`,
          ...h.numOptions(R, h.d(v), [h.d(sub ? out + add * per : out - add * per > 0 ? out - add * per : v + per), h.d(out + add), h.d(out)]),
          steps: [STEP, `عدد العمال الجديد = ${A(w)} ${sub ? "−" : "+"} ${A(add)} = ${A(w2)}.`, `الإنتاج = ${h.frac(`${A(out)} × ${A(w2)}`, A(w))} = ${A(v)} متر.`], explanation: A(v) };
      } },
      rate: { title: "التناسب الطردي بين الكمية والزمن", from: 270, to: 470, gen(R, h) {
        const A = h.A, [who, thing, unit] = R.pick([["تكتب فاطمة", "كلمة", "ثانية"], ["يقطع عدّاء", "مترًا", "ثانية"], ["تطبع آلة", "ورقة", "دقيقة"], ["يقرأ محمد", "صفحة", "دقيقة"]]), t = R.int(2, 12) * 5, k = R.int(2, 8), n = R.int(2, 8) * k, t2 = R.int(2, 15) * 5, v = n * t2 / t; if (!Number.isInteger(v) || t2 === t) return null;
        return { style: "r", sig: `${n}:${t}:${t2}:${thing}`, body: `${who} ${A(n)} ${thing} في ${A(t)} ${unit}، فكم ${thing} في ${A(t2)} ${unit}؟`.replace("فكم مترًا", "فكم مترًا").replace("كم كلمة", "كم كلمة"),
          ...h.numOptions(R, h.d(v), [h.d(v + 1), h.d(Math.round(n * t / t2)) === h.d(v) ? h.d(v + 2) : h.d(Math.round(n * t / t2)), h.d(n + t2 - t > 0 ? n + t2 - t : v + 4)]),
          steps: [STEP, `${A(n)} ← ${A(t)} ، و س ← ${A(t2)}.`, `س = ${h.frac(`${A(n)} × ${A(t2)}`, A(t))} = ${A(v)}.`], explanation: A(v) };
      } },
      timeFor: { title: "الزمن اللازم لإنتاج كمية أكبر", from: 360, to: 470, gen(R, h) {
        const A = h.A, n = R.int(2, 20) * 10, t = R.int(3, 10), m = R.int(2, 10), N = n * m, T = t * m;
        return { style: "t", sig: `${n}:${t}:${m}`, body: `ماكينة عصير تعبئ ${A(n)} زجاجة في ${A(t)} دقائق، كم دقيقة تحتاج لتعبئة ${A(N)} زجاجة؟`, ...h.numOptions(R, h.d(T), [h.d(T + t), h.d(Math.round(N / t)), h.d(m)]),
          steps: [STEP, `${A(N)} ÷ ${A(n)} = ${A(m)} ، أي أن الكمية تضاعفت ${A(m)} مرات، فيتضاعف الزمن بالقدر نفسه.`, `الزمن = ${A(t)} × ${A(m)} = ${A(T)} دقيقة.`], explanation: A(T) };
      } },
      maxCount: { title: "أكبر عدد يمكن إنجازه في زمن معين", from: 470, to: 790, gen(R, h) {
        const A = h.A, t = R.pick([12, 15, 18, 20, 25, 35, 40, 45, 50]), H = R.int(2, 8), mins = H * 60, v = Math.floor(mins / t); if (mins % t === 0) return null;
        const [who, thing] = R.pick([["تخيط هند التنورة", "التنانير"], ["يصنع النجار الكرسي", "الكراسي"], ["تنسخ الآلة الملف", "الملفات"]]);
        return { style: "m", sig: `${t}:${H}`, body: `${who} في ${A(t)} دقيقة، فما أكبر عدد من ${thing} يمكن إنجازه في ${A(H)} ساعات؟`, ...h.numOptions(R, h.d(v), [h.d(v + 1), h.d(Math.max(1, v - 1)), h.d(Math.round(t * H / 10) || v + 3)]),
          steps: [`نحوّل الساعات إلى دقائق: ${A(H)} × ٦٠ = ${A(mins)} دقيقة.`, `العدد = ${A(mins)} ÷ ${A(t)} ≈ ${h.fx(h.d((mins / t).toFixed(2)))}.`, `لا يُحسب الجزء غير المكتمل، فأكبر عدد = ${A(v)}.`], explanation: A(v) };
      } },
      resource: { title: "التناسب بين كميتين (الموارد والنتيجة)", from: 790, to: 950, gen(R, h) {
        const A = h.A, k = R.int(2, 9) * 10, trees = R.int(3, 12) * 5, tons = trees * k, f = R.pick([2, 3, 5]); if (trees % f) return null; const t2 = tons / f, v = trees / f;
        return { style: "r", sig: `${k}:${trees}:${f}`, body: `إذا كان ${A(tons)} طن من الورق يكفي لحماية ${A(trees)} شجرة، فكم شجرة يمكن حمايتها إذا كان لدينا ${A(t2)} طن من الورق؟`,
          ...h.numOptions(R, h.d(v), [h.d(trees * f), h.d(v + 5), h.d(trees - f)]),
          steps: [STEP, `${A(tons)} طن ← ${A(trees)} شجرة ، و ${A(t2)} طن ← س.`, `س = ${h.frac(`${A(trees)} × ${A(t2)}`, A(tons))} = ${A(v)} شجرة.`], explanation: A(v) };
      } },
      priceDiff: { title: "الفرق في التكلفة بين سعرين للوحدة", from: 950, to: 1080, gen(R, h) {
        const A = h.A, p1 = R.int(80, 95), p2 = p1 + R.int(2, 9), L = R.int(2, 12) * 10, paid = p2 * L / 100, diff = (p2 - p1) * L / 100; if (!Number.isInteger(paid * 100) || !Number.isInteger(diff * 100)) return null;
        const fx = x => h.fx(h.d(String(+x.toFixed(2))));
        return { style: "p", sig: `${p1}:${p2}:${L}`, body: `إذا كان سعر لتر البنزين داخل المدينة ${A(p1)} هللة وخارجها ${A(p2)} هللة، واشترى رجل بنزينًا من خارج المدينة بـ ${fx(paid)} ريال، فكم الفرق بين سعره خارج المدينة وداخلها؟`,
          ...h.strOptions(R, `${fx(diff)} ريال`, [`${fx(diff + 1)} ريال`, `${A(p2 - p1)} ريال`, `${fx(diff * 2)} ريال`].map(x => x === `${fx(diff)} ريال` ? `${fx(diff + 2)} ريال` : x)),
          steps: [`عدد اللترات = ${fx(paid)} ريال ÷ ${A(p2)} هللة = ${A(p2 * L)} ÷ ${A(p2)} = ${A(L)} لترًا.`, `الفرق في اللتر = ${A(p2 - p1)} هللة ، والفرق الكلي = ${A(p2 - p1)} × ${A(L)} = ${A((p2 - p1) * L)} هللة = ${fx(diff)} ريال.`], explanation: `${fx(diff)} ريال` };
      } },
      perHour: { title: "تحويل المعدل إلى الساعة", from: 1080, to: 1220, gen(R, h) {
        const A = h.A, t = R.pick([10, 12, 15, 20, 30, 40, 45]), n = R.int(2, 12) * (t / [5, 2, 3, 4, 6].find(x => t % x === 0) || 1) | 0, v = n * 60 / t; if (!n || !Number.isInteger(v)) return null;
        return { style: "h", sig: `${n}:${t}`, body: `شخص يطبع ${A(n)} كلمة في ${A(t)} دقيقة، فكم كلمة يطبع في ساعة؟`, ...h.numOptions(R, h.d(v), [h.d(n + 60 - t), h.d(n * 2), h.d(v + n)]),
          steps: ["الساعة = ٦٠ دقيقة.", `${A(n)} ← ${A(t)} ، و س ← ٦٠.`, `س = ${h.frac(`${A(n)} × ٦٠`, A(t))} = ${A(v)} كلمة.`], explanation: A(v) };
      } },
      unitFrac: { title: "التناسب مع كسر للوحدة", from: 1220, to: 1327, gen(R, h) {
        const A = h.A, k = R.pick([10, 20, 50, 100, 1000]), W = R.int(2, 20), v = W * k;
        return { style: "u" + k, sig: `${k}:${W}`, body: `تستخدم الخلايا الشمسية لتوليد الكهرباء في السفن، إذا كان ١ سم² يولّد ${h.frac("١", A(k))} واط، فما المساحة المطلوبة بالسم² لتوليد ${A(W)} واط؟`,
          ...h.strOptions(R, A(v), [h.frac(A(W), A(k)), A(W * k / 10 | 0 || v + k), A(v * 10)]),
          steps: [STEP, `١ سم² ← ${h.frac("١", A(k))} واط ، و س ← ${A(W)} واط.`, `س = ${A(W)} ÷ ${h.frac("١", A(k))} = ${A(W)} × ${A(k)} = ${A(v)} سم².`], explanation: `${A(v)} سم²` };
      } }
    }
  };
})();
