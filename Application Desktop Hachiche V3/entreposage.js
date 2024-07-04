const axios = require('axios');

// Fonction pour mettre à jour le contenu de la section 'content'
function updateContent(html) {
    document.getElementById('content').innerHTML = html;
}

// Fonction pour charger tous les entreposages depuis l'API
async function getAllEntreposages() {
    try {
        const response = await axios.get('http://localhost:3000/entreposage');
        const entreposages = response.data;
        let content = '<h1>Entreposage</h1><ul class="entrep-list">';
        entreposages.forEach(entreposage => {
            content += `
                <li>
                    <span class="entrep-name">Nom: ${entreposage.nom}</span>
                    <button class="edit-btn" data-id="${entreposage.id}">Modifier</button>
                    <button class="delete-btn" data-id="${entreposage.id}">Supprimer</button>
                </li>
            `;
        });
        content += '</ul>';
        updateContent(content);
        addNewEntreposageButton();

        // Ajouter des écouteurs d'événements aux boutons d'édition et de suppression
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => {
                editEntreposage(button.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                deleteEntreposage(button.getAttribute('data-id'));
            });
        });

    } catch (error) {
        console.error(error);
        updateContent('Erreur lors du chargement des entreposages.');
    }
}

// Fonction pour créer un nouvel entreposage
async function createEntreposage() {
    const inputForm = `
        <div id="createForm" class="entrep-form">
            <p><strong>Nom de l'entreposage:</strong>
            <input type="text" id="newEntreposageName" placeholder="Nom de l'entreposage">
            <button onclick="submitCreateEntreposage()">Créer</button>
            <button onclick="cancelCreate()">Annuler</button>
        </div>
    `;
    document.getElementById('content').insertAdjacentHTML('beforeend', inputForm);
}

// Fonction pour soumettre la création d'un nouvel entreposage
async function submitCreateEntreposage() {
    const nom = document.getElementById('newEntreposageName').value;
    if (nom) {
        try {
            await axios.post('http://localhost:3000/entreposage', { nom });
            getAllEntreposages(); // Recharger la liste des entreposages après la création
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la création de l\'entreposage.');
        }
    }
    document.getElementById('createForm').remove(); // Supprimer le formulaire après soumission
}

// Fonction pour éditer un entreposage
async function editEntreposage(id) {
    const inputForm = `
        <div id="editForm" class="entrep-form">
            <p><strong>Nom de l'entreposage:</strong>
            <input type="text" id="editEntreposageName" placeholder="Nouveau nom de l'entreposage">
            <button onclick="submitEditEntreposage('${id}')">Modifier</button>
            <button onclick="cancelEdit()">Annuler</button>
        </div>
    `;
    document.getElementById('content').insertAdjacentHTML('beforeend', inputForm);
}

// Fonction pour soumettre la modification d'un entreposage
async function submitEditEntreposage(id) {
    const nom = document.getElementById('editEntreposageName').value;
    if (nom) {
        try {
            await axios.put(`http://localhost:3000/entreposage/${id}`, { nom });
            getAllEntreposages(); // Recharger la liste des entreposages après la modification
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la modification de l\'entreposage.');
        }
    }
    document.getElementById('editForm').remove(); // Supprimer le formulaire après soumission
}

// Fonction pour supprimer un entreposage
async function deleteEntreposage(id) {
    if (confirm('Voulez-vous vraiment supprimer cet entreposage ?')) {
        try {
            await axios.delete(`http://localhost:3000/entreposage/${id}`);
            getAllEntreposages(); // Recharger la liste des entreposages après la suppression
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la suppression de l\'entreposage.');
        }
    }
}

// Fonction pour ajouter un bouton 'Ajouter un nouvel entreposage'
function addNewEntreposageButton() {
    const content = document.getElementById('content');
    const button = document.createElement('button');
    button.innerText = 'Ajouter un nouvel entreposage';
    button.addEventListener('click', createEntreposage);
    content.appendChild(button);
}

// Fonction pour annuler la création d'un nouvel entreposage
function cancelCreate() {
    document.getElementById('createForm').remove();
}

// Fonction pour annuler l'édition d'un entreposage
function cancelEdit() {
    document.getElementById('editForm').remove();
}

// Styles CSS spécifiques pour le contenu dynamique
const contentStyles = `
    .entrep-list {
        list-style-type: none;
        padding: 0;
    }
    .entrep-list li {
        background-color: #ffffff;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .entrep-name {
        font-weight: bold;
    }
    .edit-btn, .delete-btn {
        margin-left: 10px;
        padding: 5px 10px;
        font-size: 14px;
        cursor: pointer;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 3px;
    }
    .edit-btn:hover, .delete-btn:hover {
        background-color: #45a049;
    }
    .entrep-form {
        margin-top: 20px;
        padding: 10px;
        background-color: #ffffff;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .entrep-form input {
        width: 200px;
        padding: 5px;
        margin-right: 10px;
        border: 1px solid #ccc;
        border-radius: 3px;
    }
    .entrep-form button {
        padding: 5px 10px;
        font-size: 14px;
        cursor: pointer;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 3px;
    }
    .entrep-form button:hover {
        background-color: #45a049;
    }
`;

// Création d'un élément style pour injecter les styles CSS dans le document
const styleElement = document.createElement('style');
styleElement.textContent = contentStyles;
document.head.appendChild(styleElement);

// Export des fonctions pour une utilisation dans d'autres fichiers
window.getAllEntreposages = getAllEntreposages;
window.createEntreposage = createEntreposage;
window.editEntreposage = editEntreposage;
window.deleteEntreposage = deleteEntreposage;
window.submitCreateEntreposage = submitCreateEntreposage;
window.submitEditEntreposage = submitEditEntreposage;
window.cancelCreate = cancelCreate;
window.cancelEdit = cancelEdit;

module.exports = {
    getAllEntreposages,
    createEntreposage,
    editEntreposage,
    deleteEntreposage
};
