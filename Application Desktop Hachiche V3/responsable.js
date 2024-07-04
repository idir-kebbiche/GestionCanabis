const axios = require('axios');

// Fonction pour mettre à jour le contenu de la section 'content'
function updateContent(html) {
    document.getElementById('content').innerHTML = html;
}

// Fonction pour charger tous les responsables de décontamination depuis l'API
async function getAllResponsables() {
    try {
        const response = await axios.get('http://localhost:3000/responsabledecontamination');
        const responsables = response.data;
        let content = '<h1>Responsable de Décontamination</h1><ul class="resp-list">';
        responsables.forEach(responsable => {
            content += `
                <li>
                    <span class="resp-name">Nom: ${responsable.nom}</span>
                    <button class="edit-btn" data-id="${responsable.id}">Modifier</button>
                    <button class="delete-btn" data-id="${responsable.id}">Supprimer</button>
                </li>
            `;
        });
        content += '</ul>';
        updateContent(content);
        addNewResponsableButton();

        // Ajouter des écouteurs d'événements aux boutons d'édition et de suppression
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => {
                editResponsable(button.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                deleteResponsable(button.getAttribute('data-id'));
            });
        });

    } catch (error) {
        console.error(error);
        updateContent('Erreur lors du chargement des responsables de décontamination.');
    }
}

// Fonction pour créer un nouveau responsable de décontamination
async function createResponsable() {
    const inputForm = `
        <div id="createForm" class="resp-form">
            <p><strong>Nom du responsable:</strong>
            <input type="text" id="newResponsableName" placeholder="Nom du responsable">
            <button onclick="submitCreateResponsable()">Créer</button>
            <button onclick="cancelCreate()">Annuler</button>
        </div>
    `;
    document.getElementById('content').insertAdjacentHTML('beforeend', inputForm);
}

// Fonction pour soumettre la création d'un nouveau responsable de décontamination
async function submitCreateResponsable() {
    const nom = document.getElementById('newResponsableName').value;
    if (nom) {
        try {
            await axios.post('http://localhost:3000/responsabledecontamination', { nom });
            getAllResponsables(); // Recharger la liste des responsables après la création
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la création du responsable de décontamination.');
        }
    }
    document.getElementById('createForm').remove(); // Supprimer le formulaire après soumission
}

// Fonction pour éditer un responsable de décontamination
async function editResponsable(id) {
    const inputForm = `
        <div id="editForm" class="resp-form">
            <p><strong>Nom du responsable:</strong>
            <input type="text" id="editResponsableName" placeholder="Nouveau nom du responsable">
            <button onclick="submitEditResponsable('${id}')">Modifier</button>
            <button onclick="cancelEdit()">Annuler</button>
        </div>
    `;
    document.getElementById('content').insertAdjacentHTML('beforeend', inputForm);
}

// Fonction pour soumettre la modification d'un responsable de décontamination
async function submitEditResponsable(id) {
    const nom = document.getElementById('editResponsableName').value;
    if (nom) {
        try {
            await axios.put(`http://localhost:3000/responsabledecontamination/${id}`, { nom });
            getAllResponsables(); // Recharger la liste des responsables après la modification
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la modification du responsable de décontamination.');
        }
    }
    document.getElementById('editForm').remove(); // Supprimer le formulaire après soumission
}

// Fonction pour supprimer un responsable de décontamination
async function deleteResponsable(id) {
    if (confirm('Voulez-vous vraiment supprimer ce responsable de décontamination ?')) {
        try {
            await axios.delete(`http://localhost:3000/responsabledecontamination/${id}`);
            getAllResponsables(); // Recharger la liste des responsables après la suppression
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la suppression du responsable de décontamination.');
        }
    }
}

// Fonction pour ajouter un bouton 'Ajouter un nouveau responsable'
function addNewResponsableButton() {
    const content = document.getElementById('content');
    const button = document.createElement('button');
    button.innerText = 'Ajouter un nouveau responsable';
    button.addEventListener('click', createResponsable);
    content.appendChild(button);
}

// Fonction pour annuler la création d'un nouveau responsable
function cancelCreate() {
    document.getElementById('createForm').remove();
}

// Fonction pour annuler l'édition d'un responsable de décontamination
function cancelEdit() {
    document.getElementById('editForm').remove();
}

// Styles CSS spécifiques pour le contenu dynamique
const contentStyles = `
    .resp-list {
        list-style-type: none;
        padding: 0;
    }
    .resp-list li {
        background-color: #ffffff;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .resp-name {
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
    .resp-form {
        margin-top: 20px;
        padding: 10px;
        background-color: #ffffff;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .resp-form input {
        width: 200px;
        padding: 5px;
        margin-right: 10px;
        border: 1px solid #ccc;
        border-radius: 3px;
    }
    .resp-form button {
        padding: 5px 10px;
        font-size: 14px;
        cursor: pointer;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 3px;
    }
    .resp-form button:hover {
        background-color: #45a049;
    }
`;

// Création d'un élément style pour injecter les styles CSS dans le document
const styleElement = document.createElement('style');
styleElement.textContent = contentStyles;
document.head.appendChild(styleElement);

// Export des fonctions pour une utilisation dans d'autres fichiers
window.getAllResponsables = getAllResponsables;
window.createResponsable = createResponsable;
window.editResponsable = editResponsable;
window.deleteResponsable = deleteResponsable;
window.submitCreateResponsable = submitCreateResponsable;
window.submitEditResponsable = submitEditResponsable;
window.cancelCreate = cancelCreate;
window.cancelEdit = cancelEdit;

module.exports = {
    getAllResponsables,
    createResponsable,
    editResponsable,
    deleteResponsable
};
