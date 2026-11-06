// أداة مشتركة: الكلمة الشاذة
(() => {
  window.VERBAL.odd = (bank, from, to) => ({ title: "الكلمة الشاذة", from, to, gen(R, h) {
    const i = R.int(0, bank.length - 1), [grp, o, why] = bank[i], three = R.shuffle(grp).slice(0, 3);
    return { style: "o", sig: `o:${i}`, body: "اختر الكلمة المختلفة (الشاذة) عن بقية الكلمات:", ...h.strOptions(R, o, three),
      steps: ["نبحث عن المعنى المشترك بين أغلب الكلمات، ثم نحدد الكلمة التي تخرج عنه.", why, `إذن الكلمة الشاذة: «${o}».`], explanation: o };
  } });
})();
