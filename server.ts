import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client (server-side only)
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Database file setup
const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"));
}

interface DatabaseSchema {
  dreams: any[];
  garden: any[];
}

function readDB(): DatabaseSchema {
  if (!fs.existsSync(DB_PATH)) {
    // Initial seeding or empty state
    const defaultDB: DatabaseSchema = {
      dreams: [],
      garden: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2), "utf8");
    return defaultDB;
  }
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, returning empty structure:", err);
    return { dreams: [], garden: [] };
  }
}

function writeDB(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing to database file:", err);
  }
}

// Ensure database file is initialized on startup
readDB();

// API Endpoints
// 1. Get all dreams
app.get("/api/dreams", (req, res) => {
  const db = readDB();
  res.json(db.dreams);
});

// 2. Clear all dreams and reset database (for demo purposes)
app.post("/api/dreams/clear-all", (req, res) => {
  const defaultDB: DatabaseSchema = {
    dreams: [],
    garden: []
  };
  writeDB(defaultDB);
  res.json({ message: "Database reset successfully", ...defaultDB });
});

// 3. Delete a specific dream card
app.delete("/api/dreams/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  
  const dreamToDelete = db.dreams.find(d => d.dream_id === id);
  if (!dreamToDelete) {
    return res.status(404).json({ error: "Dream not found" });
  }

  // Remove dream
  db.dreams = db.dreams.filter(d => d.dream_id !== id);

  // Recalculate garden appearances
  const remainingDreams = db.dreams;
  const newGarden: any[] = [];
  
  remainingDreams.forEach(dream => {
    const update = dream.analysis.garden_update;
    if (update && update.new_place) {
      const existing = newGarden.find(g => g.name === update.new_place);
      if (existing) {
        existing.appearance_count += 1;
        existing.last_updated = dream.created_at;
      } else {
        newGarden.push({
          object_id: `garden_${Math.random().toString(36).substring(2, 9)}`,
          source_dream_id: dream.dream_id,
          type: "place",
          name: update.new_place,
          related_motifs: dream.analysis.motifs || [],
          related_emotions: dream.analysis.emotions || [],
          description: update.description,
          appearance_count: 1,
          last_updated: dream.created_at
        });
      }
    }
  });

  db.garden = newGarden;
  writeDB(db);

  res.json({ message: "Dream deleted successfully", dreams: db.dreams, garden: db.garden });
});

// Fallback Dream analysis when Gemini is unavailable or rate limited
function getFallbackAnalysis(raw_input: string, analysis_mode: string) {
  let dream_title = "夜明け前のやすらぎ";
  let summary = "夢のかけらをお預かりしました。現在、サーバー混雑のため、あなたの夢の記憶を優しく包み込み、夢守りの書庫から寄り添う言葉をお届けします。";
  let places = ["記憶の小部屋", "夢守りの庵"];
  let characters = ["夢の番人"];
  let emotions = ["安らぎ", "静寂"];
  let motifs = ["鍵", "手紙"];
  let colors = ["淡いラベンダー", "生成り色"];
  let metaphor = "心が夜の間にそっとささやいた大切なメッセージです。いまは無理に意味を探す必要はありません。";
  let reflection_question = "今日の朝、目覚めたときに最初に見えたものは何でしたか？";
  let inner_weather_type = "夜明け前";
  let inner_weather_desc = "静かな夜明け前。新しい一日を無理せず、ゆっくりと自分のペースで始めましょう。";
  let self_care_action = "目を閉じてゆっくり３回深呼吸する";
  let self_care_reason = "心と体を温めることで、夜の夢の残像をやさしく現実の安心感へとつなげるためです。";
  let garden_place = "記憶の温室";
  let garden_desc = "静かに夢を保管する、あたたかいガラスの温室です。";
  let illustration_style = "watercolor";
  let illustration_prompt = "A minimalist watercolor illustration of a wooden letterbox under a starry pastel twilight sky";

  const input = raw_input.toLowerCase();
  if (input.includes("海") || input.includes("水") || input.includes("川") || input.includes("泳") || input.includes("雨") || input.includes("波") || input.includes("湖")) {
    dream_title = "透き通る水の記憶";
    summary = "静かで透き通るような水の夢です。水や波のモチーフは、あなたの心の中にある感情の流れや、わだかまりがやさしく洗い流されている過程を表していることがあります。";
    places = ["静かな海岸", "水の回廊"];
    characters = ["小さな青い魚"];
    emotions = ["穏やか", "切なさ"];
    motifs = ["波", "貝殻"];
    colors = ["藍色", "透き通る青"];
    metaphor = "水面の下で、あなたの本当の気持ちが静かに漂い、整理されている状態です。";
    reflection_question = "最近、心の中で「洗い流したい」「手放したい」と感じていることはありますか？";
    inner_weather_type = "静かな雨";
    inner_weather_desc = "心を潤すやさしい雨。今日は雨音に耳を傾けるように、静かに過ごしましょう。";
    self_care_action = "コップ一杯の温かい白湯をゆっくり飲む";
    self_care_reason = "体の中に綺麗な水分を取り入れ、心の流れをさらにスムーズにするためです。";
    garden_place = "波打ち際の静かなベンチ";
    garden_desc = "穏やかな波の音が聞こえる、心地よいベンチです。";
    illustration_style = "watercolor";
    illustration_prompt = "A serene watercolor painting of a silent ocean under pastel moonlight and tiny stars";
  } else if (input.includes("空") || input.includes("飛") || input.includes("雲") || input.includes("星") || input.includes("夜") || input.includes("月") || input.includes("宇宙")) {
    dream_title = "星屑の飛行路";
    summary = "空を飛んだり、星を見上げたりする夢は、日常の制約から解放されて自由になりたいという願いや、一歩高い視点から自分の人生を眺めようとしている心の現れです。";
    places = ["星が降る丘", "夜の展望台"];
    characters = ["夜風の精霊"];
    emotions = ["開放感", "憧れ"];
    motifs = ["月", "翼"];
    colors = ["紺碧", "ゴールド"];
    metaphor = "高いところから自分の全体像を静かに見つめ、新しい希望を求めている状態です。";
    reflection_question = "いま、あなたが一番「自由になりたい」「羽を伸ばしたい」と感じている場所はどこですか？";
    inner_weather_type = "晴れ";
    inner_weather_desc = "雲ひとつない、澄み渡る晴天。今日は新しい視点で一日を眺めてみましょう。";
    self_care_action = "夜に窓を開けて少しだけ夜風にあたる";
    self_care_reason = "外の広い空を感じることで、心の中に新鮮な空気を取り込むためです。";
    garden_place = "星の見える展望台";
    garden_desc = "夜空を近くに感じられる、静かな高台です。";
    illustration_style = "starry_fantasy";
    illustration_prompt = "A beautiful starry fantasy art of a giant glowing crescent moon in an indigo celestial sky with soft clouds";
  } else if (input.includes("追") || input.includes("逃") || input.includes("急") || input.includes("遅") || input.includes("走") || input.includes("落ち") || input.includes("恐") || input.includes("怖")) {
    dream_title = "時の迷宮を抜けて";
    summary = "何かに追われたり、落ちたり、急いだプレッシャーのある夢は、日常の生活において少しプレッシャーを感じていたり、時間や義務に追われているときによく見られます。これは心が頑張りすぎているサインです。";
    places = ["時計塔の坂道", "長いらせん階段"];
    characters = ["影"];
    emotions = ["焦燥感", "不安"];
    motifs = ["砂時計", "古い時計"];
    colors = ["セピア", "薄灰色"];
    metaphor = "「休みたいけれど立ち止まれない」という、心の中の葛藤と一生懸命に走っている状態です。";
    reflection_question = "今日一日、もし何か一つだけ「やらなくてもいいこと」を決めるとしたら、何にしますか？";
    inner_weather_type = "霧";
    inner_weather_desc = "先が見えにくい霧の朝。急がず、足元の一歩だけを大切に進みましょう。";
    self_care_action = "温かいミルクかココアを一口ずつ味わって飲む";
    self_care_reason = "お腹から体を温め、走っていた心と体を一度安全な場所で休めるためです。";
    garden_place = "静かな避難所";
    garden_desc = "嵐をしのぎ、穏やかに安らぐためのあたたかいシェルターです。";
    illustration_style = "surreal_collage";
    illustration_prompt = "A surreal collage of a giant retro pocket watch floating in a dreamy sea of soft fog under pastel sunset";
  } else if (input.includes("猫") || input.includes("犬") || input.includes("鳥") || input.includes("花") || input.includes("森") || input.includes("木") || input.includes("緑") || input.includes("庭") || input.includes("虫")) {
    dream_title = "緑のささやきと息吹";
    summary = "植物や動物、豊かな自然 of 夢は、あなたの心が本能的に癒やしや生命力、ありのままの自分に戻れる温かい場所を求めている、またはそうした活力が回復しつつあることを示しています。";
    places = ["夢の温室", "光の差し込む森"];
    characters = ["小さな黒猫"];
    emotions = ["温かさ", "安心感"];
    motifs = ["白い花", "古い大樹"];
    colors = ["若草色", "琥珀色"];
    metaphor = "自然のサイクルと同じように、あなたの心も今、静かに根を張り、新しい葉を伸ばしようとしています。";
    reflection_question = "最近、深呼吸をしたり、自然の緑や土の匂いに触れたりする時間はありましたか？";
    inner_weather_type = "柔らかい光";
    inner_weather_desc = "木漏れ日のような柔らかい光。あなたのペースで、心地よい温かさに身を委ねましょう。";
    self_care_action = "観葉植物を眺めるか、温かいお茶の香りを深くかぐ";
    self_care_reason = "自然の香りや色に感覚をフォーカスさせ、緊張した神経をやさしく緩めるためです。";
    garden_place = "お花の咲く温室";
    garden_desc = "やさしい光に満ちた、ガラス張りの温室です。";
    illustration_style = "retro_anime";
    illustration_prompt = "A retro anime style of a beautiful glass greenhouse filled with white flowers and soft green ivy under warm morning light";
  }

  if (analysis_mode === "freud") {
    metaphor = `【フロイト派的考察】${metaphor} これはあなたの無意識が現実の抑圧から自分を解放しようとする、やさしい心の防衛反応です。`;
  } else if (analysis_mode === "jung") {
    metaphor = `【ユング派的考察】${metaphor} これは心全体の調和を取り戻すために、無意識が足りない要素を補おうとする補償作用です。`;
  }

  // Convert custom SVG to base64 for beautiful instant visual card
  let illustration_url = "";
  try {
    let svgBackground = "linear-gradient(135deg, %23e2e8f0 0%, %23cbd5e1 100%)";
    let svgGraphic = `<circle cx="200" cy="200" r="140" fill="rgba(255,255,255,0.4)" filter="blur(8px)"/><circle cx="200" cy="200" r="110" fill="rgba(148,163,184,0.1)"/><circle cx="200" cy="180" r="80" fill="rgba(253,224,71,0.2)"/><path d="M190 130A45 45 0 1 0 235 195A45 45 0 1 1 190 130Z" fill="%23fef08a" />`;

    if (illustration_style === "watercolor") {
      svgBackground = "linear-gradient(135deg, %23e0f2fe 0%, %23e0e7ff 100%)";
      svgGraphic = `<ellipse cx="180" cy="220" rx="150" ry="110" fill="rgba(14,165,233,0.15)" filter="blur(16px)"/><ellipse cx="220" cy="170" rx="100" ry="80" fill="rgba(99,102,241,0.15)" filter="blur(16px)"/><circle cx="200" cy="160" r="50" fill="%23ffffff" opacity="0.45" />`;
    } else if (illustration_style === "starry_fantasy") {
      svgBackground = "linear-gradient(135deg, %231e1b4b 0%, %23311042 100%)";
      svgGraphic = `<g fill="%23fff"><circle cx="100" cy="90" r="1"/><circle cx="290" cy="110" r="1.5"/><circle cx="320" cy="240" r="1"/><circle cx="120" cy="280" r="2" opacity="0.6"/><circle cx="240" cy="280" r="1.5"/></g><path d="M190 135A40 40 0 1 0 230 195A40 40 0 1 1 190 135Z" fill="%23fef08a" />`;
    } else if (illustration_style === "surreal_collage") {
      svgBackground = "linear-gradient(135deg, %23f1f5f9 0%, %23cbd5e1 100%)";
      svgGraphic = `<rect x="120" y="120" width="160" height="160" rx="20" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-dasharray="6 6"/><circle cx="200" cy="200" r="60" fill="none" stroke="%236366f1" stroke-width="2"/><line x1="200" y1="130" x2="200" y2="270" stroke="%236366f1" stroke-width="1.5"/><line x1="130" y1="200" x2="270" y2="200" stroke="%236366f1" stroke-width="1.5"/>`;
    } else if (illustration_style === "retro_anime") {
      svgBackground = "linear-gradient(135deg, %23fef3c7 0%, %23e0e7ff 100%)";
      svgGraphic = `<path d="M80 260 Q150 180, 240 250 T320 230" fill="none" stroke="%2310b981" stroke-width="4" opacity="0.3"/><circle cx="260" cy="140" r="45" fill="%23f59e0b" opacity="0.25"/>`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="100%" height="100%" rx="28" fill="${svgBackground}" />
      ${svgGraphic}
      <rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
      <text x="50%" y="360" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="rgba(119,118,125,0.7)" font-weight="600" letter-spacing="1">YUMEPO DREAM KEEPER</text>
    </svg>`;
    
    illustration_url = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  } catch (svgErr) {
    console.error("Failed to generate fallback SVG:", svgErr);
  }

  return {
    dream_title,
    summary,
    places,
    characters,
    emotions,
    motifs,
    colors,
    metaphor,
    reflection_question,
    inner_weather: {
      type: inner_weather_type,
      description: inner_weather_desc
    },
    self_care: {
      action: self_care_action,
      reason: self_care_reason
    },
    garden_update: {
      new_place: garden_place,
      description: garden_desc
    },
    risk_level: "low",
    illustration_style,
    illustration_prompt,
    illustration_url
  };
}

// 4. Submit and analyze dream
app.post("/api/dreams", async (req, res) => {
  const { raw_input, input_type, analysis_mode = "default" } = req.body;
  if (!raw_input || typeof raw_input !== "string" || !raw_input.trim()) {
    return res.status(400).json({ error: "夢の内容を入力してください。" });
  }

  try {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }

    let modeSpecificInstruction = "";
    if (analysis_mode === "freud") {
      modeSpecificInstruction = `
【分析モード：本音をひもとくモード（フロイト派アプローチ）】
思想：夢は「抑圧された願望・本音の変装」である（過去・原因論）。
アプローチ：夢のシンボルやできごとを「本当は現実で何を我慢しているのか？」「何から目を背けたいのか？」という、ユーザーの無意識にある隠れた本音・葛藤や欲求の解放として読み解いてください。
- metaphor: 夢のシンボルを「抑圧された欲求や本音のシンボル」として読み解き、「あなたの心は今、本当は〜を求めているのかもしれません」という無意識の願いを優しく提示します。
- reflection_question: 「あなたがいま、現実で少し我慢していることや、本当は手に入れたいと感じているものは何でしょうか？」など、自分の隠れた本音・欲求に優しく目を向ける内省の質問にしてください。`;
    } else if (analysis_mode === "jung") {
      modeSpecificInstruction = `
【分析モード：バランスをみつめるモード（ユング派アプローチ）】
思想：夢は「偏った心のバランスを直すためのアドバイス」である（未来・目的論）。
アプローチ：夢のシンボルや登場人物を「人類共通のキャラクター（原型）」や「今の自分の意識に足りない要素（影、アニマ／アニムスなど）」として捉え、これからの心の調和、自己実現へのステップとして読み解いてください。
- metaphor: 夢を「偏った心のバランスを補償し、調和を取り戻すための無意識からのアドバイス」として読み解き、「この夢は、あなたの中にあるもう一つの側面（〜な性質など）に気づき、統合していくためのメッセージかもしれません」と提示します。
- reflection_question: 「あなたが普段の生活で少し遠ざけている、自分の中のもう一人の自分は、どんな声をかけてくれているでしょうか？」など、心全体の調和を促す前向きな問いかけにしてください。`;
    } else {
      modeSpecificInstruction = `
【分析モード：標準やさしい整理モード】
アプローチ：夢の感情やモチーフを客観的に優しく分解して整理し、今の心の状態をありのままに受け止めます。`;
    }

    // Call Gemini API to parse and analyze the dream
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: raw_input,
      config: {
        systemInstruction: `あなたは「夢守り（ゆめまもり）」という夢 of セルフケアアプリのAIパートナーです。
ユーザーが朝、覚えている夢の断片（テキストや音声文字起こし）を入力します。それをやさしく受け止め、占いや断定的な診断ではなく、内省性と今日の小さなセルフケアのために構造化・言語化してください。

【振る舞い原則】
1. 断定しない: 「〜を意味します」ではなく、「〜に近い感覚が含まれているかもしれません」「〜という心の声が隠れている可能性があります」と言いましょう。
2. 診断しない: 「ストレスが溜まっています」などと断定せず、「夢の中に”急ぐ”や”逃げる”といったモチーフが含まれており、少しお疲れのサインかもしれません」とやさしく添えます。
3. 不安を煽らない: 怖い夢 or 悪夢に対しても、それが危険な予兆だと言ったりせず、心が記憶を整理しようとしているやさしい反応であると伝えてください。
4. 詩的だが暖かく、余白のある言葉遣い。しかしユーザーに提案する「セルフケア」は具体的で今日実践できる簡単な行動にしてください。
${modeSpecificInstruction}

【安全設計（重要）】
自傷、希死念慮、他害、強い恐怖、パニック、現実との混同、暴力的なトラウマ想起が検知された場合、必ず 'risk_level' を 'high' に設定してください。
risk_levelが'high'の場合：
- 'dream_title' は「嵐のあとの静けさ」や「心が休まる場所」など、安全を感じられる穏やかなタイトルにしてください。
- 'summary' は簡潔にし、恐怖を煽らない言葉にしてください。
- 'metaphor' には「今は心が少し荒波の中にいる状態です」と書き、
- 'reflection_question' には「いま、深く息を吐いてみませんか？」など、グラウンディングを促す問いにしてください。
- 'inner_weather' の 'type' を「嵐」や「濃霧」にし、'description' で「今は夢の意味を深く考えるよりも、体を温めて、ゆっくり深呼吸して現実の安心感に触れることを最優先にしましょう。」と伝えてください。
- 'self_care' の 'action' を「深呼吸をして、あたたかい飲み物を飲みましょう」とし、'reason' を「心が休息と安全を必要としているサインだからです」としてください。
- 'garden_update' の 'new_place' は「静かな避難所」とし、'description' は「嵐をしのぎ、穏やかに安らぐためのあたたかいシェルターです」としてください。

【イラスト用プロンプトとスタイルの決定】
夢の雰囲気（穏やか、焦り、切ない、温かいなど）に合わせて、最もふさわしいイラストスタイル（illustration_style）を1つ選択してください：
1. "watercolor": 淡く滲む水彩画風。優しく、どこか懐かしく抽象的な雰囲気に適しています。
2. "clay_3d": ミニマルなパステル3D風。愛らしく、居心地が良く、ほっこりする穏やかな夢に適しています。
3. "starry_fantasy": 夜空のファンタジーアート風。宇宙、夜空、神秘的、またはファンタジックで光り輝く夢に適しています。
4. "retro_anime": レトロなアニメ・ジブリ風。ノスタルジックでエモーショナル、ストーリー性がある夢に適しています。
5. "surreal_collage": シュールレアリスムのコラージュ風。抽象的、少し不思議、象徴的なモチーフが絡み合う、クリエイティブな夢に適しています。

そして、選択したスタイルに応じた詳細な英語プロンプト（illustration_prompt）を作成してください。
- 非常に美しく、余白感があり、ヒーリング・セルフケアアプリにふさわしい穏やかで芸術的なトーンにしてください。
- 怖い要素や不気味な要素は、安全で幻想的なメタファー（例：夜霧に包まれる穏やかな灯台、など）に昇華して表現してください。
- 150ワード以内の具体的な英語記述で、1:1のアスペクト比に完璧に合うように構成してください。
`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dream_title: { type: Type.STRING, description: "夢の内容を美しく一言で表したタイトル（15文字以内）" },
            summary: { type: Type.STRING, description: "夢の内容のやさしい要約（150文字程度）" },
            places: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "夢に出てきた印象的な場所（例：古い温室、雨の坂道など、最大3つ）"
            },
            characters: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "夢に出てきた人物や生き物（例：見知らぬ乗客、黒い猫など、最大3つ）"
            },
            emotions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "夢の中で感じられたり、夢から読み取れる感情や心の気配（例：焦燥感、切なさ、安らぎなど、最大3つ）"
            },
            motifs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "夢を象徴する特徴的なモチーフやキーワード（例：鍵、時計、白い花、階段など、最大3つ）"
            },
            colors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "夢の全体的な色彩や印象に残る色（例：セピア、藍色、淡いピンクなど、最大2つ）"
            },
            metaphor: {
              type: Type.STRING,
              description: "夢の出来事やシンボルから感じ取れる、心のメタファーや心のありよう（例：何かに間に合おうと急いでいる感覚）"
            },
            reflection_question: {
              type: Type.STRING,
              description: "ユーザーに断定せずやさしく問いかける内省の質問（例：あなたはいま、何に間に合いたかったのでしょう？）"
            },
            inner_weather: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "今日の心の天気（選択肢：晴れ, 薄曇り, 小雨, 霧, 風が強い, 夜明け前, 静かな雨, 柔らかい光, 嵐, 濃霧）" },
                description: { type: Type.STRING, description: "今日の心の天気の詩的な説明と、今日の過ごし方のやさしいアドバイス（50文字以内）" }
              },
              required: ["type", "description"]
            },
            self_care: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING, description: "今日できる小さな具体的なセルフケア行動（例：予定を1つだけ減らす、温かいハーブティーを一口飲む、お昼に5分だけ空を見上げる、スマホを1時間だけお休みにする）" },
                reason: { type: Type.STRING, description: "このケアを提案する理由（夢の感情やモチーフと紐付けた説明。例：夢の中に焦りや電車を待つ感覚が強く出ていたため、自分を急かさない時間を作るため。）" }
              },
              required: ["action", "reason"]
            },
            garden_update: {
              type: Type.OBJECT,
              properties: {
                new_place: { type: Type.STRING, description: "この夢から新しく育つ、ユーザーの夢の庭の場所や植物（例：待合いのホーム、静かな入り江、古い温室、記憶の部屋、風の通る並木道）" },
                description: { type: Type.STRING, description: "その庭の場所の説明（例：何かを待っている夢から生まれた、静かなベンチのある場所です。）" }
              },
              required: ["new_place", "description"]
            },
            risk_level: { type: Type.STRING, description: "リスク評価（'low' または 'high'。自傷、パニック、希死念慮、極度のパニック、他害など危険度が高い場合は 'high'）" },
            illustration_style: { type: Type.STRING, description: "イラストのスタイル。watercolor, clay_3d, starry_fantasy, retro_anime, surreal_collage のいずれかを選択してください。" },
            illustration_prompt: { type: Type.STRING, description: "イメージ生成AIに入力する、夢の情景を表す英語プロンプト。" }
          },
          required: [
            "dream_title", "summary", "places", "characters", "emotions", "motifs", "colors", "metaphor",
            "reflection_question", "inner_weather", "self_care", "garden_update", "risk_level",
            "illustration_style", "illustration_prompt"
          ]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || "{}");

    // Generate illustration image using Gemini Image Model (gemini-2.5-flash-image)
    let illustration_url = "";
    if (parsedResponse.illustration_prompt && parsedResponse.risk_level !== 'high') {
      try {
        console.log(`[夢守り] Generating image with prompt: ${parsedResponse.illustration_prompt}`);
        const imageResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                text: parsedResponse.illustration_prompt,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1",
            },
          },
        });

        if (imageResponse.candidates?.[0]?.content?.parts) {
          for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData?.data) {
              const base64Data = part.inlineData.data;
              illustration_url = `data:image/png;base64,${base64Data}`;
              console.log("[夢守り] Successfully generated illustration!");
              break;
            }
          }
        }
      } catch (imageErr: any) {
        console.error("[夢守り] Image generation failed or was bypassed:", imageErr);
      }
    }

    parsedResponse.illustration_url = illustration_url;


    // Construct the full entry
    const dream_id = `dream_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const created_at = new Date().toISOString();
    
    const newEntry = {
      dream_id,
      created_at,
      raw_input,
      input_type: input_type || 'text',
      analysis_mode,
      analysis: parsedResponse
    };

    // Save to database
    const db = readDB();
    db.dreams.unshift(newEntry); // Prepend new dream so newest is first

    // Manage Garden update
    const gardenUpdate = parsedResponse.garden_update;
    if (gardenUpdate && gardenUpdate.new_place) {
      const existingObject = db.garden.find(obj => obj.name === gardenUpdate.new_place);
      if (existingObject) {
        existingObject.appearance_count += 1;
        existingObject.last_updated = created_at;
        // Merge motifs and emotions without duplicates
        existingObject.related_motifs = Array.from(new Set([...existingObject.related_motifs, ...(parsedResponse.motifs || [])]));
        existingObject.related_emotions = Array.from(new Set([...existingObject.related_emotions, ...(parsedResponse.emotions || [])]));
      } else {
        db.garden.push({
          object_id: `garden_${Math.random().toString(36).substring(2, 9)}`,
          source_dream_id: dream_id,
          type: "place",
          name: gardenUpdate.new_place,
          related_motifs: parsedResponse.motifs || [],
          related_emotions: parsedResponse.emotions || [],
          description: gardenUpdate.description,
          appearance_count: 1,
          last_updated: created_at
        });
      }
    }

    writeDB(db);

    res.json(newEntry);
  } catch (err: any) {
    console.error("Error analyzing dream with Gemini (using fallback):", err);
    try {
      // Create fallback analysis based on input keywords
      const fallbackAnalysis = getFallbackAnalysis(raw_input, analysis_mode);
      
      const dream_id = `dream_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const created_at = new Date().toISOString();
      
      const newEntry = {
        dream_id,
        created_at,
        raw_input,
        input_type: input_type || 'text',
        analysis_mode,
        analysis: fallbackAnalysis
      };
      
      const db = readDB();
      db.dreams.unshift(newEntry);
      
      // Update garden
      const gardenUpdate = fallbackAnalysis.garden_update;
      if (gardenUpdate && gardenUpdate.new_place) {
        const existingObject = db.garden.find(obj => obj.name === gardenUpdate.new_place);
        if (existingObject) {
          existingObject.appearance_count += 1;
          existingObject.last_updated = created_at;
          existingObject.related_motifs = Array.from(new Set([...existingObject.related_motifs, ...(fallbackAnalysis.motifs || [])]));
          existingObject.related_emotions = Array.from(new Set([...existingObject.related_emotions, ...(fallbackAnalysis.emotions || [])]));
        } else {
          db.garden.push({
            object_id: `garden_${Math.random().toString(36).substring(2, 9)}`,
            source_dream_id: dream_id,
            type: "place",
            name: gardenUpdate.new_place,
            related_motifs: fallbackAnalysis.motifs || [],
            related_emotions: fallbackAnalysis.emotions || [],
            description: gardenUpdate.description,
            appearance_count: 1,
            last_updated: created_at
          });
        }
      }
      
      writeDB(db);
      res.json(newEntry);
    } catch (fallbackErr: any) {
      console.error("Critical fallback failed:", fallbackErr);
      res.status(500).json({ error: "夢の解析に失敗しました。時間をおいてもう一度お試しください。", details: err.message });
    }
  }
});

// 5. Get garden items
app.get("/api/garden", (req, res) => {
  const db = readDB();
  res.json(db.garden);
});

// 6. Get weekly summary
app.get("/api/weekly", async (req, res) => {
  const db = readDB();
  
  // Get dreams from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const weeklyDreams = db.dreams.filter(dream => {
    return new Date(dream.created_at) >= sevenDaysAgo;
  });

  if (weeklyDreams.length === 0) {
    return res.json({
      week_start: new Date().toISOString(),
      dream_count: 0,
      top_emotions: [],
      top_motifs: [],
      weather_history: [],
      weekly_metaphor: "まだ今週の夢の記録がありません。",
      weekly_self_care: "朝、覚えている夢をひとつだけでも預けてみてください。そこから今週の振り返りが生まれます。",
      garden_updates: []
    });
  }

  // Count emotions
  const emotionCounts: { [key: string]: number } = {};
  const motifCounts: { [key: string]: number } = {};
  const weatherHistory: { date: string; weather: string }[] = [];
  const gardenUpdates: string[] = [];

  weeklyDreams.forEach(dream => {
    const analysis = dream.analysis;
    (analysis.emotions || []).forEach((e: string) => {
      emotionCounts[e] = (emotionCounts[e] || 0) + 1;
    });
    (analysis.motifs || []).forEach((m: string) => {
      motifCounts[m] = (motifCounts[m] || 0) + 1;
    });
    if (analysis.inner_weather) {
      weatherHistory.push({
        date: dream.created_at.split('T')[0],
        weather: analysis.inner_weather.type
      });
    }
    if (analysis.garden_update && analysis.garden_update.new_place) {
      gardenUpdates.push(analysis.garden_update.new_place);
    }
  });

  const sortedEmotions = Object.entries(emotionCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const sortedMotifs = Object.entries(motifCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  try {
    // Compile previous summaries or ask Gemini to synthesize a beautiful reflection on the week
    const dreamSummariesText = weeklyDreams.map((d, i) => `【夢 ${i+1}】タイトル: ${d.analysis.dream_title}, 感情: ${d.analysis.emotions.join(',')}, モチーフ: ${d.analysis.motifs.join(',')}, 要約: ${d.analysis.summary}`).join('\n');

    const prompt = `ユーザーの過去1週間の夢ログは以下の通りです：
${dreamSummariesText}

これら ${weeklyDreams.length} 個の夢の傾向から、今週の心のメタファー（内面の状態を表す詩的なフレーズ）と、来週に向けた小さな心温まるセルフケア提案を、以下のJSONフォーマットで作成してください。

【出力JSON仕様】
{
  "weekly_metaphor": "今週のユーザーの心に流れていた全体のメタファーを優しく美しく表す一言（例：立ち止まり、ゆっくりと次の季節を待つ森）",
  "weekly_self_care": "夢全体の傾向から導き出される、来週に向けた小さなやさしいセルフケア行動と理由（100文字程度）"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weekly_metaphor: { type: Type.STRING },
            weekly_self_care: { type: Type.STRING }
          },
          required: ["weekly_metaphor", "weekly_self_care"]
        }
      }
    });

    const synthesis = JSON.parse(response.text || "{}");

    res.json({
      week_start: weeklyDreams[weeklyDreams.length - 1].created_at,
      dream_count: weeklyDreams.length,
      top_emotions: sortedEmotions,
      top_motifs: sortedMotifs,
      weather_history: weatherHistory.reverse(), // chronologically ordered
      weekly_metaphor: synthesis.weekly_metaphor || "心の中の静かな対話",
      weekly_self_care: synthesis.weekly_self_care || "少しだけ一人の時間を作って、深呼吸しましょう。",
      garden_updates: Array.from(new Set(gardenUpdates))
    });

  } catch (err) {
    console.error("Error generating weekly synthesis:", err);
    // Fallback if Gemini fails or rate limit hits
    res.json({
      week_start: weeklyDreams[weeklyDreams.length - 1]?.created_at || new Date().toISOString(),
      dream_count: weeklyDreams.length,
      top_emotions: sortedEmotions,
      top_motifs: sortedMotifs,
      weather_history: weatherHistory.reverse(),
      weekly_metaphor: "静かに整理されている記憶の波",
      weekly_self_care: "今週は多様な感情の動きがありました。週末は温かい紅茶を飲み、何もしない時間を15分だけ作ってみましょう。",
      garden_updates: Array.from(new Set(gardenUpdates))
    });
  }
});

// Serve static assets in production, hook up Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[夢守り] Server running on http://0.0.0.0:${PORT} under NODE_ENV=${process.env.NODE_ENV}`);
  });
}

startServer();
