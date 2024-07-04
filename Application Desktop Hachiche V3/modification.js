const axios = require('axios');

// Injecter le CSS dans le document
const style = document.createElement('style');
style.textContent = `
/* Style pour la liste des modifications */
.modif-list {
    list-style-type: none;
    padding: 0;
}
.modif-list li {
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ccc;
}
.modif-plantule {
    font-weight: bold;
    margin-right: 10px;
}
.modif-date {
    margin-right: 10px;
}
.modif-champs {
    margin-right: 10px;
}
/* Style pour les formulaires de création et d'édition */
.modif-form {
    margin-top: 20px;
    border: 1px solid #ccc;
    padding: 10px;
}
.modif-form p {
    margin: 5px 0;
}
.modif-form button {
    margin-right: 10px;
}
`;
document.head.appendChild(style);

// Fonction pour mettre à jour le contenu de la section 'content'
function updateContent(html) {
    document.getElementById('content').innerHTML = html;
}

// Fonction pour charger toutes les modifications depuis l'API
async function getAllModifications() {
    try {
        const response = await axios.get('http://localhost:3000/modification');
        const modifications = response.data;
        let content = '<h1>Modifications</h1><ul class="modif-list">';
        for (const modification of modifications) {
            const plantuleResponse = await axios.get(`http://localhost:3000/plantules/${modification.plantule_id}`);
            const plantule = plantuleResponse.data;
            content += `
                <li>
                    <span class="modif-plantule">Plantule: ${plantule.identification}</span>
                    <span class="modif-date">Date: ${new Date(modification.date_modification).toLocaleString()}</span>
                    <span class="modif-champs">Champs modifiés: ${modification.champs_modifies}</span>
                    <button class="view-btn" data-id="${modification.id}">Voir</button>
                    <button class="edit-btn" data-id="${modification.id}">Modifier</button>
                    <button class="delete-btn" data-id="${modification.id}">Supprimer</button>
                </li>
            `;
        }
        content += '</ul>';
        updateContent(content);
        addNewModificationButton();

        // Ajouter des écouteurs d'événements aux boutons Voir, Modifier et Supprimer
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', () => {
                viewModification(button.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => {
                editModification(button.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                deleteModification(button.getAttribute('data-id'));
            });
        });

    } catch (error) {
        console.error(error);
        updateContent('Erreur lors du chargement des modifications.');
    }
}

// Fonction pour afficher les détails d'une modification spécifique
async function viewModification(id) {
    try {
        const response = await axios.get(`http://localhost:3000/modification/${id}`);
        const modification = response.data;
        
        // Obtenir les détails de la plantule associée à la modification
        const plantuleResponse = await axios.get(`http://localhost:3000/plantules/${modification.plantule_id}`);
        const plantule = plantuleResponse.data;
        
        let content = `
            <h2>Détails de la modification</h2>
            <p><strong>ID:</strong> ${modification.id}</p>
            <p><strong>Plantule:</strong> ${plantule.identification}</p>
            <p><strong>Date de modification:</strong> ${new Date(modification.date_modification).toLocaleString()}</p>
            <p><strong>Champs modifiés:</strong> ${modification.champs_modifies}</p>
            <button onclick="getAllModifications()">Retour à la liste</button>
        `;
        
        updateContent(content);
    } catch (error) {
        console.error(error);
        updateContent('Erreur lors du chargement des détails de la modification.');
    }
}

// Fonction pour créer une nouvelle modification
async function createModification() {
    try {
        const plantuleResponse = await axios.get('http://localhost:3000/plantules');
        const plantules = plantuleResponse.data;
        const plantuleOptions = plantules.map(p => `<option value="${p.id}">${p.identification}</option>`).join('');
        
        const champsOptions = `
            <option value="identification">Identification</option>
            <option value="etat_sante">État de santé</option>
            <option value="date_arrivee">Date d'arrivée</option>
            <option value="provenance">Provenance</option>
            <option value="description">Description</option>
            <option value="stade">Stade</option>
            <option value="actif">Actif</option>
            <option value="date_retrait">Date de retrait</option>
            <option value="item_retire">Item retiré</option>
            <option value="note">Note</option>
            <option value="entreposage_id">Entreposage</option>
            <option value="responsable_decontamination_id">Responsable de décontamination</option>
        `;
        
        const inputForm = `
            <div id="createForm" class="modif-form">
                <p><strong>Plantule:</strong>
                <select id="newModificationPlantuleId">
                    ${plantuleOptions}
                </select></p>
                <p><strong>Date de modification:</strong>
                <input type="datetime-local" id="newModificationDate"></p>
                <p><strong>Champs modifiés:</strong>
                <select id="newModificationChamps" multiple>
                    ${champsOptions}
                </select></p>
                <button onclick="submitCreateModification()">Créer</button>
                <button onclick="cancelCreate()">Annuler</button>
            </div>
        `;
        document.getElementById('content').insertAdjacentHTML('beforeend', inputForm);
    } catch (error) {
        console.error(error);
        alert('Erreur lors du chargement des plantules.');
    }
}

// Fonction pour soumettre la création d'une nouvelle modification
async function submitCreateModification() {
    const plantuleId = document.getElementById('newModificationPlantuleId').value;
    const date = document.getElementById('newModificationDate').value;
    const champs = document.getElementById('newModificationChamps').value;

    if (!plantuleId || !date || !champs) {
        alert('Tous les champs sont requis');
        return;
    }

    const modification = {
        plantule_id: parseInt(plantuleId),
        date_modification: new Date(date).toISOString(),
        champs_modifies: champs
    };

    try {
        const response = await axios.post('http://localhost:3000/modification', modification);
        console.log('Réponse du serveur:', response.data);
        getAllModifications(); // Recharger la liste des modifications après création
    } catch (error) {
        console.error('Erreur complète:', error);
        if (error.response) {
            console.error('Données de réponse:', error.response.data);
            alert('Erreur lors de la création de la modification: ' + (error.response.data.error || 'Erreur inconnue'));
        } else {
            alert('Erreur lors de la création de la modification: ' + error.message);
        }
    }
    document.getElementById('createForm').remove(); // Supprimer le formulaire après soumission
}

// Fonction pour éditer une modification existante
async function editModification(id) {
    try {
        const response = await axios.get(`http://localhost:3000/modification/${id}`);
        const modification = response.data;

        const plantuleResponse = await axios.get('http://localhost:3000/plantules');
        const plantules = plantuleResponse.data;
        const plantuleOptions = plantules.map(p => `<option value="${p.id}" ${p.id === modification.plantule_id ? 'selected' : ''}>${p.identification}</option>`).join('');

        const champsOptions = `
            <option value="identification" ${modification.champs_modifies.includes('identification') ? 'selected' : ''}>Identification</option>
            <option value="etat_sante" ${modification.champs_modifies.includes('etat_sante') ? 'selected' : ''}>État de santé</option>
            <option value="date_arrivee" ${modification.champs_modifies.includes('date_arrivee') ? 'selected' : ''}>Date d'arrivée</option>
            <option value="provenance" ${modification.champs_modifies.includes('provenance') ? 'selected' : ''}>Provenance</option>
            <option value="description" ${modification.champs_modifies.includes('description') ? 'selected' : ''}>Description</option>
            <option value="stade" ${modification.champs_modifies.includes('stade') ? 'selected' : ''}>Stade</option>
            <option value="actif" ${modification.champs_modifies.includes('actif') ? 'selected' : ''}>Actif</option>
            <option value="date_retrait" ${modification.champs_modifies.includes('date_retrait') ? 'selected' : ''}>Date de retrait</option>
            <option value="item_retire" ${modification.champs_modifies.includes('item_retire') ? 'selected' : ''}>Item retiré</option>
            <option value="note" ${modification.champs_modifies.includes('note') ? 'selected' : ''}>Note</option>
            <option value="entreposage_id" ${modification.champs_modifies.includes('entreposage_id') ? 'selected' : ''}>Entreposage</option>
            <option value="responsable_decontamination_id" ${modification.champs_modifies.includes('responsable_decontamination_id') ? 'selected' : ''}>Responsable de décontamination</option>
        `;

        const inputForm = `
            <div id="editForm" class="modif-form">
                <p><strong>Plantule:</strong>
                <select id="editModificationPlantuleId">
                    ${plantuleOptions}
                </select></p>
                <p><strong>Date de modification:</strong>
                <input type="datetime-local" id="editModificationDate" value="${modification.date_modification.slice(0, 16)}"></p>
                <p><strong>Champs modifiés:</strong>
                <select id="editModificationChamps" multiple>
                    ${champsOptions}
                </select></p>
                <button onclick="submitEditModification('${id}')">Modifier</button>
                <button onclick="cancelEdit()">Annuler</button>
            </div>
        `;
        document.getElementById('content').insertAdjacentHTML('beforeend', inputForm);
    } catch (error) {
        console.error(error);
        updateContent('Erreur lors du chargement des données pour la modification.');
    }
}

// Fonction pour soumettre les modifications apportées à une modification existante
async function submitEditModification(id) {
    const plantuleId = document.getElementById('editModificationPlantuleId').value;
    const date = document.getElementById('editModificationDate').value;
    const champs = document.getElementById('editModificationChamps').value;

    if (!plantuleId || !date || !champs) {
        alert('Tous les champs sont requis');
        return;
    }

    const modification = {
        plantule_id: parseInt(plantuleId),
        date_modification: new Date(date).toISOString(),
        champs_modifies: champs
    };

    try {
        const response = await axios.put(`http://localhost:3000/modification/${id}`, modification);
        console.log('Réponse du serveur:', response.data);
        getAllModifications(); // Recharger la liste des modifications après modification
    } catch (error) {
        console.error('Erreur complète:', error);
        if (error.response) {
            console.error('Données de réponse:', error.response.data);
            alert('Erreur lors de la modification: ' + (error.response.data.error || 'Erreur inconnue'));
        } else {
            alert('Erreur lors de la modification: ' + error.message);
        }
    }
    document.getElementById('editForm').remove(); // Supprimer le formulaire après soumission
}

// Fonction pour supprimer une modification
async function deleteModification(id) {
    if (confirm('Voulez-vous vraiment supprimer cette modification ?')) {
        try {
            await axios.delete(`http://localhost:3000/modification/${id}`);
            getAllModifications(); // Recharger la liste des modifications après suppression
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la suppression de la modification.');
        }
    }
}

// Fonction pour ajouter un bouton "Ajouter une nouvelle modification"
function addNewModificationButton() {
    const content = document.getElementById('content');
    const button = document.createElement('button');
    button.innerText = 'Ajouter une nouvelle modification';
    button.addEventListener('click', createModification);
    content.appendChild(button);
}

// Fonction pour annuler la création d'une modification
function cancelCreate() {
    document.getElementById('createForm').remove();
}

// Fonction pour annuler l'édition d'une modification
function cancelEdit() {
    document.getElementById('editForm').remove();
}

// Exposition des fonctions nécessaires globalement
window.getAllModifications = getAllModifications;
window.createModification = createModification;
window.editModification = editModification;
window.deleteModification = deleteModification;
window.submitCreateModification = submitCreateModification;
window.submitEditModification = submitEditModification;
window.cancelCreate = cancelCreate;
window.cancelEdit = cancelEdit;

module.exports = {
    getAllModifications,
    createModification,
    editModification,
    deleteModification
};
