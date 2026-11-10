// المحاضرة 30: المربع الكامل والفرق بين مربعين
(() => {
  const SQ = "(س + ص)² = س² + ٢س ص + ص² ، و (س − ص)² = س² − ٢س ص + ص².";
  const S = (h, x) => x < 0 ? `−${h.A(-x)}` : h.A(x);
  window.EXAMS[30] = {
    title: "اختبار محاكي: المربع الكامل والفرق بين مربعين", minutes: 25,
    blueprint: [["sumSq", 4], ["findXY", 3], ["recip", 4], ["cmp", 3], ["diffSq", 4], ["fourth", 3], ["zero", 1], ["square", 2]],
    skills: {
      sumSq: { title: "إيجاد س² + ص² بالمربع الكامل", from: 0, to: 230, gen(R, h) {
        const A = h.A, minus = R.next() < .4, s = R.int(2, 12), p = R.int(-6, 15); if (!p) return null; const v = minus ? s * s + 2 * p : s * s - 2 * p; if (v <= 0) return null;
        return { style: "s" + minus, sig: `${s}:${p}:${minus}`, body: `إذا كان س ${minus ? "−" : "+"} ص = ${A(s)} ، س ص = ${S(h, p)} ، فأوجد س² + ص²`,
          ...h.numOptions(R, h.d(v), [h.d(s * s), h.d(minus ? s * s - 2 * p > 0 ? s * s - 2 * p : v + 4 : s * s + 2 * p), h.d(Math.abs(s * s - p))]),
          steps: [SQ, `نربّع الطرفين: (س ${minus ? "−" : "+"} ص)² = ${A(s * s)} ، أي س² + ص² ${minus ? "−" : "+"} ٢(${S(h, p)}) = ${A(s * s)}.`, `س² + ص² = ${A(s * s)} ${minus ? "+" : "−"} ${A(Math.abs(2 * p))}${p < 0 ? " (مع الانتباه للإشارة)" : ""} = ${A(v)}.`], explanation: A(v) };
      } },
      findXY: { title: "إيجاد س ص من المربع الكامل", from: 230, to: 340, gen(R, h) {
        const A = h.A, x = R.int(-6, 9), y = R.int(-6, 9); if (!x || !y || x === y) return null; const minus = R.next() < .5, d = minus ? x - y : x + y, q = x * x + y * y, v = x * y;
        return { style: "f" + minus, sig: `${x}:${y}:${minus}`, body: `إذا كان س² + ص² = ${A(q)} ، س ${minus ? "−" : "+"} ص = ${S(h, d)} ، فأوجد س ص`,
          ...h.strOptions(R, S(h, v), [S(h, -v), S(h, (q - d * d) || v + 1), S(h, v + 1)].map(w => w === S(h, v) ? S(h, v + 2) : w)),
          steps: [SQ, `(س ${minus ? "−" : "+"} ص)² = ${A(d * d)} = ${A(q)} ${minus ? "−" : "+"} ٢س ص.`, `٢س ص = ${minus ? `${A(q)} − ${A(d * d)}` : `${A(d * d)} − ${A(q)}`} = ${S(h, 2 * v)} ، إذن س ص = ${S(h, v)}.`], explanation: S(h, v) };
      } },
      recip: { title: "س + ك÷س والمربع الكامل", from: 340, to: 550, gen(R, h) {
        const A = h.A, k = R.pick([1, 1, 2, 3]), m = R.int(1, 8), minus = R.next() < .45, v = m * m + (minus ? 2 * k : -2 * k); if (v <= 0) return null;
        const t = k === 1 ? h.frac("١", "س") : h.frac(A(k), "س"), t2 = k === 1 ? h.frac("١", "س²") : h.frac(A(k * k), "س²");
        return { style: "r" + k + minus, sig: `${k}:${m}:${minus}`, body: `إذا كان س ${minus ? "−" : "+"} ${t} = ${A(m)} ، أوجد س² + ${t2}`,
          ...h.numOptions(R, h.d(v), [h.d(m * m), h.d(m * m + (minus ? -2 * k : 2 * k) > 0 ? m * m + (minus ? -2 * k : 2 * k) : v + 2), h.d(2 * m)]),
          steps: [`نربّع الطرفين: (س ${minus ? "−" : "+"} ${t})² = ${A(m * m)}.`, `س² ${minus ? "−" : "+"} ٢ × س × ${t} + ${t2} = ${A(m * m)} ، والحد الأوسط = ${minus ? "−" : ""}${A(2 * k)} لأن س تختصر.`, `س² + ${t2} = ${A(m * m)} ${minus ? "+" : "−"} ${A(2 * k)} = ${A(v)}.`], explanation: A(v) };
      } },
      cmp: { title: "المقارنة بين صور المربع الكامل", from: 550, to: 780, gen(R, h) {
        const mode = R.pick(["eq", "eq2", "ins", "pos", "neg", "sub", "bneg", "subIns"]), o = h.cmpAnswer(h.d(0), h.d(0)).options;
        const data = {
          eq: ["", "س² + ٢س ص + ص²", "(س + ص)²", 2, ["المقدار الأول هو مفكوك (س + ص)² تمامًا.", "إذن القيمتان متساويتان."]],
          eq2: ["", "س² + ٢س ص + ص²", "٢(س + ص)² ÷ ٢", 2, ["القيمة الثانية = (س + ص)² بعد اختصار ٢.", "والأولى مفكوكها، إذن متساويتان."]],
          ins: ["", "س² + ص²", "(س + ص)²", 3, ["(س + ص)² = س² + ص² + ٢س ص ، فالفرق هو ٢س ص.", "س ص قد تكون موجبة أو سالبة أو صفرًا، إذن المعلومات غير كافية."]],
          pos: ["إذا كانت س ، ص عددين موجبين", "س² + ص²", "(س + ص)²", 1, ["(س + ص)² = س² + ص² + ٢س ص.", "س ص موجبة، فالقيمة الثانية أكبر."]],
          neg: ["إذا كانت س موجبة و ص سالبة", "س² + ص²", "(س + ص)²", 0, ["(س + ص)² = س² + ص² + ٢س ص.", "س ص سالبة، فالقيمة الثانية أصغر: القيمة الأولى أكبر."]],
          sub: ["إذا كانت س ، ص عددين موجبين", "س² + ص²", "(س − ص)²", 0, ["(س − ص)² = س² + ص² − ٢س ص.", "س ص موجبة فنطرح مقدارًا موجبًا: القيمة الأولى أكبر."]],
          bneg: ["إذا كانت س ، ص عددين سالبين", "(س + ص)²", "س² + ص²", 0, ["(س + ص)² = س² + ص² + ٢س ص.", "حاصل ضرب سالبين موجب، فالقيمة الأولى أكبر."]],
          subIns: ["", "(س − ص)²", "س² − ص²", 3, ["(س − ص)² = س² − ٢س ص + ص² ، أما س² − ص² فمختلف تمامًا.", "جرّب س = ١ ، ص = ٠: الأولى ١ والثانية ١. وجرّب س = ٠ ، ص = ١: الأولى ١ والثانية −١. إذن المعلومات غير كافية."]]
        }[mode];
        return { style: mode, sig: mode, body: h.cmpBody(data[0], data[1], data[2]), options: o, correct: data[3], steps: data[4], explanation: o[data[3]] };
      } },
      diffSq: { title: "الفرق بين مربعين: س² − ص² = (س − ص)(س + ص)", from: 870, to: 1020, gen(R, h) {
        const A = h.A, x = R.int(2, 15), y = R.int(1, x - 1), a = x - y, b = x + y, D = a * b, ask = R.pick(["D", "a", "b"]);
        const given = { D: [`س − ص = ${A(a)} ، س + ص = ${A(b)}`, "س² − ص²", D], a: [`س² − ص² = ${A(D)} ، س + ص = ${A(b)}`, "س − ص", a], b: [`س² − ص² = ${A(D)} ، س − ص = ${A(a)}`, "س + ص", b] }[ask];
        return { style: ask, sig: `${x}:${y}:${ask}`, body: `إذا كان ${given[0]} ، فأوجد ${given[1]}`,
          ...h.numOptions(R, h.d(given[2]), [h.d(ask === "D" ? a + b : D), h.d(given[2] + 1), h.d(ask === "D" ? b * b - a * a : Math.abs(b - a) || given[2] + 3)]),
          steps: ["س² − ص² = (س − ص)(س + ص).", ask === "D" ? `= ${A(a)} × ${A(b)} = ${A(D)}.` : `${A(D)} = ${given[1] === "س − ص" ? `(س − ص) × ${A(b)}` : `${A(a)} × (س + ص)`}.`, ask === "D" ? "" : `${given[1]} = ${A(D)} ÷ ${A(ask === "a" ? b : a)} = ${A(given[2])}.`].filter(Boolean), explanation: A(given[2]) };
      } },
      fourth: { title: "التربيع مرتين: أ⁴ + ١÷أ⁴", from: 1020, to: 1200, gen(R, h) {
        const A = h.A, m = R.int(2, 9), minus = R.next() < .5, v = minus ? m * m + 2 : m * m - 2;
        return { style: "f" + minus, sig: `${m}:${minus}`, body: `إذا كان أ² ${minus ? "−" : "+"} ${h.frac("١", "أ²")} = ${A(m)} ، أوجد أ⁴ + ${h.frac("١", "أ⁴")}`,
          ...h.numOptions(R, h.d(v), [h.d(m * m), h.d(minus ? m * m - 2 : m * m + 2), h.d(2 * m)]),
          steps: [`نربّع الطرفين: (أ² ${minus ? "−" : "+"} ${h.frac("١", "أ²")})² = ${A(m * m)}.`, `أ⁴ ${minus ? "−" : "+"} ٢ + ${h.frac("١", "أ⁴")} = ${A(m * m)}.`, `أ⁴ + ${h.frac("١", "أ⁴")} = ${A(m * m)} ${minus ? "+" : "−"} ٢ = ${A(v)}.`], explanation: A(v) };
      } },
      zero: { title: "مجموع مربعين يساوي صفرًا", from: 780, to: 870, gen(R, h) {
        const A = h.A, ask = R.pick(["س² − ص²", "س + ص", "س ص", "س − ص"]), k = R.int(0, 5), body = k ? `${ask} + ${A(k)}` : ask;
        return { style: "z", sig: `${ask}:${k}`, body: `إذا كان س² + ص² = صفر ، فإن ${body} = ؟`, ...h.strOptions(R, k ? A(k) : "صفر", k ? ["صفر", A(k + 1), A(k * 2 === k ? 2 : k * 2)] : ["١", "−١", "٢"]),
          steps: ["المربع لا يكون سالبًا، فمجموع مربعين = صفر فقط إذا كان كل منهما صفرًا.", "إذن س = صفر و ص = صفر.", `${body} = ${k ? A(k) : "صفر"}.`], explanation: k ? A(k) : "صفر" };
      } },
      square: { title: "إيجاد (س − ص)² أو (س + ص)²", from: 0, to: 340, gen(R, h) {
        const A = h.A, x = R.int(-5, 9), y = R.int(-5, 9); if (x === y) return null; const q = x * x + y * y, p = x * y, plus = R.next() < .5, v = plus ? q + 2 * p : q - 2 * p;
        return { style: "q" + plus, sig: `${x}:${y}:${plus}`, body: `إذا كان س² + ص² = ${A(q)} ، س ص = ${S(h, p)} ، فأوجد (س ${plus ? "+" : "−"} ص)²`,
          ...h.numOptions(R, h.d(v), [h.d(plus ? (q - 2 * p >= 0 ? q - 2 * p : v + 3) : q + 2 * p), h.d(q), h.d(v + 1)]),
          steps: [SQ, `(س ${plus ? "+" : "−"} ص)² = ${A(q)} ${plus ? "+" : "−"} ٢(${S(h, p)}) = ${A(v)}.`], explanation: A(v) };
      } }
    }
  };
})();
