// المحاضرة 8: الأشجار والأعمدة، التحليل، الأعمار، الساعة، قواعد العد، الزكاة، الدائرة، التشابه، فيثاغورس
(() => {
  const S = x => (x < 0 ? "−" : "") + String(Math.abs(x)).replace(/[0-9]/g, c => "٠١٢٣٤٥٦٧٨٩"[c]);
  const C2 = n => n * (n - 1) / 2;
  const AR = x => String(x).replace(/[0-9]/g, c => "٠١٢٣٤٥٦٧٨٩"[c]);
  const YRS = n => `${AR(n)} ${n >= 3 && n <= 10 ? "سنوات" : "سنة"}`;
  const TIMES = m => m === 2 ? "ضعف" : `${AR(m)} أضعاف`;
  const TRIP = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [7, 24, 25]];
  window.EXAMS[8] = {
    title: "اختبار محاكي: الأعمار والعد والتشابه وفيثاغورس", minutes: 25,
    blueprint: [["trees", 2], ["factor", 3], ["ageMul", 2], ["ageSum", 2], ["ageShift", 2], ["clock", 2], ["count", 3], ["zakat", 1], ["circle", 1], ["similar", 2], ["pyth", 2], ["squares", 2]],
    skills: {
      trees: { title: "عدد الأشجار والأعمدة في طريق", from: 0, to: 200, gen(R, h) {
        const A = h.A, gap = R.pick([h.d("0.5"), h.d(2), h.d(5), h.d(10), h.d(4), h.d("2.5")]), n = R.int(6, 60), L = h.mul(gap, h.d(n));
        const circ = R.next() < .3, ans = circ ? n : n + 1, what = R.pick(["الأشجار", "الأعمدة", "المصابيح"]);
        return { style: circ ? "c" : "l", sig: `${circ}:${h.str(L)}:${h.str(gap)}`,
          body: circ ? `حديقة دائرية محيطها ${h.fx(L)} م، نريد غرس ${what} على محيطها بحيث تكون المسافة بين كل اثنين متتاليين ${h.fx(gap)} م، فكم عدد ${what}؟` : `أردنا وضع ${what} على جانب طريق طوله ${h.fx(L)} م من بدايته إلى نهايته، بحيث تكون المسافة بين كل اثنين متتاليين ${h.fx(gap)} م، فكم عدد ${what}؟`,
          ...h.numOptions(R, h.d(ans), [h.d(circ ? n + 1 : n), h.d(ans + 2), h.d(circ ? n - 1 : n - 1)]),
          steps: [`عدد المسافات = الطول ÷ المسافة بين كل اثنين = ${h.fx(L)} ÷ ${h.fx(gap)} = ${A(n)} مسافة.`, circ ? "في المسار الدائري (المغلق) يكون عدد الأشياء = عدد المسافات، لأن الأول هو نفسه نقطة النهاية." : "في الطريق المفتوح: عدد الأشياء = عدد المسافات + ١ (لأننا نضع واحدًا في البداية وواحدًا في النهاية).", `العدد = ${A(ans)}.`], explanation: A(ans) };
      } },
      factor: { title: "التحليل إلى العوامل", from: 200, to: 480, gen(R, h) {
        const A = h.A, style = R.pick(["tri", "common", "cmp"]);
        const term = k => k === 0 ? "" : (k > 0 ? ` + ${A(k)}` : ` − ${A(-k)}`);
        const bin = k => `(س${term(k)})`;
        if (style === "tri") { let a = R.int(-7, 7), b = R.int(-7, 7); if (!a || !b || a === b) return null;
          const B = a + b, Cc = a * b, poly = `س²${B === 0 ? "" : B === 1 ? " + س" : B === -1 ? " − س" : term(B) + "س"}${term(Cc)}`, ans = `${bin(a)} ${bin(b)}`;
          if (B === 0) return null;
          return { style, sig: `t:${a},${b}`, body: `حلّل المقدار: ${poly}`, ...h.strOptions(R, ans, [`${bin(-a)} ${bin(-b)}`, `${bin(a)} ${bin(-b)}`, `${bin(Cc)} ${bin(1)}`]),
            steps: [`نبحث عن عددين حاصل ضربهما ${S(Cc)} (الحد الثابت) ومجموعهما ${S(B)} (معامل س).`, `العددان ${S(a)} و ${S(b)}: ${S(a)} × ${S(b)} = ${S(Cc)} ، و ${S(a)} + ${S(b)} = ${S(B)} ✓`, `إذن ${poly} = ${ans}.`], explanation: ans }; }
        if (style === "common") { const k = R.int(2, 9);
          const ans = `س ${bin(-k)}`;
          return { style, sig: `c:${k}`, body: `حلّل المقدار: س² − ${A(k)}س`, ...h.strOptions(R, ans, [`س ${bin(k)}`, `${bin(-k)} ${bin(k)}`, `${A(k)}س (س − ١)`]),
            steps: ["نخرج العامل المشترك س من الحدين.", `س² − ${A(k)}س = س (س − ${A(k)}).`], explanation: ans }; }
        const k = R.int(1, 6);
        return { style, sig: `m:${k}`, body: h.cmpBody(`إذا كان س عددًا حقيقيًا`, `س² − ${A(2 * k)}س + ${A(k * k)}`, `س − ${A(k)}`), options: ["القيمة الأولى أكبر", "القيمة الثانية أكبر", "القيمتان متساويتان", "المعلومات غير كافية"], correct: 3,
          steps: [`القيمة الأولى = (س − ${A(k)})² .`, `جرّب س = ${A(k)}: القيمتان = صفر (متساويتان).`, `جرّب س = ${A(k + 2)}: الأولى = ٤ والثانية = ٢ (الأولى أكبر).`, "النتيجة تتغير بتغير س، إذن المعطيات غير كافية."], explanation: "المعلومات غير كافية" };
      } },
      ageMul: { title: "مسائل الأعمار (أضعاف العمر)", from: 480, to: 640, gen(R, h) {
        const A = h.A, m = R.int(2, 5), son = R.int(3, 15), k = R.pick([5, 10, 4, 6, 8]), father = m * son, later = son + k;
        return { style: "m", sig: `${m}:${son}:${k}`, body: `إذا كان عمر رجل ${TIMES(m)} عمر ابنه، وبعد ${YRS(k)} يصبح عمر الابن ${A(later)} سنة، فما عمر الأب الآن؟`,
          ...h.numOptions(R, h.d(father), [h.d(father + k), h.d(m * later), h.d(later)]),
          steps: [`عمر الابن الآن = ${A(later)} − ${A(k)} = ${A(son)} سنة.`, `عمر الأب = ${A(m)} × ${A(son)} = ${A(father)} سنة.`, "تنبيه: «بعد» تعني الجمع و«منذ/قبل» تعني الطرح، والمطلوب العمر «الآن»."], explanation: A(father) };
      } },
      ageSum: { title: "مجموع الأعمار من مجموع كل اثنين", from: 600, to: 720, gen(R, h) {
        const A = h.A, a = R.int(8, 30), b = R.int(8, 30), c = R.int(8, 30), ab = a + b, ac = a + c, bc = b + c, t = a + b + c;
        const [n1, n2, n3] = R.shuffle(["علي", "أحمد", "محمد", "خالد", "سعد"]).slice(0, 3);
        return { style: "s", sig: `${a},${b},${c}`, body: `عمر ${n1} و${n2} معًا ${A(ab)} سنة، وعمر ${n1} و${n3} معًا ${A(ac)} سنة، وعمر ${n2} و${n3} معًا ${A(bc)} سنة، فما مجموع أعمارهم جميعًا؟`,
          ...h.numOptions(R, h.d(t), [h.d(ab + ac + bc), h.d(t + 3), h.d(Math.round((ab + ac + bc) / 3))]),
          steps: [`نجمع المعطيات الثلاثة: ${A(ab)} + ${A(ac)} + ${A(bc)} = ${A(ab + ac + bc)}.`, "كل شخص تكرر مرتين، فالناتج = ضعف المجموع.", `مجموع أعمارهم = ${A(ab + ac + bc)} ÷ ٢ = ${A(t)} سنة.`], explanation: A(t) };
      } },
      ageShift: { title: "العمر بعد سنوات = أضعاف العمر قبل سنوات", from: 720, to: 860, gen(R, h) {
        const A = h.A, m = R.int(2, 4), b = R.int(2, 8), x = R.int(b + 2, 30), a = m * (x - b) - x; if (a <= 0 || a > 20) return null;
        return { style: "s", sig: `${m}:${a}:${b}`, body: `إذا كان عمر أحمد بعد ${YRS(a)} يساوي ${TIMES(m)} عمره منذ ${YRS(b)}، فكم عمره الآن؟`,
          ...h.numOptions(R, h.d(x), [h.d(x + a), h.d(x - b), h.d(x + 2)]),
          steps: [`نفرض عمره الآن س: بعد ${A(a)} سنوات = س + ${A(a)} ، ومنذ ${A(b)} سنوات = س − ${A(b)}.`, `س + ${A(a)} = ${A(m)} (س − ${A(b)}) ← س + ${A(a)} = ${A(m)}س − ${A(m * b)}.`, `${A(a + m * b)} = ${A(m - 1)}س ← س = ${A(x)}. (ويمكن تجريب الخيارات: ${A(x + a)} = ${A(m)} × ${A(x - b)} ✓)`], explanation: A(x) };
      } },
      clock: { title: "الساعة بعد عدد من الساعات", from: 860, to: 940, gen(R, h) {
        const A = h.A, H = R.int(1, 12), pm = R.next() < .5, add = R.int(25, 99), start = (pm ? 12 : 0) + (H % 12), end = (start + add) % 24;
        const fmt = t => `${A(t % 12 === 0 ? 12 : t % 12)} ${t < 12 ? "صباحًا" : "مساءً"}`;
        const ans = fmt(end), rem = add % 24;
        return { style: "c", sig: `${start}:${add}`, body: `إذا كانت الساعة الآن ${fmt(start)}، فكم تكون الساعة بعد ${A(add)} ساعة؟`,
          ...h.strOptions(R, ans, [fmt((end + 12) % 24), fmt((end + 1) % 24), fmt((start + rem + 23) % 24)]),
          steps: ["كل ٢٤ ساعة تعود الساعة إلى الوقت نفسه، فنطرح مضاعفات ٢٤.", `${A(add)} = ${A(add - rem)} + ${A(rem)} ، أي ${A((add - rem) / 24)} يوم و${A(rem)} ساعة.`, `${fmt(start)} + ${A(rem)} ساعة = ${ans}.`], explanation: ans };
      } },
      count: { title: "قواعد العد: المستقيمات والزوايا والمثلثات", from: 940, to: 1260, gen(R, h) {
        const A = h.A, n = R.int(4, 10), style = R.pick(["lines", "rays", "tri", "acute"]);
        const v = style === "acute" ? C2(n) - 1 : C2(n), f = `${A(n)} × (${A(n)} − ١) ÷ ٢`;
        const body = { lines: `كم عدد المستقيمات التي يمكن رسمها بين ${A(n)} نقاط، ليست أي ثلاث منها على استقامة واحدة؟`, rays: `${A(n)} أشعة تخرج من نقطة واحدة، فكم عدد الزوايا المحصورة بينها؟`, tri: `مثلث رُسم من رأسه ${A(n - 2)} قطع مستقيمة إلى قاعدته (أي أصبح عدد الأضلاع الخارجة من الرأس ${A(n)})، فكم عدد المثلثات في الشكل؟`, acute: `زاوية قائمة قُسمت بأشعة من رأسها، فأصبح عدد الأشعة ${A(n)}، فكم عدد الزوايا الحادة في الشكل؟` }[style];
        return { style, sig: `${style}:${n}`, body, ...h.numOptions(R, h.d(v), [h.d(n * (n - 1)), h.d(v + (style === "acute" ? 1 : -1)), h.d(n)]),
          steps: [`القاعدة: العدد = ن × (ن − ١) ÷ ٢ حيث ن = ${style === "lines" ? "عدد النقاط" : style === "tri" ? "عدد الأضلاع الخارجة من الرأس" : "عدد الأشعة"}.`, `= ${f} = ${A(C2(n))}.`, style === "acute" ? `نطرح الزاوية القائمة الكبيرة لأنها ليست حادة: ${A(C2(n))} − ١ = ${A(v)}.` : `العدد = ${A(v)}.`], explanation: A(v) };
      } },
      zakat: { title: "حساب الزكاة (٢,٥٪)", from: 1180, to: 1300, gen(R, h) {
        const A = h.A, z = R.int(50, 2500), m = z * 40, rev = R.next() < .4;
        if (rev) return { style: "r", sig: `r:${z}`, body: `أخرج تاجر زكاة ماله فكانت ${A(z)} ريال، فكم مقدار المال؟`, ...h.numOptions(R, h.d(m), [h.d(z * 25), h.d(z * 4), h.d(z * 400)]),
          steps: ["نسبة الزكاة ٢,٥٪ = ١ ÷ ٤٠، فالمال = الزكاة × ٤٠.", `${A(z)} × ٤٠ = ${A(m)} ريال.`], explanation: A(m) };
        return { style: "d", sig: `d:${z}`, body: `أوجد مقدار زكاة مال قدره ${A(m)} ريال.`, ...h.numOptions(R, h.d(z), [h.d(z * 10), h.d(m / 25), h.d(z * 2)]),
          steps: ["الزكاة = ٢,٥٪ من المال = المبلغ ÷ ٤٠.", `${A(m)} ÷ ٤٠ = ${A(z)} ريال.`], explanation: A(z) };
      } },
      circle: { title: "الزوايا في الدائرة", from: 960, to: 1300, gen(R, h) {
        const A = h.A, style = R.pick(["inscribed", "central", "semi"]);
        if (style === "semi") { const a = R.int(20, 70);
          return { style, sig: `s:${a}`, body: `مثلث مرسوم داخل دائرة، أحد أضلاعه قطر الدائرة، وإحدى زاويتيه الأخريين ${A(a)}°، فما قياس الزاوية الثالثة؟`, ...h.numOptions(R, h.d(90 - a), [h.d(180 - a), h.d(a), h.d(90)]),
            steps: ["الزاوية المرسومة في نصف دائرة (المقابلة للقطر) قائمة = ٩٠°.", `الزاوية الثالثة = ١٨٠ − ٩٠ − ${A(a)} = ${A(90 - a)}°.`], explanation: A(90 - a) }; }
        const c = R.int(10, 80) * 2;
        if (style === "central") return { style, sig: `c:${c}`, body: `زاوية محيطية قياسها ${A(c / 2)}° تشترك مع زاوية مركزية في القوس نفسه، فما قياس الزاوية المركزية؟`, ...h.numOptions(R, h.d(c), [h.d(c / 2), h.d(180 - c / 2), h.d(c / 4 | 0 || c + 10)]),
          steps: ["الزاوية المركزية = ضعف الزاوية المحيطية المشتركة معها في القوس.", `= ٢ × ${A(c / 2)} = ${A(c)}°.`], explanation: A(c) };
        return { style, sig: `i:${c}`, body: `زاوية مركزية قياسها ${A(c)}° ، فما قياس الزاوية المحيطية المرسومة على القوس نفسه؟`, ...h.numOptions(R, h.d(c / 2), [h.d(c), h.d(2 * c), h.d(180 - c)]),
          steps: ["الزاوية المحيطية = نصف الزاوية المركزية المشتركة معها في القوس.", `= ${A(c)} ÷ ٢ = ${A(c / 2)}°.`], explanation: A(c / 2) };
      } },
      similar: { title: "المثلثات المتشابهة", from: 1300, to: 1620, gen(R, h) {
        const A = h.A, k = R.pick([2, 3, 4, h.d("1.5"), h.d("2.5")]), K = typeof k === "number" ? h.d(k) : k, a = R.int(2, 9), b = R.int(2, 9);
        const style = R.pick(["side", "area"]);
        if (style === "area") { const kk = typeof k === "number" ? k : null; if (!kk) return null; const ar = R.int(2, 12), big = ar * kk * kk;
          return { style, sig: `a:${kk}:${ar}`, body: `مثلثان متشابهان، نسبة طول ضلع في الأول إلى نظيره في الثاني ١ : ${A(kk)}، فإذا كانت مساحة الأول ${A(ar)} سم²، فما مساحة الثاني؟`, ...h.numOptions(R, h.d(big), [h.d(ar * kk), h.d(ar * kk * kk * kk), h.d(ar + kk)]),
            steps: ["نسبة المساحتين = مربع نسبة التشابه.", `(١ : ${A(kk)})² = ١ : ${A(kk * kk)} ، فالمساحة = ${A(ar)} × ${A(kk * kk)} = ${A(big)} سم².`], explanation: A(big) }; }
        const x = h.mul(h.d(b), K);
        return { style, sig: `s:${h.str(K)}:${a}:${b}`, body: `مثلثان متشابهان، ضلعان متناظران فيهما ${A(a)} سم و ${h.fx(h.mul(h.d(a), K))} سم، فإذا كان طول ضلع آخر في المثلث الأول ${A(b)} سم، فما طول نظيره في الثاني؟`,
          ...h.numOptions(R, x, [h.add(h.d(b), h.sub(h.mul(h.d(a), K), h.d(a))), h.mul(h.d(b), h.mul(K, K)), h.d(a + b)]),
          steps: ["في المثلثات المتشابهة تكون الأضلاع المتناظرة متناسبة.", `نسبة التشابه = ${h.fx(h.mul(h.d(a), K))} ÷ ${A(a)} = ${h.fx(K)}.`, `الضلع المطلوب = ${A(b)} × ${h.fx(K)} = ${h.fx(x)} سم.`], explanation: h.fx(x) };
      } },
      pyth: { title: "نظرية فيثاغورس والمثلثات المشهورة", from: 1620, to: 1960, gen(R, h) {
        const A = h.A, style = R.pick(["miss", "iso", "consec"]);
        if (style === "iso") { const c = R.int(2, 10) * 2, ar = c * c / 4;
          return { style, sig: `i:${c}`, body: `مثلث قائم الزاوية متطابق الضلعين، طول وتره ${A(c)} سم، فما مساحته؟`, ...h.numOptions(R, h.d(ar), [h.d(ar * 2), h.d(c * c), h.d(c)]),
            steps: ["نكمل المثلث ليصبح مربعًا قطره الوتر.", `مساحة المربع = ½ × القطر² = ½ × ${A(c * c)} = ${A(c * c / 2)}.`, `المثلث نصف المربع: ${A(c * c / 2)} ÷ ٢ = ${A(ar)} سم².`], explanation: A(ar) }; }
        if (style === "consec") { const k = R.int(1, 4), [a, b, c] = [3 * k, 4 * k, 5 * k];
          return { style, sig: `c:${k}`, body: `مثلث قائم الزاوية أطوال أضلاعه س ، س + ${A(k)} ، س + ${A(2 * k)}، فما مساحته؟`, ...h.numOptions(R, h.d(a * b / 2), [h.d(a * b), h.d(a + b + c), h.d(b * c / 2)]),
            steps: [`الأضلاع تزيد بمقدار ثابت ${A(k)}، فهي من نوع (٣، ٤، ٥) × ${A(k)}: ${A(a)} ، ${A(b)} ، ${A(c)}.`, `المساحة = ½ × ${A(a)} × ${A(b)} = ${A(a * b / 2)}.`], explanation: A(a * b / 2) }; }
        const t0 = R.pick(TRIP), k = R.pick([1, 1, 2, 3]), [a, b, c] = t0.map(x => x * k), hide = R.int(0, 2), v = [a, b, c][hide];
        const label = ["ضلعي القائمة", "", "الوتر"];
        const body = hide === 2 ? `مثلث قائم الزاوية، طولا ضلعي القائمة ${A(a)} سم و ${A(b)} سم، فما طول الوتر؟` : `مثلث قائم الزاوية، طول وتره ${A(c)} سم، وطول أحد ضلعي القائمة ${A(hide === 0 ? b : a)} سم، فما طول الضلع الآخر؟`;
        return { style: "m" + hide, sig: `m:${a},${b},${hide}`, body, ...h.numOptions(R, h.d(v), [h.d(v + k), h.d(hide === 2 ? a + b : c - (hide === 0 ? b : a)), h.d(v + 2 * k)]),
          steps: ["فيثاغورس: (الوتر)² = مجموع مربعي ضلعي القائمة.", `الأطوال من المثلثات المشهورة (${t0.map(A).join("، ")}) × ${A(k)}: ${A(a)} ، ${A(b)} ، ${A(c)}.`, hide === 2 ? `${A(a)}² + ${A(b)}² = ${A(a * a + b * b)} ← الوتر = ${A(c)}.` : `${A(c)}² − ${A(hide === 0 ? b : a)}² = ${A(v * v)} ← الضلع = ${A(v)}.`], explanation: A(v) };
      } },
      squares: { title: "شكل مكوّن من مربعات (المساحة والمحيط)", from: 1960, to: 2213, gen(R, h) {
        const A = h.A, shapes = [[6, 14, "صليبًا (مثل شبكة المكعب)"], [5, 12, "على شكل حرف T"], [4, 10, "في صف واحد"], [3, 8, "في صف واحد"], [5, 12, "على شكل صليب"]];
        const [n, edges, desc] = R.pick(shapes), s = R.int(2, 9), area = n * s * s, per = edges * s;
        return { style: "s" + n, sig: `${n}:${edges}:${s}`, body: `شكل مكوّن من ${A(n)} مربعات متطابقة متجاورة ${desc}، فيه ${A(edges)} ضلعًا خارجيًا، ومساحته الكلية ${A(area)} سم²، فما محيطه؟`,
          ...h.numOptions(R, h.d(per), [h.d(4 * s * n), h.d(area / s), h.d(per + 2 * s)]),
          steps: [`مساحة المربع الواحد = ${A(area)} ÷ ${A(n)} = ${A(s * s)} سم²، فطول الضلع = ${A(s)} سم.`, `المحيط = عدد الأضلاع الخارجية × طول الضلع = ${A(edges)} × ${A(s)} = ${A(per)} سم.`], explanation: A(per) };
      } }
    }
  };
})();
