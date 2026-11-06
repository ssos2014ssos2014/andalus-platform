// تعدد المدارس: هوية كل مدرسة (الاسم والشعار والحقوق) — المحتوى مشترك والبيانات معزولة في قاعدة البيانات
(() => {
  const SCHOOLS = {
    andalus: {
      key: "andalus", name: "ثانوية الأندلس بترقش", region: "منطقة عسير", page: "index.html",
      logo: "logo.png", favicon: "favicon.png",
      credits: [
        { name: "أ. أحمد علي موسى المشيبي", role: "معلم اللغة الإنجليزية", tag: "فكرة وتنفيذ", av: "أ" },
        { name: "أ. علي جابر علي الألمعي", role: "وكيل الشؤون التعليمية", av: "ع" }
      ],
      creditsLine: "معلم اللغة الإنجليزية أ. أحمد علي موسى المشيبي<br>وكيل الشؤون التعليمية أ. علي جابر علي الألمعي",
      sig: "c1bb487a7eaf000a5230399842979fa3966033e1f444041335c769c11e29e28f",
      sigText: "أحمد علي موسى المشيبي | معلم اللغة الإنجليزية | علي جابر علي الألمعي | وكيل الشؤون التعليمية | ثانوية الأندلس بترقش | 1447هـ / 2026م"
    },
    asma: {
      key: "asma", name: "ثانوية أسماء بنت أبي بكر", region: "", page: "asma.html",
      logo: "logo-asma.png", favicon: "favicon-asma.png",
      credits: [{ name: "أ. عبدية علي موسى الدارسي", role: "", tag: "حقوق المنصة", av: "ع" }], creditsLabel: "حقوق المنصة",
      creditsLine: "أ. عبدية علي موسى الدارسي",
      sig: "db51d52e341e243e6e10456d24f44679dce5876d137a2868ab2c9599e707d09e",
      sigText: "عبدية علي موسى الدارسي | ثانوية أسماء بنت أبي بكر | 1447هـ / 2026م"
    }
  };
  const LS = "school-key";
  const read = () => { try { return localStorage.getItem(LS); } catch { return null; } };
  const qp = new URLSearchParams(location.search).get("school");
  let key = [window.SCHOOL_KEY, qp, read()].find(k => k && SCHOOLS[k]) || "andalus";

  function apply() {
    const s = SCHOOLS[key];
    const ic = document.querySelector('link[rel="icon"]'); if (ic) ic.href = s.favicon;
    document.title = document.title.replace(/ثانوية [^|]+$/, s.name);
    document.querySelectorAll("img[data-school-logo]").forEach(i => { i.src = s.logo; i.alt = "شعار " + s.name; });
  }
  window.SCHOOLS = SCHOOLS;
  window.SCHOOL = {
    get key() { return key; },
    get cur() { return SCHOOLS[key]; },
    get name() { return SCHOOLS[key].name; },
    get logo() { return SCHOOLS[key].logo; },
    get alt() { return "شعار " + SCHOOLS[key].name; },
    set(k) {
      if (!SCHOOLS[k] || k === key) return;
      key = k; try { localStorage.setItem(LS, k); } catch {}
      apply(); document.dispatchEvent(new Event("schoolchange"));
    }
  };
  try { localStorage.setItem(LS, key); } catch {}
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();

  // معرفة مدرسة الطالب بعد دخوله (حتى لو فتح رابط مدرسة أخرى)
  if (window.API && API.live) {
    const cache = {}, portal = API.portal;
    API.portal = async nid => {
      const d = await portal(nid);
      if (d && nid !== "0000") {
        if (!(nid in cache)) {
          try { const { data } = await API.sb.rpc("student_school", { p_nid: nid }); cache[nid] = data || null; } catch { cache[nid] = null; }
        }
        if (cache[nid]) window.SCHOOL.set(cache[nid]);
      }
      return d;
    };
  }
})();
