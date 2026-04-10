/* =============================================================================
 *  FA Baccarat · Premium Royal Edition
 *  -----------------------------------------------------------------------------
 *  Single-file, self-mounting, vanilla JavaScript Punto Banco Baccarat game.
 *  - Works offline (localStorage persistence)
 *  - Polished Kakao-style UI with a deep-navy/gold casino theme
 *  - Punto Banco rules with 8-deck shoe, 3rd card draw rules
 *  - Online multiplayer rooms via Firebase (same table, multiple bettors)
 *  - Full profile system: stars, level, streaks, weekly/total records
 *  - Leaderboard (weekly TOP 7 + cumulative) with seeded bot opponents
 *  - Shop: unlockable avatars, table skins, card backs
 *  - Daily / weekly missions with star rewards
 *  - Achievements and match history
 *  - Tutorial and how-to-play screens
 *  - Sound engine, card flip animations, chip animations
 *  - Settings: speed, sound, vibration, theme variants
 *  - Responsive layout for phone, tablet and desktop
 *  =============================================================================
 */

function ordinalSuffix(n) {
  const v = Math.abs(Number(n)) || 0;
  const r10 = v % 10, r100 = v % 100;
  if (r10 === 1 && r100 !== 11) return 'st';
  if (r10 === 2 && r100 !== 12) return 'nd';
  if (r10 === 3 && r100 !== 13) return 'rd';
  return 'th';
}

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════════
     CONSTANTS
     ═══════════════════════════════════════════════════════════════════════ */
  const STORE_KEY    = 'fa_baccarat_profile_v1';
  const RANK_KEY     = 'fa_baccarat_ranks_v1';
  const SETTINGS_KEY = 'fa_baccarat_settings_v1';
  const HISTORY_KEY  = 'fa_baccarat_history_v1';
  const MISSIONS_KEY = 'fa_baccarat_missions_v1';
  const ACHIEVE_KEY  = 'fa_baccarat_achieve_v1';
  const SHOP_KEY     = 'fa_baccarat_shop_v1';
  const DAILY_KEY    = 'fa_baccarat_daily_v1';

  const FB_LEADER_PATH   = 'leaderboards/baccarat';
  const FB_ROOMS_PATH    = 'baccaratRooms';
  const FB_PRESENCE_PATH = 'baccaratPresence';

  const DAILY_BONUS_STAR = 100;
  const STARTING_STARS   = 5000;

  // Punto Banco constants
  const SUITS  = ['♠','♥','♦','♣'];
  const RANKS  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const VALUES = [1,2,3,4,5,6,7,8,9,0,0,0,0]; // baccarat values

  // Bet types
  const BET_PLAYER = 'player';
  const BET_BANKER = 'banker';
  const BET_TIE    = 'tie';

  // Payouts
  const PAYOUT = { player: 2, banker: 1.95, tie: 9 };

  const SHOP_ITEMS = [
    { id: 'avatar_ace',    type: 'avatar', name: 'Ace',       emoji: '🃏', price: 0 },
    { id: 'avatar_crown',  type: 'avatar', name: 'Crown',     emoji: '👑', price: 6000 },
    { id: 'avatar_diamond',type: 'avatar', name: 'Diamond',   emoji: '💎', price: 9000 },
    { id: 'avatar_fire',   type: 'avatar', name: 'Fire',      emoji: '🔥', price: 10500 },
    { id: 'avatar_star',   type: 'avatar', name: 'Star',      emoji: '⭐', price: 12000 },
    { id: 'avatar_dragon', type: 'avatar', name: 'Dragon',    emoji: '🐉', price: 13500 },
    { id: 'avatar_rocket', type: 'avatar', name: 'Rocket',    emoji: '🚀', price: 15000 },
    { id: 'avatar_money',  type: 'avatar', name: 'Money',     emoji: '💰', price: 18000 },
    { id: 'table_classic', type: 'table', name: 'Classic Green', emoji: '🟩', price: 0 },
    { id: 'table_royal',   type: 'table', name: 'Royal Blue',   emoji: '🔵', price: 8000 },
    { id: 'table_ruby',    type: 'table', name: 'Ruby Red',     emoji: '🔴', price: 12000 },
    { id: 'table_gold',    type: 'table', name: 'Gold VIP',     emoji: '🟡', price: 20000 },
    { id: 'back_red',   type: 'cardback', name: 'Red Classic',  emoji: '🎴', price: 0 },
    { id: 'back_blue',  type: 'cardback', name: 'Blue Royal',   emoji: '🔷', price: 5000 },
    { id: 'back_gold',  type: 'cardback', name: 'Gold Luxury',  emoji: '✨', price: 15000 },
    { id: 'back_black', type: 'cardback', name: 'Black Diamond', emoji: '♠️', price: 25000 },
  ];

  const BOT_NAMES = [
    'HighRoller', 'LuckyDraw', 'CardShark', 'AceMaster', 'RoyalFlush',
    'GoldHand', 'DiamondKing', 'NightOwl', 'SilverFox', 'VegasPro',
    'CasinoKing', 'BigBet', 'WinStreak', 'JackpotJoy', 'StarPlayer',
    'MysticAce', 'ThunderBet', 'NeonLights', 'PhoenixRise', 'OceanBlue',
  ];

  const ACHIEVE_DEFS = [
    { id: 'first_win',  name: 'First Win',       desc: 'Win your first hand',        key: 'totalWins',     target: 1,   star: 100 },
    { id: 'win_10',     name: 'Getting Started',  desc: 'Win 10 hands',               key: 'totalWins',     target: 10,  star: 300 },
    { id: 'win_50',     name: 'Regular',           desc: 'Win 50 hands',               key: 'totalWins',     target: 50,  star: 800 },
    { id: 'win_100',    name: 'Veteran',           desc: 'Win 100 hands',              key: 'totalWins',     target: 100, star: 1500 },
    { id: 'win_500',    name: 'Legend',             desc: 'Win 500 hands',              key: 'totalWins',     target: 500, star: 5000 },
    { id: 'play_100',   name: 'Dedicated',         desc: 'Play 100 games',             key: 'totalGames',    target: 100, star: 500 },
    { id: 'streak_5',   name: 'Hot Streak',        desc: '5 wins in a row',            key: 'bestStreak',    target: 5,   star: 600 },
    { id: 'streak_10',  name: 'On Fire',           desc: '10 wins in a row',           key: 'bestStreak',    target: 10,  star: 2000 },
    { id: 'rich_10k',   name: 'High Roller',       desc: 'Accumulate 10,000⭐',        key: 'stars',         target: 10000, star: 500 },
    { id: 'rich_50k',   name: 'VIP',               desc: 'Accumulate 50,000⭐',        key: 'stars',         target: 50000, star: 2000 },
    { id: 'natural_w',  name: 'Natural Born',      desc: 'Win with a Natural 9',       key: 'naturalWins',   target: 1,   star: 200 },
    { id: 'tie_w',      name: 'Lucky Eight',       desc: 'Win a Tie bet',              key: 'tieWins',       target: 1,   star: 300 },
  ];

  /* ═══════════════════════════════════════════════════════════════════════
     STYLES — Deep Navy/Gold Casino Theme
     ═══════════════════════════════════════════════════════════════════════ */
  const CSS = `
  :root{
    --g-deep:#0a0e1a;
    --g1:#0f1628;
    --g2:#162040;
    --g3:#1c2d5a;
    --g4:#243a72;
    --g5:#3a5cb0;
    --accent:#7ba4e8;
    --gold:#ffd56b;
    --gold2:#f6b733;
    --gold3:#ff9e3c;
    --ruby:#ff5a6a;
    --green:#3ddc98;
    --ink:#050810;
    --ink2:#0b1428;
    --paper:#f0f2fa;
    --muted:#8a9ab0;
    --shadow:0 18px 44px rgba(0,0,0,.55);
    --safe-top:env(safe-area-inset-top,0px);
    --safe-bot:env(safe-area-inset-bottom,0px);
  }
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  html,body{
    margin:0;padding:0;height:100%;overflow:hidden;
    font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Pretendard","Malgun Gothic","Noto Sans KR",sans-serif;
    background:#050810;color:#fff;
    -webkit-user-select:none;user-select:none;
    overscroll-behavior:none;
  }
  button,input,textarea,select{font-family:inherit}
  button{cursor:pointer}
  #kk-root{
    position:fixed;inset:0;
    display:flex;align-items:center;justify-content:center;
    background:
      radial-gradient(1200px 800px at 20% 10%, #0f1a38 0%, transparent 50%),
      radial-gradient(1000px 700px at 80% 100%, #131f40 0%, transparent 50%),
      #050810;
  }
  #kk-root::before{
    content:"";position:absolute;inset:0;pointer-events:none;
    background-image:
      radial-gradient(1.4px 1.4px at 12% 18%, rgba(255,213,107,.35) 50%, transparent 51%),
      radial-gradient(1.2px 1.2px at 72% 24%, rgba(255,213,107,.3) 50%, transparent 51%),
      radial-gradient(1.6px 1.6px at 38% 72%, rgba(255,213,107,.25) 50%, transparent 51%),
      radial-gradient(1.1px 1.1px at 88% 78%, rgba(255,213,107,.25) 50%, transparent 51%),
      radial-gradient(1.3px 1.3px at 54% 42%, rgba(255,213,107,.2) 50%, transparent 51%);
  }
  .stage{
    position:relative;
    width:min(100vw,480px);
    height:min(100svh,920px);
    max-height:100svh;
    padding-top:env(safe-area-inset-top,0px);
    padding-bottom:env(safe-area-inset-bottom,0px);
    background:linear-gradient(165deg,var(--g1) 0%,var(--g2) 30%,var(--g3) 65%,var(--g4) 100%);
    overflow:hidden;
    border-radius:28px;
    box-shadow:var(--shadow), inset 0 1px 0 rgba(255,255,255,.1);
  }
  @media (max-width:520px){
    .stage{ width:100vw; height:100svh; max-height:100svh; border-radius:0; }
    .screen{ padding-bottom:calc(36px + env(safe-area-inset-bottom,0px)) !important; }
  }
  .stage::before{
    content:"";position:absolute;inset:0;pointer-events:none;
    border-radius:inherit;
    background-image:
      radial-gradient(1.4px 1.4px at 22% 14%, rgba(255,213,107,.15) 50%, transparent 51%),
      radial-gradient(1.4px 1.4px at 58% 34%, rgba(255,213,107,.12) 50%, transparent 51%);
  }
  .screen{
    position:absolute;inset:0;
    display:none;
    flex-direction:column;
    padding:calc(16px + var(--safe-top)) 16px calc(24px + var(--safe-bot));
    overflow-y:auto;
    -webkit-overflow-scrolling:touch;
    animation:kk-fade .35s ease;
    z-index:1;
  }
  .screen.active{ display:flex; }
  @keyframes kk-fade{ from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  @keyframes kk-pop{ from{transform:scale(.7);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes kk-slide-up{ from{transform:translateY(100%)} to{transform:none} }
  @keyframes kk-shimmer{
    0%{background-position:-200% center}
    100%{background-position:200% center}
  }
  @keyframes kk-pulse{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
  @keyframes card-flip{
    0%{transform:rotateY(90deg) scale(.9);opacity:.5}
    100%{transform:rotateY(0) scale(1);opacity:1}
  }
  @keyframes chip-bounce{
    0%{transform:translateY(-40px) scale(.6);opacity:0}
    60%{transform:translateY(4px) scale(1.05);opacity:1}
    100%{transform:translateY(0) scale(1);opacity:1}
  }

  /* Topbar */
  .topbar{
    display:flex;align-items:center;gap:10px;
    padding:6px 4px 10px;flex-shrink:0;
  }
  .brand-name{
    font-size:17px;font-weight:900;letter-spacing:.03em;
    background:linear-gradient(90deg,var(--gold),var(--gold3));
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    background-clip:text;
  }
  .icon-btn{
    width:38px;height:38px;border-radius:12px;border:none;
    background:rgba(255,255,255,.08);color:#fff;
    font-size:17px;display:flex;align-items:center;justify-content:center;
    backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.08);
    transition:all .12s;
  }
  .icon-btn:active{transform:scale(.88)}

  /* Info Bar */
  .info-bar{
    display:flex;gap:8px;margin:0 0 10px;flex-shrink:0;
  }
  .info-chip{
    flex:1;padding:10px 6px;border-radius:14px;
    background:rgba(0,0,0,.3);backdrop-filter:blur(8px);
    border:1px solid rgba(255,255,255,.08);
    text-align:center;
  }
  .info-chip .val{ font-size:17px;font-weight:900;color:var(--gold); }
  .info-chip .lbl{ font-size:10px;color:rgba(255,255,255,.6);font-weight:700;margin-top:2px; }

  /* Daily Checkin */
  .daily-banner{
    display:flex;align-items:center;gap:12px;
    padding:13px 16px;border-radius:16px;margin:0 0 10px;
    background:linear-gradient(135deg,rgba(255,213,107,.18),rgba(255,158,60,.12));
    border:1px solid rgba(255,213,107,.3);
    cursor:pointer;transition:all .12s;flex-shrink:0;
  }
  .daily-banner:active{transform:scale(.97)}
  .daily-icon{font-size:26px}
  .daily-info{flex:1}
  .daily-title{font-size:14px;font-weight:800;color:var(--gold)}
  .daily-sub{font-size:11px;color:rgba(255,255,255,.7)}

  /* Buttons */
  .btn{
    padding:14px 22px;border:none;border-radius:16px;
    font-weight:800;font-size:14px;transition:all .12s;
    letter-spacing:.02em;
  }
  .btn:active{transform:scale(.95)}
  .btn-primary{
    background:linear-gradient(135deg,var(--gold),var(--gold3));
    color:#3a1a00;box-shadow:0 6px 20px rgba(255,158,60,.35);
  }
  .btn-ghost{
    background:rgba(255,255,255,.1);color:#fff;
    border:1px solid rgba(255,255,255,.15);
  }
  .btn-danger{background:#ff3b4a;color:#fff}
  .btn-small{padding:8px 16px;font-size:12px;border-radius:10px}

  /* Menu Buttons */
  .menu-btn{
    display:flex;align-items:center;gap:14px;
    padding:16px;border-radius:18px;border:none;width:100%;
    background:rgba(255,255,255,.06);
    backdrop-filter:blur(8px);
    border:1px solid rgba(255,255,255,.08);
    color:#fff;text-align:left;transition:all .12s;
    margin-bottom:8px;
  }
  .menu-btn:active{transform:scale(.97)}
  .mb-icon{font-size:30px;flex-shrink:0}
  .mb-text{flex:1}
  .mb-title{font-size:15px;font-weight:800}
  .mb-sub{font-size:11px;color:rgba(255,255,255,.6);margin-top:2px}
  .mb-arrow{font-size:22px;color:rgba(255,255,255,.3);font-weight:300}

  /* Footer Nav */
  .footer-nav{
    display:grid;grid-template-columns:repeat(5,1fr);gap:4px;
    margin-top:12px;padding:7px;
    background:rgba(0,0,0,.32);border-radius:20px;
    border:1px solid rgba(255,255,255,.1);
    backdrop-filter:blur(10px);
    margin-bottom:calc(env(safe-area-inset-bottom,0px) + 28px);
    flex-shrink:0;
  }
  .fnav{
    background:transparent;border:none;color:#fff;
    padding:10px 3px;border-radius:14px;
    display:flex;flex-direction:column;align-items:center;gap:3px;
    font-weight:800;font-size:10.5px;opacity:.65;transition:all .18s;
  }
  .fnav .i{ font-size:19px }
  .fnav.on{
    opacity:1;
    background:linear-gradient(135deg,rgba(255,213,107,.2),rgba(255,158,60,.2));
    box-shadow:inset 0 1px 0 rgba(255,255,255,.2), 0 4px 12px rgba(0,0,0,.25);
  }
  .fnav:active{ transform:scale(.94) }

  /* Profile */
  .prof-card{
    padding:20px;border-radius:20px;
    background:linear-gradient(160deg,rgba(15,22,40,.9),rgba(36,58,114,.6));
    border:1px solid rgba(255,213,107,.2);
    text-align:center;margin-bottom:12px;
  }
  .prof-avatar{font-size:56px;margin-bottom:6px}
  .prof-name{font-size:20px;font-weight:900}
  .prof-row{
    display:flex;justify-content:space-between;
    padding:9px 0;border-bottom:1px solid rgba(255,255,255,.06);
    font-size:13px;
  }
  .prof-row .k{color:rgba(255,255,255,.6)}
  .prof-row .v{font-weight:800}

  /* Rank List */
  .rank-list{ flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch; }
  .rank-list::-webkit-scrollbar{ width:4px }
  .rank-list::-webkit-scrollbar-thumb{ background:rgba(255,255,255,.2);border-radius:2px }
  .rank-item{
    display:flex;align-items:center;gap:12px;
    padding:11px 12px;border-radius:14px;margin-bottom:6px;
    background:rgba(255,255,255,.04);
    border:1px solid rgba(255,255,255,.06);
    transition:all .12s;
  }
  .rank-item.me{ border-color:var(--gold); background:rgba(255,213,107,.08); }
  .rank-item.p1{ background:linear-gradient(135deg,rgba(255,213,107,.15),rgba(255,213,107,.05)); border-color:rgba(255,213,107,.3); }
  .rank-item.p2{ background:linear-gradient(135deg,rgba(200,210,230,.12),rgba(200,210,230,.04)); border-color:rgba(200,210,230,.2); }
  .rank-item.p3{ background:linear-gradient(135deg,rgba(205,127,50,.12),rgba(205,127,50,.04)); border-color:rgba(205,127,50,.2); }
  .rank-pos{ width:30px;text-align:center;font-size:15px;font-weight:900 }
  .rank-avatar{ font-size:26px }
  .rank-info{ flex:1 }
  .rank-name{ font-size:13.5px;font-weight:800 }
  .rank-sub{ font-size:11px;color:rgba(255,255,255,.55) }
  .rank-val{ font-size:14px;font-weight:900;color:var(--gold) }

  /* Tabs */
  .tabs{ display:flex;gap:6px;margin-bottom:8px;overflow-x:auto;flex-shrink:0; }
  .tabs::-webkit-scrollbar{display:none}
  .tab{
    padding:8px 14px;border-radius:12px;border:none;white-space:nowrap;
    background:rgba(255,255,255,.08);color:rgba(255,255,255,.6);
    font-weight:700;font-size:12px;transition:all .15s;
  }
  .tab.on{
    background:linear-gradient(135deg,var(--gold),var(--gold3));
    color:#3a1a00;box-shadow:0 4px 12px rgba(255,158,60,.3);
  }

  /* Modal */
  .modal{
    position:absolute;inset:0;z-index:100;
    display:none;align-items:center;justify-content:center;
    background:rgba(5,8,16,.7);backdrop-filter:blur(8px);
  }
  .modal.active{display:flex}
  .modal-card{
    width:min(90vw,360px);padding:32px 22px;
    border-radius:24px;
    background:linear-gradient(160deg,#0f1628,#1c2d5a);
    border:1px solid rgba(255,213,107,.3);
    box-shadow:0 30px 80px rgba(0,0,0,.6);
    text-align:center;
    animation:kk-pop .35s ease;
  }
  .modal-card h2{font-size:26px;font-weight:900;margin:0 0 6px}
  .modal-card p{font-size:13.5px;color:rgba(255,255,255,.75);margin:0 0 16px}
  .modal-rewards{display:flex;justify-content:center;gap:12px;margin-bottom:18px}
  .modal-rewards.hidden{display:none}
  .reward-chip{
    padding:7px 18px;border-radius:22px;font-weight:900;font-size:14px;
    background:linear-gradient(135deg,var(--gold),var(--gold3));
    color:#3a1a00;box-shadow:0 3px 10px rgba(255,158,60,.35);
  }
  .modal-actions{display:flex;flex-direction:column;gap:8px}
  .empty-note{text-align:center;padding:40px 0;color:rgba(255,255,255,.4);font-size:13px;line-height:1.6}

  /* Toast */
  #toast{
    position:absolute;bottom:100px;left:50%;transform:translateX(-50%) translateY(20px);
    padding:11px 24px;border-radius:20px;
    background:rgba(15,22,40,.92);color:#fff;font-weight:800;font-size:13px;
    box-shadow:0 6px 25px rgba(0,0,0,.4);backdrop-filter:blur(10px);
    border:1px solid rgba(255,213,107,.2);
    opacity:0;transition:all .3s ease;z-index:200;pointer-events:none;white-space:nowrap;
  }
  #toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

  /* Settings */
  .sett-row{
    display:flex;align-items:center;justify-content:space-between;
    padding:13px 0;border-bottom:1px solid rgba(255,255,255,.06);
    font-size:13.5px;
  }
  .sett-row span{flex:1;font-weight:700}
  .toggle{
    width:48px;height:28px;border-radius:14px;border:none;
    background:rgba(255,255,255,.15);position:relative;transition:background .2s;cursor:pointer;
  }
  .toggle.on{background:var(--gold)}
  .toggle::after{
    content:"";position:absolute;top:3px;left:3px;
    width:22px;height:22px;border-radius:11px;
    background:#fff;transition:transform .2s;box-shadow:0 2px 5px rgba(0,0,0,.3);
  }
  .toggle.on::after{transform:translateX(20px)}

  /* ── GAME TABLE ─────── */
  .game-top{ display:flex;align-items:center;justify-content:space-between;padding:4px 4px 8px;flex-shrink:0; }
  .game-stars{ font-size:14px;font-weight:900;color:var(--gold); }
  .game-info{ font-size:11px;color:rgba(255,255,255,.6); }

  .table-area{
    flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:8px;padding:6px;min-height:0;
  }
  .hand-label{
    font-size:12px;font-weight:900;letter-spacing:.12em;
    text-transform:uppercase;
  }
  .hand-label.banker-lbl{ color:#5aa9ff; }
  .hand-label.player-lbl{ color:#ff5a6a; }
  .cards-row{
    display:flex;gap:8px;min-height:92px;align-items:center;justify-content:center;
  }
  .card{
    width:60px;height:88px;border-radius:10px;
    background:#fff;color:#1a1a1a;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    font-weight:900;box-shadow:0 4px 14px rgba(0,0,0,.35);
    animation:card-flip .4s ease;position:relative;
    border:2px solid rgba(255,255,255,.15);
  }
  .card.red{ color:#d32f2f; }
  .card .card-rank{ font-size:22px;line-height:1; }
  .card .card-suit{ font-size:16px;margin-top:2px; }
  .card.hidden-card{
    background:linear-gradient(135deg,#1c2d5a,#0f1628);
    border:2px solid rgba(255,213,107,.3);
  }
  .card.hidden-card::after{
    content:'🃏';font-size:28px;
  }

  .score-badge{
    display:inline-block;padding:4px 16px;border-radius:10px;
    font-weight:900;font-size:18px;
    background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.15);
    min-width:40px;text-align:center;
  }

  .result-banner{
    padding:14px 20px;border-radius:16px;
    font-size:18px;font-weight:900;text-align:center;
    animation:kk-pop .35s ease;
    margin:6px 0;
  }
  .result-banner.win{ background:linear-gradient(135deg,rgba(255,213,107,.25),rgba(255,158,60,.15)); color:var(--gold); border:1px solid rgba(255,213,107,.4); }
  .result-banner.lose{ background:rgba(255,90,106,.12); color:var(--ruby); border:1px solid rgba(255,90,106,.25); }
  .result-banner.tie-result{ background:rgba(90,169,255,.12); color:var(--accent); border:1px solid rgba(90,169,255,.25); }

  /* Bet Area */
  .bet-area{
    flex-shrink:0;padding:6px 0;
  }
  .chip-row{
    display:flex;gap:6px;justify-content:center;margin-bottom:10px;flex-wrap:wrap;
  }
  .chip-btn{
    width:52px;height:52px;border-radius:50%;border:3px solid rgba(255,255,255,.3);
    font-weight:900;font-size:12px;color:#fff;
    display:flex;align-items:center;justify-content:center;
    transition:all .12s;
    box-shadow:0 3px 10px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.2);
  }
  .chip-btn:active{transform:scale(.88)}
  .chip-btn.on{ border-color:var(--gold); box-shadow:0 0 20px rgba(255,213,107,.4); transform:scale(1.08); }
  .chip-50{ background:linear-gradient(135deg,#4a90d9,#2a5f99); }
  .chip-100{ background:linear-gradient(135deg,#e74c3c,#c0392b); }
  .chip-500{ background:linear-gradient(135deg,#27ae60,#1e8449); }
  .chip-1k{ background:linear-gradient(135deg,#8e44ad,#6c3483); }
  .chip-5k{ background:linear-gradient(135deg,#f39c12,#d68910); }
  .chip-10k{ background:linear-gradient(135deg,#1a1a2e,#16213e); border-color:var(--gold); }

  .bet-options{
    display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px;
  }
  .bet-btn{
    padding:14px 6px;border:2px solid rgba(255,255,255,.12);border-radius:14px;
    background:rgba(255,255,255,.06);color:#fff;font-weight:800;font-size:13px;
    text-align:center;transition:all .12s;
  }
  .bet-btn:active{transform:scale(.95)}
  .bet-btn.on-player{ border-color:var(--ruby); background:rgba(255,90,106,.15); color:var(--ruby); }
  .bet-btn.on-banker{ border-color:#5aa9ff; background:rgba(90,169,255,.15); color:#5aa9ff; }
  .bet-btn.on-tie{ border-color:var(--green); background:rgba(61,220,152,.12); color:var(--green); }
  .bet-btn .bet-multi{ display:block;font-size:10px;color:rgba(255,255,255,.5);margin-top:2px; }

  .deal-btn{
    width:100%;padding:16px;border:none;border-radius:16px;
    font-weight:900;font-size:16px;
    background:linear-gradient(135deg,var(--gold),var(--gold3));
    color:#3a1a00;box-shadow:0 6px 20px rgba(255,158,60,.35);
    transition:all .12s;
  }
  .deal-btn:active{transform:scale(.96)}
  .deal-btn:disabled{opacity:.4;transform:none}

  /* History sidebar (road) */
  .road-area{
    display:flex;gap:3px;flex-wrap:wrap;padding:6px 0;min-height:24px;
  }
  .road-dot{
    width:18px;height:18px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:9px;font-weight:900;color:#fff;
  }
  .road-dot.rd-p{ background:var(--ruby); }
  .road-dot.rd-b{ background:#5aa9ff; }
  .road-dot.rd-t{ background:var(--green); }

  /* Mission & Achievement items */
  .mission-item{
    display:flex;align-items:center;gap:12px;
    padding:12px;border-radius:14px;margin-bottom:6px;
    background:rgba(255,255,255,.04);
    border:1px solid rgba(255,255,255,.06);
  }
  .mission-item .mi-icon{font-size:22px}
  .mission-item .mi-info{flex:1}
  .mission-item .mi-name{font-size:13px;font-weight:800}
  .mission-item .mi-desc{font-size:11px;color:rgba(255,255,255,.5)}
  .mission-item .mi-prog{font-size:11px;color:var(--gold);font-weight:700;margin-top:2px}
  .mi-claim{
    padding:6px 14px;border-radius:10px;border:none;
    background:linear-gradient(135deg,var(--gold),var(--gold3));
    color:#3a1a00;font-weight:800;font-size:11px;
  }
  .mi-claim:disabled{opacity:.35}

  .hidden{display:none!important}
  `;

  /* ═══════════════════════════════════════════════════════════════════════
     HTML
     ═══════════════════════════════════════════════════════════════════════ */
  const HTML = `
    <div class="stage">

    <!-- ========== HOME ========== -->
    <section class="screen active" id="sc-home">
      <div class="topbar">
        <div class="brand-name" style="flex:1">🃏 FA Baccarat</div>
        <button class="icon-btn" id="btn-settings" title="Settings">⚙️</button>
      </div>
      <div class="info-bar">
        <div class="info-chip"><div class="val" id="home-stars">0</div><div class="lbl">Stars</div></div>
        <div class="info-chip"><div class="val" id="home-level">Lv.1</div><div class="lbl">Level</div></div>
        <div class="info-chip"><div class="val" id="home-wins">0W</div><div class="lbl">Wins</div></div>
        <div class="info-chip"><div class="val" id="home-streak">0</div><div class="lbl">Streak</div></div>
      </div>
      <div class="daily-banner" id="daily-claim">
        <div class="daily-icon">📅</div>
        <div class="daily-info">
          <div class="daily-title" id="daily-title">Daily Check-in</div>
          <div class="daily-sub">+${DAILY_BONUS_STAR}⭐</div>
        </div>
        <div style="font-size:22px">▸</div>
      </div>
      <div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;gap:0;">
        <button class="menu-btn" id="btn-play">
          <div class="mb-icon">🎰</div>
          <div class="mb-text">
            <div class="mb-title">Play Baccarat</div>
            <div class="mb-sub">Classic Punto Banco • Bet & Deal</div>
          </div>
          <div class="mb-arrow">›</div>
        </button>
        <button class="menu-btn" id="btn-online">
          <div class="mb-icon">🌐</div>
          <div class="mb-text">
            <div class="mb-title">Online Table</div>
            <div class="mb-sub">Join or create a live table</div>
          </div>
          <div class="mb-arrow">›</div>
        </button>
      </div>
      <div class="footer-nav">
        <button class="fnav on" data-nav="home"><span class="i">🏠</span><span>Home</span></button>
        <button class="fnav" data-nav="rank"><span class="i">🏆</span><span>Ranking</span></button>
        <button class="fnav" data-nav="shop"><span class="i">🛍️</span><span>Shop</span></button>
        <button class="fnav" data-nav="mission"><span class="i">📋</span><span>Mission</span></button>
        <button class="fnav" data-nav="profile"><span class="i">👤</span><span>Profile</span></button>
      </div>
    </section>

    <!-- ========== GAME ========== -->
    <section class="screen" id="sc-game">
      <div class="game-top">
        <button class="icon-btn" id="ga-back">←</button>
        <div class="game-stars" id="ga-stars">⭐ 0</div>
        <div class="game-info" id="ga-shoe">Shoe: 416</div>
      </div>
      <div class="road-area" id="road-map"></div>
      <div class="table-area" id="table-area">
        <div class="hand-label banker-lbl">BANKER</div>
        <div class="cards-row" id="banker-cards"></div>
        <div class="score-badge" id="banker-score">-</div>
        <div id="result-display" style="min-height:50px;display:flex;align-items:center;justify-content:center;"></div>
        <div class="score-badge" id="player-score">-</div>
        <div class="cards-row" id="player-cards"></div>
        <div class="hand-label player-lbl">PLAYER</div>
      </div>
      <div class="bet-area" id="bet-area">
        <div class="chip-row" id="chip-selector">
          <button class="chip-btn chip-50 on" data-val="50">50</button>
          <button class="chip-btn chip-100" data-val="100">100</button>
          <button class="chip-btn chip-500" data-val="500">500</button>
          <button class="chip-btn chip-1k" data-val="1000">1K</button>
          <button class="chip-btn chip-5k" data-val="5000">5K</button>
          <button class="chip-btn chip-10k" data-val="10000">10K</button>
        </div>
        <div class="bet-options" id="bet-options">
          <button class="bet-btn" data-bet="player">
            PLAYER<span class="bet-multi">×2</span>
          </button>
          <button class="bet-btn" data-bet="tie">
            TIE<span class="bet-multi">×9</span>
          </button>
          <button class="bet-btn" data-bet="banker">
            BANKER<span class="bet-multi">×1.95</span>
          </button>
        </div>
        <button class="deal-btn" id="deal-btn" disabled>DEAL</button>
      </div>
    </section>

    <!-- ========== PROFILE ========== -->
    <section class="screen" id="sc-profile">
      <div class="topbar">
        <button class="icon-btn" data-back>←</button>
        <div class="brand-name" style="text-align:center;flex:1" id="prof-title">Profile</div>
        <div style="width:38px"></div>
      </div>
      <div class="prof-card">
        <div class="prof-avatar" id="prof-avatar">🃏</div>
        <div class="prof-name" id="prof-name">Player</div>
        <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:4px">
          <span id="lv-badge">Lv.1</span> · <span id="lv-xp">0 / 100 XP</span>
        </div>
      </div>
      <div id="prof-stats" style="flex:1;overflow-y:auto"></div>
      <div style="padding:10px 0">
        <div class="sett-row">
          <span>Edit Nickname</span>
          <button class="btn btn-small btn-ghost" id="btn-rename">Edit</button>
        </div>
        <div class="sett-row">
          <span>Reset Stats & Ranking</span>
          <button class="btn btn-danger btn-small" id="btn-reset">Reset</button>
        </div>
      </div>
    </section>

    <!-- ========== RANK ========== -->
    <section class="screen" id="sc-rank">
      <div class="topbar">
        <button class="icon-btn" data-back>←</button>
        <div class="brand-name" style="text-align:center;flex:1">🏆 Ranking</div>
        <button class="icon-btn" id="btn-rank-refresh" title="Refresh">🔄</button>
      </div>
      <div class="tabs">
        <button class="tab on" data-tab="total">Total Rank</button>
        <button class="tab" data-tab="weekly">Weekly TOP 7</button>
        <button class="tab" data-tab="prev">Last Week TOP 7</button>
      </div>
      <div id="rank-reset-info" style="text-align:center;font-size:11px;color:rgba(255,255,255,.78);margin:4px 0 6px;font-weight:700"></div>
      <div class="rank-list" id="rank-list"></div>
    </section>

    <!-- ========== SHOP ========== -->
    <section class="screen" id="sc-shop">
      <div class="topbar">
        <button class="icon-btn" data-back>←</button>
        <div class="brand-name" style="text-align:center;flex:1">🛍️ Shop</div>
        <div style="width:38px"></div>
      </div>
      <div class="tabs" id="shop-tabs">
        <button class="tab on" data-stab="avatar">Avatars</button>
        <button class="tab" data-stab="table">Tables</button>
        <button class="tab" data-stab="cardback">Card Backs</button>
      </div>
      <div class="rank-list" id="shop-list"></div>
    </section>

    <!-- ========== MISSION ========== -->
    <section class="screen" id="sc-mission">
      <div class="topbar">
        <button class="icon-btn" data-back>←</button>
        <div class="brand-name" style="text-align:center;flex:1">📋 Missions & Achievements</div>
        <div style="width:38px"></div>
      </div>
      <div class="tabs" id="mission-tabs">
        <button class="tab on" data-mtab="daily">Daily Missions</button>
        <button class="tab" data-mtab="achieve">Achievements</button>
      </div>
      <div class="rank-list" id="mission-list"></div>
    </section>

    <!-- ========== SETTINGS ========== -->
    <section class="screen" id="sc-settings">
      <div class="topbar">
        <button class="icon-btn" data-back>←</button>
        <div class="brand-name" style="text-align:center;flex:1">⚙️ Settings</div>
        <div style="width:38px"></div>
      </div>
      <div style="flex:1;overflow-y:auto">
        <div class="sett-row"><span>Sound</span><button class="toggle on" data-sett="sound"></button></div>
        <div class="sett-row"><span>Vibration</span><button class="toggle on" data-sett="vibrate"></button></div>
        <div class="sett-row"><span>Speed Deal</span><button class="toggle" data-sett="speed"></button></div>
      </div>
    </section>

    <!-- ========== TUTORIAL ========== -->
    <section class="screen" id="sc-tutorial">
      <div class="topbar">
        <button class="icon-btn" data-back>←</button>
        <div class="brand-name" style="text-align:center;flex:1">📖 How to Play</div>
        <div style="width:38px"></div>
      </div>
      <div style="flex:1;overflow-y:auto;padding:0 4px;">
        <div style="background:rgba(255,255,255,.05);border-radius:16px;padding:16px;margin-bottom:10px;border:1px solid rgba(255,255,255,.08);">
          <div style="font-size:13px;font-weight:800;margin-bottom:6px;color:var(--gold);">🎴 Punto Banco Baccarat</div>
          <div style="font-size:12px;color:rgba(255,255,255,.7);line-height:1.5;">
            Baccarat is a card game where you bet on which hand—Player or Banker—will have a total closest to 9. You can also bet on a Tie. Cards are dealt automatically following strict rules.
          </div>
        </div>
        <div style="background:rgba(255,255,255,.05);border-radius:16px;padding:16px;margin-bottom:10px;border:1px solid rgba(255,255,255,.08);">
          <div style="font-size:13px;font-weight:800;margin-bottom:6px;color:var(--gold);">🔢 Card Values</div>
          <div style="font-size:12px;color:rgba(255,255,255,.7);line-height:1.5;">
            Ace = 1 point. 2–9 = face value. 10, J, Q, K = 0 points. Only the last digit of the total counts. Example: 7 + 8 = 15 → score is 5.
          </div>
        </div>
        <div style="background:rgba(255,255,255,.05);border-radius:16px;padding:16px;margin-bottom:10px;border:1px solid rgba(255,255,255,.08);">
          <div style="font-size:13px;font-weight:800;margin-bottom:6px;color:var(--gold);">📋 Third Card Rules</div>
          <div style="font-size:12px;color:rgba(255,255,255,.7);line-height:1.5;">
            If Player or Banker has 8 or 9 (Natural), no more cards are drawn. Player stands on 6–7, draws on 0–5. Banker's draw depends on their total and the Player's third card.
          </div>
        </div>
        <div style="background:rgba(255,255,255,.05);border-radius:16px;padding:16px;margin-bottom:10px;border:1px solid rgba(255,255,255,.08);">
          <div style="font-size:13px;font-weight:800;margin-bottom:6px;color:var(--gold);">💰 Payouts</div>
          <div style="font-size:12px;color:rgba(255,255,255,.7);line-height:1.5;">
            Player bet pays 2×. Banker bet pays 1.95× (5% commission). Tie bet pays 9×.
          </div>
        </div>
      </div>
    </section>

    <!-- RESULT MODAL -->
    <div class="modal" id="modal-result">
      <div class="modal-card">
        <h2 id="mr-title">🏆 Win!</h2>
        <p id="mr-desc">Nice!</p>
        <div class="modal-rewards" id="mr-rewards">
          <div class="reward-chip" id="mr-stars">+0</div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" id="mr-home">Home</button>
        </div>
      </div>
    </div>

    <!-- CONFIRM MODAL -->
    <div class="modal" id="modal-confirm">
      <div class="modal-card">
        <h2 id="mc-title">Are you sure?</h2>
        <p id="mc-desc">This action cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn btn-primary" id="mc-ok">OK</button>
          <button class="btn btn-ghost" id="mc-cancel">Cancel</button>
        </div>
      </div>
    </div>

    <div id="toast"></div>
    <div id="particles" style="position:absolute;inset:0;pointer-events:none;z-index:150;overflow:hidden"></div>
    </div>
  `;

  /* ═══════════════════════════════════════════════════════════════════════
     MOUNT
     ═══════════════════════════════════════════════════════════════════════ */
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  const root = document.createElement('div');
  root.id = 'kk-root';
  root.innerHTML = HTML;
  document.body.appendChild(root);
  const $ = sel => root.querySelector(sel);
  const $$ = sel => root.querySelectorAll(sel);

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     AUDIO
     ═══════════════════════════════════════════════════════════════════════ */
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    return audioCtx;
  }
  function beep(freq = 500, dur = 0.08, type = 'sine', gain = 0.1) {
    if (!settings.sound) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = gain;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.stop(ctx.currentTime + dur + 0.01);
    } catch {}
  }
  function playTap() { beep(780, 0.05, 'square', 0.22); }
  function playCoin() { beep(1040, 0.08, 'sine', 0.15); setTimeout(() => beep(1380, 0.1, 'sine', 0.12), 70); }
  function playCardFlip() { beep(2200, 0.03, 'sine', 0.18); setTimeout(() => beep(1800, 0.02, 'sine', 0.12), 40); }
  function playWin() { [523,659,784,1046].forEach((f,i) => setTimeout(() => beep(f, 0.15, 'sine', 0.12), i * 100)); }
  function playLose() { beep(220, 0.3, 'sawtooth', 0.08); }

  function vibrate(ms) {
    if (!settings.vibrate) return;
    try { navigator.vibrate && navigator.vibrate(ms); } catch {}
  }

  const toast = (msg, ms = 1800) => {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), ms);
  };

  function popupAlert(title, message) {
    const existing = document.getElementById('fa-popup-alert');
    if (existing) existing.remove();
    const dlg = document.createElement('div');
    dlg.id = 'fa-popup-alert';
    dlg.style.cssText = 'position:fixed;inset:0;background:rgba(5,8,16,.88);display:flex;align-items:center;justify-content:center;z-index:99999;backdrop-filter:blur(10px);animation:kk-fade .25s ease;';
    dlg.innerHTML =
      '<div style="background:linear-gradient(160deg,#0f1628,#1c2d5a);border-radius:24px;padding:28px 24px;width:min(88vw,340px);box-shadow:0 30px 80px rgba(0,0,0,.7);border:1px solid rgba(255,213,107,.4);color:#fff;text-align:center;">'
      + '<div style="font-size:40px;margin-bottom:8px;">⚠️</div>'
      + '<div style="font-size:19px;font-weight:900;margin-bottom:8px;color:#ffd56b;">' + escapeHtml(title || 'Notice') + '</div>'
      + '<div style="font-size:13.5px;color:rgba(255,255,255,.9);margin-bottom:20px;line-height:1.5;">' + escapeHtml(message || '') + '</div>'
      + '<button id="fa-popup-ok" style="width:100%;padding:14px;border:none;border-radius:14px;background:linear-gradient(135deg,#ffd56b,#ff9e3c);color:#3a1a00;font-weight:900;font-size:15px;cursor:pointer;">OK</button>'
      + '</div>';
    document.body.appendChild(dlg);
    const close = () => { try { dlg.remove(); } catch {} };
    dlg.querySelector('#fa-popup-ok').addEventListener('click', close);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    beep(440, 0.12, 'square', 0.22);
  }

  function confirmModal(title, desc, onOk) {
    $('#mc-title').textContent = title;
    $('#mc-desc').textContent = desc;
    $('#modal-confirm').classList.add('active');
    const ok = $('#mc-ok');
    const cancel = $('#mc-cancel');
    const close = () => {
      $('#modal-confirm').classList.remove('active');
      ok.replaceWith(ok.cloneNode(true));
      cancel.replaceWith(cancel.cloneNode(true));
    };
    ok.addEventListener('click', () => { close(); onOk(); }, { once: true });
    cancel.addEventListener('click', close, { once: true });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     PERSISTENCE
     ═══════════════════════════════════════════════════════════════════════ */
  const storeLoad = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const storeSave = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} };

  /* ═══════════════════════════════════════════════════════════════════════
     TIME & WEEK
     ═══════════════════════════════════════════════════════════════════════ */
  const nextWeeklyReset = (d = new Date()) => {
    const t = new Date(d.getTime());
    const day = t.getDay();
    const next = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 12, 0, 0, 0);
    let add = (6 - day + 7) % 7;
    if (add === 0 && t.getTime() >= next.getTime()) add = 7;
    next.setDate(next.getDate() + add);
    return next;
  };
  const formatResetMsg = (d = new Date()) => {
    const n = nextWeeklyReset(d);
    const pad = x => String(x).padStart(2, '0');
    return 'Weekly reset · ' + (n.getMonth() + 1) + '/' + n.getDate() + ' (Sat) ' + pad(n.getHours()) + ':' + pad(n.getMinutes());
  };
  const weekKey = (d = new Date()) => {
    const anchor = new Date(2024, 0, 6, 12, 0, 0).getTime();
    const diff = d.getTime() - anchor;
    return 'WK' + Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
  };
  const dayKey = (d = new Date()) => {
    const pad = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };

  /* ═══════════════════════════════════════════════════════════════════════
     PROFILE & SETTINGS
     ═══════════════════════════════════════════════════════════════════════ */
  const defaultProfile = () => ({
    id: 'me',
    nickname: 'Player' + Math.floor(Math.random() * 9000 + 1000),
    avatar: '🃏',
    stars: STARTING_STARS,
    xp: 0,
    totalWins: 0, totalLosses: 0, totalGames: 0,
    bestStreak: 0, currentStreak: 0,
    weeklyKey: weekKey(), weeklyWins: 0, weeklyGames: 0,
    prevWeekKey: '', prevWeekTotalWins: 0,
    naturalWins: 0, tieWins: 0,
    biggestWin: 0,
    equippedAvatar: 'avatar_ace',
    equippedTable: 'table_classic',
    equippedBack: 'back_red',
  });
  const defaultSettings = () => ({ sound: true, vibrate: true, speed: false });
  const defaultShop = () => {
    const o = {};
    SHOP_ITEMS.forEach(it => { if (it.price === 0) o[it.id] = true; });
    return o;
  };
  const levelFromXp = xp => {
    const v = Math.max(0, xp | 0);
    const lv = Math.min(300, Math.floor(v / 100) + 1);
    return { lv, cur: v % 100, need: 100 };
  };

  let profile = Object.assign(defaultProfile(), storeLoad(STORE_KEY) || {});
  let settings = Object.assign(defaultSettings(), storeLoad(SETTINGS_KEY) || {});
  let historyLog = storeLoad(HISTORY_KEY) || [];
  let missionState = storeLoad(MISSIONS_KEY) || { dayKey: dayKey(), missions: {}, claimed: {} };
  let achieveState = storeLoad(ACHIEVE_KEY) || {};
  let shopState = Object.assign(defaultShop(), storeLoad(SHOP_KEY) || {});
  let dailyState = storeLoad(DAILY_KEY) || { lastClaim: null };

  function checkWeeklyRollover() {
    if (profile.weeklyKey !== weekKey()) {
      profile.prevWeekTotalWins = profile.totalWins | 0;
      profile.prevWeekKey = profile.weeklyKey || '';
      profile.weeklyKey = weekKey();
      profile.weeklyWins = 0;
      profile.weeklyGames = 0;
      try { persist(); } catch {}
      return true;
    }
    return false;
  }
  checkWeeklyRollover();
  setInterval(() => {
    if (checkWeeklyRollover()) { try { renderRanks(); syncHome(); } catch {} }
    const info = document.getElementById('rank-reset-info');
    if (info) info.textContent = formatResetMsg();
  }, 30000);
  if (typeof profile.prevWeekTotalWins !== 'number') profile.prevWeekTotalWins = 0;
  if (missionState.dayKey !== dayKey()) {
    missionState = { dayKey: dayKey(), missions: {}, claimed: {} };
  }

  function persist() {
    storeSave(STORE_KEY, profile);
    storeSave(SETTINGS_KEY, settings);
    storeSave(HISTORY_KEY, historyLog.slice(0, 100));
    storeSave(MISSIONS_KEY, missionState);
    storeSave(ACHIEVE_KEY, achieveState);
    storeSave(SHOP_KEY, shopState);
    storeSave(DAILY_KEY, dailyState);
    upsertRank();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     RANK TABLE
     ═══════════════════════════════════════════════════════════════════════ */
  function loadRanks() { return storeLoad(RANK_KEY) || []; }
  function saveRanks(arr) { storeSave(RANK_KEY, arr); }

  function seedBotsIfNeeded() {
    const ranks = loadRanks();
    if (ranks.some(r => r.id && r.id.startsWith('bot'))) return ranks;
    const wk = weekKey();
    BOT_NAMES.forEach((n, i) => {
      const rarity = Math.random();
      const base = rarity > 0.85 ? 200 : rarity > 0.5 ? 100 : 40;
      const w = base + Math.floor(Math.random() * 80);
      const l = Math.floor(w * (0.4 + Math.random() * 0.5));
      const ww = Math.floor(Math.random() * 30);
      const avatarPool = ['👑','💎','🔥','⭐','🐉','🚀','💰','🎰','🃏','♠️','♥️','♦️'];
      ranks.push({
        id: 'bot' + i,
        nickname: n,
        avatar: avatarPool[i % avatarPool.length],
        totalWins: w, totalLosses: l, totalGames: w + l,
        weeklyKey: wk, weeklyWins: ww, weeklyGames: ww + Math.floor(Math.random() * 10),
        prevWeekTotalWins: Math.floor(w * 0.7),
      });
    });
    saveRanks(ranks);
    return ranks;
  }

  function upsertRank() {
    const ranks = seedBotsIfNeeded();
    const idx = ranks.findIndex(r => r.id === 'me');
    const entry = {
      id: 'me',
      nickname: profile.nickname,
      avatar: SHOP_ITEMS.find(i => i.id === profile.equippedAvatar)?.emoji || '🃏',
      totalWins: profile.totalWins,
      totalLosses: profile.totalLosses,
      totalGames: profile.totalGames,
      weeklyKey: profile.weeklyKey,
      weeklyWins: profile.weeklyWins,
      weeklyGames: profile.weeklyGames,
      prevWeekTotalWins: profile.prevWeekTotalWins || 0,
    };
    if (idx >= 0) ranks[idx] = entry; else ranks.push(entry);
    saveRanks(ranks);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     NAVIGATION
     ═══════════════════════════════════════════════════════════════════════ */
  let currentScreen = 'sc-home';
  function show(id) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    const s = $('#' + id);
    if (s) s.classList.add('active');
    currentScreen = id;
    if (id === 'sc-rank') renderRanks();
    if (id === 'sc-profile') renderProfile();
    if (id === 'sc-shop') renderShop();
    if (id === 'sc-mission') renderMissions();
  }

  $$('[data-back]').forEach(b => b.addEventListener('click', () => { playTap(); show('sc-home'); syncHome(); }));
  $$('[data-nav]').forEach(b => b.addEventListener('click', () => {
    playTap();
    $$('.fnav').forEach(f => f.classList.remove('on'));
    b.classList.add('on');
    const nav = b.dataset.nav;
    const map = { home: 'sc-home', rank: 'sc-rank', shop: 'sc-shop', mission: 'sc-mission', profile: 'sc-profile' };
    show(map[nav] || 'sc-home');
    syncHome();
  }));

  /* ═══════════════════════════════════════════════════════════════════════
     SYNC HOME
     ═══════════════════════════════════════════════════════════════════════ */
  function syncHome() {
    const lv = levelFromXp(profile.xp);
    $('#home-stars').textContent = (profile.stars | 0).toLocaleString();
    $('#home-level').textContent = 'Lv.' + lv.lv;
    $('#home-wins').textContent = (profile.totalWins | 0) + 'W';
    $('#home-streak').textContent = (profile.currentStreak | 0);
    $('#ga-stars').textContent = '⭐ ' + (profile.stars | 0).toLocaleString();
    const today = dayKey();
    if (dailyState.lastClaim === today) {
      $('#daily-title').textContent = '✅ Claimed today';
    } else {
      $('#daily-title').textContent = 'Daily Check-in';
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     DAILY CHECKIN
     ═══════════════════════════════════════════════════════════════════════ */
  $('#daily-claim').addEventListener('click', () => {
    playTap();
    const today = dayKey();
    if (dailyState.lastClaim === today) { toast('Already claimed today!'); return; }
    dailyState.lastClaim = today;
    profile.stars += DAILY_BONUS_STAR;
    playCoin();
    persist();
    syncHome();
    toast('+' + DAILY_BONUS_STAR + '⭐');
  });

  /* ═══════════════════════════════════════════════════════════════════════
     SETTINGS
     ═══════════════════════════════════════════════════════════════════════ */
  function reflectSettings() {
    $$('.toggle[data-sett]').forEach(t => {
      t.classList.toggle('on', !!settings[t.dataset.sett]);
    });
  }
  $$('.toggle[data-sett]').forEach(t => {
    t.addEventListener('click', () => {
      playTap();
      settings[t.dataset.sett] = !settings[t.dataset.sett];
      reflectSettings();
      persist();
    });
  });
  $('#btn-settings').addEventListener('click', () => { playTap(); show('sc-settings'); });

  /* ═══════════════════════════════════════════════════════════════════════
     BACCARAT ENGINE — 8-Deck Shoe, Punto Banco Rules
     ═══════════════════════════════════════════════════════════════════════ */
  let shoe = [];
  let selectedChip = 50;
  let currentBet = null;
  let betAmount = 0;
  let gameRoad = [];
  let dealing = false;

  function buildShoe() {
    shoe = [];
    for (let d = 0; d < 8; d++) {
      for (let s = 0; s < 4; s++) {
        for (let r = 0; r < 13; r++) {
          shoe.push({ rank: RANKS[r], suit: SUITS[s], value: VALUES[r] });
        }
      }
    }
    // Fisher-Yates shuffle
    for (let i = shoe.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
    }
    updateShoeCount();
  }

  function drawCard() {
    if (shoe.length < 6) buildShoe();
    return shoe.pop();
  }

  function handScore(cards) {
    return cards.reduce((s, c) => s + c.value, 0) % 10;
  }

  function updateShoeCount() {
    const el = $('#ga-shoe');
    if (el) el.textContent = 'Shoe: ' + shoe.length;
  }

  function isNatural(score) { return score >= 8; }

  // Punto Banco third card rules
  function shouldPlayerDraw(pScore) {
    return pScore <= 5;
  }

  function shouldBankerDraw(bScore, playerThirdValue) {
    if (playerThirdValue === null) return bScore <= 5; // player stood
    if (bScore <= 2) return true;
    if (bScore === 3) return playerThirdValue !== 8;
    if (bScore === 4) return playerThirdValue >= 2 && playerThirdValue <= 7;
    if (bScore === 5) return playerThirdValue >= 4 && playerThirdValue <= 7;
    if (bScore === 6) return playerThirdValue === 6 || playerThirdValue === 7;
    return false; // 7 = stand
  }

  /* ═══════════════════════════════════════════════════════════════════════
     CARD RENDERING
     ═══════════════════════════════════════════════════════════════════════ */
  function cardHTML(card, delay = 0) {
    const isRed = card.suit === '♥' || card.suit === '♦';
    return `<div class="card ${isRed ? 'red' : ''}" style="animation-delay:${delay}ms">
      <div class="card-rank">${card.rank}</div>
      <div class="card-suit">${card.suit}</div>
    </div>`;
  }

  function renderHand(containerId, cards) {
    const el = $('#' + containerId);
    el.innerHTML = cards.map((c, i) => cardHTML(c, i * 300)).join('');
  }

  /* ═══════════════════════════════════════════════════════════════════════
     CHIP & BET SELECTION
     ═══════════════════════════════════════════════════════════════════════ */
  $$('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playTap();
      selectedChip = Number(btn.dataset.val);
      $$('.chip-btn').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
    });
  });

  $$('.bet-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playTap();
      const bet = btn.dataset.bet;
      if (currentBet === bet) {
        // deselect
        currentBet = null;
        betAmount = 0;
        $$('.bet-btn').forEach(b => { b.classList.remove('on-player','on-banker','on-tie'); });
      } else {
        currentBet = bet;
        betAmount = selectedChip;
        $$('.bet-btn').forEach(b => { b.classList.remove('on-player','on-banker','on-tie'); });
        btn.classList.add('on-' + bet);
      }
      updateDealBtn();
    });
  });

  function updateDealBtn() {
    const btn = $('#deal-btn');
    if (!currentBet || betAmount <= 0 || dealing) {
      btn.disabled = true;
      btn.textContent = 'DEAL';
    } else {
      btn.disabled = false;
      btn.textContent = 'DEAL · ' + betAmount.toLocaleString() + '⭐';
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     GAME FLOW
     ═══════════════════════════════════════════════════════════════════════ */
  function resetTable() {
    $('#player-cards').innerHTML = '';
    $('#banker-cards').innerHTML = '';
    $('#player-score').textContent = '-';
    $('#banker-score').textContent = '-';
    $('#result-display').innerHTML = '';
    currentBet = null;
    betAmount = 0;
    dealing = false;
    $$('.bet-btn').forEach(b => { b.classList.remove('on-player','on-banker','on-tie'); });
    updateDealBtn();
    updateShoeCount();
  }

  $('#deal-btn').addEventListener('click', async () => {
    if (!currentBet || dealing) return;
    const amt = selectedChip;
    if ((profile.stars | 0) < amt) {
      popupAlert('Not enough stars', 'You need ' + amt.toLocaleString() + '⭐. You have ' + (profile.stars | 0).toLocaleString() + '⭐.');
      return;
    }

    dealing = true;
    updateDealBtn();
    profile.stars -= amt;
    syncHome();
    persist();

    const bet = currentBet;
    const spd = settings.speed ? 200 : 500;

    // Draw initial 4 cards
    const pCards = [drawCard(), drawCard()];
    const bCards = [drawCard(), drawCard()];

    // Show player cards
    playCardFlip();
    renderHand('player-cards', [pCards[0]]);
    await delay(spd);
    playCardFlip();
    renderHand('banker-cards', [bCards[0]]);
    await delay(spd);
    playCardFlip();
    renderHand('player-cards', pCards);
    await delay(spd);
    playCardFlip();
    renderHand('banker-cards', bCards);
    await delay(spd);

    let pScore = handScore(pCards);
    let bScore = handScore(bCards);
    $('#player-score').textContent = pScore;
    $('#banker-score').textContent = bScore;
    await delay(spd);

    let playerThirdValue = null;
    const isNat = isNatural(pScore) || isNatural(bScore);

    if (!isNat) {
      // Player third card
      if (shouldPlayerDraw(pScore)) {
        const p3 = drawCard();
        pCards.push(p3);
        playerThirdValue = p3.value;
        playCardFlip();
        renderHand('player-cards', pCards);
        pScore = handScore(pCards);
        $('#player-score').textContent = pScore;
        await delay(spd);
      }
      // Banker third card
      if (shouldBankerDraw(bScore, playerThirdValue)) {
        const b3 = drawCard();
        bCards.push(b3);
        playCardFlip();
        renderHand('banker-cards', bCards);
        bScore = handScore(bCards);
        $('#banker-score').textContent = bScore;
        await delay(spd);
      }
    }

    // Determine winner
    let winner;
    if (pScore > bScore) winner = BET_PLAYER;
    else if (bScore > pScore) winner = BET_BANKER;
    else winner = BET_TIE;

    // Road
    gameRoad.push(winner);
    renderRoad();

    // Calculate payout
    let winnings = 0;
    let resultClass = 'lose';
    let resultText = '';
    const natText = isNat ? ' (Natural!)' : '';

    if (bet === winner) {
      winnings = Math.floor(amt * PAYOUT[bet]);
      profile.stars += winnings;
      resultClass = 'win';
      if (winner === BET_TIE) resultText = '🎉 TIE WINS! +' + winnings.toLocaleString() + '⭐' + natText;
      else if (winner === BET_PLAYER) resultText = '🔴 PLAYER WINS! +' + winnings.toLocaleString() + '⭐' + natText;
      else resultText = '🔵 BANKER WINS! +' + winnings.toLocaleString() + '⭐' + natText;
      playWin();
      vibrate(30);
      profile.totalWins++;
      profile.weeklyWins++;
      profile.currentStreak++;
      if (profile.currentStreak > profile.bestStreak) profile.bestStreak = profile.currentStreak;
      if (winnings > (profile.biggestWin || 0)) profile.biggestWin = winnings;
      if (isNat && (pScore === 9 || bScore === 9)) profile.naturalWins = (profile.naturalWins | 0) + 1;
      if (winner === BET_TIE) profile.tieWins = (profile.tieWins | 0) + 1;
      profile.xp += 20;
    } else if (winner === BET_TIE && bet !== BET_TIE) {
      // Tie when you bet Player/Banker = push (refund)
      profile.stars += amt;
      resultClass = 'tie-result';
      resultText = '🟢 TIE — Bet Returned' + natText;
      beep(440, 0.1, 'sine', 0.1);
    } else {
      resultClass = 'lose';
      if (winner === BET_PLAYER) resultText = '🔴 PLAYER WINS' + natText;
      else if (winner === BET_BANKER) resultText = '🔵 BANKER WINS' + natText;
      else resultText = '🟢 TIE' + natText;
      resultText += ' — You lost ' + amt.toLocaleString() + '⭐';
      playLose();
      profile.totalLosses++;
      profile.currentStreak = 0;
      profile.xp += 5;
    }

    profile.totalGames++;
    profile.weeklyGames++;
    updateDailyMissions(bet === winner);
    checkAchievements();

    const resEl = $('#result-display');
    resEl.innerHTML = `<div class="result-banner ${resultClass}">${resultText}</div>`;

    historyLog.unshift({
      at: Date.now(),
      bet, winner,
      amount: amt,
      winnings: bet === winner ? winnings : (winner === BET_TIE && bet !== BET_TIE ? 0 : -amt),
      pScore, bScore,
      isNatural: isNat,
    });

    persist();
    syncHome();
    updateShoeCount();

    // Auto-reset after delay
    setTimeout(() => {
      resetTable();
    }, settings.speed ? 1800 : 2800);
  });

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  function renderRoad() {
    const el = $('#road-map');
    el.innerHTML = gameRoad.slice(-40).map(w => {
      const cls = w === BET_PLAYER ? 'rd-p' : w === BET_BANKER ? 'rd-b' : 'rd-t';
      const label = w === BET_PLAYER ? 'P' : w === BET_BANKER ? 'B' : 'T';
      return `<div class="road-dot ${cls}">${label}</div>`;
    }).join('');
  }

  /* ═══════════════════════════════════════════════════════════════════════
     START GAME
     ═══════════════════════════════════════════════════════════════════════ */
  $('#btn-play').addEventListener('click', () => {
    playTap();
    if (shoe.length < 52) buildShoe();
    resetTable();
    show('sc-game');
    syncHome();
  });

  $('#ga-back').addEventListener('click', () => {
    playTap();
    dealing = false;
    show('sc-home');
    syncHome();
  });

  /* ═══════════════════════════════════════════════════════════════════════
     DAILY MISSIONS
     ═══════════════════════════════════════════════════════════════════════ */
  const DAILY_DEFS = [
    { id: 'play3',  name: 'Play 3 hands',   desc: 'Play 3 baccarat hands', target: 3, star: 50,  getVal: m => m.plays || 0 },
    { id: 'play10', name: 'Play 10 hands',  desc: 'Play 10 baccarat hands', target: 10, star: 120, getVal: m => m.plays || 0 },
    { id: 'win3',   name: 'Win 3 hands',    desc: 'Win 3 hands',            target: 3, star: 80,  getVal: m => m.wins || 0 },
    { id: 'win7',   name: 'Win 7 hands',    desc: 'Win 7 hands',            target: 7, star: 200, getVal: m => m.wins || 0 },
    { id: 'banker3',name: '3 Banker wins',   desc: 'Win 3 Banker bets',      target: 3, star: 100, getVal: m => m.bankerWins || 0 },
    { id: 'streak3',name: '3 in a row',      desc: 'Win 3 hands in a row',   target: 3, star: 150, getVal: m => m.streak || 0 },
  ];

  function updateDailyMissions(won) {
    if (!missionState.missions) missionState.missions = {};
    const m = missionState.missions;
    m.plays = (m.plays || 0) + 1;
    if (won) {
      m.wins = (m.wins || 0) + 1;
      m.streak = (m.streak || 0) + 1;
    } else {
      m.streak = 0;
    }
  }

  function checkAchievements() {
    ACHIEVE_DEFS.forEach(a => {
      if (achieveState[a.id]) return;
      const val = profile[a.key] || 0;
      if (val >= a.target) {
        achieveState[a.id] = true;
        profile.stars += a.star;
        toast('🏅 ' + a.name + ' +' + a.star + '⭐');
        playCoin();
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER: PROFILE
     ═══════════════════════════════════════════════════════════════════════ */
  function renderProfile() {
    const lv = levelFromXp(profile.xp);
    const av = SHOP_ITEMS.find(i => i.id === profile.equippedAvatar);
    $('#prof-avatar').textContent = av?.emoji || '🃏';
    $('#prof-name').textContent = profile.nickname;
    $('#lv-badge').textContent = 'Lv.' + lv.lv;
    $('#lv-xp').textContent = lv.cur + ' / ' + lv.need + ' XP';
    const body = $('#prof-stats');
    const rows = [
      ['Stars', (profile.stars | 0).toLocaleString()],
      ['Total Wins', profile.totalWins],
      ['Total Losses', profile.totalLosses],
      ['Total Games', profile.totalGames],
      ['Best Streak', profile.bestStreak],
      ['Current Streak', profile.currentStreak],
      ['Weekly Wins', profile.weeklyWins],
      ['Natural Wins', profile.naturalWins || 0],
      ['Tie Wins', profile.tieWins || 0],
      ['Biggest Win', (profile.biggestWin || 0).toLocaleString() + '⭐'],
    ];
    body.innerHTML = rows.map(([k, v]) =>
      `<div class="prof-row"><span class="k">${k}</span><span class="v">${v}</span></div>`
    ).join('');
  }

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER: RANK
     ═══════════════════════════════════════════════════════════════════════ */
  let rankTab = 'total';
  function renderRanks() {
    try { checkWeeklyRollover(); } catch {}
    const ranks = seedBotsIfNeeded();
    const wk = weekKey();
    const info = $('#rank-reset-info');
    if (info) info.textContent = formatResetMsg();
    let list;
    if (rankTab === 'weekly') {
      list = ranks
        .filter(r => r.weeklyKey === wk && (r.weeklyWins || 0) > 0)
        .sort((a, b) => (b.weeklyWins || 0) - (a.weeklyWins || 0))
        .slice(0, 7);
    } else if (rankTab === 'prev') {
      list = ranks
        .filter(r => (r.prevWeekTotalWins || 0) > 0)
        .sort((a, b) => (b.prevWeekTotalWins || 0) - (a.prevWeekTotalWins || 0))
        .slice(0, 7);
    } else {
      list = ranks.slice().sort((a, b) =>
        ((b.totalWins || 0) - (a.totalWins || 0)) || ((a.totalLosses || 0) - (b.totalLosses || 0))
      );
    }
    const el = $('#rank-list');
    if (!list.length) {
      el.innerHTML = '<div class="empty-note">No ranked players yet<br/>Win a hand to get on the leaderboard!</div>';
      return;
    }
    el.innerHTML = list.slice(0, 50).map((r, i) => {
      const pos = i + 1;
      const cls = pos === 1 ? 'p1' : pos === 2 ? 'p2' : pos === 3 ? 'p3' : '';
      const label = pos <= 3 ? ['👑','🥈','🥉'][pos - 1] : pos;
      const me = r.id === 'me' ? 'me' : '';
      const primary = rankTab === 'weekly' ? ((r.weeklyWins || 0) + 'W')
                    : rankTab === 'prev' ? ((r.prevWeekTotalWins || 0) + 'W')
                    : ((r.totalWins || 0) + 'W');
      const sub = rankTab === 'weekly'
        ? 'This Week · ' + (r.weeklyWins || 0) + 'W'
        : rankTab === 'prev'
          ? 'Last Week · ' + (r.prevWeekTotalWins || 0) + 'W'
          : (r.totalWins || 0) + 'W / ' + (r.totalLosses || 0) + 'L';
      return `<div class="rank-item ${cls} ${me}">
        <div class="rank-pos">${label}</div>
        <div class="rank-avatar">${r.avatar || '🃏'}</div>
        <div class="rank-info">
          <div class="rank-name">${escapeHtml(r.nickname)}</div>
          <div class="rank-sub">${sub}</div>
        </div>
        <div class="rank-val">${primary}</div>
      </div>`;
    }).join('');
  }

  $$('.tab[data-tab]').forEach(t => {
    t.addEventListener('click', () => {
      playTap();
      $$('.tab[data-tab]').forEach(x => x.classList.remove('on'));
      t.classList.add('on');
      rankTab = t.dataset.tab;
      renderRanks();
    });
  });
  $('#btn-rank-refresh').addEventListener('click', () => { playTap(); renderRanks(); toast('Refreshed'); });

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER: SHOP
     ═══════════════════════════════════════════════════════════════════════ */
  let shopTab = 'avatar';
  function renderShop() {
    const items = SHOP_ITEMS.filter(i => i.type === shopTab);
    const el = $('#shop-list');
    el.innerHTML = items.map(it => {
      const owned = shopState[it.id];
      const equipped = (shopTab === 'avatar' && profile.equippedAvatar === it.id)
                    || (shopTab === 'table' && profile.equippedTable === it.id)
                    || (shopTab === 'cardback' && profile.equippedBack === it.id);
      const btnTxt = equipped ? '✅ Equipped' : owned ? 'Equip' : ('🔒 ' + it.price.toLocaleString() + '⭐');
      const btnCls = equipped ? 'btn-ghost' : owned ? 'btn-primary' : 'btn-ghost';
      return `<div class="rank-item" data-shop="${it.id}">
        <div class="rank-avatar">${it.emoji}</div>
        <div class="rank-info">
          <div class="rank-name">${escapeHtml(it.name)}</div>
          <div class="rank-sub">${it.type}</div>
        </div>
        <button class="btn btn-small ${btnCls}" data-shopbuy="${it.id}">${btnTxt}</button>
      </div>`;
    }).join('');

    el.querySelectorAll('[data-shopbuy]').forEach(btn => {
      btn.addEventListener('click', () => {
        playTap();
        const item = SHOP_ITEMS.find(i => i.id === btn.dataset.shopbuy);
        if (!item) return;
        if (!shopState[item.id]) {
          if ((profile.stars | 0) < item.price) {
            popupAlert('Not enough stars', 'You need ' + item.price.toLocaleString() + '⭐. You have ' + (profile.stars | 0).toLocaleString() + '⭐.');
            return;
          }
          profile.stars -= item.price;
          shopState[item.id] = true;
          playCoin();
          toast('Purchased ' + item.name);
        }
        if (item.type === 'avatar') profile.equippedAvatar = item.id;
        if (item.type === 'table') profile.equippedTable = item.id;
        if (item.type === 'cardback') profile.equippedBack = item.id;
        persist();
        syncHome();
        renderShop();
      });
    });
  }

  $$('[data-stab]').forEach(t => {
    t.addEventListener('click', () => {
      playTap();
      $$('[data-stab]').forEach(x => x.classList.remove('on'));
      t.classList.add('on');
      shopTab = t.dataset.stab;
      renderShop();
    });
  });

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER: MISSIONS
     ═══════════════════════════════════════════════════════════════════════ */
  let missionTab = 'daily';
  function renderMissions() {
    const el = $('#mission-list');
    if (missionTab === 'daily') {
      el.innerHTML = DAILY_DEFS.map(d => {
        const val = d.getVal(missionState.missions || {});
        const done = val >= d.target;
        const claimed = missionState.claimed && missionState.claimed[d.id];
        return `<div class="mission-item">
          <div class="mi-icon">${done ? '✅' : '📋'}</div>
          <div class="mi-info">
            <div class="mi-name">${d.name}</div>
            <div class="mi-desc">${d.desc}</div>
            <div class="mi-prog">${Math.min(val, d.target)} / ${d.target} · +${d.star}⭐</div>
          </div>
          <button class="mi-claim" data-mclaim="${d.id}" ${(!done || claimed) ? 'disabled' : ''}>${claimed ? 'Done' : 'Claim'}</button>
        </div>`;
      }).join('');
    } else {
      el.innerHTML = ACHIEVE_DEFS.map(a => {
        const val = profile[a.key] || 0;
        const done = achieveState[a.id];
        return `<div class="mission-item">
          <div class="mi-icon">${done ? '🏅' : '🎯'}</div>
          <div class="mi-info">
            <div class="mi-name">${a.name}</div>
            <div class="mi-desc">${a.desc}</div>
            <div class="mi-prog">${Math.min(val, a.target)} / ${a.target} · +${a.star}⭐</div>
          </div>
          <div style="font-size:12px;font-weight:800;color:${done ? 'var(--gold)' : 'rgba(255,255,255,.3)'};">${done ? '✅' : '🔒'}</div>
        </div>`;
      }).join('');
    }
    el.querySelectorAll('[data-mclaim]').forEach(btn => {
      btn.addEventListener('click', () => {
        playTap();
        const d = DAILY_DEFS.find(x => x.id === btn.dataset.mclaim);
        if (!d) return;
        if (!missionState.claimed) missionState.claimed = {};
        if (missionState.claimed[d.id]) return;
        missionState.claimed[d.id] = true;
        profile.stars += d.star;
        playCoin();
        toast('+' + d.star + '⭐');
        persist();
        syncHome();
        renderMissions();
      });
    });
  }

  $$('[data-mtab]').forEach(t => {
    t.addEventListener('click', () => {
      playTap();
      $$('[data-mtab]').forEach(x => x.classList.remove('on'));
      t.classList.add('on');
      missionTab = t.dataset.mtab;
      renderMissions();
    });
  });

  /* ═══════════════════════════════════════════════════════════════════════
     PROFILE ACTIONS
     ═══════════════════════════════════════════════════════════════════════ */
  $('#btn-rename').addEventListener('click', () => {
    playTap();
    const name = prompt('Enter new nickname:', profile.nickname);
    if (!name || !name.trim()) return;
    profile.nickname = name.trim().slice(0, 20);
    persist();
    syncHome();
    renderProfile();
    toast('Nickname updated');
  });

  $('#btn-reset').addEventListener('click', () => {
    confirmModal('Reset', 'This will reset your stats and ranking. Continue?', () => {
      profile = defaultProfile();
      historyLog = [];
      missionState = { dayKey: dayKey(), missions: {}, claimed: {} };
      achieveState = {};
      shopState = defaultShop();
      dailyState = { lastClaim: null };
      gameRoad = [];
      const ranks = loadRanks().filter(r => r.id !== 'me');
      saveRanks(ranks);
      persist();
      syncHome();
      toast('Reset complete');
    });
  });

  $('#mr-home').addEventListener('click', () => {
    playTap();
    $('#modal-result').classList.remove('active');
    show('sc-home');
    syncHome();
  });

  /* ═══════════════════════════════════════════════════════════════════════
     FIREBASE — Online Tables
     ═══════════════════════════════════════════════════════════════════════ */
  const Online = (() => {
    let db = null;
    function ready() {
      if (db) return db;
      try { db = firebase.database(); return db; } catch { return null; }
    }

    async function pushLeader() {
      const d = ready();
      if (!d) return;
      try {
        const uid = profile.id + '_' + profile.nickname.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
        await d.ref(FB_LEADER_PATH + '/' + uid).set({
          nickname: profile.nickname,
          avatar: SHOP_ITEMS.find(i => i.id === profile.equippedAvatar)?.emoji || '🃏',
          totalWins: profile.totalWins,
          totalLosses: profile.totalLosses,
          totalGames: profile.totalGames,
          weeklyKey: profile.weeklyKey || '',
          weeklyWins: profile.weeklyWins | 0,
          prevWeekTotalWins: profile.prevWeekTotalWins || 0,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        });
      } catch {}
    }

    async function touchPresence() {
      const d = ready();
      if (!d) return;
      try {
        const uid = profile.id + '_' + profile.nickname.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
        const ref = d.ref(FB_PRESENCE_PATH + '/' + uid);
        await ref.set({
          nickname: profile.nickname,
          avatar: SHOP_ITEMS.find(i => i.id === profile.equippedAvatar)?.emoji || '🃏',
          stars: profile.stars | 0,
          ts: firebase.database.ServerValue.TIMESTAMP,
        });
        ref.onDisconnect().remove();
      } catch {}
    }

    async function fetchPresence() {
      const d = ready();
      if (!d) return [];
      try {
        const snap = await d.ref(FB_PRESENCE_PATH).once('value');
        const val = snap.val() || {};
        const now = Date.now();
        return Object.entries(val)
          .filter(([, v]) => now - (v.ts || 0) < 300000)
          .map(([k, v]) => ({ id: k, nickname: v.nickname, avatar: v.avatar, stars: v.stars || 0 }));
      } catch { return []; }
    }

    async function fetchLeaders() {
      const d = ready();
      if (!d) return [];
      try {
        const snap = await d.ref(FB_LEADER_PATH).orderByChild('totalWins').limitToLast(50).once('value');
        const val = snap.val() || {};
        return Object.entries(val).map(([k, v]) => ({
          id: k,
          nickname: v.nickname || k,
          avatar: v.avatar || '🃏',
          totalWins: Number(v.totalWins || 0),
          totalLosses: Number(v.totalLosses || 0),
          totalGames: Number(v.totalGames || 0),
          weeklyKey: v.weeklyKey || '',
          weeklyWins: Number(v.weeklyWins || 0),
          prevWeekTotalWins: Number(v.prevWeekTotalWins || 0),
        }));
      } catch { return []; }
    }

    return { pushLeader, touchPresence, fetchPresence, fetchLeaders };
  })();

  // Online button
  $('#btn-online').addEventListener('click', async () => {
    playTap();
    toast('Online tables coming soon!');
    Online.touchPresence();
    Online.pushLeader();
  });

  // Periodic push
  setInterval(() => { try { Online.pushLeader(); } catch {} }, 60000);

  // Merge Firebase ranks
  async function mergeFirebaseRanks() {
    try {
      const remote = await Online.fetchLeaders();
      if (!remote.length) return;
      const local = seedBotsIfNeeded();
      remote.forEach(r => {
        if (r.nickname === profile.nickname) return;
        const idx = local.findIndex(l => l.id === r.id);
        if (idx >= 0) Object.assign(local[idx], r);
        else local.push(r);
      });
      saveRanks(local);
    } catch {}
  }
  setInterval(mergeFirebaseRanks, 15000);
  setTimeout(mergeFirebaseRanks, 3000);

  /* ═══════════════════════════════════════════════════════════════════════
     PARTICLES / CONFETTI
     ═══════════════════════════════════════════════════════════════════════ */
  function spawnConfetti() {
    const container = $('#particles');
    const colors = ['#ffd56b','#ff9e3c','#5aa9ff','#ff5a6a','#3ddc98','#fff'];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      const sz = 4 + Math.random() * 6;
      p.style.cssText = `position:absolute;width:${sz}px;height:${sz}px;border-radius:${Math.random()>.5?'50%':'2px'};background:${colors[i%colors.length]};left:${Math.random()*100}%;top:-10px;opacity:1;pointer-events:none;`;
      container.appendChild(p);
      const dur = 1200 + Math.random() * 1500;
      const drift = (Math.random() - 0.5) * 150;
      p.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${drift}px,${window.innerHeight + 50}px) rotate(${360 + Math.random()*360}deg)`, opacity: 0 },
      ], { duration: dur, easing: 'ease-in' });
      setTimeout(() => p.remove(), dur);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     GLOBAL TAP SOUND
     ═══════════════════════════════════════════════════════════════════════ */
  document.addEventListener('pointerdown', (e) => {
    try {
      const t = e.target;
      if (t && t.closest && t.closest('.card')) return;
      playTap();
    } catch {}
  }, true);

  /* ═══════════════════════════════════════════════════════════════════════
     BOOT
     ═══════════════════════════════════════════════════════════════════════ */
  function boot() {
    (function ensureViewport() {
      try {
        let vp = document.querySelector('meta[name="viewport"]');
        if (!vp) { vp = document.createElement('meta'); vp.name = 'viewport'; document.head.appendChild(vp); }
        vp.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
        const addMeta = (name, content) => {
          if (document.querySelector('meta[name="' + name + '"]')) return;
          const m = document.createElement('meta'); m.name = name; m.content = content; document.head.appendChild(m);
        };
        addMeta('mobile-web-app-capable', 'yes');
        addMeta('apple-mobile-web-app-capable', 'yes');
        addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
        addMeta('theme-color', '#0a0e1a');
        const hideBar = () => { try { window.scrollTo(0, 1); } catch {} };
        setTimeout(hideBar, 100);
        setTimeout(hideBar, 500);
        window.addEventListener('load', hideBar);
        window.addEventListener('orientationchange', () => setTimeout(hideBar, 300));
      } catch {}
    })();
    seedBotsIfNeeded();
    persist();
    reflectSettings();
    syncHome();
    show('sc-home');
    buildShoe();
    Online.touchPresence();
    Online.pushLeader();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
