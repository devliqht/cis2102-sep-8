function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showMessage(message, type) {
    const messageClass = type === 'success' ? 'message-success' : 'message-error';
    const messageHtml = `<div class="message ${messageClass}">${message}</div>`;

    $('.message').remove();
    $('.card').prepend(messageHtml);

    setTimeout(function() {
        $('.message').fadeOut(function() {
            $(this).remove();
        });
    }, 5000);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
