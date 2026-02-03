document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('work-with-me-form');
    const status = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        status.textContent = '';

        // Capture data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            // Send to our Netlify Function (which saves to DB + proxies to Netlify Forms)
            const response = await fetch('/.netlify/functions/submit-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Submission failed');
            }

            // Success
            status.textContent = 'Request received. Redirecting to calendar...';
            status.style.color = '#00f0ff';

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'https://calendar.app.google/qMxCJGDQfZHjKJRZ6';
            }, 1000);

        } catch (error) {
            console.error('Submission Error:', error);
            // Show the actual error message for debugging
            status.textContent = `Error: ${error.message}. Please email directly.`;
            status.style.color = '#ff4d4d';
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});
