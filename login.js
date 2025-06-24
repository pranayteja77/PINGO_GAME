function validateLogin(event) {
    event.preventDefault(); // Prevent form from submitting normally

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username === "admin" && password === "admin") {
        window.location.href = "home.html"; // Redirect to Pingo game
    } else {
        document.getElementById("error-msg").style.display = "block"; // Show error message
    }
}
