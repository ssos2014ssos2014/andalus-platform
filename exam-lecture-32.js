// المحاضرة 32: دوري الأيام والساعات، العدد الدوري والأنماط المتكررة
(() => {
  const D = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
  const opt = (R, h, i, k) => h.strOptions(R, D[(i % 7 + 7) % 7], [k + 1, k - 1, k + 2].map(x => D[((i - k + x) % 7 + 7) % 7]).filter(x => x !== D[(i % 7 + 7) % 7]).concat(D.filter(x => x !== D[(i % 7 + 7) % 7])).filter((x, j, a) => a.indexOf(x) === j).slice(0, 3));
  window.EXAMS[32] = {
    title: "اختبار محاكي: دوري الأيام والساعات والأنماط المتكررة", minutes: 25,
    blueprint: [["after", 4], ["before", 2], ["period", 3], ["hijri", 1], ["hours", 4], ["digit", 4], ["pattern", 4], ["letters", 2]],
    skills: {
      after: { title: "اليوم بعد عدد من الأيام", from: 0, to: 180, gen(R, h) {
        const A = h.A, s = R.int(0, 6), n = R.pick([R.int(8, 100), R.int(2, 15) * 7]), r = n % 7, e = s + r;
        return { style: "a" + (r === 0), sig: `${s}:${n}`, body: `إذا كان اليوم هو ${D[s]} ، فبعد ${A(n)} يومًا يصبح اليوم:`, ...opt(R, h, e, r),
          steps: ["الأيام تتكرر كل ٧ أيام، فنقسم عدد الأيام على ٧ ونأخذ الباقي.", `${A(n)} ÷ ٧ = ${A(Math.floor(n / 7))} أسبوعًا والباقي ${A(r)}.`, r ? `نعد ${A(r)} ${r <= 2 ? "يوم" : "أيام"} بعد ${D[s]}: ${D[e % 7]}.` : `الباقي صفر فيكون اليوم نفسه: ${D[s]}.`], explanation: D[e % 7] };
      } },
      before: { title: "اليوم قبل عدد من الأيام", from: 180, to: 240, gen(R, h) {
        const A = h.A, s = R.int(0, 6), n = R.int(8, 90), r = n % 7, e = s - r;
        return { style: "b", sig: `${s}:${n}`, body: `إذا كان اليوم هو ${D[s]} ، فقبل ${A(n)} يومًا كان اليوم:`, ...opt(R, h, e, -r),
          steps: [`${A(n)} ÷ ٧ = ${A(Math.floor(n / 7))} والباقي ${A(r)}.`, r ? `نعد ${A(r)} ${r <= 2 ? "يوم" : "أيام"} إلى الخلف من ${D[s]}: ${D[((e % 7) + 7) % 7]}.` : `الباقي صفر: ${D[s]}.`], explanation: D[((e % 7) + 7) % 7] };
      } },
      period: { title: "بداية مدة تنتهي في يوم معلوم", from: 240, to: 420, gen(R, h) {
        const A = h.A, end = R.int(0, 6), n = R.pick([R.int(10, 90), 30, 40, 60]), start = end - (n - 1), r = (n - 1) % 7;
        return { style: "p", sig: `${end}:${n}`, body: `إذا كانت الإجازة الصيفية ${A(n)} يومًا وانتهت يوم ${D[end]} ، فمتى بدأت؟`, ...opt(R, h, start, -r),
          steps: ["يوم البداية ويوم النهاية كلاهما من أيام الإجازة، فالفرق بينهما " + `${A(n)} − ١ = ${A(n - 1)} يومًا.`, `${A(n - 1)} ÷ ٧ ← الباقي ${A(r)}.`, `نرجع ${A(r)} ${r <= 2 ? "يوم" : "أيام"} من ${D[end]}: ${D[((start % 7) + 7) % 7]}.`], explanation: D[((start % 7) + 7) % 7] };
      } },
      hijri: { title: "السنة الهجرية ٣٥٥ يومًا", from: 0, to: 480, gen(R, h) {
        const s = R.int(0, 6), ask = R.pick(["end", "next"]), e = ask === "end" ? s + 354 : s + 355;
        return { style: ask, sig: `${s}:${ask}`, body: ask === "end" ? `إذا بدأت السنة الهجرية يوم ${D[s]} ، فبأي يوم تنتهي السنة؟ (السنة الهجرية = ٣٥٥ يومًا تقريبًا)` : `إذا بدأت السنة الهجرية يوم ${D[s]} ، فبأي يوم تبدأ السنة التي بعدها؟ (السنة الهجرية = ٣٥٥ يومًا تقريبًا)`,
          ...opt(R, h, e, ask === "end" ? 4 : 5),
          steps: [ask === "end" ? "آخر يوم = أول يوم + ٣٥٤ يومًا." : "أول السنة التالية = أول السنة + ٣٥٥ يومًا.", `${ask === "end" ? "٣٥٤" : "٣٥٥"} ÷ ٧ ← الباقي ${ask === "end" ? "٤" : "٥"}.`, `${D[s]} + ${ask === "end" ? "٤" : "٥"} أيام = ${D[e % 7]}.`], explanation: D[e % 7] };
      } },
      hours: { title: "دوري الساعات (كل ٢٤ ساعة)", from: 480, to: 900, gen(R, h) {
        const A = h.A, now = R.int(1, 12), n = R.int(5, 100), r = n % 24, t = ((now + r - 1) % 12) + 1;
        const o = [t, (t % 12) + 1, ((t + 10) % 12) + 1, ((now + n % 12 + 1) % 12) + 1].map(A);
        return { style: "h", sig: `${now}:${n}`, body: `الآن الساعة ${A(now)} ، فبعد ${A(n)} ساعة تصبح الساعة:`, ...h.strOptions(R, A(t), [...new Set(o.slice(1).filter(x => x !== A(t)))].concat([A(((t + 4) % 12) + 1), A(((t + 6) % 12) + 1)]).slice(0, 3)),
          steps: ["كل ٢٤ ساعة تعود الساعة إلى الوقت نفسه، فنطرح مضاعفات ٢٤ (٢٤ ، ٤٨ ، ٧٢ ، ...).", `${A(n)} = ${A(n - r)} + ${A(r)} ، فنضيف ${A(r)} ساعة فقط.`, `${A(now)} + ${A(r)} = ${A(now + r)}${now + r > 12 ? ` ، وعلى ساعة الحائط (١٢ ساعة) تكون ${A(t)}` : ""}.`], explanation: A(t) };
      } },
      digit: { title: "الخانة رقم ن في عدد دوري", from: 900, to: 1100, gen(R, h) {
        const A = h.A, L = R.int(3, 6), digs = Array.from({ length: L }, () => R.int(0, 9)); if (new Set(digs).size < 3) return null; const n = R.int(20, 150), r = n % L, d = digs[(r || L) - 1];
        const shown = "٠," + Array(3).fill(digs.map(A).join("")).join("") + "...";
        const others = [...new Set(digs.filter(x => x !== d))].map(A);
        if (others.length < 3) others.push(...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== d && !digs.includes(x)).map(A));
        return { style: "d" + L, sig: `${digs.join("")}:${n}`, body: `ما الخانة رقم ${A(n)} بعد الفاصلة في العدد الدوري ${shown}`, ...h.strOptions(R, A(d), others.slice(0, 3)),
          steps: [`الجزء المتكرر ${digs.map(A).join("")} طوله ${A(L)} أرقام.`, `${A(n)} ÷ ${A(L)} ← الباقي ${A(r)}.`, r ? `نأخذ الرقم رقم ${A(r)} من الجزء المتكرر: ${A(d)}.` : `الباقي صفر فنأخذ آخر رقم في الجزء المتكرر: ${A(d)}.`], explanation: A(d) };
      } },
      pattern: { title: "العنصر رقم ن في نمط متكرر", from: 1100, to: 1390, gen(R, h) {
        const A = h.A, sets = [["فراولة", "مانجو", "تفاح", "أناناس"], ["أحمر", "أخضر", "أزرق", "أسود"], ["مربع", "دائرة", "مثلث"], ["أ", "ب", "ج", "د", "هـ"]], mode = R.pick(["named", "named", "num"]);
        if (mode === "num") { const L = R.int(4, 6), list = R.shuffle([1, 2, 3, 5, 7, 8, 9]).slice(0, L), n = R.int(40, 150), r = n % L, v = list[(r || L) - 1];
          return { style: "n", sig: `${list.join("")}:${n}`, body: `إذا كانت الأعداد ${list.map(A).join(" ، ")} تتكرر بنفس الترتيب، فما العدد رقم ${A(n)}؟`, ...h.strOptions(R, A(v), list.filter(x => x !== v).slice(0, 3).map(A)),
            steps: [`طول النمط ${A(L)}.`, `${A(n)} ÷ ${A(L)} ← الباقي ${A(r)}.`, r ? `العنصر رقم ${A(r)} في النمط = ${A(v)}.` : `الباقي صفر فهو آخر عنصر في النمط = ${A(v)}.`], explanation: A(v) }; }
        const set = R.pick(sets), L = set.length, n = R.int(30, 150), r = n % L, v = set[(r || L) - 1], what = set[0] === "فراولة" ? "مصنع ينتج علب عصير على الترتيب" : set[0] === "أحمر" ? "مصنع ينتج أقلامًا على الترتيب" : set[0] === "مربع" ? "شكل مزخرف يتكرر فيه على الترتيب" : "تتكرر الحروف على الترتيب";
        return { style: "s" + L, sig: `${set[0]}:${n}`, body: `${what}: ${set.join(" ، ")} ، ... فما العنصر رقم ${A(n)}؟`, ...h.strOptions(R, v, set.filter(x => x !== v).slice(0, 3).concat(["لا يمكن تحديده"]).slice(0, 3)),
          steps: [`طول النمط ${A(L)}.`, `${A(n)} ÷ ${A(L)} = ${A(Math.floor(n / L))} والباقي ${A(r)}.`, r ? `العنصر رقم ${A(r)} = ${v}.` : `الباقي صفر فهو آخر عنصر = ${v}.`], explanation: v };
      } },
      letters: { title: "كتابة حرف كل يوم", from: 1390, to: 1530, gen(R, h) {
        const A = h.A, [w, n] = R.pick([["مركز قياس", 8], ["القدرات", 7], ["التحصيلي", 8], ["المملكة", 7], ["الرياضيات", 9], ["مدرسة", 5]]), s = R.int(0, 6), e = s + n - 1;
        return { style: "l", sig: `${w}:${s}`, body: `طالب يكتب كلمة (${w}) بحيث يكتب كل يوم حرفًا واحدًا، وبدأ يوم ${D[s]} ، فمتى سينتهي؟`, ...opt(R, h, e, n - 1),
          steps: [`عدد الحروف ${A(n)}${w.includes(" ") ? " (بدون المسافة)" : ""}، فيكتب ${A(n)} أيام أولها ${D[s]}.`, `آخر يوم = أول يوم + ${A(n - 1)} يومًا ، و ${A(n - 1)} ÷ ٧ ← الباقي ${A((n - 1) % 7)}.`, `ينتهي يوم ${D[e % 7]}.`], explanation: D[e % 7] };
      } }
    }
  };
})();
