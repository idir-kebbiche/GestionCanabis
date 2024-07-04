const axios = require('axios');

async function getStock() {
    try {
        const response = await axios.get('http://localhost:3000/plantules');
        const plantules = response.data;
        
        let content = '<h1>Notre Stock de Plantes</h1>';
        content += '<table border="1">';
        content += '<tr><th>Identification</th><th>État de santé</th><th>Stade</th><th>Provenance</th><th>Date darrivée</th></tr>';
        
        plantules.forEach(plantule => {
            content += `<tr>
                <td>${plantule.identification}</td>
                <td>${plantule.etat_sante}</td>
                <td>${plantule.stade}</td>
                <td>${plantule.provenance}</td>
                <td>${plantule.date_arrivee}</td>
            </tr>`;
        });
        
        content += '</table>';
        
        // Ajouter des statistiques
        const totalPlantules = plantules.length;
        const stades = plantules.reduce((acc, plantule) => {
            acc[plantule.stade] = (acc[plantule.stade] || 0) + 1;
            return acc;
        }, {});
        
        content += '<h2>Statistiques</h2>';
        content += `<p>Nombre total de plantules : ${totalPlantules}</p>`;
        content += '<h3>Répartition par stade :</h3>';
        content += '<ul>';
        for (const [stade, count] of Object.entries(stades)) {
            content += `<li>${stade}: ${count}</li>`;
        }
        content += '</ul>';
        
        updateContent(content);
    } catch (error) {
        console.error(error);
        updateContent('Erreur lors du chargement du stock.');
    }
}

function updateContent(html) {
    document.getElementById('content').innerHTML = html;
}

// Exporter la fonction pour qu'elle soit accessible depuis d'autres fichiers
window.getStock = getStock;