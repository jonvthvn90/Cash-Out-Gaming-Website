document.addEventListener('DOMContentLoaded', (event) => {
    // Animation for sections when they come into view
    const sections = document.querySelectorAll('.section');
    
    const observerOptions = {
        threshold: 0.1 // Triggers the animation when 10% of the section is visible
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing once the section is visible to avoid repeated animations
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Form submission handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Collect form data
            const formData = new FormData(contactForm);
            
            // Here you would typically send the form data to a server
            // For demonstration, we'll just log it to the console
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // Optionally, you could send this data to a server via AJAX
            // For example:
            // fetch('/submit-form', {
            //     method: 'POST',
            //     body: formData
            // }).then(response => response.json())
            //   .then(data => {
            //       console.log('Success:', data);
            //       contactForm.reset();
            //       alert('Form submitted successfully!');
            //   })
            //   .catch((error) => {
            //       console.error('Error:', error);
            //       alert('There was an error submitting the form.');
            //   });

            // Reset form and show confirmation message
            contactForm.reset();
            alert('Form submitted successfully!');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Dynamic content loading example (you would replace this with actual API calls)
    const dynamicContentButton = document.getElementById('load-more-content');
    if (dynamicContentButton) {
        dynamicContentButton.addEventListener('click', function() {
            const contentWrapper = document.getElementById('dynamic-content');
            if (contentWrapper) {
                const newContent = document.createElement('p');
                newContent.textContent = 'This is dynamically loaded content!';
                contentWrapper.appendChild(newContent);
            }
        });
    }

    // Toggle dark mode
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            // Save the state for persistence across page reloads
            localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode'));
        });

        // Check if dark mode was previously enabled
        if (localStorage.getItem('dark-mode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    }

    // More interactivity can be added here
});