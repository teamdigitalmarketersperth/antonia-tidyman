/* ==========================================================================
   Photo viewer: click a photograph to see it larger.
   Arrow keys and swipe move between photographs; Esc or Close returns.
   Photographs are read from the page, so adding a <figure> to the album
   adds it here automatically.
   ========================================================================== */
(() => {
  const dialog = document.querySelector('[data-viewer]');
  const triggers = [...document.querySelectorAll('[data-gallery] .plate__open')];
  if (!dialog || !triggers.length || typeof dialog.showModal !== 'function') return;

  const img = dialog.querySelector('[data-viewer-img]');
  const caption = dialog.querySelector('[data-viewer-caption]');
  const count = dialog.querySelector('[data-viewer-count]');

  // Largest file from srcset, else src
  const largest = (el) => {
    const set = el.getAttribute('srcset');
    return set ? set.split(',').pop().trim().split(' ')[0] : el.getAttribute('src');
  };

  const photos = triggers.map((btn) => {
    const el = btn.querySelector('img');
    return {
      src: largest(el),
      alt: el.alt,
      caption: btn.closest('figure').querySelector('figcaption')?.textContent.trim() || ''
    };
  });

  let index = 0;
  let opener = null;

  function show(i) {
    index = (i + photos.length) % photos.length;
    const p = photos[index];
    img.classList.add('is-loading');
    img.onload = () => img.classList.remove('is-loading');
    img.src = p.src;
    img.alt = p.alt;
    caption.textContent = p.caption;
    count.textContent = `${index + 1} of ${photos.length}`;
    new Image().src = photos[(index + 1) % photos.length].src;  // warm the next one
  }

  triggers.forEach((btn, i) => btn.addEventListener('click', () => {
    opener = btn;
    show(i);
    dialog.showModal();
  }));

  dialog.querySelector('[data-viewer-prev]').addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-viewer-next]').addEventListener('click', () => show(index + 1));
  dialog.querySelector('[data-viewer-close]').addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
  });

  // Tap the dark surround to close
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.classList.contains('viewer__figure')) dialog.close();
  });

  dialog.addEventListener('close', () => opener?.focus());

  // Swipe left/right on touch screens
  let startX = 0, startY = 0;
  dialog.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  dialog.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
