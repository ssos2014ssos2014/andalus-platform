(function () {
  const app = document.getElementById("app");
  const LETTERS = ["أ", "ب", "ج", "د", "هـ", "و"];
  const S = { nid: null, data: null, view: "login", lid: null, part: 0, quiz: null, result: null, error: "", busy: false };

  // ---------- أدوات ----------
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "style") el.style.cssText = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }
  const ss = {
    get: k => { try { return sessionStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch {} }
  };
  const settings = () => (S.data && S.data.settings) || S.pub || { pass_mark: 70, questions_per_quiz: 10, platform_name: "التأسيس والتدريب لاختبار القدرات العامة", access_mode: "pass", school_name: "ثانوية الأندلس بترقش", course_name: "تأسيس القدرات — القسم الكمي" };
  function lectures() {
    let prevDone = true;
    return (S.data?.lectures || []).map(l => {
      const state = l.done ? "done" : (l.unlocked ?? prevDone) ? "open" : "locked";
      prevDone = l.done;
      return { ...l, state };
    });
  }
  const lecture = id => lectures().find(l => l.id === id);
  const nextOf = id => { const c = lectures().find(l => l.id === id); return lectures().find(l => l.id > id && (l.section || "quant") === ((c && c.section) || "quant")); };
  function go(view, extra) {
    if (S.play && (view !== "lecture" || (extra && ((extra.lid && extra.lid !== S.play.lid) || (extra.part != null && extra.part !== S.play.part))))) { savePlay(true); }
    Object.assign(S, { view, error: "" }, extra || {}); render(); window.scrollTo(0, 0);
  }
  async function refresh() { S.data = await API.portal(S.nid); }
  async function refresh0(nid, data) { S.nid = nid; S.data = await API.portal(nid) || data; }

  function band() {
    const st = settings();
    return h("header", { class: "band" },
      h("div", { class: "band-inner" },
        h("div", { class: "brand" }, mark(), h("div", null, st.platform_name || "التأسيس والتدريب لاختبار القدرات العامة", h("small", null, st.school_name))),
        h("div", { class: "spacer" }),
        S.data && h("span", { class: "who" }, S.data.student.full_name),
        S.data && h("button", { class: "btn ghost sm", onclick: logout }, "تسجيل الخروج")));
  }
  function logout() { ss.set("andalus-nid", null); ss.set("andalus-sid", null); clearInterval(pingTimer); Object.assign(S, { nid: null, data: null, quiz: null, result: null }); go("login"); }

  // ---------- الدخول ----------
  function viewLogin() {
    const st = settings();
    const input = h("input", { type: "text", class: "id-input", inputmode: "numeric", autocomplete: "off", maxlength: "14",
      placeholder: "رقم الهوية", "aria-label": "رقم الهوية", required: true });
    const btn = h("button", { class: "btn", type: "submit", style: "width:100%" }, "دخول");
    const form = h("form", { onsubmit: async e => {
      e.preventDefault();
      const nid = toLatinDigits(input.value);
      if (!/^\d{5,14}$/.test(nid)) { S.error = "اكتب رقم الهوية بالأرقام فقط."; return render(); }
      btn.disabled = true; btn.textContent = "جارٍ التحقق…";
      try {
        const data = await API.portal(nid);
        if (!data) { S.error = "رقم الهوية غير مسجل في الدورة. تأكد من الرقم أو راجع معلمك."; return render(); }
        try { const sid = await API.login(nid); if (sid) ss.set("andalus-sid", sid); await refresh0(nid, data); } catch { Object.assign(S, { nid, data }); }
        ss.set("andalus-nid", nid); startPing(); go(S.data.student.phone ? "home" : "phone");
      } catch (err) { S.error = err.message; render(); }
    } },
      S.error && h("div", { class: "alert err", role: "alert" }, S.error),
      h("label", { class: "field" }, h("span", null, "رقم الهوية الوطنية / الإقامة"), input),
      btn);
    setTimeout(() => input.focus(), 0);
    return [band(), h("main", { class: "wrap narrow" },
      h("section", { class: "login-hero" },
        mark(), h("h1", null, st.platform_name || "التأسيس والتدريب لاختبار القدرات العامة"), h("p", { class: "eyebrow", style: "justify-content:center" }, `${st.school_name} · ${st.course_name}`),
        h("p", null, "شاهد المحاضرة، ثم اختبر نفسك. تنتقل للمحاضرة التالية حين تجتاز اختبار المحاضرة الحالية.")),
      h("div", { class: "panel login-card" }, form,
        !API.live && h("p", { class: "small muted", style: "margin:14px 0 0" },
          "وضع التجربة: جرّب برقم الهوية " + API.demoIds[0] + ". اربط المنصة بقاعدة البيانات من ملف config.js للتشغيل الفعلي.")))];
  }

  // ---------- الرئيسية ----------
  const AR = s => String(s).replace(/[0-9]/g, c => "٠١٢٣٤٥٦٧٨٩"[c]);
  const dur = sec => { sec = Math.round(sec || 0); const hh = Math.floor(sec / 3600), mm = Math.floor(sec % 3600 / 60);
    return hh ? `${AR(hh)} س ${AR(mm)} د` : mm ? `${AR(mm)} دقيقة` : sec ? "أقل من دقيقة" : `${AR(0)} د`; };
  const pct = v => v == null ? "—" : AR(v) + "٪";
  const MARK = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3l6.2 14.8L45 24l-14.8 6.2L24 45l-6.2-14.8L3 24l14.8-6.2z" fill="currentColor"/><rect x="15" y="15" width="18" height="18" transform="rotate(45 24 24)" fill="none" stroke="var(--tile-deep)" stroke-width="2.4"/></svg>';
  function mark() { const s = h("span", { class: "mark" }); s.innerHTML = MARK; return s; }

  const SECTIONS = {
    quant: { name: "القسم الكمي", icon: "∑", desc: "الحساب والجبر والهندسة والإحصاء وحل المسائل", tone: "q" },
    verbal: { name: "القسم اللفظي", icon: "ض", desc: "التناظر اللفظي وإكمال الجمل والخطأ السياقي واستيعاب المقروء", tone: "v" }
  };
  const num = l => l.section === "verbal" && l.id > 1000 ? l.id - 1000 : l.id;
  const secOf = l => l.section || "quant";
  const tile = (label, value, sub) => h("div", { class: "stat" }, h("div", { class: "v" }, value), h("div", { class: "k" }, label), sub && h("div", { class: "s" }, sub));

  // الصفحة الرئيسية: الترحيب والإحصاءات واختيار القسم
  function viewHome() {
    const s = S.data.student, st = S.data.stats || {}, all = lectures();
    const first = (s.full_name || "").trim().split(/\s+/)[0];
    const details = (Array.isArray(s.details) ? s.details : []).filter(d => d && d.v !== "" && d.v != null && !/جوال|هاتف/.test(d.k));
    const watched = all.filter(l => l.watched).length;
    const secCard = key => {
      const sec = SECTIONS[key], ls = all.filter(l => secOf(l) === key), done = ls.filter(l => l.done).length;
      const p = ls.length ? Math.round(done * 100 / ls.length) : 0;
      return h("button", { class: "sec-card " + sec.tone, onclick: () => go("section", { section: key, filter: "all" }) },
        h("span", { class: "sec-icon", "aria-hidden": "true" }, sec.icon),
        h("span", { class: "sec-name" }, sec.name),
        h("span", { class: "sec-desc" }, sec.desc),
        ls.length ? [h("span", { class: "sec-meta" }, `${AR(ls.length)} محاضرة · أكملت ${AR(done)}`),
          h("span", { class: "sec-bar" }, h("i", { style: `width:${p}%` }))]
          : h("span", { class: "sec-meta soon" }, "المقاطع تُضاف قريبًا"),
        h("span", { class: "sec-go" }, "ادخل القسم ←"));
    };
    return [band(), h("main", { class: "wrap" },
      h("section", { class: "hero hero-home" },
        h("div", { class: "hero-text" },
          h("p", { class: "eyebrow" }, settings().school_name),
          h("h1", null, `مرحبًا ${first} 👋`),
          h("p", null, "اختر القسم الذي تريد التدرّب عليه، وتابع تقدمك من هنا."))),
      h("div", { class: "sections" }, secCard("quant"), secCard("verbal")),
      h("section", { class: "stats", "aria-label": "إحصاءاتي" },
        tile("مرات الدخول", AR(st.logins || 0)),
        tile("وقتك في المنصة", dur(st.seconds)),
        tile("الاختبارات", AR(st.tests || 0), `شاهدت ${AR(watched)} محاضرة`),
        tile("أعلى درجة", pct(st.max)),
        tile("أدنى درجة", pct(st.min)),
        tile("متوسط درجاتك", pct(st.avg))),
      h("div", { class: "two" },
        h("section", { class: "panel" },
          h("div", { class: "student-head" },
            h("div", { class: "avatar", "aria-hidden": "true" }, (s.full_name || "؟").trim().charAt(0)),
            h("div", null, h("h2", { style: "margin:0" }, s.full_name), h("div", { class: "muted small" }, "رقم الهوية: " + AR(s.national_id)))),
          h("dl", { class: "details" },
            details.map(d => h("div", null, h("dt", null, d.k), h("dd", null, String(d.v)))),
            h("div", null, h("dt", null, "رقم الجوال"), h("dd", null, s.phone ? AR(s.phone) : "—", " ",
              h("button", { class: "linkbtn", onclick: () => go("phone") }, s.phone ? "تعديل" : "إضافة"))))),
        (S.data.files || []).length > 0 && h("section", { class: "panel" },
          h("h2", null, "ملفاتي"),
          h("ul", { class: "files" }, S.data.files.map(fl => h("li", null,
            h("a", { class: "file", href: fl.url, target: "_blank", rel: "noopener" }, h("span", { class: "pdf", "aria-hidden": "true" }, "PDF"), fl.title)))))))];
  }

  // صفحة القسم: المحاضرات
  function viewSection() {
    const key = S.section || "quant", sec = SECTIONS[key];
    const ls = lectures().filter(l => secOf(l) === key);
    const doneCount = ls.filter(l => l.done).length;
    const current = ls.find(l => l.state === "open" && !l.done) || ls.find(l => l.state === "open");
    const f = S.filter || "all";
    const shown = ls.filter(l => f === "all" || (f === "open" && l.state === "open" && !l.done) || (f === "done" && l.done));
    const groups = [];
    for (const l of shown) { const g = Math.floor((num(l) - 1) / 10); (groups[g] ||= []).push(l); }
    const ACCESS = { open: "جميع المحاضرات مفتوحة لك.", watch: "تُفتح كل محاضرة بعد مشاهدة التي قبلها.", pass: `تُفتح كل محاضرة بعد اجتياز اختبار التي قبلها بنسبة ${AR(settings().pass_mark)}٪.` };
    const card = l => {
      const pos = Math.max(0, ...Object.values(l.positions || { 0: 0 }));
      const durs = Object.values(l.durations || {}), totalDur = durs.reduce((a, b) => a + (b || 0), 0);
      const watchedPct = totalDur ? Math.min(100, Math.round(Object.entries(l.positions || {}).reduce((t, [k, v]) => t + v, 0) * 100 / totalDur)) : null;
      const isNext = current && current.id === l.id && !l.done;
      const status = l.done ? ["done", "مكتملة"] : l.state === "locked" ? ["locked", "مقفلة"] : l.watched ? ["seen", "شاهدتها"] : pos ? ["progress", "قيد المشاهدة"] : ["open", "متاحة"];
      return h("li", null, h("button", { class: `lcard ${l.state} st-${status[0]}${isNext ? " is-next" : ""}`, disabled: l.state === "locked",
          onclick: () => go("lecture", { lid: l.id, part: 0 }), "aria-label": `${l.title}، ${status[1]}` },
        h("div", { class: "lc-cover " + sec.tone },
          h("span", { class: "lc-wm", "aria-hidden": "true" }, AR(String(num(l)).padStart(2, "0"))),
          isNext && h("span", { class: "lc-ribbon" }, "التالية"),
          h("span", { class: "lc-play", "aria-hidden": "true" }, l.state === "locked" ? "🔒" : l.done ? "✓" : h("span", { class: "tri" })),
          h("span", { class: "lc-kicker" }, "المحاضرة " + AR(num(l)) + (l.parts.length > 1 ? ` · ${AR(l.parts.length)} أجزاء` : ""))),
        h("div", { class: "lc-body" },
          h("div", { class: "lc-title" }, l.topic || `${sec.name} · المحاضرة ${AR(num(l))}`),
          h("div", { class: "lc-meta" },
            h("span", { class: "pill " + status[0] }, status[1]),
            l.exam_mode === "generated" ? h("span", null, "اختبار محاكي") : l.question_count ? h("span", null, "اختبار") : null,
            pos > 0 && !l.done && h("span", null, "توقفت عند " + tfmt(pos))),
          watchedPct != null && !l.done && h("div", { class: "lc-score" }, h("div", { class: "lc-bar watch" }, h("i", { style: `width:${watchedPct}%` })), h("span", null, `شاهدت ${AR(watchedPct)}٪`)),
          l.best != null && h("div", { class: "lc-score" }, h("div", { class: "lc-bar" }, h("i", { style: `width:${l.best}%` })), h("span", null, "أفضل درجة " + pct(l.best))))));
    };
    const unitNames = ["الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة", "السابعة", "الثامنة", "التاسعة", "العاشرة"];
    return [band(), h("main", { class: "wrap" },
      h("div", { class: "row", style: "margin-bottom:14px" }, h("button", { class: "btn ghost sm", onclick: () => go("home") }, "→ الصفحة الرئيسية")),
      h("section", { class: "hero " + sec.tone },
        h("div", { class: "hero-text" },
          h("p", { class: "eyebrow" }, settings().platform_name),
          h("h1", null, sec.icon + "  " + sec.name),
          h("p", null, ls.length ? (doneCount ? `أكملت ${AR(doneCount)} من ${AR(ls.length)} محاضرة. واصل، أنت على الطريق الصحيح.` : "ابدأ من المحاضرة الأولى، وتقدّم خطوة بخطوة.") : "مقاطع هذا القسم تُضاف قريبًا بإذن الله."),
          ls.length > 0 && h("div", { class: "progress" },
            h("div", { class: "bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(ls.length), "aria-valuenow": String(doneCount) },
              h("i", { style: `width:${doneCount * 100 / ls.length}%` })),
            h("span", { class: "small" }, `${AR(Math.round(doneCount * 100 / ls.length))}٪`))),
        current && h("button", { class: "next-card", onclick: () => go("lecture", { lid: current.id, part: 0 }) },
          h("span", { class: "small" }, doneCount || Object.keys(current.positions || {}).length ? "تابع من حيث توقفت" : "ابدأ من هنا"),
          h("span", { class: "nc-num" }, AR(String(num(current)).padStart(2, "0"))),
          h("span", { class: "nc-title" }, current.topic || current.title),
          h("span", { class: "nc-go" }, "ادخل المحاضرة ←"))),
      h("section", { class: "panel" },
        ls.length ? [
          h("div", { class: "row", style: "justify-content:space-between;margin-bottom:6px" },
            h("h2", { style: "margin:0" }, "المحاضرات"),
            h("div", { class: "seg", role: "group", "aria-label": "تصفية المحاضرات" },
              [["all", "الكل"], ["open", "المتاحة"], ["done", "المكتملة"]].map(([k, t]) =>
                h("button", { "aria-pressed": String(f === k), onclick: () => { S.filter = k; render(); } }, t)))),
          h("p", { class: "small muted" }, ACCESS[settings().access_mode] || ""),
          groups.length ? groups.map((g, i) => g && h("div", { class: "unit" },
            h("div", { class: "unit-head" },
              h("span", { class: "unit-no" }, AR(i + 1)),
              h("div", null, h("h3", null, `الوحدة ${unitNames[i] || AR(i + 1)}`), h("div", { class: "small muted" }, `المحاضرات ${AR(num(g[0]))} – ${AR(num(g[g.length - 1]))}`)),
              h("div", { class: "unit-prog" }, h("span", { class: "small" }, `${AR(g.filter(x => x.done).length)} من ${AR(g.length)}`),
                h("div", { class: "bar" }, h("i", { style: `width:${g.filter(x => x.done).length * 100 / g.length}%` })))),
            h("ul", { class: "lgrid" }, g.map(card))))
            : h("p", { class: "muted" }, f === "done" ? "لم تكمل أي محاضرة بعد." : "لا توجد محاضرات في هذا التصنيف.")]
          : h("div", { class: "soon-box" }, h("span", { class: "sec-icon big", "aria-hidden": "true" }, sec.icon),
              h("h2", null, "قريبًا بإذن الله"), h("p", { class: "muted" }, "سيُضاف محتوى هذا القسم بنفس أسلوب القسم الكمي: مقاطع مرتبة، واختبارات محاكية بعد كل محاضرة.")))) ];
  }

  // ---------- رقم الجوال ----------
  function viewPhone() {
    const input = h("input", { type: "tel", class: "id-input", inputmode: "numeric", maxlength: "10", placeholder: "05xxxxxxxx", "aria-label": "رقم الجوال", value: S.data.student.phone || "" });
    if (S.data.student.phone) input.value = S.data.student.phone;
    const btn = h("button", { class: "btn", type: "submit", style: "width:100%" }, "حفظ ومتابعة");
    setTimeout(() => input.focus(), 0);
    return [band(), h("main", { class: "wrap narrow" }, h("div", { class: "panel login-card", style: "margin-top:40px" },
      h("h1", { style: "font-size:1.5rem" }, S.data.student.phone ? "تعديل رقم الجوال" : "خطوة أخيرة قبل البدء"),
      h("p", { class: "muted" }, "اكتب رقم جوالك ليتواصل معك معلمك عند الحاجة. لا يظهر رقمك لغيرك."),
      h("form", { onsubmit: async e => {
        e.preventDefault();
        const v = toLatinDigits(input.value);
        if (!/^05\d{8}$/.test(v)) { S.error = "اكتب رقم الجوال من ١٠ أرقام يبدأ بـ 05."; return render(); }
        btn.disabled = true;
        try { await API.setPhone(S.nid, v); await refresh(); go("home"); } catch (err) { S.error = err.message; render(); }
      } },
        S.error && h("div", { class: "alert err", role: "alert" }, S.error),
        h("label", { class: "field" }, h("span", null, "رقم الجوال"), input), btn),
      S.data.student.phone && h("button", { class: "btn ghost", style: "width:100%;margin-top:10px", onclick: () => go("home") }, "رجوع")))];
  }

  // ---------- الجلسة وحساب الوقت ----------
  let pingTimer = null;
  function startPing() {
    clearInterval(pingTimer);
    const sid = ss.get("andalus-sid"); if (!sid || !S.nid) return;
    pingTimer = setInterval(() => { if (document.visibilityState === "visible" && S.nid) API.ping(sid, S.nid).catch(() => {}); }, 60000);
  }

  // ---------- الأدعية (إشعارات لمدة ١٠ ثوانٍ لا تغطي المقطع) ----------
  const DUA = {
    start: { title: "قبل أن تبدأ", lines: ["«اللهم إني أسألك فهم النبيّين، وحفظ الملائكة المقربين»", "«اللهم افتح عليّ فتوح العارفين، وعلّمني ما ينفعني، وانفعني بما علمتني، وزدني علمًا»"] },
    end: { title: "ختام المشاهدة", lines: ["«اللهم إني أستودعك ما قرأت، وما حفظت، وما تعلّمت، فردّه عند حاجتي إليه، إنك على كل شيء قدير»", "«اللَّهُمَّ انفَعْني بما عَلَّمتَني، وعلِّمْني ما يَنفعُني، وارزُقْني عِلمًا تَنفعُني به»"] },
    exam: { title: "قبل الاختبار", lines: ["«اللهم لا سهل إلا ما جعلته سهلاً، وأنت تجعل الحزن إذا شئت سهلاً»", "«رب اشرح لي صدري، ويسر لي أمري، واحلل عقدة من لساني، يفقهوا قولي»"] }
  };
  function toast(kind) {
    const d = DUA[kind]; if (!d) return;
    const slot = document.getElementById("toast-slot");
    let host = slot;
    if (!host) { host = document.getElementById("toast-fixed") || document.body.appendChild(h("div", { id: "toast-fixed", class: "toast-fixed" })); }
    host.replaceChildren();
    const el = h("div", { class: "dua dua-" + kind, role: kind === "exam" ? "status" : "alert", "aria-live": "polite" },
      h("div", { class: "dua-head" }, h("span", { class: "dua-icon", "aria-hidden": "true" }, "🤲"), h("strong", null, d.title),
        h("button", { class: "dua-x", "aria-label": "إغلاق", onclick: () => el.remove() }, "×")),
      d.lines.map(t => h("p", null, t)),
      h("div", { class: "dua-timer" }, h("i")));
    host.append(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 400); }, 15000);
  }

  // ---------- مشغّل المقطع وحفظ مكان التوقف بالثانية ----------
  // مصادر المقطع لكل جزء: youtube_id (يوتيوب)، أو url (ملف فيديو مباشر)، أو drive_id (Google Drive احتياطي)
  // في يوتيوب والملف المباشر يُقرأ الوقت الفعلي للمقطع بالثانية، ويُعرف انتهاؤه تلقائيًا.
  let PL = null, saveTimer = null, driveTimer = null;
  const posOf = l => ((l && l.positions) || {})[String(S.part)] || 0;
  const srcKind = part => part.youtube_id ? "yt" : part.url ? "video" : "drive";
  let ytLoading = null;
  function loadYT() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (!ytLoading) ytLoading = new Promise(res => {
      const prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = () => { prev && prev(); res(); };
      document.head.appendChild(Object.assign(document.createElement("script"), { src: "https://www.youtube.com/iframe_api" }));
    });
    return ytLoading;
  }
  function curTime() {
    if (!PL) return 0;
    try {
      if (PL.kind === "yt" && PL.yt && PL.yt.getCurrentTime) return Math.floor(PL.yt.getCurrentTime());
      if (PL.kind === "video" && PL.el) return Math.floor(PL.el.currentTime || 0);
    } catch {}
    return Math.max(0, Math.round(PL.start + (PL.acc || 0) + (PL.adj || 0)));
  }
  function curDur() {
    try {
      if (PL && PL.kind === "yt" && PL.yt && PL.yt.getDuration) return Math.floor(PL.yt.getDuration()) || null;
      if (PL && PL.kind === "video" && PL.el && isFinite(PL.el.duration)) return Math.floor(PL.el.duration) || null;
    } catch {}
    return null;
  }
  function startPlay(l, from) {
    const part = l.parts[S.part] || l.parts[0];
    S.play = { lid: l.id, part: S.part };
    PL = { kind: srcKind(part), start: from, acc: 0, adj: 0, lid: l.id, part: S.part };
    render(); toast("start");
    clearInterval(saveTimer); saveTimer = setInterval(() => savePlay(false), 15000);
  }
  // يُستدعى بعد كل رسم للصفحة لتركيب المشغّل في مكانه
  function mountPlayer() {
    const host = document.getElementById("player-host");
    if (!host || !PL || host.dataset.mounted) return;
    host.dataset.mounted = "1";
    const l = lecture(PL.lid), part = l.parts[PL.part] || l.parts[0];
    if (PL.kind === "yt") {
      const div = document.createElement("div"); host.appendChild(div);
      loadYT().then(() => {
        PL.yt = new YT.Player(div, { videoId: part.youtube_id, width: "100%", height: "100%",
          playerVars: { start: PL.start || 0, autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, fs: 1, hl: "ar" },
          events: { onStateChange: e => { if (e.data === 0) onEnded(); } } });
      });
    } else if (PL.kind === "video") {
      const v = h("video", { src: part.url, controls: true, autoplay: true, playsinline: true, controlslist: "nodownload noremoteplayback", disablepictureinpicture: true, preload: "metadata" });
      v.addEventListener("contextmenu", e => e.preventDefault());
      v.addEventListener("loadedmetadata", () => { if (PL && PL.start) v.currentTime = Math.min(PL.start, (v.duration || PL.start) - 1); });
      v.addEventListener("ended", onEnded);
      PL.el = v; host.appendChild(v);
    } else {
      const t = PL.start > 0 ? `?t=${PL.start}s` : "";
      host.appendChild(h("iframe", { src: `https://drive.google.com/file/d/${encodeURIComponent(part.drive_id)}/preview${t}`, allow: "autoplay; fullscreen", allowfullscreen: true, title: l.title }));
      host.appendChild(h("div", { class: "drive-shield", "aria-hidden": "true" })); // يغطي زر الفتح في نافذة خارجية
      clearInterval(driveTimer);
      driveTimer = setInterval(() => { if (!PL) return clearInterval(driveTimer); if (document.visibilityState === "visible") PL.acc++; const el = document.getElementById("live-pos"); if (el) el.textContent = tfmt(curTime()); }, 1000);
    }
  }
  async function savePlay(stop, posOverride) {
    if (!PL || !S.play) return;
    const pos = posOverride ?? curTime(), d = curDur(), lid = PL.lid, part = PL.part;
    const l = (S.data?.lectures || []).find(x => x.id === lid);
    if (l) { l.positions = { ...(l.positions || {}), [String(part)]: pos }; if (d) l.durations = { ...(l.durations || {}), [String(part)]: d }; }
    if (stop) {
      try { PL.yt && PL.yt.pauseVideo && PL.yt.pauseVideo(); PL.el && PL.el.pause(); } catch {}
      S.play = null; PL = null; clearInterval(saveTimer); clearInterval(driveTimer);
    }
    try { await API.savePosition(S.nid, lid, part, pos, d); } catch {}
  }
  async function stopPlay(showDua) {
    if (!S.play) return;
    await savePlay(true);
    render();
    if (showDua) toast("end");
  }
  async function onEnded() {
    if (!PL) return;
    const lid = PL.lid, part = PL.part, l = lecture(lid);
    await savePlay(true, 0);
    S.ended = { lid, part };
    // انتهاء آخر جزء = إتمام المشاهدة تلقائيًا
    if (l && part === l.parts.length - 1 && !l.watched) { try { await API.markWatched(S.nid, lid); await refresh(); } catch {} }
    render(); toast("end");
  }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && S.play) savePlay(false); });
  window.addEventListener("pagehide", () => { if (S.play) savePlay(false); });

  function player(l, part) {
    const playing = S.play && S.play.lid === l.id && S.play.part === S.part;
    if (playing) return h("div", { class: "video" }, h("div", { id: "player-host", class: "player-host" }));
    const saved = posOf(l), dur = ((l.durations || {})[String(S.part)]) || 0;
    const justEnded = S.ended && S.ended.lid === l.id && S.ended.part === S.part;
    return h("div", { class: "video poster" },
      h("div", { class: "poster-inner" },
        h("span", { class: "poster-num" }, AR(String(num(l)).padStart(2, "0"))),
        h("div", { class: "poster-title" }, (l.topic || l.title) + (l.parts.length > 1 ? ` · ${part.label}` : "")),
        justEnded && h("div", { class: "poster-note" }, "✓ أتممت مشاهدة هذا المقطع"),
        h("button", { class: "play-btn", onclick: () => { S.ended = null; startPlay(l, saved); } },
          h("span", { class: "tri", "aria-hidden": "true" }), saved ? `تابع المشاهدة من ${tfmt(saved)}` : justEnded ? "إعادة المشاهدة" : "ابدأ المشاهدة"),
        saved > 0 && dur > 0 && h("div", { class: "poster-prog" }, h("i", { style: `width:${Math.min(100, saved * 100 / dur)}%` })),
        saved > 0 && h("button", { class: "linkbtn light", onclick: () => { S.ended = null; startPlay(l, 0); } }, "ابدأ من البداية")));
  }
  function playerBar(l) {
    if (!(S.play && S.play.lid === l.id && S.play.part === S.part)) return null;
    const exact = PL && PL.kind !== "drive";
    const adj = s => h("button", { class: "btn ghost sm", onclick: () => { PL.adj += s; const el = document.getElementById("live-pos"); if (el) el.textContent = tfmt(curTime()); } },
      (s > 0 ? "+" : "−") + (Math.abs(s) >= 60 ? AR(Math.abs(s) / 60) + " د" : AR(Math.abs(s)) + " ث"));
    return h("div", { class: "pbar" },
      exact ? h("div", { class: "pbar-pos" }, h("span", { class: "small muted" }, "يُحفظ مكان التوقف بالثانية تلقائيًا"))
        : [h("div", { class: "pbar-pos" }, h("span", { class: "small muted" }, "مكان التوقف (تقريبي)"), h("strong", { id: "live-pos" }, tfmt(curTime()))),
           h("div", { class: "row", style: "gap:6px" }, adj(-60), adj(-10), adj(10), adj(60))],
      h("button", { class: "btn", onclick: () => stopPlay(true) }, "⏸ إيقاف المشاهدة وحفظ مكان التوقف"));
  }

  // ---------- المحاضرة ----------
  function viewLecture() {
    const l = lecture(S.lid);
    if (!l || l.state === "locked") { S.view = "home"; return viewHome(); }
    const part = l.parts[S.part] || l.parts[0];
    const st = settings();
    const sim = l.exam_mode === "generated" && window.EXAMS[l.id];
    const hasQuiz = l.question_count > 0 || !!sim;
    const next = nextOf(l.id);
    const qn = Math.min(st.questions_per_quiz, l.question_count);

    const markBtn = h("button", { class: "btn", onclick: async () => {
      markBtn.disabled = true;
      const wasPlaying = !!S.play; if (wasPlaying) await savePlay(true);
      try { await API.markWatched(S.nid, l.id); await refresh(); render(); toast("end"); }
      catch (e) { S.error = e.message; render(); }
    } }, l.parts.length > 1 ? "أنهيت مشاهدة جميع الأجزاء" : "أنهيت مشاهدة المحاضرة");

    const startBtn = sim ? h("button", { class: "btn gold", disabled: !l.watched, onclick: async () => {
      startBtn.disabled = true; startBtn.textContent = "جارٍ تجهيز الاختبار…";
      try { await startSim(l); } catch (e) { S.error = e.message; render(); }
    } }, l.attempts_count ? "اختبار محاكي جديد بأسئلة مختلفة" : "ابدأ الاختبار المحاكي") : h("button", { class: "btn gold", disabled: !l.watched, onclick: async () => {
      startBtn.disabled = true; startBtn.textContent = "جارٍ تجهيز الأسئلة…";
      try {
        const q = await API.startQuiz(S.nid, l.id);
        const order = {}; q.questions.forEach(x => { order[x.id] = shuffle(x.options.map((_, i) => i)); });
        go("quiz", { quiz: { ...q, lid: l.id, i: 0, answers: {}, order, started: Date.now() } }); toast("exam");
      } catch (e) { S.error = e.message; render(); }
    } }, l.attempts_count ? "اختبار جديد بأسئلة مختلفة" : "ابدأ الاختبار");

    return [band(), h("main", { class: "wrap wide" },
      h("div", { class: "row", style: "margin-bottom:14px" },
        h("button", { class: "btn ghost sm", onclick: () => go("section", { section: lecture(S.lid)?.section || "quant" }) }, "→ العودة للمحاضرات")),
      h("div", { class: "lec-head" },
        h("span", { class: "lec-badge" }, AR(String(num(l)).padStart(2, "0"))),
        h("div", null, h("h1", { style: "margin:0" }, l.title), l.topic && h("p", { class: "muted", style: "margin:0" }, l.topic))),
      S.error && h("div", { class: "alert err", role: "alert" }, S.error),
      l.parts.length > 1 && h("div", { class: "tabs", role: "group", "aria-label": "أجزاء المحاضرة" },
        l.parts.map((p, i) => h("button", { "aria-pressed": String(i === S.part), onclick: () => go("lecture", { part: i }) }, p.label))),
      h("div", { class: "lec-layout" },
      h("div", { class: "lec-main" },
      h("div", { class: "theater" }, player(l, part)),
      playerBar(l)),
      h("aside", { class: "lec-side" },
      h("div", { id: "toast-slot", class: "toast-slot" }),

      (l.files || []).length > 0 && h("section", { class: "panel", style: "margin-top:16px" },
        h("h3", null, "ملفات المحاضرة"),
        h("ul", { class: "files" }, l.files.map(f => h("li", null,
          h("a", { class: "file", href: f.url, target: "_blank", rel: "noopener" }, h("span", { class: "pdf", "aria-hidden": "true" }, "PDF"), f.name))))),
      h("div", { class: "steps" },
        h("div", { class: "step " + (l.watched ? "complete" : "active") },
          h("h3", null, "١. مشاهدة المحاضرة"),
          l.watched ? h("p", { class: "small", style: "margin:0" }, "تمت المشاهدة.")
            : [h("p", { class: "small" }, "شاهد المحاضرة كاملة ثم اضغط الزر."), markBtn]),
        h("div", { class: "step " + (l.done && hasQuiz ? "complete" : l.watched ? "active" : "") },
          h("h3", null, "٢. الاختبار"),
          !hasQuiz ? h("p", { class: "small", style: "margin:0" },
              "اختبار هذه المحاضرة قيد الإعداد." + (l.watched && next ? " يمكنك الانتقال للمحاضرة التالية." : ""))
            : [h("p", { class: "small" },
                l.done ? `اجتزت هذه المحاضرة بأفضل نتيجة ${l.best}%. يمكنك إعادة الاختبار للتدريب.`
                  : l.watched ? (sim ? `اختبار محاكي محوسب بنمط قياس: ${sim.blueprint.reduce((t, b) => t + b[1], 0)} سؤالًا في ${sim.minutes} دقيقة، ونسبة الاجتياز ${st.pass_mark}%. تتجدد الأسئلة في كل محاولة.` : `${qn} أسئلة، ونسبة الاجتياز ${st.pass_mark}%.`) + (l.attempts_count ? ` محاولاتك السابقة: ${l.attempts_count}، أفضلها ${l.best}%.` : "")
                  : "يُفتح بعد إنهاء المشاهدة."),
              startBtn])),
      l.done && next && h("div", { class: "row", style: "margin-top:14px" },
        h("button", { class: "btn", style: "width:100%", onclick: () => go("lecture", { lid: next.id, part: 0 }) }, "انتقل إلى " + next.title)))))];
  }

  // ---------- الاختبار المحاكي ----------
  let clockTimer = null;
  function viewQuiz() {
    const Q = S.quiz, l = lecture(Q.lid), q = Q.questions[Q.i];
    const total = Q.questions.length, answered = Object.keys(Q.answers).length;
    const clock = h("span", { class: "clock", "aria-label": "الوقت المنقضي" }, fmt(Date.now() - Q.started));
    clearInterval(clockTimer);
    clockTimer = setInterval(() => { if (S.view !== "quiz") return clearInterval(clockTimer); clock.textContent = fmt(Date.now() - Q.started); }, 1000);

    const opts = Q.order[q.id].map((orig, pos) => h("label", { class: "opt" },
      h("input", { type: "radio", name: "q" + q.id, value: String(orig), checked: Q.answers[q.id] === orig,
        onchange: () => { Q.answers[q.id] = orig; render(); } }),
      h("span", { class: "l" }, LETTERS[pos]),
      h("span", null, q.options[orig])));

    return [band(), h("main", { class: "wrap narrow" },
      h("div", { class: "exam-top" },
        h("strong", null, "اختبار " + l.title),
        h("div", { class: "spacer" }),
        h("span", { class: "small muted" }, `أجبت ${answered} من ${total}`),
        clock),
      h("nav", { class: "qmap", "aria-label": "خريطة الأسئلة" }, Q.questions.map((x, i) =>
        h("button", { class: [Q.answers[x.id] != null && "answered", i === Q.i && "current"].filter(Boolean).join(" "),
          "aria-label": `السؤال ${i + 1}`, "aria-current": i === Q.i ? "step" : null, onclick: () => { Q.i = i; render(); } }, i + 1))),
      S.error && h("div", { class: "alert err", role: "alert" }, S.error),
      h("section", { class: "panel" },
        h("div", { class: "small muted", style: "margin-bottom:6px" }, `السؤال ${Q.i + 1} من ${total}`),
        h("div", { class: "qbody" }, q.body),
        h("div", { class: "opts", role: "radiogroup" }, opts),
        h("div", { class: "exam-nav" },
          h("button", { class: "btn ghost", disabled: Q.i === 0, onclick: () => { Q.i--; render(); } }, "السابق"),
          Q.i < total - 1
            ? h("button", { class: "btn", onclick: () => { Q.i++; render(); } }, "التالي")
            : h("button", { class: "btn gold", onclick: finish }, "إنهاء الاختبار وعرض النتيجة"))),
      h("div", { class: "row", style: "margin-top:14px" },
        h("button", { class: "btn ghost sm", onclick: () => { if (confirm("الخروج يلغي هذا الاختبار، وستظهر لك أسئلة جديدة عند العودة. هل تريد الخروج؟")) go("lecture", { quiz: null }); } }, "الخروج من الاختبار"),
        Q.i < total - 1 && h("button", { class: "btn ghost sm", onclick: finish }, "إنهاء الاختبار الآن")))];
  }
  async function finish() {
    const Q = S.quiz, missing = Q.questions.length - Object.keys(Q.answers).length;
    if (missing && !confirm(`لم تجب عن ${missing} من الأسئلة، وستُحتسب خاطئة. هل تريد التسليم؟`)) return;
    try {
      const r = await API.submitQuiz(S.nid, Q.attempt_id, Q.answers);
      clearInterval(clockTimer);
      await refresh();
      go("result", { result: { ...r, quiz: Q, time: Date.now() - Q.started } });
    } catch (e) { S.error = e.message; render(); }
  }

  // ---------- النتيجة والتوصية ----------
  function viewResult() {
    const R = S.result, Q = R.quiz, l = lecture(Q.lid), next = nextOf(Q.lid);
    const near = !R.passed && R.percent >= R.pass_mark - 20;
    const byId = {}; (R.review || []).forEach(x => { byId[x.id] = x; });
    const verdict = R.passed
      ? { t: "أحسنت، اجتزت الاختبار", m: next ? `مستواك في هذه المحاضرة جيد. ننصحك بالانتقال إلى ${next.title}.` : "أنهيت آخر محاضرة في الدورة. أحسنت!" }
      : near
        ? { t: "اقتربت من الاجتياز", m: "ننصحك بمراجعة المحاضرة مرة أخرى مع التركيز على الأسئلة التي أخطأت فيها، ثم أعد الاختبار. ستظهر لك أسئلة مختلفة." }
        : { t: "ننصحك بمراجعة المحاضرة", m: "شاهد المحاضرة كاملة مرة أخرى ودوّن الأمثلة المحلولة، ثم أعد الاختبار. ستظهر لك أسئلة مختلفة." };

    return [band(), h("main", { class: "wrap narrow" },
      h("section", { class: "panel" },
        h("div", { class: "score" },
          h("div", { class: "ring", style: `--p:${R.percent};--c:var(${R.passed ? "--ok" : "--warn"})` }, h("span", null, R.percent + "%")),
          h("div", { style: "flex:1;min-width:220px" },
            h("h1", { class: "verdict " + (R.passed ? "pass" : "fail"), style: "font-size:1.6rem" }, verdict.t),
            h("p", null, verdict.m),
            h("p", { class: "small muted", style: "margin:0" }, `${R.score} إجابة صحيحة من ${R.total}، نسبة الاجتياز ${R.pass_mark}%، الوقت ${fmt(R.time)}`))),
        h("div", { class: "row", style: "margin-top:18px" },
          R.passed && next && h("button", { class: "btn gold", onclick: () => go("lecture", { lid: next.id, part: 0, result: null }) }, "انتقل إلى " + next.title),
          !R.passed && h("button", { class: "btn gold", onclick: () => go("lecture", { lid: l.id, part: 0, result: null }) }, "راجع المحاضرة"),
          h("button", { class: "btn ghost", onclick: () => go("section", { result: null, section: lecture(S.result?.lid)?.section || "quant" }) }, "العودة للمحاضرات"))),
      h("section", { class: "panel" },
        h("h2", null, "مراجعة الإجابات"),
        h("ol", { class: "review" }, Q.questions.map((q, i) => {
          const rv = byId[q.id] || {}, chosen = Q.answers[q.id], ok = chosen === rv.correct;
          return h("li", { class: ok ? "" : "wrong" },
            h("div", { style: "font-weight:600;white-space:pre-wrap" }, `${i + 1}. ${q.body}`),
            h("p", { class: "a" }, "إجابتك: ", chosen == null ? "لم تُجب" : q.options[chosen], ok ? " ✓" : " ✗"),
            !ok && rv.correct != null && h("p", { class: "a" }, "الإجابة الصحيحة: ", h("strong", null, q.options[rv.correct])),
            rv.explanation && h("p", { class: "a muted" }, rv.explanation));
        }))))];
  }

  // ---------- الاختبار المحاكي (نمط قياس) ----------
  const SIMKEY = "andalus-sim";
  const ARD = s => String(s).replace(/[0-9]/g, c => "٠١٢٣٤٥٦٧٨٩"[c]);
  const tfmt = sec => ARD(ExamEngine.fmtTime(Math.max(0, Math.round(sec))));
  const saveSim = () => ss.set(SIMKEY, S.sim ? JSON.stringify(S.sim) : null);
  async function startSim(l) {
    const def = window.EXAMS[l.id];
    const r = await API.startPractice(S.nid, l.id);
    const items = ExamEngine.build(def, Number(r.seed) || Date.now(), r.used || []);
    S.sim = { lid: l.id, attempt: r.attempt_id, pass_mark: r.pass_mark, items, answers: {}, flags: {}, i: 0,
      deadline: Date.now() + def.minutes * 60000, started: Date.now(), filter: null };
    saveSim(); go("sim"); toast("exam");
  }
  function simNav() {
    const Q = S.sim;
    if (Q.filter === "unanswered") return Q.items.map((_, i) => i).filter(i => Q.answers[i] == null);
    if (Q.filter === "flagged") return Q.items.map((_, i) => i).filter(i => Q.flags[i]);
    return Q.items.map((_, i) => i);
  }
  let simTimer = null;
  function tick(el) {
    clearInterval(simTimer);
    const run = () => {
      if (!S.sim || !["sim", "simReview"].includes(S.view)) return clearInterval(simTimer);
      const left = (S.sim.deadline - Date.now()) / 1000;
      el.textContent = tfmt(left);
      el.classList.toggle("low", left <= 300);
      if (left <= 0) { clearInterval(simTimer); finishSim(true); }
    };
    run(); simTimer = setInterval(run, 1000);
  }
  function simHead(title) {
    const Q = S.sim, def = window.EXAMS[Q.lid];
    const clock = h("span", { class: "clock", role: "timer", "aria-label": "الوقت المتبقي" });
    tick(clock);
    return h("div", { class: "sim-top" },
      h("div", null, h("strong", null, def.title), h("div", { class: "small muted" }, title)),
      h("div", { class: "spacer" }),
      h("div", { class: "small muted" }, "الوقت المتبقي"), clock);
  }
  function viewSim() {
    const Q = S.sim, q = Q.items[Q.i], total = Q.items.length, nav = simNav();
    const pos = nav.indexOf(Q.i);
    const opts = q.options.map((o, k) => h("label", { class: "opt" },
      h("input", { type: "radio", name: "sq", checked: Q.answers[Q.i] === k, onchange: () => { Q.answers[Q.i] = k; saveSim(); render(); } }),
      h("span", { class: "l" }, LETTERS[k]), h("span", null, o)));
    const answered = Object.keys(Q.answers).length;
    return [band(), h("main", { class: "wrap narrow" },
      simHead(`السؤال ${ARD(Q.i + 1)} من ${ARD(total)}، أجبت عن ${ARD(answered)}`),
      Q.filter && h("div", { class: "alert info small" }, Q.filter === "flagged" ? "أنت تتنقل بين الأسئلة المميزة فقط." : "أنت تتنقل بين الأسئلة غير المجاب عنها فقط.",
        " ", h("button", { class: "btn ghost sm", onclick: () => { Q.filter = null; saveSim(); render(); } }, "عرض كل الأسئلة")),
      h("section", { class: "panel sim-q" },
        h("div", { class: "row", style: "justify-content:space-between;margin-bottom:10px" },
          h("span", { class: "qnum" }, ARD(Q.i + 1)),
          h("button", { class: "btn ghost sm flag" + (Q.flags[Q.i] ? " on" : ""), "aria-pressed": String(!!Q.flags[Q.i]),
            onclick: () => { Q.flags[Q.i] = !Q.flags[Q.i]; saveSim(); render(); } }, Q.flags[Q.i] ? "★ مميز للمراجعة" : "☆ تمييز للمراجعة")),
        h("div", { class: "qbody" }, q.body),
        h("div", { class: "opts", role: "radiogroup" }, opts)),
      h("div", { class: "sim-nav" },
        h("button", { class: "btn ghost", disabled: pos <= 0, onclick: () => { Q.i = nav[pos - 1]; saveSim(); render(); } }, "السابق"),
        h("button", { class: "btn ghost", onclick: () => go("simReview") }, "صفحة المراجعة"),
        pos < nav.length - 1
          ? h("button", { class: "btn", onclick: () => { Q.i = nav[pos + 1]; saveSim(); render(); } }, "التالي")
          : h("button", { class: "btn gold", onclick: () => go("simReview") }, "إنهاء ومراجعة")))];
  }
  function viewSimReview() {
    const Q = S.sim, total = Q.items.length;
    const un = Q.items.filter((_, i) => Q.answers[i] == null).length, fl = Object.values(Q.flags).filter(Boolean).length;
    const jump = (i, filter) => { Q.i = i; Q.filter = filter || null; saveSim(); go("sim"); };
    return [band(), h("main", { class: "wrap narrow" },
      simHead("صفحة المراجعة"),
      h("section", { class: "panel" },
        h("h2", null, "مراجعة إجاباتك قبل التسليم"),
        h("p", { class: "small muted" }, `أجبت عن ${ARD(total - un)} من ${ARD(total)}، وغير المجاب ${ARD(un)}، والمميز للمراجعة ${ARD(fl)}. اضغط رقم أي سؤال للانتقال إليه.`),
        h("div", { class: "legend small" }, h("span", { class: "c answered" }, "مجاب"), h("span", { class: "c" }, "غير مجاب"), h("span", { class: "c flagged" }, "مميز")),
        h("div", { class: "rgrid" }, Q.items.map((_, i) => h("button", {
          class: [Q.answers[i] != null && "answered", Q.flags[i] && "flagged"].filter(Boolean).join(" "),
          "aria-label": `السؤال ${i + 1}${Q.answers[i] != null ? "، مجاب" : "، غير مجاب"}${Q.flags[i] ? "، مميز" : ""}`, onclick: () => jump(i) }, ARD(i + 1)))),
        h("div", { class: "row", style: "margin-top:18px" },
          h("button", { class: "btn ghost", onclick: () => jump(0) }, "مراجعة الكل"),
          h("button", { class: "btn ghost", disabled: !un, onclick: () => jump(Q.items.findIndex((_, i) => Q.answers[i] == null), "unanswered") }, "مراجعة غير المجاب"),
          h("button", { class: "btn ghost", disabled: !fl, onclick: () => jump(Q.items.findIndex((_, i) => Q.flags[i]), "flagged") }, "مراجعة المميز"))),
      h("div", { class: "row", style: "justify-content:flex-end;margin-top:16px" },
        h("button", { class: "btn gold", onclick: () => finishSim(false) }, "إنهاء الاختبار وعرض النتيجة")))];
  }
  let finishing = false;
  async function finishSim(timeUp) {
    const Q = S.sim; if (!Q || finishing) return;
    const un = Q.items.filter((_, i) => Q.answers[i] == null).length;
    if (!timeUp && un && !confirm(`لم تجب عن ${un} سؤالًا وستُحتسب خاطئة. هل تريد إنهاء الاختبار؟`)) return;
    finishing = true;
    const sec = Math.min((Date.now() - Q.started) / 1000, window.EXAMS[Q.lid].minutes * 60);
    const items = Q.items.map((q, i) => ({ n: i + 1, sig: q.sig, skill: q.skill, body: q.body, options: q.options, correct: q.correct, chosen: Q.answers[i] ?? null, explanation: q.explanation }));
    try {
      const r = await API.submitPractice(S.nid, Q.attempt, items, Math.round(sec));
      clearInterval(simTimer);
      S.sim = null; saveSim();
      await refresh();
      go("simResult", { result: { ...r, items, lid: Q.lid, sec, timeUp } });
    } catch (e) { S.error = e.message; alert(e.message); }
    finishing = false;
  }
  function ranges(sk) {
    return [[sk.from, sk.to], ...(sk.extra || [])].map(([a, b]) => `${tfmt(a)} – ${tfmt(b)}`).join(" ، ");
  }
  function viewSimResult() {
    const R = S.result, def = window.EXAMS[R.lid], l = lecture(R.lid), next = nextOf(R.lid);
    const near = !R.passed && R.percent >= R.pass_mark - 20;
    const per = {};
    R.items.forEach(it => { const p = per[it.skill] ||= { ok: 0, n: 0 }; p.n++; if (it.chosen === it.correct) p.ok++; });
    const weak = Object.entries(per).filter(([, p]) => p.ok < p.n);
    const verdict = R.passed
      ? { t: "أحسنت، اجتزت الاختبار المحاكي", m: next ? `مستواك في المحاضرة جيد، ننصحك بالانتقال إلى ${next.title}.` + (weak.length ? " وراجع سريعًا الأجزاء المحددة أدناه." : "") : "أنهيت آخر محاضرة في الدورة. أحسنت!" }
      : near ? { t: "اقتربت من الاجتياز", m: "راجع أجزاء المقطع المحددة أمام كل مهارة أخطأت فيها، ثم أعد الاختبار، وستظهر لك أسئلة جديدة بالكامل." }
      : { t: "ننصحك بمراجعة المحاضرة", m: "شاهد المحاضرة مرة أخرى مع التركيز على الأجزاء المحددة أدناه، ثم أعد الاختبار بأسئلة جديدة." };
    const wrong = R.items.filter(it => it.chosen !== it.correct);
    return [band(), h("main", { class: "wrap narrow" },
      h("section", { class: "panel" },
        h("div", { class: "score" },
          h("div", { class: "ring", style: `--p:${R.percent};--c:var(${R.passed ? "--ok" : "--warn"})` }, h("span", null, ARD(R.percent) + "٪")),
          h("div", { style: "flex:1;min-width:220px" },
            h("h1", { class: "verdict " + (R.passed ? "pass" : "fail"), style: "font-size:1.55rem" }, verdict.t),
            h("p", null, verdict.m),
            h("p", { class: "small muted", style: "margin:0" }, `الدرجة ${ARD(R.score)} من ${ARD(R.total)}، نسبة الاجتياز ${ARD(R.pass_mark)}٪، الوقت المستغرق ${tfmt(R.sec)} من ${ARD(def.minutes)}:٠٠` + (R.timeUp ? " (انتهى الوقت)" : "")))),
        h("div", { class: "row", style: "margin-top:18px" },
          R.passed && next && h("button", { class: "btn gold", onclick: () => go("lecture", { lid: next.id, part: 0, result: null }) }, "انتقل إلى " + next.title),
          h("button", { class: R.passed ? "btn ghost" : "btn gold", onclick: () => go("lecture", { lid: l.id, part: 0, result: null }) }, "راجع المحاضرة"),
          h("button", { class: "btn ghost", onclick: async e => { e.target.disabled = true; try { await startSim(l); } catch (err) { alert(err.message); e.target.disabled = false; } } }, "اختبار جديد بأسئلة مختلفة"))),
      h("section", { class: "panel" },
        h("h2", null, "نتيجتك في كل مهارة"),
        h("div", { class: "table-wrap" }, h("table", null,
          h("thead", null, h("tr", null, h("th", null, "المهارة"), h("th", null, "الدرجة"), h("th", null, "راجعها في المقطع (دقيقة)"))),
          h("tbody", null, Object.keys(def.skills).filter(k => per[k]).map(k => {
            const p = per[k], sk = def.skills[k];
            return h("tr", null, h("td", null, sk.title),
              h("td", { class: p.ok === p.n ? "chip-pass" : "chip-fail" }, `${ARD(p.ok)} من ${ARD(p.n)}`),
              h("td", { class: "small" }, p.ok === p.n ? "متقنة ✓" : ranges(sk)));
          }))))),
      wrong.length > 0 && h("section", { class: "panel" },
        h("h2", null, `شرح الأسئلة التي لم تُجب عنها صحيحًا (${ARD(wrong.length)})`),
        h("ol", { class: "review" }, wrong.map(it => {
          const sk = def.skills[it.skill];
          return h("li", { class: "wrong" },
            h("div", { class: "small muted" }, `السؤال ${ARD(it.n)} · ${sk.title}`),
            h("div", { style: "font-weight:600;white-space:pre-wrap" }, it.body),
            h("p", { class: "a" }, "إجابتك: ", it.chosen == null ? "لم تُجب" : it.options[it.chosen], " ✗"),
            h("p", { class: "a" }, "الإجابة الصحيحة: ", h("strong", null, it.options[it.correct])),
            h("p", { class: "a muted" }, it.explanation),
            h("p", { class: "a tip" }, "📍 راجع هذا الجزء في المقطع من الدقيقة ", h("strong", null, ranges(sk))));
        }))))];
  }

  // ---------- عام ----------
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function fmt(ms) { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }

  function render() {
    const views = { login: viewLogin, home: viewHome, section: viewSection, phone: viewPhone, lecture: viewLecture, quiz: viewQuiz, result: viewResult, sim: viewSim, simReview: viewSimReview, simResult: viewSimResult };
    const nodes = (S.data || S.view === "login" ? views[S.view] : viewLogin)();
    app.replaceChildren(...[nodes].flat().filter(Boolean));
    if (S.play) mountPlayer();
  }
  window.addEventListener("beforeunload", e => { if (S.view === "quiz" || S.view === "sim" || S.view === "simReview") { e.preventDefault(); e.returnValue = ""; } });

  (async () => {
    try { S.pub = await API.publicSettings(); } catch {}
    const saved = ss.get("andalus-nid");
    if (saved) {
      app.replaceChildren(h("div", { class: "loading" }, "جارٍ التحميل…"));
      try {
        const d = await API.portal(saved);
        if (d) {
          Object.assign(S, { nid: saved, data: d }); startPing();
          if (!d.student.phone) return go("phone");
          let sim = null; try { sim = JSON.parse(ss.get(SIMKEY) || "null"); } catch {}
          if (sim && window.EXAMS[sim.lid]) { S.sim = sim; return go(Date.now() < sim.deadline ? "sim" : "simReview"); }
          return go("home");
        }
      } catch {}
    }
    render();
  })();
})();
