# Antonia Tidyman: A Life Remembered

A single-page digital memorial for Antonia Tidyman (born 6 January 1955, Siġġiewi, Malta). It is designed to be opened from a QR code in the funeral program or at her resting place, or from a link shared by message.

It is a **static website**: HTML, CSS and vanilla JavaScript. There's no framework, no build step, no server, no database and no tracking.

---

## 1. Preview it

Some features (the photo viewer, music, sharing) need a real web address rather than a file opened from disk, so run a small local server:

```bash
# from this folder, with Python installed
python -m http.server 8000
# then open http://localhost:8000
```

## 2. Publish it

Upload the whole folder (`index.html`, `css/`, `js/`, `assets/`) to any static host. There is no build command, and the output folder is the project root.

- **Netlify:** drag the folder onto app.netlify.com/drop
- **Cloudflare Pages / GitHub Pages / Vercel:** point the host at this folder
- **Ordinary web hosting:** upload by FTP into the public folder

### After it is live (in this order)

1. **Confirm the permanent address**, ideally a domain the family owns (e.g. `antoniatidyman.com.au`), so the printed QR codes never break.
2. In `js/main.js`, set `MEMORIAL_URL` to that address.
3. In `index.html`, make `og:image` a full address and add an `og:url` line (the comment above them explains how). This gives a proper preview card in WhatsApp and Messages.
4. **Generate the QR code** from that exact address, using any reputable generator, or `npx qrcode -o qr.png "https://…"`. Test-scan it on two phones before sending anything to print.

No QR code has been generated yet, because the final address isn't known. A QR code pointing at a temporary address would break when the address changes.

---

## 3. Editing the content

All content is plain text in **`index.html`**, with comments marking each section. Anything not yet confirmed carries `class="tbc"`, which shows it in a quieter italic style. Replace the text and remove the class once it's confirmed.

| What | Where |
|---|---|
| Date of passing | `index.html`, in the opening section: replace `<span class="tbc">date to be confirmed</span>` with e.g. `<time datetime="2026-09-14">14 September 2026</time>` |
| Funeral service and gathering | `index.html`, section 6. Each `<article class="event">` is one occasion |
| Order of service | `index.html`, the `<ol class="order__list">` |
| Resting place | `index.html`, section 7 |
| Biography, quotations, book text | `index.html`, sections 2 and 5 |
| Approved tributes | `index.html`, section 4 (see 3.2) |

### 3.1 Photographs

Each photograph is one `<figure>` in the album. To add one:

1. Make two WebP files in `assets/images/`: `name-sm.webp` (about 560 px wide) and `name-lg.webp` (up to 1600 px wide). Squoosh.app does this for free.
2. Copy an existing `<figure class="plate …">` block, then change the file names, the `width`/`height` (of the `-lg` file, which prevents layout jumping), the `alt` text, the `aria-label` and the caption.
3. Classes `p1`–`p13` set each photo's designed position on large screens. A new figure without one of those classes joins the end of the album.

The photo viewer picks up new photographs automatically.

Captions describe only what is visible ("Lunch by the water"), because no names, places or years were supplied. The family may like to add them.

### 3.2 The memory wall

Three **sample** notes currently show the design. Each is clearly marked "Sample" and introduced by a notice. When the family approves real tributes, replace them with:

```html
<article class="note">
  <p>Antonia could fill a room with laughter…</p>
  <footer><span class="note__name">Maria</span> <span class="note__rel">Friend since 1972</span></footer>
</article>
```

Then delete the sample notes and the `wall__sample-notice` paragraph. Line breaks inside the message are kept.

### 3.3 "Leave a memory": what it does and doesn't do

**Important:** this is a frontend-only site, so it **cannot publish or send messages by itself.**

As delivered (no submission service connected):

- The visitor's memory is kept **in their own browser only** (`localStorage`). It appears on the wall for them alone, with a dashed border and the label "Only on this device".
- The page tells them plainly that it **has not been sent to the family or anyone else**, and offers **Copy my memory** so they can send it by message or email.
- If `familyEmail` is set in `js/main.js` (`MEMORY_CONFIG`), an **Email it to the family** link is also offered.
- Visitors can remove it from their device at any time.

**To collect memories properly**, connect a form service (Formspree, Netlify Forms, Basin, a Google Apps Script, or similar):

1. Set `MEMORY_CONFIG.endpoint` in `js/main.js` to the service's URL.
2. Submissions are POSTed as JSON `{ name, relationship, message }`. The button text changes to "Send to the family", and visitors are told the family may choose to share their memory.
3. The family reviews submissions and adds the approved ones to `index.html` (3.2). Nothing a visitor writes ever appears publicly without that review.

Visitor text is always inserted as plain text, never as HTML.

### 3.4 Music

The music control appears only once a music file exists, so visitors never see a button that does nothing.

1. Put the file in `assets/audio/`, e.g. `assets/audio/memorial-music.mp3`. MP3 works everywhere; keep it under about 5 MB.
2. In `index.html`, set `data-music-src="assets/audio/memorial-music.mp3"` on the `<audio>` element. Optionally change `data-music-title`.

The music never starts by itself, because browsers block that and it would be unkind anyway. Visitors press **Play music** in the top bar. It fades in and out and loops. Please make sure the family has the right to use the recording on a public website.

### 3.5 Search engines

The page currently allows search engines (`robots: index, follow`), so distant relatives can find it by name. If the family would prefer it reachable only by link and QR code, change that line in `index.html` to `noindex`.

---

## 4. Awaiting confirmation from the family

The page doesn't invent anything. Before it goes live, please confirm:

- [ ] **Date of passing**: currently "date to be confirmed".
- [ ] **Funeral service**: date, time and venue (none are in the program).
- [ ] **Gathering at Biviano's, 628 Old Northern Road, Dural NSW, 12:30 pm**: the date, and whether this is the service, the reception, or both. Shown as "Gathering to remember".
- [ ] **Order of service**: taken from the draft program and labelled "draft, subject to change"; includes "Second Reading (if included)".
- [ ] **Castlebrook Memorial Park, Rouse Hill NSW**: named in the program as her resting place. Is the location within the park wanted? The page says the family *intends* to place a QR code there; it doesn't claim one is installed.
- [ ] **Real tributes** to replace the three samples.
- [ ] **Music file**, and permission to use it.
- [ ] **Family email** (optional) and/or a form service for memories.
- [ ] **Permanent web address**, then the QR code.
- [ ] **Photo captions**: names, places and years, if wanted.
- [ ] **Quotations in Antonia's own words**: both are verbatim from her author page at maltabook.com.au ("Sharing nice dinners…" and "It is my hope that my children…"). Please confirm the family is happy to use them.
- [ ] **Pull quote** "No matter how difficult life became, she always found a way to make things happen." is from the family's obituary in the program. It is credited to the family, not to Antonia.
- [ ] **"Antonia Bridgett Tidyman"** under the opening portrait: taken from her book's author name.
- [ ] **Book cover**: taken from maltabook.com.au.

**Deliberately left out:** the poem *Don't Miss Me More Than Once a Day* by Donna Ashworth, which is in the program. It is a published, copyrighted work; add it only with permission. Her husband Gary is named on her author page but not in the family's obituary, so the page doesn't name him. Add him if the family wishes.

---

## 5. Files

```
index.html             All content (works without JavaScript)
css/style.css          Tokens, typography and the phone layout
css/responsive.css     Tablet and desktop compositions
css/animations.css     The opening and the photo reveals (skipped for reduced motion)
js/main.js             Photo reveals, running head, memory wall, sharing  ← MEMORY_CONFIG, MEMORIAL_URL
js/gallery.js          Photo viewer: keyboard, swipe, focus return
js/music.js            Music control (hidden until a file is set)
assets/images/         WebP photographs (-sm / -lg) and the sharing image
assets/audio/          Put the music file here
assets/icons/          Favicon
```

External resources: Google Fonts only (EB Garamond, Manrope). Full-size original photographs are in the earlier project at `D:\For-After Landing Page\assets\images\originals\`; this site doesn't need them.

## 6. Design notes

**Concept: the frontispiece.** The page is set as Antonia's own book. On desktop it opens on an open-book spread: her portrait as a tipped-in plate on the left page (a pale tissue guard lifts from it as the page loads), and a classical title page on the right, with a soft gutter between them. The rest follows book conventions:

- a **running head** that shows the chapter you're reading and holds the music control;
- photographs as **plates**, each with a fine champagne plate mark and an italic caption;
- the memory wall as **notes tucked between pages**, plus a blank ruled page to write on;
- the service set as a **printed order-of-service card**;
- the pencil portrait dissolving into the final page, and a short **colophon** at the end.

**Type:** EB Garamond (with true small capitals and old-style figures) for everything that is read, and Manrope only for practical information: service details, form labels and controls. Body text is 19–20 px for older readers.

**Colour:** the brief's palette, with two deepened tones (`#5E564C`, `#56604C`) for small text so that every text colour meets WCAG AA.

**Motion:** one orchestrated opening and gentle photographic reveals, nothing else. With *Reduce motion* switched on, nothing animates or waits. Without JavaScript, everything is visible.

## 7. Accessibility and quality checks done

Tested in Chrome (headless, via Puppeteer) at 360, 390, 768, 1024, 1440 and 1920 px: no horizontal overflow and no console errors. Automated checks passed for:

- the skip link;
- the photo viewer: open, arrows, wrap-around, swipe, Esc, and focus returning to the photo;
- the form: validation, HTML escaping, persistence and removal;
- sharing behaviour before publishing;
- music: hidden with no file, plays and fades with one, pauses;
- the running head's chapter and nav state;
- reduced motion, and JavaScript switched off.

Every text colour was checked against WCAG AA contrast.

**Not yet tested:** real iOS Safari and Android devices, and a screen reader (VoiceOver/TalkBack). Please do a quick check on a real phone before printing the QR code.
