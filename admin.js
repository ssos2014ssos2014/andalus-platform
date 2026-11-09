(function () {
  const app = document.getElementById("app");
  const sb = API.sb;
  const LETTERS = ["أ", "ب", "ج", "د", "هـ", "و"];
  const A = { tab: "dashboard", msg: null, lectures: [], qLecture: 1, editQ: null, importPreview: null, qPreview: null, pdfStudents: null };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(16).slice(2));
  const isPdf = f => /\.pdf$/i.test(f.name) || f.type === "application/pdf";
  async function uploadPdf(bucket, folder, file) {
    if (!isPdf(file)) throw new Error(`الملف «${file.name}» ليس PDF.`);
    if (file.size > 50 * 1024 * 1024) throw new Error(`الملف «${file.name}» أكبر من 50 ميجابايت.`);
    const path = `${folder}/${uid()}.pdf`;
    const { error } = await sb.storage.from(bucket).upload(path, file, { contentType: "application/pdf", upsert: false });
    if (error) throw new Error(error.message.includes("Bucket not found") ? "مخازن الملفات غير موجودة. شغّل ملف update-pdf.sql في Supabase أولًا." : error.message);
    return { path, url: sb.storage.from(bucket).getPublicUrl(path).data.publicUrl };
  }
  const AR = v => String(v ?? "").replace(/[0-9]/g, c => "٠١٢٣٤٥٦٧٨٩"[c]);
  const dur = sec => { sec = Math.round(sec || 0); const hh = Math.floor(sec / 3600), mm = Math.floor(sec % 3600 / 60); return hh ? `${AR(hh)} س ${AR(mm)} د` : `${AR(mm)} د`; };
  const WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.2z"/></svg>';
  function wa(phone, name, text) {
    const p = String(phone || "").replace(/\D/g, "");
    const intl = p.startsWith("05") ? "966" + p.slice(1) : p.startsWith("5") && p.length === 9 ? "966" + p : p;
    const a = h("a", { class: "wa" + (p ? "" : " off"), target: "_blank", rel: "noopener", title: p ? "مراسلة " + name + " على واتساب" : "لا يوجد رقم جوال",
      "aria-label": p ? "مراسلة " + name + " على واتساب" : "لا يوجد رقم جوال لـ " + name,
      href: p ? `https://wa.me/${intl}?text=${encodeURIComponent(text || `السلام عليكم ${name}،\n`)}` : null });
    a.innerHTML = WA_ICON; return a;
  }
  // تصفير طالب: حذف محاولاته ومشاهداته ودخوله وأماكن توقفه (ورقم جواله اختياريًا)
  async function resetStudent(nid, clearPhone) {
    for (const t of ["attempts", "views", "sessions", "watch_progress"]) {
      const { error } = await sb.from(t).delete().eq("national_id", nid);
      if (error && !/does not exist/.test(error.message)) throw error;
    }
    if (clearPhone) { const { error } = await sb.from("students").update({ phone: null }).eq("national_id", nid).eq("school", SCHOOL.key); if (error) throw error; }
  }
  let TEST_ID = SCHOOL.test;
  if (SCHOOL.female) startFeminine("admin");
  const baseName = n => n.replace(/\.pdf$/i, "").replace(/[_]+/g, " ").trim();

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
    // دخول مباشر من نظام إدارة ثانوية الأندلس: admin.html#sso=<رمز الدخول>
    const sso = new URLSearchParams(location.hash.slice(1)).get("sso");
    if (sso) {
      history.replaceState(null, "", location.pathname);
      try {
        const raw = decodeURIComponent(escape(atob(sso.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((sso.length + 3) % 4))));
        const i = raw.indexOf("|"), email = raw.slice(0, i), password = raw.slice(i + 1);
        const cur = (await sb.auth.getSession()).data.session;
        if (!cur || cur.user.email !== email) { await sb.auth.signOut(); const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) return viewLogin("رمز الدخول المباشر غير صالح. تأكد من إنشاء حساب الدخول المباشر في Supabase."); }
      } catch { return viewLogin("رمز الدخول المباشر غير صالح."); }
    }
    const { data } = await sb.auth.getSession();
    if (!data.session) return viewLogin();
    const { data: ok } = await sb.rpc("is_admin");
    if (!ok) return viewLogin("هذا الحساب ليس ضمن حسابات المعلمين المسجلة في جدول admins.");
    // كل حساب معلم مرتبط بمدرسته: تُعرض بيانات مدرسته فقط
    const { data: info, error: ie } = await sb.rpc("admin_info");
    if (ie) return viewLogin(/admin_info/.test(ie.message) ? "شغّل ملفي update-v18.sql و update-v19.sql في Supabase أولًا، ثم أعد الدخول." : ie.message);
    A.school = info && SCHOOLS_INFO[info.school] ? info.school : "andalus"; A.canSwitch = !!(info && info.can_switch);
    if (A.school !== SCHOOL.key) {
      // حساب يدير المنصتين: يتحوّل إلى المنصة المفتوحة في الرابط
      if (A.canSwitch) { const { error } = await sb.rpc("admin_switch_school", { p_school: SCHOOL.key }); if (!error) { A.school = SCHOOL.key; } }
      if (A.school !== SCHOOL.key) return viewWrongSchool(A.school);
    }
    TEST_ID = SCHOOL.test; A.super = A.school === "andalus";
    // حساب يدير المنصتين وفتحهما معًا: عند الرجوع لأي نافذة تُعاد مدرستها قبل أي عمل، فلا تختلط البيانات
    if (A.canSwitch && !A.focusHook) { A.focusHook = true;
      const resync = async () => { if (document.visibilityState !== "visible") return; const { data: i3 } = await sb.rpc("admin_info"); if (i3 && i3.school !== SCHOOL.key) { await sb.rpc("admin_switch_school", { p_school: SCHOOL.key }); render(); } };
      document.addEventListener("visibilitychange", resync); window.addEventListener("focus", resync); }
    const { data: ls } = await sb.from("lectures").select("*").order("id");
    const { data: st } = await sb.from("settings").select("*").eq("id", 1).single(); A.settings = st || {};
    A.lectures = ls || [];
    render();
  }
  function viewWrongSchool(own) {
    const o = SCHOOLS_INFO[own], here = SCHOOL;
    app.replaceChildren(h("main", { class: "wrap narrow" }, h("div", { class: "panel login-card", style: "margin-top:60px;text-align:center" },
      h("img", { src: here.logo, alt: "", style: "height:80px" }),
      h("h1", null, here.female ? "لوحة المعلمة — " + here.short : "لوحة المعلم — " + here.short),
      h("div", { class: "alert err" }, `هذا الحساب مسجّل لمنصة ${o.name}، ولا يملك صلاحية إدارة منصة ${here.name}. كل منصة مستقلة في بياناتها.`),
      h("p", { class: "small muted" }, here.key === "asma" ? "لإدارة منصة أسماء سجّلي الدخول بحساب معلمة أسماء، أو اطلب من مدير المنصة منح حسابك صلاحية إدارة المنصتين." : "لإدارة منصة الأندلس سجّل الدخول بحساب معلم الأندلس."),
      h("div", { class: "row", style: "justify-content:center;gap:10px" },
        h("a", { class: "btn", href: "admin.html" + (own === "andalus" ? "" : "?s=" + own) }, "الذهاب إلى لوحة " + o.short),
        h("button", { class: "btn ghost", onclick: async () => { await sb.auth.signOut(); viewLogin(); } }, "تسجيل الخروج والدخول بحساب آخر")))));
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
  const TABS = [["dashboard", "لوحة المؤشرات"], ["students", "الطلاب"], ["certs", "🏅 الشهادات"], ["ctests", "🧪 إنشاء اختبار"], ["questions", "الأسئلة"], ["lectures", "المحاضرات"], ["results", "📊 النتائج والتحليل"], ["settings", "الإعدادات"]];
  async function render() {
    if (!A.super && ["questions", "lectures", "settings"].includes(A.tab)) A.tab = "dashboard";
    const body = h("div", null, h("div", { class: "loading" }, "جارٍ التحميل…"));
    app.replaceChildren(
      h("header", { class: "band" }, h("div", { class: "band-inner" },
        h("div", { class: "brand" }, h("span", { class: "logo-plate" }, h("img", { src: SCHOOL.logo, alt: "شعار " + SCHOOL.short })), h("div", null, (A.settings && A.settings.platform_name) || "التأسيس والتدريب لاختبار القدرات العامة", h("small", null, "لوحة المعلم"))),
        h("div", { class: "spacer" }),
        h("a", { class: "btn gold sm", href: SCHOOL.home + "?as=" + TEST_ID, target: "_blank", title: "يفتح المنصة بحساب الطالب التجريبي ٠٠٠٠" }, SCHOOL.female ? "👁 الدخول كطالبة" : "👁 الدخول كطالب"),
        A.canSwitch && h("a", { class: "btn ghost sm", href: SCHOOL.key === "asma" ? "admin.html" : "admin.html?s=asma", title: "حسابك يدير المنصتين" }, SCHOOL.key === "asma" ? "⇄ منصة الأندلس" : "⇄ منصة أسماء"),
        h("button", { class: "btn ghost sm", onclick: async () => { await sb.auth.signOut(); viewLogin(); } }, "تسجيل الخروج"))),
      h("main", { class: "wrap" },
        h("nav", { class: "tabsbar", role: "tablist" }, TABS.filter(([k]) => A.super || !["questions", "lectures", "settings"].includes(k)).map(([k, t]) =>
          h("button", { role: "tab", "aria-selected": String(A.tab === k), onclick: () => { A.tab = k; A.msg = null; render(); } }, t))),
        msgBox(), body));
    if (A.canSwitch) { try { await sb.rpc("admin_switch_school", { p_school: SCHOOL.key }); } catch {} }
    const fn = { dashboard: tabDashboard, students: tabStudents, certs: tabCerts, ctests: tabCtests, questions: tabQuestions, lectures: tabLectures, results: tabResults, settings: tabSettings }[A.tab];
    try { body.replaceChildren(...[await fn()].flat()); }
    catch (e) { body.replaceChildren(h("div", { class: "alert err" }, "تعذر تحميل البيانات: " + e.message)); }
  }

  async function readSheet(file) {
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false }).filter(r => r.some(c => cell(c) !== ""));
  }

  // ---------- لوحة المؤشرات ----------
  async function tabDashboard() {
    const { data: D, error } = await sb.rpc("admin_dashboard");
    if (error) throw new Error(error.message.includes("admin_dashboard") ? "شغّل ملف update-v3.sql في Supabase أولًا." : error.message);
    const kpi = (k, v, s) => h("div", { class: "stat" }, h("div", { class: "v" }, v), h("div", { class: "k" }, k), s && h("div", { class: "s" }, s));
    const list = (title, rows, val, note) => h("section", { class: "panel" },
      h("h3", null, title), note && h("p", { class: "small muted", style: "margin-top:-4px" }, note),
      rows.length ? h("ol", { class: "rank" }, rows.map(r => h("li", null,
        h("span", { class: "nm", title: r.full_name }, r.full_name), h("span", { class: "val" }, val(r)), wa(r.phone, r.full_name))))
        : h("p", { class: "muted small" }, "لا توجد بيانات بعد."));
    return [
      h("div", { class: "kpis" },
        kpi("الطلاب المسجلون", AR(D.students), `${AR(D.with_phone)} أضافوا رقم الجوال`),
        kpi("الطلاب الذين دخلوا", AR(D.active), `${AR(D.students ? Math.round(D.active * 100 / D.students) : 0)}٪ من الطلاب`),
        kpi("دخلوا اليوم", AR(D.today)),
        kpi("إجمالي مرات الدخول", AR(D.logins)),
        kpi("إجمالي الاختبارات", AR(D.tests)),
        kpi("متوسط الدرجات", D.avg == null ? "—" : AR(D.avg) + "٪")),
      h("div", { class: "tops" },
        list("الأكثر دخولًا", D.top_logins, r => `${AR(r.logins)} مرة`),
        list("الأكثر محاولات للاختبارات", D.top_tests, r => `${AR(r.tests)} اختبار`),
        list("الأعلى درجات", D.top_scores, r => `${AR(r.avg)}٪`, "حسب متوسط درجات الاختبارات"),
        list("الأدنى درجات", D.low_scores, r => `${AR(r.avg)}٪`, "يحتاجون متابعة، راسلهم من زر واتساب")),
      await testPanel(D.test || {})];
  }
  async function testPanel(T) {
    const { data: rows } = await sb.from("attempts").select("id, submitted_at, lecture_id, score, total, percent, passed")
      .eq("national_id", TEST_ID).not("submitted_at", "is", null).order("submitted_at", { ascending: false }).limit(20);
    const pc = v => v == null ? "—" : AR(v) + "٪";
    return h("section", { class: "panel test-panel", style: "margin-top:18px" },
      h("div", { class: "row", style: "justify-content:space-between" },
        h("div", null, h("h2", { style: "margin:0" }, "👁 حساب الطالب التجريبي (٠٠٠٠)"),
          h("p", { class: "small muted", style: "margin:4px 0 0" }, "حسابك لتجربة المنصة كما يراها الطالب. نتائجه هنا فقط، ولا تدخل في إحصاءات الطلاب ولا في تبويب النتائج.")),
        h("div", { class: "row" },
          h("a", { class: "btn gold", href: SCHOOL.home + "?as=" + TEST_ID, target: "_blank" }, "الدخول كطالب"),
          h("button", { class: "btn ghost", onclick: async () => {
            if (!confirm("تصفير حساب الطالب التجريبي؟ تُحذف محاولاته ومشاهداته.")) return;
            try { await resetStudent(TEST_ID, true); flash("ok", "تم تصفير حساب الطالب التجريبي."); } catch (e) { flash("err", e.message); }
          } }, "تصفير الحساب"))),
      h("div", { class: "kpis", style: "margin:14px 0" },
        h("div", { class: "stat" }, h("div", { class: "v" }, AR(T.logins || 0)), h("div", { class: "k" }, "مرات الدخول")),
        h("div", { class: "stat" }, h("div", { class: "v" }, AR(T.tests || 0)), h("div", { class: "k" }, "الاختبارات")),
        h("div", { class: "stat" }, h("div", { class: "v" }, pc(T.avg)), h("div", { class: "k" }, "المتوسط"), h("div", { class: "s" }, `أعلى ${pc(T.max)} · أدنى ${pc(T.min)}`))),
      rows && rows.length ? h("div", { class: "table-wrap" }, h("table", null,
        h("thead", null, h("tr", null, ["التاريخ", "المحاضرة", "الدرجة", "النسبة", "النتيجة"].map(x => h("th", null, x)))),
        h("tbody", null, rows.map(r => h("tr", null,
          h("td", { class: "small" }, new Date(r.submitted_at).toLocaleString("ar-SA")),
          h("td", null, AR(r.lecture_id)), h("td", null, `${AR(r.score)} من ${AR(r.total)}`), h("td", null, AR(r.percent) + "٪"),
          h("td", { class: r.passed ? "chip-pass" : "chip-fail" }, r.passed ? "اجتاز" : "يحتاج مراجعة"))))))
        : h("p", { class: "small muted", style: "margin:0" }, "لا توجد محاولات للحساب التجريبي بعد."));
  }

  // ---------- الطلاب ----------
  async function tabStudents() {
    const { count } = await sb.from("students").select("*", { count: "exact", head: true }).eq("school", SCHOOL.key).neq("national_id", TEST_ID);
    const search = h("input", { type: "text", placeholder: "ابحث بالاسم أو رقم الهوية" });
    const list = h("div");
    async function load() {
      let q = sb.from("students").select("national_id, full_name, phone, details, student_files(id, title, url, path)").eq("school", SCHOOL.key).neq("national_id", TEST_ID).order("full_name").limit(100);
      const t = search.value.trim();
      if (t) q = q.or(`full_name.ilike.%${t.replace(/[%,()]/g, "")}%,national_id.ilike.%${toLatinDigits(t).replace(/[%,()]/g, "")}%`);
      const { data, error } = await q; if (error) throw error;
      list.replaceChildren(data.length ? h("div", { class: "table-wrap" }, h("table", null,
        h("thead", null, h("tr", null, h("th", null, "الاسم"), h("th", null, "رقم الهوية"), h("th", null, "الجوال"), h("th", null, "البيانات"), h("th", null, "الملفات"), h("th", null, ""))),
        h("tbody", null, data.map(s => h("tr", null,
          h("td", null, s.full_name), h("td", null, s.national_id),
          h("td", { class: "small", style: "white-space:nowrap" }, h("div", { class: "row", style: "gap:6px;flex-wrap:nowrap" }, wa(s.phone, s.full_name), s.phone || "—",
            h("button", { class: "linkbtn", onclick: async () => {
              const v = prompt("رقم جوال الطالب (05xxxxxxxx)، اتركه فارغًا للحذف:", s.phone || ""); if (v == null) return;
              const p = toLatinDigits(v); if (p && !/^05\d{8}$/.test(p)) return flash("err", "رقم الجوال يجب أن يكون 10 أرقام ويبدأ بـ 05.");
              const { error } = await sb.from("students").update({ phone: p || null }).eq("national_id", s.national_id).eq("school", SCHOOL.key);
              error ? flash("err", error.message) : flash("ok", "تم حفظ رقم الجوال.");
            } }, "تعديل"))),
          h("td", { class: "small" }, (s.details || []).map(d => `${d.k}: ${d.v}`).join("، ")),
          h("td", { class: "small" }, (s.student_files || []).map(f => h("div", null,
            h("a", { href: f.url, target: "_blank", rel: "noopener" }, f.title), " ",
            h("button", { class: "btn ghost sm", style: "min-height:26px;padding:0 8px", "aria-label": "حذف الملف " + f.title, onclick: async () => {
              if (!confirm(`حذف الملف «${f.title}»؟`)) return;
              await sb.storage.from("student-files").remove([f.path]);
              const { error } = await sb.from("student_files").delete().eq("id", f.id);
              error ? flash("err", error.message) : flash("ok", "تم حذف الملف.");
            } }, "×")))),
          h("td", { style: "white-space:nowrap" }, h("button", { class: "btn ghost sm", onclick: async () => {
            if (!confirm(`حذف جميع اختبارات ${s.full_name}؟ تعود محاضراته مقفلة حسب طريقة الفتح، ولا يمكن التراجع.`)) return;
            const { error, count } = await sb.from("attempts").delete({ count: "exact" }).eq("national_id", s.national_id);
            error ? flash("err", error.message) : flash("ok", `تم حذف ${count ?? ""} اختبار للطالب.`);
          } }, "حذف اختباراته"), " ", h("button", { class: "btn ghost sm", title: "حذف المحاولات والمشاهدات والدخول وأماكن التوقف ورقم الجوال", onclick: async () => {
            if (!confirm(`تصفير ${s.full_name} ليبدأ من جديد؟ تُحذف محاولاته ومشاهداته وسجل دخوله وأماكن توقفه ورقم جواله، ويبقى اسمه ورقم هويته.`)) return;
            try { await resetStudent(s.national_id, true); flash("ok", `تم تصفير ${s.full_name}، وسيُطلب منه رقم الجوال عند دخوله القادم.`); } catch (e) { flash("err", e.message); }
          } }, "تصفير"), " ", h("button", { class: "btn danger sm", onclick: async () => {
            if (!confirm(`حذف الطالب ${s.full_name} ونتائجه؟`)) return;
            const { error } = await sb.from("students").delete().eq("national_id", s.national_id).eq("school", SCHOOL.key);
            error ? flash("err", error.message) : flash("ok", "تم حذف الطالب.");
          } }, "حذف")))))))
        : h("p", { class: "muted" }, t ? "لا توجد نتائج مطابقة." : "لم يُستورد أي طالب بعد. ابدأ برفع ملف الطلاب في الأعلى."));
    }
    search.addEventListener("input", () => { clearTimeout(search._t); search._t = setTimeout(load, 300); });
    await load();
    return [
      h("section", { class: "panel" },
        h("h2", null, "استيراد الطلاب من Excel"),
        h("p", { class: "small muted" }, "ارفع ملف Excel أو CSV أو PDF (مثل كشوف نور). في Excel:  سيُطلب منك تحديد عمود رقم الهوية وعمود الاسم، وكل الأعمدة الأخرى تظهر للطالب في بطاقته كما هي. في PDF: يُقرأ رقم الهوية والاسم فقط. الطالب المسجل مسبقًا تُحدَّث بياناته ولا تُحذف نتائجه."),
        h("input", { type: "file", accept: ".xlsx,.xls,.csv,.pdf", onchange: async e => {
          const f = e.target.files[0]; if (!f) return;
          try {
            if (isPdf(f)) {
              const list = PDFTools.students(await PDFTools.lines(f));
              if (!list.length) return flash("err", "لم أجد في الملف أرقام هوية من 10 خانات بجانبها أسماء. إن كان الكشف صورة ممسوحة فصدّره من نور بصيغة Excel.");
              A.importPreview = null; A.pdfStudents = { list, revW: false, revC: false }; return render();
            }
            const rows = await readSheet(f);
            if (rows.length < 2) return flash("err", "الملف لا يحتوي على بيانات بعد صف العناوين.");
            const headers = rows[0].map(cell);
            const find = re => Math.max(0, headers.findIndex(x => re.test(x)));
            A.importPreview = { headers, rows: rows.slice(1), idCol: find(/هوي|سجل|إقام|اقام|national|id/i), nameCol: find(/اسم|name/i), phoneCol: headers.findIndex(x => /جوال|هاتف|mobile|phone/i.test(x)) };
            render();
          } catch (err) { flash("err", "تعذرت قراءة الملف: " + err.message); }
        } }),
        A.importPreview && importPreview(),
        A.pdfStudents && pdfStudentsPreview()),
      studentFilesPanel(),
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
      let ph = P.phoneCol >= 0 ? toLatinDigits(r[P.phoneCol]).replace(/\.0+$/, "") : "";
      if (/^5\d{8}$/.test(ph)) ph = "0" + ph; if (/^9665\d{8}$/.test(ph)) ph = "0" + ph.slice(3);
      const rec = { national_id: nid, full_name: name, school: A.school || SCHOOL.key,
        details: P.headers.map((k, i) => ({ k: k || `عمود ${i + 1}`, v: cell(r[i]) })).filter((d, i) => i !== P.idCol && i !== P.nameCol && i !== P.phoneCol && d.v !== "") };
      if (/^05\d{8}$/.test(ph)) rec.phone = ph;
      recs.push(rec);
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

  function pdfStudentsPreview() {
    const P = A.pdfStudents;
    const recs = P.list.map(r => ({ national_id: r.national_id, full_name: PDFTools.fixName(r.full_name, P.revW, P.revC) }));
    const box = (key, label) => h("label", { class: "row small", style: "gap:6px" },
      h("input", { type: "checkbox", checked: P[key], onchange: e => { P[key] = e.target.checked; render(); } }), label);
    return h("div", { style: "margin-top:16px" },
      h("p", null, `وجدت في الملف ${recs.length} طالبًا. راجع الأسماء: إن ظهرت مقلوبة فاستخدم خياري التصحيح.`),
      h("div", { class: "row", style: "margin-bottom:10px" }, box("revW", "عكس ترتيب كلمات الاسم"), box("revC", "عكس حروف كل كلمة")),
      h("div", { class: "table-wrap", style: "margin-bottom:12px;max-height:340px;overflow:auto" }, h("table", null,
        h("thead", null, h("tr", null, h("th", null, "الاسم"), h("th", null, "رقم الهوية"))),
        h("tbody", null, recs.map(r => h("tr", null, h("td", null, r.full_name), h("td", null, r.national_id)))))),
      h("div", { class: "row" },
        h("button", { class: "btn", onclick: async e => {
          e.target.disabled = true; e.target.textContent = "جارٍ الاستيراد…";
          for (let i = 0; i < recs.length; i += 500) {
            const { error } = await sb.from("students").upsert(recs.slice(i, i + 500), { onConflict: "national_id" });
            if (error) return flash("err", "توقف الاستيراد: " + error.message);
          }
          A.pdfStudents = null; flash("ok", `تم استيراد ${recs.length} طالبًا من ملف PDF.`);
        } }, `استيراد ${recs.length} طالبًا`),
        h("button", { class: "btn ghost", onclick: () => { A.pdfStudents = null; render(); } }, "إلغاء")));
  }

  function studentFilesPanel() {
    const title = h("input", { type: "text", placeholder: "عنوان الملف (اختياري)، مثل: شهادة الفصل الأول" });
    const nid = h("input", { type: "text", inputmode: "numeric", placeholder: "رقم هوية طالب واحد (اختياري)" });
    const files = h("input", { type: "file", accept: ".pdf,application/pdf", multiple: true });
    const status = h("p", { class: "small", "aria-live": "polite" });
    return h("section", { class: "panel" },
      h("h2", null, "ملفات خاصة بكل طالب (PDF)"),
      h("p", { class: "small muted" }, "تظهر للطالب في بطاقته فقط. للرفع الجماعي سمِّ كل ملف برقم هوية صاحبه، مثل 1234567890.pdf أو 1234567890-شهادة.pdf، واختر الملفات كلها مرة واحدة. ولرفع ملف لطالب واحد اكتب رقم هويته في الخانة."),
      h("div", { class: "grid2" }, title, nid),
      h("div", { class: "row", style: "margin-top:12px" }, files,
        h("button", { class: "btn", onclick: async e => {
          const list = [...files.files]; if (!list.length) return flash("err", "اختر ملفًا واحدًا على الأقل.");
          const one = toLatinDigits(nid.value);
          e.target.disabled = true;
          const { data: studs } = one ? await sb.from("students").select("national_id").eq("school", SCHOOL.key).eq("national_id", one)
            : await sb.from("students").select("national_id").eq("school", SCHOOL.key).in("national_id", list.map(f => (toLatinDigits(f.name).match(/\d{10}/) || [""])[0]).filter(Boolean));
          const known = new Set((studs || []).map(s => s.national_id));
          if (one && !known.has(one)) { e.target.disabled = false; return flash("err", "رقم الهوية غير مسجل في الطلاب."); }
          let done = 0; const skipped = [];
          for (const f of list) {
            const id = one || (toLatinDigits(f.name).match(/\d{10}/) || [""])[0];
            if (!known.has(id)) { skipped.push(f.name); continue; }
            status.textContent = `جارٍ رفع ${done + 1} من ${list.length}…`;
            try {
              const up = await uploadPdf("student-files", id, f);
              const t = title.value.trim() || baseName(f.name).replace(/\d{10}/, "").replace(/^[\s\-–_]+|[\s\-–_]+$/g, "") || "ملف";
              const { error } = await sb.from("student_files").insert({ national_id: id, title: t, path: up.path, url: up.url });
              if (error) throw error;
              done++;
            } catch (err) { skipped.push(`${f.name} (${err.message})`); }
          }
          flash(skipped.length ? "info" : "ok", `تم رفع ${done} ملفًا.` + (skipped.length ? ` لم يُرفع: ${skipped.join("، ")}. تأكد أن اسم الملف يحتوي رقم هوية طالب مسجل.` : ""));
        } }, "رفع الملفات")),
      status);
  }

  // ---------- الأسئلة ----------
  async function tabQuestions() {
    const { data: counts } = await sb.from("questions").select("lecture_id").eq("active", true);
    const per = {}; (counts || []).forEach(r => { per[r.lecture_id] = (per[r.lecture_id] || 0) + 1; });
    const { data: qs, error } = await sb.from("questions").select("*").eq("lecture_id", A.qLecture).order("id");
    if (error) throw error;
    const lsel = h("select", { onchange: e => { A.qLecture = +e.target.value; A.editQ = null; render(); } },
      A.lectures.map(l => h("option", { value: String(l.id), selected: l.id === A.qLecture }, `${l.section === "verbal" ? "لفظي: " : ""}${l.title}${l.topic ? " — " + l.topic : ""} (${per[l.id] || 0} سؤال)`)));

    return [
      h("section", { class: "panel" },
        h("h2", null, "استيراد الأسئلة من Excel"),
        h("p", { class: "small muted" }, "من PDF: اكتب كل سؤال برقمه، ثم الخيارات أ) ب) ج) د)، ثم «الإجابة: ب»، ثم «الشرح: ...» اختياريًا. وضع سطر «المحاضرة 3» قبل أسئلة كل محاضرة، وإلا أُضيفت للمحاضرة المختارة في الأسفل. ستظهر لك معاينة قبل الإضافة."),
        h("p", { class: "small muted" }, "من Excel: الأعمدة بالترتيب: رقم المحاضرة، السؤال، الخيار أ، الخيار ب، الخيار ج، الخيار د، الإجابة الصحيحة (أ أو ب أو ج أو د)، الشرح. يكفي ملف واحد لكل المحاضرات. اجعل لكل محاضرة ضعف عدد أسئلة الاختبار على الأقل حتى تتغير الأسئلة بين المحاولات."),
        h("div", { class: "row" },
          h("button", { class: "btn ghost", onclick: () => {
            const ws = XLSX.utils.aoa_to_sheet([["رقم المحاضرة", "السؤال", "أ", "ب", "ج", "د", "الإجابة", "الشرح"],
              [1, "ما ناتج ٣ + ٤ × ٢ ؟", "14", "11", "10", "9", "ب", "الضرب قبل الجمع: ٤ × ٢ = ٨ ثم ٨ + ٣ = ١١"]]);
            const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "الأسئلة"); XLSX.writeFile(wb, "قالب-الأسئلة.xlsx");
          } }, "تنزيل قالب الأسئلة"),
          h("input", { type: "file", accept: ".xlsx,.xls,.csv,.pdf", onchange: async e => {
            const f = e.target.files[0]; if (!f) return;
            try {
              if (isPdf(f)) {
                const r = PDFTools.questions(await PDFTools.lines(f), A.qLecture);
                const ids = new Set(A.lectures.map(l => l.id));
                const okL = r.ok.filter(q => ids.has(q.lecture_id)), badL = r.ok.filter(q => !ids.has(q.lecture_id));
                A.qPreview = { ok: okL.map(({ num, ...q }) => q), bad: [...r.bad, ...badL].map(q => ({ row: "سؤال " + q.num })), sample: okL.slice(0, 3) };
                if (!r.blocks) return flash("err", "لم أجد أسئلة مرقّمة في الملف. تأكد أن كل سؤال يبدأ برقمه مثل «1) ...».");
              } else A.qPreview = parseQuestions(await readSheet(f));
              render();
            } catch (err) { flash("err", "تعذرت قراءة الملف: " + err.message); }
          } })),
        A.qPreview && h("div", { style: "margin-top:14px" },
          h("p", null, `جاهز للإضافة: ${A.qPreview.ok.length} سؤالًا.` + (A.qPreview.bad.length ? ` صفوف بها خطأ: ${A.qPreview.bad.map(b => b.row).join("، ")}. (رقم محاضرة غير موجود، أو سؤال بلا خيارين، أو إجابة غير محددة)` : "")),
          A.qPreview.sample && A.qPreview.sample.length > 0 && h("ol", { class: "review", style: "margin-bottom:12px" }, A.qPreview.sample.map(q => h("li", null,
            h("div", { class: "small muted" }, "المحاضرة " + q.lecture_id),
            h("div", { style: "font-weight:600" }, q.body),
            h("p", { class: "a" }, q.options.map((o, i) => `${LETTERS[i]}) ${o}${i === q.correct ? " ✓" : ""}`).join("    "))))),
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
  // يقبل رابط يوتيوب أو رابط ملف فيديو مباشر أو رابط Google Drive
  function parseSource(link) {
    const t = String(link || "").trim(); if (!t) return null;
    let m = t.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/) || (/^[\w-]{11}$/.test(t) && [0, t]);
    if (m) return { youtube_id: m[1] };
    m = t.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]{20,})/); if (m) return { drive_id: m[1] };
    if (/^https?:\/\/.+\.(mp4|webm|m4v|mov)(\?.*)?$/i.test(t) || /^https:\/\/.+\/storage\/v1\/object\/public\//.test(t)) return { url: t };
    return null;
  }
  const srcLabel = p => p.youtube_id ? "يوتيوب ✓ (حفظ بالثانية)" : p.url ? "ملف فيديو ✓ (حفظ بالثانية)" : p.drive_id ? "Google Drive (حفظ تقريبي)" : "بلا مقطع";
  const srcLink = p => p.youtube_id ? `https://youtu.be/${p.youtube_id}` : p.url || (p.drive_id ? `https://drive.google.com/file/d/${p.drive_id}/view` : "");
  async function saveLecture(l, patch) {
    const { error } = await sb.from("lectures").update(patch).eq("id", l.id);
    if (error) throw error; Object.assign(l, patch);
  }
  async function tabLectures() {
    const sec = A.lsec || "quant";
    const list = A.lectures.filter(l => (l.section || "quant") === sec);
    const bulk = h("textarea", { placeholder: "كل سطر: رقم المحاضرة ثم الرابط\nمثال:\n1 https://youtu.be/xxxxxxxxxxx\n24-2 https://youtu.be/yyyyyyyyyyy   (الجزء الثاني من المحاضرة 24)", style: "min-height:120px;direction:ltr;text-align:left" });
    return [
      h("div", { class: "seg", role: "group", "aria-label": "القسم", style: "margin-bottom:14px" },
        [["quant", "القسم الكمي"], ["verbal", "القسم اللفظي"]].map(([k, t]) => h("button", { "aria-pressed": String(sec === k), onclick: () => { A.lsec = k; render(); } }, t))),
      h("section", { class: "panel" },
        h("h2", null, "ربط المقاطع بروابط يوتيوب أو ملفات فيديو (دفعة واحدة)"),
        h("p", { class: "small muted" }, "لحفظ مكان توقف الطالب بالثانية الفعلية، اربط كل مقطع برابط يوتيوب (يُفضَّل «غير مدرج») أو برابط ملف فيديو مباشر. الصق الروابط هنا: كل سطر فيه رقم المحاضرة ثم الرابط. للجزء الثاني اكتب 24-2."),
        bulk,
        h("div", { class: "row", style: "margin-top:10px" }, h("button", { class: "btn", onclick: async e => {
          const lines = bulk.value.split(/\n+/).map(x => x.trim()).filter(Boolean); if (!lines.length) return;
          e.target.disabled = true; let ok = 0; const bad = [];
          for (const line of lines) {
            const m = toLatinDigits(line.split(/\s+/)[0]).match(/^(\d+)(?:-(\d+))?$/);
            const src = parseSource(line.split(/\s+/).slice(1).join(" "));
            const n = m ? +m[1] : 0, id = sec === "verbal" && n < 1000 ? n + 1000 : n;
            let l = A.lectures.find(x => x.id === id);
            if (m && src && !l && (sec === "verbal" || id < 1000)) {
              // المحاضرة غير موجودة بعد: ننشئها تلقائيًا في القسم الحالي
              const row = { id, title: `المحاضرة ${n}`, topic: "", parts: [], section: sec };
              const { error } = await sb.from("lectures").insert(row);
              if (!error) { A.lectures.push(row); A.lectures.sort((x, y) => x.id - y.id); l = row; }
            }
            if (!m || !src || !l) { bad.push(line.slice(0, 40)); continue; }
            const pi = m[2] ? +m[2] - 1 : 0, parts = [...(l.parts || [])];
            while (parts.length <= pi) parts.push({ label: parts.length ? `الجزء ${["الأول", "الثاني", "الثالث", "الرابع"][parts.length] || parts.length + 1}` : "المحاضرة" });
            const keep = { label: parts[pi].label }; parts[pi] = { ...keep, ...src, ...(parts[pi].drive_id && !src.drive_id ? { drive_id: parts[pi].drive_id } : {}) };
            try { await saveLecture(l, { parts }); ok++; } catch (err) { bad.push(line.slice(0, 40) + " (" + err.message + ")"); }
          }
          flash(bad.length ? "info" : "ok", `تم ربط ${ok} مقطع.` + (bad.length ? ` لم يُقرأ: ${bad.join("، ")}` : ""));
        } }, "حفظ الروابط"))),
      h("section", { class: "panel" },
        h("div", { class: "row", style: "justify-content:space-between" },
          h("h2", { style: "margin:0" }, `محاضرات ${sec === "verbal" ? "القسم اللفظي" : "القسم الكمي"} (${list.length})`),
          h("button", { class: "btn gold sm", onclick: async () => {
            const base = sec === "verbal" ? 1000 : 0;
            const nextId = Math.max(base, ...A.lectures.filter(l => (l.section || "quant") === sec).map(l => l.id)) + 1;
            if (sec === "quant" && nextId > 999) return flash("err", "وصلت للحد الأعلى لأرقام القسم الكمي.");
            const row = { id: nextId, title: `المحاضرة ${nextId - base}`, topic: "", parts: [], section: sec };
            const { error } = await sb.from("lectures").insert(row);
            if (error) return flash("err", error.message);
            A.lectures.push(row); A.lectures.sort((a, b) => a.id - b.id); flash("ok", `أضيفت ${row.title}. اربطها بمقطع من الأعلى أو من خانة الرابط.`);
          } }, "+ إضافة محاضرة")),
        h("p", { class: "small muted" }, "أضف ملزمة PDF لأي محاضرة فتظهر للطالب بجانب المقطع. وعدّل عنوان كل محاضرة وموضوعها ليظهر في بطاقتها."),
        list.length ? h("div", { class: "table-wrap" }, h("table", null,
          h("thead", null, h("tr", null, h("th", null, "رقم"), h("th", null, "العنوان والموضوع"), h("th", null, "المقاطع"), h("th", null, "ملفات PDF"), h("th", null, ""))),
          h("tbody", null, list.map(l => {
            const t = h("input", { type: "text" }); t.value = l.title;
            const tp = h("input", { type: "text", placeholder: "موضوع المحاضرة", style: "margin-top:6px" }); tp.value = l.topic || "";
            const partRows = (l.parts || []).map((p, i) => {
              const inp = h("input", { type: "text", placeholder: "رابط يوتيوب أو ملف فيديو", style: "direction:ltr;min-height:36px" }); inp.value = srcLink(p);
              return h("div", { style: "margin-bottom:8px" },
                h("div", { class: "small" }, h("strong", null, p.label || `الجزء ${i + 1}`), " · ", h("span", { class: p.youtube_id || p.url ? "chip-pass" : "muted" }, srcLabel(p)),
                  p.file_name ? h("span", { class: "muted" }, ` · الملف: ${p.file_name}`) : null,
                  p.url ? [" · ", h("a", { href: p.url, target: "_blank", rel: "noopener" }, "معاينة")] : null,
                  p.url && p.drive_id ? [" · ", h("button", { class: "linkbtn", onclick: async () => {
                    if (!confirm(`إزالة المقطع المرفوع من ${l.title} (${sec === "verbal" ? "القسم اللفظي" : "القسم الكمي"}) والعودة لمقطع Google Drive الأصلي؟`)) return;
                    try {
                      if (p.video_path) await sb.storage.from("lecture-videos").remove([p.video_path]);
                      const parts = [...l.parts]; parts[i] = { label: p.label, drive_id: p.drive_id };
                      await saveLecture(l, { parts }); flash("ok", `أُزيل المقطع المرفوع من ${l.title} وعاد مقطع Drive.`);
                    } catch (err) { flash("err", err.message); }
                  } }, "إزالة المقطع المرفوع")] : null),
                h("div", { class: "row", style: "gap:6px;flex-wrap:nowrap" }, inp,
                  h("button", { class: "btn ghost sm", onclick: async () => {
                    const src = parseSource(inp.value); if (!src) return flash("err", "الرابط غير معروف. استخدم رابط يوتيوب أو رابط ملف فيديو مباشر.");
                    const parts = [...l.parts]; parts[i] = { label: p.label, ...src, ...(p.drive_id && !src.drive_id ? { drive_id: p.drive_id } : {}) };
                    try { await saveLecture(l, { parts }); flash("ok", `تم ربط ${l.title}.`); } catch (err) { flash("err", err.message); }
                  } }, "حفظ"),
                  h("label", { class: "btn gold sm", title: "رفع ملف فيديو MP4 مباشرة إلى المنصة" }, "⬆ رفع فيديو",
                    h("input", { type: "file", accept: "video/mp4,video/webm,.mp4,.webm", style: "display:none", onchange: async e => {
                      const f = e.target.files[0]; if (!f) return;
                      if (!/\.(mp4|webm)$/i.test(f.name) && !/^video\/(mp4|webm)$/.test(f.type)) return flash("err", "اختر ملف فيديو بصيغة MP4.");
                      if (f.size > 200 * 1024 * 1024) return flash("err", "حجم الملف أكبر من 200 ميجابايت. استخدم النسخة المضغوطة.");
                      // حماية من رفع ملف إلى محاضرة أو قسم غير مقصود (أسماء ملفاتنا: lecture-05.mp4 للكمي و verbal-05.mp4 للفظي)
                      const num = sec === "verbal" ? l.id - 1000 : l.id, secName = sec === "verbal" ? "القسم اللفظي" : "القسم الكمي";
                      const m = f.name.match(/(lecture|verbal)-0*(\d+)/i);
                      let warn = "";
                      if (m) {
                        const fs = m[1].toLowerCase() === "verbal" ? "verbal" : "quant", fn = Number(m[2]);
                        if (fs !== sec) warn += `\n⚠️ تنبيه: الملف يخص ${fs === "verbal" ? "القسم اللفظي" : "القسم الكمي"} وأنت في ${secName}!`;
                        if (fn !== num) warn += `\n⚠️ تنبيه: رقم الملف (${fn}) لا يطابق رقم المحاضرة (${num})!`;
                      }
                      if (!confirm(`رفع الملف «${f.name}» إلى ${l.title} في ${secName}؟${warn}`)) { e.target.value = ""; return; }
                      const lab = e.target.parentElement; lab.firstChild.textContent = "جارٍ الرفع… لا تغلق الصفحة";
                      try {
                        const path = `lec-${l.id}/part-${i + 1}-${uid()}.${/webm$/i.test(f.name) ? "webm" : "mp4"}`;
                        const { error } = await sb.storage.from("lecture-videos").upload(path, f, { contentType: f.type || "video/mp4", cacheControl: "31536000", upsert: false });
                        if (error) throw new Error(/Bucket not found/i.test(error.message) ? "شغّل ملف update-v10.sql في Supabase أولًا." : /exceeded|too large|maximum/i.test(error.message) ? "حجم الملف أكبر من الحد المسموح في Supabase. ارفع حد حجم الملفات من إعدادات Storage." : error.message);
                        const url = sb.storage.from("lecture-videos").getPublicUrl(path).data.publicUrl;
                        if (p.video_path) await sb.storage.from("lecture-videos").remove([p.video_path]);
                        const parts = [...l.parts]; parts[i] = { label: p.label, url, video_path: path, file_name: f.name, ...(p.drive_id ? { drive_id: p.drive_id } : {}) };
                        await saveLecture(l, { parts }); flash("ok", `تم رفع مقطع ${l.title} وربطه بالمنصة.`);
                      } catch (err) { lab.firstChild.textContent = "⬆ رفع فيديو"; flash("err", err.message); }
                    } }))));
            });
            if (!(l.parts || []).length) {
              const inp = h("input", { type: "text", placeholder: "رابط المقطع", style: "direction:ltr;min-height:36px" });
              partRows.push(h("div", { class: "row", style: "gap:6px;flex-wrap:nowrap" }, inp, h("button", { class: "btn ghost sm", onclick: async () => {
                const src = parseSource(inp.value); if (!src) return flash("err", "الرابط غير معروف.");
                try { await saveLecture(l, { parts: [{ label: "المحاضرة", ...src }] }); flash("ok", "تم الربط."); } catch (err) { flash("err", err.message); }
              } }, "حفظ")));
            }
            return h("tr", null, h("td", null, l.id > 1000 ? l.id - 1000 : l.id),
              h("td", { style: "min-width:200px" }, t, tp),
              h("td", { style: "min-width:300px" }, partRows),
              h("td", { class: "small", style: "min-width:180px" },
                (l.files || []).map((f, i) => h("div", null,
                  h("a", { href: f.url, target: "_blank", rel: "noopener" }, f.name), " ",
                  h("button", { class: "btn ghost sm", style: "min-height:26px;padding:0 8px", "aria-label": "حذف " + f.name, onclick: async () => {
                    if (!confirm(`حذف «${f.name}» من ${l.title}؟`)) return;
                    const files = l.files.filter((_, j) => j !== i);
                    try { await saveLecture(l, { files }); await sb.storage.from("lecture-files").remove([f.path]); render(); } catch (err) { flash("err", err.message); }
                  } }, "×"))),
                h("label", { class: "btn ghost sm", style: "margin-top:4px" }, "إضافة PDF",
                  h("input", { type: "file", accept: ".pdf,application/pdf", multiple: true, style: "display:none", onchange: async e => {
                    const fl = [...e.target.files]; if (!fl.length) return;
                    try {
                      const added = [];
                      for (const f of fl) { const up = await uploadPdf("lecture-files", "lec-" + l.id, f); added.push({ name: baseName(f.name), ...up }); }
                      await saveLecture(l, { files: [...(l.files || []), ...added] }); flash("ok", `تمت إضافة ${added.length} ملف إلى ${l.title}.`);
                    } catch (err) { flash("err", err.message); }
                  } }))),
              h("td", null, h("button", { class: "btn sm", onclick: async e => {
                try { await saveLecture(l, { title: t.value.trim() || l.title, topic: tp.value.trim() }); e.target.textContent = "تم الحفظ"; setTimeout(() => { e.target.textContent = "حفظ"; }, 1500); }
                catch (err) { flash("err", err.message); }
              } }, "حفظ")));
          })))) : h("p", { class: "muted" }, "لا توجد محاضرات في هذا القسم بعد. اضغط «+ إضافة محاضرة» ثم اربطها بمقطع."))];
  }

  // ---------- النتائج ----------
  // ---------- الشهادات ----------
  const PLATFORM_URL = () => location.origin + location.pathname.replace(/admin\.html.*$/, "") + (SCHOOL.key === "andalus" ? "" : SCHOOL.home);
  const intlPhone = p => { p = String(p || "").replace(/\D/g, ""); return p.startsWith("05") ? "966" + p.slice(1) : p.startsWith("5") && p.length === 9 ? "966" + p : p; };
  function certMsg(c, name) {
    const sc = CERT.school(c.school), first = (name || "").trim().split(/\s+/)[0];
    return `السلام عليكم ${first} 🌟\nمبارك! ${sc.female ? "صدرت لكِ" : "صدرت لك"} «${c.title}» من ${sc.name}، تقديرًا ${sc.female ? "لتميّزكِ" : "لتميّزك"} في منصة التأسيس والتدريب لاختبار القدرات العامة.\n${sc.female ? "ادخلي" : "ادخل"} صفحتك في المنصة برقم الهوية لاستعراض الشهادة وتحميلها وطباعتها:\n${PLATFORM_URL()}\n\nمع خالص التهاني 🎉`;
  }
  function waQueue(items) {
    // items: [{ name, phone, text }]
    const list = items.filter(x => x.phone), skipped = items.length - list.length; let i = 0;
    const box = h("div", { class: "wa-queue" });
    const draw = () => {
      if (i >= list.length) return box.replaceChildren(h("strong", null, `✓ انتهى الإرسال (${AR(list.length)} ${list.length >= 3 && list.length <= 10 ? "رسائل" : "رسالة"}).`), skipped ? h("p", { class: "small muted", style: "margin:6px 0 0" }, `${AR(skipped)} بلا رقم جوال، لم تُرسل لهم.`) : null);
      const x = list[i];
      box.replaceChildren(
        h("div", { class: "row", style: "justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap" },
          h("div", null, h("strong", null, `الرسالة ${AR(i + 1)} من ${AR(list.length)}: `), x.name, h("span", { class: "muted small" }, " · " + AR(x.phone))),
          h("div", { class: "row", style: "gap:8px" },
            h("a", { class: "btn sm", style: "background:#25d366;border-color:#25d366", target: "_blank", rel: "noopener", href: `https://wa.me/${intlPhone(x.phone)}?text=${encodeURIComponent(x.text)}`, onclick: () => setTimeout(() => { i++; draw(); }, 400) }, "إرسال عبر واتساب ←"),
            h("button", { class: "btn ghost sm", onclick: () => { i++; draw(); } }, "تخطي"))),
        h("p", { class: "small muted", style: "margin:8px 0 0" }, "يفتح واتساب برسالة جاهزة؛ اضغط «إرسال» هناك ثم عد لهذه الصفحة، فيظهر الطالب التالي تلقائيًا." + (skipped ? ` (${AR(skipped)} بلا رقم جوال سيُتخطّون)` : "")));
    };
    draw(); return box;
  }
  async function tabCerts() {
    const C = A.cert ||= { school: "all", kind: "attend", minW: 0, minP: 0, sel: new Set(), q: "", custom: false, text: "", queue: null, note: null };
    const { data: rows0, error } = await sb.rpc("admin_cert_stats"); const rows = (rows0 || []).filter(r => (r.school || "andalus") === SCHOOL.key);
    if (error) throw new Error(/admin_cert_stats/.test(error.message) ? "شغّل ملف update-v16.sql في Supabase أولًا." : error.message);
    const { data: issued } = await sb.from("certificates").select("id, national_id, kind, title, body, school, issued_at, seen_at, stats, students(full_name, phone)").eq("school", SCHOOL.key).order("issued_at", { ascending: false }).limit(60);
    const wrap = h("div");
    const draw = () => {
      const shown = rows.filter(r => (C.school === "all" || r.school === C.school) && r.watched >= C.minW && r.passed >= C.minP && (!C.q || r.full_name.includes(C.q) || r.national_id.includes(toLatinDigits(C.q))));
      const selRows = rows.filter(r => C.sel.has(r.national_id));
      const tplFor = (sc, r) => C.custom && C.text.trim() ? C.text : CERT.KINDS[C.kind].text(CERT.school(sc), r ? { watched: r.watched, passed: r.passed, avg: r.avg_best } : { watched: "{المحاضرات}", passed: "{الاختبارات}", avg: "{المتوسط}" });
      const fill = (t, r) => t.replace(/\{المحاضرات\}/g, CERT.AR(r.watched)).replace(/\{الاختبارات\}/g, CERT.AR(r.passed)).replace(/\{المتوسط\}/g, CERT.AR(r.avg_best ?? 0));
      const pv = selRows[0] || shown[0];
      const prev = h("div", { class: "cert-prev" }); if (pv) prev.innerHTML = CERT.svg({ title: CERT.KINDS[C.kind].title, body: fill(tplFor(pv.school, pv), pv), school: pv.school, issued_at: new Date().toISOString(), id: "00000000", full_name: pv.full_name });
      const chkAll = h("input", { type: "checkbox", checked: shown.length > 0 && shown.every(r => C.sel.has(r.national_id)), onchange: e => { shown.forEach(r => e.target.checked ? C.sel.add(r.national_id) : C.sel.delete(r.national_id)); draw(); } });
      const num = (v, f) => h("input", { type: "number", min: 0, value: v, style: "width:80px", onchange: e => { f(Math.max(0, +e.target.value || 0)); draw(); } });
      wrap.replaceChildren(
        h("section", { class: "panel" },
          h("h2", null, "١. نوع الشهادة"),
          h("div", { class: "row", style: "gap:10px;flex-wrap:wrap" }, Object.entries(CERT.KINDS).map(([k, v]) =>
            h("label", { class: "chip-opt" + (C.kind === k ? " on" : ""), style: "cursor:pointer;padding:8px 14px;border:1.5px solid " + (C.kind === k ? "#1f6f78" : "#ddd") + ";border-radius:12px;background:" + (C.kind === k ? "#e8f4f5" : "#fff") },
              h("input", { type: "radio", name: "ck", checked: C.kind === k, onchange: () => { C.kind = k; if (k === "attend" && !C.minW) C.minW = 0; draw(); }, style: "margin-inline-end:6px" }), v.label))),
          h("label", { class: "row small", style: "gap:6px;margin-top:10px" }, h("input", { type: "checkbox", checked: C.custom, onchange: e => { C.custom = e.target.checked; if (C.custom && !C.text) C.text = tplFor("andalus"); draw(); } }), "تعديل نص الشهادة"),
          C.custom && h("div", null, h("textarea", { rows: 4, style: "width:100%", oninput: e => { C.text = e.target.value; }, onchange: () => draw() }, C.text),
            h("p", { class: "small muted", style: "margin:4px 0 0" }, "يمكنك استخدام: {الاسم} {المحاضرات} {الاختبارات} {المتوسط} وتُستبدل تلقائيًا لكل طالب.")),
          h("h3", { style: "margin:14px 0 6px" }, "معاينة"), pv ? prev : h("p", { class: "muted" }, "حدد طالبًا لمعاينة شهادته.")),
        h("section", { class: "panel" },
          h("h2", null, "٢. اختيار الطلاب"),
          h("div", { class: "row", style: "gap:12px;flex-wrap:wrap;align-items:end" },

            h("label", { class: "field" }, h("span", null, "أقل عدد محاضرات مشاهدة"), num(C.minW, v => C.minW = v)),
            h("label", { class: "field" }, h("span", null, "أقل عدد اختبارات مجتازة"), num(C.minP, v => C.minP = v)),
            h("label", { class: "field" }, h("span", null, "بحث"), h("input", { type: "text", value: C.q, placeholder: "الاسم أو الهوية", onchange: e => { C.q = e.target.value.trim(); draw(); } })),
            h("button", { class: "btn ghost sm", onclick: () => { C.sel = new Set(); draw(); } }, "إلغاء التحديد")),
          h("p", { class: "small muted" }, `يظهر ${AR(shown.length)} طالبًا، والمحدد ${AR(C.sel.size)}. الترتيب حسب الاختبارات المجتازة ثم المحاضرات.`),
          h("div", { class: "table-wrap", style: "max-height:420px;overflow:auto" }, h("table", { class: "cert-pick" },
            h("thead", null, h("tr", null, h("th", null, chkAll), h("th", null, "الاسم"), h("th", null, "محاضرات مشاهدة"), h("th", null, "اختبارات مجتازة"), h("th", null, "متوسط أفضل الدرجات"), h("th", null, "شهاداته"), h("th", null, "الجوال"))),
            h("tbody", null, shown.slice(0, 400).map(r => h("tr", null,
              h("td", null, h("input", { type: "checkbox", checked: C.sel.has(r.national_id), onchange: e => { e.target.checked ? C.sel.add(r.national_id) : C.sel.delete(r.national_id); draw(); } })),
              h("td", null, r.full_name),
              h("td", null, AR(r.watched)), h("td", null, AR(r.passed)), h("td", null, r.avg_best != null ? AR(r.avg_best) + "٪" : "—"), h("td", null, AR(r.certs)),
              h("td", { class: "small" }, r.phone ? AR(r.phone) : h("span", { class: "muted" }, "—")))))))),
        h("section", { class: "panel" },
          h("h2", null, "٣. الإصدار والإرسال"),
          C.note && h("div", { class: "alert " + C.note.type }, C.note.text),
          h("div", { class: "row", style: "gap:10px;flex-wrap:wrap" },
            h("button", { class: "btn gold", disabled: !C.sel.size, onclick: async e => {
              if (!confirm(`إصدار «${CERT.KINDS[C.kind].title}» لـ ${AR(C.sel.size)} من الطلاب وإرسالها إلى صفحاتهم؟`)) return;
              e.target.disabled = true;
              const recs = selRows.map(r => ({ national_id: r.national_id, kind: C.kind, title: CERT.KINDS[C.kind].title, body: fill(tplFor(r.school, r), r), school: r.school, stats: { watched: r.watched, passed: r.passed, avg: r.avg_best } }));
              const { data: ins, error } = await sb.from("certificates").insert(recs).select("id, national_id, title, school");
              if (error) { C.note = { type: "err", text: error.message }; return draw(); }
              rows.forEach(r => { if (C.sel.has(r.national_id)) r.certs++; });
              C.queue = ins.map(c => { const r = rows.find(x => x.national_id === c.national_id); return { name: r.full_name, phone: r.phone, text: certMsg(c, r.full_name) }; });
              C.note = { type: "ok", text: `✓ صدرت ${AR(ins.length)} شهادة، وظهرت في صفحات الطلاب مع إشعار تهنئة عند دخولهم. أرسل لهم رسائل واتساب من الأسفل.` };
              C.sel = new Set(); draw();
            } }, `🏅 إصدار الشهادة للمحددين (${AR(C.sel.size)})`)),
          C.queue && C.queue.length ? waQueue(C.queue) : null),
        h("section", { class: "panel" },
          h("h2", null, "الشهادات الصادرة مؤخرًا"),
          (issued || []).length ? h("div", { class: "table-wrap" }, h("table", null,
            h("thead", null, h("tr", null, h("th", null, "الطالب"), h("th", null, "الشهادة"), h("th", null, "التاريخ"), h("th", null, "اطّلع عليها"), h("th", null, ""))),
            h("tbody", null, issued.map(c => h("tr", null,
              h("td", null, c.students ? c.students.full_name : c.national_id), h("td", null, c.title),
              h("td", { class: "small" }, CERT.fmtDate(c.issued_at).hij), h("td", null, c.seen_at ? "✓" : "—"),
              h("td", { style: "white-space:nowrap" },
                h("button", { class: "linkbtn", onclick: () => { const w = h("div", { class: "cert-modal", onclick: e => { if (e.target === w) w.remove(); } }, h("div", { class: "cert-view" }, (() => { const d = h("div", { class: "cert-art" }); d.innerHTML = CERT.svg({ ...c, full_name: c.students && c.students.full_name }); return d; })(), h("div", { class: "row", style: "justify-content:center;gap:10px;margin-top:10px" }, h("button", { class: "btn", onclick: () => CERT.print({ ...c, full_name: c.students && c.students.full_name }) }, "🖨 طباعة"), h("button", { class: "btn ghost", onclick: () => w.remove() }, "إغلاق")))); document.body.append(w); } }, "عرض"), " · ",
                c.students && c.students.phone ? wa(c.students.phone, c.students.full_name, certMsg(c, c.students.full_name)) : null, " · ",
                h("button", { class: "linkbtn", style: "color:#c0392b", onclick: async () => { if (!confirm("حذف هذه الشهادة من صفحة الطالب؟")) return; const { error } = await sb.from("certificates").delete().eq("id", c.id); if (error) { C.note = { type: "err", text: error.message }; return draw(); } issued.splice(issued.indexOf(c), 1); draw(); } }, "حذف"))))))) : h("p", { class: "muted", style: "margin:0" }, "لم تصدر شهادات بعد.")));
    };
    draw(); return wrap;
  }

  // ---------- الاختبارات التي ينشئها المعلم ----------
  const BASE_URL = () => location.origin + location.pathname.replace(/admin\.html.*$/, "");
  const SQ = () => SCHOOL.key === "andalus" ? "" : "&s=" + SCHOOL.key;
  const examLink = c => `${BASE_URL()}exam.html?c=${c}${SQ()}`, resultLink = c => `${BASE_URL()}exam.html?r=${c}${SQ()}`;
  const qrSrc = text => { try { if (window.qrcode) { const q = qrcode(0, "M"); q.addData(text); q.make(); return q.createDataURL(6, 8); } } catch {} return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(text)}`; };
  const newCode = () => Array.from({ length: 6 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("");
  function printDoc(title, inner) {
    const w = window.open("", "_blank"); if (!w) return alert("اسمح بالنوافذ المنبثقة للطباعة.");
    w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${CTEST.esc(title)}</title><link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="${BASE_URL()}styles.css"><style>body{background:#fff;font-family:Tajawal,Tahoma,sans-serif;padding:18px 28px;color:#111}h1{font-size:22px;margin:4px 0}h2{font-size:18px;border-bottom:2px solid #1f6f78;padding-bottom:4px;margin-top:22px;page-break-after:avoid}.q{page-break-inside:avoid;margin:10px 0 14px}.q .b{font-weight:600;line-height:1.9}.o{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin:6px 18px 0}.top{display:flex;justify-content:space-between;align-items:center;border-bottom:3px double #c9a54a;padding-bottom:8px}.top img{height:64px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:5px 8px;text-align:center}.bub{display:inline-block;width:22px;height:22px;border:1.5px solid #333;border-radius:50%;line-height:20px;margin:0 3px;font-size:12px}@page{size:A4;margin:12mm}</style></head><body>${inner}<script>setTimeout(()=>print(),900)<\/script></body></html>`);
    w.document.close();
  }
  const examHead = (e, sub) => `<div class="top"><div><strong>المملكة العربية السعودية — وزارة التعليم</strong><br>${CTEST.esc(CERT.school(e.school).name)}</div><div style="text-align:center"><h1>${CTEST.esc(e.title)}</h1><div>${sub}</div></div><img src="${BASE_URL()}${CERT.school(e.school).logo}"></div><p>اسم ${e.school === "asma" ? "الطالبة" : "الطالب"}: ........................................ &nbsp; رقم الهوية: .......................... &nbsp; رمز الاختبار: <strong>${e.code}</strong></p>`;
  function printBooklet(e) {
    const T = CTEST.toHtml, L = CTEST.LETTERS;
    printDoc(e.title, examHead(e, "كراسة الأسئلة · " + CTEST.LEVELS[e.level]) + e.sections.map(s => `<h2>${CTEST.esc(s.name)} — ${CTEST.AR(s.questions.length)} سؤالًا — الزمن ${CTEST.AR(s.minutes)} دقيقة</h2>` + s.questions.map((q, i) => `<div class="q"><div class="b">${CTEST.AR(i + 1)}) ${T(q.body)}</div><div class="o">${q.options.map((o, j) => `<div>${L[j]}) ${T(o)}</div>`).join("")}</div></div>`).join("")).join(""));
  }
  function printKey(e) {
    const T = CTEST.toHtml, L = CTEST.LETTERS;
    printDoc("مفتاح " + e.title, examHead(e, "مفتاح الإجابات (للمعلم)").replace(/<p>اسم.*?<\/p>/, "") + e.sections.map(s => `<h2>${CTEST.esc(s.name)}</h2><table><tr>${s.questions.map((q, i) => `<td><b>${CTEST.AR(i + 1)}</b><br>${L[q.correct]}</td>`).join("")}</tr></table>` + s.questions.map((q, i) => `<div class="q"><div class="b">${CTEST.AR(i + 1)}) ${T(q.body)} <span style="color:#1e8449">← ${L[q.correct]}) ${T(q.options[q.correct])}</span></div><ol style="margin:4px 20px;font-size:14px">${(q.steps || []).map(st => `<li>${T(st)}</li>`).join("")}</ol><div style="font-size:12px;color:#666">المهارة: ${CTEST.esc(q.skill)} · ${CTEST.esc(q.ltitle)}</div></div>`).join("")).join(""));
  }
  function printSheet(e) {
    printDoc("ورقة إجابة " + e.title, examHead(e, "ورقة الإجابة") + e.sections.map(s => `<h2>${CTEST.esc(s.name)}</h2><table>${s.questions.map((q, i) => `<tr><td style="width:50px"><b>${CTEST.AR(i + 1)}</b></td><td>${CTEST.LETTERS.map(l => `<span class="bub">${l}</span>`).join("")}</td></tr>`).join("")}</table>`).join("") + `<p style="margin-top:20px;font-size:13px">ظلّل دائرة واحدة لكل سؤال. للاستعلام عن النتيجة بعد رصدها: ${resultLink(e.code)}</p>`);
  }
  async function tabCtests() {
    const T = A.ct ||= { title: "", delivery: "computer", level: 0, school: "andalus", q: { count: 24, sections: 1, minutes: 25 }, v: { count: 24, sections: 1, minutes: 25 }, sel: new Set(), note: null, open: null };
    const { data: lecs, error } = await sb.from("lectures").select("id, section, title, topic").order("id");
    if (error) throw error;
    const { data: exams, error: e2 } = await sb.from("custom_exams").select("id, code, title, school, delivery, level, sections, is_open, created_at, custom_results(count)").eq("school", SCHOOL.key).order("created_at", { ascending: false });
    if (e2) throw new Error(/custom_exams/.test(e2.message) ? "شغّل ملف update-v17.sql في Supabase أولًا." : e2.message);
    const wrap = h("div");
    const has = l => !!(window.EXAMS && window.EXAMS[l.id]);
    const draw = () => {
      const num = (o, k, min, max) => h("input", { type: "number", min, max, value: o[k], style: "width:90px", onchange: ev => { o[k] = Math.max(min, Math.min(max, +ev.target.value || 0)); draw(); } });
      const picker = sec => {
        const ls = lecs.filter(l => (l.section || "quant") === sec), U = sec === "verbal" ? 2 : 5, units = [];
        ls.forEach((l, i) => { (units[Math.floor(i / U)] ||= []).push(l); });
        return h("div", { style: "max-height:340px;overflow:auto;border:1px solid #e5e5e5;border-radius:12px;padding:8px" }, units.map((u, ui) => {
          const usable = u.filter(has), all = usable.length && usable.every(l => T.sel.has(l.id));
          return h("div", { style: "margin-bottom:8px" },
            h("label", { style: "font-weight:700;display:flex;gap:6px;align-items:center" + (usable.length ? "" : ";opacity:.5") }, h("input", { type: "checkbox", disabled: !usable.length, checked: !!all, onchange: ev => { usable.forEach(l => ev.target.checked ? T.sel.add(l.id) : T.sel.delete(l.id)); draw(); } }), `الوحدة ${AR(ui + 1)}`),
            h("div", { style: "display:flex;flex-wrap:wrap;gap:4px 14px;padding-inline-start:22px" }, u.map(l => h("label", { class: "small", style: has(l) ? "" : "opacity:.45", title: has(l) ? l.topic || "" : "لا يوجد بنك أسئلة لهذه المحاضرة بعد" },
              h("input", { type: "checkbox", disabled: !has(l), checked: T.sel.has(l.id), onchange: ev => { ev.target.checked ? T.sel.add(l.id) : T.sel.delete(l.id); draw(); } }), " " + l.title))));
        }));
      };
      const selQ = lecs.filter(l => T.sel.has(l.id) && (l.section || "quant") === "quant").length, selV = lecs.filter(l => T.sel.has(l.id) && l.section === "verbal").length;
      const subjBox = (o, name) => h("div", { class: "panel", style: "margin:0;flex:1;min-width:260px" }, h("h3", { style: "margin-top:0" }, name),
        h("div", { class: "row", style: "gap:10px;flex-wrap:wrap" },
          h("label", { class: "field" }, h("span", null, "عدد الأسئلة (٠ = بدون)"), num(o, "count", 0, 200)),
          h("label", { class: "field" }, h("span", null, "عدد الأقسام"), num(o, "sections", 1, 10)),
          h("label", { class: "field" }, h("span", null, "زمن كل قسم (دقيقة)"), num(o, "minutes", 1, 180))),
        o.count > 0 && h("p", { class: "small muted", style: "margin:6px 0 0" }, `كل قسم: ${Array.from({ length: o.sections }, (_, i) => AR(Math.floor(o.count / o.sections) + (i < o.count % o.sections ? 1 : 0))).join(" ، ")} سؤالًا`));
      const openEx = T.open && exams.find(x => x.id === T.open);
      wrap.replaceChildren(
        h("section", { class: "panel" },
          h("h2", null, "🧪 إنشاء اختبار جديد"),
          T.note && h("div", { class: "alert " + T.note.type }, T.note.text),
          h("div", { class: "row", style: "gap:12px;flex-wrap:wrap;align-items:end" },
            h("label", { class: "field", style: "flex:2;min-width:240px" }, h("span", null, "اسم الاختبار"), h("input", { type: "text", value: T.title, placeholder: "مثال: الاختبار التجريبي الأول — الفصل الأول", oninput: ev => T.title = ev.target.value })),
            h("label", { class: "field" }, h("span", null, "طريقة التقديم"), h("select", { onchange: ev => { T.delivery = ev.target.value; } }, [["computer", "محوسب (رابط وباركود)"], ["paper", "ورقي (كراسة وورقة إجابة)"]].map(([v, t]) => h("option", { value: v, selected: T.delivery === v }, t)))),
            h("label", { class: "field" }, h("span", null, "مستوى الصعوبة"), h("select", { onchange: ev => { T.level = +ev.target.value; } }, CTEST.LEVELS.map((t, i) => h("option", { value: i, selected: T.level === i }, t)))),
            null),
          h("p", { class: "small muted" }, "المستوى الأساسي يطابق صعوبة أسئلة المحاضرات، وكل مستوى أعلى يرفع صعوبة الأرقام والحسابات في الكمي، ويزيد نسبة أسئلة الفهم والاستنتاج والخطأ السياقي في اللفظي. الأسئلة تُولَّد جديدة في كل مرة، فلا تطابق أسئلة المحاضرات ولا أمثلتها."),
          h("div", { class: "row", style: "gap:12px;flex-wrap:wrap;margin:10px 0" }, subjBox(T.q, "📐 الكمي"), subjBox(T.v, "📖 اللفظي")),
          h("div", { class: "row", style: "gap:12px;flex-wrap:wrap" },
            h("div", { style: "flex:1;min-width:280px" }, h("h3", null, `المحاضرات الكمية (المحدد ${AR(selQ)})`), picker("quant")),
            h("div", { style: "flex:1;min-width:280px" }, h("h3", null, `المحاضرات اللفظية (المحدد ${AR(selV)})`), picker("verbal"))),
          h("button", { class: "btn gold", style: "margin-top:14px", onclick: async ev => {
            if (!T.title.trim()) return (T.note = { type: "err", text: "اكتب اسم الاختبار." }, draw());
            if (T.q.count > 0 && !selQ) return (T.note = { type: "err", text: "اختر محاضرة كمية واحدة على الأقل، أو اجعل عدد أسئلة الكمي صفرًا." }, draw());
            if (T.v.count > 0 && !selV) return (T.note = { type: "err", text: "اختر محاضرة لفظية واحدة على الأقل، أو اجعل عدد أسئلة اللفظي صفرًا." }, draw());
            if (!(T.q.count + T.v.count)) return (T.note = { type: "err", text: "حدد عدد الأسئلة." }, draw());
            ev.target.disabled = true; ev.target.textContent = "جارٍ توليد الأسئلة…"; await new Promise(r => setTimeout(r, 30));
            try {
              const sections = CTEST.generate({ level: T.level, lectures: lecs.filter(l => T.sel.has(l.id)), quant: T.q, verbal: T.v, seed: (Date.now() ^ (Math.random() * 1e9)) >>> 0 });
              const rec = { code: newCode(), title: T.title.trim(), school: A.school || SCHOOL.key, delivery: T.delivery, level: T.level, config: { quant: T.q, verbal: T.v, lectures: [...T.sel] }, sections };
              const { data, error } = await sb.from("custom_exams").insert(rec).select("id").single(); if (error) throw error;
              T.note = { type: "ok", text: `✓ أُنشئ الاختبار «${rec.title}» برمز ${rec.code}، وفيه ${AR(sections.reduce((t, s) => t + s.questions.length, 0))} سؤالًا.` };
              T.open = data.id; A.msg = null; render();
            } catch (er) { T.note = { type: "err", text: er.message }; draw(); }
          } }, "✨ إنشاء الاختبار")),
        openEx ? ctestCard(openEx, true) : null,
        h("section", { class: "panel" }, h("h2", null, "الاختبارات المنشأة"),
          exams.length ? h("div", { class: "table-wrap" }, h("table", null,
            h("thead", null, h("tr", null, h("th", null, "الاختبار"), h("th", null, "الرمز"), h("th", null, "النوع"), h("th", null, "المستوى"), h("th", null, "الأسئلة"), h("th", null, "النتائج"), h("th", null, "الحالة"), h("th", null, ""))),
            h("tbody", null, exams.map(x => h("tr", null, h("td", null, x.title), h("td", null, h("strong", null, x.code)), h("td", null, x.delivery === "paper" ? "ورقي" : "محوسب"), h("td", { class: "small" }, x.level ? "المستوى " + AR(x.level) : "الأساسي"),
              h("td", null, AR(x.sections.reduce((t, s) => t + s.questions.length, 0))), h("td", null, AR((x.custom_results && x.custom_results[0] && x.custom_results[0].count) || 0)),
              h("td", null, h("button", { class: "linkbtn", onclick: async () => { const { error } = await sb.from("custom_exams").update({ is_open: !x.is_open }).eq("id", x.id); if (!error) { x.is_open = !x.is_open; draw(); } } }, x.is_open ? "🟢 مفتوح" : "🔴 مغلق")),
              h("td", null, h("button", { class: "btn sm", onclick: () => { T.open = x.id; draw(); window.scrollTo(0, 0); } }, "فتح")))))))
            : h("p", { class: "muted", style: "margin:0" }, "لم تنشئ اختبارات بعد.")));
    };
    function ctestCard(e) {
      const card = h("section", { class: "panel", style: "border:2px solid #1f6f78" });
      const res = h("div", null, h("p", { class: "muted" }, "جارٍ تحميل النتائج…"));
      (async () => {
        const { data } = await sb.from("custom_results").select("national_id, score, total, percent, source, submitted_at, students(full_name)").eq("exam_id", e.id).order("percent", { ascending: false });
        res.replaceChildren((data || []).length ? h("div", { class: "table-wrap" }, h("table", null, h("thead", null, h("tr", null, h("th", null, "الطالب"), h("th", null, "الدرجة"), h("th", null, "النسبة"), h("th", null, "المصدر"), h("th", null, ""))),
          h("tbody", null, data.map(r => h("tr", null, h("td", null, r.students ? r.students.full_name : r.national_id), h("td", null, `${AR(r.score)} / ${AR(r.total)}`), h("td", null, AR(r.percent) + "٪"), h("td", { class: "small" }, r.source === "paper" ? "ورقي" : "محوسب"),
            h("td", null, h("a", { href: `${resultLink(e.code)}&n=${r.national_id}`, target: "_blank", class: "linkbtn" }, "التقرير"))))))) : h("p", { class: "muted", style: "margin:0" }, "لا توجد نتائج بعد."));
      })();
      const nid = h("input", { type: "text", placeholder: "رقم الهوية", style: "width:150px" });
      const ans = e.sections.map(s => h("input", { type: "text", placeholder: `${s.name}: ${AR(s.questions.length)} حرفًا مثل أبجد…`, style: "width:100%;margin-top:6px" }));
      card.append(
        h("div", { class: "row", style: "justify-content:space-between;align-items:center" }, h("h2", { style: "margin:0" }, `📄 ${e.title}`), h("button", { class: "btn ghost sm", onclick: () => { A.ct.open = null; render(); } }, "إغلاق")),
        h("p", { class: "small muted" }, `الرمز ${e.code} · ${e.delivery === "paper" ? "ورقي" : "محوسب"} · ${CTEST.LEVELS[e.level]} · ${e.sections.map(s => `${s.name}: ${AR(s.questions.length)} سؤالًا / ${AR(s.minutes)} د`).join(" · ")}`),
        h("div", { class: "row", style: "gap:8px;flex-wrap:wrap" },
          h("button", { class: "btn", onclick: () => printBooklet(e) }, "🖨 ملف الأسئلة كاملًا"),
          h("button", { class: "btn ghost", onclick: () => printKey(e) }, "🔑 مفتاح الإجابات مع الحلول"),
          h("button", { class: "btn ghost", onclick: () => printSheet(e) }, "🗒 ورقة إجابة (للورقي)"),
          h("button", { class: "linkbtn", style: "color:#c0392b", onclick: async () => { if (!confirm("حذف الاختبار ونتائجه نهائيًا؟")) return; await sb.from("custom_exams").delete().eq("id", e.id); A.ct.open = null; render(); } }, "حذف الاختبار")),
        h("div", { class: "row", style: "gap:18px;flex-wrap:wrap;margin-top:14px" },
          e.delivery === "computer" && h("div", { style: "text-align:center" }, h("strong", null, "باركود دخول الاختبار المحوسب"), h("br"), h("img", { src: qrSrc(examLink(e.code)), alt: "QR", style: "width:180px;height:180px;margin:6px 0" }), h("br"),
            h("a", { href: examLink(e.code), target: "_blank", class: "small", style: "direction:ltr;display:inline-block" }, examLink(e.code)), h("br"),
            h("button", { class: "btn sm ghost", onclick: () => navigator.clipboard && navigator.clipboard.writeText(examLink(e.code)) }, "نسخ الرابط")),
          h("div", { style: "text-align:center" }, h("strong", null, "رابط الاستعلام عن النتيجة (برقم الهوية)"), h("br"), h("img", { src: qrSrc(resultLink(e.code)), alt: "QR", style: "width:180px;height:180px;margin:6px 0" }), h("br"),
            h("a", { href: resultLink(e.code), target: "_blank", class: "small", style: "direction:ltr;display:inline-block" }, resultLink(e.code)), h("br"),
            h("button", { class: "btn sm ghost", onclick: () => navigator.clipboard && navigator.clipboard.writeText(resultLink(e.code)) }, "نسخ الرابط"))),
        h("h3", null, "رصد إجابات ورقية"),
        h("div", null, nid, ...ans, h("button", { class: "btn sm", style: "margin-top:8px", onclick: async () => {
          const n = toLatinDigits(nid.value); if (!/^\d{10}$/.test(n)) return alert("رقم الهوية ١٠ أرقام.");
          const answers = e.sections.map((s, i) => { const t = [...ans[i].value.replace(/ـ/g, "").replace(/ا|إ|آ/g, "أ").replace(/ه/g, "د")]; return s.questions.map((_, j) => { const k = CTEST.LETTERS.indexOf(t[j]); return k >= 0 ? k : null; }); });
          const an = CTEST.analyze(e.sections, answers);
          const { error } = await sb.from("custom_results").upsert({ exam_id: e.id, national_id: n, answers, score: an.score, total: an.total, percent: an.pct, source: "paper" }, { onConflict: "exam_id,national_id" });
          if (error) return alert(/foreign/.test(error.message) ? "رقم الهوية غير مسجل في المنصة." : error.message);
          nid.value = ""; ans.forEach(a => a.value = ""); alert(`تم الرصد: ${an.score} من ${an.total} (${an.pct}٪)`); A.ct.open = e.id; render();
        } }, "رصد الدرجة")),
        h("p", { class: "small muted" }, "اكتب حروف الإجابات بالترتيب لكل قسم (أ ب ج د)، واترك مسافة أو - للسؤال المتروك."),
        h("h3", null, "النتائج"), res);
      return card;
    }
    draw(); return wrap;
  }

  // ---------- النتائج والتحليل (analytics.js) ----------
  async function tabResults() {
    const sub = A.resSub ||= "training";
    const ctx = { h, sb, AR, flash, SCHOOL, TEST_ID, lectures: A.lectures, wa, state: A, rerender: render };
    const bar = h("div", { class: "row", style: "gap:8px;flex-wrap:wrap;margin-bottom:14px" },
      h("button", { class: sub === "training" ? "btn" : "btn ghost", onclick: () => { A.resSub = "training"; render(); } }, "🎯 التدريب على المحاضرات"),
      h("button", { class: sub === "custom" ? "btn" : "btn ghost", onclick: () => { A.resSub = "custom"; render(); } }, "🧪 الاختبارات المنشأة"));
    if (!window.ANALYTICS) return h("div", { class: "alert err" }, "ملف analytics.js غير موجود. ارفعه مع ملفات التحديث.");
    const body = sub === "custom" ? await ANALYTICS.custom(ctx) : await ANALYTICS.training(ctx);
    return h("div", null, bar, body);
  }

  // ---------- الإعدادات ----------
  async function tabSettings() {
    const { data: s, error } = await sb.from("settings").select("*").eq("id", 1).single(); if (error) throw error;
    const pm = h("input", { type: "number", min: "1", max: "100", value: String(s.pass_mark) });
    const qn = h("input", { type: "number", min: "1", max: "100", value: String(s.questions_per_quiz) });
    const sn = h("input", { type: "text", value: s.school_name });
    const cn = h("input", { type: "text", value: s.course_name });
    const pn = h("input", { type: "text", value: s.platform_name || "التأسيس والتدريب لاختبار القدرات العامة" });
    const vm = h("select", null, [["auto", "تلقائي: المقاطع المرفوعة، وتتحول إلى Drive عند الوصول لحد الاستهلاك حتى نهاية الشهر"], ["direct", "المقاطع المرفوعة دائمًا"], ["drive", "مقاطع Google Drive دائمًا"]]
      .map(([v, t]) => h("option", { value: v, selected: (s.video_mode || "auto") === v }, t)));
    const nextMonth = (() => { const d = new Date(); return new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 1)).toISOString().slice(0, 10); })();
    const today = new Date().toISOString().slice(0, 10), onDrive = s.drive_until && today < s.drive_until;
    const am = h("select", null, [["pass", "مرتبطة باجتياز اختبار المحاضرة السابقة بنسبة الاجتياز"], ["watch", "تُفتح تباعًا بعد مشاهدة المحاضرة السابقة"], ["open", "جميع المحاضرات مفتوحة للطلاب"]]
      .map(([v, t]) => h("option", { value: v, selected: (s.access_mode || "pass") === v }, t)));
    return h("form", { class: "panel", onsubmit: async e => {
      e.preventDefault();
      const { error } = await sb.from("settings").update({ pass_mark: +pm.value, questions_per_quiz: +qn.value, school_name: sn.value.trim(), course_name: cn.value.trim(), platform_name: pn.value.trim() || "التأسيس والتدريب لاختبار القدرات العامة", access_mode: am.value, video_mode: vm.value }).eq("id", 1);
      error ? flash("err", error.message) : flash("ok", "تم حفظ الإعدادات.");
    } },
      h("h2", null, "الإعدادات"),
      h("label", { class: "field" }, h("span", null, "طريقة فتح المحاضرات للطلاب"), am),
      h("label", { class: "field" }, h("span", null, "مصدر المقاطع"), vm),
      h("div", { class: "alert " + (onDrive ? "info" : "ok"), style: "display:flex;gap:10px;align-items:center;flex-wrap:wrap" },
        h("span", { style: "flex:1;min-width:220px" }, onDrive ? `⚠️ المنصة تعرض الآن مقاطع Google Drive حتى ${s.drive_until}، ثم تعود تلقائيًا للمقاطع المرفوعة.` : "✓ المنصة تعرض المقاطع المرفوعة. المحاضرات التي ليس لها مقطع مرفوع تُعرض من Drive."),
        onDrive
          ? h("button", { class: "btn ghost sm", type: "button", onclick: async () => { const { error } = await sb.from("settings").update({ drive_until: null }).eq("id", 1); error ? flash("err", error.message) : flash("ok", "عادت المنصة إلى المقاطع المرفوعة."); } }, "العودة للمقاطع المرفوعة الآن")
          : h("button", { class: "btn ghost sm", type: "button", onclick: async () => { const { error } = await sb.from("settings").update({ drive_until: nextMonth }).eq("id", 1); error ? flash("err", error.message) : flash("ok", `تم التحويل إلى Drive حتى ${nextMonth}.`); } }, "التحويل إلى Drive حتى نهاية الشهر")),
      h("p", { class: "small muted", style: "margin-top:-6px" }, "في الوضع التلقائي: إذا تعذر تشغيل المقاطع المرفوعة عند ٥ طلاب مختلفين خلال ساعة، تتحول المنصة وحدها إلى Drive حتى أول الشهر القادم. وإن رأيت في صفحة Usage أن الاستهلاك قارب الحد، اضغط «التحويل إلى Drive حتى نهاية الشهر»."),
      h("p", { class: "small muted", style: "margin-top:-6px" }, "عند الربط بالاجتياز تُفتح المحاضرة التالية حين يحصل الطالب على نسبة الاجتياز المحددة أدناه أو أعلى."),
      h("div", { class: "grid2" },
        h("label", { class: "field" }, h("span", null, "اسم المنصة (يظهر أعلى الصفحات)"), pn),
        h("label", { class: "field" }, h("span", null, "نسبة الاجتياز (%)"), pm),
        h("label", { class: "field" }, h("span", null, "عدد أسئلة كل اختبار"), qn),
        h("label", { class: "field" }, h("span", null, "اسم المدرسة"), sn),
        h("label", { class: "field" }, h("span", null, "اسم الدورة"), cn)),
      h("button", { class: "btn", type: "submit" }, "حفظ الإعدادات"));
  }

  boot();
})();
