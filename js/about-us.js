// About Us JavaScript - Cybersec Academy

document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js if the element exists
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#5cdb95'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    },
                    polygon: {
                        nb_sides: 5
                    }
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#3494c9',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 8,
                        speed: 3
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });
    }

    // Glitch text animation on scroll or mouse hover
    const glitchTexts = document.querySelectorAll('.glitch, .sub-glitch');
    
    glitchTexts.forEach(text => {
        text.addEventListener('mouseenter', () => {
            text.classList.add('glitching');
            setTimeout(() => {
                text.classList.remove('glitching');
            }, 1000);
        });
    });

    // Team member card interaction enhancements
    const teamCards = document.querySelectorAll('.team-card');

    teamCards.forEach(card => {
        // Create mouse follow effect on cards
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate percentage positions
            const xPercent = x / rect.width * 100;
            const yPercent = y / rect.height * 100;
            
            // Apply subtle 3D rotation
            card.style.transform = `perspective(1000px) rotateY(${(xPercent - 50) / 20}deg) rotateX(${(yPercent - 50) / -20}deg) translateY(-10px)`;
            
            // Move glow effect to follow mouse
            const profileGlow = card.querySelector('.profile-glow');
            if (profileGlow) {
                profileGlow.style.background = `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(92, 219, 149, 0.2), transparent 50%)`;
            }
        });

        // Reset when mouse leaves
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            const profileGlow = card.querySelector('.profile-glow');
            if (profileGlow) {
                profileGlow.style.background = '';
            }
        });
    });

    // Timeline animation on scroll
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    function checkTimelineVisibility() {
        timelineItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            const isInViewport = (
                rect.top >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
            );
            
            if (isInViewport) {
                item.classList.add('animated');
            }
        });
    }
    
    // Check visibility on scroll
    window.addEventListener('scroll', checkTimelineVisibility);
    
    // Check on initial load
    checkTimelineVisibility();

    // Contact form animation and validation
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        // Add glow effect on focus
        const formInputs = contactForm.querySelectorAll('input, textarea');
        
        formInputs.forEach(input => {
            input.addEventListener('focus', () => {
                const glowElement = input.nextElementSibling;
                if (glowElement && glowElement.classList.contains('input-glow')) {
                    glowElement.style.opacity = '0.3';
                }
            });
            
            input.addEventListener('blur', () => {
                const glowElement = input.nextElementSibling;
                if (glowElement && glowElement.classList.contains('input-glow')) {
                    glowElement.style.opacity = '0';
                }
            });
        });
        
        // Form submission animation and handling
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validate form fields
            const allFieldsValid = Array.from(formInputs).every(input => input.value.trim() !== '');
            
            if (allFieldsValid) {
                // Show success animation
                const submitBtn = contactForm.querySelector('.submit-btn');
                submitBtn.innerHTML = '<span class="btn-text">Message Sent!</span><span class="btn-icon"><i class="fas fa-check"></i></span>';
                submitBtn.style.background = 'linear-gradient(45deg, var(--cyber-green-dark), var(--cyber-green))';
                submitBtn.disabled = true;
                
                // Reset form after delay
                setTimeout(() => {
                    contactForm.reset();
                    submitBtn.innerHTML = '<span class="btn-text">Send Message</span><span class="btn-icon"><i class="fas fa-paper-plane"></i></span>';
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                // Highlight missing fields
                formInputs.forEach(input => {
                    if (input.value.trim() === '') {
                        input.style.borderColor = 'var(--cyber-red)';
                        setTimeout(() => {
                            input.style.borderColor = '';
                        }, 2000);
                    }
                });
            }
        });
    }

    // Add scroll-triggered animations for sections
    const animateSections = document.querySelectorAll('#team-members, #our-story, #contact-us');
    
    function checkSectionVisibility() {
        animateSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const isInViewport = (
                rect.top < (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
                rect.bottom >= 0
            );
            
            if (isInViewport && !section.classList.contains('animated')) {
                section.classList.add('animated');
                section.style.animation = 'fadeIn 0.8s ease-out forwards';
            }
        });
    }
    
    // Check visibility on scroll
    window.addEventListener('scroll', checkSectionVisibility);
    
    // Check on initial load
    checkSectionVisibility();
}); 