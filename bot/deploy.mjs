// Выкладка бота на Cloudflare Workers (запускается в GitHub Actions)
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const CF = process.env.CLOUDFLARE_API_TOKEN, BOT = process.env.BOT_TOKEN;
if (!CF || !BOT) { console.error("❌ Нет секретов CLOUDFLARE_API_TOKEN или BOT_TOKEN в настройках репозитория"); process.exit(1); }
const api = async (path, opts = {}) => { const r = await fetch("https://api.cloudflare.com/client/v4" + path, { ...opts, headers: { Authorization: "Bearer " + CF, "content-type": "application/json" } }); return r.json(); };
const accs = await api("/accounts");
if (!accs.success || !accs.result.length) { console.error("❌ Cloudflare токен не подошёл:", JSON.stringify(accs.errors)); process.exit(1); }
const acc = accs.result[0].id; process.env.CLOUDFLARE_ACCOUNT_ID = acc;
// поддомен workers.dev
let sub = await api(`/accounts/${acc}/workers/subdomain`);
if (!sub.success || !sub.result?.subdomain) {
  const name = "visuall-" + createHash("sha1").update(acc).digest("hex").slice(0, 6);
  sub = await api(`/accounts/${acc}/workers/subdomain`, { method: "PUT", body: JSON.stringify({ subdomain: name }) });
  console.log("поддомен:", JSON.stringify(sub.result || sub.errors));
}
const subdomain = sub.result.subdomain;
// KV
let ns = (await api(`/accounts/${acc}/storage/kv/namespaces?per_page=100`)).result.find((n) => n.title === "visuall-bot-kv");
if (!ns) ns = (await api(`/accounts/${acc}/storage/kv/namespaces`, { method: "POST", body: JSON.stringify({ title: "visuall-bot-kv" }) })).result;
writeFileSync("wrangler.toml", readFileSync("wrangler.base.toml", "utf8") + `\n[[kv_namespaces]]\nbinding = "KV"\nid = "${ns.id}"\n`);
const sh = (c, input) => execSync(c, { stdio: input ? ["pipe", "inherit", "inherit"] : "inherit", input, env: process.env });
sh("npx --yes wrangler@4 deploy");
const secret = createHash("sha256").update("visuall:" + BOT).digest("hex").slice(0, 40);
sh("npx --yes wrangler@4 secret put BOT_TOKEN", BOT);
sh("npx --yes wrangler@4 secret put WEBHOOK_SECRET", secret);
const url = `https://visuall-bot.${subdomain}.workers.dev/`;
const tg = async (m, b) => { const r = await (await fetch(`https://api.telegram.org/bot${BOT}/${m}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) })).json(); console.log(m, r.ok ? "ok" : JSON.stringify(r)); return r; };
await new Promise((r) => setTimeout(r, 5000));
await tg("setWebhook", { url, secret_token: secret, allowed_updates: ["message", "callback_query"], drop_pending_updates: false });
await tg("setMyCommands", { commands: [
  { command: "start", description: "Главное меню" }, { command: "order", description: "Оформить заказ" },
  { command: "price", description: "Цены" }, { command: "help", description: "Частые вопросы" } ] });
await tg("setMyShortDescription", { short_description: "Реклама для бизнеса от 990 ₽: постеры, визитки, видео, сайты. Промокод VISUALL10 — −10%." });
await tg("setMyDescription", { description: "Привет! Я бот VISUALL — помощник Светланы Музыки.\n\nПокажу цены и сроки, посчитаю заказ со скидкой и оформлю заявку за минуту. Светлана ответит здесь же.\n\nНажмите «Старт» 👇" });
const me = await tg("getMe", {});
console.log(`\n✅ Бот работает: https://t.me/${me.result?.username}  (worker: ${url})`);
