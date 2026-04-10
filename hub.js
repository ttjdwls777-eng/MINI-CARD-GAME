(function(){
'use strict';

// ============================================================================
// FIREBASE HELPERS
// ============================================================================
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyBDJxn10EyQtGhJDemFA7pF-5QA-GGLW7Y",
  authDomain: "xgp-minigame.firebaseapp.com",
  databaseURL: "https://xgp-minigame-default-rtdb.firebaseio.com",
  projectId: "xgp-minigame",
  storageBucket: "xgp-minigame.appspot.com",
  messagingSenderId: "712312742763",
  appId: "1:712312742763:web:eef8675828aefe8c71222e"
};

function firebaseOK(){return typeof firebase!=='undefined'&&firebase.database;}
function ensureFirebaseInit(){try{if(typeof firebase!=='undefined'&&firebase.apps&&firebase.apps.length===0){firebase.initializeApp(FIREBASE_CONFIG);}}catch(e){}}

// ============================================================================
// CONSTANTS
// ============================================================================
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
    {id:'avatar-1', name:'Classic', emoji:'😎', cost:0, default:true},
    {id:'avatar-2', name:'Dragon', emoji:'🐉', cost:500},
    {id:'avatar-3', name:'Phoenix', emoji:'🔥', cost:800},
    {id:'avatar-4', name:'Tiger', emoji:'🐯', cost:1000},
    {id:'avatar-5', name:'Wolf', emoji:'🐺', cost:1200},
    {id:'avatar-6', name:'Eagle', emoji:'🦅', cost:1500},
    {id:'avatar-7', name:'Snake', emoji:'🐍', cost:2000},
    {id:'avatar-8', name:'Demon', emoji:'😈', cost:3000}
  ],
  tables: [
    {id:'table-1', name:'Classic Green', color:'#047857', cost:0, default:true},
    {id:'table-2', name:'Royal Purple', color:'#7c3aed', cost:1000},
    {id:'table-3', name:'Midnight Blue', color:'#0369a1', cost:1500},
    {id:'table-4', name:'Crimson Red', color:'#991b1b', cost:2000}
  ],
  cardbacks: [
    {id:'cardback-1', name:'Classic', pattern:'diamonds', cost:0, default:true},
    {id:'cardback-2', name:'Gold Leaf', pattern:'gold-leaf', cost:800},
    {id:'cardback-3', name:'Diamond', pattern:'diamond-grid', cost:1200},
    {id:'cardback-4', name:'Royal', pattern:'royal-fleur', cost:2000}
  ]
};

const ACHIEVEMENTS = [
  {id:'first-win', name:'First Victory', req:g=>g.totalWins>=1, icon:'🎯'},
  {id:'wins-10', name:'Victory Streak', req:g=>g.totalWins>=10, icon:'🔥'},
  {id:'wins-50', name:'Expert', req:g=>g.totalWins>=50, icon:'👑'},
  {id:'wins-100', name:'Legend', req:g=>g.totalWins>=100, icon:'⭐'},
  {id:'streak-3', name:'Hot Hand', req:g=>g.streak>=3, icon:'🌟'},
  {id:'streak-5', name:'Unstoppable', req:g=>g.streak>=5, icon:'💥'},
  {id:'streak-10', name:'Mythical Run', req:g=>g.streak>=10, icon:'✨'},
  {id:'high-roller', name:'High Roller', req:g=>g.biggestBet>=5000, icon:'💎'},
  {id:'tie-winner', name:'Lucky Tie', req:g=>g.totalWins>=1&&g.tieBets>=1, icon:'🍀'},
  {id:'games-50', name:'Devoted', req:g=>g.totalGames>=50, icon:'⏱️'},
  {id:'games-200', name:'Obsessed', req:g=>g.totalGames>=200, icon:'🎰'},
  {id:'rich', name:'Million Stars', req:g=>g.peakStars>=1000000, icon:'💰'}
];

const MISSIONS = [
  {id:'play-3', name:'Play 3 Hands', req:'totalGames', target:3, reward:50, daily:true},
  {id:'win-2', name:'Win 2 Hands', req:'totalWins', target:2, reward:100, daily:true},
  {id:'bet-1000', name:'Place 1000+ Bet', req:'biggestBet', target:1000, reward:150, daily:true},
  {id:'streak-2', name:'Get 2-Win Streak', req:'streak', target:2, reward:75, daily:true},
  {id:'banker-bet', name:'Bet Banker 5 Times', req:'bankerBets', target:5, reward:100, daily:true},
  {id:'tie-bet', name:'Bet Tie 3 Times', req:'tieBets', target:3, reward:200, daily:true}
];

// ============================================================================
// I18N OBJECT
// ============================================================================
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
    daily_checkin: 'Daily Check-in',
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
    push_result: 'Tie - Bet Returned',
    not_enough: 'Not enough stars',
    settings: 'Settings',
    sound: 'Sound',
    vibrate: 'Vibration',
    language: 'Language',
    animation_speed: 'Animation Speed',
    auto_deal: 'Auto Deal',
    theme: 'Theme',
    notifications: 'Notifications',
    total_rank: 'Total Rank',
    weekly_top: 'Weekly Top',
    last_week: 'Last Week',
    all_time: 'All Time',
    shop_title: 'Shop',
    avatars: 'Avatars',
    tables: 'Tables',
    card_backs: 'Card Backs',
    equipped: 'Equipped',
    equip: 'Equip',
    locked: 'Locked',
    purchase: 'Purchase',
    buy: 'Buy',
    missions_title: 'Missions',
    daily_mission: 'Daily Missions',
    achievements: 'Achievements',
    profile: 'Profile',
    reset_stats: 'Reset Stats',
    tutorial: 'Tutorial',
    home: 'Home',
    confirm_reset: 'Reset all stats?',
    ok: 'OK',
    cancel: 'Cancel',
    claim: 'Claim',
    room_code: 'Room Code',
    create_room: 'Create Room',
    join_room: 'Join Room',
    wager: 'Wager',
    waiting: 'Waiting',
    ready: 'Ready',
    start: 'Start',
    leave: 'Leave',
    players: 'Players',
    round_num: 'Round',
    your_bet: 'Your Bet',
    no_bet: 'No Bet',
    win_rate: 'Win Rate',
    total_games: 'Total Games',
    bet_returned: 'Bet Returned',
    continue_btn: 'Continue',
    nickname: 'Nickname',
    save: 'Save',
    online_table: 'Online Table',
    play_dealer: 'Play vs Dealer',
    casino: 'Casino',
    premium: 'Premium VIP',
    punto_banco: 'Baccarat',
    ranking: 'Ranking',
    shop: 'Shop',
    mission: 'Mission',
    claim_reward: 'Claim Reward',
    daily_check: 'Daily Check',
    room_full: 'Room is full',
    room_not_found: 'Room not found',
    already_in_room: 'Already in room',
    host_left: 'Host left',
    you_left: 'You left',
    natural_win: 'Natural!',
    pair_bonus: 'Pair Bonus!',
    dealing: 'Dealing...',
    placed_bet: 'Bet Placed',
    seat: 'Seat',
    viewer: 'Viewer',
    empty_seat: 'Empty Seat',
    no_rooms: 'No rooms available',
    open_rooms: 'Open Rooms',
    hosted_by: 'Hosted by',
    room: 'Room',
    join: 'Join',
    already_claimed: 'Already claimed',
    daily_bonus: 'Daily Bonus',
    mission_complete: 'Mission Complete!',
    unlocked: 'Unlocked',
    in_progress: 'In Progress',
    claimed: 'Claimed',
    place_bet_first: 'Place a bet first',
    not_enough_stars: 'Not enough stars',
    game_result: 'Game Result',
    total_bet: 'Total Bet',
    total_won: 'Total Won',
    total_lost: 'Total Lost',
    biggest_win: 'Biggest Win',
    biggest_bet_stat: 'Biggest Bet',
    peak_stars: 'Peak Stars',
    games_played: 'Games Played',
    win_streak: 'Win Streak',
    current_stars: 'Current Stars',
    bankrupt_help: 'Out of Stars?',
    bankrupt_msg: 'Claim daily bonus or watch ads',
    recover_stars: 'Recover',
    session_summary: 'Session Summary',
    hands_played: 'Hands Played',
    net_profit: 'Net Profit',
    best_hand: 'Best Hand',
    quick_chat: 'Quick Chat',
    history: 'History',
    statistics: 'Statistics',
    road_map: 'Road Map',
    big_road: 'Big Road',
    bead_plate: 'Bead Plate',
    shoe_progress: 'Shoe Progress',
    cards_remaining: 'Cards Remaining',
    player_wins: 'Player Wins',
    banker_wins: 'Banker Wins',
    tie_count: 'Tie Count',
    reset_shoe: 'Reset Shoe',
    theme_dark: 'Dark',
    theme_midnight: 'Midnight',
    theme_emerald: 'Emerald',
    theme_crimson: 'Crimson',
    speed_slow: 'Slow',
    speed_normal: 'Normal',
    speed_fast: 'Fast',
    tut_title: 'How to Play',
    tut_welcome: 'Welcome to FA Baccarat!',
    tut_step1: 'Place your bet on Player, Banker, or Tie',
    tut_step2: 'Two cards are dealt to Player and Banker',
    tut_step3: 'Card values: Ace=1, 2-9=face value, 10/J/Q/K=0',
    tut_step4: 'Hand value is the last digit of card sum',
    tut_step5: 'A third card is drawn based on rules',
    tut_step6: 'Highest hand value (0-9) wins',
    tut_step7: 'Player pays 1:1, Banker pays 1.95:1',
    tut_step8: 'Tie pays 9:1 - Good luck!',
    tut_next: 'Next',
    tut_prev: 'Previous',
    tut_finish: 'Finish',
    tut_got_it: 'Got It',
    ach_first_win: 'First Victory',
    ach_wins_10: 'Victory Streak',
    ach_wins_50: 'Expert',
    ach_wins_100: 'Legend',
    ach_streak_3: 'Hot Hand',
    ach_streak_5: 'Unstoppable',
    ach_streak_10: 'Mythical Run',
    ach_high_roller: 'High Roller',
    ach_tie_winner: 'Lucky Tie',
    ach_games_50: 'Devoted',
    ach_games_200: 'Obsessed',
    ach_rich: 'Million Stars',
    mis_play_3: 'Play 3 Hands',
    mis_win_2: 'Win 2 Hands',
    mis_bet_1000: 'Place 1000+ Bet',
    mis_streak_2: 'Get 2-Win Streak',
    mis_banker_bet: 'Bet Banker 5 Times',
    mis_tie_bet: 'Bet Tie 3 Times',
    chat_gl: 'Good luck!',
    chat_gg: 'Good game!',
    chat_nice: 'Nice hand!',
    chat_wow: 'Wow!',
    chat_ty: 'Thanks!',
    chat_np: 'No problem!'
  },
  ko: {
    app_title: 'FA 바카라',
    nav_home: '홈',
    nav_rank: '순위',
    nav_shop: '상점',
    nav_mission: '미션',
    nav_profile: '프로필',
    play_ai: '딜러와 플레이',
    play_online: '온라인 테이블',
    daily_checkin: '일일 체크인',
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
    tie_push: '밀림',
    push_result: '타이 - 베팅 반환',
    not_enough: '스타 부족',
    settings: '설정',
    sound: '사운드',
    vibrate: '진동',
    language: '언어',
    animation_speed: '애니메이션 속도',
    auto_deal: '자동 딜',
    theme: '테마',
    notifications: '알림',
    total_rank: '전체 순위',
    weekly_top: '주간 상위',
    last_week: '지난주',
    all_time: '역대',
    shop_title: '상점',
    avatars: '아바타',
    tables: '테이블',
    card_backs: '카드 뒷면',
    equipped: '장착됨',
    equip: '장착',
    locked: '잠금',
    purchase: '구매',
    buy: '구매',
    missions_title: '미션',
    daily_mission: '일일 미션',
    achievements: '도전',
    profile: '프로필',
    reset_stats: '통계 초기화',
    tutorial: '튜토리얼',
    home: '홈',
    confirm_reset: '모든 통계를 초기화하시겠습니까?',
    ok: '확인',
    cancel: '취소',
    claim: '청구',
    room_code: '룸 코드',
    create_room: '룸 생성',
    join_room: '룸 참가',
    wager: '베팅',
    waiting: '대기 중',
    ready: '준비됨',
    start: '시작',
    leave: '떠나기',
    players: '플레이어',
    round_num: '라운드',
    your_bet: '당신의 베팅',
    no_bet: '베팅 없음',
    win_rate: '승률',
    total_games: '전체 게임',
    bet_returned: '베팅 반환',
    continue_btn: '계속',
    nickname: '닉네임',
    save: '저장',
    online_table: '온라인 테이블',
    play_dealer: '딜러와 플레이',
    casino: '카지노',
    premium: '프리미엄 VIP',
    punto_banco: '바카라',
    ranking: '순위',
    shop: '상점',
    mission: '미션',
    claim_reward: '보상 청구',
    daily_check: '일일 체크',
    room_full: '룸이 가득 찼습니다',
    room_not_found: '룸을 찾을 수 없습니다',
    already_in_room: '이미 룸에 있습니다',
    host_left: '호스트가 떠났습니다',
    you_left: '나감',
    natural_win: '내추럴!',
    pair_bonus: '페어 보너스!',
    dealing: '딜링 중...',
    placed_bet: '베팅 배치됨',
    seat: '자리',
    viewer: '관전자',
    empty_seat: '비어있는 자리',
    no_rooms: '사용 가능한 룸 없음',
    open_rooms: '열린 룸',
    hosted_by: '주최자',
    room: '룸',
    join: '참가',
    already_claimed: '이미 청구됨',
    daily_bonus: '일일 보너스',
    mission_complete: '미션 완료!',
    unlocked: '해제됨',
    in_progress: '진행 중',
    claimed: '청구됨',
    place_bet_first: '먼저 베팅하세요',
    not_enough_stars: '스타가 부족합니다',
    game_result: '게임 결과',
    total_bet: '총 베팅',
    total_won: '총 승리',
    total_lost: '총 패배',
    biggest_win: '최고 승리',
    biggest_bet_stat: '최고 베팅',
    peak_stars: '최고 스타',
    games_played: '플레이한 게임',
    win_streak: '연승',
    current_stars: '현재 스타',
    bankrupt_help: '스타가 없나요?',
    bankrupt_msg: '일일 보너스를 청구하거나 광고를 보세요',
    recover_stars: '복구',
    session_summary: '세션 요약',
    hands_played: '플레이한 핸드',
    net_profit: '순이익',
    best_hand: '최고 핸드',
    quick_chat: '빠른 채팅',
    history: '기록',
    statistics: '통계',
    road_map: '로드맵',
    big_road: '빅 로드',
    bead_plate: '비드 플레이트',
    shoe_progress: '슈 진행률',
    cards_remaining: '남은 카드',
    player_wins: '플레이어 승리',
    banker_wins: '뱅커 승리',
    tie_count: '타이 수',
    reset_shoe: '슈 초기화',
    theme_dark: '어두움',
    theme_midnight: '자정',
    theme_emerald: '에메랄드',
    theme_crimson: '크림슨',
    speed_slow: '느림',
    speed_normal: '보통',
    speed_fast: '빠름',
    tut_title: '플레이 방법',
    tut_welcome: 'FA 바카라에 오신 것을 환영합니다!',
    tut_step1: '플레이어, 뱅커 또는 타이에 베팅하세요',
    tut_step2: '플레이어와 뱅커에게 각각 2장의 카드가 배포됩니다',
    tut_step3: '카드 가치: 에이스=1, 2-9=액면가, 10/J/Q/K=0',
    tut_step4: '핸드 값은 카드 합계의 마지막 자리입니다',
    tut_step5: '규칙에 따라 세 번째 카드가 뽑힙니다',
    tut_step6: '가장 높은 핸드 값(0-9)이 승리합니다',
    tut_step7: '플레이어는 1:1, 뱅커는 1.95:1을 지급합니다',
    tut_step8: '타이는 9:1을 지급합니다 - 행운을 빕니다!',
    tut_next: '다음',
    tut_prev: '이전',
    tut_finish: '완료',
    tut_got_it: '알겠습니다',
    ach_first_win: '첫 승리',
    ach_wins_10: '승리 연승',
    ach_wins_50: '전문가',
    ach_wins_100: '전설',
    ach_streak_3: '뜨거운 핸드',
    ach_streak_5: '무적',
    ach_streak_10: '신화적 런',
    ach_high_roller: '하이롤러',
    ach_tie_winner: '럭키 타이',
    ach_games_50: '헌신적',
    ach_games_200: '집착',
    ach_rich: '백만 스타',
    mis_play_3: '3개 핸드 플레이',
    mis_win_2: '2개 핸드 승리',
    mis_bet_1000: '1000+ 베팅',
    mis_streak_2: '2연승',
    mis_banker_bet: '뱅커에 5번 베팅',
    mis_tie_bet: '타이에 3번 베팅',
    chat_gl: '행운을 빕니다!',
    chat_gg: '좋은 게임!',
    chat_nice: '좋은 핸드!',
    chat_wow: '와우!',
    chat_ty: '감사합니다!',
    chat_np: '괜찮습니다!'
  },
  ja: {
    app_title: 'FAバカラ',
    nav_home: 'ホーム',
    nav_rank: 'ランキング',
    nav_shop: 'ショップ',
    nav_mission: 'ミッション',
    nav_profile: 'プロフィール',
    play_ai: 'ディーラーと対戦',
    play_online: 'オンラインテーブル',
    daily_checkin: '日次チェックイン',
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
    push_result: 'タイ - ベット返金',
    not_enough: 'スター不足',
    settings: '設定',
    sound: 'サウンド',
    vibrate: '振動',
    language: '言語',
    animation_speed: 'アニメーション速度',
    auto_deal: '自動ディール',
    theme: 'テーマ',
    notifications: '通知',
    total_rank: '総合順位',
    weekly_top: '週間トップ',
    last_week: '先週',
    all_time: '通算',
    shop_title: 'ショップ',
    avatars: 'アバター',
    tables: 'テーブル',
    card_backs: 'カードバック',
    equipped: '装備中',
    equip: '装備',
    locked: 'ロック済み',
    purchase: '購入',
    buy: '買う',
    missions_title: 'ミッション',
    daily_mission: '日次ミッション',
    achievements: 'アチーブメント',
    profile: 'プロフィール',
    reset_stats: 'スタッツをリセット',
    tutorial: 'チュートリアル',
    home: 'ホーム',
    confirm_reset: 'すべてのスタッツをリセットしますか?',
    ok: 'OK',
    cancel: 'キャンセル',
    claim: 'クレーム',
    room_code: 'ルームコード',
    create_room: 'ルーム作成',
    join_room: 'ルーム参加',
    wager: 'ベット',
    waiting: '待機中',
    ready: '準備完了',
    start: '開始',
    leave: '退出',
    players: 'プレイヤー',
    round_num: 'ラウンド',
    your_bet: 'あなたのベット',
    no_bet: 'ベットなし',
    win_rate: '勝率',
    total_games: '総ゲーム数',
    bet_returned: 'ベット返金',
    continue_btn: '続ける',
    nickname: 'ニックネーム',
    save: '保存',
    online_table: 'オンラインテーブル',
    play_dealer: 'ディーラーと対戦',
    casino: 'カジノ',
    premium: 'プレミアムVIP',
    punto_banco: 'バカラ',
    ranking: 'ランキング',
    shop: 'ショップ',
    mission: 'ミッション',
    claim_reward: '報酬をクレーム',
    daily_check: '日次チェック',
    room_full: 'ルームは満員です',
    room_not_found: 'ルームが見つかりません',
    already_in_room: 'すでにルームにいます',
    host_left: 'ホストが退出しました',
    you_left: 'あなたが退出しました',
    natural_win: 'ナチュラル!',
    pair_bonus: 'ペアボーナス!',
    dealing: 'ディール中...',
    placed_bet: 'ベット配置',
    seat: 'シート',
    viewer: 'ビューアー',
    empty_seat: '空いているシート',
    no_rooms: 'ルームはありません',
    open_rooms: 'オープンルーム',
    hosted_by: 'ホスト：',
    room: 'ルーム',
    join: '参加',
    already_claimed: 'すでにクレーム済み',
    daily_bonus: '日次ボーナス',
    mission_complete: 'ミッション完了!',
    unlocked: 'アンロック',
    in_progress: '進行中',
    claimed: 'クレーム済み',
    place_bet_first: 'まず最初にベットしてください',
    not_enough_stars: 'スターが不足しています',
    game_result: 'ゲーム結果',
    total_bet: '総ベット',
    total_won: '総勝利',
    total_lost: '総敗北',
    biggest_win: '最高勝利',
    biggest_bet_stat: '最高ベット',
    peak_stars: 'ピークスター',
    games_played: 'プレイしたゲーム',
    win_streak: '連勝',
    current_stars: '現在のスター',
    bankrupt_help: 'スターがない?',
    bankrupt_msg: '日次ボーナスをクレームまたは広告を表示',
    recover_stars: '復旧',
    session_summary: 'セッション概要',
    hands_played: 'プレイした手',
    net_profit: '純利益',
    best_hand: '最高の手',
    quick_chat: 'クイックチャット',
    history: '履歴',
    statistics: '統計',
    road_map: 'ロードマップ',
    big_road: 'ビッグロード',
    bead_plate: 'ビッドプレート',
    shoe_progress: 'シュー進行状況',
    cards_remaining: '残りカード',
    player_wins: 'プレイヤー勝利',
    banker_wins: 'バンカー勝利',
    tie_count: 'タイ数',
    reset_shoe: 'シューをリセット',
    theme_dark: 'ダーク',
    theme_midnight: 'ミッドナイト',
    theme_emerald: 'エメラルド',
    theme_crimson: 'クリムゾン',
    speed_slow: '遅い',
    speed_normal: '普通',
    speed_fast: '速い',
    tut_title: 'プレイ方法',
    tut_welcome: 'FAバカラへようこそ!',
    tut_step1: 'プレイヤー、バンカー、またはタイにベットします',
    tut_step2: 'プレイヤーとバンカーに各2枚のカードが配られます',
    tut_step3: 'カード値：エース=1、2-9=額面、10/J/Q/K=0',
    tut_step4: 'ハンド値はカード合計の最後の桁です',
    tut_step5: 'ルールに基づいて3番目のカードが引かれます',
    tut_step6: '最高のハンド値(0-9)が勝ちます',
    tut_step7: 'プレイヤーは1:1、バンカーは1.95:1を支払います',
    tut_step8: 'タイは9:1を支払います - 幸運を祈ります!',
    tut_next: '次へ',
    tut_prev: '前へ',
    tut_finish: '完了',
    tut_got_it: 'わかりました',
    ach_first_win: '最初の勝利',
    ach_wins_10: '勝利連勝',
    ach_wins_50: 'エキスパート',
    ach_wins_100: 'レジェンド',
    ach_streak_3: 'ホットハンド',
    ach_streak_5: '無敵',
    ach_streak_10: '神話的ラン',
    ach_high_roller: 'ハイローラー',
    ach_tie_winner: 'ラッキータイ',
    ach_games_50: '献身的',
    ach_games_200: '執着的',
    ach_rich: '百万スター',
    mis_play_3: '3ハンドプレイ',
    mis_win_2: '2ハンド勝利',
    mis_bet_1000: '1000+ベット',
    mis_streak_2: '2連勝',
    mis_banker_bet: 'バンカーに5回ベット',
    mis_tie_bet: 'タイに3回ベット',
    chat_gl: '幸運を祈ります!',
    chat_gg: 'いい試合!',
    chat_nice: 'いい手!',
    chat_wow: 'わあ!',
    chat_ty: 'ありがとう!',
    chat_np: 'いいえ!'
  },
  zh: {
    app_title: 'FA百家乐',
    nav_home: '首页',
    nav_rank: '排名',
    nav_shop: '商店',
    nav_mission: '任务',
    nav_profile: '档案',
    play_ai: '对阵庄家',
    play_online: '在线桌',
    daily_checkin: '每日签到',
    stars: '星星',
    level: '等级',
    wins: '胜利',
    streak: '连胜',
    best_streak: '最佳连胜',
    deal: '发牌',
    player: '闲家',
    banker: '庄家',
    tie: '平手',
    natural: '自然牌',
    you_win: '你赢了!',
    you_lose: '你输了',
    tie_push: '平局',
    push_result: '平手 - 赌注返还',
    not_enough: '星星不足',
    settings: '设置',
    sound: '声音',
    vibrate: '振动',
    language: '语言',
    animation_speed: '动画速度',
    auto_deal: '自动发牌',
    theme: '主题',
    notifications: '通知',
    total_rank: '总排名',
    weekly_top: '周排名',
    last_week: '上周',
    all_time: '历史',
    shop_title: '商店',
    avatars: '头像',
    tables: '桌子',
    card_backs: '牌背',
    equipped: '已装备',
    equip: '装备',
    locked: '已锁定',
    purchase: '购买',
    buy: '购买',
    missions_title: '任务',
    daily_mission: '每日任务',
    achievements: '成就',
    profile: '档案',
    reset_stats: '重置统计',
    tutorial: '教程',
    home: '首页',
    confirm_reset: '重置所有统计信息?',
    ok: '确定',
    cancel: '取消',
    claim: '领取',
    room_code: '房间代码',
    create_room: '创建房间',
    join_room: '加入房间',
    wager: '赌注',
    waiting: '等待中',
    ready: '已准备',
    start: '开始',
    leave: '离开',
    players: '玩家',
    round_num: '轮次',
    your_bet: '你的赌注',
    no_bet: '无赌注',
    win_rate: '胜率',
    total_games: '总游戏数',
    bet_returned: '赌注返还',
    continue_btn: '继续',
    nickname: '昵称',
    save: '保存',
    online_table: '在线桌',
    play_dealer: '对阵庄家',
    casino: '赌场',
    premium: '顶级VIP',
    punto_banco: '百家乐',
    ranking: '排名',
    shop: '商店',
    mission: '任务',
    claim_reward: '领取奖励',
    daily_check: '每日检查',
    room_full: '房间已满',
    room_not_found: '未找到房间',
    already_in_room: '已在房间中',
    host_left: '主持人离开',
    you_left: '你已离开',
    natural_win: '自然牌!',
    pair_bonus: '对子奖金!',
    dealing: '发牌中...',
    placed_bet: '已下注',
    seat: '座位',
    viewer: '观众',
    empty_seat: '空座位',
    no_rooms: '无可用房间',
    open_rooms: '开放房间',
    hosted_by: '由以下人创建：',
    room: '房间',
    join: '加入',
    already_claimed: '已领取',
    daily_bonus: '每日奖金',
    mission_complete: '任务完成!',
    unlocked: '已解锁',
    in_progress: '进行中',
    claimed: '已领取',
    place_bet_first: '先下注',
    not_enough_stars: '星星不足',
    game_result: '游戏结果',
    total_bet: '总赌注',
    total_won: '总赢取',
    total_lost: '总损失',
    biggest_win: '最大赢取',
    biggest_bet_stat: '最大赌注',
    peak_stars: '峰值星星',
    games_played: '已玩游戏',
    win_streak: '连胜',
    current_stars: '当前星星',
    bankrupt_help: '没有星星?',
    bankrupt_msg: '领取每日奖金或观看广告',
    recover_stars: '恢复',
    session_summary: '会话总结',
    hands_played: '已玩手数',
    net_profit: '净利润',
    best_hand: '最佳手牌',
    quick_chat: '快速聊天',
    history: '历史',
    statistics: '统计',
    road_map: '路线图',
    big_road: '大路',
    bead_plate: '珠盘',
    shoe_progress: '靴子进度',
    cards_remaining: '剩余卡牌',
    player_wins: '闲家胜利',
    banker_wins: '庄家胜利',
    tie_count: '平手数',
    reset_shoe: '重置靴子',
    theme_dark: '深色',
    theme_midnight: '午夜',
    theme_emerald: '翡翠',
    theme_crimson: '深红',
    speed_slow: '慢',
    speed_normal: '普通',
    speed_fast: '快',
    tut_title: '如何玩',
    tut_welcome: '欢迎来到FA百家乐!',
    tut_step1: '在闲家、庄家或平手上下注',
    tut_step2: '闲家和庄家各获得2张牌',
    tut_step3: '牌值：A=1、2-9=点数、10/J/Q/K=0',
    tut_step4: '手牌值是卡牌总和的个位数',
    tut_step5: '根据规则抽取第三张牌',
    tut_step6: '最高手牌值(0-9)获胜',
    tut_step7: '闲家支付1:1，庄家支付1.95:1',
    tut_step8: '平手支付9:1 - 祝你好运!',
    tut_next: '下一步',
    tut_prev: '上一步',
    tut_finish: '完成',
    tut_got_it: '明白了',
    ach_first_win: '首次胜利',
    ach_wins_10: '胜利连胜',
    ach_wins_50: '专家',
    ach_wins_100: '传奇',
    ach_streak_3: '热手',
    ach_streak_5: '无敌',
    ach_streak_10: '神话之旅',
    ach_high_roller: '高额赌徒',
    ach_tie_winner: '幸运平手',
    ach_games_50: '忠实',
    ach_games_200: '沉迷',
    ach_rich: '百万星星',
    mis_play_3: '玩3手牌',
    mis_win_2: '赢2手牌',
    mis_bet_1000: '下注1000+',
    mis_streak_2: '2连胜',
    mis_banker_bet: '对庄家下注5次',
    mis_tie_bet: '对平手下注3次',
    chat_gl: '祝你好运!',
    chat_gg: '好游戏!',
    chat_nice: '好牌!',
    chat_wow: '哇!',
    chat_ty: '谢谢!',
    chat_np: '没问题!'
  },
  vi: {
    app_title: 'FA Baccarat',
    nav_home: 'Trang chủ',
    nav_rank: 'Xếp hạng',
    nav_shop: 'Cửa hàng',
    nav_mission: 'Nhiệm vụ',
    nav_profile: 'Hồ sơ',
    play_ai: 'Chơi với Nhân viên',
    play_online: 'Bàn trực tuyến',
    daily_checkin: 'Kiểm tra hàng ngày',
    stars: 'Sao',
    level: 'Cấp độ',
    wins: 'Chiến thắng',
    streak: 'Chuỗi',
    best_streak: 'Chuỗi tốt nhất',
    deal: 'Phát thẻ',
    player: 'Người chơi',
    banker: 'Nhân viên',
    tie: 'Hòa',
    natural: 'Tự nhiên',
    you_win: 'Bạn thắng!',
    you_lose: 'Bạn thua',
    tie_push: 'Đẩy',
    push_result: 'Hòa - Cược trả lại',
    not_enough: 'Sao không đủ',
    settings: 'Cài đặt',
    sound: 'Âm thanh',
    vibrate: 'Rung',
    language: 'Ngôn ngữ',
    animation_speed: 'Tốc độ hoạt hình',
    auto_deal: 'Phát tự động',
    theme: 'Chủ đề',
    notifications: 'Thông báo',
    total_rank: 'Xếp hạng tổng',
    weekly_top: 'Top hàng tuần',
    last_week: 'Tuần trước',
    all_time: 'Mọi lúc',
    shop_title: 'Cửa hàng',
    avatars: 'Hình đại diện',
    tables: 'Bàn',
    card_backs: 'Mặt sau thẻ',
    equipped: 'Trang bị',
    equip: 'Trang bị',
    locked: 'Khóa',
    purchase: 'Mua',
    buy: 'Mua',
    missions_title: 'Nhiệm vụ',
    daily_mission: 'Nhiệm vụ hàng ngày',
    achievements: 'Thành tích',
    profile: 'Hồ sơ',
    reset_stats: 'Đặt lại thống kê',
    tutorial: 'Hướng dẫn',
    home: 'Trang chủ',
    confirm_reset: 'Đặt lại tất cả thống kê?',
    ok: 'Được rồi',
    cancel: 'Hủy',
    claim: 'Yêu cầu',
    room_code: 'Mã phòng',
    create_room: 'Tạo phòng',
    join_room: 'Tham gia phòng',
    wager: 'Cược',
    waiting: 'Đang chờ',
    ready: 'Sẵn sàng',
    start: 'Bắt đầu',
    leave: 'Rời đi',
    players: 'Người chơi',
    round_num: 'Vòng',
    your_bet: 'Cược của bạn',
    no_bet: 'Không cược',
    win_rate: 'Tỷ lệ thắng',
    total_games: 'Tổng trò chơi',
    bet_returned: 'Cược trả lại',
    continue_btn: 'Tiếp tục',
    nickname: 'Biệt danh',
    save: 'Lưu',
    online_table: 'Bàn trực tuyến',
    play_dealer: 'Chơi với Nhân viên',
    casino: 'Sòng bạc',
    premium: 'VIP cao cấp',
    punto_banco: 'Baccarat',
    ranking: 'Xếp hạng',
    shop: 'Cửa hàng',
    mission: 'Nhiệm vụ',
    claim_reward: 'Nhận phần thưởng',
    daily_check: 'Kiểm tra hàng ngày',
    room_full: 'Phòng đầy',
    room_not_found: 'Không tìm thấy phòng',
    already_in_room: 'Đã trong phòng',
    host_left: 'Chủ nhân rời đi',
    you_left: 'Bạn đã rời đi',
    natural_win: 'Tự nhiên!',
    pair_bonus: 'Tiền thưởng cặp!',
    dealing: 'Đang phát...',
    placed_bet: 'Cược được đặt',
    seat: 'Ghế',
    viewer: 'Người xem',
    empty_seat: 'Ghế trống',
    no_rooms: 'Không có phòng',
    open_rooms: 'Phòng mở',
    hosted_by: 'Do tổ chức bởi',
    room: 'Phòng',
    join: 'Tham gia',
    already_claimed: 'Đã yêu cầu',
    daily_bonus: 'Tiền thưởng hàng ngày',
    mission_complete: 'Nhiệm vụ hoàn thành!',
    unlocked: 'Mở khóa',
    in_progress: 'Đang tiến hành',
    claimed: 'Đã yêu cầu',
    place_bet_first: 'Đặt cược trước',
    not_enough_stars: 'Sao không đủ',
    game_result: 'Kết quả trò chơi',
    total_bet: 'Tổng cược',
    total_won: 'Tổng thắng',
    total_lost: 'Tổng thua',
    biggest_win: 'Chiến thắng lớn nhất',
    biggest_bet_stat: 'Cược lớn nhất',
    peak_stars: 'Sao đỉnh',
    games_played: 'Trò chơi đã chơi',
    win_streak: 'Chuỗi thắng',
    current_stars: 'Sao hiện tại',
    bankrupt_help: 'Không có sao?',
    bankrupt_msg: 'Yêu cầu tiền thưởng hàng ngày hoặc xem quảng cáo',
    recover_stars: 'Phục hồi',
    session_summary: 'Tóm tắt phiên',
    hands_played: 'Tay đã chơi',
    net_profit: 'Lợi nhuận ròng',
    best_hand: 'Tay tốt nhất',
    quick_chat: 'Trò chuyện nhanh',
    history: 'Lịch sử',
    statistics: 'Thống kê',
    road_map: 'Lộ trình',
    big_road: 'Con đường lớn',
    bead_plate: 'Đĩa hạt',
    shoe_progress: 'Tiến độ giày',
    cards_remaining: 'Thẻ còn lại',
    player_wins: 'Người chơi thắng',
    banker_wins: 'Nhân viên thắng',
    tie_count: 'Số hòa',
    reset_shoe: 'Đặt lại giày',
    theme_dark: 'Tối',
    theme_midnight: 'Nửa đêm',
    theme_emerald: 'Ngọc lục bảo',
    theme_crimson: 'Đỏ sẫm',
    speed_slow: 'Chậm',
    speed_normal: 'Bình thường',
    speed_fast: 'Nhanh',
    tut_title: 'Cách chơi',
    tut_welcome: 'Chào mừng đến FA Baccarat!',
    tut_step1: 'Đặt cược trên Người chơi, Nhân viên hoặc Hòa',
    tut_step2: 'Hai thẻ được phát cho Người chơi và Nhân viên',
    tut_step3: 'Giá trị thẻ: Ace=1, 2-9=giá trị mặt, 10/J/Q/K=0',
    tut_step4: 'Giá trị tay là chữ số cuối cùng của tổng thẻ',
    tut_step5: 'Thẻ thứ ba được rút dựa trên quy tắc',
    tut_step6: 'Giá trị tay cao nhất (0-9) thắng',
    tut_step7: 'Người chơi trả 1:1, Nhân viên trả 1.95:1',
    tut_step8: 'Hòa trả 9:1 - Chúc bạn may mắn!',
    tut_next: 'Tiếp theo',
    tut_prev: 'Trước đó',
    tut_finish: 'Kết thúc',
    tut_got_it: 'Hiểu rồi',
    ach_first_win: 'Chiến thắng đầu tiên',
    ach_wins_10: 'Chuỗi chiến thắng',
    ach_wins_50: 'Chuyên gia',
    ach_wins_100: 'Huyền thoại',
    ach_streak_3: 'Tay nóng',
    ach_streak_5: 'Bất khả chiến bại',
    ach_streak_10: 'Cuộc chạy thần thoại',
    ach_high_roller: 'Cược cao',
    ach_tie_winner: 'Hòa may mắn',
    ach_games_50: 'Tận tâm',
    ach_games_200: 'Ám ảnh',
    ach_rich: 'Triệu sao',
    mis_play_3: 'Chơi 3 tay',
    mis_win_2: 'Thắng 2 tay',
    mis_bet_1000: 'Đặt cược 1000+',
    mis_streak_2: 'Chuỗi 2 thắng',
    mis_banker_bet: 'Đặt cược Nhân viên 5 lần',
    mis_tie_bet: 'Đặt cược Hòa 3 lần',
    chat_gl: 'Chúc may mắn!',
    chat_gg: 'Trò chơi tốt!',
    chat_nice: 'Tay tốt!',
    chat_wow: 'Wow!',
    chat_ty: 'Cảm ơn!',
    chat_np: 'Không sao!'
  },
  th: {
    app_title: 'FA Baccarat',
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
    wins: 'ชนะ',
    streak: 'ชุด',
    best_streak: 'ชุดที่ดีที่สุด',
    deal: 'แจก',
    player: 'ผู้เล่น',
    banker: 'เจ้ามือ',
    tie: 'เสมอ',
    natural: 'ธรรมชาติ',
    you_win: 'คุณชนะ!',
    you_lose: 'คุณแพ้',
    tie_push: 'ผลักดัน',
    push_result: 'เสมอ - ส่งคืนเดิมพัน',
    not_enough: 'ดาวไม่พอ',
    settings: 'การตั้งค่า',
    sound: 'เสียง',
    vibrate: 'สั่น',
    language: 'ภาษา',
    animation_speed: 'ความเร็วของภาพเคลื่อนไหว',
    auto_deal: 'แจกโดยอัตโนมัติ',
    theme: 'ธีม',
    notifications: 'การแจ้งเตือน',
    total_rank: 'อันดับทั้งหมด',
    weekly_top: 'อันดับสูงสุดรายสัปดาห์',
    last_week: 'สัปดาห์ที่แล้ว',
    all_time: 'ตลอดเวลา',
    shop_title: 'ร้านค้า',
    avatars: 'อวาตาร์',
    tables: 'โต๊ะ',
    card_backs: 'ด้านหลังการ์ด',
    equipped: 'ติดตั้งแล้ว',
    equip: 'ติดตั้ง',
    locked: 'ล็อค',
    purchase: 'ซื้อ',
    buy: 'ซื้อ',
    missions_title: 'ภารกิจ',
    daily_mission: 'ภารกิจรายวัน',
    achievements: 'ความสำเร็จ',
    profile: 'โปรไฟล์',
    reset_stats: 'รีเซ็ตสถิติ',
    tutorial: 'บทช่วยสอน',
    home: 'หน้าแรก',
    confirm_reset: 'รีเซ็ตสถิติทั้งหมด?',
    ok: 'ตกลง',
    cancel: 'ยกเลิก',
    claim: 'เรียกร้อง',
    room_code: 'รหัสห้อง',
    create_room: 'สร้างห้อง',
    join_room: 'เข้าร่วมห้อง',
    wager: 'เดิมพัน',
    waiting: 'รอ',
    ready: 'พร้อม',
    start: 'เริ่ม',
    leave: 'ออกไป',
    players: 'ผู้เล่น',
    round_num: 'รอบ',
    your_bet: 'เดิมพันของคุณ',
    no_bet: 'ไม่มีเดิมพัน',
    win_rate: 'อัตราการชนะ',
    total_games: 'เกมทั้งหมด',
    bet_returned: 'ส่งคืนเดิมพัน',
    continue_btn: 'ดำเนินการต่อ',
    nickname: 'ชื่อเล่น',
    save: 'บันทึก',
    online_table: 'โต๊ะออนไลน์',
    play_dealer: 'เล่นกับดีลเลอร์',
    casino: 'คาสิโน',
    premium: 'VIP พรีเมียม',
    punto_banco: 'Baccarat',
    ranking: 'อันดับ',
    shop: 'ร้านค้า',
    mission: 'ภารกิจ',
    claim_reward: 'เรียกร้องรางวัล',
    daily_check: 'เช็ครายวัน',
    room_full: 'ห้องเต็ม',
    room_not_found: 'ไม่พบห้อง',
    already_in_room: 'อยู่ในห้องแล้ว',
    host_left: 'เจ้าภาพออกไป',
    you_left: 'คุณออกไป',
    natural_win: 'ธรรมชาติ!',
    pair_bonus: 'โบนัสคู่!',
    dealing: 'แจกอยู่...',
    placed_bet: 'วางเดิมพันแล้ว',
    seat: 'ที่นั่ง',
    viewer: 'ผู้ชม',
    empty_seat: 'ที่นั่งว่าง',
    no_rooms: 'ไม่มีห้องว่าง',
    open_rooms: 'เปิดห้อง',
    hosted_by: 'โดยจัดโดย',
    room: 'ห้อง',
    join: 'เข้าร่วม',
    already_claimed: 'เรียกร้องแล้ว',
    daily_bonus: 'โบนัสรายวัน',
    mission_complete: 'ภารกิจสำเร็จ!',
    unlocked: 'ปลดล็อค',
    in_progress: 'อยู่ระหว่างดำเนินการ',
    claimed: 'เรียกร้อง',
    place_bet_first: 'วางเดิมพันก่อน',
    not_enough_stars: 'ดาวไม่พอ',
    game_result: 'ผลลัพธ์เกม',
    total_bet: 'เดิมพันทั้งหมด',
    total_won: 'ชนะทั้งหมด',
    total_lost: 'แพ้ทั้งหมด',
    biggest_win: 'ชนะใหญ่ที่สุด',
    biggest_bet_stat: 'เดิมพันที่ใหญ่ที่สุด',
    peak_stars: 'ดาวสูงสุด',
    games_played: 'เกมที่เล่น',
    win_streak: 'ชุดชนะ',
    current_stars: 'ดาวปัจจุบัน',
    bankrupt_help: 'ไม่มีดาว?',
    bankrupt_msg: 'เรียกร้องโบนัสรายวันหรือดูโฆษณา',
    recover_stars: 'กู้คืน',
    session_summary: 'สรุปเซสชัน',
    hands_played: 'มือที่เล่น',
    net_profit: 'กำไรสุทธิ',
    best_hand: 'มือที่ดีที่สุด',
    quick_chat: 'แชทด่วน',
    history: 'ประวัติ',
    statistics: 'สถิติ',
    road_map: 'แผนที่เส้นทาง',
    big_road: 'ถนนใหญ่',
    bead_plate: 'จานลูกปัด',
    shoe_progress: 'ความเป็นไปได้ของรองเท้า',
    cards_remaining: 'การ์ดที่เหลือ',
    player_wins: 'ผู้เล่นชนะ',
    banker_wins: 'เจ้ามือชนะ',
    tie_count: 'จำนวนเสมอ',
    reset_shoe: 'รีเซ็ตรองเท้า',
    theme_dark: 'มืด',
    theme_midnight: 'เที่ยงคืน',
    theme_emerald: 'มรกต',
    theme_crimson: 'ระบายแดง',
    speed_slow: 'ช้า',
    speed_normal: 'ปกติ',
    speed_fast: 'เร็ว',
    tut_title: 'วิธีการเล่น',
    tut_welcome: 'ยินดีต้อนรับสู่ FA Baccarat!',
    tut_step1: 'วางเดิมพันบนผู้เล่น เจ้ามือ หรือเสมอ',
    tut_step2: 'แจกสองใบให้ผู้เล่นและเจ้ามือ',
    tut_step3: 'ค่าการ์ด: Ace=1, 2-9=มูลค่า, 10/J/Q/K=0',
    tut_step4: 'มูลค่ามือคือตัวเลขตัวสุดท้ายของผลรวม',
    tut_step5: 'มือที่สามจะจั่วตามกฎ',
    tut_step6: 'มูลค่ามือสูงสุด (0-9) ชนะ',
    tut_step7: 'ผู้เล่นจ่าย 1:1 เจ้ามือจ่าย 1.95:1',
    tut_step8: 'เสมอจ่าย 9:1 - โชคดี!',
    tut_next: 'ถัดไป',
    tut_prev: 'ก่อนหน้า',
    tut_finish: 'เสร็จสิ้น',
    tut_got_it: 'เข้าใจแล้ว',
    ach_first_win: 'ชนะครั้งแรก',
    ach_wins_10: 'ชุดชนะ',
    ach_wins_50: 'ผู้เชี่ยวชาญ',
    ach_wins_100: 'ตำนาน',
    ach_streak_3: 'มือร้อน',
    ach_streak_5: 'ไม่อาจต้านทาน',
    ach_streak_10: 'การทำงานตำนาน',
    ach_high_roller: 'เดิมพันสูง',
    ach_tie_winner: 'เสมอโชค',
    ach_games_50: 'ทุ่มเท',
    ach_games_200: 'หลงใหล',
    ach_rich: 'ล้านดาว',
    mis_play_3: 'เล่น 3 มือ',
    mis_win_2: 'ชนะ 2 มือ',
    mis_bet_1000: 'วางเดิมพัน 1000+',
    mis_streak_2: 'ชุด 2 ชนะ',
    mis_banker_bet: 'เดิมพันเจ้ามือ 5 ครั้ง',
    mis_tie_bet: 'เดิมพันเสมอ 3 ครั้ง',
    chat_gl: 'โชคดี!',
    chat_gg: 'เกมที่ดี!',
    chat_nice: 'มือที่ดี!',
    chat_wow: 'ว้าว!',
    chat_ty: 'ขอบคุณ!',
    chat_np: 'ไม่เป็นไร!'
  }
};

function t(key, lang) {
  lang = lang || localStorage.getItem('lang') || 'en';
  var langObj = I18N[lang] || I18N.en;
  return langObj[key] || I18N.en[key] || key;
}

// ============================================================================
// CSS TEXT - PREMIUM VIP CASINO STYLING
// ============================================================================
const CSS_TEXT = `
:root {
  --primary: #d4af37;
  --primary-light: #f0d878;
  --dark-bg: #0a0a12;
  --card-bg: #12141f;
  --surface: #1a1d2e;
  --accent: #047857;
  --accent-light: #10b981;
  --danger: #991b1b;
  --danger-light: #dc2626;
  --text: #e8e6e3;
  --text-secondary: #8b8d97;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
  --radius: 10px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.3);
  --shadow-md: 0 8px 24px rgba(0,0,0,0.5);
  --shadow-lg: 0 20px 60px rgba(0,0,0,0.7);
  --shadow-gold: 0 0 20px rgba(212,175,55,0.4);
  --shadow-gold-lg: 0 0 40px rgba(212,175,55,0.6);
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--dark-bg);
  color: var(--text);
  overflow: hidden;
  position: relative;
}

/* ======================== BACKGROUND & ANIMATIONS ======================== */

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideUp {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideLeft {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes cardFlip {
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(90deg); }
  100% { transform: rotateY(180deg); }
}

@keyframes chipBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes goldGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(212,175,55,0.4); }
  50% { box-shadow: 0 0 40px rgba(212,175,55,0.8); }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

@keyframes confettiDrop {
  to {
    transform: translateY(100vh) rotateZ(720deg);
    opacity: 0;
  }
}

@keyframes particleFloat {
  to {
    transform: translateY(-100px);
    opacity: 0;
  }
}

@keyframes pulseRing {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 0.4; }
  100% { transform: scale(1.2); opacity: 0; }
}

@keyframes dealCard {
  from {
    transform: translateY(-100px) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes resultPop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes spinCard {
  from { transform: rotateY(0deg); }
  to { transform: rotateY(360deg); }
}

@keyframes progressFill {
  from { width: 0%; }
  to { width: 100%; }
}

@keyframes borderGlow {
  0%, 100% { border-color: var(--primary); }
  50% { border-color: var(--primary-light); }
}

/* ======================== ROOT CONTAINER ======================== */

#kk-root {
  width: 100%;
  height: 100%;
  max-width: 480px;
  margin: 0 auto;
  background: linear-gradient(135deg, #0a0a12 0%, #0f0f1a 50%, #0a0a12 100%);
  position: relative;
  overflow: hidden;
  padding: max(0px, env(safe-area-inset-top)) max(0px, env(safe-area-inset-right)) max(0px, env(safe-area-inset-bottom)) max(0px, env(safe-area-inset-left));
}

#kk-root::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(212,175,55,0.02) 2px, rgba(212,175,55,0.02) 4px);
  pointer-events: none;
  z-index: 0;
}

/* ======================== SCREENS ======================== */

.screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: none;
  flex-direction: column;
  z-index: 1;
  opacity: 0;
  animation: fadeIn 0.4s ease-out;
}

.screen.active {
  display: flex;
  opacity: 1;
}

.screen.exit {
  animation: fadeOut 0.3s ease-out;
}

/* ======================== TOP BAR ======================== */

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(180deg, rgba(26,29,46,0.95) 0%, rgba(26,29,46,0.8) 100%);
  border-bottom: 1px solid rgba(212,175,55,0.2);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.top-bar-center {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--primary-light);
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  justify-content: flex-end;
  flex: 1;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(212,175,55,0.1);
  border: 1px solid rgba(212,175,55,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: var(--transition);
  color: var(--primary);
}

.btn-icon:active {
  background: rgba(212,175,55,0.2);
  transform: scale(0.95);
}

.stars-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1));
  border: 1px solid rgba(212,175,55,0.4);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-light);
}

/* ======================== BUTTONS ======================== */

.btn {
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  letter-spacing: 0.5px;
}

.btn-primary {
  background: linear-gradient(135deg, #d4af37 0%, #f0d878 50%, #d4af37 100%);
  color: #0a0a12;
  box-shadow: 0 4px 15px rgba(212,175,55,0.4), inset 0 1px 0 rgba(255,255,255,0.3);
  text-shadow: 0 1px 2px rgba(10,10,18,0.3);
}

.btn-primary:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(212,175,55,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--primary);
  color: var(--primary);
}

.btn-secondary:active {
  background: rgba(212,175,55,0.1);
  transform: scale(0.98);
}

.btn-accent {
  background: linear-gradient(135deg, #047857 0%, #10b981 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(4,120,87,0.4);
}

.btn-accent:active {
  transform: scale(0.98);
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-large {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: 16px;
  width: 100%;
}

/* ======================== BOTTOM NAVIGATION ======================== */

.bottom-nav {
  position: fixed;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 24px);
  max-width: 456px;
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: rgba(26,29,46,0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: 20px;
  z-index: 500;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  cursor: pointer;
  border-radius: var(--radius);
  transition: var(--transition);
  color: var(--text-secondary);
}

.nav-item:active {
  background: rgba(212,175,55,0.1);
}

.nav-item.active {
  color: var(--primary);
}

.nav-icon {
  font-size: 22px;
}

.nav-item span:last-child {
  font-size: 11px;
  text-align: center;
  line-height: 1.2;
}

/* ======================== CARDS ======================== */

.card {
  background: linear-gradient(135deg, rgba(18,20,31,0.8), rgba(26,29,46,0.6));
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  backdrop-filter: blur(10px);
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-light);
  margin-bottom: var(--spacing-md);
  letter-spacing: 0.5px;
}

/* ======================== PLAYING CARDS ======================== */

.playing-card {
  width: 58px;
  height: 82px;
  border-radius: 6px;
  position: relative;
  background: white;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  perspective: 800px;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  animation: dealCard 0.6s ease-out;
  transform-style: preserve-3d;
}

.playing-card.flip {
  transform: rotateY(180deg);
}

.playing-card.dealt {
  animation: dealCard 0.6s ease-out;
  box-shadow: 0 8px 20px rgba(212,175,55,0.4);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  backface-visibility: hidden;
  border-radius: 6px;
  flex-direction: column;
}

.card-face.front {
  background: white;
  color: black;
  transform: rotateY(0deg);
}

.card-face.front.red {
  color: #c41e3a;
}

.card-face.front.black {
  color: #000;
}

.card-face.back {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: var(--primary);
  transform: rotateY(180deg);
  border: 1px solid rgba(212,175,55,0.3);
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(212,175,55,0.1) 4px, rgba(212,175,55,0.1) 8px);
}

/* ======================== CHIPS ======================== */

.chip {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 11px;
  cursor: pointer;
  border: 3px dashed;
  transition: var(--transition);
  position: relative;
  box-shadow: 0 4px 8px rgba(0,0,0,0.4);
}

.chip-50 {
  background: #4ade80;
  border-color: #22c55e;
  color: white;
}

.chip-100 {
  background: #60a5fa;
  border-color: #3b82f6;
  color: white;
}

.chip-500 {
  background: #f472b6;
  border-color: #ec4899;
  color: white;
}

.chip-1000 {
  background: #fbbf24;
  border-color: #f59e0b;
  color: #0a0a12;
}

.chip-5000 {
  background: #a78bfa;
  border-color: #9333ea;
  color: white;
}

.chip-10000 {
  background: #f87171;
  border-color: #ef4444;
  color: white;
}

.chip:active {
  transform: scale(1.15);
}

.chip.selected {
  transform: scale(1.15);
  animation: goldGlow 1.5s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(212,175,55,0.6), 0 4px 8px rgba(0,0,0,0.4);
}

.chip-stack {
  position: relative;
}

.chip-stack::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: 0 6px 12px rgba(0,0,0,0.5);
  pointer-events: none;
}

/* ======================== BETTING AREAS ======================== */

.betting-area {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: rgba(4,120,87,0.1);
  border-radius: var(--radius-lg);
  margin: var(--spacing-lg) 0;
}

.bet-zone {
  padding: var(--spacing-md);
  border-radius: var(--radius);
  background: rgba(10,10,18,0.5);
  border: 2px solid transparent;
  cursor: pointer;
  text-align: center;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.bet-zone::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.bet-zone-player {
  border-color: rgba(96,165,250,0.4);
  color: #60a5fa;
}

.bet-zone-player:active {
  background: rgba(96,165,250,0.15);
  border-color: #60a5fa;
}

.bet-zone-banker {
  border-color: rgba(248,113,113,0.4);
  color: #f87171;
}

.bet-zone-banker:active {
  background: rgba(248,113,113,0.15);
  border-color: #f87171;
}

.bet-zone-tie {
  border-color: rgba(16,185,129,0.4);
  color: #10b981;
}

.bet-zone-tie:active {
  background: rgba(16,185,129,0.15);
  border-color: #10b981;
}

.bet-zone.active::before {
  opacity: 1;
  animation: borderGlow 1.5s ease-in-out infinite;
}

.bet-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.bet-payout {
  font-size: 13px;
  opacity: 0.8;
}

.bet-amount {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-light);
  margin-top: 4px;
}

/* ======================== GAME TABLE ======================== */

.game-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: var(--spacing-lg);
  position: relative;
  background: radial-gradient(ellipse at center, rgba(4,120,87,0.15) 0%, rgba(4,120,87,0) 70%);
  border-radius: 50%;
}

.table-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.table-label {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--primary-light);
  text-transform: uppercase;
}

.cards-display {
  display: flex;
  gap: 8px;
  min-height: 90px;
  align-items: center;
  justify-content: center;
}

.card-slot {
  width: 58px;
  height: 82px;
  border: 2px dashed rgba(212,175,55,0.3);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10,10,18,0.5);
}

.score-display {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary);
  text-shadow: 0 0 10px rgba(212,175,55,0.5);
}

.result-banner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  text-align: center;
}

.result-emoji {
  font-size: 60px;
  margin-bottom: var(--spacing-md);
  animation: resultPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.result-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-light);
  margin-bottom: var(--spacing-sm);
}

.result-amount {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ======================== HOME SCREEN ======================== */

.sc-home {
  padding-bottom: 100px;
  overflow-y: auto;
}

.profile-mini {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(18,20,31,0.8), rgba(26,29,46,0.6));
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: var(--radius-lg);
  margin: var(--spacing-lg) var(--spacing-lg) 0;
  backdrop-filter: blur(10px);
}

.profile-avatar-small {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #f0d878);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 2px solid var(--primary);
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-light);
}

.profile-level {
  font-size: 12px;
  color: var(--text-secondary);
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg);
  margin: var(--spacing-lg) 0;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(18,20,31,0.8), rgba(26,29,46,0.6));
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition);
  color: var(--text);
}

.action-btn:active {
  background: linear-gradient(135deg, rgba(18,20,31,0.95), rgba(26,29,46,0.8));
  border-color: rgba(212,175,55,0.4);
  transform: translateY(-2px);
}

.action-btn-icon {
  font-size: 32px;
}

.action-btn-label {
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.quick-access-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.quick-access-item {
  padding: var(--spacing-md);
  background: linear-gradient(135deg, rgba(18,20,31,0.8), rgba(26,29,46,0.6));
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: var(--radius);
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
}

.quick-access-item:active {
  background: linear-gradient(135deg, rgba(18,20,31,0.95), rgba(26,29,46,0.8));
  border-color: rgba(212,175,55,0.4);
}

.quick-access-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.quick-access-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

/* ======================== GAME SCREEN ======================== */

.sc-game {
  padding-bottom: 80px;
}

.chip-tray {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  flex-wrap: wrap;
}

.deal-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

.bet-display {
  font-size: 14px;
  color: var(--text-secondary);
}

.bet-display-amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-light);
}

.deal-btn {
  width: 100%;
  max-width: 200px;
}

.mini-roadmap {
  padding: var(--spacing-lg);
}

.roadmap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18px, 1fr));
  gap: 2px;
  max-width: 300px;
  margin: 0 auto;
}

.roadmap-cell {
  width: 18px;
  height: 18px;
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  background: rgba(10,10,18,0.8);
}

.roadmap-player {
  background: rgba(96,165,250,0.3);
  border-color: #60a5fa;
  color: #60a5fa;
}

.roadmap-banker {
  background: rgba(248,113,113,0.3);
  border-color: #f87171;
  color: #f87171;
}

.roadmap-tie {
  background: rgba(16,185,129,0.3);
  border-color: #10b981;
  color: #10b981;
}

/* ======================== RANKING SCREEN ======================== */

.sc-ranking {
  padding-bottom: 100px;
}

.rank-tabs {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid rgba(212,175,55,0.1);
}

.rank-tab {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: var(--transition);
}

.rank-tab.active {
  border-bottom-color: var(--primary);
  color: var(--primary);
}

.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-xl) var(--spacing-lg);
  height: 180px;
}

.podium-place {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
}

.podium-1 {
  order: 2;
  height: 140px;
}

.podium-2 {
  order: 1;
  height: 100px;
}

.podium-3 {
  order: 3;
  height: 70px;
}

.podium-rank {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.podium-1 .podium-rank {
  color: var(--primary);
  text-shadow: 0 0 10px rgba(212,175,55,0.5);
}

.podium-2 .podium-rank {
  color: #c0c0c0;
}

.podium-3 .podium-rank {
  color: #cd7f32;
}

.podium-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: rgba(212,175,55,0.1);
  border: 2px solid rgba(212,175,55,0.3);
  margin-bottom: var(--spacing-sm);
}

.podium-name {
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  color: var(--text-secondary);
}

.podium-stars {
  font-size: 10px;
  color: var(--text-secondary);
}

.ranking-list {
  padding: 0 var(--spacing-lg);
}

.ranking-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid rgba(212,175,55,0.1);
}

.ranking-number {
  width: 30px;
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
}

.ranking-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(212,175,55,0.1);
  border: 1px solid rgba(212,175,55,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.ranking-info {
  flex: 1;
}

.ranking-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.ranking-stats {
  font-size: 11px;
  color: var(--text-secondary);
}

.ranking-stars {
  text-align: right;
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-light);
}

/* ======================== SHOP SCREEN ======================== */

.sc-shop {
  padding-bottom: 100px;
}

.shop-tabs {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid rgba(212,175,55,0.1);
}

.shop-tab {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: var(--transition);
}

.shop-tab.active {
  border-bottom-color: var(--primary);
  color: var(--primary);
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

.shop-item {
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(18,20,31,0.8), rgba(26,29,46,0.6));
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: var(--radius-lg);
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.shop-item:active {
  background: linear-gradient(135deg, rgba(18,20,31,0.95), rgba(26,29,46,0.8));
  border-color: rgba(212,175,55,0.4);
  transform: translateY(-4px);
}

.shop-item-icon {
  font-size: 40px;
  margin-bottom: var(--spacing-sm);
}

.shop-item-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.shop-item-price {
  font-size: 12px;
  color: var(--primary-light);
  font-weight: 600;
}

.shop-item-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background: rgba(4,120,87,0.8);
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #10b981;
}

/* ======================== MISSION SCREEN ======================== */

.sc-mission {
  padding-bottom: 100px;
  overflow-y: auto;
}

.mission-section {
  padding: var(--spacing-lg);
}

.mission-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-light);
  text-transform: uppercase;
  margin-bottom: var(--spacing-md);
  letter-spacing: 0.5px;
}

.mission-card {
  padding: var(--spacing-md);
  background: linear-gradient(135deg, rgba(18,20,31,0.8), rgba(26,29,46,0.6));
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: var(--radius);
  margin-bottom: var(--spacing-md);
}

.mission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.mission-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.mission-reward {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-light);
}

.mission-progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(10,10,18,0.8);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
}

.mission-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--primary-light));
  width: 0%;
  transition: width 0.3s ease;
}

.achievement-card {
  padding: var(--spacing-md);
  background: linear-gradient(135deg, rgba(18,20,31,0.8), rgba(26,29,46,0.6));
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: var(--radius);
  margin-bottom: var(--spacing-md);
  text-align: center;
  position: relative;
}

.achievement-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.achievement-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}

.achievement-locked {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.7);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

/* ======================== PROFILE SCREEN ======================== */

.sc-profile {
  padding-bottom: 100px;
  overflow-y: auto;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  position: relative;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #f0d878);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  border: 3px solid var(--primary);
  margin-bottom: var(--spacing-md);
  position: relative;
}

.profile-avatar::before {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid rgba(212,175,55,0.5);
  animation: pulseRing 2s ease-out infinite;
}

.profile-level-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #0a0a12;
  border: 2px solid var(--card-bg);
}

.profile-name-input {
  width: 100%;
  max-width: 200px;
  padding: 8px 12px;
  background: rgba(10,10,18,0.8);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: var(--radius);
  color: var(--text);
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.profile-name-input::placeholder {
  color: var(--text-secondary);
}

.profile-save-btn {
  width: 100%;
  max-width: 120px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

.stat-card {
  padding: var(--spacing-md);
  background: linear-gradient(135deg, rgba(18,20,31,0.8), rgba(26,29,46,0.6));
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: var(--radius);
  text-align: center;
}

.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-light);
}

.profile-action-buttons {
  display: flex;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

/* ======================== SETTINGS SCREEN ======================== */

.sc-settings {
  overflow-y: auto;
  padding-bottom: 50px;
}

.settings-section {
  padding: var(--spacing-lg);
}

.settings-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-light);
  text-transform: uppercase;
  margin-bottom: var(--spacing-md);
  letter-spacing: 0.5px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid rgba(212,175,55,0.1);
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.toggle-switch {
  width: 48px;
  height: 28px;
  background: rgba(10,10,18,0.8);
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: var(--transition);
}

.toggle-switch.on {
  background: linear-gradient(135deg, #047857, #10b981);
  border-color: #10b981;
}

.toggle-knob {
  position: absolute;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: var(--transition);
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.toggle-switch.on .toggle-knob {
  left: 22px;
}

.select-field {
  flex: 1;
  margin-left: var(--spacing-md);
  padding: 6px 12px;
  background: rgba(10,10,18,0.8);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
}

/* ======================== TUTORIAL SCREEN ======================== */

.sc-tutorial {
  overflow-y: auto;
  padding-bottom: 80px;
}

.tutorial-container {
  padding: var(--spacing-xl) var(--spacing-lg);
  text-align: center;
}

.tutorial-step-illustration {
  font-size: 80px;
  margin: var(--spacing-xl) 0;
}

.tutorial-step-text {
  font-size: 14px;
  color: var(--text);
  line-height: 1.6;
  margin: var(--spacing-lg) 0;
}

.tutorial-controls {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin: var(--spacing-xl) 0;
}

.tutorial-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: var(--spacing-lg);
}

.tutorial-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(212,175,55,0.3);
  cursor: pointer;
  transition: var(--transition);
}

.tutorial-dot.active {
  background: var(--primary);
  width: 24px;
  border-radius: 4px;
}

/* ======================== OVERLAYS ======================== */

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: none;
  align-items: flex-end;
  z-index: 600;
  animation: fadeIn 0.3s ease-out;
}

.overlay.active {
  display: flex;
}

.overlay-content {
  width: 100%;
  background: linear-gradient(180deg, rgba(26,29,46,0.95), rgba(18,20,31,0.95));
  border-top: 1px solid rgba(212,175,55,0.2);
  border-radius: 20px 20px 0 0;
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-xl);
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

.overlay-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-light);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.overlay-close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 32px;
  height: 32px;
  background: rgba(212,175,55,0.1);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  color: var(--primary);
  transition: var(--transition);
}

.overlay-close:active {
  background: rgba(212,175,55,0.2);
  transform: scale(0.9);
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.room-item {
  padding: var(--spacing-md);
  background: rgba(10,10,18,0.6);
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: var(--radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: var(--transition);
}

.room-item:active {
  background: rgba(10,10,18,0.8);
  border-color: rgba(212,175,55,0.4);
}

.room-item-info {
  flex: 1;
}

.room-item-code {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.room-item-host {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* ======================== TOAST NOTIFICATIONS ======================== */

#toast-container {
  position: fixed;
  top: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  max-width: 300px;
  pointer-events: none;
}

.toast {
  background: linear-gradient(135deg, rgba(26,29,46,0.95), rgba(18,20,31,0.95));
  border: 1px solid rgba(212,175,55,0.4);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  animation: slideDown 0.3s ease-out;
  pointer-events: auto;
  margin-bottom: var(--spacing-sm);
}

.toast.error {
  border-color: rgba(220,38,38,0.4);
}

.toast.success {
  border-color: rgba(16,185,129,0.4);
}

/* ======================== CONFETTI & PARTICLES ======================== */

#confetti-container, #particle-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 200;
}

.confetti-piece {
  position: absolute;
  width: 8px;
  height: 8px;
  pointer-events: none;
}

.confetti-piece-gold {
  background: var(--primary);
  animation: confettiDrop 2s ease-in forwards;
}

.gold-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--primary);
  border-radius: 50%;
  animation: particleFloat 1.5s ease-out forwards;
}

/* ======================== SCROLLBAR ======================== */

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(10,10,18,0.5);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary);
}

/* ======================== UTILITY CLASSES ======================== */

.natural-glow {
  animation: goldGlow 1.5s ease-in-out infinite;
}

.win-flash {
  animation: fadeIn 0.3s ease-out;
}

.hidden {
  display: none !important;
}

.text-center {
  text-align: center;
}

.text-primary {
  color: var(--primary);
}

.text-secondary {
  color: var(--text-secondary);
}

.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.gap-md {
  gap: var(--spacing-md);
}

/* ======================== RESPONSIVE ======================== */

@media (max-width: 480px) {
  .bottom-nav {
    width: calc(100% - 16px);
    left: 50%;
    transform: translateX(-50%);
  }
}
`;


// ============================================================================
// BOOT FUNCTION
// ============================================================================
function boot() {
  // Inject CSS
  var styleEl = document.createElement('style');
  styleEl.textContent = CSS_TEXT;
  document.head.appendChild(styleEl);
  
  // Create root container
  var root = document.createElement('div');
  root.id = 'kk-root';
  document.body.appendChild(root);
  
  // Build HTML template
  root.innerHTML = `
    <!-- HOME SCREEN -->
    <div class="screen sc-home active">
      <div class="top-bar">
        <div class="top-bar-center">FA Baccarat</div>
        <div class="top-bar-right">
          <div class="btn-icon" data-action="settings">⚙️</div>
          <div class="stars-pill">
            <span>⭐</span>
            <span data-bind="stars">10000</span>
          </div>
        </div>
      </div>
      
      <div style="flex:1; overflow-y:auto; padding-bottom:80px;">
        <div class="profile-mini">
          <div class="profile-avatar-small" data-bind="avatar-emoji">😎</div>
          <div class="profile-info">
            <div class="profile-name" data-bind="nickname">Player</div>
            <div class="profile-level"><span data-i18n="level">Level</span> <span data-bind="level">1</span></div>
          </div>
        </div>
        
        <div class="card" style="margin:var(--spacing-lg);">
          <div style="text-align:center;">
            <div style="font-size:32px;margin-bottom:8px;">🎁</div>
            <div class="card-title" style="margin:0;" data-i18n="daily_checkin">Daily Check-in</div>
            <div style="font-size:24px;color:var(--primary-light);margin:var(--spacing-md) 0;">+<span data-bind="daily-reward">100</span></div>
            <button class="btn btn-accent" style="width:100%;" data-action="claim-daily" data-i18n="claim">Claim</button>
          </div>
        </div>
        
        <div class="action-buttons">
          <div class="action-btn" data-action="play-ai">
            <div class="action-btn-icon">🃏</div>
            <div class="action-btn-label" data-i18n="play_ai">Play vs Dealer</div>
          </div>
          <div class="action-btn" data-action="play-online">
            <div class="action-btn-icon">👥</div>
            <div class="action-btn-label" data-i18n="play_online">Online Table</div>
          </div>
        </div>
        
        <div class="card" style="margin:var(--spacing-lg);">
          <div class="card-title" data-i18n="session_summary">Session Summary</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-md);">
            <div style="text-align:center;">
              <div style="font-size:12px;color:var(--text-secondary);" data-i18n="hands_played">Hands Played</div>
              <div style="font-size:18px;font-weight:700;color:var(--primary-light);margin-top:4px;" data-bind="session-hands">0</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:12px;color:var(--text-secondary);" data-i18n="net_profit">Net Profit</div>
              <div style="font-size:18px;font-weight:700;color:var(--primary-light);margin-top:4px;" data-bind="session-profit">0</div>
            </div>
          </div>
        </div>
        
        <div class="quick-access-grid">
          <div class="quick-access-item" data-action="history">
            <div class="quick-access-icon">📋</div>
            <div class="quick-access-text" data-i18n="history">History</div>
          </div>
          <div class="quick-access-item" data-action="statistics">
            <div class="quick-access-icon">📊</div>
            <div class="quick-access-text" data-i18n="statistics">Statistics</div>
          </div>
          <div class="quick-access-item" data-action="tutorial">
            <div class="quick-access-icon">📖</div>
            <div class="quick-access-text" data-i18n="tutorial">Tutorial</div>
          </div>
          <div class="quick-access-item" data-action="roadmap">
            <div class="quick-access-icon">🗺️</div>
            <div class="quick-access-text" data-i18n="road_map">Road Map</div>
          </div>
        </div>
      </div>
      
      <div class="bottom-nav">
        <div class="nav-item active" data-nav="home"><span class="nav-icon">🏠</span><span data-i18n="nav_home">Home</span></div>
        <div class="nav-item" data-nav="ranking"><span class="nav-icon">🏆</span><span data-i18n="nav_rank">Ranking</span></div>
        <div class="nav-item" data-nav="shop"><span class="nav-icon">🛍️</span><span data-i18n="nav_shop">Shop</span></div>
        <div class="nav-item" data-nav="mission"><span class="nav-icon">🎯</span><span data-i18n="nav_mission">Mission</span></div>
        <div class="nav-item" data-nav="profile"><span class="nav-icon">👤</span><span data-i18n="nav_profile">Profile</span></div>
      </div>
    </div>
    
    <!-- GAME SCREEN -->
    <div class="screen sc-game">
      <div class="top-bar">
        <div class="top-bar-left">
          <div class="btn-icon" data-back="game">←</div>
        </div>
        <div class="top-bar-center" data-bind="round-display">Round 1</div>
        <div class="top-bar-right">
          <div class="stars-pill">
            <span>⭐</span>
            <span data-bind="game-stars">10000</span>
          </div>
        </div>
      </div>
      
      <div class="game-table">
        <div class="table-section">
          <div class="table-label" data-i18n="banker">Banker</div>
          <div class="cards-display" id="banker-cards"></div>
          <div class="score-display" id="banker-score">0</div>
        </div>
        
        <div id="result-banner" class="result-banner" style="display:none;">
          <div class="result-emoji" id="result-emoji"></div>
          <div class="result-text" id="result-text"></div>
          <div class="result-amount" id="result-amount"></div>
        </div>
        
        <div class="table-section">
          <div class="table-label" data-i18n="player">Player</div>
          <div class="cards-display" id="player-cards"></div>
          <div class="score-display" id="player-score">0</div>
        </div>
      </div>
      
      <div class="betting-area">
        <div class="bet-zone bet-zone-player" data-action="bet-player">
          <div class="bet-label" data-i18n="player">Player</div>
          <div class="bet-payout">1:1</div>
          <div class="bet-amount" id="bet-player-amt">0</div>
        </div>
        <div class="bet-zone bet-zone-tie" data-action="bet-tie">
          <div class="bet-label" data-i18n="tie">Tie</div>
          <div class="bet-payout">9:1</div>
          <div class="bet-amount" id="bet-tie-amt">0</div>
        </div>
        <div class="bet-zone bet-zone-banker" data-action="bet-banker">
          <div class="bet-label" data-i18n="banker">Banker</div>
          <div class="bet-payout">1.95:1</div>
          <div class="bet-amount" id="bet-banker-amt">0</div>
        </div>
      </div>
      
      <div class="chip-tray" id="chip-tray">
        <div class="chip chip-50" data-chip="50">50</div>
        <div class="chip chip-100" data-chip="100">100</div>
        <div class="chip chip-500" data-chip="500">500</div>
        <div class="chip chip-1000" data-chip="1000">1K</div>
        <div class="chip chip-5000" data-chip="5000">5K</div>
        <div class="chip chip-10000" data-chip="10000">10K</div>
      </div>
      
      <div class="deal-section">
        <div class="bet-display">
          <span data-i18n="your_bet">Your Bet</span>: <span class="bet-display-amount" id="total-bet">0</span>
        </div>
        <button class="btn btn-primary btn-large" data-action="deal" data-i18n="deal">Deal</button>
      </div>
      
      <div class="mini-roadmap">
        <div class="roadmap-grid" id="roadmap"></div>
      </div>
    </div>
    
    <!-- RANKING SCREEN -->
    <div class="screen sc-ranking">
      <div class="top-bar">
        <div class="top-bar-center" data-i18n="nav_rank">Ranking</div>
      </div>
      
      <div class="rank-tabs">
        <button class="rank-tab active" data-rank-tab="weekly" data-i18n="weekly_top">Weekly Top</button>
        <button class="rank-tab" data-rank-tab="all-time" data-i18n="all_time">All Time</button>
        <button class="rank-tab" data-rank-tab="last-week" data-i18n="last_week">Last Week</button>
      </div>
      
      <div class="podium" id="podium-container"></div>
      <div class="ranking-list" id="ranking-list"></div>
      
      <div class="bottom-nav">
        <div class="nav-item" data-nav="home"><span class="nav-icon">🏠</span><span data-i18n="nav_home">Home</span></div>
        <div class="nav-item active" data-nav="ranking"><span class="nav-icon">🏆</span><span data-i18n="nav_rank">Ranking</span></div>
        <div class="nav-item" data-nav="shop"><span class="nav-icon">🛍️</span><span data-i18n="nav_shop">Shop</span></div>
        <div class="nav-item" data-nav="mission"><span class="nav-icon">🎯</span><span data-i18n="nav_mission">Mission</span></div>
        <div class="nav-item" data-nav="profile"><span class="nav-icon">👤</span><span data-i18n="nav_profile">Profile</span></div>
      </div>
    </div>
    
    <!-- SHOP SCREEN -->
    <div class="screen sc-shop">
      <div class="top-bar">
        <div class="top-bar-center" data-i18n="shop_title">Shop</div>
        <div class="top-bar-right">
          <div class="stars-pill">
            <span>⭐</span>
            <span data-bind="shop-stars">10000</span>
          </div>
        </div>
      </div>
      
      <div class="shop-tabs">
        <button class="shop-tab active" data-shop-tab="avatars" data-i18n="avatars">Avatars</button>
        <button class="shop-tab" data-shop-tab="tables" data-i18n="tables">Tables</button>
        <button class="shop-tab" data-shop-tab="cardbacks" data-i18n="card_backs">Card Backs</button>
      </div>
      
      <div class="shop-grid" id="shop-grid"></div>
      
      <div class="bottom-nav">
        <div class="nav-item" data-nav="home"><span class="nav-icon">🏠</span><span data-i18n="nav_home">Home</span></div>
        <div class="nav-item" data-nav="ranking"><span class="nav-icon">🏆</span><span data-i18n="nav_rank">Ranking</span></div>
        <div class="nav-item active" data-nav="shop"><span class="nav-icon">🛍️</span><span data-i18n="nav_shop">Shop</span></div>
        <div class="nav-item" data-nav="mission"><span class="nav-icon">🎯</span><span data-i18n="nav_mission">Mission</span></div>
        <div class="nav-item" data-nav="profile"><span class="nav-icon">👤</span><span data-i18n="nav_profile">Profile</span></div>
      </div>
    </div>
    
    <!-- MISSION SCREEN -->
    <div class="screen sc-mission">
      <div class="top-bar">
        <div class="top-bar-center" data-i18n="missions_title">Missions</div>
      </div>
      
      <div style="flex:1;overflow-y:auto;padding-bottom:80px;">
        <div class="mission-section">
          <div class="mission-title" data-i18n="daily_mission">Daily Missions</div>
          <div id="daily-missions"></div>
        </div>
        
        <div class="mission-section">
          <div class="mission-title" data-i18n="achievements">Achievements</div>
          <div id="achievement-list" style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--spacing-md);"></div>
        </div>
      </div>
      
      <div class="bottom-nav">
        <div class="nav-item" data-nav="home"><span class="nav-icon">🏠</span><span data-i18n="nav_home">Home</span></div>
        <div class="nav-item" data-nav="ranking"><span class="nav-icon">🏆</span><span data-i18n="nav_rank">Ranking</span></div>
        <div class="nav-item" data-nav="shop"><span class="nav-icon">🛍️</span><span data-i18n="nav_shop">Shop</span></div>
        <div class="nav-item active" data-nav="mission"><span class="nav-icon">🎯</span><span data-i18n="nav_mission">Mission</span></div>
        <div class="nav-item" data-nav="profile"><span class="nav-icon">👤</span><span data-i18n="nav_profile">Profile</span></div>
      </div>
    </div>
    
    <!-- PROFILE SCREEN -->
    <div class="screen sc-profile">
      <div class="top-bar">
        <div class="top-bar-center" data-i18n="profile">Profile</div>
      </div>
      
      <div style="flex:1;overflow-y:auto;padding-bottom:80px;">
        <div class="profile-header">
          <div class="profile-avatar" id="profile-avatar">😎
            <div class="profile-level-badge" data-bind="profile-level-badge">1</div>
          </div>
          <input type="text" id="nickname-input" class="profile-name-input" placeholder="Nickname" data-i18n-placeholder="nickname">
          <button class="btn btn-primary btn-small" data-action="save-nickname" data-i18n="save">Save</button>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label" data-i18n="total_games">Total Games</div>
            <div class="stat-value" data-bind="profile-total-games">0</div>
          </div>
          <div class="stat-card">
            <div class="stat-label" data-i18n="wins">Wins</div>
            <div class="stat-value" data-bind="profile-wins">0</div>
          </div>
          <div class="stat-card">
            <div class="stat-label" data-i18n="win_rate">Win Rate</div>
            <div class="stat-value" data-bind="profile-win-rate">0%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label" data-i18n="best_streak">Best Streak</div>
            <div class="stat-value" data-bind="profile-best-streak">0</div>
          </div>
          <div class="stat-card">
            <div class="stat-label" data-i18n="peak_stars">Peak Stars</div>
            <div class="stat-value" data-bind="profile-peak-stars">10000</div>
          </div>
          <div class="stat-card">
            <div class="stat-label" data-i18n="current_stars">Current Stars</div>
            <div class="stat-value" data-bind="profile-current-stars">10000</div>
          </div>
        </div>
        
        <div class="profile-action-buttons">
          <button class="btn btn-secondary" style="flex:1;" data-action="reset-stats" data-i18n="reset_stats">Reset Stats</button>
        </div>
      </div>
      
      <div class="bottom-nav">
        <div class="nav-item" data-nav="home"><span class="nav-icon">🏠</span><span data-i18n="nav_home">Home</span></div>
        <div class="nav-item" data-nav="ranking"><span class="nav-icon">🏆</span><span data-i18n="nav_rank">Ranking</span></div>
        <div class="nav-item" data-nav="shop"><span class="nav-icon">🛍️</span><span data-i18n="nav_shop">Shop</span></div>
        <div class="nav-item" data-nav="mission"><span class="nav-icon">🎯</span><span data-i18n="nav_mission">Mission</span></div>
        <div class="nav-item active" data-nav="profile"><span class="nav-icon">👤</span><span data-i18n="nav_profile">Profile</span></div>
      </div>
    </div>
    
    <!-- SETTINGS SCREEN -->
    <div class="screen sc-settings">
      <div class="top-bar">
        <div class="top-bar-left">
          <div class="btn-icon" data-back="settings">←</div>
        </div>
        <div class="top-bar-center" data-i18n="settings">Settings</div>
      </div>
      
      <div style="flex:1;overflow-y:auto;">
        <div class="settings-section">
          <div class="settings-title">Audio</div>
          <div class="setting-row">
            <span class="setting-label" data-i18n="sound">Sound</span>
            <div class="toggle-switch" id="toggle-sound">
              <div class="toggle-knob"></div>
            </div>
          </div>
          <div class="setting-row">
            <span class="setting-label" data-i18n="vibrate">Vibration</span>
            <div class="toggle-switch" id="toggle-vibrate">
              <div class="toggle-knob"></div>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <div class="settings-title">Game</div>
          <div class="setting-row">
            <span class="setting-label" data-i18n="auto_deal">Auto Deal</span>
            <div class="toggle-switch" id="toggle-auto-deal">
              <div class="toggle-knob"></div>
            </div>
          </div>
          <div class="setting-row">
            <span class="setting-label" data-i18n="animation_speed">Animation Speed</span>
            <select class="select-field" id="speed-select">
              <option value="slow" data-i18n="speed_slow">Slow</option>
              <option value="normal" data-i18n="speed_normal" selected>Normal</option>
              <option value="fast" data-i18n="speed_fast">Fast</option>
            </select>
          </div>
        </div>
        
        <div class="settings-section">
          <div class="settings-title">Display</div>
          <div class="setting-row">
            <span class="setting-label" data-i18n="theme">Theme</span>
            <select class="select-field" id="theme-select">
              <option value="dark">Dark</option>
              <option value="midnight">Midnight</option>
              <option value="emerald">Emerald</option>
              <option value="crimson">Crimson</option>
            </select>
          </div>
        </div>
        
        <div class="settings-section">
          <div class="settings-title">Localization</div>
          <div class="setting-row">
            <span class="setting-label" data-i18n="language">Language</span>
            <select class="select-field" id="lang-select">
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
    </div>
    
    <!-- TUTORIAL SCREEN -->
    <div class="screen sc-tutorial">
      <div class="top-bar">
        <div class="top-bar-left">
          <div class="btn-icon" data-back="tutorial">←</div>
        </div>
        <div class="top-bar-center" data-i18n="tut_title">How to Play</div>
      </div>
      
      <div class="tutorial-container" style="flex:1;overflow-y:auto;">
        <div class="tutorial-step-illustration" id="tut-illustration">3</div>
        <div class="card-title" id="tut-subtitle" data-i18n="tut_welcome">Welcome</div>
        <div class="tutorial-step-text" id="tut-text"></div>
        
        <div class="tutorial-dots" id="tutorial-dots"></div>
        
        <div class="tutorial-controls">
          <button class="btn btn-secondary" id="tut-prev" data-i18n="tut_prev">Previous</button>
          <button class="btn btn-primary" id="tut-next" data-i18n="tut_next">Next</button>
        </div>
        <button class="btn btn-primary btn-large" id="tut-finish" style="display:none;" data-i18n="tut_finish">Finish</button>
      </div>
    </div>
    
    <!-- RESULT OVERLAY -->
    <div class="overlay" id="result-overlay">
      <div class="overlay-content">
        <div style="text-align:center;padding:var(--spacing-xl) 0;">
          <div style="font-size:80px;margin-bottom:var(--spacing-lg);" id="overlay-emoji">🎉</div>
          <div style="font-size:20px;font-weight:700;color:var(--primary-light);margin-bottom:var(--spacing-md);" id="overlay-result">You Win!</div>
          <div style="font-size:32px;font-weight:700;color:var(--primary);margin-bottom:var(--spacing-xl);" id="overlay-amount">+500</div>
          <button class="btn btn-primary btn-large" data-action="close-result" data-i18n="continue_btn">Continue</button>
        </div>
      </div>
    </div>
    
    <!-- ROOM PANEL -->
    <div class="overlay" id="room-panel">
      <div class="overlay-content">
        <div class="overlay-title" data-i18n="online_table">Online Table</div>
        <div style="margin-top:var(--spacing-lg);">
          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:var(--spacing-sm);" data-i18n="create_room">Create Room</div>
          <div style="display:flex;gap:var(--spacing-sm);margin-bottom:var(--spacing-lg);">
            <input type="text" id="wager-input" placeholder="Wager" style="flex:1;padding:8px 12px;background:rgba(10,10,18,0.8);border:1px solid rgba(212,175,55,0.3);border-radius:var(--radius);color:var(--text);font-size:13px;">
            <button class="btn btn-primary btn-small" data-action="create-room" data-i18n="create_room">Create</button>
          </div>
          
          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:var(--spacing-sm);" data-i18n="join_room">Join Room</div>
          <div style="display:flex;gap:var(--spacing-sm);margin-bottom:var(--spacing-lg);">
            <input type="text" id="room-code-input" placeholder="Room Code" style="flex:1;padding:8px 12px;background:rgba(10,10,18,0.8);border:1px solid rgba(212,175,55,0.3);border-radius:var(--radius);color:var(--text);font-size:13px;">
            <button class="btn btn-primary btn-small" data-action="join-room" data-i18n="join">Join</button>
          </div>
          
          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:var(--spacing-sm);" data-i18n="open_rooms">Open Rooms</div>
          <div class="room-list" id="room-list"></div>
        </div>
      </div>
    </div>
    
    <!-- HISTORY PANEL -->
    <div class="overlay" id="history-panel">
      <div class="overlay-content">
        <div class="overlay-title" data-i18n="history">History</div>
        <div id="history-list" style="margin-top:var(--spacing-lg);"></div>
      </div>
    </div>
    
    <!-- STATISTICS PANEL -->
    <div class="overlay" id="stats-panel">
      <div class="overlay-content">
        <div class="overlay-title" data-i18n="statistics">Statistics</div>
        <div id="stats-content" style="margin-top:var(--spacing-lg);"></div>
      </div>
    </div>
    
    <!-- ROADMAP PANEL -->
    <div class="overlay" id="roadmap-panel">
      <div class="overlay-content">
        <div class="overlay-title" data-i18n="road_map">Road Map</div>
        <div style="margin-top:var(--spacing-lg);">
          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:var(--spacing-md);" data-i18n="big_road">Big Road</div>
          <div class="roadmap-grid" id="big-road" style="max-width:100%;"></div>

          <div style="font-size:12px;color:var(--text-secondary);margin:var(--spacing-lg) 0 var(--spacing-md);" data-i18n="bead_plate">Bead Plate</div>
          <div class="roadmap-grid" id="bead-grid" style="max-width:100%;"></div>

          <div style="font-size:12px;color:var(--text-secondary);margin:var(--spacing-lg) 0 var(--spacing-md);" data-i18n="cards_remaining">Cards Remaining</div>
          <div style="font-size:16px;font-weight:700;color:var(--primary-light);" data-bind="cards-left">208</div>
        </div>
        <button class="btn btn-accent" style="width:100%;margin-top:var(--spacing-lg);" data-action="close-overlay" data-overlay="roadmap-panel" data-i18n="ok">OK</button>
      </div>
    </div>
    
    <!-- TOAST CONTAINER -->
    <div id="toast-container"></div>
    
    <!-- CONFETTI CONTAINER -->
    <div id="confetti-container"></div>
    
    <!-- PARTICLE CONTAINER -->
    <div id="particle-container"></div>
  `;
  
  // Apply translations
  function applyTranslations() {
    var lang = localStorage.getItem('lang') || 'en';
    var elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      el.textContent = t(key, lang);
    });
  }
  
  applyTranslations();
  
  // Return true to indicate boot complete
  return true;
}
// ============================================================================
// BACCARAT VIP - PART 2: Game Logic, UI, and Online Systems
// ============================================================================

// SECTION 5: State Variables & Persistence (~200 lines)

let lang = 'en';
let profile, settings, shopData, gameState, dailyMission, onlineState;
let tutorialStep = 0;
let sessionStats = { handsPlayed: 0, netProfit: 0, biggestWin: 0, startTime: 0 };

// Audio context (lazy init)
let audioContext = null;
let currentShoe = [];
let shoePosition = 0;

// Game history
let gameHistory = [];

// Translation helper
function t(key) {
  if (I18N[lang] && I18N[lang][key]) {
    return I18N[lang][key];
  }
  if (I18N.en && I18N.en[key]) {
    return I18N.en[key];
  }
  return key;
}

// Apply i18n to all elements with data-i18n
function applyI18n() {
  var els = document.querySelectorAll('[data-i18n]');
  els.forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    var text = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });
}

// Load profile from localStorage
function loadProfile() {
  var stored = localStorage.getItem('bac_profile_v2');
  if (stored) {
    try {
      profile = JSON.parse(stored);
    } catch (e) {
      profile = createDefaultProfile();
    }
  } else {
    profile = createDefaultProfile();
  }
  return profile;
}

function createDefaultProfile() {
  return {
    userId: 'user_' + Math.random().toString(36).substr(2, 9),
    nickname: 'Player',
    avatar: 'avatar_1',
    stars: STARTING_STARS || 10000,
    xp: 0,
    level: 1,
    totalWins: 0,
    totalLoss: 0,
    totalPlayed: 0,
    bestStreak: 0,
    currentStreak: 0,
    tieWins: 0,
    biggestBet: 0,
    peakStars: STARTING_STARS || 10000,
    bankerBets: 0,
    playerBets: 0,
    tieBets: 0,
    todayGames: 0,
    todayWins: 0,
    todayTotalBet: 0,
    todayStreak: 0,
    todayBankerBets: 0,
    todayTieBets: 0,
    lastCheckinDate: null,
    lastWeeklyReset: getWeekStart(),
    unlockedAchievements: [],
    completedMissions: [],
    recoveryCount: 0,
    lastRecoveryTime: 0
  };
}

function saveProfile() {
  localStorage.setItem('bac_profile_v2', JSON.stringify(profile));
}

// Load settings from localStorage
function loadSettings() {
  var stored = localStorage.getItem('bac_settings_v2');
  if (stored) {
    try {
      settings = JSON.parse(stored);
    } catch (e) {
      settings = createDefaultSettings();
    }
  } else {
    settings = createDefaultSettings();
  }
  return settings;
}

function createDefaultSettings() {
  return {
    sound: true,
    vibrate: true,
    language: 'en',
    animationSpeed: 'normal',
    autoDeal: false,
    theme: 'dark',
    notificationEnabled: true
  };
}

function saveSettings() {
  localStorage.setItem('bac_settings_v2', JSON.stringify(settings));
}

// Load shop data from localStorage
function loadShopData() {
  var stored = localStorage.getItem('bac_shop_v2');
  if (stored) {
    try {
      shopData = JSON.parse(stored);
    } catch (e) {
      shopData = createDefaultShopData();
    }
  } else {
    shopData = createDefaultShopData();
  }
  return shopData;
}

function createDefaultShopData() {
  return {
    owned: [],
    equipped: {
      avatar: 'avatar_1',
      table: 'table_classic',
      cardback: 'cardback_blue'
    }
  };
}

function saveShopData() {
  localStorage.setItem('bac_shop_v2', JSON.stringify(shopData));
}

// Load daily mission from localStorage with date check
function loadDailyMission() {
  var stored = localStorage.getItem('bac_mission_v2');
  var today = getDayKey();

  if (stored) {
    try {
      var data = JSON.parse(stored);
      if (data.date === today) {
        dailyMission = data;
        return;
      }
    } catch (e) {}
  }

  // New day - reset missions
  dailyMission = {
    date: today,
    missions: [
      { id: 'daily_1', name: 'Play 10 Hands', target: 10, current: 0, reward: 100, type: 'games', claimed: false },
      { id: 'daily_2', name: 'Win 5 Hands', target: 5, current: 0, reward: 150, type: 'wins', claimed: false },
      { id: 'daily_3', name: 'Bet 5000 Stars', target: 5000, current: 0, reward: 200, type: 'totalBet', claimed: false },
      { id: 'daily_4', name: '3-Win Streak', target: 3, current: 0, reward: 250, type: 'streak', claimed: false }
    ]
  };
  saveDailyMission();
}

function saveDailyMission() {
  localStorage.setItem('bac_mission_v2', JSON.stringify(dailyMission));
}

function resetDailyMissions() {
  var today = getDayKey();
  if (dailyMission && dailyMission.date !== today) {
    loadDailyMission();
  }
}

// Apply theme CSS variables
function applyTheme() {
  var theme = settings.theme || 'dark';
  var root = document.documentElement;

  var themes = {
    dark: {
      bg: '#0a0a12',
      bgSecondary: '#1a1a2e',
      accent: '#d4af37',
      accentLight: '#e8c547',
      success: '#10b981',
      danger: '#ef4444',
      text: '#ffffff',
      textMuted: '#a0a0a0'
    },
    midnight: {
      bg: '#0d1117',
      bgSecondary: '#161b22',
      accent: '#58a6ff',
      accentLight: '#79c0ff',
      success: '#3fb950',
      danger: '#f85149',
      text: '#c9d1d9',
      textMuted: '#8b949e'
    },
    emerald: {
      bg: '#0a1612',
      bgSecondary: '#132319',
      accent: '#10b981',
      accentLight: '#34d399',
      success: '#059669',
      danger: '#dc2626',
      text: '#ecfdf5',
      textMuted: '#a7f3d0'
    },
    crimson: {
      bg: '#120a0a',
      bgSecondary: '#2a1515',
      accent: '#ef4444',
      accentLight: '#f87171',
      success: '#16a34a',
      danger: '#991b1b',
      text: '#fff5f5',
      textMuted: '#fc8181'
    }
  };

  var themeVars = themes[theme] || themes.dark;

  Object.keys(themeVars).forEach(function(key) {
    root.style.setProperty('--' + key, themeVars[key]);
  });
}

// SECTION 6: Audio System (~100 lines)

function initAudio() {
  if (audioContext) return audioContext;

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return audioContext;
  } catch (e) {
    console.warn('Web Audio API not available');
    return null;
  }
}

function playSound(type) {
  if (!settings.sound) return;

  var ctx = initAudio();
  if (!ctx) return;

  try {
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    var soundConfig = {
      chip: { freq: 800, waveform: 'sine', duration: 0.1 },
      deal: { freq: 400, waveform: 'square', duration: 0.2 },
      flip: { freq: 1200, waveform: 'sine', duration: 0.15 },
      win: { freq: 700, waveform: 'sine', duration: 0.3 },
      lose: { freq: 300, waveform: 'sine', duration: 0.25 },
      natural: { freq: 1000, waveform: 'sine', duration: 0.4 },
      click: { freq: 600, waveform: 'sine', duration: 0.05 },
      swoosh: { freq: 800, waveform: 'triangle', duration: 0.2 }
    };

    var config = soundConfig[type] || soundConfig.click;

    osc.type = config.waveform;
    osc.frequency.setValueAtTime(config.freq, now);
    osc.frequency.exponentialRampToValueAtTime(config.freq * 0.5, now + config.duration);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + config.duration);

    osc.start(now);
    osc.stop(now + config.duration);
  } catch (e) {
    console.warn('Sound error:', e);
  }
}

// SECTION 7: Utility Functions (~150 lines)

function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getDayKey() {
  var d = new Date();
  var year = d.getFullYear();
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function getWeekStart() {
  var d = new Date();
  var dayOfWeek = d.getDay();
  var daysToSat = (dayOfWeek === 6) ? 0 : (dayOfWeek === 0) ? 1 : (8 - dayOfWeek - 1);
  var satDate = new Date(d);
  satDate.setDate(d.getDate() - daysToSat);
  satDate.setHours(0, 0, 0, 0);
  return satDate.getTime();
}

function isNewWeek(lastReset) {
  return !lastReset || (getWeekStart() > lastReset);
}

function showScreen(name) {
  var screens = document.querySelectorAll('.screen');
  screens.forEach(function(s) {
    s.classList.remove('active');
  });

  var screen = document.querySelector('.sc-' + name);
  if (screen) {
    screen.classList.add('active');
  }

  updateNavHighlight(name);
}

function showOverlay(id) {
  var el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
  }
}

function hideOverlay(id) {
  var el = document.getElementById(id);
  if (el) {
    el.classList.remove('active');
  }
}

function showToast(msg, duration) {
  duration = duration || 3000;
  var container = document.getElementById('toast-container');
  if (!container) return;

  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(function() {
    toast.classList.add('show');
  }, 10);

  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() {
      toast.remove();
    }, 300);
  }, duration);
}

function vibrate(pattern) {
  if (!settings.vibrate || !navigator.vibrate) return;
  navigator.vibrate(pattern || 50);
}

function sleep(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

function addXp(amount) {
  if (!profile) return;
  profile.xp += amount;

  var xpPerLevel = 1000;
  var newLevel = Math.floor(profile.xp / xpPerLevel) + 1;

  if (newLevel > profile.level) {
    profile.level = newLevel;
    showToast(t('level_up') + ' ' + newLevel + '!', 4000);
    showConfetti(50);
  }

  saveProfile();
}

function showConfetti(count) {
  var container = document.getElementById('confetti-container');
  if (!container) return;

  for (var i = 0; i < count; i++) {
    var piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.delay = Math.random() * 0.5 + 's';
    piece.style.background = ['#d4af37', '#e8c547', '#ff69b4', '#00ffff', '#00ff00'][Math.floor(Math.random() * 5)];
    piece.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    container.appendChild(piece);

    piece.addEventListener('animationend', function() {
      piece.remove();
    });
  }
}

function showGoldParticles(count) {
  var container = document.getElementById('particle-container');
  if (!container) return;

  for (var i = 0; i < count; i++) {
    burstParticles(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight,
      3
    );
  }
}

function createGoldParticle(x, y) {
  var container = document.getElementById('particle-container');
  if (!container) return;

  var particle = document.createElement('div');
  particle.className = 'gold-particle';
  particle.style.left = x + 'px';
  particle.style.top = y + 'px';
  particle.style.background = '#d4af37';
  particle.style.width = '8px';
  particle.style.height = '8px';
  particle.style.borderRadius = '50%';
  particle.style.position = 'fixed';
  particle.style.pointerEvents = 'none';
  particle.style.zIndex = '9999';
  particle.style.boxShadow = '0 0 10px rgba(212,175,55,0.8)';
  particle.style.animation = 'particleFloat 2s ease-out forwards';

  container.appendChild(particle);

  setTimeout(function() {
    particle.remove();
  }, 2000);
}

function burstParticles(x, y, count) {
  for (var i = 0; i < count; i++) {
    createGoldParticle(x, y);
  }
}

function updateAllUI() {
  updateStarsDisplay();
  renderChips();
  renderBetZones();

  var avatar = document.getElementById('profile-avatar');
  if (avatar && profile.avatar) {
    avatar.textContent = SHOP_ITEMS.avatars.find(function(a) { return a.id === profile.avatar; })?.emoji || '👤';
  }

  document.querySelectorAll('[data-bind="nickname"]').forEach(function(el) {
    if (profile.nickname) el.textContent = profile.nickname;
  });
}

// SECTION 8: Card & Shoe System (~150 lines)

function createShoe() {
  currentShoe = [];
  var suits = ['♠', '♥', '♦', '♣'];
  var ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  // 8 decks
  for (var d = 0; d < 8; d++) {
    suits.forEach(function(suit) {
      ranks.forEach(function(rank) {
        currentShoe.push({ suit: suit, rank: rank });
      });
    });
  }

  // Fisher-Yates shuffle
  for (var i = currentShoe.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = currentShoe[i];
    currentShoe[i] = currentShoe[j];
    currentShoe[j] = temp;
  }

  shoePosition = 0;
}

function drawCard() {
  if (shoePosition >= currentShoe.length - 20) {
    createShoe();
  }

  var card = currentShoe[shoePosition];
  shoePosition++;
  return card;
}

function cardScore(cards) {
  var total = 0;
  cards.forEach(function(card) {
    var val = CARD_VALUES[card.rank] || 0;
    total += val;
  });
  return total % 10;
}

function renderCardHTML(card, faceDown) {
  if (faceDown) {
    return '<div class="playing-card back">' + renderCardBackHTML() + '</div>';
  }

  var isRed = card.suit === '♥' || card.suit === '♦';
  var color = isRed ? '#e74c3c' : '#000000';

  return '<div class="playing-card" style="color:' + color + '">' +
    '<div class="rank">' + card.rank + '</div>' +
    '<div class="suit">' + card.suit + '</div>' +
    '<div class="value">' + CARD_VALUES[card.rank] + '</div>' +
    '</div>';
}

function renderCardBackHTML() {
  var pattern = '◆ ◇ ◆<br/>◇ ◆ ◇<br/>◆ ◇ ◆';
  return '<div style="font-size:14px;text-align:center;padding:20px 10px;color:#d4af37">' + pattern + '</div>';
}

// SECTION 9: Game Flow (~400 lines)

function startAIGame() {
  gameState.mode = 'ai';
  gameState.selectedChip = 100;
  gameState.currentBet = null;
  gameState.betAmount = 0;
  gameState.isDealing = false;
  gameState.roundNum = 1;
  gameState.playerCards = [];
  gameState.bankerCards = [];
  gameState.aiPlayers = [];

  // Generate 3 AI bots
  gameState.aiPlayers = [];
  for (var i = 0; i < 3; i++) {
    var bot = {
      name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
      avatar: BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)],
      bet: null,
      betAmount: 0,
      strategy: Math.random()
    };
    gameState.aiPlayers.push(bot);
  }

  createShoe();
  showScreen('game');
  renderGameTable();
  renderAIPlayers();
  playSound('swoosh');
}

function placeBet(type) {
  if (gameState.isDealing) return;
  if (!gameState.selectedChip) return;

  gameState.currentBet = type;
  gameState.betAmount = gameState.selectedChip;

  if (gameState.betAmount > profile.stars) {
    showToast(t('insufficient_stars'), 2000);
    return;
  }

  renderBetZones();
  playSound('chip');
  vibrate(50);
}

function selectChip(value) {
  gameState.selectedChip = value;
  renderChips();
  playSound('click');
}

function dealRound() {
  if (gameState.isDealing) return;
  if (!gameState.currentBet) {
    showToast(t('place_bet_first'), 2000);
    return;
  }

  gameState.isDealing = true;

  // Validate bet
  if (gameState.betAmount > profile.stars) {
    showToast(t('insufficient_stars'), 2000);
    gameState.isDealing = false;
    return;
  }

  // Deduct bet
  profile.stars -= gameState.betAmount;
  profile.totalPlayed++;
  profile.todayGames++;
  profile.todayTotalBet += gameState.betAmount;

  if (gameState.betAmount > profile.biggestBet) {
    profile.biggestBet = gameState.betAmount;
  }

  // Track bet type
  if (gameState.currentBet === 'banker') {
    profile.bankerBets++;
    profile.todayBankerBets++;
  } else if (gameState.currentBet === 'tie') {
    profile.tieBets++;
    profile.todayTieBets++;
  } else {
    profile.playerBets++;
  }

  // AI bots place bets
  gameState.aiPlayers.forEach(function(bot) {
    var types = ['player', 'banker', 'tie'];
    var idx = Math.floor(bot.strategy * 3);
    bot.bet = types[idx] || 'player';
    bot.betAmount = 50 + Math.floor(Math.random() * 500);
  });

  // Draw initial 4 cards
  gameState.playerCards = [drawCard(), drawCard()];
  gameState.bankerCards = [drawCard(), drawCard()];

  var pScore = cardScore(gameState.playerCards);
  var bScore = cardScore(gameState.bankerCards);

  updateScores(gameState.playerCards, gameState.bankerCards);

  // Animate dealing
  (function() {
    var pCard1 = gameState.playerCards[0];
    var pCard2 = gameState.playerCards[1];
    var bCard1 = gameState.bankerCards[0];
    var bCard2 = gameState.bankerCards[1];

    setTimeout(function() {
      playSound('deal');
      animateCardAppear('player-cards', pCard1);
    }, 100);

    setTimeout(function() {
      playSound('deal');
      animateCardAppear('banker-cards', bCard1);
    }, 400);

    setTimeout(function() {
      playSound('deal');
      animateCardAppear('player-cards', pCard2);
    }, 700);

    setTimeout(function() {
      playSound('deal');
      animateCardAppear('banker-cards', bCard2);
    }, 1000);

    setTimeout(function() {
      resolveGameLogic();
    }, 1500);
  })();
}

function resolveGameLogic() {
  var pCards = gameState.playerCards;
  var bCards = gameState.bankerCards;
  var pScore = cardScore(pCards);
  var bScore = cardScore(bCards);

  var isNaturalP = pScore >= 8;
  var isNaturalB = bScore >= 8;

  if (isNaturalP || isNaturalB) {
    // Check winner with naturals
    determinWinner(pScore, bScore, pCards, bCards, true);
    return;
  }

  // Apply 3rd card rules
  if (shouldPlayerDraw(pScore)) {
    var pCard3 = drawCard();
    pCards.push(pCard3);
    pScore = cardScore(pCards);
    updateScores(pCards, bCards);
    playSound('flip');
  }

  var pCard3Value = pCards.length > 2 ? CARD_VALUES[pCards[2].rank] : -1;

  if (shouldBankerDraw(bScore, pCard3Value)) {
    var bCard3 = drawCard();
    bCards.push(bCard3);
    bScore = cardScore(bCards);
    updateScores(pCards, bCards);
    playSound('flip');
  }

  setTimeout(function() {
    determinWinner(pScore, bScore, pCards, bCards, false);
  }, 800);
}

function shouldPlayerDraw(score) {
  return score <= 5;
}

function shouldBankerDraw(bScore, playerThirdValue) {
  if (bScore >= 7) return false;
  if (bScore <= 2) return true;
  if (bScore === 3) return playerThirdValue !== 8;
  if (bScore === 4) return playerThirdValue >= 2 && playerThirdValue <= 7;
  if (bScore === 5) return playerThirdValue >= 4 && playerThirdValue <= 7;
  if (bScore === 6) return playerThirdValue === 6 || playerThirdValue === 7;
  return false;
}

function determinWinner(pScore, bScore, pCards, bCards, isNatural) {
  var result;
  var isWin = false;
  var payout = 0;

  if (pScore > bScore) {
    result = 'player';
    isWin = (gameState.currentBet === 'player');
    payout = isWin ? gameState.betAmount * 2 : 0;
  } else if (bScore > pScore) {
    result = 'banker';
    isWin = (gameState.currentBet === 'banker');
    payout = isWin ? Math.floor(gameState.betAmount * 1.95) : 0;
  } else {
    result = 'tie';
    isWin = (gameState.currentBet === 'tie');
    payout = isWin ? gameState.betAmount * 9 : 0;
  }

  resolveRound(result, isWin, payout, isNatural);
}

function resolveRound(result, isWin, payout, isNatural) {
  // Update stats
  if (isWin) {
    profile.totalWins++;
    profile.todayWins++;
    profile.currentStreak++;
    profile.todayStreak++;

    if (profile.currentStreak > profile.bestStreak) {
      profile.bestStreak = profile.currentStreak;
    }
  } else {
    profile.totalLoss++;
    profile.currentStreak = 0;
    profile.todayStreak = 0;
  }

  // Update stars
  profile.stars += payout;
  if (profile.stars > profile.peakStars) {
    profile.peakStars = profile.stars;
  }

  // Update session stats
  sessionStats.handsPlayed++;
  sessionStats.netProfit += (payout - gameState.betAmount);
  if (payout > sessionStats.biggestWin) {
    sessionStats.biggestWin = payout;
  }

  // Add XP
  var xpReward = isWin ? 50 : 20;
  if (isNatural) xpReward *= 2;
  addXp(xpReward);

  // Add to history
  addToHistory(result, gameState.currentBet, gameState.betAmount,
               gameState.playerCards, gameState.bankerCards,
               cardScore(gameState.playerCards), cardScore(gameState.bankerCards));

  // Update road map
  updateRoadMap(result);

  // Check missions and achievements
  checkDailyMissions('games', 1);
  if (isWin) checkDailyMissions('wins', 1);
  checkDailyMissions('totalBet', gameState.betAmount);
  checkDailyMissions('streak', profile.currentStreak);

  checkAchievements();

  saveProfile();

  // Show result
  showResultOverlay(result, isWin, payout, isNatural);

  gameState.isDealing = false;
}

function animateCardAppear(containerId, card) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var html = renderCardHTML(card, false);
  container.innerHTML += html;
}

function updateScores(pCards, bCards) {
  var pScore = cardScore(pCards);
  var bScore = cardScore(bCards);

  var pEl = document.getElementById('player-score');
  var bEl = document.getElementById('banker-score');

  if (pEl) pEl.textContent = pScore;
  if (bEl) bEl.textContent = bScore;
}

function showResultOverlay(result, isWin, payout, isNatural) {
  var overlay = document.getElementById('result-overlay');
  if (!overlay) return;

  var icon = document.getElementById('result-emoji');
  var title = document.getElementById('result-text');
  var amount = document.getElementById('result-amount');
  var banner = document.getElementById('result-banner');

  if (isWin) {
    if (icon) icon.textContent = '🎉';
    if (title) title.textContent = t('you_win');
    playSound('win');
    showConfetti(40);
    if (isNatural) {
      naturalCelebration();
    }
  } else {
    if (icon) icon.textContent = '😔';
    if (title) title.textContent = t('you_lose');
    playSound('lose');
  }

  if (amount) {
    if (isWin) {
      amount.textContent = '+' + formatNumber(payout) + ' ⭐';
      amount.style.color = '#10b981';
    } else {
      amount.textContent = '-' + formatNumber(gameState.betAmount) + ' ⭐';
      amount.style.color = '#ef4444';
    }
  }

  if (banner) {
    banner.textContent = result.toUpperCase() + (isNatural ? ' NATURAL' : '');
  }

  showOverlay('result-overlay');
}

function naturalCelebration() {
  playSound('natural');
  showGoldParticles(30);
  showConfetti(60);
}

// SECTION 10: UI Rendering (~500 lines)

function renderChips() {
  var tray = document.getElementById('chip-tray');
  if (!tray) return;

  var chipsArray = CHIPS || [50, 100, 250, 500, 1000, 5000, 10000];

  tray.innerHTML = '';
  chipsArray.forEach(function(chip) {
    var div = document.createElement('div');
    div.className = 'chip' + (gameState.selectedChip === chip ? ' selected' : '');
    div.setAttribute('data-chip', chip);
    div.setAttribute('data-action', 'select-chip');
    div.textContent = formatNumber(chip);
    tray.appendChild(div);
  });
}

function renderBetZones() {
  var playerZone = document.querySelector('[data-action="bet-player"]');
  var bankerZone = document.querySelector('[data-action="bet-banker"]');
  var tieZone = document.querySelector('[data-action="bet-tie"]');

  [playerZone, bankerZone, tieZone].forEach(function(zone) {
    if (zone) zone.classList.remove('active');
  });

  if (gameState.currentBet === 'player' && playerZone) {
    playerZone.classList.add('active');
  } else if (gameState.currentBet === 'banker' && bankerZone) {
    bankerZone.classList.add('active');
  } else if (gameState.currentBet === 'tie' && tieZone) {
    tieZone.classList.add('active');
  }
}

function updateStarsDisplay() {
  if (!profile) return;
  // Update all stars displays (data-bind pattern from HTML)
  document.querySelectorAll('[data-bind="stars"], [data-bind="game-stars"], [data-bind="shop-stars"]').forEach(function(el) {
    el.textContent = formatNumber(profile.stars);
  });
  document.querySelectorAll('[data-bind="level"]').forEach(function(el) {
    el.textContent = profile.level;
  });
  document.querySelectorAll('[data-bind="profile-level-badge"]').forEach(function(el) {
    el.textContent = profile.level;
  });
  document.querySelectorAll('[data-bind="profile-current-stars"]').forEach(function(el) {
    el.textContent = formatNumber(profile.stars);
  });
  document.querySelectorAll('[data-bind="profile-peak-stars"]').forEach(function(el) {
    el.textContent = formatNumber(profile.peakStars);
  });
}

function renderGameTable() {
  // Game table already exists in boot HTML template
  // Just clear the card areas for a new round
  var pc = document.getElementById('player-cards');
  var bc = document.getElementById('banker-cards');
  var ps = document.getElementById('player-score');
  var bs = document.getElementById('banker-score');
  if (pc) pc.innerHTML = '';
  if (bc) bc.innerHTML = '';
  if (ps) ps.textContent = '0';
  if (bs) bs.textContent = '0';
  var banner = document.getElementById('result-banner');
  if (banner) banner.innerHTML = '';
}

function renderAIPlayers() {
  var container = document.querySelector('.sc-game');
  if (!container) return;

  var aiArea = container.querySelector('.ai-players');
  if (!aiArea) {
    aiArea = document.createElement('div');
    aiArea.className = 'ai-players';
    container.appendChild(aiArea);
  }

  aiArea.innerHTML = '';
  gameState.aiPlayers.forEach(function(bot) {
    var botDiv = document.createElement('div');
    botDiv.className = 'ai-player';
    botDiv.innerHTML = '<div class="avatar">' + bot.avatar + '</div>' +
                      '<div class="name">' + bot.name + '</div>' +
                      '<div class="bet">' + (bot.bet ? bot.bet.toUpperCase() : '-') + ' ' + formatNumber(bot.betAmount) + '</div>';
    aiArea.appendChild(botDiv);
  });
}

function renderShop(tab) {
  tab = tab || 'avatars';
  var grid = document.getElementById('shop-grid');
  if (!grid) return;

  var items = [];
  if (tab === 'avatars') {
    items = SHOP_ITEMS.avatars || [];
  } else if (tab === 'tables') {
    items = SHOP_ITEMS.tables || [];
  } else if (tab === 'cardbacks') {
    items = SHOP_ITEMS.cardbacks || [];
  }

  grid.innerHTML = '';
  items.forEach(function(item) {
    var card = document.createElement('div');
    card.className = 'shop-item';

    var owned = shopData.owned.indexOf(item.id) >= 0;
    var equipped = shopData.equipped[tab] === item.id;

    var btnText = '';
    var btnClass = 'btn-secondary';
    var btnAction = '';

    if (equipped) {
      btnText = t('equipped');
      btnClass = 'btn-accent';
    } else if (owned) {
      btnText = t('equip');
      btnAction = 'equip-item';
    } else {
      btnText = formatNumber(item.price) + ' ⭐';
      btnAction = 'buy-item';
    }

    card.innerHTML = '<div class="emoji">' + item.emoji + '</div>' +
                    '<div class="name">' + item.name + '</div>' +
                    '<button class="btn ' + btnClass + '" data-action="' + btnAction + '" data-shop-id="' + item.id + '" data-shop-tab="' + tab + '">' + btnText + '</button>';

    grid.appendChild(card);
  });
}

function renderDailyMissions() {
  var container = document.getElementById('daily-missions');
  if (!container) return;

  container.innerHTML = '';

  if (dailyMission && dailyMission.missions) {
    dailyMission.missions.forEach(function(m) {
      var card = document.createElement('div');
      card.className = 'mission-card';

      var progress = Math.min(100, Math.floor((m.current / m.target) * 100));
      var completed = m.current >= m.target;

      card.innerHTML = '<div class="mission-title">' + m.name + '</div>' +
                      '<div class="mission-progress">' +
                      '<div class="progress-bar"><div class="progress-fill" style="width:' + progress + '%"></div></div>' +
                      '<div class="progress-text">' + m.current + '/' + m.target + '</div>' +
                      '</div>' +
                      '<div class="mission-reward">' + formatNumber(m.reward) + ' ⭐</div>' +
                      (completed && !m.claimed ? '<button class="btn btn-primary" data-action="claim-mission" data-mission-id="' + m.id + '">' + t('claim') + '</button>' : '') +
                      (m.claimed ? '<span style="color:#10b981">✓ ' + t('claimed') + '</span>' : '');

      container.appendChild(card);
    });
  }
}

function renderAchievements() {
  var container = document.getElementById('achievement-list');
  if (!container) return;

  container.innerHTML = '';

  ACHIEVEMENTS.forEach(function(ach) {
    var unlocked = profile.unlockedAchievements.indexOf(ach.id) >= 0;

    var card = document.createElement('div');
    card.className = 'achievement-card' + (unlocked ? ' unlocked' : ' locked');

    card.innerHTML = '<div class="achievement-icon">' + (unlocked ? ach.emoji : '🔒') + '</div>' +
                    '<div class="achievement-name">' + ach.name + '</div>' +
                    '<div class="achievement-desc">' + ach.description + '</div>' +
                    (unlocked ? '<div class="achievement-reward">' + formatNumber(ach.reward) + ' ⭐</div>' : '');

    container.appendChild(card);
  });
}

function renderRanking(tab) {
  tab = tab || 'weekly';
  var container = document.getElementById('ranking-list');
  if (!container) return;

  container.innerHTML = '<p>' + t('loading') + '...</p>';

  if (!firebaseOK()) {
    // Fallback to local stats
    container.innerHTML = '<div class="rank-row">' +
      '<div class="rank">1</div>' +
      '<div class="name">' + profile.nickname + '</div>' +
      '<div class="score">' + formatNumber(profile.peakStars) + '</div>' +
      '</div>';
    return;
  }

  Online.getLeaderboard(tab).then(function(players) {
    container.innerHTML = '';

    // Top 3 podium
    var podium = document.createElement('div');
    podium.className = 'podium';

    var positions = [2, 1, 3]; // gold, silver, bronze order
    positions.forEach(function(pos) {
      if (players[pos - 1]) {
        var p = players[pos - 1];
        var medal = ['🥇', '🥈', '🥉'][pos - 1];
        podium.innerHTML += '<div class="podium-spot rank-' + pos + '">' +
          '<div class="medal">' + medal + '</div>' +
          '<div class="name">' + (p.nickname || 'Player') + '</div>' +
          '<div class="score">' + formatNumber(p.score || 0) + '</div>' +
          '</div>';
      }
    });

    container.appendChild(podium);

    // List
    players.forEach(function(p, idx) {
      var row = document.createElement('div');
      row.className = 'rank-row';
      row.innerHTML = '<div class="rank">#' + (idx + 1) + '</div>' +
                     '<div class="name">' + (p.nickname || 'Player') + '</div>' +
                     '<div class="score">' + formatNumber(p.score || 0) + '</div>';
      container.appendChild(row);
    });
  }).catch(function(e) {
    console.warn('Ranking fetch failed:', e);
  });
}

function renderProfile() {
  var statsDiv = document.querySelector('.profile-stats-grid') || document.querySelector('.sc-profile .stats-grid');
  if (!statsDiv) return;

  // Update data-bind elements
  document.querySelectorAll('[data-bind="profile-total-games"]').forEach(function(el) { el.textContent = formatNumber(profile.totalPlayed); });
  document.querySelectorAll('[data-bind="profile-wins"]').forEach(function(el) { el.textContent = formatNumber(profile.totalWins); });
  document.querySelectorAll('[data-bind="profile-win-rate"]').forEach(function(el) { el.textContent = profile.totalPlayed > 0 ? Math.round(profile.totalWins / profile.totalPlayed * 100) + '%' : '0%'; });
  document.querySelectorAll('[data-bind="profile-best-streak"]').forEach(function(el) { el.textContent = formatNumber(profile.bestStreak); });
  document.querySelectorAll('[data-bind="profile-peak-stars"]').forEach(function(el) { el.textContent = formatNumber(profile.peakStars); });
  document.querySelectorAll('[data-bind="profile-current-stars"]').forEach(function(el) { el.textContent = formatNumber(profile.stars); });
  document.querySelectorAll('[data-bind="profile-level-badge"]').forEach(function(el) { el.textContent = profile.level; });
  document.querySelectorAll('[data-bind="nickname"]').forEach(function(el) { el.textContent = profile.nickname || 'Player'; });

  statsDiv.innerHTML = '<div class="stat-box">' +
    '<div class="label">' + t('total_played') + '</div>' +
    '<div class="value">' + formatNumber(profile.totalPlayed) + '</div>' +
    '</div>' +
    '<div class="stat-box">' +
    '<div class="label">' + t('total_wins') + '</div>' +
    '<div class="value">' + formatNumber(profile.totalWins) + '</div>' +
    '</div>' +
    '<div class="stat-box">' +
    '<div class="label">' + t('best_streak') + '</div>' +
    '<div class="value">' + formatNumber(profile.bestStreak) + '</div>' +
    '</div>' +
    '<div class="stat-box">' +
    '<div class="label">' + t('biggest_bet') + '</div>' +
    '<div class="value">' + formatNumber(profile.biggestBet) + '</div>' +
    '</div>';
}

function renderHistory() {
  var container = document.getElementById('history-panel');
  if (!container) return;

  var histContent = container.querySelector('.history-content') || container;
  histContent.innerHTML = '';

  for (var i = gameHistory.length - 1; i >= Math.max(0, gameHistory.length - 20); i--) {
    var h = gameHistory[i];
    var histRow = document.createElement('div');
    histRow.className = 'history-row';
    histRow.innerHTML = '<div class="hand-num">#' + (i + 1) + '</div>' +
      '<div class="result">' + h.result.toUpperCase() + '</div>' +
      '<div class="bet">' + h.bet.toUpperCase() + ' ' + formatNumber(h.amount) + '</div>' +
      '<div class="scores">P:' + h.pScore + ' B:' + h.bScore + '</div>';
    histContent.appendChild(histRow);
  }
}

function renderStatistics() {
  var container = document.getElementById('stats-panel');
  if (!container) return;

  var content = container.querySelector('.stats-content') || container;

  var playerWins = gameHistory.filter(function(h) { return h.result === 'player'; }).length;
  var bankerWins = gameHistory.filter(function(h) { return h.result === 'banker'; }).length;
  var ties = gameHistory.filter(function(h) { return h.result === 'tie'; }).length;
  var totalHands = gameHistory.length || 1;

  var avgBet = gameHistory.length > 0 ?
    Math.floor(gameHistory.reduce(function(a, h) { return a + h.amount; }, 0) / gameHistory.length) : 0;

  content.innerHTML = '<h3>' + t('statistics') + '</h3>' +
    '<div class="stat-chart">' +
    '<div class="chart-bar">' +
    '<label>🎰 ' + t('player') + '</label>' +
    '<div class="bar" style="width:' + (playerWins / totalHands * 100) + '%"></div>' +
    '<span>' + playerWins + ' (' + Math.round(playerWins / totalHands * 100) + '%)</span>' +
    '</div>' +
    '<div class="chart-bar">' +
    '<label>🏦 ' + t('banker') + '</label>' +
    '<div class="bar" style="width:' + (bankerWins / totalHands * 100) + '%"></div>' +
    '<span>' + bankerWins + ' (' + Math.round(bankerWins / totalHands * 100) + '%)</span>' +
    '</div>' +
    '<div class="chart-bar">' +
    '<label>🤝 ' + t('tie') + '</label>' +
    '<div class="bar" style="width:' + (ties / totalHands * 100) + '%"></div>' +
    '<span>' + ties + ' (' + Math.round(ties / totalHands * 100) + '%)</span>' +
    '</div>' +
    '</div>' +
    '<div class="stats-info">' +
    '<p>' + t('avg_bet') + ': ' + formatNumber(avgBet) + ' ⭐</p>' +
    '<p>' + t('biggest_win') + ': ' + formatNumber(sessionStats.biggestWin) + ' ⭐</p>' +
    '</div>';
}

function renderWaitingRoom(players) {
  var container = document.getElementById('room-panel');
  if (!container) return;

  var playersList = container.querySelector('.waiting-players');
  if (playersList) {
    playersList.innerHTML = '';
    players.forEach(function(p) {
      var div = document.createElement('div');
      div.className = 'waiting-player';
      div.innerHTML = '<div class="avatar">' + p.avatar + '</div>' +
                     '<div class="name">' + p.nickname + '</div>';
      playersList.appendChild(div);
    });
  }
}

function renderSessionStats() {
  var container = document.querySelector('.session-summary') || document.querySelector('[data-bind="session-stats"]');
  if (!container) return;

  var timePlayedSecs = Math.floor((Date.now() - sessionStats.startTime) / 1000);
  var timePlayedMins = Math.floor(timePlayedSecs / 60);
  var timeStr = timePlayedMins + 'm ' + (timePlayedSecs % 60) + 's';

  container.innerHTML = '<div class="session-stat">' +
    '<div class="label">' + t('hands_played') + '</div>' +
    '<div class="value">' + sessionStats.handsPlayed + '</div>' +
    '</div>' +
    '<div class="session-stat">' +
    '<div class="label">' + t('net_profit') + '</div>' +
    '<div class="value" style="color:' + (sessionStats.netProfit >= 0 ? '#10b981' : '#ef4444') + '">' +
    (sessionStats.netProfit >= 0 ? '+' : '') + formatNumber(sessionStats.netProfit) + '</div>' +
    '</div>' +
    '<div class="session-stat">' +
    '<div class="label">' + t('biggest_win') + '</div>' +
    '<div class="value">' + formatNumber(sessionStats.biggestWin) + '</div>' +
    '</div>' +
    '<div class="session-stat">' +
    '<div class="label">' + t('time_played') + '</div>' +
    '<div class="value">' + timeStr + '</div>' +
    '</div>';
}

function updateNavHighlight(screen) {
  var navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(function(item) {
    item.classList.remove('active');
    if (item.getAttribute('data-nav') === screen) {
      item.classList.add('active');
    }
  });
}

// SECTION 11: Road Maps (~300 lines)

function updateRoadMap(result) {
  if (!gameState.roadMap) gameState.roadMap = [];

  gameState.roadMap.push(result);

  renderRoadMaps();
}

function renderRoadMaps() {
  renderBigRoad();
  renderBeadPlate();
  renderBigEyeRoad();
}

function renderBigRoad() {
  var container = document.getElementById('big-road');
  if (!container) return;

  container.innerHTML = '';

  var results = gameState.roadMap || [];
  var cols = [];
  var currentCol = [];
  var lastResult = null;

  results.forEach(function(result) {
    if (lastResult !== null && lastResult !== result) {
      cols.push(currentCol);
      currentCol = [];
    }
    currentCol.push(result);
    lastResult = result;
  });

  if (currentCol.length > 0) cols.push(currentCol);

  var maxRows = 6;

  for (var c = 0; c < Math.min(cols.length, 15); c++) {
    for (var r = 0; r < Math.min(cols[c].length, maxRows); r++) {
      var cell = document.createElement('div');
      cell.className = 'road-cell';

      var result = cols[c][r];
      var symbol = result === 'player' ? '🔵' : result === 'banker' ? '🔴' : '🟢';

      cell.textContent = symbol;
      cell.style.gridColumn = c + 1;
      cell.style.gridRow = r + 1;

      container.appendChild(cell);
    }
  }
}

function renderBeadPlate() {
  var container = document.getElementById('bead-grid');
  if (!container) return;

  container.innerHTML = '';

  var results = gameState.roadMap || [];
  var maxBeads = 42; // 6 rows x 7 cols

  for (var i = 0; i < Math.min(results.length, maxBeads); i++) {
    var bead = document.createElement('div');
    bead.className = 'bead';

    var result = results[i];
    if (result === 'player') {
      bead.style.background = '#3498db';
    } else if (result === 'banker') {
      bead.style.background = '#e74c3c';
    } else {
      bead.style.background = '#2ecc71';
    }

    container.appendChild(bead);
  }
}

function renderBigEyeRoad() {
  // Simplified derived road - shows patterns from the main road
  // In full implementation, this would be more complex
  var results = gameState.roadMap || [];
  if (results.length < 2) return;

  // For now, just render as mini version
  var container = document.querySelector('.big-eye-road');
  if (!container) return;

  container.innerHTML = '';

  for (var i = Math.max(0, results.length - 8); i < results.length; i++) {
    var result = results[i];
    var symbol = result === 'player' ? '●' : result === 'banker' ? '●' : '○';
    var div = document.createElement('span');
    div.textContent = symbol;
    div.style.color = result === 'player' ? '#3498db' : result === 'banker' ? '#e74c3c' : '#2ecc71';
    container.appendChild(div);
  }
}

// SECTION 12: Particle System (~100 lines)

function createGoldParticle(x, y) {
  var container = document.getElementById('particle-container');
  if (!container) return;

  var particle = document.createElement('div');
  particle.className = 'gold-particle';
  particle.style.left = x + 'px';
  particle.style.top = y + 'px';
  particle.style.width = '10px';
  particle.style.height = '10px';
  particle.style.background = '#d4af37';
  particle.style.borderRadius = '50%';
  particle.style.boxShadow = '0 0 10px rgba(212,175,55,0.8)';
  particle.style.position = 'fixed';
  particle.style.pointerEvents = 'none';
  particle.style.zIndex = '9999';

  var randomX = (Math.random() - 0.5) * 200;
  var randomY = -Math.random() * 300 - 100;
  var randomDuration = 2000 + Math.random() * 1000;

  particle.style.animation = 'particleFloat ' + (randomDuration / 1000) + 's ease-out forwards';
  particle.style.setProperty('--tx', randomX + 'px');
  particle.style.setProperty('--ty', randomY + 'px');

  container.appendChild(particle);

  setTimeout(function() {
    particle.remove();
  }, randomDuration);
}

function burstParticles(x, y, count) {
  for (var i = 0; i < count; i++) {
    createGoldParticle(x + Math.random() * 40 - 20, y + Math.random() * 40 - 20);
  }
}

// SECTION 13: History & Statistics (~200 lines)

function addToHistory(result, bet, amount, pCards, bCards, pScore, bScore) {
  gameHistory.push({
    result: result,
    bet: bet,
    amount: amount,
    pCards: pCards,
    bCards: bCards,
    pScore: pScore,
    bScore: bScore,
    timestamp: Date.now()
  });

  if (gameHistory.length > 50) {
    gameHistory.shift();
  }

  localStorage.setItem('bac_history_v2', JSON.stringify(gameHistory));
}

function getStatistics() {
  var total = gameHistory.length || 1;
  var playerWins = gameHistory.filter(function(h) { return h.result === 'player'; }).length;
  var bankerWins = gameHistory.filter(function(h) { return h.result === 'banker'; }).length;
  var ties = gameHistory.filter(function(h) { return h.result === 'tie'; }).length;

  var totalBet = gameHistory.reduce(function(sum, h) { return sum + h.amount; }, 0);
  var avgBet = Math.floor(totalBet / total);

  return {
    total: total,
    playerWins: playerWins,
    bankerWins: bankerWins,
    ties: ties,
    playerPercentage: Math.round(playerWins / total * 100),
    bankerPercentage: Math.round(bankerWins / total * 100),
    tiePercentage: Math.round(ties / total * 100),
    totalBet: totalBet,
    avgBet: avgBet
  };
}

// SECTION 14: Shop System (~200 lines)

function buyItem(category, itemId) {
  var item = null;

  if (category === 'avatars') {
    item = (SHOP_ITEMS.avatars || []).find(function(i) { return i.id === itemId; });
  } else if (category === 'tables') {
    item = (SHOP_ITEMS.tables || []).find(function(i) { return i.id === itemId; });
  } else if (category === 'cardbacks') {
    item = (SHOP_ITEMS.cardbacks || []).find(function(i) { return i.id === itemId; });
  }

  if (!item) {
    showToast(t('item_not_found'), 2000);
    return;
  }

  if (profile.stars < item.price) {
    showToast(t('insufficient_stars'), 2000);
    return;
  }

  profile.stars -= item.price;
  shopData.owned.push(itemId);

  saveProfile();
  saveShopData();

  showToast(t('item_purchased'), 2000);
  showConfetti(20);

  renderShop(category);
}

function equipItem(category, itemId) {
  var categoryKey = category || 'avatars';

  if (!isItemOwned(category, itemId)) {
    showToast(t('item_not_owned'), 2000);
    return;
  }

  shopData.equipped[categoryKey] = itemId;

  if (categoryKey === 'avatars') {
    profile.avatar = itemId;
  }

  saveProfile();
  saveShopData();

  showToast(t('item_equipped'), 2000);
  renderShop(categoryKey);
  updateAllUI();
}

function isItemOwned(category, itemId) {
  return shopData.owned.indexOf(itemId) >= 0;
}

function isItemEquipped(category, itemId) {
  return shopData.equipped[category] === itemId;
}

// SECTION 15: Ranking System (~150 lines)

const Online = {
  ready: function() {
    return new Promise(function(resolve) {
      if (!firebaseOK()) {
        resolve(false);
        return;
      }

      try {
        ensureFirebaseInit();
        resolve(true);
      } catch (e) {
        resolve(false);
      }
    });
  },

  goOnline: function() {
    if (!firebaseOK()) return Promise.resolve();

    try {
      var presenceRef = firebase.database().ref('baccaratPresence/' + profile.userId);

      presenceRef.onDisconnect().remove();
      presenceRef.set({
        nickname: profile.nickname,
        avatar: profile.avatar,
        stars: profile.stars,
        level: profile.level,
        timestamp: (firebaseOK() ? firebase.database.ServerValue.TIMESTAMP : Date.now())
      });

      this.submitToLeaderboard({
        userId: profile.userId,
        nickname: profile.nickname,
        avatar: profile.avatar,
        score: profile.peakStars,
        level: profile.level,
        totalWins: profile.totalWins
      });

      return Promise.resolve();
    } catch (e) {
      return Promise.resolve();
    }
  },

  goOffline: function() {
    if (!firebaseOK()) return;

    try {
      firebase.database().ref('baccaratPresence/' + profile.userId).remove();
    } catch (e) {}
  },

  getOnlineCount: function() {
    return new Promise(function(resolve) {
      if (!firebaseOK()) {
        resolve(0);
        return;
      }

      try {
        firebase.database().ref('baccaratPresence').once('value', function(snap) {
          resolve(snap.numChildren());
        });
      } catch (e) {
        resolve(0);
      }
    });
  },

  getLeaderboard: function(tab) {
    return new Promise(function(resolve) {
      if (!firebaseOK()) {
        resolve([{
          nickname: profile.nickname,
          score: profile.peakStars,
          level: profile.level
        }]);
        return;
      }

      try {
        var path = 'leaderboards/baccarat/' + (tab || 'alltime');
        firebase.database().ref(path).orderByChild('score').limitToLast(100).once('value', function(snap) {
          var data = snap.val();
          if (!data) {
            resolve([]);
            return;
          }

          var arr = Object.keys(data).map(function(key) {
            return data[key];
          });

          arr.sort(function(a, b) { return (b.score || 0) - (a.score || 0); });
          resolve(arr);
        });
      } catch (e) {
        resolve([]);
      }
    });
  },

  submitToLeaderboard: function(data) {
    if (!firebaseOK()) return Promise.resolve();

    try {
      var week = Math.floor(getWeekStart() / 1000);
      var path = 'leaderboards/baccarat/alltime/' + profile.userId;

      firebase.database().ref(path).set({
        userId: profile.userId,
        nickname: profile.nickname,
        avatar: profile.avatar,
        score: data.score || profile.peakStars,
        level: profile.level,
        totalWins: profile.totalWins,
        timestamp: (firebaseOK() ? firebase.database.ServerValue.TIMESTAMP : Date.now())
      });

      return Promise.resolve();
    } catch (e) {
      return Promise.resolve();
    }
  },

  createRoom: function(wager) {
    return new Promise(function(resolve) {
      if (!firebaseOK()) {
        resolve(null);
        return;
      }

      try {
        var code = Math.random().toString(36).substr(2, 4).toUpperCase();
        var roomRef = firebase.database().ref('baccaratRooms/' + code);

        roomRef.set({
          code: code,
          host: profile.userId,
          wager: wager,
          players: {},
          status: 'waiting',
          createdAt: (firebaseOK() ? firebase.database.ServerValue.TIMESTAMP : Date.now())
        });

        onlineState.inRoom = true;
        onlineState.roomCode = code;
        onlineState.isHost = true;
        onlineState.players = {};

        resolve(code);
      } catch (e) {
        resolve(null);
      }
    });
  },

  joinRoom: function(code) {
    return new Promise(function(resolve) {
      if (!firebaseOK()) {
        resolve(false);
        return;
      }

      try {
        var roomRef = firebase.database().ref('baccaratRooms/' + code);

        roomRef.once('value', function(snap) {
          if (!snap.exists()) {
            resolve(false);
            return;
          }

          var room = snap.val();
          var playerKey = 'player_' + profile.userId;

          room.players = room.players || {};
          room.players[playerKey] = {
            userId: profile.userId,
            nickname: profile.nickname,
            avatar: profile.avatar,
            joinedAt: (firebaseOK() ? firebase.database.ServerValue.TIMESTAMP : Date.now())
          };

          roomRef.set(room);

          onlineState.inRoom = true;
          onlineState.roomCode = code;
          onlineState.isHost = false;
          onlineState.players = room.players || {};

          resolve(true);
        });
      } catch (e) {
        resolve(false);
      }
    });
  },

  leaveRoom: function() {
    if (!firebaseOK() || !onlineState.roomCode) return;

    try {
      var roomRef = firebase.database().ref('baccaratRooms/' + onlineState.roomCode);

      if (onlineState.isHost) {
        roomRef.remove();
      } else {
        roomRef.once('value', function(snap) {
          var room = snap.val();
          if (room && room.players) {
            delete room.players['player_' + profile.userId];
            roomRef.set(room);
          }
        });
      }

      onlineState.inRoom = false;
      onlineState.roomCode = null;
    } catch (e) {}
  },

  placeBetOnline: function(bet, amount) {
    if (!firebaseOK() || !onlineState.roomCode) return;

    try {
      var roomRef = firebase.database().ref('baccaratRooms/' + onlineState.roomCode + '/bets/' + profile.userId);

      roomRef.set({
        userId: profile.userId,
        bet: bet,
        amount: amount,
        timestamp: (firebaseOK() ? firebase.database.ServerValue.TIMESTAMP : Date.now())
      });
    } catch (e) {}
  },

  startOnlineGame: function() {
    if (!firebaseOK() || !onlineState.isHost || !onlineState.roomCode) return;

    try {
      firebase.database().ref('baccaratRooms/' + onlineState.roomCode + '/status').set('playing');
    } catch (e) {}
  },

  getOpenRooms: function() {
    return new Promise(function(resolve) {
      if (!firebaseOK()) {
        resolve([]);
        return;
      }

      try {
        firebase.database().ref('baccaratRooms').orderByChild('status').equalTo('waiting').limitToLast(10).once('value', function(snap) {
          var data = snap.val();
          if (!data) {
            resolve([]);
            return;
          }

          var arr = Object.keys(data).map(function(key) {
            return data[key];
          });

          resolve(arr);
        });
      } catch (e) {
        resolve([]);
      }
    });
  },

  onRoomUpdate: function(callback) {
    if (!firebaseOK() || !onlineState.roomCode) return;

    try {
      firebase.database().ref('baccaratRooms/' + onlineState.roomCode).on('value', function(snap) {
        if (snap.exists()) {
          callback(snap.val());
        }
      });
    } catch (e) {}
  },

  onPresenceChange: function(callback) {
    if (!firebaseOK()) return;

    try {
      firebase.database().ref('baccaratPresence').on('value', function(snap) {
        if (snap.exists()) {
          callback(snap.numChildren());
        }
      });
    } catch (e) {}
  }
};

// SECTION 16: Mission & Achievement System (~250 lines)

function checkDailyMissions(type, value) {
  if (!dailyMission || !dailyMission.missions) return;

  dailyMission.missions.forEach(function(m) {
    if (m.claimed) return;

    if (m.type === 'games' && type === 'games') {
      m.current += value;
    } else if (m.type === 'wins' && type === 'wins') {
      m.current += value;
    } else if (m.type === 'totalBet' && type === 'totalBet') {
      m.current += value;
    } else if (m.type === 'streak' && type === 'streak') {
      m.current = Math.max(m.current, value);
    }
  });

  saveDailyMission();
}

function claimMissionReward(missionId) {
  if (!dailyMission || !dailyMission.missions) return;

  var mission = dailyMission.missions.find(function(m) { return m.id === missionId; });

  if (!mission || mission.claimed || mission.current < mission.target) {
    showToast(t('mission_not_ready'), 2000);
    return;
  }

  profile.stars += mission.reward;
  mission.claimed = true;

  addXp(mission.reward / 10);
  saveProfile();
  saveDailyMission();

  showToast(t('mission_claimed') + ' +' + formatNumber(mission.reward) + ' ⭐', 3000);
  showConfetti(30);

  renderDailyMissions();
  updateStarsDisplay();
}

function getMissionProgress(mission) {
  return {
    current: mission.current,
    target: mission.target,
    percentage: Math.floor((mission.current / mission.target) * 100)
  };
}

function checkAchievements() {
  ACHIEVEMENTS.forEach(function(ach) {
    if (profile.unlockedAchievements.indexOf(ach.id) >= 0) return;

    var shouldUnlock = false;

    if (ach.id === 'first_win' && profile.totalWins >= 1) {
      shouldUnlock = true;
    } else if (ach.id === 'win_streak_5' && profile.bestStreak >= 5) {
      shouldUnlock = true;
    } else if (ach.id === 'big_bet' && profile.biggestBet >= 5000) {
      shouldUnlock = true;
    } else if (ach.id === 'played_100' && profile.totalPlayed >= 100) {
      shouldUnlock = true;
    } else if (ach.id === 'natural' && profile.totalWins >= 1) {
      shouldUnlock = true;
    } else if (ach.id === 'level_10' && profile.level >= 10) {
      shouldUnlock = true;
    } else if (ach.id === 'rich' && profile.peakStars >= 50000) {
      shouldUnlock = true;
    } else if (ach.id === 'banker_master' && profile.bankerBets >= 100) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      unlockAchievement(ach.id);
    }
  });
}

function unlockAchievement(id) {
  if (profile.unlockedAchievements.indexOf(id) >= 0) return;

  var ach = ACHIEVEMENTS.find(function(a) { return a.id === id; });
  if (!ach) return;

  profile.unlockedAchievements.push(id);
  profile.stars += (ach.reward || 100);

  saveProfile();

  showToast('🏆 ' + ach.name + ' +' + (ach.reward || 100) + ' ⭐', 4000);
  showConfetti(50);

  renderAchievements();
  updateStarsDisplay();
}

// SECTION 17: Profile System (~100 lines)

function renderProfileScreen() {
  var avatar = document.getElementById('profile-avatar');
  if (avatar && profile.avatar) {
    var avatarItem = (SHOP_ITEMS.avatars || []).find(function(a) { return a.id === profile.avatar; });
    if (avatarItem) {
      avatar.textContent = avatarItem.emoji;
    }
  }

  document.querySelectorAll('[data-bind="nickname"]').forEach(function(el) {
    el.textContent = profile.nickname || 'Player';
  });

  renderProfile();
}

function saveNickname() {
  var input = document.getElementById('nickname-input');
  if (!input) return;

  var nickname = input.value.trim();

  if (nickname.length < 1 || nickname.length > 20) {
    showToast(t('invalid_nickname'), 2000);
    return;
  }

  profile.nickname = nickname;
  saveProfile();

  showToast(t('nickname_saved'), 2000);
  renderProfileScreen();
}

function resetAllStats() {
  if (!confirm('Are you sure? This cannot be undone!')) {
    return;
  }

  profile = createDefaultProfile();
  gameHistory = [];
  sessionStats = { handsPlayed: 0, netProfit: 0, biggestWin: 0, startTime: Date.now() };

  saveProfile();
  localStorage.setItem('bac_history_v2', JSON.stringify(gameHistory));

  showToast(t('stats_reset'), 3000);
  updateAllUI();
  renderProfile();
}

// SECTION 18: Settings System (~150 lines)

function toggleSetting(key) {
  if (typeof settings[key] === 'boolean') {
    settings[key] = !settings[key];
    saveSettings();
    renderSettingsState();
  }
}

function changeLang(newLang) {
  lang = newLang;
  settings.language = newLang;
  saveSettings();
  applyI18n();
}

function changeTheme(theme) {
  settings.theme = theme;
  saveSettings();
  applyTheme();
}

function changeSpeed(speed) {
  settings.animationSpeed = speed;
  saveSettings();
}

function toggleAutoDeal() {
  settings.autoDeal = !settings.autoDeal;
  saveSettings();
  renderSettingsState();
}

function renderSettingsState() {
  var soundToggle = document.querySelector('[data-action="toggle-sound"]');
  var vibrateToggle = document.querySelector('[data-action="toggle-vibrate"]');
  var notifToggle = document.querySelector('[data-action="toggle-notif"]');
  var langSelect = document.getElementById('lang-select');
  var speedSelect = document.getElementById('speed-select');

  if (soundToggle) {
    soundToggle.classList.toggle('on', settings.sound);
  }

  if (vibrateToggle) {
    vibrateToggle.classList.toggle('on', settings.vibrate);
  }

  if (notifToggle) {
    notifToggle.classList.toggle('on', settings.notificationEnabled);
  }

  if (langSelect) {
    langSelect.value = settings.language;
  }

  if (speedSelect) {
    speedSelect.value = settings.animationSpeed;
  }
}

// SECTION 19: Tutorial System (~100 lines)

function showTutorialStep(step) {
  var steps = document.querySelectorAll('[data-tutorial-step]');
  steps.forEach(function(s) {
    s.style.display = 'none';
  });

  var currentStep = document.querySelector('[data-tutorial-step="' + step + '"]');
  if (currentStep) {
    currentStep.style.display = 'block';
  }

  tutorialStep = step;
}

function nextTutStep() {
  if (tutorialStep < 7) {
    showTutorialStep(tutorialStep + 1);
  }
}

function prevTutStep() {
  if (tutorialStep > 0) {
    showTutorialStep(tutorialStep - 1);
  }
}

function finishTutorial() {
  showScreen('home');
  tutorialStep = 0;
}

// SECTION 20: Daily Check-in (~100 lines)

function checkDailyBonus() {
  var today = getDayKey();

  if (profile.lastCheckinDate !== today) {
    var checkinCard = document.querySelector('.daily-checkin-card');
    if (checkinCard) {
      checkinCard.style.display = 'block';
    }
  }
}

function claimDailyBonus() {
  var today = getDayKey();

  if (profile.lastCheckinDate === today) {
    showToast(t('already_claimed'), 2000);
    return;
  }

  var bonusAmount = DAILY_BONUS || 100;
  profile.stars += bonusAmount;
  profile.lastCheckinDate = today;

  saveProfile();

  showToast(t('daily_bonus_claimed') + ' +' + formatNumber(bonusAmount) + ' ⭐', 3000);
  showConfetti(30);
  showGoldParticles(20);

  updateStarsDisplay();

  var checkinCard = document.querySelector('.daily-checkin-card');
  if (checkinCard) {
    checkinCard.style.display = 'none';
  }
}

// SECTION 21: Bankrupt Recovery (~80 lines)

function checkBankrupt() {
  var minBet = 50;

  if (profile.stars < minBet) {
    showOverlay('bankrupt-overlay');
  }
}

function recoverStars() {
  var now = Date.now();
  var recoveryTimeout = 3600000; // 1 hour

  if (profile.lastRecoveryTime && (now - profile.lastRecoveryTime) < recoveryTimeout) {
    showToast(t('recovery_cooldown'), 2000);
    return;
  }

  var recoveryAmount = 1000;
  profile.stars += recoveryAmount;
  profile.lastRecoveryTime = now;
  profile.recoveryCount++;

  saveProfile();

  showToast(t('recovered') + ' +' + formatNumber(recoveryAmount) + ' ⭐', 3000);
  showConfetti(40);

  hideOverlay('bankrupt-overlay');
  updateStarsDisplay();
}

// SECTION 23: Event Listeners (~400 lines)

function setupListeners() {
  var root = document.getElementById('kk-root');
  if (!root) return;

  root.addEventListener('click', function(e) {
    var actionTarget = e.target.closest('[data-action]');
    var navTarget = e.target.closest('[data-nav]');
    var backTarget = e.target.closest('[data-back]');
    var chipTarget = e.target.closest('[data-chip]');
    var shopTarget = e.target.closest('[data-shop-tab]');
    var rankTarget = e.target.closest('[data-rank-tab]');

    if (actionTarget) {
      var action = actionTarget.getAttribute('data-action');

      if (action === 'play-ai') {
        startAIGame();
      } else if (action === 'play-online') {
        showOverlay('room-panel');
      } else if (action === 'deal') {
        dealRound();
      } else if (action === 'bet-player') {
        placeBet('player');
      } else if (action === 'bet-banker') {
        placeBet('banker');
      } else if (action === 'bet-tie') {
        placeBet('tie');
      } else if (action === 'select-chip') {
        var chipVal = parseInt(actionTarget.getAttribute('data-chip'));
        selectChip(chipVal);
      } else if (action === 'toggle-sound') {
        toggleSetting('sound');
        playSound('click');
      } else if (action === 'toggle-vibrate') {
        toggleSetting('vibrate');
        vibrate(100);
      } else if (action === 'toggle-notif') {
        toggleSetting('notificationEnabled');
      } else if (action === 'create-room') {
        var wagerEl = document.getElementById('wager-input');
        var wager = wagerEl ? parseInt(wagerEl.value) : 100;
        Online.createRoom(wager).then(function(code) {
          if (code) {
            showToast('Room created: ' + code, 3000);
          }
        });
      } else if (action === 'join-room') {
        var codeEl = document.getElementById('room-code-input');
        var code = codeEl ? codeEl.value.toUpperCase() : '';
        if (code) {
          Online.joinRoom(code).then(function(ok) {
            if (ok) {
              showToast('Joined room', 3000);
            } else {
              showToast('Room not found', 2000);
            }
          });
        }
      } else if (action === 'cancel-room') {
        Online.leaveRoom();
        hideOverlay('room-panel');
      } else if (action === 'start-game') {
        Online.startOnlineGame();
      } else if (action === 'close-result') {
        hideOverlay('result-overlay');
        gameState.playerCards = [];
        gameState.bankerCards = [];

        var playerCardsEl = document.getElementById('player-cards');
        var bankerCardsEl = document.getElementById('banker-cards');
        if (playerCardsEl) playerCardsEl.innerHTML = '';
        if (bankerCardsEl) bankerCardsEl.innerHTML = '';

        if (settings.autoDeal) {
          setTimeout(dealRound, 500);
        }
      } else if (action === 'claim-daily') {
        claimDailyBonus();
      } else if (action === 'claim-mission') {
        var missionId = actionTarget.getAttribute('data-mission-id');
        claimMissionReward(missionId);
      } else if (action === 'buy-item') {
        var shopId = actionTarget.getAttribute('data-shop-id');
        var shopTab = actionTarget.getAttribute('data-shop-tab');
        buyItem(shopTab, shopId);
      } else if (action === 'equip-item') {
        var shopId = actionTarget.getAttribute('data-shop-id');
        var shopTab = actionTarget.getAttribute('data-shop-tab');
        equipItem(shopTab, shopId);
      } else if (action === 'open-settings') {
        showScreen('settings');
      } else if (action === 'open-tutorial') {
        showScreen('tutorial');
        showTutorialStep(0);
      } else if (action === 'open-history') {
        showOverlay('history-panel');
        renderHistory();
      } else if (action === 'open-stats') {
        showOverlay('stats-panel');
        renderStatistics();
      } else if (action === 'close-overlay') {
        var overlayId = actionTarget.getAttribute('data-overlay-id') || actionTarget.getAttribute('data-overlay');
        if (overlayId) {
          hideOverlay(overlayId);
        } else {
          // Close nearest parent overlay
          var parentOverlay = actionTarget.closest('.overlay');
          if (parentOverlay) parentOverlay.classList.remove('active');
        }
      } else if (action === 'new-shoe') {
        createShoe();
        showToast(t('new_shoe'), 2000);
      } else if (action === 'save-nickname') {
        saveNickname();
      } else if (action === 'reset-stats') {
        resetAllStats();
      } else if (action === 'bankrupt-recover') {
        recoverStars();
      } else if (action === 'prev-tut') {
        prevTutStep();
      } else if (action === 'next-tut') {
        nextTutStep();
      } else if (action === 'finish-tut') {
        finishTutorial();
      } else if (action === 'send-chat') {
        var chatInput = document.querySelector('[data-chat-input]');
        if (chatInput && chatInput.value) {
          showToast('Message sent: ' + chatInput.value, 2000);
          chatInput.value = '';
        }
      }
    }

    // Handle chip selection (chips may not have data-action, just data-chip)
    if (chipTarget && !actionTarget) {
      var chipVal = parseInt(chipTarget.getAttribute('data-chip'));
      if (!isNaN(chipVal)) selectChip(chipVal);
    }

    if (navTarget) {
      var screen = navTarget.getAttribute('data-nav');
      showScreen(screen);
      // Render content for the screen
      if (screen === 'ranking') renderRanking('weekly');
      if (screen === 'shop') renderShop('avatars');
      if (screen === 'mission') { renderDailyMissions(); renderAchievements(); }
      if (screen === 'profile') renderProfileScreen();
    }

    if (backTarget) {
      var backToScreen = backTarget.getAttribute('data-back');
      if (backToScreen === 'game' || backToScreen === 'settings' || backToScreen === 'tutorial') {
        showScreen('home');
      } else {
        showScreen(backToScreen || 'home');
      }
    }

    // Handle shop tab clicks
    if (shopTarget) {
      var shopTab = shopTarget.getAttribute('data-shop-tab');
      if (shopTab) renderShop(shopTab);
      // Highlight active tab
      document.querySelectorAll('[data-shop-tab]').forEach(function(t) { t.classList.remove('active'); });
      shopTarget.classList.add('active');
    }

    // Handle rank tab clicks
    if (rankTarget) {
      var rankTab = rankTarget.getAttribute('data-rank-tab');
      if (rankTab) renderRanking(rankTab);
      document.querySelectorAll('[data-rank-tab]').forEach(function(t) { t.classList.remove('active'); });
      rankTarget.classList.add('active');
    }
  });

  root.addEventListener('change', function(e) {
    if (e.target.id === 'lang-select') {
      var newLang = e.target.value;
      changeLang(newLang);
    } else if (e.target.id === 'speed-select') {
      var newSpeed = e.target.value;
      changeSpeed(newSpeed);
    } else if (e.target.getAttribute('data-shop-tab')) {
      var tab = e.target.getAttribute('data-shop-tab');
      renderShop(tab);
    } else if (e.target.getAttribute('data-rank-tab')) {
      var tab = e.target.getAttribute('data-rank-tab');
      renderRanking(tab);
    }
  });
}

// SECTION 24: Init & Startup (~80 lines)

function init() {
  try {
    boot();
    loadProfile();
    loadSettings();
    loadShopData();
    loadDailyMission();

    // Load game history
    var histStored = localStorage.getItem('bac_history_v2');
    if (histStored) {
      try {
        gameHistory = JSON.parse(histStored);
      } catch (e) {
        gameHistory = [];
      }
    }

    lang = settings.language || 'en';
    applyTheme();

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
      aiPlayers: [],
      history: []
    };

    onlineState = {
      inRoom: false,
      roomCode: null,
      isHost: false,
      players: {}
    };

    sessionStats = {
      handsPlayed: 0,
      netProfit: 0,
      biggestWin: 0,
      startTime: Date.now()
    };

    createShoe();
    setupListeners();
    applyI18n();
    updateAllUI();
    checkDailyBonus();
    checkWeeklyReset();
    resetDailyMissions();
    checkBankrupt();

    showScreen('home');

    // Init Firebase (non-blocking)
    try {
      ensureFirebaseInit();
      Online.ready().then(function(ok) {
        if (ok) {
          Online.goOnline();
          Online.getOnlineCount().then(function(count) {
            var onlineEl = document.querySelector('[data-bind="online-count"]');
            if (onlineEl) {
              onlineEl.textContent = count + ' ' + t('online');
            }
          });
        }
      }).catch(function(e) {
        console.warn('Online init:', e);
      });
    } catch (e) {
      console.warn('Firebase not available');
    }
  } catch (e) {
    console.error('Init error:', e);
  }
}

function checkWeeklyReset() {
  if (isNewWeek(profile.lastWeeklyReset)) {
    profile.todayGames = 0;
    profile.todayWins = 0;
    profile.todayTotalBet = 0;
    profile.todayStreak = 0;
    profile.todayBankerBets = 0;
    profile.todayTieBets = 0;
    profile.lastWeeklyReset = getWeekStart();
    saveProfile();
  }
}

function safeStart() {
  try {
    init();
  } catch (e) {
    document.body.style.cssText = 'margin:0;padding:20px;background:#111;color:#ff4444;font-family:monospace';
    document.body.innerHTML = '<h2 style="color:#d4af37">FA Baccarat Error</h2><pre style="white-space:pre-wrap;color:#ff6b6b;margin-top:12px">' + String(e.message || e) + '\n' + String(e.stack || '') + '</pre>';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeStart);
} else {
  safeStart();
}

})();
