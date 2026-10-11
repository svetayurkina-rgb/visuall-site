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
  poster: { n: "Постер", p: 990, d: "1 рабочий день", design: true, inc: "постер в выбранном стиле с вашим текстом, ценами и контактами; QR-код по желанию; 1080×1350 для соцсетей и PDF для печати (A4/A3, CMYK, с вылетами); 2 круга правок", gift: "версия для сторис и статусов 1080×1920 + 3 варианта подписи к посту" },
  combo: { n: "Комбо: постер + 1 формат", p: 1490, d: "1–2 рабочих дня", design: true, inc: "постер + визитка, сертификат или прайс в одном стиле; файлы для соцсетей и PDF для типографии; 2 круга правок", gift: "версия постера для сторис + QR-код на ваши контакты + 3 подписи к посту" },
  pack: { n: "Пакет из 4 форматов", p: 2590, d: "2–3 рабочих дня", design: true, inc: "постер, визитка (90×50 мм, 2 стороны), подарочный сертификат (210×99 мм), прайс на 3 страницы — всё в одном стиле; файлы для соцсетей и PDF для типографии; 2 круга правок", gift: "версии для сторис + 5 обложек для «Актуального» в том же стиле + 5 подписей к постам" },
  card: { n: "Визитка (2 стороны)", p: 590, d: "1 рабочий день", design: true, inc: "визитка 90×50 мм с двух сторон; PDF для типографии (CMYK, 300 dpi, вылеты 2 мм, важный текст не ближе 3 мм к краю) + картинка для соцсетей; 2 круга правок", gift: "электронная визитка для мессенджеров + QR-код на ваши контакты" },
  cert: { n: "Подарочный сертификат", p: 690, d: "1 рабочий день", design: true, inc: "сертификат 210×99 мм (евроформат, помещается в конверт E65) с полями «Для», «Сумма / услуга», «Действует до», «№»; PDF для типографии с вылетами + картинка для соцсетей; 2 круга правок", gift: "электронная версия для отправки в мессенджер + памятка «Как продавать сертификаты»" },
  price: { n: "Прайс на 3 страницы", p: 1290, d: "1–2 рабочих дня", design: true, inc: "3 страницы: хиты записи, выгодные комплексы, полный прайс; 1080×1350 для соцсетей и PDF для печати; 2 круга правок", gift: "версия прайса для закрепа и сторис" },
  text: { n: "Рекламный текст — 10 вариантов", p: 490, d: "1 рабочий день", design: true, inc: "10 вариантов рекламного текста под вашу услугу: боль клиента, выгода, доказательство и призыв к действию — в разных тонах (с юмором, дружески, тепло, профессионально)", gift: "15 заголовков для постов + 5 идей для сторис" },
  video: { n: "Видео / Reels", p: 1990, from: true, d: "2–3 рабочих дня", inc: "оживление вашего постера или фото, 8–15 секунд, вертикально 9:16 (1080×1920), MP4 для Reels, сторис и статусов; 1 круг правок. Музыку лучше добавить в самом приложении — так не будет проблем с авторскими правами", gift: "обложка для Reels + текст к ролику" },
  insta: { n: "Instagram под ключ", p: 15000, from: true, month: true, d: "старт через 3 рабочих дня после брифа", inc: "12 постов и 8 сторис в месяц в едином стиле, тексты к постам, оформление шапки и «Актуального», контент-план на месяц", gift: "аудит профиля с рекомендациями перед стартом" },
  bot: { n: "Telegram-бот", p: 9900, from: true, d: "5–7 рабочих дней", inc: "меню услуг и цен, приём заявок с телефоном, уведомления вам в Telegram, ответы на частые вопросы, рассылка клиентам; оформление в стиле вашей рекламы; 2 круга правок", gift: "30 дней поддержки после запуска + пост-анонс бота для ваших клиентов" },
  site: { n: "Сайт как этот", p: 24900, from: true, d: "7–14 рабочих дней", inc: "до 5 разделов, видео, кнопки связи, удобно на телефоне и компьютере, помощь с размещением и доменом; 3 круга правок", gift: "30 дней поддержки после запуска + QR-код на сайт + базовая настройка для поисковиков" },
  all: { n: "Всё под ключ", p: 39900, from: true, d: "по договорённости", inc: "реклама, видео, Instagram, бот и сайт в одном стиле — выгоднее, чем по отдельности", gift: "все подарки к входящим услугам + консультация по продвижению (30 минут)" },
  custom: { n: "Свой дизайн / другое", p: 0, d: "по договорённости", inc: "дизайн не из каталога — обсудим идею лично", gift: "версия для сторис" },
};
const FREE_GUIDE = SITE + "img/free/visuall-15-oshibok.pdf";
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
  hello: (name) => `Здравствуйте${name ? ", " + esc(name) : ""}! Я бот <b>VISUALL</b> — помощник Светланы Музыки.\n\nДелаем рекламу уровня дорогого бренда для малого бизнеса: постеры, визитки, сертификаты, прайсы, видео, ботов и сайты — всё в одном стиле, чтобы вас узнавали.\n\n🎁 <b>К каждому заказу — подарок.</b> А ещё бесплатно: мини-гайд «15 ошибок в рекламе» и разбор вашей текущей рекламы.\n🎟 −10% на первый заказ по промокоду <code>${PROMO}</code> — до ${promoUntil()}.\n\nВыберите, с чего начнём 👇`,
  prices: () => `💰 <b>Цены</b>\n\n<b>Реклама в одном стиле</b>\n• Постер — 990 ₽\n• Комбо: постер + визитка, сертификат или прайс — 1 490 ₽\n• Пакет из 4 форматов — 2 590 ₽ (выгоднее всего: по отдельности 3 560 ₽)\n\n<b>Отдельные форматы</b>\n• Визитка, 2 стороны — 590 ₽\n• Подарочный сертификат — 690 ₽\n• Прайс на 3 страницы — 1 290 ₽\n• Рекламный текст, 10 вариантов — 490 ₽\n• Срочно за 24 часа — +50%\n\n<b>Больше</b>\n• Видео / Reels — от 1 990 ₽\n• Telegram-бот — от 9 900 ₽\n• Сайт — от 24 900 ₽\n• Instagram под ключ — от 15 000 ₽/мес\n• Всё под ключ — от 39 900 ₽\n\n🎁 К каждому заказу — подарок: например, к постеру — версия для сторис и 3 подписи к посту.\n🎟 −10% по промокоду <code>${PROMO}</code> до ${promoUntil()}.\n\nЧтобы узнать, что входит в услугу и какой подарок к ней, напишите её название, например: «визитка».`,
  terms: () => `⏱ <b>Сроки</b>\n• Постер, визитка, сертификат, текст — 1 рабочий день\n• Комбо и прайс — 1–2 дня · Пакет из 4 — 2–3 дня\n• Видео — 2–3 дня · Бот — 5–7 дней · Сайт — 7–14 дней\n• Срочно за 24 часа — +50% (для дизайна и текстов)\n\nСрок считается с момента, когда пришли все материалы и предоплата. Если материалы приходят частями, срок начинается с последнего.\n\n✏️ <b>Правки</b>\nПостер, комбо, пакет и отдельные форматы — 2 круга бесплатно, видео — 1, бот — 2, сайт — 3.\n<b>Круг правок</b> — это все замечания одним сообщением: текст, цены, контакты, цвета, размер элементов, замена фото. Чем точнее список, тем быстрее результат.\nДополнительный круг — 300 ₽. Смена стиля после согласования — новый вариант со скидкой 50%.`,
  pay: () => `💳 <b>Оплата</b>\n\n<b>Заказ дизайна</b>\n• Сначала Светлана согласует с вами задачу и итоговую цену\n• Предоплата 50% — после согласования, остаток — когда результат вам понравился\n• Готовые файлы — сразу после полной оплаты\n• Если работа ещё не начата — предоплата возвращается полностью\n\n<b>Готовые решения</b> (Studio, гайды, сертификаты) — оплата сразу, файлы приходят автоматически.\n\nСпособ: СБП на <b>Сбербанк</b> по номеру <code>${PHONE}</code> или кнопка оплаты в боте.\n🧾 Светлана самозанятая — после каждой оплаты присылает официальный чек из «Мой налог».\n\n⚠️ Не переводите деньги за заказ дизайна, пока Светлана лично не подтвердила задачу и сумму.`,
  disc: () => `🎟 <b>Скидки</b>\n• <b>−10%</b> на первый заказ — промокод <code>${PROMO}</code>, до ${promoUntil()}\n• <b>−15%</b> на следующий заказ — за отзыв\n• <b>−20%</b> — если разрешите показать «было — стало» на сайте\n• <b>−15%</b> вам и другу — по вашей ссылке-приглашению\n\nСкидки не суммируются — действует самая большая. Распространяются на дизайн и тексты (постер, комбо, пакет, отдельные форматы).\n\n🎁 <b>Подарки — всегда и без условий</b>: к каждому заказу и каждой покупке. Подарок к вашей услуге назову, если напишете её название.`,
  how: () => `📝 <b>Как проходит заказ</b>\n\n1. Выбираете стиль в каталоге или проходите квиз\n2. Оформляете заявку здесь — 1–2 минуты\n3. Светлана уточняет детали и называет итоговую цену\n4. Предоплата 50% — работа начинается\n5. Первый вариант → ваши правки (2 круга бесплатно)\n6. Оплата остатка → файлы для соцсетей и PDF для печати + подарок\n\n<b>Что подготовить</b>\n• Название бизнеса или ваше имя как мастера\n• 3–5 главных услуг с ценами — не весь прайс\n• Одна главная мысль: что должен понять клиент за 3 секунды\n• Контакты: телефон, ник, адрес или «онлайн»\n• Логотип и фото работ — если есть (лучше дневной свет, без фильтров)\n\nНе знаете, что написать? Не страшно: Светлана поможет сформулировать.`,
  about: () => `👩‍🎨 <b>Светлана Музыка</b> — основатель VISUALL.\n\nДелает рекламу для малого бизнеса в едином стиле: постеры, визитки, сертификаты, прайсы, видео и Reels, Telegram-ботов и сайты. Главный принцип — реклама должна за 3 секунды объяснять, что вы предлагаете, сколько это стоит и как к вам попасть, и при этом выглядеть дорого.\n\n📱 Telegram: @sveta_muzyka\n📞 ${PHONE}\n🌐 Каталог: ${SITE}`,
  faq: () => `❓ <b>Частые вопросы</b>\n\n<b>Можно со своими фото?</b>\nДа, и это лучший вариант: реальная работа вызывает больше доверия. Подойдёт фото с телефона при дневном свете.\n\n<b>В каком виде я получу рекламу?</b>\nКартинки для соцсетей (1080×1350) и PDF для типографии с вылетами в CMYK. К постеру — версия для сторис 1080×1920 в подарок.\n\n<b>Где и на чём печатать?</b>\nВ любой типографии или копицентре. Визитки — плотность 300–350 г/м², сертификаты — дизайнерская бумага 250–300 г/м², постеры — A4 или A3.\n\n<b>Чьи файлы?</b>\nПосле оплаты готовые файлы ваши: печатайте и публикуйте сколько угодно для рекламы своего бизнеса.\n\n<b>Можно дизайн не из каталога?</b>\nДа — заявка «Свой дизайн / другое».\n\n<b>Чек будет?</b>\nДа, официальный чек самозанятой после каждой оплаты.\n\n<b>Вы в каком городе?</b>\nРаботаем онлайн по всей России, всё в Telegram.\n\nНе нашли ответ? Напишите вопрос сюда — отвечу сам или передам Светлане.`,
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
  [{ text: "🎁 Бесплатно и полезно", callback_data: "free" }],
  [{ text: "✦ Atelier — готовые решения", callback_data: "shop" }],
  [{ text: "✦ Studio — постер за 5 минут", callback_data: "ap" }, { text: "Подписки", callback_data: "subs" }],
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

Файлы и ваш подарок к заказу Светлана присылает сюда. Спасибо, что выбрали VISUALL 💛
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

// ---------- аналитика: кто и сколько был в боте и на сайте ----------
const MSKD = (t = Date.now()) => new Date(t + 3 * 3600e3);
const dayKey = (t = Date.now()) => MSKD(t).toISOString().slice(0, 10);
const hm = (t) => MSKD(t).toISOString().slice(11, 16);
const dur = (s) => { s = Math.round(s || 0); if (s < 60) return s + " с"; const m = Math.floor(s / 60), h = Math.floor(m / 60); return h ? `${h} ч ${m % 60} мин` : `${m} мин${s % 60 && m < 10 ? " " + (s % 60) + " с" : ""}`; };
const DAYNAMES = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const dayTitle = (d) => { const [, mo, dd] = d.split("-"); return `${+dd} ${DAYNAMES[+mo - 1]}`; };
const ACT = { menu: "меню", ex: "примеры", cat: "примеры", it: "примеры", w: "примеры", prices: "цены", quiz: "квиз", q1: "квиз", q2: "квиз", q3: "квиз",
  order: "заказ", svc: "заказ", fmt: "заказ", sph: "заказ", style: "заказ", br: "заказ", opt: "заказ", urg: "заказ", resume: "заказ", confirm: "✅ отправил(а) заявку",
  calc: "калькулятор", c: "калькулятор", rnd: "«удиви меня»", faq: "вопросы", terms: "условия", pay: "оплата", how: "как заказать", about: "о Светлане",
  invite: "пригласить друга", review: "отзыв", rate: "отзыв", human: "позвать Светлану", disc: "скидки", catalog: "каталог", unsub: "отписка", shop: "🛍 магазин", pr: "🛍 магазин", buy: "💳 покупка", subs: "💎 подписки", sb: "💳 подписка", pre: "💳 предоплата", pm: "💳 оплатил(а)", pchk: "💳 оплатил(а)", ap: "🎨 автопостер" };
async function trackBot(env, user, what, src) {
  if (!user || isAdmin(user)) return;
  const k = `a:${dayKey()}:${user.id}`, now = Date.now();
  const { metadata: m0 } = await env.KV.getWithMetadata(k);
  const m = m0 || { n: ((user.first_name || "") + (user.last_name ? " " + user.last_name : "")).slice(0, 40), u: (user.username || "").slice(0, 32), f: now, l: now, c: 0, s: 0, ss: 1, a: "" };
  const gap = (now - m.l) / 1000;
  if (!m.c) m.s = 15; else if (gap < 300) m.s += Math.round(gap); else { m.s += 15; if (gap > 1800) m.ss++; }
  m.l = now; m.c++;
  if (what && !m.a.split("|").includes(what) && m.a.length < 300) m.a = m.a ? m.a + "|" + what : what;
  if (src && !m.src) m.src = src;
  await env.KV.put(k, "1", { metadata: m, expirationTtl: 86400 * 62 });
}
const SEC = { catalog: "каталог", examples: "примеры", beforeafter: "до/после", try: "примерка", slogan: "слоганы", price: "цены", bonus: "скидки", newyear: "Новый год", calc: "калькулятор", terms: "условия", reviews: "отзывы", about: "о Светлане", services: "услуги", faq: "вопросы", shop: "готовые решения", "view-collection": "стиль", "view-sphere": "сфера", "view-all": "все стили", "view-prompts": "промпты", "view-texts": "тексты" };
const EVN = { poster: "постер", combo: "комбо", pack: "пакет", card: "визитка", cert: "сертификат", price: "прайс", text: "текст", video: "видео", insta: "ведение Instagram", bot: "чат-бот", site: "сайт", all: "всё под ключ", custom: "своё", photo: "постер из фото", ba: "было/стало", friend: "от друга", ny: "Новый год", question: "вопрос", calc: "калькулятор" };
const clip = (v, n) => String(v == null ? "" : v).slice(0, n);
async function tgUserFromInitData(env, initData) {
  try {
    const p = new URLSearchParams(initData), hash = p.get("hash"); if (!hash || !env.BOT_TOKEN) return null; p.delete("hash");
    const dcs = [...p.entries()].sort(([a], [b]) => a < b ? -1 : 1).map(([k, v]) => `${k}=${v}`).join("\n");
    const enc = new TextEncoder(), hmac = async (key, msg) => new Uint8Array(await crypto.subtle.sign("HMAC", await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]), enc.encode(msg)));
    const secret = await hmac(enc.encode("WebAppData"), env.BOT_TOKEN);
    const h = [...await hmac(secret, dcs)].map((b) => b.toString(16).padStart(2, "0")).join("");
    if (h !== hash) return null;
    return JSON.parse(p.get("user") || "null");
  } catch { return null; }
}
async function trackSite(req, env) {
  let b; try { b = JSON.parse(await req.text()); } catch { return; }
  const sid = clip(b.s, 16).replace(/[^a-z0-9]/gi, ""); if (sid.length < 6) return;
  const k = `w:${dayKey()}:${sid}`, now = Date.now();
  const { metadata: m0 } = await env.KV.getWithMetadata(k);
  const cf = req.cf || {}, ua = req.headers.get("user-agent") || "";
  const m = m0 || { v: clip(b.v, 12).replace(/[^a-z0-9]/gi, ""), f: now, t: 0, p: "", e: "",
    c: clip(cf.city || "", 24), co: clip(cf.country || "", 3),
    d: /iPad/.test(ua) ? "iPad" : /iPhone/.test(ua) ? "iPhone" : /Android/.test(ua) ? "Android" : /Mac/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "другое",
    r: clip(b.r, 40) };
  if (/Instagram/.test(ua)) m.r = "Instagram"; else if (/Telegram/i.test(ua) && !m.r) m.r = "Telegram";
  m.l = now; m.t = Math.max(m.t, Math.min(+b.t || 0, 6 * 3600));
  const add = (field, arr, max) => { for (const x of (Array.isArray(arr) ? arr : []).slice(0, 30)) { const w = clip(x, 30); if (w && !m[field].split("|").includes(w) && m[field].length + w.length < max) m[field] = m[field] ? m[field] + "|" + w : w; } };
  add("p", b.p, 220); add("e", b.e, 160);
  if (b.tg && !m.n) { const u = await tgUserFromInitData(env, clip(b.tg, 2048)); if (u) { m.n = clip((u.first_name || "") + (u.last_name ? " " + u.last_name : ""), 40); m.u = clip(u.username || "", 32); m.r = "приложение в боте"; } }
  await env.KV.put(k, "1", { metadata: m, expirationTtl: 86400 * 62 });
}
async function listAll(env, prefix) {
  const out = []; let cursor;
  for (let i = 0; i < 20; i++) { const l = await env.KV.list({ prefix, cursor, limit: 1000 }); out.push(...l.keys); if (l.list_complete) break; cursor = l.cursor; }
  return out;
}
const who = (n, u) => `${esc(n || "Без имени")}${u ? " (@" + esc(u) + ")" : ""}`;
async function buildReport(env, days, offset = 0) {
  const ds = []; for (let i = offset; i < offset + days; i++) ds.push(dayKey(Date.now() - i * 86400e3));
  const title = days === 1 ? (offset === 0 ? `сегодня, ${dayTitle(ds[0])}` : `вчера, ${dayTitle(ds[0])}`) : `${days} дней (${dayTitle(ds[ds.length - 1])} — ${dayTitle(ds[0])})`;
  const vidMap = {}; for (const k of await listAll(env, "vid:")) if (k.metadata) vidMap[k.name.slice(4)] = k.metadata;
  // бот
  const users = {};
  for (const d of ds) for (const k of await listAll(env, `a:${d}:`)) {
    const m = k.metadata; if (!m) continue; const id = k.name.split(":")[2];
    const u = users[id] || (users[id] = { n: m.n, u: m.u, s: 0, c: 0, days: 0, f: m.f, l: m.l, a: new Set(), src: m.src });
    u.s += m.s; u.c += m.c; u.days++; u.f = Math.min(u.f, m.f); u.l = Math.max(u.l, m.l); (m.a || "").split("|").filter(Boolean).forEach((x) => u.a.add(x)); if (m.src) u.src = m.src;
  }
  const ul = Object.values(users).sort((a, b) => b.s - a.s);
  const lines = [`📊 <b>Отчёт за ${title}</b> (время московское)`, ""];
  lines.push(`🤖 <b>БОТ — ${ul.length} чел.</b>${ul.length ? `, всего ${dur(ul.reduce((a, x) => a + x.s, 0))}` : ""}`);
  if (!ul.length) lines.push("Пока никого.");
  ul.slice(0, 40).forEach((u, i) => {
    const when = days === 1 ? `${hm(u.f)}–${hm(u.l)}` : `${u.days} дн., последний раз ${dayTitle(dayKey(u.l))} в ${hm(u.l)}`;
    lines.push(`${i + 1}. ${who(u.n, u.u)} — <b>${dur(u.s)}</b>, ${u.c} действ., ${when}`);
    const a = [...u.a]; if (a.length) lines.push(`    смотрел(а): ${a.join(", ")}`);
    if (u.src) lines.push(`    откуда: ${esc(u.src)}`);
  });
  if (ul.length > 40) lines.push(`…и ещё ${ul.length - 40}`);
  // сайт
  const ss = [];
  for (const d of ds) for (const k of await listAll(env, `w:${d}:`)) if (k.metadata) ss.push(k.metadata);
  ss.sort((a, b) => b.f - a.f);
  const uniq = new Set(ss.map((x) => x.v || Math.random())).size, tot = ss.reduce((a, x) => a + (x.t || 0), 0);
  lines.push("", `🌐 <b>САЙТ — ${ss.length} посещ., ${uniq} чел.</b>${ss.length ? `, всего ${dur(tot)}, в среднем ${dur(tot / ss.length)}` : ""}`);
  if (!ss.length) lines.push("Пока никого.");
  ss.slice(0, 40).forEach((x) => {
    const link = vidMap[x.v]; const name = x.n ? who(x.n, x.u) : link ? who(link.n, link.u) : "";
    const place = [x.c, x.co && x.co !== "RU" ? x.co : ""].filter(Boolean).join(", ");
    lines.push(`• ${days === 1 ? "" : dayTitle(dayKey(x.f)) + " "}${hm(x.f)} — <b>${dur(x.t)}</b>${name ? " · " + name : ""} · ${esc(place || "город неизвестен")} · ${x.d}${x.r ? " · из: " + esc(x.r) : ""}`);
    const p = (x.p || "").split("|").filter(Boolean).map((s) => SEC[s] || s);
    if (p.length) lines.push(`    смотрел(а): ${esc(p.join(", "))}`);
    if (x.e) lines.push(`    🛒 нажал(а) «заказать»: ${esc(x.e.split("|").map((e) => EVN[e] || e).join(", "))}${link && !x.n ? " → перешёл в бота" : ""}`);
  });
  if (ss.length > 40) lines.push(`…и ещё ${ss.length - 40}`);
  lines.push("", "Команды: /отчет — сегодня · /отчет вчера · /отчет 7 — неделя · /отчет 30 — месяц");
  return lines;
}
async function sendReport(env, chat, days, offset) {
  const lines = await buildReport(env, days, offset);
  let buf = "";
  for (const l of lines) { if ((buf + l).length > 3800) { await send(env, chat, buf); buf = ""; } buf += l + "\n"; }
  if (buf.trim()) await send(env, chat, buf);
}

// ---------- магазин, оплата, подписки, автопостер ----------
const PRODUCTS = {
  guide: { e: "", n: "Код рекламы — гайд и 40 промптов", s: "Код рекламы", p: 990, d: "Как сделать рекламу уровня бренда самой, с помощью нейросети.\n\nВнутри: из чего состоит реклама, которую не пролистывают; формула текста и 7 формул заголовков; как писать промпт для картинки; 40 готовых промптов для 30 сфер; чек-лист перед публикацией и 8 мест, где разместить рекламу бесплатно.\n\nPDF, 12 страниц." },
  ny: { e: "", n: "Новогодняя коллекция", s: "Новогодняя коллекция", p: 490, d: "Всё, чтобы декабрь стал самым прибыльным месяцем года.\n\nВнутри: 30 готовых текстов акций, календарь акций с 1 декабря по 10 января, 6 идей подарочных сертификатов и 15 промптов для праздничных постеров.\n\nPDF, 10 страниц." },
  plan: { e: "", n: "30 дней контента", s: "30 дней контента", p: 490, d: "Месяц постов без мучений «что бы выложить».\n\nВнутри: 30 тем постов по дням с подсказками, 30 идей для сторис и 20 шаблонов ответов клиентам, которые доводят до записи.\n\nPDF, 8 страниц." },
  certs: { e: "", n: "Подарочная линия — 5 сертификатов", s: "Подарочная линия", p: 390, d: "Сертификаты, которые приятно дарить и не стыдно вручить.\n\n5 дизайнов 210×99 мм в высоком качестве: тёмный люкс, нежный розовый, мятный, новогодний, бежевый. PDF для печати и PNG. Поля «Для», «На сумму», «Действует до», «№» заполняются от руки." },
  all: { e: "", n: "Полная коллекция", s: "Полная коллекция", p: 1490, d: "Все четыре материала Atelier вместе: Код рекламы, Новогодняя коллекция, 30 дней контента и Подарочная линия.\n\nВместо 2 360 ₽.", items: ["guide", "ny", "plan", "certs"] },
};
const SUBS = {
  ads: { n: "Реклама на месяц", p: 2990, d: "4 постера + 4 рекламных текста к ним в одном стиле в течение 30 дней. Присылаете материалы, когда удобно, — каждый постер готов за 1 рабочий день, 1 круг правок." },
  bot: { n: "Поддержка бота", p: 690, d: "Для тех, кому VISUALL сделал бота: правки цен, услуг и текстов, мелкие доработки и присмотр за работой бота в течение 30 дней." },
};
const POSTER_PRICE = 390;
const POSTER_URL = SITE + "poster.html";

const ykCfg = async (env) => JSON.parse((await env.KV.get("yk")) || "null");
const newPid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const getPay = async (env, pid) => JSON.parse((await env.KV.get("pay:" + pid)) || "null");
const putPay = (env, pid, r) => env.KV.put("pay:" + pid, JSON.stringify(r), { expirationTtl: 86400 * 120 });
const who2 = (r) => `${esc(r.n || "клиент")}${r.un ? " (@" + esc(r.un) + ")" : ""}`;

async function ykApi(cfg, path, body, idem) {
  const h = { Authorization: "Basic " + btoa(cfg.shop + ":" + cfg.key), "content-type": "application/json" };
  if (idem) h["Idempotence-Key"] = idem;
  const r = await fetch("https://api.yookassa.ru/v3" + path, { method: body ? "POST" : "GET", headers: h, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, j };
}

// Создаёт оплату и отправляет клиенту сообщение с кнопкой
async function createPay(env, chat, user, { kind, ref, amount, title }) {
  const pid = newPid();
  const rec = { uid: String(user.id), chat: String(chat), kind, ref: ref || "", amount, title, st: "new", t: Date.now(), un: user.username || "", n: user.first_name || "" };
  const cfg = await ykCfg(env);
  if (cfg) {
    const body = { amount: { value: amount.toFixed(2), currency: "RUB" }, capture: true, description: title.slice(0, 128),
      confirmation: { type: "redirect", return_url: "https://t.me/visuall_sveta_bot?start=paid_" + pid }, metadata: { pid } };
    if (cfg.email) body.receipt = { customer: { email: cfg.email }, items: [{ description: title.slice(0, 128), quantity: "1.00", amount: { value: amount.toFixed(2), currency: "RUB" }, vat_code: 1, payment_mode: "full_payment", payment_subject: "service" }] };
    const { ok, j } = await ykApi(cfg, "/payments", body, pid).catch((e) => ({ ok: false, j: { description: String(e) } }));
    if (ok && j.confirmation?.confirmation_url) {
      rec.y = j.id; await putPay(env, pid, rec);
      return send(env, chat, `💳 <b>${esc(title)}</b>\nК оплате: <b>${rub(amount)}</b>\n\nНажмите «Оплатить» — откроется защищённая страница ЮKassa (карта, СБП, SberPay). После оплаты вернитесь сюда — я пришлю всё автоматически.`,
        kb([[{ text: `💳 Оплатить ${rub(amount)}`, url: j.confirmation.confirmation_url }], [{ text: "🔄 Я оплатил(а) — проверить", callback_data: "pchk:" + pid }]]));
    }
    const admin = await getAdmin(env);
    if (admin) await send(env, admin, `⚠️ ЮKassa не создала платёж (${esc(j.description || j.code || "ошибка")}). Клиенту показан перевод по СБП.`);
  }
  await putPay(env, pid, rec);
  return send(env, chat, `💳 <b>${esc(title)}</b>\nК оплате: <b>${rub(amount)}</b>\n\nПереведите по СБП на <b>Сбербанк</b> по номеру <code>${PHONE}</code> (получатель — Светлана М.).\nПосле перевода нажмите кнопку ниже — Светлана проверит поступление и я сразу пришлю всё сюда. 🧾 Чек самозанятой — после оплаты.`,
    kb([[{ text: "✅ Я оплатил(а)", callback_data: "pm:" + pid }], [{ text: "⬅️ Меню", callback_data: "menu" }]]));
}

async function sendFileTo(env, chat, fileId, caption) {
  return tg(env, "sendDocument", { chat_id: chat, document: fileId, caption, parse_mode: "HTML" });
}
async function deliverProduct(env, chat, code) {
  const codes = PRODUCTS[code]?.items || [code]; let missing = [];
  for (const c of codes) {
    const files = JSON.parse((await env.KV.get("pf:" + c)) || "[]");
    if (!files.length) { missing.push(c); continue; }
    for (let i = 0; i < files.length; i++) await sendFileTo(env, chat, files[i], i === 0 ? `${PRODUCTS[c].e} <b>${esc(PRODUCTS[c].n)}</b>` : undefined);
  }
  return missing;
}

async function fulfill(env, pid, how) {
  const r = await getPay(env, pid); if (!r || r.st === "paid") return r;
  r.st = "paid"; r.paidAt = Date.now(); r.how = how; await putPay(env, pid, r);
  await env.KV.put("rev", String(+(await env.KV.get("rev") || 0) + r.amount));
  const admin = await getAdmin(env);
  const head = `💰 <b>Оплата ${rub(r.amount)}</b> — ${esc(r.title)}\n👤 ${who2(r)}\n#id${r.uid}`;
  if (r.kind === "prod") {
    await send(env, r.chat, `<b>Спасибо за покупку.</b> Ваши материалы ниже — приятной работы.`);
    const miss = await deliverProduct(env, r.chat, r.ref);
    if (miss.length) { await send(env, r.chat, "Часть файлов Светлана пришлёт сюда лично в ближайшее время 💛");
      if (admin) await send(env, admin, head + `\n\n⚠️ Не загружены файлы: ${miss.join(", ")}. Отправьте файл боту с подписью <code>/товар ${miss[0]}</code>, а клиенту — ответом на это сообщение.`); }
    else if (admin) await send(env, admin, head + "\n✅ Файлы отправлены автоматически.");
    await tg(env, "sendDocument", { chat_id: r.chat, document: FREE_GUIDE, caption: "🎁 <b>Подарок к покупке</b> — мини-гайд «15 ошибок, которые съедают вашу рекламу».", parse_mode: "HTML" });
    return send(env, r.chat, `Если захотите, чтобы рекламу сделали за вас, — для покупателей материалов <b>−10%</b> на первый заказ 💛`, kb([[{ text: "Заказать рекламу у Светланы", callback_data: "order" }], [{ text: "← Коллекция", callback_data: "shop" }, { text: "Меню", callback_data: "menu" }]]));
  }
  if (r.kind === "sub") {
    const plan = SUBS[r.ref] || SUBS.ads; const key = "sub:" + r.uid + ":" + r.ref;
    const cur = JSON.parse((await env.KV.get(key)) || "null"); const base = cur && cur.until > Date.now() ? cur.until : Date.now();
    const meta = { uid: r.uid, chat: r.chat, plan: r.ref, until: base + 30 * 86400e3, n: r.n, un: r.un, rem: 0 };
    await env.KV.put(key, JSON.stringify(meta), { metadata: meta });
    const till = MSKD(meta.until).toISOString().slice(0, 10).split("-").reverse().join(".");
    if (admin) await send(env, admin, head + `\n💎 Подписка «${esc(plan.n)}» активна до ${till}.`);
    return send(env, r.chat, `💎 <b>Подписка «${esc(plan.n)}» активна до ${till}!</b>\n\n${esc(plan.d)}\n\n${r.ref === "ads" ? "Присылайте сюда материалы для первого постера: текст, цены, контакты, фото — и пожелания по стилю. Светлана начнёт сразу." : "Пишите сюда, что нужно поменять в боте, — Светлана всё сделает."}\nЗа 3 дня до окончания я напомню о продлении.`);
  }
  if (r.kind === "poster") {
    const b64 = await env.KV.get("pp:" + r.ref);
    if (b64) {
      const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const fd = new FormData(); fd.append("chat_id", r.chat); fd.append("caption", "Ваш постер готов — файл в полном качестве 1080×1350, для соцсетей и печати.");
      fd.append("document", new Blob([bin], { type: "image/jpeg" }), "poster-visuall.jpg");
      await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendDocument`, { method: "POST", body: fd });
      await env.KV.delete("pp:" + r.ref);
      const b2 = await env.KV.get("pp2:" + r.ref);
      if (b2) { const bin2 = Uint8Array.from(atob(b2), (c) => c.charCodeAt(0)); const fd2 = new FormData(); fd2.append("chat_id", r.chat); fd2.append("caption", "🎁 Подарок: версия для сторис и статусов 1080×1920.");
        fd2.append("document", new Blob([bin2], { type: "image/jpeg" }), "poster-visuall-stories.jpg"); await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendDocument`, { method: "POST", body: fd2 }); await env.KV.delete("pp2:" + r.ref); }
      await tg(env, "sendDocument", { chat_id: r.chat, document: FREE_GUIDE, caption: "🎁 И ещё подарок — мини-гайд «15 ошибок, которые съедают вашу рекламу»." });
      if (admin) await send(env, admin, head + "\n🎨 Автопостер отправлен клиенту.");
    } else if (admin) await send(env, admin, head + "\n⚠️ Файл автопостера не найден — свяжитесь с клиентом.");
    return send(env, r.chat, "Хотите постер, сделанный вручную, в уникальном стиле, или весь комплект — визитку, сертификат и прайс? Для вас −10% 💛", kb([[{ text: "Заказать у Светланы", callback_data: "order" }], [{ text: "Ещё один постер", web_app: { url: POSTER_URL } }]]));
  }
  // предоплата и счета
  const s = await getS(env, r.uid); if (r.kind === "pre" && s.last) { s.last.prepaid = r.amount; await setS(env, r.uid, s); }
  if (admin) await send(env, admin, head + (r.kind === "pre" ? "\n✅ Предоплата получена — можно начинать." : ""), statusKb(r.uid, "pay"));
  return send(env, r.chat, `✅ <b>Оплата ${rub(r.amount)} получена!</b> Спасибо 💛\n\n${r.kind === "pre" ? "Светлана начинает работу и напишет здесь, когда будет первый вариант." : "Светлана получила уведомление."}`);
}

async function showShop(env, chat) {
  const rows = [[{ text: "Studio — постер за 5 минут · " + rub(POSTER_PRICE), callback_data: "ap" }]];
  for (const [k, p] of Object.entries(PRODUCTS)) rows.push([{ text: `${p.s} · ${rub(p.p)}`, callback_data: "pr:" + k }]);
  rows.push([{ text: "Подписки", callback_data: "subs" }, { text: "Меню", callback_data: "menu" }]);
  return media(env, chat, "anim", "shop.mp4?v=4", `<b>VISUALL ATELIER</b>\n<i>Коллекция для тех, кто делает рекламу сам — и хочет, чтобы она выглядела дорого.</i>\n\n<b>Studio</b> — постер за 5 минут · ${rub(POSTER_PRICE)}\n<b>Код рекламы</b> — гайд и 40 промптов · 990 ₽\n<b>Новогодняя коллекция</b> — 30 текстов акций · 490 ₽\n<b>30 дней контента</b> — месяц постов · 490 ₽\n<b>Подарочная линия</b> — 5 сертификатов · 390 ₽\n<b>Полная коллекция</b> — всё вместе · 1 490 ₽\n\nОплата здесь же, файлы приходят сразу после неё. 🎁 К каждой покупке — подарок.`, kb(rows));
}
async function showProduct(env, chat, k) {
  const p = PRODUCTS[k]; if (!p) return showShop(env, chat);
  return media(env, chat, "photo", "shop/" + k + ".jpg?v=4", `<b>${esc(p.n)}</b>\n\n${esc(p.d)}\n\n🎁 В подарок: мини-гайд «15 ошибок, которые съедают вашу рекламу».\n\n<b>${rub(p.p)}</b> · файлы придут сюда сразу после оплаты`, kb([[{ text: `Купить · ${rub(p.p)}`, callback_data: "buy:" + k }], [{ text: "← Коллекция", callback_data: "shop" }]]));
}
async function showPosterOffer(env, chat) {
  return media(env, chat, "photo", "shop/poster.jpg?v=4", `<b>VISUALL Studio — постер за 5 минут</b>\n<i>Реклама уровня дорогого бренда — без дизайнера.</i>\n\nВыберите пример или один из 4 стилей — Noir, Ivory, Cinema, Emerald. Впишите своё предложение, добавьте фото работы и смотрите, как постер собирается на ваших глазах.\n\nПредпросмотр бесплатный. Файл 1080×1350 без водяного знака — <b>${rub(POSTER_PRICE)}</b>, придёт сюда сразу после оплаты.\n\n🎁 В подарок: версия для сторис 1080×1920 и мини-гайд «15 ошибок в рекламе».`, kb([[{ text: "Открыть Studio", web_app: { url: POSTER_URL } }], [{ text: "← Коллекция", callback_data: "shop" }, { text: "Меню", callback_data: "menu" }]]));
}
async function showSubs(env, chat) {
  return media(env, chat, "photo", "shop/subs.jpg?v=4", `<b>Подписки VISUALL</b>\n\n<b>${SUBS.ads.n}</b> · ${rub(SUBS.ads.p)}/мес\n${esc(SUBS.ads.d)}\n\n<b>${SUBS.bot.n}</b> · ${rub(SUBS.bot.p)}/мес\n${esc(SUBS.bot.d)}\n\n<b>Бот для вашего бизнеса</b> · от 9 900 ₽\nКак этот: услуги и цены, приём заявок, уведомления вам.\n\nПродление — только по вашему решению: за 3 дня до конца я пришлю ссылку.`,
    kb([[{ text: `${SUBS.ads.n} · ${rub(SUBS.ads.p)}`, callback_data: "sb:ads" }], [{ text: `${SUBS.bot.n} · ${rub(SUBS.bot.p)}`, callback_data: "sb:bot" }], [{ text: "Заказать бота", callback_data: "svc0:bot" }], [{ text: "← Коллекция", callback_data: "shop" }, { text: "Меню", callback_data: "menu" }]]));
}
async function subsTick(env) {
  const l = await env.KV.list({ prefix: "sub:", limit: 200 }); const admin = await getAdmin(env); let n = 0;
  for (const k of l.keys) {
    const m = k.metadata; if (!m || n > 10) continue; const left = m.until - Date.now(); const plan = SUBS[m.plan] || SUBS.ads;
    if (left < 0) { await env.KV.delete(k.name); n++;
      await send(env, m.chat, `Подписка «${esc(plan.n)}» закончилась. Спасибо, что были с VISUALL! 💛 Продлить можно в любой момент.`, kb([[{ text: "💎 Продлить", callback_data: "sb:" + m.plan }]]));
      if (admin) await send(env, admin, `⌛ Закончилась подписка «${esc(plan.n)}»: ${who2(m)} #id${m.uid}`); continue; }
    if (left < 3 * 86400e3 && !m.rem) { m.rem = 1; await env.KV.put(k.name, JSON.stringify(m), { metadata: m }); n++;
      await send(env, m.chat, `⏰ Подписка «${esc(plan.n)}» заканчивается через ${Math.max(1, Math.ceil(left / 86400e3))} дн. Продлим ещё на 30 дней?`, kb([[{ text: `💎 Продлить — ${rub(plan.p)}`, callback_data: "sb:" + m.plan }]])); }
  }
}

// автопостер: веб-приложение присылает готовую картинку
async function posterUpload(req, env) {
  const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type", "content-type": "application/json" };
  if (req.method === "OPTIONS") return new Response("", { headers: cors });
  let b; try { b = await req.json(); } catch { return new Response('{"ok":false}', { status: 400, headers: cors }); }
  const u = await tgUserFromInitData(env, String(b.tg || "").slice(0, 4096));
  if (!u) return new Response('{"ok":false,"err":"open_in_bot"}', { status: 403, headers: cors });
  const img = String(b.img || ""); const m = img.match(/^data:image\/jpeg;base64,(.+)$/);
  if (!m || m[1].length > 6e6) return new Response('{"ok":false,"err":"bad_image"}', { status: 400, headers: cors });
  const ref = newPid(); await env.KV.put("pp:" + ref, m[1], { expirationTtl: 86400 * 7 });
  const m2 = String(b.img2 || "").match(/^data:image\/jpeg;base64,(.+)$/);
  if (m2 && m2[1].length < 8e6) await env.KV.put("pp2:" + ref, m2[1], { expirationTtl: 86400 * 7 });
  await trackBot(env, u, "автопостер").catch(() => {});
  await createPay(env, u.id, u, { kind: "poster", ref, amount: POSTER_PRICE, title: "VISUALL Studio — постер" + (b.title ? ` «${String(b.title).slice(0, 40)}»` : "") });
  return new Response('{"ok":true}', { headers: cors });
}

// уведомления ЮKassa
async function ykWebhook(req, env) {
  let b; try { b = await req.json(); } catch { return new Response("bad", { status: 400 }); }
  const id = b?.object?.id, pid = b?.object?.metadata?.pid; const cfg = await ykCfg(env);
  if (id && pid && cfg) { const { ok, j } = await ykApi(cfg, "/payments/" + id).catch(() => ({}));
    if (ok && j.status === "succeeded" && j.metadata?.pid === pid) await fulfill(env, pid, "yookassa"); }
  return new Response("ok");
}

// кнопки покупок (возвращает true, если обработал)
async function commerceCallback(env, chat, user, d, s) {
  if (d === "shop") { await showShop(env, chat); return true; }
  if (d === "subs") { await showSubs(env, chat); return true; }
  if (d === "ap") { await showPosterOffer(env, chat); return true; }
  if (d.startsWith("pr:")) { await showProduct(env, chat, d.slice(3)); return true; }
  if (d.startsWith("buy:")) { const p = PRODUCTS[d.slice(4)]; if (!p) return false;
    await createPay(env, chat, user, { kind: "prod", ref: d.slice(4), amount: p.p, title: p.n }); return true; }
  if (d.startsWith("sb:")) { const p = SUBS[d.slice(3)]; if (!p) return false;
    await createPay(env, chat, user, { kind: "sub", ref: d.slice(3), amount: p.p, title: `Подписка «${p.n}» на 30 дней` }); return true; }
  if (d === "pre") { const o = s.last; const c = o && calc(o);
    if (!c || !c.total || c.s.from) { await send(env, chat, "Светлана пришлёт сумму предоплаты сюда, как только согласует заказ 💛"); return true; }
    if (o.prepaid) { await send(env, chat, "✅ Предоплата по этому заказу уже получена. Спасибо!"); return true; }
    await createPay(env, chat, user, { kind: "pre", ref: o.svc, amount: Math.round(c.total / 2), title: `Предоплата 50%: ${c.s.n}` }); return true; }
  if (d.startsWith("pm:")) { const pid = d.slice(3); const r = await getPay(env, pid); if (!r) return true;
    if (r.st === "paid") { await send(env, chat, "✅ Эта оплата уже подтверждена."); return true; }
    r.st = "claimed"; await putPay(env, pid, r); const admin = await getAdmin(env);
    if (admin) await send(env, admin, `💳 <b>Клиент сообщил об оплате ${rub(r.amount)}</b>\n${esc(r.title)}\n👤 ${who2(r)}\n\nПроверьте поступление в Сбербанке и нажмите кнопку — клиент сразу получит ${r.kind === "prod" ? "файлы" : r.kind === "poster" ? "постер" : "подтверждение"}.\n#id${r.uid}`,
      kb([[{ text: "✅ Оплата пришла", callback_data: "pok:" + pid }, { text: "❌ Нет оплаты", callback_data: "pno:" + pid }]]));
    await send(env, chat, "🙏 Спасибо! Светлана проверит поступление и я сразу пришлю всё сюда. Обычно это занимает до часа (ночью — утром).\n\nЕсли удобно, пришлите сюда скриншот перевода."); return true; }
  if (d.startsWith("pchk:")) { const pid = d.slice(5); const r = await getPay(env, pid); const cfg = await ykCfg(env);
    if (!r) return true; if (r.st === "paid") { await send(env, chat, "✅ Оплата уже получена, всё отправлено выше."); return true; }
    if (cfg && r.y) { const { ok, j } = await ykApi(cfg, "/payments/" + r.y).catch(() => ({}));
      if (ok && j.status === "succeeded") { await fulfill(env, pid, "yookassa"); return true; } }
    await send(env, chat, "Оплата пока не поступила. Если вы оплатили только что — подождите минуту и нажмите ещё раз 🙏"); return true; }
  if ((d.startsWith("pok:") || d.startsWith("pno:")) && isAdmin(user)) { const pid = d.slice(4); const r = await getPay(env, pid); if (!r) return true;
    if (d.startsWith("pok:")) { await fulfill(env, pid, "sbp"); await send(env, chat, "✅ Подтверждено, клиент получил всё автоматически."); }
    else { r.st = "new"; await putPay(env, pid, r); await send(env, r.chat, "Светлана пока не видит ваш перевод 🙏 Проверьте, пожалуйста, номер и сумму или пришлите сюда скриншот — разберёмся.", kb([[{ text: "✅ Я оплатил(а)", callback_data: "pm:" + pid }]])); await send(env, chat, "Клиенту отправлено, что оплата не найдена."); }
    return true; }
  return false;
}

// команды администратора для продаж (возвращает true, если обработал)
async function commerceAdmin(env, chat, m, text) {
  let mm;
  if ((mm = text.match(/^\/касса(?:\s+(.*))?$/i))) {
    const a = (mm[1] || "").trim().split(/\s+/).filter(Boolean);
    if (!a.length) { const c = await ykCfg(env); return send(env, chat, c ? `✅ ЮKassa подключена (магазин ${esc(c.shop)}${c.email ? ", чеки на " + esc(c.email) : ""}).\n\nАдрес для уведомлений в кабинете ЮKassa:\n<code>https://visuall-bot.svetayurkina.workers.dev/yk</code>\n\n<code>/касса выкл</code> — отключить.` : "ЮKassa не подключена — сейчас клиенты платят по СБП, а вы подтверждаете оплату кнопкой.\n\nЧтобы подключить: <code>/касса shopId секретный_ключ</code>"); }
    if (a[0] === "выкл") { await env.KV.delete("yk"); return send(env, chat, "ЮKassa отключена. Оплата — по СБП с подтверждением."); }
    if (a.length < 2) return send(env, chat, "Формат: <code>/касса shopId секретный_ключ</code> (и по желанию email для чеков)");
    const cfg = { shop: a[0], key: a[1], email: a[2] || "" };
    const test = await ykApi(cfg, "/payments?limit=1").catch(() => ({ ok: false, j: {} }));
    if (!test.ok) return send(env, chat, `❌ ЮKassa не приняла ключи: ${esc(test.j.description || test.j.code || "проверьте shopId и секретный ключ")}`);
    await env.KV.put("yk", JSON.stringify(cfg)); await tg(env, "deleteMessage", { chat_id: chat, message_id: m.message_id });
    return send(env, chat, "✅ ЮKassa подключена! Сообщение с ключом я удалила.\n\nПоследний шаг: в кабинете ЮKassa → Интеграция → HTTP-уведомления вставьте адрес\n<code>https://visuall-bot.svetayurkina.workers.dev/yk</code>\nи отметьте событие <b>payment.succeeded</b>.");
  }
  if ((mm = text.match(/^\/товар\s+([a-z]+)(\s+сброс)?/i))) {
    const code = mm[1].toLowerCase(); if (!PRODUCTS[code] || PRODUCTS[code].items) return send(env, chat, `Коды товаров: ${Object.keys(PRODUCTS).filter((k) => !PRODUCTS[k].items).join(", ")}`);
    if (mm[2]) { await env.KV.delete("pf:" + code); return send(env, chat, `Файлы товара «${esc(PRODUCTS[code].s)}» удалены.`); }
    const fid = m.document?.file_id || (m.photo && m.photo[m.photo.length - 1].file_id);
    if (!fid) return send(env, chat, "Прикрепите файл и в подписи напишите <code>/товар " + code + "</code>");
    const files = JSON.parse((await env.KV.get("pf:" + code)) || "[]"); files.push(fid); await env.KV.put("pf:" + code, JSON.stringify(files));
    return send(env, chat, `✅ Файл добавлен в «${esc(PRODUCTS[code].s)}» (файлов: ${files.length}). Покупатели получат его автоматически.`);
  }
  if (/^\/товары$/i.test(text)) {
    const lines = []; for (const [k, p] of Object.entries(PRODUCTS)) { if (p.items) continue; const f = JSON.parse((await env.KV.get("pf:" + k)) || "[]"); lines.push(`${f.length ? "✅" : "⚠️"} <code>${k}</code> — ${esc(p.s)} (${rub(p.p)}): файлов ${f.length}`); }
    return send(env, chat, "🛍 <b>Товары</b>\n\n" + lines.join("\n") + "\n\nЗагрузить: отправьте файл с подписью <code>/товар код</code>.");
  }
  if ((mm = text.match(/^\/сч[её]т\s+(\d[\d\s]*)\s*(.*)$/i))) {
    const r = m.reply_to_message; const to = r && (r.text || r.caption || "").match(/#id(\d+)/);
    if (!to) return send(env, chat, "Ответьте этой командой на сообщение клиента (где есть #id), например:\n<code>/счет 4950 Сайт — предоплата 20%</code>");
    const amount = +mm[1].replace(/\s/g, ""); const title = mm[2].trim() || "Оплата заказа VISUALL";
    await createPay(env, to[1], { id: to[1] }, { kind: "inv", ref: "", amount, title });
    return send(env, chat, `✅ Клиенту отправлен счёт на ${rub(amount)}. Когда оплатит — я пришлю уведомление.`);
  }
  if (/^\/подписки$/i.test(text)) {
    const l = await env.KV.list({ prefix: "sub:", limit: 200 });
    const lines = l.keys.filter((k) => k.metadata).map((k) => `• ${(SUBS[k.metadata.plan] || {}).n}: ${who2(k.metadata)} — до ${MSKD(k.metadata.until).toISOString().slice(0, 10).split("-").reverse().join(".")}`);
    return send(env, chat, "💎 <b>Активные подписки</b>\n\n" + (lines.join("\n") || "Пока нет."));
  }
  return null;
}

// ---------- напоминания и рассылка (cron) ----------
const markStarted = (env, uid, chat) => env.KV.put("ab:" + uid, "1", { expirationTtl: 86400 * 3, metadata: { t: Date.now(), chat } }).catch(() => {});
const clearStarted = (env, uid) => env.KV.delete("ab:" + uid).catch(() => {});
async function cronTick(env) {
  // утренний отчёт за вчера в 9:00 по Москве
  if (MSKD().getUTCHours() === 9) { const f = "rep:" + dayKey(); if (!(await env.KV.get(f))) { const admin = await getAdmin(env); if (admin) { await env.KV.put(f, "1", { expirationTtl: 86400 * 2 }); await sendReport(env, admin, 1, 1); } } }
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
  await subsTick(env).catch((e) => console.log("subs", e));
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
  if (s.gift) L.push(`🎁 Подарок: ${esc(s.gift)}`);
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
  itemPrice: (k) => { const sv = SERVICES[k]; return `💰 <b>${esc(sv.n)}</b> — ${priceStr(sv)}\n⏱ Срок: ${sv.d}\n✅ Что входит: ${esc(sv.inc)}.${sv.gift ? `\n🎁 В подарок: ${esc(sv.gift)}.` : ""}${sv.design ? `\n\n🎟 −10% по промокоду <code>${PROMO}</code> до ${promoUntil()}. Срочно за 24 часа — +50%.` : "\n\nТочную цену Светлана назовёт после короткого брифа — она зависит от объёма."}`; },
  urgent: () => `⚡ <b>Срочно — можно.</b>\nЗа 24 часа делаем постер, визитку, сертификат, прайс, текст, комбо или пакет — +50% к цене.\nНапример: постер срочно — 1 485 ₽, пакет из 4 форматов срочно — 3 885 ₽.\n\nЧтобы успеть, пришлите сразу всё: текст, цены, контакты, фото и логотип. Срок считается с момента, когда пришли материалы и предоплата.`,
  refund: () => `🤝 <b>Гарантии и честные условия</b>\n• Предоплата 50% — только после того, как Светлана согласовала с вами задачу и цену\n• Работа ещё не начата — предоплата возвращается полностью\n• Первый вариант не попал в ожидания — для этого есть 2 бесплатных круга правок (видео — 1, сайт — 3)\n• Захотите другой стиль после согласования — новый вариант со скидкой 50%\n• Остаток оплачиваете, только когда результат вам понравился\n• Официальный чек самозанятой после каждой оплаты`,
  receipt: () => `🧾 <b>Да, чек будет.</b> Светлана работает как самозанятая и после каждой оплаты присылает официальный чек из «Мой налог». Для ИП и компаний в чеке можно указать ИНН — напишите его при оплате.\n\nОплата — СБП на Сбербанк по номеру <code>${PHONE}</code> или кнопкой в боте.`,
  formats: () => `🖼 <b>Какие файлы вы получите</b>\n• <b>Для соцсетей:</b> 1080×1350 (лента, формат 4:5) — PNG/JPG\n• <b>Для сторис и статусов:</b> 1080×1920 — в подарок к постеру\n• <b>Для печати:</b> PDF в CMYK, 300 dpi, с вылетами 2 мм — его примет любая типография без доработок\n• Визитка 90×50 мм, сертификат 210×99 мм (евроконверт E65), прайс — A4\n• Видео — MP4, 9:16, для Reels, сторис и статусов\n\nФайлы приходят в этот чат сразу после полной оплаты.`,
  print: () => `🖨 <b>Как напечатать, чтобы выглядело дорого</b>\n• <b>Визитки:</b> плотность 300–350 г/м², матовая ламинация — не царапается и не бликует. Тираж 100–200 штук обычно хватает на 2–3 месяца\n• <b>Сертификаты:</b> дизайнерская бумага 250–300 г/м² (с фактурой или «софт-тач»), к ним — конверт E65\n• <b>Постер на стену или у кассы:</b> A4 или A3, матовая бумага от 170 г/м²\n• <b>Прайс:</b> A4, можно заламинировать — переживёт сотни рук\n\nОтдавайте в типографию PDF из комплекта — в нём уже есть вылеты и правильные цвета. Перед большим тиражом попросите один пробный оттиск: цвета на бумаге всегда чуть отличаются от экрана.`,
  rights: () => `📄 <b>Чьи файлы и что с ними можно делать</b>\nПосле полной оплаты готовые файлы ваши: публикуйте в любых соцсетях, печатайте любым тиражом, отдавайте в типографию и на Авито — для рекламы своего бизнеса.\n\nФото, которые вы присылаете, используются только в вашем заказе. Показать работу в портфолио Светлана может только с вашего согласия — и за это даёт скидку 20%.`,
  stories: () => `📱 <b>Сторис и статусы</b>\nДля сторис нужен вертикальный формат 1080×1920: обычный постер 4:5 там обрезается. Поэтому к каждому постеру версия для сторис — <b>в подарок</b>.\n\nСовет: держите текст в центре кадра — сверху и снизу по 12–15% закрывают кнопки и подписи. Выкладывайте рекламу в сторис раз в 3–5 дней, а между ними — живые кадры работы: так реклама не надоедает.`,
  vidpost: () => `🎬 <b>Видео или постер?</b>\n• <b>Постер</b> — основа: закреп, прайс, печать, Авито, чаты. Его читают и сохраняют\n• <b>Видео</b> — охват: Reels и сторис показывают новым людям, движение останавливает ленту\n\nЛучшая связка — постер + видео из него: один стиль, разные задачи. Можно начать с постера, а через неделю оживить его в видео — от 1 990 ₽.`,
  use: () => `📣 <b>Как выжать из рекламы максимум</b>\n1. Закрепите постер первым постом и в шапке профиля\n2. Поставьте в статус мессенджеров — его видят все ваши контакты\n3. Сторис раз в 3–5 дней, версия для сторис — в подарок к постеру\n4. Районные чаты и паблики — в разрешённые дни, по правилам чата\n5. Авито — главным фото объявления\n6. Печать у кассы, на стойке или в зеркале — с QR-кодом на запись\n7. Спрашивайте каждого нового клиента «откуда вы о нас узнали?» — через месяц станет ясно, что работает`,
  gifts: () => `🎁 <b>Подарки — к каждому заказу</b>\n• Постер — версия для сторис + 3 подписи к посту\n• Комбо — версия для сторис + QR-код + 3 подписи\n• Пакет из 4 — сторис + 5 обложек «Актуального» + 5 подписей\n• Визитка — электронная визитка + QR-код\n• Сертификат — электронная версия + памятка «Как продавать сертификаты»\n• Прайс — версия для закрепа и сторис\n• Текст — 15 заголовков + 5 идей для сторис\n• Видео — обложка для Reels + текст к ролику\n• Бот и сайт — 30 дней поддержки после запуска\n• Любая покупка в Atelier — мини-гайд «15 ошибок в рекламе», Studio — ещё и версия постера для сторис\n\nИ всем, без покупки: мини-гайд и бесплатный разбор вашей рекламы.`,
  photos: () => `📸 <b>Свои фото — лучший вариант.</b> Реальная работа вызывает больше доверия, чем любая картинка.\n\nКак снять, чтобы было красиво: днём у окна, без вспышки и фильтров, на однотонном фоне (ткань, лист бумаги), камеру протереть. Сделайте 10 кадров с разных ракурсов — Светлана выберет лучший и сделает из него постер. Можно прислать прямо сюда.`,
  custom: () => `🎨 <b>Да, можно дизайн не из каталога.</b>\nОпишите идею или пришлите пример, который нравится, — Светлана предложит, как сделать это в вашем стиле и для вашей задачи. Оформите заявку «Свой дизайн / другое» — это займёт минуту.`,
  online: () => `🌍 <b>Работаем онлайн по всей России.</b> Всё общение, макеты, правки и готовые файлы — здесь, в Telegram. Для печати получите PDF, который примет типография в вашем городе.`,
  hours: () => `🕐 Я, бот, работаю круглосуточно: заявку, вопрос или покупку можно оформить в любое время. Светлана отвечает лично в течение дня, обычно в течение нескольких часов.`,
  contacts: () => `📱 <b>Контакты</b>\nTelegram: @sveta_muzyka\nТелефон: ${PHONE}\nСайт: ${SITE}\nЗаказ можно оформить прямо здесь — за минуту.`,
  reviewsAsk: () => `⭐ Отзывы клиентов собираются после каждого заказа и публикуются на сайте только с их согласия. Пока можно посмотреть ${Object.values(CAT).flat().reduce((n, i) => n + i.r.length, 0)}+ примеров работ и выбрать стиль под себя.`,
  thanks: () => `Пожалуйста! 💛 Если появятся вопросы — пишите, я на связи круглосуточно.`,
  styles: () => `🎨 <b>Стили</b>: люкс и тёмный люкс, нежный, минимализм, арт-эдиториал, макро, глянцевый 3D, жидкий хром, сюрреализм, ретро, поп-арт, кибер-гламур, Y2K и другие.\n\nКак выбрать: стиль должен совпадать с ценой и характером вашей услуги. Премиум-услугам подходит люкс и минимализм, детским и семейным — нежный и 3D, молодёжным — поп-арт и Y2K.\n\nПройдите квиз — подберу 4 постера под ваше настроение за 30 секунд 🔮`,
  difference: () => `📦 <b>Что выбрать</b>\n• <b>Постер</b> (990 ₽) — если нужна одна сильная реклама: для закрепа, сторис, чатов и печати\n• <b>Комбо</b> (1 490 ₽) — постер + второй формат в том же стиле: визитка, если вас передают «из рук в руки», сертификат — перед праздниками, прайс — если часто спрашивают цены\n• <b>Пакет из 4</b> (2 590 ₽) — постер, визитка, сертификат и прайс: вся реклама в одном стиле, бизнес выглядит цельно и дорого. По отдельности — 3 560 ₽\n\n🎁 К каждому — подарок, к пакету самый большой: сторис, 5 обложек «Актуального» и 5 подписей к постам.`,
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
  if (/(бесплатн|даром|халяв)/.test(t)) return [{ route: "free" }];
  if (/(видео или|или видео|reels или|или постер|рилс или)/.test(t)) return [{ text: A.vidpost(), kb: kb([BACK]) }];
  if (/(сторис|stories|статус)/.test(t) && !/(instagram|инстаграм|инста(?![а-я])|ведени|под ключ)/.test(t)) return [{ text: A.stories(), kb: kb([BACK]) }];
  if (/(разбор|оцените|посмотрите мою|посмотри мою|мою рекламу|что не так с)/.test(t)) return [{ route: "audit" }];
  if (/(подар)/.test(t) && !/(сертификат)/.test(t)) out.push({ text: A.gifts(), kb: kb([BACK, [{ text: "🎁 Бесплатно и полезно", callback_data: "free" }]]) });
  if (/(напечат|распечат|бумаг|плотност|ламинац|тираж)/.test(t)) out.push({ text: A.print(), kb: kb([BACK]) });
  if (/(прав[ао] на|авторск|чь[иь] файл|могу ли использовать|можно ли использовать|исходник)/.test(t)) out.push({ text: A.rights(), kb: kb([BACK]) });
  if (/(как использовать|где разместить|куда выложить|где публиковать|как продвигать|что делать с рекламой)/.test(t)) out.push({ text: A.use(), kb: kb([BACK]) });
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
    case "free": return send(env, chat, `🎁 <b>Бесплатно и полезно</b>\n\n• <b>Мини-гайд «15 ошибок, которые съедают вашу рекламу»</b> — проверьте свою рекламу по списку за 10 минут\n• <b>Разбор вашей рекламы</b> — пришлите пост или постер, Светлана лично даст 3 конкретных совета\n• <b>Готовые тексты</b> для 50+ сфер — с юмором, тепло, профессионально\n• <b>Промпты для нейросетей</b> — чтобы сделать картинку для рекламы самой\n• <b>Studio</b> — соберите постер и посмотрите предпросмотр бесплатно`, kb([[{ text: "📘 Скачать мини-гайд", callback_data: "fg" }], [{ text: "🔍 Бесплатный разбор рекламы", callback_data: "audit" }], [{ text: "✍️ Тексты", url: SITE + "#texts" }, { text: "🪄 Промпты", url: SITE + "#prompts" }], [{ text: "✦ Studio — предпросмотр", callback_data: "ap" }], [{ text: "⬅️ Меню", callback_data: "menu" }]]));
    case "fg": await tg(env, "sendDocument", { chat_id: chat, document: FREE_GUIDE, caption: "📘 <b>15 ошибок, которые съедают вашу рекламу</b>\nОткройте свой последний рекламный пост и пройдитесь по списку — начните с первых пяти пунктов.", parse_mode: "HTML" });
      return send(env, chat, "Хотите, чтобы Светлана посмотрела именно вашу рекламу? Это бесплатно.", kb([[{ text: "🔍 Бесплатный разбор", callback_data: "audit" }], [{ text: "⬅️ Меню", callback_data: "menu" }]]));
    case "audit": { const s = await getS(env, user.id); s.step = "audit"; s.auditSent = 0; await setS(env, user.id, s);
      return send(env, chat, "🔍 <b>Бесплатный разбор рекламы</b>\n\nПришлите сюда одним-тремя сообщениями вашу текущую рекламу: постер, скриншот поста или ссылку, и одной строкой — что вы продаёте и кому.\n\nСветлана посмотрит лично и пришлёт 3 конкретных совета: что убрать, что добавить и что поменять, чтобы реклама приводила больше заявок.", kb([[{ text: "⬅️ Меню", callback_data: "menu" }]])); }
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
    const pc = code === "pay" && o ? calc(o) : null;
    if (pc && pc.total && !pc.s.from && !o.prepaid) { await send(env, uid, `💳 <b>Заказ согласован!</b>\n\nПредоплата 50% — <b>${rub(Math.round(pc.total / 2))}</b>. Оплатить можно прямо здесь — работа начнётся сразу после оплаты. 🧾 Чек самозанятой пришлём после оплаты.`, kb([[{ text: `💳 Внести предоплату ${rub(Math.round(pc.total / 2))}`, callback_data: "pre" }]]));
      await tg(env, "editMessageReplyMarkup", { chat_id: chat, message_id: q.message.message_id, reply_markup: statusKb(uid, code) });
      return send(env, chat, `✅ Клиенту отправлена кнопка предоплаты ${rub(Math.round(pc.total / 2))}. Когда оплатит — пришлю уведомление.`); }
    await send(env, uid, STATUS[code][1](o), code === "done" ? kb([[{ text: "⭐ Оставить отзыв (−15%)", callback_data: "review" }], [{ text: "🤝 Пригласить друга", callback_data: "invite" }]]) : code === "cancel" ? MAIN_KB : undefined);
    await tg(env, "editMessageReplyMarkup", { chat_id: chat, message_id: q.message.message_id, reply_markup: statusKb(uid, code) });
    return send(env, chat, `✅ Клиенту отправлен статус: ${STATUS[code][0]}`);
  }
  if (d === "bc:go" && isAdmin(user)) { const job = JSON.parse((await env.KV.get("bc")) || "null"); if (!job) return send(env, chat, "Рассылка не найдена.");
    job.go = 1; await env.KV.put("bc", JSON.stringify(job)); await send(env, chat, "📣 Рассылка запущена! Отправляю порциями, в конце пришлю отчёт."); return runBroadcast(env, job, 30); }
  if (d === "bc:no" && isAdmin(user)) { await env.KV.delete("bc"); return send(env, chat, "Рассылка отменена."); }
  const s = await getS(env, user.id);
  if (!s.reg && !s.unsub) { s.reg = 1; await env.KV.put("u:" + user.id, "1"); await setS(env, user.id, s); }
  if (s.step === "audit" && d !== "audit" && d !== "fg") { s.step = null; await setS(env, user.id, s); }
  if (await commerceCallback(env, chat, user, d, s)) return;
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
    if (cur !== String(chat)) { await env.KV.put("admin", String(chat)); await send(env, chat, "✅ Вы подключены как администратор. Сюда будут приходить заявки и вопросы клиентов. Чтобы ответить клиенту — ответьте (свайп → «Ответить») на его сообщение.\n\nКоманды:\n/stats — заявки и пользователи\n/отчет — кто и сколько был в боте и на сайте (каждое утро в 9:00 пришлю сам)\n/рассылка текст — новость всем клиентам (можно с фото)\n/товары — файлы магазина · /товар код — загрузить файл\n/касса — подключить ЮKassa\n/счет сумма описание — ответом на сообщение клиента\n/подписки — активные подписки\n/menu — посмотреть бота глазами клиента\n\nПод каждой заявкой — кнопки статуса: клиент сразу получит уведомление."); }
    { const cr = await commerceAdmin(env, chat, m, text); if (cr !== null) return cr; }
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
    const rep = text.match(/^\/(отч[её]т|report)\s*(.*)$/i);
    if (rep) { const a = rep[2].trim().toLowerCase(); const n = parseInt(a, 10);
      if (/вчера/.test(a)) return sendReport(env, chat, 1, 1);
      if (/недел/.test(a)) return sendReport(env, chat, 7, 0);
      if (/месяц/.test(a)) return sendReport(env, chat, 30, 0);
      return sendReport(env, chat, n > 0 ? Math.min(n, 60) : 1, 0); }
    if (text === "/stats") { const n = +(await env.KV.get("orders") || 0), u = +(await env.KV.get("users") || 0); const rv = +(await env.KV.get("rev") || 0); return send(env, chat, `📊 Заявок: ${n}\nПользователей: ${u}\nОплачено через бота: ${rub(rv)}`); }
    if (text !== "/menu" && !text.startsWith("/start")) return send(env, chat, "Чтобы ответить клиенту, ответьте на его сообщение (свайп → «Ответить»).\n/рассылка текст — новость всем клиентам\n/stats — статистика\n/отчет — кто и сколько был в боте и на сайте\n/товары · /касса · /счет · /подписки — продажи\n/menu — меню клиента.");
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
  const pd = text.match(/^\/start\s+paid_([a-z0-9]+)/i);
  if (pd) { await commerceCallback(env, chat, user, "pchk:" + pd[1], s); return; }
  if (/^\/start\s+(audit|free)$/i.test(text)) return route(env, chat, text.split(/\s+/)[1].toLowerCase(), user);
  const sd = text.match(/^\/start\s+(shop|subs|poster|pr_[a-z]+)$/i);
  if (sd) { const k = sd[1].toLowerCase(); if (k === "poster") return showPosterOffer(env, chat);
    await commerceCallback(env, chat, user, k.startsWith("pr_") ? "pr:" + k.slice(3) : k, s); return; }
  if (text.startsWith("/start") || text === "/menu") { s.step = null; await setS(env, user.id, s); return route(env, chat, "menu", user); }
  if (text === "/price" || text === "/prices") return route(env, chat, "prices", user);
  if (text === "/order") return route(env, chat, "order", user);
  if (text === "/help") return route(env, chat, "faq", user);
  if (text === "/quiz") return route(env, chat, "quiz", user);

  if (s.step === "audit" && ((s.auditSent && Date.now() - (s.auditAt || 0) > 30 * 60e3) || (text && !m.photo && !m.document && (/\?\s*$/.test(text) || (s.auditSent && smart(text, user).length && text.length < 120))))) { s.step = null; await setS(env, user.id, s); }
  if (s.step === "audit" && (text || m.photo || m.document)) {
    const admin = await getAdmin(env);
    if (admin) { await tg(env, "copyMessage", { chat_id: admin, from_chat_id: chat, message_id: m.message_id });
      if (!s.auditSent) await send(env, admin, `🔍 <b>Запрос на бесплатный разбор рекламы</b>\n👤 ${esc(user.first_name || "")}${user.username ? " (@" + esc(user.username) + ")" : ""}\nВыше — материалы клиента. Ответьте на это сообщение тремя советами — я перешлю их клиенту.\n#id${user.id}`); }
    if (!s.auditSent) { s.auditSent = 1; s.auditAt = Date.now(); await setS(env, user.id, s);
      return send(env, chat, "✅ Получила! Можно дослать ещё материалы — я всё передам. Светлана посмотрит и пришлёт разбор сюда, обычно в течение дня.\n\nА пока — мини-гайд «15 ошибок в рекламе», он тоже бесплатный.", kb([[{ text: "📘 Скачать мини-гайд", callback_data: "fg" }], [{ text: "⬅️ Меню", callback_data: "menu" }]])); }
    return send(env, chat, "✅ Добавила к разбору.");
  }
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
    if (url.pathname === "/yk" && req.method === "POST") { try { return await ykWebhook(req, env); } catch (e) { console.log("yk", e && e.stack || e); return new Response("ok"); } }
    if (url.pathname === "/poster") { try { return await posterUpload(req, env); } catch (e) { console.log("poster", e && e.stack || e); return new Response('{"ok":false}', { status: 500, headers: { "access-control-allow-origin": "*" } }); } }
    if (url.pathname === "/t") {
      const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
      if (req.method === "POST") { try { await trackSite(req, env); } catch (e) { console.log("track", e && e.stack || e); } }
      return new Response("ok", { headers: cors });
    }
    if (req.method === "GET") return new Response("VISUALL bot is running ✨");
    if (env.WEBHOOK_SECRET && req.headers.get("x-telegram-bot-api-secret-token") !== env.WEBHOOK_SECRET) return new Response("forbidden", { status: 403 });
    let u; try { u = await req.json(); } catch { return new Response("bad", { status: 400 }); }
    try {
      const cq = u.callback_query, mm = u.message;
      if (cq) await trackBot(env, cq.from, ACT[(cq.data || "").split(":")[0]]).catch(() => {});
      else if (mm && mm.chat && mm.chat.type === "private") {
        const tx = mm.text || "", st = tx.match(/^\/start\s*(\S*)/);
        const src = st ? (/^o_|_v|^v_/.test(st[1]) ? "с сайта" : /^ref_/.test(st[1]) ? "по приглашению друга" : st[1] ? "ссылка: " + st[1].slice(0, 30) : "") : "";
        await trackBot(env, mm.from, st ? (/^o_/.test(st[1]) ? "заказ с сайта" : "старт") : mm.photo || mm.document || mm.video ? "прислал(а) файл" : tx ? "писал(а) сообщения" : "", src).catch(() => {});
        const vid = (tx.match(/(?:_v|^\/start\s+v_)([a-z0-9]{8})\b/i) || [])[1];
        if (vid && mm.from && !isAdmin(mm.from)) await env.KV.put("vid:" + vid, "1", { metadata: { n: clip((mm.from.first_name || "") + (mm.from.last_name ? " " + mm.from.last_name : ""), 40), u: clip(mm.from.username || "", 32) }, expirationTtl: 86400 * 62 }).catch(() => {});
      }
      if (u.callback_query) await onCallback(env, u.callback_query);
      else if (u.message) await onMessage(env, u.message);
    } catch (e) { console.log("err", e && e.stack || e); }
    return new Response("ok");
  },
};
