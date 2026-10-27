/* =========================================================
   AnnaNails — лендинг с записью и скидкой 50%
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Шапка: тень при скролле ---------- */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Мобильное меню ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  burger.addEventListener('click', () => {
    burger.classList.toggle('is-open');
    nav.classList.toggle('is-open');
  });
  nav.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      burger.classList.remove('is-open');
      nav.classList.remove('is-open');
    })
  );

  /* ---------- Таймер акции (48 часов, хранится в localStorage) ---------- */
  const KEY = 'annaNailsPromoEnd';
  let end = Number(localStorage.getItem(KEY));
  if (!end || end < Date.now()) {
    end = Date.now() + 48 * 60 * 60 * 1000;
    localStorage.setItem(KEY, String(end));
  }
  const pad = (n) => String(n).padStart(2, '0');
  const tD = document.getElementById('t-days');
  const tH = document.getElementById('t-hours');
  const tM = document.getElementById('t-mins');
  const tS = document.getElementById('t-secs');

  function tick() {
    let diff = Math.max(0, end - Date.now());
    const d = Math.floor(diff / 86400000);
    diff -= d * 86400000;
    const h = Math.floor(diff / 3600000);
    diff -= h * 3600000;
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff - m * 60000) / 1000);
    tD.textContent = pad(d);
    tH.textContent = pad(h);
    tM.textContent = pad(m);
    tS.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Копирование промокода ---------- */
  const promoCode = document.getElementById('promoCode');
  promoCode.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(promoCode.textContent.trim());
    } catch (e) { /* буфер недоступен — код всё равно виден на кнопке */ }
    promoCode.classList.add('is-copied');
    promoCode.textContent = 'СКОПИРОВАНО';
    setTimeout(() => {
      promoCode.classList.remove('is-copied');
      promoCode.textContent = 'FIRST50';
    }, 1800);
  });

  /* ---------- Выбор времени ---------- */
  const timeChips = document.getElementById('timeChips');
  timeChips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    timeChips.querySelectorAll('.chip').forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
  });

  /* ---------- Цены: карта услуг ---------- */
  const PRICES = {
    'Маникюр без покрытия': { old: 1400, now: 700 },
    'Маникюр + гель-лак': { old: 2200, now: 1100 },
    'Маникюр + укрепление': { old: 2800, now: 1400 },
    'Дизайн ногтей': { old: 200, now: 100 },
    'Педикюр комбинированный': { old: 3000, now: 1500 },
    'Снятие покрытия': { old: 500, now: 250 }
  };
  const service = document.getElementById('service');
  const totalPrice = document.getElementById('totalPrice');
  const oldPrice = document.getElementById('oldPrice');
  const money = (v) => v.toLocaleString('ru-RU') + ' ₽';

  function updateTotal() {
    const key = service.value.split(' — ')[0];
    const p = PRICES[key];
    if (!p) return;
    totalPrice.textContent = money(p.now);
    oldPrice.textContent = money(p.old);
  }
  service.addEventListener('change', updateTotal);
  updateTotal();

  /* Кнопки «Выбрать» в прайсе подставляют услугу и ведут к форме */
  document.querySelectorAll('[data-service]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const want = btn.dataset.service;
      Array.from(service.options).forEach((o) => {
        if (o.text.startsWith(want)) service.value = o.value;
      });
      updateTotal();
    });
  });

  /* ---------- Маска телефона ---------- */
  const phone = document.getElementById('phone');
  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (d && !d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    let out = '';
    if (d.length) out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length >= 4) out += ') ' + d.slice(4, 7);
    if (d.length >= 7) out += '-' + d.slice(7, 9);
    if (d.length >= 9) out += '-' + d.slice(9, 11);
    phone.value = out;
  });

  /* ---------- Дата: не раньше сегодня ---------- */
  const date = document.getElementById('date');
  const today = new Date();
  const iso = (dt) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  date.min = iso(today);
  date.value = iso(new Date(today.getTime() + 86400000));

  /* ---------- Конфиг: config.js грузится динамически ----------
     В репозитории файла нет (там токен), поэтому отсутствие
     не должно ломать страницу и засорять консоль. */
  let cfg = {};
  const configReady = (async () => {
    try {
      const res = await fetch('config.js', { cache: 'no-store' });
      if (!res.ok) return;
      new Function(await res.text())();
      cfg = window.ANNA_CONFIG || {};
    } catch (e) {
      /* демо-режим: заявки сохраняются только локально */
    }
  })();

  const esc = (s) =>
    String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

  function formatMessage(b) {
    const [y, m, d] = b.date.split('-').map(Number);
    const human = `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
    return [
      `🔔 <b>${esc(cfg.BOT_TITLE || 'Новая заявка')}</b>`,
      '',
      `<b>Имя:</b> ${esc(b.name)}`,
      `<b>Телефон:</b> ${esc(b.phone)}`,
      `<b>Услуга:</b> ${esc(b.service)}`,
      `<b>Дата:</b> ${human}, ${esc(b.time)}`,
      b.address ? `<b>Адрес:</b> ${esc(b.address)}` : '',
      `<b>Промокод:</b> ${esc(b.promo)} — скидка 50%`,
      b.price ? `<b>К оплате:</b> ${b.price} ₽` : '',
      '',
      `<i>${new Date(b.createdAt).toLocaleString('ru-RU')}</i>`
    ].filter(Boolean).join('\n');
  }

  /* ---------- Отправка заявки в Telegram ---------- */
  async function sendToTelegram(b) {
    await configReady;
    if (!cfg.TELEGRAM_BOT_TOKEN || !cfg.TELEGRAM_CHAT_ID) return false;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(
        'https://api.telegram.org/bot' + cfg.TELEGRAM_BOT_TOKEN + '/sendMessage',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: cfg.TELEGRAM_CHAT_ID,
            text: formatMessage(b),
            parse_mode: 'HTML',
            disable_web_page_preview: true
          }),
          signal: ctrl.signal
        }
      );
      clearTimeout(timer);
      const data = await res.json().catch(() => ({}));
      return Boolean(res.ok && data.ok);
    } catch (err) {
      console.error('Не удалось отправить заявку в Telegram:', err);
      return false;
    }
  }

  /* ---------- Валидация и отправка ---------- */
  const form = document.getElementById('bookingForm');
  const success = document.getElementById('formSuccess');
  const successText = document.getElementById('successText');
  const submitBtn = document.getElementById('submitBtn');

  const setInvalid = (input, bad) =>
    input.closest('.field').classList.toggle('is-invalid', bad);

  ['name', 'phone', 'date'].forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => setInvalid(el, false));
    el.addEventListener('change', () => setInvalid(el, false));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name');
    const nameBad = name.value.trim().length < 2;
    const phoneBad = phone.value.replace(/\D/g, '').length !== 11;
    const dateBad = !date.value;

    setInvalid(name, nameBad);
    setInvalid(phone, phoneBad);
    setInvalid(date, dateBad);

    if (nameBad || phoneBad || dateBad) {
      const first = form.querySelector('.field.is-invalid input');
      if (first) first.focus();
      return;
    }

    /* Сохраняем заявку локально (бэкенда нет — данные готовы для интеграции) */
    const booking = {
      name: name.value.trim(),
      phone: phone.value,
      service: service.value,
      date: date.value,
      time: (timeChips.querySelector('.chip.is-active') || {}).dataset?.time || '',
      address: document.getElementById('address').value.trim(),
      promo: 'FIRST50',
      price: PRICES[service.value.split(' — ')[0]]?.now || null,
      createdAt: new Date().toISOString()
    };
    try {
      const list = JSON.parse(localStorage.getItem('annaNailsBookings') || '[]');
      list.push(booking);
      localStorage.setItem('annaNailsBookings', JSON.stringify(list));
    } catch (err) { /* приватный режим браузера */ }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем…';

    /* Отправляем в Telegram и только потом показываем подтверждение */
    Promise.resolve(sendToTelegram(booking)).then((sent) => {
      setTimeout(() => {
        const [y, m, d] = booking.date.split('-').map(Number);
        const human = new Date(y, m - 1, d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
        success.hidden = false;
        successText.textContent = sent
          ? `${booking.name}, заявка ушла мастеру! Жду вас ${human} в ${booking.time} — перезвоню на ${booking.phone} для подтверждения.`
          : `${booking.name}, жду вас ${human} в ${booking.time}. Скидка 50% закреплена — перезвоню на ${booking.phone}.`;
        submitBtn.textContent = sent ? 'Заявка отправлена ✓' : 'Заявка принята ✓';
        form.reset();
        date.value = iso(new Date(Date.now() + 86400000));
        updateTotal();
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });

        /* Обратный отсчёт свободных мест */
        const slots = document.getElementById('slotsLeft');
        const left = Math.max(1, Number(slots.textContent) - 1);
        slots.textContent = left;

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Записаться и получить −50%';
        }, 4000);
      }, 700);
    });
  });

  /* ---------- Лайтбокс в портфолио ---------- */
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');
  const slides = Array.from(document.querySelectorAll('.gallery__item img'));
  let current = 0;
  let lastFocused = null;

  function showSlide(i) {
    current = (i + slides.length) % slides.length;
    const img = slides[current];
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    const cap = img.closest('.gallery__item').querySelector('figcaption');
    lbCap.textContent = cap ? cap.textContent : img.alt;
  }
  function openLb(i) {
    lastFocused = document.activeElement;
    showSlide(i);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('lbClose').focus();
  }
  function closeLb() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  slides.forEach((img, i) => {
    const fig = img.closest('.gallery__item');
    const cap = fig.querySelector('figcaption');
    fig.tabIndex = 0;
    fig.setAttribute('role', 'button');
    fig.setAttribute(
      'aria-label',
      'Открыть работу: ' + (cap ? cap.textContent + ' — ' : '') + img.alt
    );
    fig.addEventListener('click', () => openLb(i));
    fig.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLb(i);
      }
    });
  });

  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbPrev').addEventListener('click', () => showSlide(current - 1));
  document.getElementById('lbNext').addEventListener('click', () => showSlide(current + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') showSlide(current - 1);
    if (e.key === 'ArrowRight') showSlide(current + 1);
  });

  /* ---------- Плавный скролл с учётом фиксированной шапки ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- Появление блоков при скролле ---------- */
  const revealTargets = document.querySelectorAll(
    '.benefit, .price, .review, .step, .gallery__item, .section__head, .about__text, .about__photo, .faq__item'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('is-visible'), i * 70);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px' }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }
})();
