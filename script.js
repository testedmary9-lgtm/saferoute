const registrationForm = document.getElementById('registration-form');
const loginForm = document.getElementById('login-form');
const registrationType = document.getElementById('registration-type');
const amountDisplay = document.getElementById('amount-display');
const registerSection = document.getElementById('register-section');
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const dashName = document.getElementById('dash-name');
const dashEmail = document.getElementById('dash-email');
const dashPhone = document.getElementById('dash-phone');
const dashCarModel = document.getElementById('dash-car-model');
const dashPlateNumber = document.getElementById('dash-plate-number');
const dashPlan = document.getElementById('dash-plan');
const dashAmount = document.getElementById('dash-amount');
const dashStatus = document.getElementById('dash-status');
const totalCars = document.getElementById('total-cars');
const dashboardUserName = document.getElementById('dashboard-user-name');
const logoutBtn = document.getElementById('logout-btn');
const resetBtn = document.getElementById('reset-btn');

const STORAGE_KEY = 'roadPayUser';
const TOTAL_CARS_KEY = 'roadPayTotalCars';

const planPrices = {
  monthly: 5000,
  yearly: 50000,
};

const paymentDurations = {
  monthly: 30,
  yearly: 365,
};

function formatCurrency(value) {
  return `₦${value.toLocaleString()}`;
}

function setHidden(element, hidden) {
  if (!element) return;
  element.classList[hidden ? 'add' : 'remove']('hidden');
}

function updateAmount() {
  if (!registrationType || !amountDisplay) return;
  const plan = registrationType.value;
  amountDisplay.textContent = formatCurrency(planPrices[plan]);
}

function getSavedUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function getTotalCars() {
  const raw = localStorage.getItem(TOTAL_CARS_KEY);
  return raw ? parseInt(raw, 10) : 0;
}

function saveTotalCars(value) {
  localStorage.setItem(TOTAL_CARS_KEY, value.toString());
}

function getPaymentStatus(user) {
  if (!user.registeredAt) return { isExpired: false, daysLeft: 0, expiryDate: null };
  
  const registrationDate = new Date(user.registeredAt);
  const plan = user.plan || 'monthly';
  const durationDays = paymentDurations[plan] || 30;
  const expiryDate = new Date(registrationDate);
  expiryDate.setDate(expiryDate.getDate() + durationDays);
  
  const today = new Date();
  const isExpired = today > expiryDate;
  const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  
  return { isExpired, daysLeft, expiryDate };
}

function updatePaymentDisplay(user, paymentStatus) {
  const alertBox = document.getElementById('payment-alert');
  const messageBox = document.getElementById('payment-message');
  
  // Update payment status alert in overview
  if (paymentStatus.isExpired) {
    if (alertBox) {
      alertBox.className = 'payment-alert alert-danger';
      alertBox.innerHTML = '<h3>❌ Payment Expired</h3>';
      if (messageBox) {
        messageBox.textContent = 'Your payment has expired. Please renew your payment immediately to maintain your registration.';
      }
    }
  } else if (paymentStatus.daysLeft <= 7) {
    if (alertBox) {
      alertBox.className = 'payment-alert alert-warning';
      alertBox.innerHTML = '<h3>⚠️ Payment Expiring Soon</h3>';
      if (messageBox) {
        messageBox.textContent = `Your payment will expire in ${paymentStatus.daysLeft} day(s). Please renew to avoid interruption.`;
      }
    }
  } else {
    if (alertBox) {
      alertBox.className = 'payment-alert alert-success';
      alertBox.innerHTML = '<h3>✓ Payment Active</h3>';
      if (messageBox) {
        messageBox.textContent = `Your payment is active. It will expire in ${paymentStatus.daysLeft} day(s).`;
      }
    }
  }
}

function showDashboard(user) {
  setHidden(registerSection, true);
  setHidden(loginSection, true);
  setHidden(dashboardSection, false);

  if (!user) return;
  if (dashboardUserName) dashboardUserName.textContent = user.name;
  
  // Update payment status
  const paymentStatus = getPaymentStatus(user);
  updatePaymentDisplay(user, paymentStatus);
  updateAllSections(user, paymentStatus);
}

function updateAllSections(user, paymentStatus) {
  // Overview section
  const overviewOwner = document.getElementById('overview-owner');
  const overviewPlate = document.getElementById('overview-plate');
  const overviewStatus = document.getElementById('overview-status');
  const overviewDays = document.getElementById('overview-days');
  
  if (overviewOwner) overviewOwner.textContent = user.name || '--';
  if (overviewPlate) overviewPlate.textContent = user.plateNumber || '--';
  if (overviewStatus) {
    if (paymentStatus.isExpired) {
      overviewStatus.textContent = 'EXPIRED';
      overviewStatus.style.color = '#dc3545';
    } else if (paymentStatus.daysLeft <= 7) {
      overviewStatus.textContent = 'EXPIRING SOON';
      overviewStatus.style.color = '#ff9800';
    } else {
      overviewStatus.textContent = 'ACTIVE';
      overviewStatus.style.color = '#28a745';
    }
  }
  if (overviewDays) overviewDays.textContent = paymentStatus.daysLeft + ' days';
  
  // Profile section
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profilePhone = document.getElementById('profile-phone');
  const profileCar = document.getElementById('profile-car');
  const profilePlateNum = document.getElementById('profile-plate-num');
  const profileRegDate = document.getElementById('profile-reg-date');
  
  if (profileName) profileName.textContent = user.name || '--';
  if (profileEmail) profileEmail.textContent = user.email || '--';
  if (profilePhone) profilePhone.textContent = user.phone || '--';
  if (profileCar) profileCar.textContent = user.carModel || '--';
  if (profilePlateNum) profilePlateNum.textContent = user.plateNumber || '--';
  if (profileRegDate && user.registeredAt) {
    profileRegDate.textContent = new Date(user.registeredAt).toLocaleDateString();
  }
  
  // Payments section
  const paymentsPlan = document.getElementById('payments-plan');
  const paymentsAmount = document.getElementById('payments-amount');
  const paymentsDate = document.getElementById('payments-date');
  const paymentsExpiry = document.getElementById('payments-expiry');
  const paymentsDays = document.getElementById('payments-days');
  
  if (paymentsPlan) paymentsPlan.textContent = (user.plan || 'monthly') + ' plan';
  if (paymentsAmount) paymentsAmount.textContent = formatCurrency(user.amountPaid || 0);
  if (paymentsDate && user.registeredAt) {
    paymentsDate.textContent = new Date(user.registeredAt).toLocaleDateString();
  }
  if (paymentsExpiry && paymentStatus.expiryDate) {
    paymentsExpiry.textContent = paymentStatus.expiryDate.toLocaleDateString();
  }
  if (paymentsDays) {
    if (paymentStatus.isExpired) {
      paymentsDays.textContent = 'Expired';
      paymentsDays.style.color = '#dc3545';
    } else {
      paymentsDays.textContent = paymentStatus.daysLeft + ' days';
      if (paymentStatus.daysLeft <= 7) {
        paymentsDays.style.color = '#ff9800';
      } else {
        paymentsDays.style.color = '#28a745';
      }
    }
  }
}

function hideAuthSections() {
  setHidden(registerSection, true);
  setHidden(loginSection, true);
  setHidden(dashboardSection, true);
}

function showFormSection(section) {
  setHidden(dashboardSection, true);
  if (section === 'register') {
    setHidden(registerSection, false);
    setHidden(loginSection, true);
    registerSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (section === 'login') {
    setHidden(loginSection, false);
    setHidden(registerSection, true);
    loginSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function safeAddListener(element, event, handler) {
  if (element) {
    element.addEventListener(event, handler);
  }
}

safeAddListener(registrationType, 'change', updateAmount);

safeAddListener(registrationForm, 'submit', (event) => {
  event.preventDefault();

  const user = {
    name: document.getElementById('name')?.value.trim() || '',
    email: document.getElementById('email')?.value.trim() || '',
    phone: document.getElementById('phone')?.value.trim() || '',
    carModel: document.getElementById('car-model')?.value.trim() || '',
    plateNumber: document.getElementById('plate-number')?.value.trim() || '',
    plan: registrationType?.value || 'monthly',
    amountPaid: planPrices[registrationType?.value || 'monthly'],
    status: 'Registered',
    registeredAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  saveTotalCars(getTotalCars() + 1);

  window.location.href = 'dashboard.html';
});

safeAddListener(loginForm, 'submit', (event) => {
  event.preventDefault();

  const email = document.getElementById('login-email')?.value.trim() || '';
  const phone = document.getElementById('login-phone')?.value.trim() || '';
  const savedUser = getSavedUser();

  if (!savedUser) {
    alert('No registered user found. Please register first.');
    return;
  }

  if (savedUser.email === email && savedUser.phone === phone) {
    window.location.href = 'dashboard.html';
  } else {
    alert('Login failed. Please check your email and phone number.');
  }
});

safeAddListener(logoutBtn, 'click', () => {
  localStorage.removeItem(STORAGE_KEY);
  hideAuthSections();
});

const onlinePayBtn = document.getElementById('online-pay-btn');
safeAddListener(onlinePayBtn, 'click', () => {
  alert('Redirecting to payment gateway...\n\nIn a real application, this would connect to a payment processor like Paystack, Flutterwave, or similar.');
});

// Section switching functionality
function initSectionSwitching() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const sections = document.querySelectorAll('.dashboard-section');
  
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionName = link.getAttribute('data-section');
      
      // Hide all sections
      sections.forEach(section => {
        section.classList.remove('active');
      });
      
      // Remove active class from all links
      sidebarLinks.forEach(l => {
        l.classList.remove('active');
      });
      
      // Show selected section
      const selectedSection = document.getElementById(sectionName + '-section');
      if (selectedSection) {
        selectedSection.classList.add('active');
      }
      
      // Mark link as active
      link.classList.add('active');
    });
  });
}

function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.top-nav .nav-link');

  if (!menuToggle || !mainNav) return;

  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
      }
    });
  });
}

safeAddListener(resetBtn, 'click', () => {
  if (confirm('Reset all registration data and clear storage?')) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOTAL_CARS_KEY);
    hideAuthSections();
    if (totalCars) totalCars.textContent = '0';
    alert('All data has been cleared.');
  }
});

window.addEventListener('load', () => {
  updateAmount();
  initSectionSwitching();

  const user = getSavedUser();
  const currentPath = window.location.pathname.toLowerCase();
  const isRegisterPage = currentPath.includes('register.html');
  const isLoginPage = currentPath.includes('login.html');
  const isDashboardPage = currentPath.includes('dashboard.html');

  if (isDashboardPage) {
    if (user) {
      showDashboard(user);
    } else {
      alert('Please register or login first.');
      window.location.href = 'login.html';
    }
    return;
  }

  if (user) {
    if (isRegisterPage) {
      showFormSection('register');
      return;
    }
    if (isLoginPage) {
      showFormSection('login');
      return;
    }
  }

  if (isRegisterPage) {
    showFormSection('register');
  } else if (isLoginPage) {
    showFormSection('login');
  } else {
    hideAuthSections();
  }

  initMobileMenu();

});

