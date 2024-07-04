const express = require('express');
const ResponsableDecontamination = require('../models/ResponsableDecontamination');

const router = express.Router();

// Créer un nouveau responsable de décontamination
router.post('/', async (req, res) => {
  try {
    const responsable = await ResponsableDecontamination.create(req.body);
    res.status(201).json(responsable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtenir tous les responsables de décontamination
router.get('/', async (req, res) => {
  try {
    const responsables = await ResponsableDecontamination.findAll();
    res.json(responsables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir un responsable de décontamination par ID
router.get('/:id', async (req, res) => {
  try {
    const responsable = await ResponsableDecontamination.findByPk(req.params.id);
    if (!responsable) {
      return res.status(404).json({ error: 'Responsable de décontamination not found' });
    }
    res.json(responsable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un responsable de décontamination par ID
router.put('/:id', async (req, res) => {
  try {
    const responsable = await ResponsableDecontamination.findByPk(req.params.id);
    if (!responsable) {
      return res.status(404).json({ error: 'Responsable de décontamination not found' });
    }
    await responsable.update(req.body);
    res.json(responsable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer un responsable de décontamination par ID
router.delete('/:id', async (req, res) => {
  try {
    const responsable = await ResponsableDecontamination.findByPk(req.params.id);
    if (!responsable) {
      return res.status(404).json({ error: 'Responsable de décontamination not found' });
    }
    await responsable.destroy();
    res.status(204).json({ message: 'Responsable de décontamination deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
