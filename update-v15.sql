-- =====================================================================
-- تحديث ١٥: اختبارات محاكية للمحاضرات ٢ و٣ و٤ في القسم اللفظي
-- =====================================================================
update lectures set exam_mode = 'generated', topic = 'التناظر والإكمال والخطأ السياقي، ونصوص: القراءة الجهرية، الزعفران، الاحتكاك' where id = 1002;
update lectures set exam_mode = 'generated', topic = 'التناظر والإكمال والخطأ السياقي، ونصوص: الجمل، التغافل، الطحالب' where id = 1003;
update lectures set exam_mode = 'generated', topic = 'التناظر والإكمال والخطأ السياقي، ونصوص: فقر الأطفال، تناقص السكان، كسوة الكعبة' where id = 1004;
select id, title, topic, exam_mode from lectures where id between 1001 and 1004 order by id;
