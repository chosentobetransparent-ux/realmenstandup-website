/* =========================================================
   STANDING ORDERS — DAILY CHARGE
   Will The Real Men Please Stand Up
   ---------------------------------------------------------
   HOW IT WORKS
   - Each entry below has a date (YYYY-MM-DD).
   - Every visitor sees the charge for TODAY (Houston time).
   - If today has no entry, the most recent past charge stays up,
     so the section never goes blank.
   - To add new charges: copy an entry, change the date and words,
     commit to GitHub. That's it.
   ========================================================= */

const CHARGES = [
  {
    date: "2026-09-30",
    title: "Stay On Your Wall",
    verse: "And I sent messengers unto them, saying, I am doing a great work, so that I cannot come down: why should the work cease, whilst I leave it, and come down to you?",
    ref: "Nehemiah 6:3",
    body: "Sanballat sent for Nehemiah four times, and four times the answer was the same: I cannot come down. Something has been sending for you too. It doesn't deserve a meeting.",
    action: "Today's action: name the one thing that keeps calling you down off your wall, and tell a brother about it before sundown."
  },
  {
    date: "2026-10-01",
    title: "Pack For The Mountain",
    verse: "The God of heaven, he will prosper us; therefore we his servants will arise and build.",
    ref: "Nehemiah 2:20",
    body: "Tomorrow we head to the lake. Don't just pack a bag, pack an expectation. A man who comes ready to build leaves with something built.",
    action: "Today's action: write down one thing you are asking God to rebuild in you this weekend."
  },
  {
    date: "2026-10-02",
    title: "Tools In One Hand",
    verse: "They which builded on the wall, and they that bare burdens, with those that laded, every one with one of his hands wrought in the work, and with the other hand held a weapon.",
    ref: "Nehemiah 4:17",
    body: "Nehemiah's men never set down the work to fight, and never set down the fight to work. Retreat doesn't mean retreating from the battle. It means sharpening for it.",
    action: "Today's action: leave the phone in the bag for one full session and give God your whole attention."
  },
  {
    date: "2026-10-03",
    title: "Fight For Your House",
    verse: "Be not ye afraid of them: remember the Lord, which is great and terrible, and fight for your brethren, your sons, and your daughters, your wives, and your houses.",
    ref: "Nehemiah 4:14",
    body: "Nehemiah didn't tell the men to fight for a wall. He told them to fight for the people behind it. Your family is the reason you stand.",
    action: "Today's action: call or text someone in your house and tell them specifically what you're fighting for."
  },
  {
    date: "2026-10-04",
    title: "Strengthen My Hands",
    verse: "For they all made us afraid, saying, Their hands shall be weakened from the work, that it be not done. Now therefore, O God, strengthen my hands.",
    ref: "Nehemiah 6:9",
    body: "The enemy's plan was weak hands. Nehemiah's answer was a one-line prayer. You're going home today. Ask God for the grip to hold what He gave you on the mountain.",
    action: "Today's action: pray Nehemiah's prayer out loud before you pull out of the parking lot."
  },
  {
    date: "2026-10-05",
    title: "Should A Man Like Me Flee?",
    verse: "And I said, Should such a man as I flee? and who is there, that, being as I am, would go into the temple to save his life? I will not go in.",
    ref: "Nehemiah 6:11",
    body: "Monday will test what the weekend built. Old pressure will offer you an easy hiding place. You know who you are now. Men like you don't run.",
    action: "Today's action: face the one conversation or task you've been hiding from. Do it before noon."
  },
  {
    date: "2026-10-06",
    title: "Finish The Wall",
    verse: "So the wall was finished in the twenty and fifth day of the month Elul, in fifty and two days.",
    ref: "Nehemiah 6:15",
    body: "Fifty-two days of focus, discernment, prayer, and courage, and the wall was finished. Tonight on Zoom we bring back what we started. Come ready to report.",
    action: "Today's action: join the Tuesday call and share one thing God finished in you since the retreat."
  }
];

(function renderTodaysCharge() {
  // Today's date in Houston, formatted YYYY-MM-DD
  const tz = "America/Chicago";
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());

  // Today's charge, or the most recent past one
  const sorted = [...CHARGES].sort((a, b) => a.date.localeCompare(b.date));
  const past = sorted.filter(c => c.date <= today);
  const charge = past.length ? past[past.length - 1] : sorted[0];
  if (!charge) return;

  // "WEDNESDAY, SEPTEMBER 30, 2026"
  const [y, m, d] = charge.date.split("-").map(Number);
  const pretty = new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("en-US", {
    timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric"
  }).toUpperCase();

  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  set("charge-label", "TODAY'S CHARGE · " + pretty);
  set("charge-title", charge.title);
  set("charge-verse", "\u201C" + charge.verse + "\u201D");
  set("charge-ref", charge.ref);
  set("charge-body", charge.body);
  set("charge-action", charge.action);
})();
