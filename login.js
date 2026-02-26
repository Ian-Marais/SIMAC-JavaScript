document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const idInput = document.getElementById('email');
  const pwInput = document.getElementById('password');
  const msg = document.getElementById('msg');

  function showMessage(text){ if(!msg) return; msg.textContent = text; }

  if(!form){ console.warn('login form not found'); return; }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMessage('');
    const idVal = (idInput.value || '').trim();
    const pw = pwInput.value || '';
    if(!idVal || !pw){ showMessage('Please enter your email/username and password.'); return; }

    try{
      const res = await fetch('user.json', {cache: 'no-store'});
      if(!res.ok) throw new Error('Failed to load user data');
      const db = await res.json();
      const users = Array.isArray(db.users) ? db.users : [];

      const lookup = idVal.toLowerCase();
      const user = users.find(u => (u.email && u.email.toLowerCase() === lookup) || (u.username && u.username.toLowerCase() === lookup));
      if(!user){ showMessage('No account found for that email or username.'); return; }
      if(String(user.password) !== String(pw)){ showMessage('Incorrect password.'); return; }
      if(user.hasOwnProperty('active') && user.active === false){ showMessage('This account is inactive.'); return; }

      const safeUser = Object.assign({}, user);
      if(safeUser.hasOwnProperty('password')) delete safeUser.password;
      try{ localStorage.setItem('currentUser', JSON.stringify(safeUser)); }catch(e){ /* ignore storage errors */ }
      window.location.replace('index.html');
    }catch(err){
      console.error('Login error', err);
      showMessage('An error occurred signing in.');
    }
  });
});
