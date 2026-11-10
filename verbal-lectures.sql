-- =====================================================================
-- القسم اللفظي: إضافة ٣٥ محاضرة (القسم ١ – ٣٥) من مجلد «القدرات اللفظي ايهاب»
-- شغّله في Supabase → SQL Editor. إعادة تشغيله تحدّث الروابط فقط ولا تكرر المحاضرات.
-- =====================================================================
insert into lectures (id, title, topic, parts, section) values
(1001, 'المحاضرة 1', '', '[{"label": "المحاضرة", "drive_id": "19ah1Qwg_nv5bL2Ix5nXj1eM3vJBd9xR6"}]'::jsonb, 'verbal'),
(1002, 'المحاضرة 2', '', '[{"label": "المحاضرة", "drive_id": "1vI4Fwj9eYaOl5BDWlWEhzmPNbKz3M7bW"}]'::jsonb, 'verbal'),
(1003, 'المحاضرة 3', '', '[{"label": "المحاضرة", "drive_id": "1HVDLm7TvpL5XRd4PDcEDyKl_Mpr6ygdJ"}]'::jsonb, 'verbal'),
(1004, 'المحاضرة 4', '', '[{"label": "المحاضرة", "drive_id": "10mwwYvIt0dev814B7kDEe0uXEiprBu4n"}]'::jsonb, 'verbal'),
(1005, 'المحاضرة 5', '', '[{"label": "المحاضرة", "drive_id": "1KSf8p55rBbBtU9nWj2PWngQpXG2tIirG"}]'::jsonb, 'verbal'),
(1006, 'المحاضرة 6', '', '[{"label": "المحاضرة", "drive_id": "1cTn52maRxB_EvFfMPQDY-_pUsjXuUdnj"}]'::jsonb, 'verbal'),
(1007, 'المحاضرة 7', '', '[{"label": "المحاضرة", "drive_id": "13tPwDOT7rtAOJ-dQEs5EZFVOfn1onJLb"}]'::jsonb, 'verbal'),
(1008, 'المحاضرة 8', '', '[{"label": "المحاضرة", "drive_id": "1mpzFbYTsSkENt9g4l5gNCTaruGYLYDxA"}]'::jsonb, 'verbal'),
(1009, 'المحاضرة 9', '', '[{"label": "المحاضرة", "drive_id": "10lYZVVQ1gisX4YJO_LQfKhz-v-FVjMm9"}]'::jsonb, 'verbal'),
(1010, 'المحاضرة 10', '', '[{"label": "المحاضرة", "drive_id": "1ciOdyAmoK-CJQryQ2fvh07jnWC7CVrb9"}]'::jsonb, 'verbal'),
(1011, 'المحاضرة 11', '', '[{"label": "المحاضرة", "drive_id": "1opLojxp4FGvVRaMNkzFYs30vvn-bz3bQ"}]'::jsonb, 'verbal'),
(1012, 'المحاضرة 12', '', '[{"label": "المحاضرة", "drive_id": "1iY415BKUQoewrM7eGkkSOt1ZAVYiKBuk"}]'::jsonb, 'verbal'),
(1013, 'المحاضرة 13', '', '[{"label": "المحاضرة", "drive_id": "1lUv9OGaZQHV9QA2BE0xWW7NJa7ZygPm_"}]'::jsonb, 'verbal'),
(1014, 'المحاضرة 14', '', '[{"label": "المحاضرة", "drive_id": "1iQw2mYB58P4oqRUmkAD70_OupQnGZaiG"}]'::jsonb, 'verbal'),
(1015, 'المحاضرة 15', '', '[{"label": "المحاضرة", "drive_id": "1X8wFV7AbjheODw7eWs0lhZp_maYx5H9g"}]'::jsonb, 'verbal'),
(1016, 'المحاضرة 16', '', '[{"label": "المحاضرة", "drive_id": "1BKqS_LHwzP0gmo__vmJeAhX_aLrmyqhR"}]'::jsonb, 'verbal'),
(1017, 'المحاضرة 17', '', '[{"label": "المحاضرة", "drive_id": "1EpIpcF1olRtgq2SAOkWdXlXrJJTQPdMM"}]'::jsonb, 'verbal'),
(1018, 'المحاضرة 18', '', '[{"label": "المحاضرة", "drive_id": "1pAuEhYqWi1S0lw_w3zDksal5Qn47Zx2D"}]'::jsonb, 'verbal'),
(1019, 'المحاضرة 19', '', '[{"label": "المحاضرة", "drive_id": "1IAHA8W5g1istu2nIe3wptCkWd2vIvCcc"}]'::jsonb, 'verbal'),
(1020, 'المحاضرة 20', '', '[{"label": "المحاضرة", "drive_id": "18r-MoItX6dCObW83prt6TzKkUZt3Xl4c"}]'::jsonb, 'verbal'),
(1021, 'المحاضرة 21', '', '[{"label": "المحاضرة", "drive_id": "1j6GLuLdZ6Z74KlSlyQCoj_c3AH0oYEFb"}]'::jsonb, 'verbal'),
(1022, 'المحاضرة 22', '', '[{"label": "المحاضرة", "drive_id": "13Cd0zHkdjMxgk2nguWChxAM6h79LQIS-"}]'::jsonb, 'verbal'),
(1023, 'المحاضرة 23', '', '[{"label": "المحاضرة", "drive_id": "1Q1bUvoG7Thn_5i7vwBL5ukeuOW9VQurM"}]'::jsonb, 'verbal'),
(1024, 'المحاضرة 24', '', '[{"label": "المحاضرة", "drive_id": "1o6U2SCV1mlS7JC84NGeFKDqCjcIIdrAW"}]'::jsonb, 'verbal'),
(1025, 'المحاضرة 25', '', '[{"label": "المحاضرة", "drive_id": "1-UhqPKIRmtHM9jn1OmMkOYp5FKDYR4Ws"}]'::jsonb, 'verbal'),
(1026, 'المحاضرة 26', '', '[{"label": "المحاضرة", "drive_id": "1o76Hizcn9quQMo893r_VQ4MPqKiGMnS9"}]'::jsonb, 'verbal'),
(1027, 'المحاضرة 27', '', '[{"label": "المحاضرة", "drive_id": "1mWKne8GVsgDqK5r6WLE47GPMPiRHF91k"}]'::jsonb, 'verbal'),
(1028, 'المحاضرة 28', '', '[{"label": "المحاضرة", "drive_id": "1QunVSyKigsYnIw60uSO0DRim9W1Yj148"}]'::jsonb, 'verbal'),
(1029, 'المحاضرة 29', '', '[{"label": "المحاضرة", "drive_id": "1_SBDaCRiziqsTcWrCqq4AiHNliqoOLE6"}]'::jsonb, 'verbal'),
(1030, 'المحاضرة 30', '', '[{"label": "المحاضرة", "drive_id": "11z2lAG9ObMudMXkhQbm2n3iop0YqFrgT"}]'::jsonb, 'verbal'),
(1031, 'المحاضرة 31', '', '[{"label": "المحاضرة", "drive_id": "14LhoR3Yi2hM3eZqVijfQrCE2hIL3jIZX"}]'::jsonb, 'verbal'),
(1032, 'المحاضرة 32', '', '[{"label": "المحاضرة", "drive_id": "19KC_GoUUDBK5pwupaqCCViiQSjFTrDGX"}]'::jsonb, 'verbal'),
(1033, 'المحاضرة 33', '', '[{"label": "المحاضرة", "drive_id": "1asHMZmNFiKPyP3IYuUBIyNpbzMYoLURR"}]'::jsonb, 'verbal'),
(1034, 'المحاضرة 34', '', '[{"label": "المحاضرة", "drive_id": "1WhbveGE69h3B2gPUH7aMG7lAdOdk7uo0"}]'::jsonb, 'verbal'),
(1035, 'المحاضرة 35', '', '[{"label": "المحاضرة", "drive_id": "1uKF-umfSt-thRp_yycsS1EPWpFVkNeMv"}]'::jsonb, 'verbal')
on conflict (id) do update set parts = excluded.parts, section = 'verbal';

select count(*) as "محاضرات اللفظي" from lectures where section = 'verbal';
