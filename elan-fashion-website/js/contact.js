/**
 * ÉLAN — The Art of Dressing
 * Contact Form Module: Validation, Accessible Feedback, and Anti-Spam protection
 */

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
});

function initContactForm() {
  const form = document.getElementById('elan-contact-form');
  if (!form) return;

  const statusAlert = document.getElementById('contact-status-alert');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Input fields
  const nameInput = document.getElementById('cf-name');
  const emailInput = document.getElementById('cf-email');
  const phoneInput = document.getElementById('cf-phone');
  const subjectInput = document.getElementById('cf-subject');
  const messageInput = document.getElementById('cf-message');

  // Real-time input clearing of error states
  [nameInput, emailInput, phoneInput, subjectInput, messageInput].forEach(field => {
    if (!field) return;
    field.addEventListener('input', () => {
      clearFieldError(field);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      showFieldError(nameInput, 'Please enter your full name (minimum 2 characters).');
      isValid = false;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      showFieldError(emailInput, 'Please enter a valid email address.');
      isValid = false;
    }

    // Validate Phone (Indian numbers: 10 digits, optional +91 prefix)
    const phoneVal = phoneInput.value.trim().replace(/[\s-]/g, '');
    const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
    if (!phoneVal || !phoneRegex.test(phoneVal)) {
      showFieldError(phoneInput, 'Please enter a valid 10-digit mobile number.');
      isValid = false;
    }

    // Validate Subject
    if (!subjectInput.value) {
      showFieldError(subjectInput, 'Please select an enquiry topic.');
      isValid = false;
    }

    // Validate Message
    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      showFieldError(messageInput, 'Please share your enquiry or message (minimum 10 characters).');
      isValid = false;
    }

    if (!isValid) {
      // Focus first error field
      const firstError = form.querySelector('.form-field.has-error input, .form-field.has-error textarea, .form-field.has-error select');
      if (firstError) firstError.focus();
      return;
    }

    // Form is valid: set loading state
    setLoading(true);

    try {
      // In a production environment with a configured API endpoint or service (e.g., Formspree, backend microservice):
      // const response = await fetch('/api/contact', { method: 'POST', body: JSON.stringify(...) });
      
      // Simulate network latency (1.4s)
      await new Promise(resolve => setTimeout(resolve, 1400));

      setLoading(false);
      form.reset();

      // Show professional status message detailing the offline/demo nature as instructed
      if (statusAlert) {
        statusAlert.className = 'form-status-alert is-success';
        statusAlert.innerHTML = `
          <strong>Thank you for contacting ÉLAN.</strong><br>
          Your enquiry has been formatted and validated successfully. 
          <em>(Note: Connect your backend endpoint or form action in <code>js/contact.js</code> to dispatch emails directly to your customer atelier).</em>
        `;
        statusAlert.focus();
      }
    } catch (err) {
      setLoading(false);
      if (statusAlert) {
        statusAlert.className = 'form-status-alert is-error';
        statusAlert.innerHTML = 'An unexpected error occurred while processing your request. Please try again or reach us directly at care@elan-menswear.com';
      }
    }
  });

  function showFieldError(input, message) {
    const parent = input.closest('.form-field');
    if (!parent) return;
    parent.classList.add('has-error');
    const errSpan = parent.querySelector('.form-error');
    if (errSpan) {
      errSpan.textContent = message;
    }
  }

  function clearFieldError(input) {
    const parent = input.closest('.form-field');
    if (!parent) return;
    parent.classList.remove('has-error');
  }

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
    } else {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  }
}
