// قراءة ملفات PDF في لوحة المعلم: كشوف الطلاب والأسئلة
window.PDFTools = (() => {
  const WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const AR = /[\u0600-\u06FF]/;
  const latin = s => String(s ?? "")
    .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
  // كشوف نور تستخدم ترميز خط خاص: حروف في نطاق 0370–03FF تقابل أشكال الحروف العربية FE70–FEFF، ومكتوبة بالترتيب المرئي
  const SPECIAL = { 0x2EF: "\u0621", 0xB7: "\u0625", 0xBCC: "\uFDF2" };
  const isNoor = s => /[\u0370-\u03FF\u0BCC\u02EF]/.test(s);
  const decodeNoor = s => [...s].map(ch => {
    const n = ch.codePointAt(0);
    if (SPECIAL[n]) return SPECIAL[n];
    return n >= 0x370 && n <= 0x3FF ? String.fromCharCode(0xFE00 + (n & 0xFF)) : ch;
  }).reverse().join("");
  const norm = s => latin((isNoor(s) ? decodeNoor(s) : String(s)).normalize("NFKC"))
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069\u0640]/g, "")
    .replace(/\s+/g, " ").trim();

  // يعيد أسطر الملف، كل سطر مصفوفة عناصر مرتبة من اليمين لليسار
  async function lines(file) {
    if (!window.pdfjsLib) throw new Error("تعذر تحميل قارئ PDF. تحقق من الإنترنت ثم أعد المحاولة.");
    pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
    const doc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const out = [];
    let textCount = 0;
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const tc = await page.getTextContent();
      const items = tc.items.filter(i => i.str && i.str.trim())
        .map(i => ({ str: norm(i.str), x: i.transform[4], y: i.transform[5], w: i.width || 0, h: Math.abs(i.transform[3]) || 8 }));
      textCount += items.length;
      items.sort((a, b) => b.y - a.y);
      const groups = [];
      for (const it of items) {
        const g = groups.find(g => Math.abs(g.y - it.y) < Math.max(3, it.h * 0.45));
        g ? g.items.push(it) : groups.push({ y: it.y, items: [it] });
      }
      groups.sort((a, b) => b.y - a.y).forEach(g => out.push(g.items.sort((a, b) => (b.x + b.w) - (a.x + a.w))));
    }
    if (!textCount) throw new Error("الملف صورة ممسوحة ضوئيًا ولا يحتوي على نص قابل للقراءة. صدّر الكشف من نور بصيغة Excel، أو أرسل الملف لـ Claude ليحوّله.");
    return out;
  }
  const lineText = ln => ln.map(i => i.str).join(" ").replace(/\s+/g, " ").trim();

  // ---------- كشف الطلاب ----------
  function students(ls) {
    const found = {};
    for (const ln of ls) {
      const m = lineText(ln).match(/(?<!\d)\d{10}(?!\d)/);
      if (!m) continue;
      // نجمع العناصر العربية المتجاورة في "خلايا"، ونختار الخلية الأطول اسمًا
      const runs = []; let cur = null, prev = null;
      for (const it of ln) {
        const isName = AR.test(it.str) && !/\d/.test(it.str);
        const gap = prev ? prev.x - (it.x + it.w) : 0;
        if (isName && cur && gap < Math.max(14, it.h * 1.6)) cur.push(it.str);
        else if (isName) runs.push(cur = [it.str]);
        else cur = null;
        prev = it;
      }
      const best = runs.map(r => r.join(" ")).sort((a, b) => b.split(" ").length - a.split(" ").length || b.length - a.length)[0];
      if (best && best.split(" ").length >= 2 && !found[m[0]]) found[m[0]] = { national_id: m[0], full_name: best };
    }
    return Object.values(found);
  }
  function fixName(name, revWords, revChars) {
    let w = name.split(" ");
    if (revChars) w = w.map(x => [...x].reverse().join(""));
    if (revWords) w = w.reverse();
    return w.join(" ");
  }

  // ---------- الأسئلة ----------
  const LETTER = { "أ": 0, "ا": 0, "إ": 0, "ب": 1, "ج": 2, "د": 3 };
  function questions(ls, defaultLid) {
    const blocks = []; let cur = null, lid = defaultLid;
    for (const ln of ls) {
      const t = lineText(ln);
      const lec = t.match(/^(?:المحاضرة|محاضرة|الدرس)\s*(?:رقم)?\s*[:\-–]?\s*(\d{1,3})\b/);
      if (lec && t.length < 60) { lid = +lec[1]; cur = null; continue; }
      const q = t.match(/^(?:س\s*)?(\d{1,3})\s*[-–).:]\s*(.+)$/);
      if (q) { cur = { lid, num: +q[1], lines: [q[2]] }; blocks.push(cur); continue; }
      if (cur) cur.lines.push(t);
    }
    const ok = [], bad = [];
    for (const b of blocks) {
      let full = b.lines.join("\n");
      let explanation = "";
      const ex = full.match(/(?:الشرح|التفسير|طريقة الحل|الحل)\s*[:：\-–]\s*([\s\S]*)$/);
      if (ex) { explanation = ex[1].replace(/\s+/g, " ").trim(); full = full.slice(0, ex.index); }
      let correct = -1;
      const an = full.match(/(?:الإجابة|الاجابة)(?:\s*الصحيحة)?\s*[:：\-–]?\s*\(?\s*([أاإبجد])(?![\u0600-\u06FF])/);
      if (an) { correct = LETTER[an[1]]; full = full.slice(0, an.index); }
      // علامات الخيارات: «أ)» أو «أ-» أو «(أ» بالترتيب
      const marks = [...full.matchAll(/(^|[\s\n])(?:\(\s*([أبجد])\s*\)?|([أبجد])\s*[)\-–.])(?=\s)/g)]
        .map(m => ({ i: m.index + m[1].length, end: m.index + m[0].length, l: m[2] || m[3] }));
      const seq = []; let need = 0, from = 0;
      for (const m of marks) if (m.i >= from && m.l === "أبجد"[need]) { seq.push(m); from = m.end; need++; if (need === 4) break; }
      const body = (seq.length ? full.slice(0, seq[0].i) : full).replace(/\s+/g, " ").trim();
      const options = seq.map((m, k) => full.slice(m.end, k + 1 < seq.length ? seq[k + 1].i : undefined).replace(/\s+/g, " ").trim());
      const item = { lecture_id: b.lid, body, options, correct, explanation, num: b.num };
      if (!b.lid || !body || options.length < 2 || options.some(o => !o) || correct < 0 || correct >= options.length) bad.push(item);
      else ok.push(item);
    }
    return { ok, bad, blocks: blocks.length };
  }

  return { lines, students, fixName, questions };
})();
