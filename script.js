// --- Data ---
const fortunes = [
  { name: "大吉", lead: "とよのぶを完全に論破できる日。あなたの正論がとよのぶを貫き、最高の気分で一日を過ごせるでしょう。", weight: 35, intensity: 3 },
  { name: "中吉", lead: "とよのぶのボケを華麗にスルーできる運気。冷静な対応が周囲の評価を爆上げします。", weight: 25, intensity: 2 },
  { name: "小吉", lead: "とよのぶの無茶振りを適当にいなせる時。省エネ運転で、自分の時間を大切にしましょう。", weight: 20, intensity: 1 },
  { name: "吉", lead: "とよのぶにちょっとだけ優しくなれる日。たまにはお菓子でもあげると、運気が安定します。", weight: 15, intensity: 1 },
  { name: "末吉", lead: "とよのぶの長話に捕まりそうな予感。隙を見て逃げ出す勇気が、今日の吉凶を分けます。", weight: 5, intensity: 1 }
];

const workItems = ["粘り強さが評価される", "新しいアイデアを書き留めて", "午前中の決断が吉", "復習が最大の武器になる", "短時間の集中を繰り返す"];
const loveItems = ["感謝を言葉にして伝える", "リラックスして会話を楽しむ", "聞き手に回ると発見がある", "懐かしい友に連絡も吉", "自分を磨く時間が魅力に"];
const moneyItems = ["小さな節約が大きな蓄えに", "長く使えるものを選ぶ", "お財布をすっきり整理", "自己投資には惜しみなく", "募金や贈り物が巡り巡る"];
const healthItems = ["ストレッチで体をほぐす", "旬の食材を味わう", "早寝早起きが運気を呼ぶ", "深呼吸で心を落ち着かせる", "水を一口多めに飲む"];
const items = ["新しい筆記具", "干支のストラップ", "懐紙", "お守り", "赤いハンカチ", "お気に入りのお香", "本", "木製の小物"];
const colors = ["朱色（しゅいろ）", "金茶（きんちゃ）", "白萌木（しろもえぎ）", "藍鼠（あいねず）", "生成色（きなりいろ）", "若草色"];
const actions = [
  "とよのぶの背後をそっと通り過ぎる", "とよのぶの冗談に愛想笑いをする", "とよのぶの弱点を一つメモする",
  "とよのぶを全力で褒めちぎってみる", "とよのぶの好物を先に食べる",
  "とよのぶにマウントを取らせてあげる", "とよのぶの視線を華麗に外す",
  "とよのぶのために温かいお茶（熱め）を出す"
];
const horseQuotes = [
  "「とよのぶをやっつけると吉」",
  "「とよのぶ、来年はもっと頑張れ」",
  "「とよのぶの攻略本、絶賛発売中（嘘）」",
  "「とよのぶの居ぬ間に洗濯」",
  "「とよのぶ、たまにはおごれ」"
];

// --- Configuration & State ---
let state = {
  sound: true,
  effects: true,
  bgm: false,
  result: null
};

const LS_KEY = 'omikuji_2026_result';
const SETTINGS_KEY = 'omikuji_2026_settings';

// --- Utils ---
const $ = (id) => document.getElementById(id);
const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getWeightedFortune = () => {
  const total = fortunes.reduce((sum, f) => sum + f.weight, 0);
  let r = Math.random() * total;
  for (const f of fortunes) {
    r -= f.weight;
    if (r <= 0) return f;
  }
  return fortunes[0];
};

// --- Web Audio (High Quality Synthesis) ---
let audioCtx;
const playSound = (type) => {
  if (!state.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const gain = audioCtx.createGain();
    gain.connect(audioCtx.destination);

    if (type === 'roll') {
      const duration = 1.5;
      const bufferSize = audioCtx.sampleRate * duration;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      // Enhanced "ガラガラ" (Rhythmic wooden rattle)
      for (let i = 0; i < bufferSize; i++) {
        const t = i / audioCtx.sampleRate;
        // Rhythmic pulses for "Gara-gara"
        const pulseFrequency = 12 + Math.sin(t * 5) * 2; // Varying pulse speed
        const pulse = Math.sin(t * Math.PI * 2 * pulseFrequency) > 0.7 ? 1 : 0;

        // Characteristic wooden "clack" noise
        const noise = (Math.random() * 2 - 1) * 0.2;
        const resonance = Math.sin(t * 120) * Math.exp(- (t % (1 / pulseFrequency)) * 20) * 0.3;

        data[i] = (noise + resonance) * pulse * (1 - t / duration);
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(gain);
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      source.start();
    } else if (type === 'ding') {
      const t = audioCtx.currentTime;
      // Dramatic "ジャーン！" (Triumphant chime/cymbal mix)
      // Fundamental and rich harmonics
      [440, 880, 1320, 1760.3, 2640, 3520].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        osc.type = i < 2 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, t);
        oscGain.gain.setValueAtTime(i === 0 ? 0.4 : 0.1 / (i + 1), t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 2.5 + i * 0.2);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start(t);
        osc.stop(t + 3);
      });

      // Add a splash of noise for the "shimmer" (Cymbal feel)
      const noiseDuration = 1.5;
      const noiseBufferSize = audioCtx.sampleRate * noiseDuration;
      const noiseBuffer = audioCtx.createBuffer(1, noiseBufferSize, audioCtx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBufferSize; i++) {
        const nt = i / audioCtx.sampleRate;
        noiseData[i] = (Math.random() * 2 - 1) * 0.05 * Math.exp(-nt * 3);
      }
      const noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.3, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + noiseDuration);
      noiseSource.connect(noiseGain);
      noiseGain.connect(gain);
      noiseSource.start(t);
    }
    else if (type === 'rustle') {
      // High-frequency noise for paper
      const duration = 0.4;
      const bufferSize = audioCtx.sampleRate * duration;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.05 * (1 - i / bufferSize);
      }
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(gain);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      source.start();
    }
  } catch (e) { }
};

// --- BGM ---
const bgm = $("bgm");
const updateBGM = () => {
  if (state.bgm) {
    bgm.volume = 0.25;
    bgm.play().catch(e => {
      console.log("BGM pending user interaction");
    });
  } else {
    bgm.pause();
  }
};

// --- Vibration ---
const vibrate = (ms) => {
  if (state.vibration && "vibrate" in navigator) {
    navigator.vibrate(ms);
  }
};

// --- Confetti ---
const canvas = $("canvas");
const ctx = canvas.getContext("2d");
let confetti = [];
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function spawnConfetti(count) {
  if (!state.effects) return;
  const colorsList = ["#b91c1c", "#a16207", "#facc15", "#ffffff"];
  for (let i = 0; i < count; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: -40,
      r: Math.random() * 6 + 4,
      d: Math.random() * 8 + 2,
      color: rnd(colorsList),
      tilt: Math.random() * 10 - 5
    });
  }
}

function updateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confetti.forEach((p, i) => {
    p.y += p.d;
    p.x += Math.sin(p.y / 25) * 1.5;
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    if (p.y > canvas.height + 20) confetti.splice(i, 1);
  });
  requestAnimationFrame(updateConfetti);
}
updateConfetti();

// --- Core Logic ---
const saveResult = (res) => {
  localStorage.setItem(LS_KEY, JSON.stringify({
    ...res,
    date: new Date().toDateString()
  }));
};

const loadResult = () => {
  const saved = localStorage.getItem(LS_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.date === new Date().toDateString()) {
      return parsed;
    }
  }
  return null;
};

const generateResult = () => {
  const f = getWeightedFortune();
  let actionSet = new Set();
  while (actionSet.size < 3) actionSet.add(rnd(actions));

  return {
    fortune: f.name,
    lead: f.lead,
    intensity: f.intensity,
    work: rnd(workItems),
    love: rnd(loveItems),
    money: rnd(moneyItems),
    health: rnd(healthItems),
    item: rnd(items),
    color: rnd(colors),
    actions: Array.from(actionSet),
    quote: rnd(horseQuotes)
  };
};

const renderResult = (res) => {
  $("lotteryView").style.display = "none";
  $("resultView").style.display = "block";

  $("fortuneTitle").textContent = res.fortune;
  $("fortuneLead").textContent = res.lead;
  $("resWork").textContent = res.work;
  $("resLove").textContent = res.love;
  $("resMoney").textContent = res.money;
  $("resHealth").textContent = res.health;
  $("resItem").textContent = res.item;
  $("resColor").textContent = res.color;
  $("horseQuote").textContent = res.quote;

  // Add the "Luck Stamp" to the card
  const card = $("mainCard");
  let stamp = document.querySelector('.luck-stamp');
  if (!stamp) {
    stamp = document.createElement('div');
    stamp.className = 'luck-stamp';
    card.appendChild(stamp);
  }
  stamp.textContent = res.fortune;

  const actionContainer = $("resActions");
  actionContainer.innerHTML = res.actions.map(a => `<div class="action-row">${a}</div>`).join("");

  const now = new Date();
  $("resultDate").textContent = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  if (state.effects) {
    spawnConfetti(res.intensity * 40);
  }
};

const startLottery = () => {
  const box = $("omikujiBox");
  const stick = $("mikuStick");
  const paper = $("paper");
  const btn = $("lotteryBtn");

  const result = generateResult();
  state.result = result;
  stick.setAttribute('data-fortune', result.fortune);
  $("paperInsignia").textContent = result.fortune;

  btn.disabled = true;
  box.classList.add("shaking");
  playSound("roll");
  vibrate([80, 40, 80, 40, 80]);

  setTimeout(() => {
    box.classList.remove("shaking");
    stick.classList.add("emerge");
    playSound("ding");
    vibrate(150);

    setTimeout(() => {
      stick.classList.remove("emerge");
      paper.classList.add("emerge");
      playSound("rustle");

      setTimeout(() => {
        saveResult(result);
        renderResult(result);
        btn.disabled = false;
      }, 700);
    }, 1200);
  }, 1500);
};

const share = async () => {
  const res = state.result;
  if (!res) return;
  const text = `🐴 2026年午年おみくじ【${res.fortune}】\n${res.lead}\nラッキーカラー：${res.color}\n開運アクション：${res.actions[0]} 他\n#おみくじ #2026年 #午年`;
  const url = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({ title: "午年おみくじ 2026", text, url });
    } catch (err) { }
  } else {
    try {
      await navigator.clipboard.writeText(text + "\n" + url);
      alert("結果をコピーしました！LINEやSNSに貼り付けてね 🐴");
    } catch (err) {
      alert("コピーに失敗しました。");
    }
  }
};

// --- Events ---
$("lotteryBtn").addEventListener("click", startLottery);
$("shareBtn").addEventListener("click", share);

$("resetBtn").addEventListener("click", () => {
  localStorage.removeItem(LS_KEY);
  playSound("ding");
  $("resultView").style.display = "none";
  $("lotteryView").style.display = "flex";
  $("paper").classList.remove("emerge");
});

const handleToggle = (id, field) => {
  $(id).addEventListener("click", (e) => {
    state[field] = !state[field];
    e.target.classList.toggle("active");
    if (field === 'vibration') vibrate(50);
    saveSettings();
  });
};
handleToggle("soundToggle", "sound");
handleToggle("effectToggle", "effects");

// BGM specific toggle
$("bgmToggle").addEventListener("click", (e) => {
  state.bgm = !state.bgm;
  e.target.classList.toggle("active");
  updateBGM();
  saveSettings();
});

const saveSettings = () => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    sound: state.sound,
    effects: state.effects,
    bgm: state.bgm
  }));
};

const loadSettings = () => {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    state.sound = parsed.sound ?? true;
    state.effects = parsed.effects ?? true;
    state.bgm = parsed.bgm ?? false;

    // Update UI
    if (!state.sound) $("soundToggle").classList.remove("active");
    if (!state.effects) $("effectToggle").classList.remove("active");
    if (state.bgm) $("bgmToggle").classList.add("active");
  }
};

// Parallax Effect
window.addEventListener('mousemove', (e) => {
  if (!state.effects) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  document.querySelector('.pattern-bg').style.transform = `translate(${x}px, ${y}px)`;
});

window.onload = () => {
  loadSettings();
  updateBGM();
  const saved = loadResult();
  if (saved) {
    state.result = saved;
    renderResult(saved);
  }
};
