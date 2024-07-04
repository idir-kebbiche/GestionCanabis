const express = require('express');
const Entreposage = require('../models/Entreposage');

const router = express.Router();

// Créer un nouvel entreposage
router.post('/', async (req, res) => {
  try {
    const entreposage = await Entreposage.create(req.body);
    res.status(201).json(entreposage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtenir tous les entreposages
router.get('/', async (req, res) => {
  try {
    const entreposages = await Entreposage.findAll();
    res.json(entreposages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir un entreposage par ID
router.get('/:id', async (req, res) => {
  try {
    const entreposage = await Entreposage.findByPk(req.params.id);
    if (!entreposage) {
      return res.status(404).json({ error: 'Entreposage not found' });
    }
    res.json(entreposage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un entreposage par ID
router.put('/:id', async (req, res) => {
  try {
    const entreposage = await Entreposage.findByPk(req.params.id);
    if (!entreposage) {
      return res.status(404).json({ error: 'Entreposage not found' });
    }
    await entreposage.update(req.body);
    res.json(entreposage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer un entreposage par ID
router.delete('/:id', async (req, res) => {
  try {
    const entreposage = await Entreposage.findByPk(req.params.id);
    if (!entreposage) {
      return res.status(404).json({ error: 'Entreposage not found' });
    }
    await entreposage.destroy();
    res.status(204).json({ message: 'Entreposage deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
