(function () {
  const app = document.getElementById("app");
  const sb = API.sb;
  const LETTERS = ["أ", "ب", "ج", "د", "هـ", "و"];
  const A = { tab: "students", msg: null, lectures: [], qLecture: 1, editQ: null, importPreview: null, qPreview: null };

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "style") el.style.cssText = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "value") el.value = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }
  const flash = (type, text) => { A.msg = { type, text }; render(); };
  const msgBox = () => A.msg && h("div", { class: "alert " + A.msg.type, role: "status" }, A.msg.text);
  const cell = v => (v == null ? "" : String(v).trim());

  if (!API.live) {
    app.replaceChildren(h("main", { class: "wrap narrow" }, h("div", { class: "panel", style: "margin-top:40px" },
      h("h1", null, "لوحة المعلم"),
      h("p", null, "لوحة المعلم تحتاج ربط المنصة بقاعدة البيانات. ضع رابط مشروع Supabase ومفتاحه في ملف config.js ثم افتح الصفحة مرة أخرى."),
      h("a", { class: "btn ghost", href: "index.html" }, "فتح صفحة الطالب (وضع التجربة)"))));
    return;
  }

  // ---------- الدخول ----------
  async function boot() {
    const { data } = await sb.auth.getSession();
    if (!data.session) return viewLogin();
    const { data: ok } = await sb.rpc("is_admin");
    if (!ok) return viewLogin("هذا الحساب ليس ضمن حسابات المعلمين المسجلة في جدول admins.");
    const { data: ls } = await sb.from("lectures").select("*").order("id");
    A.lectures = ls || [];
    render();
  }
  function viewLogin(err) {
    const email = h("input", { type: "email", required: true, autocomplete: "username" });
    const pass = h("input", { type: "password", required: true, autocomplete: "current-password" });
    app.replaceChildren(h("main", { class: "wrap narrow" }, h("div", { class: "panel login-card", style: "margin-top:60px" },
      h("h1", null, "لوحة المعلم"),
      err && h("div", { class: "alert err" }, err),
      h("form", { onsubmit: async e => {
        e.preventDefault();
        const { error } = await sb.auth.signInWithPassword({ email: email.value.trim(), password: pass.value });
        if (error) return viewLogin("البريد أو كلمة المرور غير صحيحة.");
        boot();
      } },
        h("label", { class: "field" }, h("span", null, "البريد الإلكتروني"), email),
        h("label", { class: "field" }, h("span", null, "كلمة المرور"), pass),
        h("button", { class: "btn", type: "submit", style: "width:100%" }, "دخول")))));
  }

  // ---------- الإطار ----------
  const TABS = [["students", "الطلاب"], ["questions", "الأسئلة"], ["lectures", "المحاضرات"], ["results", "النتائج"], ["settings", "الإعدادات"]];
  async function render() {
    const body = h("div", null, h("div", { class: "loading" }, "جارٍ التحميل…"));
    app.replaceChildren(
      h("header", { class: "band" }, h("div", { class: "band-inner" },
        h("div", { class: "brand" }, "لوحة المعلم", h("small", null, "منصة تأسيس القدرات")),
        h("div", { class: "spacer" }),
        h("a", { class: "btn ghost sm", href: "index.html", target: "_blank" }, "صفحة الطالب"),
        h("button", { class: "btn ghost sm", onclick: async () => { await sb.auth.signOut(); viewLogin(); } }, "تسجيل الخروج"))),
      h("main", { class: "wrap" },
        h("nav", { class: "tabsbar", role: "tablist" }, TABS.map(([k, t]) =>
          h("button", { role: "tab", "aria-selected": String(A.tab === k), onclick: () => { A.tab = k; A.msg = null; render(); } }, t))),
        msgBox(), body));
    const fn = { students: tabStudents, questions: tabQuestions, lectures: tabLectures, results: tabResults, settings: tabSettings }[A.tab];
    try { body.replaceChildren(...[await fn()].flat()); }
    catch (e) { body.replaceChildren(h("div", { class: "alert err" }, "تعذر تحميل البيانات: " + e.message)); }
  }

  async function readSheet(file) {
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false }).filter(r => r.some(c => cell(c) !== ""));
  }

  // ---------- الطلاب ----------
  async function tabStudents() {
    const { count } = await sb.from("students").select("*", { count: "exact", head: true });
    const search = h("input", { type: "text", placeholder: "ابحث بالاسم أو رقم الهوية" });
    const list = h("div");
    async function load() {
      let q = sb.from("students").select("national_id, full_name, details").order("full_name").limit(100);
      const t = search.value.trim();
      if (t) q = q.or(`full_name.ilike.%${t.replace(/[%,()]/g, "")}%,national_id.ilike.%${toLatinDigits(t).replace(/[%,()]/g, "")}%`);
      const { data, error } = await q; if (error) throw error;
      list.replaceChildren(data.length ? h("div", { class: "table-wrap" }, h("table", null,
        h("thead", null, h("tr", null, h("th", null, "الاسم"), h("th", null, "رقم الهوية"), h("th", null, "البيانات"), h("th", null, ""))),
        h("tbody", null, data.map(s => h("tr", null,
          h("td", null, s.full_name), h("td", null, s.national_id),
          h("td", { class: "small" }, (s.details || []).map(d => `${d.k}: ${d.v}`).join("، ")),
          h("td", null, h("button", { class: "btn danger sm", onclick: async () => {
            if (!confirm(`حذف الطالب ${s.full_name} ونتائجه؟`)) return;
            const { error } = await sb.from("students").delete().eq("national_id", s.national_id);
            error ? flash("err", error.message) : flash("ok", "تم حذف الطالب.");
          } }, "حذف")))))))
        : h("p", { class: "muted" }, t ? "لا توجد نتائج مطابقة." : "لم يُستورد أي طالب بعد. ابدأ برفع ملف الطلاب في الأعلى."));
    }
    search.addEventListener("input", () => { clearTimeout(search._t); search._t = setTimeout(load, 300); });
    await load();
    return [
      h("section", { class: "panel" },
        h("h2", null, "استيراد الطلاب من Excel"),
        h("p", { class: "small muted" }, "ارفع ملف Excel أو CSV فيه صف للعناوين. سيُطلب منك تحديد عمود رقم الهوية وعمود الاسم، وكل الأعمدة الأخرى تظهر للطالب في بطاقته كما هي. الطالب المسجل مسبقًا تُحدَّث بياناته ولا تُحذف نتائجه."),
        h("input", { type: "file", accept: ".xlsx,.xls,.csv", onchange: async e => {
          const f = e.target.files[0]; if (!f) return;
          try {
            const rows = await readSheet(f);
            if (rows.length < 2) return flash("err", "الملف لا يحتوي على بيانات بعد صف العناوين.");
            const headers = rows[0].map(cell);
            const find = re => Math.max(0, headers.findIndex(x => re.test(x)));
            A.importPreview = { headers, rows: rows.slice(1), idCol: find(/هوي|سجل|إقام|اقام|national|id/i), nameCol: find(/اسم|name/i) };
            render();
          } catch (err) { flash("err", "تعذرت قراءة الملف: " + err.message); }
        } }),
        A.importPreview && importPreview()),
      h("section", { class: "panel" },
        h("div", { class: "row", style: "justify-content:space-between" }, h("h2", { style: "margin:0" }, `الطلاب المسجلون (${count ?? 0})`)),
        h("div", { style: "margin:12px 0" }, search), list)];
  }
  function importPreview() {
    const P = A.importPreview;
    const sel = (key) => h("select", { onchange: e => { P[key] = +e.target.value; render(); } },
      P.headers.map((t, i) => h("option", { value: String(i), selected: P[key] === i }, t || `عمود ${i + 1}`)));
    const recs = [], bad = [];
    for (const r of P.rows) {
      const nid = toLatinDigits(r[P.idCol]).replace(/\.0+$/, ""), name = cell(r[P.nameCol]);
      if (!/^\d{5,14}$/.test(nid) || !name) { bad.push(r); continue; }
      recs.push({ national_id: nid, full_name: name,
        details: P.headers.map((k, i) => ({ k: k || `عمود ${i + 1}`, v: cell(r[i]) })).filter((d, i) => i !== P.idCol && i !== P.nameCol && d.v !== "") });
    }
    const uniq = Object.values(Object.fromEntries(recs.map(r => [r.national_id, r])));
    return h("div", { style: "margin-top:16px" },
      h("div", { class: "grid2" },
        h("label", { class: "field" }, h("span", null, "عمود رقم الهوية"), sel("idCol")),
        h("label", { class: "field" }, h("span", null, "عمود اسم الطالب"), sel("nameCol"))),
      h("p", null, `جاهز للاستيراد: ${uniq.length} طالبًا.` + (bad.length ? ` تم تجاهل ${bad.length} صفًا بلا رقم هوية صحيح أو بلا اسم.` : "")),
      uniq.length > 0 && h("div", { class: "table-wrap", style: "margin-bottom:12px" }, h("table", null,
        h("thead", null, h("tr", null, h("th", null, "الاسم"), h("th", null, "رقم الهوية"), h("th", null, "بيانات إضافية"))),
        h("tbody", null, uniq.slice(0, 5).map(r => h("tr", null, h("td", null, r.full_name), h("td", null, r.national_id),
          h("td", { class: "small" }, r.details.map(d => `${d.k}: ${d.v}`).join("، "))))))),
      h("div", { class: "row" },
        h("button", { class: "btn", disabled: !uniq.length, onclick: async e => {
          e.target.disabled = true; e.target.textContent = "جارٍ الاستيراد…";
          for (let i = 0; i < uniq.length; i += 500) {
            const { error } = await sb.from("students").upsert(uniq.slice(i, i + 500), { onConflict: "national_id" });
            if (error) return flash("err", "توقف الاستيراد: " + error.message);
          }
          A.importPreview = null; flash("ok", `تم استيراد ${uniq.length} طالبًا.`);
        } }, `استيراد ${uniq.length} طالبًا`),
        h("button", { class: "btn ghost", onclick: () => { A.importPreview = null; render(); } }, "إلغاء")));
  }

  // ---------- الأسئلة ----------
  async function tabQuestions() {
    const { data: counts } = await sb.from("questions").select("lecture_id").eq("active", true);
    const per = {}; (counts || []).forEach(r => { per[r.lecture_id] = (per[r.lecture_id] || 0) + 1; });
    const { data: qs, error } = await sb.from("questions").select("*").eq("lecture_id", A.qLecture).order("id");
    if (error) throw error;
    const lsel = h("select", { onchange: e => { A.qLecture = +e.target.value; A.editQ = null; render(); } },
      A.lectures.map(l => h("option", { value: String(l.id), selected: l.id === A.qLecture }, `${l.title}${l.topic ? " — " + l.topic : ""} (${per[l.id] || 0} سؤال)`)));

    return [
      h("section", { class: "panel" },
        h("h2", null, "استيراد الأسئلة من Excel"),
        h("p", { class: "small muted" }, "الأعمدة بالترتيب: رقم المحاضرة، السؤال، الخيار أ، الخيار ب، الخيار ج، الخيار د، الإجابة الصحيحة (أ أو ب أو ج أو د)، الشرح. يكفي ملف واحد لكل المحاضرات. اجعل لكل محاضرة ضعف عدد أسئلة الاختبار على الأقل حتى تتغير الأسئلة بين المحاولات."),
        h("div", { class: "row" },
          h("button", { class: "btn ghost", onclick: () => {
            const ws = XLSX.utils.aoa_to_sheet([["رقم المحاضرة", "السؤال", "أ", "ب", "ج", "د", "الإجابة", "الشرح"],
              [1, "ما ناتج ٣ + ٤ × ٢ ؟", "14", "11", "10", "9", "ب", "الضرب قبل الجمع: ٤ × ٢ = ٨ ثم ٨ + ٣ = ١١"]]);
            const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "الأسئلة"); XLSX.writeFile(wb, "قالب-الأسئلة.xlsx");
          } }, "تنزيل قالب الأسئلة"),
          h("input", { type: "file", accept: ".xlsx,.xls,.csv", onchange: async e => {
            const f = e.target.files[0]; if (!f) return;
            try { A.qPreview = parseQuestions(await readSheet(f)); render(); } catch (err) { flash("err", "تعذرت قراءة الملف: " + err.message); }
          } })),
        A.qPreview && h("div", { style: "margin-top:14px" },
          h("p", null, `جاهز للإضافة: ${A.qPreview.ok.length} سؤالًا.` + (A.qPreview.bad.length ? ` صفوف بها خطأ: ${A.qPreview.bad.map(b => b.row).join("، ")}. (رقم محاضرة غير موجود، أو سؤال بلا خيارين، أو إجابة غير محددة)` : "")),
          h("div", { class: "row" },
            h("button", { class: "btn", disabled: !A.qPreview.ok.length, onclick: async e => {
              e.target.disabled = true;
              for (let i = 0; i < A.qPreview.ok.length; i += 500) {
                const { error } = await sb.from("questions").insert(A.qPreview.ok.slice(i, i + 500));
                if (error) return flash("err", "توقفت الإضافة: " + error.message);
              }
              const n = A.qPreview.ok.length; A.qPreview = null; flash("ok", `تمت إضافة ${n} سؤالًا.`);
            } }, "إضافة الأسئلة"),
            h("button", { class: "btn ghost", onclick: () => { A.qPreview = null; render(); } }, "إلغاء")))),
      h("section", { class: "panel" },
        h("label", { class: "field" }, h("span", null, "المحاضرة"), lsel),
        questionForm(),
        h("h3", { style: "margin-top:18px" }, `أسئلة المحاضرة (${qs.length})`),
        qs.length ? h("ol", { class: "review" }, qs.map(q => h("li", { class: q.active ? "" : "wrong" },
          h("div", { style: "font-weight:600;white-space:pre-wrap" }, q.body),
          h("p", { class: "a" }, q.options.map((o, i) => `${LETTERS[i]}) ${o}${i === q.correct ? " ✓" : ""}`).join("    ")),
          q.explanation && h("p", { class: "a muted" }, q.explanation),
          h("div", { class: "row", style: "margin-top:8px" },
            h("button", { class: "btn ghost sm", onclick: () => { A.editQ = q; render(); } }, "تعديل"),
            h("button", { class: "btn ghost sm", onclick: async () => {
              await sb.from("questions").update({ active: !q.active }).eq("id", q.id); render();
            } }, q.active ? "إيقاف السؤال" : "تفعيل السؤال"),
            h("button", { class: "btn danger sm", onclick: async () => {
              if (!confirm("حذف السؤال نهائيًا؟")) return;
              await sb.from("questions").delete().eq("id", q.id); render();
            } }, "حذف")))))
          : h("p", { class: "muted" }, "لا توجد أسئلة لهذه المحاضرة بعد. أضف سؤالًا من النموذج أعلاه أو استورد ملف Excel. حتى تُضاف الأسئلة، ينتقل الطالب للمحاضرة التالية بعد المشاهدة فقط."))];
  }
  function parseQuestions(rows) {
    const ids = new Set(A.lectures.map(l => l.id)), ok = [], bad = [];
    const start = /\d/.test(toLatinDigits(rows[0]?.[0])) ? 0 : 1;
    rows.slice(start).forEach((r, i) => {
      const lid = parseInt(toLatinDigits(r[0]), 10), body = cell(r[1]);
      const opts = [r[2], r[3], r[4], r[5]].map(cell).filter(Boolean);
      let ans = cell(r[6]).replace(/^ال/, "");
      let correct = LETTERS.indexOf(ans === "ه" ? "هـ" : ans);
      if (correct < 0 && /^[1-6]$/.test(toLatinDigits(ans))) correct = +toLatinDigits(ans) - 1;
      if (correct < 0 && /^[a-d]$/i.test(ans)) correct = "abcd".indexOf(ans.toLowerCase());
      if (!ids.has(lid) || !body || opts.length < 2 || correct < 0 || correct >= opts.length) bad.push({ row: i + start + 1 });
      else ok.push({ lecture_id: lid, body, options: opts, correct, explanation: cell(r[7]) });
    });
    return { ok, bad };
  }
  function questionForm() {
    const q = A.editQ || { body: "", options: ["", "", "", ""], correct: 0, explanation: "" };
    const body = h("textarea", { required: true }); body.value = q.body;
    const opts = [0, 1, 2, 3].map(i => { const x = h("input", { type: "text", placeholder: `الخيار ${LETTERS[i]}` }); x.value = q.options[i] || ""; return x; });
    const corr = h("select", null, LETTERS.slice(0, 4).map((l, i) => h("option", { value: String(i), selected: q.correct === i }, l)));
    const expl = h("textarea", { style: "min-height:60px" }); expl.value = q.explanation || "";
    return h("form", { class: "step", onsubmit: async e => {
      e.preventDefault();
      const options = opts.map(o => o.value.trim());
      const filled = options.filter(Boolean);
      const c = +corr.value;
      if (filled.length < 2 || !options[c]) return flash("err", "اكتب خيارين على الأقل، وتأكد أن الإجابة الصحيحة خيار مكتوب.");
      const row = { lecture_id: A.qLecture, body: body.value.trim(), options: options.slice(0, Math.max(...options.map((o, i) => o ? i : -1)) + 1).map(o => o || "—"), correct: c, explanation: expl.value.trim() };
      const { error } = A.editQ ? await sb.from("questions").update(row).eq("id", A.editQ.id) : await sb.from("questions").insert(row);
      if (error) return flash("err", error.message);
      const was = !!A.editQ; A.editQ = null; flash("ok", was ? "تم حفظ التعديل." : "تمت إضافة السؤال.");
    } },
      h("h3", null, A.editQ ? "تعديل السؤال" : "إضافة سؤال"),
      h("label", { class: "field" }, h("span", null, "نص السؤال"), body),
      h("div", { class: "grid2" }, opts),
      h("div", { class: "grid2", style: "margin-top:12px" },
        h("label", { class: "field" }, h("span", null, "الإجابة الصحيحة"), corr),
        h("label", { class: "field" }, h("span", null, "شرح الإجابة (اختياري)"), expl)),
      h("div", { class: "row" },
        h("button", { class: "btn", type: "submit" }, A.editQ ? "حفظ التعديل" : "إضافة السؤال"),
        A.editQ && h("button", { class: "btn ghost", type: "button", onclick: () => { A.editQ = null; render(); } }, "إلغاء")));
  }

  // ---------- المحاضرات ----------
  async function tabLectures() {
    return h("section", { class: "panel" },
      h("h2", null, "المحاضرات"),
      h("p", { class: "small muted" }, "عدّل عنوان كل محاضرة وموضوعها ليظهر للطالب في المسار، مثل: «النسبة والتناسب». المقاطع مربوطة بروابط Google Drive المستخرجة من صفحة المدرسة."),
      h("div", { class: "table-wrap" }, h("table", null,
        h("thead", null, h("tr", null, h("th", null, "رقم"), h("th", null, "العنوان"), h("th", null, "الموضوع"), h("th", null, "المقاطع"), h("th", null, ""))),
        h("tbody", null, A.lectures.map(l => {
          const t = h("input", { type: "text" }); t.value = l.title;
          const tp = h("input", { type: "text", placeholder: "موضوع المحاضرة" }); tp.value = l.topic || "";
          return h("tr", null, h("td", null, l.id), h("td", null, t), h("td", null, tp),
            h("td", null, l.parts.map((p, i) => [i ? " " : "", h("a", { href: `https://drive.google.com/file/d/${p.drive_id}/view`, target: "_blank", rel: "noopener" }, p.label)])),
            h("td", null, h("button", { class: "btn sm", onclick: async e => {
              const { error } = await sb.from("lectures").update({ title: t.value.trim() || l.title, topic: tp.value.trim() }).eq("id", l.id);
              if (error) return flash("err", error.message);
              l.title = t.value.trim() || l.title; l.topic = tp.value.trim();
              e.target.textContent = "تم الحفظ"; setTimeout(() => { e.target.textContent = "حفظ"; }, 1500);
            } }, "حفظ")));
        })))));
  }

  // ---------- النتائج ----------
  async function tabResults() {
    const f = h("input", { type: "text", placeholder: "رقم هوية طالب (اختياري)" });
    const ls = h("select", null, h("option", { value: "" }, "كل المحاضرات"), A.lectures.map(l => h("option", { value: String(l.id) }, l.title)));
    const out = h("div");
    let rows = [];
    async function load() {
      let q = sb.from("attempts").select("submitted_at, national_id, lecture_id, score, total, percent, passed, students(full_name)")
        .not("submitted_at", "is", null).order("submitted_at", { ascending: false }).limit(1000);
      if (f.value.trim()) q = q.eq("national_id", toLatinDigits(f.value));
      if (ls.value) q = q.eq("lecture_id", +ls.value);
      const { data, error } = await q; if (error) throw error;
      rows = data;
      out.replaceChildren(data.length ? h("div", { class: "table-wrap" }, h("table", null,
        h("thead", null, h("tr", null, ["التاريخ", "الطالب", "رقم الهوية", "المحاضرة", "الدرجة", "النسبة", "النتيجة"].map(x => h("th", null, x)))),
        h("tbody", null, data.map(r => h("tr", null,
          h("td", { class: "small" }, new Date(r.submitted_at).toLocaleString("ar-SA-u-nu-latn")),
          h("td", null, r.students?.full_name || ""), h("td", null, r.national_id),
          h("td", null, r.lecture_id), h("td", null, `${r.score}/${r.total}`), h("td", null, r.percent + "%"),
          h("td", { class: r.passed ? "chip-pass" : "chip-fail" }, r.passed ? "اجتاز" : "يحتاج مراجعة"))))))
        : h("p", { class: "muted" }, "لا توجد اختبارات مسلَّمة بهذه الشروط بعد."));
    }
    await load();
    return h("section", { class: "panel" },
      h("h2", null, "نتائج الاختبارات"),
      h("div", { class: "grid2" }, f, ls),
      h("div", { class: "row", style: "margin:12px 0" },
        h("button", { class: "btn", onclick: () => load().catch(e => flash("err", e.message)) }, "عرض النتائج"),
        h("button", { class: "btn ghost", onclick: () => {
          const ws = XLSX.utils.json_to_sheet(rows.map(r => ({ "التاريخ": new Date(r.submitted_at).toLocaleString("ar-SA-u-nu-latn"), "الطالب": r.students?.full_name || "",
            "رقم الهوية": r.national_id, "المحاضرة": r.lecture_id, "الدرجة": r.score, "من": r.total, "النسبة": r.percent, "النتيجة": r.passed ? "اجتاز" : "يحتاج مراجعة" })));
          const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "النتائج"); XLSX.writeFile(wb, "نتائج-الاختبارات.xlsx");
        } }, "تصدير إلى Excel")),
      out);
  }

  // ---------- الإعدادات ----------
  async function tabSettings() {
    const { data: s, error } = await sb.from("settings").select("*").eq("id", 1).single(); if (error) throw error;
    const pm = h("input", { type: "number", min: "1", max: "100", value: String(s.pass_mark) });
    const qn = h("input", { type: "number", min: "1", max: "100", value: String(s.questions_per_quiz) });
    const sn = h("input", { type: "text", value: s.school_name });
    const cn = h("input", { type: "text", value: s.course_name });
    return h("form", { class: "panel", onsubmit: async e => {
      e.preventDefault();
      const { error } = await sb.from("settings").update({ pass_mark: +pm.value, questions_per_quiz: +qn.value, school_name: sn.value.trim(), course_name: cn.value.trim() }).eq("id", 1);
      error ? flash("err", error.message) : flash("ok", "تم حفظ الإعدادات.");
    } },
      h("h2", null, "الإعدادات"),
      h("div", { class: "grid2" },
        h("label", { class: "field" }, h("span", null, "نسبة الاجتياز (%)"), pm),
        h("label", { class: "field" }, h("span", null, "عدد أسئلة كل اختبار"), qn),
        h("label", { class: "field" }, h("span", null, "اسم المدرسة"), sn),
        h("label", { class: "field" }, h("span", null, "اسم الدورة"), cn)),
      h("button", { class: "btn", type: "submit" }, "حفظ الإعدادات"));
  }

  boot();
})();
