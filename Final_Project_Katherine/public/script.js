$(document).ready(function () {
    $('#loginForm').on('submit', function (event) {
        event.preventDefault();

        var loginData = {
            username: $('#username').val(),
            password: $('#password').val()
        };

        $.post('/login', loginData, function (response) {
            if (response.validated) {
                window.location.href = response.newPage;
            } else {
                // Handle login failure
                alert('Invalid username or password');
            }
        });
    });
});

window.onload = function () {
    const button = document.getElementById('createAccountButton');
    if (button) {
        button.addEventListener('click', function () {
            window.location.href = '/register'; // Change this to the URL of your registration page
        });
    }
};

