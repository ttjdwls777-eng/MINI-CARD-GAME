(function(){'use strict';

/* ============================================================================
   FIREBASE CONFIGURATION & HELPERS
   ============================================================================ */

var FIREBASE_CONFIG = {
  apiKey: "AIzaSyBDJxn10EyQtGhJDemFA7pF-5QA-GGLW7Y",
  authDomain: "xgp-minigame.firebaseapp.com",
  databaseURL: "https://xgp-minigame-default-rtdb.firebaseio.com",
  projectId: "xgp-minigame",
  storageBucket: "xgp-minigame.appspot.com",
  messagingSenderId: "712312742763",
  appId: "1:712312742763:web:eef8675828aefe8c71222e"
};

function firebaseOK(){
  return typeof firebase!=='undefined'&&firebase.database;
}

function ensureFirebaseInit(){
  try{
    if(typeof firebase!=='undefined'&&firebase.apps&&firebase.apps.length===0){
      firebase.initializeApp(FIREBASE_CONFIG);
    }
  }catch(e){}
}

/* ============================================================================
   CONSTANTS
   ============================================================================ */

const STARTING_STARS = 10000;
const DAILY_BONUS = 100;
const MAX_BET = 50000;
const CHIPS = [100, 500, 1000, 10000];

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const CARD_VALUES = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 0, 'J': 0, 'Q': 0, 'K': 0
};

const PAYOUTS = {
  player: 2,
  banker: 1.95,
  tie: 9,
  ppair: 12,
  bpair: 12
};

const BOT_NAMES = ['Alex', 'Maya', 'Jordan', 'Casey', 'Sam', 'Riley', 'Taylor', 'Morgan'];
const BOT_AVATARS = ['🎩', '👑', '🕴️', '💼', '🤵', '🎭', '🎪', '🎨'];

const SHOP_ITEMS = {
  avatars: [
    {id:'default',emoji:'😺',price:0,name:'Kitty'},
    {id:'bunny',emoji:'🐰',price:3000,name:'Bunny'},
    {id:'bear',emoji:'🐻',price:5000,name:'Bear'},
    {id:'panda',emoji:'🐼',price:8000,name:'Panda'},
    {id:'fox',emoji:'🦊',price:10000,name:'Fox'},
    {id:'unicorn',emoji:'🦄',price:15000,name:'Unicorn'},
    {id:'dragon',emoji:'🐉',price:20000,name:'Dragon'},
    {id:'crown',emoji:'👑',price:30000,name:'Royal'},
    {id:'diamond',emoji:'💎',price:40000,name:'Diamond'},
    {id:'vip',emoji:'🌟',price:50000,name:'VIP Star'}
  ],
  tables: [
    {id:'classic',emoji:'🟢',price:0,name:'Classic Green'},
    {id:'royal',emoji:'🔵',price:10000,name:'Royal Blue'},
    {id:'ruby',emoji:'🔴',price:15000,name:'Ruby Red'},
    {id:'gold',emoji:'🟡',price:25000,name:'Gold'},
    {id:'diamond',emoji:'💜',price:40000,name:'Diamond Purple'},
    {id:'vip_black',emoji:'⬛',price:60000,name:'VIP Black'}
  ],
  cardbacks: [
    {id:'red',emoji:'🔴',price:0,name:'Classic Red'},
    {id:'blue',emoji:'🔷',price:5000,name:'Ocean Blue'},
    {id:'gold',emoji:'✨',price:15000,name:'Gold'},
    {id:'purple',emoji:'💜',price:20000,name:'Royal Purple'},
    {id:'dragon',emoji:'🐲',price:30000,name:'Dragon'},
    {id:'diamond',emoji:'💎',price:50000,name:'Diamond Elite'}
  ],
  effects: [
    {id:'none',emoji:'❌',price:0,name:'None'},
    {id:'sparkle',emoji:'✨',price:10000,name:'Sparkle'},
    {id:'fire_trail',emoji:'🔥',price:20000,name:'Fire Trail'},
    {id:'gold_rain',emoji:'🌟',price:35000,name:'Gold Rain'}
  ]
};

const ACHIEVEMENTS = [
  {id:'first_win',emoji:'🎯',name:'First Win',desc:'Win your first hand'},
  {id:'hot_streak',emoji:'🔥',name:'Hot Streak',desc:'Win 5 hands in a row'},
  {id:'tie_master',emoji:'🤝',name:'Tie Master',desc:'Win 10 tie bets'},
  {id:'pair_party',emoji:'👯',name:'Pair Party',desc:'Win 5 pair bets'},
  {id:'high_roller',emoji:'💰',name:'High Roller',desc:'Place bet of 10000+'},
  {id:'big_win',emoji:'🏆',name:'Big Win',desc:'Win 50000+ in one hand'},
  {id:'collector',emoji:'🎨',name:'Collector',desc:'Collect 10 items'},
  {id:'rich',emoji:'💎',name:'Rich',desc:'Reach 1000000 stars'},
  {id:'dedicated',emoji:'⏰',name:'Dedicated',desc:'Play 100 hands'},
  {id:'balanced',emoji:'⚖️',name:'Balanced',desc:'30% win rate'},
  {id:'early_bird',emoji:'🌅',name:'Early Bird',desc:'Claim daily bonus 7 days'},
  {id:'legendary',emoji:'👑',name:'Legendary',desc:'Unlock all items'}
];

const MISSIONS = [
  {id:'daily_play',type:'daily',target:5,desc:'Play 5 hands',reward:500},
  {id:'daily_win',type:'daily',target:3,desc:'Win 3 hands',reward:1000},
  {id:'daily_tie',type:'daily',target:1,desc:'Win 1 tie bet',reward:800},
  {id:'weekly_streak',type:'weekly',target:10,desc:'10-hand win streak',reward:5000},
  {id:'weekly_banker',type:'weekly',target:20,desc:'Win 20 banker bets',reward:3000},
  {id:'weekly_gold',type:'weekly',target:50000,desc:'Win 50000 stars',reward:10000}
];

/* ============================================================================
   INTERNATIONALIZATION (i18n) - 7 LANGUAGES
   ============================================================================ */

const I18N = {
  en: {
    app_title: 'FA Baccarat',
    home: 'Home',
    ranking: 'Ranking',
    shop: 'Shop',
    mission: 'Mission',
    profile: 'Profile',
    play_vs_dealer: 'Play vs Dealer',
    online_table: 'Online Table',
    settings: 'Settings',
    back: 'Back',
    next: 'Next',
    prev: 'Prev',
    finish: 'Finish',
    claim: 'Claim',
    deal: 'DEAL',
    cancel_bet: 'Cancel',
    rebet: 'Re-bet',
    double_bet: 'x2',
    max_bet: 'Max',
    player: 'PLAYER',
    banker: 'BANKER',
    tie: 'TIE',
    ppair: 'P.PAIR',
    p_pair: 'Player Pair',
    bpair: 'B.PAIR',
    b_pair: 'Banker Pair',
    dealer: 'Dealer',
    dealer_deals: 'Dealer Deals...',
    round: 'Round',
    shoe_info: 'cards left',
    cards_left: 'Cards Left',
    natural_8: 'Natural 8',
    natural_9: 'Natural 9',
    win: 'WIN',
    lose: 'LOSE',
    tie_result: 'TIE',
    session_summary: 'Session Summary',
    hands_played: 'Hands Played',
    net_profit: 'Net Profit',
    history: 'History',
    statistics: 'Statistics',
    tutorial: 'Tutorial',
    road_map: 'Road Map',
    big_road: 'Big Road',
    bead_plate: 'Bead Plate',
    daily_check_in: 'Daily Check-in',
    check_in_tomorrow: 'Check in tomorrow',
    total_wins: 'Total Wins',
    total_games: 'Total Games',
    win_rate: 'Win Rate',
    best_streak: 'Best Streak',
    peak_stars: 'Peak Stars',
    current_stars: 'Current Stars',
    level: 'Level',
    nickname: 'Nickname',
    edit_profile: 'Edit Profile',
    save: 'Save',
    reset_stats: 'Reset Stats',
    sound: 'Sound',
    vibration: 'Vibration',
    notifications: 'Notifications',
    auto_deal: 'Auto Deal',
    language: 'Language',
    speed: 'Game Speed',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    classic: 'Classic',
    modern: 'Modern',
    avatars: 'Avatars',
    tables: 'Tables',
    cardbacks: 'Card Backs',
    effects: 'Effects',
    shop_desc_avatars: 'Customize your avatar',
    shop_desc_tables: 'Choose table design',
    shop_desc_cardbacks: 'Card back designs',
    shop_desc_effects: 'Betting effects',
    owned: 'Owned',
    equipped: 'EQUIPPED',
    lock: 'Locked',
    buy: 'Buy',
    equip: 'Equip',
    room_title: 'Room Title',
    enter_room_title: 'Enter room title',
    room_list: 'Available Rooms',
    no_rooms_available: 'No rooms available',
    tap_to_join: 'Tap to join',
    players_in_room: 'players',
    wager_amount: 'Wager',
    create_room: 'Create Room',
    join_room: 'Join',
    online_count: 'Online',
    tut_step1: 'Welcome to Baccarat',
    tut_step1_desc: 'The goal is to bet on Player, Banker, or Tie. Cards closer to 9 wins!',
    tut_step2: 'Card Values',
    tut_step2_desc: 'Ace=1, 2-9=face value, 10/J/Q/K=0. Only last digit counts.',
    tut_step3: 'How to Bet',
    tut_step3_desc: 'Select a chip value, tap a betting zone, then deal to play.',
    tut_step4: 'Game Rules',
    tut_step4_desc: 'Each gets 2 cards. Total closest to 9 wins. Ties pay 8:1.',
    tut_step5: 'Winning Tips',
    tut_step5_desc: 'Banker has slight advantage. Watch the shoe for patterns.',
    tut_step6: 'Pair Bets',
    tut_step6_desc: 'Bet on Player or Banker getting a pair. Pays 11:1.',
    tut_step7: 'Road Patterns',
    tut_step7_desc: 'Track results with Big Road and Bead Plate patterns.',
    tut_step8: 'Pro Tips',
    tut_step8_desc: 'Manage bankroll. Never chase losses. Enjoy the game!'
  },

  ko: {
    app_title: 'FA 바카라',
    home: '홈',
    ranking: '랭킹',
    shop: '상점',
    mission: '미션',
    profile: '프로필',
    play_vs_dealer: '딜러와 플레이',
    online_table: '온라인 테이블',
    settings: '설정',
    back: '뒤로',
    next: '다음',
    prev: '이전',
    finish: '완료',
    claim: '받기',
    deal: '딜',
    cancel_bet: '취소',
    rebet: '재베팅',
    double_bet: 'x2',
    max_bet: '최대',
    player: '플레이어',
    banker: '뱅커',
    tie: '타이',
    ppair: 'P.쌍',
    p_pair: '플레이어 쌍',
    bpair: 'B.쌍',
    b_pair: '뱅커 쌍',
    dealer: '딜러',
    dealer_deals: '딜러 카드 배분 중...',
    round: '라운드',
    shoe_info: '남은 카드',
    cards_left: '남은 카드',
    natural_8: '네추럴 8',
    natural_9: '네추럴 9',
    win: '승리',
    lose: '패배',
    tie_result: '동점',
    session_summary: '세션 요약',
    hands_played: '플레이한 핸드',
    net_profit: '수익',
    history: '기록',
    statistics: '통계',
    tutorial: '튜토리얼',
    road_map: '로드맵',
    big_road: '빅로드',
    bead_plate: '비드플레이트',
    daily_check_in: '일일 체크인',
    check_in_tomorrow: '내일 체크인',
    total_wins: '총 승리',
    total_games: '총 게임',
    win_rate: '승률',
    best_streak: '최고 연승',
    peak_stars: '최고 별',
    current_stars: '현재 별',
    level: '레벨',
    nickname: '닉네임',
    edit_profile: '프로필 수정',
    save: '저장',
    reset_stats: '통계 초기화',
    sound: '사운드',
    vibration: '진동',
    notifications: '알림',
    auto_deal: '자동 딜',
    language: '언어',
    speed: '게임 속도',
    theme: '테마',
    light: '라이트',
    dark: '다크',
    classic: '클래식',
    modern: '모던',
    avatars: '아바타',
    tables: '테이블',
    cardbacks: '카드 뒷면',
    effects: '이펙트',
    shop_desc_avatars: '아바타 커스터마이징',
    shop_desc_tables: '테이블 디자인 선택',
    shop_desc_cardbacks: '카드 뒷면 디자인',
    shop_desc_effects: '베팅 이펙트',
    owned: '소유',
    equipped: '장착',
    lock: '잠금',
    buy: '구매',
    equip: '장착',
    room_title: '룸 이름',
    enter_room_title: '룸 이름 입력',
    room_list: '사용 가능한 룸',
    no_rooms_available: '사용 가능한 룸 없음',
    tap_to_join: '탭하여 참가',
    players_in_room: '명',
    wager_amount: '베팅액',
    create_room: '룸 생성',
    join_room: '참가',
    online_count: '온라인',
    tut_step1: '바카라 환영합니다',
    tut_step1_desc: '플레이어, 뱅커, 타이에 베팅하세요. 9에 가까운 카드가 이깁니다!',
    tut_step2: '카드 값',
    tut_step2_desc: 'A=1, 2-9=숫자, 10/J/Q/K=0. 끝자리만 계산됩니다.',
    tut_step3: '베팅 방법',
    tut_step3_desc: '칩을 선택하고, 베팅 지역을 탭한 후 딜을 누르세요.',
    tut_step4: '게임 규칙',
    tut_step4_desc: '각각 2장의 카드를 받습니다. 9에 가장 가까운 쪽이 이깁니다.',
    tut_step5: '승리 팁',
    tut_step5_desc: '뱅커가 약간의 이점이 있습니다. 슈의 패턴을 관찰하세요.',
    tut_step6: '쌍 베팅',
    tut_step6_desc: '플레이어나 뱅커가 쌍을 받는 것에 베팅하세요. 11:1 지급.',
    tut_step7: '로드 패턴',
    tut_step7_desc: '빅로드와 비드플레이트로 결과를 추적하세요.',
    tut_step8: '프로 팁',
    tut_step8_desc: '자금을 관리하세요. 손실을 쫓지 마세요. 게임을 즐기세요!'
  },

  ja: {
    app_title: 'FAバカラ',
    home: 'ホーム',
    ranking: 'ランキング',
    shop: 'ショップ',
    mission: 'ミッション',
    profile: 'プロフィール',
    play_vs_dealer: 'ディーラーと対戦',
    online_table: 'オンラインテーブル',
    settings: '設定',
    back: '戻る',
    next: '次へ',
    prev: '前へ',
    finish: '完了',
    claim: '受け取る',
    deal: 'ディール',
    cancel_bet: 'キャンセル',
    rebet: '同額ベット',
    double_bet: 'x2',
    max_bet: '最大',
    player: 'プレイヤー',
    banker: 'バンカー',
    tie: 'タイ',
    ppair: 'P.ペア',
    p_pair: 'プレイヤーペア',
    bpair: 'B.ペア',
    b_pair: 'バンカーペア',
    dealer: 'ディーラー',
    dealer_deals: 'ディーラーが配布中...',
    round: 'ラウンド',
    shoe_info: '残りカード',
    cards_left: '残りカード',
    natural_8: 'ナチュラル8',
    natural_9: 'ナチュラル9',
    win: '勝利',
    lose: '敗北',
    tie_result: 'タイ',
    session_summary: 'セッション概要',
    hands_played: 'ハンド数',
    net_profit: 'ネット利益',
    history: '履歴',
    statistics: '統計',
    tutorial: 'チュートリアル',
    road_map: 'ロードマップ',
    big_road: 'ビッグロード',
    bead_plate: 'ビーズプレート',
    daily_check_in: '毎日チェックイン',
    check_in_tomorrow: '明日チェックイン',
    total_wins: '総勝利数',
    total_games: '総ゲーム数',
    win_rate: '勝率',
    best_streak: 'ベストストリーク',
    peak_stars: 'ピークスター',
    current_stars: '現在のスター',
    level: 'レベル',
    nickname: 'ニックネーム',
    edit_profile: 'プロフィール編集',
    save: '保存',
    reset_stats: '統計をリセット',
    sound: 'サウンド',
    vibration: 'バイブレーション',
    notifications: '通知',
    auto_deal: 'オートディール',
    language: '言語',
    speed: 'ゲーム速度',
    theme: 'テーマ',
    light: 'ライト',
    dark: 'ダーク',
    classic: 'クラシック',
    modern: 'モダン',
    avatars: 'アバター',
    tables: 'テーブル',
    cardbacks: 'カードバック',
    effects: 'エフェクト',
    shop_desc_avatars: 'アバターをカスタマイズ',
    shop_desc_tables: 'テーブルデザインを選択',
    shop_desc_cardbacks: 'カードバックデザイン',
    shop_desc_effects: 'ベッティングエフェクト',
    owned: '所有',
    equipped: '装備中',
    lock: 'ロック',
    buy: '購入',
    equip: '装備',
    room_title: 'ルーム名',
    enter_room_title: 'ルーム名を入力',
    room_list: '利用可能なルーム',
    no_rooms_available: 'ルームなし',
    tap_to_join: 'タップして参加',
    players_in_room: '人',
    wager_amount: 'ベット額',
    create_room: 'ルーム作成',
    join_room: '参加',
    online_count: 'オンライン',
    tut_step1: 'バカラへようこそ',
    tut_step1_desc: 'プレイヤー、バンカー、またはタイに賭けます。9に近いカードが勝ちます!',
    tut_step2: 'カード値',
    tut_step2_desc: 'A=1、2-9=数字、10/J/Q/K=0。一の位のみ計算。',
    tut_step3: 'ベット方法',
    tut_step3_desc: 'チップを選択し、ベッティングゾーンをタップしてディール。',
    tut_step4: 'ゲーム規則',
    tut_step4_desc: '各自2枚のカードを受け取ります。9に最も近い方が勝ち。',
    tut_step5: '勝利のコツ',
    tut_step5_desc: 'バンカーは若干有利です。シューのパターンを観察しましょう。',
    tut_step6: 'ペアベット',
    tut_step6_desc: 'プレイヤーまたはバンカーがペアを得ることに賭けます。11:1配当。',
    tut_step7: 'ロードパターン',
    tut_step7_desc: 'ビッグロードとビーズプレートで結果を追跡します。',
    tut_step8: 'プロのコツ',
    tut_step8_desc: '資金を管理します。損失を追いかけないでください。楽しんでください!'
  },

  zh: {
    app_title: 'FA百家乐',
    home: '主页',
    ranking: '排名',
    shop: '商店',
    mission: '任务',
    profile: '档案',
    play_vs_dealer: '与庄家对战',
    online_table: '在线桌',
    settings: '设置',
    back: '返回',
    next: '下一个',
    prev: '上一个',
    finish: '完成',
    claim: '领取',
    deal: '发牌',
    cancel_bet: '取消',
    rebet: '重新下注',
    double_bet: 'x2',
    max_bet: '最大',
    player: '闲家',
    banker: '庄家',
    tie: '平手',
    ppair: '闲对',
    p_pair: '闲家对',
    bpair: '庄对',
    b_pair: '庄家对',
    dealer: '庄家',
    dealer_deals: '庄家发牌中...',
    round: '轮',
    shoe_info: '剩余卡数',
    cards_left: '剩余卡数',
    natural_8: '天然8',
    natural_9: '天然9',
    win: '获胜',
    lose: '失败',
    tie_result: '平手',
    session_summary: '会话总结',
    hands_played: '手数',
    net_profit: '净利润',
    history: '历史',
    statistics: '统计',
    tutorial: '教程',
    road_map: '路线图',
    big_road: '大路',
    bead_plate: '珠盘',
    daily_check_in: '每日签到',
    check_in_tomorrow: '明天签到',
    total_wins: '总胜利',
    total_games: '总游戏数',
    win_rate: '胜率',
    best_streak: '最佳连胜',
    peak_stars: '峰值星星',
    current_stars: '当前星星',
    level: '等级',
    nickname: '昵称',
    edit_profile: '编辑档案',
    save: '保存',
    reset_stats: '重置统计',
    sound: '声音',
    vibration: '振动',
    notifications: '通知',
    auto_deal: '自动发牌',
    language: '语言',
    speed: '游戏速度',
    theme: '主题',
    light: '明亮',
    dark: '黑暗',
    classic: '经典',
    modern: '现代',
    avatars: '头像',
    tables: '桌子',
    cardbacks: '卡背',
    effects: '效果',
    shop_desc_avatars: '自定义头像',
    shop_desc_tables: '选择桌面设计',
    shop_desc_cardbacks: '卡背设计',
    shop_desc_effects: '下注效果',
    owned: '拥有',
    equipped: '装备',
    lock: '锁定',
    buy: '购买',
    equip: '装备',
    room_title: '房间名称',
    enter_room_title: '输入房间名称',
    room_list: '可用房间',
    no_rooms_available: '没有房间',
    tap_to_join: '点击加入',
    players_in_room: '人',
    wager_amount: '下注额',
    create_room: '创建房间',
    join_room: '加入',
    online_count: '在线',
    tut_step1: '欢迎来到百家乐',
    tut_step1_desc: '在闲家、庄家或平手上下注。最接近9的卡牌获胜!',
    tut_step2: '卡牌价值',
    tut_step2_desc: 'A=1、2-9=数字、10/J/Q/K=0。仅计算个位数。',
    tut_step3: '下注方式',
    tut_step3_desc: '选择筹码，点击下注区域，然后点击发牌。',
    tut_step4: '游戏规则',
    tut_step4_desc: '各方获得2张卡牌。最接近9者获胜。平手赔8:1。',
    tut_step5: '获胜提示',
    tut_step5_desc: '庄家略占优势。观察靴子中的图案。',
    tut_step6: '对子下注',
    tut_step6_desc: '下注闲家或庄家获得对子。赔11:1。',
    tut_step7: '路线图案',
    tut_step7_desc: '用大路和珠盘追踪结果。',
    tut_step8: '专业提示',
    tut_step8_desc: '管理资金。不要追逐损失。享受游戏!'
  },

  vi: {
    app_title: 'FA Baccarat',
    home: 'Trang chủ',
    ranking: 'Xếp hạng',
    shop: 'Cửa hàng',
    mission: 'Nhiệm vụ',
    profile: 'Hồ sơ',
    play_vs_dealer: 'Chơi với Dealer',
    online_table: 'Bàn trực tuyến',
    settings: 'Cài đặt',
    back: 'Quay lại',
    next: 'Tiếp theo',
    prev: 'Trước đó',
    finish: 'Hoàn thành',
    claim: 'Nhận',
    deal: 'PHÁT',
    cancel_bet: 'Hủy',
    rebet: 'Đặt lại',
    double_bet: 'x2',
    max_bet: 'Tối đa',
    player: 'NGƯỜI CHƠI',
    banker: 'NHÀ CÁI',
    tie: 'HÒA',
    ppair: 'C.ĐÔI',
    p_pair: 'Cặp Người chơi',
    bpair: 'N.ĐÔI',
    b_pair: 'Cặp Nhà cái',
    dealer: 'Dealer',
    dealer_deals: 'Dealer phát...',
    round: 'Vòng',
    shoe_info: 'lá còn lại',
    cards_left: 'Lá còn lại',
    natural_8: '8 Tự nhiên',
    natural_9: '9 Tự nhiên',
    win: 'THẮNG',
    lose: 'THUA',
    tie_result: 'HÒA',
    session_summary: 'Tóm tắt phiên',
    hands_played: 'Tay chơi',
    net_profit: 'Lợi nhuận ròng',
    history: 'Lịch sử',
    statistics: 'Thống kê',
    tutorial: 'Hướng dẫn',
    road_map: 'Bản đồ đường',
    big_road: 'Đường lớn',
    bead_plate: 'Bảng hạt',
    daily_check_in: 'Điểm danh hàng ngày',
    check_in_tomorrow: 'Điểm danh ngày mai',
    total_wins: 'Tổng chiến thắng',
    total_games: 'Tổng trò chơi',
    win_rate: 'Tỷ lệ thắng',
    best_streak: 'Chuỗi tốt nhất',
    peak_stars: 'Sao đỉnh',
    current_stars: 'Sao hiện tại',
    level: 'Cấp độ',
    nickname: 'Biệt danh',
    edit_profile: 'Chỉnh sửa hồ sơ',
    save: 'Lưu',
    reset_stats: 'Đặt lại thống kê',
    sound: 'Âm thanh',
    vibration: 'Rung',
    notifications: 'Thông báo',
    auto_deal: 'Phát tự động',
    language: 'Ngôn ngữ',
    speed: 'Tốc độ trò chơi',
    theme: 'Chủ đề',
    light: 'Sáng',
    dark: 'Tối',
    classic: 'Cổ điển',
    modern: 'Hiện đại',
    avatars: 'Hình đại diện',
    tables: 'Bàn',
    cardbacks: 'Mặt sau thẻ',
    effects: 'Hiệu ứng',
    shop_desc_avatars: 'Tùy chỉnh hình đại diện',
    shop_desc_tables: 'Chọn thiết kế bàn',
    shop_desc_cardbacks: 'Thiết kế mặt sau',
    shop_desc_effects: 'Hiệu ứng đặt cược',
    owned: 'Sở hữu',
    equipped: 'TRANG BỊ',
    lock: 'Khóa',
    buy: 'Mua',
    equip: 'Trang bị',
    room_title: 'Tên phòng',
    enter_room_title: 'Nhập tên phòng',
    room_list: 'Phòng có sẵn',
    no_rooms_available: 'Không có phòng',
    tap_to_join: 'Chạm để tham gia',
    players_in_room: 'người',
    wager_amount: 'Số tiền cược',
    create_room: 'Tạo phòng',
    join_room: 'Tham gia',
    online_count: 'Trực tuyến',
    tut_step1: 'Chào mừng đến Baccarat',
    tut_step1_desc: 'Đặt cược vào Người chơi, Nhà cái hoặc Hòa. Lá gần 9 nhất thắng!',
    tut_step2: 'Giá trị thẻ',
    tut_step2_desc: 'A=1, 2-9=giá trị, 10/J/Q/K=0. Chỉ tính chữ số cuối cùng.',
    tut_step3: 'Cách đặt cược',
    tut_step3_desc: 'Chọn chip, chạm vào vùng cược, rồi phát để chơi.',
    tut_step4: 'Luật chơi',
    tut_step4_desc: 'Mỗi người nhận 2 lá. Lá gần 9 nhất thắng. Hòa trả 8:1.',
    tut_step5: 'Mẹo chiến thắng',
    tut_step5_desc: 'Nhà cái có lợi thế nhỏ. Quan sát các mẫu trong giày.',
    tut_step6: 'Cược cặp',
    tut_step6_desc: 'Đặt cược vào Người chơi hoặc Nhà cái nhận cặp. Trả 11:1.',
    tut_step7: 'Mẫu đường',
    tut_step7_desc: 'Theo dõi kết quả với Đường lớn và Bảng hạt.',
    tut_step8: 'Mẹo chuyên nghiệp',
    tut_step8_desc: 'Quản lý ngân sách. Đừng bắt kịp thua lỗ. Thưởng thức trò chơi!'
  },

  th: {
    app_title: 'FA บาคาร่า',
    home: 'หน้าแรก',
    ranking: 'อันดับ',
    shop: 'ร้านค้า',
    mission: 'ภารกิจ',
    profile: 'โปรไฟล์',
    play_vs_dealer: 'เล่นกับดีลเลอร์',
    online_table: 'โต๊ะออนไลน์',
    settings: 'การตั้งค่า',
    back: 'ย้อนกลับ',
    next: 'ต่อไป',
    prev: 'ก่อนหน้า',
    finish: 'เสร็จสิ้น',
    claim: 'รับ',
    deal: 'แจก',
    cancel_bet: 'ยกเลิก',
    rebet: 'เดิมพันซ้ำ',
    double_bet: 'x2',
    max_bet: 'สูงสุด',
    player: 'ผู้เล่น',
    banker: 'เจ้ามือ',
    tie: 'เสมอ',
    ppair: 'P.คู่',
    p_pair: 'คู่ผู้เล่น',
    bpair: 'B.คู่',
    b_pair: 'คู่เจ้ามือ',
    dealer: 'ดีลเลอร์',
    dealer_deals: 'ดีลเลอร์แจกไพ่...',
    round: 'รอบ',
    shoe_info: 'ไพ่เหลือ',
    cards_left: 'ไพ่เหลือ',
    natural_8: 'เนเชอรัล 8',
    natural_9: 'เนเชอรัล 9',
    win: 'ชนะ',
    lose: 'แพ้',
    tie_result: 'เสมอ',
    session_summary: 'สรุปเซสชั่น',
    hands_played: 'มือที่เล่น',
    net_profit: 'กำไรสุทธิ',
    history: 'ประวัติ',
    statistics: 'สถิติ',
    tutorial: 'บทเรียน',
    road_map: 'แผนที่เส้นทาง',
    big_road: 'เส้นทางใหญ่',
    bead_plate: 'จานลูกปัด',
    daily_check_in: 'เช็คอินรายวัน',
    check_in_tomorrow: 'เช็คอินวันพรุ่งนี้',
    total_wins: 'ชนะทั้งหมด',
    total_games: 'เกมทั้งหมด',
    win_rate: 'อัตราการชนะ',
    best_streak: 'แถบที่ดีที่สุด',
    peak_stars: 'ดาวสูงสุด',
    current_stars: 'ดาวปัจจุบัน',
    level: 'ระดับ',
    nickname: 'ชื่อเล่น',
    edit_profile: 'แก้ไขโปรไฟล์',
    save: 'บันทึก',
    reset_stats: 'รีเซ็ตสถิติ',
    sound: 'เสียง',
    vibration: 'การสั่นสะเทือน',
    notifications: 'การแจ้งเตือน',
    auto_deal: 'แจกอัตโนมัติ',
    language: 'ภาษา',
    speed: 'ความเร็วเกม',
    theme: 'ธีม',
    light: 'สว่าง',
    dark: 'มืด',
    classic: 'คลาสสิก',
    modern: 'สมัยใหม่',
    avatars: 'อวาตาร์',
    tables: 'โต๊ะ',
    cardbacks: 'ด้านหลังการ์ด',
    effects: 'เอฟเฟกต์',
    shop_desc_avatars: 'ปรับแต่งอวาตาร์',
    shop_desc_tables: 'เลือกการออกแบบโต๊ะ',
    shop_desc_cardbacks: 'การออกแบบด้านหลัง',
    shop_desc_effects: 'เอฟเฟกต์การเดิมพัน',
    owned: 'เป็นเจ้าของ',
    equipped: 'ติดตั้งแล้ว',
    lock: 'ล็อก',
    buy: 'ซื้อ',
    equip: 'ติดตั้ง',
    room_title: 'ชื่อห้อง',
    enter_room_title: 'ป้อนชื่อห้อง',
    room_list: 'ห้องที่มี',
    no_rooms_available: 'ไม่มีห้อง',
    tap_to_join: 'แตะเพื่อเข้าร่วม',
    players_in_room: 'คน',
    wager_amount: 'จำนวนเดิมพัน',
    create_room: 'สร้างห้อง',
    join_room: 'เข้าร่วม',
    online_count: 'ออนไลน์',
    tut_step1: 'ยินดีต้อนรับสู่บาคาร่า',
    tut_step1_desc: 'เดิมพันผู้เล่น เจ้ามือ หรือเสมอ ไพ่ที่ใกล้ 9 มากที่สุดชนะ!',
    tut_step2: 'มูลค่าการ์ด',
    tut_step2_desc: 'A=1, 2-9=ค่า, 10/J/Q/K=0 นับเฉพาะตัวเลขสุดท้าย',
    tut_step3: 'วิธีเดิมพัน',
    tut_step3_desc: 'เลือกชิป แตะเขตเดิมพัน จากนั้นแจกเพื่อเล่น',
    tut_step4: 'กฎเกม',
    tut_step4_desc: 'แต่ละฝ่ายได้ 2 ใบ ใบที่ใกล้ 9 มากที่สุดชนะ เสมอจ่าย 8:1',
    tut_step5: 'เคล็ดลับการชนะ',
    tut_step5_desc: 'เจ้ามือมีข้อได้เปรียบเล็กน้อย ดูแบบรองเท้า',
    tut_step6: 'เดิมพันคู่',
    tut_step6_desc: 'เดิมพันผู้เล่นหรือเจ้ามือได้คู่ จ่าย 11:1',
    tut_step7: 'รูปแบบเส้นทาง',
    tut_step7_desc: 'ติดตามผลลัพธ์ด้วยเส้นทางใหญ่และจานลูกปัด',
    tut_step8: 'เคล็ดลับมืออาชีพ',
    tut_step8_desc: 'จัดการทุน อย่าไล่ความสูญเสีย เพลิดเพลินไปกับเกม!'
  },

  id: {
    app_title: 'FA Baccarat',
    home: 'Beranda',
    ranking: 'Peringkat',
    shop: 'Toko',
    mission: 'Misi',
    profile: 'Profil',
    play_vs_dealer: 'Bermain vs Dealer',
    online_table: 'Meja Online',
    settings: 'Pengaturan',
    back: 'Kembali',
    next: 'Berikutnya',
    prev: 'Sebelumnya',
    finish: 'Selesai',
    claim: 'Klaim',
    deal: 'BAGIKAN',
    cancel_bet: 'Batalkan',
    rebet: 'Pertaruhan Ulang',
    double_bet: 'x2',
    max_bet: 'Maks',
    player: 'PEMAIN',
    banker: 'BANKIR',
    tie: 'SERI',
    ppair: 'P.PASANG',
    p_pair: 'Pasang Pemain',
    bpair: 'B.PASANG',
    b_pair: 'Pasang Bankir',
    dealer: 'Dealer',
    dealer_deals: 'Dealer membagikan...',
    round: 'Putaran',
    shoe_info: 'kartu tersisa',
    cards_left: 'Kartu Tersisa',
    natural_8: 'Natural 8',
    natural_9: 'Natural 9',
    win: 'MENANG',
    lose: 'KALAH',
    tie_result: 'SERI',
    session_summary: 'Ringkasan Sesi',
    hands_played: 'Putaran Dimainkan',
    net_profit: 'Keuntungan Bersih',
    history: 'Riwayat',
    statistics: 'Statistik',
    tutorial: 'Tutorial',
    road_map: 'Peta Jalan',
    big_road: 'Jalan Besar',
    bead_plate: 'Piring Manik',
    daily_check_in: 'Check-in Harian',
    check_in_tomorrow: 'Check-in Besok',
    total_wins: 'Total Kemenangan',
    total_games: 'Total Permainan',
    win_rate: 'Tingkat Kemenangan',
    best_streak: 'Garis Terbaik',
    peak_stars: 'Bintang Puncak',
    current_stars: 'Bintang Saat Ini',
    level: 'Level',
    nickname: 'Nama Panggilan',
    edit_profile: 'Edit Profil',
    save: 'Simpan',
    reset_stats: 'Atur Ulang Statistik',
    sound: 'Suara',
    vibration: 'Getaran',
    notifications: 'Notifikasi',
    auto_deal: 'Bagikan Otomatis',
    language: 'Bahasa',
    speed: 'Kecepatan Permainan',
    theme: 'Tema',
    light: 'Terang',
    dark: 'Gelap',
    classic: 'Klasik',
    modern: 'Modern',
    avatars: 'Avatar',
    tables: 'Meja',
    cardbacks: 'Kartu Belakang',
    effects: 'Efek',
    shop_desc_avatars: 'Sesuaikan avatar',
    shop_desc_tables: 'Pilih desain meja',
    shop_desc_cardbacks: 'Desain kartu belakang',
    shop_desc_effects: 'Efek taruhan',
    owned: 'Dimiliki',
    equipped: 'DILENGKAPI',
    lock: 'Terkunci',
    buy: 'Beli',
    equip: 'Lengkapi',
    room_title: 'Nama Ruangan',
    enter_room_title: 'Masukkan nama ruangan',
    room_list: 'Ruangan Tersedia',
    no_rooms_available: 'Tidak ada ruangan',
    tap_to_join: 'Ketuk untuk bergabung',
    players_in_room: 'pemain',
    wager_amount: 'Jumlah Taruhan',
    create_room: 'Buat Ruangan',
    join_room: 'Bergabung',
    online_count: 'Online',
    tut_step1: 'Selamat Datang di Baccarat',
    tut_step1_desc: 'Pertaruhkan pada Pemain, Bankir, atau Seri. Kartu terdekat 9 menang!',
    tut_step2: 'Nilai Kartu',
    tut_step2_desc: 'A=1, 2-9=nilai, 10/J/Q/K=0. Hanya hitung digit terakhir.',
    tut_step3: 'Cara Bertaruh',
    tut_step3_desc: 'Pilih chip, ketuk zona taruhan, lalu bagikan untuk bermain.',
    tut_step4: 'Aturan Permainan',
    tut_step4_desc: 'Masing-masing mendapat 2 kartu. Terdekat 9 menang. Seri membayar 8:1.',
    tut_step5: 'Tip Menang',
    tut_step5_desc: 'Bankir memiliki keuntungan kecil. Amati pola di sepatu.',
    tut_step6: 'Taruhan Pasang',
    tut_step6_desc: 'Pertaruhkan Pemain atau Bankir mendapat pasang. Bayar 11:1.',
    tut_step7: 'Pola Jalan',
    tut_step7_desc: 'Lacak hasil dengan Jalan Besar dan Piring Manik.',
    tut_step8: 'Tip Profesional',
    tut_step8_desc: 'Kelola bankroll. Jangan kejar kerugian. Nikmati permainan!'
  }
};

function t(key) {
  var lang = localStorage.getItem('lang') || 'en';
  if (!I18N[lang]) lang = 'en';
  return (I18N[lang][key] || I18N['en'][key] || key);
}

function updateI18n() {
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
}


/* ============================================================================
   PROFESSIONAL CASINO CSS
   ============================================================================ */

const CSS_TEXT = `
:root {
  --bg-primary: #0f0a2a;
  --bg-secondary: #1a1145;
  --bg-surface: #231660;
  --bg-card: #2d1b69;
  --felt-color: #3d2b1f;
  --felt-dark: #2a1d14;
  --felt-light: #5c3d2e;
  --primary: #d4af37;
  --primary-light: #ffd700;
  --primary-glow: rgba(255,215,0,0.3);
  --accent-blue: #00b4d8;
  --accent-red: #ef4444;
  --accent-green: #22c55e;
  --accent-teal: #14b8a6;
  --accent-purple: #a855f7;
  --text-white: #ffffff;
  --text-light: #e2e8f0;
  --text-muted: #94a3b8;
  --neon-blue: 0 0 10px #00b4d8, 0 0 20px rgba(0,180,216,0.3);
  --neon-red: 0 0 10px #ef4444, 0 0 20px rgba(239,68,68,0.3);
  --neon-green: 0 0 10px #22c55e, 0 0 20px rgba(34,197,94,0.3);
  --neon-gold: 0 0 10px #ffd700, 0 0 20px rgba(255,215,0,0.3);
  --spacing: 12px;
  --radius: 12px;
  --radius-lg: 20px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #0f0a2a 0%, #1a1145 50%, #0f0a2a 100%);
  color: var(--text-light);
  overflow: hidden;
  background-attachment: fixed;
}

body::before {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(212,175,55,0.02) 35px, rgba(212,175,55,0.02) 70px),
    repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(212,175,55,0.02) 35px, rgba(212,175,55,0.02) 70px);
  pointer-events: none;
  z-index: 0;
}

#kk-root {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100%;
  height: 100%;
  height: 100dvh;
  max-width: 480px;
  margin: 0 auto;
  background: linear-gradient(135deg, #0f0a2a 0%, #1a1145 50%, #0f0a2a 100%);
  z-index: 1;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: manipulation;
}

.screen {
  display: none;
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0a2a 0%, #1a1145 50%, #0f0a2a 100%);
}

.screen.active {
  display: flex;
}

.screen-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  padding-bottom: 80px;
  position: relative;
  z-index: 2;
}

.screen-content::-webkit-scrollbar {
  width: 6px;
}

.screen-content::-webkit-scrollbar-track {
  background: rgba(212,175,55,0.1);
}

.screen-content::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 3px;
}

/* ===== HOME SCREEN BACKGROUND ANIMATION ===== */

.home-background {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.floating-card {
  position: absolute;
  width: 50px;
  height: 70px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(212,175,55,0.15);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  opacity: 0.25;
  animation: floatCard 8s ease-in-out infinite;
  transform-style: preserve-3d;
  pointer-events: none;
}

.floating-card:nth-child(1) { top: 10%; left: 5%; animation-delay: 0s; animation-duration: 12s; }
.floating-card:nth-child(2) { top: 20%; right: 8%; animation-delay: 1s; animation-duration: 14s; }
.floating-card:nth-child(3) { top: 40%; left: 12%; animation-delay: 2s; animation-duration: 16s; }
.floating-card:nth-child(4) { top: 60%; right: 10%; animation-delay: 0.5s; animation-duration: 15s; }
.floating-card:nth-child(5) { bottom: 20%; left: 8%; animation-delay: 1.5s; animation-duration: 13s; }
.floating-card:nth-child(6) { bottom: 30%; right: 12%; animation-delay: 2.5s; animation-duration: 17s; }
.floating-card:nth-child(7) { top: 35%; left: 20%; animation-delay: 3s; animation-duration: 18s; }
.floating-card:nth-child(8) { top: 50%; right: 20%; animation-delay: 1.2s; animation-duration: 14.5s; }

@keyframes floatCard {
  0%, 100% { transform: translateY(0) rotateY(0deg) rotateZ(0deg); }
  25% { transform: translateY(-30px) rotateY(15deg) rotateZ(2deg); }
  50% { transform: translateY(-60px) rotateY(30deg) rotateZ(5deg); }
  75% { transform: translateY(-30px) rotateY(15deg) rotateZ(2deg); }
}

.sparkle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
  opacity: 0;
  animation: sparkleAnim 3s ease-in-out infinite;
  box-shadow: 0 0 10px var(--primary);
}

.sparkle:nth-child(1) { top: 10%; left: 15%; animation-delay: 0s; }
.sparkle:nth-child(2) { top: 30%; right: 10%; animation-delay: 0.5s; }
.sparkle:nth-child(3) { bottom: 35%; left: 25%; animation-delay: 1s; }
.sparkle:nth-child(4) { bottom: 20%; right: 20%; animation-delay: 1.5s; }
.sparkle:nth-child(5) { top: 50%; left: 10%; animation-delay: 2s; }
.sparkle:nth-child(6) { top: 15%; right: 25%; animation-delay: 0.3s; }
.sparkle:nth-child(7) { bottom: 45%; left: 40%; animation-delay: 1.3s; }
.sparkle:nth-child(8) { top: 65%; right: 30%; animation-delay: 1.8s; }

@keyframes sparkleAnim {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

/* ===== TOP BAR ===== */

.top-bar {
  background: linear-gradient(180deg, rgba(26,17,69,0.95) 0%, rgba(26,17,69,0.8) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid var(--primary);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  position: relative;
}

.top-bar .title {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary-light);
  text-shadow: 0 0 10px var(--primary-glow);
  letter-spacing: 2px;
}

.top-bar .subtitle {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
}

.top-bar-left,
.top-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  background: transparent;
  border: none;
  color: var(--primary);
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  transition: all 0.3s;
}

.back-btn:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px var(--primary-glow));
}

.stars-pill {
  background: rgba(212,175,55,0.15);
  border: 1px solid var(--primary);
  border-radius: 20px;
  padding: 6px 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
  color: var(--primary-light);
  box-shadow: 0 0 10px var(--primary-glow);
}

.stars-pill .emoji {
  font-size: 16px;
}

.gear-btn {
  background: transparent;
  border: none;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--primary);
}

.gear-btn:hover {
  transform: rotate(30deg);
  filter: drop-shadow(0 0 8px var(--primary-glow));
}

/* ===== PROFILE MINI CARD ===== */

.profile-mini {
  background: rgba(45,27,105,0.8);
  border: 1px solid var(--primary);
  border-radius: 16px;
  padding: 12px;
  margin: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 0 15px rgba(212,175,55,0.2);
}

.profile-mini .avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-teal));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 2px solid var(--primary);
  flex-shrink: 0;
}

.profile-mini .info {
  flex: 1;
}

.profile-mini .nickname {
  font-weight: 700;
  color: var(--text-white);
  font-size: 14px;
}

.profile-mini .level-badge {
  background: linear-gradient(135deg, var(--accent-gold, #ffd700), var(--primary));
  color: #000;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  margin-top: 2px;
  display: inline-block;
}

/* ===== DAILY CHECK-IN CARD ===== */

.home-mascot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px 16px;
  margin: 12px 16px;
  background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(212,175,55,0.15));
  border-radius: 16px;
  border: 1px solid rgba(212,175,55,0.25);
  overflow: hidden;
  min-height: 120px;
}
.mascot-character {
  font-size: 80px;
  animation: mascotBounce 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(212,175,55,0.4));
  z-index: 2;
}
@keyframes mascotBounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.05); }
}
.mascot-cards {
  display: flex;
  gap: 6px;
  z-index: 2;
}
.mascot-card {
  width: 44px;
  height: 62px;
  background: linear-gradient(135deg, #fff 0%, #f0e6d4 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  animation: mascotCardFloat 3s ease-in-out infinite;
  border: 1.5px solid rgba(212,175,55,0.5);
}
.mascot-card:nth-child(1) { color: #e74c3c; animation-delay: 0s; }
.mascot-card:nth-child(2) { color: #2c3e50; animation-delay: 0.3s; }
.mascot-card:nth-child(3) { color: #e74c3c; animation-delay: 0.6s; }
@keyframes mascotCardFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(-3deg); }
  66% { transform: translateY(-5px) rotate(3deg); }
}
.mascot-sparkles {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
}
.mascot-sparkle {
  position: absolute;
  width: 4px; height: 4px;
  background: #d4af37;
  border-radius: 50%;
  animation: mSparkle 2s ease-in-out infinite;
}
.mascot-sparkle:nth-child(1) { top: 15%; left: 10%; animation-delay: 0s; }
.mascot-sparkle:nth-child(2) { top: 25%; right: 15%; animation-delay: 0.4s; }
.mascot-sparkle:nth-child(3) { bottom: 20%; left: 20%; animation-delay: 0.8s; }
.mascot-sparkle:nth-child(4) { top: 40%; right: 10%; animation-delay: 1.2s; }
.mascot-sparkle:nth-child(5) { bottom: 10%; right: 25%; animation-delay: 1.6s; }
@keyframes mSparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1.5); }
}

/* ===== ACTION BUTTONS ===== */

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 16px;
  padding-top: 0;
}

.btn-large {
  background: linear-gradient(135deg, rgba(0,180,216,0.3), rgba(20,184,166,0.3));
  border: 2px solid var(--accent-blue);
  border-radius: 16px;
  padding: 24px 16px;
  color: var(--text-white);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 0 15px rgba(0,180,216,0.3);
}

.btn-large .emoji {
  font-size: 32px;
}

.btn-large:hover {
  background: linear-gradient(135deg, rgba(0,180,216,0.5), rgba(20,184,166,0.5));
  transform: translateY(-4px);
  box-shadow: 0 0 25px rgba(0,180,216,0.6);
}

.btn-large.btn-online {
  border-color: var(--accent-red);
  background: linear-gradient(135deg, rgba(239,68,68,0.3), rgba(168,85,247,0.3));
  box-shadow: 0 0 15px rgba(239,68,68,0.3);
}

.btn-large.btn-online:hover {
  background: linear-gradient(135deg, rgba(239,68,68,0.5), rgba(168,85,247,0.5));
  box-shadow: 0 0 25px rgba(239,68,68,0.6);
}

/* ===== SESSION SUMMARY CARD ===== */

.session-summary {
  background: rgba(45,27,105,0.8);
  border: 1px solid var(--accent-green);
  border-radius: 16px;
  padding: 16px;
  margin: 16px;
  box-shadow: 0 0 15px rgba(34,197,94,0.2);
}

.session-summary .title {
  color: var(--accent-green);
  font-weight: 700;
  margin-bottom: 12px;
  font-size: 14px;
}

.session-summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.summary-item {
  background: rgba(34,197,94,0.1);
  border-left: 3px solid var(--accent-green);
  padding: 12px;
  border-radius: 8px;
}

.summary-item .label {
  color: var(--text-muted);
  font-size: 12px;
  margin-bottom: 4px;
}

.summary-item .value {
  color: var(--text-white);
  font-weight: 700;
  font-size: 18px;
}

/* ===== QUICK GRID ===== */

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 16px;
  padding-top: 0;
}

.quick-item {
  background: rgba(45,27,105,0.8);
  border: 1px solid var(--primary);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 10px rgba(212,175,55,0.1);
}

.quick-item:hover {
  border-color: var(--accent-blue);
  background: rgba(45,27,105,0.95);
  box-shadow: 0 0 15px rgba(0,180,216,0.3);
  transform: translateY(-2px);
}

.quick-item .emoji {
  font-size: 28px;
  margin-bottom: 8px;
}

.quick-item .label {
  color: var(--text-light);
  font-size: 12px;
  font-weight: 600;
}

/* ===== BOTTOM NAVIGATION ===== */

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: rgba(26,17,69,0.9);
  backdrop-filter: blur(20px);
  border-radius: 0;
  border: 1px solid var(--primary);
  border-bottom: none;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 200;
  box-shadow: 0 0 30px rgba(212,175,55,0.2), inset 0 0 30px rgba(212,175,55,0.05);
}

.sc-game .bottom-nav { display: none !important; }

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  position: relative;
}

.nav-item.active {
  color: var(--primary-light);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  width: 24px;
  height: 2px;
  background: var(--primary-light);
  border-radius: 1px;
  box-shadow: 0 0 10px var(--primary-glow);
}

.nav-item .emoji {
  font-size: 20px;
}

.nav-item:hover {
  color: var(--primary);
  transform: scale(1.05);
}

/* ===== GAME SCREEN LAYOUT ===== */

.game-screen .screen-content {
  padding-bottom: 380px;
  display: flex;
  flex-direction: column;
}

.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 12px;
}

.dealer-section {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.dealer-avatar {
  width: 100%;
  max-width: 120px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

@keyframes rotateRing {
  0%, 100% { box-shadow: 0 0 20px var(--primary-glow), inset 0 0 15px rgba(255,215,0,0.2); }
  50% { box-shadow: 0 0 30px var(--primary-glow), inset 0 0 25px rgba(255,215,0,0.3); }
}

.dealer-name {
  color: var(--text-light);
  font-weight: 700;
  text-align: center;
  margin-top: 4px;
}

.card-display-area {
  background: linear-gradient(180deg, var(--felt-dark) 0%, var(--felt-color) 100%);
  border: 2px solid var(--primary);
  border-radius: 12px;
  padding: 8px 6px;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 0 15px rgba(212,175,55,0.2);
  min-height: 140px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6px;
  overflow: hidden;
  width: 100%;
}

.player-side,
.banker-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.player-side .label,
.banker-side .label {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 1px;
  text-shadow: 0 0 5px currentColor;
}

.player-side .label {
  color: var(--accent-blue);
}

.banker-side .label {
  color: var(--accent-red);
}

.card-slots {
  display: flex;
  gap: 2px;
  margin-bottom: 6px;
  flex-wrap: nowrap;
  justify-content: center;
  max-width: 100%;
}

.score-display {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-light);
  text-shadow: 0 0 10px var(--primary-glow);
}

.vs-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.vs-text {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 2px;
}

.result-banner {
  font-size: 18px;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 8px;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-banner.player-win {
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-teal));
  color: var(--text-white);
  box-shadow: 0 0 15px rgba(0,180,216,0.5);
}

.result-banner.banker-win {
  background: linear-gradient(135deg, var(--accent-red), #f97316);
  color: var(--text-white);
  box-shadow: 0 0 15px rgba(239,68,68,0.5);
}

.result-banner.tie-win {
  background: linear-gradient(135deg, var(--accent-green), var(--accent-teal));
  color: var(--text-white);
  box-shadow: 0 0 15px rgba(34,197,94,0.5);
}

/* ===== PLAYING CARD ===== */

.playing-card {
  width: 42px;
  height: 60px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  position: relative;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  transform-style: preserve-3d;
  perspective: 1000px;
  font-size: 10px;
  flex-shrink: 0;
}

.playing-card.red { color: #dc2626; }
.playing-card.black { color: #1e293b; }

.playing-card::before {
  content: attr(data-rank);
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 8px;
}

.playing-card::after {
  content: attr(data-rank);
  position: absolute;
  bottom: 4px;
  right: 4px;
  transform: rotate(180deg);
  font-size: 8px;
}

.playing-card .suit {
  font-size: 22px;
}

.playing-card.cardback {
  background: linear-gradient(135deg, #b91c1c, #7f1d1d);
  color: #ffd700;
  border: 2px solid #ffd700;
  font-size: 12px;
}

.playing-card.deal-animation {
  animation: dealSlide 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes dealSlide {
  0% { 
    transform: translateX(-100px) rotateY(90deg) scale(0.8);
    opacity: 0;
  }
  70% { 
    transform: translateX(10px) rotateY(-10deg);
  }
  100% { 
    transform: translateX(0) rotateY(0deg) scale(1);
    opacity: 1;
  }
}

/* ===== AI PLAYERS ROW ===== */

.ai-players-row {
  display: flex;
  gap: 12px;
  padding: 12px;
  margin-bottom: 12px;
  background: rgba(45,27,105,0.5);
  border-radius: 12px;
  overflow-x: auto;
}

.ai-player {
  background: rgba(45,27,105,0.8);
  border: 1px solid var(--accent-blue);
  border-radius: 12px;
  padding: 8px;
  min-width: 100px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.ai-player .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-teal));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border: 2px solid var(--primary);
}

.ai-player .name {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-light);
}

.ai-player .stars {
  font-size: 11px;
  color: var(--primary);
  font-weight: 600;
}

.ai-player .bet-indicator {
  font-size: 10px;
  color: var(--accent-green);
  font-weight: 700;
}

/* ===== BETTING TABLE ===== */

.bet-table {
  background: linear-gradient(180deg, var(--felt-dark) 0%, var(--felt-color) 100%);
  border: 2px solid var(--primary);
  border-radius: 10px;
  padding: 6px 4px;
  display: flex;
  gap: 4px;
  justify-content: space-between;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 0 15px rgba(212,175,55,0.2);
  width: 100%;
  overflow: hidden;
}

.bet-zone {
  flex: 1;
  min-width: 0;
  background: rgba(45,27,105,0.6);
  border: 2px dashed rgba(212,175,55,0.5);
  border-radius: 8px;
  padding: 6px 2px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  position: relative;
}

.bet-zone .zone-multiplier {
  font-size: 9px;
  font-weight: 700;
  color: var(--primary);
  background: rgba(212,175,55,0.1);
  padding: 1px 3px;
  border-radius: 3px;
}

.bet-zone .zone-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.bet-zone .zone-bet-amount {
  font-size: 10px;
  font-weight: 700;
  min-height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Zone specific styling */
.bet-zone.zone-player {
  border-color: var(--accent-blue);
}

.bet-zone.zone-player:hover,
.bet-zone.zone-player.active {
  background: rgba(0,180,216,0.2);
  border-color: var(--accent-blue);
  box-shadow: 0 0 15px var(--neon-blue), inset 0 0 10px rgba(0,180,216,0.2);
  transform: scale(1.05);
}

.bet-zone.zone-player .zone-label {
  color: var(--accent-blue);
}

.bet-zone.zone-banker {
  border-color: var(--accent-red);
}

.bet-zone.zone-banker:hover,
.bet-zone.zone-banker.active {
  background: rgba(239,68,68,0.2);
  border-color: var(--accent-red);
  box-shadow: 0 0 15px var(--neon-red), inset 0 0 10px rgba(239,68,68,0.2);
  transform: scale(1.05);
}

.bet-zone.zone-banker .zone-label {
  color: var(--accent-red);
}

.bet-zone.zone-tie {
  border-color: var(--accent-green);
}

.bet-zone.zone-tie:hover,
.bet-zone.zone-tie.active {
  background: rgba(34,197,94,0.2);
  border-color: var(--accent-green);
  box-shadow: 0 0 15px var(--neon-green), inset 0 0 10px rgba(34,197,94,0.2);
  transform: scale(1.05);
}

.bet-zone.zone-tie .zone-label {
  color: var(--accent-green);
}

.bet-zone.zone-ppair,
.bet-zone.zone-bpair {
  border-color: var(--accent-teal);
}

.bet-zone.zone-ppair:hover,
.bet-zone.zone-ppair.active,
.bet-zone.zone-bpair:hover,
.bet-zone.zone-bpair.active {
  background: rgba(20,184,166,0.2);
  border-color: var(--accent-teal);
  box-shadow: 0 0 15px rgba(20,184,166,0.5), inset 0 0 10px rgba(20,184,166,0.2);
  transform: scale(1.05);
}

.bet-zone.zone-ppair .zone-label,
.bet-zone.zone-bpair .zone-label {
  color: var(--accent-teal);
}

/* ===== CHIP TRAY ===== */

.chip-tray {
  background: rgba(45,27,105,0.4);
  border-radius: 8px;
  padding: 6px 4px;
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  justify-content: center;
}

.chip {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  border: 2px solid rgba(255,255,255,0.3);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.2);
  font-size: 13px;
  color: var(--text-white);
  user-select: none;
}

.chip-100 { background: linear-gradient(135deg, #22c55e, #16a34a); }
.chip-500 { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.chip-1000 { background: linear-gradient(135deg, #ef4444, #b91c1c); }
.chip-5000 { background: linear-gradient(135deg, #a855f7, #7c3aed); }
.chip-10000 { background: linear-gradient(135deg, #ffd700, #d4af37); color: #000; }

.chip:hover {
  transform: scale(1.1) translateY(-2px);
}

.chip.selected {
  transform: scale(1.2) translateY(-4px);
  box-shadow: 0 0 20px currentColor, 0 6px 12px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.2);
}

.chip-stack-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--primary);
  color: #000;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  border: 2px solid rgba(45,27,105,0.8);
}

/* ===== GAME CONTROLS ===== */

.game-controls {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  z-index: 150;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px;
  padding-bottom: max(6px, env(safe-area-inset-bottom));
  background: rgba(15,10,42,0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(212,175,55,0.3);
}

.game-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  background: rgba(26,17,69,0.95);
  backdrop-filter: blur(10px);
  border: 1px solid var(--primary);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 0 30px rgba(212,175,55,0.2);
}

.btn {
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.btn-cancel {
  background: rgba(239,68,68,0.2);
  color: var(--accent-red);
  border: 1px solid var(--accent-red);
}

.btn-cancel:hover {
  background: var(--accent-red);
  color: var(--text-white);
  box-shadow: 0 0 15px rgba(239,68,68,0.5);
}

.btn-rebet {
  background: rgba(0,180,216,0.2);
  color: var(--accent-blue);
  border: 1px solid var(--accent-blue);
}

.btn-rebet:hover {
  background: var(--accent-blue);
  color: var(--text-white);
  box-shadow: 0 0 15px rgba(0,180,216,0.5);
}

.btn-double {
  background: rgba(168,85,247,0.2);
  color: var(--accent-purple);
  border: 1px solid var(--accent-purple);
}

.btn-double:hover {
  background: var(--accent-purple);
  color: var(--text-white);
  box-shadow: 0 0 15px rgba(168,85,247,0.5);
}

.btn-deal {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, var(--primary-light), var(--primary));
  color: #000;
  border: 2px solid var(--primary);
  font-size: 14px;
}

.btn-deal:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 25px var(--neon-gold);
}

.btn-deal:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== RANKING SCREEN ===== */

.ranking-tabs {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--primary);
  background: rgba(26,17,69,0.8);
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid var(--primary);
  background: transparent;
  color: var(--text-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  font-size: 13px;
}

.tab-btn.active {
  background: var(--primary);
  color: #000;
  box-shadow: 0 0 15px var(--primary-glow);
}

.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 12px;
  padding: 16px;
  margin-bottom: 16px;
  background: rgba(45,27,105,0.6);
  border-radius: 16px;
  margin: 12px;
}

.podium-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.podium-rank {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #000;
  margin-bottom: 8px;
  font-size: 24px;
}

.podium-item:nth-child(1) .podium-rank {
  background: linear-gradient(135deg, #ffd700, #d4af37);
  width: 70px;
  height: 70px;
}

.podium-item:nth-child(2) .podium-rank {
  background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
  width: 60px;
  height: 60px;
}

.podium-item:nth-child(3) .podium-rank {
  background: linear-gradient(135deg, #b87333, #a0522d);
  width: 50px;
  height: 50px;
}

.podium-name {
  font-weight: 700;
  color: var(--text-light);
  font-size: 12px;
  margin-bottom: 4px;
}

.podium-score {
  color: var(--primary);
  font-weight: 700;
  font-size: 12px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 12px;
}

.ranking-item {
  background: rgba(45,27,105,0.8);
  border: 1px solid var(--primary);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s;
}

.ranking-item:hover {
  background: rgba(45,27,105,0.95);
  box-shadow: 0 0 15px rgba(212,175,55,0.2);
}

.ranking-rank {
  background: var(--primary);
  color: #000;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

.ranking-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ranking-name {
  font-weight: 700;
  color: var(--text-white);
  font-size: 13px;
}

.ranking-subtitle {
  color: var(--text-muted);
  font-size: 11px;
}

.ranking-score {
  color: var(--primary);
  font-weight: 700;
  font-size: 14px;
}

/* ===== SHOP SCREEN ===== */

.shop-tabs {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--primary);
  background: rgba(26,17,69,0.8);
  overflow-x: auto;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 12px;
}

.shop-item {
  background: rgba(45,27,105,0.8);
  border: 1px solid var(--primary);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  position: relative;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.shop-item:hover {
  background: rgba(45,27,105,0.95);
  border-color: var(--accent-blue);
  box-shadow: 0 0 15px rgba(0,180,216,0.3);
  transform: translateY(-4px);
}

.shop-item .emoji {
  font-size: 40px;
  margin-bottom: 8px;
}

.shop-item .name {
  font-weight: 700;
  color: var(--text-white);
  font-size: 12px;
  margin-bottom: 6px;
}

.shop-item .price {
  background: rgba(212,175,55,0.2);
  color: var(--primary);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.shop-item .status {
  font-size: 10px;
  font-weight: 700;
  margin-top: 6px;
  padding: 3px 6px;
  border-radius: 4px;
}

.shop-item .status.owned {
  background: rgba(34,197,94,0.3);
  color: var(--accent-green);
}

.shop-item .status.equipped {
  background: linear-gradient(135deg, rgba(212,175,55,0.3), rgba(255,215,0,0.3));
  color: var(--primary-light);
}

.shop-item .status.locked {
  background: rgba(94,109,122,0.3);
  color: var(--text-muted);
}

.shop-item.locked {
  opacity: 0.6;
}

.shop-item.locked::after {
  content: '🔒';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
}

/* ===== MISSION SCREEN ===== */

.mission-section {
  padding: 12px;
  margin-bottom: 12px;
}

.mission-title {
  color: var(--primary);
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.mission-item {
  background: rgba(45,27,105,0.8);
  border: 1px solid var(--accent-teal);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
  display: flex;
  gap: 12px;
}

.mission-item .emoji {
  font-size: 24px;
  flex-shrink: 0;
}

.mission-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mission-desc {
  color: var(--text-light);
  font-weight: 600;
  font-size: 12px;
}

.mission-progress {
  background: rgba(20,184,166,0.2);
  border-radius: 4px;
  height: 4px;
  overflow: hidden;
}

.mission-progress-bar {
  background: linear-gradient(90deg, var(--accent-teal), var(--accent-green));
  height: 100%;
  transition: width 0.3s;
  box-shadow: 0 0 8px rgba(20,184,166,0.5);
}

.mission-reward {
  color: var(--primary);
  font-weight: 700;
  font-size: 12px;
  text-align: right;
}

.achievement-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px;
}

.achievement-item {
  background: rgba(45,27,105,0.8);
  border: 1px solid var(--primary);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.achievement-item:hover {
  border-color: var(--accent-gold, #ffd700);
  box-shadow: 0 0 15px rgba(212,175,55,0.3);
}

.achievement-item.unlocked {
  border-color: var(--accent-gold, #ffd700);
}

.achievement-item.locked {
  opacity: 0.5;
}

.achievement-item .emoji {
  font-size: 36px;
  margin-bottom: 6px;
  filter: grayscale(1) brightness(0.6);
}

.achievement-item.unlocked .emoji {
  filter: none;
}

.achievement-item .name {
  color: var(--text-light);
  font-weight: 700;
  font-size: 11px;
}

/* ===== PROFILE SCREEN ===== */

.profile-section {
  padding: 16px;
  text-align: center;
}

.profile-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-teal));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  border: 3px solid var(--primary);
  margin: 0 auto 16px;
  box-shadow: 0 0 25px var(--primary-glow);
  animation: rotateRing 3s linear infinite;
}

.nickname-display {
  color: var(--text-white);
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 4px;
}

.level-display {
  background: linear-gradient(135deg, var(--primary), rgba(255,215,0,0.3));
  color: #000;
  padding: 6px 16px;
  border-radius: 16px;
  font-weight: 700;
  display: inline-block;
  margin-bottom: 16px;
  box-shadow: 0 0 15px var(--primary-glow);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: rgba(45,27,105,0.8);
  border: 1px solid var(--primary);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.stat-label {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 6px;
}

.stat-value {
  color: var(--primary-light);
  font-weight: 700;
  font-size: 18px;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-edit,
.btn-reset {
  padding: 12px 16px;
  border: 1px solid var(--primary);
  background: rgba(212,175,55,0.15);
  color: var(--primary-light);
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit:hover,
.btn-reset:hover {
  background: var(--primary);
  color: #000;
  box-shadow: 0 0 20px var(--primary-glow);
}

.btn-reset {
  border-color: var(--accent-red);
  background: rgba(239,68,68,0.15);
  color: var(--accent-red);
}

.btn-reset:hover {
  background: var(--accent-red);
  color: var(--text-white);
  box-shadow: 0 0 20px rgba(239,68,68,0.5);
}

/* ===== SETTINGS SCREEN ===== */

.settings-group {
  padding: 16px;
  border-bottom: 1px solid var(--primary);
}

.settings-title {
  color: var(--primary);
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.setting-label {
  color: var(--text-light);
  font-weight: 600;
  font-size: 13px;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: rgba(94,109,122,0.3);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(148,163,184,0.2);
}

.toggle-switch.active {
  background: var(--accent-green);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: var(--text-white);
  border-radius: 50%;
  transition: left 0.3s;
}

.toggle-switch.active .toggle-slider {
  left: 22px;
}

.select-control {
  background: rgba(45,27,105,0.8);
  border: 1px solid var(--primary);
  border-radius: 8px;
  color: var(--text-light);
  padding: 6px 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
}

.theme-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.theme-btn {
  padding: 10px;
  border: 2px solid transparent;
  background: rgba(45,27,105,0.8);
  color: var(--text-light);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.3s;
}

.theme-btn.active {
  border-color: var(--primary);
  background: rgba(212,175,55,0.15);
  color: var(--primary-light);
  box-shadow: 0 0 15px var(--primary-glow);
}

/* ===== TUTORIAL SCREEN ===== */

.tutorial-container {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tutorial-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.tutorial-step {
  display: none;
}

.tutorial-step.active {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.tutorial-emoji {
  font-size: 80px;
  margin-bottom: 12px;
}

.tutorial-title {
  color: var(--primary-light);
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 8px;
}

.tutorial-text {
  color: var(--text-light);
  font-size: 14px;
  line-height: 1.5;
  max-width: 300px;
}

.tutorial-dots {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin: 16px 0;
}

.tutorial-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(212,175,55,0.3);
  cursor: pointer;
  transition: all 0.3s;
}

.tutorial-dot.active {
  background: var(--primary);
  box-shadow: 0 0 10px var(--primary-glow);
  width: 20px;
  border-radius: 4px;
}

.tutorial-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 16px;
}

.tut-btn {
  padding: 10px 16px;
  border: 1px solid var(--primary);
  background: rgba(212,175,55,0.15);
  color: var(--primary-light);
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 12px;
}

.tut-btn:hover {
  background: var(--primary);
  color: #000;
  box-shadow: 0 0 15px var(--primary-glow);
}

/* ===== OVERLAY STYLES ===== */

.overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  display: none;
  align-items: flex-end;
  z-index: 500;
}

.overlay.active {
  display: flex;
}

.overlay-content {
  background: linear-gradient(180deg, #1a1145, #0f0a2a);
  border: 1px solid var(--primary);
  border-bottom: none;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 -4px 30px rgba(0,0,0,0.5), inset 0 2px 10px rgba(212,175,55,0.1);
}

.overlay-content::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  border-radius: 24px 24px 0 0;
}

.overlay-title {
  color: var(--primary-light);
  font-weight: 700;
  font-size: 16px;
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid rgba(212,175,55,0.2);
  letter-spacing: 1px;
}

.overlay-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  color: var(--primary);
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.overlay-close:hover {
  transform: rotate(90deg) scale(1.1);
  filter: drop-shadow(0 0 8px var(--primary-glow));
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* ===== ROOM PANEL ===== */

.room-creation {
  padding: 16px;
  border-bottom: 1px solid var(--primary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.form-label {
  color: var(--text-light);
  font-weight: 600;
  font-size: 12px;
}

.form-input {
  background: rgba(45,27,105,0.6);
  border: 1px solid var(--primary);
  border-radius: 8px;
  padding: 10px;
  color: var(--text-light);
  font-size: 13px;
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-blue);
  box-shadow: 0 0 10px rgba(0,180,216,0.3);
}

.btn-create {
  padding: 10px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px var(--neon-gold);
}

.room-list {
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.room-card {
  background: rgba(45,27,105,0.8);
  border: 1px solid var(--accent-blue);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.room-card:hover {
  background: rgba(45,27,105,0.95);
  border-color: var(--accent-teal);
  box-shadow: 0 0 15px rgba(0,180,216,0.3);
  transform: translateY(-2px);
}

.room-title {
  color: var(--text-white);
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 4px;
}

.room-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
}

/* ===== RESULT OVERLAY ===== */

.result-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 600;
}

.result-overlay.active {
  display: flex;
}

.result-content {
  background: linear-gradient(135deg, #1a1145, #0f0a2a);
  border: 2px solid var(--primary);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  max-width: 300px;
  animation: scaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 0 50px var(--primary-glow), inset 0 0 30px rgba(212,175,55,0.1);
}

.result-emoji {
  font-size: 80px;
  margin-bottom: 16px;
  animation: bounce 0.6s ease-out;
}

.result-text {
  color: var(--primary-light);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 12px;
  text-shadow: 0 0 15px var(--primary-glow);
}

.result-amount {
  color: var(--accent-green);
  font-weight: 700;
  font-size: 28px;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(34,197,94,0.5);
}

.btn-continue {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  border: none;
  border-radius: 10px;
  color: #000;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
}

.btn-continue:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px var(--neon-gold);
}

@keyframes scaleIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* ===== HISTORY & STATS PANELS ===== */

.history-list,
.stats-content {
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  background: rgba(45,27,105,0.8);
  border-left: 3px solid var(--primary);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.history-type {
  color: var(--text-light);
  font-weight: 600;
}

.history-amount {
  color: var(--accent-green);
  font-weight: 700;
}

.history-amount.loss {
  color: var(--accent-red);
}

/* ===== ROAD MAP STYLES ===== */

.big-road,
.bead-grid {
  background: rgba(45,27,105,0.6);
  border: 1px solid var(--primary);
  border-radius: 10px;
  padding: 12px;
  margin: 12px;
}

.big-road-grid,
.bead-cells {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  max-width: 100%;
}

.road-cell,
.bead-cell {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(94,109,122,0.3);
  border: 1px solid var(--primary);
}

.road-cell.player {
  background: var(--accent-blue);
  border-color: var(--accent-blue);
  box-shadow: 0 0 8px rgba(0,180,216,0.5);
}

.road-cell.banker {
  background: var(--accent-red);
  border-color: var(--accent-red);
  box-shadow: 0 0 8px rgba(239,68,68,0.5);
}

.road-cell.tie {
  background: var(--accent-green);
  border-color: var(--accent-green);
  box-shadow: 0 0 8px rgba(34,197,94,0.5);
}

/* ===== RESPONSIVE ===== */

@media (max-width: 480px) {
  .action-buttons,
  .quick-grid {
    margin: 12px;
  }

  .podium {
    gap: 8px;
  }

  .shop-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* ===== ANIMATIONS ===== */

@keyframes neonPulse {
  0%, 100% { text-shadow: 0 0 10px var(--primary-glow); }
  50% { text-shadow: 0 0 20px var(--primary-glow), 0 0 30px var(--primary-glow); }
}

@keyframes goldBurst {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes shakeX {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes celebrationBurst {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(3); opacity: 0; }
}

@keyframes rotateRing {
  from { filter: brightness(1) drop-shadow(0 0 20px rgba(212,175,55,0.8)); }
  to { filter: brightness(1.2) drop-shadow(0 0 30px rgba(212,175,55,1)); }
}

@keyframes chipBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes progressFill {
  from { width: 0; }
  to { width: var(--progress, 100%); }
}

@keyframes confettiDrop {
  0% { transform: translateY(-10px) rotateZ(0deg); opacity: 1; }
  100% { transform: translateY(600px) rotateZ(360deg); opacity: 0; }
}

@keyframes particleRise {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-100px) scale(0); opacity: 0; }
}

.bet-confirm-popup {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}
.bet-confirm-box {
  background: linear-gradient(135deg, #2d1b4e, #1a1335);
  border: 2px solid #d4af37;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  max-width: 300px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
.bet-confirm-title {
  color: #d4af37;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}
.bet-confirm-amount {
  color: #fff;
  font-size: 28px;
  font-weight: bold;
  margin: 12px 0;
}
.bet-confirm-zone {
  color: #00d9ff;
  font-size: 16px;
  margin-bottom: 20px;
}
.bet-confirm-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.bet-confirm-yes {
  background: linear-gradient(135deg, #d4af37, #b8941f);
  color: #0f0a2a;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
}
.bet-confirm-no {
  background: rgba(255,255,255,0.1);
  color: #e2e8f0;
  border: 1px solid rgba(255,255,255,0.2);
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
}
.bet-total-display {
  text-align: center;
  padding: 8px;
  color: #d4af37;
  font-weight: bold;
  font-size: 16px;
  min-height: 24px;
}
.room-confirm-popup {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}
.star-fly {
  position: fixed;
  font-size: 16px;
  z-index: 999;
  pointer-events: none;
  animation: starFlyAnim 0.8s ease-out forwards;
}
@keyframes starFlyAnim {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: translateY(60px) scale(0.3); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.dealer-dealing {
  animation: dealerDealAnim 0.6s ease-in-out;
}
@keyframes dealerDealAnim {
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  50% { transform: scale(1.15) rotate(5deg); }
  75% { transform: scale(1.1) rotate(-3deg); }
  100% { transform: scale(1) rotate(0deg); }
}
.chip-count-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0f0a2a;
}
`;


/* ============================================================================
   BOOT FUNCTION & HTML INITIALIZATION
   ============================================================================ */

function boot() {
  // Ensure mobile viewport
  if (!document.querySelector('meta[name="viewport"]')) {
    var vp = document.createElement('meta');
    vp.name = 'viewport';
    vp.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    document.head.appendChild(vp);
  }

  // Inject CSS
  var styleEl = document.createElement('style');
  styleEl.textContent = CSS_TEXT;
  document.head.appendChild(styleEl);
  
  // Create root container
  var root = document.createElement('div');
  root.id = 'kk-root';
  document.body.appendChild(root);
  
  // Initialize i18n system & Firebase
  ensureFirebaseInit();
  
  // Main HTML structure
  root.innerHTML = `
    <!-- ===== HOME SCREEN ===== -->
    <div class="screen sc-home active">
      <div class="top-bar">
        <div class="top-bar-left">
          <div class="title" style="font-family: serif;">FA Baccarat</div>
        </div>
        <div class="top-bar-right">
          <div class="stars-pill">
            <span class="emoji">⭐</span>
            <span id="stars-display">10000</span>
          </div>
          <button class="gear-btn" data-action="open-settings">⚙️</button>
        </div>
      </div>
      
      <div class="screen-content">
        <!-- Animated Background -->
        <div class="home-background">
          <div class="sparkle"></div>
          <div class="sparkle"></div>
          <div class="sparkle"></div>
          <div class="sparkle"></div>
          <div class="sparkle"></div>
          <div class="sparkle"></div>
          <div class="sparkle"></div>
          <div class="sparkle"></div>
        </div>
        
        <!-- Profile Mini -->
        <div class="profile-mini">
          <div class="avatar" id="home-avatar">😺</div>
          <div class="info">
            <div class="nickname" id="home-nickname">Player</div>
            <div class="level-badge" id="home-level">Level 1</div>
          </div>
        </div>
        
        <!-- Mascot Character Area -->
        <div class="home-mascot">
          <div class="mascot-character" style="width:80px;height:90px;">
            <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
              <ellipse cx="100" cy="75" rx="55" ry="50" fill="#5c3317"/>
              <ellipse cx="100" cy="85" rx="42" ry="40" fill="#fce4c8"/>
              <path d="M58 70 Q65 40 100 35 Q135 40 142 70 L138 55 Q130 45 100 40 Q70 45 62 55 Z" fill="#5c3317"/>
              <path d="M62 68 Q70 50 85 52 L80 68 Z" fill="#6b3a1f"/>
              <path d="M85 52 Q100 45 115 52 L110 68 Q100 58 90 68 Z" fill="#6b3a1f"/>
              <path d="M115 52 Q130 50 138 68 L132 68 Z" fill="#6b3a1f"/>
              <path d="M78 82 Q84 76 90 82" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
              <path d="M110 82 Q116 76 122 82" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
              <ellipse cx="75" cy="90" rx="8" ry="5" fill="rgba(255,150,150,0.4)"/>
              <ellipse cx="125" cy="90" rx="8" ry="5" fill="rgba(255,150,150,0.4)"/>
              <path d="M92 98 Q100 106 108 98" stroke="#d4627a" stroke-width="2" fill="none" stroke-linecap="round"/>
              <rect x="92" y="120" width="16" height="12" rx="4" fill="#fce4c8"/>
              <path d="M65 170 L70 132 Q85 128 100 128 Q115 128 130 132 L135 170 Z" fill="#1a1a2e"/>
              <path d="M80 132 Q90 128 100 128 Q110 128 120 132 L118 155 Q100 158 82 155 Z" fill="#fff"/>
              <path d="M80 132 L90 132 L88 155 L80 155 Z" fill="#1a1a2e"/>
              <path d="M110 132 L120 132 L120 155 L112 155 Z" fill="#1a1a2e"/>
              <path d="M96 132 L100 128 L104 132 L102 142 L100 145 L98 142 Z" fill="#d4af37"/>
              <ellipse cx="60" cy="165" rx="12" ry="8" fill="#fce4c8" transform="rotate(-15, 60, 165)"/>
              <ellipse cx="140" cy="165" rx="12" ry="8" fill="#fce4c8" transform="rotate(15, 140, 165)"/>
            </svg>
          </div>
          <div class="mascot-cards">
            <div class="mascot-card">A♥</div>
            <div class="mascot-card">K♠</div>
            <div class="mascot-card">Q♦</div>
          </div>
          <div class="mascot-sparkles">
            <div class="mascot-sparkle"></div>
            <div class="mascot-sparkle"></div>
            <div class="mascot-sparkle"></div>
            <div class="mascot-sparkle"></div>
            <div class="mascot-sparkle"></div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="action-buttons" style="display:flex;gap:10px;padding:8px 0;">
          <button data-action="play-ai" style="flex:1;background:linear-gradient(135deg,#1a3a5c,#0d2137);border:2px solid #00b4d8;border-radius:14px;padding:18px 12px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 0 20px rgba(0,180,216,0.2),inset 0 1px 0 rgba(255,255,255,0.1);">
            <div style="font-size:32px;filter:drop-shadow(0 0 8px rgba(0,180,216,0.5));">🎰</div>
            <div style="color:#00b4d8;font-weight:800;font-size:13px;letter-spacing:0.5px;" data-i18n="play_vs_dealer">Play vs Dealer</div>
            <div style="position:absolute;top:6px;right:8px;background:#00b4d8;color:#fff;font-size:9px;padding:2px 6px;border-radius:8px;font-weight:700;">AI</div>
          </button>
          <button data-action="play-online" style="flex:1;background:linear-gradient(135deg,#3a1a4e,#210d37);border:2px solid #a855f7;border-radius:14px;padding:18px 12px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 0 20px rgba(168,85,247,0.2),inset 0 1px 0 rgba(255,255,255,0.1);">
            <div style="font-size:32px;filter:drop-shadow(0 0 8px rgba(168,85,247,0.5));">🌐</div>
            <div style="color:#a855f7;font-weight:800;font-size:13px;letter-spacing:0.5px;" data-i18n="online_table">Online Table</div>
            <div style="position:absolute;top:6px;right:8px;background:#a855f7;color:#fff;font-size:9px;padding:2px 6px;border-radius:8px;font-weight:700;">LIVE</div>
          </button>
        </div>
        
        <!-- Session Summary -->
        <div class="session-summary">
          <div class="title" data-i18n="session_summary">Session Summary</div>
          <div class="session-summary-grid">
            <div class="summary-item">
              <div class="label" data-i18n="hands_played">Hands Played</div>
              <div class="value" id="session-hands">0</div>
            </div>
            <div class="summary-item">
              <div class="label" data-i18n="net_profit">Net Profit</div>
              <div class="value" id="session-profit">0</div>
            </div>
          </div>
        </div>
        
        <!-- Quick Grid -->
        <div class="quick-grid">
          <div class="quick-item" data-action="open-history">
            <div class="emoji">📋</div>
            <div class="label" data-i18n="history">History</div>
          </div>
          <div class="quick-item" data-action="open-stats">
            <div class="emoji">📊</div>
            <div class="label" data-i18n="statistics">Statistics</div>
          </div>
          <div class="quick-item" data-action="open-tutorial">
            <div class="emoji">📖</div>
            <div class="label" data-i18n="tutorial">Tutorial</div>
          </div>
          <div class="quick-item" data-action="roadmap">
            <div class="emoji">🗺️</div>
            <div class="label" data-i18n="road_map">Road Map</div>
          </div>
        </div>
      </div>
      
      <!-- Bottom Navigation -->
      <div class="bottom-nav">
        <div class="nav-item active" data-nav="home">
          <div class="emoji">🏠</div>
          <div data-i18n="home">Home</div>
        </div>
        <div class="nav-item" data-nav="ranking">
          <div class="emoji">🏆</div>
          <div data-i18n="ranking">Ranking</div>
        </div>
        <div class="nav-item" data-nav="shop">
          <div class="emoji">🛍️</div>
          <div data-i18n="shop">Shop</div>
        </div>
        <div class="nav-item" data-nav="mission">
          <div class="emoji">⚡</div>
          <div data-i18n="mission">Mission</div>
        </div>
        <div class="nav-item" data-nav="profile">
          <div class="emoji">👤</div>
          <div data-i18n="profile">Profile</div>
        </div>
      </div>
    </div>
    
    <!-- ===== GAME SCREEN ===== -->
    <div class="screen sc-game">
      <div class="top-bar">
        <div class="top-bar-left">
          <button class="back-btn" data-action="back-to-home">←</button>
          <div style="display:flex; flex-direction:column; gap:2px;">
            <div class="subtitle" id="round-info" data-i18n="round">Round 1</div>
            <div class="subtitle" id="shoe-info" data-i18n="shoe_info">cards left</div>
          </div>
        </div>
        <div class="top-bar-right">
          <div class="stars-pill">
            <span class="emoji">⭐</span>
            <span id="game-stars">10000</span>
          </div>
        </div>
      </div>
      
      <div class="screen-content" style="padding-bottom: 200px;">
        <!-- Dealer Section -->
        <div class="dealer-section" style="text-align:center;padding:4px 0;display:flex;flex-direction:column;align-items:center;">
          <div class="dealer-avatar" id="dealer-avatar" style="width:80px;height:auto;margin:0 auto;">
            <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;">
              <!-- Hair back -->
              <ellipse cx="100" cy="75" rx="55" ry="50" fill="#5c3317"/>
              <!-- Face -->
              <ellipse cx="100" cy="85" rx="42" ry="40" fill="#fce4c8"/>
              <!-- Hair front -->
              <path d="M58 70 Q65 40 100 35 Q135 40 142 70 L138 55 Q130 45 100 40 Q70 45 62 55 Z" fill="#5c3317"/>
              <!-- Hair bangs -->
              <path d="M62 68 Q70 50 85 52 L80 68 Z" fill="#6b3a1f"/>
              <path d="M85 52 Q100 45 115 52 L110 68 Q100 58 90 68 Z" fill="#6b3a1f"/>
              <path d="M115 52 Q130 50 138 68 L132 68 Z" fill="#6b3a1f"/>
              <!-- Eyes closed (happy) -->
              <path d="M78 82 Q84 76 90 82" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
              <path d="M110 82 Q116 76 122 82" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
              <!-- Blush -->
              <ellipse cx="75" cy="90" rx="8" ry="5" fill="rgba(255,150,150,0.4)"/>
              <ellipse cx="125" cy="90" rx="8" ry="5" fill="rgba(255,150,150,0.4)"/>
              <!-- Mouth smile -->
              <path d="M92 98 Q100 106 108 98" stroke="#d4627a" stroke-width="2" fill="none" stroke-linecap="round"/>
              <!-- Neck -->
              <rect x="92" y="120" width="16" height="12" rx="4" fill="#fce4c8"/>
              <!-- Body / Vest -->
              <path d="M65 170 L70 132 Q85 128 100 128 Q115 128 130 132 L135 170 Z" fill="#1a1a2e"/>
              <!-- White shirt -->
              <path d="M80 132 Q90 128 100 128 Q110 128 120 132 L118 155 Q100 158 82 155 Z" fill="#fff"/>
              <!-- Vest lapels -->
              <path d="M80 132 L90 132 L88 155 L80 155 Z" fill="#1a1a2e"/>
              <path d="M110 132 L120 132 L120 155 L112 155 Z" fill="#1a1a2e"/>
              <!-- Tie/Ribbon -->
              <path d="M96 132 L100 128 L104 132 L102 142 L100 145 L98 142 Z" fill="#d4af37"/>
              <!-- Name tag -->
              <rect x="82" y="148" width="36" height="12" rx="3" fill="#d4af37"/>
              <text x="100" y="157" text-anchor="middle" font-size="7" fill="#1a1a2e" font-weight="bold">DEALER</text>
              <!-- Hands (dealing pose) -->
              <ellipse cx="60" cy="165" rx="12" ry="8" fill="#fce4c8" transform="rotate(-15, 60, 165)"/>
              <ellipse cx="140" cy="165" rx="12" ry="8" fill="#fce4c8" transform="rotate(15, 140, 165)"/>
              <!-- Card in hand -->
              <rect x="132" y="152" width="18" height="24" rx="2" fill="#fff" stroke="#ccc" stroke-width="0.5" transform="rotate(10, 141, 164)"/>
              <text x="141" y="167" text-anchor="middle" font-size="8" fill="#dc2626" transform="rotate(10, 141, 164)">♥</text>
            </svg>
          </div>
          <div class="dealer-name" data-i18n="dealer" style="color:#d4af37;font-weight:700;font-size:13px;margin-top:2px;display:none;">Dealer</div>
        </div>
        
        <!-- Card Display Area -->
        <div class="card-display-area">
          <div class="player-side">
            <div class="label" data-i18n="player">PLAYER</div>
            <div class="card-slots" id="player-cards"></div>
            <div class="score-display" id="player-score">0</div>
          </div>
          
          <div class="vs-center">
            <div class="vs-text" data-i18n="app_title">FA</div>
            <div class="result-banner" id="result-banner" style="display:none;"></div>
          </div>
          
          <div class="banker-side">
            <div class="label" data-i18n="banker">BANKER</div>
            <div class="card-slots" id="banker-cards"></div>
            <div class="score-display" id="banker-score">0</div>
          </div>
        </div>
        
        <!-- AI Players Row -->
        <div class="ai-players-row" id="ai-players-row"></div>
        
        <!-- Betting Table -->
        <div class="bet-table">
          <div class="bet-zone zone-ppair" data-action="bet-ppair">
            <div class="zone-multiplier">x11</div>
            <div class="zone-label" data-i18n="ppair">P.PAIR</div>
            <div class="zone-bet-amount" id="bet-ppair-amt"></div>
          </div>
          <div class="bet-zone zone-player" data-action="bet-player">
            <div class="zone-multiplier">x1</div>
            <div class="zone-label" data-i18n="player">PLAYER</div>
            <div class="zone-bet-amount" id="bet-player-amt"></div>
          </div>
          <div class="bet-zone zone-tie" data-action="bet-tie">
            <div class="zone-multiplier">x8</div>
            <div class="zone-label" data-i18n="tie">TIE</div>
            <div class="zone-bet-amount" id="bet-tie-amt"></div>
          </div>
          <div class="bet-zone zone-banker" data-action="bet-banker">
            <div class="zone-multiplier">x0.95</div>
            <div class="zone-label" data-i18n="banker">BANKER</div>
            <div class="zone-bet-amount" id="bet-banker-amt"></div>
          </div>
          <div class="bet-zone zone-bpair" data-action="bet-bpair">
            <div class="zone-multiplier">x11</div>
            <div class="zone-label" data-i18n="bpair">B.PAIR</div>
            <div class="zone-bet-amount" id="bet-bpair-amt"></div>
          </div>
        </div>
        
        <!-- Mini Road Map -->
        <div style="padding:12px; color:var(--text-muted); font-size:11px;">
          <div style="margin-bottom:8px; font-weight:700; color:var(--primary);">Latest Results</div>
          <div id="mini-roadmap" style="display:flex; gap:4px; flex-wrap:wrap;"></div>
        </div>
      </div>
      
      <!-- Game Controls (Fixed) -->
      <div class="game-controls">
        <div class="bet-total-display" id="bet-total-display"></div>
        <!-- Chip Tray -->
        <div class="chip-tray" id="chip-tray"></div>

        <!-- Action Buttons -->
        <div class="game-actions" style="display:flex;gap:8px;padding:8px 16px;">
          <button class="btn btn-cancel" data-action="clear-bet" style="flex:1;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#e2e8f0;padding:12px;border-radius:8px;font-weight:bold;cursor:pointer;">Clear</button>
          <button class="btn btn-deal" id="btn-deal" data-action="confirm-bet" style="flex:2;background:linear-gradient(135deg,#d4af37,#b8941f);border:none;color:#0f0a2a;padding:12px;border-radius:8px;font-weight:bold;font-size:16px;cursor:pointer;">BET</button>
        </div>
      </div>
    </div>
    
    <!-- ===== RANKING SCREEN ===== -->
    <div class="screen sc-ranking">
      <div class="top-bar">
        <div class="title" style="font-family: serif;" data-i18n="ranking">Ranking</div>
      </div>
      
      <div style="padding:12px 16px;color:#d4af37;font-weight:bold;font-size:16px;text-align:center;">All-Time Ranking</div>
      
      <div class="screen-content">
        <div class="podium" id="ranking-podium"></div>
        <div class="ranking-list" id="ranking-list"></div>
      </div>
      
      <div class="bottom-nav">
        <div class="nav-item" data-nav="home">
          <div class="emoji">🏠</div>
          <div data-i18n="home">Home</div>
        </div>
        <div class="nav-item active" data-nav="ranking">
          <div class="emoji">🏆</div>
          <div data-i18n="ranking">Ranking</div>
        </div>
        <div class="nav-item" data-nav="shop">
          <div class="emoji">🛍️</div>
          <div data-i18n="shop">Shop</div>
        </div>
        <div class="nav-item" data-nav="mission">
          <div class="emoji">⚡</div>
          <div data-i18n="mission">Mission</div>
        </div>
        <div class="nav-item" data-nav="profile">
          <div class="emoji">👤</div>
          <div data-i18n="profile">Profile</div>
        </div>
      </div>
    </div>
    
    <!-- ===== SHOP SCREEN ===== -->
    <div class="screen sc-shop">
      <div class="top-bar">
        <div class="title" style="font-family: serif;" data-i18n="shop">Shop</div>
        <div class="stars-pill">
          <span class="emoji">⭐</span>
          <span id="shop-stars">10000</span>
        </div>
      </div>
      
      <div class="shop-tabs">
        <button class="tab-btn active" data-shop-tab="avatars" data-i18n="avatars">Avatars</button>
        <button class="tab-btn" data-shop-tab="tables" data-i18n="tables">Tables</button>
        <button class="tab-btn" data-shop-tab="cardbacks" data-i18n="cardbacks">Card Backs</button>
        <button class="tab-btn" data-shop-tab="effects" data-i18n="effects">Effects</button>
      </div>
      
      <div class="screen-content">
        <div class="shop-grid" id="shop-grid"></div>
      </div>
      
      <div class="bottom-nav">
        <div class="nav-item" data-nav="home">
          <div class="emoji">🏠</div>
          <div data-i18n="home">Home</div>
        </div>
        <div class="nav-item" data-nav="ranking">
          <div class="emoji">🏆</div>
          <div data-i18n="ranking">Ranking</div>
        </div>
        <div class="nav-item active" data-nav="shop">
          <div class="emoji">🛍️</div>
          <div data-i18n="shop">Shop</div>
        </div>
        <div class="nav-item" data-nav="mission">
          <div class="emoji">⚡</div>
          <div data-i18n="mission">Mission</div>
        </div>
        <div class="nav-item" data-nav="profile">
          <div class="emoji">👤</div>
          <div data-i18n="profile">Profile</div>
        </div>
      </div>
    </div>
    
    <!-- ===== MISSION SCREEN ===== -->
    <div class="screen sc-mission">
      <div class="top-bar">
        <div class="title" style="font-family: serif;" data-i18n="mission">Mission</div>
      </div>
      
      <div class="screen-content">
        <!-- Daily Missions -->
        <div class="mission-section">
          <div class="mission-title">Daily Missions</div>
          <div id="daily-missions"></div>
        </div>
        
        <!-- Achievements -->
        <div class="mission-section">
          <div class="mission-title">Achievements</div>
          <div class="achievement-list" id="achievement-list"></div>
        </div>
      </div>
      
      <div class="bottom-nav">
        <div class="nav-item" data-nav="home">
          <div class="emoji">🏠</div>
          <div data-i18n="home">Home</div>
        </div>
        <div class="nav-item" data-nav="ranking">
          <div class="emoji">🏆</div>
          <div data-i18n="ranking">Ranking</div>
        </div>
        <div class="nav-item" data-nav="shop">
          <div class="emoji">🛍️</div>
          <div data-i18n="shop">Shop</div>
        </div>
        <div class="nav-item active" data-nav="mission">
          <div class="emoji">⚡</div>
          <div data-i18n="mission">Mission</div>
        </div>
        <div class="nav-item" data-nav="profile">
          <div class="emoji">👤</div>
          <div data-i18n="profile">Profile</div>
        </div>
      </div>
    </div>
    
    <!-- ===== PROFILE SCREEN ===== -->
    <div class="screen sc-profile">
      <div class="top-bar">
        <div class="title" style="font-family: serif;" data-i18n="profile">Profile</div>
      </div>
      
      <div class="screen-content">
        <div class="profile-section">
          <div class="profile-avatar-large" id="profile-avatar">😺</div>
          <div class="nickname-display" id="profile-nickname">Player</div>
          <div style="display:flex;gap:8px;margin:8px 0;max-width:240px;">
            <input type="text" id="nickname-input" placeholder="Nickname" maxlength="20" style="flex:1;padding:6px 10px;background:rgba(255,255,255,0.08);border:1px solid rgba(212,175,55,0.3);border-radius:8px;color:#e2e8f0;font-size:13px;">
            <button class="btn-small" data-action="save-nickname" data-i18n="save" style="padding:6px 12px;background:linear-gradient(135deg,#d4af37,#b8941f);border:none;border-radius:8px;color:#0f0a2a;font-weight:700;font-size:12px;cursor:pointer;">Save</button>
          </div>
          <div class="level-display" id="profile-level">Level 1</div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label" data-i18n="total_games">Total Games</div>
              <div class="stat-value" id="stat-games">0</div>
            </div>
            <div class="stat-card">
              <div class="stat-label" data-i18n="total_wins">Total Wins</div>
              <div class="stat-value" id="stat-wins">0</div>
            </div>
            <div class="stat-card">
              <div class="stat-label" data-i18n="win_rate">Win Rate</div>
              <div class="stat-value" id="stat-rate">0%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label" data-i18n="best_streak">Best Streak</div>
              <div class="stat-value" id="stat-streak">0</div>
            </div>
            <div class="stat-card">
              <div class="stat-label" data-i18n="peak_stars">Peak Stars</div>
              <div class="stat-value" id="stat-peak">10000</div>
            </div>
            <div class="stat-card">
              <div class="stat-label" data-i18n="current_stars">Current Stars</div>
              <div class="stat-value" id="stat-current">10000</div>
            </div>
          </div>
          
          <div class="profile-actions">
            <button class="btn-edit" data-action="save-nickname" data-i18n="edit_profile">Edit Profile</button>
            <button class="btn-reset" data-action="reset-stats" data-i18n="reset_stats">Reset Stats</button>
          </div>
        </div>
      </div>
      
      <div class="bottom-nav">
        <div class="nav-item" data-nav="home">
          <div class="emoji">🏠</div>
          <div data-i18n="home">Home</div>
        </div>
        <div class="nav-item" data-nav="ranking">
          <div class="emoji">🏆</div>
          <div data-i18n="ranking">Ranking</div>
        </div>
        <div class="nav-item" data-nav="shop">
          <div class="emoji">🛍️</div>
          <div data-i18n="shop">Shop</div>
        </div>
        <div class="nav-item" data-nav="mission">
          <div class="emoji">⚡</div>
          <div data-i18n="mission">Mission</div>
        </div>
        <div class="nav-item active" data-nav="profile">
          <div class="emoji">👤</div>
          <div data-i18n="profile">Profile</div>
        </div>
      </div>
    </div>
    
    <!-- ===== SETTINGS SCREEN ===== -->
    <div class="screen sc-settings">
      <div class="top-bar">
        <button class="back-btn" data-action="settings-back">←</button>
        <div class="title" style="font-family: serif;" data-i18n="settings">Settings</div>
      </div>
      
      <div class="screen-content">
        <!-- Game Settings -->
        <div class="settings-group">
          <div class="settings-title" data-i18n="app_title">GAME</div>
          
          <div class="setting-item">
            <div class="setting-label" data-i18n="sound">Sound</div>
            <div class="toggle-switch" id="toggle-sound" data-setting="sound">
              <div class="toggle-slider"></div>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label" data-i18n="vibration">Vibration</div>
            <div class="toggle-switch" id="toggle-vibrate" data-setting="vibrate">
              <div class="toggle-slider"></div>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label" data-i18n="notifications">Notifications</div>
            <div class="toggle-switch" id="toggle-notif" data-setting="notif">
              <div class="toggle-slider"></div>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label" data-i18n="auto_deal">Auto Deal</div>
            <div class="toggle-switch" id="toggle-autodeal" data-setting="autodeal">
              <div class="toggle-slider"></div>
            </div>
          </div>
        </div>
        
        <!-- Personalization -->
        <div class="settings-group">
          <div class="settings-title" data-i18n="app_title">PERSONALIZATION</div>
          
          <div class="setting-item">
            <div class="setting-label" data-i18n="language">Language</div>
            <select class="select-control" id="lang-select" data-action="change-lang">
              <option value="en">English</option>
              <option value="ko">한국어</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
              <option value="vi">Tiếng Việt</option>
              <option value="th">ไทย</option>
              <option value="id">Bahasa Indonesia</option>
            </select>
          </div>
          
          <div class="setting-item">
            <div class="setting-label" data-i18n="speed">Game Speed</div>
            <select class="select-control" id="speed-select" data-action="change-speed">
              <option value="slow">Slow</option>
              <option value="normal" selected>Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>
        </div>
        
        <!-- Theme -->
        <div class="settings-group">
          <div class="settings-title" data-i18n="theme">THEME</div>
          <div class="theme-buttons" id="theme-buttons">
            <button class="theme-btn active" data-theme="dark">Dark</button>
            <button class="theme-btn" data-theme="light">Light</button>
            <button class="theme-btn" data-theme="classic">Classic</button>
            <button class="theme-btn" data-theme="modern">Modern</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- ===== TUTORIAL SCREEN ===== -->
    <div class="screen sc-tutorial">
      <div class="top-bar">
        <button class="back-btn" data-action="tutorial-back">←</button>
        <div class="title" style="font-family: serif;" data-i18n="tutorial">Tutorial</div>
      </div>
      
      <div class="tutorial-container">
        <div class="tutorial-content">
          <div class="tutorial-step active" data-tutorial-step="0">
            <div class="tutorial-emoji">🎯</div>
            <div class="tutorial-title" data-i18n="tut_step1">Welcome to Baccarat</div>
            <div class="tutorial-text" data-i18n="tut_step1_desc">The goal is to bet on Player, Banker, or Tie. Cards closer to 9 wins!</div>
          </div>
          
          <div class="tutorial-step" data-tutorial-step="1">
            <div class="tutorial-emoji">😺</div>
            <div class="tutorial-title" data-i18n="tut_step2">Card Values</div>
            <div class="tutorial-text" data-i18n="tut_step2_desc">Ace=1, 2-9=face value, 10/J/Q/K=0. Only last digit counts.</div>
          </div>
          
          <div class="tutorial-step" data-tutorial-step="2">
            <div class="tutorial-emoji">💰</div>
            <div class="tutorial-title" data-i18n="tut_step3">How to Bet</div>
            <div class="tutorial-text" data-i18n="tut_step3_desc">Select a chip value, tap a betting zone, then deal to play.</div>
          </div>
          
          <div class="tutorial-step" data-tutorial-step="3">
            <div class="tutorial-emoji">📋</div>
            <div class="tutorial-title" data-i18n="tut_step4">Game Rules</div>
            <div class="tutorial-text" data-i18n="tut_step4_desc">Each gets 2 cards. Total closest to 9 wins. Ties pay 8:1.</div>
          </div>
          
          <div class="tutorial-step" data-tutorial-step="4">
            <div class="tutorial-emoji">🎓</div>
            <div class="tutorial-title" data-i18n="tut_step5">Winning Tips</div>
            <div class="tutorial-text" data-i18n="tut_step5_desc">Banker has slight advantage. Watch the shoe for patterns.</div>
          </div>
          
          <div class="tutorial-step" data-tutorial-step="5">
            <div class="tutorial-emoji">👯</div>
            <div class="tutorial-title" data-i18n="tut_step6">Pair Bets</div>
            <div class="tutorial-text" data-i18n="tut_step6_desc">Bet on Player or Banker getting a pair. Pays 11:1.</div>
          </div>
          
          <div class="tutorial-step" data-tutorial-step="6">
            <div class="tutorial-emoji">🗺️</div>
            <div class="tutorial-title" data-i18n="tut_step7">Road Patterns</div>
            <div class="tutorial-text" data-i18n="tut_step7_desc">Track results with Big Road and Bead Plate patterns.</div>
          </div>
          
          <div class="tutorial-step" data-tutorial-step="7">
            <div class="tutorial-emoji">⭐</div>
            <div class="tutorial-title" data-i18n="tut_step8">Pro Tips</div>
            <div class="tutorial-text" data-i18n="tut_step8_desc">Manage bankroll. Never chase losses. Enjoy the game!</div>
          </div>
        </div>
        
        <div class="tutorial-dots" id="tutorial-dots">
          <div class="tutorial-dot active" data-step="0"></div>
          <div class="tutorial-dot" data-step="1"></div>
          <div class="tutorial-dot" data-step="2"></div>
          <div class="tutorial-dot" data-step="3"></div>
          <div class="tutorial-dot" data-step="4"></div>
          <div class="tutorial-dot" data-step="5"></div>
          <div class="tutorial-dot" data-step="6"></div>
          <div class="tutorial-dot" data-step="7"></div>
        </div>
        
        <div class="tutorial-buttons">
          <button class="tut-btn" id="tut-prev" data-i18n="prev" style="display:none;">Prev</button>
          <button class="tut-btn" id="tut-next" data-i18n="next">Next</button>
          <button class="tut-btn" id="tut-finish" data-i18n="finish" style="display:none;">Finish</button>
        </div>
      </div>
    </div>
    
    <!-- ===== OVERLAYS ===== -->
    
    <!-- Room Panel -->
    <div class="overlay" id="room-panel">
      <div class="overlay-content">
        <button class="overlay-close" data-action="close-overlay">✕</button>
        <div class="overlay-title" data-i18n="online_table">Online Table</div>
        
        <div class="room-creation">
          <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;" data-i18n="create_room">Create Room</div>
          <div class="form-group">
            <label class="form-label" data-i18n="room_title">Room Title</label>
            <input class="form-input" id="room-title-input" type="text" placeholder="My Table" data-i18n-placeholder="enter_room_title">
          </div>
          <div class="form-group">
            <label class="form-label" data-i18n="wager_amount">Wager</label>
            <input class="form-input" id="wager-input" type="number" value="1000" min="100" max="50000">
          </div>
          <button class="btn-create" id="btn-create-room" data-action="create-room">Create</button>
        </div>
        
        <div class="room-list-section" style="padding:12px; border-top:1px solid var(--primary);">
          <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;" data-i18n="room_list">Available Rooms</div>
          <div id="room-list" class="room-list"></div>
          <div id="no-rooms" style="color:var(--text-muted); font-size:12px; text-align:center; padding:20px;" data-i18n="no_rooms_available">No rooms available</div>
        </div>
      </div>
    </div>
    
    <!-- Result Overlay -->
    <div class="result-overlay" id="result-overlay">
      <div class="result-content">
        <div class="result-emoji" id="result-emoji">🎉</div>
        <div class="result-text" id="result-text">WIN</div>
        <div class="result-amount" id="result-amount">+1000</div>
        <button class="btn-continue" data-action="close-result" data-i18n="next">Continue</button>
      </div>
    </div>
    
    <!-- History Panel -->
    <div class="overlay" id="history-panel">
      <div class="overlay-content">
        <button class="overlay-close" data-action="close-overlay">✕</button>
        <div class="overlay-title" data-i18n="history">History</div>
        <div class="history-list" id="history-list"></div>
      </div>
    </div>
    
    <!-- Stats Panel -->
    <div class="overlay" id="stats-panel">
      <div class="overlay-content">
        <button class="overlay-close" data-action="close-overlay">✕</button>
        <div class="overlay-title" data-i18n="statistics">Statistics</div>
        <div class="stats-content" id="stats-content"></div>
      </div>
    </div>
    
    <!-- Road Map Panel -->
    <div class="overlay" id="roadmap-panel">
      <div class="overlay-content">
        <button class="overlay-close" data-action="close-overlay">✕</button>
        <div class="overlay-title" data-i18n="road_map">Road Map</div>
        
        <div class="big-road">
          <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;" data-i18n="big_road">Big Road</div>
          <div class="big-road-grid" id="big-road"></div>
        </div>
        
        <div class="bead-grid">
          <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;" data-i18n="bead_plate">Bead Plate</div>
          <div class="bead-cells" id="bead-cells"></div>
        </div>
        
        <div style="padding:12px; text-align:center; font-size:12px; color:var(--text-muted);">
          <div id="roadmap-cards-left"></div>
        </div>
      </div>
    </div>
    
    <!-- Bet Confirmation Popup -->
    <div class="bet-confirm-popup" id="bet-confirm-popup" style="display:none;">
      <div class="bet-confirm-box">
        <div class="bet-confirm-title" data-i18n="confirm_bet">Confirm Bet</div>
        <div class="bet-confirm-amount" id="confirm-bet-amount">0</div>
        <div class="bet-confirm-zone" id="confirm-bet-zone"></div>
        <div class="bet-confirm-buttons">
          <button class="bet-confirm-no" data-action="cancel-confirm">Cancel</button>
          <button class="bet-confirm-yes" data-action="do-deal">Confirm</button>
        </div>
      </div>
    </div>

    <!-- Room Confirm Popup -->
    <div class="room-confirm-popup" id="room-enter-popup" style="display:none;">
      <div class="bet-confirm-box">
        <div class="bet-confirm-title">Enter Room</div>
        <div style="color:#e2e8f0;margin:16px 0;font-size:15px;" id="room-enter-msg">Enter this room?</div>
        <div class="bet-confirm-buttons">
          <button class="bet-confirm-no" data-action="cancel-room-enter">Cancel</button>
          <button class="bet-confirm-yes" data-action="confirm-room-enter">Enter</button>
        </div>
      </div>
    </div>

    <!-- Room Exit Popup -->
    <div class="room-confirm-popup" id="room-exit-popup" style="display:none;">
      <div class="bet-confirm-box">
        <div class="bet-confirm-title">Leave Room</div>
        <div style="color:#e2e8f0;margin:16px 0;font-size:15px;">Do you want to leave this room?</div>
        <div class="bet-confirm-buttons">
          <button class="bet-confirm-no" data-action="cancel-room-exit">Stay</button>
          <button class="bet-confirm-yes" data-action="confirm-room-exit">Leave</button>
        </div>
      </div>
    </div>

    <!-- Containers for dynamic content -->
    <div id="toast-container" style="position:fixed; bottom:100px; left:0; right:0; pointer-events:none; z-index:700;"></div>
    <div id="confetti-container" style="position:fixed; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:400;"></div>
    <div id="particle-container" style="position:fixed; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:300;"></div>
  `;

}

// ============================================================================
// SECTION 5: State & Persistence (~250 lines)
// ============================================================================

let lang = 'en';
let profile, settings, shopData, gameState, dailyMission, onlineState;
let tutorialStep = 0;
let sessionStats = { handsPlayed: 0, netProfit: 0, biggestWin: 0, startTime: 0 };
let currentShoe = [];
let shoePosition = 0;
let gameHistory = [];
let audioContext = null;
let lastBet = null;

function t(key) {
  if (!I18N[lang] || !I18N[lang][key]) {
    if (!I18N['en'] || !I18N['en'][key]) {
      return key;
    }
    return I18N['en'][key];
  }
  return I18N[lang][key];
}

function applyI18n() {
  const els = document.querySelectorAll('[data-i18n]');
  els.forEach(function(el) {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (el.tagName === 'INPUT' && el.type === 'placeholder') {
      el.placeholder = translated;
    } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.value = translated;
    } else {
      el.textContent = translated;
    }
  });
}

function loadProfile() {
  const stored = localStorage.getItem('bac_profile_v2');
  if (stored) {
    profile = JSON.parse(stored);
  } else {
    profile = {
      userId: 'user_' + Math.random().toString(36).substr(2, 9),
      nickname: 'Player' + Math.floor(Math.random() * 9000 + 1000),
      avatar: 'default',
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
      pairWins: 0,
      todayGames: 0,
      todayWins: 0,
      todayTotalBet: 0,
      todayStreak: 0,
      todayBankerBets: 0,
      todayTieBets: 0,
      lastCheckinDate: null,
      unlockedAchievements: [],
      completedMissions: [],
      lastWeeklyReset: Date.now()
    };
    saveProfile();
  }
}

function saveProfile() {
  localStorage.setItem('bac_profile_v2', JSON.stringify(profile));
}

function loadSettings() {
  const stored = localStorage.getItem('bac_settings_v2');
  if (stored) {
    settings = JSON.parse(stored);
  } else {
    settings = {
      sound: true,
      vibration: true,
      notifications: true,
      autodeal: false,
      language: 'en',
      theme: 'dark',
      speed: 'normal'
    };
    saveSettings();
  }
}

function saveSettings() {
  localStorage.setItem('bac_settings_v2', JSON.stringify(settings));
}

function loadShopData() {
  const stored = localStorage.getItem('bac_shop_v2');
  if (stored) {
    shopData = JSON.parse(stored);
  } else {
    shopData = {
      owned: { avatars: [], tables: [], cardbacks: [], effects: [] },
      equipped: { avatars: 'default', tables: 'default', cardbacks: 'default', effects: 'none' }
    };
    saveShopData();
  }
}

function saveShopData() {
  localStorage.setItem('bac_shop_v2', JSON.stringify(shopData));
}

function loadDailyMission() {
  const stored = localStorage.getItem('bac_daily_mission_v2');
  const today = getDayKey();
  if (stored) {
    const data = JSON.parse(stored);
    if (data.date !== today) {
      resetDailyMissions();
    } else {
      dailyMission = data;
    }
  } else {
    resetDailyMissions();
  }
}

function saveDailyMission() {
  const data = {
    date: getDayKey(),
    missions: dailyMission
  };
  localStorage.setItem('bac_daily_mission_v2', JSON.stringify(data));
}

function resetDailyMissions() {
  dailyMission = {
    win3: { target: 3, current: 0, claimed: false, reward: 100 },
    bet1000: { target: 1000, current: 0, claimed: false, reward: 150 },
    naturalwin: { target: 1, current: 0, claimed: false, reward: 200 },
    win5banker: { target: 5, current: 0, claimed: false, reward: 120 },
    tie: { target: 1, current: 0, claimed: false, reward: 250 }
  };
  saveDailyMission();
}

function applyTheme() {
  const theme = settings.theme || 'dark';
  const root = document.documentElement;
  const themes = {
    dark: {
      '--bg-primary': '#0f0a2a',
      '--bg-secondary': '#1a1335',
      '--bg-tertiary': '#2d1b4e',
      '--text-primary': '#e2e8f0',
      '--text-secondary': '#94a3b8',
      '--accent': '#d4af37',
      '--success': '#10b981',
      '--danger': '#ef4444',
      '--card-bg': '#1a1335',
      '--border': '#3d2463'
    },
    midnight: {
      '--bg-primary': '#0a0e27',
      '--bg-secondary': '#151932',
      '--bg-tertiary': '#1f2438',
      '--text-primary': '#f0f4f8',
      '--text-secondary': '#8892b0',
      '--accent': '#00d9ff',
      '--success': '#00ff88',
      '--danger': '#ff3860',
      '--card-bg': '#151932',
      '--border': '#2d3a52'
    },
    emerald: {
      '--bg-primary': '#0a1c1a',
      '--bg-secondary': '#122d2a',
      '--bg-tertiary': '#1a3a36',
      '--text-primary': '#d0f0ed',
      '--text-secondary': '#7cb5b0',
      '--accent': '#10b981',
      '--success': '#34d399',
      '--danger': '#f87171',
      '--card-bg': '#122d2a',
      '--border': '#1a3a36'
    },
    crimson: {
      '--bg-primary': '#2a0a0a',
      '--bg-secondary': '#3d1515',
      '--bg-tertiary': '#522020',
      '--text-primary': '#f0d0d0',
      '--text-secondary': '#b08080',
      '--accent': '#dc2626',
      '--success': '#10b981',
      '--danger': '#dc2626',
      '--card-bg': '#3d1515',
      '--border': '#522020'
    }
  };
  const colors = themes[theme] || themes.dark;
  Object.keys(colors).forEach(function(k) {
    root.style.setProperty(k, colors[k]);
  });
}

function getDayKey() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).getTime();
}

function isNewWeek(lastWeekTime) {
  return getWeekStart(new Date()) > getWeekStart(new Date(lastWeekTime));
}

// ============================================================================
// SECTION 6: Audio (~80 lines)
// ============================================================================

function initAudio() {
  if (audioContext) return audioContext;
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return audioContext;
  } catch (e) {
    return null;
  }
}

function playSound(type) {
  if (!settings.sound) return;
  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const freqs = {
    chip: 800,
    deal: 600,
    flip: 900,
    win: 1200,
    lose: 300,
    natural: 1400,
    click: 500
  };

  const durations = {
    chip: 0.1,
    deal: 0.15,
    flip: 0.08,
    win: 0.3,
    lose: 0.2,
    natural: 0.4,
    click: 0.05
  };

  osc.frequency.value = freqs[type] || 500;
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + (durations[type] || 0.1));
  osc.start(now);
  osc.stop(now + (durations[type] || 0.1));
}

// ============================================================================
// SECTION 7: Utilities (~200 lines)
// ============================================================================

function formatNumber(n) {
  return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
  });
  const target = document.querySelector('.sc-' + name);
  if (target) {
    target.classList.add('active');
  }
  updateNavHighlight(name);
}

function showOverlay(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
  }
}

function hideOverlay(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('active');
  }
}

function showToast(msg, duration) {
  duration = duration || 2000;
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#d4af37;color:#0f0a2a;padding:12px 24px;border-radius:24px;font-weight:bold;z-index:10000;animation:fadeInOut 0.3s ease-in-out;box-shadow:0 4px 12px rgba(212,175,55,0.3)';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    setTimeout(function() { toast.remove(); }, 300);
  }, duration);
}

function vibrate(pattern) {
  if (!settings.vibration || !navigator.vibrate) return;
  navigator.vibrate(pattern);
}

function sleep(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

function addXp(amount) {
  profile.xp += amount;
  const nextLevel = profile.level * 1000;
  if (profile.xp >= nextLevel) {
    profile.level++;
    profile.xp = profile.xp - nextLevel;
    showToast(t('level_up') + ' ' + profile.level, 3000);
    vibrate([100, 50, 100]);
  }
}

function showConfetti(count) {
  count = count || 30;
  const container = document.getElementById('confetti-container');
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = 'position:absolute;width:8px;height:8px;background:' + ['#d4af37', '#ff6b6b', '#4ade80', '#00d9ff', '#f59e0b'][Math.floor(Math.random() * 5)] + ';border-radius:50%;pointer-events:none;animation:confettiFall ' + (1 + Math.random() * 2) + 's ease-in forwards';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-10px';
    container.appendChild(confetti);
    setTimeout(function() { confetti.remove(); }, 3000);
  }
}

function showGoldParticles(count) {
  count = count || 15;
  const container = document.getElementById('particle-container');
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = 'position:absolute;width:6px;height:6px;background:#d4af37;border-radius:50%;pointer-events:none;animation:particleFloat ' + (0.8 + Math.random() * 1.2) + 's ease-out forwards';
    particle.style.left = (window.innerWidth / 2 + (Math.random() - 0.5) * 100) + 'px';
    particle.style.top = (window.innerHeight / 2) + 'px';
    container.appendChild(particle);
    setTimeout(function() { particle.remove(); }, 2000);
  }
}

function updateAllUI() {
  const bindings = {
    'stars': profile.stars,
    'level': profile.level,
    'nickname': profile.nickname,
    'cards-left': Math.max(0, currentShoe.length - shoePosition),
    'total-played': profile.totalPlayed,
    'total-wins': profile.totalWins,
    'best-streak': profile.bestStreak,
    'current-streak': profile.currentStreak,
    'xp': profile.xp,
    'hands-played': sessionStats.handsPlayed,
    'net-profit': (sessionStats.netProfit >= 0 ? '+' : '') + formatNumber(sessionStats.netProfit),
    'biggest-win': formatNumber(sessionStats.biggestWin)
  };
  Object.keys(bindings).forEach(function(key) {
    const els = document.querySelectorAll('[data-bind="' + key + '"]');
    els.forEach(function(el) {
      el.textContent = bindings[key];
    });
  });

  // Update avatars
  var avatarItem = SHOP_ITEMS.avatars.find(function(a) { return a.id === (shopData.equipped.avatars || 'default'); });
  var avatarEmoji = avatarItem ? avatarItem.emoji : '😺';
  var homeAv = document.getElementById('home-avatar');
  if (homeAv) homeAv.textContent = avatarEmoji;
  var profileAv = document.getElementById('profile-avatar');
  if (profileAv) profileAv.textContent = avatarEmoji;

  // Update star displays by ID
  var starsStr = formatNumber(profile.stars);
  var sd = document.getElementById('stars-display');
  if (sd) sd.textContent = starsStr;
  var gs = document.getElementById('game-stars');
  if (gs) gs.textContent = starsStr;
  // Update session stats
  var sh = document.getElementById('session-hands');
  if (sh) sh.textContent = sessionStats.handsPlayed;
  var sp = document.getElementById('session-profit');
  if (sp) sp.textContent = (sessionStats.netProfit >= 0 ? '+' : '') + formatNumber(sessionStats.netProfit);
}

function updateNavHighlight(screen) {
  document.querySelectorAll('.nav-item').forEach(function(item) {
    item.classList.remove('active');
  });
  const navMap = { home: 'home', game: 'home', ranking: 'ranking', shop: 'shop', mission: 'mission', profile: 'profile' };
  const navName = navMap[screen] || screen;
  const target = document.querySelector('.nav-item[data-nav="' + navName + '"]');
  if (target) {
    target.classList.add('active');
  }
}

// ============================================================================
// SECTION 8: Card & Shoe (~200 lines)
// ============================================================================

function createShoe() {
  currentShoe = [];
  const deck = [];
  for (let s = 0; s < SUITS.length; s++) {
    for (let r = 0; r < RANKS.length; r++) {
      deck.push({ suit: SUITS[s], rank: RANKS[r] });
    }
  }
  for (let i = 0; i < 8; i++) {
    currentShoe = currentShoe.concat(deck);
  }
  for (let i = currentShoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = currentShoe[i];
    currentShoe[i] = currentShoe[j];
    currentShoe[j] = temp;
  }
  shoePosition = 0;
}

function drawCard() {
  if (shoePosition >= currentShoe.length - 30) {
    createShoe();
  }
  const card = currentShoe[shoePosition];
  shoePosition++;
  return card;
}

function cardScore(cards) {
  let sum = 0;
  for (let i = 0; i < cards.length; i++) {
    const rank = cards[i].rank;
    if (rank === 'A') sum += 1;
    else if (['K', 'Q', 'J'].includes(rank)) sum += 0;
    else sum += parseInt(rank);
  }
  return sum % 10;
}

function renderCardHTML(card, faceDown) {
  if (faceDown) {
    return renderCardBackHTML();
  }
  const isRed = ['♥', '♦'].includes(card.suit);
  const color = isRed ? '#dc2626' : '#1e293b';
  const html = '<div class="playing-card" style="background:white;border:2px solid #ccc;border-radius:8px;width:70px;height:100px;display:flex;align-items:center;justify-content:center;position:relative;font-family:serif;box-shadow:0 2px 8px rgba(0,0,0,0.2)"><div style="position:absolute;top:4px;left:4px;text-align:center"><div style="font-size:18px;font-weight:bold;color:' + color + ';line-height:1">' + card.rank + '</div><div style="font-size:14px;color:' + color + '">' + card.suit + '</div></div><div style="font-size:32px;color:' + color + '">' + card.suit + '</div><div style="position:absolute;bottom:4px;right:4px;text-align:center;transform:rotate(180deg)"><div style="font-size:18px;font-weight:bold;color:' + color + ';line-height:1">' + card.rank + '</div><div style="font-size:14px;color:' + color + '">' + card.suit + '</div></div></div>';
  return html;
}

function renderCardBackHTML() {
  return '<div class="playing-card" style="background:linear-gradient(135deg,#7c3aed 0%,#d4af37 100%);border:2px solid #d4af37;border-radius:8px;width:70px;height:100px;display:flex;align-items:center;justify-content:center;font-size:40px;box-shadow:0 2px 8px rgba(0,0,0,0.2)">🎴</div>';
}

// ============================================================================
// SECTION 9: Game Flow (~500 lines)
// ============================================================================

function startAIGame() {
  gameState = {
    mode: 'ai',
    currentBet: null,
    betAmount: 0,
    selectedChip: CHIPS[0],
    players: [],
    dealer: { name: 'Dealer', avatar: 'dealer', stars: 50000 },
    round: 0,
    playerCards: [],
    bankerCards: [],
    playerScore: 0,
    bankerScore: 0,
    roadMap: [],
    inProgress: false
  };

  gameState.players = [
    {
      name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
      avatar: BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)],
      stars: 5000 + Math.random() * 15000,
      currentBet: 0
    },
    {
      name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
      avatar: BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)],
      stars: 5000 + Math.random() * 15000,
      currentBet: 0
    },
    {
      name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
      avatar: BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)],
      stars: 5000 + Math.random() * 15000,
      currentBet: 0
    }
  ];

  showScreen('game');
  renderGameTable();
  renderAIPlayers();
  renderDealerAvatar();
  renderChips();
  renderBetZones();
  playSound('click');
}

function placeBet(type) {
  if (gameState.inProgress) return;
  if (!gameState.selectedChip) {
    gameState.selectedChip = CHIPS[0];
  }

  // Set or change bet zone
  if (gameState.currentBet && gameState.currentBet !== type) {
    // Switching zone - reset amount
    gameState.betAmount = 0;
  }
  gameState.currentBet = type;

  // Accumulate bet
  gameState.betAmount += gameState.selectedChip;
  if (gameState.betAmount > profile.stars) {
    gameState.betAmount = profile.stars;
  }

  document.querySelectorAll('.bet-zone').forEach(function(z) {
    z.classList.remove('active');
  });

  const zoneMap = {
    'ppair': 'zone-ppair',
    'player': 'zone-player',
    'tie': 'zone-tie',
    'banker': 'zone-banker',
    'bpair': 'zone-bpair'
  };

  const zone = document.querySelector('.' + zoneMap[type]);
  if (zone) {
    zone.classList.add('active');
  }

  renderBetZones();
  updateBetTotal();
  playSound('chip');
}

function selectChip(value) {
  gameState.selectedChip = value;
  renderChips();
}

function clearBet() {
  gameState.currentBet = null;
  gameState.betAmount = 0;
  document.querySelectorAll('.bet-zone').forEach(function(z) {
    z.classList.remove('active');
  });
  renderBetZones();
  updateBetTotal();
}

function updateBetTotal() {
  const el = document.getElementById('bet-total-display');
  if (!el) return;
  if (gameState.betAmount > 0 && gameState.currentBet) {
    const zoneNames = { player: 'PLAYER', banker: 'BANKER', tie: 'TIE', ppair: 'P.PAIR', bpair: 'B.PAIR' };
    el.textContent = formatNumber(gameState.betAmount) + ' ⭐ → ' + (zoneNames[gameState.currentBet] || '');
  } else {
    el.textContent = '';
  }
}

function showBetConfirm() {
  if (!gameState.currentBet || gameState.betAmount <= 0) {
    showToast('Select a bet zone and amount first', 2000);
    return;
  }
  if (gameState.betAmount > profile.stars) {
    showToast('Insufficient stars', 2000);
    return;
  }
  const zoneNames = { player: 'PLAYER', banker: 'BANKER', tie: 'TIE', ppair: 'P.PAIR', bpair: 'B.PAIR' };
  const popup = document.getElementById('bet-confirm-popup');
  const amountEl = document.getElementById('confirm-bet-amount');
  const zoneEl = document.getElementById('confirm-bet-zone');
  if (popup) popup.style.display = 'flex';
  if (amountEl) amountEl.textContent = formatNumber(gameState.betAmount) + ' ⭐';
  if (zoneEl) zoneEl.textContent = zoneNames[gameState.currentBet] || '';
}

function showStarFlyAnimation() {
  const starsPill = document.querySelector('.stars-pill');
  if (!starsPill) return;
  const rect = starsPill.getBoundingClientRect();
  for (let i = 0; i < 5; i++) {
    setTimeout(function() {
      const star = document.createElement('div');
      star.className = 'star-fly';
      star.textContent = '⭐';
      star.style.left = (rect.left + Math.random() * rect.width) + 'px';
      star.style.top = rect.top + 'px';
      document.body.appendChild(star);
      setTimeout(function() { star.remove(); }, 800);
    }, i * 100);
  }
}

function shouldPlayerDraw(score) {
  return score <= 5;
}

function shouldBankerDraw(bankerScore, playerThirdCardValue) {
  if (bankerScore >= 7) return false;
  if (bankerScore === 6) return playerThirdCardValue >= 6;
  if (bankerScore === 5) return playerThirdCardValue >= 5;
  if (bankerScore === 4) return playerThirdCardValue >= 2 && playerThirdCardValue <= 7;
  if (bankerScore === 3) return playerThirdCardValue !== 8;
  return true;
}

function animateCardDeal(containerId, card, index) {
  return new Promise(function(resolve) {
    const container = document.getElementById(containerId);
    if (!container) {
      resolve();
      return;
    }

    // Dealer hand animation
    var dealerEl = document.querySelector('.dealer-avatar');
    if (dealerEl) {
      dealerEl.classList.remove('dealer-dealing');
      void dealerEl.offsetWidth;
      dealerEl.classList.add('dealer-dealing');
      setTimeout(function() { dealerEl.classList.remove('dealer-dealing'); }, 600);
    }

    setTimeout(function() {
      const cardEl = document.createElement('div');
      cardEl.innerHTML = renderCardHTML(card, true);
      cardEl.style.cssText = 'animation:slideIn 0.4s ease-out';
      container.appendChild(cardEl);

      setTimeout(function() {
        cardEl.innerHTML = renderCardHTML(card, false);
        cardEl.style.cssText = 'animation:flip 0.6s ease-in-out';
        playSound('flip');
        resolve();
      }, 200);
    }, index * 300);
  });
}

function updateScores(pCards, bCards) {
  gameState.playerScore = cardScore(pCards);
  gameState.bankerScore = cardScore(bCards);

  const pEl = document.getElementById('player-score');
  const bEl = document.getElementById('banker-score');
  if (pEl) pEl.textContent = gameState.playerScore;
  if (bEl) bEl.textContent = gameState.bankerScore;
}

function showWinBanner(side) {
  const banner = document.getElementById('result-banner');
  if (!banner) return;
  banner.textContent = side === 'player' ? t('player_wins') : (side === 'banker' ? t('banker_wins') : t('tie'));
  banner.style.color = side === 'player' ? '#4ade80' : (side === 'banker' ? '#ef4444' : '#00d9ff');
  banner.classList.add('active');
}

async function dealRound() {
  if (gameState.inProgress) return;
  if (!gameState.currentBet || gameState.betAmount <= 0) {
    showToast(t('select_bet'), 2000);
    return;
  }

  if (gameState.betAmount > profile.stars) {
    showToast(t('insufficient_stars'), 2000);
    return;
  }

  // Hide confirm popup
  var confirmPopup = document.getElementById('bet-confirm-popup');
  if (confirmPopup) confirmPopup.style.display = 'none';

  // Star fly animation
  showStarFlyAnimation();

  gameState.inProgress = true;

  profile.stars -= gameState.betAmount;
  profile.totalPlayed++;
  profile.todayGames++;
  profile.biggestBet = Math.max(profile.biggestBet, gameState.betAmount);
  profile.todayTotalBet += gameState.betAmount;

  if (gameState.currentBet === 'banker') {
    profile.bankerBets++;
    profile.todayBankerBets++;
  } else if (gameState.currentBet === 'tie') {
    profile.todayTieBets++;
  }

  gameState.players.forEach(function(p) {
    p.currentBet = CHIPS[Math.floor(Math.random() * CHIPS.length)];
  });

  renderGameTable();
  renderAIPlayers();
  renderChips();
  renderBetZones();

  await sleep(500);

  const pCards = [drawCard(), drawCard()];
  const bCards = [drawCard(), drawCard()];

  await animateCardDeal('player-cards', pCards[0], 0);
  await animateCardDeal('banker-cards', bCards[0], 1);
  await animateCardDeal('player-cards', pCards[1], 2);
  await animateCardDeal('banker-cards', bCards[1], 3);

  updateScores(pCards, bCards);
  playSound('deal');

  const pScore = gameState.playerScore;
  const bScore = gameState.bankerScore;

  if ((pScore === 8 || pScore === 9) || (bScore === 8 || bScore === 9)) {
    playSound('natural');
    showWinBanner(pScore > bScore ? 'player' : (bScore > pScore ? 'banker' : 'tie'));
    showGoldParticles(20);

    let result = pScore > bScore ? 'player' : (bScore > pScore ? 'banker' : 'tie');
    let payout = 0;

    if (result === 'player' && gameState.currentBet === 'player') {
      payout = gameState.betAmount * PAYOUTS.player;
      profile.totalWins++;
      profile.todayWins++;
      profile.currentStreak++;
      sessionStats.netProfit += payout - gameState.betAmount;
      sessionStats.biggestWin = Math.max(sessionStats.biggestWin, payout);
    } else if (result === 'banker' && gameState.currentBet === 'banker') {
      payout = gameState.betAmount * PAYOUTS.banker;
      profile.totalWins++;
      profile.todayWins++;
      profile.currentStreak++;
      sessionStats.netProfit += payout - gameState.betAmount;
      sessionStats.biggestWin = Math.max(sessionStats.biggestWin, payout);
    } else if (result === 'tie' && gameState.currentBet === 'tie') {
      payout = gameState.betAmount * PAYOUTS.tie;
      profile.totalWins++;
      profile.todayWins++;
      profile.tieWins++;
      profile.currentStreak++;
      sessionStats.netProfit += payout - gameState.betAmount;
      sessionStats.biggestWin = Math.max(sessionStats.biggestWin, payout);
    } else {
      profile.currentStreak = 0;
      sessionStats.netProfit -= gameState.betAmount;
    }

    profile.stars += payout;
    profile.peakStars = Math.max(profile.peakStars, profile.stars);
    profile.bestStreak = Math.max(profile.bestStreak, profile.currentStreak);

    await sleep(1500);
    showOverlay('result-overlay');
    const emoji = document.getElementById('result-emoji');
    const text = document.getElementById('result-text');
    const amount = document.getElementById('result-amount');

    if (emoji) emoji.textContent = payout > 0 ? '🎉' : '😢';
    if (text) text.textContent = payout > 0 ? t('win') : t('lose');
    if (amount) amount.textContent = (payout > 0 ? '+' : '') + formatNumber(payout - gameState.betAmount);

    addXp(Math.ceil(gameState.betAmount / 100));
    checkDailyMissions('win', 1);
    checkAchievements();

    lastBet = { type: gameState.currentBet, amount: gameState.betAmount };
    sessionStats.handsPlayed++;

    addToHistory(result, gameState.currentBet, gameState.betAmount, pCards, bCards, pScore, bScore);
    updateRoadMap(result);

    saveProfile();
    updateAllUI();

    gameState.inProgress = false;
    return;
  }

  let pThirdCard = null;
  let bThirdCard = null;

  if (shouldPlayerDraw(pScore)) {
    pThirdCard = drawCard();
    pCards.push(pThirdCard);
    await animateCardDeal('player-cards', pThirdCard, 4);
    updateScores(pCards, bCards);
  }

  if (shouldBankerDraw(bScore, pThirdCard ? cardScore([pThirdCard]) : 0)) {
    bThirdCard = drawCard();
    bCards.push(bThirdCard);
    await animateCardDeal('banker-cards', bThirdCard, 5);
    updateScores(pCards, bCards);
  }

  const finalPScore = gameState.playerScore;
  const finalBScore = gameState.bankerScore;

  let result = finalPScore > finalBScore ? 'player' : (finalBScore > finalPScore ? 'banker' : 'tie');
  let payout = 0;
  let won = false;

  if (result === 'player' && gameState.currentBet === 'player') {
    payout = gameState.betAmount * PAYOUTS.player;
    won = true;
  } else if (result === 'banker' && gameState.currentBet === 'banker') {
    payout = gameState.betAmount * PAYOUTS.banker;
    won = true;
  } else if (result === 'tie' && gameState.currentBet === 'tie') {
    payout = gameState.betAmount * PAYOUTS.tie;
    won = true;
  }

  let pairPayout = 0;
  if (gameState.currentBet === 'ppair' && pCards[0].rank === pCards[1].rank) {
    pairPayout = gameState.betAmount * PAYOUTS.ppair;
    won = true;
    profile.pairWins++;
  }
  if (gameState.currentBet === 'bpair' && bCards[0].rank === bCards[1].rank) {
    pairPayout = gameState.betAmount * PAYOUTS.bpair;
    won = true;
    profile.pairWins++;
  }

  payout += pairPayout;

  if (won) {
    profile.totalWins++;
    profile.todayWins++;
    profile.currentStreak++;
    profile.stars += payout;
    sessionStats.netProfit += payout - gameState.betAmount;
    sessionStats.biggestWin = Math.max(sessionStats.biggestWin, payout);
    playSound('win');
    showWinBanner(result);
    showGoldParticles(20);
  } else {
    profile.currentStreak = 0;
    sessionStats.netProfit -= gameState.betAmount;
    playSound('lose');
    showWinBanner(result);
  }

  profile.peakStars = Math.max(profile.peakStars, profile.stars);
  profile.bestStreak = Math.max(profile.bestStreak, profile.currentStreak);

  await sleep(1500);
  showOverlay('result-overlay');
  const emoji = document.getElementById('result-emoji');
  const text = document.getElementById('result-text');
  const amount = document.getElementById('result-amount');

  if (emoji) emoji.textContent = won ? '🎉' : '😢';
  if (text) text.textContent = won ? t('win') : t('lose');
  if (amount) amount.textContent = (won ? '+' : '') + formatNumber(payout - gameState.betAmount);

  addXp(Math.ceil(gameState.betAmount / 100));
  if (won) checkDailyMissions('win', 1);
  checkDailyMissions('bet', gameState.betAmount);
  checkAchievements();

  lastBet = { type: gameState.currentBet, amount: gameState.betAmount };
  sessionStats.handsPlayed++;

  addToHistory(result, gameState.currentBet, gameState.betAmount, pCards, bCards, finalPScore, finalBScore);
  updateRoadMap(result);

  saveProfile();
  updateAllUI();

  gameState.inProgress = false;
}

// ============================================================================
// SECTION 10: UI Rendering (~600 lines)
// ============================================================================

function renderChips() {
  const tray = document.getElementById('chip-tray');
  if (!tray) return;
  tray.innerHTML = '';
  CHIPS.forEach(function(chip) {
    const chipWrapper = document.createElement('div');
    chipWrapper.style.cssText = 'position:relative;display:inline-block';

    const chipEl = document.createElement('button');
    chipEl.className = 'chip';
    if (chip === gameState.selectedChip) {
      chipEl.classList.add('active');
    }
    chipEl.setAttribute('data-chip', chip);
    chipEl.textContent = formatNumber(chip);
    chipEl.style.cssText = 'background:linear-gradient(135deg,#d4af37 0%,#aa8c2a 100%);border:2px solid #8a6e1f;padding:10px 18px;border-radius:8px;cursor:pointer;color:#0f0a2a;font-weight:bold;font-size:14px;transition:all 0.2s;box-shadow:0 2px 6px rgba(212,175,55,0.3)';
    if (chip === gameState.selectedChip) {
      chipEl.style.cssText += ';transform:scale(1.15);box-shadow:0 0 15px rgba(212,175,55,0.8);border-color:#ffd700;background:linear-gradient(135deg,#ffd700,#d4af37)';
    }
    chipWrapper.appendChild(chipEl);
    tray.appendChild(chipWrapper);
  });
}

function renderBetZones() {
  const zones = {
    'ppair': 'bet-ppair-amt',
    'player': 'bet-player-amt',
    'tie': 'bet-tie-amt',
    'banker': 'bet-banker-amt',
    'bpair': 'bet-bpair-amt'
  };

  Object.keys(zones).forEach(function(bet) {
    const el = document.getElementById(zones[bet]);
    if (el) {
      if (gameState.currentBet === bet) {
        el.textContent = formatNumber(gameState.betAmount);
        el.style.color = '#d4af37';
      } else {
        el.textContent = '-';
        el.style.color = '#94a3b8';
      }
    }
  });
}

function renderGameTable() {
  const playerCards = document.getElementById('player-cards');
  const bankerCards = document.getElementById('banker-cards');
  if (playerCards) playerCards.innerHTML = '';
  if (bankerCards) bankerCards.innerHTML = '';

  gameState.playerCards = [];
  gameState.bankerCards = [];
  gameState.playerScore = 0;
  gameState.bankerScore = 0;

  const pScore = document.getElementById('player-score');
  const bScore = document.getElementById('banker-score');
  if (pScore) pScore.textContent = '0';
  if (bScore) bScore.textContent = '0';

  const banner = document.getElementById('result-banner');
  if (banner) {
    banner.classList.remove('active');
    banner.textContent = '';
  }
}

function renderAIPlayers() {
  const root = document.getElementById('kk-root');
  if (!root) return;
  const container = root.querySelector('.ai-players-area');
  if (!container) return;

  let html = '';
  gameState.players.forEach(function(player) {
    html += '<div class="ai-player" style="background:#2d1b4e;border:2px solid #3d2463;padding:12px;border-radius:8px;text-align:center;margin:8px"><div style="font-size:24px;margin-bottom:8px">' + player.avatar + '</div><div style="font-weight:bold;color:#e2e8f0;font-size:14px">' + player.name + '</div><div style="color:#94a3b8;font-size:12px">' + formatNumber(player.stars) + ' ⭐</div><div style="color:#d4af37;margin-top:4px">Bet: ' + formatNumber(player.currentBet) + '</div></div>';
  });
  container.innerHTML = html;
}

function renderDealerAvatar() {
  // Dealer is now rendered as SVG in HTML template - no dynamic rendering needed
  return;
}

function renderShop(tab) {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const items = SHOP_ITEMS[tab] || [];
  items.forEach(function(item) {
    const owned = shopData.owned[tab].includes(item.id);
    const equipped = shopData.equipped[tab] === item.id;

    const card = document.createElement('div');
    card.style.cssText = 'background:#2d1b4e;border:2px solid #3d2463;padding:16px;border-radius:8px;text-align:center';
    if (equipped) {
      card.style.border = '2px solid #d4af37';
    }

    let html = '<div style="font-size:48px;margin-bottom:8px">' + item.emoji + '</div>';
    html += '<div style="color:#e2e8f0;font-weight:bold;margin-bottom:4px">' + item.name + '</div>';
    html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:12px">' + item.desc + '</div>';

    if (!owned && item.price) {
      html += '<button data-action="buy-item" data-shop-tab="' + tab + '" data-item-id="' + item.id + '" style="background:#d4af37;color:#0f0a2a;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-weight:bold;width:100%">' + formatNumber(item.price) + ' ⭐</button>';
    } else if (owned && !equipped) {
      html += '<button data-action="equip-item" data-shop-tab="' + tab + '" data-item-id="' + item.id + '" style="background:#4ade80;color:#0f0a2a;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-weight:bold;width:100%">' + t('equip') + '</button>';
    } else {
      html += '<div style="background:#7c3aed;color:#e2e8f0;padding:8px 16px;border-radius:4px;font-weight:bold">' + t('equipped') + '</div>';
    }

    card.innerHTML = html;
    grid.appendChild(card);
  });
}

function renderDailyMissions() {
  const container = document.getElementById('daily-missions');
  if (!container) return;
  container.innerHTML = '';

  const missionDefs = {
    'win3': { name: t('mission_win3'), icon: '🏆' },
    'bet1000': { name: t('mission_bet1000'), icon: '💰' },
    'naturalwin': { name: t('mission_natural'), icon: '✨' },
    'win5banker': { name: t('mission_banker5'), icon: '🏦' },
    'tie': { name: t('mission_tie'), icon: '🤝' }
  };

  Object.keys(dailyMission).forEach(function(missionId) {
    const m = dailyMission[missionId];
    const def = missionDefs[missionId];
    const progress = Math.min(100, Math.floor(m.current / m.target * 100));

    const card = document.createElement('div');
    card.style.cssText = 'background:#2d1b4e;border:2px solid #3d2463;padding:12px;border-radius:8px;margin-bottom:8px';

    let html = '<div style="display:flex;align-items:center;gap:12px">';
    html += '<div style="font-size:28px">' + def.icon + '</div>';
    html += '<div style="flex:1">';
    html += '<div style="color:#e2e8f0;font-weight:bold">' + def.name + '</div>';
    html += '<div style="background:#1a1335;height:8px;border-radius:4px;margin:4px 0;overflow:hidden"><div style="background:#d4af37;height:100%;width:' + progress + '%"></div></div>';
    html += '<div style="color:#94a3b8;font-size:12px">' + m.current + ' / ' + m.target + '</div>';
    html += '</div>';

    if (m.claimed) {
      html += '<div style="color:#4ade80;font-weight:bold">✓</div>';
    } else if (progress === 100) {
      html += '<button data-action="claim-mission" data-mission-id="' + missionId + '" style="background:#d4af37;color:#0f0a2a;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-weight:bold">' + t('claim') + ' ' + m.reward + '</button>';
    }

    html += '</div>';
    card.innerHTML = html;
    container.appendChild(card);
  });
}

function renderAchievements() {
  const container = document.getElementById('achievement-list');
  if (!container) return;
  container.innerHTML = '';

  ACHIEVEMENTS.forEach(function(ach) {
    const unlocked = profile.unlockedAchievements.includes(ach.id);

    const card = document.createElement('div');
    card.style.cssText = 'background:' + (unlocked ? '#1a3a36' : '#2d1b4e') + ';border:2px solid ' + (unlocked ? '#1a3a36' : '#3d2463') + ';padding:12px;border-radius:8px;margin-bottom:8px;opacity:' + (unlocked ? '1' : '0.6');

    let html = '<div style="display:flex;align-items:center;gap:12px">';
    html += '<div style="font-size:28px">' + ach.icon + '</div>';
    html += '<div style="flex:1">';
    html += '<div style="color:#e2e8f0;font-weight:bold">' + ach.name + '</div>';
    html += '<div style="color:#94a3b8;font-size:12px">' + ach.desc + '</div>';
    html += '</div>';
    html += '<div style="color:' + (unlocked ? '#4ade80' : '#7c3aed') + ';font-weight:bold">' + (unlocked ? '✓' : '🔒') + '</div>';
    html += '</div>';

    card.innerHTML = html;
    container.appendChild(card);
  });
}

function renderRanking(tab) {
  const container = document.getElementById('ranking-list');
  if (!container) return;
  container.innerHTML = '';

  // Try Firebase first
  if (firebaseOK()) {
    try {
      var dbRef = firebase.database().ref('leaderboards/baccarat');
      dbRef.orderByChild('stars').limitToLast(50).once('value').then(function(snap) {
        var players = [];
        snap.forEach(function(child) {
          players.push(child.val());
        });
        players.sort(function(a, b) { return (b.stars || 0) - (a.stars || 0); });
        renderRankingCards(container, players);
      }).catch(function() {
        renderRankingCards(container, getLocalRanking());
      });
    } catch(e) {
      renderRankingCards(container, getLocalRanking());
    }
  } else {
    renderRankingCards(container, getLocalRanking());
  }
}

function getLocalRanking() {
  var me = { nickname: profile.nickname, stars: profile.stars, totalWins: profile.totalWins };
  var bots = [
    { nickname: 'VIP King', stars: 85000, totalWins: 320 },
    { nickname: 'Lucky Star', stars: 62000, totalWins: 245 },
    { nickname: 'CardMaster', stars: 51000, totalWins: 198 },
    { nickname: 'GoldHand', stars: 43000, totalWins: 167 },
    { nickname: 'AcePlayer', stars: 38000, totalWins: 142 },
    { nickname: 'Diamond', stars: 29000, totalWins: 115 },
    { nickname: 'HighRoller', stars: 22000, totalWins: 89 },
    { nickname: 'Phoenix', stars: 18000, totalWins: 72 },
    { nickname: 'Tiger', stars: 12000, totalWins: 48 },
    { nickname: 'Rookie', stars: 5000, totalWins: 15 }
  ];
  var all = [me].concat(bots);
  all.sort(function(a, b) { return (b.stars || 0) - (a.stars || 0); });
  return all;
}

function renderRankingCards(container, players) {
  container.innerHTML = '';
  if (players.length === 0) {
    container.innerHTML = '<div style="color:#94a3b8;padding:32px;text-align:center">No ranking data yet</div>';
    return;
  }
  players.forEach(function(p, i) {
    var rank = i + 1;
    var medal = rank === 1 ? '🥇' : (rank === 2 ? '🥈' : (rank === 3 ? '🥉' : ''));
    var isMe = p.nickname === profile.nickname;
    var card = document.createElement('div');
    card.style.cssText = 'background:' + (isMe ? 'rgba(212,175,55,0.15)' : '#2d1b4e') + ';border:2px solid ' + (isMe ? '#d4af37' : '#3d2463') + ';padding:12px;border-radius:10px;margin-bottom:8px;display:flex;align-items:center;gap:12px';

    var html = '<div style="width:28px;text-align:center;font-size:' + (rank <= 3 ? '20px' : '14px') + ';color:' + (rank <= 3 ? '#d4af37' : '#94a3b8') + ';font-weight:bold">' + (medal || '#' + rank) + '</div>';
    html += '<div style="flex:1">';
    html += '<div style="color:' + (isMe ? '#d4af37' : '#e2e8f0') + ';font-weight:bold;font-size:14px">' + (p.nickname || 'Player') + (isMe ? ' (You)' : '') + '</div>';
    html += '<div style="color:#94a3b8;font-size:12px">' + t('wins') + ': ' + (p.totalWins || 0) + '</div>';
    html += '</div>';
    html += '<div style="color:#d4af37;font-weight:bold;font-size:14px">' + formatNumber(p.stars || 0) + ' ⭐</div>';

    card.innerHTML = html;
    container.appendChild(card);
  });
}

function renderHistory() {
  const container = document.getElementById('history-list');
  if (!container) return;
  container.innerHTML = '';

  const recentHands = gameHistory.slice(-30).reverse();
  if (recentHands.length === 0) {
    container.innerHTML = '<div style="color:#94a3b8;padding:16px;text-align:center">' + t('no_history') + '</div>';
    return;
  }

  recentHands.forEach(function(hand, idx) {
    const resultColor = hand.result === 'player' ? '#4ade80' : (hand.result === 'banker' ? '#ef4444' : '#00d9ff');
    const resultEmoji = hand.result === 'player' ? '👤' : (hand.result === 'banker' ? '🏦' : '🤝');

    const card = document.createElement('div');
    card.style.cssText = 'background:#2d1b4e;border:2px solid #3d2463;padding:12px;border-radius:8px;margin-bottom:8px;display:flex;align-items:center;gap:12px';

    let html = '<div style="color:' + resultColor + ';font-size:18px">' + resultEmoji + '</div>';
    html += '<div style="flex:1">';
    html += '<div style="color:#e2e8f0;font-weight:bold">' + t('hand') + ' #' + (gameHistory.length - idx) + '</div>';
    html += '<div style="color:#94a3b8;font-size:12px">' + hand.playerScore + ' vs ' + hand.bankerScore + ' | ' + t(hand.type) + ' | ' + formatNumber(hand.amount) + '⭐</div>';
    html += '</div>';
    html += '<div style="color:' + (hand.amount > 0 ? '#4ade80' : '#ef4444') + ';font-weight:bold">' + (hand.amount > 0 ? '+' : '') + formatNumber(hand.amount) + '</div>';

    card.innerHTML = html;
    container.appendChild(card);
  });
}

function renderStatistics() {
  const container = document.getElementById('stats-content');
  if (!container) return;

  const stats = getStatistics();

  let html = '<div style="color:#e2e8f0;margin-bottom:24px">';
  html += '<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #3d2463">';
  html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:4px">' + t('total_games') + '</div>';
  html += '<div style="font-size:24px;font-weight:bold;color:#d4af37">' + profile.totalPlayed + '</div>';
  html += '</div>';

  html += '<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #3d2463">';
  html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:4px">' + t('win_rate') + '</div>';
  html += '<div style="font-size:24px;font-weight:bold;color:#4ade80">' + (profile.totalPlayed > 0 ? ((profile.totalWins / profile.totalPlayed * 100).toFixed(1)) : '0') + '%</div>';
  html += '</div>';

  html += '<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #3d2463">';
  html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:4px">' + t('best_streak') + '</div>';
  html += '<div style="font-size:24px;font-weight:bold;color:#d4af37">' + profile.bestStreak + '</div>';
  html += '</div>';

  html += '<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #3d2463">';
  html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:4px">' + t('avg_bet') + '</div>';
  html += '<div style="font-size:24px;font-weight:bold;color:#d4af37">' + (profile.totalPlayed > 0 ? formatNumber(profile.todayTotalBet / profile.todayGames) : '0') + '</div>';
  html += '</div>';

  html += '<div style="margin-bottom:16px">';
  html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:8px">' + t('results_distribution') + '</div>';
  html += '<div style="display:flex;gap:4px;height:20px">';

  const playerW = stats.playerWins;
  const bankerW = stats.bankerWins;
  const tieW = stats.tieWins;
  const total = playerW + bankerW + tieW;

  if (total > 0) {
    const pw = playerW / total * 100;
    const bw = bankerW / total * 100;
    const tw = tieW / total * 100;
    html += '<div style="flex:' + pw + ';background:#4ade80;border-radius:2px" title="Player: ' + playerW + '"></div>';
    html += '<div style="flex:' + bw + ';background:#ef4444;border-radius:2px" title="Banker: ' + bankerW + '"></div>';
    html += '<div style="flex:' + tw + ';background:#00d9ff;border-radius:2px" title="Tie: ' + tieW + '"></div>';
  }

  html += '</div>';
  html += '<div style="display:flex;gap:12px;font-size:12px;margin-top:4px;color:#94a3b8">';
  html += '<div>👤 ' + playerW + '</div>';
  html += '<div>🏦 ' + bankerW + '</div>';
  html += '<div>🤝 ' + tieW + '</div>';
  html += '</div>';
  html += '</div>';

  html += '</div>';

  container.innerHTML = html;
}

function renderProfileScreen() {
  const avatar = document.getElementById('profile-avatar');
  if (avatar) {
    var avatarItem = SHOP_ITEMS.avatars.find(function(a) { return a.id === (shopData.equipped.avatars || 'default'); });
    avatar.textContent = avatarItem ? avatarItem.emoji : '😺';
  }

  const nickname = document.getElementById('nickname-input');
  if (nickname) nickname.value = profile.nickname;

  updateAllUI();
}

// ============================================================================
// SECTION 11: Road Maps (~300 lines)
// ============================================================================

function updateRoadMap(result) {
  if (!gameState.roadMap) gameState.roadMap = [];
  gameState.roadMap.push(result);
  renderBigRoad();
  renderBeadPlate();
  renderMiniRoadMap();
}

function renderBigRoad() {
  const container = document.getElementById('big-road');
  if (!container) return;
  container.innerHTML = '';

  const maxCols = 10;
  const road = gameState.roadMap || [];

  if (road.length === 0) {
    container.innerHTML = '<div style="color:#94a3b8;padding:16px;text-align:center">' + t('no_history') + '</div>';
    return;
  }

  const cols = Math.ceil(road.length / 6);
  let currentCol = 0;
  let currentRow = 0;

  for (let i = 0; i < road.length; i++) {
    const result = road[i];
    if (currentRow >= 6) {
      currentRow = 0;
      currentCol++;
    }
    if (currentCol >= maxCols) break;

    const color = result === 'player' ? '#4ade80' : (result === 'banker' ? '#ef4444' : '#00d9ff');
    const symbol = result === 'tie' ? '/' : '●';

    const cell = document.createElement('div');
    cell.style.cssText = 'width:18px;height:18px;background:' + color + ';border-radius:50%;margin:1px;display:inline-block;font-size:10px;line-height:18px;text-align:center;color:white;font-weight:bold';
    cell.textContent = result === 'tie' ? '÷' : '';
    if (result === 'tie') {
      cell.style.borderRadius = '0';
    }
    container.appendChild(cell);

    if ((i + 1) % 6 === 0 && i < road.length - 1) {
      const br = document.createElement('br');
      container.appendChild(br);
    }

    currentRow++;
  }
}

function renderBeadPlate() {
  const container = document.getElementById('bead-cells');
  if (!container) return;
  container.innerHTML = '';

  const road = gameState.roadMap || [];
  const beads = road.slice(-18);

  for (let i = 0; i < 18; i++) {
    const bead = document.createElement('div');
    bead.style.cssText = 'width:20px;height:20px;border-radius:50%;margin:2px;display:inline-block;background:' + (i < beads.length ? (beads[i] === 'player' ? '#4ade80' : (beads[i] === 'banker' ? '#ef4444' : '#00d9ff')) : '#3d2463');
    container.appendChild(bead);
  }
}

function renderMiniRoadMap() {
  const road = gameState.roadMap || [];
  const recent = road.slice(-6);

  const html = recent.map(function(r) {
    return '<span style="display:inline-block;width:16px;height:16px;background:' + (r === 'player' ? '#4ade80' : (r === 'banker' ? '#ef4444' : '#00d9ff')) + ';border-radius:50%;margin:2px"></span>';
  }).join('');
}

// ============================================================================
// SECTION 12: Particle System (~80 lines)
// ============================================================================

function winCelebration() {
  showConfetti(40);
  showGoldParticles(30);
  vibrate([100, 50, 100, 50, 100]);
}

function naturalCelebration() {
  showConfetti(50);
  showGoldParticles(40);
  vibrate([200, 100, 200]);
}

// ============================================================================
// SECTION 13: History & Stats (~200 lines)
// ============================================================================

function addToHistory(result, type, amount, pCards, bCards, pScore, bScore) {
  const hand = {
    result: result,
    type: type,
    amount: amount,
    playerCards: pCards,
    bankerCards: bCards,
    playerScore: pScore,
    bankerScore: bScore,
    timestamp: Date.now()
  };
  gameHistory.push(hand);
  if (gameHistory.length > 50) {
    gameHistory = gameHistory.slice(-50);
  }
  saveHistory();
}

function getStatistics() {
  let playerWins = 0, bankerWins = 0, tieWins = 0;
  let totalBet = 0, highestWin = 0;

  gameHistory.forEach(function(hand) {
    if (hand.result === 'player') playerWins++;
    else if (hand.result === 'banker') bankerWins++;
    else tieWins++;

    totalBet += hand.amount;
    if (hand.amount > highestWin) highestWin = hand.amount;
  });

  return {
    playerWins: playerWins,
    bankerWins: bankerWins,
    tieWins: tieWins,
    totalBet: totalBet,
    highestWin: highestWin
  };
}

function loadHistory() {
  const stored = localStorage.getItem('bac_history_v2');
  if (stored) {
    gameHistory = JSON.parse(stored);
  }
}

function saveHistory() {
  localStorage.setItem('bac_history_v2', JSON.stringify(gameHistory));
}

// ============================================================================
// SECTION 14: Shop (~200 lines)
// ============================================================================

function buyItem(category, itemId) {
  const items = SHOP_ITEMS[category] || [];
  const item = items.find(function(i) { return i.id === itemId; });

  if (!item) return;
  if (item.price > profile.stars) {
    showToast(t('insufficient_stars'), 2000);
    return;
  }
  if (shopData.owned[category].includes(itemId)) {
    showToast(t('already_owned'), 2000);
    return;
  }

  profile.stars -= item.price;
  shopData.owned[category].push(itemId);
  saveShopData();
  saveProfile();

  showToast(t('purchased'), 2000);
  vibrate([100, 50, 100]);
  updateAllUI();
  renderShop(category);
}

function equipItem(category, itemId) {
  const items = SHOP_ITEMS[category] || [];
  const item = items.find(function(i) { return i.id === itemId; });

  if (!item) return;
  if (!shopData.owned[category].includes(itemId) && item.id !== 'default') {
    showToast(t('not_owned'), 2000);
    return;
  }

  shopData.equipped[category] = itemId;

  if (category === 'avatars') {
    profile.avatar = itemId;
  }

  saveShopData();
  saveProfile();

  showToast(t('equipped'), 2000);
  vibrate([100]);
  renderShop(category);
  renderProfileScreen();
}

function isItemOwned(category, itemId) {
  return shopData.owned[category].includes(itemId) || itemId === 'default';
}

function isItemEquipped(category, itemId) {
  return shopData.equipped[category] === itemId;
}

// ============================================================================
// SECTION 15: Ranking (~150 lines)
// ============================================================================

function submitScore() {
  if (!firebaseOK()) return;
  try {
    firebase.database().ref('leaderboards/baccarat/' + profile.userId).set({
      nickname: profile.nickname,
      stars: profile.stars,
      totalWins: profile.totalWins,
      totalPlayed: profile.totalPlayed,
      timestamp: Date.now()
    });
  } catch(e) {}
}

function fetchRanking(tab) {
  if (!firebaseOK()) {
    return Promise.resolve([]);
  }

  return db.collection('leaderboards').doc('baccarat').collection('scores').orderBy('stars', 'desc').limit(100).get()
    .then(function(snap) {
      const results = [];
      snap.forEach(function(doc) {
        results.push(doc.val());
      });
      return results;
    })
    .catch(function() {
      return [];
    });
}

function renderRankingList(tab, players) {
  const container = document.getElementById('ranking-list');
  if (!container) return;
  container.innerHTML = '';

  if (!players || players.length === 0) {
    renderRanking(tab);
    return;
  }

  players.slice(0, 100).forEach(function(p, idx) {
    const medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : ''));
    const card = document.createElement('div');
    card.style.cssText = 'background:#2d1b4e;border:2px solid #3d2463;padding:12px;border-radius:8px;margin-bottom:8px;display:flex;align-items:center;gap:12px';

    let html = '<div style="font-size:20px">' + medal + '</div>';
    html += '<div style="flex:1">';
    html += '<div style="color:#e2e8f0;font-weight:bold">#' + (idx + 1) + ' ' + p.nickname + '</div>';
    html += '<div style="color:#94a3b8;font-size:12px">' + formatNumber(p.stars) + ' ⭐ | Win: ' + ((p.winRate || 0) * 100).toFixed(1) + '%</div>';
    html += '</div>';

    card.innerHTML = html;
    container.appendChild(card);
  });
}

// ============================================================================
// SECTION 16: Missions & Achievements (~250 lines)
// ============================================================================

function checkDailyMissions(type, value) {
  if (type === 'win') {
    dailyMission.win3.current = Math.min(dailyMission.win3.target, dailyMission.win3.current + value);
  } else if (type === 'bet') {
    dailyMission.bet1000.current = Math.min(dailyMission.bet1000.target, dailyMission.bet1000.current + value);
  }

  if (gameState.currentBet === 'banker') {
    dailyMission.win5banker.current = Math.min(dailyMission.win5banker.target, dailyMission.win5banker.current + 1);
  }

  if (gameState.currentBet === 'tie') {
    dailyMission.tie.current = Math.min(dailyMission.tie.target, dailyMission.tie.current + 1);
  }

  saveDailyMission();
}

function claimMissionReward(missionId) {
  const m = dailyMission[missionId];
  if (!m || m.claimed) return;
  if (m.current < m.target) return;

  m.claimed = true;
  profile.stars += m.reward;
  profile.peakStars = Math.max(profile.peakStars, profile.stars);

  saveDailyMission();
  saveProfile();

  showToast(t('reward_claimed') + ' +' + m.reward, 2000);
  vibrate([100, 50, 100]);
  showGoldParticles(20);
  updateAllUI();
  renderDailyMissions();
}

function checkAchievements() {
  ACHIEVEMENTS.forEach(function(ach) {
    if (profile.unlockedAchievements.includes(ach.id)) return;

    let unlocked = false;

    if (ach.id === 'first_win' && profile.totalWins >= 1) unlocked = true;
    if (ach.id === 'ten_wins' && profile.totalWins >= 10) unlocked = true;
    if (ach.id === 'hundred_wins' && profile.totalWins >= 100) unlocked = true;
    if (ach.id === 'banker_lover' && profile.bankerBets >= 50) unlocked = true;
    if (ach.id === 'tie_believer' && profile.tieWins >= 5) unlocked = true;
    if (ach.id === 'pair_master' && profile.pairWins >= 10) unlocked = true;
    if (ach.id === 'big_bettor' && profile.biggestBet >= 50000) unlocked = true;
    if (ach.id === 'lucky_streak' && profile.bestStreak >= 10) unlocked = true;
    if (ach.id === 'high_roller' && profile.peakStars >= 100000) unlocked = true;

    if (unlocked) {
      profile.unlockedAchievements.push(ach.id);
      saveProfile();
      showToast(t('achievement_unlocked') + ': ' + ach.name, 3000);
      showConfetti(30);
      vibrate([100, 50, 100, 50, 100]);
    }
  });
}

function getMissionProgress(mission) {
  return mission.current + ' / ' + mission.target;
}

// ============================================================================
// SECTION 17: Profile (~100 lines)
// ============================================================================

function saveNickname() {
  const input = document.getElementById('nickname-input');
  if (!input) return;
  const newName = input.value.trim();
  if (!newName || newName.length === 0 || newName.length > 20) {
    showToast(t('invalid_nickname'), 2000);
    return;
  }
  profile.nickname = newName;
  saveProfile();
  showToast(t('profile_updated'), 2000);
  updateAllUI();
}

function resetAllStats() {
  if (!confirm(t('confirm_reset'))) return;

  profile.totalWins = 0;
  profile.totalLoss = 0;
  profile.totalPlayed = 0;
  profile.bestStreak = 0;
  profile.currentStreak = 0;
  profile.tieWins = 0;
  profile.bankerBets = 0;
  profile.pairWins = 0;
  gameHistory = [];

  saveProfile();
  saveHistory();
  showToast(t('stats_reset'), 2000);
  updateAllUI();
  renderHistory();
  renderStatistics();
}

function calculateLevel() {
  return Math.floor(profile.xp / 1000) + 1;
}

// ============================================================================
// SECTION 18: Settings (~150 lines)
// ============================================================================

function toggleSetting(key) {
  if (key === 'sound') settings.sound = !settings.sound;
  else if (key === 'vibration') settings.vibration = !settings.vibration;
  else if (key === 'notifications') settings.notifications = !settings.notifications;
  else if (key === 'autodeal') settings.autodeal = !settings.autodeal;

  saveSettings();
  renderSettingsState();
}

function changeLang(newLang) {
  lang = newLang;
  settings.language = newLang;
  localStorage.setItem('lang', newLang);
  saveSettings();
  applyI18n();
  updateI18n();
  showToast(t('language_changed'), 2000);
}

function changeTheme(newTheme) {
  settings.theme = newTheme;
  saveSettings();
  applyTheme();
}

function changeSpeed(newSpeed) {
  settings.speed = newSpeed;
  saveSettings();
}

function renderSettingsState() {
  const soundBtn = document.querySelector('[data-action="toggle-sound"]');
  const vibBtn = document.querySelector('[data-action="toggle-vibrate"]');
  const notifBtn = document.querySelector('[data-action="toggle-notif"]');
  const autodealBtn = document.querySelector('[data-action="toggle-autodeal"]');

  if (soundBtn) soundBtn.style.opacity = settings.sound ? '1' : '0.5';
  if (vibBtn) vibBtn.style.opacity = settings.vibration ? '1' : '0.5';
  if (notifBtn) notifBtn.style.opacity = settings.notifications ? '1' : '0.5';
  if (autodealBtn) autodealBtn.style.opacity = settings.autodeal ? '1' : '0.5';
}

// ============================================================================
// SECTION 19: Tutorial (~120 lines)
// ============================================================================

const TUTORIAL_STEPS = [
  { step: 0, title: t('tut_welcome'), desc: t('tut_welcome_desc') },
  { step: 1, title: t('tut_betting'), desc: t('tut_betting_desc') },
  { step: 2, title: t('tut_cards'), desc: t('tut_cards_desc') },
  { step: 3, title: t('tut_rules'), desc: t('tut_rules_desc') },
  { step: 4, title: t('tut_payouts'), desc: t('tut_payouts_desc') },
  { step: 5, title: t('tut_roadmaps'), desc: t('tut_roadmaps_desc') },
  { step: 6, title: t('tut_shop'), desc: t('tut_shop_desc') },
  { step: 7, title: t('tut_missions'), desc: t('tut_missions_desc') }
];

function showTutorialStep(step) {
  tutorialStep = step;
  const tutContent = document.querySelector('.tutorial-content');
  if (!tutContent) return;

  const stepData = TUTORIAL_STEPS[step] || TUTORIAL_STEPS[0];
  tutContent.innerHTML = '<div style="text-align:center"><h2 style="color:#d4af37;margin-bottom:16px">' + stepData.title + '</h2><p style="color:#e2e8f0;margin-bottom:24px">' + stepData.desc + '</p><div style="color:#94a3b8;font-size:12px">' + (step + 1) + ' / 8</div></div>';

  const dots = document.getElementById('tutorial-dots');
  if (dots) {
    dots.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = 'width:8px;height:8px;background:' + (i === step ? '#d4af37' : '#3d2463') + ';border-radius:50%;display:inline-block;margin:0 4px';
      dots.appendChild(dot);
    }
  }
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
  showToast(t('tutorial_complete'), 2000);
}

// ============================================================================
// SECTION 20: Daily Check-in (~80 lines)
// ============================================================================

function checkDailyBonus() {
  const today = getDayKey();
  if (profile.lastCheckinDate === today) {
    return;
  }

  const bonus = DAILY_BONUS;
  profile.stars += bonus;
  profile.lastCheckinDate = today;
  profile.peakStars = Math.max(profile.peakStars, profile.stars);

  saveProfile();
  showToast(t('daily_bonus') + ' +' + bonus, 3000);
  showGoldParticles(20);
}

function claimDailyBonus() {
  const today = getDayKey();
  if (profile.lastCheckinDate !== today) {
    checkDailyBonus();
    updateAllUI();
  }
}

function checkWeeklyReset() {
  if (isNewWeek(profile.lastWeeklyReset)) {
    profile.lastWeeklyReset = Date.now();
    profile.todayGames = 0;
    profile.todayWins = 0;
    profile.todayTotalBet = 0;
    profile.todayStreak = 0;
    profile.todayBankerBets = 0;
    profile.todayTieBets = 0;
    saveProfile();
  }
}

// ============================================================================
// SECTION 21: Bankrupt Recovery (~60 lines)
// ============================================================================

function checkBankrupt() {
  if (profile.stars <= 0) {
    profile.stars = STARTING_STARS;
    saveProfile();
    showToast(t('bankrupt_recover'), 3000);
    showConfetti(30);
    updateAllUI();
  }
}

function recoverStars() {
  if (profile.stars > 0) {
    showToast(t('not_bankrupt'), 2000);
    return;
  }
  profile.stars = STARTING_STARS;
  saveProfile();
  updateAllUI();
  hideOverlay('bankrupt-overlay');
}

// ============================================================================
// SECTION 22: Firebase Online Module (~500 lines)
// ============================================================================

const Online = {
  ready: function() {
    if (!firebaseOK()) return Promise.reject(new Error('Firebase not ready'));
    return Promise.resolve(true);
  },

  goOnline: function() {
    if (!firebaseOK()) return;
    try {
      const userId = profile.userId;
      const dbRef = firebase.database().ref('baccaratPresence/' + userId);
      dbRef.set({
        nickname: profile.nickname,
        avatar: profile.avatar,
        stars: profile.stars,
        lastSeen: firebase.database.ServerValue.TIMESTAMP
      }).catch(function() {});
    } catch (e) {}
  },

  goOffline: function() {
    if (!firebaseOK()) return;
    try {
      const userId = profile.userId;
      firebase.database().ref('baccaratPresence/' + userId).remove().catch(function() {});
    } catch (e) {}
  },

  getOnlineCount: function() {
    if (!firebaseOK()) return Promise.resolve(0);
    return firebase.database().ref('baccaratPresence').once('value')
      .then(function(snap) { return snap.numChildren(); })
      .catch(function() { return 0; });
  },

  getLeaderboard: function(tab) {
    if (!firebaseOK()) return Promise.resolve([]);
    return fetchRanking(tab);
  },

  submitToLeaderboard: function(data) {
    if (!firebaseOK()) return Promise.resolve();
    return submitScore();
  },

  createRoom: function(title, wager) {
    if (!firebaseOK()) return Promise.reject(new Error('Firebase not ready'));

    const code = Math.random().toString(36).substr(2, 4).toUpperCase();
    const roomRef = firebase.database().ref('baccaratRooms/' + code);

    return roomRef.set({
      code: code,
      title: title,
      hostId: profile.userId,
      hostName: profile.nickname,
      wager: wager,
      maxPlayers: 8,
      status: 'waiting',
      players: {},
      createdAt: firebase.database.ServerValue.TIMESTAMP
    }).then(function() {
      return code;
    }).catch(function() {
      return null;
    });
  },

  joinRoom: function(code) {
    if (!firebaseOK()) return Promise.reject(new Error('Firebase not ready'));

    const roomRef = firebase.database().ref('baccaratRooms/' + code);
    return roomRef.once('value').then(function(doc) {
      if (!doc.val()) return Promise.reject(new Error('Room not found'));

      const room = doc.val();
      room.players = room.players || {};
      room.players[profile.userId] = {
        name: profile.nickname,
        avatar: profile.avatar,
        stars: profile.stars
      };

      return roomRef.update({ players: room.players }).then(function() {
        return room;
      });
    }).catch(function(e) {
      return Promise.reject(e);
    });
  },

  leaveRoom: function(code) {
    if (!firebaseOK()) return Promise.resolve();

    const roomRef = firebase.database().ref('baccaratRooms/' + code);
    return roomRef.once('value').then(function(doc) {
      if (!doc.val()) return;

      const room = doc.val();
      room.players = room.players || {};
      delete room.players[profile.userId];

      return roomRef.update({ players: room.players });
    }).catch(function() {});
  },

  getOpenRooms: function() {
    if (!firebaseOK()) return Promise.resolve([]);

    return firebase.database().ref('baccaratRooms').once('value')
      .then(function(snap) {
        const rooms = [];
        snap.forEach(function(childSnap) {
          const room = childSnap.val();
          if (room && room.status === 'waiting') {
            rooms.push(room);
          }
        });
        return rooms.sort(function(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
      })
      .catch(function() {
        return [];
      });
  },

  onRoomUpdate: function(code, callback) {
    if (!firebaseOK()) return function() {};

    const roomRef = firebase.database().ref('baccaratRooms/' + code);
    return roomRef.on('value', function(doc) {
      if (doc.val()) {
        callback(doc.val());
      }
    }, function() {});
  },

  onPresenceChange: function(callback) {
    if (!firebaseOK()) return function() {};

    return firebase.database().ref('baccaratPresence').on('value', function(snap) {
      const players = [];
      snap.forEach(function(childSnap) {
        players.push(childSnap.val());
      });
      callback(players);
    }, function() {});
  }
};

// ============================================================================
// SECTION 23: Event Listeners (~450 lines)
// ============================================================================

function setupListeners() {
  const root = document.getElementById('kk-root');
  if (!root) return;

  root.addEventListener('click', function(e) {
    const target = e.target.closest('[data-action], [data-nav], [data-back], [data-chip], [data-shop-tab], [data-rank-tab], [data-item-id], [data-mission-id]');
    if (!target) return;

    const action = target.getAttribute('data-action');
    const nav = target.getAttribute('data-nav');
    const back = target.getAttribute('data-back');
    const chip = target.getAttribute('data-chip');
    const shopTab = target.getAttribute('data-shop-tab');
    const rankTab = target.getAttribute('data-rank-tab');

    if (nav) {
      playSound('click');
      if (nav === 'home') showScreen('home');
      else if (nav === 'ranking') {
        showScreen('ranking');
        fetchRanking('weekly').then(function(players) {
          renderRankingList('weekly', players);
        });
      }
      else if (nav === 'shop') {
        showScreen('shop');
        renderShop('avatars');
      }
      else if (nav === 'mission') {
        showScreen('mission');
        renderDailyMissions();
        renderAchievements();
      }
      else if (nav === 'profile') {
        showScreen('profile');
        renderProfileScreen();
      }
      return;
    }

    if (back) {
      playSound('click');
      showScreen(back);
      return;
    }

    if (chip) {
      const chipVal = parseInt(chip);
      selectChip(chipVal);
      playSound('click');
      return;
    }

    if (shopTab) {
      playSound('click');
      document.querySelectorAll('[data-shop-tab]').forEach(function(b) {
        b.classList.remove('active');
      });
      target.classList.add('active');
      renderShop(shopTab);
      return;
    }

    if (rankTab) {
      playSound('click');
      document.querySelectorAll('[data-rank-tab]').forEach(function(b) {
        b.classList.remove('active');
      });
      target.classList.add('active');
      fetchRanking(rankTab).then(function(players) {
        renderRankingList(rankTab, players);
      });
      return;
    }

    if (action === 'play-ai') {
      var enterPopup = document.getElementById('room-enter-popup');
      var enterMsg = document.getElementById('room-enter-msg');
      if (enterMsg) enterMsg.textContent = 'Enter the dealer room?';
      if (enterPopup) enterPopup.style.display = 'flex';
      return;
    }

    if (action === 'confirm-room-enter') {
      var enterPopup2 = document.getElementById('room-enter-popup');
      if (enterPopup2) enterPopup2.style.display = 'none';
      playSound('click');
      startAIGame();
      return;
    }

    if (action === 'cancel-room-enter') {
      var enterPopup3 = document.getElementById('room-enter-popup');
      if (enterPopup3) enterPopup3.style.display = 'none';
      return;
    }

    if (action === 'play-online') {
      playSound('click');
      showOverlay('room-panel');
      Online.getOpenRooms().then(function(rooms) {
        const list = document.getElementById('room-list');
        if (!list) return;
        list.innerHTML = '';
        if (rooms.length === 0) {
          list.innerHTML = '<div style="color:#94a3b8;padding:16px;text-align:center">' + t('no_rooms') + '</div>';
          return;
        }
        rooms.forEach(function(room) {
          const card = document.createElement('div');
          card.style.cssText = 'background:#2d1b4e;border:2px solid #3d2463;padding:12px;border-radius:8px;margin-bottom:8px;cursor:pointer';
          card.onclick = function() {
            Online.joinRoom(room.code).then(function() {
              showToast(t('joined_room'), 2000);
              hideOverlay('room-panel');
            }).catch(function() {
              showToast(t('join_failed'), 2000);
            });
          };
          let html = '<div style="color:#d4af37;font-weight:bold">' + room.title + '</div>';
          html += '<div style="color:#94a3b8;font-size:12px;margin:4px 0">' + t('host') + ': ' + room.hostName + '</div>';
          html += '<div style="color:#94a3b8;font-size:12px">' + Object.keys(room.players || {}).length + ' / ' + room.maxPlayers + ' ' + t('players') + ' | ' + t('wager') + ': ' + formatNumber(room.wager) + '</div>';
          card.innerHTML = html;
          list.appendChild(card);
        });
      });
      return;
    }

    if (action === 'clear-bet') {
      playSound('click');
      clearBet();
      return;
    }

    if (action === 'confirm-bet') {
      playSound('click');
      showBetConfirm();
      return;
    }

    if (action === 'do-deal') {
      playSound('click');
      dealRound();
      return;
    }

    if (action === 'cancel-confirm') {
      var cp = document.getElementById('bet-confirm-popup');
      if (cp) cp.style.display = 'none';
      return;
    }

    if (action === 'bet-player') {
      placeBet('player');
      return;
    }

    if (action === 'bet-banker') {
      placeBet('banker');
      return;
    }

    if (action === 'bet-tie') {
      placeBet('tie');
      return;
    }

    if (action === 'bet-ppair') {
      placeBet('ppair');
      return;
    }

    if (action === 'bet-bpair') {
      placeBet('bpair');
      return;
    }

    if (action === 'toggle-sound') {
      toggleSetting('sound');
      return;
    }

    if (action === 'toggle-vibrate') {
      toggleSetting('vibration');
      return;
    }

    if (action === 'toggle-notif') {
      toggleSetting('notifications');
      return;
    }

    if (action === 'toggle-autodeal') {
      toggleSetting('autodeal');
      return;
    }

    if (action === 'create-room') {
      const titleInput = document.getElementById('room-title-input');
      const wagerInput = document.getElementById('wager-input');
      if (!titleInput || !wagerInput) return;

      const title = titleInput.value.trim();
      const wager = parseInt(wagerInput.value) || 1000;

      if (!title || title.length === 0 || title.length > 30) {
        showToast(t('invalid_room_title'), 2000);
        return;
      }

      if (wager < 100 || wager > profile.stars) {
        showToast(t('invalid_wager'), 2000);
        return;
      }

      Online.createRoom(title, wager).then(function(code) {
        if (!code) {
          showToast(t('create_room_failed'), 2000);
          return;
        }
        showToast(t('room_created') + ' ' + code, 2000);
        titleInput.value = '';
        wagerInput.value = '1000';
      });
      return;
    }

    if (action === 'close-result') {
      hideOverlay('result-overlay');
      gameState.inProgress = false;
      gameState.currentBet = null;
      gameState.betAmount = 0;
      gameState.selectedChip = CHIPS[0];
      renderGameTable();
      renderChips();
      renderBetZones();
      updateBetTotal();
      updateAllUI();
      return;
    }

    if (action === 'claim-daily') {
      claimDailyBonus();
      return;
    }

    const missionId = target.getAttribute('data-mission-id');
    if (action === 'claim-mission' && missionId) {
      claimMissionReward(missionId);
      return;
    }

    const shopTabAttr = target.getAttribute('data-shop-tab');
    const itemId = target.getAttribute('data-item-id');
    if (action === 'buy-item' && shopTabAttr && itemId) {
      buyItem(shopTabAttr, itemId);
      return;
    }

    if (action === 'equip-item' && shopTabAttr && itemId) {
      equipItem(shopTabAttr, itemId);
      return;
    }

    if (action === 'open-settings') {
      showScreen('settings');
      renderSettingsState();
      return;
    }

    if (action === 'open-tutorial') {
      showScreen('tutorial');
      showTutorialStep(0);
      return;
    }

    if (action === 'open-history') {
      showOverlay('history-panel');
      renderHistory();
      return;
    }

    if (action === 'open-stats') {
      showOverlay('stats-panel');
      renderStatistics();
      return;
    }

    if (action === 'roadmap') {
      showOverlay('roadmap-panel');
      renderBigRoad();
      renderBeadPlate();
      return;
    }

    if (action === 'close-overlay') {
      const parent = target.closest('.overlay');
      if (parent) {
        hideOverlay(parent.id);
      }
      return;
    }

    if (action === 'new-shoe') {
      createShoe();
      showToast(t('shoe_reshuffled'), 2000);
      updateAllUI();
      return;
    }

    if (action === 'save-nickname') {
      saveNickname();
      return;
    }

    if (action === 'reset-stats') {
      resetAllStats();
      return;
    }

    if (action === 'bankrupt-recover') {
      recoverStars();
      return;
    }

    if (action === 'prev-tut') {
      prevTutStep();
      return;
    }

    if (action === 'next-tut') {
      nextTutStep();
      return;
    }

    if (action === 'finish-tut') {
      finishTutorial();
      return;
    }

    // Back buttons
    if (action === 'settings-back' || action === 'tutorial-back') {
      playSound('click');
      showScreen('home');
      return;
    }

    if (action === 'back-to-home') {
      if (gameState.mode) {
        var exitPopup = document.getElementById('room-exit-popup');
        if (exitPopup) exitPopup.style.display = 'flex';
      } else {
        playSound('click');
        showScreen('home');
      }
      return;
    }

    if (action === 'confirm-room-exit') {
      var exitPopup2 = document.getElementById('room-exit-popup');
      if (exitPopup2) exitPopup2.style.display = 'none';
      gameState.mode = null;
      gameState.inProgress = false;
      playSound('click');
      showScreen('home');
      return;
    }

    if (action === 'cancel-room-exit') {
      var exitPopup3 = document.getElementById('room-exit-popup');
      if (exitPopup3) exitPopup3.style.display = 'none';
      return;
    }

    // Join room from room list card
    if (action === 'join-room') {
      var roomCode = target.getAttribute('data-room-code');
      if (roomCode) {
        Online.joinRoom(roomCode).then(function() {
          showToast(t('joined_room'), 2000);
          hideOverlay('room-panel');
        }).catch(function() {
          showToast(t('join_failed'), 2000);
        });
      }
      return;
    }
  });

  // Language select change handler
  root.addEventListener('change', function(e) {
    var target = e.target;
    if (target.id === 'lang-select') {
      changeLang(target.value);
      // Re-render all visible screens
      renderProfileScreen();
      renderSettingsState();
      return;
    }
    if (target.id === 'speed-select') {
      changeSpeed(target.value);
      return;
    }
  });
}

// ============================================================================
// SECTION 24: Init & Startup (~100 lines)
// ============================================================================

function init() {
  boot();
  loadProfile();
  loadSettings();
  loadShopData();
  loadDailyMission();
  loadHistory();
  lang = settings.language || 'en';
  applyTheme();

  gameState = {
    mode: null,
    currentBet: null,
    betAmount: 0,
    selectedChip: CHIPS[0],
    players: [],
    round: 0,
    playerCards: [],
    bankerCards: [],
    playerScore: 0,
    bankerScore: 0,
    roadMap: [],
    inProgress: false
  };

  onlineState = { roomCode: null, isHost: false, players: [] };

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

  try {
    ensureFirebaseInit().then(function() {
      Online.ready().then(function() {
        Online.goOnline();
      }).catch(function() {});
    }).catch(function() {});
  } catch (e) {}
}

function safeStart() {
  try {
    init();
  } catch (e) {
    document.body.style.cssText = 'margin:0;padding:20px;background:#0f0a2a;color:#ff4444;font-family:monospace';
    document.body.innerHTML = '<h2 style="color:#d4af37">FA Baccarat Error</h2><pre style="white-space:pre-wrap;color:#ff6b6b;margin-top:12px">' + String(e.message || e) + '\n' + String(e.stack || '') + '</pre>';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeStart);
} else {
  safeStart();
}

// Additional UI refinement: Add inline styling for animations
const ANIMATION_CSS = `
@keyframes slideIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes flip {
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(90deg); }
  100% { transform: rotateY(0deg); }
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

@keyframes confettiFall {
  to {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

@keyframes particleFloat {
  to {
    transform: translateY(-100px);
    opacity: 0;
  }
}

.active { 
  opacity: 1 !important;
  pointer-events: auto !important;
}
`;

// Enhanced audio initialization with polyfill
function ensureAudioContext() {
  if (!audioContext) {
    initAudio();
  }
  return audioContext;
}

// Helper: Generate random color for particles
function randomGoldShade() {
  const shades = ['#d4af37', '#ffd700', '#ffed4e', '#daa520', '#b8860b'];
  return shades[Math.floor(Math.random() * shades.length)];
}

// Helper: Safely update HTML without XSS
function safeSetInner(el, content) {
  if (!el) return;
  el.textContent = '';
  if (typeof content === 'string') {
    const div = document.createElement('div');
    div.innerHTML = content;
    while (div.firstChild) {
      el.appendChild(div.firstChild);
    }
  }
}

// Game state validator
function validateGameState() {
  if (!gameState) return false;
  return gameState.mode && gameState.players && gameState.players.length > 0;
}

// Session storage for temporary game state
function saveGameSession() {
  if (!gameState) return;
  const session = {
    gameState: gameState,
    sessionStats: sessionStats,
    lastBet: lastBet,
    timestamp: Date.now()
  };
  try {
    sessionStorage.setItem('bac_session_v2', JSON.stringify(session));
  } catch (e) {}
}

function restoreGameSession() {
  try {
    const stored = sessionStorage.getItem('bac_session_v2');
    if (stored) {
      const session = JSON.parse(stored);
      if (session.timestamp && Date.now() - session.timestamp < 3600000) {
        gameState = session.gameState;
        sessionStats = session.sessionStats;
        lastBet = session.lastBet;
        return true;
      }
    }
  } catch (e) {}
  return false;
}

// Enhanced profile validation
function validateProfile() {
  const required = ['userId', 'nickname', 'avatar', 'stars', 'level', 'totalPlayed'];
  return required.every(function(key) {
    return profile.hasOwnProperty(key);
  });
}

// Enhanced mission progress calculation
function getMissionRemaining(missionId) {
  const m = dailyMission[missionId];
  if (!m) return 0;
  return Math.max(0, m.target - m.current);
}

// Enhanced statistics with time-based analysis
function getTimeBasedStats() {
  const now = Date.now();
  const sessionDuration = now - sessionStats.startTime;
  const handsPerHour = sessionStats.handsPlayed > 0 
    ? Math.round(sessionStats.handsPlayed / (sessionDuration / 3600000))
    : 0;
  
  return {
    sessionDuration: sessionDuration,
    handsPerHour: handsPerHour,
    avgHandTime: sessionStats.handsPlayed > 0 
      ? Math.round(sessionDuration / sessionStats.handsPlayed / 1000)
      : 0
  };
}

// Enhanced room rendering - uses existing HTML elements from boot()
function renderRoomPanel() {
  var roomList = document.getElementById('room-list');
  if (!roomList) return;
  roomList.innerHTML = '<div style="text-align:center;padding:20px;color:#94a3b8">' + t('loading') + '</div>';
  // Fetch open rooms from Firebase
  Online.getOpenRooms().then(function(rooms) {
    if (!rooms || rooms.length === 0) {
      roomList.innerHTML = '<div style="text-align:center;padding:20px;color:#94a3b8">' + t('no_rooms_available') + '</div>';
      return;
    }
    roomList.innerHTML = '';
    rooms.forEach(function(room) {
      var card = document.createElement('div');
      card.className = 'room-card';
      card.setAttribute('data-action', 'join-room');
      card.setAttribute('data-room-code', room.code);
      var playerCount = Object.keys(room.players || {}).length;
      card.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center">' +
        '<div><div style="font-weight:700;color:#ffd700">' + (room.title || 'Room ' + room.code) + '</div>' +
        '<div style="font-size:11px;color:#94a3b8">' + t('hosted_by') + ' ' + (room.hostName || 'Host') + '</div></div>' +
        '<div style="text-align:right"><div style="color:#ffd700;font-weight:700">' + formatNumber(room.wager) + ' ⭐</div>' +
        '<div style="font-size:11px;color:#94a3b8">' + playerCount + '/' + (room.maxPlayers || 8) + '</div></div></div>';
      roomList.appendChild(card);
    });
  }).catch(function() {
    roomList.innerHTML = '<div style="text-align:center;padding:20px;color:#94a3b8">' + t('no_rooms_available') + '</div>';
  });
}

// Enhanced history with export capability
function exportHistory() {
  if (gameHistory.length === 0) {
    showToast(t('no_history'), 2000);
    return;
  }

  let csv = 'Hand,Result,Type,Amount,Player Score,Banker Score,Timestamp\n';
  gameHistory.forEach(function(hand, idx) {
    csv += (idx + 1) + ',' + hand.result + ',' + hand.type + ',' + hand.amount + ',' + 
           hand.playerScore + ',' + hand.bankerScore + ',' + new Date(hand.timestamp).toISOString() + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'baccarat_history_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Enhanced achievement conditions with detailed tracking
function updateAchievementProgress() {
  const progress = {};

  ACHIEVEMENTS.forEach(function(ach) {
    let value = 0;
    if (ach.id === 'first_win') value = Math.min(1, profile.totalWins);
    else if (ach.id === 'ten_wins') value = Math.min(10, profile.totalWins);
    else if (ach.id === 'hundred_wins') value = Math.min(100, profile.totalWins);
    else if (ach.id === 'banker_lover') value = Math.min(50, profile.bankerBets);
    else if (ach.id === 'tie_believer') value = Math.min(5, profile.tieWins);
    else if (ach.id === 'pair_master') value = Math.min(10, profile.pairWins);
    else if (ach.id === 'big_bettor') value = Math.min(50000, profile.biggestBet);
    else if (ach.id === 'lucky_streak') value = Math.min(10, profile.bestStreak);
    else if (ach.id === 'high_roller') value = Math.min(100000, profile.peakStars);

    progress[ach.id] = {
      current: value,
      target: ach.target || 1
    };
  });

  return progress;
}

// Enhanced round analytics
function analyzeRound() {
  if (gameHistory.length === 0) return null;

  const last10 = gameHistory.slice(-10);
  const playerWins = last10.filter(function(h) { return h.result === 'player'; }).length;
  const bankerWins = last10.filter(function(h) { return h.result === 'banker'; }).length;
  const ties = last10.filter(function(h) { return h.result === 'tie'; }).length;

  return {
    last10Trend: {
      player: playerWins,
      banker: bankerWins,
      tie: ties
    },
    lastResult: last10[last10.length - 1] ? last10[last10.length - 1].result : null,
    streak: profile.currentStreak,
    recentAvgBet: last10.length > 0 
      ? Math.round(last10.reduce(function(sum, h) { return sum + h.amount; }, 0) / last10.length)
      : 0
  };
}

// Enhanced UI state persistence
function saveUIState() {
  try {
    const uiState = {
      currentScreen: document.querySelector('.screen.active')?.className || 'sc-home',
      shopTab: document.querySelector('[data-shop-tab].active')?.getAttribute('data-shop-tab') || 'avatars',
      rankTab: document.querySelector('[data-rank-tab].active')?.getAttribute('data-rank-tab') || 'weekly',
      timestamp: Date.now()
    };
    sessionStorage.setItem('bac_ui_state_v2', JSON.stringify(uiState));
  } catch (e) {}
}

function restoreUIState() {
  try {
    const stored = sessionStorage.getItem('bac_ui_state_v2');
    if (stored) {
      const state = JSON.parse(stored);
      if (Date.now() - state.timestamp < 3600000) {
        return state;
      }
    }
  } catch (e) {}
  return null;
}

// Network state monitoring
function setupNetworkListener() {
  window.addEventListener('online', function() {
    showToast(t('back_online'), 2000);
    if (firebaseOK()) {
      Online.goOnline();
    }
  });

  window.addEventListener('offline', function() {
    showToast(t('offline_mode'), 2000);
  });
}

// Enhanced profile backup/restore
function backupProfile() {
  const backup = {
    profile: profile,
    settings: settings,
    shopData: shopData,
    gameHistory: gameHistory,
    timestamp: Date.now()
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'baccarat_backup_' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Enhanced XP distribution for different actions
function awardXpForAction(action, amount) {
  const xpMap = {
    'win': 50,
    'bet': 10,
    'natural': 200,
    'pair': 100,
    'mission': 25,
    'daily': 15
  };

  const xp = xpMap[action] || 0;
  if (xp > 0) {
    addXp(xp);
  }
}

// Performance monitoring
function trackPerformance() {
  const perf = {
    totalHandsPlayed: sessionStats.handsPlayed,
    profitNow: sessionStats.netProfit,
    biggestWinNow: sessionStats.biggestWin,
    timeElapsed: Date.now() - sessionStats.startTime,
    roiPercent: profile.totalPlayed > 0 
      ? ((profile.totalWins / profile.totalPlayed) * 100).toFixed(1)
      : 0
  };
  return perf;
}

// Clean shutdown
function cleanShutdown() {
  saveGameSession();
  saveUIState();
  saveProfile();
  saveSettings();
  saveShopData();
  saveDailyMission();
  saveHistory();
  
  if (firebaseOK()) {
    try {
      Online.goOffline();
    } catch (e) {}
  }
}

// Auto-save on page unload
window.addEventListener('beforeunload', function() {
  cleanShutdown();
});

// Periodic auto-save
setInterval(function() {
  cleanShutdown();
}, 30000);

// Enhanced error recovery
function recoverFromError(error) {
  console.error('Game Error:', error);
  
  try {
    if (!validateProfile()) {
      loadProfile();
    }
    
    if (!gameState) {
      gameState = {
        mode: null,
        currentBet: null,
        betAmount: 0,
        selectedChip: CHIPS[0],
        players: [],
        round: 0,
        playerCards: [],
        bankerCards: [],
        playerScore: 0,
        bankerScore: 0,
        roadMap: [],
        inProgress: false
      };
    }

    showToast(t('error_recovered'), 2000);
  } catch (e) {
    console.error('Recovery failed:', e);
  }
}

// Global error handler
window.addEventListener('error', function(event) {
  recoverFromError(event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
  recoverFromError(event.reason);
});

})();
