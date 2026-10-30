// المحاضرة 3: قابلية القسمة والأعداد الأولية
(() => {
  const digits = n => String(n).split("").map(Number);
  const dsum = n => digits(n).reduce((a, b) => a + b, 0);
  const alt11 = n => { const d = digits(n).reverse(); let o = 0, e = 0; d.forEach((x, i) => i % 2 ? e += x : o += x); return [o, e]; };
  const isPrime = n => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; };
  const gcd = (a, b) => b ? gcd(b, a % b) : a, lcm = (a, b) => a / gcd(a, b) * b;
  const RULE = { 2: "آحاده زوجي (٠، ٢، ٤، ٦، ٨)", 3: "مجموع أرقامه يقبل القسمة على ٣", 4: "العدد المكوّن من آحاده وعشراته يقبل القسمة على ٤", 5: "آحاده ٠ أو ٥",
    6: "يقبل القسمة على ٢ و٣ معًا", 9: "مجموع أرقامه يقبل القسمة على ٩", 10: "آحاده صفر", 11: "الفرق بين مجموع الأرقام في المنازل الفردية ومجموعها في المنازل الزوجية صفر أو يقبل القسمة على ١١",
    7: "نضاعف رقم الآحاد ونطرحه من باقي العدد، فإن كان الناتج يقبل القسمة على ٧ قبلها العدد" };
  function why(h, k, n) {
    const A = h.A, ok = n % k === 0;
    const tail = ok ? " ← يقبل ✓" : " ← لا يقبل ✗";
    if (k === 3 || k === 9) return `${A(n)}: مجموع أرقامه ${digits(n).map(A).join(" + ")} = ${A(dsum(n))}${tail}`;
    if (k === 4) return `${A(n)}: آخر رقمين ${A(n % 100)}${tail}`;
    if (k === 2 || k === 5 || k === 10) return `${A(n)}: آحاده ${A(n % 10)}${tail}`;
    if (k === 6) return `${A(n)}: ${n % 2 ? "فردي" : "زوجي"}، ومجموع أرقامه ${A(dsum(n))}${tail}`;
    if (k === 11) { const [o, e] = alt11(n); return `${A(n)}: الفردية ${A(o)} والزوجية ${A(e)}، الفرق ${A(Math.abs(o - e))}${tail}`; }
    if (k === 7) { const r = Math.floor(n / 10) - 2 * (n % 10); return `${A(n)}: ${A(Math.floor(n / 10))} − ${A(2 * (n % 10))} = ${A(r)}${tail}`; }
    return `${A(n)}${tail}`;
  }
  const pickN = (R, lo, hi, test, avoid) => { for (let t = 0; t < 400; t++) { const n = R.int(lo, hi); if (test(n) && !(avoid || []).includes(n)) return n; } return null; };

  window.EXAMS[3] = {
    title: "اختبار محاكي: قابلية القسمة والأعداد الأولية", minutes: 25,
    blueprint: [["divRule", 4], ["div7_11", 2], ["rem5", 2], ["rem9", 3], ["missDigit", 3], ["common", 3], ["lcm", 3], ["prime", 4]],
    skills: {
      divRule: { title: "قواعد قابلية القسمة على ٢ و٣ و٤ و٥ و٦ و٩", from: 0, to: 440, gen(R, h) {
        const k = R.pick([3, 4, 6, 9, 3, 4, 9, 5, 2]), not = R.next() < .3, lo = 1000, hi = 99999;
        const good = pickN(R, lo, hi, n => not ? n % k !== 0 : n % k === 0);
        const bad = []; for (let i = 0; i < 3; i++) { const b = pickN(R, lo, hi, n => (not ? n % k === 0 : n % k !== 0) && (k !== 6 || n % 2 === 0 || n % 3 === 0), bad.concat(good)); if (b) bad.push(b); }
        if (!good || bad.length < 3) return null;
        const o = h.strOptions(R, h.A(good), bad.map(h.A));
        return { style: (not ? "not" : "is") + k, sig: `${k}:${not}:${good}`, body: `أي الأعداد التالية ${not ? "لا " : ""}يقبل القسمة على ${h.A(k)} ؟`, ...o,
          steps: [`قاعدة القسمة على ${h.A(k)}: ${RULE[k]}.`, ...[good, ...bad].map(n => why(h, k, n))], explanation: `${h.A(good)}` };
      } },
      div7_11: { title: "القسمة على ٧ و١١", from: 0, to: 440, gen(R, h) {
        const k = R.pick([7, 11]), good = pickN(R, 100, k === 7 ? 999 : 99999, n => n % k === 0 && n % 10 !== 0);
        const bad = []; for (let i = 0; i < 3; i++) { const b = pickN(R, 100, k === 7 ? 999 : 99999, n => n % k !== 0 && n % 10 !== 0, bad.concat(good)); if (b) bad.push(b); }
        if (!good || bad.length < 3) return null;
        return { style: "k" + k, sig: `${k}:${good}`, body: `أي الأعداد التالية يقبل القسمة على ${h.A(k)} ؟`, ...h.strOptions(R, h.A(good), bad.map(h.A)),
          steps: [`قاعدة القسمة على ${h.A(k)}: ${RULE[k]}.`, ...[good, ...bad].map(n => why(h, k, n))], explanation: h.A(good) };
      } },
      rem5: { title: "باقي القسمة على ٥ (من رقم الآحاد)", from: 400, to: 640, gen(R, h) {
        const style = R.pick(["cmp", "direct"]);
        const a = R.int(1000, 999999), b = R.int(1000, 99999), ra = a % 5, rb = b % 5;
        if (style === "direct") return { style, sig: `d:${a}`, body: `ما باقي قسمة ${h.A(a)} على ٥ ؟`, ...h.numOptions(R, h.d(ra), [h.d((ra + 1) % 5), h.d((ra + 2) % 5), h.d(a % 10)].filter(v => v.i !== ra)),
          steps: ["باقي القسمة على ٥ يتحدد من رقم الآحاد فقط.", `رقم الآحاد ${h.A(a % 10)}، و${h.A(a % 10)} ÷ ٥ يبقى ${h.A(ra)}.`], explanation: h.A(ra) };
        return { style, sig: `c:${a}:${b}`, body: h.cmpBody("", `باقي قسمة ${h.A(a)} على ٥`, `باقي قسمة ${h.A(b)} على ٥`), ...h.cmpAnswer(h.d(ra), h.d(rb)),
          steps: ["باقي القسمة على ٥ يتحدد من رقم الآحاد فقط.", `آحاد ${h.A(a)} هو ${h.A(a % 10)} فالباقي ${h.A(ra)}.`, `آحاد ${h.A(b)} هو ${h.A(b % 10)} فالباقي ${h.A(rb)}.`,
            ra > rb ? "إذن القيمة الأولى أكبر." : ra < rb ? "إذن القيمة الثانية أكبر." : "إذن القيمتان متساويتان."], explanation: `${h.A(ra)} و ${h.A(rb)}` };
      } },
      rem9: { title: "باقي القسمة على ٩ (مجموع الأرقام)", from: 780, to: 900, gen(R, h) {
        const r = R.int(1, 8), style = R.pick(["which", "direct"]);
        if (style === "direct") { const n = R.int(1000, 99999); return { style, sig: `d:${n}`, body: `ما باقي قسمة ${h.A(n)} على ٩ ؟`, ...h.numOptions(R, h.d(n % 9), [h.d((n % 9 + 1) % 9), h.d((n % 9 + 3) % 9), h.d(dsum(n) % 10)].filter(v => v.i !== n % 9)),
          steps: ["باقي القسمة على ٩ = باقي قسمة مجموع الأرقام على ٩.", `مجموع أرقام ${h.A(n)} = ${h.A(dsum(n))}، و${h.A(dsum(n))} ÷ ٩ يبقى ${h.A(n % 9)}.`], explanation: h.A(n % 9) }; }
        const good = pickN(R, 100, 999, n => n % 9 === r);
        const bad = []; for (let i = 0; i < 3; i++) { const b = pickN(R, 100, 999, n => n % 9 !== r, bad.concat(good)); if (b) bad.push(b); }
        if (!good || bad.length < 3) return null;
        return { style, sig: `w:${r}:${good}`, body: `أي مما يلي يمكن أن نقسمه على ٩ ويكون الباقي ${h.A(r)} ؟`, ...h.strOptions(R, h.A(good), bad.map(h.A)),
          steps: [`طريقة المحاضرة: نطرح ${h.A(r)} من كل خيار، فالصحيح هو الذي يصبح بعد الطرح قابلًا للقسمة على ٩.`, ...[good, ...bad].map(n => `${h.A(n)} − ${h.A(r)} = ${h.A(n - r)}: مجموع أرقامه ${h.A(dsum(n - r))} ${(n - r) % 9 === 0 ? "← يقبل ✓" : "← لا يقبل ✗"}`)], explanation: h.A(good) };
      } },
      missDigit: { title: "إيجاد الرقم المجهول ليقبل العدد القسمة", from: 640, to: 760, gen(R, h) {
        const k = R.pick([4, 3, 9, 4]); const len = R.int(4, 6);
        const base = Array.from({ length: len }, (_, i) => R.int(i ? 0 : 1, 9)); const pos = k === 4 ? len - 1 : R.int(1, len - 1);
        const valid = [...Array(10).keys()].filter(dg => { const t = base.slice(); t[pos] = dg; return Number(t.join("")) % k === 0; });
        if (!valid.length) return null;
        const ans = R.pick(valid), wrong = R.shuffle([...Array(10).keys()].filter(dg => !valid.includes(dg))).slice(0, 3);
        if (wrong.length < 3) return null;
        const shown = base.map((x, i) => i === pos ? "س" : h.A(x)).join("");
        const t = base.slice(); t[pos] = ans;
        return { style: "k" + k, sig: `${base.join("")}:${pos}:${k}`, body: `إذا كان العدد ${shown} يقبل القسمة على ${h.A(k)} ، فإن قيمة س يمكن أن تكون:`, ...h.strOptions(R, h.A(ans), wrong.map(h.A)),
          steps: [`قاعدة القسمة على ${h.A(k)}: ${RULE[k]}.`, "نعوّض كل خيار مكان س ونطبق القاعدة:", ...[ans, ...wrong].map(dg => { const u = base.slice(); u[pos] = dg; return why(h, k, Number(u.join(""))); })], explanation: h.A(ans) };
      } },
      common: { title: "العدد الذي يقبل القسمة على عدة أعداد معًا", from: 700, to: 1040, gen(R, h) {
        const set = R.pick([[9, 8, 12], [3, 4, 5], [2, 9], [6, 8], [4, 9], [12, 9], [3, 5, 6], [4, 6]]), L = set.reduce(lcm);
        const good = L * R.int(1, Math.floor(999 / L)); if (good < 50) return null;
        const bad = []; for (let i = 0; i < 3; i++) { const b = pickN(R, Math.max(20, good - 200), good + 200, n => n % L !== 0 && set.filter(k => n % k === 0).length >= 1, bad.concat(good)); if (b) bad.push(b); }
        if (bad.length < 3) return null;
        return { style: set.join("-"), sig: `${set.join("-")}:${good}`, body: `ما العدد الذي يقبل القسمة على ${set.map(h.A).join(" و ")} في نفس الوقت (بدون باقٍ)؟`, ...h.strOptions(R, h.A(good), bad.map(h.A)),
          steps: ["نختبر كل خيار بقواعد القسمة على كل عدد، ويجب أن يقبل جميعها:", ...[good, ...bad].map(n => `${h.A(n)}: ${set.map(k => `${h.A(k)} ${n % k === 0 ? "✓" : "✗"}`).join(" ، ")}`),
            `اختصار: العدد يجب أن يقبل القسمة على المضاعف المشترك الأصغر ${h.A(L)}.`], explanation: h.A(good) };
      } },
      lcm: { title: "المضاعف المشترك الأصغر (متى يلتقون مرة أخرى؟)", from: 840, to: 960, extra: [[1120, 1200]], gen(R, h) {
        const n = R.pick([2, 3]), ks = R.shuffle([2, 3, 4, 5, 6, 8, 9, 10, 12]).slice(0, n).sort((a, b) => a - b), L = ks.reduce(lcm);
        const prod = ks.reduce((a, b) => a * b, 1), sum = ks.reduce((a, b) => a + b, 0);
        const who = R.pick([["أصدقاء", "يقابل", "أيام", "يومًا"], ["حافلات", "تمر", "دقائق", "دقيقة"]]);
        const wr = [prod, sum, L * 2, ks[ks.length - 1] * 2].filter(v => v !== L);
        return { style: who[0], sig: ks.join(","), body: `${who[0] === "أصدقاء" ? `لدى شخص ${h.A(n)} أصدقاء، ${ks.map((k, i) => `${i ? "و" : ""}يقابل ${["الأول", "الثاني", "الثالث"][i]} كل ${h.A(k)} أيام`).join(" ")}. إذا التقوا جميعًا اليوم، فبعد كم يومًا يلتقون مرة أخرى؟` : `${h.A(n)} حافلات تنطلق من محطة واحدة، ${ks.map((k, i) => `${i ? "و" : ""}${["الأولى", "الثانية", "الثالثة"][i]} كل ${h.A(k)} دقائق`).join(" ")}. إذا انطلقت معًا الآن، فبعد كم دقيقة تنطلق معًا مرة أخرى؟`}`,
          ...h.strOptions(R, h.A(L), wr.map(h.A)),
          steps: ["يلتقون عند أول عدد يقبل القسمة على كل هذه المدد معًا، وهو المضاعف المشترك الأصغر.", `طريقة المحاضرة: نبحث في الخيارات عن أصغر عدد يقبل القسمة على ${ks.map(h.A).join(" و ")}.`,
            `${h.A(L)}: ${ks.map(k => `${h.A(L)} ÷ ${h.A(k)} = ${h.A(L / k)}`).join(" ، ")} ✓ وهو الأصغر.`], explanation: h.A(L) };
      } },
      prime: { title: "الأعداد الأولية", from: 1040, to: 1394, gen(R, h) {
        const style = R.pick(["is", "not"]);
        const comps = [51, 57, 87, 91, 93, 119, 133, 143, 161, 187, 203, 209, 221, 247, 253, 299, 39, 69, 77, 49, 117, 111];
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229];
        const good = R.pick(style === "is" ? primes.filter(p => p > 20) : comps);
        const bad = R.shuffle(style === "is" ? comps : primes.filter(p => p > 20)).filter(x => x !== good).slice(0, 3);
        const f = n => { for (let k = 2; k * k <= n; k++) if (n % k === 0) return k; return 0; };
        return { style, sig: `${style}:${good}:${bad.join(",")}`, body: `أي الأعداد التالية هو عدد ${style === "is" ? "أولي" : "غير أولي"} ؟`, ...h.strOptions(R, h.A(good), bad.map(h.A)),
          steps: ["العدد الأولي: عدد أكبر من ١ لا يقبل القسمة إلا على نفسه والواحد.", "نختبر القسمة على ٢ و٣ و٥ و٧ و١١ و١٣ (حتى جذر العدد):",
            ...[good, ...bad].map(n => f(n) ? `${h.A(n)} = ${h.A(f(n))} × ${h.A(n / f(n))} ← غير أولي` : `${h.A(n)} لا يقبل القسمة على أي منها ← أولي`)], explanation: h.A(good) };
      } }
    }
  };
})();
