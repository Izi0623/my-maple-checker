// 기본 가격: 사용자가 제공한 엑셀의 변경 가격 46건 + 별도로 표시하는 공개 참조값 8건.
// 사용자가 실제 판매가를 수정하면 캐릭터별로 저장한다.
export const MAX_WEEKLY_BOSSES = 12;
export function canClearBoss(cleared, id) {
  return cleared.includes(id) || new Set(cleared).size < MAX_WEEKLY_BOSSES;
}
export const bosses = [
  {
    "id": "zakum",
    "image": "./images/bosses/zakum.png",
    "name": "자쿰",
    "mark": "炎",
    "color": "#c67646",
    "tiers": [
      [
        "카오스",
        4040000
      ]
    ],
    "priceSources": {
      "카오스": "excel"
    }
  },
  {
    "id": "magnus",
    "image": "./images/bosses/magnus.png",
    "name": "매그너스",
    "mark": "翼",
    "color": "#7297bd",
    "tiers": [
      [
        "하드",
        4280000
      ]
    ],
    "priceSources": {
      "하드": "excel"
    }
  },
  {
    "cycle": "legacy",
    "id": "hilla",
    "image": "./images/bosses/hilla.png",
    "name": "힐라",
    "mark": "紅",
    "color": "#ba5877",
    "tiers": [
      [
        "하드",
        11250000
      ]
    ]
  },
  {
    "id": "papulatus",
    "image": "./images/bosses/papulatus.png",
    "name": "파풀라투스",
    "mark": "時",
    "color": "#629e9c",
    "tiers": [
      [
        "카오스",
        6550000
      ]
    ],
    "priceSources": {
      "카오스": "excel"
    }
  },
  {
    "id": "pierre",
    "image": "./images/bosses/pierre.png",
    "name": "피에르",
    "mark": "♠",
    "color": "#987ec8",
    "tiers": [
      [
        "카오스",
        4080000
      ]
    ],
    "priceSources": {
      "카오스": "excel"
    }
  },
  {
    "id": "vonbon",
    "image": "./images/bosses/vonbon.png",
    "name": "반반",
    "mark": "羽",
    "color": "#a78360",
    "tiers": [
      [
        "카오스",
        4070000
      ]
    ],
    "priceSources": {
      "카오스": "excel"
    }
  },
  {
    "id": "queen",
    "image": "./images/bosses/queen.png",
    "name": "블러디 퀸",
    "mark": "♛",
    "color": "#b85b82",
    "tiers": [
      [
        "카오스",
        4070000
      ]
    ],
    "priceSources": {
      "카오스": "excel"
    }
  },
  {
    "id": "vellum",
    "image": "./images/bosses/vellum.png",
    "name": "벨룸",
    "mark": "龍",
    "color": "#7f9e66",
    "tiers": [
      [
        "카오스",
        4640000
      ]
    ],
    "priceSources": {
      "카오스": "excel"
    }
  },
  {
    "cycle": "legacy",
    "id": "pinkbean",
    "image": "./images/bosses/pinkbean.png",
    "name": "핑크빈",
    "mark": "♥",
    "color": "#cf829c",
    "tiers": [
      [
        "카오스",
        12800000
      ]
    ]
  },
  {
    "cycle": "legacy",
    "id": "cygnus",
    "image": "./images/bosses/cygnus.png",
    "name": "시그너스",
    "mark": "✦",
    "color": "#a68abf",
    "tiers": [
      [
        "이지",
        9112500
      ],
      [
        "노멀",
        14450000
      ]
    ]
  },
  {
    "id": "lotus",
    "image": "./images/bosses/lotus.png",
    "name": "스우",
    "mark": "⚡",
    "color": "#618caa",
    "tiers": [
      [
        "노멀",
        8350000
      ],
      [
        "하드",
        48900000
      ],
      [
        "익스트림",
        545000000
      ]
    ],
    "priceSources": {
      "노멀": "excel",
      "하드": "excel",
      "익스트림": "excel"
    }
  },
  {
    "id": "damien",
    "image": "./images/bosses/damien.png",
    "name": "데미안",
    "mark": "劍",
    "color": "#b9675d",
    "tiers": [
      [
        "노멀",
        8750000
      ],
      [
        "하드",
        46400000
      ]
    ],
    "priceSources": {
      "노멀": "excel",
      "하드": "excel"
    }
  },
  {
    "id": "slime",
    "image": "./images/bosses/slime.png",
    "name": "가디언 엔젤 슬라임",
    "mark": "●",
    "color": "#7aa986",
    "tiers": [
      [
        "노멀",
        12700000
      ],
      [
        "카오스",
        71300000
      ]
    ],
    "priceSources": {
      "노멀": "excel",
      "카오스": "excel"
    }
  },
  {
    "id": "lucid",
    "image": "./images/bosses/lucid.png",
    "name": "루시드",
    "mark": "蝶",
    "color": "#b78fcd",
    "tiers": [
      [
        "이지",
        14900000
      ],
      [
        "노멀",
        17800000
      ],
      [
        "하드",
        59700000
      ]
    ],
    "priceSources": {
      "이지": "excel",
      "노멀": "excel",
      "하드": "excel"
    }
  },
  {
    "id": "will",
    "image": "./images/bosses/will.png",
    "name": "윌",
    "mark": "網",
    "color": "#9177aa",
    "tiers": [
      [
        "이지",
        16100000
      ],
      [
        "노멀",
        20500000
      ],
      [
        "하드",
        73200000
      ]
    ],
    "priceSources": {
      "이지": "excel",
      "노멀": "excel",
      "하드": "excel"
    }
  },
  {
    "id": "gloom",
    "image": "./images/bosses/gloom.png",
    "name": "더스크",
    "mark": "眼",
    "color": "#736780",
    "tiers": [
      [
        "노멀",
        22000000
      ],
      [
        "카오스",
        66300000
      ]
    ],
    "priceSources": {
      "노멀": "excel",
      "카오스": "excel"
    }
  },
  {
    "id": "darknell",
    "image": "./images/bosses/darknell.png",
    "name": "듄켈",
    "mark": "刃",
    "color": "#627f8c",
    "tiers": [
      [
        "노멀",
        23700000
      ],
      [
        "하드",
        89600000
      ]
    ],
    "priceSources": {
      "노멀": "excel",
      "하드": "excel"
    }
  },
  {
    "id": "vhilla",
    "image": "./images/bosses/vhilla.png",
    "name": "진 힐라",
    "mark": "魂",
    "color": "#bd677c",
    "tiers": [
      [
        "노멀",
        67600000
      ],
      [
        "하드",
        100000000
      ]
    ],
    "priceSources": {
      "노멀": "excel",
      "하드": "excel"
    }
  },
  {
    "id": "seren",
    "image": "./images/bosses/seren.png",
    "name": "선택받은 세렌",
    "mark": "☀",
    "color": "#c7a45e",
    "tiers": [
      [
        "노멀",
        167000000
      ],
      [
        "하드",
        302000000
      ],
      [
        "익스트림",
        1840000000
      ]
    ],
    "priceSources": {
      "노멀": "excel",
      "하드": "excel",
      "익스트림": "excel"
    }
  },
  {
    "id": "kalos",
    "image": "./images/bosses/kalos.png",
    "name": "감시자 칼로스",
    "mark": "◆",
    "color": "#699ba5",
    "tiers": [
      [
        "이지",
        238000000
      ],
      [
        "노멀",
        479000000
      ],
      [
        "카오스",
        1230000000
      ],
      [
        "익스트림",
        4104000000
      ]
    ],
    "priceSources": {
      "이지": "excel",
      "노멀": "excel",
      "카오스": "excel",
      "익스트림": "reference"
    }
  },
  {
    "id": "kaling",
    "image": "./images/bosses/kaling.png",
    "name": "카링",
    "mark": "花",
    "color": "#bb838b",
    "tiers": [
      [
        "이지",
        320000000
      ],
      [
        "노멀",
        593000000
      ],
      [
        "하드",
        1560000000
      ],
      [
        "익스트림",
        5387000000
      ]
    ],
    "priceSources": {
      "이지": "excel",
      "노멀": "excel",
      "하드": "excel",
      "익스트림": "reference"
    }
  },
  {
    "id": "first_adversary",
    "name": "최초의 대적자",
    "image": "./images/bosses/first_adversary.webp",
    "cycle": "weekly",
    "mark": "✦",
    "color": "#8a80ba",
    "tiers": [
      [
        "이지",
        261000000
      ],
      [
        "노멀",
        532000000
      ],
      [
        "하드",
        1390000000
      ],
      [
        "익스트림",
        4712000000
      ]
    ],
    "maxParty": 3,
    "priceSources": {
      "이지": "excel",
      "노멀": "excel",
      "하드": "excel",
      "익스트림": "reference"
    }
  },
  {
    "id": "radiant_malefic_star",
    "name": "찬란한 흉성",
    "image": "./images/bosses/radiant_malefic_star.webp",
    "cycle": "weekly",
    "mark": "✦",
    "color": "#8a80ba",
    "tiers": [
      [
        "노멀",
        576000000
      ],
      [
        "하드",
        2678000000
      ]
    ],
    "maxParty": 3,
    "priceSources": {
      "노멀": "excel",
      "하드": "reference"
    }
  },
  {
    "id": "bellona",
    "name": "벨로나",
    "image": "./images/bosses/bellona.webp",
    "cycle": "weekly",
    "mark": "✦",
    "color": "#8a80ba",
    "tiers": [
      [
        "이지",
        396000000
      ],
      [
        "노멀",
        824000000
      ],
      [
        "하드",
        2950000000
      ]
    ],
    "maxParty": 3,
    "priceSources": {
      "이지": "excel",
      "노멀": "excel",
      "하드": "reference"
    }
  },
  {
    "id": "limbo",
    "name": "림보",
    "image": "./images/bosses/limbo.webp",
    "cycle": "weekly",
    "mark": "✦",
    "color": "#8a80ba",
    "tiers": [
      [
        "노멀",
        995000000
      ],
      [
        "하드",
        2385000000
      ]
    ],
    "maxParty": 3,
    "priceSources": {
      "노멀": "excel",
      "하드": "reference"
    }
  },
  {
    "id": "bardrix",
    "name": "발드릭스",
    "image": "./images/bosses/bardrix.webp",
    "cycle": "weekly",
    "mark": "✦",
    "color": "#8a80ba",
    "tiers": [
      [
        "노멀",
        1320000000
      ],
      [
        "하드",
        3078000000
      ]
    ],
    "maxParty": 3,
    "priceSources": {
      "노멀": "excel",
      "하드": "reference"
    }
  },
  {
    "id": "jupiter",
    "name": "유피테르",
    "image": "./images/bosses/jupiter.webp",
    "cycle": "weekly",
    "mark": "✦",
    "color": "#8a80ba",
    "tiers": [
      [
        "노멀",
        1560000000
      ],
      [
        "하드",
        4845000000
      ]
    ],
    "maxParty": 3,
    "priceSources": {
      "노멀": "excel",
      "하드": "reference"
    }
  },
  {
    "id": "black_mage",
    "name": "검은 마법사",
    "image": "./images/bosses/black_mage.webp",
    "cycle": "monthly",
    "mark": "✦",
    "color": "#8a80ba",
    "tiers": [
      [
        "하드",
        465000000
      ],
      [
        "익스트림",
        5680000000
      ]
    ],
    "priceSources": {
      "하드": "excel",
      "익스트림": "excel"
    }
  }
];
export const suggestedRoutine = ['zakum', 'magnus', 'papulatus', 'pierre', 'vonbon', 'queen', 'vellum', 'lotus', 'damien', 'slime', 'lucid', 'will'];
export function weekKey(now = new Date()) {
  const kst = new Date(now.getTime() + 9 * 3600000);
  const days = (kst.getUTCDay() + 3) % 7;
  kst.setUTCDate(kst.getUTCDate() - days);
  return kst.toISOString().slice(0, 10);
}
export function weekLabel(key) {
  const start = new Date(`${key}T00:00:00Z`);
  const end = new Date(start.getTime() + 6 * 86400000);
  const fmt = d => `${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}`;
  return `${fmt(start)} – ${fmt(end)}`;
}
export function createProfile(character = {}) {
  const { combatPower, combatPowerDate, ...rest } = character;
  const power = readPower(combatPower);
  const safeCharacter = { ...rest };
  if (power !== null) {
    safeCharacter.combatPower = power;
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(combatPowerDate ?? ''))) safeCharacter.combatPowerDate = combatPowerDate;
  }
  const profile = { character: safeCharacter, routine: [...suggestedRoutine], settings: {}, weeks: {}, months: {} };
  if (Number.isInteger(safeCharacter.level) && safeCharacter.level >= 1 && safeCharacter.source !== 'demo') {
    const available = bosses.filter(b => bossCycle(b) !== 'legacy' && safeCharacter.level >= (bossEntryLevels[b.id] ?? 0));
    const picks = available
      .map(boss => ({ boss, clear: bestBossClear(boss, { level: safeCharacter.level, combatPower: power }) }))
      .filter(pick => pick.clear);
    const weekly = picks.filter(pick => bossCycle(pick.boss) === 'weekly').sort((a, b) => b.clear.perPerson - a.clear.perPerson).slice(0, MAX_WEEKLY_BOSSES);
    const selected = [...weekly, ...picks.filter(pick => bossCycle(pick.boss) === 'monthly')];
    profile.routine = selected.map(pick => pick.boss.id);
    for (const { boss, clear } of selected) profile.settings[boss.id] = { tier: clear.tier, party: clear.party, prices: {}, note: '' };
  }
  return profile;
}
// 전투력 표기는 정수·'1억 2400만' 문자열을 모두 받는다.
export function readPower(value) {
  return typeof value === 'string' ? parsePower(value) : normalizePower(value);
}
// 새로 조회한 캐릭터 정보로 기존 기록을 갱신한다. 전투력만은 '높은 쪽'을 남긴다.
// Nexon 스냅샷은 사냥용 프리셋 기준(낮은 전투력)일 수 있어 저장된 보스 전투력을 낮추지 않는다.
// 직접 입력한 값도 같은 규칙으로 지켜지고, 다이얼로그에서 직접 고친 값은 이 병합을 거치지 않고 그대로 저장한다.
export function mergeCharacterPower(existing = {}, fetched = {}) {
  const saved = readPower(existing.combatPower);
  const incoming = readPower(fetched.combatPower);
  const savedDate = /^\d{4}-\d{2}-\d{2}$/.test(String(existing.combatPowerDate ?? '')) ? existing.combatPowerDate : undefined;
  const incomingDate = /^\d{4}-\d{2}-\d{2}$/.test(String(fetched.combatPowerDate ?? '')) ? fetched.combatPowerDate : undefined;
  if (saved !== null && (incoming === null || saved > incoming)) {
    return { combatPower: saved, ...(savedDate ? { combatPowerDate: savedDate } : {}), keptExisting: true, fetchedCombatPower: incoming ?? undefined };
  }
  if (incoming === null) return { keptExisting: false };
  return { combatPower: incoming, ...(incomingDate ? { combatPowerDate: incomingDate } : {}), keptExisting: false, fetchedCombatPower: incoming };
}
// 조회 결과로 기존 캐릭터를 덮어쓸 때 쓰는 형태. 조회한 이름·레벨·사진 등은 새 값으로, 전투력은 높은 쪽으로 맞춘다.
export function mergeFetchedCharacter(existing = {}, fetched = {}) {
  const merged = mergeCharacterPower(existing, fetched);
  const { combatPower: _power, combatPowerDate: _powerDate, ...identity } = fetched;
  const character = { ...identity };
  if (merged.combatPower !== undefined) {
    character.combatPower = merged.combatPower;
    if (merged.combatPowerDate) character.combatPowerDate = merged.combatPowerDate;
  }
  return { character, ...merged };
}
// 직접 입력·수정한 값은 사용자가 정한 값이므로 그대로 저장한다(일부러 낮추는 것도 허용).
// 전투력이 그대로면 Nexon 조회 기준일은 지우지 않고, 값이 바뀌면 기준일도 함께 지운다.
export function applyManualCharacter(existing = {}, { level, combatPower } = {}) {
  const character = { ...existing };
  if (Number.isInteger(level)) character.level = level;
  const power = readPower(combatPower);
  if (power !== null) {
    if (power !== readPower(existing.combatPower)) delete character.combatPowerDate;
    character.combatPower = power;
  }
  return character;
}
// 1인 격파 최소 전투력. 2인격은 같은 난이도의 55% 수준에서 클리어 가능한 것으로 본다.
// 값의 근거와 출처는 POWER_SOURCES.md에 정리했다.
export const DUO_POWER_RATIO = 0.55;
export const bossSoloPower = {
  zakum: { '카오스': 900000 },
  magnus: { '하드': 3000000 },
  hilla: { '하드': 800000 },
  papulatus: { '카오스': 6000000 },
  pierre: { '카오스': 3000000 },
  vonbon: { '카오스': 3000000 },
  queen: { '카오스': 3000000 },
  vellum: { '카오스': 5000000 },
  pinkbean: { '카오스': 1600000 },
  cygnus: { '이지': 400000, '노멀': 600000 },
  lotus: { '노멀': 7000000, '하드': 19000000, '익스트림': 340000000 },
  damien: { '노멀': 8000000, '하드': 20000000 },
  slime: { '노멀': 8000000, '카오스': 40000000 },
  lucid: { '이지': 12000000, '노멀': 20000000, '하드': 40000000 },
  will: { '이지': 12000000, '노멀': 25000000, '하드': 40000000 },
  gloom: { '노멀': 16000000, '카오스': 40000000 },
  darknell: { '노멀': 18000000, '하드': 40000000 },
  vhilla: { '노멀': 30000000, '하드': 50000000 },
  seren: { '노멀': 80000000, '하드': 180000000, '익스트림': 1100000000 },
  kalos: { '이지': 120000000, '노멀': 250000000, '카오스': 700000000, '익스트림': 1600000000 },
  kaling: { '이지': 250000000, '노멀': 600000000, '하드': 1000000000, '익스트림': 2500000000 },
  first_adversary: { '이지': 90000000, '노멀': 300000000, '하드': 1200000000, '익스트림': 3000000000 },
  radiant_malefic_star: { '노멀': 200000000, '하드': 800000000 },
  bellona: { '이지': 100000000, '노멀': 300000000, '하드': 1000000000 },
  limbo: { '노멀': 700000000, '하드': 1400000000 },
  bardrix: { '노멀': 800000000, '하드': 1700000000 },
  jupiter: { '노멀': 700000000, '하드': 2500000000 },
  black_mage: { '하드': 120000000, '익스트림': 800000000 },
};
export function normalizePower(value) {
  const number = typeof value === 'string' ? Number(value.replace(/[^\d]/g, '')) : value;
  return Number.isSafeInteger(number) && number > 0 && number <= 100000000000000 ? number : null;
}
// '1억 2400만', '8500만', '1.24억', '124,000,000' 같은 입력을 정수 전투력으로 바꾼다.
export function parsePower(input) {
  if (typeof input === 'number') return normalizePower(input);
  const text = String(input ?? '').replace(/[\s,]/g, '');
  if (!text) return null;
  if (/^\d+$/.test(text)) return normalizePower(Number(text));
  const units = { '억': 100000000, '천만': 10000000, '백만': 1000000, '만': 10000, '천': 1000, '백': 100 };
  const pattern = /(\d+(?:\.\d+)?)(억|천만|백만|만|천|백)?/g;
  let total = 0;
  let consumed = '';
  let match;
  while ((match = pattern.exec(text)) !== null) {
    consumed += match[0];
    total += Number(match[1]) * (match[2] ? units[match[2]] : 1);
  }
  if (!consumed || consumed !== text) return null;
  return normalizePower(Math.round(total));
}
export function bossSoloThreshold(boss, tier) {
  const value = bossSoloPower[boss.id]?.[tier];
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}
export function bossDuoThreshold(boss, tier) {
  const solo = bossSoloThreshold(boss, tier);
  return solo === null ? null : Math.round(solo * DUO_POWER_RATIO);
}
// 입장 레벨과 전투력으로 그 보스에서 노릴 수 있는 가장 값진 난이도·인원을 고른다.
// 전투력이 없으면 기존처럼 가장 비싼 난이도를 1인 기준으로 쓴다.
export function bestBossClear(boss, { level, combatPower, prices = {} } = {}) {
  const entryLevel = bossEntryLevels[boss.id];
  if (entryLevel !== undefined && !(Number.isInteger(level) && level >= entryLevel)) return null;
  const power = normalizePower(combatPower);
  let best = null;
  for (const [tier, defaultPrice] of boss.tiers) {
    const custom = prices?.[tier];
    const price = Number.isSafeInteger(custom) && custom >= 0 ? custom : defaultPrice;
    if (!Number.isSafeInteger(price) || price < 0) continue;
    let party = null;
    if (power === null) party = 1;
    else {
      const solo = bossSoloThreshold(boss, tier);
      if (solo === null) continue;
      if (power >= solo) party = 1;
      else if (power >= bossDuoThreshold(boss, tier)) party = 2;
    }
    if (party === null) continue;
    const perPerson = income(price, party);
    if (perPerson === null) continue;
    if (!best || perPerson > best.perPerson) best = { tier, party, price, perPerson };
  }
  return best;
}
// ASSETS.md의 공개 참조 목록에 기재된 입장 요구 레벨. 전투력/선행 퀘스트는 별도 조건이다.
export const bossEntryLevels = { zakum: 90, magnus: 175, papulatus: 190, pierre: 180, vonbon: 180, queen: 180, vellum: 180, lotus: 190, damien: 190, slime: 210, lucid: 220, will: 235, gloom: 245, vhilla: 250, darknell: 255, seren: 260, kalos: 265, first_adversary: 270, kaling: 275, radiant_malefic_star: 280, bellona: 280, limbo: 285, bardrix: 290, jupiter: 295, black_mage: 255 };
export function bossSetting(profile, boss) {
  const setting = profile.settings[boss.id] || {};
  const tier = boss.tiers.some(([name]) => name === setting.tier) ? setting.tier : defaultBossTier(boss);
  const defaultPrice = boss.tiers.find(([name]) => name === tier)[1];
  const price = setting.prices?.[tier] ?? defaultPrice;
  const maxParty = boss.maxParty || (boss.id === 'lotus' && tier === '익스트림' ? 2 : 6);
  return { tier, price, priceSource: setting.prices?.[tier] !== undefined ? 'custom' : boss.priceSources?.[tier] || 'reference', party: Math.min(setting.party || 1, maxParty), maxParty, custom: setting.prices?.[tier] !== undefined };
}
export function defaultBossTier(boss) {
  return boss.tiers.find(([tier]) => tier === '카오스')?.[0] || boss.tiers.find(([tier]) => tier === '하드')?.[0] || boss.tiers[0][0];
}
export function income(price, party) { if (price === null) return null; return Math.floor(price / Math.max(1, party)); }
export function cashValue(mesos, rate) { return Math.floor(mesos / 100000000 * rate); }
export function monthlyProjection(profiles, weeks = 4) {
  const characters = Object.entries(profiles).filter(([, p]) => p.character.source !== 'demo').map(([id, p]) => {
    const weekly = totals(p, '', 'weekly').expected;
    const monthlyBosses = totals(p, '', 'monthly').expected;
    return { id, name: p.character.name, weekly, monthlyBosses, monthly: weekly * weeks + monthlyBosses };
  });
  const weekly = characters.reduce((sum, c) => sum + c.weekly, 0);
  const monthlyBosses = characters.reduce((sum, c) => sum + c.monthlyBosses, 0);
  return { characters, weekly, monthlyBosses, monthly: weekly * weeks + monthlyBosses };
}
export function bossCycle(boss) { return boss.cycle || 'weekly'; }
export function monthKey(now = new Date()) { return new Date(now.getTime() + 9 * 3600000).toISOString().slice(0, 7); }
export function totals(profile, key, cycle = 'weekly') {
  const clears = (cycle === 'monthly' ? profile.months?.[key] : profile.weeks[key]) || [];
  return bosses.filter(b => profile.routine.includes(b.id) && bossCycle(b) === cycle).reduce((sum, boss) => {
    const s = bossSetting(profile, boss);
    const value = income(s.price, s.party);
    if (value !== null) sum.expected += value;
    if (clears.includes(boss.id)) { if (value !== null) sum.earned += value; sum.count += 1; }
    return sum;
  }, { expected: 0, earned: 0, count: 0 });
}
export function setRoutineClears(profile, key, checked, cycle = 'weekly') {
  const records = cycle === 'monthly' ? profile.months : profile.weeks;
  const selected = bosses.filter(b => profile.routine.includes(b.id) && bossCycle(b) === cycle).map(b => b.id);
  const next = new Set(records[key] || []);
  for (const id of selected) checked ? next.add(id) : next.delete(id);
  const weeklyCount = [...next].filter(id => bosses.some(b => b.id === id && bossCycle(b) === 'weekly')).length;
  if (cycle === 'weekly' && weeklyCount > MAX_WEEKLY_BOSSES) return false;
  records[key] = [...next];
  return true;
}
