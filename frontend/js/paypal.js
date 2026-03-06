// PayPal Integration

// Initialize PayPal buttons
function initPayPalButtons() {
    if (typeof paypal === 'undefined') {
        showNotification('PayPal library not loaded', 'error');
        return;
    }

    paypal.Buttons({
        createOrder: function(data, actions) {
            return fetch(`${API_URL}/payments/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: '4.99'
                })
            })
            .then(res => res.json())
            .then(data => data.id);
        },
        onApprove: function(data, actions) {
            return fetch(`${API_URL}/payments/capture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderId: data.orderID
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    showNotification('Payment successful! You are now a Pro member.', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2000);
                } else {
                    showNotification('Payment failed. Please try again.', 'error');
                }
            });
        },
        onError: function(err) {
            console.error('PayPal error:', err);
            showNotification('An error occurred during payment. Please try again.', 'error');
        }
    }).render('#paypal-button-container');
}

// Handle Stripe payment (alternative)
function initStripePayment() {
    const stripe = Stripe('pk_test_your_public_key'); // Replace with your public key
    const elements = stripe.elements();
    const cardElement = elements.create('card');
    
    if (document.getElementById('card-element')) {
        cardElement.mount('#card-element');

        cardElement.addEventListener('change', (event) => {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });

        const form = document.getElementById('payment-form');
        form?.addEventListener('submit', async (event) => {
            event.preventDefault();

            const {token} = await stripe.createToken(cardElement);

            if (token) {
                // Send token to backend
                fetch(`${API_URL}/payments/stripe`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        stripeToken: token.id,
                        amount: 499 // $4.99 in cents
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        showNotification('Payment successful!', 'success');
                        window.location.href = 'dashboard.html';
                    } else {
                        showNotification(data.error || 'Payment failed', 'error');
                    }
                });
            }
        });
    }
}