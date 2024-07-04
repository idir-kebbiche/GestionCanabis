const responsables = require('./responsable'); // Importer le fichier responsables.js
const entreposages = require('./entreposage'); // Importer le fichier entreposage.js
const plantules = require('./plantules'); // Importer le fichier plantules.js
const modifications = require('./modification'); // Importer le fichier modification.js

async function displayHomeContent() {
    try {
        const response = await axios.get('http://localhost:3000/plantules');
        const plantules = response.data;

        // Calculer le nombre total de plantules
        const totalPlantules = plantules.length;

        // Compter les plantules par stade
        const stadeCount = {
            'Initiation': 0,
            'Microdissection': 0,
            'Magenta': 0,
            'Double magenta': 0,
            'Hydroponie': 0
        };

        // Compter les plantules par état de santé
        const santeCount = {
            'rouge': 0,
            'orange': 0,
            'jaune': 0,
            'vert': 0
        };

        // Compter les plantules par état actif ou non
        const actifCount = {
            'Actif': 0,
            'Non actif': 0
        };

        plantules.forEach(plantule => {
            if (stadeCount.hasOwnProperty(plantule.stade)) {
                stadeCount[plantule.stade]++;
            }
            if (santeCount.hasOwnProperty(plantule.etat_sante)) {
                santeCount[plantule.etat_sante]++;
            }
            if (plantule.actif) {
                actifCount['Actif']++;
            } else {
                actifCount['Non actif']++;
            }
        });

        // Créer le contenu HTML
        let content = `
            <h1>Accueil</h1>
            <h2>Stock des Plantules</h2>
            <div class="chart-wrapper">
                <div class="chart-container">
                    <canvas id="plantulesStadeChart"></canvas>
                </div>
                <button id="fullscreenStadeBtn">Afficher en plein écran</button>
            </div>
            <div class="chart-wrapper">
                <div class="chart-container">
                    <canvas id="plantulesSanteChart"></canvas>
                </div>
                <button id="fullscreenSanteBtn">Afficher en plein écran</button>
            </div>
            <div class="chart-wrapper">
                <div class="chart-container">
                    <canvas id="actifPlantulesChart"></canvas>
                </div>
                <button id="fullscreenActifBtn">Afficher en plein écran</button>
            </div>
        `;

        updateContent(content);

        // Créer le graphique pour les stades
        createChart('plantulesStadeChart', 'bar', 'Distribution des Plantules par Stade', Object.keys(stadeCount), Object.values(stadeCount));

        // Créer le graphique pour les états de santé
        createChart('plantulesSanteChart', 'pie', 'Distribution des Plantules par État de Santé', Object.keys(santeCount), Object.values(santeCount));

        // Créer le graphique pour les plantules actives ou non actives
        createChart('actifPlantulesChart', 'doughnut', 'Distribution des Plantules par État Actif/Non Actif', Object.keys(actifCount), Object.values(actifCount));

        // Ajouter les gestionnaires d'événements pour les boutons plein écran
        document.getElementById('fullscreenStadeBtn').addEventListener('click', () => {
            showFullscreenChart('plantulesStadeChart', 'Distribution des Plantules par Stade');
        });

        document.getElementById('fullscreenSanteBtn').addEventListener('click', () => {
            showFullscreenChart('plantulesSanteChart', 'Distribution des Plantules par État de Santé');
        });

        document.getElementById('fullscreenActifBtn').addEventListener('click', () => {
            showFullscreenChart('actifPlantulesChart', 'Distribution des Plantules par État Actif/Non Actif');
        });

    } catch (error) {
        console.error(error);
        updateContent('Erreur lors du chargement des données des plantules.');
    }
}

function createChart(canvasId, type, title, labels, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Définir des couleurs spécifiques pour les états de santé
    const santeColors = {
        'rouge': 'rgba(255, 99, 132, 0.6)',
        'orange': 'rgba(255, 159, 64, 0.6)',
        'jaune': 'rgba(255, 205, 86, 0.6)',
        'vert': 'rgba(75, 192, 192, 0.6)'
    };

    // Définir des couleurs spécifiques pour les plantules actives/non actives
    const actifColors = {
        'Actif': 'rgba(54, 162, 235, 0.6)', // Bleu
        'Non actif': 'rgba(255, 99, 132, 0.6)' // Rouge
    };


    // Choisir les couleurs en fonction du type de graphique
    let backgroundColor;
    if (title.includes('État de Santé')) {
        backgroundColor = labels.map(label => santeColors[label]);
    } else if (title.includes('État Actif/Non Actif')) {
        backgroundColor = labels.map(label => actifColors[label]);
    } else {
        backgroundColor = [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
        ];
    }

    new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: backgroundColor,
                borderColor: backgroundColor.map(color => color.replace('0.6', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title
                }
            }
        }
    });
}

function showFullscreenChart(chartId, title) {
    const chartCanvas = document.getElementById(chartId);
    const fullscreenContainer = document.createElement('div');
    fullscreenContainer.style.position = 'fixed';
    fullscreenContainer.style.top = '0';
    fullscreenContainer.style.left = '0';
    fullscreenContainer.style.width = '100vw';
    fullscreenContainer.style.height = '100vh';
    fullscreenContainer.style.backgroundColor = 'white';
    fullscreenContainer.style.zIndex = '1000';

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Fermer';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '10px';
    closeBtn.style.right = '10px';

    const fullscreenCanvas = document.createElement('canvas');
    fullscreenCanvas.style.width = '90%';
    fullscreenCanvas.style.height = '90%';
    fullscreenCanvas.style.margin = 'auto';
    fullscreenCanvas.style.display = 'block';

    fullscreenContainer.appendChild(closeBtn);
    fullscreenContainer.appendChild(fullscreenCanvas);
    document.body.appendChild(fullscreenContainer);

    const chart = Chart.getChart(chartId);
    new Chart(fullscreenCanvas, {
        type: chart.config.type,
        data: chart.data,
        options: {
            ...chart.options,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                ...chart.options.plugins,
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 24
                    }
                }
            }
        }
    });

    closeBtn.addEventListener('click', () => {
        document.body.removeChild(fullscreenContainer);
    });
}



// Modifier l'événement du lien d'accueil
document.getElementById('homeLink').addEventListener('click', displayHomeContent);


document.getElementById('responsableLink').addEventListener('click', () => {
    responsables.getAllResponsables(); // Afficher les responsables de décontamination
});

document.getElementById('entreposageLink').addEventListener('click', () => {
    entreposages.getAllEntreposages(); // Afficher les entreposages
});

document.getElementById('plantulesLink').addEventListener('click', () => {
    plantules.getAllPlantules(); // Afficher les plantules
});

document.getElementById('modificationLink').addEventListener('click', () => {
    modifications.getAllModifications(); // Afficher les modifications
});

document.getElementById('uploadLink').addEventListener('click', () => {
    window.location.href = 'upload.html'; // Rediriger vers la page d'upload
});

document.getElementById('logoutLink').addEventListener('click', () => {
    // Logic de déconnexion, par exemple, supprimer le token et fermer la fenêtre
    localStorage.removeItem('token');
    window.close();
});

function updateContent(html) {
    document.getElementById('content').innerHTML = html;
}

// Ajouter le bouton pour créer un nouveau responsable de décontamination
function addNewResponsableButton() {
    const content = document.getElementById('content');
    const button = document.createElement('button');
    button.innerText = 'Ajouter un nouveau responsable';
    button.addEventListener('click', () => {
        responsables.createResponsable();
    });
    content.appendChild(button);
}

module.exports = {
    updateContent,
    addNewResponsableButton
};
