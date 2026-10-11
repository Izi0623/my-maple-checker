// 참고 가격: 일반 월드의 과거 결정석 가격. 최신 실거래 가격이 아님.
// 사용자가 실제 판매가를 수정하면 캐릭터별로 저장한다.
export const MAX_WEEKLY_BOSSES = 12;
export function canClearBoss(cleared, id) {
  return cleared.includes(id) || new Set(cleared).size < MAX_WEEKLY_BOSSES;
}
export const bosses = [
  { id: 'zakum', image: './images/bosses/zakum.png', name: '자쿰', mark: '炎', color: '#c67646', tiers: [['카오스', 16200000]] },
  { id: 'magnus', image: './images/bosses/magnus.png', name: '매그너스', mark: '翼', color: '#7297bd', tiers: [['하드', 19012500]] },
  { id: 'hilla', image: './images/bosses/hilla.png', name: '힐라', mark: '紅', color: '#ba5877', tiers: [['하드', 11250000]] },
  { id: 'papulatus', image: './images/bosses/papulatus.png', name: '파풀라투스', mark: '時', color: '#629e9c', tiers: [['카오스', 26450000]] },
  { id: 'pierre', image: './images/bosses/pierre.png', name: '피에르', mark: '♠', color: '#987ec8', tiers: [['카오스', 16200000]] },
  { id: 'vonbon', image: './images/bosses/vonbon.png', name: '반반', mark: '羽', color: '#a78360', tiers: [['카오스', 16200000]] },
  { id: 'queen', image: './images/bosses/queen.png', name: '블러디 퀸', mark: '♛', color: '#b85b82', tiers: [['카오스', 16200000]] },
  { id: 'vellum', image: './images/bosses/vellum.png', name: '벨룸', mark: '龍', color: '#7f9e66', tiers: [['카오스', 21012500]] },
  { id: 'pinkbean', image: './images/bosses/pinkbean.png', name: '핑크빈', mark: '♥', color: '#cf829c', tiers: [['카오스', 12800000]] },
  { id: 'cygnus', image: './images/bosses/cygnus.png', name: '시그너스', mark: '✦', color: '#a68abf', tiers: [['이지', 9112500], ['노멀', 14450000]] },
  { id: 'lotus', image: './images/bosses/lotus.png', name: '스우', mark: '⚡', color: '#618caa', tiers: [['노멀', 32512500], ['하드', 74112500], ['익스트림', 604000000]] },
  { id: 'damien', image: './images/bosses/damien.png', name: '데미안', mark: '劍', color: '#b9675d', tiers: [['노멀', 33800000], ['하드', 70312500]] },
  { id: 'slime', image: './images/bosses/slime.png', name: '가디언 엔젤 슬라임', mark: '●', color: '#7aa986', tiers: [['노멀', 34322000], ['카오스', 113000000]] },
  { id: 'lucid', image: './images/bosses/lucid.png', name: '루시드', mark: '蝶', color: '#b78fcd', tiers: [['이지', 35112500], ['노멀', 40612500], ['하드', 80000000]] },
  { id: 'will', image: './images/bosses/will.png', name: '윌', mark: '網', color: '#9177aa', tiers: [['이지', 38200000], ['노멀', 46512500], ['하드', 88200000]] },
  { id: 'gloom', image: './images/bosses/gloom.png', name: '더스크', mark: '眼', color: '#736780', tiers: [['노멀', 49612500], ['카오스', 92450000]] },
  { id: 'darknell', image: './images/bosses/darknell.png', name: '듄켈', mark: '刃', color: '#627f8c', tiers: [['노멀', 52812500], ['하드', 100000000]] },
  { id: 'vhilla', image: './images/bosses/vhilla.png', name: '진 힐라', mark: '魂', color: '#bd677c', tiers: [['노멀', 88000000], ['하드', 110450000]] },
  { id: 'seren', image: './images/bosses/seren.png', name: '선택받은 세렌', mark: '☀', color: '#c7a45e', tiers: [['노멀', 196000000], ['하드', 267825000], ['익스트림', 1071300000]] },
  { id: 'kalos', image: './images/bosses/kalos.png', name: '감시자 칼로스', mark: '◆', color: '#699ba5', tiers: [['이지', 230000000], ['노멀', 300000000], ['카오스', 600000000], ['익스트림', 1200000000]] },
  { id: 'kaling', image: './images/bosses/kaling.png', name: '카링', mark: '花', color: '#bb838b', tiers: [['이지', 250000000], ['노멀', 350000000], ['하드', 700000000], ['익스트림', 1400000000]] },
];
export const suggestedRoutine = ['zakum', 'magnus', 'papulatus', 'pierre', 'vonbon', 'queen', 'vellum', 'cygnus', 'lotus', 'damien', 'hilla', 'pinkbean'];
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
  return { character, routine: [...suggestedRoutine], settings: {}, weeks: {} };
}
export function bossSetting(profile, boss) {
  const setting = profile.settings[boss.id] || {};
  const tier = boss.tiers.some(([name]) => name === setting.tier) ? setting.tier : boss.tiers[0][0];
  const defaultPrice = boss.tiers.find(([name]) => name === tier)[1];
  const price = setting.prices?.[tier] ?? defaultPrice;
  return { tier, price, party: setting.party || 1, custom: setting.prices?.[tier] !== undefined };
}
export function income(price, party) { return Math.floor(price / Math.max(1, party)); }
export function totals(profile, key) {
  const clears = profile.weeks[key] || [];
  return bosses.filter(b => profile.routine.includes(b.id)).reduce((sum, boss) => {
    const s = bossSetting(profile, boss);
    const value = income(s.price, s.party);
    sum.expected += value;
    if (clears.includes(boss.id)) { sum.earned += value; sum.count += 1; }
    return sum;
  }, { expected: 0, earned: 0, count: 0 });
}
