const contactForm = document.querySelector('#contact-form');
const formFeedback = document.querySelector('#form-feedback');

if (contactForm && formFeedback) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get('name');
    formFeedback.textContent = `Merci ${name || ''}, votre demande a bien ete envoyee.`;
    contactForm.reset();
  });
}