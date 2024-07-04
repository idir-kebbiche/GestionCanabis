const axios = require('axios');
const { ipcRenderer } = require('electron');

document.getElementById('loginBtn').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    axios.post('http://localhost:3000/login', { email, motDePasse: password })
        .then(response => {
            document.getElementById('loginResponse').innerText = 'Token : ' + response.data.token;
            localStorage.setItem('token', response.data.token);

            // Envoyer un message au processus principal
            ipcRenderer.send('login-success');
        })
        .catch(error => {
            document.getElementById('loginResponse').innerText = 'Erreur : ' + error.response.data.message;
        });
});
