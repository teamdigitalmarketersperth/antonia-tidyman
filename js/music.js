/* ==========================================================================
   Background music. Never autoplays: it starts only when a visitor presses
   "Play music". If no music file has been added yet, the control stays
   hidden, so visitors never meet a button that does nothing.

   To add music: place the file in assets/audio/ and set its path on the
   <audio data-music-src=""> element in index.html.
   ========================================================================== */
(() => {
  const btn = document.querySelector('[data-music]');
  const audio = document.querySelector('audio[data-music-src]');
  if (!btn || !audio) return;

  const src = audio.dataset.musicSrc;
  if (!src) return;  // no music added yet: control stays hidden
  const label = btn.querySelector('.music__label');
  const TARGET = 0.6;
  let fade = null;

  audio.loop = true;
  if (audio.dataset.musicTitle) btn.title = audio.dataset.musicTitle;

  // Only show the control once we know the file is really there.
  fetch(src, { method: 'HEAD' })
    .then((res) => { if (res.ok) btn.hidden = false; })
    .catch(() => { /* no file, or opened from disk: keep it hidden */ });

  function ramp(to, done) {
    clearInterval(fade);
    const step = (to - audio.volume) / 20;
    fade = setInterval(() => {
      const v = audio.volume + step;
      if ((step >= 0 && v >= to) || (step < 0 && v <= to)) {
        audio.volume = to;
        clearInterval(fade);
        done?.();
      } else {
        audio.volume = v;
      }
    }, 60);
  }

  function setState(playing) {
    btn.toggleAttribute('data-playing', playing);
    label.textContent = playing ? 'Pause music' : 'Play music';
  }

  btn.addEventListener('click', async () => {
    if (!audio.paused) {
      setState(false);
      ramp(0, () => audio.pause());
      return;
    }
    if (!audio.getAttribute('src')) audio.src = src;
    audio.volume = 0;
    try {
      await audio.play();
      setState(true);
      ramp(TARGET);
    } catch {
      setState(false);
    }
  });

  audio.addEventListener('error', () => {
    setState(false);
    btn.disabled = true;
    label.textContent = 'Music unavailable';
  });
  // Paused elsewhere (e.g. phone lock-screen controls)
  audio.addEventListener('pause', () => setState(false));
  audio.addEventListener('play', () => setState(true));
})();
