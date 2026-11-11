// Posts Today's Charge (from charges.js) to the men's Telegram group.
// Uses the exact same rotation as the website, so the post always matches
// willtherealmenpleasestandup.com/orders.html for that day (Houston time).
//
// MODE (env):
//   schedule  -> daily run; posts only from the cron line that matches
//                Houston's current clock (CDT vs CST), so it posts once a day.
//   dispatch  -> "Run workflow" button; posts right now.
//   setup     -> runs when this automation is first pushed; posts only if
//                the group hasn't been found yet (first-time test post).

import fs from "node:fs";
import vm from "node:vm";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MODE = process.env.MODE || "dispatch";
const CRON = process.env.CRON || "";
const CHAT_FILE = ".github/telegram-chat.json";
const SITE = "https://www.willtherealmenpleasestandup.com/orders.html";
const TZ = "America/Chicago";

// cron line -> the Houston UTC offset it is meant for
const CRON_FOR_OFFSET = { "50 10 * * *": -5, "50 11 * * *": -6 };

if (!TOKEN) fail("TELEGRAM_BOT_TOKEN secret is missing.");

const api = async (method, body) => {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  return r.json();
};

function fail(msg) { console.error("ERROR: " + msg); process.exit(1); }

function houstonOffset() {
  const part = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "shortOffset" })
    .formatToParts(new Date()).find(p => p.type === "timeZoneName").value; // "GMT-5"
  return Number(part.replace("GMT", "")) || 0;
}

// ---- 1. Should this run post? ----
const hadChat = fs.existsSync(CHAT_FILE);
if (MODE === "schedule") {
  const want = CRON_FOR_OFFSET[CRON];
  if (want !== houstonOffset()) {
    console.log(`Skip: cron "${CRON}" is for UTC${want}, Houston is UTC${houstonOffset()} today.`);
    process.exit(0);
  }
}
if (MODE === "setup" && hadChat) {
  console.log("Already set up; push runs don't post. Daily schedule is active.");
  process.exit(0);
}

// ---- 2. Find the group ----
let chat = hadChat ? JSON.parse(fs.readFileSync(CHAT_FILE, "utf8")) : null;
if (!chat) {
  const res = await api("getUpdates", { allowed_updates: ["message", "my_chat_member"] });
  if (!res.ok) fail("Telegram rejected the token: " + res.description);
  const groups = new Map();
  for (const u of res.result) {
    const c = (u.my_chat_member || u.message || {}).chat;
    if (c && (c.type === "group" || c.type === "supergroup")) {
      const left = u.my_chat_member && ["left", "kicked"].includes(u.my_chat_member.new_chat_member.status);
      if (left) groups.delete(c.id); else groups.set(c.id, c.title);
    }
  }
  if (groups.size === 0) {
    fail("The bot hasn't been added to a group yet (or it was more than 24 hours ago). " +
         "Add @RealMenOrdersBot to the men's group, send any message in the group, then click Run workflow again.");
  }
  if (groups.size > 1) console.log("Bot is in several groups; using the most recent:", [...groups.values()]);
  const [id, title] = [...groups.entries()].pop();
  chat = { id, title };
  fs.writeFileSync(CHAT_FILE, JSON.stringify(chat, null, 2) + "\n");
  console.log(`Found group "${title}" (${id}) and saved it.`);
}

// ---- 3. Today's charge, same math as charges.js ----
const ctx = { document: { getElementById: () => null }, Intl, Date, Math };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync("charges.js", "utf8") +
  "\n;globalThis.__c = { BANK, SPECIAL, ROTATION_START };", ctx);
const { BANK, SPECIAL, ROTATION_START } = ctx.__c;

const today = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const dayNum = s => { const [y, m, d] = s.split("-").map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86400000); };
const n = BANK.length;
const charge = SPECIAL.find(c => c.date === today) || BANK[(((dayNum(today) - dayNum(ROTATION_START)) % n) + n) % n];
const [y, m, d] = today.split("-").map(Number);
const pretty = new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("en-US",
  { timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric" });

// ---- 4. Post ----
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const text =
`🎖 <b>TODAY'S CHARGE</b> · ${esc(pretty)}

<b>${esc(charge.title.toUpperCase())}</b>

<i>“${esc(charge.verse)}”</i>
— <b>${esc(charge.ref)}</b>

${esc(charge.body)}

✅ <b>${esc(charge.action)}</b>

<a href="${SITE}">Stand up, men. Read it on the site →</a>
#WillTheRealMenPleaseStandUp`;

const send = id => api("sendMessage", { chat_id: id, text, parse_mode: "HTML", disable_web_page_preview: true });
let res = await send(chat.id);
if (!res.ok && res.parameters && res.parameters.migrate_to_chat_id) {
  // group was upgraded to a supergroup; Telegram gives the new ID
  chat.id = res.parameters.migrate_to_chat_id;
  fs.writeFileSync(CHAT_FILE, JSON.stringify(chat, null, 2) + "\n");
  res = await send(chat.id);
}
if (!res.ok) fail("Couldn't post: " + res.description + " (Is the bot an admin with permission to post?)");
console.log(`Posted "${charge.title}" to ${chat.title}.`);
