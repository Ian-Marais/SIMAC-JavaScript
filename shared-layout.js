(function () {
  const path = (window.location.pathname || '').toLowerCase();
  const isLoginPage = path.endsWith('/login.html') || path.endsWith('/login');
  if (isLoginPage) return;

  const sidebarMount = document.getElementById('sharedSidebar');
  const topbarMount = document.getElementById('sharedTopbar');
  if (!sidebarMount || !topbarMount) return;

  sidebarMount.innerHTML = `
  <aside class="sidebar">
    <nav class="nav">
      <ul>
        <li>
          <span class="icon">
            <i class="bi bi-house" aria-hidden="true"></i>
          </span>
          <span class="label" data-i18n="nav.home">Home</span>
        </li>
        <li class="expandable">
          <span class="icon">
            <i class="bi bi-bell" aria-hidden="true"></i>
          </span>
          <span class="label" data-i18n="nav.alerts">Alerts</span>
          <span class="caret" aria-hidden="true">
            <svg class="chev" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <ul class="sub-list" aria-hidden="true">
            <li class="sub-item"><i class="bi bi-bell"></i> <span data-i18n="nav.alerts.active">Active Alerts</span></li>
            <li class="sub-item"><i class="bi bi-clock-history"></i> <span data-i18n="nav.alerts.history">Alerts History</span></li>
          </ul>
        </li>
        <li>
          <span class="icon">
            <i class="bi bi-truck" aria-hidden="true"></i>
          </span>
          <span class="label" data-i18n="nav.machines">Machines</span>
        </li>
        <li>
          <span class="icon">
            <i class="bi bi-grid" aria-hidden="true"></i>
          </span>
          <span class="label" data-i18n="nav.machine_groups">Machine Groups</span>
        </li>
        <li>
          <span class="icon">
            <i class="bi bi-diagram-3" aria-hidden="true"></i>
          </span>
          <span class="label" data-i18n="nav.my_machine_groups">My Machines Groups</span>
        </li>
        <li class="expandable">
          <span class="icon">
            <i class="bi bi-clipboard-check" aria-hidden="true"></i>
          </span>
          <span class="label" data-i18n="nav.machine_status">Machine Status</span>
          <span class="caret" aria-hidden="true">
            <svg class="chev" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <ul class="sub-list" aria-hidden="true">
            <li class="sub-item"><i class="bi bi-info-circle"></i> <span data-i18n="nav.machine_status.status">Status</span></li>
            <li class="sub-item"><i class="bi bi-graph-up"></i> <span data-i18n="nav.machine_status.trend">Trend</span></li>
            <li class="sub-item"><i class="bi bi-file-earmark-text"></i> <span data-i18n="nav.machine_status.documentation">Documentation</span></li>
          </ul>
        </li>
        <li>
          <span class="icon"><i class="bi bi-layout-sidebar" aria-hidden="true"></i></span>
          <span class="label" data-i18n="nav.dashboards">Dashboards</span>
        </li>
        <li>
          <a href="users.html" class="nav-link">
            <span class="icon"><i class="bi bi-people" aria-hidden="true"></i></span>
            <span class="label" data-i18n="nav.users">Users</span>
          </a>
        </li>
        <li>
          <span class="icon"><i class="bi bi-building" aria-hidden="true"></i></span>
          <span class="label" data-i18n="nav.organizations">Organizations</span>
        </li>
        <li>
          <span class="icon"><i class="bi bi-map" aria-hidden="true"></i></span>
          <span class="label" data-i18n="nav.sitelayout">SiteLayout</span>
        </li>
        <li>
          <span class="icon"><i class="bi bi-tags" aria-hidden="true"></i></span>
          <span class="label" data-i18n="nav.tags">Tags</span>
        </li>
      </ul>
    </nav>
  </aside>`;

  topbarMount.innerHTML = `
  <header class="topbar">
    <div class="left">
      <div class="header-hamburger">
        <button class="hamburger" aria-label="menu">
          <span class="line"></span>
          <span class="line"></span>
          <span class="line"></span>
        </button>
        <img class="simac-logo" src="https://simac.app/header_image_simac.png" alt="SIMAC logo">
      </div>
    </div>

    <div class="right">
      <div class="messages" title="Messages" id="messagesButton" data-i18n="header.messages">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 6.5V17a2 2 0 0 1-2 2H7l-5 3V6.5A2.5 2.5 0 0 1 4.5 4h13A2.5 2.5 0 0 1 20 6.5z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span class="badge" id="msgCount">0</span>
      </div>

      <div class="tz" id="tzDisplay">UTC+02:00</div>

      <div class="notifications-panel" id="notificationsPanel" aria-hidden="true">
        <div class="notif-header">
          <div class="title" data-i18n="header.notifications">NOTIFICATIONS:</div>
          <div class="notif-actions">
            <input class="notif-search" placeholder="Search" aria-label="Search notifications" data-i18n="header.search">
            <button class="view-all" data-i18n="header.view_all">View All</button>
          </div>
        </div>
        <div class="notif-table">
          <div class="thead">
            <div class="col notif-col">Notification</div>
            <div class="col info-col">Info</div>
            <div class="col time-col">Time stamp</div>
          </div>
          <div class="notif-list" id="notifList"><div class="empty">No notifications</div></div>
        </div>
      </div>

      <div class="org-selector" tabindex="0">
        <button class="org-btn"><span class="org-icon">GF</span><span class="org-label" data-i18n="org.label">Gold Fields - South Deep</span> <span class="org-caret">▾</span></button>
        <div class="org-panel" aria-hidden="true">
          <div class="org-panel-header"><input class="org-search" placeholder="Search" aria-label="Search organizations"></div>
          <div class="org-list" role="list"></div>
        </div>
      </div>

      <div class="profile" id="profileMenuWrap">
        <div class="avatar" id="avatar">SR</div>
        <div class="profile-name" id="profileName">Shaun Roselt ▾</div>
        <div class="profile-menu" id="profileMenu" aria-hidden="true">
          <label class="menu-item"><input type="checkbox" id="darkMode"> <span data-i18n="profile.dark_mode">Dark Mode</span></label>
          <div class="menu-item language-toggle" id="languageToggle">
            <span class="lang-label" data-i18n="profile.language">Language</span> ▸
            <div class="language-menu" id="languageMenu" aria-hidden="true"></div>
          </div>
          <div class="menu-item" data-i18n="profile.profile">Profile</div>
          <div class="menu-item" data-i18n="profile.organization">Organization</div>
          <div class="menu-item help-item">Help ▸
            <div class="help-panel" aria-hidden="true">
              <div class="help-row"><i class="bi bi-info-circle"></i><span data-i18n="profile.help.about">About</span></div>
              <div class="help-row"><i class="bi bi-book"></i><span data-i18n="profile.help.documentation">Documentation</span></div>
              <div class="help-row"><i class="bi bi-clock-history"></i><span data-i18n="profile.help.changelog">Change Log</span></div>
              <div class="help-row"><i class="bi bi-telephone"></i><span data-i18n="profile.help.contact">Contact Us</span></div>
            </div>
          </div>
          <div class="menu-item sign" id="authAction" data-i18n="profile.sign_out">Sign Out</div>
        </div>
      </div>
    </div>
  </header>`;
})();
