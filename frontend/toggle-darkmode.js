  const toggle = document.getElementById('toggleDark');
  const body = document.querySelector('body');
  const logo = document.getElementById('brand-logo');

  toggle.addEventListener('click', () => {
    const isLightMode = body.classList.toggle('light-mode');
    toggle.classList.toggle('bi-brightness-high-fill', !isLightMode);
    toggle.classList.toggle('bi-moon', isLightMode);
    toggle.setAttribute('aria-label', isLightMode ? 'Switch to dark mode' : 'Switch to light mode');
    if (logo) {
      logo.src = isLightMode
        ? '../../images/teacherAiBlueUnderline.png'
        : '../../images/whiteTeacherAiTransparent.png';
    }
  });