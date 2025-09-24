(function(){
  const notifs = Array.from(document.querySelectorAll('.notif'));
  if (!notifs.length) return;

  function closeAll(except) {
    notifs.forEach(n => {
      if (n !== except) {
        n.classList.remove('open');
        const b = n.querySelector('.notif-bell');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });
  }

  notifs.forEach(notif => {
    const btn = notif.querySelector('.notif-bell');
    const panel = notif.querySelector('.notif-panel');
    if (!btn || !panel) return;

    let closeTimer;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const willOpen = !notif.classList.contains('open');
      closeAll(willOpen ? notif : null);
      notif.classList.toggle('open');
      btn.setAttribute('aria-expanded', notif.classList.contains('open') ? 'true' : 'false');
    });

    // Desktop hover support
    notif.addEventListener('mouseenter', () => {
      clearTimeout(closeTimer);
      notif.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    });
    notif.addEventListener('mouseleave', () => {
      closeTimer = setTimeout(() => {
        notif.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }, 120);
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    const clickedNotif = e.target.closest('.notif');
    if (!clickedNotif) {
      closeAll(null);
    }
  });

  // Keyboard accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAll(null);
      const firstBtn = document.querySelector('.notif .notif-bell');
      if (firstBtn) firstBtn.focus();
    }
  });
})();
