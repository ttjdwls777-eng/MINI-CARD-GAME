(function(){
'use strict';

// ==================== FIREBASE SDK DYNAMIC LOADER ====================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBDJxn10EyQtGhJDemFA7pF-5QA-GGLW7Y",
  authDomain: "xgp-minigame.firebaseapp.com",
  databaseURL: "https://xgp-minigame-default-rtdb.firebaseio.com",
  projectId: "xgp-minigame",
  storageBucket: "xgp-minigame.appspot.com",
  messagingSenderId: "712312742763",
  appId: "1:712312742763:web:eef8675828aefe8c71222e",
  measurementId: "G-LQVEQH5V81"
};

function loadScript(src) {
  return new Promise(function(resolve, reject) {
    if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
    var s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = function() { console.warn('Failed to load: ' + src); resolve(); };
    document.head.appendChild(s);
  });
}

async function ensureFirebase() {
  try {
    if (typeof firebase === 'undefined' || !firebase.app) {
      await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
    }
    if (typeof firebase !== 'undefined' && !firebase.auth) {
      await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js');
    }
    if (typeof firebase !== 'undefined' && !firebase.database) {
      await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js');
    }
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length === 0) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    return typeof firebase !== 'undefined' && !!firebase.database;
  } catch (e) {
    console.warn('Firebase init failed:', e);
    return false;
  }
}

function firebaseAvailable() {
  return typeof firebase !== 'undefined' && !!firebase.database;
}

const STARTING_STARS = 10000;
const DAILY_BONUS = 100;
const CHIPS = [50, 100, 500, 1000, 5000, 10000];
const SUITS = ['♠','♥','♦','♣'];
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const CARD_VALUES = {A:1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':0,J:0,Q:0,K:0};
const PAYOUTS = {player:2, banker:1.95, tie:9};
const BOT_NAMES = ['Luna','Nova','Jade','Sage','Iris','Echo','Zara','Vex'];
const BOT_AVATARS = ['🤖','🦊','🐲','🦅','🐺','🦁','🐍','🦇'];

const SHOP_ITEMS = {
  avatars: [
    {id:'ace',emoji:'🃏',price:0},
    {id:'crown',emoji:'👑',price:60000},
    {id:'diamond',emoji:'💎',price:90000},
    {id:'fire',emoji:'🔥',price:105000},
    {id:'star',emoji:'⭐',price:120000},
    {id:'dragon',emoji:'🐉',price:135000},
    {id:'rocket',emoji:'🚀',price:150000},
    {id:'money',emoji:'💰',price:180000}
  ],
  tables: [
    {id:'classic',emoji:'🟩',price:0},
    {id:'royal',emoji:'🔵',price:80000},
    {id:'ruby',emoji:'🔴',price:120000},
    {id:'gold',emoji:'🟡',price:200000}
  ],
  cardbacks: [
    {id:'red',emoji:'🎴',price:0},
    {id:'blue',emoji:'🔷',price:50000},
    {id:'gold',emoji:'✨',price:150000},
    {id:'diamond',emoji:'♠️',price:250000}
  ]
};

const ACHIEVEMENTS = [
  {id:'first_win',icon:'🎉',req:g=>g.totalWins>=1},
  {id:'wins_10',icon:'🏆',req:g=>g.totalWins>=10},
  {id:'wins_50',icon:'👑',req:g=>g.totalWins>=50},
  {id:'wins_100',icon:'💎',req:g=>g.totalWins>=100},
  {id:'streak_3',icon:'🔥',req:g=>g.bestStreak>=3},
  {id:'streak_5',icon:'⚡',req:g=>g.bestStreak>=5},
  {id:'streak_10',icon:'✨',req:g=>g.bestStreak>=10},
  {id:'high_roller',icon:'💰',req:g=>g.biggestBet>=10000},
  {id:'tie_winner',icon:'🍀',req:g=>g.tieWins>=1},
  {id:'games_50',icon:'🎯',req:g=>g.totalPlayed>=50},
  {id:'games_200',icon:'🎲',req:g=>g.totalPlayed>=200},
  {id:'rich',icon:'💵',req:g=>g.peakStars>=100000}
];

const MISSIONS = [
  {id:'play_3',icon:'🎯',target:3,type:'games'},
  {id:'win_2',icon:'🏆',target:2,type:'wins'},
  {id:'bet_1000',icon:'💰',target:1000,type:'totalBet'},
  {id:'streak_2',icon:'🔥',target:2,type:'streak'},
  {id:'banker_bet',icon:'🤵',target:1,type:'bankerBets'},
  {id:'tie_bet',icon:'🍀',target:1,type:'tieBets'}
];

const I18N = {
  en: {
    app_title: 'FA Baccarat',
    nav_home: 'Home',
    nav_rank: 'Ranking',
    nav_shop: 'Shop',
    nav_mission: 'Mission',
    nav_profile: 'Profile',
    play_ai: 'Play vs Dealer',
    play_online: 'Online Table',
    daily_checkin: 'Daily Check-In',
    stars: 'Stars',
    level: 'Level',
    wins: 'Wins',
    streak: 'Streak',
    best_streak: 'Best Streak',
    deal: 'Deal',
    player: 'Player',
    banker: 'Banker',
    tie: 'Tie',
    natural: 'Natural',
    you_win: 'You Win!',
    you_lose: 'You Lose',
    tie_push: 'Push',
    not_enough: 'Not enough stars',
    settings: 'Settings',
    sound: 'Sound',
    vibrate: 'Vibration',
    language: 'Language',
    total_rank: 'Total Ranking',
    weekly_top: 'Weekly Top',
    last_week: 'Last Week',
    shop_title: 'Shop',
    avatars: 'Avatars',
    tables: 'Tables',
    card_backs: 'Card Backs',
    equipped: 'Equipped',
    equip: 'Equip',
    locked: 'Locked',
    purchase: 'Purchase',
    missions_title: 'Missions',
    daily_mission: 'Daily Missions',
    achievements: 'Achievements',
    profile: 'Profile',
    reset_stats: 'Reset Stats',
    tutorial: 'Tutorial',
    home: 'Home',
    confirm_reset: 'Reset all stats? This cannot be undone.',
    ok: 'OK',
    cancel: 'Cancel',
    claim: 'Claim',
    room_code: 'Room Code',
    create_room: 'Create Room',
    join_room: 'Join Room',
    wager: 'Wager per hand',
    waiting: 'Waiting for players...',
    ready: 'Ready',
    start: 'Start Game',
    leave: 'Leave',
    players: 'Players',
    round_num: 'Round',
    your_bet: 'Your bet',
    no_bet: 'No bet',
    win_rate: 'Win Rate',
    total_games: 'Total Games',
    bet_returned: 'Bet Returned',
    continue_btn: 'Continue',
    nickname: 'Nickname',
    save: 'Save',
    online_table: 'Online Table',
    play_dealer: 'Play vs Dealer',
    casino: 'Casino',
    premium: 'Premium',
    punto_banco: 'Punto Banco',
    ranking: 'Ranking',
    shop: 'Shop',
    mission: 'Mission',
    claim_reward: 'Claim Reward',
    daily_check: 'Daily Check-In',
    room_full: 'Room is full',
    room_not_found: 'Room not found',
    already_in_room: 'Already in a room',
    host_left: 'Host has left',
    you_left: 'You have left the room',
    natural_win: 'Natural Win!',
    pair_bonus: 'Pair Bonus!',
    dealing: 'Dealing...',
    placed_bet: 'Bet Placed',
    seat: 'Seat',
    viewer: 'Viewer',
    tut_step1: 'Baccarat is played between Player and Banker. Cards 2-9 are worth face value, 10/J/Q/K = 0, A = 1.',
    tut_step2: 'Each hand tries to reach 9 or closest to it. Hand total is the last digit of card sum.',
    tut_step3: 'You bet on Player win, Banker win, or Tie. Third card drawn if needed by specific rules.',
    tut_step4: 'Payout: Player 1:1, Banker 1:0.95 (5% commission), Tie 8:1.',
    tut_step5: 'Place your bet before each hand. Good luck and play responsibly!',
    ach_first_win: 'First Win',
    ach_wins_10: 'Getting Warmed Up',
    ach_wins_50: 'High Roller',
    ach_wins_100: 'Legend',
    ach_streak_3: 'Hot Hand',
    ach_streak_5: 'On Fire',
    ach_streak_10: 'Unstoppable',
    ach_high_roller: 'Big Spender',
    ach_tie_winner: 'Lucky Tie',
    ach_games_50: '50 Rounds',
    ach_games_200: '200 Rounds',
    ach_rich: 'Millionaire',
    mis_play_3: 'Play 3 hands',
    mis_win_2: 'Win 2 hands',
    mis_bet_1000: 'Bet 1000 total',
    mis_streak_2: '2-hand win streak',
    mis_banker_bet: 'Bet on Banker once',
    mis_tie_bet: 'Bet on Tie once'
  },
  ko: {
    app_title: 'FA 바카라',
    nav_home: '홈',
    nav_rank: '랭킹',
    nav_shop: '상점',
    nav_mission: '미션',
    nav_profile: '프로필',
    play_ai: '딜러와 플레이',
    play_online: '온라인 테이블',
    daily_checkin: '일일 출석',
    stars: '스타',
    level: '레벨',
    wins: '승리',
    streak: '연승',
    best_streak: '최고 연승',
    deal: '딜',
    player: '플레이어',
    banker: '뱅커',
    tie: '타이',
    natural: '내추럴',
    you_win: '승리!',
    you_lose: '패배',
    tie_push: '동점',
    not_enough: '스타가 부족합니다',
    settings: '설정',
    sound: '소리',
    vibrate: '진동',
    language: '언어',
    total_rank: '전체 랭킹',
    weekly_top: '주간 상위',
    last_week: '지난주',
    shop_title: '상점',
    avatars: '아바타',
    tables: '테이블',
    card_backs: '카드 뒷면',
    equipped: '장착됨',
    equip: '장착',
    locked: '잠금',
    purchase: '구매',
    missions_title: '미션',
    daily_mission: '일일 미션',
    achievements: '업적',
    profile: '프로필',
    reset_stats: '통계 초기화',
    tutorial: '튜토리얼',
    home: '홈',
    confirm_reset: '모든 통계를 초기화하시겠습니까? 취소할 수 없습니다.',
    ok: '확인',
    cancel: '취소',
    claim: '받기',
    room_code: '방 코드',
    create_room: '방 생성',
    join_room: '방 참가',
    wager: '핸드당 베팅',
    waiting: '플레이어 대기 중...',
    ready: '준비됨',
    start: '게임 시작',
    leave: '나가기',
    players: '플레이어',
    round_num: '라운드',
    your_bet: '당신의 베팅',
    no_bet: '베팅 없음',
    win_rate: '승률',
    total_games: '총 게임',
    bet_returned: '베팅 반환',
    continue_btn: '계속',
    nickname: '닉네임',
    save: '저장',
    online_table: '온라인 테이블',
    play_dealer: '딜러와 플레이',
    casino: '카지노',
    premium: '프리미엄',
    punto_banco: '푼토 뱅코',
    ranking: '랭킹',
    shop: '상점',
    mission: '미션',
    claim_reward: '보상 받기',
    daily_check: '일일 출석',
    room_full: '방이 가득 찼습니다',
    room_not_found: '방을 찾을 수 없습니다',
    already_in_room: '이미 방에 있습니다',
    host_left: '호스트가 떠났습니다',
    you_left: '방에서 나갔습니다',
    natural_win: '내추럴 승리!',
    pair_bonus: '페어 보너스!',
    dealing: '딜링 중...',
    placed_bet: '베팅 완료',
    seat: '좌석',
    viewer: '관전자',
    tut_step1: '바카라는 플레이어와 뱅커 사이의 게임입니다. 2-9는 그대로, 10/J/Q/K = 0, A = 1입니다.',
    tut_step2: '각 핸드는 9 또는 가장 가까운 점수를 목표로 합니다. 총합의 마지막 자리수가 핸드 점수입니다.',
    tut_step3: '플레이어 승리, 뱅커 승리, 또는 타이에 베팅합니다. 특정 규칙에 따라 추가 카드가 나옵니다.',
    tut_step4: '배당: 플레이어 1:1, 뱅커 1:0.95(5% 수수료), 타이 8:1.',
    tut_step5: '각 핸드 전에 베팅하세요. 행운을 빕니다!',
    ach_first_win: '첫 승리',
    ach_wins_10: '워밍업',
    ach_wins_50: '하이 롤러',
    ach_wins_100: '전설',
    ach_streak_3: '핫 핸드',
    ach_streak_5: '불타는 중',
    ach_streak_10: '멈출 수 없음',
    ach_high_roller: '큰 지출',
    ach_tie_winner: '운 좋은 타이',
    ach_games_50: '50라운드',
    ach_games_200: '200라운드',
    ach_rich: '백만장자',
    mis_play_3: '3라운드 플레이',
    mis_win_2: '2승',
    mis_bet_1000: '총 1000 베팅',
    mis_streak_2: '2라운드 연승',
    mis_banker_bet: '뱅커에 한 번 베팅',
    mis_tie_bet: '타이에 한 번 베팅',
    good_luck: '행운을 빌어요!',
    nice_win: '멋진 승리!',
    wow: '와!',
    one_more: '한 번 더!',
    gg: 'GG',
    statistics: '통계',
    total_bets: '총 베팅',
    avg_bet: '평균 베팅',
    biggest_win: '최대 승리',
    biggest_loss: '최대 손실',
    favorite_bet: '선호 베팅',
    player_wins: '플레이어 승리',
    banker_wins: '뱅커 승리',
    tie_count: '타이 횟수',
    natural_count: '내추럴 횟수',
    road_map_big: '빅 로드',
    road_map_bead: '비드 로드',
    road_map_eye: '빅 아이 로드',
    quick_chat: '빠른 채팅',
    send_chat: '보내기',
    anim_slow: '느림',
    anim_normal: '보통',
    anim_fast: '빠름',
    anim_speed: '애니메이션 속도',
    auto_deal: '자동 딜',
    card_style: '카드 스타일',
    card_classic: '클래식',
    card_modern: '현대식',
    card_minimal: '미니멀',
    theme: '테마',
    theme_dark: '다크',
    theme_midnight: '미드나잇',
    theme_purple: '보라색',
    bankrupt: '파산',
    recovery: '복구',
    recovery_desc: '스타가 없습니다. 복구 옵션을 선택하세요:',
    watch_ad: '광고 보기',
    free_stars: '무료 스타',
    history: '히스토리',
    game_log: '게임 로그',
    round_detail: '라운드 상세',
    tut_title_1: '바카라에 오신 것을 환영합니다',
    tut_content_1: '바카라는 플레이어 또는 뱅커 중 누가 9에 더 가까운 손을 가질지 베팅하는 클래식 카드 게임입니다.',
    tut_title_2: '카드 가치',
    tut_content_2: '2-9는 그대로의 가치입니다. 10, J, Q, K는 0입니다. 에이스는 1입니다. 합의 마지막 자리수가 손의 합계입니다.',
    tut_title_3: '목표',
    tut_content_3: '9에 최대한 가까운 손을 만드세요. 처음 두 카드에서 8 또는 9는 내추럴이며 즉시 승리합니다.',
    tut_title_4: '딜링 규칙',
    tut_content_4: '플레이어와 뱅커 모두 2장의 카드로 시작합니다. 점수와 특정 규칙에 따라 3번째 카드가 나올 수 있습니다.',
    tut_title_5: '내추럴 승리',
    tut_content_5: '플레이어 또는 뱅커가 처음 두 카드에서 8 또는 9를 얻으면 그것이 내추럴이며 핸드가 종료됩니다.',
    tut_title_6: '플레이어 3번째 카드 규칙',
    tut_content_6: '플레이어는 0-5에서 카드를 가져가고 6-7에서 멈춥니다. 플레이어가 카드를 가져가면 3번째 카드 가치가 뱅커의 결정에 영향을 줍니다.',
    tut_title_7: '뱅커 3번째 카드 규칙',
    tut_content_7: '뱅커의 행동은 그들의 합계와 플레이어의 3번째 카드에 따라 달라집니다. 복잡한 규칙이 적용되므로 표를 참조하세요.',
    tut_title_8: '베팅 및 배당',
    tut_content_8: '플레이어(1:1), 뱅커(0.95:1), 또는 타이(8:1)에 베팅하세요. 각 핸드 전에 베팅하세요. 책임감 있게 플레이하세요!',
    session_stats: '세션 통계',
    this_session: '이 세션',
    pair: '페어',
    no_pair: '페어 없음',
    prev: '이전',
    next: '다음',
    start_game: '게임 시작',
    face_value: '액면가',
    banker_3rd_rule: '뱅커 3번째 카드 규칙',
    banker_score: '뱅커 점수',
    draws_on: '그릴 때',
    always_draws: '항상 그립니다',
    any_except: '다음 제외하고 모두',
    always_stands: '항상 멈춥니다',
    payouts: '배당',
    player_win: '플레이어 승리',
    banker_win: '뱅커 승리',
    current_streak: '현재 연승',
    total_wins: '총 승리',
    no_results: '아직 결과 없음',
    duration: '기간',
    net_change: '순 변화',
    game_reset: '게임이 재설정되었습니다! 통계가 초기화되었습니다.',
    place_bet_first: '먼저 베팅하세요',
    mission_complete: '미션 완료!',
    notifications: '알림',
    recovery_stars: '{n}개의 스타를 복구했습니다!'
  },
  ja: {
    app_title: 'FAバカラ',
    nav_home: 'ホーム',
    nav_rank: 'ランキング',
    nav_shop: 'ショップ',
    nav_mission: 'ミッション',
    nav_profile: 'プロフィール',
    play_ai: 'ディーラーとプレイ',
    play_online: 'オンラインテーブル',
    daily_checkin: '毎日チェックイン',
    stars: 'スター',
    level: 'レベル',
    wins: '勝利',
    streak: '連勝',
    best_streak: '最高連勝',
    deal: 'ディール',
    player: 'プレイヤー',
    banker: 'バンカー',
    tie: 'タイ',
    natural: 'ナチュラル',
    you_win: '勝利!',
    you_lose: '敗北',
    tie_push: 'プッシュ',
    not_enough: 'スターが足りません',
    settings: '設定',
    sound: '音',
    vibrate: '振動',
    language: '言語',
    total_rank: '総合ランキング',
    weekly_top: '週間トップ',
    last_week: '先週',
    shop_title: 'ショップ',
    avatars: 'アバター',
    tables: 'テーブル',
    card_backs: 'カードバック',
    equipped: '装備済み',
    equip: '装備',
    locked: 'ロック',
    purchase: '購入',
    missions_title: 'ミッション',
    daily_mission: '毎日のミッション',
    achievements: 'アチーブメント',
    profile: 'プロフィール',
    reset_stats: 'リセット',
    tutorial: 'チュートリアル',
    home: 'ホーム',
    confirm_reset: 'すべての統計をリセットしますか？ 取り消すことはできません。',
    ok: 'OK',
    cancel: 'キャンセル',
    claim: '獲得',
    room_code: 'ルームコード',
    create_room: 'ルーム作成',
    join_room: 'ルーム参加',
    wager: 'ハンドごとの賭け',
    waiting: 'プレイヤーを待機中...',
    ready: '準備完了',
    start: 'ゲーム開始',
    leave: '退出',
    players: 'プレイヤー',
    round_num: 'ラウンド',
    your_bet: 'あなたの賭け',
    no_bet: '賭けなし',
    win_rate: '勝率',
    total_games: 'トータルゲーム',
    bet_returned: 'ベット返金',
    continue_btn: '続ける',
    nickname: 'ニックネーム',
    save: '保存',
    online_table: 'オンラインテーブル',
    play_dealer: 'ディーラーとプレイ',
    casino: 'カジノ',
    premium: 'プレミアム',
    punto_banco: 'プント バンコ',
    ranking: 'ランキング',
    shop: 'ショップ',
    mission: 'ミッション',
    claim_reward: '報酬を獲得',
    daily_check: '毎日チェックイン',
    room_full: 'ルームが満杯です',
    room_not_found: 'ルームが見つかりません',
    already_in_room: 'すでにルーム内にいます',
    host_left: 'ホストが退出しました',
    you_left: 'ルームを退出しました',
    natural_win: 'ナチュラルウィン!',
    pair_bonus: 'ペアボーナス!',
    dealing: 'ディーリング中...',
    placed_bet: 'ベット完了',
    seat: 'シート',
    viewer: '観戦者',
    tut_step1: 'バカラはプレイヤーとバンカーの間のゲームです。2-9は額面通り、10/J/Q/K = 0、A = 1です。',
    tut_step2: '各ハンドは9またはそれに最も近い値を目指します。ハンド値はカード合計の最後の桁です。',
    tut_step3: 'プレイヤー勝ち、バンカー勝ち、またはタイに賭けます。特定のルールに従ってサードカードが引かれます。',
    tut_step4: '配当: プレイヤー1:1、バンカー1:0.95(5%手数料)、タイ8:1。',
    tut_step5: '各ハンド前に賭けてください。頑張ってください!',
    ach_first_win: '初勝利',
    ach_wins_10: 'ウォーミングアップ',
    ach_wins_50: 'ハイローラー',
    ach_wins_100: 'レジェンド',
    ach_streak_3: 'ホットハンド',
    ach_streak_5: '燃えてる',
    ach_streak_10: '止められない',
    ach_high_roller: 'ビッグスペンダー',
    ach_tie_winner: 'ラッキータイ',
    ach_games_50: '50ラウンド',
    ach_games_200: '200ラウンド',
    ach_rich: 'ミリオネア',
    mis_play_3: '3ハンドプレイ',
    mis_win_2: '2勝',
    mis_bet_1000: '合計1000ベット',
    mis_streak_2: '2ハンド連勝',
    mis_banker_bet: 'バンカーに1回ベット',
    mis_tie_bet: 'タイに1回ベット',
    good_luck: '幸運を祈る!',
    nice_win: 'すごい勝利!',
    wow: 'わお!',
    one_more: 'もう一度!',
    gg: 'GG',
    statistics: '統計',
    total_bets: '総ベット',
    avg_bet: '平均ベット',
    biggest_win: '最大勝利',
    biggest_loss: '最大損失',
    favorite_bet: '好みのベット',
    player_wins: 'プレイヤー勝利',
    banker_wins: 'バンカー勝利',
    tie_count: 'タイ数',
    natural_count: 'ナチュラル数',
    road_map_big: 'ビッグロード',
    road_map_bead: 'ビードロード',
    road_map_eye: 'ビッグアイロード',
    quick_chat: 'クイックチャット',
    send_chat: '送信',
    anim_slow: '遅い',
    anim_normal: '通常',
    anim_fast: '速い',
    anim_speed: 'アニメーション速度',
    auto_deal: '自動ディール',
    card_style: 'カードスタイル',
    card_classic: 'クラシック',
    card_modern: 'モダン',
    card_minimal: 'ミニマル',
    theme: 'テーマ',
    theme_dark: 'ダーク',
    theme_midnight: 'ミッドナイト',
    theme_purple: 'パープル',
    bankrupt: '破産',
    recovery: '回復',
    recovery_desc: 'スターがありません。回復オプションを選択してください:',
    watch_ad: '広告を見る',
    free_stars: '無料スター',
    history: '履歴',
    game_log: 'ゲームログ',
    round_detail: 'ラウンド詳細',
    tut_title_1: 'バカラへようこそ',
    tut_content_1: 'バカラはプレイヤーまたはバンカーのどちらが9に近い手を持つかに賭ける古典的なカードゲームです。',
    tut_title_2: 'カード値',
    tut_content_2: 'カード2-9は額面通りです。10、J、Q、Kは0です。エースは1です。ハンド合計は合計の最後の桁です。',
    tut_title_3: '目的',
    tut_content_3: '9に最も近い手を作ってください。最初の2枚のカードで8または9はナチュラルで即座に勝ちます。',
    tut_title_4: 'ディーリングルール',
    tut_content_4: 'プレイヤーとバンカーは両方とも2枚のカードで始まります。スコアと特定のルールに応じて、3番目のカードが引かれる場合があります。',
    tut_title_5: 'ナチュラル勝利',
    tut_content_5: 'プレイヤーまたはバンカーが最初の2枚のカードで8または9を取得すると、それはナチュラルで手が終了します。',
    tut_title_6: 'プレイヤー3枚目ルール',
    tut_content_6: 'プレイヤーは0-5で引き、6-7で立ちます。プレイヤーが引く場合、3番目のカード値はバンカーの決定に影響します。',
    tut_title_7: 'バンカー3枚目ルール',
    tut_content_7: 'バンカーのアクションは彼らの合計とプレイヤーの3枚目のカードに基づきます。複雑なルールが適用されます - 詳細は表を参照してください。',
    tut_title_8: 'ベットと配当',
    tut_content_8: 'プレイヤー(1:1)、バンカー(0.95:1)、またはタイ(8:1)に賭けてください。各ハンド前にベットしてください。責任を持ってプレイしてください!',
    session_stats: 'セッション統計',
    this_session: 'このセッション',
    pair: 'ペア',
    no_pair: 'ペアなし',
    prev: '前へ',
    next: '次へ',
    start_game: 'ゲーム開始',
    face_value: '額面',
    banker_3rd_rule: 'バンカー3枚目ルール',
    banker_score: 'バンカースコア',
    draws_on: '引く',
    always_draws: '常に引く',
    any_except: '以下を除く任意',
    always_stands: '常に立つ',
    payouts: '配当',
    player_win: 'プレイヤー勝利',
    banker_win: 'バンカー勝利',
    current_streak: '現在の連勝',
    total_wins: '総勝利',
    no_results: 'まだ結果がありません',
    duration: '期間',
    net_change: '純変化',
    game_reset: 'ゲームがリセットされました! 統計がクリアされました。',
    place_bet_first: 'まず賭けてください',
    mission_complete: 'ミッション完了!',
    notifications: '通知',
    recovery_stars: '{n}個のスターを復旧しました!'
  },
  zh: {
    app_title: 'FA百家乐',
    nav_home: '首页',
    nav_rank: '排名',
    nav_shop: '商店',
    nav_mission: '任务',
    nav_profile: '个人资料',
    play_ai: '对阵庄家',
    play_online: '在线桌',
    daily_checkin: '每日签到',
    stars: '星',
    level: '级别',
    wins: '胜利',
    streak: '连胜',
    best_streak: '最高连胜',
    deal: '发牌',
    player: '闲家',
    banker: '庄家',
    tie: '和',
    natural: '天生赢家',
    you_win: '你赢了!',
    you_lose: '你输了',
    tie_push: '平手',
    not_enough: '星数不足',
    settings: '设置',
    sound: '声音',
    vibrate: '振动',
    language: '语言',
    total_rank: '总排名',
    weekly_top: '周排名',
    last_week: '上周',
    shop_title: '商店',
    avatars: '头像',
    tables: '赌桌',
    card_backs: '卡片背面',
    equipped: '已装备',
    equip: '装备',
    locked: '已锁定',
    purchase: '购买',
    missions_title: '任务',
    daily_mission: '每日任务',
    achievements: '成就',
    profile: '个人资料',
    reset_stats: '重置统计',
    tutorial: '教程',
    home: '首页',
    confirm_reset: '重置所有统计数据？无法撤销。',
    ok: '确定',
    cancel: '取消',
    claim: '领取',
    room_code: '房间代码',
    create_room: '创建房间',
    join_room: '加入房间',
    wager: '每局下注',
    waiting: '等待玩家...',
    ready: '准备就绪',
    start: '开始游戏',
    leave: '离开',
    players: '玩家',
    round_num: '轮次',
    your_bet: '你的下注',
    no_bet: '无下注',
    win_rate: '胜率',
    total_games: '总局数',
    bet_returned: '返还下注',
    continue_btn: '继续',
    nickname: '昵称',
    save: '保存',
    online_table: '在线桌',
    play_dealer: '对阵庄家',
    casino: '赌场',
    premium: '高级',
    punto_banco: 'Punto Banco',
    ranking: '排名',
    shop: '商店',
    mission: '任务',
    claim_reward: '领取奖励',
    daily_check: '每日签到',
    room_full: '房间已满',
    room_not_found: '找不到房间',
    already_in_room: '已在房间内',
    host_left: '主持人已离开',
    you_left: '你已离开房间',
    natural_win: '天然胜利!',
    pair_bonus: '对子奖励!',
    dealing: '发牌中...',
    placed_bet: '已下注',
    seat: '座位',
    viewer: '观看者',
    tut_step1: '百家乐是闲家和庄家之间的游戏。牌2-9按点数计，10/J/Q/K = 0，A = 1。',
    tut_step2: '每手牌的目标是达到9或最接近9。牌值是总数的个位数。',
    tut_step3: '下注闲家胜、庄家胜或和。根据特定规则决定是否补第三张牌。',
    tut_step4: '赔率: 闲家1:1，庄家1:0.95(5%佣金)，和8:1。',
    tut_step5: '在每局开始前下注。祝好运!',
    ach_first_win: '首次获胜',
    ach_wins_10: '热身中',
    ach_wins_50: '高额玩家',
    ach_wins_100: '传奇',
    ach_streak_3: '热手气',
    ach_streak_5: '火热状态',
    ach_streak_10: '势不可挡',
    ach_high_roller: '大手笔',
    ach_tie_winner: '幸运和',
    ach_games_50: '50局',
    ach_games_200: '200局',
    ach_rich: '百万富翁',
    mis_play_3: '玩3局',
    mis_win_2: '赢2局',
    mis_bet_1000: '总下注1000',
    mis_streak_2: '2局连胜',
    mis_banker_bet: '下注庄家一次',
    mis_tie_bet: '下注和一次',
    good_luck: '祝你好运!',
    nice_win: '漂亮的胜利!',
    wow: '哇!',
    one_more: '再来一次!',
    gg: 'GG',
    statistics: '统计',
    total_bets: '总下注',
    avg_bet: '平均下注',
    biggest_win: '最大赢利',
    biggest_loss: '最大损失',
    favorite_bet: '偏好下注',
    player_wins: '闲家胜利',
    banker_wins: '庄家胜利',
    tie_count: '和局数',
    natural_count: '天然数',
    road_map_big: '大路',
    road_map_bead: '珠盘路',
    road_map_eye: '大眼仔路',
    quick_chat: '快速聊天',
    send_chat: '发送',
    anim_slow: '缓慢',
    anim_normal: '正常',
    anim_fast: '快速',
    anim_speed: '动画速度',
    auto_deal: '自动发牌',
    card_style: '卡牌样式',
    card_classic: '经典',
    card_modern: '现代',
    card_minimal: '极简',
    theme: '主题',
    theme_dark: '深色',
    theme_midnight: '午夜',
    theme_purple: '紫色',
    bankrupt: '破产',
    recovery: '恢复',
    recovery_desc: '你的星星已用完。选择一个恢复选项:',
    watch_ad: '观看广告',
    free_stars: '免费星星',
    history: '历史',
    game_log: '游戏日志',
    round_detail: '回合详情',
    tut_title_1: '欢迎来到百家乐',
    tut_content_1: '百家乐是一种经典纸牌游戏,你可以猜测闲家或庄家谁的手牌更接近9。',
    tut_title_2: '卡牌价值',
    tut_content_2: '2-9的价值等于其面值。10、J、Q、K价值为0。A价值为1。手牌总数是总和的最后一位。',
    tut_title_3: '目标',
    tut_content_3: '获得尽可能接近9的手牌。前两张牌中的8或9称为天然,立即获胜。',
    tut_title_4: '发牌规则',
    tut_content_4: '闲家和庄家都从2张卡开始。根据点数和特定规则,可能会抽取第三张卡。',
    tut_title_5: '天然胜利',
    tut_content_5: '如果闲家或庄家的前两张卡是8或9,那就是天然,手牌游戏结束。',
    tut_title_6: '闲家第三张牌规则',
    tut_content_6: '闲家在0-5时抽牌,在6-7时停牌。如果闲家抽牌,第三张牌的价值会影响庄家的决定。',
    tut_title_7: '庄家第三张牌规则',
    tut_content_7: '庄家的行动取决于其总数和闲家的第三张牌。适用复杂规则 - 详见表格。',
    tut_title_8: '下注和赔付',
    tut_content_8: '在闲家(1:1)、庄家(0.95:1)或和(8:1)上下注。在每手前下注。负责任地游戏!',
    session_stats: '会话统计',
    this_session: '本会话',
    pair: '对子',
    no_pair: '无对子',
    prev: '上一个',
    next: '下一个',
    start_game: '开始游戏',
    face_value: '面值',
    banker_3rd_rule: '庄家第三张牌规则',
    banker_score: '庄家点数',
    draws_on: '抽取',
    always_draws: '总是抽取',
    any_except: '任何除外',
    always_stands: '总是停牌',
    payouts: '赔付',
    player_win: '闲家胜利',
    banker_win: '庄家胜利',
    current_streak: '当前连胜',
    total_wins: '总胜利',
    no_results: '还没有结果',
    duration: '持续时间',
    net_change: '净变化',
    game_reset: '游戏已重置!统计已清除。',
    place_bet_first: '先下注',
    mission_complete: '任务完成!',
    notifications: '通知',
    recovery_stars: '恢复了{n}个星星!'
  },
  vi: {
    app_title: 'FA Baccarat',
    nav_home: 'Trang chủ',
    nav_rank: 'Xếp hạng',
    nav_shop: 'Cửa hàng',
    nav_mission: 'Nhiệm vụ',
    nav_profile: 'Hồ sơ',
    play_ai: 'Chơi với Dealer',
    play_online: 'Bàn trực tuyến',
    daily_checkin: 'Điểm danh hàng ngày',
    stars: 'Sao',
    level: 'Cấp độ',
    wins: 'Chiến thắng',
    streak: 'Chuỗi thắng',
    best_streak: 'Chuỗi thắng tốt nhất',
    deal: 'Deal',
    player: 'Người chơi',
    banker: 'Nhà cái',
    tie: 'Hòa',
    natural: 'Tự nhiên',
    you_win: 'Bạn thắng!',
    you_lose: 'Bạn thua',
    tie_push: 'Hòa',
    not_enough: 'Không đủ sao',
    settings: 'Cài đặt',
    sound: 'Âm thanh',
    vibrate: 'Rung',
    language: 'Ngôn ngữ',
    total_rank: 'Xếp hạng tổng thể',
    weekly_top: 'Top hàng tuần',
    last_week: 'Tuần trước',
    shop_title: 'Cửa hàng',
    avatars: 'Avatar',
    tables: 'Bàn',
    card_backs: 'Lưng bài',
    equipped: 'Đã trang bị',
    equip: 'Trang bị',
    locked: 'Khóa',
    purchase: 'Mua',
    missions_title: 'Nhiệm vụ',
    daily_mission: 'Nhiệm vụ hàng ngày',
    achievements: 'Thành tích',
    profile: 'Hồ sơ',
    reset_stats: 'Đặt lại thống kê',
    tutorial: 'Hướng dẫn',
    home: 'Trang chủ',
    confirm_reset: 'Đặt lại tất cả thống kê? Không thể hoàn tác.',
    ok: 'OK',
    cancel: 'Hủy bỏ',
    claim: 'Nhận',
    room_code: 'Mã phòng',
    create_room: 'Tạo phòng',
    join_room: 'Tham gia phòng',
    wager: 'Cược mỗi ván',
    waiting: 'Đợi người chơi...',
    ready: 'Sẵn sàng',
    start: 'Bắt đầu trò chơi',
    leave: 'Rời đi',
    players: 'Người chơi',
    round_num: 'Vòng',
    your_bet: 'Cược của bạn',
    no_bet: 'Không cược',
    win_rate: 'Tỷ lệ thắng',
    total_games: 'Tổng trò chơi',
    bet_returned: 'Cược được hoàn lại',
    continue_btn: 'Tiếp tục',
    nickname: 'Biệt danh',
    save: 'Lưu',
    online_table: 'Bàn trực tuyến',
    play_dealer: 'Chơi với Dealer',
    casino: 'Sòng bạc',
    premium: 'Cao cấp',
    punto_banco: 'Punto Banco',
    ranking: 'Xếp hạng',
    shop: 'Cửa hàng',
    mission: 'Nhiệm vụ',
    claim_reward: 'Nhận phần thưởng',
    daily_check: 'Điểm danh hàng ngày',
    room_full: 'Phòng đã đầy',
    room_not_found: 'Không tìm thấy phòng',
    already_in_room: 'Đã ở trong phòng',
    host_left: 'Chủ nhân đã rời đi',
    you_left: 'Bạn đã rời khỏi phòng',
    natural_win: 'Thắng tự nhiên!',
    pair_bonus: 'Thưởng cặp!',
    dealing: 'Đang chia bài...',
    placed_bet: 'Đã đặt cược',
    seat: 'Chỗ ngồi',
    viewer: 'Người xem',
    tut_step1: 'Baccarat được chơi giữa Người chơi và Nhà cái. Bài 2-9 có giá trị mặt, 10/J/Q/K = 0, A = 1.',
    tut_step2: 'Mỗi bàn tay cố gắng đạt 9 hoặc gần nhất. Giá trị bàn tay là chữ số cuối cùng của tổng bài.',
    tut_step3: 'Bạn cược vào chiến thắng của Người chơi, chiến thắng của Nhà cái, hoặc Hòa. Bài thứ ba được chia nếu cần.',
    tut_step4: 'Tỷ lệ trả thưởng: Người chơi 1:1, Nhà cái 1:0.95 (hoa hồng 5%), Hòa 8:1.',
    tut_step5: 'Đặt cược trước mỗi ván. Chúc bạn may mắn!',
    ach_first_win: 'Chiến thắng đầu tiên',
    ach_wins_10: 'Khởi động',
    ach_wins_50: 'Người chơi cao cấp',
    ach_wins_100: 'Huyền thoại',
    ach_streak_3: 'Tay nóng',
    ach_streak_5: 'Đang bốc lên',
    ach_streak_10: 'Không thể dừng',
    ach_high_roller: 'Người chi lớn',
    ach_tie_winner: 'Hòa may mắn',
    ach_games_50: '50 ván',
    ach_games_200: '200 ván',
    ach_rich: 'Triệu phú',
    mis_play_3: 'Chơi 3 ván',
    mis_win_2: 'Thắng 2 ván',
    mis_bet_1000: 'Cược tổng cộng 1000',
    mis_streak_2: 'Chuỗi 2 ván thắng',
    mis_banker_bet: 'Cược vào Nhà cái một lần',
    mis_tie_bet: 'Cược vào Hòa một lần',
    good_luck: 'Chúc bạn may mắn!',
    nice_win: 'Chiến thắng tuyệt vời!',
    wow: 'Wow!',
    one_more: 'Một ván nữa!',
    gg: 'GG',
    statistics: 'Thống kê',
    total_bets: 'Tổng cược',
    avg_bet: 'Cược trung bình',
    biggest_win: 'Chiến thắng lớn nhất',
    biggest_loss: 'Thua lỗ lớn nhất',
    favorite_bet: 'Cược yêu thích',
    player_wins: 'Chiến thắng người chơi',
    banker_wins: 'Chiến thắng nhà cái',
    tie_count: 'Số hòa',
    natural_count: 'Số tự nhiên',
    road_map_big: 'Đường lớn',
    road_map_bead: 'Đường hạt',
    road_map_eye: 'Đường mắt lớn',
    quick_chat: 'Trò chuyện nhanh',
    send_chat: 'Gửi',
    anim_slow: 'Chậm',
    anim_normal: 'Bình thường',
    anim_fast: 'Nhanh',
    anim_speed: 'Tốc độ hoạt hình',
    auto_deal: 'Tự động chia bài',
    card_style: 'Kiểu bài',
    card_classic: 'Cổ điển',
    card_modern: 'Hiện đại',
    card_minimal: 'Tối giản',
    theme: 'Chủ đề',
    theme_dark: 'Tối',
    theme_midnight: 'Nửa đêm',
    theme_purple: 'Tím',
    bankrupt: 'Phá sản',
    recovery: 'Khôi phục',
    recovery_desc: 'Sao của bạn đã hết. Chọn một tùy chọn khôi phục:',
    watch_ad: 'Xem quảng cáo',
    free_stars: 'Sao miễn phí',
    history: 'Lịch sử',
    game_log: 'Nhật ký trò chơi',
    round_detail: 'Chi tiết vòng',
    tut_title_1: 'Chào mừng đến Baccarat',
    tut_content_1: 'Baccarat là một trò chơi thẻ cổ điển nơi bạn cược xem Người chơi hay Nhà cái sẽ có bộ bài gần với 9 hơn.',
    tut_title_2: 'Giá trị thẻ',
    tut_content_2: 'Thẻ 2-9 có giá trị mặt. 10, J, Q, K có giá trị 0. A có giá trị 1. Tổng bàn tay là chữ số cuối cùng của tổng.',
    tut_title_3: 'Mục tiêu',
    tut_content_3: 'Có được bộ bài gần với 9 nhất. 8 hoặc 9 trên hai thẻ đầu tiên được gọi là Tự nhiên và thắng ngay lập tức.',
    tut_title_4: 'Quy tắc chia bài',
    tut_content_4: 'Cả Người chơi và Nhà cái đều bắt đầu với 2 thẻ. Có thể rút thẻ thứ ba tùy thuộc vào điểm và quy tắc cụ thể.',
    tut_title_5: 'Chiến thắng tự nhiên',
    tut_content_5: 'Nếu Người chơi hoặc Nhà cái nhận được 8 hoặc 9 với hai thẻ đầu tiên, đó là Tự nhiên và ván kết thúc.',
    tut_title_6: 'Quy tắc thẻ thứ 3 của Người chơi',
    tut_content_6: 'Người chơi rút trên 0-5, đứng trên 6-7. Nếu Người chơi rút, giá trị thẻ thứ 3 ảnh hưởng đến quyết định của Nhà cái.',
    tut_title_7: 'Quy tắc thẻ thứ 3 của Nhà cái',
    tut_content_7: 'Hành động của Nhà cái phụ thuộc vào tổng của họ và thẻ thứ 3 của Người chơi. Các quy tắc phức tạp áp dụng - xem bảng để biết chi tiết.',
    tut_title_8: 'Cược và thanh toán',
    tut_content_8: 'Cược trên Người chơi (1:1), Nhà cái (0.95:1), hoặc Hòa (8:1). Đặt cược trước mỗi ván. Chơi có trách nhiệm!',
    session_stats: 'Thống kê phiên',
    this_session: 'Phiên này',
    pair: 'Cặp',
    no_pair: 'Không có cặp',
    prev: 'Trước',
    next: 'Tiếp theo',
    start_game: 'Bắt đầu trò chơi',
    face_value: 'Giá trị mặt',
    banker_3rd_rule: 'Quy tắc thẻ thứ 3 của Nhà cái',
    banker_score: 'Điểm nhà cái',
    draws_on: 'Rút trên',
    always_draws: 'Luôn rút',
    any_except: 'Bất kỳ ngoại trừ',
    always_stands: 'Luôn đứng',
    payouts: 'Thanh toán',
    player_win: 'Thắng người chơi',
    banker_win: 'Thắng nhà cái',
    current_streak: 'Chuỗi hiện tại',
    total_wins: 'Tổng chiến thắng',
    no_results: 'Chưa có kết quả',
    duration: 'Thời lượng',
    net_change: 'Thay đổi ròng',
    game_reset: 'Trò chơi đã được đặt lại! Thống kê đã bị xóa.',
    place_bet_first: 'Đặt cược trước',
    mission_complete: 'Hoàn thành nhiệm vụ!',
    notifications: 'Thông báo',
    recovery_stars: 'Đã khôi phục {n} sao!'
  },
  th: {
    app_title: 'FA บาคาร่า',
    nav_home: 'หน้าแรก',
    nav_rank: 'อันดับ',
    nav_shop: 'ร้านค้า',
    nav_mission: 'ภารกิจ',
    nav_profile: 'โปรไฟล์',
    play_ai: 'เล่นกับดีลเลอร์',
    play_online: 'โต๊ะออนไลน์',
    daily_checkin: 'เช็คอินรายวัน',
    stars: 'ดาว',
    level: 'ระดับ',
    wins: 'ชัยชนะ',
    streak: 'ชุดชนะต่อเนื่อง',
    best_streak: 'ชุดชนะสูงสุด',
    deal: 'แจก',
    player: 'ผู้เล่น',
    banker: 'เจ้ามือ',
    tie: 'เสมอ',
    natural: 'เนเชอรัล',
    you_win: 'คุณชนะ!',
    you_lose: 'คุณแพ้',
    tie_push: 'เสมอ',
    not_enough: 'ดาวไม่เพียงพอ',
    settings: 'การตั้งค่า',
    sound: 'เสียง',
    vibrate: 'การสั่นสะเทือน',
    language: 'ภาษา',
    total_rank: 'อันดับรวม',
    weekly_top: 'สัปดาห์นี้',
    last_week: 'สัปดาห์ที่แล้ว',
    shop_title: 'ร้านค้า',
    avatars: 'อวาตาร์',
    tables: 'โต๊ะ',
    card_backs: 'หลังไพ่',
    equipped: 'ติดตั้งแล้ว',
    equip: 'ติดตั้ง',
    locked: 'ล็อก',
    purchase: 'ซื้อ',
    missions_title: 'ภารกิจ',
    daily_mission: 'ภารกิจรายวัน',
    achievements: 'สิ่งที่ประสบความสำเร็จ',
    profile: 'โปรไฟล์',
    reset_stats: 'รีเซ็ต',
    tutorial: 'บทช่วยสอน',
    home: 'หน้าแรก',
    confirm_reset: 'รีเซ็ตสถิติทั้งหมดหรือไม่ ไม่สามารถเลิกทำได้',
    ok: 'ตกลง',
    cancel: 'ยกเลิก',
    claim: 'รับ',
    room_code: 'รหัสห้อง',
    create_room: 'สร้างห้อง',
    join_room: 'เข้าร่วมห้อง',
    wager: 'เดิมพันต่อมือ',
    waiting: 'รอผู้เล่น...',
    ready: 'พร้อม',
    start: 'เริ่มเกม',
    leave: 'ออก',
    players: 'ผู้เล่น',
    round_num: 'รอบ',
    your_bet: 'เดิมพันของคุณ',
    no_bet: 'ไม่มีเดิมพัน',
    win_rate: 'อัตราชนะ',
    total_games: 'เกมทั้งหมด',
    bet_returned: 'เดิมพันคืน',
    continue_btn: 'ดำเนินการต่อ',
    nickname: 'ชื่อเล่น',
    save: 'บันทึก',
    online_table: 'โต๊ะออนไลน์',
    play_dealer: 'เล่นกับดีลเลอร์',
    casino: 'คาสิโน',
    premium: 'พรีเมียม',
    punto_banco: 'Punto Banco',
    ranking: 'อันดับ',
    shop: 'ร้านค้า',
    mission: 'ภารกิจ',
    claim_reward: 'รับรางวัล',
    daily_check: 'เช็คอินรายวัน',
    room_full: 'ห้องเต็ม',
    room_not_found: 'ไม่พบห้อง',
    already_in_room: 'อยู่ในห้องแล้ว',
    host_left: 'เจ้าภาพออกไป',
    you_left: 'คุณออกจากห้องแล้ว',
    natural_win: 'ชัยชนะเนเชอรัล!',
    pair_bonus: 'โบนัสคู่!',
    dealing: 'แจกใบ...',
    placed_bet: 'เดิมพันแล้ว',
    seat: 'ที่นั่ง',
    viewer: 'ผู้ชม',
    tut_step1: 'บาคาร่าเล่นระหว่างผู้เล่นและเจ้ามือ ไพ่ 2-9 มีค่าตามหน้าไพ่ 10/J/Q/K = 0 A = 1',
    tut_step2: 'มือไพ่แต่ละมือพยายามให้ได้ 9 หรือใกล้เคียงที่สุด ค่ามือคือตัวเลขหลักสุดท้ายของผลรวม',
    tut_step3: 'คุณเดิมพันชัยชนะของผู้เล่น เจ้ามือ หรือเสมอ ไพ่ใบที่สามจะแจกตามกฎ',
    tut_step4: 'การจ่ายเงิน: ผู้เล่น 1:1 เจ้ามือ 1:0.95 (ค่าคำมิชชั่น 5%) เสมอ 8:1',
    tut_step5: 'เดิมพันก่อนมือไพ่แต่ละมือ โชคดี!',
    ach_first_win: 'ชัยชนะครั้งแรก',
    ach_wins_10: 'อุ่นเครื่อง',
    ach_wins_50: 'ผู้เล่นสูง',
    ach_wins_100: 'ตำนาน',
    ach_streak_3: 'มือร้อน',
    ach_streak_5: 'ร้อนแรง',
    ach_streak_10: 'หยุดไม่ได้',
    ach_high_roller: 'ผู้ใช้เงินจำนวนมาก',
    ach_tie_winner: 'เสมอโชคดี',
    ach_games_50: '50 รอบ',
    ach_games_200: '200 รอบ',
    ach_rich: 'เศรษฐี',
    mis_play_3: 'เล่น 3 มือ',
    mis_win_2: 'ชนะ 2 มือ',
    mis_bet_1000: 'เดิมพันรวม 1000',
    mis_streak_2: 'ชุดชนะ 2 มือ',
    mis_banker_bet: 'เดิมพันเจ้ามือครั้งหนึ่ง',
    mis_tie_bet: 'เดิมพันเสมอครั้งหนึ่ง',
    good_luck: 'ขอให้โชคดี!',
    nice_win: 'ชนะดีมาก!',
    wow: 'ว้าว!',
    one_more: 'อีกรอบหนึ่ง!',
    gg: 'GG',
    statistics: 'สถิติ',
    total_bets: 'ทั้งหมดเดิมพัน',
    avg_bet: 'เดิมพันเฉลี่ย',
    biggest_win: 'ชนะมากที่สุด',
    biggest_loss: 'แพ้มากที่สุด',
    favorite_bet: 'เดิมพันที่ชอบ',
    player_wins: 'ชนะผู้เล่น',
    banker_wins: 'ชนะเจ้ามือ',
    tie_count: 'จำนวนเสมอ',
    natural_count: 'จำนวนธรรมชาติ',
    road_map_big: 'บิ๊กโรด',
    road_map_bead: 'บีดโรด',
    road_map_eye: 'บิ๊กอายโรด',
    quick_chat: 'แชทด่วน',
    send_chat: 'ส่ง',
    anim_slow: 'ช้า',
    anim_normal: 'ปกติ',
    anim_fast: 'เร็ว',
    anim_speed: 'ความเร็วภาพเคลื่อนไหว',
    auto_deal: 'แจกอัตโนมัติ',
    card_style: 'สไตล์การ์ด',
    card_classic: 'คลาสสิก',
    card_modern: 'สมัยใหม่',
    card_minimal: 'มินิมัล',
    theme: 'ธีม',
    theme_dark: 'มืด',
    theme_midnight: 'เที่ยงคืน',
    theme_purple: 'สีม่วง',
    bankrupt: 'ล้มละลาย',
    recovery: 'การกู้คืน',
    recovery_desc: 'ดาวของคุณหมดแล้ว เลือกตัวเลือกการกู้คืน:',
    watch_ad: 'ดูโฆษณา',
    free_stars: 'ดาวฟรี',
    history: 'ประวัติ',
    game_log: 'บันทึกเกม',
    round_detail: 'รายละเอียดรอบ',
    tut_title_1: 'ยินดีต้อนรับสู่บาคาร่า',
    tut_content_1: 'บาคาร่าเป็นเกมไพ่แบบคลาสสิกที่คุณเดิมพันว่าผู้เล่นหรือเจ้ามือจะมีแต้มใกล้ 9 มากกว่า',
    tut_title_2: 'ค่าของการ์ด',
    tut_content_2: 'การ์ด 2-9 มีค่าตามหน้าเท่ากัน 10, J, Q, K มีค่า 0 Ace มีค่า 1 ทั้งหมดของมือคือตัวเลขตัวสุดท้ายของผลรวม',
    tut_title_3: 'วัตถุประสงค์',
    tut_content_3: 'ได้แต้มของมือให้ใกล้เคียง 9 ที่สุด 8 หรือ 9 ในสองการ์ดแรกเรียกว่าธรรมชาติและชนะทันที',
    tut_title_4: 'กฎการแจก',
    tut_content_4: 'ผู้เล่นและเจ้ามือเริ่มต้นด้วย 2 การ์ด ปมการ์ดที่สามอาจถูกจั่วขึ้นอยู่กับแต้มและกฎเฉพาะ',
    tut_title_5: 'ชนะโดยธรรมชาติ',
    tut_content_5: 'หากผู้เล่นหรือเจ้ามือได้ 8 หรือ 9 ด้วยสองการ์ดแรกนั่นคือธรรมชาติและมือสิ้นสุดลง',
    tut_title_6: 'กฎการ์ดที่สามของผู้เล่น',
    tut_content_6: 'ผู้เล่นจั่วบน 0-5 ยืนบน 6-7 หากผู้เล่นจั่ว ค่าการ์ดที่สามส่งผลต่อการตัดสินใจของเจ้ามือ',
    tut_title_7: 'กฎการ์ดที่สามของเจ้ามือ',
    tut_content_7: 'การกระทำของเจ้ามือขึ้นอยู่กับทั้งหมดของพวกเขาและการ์ดที่สามของผู้เล่น นำใช้กฎที่ซับซ้อน - ดูตารางสำหรับรายละเอียด',
    tut_title_8: 'การเดิมพันและการจ่ายเงิน',
    tut_content_8: 'เดิมพันบนผู้เล่น (1:1) เจ้ามือ (0.95:1) หรือเสมอ (8:1) วางเดิมพันก่อนแต่ละมือ เล่นอย่างมีความรับผิดชอบ!',
    session_stats: 'สถิติเซッション',
    this_session: 'เซสชั่นนี้',
    pair: 'คู่',
    no_pair: 'ไม่มีคู่',
    prev: 'ก่อนหน้า',
    next: 'ถัดไป',
    start_game: 'เริ่มเกม',
    face_value: 'มูลค่าหน้า',
    banker_3rd_rule: 'กฎการ์ดที่สามของเจ้ามือ',
    banker_score: 'คะแนนเจ้ามือ',
    draws_on: 'จั่วบน',
    always_draws: 'จั่วเสมอ',
    any_except: 'ใดๆ ยกเว้น',
    always_stands: 'ยืนเสมอ',
    payouts: 'การจ่ายเงิน',
    player_win: 'ชนะผู้เล่น',
    banker_win: 'ชนะเจ้ามือ',
    current_streak: 'สตรีคปัจจุบัน',
    total_wins: 'ชนะทั้งหมด',
    no_results: 'ยังไม่มีผลลัพธ์',
    duration: 'ระยะเวลา',
    net_change: 'การเปลี่ยนแปลงสุทธิ',
    game_reset: 'รีเซ็ตเกม! สถิติลบออก',
    place_bet_first: 'วางเดิมพันก่อน',
    mission_complete: 'ภารกิจสำเร็จ!',
    notifications: 'การแจ้งเตือน',
    recovery_stars: 'กู้คืน {n} ดาว!'
  }
};

const CSS = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #d4af37;
  --primary-light: #f0c850;
  --dark-bg: #0a0e17;
  --card-bg: #1a1f3a;
  --text-primary: #ffffff;
  --text-secondary: #b0b8c1;
  --success: #4ade80;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
  --spacing: 16px;
  --radius: 12px;
  --radius-lg: 20px;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, var(--dark-bg) 0%, #1a1f3a 100%);
  color: var(--text-primary);
}

#kk-root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  max-width: 480px;
  margin: 0 auto;
  background: linear-gradient(135deg, var(--dark-bg) 0%, var(--card-bg) 100%);
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.8);
  border-radius: 0;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}

.screen {
  display: none;
  flex: 1;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.screen.active {
  display: flex;
  opacity: 1;
  z-index: 10;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing);
  background: rgba(26, 31, 58, 0.9);
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  backdrop-filter: blur(10px);
  gap: var(--spacing);
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.topbar-center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.topbar-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-light);
  text-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
}

.topbar-icon {
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.topbar-icon:active {
  background: rgba(212, 175, 55, 0.2);
  transform: scale(0.95);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid var(--primary);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-light);
}

.pill.silver {
  background: rgba(176, 184, 193, 0.1);
  border-color: var(--text-secondary);
  color: var(--text-secondary);
}

.pill.gold {
  background: rgba(212, 175, 55, 0.15);
  border-color: var(--primary);
  color: var(--primary-light);
}

.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  padding: var(--spacing);
  -webkit-overflow-scrolling: touch;
}

.content-area::-webkit-scrollbar {
  width: 4px;
}

.content-area::-webkit-scrollbar-track {
  background: transparent;
}

.content-area::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.4);
  border-radius: 2px;
}

.footer-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  background: rgba(26, 31, 58, 0.95);
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  flex-shrink: 0;
  gap: 4px;
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
}

.nav-btn.active {
  color: var(--primary-light);
}

.nav-btn > span:first-child {
  font-size: 20px;
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing);
  margin: var(--spacing) 0;
}

.stat-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: var(--radius);
  padding: var(--spacing);
  text-align: center;
  transition: all 0.2s ease;
}

.stat-item:active {
  background: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.3);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-light);
  text-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
}

.daily-checkin {
  background: linear-gradient(135deg, rgba(78, 222, 255, 0.1) 0%, rgba(212, 175, 55, 0.08) 100%);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: var(--radius-lg);
  padding: var(--spacing);
  margin-bottom: var(--spacing);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing);
}

.daily-checkin-icon {
  font-size: 32px;
  animation: pulse 2s ease-in-out infinite;
}

.daily-checkin-content {
  flex: 1;
}

.daily-checkin-title {
  font-weight: 600;
  color: var(--primary-light);
  margin-bottom: 4px;
}

.daily-checkin-reward {
  font-size: 12px;
  color: var(--text-secondary);
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  color: #000;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.btn-primary:active {
  transform: translateY(2px);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
}

.btn-secondary {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid var(--primary);
  color: var(--primary-light);
}

.btn-secondary:active {
  background: rgba(212, 175, 55, 0.2);
}

.btn-tertiary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  color: var(--text-primary);
}

.btn-tertiary:active {
  background: rgba(212, 175, 55, 0.1);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid #ef4444;
  color: #fca5a5;
}

.btn-danger:active {
  background: rgba(239, 68, 68, 0.25);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px var(--spacing) 60px;
  gap: 20px;
  text-align: center;
}

.hero-icon {
  font-size: 64px;
  animation: fadeIn 0.6s ease;
}

.hero-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-light);
  text-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
}

.hero-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
  padding: 0 var(--spacing) var(--spacing);
}

.menu-btn {
  width: 100%;
  padding: 16px;
  background: rgba(212, 175, 55, 0.08);
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: var(--radius-lg);
  color: var(--primary-light);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.menu-btn:active {
  background: rgba(212, 175, 55, 0.2);
  border-color: var(--primary);
  transform: scale(0.98);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
}

.menu-btn-icon {
  font-size: 20px;
}

.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--spacing);
  gap: var(--spacing);
}

.player-seat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: var(--spacing);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius);
}

.seat-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.player-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.avatar {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.1);
  border: 2px solid var(--primary);
  border-radius: 50%;
}

.avatar.small {
  width: 36px;
  height: 36px;
  font-size: 20px;
}

.player-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-light);
}

.card-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  min-height: 100px;
}

.card {
  width: 60px;
  height: 90px;
  background: linear-gradient(135deg, #fff 0%, #f5f5f5 100%);
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
  cursor: pointer;
  animation: cardFlip 0.6s ease-out;
}

.card.hidden {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: transparent;
}

.card-suit {
  position: absolute;
  font-size: 11px;
  color: inherit;
}

.card-suit.top {
  top: 2px;
  left: 2px;
}

.card-suit.bottom {
  bottom: 2px;
  right: 2px;
  transform: rotate(180deg);
}

.score-display {
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-light);
  margin: 4px 0;
}

.score-natural {
  color: var(--success);
  animation: glow 1s ease-in-out infinite;
}

.result-banner {
  text-align: center;
  padding: var(--spacing);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(78, 222, 255, 0.08) 100%);
  border-radius: var(--radius);
  border: 1px solid rgba(212, 175, 55, 0.3);
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  animation: slideIn 0.4s ease;
}

.result-icon {
  font-size: 32px;
}

.result-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-light);
}

.result-amount {
  font-size: 14px;
  color: var(--text-secondary);
}

#mp-seats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin: var(--spacing) 0;
}

.mp-seat {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: var(--radius);
  padding: 12px;
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
  position: relative;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.mp-seat.occupied {
  background: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.2);
}

.mp-seat-player {
  font-size: 28px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 50%;
}

.road-map {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  padding: var(--spacing);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius);
  border: 1px solid rgba(212, 175, 55, 0.1);
}

.road-dot {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
  background: rgba(212, 175, 55, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--text-secondary);
  border: 1px solid rgba(212, 175, 55, 0.05);
}

.road-dot.player {
  background: rgba(78, 222, 255, 0.3);
  color: #4edeff;
}

.road-dot.banker {
  background: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.road-dot.tie {
  background: rgba(74, 222, 128, 0.3);
  color: #86efac;
}

.chip-selector {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  padding: var(--spacing);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius);
  border: 1px solid rgba(212, 175, 55, 0.1);
  flex-wrap: wrap;
}

.chip {
  flex: 1;
  min-width: 50px;
  padding: 10px 6px;
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip:active,
.chip.selected {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  border-color: var(--primary);
  color: #000;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  transform: scale(1.05);
}

#bet-section {
  display: flex;
  gap: var(--spacing);
  padding: var(--spacing);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius);
}

.bet-btn {
  flex: 1;
  padding: 12px 8px;
  background: rgba(212, 175, 55, 0.05);
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bet-btn:active,
.bet-btn.selected {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  border-color: var(--primary);
  color: #000;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.bet-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bet-amount {
  font-size: 11px;
  opacity: 0.8;
}

#deal-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  border: none;
  border-radius: var(--radius-lg);
  color: #000;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

#deal-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
}

#deal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  animation: none;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: none;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

.overlay.active {
  display: flex;
}

.overlay-content {
  background: linear-gradient(180deg, var(--card-bg) 0%, #0f1319 100%);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--spacing);
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease;
}

.overlay-header {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-light);
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  padding-bottom: 12px;
}

.overlay-body {
  flex: 1;
  overflow-y: auto;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, var(--card-bg) 0%, #0f1319 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
  z-index: 110;
  max-width: 90%;
  display: none;
  flex-direction: column;
  gap: var(--spacing);
  animation: fadeIn 0.3s ease;
}

.modal.active {
  display: flex;
}

.modal-header {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-light);
}

.modal-body {
  color: var(--text-secondary);
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  gap: var(--spacing);
  justify-content: flex-end;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing);
}

.shop-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: var(--radius);
  padding: var(--spacing);
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.shop-item:active {
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.3);
}

.shop-item-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.shop-item-name {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-transform: capitalize;
}

.shop-item-price {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
}

.shop-item-btn {
  width: 100%;
  padding: 8px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid var(--primary);
  border-radius: 6px;
  color: var(--primary-light);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.2s ease;
}

.shop-item-btn:active {
  background: rgba(212, 175, 55, 0.2);
}

.shop-item-btn.equipped {
  background: rgba(74, 222, 128, 0.1);
  border-color: #4ade80;
  color: #86efac;
}

.mission-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: var(--radius);
  padding: var(--spacing);
  display: flex;
  gap: var(--spacing);
  align-items: center;
  margin-bottom: var(--spacing);
  transition: all 0.2s ease;
}

.mission-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.mission-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mission-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.mission-progress {
  font-size: 12px;
  color: var(--text-secondary);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 2px;
  margin-top: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);
  transition: width 0.3s ease;
}

.achievement-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: var(--radius);
  padding: var(--spacing);
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.achievement-card.locked {
  opacity: 0.5;
}

.achievement-card:active {
  background: rgba(212, 175, 55, 0.1);
}

.achievement-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.achievement-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.achievement-desc {
  font-size: 10px;
  color: var(--text-secondary);
}

.rank-row {
  display: flex;
  align-items: center;
  gap: var(--spacing);
  padding: var(--spacing);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius);
  border-bottom: 1px solid rgba(212, 175, 55, 0.05);
}

.rank-number {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  min-width: 30px;
}

.rank-number.top {
  color: var(--primary-light);
}

.rank-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.rank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rank-name {
  font-weight: 600;
  color: var(--text-primary);
}

.rank-stats {
  font-size: 11px;
  color: var(--text-secondary);
}

.rank-score {
  font-weight: 700;
  color: var(--primary-light);
  min-width: 60px;
  text-align: right;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius);
  margin-bottom: 12px;
}

.settings-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-title {
  font-weight: 600;
  color: var(--text-primary);
}

.settings-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.toggle {
  width: 48px;
  height: 28px;
  background: rgba(212, 175, 55, 0.2);
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.toggle.active {
  background: rgba(74, 222, 128, 0.3);
  border-color: #4ade80;
}

.toggle-thumb {
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle.active .toggle-thumb {
  left: 22px;
}

.tutorial-step {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: var(--radius);
  padding: var(--spacing);
  margin-bottom: var(--spacing);
  text-align: center;
}

.tutorial-step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  border-radius: 50%;
  color: #000;
  font-weight: 700;
  margin-bottom: 12px;
}

.tutorial-step-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.confetti-particle {
  position: fixed;
  pointer-events: none;
}

@keyframes cardFlip {
  0% {
    transform: rotateY(90deg);
    opacity: 0;
  }
  100% {
    transform: rotateY(0deg);
    opacity: 1;
  }
}

@keyframes slideIn {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes confettiFall {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), 500px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes shimmer {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes glow {
  0%, 100% { text-shadow: 0 0 8px rgba(74, 222, 128, 0.5); }
  50% { text-shadow: 0 0 16px rgba(74, 222, 128, 0.8); }
}

#toast-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  background: linear-gradient(135deg, var(--card-bg) 0%, rgba(10, 14, 23, 0.9) 100%);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: var(--radius);
  padding: 12px 20px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease;
  max-width: 90%;
}

.room-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: var(--radius);
  padding: var(--spacing);
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.room-card:active {
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.3);
}

.room-info {
  flex: 1;
}

.room-code {
  font-weight: 700;
  color: var(--primary-light);
  margin-bottom: 4px;
}

.room-details {
  font-size: 12px;
  color: var(--text-secondary);
}

.room-wager {
  font-weight: 600;
  color: var(--primary);
}

input[type="text"],
input[type="number"],
select {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

input[type="text"]:focus,
input[type="number"]:focus,
select:focus {
  outline: none;
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--primary);
}

select {
  cursor: pointer;
}

select option {
  background: var(--card-bg);
  color: var(--text-primary);
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing);
  padding: var(--spacing);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius);
  margin-bottom: var(--spacing);
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(78, 222, 255, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  border: 2px solid var(--primary);
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.level-bar {
  width: 100%;
  height: 8px;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
}

.level-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);
  transition: width 0.3s ease;
}

.nick-input-row {
  display: flex;
  gap: var(--spacing);
  margin-bottom: var(--spacing);
}

.nick-input-row input {
  flex: 1;
  margin-bottom: 0;
}

.nick-input-row button {
  flex-shrink: 0;
}

@media (max-width: 480px) {
  :root {
    --spacing: 12px;
  }

  .stat-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .shop-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 360px) {
  .btn {
    padding: 10px 16px;
    font-size: 12px;
  }

  .topbar-title {
    font-size: 16px;
  }

  .hero-icon {
    font-size: 48px;
  }

  .card {
    width: 50px;
    height: 75px;
  }
}

/* ENHANCED CSS ANIMATIONS */
@keyframes dealCard {
  0% {
    transform: translateX(-200px) translateY(-150px) rotateZ(90deg);
    opacity: 0;
  }
  100% {
    transform: translateX(0) translateY(0) rotateZ(0deg);
    opacity: 1;
  }
}

@keyframes scoreReveal {
  0% {
    transform: scale(0) rotateZ(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotateZ(10deg);
  }
  100% {
    transform: scale(1) rotateZ(0deg);
    opacity: 1;
  }
}

@keyframes chipBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes winGlow {
  0% {
    text-shadow: 0 0 0 rgba(212, 175, 55, 0);
    transform: scale(1);
  }
  50% {
    text-shadow: 0 0 20px rgba(212, 175, 55, 0.8);
    transform: scale(1.1);
  }
  100% {
    text-shadow: 0 0 0 rgba(212, 175, 55, 0);
    transform: scale(1);
  }
}

@keyframes loseShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
}

@keyframes naturalFlash {
  0%, 100% {
    background: transparent;
    box-shadow: none;
  }
  50% {
    background: rgba(212, 175, 55, 0.2);
    box-shadow: 0 0 30px rgba(212, 175, 55, 0.6);
  }
}

@keyframes goldRain {
  0% {
    transform: translateY(-20px);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh);
    opacity: 0;
  }
}

@keyframes chatBubble {
  0% {
    transform: scale(0) translateY(10px);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(212, 175, 55, 0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.chat-bubble {
  animation: chatBubble 0.4s ease-out;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--primary);
  border-radius: 12px;
  padding: 8px 12px;
  max-width: 120px;
  font-size: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-bottom: 8px;
}

.stats-panel {
  padding: var(--spacing);
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  margin: var(--spacing) 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing);
  margin: var(--spacing) 0;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: var(--radius);
  text-align: center;
}

.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: var(--primary);
  margin-top: 4px;
}

.stat-row {
  padding: 8px var(--spacing);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}

.stat-row:last-child {
  border-bottom: none;
}

.road-maps-container {
  padding: var(--spacing);
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  margin: var(--spacing) 0;
}

.road-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: var(--spacing);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.road-tab {
  flex: 1;
  padding: 10px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.road-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.road-tab-pane {
  display: none;
}

.road-tab-pane.active {
  display: block;
}

.bead-road {
  display: grid;
  gap: 4px;
}

.bead-row {
  display: flex;
  gap: 4px;
}

.bead {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.bead.empty {
  background: rgba(255, 255, 255, 0.05);
}

.big-road {
  display: grid;
  gap: 4px;
}

.big-road-row {
  display: flex;
  gap: 4px;
}

.big-road-cell {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 14px;
}

.big-road-cell.empty {
  background: rgba(255, 255, 255, 0.05);
}

.big-eye-road {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.eye-item {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 14px;
}

.empty-road {
  text-align: center;
  padding: var(--spacing);
  color: var(--text-secondary);
}

.tutorial-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing);
  margin: var(--spacing);
}

.tutorial-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-bottom: var(--spacing);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--primary-light));
  transition: width 0.4s ease;
}

.tutorial-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: var(--spacing);
}

.tutorial-icon {
  font-size: 32px;
}

.tutorial-counter {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-secondary);
}

.tutorial-content {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: var(--spacing);
  color: var(--text-primary);
}

.card-values-table, .banker-table, .payout-table-div {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius);
  padding: 12px;
  margin: 12px 0;
  font-size: 12px;
}

.values-table, .banker-3rd-table {
  width: 100%;
  border-collapse: collapse;
}

.values-table tr, .banker-3rd-table tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.values-table td, .banker-3rd-table td, .banker-3rd-table th {
  padding: 6px;
  text-align: left;
}

.values-table td:nth-child(3), .banker-3rd-table td:nth-child(2) {
  color: var(--primary);
  font-weight: bold;
}

.payout-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.payout-value {
  color: var(--primary);
  font-weight: bold;
}

.tutorial-actions {
  display: flex;
  gap: 12px;
  margin-top: var(--spacing);
}

.tutorial-actions button {
  flex: 1;
}

.settings-panel {
  padding: var(--spacing);
}

.setting-group {
  margin-bottom: var(--spacing);
}

.setting-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

.setting-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.setting-btn {
  flex: 1;
  min-width: 70px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-secondary);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.setting-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--dark-bg);
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-switch input {
  display: none;
}

.toggle-slider {
  width: 44px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: left 0.3s;
}

.toggle-switch input:checked + .toggle-slider {
  background: var(--primary);
}

.toggle-switch input:checked + .toggle-slider::after {
  left: 22px;
}

.bankrupt-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.bankrupt-modal {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing);
  width: 90%;
  max-width: 340px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.bankrupt-modal h2 {
  margin-bottom: 12px;
  font-size: 20px;
}

.bankrupt-modal p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing);
  font-size: 14px;
}

.recovery-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.session-summary {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing);
  margin: var(--spacing);
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: var(--spacing);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
}

.summary-item:last-child {
  border-bottom: none;
}

.tutorial-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  width: 90%;
  max-width: 360px;
  max-height: 80vh;
  overflow-y: auto;
}
`;

function boot() {
  const vp = document.createElement('meta');
  vp.name = 'viewport';
  vp.content = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
  document.head.appendChild(vp);

  const sty = document.createElement('style');
  sty.textContent = CSS;
  document.head.appendChild(sty);

  const root = document.createElement('div');
  root.id = 'kk-root';
  document.body.appendChild(root);

  root.innerHTML = `
    <!-- HOME SCREEN -->
    <div class="screen sc-home active">
      <div class="topbar">
        <div class="topbar-left">
          <span style="font-size:24px;">🎰</span>
          <span class="topbar-title" data-i18n="app_title">FA Baccarat</span>
        </div>
        <div class="topbar-right">
          <div class="pill" data-i18n-template>Level <span id="home-level">1</span></div>
        </div>
      </div>

      <div class="content-area">
        <div id="daily-checkin" class="daily-checkin">
          <div class="daily-checkin-icon">🎁</div>
          <div class="daily-checkin-content">
            <div class="daily-checkin-title" data-i18n="daily_checkin">Daily Check-In</div>
            <div class="daily-checkin-reward">+100 <span data-i18n="stars">Stars</span></div>
          </div>
          <button class="btn btn-primary" data-action="claim-checkin" data-i18n="claim">Claim</button>
        </div>

        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-label" data-i18n="stars">Stars</div>
            <div class="stat-value" id="stat-stars">10000</div>
          </div>
          <div class="stat-item">
            <div class="stat-label" data-i18n="level">Level</div>
            <div class="stat-value" id="stat-level">1</div>
          </div>
          <div class="stat-item">
            <div class="stat-label" data-i18n="wins">Wins</div>
            <div class="stat-value" id="stat-wins">0</div>
          </div>
          <div class="stat-item">
            <div class="stat-label" data-i18n="best_streak">Best Streak</div>
            <div class="stat-value" id="stat-streak">0</div>
          </div>
        </div>

        <div class="hero-section">
          <div class="hero-icon">🎰</div>
          <div class="hero-title" data-i18n="app_title">FA Baccarat</div>
          <div class="hero-subtitle" data-i18n="casino">Premium VIP Casino Experience</div>
        </div>

        <div class="menu-buttons">
          <button class="menu-btn" data-action="play-ai">
            <span class="menu-btn-icon">🤖</span>
            <span data-i18n="play_ai">Play vs Dealer</span>
          </button>
          <button class="menu-btn" data-action="play-online">
            <span class="menu-btn-icon">👥</span>
            <span data-i18n="play_online">Online Table</span>
          </button>
        </div>
      </div>

      <div class="footer-nav">
        <button class="nav-btn active" data-nav="home" data-i18n-template>
          <span>🏠</span>
          <span data-i18n="nav_home">Home</span>
        </button>
        <button class="nav-btn" data-nav="ranking" data-i18n-template>
          <span>📊</span>
          <span data-i18n="nav_rank">Ranking</span>
        </button>
        <button class="nav-btn" data-nav="shop" data-i18n-template>
          <span>🛍️</span>
          <span data-i18n="nav_shop">Shop</span>
        </button>
        <button class="nav-btn" data-nav="mission" data-i18n-template>
          <span>🎯</span>
          <span data-i18n="nav_mission">Mission</span>
        </button>
        <button class="nav-btn" data-nav="profile" data-i18n-template>
          <span>👤</span>
          <span data-i18n="nav_profile">Profile</span>
        </button>
      </div>
    </div>

    <!-- GAME SCREEN -->
    <div class="screen sc-game">
      <div class="topbar">
        <div class="topbar-left">
          <span class="topbar-icon" data-back="game">←</span>
        </div>
        <div class="topbar-center">
          <span class="topbar-title" data-i18n="play_ai">Play vs Dealer</span>
        </div>
        <div class="topbar-right">
          <div class="pill" data-i18n-template><span data-i18n="round_num">Round</span> <span id="round-counter">1</span></div>
        </div>
      </div>

      <div class="game-area">
        <div class="player-seat">
          <div class="seat-label" data-i18n="banker">Banker</div>
          <div class="avatar">🤖</div>
          <div class="card-row" id="banker-cards"></div>
          <div class="score-display" id="banker-score">0</div>
        </div>

        <div id="result-banner" class="result-banner" style="display:none;">
          <div class="result-icon">🎉</div>
          <div class="result-text" data-i18n="you_win">You Win!</div>
          <div class="result-amount">+500</div>
        </div>

        <div id="road-map" class="road-map"></div>

        <div class="player-seat">
          <div class="seat-label" data-i18n="player">Player</div>
          <div class="avatar" id="player-avatar">🃏</div>
          <div id="player-name" class="player-name">You</div>
          <div class="card-row" id="player-cards"></div>
          <div class="score-display" id="player-score">0</div>
        </div>

        <div id="mp-seats"></div>
      </div>

      <div class="chip-selector" id="chip-selector">
        <button class="chip selected" data-chip="50">50</button>
        <button class="chip" data-chip="100">100</button>
        <button class="chip" data-chip="500">500</button>
        <button class="chip" data-chip="1000">1K</button>
        <button class="chip" data-chip="5000">5K</button>
        <button class="chip" data-chip="10000">10K</button>
      </div>

      <div id="bet-section" class="bet-section">
        <button class="bet-btn" data-bet="player">
          <span data-i18n="player">Player</span>
          <span class="bet-amount" id="bet-player-amt">0</span>
        </button>
        <button class="bet-btn" data-bet="tie">
          <span data-i18n="tie">Tie</span>
          <span class="bet-amount" id="bet-tie-amt">0</span>
        </button>
        <button class="bet-btn" data-bet="banker">
          <span data-i18n="banker">Banker</span>
          <span class="bet-amount" id="bet-banker-amt">0</span>
        </button>
      </div>

      <button id="deal-btn" class="btn btn-primary" data-action="deal" style="width:100%;margin:var(--spacing);" data-i18n="deal">Deal</button>
    </div>

    <!-- PROFILE SCREEN -->
    <div class="screen sc-profile">
      <div class="topbar">
        <div class="topbar-left">
          <span class="topbar-icon" data-back="profile">←</span>
        </div>
        <div class="topbar-center">
          <span class="topbar-title" data-i18n="profile">Profile</span>
        </div>
        <div class="topbar-right">
          <span class="topbar-icon" data-action="settings">⚙️</span>
        </div>
      </div>

      <div class="content-area">
        <div class="profile-header">
          <div class="profile-avatar" id="profile-avatar">🃏</div>
          <div class="profile-name" id="profile-nickname">Player</div>
          <div class="pill gold" id="profile-level" data-i18n-template>Level <span>1</span></div>
          <div class="level-bar">
            <div class="level-fill" id="prof-level-bar" style="width:0%"></div>
          </div>
          <span style="font-size:11px;color:var(--text-secondary);">
            <span id="prof-xp-current">0</span> / <span id="prof-xp-max">100</span> XP
          </span>
        </div>

        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-label" data-i18n="stars">Stars</div>
            <div class="stat-value" id="prof-stars">10000</div>
          </div>
          <div class="stat-item">
            <div class="stat-label" data-i18n="wins">Wins</div>
            <div class="stat-value" id="prof-wins">0</div>
          </div>
          <div class="stat-item">
            <div class="stat-label" data-i18n="win_rate">Win Rate</div>
            <div class="stat-value" id="prof-rate">0%</div>
          </div>
          <div class="stat-item">
            <div class="stat-label" data-i18n="total_games">Total Games</div>
            <div class="stat-value" id="prof-played">0</div>
          </div>
          <div class="stat-item">
            <div class="stat-label" data-i18n="streak">Streak</div>
            <div class="stat-value" id="prof-streak">0</div>
          </div>
          <div class="stat-item">
            <div class="stat-label" data-i18n="best_streak">Best</div>
            <div class="stat-value" id="prof-best-streak">0</div>
          </div>
        </div>

        <div style="padding:var(--spacing);background:rgba(255,255,255,0.02);border-radius:var(--radius);margin-bottom:var(--spacing);">
          <div style="margin-bottom:var(--spacing);">
            <label style="display:block;margin-bottom:8px;font-weight:600;font-size:13px;" data-i18n="nickname">Nickname</label>
            <div class="nick-input-row">
              <input id="nick-input" type="text" placeholder="Enter nickname" />
              <button class="btn btn-primary" data-action="save-nick" data-i18n="save">Save</button>
            </div>
          </div>
        </div>

        <div style="margin-bottom:var(--spacing);">
          <h3 style="margin-bottom:var(--spacing);color:var(--primary-light);font-size:14px;" data-i18n="achievements">Achievements</h3>
          <div id="achievements-list" style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--spacing);"></div>
        </div>

        <button class="btn btn-danger" data-action="reset-stats" style="width:100%;margin-bottom:var(--spacing);" data-i18n="reset_stats">Reset Stats</button>
        <button class="btn btn-tertiary" data-action="show-tutorial" style="width:100%;" data-i18n="tutorial">Tutorial</button>
      </div>
    </div>

    <!-- RANKING SCREEN -->
    <div class="screen sc-rank">
      <div class="topbar">
        <div class="topbar-left">
          <span class="topbar-icon" data-back="ranking">←</span>
        </div>
        <div class="topbar-center">
          <span class="topbar-title" data-i18n="ranking">Ranking</span>
        </div>
      </div>

      <div style="display:flex;gap:8px;padding:var(--spacing);border-bottom:1px solid rgba(212,175,55,0.2);background:rgba(255,255,255,0.02);">
        <button class="btn btn-secondary" data-rank-tab="weekly" style="flex:1;padding:8px;" data-i18n="weekly_top">Weekly</button>
        <button class="btn btn-secondary" data-rank-tab="lastweek" style="flex:1;padding:8px;" data-i18n="last_week">Last Week</button>
        <button class="btn btn-secondary" data-rank-tab="total" style="flex:1;padding:8px;" data-i18n="total_rank">Total</button>
      </div>

      <div class="content-area">
        <div id="rank-list"></div>
      </div>
    </div>

    <!-- SHOP SCREEN -->
    <div class="screen sc-shop">
      <div class="topbar">
        <div class="topbar-left">
          <span class="topbar-icon" data-back="shop">←</span>
        </div>
        <div class="topbar-center">
          <span class="topbar-title" data-i18n="shop_title">Shop</span>
        </div>
        <div class="topbar-right">
          <span id="shop-stars" style="font-weight:700;color:var(--primary-light);">⭐ 10000</span>
        </div>
      </div>

      <div style="display:flex;gap:8px;padding:var(--spacing);border-bottom:1px solid rgba(212,175,55,0.2);background:rgba(255,255,255,0.02);">
        <button class="btn btn-secondary" data-shop-tab="avatars" style="flex:1;padding:8px;" data-i18n="avatars">Avatars</button>
        <button class="btn btn-secondary" data-shop-tab="tables" style="flex:1;padding:8px;" data-i18n="tables">Tables</button>
        <button class="btn btn-secondary" data-shop-tab="cardbacks" style="flex:1;padding:8px;" data-i18n="card_backs">Backs</button>
      </div>

      <div class="content-area">
        <div id="shop-grid" class="shop-grid"></div>
      </div>
    </div>

    <!-- MISSION SCREEN -->
    <div class="screen sc-mission">
      <div class="topbar">
        <div class="topbar-left">
          <span class="topbar-icon" data-back="mission">←</span>
        </div>
        <div class="topbar-center">
          <span class="topbar-title" data-i18n="missions_title">Missions</span>
        </div>
      </div>

      <div class="content-area">
        <div style="margin-bottom:var(--spacing);">
          <h3 style="margin-bottom:var(--spacing);color:var(--primary-light);font-size:14px;" data-i18n="daily_mission">Daily Missions</h3>
          <div id="daily-missions"></div>
        </div>

        <div>
          <h3 style="margin-bottom:var(--spacing);color:var(--primary-light);font-size:14px;" data-i18n="achievements">Achievements</h3>
          <div id="achievement-list"></div>
        </div>
      </div>
    </div>

    <!-- SETTINGS SCREEN -->
    <div class="screen sc-settings">
      <div class="topbar">
        <div class="topbar-left">
          <span class="topbar-icon" data-back="settings">←</span>
        </div>
        <div class="topbar-center">
          <span class="topbar-title" data-i18n="settings">Settings</span>
        </div>
      </div>

      <div class="content-area">
        <div class="settings-row">
          <div class="settings-label">
            <div class="settings-title" data-i18n="sound">Sound</div>
          </div>
          <div class="toggle active" id="toggle-sound" data-action="toggle-sound">
            <div class="toggle-thumb"></div>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-label">
            <div class="settings-title" data-i18n="vibrate">Vibration</div>
          </div>
          <div class="toggle active" id="toggle-vibrate" data-action="toggle-vibrate">
            <div class="toggle-thumb"></div>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-label">
            <div class="settings-title" data-i18n="language">Language</div>
          </div>
          <select id="lang-select">
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
            <option value="vi">Tiếng Việt</option>
            <option value="th">ไทย</option>
          </select>
        </div>
      </div>
    </div>

    <!-- TUTORIAL SCREEN -->
    <div class="screen sc-tutorial">
      <div class="topbar">
        <div class="topbar-left">
          <span class="topbar-icon" data-back="tutorial">←</span>
        </div>
        <div class="topbar-center">
          <span class="topbar-title" data-i18n="tutorial">Tutorial</span>
        </div>
      </div>

      <div class="content-area">
        <div class="tutorial-step">
          <div class="tutorial-step-number">1</div>
          <div class="tutorial-step-text" data-i18n="tut_step1">Baccarat is played between Player and Banker. Cards 2-9 are worth face value, 10/J/Q/K = 0, A = 1.</div>
        </div>
        <div class="tutorial-step">
          <div class="tutorial-step-number">2</div>
          <div class="tutorial-step-text" data-i18n="tut_step2">Each hand tries to reach 9 or closest to it. Hand total is the last digit of card sum.</div>
        </div>
        <div class="tutorial-step">
          <div class="tutorial-step-number">3</div>
          <div class="tutorial-step-text" data-i18n="tut_step3">You bet on Player win, Banker win, or Tie. Third card drawn if needed by specific rules.</div>
        </div>
        <div class="tutorial-step">
          <div class="tutorial-step-number">4</div>
          <div class="tutorial-step-text" data-i18n="tut_step4">Payout: Player 1:1, Banker 1:0.95 (5% commission), Tie 8:1.</div>
        </div>
        <div class="tutorial-step">
          <div class="tutorial-step-number">5</div>
          <div class="tutorial-step-text" data-i18n="tut_step5">Place your bet before each hand. Good luck and play responsibly!</div>
        </div>
        <button class="btn btn-primary" style="width:100%;margin-top:var(--spacing);" data-action="continue-tut" data-i18n="continue_btn">Continue</button>
      </div>
    </div>

    <!-- ROOM PANEL OVERLAY -->
    <div id="room-panel" class="overlay">
      <div class="overlay-content">
        <div class="overlay-header" data-i18n="play_online">Online Table</div>
        <div class="overlay-body">
          <div style="margin-bottom:var(--spacing);padding:var(--spacing);background:rgba(255,255,255,0.02);border-radius:var(--radius);text-align:center;">
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px;" data-i18n="players">Players Online</div>
            <div style="font-size:20px;font-weight:700;color:var(--primary-light);" id="online-players">0</div>
          </div>

          <div style="margin-bottom:var(--spacing);">
            <label style="display:block;margin-bottom:8px;font-weight:600;font-size:13px;" data-i18n="wager">Wager per hand</label>
            <input id="create-wager" type="number" placeholder="Minimum 50" value="100" />
            <button class="btn btn-primary" data-action="create-room" style="width:100%;" data-i18n="create_room">Create Room</button>
          </div>

          <div style="margin-bottom:var(--spacing);">
            <label style="display:block;margin-bottom:8px;font-weight:600;font-size:13px;" data-i18n="room_code">Room Code</label>
            <input id="join-code" type="text" placeholder="Enter 4-digit code" maxlength="4" />
            <button class="btn btn-secondary" data-action="join-room" style="width:100%;" data-i18n="join_room">Join Room</button>
          </div>

          <h3 style="margin-bottom:var(--spacing);color:var(--primary-light);font-size:14px;" data-i18n="play_online">Open Rooms</h3>
          <div id="open-rooms"></div>
        </div>
      </div>
    </div>

    <!-- WAITING OVERLAY -->
    <div id="waiting-overlay" class="overlay">
      <div class="overlay-content">
        <div class="overlay-header" data-i18n="waiting">Waiting for players...</div>
        <div class="overlay-body">
          <div style="padding:var(--spacing);background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.3);border-radius:var(--radius);margin-bottom:var(--spacing);text-align:center;">
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;" data-i18n="room_code">Room Code</div>
            <div style="font-size:28px;font-weight:700;color:var(--primary-light);font-family:monospace;" id="waiting-code">1234</div>
          </div>

          <h3 style="margin-bottom:12px;color:var(--primary-light);font-size:13px;" data-i18n="players">Players</h3>
          <div id="waiting-players" style="margin-bottom:var(--spacing);">
            <div style="padding:12px;background:rgba(255,255,255,0.02);border-radius:var(--radius);text-align:center;color:var(--text-secondary);" data-i18n="waiting">Waiting for players...</div>
          </div>

          <button class="btn btn-primary" id="start-game-btn" style="width:100%;margin-bottom:12px;" data-action="start-game" data-i18n="start">Start Game</button>
          <button class="btn btn-tertiary" style="width:100%;" data-action="cancel-room" data-i18n="leave">Leave</button>
        </div>
      </div>
    </div>

    <!-- RESULT OVERLAY -->
    <div id="result-overlay" class="overlay">
      <div class="overlay-content">
        <div style="text-align:center;padding:var(--spacing);">
          <div style="font-size:48px;margin-bottom:var(--spacing);" id="result-icon">🎉</div>
          <div style="font-size:20px;font-weight:700;color:var(--primary-light);margin-bottom:8px;" id="result-title" data-i18n="you_win">You Win!</div>
          <div style="font-size:14px;color:var(--text-secondary);margin-bottom:var(--spacing);" id="result-amount">+1000 <span data-i18n="stars">Stars</span></div>
          <button class="btn btn-primary" data-action="close-result" style="width:100%;" data-i18n="continue_btn">Continue</button>
        </div>
      </div>
    </div>

    <!-- TOAST CONTAINER -->
    <div id="toast-container"></div>
  `;
}

// SECTION 1: STATE VARIABLES & PERSISTENCE
let lang = 'en';
let profile, settings, shopData, gameState, dailyMission, onlineState;

function t(key) {
  return (I18N[lang] && I18N[lang][key]) || (I18N.en[key]) || key;
}

function applyI18n() {
  const root = document.getElementById('kk-root');
  if (!root) return;
  root.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });
}

function loadProfile() {
  const stored = localStorage.getItem('bac_profile_v2');
  if (stored) {
    profile = JSON.parse(stored);
  } else {
    profile = {
      userId: 'user_' + Date.now(),
      nickname: 'Player',
      avatar: '🃏',
      stars: STARTING_STARS,
      xp: 0,
      level: 1,
      totalWins: 0,
      totalLoss: 0,
      totalPlayed: 0,
      bestStreak: 0,
      currentStreak: 0,
      tieWins: 0,
      biggestBet: 0,
      peakStars: STARTING_STARS,
      bankerBets: 0,
      todayGames: 0,
      todayWins: 0,
      todayTotalBet: 0,
      todayStreak: 0,
      todayBankerBets: 0,
      todayTieBets: 0,
      lastCheckinDate: null,
      unlockedAchievements: [],
      completedMissions: []
    };
    saveProfile();
  }
}

function saveProfile() {
  localStorage.setItem('bac_profile_v2', JSON.stringify(profile));
}

function loadSettings() {
  const defaults = {
    sound: true,
    vibrate: true,
    language: 'en',
    animationSpeed: 'normal',
    autoDeal: false,
    cardStyle: 'classic',
    theme: 'dark',
    notificationEnabled: true
  };
  try {
    const stored = localStorage.getItem('bac_settings_v2');
    settings = stored ? { ...defaults, ...JSON.parse(stored) } : { ...defaults };
  } catch(e) {
    settings = { ...defaults };
  }
  try { applyTheme(settings.theme); } catch(e) {}
}

function saveSettings() {
  try { localStorage.setItem('bac_settings_v2', JSON.stringify(settings)); } catch(e) {}
}

function loadShopData() {
  const stored = localStorage.getItem('bac_shop_v2');
  if (stored) {
    shopData = JSON.parse(stored);
  } else {
    shopData = {
      ownedAvatars: ['🃏'],
      ownedTables: ['classic'],
      ownedCardbacks: ['red'],
      equippedAvatar: '🃏',
      equippedTable: 'classic',
      equippedCardback: 'red'
    };
    saveShopData();
  }
}

function saveShopData() {
  localStorage.setItem('bac_shop_v2', JSON.stringify(shopData));
}

function loadDailyMission() {
  const stored = localStorage.getItem('bac_daily_v2');
  const today = getDayKey();

  if (stored) {
    dailyMission = JSON.parse(stored);
    if (dailyMission.date !== today) {
      dailyMission = {
        date: today,
        missions: [
          { id: 1, type: 'played', target: 5, current: 0, reward: 200 },
          { id: 2, type: 'wins', target: 3, current: 0, reward: 300 },
          { id: 3, type: 'banker_bets', target: 2, current: 0, reward: 150 }
        ],
        claimedRewards: []
      };
      saveDailyMission();
    }
  } else {
    dailyMission = {
      date: today,
      missions: [
        { id: 1, type: 'played', target: 5, current: 0, reward: 200 },
        { id: 2, type: 'wins', target: 3, current: 0, reward: 300 },
        { id: 3, type: 'banker_bets', target: 2, current: 0, reward: 150 }
      ],
      claimedRewards: []
    };
    saveDailyMission();
  }
}

function saveDailyMission() {
  localStorage.setItem('bac_daily_v2', JSON.stringify(dailyMission));
}

function levelFromXp(xp) {
  const lvl = Math.floor(xp / 100) + 1;
  return Math.min(lvl, 99);
}

function xpForLevel(lvl) {
  return (lvl - 1) * 100;
}

function addXp(amount) {
  if (!profile) return;
  const oldLevel = levelFromXp(profile.xp);
  profile.xp += amount;
  const newLevel = levelFromXp(profile.xp);

  if (newLevel > oldLevel) {
    showToast(t('level_up') + ' ' + newLevel + '!', 3000);
    vibrate([100, 50, 100]);
  }

  updateAllUI();
  saveProfile();
}

// SECTION 2: AUDIO SYSTEM
let audioCtx;

function getAudioCtx() {
  if (!audioCtx) {
    const ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new ctx();
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.3) {
  if (!settings || !settings.sound) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch(e) {
    console.warn('Audio error:', e);
  }
}

function playDeal() {
  playTone(800, 0.1, 'sine', 0.2);
}

function playFlip() {
  playTone(400, 0.05, 'sine', 0.15);
}

function playWin() {
  playTone(800, 0.15, 'sine', 0.3);
  setTimeout(() => playTone(1000, 0.15, 'sine', 0.3), 100);
  setTimeout(() => playTone(1200, 0.2, 'sine', 0.3), 200);
}

function playLose() {
  playTone(300, 0.2, 'sine', 0.2);
  setTimeout(() => playTone(250, 0.2, 'sine', 0.2), 150);
}

function playChipSelect() {
  playTone(600, 0.08, 'sine', 0.2);
}

function playBet() {
  playTone(500, 0.12, 'sine', 0.25);
}

function playNatural() {
  playTone(1000, 0.1, 'sine', 0.3);
  setTimeout(() => playTone(1200, 0.1, 'sine', 0.3), 100);
  setTimeout(() => playTone(1400, 0.15, 'sine', 0.3), 200);
}

function playConfetti() {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      playTone(400 + i * 200, 0.08, 'sine', 0.2);
    }, i * 80);
  }
}

function vibrate(pattern) {
  if (!settings || !settings.vibrate) return;
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// SECTION 3: UTILITY FUNCTIONS
function showScreen(name) {
  const root = document.getElementById('kk-root');
  if (!root) return;

  root.querySelectorAll('.screen').forEach(el => {
    el.classList.remove('active');
  });

  const target = root.querySelector('.sc-' + name);
  if (target) {
    target.classList.add('active');

    // Update footer nav
    root.querySelectorAll('[data-nav]').forEach(btn => {
      btn.classList.remove('active-nav');
    });
    const navBtn = root.querySelector('[data-nav="' + name + '"]');
    if (navBtn) navBtn.classList.add('active-nav');
  }
}

function showToast(msg, duration = 2000) {
  const root = document.getElementById('kk-root');
  if (!root) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    animation: slideUp 0.3s ease;
  `;

  root.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function showConfetti(count = 50) {
  const root = document.getElementById('kk-root');
  if (!root) return;

  playConfetti();

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    const emoji = ['🎉', '✨', '⭐', '🎊', '💫'][Math.floor(Math.random() * 5)];
    confetti.textContent = emoji;
    confetti.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}%;
      top: -20px;
      font-size: ${12 + Math.random() * 12}px;
      z-index: 9998;
      animation: confetti ${2 + Math.random()}s linear forwards;
      transform: rotate(${Math.random() * 360}deg);
    `;
    root.appendChild(confetti);

    setTimeout(() => confetti.remove(), (2 + Math.random()) * 1000);
  }
}

// SECTION 3A: ENHANCED PARTICLE SYSTEM
function createParticleExplosion(x, y, color, count = 20) {
  const root = document.getElementById('kk-root');
  if (!root) return;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    const angle = (Math.PI * 2 * i) / count;
    const velocity = 4 + Math.random() * 6;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    const size = 4 + Math.random() * 8;

    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      z-index: 9998;
      pointer-events: none;
      box-shadow: 0 0 8px ${color};
    `;

    root.appendChild(particle);

    let px = x, py = y;
    let vxCur = vx, vyCur = vy;
    const gravity = 0.3;
    const friction = 0.98;
    let life = 60;

    const animate = () => {
      px += vxCur;
      py += vyCur;
      vyCur += gravity;
      vxCur *= friction;
      vyCur *= friction;
      life--;

      particle.style.left = px + 'px';
      particle.style.top = py + 'px';
      particle.style.opacity = life / 60;

      if (life > 0) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    };
    animate();
  }
}

function createGoldRain(duration = 3) {
  const root = document.getElementById('kk-root');
  if (!root) return;

  const startTime = Date.now();
  const rainParticles = [];

  const createRainDrop = () => {
    if (Date.now() - startTime > duration * 1000) return;

    const particle = document.createElement('div');
    const x = Math.random() * window.innerWidth;
    const size = 2 + Math.random() * 4;

    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: -10px;
      width: ${size}px;
      height: ${size * 3}px;
      background: linear-gradient(180deg, #ffd700, #ffed4e);
      z-index: 9998;
      pointer-events: none;
      box-shadow: 0 0 4px #ffd700;
    `;

    root.appendChild(particle);
    rainParticles.push(particle);

    let py = -10;
    const speed = 3 + Math.random() * 2;

    const fall = () => {
      py += speed;
      particle.style.top = py + 'px';

      if (py < window.innerHeight + 10) {
        requestAnimationFrame(fall);
      } else {
        particle.remove();
      }
    };
    fall();

    if (Date.now() - startTime < duration * 1000) {
      setTimeout(createRainDrop, 30);
    }
  };

  createRainDrop();
}

function createCardTrail(startX, startY, endX, endY, count = 8) {
  const root = document.getElementById('kk-root');
  if (!root) return;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    const progress = i / count;
    const x = startX + (endX - startX) * progress;
    const y = startY + (endY - startY) * progress;

    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 30px;
      height: 45px;
      background: linear-gradient(45deg, rgba(212, 175, 55, 0.6), rgba(240, 200, 80, 0.4));
      border: 1px solid rgba(212, 175, 55, 0.8);
      border-radius: 3px;
      z-index: 9997;
      pointer-events: none;
    `;

    root.appendChild(particle);

    setTimeout(() => {
      particle.style.opacity = '0';
      particle.style.transition = 'opacity 0.3s ease-out';
    }, i * 20);

    setTimeout(() => particle.remove(), 400);
  }
}

function animateStarCount(element, from, to, duration = 1000) {
  if (!element) return;

  const startTime = Date.now();
  const diff = to - from;

  const update = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(from + diff * easeOut);

    element.textContent = formatNumber(current);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = formatNumber(to);
    }
  };

  update();
}

function pulseElement(element, duration = 600) {
  if (!element) return;

  element.style.animation = `none`;
  setTimeout(() => {
    element.style.animation = `pulse ${duration}ms ease-out`;
  }, 10);
}

function shakeElement(element) {
  if (!element) return;

  element.style.animation = `shake 0.4s ease-in-out`;
  setTimeout(() => {
    element.style.animation = 'none';
  }, 400);
}

function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getWeekStart() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const saturday = new Date(now.setDate(diff - 1));
  saturday.setHours(12, 0, 0, 0);
  return Math.floor(saturday.getTime() / 1000);
}

function isNewWeek(lastReset) {
  if (!lastReset) return true;
  const weekStart = getWeekStart();
  return lastReset < weekStart;
}

function getDayKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

// SECTION 4: CARD & SHOE SYSTEM
let shoe = [];

function createShoe(deckCount = 8) {
  shoe = [];
  for (let d = 0; d < deckCount; d++) {
    for (const s of SUITS) {
      for (const r of RANKS) {
        shoe.push({
          suit: s,
          rank: r,
          value: CARD_VALUES[r]
        });
      }
    }
  }
  shuffleArray(shoe);
}

function drawCard() {
  if (shoe.length < 6) {
    createShoe();
  }
  return shoe.pop();
}

function cardScore(cards) {
  let sum = 0;
  for (const card of cards) {
    sum += card.value;
  }
  return sum % 10;
}

function cardToHTML(card, faceDown = false) {
  if (faceDown) {
    const cardback = shopData.equippedCardback || 'red';
    const bgColor = cardback === 'blue' ? '#1e40af' : '#dc2626';
    return `
      <div class="card card-back" style="background: ${bgColor}; border: 2px solid #000;">
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 3em; transform: rotate(45deg);">🃏</span>
        </div>
      </div>
    `;
  }

  const isRed = card.suit === '♥' || card.suit === '♦';
  const color = isRed ? '#dc2626' : '#000000';

  return `
    <div class="card" style="border: 2px solid ${color}; color: ${color};">
      <div style="font-size: 1.2em; font-weight: bold;">${card.rank}</div>
      <div style="font-size: 1.5em;">${card.suit}</div>
    </div>
  `;
}

function shouldPlayerDraw(playerScore) {
  return playerScore >= 0 && playerScore <= 5;
}

function shouldBankerDraw(bankerScore, playerThirdCard) {
  if (bankerScore <= 2) return true;
  if (bankerScore === 3) return playerThirdCard !== 8;
  if (bankerScore === 4) return playerThirdCard >= 2 && playerThirdCard <= 7;
  if (bankerScore === 5) return playerThirdCard >= 4 && playerThirdCard <= 7;
  if (bankerScore === 6) return playerThirdCard === 6 || playerThirdCard === 7;
  return false;
}

// SECTION 5: GAME FLOW
async function dealRound() {
  if (!gameState || gameState.isDealing) return;
  if (!gameState.currentBet || gameState.betAmount <= 0) {
    showToast(t('place_bet_first'));
    return;
  }
  if (profile.stars < gameState.betAmount) {
    showToast(t('not_enough_stars'));
    return;
  }

  gameState.isDealing = true;

  const dealBtn = document.querySelector('[data-action="deal"]');
  if (dealBtn) dealBtn.disabled = true;

  // Deduct bet
  profile.stars -= gameState.betAmount;
  profile.todayGames++;
  profile.todayTotalBet += gameState.betAmount;
  profile.totalPlayed++;

  if (gameState.currentBet === 'banker') {
    profile.bankerBets++;
    profile.todayBankerBets++;
  }
  if (gameState.currentBet === 'tie') {
    profile.todayTieBets++;
  }

  // Draw cards
  const playerCards = [drawCard(), drawCard()];
  const bankerCards = [drawCard(), drawCard()];

  gameState.playerCards = playerCards;
  gameState.bankerCards = bankerCards;

  // Render cards
  renderCards(playerCards, bankerCards);

  // Animate card dealing
  await animateCardDeal('player-cards', playerCards[0], 0);
  await sleep(200);
  await animateCardDeal('banker-cards', bankerCards[0], 1);
  await sleep(200);
  await animateCardDeal('player-cards', playerCards[1], 1);
  await sleep(200);
  await animateCardDeal('banker-cards', bankerCards[1], 1);
  await sleep(500);

  updateScores(playerCards, bankerCards);

  let playerScore = cardScore(playerCards);
  let bankerScore = cardScore(bankerCards);

  // Check naturals
  let isNatural = playerScore >= 8 || bankerScore >= 8;
  if (isNatural) {
    playNatural();
    showResultBanner('natural', true);
  } else {
    // Apply 3rd card rules
    let playerThirdCard = null;

    if (shouldPlayerDraw(playerScore)) {
      const card = drawCard();
      playerCards.push(card);
      playerThirdCard = card.value;
      await sleep(300);
      await animateCardDeal('player-cards', card, 2);
      await sleep(300);
      playerScore = cardScore(playerCards);
      updateScores(playerCards, bankerCards);
    }

    if (shouldBankerDraw(bankerScore, playerThirdCard)) {
      const card = drawCard();
      bankerCards.push(card);
      await sleep(300);
      await animateCardDeal('banker-cards', card, 2);
      await sleep(300);
      bankerScore = cardScore(bankerCards);
      updateScores(playerCards, bankerCards);
    }
  }

  // Determine winner
  let result = null;
  if (playerScore > bankerScore) {
    result = 'player';
  } else if (bankerScore > playerScore) {
    result = 'banker';
  } else {
    result = 'tie';
  }

  // Calculate payout
  let winnings = 0;
  let isWin = false;

  if (result === gameState.currentBet) {
    isWin = true;
    const payout = PAYOUTS[result];
    winnings = Math.floor(gameState.betAmount * payout);
    profile.stars += winnings;
    profile.totalWins++;
    profile.todayWins++;
    profile.currentStreak++;
    profile.todayStreak++;
    profile.bestStreak = Math.max(profile.bestStreak, profile.currentStreak);

    if (result === 'tie') {
      profile.tieWins++;
    }

    addXp(Math.floor(gameState.betAmount / 10));
    playWin();
    vibrate([100, 50, 100, 50, 100]);
    showConfetti(70);
  } else if (result === 'tie' && gameState.currentBet !== 'tie') {
    // Tie with other bet - lose
    profile.currentStreak = 0;
    profile.todayStreak = 0;
    profile.totalLoss++;
    playLose();
    vibrate([200, 100, 200]);
  } else {
    // Lost
    profile.currentStreak = 0;
    profile.todayStreak = 0;
    profile.totalLoss++;
    playLose();
    vibrate([200, 100, 200]);
  }

  profile.peakStars = Math.max(profile.peakStars, profile.stars);
  profile.biggestBet = Math.max(profile.biggestBet, gameState.betAmount);

  await sleep(500);
  showResultBanner(result, false);

  // Update road map
  updateRoadMap(result);

  // Check missions and achievements
  checkDailyMissions('played', 1);
  if (isWin) checkDailyMissions('wins', 1);
  if (gameState.currentBet === 'banker') checkDailyMissions('banker_bets', 1);
  checkAchievements();

  saveProfile();
  saveDailyMission();

  // Show result overlay
  await sleep(1500);
  const resultOverlay = document.querySelector('.result-overlay');
  if (resultOverlay) {
    resultOverlay.style.display = 'flex';
    resultOverlay.innerHTML = `
      <div class="result-content" style="background: white; padding: 30px; border-radius: 12px; text-align: center; max-width: 300px;">
        <div style="font-size: 3em; margin-bottom: 15px;">
          ${isWin ? '🎉' : '😅'}
        </div>
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
          ${isWin ? t('you_won') : t('you_lost')}
        </div>
        <div style="font-size: 18px; margin-bottom: 20px; color: ${isWin ? '#16a34a' : '#dc2626'};">
          ${isWin ? '+' : '-'}${formatNumber(gameState.betAmount)}
        </div>
        ${isWin && winnings > gameState.betAmount ? `
          <div style="font-size: 16px; color: #059669; margin-bottom: 15px;">
            ${t('payout')}: ${formatNumber(winnings)}
          </div>
        ` : ''}
        <button data-action="close-result" class="btn-primary" style="width: 100%;">
          ${t('next_round')}
        </button>
      </div>
    `;
  }

  // Broadcast to online players
  if (onlineState.inRoom && Online.db) {
    Online.submitResult({
      result,
      playerScore: cardScore(playerCards),
      bankerScore: cardScore(bankerCards),
      winner: gameState.currentBet === result ? profile.userId : 'other',
      timestamp: (firebaseAvailable() ? firebase.database.ServerValue.TIMESTAMP : Date.now())
    });
  }

  gameState.isDealing = false;
  if (dealBtn) dealBtn.disabled = false;

  updateAllUI();
}

function renderCards(playerCards, bankerCards) {
  const playerContainer = document.getElementById('player-cards');
  const bankerContainer = document.getElementById('banker-cards');

  if (playerContainer) {
    playerContainer.innerHTML = '';
  }
  if (bankerContainer) {
    bankerContainer.innerHTML = '';
  }
}

async function animateCardDeal(containerId, card, index) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cardEl = document.createElement('div');
  cardEl.innerHTML = cardToHTML(card, true);
  cardEl.style.cssText = `
    animation: dealCard 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    animation-delay: ${index * 100}ms;
  `;
  container.appendChild(cardEl);
  playDeal();

  await sleep(150);

  // Flip card
  const flipCard = cardEl.querySelector('.card-back') || cardEl.querySelector('.card');
  if (flipCard) {
    flipCard.style.animation = 'flipCard 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    flipCard.innerHTML = cardToHTML(card, false).match(/<div.*?<\/div>/s)[0];
  }
  playFlip();

  await sleep(150);
}

function showResultBanner(result, isNatural) {
  const bannerText = result === 'player' ? t('player_wins') :
                     result === 'banker' ? t('banker_wins') : t('tie');

  const banner = document.querySelector('.result-banner');
  if (banner) {
    banner.innerHTML = `
      <div style="font-size: 32px; font-weight: bold; color: ${
        result === 'player' ? '#0284c7' : result === 'banker' ? '#dc2626' : '#059669'
      };">
        ${isNatural ? '🎰 NATURAL! ' : ''}${bannerText}
      </div>
    `;
    banner.style.animation = 'slideDown 0.5s ease';
    setTimeout(() => {
      banner.style.animation = 'slideUp 0.5s ease';
    }, 2000);
  }
}

function hideResultBanner() {
  const banner = document.querySelector('.result-banner');
  if (banner) {
    banner.innerHTML = '';
  }
}

function updateScores(playerCards, bankerCards) {
  const playerScore = cardScore(playerCards);
  const bankerScore = cardScore(bankerCards);

  const playerScoreEl = document.getElementById('player-score');
  const bankerScoreEl = document.getElementById('banker-score');

  if (playerScoreEl) playerScoreEl.textContent = playerScore;
  if (bankerScoreEl) bankerScoreEl.textContent = bankerScore;
}

function updateRoadMap(result) {
  if (!gameState) return;

  const roadMap = document.querySelector('.road-map');
  if (!roadMap) return;

  const color = result === 'player' ? '#0284c7' : result === 'banker' ? '#dc2626' : '#059669';
  const dot = document.createElement('div');
  dot.style.cssText = `
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: ${color};
    margin: 2px;
    animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  `;

  roadMap.appendChild(dot);

  // Keep only last 60 results
  while (roadMap.children.length > 60) {
    roadMap.removeChild(roadMap.firstChild);
  }

  gameState.roadMap.push(result);
}

// SECTION 6: RENDERING & UI UPDATE
function updateAllUI() {
  if (!profile || !settings || !shopData) return;

  // Update home screen stats
  const statStars = document.getElementById('stat-stars');
  const statLevel = document.getElementById('stat-level');
  const statWins = document.getElementById('stat-wins');
  const statStreak = document.getElementById('stat-streak');

  if (statStars) statStars.textContent = formatNumber(profile.stars);
  if (statLevel) statLevel.textContent = 'Lv. ' + levelFromXp(profile.xp);
  if (statWins) statWins.textContent = formatNumber(profile.totalWins);
  if (statStreak) statStreak.textContent = formatNumber(profile.currentStreak);

  // Update profile screen
  const profStars = document.getElementById('prof-stars');
  const profWins = document.getElementById('prof-wins');
  const profRate = document.getElementById('prof-rate');
  const profPlayed = document.getElementById('prof-played');
  const profStreak = document.getElementById('prof-streak');
  const profBestStreak = document.getElementById('prof-best-streak');
  const profLevelBar = document.getElementById('prof-level-bar');
  const profileAvatar = document.getElementById('profile-avatar');
  const profileNickname = document.getElementById('profile-nickname');

  if (profStars) profStars.textContent = formatNumber(profile.stars);
  if (profWins) profWins.textContent = formatNumber(profile.totalWins);

  const winRate = profile.totalPlayed > 0
    ? ((profile.totalWins / profile.totalPlayed) * 100).toFixed(1)
    : '0';
  if (profRate) profRate.textContent = winRate + '%';

  if (profPlayed) profPlayed.textContent = formatNumber(profile.totalPlayed);
  if (profStreak) profStreak.textContent = formatNumber(profile.currentStreak);
  if (profBestStreak) profBestStreak.textContent = formatNumber(profile.bestStreak);

  if (profileAvatar) profileAvatar.textContent = shopData.equippedAvatar;
  if (profileNickname) profileNickname.textContent = profile.nickname;

  // Update level bar
  if (profLevelBar) {
    const currentLevel = levelFromXp(profile.xp);
    const xpInLevel = profile.xp - xpForLevel(currentLevel);
    const xpNeeded = 100;
    const progress = Math.min((xpInLevel / xpNeeded) * 100, 100);
    profLevelBar.style.width = progress + '%';
  }

  // Update shop stars
  const shopStars = document.getElementById('shop-stars');
  if (shopStars) shopStars.textContent = formatNumber(profile.stars);

  renderChips();
  renderMissions();
  renderAchievements();
  renderRanking('weekly');
}

function renderChips() {
  const selector = document.querySelector('.chip-selector');
  if (!selector) return;

  selector.innerHTML = '';

  for (const amount of CHIPS) {
    const btn = document.createElement('button');
    btn.className = 'chip-btn';
    btn.setAttribute('data-chip', amount);
    btn.innerHTML = `
      <div class="chip-amount">${formatNumber(amount)}</div>
      <div style="font-size: 0.8em;">💰</div>
    `;

    if (gameState && gameState.selectedChip === amount) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gameState.selectedChip = amount;
      playChipSelect();
    });

    selector.appendChild(btn);
  }
}

function renderShop(tab = 'avatars') {
  const grid = document.querySelector('.shop-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const items = tab === 'avatars' ? ([]) :
                tab === 'tables' ? ([]) :
                ([]);

  for (const item of items) {
    const card = document.createElement('div');
    card.className = 'shop-item-card';

    const isOwned = tab === 'avatars' ? shopData.ownedAvatars.includes(item.id) :
                    tab === 'tables' ? shopData.ownedTables.includes(item.id) :
                    shopData.ownedCardbacks.includes(item.id);

    const isEquipped = tab === 'avatars' ? shopData.equippedAvatar === item.id :
                       tab === 'tables' ? shopData.equippedTable === item.id :
                       shopData.equippedCardback === item.id;

    card.innerHTML = `
      <div style="font-size: 3em; margin-bottom: 10px;">${item.emoji}</div>
      <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">${item.name}</div>
      <div style="font-size: 12px; color: #666; margin-bottom: 10px;">${item.description}</div>
      ${isOwned ? `
        <div style="color: #059669; font-size: 12px; margin-bottom: 10px;">✓ ${t('owned')}</div>
        <button class="btn-primary" style="width: 100%;" data-action="equip" data-tab="${tab}" data-id="${item.id}">
          ${isEquipped ? t('equipped') : t('equip')}
        </button>
      ` : `
        <div style="font-size: 14px; font-weight: bold; color: #dc2626; margin-bottom: 10px;">
          💰 ${formatNumber(item.price)}
        </div>
        <button class="btn-primary" style="width: 100%;" data-action="buy-item" data-id="${item.id}" data-price="${item.price}" data-tab="${tab}">
          ${t('buy')}
        </button>
      `}
    `;

    grid.appendChild(card);
  }
}

function renderMissions() {
  const container = document.querySelector('.missions-container');
  if (!container || !dailyMission) return;

  container.innerHTML = '';

  for (const mission of dailyMission.missions) {
    const progress = Math.min((mission.current / mission.target) * 100, 100);
    const isClaimed = dailyMission.claimedRewards.includes(mission.id);
    const isCompleted = mission.current >= mission.target;

    const card = document.createElement('div');
    card.className = 'mission-card';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <div style="font-weight: bold;">${t('mission_' + mission.type)}</div>
        <div style="color: #059669; font-weight: bold;">+${mission.reward}</div>
      </div>
      <div class="progress-bar" style="background: #e5e7eb; border-radius: 8px; overflow: hidden; height: 20px; margin-bottom: 10px;">
        <div style="background: #0284c7; height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
      </div>
      <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
        ${mission.current} / ${mission.target}
      </div>
      ${isCompleted && !isClaimed ? `
        <button class="btn-primary" style="width: 100%;" data-action="claim-mission" data-mission="${mission.id}">
          ${t('claim')}
        </button>
      ` : isClaimed ? `
        <div style="background: #059669; color: white; padding: 8px; border-radius: 6px; text-align: center; font-size: 12px;">
          ✓ ${t('claimed')}
        </div>
      ` : `
        <div style="background: #f3f4f6; padding: 8px; border-radius: 6px; text-align: center; font-size: 12px; color: #666;">
          ${t('in_progress')}
        </div>
      `}
    `;

    container.appendChild(card);
  }
}

function renderAchievements() {
  const container = document.querySelector('.achievements-container');
  if (!container) return;

  container.innerHTML = '';

  for (const achievement of ACHIEVEMENTS) {
    const isUnlocked = profile.unlockedAchievements && profile.unlockedAchievements.includes(achievement.id);

    const card = document.createElement('div');
    card.className = 'achievement-card';
    card.style.opacity = isUnlocked ? '1' : '0.5';
    card.innerHTML = `
      <div style="font-size: 2em; margin-bottom: 8px;">${achievement.icon}</div>
      <div style="font-weight: bold; font-size: 12px;">${achievement.name}</div>
      <div style="font-size: 10px; color: #666; margin-bottom: 8px;">${achievement.description}</div>
      ${isUnlocked ? `
        <div style="background: #059669; color: white; padding: 4px; border-radius: 4px; text-align: center; font-size: 10px;">
          ✓ ${t('unlocked')}
        </div>
      ` : `
        <div style="background: #e5e7eb; padding: 4px; border-radius: 4px; text-align: center; font-size: 10px; color: #666;">
          ${t('locked')}
        </div>
      `}
    `;

    container.appendChild(card);
  }
}

function renderRanking(tab = 'weekly') {
  const container = document.querySelector('.ranking-list');
  if (!container) return;

  container.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">Loading...</div>';

  // In real implementation, fetch from Online.getLeaderboard(tab)
  Online.getLeaderboard(tab).then(players => {
    container.innerHTML = '';

    if (!players || players.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">No players yet</div>';
      return;
    }

    players.slice(0, 50).forEach((player, idx) => {
      const row = document.createElement('div');
      row.className = 'rank-row';
      row.innerHTML = `
        <div style="font-weight: bold; color: #0284c7; min-width: 30px;">#${idx + 1}</div>
        <div style="flex: 1;">${player.name}</div>
        <div style="font-weight: bold;">${formatNumber(player.stars)} ⭐</div>
      `;
      container.appendChild(row);
    });
  });
}

function renderMultiplayerSeats(players) {
  const seats = document.querySelector('.mp-seats');
  if (!seats) return;

  seats.innerHTML = '';

  for (let i = 0; i < 8; i++) {
    const player = players[i];
    const seat = document.createElement('div');
    seat.className = 'player-seat';

    if (player) {
      seat.innerHTML = `
        <div style="font-size: 2em; margin-bottom: 8px;">${player.avatar}</div>
        <div style="font-weight: bold; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${player.name}
        </div>
        <div style="font-size: 11px; color: #666;">${formatNumber(player.stars)} ⭐</div>
        ${player.bet ? `
          <div style="background: #0284c7; color: white; padding: 4px; border-radius: 4px; font-size: 10px; margin-top: 4px;">
            Bet: ${formatNumber(player.betAmount)}
          </div>
        ` : ''}
      `;
    } else {
      seat.innerHTML = `
        <div style="font-size: 2em; color: #ddd;">+</div>
        <div style="font-size: 12px; color: #ccc;">${t('empty_seat')}</div>
      `;
    }

    seats.appendChild(seat);
  }
}

function renderRoomList(rooms) {
  const container = document.querySelector('.room-list');
  if (!container) return;

  container.innerHTML = '';

  if (!rooms || rooms.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; color: #999;">
        ${t('no_open_rooms')}
      </div>
    `;
    return;
  }

  for (const room of rooms) {
    const card = document.createElement('div');
    card.className = 'room-card';
    const playerCount = Object.keys(room.players || {}).length;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <div>
          <div style="font-weight: bold;">${t('room')} ${room.code}</div>
          <div style="font-size: 12px; color: #666;">${t('hosted_by')} ${room.hostName}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: bold;">${formatNumber(room.wager)}</div>
          <div style="font-size: 12px; color: #666;">${playerCount}/${room.maxPlayers}</div>
        </div>
      </div>
      <button class="btn-primary" style="width: 100%;" data-action="join-room" data-code="${room.code}">
        ${t('join')}
      </button>
    `;

    container.appendChild(card);
  }
}

function renderWaitingPlayers(players) {
  const container = document.querySelector('.waiting-players');
  if (!container) return;

  container.innerHTML = '';

  for (const player of Object.values(players || {})) {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'waiting-player';
    playerDiv.innerHTML = `
      <div style="font-size: 2em;">${player.avatar}</div>
      <div style="font-weight: bold;">${player.name}</div>
      <div style="font-size: 12px; color: #666;">${formatNumber(player.stars)} ⭐</div>
      ${player.ready ? `
        <div style="color: #059669; margin-top: 4px;">✓ Ready</div>
      ` : ''}
    `;
    container.appendChild(playerDiv);
  }
}

function checkAchievements() {
  if (!profile) return;

  for (const achievement of ACHIEVEMENTS) {
    if (profile.unlockedAchievements && profile.unlockedAchievements.includes(achievement.id)) {
      continue;
    }

    if (achievement.req(profile)) {
      if (!profile.unlockedAchievements) profile.unlockedAchievements = [];
      profile.unlockedAchievements.push(achievement.id);
      showToast('🏆 ' + achievement.name + ' ' + t('unlocked'), 3000);
      vibrate([100, 50, 100, 50, 100]);
    }
  }
}

function checkDailyMissions(type, value) {
  if (!dailyMission) return;

  for (const mission of dailyMission.missions) {
    if (mission.type === type && mission.current < mission.target) {
      mission.current += value;

      if (mission.current >= mission.target) {
        showToast(t('mission_complete') + ' ' + mission.name, 2000);
      }
    }
  }

  saveDailyMission();
}

function resetDailyMissions() {
  const today = getDayKey();

  if (dailyMission && dailyMission.date === today) {
    return;
  }

  loadDailyMission();
}

// SECTION 6A: GAME HISTORY & STATISTICS SYSTEM
let gameHistory = [];

function loadHistory() {
  try {
    const stored = localStorage.getItem('bac_history_v2');
    gameHistory = stored ? JSON.parse(stored) : [];
  } catch(e) {
    gameHistory = [];
  }
}

function saveHistory() {
  try {
    if (gameHistory.length > 200) gameHistory = gameHistory.slice(-200);
    localStorage.setItem('bac_history_v2', JSON.stringify(gameHistory));
  } catch(e) {}
}

function addToHistory(result, betType, betAmount, payout, playerCards, bankerCards, playerScore, bankerScore) {
  gameHistory.push({
    timestamp: Date.now(),
    result,
    betType,
    betAmount,
    payout,
    playerCards: playerCards.map(c => c.rank + c.suit),
    bankerCards: bankerCards.map(c => c.rank + c.suit),
    playerScore,
    bankerScore,
    wasNatural: playerScore >= 8 || bankerScore >= 8,
    won: (betType === result) || (result === 'tie' && betType === 'tie')
  });
  saveHistory();
}

function getStatistics() {
  if (gameHistory.length === 0) {
    return {
      totalGames: 0,
      totalWins: 0,
      totalLoss: 0,
      winRate: 0,
      playerWinCount: 0,
      bankerWinCount: 0,
      tieCount: 0,
      naturalCount: 0,
      biggestWin: 0,
      biggestLoss: 0,
      averageBet: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalBetAmount: 0,
      totalWonAmount: 0,
      favoriteBet: 'player'
    };
  }

  let totalBet = 0, totalWon = 0;
  let playerWins = 0, bankerWins = 0, ties = 0, naturals = 0;
  let biggestWin = 0, biggestLoss = 0;
  let currentStreak = 0, bestStreak = 0;
  let playerBets = 0, bankerBets = 0, tieBets = 0;

  for (let i = 0; i < gameHistory.length; i++) {
    const h = gameHistory[i];
    totalBet += h.betAmount;
    totalWon += h.payout;

    if (h.result === 'player') playerWins++;
    if (h.result === 'banker') bankerWins++;
    if (h.result === 'tie') ties++;

    if (h.wasNatural) naturals++;

    if (h.betType === 'player') playerBets++;
    if (h.betType === 'banker') bankerBets++;
    if (h.betType === 'tie') tieBets++;

    const netWin = h.payout - h.betAmount;
    if (netWin > 0) {
      biggestWin = Math.max(biggestWin, netWin);
      currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
    } else {
      biggestLoss = Math.min(biggestLoss, netWin);
      currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
    }

    bestStreak = Math.max(bestStreak, Math.abs(currentStreak));
  }

  const totalGames = gameHistory.length;
  const totalWins = gameHistory.filter(h => h.won).length;
  const totalLoss = totalGames - totalWins;
  const winRate = totalGames > 0 ? (totalWins / totalGames * 100).toFixed(2) : 0;
  const averageBet = totalGames > 0 ? Math.floor(totalBet / totalGames) : 0;

  const favoriteBet = playerBets >= bankerBets && playerBets >= tieBets ? 'player' :
                      bankerBets >= tieBets ? 'banker' : 'tie';

  return {
    totalGames, totalWins, totalLoss, winRate,
    playerWinCount: playerWins,
    bankerWinCount: bankerWins,
    tieCount: ties,
    naturalCount: naturals,
    biggestWin,
    biggestLoss: Math.abs(biggestLoss),
    averageBet,
    currentStreak: Math.abs(currentStreak),
    bestStreak,
    totalBetAmount: totalBet,
    totalWonAmount: totalWon,
    favoriteBet
  };
}

function getStreakInfo() {
  if (gameHistory.length === 0) return { type: 'none', count: 0 };

  let streak = 0;
  let type = gameHistory[gameHistory.length - 1].won ? 'win' : 'loss';

  for (let i = gameHistory.length - 1; i >= 0; i--) {
    const h = gameHistory[i];
    const isWin = h.won;

    if ((isWin && type === 'win') || (!isWin && type === 'loss')) {
      streak++;
    } else {
      break;
    }
  }

  return { type, count: streak };
}

function getBetDistribution() {
  if (gameHistory.length === 0) return { player: 0, banker: 0, tie: 0 };

  const playerBets = gameHistory.filter(h => h.betType === 'player').length;
  const bankerBets = gameHistory.filter(h => h.betType === 'banker').length;
  const tieBets = gameHistory.filter(h => h.betType === 'tie').length;
  const total = gameHistory.length;

  return {
    player: total > 0 ? (playerBets / total * 100).toFixed(1) : 0,
    banker: total > 0 ? (bankerBets / total * 100).toFixed(1) : 0,
    tie: total > 0 ? (tieBets / total * 100).toFixed(1) : 0
  };
}

function renderStatisticsPanel() {
  const stats = getStatistics();
  const streak = getStreakInfo();
  const distribution = getBetDistribution();

  let html = `
    <div class="stats-panel">
      <h3>${t('statistics')}</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">${t('total_games')}</div>
          <div class="stat-value">${stats.totalGames}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">${t('total_wins')}</div>
          <div class="stat-value">${stats.totalWins}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">${t('win_rate')}</div>
          <div class="stat-value">${stats.winRate}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">${t('avg_bet')}</div>
          <div class="stat-value">${formatNumber(stats.averageBet)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">${t('biggest_win')}</div>
          <div class="stat-value" style="color: #4ade80;">+${formatNumber(stats.biggestWin)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">${t('biggest_loss')}</div>
          <div class="stat-value" style="color: #ef4444;">-${formatNumber(stats.biggestLoss)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">${t('player_wins')}</div>
          <div class="stat-value">${stats.playerWinCount}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">${t('banker_wins')}</div>
          <div class="stat-value">${stats.bankerWinCount}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">${t('tie_count')}</div>
          <div class="stat-value">${stats.tieCount}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">${t('natural_count')}</div>
          <div class="stat-value">${stats.naturalCount}</div>
        </div>
      </div>
      <div class="stat-row">
        <strong>${t('current_streak')}:</strong> ${streak.count} ${streak.type === 'win' ? '🔥' : '❄️'}
      </div>
      <div class="stat-row">
        <strong>${t('best_streak')}:</strong> ${stats.bestStreak} 🏆
      </div>
      <div class="stat-row">
        <strong>${t('total_bets')}:</strong> ${formatNumber(stats.totalBetAmount)} ⭐
      </div>
      <div class="stat-row">
        <strong>${t('favorite_bet')}:</strong> ${stats.favoriteBet === 'player' ? '🎰' : stats.favoriteBet === 'banker' ? '🤵' : '🍀'}
      </div>
    </div>
  `;

  return html;
}

// SECTION 7: FIREBASE & ONLINE MODULE
const Online = {
  db: null,
  uid: null,
  roomRef: null,
  roomCode: null,
  isHost: false,
  listeners: [],

  async ready() {
    try {
      if (typeof firebase === 'undefined') {
        console.warn('Firebase not loaded');
        return;
      }
      this.db = firebase.database();
      const auth = await firebase.auth().signInAnonymously();
      this.uid = auth.user.uid;
    } catch(e) {
      console.warn('Firebase init error:', e);
    }
  },

  goOnline() {
    if (!this.db || !this.uid) return;

    try {
      const presRef = this.db.ref('baccaratPresence/' + this.uid);
      presRef.set({
        name: profile.nickname,
        avatar: shopData.equippedAvatar,
        stars: profile.stars,
        online: true,
        lastSeen: (firebaseAvailable() ? firebase.database.ServerValue.TIMESTAMP : Date.now())
      });
      presRef.onDisconnect().remove();
    } catch(e) {
      console.warn('Error setting presence:', e);
    }
  },

  async getOnlineCount() {
    if (!this.db) return 0;
    try {
      const snap = await this.db.ref('baccaratPresence').once('value');
      return snap.numChildren();
    } catch(e) {
      console.warn('Error getting online count:', e);
      return 0;
    }
  },

  async createRoom(wager) {
    if (!this.db || !this.uid) return null;

    try {
      const code = generateRoomCode();
      const roomRef = this.db.ref('baccaratRooms/' + code);

      await roomRef.set({
        code,
        hostId: this.uid,
        hostName: profile.nickname,
        hostAvatar: shopData.equippedAvatar,
        wager,
        status: 'waiting',
        maxPlayers: 8,
        round: 1,
        players: {
          [this.uid]: {
            name: profile.nickname,
            avatar: shopData.equippedAvatar,
            stars: profile.stars,
            bet: null,
            betAmount: 0,
            ready: false,
            seat: 0
          }
        },
        currentRound: {
          playerCards: [],
          bankerCards: [],
          result: null
        },
        createdAt: (firebaseAvailable() ? firebase.database.ServerValue.TIMESTAMP : Date.now())
      });

      this.roomCode = code;
      this.isHost = true;
      this.roomRef = roomRef;

      onlineState.inRoom = true;
      onlineState.roomCode = code;
      onlineState.isHost = true;

      return code;
    } catch(e) {
      console.error('Error creating room:', e);
      return null;
    }
  },

  async joinRoom(code) {
    if (!this.db || !this.uid) return false;

    try {
      const roomRef = this.db.ref('baccaratRooms/' + code);
      const snap = await roomRef.once('value');

      if (!snap.exists()) {
        showToast(t('room_not_found'));
        return false;
      }

      const room = snap.val();
      const playerCount = Object.keys(room.players || {}).length;

      if (playerCount >= room.maxPlayers) {
        showToast(t('room_full'));
        return false;
      }

      await roomRef.child('players/' + this.uid).set({
        name: profile.nickname,
        avatar: shopData.equippedAvatar,
        stars: profile.stars,
        bet: null,
        betAmount: 0,
        ready: false,
        seat: playerCount
      });

      this.roomCode = code;
      this.roomRef = roomRef;

      onlineState.inRoom = true;
      onlineState.roomCode = code;
      onlineState.isHost = false;

      return true;
    } catch(e) {
      console.error('Error joining room:', e);
      return false;
    }
  },

  async leaveRoom() {
    if (!this.roomRef || !this.uid) return;

    try {
      await this.roomRef.child('players/' + this.uid).remove();

      const snap = await this.roomRef.once('value');
      const room = snap.val();

      if (!room || Object.keys(room.players || {}).length === 0) {
        await this.roomRef.remove();
      }

      this.roomCode = null;
      this.roomRef = null;
      this.isHost = false;
      this.cleanupListeners();

      onlineState.inRoom = false;
      onlineState.roomCode = null;
      onlineState.isHost = false;
    } catch(e) {
      console.error('Error leaving room:', e);
    }
  },

  async startGame() {
    if (!this.roomRef || !this.isHost) return;

    try {
      await this.roomRef.update({
        status: 'playing'
      });
    } catch(e) {
      console.error('Error starting game:', e);
    }
  },

  async placeBet(betType, betAmount) {
    if (!this.roomRef || !this.uid) return;

    try {
      await this.roomRef.child('players/' + this.uid).update({
        bet: betType,
        betAmount: betAmount,
        ready: true
      });
    } catch(e) {
      console.error('Error placing bet:', e);
    }
  },

  async submitResult(result) {
    if (!this.roomRef) return;

    try {
      await this.roomRef.child('currentRound').set(result);

      // Award stars to winners
      const snap = await this.roomRef.once('value');
      const room = snap.val();

      for (const [uid, player] of Object.entries(room.players || {})) {
        if (player.ready && player.bet === result.result) {
          const payout = Math.floor(player.betAmount * PAYOUTS[player.bet]);
          const userRef = this.db.ref('users/' + uid);
          const userSnap = await userRef.once('value');
          const userData = userSnap.val() || {};
          await userRef.set({
            ...userData,
            stars: (userData.stars || 0) + payout
          });
        }
      }

      // Reset for next round
      await this.roomRef.update({
        status: 'waiting',
        round: (room.round || 1) + 1,
        'currentRound': { playerCards: [], bankerCards: [], result: null }
      });

      // Clear player bets
      for (const uid of Object.keys(room.players || {})) {
        await this.roomRef.child('players/' + uid).update({
          bet: null,
          betAmount: 0,
          ready: false
        });
      }
    } catch(e) {
      console.error('Error submitting result:', e);
    }
  },

  onRoomUpdate(callback) {
    if (!this.roomRef) return;

    const listener = this.roomRef.on('value', snap => {
      callback(snap.val());
    });

    this.listeners.push({ ref: this.roomRef, type: 'value', listener });
  },

  async getOpenRooms() {
    if (!this.db) return [];

    try {
      const snap = await this.db.ref('baccaratRooms')
        .orderByChild('status')
        .equalTo('waiting')
        .once('value');

      const rooms = [];
      snap.forEach(childSnap => {
        rooms.push(childSnap.val());
      });

      return rooms.slice(0, 20);
    } catch(e) {
      console.warn('Error getting open rooms:', e);
      return [];
    }
  },

  async updateLeaderboard() {
    if (!this.db || !this.uid) return;

    try {
      const weekStart = getWeekStart();
      await this.db.ref('leaderboards/baccarat/weekly/' + this.uid).set({
        uid: this.uid,
        name: profile.nickname,
        avatar: shopData.equippedAvatar,
        stars: profile.stars,
        wins: profile.todayWins,
        played: profile.todayGames,
        timestamp: (firebaseAvailable() ? firebase.database.ServerValue.TIMESTAMP : Date.now()),
        weekStart: weekStart
      });

      await this.db.ref('leaderboards/baccarat/total/' + this.uid).set({
        uid: this.uid,
        name: profile.nickname,
        avatar: shopData.equippedAvatar,
        stars: profile.stars,
        wins: profile.totalWins,
        played: profile.totalPlayed,
        timestamp: (firebaseAvailable() ? firebase.database.ServerValue.TIMESTAMP : Date.now())
      });
    } catch(e) {
      console.warn('Error updating leaderboard:', e);
    }
  },

  async getLeaderboard(type = 'weekly') {
    if (!this.db) return [];

    try {
      const path = type === 'weekly' ? 'leaderboards/baccarat/weekly' :
                   type === 'total' ? 'leaderboards/baccarat/total' :
                   'leaderboards/baccarat/lastWeek';

      const snap = await this.db.ref(path)
        .orderByChild('stars')
        .limitToLast(50)
        .once('value');

      const players = [];
      snap.forEach(childSnap => {
        players.unshift(childSnap.val());
      });

      return players;
    } catch(e) {
      console.warn('Error getting leaderboard:', e);
      return [];
    }
  },

  cleanupListeners() {
    for (const { ref, type, listener } of this.listeners) {
      ref.off(type, listener);
    }
    this.listeners = [];
  }
};

// SECTION 7A: ADVANCED ROAD MAP SYSTEM
let roadMapData = {
  bigRoad: [],
  beadRoad: [],
  bigEyeRoad: []
};

function updateRoadMaps(result) {
  // Update Big Road - tracks player/banker streaks in columns
  const lastEntry = roadMapData.bigRoad[roadMapData.bigRoad.length - 1];

  if (!lastEntry || lastEntry.result !== result) {
    roadMapData.bigRoad.push({
      result: result,
      count: 1,
      round: gameHistory.length,
      timestamp: Date.now()
    });
  } else {
    lastEntry.count++;
  }

  // Keep only last 40 entries
  if (roadMapData.bigRoad.length > 40) {
    roadMapData.bigRoad = roadMapData.bigRoad.slice(-40);
  }

  // Update Bead Road - simple grid of results
  roadMapData.beadRoad.push({
    result: result,
    timestamp: Date.now()
  });

  if (roadMapData.beadRoad.length > 240) {
    roadMapData.beadRoad = roadMapData.beadRoad.slice(-240);
  }

  // Update Big Eye Road - derived from Big Road patterns
  if (roadMapData.bigRoad.length >= 2) {
    const prev = roadMapData.bigRoad[roadMapData.bigRoad.length - 2];
    const curr = roadMapData.bigRoad[roadMapData.bigRoad.length - 1];

    roadMapData.bigEyeRoad.push({
      pattern: prev.result === curr.result ? 'repeat' : 'change',
      timestamp: Date.now()
    });

    if (roadMapData.bigEyeRoad.length > 20) {
      roadMapData.bigEyeRoad = roadMapData.bigEyeRoad.slice(-20);
    }
  }
}

function renderRoadMaps() {
  const beadHtml = renderBeadRoad();
  const bigHtml = renderBigRoad();
  const eyeHtml = renderBigEyeRoad();

  return `
    <div class="road-maps-container">
      <div class="road-tabs">
        <button class="road-tab active" data-tab="bead">${t('road_map_bead')}</button>
        <button class="road-tab" data-tab="big">${t('road_map_big')}</button>
        <button class="road-tab" data-tab="eye">${t('road_map_eye')}</button>
      </div>
      <div class="road-content">
        <div class="road-tab-pane active" data-pane="bead">${beadHtml}</div>
        <div class="road-tab-pane" data-pane="big">${bigHtml}</div>
        <div class="road-tab-pane" data-pane="eye">${eyeHtml}</div>
      </div>
    </div>
  `;
}

function renderBeadRoad() {
  if (roadMapData.beadRoad.length === 0) {
    return `<div class="empty-road">${t('no_results')}</div>`;
  }

  const rows = 6;
  const cols = 8;
  let html = '<div class="bead-road">';

  // Show last 48 results (6 rows × 8 cols)
  const startIdx = Math.max(0, roadMapData.beadRoad.length - (rows * cols));
  const results = roadMapData.beadRoad.slice(startIdx);

  for (let r = 0; r < rows; r++) {
    html += '<div class="bead-row">';
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx < results.length) {
        const entry = results[idx];
        const color = entry.result === 'player' ? '#4a9eff' :
                      entry.result === 'banker' ? '#ff4444' : '#4ecdc4';
        html += `<div class="bead" style="background: ${color};" title="${entry.result}"></div>`;
      } else {
        html += '<div class="bead empty"></div>';
      }
    }
    html += '</div>';
  }

  html += '</div>';
  return html;
}

function renderBigRoad() {
  if (roadMapData.bigRoad.length === 0) {
    return `<div class="empty-road">${t('no_results')}</div>`;
  }

  let html = '<div class="big-road">';
  const maxRow = Math.ceil(roadMapData.bigRoad.length / 2) + 1;

  for (let row = 0; row < maxRow; row++) {
    html += '<div class="big-road-row">';

    // Player column
    const playerIdx = row;
    if (playerIdx < roadMapData.bigRoad.length && roadMapData.bigRoad[playerIdx].result === 'player') {
      const entry = roadMapData.bigRoad[playerIdx];
      html += `<div class="big-road-cell player" title="Player ×${entry.count}">🔵</div>`;
    } else if (playerIdx < roadMapData.bigRoad.length && roadMapData.bigRoad[playerIdx].result !== 'player') {
      html += '<div class="big-road-cell empty"></div>';
    } else {
      html += '<div class="big-road-cell empty"></div>';
    }

    // Banker column
    const bankerIdx = row;
    if (bankerIdx < roadMapData.bigRoad.length && roadMapData.bigRoad[bankerIdx].result === 'banker') {
      const entry = roadMapData.bigRoad[bankerIdx];
      html += `<div class="big-road-cell banker" title="Banker ×${entry.count}">🔴</div>`;
    } else if (bankerIdx < roadMapData.bigRoad.length && roadMapData.bigRoad[bankerIdx].result !== 'banker') {
      html += '<div class="big-road-cell empty"></div>';
    } else {
      html += '<div class="big-road-cell empty"></div>';
    }

    // Tie column
    const tieIdx = row;
    if (tieIdx < roadMapData.bigRoad.length && roadMapData.bigRoad[tieIdx].result === 'tie') {
      html += `<div class="big-road-cell tie" title="Tie">💚</div>`;
    } else if (tieIdx < roadMapData.bigRoad.length && roadMapData.bigRoad[tieIdx].result !== 'tie') {
      html += '<div class="big-road-cell empty"></div>';
    } else {
      html += '<div class="big-road-cell empty"></div>';
    }

    html += '</div>';
  }

  html += '</div>';
  return html;
}

function renderBigEyeRoad() {
  if (roadMapData.bigEyeRoad.length === 0) {
    return `<div class="empty-road">${t('no_results')}</div>`;
  }

  let html = '<div class="big-eye-road">';

  for (let i = 0; i < roadMapData.bigEyeRoad.length; i++) {
    const entry = roadMapData.bigEyeRoad[i];
    const emoji = entry.pattern === 'repeat' ? '🔄' : '✖️';
    const color = entry.pattern === 'repeat' ? '#4ade80' : '#ef4444';

    html += `<div class="eye-item" style="background: ${color}30; border: 1px solid ${color};">${emoji}</div>`;
  }

  html += '</div>';
  return html;
}

// SECTION 7B: ENHANCED TUTORIAL SYSTEM
const TUTORIAL_STEPS = [
  {
    title_key: 'tut_title_1',
    content_key: 'tut_content_1',
    icon: '🎰',
    highlight: null
  },
  {
    title_key: 'tut_title_2',
    content_key: 'tut_content_2',
    icon: '🃏',
    highlight: null
  },
  {
    title_key: 'tut_title_3',
    content_key: 'tut_content_3',
    icon: '9️⃣',
    highlight: null
  },
  {
    title_key: 'tut_title_4',
    content_key: 'tut_content_4',
    icon: '📋',
    highlight: null
  },
  {
    title_key: 'tut_title_5',
    content_key: 'tut_content_5',
    icon: '⭐',
    highlight: null
  },
  {
    title_key: 'tut_title_6',
    content_key: 'tut_content_6',
    icon: '🎯',
    highlight: null
  },
  {
    title_key: 'tut_title_7',
    content_key: 'tut_content_7',
    icon: '🤵',
    highlight: null
  },
  {
    title_key: 'tut_title_8',
    content_key: 'tut_content_8',
    icon: '💰',
    highlight: null
  }
];

function renderTutorialStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= TUTORIAL_STEPS.length) return '';

  const step = TUTORIAL_STEPS[stepIndex];
  const totalSteps = TUTORIAL_STEPS.length;
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  let html = `
    <div class="tutorial-card">
      <div class="tutorial-progress">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
      <div class="tutorial-header">
        <span class="tutorial-icon">${step.icon}</span>
        <h2>${t(step.title_key)}</h2>
        <span class="tutorial-counter">${stepIndex + 1}/${totalSteps}</span>
      </div>
      <div class="tutorial-content">
        ${t(step.content_key)}
      </div>
  `;

  if (stepIndex === 1) {
    html += `<div class="card-values-table">${getCardValuesTable()}</div>`;
  }

  if (stepIndex === 6) {
    html += `<div class="banker-table">${showBankerTable()}</div>`;
  }

  if (stepIndex === 7) {
    html += `<div class="payout-table">${showPayoutTable()}</div>`;
  }

  html += `
      <div class="tutorial-actions">
        ${stepIndex > 0 ? `<button class="btn-secondary" data-action="tutorial-prev">← ${t('prev')}</button>` : ''}
        ${stepIndex < totalSteps - 1 ? `<button class="btn-primary" data-action="tutorial-next">${t('next')} →</button>` : `<button class="btn-primary" data-action="tutorial-done">${t('start_game')}</button>`}
      </div>
    </div>
  `;

  return html;
}

function getCardValuesTable() {
  return `
    <table class="values-table">
      <tr><td>A</td><td>=</td><td>1</td></tr>
      <tr><td>2-9</td><td>=</td><td>${t('face_value')}</td></tr>
      <tr><td>10,J,Q,K</td><td>=</td><td>0</td></tr>
    </table>
  `;
}

function showBankerTable() {
  return `
    <div class="banker-3rd-table">
      <h4>${t('banker_3rd_rule')}</h4>
      <table>
        <tr><th>${t('banker_score')}</th><th>${t('draws_on')}</th></tr>
        <tr><td>0-2</td><td>${t('always_draws')}</td></tr>
        <tr><td>3</td><td>${t('any_except')} 8</td></tr>
        <tr><td>4</td><td>2-7</td></tr>
        <tr><td>5</td><td>4-7</td></tr>
        <tr><td>6</td><td>6-7</td></tr>
        <tr><td>7+</td><td>${t('always_stands')}</td></tr>
      </table>
    </div>
  `;
}

function showPayoutTable() {
  return `
    <div class="payout-table-div">
      <h4>${t('payouts')}</h4>
      <div class="payout-row">
        <span>${t('player_win')}</span>
        <span class="payout-value">1:1 (×2)</span>
      </div>
      <div class="payout-row">
        <span>${t('banker_win')}</span>
        <span class="payout-value">0.95:1 (×1.95)</span>
      </div>
      <div class="payout-row">
        <span>${t('tie')}</span>
        <span class="payout-value">8:1 (×9)</span>
      </div>
    </div>
  `;
}

let currentTutorialStep = 0;

function showTutorial() {
  const modal = document.createElement('div');
  modal.className = 'tutorial-modal';
  modal.innerHTML = renderTutorialStep(0);

  const root = document.getElementById('kk-root');
  if (root) root.appendChild(modal);

  setupTutorialHandlers();
}

function setupTutorialHandlers() {
  const root = document.getElementById('kk-root');
  if (!root) return;

  root.addEventListener('click', e => {
    if (e.target.getAttribute('data-action') === 'tutorial-next') {
      currentTutorialStep++;
      const modal = root.querySelector('.tutorial-modal');
      if (modal) modal.innerHTML = renderTutorialStep(currentTutorialStep);
      setupTutorialHandlers();
    }

    if (e.target.getAttribute('data-action') === 'tutorial-prev') {
      currentTutorialStep--;
      const modal = root.querySelector('.tutorial-modal');
      if (modal) modal.innerHTML = renderTutorialStep(currentTutorialStep);
      setupTutorialHandlers();
    }

    if (e.target.getAttribute('data-action') === 'tutorial-done') {
      const modal = root.querySelector('.tutorial-modal');
      if (modal) modal.remove();
      currentTutorialStep = 0;
    }
  });
}

// SECTION 7C: ENHANCED SETTINGS SYSTEM
// (loadSettings/saveSettings are defined in Section 1 - settings variable includes all enhanced fields)

function applyTheme(theme) {
  const root = document.documentElement;

  const themes = {
    dark: {
      '--primary': '#d4af37',
      '--primary-light': '#f0c850',
      '--dark-bg': '#0a0e17',
      '--card-bg': '#1a1f3a'
    },
    midnight: {
      '--primary': '#7c3aed',
      '--primary-light': '#a78bfa',
      '--dark-bg': '#0f0117',
      '--card-bg': '#1a0f3a'
    },
    'deep-purple': {
      '--primary': '#c084fc',
      '--primary-light': '#e9d5ff',
      '--dark-bg': '#2d1b4e',
      '--card-bg': '#3f2461'
    }
  };

  const colors = themes[theme] || themes.dark;
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  settings.theme = theme;
  saveSettings();
}

function getAnimationDelay() {
  const delays = {
    slow: 600,
    normal: 400,
    fast: 200
  };
  return delays[settings.animationSpeed] || 400;
}

function renderEnhancedSettings() {
  return `
    <div class="settings-panel">
      <h3>${t('settings')}</h3>

      <div class="setting-group">
        <label>${t('anim_speed')}</label>
        <div class="setting-options">
          <button class="setting-btn ${settings.animationSpeed === 'slow' ? 'active' : ''}" data-setting-anim="slow">${t('anim_slow')}</button>
          <button class="setting-btn ${settings.animationSpeed === 'normal' ? 'active' : ''}" data-setting-anim="normal">${t('anim_normal')}</button>
          <button class="setting-btn ${settings.animationSpeed === 'fast' ? 'active' : ''}" data-setting-anim="fast">${t('anim_fast')}</button>
        </div>
      </div>

      <div class="setting-group">
        <label>${t('theme')}</label>
        <div class="setting-options">
          <button class="setting-btn ${settings.theme === 'dark' ? 'active' : ''}" data-setting-theme="dark">🌙 ${t('theme_dark')}</button>
          <button class="setting-btn ${settings.theme === 'midnight' ? 'active' : ''}" data-setting-theme="midnight">⭐ ${t('theme_midnight')}</button>
          <button class="setting-btn ${settings.theme === 'deep-purple' ? 'active' : ''}" data-setting-theme="deep-purple">💜 ${t('theme_purple')}</button>
        </div>
      </div>

      <div class="setting-group">
        <label>${t('card_style')}</label>
        <div class="setting-options">
          <button class="setting-btn ${settings.cardStyle === 'classic' ? 'active' : ''}" data-setting-card="classic">${t('card_classic')}</button>
          <button class="setting-btn ${settings.cardStyle === 'modern' ? 'active' : ''}" data-setting-card="modern">${t('card_modern')}</button>
          <button class="setting-btn ${settings.cardStyle === 'minimal' ? 'active' : ''}" data-setting-card="minimal">${t('card_minimal')}</button>
        </div>
      </div>

      <div class="setting-group">
        <label>${t('auto_deal')}</label>
        <div class="toggle-switch">
          <input type="checkbox" id="auto-deal-toggle" ${settings.autoDeal ? 'checked' : ''} data-setting="autoDeal">
          <span class="toggle-slider"></span>
        </div>
      </div>

      <div class="setting-group">
        <label>${t('sound')}</label>
        <div class="toggle-switch">
          <input type="checkbox" id="sound-toggle" ${settings.sound ? 'checked' : ''} data-setting="soundEnabled">
          <span class="toggle-slider"></span>
        </div>
      </div>

      <div class="setting-group">
        <label>${t('vibrate')}</label>
        <div class="toggle-switch">
          <input type="checkbox" id="vibrate-toggle" ${settings.vibrate ? 'checked' : ''} data-setting="vibrationEnabled">
          <span class="toggle-slider"></span>
        </div>
      </div>

      <div class="setting-group">
        <label>${t('notifications')}</label>
        <div class="toggle-switch">
          <input type="checkbox" id="notif-toggle" ${settings.notificationEnabled ? 'checked' : ''} data-setting="notificationEnabled">
          <span class="toggle-slider"></span>
        </div>
      </div>
    </div>
  `;
}

// SECTION 7D: BANKRUPT & RECOVERY SYSTEM
function checkBankrupt() {
  if (profile.stars < CHIPS[0]) {
    showBankruptModal();
  }
}

function showBankruptModal() {
  const modal = document.createElement('div');
  modal.className = 'bankrupt-modal-overlay';
  modal.innerHTML = `
    <div class="bankrupt-modal">
      <h2>💸 ${t('bankrupt')}</h2>
      <p>${t('recovery_desc')}</p>
      <div class="recovery-options">
        <button class="btn-primary" data-action="watch-ad">${t('watch_ad')} (+500 ⭐)</button>
        <button class="btn-secondary" data-action="daily-reminder">${t('daily_reminder')}</button>
        <button class="btn-info" data-action="reset-game">${t('reset_stats')}</button>
      </div>
    </div>
  `;

  const root = document.getElementById('kk-root');
  if (root) {
    root.appendChild(modal);

    modal.addEventListener('click', e => {
      if (e.target.getAttribute('data-action') === 'watch-ad') {
        grantRecoveryStars(500);
        modal.remove();
      }
      if (e.target.getAttribute('data-action') === 'reset-game') {
        resetGame();
        modal.remove();
      }
    });
  }
}

function grantRecoveryStars(amount) {
  profile.stars += amount;
  saveProfile();
  updateAllUI();
  showToast(t('recovery_stars').replace('{n}', amount), 2000);
}

function resetGame() {
  profile.stars = STARTING_STARS;
  profile.totalWins = 0;
  profile.totalPlayed = 0;
  profile.bestStreak = 0;
  profile.peakStars = STARTING_STARS;
  gameHistory = [];
  saveProfile();
  saveHistory();
  updateAllUI();
  showToast(t('game_reset'), 2000);
}

// SECTION 7E: SESSION STATISTICS TRACKER
let sessionStats = {
  startTime: Date.now(),
  gamesPlayed: 0,
  gamesWon: 0,
  starsWon: 0,
  starsLost: 0,
  biggestWin: 0,
  streakMax: 0
};

function updateSessionStats(won, amount) {
  sessionStats.gamesPlayed++;
  if (won) {
    sessionStats.gamesWon++;
    sessionStats.starsWon += amount;
    sessionStats.biggestWin = Math.max(sessionStats.biggestWin, amount);
  } else {
    sessionStats.starsLost += amount;
  }
}

function getSessionDuration() {
  const elapsed = Date.now() - sessionStats.startTime;
  const hours = Math.floor(elapsed / 3600000);
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

function renderSessionSummary() {
  const duration = getSessionDuration();
  const winRate = sessionStats.gamesPlayed > 0 ?
    ((sessionStats.gamesWon / sessionStats.gamesPlayed) * 100).toFixed(1) : 0;
  const netGain = sessionStats.starsWon - sessionStats.starsLost;

  return `
    <div class="session-summary">
      <h3>${t('session_stats')}</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <span>${t('duration')}:</span>
          <span>${duration}</span>
        </div>
        <div class="summary-item">
          <span>${t('total_games')}:</span>
          <span>${sessionStats.gamesPlayed}</span>
        </div>
        <div class="summary-item">
          <span>${t('win_rate')}:</span>
          <span>${winRate}%</span>
        </div>
        <div class="summary-item">
          <span>${t('biggest_win')}:</span>
          <span>${formatNumber(sessionStats.biggestWin)}</span>
        </div>
        <div class="summary-item">
          <span>${t('net_change')}:</span>
          <span style="color: ${netGain >= 0 ? '#4ade80' : '#ef4444'};">${netGain >= 0 ? '+' : ''}${formatNumber(netGain)}</span>
        </div>
      </div>
    </div>
  `;
}

// SECTION 8: EVENT LISTENERS
function setupListeners() {
  const root = document.getElementById('kk-root');
  if (!root) return;

  // Data-action delegation
  root.addEventListener('click', e => {
    const action = e.target.closest('[data-action]');
    if (!action) return;

    const actionName = action.getAttribute('data-action');

    switch(actionName) {
      case 'claim-checkin':
        claimDailyBonus();
        break;

      case 'play-ai':
        gameState.mode = 'ai';
        gameState.aiPlayers = generateAIPlayers();
        showScreen('game');
        break;

      case 'play-online':
        showOnlinePanel();
        break;

      case 'deal':
        dealRound();
        break;

      case 'settings':
        showScreen('settings');
        break;

      case 'save-nick':
        const nickInput = root.querySelector('#nick-input');
        if (nickInput && nickInput.value.trim()) {
          profile.nickname = nickInput.value.trim();
          saveProfile();
          updateAllUI();
          showToast(t('nickname_updated'));
        }
        break;

      case 'reset-stats':
        if (confirm(t('reset_stats_confirm'))) {
          profile = {
            userId: profile.userId,
            nickname: 'Player',
            avatar: '🃏',
            stars: STARTING_STARS,
            xp: 0,
            level: 1,
            totalWins: 0,
            totalLoss: 0,
            totalPlayed: 0,
            bestStreak: 0,
            currentStreak: 0,
            tieWins: 0,
            biggestBet: 0,
            peakStars: STARTING_STARS,
            bankerBets: 0,
            todayGames: 0,
            todayWins: 0,
            todayTotalBet: 0,
            todayStreak: 0,
            todayBankerBets: 0,
            todayTieBets: 0,
            lastCheckinDate: null,
            unlockedAchievements: [],
            completedMissions: []
          };
          saveProfile();
          updateAllUI();
          showToast(t('stats_reset'));
        }
        break;

      case 'show-tutorial':
        showScreen('tutorial');
        break;

      case 'close-result':
        const resultOverlay = root.querySelector('.result-overlay');
        if (resultOverlay) resultOverlay.style.display = 'none';
        gameState.currentBet = null;
        gameState.betAmount = 0;
        renderChips();
        break;

      case 'toggle-sound':
        settings.sound = !settings.sound;
        saveSettings();
        updateAllUI();
        break;

      case 'toggle-vibrate':
        settings.vibrate = !settings.vibrate;
        saveSettings();
        updateAllUI();
        break;

      case 'claim-mission':
        const missionId = parseInt(action.getAttribute('data-mission'));
        if (dailyMission && !dailyMission.claimedRewards.includes(missionId)) {
          const mission = dailyMission.missions.find(m => m.id === missionId);
          if (mission && mission.current >= mission.target) {
            profile.stars += mission.reward;
            dailyMission.claimedRewards.push(missionId);
            saveProfile();
            saveDailyMission();
            showToast('+' + mission.reward + ' ⭐', 2000);
            renderMissions();
            updateAllUI();
          }
        }
        break;

      case 'equip':
        const tabEq = action.getAttribute('data-tab');
        const idEq = action.getAttribute('data-id');
        if (tabEq === 'avatars') shopData.equippedAvatar = idEq;
        else if (tabEq === 'tables') shopData.equippedTable = idEq;
        else if (tabEq === 'cardbacks') shopData.equippedCardback = idEq;
        saveShopData();
        renderShop(tabEq);
        break;

      case 'buy-item':
        const itemId = action.getAttribute('data-id');
        const price = parseInt(action.getAttribute('data-price'));
        const tabBuy = action.getAttribute('data-tab');

        if (profile.stars >= price) {
          profile.stars -= price;
          if (tabBuy === 'avatars') shopData.ownedAvatars.push(itemId);
          else if (tabBuy === 'tables') shopData.ownedTables.push(itemId);
          else if (tabBuy === 'cardbacks') shopData.ownedCardbacks.push(itemId);
          saveProfile();
          saveShopData();
          showToast(t('item_purchased'), 2000);
          renderShop(tabBuy);
          updateAllUI();
        } else {
          showToast(t('not_enough_stars'));
        }
        break;

      case 'join-room':
        const code = action.getAttribute('data-code');
        Online.joinRoom(code).then(success => {
          if (success) {
            gameState.mode = 'online';
            showScreen('multiplayer');
            Online.onRoomUpdate(room => {
              if (room) {
                renderMultiplayerSeats(Object.values(room.players || {}));
                onlineState.players = room.players;
              }
            });
          }
        });
        break;

      case 'create-room-btn':
        const wagerInput = root.querySelector('#room-wager-input');
        if (wagerInput) {
          const wager = parseInt(wagerInput.value) || 100;
          if (wager > 0 && profile.stars >= wager) {
            Online.createRoom(wager).then(roomCode => {
              if (roomCode) {
                gameState.mode = 'online';
                showScreen('multiplayer');
                Online.onRoomUpdate(room => {
                  if (room) {
                    renderMultiplayerSeats(Object.values(room.players || {}));
                    onlineState.players = room.players;
                  }
                });
              }
            });
          }
        }
        break;

      case 'start-game':
        Online.startGame();
        gameState.isDealing = false;
        break;

      case 'cancel-room':
        Online.leaveRoom().then(() => {
          gameState.mode = 'ai';
          showScreen('home');
        });
        break;

      case 'confirm-ready':
        const selectedBet = root.querySelector('.mp-bet-selector .active');
        const selectedChipMp = root.querySelector('.mp-chip-selector .active');
        if (selectedBet && selectedChipMp) {
          const bet = selectedBet.getAttribute('data-bet');
          const amount = parseInt(selectedChipMp.getAttribute('data-chip'));
          if (profile.stars >= amount) {
            profile.stars -= amount;
            Online.placeBet(bet, amount);
            saveProfile();
            updateAllUI();
          } else {
            showToast(t('not_enough_stars'));
          }
        }
        break;
    }
  });

  // Footer navigation
  root.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if (!nav) return;
    const screen = nav.getAttribute('data-nav');
    showScreen(screen);
  });

  // Back buttons
  root.addEventListener('click', e => {
    const back = e.target.closest('[data-back]');
    if (!back) return;
    showScreen('home');
  });

  // Chip selection
  root.addEventListener('click', e => {
    const chip = e.target.closest('[data-chip]');
    if (!chip) return;
    gameState.selectedChip = parseInt(chip.getAttribute('data-chip'));
    gameState.betAmount = 0;
    document.querySelectorAll('[data-chip]').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    playChipSelect();
  });

  // Bet placement
  root.addEventListener('click', e => {
    const bet = e.target.closest('[data-bet]');
    if (!bet) return;

    const betType = bet.getAttribute('data-bet');
    const amount = gameState.selectedChip;

    if (profile.stars < amount) {
      showToast(t('not_enough_stars'));
      return;
    }

    gameState.currentBet = betType;
    gameState.betAmount = amount;

    document.querySelectorAll('[data-bet]').forEach(b => b.classList.remove('active'));
    bet.classList.add('active');

    playBet();
    vibrate([50, 30, 50]);

    const betDisplay = root.querySelector('.current-bet-display');
    if (betDisplay) {
      betDisplay.innerHTML = `
        <div style="font-size: 24px; font-weight: bold;">
          ${betType.toUpperCase()}
        </div>
        <div style="font-size: 18px; color: #059669;">
          ${formatNumber(amount)} ⭐
        </div>
      `;
    }
  });

  // Ranking tabs
  root.addEventListener('click', e => {
    const tab = e.target.closest('[data-rank-tab]');
    if (!tab) return;
    const tabName = tab.getAttribute('data-rank-tab');
    root.querySelectorAll('[data-rank-tab]').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderRanking(tabName);
  });

  // Shop tabs
  root.addEventListener('click', e => {
    const tab = e.target.closest('[data-shop-tab]');
    if (!tab) return;
    const tabName = tab.getAttribute('data-shop-tab');
    root.querySelectorAll('[data-shop-tab]').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderShop(tabName);
  });

  // Language select
  const langSelect = root.querySelector('#lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', e => {
      lang = e.target.value;
      settings.language = lang;
      saveSettings();
      applyI18n();
      updateAllUI();
    });
  }

  // Room panel close
  const roomPanel = root.querySelector('.room-panel');
  if (roomPanel) {
    roomPanel.addEventListener('click', e => {
      if (e.target === roomPanel) {
        roomPanel.style.display = 'none';
      }
    });
  }
}

function generateAIPlayers() {
  const players = [];
  const count = Math.floor(Math.random() * 4) + 2;

  for (let i = 0; i < count; i++) {
    players.push({
      name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
      avatar: BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)],
      stars: Math.floor(Math.random() * 50000) + 5000,
      bet: ['player', 'banker', 'tie'][Math.floor(Math.random() * 3)],
      betAmount: CHIPS[Math.floor(Math.random() * CHIPS.length)]
    });
  }

  return players;
}

function showOnlinePanel() {
  const root = document.getElementById('kk-root');
  if (!root) return;

  const panel = root.querySelector('.room-panel');
  if (panel) {
    panel.style.display = 'flex';

    Online.getOpenRooms().then(rooms => {
      renderRoomList(rooms);
    });

    Online.getOnlineCount().then(count => {
      const countEl = root.querySelector('.online-count');
      if (countEl) countEl.textContent = count;
    });
  }
}

// SECTION 9: DAILY CHECK-IN SYSTEM
function checkDailyBonus() {
  const today = getDayKey();
  if (profile.lastCheckinDate === today) {
    const checkinCard = document.querySelector('.daily-checkin');
    if (checkinCard) checkinCard.style.display = 'none';
    return;
  }

  const checkinCard = document.querySelector('.daily-checkin');
  if (checkinCard) checkinCard.style.display = 'block';
}

function claimDailyBonus() {
  const today = getDayKey();
  if (profile.lastCheckinDate === today) {
    showToast(t('already_claimed'));
    return;
  }

  profile.stars += DAILY_BONUS;
  profile.lastCheckinDate = today;
  saveProfile();

  showToast('+' + DAILY_BONUS + ' ⭐ ' + t('daily_bonus'), 3000);
  vibrate([100, 50, 100]);
  showConfetti(30);

  updateAllUI();
  checkDailyBonus();
}

// SECTION 10: WEEKLY RESET
let lastWeeklyReset = null;

function checkWeeklyReset() {
  if (isNewWeek(lastWeeklyReset)) {
    // Archive current weekly stats to lastWeek
    lastWeeklyReset = getWeekStart();

    // Reset weekly tracking
    profile.todayGames = 0;
    profile.todayWins = 0;
    profile.todayTotalBet = 0;
    profile.todayStreak = 0;
    profile.todayBankerBets = 0;
    profile.todayTieBets = 0;

    saveProfile();
  }
}

// SECTION 11: INIT FUNCTION
function init() {
  try {
    boot();
    loadProfile();
    loadSettings();
    loadShopData();
    loadDailyMission();

    lang = settings.language || 'en';

    gameState = {
      mode: 'ai',
      selectedChip: 100,
      currentBet: null,
      betAmount: 0,
      isDealing: false,
      roundNum: 1,
      roadMap: [],
      playerCards: [],
      bankerCards: [],
      aiPlayers: []
    };

    onlineState = {
      inRoom: false,
      roomCode: null,
      isHost: false,
      players: {}
    };

    createShoe();
    setupListeners();
    applyI18n();
    renderChips();
    updateAllUI();
    checkDailyBonus();
    checkWeeklyReset();
    resetDailyMissions();

    showScreen('home');

    // Load Firebase AFTER UI is ready (non-blocking)
    ensureFirebase().then(function(ok) {
      if (ok) {
        Online.ready().then(function() {
          Online.goOnline();
        });
      } else {
        console.warn('Firebase not available - AI mode only');
      }
    });

  } catch(e) {
    console.error('init error:', e);
  }
}

init();

})();
