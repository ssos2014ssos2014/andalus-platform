// المحاضرة 37: الحساب الذهني وقابلية القسمة والأعداد الأولية
(() => {
  const g = (a, b) => b ? g(b, a % b) : a, l = (a, b) => a / g(a, b) * b;
  const isP = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  const RULE = { 2: "آحاده زوجي", 3: "مجموع أرقامه يقبل القسمة على ٣", 4: "العدد المكوّن من آحاده وعشراته يقبل القسمة على ٤", 5: "آحاده صفر أو ٥", 6: "يقبل القسمة على ٢ و ٣ معًا", 8: "العدد المكوّن من آحاده وعشراته ومئاته يقبل القسمة على ٨", 9: "مجموع أرقامه يقبل القسمة على ٩", 11: "الفرق بين مجموع أرقام الخانات الفردية ومجموع أرقام الخانات الزوجية صفر أو من مضاعفات ١١" };
  const dsum = n => String(n).split("").reduce((t, c) => t + +c, 0);
  const alt = n => String(n).split("").reverse().reduce((t, c, i) => t + (i % 2 ? -1 : 1) * +c, 0);
  window.EXAMS[37] = {
    title: "اختبار محاكي: الحساب الذهني وقابلية القسمة والأعداد الأولية", minutes: 25,
    blueprint: [["consec", 2], ["unit", 3], ["divRule", 4], ["digit", 3], ["remCmp", 2], ["remain", 2], ["subtract", 2], ["prime", 3], ["qr", 2], ["reverse", 1]],
    skills: {
      consec: { title: "جمع أعداد متتالية حول عدد أوسط", from: 0, to: 400, gen(R, h) {
        const A = h.A, mid = R.pick([50, 100, 200, 30, 40, 70]), k = R.int(3, 6), list = Array.from({ length: 2 * k + 1 }, (_, i) => mid - k + i), v = mid * (2 * k + 1);
        return { style: "c", sig: `${mid}:${k}`, body: `أوجد مجموع الأعداد: ${list.map(A).join(" + ")}`, ...h.numOptions(R, h.d(v), [h.d(v + mid), h.d(v - mid), h.d(v + 2 * k)]),
          steps: ["نجمع كل عددين متقابلين من الطرفين: كل زوج مجموعه ضعف العدد الأوسط.", `${A(list[0])} + ${A(list[list.length - 1])} = ${A(2 * mid)} ، وعدد الحدود ${A(2 * k + 1)}.`, `المجموع = ${A(mid)} × ${A(2 * k + 1)} = ${A(v)}.`], explanation: A(v) };
      } },
      unit: { title: "رقم الآحاد في حاصل الضرب (الحذف السريع)", from: 400, to: 660, gen(R, h) {
        const A = h.A, ns = [R.int(12, 99), R.int(102, 999), R.int(2, 9)], v = ns.reduce((a, b) => a * b), u = v % 10;
        const wr = [v + 10 - u + ((u + 3) % 10) - (u + 3 > 9 ? 10 : 0), v - 20 + ((u + 7) % 10) - u, v + 100 + ((u + 1) % 10) - u].map(x => Math.abs(x));
        if (new Set(wr.map(x => x % 10)).has(u)) return null;
        return { style: "u", sig: ns.join(":"), body: `أوجد ناتج ${ns.map(A).join(" × ")}`, ...h.numOptions(R, h.d(v), wr.map(x => h.d(x))),
          steps: ["لا نحتاج الضرب كاملًا: رقم آحاد الناتج = رقم آحاد حاصل ضرب أرقام الآحاد.", `${ns.map(n => A(n % 10)).join(" × ")} = ${A(ns.reduce((a, b) => a * (b % 10), 1))} ، فرقم الآحاد ${A(u)}.`, `الخيار الوحيد الذي آحاده ${A(u)} هو ${A(v)}.`], explanation: A(v) };
      } },
      divRule: { title: "قابلية القسمة", from: 660, to: 2200, gen(R, h) {
        const A = h.A, k = R.pick([3, 4, 6, 8, 9, 11, 12, 15, 24]), base = R.int(10, 99), v = k * R.int(Math.ceil(100 / k), Math.floor(999 / k));
        const wrongs = []; while (wrongs.length < 3) { const w = v + R.int(1, k - 1) * (R.next() < .5 ? 1 : -1) + (R.next() < .5 ? 0 : 3 * k); if (w > 9 && w % k && !wrongs.includes(w)) wrongs.push(w); }
        const parts = k === 12 ? [3, 4] : k === 15 ? [3, 5] : k === 24 ? [3, 8] : null;
        return { style: "d" + k, sig: `${k}:${v}:${wrongs.join(",")}`, body: `أي الأعداد التالية يقبل القسمة على ${A(k)}؟`, ...h.strOptions(R, A(v), wrongs.map(A)),
          steps: [parts ? `${A(k)} = ${A(parts[0])} × ${A(parts[1])} (أوليان فيما بينهما)، فيجب أن يقبل القسمة على ${A(parts[0])} و ${A(parts[1])} معًا.` : `يقبل العدد القسمة على ${A(k)} إذا كان ${RULE[k]}.`, k === 3 || k === 9 || (parts && parts.includes(3)) ? `${A(v)}: مجموع أرقامه ${A(dsum(v))}.` : k === 11 ? `${A(v)}: الفرق = ${A(Math.abs(alt(v)))}.` : `${A(v)} ÷ ${A(k)} = ${A(v / k)}.`, `إذن العدد ${A(v)}.`], explanation: A(v) };
      } },
      digit: { title: "إيجاد رقم مجهول لتحقيق قابلية القسمة", from: 960, to: 2340, gen(R, h) {
        const A = h.A, k = R.pick([3, 9, 4, 11]), L = R.int(3, 5), pos = k === 4 ? 1 : R.int(0, L - 1), digits = Array.from({ length: L }, (_, i) => i === 0 ? R.int(1, 9) : R.int(0, 9));
        const ok = []; for (let d = 0; d <= 9; d++) { const t = [...digits]; t[L - 1 - pos] = d; if (t[0] === 0) continue; const n = +t.join(""); if (n % k === 0) ok.push(d); }
        if (ok.length !== 1) return null; const d = ok[0], shown = "\u2066" + digits.map((x, i) => i === L - 1 - pos ? "س" : A(x)).join("") + "\u2069", others = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== d).sort(() => R.next() - .5).slice(0, 3);
        return { style: "g" + k, sig: `${digits.join("")}:${pos}:${k}`, body: `إذا كان العدد ${shown} يقبل القسمة على ${A(k)} ، حيث س رقم واحد، فإن س = ؟`, ...h.strOptions(R, A(d), others.map(A)),
          steps: [`قاعدة ${A(k)}: ${RULE[k]}.`, `نعوّض الخيارات: عند س = ${A(d)} يصبح العدد ${A(+digits.map((x, i) => i === L - 1 - pos ? d : x).join(""))} ويقبل القسمة على ${A(k)}.`], explanation: A(d) };
      } },
      remCmp: { title: "المقارنة بين باقيي قسمة", from: 1440, to: 1600, gen(R, h) {
        const A = h.A, k = R.pick([2, 4, 5, 9, 10]), a = R.int(1000, 999999), b = R.int(100, 99999), x = a % k, y = b % k;
        return { style: "r" + k, sig: `${a}:${b}:${k}`, body: `قارن بين:\nالقيمة الأولى: باقي قسمة ${A(a)} على ${A(k)}\nالقيمة الثانية: باقي قسمة ${A(b)} على ${A(k)}`, ...h.cmpAnswer(h.d(x), h.d(y)),
          steps: [k === 9 ? "باقي القسمة على ٩ = باقي قسمة مجموع الأرقام على ٩." : k === 4 ? "باقي القسمة على ٤ = باقي قسمة آخر رقمين على ٤." : `باقي القسمة على ${A(k)} يتحدد من رقم الآحاد.`, `الباقي الأول ${A(x)} ، والثاني ${A(y)}.`, `إذن ${x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان"}.`], explanation: x > y ? "القيمة الأولى أكبر" : x < y ? "القيمة الثانية أكبر" : "القيمتان متساويتان" };
      } },
      remain: { title: "عدد يترك باقيًا ثابتًا عند القسمة على عدة أعداد", from: 1600, to: 3060, gen(R, h) {
        const A = h.A, sets = [[3, 4, 5, 6], [2, 3, 4], [4, 6, 9], [3, 5, 7], [2, 5, 7], [6, 8]], s = R.pick(sets), L = s.reduce(l), mode = R.pick(["same", "minus"]);
        if (mode === "minus") { const v = L - 1;
          return { style: "m", sig: `m${s.join("")}`, body: `ما أصغر عدد إذا قسمناه على ${s.map(A).join(" و ")} يكون الباقي على الترتيب ${s.map(x => A(x - 1)).join(" و ")}؟`, ...h.numOptions(R, h.d(v), [h.d(L + 1), h.d(L), h.d(v + L)]),
            steps: ["كل باقٍ أقل من المقسوم عليه بواحد، أي أن العدد + ١ يقبل القسمة عليها جميعًا.", `م.م.أ (${s.map(A).join(" ، ")}) = ${A(L)}.`, `العدد = ${A(L)} − ١ = ${A(v)}.`], explanation: A(v) }; }
        const r = R.int(1, Math.min(...s) - 1), v = L + r;
        return { style: "s", sig: `s${s.join("")}:${r}`, body: `ما أصغر عدد أكبر من ${A(r)} إذا قسمناه على ${s.map(A).join(" أو ")} يكون الباقي ${A(r)}؟`, ...h.numOptions(R, h.d(v), [h.d(L), h.d(L - r > 0 ? L - r : v + 1), h.d(v + L)]),
          steps: [`العدد − ${A(r)} يقبل القسمة على ${s.map(A).join(" و ")}.`, `م.م.أ = ${A(L)}.`, `العدد = ${A(L)} + ${A(r)} = ${A(v)}.`], explanation: A(v) };
      } },
      subtract: { title: "أصغر عدد يُطرح ليصبح العدد قابلًا للقسمة", from: 2340, to: 3660, gen(R, h) {
        const A = h.A, k = R.pick([7, 9, 11, 12, 13, 25, 27]), n = R.int(300, 9999), r = n % k; if (!r) return null;
        return { style: "s" + k, sig: `${n}:${k}`, body: `ما أصغر عدد يمكن طرحه من ${A(n)} حتى يقبل القسمة على ${A(k)}؟`, ...h.numOptions(R, h.d(r), [h.d(k - r), h.d(r + 1), h.d(Math.max(1, r - 1))]),
          steps: ["أصغر عدد يُطرح = باقي القسمة.", `${A(n)} ÷ ${A(k)} = ${A(Math.floor(n / k))} والباقي ${A(r)}.`, `تحقق: ${A(n - r)} = ${A(k)} × ${A(Math.floor(n / k))}.`], explanation: A(r) };
      } },
      prime: { title: "الأعداد الأولية", from: 2520, to: 3000, gen(R, h) {
        const A = h.A, notMode = R.next() < .5, primes = [], comps = [];
        for (let n = 51; n < 220; n++) { if (n % 2 === 0 || n % 5 === 0) continue; (isP(n) ? primes : comps).push(n); }
        const hard = comps.filter(n => n % 3 && n % 7 === 0 || n % 11 === 0 || n % 13 === 0);
        if (notMode) { const v = R.pick(hard), o = R.shuffle(primes).slice(0, 3); const f = [7, 11, 13].find(p => v % p === 0);
          return { style: "n", sig: `n${v}:${o.join(",")}`, body: "أي الأعداد الآتية عدد غير أولي؟", ...h.strOptions(R, A(v), o.map(A)),
            steps: ["العدد الأولي يقبل القسمة على نفسه وعلى الواحد فقط.", `${A(v)} = ${A(f)} × ${A(v / f)} ، فهو غير أولي.`, "انتبه: الأعداد الفردية التي لا تقبل القسمة على ٣ أو ٥ ليست بالضرورة أولية؛ جرّب القسمة على ٧ و ١١ و ١٣."], explanation: A(v) }; }
        const v = R.pick(primes), o = R.shuffle(hard).slice(0, 3);
        return { style: "p", sig: `p${v}:${o.join(",")}`, body: "أي الأعداد الآتية عدد أولي؟", ...h.strOptions(R, A(v), o.map(A)),
          steps: ["نستبعد ما يقبل القسمة على ٧ أو ١١ أو ١٣.", ...o.map(n => { const f = [7, 11, 13].find(p => n % p === 0); return `${A(n)} = ${A(f)} × ${A(n / f)}.`; }), `إذن العدد الأولي ${A(v)}.`], explanation: A(v) };
      } },
      qr: { title: "المقسوم = المقسوم عليه × الناتج + الباقي", from: 3480, to: 3560, gen(R, h) {
        const A = h.A, k = R.int(3, 12), q = R.int(20, 200), r = R.int(1, k - 1), v = k * q + r;
        return { style: "q", sig: `${k}:${q}:${r}`, body: `عدد إذا قسمناه على ${A(k)} كان الناتج ${A(q)} والباقي ${A(r)} ، ما هو العدد؟`, ...h.numOptions(R, h.d(v), [h.d(k * q), h.d(k * q - r), h.d(k * (q + r))]),
          steps: ["المقسوم = المقسوم عليه × الناتج + الباقي.", `= ${A(k)} × ${A(q)} + ${A(r)} = ${A(k * q)} + ${A(r)} = ${A(v)}.`], explanation: A(v) };
      } },
      reverse: { title: "إيجاد العدد بالعمليات العكسية", from: 3000, to: 3120, gen(R, h) {
        const A = h.A, k = R.int(2, 9), c = R.int(2, 20), x = k * R.int(3, 15), v = x / k + c;
        return { style: "r", sig: `${k}:${c}:${x}`, body: `عدد مقسوم على ${A(k)} وجُمع على الناتج ${A(c)} أصبح ${A(v)} ، ما هو العدد؟`, ...h.numOptions(R, h.d(x), [h.d(v * k), h.d((v + c) * k), h.d(x + k)]),
          steps: ["نعكس العمليات من النهاية: نطرح ثم نضرب.", `${A(v)} − ${A(c)} = ${A(v - c)}.`, `${A(v - c)} × ${A(k)} = ${A(x)}.`], explanation: A(x) };
      } }
    }
  };
})();
