const siteConfig = {
  developer: {
    name: 'Rizz',
    role: 'Software Developer',
    focus: ['Web', 'Mobile', 'AI'],
    status: 'available',
    location: 'Remote / Available Worldwide',
    yearsOfExperience: 'placeholder',
    specialization: 'Web, mobile and AI products'
  },
  paymentConfig: {
    usdt: {
      network: 'TRC20',
      address: 'ADD_YOUR_USDT_WALLET'
    },
    btc: {
      network: 'Bitcoin',
      address: 'ADD_YOUR_BTC_WALLET'
    },
    eth: {
      network: 'Ethereum',
      address: 'ADD_YOUR_ETH_WALLET'
    }
  },
  socialLinks: {
    github: 'https://github.com/',
    linkedin: 'https://www.linkedin.com/',
    x: 'https://x.com/'
  }
};

const projectData = [
  {
    title: 'E-Commerce Platform',
    category: 'Web Application',
    year: '2025',
    description: 'A modern commerce experience with product discovery, checkout and customer management.',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL'],
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    overview: 'This product experience blends storefront design and business operations into a single coherent system for product discovery, customer management and efficient order handling.',
    outcomes: ['Improved storefront conversion flow', 'Streamlined admin operations', 'Cleaner mobile shopping journey']
  },
  {
    title: 'SaaS Dashboard',
    category: 'Dashboard',
    year: '2024',
    description: 'A responsive business dashboard for managing data, users and operations.',
    stack: ['React', 'Node.js', 'PostgreSQL'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    overview: 'A data-heavy product dashboard built to support daily operations, role access and performance reporting with a clean interface and strong information hierarchy.',
    outcomes: ['Clear operational visibility', 'Custom user access patterns', 'Fast, data-driven workflows']
  },
  {
    title: 'Mobile Application',
    category: 'Mobile',
    year: '2025',
    description: 'A modern cross-platform mobile application designed for fast daily use.',
    stack: ['React Native', 'TypeScript'],
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
    overview: 'Designed as a polished mobile-first product that balances functionality, speed and consistent interactions across iOS and Android.',
    outcomes: ['Faster user onboarding', 'Responsive app interactions', 'Improved retention-focused journeys']
  }
];

const serviceData = [
  { id: '01', title: 'Web Development', text: 'Marketing websites, landing pages, business websites and custom web experiences.' },
  { id: '02', title: 'Web Applications', text: 'Dashboards, SaaS products, customer portals and custom business applications.' },
  { id: '03', title: 'Mobile Apps', text: 'Modern mobile applications designed for iOS and Android.' },
  { id: '04', title: 'AI Applications', text: 'AI-powered products, intelligent workflows, AI interfaces and API integrations.' },
  { id: '05', title: 'Custom Software', text: 'APIs, automation systems, internal tools and custom digital solutions.' }
];

const techGroups = [
  {
    title: 'Frontend',
    items: ['React', 'Next.js', 'TypeScript', 'HTML', 'CSS']
  },
  {
    title: 'Backend',
    items: ['Node.js', 'Python', 'REST APIs', 'Authentication']
  },
  {
    title: 'Database',
    items: ['PostgreSQL', 'MongoDB', 'Firebase']
  },
  {
    title: 'Mobile',
    items: ['React Native', 'Flutter']
  },
  {
    title: 'AI',
    items: ['OpenAI APIs', 'AI APIs', 'Machine Learning integrations']
  },
  {
    title: 'Tools',
    items: ['Git', 'GitHub', 'Docker', 'VS Code']
  }
];

const processSteps = [
  { number: '01', title: 'Discover', text: 'Understand the business, product and requirements.' },
  { number: '02', title: 'Plan', text: 'Define features, architecture and user experience.' },
  { number: '03', title: 'Design', text: 'Create the interface and interaction system.' },
  { number: '04', title: 'Build', text: 'Develop the product with clean, maintainable code.' },
  { number: '05', title: 'Test', text: 'Test functionality, responsiveness and performance.' },
  { number: '06', title: 'Ship', text: 'Deploy, monitor and continue improving the product.' }
];

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const projectGrid = document.querySelector('#projectGrid');
const serviceGrid = document.querySelector('#serviceGrid');
const techGrid = document.querySelector('#techGrid');
const processList = document.querySelector('#processList');
const profileCard = document.querySelector('#profileCard');
const paymentGrid = document.querySelector('#paymentGrid');
const projectModal = document.querySelector('#projectModal');
const modalBody = document.querySelector('#modalBody');
const form = document.querySelector('#projectForm');
const formFeedback = document.querySelector('#formFeedback');
const paymentForm = document.querySelector('#paymentForm');
const paymentFeedback = document.querySelector('#paymentFeedback');

function renderProjects() {
  projectGrid.innerHTML = projectData.map((project, index) => `
    <article class="project-card reveal" data-index="${index}">
      <button class="project-link" type="button" data-project-index="${index}" aria-label="View details for ${project.title}">
        <div class="project-image">
          <img src="${project.image}" alt="${project.title} project preview" loading="lazy" />
        </div>
        <div class="project-body">
          <div class="project-topline">
            <span>${project.category}</span>
            <span>${project.year}</span>
          </div>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="project-stack">
            ${project.stack.map((item) => `<span>${item}</span>`).join('')}
          </div>
          <span class="project-arrow">View case study</span>
        </div>
      </button>
    </article>
  `).join('');

  projectGrid.querySelectorAll('.project-link').forEach((button) => {
    button.addEventListener('click', () => {
      const projectIndex = Number(button.dataset.projectIndex);
      openProjectModal(projectData[projectIndex]);
    });
  });
}

function renderServices() {
  serviceGrid.innerHTML = serviceData.map((service) => `
    <article class="service-card reveal">
      <div class="service-badge">${service.id}</div>
      <h3>${service.title}</h3>
      <p>${service.text}</p>
    </article>
  `).join('');
}

function renderTech() {
  techGrid.innerHTML = techGroups.map((group) => `
    <div class="tech-group reveal">
      <h3>${group.title}</h3>
      <div class="tech-list">
        ${group.items.map((item) => `<span>${item}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

function renderProcess() {
  processList.innerHTML = processSteps.map((step) => `
    <div class="process-item reveal">
      <div class="process-number">${step.number}</div>
      <div>
        <h3>${step.title}</h3>
        <p>${step.text}</p>
      </div>
      <div class="process-arrow">↗</div>
    </div>
  `).join('');
}

function renderProfileCard() {
  const profile = {
    name: siteConfig.developer.name,
    role: siteConfig.developer.role,
    focus: siteConfig.developer.focus,
    status: siteConfig.developer.status
  };

  profileCard.textContent = JSON.stringify(profile, null, 2);
}

function renderPayments() {
  paymentGrid.innerHTML = Object.entries(siteConfig.paymentConfig).map(([coin, details]) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(details.address)}`;
    return `
      <article class="payment-card reveal">
        <div class="payment-header">
          <span class="payment-name">${coin.toUpperCase()}</span>
          <span class="payment-network">${details.network}</span>
        </div>
        <div>
          <span class="wallet-address">${details.address}</span>
        </div>
        <div class="payment-actions">
          <button type="button" class="copy-btn" data-address="${details.address}">Copy</button>
          <img class="qr-code" src="${qrUrl}" alt="${coin.toUpperCase()} wallet QR code" loading="lazy" />
        </div>
      </article>
    `;
  }).join('');

  paymentGrid.querySelectorAll('.copy-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const address = button.dataset.address;
      if (!address) return;

      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(address);
        }
        const originalLabel = button.textContent;
        button.textContent = 'Copied';
        setTimeout(() => {
          button.textContent = originalLabel;
        }, 1200);
      } catch (error) {
        button.textContent = 'Error';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 1200);
      }
    });
  });
}

function openProjectModal(project) {
  modalBody.innerHTML = `
    <div class="modal-hero">
      <img src="${project.image}" alt="${project.title} project preview" />
    </div>
    <div class="modal-content">
      <p class="eyebrow">Case Study</p>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="modal-meta">
        <span>${project.category}</span>
        <span>${project.year}</span>
        ${project.stack.map((item) => `<span>${item}</span>`).join('')}
      </div>

      <div class="modal-section">
        <h4>Overview</h4>
        <p>${project.overview}</p>
      </div>

      <div class="modal-section">
        <h4>Outcomes</h4>
        <ul>
          ${project.outcomes.map((outcome) => `<li>${outcome}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  projectModal.classList.add('open');
  projectModal.setAttribute('aria-hidden', 'false');
}

function closeProjectModal() {
  projectModal.classList.remove('open');
  projectModal.setAttribute('aria-hidden', 'true');
}

function initRevealAnimations() {
  const revealItems = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  revealItems.forEach((item) => observer.observe(item));
}

function initHeaderBehavior() {
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (window.scrollY > 12) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initMenu() {
  if (!menuToggle || !mainNav) return;

  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initForms() {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const name = formData.get('name') || 'Client';
    const projectType = formData.get('projectType') || 'Project';

    formFeedback.textContent = `Thanks, ${name}. Your ${projectType.toLowerCase()} request is ready to be sent to your email/backend service.`;
    form.reset();
  });

  paymentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const inputs = paymentForm.querySelectorAll('input');
    const hasValue = Array.from(inputs).some((input) => input.value.trim() !== '');

    if (!hasValue) {
      paymentFeedback.textContent = 'Add the transaction details to continue.';
      return;
    }

    paymentFeedback.textContent = 'Payment details captured for review. Connect a server-side verification service to complete processing.';
    paymentForm.reset();
  });
}

function initModal() {
  const closeButton = document.querySelector('.modal-close');
  const backdrop = document.querySelector('.modal-backdrop');

  closeButton.addEventListener('click', closeProjectModal);
  backdrop.addEventListener('click', closeProjectModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && projectModal.classList.contains('open')) {
      closeProjectModal();
    }
  });
}

renderProjects();
renderServices();
renderTech();
renderProcess();
renderProfileCard();
renderPayments();
initHeaderBehavior();
initRevealAnimations();
initMenu();
initForms();
initModal();
