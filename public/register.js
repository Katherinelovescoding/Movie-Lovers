document.getElementById('registerForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from being submitted normally

    const username = document.getElementById('new_username').value;
    const password = document.getElementById('new_password').value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('User registered successfully, now you can login!');
                window.location.href = '/login'; // Redirect to the login page
            } else {
                alert(data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

document.getElementById('loginButton').addEventListener('click', function (event) {
    window.location.href = '/login'; // Redirect to the login page
});