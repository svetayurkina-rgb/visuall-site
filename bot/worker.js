// VISUALL Telegram-бот — Cloudflare Worker (webhook)
// Секреты: BOT_TOKEN, WEBHOOK_SECRET. Хранилище: KV (binding KV).
// Администратор определяется по username ADMIN_USERNAME (без @).

const SITE = "https://svetayurkina-rgb.github.io/visuall-site/";
const ADMIN_USERNAME = "sveta_muzyka";
const PHONE = "+7 (925) 062-00-01";
const PROMO = "VISUALL10";

const SERVICES = {
  poster: { n: "Постер", p: 990, d: "1 рабочий день", design: true, inc: "1 постер в выбранном стиле с вашим текстом, ценами и контактами, QR-код, формат для соцсетей 1080×1350 + PDF для печати, 2 круга правок" },
  combo: { n: "Комбо: постер + 1 формат", p: 1490, d: "1–2 рабочих дня", design: true, inc: "постер + визитка, сертификат или прайс в одном стиле, файлы для соцсетей и печати, 2 круга правок" },
  pack: { n: "Пакет из 4 форматов", p: 2590, d: "2–3 рабочих дня", design: true, inc: "постер, визитка (2 стороны, 90×50 мм), подарочный сертификат (210×99 мм), прайс на 3 страницы, файлы для соцсетей + PDF для типографии, 2 круга правок" },
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
  [{ text: "🛒 Оформить заказ", callback_data: "order" }],
  [{ text: "💰 Цены", callback_data: "prices" }, { text: "🧮 Рассчитать", callback_data: "calc" }],
  [{ text: "🎨 Каталог стилей", url: SITE }, { text: "🎟 Скидки", callback_data: "disc" }],
  [{ text: "⏱ Сроки и правки", callback_data: "terms" }, { text: "💳 Оплата", callback_data: "pay" }],
  [{ text: "📝 Как проходит заказ", callback_data: "how" }, { text: "❓ Вопросы", callback_data: "faq" }],
  [{ text: "👩‍🎨 Позвать Светлану", callback_data: "human" }],
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
  L.push(`🛍 Услуга: <b>${esc(s.n)}</b> — ${priceStr(s)}`);
  if (o.sphere) L.push(`🏷 Сфера: ${esc(SPHERES[o.sphere] || o.sphere)}`);
  if (o.biz) L.push(`🏪 Бизнес: ${esc(o.biz)}`);
  if (o.style) L.push(`🎨 Стиль / идея: ${esc(o.style)}`);
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
  const rows = [["poster", "combo"], ["pack"], ["video", "bot"], ["site", "insta"], ["all", "custom"]]
    .map((r) => r.map((k) => ({ text: `${SERVICES[k].n} · ${priceStr(SERVICES[k])}`, callback_data: "svc:" + k })));
  rows.push([{ text: "⬅️ Меню", callback_data: "menu" }]);
  return send(env, chat, "🛒 <b>Шаг 1 из 5.</b> Что нужно сделать?", kb(rows));
}
async function askSphere(env, chat) {
  const ks = Object.keys(SPHERES), rows = [];
  for (let i = 0; i < ks.length; i += 2) rows.push(ks.slice(i, i + 2).map((k) => ({ text: SPHERES[k], callback_data: "sph:" + k })));
  return send(env, chat, "🏷 <b>Шаг 2 из 5.</b> Какая у вас сфера?", kb(rows));
}
const askBiz = (env, chat) => send(env, chat, "🏪 <b>Шаг 3 из 5.</b> Как называется ваш бизнес или как вас зовут как мастера?\n\n<i>Напишите ответ сообщением.</i>");
const askStyle = (env, chat) => send(env, chat, `🎨 <b>Шаг 4 из 5.</b> Какой стиль понравился в каталоге? Напишите название или опишите идею.\n\nКаталог: ${SITE}`, kb([[{ text: "Пока не выбрал(а) — помогите подобрать", callback_data: "style:help" }]]));
async function askOptions(env, chat, o) {
  const s = SERVICES[o.svc];
  if (!s.design) return askPhone(env, chat);
  const rows = Object.entries(DISC).map(([k, [n, p]]) => [{ text: `${o.disc === k ? "✅ " : ""}${n}${p ? " −" + p + "%" : ""}`, callback_data: "disc:" + k }]);
  rows.unshift([{ text: `${o.urgent ? "✅" : "⬜️"} Срочно за 24 часа (+50%)`, callback_data: "urg" }]);
  rows.push([{ text: "Дальше ➡️", callback_data: "opt:done" }]);
  return send(env, chat, `⚙️ <b>Шаг 5 из 5.</b> Срочность и скидка\n\n${summary(o)}`, kb(rows));
}
const askPhone = (env, chat) => send(env, chat, "📞 Последнее: оставьте телефон для связи — нажмите кнопку ниже или напишите номер.", {
  keyboard: [[{ text: "📱 Отправить мой номер", request_contact: true }], [{ text: "Пропустить" }]], resize_keyboard: true, one_time_keyboard: true,
});
async function showConfirm(env, chat, o) {
  await send(env, chat, "Готово ✨", { remove_keyboard: true });
  return send(env, chat, summary(o) + "\n\nВсё верно?", kb([[{ text: "✅ Отправить Светлане", callback_data: "confirm" }], [{ text: "✏️ Заново", callback_data: "order" }, { text: "⬅️ Меню", callback_data: "menu" }]]));
}

// ---------- калькулятор ----------
async function showCalc(env, chat, o, msgId) {
  const keys = ["poster", "combo", "pack"];
  const rows = [keys.map((k) => ({ text: `${o.svc === k ? "✅ " : ""}${SERVICES[k].n.split(":")[0]}`, callback_data: "c:svc:" + k }))];
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

async function forwardToAdmin(env, user, text) {
  const admin = await getAdmin(env); if (!admin) return false;
  await send(env, admin, `💬 <b>Вопрос от клиента</b>\n👤 ${esc(user.first_name || "")}${user.username ? " (@" + esc(user.username) + ")" : ""}\n\n${esc(text)}\n\n<i>Ответьте на это сообщение (свайп → «Ответить») — я перешлю ответ клиенту.</i>\n#id${user.id}`);
  return true;
}

async function route(env, chat, key, user, msgId) {
  switch (key) {
    case "menu": return send(env, chat, T.hello(user?.first_name), MAIN_KB);
    case "prices": return send(env, chat, T.prices(), kb([BACK, [{ text: "🧮 Рассчитать заказ", callback_data: "calc" }]]));
    case "terms": return send(env, chat, T.terms(), kb([BACK]));
    case "pay": return send(env, chat, T.pay(), kb([BACK]));
    case "disc": return send(env, chat, T.disc(), kb([BACK, [{ text: "⭐ Оставить отзыв", callback_data: "review" }]]));
    case "how": return send(env, chat, T.how(), kb([BACK]));
    case "faq": return send(env, chat, T.faq(), kb([BACK]));
    case "about": return send(env, chat, T.about(), kb([BACK]));
    case "catalog": return send(env, chat, `🎨 Каталог стилей и примеры — на сайте:\n${SITE}\n\nВыберите стиль, а потом оформите заказ здесь.`, kb([[{ text: "🎨 Открыть каталог", url: SITE }], BACK]));
    case "calc": { const s = await getS(env, user.id); s.c = { svc: "pack", disc: "promo" }; await setS(env, user.id, s); return showCalc(env, chat, s.c); }
    case "order": { const s = await getS(env, user.id); s.o = { disc: "promo" }; s.step = "svc"; await setS(env, user.id, s); return askService(env, chat); }
    case "human": { const s = await getS(env, user.id); s.step = "ask"; await setS(env, user.id, s);
      return send(env, chat, "👩‍🎨 Напишите ваш вопрос одним сообщением — я сразу передам его Светлане, она ответит здесь же.\n\nИли напишите ей напрямую: @sveta_muzyka", kb([[{ text: "Написать @sveta_muzyka", url: "https://t.me/sveta_muzyka" }], [{ text: "⬅️ Меню", callback_data: "menu" }]])); }
    case "review": { const s = await getS(env, user.id); s.step = "review"; await setS(env, user.id, s);
      return send(env, chat, "⭐ Спасибо, что выбрали VISUALL! Поставьте оценку:", kb([[1, 2, 3, 4, 5].map((n) => ({ text: "★".repeat(n), callback_data: "rate:" + n }))])); }
  }
}

// ---------- обработчики ----------
async function onCallback(env, q) {
  const chat = q.message.chat.id, user = q.from, d = q.data || "";
  await tg(env, "answerCallbackQuery", { callback_query_id: q.id });
  const s = await getS(env, user.id);
  if (d.startsWith("c:")) {
    s.c = s.c || { svc: "pack", disc: "promo" };
    const [, a, b] = d.split(":");
    if (a === "svc") s.c.svc = b;
    if (a === "urg") s.c.urgent = !s.c.urgent;
    if (a === "disc") s.c.disc = s.c.disc === b ? "no" : b;
    if (a === "order") { s.o = { ...s.c }; s.step = "sph"; await setS(env, user.id, s); return askSphere(env, chat); }
    await setS(env, user.id, s); return showCalc(env, chat, s.c, q.message.message_id);
  }
  if (d.startsWith("svc:")) { s.o = { ...(s.o || {}), svc: d.slice(4) }; s.step = "sph"; await setS(env, user.id, s); return askSphere(env, chat); }
  if (d.startsWith("sph:")) { s.o = s.o || {}; s.o.sphere = d.slice(4); s.step = "biz"; await setS(env, user.id, s); return askBiz(env, chat); }
  if (d === "style:help") { s.o = s.o || {}; s.o.style = "нужна помощь с выбором стиля"; return afterStyle(env, chat, user, s); }
  if (d === "urg") { s.o.urgent = !s.o.urgent; await setS(env, user.id, s); return askOptions(env, chat, s.o); }
  if (d.startsWith("disc:")) { s.o.disc = d.slice(5); await setS(env, user.id, s); return askOptions(env, chat, s.o); }
  if (d === "opt:done") { s.step = "phone"; await setS(env, user.id, s); return askPhone(env, chat); }
  if (d === "confirm") return confirmOrder(env, chat, user, s);
  if (d.startsWith("rate:")) { s.rate = +d.slice(5); s.step = "reviewtext"; await setS(env, user.id, s); return send(env, chat, `Спасибо! ${"★".repeat(s.rate)}\nНапишите пару слов о работе — что понравилось, как реклама помогла бизнесу. За отзыв — <b>−15%</b> на следующий заказ.`); }
  return route(env, chat, d, user, q.message.message_id);
}

async function afterStyle(env, chat, user, s) {
  if (SERVICES[s.o.svc]?.design) { s.step = "opt"; await setS(env, user.id, s); return askOptions(env, chat, s.o); }
  s.step = "phone"; await setS(env, user.id, s); return askPhone(env, chat);
}

async function confirmOrder(env, chat, user, s) {
  if (!s.o || !s.o.svc) return route(env, chat, "order", user);
  const admin = await getAdmin(env);
  if (admin) await send(env, admin, summary(s.o, true, user) + "\n\n<i>Ответьте на это сообщение — я перешлю ответ клиенту.</i>", user.username ? kb([[{ text: "Написать клиенту", url: "https://t.me/" + user.username }]]) : undefined);
  s.step = null; s.last = s.o; s.o = null; await setS(env, user.id, s);
  await env.KV.put("orders", String(+(await env.KV.get("orders") || 0) + 1));
  return send(env, chat, `🎉 <b>Заявка отправлена Светлане!</b>\n\nОна ответит в ближайшее время и согласует детали. А пока подготовьте:\n• текст для рекламы: услуги и цены\n• телефон и соцсети\n• логотип и фото, если есть\n\nМожно прислать всё сюда прямо сейчас — я передам.\n\n💳 Предоплата 50% — только после согласования со Светланой (СБП, Сбербанк, ${PHONE}). 🧾 Выдаётся чек самозанятой.`, MAIN_KB);
}

async function onMessage(env, m) {
  const chat = m.chat.id, user = m.from, text = (m.text || m.caption || "").trim();
  if (m.chat.type !== "private") return;
  // администратор
  if (user.username && user.username.toLowerCase() === ADMIN_USERNAME) {
    const cur = await getAdmin(env);
    if (cur !== String(chat)) { await env.KV.put("admin", String(chat)); await send(env, chat, "✅ Вы подключены как администратор. Сюда будут приходить заявки и вопросы клиентов. Чтобы ответить клиенту — ответьте (свайп → «Ответить») на его сообщение.\n\nКоманды: /stats — число заявок, /menu — посмотреть бота глазами клиента."); }
    const r = m.reply_to_message;
    const mid = r && (r.text || r.caption || "").match(/#id(\d+)/);
    if (mid) {
      const to = mid[1];
      if (m.text) await send(env, to, `💬 <b>Светлана:</b>\n${esc(m.text)}`);
      else await tg(env, "copyMessage", { chat_id: to, from_chat_id: chat, message_id: m.message_id });
      return send(env, chat, "✅ Отправлено клиенту.");
    }
    if (text === "/stats") { const n = +(await env.KV.get("orders") || 0), u = +(await env.KV.get("users") || 0); return send(env, chat, `📊 Заявок: ${n}\nПользователей: ${u}`); }
    if (text !== "/menu" && text !== "/start") return send(env, chat, "Чтобы ответить клиенту, ответьте на его сообщение (свайп → «Ответить»). /menu — меню клиента.");
  }
  const s = await getS(env, user.id);
  if (!s.seen) { s.seen = 1; await env.KV.put("users", String(+(await env.KV.get("users") || 0) + 1)); await setS(env, user.id, s); }

  if (text.startsWith("/start") || text === "/menu") { s.step = null; await setS(env, user.id, s); return route(env, chat, "menu", user); }
  if (text === "/price" || text === "/prices") return route(env, chat, "prices", user);
  if (text === "/order") return route(env, chat, "order", user);
  if (text === "/help") return route(env, chat, "faq", user);

  // шаги заказа
  if (s.step === "biz" && text) { s.o.biz = text.slice(0, 120); s.step = "style"; await setS(env, user.id, s); return askStyle(env, chat); }
  if (s.step === "style" && text) { s.o.style = text.slice(0, 300); return afterStyle(env, chat, user, s); }
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
    for (const [re, key] of KW) if (re.test(text)) return route(env, chat, key, user);
    const ok = await forwardToAdmin(env, user, text);
    return send(env, chat, ok ? "Хороший вопрос! Передал его Светлане — она ответит здесь же. А пока можно посмотреть меню 👇" : "Напишите, пожалуйста, Светлане напрямую: @sveta_muzyka", MAIN_KB);
  }
}

export default {
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
