/* ==========================================================================
   Antonia Tidyman: A Life Remembered
   Scroll reveals, running head, memory wall and sharing.
   ========================================================================== */

/* --------------------------------------------------------------------------
   MEMORY WALL SETTINGS. The only part of this file most people need to edit.

   endpoint     Leave '' until a submission service exists (Formspree, Netlify
                Forms, Basin, a Google Apps Script, etc). When set, memories are
                POSTed as JSON { name, relationship, message } and the family
                reviews them before adding them to index.html.
   familyEmail  Optional. When set (and there is no endpoint), visitors are
                offered "Email it to the family" after keeping a memory.
   -------------------------------------------------------------------------- */
const MEMORY_CONFIG = {
  endpoint: '',
  familyEmail: ''
};

/* The permanent address, once known. Used by "Share this memorial".
   Leave '' to use whatever address the page is opened from. */
const MEMORIAL_URL = 'https://teamdigitalmarketersperth.github.io/antonia-tidyman/';

const STORE_KEY = 'antonia-memories-local';

/* ---------- Photographs develop as they come into view ---------- */
(() => {
  const items = document.querySelectorAll('.reveal-photo');
  const done = (el) => {
    el.classList.add('is-in');
    el.querySelector('img')?.addEventListener('transitionend', () => el.classList.add('reveal-done'), { once: true });
  };
  if (!('IntersectionObserver' in window)) return items.forEach(done);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      done(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach((el) => io.observe(el));
})();

/* ---------- Running head: show the chapter being read ---------- */
(() => {
  const label = document.querySelector('.running-head__chapter');
  const links = [...document.querySelectorAll('.running-head__nav a')];
  const chapters = document.querySelectorAll('[data-chapter]');
  if (!label || !('IntersectionObserver' in window)) return;

  let current = '';
  const set = (section) => {
    const text = section ? section.dataset.chapter : '';
    if (text === current) return;
    current = text;
    label.classList.add('is-changing');
    setTimeout(() => { label.textContent = text; label.classList.remove('is-changing'); }, 180);
    links.forEach((a) => {
      if (section && a.hash === '#' + section.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };

  // A chapter is "current" when it crosses the middle band of the screen.
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) set(e.target); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  chapters.forEach((c) => io.observe(c));

  // Back in the frontispiece: clear the title.
  const hero = document.querySelector('.frontispiece');
  new IntersectionObserver(([e]) => { if (e.isIntersecting) set(null); }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
})();

/* ---------- Memory wall ---------- */
(() => {
  const form = document.querySelector('[data-memory-form]');
  if (!form) return;
  const notes = document.querySelector('[data-notes]');
  const status = document.querySelector('[data-memory-status]');
  const error = form.querySelector('[data-form-error]');
  const submit = form.querySelector('[data-memory-submit]');
  const hasEndpoint = !!MEMORY_CONFIG.endpoint;

  if (hasEndpoint) {
    submit.textContent = 'Send to the family';
    form.querySelector('[data-memory-mode]').textContent =
      'Your memory goes privately to the family. They may choose to share it here.';
  }

  const store = {
    read() {
      try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { return []; }
    },
    write(list) {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); return true; } catch { return false; }
    }
  };

  const asText = (m) => `${m.message}\n\n${m.name}${m.relationship ? ', ' + m.relationship : ''}`;

  const copy = async (text, onDone) => {
    try { await navigator.clipboard.writeText(text); onDone('Copied. You can now paste it into a message or email.'); }
    catch { onDone('Copying is not available here. Please select the text and copy it.'); }
  };

  function renderLocal(m, arriving) {
    const note = document.createElement('article');
    note.className = 'note note--local' + (arriving ? ' note--arriving' : '');
    note.dataset.id = m.id;

    const p = document.createElement('p');
    p.textContent = m.message;
    const foot = document.createElement('footer');
    const name = document.createElement('span');
    name.className = 'note__name';
    name.textContent = m.name;
    foot.append(name);
    if (m.relationship) {
      const rel = document.createElement('span');
      rel.className = 'note__rel';
      rel.textContent = m.relationship;
      foot.append(' ', rel);
    }

    const actions = document.createElement('div');
    actions.className = 'note__actions';
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.textContent = 'Copy text';
    copyBtn.addEventListener('click', () => copy(asText(m), (msg) => showStatus(msg)));
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove from this device';
    removeBtn.addEventListener('click', () => {
      store.write(store.read().filter((x) => x.id !== m.id));
      note.remove();
      showStatus('Removed from this device.');
    });
    actions.append(copyBtn, removeBtn);

    note.append(p, foot, actions);
    notes.append(note);
    return note;
  }

  function showStatus(message, extras = []) {
    status.replaceChildren(document.createTextNode(message));
    if (extras.length) {
      const row = document.createElement('div');
      row.append(...extras);
      status.append(row);
    }
    status.hidden = false;
  }

  function invalid(field, message) {
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', 'm-error');
    error.id = 'm-error';
    error.textContent = message;
    error.hidden = false;
    field.focus();
  }

  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) {
      e.target.removeAttribute('aria-invalid');
      e.target.removeAttribute('aria-describedby');
      error.hidden = true;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: form.name.value.trim(),
      relationship: form.relationship.value.trim(),
      message: form.message.value.trim()
    };
    if (!data.name) return invalid(form.name, 'Please add your name.');
    if (!data.message) return invalid(form.message, 'Please write your memory or message.');
    error.hidden = true;

    if (hasEndpoint) {
      submit.disabled = true;
      try {
        const res = await fetch(MEMORY_CONFIG.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        showStatus('Thank you. Your memory has been sent to the family. It will appear here if they choose to share it.');
      } catch {
        showStatus('Your memory could not be sent. Please check your connection and try again. Your words are still in the form.');
      } finally {
        submit.disabled = false;
      }
      return;
    }

    // No submission service yet: keep it on this device only, and say so plainly.
    const m = { id: Date.now().toString(36), ...data };
    const saved = store.write([...store.read(), m]);
    const note = renderLocal(m, true);
    form.reset();

    const extras = [];
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.textContent = 'Copy my memory';
    copyBtn.addEventListener('click', () => copy(asText(m), (msg) => showStatus(msg)));
    extras.push(copyBtn);
    if (MEMORY_CONFIG.familyEmail) {
      const mail = document.createElement('a');
      mail.href = `mailto:${MEMORY_CONFIG.familyEmail}?subject=${encodeURIComponent('A memory of Antonia')}&body=${encodeURIComponent(asText(m))}`;
      mail.textContent = 'Email it to the family';
      extras.push(mail);
    }
    showStatus(
      (saved ? 'Your memory is kept in this browser only. ' : 'Your memory is shown below for now, but this browser could not keep it. ') +
      'It has not been sent to the family or shared with anyone else. To share it, copy it into a message to the family.',
      extras
    );
    note.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  if (!hasEndpoint) store.read().forEach((m) => renderLocal(m, false));
})();

/* ---------- Share this memorial ---------- */
(() => {
  const btn = document.querySelector('[data-share]');
  const out = document.querySelector('[data-share-status]');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const url = MEMORIAL_URL || location.href.split('#')[0];
    const isLocal = !/^https?:$/.test(location.protocol) || /^(localhost|127\.|\[::1\])/.test(location.hostname);
    if (!MEMORIAL_URL && isLocal) {
      out.textContent = 'The memorial link will be ready to share once the page is published.';
      return;
    }
    if (navigator.share) {
      try { await navigator.share({ title: 'Antonia Tidyman: A Life Remembered', url }); } catch { /* closed by visitor */ }
      return;
    }
    try { await navigator.clipboard.writeText(url); out.textContent = 'Memorial link copied.'; }
    catch { out.textContent = url; }
  });
})();
