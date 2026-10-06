// VISUALL Telegram-бот — Cloudflare Worker (webhook)
// Секреты: BOT_TOKEN, WEBHOOK_SECRET. Хранилище: KV (binding KV).
// Администратор определяется по username ADMIN_USERNAME (без @).

import { CAT } from "./catalog.js";
const SITE = "https://svetayurkina-rgb.github.io/visuall-site/";
const IMG = SITE + "img/";
const ADMIN_USERNAME = "sveta_muzyka";
const PHONE = "+7 (925) 062-00-01";
const PROMO = "VISUALL10";

const SERVICES = {
  poster: { n: "Постер", p: 990, d: "1 рабочий день", design: true, inc: "1 постер в выбранном стиле с вашим текстом, ценами и контактами, QR-код, формат для соцсетей 1080×1350 + PDF для печати, 2 круга правок" },
  combo: { n: "Комбо: постер + 1 формат", p: 1490, d: "1–2 рабочих дня", design: true, inc: "постер + визитка, сертификат или прайс в одном стиле, файлы для соцсетей и печати, 2 круга правок" },
  pack: { n: "Пакет из 4 форматов", p: 2590, d: "2–3 рабочих дня", design: true, inc: "постер, визитка (2 стороны, 90×50 мм), подарочный сертификат (210×99 мм), прайс на 3 страницы, файлы для соцсетей + PDF для типографии, 2 круга правок" },
  card: { n: "Визитка (2 стороны)", p: 590, d: "1 рабочий день", design: true, inc: "визитка 90×50 мм с двух сторон в выбранном стиле, PDF для типографии + картинка для соцсетей, 2 круга правок" },
  cert: { n: "Подарочный сертификат", p: 690, d: "1 рабочий день", design: true, inc: "сертификат 210×99 мм в выбранном стиле, PDF для типографии + картинка для соцсетей, 2 круга правок" },
  price: { n: "Прайс на 3 страницы", p: 1290, d: "1–2 рабочих дня", design: true, inc: "прайс на 3 страницы с вашими услугами и ценами, PDF для печати + картинки для соцсетей, 2 круга правок" },
  text: { n: "Рекламный текст — 10 вариантов", p: 490, d: "1 рабочий день", design: true, inc: "10 вариантов рекламного текста: боль клиента, слоган и призыв к действию в разных тонах — с юмором, дружески, тепло, профессионально" },
  video: { n: "Видео / Reels", p: 1990, from: true, d: "2–3 рабочих дня", inc: "оживление вашего постера или фото, 8–15 секунд, вертикальный формат для Reels и сторис, 1 круг правок" },
  insta: { n: "Instagram под ключ", p: 15000, from: true, month: true, d: "старт через 3 рабочих дня после брифа", inc: "12 постов и 8 сторис в месяц в едином стиле, тексты к постам, оформление шапки и актуальных, контент-план" },
  bot: { n: "Telegram-бот", p: 9900, from: true, d: "5–7 рабочих дней", inc: "меню услуг и цен, приём заявок, уведомления вам в Telegram, оформление в стиле вашей рекламы, 2 круга правок" },
  site: { n: "Сайт как этот", p: 24900, from: true, d: "7–14 рабочих дней", inc: "до 5 разделов, видео, кнопки связи, удобно на телефоне и компьютере, помощь с размещением и доменом, 3 круга правок" },
  all: { n: "Всё под ключ", p: 39900, from: true, d: "по договорённости", inc: "реклама, видео, Instagram, бот и сайт в одном стиле — выгоднее на 20%" },
  custom: { n: "Свой дизайн / другое", p: 0, d: "по договорённости", inc: "дизайн не из каталога — обсудим идею лично" },
};
const SPHERES = { beauty: "Beauty", food: "Еда и доставка", kids: "Обучение и дети", consult: "Консультации", house: "Дом и ремонт", auto: "Авто", pets: "Животные", fit: "Фитнес и стройность", other: "Другие услуги" };
const DISC = { promo: ["Промокод VISUALL10 (первый заказ)", 10], rev: ["За отзыв", 15], ba: ["За «было — стало»", 20], friend: ["По приглашению друга", 15], no: ["Без скидки", 0] };

const rub = (n) => n.toLocaleString("ru-RU").replace(/ /g, " ") + " ₽";
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const MON = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
function promoUntil(now = Date.now()) {
  const msk = new Date(now + 3 * 3600e3), add = (7 - msk.getUTCDay()) % 7;
  const d = new Date(Date.UTC(msk.getUTCFullYear(), msk.getUTCMonth(), msk.getUTCDate() + add));
  return `воскресенья, ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
}
const priceStr = (s) => (s.p ? (s.from ? "от " : "") + rub(s.p) + (s.month ? "/мес" : "") : "по договорённости");

// ---------- тексты ----------
const T = {
  hello: (name) => `Привет${name ? ", " + esc(name) : ""}! 👋 Я бот <b>VISUALL</b> — помощник Светланы Музыки.\n\nДелаем рекламу, которую не пролистывают: постеры, визитки, сертификаты, прайсы, видео, Instagram, ботов и сайты — всё в одном стиле.\n\n🎟 Сейчас: <b>−10%</b> на первый заказ по промокоду <code>${PROMO}</code> — до ${promoUntil()}.\n\nВыберите, что вам интересно 👇`,
  prices: () => `💰 <b>Цены</b>\n\n<b>Реклама в одном стиле</b>\n• Постер — 990 ₽\n• Комбо: постер + визитка / сертификат / прайс — 1 490 ₽\n• Пакет из 4 форматов — 2 590 ₽ ⭐\n\n<b>Отдельно</b>\n• Визитка (2 стороны) — 590 ₽\n• Подарочный сертификат — 690 ₽\n• Прайс на 3 страницы — 1 290 ₽\n• Рекламный текст, 10 вариантов — 490 ₽\n• Срочно за 24 часа — +50%\n\n<b>Ещё</b>\n• Видео / Reels — от 1 990 ₽\n• Telegram-бот — от 9 900 ₽\n• Сайт как этот — от 24 900 ₽\n• Instagram под ключ — от 15 000 ₽/мес\n• Всё под ключ — от 39 900 ₽\n\n🎟 −10% по промокоду <code>${PROMO}</code> до ${promoUntil()}.`,
  terms: () => `⏱ <b>Сроки и правки</b>\n\n• Постер — 1 рабочий день\n• Комбо — 1–2 дня\n• Пакет из 4 — 2–3 дня\n• Видео — 2–3 дня\n• Бот — 5–7 дней\n• Сайт — 7–14 дней\n• Срочно за 24 часа — +50%\n\nСрок считается с момента, когда вы прислали все материалы и предоплату.\n\n✏️ <b>Правки</b>\nПостер, комбо и пакет — 2 круга бесплатно, видео — 1, бот — 2, сайт — 3. Правки — это текст, цены, контакты, цвета и мелкие детали.\nДополнительный круг — 300 ₽. Смена стиля после согласования — как новый заказ со скидкой 50%.`,
  pay: () => `💳 <b>Оплата</b>\n\n• СБП на <b>Сбербанк</b> по номеру <code>${PHONE}</code>\n• Предоплата 50% — после того как Светлана согласует с вами заказ\n• Остаток — после того как вы согласовали результат\n• Готовые файлы — сразу после полной оплаты\n• 🧾 Светлана самозанятая — после оплаты присылает официальный чек\n• Если работа ещё не начата — предоплата возвращается полностью\n\n⚠️ Пожалуйста, не переводите деньги, пока заказ не согласован лично со Светланой.`,
  disc: () => `🎟 <b>Скидки и бонусы</b>\n\n• <b>−10%</b> на первый заказ — промокод <code>${PROMO}</code>, действует до ${promoUntil()}\n• <b>−15%</b> на следующий заказ — за отзыв\n• <b>−20%</b> на заказ — если разрешите показать «было — стало» на сайте\n• <b>−15%</b> вам и другу — если приведёте друга\n\nСкидки не суммируются — действует самая большая. Распространяются на постер, комбо, пакет и отдельные форматы из прайса.`,
  how: () => `📝 <b>Как проходит заказ</b>\n\n1. Выбираете сферу и стиль в каталоге на сайте\n2. Оформляете заказ здесь, в боте, — это 1 минута\n3. Присылаете текст, цены, контакты, логотип и фото, если есть\n4. Светлана согласует детали, вы вносите предоплату 50%\n5. Получаете результат, вносите правки\n6. Оплачиваете остаток — получаете файлы для соцсетей и печати\n\n<b>Что прислать:</b> название бизнеса или имя мастера, список услуг с ценами, телефон и соцсети. Логотип и свои фото — по желанию, они тоже пойдут в дизайн.`,
  about: () => `👩‍🎨 <b>Светлана Музыка</b> — креатор VISUALL.\n\nДелает рекламу для малого бизнеса: постеры, визитки, сертификаты, прайсы, видео и Reels, ведёт Instagram, настраивает Telegram-ботов и делает сайты.\n\n📱 Telegram: @sveta_muzyka\n📞 ${PHONE}\n🌐 Каталог: ${SITE}`,
  faq: () => `❓ <b>Частые вопросы</b>\n\n<b>Можно со своими фото?</b>\nКонечно. Пришлите фото торта, маникюра или интерьера — оно станет рекламным постером.\n\n<b>В каком виде я получу рекламу?</b>\nКартинки для соцсетей (1080×1350) и PDF для типографии: визитка 90×50 мм с двух сторон, сертификат 210×99 мм, прайс на 3 страницы.\n\n<b>Можно дизайн не из каталога?</b>\nДа — оформите заказ «Свой дизайн / другое» и опишите идею.\n\n<b>Вы выдаёте чек?</b>\nДа, Светлана самозанятая — официальный чек из «Мой налог» после каждой оплаты.\n\n<b>Можно только картинки?</b>\nНет: ещё видео, Instagram, боты и сайты.\n\nНе нашли ответ? Просто напишите вопрос сюда — я передам Светлане.`,
};

const MAIN_KB = { inline_keyboard: [
  [{ text: "🛒 Оформить заказ — 1 минута", callback_data: "order" }],
  [{ text: "📱 Каталог-приложение", web_app: { url: SITE } }],
  [{ text: "🔮 Какой стиль ваш? Квиз", callback_data: "quiz" }, { text: "🎲 Удиви меня", callback_data: "rnd" }],
  [{ text: "🔥 Примеры работ", callback_data: "ex" }, { text: "💰 Цены", callback_data: "prices" }],
  [{ text: "🧮 Калькулятор", callback_data: "calc" }, { text: "🎟 Скидки до −20%", callback_data: "disc" }],
  [{ text: "💳 Оплата", callback_data: "pay" }, { text: "⏱ Сроки и правки", callback_data: "terms" }],
  [{ text: "📝 Как заказать", callback_data: "how" }, { text: "❓ Вопросы", callback_data: "faq" }],
  [{ text: "👩‍🎨 О Светлане", callback_data: "about" }, { text: "🤝 Пригласить друга", callback_data: "invite" }],
  [{ text: "💬 Позвать Светлану", callback_data: "human" }],
] };
const BACK = [{ text: "🛒 Оформить заказ", callback_data: "order" }, { text: "⬅️ Меню", callback_data: "menu" }];
const kb = (rows) => ({ inline_keyboard: rows });

// ---------- Telegram API ----------
async function tg(env, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  return r.json().catch(() => ({}));
}
const send = (env, chat_id, text, reply_markup, extra = {}) =>
  tg(env, "sendMessage", { chat_id, text, parse_mode: "HTML", disable_web_page_preview: true, reply_markup, ...extra });

// медиа с запасным вариантом текстом
async function media(env, chat, kind, file, caption, reply_markup) {
  const method = { photo: "sendPhoto", video: "sendVideo", anim: "sendAnimation" }[kind];
  const field = kind === "anim" ? "animation" : kind;
  const body = { chat_id: chat, [field]: file.startsWith("http") ? file : IMG + file, caption, parse_mode: "HTML", reply_markup };
  if (kind !== "photo") body.supports_streaming = true;
  body.protect_content = true; // запрет пересылки, сохранения и скриншотов в Telegram
  const r = await tg(env, method, body);
  if (!r || r.ok === false) return send(env, chat, caption, reply_markup);
  return r;
}
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// ---------- примеры работ ----------
const SPH_EMOJI = { beauty: "💅", food: "🍰", kids: "🧸", consult: "🧠", house: "🏠", auto: "🚗", pets: "🐾", fit: "💪", other: "✨" };
async function showSpheres(env, chat) {
  const ks = Object.keys(CAT).filter((k) => CAT[k].length), rows = [];
  for (let i = 0; i < ks.length; i += 2) rows.push(ks.slice(i, i + 2).map((k) => ({ text: `${SPH_EMOJI[k] || ""} ${SPHERES[k]}`, callback_data: "cat:" + k })));
  rows.push([{ text: "🎲 Удиви меня", callback_data: "rnd" }, { text: "⬅️ Меню", callback_data: "menu" }]);
  const total = Object.values(CAT).flat().reduce((n, i) => n + i.r.length, 0);
  return media(env, chat, "anim", "kit.mp4", `🔥 <b>Примеры работ</b> — ${total}+ постеров в разных стилях.

Выберите сферу — покажу работы, а понравившийся стиль сделаю для вашего бизнеса 👇`, kb(rows));
}
async function showSphere(env, chat, k) {
  const items = CAT[k] || []; const rows = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2).map((it, x) => ({ text: `${it.n} · ${it.r.length}`, callback_data: `it:${k}:${i + x}` })));
  rows.push([{ text: "⬅️ Все сферы", callback_data: "ex" }, { text: "⬅️ Меню", callback_data: "menu" }]);
  return media(env, chat, "anim", `sphv-${k}.mp4`, `${SPH_EMOJI[k] || ""} <b>${esc(SPHERES[k])}</b>

Выберите услугу — пришлю примеры постеров 👇`, kb(rows));
}
async function showItem(env, chat, k, idx) {
  const it = (CAT[k] || [])[idx]; if (!it) return showSpheres(env, chat);
  const refs = it.r.slice(0, 10);
  const r = await tg(env, "sendMediaGroup", { chat_id: chat, protect_content: true, media: refs.map(([f, t], i) => ({ type: "photo", media: IMG + f, caption: i === 0 ? `<b>${esc(it.n)}</b> · стиль «${esc(t)}»` : `«${esc(t)}»`, parse_mode: "HTML" })) });
  if (!r || r.ok === false) for (const [f, t] of refs.slice(0, 3)) await media(env, chat, "photo", f, `<b>${esc(it.n)}</b> · «${esc(t)}»`);
  const rows = [];
  for (let i = 0; i < refs.length; i += 2) rows.push(refs.slice(i, i + 2).map(([, t], x) => ({ text: `💛 Хочу «${t}»`, callback_data: `w:${k}:${idx}:${i + x}` })));
  rows.push([{ text: "⬅️ Другие услуги", callback_data: "cat:" + k }, { text: "⬅️ Меню", callback_data: "menu" }]);
  return send(env, chat, `✨ <b>${esc(it.n)}</b> — какой стиль нравится?
Нажмите — и я оформлю заявку: такой же дизайн, но с вашим названием, ценами и контактами.

Постер — 990 ₽ · пакет из 4 форматов — 2 590 ₽
🎟 −10% по промокоду <code>${PROMO}</code>`, kb(rows));
}
async function showRandom(env, chat) {
  const k = pick(Object.keys(CAT).filter((x) => CAT[x].length)), idx = Math.floor(Math.random() * CAT[k].length), it = CAT[k][idx], ri = Math.floor(Math.random() * it.r.length), [f, t] = it.r[ri];
  return media(env, chat, "photo", f, `🎲 <b>${esc(it.n)}</b> · стиль «${esc(t)}»
${SPH_EMOJI[k] || ""} ${esc(SPHERES[k])}

Такой же — с вашим названием и ценами — от 990 ₽.`, kb([[{ text: "💛 Хочу такой же", callback_data: `w:${k}:${idx}:${ri}` }], [{ text: "🎲 Ещё", callback_data: "rnd" }, { text: "🔥 Все примеры", callback_data: "ex" }], [{ text: "⬅️ Меню", callback_data: "menu" }]]));
}

// ---------- квиз ----------
const MOODS = [
  ["🌸 Нежно и спокойно", "Нежная эстетика", ["Нежный", "Нежный бьюти", "Шёлк и сатин", "Минимализм", "Эко", "Вязаный"]],
  ["⚡ Ярко и смело", "Смелый поп", ["Поп-арт", "Кибер-гламур", "Y2K", "Глянцевый 3D"]],
  ["💎 Дорого и премиально", "Тихая роскошь", ["Люкс", "Тёмный люкс", "Премиум", "Жидкий хром", "Арт-эдиториал"]],
  ["🦄 Сказочно и необычно", "Арт-сказка", ["Сюрреализм", "Детский", "Глянцевый 3D", "Ретро"]],
];
const WHERE = [["📱 В соцсети и мессенджеры", "poster"], ["🖨 Для печати: визитки, сертификаты", "combo"], ["🔥 Везде и сразу", "pack"]];
async function quizStep(env, chat, s, step) {
  if (step === 1) { const ks = Object.keys(CAT).filter((k) => CAT[k].length), rows = [];
    for (let i = 0; i < ks.length; i += 2) rows.push(ks.slice(i, i + 2).map((k) => ({ text: `${SPH_EMOJI[k]} ${SPHERES[k]}`, callback_data: "q1:" + k })));
    return send(env, chat, "🔮 <b>Квиз «Какой стиль ваш?»</b>\n3 вопроса — и я подберу постеры именно под ваш бизнес.\n\n<b>Вопрос 1 из 3.</b> Чем вы занимаетесь?", kb(rows)); }
  if (step === 2) return send(env, chat, "<b>Вопрос 2 из 3.</b> Какое настроение должно быть у рекламы?", kb(MOODS.map(([n], i) => [{ text: n, callback_data: "q2:" + i }])));
  if (step === 3) return send(env, chat, "<b>Вопрос 3 из 3.</b> Где будет жить ваша реклама?", kb(WHERE.map(([n], i) => [{ text: n, callback_data: "q3:" + i }])));
}
async function quizResult(env, chat, s) {
  const k = s.q.k, mood = MOODS[s.q.m], rec = SERVICES[WHERE[s.q.w][1]];
  let pool = [];
  (CAT[k] || []).forEach((it, i) => it.r.forEach((r, ri) => { if ((r[2] || "").split("|").some((x) => mood[2].includes(x))) pool.push([i, ri]); }));
  if (pool.length < 4) (CAT[k] || []).forEach((it, i) => it.r.forEach((r, ri) => { if (!pool.some(([a, b]) => a === i && b === ri)) pool.push([i, ri]); }));
  pool = pool.sort(() => Math.random() - 0.5).slice(0, 4);
  if (pool.length) await tg(env, "sendMediaGroup", { chat_id: chat, protect_content: true, media: pool.map(([i, ri], x) => ({ type: "photo", media: IMG + CAT[k][i].r[ri][0], caption: x === 0 ? `✨ Ваш стиль — «${mood[1]}»` : "", parse_mode: "HTML" })) });
  const rows = pool.map(([i, ri]) => [{ text: `💛 Хочу «${CAT[k][i].r[ri][1]}» (${CAT[k][i].n})`, callback_data: `w:${k}:${i}:${ri}` }]);
  rows.push([{ text: "🔄 Пройти ещё раз", callback_data: "quiz" }, { text: "⬅️ Меню", callback_data: "menu" }]);
  return send(env, chat, `🔮 <b>Ваш результат: «${mood[1]}»</b>
${SPH_EMOJI[k]} ${esc(SPHERES[k])} · ${mood[0]}

Вот 4 постера под ваше настроение. Выберите любимый — сделаю такой же с вашим названием и ценами.

💡 Вам подойдёт: <b>${esc(rec.n)}</b> — ${priceStr(rec)}
🎟 −10% по промокоду <code>${PROMO}</code> до ${promoUntil()}`, kb(rows));
}

// ---------- статусы заказа ----------
const STATUS = {
  work: ["🛠 В работе", (o) => `🛠 <b>Светлана взяла ваш заказ в работу!</b>

${o ? "Срок: " + (o.urgent && SERVICES[o.svc]?.design ? "24 часа" : SERVICES[o.svc]?.d || "по договорённости") + ".\n" : ""}Если что-то понадобится — она напишет здесь. Можно присылать материалы прямо в этот чат 📎`],
  pay: ["💳 Жду предоплату", () => `💳 <b>Заказ согласован!</b>

Предоплата 50% — СБП на <b>Сбербанк</b> по номеру <code>${PHONE}</code>.
После оплаты пришлите сюда скриншот — и работа начнётся. 🧾 Чек самозанятой пришлём сразу.`],
  draft: ["🎨 Эскиз готов", () => `🎨 <b>Первый вариант готов!</b>

Светлана присылает его сюда. Посмотрите и напишите правки, если нужны — 2 круга правок бесплатно ✏️`],
  done: ["✅ Готово", () => `✅ <b>Ваш заказ готов!</b> 🎉

Спасибо, что выбрали VISUALL 💛
Оставьте отзыв — и получите <b>−15%</b> на следующий заказ. А если приведёте друга — скидка −15% вам обоим.`],
  cancel: ["❌ Отменён", () => `Заказ отменён. Если передумаете — нажмите «Оформить заказ», будем рады помочь 💛`],
};
const statusKb = (uid, cur) => kb([
  ["work", "pay"].map((c) => ({ text: (cur === c ? "• " : "") + STATUS[c][0], callback_data: `st:${uid}:${c}` })),
  ["draft", "done"].map((c) => ({ text: (cur === c ? "• " : "") + STATUS[c][0], callback_data: `st:${uid}:${c}` })),
  [{ text: (cur === "cancel" ? "• " : "") + STATUS.cancel[0], callback_data: `st:${uid}:cancel` }],
]);
const isAdmin = (u) => u && u.username && u.username.toLowerCase() === ADMIN_USERNAME;

// ---------- друзья ----------
const refLink = (uid) => `https://t.me/${"visuall_sveta_bot"}?start=ref_${uid}`;
async function showInvite(env, chat, user) {
  const link = refLink(user.id);
  const share = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Нашла классную рекламу для бизнеса — VISUALL 🎨 По моей ссылке тебе −15% на первый заказ 🎁")}`;
  return send(env, chat, `🤝 <b>Приведите друга — получите −15% оба</b>

Ваша личная ссылка:
${link}

Отправьте её друзьям с бизнесом. Когда друг оформит заказ по ссылке, ему — скидка 15%, а вам — 15% на следующий заказ. Я сама сообщу вам, когда это случится 🎁`, kb([[{ text: "📤 Отправить другу", url: share }], [{ text: "⬅️ Меню", callback_data: "menu" }]]));
}

// ---------- напоминания и рассылка (cron) ----------
const markStarted = (env, uid, chat) => env.KV.put("ab:" + uid, "1", { expirationTtl: 86400 * 3, metadata: { t: Date.now(), chat } }).catch(() => {});
const clearStarted = (env, uid) => env.KV.delete("ab:" + uid).catch(() => {});
async function cronTick(env) {
  // напоминания о брошенных заявках (через 20 часов)
  const ab = await env.KV.list({ prefix: "ab:", limit: 100 });
  let n = 0;
  for (const k of ab.keys) {
    if (n >= 15) break;
    const t = k.metadata?.t || 0; if (Date.now() - t < 20 * 3600e3) continue;
    await send(env, k.metadata.chat, `👋 Вы начали оформлять заказ в VISUALL, но не закончили.

Ваш промокод <code>${PROMO}</code> (−10%) действует до ${promoUntil()} 🔥
Продолжим? Это займёт минуту.`, kb([[{ text: "🛒 Продолжить заказ", callback_data: "resume" }], [{ text: "🔥 Посмотреть примеры", callback_data: "ex" }]]));
    await env.KV.delete(k.name); n++;
  }
  // рассылка порциями
  const job = JSON.parse((await env.KV.get("bc")) || "null");
  if (job && job.go) await runBroadcast(env, job, 35);
}
async function runBroadcast(env, job, limit) {
  const l = await env.KV.list({ prefix: "u:", limit, cursor: job.cursor || undefined });
  const unsub = kb([[{ text: "🛒 Оформить заказ", callback_data: "order" }, { text: "⬅️ Меню", callback_data: "menu" }], [{ text: "🔕 Не присылать новости", callback_data: "unsub" }]]);
  for (const k of l.keys) {
    const id = k.name.slice(2);
    const r = job.photo ? await tg(env, "sendPhoto", { chat_id: id, photo: job.photo, caption: job.text, parse_mode: "HTML", reply_markup: unsub })
                        : await send(env, id, job.text, unsub);
    if (r && r.ok) job.sent = (job.sent || 0) + 1;
    else if (r && r.error_code === 403) await env.KV.delete(k.name);
  }
  if (l.list_complete) { await env.KV.delete("bc"); const admin = await getAdmin(env); if (admin) await send(env, admin, `📣 Рассылка завершена: доставлено ${job.sent || 0}.`); }
  else { job.cursor = l.cursor; await env.KV.put("bc", JSON.stringify(job)); }
}

// ---------- состояние ----------
const getS = async (env, id) => JSON.parse((await env.KV.get("s:" + id)) || "null") || {};
const setS = (env, id, s) => env.KV.put("s:" + id, JSON.stringify(s), { expirationTtl: 86400 * 3 });
const getAdmin = async (env) => (await env.KV.get("admin")) || null;

// ---------- расчёт ----------
function calc(o) {
  const s = SERVICES[o.svc]; if (!s) return null;
  const base = s.p, urg = o.urgent && s.design ? Math.round(base * 0.5) : 0;
  const pct = s.design ? (DISC[o.disc || "no"] || DISC.no)[1] : 0;
  const disc = Math.round((base + urg) * pct / 100);
  return { s, base, urg, pct, disc, total: base + urg - disc };
}
function summary(o, forAdmin = false, user = null) {
  const c = calc(o); const s = c.s; const L = [];
  L.push(forAdmin ? "🔔 <b>Новая заявка VISUALL</b>" : "📋 <b>Ваша заявка</b>");
  if (forAdmin && user) L.push(`👤 ${esc([user.first_name, user.last_name].filter(Boolean).join(" "))}${user.username ? " (@" + esc(user.username) + ")" : ""}`);
  L.push(`🛍 Услуга: <b>${esc(o.svc === "combo" && o.fmt ? "Комбо: постер + " + o.fmt : s.n)}</b> — ${priceStr(s)}`);
  if (o.sphere) L.push(`🏷 Сфера: ${esc(SPHERES[o.sphere] || o.sphere)}`);
  if (o.biz) L.push(`🏪 Бизнес: ${esc(o.biz)}`);
  if (o.style) L.push(`🎨 Стиль / идея: ${esc(o.style)}`);
  if (o.content) L.push(`📝 Текст на рекламе: ${esc(forAdmin ? o.content : (o.content.length > 160 ? o.content.slice(0, 160) + "…" : o.content))}`);
  if (o.task) L.push(`🧩 Задача: ${esc(forAdmin ? o.task : (o.task.length > 160 ? o.task.slice(0, 160) + "…" : o.task))}`);
  if (o.contacts) L.push(`📍 Контакты на рекламе: ${esc(o.contacts)}`);
  if (o.files) L.push(`📎 Файлы: ${o.files.length ? o.files.length + " шт." : "нет"}`);
  if (o.wishes) L.push(`💭 Пожелания: ${esc(o.wishes)}`);
  if (s.design) L.push(`⚡ Срочно: ${o.urgent ? "да, +50% (" + rub(c.urg) + ")" : "нет"}`);
  if (c.pct) L.push(`🎟 Скидка: ${esc(DISC[o.disc][0])} −${c.pct}% (−${rub(c.disc)})`);
  if (s.p) L.push(`💰 Итого: <b>${s.from ? "от " : ""}${rub(c.total)}${s.month ? "/мес" : ""}</b>${s.from ? " (точную цену Светлана назовёт после брифа)" : ""}`);
  L.push(`⏱ Срок: ${o.urgent && s.design ? "24 часа" : s.d}`);
  if (o.phone) L.push(`📞 Телефон: ${esc(o.phone)}`);
  if (forAdmin && user) L.push(`\n#id${user.id}`);
  return L.join("\n");
}

// ---------- шаги заказа ----------
async function askService(env, chat) {
  const rows = [["poster", "combo"], ["pack"], ["card", "cert"], ["price", "text"], ["video", "bot"], ["site", "insta"], ["all", "custom"]]
    .map((r) => r.map((k) => ({ text: `${SERVICES[k].n} · ${priceStr(SERVICES[k])}`, callback_data: "svc:" + k })));
  rows.push([{ text: "⬅️ Меню", callback_data: "menu" }]);
  return send(env, chat, "🛒 <b>Шаг 1.</b> Что нужно сделать?", kb(rows));
}
async function askSphere(env, chat) {
  const ks = Object.keys(SPHERES), rows = [];
  for (let i = 0; i < ks.length; i += 2) rows.push(ks.slice(i, i + 2).map((k) => ({ text: SPHERES[k], callback_data: "sph:" + k })));
  return send(env, chat, "🏷 <b>Шаг 2.</b> Какая у вас сфера?", kb(rows));
}
const askBiz = (env, chat) => send(env, chat, "🏪 <b>Шаг 3.</b> Как называется ваш бизнес или как вас зовут как мастера?\n\n<i>Напишите ответ сообщением.</i>");
const askStyle = (env, chat) => send(env, chat, `🎨 <b>Шаг 4.</b> Какой стиль понравился в каталоге? Напишите название или опишите идею.\n\nКаталог: ${SITE}`, kb([[{ text: "Пока не выбрал(а) — помогите подобрать", callback_data: "style:help" }]]));
async function askOptions(env, chat, o) {
  const s = SERVICES[o.svc];
  if (!s.design) return askPhone(env, chat);
  const rows = Object.entries(DISC).map(([k, [n, p]]) => [{ text: `${o.disc === k ? "✅ " : ""}${n}${p ? " −" + p + "%" : ""}`, callback_data: "disc:" + k }]);
  rows.unshift([{ text: `${o.urgent ? "✅" : "⬜️"} Срочно за 24 часа (+50%)`, callback_data: "urg" }]);
  rows.push([{ text: "Дальше ➡️", callback_data: "opt:done" }]);
  return send(env, chat, `⚙️ <b>Почти готово.</b> Срочность и скидка\n\n${summary(o)}`, kb(rows));
}
const askPhone = (env, chat) => send(env, chat, "📞 Последнее: оставьте телефон для связи — нажмите кнопку ниже или напишите номер.", {
  keyboard: [[{ text: "📱 Отправить мой номер", request_contact: true }], [{ text: "Пропустить" }]], resize_keyboard: true, one_time_keyboard: true,
});
async function showConfirm(env, chat, o) {
  await send(env, chat, "Готово ✨", { remove_keyboard: true });
  return send(env, chat, summary(o) + "\n\nВсё верно?", kb([[{ text: "✅ Отправить Светлане", callback_data: "confirm" }], [{ text: "✏️ Заново", callback_data: "order" }, { text: "⬅️ Меню", callback_data: "menu" }]]));
}


// ---------- бриф: собираем всё, что нужно для работы ----------
const TASK_Q = {
  video: "🎬 <b>Расскажите о ролике.</b> Что оживляем — ваш постер, фото работы, товар? Для чего ролик: Reels, сторис, реклама? Есть ли пример, который нравится?",
  bot: "🤖 <b>Расскажите о боте.</b> Что он должен уметь: показывать услуги и цены, принимать заявки, записывать на время, отвечать на вопросы? Куда присылать заявки?",
  site: "💻 <b>Расскажите о сайте.</b> Какие разделы нужны (услуги, цены, примеры, отзывы, контакты)? Есть ли домен? Есть ли сайт, который нравится?",
  insta: "📱 <b>Расскажите об Instagram.</b> Пришлите ссылку на профиль (если есть), что продаёте и какая цель: больше заявок, узнаваемость, запуск?",
  all: "✨ <b>Расскажите о задаче.</b> Что уже есть (логотип, сайт, Instagram) и что нужно сделать в первую очередь?",
  custom: "🎨 <b>Опишите идею.</b> Что за реклама, где будет размещаться, какое настроение? Если есть пример — пришлите на следующем шаге.",
};
const askContent = (env, chat, o) => send(env, chat, `📝 <b>Шаг 5. Что написать на рекламе?</b>\nПришлите одним сообщением: заголовок или главную мысль, список услуг с ценами, акцию — всё, что должно быть на ${o.svc === "card" ? "визитке" : o.svc === "cert" ? "сертификате (номинал, на что можно потратить, срок)" : o.svc === "price" ? "прайсе" : o.svc === "text" ? "тексте (о чём рассказать, что предлагаете)" : "рекламе"}.\n\n<i>Например: «Маникюр с покрытием — 1 800 ₽, наращивание — 2 500 ₽, дизайн в подарок при первой записи».</i>`, kb([[{ text: "🎰 Нет слогана? Взять с сайта", url: SITE + "#slogan" }], [{ text: "Пришлю позже", callback_data: "br:content:skip" }]]));
const askContacts = (env, chat) => send(env, chat, "📍 <b>Шаг 6. Какие контакты разместить?</b>\nТелефон, адрес, Instagram, Telegram, сайт — как будет на рекламе. QR-код сделаем на любой из них.", kb([[{ text: "Такие же, как телефон для связи", callback_data: "br:contacts:same" }], [{ text: "Пришлю позже", callback_data: "br:contacts:skip" }]]));
const askTask = (env, chat, o) => send(env, chat, (TASK_Q[o.svc] || TASK_Q.custom) + "\n\n<i>Напишите ответ одним сообщением.</i>", kb([[{ text: "Обсудим со Светланой", callback_data: "br:task:skip" }]]));
const askFiles = (env, chat, o) => send(env, chat, `📎 <b>Логотип и фото.</b>\nЕсли есть логотип, фото работ, товара, интерьера или пример, который нравится, — пришлите сюда (можно несколько). ${o.files && o.files.length ? `\n\nПолучено файлов: <b>${o.files.length}</b>` : ""}\n\nКогда всё отправите — нажмите «Готово».`, kb([[{ text: o.files && o.files.length ? "✅ Готово" : "Нет логотипа и фото", callback_data: "br:files:done" }]]));
const askWishes = (env, chat) => send(env, chat, "💭 <b>Пожелания.</b> Цвета, настроение, что точно должно быть или чего не нужно? Напишите или пропустите.", kb([[{ text: "Без пожеланий — доверяю", callback_data: "br:wishes:skip" }]]));
async function askStep(env, chat, s) {
  const o = s.o || {};
  switch (s.step) {
    case "svc": return askService(env, chat);
    case "sph": return askSphere(env, chat);
    case "biz": return askBiz(env, chat);
    case "style": return askStyle(env, chat);
    case "content": return askContent(env, chat, o);
    case "contacts": return askContacts(env, chat);
    case "task": return askTask(env, chat, o);
    case "files": return askFiles(env, chat, o);
    case "wishes": return askWishes(env, chat);
    case "opt": return askOptions(env, chat, o);
    case "phone": return askPhone(env, chat);
    case "confirm": return showConfirm(env, chat, o);
  }
  return null;
}
async function nextStep(env, chat, user, s, from) {
  const design = SERVICES[s.o.svc]?.design;
  const order = design ? ["content", "contacts", "files", "wishes", "opt", "phone", "confirm"] : ["task", "files", "phone", "confirm"];
  const i = order.indexOf(from);
  s.step = i < 0 ? order[0] : order[i + 1];
  await setS(env, user.id, s);
  return askStep(env, chat, s);
}
const STEP_TEXT = new Set(["biz", "style", "content", "contacts", "task", "wishes"]);

// ---------- калькулятор ----------
async function showCalc(env, chat, o, msgId) {
  const short = { poster: "Постер", combo: "Комбо", pack: "Пакет из 4", card: "Визитка", cert: "Сертификат", price: "Прайс", text: "Текст" };
  const rows = [["poster", "combo", "pack"], ["card", "cert"], ["price", "text"]].map((r) => r.map((k) => ({ text: `${o.svc === k ? "✅ " : ""}${short[k]} · ${rub(SERVICES[k].p)}`, callback_data: "c:svc:" + k })));
  rows.push([{ text: `${o.urgent ? "✅" : "⬜️"} Срочно +50%`, callback_data: "c:urg" }]);
  rows.push(Object.entries(DISC).filter(([k]) => k !== "no").map(([k, [, p]]) => ({ text: `${o.disc === k ? "✅" : ""}−${p}%`, callback_data: "c:disc:" + k })));
  rows.push([{ text: "🛒 Оформить такой заказ", callback_data: "c:order" }], [{ text: "⬅️ Меню", callback_data: "menu" }]);
  const c = calc(o);
  const text = `🧮 <b>Калькулятор</b>\nВыберите формат, срочность и скидку (−10% промокод, −15% отзыв, −20% «было — стало», −15% друг):\n\n${esc(c.s.n)}: ${rub(c.base)}${c.urg ? `\nСрочно: +${rub(c.urg)}` : ""}${c.pct ? `\nСкидка −${c.pct}%: −${rub(c.disc)}` : ""}\n\n💰 <b>Итого: ${rub(c.total)}</b>\n⏱ Срок: ${o.urgent ? "24 часа" : c.s.d}\n\nВидео, бот, сайт и Instagram — цену назовёт Светлана после брифа.`;
  if (msgId) return tg(env, "editMessageText", { chat_id: chat, message_id: msgId, text, parse_mode: "HTML", reply_markup: kb(rows) });
  return send(env, chat, text, kb(rows));
}

// ---------- свободный текст: ответы по ключевым словам ----------
const KW = [
  [/(цен|стоит|стоимост|прайс|сколько)/i, "prices"],
  [/(срок|когда будет|как быстро|долго|срочно)/i, "terms"],
  [/(правк|исправ|переделат)/i, "terms"],
  [/(оплат|перевод|карт|сбп|реквизит|заплат)/i, "pay"],
  [/(скидк|промо|акци|бонус|дешевле)/i, "disc"],
  [/(чек|самозанят)/i, "pay"],
  [/(как заказ|заказать|оформ|хочу)/i, "order"],
  [/(что прислать|что нужно|материал)/i, "how"],
  [/(пример|каталог|стил[ьяеи]|портфол|ваши работ)/i, "catalog"],
  [/^(привет|здравствуй|добрый|hi|hello|start)/i, "menu"],
];


// ---------- умные ответы: бот отвечает сам, Светлане — только то, на что ответа нет ----------
const ITEM_RE = [
  ["card", /визитк/], ["cert", /сертификат/], ["text", /(рекламн\S* текст|текст[аы]? для рекламы|10 вариантов|копирайт)/],
  ["price", /(прайс на|сделать прайс|нужен прайс|прайс-лист для|прайс для|меню для кафе|прайс \d)/],
  ["combo", /комбо/], ["pack", /(пакет|комплект|все форматы|4 формата)/], ["poster", /(постер|афиш|плакат|баннер|флаер|листовк)/],
  ["video", /(видео|reels|рилс|ролик|анимац|оживить)/], ["bot", /(телеграм-?бот|чат-?бот|(?<![а-яa-z])бот(а|у|ом)?(?![а-яa-z]))/],
  ["site", /(сайт|лендинг|landing)/], ["insta", /(инстаграм|instagram|инсту|инста(?![а-яa-z])|ведение|smm|смм|контент-план|сторис)/], ["all", /(под ключ|всё сразу|все сразу)/],
];
const STOP = new Set(["услуг", "уроки", "дизай", "ремон", "салон", "мастер", "реклам"]);
const ALIAS = [];
for (const [k, items] of Object.entries(CAT)) items.forEach((it, i) => it.n.toLowerCase().replace(/[^а-яёa-z ]/g, " ").split(/\s+/).filter((w) => w.length >= 4).forEach((w) => { const st = w.slice(0, 5); if (!STOP.has(st)) ALIAS.push([st, k, i]); }));
const SPH_WORDS = [["beauty", /(салон|бьюти|beauty|красот|ногт|ресниц|бров|волос|эпиляц|космет|массаж|тату)/], ["food", /(кафе|кофе|ресторан|еда|доставк|пекарн|торт|десерт|пицц|кондитер|(?<![а-яa-z])бар(?![а-яa-z]))/],
  ["kids", /(дет|ребён|ребен|школ|репетит|логопед|няня|(?<![а-яa-z])сад(?![а-яa-z])|танц|музык|английск)/], ["consult", /(психолог|консульт|коуч|астролог|психиатр)/], ["house", /(ремонт|клининг|уборк|сантехн|электрик|интерьер|потолк|балкон|мастер на час)/],
  ["auto", /(авто|машин|шиномонтаж|(?<![а-яa-z])сто(?![а-яa-z])|автосервис)/], ["pets", /(груминг|собак|кошк|животн|питомц|ветеринар)/], ["fit", /(фитнес|тренер|йог|пилатес|спорт|похуд|нутрициолог|(?<![а-яa-z])зал(?![а-яa-z]))/], ["other", /(фотограф|дизайнер)/]];
function findItem(t) {
  for (const [st, k, i] of ALIAS) if (t.includes(st)) return [k, i];
  return null;
}
const A = {
  itemPrice: (k) => { const sv = SERVICES[k]; return `💰 <b>${esc(sv.n)}</b> — ${priceStr(sv)}\n⏱ Срок: ${sv.d}\n✅ Что входит: ${esc(sv.inc)}.${sv.design ? `\n\n🎟 −10% по промокоду <code>${PROMO}</code> до ${promoUntil()}. Срочно за 24 часа — +50%.` : "\n\nТочную цену Светлана назовёт после короткого брифа."}`; },
  urgent: () => `⚡ <b>Срочно — да, можно!</b>\nЗа 24 часа делаю постер, визитку, сертификат, прайс, текст, комбо или пакет — +50% к цене.\nНапример: постер срочно — 1 485 ₽, пакет из 4 форматов срочно — 3 885 ₽.\n\nСрок считается с момента, когда пришли все материалы и предоплата.`,
  refund: () => `🤝 <b>Гарантии</b>\n• Предоплата 50% — только после согласования заказа\n• Если работа ещё не начата — предоплата возвращается полностью\n• В постер, комбо и пакет входят 2 круга правок бесплатно (видео — 1, сайт — 3)\n• Дополнительный круг правок — 300 ₽\n• Захотите сменить стиль после согласования — новый вариант со скидкой 50%\n• Готовые файлы — после полной оплаты, официальный чек самозанятой`,
  receipt: () => `🧾 <b>Да, чек будет.</b> Светлана работает как самозанятая и после каждой оплаты присылает официальный чек из «Мой налог». Он подходит и физлицам, и ИП, и компаниям.\n\nОплата — СБП на Сбербанк по номеру <code>${PHONE}</code>, предоплата 50% после согласования заказа.`,
  formats: () => `🖼 <b>В каком виде вы получите рекламу</b>\n• Картинки для соцсетей и мессенджеров — 1080×1350\n• PDF для типографии: визитка 90×50 мм с двух сторон, сертификат 210×99 мм, прайс на 3 страницы\n• Видео — вертикальное, для Reels и сторис\n\nФайлы присылаются в Telegram сразу после полной оплаты. PDF можно сразу отдавать в любую типографию.`,
  photos: () => `📸 <b>Конечно, можно со своими фото!</b>\nПришлите фото работы, товара, интерьера или себя — Светлана превратит его в рекламный постер в выбранном стиле. Логотип, если есть, тоже пригодится.\n\nМожно прислать фото прямо сюда — я передам.`,
  custom: () => `🎨 <b>Да, можно дизайн не из каталога.</b>\nОпишите идею — Светлана предложит, как её воплотить. Оформите заявку «Свой дизайн / другое» — это займёт минуту.`,
  online: () => `🌍 <b>Работаем онлайн</b> — всё общение и файлы в Telegram, поэтому город не важен. Вы присылаете материалы, получаете макеты, вносите правки и забираете готовые файлы прямо в чате.`,
  hours: () => `🕐 Я, бот, работаю круглосуточно — заявку можно оставить в любое время. Светлана ответит, как только увидит сообщение.`,
  contacts: () => `📱 <b>Контакты</b>\nTelegram: @sveta_muzyka\nТелефон: ${PHONE}\nСайт: ${SITE}\nА заказ можно оформить прямо здесь, в боте, — за минуту.`,
  reviewsAsk: () => `⭐ Отзывы клиентов собираются после каждого заказа и появляются на сайте. А пока можно посмотреть ${Object.values(CAT).flat().reduce((n, i) => n + i.r.length, 0)}+ примеров работ — и выбрать стиль под себя.`,
  thanks: () => `Пожалуйста! 💛 Если появятся вопросы — пишите, я на связи круглосуточно.`,
  styles: () => `🎨 <b>Стили</b>: люкс и тёмный люкс, нежный, минимализм, поп-арт, глянцевый 3D, жидкий хром, сюрреализм, ретро, арт-эдиториал, кибер-гламур, Y2K и другие.\n\nПройдите квиз — подберу 4 постера под ваше настроение за 30 секунд 🔮`,
  difference: () => `📦 <b>Чем отличаются форматы</b>\n• <b>Постер</b> (990 ₽) — одна яркая реклама для соцсетей и печати\n• <b>Комбо</b> (1 490 ₽) — постер + визитка, сертификат или прайс в одном стиле\n• <b>Пакет из 4</b> (2 590 ₽) — постер, визитка, сертификат и прайс: вся реклама в одном стиле. Выгоднее всего — отдельно это стоило бы 3 560 ₽`,
};
function smart(raw, user) {
  const t = " " + raw.toLowerCase().replace(/ё/g, "е") + " ";
  const out = [];
  const isRev = /(правк|правок|исправ|передел|изменени|поменять|внести)/.test(t);
  const isPrice = /(цен[аыу]|стоит|стоимост|по чем|почем|прайс(?![а-яa-z])|расценк|бюджет)/.test(t) || (/сколько/.test(t) && !/(правк|правок|дней|времени|ждать|срок|делает|займ|готов)/.test(t));
  const isTime = /(срок|сколько дней|как быстро|когда будет|когда готов|долго|по времени|делается|займет|займёт)/.test(t);
  const isWant = /(хочу|нужн|заказать|закажу|оформ|сделайте|сделать)/.test(t);
  let item = null; for (const [k, re] of ITEM_RE) if (re.test(t)) { item = k; break; }
  if (/(привет|здравств|добрый (день|вечер|утро)|доброе утро|hello|(?<![а-яa-z])hi(?![а-яa-z])|салют)/.test(t) && raw.length < 40) return [{ route: "menu" }];
  if (/(спасибо|благодар|(?<![а-яa-z])спс(?![а-яa-z]))/.test(t) && raw.length < 60) return [{ text: A.thanks(), kb: MAIN_KB }];
  if (/(срочн|сегодня|до завтра|за сутки|24 час|горит)/.test(t)) out.push({ text: A.urgent(), kb: kb([BACK]) });
  if (/(чем отлича|разниц|что выбрать|что лучше|посоветуй)/.test(t) && (!item || ["poster", "combo", "pack"].includes(item))) return [{ text: A.difference(), kb: kb([BACK, [{ text: "🔮 Подобрать стиль — квиз", callback_data: "quiz" }]]) }];
  if (item && (isPrice || isTime || /что входит|чем отлич|включено/.test(t))) out.push({ text: A.itemPrice(item), kb: kb([[{ text: "🛒 Заказать: " + SERVICES[item].n.split(" (")[0].split(":")[0], callback_data: "svc0:" + item }], [{ text: "⬅️ Меню", callback_data: "menu" }]]) });
  else if (item && isWant) { let sph = null; for (const [k, re] of SPH_WORDS) if (re.test(t)) { sph = k; break; } out.push({ startSvc: item, sphere0: sph }); }
  if (/(чем отлича|разниц|что выбрать|что лучше|посоветуй)/.test(t) && !item) out.push({ text: A.difference(), kb: kb([BACK, [{ text: "🔮 Подобрать стиль — квиз", callback_data: "quiz" }]]) });
  if (!out.length && isPrice && !isRev) out.push({ route: "prices" });
  if (!out.length && isTime) out.push({ route: "terms" });
  if (isRev) out.push({ route: "terms" });
  if (/(вернете|вернуть|возврат|гарант|не понрав)/.test(t)) out.push({ text: A.refund(), kb: kb([BACK]) });
  if (/((?<![а-яa-z])чек(?![а-яa-z])|самозанят|налог)/.test(t)) out.push({ text: A.receipt(), kb: kb([BACK]) });
  else if (/(оплат|оплач|перевод|карт[ауоы]|сбп|реквизит|заплат|предоплат|наличн|сбер)/.test(t)) out.push({ route: "pay" });
  if (/(формат|размер|pdf|пдф|печат|типограф|разрешени|исходник|макет)/.test(t) && !item) out.push({ text: A.formats(), kb: kb([BACK]) });
  if (/(сво[еий]\S* фото|мои фото|моих фото|по фото|из фото|фото работ|фотографи[июй] (работ|товар|торт|моих|своих)|свою картинк)/.test(t)) out.push({ text: A.photos(), kb: kb([BACK]) });
  if (/(не из каталога|сво[йя] (дизайн|иде)|уникальн|индивидуальн|по моему эскизу|по референс)/.test(t)) out.push({ text: A.custom(), kb: kb([[{ text: "🛒 Заявка «Свой дизайн»", callback_data: "svc0:custom" }], [{ text: "⬅️ Меню", callback_data: "menu" }]]) });
  if (/(скидк|промо|акци|бонус|дешевле|купон|подешевле)/.test(t)) out.push({ route: "disc" });
  if (/(друг|подруг|пригла|реферал|посоветовал)/.test(t) && !/(как у друг|для друг)/.test(t)) out.push({ route: "invite" });
  if (/(отзыв)/.test(t)) out.push(/(оставить|написать|хочу).{0,15}отзыв/.test(t) ? { route: "review" } : { text: A.reviewsAsk(), kb: kb([[{ text: "🔥 Примеры работ", callback_data: "ex" }], BACK]) });
  if (/(что прислать|что нужно от меня|что нужно для|какие материалы|что подготовить|что от меня)/.test(t)) out.push({ route: "how" });
  if (/(как заказ|как оформ|с чего начать|как начать|как работа)/.test(t) && !out.length) out.push({ route: "how" });
  if (/(где вы|какой город|в каком городе|москв|офис|адрес|приехать|встрет|онлайн|удаленн|другой город|регион)/.test(t)) out.push({ text: A.online(), kb: kb([BACK]) });
  if (/(часы работы|когда работаете|во сколько|выходны|ночью|круглосуточ|когда ответ)/.test(t)) out.push({ text: A.hours(), kb: kb([BACK]) });
  if (/(телефон|позвон|контакт|связат|номер|whatsapp|ватсап|вацап|почт)/.test(t) && !/(оплат|сбп)/.test(t)) out.push({ text: A.contacts(), kb: kb([[{ text: "Написать @sveta_muzyka", url: "https://t.me/sveta_muzyka" }], BACK]) });
  if (/(кто (вы|делает|ты)|о вас|о себе|светлан|опыт|портфолио)/.test(t)) out.push({ route: "about" });
  if (/(какие стили|стили есть|какой стиль|стиль подобрать|подобрать стиль)/.test(t)) out.push({ text: A.styles(), kb: kb([[{ text: "🔮 Пройти квиз", callback_data: "quiz" }, { text: "🔥 Примеры", callback_data: "ex" }], [{ text: "⬅️ Меню", callback_data: "menu" }]]) });
  if (/(логотип|лого(?![а-я]))/.test(t)) out.push({ text: "✨ Если логотип уже есть — пришлите его, Светлана использует его в дизайне. Про разработку нового логотипа ответит сама Светлана — я передал ей вопрос.", forward: true });
  if (/(договор|оферт|счет на оплату|счёт на оплату|юрлиц|безнал|закрывающ)/.test(t)) out.push({ text: "📄 Про договор и оплату для компании уточнит Светлана — я уже передал ей ваш вопрос, она ответит здесь же. Чек самозанятой выдаётся всегда.", forward: true });
  if (!out.length && item) out.push({ text: A.itemPrice(item), kb: kb([[{ text: "🛒 Заказать", callback_data: "svc0:" + item }], [{ text: "⬅️ Меню", callback_data: "menu" }]]) });
  if (!out.length && /(пример|работ|каталог|покажи|посмотреть|галере)/.test(t)) { const f = findItem(t); out.push(f ? { item: f } : { route: "ex" }); }
  if (!out.length) { const f = findItem(t); if (f) out.push({ item: f }); }
  if (!out.length) { for (const [k, re] of SPH_WORDS) if (re.test(t)) { out.push({ sphere: k }); break; } }
  if (!out.length && isWant) out.push({ route: "order" });
  out.forEach((o) => { if (o.forward) o.raw = raw; });
  const fw = out.find((o) => o.forward), rest = out.filter((o) => !o.forward);
  return fw ? [...rest.slice(0, 1), fw] : out.slice(0, 2);
}
async function runSmart(env, chat, user, res) {
  for (const r of res) {
    if (r.route) await route(env, chat, r.route, user);
    else if (r.text) { await send(env, chat, r.text, r.kb); if (r.forward) await forwardToAdmin(env, user, r.raw || ""); }
    else if (r.item) await showItem(env, chat, r.item[0], r.item[1]);
    else if (r.sphere) await showSphere(env, chat, r.sphere);
    else if (r.startSvc) { const s = await getS(env, user.id); s.o = { disc: s.ref && !s.refDone ? "friend" : "promo" }; if (r.sphere0) s.o.sphere = r.sphere0; s.step = "svc"; await setS(env, user.id, s); await markStarted(env, user.id, chat);
      await onCallback(env, { id: "auto", from: user, data: "svc:" + r.startSvc, message: { chat: { id: chat }, message_id: 0 } }); }
  }
}

async function forwardToAdmin(env, user, text) {
  const admin = await getAdmin(env); if (!admin) return false;
  await send(env, admin, `💬 <b>Вопрос от клиента</b>\n👤 ${esc(user.first_name || "")}${user.username ? " (@" + esc(user.username) + ")" : ""}\n\n${esc(text)}\n\n<i>Ответьте на это сообщение (свайп → «Ответить») — я перешлю ответ клиенту.</i>\n#id${user.id}`);
  return true;
}

async function route(env, chat, key, user, msgId) {
  switch (key) {
    case "menu": return media(env, chat, "video", "hero.mp4", T.hello(user?.first_name), MAIN_KB);
    case "ex": return showSpheres(env, chat);
    case "quiz": { const s = await getS(env, user.id); s.q = {}; await setS(env, user.id, s); return quizStep(env, chat, s, 1); }
    case "invite": return showInvite(env, chat, user);
    case "resume": { const s = await getS(env, user.id);
      if (s.o && s.o.svc && s.step) return askStep(env, chat, s);
      return route(env, chat, "order", user); }
    case "unsub": await env.KV.delete("u:" + user.id); { const s = await getS(env, user.id); s.unsub = 1; await setS(env, user.id, s); }
      return send(env, chat, "🔕 Готово, новости больше не присылаю. Меню всегда здесь: /start");
    case "rnd": return showRandom(env, chat);
    case "prices": return media(env, chat, "photo", "price-v.jpg", T.prices(), kb([BACK, [{ text: "🧮 Рассчитать заказ", callback_data: "calc" }]]));
    case "terms": return send(env, chat, T.terms(), kb([BACK]));
    case "pay": return send(env, chat, T.pay(), kb([BACK]));
    case "disc": return media(env, chat, "anim", "banner.mp4", T.disc(), kb([BACK, [{ text: "⭐ Оставить отзыв", callback_data: "review" }]]));
    case "how": return media(env, chat, "anim", "price.mp4", T.how(), kb([BACK]));
    case "faq": return send(env, chat, T.faq(), kb([BACK]));
    case "about": return media(env, chat, "video", "about.mp4", T.about(), kb([[{ text: "🔥 Примеры работ", callback_data: "ex" }], BACK]));
    case "catalog": return send(env, chat, `🎨 Каталог стилей и примеры — на сайте:\n${SITE}\n\nВыберите стиль, а потом оформите заказ здесь.`, kb([[{ text: "🎨 Открыть каталог", url: SITE }], BACK]));
    case "calc": { const s = await getS(env, user.id); s.c = { svc: "pack", disc: "promo" }; await setS(env, user.id, s); return showCalc(env, chat, s.c); }
    case "order": { const s = await getS(env, user.id); s.o = { disc: s.ref && !s.refDone ? "friend" : "promo" }; s.step = "svc"; await setS(env, user.id, s); await markStarted(env, user.id, chat); return askService(env, chat); }
    case "human": { const s = await getS(env, user.id); s.step = "ask"; await setS(env, user.id, s);
      return send(env, chat, "👩‍🎨 Напишите ваш вопрос одним сообщением — я сразу передам его Светлане, она ответит здесь же.\n\nИли напишите ей напрямую: @sveta_muzyka", kb([[{ text: "Написать @sveta_muzyka", url: "https://t.me/sveta_muzyka" }], [{ text: "⬅️ Меню", callback_data: "menu" }]])); }
    case "review": { const s = await getS(env, user.id); s.step = "review"; await setS(env, user.id, s);
      return send(env, chat, "⭐ Спасибо, что выбрали VISUALL! Поставьте оценку:", kb([[1, 2, 3, 4, 5].map((n) => ({ text: "★".repeat(n), callback_data: "rate:" + n }))])); }
  }
}

// ---------- обработчики ----------
async function onCallback(env, q) {
  const chat = q.message.chat.id, user = q.from, d = q.data || "";
  if (q.id !== "auto") await tg(env, "answerCallbackQuery", { callback_query_id: q.id });
  if (d.startsWith("st:") && isAdmin(user)) {
    const [, uid, code] = d.split(":"); const cs = await getS(env, uid); const o = cs.last || null;
    await send(env, uid, STATUS[code][1](o), code === "done" ? kb([[{ text: "⭐ Оставить отзыв (−15%)", callback_data: "review" }], [{ text: "🤝 Пригласить друга", callback_data: "invite" }]]) : code === "cancel" ? MAIN_KB : undefined);
    await tg(env, "editMessageReplyMarkup", { chat_id: chat, message_id: q.message.message_id, reply_markup: statusKb(uid, code) });
    return send(env, chat, `✅ Клиенту отправлен статус: ${STATUS[code][0]}`);
  }
  if (d === "bc:go" && isAdmin(user)) { const job = JSON.parse((await env.KV.get("bc")) || "null"); if (!job) return send(env, chat, "Рассылка не найдена.");
    job.go = 1; await env.KV.put("bc", JSON.stringify(job)); await send(env, chat, "📣 Рассылка запущена! Отправляю порциями, в конце пришлю отчёт."); return runBroadcast(env, job, 30); }
  if (d === "bc:no" && isAdmin(user)) { await env.KV.delete("bc"); return send(env, chat, "Рассылка отменена."); }
  const s = await getS(env, user.id);
  if (!s.reg && !s.unsub) { s.reg = 1; await env.KV.put("u:" + user.id, "1"); await setS(env, user.id, s); }
  if (d.startsWith("q1:")) { s.q = { k: d.slice(3) }; await setS(env, user.id, s); return quizStep(env, chat, s, 2); }
  if (d.startsWith("q2:")) { s.q = { ...(s.q || {}), m: +d.slice(3) }; await setS(env, user.id, s); return quizStep(env, chat, s, 3); }
  if (d.startsWith("q3:")) { s.q = { ...(s.q || {}), w: +d.slice(3) }; await setS(env, user.id, s); if (s.q.k == null || s.q.m == null) return quizStep(env, chat, s, 1); return quizResult(env, chat, s); }
  if (d.startsWith("c:")) {
    s.c = s.c || { svc: "pack", disc: "promo" };
    const [, a, b] = d.split(":");
    if (a === "svc") s.c.svc = b;
    if (a === "urg") s.c.urgent = !s.c.urgent;
    if (a === "disc") s.c.disc = s.c.disc === b ? "no" : b;
    if (a === "order") { s.o = { ...s.c }; s.step = "sph"; await setS(env, user.id, s); await markStarted(env, user.id, chat);
      if (s.o.svc === "combo") return send(env, chat, "✨ Какой второй формат в комбо?", kb([[{ text: "Визитка", callback_data: "fmt:визитка" }, { text: "Сертификат", callback_data: "fmt:сертификат" }, { text: "Прайс", callback_data: "fmt:прайс" }]]));
      return askSphere(env, chat); }
    await setS(env, user.id, s); return showCalc(env, chat, s.c, q.message.message_id);
  }
  if (d.startsWith("cat:")) return showSphere(env, chat, d.slice(4));
  if (d.startsWith("it:")) { const [, k, i] = d.split(":"); return showItem(env, chat, k, +i); }
  if (d.startsWith("w:")) { const [, k, i, r] = d.split(":"); const it = CAT[k]?.[+i]; const ref = it?.r[+r];
    s.o = { disc: s.ref && !s.refDone ? "friend" : "promo", sphere: k, style: it ? `${it.n} — «${ref ? ref[1] : ""}»` : "" }; s.step = "svc"; await setS(env, user.id, s); await markStarted(env, user.id, chat);
    if (ref) await media(env, chat, "photo", ref[0], `💛 Отличный выбор: <b>${esc(it.n)}</b>, стиль «${esc(ref[1])}».
Сделаю такой же — с вашим названием, ценами и контактами.`);
    return askService(env, chat); }
  if (d.startsWith("svc0:")) { s.o = { disc: s.ref && !s.refDone ? "friend" : "promo" }; s.step = "svc"; await setS(env, user.id, s); await markStarted(env, user.id, chat);
    return onCallback(env, { id: "auto", from: user, data: "svc:" + d.slice(5), message: q.message }); }
  if (d.startsWith("fmt:")) { s.o = s.o || {}; s.o.fmt = d.slice(4);
    if (s.o.sphere) { s.step = "biz"; await setS(env, user.id, s); return askBiz(env, chat); }
    s.step = "sph"; await setS(env, user.id, s); return askSphere(env, chat); }
  if (d.startsWith("svc:")) { s.o = { ...(s.o || {}), svc: d.slice(4) };
    if (s.o.svc === "combo" && !s.o.fmt) { await setS(env, user.id, s); return send(env, chat, "✨ Комбо — постер + ещё один формат в том же стиле. Какой второй формат?", kb([[{ text: "Визитка", callback_data: "fmt:визитка" }, { text: "Сертификат", callback_data: "fmt:сертификат" }, { text: "Прайс", callback_data: "fmt:прайс" }]])); }
    if (s.o.sphere) { s.step = "biz"; await setS(env, user.id, s); return askBiz(env, chat); }
    s.step = "sph"; await setS(env, user.id, s); return askSphere(env, chat); }
  if (d.startsWith("sph:")) { s.o = s.o || {}; s.o.sphere = d.slice(4); s.step = "biz"; await setS(env, user.id, s); return askBiz(env, chat); }
  if (d === "style:help") { s.o = s.o || {}; s.o.style = "нужна помощь с выбором стиля"; return afterStyle(env, chat, user, s); }
  if (d === "urg") { s.o.urgent = !s.o.urgent; await setS(env, user.id, s); return askOptions(env, chat, s.o); }
  if (d.startsWith("disc:")) { s.o.disc = d.slice(5); await setS(env, user.id, s); return askOptions(env, chat, s.o); }
  if (d === "opt:done") return nextStep(env, chat, user, s, "opt");
  if (d.startsWith("br:") && s.o) { const [, f, v] = d.split(":");
    if (f === "content") s.o.content = "пришлю позже";
    if (f === "contacts") s.o.contacts = v === "same" ? "как телефон для связи" : "пришлю позже";
    if (f === "task") s.o.task = "обсудим лично";
    if (f === "wishes") s.o.wishes = "на усмотрение Светланы";
    if (f === "files") s.o.files = s.o.files || [];
    return nextStep(env, chat, user, s, f); }
  if (d === "confirm") return confirmOrder(env, chat, user, s);
  if (d.startsWith("rate:")) { s.rate = +d.slice(5); s.step = "reviewtext"; await setS(env, user.id, s); return send(env, chat, `Спасибо! ${"★".repeat(s.rate)}\nНапишите пару слов о работе — что понравилось, как реклама помогла бизнесу. За отзыв — <b>−15%</b> на следующий заказ.`); }
  return route(env, chat, d, user, q.message.message_id);
}

async function afterStyle(env, chat, user, s) { return nextStep(env, chat, user, s, "style"); }

async function confirmOrder(env, chat, user, s) {
  if (!s.o || !s.o.svc) return route(env, chat, "order", user);
  const admin = await getAdmin(env);
  const refNote = s.ref && !s.refDone ? `\n🤝 Пришёл(а) по приглашению клиента #ref${s.ref}` : "";
  if (admin) { const k2 = statusKb(user.id); if (user.username) k2.inline_keyboard.push([{ text: "💬 Написать клиенту", url: "https://t.me/" + user.username }]);
    await send(env, admin, summary(s.o, true, user) + refNote + "\n\n<i>Кнопки ниже — статус для клиента. Ответьте на сообщение — я перешлю ответ.</i>", k2); }
  if (admin && s.o.files && s.o.files.length) { for (const mid of s.o.files.slice(0, 15)) await tg(env, "copyMessage", { chat_id: admin, from_chat_id: chat, message_id: mid }); await send(env, admin, `📎 Выше — файлы клиента к заявке\n#id${user.id}`); }
  if (s.ref && !s.refDone) { s.refDone = 1;
    await send(env, s.ref, `🎁 <b>Ваш друг оформил заказ по вашей ссылке!</b>\n\nЗа вами закреплена скидка <b>−15%</b> на следующий заказ. Спасибо, что рекомендуете VISUALL 💛`, kb([[{ text: "🛒 Оформить заказ", callback_data: "order" }]])); }
  s.step = null; s.last = s.o; s.o = null; await setS(env, user.id, s); await clearStarted(env, user.id);
  await env.KV.put("orders", String(+(await env.KV.get("orders") || 0) + 1));
  return media(env, chat, "anim", "kit.mp4", `🎉 <b>Заявка со всеми деталями отправлена Светлане!</b>\n\nОна посмотрит бриф и ответит здесь же: подтвердит стоимость и срок. Если что-то забыли — просто пришлите сюда, я передам.\n\n💳 Предоплата 50% — только после согласования со Светланой (СБП, Сбербанк, ${PHONE}). 🧾 Выдаётся чек самозанятой.`, MAIN_KB);
}

async function onMessage(env, m) {
  const chat = m.chat.id, user = m.from, text = (m.text || m.caption || "").trim();
  if (m.chat.type !== "private") return;
  // администратор
  if (user.username && user.username.toLowerCase() === ADMIN_USERNAME) {
    const cur = await getAdmin(env);
    if (cur !== String(chat)) { await env.KV.put("admin", String(chat)); await send(env, chat, "✅ Вы подключены как администратор. Сюда будут приходить заявки и вопросы клиентов. Чтобы ответить клиенту — ответьте (свайп → «Ответить») на его сообщение.\n\nКоманды:\n/stats — заявки и пользователи\n/рассылка текст — новость всем клиентам (можно с фото)\n/menu — посмотреть бота глазами клиента\n\nПод каждой заявкой — кнопки статуса: клиент сразу получит уведомление."); }
    const r = m.reply_to_message;
    const mid = r && (r.text || r.caption || "").match(/#id(\d+)/);
    if (mid) {
      const to = mid[1];
      if (m.text) await send(env, to, `💬 <b>Светлана:</b>\n${esc(m.text)}`);
      else await tg(env, "copyMessage", { chat_id: to, from_chat_id: chat, message_id: m.message_id });
      return send(env, chat, "✅ Отправлено клиенту.");
    }
    if (/^\/(рассылка|broadcast)(\s|$)/i.test(text)) {
      const body = text.replace(/^\/(рассылка|broadcast)\s*/i, "").trim();
      if (!body) return send(env, chat, "📣 Напишите текст после команды, например:\n<code>/рассылка 🎄 Новогодние сертификаты −20% до 15 декабря!</code>\n\nМожно отправить фото с такой подписью — разошлю с картинкой.");
      const job = { text: body, photo: m.photo ? m.photo[m.photo.length - 1].file_id : null, sent: 0 };
      await env.KV.put("bc", JSON.stringify(job));
      if (job.photo) await tg(env, "sendPhoto", { chat_id: chat, photo: job.photo, caption: body, parse_mode: "HTML" }); else await send(env, chat, body);
      return send(env, chat, `👆 Так увидят рассылку клиенты (примерно ${+(await env.KV.get("users") || 0)} чел.). Отправляем?`, kb([[{ text: "✅ Отправить всем", callback_data: "bc:go" }, { text: "❌ Отмена", callback_data: "bc:no" }]]));
    }
    if (text === "/stats") { const n = +(await env.KV.get("orders") || 0), u = +(await env.KV.get("users") || 0); return send(env, chat, `📊 Заявок: ${n}\nПользователей: ${u}`); }
    if (text !== "/menu" && !text.startsWith("/start")) return send(env, chat, "Чтобы ответить клиенту, ответьте на его сообщение (свайп → «Ответить»).\n/рассылка текст — новость всем клиентам\n/stats — статистика\n/menu — меню клиента.");
  }
  const s = await getS(env, user.id);
  let dirty = false;
  if (!s.seen) { s.seen = 1; dirty = true; await env.KV.put("users", String(+(await env.KV.get("users") || 0) + 1)); }
  if (!s.reg && !s.unsub) { s.reg = 1; dirty = true; await env.KV.put("u:" + user.id, "1"); }
  const refm = text.match(/^\/start\s+ref_(\d+)/);
  if (refm && refm[1] !== String(user.id) && !s.ref && !s.last) { s.ref = refm[1]; dirty = true;
    await send(env, chat, "🎁 Вас пригласил друг — на первый заказ действует скидка <b>−15%</b>! Она подставится автоматически."); }
  if (dirty) await setS(env, user.id, s);

  const om = text.match(/^\/start\s+o_([a-z]+)(?:-([a-z0-9]+))?(?:-([a-z]+))?/i);
  if (om && SERVICES[om[1]]) {
    const svc = om[1], sid = om[2] && om[2] !== "x" ? om[2] : null, fl = om[3];
    s.o = { disc: fl === "ba" ? "ba" : fl === "fr" || (s.ref && !s.refDone) ? "friend" : "promo" }; s.step = "svc";
    let found = null; if (sid) for (const [k, items] of Object.entries(CAT)) items.forEach((it, i) => { if (it.id === sid) found = [k, i]; });
    if (found) { const it = CAT[found[0]][found[1]]; s.o.sphere = found[0]; s.o.style = `как в каталоге: ${it.n}`; }
    if (fl === "ph") s.o.style = (s.o.style ? s.o.style + "; " : "") + "постер из моего фото";
    await setS(env, user.id, s); await markStarted(env, user.id, chat);
    await send(env, chat, `👋 Здравствуйте${user.first_name ? ", " + esc(user.first_name) : ""}! Вы пришли с сайта VISUALL.\nОформим заказ «${esc(SERVICES[svc].n)}» — это займёт пару минут. Я задам несколько вопросов, чтобы Светлана сразу получила всё нужное.${found ? `\n\n🎨 Стиль и сфера уже отмечены: ${esc(CAT[found[0]][found[1]].n)}.` : ""}${!SERVICES[svc].design ? "" : s.o.disc === "ba" ? "\n\n🎟 Скидка −20% за «было — стало» подставлена автоматически." : s.o.disc === "friend" ? "\n\n🎟 Скидка −15% по приглашению друга подставлена автоматически." : `\n\n🎟 Промокод <code>${PROMO}</code> (−10%) подставлен автоматически.`}`);
    return onCallback(env, { id: "auto", from: user, data: "svc:" + svc, message: { chat: { id: chat }, message_id: 0 } });
  }
  if (text.startsWith("/start") || text === "/menu") { s.step = null; await setS(env, user.id, s); return route(env, chat, "menu", user); }
  if (text === "/price" || text === "/prices") return route(env, chat, "prices", user);
  if (text === "/order") return route(env, chat, "order", user);
  if (text === "/help") return route(env, chat, "faq", user);
  if (text === "/quiz") return route(env, chat, "quiz", user);

  // шаги заказа: если клиент посреди заказа задаёт вопрос — отвечаем и продолжаем с того же шага
  if (s.step && s.o && text && /\?\s*$/.test(text) && text.length < 200 && (STEP_TEXT.has(s.step) || s.step === "files" || s.step === "phone")) {
    const r = smart(text, user).filter((x) => !x.startSvc && x.route !== "order" && x.route !== "menu");
    if (r.length) { await runSmart(env, chat, user, r.slice(0, 1)); await send(env, chat, "↩️ Продолжим оформление заказа:"); return askStep(env, chat, s); }
  }
  if (s.step === "biz" && text) { s.o.biz = text.slice(0, 120); if (s.o.style) return afterStyle(env, chat, user, s); s.step = "style"; await setS(env, user.id, s); return askStyle(env, chat); }
  if (s.step === "style" && text) { s.o.style = text.slice(0, 300); return afterStyle(env, chat, user, s); }
  if (s.step === "content" && text) { s.o.content = text.slice(0, 1500); return nextStep(env, chat, user, s, "content"); }
  if (s.step === "contacts" && text) { s.o.contacts = text.slice(0, 400); return nextStep(env, chat, user, s, "contacts"); }
  if (s.step === "task" && text) { s.o.task = text.slice(0, 1500); return nextStep(env, chat, user, s, "task"); }
  if (s.step === "wishes" && text) { s.o.wishes = text.slice(0, 600); return nextStep(env, chat, user, s, "wishes"); }
  if (s.step === "files") {
    if (m.photo || m.document || m.video) { s.o.files = s.o.files || []; if (s.o.files.length < 15) s.o.files.push(m.message_id); await setS(env, user.id, s);
      if (s.o.files.length === 1 || s.o.files.length % 3 === 0) return askFiles(env, chat, s.o); return; }
    if (text) { s.o.wishes = (s.o.wishes ? s.o.wishes + "\n" : "") + text.slice(0, 600); await setS(env, user.id, s); return askFiles(env, chat, s.o); }
  }
  if (s.step === "phone") {
    if (m.contact) s.o.phone = m.contact.phone_number;
    else if (text && text !== "Пропустить") s.o.phone = text.slice(0, 40);
    s.step = "confirm"; await setS(env, user.id, s);
    return showConfirm(env, chat, s.o);
  }
  if (s.step === "reviewtext" && text) {
    const admin = await getAdmin(env);
    if (admin) await send(env, admin, `⭐ <b>Новый отзыв</b> ${"★".repeat(s.rate || 5)}\n👤 ${esc(user.first_name || "")}${user.username ? " (@" + esc(user.username) + ")" : ""}\n\n${esc(text)}\n#id${user.id}`);
    s.step = null; await setS(env, user.id, s);
    return send(env, chat, "💛 Спасибо за отзыв! Светлана закрепит за вами скидку −15% на следующий заказ.", MAIN_KB);
  }
  // фото/файлы/вопросы — Светлане
  const smartRes = text && !m.photo && !m.document && !m.video && s.step !== "ask" ? smart(text, user) : [];
  const looksLikeQuestion = /\?|сколько|как |можно|есть ли|когда|где|какой|какие|почему|зачем/i.test(text) && text.length < 220;
  if (smartRes.length && (!s.last || looksLikeQuestion)) {
    await runSmart(env, chat, user, smartRes);
    if (s.last && text.length > 60) await forwardToAdmin(env, user, text);
    return;
  }
  if (m.photo || m.document || m.video || s.step === "ask" || s.last) {
    const admin = await getAdmin(env);
    if (admin) {
      if (!text || m.photo || m.document || m.video) {
        await tg(env, "copyMessage", { chat_id: admin, from_chat_id: chat, message_id: m.message_id });
        await send(env, admin, `📎 Файл от ${esc(user.first_name || "клиента")}${user.username ? " (@" + esc(user.username) + ")" : ""}\n#id${user.id}`);
      } else await forwardToAdmin(env, user, text);
      if (s.step === "ask") { s.step = null; await setS(env, user.id, s); }
      return send(env, chat, "✅ Передал Светлане — она ответит здесь же.", kb([[{ text: "⬅️ Меню", callback_data: "menu" }]]));
    }
    return send(env, chat, "Напишите, пожалуйста, Светлане напрямую: @sveta_muzyka", kb([[{ text: "Написать @sveta_muzyka", url: "https://t.me/sveta_muzyka" }]]));
  }
  if (text) {
    const ok = await forwardToAdmin(env, user, text);
    return send(env, chat, ok ? "Хороший вопрос! На такой лучше ответит сама Светлана — я уже передал ей, она напишет здесь же. А пока можно посмотреть меню 👇" : "Напишите, пожалуйста, Светлане напрямую: @sveta_muzyka", MAIN_KB);
  }
}

export default {
  async scheduled(event, env, ctx) { try { await cronTick(env); } catch (e) { console.log("cron", e && e.stack || e); } },
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "GET") return new Response("VISUALL bot is running ✨");
    if (env.WEBHOOK_SECRET && req.headers.get("x-telegram-bot-api-secret-token") !== env.WEBHOOK_SECRET) return new Response("forbidden", { status: 403 });
    let u; try { u = await req.json(); } catch { return new Response("bad", { status: 400 }); }
    try {
      if (u.callback_query) await onCallback(env, u.callback_query);
      else if (u.message) await onMessage(env, u.message);
    } catch (e) { console.log("err", e && e.stack || e); }
    return new Response("ok");
  },
};
