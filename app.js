document.addEventListener('DOMContentLoaded',()=>{
  const profileWrap = document.getElementById('profileMenuWrap');
  const profileMenu = document.getElementById('profileMenu');
  const darkMode = document.getElementById('darkMode');
  const authAction = document.getElementById('authAction');
  const profileName = document.getElementById('profileName');
  const orgSelector = document.querySelector('.org-selector');
  const orgBtn = document.querySelector('.org-btn');
  const orgPanel = document.querySelector('.org-panel');
  const orgListEl = document.querySelector('.org-list');
  const orgSearch = document.querySelector('.org-search');
  const headerLogo = document.querySelector('.header-hamburger .logo');
  const messagesButton = document.getElementById('messagesButton');
  const msgCountEl = document.getElementById('msgCount');
  const notificationsPanel = document.getElementById('notificationsPanel');
  const notifList = document.getElementById('notifList');
  const tzButton = document.getElementById('tzButton');
  const tzPanel = document.getElementById('tzPanel');
  const tzList = document.getElementById('tzList');
  const headerHamburger = document.querySelector('.topbar .hamburger');
  let activeDictionary = null;

  const avatarEl = document.getElementById('avatar');
  const currentUser = (function(){ try{ return JSON.parse(localStorage.getItem('currentUser')); }catch(e){ return null; }})();
  // If there's no signed-in user, redirect to the login page immediately.
  // This prevents unauthenticated users from seeing the app pages.
  try{
    const isLoginPage = /login\.html$/.test(window.location.pathname) || window.location.pathname.endsWith('/login');
    if(!currentUser && !isLoginPage){
      // Use replace so the back button won't return to the protected page
      window.location.replace('login.html');
      return;
    }
  }catch(e){ /* ignore any redirect errors */ }
  const defaultProfileImage = 'https://nerospec.app/images/person/7/20230627104200424_UXdOLxWb8SDssFIY3.jpg';
  let profileImageSrc = currentUser && currentUser.avatar ? currentUser.avatar : defaultProfileImage;
  // set initial profile image (from logged-in user if present)
  if(avatarEl){
    avatarEl.innerHTML = '';
    if(currentUser && currentUser.avatar){
      const img = document.createElement('img');
      img.src = currentUser.avatar;
      img.alt = 'Profile picture';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.borderRadius = '50%';
      img.style.objectFit = 'cover';
      avatarEl.appendChild(img);
    } else if(currentUser){
      avatarEl.textContent = getInitials(currentUser.name || currentUser.username || 'U');
    } else {
      const img = document.createElement('img');
      img.src = profileImageSrc;
      img.alt = 'Profile picture';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.borderRadius = '50%';
      img.style.objectFit = 'cover';
      avatarEl.appendChild(img);
    }
  }

  // messages array - seeded with demo data
  let messages = [
    { titleKey: 'notif.device_offline', title: 'Device Offline', info: 'LDV-012', time: '2026-03-01 07:42' },
    { titleKey: 'notif.high_engine_temp', title: 'High Engine Temp', info: 'Dump Truck-07', time: '2026-03-01 07:15' },
    { titleKey: 'notif.geofence_exit', title: 'Geofence Exit', info: 'Drill-19', time: '2026-02-28 23:04' },
    { titleKey: 'notif.maintenance_due', title: 'Maintenance Due', info: 'Fire Truck-03', time: '2026-02-28 18:27' }
  ];

  function t(key, fallback){
    return (activeDictionary && Object.prototype.hasOwnProperty.call(activeDictionary, key)) ? activeDictionary[key] : fallback;
  }

  function renderMessageCount(){
    msgCountEl.textContent = String(messages.length);
    // always show the exact count (including 0)
  }

  function renderNotifications(){
    // populate the notifications list
    notifList.innerHTML = '';
    if(messages.length === 0){
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = t('header.no_notifications', 'No notifications');
      notifList.appendChild(empty);
      return;
    }
    messages.forEach(msg=>{
      const row = document.createElement('div');
      row.className = 'notif-row';
      const ncol = document.createElement('div'); ncol.className='col notif-col';
      const titleEl = document.createElement('div'); titleEl.className='notif-text'; titleEl.textContent = msg.titleKey ? t(msg.titleKey, msg.title) : msg.title;
      ncol.appendChild(titleEl);
      const icol = document.createElement('div'); icol.className='col info-col';
      const veh = document.createElement('div'); veh.className='vehicle'; veh.textContent = msg.info || '';
      icol.appendChild(veh);
      const tcol = document.createElement('div'); tcol.className='col time-col'; tcol.textContent = msg.time;
      row.appendChild(ncol); row.appendChild(icol); row.appendChild(tcol);
      notifList.appendChild(row);
    });
  }

  // initial render
  renderMessageCount();
  renderNotifications();

  

  // header hamburger toggles sidebar collapsed state
  if(headerHamburger){
    headerHamburger.addEventListener('click', (e)=>{
      e.stopPropagation();
      const sidebar = document.querySelector('.sidebar');
      if(!sidebar) return;
      const collapsed = sidebar.classList.toggle('collapsed');
      document.body.classList.toggle('sidebar-collapsed', collapsed);
    });
  }

  let signedIn = !!currentUser;

  // initialize header name and auth button from stored user
  if(profileName){
    if(signedIn && currentUser){
      profileName.textContent = (currentUser.name || currentUser.username) + ' ▾';
      if(authAction) authAction.textContent = t('profile.sign_out', 'Sign Out');
    } else {
      profileName.textContent = `${t('profile.not_signed_in', 'Not signed in')} ▾`;
      if(authAction) authAction.textContent = t('profile.sign_in', 'Sign In');
    }
  }

  function toggleProfile(e){
    // Don't toggle when clicking inside the already-open profile menu (e.g. the dark-mode checkbox)
    if(e && profileMenu && profileMenu.contains(e.target)) return;
    const wasOpen = profileWrap.classList.contains('open');
    if(!wasOpen) closeAllDropdowns();
    profileWrap.classList.toggle('open');
    profileMenu.setAttribute('aria-hidden', String(!profileWrap.classList.contains('open')));
  }
  profileWrap.addEventListener('click',toggleProfile);

  darkMode.addEventListener('change', (e)=>{
    document.body.classList.toggle('dark', e.target.checked);
    document.body.classList.toggle('light', !e.target.checked);
    try{ localStorage.setItem('darkMode', e.target.checked ? 'true' : 'false'); }catch(err){/* ignore */}
  });

  // Restore dark mode checkbox from localStorage (or from body class if not set)
  try{
    const saved = localStorage.getItem('darkMode');
    if(saved !== null){
      const enabled = saved === 'true';
      if(darkMode) darkMode.checked = enabled;
      document.body.classList.toggle('dark', enabled);
      document.body.classList.toggle('light', !enabled);
    } else {
      if(darkMode) darkMode.checked = document.body.classList.contains('dark');
      // if no explicit dark class set, enable light mode class for predictable styling
      if(!document.body.classList.contains('dark')) document.body.classList.add('light');
    }
  }catch(e){
    if(darkMode) darkMode.checked = document.body.classList.contains('dark');
    if(!document.body.classList.contains('dark')) document.body.classList.add('light');
  }

  authAction.addEventListener('click', ()=>{
    if(signedIn){
      // sign out
      try{ localStorage.removeItem('currentUser'); }catch(e){}
      signedIn = false;
      profileName.textContent = `${t('profile.not_signed_in', 'Not signed in')} ▾`;
      authAction.textContent = t('profile.sign_in', 'Sign In');
      if(avatarEl) avatarEl.innerHTML = '';
      profileWrap.classList.remove('open');
      if(profileMenu) profileMenu.setAttribute('aria-hidden','true');
      // redirect to login page
      window.location.href = 'login.html';
      return;
    }
    // go to sign-in page
    window.location.href = 'login.html';
  });

  // Organizations data (seeded from provided HTML)
  const organizations = [
    {name:'Afrihost', src:'https://nerospec.app/images/operation/14/20220326191113808_QuOAecbpkaIcfRsNN.png'},
    {name:'AQS Liquid Tranfer', src:'https://nerospec.app/images/operation/161/20250226102550721_aElwIMWBQlyDXdYh4.png'},
    {name:'ArcelorMittal', src:'https://nerospec.app/images/operation/100/20231025035010238_5lIHLDplQ3iCjw3bs.png'},
    {name:'ASB Minerals', src:'logo-icon.png'},
    {name:'BehrTech', src:'https://nerospec.app/images/operation/31/20220326170732634_ctV3Dy8hKpnEEKAkR.png'},
    {name:'Black Rock', src:'https://nerospec.app/images/operation/18/20210525134504567_WChSDLPrwiMnVVIgJ.png'},
    {name:'Calcamite', src:'https://nerospec.app/images/operation/164/20250707075702140_huSkene8cyTGABBaF.png'},
    {name:'Cell C', src:'https://nerospec.app/images/operation/76/20220404111515616_W6YK9JDePpP6JaB3Q.png'},
    {name:'Checkers', src:'https://nerospec.app/images/operation/106/20240531121258940_9lgiOgnje0I7rBLi5.jpg'},
    {name:'Connected Sensors', src:'https://nerospec.app/images/operation/24/20220326174106926_geqGCxulRSowzI3Fl.png'},
    {name:'Ctrack', src:'https://nerospec.app/images/operation/90/20231005141145297_Y60VCYA0HjFA5n55m.png'},
    {name:'DeuCon', src:'https://nerospec.app/images/operation/157/20241210134222703_js8N5XJvS2iyUz8WS.png'},
    {name:'Dwarsrivier Mine', src:'https://nerospec.app/images/operation/15/20210525134350510_DiSwJ71HoyMjhb1dJ.png'},
    {name:'Epiroc', src:'https://nerospec.app/images/operation/94/20231003101043383_1BlQS6jsTPEzVOqk9.png'},
    {name:'Glencore - Helena', src:'https://nerospec.app/images/operation/54/20211221185642206_29AjOi6fSUj9CSQgD.png'},
    {name:'Glencore - Kroondal', src:'https://nerospec.app/images/operation/17/20210525134628841_HxgIJHOwLydqSfMz9.png'},
    {name:'Glencore - Magareng', src:'https://nerospec.app/images/operation/52/2021122008072098_Cpn9RAHD5Wl1j3Dxc.png'},
    {name:'Glencore - Thorncliffe', src:'https://nerospec.app/images/operation/55/20211221185812655_4k3ookoJJ18iyBq42.png'},
    {name:'Glencore - Waterval', src:'https://nerospec.app/images/operation/69/20220404120009998_okwGMyuXrG6oo0Xzm.png'},
    {name:'Gold Fields - South Deep', src:'https://nerospec.app/images/operation/80/20220511071745219_F1JznvUbGJhvfdq3m.png'},
    {name:'Graymont', src:'https://nerospec.app/images/operation/99/20231019075805712_X8RwXwiPMkrwz7nty.png'},
    {name:'GSES', src:'https://nerospec.app/images/operation/19/2021052513460120_xaFQ94IhGAYAUhwgd.png'},
    {name:'Harmony - Moab', src:'https://nerospec.app/images/operation/150/20241002123346425_aA4YtY7MmFnMnNL5z.png'},
    {name:'Harmony - Mponeng', src:'https://nerospec.app/images/operation/151/2024100212303560_7s6JLhKHgJyqte0K2.png'},
    {name:'Harmony - Target', src:'https://nerospec.app/images/operation/146/20240826113449464_PhihhptHAxw7rNTzf.png'},
    {name:'HAZEMAG', src:'https://nerospec.app/images/operation/89/20200903160313386_33330333333.png'},
    {name:'Implats', src:'https://nerospec.app/images/operation/97/20231005083135858_kIzhT6qlHofSsSx01.png'},
    {name:'Infraspeak', src:'https://nerospec.app/images/operation/83/2022092113454253_vlkEdplbXmnpa4wSj.png'},
    {name:'Ivanhoe Mines - IVANPLATS', src:'https://nerospec.app/images/operation/201/20251023113659684_lVxoU8yBjnhww2YrN.png'},
    {name:'JoJo', src:'https://nerospec.app/images/operation/25/20220326224112356_GkFjDkQUHkLiBTXtP.png'},
    {name:'JoJo POC', src:'https://nerospec.app/images/operation/185/20250722072750650_TyllmqAeG3bb86Owg.png'},
    {name:'K+S Minerals and Agriculture GmbH', src:'https://nerospec.app/images/operation/68/20220326224710641_HWeKdOnxSzvuVStjE.png'},
    {name:'Katakomb', src:'logo-icon.png'},
    {name:'KFC', src:'https://nerospec.app/images/operation/82/20220921131910561_k0Q427HpfYt6GnkjV.png'},
    {name:'Komatsu', src:'https://nerospec.app/images/operation/51/20240924185219676_zDFGwQDKts7CISVDs.png'},
    {name:'M Civils', src:'https://nerospec.app/images/operation/167/20250707075053160_gzyigz5cNfHs0fQ8f.png'},
    {name:'Mafika Engineering', src:'https://nerospec.app/images/operation/160/20250204170057411_ae8aI0iRn9cn3wFys.png'},
    {name:'Marula Mine', src:'https://nerospec.app/images/operation/70/20220331100301856_4pqCE4Jsaj2jtCiTa.png'},
    {name:'Maximator', src:'https://nerospec.app/images/operation/75/20220404111829977_wopfB6wm2DgF1jkA6.png'},
    {name:'MCivils', src:'logo-icon.png'},
    {name:'MIMOSA', src:'https://nerospec.app/images/operation/158/2025020416462387_XBxeTaRSIehS3taUx.png'},
    {name:'Mine Machines', src:'https://nerospec.app/images/operation/66/20220326230219475_M69ssgkkBaHNHiVhf.png'},
    {name:'Mopani Copper Mines PLC', src:'https://nerospec.app/images/operation/162/20250417073832890_4WCtdmA52MddDh4PW.png'},
    {name:'Motion Hub', src:'https://nerospec.app/images/operation/53/20211221111910814_9OOyE7G1hpAW2iCdE.png'},
    {name:'MTN', src:'https://nerospec.app/images/operation/72/20220331095454729_LvL30o6btGOrKw2TJ.png'},
    {name:'Nerospec', src:'https://nerospec.app/images/operation/1/20231003100811243_D0qklKdpW31VF73cf.png'},
    {name:'Nerospec Core', src:'https://nerospec.app/images/operation/86/20240213084624161_ePO8aqBdNVcNdT9PW.png'},
    {name:'Nerospec Demo', src:'logo-icon.png'},
    {name:'Nerospec Group', src:'https://nerospec.app/images/operation/85/20231005125856238_gQKcjX0S31knpK082.png'},
    {name:'Nerospec IOT', src:'https://nerospec.app/images/operation/3/20220331132557390_1lr6jBQRDwE622TGd.png'},
    {name:'Nerospec IoT Demo', src:'https://nerospec.app/images/operation/159/20250226122219865_EOCnhXTwHjXqT7nXP.png'},
    {name:'Nerospec IT', src:'https://nerospec.app/images/operation/21/20220331142755680_lpmzsQtK67SbPxNiT.png'},
    {name:'Nerospec Networks', src:'https://nerospec.app/images/operation/2/20220331132651501_sqQcK5M7ftaNTCwiN.png'},
    {name:'Nerospec OSCON', src:'https://nerospec.app/images/operation/4/20220331132303750_0BD09Lkaf2iq8DPgv.png'},
    {name:'Nerospec SK', src:'https://nerospec.app/images/operation/7/20210727104319767_dxfxwBppzaaDHCMjy.png'},
    {name:'Nerospec Training', src:'logo-icon.png'},
    {name:'Netcare', src:'https://nerospec.app/images/operation/155/20250311081759579_tl4zqzvc3QPN3hvRz.svg'},
    {name:'Netcare - Christiaan Barnard', src:'https://nerospec.app/images/operation/156/2025031109071571_dPjcKYKVVVh1yhDbW.svg'},
    {name:'PJSC MMC Norilsk Nickel', src:'https://nerospec.app/images/operation/95/20231003100745549_JTVXdsHWwynC6yqrd.png'},
    {name:'PremiseHQ SaaS Inc.', src:'https://nerospec.app/images/operation/20/2022033112361951_5k8oBAWDwlOQRY3eu.png'},
    {name:'Rio Tinto - Oyu Tolgoi', src:'https://nerospec.app/images/operation/91/20231003101938855_0dOERGD2FK5gDAnma.png'},
    {name:'RioTinto - Kennecott Underground Copper', src:'https://nerospec.app/images/operation/84/20221031065711918_PGkT8BFCiUm61qlMi.png'},
    {name:'Samancor Chrome – TFW', src:'https://nerospec.app/images/operation/148/20241203163751787_8gyvQY0M01dIhlYkU.png'},
    {name:'Samancor Chrome – WCM', src:'logo-icon.png'},
    {name:'Samancor Cr', src:'https://nerospec.app/images/operation/149/20241203163718181_MyRpmihK6R4rlJgbo.png'},
    {name:'Samancor Doornbosch', src:'https://nerospec.app/images/operation/71/20220421112546692_XHNsseHq3sRBJPDnO.png'},
    {name:'Sappi', src:'https://nerospec.app/images/operation/206/20260119133755248_avib3u9EoygdLBz5w.png'},
    {name:'Sappi - Ngodwana Nursery', src:'https://nerospec.app/images/operation/207/20260121151023624_9XPL6vMJJxKM5o09X.png'},
    {name:'Sasol - Shondoni', src:'https://nerospec.app/images/operation/163/20250505094542619_P3JHpzBc1N1fV5tKv.png'},
    {name:'Sasol - Thubelisha', src:'https://nerospec.app/images/operation/78/20250930060011878_K1m2wEUKEcY3r10dr.png'},
    {name:'Shaun Roselt', src:'https://nerospec.app/images/operation/30/2025080707572553_kRDdcWiEXpPrlClHp.png'},
    {name:'Sibanye Bathopele', src:'https://nerospec.app/images/operation/77/20220404112812485_CEohxFjJwUyO7NpjX.png'},
    {name:'SIMAC testing', src:'https://nerospec.app/images/operation/87/20221110145702749_Lc8vfyQHfGaC87Sqk.png'},
    {name:'SMTECH', src:'https://nerospec.app/images/operation/96/20231003100933392_h29eBt0hxYAfckCsr.png'},
    {name:'Soteria Risk Solutions', src:'https://nerospec.app/images/operation/79/20220422100349105_DuDp1UX6OPgI5MADA.png'},
    {name:'South32 – Mamatwan', src:'logo-icon.png'},
    {name:'Strata', src:'https://nerospec.app/images/operation/67/2022033112581132_oFPlSXBgVq6yEmoki.png'},
    {name:'Sylvania Platinum Limited', src:'logo-icon.png'},
    {name:'Telkom', src:'https://nerospec.app/images/operation/73/20220331122305545_uioBmEmaxc92SxeAx.png'},
    {name:'The Foschini Group', src:'https://nerospec.app/images/operation/88/20221122092355848_1rN9RnxR6Xx3w553x.png'},
    {name:'The Pinnacle Marina Tower', src:'https://nerospec.app/images/operation/32/20210713132923705_5WMUpVH7IuxehFT2r.jpg'},
    {name:'Tsebo', src:'https://nerospec.app/images/operation/107/20241203155940476_Pbwv8Kl2TUTrSr7W8.svg'},
    {name:'Tsebo - Hygiene', src:'https://nerospec.app/images/operation/154/20241203160204678_BXg5GuHLAJLof02oX.svg'},
    {name:'Vale', src:'https://nerospec.app/images/operation/93/2023100310171354_QcoOuopAMD5xrWmu1.png'},
    {name:'Valterra Platinum - Amandelbult', src:'https://nerospec.app/images/operation/65/20250818072728903_tz8f7RCHWmjc3NKPz.png'},
    {name:'Valterra Platinum - Modikwa', src:'https://nerospec.app/images/operation/103/20251021093948488_DEbjlSrv69ouB5sXP.png'},
    {name:'Valterra Platinum - Mototolo', src:'https://nerospec.app/images/operation/102/20250714150424688_DN1aOPGSCQnP8obBJ.png'},
    {name:'Valterra Platinum - Mototolo - Borwa', src:'https://nerospec.app/images/operation/153/20250714151154732_Fqq17tfvO6fwOU9Dp.png'},
    {name:'Valterra Platinum - Mototolo - Der Brochen', src:'https://nerospec.app/images/operation/175/20250714150654156_G4XERAPzyxL0NoBU6.png'},
    {name:'Valterra Platinum - Mototolo - Lebowa', src:'https://nerospec.app/images/operation/152/20250714153125333_R3kdYXyPj4QnXxcNS.png'},
    {name:'Valterrra Platinum - Unki', src:'https://nerospec.app/images/operation/23/2025091511332925_8GfqGpEUqjC9EOtxW.png'},
    {name:'Vinci', src:'https://nerospec.app/images/operation/92/hfdhfdsdhfhadf.png'},
    {name:'Vodacom', src:'https://nerospec.app/images/operation/74/20220331134928768_Sb8cxfkwQNdRX07uD.png'},
    {name:'Zimplats', src:'https://nerospec.app/images/operation/98/20231005083044431_8SSiyEalRGDqrE6V7.png'},
    {name:'Zizwe', src:'https://nerospec.app/images/operation/147/20241203164334668_h7X73qpRA9ik3EPBS.png'}
  ];

  function getInitials(name){
    return name.split(' ').map(s=>s[0]).filter(Boolean).slice(0,2).join('').toUpperCase();
  }
  function colorIdxForName(name){
    let h = 0; for(let i=0;i<name.length;i++) h = (h<<5) - h + name.charCodeAt(i);
    return Math.abs(h) % 7; // matches avatar-bg-0..6
  }

  function renderOrgList(filter){
    orgListEl.innerHTML = '';
    const q = (filter||'').trim().toLowerCase();
    const list = organizations.filter(o=>o.name.toLowerCase().includes(q));
    if(list.length === 0){
      const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = t('org.no_organizations', 'No organizations'); orgListEl.appendChild(empty); return;
    }
    list.forEach((o, idx)=>{
      const item = document.createElement('div'); item.className = 'org-item';
      item.setAttribute('role','listitem');
      const avatar = document.createElement('div'); avatar.className = 'org-avatar';
      if(o.src){
        const img = document.createElement('img'); img.className = 'org-img'; img.alt = o.name; img.src = o.src;
        avatar.appendChild(img);
      } else {
        avatar.classList.add('avatar-bg-' + colorIdxForName(o.name));
        avatar.textContent = getInitials(o.name);
      }
      const nameWrap = document.createElement('div');
      const name = document.createElement('div'); name.className = 'org-name'; name.textContent = o.name;
      nameWrap.appendChild(name);
      item.appendChild(avatar); item.appendChild(nameWrap);
      item.addEventListener('click', ()=>{
        setSelectedOrg(o, true);
        orgSelector.classList.remove('open');
        if(orgPanel){ orgPanel.setAttribute('aria-hidden','true'); }
      });
      orgListEl.appendChild(item);
    });
  }

  // apply selected organization to header and org button (centralized)
  function setSelectedOrg(o, save=true){
    if(!o) return;
    const iconEl = orgBtn.querySelector('.org-icon');
    const labelEl = orgBtn.querySelector('.org-label');
    if(iconEl){
      iconEl.innerHTML = '';
      if(o.src){
        const img = document.createElement('img'); img.src = o.src; img.alt = o.name; img.style.width='100%'; img.style.height='100%'; img.style.borderRadius='18px'; img.style.objectFit='cover';
        iconEl.appendChild(img);
        for(let i=0;i<7;i++) iconEl.classList.remove('avatar-bg-' + i);
      } else {
        iconEl.textContent = getInitials(o.name);
        for(let i=0;i<7;i++) iconEl.classList.remove('avatar-bg-' + i);
        iconEl.classList.add('avatar-bg-' + colorIdxForName(o.name));
      }
    }
    if(headerLogo){
      headerLogo.innerHTML = '';
      if(o.src){
        const himg = document.createElement('img'); himg.src = o.src; himg.alt = o.name; himg.style.width='100%'; himg.style.height='100%'; himg.style.borderRadius='6px'; himg.style.objectFit='cover';
        headerLogo.appendChild(himg);
        for(let i=0;i<7;i++) headerLogo.classList.remove('avatar-bg-' + i);
      } else {
        headerLogo.textContent = getInitials(o.name);
        for(let i=0;i<7;i++) headerLogo.classList.remove('avatar-bg-' + i);
        headerLogo.classList.add('avatar-bg-' + colorIdxForName(o.name));
      }
    }
    if(labelEl) labelEl.textContent = o.name;
    if(save){
      try{ localStorage.setItem('selectedOrg', o.name); }catch(e){ /* ignore */ }
    }
  }

  // restore selection from localStorage if present
  try{
    const saved = localStorage.getItem('selectedOrg');
    if(saved){
      const found = organizations.find(x=>x.name === saved);
      if(found) setSelectedOrg(found, false);
    }
  } catch(e){}

  // open/close org panel
  orgBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    const wasOpen = orgSelector.classList.contains('open');
    if(!wasOpen) closeAllDropdowns();
    const open = orgSelector.classList.toggle('open');
    if(orgPanel) orgPanel.setAttribute('aria-hidden', String(!open));
    if(open) {
      renderOrgList(orgSearch ? orgSearch.value : '');
      // focus the search input so the user can start typing immediately
      if(orgSearch){
        setTimeout(()=>{
          try{ orgSearch.focus(); orgSearch.select(); }catch(e){/* ignore */}
        },0);
      }
    }
  });

  if(orgSearch){
    orgSearch.addEventListener('input', (e)=>{ renderOrgList(e.target.value); });
  }

  // messages click toggles notifications panel
  messagesButton.addEventListener('click',(e)=>{
    e.stopPropagation();
    const wasOpen = notificationsPanel.classList.contains('open');
    if(!wasOpen) closeAllDropdowns();
    const open = notificationsPanel.classList.toggle('open');
    notificationsPanel.setAttribute('aria-hidden', String(!open));
    renderNotifications();
  });

  // Language toggle/menu inside profile menu
  const languageToggle = document.getElementById('languageToggle');
  const languageMenu = document.getElementById('languageMenu');
  const languages = [
    {code:'af', name:'Afrikaans', flag:'https://simac.app/images/flags/af.png'},
    {code:'en', name:'English', flag:'https://simac.app/images/flags/en.png'},
    {code:'fr', name:'French', flag:'https://simac.app/images/flags/fr.png'},
    {code:'es', name:'Spanish', flag:'https://simac.app/images/flags/es.png'}
  ];
  const supportedLangCodes = languages.map(l=>l.code);
  let activeLanguage = localStorage.getItem('lang') || 'en';

  const summaryRanges = {
    day: { days: 1, hours: 24 },
    week: { days: 7, hours: 168 },
    fortnight: { days: 14, hours: 336 },
    month: { days: 30, hours: 720 },
    quarter: { days: 90, hours: 2160 }
  };

  const summaryLabels = {
    en: { day: 'Day on Day', week: 'Week on Week', fortnight: 'Fortnight on Fortnight', month: 'Month on Month', quarter: 'Quarter on Quarter' },
    af: { day: 'Dag op Dag', week: 'Week op Week', fortnight: 'Tweeweke op Tweeweke', month: 'Maand op Maand', quarter: 'Kwartaal op Kwartaal' },
    es: { day: 'Día a Día', week: 'Semana a Semana', fortnight: 'Quincena a Quincena', month: 'Mes a Mes', quarter: 'Trimestre a Trimestre' },
    fr: { day: 'Jour à Jour', week: 'Semaine à Semaine', fortnight: 'Quinzaine à Quinzaine', month: 'Mois à Mois', quarter: 'Trimestre à Trimestre' }
  };

  function formatDate(dateObj){
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  }

  function getSummaryLabel(period, lang){
    const safeLang = summaryLabels[lang] ? lang : 'en';
    return (summaryLabels[safeLang] && summaryLabels[safeLang][period]) || summaryLabels.en[period] || 'Quarter on Quarter';
  }

  function template(value, vars){
    return String(value || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k)=>{
      return Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : '';
    });
  }

  function updateSummaryPeriod(period, save=true){
    const safePeriod = summaryRanges[period] ? period : 'week';
    const cfg = summaryRanges[safePeriod];
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - cfg.days + 1);

    const rangeEl = document.querySelector('.meta-range');
    const timespanEl = document.querySelector('.meta-timespan');
    const selectedEl = document.querySelector('.pill-selected');

    if(rangeEl){
      const label = t('summary.last_days', 'Last {{days}} days');
      rangeEl.textContent = `| ${template(label, { days: cfg.days })} (${formatDate(start)} - ${formatDate(end)})`;
    }
    if(timespanEl){
      const label = t('summary.timespan_hours', 'Timespan: {{hours}} hours');
      timespanEl.textContent = ` | ${template(label, { hours: cfg.hours })}`;
    }
    if(selectedEl){
      selectedEl.textContent = getSummaryLabel(safePeriod, activeLanguage);
      selectedEl.dataset.period = safePeriod;
      selectedEl.removeAttribute('data-i18n');
    }
    if(save){
      try{ localStorage.setItem('selectedPeriod', safePeriod); }catch(e){ /* ignore */ }
    }
  }

  function renderLanguages(){
    if(!languageMenu) return;
    languageMenu.innerHTML = '';
    languages.forEach(l=>{
      const item = document.createElement('div');
      item.className = 'language-item';
      item.dataset.code = l.code;
      const icon = document.createElement('div'); icon.className = 'lang-icon';
      // If flag is a URL, render an <img> inside the icon container so it fits the circular mask.
      if(l.flag && (typeof l.flag === 'string') && (l.flag.startsWith('http') || l.flag.startsWith('/'))){
        const img = document.createElement('img');
        img.src = l.flag;
        img.alt = l.code;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        icon.appendChild(img);
      } else {
        icon.textContent = l.flag;
      }
      const name = document.createElement('div'); name.className = 'lang-name'; name.textContent = l.name;
      item.appendChild(icon); item.appendChild(name);
      if(activeLanguage === l.code) item.classList.add('selected');
      item.addEventListener('click', (e)=>{
        e.stopPropagation();
        setLanguage(l.code);
      });
      languageMenu.appendChild(item);
    });
  }

  function setLanguage(code){
    const safeCode = supportedLangCodes.includes(code) ? code : 'en';
    activeLanguage = safeCode;
    localStorage.setItem('lang', safeCode);
    document.querySelectorAll('.language-item').forEach(i=>{
      i.classList.toggle('selected', i.dataset.code === safeCode);
    });
    const selected = languages.find(x=>x.code === safeCode);
    if(languageToggle){
      const lbl = languageToggle.querySelector('.lang-label');
      if(lbl) lbl.textContent = selected ? selected.name : t('profile.language', 'Language');
      languageToggle.classList.remove('open');
      if(languageMenu) languageMenu.setAttribute('aria-hidden','true');
    }
    Promise.all([loadTranslations('en'), loadTranslations(safeCode)]).then(([enDict, dict])=>{
      const mergedDict = Object.assign({}, enDict || {}, dict || {});
      applyTranslations(mergedDict, enDict || mergedDict);
      const selectedPeriod = (document.querySelector('.pill-selected') || {}).dataset?.period || localStorage.getItem('selectedPeriod') || 'week';
      updateSummaryPeriod(selectedPeriod, false);
    }).catch(err=>{
      console.warn('Translation load failed for', safeCode, err);
      loadTranslations('en').then(dict=>{ if(dict) applyTranslations(dict, dict); }).catch(()=>{});
    });
  }

  // Translation loader and applier
  const translationsCache = {};
  function loadTranslations(code){
    if(!code) return Promise.resolve(null);
    if(translationsCache[code]) return Promise.resolve(translationsCache[code]);
    const url = `translations/${code}.json`;
    return fetch(url).then(r=>{
      if(!r.ok) throw new Error('Failed to fetch '+url);
      return r.json();
    }).then(json=>{ translationsCache[code]=json; return json; });
  }

  function applyTranslations(dict, enDict){
    if(!dict) return;
    activeDictionary = dict;
    document.documentElement.setAttribute('lang', activeLanguage || 'en');
    // Primary: translate annotated elements using data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(key === 'org.label') return;
      const val = dict[key];
      if(typeof val === 'undefined') return;
      const attrList = (el.getAttribute('data-i18n-attr') || '').split(',').map(s=>s.trim()).filter(Boolean);
      if(attrList.length){
        attrList.forEach(attr=>el.setAttribute(attr, val));
        return;
      }
      const tag = el.tagName.toLowerCase();
      if(tag === 'input' || tag === 'textarea'){
        el.setAttribute('placeholder', val);
        if(el.hasAttribute('aria-label')) el.setAttribute('aria-label', val);
        return;
      }
      if(el.hasAttribute('title')){ el.setAttribute('title', val); return; }
      // If the translation contains HTML tags, set innerHTML so markup is preserved
      if(/<[^>]+>/.test(val)) el.innerHTML = val;
      else el.textContent = val;
    });

    // Secondary: translate non-annotated elements by matching English source strings
    const en = enDict || translationsCache['en'];
    if(en){
      const reverse = Object.create(null);
      Object.keys(en).forEach(k=>{
        const v = en[k];
        if(typeof v !== 'string') return;
        const txt = v.trim();
        reverse[txt] = k;
        reverse[txt.replace(/\s+/g,' ')] = k;
      });

      const SKIP = new Set(['SCRIPT','STYLE','IMG','SVG','PATH','BR','HR','INPUT','TEXTAREA','SELECT','BUTTON']);

      const bodyWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      const textUpdates = [];
      while(bodyWalker.nextNode()){
        const node = bodyWalker.currentNode;
        const parentTag = node.parentElement ? node.parentElement.tagName : '';
        if(SKIP.has(parentTag)) continue;
        if(node.parentElement && node.parentElement.closest('[data-i18n]')) continue;
        const raw = node.nodeValue || '';
        const txt = raw.trim();
        if(!txt) continue;
        const key = reverse[txt] || reverse[txt.replace(/\s+/g,' ')];
        if(key && dict[key]) textUpdates.push({ node, value: dict[key] });
      }
      textUpdates.forEach(u=>{ u.node.nodeValue = u.value; });

      document.querySelectorAll('body *:not([data-i18n])').forEach(el=>{
        if(SKIP.has(el.tagName)) return;
        if(el.hasAttribute('placeholder')){
          const ph = (el.getAttribute('placeholder')||'').trim();
          const phKey = reverse[ph] || reverse[ph.replace(/\s+/g,' ')];
          if(phKey && dict[phKey]) el.setAttribute('placeholder', dict[phKey]);
        }
        if(el.hasAttribute('title')){
          const t = (el.getAttribute('title')||'').trim();
          const tKey = reverse[t] || reverse[t.replace(/\s+/g,' ')];
          if(tKey && dict[tKey]) el.setAttribute('title', dict[tKey]);
        }
        if(el.hasAttribute('aria-label')){
          const a = (el.getAttribute('aria-label')||'').trim();
          const aKey = reverse[a] || reverse[a.replace(/\s+/g,' ')];
          if(aKey && dict[aKey]) el.setAttribute('aria-label', dict[aKey]);
        }
      });
    }

    const appTitle = t('app.title', document.title || 'SIMAC');
    document.title = appTitle;

    if(profileName && !signedIn){
      profileName.textContent = `${t('profile.not_signed_in', 'Not signed in')} ▾`;
    }
    if(authAction && !signedIn){
      authAction.textContent = t('profile.sign_in', 'Sign In');
    }
    if(orgSearch){
      orgSearch.placeholder = t('org.search', 'Search');
      orgSearch.setAttribute('aria-label', t('org.search_organizations', 'Search organizations'));
    }
    renderNotifications();
  }

  if(languageToggle){
    // Helpers to manage mutually-exclusive expansions inside the profile menu
    function closeAllExpansions(){
      // close language
      languageToggle.classList.remove('open');
      if(languageMenu) languageMenu.setAttribute('aria-hidden','true');
      // close help panel
      const helpItem = profileMenu.querySelector('.help-item');
      if(helpItem){
        const helpPanel = helpItem.querySelector('.help-panel');
        if(helpPanel){ helpPanel.setAttribute('aria-hidden','true'); helpPanel.style.display = 'none'; }
      }
    }

    function openExpansion(el){
      if(typeof closeAllDropdowns === 'function') closeAllDropdowns(profileWrap);
      closeAllExpansions();
      if(!el) return;
      if(el.classList.contains('language-toggle')){
        el.classList.add('open');
        if(languageMenu){ languageMenu.setAttribute('aria-hidden','false'); renderLanguages(); }
      } else if(el.classList.contains('help-item')){
        const helpPanel = el.querySelector('.help-panel');
        if(helpPanel){ helpPanel.setAttribute('aria-hidden','false'); helpPanel.style.display = 'block'; }
      }
    }

    // Click to toggle language (keeps exclusive behavior)
    languageToggle.addEventListener('click', (e)=>{
      e.stopPropagation();
      if(languageToggle.classList.contains('open')){ closeAllExpansions(); }
      else { openExpansion(languageToggle); }
    });

    // Hover / focus to open language quickly — only when it's not already open
    languageToggle.addEventListener('mouseenter', ()=> { if(!languageToggle.classList.contains('open')) openExpansion(languageToggle); });
    languageToggle.addEventListener('focusin', ()=> { if(!languageToggle.classList.contains('open')) openExpansion(languageToggle); });

    // Wire up help panel to behave the same (hover or click opens it exclusively)
    const helpItem = profileMenu.querySelector('.help-item');
    if(helpItem){
      const helpPanel = helpItem.querySelector('.help-panel');
      if(helpPanel){ helpPanel.style.display = 'none'; helpPanel.setAttribute('aria-hidden','true'); }
      helpItem.addEventListener('mouseenter', ()=> openExpansion(helpItem));
      helpItem.addEventListener('click', (e)=>{ e.stopPropagation(); openExpansion(helpItem); });
      helpItem.addEventListener('focusin', ()=> openExpansion(helpItem));
    }

    // Keep the menu open while the pointer is anywhere inside the profile area;
    // when leaving the profile area, close all expansions.
    if(profileWrap){
      profileWrap.addEventListener('mouseleave', ()=>{ closeAllExpansions(); });
    }

    // initialize label from storage and apply translations
    // Auto-load preferred language: saved value, then navigator language, then fallback to 'en'
    (function initLanguage(){
      const savedLang = localStorage.getItem('lang');
      const navLang = (navigator.language || navigator.userLanguage || 'en').split('-')[0];
      // prefer saved, then navigator if supported, else 'en'
      const preferred = (savedLang && supportedLangCodes.includes(savedLang))
        ? savedLang
        : (supportedLangCodes.includes(navLang) ? navLang : 'en');
      try{
        setLanguage(preferred);
      }catch(e){
        console.warn('Auto language load failed, falling back to en', e);
        try{ setLanguage('en'); }catch(err){/* ignore */}
      }
    })();
  }

  // Fleet selector dropdown behavior
  // Close any open dropdowns so only one menu is visible at a time
  // closeAllDropdowns(optionalExcludeEl)
  // If `optionalExcludeEl` is provided, any dropdown element contained within it will not be closed.
  function closeAllDropdowns(optionalExcludeEl){
    const fMenu = document.querySelector('.fleet-menu');
    const fBtn = document.querySelector('.fleet-btn');
    const pMenu = document.querySelector('.pill-menu');
    const pAction = document.querySelector('.pill-action');
    const orgSel = document.querySelector('.org-selector');
    const orgPanelEl = document.querySelector('.org-panel');
    const pWrapEl = document.getElementById('profileMenuWrap');
    const pMenuEl = document.getElementById('profileMenu');
    const notif = document.getElementById('notificationsPanel');
    const langT = document.getElementById('languageToggle') || document.querySelector('.language-toggle');
    const langMenuEl = document.getElementById('languageMenu');

    const isExcluded = (el)=> !el || !optionalExcludeEl || (optionalExcludeEl !== el && !optionalExcludeEl.contains(el));

    if(fMenu && isExcluded(fMenu)){ fMenu.classList.remove('open'); fMenu.setAttribute('aria-hidden','true'); }
    if(fBtn && isExcluded(fBtn)) fBtn.setAttribute('aria-expanded','false');
    if(pMenu && isExcluded(pMenu)){ pMenu.classList.remove('open'); pMenu.setAttribute('aria-hidden','true'); }
    if(pAction && isExcluded(pAction)) pAction.setAttribute('aria-expanded','false');
    if(orgSel && isExcluded(orgSel)) orgSel.classList.remove('open');
    if(orgPanelEl && isExcluded(orgPanelEl)) orgPanelEl.setAttribute('aria-hidden','true');
    if(pWrapEl && isExcluded(pWrapEl)) pWrapEl.classList.remove('open');
    if(pMenuEl && isExcluded(pMenuEl)) pMenuEl.setAttribute('aria-hidden','true');
    if(notif && isExcluded(notif)){ notif.classList.remove('open'); notif.setAttribute('aria-hidden','true'); }
    if(langT && isExcluded(langT)) langT.classList.remove('open');
    if(langMenuEl && isExcluded(langMenuEl)) langMenuEl.setAttribute('aria-hidden','true');
    const helpItem = document.querySelector('.profile-menu .help-item');
    if(helpItem){ const helpPanel = helpItem.querySelector('.help-panel'); if(helpPanel && isExcluded(helpPanel)){ helpPanel.setAttribute('aria-hidden','true'); helpPanel.style.display='none'; } }
  }
  const fleetBtn = document.querySelector('.fleet-btn');
  const fleetMenu = document.querySelector('.fleet-menu');
  if(fleetBtn && fleetMenu){
    function closeFleet(){ fleetMenu.classList.remove('open'); fleetMenu.setAttribute('aria-hidden','true'); fleetBtn.setAttribute('aria-expanded','false'); }
    function openFleet(){ fleetMenu.classList.add('open'); fleetMenu.setAttribute('aria-hidden','false'); fleetBtn.setAttribute('aria-expanded','true'); }
    fleetBtn.addEventListener('click', (e)=>{ 
      e.stopPropagation();
      if(!fleetMenu.classList.contains('open')){
        closeAllDropdowns();
        openFleet();
      } else {
        closeFleet();
      }
    });
    fleetBtn.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); fleetBtn.click(); } if(e.key === 'Escape') closeFleet(); });
    fleetMenu.querySelectorAll('li').forEach(li=>{
      li.addEventListener('click', (e)=>{
        e.stopPropagation();
        // prefer an explicit data-fleet-name or .fleet-name element for button label
        const nameFromAttr = li.dataset.fleetName;
        const nameEl = li.querySelector('.fleet-name');
        const label = nameFromAttr || (nameEl ? nameEl.textContent.trim() : li.textContent.trim());
        // set the button text to selected fleet
        const fleetLabelEl = fleetBtn.querySelector('.fleet-label');
        if(fleetLabelEl) fleetLabelEl.textContent = label;
        else fleetBtn.textContent = label + ' ▾';
        closeFleet();
      });
    });
    // close on outside click
    document.addEventListener('click', ()=>{ closeFleet(); });
  }

  // expandable nav items (e.g. Machine Status)
  document.querySelectorAll('.nav li.expandable').forEach(li=>{
    // ensure initial aria state
    const sub = li.querySelector('.sub-list');
    if(sub) sub.setAttribute('aria-hidden', 'true');
    li.setAttribute('aria-expanded', 'false');

    li.addEventListener('click', (e)=>{
      // if clicking a sub-item, don't toggle
      if(e.target.closest('.sub-item')) return;
      const open = li.classList.toggle('open');
      li.setAttribute('aria-expanded', String(open));
      if(sub) sub.setAttribute('aria-hidden', String(!open));
    });
  });

  

  // close menus on outside click
  document.addEventListener('click', (e)=>{
    if(!profileWrap.contains(e.target)){
      profileWrap.classList.remove('open');
      profileMenu.setAttribute('aria-hidden','true');
    }
    if(!orgSelector.contains(e.target)){
      orgSelector.classList.remove('open');
    }
    if(notificationsPanel && !notificationsPanel.contains(e.target) && !messagesButton.contains(e.target)){
      notificationsPanel.classList.remove('open');
      notificationsPanel.setAttribute('aria-hidden','true');
    }
    // close language menu when clicking outside
    if(languageToggle && !languageToggle.contains(e.target)){
      languageToggle.classList.remove('open');
      if(languageMenu) languageMenu.setAttribute('aria-hidden','true');
    }
    
  });

  // Summary pill dropdown behavior
  const pillAction = document.querySelector('.pill-action');
  const pillMenu = document.querySelector('.pill-menu');
  if(pillAction && pillMenu){
    function closePill(){ pillMenu.classList.remove('open'); pillMenu.setAttribute('aria-hidden','true'); pillAction.setAttribute('aria-expanded','false'); }
    function openPill(){ pillMenu.classList.add('open'); pillMenu.setAttribute('aria-hidden','false'); pillAction.setAttribute('aria-expanded','true'); }
    pillAction.addEventListener('click', (e)=>{
      e.stopPropagation();
      if(!pillMenu.classList.contains('open')){
        closeAllDropdowns();
        openPill();
      } else {
        closePill();
      }
    });
    // allow keyboard toggle
    pillAction.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); pillAction.click(); }
      if(e.key === 'Escape') closePill();
    });
    // handle item selection
    pillMenu.querySelectorAll('li').forEach(li=>{
      li.addEventListener('click', (e)=>{
        e.stopPropagation();
        const period = li.dataset.value || 'quarter';
        updateSummaryPeriod(period, true);
        closePill();
      });
    });
    // close on outside click (already handled above) but ensure menu closes when clicking other areas
    document.addEventListener('click', ()=>{ closePill(); });
  }

  try{
    const savedPeriod = localStorage.getItem('selectedPeriod') || 'week';
    updateSummaryPeriod(savedPeriod, false);
  }catch(e){
    updateSummaryPeriod('week', false);
  }

  // Initialize Chart.js doughnuts for the replaced donut visuals
  try {
    if(window.Chart){
      const prodCanvas = document.getElementById('productivityChart');
      if(prodCanvas){
        new Chart(prodCanvas, {
          type: 'doughnut',
          data: {
            labels: ['Working','Idle','Offline'],
            datasets: [{
              data: [3129.33,5043.99,178053.14],
              backgroundColor: ['#0a8f11','#e0a800','#e03232'],
              hoverBackgroundColor: ['#2ec43a','#ffd34d','#ff6b6b'],
              hoverOffset: 0
            }]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                enabled: false,
                external: function(context){
                  const chart = context.chart;
                  const tooltip = context.tooltip;
                  let tooltipEl = document.querySelector('.progress-tooltip');
                  if(!tooltipEl){
                    tooltipEl = document.createElement('div');
                    tooltipEl.className = 'progress-tooltip';
                    tooltipEl.style.display = 'none';
                    document.body.appendChild(tooltipEl);
                  }
                  if(tooltip.opacity === 0){ tooltipEl.style.display = 'none'; return; }
                  tooltipEl.innerHTML = '';
                  // Determine header/title
                  const header = chart.canvas.dataset.tooltipTitle || (chart.canvas.id === 'productivityChart' ? 'Work Time' : (chart.canvas.id === 'monitoringChart' ? 'Monitoring' : (tooltip.title && tooltip.title[0]) || ''));
                  // Pull data point and compute percent
                  let rawValue = 0; let label = '';
                  if(tooltip.dataPoints && tooltip.dataPoints.length){
                    const dp = tooltip.dataPoints[0];
                    rawValue = (dp.raw != null) ? dp.raw : (dp.parsed != null ? dp.parsed : 0);
                    label = dp.label || (tooltip.title && tooltip.title[0]) || '';
                  }
                  const dataset = (chart.data && chart.data.datasets && chart.data.datasets[0]) ? chart.data.datasets[0].data : [];
                  const sum = Array.isArray(dataset) ? dataset.reduce((s,n)=> s + (Number(n)||0), 0) : 0;
                  const percent = sum ? (Number(rawValue) / sum * 100) : 0;
                  const formattedVal = (Number(rawValue) || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
                  const percentStr = percent.toFixed(2) + '%';

                  // Build tooltip DOM matching desired layout
                  const headerEl = document.createElement('div'); headerEl.className = 'tt-header'; headerEl.textContent = header || label;
                  const mainEl = document.createElement('div'); mainEl.className = 'tt-main';
                  const mainLabel = document.createElement('span'); mainLabel.className = 'tt-main-label'; mainLabel.textContent = 'Time(Hours): ';
                  const mainValue = document.createElement('span'); mainValue.className = 'tt-main-value'; mainValue.textContent = formattedVal;
                  mainEl.appendChild(mainLabel); mainEl.appendChild(mainValue);
                  const pctEl = document.createElement('div'); pctEl.className = 'tt-percent'; pctEl.textContent = percentStr;
                  const iconEl = document.createElement('div'); iconEl.className = 'tt-icon';
                  iconEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8l4 4H8l4-4z" fill="white"/></svg>';

                  // Put header/main/percent into a content wrapper (right column)
                  const contentWrap = document.createElement('div'); contentWrap.className = 'tt-content';
                  contentWrap.appendChild(headerEl);
                  contentWrap.appendChild(mainEl);
                  contentWrap.appendChild(pctEl);

                  // Append icon first so CSS grid places it in the left column
                  tooltipEl.appendChild(contentWrap);
                  tooltipEl.appendChild(iconEl);
                  tooltipEl.style.display = 'grid';

                  // size tooltip relative to chart width (keep it visually similar to the screenshot)
                  const rect = chart.canvas.getBoundingClientRect();
                  const preferredWidth = Math.min(Math.max(rect.width * 0.7, 220), 520);
                  tooltipEl.style.width = preferredWidth + 'px';
                  const ttRect = tooltipEl.getBoundingClientRect();
                  let left = rect.left + (rect.width/2) - (ttRect.width/2);
                  let top = rect.bottom + 8;
                  if(top + ttRect.height > window.innerHeight - 8) top = rect.top - ttRect.height - 8;
                  if(left + ttRect.width > window.innerWidth - 8) left = window.innerWidth - ttRect.width - 8;
                  if(left < 8) left = 8; if(top < 8) top = 8;
                  tooltipEl.style.left = left + 'px'; tooltipEl.style.top = top + 'px';
                }
              }
            },
            cutout: '70%'
          }
        });
      }

      const monCanvas = document.getElementById('monitoringChart');
      if(monCanvas){
        new Chart(monCanvas, {
          type: 'doughnut',
          data: {
            labels: ['Monitored','Other'],
            datasets: [{ data: [57,29], backgroundColor: ['#1fa65a','#6b6f74'], hoverBackgroundColor: ['#45d07f','#9aa0a5'], hoverOffset: 0 }]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                enabled: false,
                external: function(context){
                  const chart = context.chart;
                  const tooltip = context.tooltip;
                  let tooltipEl = document.querySelector('.progress-tooltip');
                  if(!tooltipEl){
                    tooltipEl = document.createElement('div');
                    tooltipEl.className = 'progress-tooltip';
                    tooltipEl.style.display = 'none';
                    document.body.appendChild(tooltipEl);
                  }
                  if(tooltip.opacity === 0){ tooltipEl.style.display = 'none'; return; }
                  tooltipEl.innerHTML = '';

                  // header and datapoint
                  const header = chart.canvas.dataset.tooltipTitle || (chart.canvas.id === 'monitoringChart' ? 'Monitoring' : (tooltip.title && tooltip.title[0]) || '');
                  let rawValue = 0; let label = '';
                  if(tooltip.dataPoints && tooltip.dataPoints.length){
                    const dp = tooltip.dataPoints[0];
                    rawValue = (dp.raw != null) ? dp.raw : (dp.parsed != null ? dp.parsed : 0);
                    label = dp.label || (tooltip.title && tooltip.title[0]) || '';
                  }
                  const dataset = (chart.data && chart.data.datasets && chart.data.datasets[0]) ? chart.data.datasets[0].data : [];
                  const sum = Array.isArray(dataset) ? dataset.reduce((s,n)=> s + (Number(n)||0), 0) : 0;
                  const percent = sum ? (Number(rawValue) / sum * 100) : 0;
                  const formattedVal = (Number(rawValue) || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
                  const percentStr = percent.toFixed(2) + '%';

                  const headerEl = document.createElement('div'); headerEl.className = 'tt-header'; headerEl.textContent = header || label;
                  const mainEl = document.createElement('div'); mainEl.className = 'tt-main';
                  const mainLabel = document.createElement('span'); mainLabel.className = 'tt-main-label'; mainLabel.textContent = 'Time(Hours): ';
                  const mainValue = document.createElement('span'); mainValue.className = 'tt-main-value'; mainValue.textContent = formattedVal;
                  mainEl.appendChild(mainLabel); mainEl.appendChild(mainValue);
                  const pctEl = document.createElement('div'); pctEl.className = 'tt-percent'; pctEl.textContent = percentStr;
                  const iconEl = document.createElement('div'); iconEl.className = 'tt-icon';
                  iconEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8l4 4H8l4-4z" fill="white"/></svg>';

                  const contentWrap = document.createElement('div'); contentWrap.className = 'tt-content';
                  contentWrap.appendChild(headerEl);
                  contentWrap.appendChild(mainEl);
                  contentWrap.appendChild(pctEl);

                  tooltipEl.appendChild(contentWrap);
                  tooltipEl.appendChild(iconEl);
                  tooltipEl.style.display = 'grid';

                  // size tooltip relative to chart width
                  const rect = chart.canvas.getBoundingClientRect();
                  const preferredWidth = Math.min(Math.max(rect.width * 0.7, 200), 520);
                  tooltipEl.style.width = preferredWidth + 'px';
                  const ttRect = tooltipEl.getBoundingClientRect();
                  let left = rect.left + (rect.width/2) - (ttRect.width/2);
                  let top = rect.bottom + 8;
                  if(top + ttRect.height > window.innerHeight - 8) top = rect.top - ttRect.height - 8;
                  if(left + ttRect.width > window.innerWidth - 8) left = window.innerWidth - ttRect.width - 8;
                  if(left < 8) left = 8; if(top < 8) top = 8;
                  tooltipEl.style.left = left + 'px'; tooltipEl.style.top = top + 'px';
                }
              }
            },
            cutout: '70%'
          }
        });
      }

      // Safety panel sparklines (small line charts) for CPS and SBI
      function makeSparkline(canvasId, data, color){
        const c = document.getElementById(canvasId);
        if(!c) return null;
        const ctx = c.getContext('2d');
        // mark last point red
        const pointColors = data.map((_,i)=> i === data.length-1 ? '#e03232' : color);
        return new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.map((_,i)=> i+1),
            datasets: [{
              data: data,
              borderColor: color,
              backgroundColor: color === '#0a8f11' ? 'rgba(10,143,17,0.12)' : 'rgba(34,140,230,0.12)',
              fill: true,
              tension: 0.3,
              pointRadius: 0,
              pointBackgroundColor: pointColors,
              pointBorderColor: pointColors,
              borderWidth: 2
            }]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
              x: { display: false, grid: { display: false }, ticks: { display: false } },
              y: { display: false, grid: { display: false }, ticks: { display: false }, suggestedMin: 0 }
            },
            elements: { point: { radius: 0, hoverRadius: 0 } },
            animation: { duration: 400 }
          }
        });
      }

      // sample sparkline data (replace with real values if needed)
      // CPS and SBI charts replaced by solid bars; sparklines removed for both
    }
  } catch(e){ console.warn('Chart init failed', e); }

  // Set progress bar levels from data attributes (e.g., data-left-percent="68")
  function applyProgressBarLevels(){
    document.querySelectorAll('.progress.cps-bar').forEach(bar=>{
      const left = parseFloat(bar.getAttribute('data-left-percent')) || 0;
      const middle = parseFloat(bar.getAttribute('data-middle-percent')) || 0;
      const leftEl = bar.querySelector('.progress-fill');
      const midEl = bar.querySelector('.progress-fill-yellow');
      const rightEl = bar.querySelector('.progress-fill-red');
      // compute widths: left, middle (optional), right = remaining
      const right = Math.max(0, 100 - left - middle);
      if(leftEl) leftEl.style.width = left + '%';
      if(midEl) midEl.style.width = middle + '%';
      if(rightEl) rightEl.style.width = right + '%';
    });
  }

  // apply on DOM ready (already inside DOMContentLoaded handler)
  applyProgressBarLevels();

  // Tooltip helper for left fill segments
  (function(){
    let tooltipEl = null;
    function createTooltip(){
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'progress-tooltip';
      tooltipEl.style.display = 'none';
      document.body.appendChild(tooltipEl);
    }
    function showTooltip(title, value, rect){
      if(!tooltipEl) createTooltip();
      tooltipEl.innerHTML = '';
      const t = document.createElement('div'); t.className = 'tt-title';
      const v = document.createElement('div'); v.className = 'tt-value';
      // allow HTML in values (e.g., bold number) when the string contains tags
      if(typeof title === 'string' && /<[^>]+>/.test(title)) t.innerHTML = title; else t.textContent = title;
      if(typeof value === 'string' && /<[^>]+>/.test(value)) v.innerHTML = value; else v.textContent = value;
      tooltipEl.appendChild(t); tooltipEl.appendChild(v);
      tooltipEl.style.display = 'flex';
      // position below the rect by default (centered horizontally).
      // If there's not enough room below, fall back to above.
      const ttRect = tooltipEl.getBoundingClientRect();
      let left = rect.left + (rect.width / 2) - (ttRect.width / 2);
      let top = rect.bottom + 8; // place below the element
      // If placing below overflows the viewport vertically, place above
      if(top + ttRect.height > window.innerHeight - 8){
        top = rect.top - ttRect.height - 8; // above the element
      }
      // Keep inside viewport horizontally
      if(left + ttRect.width > window.innerWidth - 8){
        left = window.innerWidth - ttRect.width - 8;
      }
      if(left < 8) left = 8;
      if(top < 8) top = 8;
      tooltipEl.style.left = left + 'px';
      tooltipEl.style.top = top + 'px';
    }
    function hideTooltip(){ if(tooltipEl) tooltipEl.style.display = 'none'; }

    // attach listeners to left fill segments
    document.querySelectorAll('.progress.cps-bar').forEach(bar=>{
      const leftEl = bar.querySelector('.progress-fill');
      if(!leftEl) return;
      const title = bar.getAttribute('data-left-title') || '';
      const value = bar.getAttribute('data-left-value') || '';
      leftEl.addEventListener('mouseenter', ()=>{
        const rect = leftEl.getBoundingClientRect();
        showTooltip(title, value, rect);
      });
      leftEl.addEventListener('mousemove', ()=>{
        const rect = leftEl.getBoundingClientRect();
        if(tooltipEl && tooltipEl.style.display !== 'none') showTooltip(title, value, rect);
      });
      leftEl.addEventListener('mouseleave', ()=>{ hideTooltip(); });
      // attach listeners to the right (red) segment if present
      const rightEl = bar.querySelector('.progress-fill-red');
      if(rightEl){
        const rTitle = bar.getAttribute('data-right-title') || bar.getAttribute('data-right') || 'Info';
        const rValue = bar.getAttribute('data-right-value') || '';
        rightEl.addEventListener('mouseenter', ()=>{
          const rect = rightEl.getBoundingClientRect();
          showTooltip(rTitle, rValue, rect);
        });
        rightEl.addEventListener('mousemove', ()=>{
          const rect = rightEl.getBoundingClientRect();
          if(tooltipEl && tooltipEl.style.display !== 'none') showTooltip(rTitle, rValue, rect);
        });
        rightEl.addEventListener('mouseleave', ()=>{ hideTooltip(); });
      }
      // attach listeners to the middle (yellow) segment if present
      const midEl = bar.querySelector('.progress-fill-yellow');
      if(midEl){
        const mTitle = bar.getAttribute('data-middle-title') || '';
        const mValue = bar.getAttribute('data-middle-value') || '';
        midEl.addEventListener('mouseenter', ()=>{
          const rect = midEl.getBoundingClientRect();
          showTooltip(mTitle, mValue, rect);
        });
        midEl.addEventListener('mousemove', ()=>{
          const rect = midEl.getBoundingClientRect();
          if(tooltipEl && tooltipEl.style.display !== 'none') showTooltip(mTitle, mValue, rect);
        });
        midEl.addEventListener('mouseleave', ()=>{ hideTooltip(); });
      }
    });
  })();

});
