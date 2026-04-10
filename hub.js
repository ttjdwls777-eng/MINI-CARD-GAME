/* =============================================================================
 *  FA Baccarat · Premium VIP Casino Edition
 *  Single-file, self-mounting, vanilla JS Baccarat (Punto Banco)
 * ============================================================================= */
(function () {
  'use strict';

  /* ═══ CONSTANTS ═══ */
  const STORE_KEY    = 'fa_baccarat_profile_v2';
  const RANK_KEY     = 'fa_baccarat_ranks_v2';
  const SETTINGS_KEY = 'fa_baccarat_settings_v2';
  const SHOP_KEY     = 'fa_baccarat_shop_v2';
  const ACHIEVE_KEY  = 'fa_baccarat_achievements_v2';
  const STARTING_STARS = 10000;
  const DAILY_BONUS    = 100;

  const SHOP_ITEMS = [
    {id:'avatar_ace',type:'avatar',name:'Ace',emoji:'🃏',price:0},
    {id:'avatar_crown',type:'avatar',name:'Crown',emoji:'👑',price:60000},
    {id:'avatar_diamond',type:'avatar',name:'Diamond',emoji:'💎',price:90000},
    {id:'avatar_fire',type:'avatar',name:'Fire',emoji:'🔥',price:105000},
    {id:'avatar_star',type:'avatar',name:'Star',emoji:'⭐',price:120000},
    {id:'avatar_dragon',type:'avatar',name:'Dragon',emoji:'🐉',price:135000},
    {id:'avatar_rocket',type:'avatar',name:'Rocket',emoji:'🚀',price:150000},
    {id:'avatar_money',type:'avatar',name:'Money',emoji:'💰',price:180000},
    {id:'table_classic',type:'table',name:'Classic Green',emoji:'🟩',price:0},
    {id:'table_royal',type:'table',name:'Royal Blue',emoji:'🔵',price:80000},
    {id:'table_ruby',type:'table',name:'Ruby Red',emoji:'🔴',price:120000},
    {id:'table_gold',type:'table',name:'Gold VIP',emoji:'🟡',price:200000},
    {id:'back_red',type:'cardback',name:'Red Classic',emoji:'🎴',price:0},
    {id:'back_blue',type:'cardback',name:'Blue Royal',emoji:'🔷',price:50000},
    {id:'back_gold',type:'cardback',name:'Gold Luxury',emoji:'✨',price:150000},
    {id:'back_black',type:'cardback',name:'Black Diamond',emoji:'♠️',price:250000},
  ];

  const ACHIEVEMENTS = [
    {id:'first_win',name:'First Win',desc:'Win your first game',star:50,icon:'🥇',check:p=>p.totalWins>=1},
    {id:'wins_5',name:'Rookie',desc:'5 wins',star:80,icon:'🌟',check:p=>p.totalWins>=5},
    {id:'wins_25',name:'Veteran',desc:'25 wins',star:200,icon:'⭐',check:p=>p.totalWins>=25},
    {id:'wins_100',name:'Master',desc:'100 wins',star:1000,icon:'🏆',check:p=>p.totalWins>=100},
    {id:'streak_3',name:'Flame',desc:'3 win streak',star:120,icon:'🔥',check:p=>p.bestStreak>=3},
    {id:'streak_5',name:'Storm',desc:'5 win streak',star:250,icon:'⚡',check:p=>p.bestStreak>=5},
    {id:'streak_10',name:'Legend',desc:'10 win streak',star:800,icon:'💫',check:p=>p.bestStreak>=10},
    {id:'tie_lucky',name:'Lucky Tie',desc:'Hit a Tie',star:300,icon:'🎯',check:p=>p.tieWins>=1},
    {id:'banker_10',name:'Banker Master',desc:'10 Banker wins',star:500,icon:'🏛️',check:p=>p.bankerWins>=10},
    {id:'player_10',name:'Player Champ',desc:'10 Player wins',star:500,icon:'🎪',check:p=>p.playerWins>=10},
    {id:'big_bet',name:'High Roller',desc:'Bet 10K+',star:600,icon:'💰',check:p=>p.maxBet>=10000},
    {id:'games_50',name:'Enthusiast',desc:'50 games',star:150,icon:'🎮',check:p=>p.totalGames>=50},
  ];

  const BOT_NAMES = [
    'Diamond Mike','Ace Baron','Gold Rush','Royal Flush','Blackjack Kate',
    'Roulette Roy','Chips Charlie','Jackpot Jenny','Vegas Victor','Dealer Dan',
    'Fortune Frank','Lucky Lucy','Casino Chris','Winning Walter','Vault Vanessa',
    'Platinum Pete','Silver Sally','Crystal Kevin','Marble Mary','Steel Steve',
  ];

  const SUITS = ['♠','♥','♦','♣'];
  const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

  /* ═══ i18n ═══ */
  const I18N = {
    en:{app_title:'Baccarat',nav_home:'Home',nav_rank:'Ranking',nav_shop:'Shop',nav_mission:'Mission',nav_profile:'Profile',play_ai:'Play vs Dealer',play_online:'Online Table',daily_checkin:'Daily Check-in',stars:'Stars',level:'Level',wins:'Wins',streak:'Streak',deal:'Deal',player:'Player',banker:'Banker',tie:'Tie',natural:'Natural',you_win:'You Win!',you_lose:'You Lose',tie_push:'Push',bet_returned:'Bet Returned',not_enough:'Not enough stars',need_stars:'You need {0} stars',settings:'Settings',sound:'Sound',vibrate:'Vibration',language:'Language',total_rank:'Total',weekly_top:'Weekly Top 7',last_week:'Last Week Top 7',shop_title:'Shop',avatars:'Avatars',tables:'Tables',card_backs:'Card Backs',equipped:'Equipped',equip:'Equip',locked:'Locked',purchase:'Buy',missions_title:'Missions',daily_m:'Daily',achievement:'Achievements',profile:'Profile',reset_stats:'Reset Stats',tutorial:'How to Play',home:'Home',confirm_reset:'Reset all stats?',ok:'OK',cancel:'Cancel',claim:'Claim'},
    ko:{app_title:'바카라',nav_home:'홈',nav_rank:'랭킹',nav_shop:'상점',nav_mission:'미션',nav_profile:'프로필',play_ai:'딜러와 대결',play_online:'온라인 테이블',daily_checkin:'출석 체크',stars:'스타',level:'레벨',wins:'승리',streak:'연승',deal:'딜',player:'플레이어',banker:'뱅커',tie:'타이',natural:'내추럴',you_win:'승리!',you_lose:'패배',tie_push:'무승부',bet_returned:'베팅 반환',not_enough:'스타 부족',need_stars:'{0} 스타가 필요합니다',settings:'설정',sound:'효과음',vibrate:'진동',language:'언어',total_rank:'전체',weekly_top:'주간 TOP 7',last_week:'지난주 TOP 7',shop_title:'상점',avatars:'아바타',tables:'테이블',card_backs:'카드 뒷면',equipped:'장착중',equip:'장착',locked:'잠김',purchase:'구매',missions_title:'미션',daily_m:'일일',achievement:'업적',profile:'프로필',reset_stats:'초기화',tutorial:'게임방법',home:'홈',confirm_reset:'모든 기록을 초기화할까요?',ok:'확인',cancel:'취소',claim:'받기'},
    ja:{app_title:'バカラ',nav_home:'ホーム',nav_rank:'ランキング',nav_shop:'ショップ',nav_mission:'ミッション',nav_profile:'プロフィール',play_ai:'ディーラー対戦',play_online:'オンライン',daily_checkin:'デイリー',stars:'スター',level:'レベル',wins:'勝利',streak:'連勝',deal:'ディール',player:'プレイヤー',banker:'バンカー',tie:'タイ',natural:'ナチュラル',you_win:'勝利！',you_lose:'敗北',tie_push:'引き分け',bet_returned:'返金',not_enough:'スター不足',need_stars:'{0}スター必要',settings:'設定',sound:'サウンド',vibrate:'振動',language:'言語',total_rank:'合計',weekly_top:'週間TOP7',last_week:'先週TOP7',shop_title:'ショップ',avatars:'アバター',tables:'テーブル',card_backs:'カード裏',equipped:'装備中',equip:'装備',locked:'ロック',purchase:'購入',missions_title:'ミッション',daily_m:'デイリー',achievement:'実績',profile:'プロフィール',reset_stats:'リセット',tutorial:'遊び方',home:'ホーム',confirm_reset:'リセットしますか？',ok:'OK',cancel:'キャンセル',claim:'受取'},
    zh:{app_title:'百家乐',nav_home:'首页',nav_rank:'排行',nav_shop:'商店',nav_mission:'任务',nav_profile:'个人',play_ai:'对战庄家',play_online:'在线桌',daily_checkin:'每日签到',stars:'星星',level:'等级',wins:'胜利',streak:'连胜',deal:'发牌',player:'闲家',banker:'庄家',tie:'和局',natural:'天牌',you_win:'你赢了！',you_lose:'你输了',tie_push:'平局',bet_returned:'退还',not_enough:'星星不足',need_stars:'需要{0}星',settings:'设置',sound:'音效',vibrate:'振动',language:'语言',total_rank:'总榜',weekly_top:'周榜前7',last_week:'上周前7',shop_title:'商店',avatars:'头像',tables:'桌面',card_backs:'卡背',equipped:'已装备',equip:'装备',locked:'锁定',purchase:'购买',missions_title:'任务',daily_m:'每日',achievement:'成就',profile:'个人',reset_stats:'重置',tutorial:'玩法',home:'首页',confirm_reset:'确认重置？',ok:'确定',cancel:'取消',claim:'领取'},
    vi:{app_title:'Baccarat',nav_home:'Trang chủ',nav_rank:'Xếp hạng',nav_shop:'Cửa hàng',nav_mission:'Nhiệm vụ',nav_profile:'Hồ sơ',play_ai:'Chơi AI',play_online:'Trực tuyến',daily_checkin:'Điểm danh',stars:'Sao',level:'Cấp',wins:'Thắng',streak:'Chuỗi',deal:'Chia bài',player:'Người chơi',banker:'Nhà cái',tie:'Hòa',natural:'Tự nhiên',you_win:'Bạn thắng!',you_lose:'Bạn thua',tie_push:'Hòa',bet_returned:'Hoàn tiền',not_enough:'Không đủ sao',need_stars:'Cần {0} sao',settings:'Cài đặt',sound:'Âm thanh',vibrate:'Rung',language:'Ngôn ngữ',total_rank:'Tổng',weekly_top:'Top 7 tuần',last_week:'Top 7 tuần trước',shop_title:'Cửa hàng',avatars:'Avatar',tables:'Bàn',card_backs:'Lưng bài',equipped:'Đã dùng',equip:'Dùng',locked:'Khóa',purchase:'Mua',missions_title:'Nhiệm vụ',daily_m:'Hàng ngày',achievement:'Thành tựu',profile:'Hồ sơ',reset_stats:'Đặt lại',tutorial:'Hướng dẫn',home:'Trang chủ',confirm_reset:'Đặt lại tất cả?',ok:'OK',cancel:'Hủy',claim:'Nhận'},
    th:{app_title:'บาคาร่า',nav_home:'หน้าแรก',nav_rank:'อันดับ',nav_shop:'ร้านค้า',nav_mission:'ภารกิจ',nav_profile:'โปรไฟล์',play_ai:'เล่นกับ AI',play_online:'ออนไลน์',daily_checkin:'เช็คอิน',stars:'ดาว',level:'เลเวล',wins:'ชนะ',streak:'สตรีค',deal:'แจก',player:'ผู้เล่น',banker:'เจ้ามือ',tie:'เสมอ',natural:'เนเชอรัล',you_win:'คุณชนะ!',you_lose:'คุณแพ้',tie_push:'เสมอ',bet_returned:'คืนเงิน',not_enough:'ดาวไม่พอ',need_stars:'ต้องการ {0} ดาว',settings:'ตั้งค่า',sound:'เสียง',vibrate:'สั่น',language:'ภาษา',total_rank:'รวม',weekly_top:'รายสัปดาห์ Top 7',last_week:'สัปดาห์ก่อน Top 7',shop_title:'ร้านค้า',avatars:'อวตาร',tables:'โต๊ะ',card_backs:'หลังไพ่',equipped:'สวมใส่',equip:'ใช้',locked:'ล็อค',purchase:'ซื้อ',missions_title:'ภารกิจ',daily_m:'รายวัน',achievement:'ความสำเร็จ',profile:'โปรไฟล์',reset_stats:'รีเซ็ต',tutorial:'วิธีเล่น',home:'หน้าแรก',confirm_reset:'รีเซ็ตทั้งหมด?',ok:'ตกลง',cancel:'ยกเลิก',claim:'รับ'},
  };

  /* ═══ CSS ═══ */
  const CSS = `
  :root{--dark:#0a0a0a;--dark2:#111;--dark3:#1a1a1a;--dark4:#222;--gold:#ffd700;--gold2:#ffaa00;--accent:#fff;--red:#ff5a6a;--blue:#5aa9ff;--green:#4ade80;--muted:#888;--safe-top:env(safe-area-inset-top,0px);--safe-bot:env(safe-area-inset-bottom,0px)}
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  html,body{margin:0;padding:0;height:100%;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Pretendard","Malgun Gothic","Noto Sans KR",sans-serif;background:#0a0a0a;color:#fff;-webkit-user-select:none;user-select:none}
  button,input,textarea,select{font-family:inherit}
  button{cursor:pointer;border:none;outline:none}
  #kk-root{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 50%,#0a0a0a 100%)}
  #kk-root::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(600px 400px at 15% 20%,rgba(255,215,0,.12),transparent 50%),radial-gradient(500px 500px at 85% 80%,rgba(255,170,0,.08),transparent 50%)}
  .stage{position:relative;width:min(100vw,480px);height:min(100svh,920px);max-height:100svh;padding-top:var(--safe-top);padding-bottom:var(--safe-bot);background:linear-gradient(135deg,#111 0%,#1a1a1a 50%,#0a0a0a 100%);overflow:hidden;border-radius:28px;box-shadow:0 18px 44px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.1)}
  @media(max-width:520px){.stage{width:100vw;height:100svh;max-height:100svh;border-radius:0}}
  .screen{position:absolute;inset:0;display:none;flex-direction:column;opacity:0;transition:opacity .3s;overflow-y:auto;-webkit-overflow-scrolling:touch}
  .screen.active{display:flex;opacity:1;z-index:10}
  /* TOPBAR */
  .topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid rgba(255,215,0,.1);background:rgba(26,26,26,.6);flex-shrink:0}
  .brand{display:flex;align-items:center;gap:10px}
  .brand-logo{font-size:24px}.brand-name{font-size:16px;font-weight:900;color:var(--gold)}.brand-name small{display:block;font-size:9px;color:var(--muted);letter-spacing:2px}
  .icon-btn{background:none;color:var(--gold);font-size:18px;padding:8px}
  .lvl-pill{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#000;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:900}
  .star-pill{color:var(--gold);font-weight:900;font-size:13px}
  /* DAILY */
  .daily-card{display:flex;align-items:center;gap:12px;margin:10px 16px;padding:12px 16px;background:linear-gradient(135deg,rgba(255,215,0,.15),rgba(255,170,0,.08));border:1px solid rgba(255,215,0,.2);border-radius:14px}
  .daily-card.hidden{display:none}
  .daily-icon{font-size:28px}.daily-title{font-weight:900;font-size:13px}.daily-sub{font-size:12px;color:var(--gold)}
  .daily-claim{margin-left:auto;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#000;border:none;padding:8px 16px;border-radius:10px;font-weight:900;font-size:12px}
  /* INFO BAR */
  .info-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 16px}
  .info-item{text-align:center;padding:10px 4px;background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.1);border-radius:10px}
  .info-val{font-size:18px;font-weight:900;color:var(--gold)}.info-lbl{font-size:10px;color:var(--muted);margin-top:2px}
  /* HERO */
  .hero{text-align:center;margin:16px 0}.hero-title{font-size:32px;font-weight:900;margin:0;color:var(--gold)}.hero-sub{font-size:11px;color:var(--muted);letter-spacing:4px;margin:4px 0}
  /* MENU */
  .menu{padding:0 16px;flex:1;display:flex;flex-direction:column;gap:10px;justify-content:center}
  .main-btn{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;font-size:14px;font-weight:700;color:#fff;border:none;width:100%;text-align:left}
  .main-btn.primary{background:linear-gradient(135deg,rgba(255,215,0,.2),rgba(255,170,0,.1));border:1px solid rgba(255,215,0,.3)}
  .main-btn.secondary{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)}
  .mb-ico{font-size:24px;width:40px;text-align:center}.mb-title{font-weight:900}.mb-sub{font-size:11px;color:var(--muted)}.mb-arrow{margin-left:auto;color:var(--gold);font-size:20px}
  /* FOOTER NAV */
  .footer-nav{display:flex;justify-content:space-around;padding:8px 0;margin-top:auto;border-top:1px solid rgba(255,215,0,.1);background:rgba(10,10,10,.9);margin-bottom:calc(var(--safe-bot) + 28px);flex-shrink:0}
  .fnav{background:none;color:var(--muted);display:flex;flex-direction:column;align-items:center;gap:2px;font-size:10px;padding:6px 12px;transition:.2s}
  .fnav .i{font-size:18px}.fnav.on{color:var(--gold)}
  @media(min-width:521px){.footer-nav{margin-bottom:0}}
  /* GAME SCREEN */
  .game-area{flex:1;display:flex;flex-direction:column;align-items:center;padding:12px 16px;gap:8px;overflow-y:auto}
  .avatar-area{text-align:center}.avatar-frame{font-size:36px;width:56px;height:56px;display:flex;align-items:center;justify-content:center;margin:0 auto;border-radius:50%;border:2px solid var(--gold);box-shadow:0 0 12px rgba(255,215,0,.3)}.avatar-name{font-size:11px;color:var(--muted);margin-top:2px}
  .cards-row{display:flex;gap:8px;justify-content:center}
  .card{width:52px;height:72px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;border:2px solid rgba(255,215,0,.15);background:linear-gradient(135deg,#1a1a1a,#222);color:#fff;transition:transform .4s}
  .card.red{color:var(--red)}.card.flipped{transform:rotateY(360deg)}
  .score-badge{font-size:20px;font-weight:900;color:var(--gold);padding:2px 12px;background:rgba(255,215,0,.1);border-radius:8px;min-width:40px;text-align:center}
  .result-banner{padding:12px;text-align:center;font-size:18px;font-weight:900;border-radius:10px;margin:4px 0}
  .result-banner.hidden{display:none}
  .result-banner.win{background:linear-gradient(135deg,rgba(255,215,0,.3),rgba(255,170,0,.15));color:var(--gold)}
  .result-banner.lose{background:rgba(255,90,106,.15);color:var(--red)}
  .road-map{display:flex;flex-wrap:wrap;gap:3px;padding:8px;background:rgba(0,0,0,.3);border-radius:8px;min-height:30px}
  .bead{width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900}
  .bead.p{background:var(--blue);color:#fff}.bead.b{background:var(--red);color:#fff}.bead.t{background:var(--green);color:#fff}
  .bet-section{width:100%;margin-top:auto}
  .bet-types{display:flex;gap:8px;justify-content:center;margin-bottom:8px}
  .bet-btn{flex:1;padding:10px 4px;border-radius:10px;text-align:center;font-weight:900;font-size:13px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.1);color:#fff;transition:.2s}
  .bet-btn.active{border-color:var(--gold);background:rgba(255,215,0,.15);color:var(--gold)}
  .chip-selector{display:flex;gap:6px;justify-content:center;margin-bottom:8px;flex-wrap:wrap}
  .chip{padding:6px 12px;border-radius:20px;font-size:11px;font-weight:900;background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.2);color:var(--gold);transition:.2s}
  .chip.selected{background:var(--gold);color:#000}
  .deal-btn{width:100%;padding:14px;border-radius:12px;font-size:16px;font-weight:900;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#000;border:none}
  /* PROFILE */
  .prof-head{text-align:center;padding:20px 16px}
  .prof-head .avatar{font-size:48px;width:72px;height:72px;display:flex;align-items:center;justify-content:center;margin:0 auto;border-radius:50%;border:3px solid var(--gold);box-shadow:0 0 20px rgba(255,215,0,.3)}
  .prof-name{font-size:18px;font-weight:900;margin-top:8px}.prof-rank-pill{font-size:11px;color:var(--gold);margin-top:4px}
  .prof-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0 16px;margin-bottom:16px}
  .stat-card{text-align:center;padding:12px 4px;background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.1);border-radius:10px}
  .stat-card .v{font-size:20px;font-weight:900;color:var(--gold)}.stat-card .l{font-size:10px;color:var(--muted);margin-top:2px}
  .level-box{margin:0 16px 16px;padding:12px;background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.1);border-radius:10px}
  .lv-row{display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:6px}
  .lv-bar{height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden}.lv-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--gold2));border-radius:3px;transition:width .3s}
  .section-title{font-size:11px;font-weight:900;color:var(--muted);padding:8px 16px;letter-spacing:2px}
  .detail-row{display:flex;justify-content:space-between;padding:8px 16px;border-bottom:1px solid rgba(255,255,255,.05)}
  .detail-label{color:var(--muted);font-size:13px}.detail-value{font-weight:700;font-size:13px}
  /* RANKING */
  .tabs{display:flex;gap:4px;padding:8px 16px;flex-shrink:0}
  .tab{flex:1;padding:8px 4px;border-radius:8px;font-size:11px;font-weight:700;text-align:center;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:var(--muted);transition:.2s}
  .tab.on{background:rgba(255,215,0,.15);border-color:rgba(255,215,0,.3);color:var(--gold)}
  .rank-list{flex:1;overflow-y:auto;padding:8px 16px}
  .rank-card{display:flex;align-items:center;gap:10px;padding:10px 12px;margin-bottom:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px}
  .rank-pos{font-size:14px;font-weight:900;color:var(--gold);min-width:28px;text-align:center}.rank-avatar{font-size:22px}.rank-name{font-weight:700;font-size:13px}.rank-sub{font-size:10px;color:var(--muted)}
  .rank-right{margin-left:auto;text-align:right}.rank-score{font-weight:900;color:var(--gold);font-size:13px}
  /* SHOP */
  .shop-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding:8px 16px;flex:1;overflow-y:auto;align-content:start}
  .shop-item{text-align:center;padding:14px 8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:12px}
  .shop-emoji{font-size:32px;margin-bottom:4px}.shop-name{font-size:12px;font-weight:700;margin-bottom:2px}.shop-price{font-size:11px;color:var(--gold);margin-bottom:6px}
  .shop-btn{padding:6px 14px;border-radius:8px;font-size:11px;font-weight:700;background:rgba(255,215,0,.15);border:1px solid rgba(255,215,0,.3);color:var(--gold)}
  .shop-btn.equipped{background:var(--gold);color:#000}.shop-btn:disabled{opacity:.4}
  /* MISSION */
  .mission-card{display:flex;align-items:center;gap:10px;padding:12px;margin-bottom:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px}
  .mission-main{flex:1}.mission-name{font-weight:700;font-size:13px}.mission-desc{font-size:11px;color:var(--muted);margin:2px 0}
  .mission-bar{height:4px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden;margin-top:4px}.mission-fill{height:100%;background:var(--gold);border-radius:2px}
  .mission-right{text-align:center}.mission-reward{font-size:11px;color:var(--gold);font-weight:700;margin-bottom:4px}
  .mission-claim{padding:4px 10px;border-radius:6px;font-size:10px;font-weight:700;background:rgba(255,215,0,.15);border:1px solid rgba(255,215,0,.3);color:var(--gold)}
  .mission-claim.done{background:var(--gold);color:#000}
  .mission-claim:disabled{opacity:.4}
  .ach-card{text-align:center;padding:12px;margin-bottom:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px}
  .ach-card.done{border-color:rgba(255,215,0,.3);background:rgba(255,215,0,.06)}
  .ach-icon{font-size:28px;margin-bottom:4px}.ach-name{font-weight:700;font-size:13px}.ach-desc{font-size:11px;color:var(--muted)}.ach-reward{font-size:11px;color:var(--gold);font-weight:700;margin-top:4px}
  /* SETTINGS */
  .setting-group{margin-bottom:16px}
  .setting-label{font-size:13px;font-weight:900;margin-bottom:6px}
  .setting-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;font-size:13px;color:var(--muted)}
  .toggle-switch{width:44px;height:24px;border-radius:12px;background:rgba(255,255,255,.15);position:relative;cursor:pointer;transition:.2s}
  .toggle-switch.on{background:var(--gold)}
  .toggle-switch .dot{width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:2px;left:2px;transition:.2s}
  .toggle-switch.on .dot{left:22px}
  /* TUTORIAL */
  .tut-body{flex:1;overflow-y:auto;padding:12px 16px}
  .tut-card{padding:14px;margin-bottom:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px}
  .tut-title{font-weight:900;font-size:14px;margin-bottom:4px}.tut-desc{font-size:12px;color:var(--muted);line-height:1.5}
  /* POPUP */
  .popup-overlay{position:absolute;inset:0;background:rgba(0,0,0,.7);display:none;align-items:center;justify-content:center;z-index:100;padding:20px}
  .popup-overlay.show{display:flex}
  .popup{background:var(--dark3);border:1px solid rgba(255,215,0,.2);border-radius:16px;padding:24px;text-align:center;min-width:260px;max-width:320px}
  .popup-title{font-size:16px;font-weight:900;color:var(--gold);margin-bottom:8px}
  .popup-msg{font-size:13px;color:var(--muted);margin-bottom:16px}
  .popup-btns{display:flex;gap:8px;justify-content:center}
  .popup-btn{padding:10px 24px;border-radius:10px;font-weight:900;font-size:13px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#000;border:none}
  .popup-btn.cancel{background:rgba(255,255,255,.1);color:#fff}
  /* ROOM PANEL */
  .room-panel{position:absolute;inset:0;background:var(--dark2);z-index:90;display:none;flex-direction:column}
  .room-panel.show{display:flex}
  .room-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(255,215,0,.1)}
  .room-title{font-weight:900;color:var(--gold)}.room-close{background:none;color:#fff;font-size:18px;border:none}
  .room-body{flex:1;overflow:auto;padding:12px 16px}
  .room-section{margin-bottom:16px}.room-section-title{font-size:11px;font-weight:900;color:var(--muted);letter-spacing:2px;margin-bottom:8px}
  .confetti{position:fixed;pointer-events:none;z-index:200;font-size:18px;animation:cfall 2.5s ease-out forwards}
  @keyframes cfall{0%{opacity:1;transform:translateY(0) rotate(0)}100%{opacity:0;transform:translateY(var(--ty,200px)) translateX(var(--tx,0)) rotate(720deg)}}
  `;

  /* ═══ GAME STATE (loaded from localStorage) ═══ */
  let lang = 'en';
  let profile = loadProfile();
  let settings = loadSettings();
  let shop = loadShop();
  const game = { shoe:[], playerCards:[], bankerCards:[], playerBet:null, betAmount:0, lastResults:[], gameOver:false };

  function loadProfile() {
    let p = null;
    try { p = JSON.parse(localStorage.getItem(STORE_KEY)); } catch(e) {}
    if (!p) p = { id:'player_'+Date.now(), nickname:'Player', stars:STARTING_STARS, xp:0, totalWins:0, totalLosses:0, totalGames:0, bestStreak:0, currentStreak:0, playerWins:0, bankerWins:0, tieWins:0, maxBet:0, lastDailyClaimTime:0 };
    return p;
  }
  function loadSettings() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(SETTINGS_KEY)); } catch(e) {}
    if (!s) s = { sound:true, vibrate:true, equippedAvatar:'avatar_ace', equippedTable:'table_classic', equippedCardBack:'back_red', language:'en' };
    return s;
  }
  function loadShop() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(SHOP_KEY)); } catch(e) {}
    if (!s) s = { owned:['avatar_ace','table_classic','back_red'] };
    return s;
  }
  function saveProfile() { localStorage.setItem(STORE_KEY, JSON.stringify(profile)); Online.pushLeader(); }
  function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
  function saveShop() { localStorage.setItem(SHOP_KEY, JSON.stringify(shop)); }
  function levelFromXp(xp) { const lv = Math.floor(xp/100)+1; return { lv, xp: xp%100, progress: (xp%100) }; }
  function getAvatarEmoji() { const item = SHOP_ITEMS.find(i=>i.id===settings.equippedAvatar); return item ? item.emoji : '🃏'; }

  function t(key) { const dict = I18N[lang] || I18N.en; return dict[key] || key; }
  function applyI18n() { document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.getAttribute('data-i18n'); const v = (I18N[lang]||I18N.en)[k]; if (v) el.textContent = v; }); }

  /* ═══ DECK & CARDS ═══ */
  function createShoe(decks) {
    const shoe = [];
    for (let d = 0; d < decks; d++) for (let s = 0; s < 4; s++) for (let r = 0; r < 13; r++) shoe.push({ rank:r, suit:s });
    for (let i = shoe.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [shoe[i],shoe[j]]=[shoe[j],shoe[i]]; }
    return shoe;
  }
  function cardValue(c) { return c.rank >= 9 ? 0 : c.rank + 1; }
  function handValue(cards) { return cards.reduce((s,c) => s + cardValue(c), 0) % 10; }
  function cardEmoji(c) {
    const r = RANKS[c.rank];
    const s = SUITS[c.suit];
    return r + s;
  }
  function drawCard() {
    if (game.shoe.length < 10) game.shoe = createShoe(8);
    return game.shoe.pop();
  }

  /* ═══ PUNTO BANCO LOGIC ═══ */
  async function dealGame() {
    if (!game.playerBet) { popupAlert(t('deal'), 'Select Player, Banker, or Tie'); return; }
    if (game.betAmount <= 0) { popupAlert(t('deal'), 'Select a chip amount'); return; }
    if (profile.stars < game.betAmount) { popupAlert(t('not_enough'), t('need_stars').replace('{0}', game.betAmount)); return; }
    if (profile.maxBet < game.betAmount) profile.maxBet = game.betAmount;

    profile.stars -= game.betAmount;
    game.playerCards = [drawCard(), drawCard()];
    game.bankerCards = [drawCard(), drawCard()];

    drawGame();
    playSound('flip');
    await sleep(600);

    let pVal = handValue(game.playerCards);
    let bVal = handValue(game.bankerCards);

    // Natural check
    if (pVal < 8 && bVal < 8) {
      // Player 3rd card
      if (pVal <= 5) {
        game.playerCards.push(drawCard());
        drawGame(); playSound('flip'); await sleep(400);
        pVal = handValue(game.playerCards);
        const p3 = cardValue(game.playerCards[2]);
        // Banker 3rd card
        if (bVal <= 2) { game.bankerCards.push(drawCard()); }
        else if (bVal === 3 && p3 !== 8) { game.bankerCards.push(drawCard()); }
        else if (bVal === 4 && p3 >= 2 && p3 <= 7) { game.bankerCards.push(drawCard()); }
        else if (bVal === 5 && p3 >= 4 && p3 <= 7) { game.bankerCards.push(drawCard()); }
        else if (bVal === 6 && (p3 === 6 || p3 === 7)) { game.bankerCards.push(drawCard()); }
      } else {
        // Player stands, banker draws on 0-5
        if (bVal <= 5) { game.bankerCards.push(drawCard()); }
      }
      if (game.bankerCards.length === 3) { drawGame(); playSound('flip'); await sleep(400); }
    }

    pVal = handValue(game.playerCards);
    bVal = handValue(game.bankerCards);
    drawGame();

    let result, payout = 0;
    if (pVal === bVal) {
      result = 'tie';
      if (game.playerBet === 'tie') { payout = game.betAmount * 9; profile.tieWins++; }
      else { payout = game.betAmount; } // push
    } else if (pVal > bVal) {
      result = 'player';
      if (game.playerBet === 'player') { payout = game.betAmount * 2; profile.playerWins++; }
    } else {
      result = 'banker';
      if (game.playerBet === 'banker') { payout = Math.floor(game.betAmount * 1.95); profile.bankerWins++; }
    }

    const won = (result === game.playerBet);
    profile.stars += payout;
    profile.totalGames++;
    if (won) { profile.totalWins++; profile.currentStreak++; if (profile.currentStreak > profile.bestStreak) profile.bestStreak = profile.currentStreak; }
    else { if (result !== 'tie' || game.playerBet !== 'tie') { profile.totalLosses++; profile.currentStreak = 0; } }
    profile.xp += 10;

    game.lastResults.unshift(result);
    if (game.lastResults.length > 40) game.lastResults.pop();
    localStorage.setItem('fa_baccarat_results_v2', JSON.stringify(game.lastResults));

    saveProfile();
    checkAchievements();
    showResult(won, payout, result);
    drawGame();
    updateAllUI();

    await sleep(2500);
    document.getElementById('result-banner').classList.add('hidden');
    game.playerCards = []; game.bankerCards = [];
    drawGame();
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  /* ═══ RENDER FUNCTIONS ═══ */
  function drawGame() {
    document.getElementById('player-score').textContent = game.playerCards.length ? handValue(game.playerCards) : '-';
    document.getElementById('banker-score').textContent = game.bankerCards.length ? handValue(game.bankerCards) : '-';
    const pRow = document.getElementById('player-cards');
    const bRow = document.getElementById('banker-cards');
    pRow.innerHTML = game.playerCards.map(c => { const red = c.suit===1||c.suit===2; return `<div class="card ${red?'red':''}">${cardEmoji(c)}</div>`; }).join('') || '<div class="card">🂠</div><div class="card">🂠</div>';
    bRow.innerHTML = game.bankerCards.map(c => { const red = c.suit===1||c.suit===2; return `<div class="card ${red?'red':''}">${cardEmoji(c)}</div>`; }).join('') || '<div class="card">🂠</div><div class="card">🂠</div>';
    drawRoadMap();
  }

  function drawRoadMap() {
    const rm = document.getElementById('road-map');
    rm.innerHTML = game.lastResults.slice(0,40).map(r => {
      const cls = r==='player'?'p':r==='banker'?'b':'t';
      const lbl = r==='player'?'P':r==='banker'?'B':'T';
      return `<div class="bead ${cls}">${lbl}</div>`;
    }).join('');
  }

  function showResult(won, payout, result) {
    const banner = document.getElementById('result-banner');
    if (won) { banner.textContent = `${t('you_win')} +${payout}⭐`; banner.className='result-banner win'; }
    else if (result==='tie'&&game.playerBet!=='tie') { banner.textContent = `${t('tie_push')} +${payout}⭐`; banner.className='result-banner lose'; }
    else { banner.textContent = t('you_lose'); banner.className='result-banner lose'; }
  }

  function updateAllUI() {
    const lv = levelFromXp(profile.xp);
    const el = id => document.getElementById(id);
    el('hm-lvl').textContent = `LV ${lv.lv}`;
    el('hm-stars').textContent = profile.stars.toLocaleString() + '⭐';
    el('info-stars').textContent = profile.stars.toLocaleString();
    el('info-level').textContent = lv.lv;
    el('info-wins').textContent = profile.totalWins;
    el('info-streak').textContent = profile.currentStreak;
    el('prof-avatar').textContent = getAvatarEmoji();
    el('prof-name').textContent = profile.nickname;
    el('prof-rank-pill').textContent = `LEVEL ${lv.lv}`;
    el('ps-stars').textContent = profile.stars.toLocaleString();
    el('ps-wins').textContent = profile.totalWins;
    const rate = profile.totalGames > 0 ? Math.round(profile.totalWins/profile.totalGames*100) : 0;
    el('ps-rate').textContent = rate + '%';
    el('lv-label').textContent = `LV ${lv.lv}`;
    el('lv-xp').textContent = `${lv.xp} / 100 XP`;
    el('lv-fill').style.width = lv.progress + '%';
    el('prof-body').innerHTML = [
      ['Total Games',profile.totalGames],['Player Wins',profile.playerWins],['Banker Wins',profile.bankerWins],
      ['Tie Wins',profile.tieWins],['Best Streak',profile.bestStreak],['Max Bet',profile.maxBet.toLocaleString()]
    ].map(([l,v])=>`<div class="detail-row"><span class="detail-label">${l}</span><span class="detail-value">${v}</span></div>`).join('');
    el('player-avatar').textContent = getAvatarEmoji();
    el('player-name').textContent = profile.nickname;
    el('shop-stars').textContent = profile.stars.toLocaleString() + '⭐';
    renderShop();
    renderMissions();
    renderRanking();
    drawRoadMap();
  }

  function renderChips() {
    const sel = document.getElementById('chip-selector');
    sel.innerHTML = [50,100,500,1000,5000,10000].map(v => `<button class="chip" data-chip="${v}">${v>=1000?(v/1000)+'K':v}</button>`).join('');
  }

  function renderShop() {
    const activeTab = document.querySelector('[data-stab].on');
    if (!activeTab) return;
    const tab = activeTab.getAttribute('data-stab');
    const grid = document.getElementById('shop-grid');
    grid.innerHTML = SHOP_ITEMS.filter(i=>i.type===tab).map(item => {
      const owned = shop.owned.includes(item.id);
      const eq = settings.equippedAvatar===item.id || settings.equippedTable===item.id || settings.equippedCardBack===item.id;
      return `<div class="shop-item"><div class="shop-emoji">${item.emoji}</div><div class="shop-name">${item.name}</div><div class="shop-price">${item.price.toLocaleString()}⭐</div><button class="shop-btn ${eq?'equipped':''}" data-shop="${item.id}" ${item.price===0&&owned?'disabled':''}>${eq?t('equipped'):owned?t('equip'):t('purchase')}</button></div>`;
    }).join('');
  }

  function renderMissions() {
    const activeTab = document.querySelector('[data-mtab].on');
    if (!activeTab) return;
    const tab = activeTab.getAttribute('data-mtab');
    const list = document.getElementById('mission-list');
    if (tab === 'daily') {
      const missions = [
        {name:'Win 1 game',target:1,current:profile.totalGames,reward:50},
        {name:'Win 3 games',target:3,current:profile.totalGames,reward:100},
        {name:'Earn 1000⭐',target:1000,current:profile.stars,reward:200},
        {name:'2 win streak',target:2,current:profile.currentStreak,reward:150},
        {name:'Player bet win',target:1,current:profile.playerWins,reward:80},
        {name:'Banker bet win',target:1,current:profile.bankerWins,reward:80},
      ];
      list.innerHTML = missions.map(m => {
        const pct = Math.min(100,Math.round(m.current/m.target*100));
        const done = m.current >= m.target;
        return `<div class="mission-card"><div class="mission-main"><div class="mission-name">${m.name}</div><div class="mission-bar"><div class="mission-fill" style="width:${pct}%"></div></div></div><div class="mission-right"><div class="mission-reward">${m.reward}⭐</div></div></div>`;
      }).join('');
    } else {
      const claimed = JSON.parse(localStorage.getItem(ACHIEVE_KEY)||'[]');
      list.innerHTML = ACHIEVEMENTS.map(a => {
        const done = a.check(profile);
        const got = claimed.includes(a.id);
        return `<div class="ach-card ${done?'done':''}"><div class="ach-icon">${a.icon}</div><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div><div class="ach-reward">+${a.star}⭐ ${got?'✓':''}</div></div>`;
      }).join('');
    }
  }

  function renderRanking() {
    const activeTab = document.querySelector('[data-rtab].on');
    if (!activeTab) return;
    const tab = activeTab.getAttribute('data-rtab');
    const list = document.getElementById('rank-list');
    let ranks = loadRanks();
    // Weekly reset logic
    const now = new Date();
    const resetInfo = document.getElementById('rank-reset-info');
    if (tab === 'weekly') {
      ranks = ranks.filter(r => r.weekStamp === getWeekStamp(now));
      if (resetInfo) resetInfo.textContent = 'Resets Saturday 12:00';
      ranks = ranks.slice(0, 7);
    } else if (tab === 'prev') {
      const prev = new Date(now); prev.setDate(prev.getDate() - 7);
      ranks = ranks.filter(r => r.weekStamp === getWeekStamp(prev));
      if (resetInfo) resetInfo.textContent = '';
      ranks = ranks.slice(0, 7);
    } else {
      if (resetInfo) resetInfo.textContent = '';
    }
    ranks.sort((a,b) => b.totalWins - a.totalWins);
    if (!ranks.length) { list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted)">No rankings yet</div>'; return; }
    list.innerHTML = ranks.map((r,i) => {
      const item = SHOP_ITEMS.find(x=>x.id===r.avatar);
      const emoji = item ? item.emoji : '🃏';
      return `<div class="rank-card"><div class="rank-pos">#${i+1}</div><div class="rank-avatar">${emoji}</div><div style="flex:1"><div class="rank-name">${r.nickname}</div><div class="rank-sub">LV ${levelFromXp(r.xp||0).lv}</div></div><div class="rank-right"><div class="rank-score">${r.totalWins} wins</div></div></div>`;
    }).join('');
  }

  function getWeekStamp(date) {
    const d = new Date(date); d.setHours(0,0,0,0);
    const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff); return d.toISOString().slice(0,10);
  }

  function loadRanks() {
    let r = null;
    try { r = JSON.parse(localStorage.getItem(RANK_KEY)); } catch(e) {}
    if (!r || !r.length) return generateBotRanks();
    return r;
  }

  function generateBotRanks() {
    const bots = BOT_NAMES.map((name,i) => ({
      id:'bot_'+i, nickname:name, avatar:SHOP_ITEMS.filter(x=>x.type==='avatar')[i%6].id,
      totalWins: Math.floor(Math.random()*500)+50, xp: Math.floor(Math.random()*5000),
      weekStamp: getWeekStamp(new Date()),
    }));
    localStorage.setItem(RANK_KEY, JSON.stringify(bots));
    return bots;
  }

  /* ═══ ACHIEVEMENTS ═══ */
  function checkAchievements() {
    let claimed = JSON.parse(localStorage.getItem(ACHIEVE_KEY)||'[]');
    let gained = 0;
    for (const a of ACHIEVEMENTS) {
      if (claimed.includes(a.id)) continue;
      if (a.check(profile)) { claimed.push(a.id); profile.stars += a.star; gained += a.star; }
    }
    if (gained > 0) { localStorage.setItem(ACHIEVE_KEY, JSON.stringify(claimed)); saveProfile(); }
  }

  /* ═══ POPUP ═══ */
  function popupAlert(title, msg) {
    document.getElementById('popup-title').textContent = title;
    document.getElementById('popup-msg').textContent = msg;
    document.getElementById('popup-btns').innerHTML = `<button class="popup-btn" data-action="close-popup">${t('ok')}</button>`;
    document.getElementById('popup-overlay').classList.add('show');
  }
  function popupConfirm(msg, onYes) {
    document.getElementById('popup-title').textContent = 'Confirm';
    document.getElementById('popup-msg').textContent = msg;
    document.getElementById('popup-btns').innerHTML = `<button class="popup-btn" data-action="confirm-yes">${t('ok')}</button><button class="popup-btn cancel" data-action="close-popup">${t('cancel')}</button>`;
    document.getElementById('popup-overlay').classList.add('show');
    document.getElementById('popup')._onYes = onYes;
  }

  /* ═══ SOUND & VIBRATE ═══ */
  function playSound(type) {
    if (!settings.sound) return;
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator(); const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      const now = ac.currentTime;
      if (type==='flip') { osc.frequency.value=800; gain.gain.setValueAtTime(0.08,now); gain.gain.exponentialRampToValueAtTime(0.01,now+0.1); osc.start(now); osc.stop(now+0.1); }
      else if (type==='win') { osc.frequency.value=1200; gain.gain.setValueAtTime(0.1,now); gain.gain.exponentialRampToValueAtTime(0.01,now+0.2); osc.start(now); osc.stop(now+0.2); }
      else { osc.frequency.value=600; gain.gain.setValueAtTime(0.05,now); gain.gain.exponentialRampToValueAtTime(0.01,now+0.05); osc.start(now); osc.stop(now+0.05); }
    } catch(e) {}
  }
  function vibrate(ms) { if (settings.vibrate && navigator.vibrate) navigator.vibrate(ms); }
  function confetti() {
    const stage = document.getElementById('stage');
    for (let i = 0; i < 20; i++) {
      const c = document.createElement('div'); c.className='confetti';
      c.textContent = ['🎉','🎊','✨','🌟'][Math.floor(Math.random()*4)];
      c.style.setProperty('--tx', (Math.random()*200-100)+'px');
      c.style.setProperty('--ty', (Math.random()*300+100)+'px');
      c.style.left = Math.random()*100+'%'; c.style.top = '40%';
      stage.appendChild(c); setTimeout(()=>c.remove(), 2500);
    }
  }

  /* ═══ SCREEN NAV ═══ */
  function show(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const sc = document.getElementById(screenId);
    if (sc) sc.classList.add('active');
    updateAllUI();
  }

  /* ═══ FIREBASE ONLINE ═══ */
  const Online = (function() {
    let db = null;
    function ready() {
      if (db) return db;
      if (typeof window.firebase === 'undefined' || !firebase.database) return null;
      try { db = firebase.database(); } catch(e) { db = null; }
      return db;
    }
    async function pushLeader() {
      const d = ready();
      if (!d || !profile || !profile.id) return;
      try {
        await d.ref('leaderboards/baccarat/' + profile.id).update({
          nickname: profile.nickname, avatar: settings.equippedAvatar || 'avatar_ace',
          totalWins: profile.totalWins|0, totalGames: profile.totalGames|0,
          bestStreak: profile.bestStreak|0, stars: profile.stars|0, xp: profile.xp|0,
          weekStamp: getWeekStamp(new Date()), updatedAt: Date.now(),
        });
      } catch(e) {}
    }
    return { pushLeader };
  })();

  /* ═══ BOOT — creates all DOM ═══ */
  function boot() {
    const meta = document.createElement('meta');
    meta.name='viewport'; meta.content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
    document.head.appendChild(meta);
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    const root = document.createElement('div'); root.id='kk-root'; document.body.appendChild(root);

    root.innerHTML = `
    <div class="stage" id="stage">

      <section class="screen active" id="sc-home">
        <div class="topbar"><div class="brand"><div class="brand-logo">🃏</div><div class="brand-name">FA Baccarat<small>VIP Casino</small></div></div><div class="topbar-right"><span class="lvl-pill" id="hm-lvl">LV 1</span><span class="star-pill" id="hm-stars">0</span></div></div>
        <div class="daily-card hidden" id="daily-card"><div class="daily-icon">🎁</div><div style="flex:1"><div class="daily-title" data-i18n="daily_checkin">Daily Check-in</div><div class="daily-sub">+${DAILY_BONUS}⭐</div></div><button class="daily-claim" id="daily-claim-btn" data-i18n="claim">Claim</button></div>
        <div class="info-bar"><div class="info-item"><div class="info-val" id="info-stars">0</div><div class="info-lbl" data-i18n="stars">Stars</div></div><div class="info-item"><div class="info-val" id="info-level">1</div><div class="info-lbl" data-i18n="level">Level</div></div><div class="info-item"><div class="info-val" id="info-wins">0</div><div class="info-lbl" data-i18n="wins">Wins</div></div><div class="info-item"><div class="info-val" id="info-streak">0</div><div class="info-lbl" data-i18n="streak">Streak</div></div></div>
        <div class="hero"><h1 class="hero-title">🃏 Baccarat</h1><p class="hero-sub">PUNTO • BANCO</p></div>
        <div class="menu">
          <button class="main-btn primary" data-action="play-ai"><div class="mb-ico">🤵</div><div class="mb-lbl"><div class="mb-title" data-i18n="play_ai">Play vs Dealer</div><div class="mb-sub">Premium experience</div></div><div class="mb-arrow">›</div></button>
          <button class="main-btn secondary" data-action="play-online"><div class="mb-ico">🌐</div><div class="mb-lbl"><div class="mb-title" data-i18n="play_online">Online Table</div><div class="mb-sub">Real players</div></div><div class="mb-arrow">›</div></button>
        </div>
        <div class="footer-nav"><button class="fnav on" data-nav="home"><span class="i">🏠</span><span data-i18n="nav_home">Home</span></button><button class="fnav" data-nav="rank"><span class="i">🏆</span><span data-i18n="nav_rank">Ranking</span></button><button class="fnav" data-nav="shop"><span class="i">🛍️</span><span data-i18n="nav_shop">Shop</span></button><button class="fnav" data-nav="mission"><span class="i">📋</span><span data-i18n="nav_mission">Mission</span></button><button class="fnav" data-nav="profile"><span class="i">👤</span><span data-i18n="nav_profile">Profile</span></button></div>
      </section>

      <section class="screen" id="sc-game">
        <div class="topbar"><button class="icon-btn" data-back>←</button><div class="brand-name" style="text-align:center;flex:1" data-i18n="app_title">Baccarat</div><div style="width:42px"></div></div>
        <div class="game-area">
          <div class="avatar-area"><div class="avatar-frame">🤵</div><div class="avatar-name" data-i18n="banker">Banker</div></div>
          <div class="cards-row" id="banker-cards"><div class="card">🂠</div><div class="card">🂠</div></div>
          <div class="score-badge" id="banker-score">-</div>
          <div class="result-banner hidden" id="result-banner"></div>
          <div class="cards-row" id="player-cards"><div class="card">🂠</div><div class="card">🂠</div></div>
          <div class="score-badge" id="player-score">-</div>
          <div class="avatar-area"><div class="avatar-frame" id="player-avatar">🃏</div><div class="avatar-name" id="player-name">You</div></div>
          <div class="road-map" id="road-map"></div>
          <div class="bet-section">
            <div class="bet-types"><button class="bet-btn" data-bet="player"><span data-i18n="player">Player</span><br><small>×2</small></button><button class="bet-btn" data-bet="tie"><span data-i18n="tie">Tie</span><br><small>×9</small></button><button class="bet-btn" data-bet="banker"><span data-i18n="banker">Banker</span><br><small>×1.95</small></button></div>
            <div class="chip-selector" id="chip-selector"></div>
            <button class="deal-btn" id="deal-btn" data-i18n="deal">Deal</button>
          </div>
        </div>
      </section>

      <section class="screen" id="sc-profile">
        <div class="topbar"><button class="icon-btn" data-back>←</button><div class="brand-name" style="text-align:center;flex:1" data-i18n="profile">Profile</div><button class="icon-btn" id="btn-prof-settings">⚙️</button></div>
        <div class="prof-head"><div class="avatar" id="prof-avatar">🃏</div><div class="prof-name" id="prof-name">Player</div><div class="prof-rank-pill" id="prof-rank-pill">LEVEL 1</div></div>
        <div class="prof-stats"><div class="stat-card"><div class="v" id="ps-stars">0</div><div class="l" data-i18n="stars">Stars</div></div><div class="stat-card"><div class="v" id="ps-wins">0</div><div class="l" data-i18n="wins">Wins</div></div><div class="stat-card"><div class="v" id="ps-rate">0%</div><div class="l">Win Rate</div></div></div>
        <div class="level-box"><div class="lv-row"><span id="lv-label">LV 1</span><span id="lv-xp">0 / 100 XP</span></div><div class="lv-bar"><div class="lv-fill" id="lv-fill" style="width:0%"></div></div></div>
        <div class="section-title">STATS</div>
        <div id="prof-body"></div>
        <div class="footer-nav"><button class="fnav" data-nav="home"><span class="i">🏠</span><span data-i18n="nav_home">Home</span></button><button class="fnav" data-nav="rank"><span class="i">🏆</span><span data-i18n="nav_rank">Ranking</span></button><button class="fnav" data-nav="shop"><span class="i">🛍️</span><span data-i18n="nav_shop">Shop</span></button><button class="fnav" data-nav="mission"><span class="i">📋</span><span data-i18n="nav_mission">Mission</span></button><button class="fnav on" data-nav="profile"><span class="i">👤</span><span data-i18n="nav_profile">Profile</span></button></div>
      </section>

      <section class="screen" id="sc-rank">
        <div class="topbar"><button class="icon-btn" data-back>←</button><div class="brand-name" style="text-align:center;flex:1">🏆 <span data-i18n="nav_rank">Ranking</span></div><div style="width:42px"></div></div>
        <div class="tabs"><button class="tab on" data-rtab="total" data-i18n="total_rank">Total</button><button class="tab" data-rtab="weekly" data-i18n="weekly_top">Weekly Top 7</button><button class="tab" data-rtab="prev" data-i18n="last_week">Last Week Top 7</button></div>
        <div style="text-align:center;font-size:10px;color:rgba(255,255,255,.5);padding:4px" id="rank-reset-info"></div>
        <div class="rank-list" id="rank-list"></div>
        <div class="footer-nav"><button class="fnav" data-nav="home"><span class="i">🏠</span><span data-i18n="nav_home">Home</span></button><button class="fnav on" data-nav="rank"><span class="i">🏆</span><span data-i18n="nav_rank">Ranking</span></button><button class="fnav" data-nav="shop"><span class="i">🛍️</span><span data-i18n="nav_shop">Shop</span></button><button class="fnav" data-nav="mission"><span class="i">📋</span><span data-i18n="nav_mission">Mission</span></button><button class="fnav" data-nav="profile"><span class="i">👤</span><span data-i18n="nav_profile">Profile</span></button></div>
      </section>

      <section class="screen" id="sc-shop">
        <div class="topbar"><button class="icon-btn" data-back>←</button><div class="brand-name" style="text-align:center;flex:1">🛍️ <span data-i18n="shop_title">Shop</span></div><span class="star-pill" id="shop-stars">0</span></div>
        <div class="tabs"><button class="tab on" data-stab="avatar" data-i18n="avatars">Avatars</button><button class="tab" data-stab="table" data-i18n="tables">Tables</button><button class="tab" data-stab="cardback" data-i18n="card_backs">Card Backs</button></div>
        <div class="shop-grid" id="shop-grid"></div>
        <div class="footer-nav"><button class="fnav" data-nav="home"><span class="i">🏠</span><span data-i18n="nav_home">Home</span></button><button class="fnav" data-nav="rank"><span class="i">🏆</span><span data-i18n="nav_rank">Ranking</span></button><button class="fnav on" data-nav="shop"><span class="i">🛍️</span><span data-i18n="nav_shop">Shop</span></button><button class="fnav" data-nav="mission"><span class="i">📋</span><span data-i18n="nav_mission">Mission</span></button><button class="fnav" data-nav="profile"><span class="i">👤</span><span data-i18n="nav_profile">Profile</span></button></div>
      </section>

      <section class="screen" id="sc-mission">
        <div class="topbar"><button class="icon-btn" data-back>←</button><div class="brand-name" style="text-align:center;flex:1">📋 <span data-i18n="missions_title">Mission</span></div><div style="width:42px"></div></div>
        <div class="tabs"><button class="tab on" data-mtab="daily" data-i18n="daily_m">Daily</button><button class="tab" data-mtab="ach" data-i18n="achievement">Achievement</button></div>
        <div class="rank-list" id="mission-list"></div>
        <div class="footer-nav"><button class="fnav" data-nav="home"><span class="i">🏠</span><span data-i18n="nav_home">Home</span></button><button class="fnav" data-nav="rank"><span class="i">🏆</span><span data-i18n="nav_rank">Ranking</span></button><button class="fnav" data-nav="shop"><span class="i">🛍️</span><span data-i18n="nav_shop">Shop</span></button><button class="fnav on" data-nav="mission"><span class="i">📋</span><span data-i18n="nav_mission">Mission</span></button><button class="fnav" data-nav="profile"><span class="i">👤</span><span data-i18n="nav_profile">Profile</span></button></div>
      </section>

      <section class="screen" id="sc-settings">
        <div class="topbar"><button class="icon-btn" data-back>←</button><div class="brand-name" style="text-align:center;flex:1">⚙️ <span data-i18n="settings">Settings</span></div><button class="icon-btn" id="btn-how">❓</button></div>
        <div style="flex:1;overflow:auto;padding:12px 16px">
          <div class="section-title">GAME</div>
          <div class="setting-group"><div class="setting-label" data-i18n="sound">Sound</div><div class="setting-row"><span>Effects</span><div class="toggle-switch" id="toggle-sound"><div class="dot"></div></div></div></div>
          <div class="setting-group"><div class="setting-label" data-i18n="vibrate">Vibration</div><div class="setting-row"><span>Haptic</span><div class="toggle-switch" id="toggle-vibrate"><div class="dot"></div></div></div></div>
          <div class="setting-group"><div class="setting-label" data-i18n="language">Language</div><select id="lang-select" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,215,0,.2);background:rgba(26,26,26,.6);color:#fff;font-weight:700"><option value="en">English</option><option value="ko">한국어</option><option value="ja">日本語</option><option value="zh">中文</option><option value="vi">Tiếng Việt</option><option value="th">ไทย</option></select></div>
          <div class="section-title">ACCOUNT</div>
          <button class="main-btn secondary" id="btn-reset-all" style="width:100%;margin:0"><span data-i18n="reset_stats">Reset Stats</span></button>
        </div>
      </section>

      <section class="screen" id="sc-tutorial">
        <div class="topbar"><button class="icon-btn" data-back>←</button><div class="brand-name" style="text-align:center;flex:1">❓ <span data-i18n="tutorial">How to Play</span></div><div style="width:42px"></div></div>
        <div class="tut-body">
          <div class="tut-card"><div class="tut-title">🃏 What is Baccarat?</div><div class="tut-desc">Punto Banco: bet on Player, Banker, or Tie. Closest to 9 wins.</div></div>
          <div class="tut-card"><div class="tut-title">🎯 Card Values</div><div class="tut-desc">A=1, 2-9=face value, 10/J/Q/K=0. Only last digit counts (15→5).</div></div>
          <div class="tut-card"><div class="tut-title">📏 3rd Card Rule</div><div class="tut-desc">Natural 8 or 9 = no draw. Player 0-5 draws. Banker draw depends on Player's 3rd card.</div></div>
          <div class="tut-card"><div class="tut-title">💰 Payouts</div><div class="tut-desc">Player ×2, Banker ×1.95 (5% commission), Tie ×9. Tie pushes Player/Banker bets.</div></div>
          <div class="tut-card"><div class="tut-title">⭐ Stars</div><div class="tut-desc">Win games to earn stars. Buy avatars, tables, and card backs in the shop.</div></div>
        </div>
      </section>

    </div>

    <div class="popup-overlay" id="popup-overlay"><div class="popup" id="popup"><div class="popup-title" id="popup-title">Alert</div><div class="popup-msg" id="popup-msg"></div><div class="popup-btns" id="popup-btns"></div></div></div>
    <div class="room-panel" id="room-panel"><div class="room-header"><div class="room-title">Online Table</div><button class="room-close" id="room-panel-close">✕</button></div><div class="room-body"><div class="room-section"><div class="room-section-title">Coming Soon</div><p style="color:var(--muted);font-size:13px">Online multiplayer is coming in a future update.</p></div></div></div>
    `;
  }

  /* ═══ SETUP LISTENERS (called AFTER boot) ═══ */
  function setupListeners() {
    // Settings
    document.getElementById('toggle-sound').addEventListener('click', function() {
      settings.sound = !settings.sound; this.classList.toggle('on'); saveSettings();
    });
    document.getElementById('toggle-vibrate').addEventListener('click', function() {
      settings.vibrate = !settings.vibrate; this.classList.toggle('on'); saveSettings();
    });
    document.getElementById('lang-select').addEventListener('change', function() {
      lang = this.value; settings.language = lang; saveSettings(); applyI18n();
    });
    document.getElementById('room-panel-close').addEventListener('click', () => {
      document.getElementById('room-panel').classList.remove('show');
    });

    // Delegated click handler
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('button');
      if (!btn) return;

      // Navigation
      if (btn.hasAttribute('data-back')) { show('sc-home'); return; }
      if (btn.hasAttribute('data-nav')) {
        const nav = btn.getAttribute('data-nav');
        document.querySelectorAll('.fnav').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        const map = {home:'sc-home',rank:'sc-rank',shop:'sc-shop',mission:'sc-mission',profile:'sc-profile'};
        show(map[nav]); return;
      }

      // Game actions
      if (btn.getAttribute('data-action') === 'play-ai') { show('sc-game'); return; }
      if (btn.getAttribute('data-action') === 'play-online') { document.getElementById('room-panel').classList.add('show'); return; }
      if (btn.hasAttribute('data-bet')) {
        document.querySelectorAll('[data-bet]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        game.playerBet = btn.getAttribute('data-bet');
        vibrate(20); return;
      }
      if (btn.hasAttribute('data-chip')) {
        document.querySelectorAll('[data-chip]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        game.betAmount = parseInt(btn.getAttribute('data-chip'));
        vibrate(20); return;
      }
      if (btn.id === 'deal-btn') { dealGame(); return; }

      // Daily claim
      if (btn.id === 'daily-claim-btn') {
        if (Date.now() - profile.lastDailyClaimTime > 86400000) {
          profile.stars += DAILY_BONUS; profile.lastDailyClaimTime = Date.now();
          saveProfile(); document.getElementById('daily-card').classList.add('hidden');
          updateAllUI(); playSound('win');
        }
        return;
      }

      // Tab switching
      if (btn.getAttribute('data-rtab')) {
        document.querySelectorAll('[data-rtab]').forEach(b => b.classList.remove('on'));
        btn.classList.add('on'); renderRanking(); return;
      }
      if (btn.getAttribute('data-stab')) {
        document.querySelectorAll('[data-stab]').forEach(b => b.classList.remove('on'));
        btn.classList.add('on'); renderShop(); return;
      }
      if (btn.getAttribute('data-mtab')) {
        document.querySelectorAll('[data-mtab]').forEach(b => b.classList.remove('on'));
        btn.classList.add('on'); renderMissions(); return;
      }

      // Shop buy/equip
      if (btn.hasAttribute('data-shop')) {
        const itemId = btn.getAttribute('data-shop');
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return;
        if (!shop.owned.includes(itemId)) {
          if (profile.stars < item.price) { popupAlert(t('not_enough'), item.price.toLocaleString()+'⭐'); return; }
          profile.stars -= item.price; shop.owned.push(itemId); saveProfile(); saveShop();
        }
        if (item.type==='avatar') settings.equippedAvatar = itemId;
        else if (item.type==='table') settings.equippedTable = itemId;
        else if (item.type==='cardback') settings.equippedCardBack = itemId;
        saveSettings(); renderShop(); updateAllUI();
        return;
      }

      // Profile & Settings
      if (btn.id === 'btn-prof-settings') { show('sc-settings'); return; }
      if (btn.id === 'btn-how') { show('sc-tutorial'); return; }
      if (btn.id === 'btn-reset-all') {
        popupConfirm(t('confirm_reset'), () => {
          profile = { id:profile.id, nickname:'Player', stars:STARTING_STARS, xp:0, totalWins:0, totalLosses:0, totalGames:0, bestStreak:0, currentStreak:0, playerWins:0, bankerWins:0, tieWins:0, maxBet:0, lastDailyClaimTime:0 };
          saveProfile(); updateAllUI(); popupAlert('Reset', 'Complete');
        });
        return;
      }

      // Popup actions
      if (btn.getAttribute('data-action') === 'close-popup') { document.getElementById('popup-overlay').classList.remove('show'); return; }
      if (btn.getAttribute('data-action') === 'confirm-yes') {
        const p = document.getElementById('popup'); if (p._onYes) p._onYes();
        document.getElementById('popup-overlay').classList.remove('show'); return;
      }
    });

    // Tap sound on every touch
    document.addEventListener('pointerdown', () => { playSound('tap'); }, { passive: true });
  }

  /* ═══ INIT ═══ */
  function init() {
    boot();
    setupListeners();

    lang = settings.language || 'en';
    applyI18n();
    renderChips();

    game.shoe = createShoe(8);
    try { game.lastResults = JSON.parse(localStorage.getItem('fa_baccarat_results_v2')) || []; } catch(e) { game.lastResults = []; }

    updateAllUI();

    // Daily check-in visibility
    if (Date.now() - profile.lastDailyClaimTime > 86400000) {
      document.getElementById('daily-card').classList.remove('hidden');
    }

    // Settings toggle state
    document.getElementById('toggle-sound').classList.toggle('on', settings.sound);
    document.getElementById('toggle-vibrate').classList.toggle('on', settings.vibrate);
    document.getElementById('lang-select').value = lang;
  }

  init();
})();
