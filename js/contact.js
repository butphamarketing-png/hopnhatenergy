/**
 * Section 07 — Contact lead form
 * Validate → console.log + localStorage JSON → ready for API hook
 */
const Contact = (() => {
  const SECTION_ID = 'section-08';
  const STORAGE_KEY = 'solar-mn-leads';
  let played = false;

  function section() {
    return document.getElementById(SECTION_ID);
  }

  function prefersReducedMotion() {
    return window.SolarMotion?.prefersReduced?.() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function normalizePhone(value) {
    return String(value || '').replace(/[\s.\-()]/g, '');
  }

  function isValidPhone(value) {
    const phone = normalizePhone(value);
    return /^(0|\+84)(\d{8,10})$/.test(phone);
  }

  function isValidEmail(value) {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function clearErrors(form) {
    form.querySelectorAll('.contact-form__field').forEach((f) => f.classList.remove('is-invalid'));
    form.querySelectorAll('.contact-form__error').forEach((el) => {
      el.textContent = '';
    });
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  }

  function setError(form, name, message) {
    const input = form.querySelector(`[name="${name}"]`);
    const field = input?.closest('.contact-form__field');
    const err = form.querySelector(`[data-error-for="${name}"]`);
    if (field) field.classList.add('is-invalid');
    if (input && input.type !== 'checkbox') input.setAttribute('aria-invalid', 'true');
    if (err) {
      err.textContent = message;
      err.id = err.id || `err-${name}`;
      if (input) input.setAttribute('aria-describedby', err.id);
    }
  }

  function collectPayload(form) {
    const data = new FormData(form);
    return {
      name: String(data.get('name') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      email: String(data.get('email') || '').trim(),
      address: String(data.get('address') || '').trim(),
      projectType: String(data.get('projectType') || '').trim(),
      need: String(data.get('need') || '').trim(),
      message: String(data.get('message') || '').trim(),
      consent: data.get('consent') === 'on',
      source: 'section-08',
      theme: document.documentElement.getAttribute('data-theme') || 'solar',
      submittedAt: new Date().toISOString(),
    };
  }

  function validate(form, payload) {
    clearErrors(form);
    let ok = true;

    if (!payload.name) {
      setError(form, 'name', 'Vui lòng nhập tên khách hàng.');
      ok = false;
    }

    if (!payload.phone) {
      setError(form, 'phone', 'Vui lòng nhập số điện thoại.');
      ok = false;
    } else if (!isValidPhone(payload.phone)) {
      setError(form, 'phone', 'Số điện thoại không đúng định dạng.');
      ok = false;
    }

    if (payload.email && !isValidEmail(payload.email)) {
      setError(form, 'email', 'Email không hợp lệ.');
      ok = false;
    }

    if (!payload.consent) {
      setError(form, 'consent', 'Vui lòng đồng ý để được liên hệ tư vấn.');
      ok = false;
    }

    return ok;
  }

  async function persistLead(payload) {
    // Hook for future API: window.SolarLeadAPI = async (data) => fetch(...)
    if (typeof window.SolarLeadAPI === 'function') {
      return window.SolarLeadAPI(payload);
    }

    console.log('[ContactLead]', payload);

    try {
      const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const next = Array.isArray(prev) ? prev : [];
      next.push(payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.warn('[ContactLead] localStorage failed', err);
    }

    return { ok: true, mode: 'local' };
  }

  function showSuccess(panel) {
    if (!panel) return;
    panel.classList.add('is-sent');
    const success = panel.querySelector('[data-contact-success]');
    if (success) success.hidden = false;
  }

  function bindForm(root) {
    const form = root.querySelector('[data-contact-form]');
    const panel = root.querySelector('.contact-panel');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = collectPayload(form);
      if (!validate(form, payload)) return;

      const btn = form.querySelector('.contact-form__submit');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'ĐANG GỬI...';
      }

      try {
        await persistLead(payload);
        showSuccess(panel);
      } catch (err) {
        console.error('[ContactLead] submit failed', err);
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'GỬI YÊU CẦU TƯ VẤN';
        }
        setError(form, 'name', 'Không gửi được. Vui lòng thử lại.');
      }
    });
  }

  function revealInstant(root) {
    root.classList.add('is-bg-in', 'is-glass-in', 'is-panel-in', 'is-fields-in', 'is-btn-in');
  }

  function playSequence(root) {
    if (played) return;
    played = true;

    if (prefersReducedMotion()) {
      revealInstant(root);
      return;
    }

    const delay = window.SolarMotion?.TIMING?.entranceDelay ?? 120;
    window.setTimeout(() => {
      root.classList.add('is-bg-in', 'is-glass-in', 'is-panel-in', 'is-fields-in', 'is-btn-in');
    }, delay);
  }

  function tryPlay() {
    const root = section();
    if (!root || played) return;
    if (!root.classList.contains('is-active') && !root.classList.contains('is-revealed')) return;
    playSequence(root);
  }

  function init() {
    const root = section();
    if (!root) return null;

    bindForm(root);

    const mo = new MutationObserver(() => tryPlay());
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    tryPlay();

    return { play: tryPlay };
  }

  return { init };
})();
