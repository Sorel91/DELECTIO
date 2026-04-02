const contactForm = document.querySelector('#contact-form');
const formFeedback = document.querySelector('#form-feedback');

if (contactForm && formFeedback) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = (formData.get('name') || '').toString().trim();
    const email = (formData.get('email') || '').toString().trim();
    const level = (formData.get('level') || '').toString();

    if (!name || !email || !level) {
      formFeedback.textContent = 'Merci de compléter les champs obligatoires.';
      return;
    }

    formFeedback.textContent = `Merci ${name}, votre demande a bien été envoyée. Nous revenons vers vous sous 24h ouvrées.`;
    contactForm.reset();
  });
}
