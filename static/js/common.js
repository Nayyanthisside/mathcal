// Common utilities
function showMessage(message, type = 'error') {
    const existingMsg = document.querySelector('.message');
    if (existingMsg) existingMsg.remove();
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(msgDiv, container.firstChild);
    
    setTimeout(() => msgDiv.remove(), 5000);
}

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
}

function getUsername() {
    return localStorage.getItem('username');
}

function setUsername(username) {
    localStorage.setItem('username', username);
}

function logout() {
    removeToken();
    window.location.href = '/login';
}

// Check authentication on protected pages
function checkAuth() {
    const token = getToken();
    const currentPath = window.location.pathname;
    
    if (!token && (currentPath === '/calculator' || currentPath === '/result')) {
        window.location.href = '/login';
        return false;
    }
    
    if (token && (currentPath === '/login' || currentPath === '/register')) {
        window.location.href = '/calculator';
        return false;
    }
    
    return true;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // Update user info if logged in
    const username = getUsername();
    const userInfoElement = document.querySelector('.user-info');
    if (username && userInfoElement) {
        userInfoElement.innerHTML = `Welcome, <strong>${username}</strong> | <a href="#" onclick="logout()">Logout</a>`;
    }
});