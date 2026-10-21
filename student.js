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
    for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }
  const ss = {
    get: k => { try { return sessionStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch {} }
  };
  const settings = () => (S.data && S.data.settings) || { pass_mark: 70, questions_per_quiz: 10, school_name: "ثانوية الأندلس بترقش", course_name: "تأسيس القدرات — القسم الكمي" };
  function lectures() {
    let prevDone = true;
    return (S.data?.lectures || []).map(l => {
      const state = l.done ? "done" : prevDone ? "open" : "locked";
      prevDone = l.done;
      return { ...l, state };
    });
  }
  const lecture = id => lectures().find(l => l.id === id);
  const nextOf = id => lectures().find(l => l.id > id);
  function go(view, extra) { Object.assign(S, { view, error: "" }, extra || {}); render(); window.scrollTo(0, 0); }
  async function refresh() { S.data = await API.portal(S.nid); }

  function band() {
    const st = settings();
    return h("header", { class: "band" },
      h("div", { class: "band-inner" },
        h("div", { class: "brand" }, st.school_name, h("small", null, st.course_name)),
        h("div", { class: "spacer" }),
        S.data && h("span", { class: "who" }, S.data.student.full_name),
        S.data && h("button", { class: "btn ghost sm", onclick: logout }, "تسجيل الخروج")));
  }
  function logout() { ss.set("andalus-nid", null); Object.assign(S, { nid: null, data: null, quiz: null, result: null }); go("login"); }

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
        Object.assign(S, { nid, data }); ss.set("andalus-nid", nid); go("home");
      } catch (err) { S.error = err.message; render(); }
    } },
      S.error && h("div", { class: "alert err", role: "alert" }, S.error),
      h("label", { class: "field" }, h("span", null, "رقم الهوية الوطنية / الإقامة"), input),
      btn);
    setTimeout(() => input.focus(), 0);
    return [band(), h("main", { class: "wrap narrow" },
      h("section", { class: "login-hero" },
        h("h1", null, st.course_name),
        h("p", null, "شاهد المحاضرة، ثم اختبر نفسك. تنتقل للمحاضرة التالية حين تجتاز اختبار المحاضرة الحالية.")),
      h("div", { class: "panel login-card" }, form,
        !API.live && h("p", { class: "small muted", style: "margin:14px 0 0" },
          "وضع التجربة: جرّب برقم الهوية " + API.demoIds[0] + ". اربط المنصة بقاعدة البيانات من ملف config.js للتشغيل الفعلي.")))];
  }

  // ---------- الرئيسية ----------
  function viewHome() {
    const s = S.data.student, ls = lectures();
    const doneCount = ls.filter(l => l.done).length;
    const current = ls.find(l => l.state === "open");
    const initial = (s.full_name || "؟").trim().charAt(0);
    const details = (Array.isArray(s.details) ? s.details : []).filter(d => d && d.v !== "" && d.v != null);

    return [band(), h("main", { class: "wrap" },
      h("section", { class: "panel" },
        h("div", { class: "student-head" },
          h("div", { class: "avatar", "aria-hidden": "true" }, initial),
          h("div", null, h("h2", { style: "margin:0" }, s.full_name), h("div", { class: "muted small" }, "رقم الهوية: " + s.national_id)),
          h("div", { style: "flex:1" }),
          current && h("button", { class: "btn gold", onclick: () => go("lecture", { lid: current.id, part: 0 }) },
            doneCount ? "تابع: " + current.title : "ابدأ المحاضرة الأولى")),
        details.length > 0 && h("dl", { class: "details" }, details.map(d => h("div", null, h("dt", null, d.k), h("dd", null, String(d.v))))),
        h("div", { class: "progress" },
          h("div", { class: "bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(ls.length), "aria-valuenow": String(doneCount) },
            h("i", { style: `width:${ls.length ? (doneCount * 100 / ls.length) : 0}%` })),
          h("span", { class: "small" }, `${doneCount} من ${ls.length} محاضرة`))),
      h("section", { class: "panel" },
        h("h2", null, "مسار المحاضرات"),
        h("ol", { class: "path" }, ls.map(l => h("li", null,
          h("button", { class: "stop " + l.state, disabled: l.state === "locked", onclick: () => go("lecture", { lid: l.id, part: 0 }),
            "aria-label": `${l.title} — ${l.state === "done" ? "مكتملة" : l.state === "open" ? "متاحة" : "مقفلة"}` },
            h("span", { class: "node" }, l.id),
            h("span", null,
              h("div", { class: "t" }, l.title + (l.parts.length > 1 ? ` (${l.parts.length} أجزاء)` : "")),
              h("div", { class: "s" }, [l.topic, l.best != null ? `أفضل نتيجة ${l.best}%` : ""].filter(Boolean).join("، "))),
            h("span", { class: "tag " + l.state }, l.state === "done" ? "مكتملة" : l.state === "open" ? "متاحة" : "مقفلة")))))))];
  }

  // ---------- المحاضرة ----------
  function viewLecture() {
    const l = lecture(S.lid);
    if (!l || l.state === "locked") { S.view = "home"; return viewHome(); }
    const part = l.parts[S.part] || l.parts[0];
    const st = settings();
    const hasQuiz = l.question_count > 0;
    const next = nextOf(l.id);
    const qn = Math.min(st.questions_per_quiz, l.question_count);

    const markBtn = h("button", { class: "btn", onclick: async () => {
      markBtn.disabled = true;
      try { await API.markWatched(S.nid, l.id); await refresh(); render(); }
      catch (e) { S.error = e.message; render(); }
    } }, l.parts.length > 1 ? "أنهيت مشاهدة جميع الأجزاء" : "أنهيت مشاهدة المحاضرة");

    const startBtn = h("button", { class: "btn gold", disabled: !l.watched, onclick: async () => {
      startBtn.disabled = true; startBtn.textContent = "جارٍ تجهيز الأسئلة…";
      try {
        const q = await API.startQuiz(S.nid, l.id);
        const order = {}; q.questions.forEach(x => { order[x.id] = shuffle(x.options.map((_, i) => i)); });
        go("quiz", { quiz: { ...q, lid: l.id, i: 0, answers: {}, order, started: Date.now() } });
      } catch (e) { S.error = e.message; render(); }
    } }, l.attempts_count ? "اختبار جديد بأسئلة مختلفة" : "ابدأ الاختبار");

    return [band(), h("main", { class: "wrap" },
      h("div", { class: "row", style: "margin-bottom:14px" },
        h("button", { class: "btn ghost sm", onclick: () => go("home") }, "العودة للمسار")),
      h("h1", null, l.title),
      l.topic && h("p", { class: "muted" }, l.topic),
      S.error && h("div", { class: "alert err", role: "alert" }, S.error),
      l.parts.length > 1 && h("div", { class: "tabs", role: "group", "aria-label": "أجزاء المحاضرة" },
        l.parts.map((p, i) => h("button", { "aria-pressed": String(i === S.part), onclick: () => go("lecture", { part: i }) }, p.label))),
      h("div", { class: "video" },
        h("iframe", { src: `https://drive.google.com/file/d/${encodeURIComponent(part.drive_id)}/preview`, allow: "autoplay; fullscreen",
          allowfullscreen: true, title: `${l.title} — ${part.label}`, loading: "lazy" })),
      h("p", { class: "small muted", style: "margin-top:8px" }, "إذا لم يظهر الفيديو: ",
        h("a", { href: `https://drive.google.com/file/d/${encodeURIComponent(part.drive_id)}/view`, target: "_blank", rel: "noopener" }, "افتحه في Google Drive")),

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
                  : l.watched ? `${qn} أسئلة، ونسبة الاجتياز ${st.pass_mark}%.` + (l.attempts_count ? ` محاولاتك السابقة: ${l.attempts_count}، أفضلها ${l.best}%.` : "")
                  : "يُفتح بعد إنهاء المشاهدة."),
              startBtn])),
      l.done && next && h("div", { class: "row", style: "margin-top:18px" },
        h("button", { class: "btn", onclick: () => go("lecture", { lid: next.id, part: 0 }) }, "انتقل إلى " + next.title)))];
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
          h("button", { class: "btn ghost", onclick: () => go("home", { result: null }) }, "العودة للمسار"))),
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

  // ---------- عام ----------
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function fmt(ms) { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }

  function render() {
    const views = { login: viewLogin, home: viewHome, lecture: viewLecture, quiz: viewQuiz, result: viewResult };
    const nodes = (S.data || S.view === "login" ? views[S.view] : viewLogin)();
    app.replaceChildren(...[nodes].flat());
  }
  window.addEventListener("beforeunload", e => { if (S.view === "quiz") { e.preventDefault(); e.returnValue = ""; } });

  (async () => {
    const saved = ss.get("andalus-nid");
    if (saved) {
      app.replaceChildren(h("div", { class: "loading" }, "جارٍ التحميل…"));
      try { const d = await API.portal(saved); if (d) { Object.assign(S, { nid: saved, data: d }); return go("home"); } } catch {}
    }
    render();
  })();
})();
