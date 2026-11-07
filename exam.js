// صفحة الاختبار المحوسب والاستعلام عن النتيجة (exam.html?c=رمز أو exam.html?r=رمز)
(() => {
  const app = document.getElementById("app"), { AR, esc, toHtml, LETTERS } = CTEST;
  if (SCHOOL.female) startFeminine("student");
  const qp = new URLSearchParams(location.search);
  const S = { code: (qp.get("c") || qp.get("r") || "").toUpperCase(), mode: qp.get("r") ? "result" : "exam", nid: "", exam: null, sec: 0, q: 0, answers: [], deadline: 0, timer: null, error: "" };
  const KEY = () => `ctest:${S.code}:${S.nid}`;
  const ERR = { exam_not_found: "رمز الاختبار غير صحيح.", student_not_found: "رقم الهوية غير مسجل في المنصة.", already_submitted: "سبق لك تسليم هذا الاختبار.", exam_closed: "هذا الاختبار مغلق حاليًا.", no_result: "لا توجد نتيجة لهذا الاختبار برقم الهوية المدخل بعد." };
  const fr = m => { for (const k in ERR) if (String(m).includes(k)) return ERR[k]; return "تعذر الاتصال بالخادم. تحقق من الإنترنت ثم أعد المحاولة."; };
  async function rpc(fn, args) { if (!API.live) throw new Error("المنصة غير مربوطة بقاعدة البيانات."); const { data, error } = await API.sb.rpc(fn, args); if (error) throw new Error(fr(error.message)); return data; }
  const el = (html) => { const d = document.createElement("div"); d.innerHTML = html; return d; };
  const head = (sub) => `<header class="band"><div class="band-inner"><div class="brand"><span class="logo-plate"><img src="${SCHOOL.logo}" alt=""></span><div>التأسيس والتدريب لاختبار القدرات العامة<small>${esc(sub || "")}</small></div></div></div></header>`;
  const save = () => { try { localStorage.setItem(KEY(), JSON.stringify({ sec: S.sec, q: S.q, answers: S.answers, deadline: S.deadline })); } catch {} };
  const fmt = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return AR(`${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`); };

  function viewLogin() {
    app.innerHTML = `${head(S.mode === "result" ? "الاستعلام عن نتيجة اختبار" : "الاختبار المحاكي")}<main class="wrap" style="max-width:560px">
      <section class="panel"><h1 style="margin-top:0">${S.mode === "result" ? "📊 الاستعلام عن النتيجة" : "📝 دخول الاختبار"}</h1>
      ${S.error ? `<div class="alert err">${esc(S.error)}</div>` : ""}
      <form id="f"><label class="field"><span>رمز الاختبار</span><input id="code" value="${esc(S.code)}" placeholder="مثال: QD7K2M" style="text-transform:uppercase" required></label>
      <label class="field"><span>رقم الهوية</span><input id="nid" inputmode="numeric" placeholder="١٠ أرقام" value="${esc(S.nid)}" required></label>
      <button class="btn" style="width:100%">${S.mode === "result" ? "عرض النتيجة" : "ابدأ"}</button></form>
      ${S.mode === "exam" ? `<p class="small muted">بعد التسليم تظهر نتيجتك وتحليل أدائك مباشرة، ويمكنك الرجوع إليها من رابط الاستعلام.</p>` : ""}</section></main>`;
    app.querySelector("#f").onsubmit = async e => { e.preventDefault();
      S.code = app.querySelector("#code").value.trim().toUpperCase(); S.nid = toLatinDigits(app.querySelector("#nid").value);
      S.error = ""; app.querySelector("button").disabled = true;
      try { S.mode === "result" ? await openResult() : await openExam(); } catch (er) { S.error = er.message; viewLogin(); } };
  }
  async function openExam() {
    const d = await rpc("custom_exam_get", { p_code: S.code, p_nid: S.nid });
    if (d.done) { S.mode = "result"; return openResult(); }
    if (!d.is_open) throw new Error(ERR.exam_closed);
    if (d.delivery !== "computer") throw new Error("هذا الاختبار ورقي، ويُستعلم عن نتيجته بعد أن يرصدها المعلم.");
    S.exam = d; let st = null; try { st = JSON.parse(localStorage.getItem(KEY()) || "null"); } catch {}
    if (st) Object.assign(S, st); else { S.answers = d.sections.map(s => s.questions.map(() => null)); S.sec = 0; S.q = 0; S.deadline = 0; }
    viewIntro();
  }
  function viewIntro() {
    const d = S.exam, s = d.sections[S.sec];
    app.innerHTML = `${head(d.title)}<main class="wrap" style="max-width:720px"><section class="panel">
      <h1 style="margin-top:0">${esc(d.title)}</h1><p>مرحبًا <strong>${esc(d.student)}</strong> 👋</p>
      <div class="table-wrap"><table><thead><tr><th>القسم</th><th>عدد الأسئلة</th><th>الزمن</th></tr></thead><tbody>${d.sections.map((x, i) => `<tr${i === S.sec ? ' style="background:#e8f4f5"' : ""}><td>${esc(x.name)}${i < S.sec ? " ✓" : ""}</td><td>${AR(x.questions.length)}</td><td>${AR(x.minutes)} دقيقة</td></tr>`).join("")}</tbody></table></div>
      <ul class="small" style="line-height:1.9"><li>لكل قسم وقت مستقل، وعند انتهائه ينتقل الاختبار للقسم التالي تلقائيًا.</li><li>يمكنك التنقل بين أسئلة القسم الحالي ومراجعتها، ولا يمكن الرجوع إلى قسم سابق بعد إنهائه.</li><li>إجاباتك تُحفظ أولًا بأول، فإن انقطع الاتصال ارجع لنفس الرابط.</li></ul>
      <button class="btn gold" id="go" style="width:100%">${S.deadline ? "متابعة" : "ابدأ"} ${esc(s.name)} (${AR(s.minutes)} دقيقة)</button></section></main>`;
    app.querySelector("#go").onclick = () => { if (!S.deadline) S.deadline = Date.now() + s.minutes * 60000; save(); viewQ(); };
  }
  function viewQ() {
    const d = S.exam, s = d.sections[S.sec], q = s.questions[S.q], a = S.answers[S.sec];
    clearInterval(S.timer);
    app.innerHTML = `${head(d.title)}<main class="wrap" style="max-width:820px">
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px"><strong>${esc(s.name)}</strong><span class="btn ghost sm" id="clk" aria-live="off">⏱ ${fmt(S.deadline - Date.now())}</span></div>
      <section class="panel sim-q"><div class="row" style="justify-content:space-between"><span class="qnum">${AR(S.q + 1)}</span><span class="small muted">من ${AR(s.questions.length)}</span></div>
      <div class="qbody">${toHtml(q.body)}</div>
      <div class="opts" role="radiogroup">${q.options.map((o, i) => `<label class="opt${a[S.q] === i ? " on" : ""}"><input type="radio" name="o" ${a[S.q] === i ? "checked" : ""} data-i="${i}"><span class="l">${LETTERS[i]}</span><span>${toHtml(o)}</span></label>`).join("")}</div></section>
      <div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="btn ghost" id="pv" ${S.q === 0 ? "disabled" : ""}>→ السابق</button>
        <div class="row" style="gap:4px;flex-wrap:wrap">${s.questions.map((_, i) => `<button class="btn sm ${i === S.q ? "" : "ghost"}" data-j="${i}" style="min-width:34px;padding:4px 6px;${a[i] != null ? "border-color:#1f6f78;font-weight:800" : ""}">${AR(i + 1)}</button>`).join("")}</div>
        ${S.q < s.questions.length - 1 ? `<button class="btn" id="nx">التالي ←</button>` : `<button class="btn gold" id="end">إنهاء ${esc(s.name)}</button>`}</div>
      <p class="small muted" style="text-align:center">أجبت عن ${AR(a.filter(x => x != null).length)} من ${AR(a.length)} في هذا القسم.</p></main>`;
    app.querySelectorAll("input[name=o]").forEach(r => r.onchange = () => { a[S.q] = +r.dataset.i; save(); viewQ(); });
    app.querySelectorAll("[data-j]").forEach(b => b.onclick = () => { S.q = +b.dataset.j; save(); viewQ(); });
    const pv = app.querySelector("#pv"), nx = app.querySelector("#nx"), en = app.querySelector("#end");
    if (pv) pv.onclick = () => { S.q--; save(); viewQ(); };
    if (nx) nx.onclick = () => { S.q++; save(); viewQ(); };
    if (en) en.onclick = () => { const left = a.filter(x => x == null).length; if (left && !confirm(`بقي ${AR(left)} سؤال دون إجابة في هذا القسم. إنهاء القسم على أي حال؟`)) return; endSection(); };
    const clk = app.querySelector("#clk");
    S.timer = setInterval(() => { const ms = S.deadline - Date.now(); clk.textContent = "⏱ " + fmt(ms); if (ms < 60000) clk.style.color = "#c0392b"; if (ms <= 0) { clearInterval(S.timer); alert(`انتهى وقت ${s.name}.`); endSection(); } }, 1000);
  }
  async function endSection() {
    clearInterval(S.timer);
    if (S.sec < S.exam.sections.length - 1) { S.sec++; S.q = 0; S.deadline = 0; save(); return viewIntro(); }
    app.innerHTML = `${head(S.exam.title)}<main class="wrap"><div class="loading">جارٍ تسليم الاختبار وتصحيحه…</div></main>`;
    try { await rpc("custom_exam_submit", { p_code: S.code, p_nid: S.nid, p_answers: S.answers }); try { localStorage.removeItem(KEY()); } catch {} }
    catch (e) { if (!/سبق لك/.test(e.message)) { app.innerHTML = `${head("")}<main class="wrap"><div class="alert err">${esc(e.message)}</div><button class="btn" onclick="location.reload()">إعادة المحاولة</button></main>`; return; } }
    await openResult();
  }
  async function openResult() {
    const d = await rpc("custom_result", { p_code: S.code, p_nid: S.nid }); viewResult(d);
  }
  function viewResult(d) {
    const female = d.school === "asma", an = CTEST.analyze(d.sections, d.answers), [bt, bc] = CTEST.band(an.pct), adv = CTEST.advice(an, female);
    const bar = (p) => `<span style="display:inline-block;width:120px;height:9px;border-radius:9px;background:#eee;vertical-align:middle;overflow:hidden"><i style="display:block;height:100%;width:${p}%;background:${CTEST.band(p)[1]}"></i></span>`;
    const wrongs = d.sections.flatMap((s, si) => s.questions.map((q, qi) => ({ q, s, si, qi, ch: d.answers[si] && d.answers[si][qi] })).filter(x => x.ch !== x.q.correct));
    app.innerHTML = `${head("نتيجة: " + d.title)}<main class="wrap" style="max-width:900px">
      <section class="panel" style="text-align:center"><p class="eyebrow" style="margin:0">${esc(d.title)}</p><h1 style="margin:6px 0">${esc(d.student)}</h1>
        <div style="font-size:3.2rem;font-weight:800;color:${bc}">${AR(an.pct)}٪</div><div style="font-size:1.2rem;font-weight:700;color:${bc}">${bt}</div>
        <p class="muted">أجبت إجابة صحيحة عن ${AR(an.score)} من ${AR(an.total)} سؤالًا.</p>
        <div class="row" style="justify-content:center;gap:10px;flex-wrap:wrap">${an.subj.map(s => `<div class="panel" style="margin:0;padding:10px 16px"><strong>${s.sub === "quant" ? "الكمي" : "اللفظي"}</strong><div style="font-size:1.5rem;font-weight:800;color:${CTEST.band(s.pct)[1]}">${AR(s.pct)}٪</div><span class="small muted">${AR(s.ok)} / ${AR(s.n)}</span></div>`).join("")}</div></section>
      <section class="panel"><h2>📋 الأداء في كل قسم</h2><div class="table-wrap"><table><thead><tr><th>القسم</th><th>الصحيح</th><th>النسبة</th></tr></thead><tbody>${an.bySec.map(s => `<tr><td>${esc(s.name)}</td><td>${AR(s.ok)} / ${AR(s.n)}</td><td>${bar(s.pct)} ${AR(s.pct)}٪</td></tr>`).join("")}</tbody></table></div></section>
      <section class="panel"><h2>🔍 تحليل المهارات</h2><div class="table-wrap"><table><thead><tr><th>المهارة</th><th>المحاضرة</th><th>الصحيح</th><th>المستوى</th></tr></thead><tbody>${an.skills.map(s => `<tr><td>${esc(s.skill)}</td><td class="small">${esc(s.ltitle)}</td><td>${AR(s.ok)} / ${AR(s.n)}</td><td>${bar(s.pct)} <span class="small" style="color:${CTEST.band(s.pct)[1]}">${CTEST.band(s.pct)[0]}</span></td></tr>`).join("")}</tbody></table></div>
        ${adv.strong.length ? `<p>💪 <strong>نقاط القوة:</strong> ${adv.strong.map(s => esc(s.skill)).join("، ")}</p>` : ""}
        ${adv.weak.length ? `<p>⚠️ <strong>تحتاج إلى علاج:</strong> ${adv.weak.map(s => esc(s.skill)).join("، ")}</p>` : `<p>🌟 لا توجد مهارة تحت ٦٠٪، أحسنت!</p>`}</section>
      <section class="panel"><h2>💡 نصائح وتوصيات</h2><ul style="line-height:2">${adv.tips.map(t => `<li>${esc(t)}</li>`).join("")}</ul></section>
      <section class="panel"><h2>🗓 الخطة العلاجية المقترحة</h2>${adv.plan.map(p => `<h3 style="margin:10px 0 4px;color:#1f6f78">${esc(p.title)}</h3><ul style="line-height:2;margin:0">${p.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`).join("")}</section>
      <section class="panel"><h2>✍️ مراجعة الأسئلة الخاطئة (${AR(wrongs.length)})</h2>${wrongs.length ? wrongs.map(x => `<details style="border:1px solid #eee;border-radius:12px;padding:10px 14px;margin:8px 0"><summary style="cursor:pointer"><strong>${esc(x.s.name)} — السؤال ${AR(x.qi + 1)}</strong> <span class="small muted">· ${esc(x.q.skill)}</span></summary>
        <div class="qbody" style="margin-top:8px">${toHtml(x.q.body)}</div>
        <p>إجابتك: <strong style="color:#c0392b">${x.ch == null ? "لم تُجب" : toHtml(x.q.options[x.ch])}</strong> · الصحيحة: <strong style="color:#1e8449">${toHtml(x.q.options[x.q.correct])}</strong></p>
        <ol style="line-height:1.9">${(x.q.steps || []).map(st => `<li>${toHtml(st)}</li>`).join("")}</ol>
        <p class="small muted">📺 للمراجعة: ${esc(x.q.ltitle)} — من الدقيقة ${CTEST.mmss(x.q.from)}</p></details>`).join("") : "<p>لا توجد أخطاء 🎉</p>"}</section>
      <p style="text-align:center"><button class="btn ghost" onclick="print()">🖨 طباعة التقرير</button></p></main>`;
  }
  const pre = toLatinDigits(qp.get("n") || "");
  if (pre && S.code) { S.nid = pre; (S.mode === "result" ? openResult() : openExam()).catch(e => { S.error = e.message; viewLogin(); }); } else viewLogin();
})();
