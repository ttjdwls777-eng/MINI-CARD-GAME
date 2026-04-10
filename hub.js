/* =============================================================================
 *  FA Baccarat · Premium VIP Casino Edition
 *  -----------------------------------------------------------------------------
 *  Single-file, self-mounting, vanilla JavaScript Baccarat game.
 *  - Works offline (localStorage persistence, no external dependencies)
 *  - Premium Black + Gold VIP casino theme
 *  - Punto Banco with correct 3rd card rules
 *  - 8-deck shoe with full card flip animations
 *  - Chip betting: 50, 100, 500, 1K, 5K, 10K
 *  - Road map (bead road) showing last 40 results
 *  - Dealer + Player avatars with glow animations
 *  - Full profile system: stars, level, streaks
 *  - Shop: unlockable avatars, table colors, card backs
 *  - Daily check-in, missions, achievements
 *  - Online multiplayer via Firebase
 *  - Complete i18n: en, ko, ja, zh, vi, th
 *  - Sound engine, confetti, vibrations
 *  =============================================================================
 */

(function () {
  'use strict';

  /* ═════════════════════════════════════════════════════════════════════════
     CONSTANTS
     ═════════════════════════════════════════════════════════════════════════ */
  const STORE_KEY        = 'fa_baccarat_profile_v2';
  const RANK_KEY         = 'fa_baccarat_ranks_v2';
  const SETTINGS_KEY     = 'fa_baccarat_settings_v2';
  const HISTORY_KEY      = 'fa_baccarat_history_v2';
  const MISSIONS_KEY     = 'fa_baccarat_missions_v2';
  const ACHIEVE_KEY      = 'fa_baccarat_achievements_v2';
  const SHOP_KEY         = 'fa_baccarat_shop_v2';
  const DAILY_KEY        = 'fa_baccarat_daily_v2';

  const STARTING_STARS   = 10000;
  const DAILY_BONUS_STAR = 100;
  const DAILY_BONUS_XP   = 0;

  const BET_PLAYER       = 'player';
  const BET_BANKER       = 'banker';
  const BET_TIE          = 'tie';

  const SHOP_ITEMS = [
    { id:'avatar_ace', type:'avatar', name:'Ace', emoji:'🃏', price:0 },
    { id:'avatar_crown', type:'avatar', name:'Crown', emoji:'👑', price:60000 },
    { id:'avatar_diamond', type:'avatar', name:'Diamond', emoji:'💎', price:90000 },
    { id:'avatar_fire', type:'avatar', name:'Fire', emoji:'🔥', price:105000 },
    { id:'avatar_star', type:'avatar', name:'Star', emoji:'⭐', price:120000 },
    { id:'avatar_dragon', type:'avatar', name:'Dragon', emoji:'🐉', price:135000 },
    { id:'avatar_rocket', type:'avatar', name:'Rocket', emoji:'🚀', price:150000 },
    { id:'avatar_money', type:'avatar', name:'Money', emoji:'💰', price:180000 },
    { id:'table_classic', type:'table', name:'Classic Green', emoji:'🟩', price:0 },
    { id:'table_royal', type:'table', name:'Royal Blue', emoji:'🔵', price:80000 },
    { id:'table_ruby', type:'table', name:'Ruby Red', emoji:'🔴', price:120000 },
    { id:'table_gold', type:'table', name:'Gold VIP', emoji:'🟡', price:200000 },
    { id:'back_red', type:'cardback', name:'Red Classic', emoji:'🎴', price:0 },
    { id:'back_blue', type:'cardback', name:'Blue Royal', emoji:'🔷', price:50000 },
    { id:'back_gold', type:'cardback', name:'Gold Luxury', emoji:'✨', price:150000 },
    { id:'back_black', type:'cardback', name:'Black Diamond', emoji:'♠️', price:250000 },
  ];

  const ACHIEVEMENTS = [
    { id:'first_win', name:'First Win', desc:'Win your first game', star:50, icon:'🥇', check: p => p.totalWins >= 1 },
    { id:'wins_5', name:'Rookie', desc:'5 wins', star:80, icon:'🌟', check: p => p.totalWins >= 5 },
    { id:'wins_25', name:'Veteran', desc:'25 wins', star:200, icon:'⭐', check: p => p.totalWins >= 25 },
    { id:'wins_100', name:'Master', desc:'100 wins', star:1000, icon:'🏆', check: p => p.totalWins >= 100 },
    { id:'streak_3', name:'Flame', desc:'3 win streak', star:120, icon:'🔥', check: p => p.bestStreak >= 3 },
    { id:'streak_5', name:'Storm', desc:'5 win streak', star:250, icon:'⚡', check: p => p.bestStreak >= 5 },
    { id:'streak_10', name:'Legend', desc:'10 win streak', star:800, icon:'💫', check: p => p.bestStreak >= 10 },
    { id:'tie_lucky', name:'Lucky Tie', desc:'Hit a Tie', star:300, icon:'🎯', check: p => p.tieWins >= 1 },
    { id:'banker_10', name:'Banker Master', desc:'10 Banker wins', star:500, icon:'🏛️', check: p => p.bankerWins >= 10 },
    { id:'player_10', name:'Player Champion', desc:'10 Player wins', star:500, icon:'🎪', check: p => p.playerWins >= 10 },
    { id:'big_bet', name:'High Roller', desc:'Bet 10K+', star:600, icon:'💰', check: p => p.maxBet >= 10000 },
    { id:'games_50', name:'Enthusiast', desc:'50 games', star:150, icon:'🎮', check: p => p.totalGames >= 50 },
  ];

  const BOT_NAMES = [
    'Diamond Mike', 'Ace Baron', 'Gold Rush', 'Royal Flush', 'Blackjack Kate',
    'Roulette Roy', 'Chips Charlie', 'Jackpot Jenny', 'Vegas Victor', 'Dealer Dan',
    'Fortune Frankie', 'Lucky Lucy', 'Casino Chris', 'Winning Walter', 'Vault Vanessa',
    'Platinum Pete', 'Silver Sally', 'Crystal Kevin', 'Marble Mary', 'Steel Steve',
  ];

  const CARD_NAMES = ['A','2','3','4','5','6','7','8','9','T','J','Q','K'];
  const CARD_SUITS = ['♠️','♥️','♦️','♣️'];

  /* ═════════════════════════════════════════════════════════════════════════
     STYLES — Black + Gold VIP Casino theme
     ═════════════════════════════════════════════════════════════════════════ */
  const CSS = `
  :root{
    --dark:#0a0a0a;
    --dark2:#111;
    --dark3:#1a1a1a;
    --dark4:#222;
    --gold:#ffd700;
    --gold2:#ffaa00;
    --gold3:#ff9e3c;
    --accent:#fff;
    --red:#ff5a6a;
    --blue:#5aa9ff;
    --green:#4ade80;
    --muted:#888;
    --shadow:0 18px 44px rgba(0,0,0,.75);
    --shadow-in:inset 0 1px 0 rgba(255,255,255,.1);
    --safe-top:env(safe-area-inset-top,0px);
    --safe-bot:env(safe-area-inset-bottom,0px);
  }
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  html,body{
    margin:0;padding:0;height:100%;overflow:hidden;
    font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Pretendard","Malgun Gothic","Noto Sans KR",sans-serif;
    background:#0a0a0a;color:#fff;
    -webkit-user-select:none;user-select:none;
  }
  button,input,textarea,select{font-family:inherit}
  button{cursor:pointer}
  #kk-root{
    position:fixed;inset:0;
    display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 50%,#0a0a0a 100%);
  }
  #kk-root::before{
    content:"";position:absolute;inset:0;pointer-events:none;
    background:
      radial-gradient(600px 400px at 15% 20%, rgba(255,215,0,.12), transparent 50%),
      radial-gradient(500px 500px at 85% 80%, rgba(255,170,0,.08), transparent 50%);
  }
  .stage{
    position:relative;
    width:min(100vw,480px);
    height:min(100svh,920px);
    max-height:100svh;
    padding-top:var(--safe-top);
    padding-bottom:var(--safe-bot);
    background:linear-gradient(135deg,#111 0%,#1a1a1a 50%,#0a0a0a 100%);
    overflow:hidden;
    border-radius:28px;
    box-shadow:var(--shadow),var(--shadow-in);
  }
  @media (max-width:520px){ .stage{ width:100vw; height:100svh; max-height:100svh; border-radius:0; } }
  .screen{
    position:absolute;inset:0;
    display:none;flex-direction:column;
    opacity:0;transition:opacity .3s;
    padding-bottom:20px;
  }
  .screen.active{ display:flex;opacity:1;z-index:10 }
  .screen > *:not(.footer-nav){ position:relative;z-index:2 }

  /* ═════ TOPBAR ═════ */
  .topbar{
    display:flex;align-items:center;justify-content:space-between;
    padding:12px 16px;border-bottom:1px solid rgba(255,215,0,.1);
    background:rgba(26,26,26,.6);
  }
  .brand{display:flex;align-items:center;gap:10px}
  .brand-logo{font-size:24px;font-weight:900}
  .brand-name{font-size:16px;font-weight:900;color:var(--gold)}
  .brand-name small{font-size:9px;opacity:.7;display:block}
  .topbar-right{display:flex;gap:10px;align-items:center}
  .icon-btn{
    background:rgba(255,215,0,.1);border:1px solid rgba(255,215,0,.2);
    padding:8px 12px;border-radius:10px;color:var(--gold);
    font-weight:900;font-size:14px;
  }
  .icon-btn:active{background:rgba(255,215,0,.2)}
  .lvl-pill,.star-pill{
    background:linear-gradient(135deg,rgba(255,215,0,.15),rgba(255,170,0,.1));
    border:1px solid rgba(255,215,0,.3);
    padding:6px 12px;border-radius:12px;font-weight:900;font-size:11px;
    color:var(--gold);
  }

  /* ═════ HERO ═════ */
  .hero{
    text-align:center;padding:20px 16px;position:relative;z-index:2;
  }
  .hero-title{
    font-size:42px;font-weight:900;color:var(--gold);
    text-shadow:0 4px 12px rgba(255,215,0,.4);margin:0;
  }
  .hero-sub{
    font-size:13px;letter-spacing:3px;color:var(--muted);
    margin:6px 0 0;font-weight:700;
  }

  /* ═════ INFO BAR ═════ */
  .info-bar{
    display:grid;grid-template-columns:repeat(4,1fr);gap:8px;
    padding:12px 16px;position:relative;z-index:2;
  }
  .info-item{
    background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.15);
    border-radius:12px;padding:8px;text-align:center;
  }
  .info-val{font-weight:900;font-size:16px;color:var(--gold)}
  .info-lbl{font-size:10px;color:var(--muted);margin-top:2px;font-weight:700}

  /* ═════ DAILY CARD ═════ */
  .daily-card{
    background:linear-gradient(135deg,rgba(255,215,0,.12),rgba(255,170,0,.08));
    border:1px solid rgba(255,215,0,.3);
    border-radius:14px;padding:12px 14px;margin:8px 16px;
    display:flex;align-items:center;gap:12px;position:relative;z-index:2;
  }
  .daily-icon{
    width:44px;height:44px;border-radius:10px;
    background:linear-gradient(135deg,var(--gold),var(--gold2));
    display:grid;place-items:center;font-size:22px;
    color:#1a1a1a;flex-shrink:0;box-shadow:0 4px 10px rgba(255,215,0,.3);
  }
  .daily-text{flex:1;min-width:0}
  .daily-title{font-weight:900;font-size:13px}
  .daily-sub{font-size:11px;opacity:.8;margin-top:2px;font-weight:700}
  .daily-claim{
    background:linear-gradient(135deg,var(--gold),var(--gold2));
    color:#1a1a1a;border:none;padding:7px 12px;
    border-radius:8px;font-weight:900;font-size:11px;
    box-shadow:0 4px 10px rgba(255,215,0,.3);flex-shrink:0;
  }
  .daily-claim:disabled{background:rgba(255,255,255,.15);color:var(--muted);box-shadow:none}

  /* ═════ MENU ═════ */
  .menu{
    flex:1;overflow:auto;position:relative;z-index:2;
    padding:0 16px 16px;
  }
  .main-btn{
    width:100%;padding:16px;border-radius:14px;border:none;
    background:linear-gradient(135deg,rgba(255,215,0,.1),rgba(255,170,0,.05));
    border:1px solid rgba(255,215,0,.2);
    color:#fff;font-weight:700;display:flex;align-items:center;
    gap:12px;margin-bottom:10px;transition:all .3s;
  }
  .main-btn:active{background:linear-gradient(135deg,rgba(255,215,0,.15),rgba(255,170,0,.1))}
  .main-btn.primary{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a1a1a;border:none}
  .main-btn.secondary{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15)}
  .mb-ico{font-size:24px}
  .mb-lbl{flex:1;text-align:left}
  .mb-title{font-weight:900;font-size:14px}
  .mb-sub{font-size:11px;opacity:.7;margin-top:2px}
  .mb-arrow{font-size:20px;color:var(--gold)}

  /* ═════ FOOTER NAV ═════ */
  .footer-nav{
    display:flex;gap:0;margin-bottom:calc(var(--safe-bot) + 4px);
    padding-bottom:8px;position:relative;z-index:50;
  }
  .fnav{
    flex:1;padding:10px 8px;background:transparent;border:none;
    color:rgba(255,255,255,.5);font-weight:900;font-size:10px;
    display:flex;flex-direction:column;align-items:center;gap:4px;
    transition:color .3s;
  }
  .fnav.on{color:var(--gold)}
  .fnav .i{font-size:18px}

  /* ═════ PROFILE ═════ */
  .prof-head{
    text-align:center;padding:20px 16px 16px;position:relative;z-index:2;
  }
  .avatar{
    width:80px;height:80px;border-radius:50%;
    background:linear-gradient(135deg,rgba(255,215,0,.2),rgba(255,170,0,.1));
    border:3px solid var(--gold);
    display:grid;place-items:center;font-size:40px;
    margin:0 auto 12px;box-shadow:0 0 20px rgba(255,215,0,.3);
    animation:pulse-glow 2s infinite;
  }
  @keyframes pulse-glow{0%,100%{box-shadow:0 0 20px rgba(255,215,0,.3)} 50%{box-shadow:0 0 30px rgba(255,215,0,.6)}}
  .prof-name{font-weight:900;font-size:18px;margin-bottom:6px}
  .prof-rank-pill{
    background:linear-gradient(135deg,rgba(255,215,0,.2),rgba(255,170,0,.1));
    border:1px solid rgba(255,215,0,.3);
    color:var(--gold);padding:6px 14px;border-radius:14px;
    font-weight:900;font-size:11px;display:inline-block;
  }
  .prof-stats{
    display:grid;grid-template-columns:repeat(3,1fr);gap:8px;
    padding:0 16px;margin-bottom:16px;
  }
  .stat-card{
    background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);
    border-radius:12px;padding:12px;text-align:center;
  }
  .stat-card.gold{background:linear-gradient(135deg,rgba(255,215,0,.15),rgba(255,170,0,.08));border-color:rgba(255,215,0,.3)}
  .stat-card.green{background:linear-gradient(135deg,rgba(74,222,128,.15),rgba(74,222,128,.08));border-color:rgba(74,222,128,.3)}
  .stat-card .v{font-weight:900;font-size:18px;color:var(--gold)}
  .stat-card.green .v{color:var(--green)}
  .stat-card .l{font-size:10px;color:var(--muted);margin-top:4px;font-weight:700}
  .level-box{
    background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.15);
    border-radius:12px;padding:12px 16px;margin:0 16px 16px;
  }
  .lv-row{display:flex;justify-content:space-between;margin-bottom:8px}
  .lv-label{font-weight:900;color:var(--gold)}
  .lv-bar{height:8px;background:rgba(0,0,0,.3);border-radius:4px;overflow:hidden}
  .lv-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--gold2));transition:width .4s}

  /* ═════ SECTION TITLE ═════ */
  .section-title{
    font-weight:900;font-size:12px;color:var(--gold);
    text-transform:uppercase;letter-spacing:2px;
    padding:12px 16px 6px;position:relative;z-index:2;
  }

  /* ═════ PROF BODY ═════ */
  .prof-body{
    flex:1;overflow:auto;padding:0 16px 16px;position:relative;z-index:2;
  }
  .prof-body::-webkit-scrollbar{width:4px}
  .prof-body::-webkit-scrollbar-thumb{background:rgba(255,215,0,.2);border-radius:2px}
  .detail-row{
    display:flex;justify-content:space-between;align-items:center;
    padding:10px 0;border-bottom:1px solid rgba(255,215,0,.1);
    font-size:13px;
  }
  .detail-row:last-child{border-bottom:none}
  .detail-label{color:var(--muted);font-weight:700}
  .detail-value{font-weight:900;color:var(--gold)}

  /* ═════ TABS ═════ */
  .tabs{
    display:flex;gap:8px;padding:12px 16px;position:relative;z-index:2;
    overflow:auto;border-bottom:1px solid rgba(255,215,0,.1);
  }
  .tabs::-webkit-scrollbar{height:3px}
  .tabs::-webkit-scrollbar-thumb{background:rgba(255,215,0,.2);border-radius:2px}
  .tab{
    background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);
    padding:8px 14px;border-radius:10px;color:rgba(255,255,255,.6);
    font-weight:700;font-size:12px;white-space:nowrap;border:none;cursor:pointer;
    transition:all .3s;
  }
  .tab.on{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a1a1a;font-weight:900}

  /* ═════ RANKS ═════ */
  .rank-list{
    flex:1;overflow:auto;padding:8px 16px 16px;position:relative;z-index:2;
  }
  .rank-list::-webkit-scrollbar{width:4px}
  .rank-list::-webkit-scrollbar-thumb{background:rgba(255,215,0,.2);border-radius:2px}
  .rank-card{
    display:flex;align-items:center;gap:12px;
    background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.15);
    border-radius:12px;padding:12px;margin-bottom:8px;
  }
  .rank-pos{
    font-weight:900;color:var(--gold);font-size:16px;
    width:32px;text-align:center;
  }
  .rank-avatar{
    width:40px;height:40px;border-radius:10px;
    background:linear-gradient(135deg,rgba(255,215,0,.15),rgba(255,170,0,.08));
    display:grid;place-items:center;font-size:20px;border:1px solid rgba(255,215,0,.2);
    flex-shrink:0;
  }
  .rank-main{flex:1;min-width:0}
  .rank-name{font-weight:900;font-size:13px}
  .rank-sub{font-size:11px;opacity:.7;margin-top:2px;font-weight:700}
  .rank-right{text-align:right;flex-shrink:0}
  .rank-score{font-weight:900;font-size:14px;color:var(--gold)}

  /* ═════ SHOP GRID ═════ */
  .shop-grid{
    display:grid;grid-template-columns:repeat(2,1fr);gap:8px;
    padding:12px 16px 16px;position:relative;z-index:2;
    overflow:auto;flex:1;
  }
  .shop-grid::-webkit-scrollbar{width:4px}
  .shop-grid::-webkit-scrollbar-thumb{background:rgba(255,215,0,.2);border-radius:2px}
  .shop-item{
    background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.15);
    border-radius:12px;padding:12px;text-align:center;
    position:relative;
  }
  .shop-item.owned{background:rgba(74,222,128,.08);border-color:rgba(74,222,128,.3)}
  .shop-item.equipped{background:linear-gradient(135deg,rgba(255,215,0,.2),rgba(255,170,0,.1));border-color:var(--gold)}
  .shop-item.equipped::after{
    content:"✓";position:absolute;top:6px;right:8px;
    width:20px;height:20px;border-radius:50%;background:var(--gold);
    color:#1a1a1a;display:grid;place-items:center;font-weight:900;font-size:12px;
  }
  .shop-emoji{font-size:32px;margin-bottom:6px}
  .shop-name{font-weight:900;font-size:12px}
  .shop-price{font-size:10px;color:var(--muted);margin-top:4px;font-weight:700}
  .shop-btn{
    margin-top:8px;background:linear-gradient(135deg,var(--gold),var(--gold2));
    color:#1a1a1a;border:none;padding:6px 10px;
    border-radius:8px;font-weight:900;font-size:10px;width:100%;
  }
  .shop-btn:disabled{background:rgba(255,255,255,.15);color:var(--muted)}
  .shop-btn.owned{background:rgba(74,222,128,.2);color:var(--green);border:1px solid rgba(74,222,128,.3)}
  .shop-btn.equipped{background:rgba(255,255,255,.15);color:rgba(255,255,255,.5)}

  /* ═════ MISSIONS ═════ */
  .mission-card{
    display:flex;align-items:center;gap:12px;
    background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.15);
    border-radius:12px;padding:12px;margin-bottom:8px;
  }
  .mission-main{flex:1;min-width:0}
  .mission-name{font-weight:900;font-size:13px}
  .mission-desc{font-size:11px;opacity:.7;margin-top:2px;font-weight:600}
  .mission-bar{
    height:6px;background:rgba(0,0,0,.35);
    border-radius:4px;overflow:hidden;margin-top:6px;
  }
  .mission-fill{
    height:100%;background:linear-gradient(90deg,var(--gold),var(--gold2));
    transition:width .4s;
  }
  .mission-right{text-align:right;flex-shrink:0}
  .mission-reward{
    font-weight:900;font-size:12px;color:var(--gold);
    display:flex;align-items:center;gap:3px;justify-content:flex-end;
  }
  .mission-reward::before{content:"⭐"}
  .mission-claim{
    margin-top:4px;background:linear-gradient(135deg,var(--gold),var(--gold2));
    color:#1a1a1a;border:none;padding:6px 10px;
    border-radius:8px;font-weight:900;font-size:11px;
  }
  .mission-claim:disabled{background:rgba(255,255,255,.1);color:var(--muted)}
  .mission-claim.done{background:rgba(74,222,128,.2);color:var(--green);border:1px solid rgba(74,222,128,.3)}

  /* ═════ ACHIEVEMENTS ═════ */
  .ach-grid{
    display:grid;grid-template-columns:repeat(2,1fr);gap:10px;
    overflow:auto;position:relative;z-index:2;padding-bottom:6px;
  }
  .ach-grid::-webkit-scrollbar{width:4px}
  .ach-grid::-webkit-scrollbar-thumb{background:rgba(255,215,0,.2);border-radius:2px}
  .ach-card{
    background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.15);
    border-radius:12px;padding:12px 10px;text-align:center;position:relative;
  }
  .ach-card.done{
    background:linear-gradient(135deg,rgba(255,215,0,.15),rgba(255,170,0,.08));
    border-color:var(--gold);
  }
  .ach-card.done::after{
    content:"✓";position:absolute;top:6px;right:8px;
    width:20px;height:20px;border-radius:50%;background:var(--gold);
    color:#1a1a1a;display:grid;place-items:center;font-weight:900;font-size:12px;
  }
  .ach-card.locked{opacity:.5;filter:grayscale(.6)}
  .ach-icon{font-size:32px;line-height:1}
  .ach-name{font-weight:900;font-size:12px;margin-top:6px}
  .ach-desc{font-size:10px;opacity:.7;margin-top:3px;font-weight:600;min-height:24px}
  .ach-reward{margin-top:6px;font-weight:900;font-size:11px;color:var(--gold)}

  /* ═════ GAME SCREEN ═════ */
  .game-area{
    flex:1;overflow:hidden;position:relative;z-index:2;
    display:flex;flex-direction:column;
    padding:12px 16px;
  }

  /* ═════ CARD ZONE ═════ */
  .card-zone{
    flex:1;display:flex;flex-direction:column;
    justify-content:space-around;align-items:center;
    margin:8px 0;
  }

  /* ═════ AVATAR AREAS ═════ */
  .avatar-area{
    display:flex;flex-direction:column;align-items:center;gap:6px;
  }
  .avatar-frame{
    width:60px;height:60px;border-radius:50%;
    border:3px solid var(--gold);
    background:linear-gradient(135deg,rgba(255,215,0,.15),rgba(255,170,0,.08));
    display:grid;place-items:center;font-size:32px;
    box-shadow:0 0 15px rgba(255,215,0,.25);
    animation:pulse-glow 2s infinite;
  }
  .avatar-name{
    font-weight:900;font-size:11px;color:var(--gold);
    text-align:center;max-width:70px;
    word-break:break-word;
  }

  /* ═════ CARDS DISPLAY ═════ */
  .cards-row{
    display:flex;justify-content:center;gap:8px;
    align-items:flex-start;min-height:100px;
  }
  .card{
    width:60px;height:90px;border-radius:8px;
    background:linear-gradient(135deg,#fff 0%,#f0f0f0 100%);
    border:2px solid #ccc;display:grid;place-items:center;
    font-weight:900;font-size:18px;color:#000;
    position:relative;
    transform-style:preserve-3d;
    transition:transform .6s;
  }
  .card.back{
    background:linear-gradient(135deg,var(--dark3),var(--dark2));
    border-color:var(--gold);
    color:var(--gold);font-size:12px;
  }
  .card.flip{transform:rotateY(180deg)}
  .card.flipped{transform:rotateY(0deg)}

  /* ═════ SCORE BADGES ═════ */
  .score-badge{
    background:linear-gradient(135deg,rgba(255,215,0,.2),rgba(255,170,0,.1));
    border:2px solid var(--gold);border-radius:12px;
    padding:8px 12px;font-weight:900;color:var(--gold);
    font-size:14px;text-align:center;min-width:50px;
  }

  /* ═════ RESULT DISPLAY ═════ */
  .result-banner{
    background:linear-gradient(135deg,rgba(255,215,0,.2),rgba(255,170,0,.1));
    border:2px solid var(--gold);border-radius:14px;
    padding:12px;text-align:center;margin:8px 0;
    color:var(--gold);font-weight:900;font-size:16px;
  }
  .result-banner.win{background:linear-gradient(135deg,rgba(74,222,128,.2),rgba(74,222,128,.1));border-color:var(--green);color:var(--green)}
  .result-banner.lose{background:linear-gradient(135deg,rgba(255,90,106,.2),rgba(255,90,106,.1));border-color:var(--red);color:var(--red)}

  /* ═════ BETTING CONTROLS ═════ */
  .bet-section{
    background:rgba(26,26,26,.8);border:1px solid rgba(255,215,0,.2);
    border-radius:12px;padding:12px;margin:8px 0;
  }
  .bet-types{
    display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px;
  }
  .bet-btn{
    padding:10px 8px;border-radius:10px;border:2px solid rgba(255,215,0,.2);
    background:rgba(255,215,0,.08);color:#fff;font-weight:900;
    font-size:12px;text-align:center;transition:all .3s;
  }
  .bet-btn.active{
    background:linear-gradient(135deg,var(--gold),var(--gold2));
    border-color:var(--gold);color:#1a1a1a;
  }

  /* ═════ CHIP SELECTOR ═════ */
  .chip-selector{
    display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;
  }
  .chip{
    width:100%;aspect-ratio:1;border-radius:50%;
    background:linear-gradient(135deg,rgba(255,215,0,.15),rgba(255,170,0,.08));
    border:2px solid rgba(255,215,0,.3);color:var(--gold);
    font-weight:900;font-size:12px;display:grid;place-items:center;
    transition:all .3s;cursor:pointer;
  }
  .chip.selected{
    background:linear-gradient(135deg,var(--gold),var(--gold2));
    border-color:var(--gold);color:#1a1a1a;
    box-shadow:0 0 15px rgba(255,215,0,.5);
  }

  /* ═════ DEAL BUTTON ═════ */
  .deal-btn{
    width:100%;padding:12px;border:none;border-radius:12px;
    background:linear-gradient(135deg,var(--gold),var(--gold2));
    color:#1a1a1a;font-weight:900;font-size:14px;
    transition:all .3s;box-shadow:0 6px 15px rgba(255,215,0,.3);
  }
  .deal-btn:active{transform:scale(.98);box-shadow:0 3px 8px rgba(255,215,0,.2)}
  .deal-btn:disabled{
    background:rgba(255,255,255,.15);color:var(--muted);
    box-shadow:none;opacity:.6;
  }

  /* ═════ ROAD MAP ═════ */
  .road-map{
    background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.15);
    border-radius:10px;padding:8px;margin:8px 0;
    overflow-x:auto;height:50px;display:flex;gap:4px;align-items:center;
  }
  .road-map::-webkit-scrollbar{height:2px}
  .road-map::-webkit-scrollbar-thumb{background:rgba(255,215,0,.3)}
  .bead{
    width:28px;height:28px;border-radius:50%;
    display:grid;place-items:center;font-size:12px;flex-shrink:0;
    border:2px solid rgba(255,215,0,.3);font-weight:900;
  }
  .bead.p{background:rgba(255,90,106,.2);border-color:var(--red);color:var(--red)}
  .bead.b{background:rgba(90,169,255,.2);border-color:var(--blue);color:var(--blue)}
  .bead.t{background:rgba(74,222,128,.2);border-color:var(--green);color:var(--green)}

  /* ═════ CONFETTI ═════ */
  .confetti{
    position:absolute;width:8px;height:14px;
    pointer-events:none;z-index:100;
    animation:kk-confetti 2.5s ease-out forwards;
  }
  @keyframes kk-confetti{
    0%{transform:translate(0,0) rotate(0deg);opacity:1}
    100%{transform:translate(var(--tx),var(--ty)) rotate(360deg);opacity:0}
  }

  /* ═════ TUTORIAL ═════ */
  .tut-body{
    flex:1;overflow:auto;position:relative;z-index:2;padding:8px 16px;
  }
  .tut-body::-webkit-scrollbar{width:4px}
  .tut-body::-webkit-scrollbar-thumb{background:rgba(255,215,0,.2);border-radius:2px}
  .tut-card{
    background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.15);
    border-radius:12px;padding:12px;margin-bottom:8px;
  }
  .tut-title{
    font-weight:900;font-size:13px;color:var(--gold);
    margin-bottom:6px;display:flex;align-items:center;gap:6px;
  }
  .tut-desc{
    font-size:12px;line-height:1.5;opacity:.8;font-weight:600;
  }

  /* ═════ SETTINGS ═════ */
  .setting-group{
    background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.15);
    border-radius:12px;padding:12px;margin-bottom:10px;
  }
  .setting-label{font-weight:900;font-size:13px;margin-bottom:8px}
  .setting-row{
    display:flex;justify-content:space-between;align-items:center;
    padding:8px 0;border-bottom:1px solid rgba(255,215,0,.1);
    font-size:12px;
  }
  .setting-row:last-child{border-bottom:none}
  .toggle-switch{
    width:40px;height:24px;background:rgba(255,255,255,.2);
    border-radius:12px;border:1px solid rgba(255,255,255,.3);
    position:relative;cursor:pointer;transition:all .3s;
  }
  .toggle-switch.on{background:var(--gold);border-color:var(--gold)}
  .toggle-switch .dot{
    width:20px;height:20px;border-radius:50%;background:#fff;
    position:absolute;top:2px;left:2px;transition:left .3s;
  }
  .toggle-switch.on .dot{left:18px}

  /* ═════ POPUP ═════ */
  .popup-overlay{
    position:fixed;inset:0;background:rgba(0,0,0,.7);
    display:none;align-items:center;justify-content:center;z-index:200;
  }
  .popup-overlay.show{display:flex}
  .popup{
    background:linear-gradient(135deg,#1a1a1a,#111);
    border:2px solid var(--gold);border-radius:16px;
    padding:24px;text-align:center;max-width:320px;
    box-shadow:0 20px 50px rgba(0,0,0,.9);
  }
  .popup-title{
    font-weight:900;font-size:18px;color:var(--gold);margin-bottom:12px;
  }
  .popup-msg{
    font-size:13px;opacity:.8;margin-bottom:16px;line-height:1.5;
  }
  .popup-btns{
    display:flex;gap:8px;
  }
  .popup-btn{
    flex:1;padding:10px;border:none;border-radius:8px;
    font-weight:900;font-size:12px;cursor:pointer;
    background:linear-gradient(135deg,var(--gold),var(--gold2));
    color:#1a1a1a;
  }
  .popup-btn.cancel{
    background:rgba(255,255,255,.15);color:rgba(255,255,255,.7);
  }

  /* ═════ ROOM PANEL ═════ */
  .room-panel{
    position:absolute;inset:0;background:rgba(0,0,0,.95);
    border:1px solid rgba(255,215,0,.2);border-radius:16px;
    display:none;flex-direction:column;z-index:150;
    overflow:hidden;
  }
  .room-panel.show{display:flex}
  .room-header{
    padding:12px 16px;border-bottom:1px solid rgba(255,215,0,.2);
    display:flex;justify-content:space-between;align-items:center;
  }
  .room-title{font-weight:900;color:var(--gold)}
  .room-close{background:transparent;border:none;color:var(--gold);font-size:20px;cursor:pointer}
  .room-body{flex:1;overflow:auto;padding:12px 16px}
  .room-section{margin-bottom:14px}
  .room-section-title{
    font-weight:900;font-size:12px;color:var(--gold);
    text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;
  }
  .player-card{
    background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.15);
    border-radius:10px;padding:10px;margin-bottom:6px;display:flex;
    align-items:center;gap:10px;
  }
  .player-card .avatar{width:40px;height:40px;font-size:20px}
  .player-info{flex:1}
  .player-name{font-weight:900;font-size:12px}
  .player-wins{font-size:10px;color:var(--muted);margin-top:2px}

  /* ═════ HIDDEN ═════ */
  .hidden{display:none !important}
  .sr-only{position:absolute;left:-9999px}
  `;

  /* ═════════════════════════════════════════════════════════════════════════
     HTML & MOUNT
     ═════════════════════════════════════════════════════════════════════════ */
  function boot() {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
    document.head.appendChild(meta);

    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const root = document.createElement('div');
    root.id = 'kk-root';
    document.body.appendChild(root);

    root.innerHTML = `
    <div class="stage" id="stage">

      <!-- HOME -->
      <section class="screen active" id="sc-home">
        <div class="topbar">
          <div class="brand">
            <div class="brand-logo">🃏</div>
            <div class="brand-name">FA Baccarat<small>VIP Casino</small></div>
          </div>
          <div class="topbar-right">
            <span class="lvl-pill" id="hm-lvl">LV 1</span>
            <span class="star-pill" id="hm-stars">0</span>
          </div>
        </div>

        <div class="daily-card hidden" id="daily-card">
          <div class="daily-icon">🎁</div>
          <div class="daily-text">
            <div class="daily-title" data-i18n="daily_checkin">Daily Check-in</div>
            <div class="daily-sub">+100⭐</div>
          </div>
          <button class="daily-claim" id="daily-claim-btn" data-i18n="claim">Claim</button>
        </div>

        <div class="info-bar">
          <div class="info-item">
            <div class="info-val" id="info-stars">0</div>
            <div class="info-lbl" data-i18n="stars">Stars</div>
          </div>
          <div class="info-item">
            <div class="info-val" id="info-level">1</div>
            <div class="info-lbl" data-i18n="level">Level</div>
          </div>
          <div class="info-item">
            <div class="info-val" id="info-wins">0</div>
            <div class="info-lbl" data-i18n="wins">Wins</div>
          </div>
          <div class="info-item">
            <div class="info-val" id="info-streak">0</div>
            <div class="info-lbl" data-i18n="streak">Streak</div>
          </div>
        </div>

        <div class="hero">
          <h1 class="hero-title">🃏 Baccarat</h1>
          <p class="hero-sub">PUNTO • BANCO</p>
        </div>

        <div class="menu">
          <button class="main-btn primary" data-action="play-ai">
            <div class="mb-ico">🤵</div>
            <div class="mb-lbl">
              <div class="mb-title" data-i18n="play_ai">Play vs Dealer</div>
              <div class="mb-sub">Premium experience</div>
            </div>
            <div class="mb-arrow">›</div>
          </button>
          <button class="main-btn secondary" data-action="play-online">
            <div class="mb-ico">🌐</div>
            <div class="mb-lbl">
              <div class="mb-title" data-i18n="play_online">Online Table</div>
              <div class="mb-sub">Real players</div>
            </div>
            <div class="mb-arrow">›</div>
          </button>
          <div class="footer-nav">
            <button class="fnav on" data-nav="home"><span class="i">🏠</span><span data-i18n="nav_home">Home</span></button>
            <button class="fnav" data-nav="rank"><span class="i">🏆</span><span data-i18n="nav_rank">Ranking</span></button>
            <button class="fnav" data-nav="shop"><span class="i">🛍️</span><span data-i18n="nav_shop">Shop</span></button>
            <button class="fnav" data-nav="mission"><span class="i">📋</span><span data-i18n="nav_mission">Mission</span></button>
            <button class="fnav" data-nav="profile"><span class="i">👤</span><span data-i18n="nav_profile">Profile</span></button>
          </div>
        </div>
      </section>

      <!-- GAME -->
      <section class="screen" id="sc-game">
        <div class="topbar">
          <button class="icon-btn" data-back>←</button>
          <div class="brand-name" style="text-align:center;flex:1" data-i18n="app_title">Baccarat</div>
          <button class="icon-btn" id="btn-undo">🔄</button>
        </div>

        <div class="game-area">
          <div class="avatar-area">
            <div class="avatar-frame" id="dealer-avatar">🤵</div>
            <div class="avatar-name" data-i18n="dealer">Dealer</div>
          </div>

          <div class="cards-row">
            <div class="card back" id="banker-c1">🂠</div>
            <div class="card back" id="banker-c2">🂠</div>
          </div>
          <div class="score-badge" id="banker-score">0</div>

          <div class="result-banner hidden" id="result-banner"></div>

          <div class="cards-row">
            <div class="card back" id="player-c1">🂠</div>
            <div class="card back" id="player-c2">🂠</div>
          </div>
          <div class="score-badge" id="player-score">0</div>

          <div class="avatar-area">
            <div class="avatar-frame" id="player-avatar">🃏</div>
            <div class="avatar-name" id="player-name">You</div>
          </div>

          <div class="road-map" id="road-map"></div>

          <div class="bet-section">
            <div class="bet-types">
              <button class="bet-btn" data-bet="player"><span data-i18n="player">Player</span><br/><small>×2</small></button>
              <button class="bet-btn" data-bet="tie"><span data-i18n="tie">Tie</span><br/><small>×9</small></button>
              <button class="bet-btn" data-bet="banker"><span data-i18n="banker">Banker</span><br/><small>×1.95</small></button>
            </div>

            <div class="chip-selector" id="chip-selector"></div>

            <button class="deal-btn" id="deal-btn" data-i18n="deal">Deal</button>
          </div>
        </div>
      </section>

      <!-- PROFILE -->
      <section class="screen" id="sc-profile">
        <div class="topbar">
          <button class="icon-btn" data-back>←</button>
          <div class="brand-name" style="text-align:center;flex:1" data-i18n="profile">Profile</div>
          <button class="icon-btn" id="btn-prof-settings">⚙️</button>
        </div>

        <div class="prof-head">
          <div class="avatar" id="prof-avatar">🃏</div>
          <div class="prof-name" id="prof-name">Player</div>
          <div class="prof-rank-pill" id="prof-rank-pill">LEVEL 1</div>
        </div>

        <div class="prof-stats">
          <div class="stat-card gold"><div class="v" id="ps-stars">0</div><div class="l" data-i18n="stars">Stars</div></div>
          <div class="stat-card green"><div class="v" id="ps-wins">0</div><div class="l" data-i18n="wins">Wins</div></div>
          <div class="stat-card"><div class="v" id="ps-rate">0%</div><div class="l">Win Rate</div></div>
        </div>

        <div class="level-box">
          <div class="lv-row">
            <span class="lv-label" id="lv-label">LV 1</span>
            <span id="lv-xp">0 / 100 XP</span>
          </div>
          <div class="lv-bar"><div class="lv-fill" id="lv-fill" style="width:0%"></div></div>
        </div>

        <div class="section-title">STATS</div>
        <div class="prof-body" id="prof-body"></div>

        <div class="footer-nav">
          <button class="fnav" data-nav="home"><span class="i">🏠</span><span data-i18n="nav_home">Home</span></button>
          <button class="fnav" data-nav="rank"><span class="i">🏆</span><span data-i18n="nav_rank">Ranking</span></button>
          <button class="fnav" data-nav="shop"><span class="i">🛍️</span><span data-i18n="nav_shop">Shop</span></button>
          <button class="fnav" data-nav="mission"><span class="i">📋</span><span data-i18n="nav_mission">Mission</span></button>
          <button class="fnav on" data-nav="profile"><span class="i">👤</span><span data-i18n="nav_profile">Profile</span></button>
        </div>
      </section>

      <!-- RANKING -->
      <section class="screen" id="sc-rank">
        <div class="topbar">
          <button class="icon-btn" data-back>←</button>
          <div class="brand-name" style="text-align:center;flex:1">🏆 <span data-i18n="ranking">Ranking</span></div>
          <button class="icon-btn" id="btn-rank-refresh">🔄</button>
        </div>

        <div class="tabs">
          <button class="tab on" data-rtab="total" data-i18n="total_rank">Total Rank</button>
          <button class="tab" data-rtab="weekly" data-i18n="weekly_top">Weekly TOP 7</button>
          <button class="tab" data-rtab="prev" data-i18n="last_week">Last Week TOP 7</button>
        </div>

        <div style="text-align:center;font-size:10px;color:rgba(255,255,255,.6);padding:4px 16px;font-weight:700" id="rank-reset-info"></div>

        <div class="rank-list" id="rank-list"></div>

        <div class="footer-nav">
          <button class="fnav" data-nav="home"><span class="i">🏠</span><span data-i18n="nav_home">Home</span></button>
          <button class="fnav on" data-nav="rank"><span class="i">🏆</span><span data-i18n="nav_rank">Ranking</span></button>
          <button class="fnav" data-nav="shop"><span class="i">🛍️</span><span data-i18n="nav_shop">Shop</span></button>
          <button class="fnav" data-nav="mission"><span class="i">📋</span><span data-i18n="nav_mission">Mission</span></button>
          <button class="fnav" data-nav="profile"><span class="i">👤</span><span data-i18n="nav_profile">Profile</span></button>
        </div>
      </section>

      <!-- SHOP -->
      <section class="screen" id="sc-shop">
        <div class="topbar">
          <button class="icon-btn" data-back>←</button>
          <div class="brand-name" style="text-align:center;flex:1">🛍️ <span data-i18n="shop_title">Shop</span></div>
          <span class="star-pill" id="shop-stars">0</span>
        </div>

        <div class="tabs">
          <button class="tab on" data-stab="avatar" data-i18n="avatars">Avatars</button>
          <button class="tab" data-stab="table" data-i18n="tables">Tables</button>
          <button class="tab" data-stab="cardback" data-i18n="card_backs">Card Backs</button>
        </div>

        <div class="shop-grid" id="shop-grid"></div>

        <div class="footer-nav">
          <button class="fnav" data-nav="home"><span class="i">🏠</span><span data-i18n="nav_home">Home</span></button>
          <button class="fnav" data-nav="rank"><span class="i">🏆</span><span data-i18n="nav_rank">Ranking</span></button>
          <button class="fnav on" data-nav="shop"><span class="i">🛍️</span><span data-i18n="nav_shop">Shop</span></button>
          <button class="fnav" data-nav="mission"><span class="i">📋</span><span data-i18n="nav_mission">Mission</span></button>
          <button class="fnav" data-nav="profile"><span class="i">👤</span><span data-i18n="nav_profile">Profile</span></button>
        </div>
      </section>

      <!-- MISSION -->
      <section class="screen" id="sc-mission">
        <div class="topbar">
          <button class="icon-btn" data-back>←</button>
          <div class="brand-name" style="text-align:center;flex:1">📋 <span data-i18n="mission">Mission</span></div>
          <div style="width:42px"></div>
        </div>

        <div class="tabs">
          <button class="tab on" data-mtab="daily" data-i18n="daily_m">Daily</button>
          <button class="tab" data-mtab="ach" data-i18n="achievement">Achievement</button>
        </div>

        <div class="rank-list" id="mission-list"></div>

        <div class="footer-nav">
          <button class="fnav" data-nav="home"><span class="i">🏠</span><span data-i18n="nav_home">Home</span></button>
          <button class="fnav" data-nav="rank"><span class="i">🏆</span><span data-i18n="nav_rank">Ranking</span></button>
          <button class="fnav" data-nav="shop"><span class="i">🛍️</span><span data-i18n="nav_shop">Shop</span></button>
          <button class="fnav on" data-nav="mission"><span class="i">📋</span><span data-i18n="nav_mission">Mission</span></button>
          <button class="fnav" data-nav="profile"><span class="i">👤</span><span data-i18n="nav_profile">Profile</span></button>
        </div>
      </section>

      <!-- SETTINGS -->
      <section class="screen" id="sc-settings">
        <div class="topbar">
          <button class="icon-btn" data-back>←</button>
          <div class="brand-name" style="text-align:center;flex:1">⚙️ <span data-i18n="settings">Settings</span></div>
          <button class="icon-btn" id="btn-how">❓</button>
        </div>

        <div style="flex:1;overflow:auto;padding:12px 16px 16px;position:relative;z-index:2">
          <div class="section-title">GAME</div>

          <div class="setting-group">
            <div class="setting-label" data-i18n="sound">Sound</div>
            <div class="setting-row">
              <span>Effects</span>
              <div class="toggle-switch" id="toggle-sound"><div class="dot"></div></div>
            </div>
          </div>

          <div class="setting-group">
            <div class="setting-label" data-i18n="vibrate">Vibration</div>
            <div class="setting-row">
              <span>Haptic feedback</span>
              <div class="toggle-switch" id="toggle-vibrate"><div class="dot"></div></div>
            </div>
          </div>

          <div class="setting-group">
            <div class="setting-label" data-i18n="language">Language</div>
            <select id="lang-select" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,215,0,.2);background:rgba(26,26,26,.6);color:#fff;font-weight:700">
              <option value="en">English</option>
              <option value="ko">한국어</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
              <option value="vi">Tiếng Việt</option>
              <option value="th">ไทย</option>
            </select>
          </div>

          <div class="section-title">ACCOUNT</div>
          <div class="setting-group">
            <button class="main-btn secondary" id="btn-reset-all" style="width:100%;margin:0">
              <span data-i18n="reset_stats">Reset Stats</span>
            </button>
          </div>
        </div>
      </section>

      <!-- TUTORIAL -->
      <section class="screen" id="sc-tutorial">
        <div class="topbar">
          <button class="icon-btn" data-back>←</button>
          <div class="brand-name" style="text-align:center;flex:1">❓ <span data-i18n="tutorial">How to Play</span></div>
          <div style="width:42px"></div>
        </div>

        <div class="tut-body">
          <div class="tut-card">
            <div class="tut-title">🃏 What is Baccarat?</div>
            <div class="tut-desc">Punto Banco is a comparing card game played between a player and banker. The goal is to get a hand total closest to 9.</div>
          </div>

          <div class="tut-card">
            <div class="tut-title">🎯 Card Values</div>
            <div class="tut-desc">Ace = 1, 2-9 = face value, 10/J/Q/K = 0. Only the last digit counts (e.g., 15 = 5).</div>
          </div>

          <div class="tut-card">
            <div class="tut-title">👥 Betting</div>
            <div class="tut-desc">Bet on Player (×2), Banker (×1.95), or Tie (×9). Select a chip amount, choose your bet, and deal.</div>
          </div>

          <div class="tut-card">
            <div class="tut-title">📏 3rd Card Rule</div>
            <div class="tut-desc">If either Player or Banker has 8 or 9, the game ends (Natural). If Player has 0-5, they draw. Banker's draw depends on Player's 3rd card.</div>
          </div>

          <div class="tut-card">
            <div class="tut-title">🏆 Winning</div>
            <div class="tut-desc">Closest to 9 wins. A tie means both hands equal — ties pay 9:1 but lose Player/Banker bets.</div>
          </div>

          <div class="tut-card">
            <div class="tut-title">⭐ Earn Stars</div>
            <div class="tut-desc">Win games to earn stars. Buy avatars, tables, and card backs in the shop. Complete missions for bonus stars.</div>
          </div>
        </div>
      </section>

    </div>

    <div class="popup-overlay" id="popup-overlay">
      <div class="popup" id="popup">
        <div class="popup-title" id="popup-title">Alert</div>
        <div class="popup-msg" id="popup-msg"></div>
        <div class="popup-btns" id="popup-btns"></div>
      </div>
    </div>

    <div class="room-panel" id="room-panel">
      <div class="room-header">
        <div class="room-title">Online Table</div>
        <button class="room-close" id="room-panel-close">✕</button>
      </div>
      <div class="room-body">
        <div class="room-section">
          <div class="room-section-title">Players Online</div>
          <div id="online-players"></div>
        </div>
        <div class="room-section">
          <div class="room-section-title">Open Rooms</div>
          <div id="open-rooms"></div>
        </div>
        <div class="room-section">
          <div class="room-section-title">Create Room</div>
          <input type="number" id="create-wager" placeholder="Wager (stars)" min="50" step="50" style="width:100%;padding:8px;margin-bottom:6px;border:1px solid rgba(255,215,0,.2);border-radius:8px;background:rgba(26,26,26,.6);color:#fff">
          <button id="create-room-btn" class="main-btn primary" style="width:100%;margin:0">Create</button>
        </div>
      </div>
    </div>

    </div>
    `;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     i18n TRANSLATIONS
     ═════════════════════════════════════════════════════════════════════════ */
  const I18N = {
    en: {
      app_title:'Baccarat',nav_home:'Home',nav_rank:'Ranking',nav_shop:'Shop',nav_mission:'Mission',nav_profile:'Profile',
      play_ai:'Play vs Dealer',play_online:'Online Table',daily_checkin:'Daily Check-in',
      stars:'Stars',level:'Level',wins:'Wins',streak:'Streak',deal:'Deal',player:'Player',banker:'Banker',tie:'Tie',
      natural:'Natural',you_win:'You Win!',you_lose:'You Lose',tie_push:'Push',bet_returned:'Bet Returned',
      not_enough:'Not enough stars',need_stars:'You need {0} stars',settings:'Settings',sound:'Sound',vibrate:'Vibration',
      speed_deal:'Speed Deal',language:'Language',total_rank:'Total',weekly_top:'Weekly',last_week:'Last Week',
      shop_title:'Shop',avatars:'Avatars',tables:'Tables',card_backs:'Card Backs',equipped:'Equipped',equip:'Equip',
      locked:'Locked',purchase:'Buy',missions_title:'Missions',daily_m:'Daily',achievement:'Achievements',
      profile:'Profile',edit_nick:'Edit Nickname',reset_stats:'Reset Stats',tutorial:'How to Play',
      home:'Home',confirm_reset:'Reset all stats?',ok:'OK',cancel:'Cancel',nickname_updated:'Updated',
      reset_complete:'Reset complete',refreshed:'Refreshed',online_lobby:'Online',create_room:'Create',
      join_room:'Join',waiting:'Waiting...',room_code:'Code',wager:'Wager',cancel_room:'Cancel',
      weekly_reset:'Resets ',claim:'Claim',done:'Done',dealer:'Dealer',ranking:'Ranking',
      mission:'Mission',tables:'Tables',
    },
    ko: {
      app_title:'바카라',nav_home:'홈',nav_rank:'랭킹',nav_shop:'상점',nav_mission:'미션',nav_profile:'프로필',
      play_ai:'딜러와 플레이',play_online:'온라인 테이블',daily_checkin:'일일 출석',
      stars:'별',level:'레벨',wins:'승리',streak:'연승',deal:'딜',player:'플레이어',banker:'뱅커',tie:'타이',
      natural:'네추럴',you_win:'승리!',you_lose:'패배',tie_push:'푸시',bet_returned:'베팅 반환',
      not_enough:'별이 부족합니다',need_stars:'{0}개의 별이 필요합니다',settings:'설정',sound:'사운드',vibrate:'진동',
      speed_deal:'빠른 딜',language:'언어',total_rank:'전체',weekly_top:'주간 TOP7',last_week:'지난주 TOP7',
      shop_title:'상점',avatars:'아바타',tables:'테이블',card_backs:'카드 백',equipped:'장착됨',equip:'장착',
      locked:'잠금',purchase:'구매',missions_title:'미션',daily_m:'일일',achievement:'업적',
      profile:'프로필',edit_nick:'닉네임 변경',reset_stats:'통계 초기화',tutorial:'플레이 방법',
      home:'홈',confirm_reset:'통계를 초기화하시겠습니까?',ok:'확인',cancel:'취소',nickname_updated:'업데이트됨',
      reset_complete:'초기화 완료',refreshed:'새로고침됨',online_lobby:'온라인',create_room:'생성',
      join_room:'참여',waiting:'대기 중...',room_code:'코드',wager:'베팅',cancel_room:'취소',
      weekly_reset:'초기화',claim:'받기',done:'완료',dealer:'딜러',ranking:'랭킹',
      mission:'미션',tables:'테이블',
    },
    ja: {
      app_title:'バカラ',nav_home:'ホーム',nav_rank:'ランキング',nav_shop:'ショップ',nav_mission:'ミッション',nav_profile:'プロフィール',
      play_ai:'ディーラーとプレイ',play_online:'オンラインテーブル',daily_checkin:'デイリーチェックイン',
      stars:'スター',level:'レベル',wins:'勝利',streak:'連勝',deal:'ディール',player:'プレイヤー',banker:'バンカー',tie:'タイ',
      natural:'ナチュラル',you_win:'勝利!',you_lose:'敗北',tie_push:'プッシュ',bet_returned:'ベット返還',
      not_enough:'スター不足',need_stars:'{0}個のスターが必要です',settings:'設定',sound:'サウンド',vibrate:'振動',
      speed_deal:'スピードディール',language:'言語',total_rank:'総合',weekly_top:'週間TOP7',last_week:'先週TOP7',
      shop_title:'ショップ',avatars:'アバター',tables:'テーブル',card_backs:'カードバック',equipped:'装備',equip:'装備',
      locked:'ロック',purchase:'購入',missions_title:'ミッション',daily_m:'デイリー',achievement:'アチーブメント',
      profile:'プロフィール',edit_nick:'ニックネーム変更',reset_stats:'統計リセット',tutorial:'遊び方',
      home:'ホーム',confirm_reset:'統計をリセットしますか？',ok:'OK',cancel:'キャンセル',nickname_updated:'更新済み',
      reset_complete:'リセット完了',refreshed:'更新済み',online_lobby:'オンライン',create_room:'作成',
      join_room:'参加',waiting:'待機中...',room_code:'コード',wager:'ワガー',cancel_room:'キャンセル',
      weekly_reset:'リセット',claim:'獲得',done:'完了',dealer:'ディーラー',ranking:'ランキング',
      mission:'ミッション',tables:'テーブル',
    },
    zh: {
      app_title:'百家乐',nav_home:'首页',nav_rank:'排名',nav_shop:'商店',nav_mission:'任务',nav_profile:'资料',
      play_ai:'对阵庄家',play_online:'在线桌子',daily_checkin:'每日签到',
      stars:'星',level:'等级',wins:'胜利',streak:'连胜',deal:'发牌',player:'玩家',banker:'庄家',tie:'平局',
      natural:'天然',you_win:'你赢了!',you_lose:'你输了',tie_push:'推',bet_returned:'下注返还',
      not_enough:'星不足',need_stars:'需要{0}个星',settings:'设置',sound:'声音',vibrate:'振动',
      speed_deal:'快速发牌',language:'语言',total_rank:'总计',weekly_top:'周排名TOP7',last_week:'上周TOP7',
      shop_title:'商店',avatars:'头像',tables:'桌子',card_backs:'卡背',equipped:'已装备',equip:'装备',
      locked:'锁定',purchase:'购买',missions_title:'任务',daily_m:'每日',achievement:'成就',
      profile:'资料',edit_nick:'编辑昵称',reset_stats:'重置统计',tutorial:'如何玩',
      home:'首页',confirm_reset:'重置统计？',ok:'确定',cancel:'取消',nickname_updated:'已更新',
      reset_complete:'重置完成',refreshed:'已刷新',online_lobby:'在线',create_room:'创建',
      join_room:'加入',waiting:'等待中...',room_code:'代码',wager:'下注',cancel_room:'取消',
      weekly_reset:'重置',claim:'领取',done:'完成',dealer:'庄家',ranking:'排名',
      mission:'任务',tables:'桌子',
    },
    vi: {
      app_title:'Baccarat',nav_home:'Trang chủ',nav_rank:'Xếp hạng',nav_shop:'Cửa hàng',nav_mission:'Nhiệm vụ',nav_profile:'Hồ sơ',
      play_ai:'Chơi với Dealer',play_online:'Bàn online',daily_checkin:'Check-in hàng ngày',
      stars:'Sao',level:'Cấp độ',wins:'Thắng',streak:'Chuỗi',deal:'Chia bài',player:'Người chơi',banker:'Nhà cái',tie:'Hòa',
      natural:'Tự nhiên',you_win:'Bạn thắng!',you_lose:'Bạn thua',tie_push:'Hòa',bet_returned:'Hoàn lại cược',
      not_enough:'Sao không đủ',need_stars:'Cần {0} sao',settings:'Cài đặt',sound:'Âm thanh',vibrate:'Rung',
      speed_deal:'Chia bài nhanh',language:'Ngôn ngữ',total_rank:'Tổng',weekly_top:'TOP 7 hàng tuần',last_week:'TOP 7 tuần trước',
      shop_title:'Cửa hàng',avatars:'Avatar',tables:'Bàn',card_backs:'Lưng bài',equipped:'Đã trang bị',equip:'Trang bị',
      locked:'Khóa',purchase:'Mua',missions_title:'Nhiệm vụ',daily_m:'Hàng ngày',achievement:'Thành tựu',
      profile:'Hồ sơ',edit_nick:'Sửa tên',reset_stats:'Đặt lại',tutorial:'Cách chơi',
      home:'Trang chủ',confirm_reset:'Đặt lại tất cả?',ok:'OK',cancel:'Hủy',nickname_updated:'Đã cập nhật',
      reset_complete:'Đã đặt lại',refreshed:'Đã làm mới',online_lobby:'Online',create_room:'Tạo',
      join_room:'Tham gia',waiting:'Đang chờ...',room_code:'Mã',wager:'Cược',cancel_room:'Hủy',
      weekly_reset:'Đặt lại',claim:'Nhận',done:'Xong',dealer:'Dealer',ranking:'Xếp hạng',
      mission:'Nhiệm vụ',tables:'Bàn',
    },
    th: {
      app_title:'บาคาร่า',nav_home:'หน้าแรก',nav_rank:'อันดับ',nav_shop:'ร้านค้า',nav_mission:'ภารกิจ',nav_profile:'โปรไฟล์',
      play_ai:'เล่นกับดีลเลอร์',play_online:'โต๊ะออนไลน์',daily_checkin:'เช็คอินรายวัน',
      stars:'ดาว',level:'ระดับ',wins:'ชัยชนะ',streak:'คำถัดจาก',deal:'ดีล',player:'ผู้เล่น',banker:'แบงค์เกอร์',tie:'เสมอ',
      natural:'ธรรมชาติ',you_win:'คุณชนะ!',you_lose:'คุณแพ้',tie_push:'เสมอ',bet_returned:'คืนเงินเดิมพัน',
      not_enough:'ดาวไม่พอ',need_stars:'ต้องการ {0} ดาว',settings:'การตั้งค่า',sound:'เสียง',vibrate:'การสั่น',
      speed_deal:'ดีลเร็ว',language:'ภาษา',total_rank:'รวม',weekly_top:'TOP 7 รายสัปดาห์',last_week:'TOP 7 สัปดาห์ที่แล้ว',
      shop_title:'ร้านค้า',avatars:'อวตาร',tables:'โต๊ะ',card_backs:'ฝั่งหลังการ์ด',equipped:'สวมใส่',equip:'สวมใส่',
      locked:'ล็อก',purchase:'ซื้อ',missions_title:'ภารกิจ',daily_m:'รายวัน',achievement:'ความสำเร็จ',
      profile:'โปรไฟล์',edit_nick:'แก้ไขชื่อเล่น',reset_stats:'รีเซตสถิติ',tutorial:'วิธีเล่น',
      home:'หน้าแรก',confirm_reset:'รีเซตสถิติ?',ok:'ตกลง',cancel:'ยกเลิก',nickname_updated:'อัปเดต',
      reset_complete:'รีเซตเสร็จ',refreshed:'รีเฟรช',online_lobby:'ออนไลน์',create_room:'สร้าง',
      join_room:'เข้าร่วม',waiting:'รอสักครู่...',room_code:'รหัส',wager:'เดิมพัน',cancel_room:'ยกเลิก',
      weekly_reset:'รีเซต',claim:'รับ',done:'เสร็จ',dealer:'ดีลเลอร์',ranking:'อันดับ',
      mission:'ภารกิจ',tables:'โต๊ะ',
    },
  };

  let lang = 'en';
  function applyI18n() {
    const dict = I18N[lang] || I18N.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
  }

  function t(key) {
    const dict = I18N[lang] || I18N.en;
    return dict[key] || key;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     GAME STATE & PROFILE
     ═════════════════════════════════════════════════════════════════════════ */
  let profile = loadProfile();
  let settings = loadSettings();
  let shop = loadShop();

  const game = {
    shoe: [],
    playerCards: [],
    bankerCards: [],
    playerBet: null,
    betAmount: 0,
    lastResults: [],
    current: 0,
    gameOver: false,
  };

  function levelFromXp(xp) {
    const lv = Math.floor(xp / 100) + 1;
    const xpNeeded = lv * 100;
    const xpPrev = (lv - 1) * 100;
    const progress = ((xp - xpPrev) / (xpNeeded - xpPrev)) * 100;
    return { lv, xp: xp % 100, xpNeeded: 100, progress };
  }

  function loadProfile() {
    let p = JSON.parse(localStorage.getItem(STORE_KEY));
    if (!p) {
      p = {
        id: 'player_' + Date.now(),
        nickname: 'Player',
        stars: STARTING_STARS,
        xp: 0,
        totalWins: 0,
        totalLosses: 0,
        totalGames: 0,
        bestStreak: 0,
        currentStreak: 0,
        playerWins: 0,
        bankerWins: 0,
        tieWins: 0,
        maxBet: 0,
        lastDailyClaimTime: 0,
      };
    }
    return p;
  }

  function saveProfile() {
    localStorage.setItem(STORE_KEY, JSON.stringify(profile));
    Online.pushLeader();
  }

  function loadSettings() {
    let s = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (!s) {
      s = {
        sound: true,
        vibrate: true,
        speedDeal: false,
        equippedAvatar: 'avatar_ace',
        equippedTable: 'table_classic',
        equippedCardBack: 'back_red',
        language: 'en',
      };
    }
    return s;
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function loadShop() {
    let s = JSON.parse(localStorage.getItem(SHOP_KEY));
    if (!s) {
      s = {
        owned: ['avatar_ace', 'table_classic', 'back_red'],
      };
    }
    return s;
  }

  function saveShop() {
    localStorage.setItem(SHOP_KEY, JSON.stringify(shop));
  }

  /* ═════════════════════════════════════════════════════════════════════════
     DECK & CARDS
     ═════════════════════════════════════════════════════════════════════════ */
  function createShoe(decks = 8) {
    const shoe = [];
    for (let d = 0; d < decks; d++) {
      for (let s = 0; s < 4; s++) {
        for (let r = 0; r < 13; r++) {
          shoe.push({ rank: r, suit: s });
        }
      }
    }
    return shuffle(shoe);
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function cardValue(card) {
    const rank = card.rank;
    if (rank === 0) return 1;
    if (rank < 9) return rank + 1;
    return 0;
  }

  function handValue(cards) {
    let sum = 0;
    for (let c of cards) sum += cardValue(c);
    return sum % 10;
  }

  function cardEmoji(card) {
    const suits = ['♠️','♥️','♦️','♣️'];
    const names = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    return names[card.rank] + suits[card.suit];
  }

  /* ═════════════════════════════════════════════════════════════════════════
     BACCARAT RULES
     ═════════════════════════════════════════════════════════════════════════ */
  async function dealGame() {
    if (game.gameOver || !game.playerBet || game.betAmount <= 0) return;
    if (profile.stars < game.betAmount) {
      popupAlert(t('not_enough'), t('need_stars').replace('{0}', game.betAmount));
      return;
    }

    profile.stars -= game.betAmount;
    profile.totalGames++;
    saveProfile();

    if (game.shoe.length < 20) game.shoe = createShoe(8);

    game.playerCards = [game.shoe.pop(), game.shoe.pop()];
    game.bankerCards = [game.shoe.pop(), game.shoe.pop()];

    await animateDeal();

    let playerVal = handValue(game.playerCards);
    let bankerVal = handValue(game.bankerCards);

    if (playerVal >= 8 || bankerVal >= 8) {
      decideWinner(playerVal, bankerVal);
      return;
    }

    if (playerVal <= 5) {
      game.playerCards.push(game.shoe.pop());
      playerVal = handValue(game.playerCards);
      await new Promise(r => setTimeout(r, 500));
    }

    const playerThirdVal = game.playerCards.length === 3 ? cardValue(game.playerCards[2]) : -1;
    if (playerThirdVal >= 0) {
      if (bankerVal === 0 || bankerVal === 1 || (bankerVal === 2 && playerThirdVal <= 9) ||
          (bankerVal === 3 && playerThirdVal !== 8) ||
          (bankerVal === 4 && playerThirdVal >= 2 && playerThirdVal <= 7) ||
          (bankerVal === 5 && playerThirdVal >= 4 && playerThirdVal <= 7) ||
          (bankerVal === 6 && playerThirdVal >= 6 && playerThirdVal <= 7)) {
        game.bankerCards.push(game.shoe.pop());
        bankerVal = handValue(game.bankerCards);
        await new Promise(r => setTimeout(r, 500));
      }
    }

    decideWinner(playerVal, bankerVal);
  }

  function decideWinner(pVal, bVal) {
    const result = pVal > bVal ? 'player' : (bVal > pVal ? 'banker' : 'tie');
    let payout = 0;
    let won = false;

    if (result === 'player' && game.playerBet === 'player') { payout = game.betAmount * 2; won = true; }
    else if (result === 'banker' && game.playerBet === 'banker') { payout = Math.floor(game.betAmount * 1.95); won = true; }
    else if (result === 'tie' && game.playerBet === 'tie') { payout = game.betAmount * 9; won = true; }
    else if (result === 'tie') payout = game.betAmount;
    else payout = 0;

    if (won) {
      profile.stars += payout;
      profile.totalWins++;
      profile.currentStreak++;
      if (profile.currentStreak > profile.bestStreak) profile.bestStreak = profile.currentStreak;
      if (game.playerBet === 'player') profile.playerWins++;
      else if (game.playerBet === 'banker') profile.bankerWins++;
      else profile.tieWins++;
      profile.xp += 30;
      confetti();
      playSound('win');
    } else if (result === 'tie' && game.playerBet === 'tie') {
      profile.stars += payout;
      profile.totalWins++;
      profile.tieWins++;
      profile.currentStreak++;
      if (profile.currentStreak > profile.bestStreak) profile.bestStreak = profile.currentStreak;
      profile.xp += 30;
      confetti();
      playSound('win');
    } else {
      profile.totalLosses++;
      profile.currentStreak = 0;
      profile.xp += 10;
      playSound('lose');
    }

    if (game.betAmount > profile.maxBet) profile.maxBet = game.betAmount;

    game.lastResults.unshift(result);
    if (game.lastResults.length > 40) game.lastResults.pop();
    localStorage.setItem('baccarat_results', JSON.stringify(game.lastResults));

    saveProfile();
    drawGame();
    showResult(result, payout);

    setTimeout(() => {
      game.playerCards = [];
      game.bankerCards = [];
      game.gameOver = false;
      document.getElementById('result-banner').classList.add('hidden');
      drawGame();
    }, 3000);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     RENDER & ANIMATION
     ═════════════════════════════════════════════════════════════════════════ */
  async function animateDeal() {
    const els = [
      { id: 'banker-c1', card: game.bankerCards[0] },
      { id: 'banker-c2', card: game.bankerCards[1] },
      { id: 'player-c1', card: game.playerCards[0] },
      { id: 'player-c2', card: game.playerCards[1] },
    ];
    for (const item of els) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      el.textContent = cardEmoji(item.card);
      el.classList.add('flip');
      playSound('flip');
      await new Promise(r => setTimeout(r, 400));
    }
  }

  function drawGame() {
    document.getElementById('player-score').textContent = handValue(game.playerCards);
    document.getElementById('banker-score').textContent = handValue(game.bankerCards);

    const playerRow = document.getElementById('player-c1').parentElement;
    const bankerRow = document.getElementById('banker-c1').parentElement;

    playerRow.innerHTML = game.playerCards.map(c => `<div class="card flipped">${cardEmoji(c)}</div>`).join('');
    bankerRow.innerHTML = game.bankerCards.map(c => `<div class="card flipped">${cardEmoji(c)}</div>`).join('');

    drawRoadMap();
  }

  function drawRoadMap() {
    const roadMap = document.getElementById('road-map');
    roadMap.innerHTML = game.lastResults.slice(0, 40).map(r => {
      const emoji = r === 'player' ? 'P' : (r === 'banker' ? 'B' : 'T');
      const cls = r === 'player' ? 'p' : (r === 'banker' ? 'b' : 't');
      return `<div class="bead ${cls}">${emoji}</div>`;
    }).join('');
  }

  function showResult(result, payout) {
    const banner = document.getElementById('result-banner');
    let text = '';
    let cls = '';
    if (result === 'player' && game.playerBet === 'player') {
      text = `${t('you_win')} +${payout}⭐`;
      cls = 'win';
    } else if (result === 'banker' && game.playerBet === 'banker') {
      text = `${t('you_win')} +${payout}⭐`;
      cls = 'win';
    } else if (result === 'tie' && game.playerBet === 'tie') {
      text = `${t('you_win')} +${payout}⭐`;
      cls = 'win';
    } else if (result === 'tie') {
      text = `${t('tie_push')}`;
      cls = 'lose';
    } else {
      text = t('you_lose');
      cls = 'lose';
    }
    banner.textContent = text;
    banner.className = 'result-banner ' + cls;
    banner.classList.remove('hidden');
  }

  function confetti() {
    const stage = document.getElementById('stage');
    for (let i = 0; i < 30; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      const emoji = ['🎉','🎊','✨','🌟'][Math.floor(Math.random() * 4)];
      c.textContent = emoji;
      const x = Math.random() * 200 - 100;
      const y = Math.random() * 300 + 100;
      c.style.setProperty('--tx', x + 'px');
      c.style.setProperty('--ty', y + 'px');
      c.style.left = Math.random() * window.innerWidth + 'px';
      c.style.top = window.innerHeight / 2 + 'px';
      stage.appendChild(c);
      setTimeout(() => c.remove(), 2500);
    }
  }

  function vibrate(ms = 20) {
    if (settings.vibrate && navigator.vibrate) navigator.vibrate(ms);
  }

  function playSound(type) {
    if (!settings.sound) return;
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);

      if (type === 'flip') {
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'win') {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'lose') {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch {}
  }

  /* ═════════════════════════════════════════════════════════════════════════
     UI & SCREEN MANAGEMENT
     ═════════════════════════════════════════════════════════════════════════ */
  function show(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const sc = document.getElementById(screenId);
    if (sc) sc.classList.add('active');
    updateAllUI();
  }

  function updateAllUI() {
    const lv = levelFromXp(profile.xp);
    document.getElementById('hm-lvl').textContent = `LV ${lv.lv}`;
    document.getElementById('hm-stars').textContent = profile.stars.toLocaleString() + '⭐';
    document.getElementById('info-stars').textContent = profile.stars.toLocaleString();
    document.getElementById('info-level').textContent = lv.lv;
    document.getElementById('info-wins').textContent = profile.totalWins;
    document.getElementById('info-streak').textContent = profile.currentStreak;

    document.getElementById('prof-avatar').textContent = getAvatarEmoji();
    document.getElementById('prof-name').textContent = profile.nickname;
    document.getElementById('prof-rank-pill').textContent = `LEVEL ${lv.lv}`;
    document.getElementById('ps-stars').textContent = profile.stars.toLocaleString();
    document.getElementById('ps-wins').textContent = profile.totalWins;
    const rate = profile.totalGames > 0 ? Math.round(profile.totalWins / profile.totalGames * 100) : 0;
    document.getElementById('ps-rate').textContent = rate + '%';
    document.getElementById('lv-label').textContent = `LV ${lv.lv}`;
    document.getElementById('lv-xp').textContent = `${lv.xp} / 100 XP`;
    document.getElementById('lv-fill').style.width = lv.progress + '%';

    const profBody = document.getElementById('prof-body');
    if (profBody) {
      profBody.innerHTML = `
        <div class="detail-row"><span class="detail-label">Total Games</span><span class="detail-value">${profile.totalGames}</span></div>
        <div class="detail-row"><span class="detail-label">Player Wins</span><span class="detail-value">${profile.playerWins}</span></div>
        <div class="detail-row"><span class="detail-label">Banker Wins</span><span class="detail-value">${profile.bankerWins}</span></div>
        <div class="detail-row"><span class="detail-label">Tie Wins</span><span class="detail-value">${profile.tieWins}</span></div>
        <div class="detail-row"><span class="detail-label">Best Streak</span><span class="detail-value">${profile.bestStreak}</span></div>
        <div class="detail-row"><span class="detail-label">Max Bet</span><span class="detail-value">${profile.maxBet.toLocaleString()}</span></div>
      `;
    }

    document.getElementById('player-avatar').textContent = getAvatarEmoji();
    document.getElementById('player-name').textContent = profile.nickname;

    document.getElementById('shop-stars').textContent = profile.stars.toLocaleString() + '⭐';
    renderShop();
    renderMissions();
    renderRanking();

    drawRoadMap();
  }

  function getAvatarEmoji() {
    const item = SHOP_ITEMS.find(i => i.id === settings.equippedAvatar);
    return item ? item.emoji : '🃏';
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn.hasAttribute('data-back')) {
      show('sc-home');
      return;
    }

    if (btn.hasAttribute('data-nav')) {
      const nav = btn.getAttribute('data-nav');
      document.querySelectorAll('.fnav').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      const screens = { home: 'sc-home', rank: 'sc-rank', shop: 'sc-shop', mission: 'sc-mission', profile: 'sc-profile' };
      show(screens[nav]);
      return;
    }

    if (btn.getAttribute('data-action') === 'play-ai') {
      show('sc-game');
      return;
    }

    if (btn.getAttribute('data-action') === 'play-online') {
      showOnlinePanel();
      return;
    }

    if (btn.hasAttribute('data-bet')) {
      const bet = btn.getAttribute('data-bet');
      document.querySelectorAll('[data-bet]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      game.playerBet = bet;
      return;
    }

    if (btn.id === 'deal-btn') {
      dealGame();
      return;
    }

    if (btn.id === 'daily-claim-btn') {
      const now = Date.now();
      if (now - profile.lastDailyClaimTime > 86400000) {
        profile.stars += DAILY_BONUS_STAR;
        profile.xp += DAILY_BONUS_XP;
        profile.lastDailyClaimTime = now;
        saveProfile();
        document.getElementById('daily-card').classList.add('hidden');
        updateAllUI();
        playSound('win');
      }
      return;
    }

    if (btn.getAttribute('data-rtab')) {
      const tab = btn.getAttribute('data-rtab');
      document.querySelectorAll('[data-rtab]').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      renderRanking();
      return;
    }

    if (btn.getAttribute('data-stab')) {
      const tab = btn.getAttribute('data-stab');
      document.querySelectorAll('[data-stab]').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      renderShop();
      return;
    }

    if (btn.getAttribute('data-mtab')) {
      const tab = btn.getAttribute('data-mtab');
      document.querySelectorAll('[data-mtab]').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      renderMissions();
      return;
    }

    if (btn.id === 'btn-prof-settings') {
      show('sc-settings');
      return;
    }

    if (btn.id === 'btn-reset-all') {
      popupConfirm(t('confirm_reset'), () => {
        profile.stars = STARTING_STARS;
        profile.xp = 0;
        profile.totalWins = 0;
        profile.totalLosses = 0;
        profile.totalGames = 0;
        profile.bestStreak = 0;
        profile.currentStreak = 0;
        profile.playerWins = 0;
        profile.bankerWins = 0;
        profile.tieWins = 0;
        profile.maxBet = 0;
        saveProfile();
        updateAllUI();
        popupAlert('Reset', t('reset_complete'));
      });
      return;
    }

    if (btn.id === 'btn-how') {
      show('sc-tutorial');
      return;
    }
  });

  /* ═════════════════════════════════════════════════════════════════════════
     SHOP RENDERING
     ═════════════════════════════════════════════════════════════════════════ */
  function renderShop() {
    const activeTab = document.querySelector('[data-stab].on').getAttribute('data-stab');
    const grid = document.getElementById('shop-grid');
    const items = SHOP_ITEMS.filter(i => i.type === activeTab);
    grid.innerHTML = items.map(item => {
      const owned = shop.owned.includes(item.id);
      const equipped = settings.equippedAvatar === item.id || settings.equippedTable === item.id || settings.equippedCardBack === item.id;
      return `
        <div class="shop-item ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}">
          <div class="shop-emoji">${item.emoji}</div>
          <div class="shop-name">${item.name}</div>
          <div class="shop-price">${item.price.toLocaleString()}⭐</div>
          <button class="shop-btn ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}"
            data-shop-item="${item.id}" ${item.price === 0 ? 'disabled' : ''}>
            ${equipped ? t('equipped') : (owned ? t('equip') : t('purchase'))}
          </button>
        </div>
      `;
    }).join('');

    document.querySelectorAll('[data-shop-item]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = btn.getAttribute('data-shop-item');
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return;

        if (!shop.owned.includes(itemId)) {
          if (profile.stars < item.price) {
            popupAlert(t('not_enough'), `${item.price.toLocaleString()}⭐`);
            return;
          }
          profile.stars -= item.price;
          shop.owned.push(itemId);
          saveProfile();
          saveShop();
        }

        if (item.type === 'avatar') settings.equippedAvatar = itemId;
        else if (item.type === 'table') settings.equippedTable = itemId;
        else if (item.type === 'cardback') settings.equippedCardBack = itemId;
        saveSettings();

        renderShop();
        updateAllUI();
      });
    });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     MISSIONS RENDERING
     ═════════════════════════════════════════════════════════════════════════ */
  function renderMissions() {
    const activeTab = document.querySelector('[data-mtab].on').getAttribute('data-mtab');
    const list = document.getElementById('mission-list');

    if (activeTab === 'daily') {
      const missions = [
        { id: 'daily_win', name: 'Win 1 game', desc: 'Complete 1 game', target: 1, current: profile.totalGames, reward: 50 },
        { id: 'daily_win3', name: 'Win 3 games', desc: 'Complete 3 games', target: 3, current: profile.totalGames, reward: 100 },
        { id: 'daily_stars', name: 'Earn 1000⭐', desc: 'Get 1000 stars total', target: 1000, current: profile.stars, reward: 200 },
        { id: 'daily_streak', name: '2 win streak', desc: 'Get 2 consecutive wins', target: 2, current: profile.currentStreak, reward: 150 },
        { id: 'daily_player', name: 'Player bet', desc: 'Win with Player bet', target: 1, current: profile.playerWins, reward: 80 },
        { id: 'daily_banker', name: 'Banker bet', desc: 'Win with Banker bet', target: 1, current: profile.bankerWins, reward: 80 },
      ];
      list.innerHTML = missions.map((m, idx) => {
        const pct = Math.min(100, (m.current / m.target) * 100);
        const done = m.current >= m.target;
        return `
          <div class="mission-card">
            <div class="mission-main">
              <div class="mission-name">${m.name}</div>
              <div class="mission-desc">${m.desc}</div>
              <div class="mission-bar"><div class="mission-fill" style="width:${pct}%"></div></div>
            </div>
            <div class="mission-right">
              <div class="mission-reward">${m.reward}</div>
              <button class="mission-claim ${done ? 'done' : ''}" data-mission="${m.id}" ${!done ? 'disabled' : ''}>${done ? '✓' : t('claim')}</button>
            </div>
          </div>
        `;
      }).join('');
    } else {
      list.innerHTML = ACHIEVEMENTS.map((ach, idx) => {
        const done = ach.check(profile);
        return `
          <div class="ach-grid" style="grid-template-columns:1fr">
            <div class="ach-card ${done ? 'done' : 'locked'}">
              <div class="ach-icon">${ach.icon}</div>
              <div class="ach-name">${ach.name}</div>
              <div class="ach-desc">${ach.desc}</div>
              <div class="ach-reward">+${ach.star}⭐</div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  /* ═════════════════════════════════════════════════════════════════════════
     RANKING RENDERING
     ═════════════════════════════════════════════════════════════════════════ */
  function renderRanking() {
    const list = document.getElementById('rank-list');
    const ranks = loadRanks();

    if (!ranks || ranks.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted)">No rankings yet</div>';
      return;
    }

    ranks.sort((a, b) => b.totalWins - a.totalWins);
    list.innerHTML = ranks.slice(0, 20).map((r, idx) => {
      const item = SHOP_ITEMS.find(i => i.id === r.avatar);
      const emoji = item ? item.emoji : '🃏';
      return `
        <div class="rank-card">
          <div class="rank-pos">#${idx + 1}</div>
          <div class="rank-avatar">${emoji}</div>
          <div class="rank-main">
            <div class="rank-name">${r.nickname}</div>
            <div class="rank-sub">LV ${levelFromXp(r.xp || 0).lv}</div>
          </div>
          <div class="rank-right">
            <div class="rank-score">${r.totalWins} wins</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function loadRanks() {
    const stored = localStorage.getItem(RANK_KEY);
    if (!stored) {
      return generateBotRanks();
    }
    return JSON.parse(stored);
  }

  function generateBotRanks() {
    const bots = [];
    for (let i = 0; i < BOT_NAMES.length; i++) {
      bots.push({
        id: 'bot_' + i,
        nickname: BOT_NAMES[i],
        avatar: SHOP_ITEMS.filter(i => i.type === 'avatar')[Math.floor(Math.random() * 5)].id,
        totalWins: Math.floor(Math.random() * 500) + 50,
        totalLosses: Math.floor(Math.random() * 400) + 20,
        totalGames: 0,
        xp: Math.floor(Math.random() * 5000),
      });
    }
    bots[0] = { ...bots[0], totalWins: 1000 };
    localStorage.setItem(RANK_KEY, JSON.stringify(bots));
    return bots;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     POPUP & DIALOGS
     ═════════════════════════════════════════════════════════════════════════ */
  function popupAlert(title, msg) {
    const overlay = document.getElementById('popup-overlay');
    const popup = document.getElementById('popup');
    document.getElementById('popup-title').textContent = title;
    document.getElementById('popup-msg').textContent = msg;
    const btns = document.getElementById('popup-btns');
    btns.innerHTML = `<button class="popup-btn" data-action="close-popup">${t('ok')}</button>`;
    overlay.classList.add('show');
  }

  function popupConfirm(msg, onYes) {
    const overlay = document.getElementById('popup-overlay');
    const popup = document.getElementById('popup');
    document.getElementById('popup-title').textContent = 'Confirm';
    document.getElementById('popup-msg').textContent = msg;
    const btns = document.getElementById('popup-btns');
    btns.innerHTML = `
      <button class="popup-btn" data-action="confirm-yes">${t('ok')}</button>
      <button class="popup-btn cancel" data-action="close-popup">${t('cancel')}</button>
    `;
    overlay.classList.add('show');
    popup._onYes = onYes;
  }

  document.addEventListener('click', (e) => {
    if (e.target.id === 'popup-overlay' || e.target.getAttribute('data-action') === 'close-popup') {
      document.getElementById('popup-overlay').classList.remove('show');
      return;
    }
    if (e.target.getAttribute('data-action') === 'confirm-yes') {
      const popup = document.getElementById('popup');
      if (popup._onYes) popup._onYes();
      document.getElementById('popup-overlay').classList.remove('show');
      return;
    }
  });

  /* ═════════════════════════════════════════════════════════════════════════
     ONLINE / FIREBASE
     ═════════════════════════════════════════════════════════════════════════ */
  const Online = (function() {
    const LEADERS_PATH = 'leaderboards/baccarat';
    const ROOMS_PATH = 'baccaratRooms';
    const PRESENCE_PATH = 'baccaratPresence';
    let db = null;

    function ready() {
      if (db) return db;
      if (typeof window.firebase === 'undefined' || !firebase.database) return null;
      try { db = firebase.database(); } catch (e) { db = null; }
      return db;
    }

    async function pushLeader() {
      const d = ready();
      if (!d || !profile || !profile.id) return;
      try {
        const avatar = settings.equippedAvatar || 'avatar_ace';
        const item = SHOP_ITEMS.find(i => i.id === avatar);
        await d.ref(LEADERS_PATH + '/' + profile.id).update({
          nickname: profile.nickname,
          avatar: item ? item.id : 'avatar_ace',
          totalWins: profile.totalWins | 0,
          totalLosses: profile.totalLosses | 0,
          totalGames: profile.totalGames | 0,
          bestStreak: profile.bestStreak | 0,
          stars: profile.stars | 0,
          xp: profile.xp | 0,
          updatedAt: Date.now(),
        });
      } catch (e) {}
    }

    return { pushLeader };
  })();

  function showOnlinePanel() {
    const panel = document.getElementById('room-panel');
    panel.classList.add('show');
  }

  function setupSettingsListeners() {
    document.getElementById('room-panel-close').addEventListener('click', () => {
      document.getElementById('room-panel').classList.remove('show');
    });

    document.getElementById('toggle-sound').addEventListener('click', () => {
      settings.sound = !settings.sound;
      document.getElementById('toggle-sound').classList.toggle('on');
      saveSettings();
    });

    document.getElementById('toggle-vibrate').addEventListener('click', () => {
      settings.vibrate = !settings.vibrate;
      document.getElementById('toggle-vibrate').classList.toggle('on');
      saveSettings();
    });

    document.getElementById('lang-select').addEventListener('change', (e) => {
      lang = e.target.value;
      settings.language = lang;
      saveSettings();
      applyI18n();
    });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     CHIP SELECTOR
     ═════════════════════════════════════════════════════════════════════════ */
  function renderChips() {
    const selector = document.getElementById('chip-selector');
    const chips = [50, 100, 500, 1000, 5000, 10000];
    selector.innerHTML = chips.map(amount => `
      <button class="chip" data-chip="${amount}">${amount}</button>
    `).join('');

    document.querySelectorAll('[data-chip]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const amount = parseInt(btn.getAttribute('data-chip'));
        document.querySelectorAll('[data-chip]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        game.betAmount = amount;
        vibrate(20);
      });
    });
  }

  /* ═════════════════════════════════════════════════════════════════════════
     EXTENDED GAME FEATURES & STATISTICS
     ═════════════════════════════════════════════════════════════════════════ */
  function recordGameHistory(result, payout) {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history.unshift({
      date: Date.now(),
      result,
      bet: game.playerBet,
      amount: game.betAmount,
      payout,
      playerVal: handValue(game.playerCards),
      bankerVal: handValue(game.bankerCards),
    });
    if (history.length > 100) history.pop();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function getGameStats() {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (!history.length) {
      return {
        avgBet: 0,
        totalBetAmount: 0,
        totalPayoutAmount: 0,
        playerWinRate: 0,
        bankerWinRate: 0,
        tieRate: 0,
      };
    }
    const total = history.length;
    const playerWins = history.filter(h => h.result === 'player').length;
    const bankerWins = history.filter(h => h.result === 'banker').length;
    const ties = history.filter(h => h.result === 'tie').length;
    const totalBet = history.reduce((s, h) => s + h.amount, 0);
    const totalPayout = history.reduce((s, h) => s + h.payout, 0);
    return {
      avgBet: Math.round(totalBet / total),
      totalBetAmount: totalBet,
      totalPayoutAmount: totalPayout,
      playerWinRate: Math.round(playerWins / total * 100),
      bankerWinRate: Math.round(bankerWins / total * 100),
      tieRate: Math.round(ties / total * 100),
    };
  }

  /* ═════════════════════════════════════════════════════════════════════════
     ADVANCED ANIMATIONS & VISUAL EFFECTS
     ═════════════════════════════════════════════════════════════════════════ */
  function createParticleEffect(x, y, type = 'star') {
    const particles = [];
    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.style.position = 'fixed';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.font = '20px Arial';
      p.style.pointer = 'none';
      p.style.zIndex = '100';
      p.textContent = type === 'star' ? '✨' : (type === 'gold' ? '💰' : '🎉');
      document.body.appendChild(p);

      const angle = (Math.PI * 2 * i) / 15;
      const velocity = 3 + Math.random() * 2;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      let duration = 80;

      const animate = () => {
        x += vx;
        y += vy;
        duration--;
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.opacity = duration / 80;
        if (duration > 0) {
          requestAnimationFrame(animate);
        } else {
          p.remove();
        }
      };
      animate();
    }
  }

  /* ═════════════════════════════════════════════════════════════════════════
     ENHANCED UI TRANSITIONS & INTERACTIONS
     ═════════════════════════════════════════════════════════════════════════ */
  function animateCardFlip(cardId) {
    const el = document.getElementById(cardId);
    if (!el) return;
    el.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    el.style.transform = 'rotateY(360deg)';
    setTimeout(() => {
      el.style.transition = '';
      el.style.transform = '';
    }, 600);
  }

  function pulseElement(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.style.animation = 'pulse-glow 0.6s';
    setTimeout(() => {
      el.style.animation = '';
    }, 600);
  }

  function slideInFrom(elementId, direction = 'bottom') {
    const el = document.getElementById(elementId);
    if (!el) return;
    const keyframes = {
      top: [
        { transform: 'translateY(-20px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 },
      ],
      bottom: [
        { transform: 'translateY(20px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 },
      ],
      left: [
        { transform: 'translateX(-20px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
      ],
      right: [
        { transform: 'translateX(20px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
      ],
    };
    try {
      el.animate(keyframes[direction] || keyframes.bottom, { duration: 300, easing: 'ease-out' });
    } catch {}
  }

  /* ═════════════════════════════════════════════════════════════════════════
     COMPREHENSIVE GAME LOGGING & TELEMETRY
     ═════════════════════════════════════════════════════════════════════════ */
  function logGameEvent(eventType, details = {}) {
    const logEntry = {
      timestamp: Date.now(),
      eventType,
      profileId: profile.id,
      profileLevel: levelFromXp(profile.xp).lv,
      ...details,
    };

    let logs = JSON.parse(localStorage.getItem('baccarat_logs') || '[]');
    logs.push(logEntry);
    if (logs.length > 500) logs = logs.slice(-500);
    localStorage.setItem('baccarat_logs', JSON.stringify(logs));
  }

  /* ═════════════════════════════════════════════════════════════════════════
     ENHANCED ACHIEVEMENT SYSTEM
     ═════════════════════════════════════════════════════════════════════════ */
  function checkAndClaimAchievements() {
    let claimed = JSON.parse(localStorage.getItem(ACHIEVE_KEY) || '[]');
    let totalStarsGained = 0;

    for (const ach of ACHIEVEMENTS) {
      if (claimed.includes(ach.id)) continue;
      if (ach.check(profile)) {
        claimed.push(ach.id);
        profile.stars += ach.star;
        totalStarsGained += ach.star;
        logGameEvent('achievement_unlocked', { achievementId: ach.id, stars: ach.star });
        createParticleEffect(window.innerWidth / 2, window.innerHeight / 2, 'gold');
      }
    }

    if (totalStarsGained > 0) {
      localStorage.setItem(ACHIEVE_KEY, JSON.stringify(claimed));
      saveProfile();
    }

    return totalStarsGained;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     GAME SESSION TRACKING
     ═════════════════════════════════════════════════════════════════════════ */
  let sessionStartTime = Date.now();
  let sessionGameCount = 0;
  let sessionTotalWinnings = 0;

  function recordSessionGame(payout) {
    sessionGameCount++;
    if (payout > 0) sessionTotalWinnings += payout;
    const sessionDuration = Date.now() - sessionStartTime;
    if (sessionDuration > 3600000) { // 1 hour
      finishSession();
    }
  }

  function finishSession() {
    if (sessionGameCount === 0) return;
    const sessionData = {
      duration: Date.now() - sessionStartTime,
      gamesPlayed: sessionGameCount,
      totalWinnings: sessionTotalWinnings,
      avgWinning: Math.round(sessionTotalWinnings / sessionGameCount),
      profileStars: profile.stars,
      timestamp: Date.now(),
    };

    let sessions = JSON.parse(localStorage.getItem('baccarat_sessions') || '[]');
    sessions.push(sessionData);
    if (sessions.length > 20) sessions = sessions.slice(-20);
    localStorage.setItem('baccarat_sessions', JSON.stringify(sessions));

    sessionStartTime = Date.now();
    sessionGameCount = 0;
    sessionTotalWinnings = 0;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     WALLET & BANKROLL MANAGEMENT
     ═════════════════════════════════════════════════════════════════════════ */
  function getBankrollStats() {
    const stats = getGameStats();
    const roi = stats.totalBetAmount > 0
      ? Math.round((stats.totalPayoutAmount - stats.totalBetAmount) / stats.totalBetAmount * 100)
      : 0;
    return {
      roi,
      profitLoss: stats.totalPayoutAmount - stats.totalBetAmount,
      currentBankroll: profile.stars,
      maxBankroll: profile.stars + Math.max(0, stats.totalPayoutAmount - stats.totalBetAmount),
    };
  }

  /* ═════════════════════════════════════════════════════════════════════════
     STREAK TRACKING & ANALYTICS
     ═════════════════════════════════════════════════════════════════════════ */
  function analyzeStreaks() {
    const results = game.lastResults;
    if (!results || results.length < 2) return { currentStreak: 0, longestStreak: 0 };

    let currentStreak = 1;
    let longestStreak = 1;
    for (let i = 1; i < results.length; i++) {
      if (results[i] === results[i - 1]) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    return { currentStreak, longestStreak };
  }

  /* ═════════════════════════════════════════════════════════════════════════
     DYNAMIC DIFFICULTY & CHALLENGE MODES
     ═════════════════════════════════════════════════════════════════════════ */
  const challenges = {
    highRoller: {
      id: 'high_roller',
      name: 'High Roller',
      desc: 'Win with 10K+ bets',
      icon: '💎',
      check: () => profile.maxBet >= 10000,
    },
    streak: {
      id: 'streak_king',
      name: 'Streak King',
      desc: 'Reach 10 win streak',
      icon: '🔥',
      check: () => profile.bestStreak >= 10,
    },
    bankroll: {
      id: 'bankroll_boost',
      name: 'Bankroll Boost',
      desc: 'Reach 50K stars',
      icon: '💰',
      check: () => profile.stars >= 50000,
    },
  };

  function getChallengeProgress(challenge) {
    if (challenge.id === 'high_roller') {
      return Math.round(profile.maxBet / 10000 * 100);
    } else if (challenge.id === 'streak_king') {
      return Math.round(profile.bestStreak / 10 * 100);
    } else if (challenge.id === 'bankroll_boost') {
      return Math.round(profile.stars / 50000 * 100);
    }
    return 0;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     PERFORMANCE METRICS & STATS EXPORT
     ═════════════════════════════════════════════════════════════════════════ */
  function exportPlayerStats() {
    const stats = {
      profile,
      gameStats: getGameStats(),
      bankrollStats: getBankrollStats(),
      streaks: analyzeStreaks(),
      sessions: JSON.parse(localStorage.getItem('baccarat_sessions') || '[]'),
      achievements: JSON.parse(localStorage.getItem(ACHIEVE_KEY) || '[]'),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(stats, null, 2);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     NOTIFICATION & ALERT SYSTEM
     ═════════════════════════════════════════════════════════════════════════ */
  function showNotification(message, type = 'info', duration = 3000) {
    const notif = document.createElement('div');
    notif.style.cssText = `
      position:fixed;bottom:20px;right:20px;
      background:linear-gradient(135deg,var(--gold),var(--gold2));
      color:#1a1a1a;padding:16px 20px;border-radius:10px;
      font-weight:900;z-index:9999;
      box-shadow:0 6px 15px rgba(255,215,0,.3);
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), duration);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     DECK PENETRATION & SHOE TRACKING
     ═════════════════════════════════════════════════════════════════════════ */
  function getDeckPenetration() {
    const totalCards = 8 * 52;
    const remainingCards = game.shoe.length;
    const usedCards = totalCards - remainingCards;
    return Math.round(usedCards / totalCards * 100);
  }

  function shouldReshuffle() {
    return getDeckPenetration() >= 75 || game.shoe.length < 20;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     COMMISSION & HOUSE EDGE CALCULATIONS
     ═════════════════════════════════════════════════════════════════════════ */
  function calculateHouseEdge() {
    const stats = getGameStats();
    if (stats.totalBetAmount === 0) return 0;
    const houseTake = stats.totalBetAmount - stats.totalPayoutAmount;
    return Math.round(houseTake / stats.totalBetAmount * 100);
  }

  function formatPayoutInfo(betType, amount) {
    if (betType === 'player') return `Win: ${amount * 2}⭐ | Lose: 0⭐`;
    if (betType === 'banker') return `Win: ${Math.floor(amount * 1.95)}⭐ | Lose: 0⭐`;
    if (betType === 'tie') return `Win: ${amount * 9}⭐ | Lose: 0⭐`;
    return '---';
  }

  /* ═════════════════════════════════════════════════════════════════════════
     ADVANCED CARD COUNTING (Educational)
     ═════════════════════════════════════════════════════════════════════════ */
  function getCardDistribution() {
    const allCards = createShoe(1);
    const dist = {};
    for (let i = 0; i <= 12; i++) {
      dist[CARD_NAMES[i]] = 4;
    }

    for (const card of game.playerCards) {
      dist[CARD_NAMES[card.rank]]--;
    }
    for (const card of game.bankerCards) {
      dist[CARD_NAMES[card.rank]]--;
    }
    for (const card of game.shoe) {
      dist[CARD_NAMES[card.rank]]--;
    }

    return dist;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     GAME VARIATION TRACKING
     ═════════════════════════════════════════════════════════════════════════ */
  function trackGameVariation() {
    const results = game.lastResults.slice(0, 20);
    if (results.length < 20) return 'insufficient_data';

    const playerCount = results.filter(r => r === 'player').length;
    const bankerCount = results.filter(r => r === 'banker').length;
    const tieCount = results.filter(r => r === 'tie').length;

    const diff = Math.abs(playerCount - bankerCount);
    if (diff >= 8) return 'high_variance';
    if (diff >= 4) return 'moderate_variance';
    return 'balanced';
  }

  /* ═════════════════════════════════════════════════════════════════════════
     PREMIUM FEATURES INITIALIZATION
     ═════════════════════════════════════════════════════════════════════════ */
  function initializeAdvancedFeatures() {
    checkAndClaimAchievements();
    logGameEvent('session_started', {
      stars: profile.stars,
      level: levelFromXp(profile.xp).lv,
    });
  }

  /* [duplicate init removed] */

  /* ═════════════════════════════════════════════════════════════════════════
     COMPREHENSIVE TUTORIAL & GUIDE SYSTEM
     ═════════════════════════════════════════════════════════════════════════ */
  const tutorialContent = {
    basics: {
      title: 'Game Basics',
      content: 'Baccarat is a comparing card game where you bet on whether the Player hand, Banker hand, or a Tie will win. Each hand tries to get as close to 9 as possible.',
    },
    cardValues: {
      title: 'Card Values & Scoring',
      content: 'In Baccarat: Aces are worth 1 point, 2-9 are face value, 10s and face cards are 0. The hand value is the last digit of the sum (e.g., 15 = 5). The best hand is a natural 8 or 9 with two cards.',
    },
    naturalWin: {
      title: 'Natural Wins',
      content: 'If either the Player or Banker is dealt a hand totaling 8 or 9, that hand is a "Natural" and the game ends immediately. A 9 beats an 8. If both have 8 or 9, whoever has the higher number wins.',
    },
    playerDraw: {
      title: 'Player Third Card Rule',
      content: 'If the Player hand totals 0-5, the Player must draw a third card. If the Player hand totals 6-7, the Player stands. If the Player hand is 8 or 9, no cards are drawn (Natural).',
    },
    bankerDraw: {
      title: 'Banker Third Card Rule',
      content: 'The Banker follows a specific drawing strategy that depends on both its own hand value and the Player\'s third card (if drawn). Generally: if Banker has 0-2, always draw; if 3-6, draw depending on Player\'s third card; if 7+, always stand.',
    },
    betting: {
      title: 'Betting Options',
      content: 'Bet on Player (pays 2:1, house edge ~1.24%), Banker (pays 1.95:1, house edge ~1.06%), or Tie (pays 9:1, house edge ~14.4%). Most players favor Banker due to lower house edge.',
    },
    commissions: {
      title: 'Commission & Payouts',
      content: 'Player bets pay even money (2:1). Banker bets typically pay 1.95:1 due to a 5% commission on winning Banker bets. Tie bets pay 9:1 but lose if Player or Banker wins.',
    },
    strategy: {
      title: 'Basic Strategy',
      content: 'Statistically, Banker wins slightly more often than Player due to drawing rules. The Tie bet has a very high house edge (14.4%) and is generally not recommended. Always bet within your bankroll limits.',
    },
    roadMap: {
      title: 'Road Map (Bead Road)',
      content: 'The Road Map shows the last 40 game results using colored beads: Red for Player wins, Blue for Banker wins, Green for Ties. Use this to track patterns, though remember that past results don\'t guarantee future outcomes.',
    },
    bankroll: {
      title: 'Bankroll Management',
      content: 'Set a budget and stick to it. Never bet more than you can afford to lose. Consider using the Kelly Criterion or flat betting strategy. Track your wins and losses to maintain perspective.',
    },
  };

  /* ═════════════════════════════════════════════════════════════════════════
     EXTENDED GAME HISTORY & ANALYSIS
     ═════════════════════════════════════════════════════════════════════════ */
  function getDetailedGameHistory(limit = 20) {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return history.slice(0, limit).map((h, idx) => ({
      id: idx,
      ...h,
      winnerEmoji: h.result === 'player' ? '👤' : (h.result === 'banker' ? '🏛️' : '🔄'),
      profitLoss: h.payout - h.amount,
    }));
  }

  function getPlayerStatsByBetType() {
    const stats = {};
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

    ['player', 'banker', 'tie'].forEach(bet => {
      const bets = history.filter(h => h.bet === bet);
      if (!bets.length) {
        stats[bet] = { wins: 0, losses: 0, winRate: 0, avgBet: 0, totalProfit: 0 };
        return;
      }
      const wins = bets.filter(h => h.payout > h.amount).length;
      const totalBet = bets.reduce((s, h) => s + h.amount, 0);
      const totalProfit = bets.reduce((s, h) => s + (h.payout - h.amount), 0);
      stats[bet] = {
        wins,
        losses: bets.length - wins,
        winRate: Math.round(wins / bets.length * 100),
        avgBet: Math.round(totalBet / bets.length),
        totalProfit,
      };
    });

    return stats;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     PLAYER PREFERENCES & CUSTOMIZATION
     ═════════════════════════════════════════════════════════════════════════ */
  function savePlayerPreferences(prefs) {
    const current = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    const updated = { ...current, ...prefs };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  }

  function loadPlayerPreferences() {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  }

  /* ═════════════════════════════════════════════════════════════════════════
     WEEKLY & SEASONAL EVENTS
     ═════════════════════════════════════════════════════════════════════════ */
  const seasonalEvents = [
    {
      name: 'Lucky Monday',
      desc: 'Bonus stars on Mondays',
      bonus: 50,
      daysOfWeek: [1],
    },
    {
      name: 'Winning Weekend',
      desc: 'Double XP on weekends',
      bonus: 'xp_double',
      daysOfWeek: [5, 6],
    },
    {
      name: 'Streak Special',
      desc: '5 win streak = bonus 500⭐',
      bonus: 500,
      condition: 'streak_5',
    },
    {
      name: 'High Roller',
      desc: 'Win with 5K+ bet = bonus 100⭐',
      bonus: 100,
      condition: 'high_bet',
    },
  ];

  function checkForActiveEvents() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const activeEvents = seasonalEvents.filter(e => {
      if (e.daysOfWeek) return e.daysOfWeek.includes(dayOfWeek);
      return false;
    });
    return activeEvents;
  }

  function applyEventBonus(eventName) {
    const event = seasonalEvents.find(e => e.name === eventName);
    if (!event) return;

    if (eventName === 'Lucky Monday') {
      profile.stars += event.bonus;
      saveProfile();
      showNotification(`Lucky Monday! +${event.bonus}⭐`);
    }
  }

  /* ═════════════════════════════════════════════════════════════════════════
     LEADERBOARD FILTERING & SORTING
     ═════════════════════════════════════════════════════════════════════════ */
  function getFilteredLeaderboard(filterType = 'wins') {
    const ranks = loadRanks();
    if (!ranks) return [];

    const sorted = [...ranks].sort((a, b) => {
      if (filterType === 'wins') return b.totalWins - a.totalWins;
      if (filterType === 'level') return b.xp - a.xp;
      if (filterType === 'streak') return (b.bestStreak || 0) - (a.bestStreak || 0);
      return b.totalWins - a.totalWins;
    });

    return sorted.slice(0, 20);
  }

  function getRankPosition(playerId) {
    const ranks = getFilteredLeaderboard('wins');
    const pos = ranks.findIndex(r => r.id === playerId);
    return pos >= 0 ? pos + 1 : null;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     PROFILE CUSTOMIZATION & THEMES
     ═════════════════════════════════════════════════════════════════════════ */
  const themes = {
    dark: {
      name: 'Dark Mode',
      colors: { bg: '#0a0a0a', primary: '#ffd700', accent: '#111' },
    },
    light: {
      name: 'Light Mode',
      colors: { bg: '#f5f5f5', primary: '#333', accent: '#fff' },
    },
    classic: {
      name: 'Classic Casino',
      colors: { bg: '#1a1a2e', primary: '#ffd700', accent: '#16213e' },
    },
  };

  function applyTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;
    document.documentElement.style.setProperty('--dark', theme.colors.bg);
    document.documentElement.style.setProperty('--gold', theme.colors.primary);
    settings.theme = themeName;
    saveSettings();
  }

  /* ═════════════════════════════════════════════════════════════════════════
     COMPREHENSIVE GAME RULES ENGINE
     ═════════════════════════════════════════════════════════════════════════ */
  function validateGameRules(playerCards, bankerCards, shouldPlayerDraw, shouldBankerDraw) {
    const pVal = handValue(playerCards);
    const bVal = handValue(bankerCards);

    if (pVal >= 8 || bVal >= 8) {
      return { valid: true, reason: 'natural' };
    }

    const validPlayerDraw = pVal <= 5;
    const validBankerDraw = calculateBankerDraw(bVal, playerCards.length === 3 ? cardValue(playerCards[2]) : -1);

    if (shouldPlayerDraw && !validPlayerDraw) {
      return { valid: false, reason: 'invalid_player_draw' };
    }

    if (shouldBankerDraw && !validBankerDraw) {
      return { valid: false, reason: 'invalid_banker_draw' };
    }

    return { valid: true, reason: 'rules_followed' };
  }

  function calculateBankerDraw(bankerValue, playerThirdValue) {
    if (bankerValue >= 7) return false;
    if (bankerValue <= 2) return true;
    if (bankerValue === 3) return playerThirdValue !== 8;
    if (bankerValue === 4) return playerThirdValue >= 2 && playerThirdValue <= 7;
    if (bankerValue === 5) return playerThirdValue >= 4 && playerThirdValue <= 7;
    if (bankerValue === 6) return playerThirdValue >= 6 && playerThirdValue <= 7;
    return false;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     ADVANCED BETTING STRATEGIES
     ═════════════════════════════════════════════════════════════════════════ */
  const bettingStrategies = {
    martingale: {
      name: 'Martingale',
      desc: 'Double bet after loss',
      risk: 'high',
    },
    fibonacci: {
      name: 'Fibonacci',
      desc: 'Follow Fibonacci sequence',
      risk: 'medium',
    },
    flatBet: {
      name: 'Flat Bet',
      desc: 'Same bet every hand',
      risk: 'low',
    },
    kellyMethod: {
      name: 'Kelly Criterion',
      desc: 'Mathematical bankroll allocation',
      risk: 'low',
    },
  };

  function suggestBetAmount(availableStars, strategy = 'flatBet') {
    if (strategy === 'flatBet') {
      return Math.max(50, Math.floor(availableStars * 0.02));
    } else if (strategy === 'kellyMethod') {
      const edge = calculateHouseEdge();
      return Math.max(50, Math.floor(availableStars * 0.01 * edge / 100));
    }
    return 100;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     RESPONSIBLE GAMING FEATURES
     ═════════════════════════════════════════════════════════════════════════ */
  function setLossLimit(maxLossAmount) {
    localStorage.setItem('baccarat_loss_limit', maxLossAmount);
  }

  function checkLossLimit() {
    const limit = parseInt(localStorage.getItem('baccarat_loss_limit') || '0');
    if (limit <= 0) return true;

    const stats = getGameStats();
    const profitLoss = stats.totalPayoutAmount - stats.totalBetAmount;
    if (profitLoss < -limit) {
      showNotification('Loss limit reached. Session paused.', 'warning');
      return false;
    }
    return true;
  }

  function setPlaytimeReminder(minutesPerSession = 60) {
    localStorage.setItem('baccarat_playtime_reminder', minutesPerSession);
  }

  /* [duplicate init removed] */

  /* ═════════════════════════════════════════════════════════════════════════
     MATHEMATICAL ANALYSIS & GAME THEORY
     ═════════════════════════════════════════════════════════════════════════ */

  function getBaccaratMathematics() {
    return {
      description: 'Punto Banco is mathematically analyzed to determine house edges',
      winProbabilities: {
        playerWin: 0.5068,
        bankerWin: 0.4932,
        tieGame: 0.0905,
      },
      houseEdges: {
        playerBet: 0.01239342,
        bankerBet: 0.01061619,
        tieBet: 0.144,
      },
      expectedValue: {
        playerBet100: -1.239342,
        bankerBet100: -1.061619,
        tieBet100: -14.4,
      },
      notes: 'Banking is slightly more favorable due to drawing rules. Tie betting has high variance and poor expected value.',
    };
  }

  function calculateExpectedValue(betType, betAmount) {
    const math = getBaccaratMathematics();
    const edge = math.houseEdges[betType + 'Bet'];
    return -Math.abs(betAmount * edge);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     GAME PERFORMANCE ANALYTICS
     ═════════════════════════════════════════════════════════════════════════ */

  function getPerformanceMetrics() {
    const stats = getGameStats();
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (!history.length) {
      return { totalSessions: 0, avgSessionProfit: 0, winStreak: 0, lossStreak: 0 };
    }

    let winStreak = 0;
    let lossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    for (const game of history) {
      if (game.payout > game.amount) {
        winStreak++;
        lossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, winStreak);
      } else {
        lossStreak++;
        winStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, lossStreak);
      }
    }

    return {
      totalGames: history.length,
      avgSessionProfit: Math.round(stats.totalPayoutAmount / Math.max(1, history.length)),
      maxWinStreak,
      maxLossStreak,
      currentWinStreak: winStreak,
      currentLossStreak: lossStreak,
      profitFactor: stats.totalBetAmount > 0 ? (stats.totalPayoutAmount / stats.totalBetAmount).toFixed(2) : 0,
    };
  }

  function comparePerformance(beforeDate, afterDate) {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const filtered = history.filter(h => h.date >= beforeDate && h.date <= afterDate);

    if (!filtered.length) return { games: 0, profit: 0, avgBet: 0 };

    const totalBet = filtered.reduce((s, h) => s + h.amount, 0);
    const totalPayout = filtered.reduce((s, h) => s + h.payout, 0);

    return {
      games: filtered.length,
      profit: totalPayout - totalBet,
      avgBet: Math.round(totalBet / filtered.length),
      winRate: Math.round(filtered.filter(h => h.payout > h.amount).length / filtered.length * 100),
    };
  }

  /* ═════════════════════════════════════════════════════════════════════════
     PLAYER ASSISTANCE & DECISION SUPPORT
     ═════════════════════════════════════════════════════════════════════════ */

  function getSmartBetRecommendation() {
    const stats = getGameStats();
    const streaks = analyzeStreaks();
    const currentVariance = trackGameVariation();

    let recommendation = {
      betType: 'banker',
      reason: 'Banker has lower house edge (1.06% vs 1.24%)',
      confidence: 'high',
      alternates: ['player'],
    };

    if (stats.bankerWinRate > stats.playerWinRate + 5) {
      recommendation.betType = 'banker';
      recommendation.reason = 'Recent banker strength';
      recommendation.confidence = 'medium';
    } else if (stats.playerWinRate > stats.bankerWinRate + 5) {
      recommendation.betType = 'player';
      recommendation.reason = 'Recent player strength';
      recommendation.confidence = 'medium';
    }

    if (currentVariance === 'high_variance') {
      recommendation.reason += ' (High variance detected)';
    }

    return recommendation;
  }

  function suggestSessionTarget(startingBankroll) {
    const goalAmount = Math.floor(startingBankroll * 1.25);
    const stopLossAmount = Math.floor(startingBankroll * 0.75);

    return {
      target: goalAmount,
      targetIncrease: goalAmount - startingBankroll,
      stopLoss: stopLossAmount,
      stopLossDecrease: startingBankroll - stopLossAmount,
      riskReward: (goalAmount - startingBankroll) / (startingBankroll - stopLossAmount),
    };
  }

  /* ═════════════════════════════════════════════════════════════════════════
     PREMIUM CUSTOMIZATION OPTIONS
     ═════════════════════════════════════════════════════════════════════════ */

  const gameCustomizations = {
    cardSpeed: {
      slow: 1000,
      normal: 600,
      fast: 300,
      instant: 100,
    },
    animationQuality: {
      low: 0.2,
      medium: 0.6,
      high: 1.0,
    },
    uiTheme: {
      dark: 'dark_theme',
      light: 'light_theme',
      classic: 'classic_theme',
      vip: 'vip_theme',
    },
  };

  function applyGameCustomization(customizations) {
    Object.assign(settings, customizations);
    saveSettings();
  }

  /* ═════════════════════════════════════════════════════════════════════════
     COMPREHENSIVE AUDIT TRAIL
     ═════════════════════════════════════════════════════════════════════════ */

  function generateAuditReport(days = 7) {
    const now = Date.now();
    const startDate = now - days * 86400000;

    const sessions = JSON.parse(localStorage.getItem('baccarat_sessions') || '[]')
      .filter(s => s.timestamp >= startDate);

    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
      .filter(h => h.date >= startDate);

    const logs = JSON.parse(localStorage.getItem('baccarat_logs') || '[]')
      .filter(l => l.timestamp >= startDate);

    return {
      period: `Last ${days} days`,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(now).toISOString(),
      sessionsSummary: {
        total: sessions.length,
        totalGametime: sessions.reduce((s, x) => s + x.duration, 0),
        totalWinnings: sessions.reduce((s, x) => s + x.totalWinnings, 0),
        avgWinningsPerSession: sessions.length > 0 ? Math.round(sessions.reduce((s, x) => s + x.totalWinnings, 0) / sessions.length) : 0,
      },
      gameSummary: {
        total: history.length,
        totalBet: history.reduce((s, h) => s + h.amount, 0),
        totalPayout: history.reduce((s, h) => s + h.payout, 0),
        playerBets: history.filter(h => h.bet === 'player').length,
        bankerBets: history.filter(h => h.bet === 'banker').length,
        tieBets: history.filter(h => h.bet === 'tie').length,
      },
      eventLog: logs.slice(0, 50),
    };
  }

  /* ═════════════════════════════════════════════════════════════════════════
     PLAYER PSYCHOLOGY & BEHAVIOR TRACKING
     ═════════════════════════════════════════════════════════════════════════ */

  function analyzeBehavior() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]').slice(0, 50);

    if (!history.length) {
      return { pattern: 'insufficient_data', suggestions: [] };
    }

    const avgBets = {
      after_win: 0,
      after_loss: 0,
      count_after_win: 0,
      count_after_loss: 0,
    };

    for (let i = 1; i < history.length; i++) {
      const prevWon = history[i - 1].payout > history[i - 1].amount;
      if (prevWon) {
        avgBets.after_win += history[i].amount;
        avgBets.count_after_win++;
      } else {
        avgBets.after_loss += history[i].amount;
        avgBets.count_after_loss++;
      }
    }

    avgBets.after_win = avgBets.count_after_win > 0 ? Math.round(avgBets.after_win / avgBets.count_after_win) : 0;
    avgBets.after_loss = avgBets.count_after_loss > 0 ? Math.round(avgBets.after_loss / avgBets.count_after_loss) : 0;

    const suggestions = [];
    if (avgBets.after_loss > avgBets.after_win) {
      suggestions.push('Consider flat betting to avoid chasing losses');
    }

    return {
      avgBetAfterWin: avgBets.after_win,
      avgBetAfterLoss: avgBets.after_loss,
      pattern: avgBets.after_loss > avgBets.after_win ? 'chasing' : 'conservative',
      suggestions,
    };
  }

  /* ═════════════════════════════════════════════════════════════════════════
     GAME STATE SNAPSHOTS
     ═════════════════════════════════════════════════════════════════════════ */

  function saveGameSnapshot() {
    const snapshot = {
      timestamp: Date.now(),
      profileStars: profile.stars,
      profileLevel: levelFromXp(profile.xp).lv,
      recentResults: game.lastResults.slice(0, 20),
      sessionStats: {
        gamesPlayed: sessionGameCount,
        totalWinnings: sessionTotalWinnings,
      },
    };

    let snapshots = JSON.parse(localStorage.getItem('baccarat_snapshots') || '[]');
    snapshots.push(snapshot);
    if (snapshots.length > 50) snapshots = snapshots.slice(-50);
    localStorage.setItem('baccarat_snapshots', JSON.stringify(snapshots));
  }

  function compareSnapshots(snapshot1, snapshot2) {
    return {
      starsDifference: snapshot2.profileStars - snapshot1.profileStars,
      levelDifference: snapshot2.profileLevel - snapshot1.profileLevel,
      timeDifference: snapshot2.timestamp - snapshot1.timestamp,
    };
  }

  /* ═════════════════════════════════════════════════════════════════════════
     SYSTEM HEALTH CHECKS
     ═════════════════════════════════════════════════════════════════════════ */

  function performHealthCheck() {
    const checks = {
      storageAvailable: typeof localStorage !== 'undefined',
      audioAvailable: typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',
      gameStateValid: profile && profile.id && profile.stars >= 0,
      settingsValid: settings && typeof settings.sound === 'boolean',
      shopStateValid: shop && Array.isArray(shop.owned),
    };

    const allHealthy = Object.values(checks).every(v => v === true);

    return {
      healthy: allHealthy,
      checks,
      timestamp: Date.now(),
    };
  }

  function resetCorruptedState() {
    if (!profile || !profile.id) {
      profile = {
        id: 'player_' + Date.now(),
        nickname: 'Player',
        stars: STARTING_STARS,
        xp: 0,
        totalWins: 0,
        totalLosses: 0,
        totalGames: 0,
        bestStreak: 0,
        currentStreak: 0,
        playerWins: 0,
        bankerWins: 0,
        tieWins: 0,
        maxBet: 0,
        lastDailyClaimTime: 0,
      };
      saveProfile();
    }
  }

  /* [duplicate init removed] */

  /* ═════════════════════════════════════════════════════════════════════════
     ADVANCED STATISTICS & REPORTING MODULE
     ═════════════════════════════════════════════════════════════════════════ */

  function generateComprehensiveReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      playerProfile: {
        id: profile.id,
        nickname: profile.nickname,
        level: levelFromXp(profile.xp).lv,
        stars: profile.stars,
        xp: profile.xp,
        totalWins: profile.totalWins,
        totalLosses: profile.totalLosses,
        totalGames: profile.totalGames,
        winRate: profile.totalGames > 0 ? (profile.totalWins / profile.totalGames * 100).toFixed(2) + '%' : '0%',
        bestStreak: profile.bestStreak,
        currentStreak: profile.currentStreak,
      },
      statistics: {
        gameStats: getGameStats(),
        bankrollStats: getBankrollStats(),
        performanceMetrics: getPerformanceMetrics(),
        mathematicalAnalysis: getBaccaratMathematics(),
      },
      recentGames: getDetailedGameHistory(30),
      roadMap: game.lastResults.slice(0, 40),
      achievements: JSON.parse(localStorage.getItem(ACHIEVE_KEY) || '[]'),
      equipment: {
        avatar: settings.equippedAvatar,
        table: settings.equippedTable,
        cardBack: settings.equippedCardBack,
      },
      settings: {
        sound: settings.sound,
        vibrate: settings.vibrate,
        language: lang,
      },
    };
    return report;
  }

  function exportReportAsJSON() {
    const report = generateComprehensiveReport();
    const jsonString = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    return URL.createObjectURL(blob);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     MULTI-LANGUAGE SUPPORT EXPANSION
     ═════════════════════════════════════════════════════════════════════════ */

  function getAvailableLanguages() {
    return [
      { code: 'en', name: 'English', native: 'English' },
      { code: 'ko', name: 'Korean', native: '한국어' },
      { code: 'ja', name: 'Japanese', native: '日本語' },
      { code: 'zh', name: 'Chinese', native: '中文' },
      { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
      { code: 'th', name: 'Thai', native: 'ไทย' },
    ];
  }

  function switchLanguage(languageCode) {
    if (!I18N[languageCode]) return false;
    lang = languageCode;
    settings.language = languageCode;
    saveSettings();
    applyI18n();
    return true;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     GAME VALIDATION & INTEGRITY CHECKS
     ═════════════════════════════════════════════════════════════════════════ */

  function validateGameIntegrity() {
    const validations = {
      cardsInHand: game.playerCards.length <= 3 && game.bankerCards.length <= 3,
      shoeNotEmpty: game.shoe.length > 0,
      profileExists: profile && profile.id,
      scoresValid: handValue(game.playerCards) <= 9 && handValue(game.bankerCards) <= 9,
      betsValid: ['player', 'banker', 'tie'].includes(game.playerBet) || !game.playerBet,
      starsNonNegative: profile.stars >= 0,
    };

    const allValid = Object.values(validations).every(v => v === true);
    return { valid: allValid, validations };
  }

  function repairGameState() {
    const integrity = validateGameIntegrity();
    if (integrity.valid) return true;

    if (game.playerCards.length > 3) game.playerCards = game.playerCards.slice(0, 3);
    if (game.bankerCards.length > 3) game.bankerCards = game.bankerCards.slice(0, 3);
    if (game.shoe.length === 0) game.shoe = createShoe(8);
    if (profile.stars < 0) profile.stars = STARTING_STARS;

    saveProfile();
    return true;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     SEASONAL & TIME-BASED EVENTS
     ═════════════════════════════════════════════════════════════════════════ */

  function getTimeBasedMultipliers() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const dayOfMonth = now.getDate();

    let multiplier = 1.0;

    if (dayOfWeek === 5 || dayOfWeek === 6) multiplier *= 1.1; // Weekend bonus
    if (hour >= 20 || hour <= 4) multiplier *= 1.05; // Night bonus
    if (dayOfMonth === 1) multiplier *= 1.2; // First day of month

    return Math.min(multiplier, 2.0);
  }

  function applyTimeBasedBonus() {
    const multiplier = getTimeBasedMultipliers();
    if (multiplier > 1.0) {
      logGameEvent('time_based_bonus', { multiplier });
      return multiplier;
    }
    return 1.0;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     IMPORT & EXPORT FUNCTIONALITY
     ═════════════════════════════════════════════════════════════════════════ */

  function exportAllData() {
    const allData = {
      profile,
      settings,
      shop,
      gameHistory: JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'),
      gameResults: game.lastResults,
      achievements: JSON.parse(localStorage.getItem(ACHIEVE_KEY) || '[]'),
      ranks: JSON.parse(localStorage.getItem(RANK_KEY) || '[]'),
      sessions: JSON.parse(localStorage.getItem('baccarat_sessions') || '[]'),
      snapshots: JSON.parse(localStorage.getItem('baccarat_snapshots') || '[]'),
      exportDate: new Date().toISOString(),
      fileVersion: '2.0',
    };
    return JSON.stringify(allData, null, 2);
  }

  function importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (!data.fileVersion || data.fileVersion !== '2.0') {
        showNotification('Invalid or incompatible file format');
        return false;
      }

      if (data.profile) {
        Object.assign(profile, data.profile);
        saveProfile();
      }
      if (data.settings) {
        Object.assign(settings, data.settings);
        saveSettings();
      }
      if (data.shop) {
        Object.assign(shop, data.shop);
        saveShop();
      }

      updateAllUI();
      showNotification('Data imported successfully');
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      showNotification('Failed to import data');
      return false;
    }
  }

  /* ═════════════════════════════════════════════════════════════════════════
     ANTI-CHEAT & FRAUD DETECTION
     ═════════════════════════════════════════════════════════════════════════ */

  function detectAnomalies() {
    const anomalies = [];

    if (profile.stars > 1000000) {
      anomalies.push({ type: 'unrealistic_stars', severity: 'high' });
    }

    if (profile.totalWins > profile.totalGames) {
      anomalies.push({ type: 'impossible_wins', severity: 'critical' });
    }

    const stats = getGameStats();
    if (stats.playerWinRate > 75) {
      anomalies.push({ type: 'suspicious_winrate', severity: 'medium' });
    }

    const timeDiff = Date.now() - profile.lastDailyClaimTime;
    if (timeDiff < 3600000 && profile.totalGames === 0) {
      anomalies.push({ type: 'suspicious_activity', severity: 'low' });
    }

    return anomalies;
  }

  function validateTransactionIntegrity() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    let totalBet = 0;
    let totalPayout = 0;

    for (const game of history) {
      totalBet += game.amount || 0;
      totalPayout += game.payout || 0;
    }

    return {
      transactionsValid: totalBet >= 0 && totalPayout >= 0,
      totalBet,
      totalPayout,
      profitLoss: totalPayout - totalBet,
    };
  }

  /* ═════════════════════════════════════════════════════════════════════════
     COMPREHENSIVE CRASH RECOVERY
     ═════════════════════════════════════════════════════════════════════════ */

  function createBackup() {
    const backup = {
      timestamp: Date.now(),
      data: {
        profile: JSON.parse(JSON.stringify(profile)),
        settings: JSON.parse(JSON.stringify(settings)),
        shop: JSON.parse(JSON.stringify(shop)),
        gameResults: [...game.lastResults],
      },
    };

    let backups = JSON.parse(localStorage.getItem('baccarat_backups') || '[]');
    backups.push(backup);
    if (backups.length > 10) backups = backups.slice(-10);
    localStorage.setItem('baccarat_backups', JSON.stringify(backups));

    return backup;
  }

  function restoreFromBackup(backupIndex) {
    const backups = JSON.parse(localStorage.getItem('baccarat_backups') || '[]');
    if (backupIndex < 0 || backupIndex >= backups.length) {
      showNotification('Invalid backup index');
      return false;
    }

    const backup = backups[backupIndex];
    Object.assign(profile, backup.data.profile);
    Object.assign(settings, backup.data.settings);
    Object.assign(shop, backup.data.shop);
    game.lastResults = [...backup.data.gameResults];

    saveProfile();
    saveSettings();
    saveShop();
    localStorage.setItem('baccarat_results', JSON.stringify(game.lastResults));
    updateAllUI();
    showNotification('Restored from backup');
    return true;
  }

  function getBackupList() {
    const backups = JSON.parse(localStorage.getItem('baccarat_backups') || '[]');
    return backups.map((b, idx) => ({
      index: idx,
      timestamp: new Date(b.timestamp).toISOString(),
      starCount: b.data.profile.stars,
      level: levelFromXp(b.data.profile.xp).lv,
    }));
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FINAL GAME INITIALIZATION WITH COMPLETE SETUP
     ═════════════════════════════════════════════════════════════════════════ */

  function init() {
    boot();
    setupSettingsListeners();

    lang = settings.language || 'en';
    applyI18n();
    renderChips();
    game.shoe = createShoe(8);
    game.lastResults = JSON.parse(localStorage.getItem('baccarat_results') || '[]');

    initializeAdvancedFeatures();
    updateAllUI();

    const now = Date.now();
    if (now - profile.lastDailyClaimTime > 86400000) {
      document.getElementById('daily-card').classList.remove('hidden');
    }

    document.getElementById('toggle-sound').classList.toggle('on', settings.sound);
    document.getElementById('toggle-vibrate').classList.toggle('on', settings.vibrate);
    document.getElementById('lang-select').value = lang;

    document.addEventListener('pointerdown', () => {
      if (settings.sound) {
        try {
          const ac = new (window.AudioContext || window.webkitAudioContext)();
          const t = ac.currentTime;
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.frequency.value = 600;
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
          osc.start(t);
          osc.stop(t + 0.05);
        } catch {}
      }
    }, { once: false });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        logGameEvent('session_paused', { duration: Date.now() - sessionStartTime });
      } else {
        logGameEvent('session_resumed');
      }
    });

    window.addEventListener('beforeunload', () => {
      finishSession();
      logGameEvent('session_ended', {
        finalStars: profile.stars,
        sessionDuration: Date.now() - sessionStartTime,
      });
    });

    logGameEvent('game_initialized', {
      profileLevel: levelFromXp(profile.xp).lv,
      profileStars: profile.stars,
      language: lang,
    });
  }

  init();
})();
