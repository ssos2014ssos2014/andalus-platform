// طبقة الاتصال: Supabase في التشغيل الفعلي، أو بيانات تجريبية محلية إن لم تُضبط الإعدادات
window.toLatinDigits = s => String(s ?? "")
  .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
  .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
  .replace(/\s+/g, "");

window.API = (() => {
  const cfg = window.APP_CONFIG || {};
  const live = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  const sb = live ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

  const ERRORS = {
    student_not_found: "رقم الهوية غير مسجل.",
    lecture_locked: "هذه المحاضرة مقفلة حتى تجتاز اختبار المحاضرة السابقة.",
    no_questions: "لا توجد أسئلة لهذه المحاضرة بعد.",
    already_submitted: "تم تسليم هذا الاختبار مسبقًا.",
    attempt_not_found: "تعذر العثور على الاختبار. ابدأ اختبارًا جديدًا."
  };
  const friendly = msg => {
    for (const k in ERRORS) if (String(msg).includes(k)) return ERRORS[k];
    return "تعذر الاتصال بالخادم. تحقق من الإنترنت ثم أعد المحاولة.";
  };
  async function rpc(fn, args) {
    const { data, error } = await sb.rpc(fn, args);
    if (error) throw new Error(friendly(error.message));
    return data;
  }

  const liveApi = {
    portal: nid => rpc("student_portal", { p_nid: nid }),
    markWatched: (nid, lid) => rpc("mark_watched", { p_nid: nid, p_lid: lid }),
    startQuiz: (nid, lid) => rpc("start_quiz", { p_nid: nid, p_lid: lid }),
    submitQuiz: (nid, attempt, answers) => rpc("submit_quiz", { p_attempt: attempt, p_nid: nid, p_answers: answers })
  };

  // ---------------- وضع التجربة ----------------
  const DEMO_STUDENTS = [
    { national_id: "1111111111", full_name: "عبدالله محمد الشهري",
      details: [{ k: "الصف", v: "الثالث الثانوي" }, { k: "الفصل", v: "3/2" }, { k: "رقم الجوال", v: "05xxxxxxxx" }, { k: "المسار", v: "عام" }] },
    { national_id: "2222222222", full_name: "فيصل أحمد القحطاني",
      details: [{ k: "الصف", v: "الثاني الثانوي" }, { k: "الفصل", v: "2/1" }] }
  ];
  function demoQuestions() {
    const qs = []; let id = 1;
    for (const lid of [1, 2]) {
      for (let i = 0; i < 25; i++) {
        const a = 3 + ((i * 7 + lid * 5) % 17), b = 2 + ((i * 5 + lid) % 11);
        const ans = lid === 1 ? a + b : a * b;
        const opts = [ans, ans + 1, ans - 2, ans + 3].map(String);
        const correct = i % 4; [opts[0], opts[correct]] = [opts[correct], opts[0]];
        qs.push({ id: id++, lecture_id: lid, body: `سؤال تجريبي: ما ناتج ${a} ${lid === 1 ? "+" : "×"} ${b} ؟`,
          options: opts, correct, explanation: `${a} ${lid === 1 ? "+" : "×"} ${b} = ${ans}` });
      }
    }
    return qs;
  }
  const QS = demoQuestions();
  const SETTINGS = { pass_mark: 70, questions_per_quiz: 10, school_name: "ثانوية الأندلس بترقش", course_name: "تأسيس القدرات — القسم الكمي" };
  const load = () => { try { return JSON.parse(localStorage.getItem("andalus-demo")) || { views: [], attempts: [] }; } catch { return { views: [], attempts: [] }; } };
  const save = st => { try { localStorage.setItem("andalus-demo", JSON.stringify(st)); } catch {} };
  const qCount = lid => QS.filter(q => q.lecture_id === lid).length;
  function done(st, nid, lid) {
    if (st.attempts.some(a => a.nid === nid && a.lid === lid && a.passed)) return true;
    return qCount(lid) === 0 && st.views.some(v => v.nid === nid && v.lid === lid);
  }
  function unlocked(st, nid, lid) {
    const prev = window.LECTURES.filter(l => l.id < lid).map(l => l.id);
    return prev.length === 0 || done(st, nid, Math.max(...prev));
  }
  const wait = () => new Promise(r => setTimeout(r, 150));
  const demoApi = {
    async portal(nid) {
      await wait();
      const s = DEMO_STUDENTS.find(x => x.national_id === nid); if (!s) return null;
      const st = load();
      return { student: s, settings: SETTINGS, lectures: window.LECTURES.map(l => {
        const mine = st.attempts.filter(a => a.nid === nid && a.lid === l.id && a.submitted);
        return { ...l, question_count: qCount(l.id), watched: st.views.some(v => v.nid === nid && v.lid === l.id),
          done: done(st, nid, l.id), best: mine.length ? Math.max(...mine.map(a => a.percent)) : null, attempts_count: mine.length };
      }) };
    },
    async markWatched(nid, lid) {
      await wait(); const st = load();
      if (!unlocked(st, nid, lid)) throw new Error(ERRORS.lecture_locked);
      if (!st.views.some(v => v.nid === nid && v.lid === lid)) st.views.push({ nid, lid });
      save(st); return true;
    },
    async startQuiz(nid, lid) {
      await wait(); const st = load();
      if (!unlocked(st, nid, lid)) throw new Error(ERRORS.lecture_locked);
      const seen = {};
      st.attempts.filter(a => a.nid === nid && a.lid === lid).forEach(a => a.qids.forEach(q => { seen[q] = Math.max(seen[q] || 0, a.t); }));
      const pool = QS.filter(q => q.lecture_id === lid).map(q => ({ q, s: seen[q.id] || 0, r: Math.random() }))
        .sort((x, y) => (x.s - y.s) || (x.r - y.r)).slice(0, SETTINGS.questions_per_quiz).map(x => x.q);
      if (!pool.length) throw new Error(ERRORS.no_questions);
      const id = "demo-" + Date.now();
      st.attempts.push({ id, nid, lid, qids: pool.map(q => q.id), t: Date.now(), submitted: false }); save(st);
      return { attempt_id: id, pass_mark: SETTINGS.pass_mark,
        questions: pool.sort(() => Math.random() - .5).map(q => ({ id: q.id, body: q.body, options: q.options })) };
    },
    async submitQuiz(nid, attempt, answers) {
      await wait(); const st = load();
      const a = st.attempts.find(x => x.id === attempt && x.nid === nid);
      if (!a) throw new Error(ERRORS.attempt_not_found);
      if (a.submitted) throw new Error(ERRORS.already_submitted);
      const qs = QS.filter(q => a.qids.includes(q.id));
      const score = qs.filter(q => answers[q.id] === q.correct).length;
      const percent = Math.round(score * 100 / qs.length);
      Object.assign(a, { submitted: true, percent, passed: percent >= SETTINGS.pass_mark }); save(st);
      return { score, total: qs.length, percent, passed: a.passed, pass_mark: SETTINGS.pass_mark,
        review: qs.map(q => ({ id: q.id, correct: q.correct, explanation: q.explanation })) };
    }
  };

  return Object.assign({ live, sb, demoIds: DEMO_STUDENTS.map(s => s.national_id) }, live ? liveApi : demoApi);
})();
