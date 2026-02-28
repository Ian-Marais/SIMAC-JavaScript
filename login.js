document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const idInput = document.getElementById('email');
  const pwInput = document.getElementById('password');
  const msg = document.getElementById('msg');

  const supported = new Set(['en','af','es','fr']);
  const lang = (function(){
    const saved = localStorage.getItem('lang') || 'en';
    return supported.has(saved) ? saved : 'en';
  })();
  let dictionary = {};

  function t(key, fallback){
    return Object.prototype.hasOwnProperty.call(dictionary, key) ? dictionary[key] : fallback;
  }

  function loadTranslations(code){
    return fetch(`translations/${code}.json`, { cache: 'no-store' }).then(r=>{
      if(!r.ok) throw new Error(`Failed to load translations/${code}.json`);
      return r.json();
    });
  }

  function applyTranslations(dict){
    dictionary = dict || {};
    document.documentElement.setAttribute('lang', lang);
    document.title = t('login.page_title', document.title || 'Sign In');
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const value = t(key, '');
      if(!value) return;
      const tag = el.tagName.toLowerCase();
      if(tag === 'input' || tag === 'textarea'){
        el.setAttribute('placeholder', value);
      } else {
        el.textContent = value;
      }
    });
  }

  Promise.all([loadTranslations('en'), loadTranslations(lang)]).then(([en, localized])=>{
    applyTranslations(Object.assign({}, en || {}, localized || {}));
  }).catch(()=>{
    applyTranslations({});
  });

  function showMessage(text){ if(!msg) return; msg.textContent = text; }

  if(!form){ console.warn('login form not found'); return; }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMessage('');
    const idVal = (idInput.value || '').trim();
    const pw = pwInput.value || '';
    if(!idVal || !pw){ showMessage(t('login.msg.enter_credentials', 'Please enter your email/username and password.')); return; }

    try{
      const res = await fetch('user.json', {cache: 'no-store'});
      if(!res.ok) throw new Error('Failed to load user data');
      const db = await res.json();
      const users = Array.isArray(db.users) ? db.users : [];

      const lookup = idVal.toLowerCase();
      const user = users.find(u => (u.email && u.email.toLowerCase() === lookup) || (u.username && u.username.toLowerCase() === lookup));
      if(!user){ showMessage(t('login.msg.no_account', 'No account found for that email or username.')); return; }
      if(String(user.password) !== String(pw)){ showMessage(t('login.msg.incorrect_password', 'Incorrect password.')); return; }
      if(user.hasOwnProperty('active') && user.active === false){ showMessage(t('login.msg.inactive', 'This account is inactive.')); return; }

      const safeUser = Object.assign({}, user);
      if(safeUser.hasOwnProperty('password')) delete safeUser.password;
      try{ localStorage.setItem('currentUser', JSON.stringify(safeUser)); }catch(e){ /* ignore storage errors */ }
      window.location.replace('index.html');
    }catch(err){
      console.error('Login error', err);
      showMessage(t('login.msg.error_signin', 'An error occurred signing in.'));
    }
  });
});
