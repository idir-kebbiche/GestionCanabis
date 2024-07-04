const axios = require('axios');

// Injecter le CSS dans le document
const style = document.createElement('style');
style.textContent = `
/* Style pour la liste des plantules */
ul {
    list-style-type: none;
    padding: 0;
}

li {
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ccc;
}

/* Style pour les boutons */
button {
    margin-right: 10px;
}

/* Style pour les formulaires de création et d'édition */
#createForm, #editForm {
    margin-top: 20px;
    border: 1px solid #ccc;
    padding: 10px;
}

#createForm p, #editForm p {
    margin: 5px 0;
}

#createForm input, #editForm input,
#createForm select, #editForm select,
#createForm textarea, #editForm textarea {
    margin-bottom: 10px;
    width: 100%;
    padding: 5px;
}

/* Style pour l'image du QR Code */
img {
    max-width: 200px;
    margin-top: 10px;
}
`;
document.head.appendChild(style);

async function getAllPlantules() {
    try {
        const response = await axios.get('http://localhost:3000/plantules');
        const plantules = response.data;
        let content = '<h1>Plantules</h1><ul>';
        plantules.forEach(plantule => {
            content += `<li>Plante: ${plantule.identification}
                            <button class="view-btn" data-id="${plantule.id}">Voir</button>
                            <button class="edit-btn" data-id="${plantule.id}">Modifier</button>
                            <button class="delete-btn" data-id="${plantule.id}">Supprimer</button>
                        </li>`;
        });
        content += '</ul>';
        updateContent(content);
        addNewPlantuleButton();

        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', () => {
                viewPlantule(button.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => {
                editPlantule(button.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                deletePlantule(button.getAttribute('data-id'));
            });
        });

    } catch (error) {
        console.error(error);
        updateContent('Erreur lors du chargement des plantules.');
    }
}

async function viewPlantule(id) {
    try {
        const entreposagesResponse = await axios.get('http://localhost:3000/entreposage');
        const responsablesResponse = await axios.get('http://localhost:3000/responsabledecontamination');
        const plantuleResponse = await axios.get(`http://localhost:3000/plantules/${id}`);
        
        const entreposages = entreposagesResponse.data;
        const responsables = responsablesResponse.data;
        const plantule = plantuleResponse.data;
        
        const entreposage = entreposages.find(e => e.id === plantule.entreposage_id);
        const responsable = responsables.find(r => r.id === plantule.responsable_decontamination_id);

        let content = `<h2>Détails de la plantule</h2>
                        <p><strong>ID:</strong> ${plantule.id}</p>
                       <p><strong>Identification:</strong> ${plantule.identification}</p>
                       <p><strong>État de santé:</strong> ${plantule.etat_sante}</p>
                       <p><strong>Date d'arrivée:</strong> ${plantule.date_arrivee}</p>
                       <p><strong>Provenance:</strong> ${plantule.provenance}</p>
                       <p><strong>Description:</strong> ${plantule.description}</p>
                       <p><strong>Stade:</strong> ${plantule.stade}</p>
                       <p><strong>Actif:</strong> ${plantule.actif ? 'Oui' : 'Non'}</p>
                       <p><strong>Date de retrait:</strong> ${plantule.date_retrait ? plantule.date_retrait : 'N/A'}</p>
                       <p><strong>Item retiré:</strong> ${plantule.item_retire ? plantule.item_retire : 'N/A'}</p>
                       <p><strong>Note:</strong> ${plantule.note ? plantule.note : 'N/A'}</p>`;

        if (entreposage) {
            content += `<p><strong>Entreposage:</strong> ${entreposage.nom}</p>`;
        } else {
            content += `<p><strong>Entreposage:</strong> Non spécifié</p>`;
        }
        
        if (responsable) {
            content += `<p><strong>Responsable de Décontamination:</strong> ${responsable.nom}</p>`;
        } else {
            content += `<p><strong>Responsable de Décontamination:</strong> Non spécifié</p>`;
        }

        if (plantule.qrCode) {
            content += `<h3>QR Code</h3>
                        <img src="data:image/png;base64,${plantule.qrCode}" alt="QR Code">`;
        } else {
            content += `<button onclick="generateQRCode(${plantule.id})">Générer QR Code</button>`;
        }
        updateContent(content);
    } catch (error) {
        console.error(error);
        updateContent('Erreur lors du chargement des détails de la plantule.');
    }
}

async function createPlantule() {
    try {
        const entreposages = await axios.get('http://localhost:3000/entreposage');
        const responsables = await axios.get('http://localhost:3000/responsabledecontamination');
        const entreposageOptions = entreposages.data.map(entreposage => `<option value="${entreposage.id}">${entreposage.nom}</option>`).join('');
        const responsableOptions = responsables.data.map(responsable => `<option value="${responsable.id}">${responsable.nom}</option>`).join('');

        const inputForm = `
            <div id="createForm">
                <p><strong>Identification:</strong>
                <input type="text" id="newPlantuleIdentification" placeholder="Identification">
                <p><strong>Etat de sante:</strong>
                <select id="newPlantuleEtatSante">
                    <option value="rouge">Rouge</option>
                    <option value="orange">Orange</option>
                    <option value="jaune">Jaune</option>
                    <option value="vert">Vert</option>
                </select>
                <p><strong>Date d'arivee:</strong>
                <input type="date" id="newPlantuleDateArrivee">
                <p><strong>Provenance:</strong>
                <input type="text" id="newPlantuleProvenance" placeholder="Provenance">
                <p><strong>Description:</strong>
                <textarea id="newPlantuleDescription" placeholder="Description"></textarea>
                <p><strong>Stade:</strong>
                <select id="newPlantuleStade">
                    <option value="Initiation">Initiation</option>
                    <option value="Microdissection">Microdissection</option>
                    <option value="Magenta">Magenta</option>
                    <option value="Double magenta">Double magenta</option>
                    <option value="Hydroponie">Hydroponie</option>
                </select>
                <p><strong>Entreposage:</strong>
                <select id="newPlantuleEntreposageId">
                    ${entreposageOptions}
                </select>
                <p><strong>Responsable de contamination:</strong>
                <select id="newPlantuleResponsableDecontaminationId">
                    ${responsableOptions}
                </select>
                <label for="newPlantuleActif">Actif:</label>
                <input type="checkbox" id="newPlantuleActif" checked>
                <p><strong>Date de ratrait:</strong>
                <input type="date" id="newPlantuleDateRetrait" placeholder="Date de retrait">
                <p><strong>Item  de retrait:</strong>
                <input type="text" id="newPlantuleItemRetire" placeholder="Item retiré">
                <p><strong>Note:</strong>
                <textarea id="newPlantuleNote" placeholder="Note"></textarea>
                <button onclick="submitCreatePlantule()">Créer</button>
                <button onclick="cancelCreate()">Annuler</button>
            </div>
        `;
        document.getElementById('content').insertAdjacentHTML('beforeend', inputForm);
    } catch (error) {
        console.error(error);
        updateContent('Erreur lors du chargement des données pour la création.');
    }
}

async function submitCreatePlantule() {
    const plantule = {
        identification: document.getElementById('newPlantuleIdentification').value,
        etat_sante: document.getElementById('newPlantuleEtatSante').value,
        date_arrivee: document.getElementById('newPlantuleDateArrivee').value,
        provenance: document.getElementById('newPlantuleProvenance').value,
        description: document.getElementById('newPlantuleDescription').value,
        stade: document.getElementById('newPlantuleStade').value,
        entreposage_id: document.getElementById('newPlantuleEntreposageId').value,
        responsable_decontamination_id: document.getElementById('newPlantuleResponsableDecontaminationId').value,
        actif: document.getElementById('newPlantuleActif').checked,
        date_retrait: document.getElementById('newPlantuleDateRetrait').value,
        item_retire: document.getElementById('newPlantuleItemRetire').value,
        note: document.getElementById('newPlantuleNote').value
    };

    try {
        await axios.post('http://localhost:3000/plantules', plantule);
        getAllPlantules();
    } catch (error) {
        console.error(error);
        alert('Erreur lors de la création de la plantule.');
    }
    document.getElementById('createForm').remove();
}

async function editPlantule(id) {
    try {
        const response = await axios.get(`http://localhost:3000/plantules/${id}`);
        const plantule = response.data;

        const entreposages = await axios.get('http://localhost:3000/entreposage');
        const responsables = await axios.get('http://localhost:3000/responsabledecontamination');
        const entreposageOptions = entreposages.data.map(entreposage => `<option value="${entreposage.id}" ${plantule.entreposage_id === entreposage.id ? 'selected' : ''}>${entreposage.nom}</option>`).join('');
        const responsableOptions = responsables.data.map(responsable => `<option value="${responsable.id}" ${plantule.responsable_decontamination_id === responsable.id ? 'selected' : ''}>${responsable.nom}</option>`).join('');

        const inputForm = `
            <div id="editForm">
                <p><strong>Identification:</strong>
                <input type="text" id="editPlantuleIdentification" value="${plantule.identification}">
                <p><strong>Etat de sante:</strong>
                <select id="editPlantuleEtatSante">
                    <option value="rouge" ${plantule.etat_sante === 'rouge' ? 'selected' : ''}>Rouge</option>
                    <option value="orange" ${plantule.etat_sante === 'orange' ? 'selected' : ''}>Orange</option>
                    <option value="jaune" ${plantule.etat_sante === 'jaune' ? 'selected' : ''}>Jaune</option>
                    <option value="vert" ${plantule.etat_sante === 'vert' ? 'selected' : ''}>Vert</option>
                </select>
                <p><strong>Date d'arivee:</strong>
                <input type="date" id="editPlantuleDateArrivee" value="${plantule.date_arrivee}">
                <p><strong>Provenance:</strong>
                <input type="text" id="editPlantuleProvenance" value="${plantule.provenance}">
                <p><strong>Description:</strong>
                <textarea id="editPlantuleDescription">${plantule.description}</textarea>
                <p><strong>Stade:</strong>
                <select id="editPlantuleStade">
                    <option value="Initiation" ${plantule.stade === 'Initiation' ? 'selected' : ''}>Initiation</option>
                    <option value="Microdissection" ${plantule.stade === 'Microdissection' ? 'selected' : ''}>Microdissection</option>
                    <option value="Magenta" ${plantule.stade === 'Magenta' ? 'selected' : ''}>Magenta</option>
                    <option value="Double magenta" ${plantule.stade === 'Double magenta' ? 'selected' : ''}>Double magenta</option>
                    <option value="Hydroponie" ${plantule.stade === 'Hydroponie' ? 'selected' : ''}>Hydroponie</option>
                </select>
                <p><strong>Entreposage:</strong>
                <select id="editPlantuleEntreposageId">
                    ${entreposageOptions}
                </select>
                <p><strong>Responsable de contamination:</strong>
                <select id="editPlantuleResponsableDecontaminationId">
                    ${responsableOptions}
                </select>
                <label for="editPlantuleActif">Actif:</label>
                <input type="checkbox" id="editPlantuleActif" ${plantule.actif ? 'checked' : ''}>
                <p><strong>Date de ratrait:</strong>
                <input type="date" id="editPlantuleDateRetrait" value="${plantule.date_retrait || ''}">
                <p><strong>Item  de retrait:</strong>
                <input type="text" id="editPlantuleItemRetire" value="${plantule.item_retire || ''}">
                <p><strong>Note:</strong>
                <textarea id="editPlantuleNote">${plantule.note || ''}</textarea>
                <button onclick="submitEditPlantule('${id}')">Modifier</button>
                <button onclick="cancelEdit()">Annuler</button>
            </div>
        `;
        document.getElementById('content').insertAdjacentHTML('beforeend', inputForm);
    } catch (error) {
        console.error(error);
        updateContent('Erreur lors du chargement des données pour la modification.');
    }
}

async function submitEditPlantule(id) {
    const plantule = {
        identification: document.getElementById('editPlantuleIdentification').value,
        etat_sante: document.getElementById('editPlantuleEtatSante').value,
        date_arrivee: document.getElementById('editPlantuleDateArrivee').value,
        provenance: document.getElementById('editPlantuleProvenance').value,
        description: document.getElementById('editPlantuleDescription').value,
        stade: document.getElementById('editPlantuleStade').value,
        entreposage_id: document.getElementById('editPlantuleEntreposageId').value,
        responsable_decontamination_id: document.getElementById('editPlantuleResponsableDecontaminationId').value,
        actif: document.getElementById('editPlantuleActif').checked,
        date_retrait: document.getElementById('editPlantuleDateRetrait').value,
        item_retire: document.getElementById('editPlantuleItemRetire').value,
        note: document.getElementById('editPlantuleNote').value
    };

    try {
        await axios.put(`http://localhost:3000/plantules/${id}`, plantule);
        getAllPlantules();
    } catch (error) {
        console.error(error);
        alert('Erreur lors de la modification de la plantule.');
    }
    document.getElementById('editForm').remove();
}

async function deletePlantule(id) {
    if (confirm('Voulez-vous vraiment supprimer cette plantule ?')) {
        try {
            await axios.delete(`http://localhost:3000/plantules/${id}`);
            getAllPlantules();
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la suppression de la plantule.');
        }
    }
}

function addNewPlantuleButton() {
    const content = document.getElementById('content');
    const button = document.createElement('button');
    button.innerText = 'Ajouter une nouvelle plantule';
    button.addEventListener('click', createPlantule);
    content.appendChild(button);
}

function cancelCreate() {
    document.getElementById('createForm').remove();
}

function cancelEdit() {
    document.getElementById('editForm').remove();
}

function updateContent(html) {
    document.getElementById('content').innerHTML = html;
}

window.getAllPlantules = getAllPlantules;
window.createPlantule = createPlantule;
window.editPlantule = editPlantule;
window.deletePlantule = deletePlantule;
window.submitCreatePlantule = submitCreatePlantule;
window.submitEditPlantule = submitEditPlantule;
window.cancelCreate = cancelCreate;
window.cancelEdit = cancelEdit;

module.exports = {
    getAllPlantules,
    createPlantule,
    editPlantule,
    deletePlantule
};
