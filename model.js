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
export function createProfile(character) {
  return { character, routine: [...suggestedRoutine], settings: {}, weeks: {}, months: {} };
}
export function bossSetting(profile, boss) {
  const setting = profile.settings[boss.id] || {};
  const tier = boss.tiers.some(([name]) => name === setting.tier) ? setting.tier : boss.tiers[0][0];
  const defaultPrice = boss.tiers.find(([name]) => name === tier)[1];
  const price = setting.prices?.[tier] ?? defaultPrice;
  const maxParty = boss.maxParty || (boss.id === 'lotus' && tier === '익스트림' ? 2 : 6);
  return { tier, price, priceSource: setting.prices?.[tier] !== undefined ? 'custom' : boss.priceSources?.[tier] || 'reference', party: Math.min(setting.party || 1, maxParty), maxParty, custom: setting.prices?.[tier] !== undefined };
}
export function income(price, party) { if (price === null) return null; return Math.floor(price / Math.max(1, party)); }
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
