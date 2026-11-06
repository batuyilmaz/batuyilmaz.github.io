/* btylmz — ortak betik: istatistik izni, Google Analytics, hafif mod */
(() => {
'use strict';

const GA_ID = 'G-B5N7JLQ6DZ';
const KEY = 'btylmz.consent';
const root = document.documentElement;
const ROOT_URL = (() => { try { return new URL('../', document.currentScript.src).href; } catch { return '/'; } })();

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* özel mod vb. */ } }
};

/* ==========================================================================
   Hafif mod: zayıf cihaz, veri tasarrufu ya da düşük kare hızında ağır efektleri kapatır.
   Deneme için adrese ?lite=1 (zorla aç) veya ?lite=0 (otomatik algılamayı kapat) eklenebilir.
   ========================================================================== */
(() => {
  const forced = new URLSearchParams(location.search).get('lite');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const weak = conn.saveData === true || (navigator.deviceMemory || 8) <= 2 || (navigator.hardwareConcurrency || 8) <= 2;
  if (forced === '1' || (forced !== '0' && weak)) { root.classList.add('lite'); return; }
  if (forced === '0' || reduce) return;

  // İlk 1,5 sn'yi atla, sonraki 90 karenin ortalamasına bak (28 ms ≈ 36 fps altı → hafif mod)
  const t0 = performance.now();
  let last = 0, sum = 0, n = 0;
  const tick = t => {
    if (document.hidden) { last = 0; requestAnimationFrame(tick); return; }
    if (last && t - t0 > 1500) { sum += t - last; n++; }
    last = t;
    if (n >= 90) { if (sum / n > 28) root.classList.add('lite'); return; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();

/* ==========================================================================
   Google Analytics: yalnızca izin verilirse yüklenir
   ========================================================================== */
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied'
});

let loaded = false;
let state = null; // 'granted' | 'denied' | null (henüz seçilmedi)

function clearGaCookies() {
  const names = document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => n === '_ga' || n.startsWith('_ga_'));
  if (!names.length) return;
  const parts = location.hostname.split('.');
  const scopes = [''];
  for (let i = 0; i < parts.length - 1; i++) {
    const d = parts.slice(i).join('.');
    scopes.push('; domain=' + d, '; domain=.' + d);
  }
  names.forEach(n => scopes.forEach(s => {
    document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + s + '; SameSite=Lax';
  }));
}

function startGA() {
  window['ga-disable-' + GA_ID] = false;
  gtag('consent', 'update', { analytics_storage: 'granted' });
  if (loaded) return;
  loaded = true;
  gtag('js', new Date());
  gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
  document.head.appendChild(s);
}

function stopGA() {
  window['ga-disable-' + GA_ID] = true;
  if (loaded) gtag('consent', 'update', { analytics_storage: 'denied' });
  clearGaCookies();
}

/* Titreşim (yalnızca Android/Chrome, kullanıcı sayfaya dokunduktan sonra, hareket azaltma kapalıysa) */
window.buzz = p => {
  try {
    if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive && !matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate(p);
  } catch { /* desteklenmiyor */ }
};

/* Olay gönderimi: izin yoksa sessizce hiçbir şey yapmaz */
window.track = (name, params) => {
  if (state === 'granted' && loaded) gtag('event', name, params || {});
};

/* ==========================================================================
   İzin bandı
   ========================================================================== */
let el = null;

function build() {
  el = document.createElement('section');
  el.className = 'cc';
  el.setAttribute('role', 'region');
  el.setAttribute('aria-label', 'İstatistik izni');
  el.innerHTML =
    '<p class="cc-title">İstatistik izni</p>' +
    '<p>Sayfanın kaç kişi tarafından görüldüğünü anlamak için Google Analytics kullanıyorum. İzin vermezsen hiçbir istatistik verisi toplanmaz ve Google\'a istek gönderilmez. Seçimini alttaki “Çerez tercihleri” bağlantısından istediğin zaman değiştirebilirsin. ' +
    '<a href="' + ROOT_URL + 'gizlilik">Aydınlatma metni</a></p>' +
    '<div class="cc-actions">' +
    '<button type="button" class="cc-btn" data-v="denied">Reddet</button>' +
    '<button type="button" class="cc-btn" data-v="granted">Kabul et</button>' +
    '</div>';
  el.addEventListener('click', e => {
    const b = e.target.closest('.cc-btn');
    if (b) choose(b.dataset.v);
  });
  document.body.appendChild(el);
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => root.style.setProperty('--cc-h', el.offsetHeight + 'px')).observe(el);
  }
}

function show(focus) {
  if (!el) build();
  el.querySelectorAll('.cc-btn').forEach(b => {
    if (state) b.setAttribute('aria-pressed', String(b.dataset.v === state));
    else b.removeAttribute('aria-pressed');
  });
  root.style.setProperty('--cc-h', el.offsetHeight + 'px');
  root.classList.add('consent-open');
  requestAnimationFrame(() => el.classList.add('show'));
  if (focus) el.querySelector('.cc-btn').focus({ preventScroll: true });
}

function hide() {
  if (!el) return;
  el.classList.remove('show');
  root.classList.remove('consent-open');
}

function choose(v) {
  state = v;
  store.set(KEY, v);
  if (v === 'granted') startGA(); else stopGA();
  hide();
}

/* Başlangıç durumu: kayıtlı seçim → yoksa GPC/DNT sinyali → yoksa sor */
const saved = store.get(KEY);
const optOut = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
state = saved === 'granted' || saved === 'denied' ? saved : (optOut ? 'denied' : null);
if (state === 'granted') startGA();
else if (state === null) setTimeout(() => { if (state === null) show(false); }, 1400);

document.addEventListener('click', e => {
  const opener = e.target.closest('[data-consent-open]');
  if (opener) { e.preventDefault(); show(true); return; }

  const t = e.target.closest('[data-track]');
  if (!t) return;
  const p = {};
  if (t.dataset.label) p.label = t.dataset.label;
  if (t.dataset.track === 'outbound_click' && t.href) p.link_url = t.href;
  window.track(t.dataset.track, p);
});

console.log('%cbtylmz%c\nburada ne arıyorsun?', 'font:800 22px system-ui;color:#38bdf8', 'font:500 12px system-ui;color:#94a3b8');
})();
