document.addEventListener('DOMContentLoaded', (event) => {
    // Animation for sections when they come into view
    const sections = document.querySelectorAll('.section');
    
    const observerOptions = {
        threshold: 0.1
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach(section => {      observer.observe(section);
    });

    // Form submission handling
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Here you would typically send the form data to a server
        // For demonstration, we'll just log it to the console
        const formData = new FormData(contactForm);
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        // Reset form or show confirmation message
        contactForm.reset();
        alert('Form submitted successfully!');
    });

    // You could add more JavaScript interactivity here, like smooth scrolling or dynamic content loading
});