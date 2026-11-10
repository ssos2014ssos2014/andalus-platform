// المحاضرة 38: معلومات هامة في الزوايا (المستقيم، حول نقطة، المتقابلة بالرأس، المثلث، المتطابق الضلعين)
(() => {
  const D = (h, x) => `${h.A(x)}°`;
  const T = (h, c) => c === 1 ? "س" : `${h.A(c)}س`;
  const rel = (x, y) => x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان";
  const FACTS = "قياس الزاوية المستقيمة ١٨٠° ، ومجموع زوايا المثلث ١٨٠° ، ومجموع الزوايا حول نقطة ٣٦٠°.";
  window.EXAMS[38] = {
    title: "اختبار محاكي: الزوايا والمثلثات", minutes: 25,
    blueprint: [["line", 4], ["around", 3], ["vertical", 3], ["triangle", 4], ["isos", 3], ["exterior", 2], ["cmp", 2], ["ratio", 3]],
    skills: {
      line: { title: "الزوايا على خط مستقيم (مجموعها ١٨٠°)", from: 0, to: 480, gen(R, h) {
        const cs = R.pick([[2, 1, 2], [1, 3], [1, 2], [1, 1, 3], [2, 3], [1, 4], [2, 2, 1]]), k = R.int(0, 7) * 10, sum = cs.reduce((a, b) => a + b), x = (180 - k) / sum; if (!Number.isInteger(x) || x <= 0) return null;
        const terms = cs.map(c => T(h, c)).concat(k ? [D(h, k)] : []);
        return { style: cs.join(""), sig: `${cs.join("")}:${k}`, body: `مجموعة زوايا متجاورة تقع على خط مستقيم واحد قياساتها: ${terms.join(" ، ")}. أوجد قيمة س`,
          ...h.strOptions(R, D(h, x), [D(h, x + 10), D(h, (360 - k) / sum | 0 || x + 20), D(h, Math.max(5, x - 10))]),
          steps: ["الزوايا على خط مستقيم مجموعها ١٨٠°.", `${terms.join(" + ")} = ١٨٠ ، أي ${h.A(sum)}س${k ? ` + ${h.A(k)}` : ""} = ١٨٠.`, `${h.A(sum)}س = ${h.A(180 - k)} ، إذن س = ${D(h, x)}.`], explanation: D(h, x) };
      } },
      around: { title: "الزوايا حول نقطة (مجموعها ٣٦٠°)", from: 480, to: 960, gen(R, h) {
        const A = h.A, right = R.next() < .5, a = R.int(4, 16) * 10, b = right ? 90 : R.int(4, 12) * 10, x = 360 - a - b - (right ? 0 : R.int(0, 1) * 0); if (x <= 0 || x >= 360) return null;
        return { style: "r" + right, sig: `${a}:${b}`, body: `ثلاث زوايا حول نقطة، قياس الأولى ${D(h, a)}${right ? " والثانية زاوية قائمة" : ` والثانية ${D(h, b)}`}، والثالثة س. أوجد قيمة س`,
          ...h.strOptions(R, D(h, x), [D(h, 180 - a > 0 ? 180 - a : x + 10), D(h, x + 10), D(h, x - 20 > 0 ? x - 20 : x + 30)]),
          steps: ["مجموع الزوايا حول نقطة = ٣٦٠°.", `${right ? "القائمة = ٩٠°. " : ""}س = ٣٦٠ − ${A(a)} − ${A(b)} = ${D(h, x)}.`], explanation: D(h, x) };
      } },
      vertical: { title: "الزاويتان المتقابلتان بالرأس متساويتان", from: 960, to: 1140, gen(R, h) {
        const A = h.A, mode = R.pick(["coef", "sum", "adj"]), a = R.int(3, 15) * 10;
        if (mode === "coef") { const c = R.pick([2, 3, 4, 5]), y = a / c; if (!Number.isInteger(y)) return null;
          return { style: "c", sig: `c${a}:${c}`, body: `مستقيمان متقاطعان، تقابلت بالرأس زاويتان قياس إحداهما ${D(h, a)} والأخرى ${A(c)}ص. أوجد قيمة ص`, ...h.numOptions(R, h.d(y), [h.d((180 - a) / c | 0 || y + 5), h.d(a), h.d(y + 10)]),
            steps: ["الزاويتان المتقابلتان بالرأس متساويتان.", `${A(c)}ص = ${A(a)} ، إذن ص = ${A(y)}.`], explanation: A(y) }; }
        if (mode === "adj") { const v = 180 - a;
          return { style: "a", sig: `a${a}`, body: `مستقيمان متقاطعان يكوّنان أربع زوايا، إحداها ${D(h, a)}. ما قياس الزاوية المجاورة لها؟`, ...h.strOptions(R, D(h, v), [D(h, a), D(h, 360 - a), D(h, 90)].map(x => x === D(h, v) ? D(h, v + 10) : x)),
            steps: ["الزاويتان المتجاورتان على خط مستقيم مجموعهما ١٨٠°.", `١٨٠ − ${A(a)} = ${D(h, v)}.`], explanation: D(h, v) }; }
        const b = 180 - a, v = 2 * a;
        return { style: "s", sig: `s${a}`, body: `مستقيمان متقاطعان، إحدى الزوايا الأربع ${D(h, a)}. إذا كانت س و ص الزاويتين المجاورتين للزاوية المقابلة لها بالرأس... أوجد مجموع الزاويتين المتقابلتين بالرأس اللتين قياس إحداهما ${D(h, a)}`.replace(/إذا كانت س و ص الزاويتين المجاورتين للزاوية المقابلة لها بالرأس\.\.\. /, ""),
          ...h.strOptions(R, D(h, v), [D(h, 2 * b), D(h, 180), D(h, a + b + 10)]), steps: ["الزاويتان المتقابلتان بالرأس متساويتان.", `المجموع = ${A(a)} + ${A(a)} = ${D(h, v)}.`], explanation: D(h, v) };
      } },
      triangle: { title: "مجموع زوايا المثلث ١٨٠°", from: 1140, to: 1500, gen(R, h) {
        const A = h.A, mode = R.pick(["two", "expr", "sum4"]);
        if (mode === "two") { const a = R.int(3, 10) * 10, b = R.int(2, 9) * 10, v = 180 - a - b; if (v <= 0) return null;
          return { style: "t", sig: `t${a}:${b}`, body: `مثلث قياس زاويتين فيه ${D(h, a)} و ${D(h, b)} ، فما قياس الزاوية الثالثة؟`, ...h.strOptions(R, D(h, v), [D(h, 360 - a - b), D(h, v + 10), D(h, Math.abs(a - b) || v + 20)].map(x => x === D(h, v) ? D(h, v + 30) : x)),
            steps: [FACTS, `الزاوية الثالثة = ١٨٠ − (${A(a)} + ${A(b)}) = ${D(h, v)}.`], explanation: D(h, v) }; }
        if (mode === "sum4") { const top = R.int(3, 9) * 10, v = 2 * (180 - top) + 0, half = 180 - top;
          return { style: "s4", sig: `s4${top}`, body: `مثلث قياس زاوية رأسه ${D(h, top)} ، رُسم داخله مستقيم يوازي قاعدته فكوّن مثلثًا صغيرًا زاويتا قاعدته س و ص، وبقيت زاويتا قاعدة المثلث الكبير ع و ل. أوجد س + ص + ع + ل`,
            ...h.strOptions(R, D(h, v), [D(h, half), D(h, 360), D(h, v + 20)]), steps: [`في المثلث الصغير: س + ص = ١٨٠ − ${A(top)} = ${A(half)}.`, `وفي المثلث الكبير: ع + ل = ١٨٠ − ${A(top)} = ${A(half)}.`, `المجموع = ${A(half)} + ${A(half)} = ${D(h, v)}.`], explanation: D(h, v) }; }
        const cs = R.pick([[1, 2, 3], [2, 3, 4], [1, 1, 2], [3, 4, 5], [1, 4, 7]]), s = cs.reduce((a, b) => a + b), k = R.pick([0, 0, 20, 30, 40]), x = (180 - k) / (s - (k ? cs[2] : 0)); if (!Number.isInteger(x)) return null;
        const terms = k ? [T(h, cs[0]), T(h, cs[1]), D(h, k)] : cs.map(c => T(h, c)), sc = k ? cs[0] + cs[1] : s;
        return { style: "e", sig: `e${cs.join("")}:${k}`, body: `مثلث قياسات زواياه ${terms.join(" ، ")}. أوجد قيمة س`, ...h.strOptions(R, D(h, (180 - k) / sc), [D(h, (360 - k) / sc | 0), D(h, (180 - k) / sc + 10), D(h, (180 - k) / sc * 2)]),
          steps: ["مجموع زوايا المثلث ١٨٠°.", `${terms.join(" + ")} = ١٨٠ ، أي ${h.A(sc)}س = ${h.A(180 - k)}.`, `س = ${D(h, (180 - k) / sc)}.`], explanation: D(h, (180 - k) / sc) };
      } },
      isos: { title: "المثلث المتطابق الضلعين: زاويتا القاعدة متساويتان", from: 0, to: 480, gen(R, h) {
        const A = h.A, top = R.int(2, 16) * 10, base = (180 - top) / 2, ask = R.pick(["base", "top"]);
        if (ask === "base") return { style: "b", sig: `b${top}`, body: `مثلث متطابق الضلعين، قياس زاوية رأسه ${D(h, top)} ، فما قياس إحدى زاويتي القاعدة؟`, ...h.strOptions(R, D(h, base), [D(h, 180 - top), D(h, top / 2), D(h, base + 10)].map(x => x === D(h, base) ? D(h, base + 20) : x)),
          steps: ["زاويتا القاعدة متساويتان، ومجموعهما مع زاوية الرأس ١٨٠°.", `زاويتا القاعدة معًا = ١٨٠ − ${A(top)} = ${A(180 - top)}.`, `كل زاوية = ${A(180 - top)} ÷ ٢ = ${D(h, base)}.`], explanation: D(h, base) };
        return { style: "t", sig: `t${top}`, body: `مثلث متطابق الضلعين، قياس إحدى زاويتي قاعدته ${D(h, base)} ، فما قياس زاوية رأسه؟`, ...h.strOptions(R, D(h, top), [D(h, 180 - base), D(h, base), D(h, top + 10)].map(x => x === D(h, top) ? D(h, top + 20) : x)),
          steps: ["زاويتا القاعدة متساويتان.", `زاوية الرأس = ١٨٠ − ٢ × ${A(base)} = ${D(h, top)}.`], explanation: D(h, top) };
      } },
      exterior: { title: "الزاوية الخارجة للمثلث", from: 1140, to: 1753, gen(R, h) {
        const A = h.A, a = R.int(3, 8) * 10, b = R.int(2, 7) * 10, v = a + b; if (v >= 180) return null;
        return { style: "x", sig: `${a}:${b}`, body: `مثلث قياس زاويتين داخليتين فيه ${D(h, a)} و ${D(h, b)}. مُدّ ضلعه الثالث فتكوّنت زاوية خارجة عند الرأس الثالث. فما قياسها؟`, ...h.strOptions(R, D(h, v), [D(h, 180 - v), D(h, 360 - v), D(h, v + 10)]),
          steps: [`الزاوية الداخلة الثالثة = ١٨٠ − ${A(v)} = ${A(180 - v)}.`, `الخارجة = ١٨٠ − ${A(180 - v)} = ${D(h, v)}.`, "قاعدة مختصرة: الزاوية الخارجة = مجموع الزاويتين الداخلتين البعيدتين."], explanation: D(h, v) };
      } },
      cmp: { title: "المقارنة بين زاويتين محسوبتين", from: 1250, to: 1753, gen(R, h) {
        const A = h.A, a = R.int(5, 8) * 10, x = 180 - 2 * a, b = R.int(4, 9) * 10, c = R.int(3, 8) * 10, y = 180 - b - c; if (x <= 0 || y <= 0) return null;
        return { style: "c", sig: `${a}:${b}:${c}`, body: `قارن بين:\nالقيمة الأولى: الزاوية س المحصورة بين زاويتين قياس كل منهما ${D(h, a)} على خط مستقيم\nالقيمة الثانية: الزاوية ص في مثلث زاويتاه الأخريان ${D(h, b)} و ${D(h, c)}`, ...h.cmpAnswer(h.d(x), h.d(y)),
          steps: [`س = ١٨٠ − ${A(a)} − ${A(a)} = ${D(h, x)}.`, `ص = ١٨٠ − ${A(b)} − ${A(c)} = ${D(h, y)}.`, `إذن ${rel(x, y)}.`], explanation: rel(x, y) };
      } },
      ratio: { title: "زاويتان حول نقطة إحداهما مضاعف الأخرى", from: 720, to: 960, gen(R, h) {
        const A = h.A, k = R.int(2, 8), tot = R.pick([360, 180]), x = tot / (k + 1); if (!Number.isInteger(x)) return null;
        return { style: "r" + tot, sig: `${k}:${tot}`, body: tot === 360 ? `زاويتان س و ص حول نقطة تكمّلان دورة كاملة، فإذا كانت ص = ${A(k)}س ، أوجد س` : `زاويتان متجاورتان س و ص على خط مستقيم، فإذا كانت ص = ${A(k)}س ، أوجد س`,
          ...h.strOptions(R, D(h, x), [D(h, (tot === 360 ? 180 : 360) / (k + 1) | 0), D(h, x * k), D(h, x + 10)]),
          steps: [`س + ${A(k)}س = ${A(tot)} ، أي ${A(k + 1)}س = ${A(tot)}.`, `س = ${D(h, x)}.`], explanation: D(h, x) };
      } }
    }
  };
})();
