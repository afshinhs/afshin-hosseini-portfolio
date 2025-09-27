// Works with your <ul id="navbar">
  const nav  = document.querySelector('nav');
  const btn  = document.querySelector('.nav-toggle');
  const menu = document.getElementById('navbar');

  btn?.addEventListener('click', () => {
    const open = nav.classList.toggle('menu-open');
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

    // Lock background scroll when menu is open (mobile)
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close the menu when a link is clicked (mobile UX)
  menu?.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && nav.classList.contains('menu-open')) {
      nav.classList.remove('menu-open');
      btn.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('menu-open')) {
      nav.classList.remove('menu-open');
      btn.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
      btn.focus();
    }
  });


// new

function initSkillsPager(column){
  const size  = parseInt(column.dataset.pageSize, 10) || 4;
  const list  = column.querySelector('.skills-list');
  const items = Array.from(list.querySelectorAll(':scope > li'));
  const prev  = column.querySelector('.skills-prv');
  const next  = column.querySelector('.skills-nxt');
  let page = 0;

  // Show a specific page (adds .is-visible to its items)
  function showPage(p){
    const start = p * size;
    const end   = start + size;
    items.forEach((li, i) => {
      li.classList.toggle('is-visible', i >= start && i < end);
      if (li.classList.contains('is-first-visible')){
        li.classList.remove('is-first-visible');
      }
    });

    const firstVisible = items.find((li) => li.classList.contains('is-visible'));
    firstVisible?.classList.add('is-first-visible');
    prev.disabled = p === 0;
    next.disabled = end >= items.length;
  }

  // Measure tallest page and set list min-height so nav doesn't jump
  function setMaxPageHeight(){
    const pages = Math.ceil(items.length / size);
    const current = page;

    let maxH = 0;
    for (let p = 0; p < pages; p++){
      showPage(p);                       // temporarily show page
      // Force reflow and measure the list's content height
      const h = list.scrollHeight;
      if (h > maxH) maxH = h;
    }

    // Restore current page view
    showPage(current);

    // Set CSS var (enables CSS transition)
    list.style.setProperty('--skills-min', maxH + 'px');
  }

  // Events
  prev?.addEventListener('click', () => { if (page > 0){ page--; showPage(page); } });
  next?.addEventListener('click', () => {
    if ((page + 1) * size < items.length){ page++; showPage(page); }
  });

  // Init
  showPage(page);
  setMaxPageHeight();
}

// init all columns
document.querySelectorAll('.skills-column').forEach(initSkillsPager);


// project section

function initPager(columnSelector){
  document.querySelectorAll(columnSelector).forEach(column => {
    const size  = parseInt(column.dataset.pageSize, 10) || 1;
    const list  = column.querySelector(':scope .pj-list');
    const items = Array.from(list.querySelectorAll(':scope > li'));
    const prev  = column.querySelector(':scope .pj-prv');
    const next  = column.querySelector(':scope .pj-nxt');
    let page = 0;

    function showPage(p){
      const start = p * size;
      const end   = start + size;
      items.forEach((li, i) => li.classList.toggle('is-visible', i >= start && i < end));
      prev.disabled = p === 0;
      next.disabled = end >= items.length;
    }

    function setMaxHeight(){
      const pages = Math.ceil(items.length / size);
      const cur   = page;
      let maxH = 0;
      for (let p=0; p<pages; p++){
        showPage(p);
        const h = list.scrollHeight;
        if (h > maxH) maxH = h;
      }
      showPage(cur);
      list.style.setProperty('--pj-min', maxH + 'px');
    }

    prev?.addEventListener('click', () => { if (page > 0){ page--; showPage(page); }});
    next?.addEventListener('click', () => {
      if ((page+1) * size < items.length){ page++; showPage(page); }
    });

    showPage(page);
    setMaxHeight();
  });
}

// init Projects/Jobs pagers
initPager('.pj-column');




// contact form handler

function initContactForm(){
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('contact-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const defaultLabel = submitBtn?.dataset.defaultLabel || submitBtn?.textContent?.trim();
  const honeypot = form.querySelector('input[name="_gotcha"]');

  function resetStatus(){
    if (!status) return;
    status.textContent = '';
    status.classList.remove('form-status--success', 'form-status--error', 'is-visible');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.checkValidity()){
      form.reportValidity();
      return;
    }

    if (honeypot && honeypot.value){
      // Bot detected; silently end.
      form.reset();
      return;
    }

    resetStatus();

    if (submitBtn){
      submitBtn.disabled = true;
      if (defaultLabel) submitBtn.textContent = 'Sending...';
    }

    const formData = new FormData(form);
    const email = formData.get('email');
    if (email) formData.set('_replyto', String(email));

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok){
        if (status){
          status.textContent = "Thanks for your message! I'll reply soon.";
          status.classList.add('form-status--success', 'is-visible');
        }
        form.reset();
      } else {
        const data = await response.json().catch(() => null);
        const errorMessage = data?.errors?.map((err) => err.message).join(', ');
        if (status){
          status.textContent = errorMessage || 'Oops, something went wrong. Please try again.';
          status.classList.add('form-status--error', 'is-visible');
        }
      }
    } catch (error) {
      if (status){
        status.textContent = 'Network error. Please check your connection and try again.';
        status.classList.add('form-status--error', 'is-visible');
      }
    } finally {
      if (submitBtn){
        submitBtn.disabled = false;
        if (defaultLabel) submitBtn.textContent = defaultLabel;
      }
    }
  });
}

initContactForm();


// back-to-top control

function initBackToTop(){
  const trigger = document.querySelector('.back-to-top');
  if (!trigger) return;

  const showThreshold = 400;

  function toggleVisibility(){
    if (window.scrollY > showThreshold){
      trigger.classList.add('is-visible');
    } else {
      trigger.classList.remove('is-visible');
    }
  }

  toggleVisibility();
  window.addEventListener('scroll', toggleVisibility, { passive: true });

  trigger.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

initBackToTop();
