const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const filters = document.querySelectorAll('.filter');
const projects = document.querySelectorAll('.project-card');
const form = document.querySelector('.contact-form');
const formStatus = document.querySelector('.form-status');

menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    filters.forEach((item) => item.classList.remove('active'));
    filter.classList.add('active');
    const category = filter.dataset.filter;
    projects.forEach((project) => {
      project.hidden = category !== 'all' && project.dataset.category !== category;
    });
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const subject = encodeURIComponent(`Project inquiry from ${data.get('name')}`);
  const body = encodeURIComponent(`${data.get('message')}\n\nReply to: ${data.get('email')}`);
  window.location.href = `mailto:hello@avachen.studio?subject=${subject}&body=${body}`;
  formStatus.textContent = 'Opening your email client...';
});

document.querySelector('.email-copy').addEventListener('click', async (event) => {
  if (!navigator.clipboard) return;
  event.preventDefault();
  await navigator.clipboard.writeText('hello@avachen.studio');
  const label = event.currentTarget;
  const original = label.innerHTML;
  label.innerHTML = 'Email copied <span>✓</span>';
  setTimeout(() => { label.innerHTML = original; }, 1800);
});
