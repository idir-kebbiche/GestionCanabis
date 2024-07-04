// routes/plantules.js
const express = require('express');
const Plantule = require('../models/Plantule');
const QRCodeService = require('../services/QRCodeService');
const sequelize = require('../config/database');  // Importez sequelize
const QRCode = require('../models/QRCode');       // Importez QRCode si ce n'est pas déjà fait
const Modification = require('../models/Modification'); // Importez Modification si ce n'est pas déjà fait

const router = express.Router();
const qrCodeService = new QRCodeService('chemin_vers_ta_base_de_donnees.sqlite');

// Créer une nouvelle plantule
router.post('/', async (req, res) => {
  try {
    const plantule = await Plantule.create(req.body);
    
    // Générer le code QR pour la nouvelle plantule
    await qrCodeService.generateQRCodeForPlantule(plantule.id);
    
    res.status(201).json(plantule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtenir toutes les plantules
router.get('/', async (req, res) => {
  try {
    const plantules = await Plantule.findAll();
    res.json(plantules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir une plantule par ID avec le code QR
router.get('/:id', async (req, res) => {
  try {
    const plantule = await Plantule.findByPk(req.params.id);
    if (!plantule) {
      return res.status(404).json({ error: 'Plantule not found' });
    }
    
    // Récupérer le code QR pour la plantule
    const qrCode = await qrCodeService.getQRCodeForPlantule(plantule.id);

    // Ajouter le code QR à la réponse
    const plantuleWithQR = {
      ...plantule.toJSON(),
      qrCode: qrCode ? qrCode.toString('base64') : null // Convertir en base64 pour l'inclusion dans la réponse
    };

    res.json(plantuleWithQR);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour une plantule par ID
router.put('/:id', async (req, res) => {
  try {
    const plantule = await Plantule.findByPk(req.params.id);
    if (!plantule) {
      return res.status(404).json({ error: 'Plantule not found' });
    }
    
    // Mettre à jour la plantule avec les données fournies
    await plantule.update(req.body);
    
    // Générer le code QR mis à jour pour la plantule
    // await qrCodeService.generateQRCodeForPlantule(plantule.id);
    
    res.json(plantule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer une plantule par ID
router.delete('/:id', async (req, res) => {
  const plantuleId = req.params.id;
  
  try {
    await sequelize.transaction(async (t) => {
      await QRCode.destroy({ where: { plantule_id: plantuleId }, transaction: t });
      await Modification.destroy({ where: { plantule_id: plantuleId }, transaction: t });
      await Plantule.destroy({ where: { id: plantuleId }, transaction: t });
    });
    
    res.status(200).json({ message: 'Plantule supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la plantule:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la plantule', error: error.message });
  }
});

module.exports = router;
