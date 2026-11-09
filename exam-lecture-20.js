// المحاضرة 20: السرعة المتوسطة، المسافة التي تقطعها العجلة وعدد دوراتها
(() => {
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  const H = (h, n) => n === 1 ? "ساعة" : n === 2 ? "ساعتين" : n <= 10 ? `${h.A(n)} ساعات` : `${h.A(n)} ساعة`;
  const g = (a, b) => b ? g(b, a % b) : a;
  // أزواج سرعات متوسطها التوافقي عدد صحيح
  const PAIRS = []; for (let a = 10; a <= 150; a += 5) for (let b = a + 5; b <= 150; b += 5) { const m = 2 * a * b / (a + b); if (Number.isInteger(m)) PAIRS.push([a, b, m]); }
  window.EXAMS[20] = {
    title: "اختبار محاكي: السرعة المتوسطة ودوران العجلة", minutes: 25,
    blueprint: [["avgTimes", 3], ["avgTwo", 3], ["avgCmp", 2], ["avgMulti", 2], ["findSpeed", 3], ["avgApprox", 2], ["wheelDist", 3], ["wheelPi", 3], ["revs", 3]],
    skills: {
      avgTimes: { title: "السرعة المتوسطة = مجموع المسافات ÷ مجموع الأزمنة", from: 0, to: 200, gen(R, h) {
        const A = h.A, d = R.int(2, 12) * 30, t1 = R.int(1, 6), t2 = R.int(1, 6), v = 2 * d / (t1 + t2); if (t1 === t2 || !Number.isInteger(v)) return null;
        const wrong = Math.round((d / t1 + d / t2) / 2);
        return { style: "t", sig: `${d}:${t1}:${t2}`, body: `تقطع سيارة ${A(d)} كم ذهابًا في ${H(h, t1)} ، ثم تعود لتقطع نفس المسافة في ${H(h, t2)} ، فما متوسط سرعة السيارة؟`,
          ...h.strOptions(R, `${A(v)} كم/س`, [`${A(wrong)} كم/س` === `${A(v)} كم/س` ? `${A(v + 10)} كم/س` : `${A(wrong)} كم/س`, `${A(v + 20)} كم/س`, `${A(d / Math.max(t1, t2) | 0)} كم/س` === `${A(v)} كم/س` ? `${A(v - 10)} كم/س` : `${A(d / Math.max(t1, t2) | 0)} كم/س`]),
          steps: [`مجموع المسافات = ${A(d)} + ${A(d)} = ${A(2 * d)} كم.`, `مجموع الأزمنة = ${A(t1)} + ${A(t2)} = ${A(t1 + t2)} ساعات.`, `السرعة المتوسطة = ${A(2 * d)} ÷ ${A(t1 + t2)} = ${A(v)} كم/س.`], explanation: `${A(v)} كم/س` };
      } },
      avgTwo: { title: "السرعة المتوسطة لسرعتين على المسافة نفسها", from: 200, to: 400, gen(R, h) {
        const A = h.A, [a, b, m] = R.pick(PAIRS), sw = R.next() < .5, [x, y] = sw ? [b, a] : [a, b], mean = (a + b) / 2;
        return { style: "s", sig: `${a}:${b}:${sw}`, body: `سيارة تقطع المسافة بين مدينتين بسرعة ${A(x)} كم/س وتعود بسرعة ${A(y)} كم/س ، فما سرعتها المتوسطة؟`,
          ...h.strOptions(R, `${A(m)} كم/س`, [Number.isInteger(mean) ? `${A(mean)} كم/س` : `${h.fx(h.d(String(mean)))} كم/س`, `${A(m + 5)} كم/س`, `${A(m - 5)} كم/س`]),
          steps: ["المسافتان متساويتان، فالسرعة المتوسطة = ٢ × ضرب السرعتين ÷ مجموع السرعتين.", `= ٢ × ${A(x)} × ${A(y)} ÷ (${A(x)} + ${A(y)}) = ${A(2 * a * b)} ÷ ${A(a + b)} = ${A(m)} كم/س.`, "لاحظ: السرعة المتوسطة أقل من الوسط الحسابي للسرعتين، فاستبعد خيار الوسط الحسابي."], explanation: `${A(m)} كم/س` };
      } },
      avgCmp: { title: "المقارنة بين السرعة المتوسطة والوسط الحسابي", from: 0, to: 400, gen(R, h) {
        const A = h.A, [a, b, m] = R.pick(PAIRS), mode = R.pick(["mean", "val"]);
        if (mode === "mean") { const mean = (a + b) / 2;
          return { style: "m", sig: `m${a}:${b}`, body: `سيارة ذهبت إلى مدينة بسرعة ${A(a)} كم/س وعادت بالطريق نفسه بسرعة ${A(b)} كم/س.\nقارن بين:\nالقيمة الأولى: السرعة المتوسطة للرحلة\nالقيمة الثانية: ${Number.isInteger(mean) ? A(mean) : h.fx(h.d(String(mean)))} كم/س`, ...h.cmpAnswer(h.d(m), h.d(String(mean))),
            steps: [`السرعة المتوسطة = ٢ × ${A(a)} × ${A(b)} ÷ ${A(a + b)} = ${A(m)} كم/س.`, "القيمة الثانية هي الوسط الحسابي للسرعتين.", "السرعة المتوسطة أقل دائمًا من الوسط الحسابي عند اختلاف السرعتين: القيمة الثانية أكبر."], explanation: "القيمة الثانية أكبر" }; }
        const k = m + R.pick([-5, 0, 5]);
        return { style: "v", sig: `v${a}:${b}:${k}`, body: `يذهب رجل إلى عمله بسرعة ${A(a)} كم/س ويعود بسرعة ${A(b)} كم/س.\nقارن بين:\nالقيمة الأولى: السرعة المتوسطة\nالقيمة الثانية: ${A(k)} كم/س`, ...h.cmpAnswer(h.d(m), h.d(k)),
          steps: [`السرعة المتوسطة = ${h.frac(`٢ × ${A(a)} × ${A(b)}`, `${A(a)} + ${A(b)}`)} = ${A(m)} كم/س.`, `نقارن ${A(m)} مع ${A(k)}: ${rel(m, k)}.`], explanation: rel(m, k) };
      } },
      avgMulti: { title: "السرعة المتوسطة لرحلة من عدة مراحل", from: 0, to: 200, gen(R, h) {
        const A = h.A, v1 = R.int(4, 12) * 10, t1 = R.int(1, 3), v2 = R.int(4, 12) * 10, t2 = R.int(1, 3), v3 = R.int(4, 12) * 10, t3 = R.int(1, 2), D = v1 * t1 + v2 * t2 + v3 * t3, T = t1 + t2 + t3, v = D / T; if (!Number.isInteger(v)) return null;
        return { style: "m", sig: `${v1}:${t1}:${v2}:${t2}:${v3}:${t3}`, body: `سار رجل ${H(h, t1)} بسرعة ${A(v1)} كم/س ، ثم ${H(h, t2)} بسرعة ${A(v2)} كم/س ، ثم ${H(h, t3)} بسرعة ${A(v3)} كم/س. فما سرعته المتوسطة للرحلة كلها؟`,
          ...h.strOptions(R, `${A(v)} كم/س`, [`${A(Math.round((v1 + v2 + v3) / 3))} كم/س` === `${A(v)} كم/س` ? `${A(v + 10)} كم/س` : `${A(Math.round((v1 + v2 + v3) / 3))} كم/س`, `${A(v + 5)} كم/س`, `${A(v - 5)} كم/س`]),
          steps: [`المسافات: ${A(v1 * t1)} + ${A(v2 * t2)} + ${A(v3 * t3)} = ${A(D)} كم.`, `الأزمنة: ${A(t1)} + ${A(t2)} + ${A(t3)} = ${A(T)} ساعات.`, `السرعة المتوسطة = ${A(D)} ÷ ${A(T)} = ${A(v)} كم/س.`], explanation: `${A(v)} كم/س` };
      } },
      findSpeed: { title: "إيجاد سرعة العودة من السرعة المتوسطة", from: 200, to: 400, gen(R, h) {
        const A = h.A, [a, b, m] = R.pick(PAIRS), sw = R.next() < .5, known = sw ? b : a, other = sw ? a : b;
        return { style: "f" + sw, sig: `${a}:${b}:${sw}`, body: `ذهب أحمد إلى مدينة بسرعة ${A(known)} كم/س وعاد بالطريق نفسه، فكانت سرعته المتوسطة للرحلة ${A(m)} كم/س. فما سرعته في العودة؟`,
          ...h.strOptions(R, `${A(other)} كم/س`, [`${A(2 * m - known)} كم/س` === `${A(other)} كم/س` ? `${A(other + 10)} كم/س` : `${A(2 * m - known)} كم/س`, `${A(m)} كم/س`, `${A(other + 5)} كم/س`]),
          steps: [`نستخدم القانون: السرعة المتوسطة = ٢ × ع١ × ع٢ ÷ (ع١ + ع٢) ، أي ٢ × ${A(known)} × ع ÷ (${A(known)} + ع) = ${A(m)}.`, `بالتجربة: ع = ${A(other)} لأن ٢ × ${A(a)} × ${A(b)} ÷ ${A(a + b)} = ${A(m)}.`, "تنبيه: لا تحسب بالوسط الحسابي (٢ × المتوسطة − سرعة الذهاب) فهو خطأ شائع."], explanation: `${A(other)} كم/س` };
      } },
      avgApprox: { title: "السرعة المتوسطة بالتقريب", from: 1520, to: 1672, gen(R, h) {
        const A = h.A, a = R.int(6, 15) * 10, b = a + R.pick([10, 20, 30]), m = 2 * a * b / (a + b); if (Number.isInteger(m)) return null;
        const f = Math.floor(m), D = R.int(2, 9) * 50, opts = [f, f - 3, f + 3, (a + b) / 2].map(x => Number.isInteger(x) ? A(x) : h.fx(h.d(String(x))));
        if (new Set(opts).size < 4 || m - f > .9) return null;
        return { style: "a", sig: `${a}:${b}:${D}`, body: `ذهب محمد إلى المدينة بسرعة ${A(b)} كم/س ورجع بسرعة ${A(a)} كم/س. أوجد السرعة المتوسطة تقريبًا إذا كانت المسافة بين المدينتين ${A(D)} كم`,
          ...h.strOptions(R, opts[0], opts.slice(1)),
          steps: ["المسافة نفسها ذهابًا وإيابًا، فلا نحتاج قيمتها.", `السرعة المتوسطة = ٢ × ${A(a)} × ${A(b)} ÷ ${A(a + b)} = ${A(2 * a * b)} ÷ ${A(a + b)} ≈ ${h.fx(h.d(m.toFixed(1)))} كم/س.`, `الوسط الحسابي ${(a + b) / 2 === Math.round((a + b) / 2) ? A((a + b) / 2) : ""} مستبعد لأن المتوسطة أقل منه، فالأقرب ${A(f)}.`], explanation: A(f) };
      } },
      wheelDist: { title: "المسافة التي تقطعها العجلة (ط = ٣,١٤)", from: 400, to: 790, gen(R, h) {
        const A = h.A, r = R.pick([5, 10, 15, 20, 25, 30, 35, 40, 50]), n = R.int(2, 20), D = h.shift(h.mul(h.d(2 * n * r), h.d("3.14")), 2), dia = R.next() < .3;
        return { style: "d" + dia, sig: `${r}:${n}:${dia}`, body: `عجلة ${dia ? "قطرها " + A(2 * r) : "نصف قطرها " + A(r)} سم تدور ${A(n)} دورة ، فكم المسافة التي تقطعها بالمتر؟ (ط = ٣,١٤)`,
          ...h.strOptions(R, `${h.fx(D)} متر`, [`${h.fx(h.shift(D, -2))} متر`, `${h.fx(h.shift(D, 1))} متر`, `${h.fx(h.shift(D, -1))} متر`]),
          steps: [`المسافة = عدد اللفات × ٢ ط نق${dia ? ` ، ونق = ${A(2 * r)} ÷ ٢ = ${A(r)} سم` : ""}.`, `= ${A(n)} × ٢ × ٣,١٤ × ${A(r)} = ${h.fx(h.shift(D, -2))} سم.`, `نقسم على ١٠٠ للتحويل إلى متر: ${h.fx(D)} متر.`], explanation: `${h.fx(D)} متر` };
      } },
      wheelPi: { title: "مسافة العجلة بدلالة ط", from: 790, to: 1000, gen(R, h) {
        const A = h.A, r = R.pick([10, 15, 20, 25, 30, 40, 50, 60]), n = R.int(5, 40), k = h.shift(h.d(2 * n * r), 2), dia = R.next() < .4;
        const P = x => `${h.fx(x)} ط`;
        return { style: "p" + dia, sig: `${r}:${n}:${dia}`, body: `إذا كان ${dia ? "قطر" : "نصف قطر"} العجلة يساوي ${A(dia ? 2 * r : r)} سم ، كم المسافة التي تقطعها بالمتر إذا دارت ${A(n)} دورة؟`,
          ...h.strOptions(R, P(k), [P(h.shift(k, -2)), P(h.mul(k, h.d(2))), P(h.div(k, h.d(2)))]),
          steps: [`المسافة = عدد اللفات × ٢ ط نق${dia ? ` ، ونق = ${A(r)} سم (نصف القطر)` : ""}.`, `= ${A(n)} × ٢ × ${A(r)} ط = ${A(2 * n * r)} ط سم.`, `بالمتر: ${A(2 * n * r)} ÷ ١٠٠ = ${P(k)} متر.`], explanation: `${P(k)} متر` };
      } },
      revs: { title: "عدد دورات العجلة (ط = ٢٢/٧)", from: 1000, to: 1500, gen(R, h) {
        const A = h.A, [r, unit] = R.pick([[0.7, 44], [0.35, 22], [1.4, 88], [0.14, 8.8], [0.07, 4.4]]), mult = R.int(1, 4), v = (unit === 8.8 || unit === 4.4) ? R.pick([22, 44, 66]) : 22 * mult, half = R.next() < .3;
        const C = h.mul(h.d(String(2 * r)), h.d(22)), Cm = h.div(C, h.d(7)), dist = v * 1000 * (half ? .5 : 1), N = Math.round(dist / (44 * r / 7));
        if (Math.abs(dist / (44 * r / 7) - N) > 1e-6) return null;
        return { style: "r" + half, sig: `${r}:${v}:${half}`, body: `سيارة تمشي بسرعة ${A(v)} كم/س ونصف قطر عجلتها ${h.fx(h.d(String(r)))} متر ، احسب عدد دورات العجلة في زمن قدره ${half ? "نصف ساعة" : "ساعة"} (ط = ${h.frac("٢٢", "٧")})`,
          ...h.numOptions(R, h.d(N), [h.d(N * 10), h.d(N / 10 | 0 || N * 2), h.d(N * 100)]),
          steps: [`المسافة = ${A(v)} × ${half ? "نصف" : "١"} = ${A(dist / 1000)} كم = ${A(dist)} م.`, `محيط العجلة = ٢ × ${h.frac("٢٢", "٧")} × ${h.fx(h.d(String(r)))} = ${h.fx(Cm)} م.`, `عدد الدورات = ${A(dist)} ÷ ${h.fx(Cm)} = ${A(N)} دورة.`], explanation: A(N) };
      } }
    }
  };
})();
