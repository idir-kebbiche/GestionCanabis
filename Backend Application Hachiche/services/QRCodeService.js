const { DataTypes } = require('sequelize');
const QRCode = require('qrcode');
const fs = require('fs');
const Plantule = require('../models/Plantule');
const QRCodeModel = require('../models/QRCode'); // Importer le modèle QRCode

class QRCodeService {
  async generateQRCodeForPlantule(plantuleId) {
    try {
      // Récupérer les informations de la plantule depuis la base de données
      const plantule = await Plantule.findByPk(plantuleId);
      if (!plantule) {
        throw new Error('Plantule not found');
      }

      // Générer le contenu du code QR
      const content = `https://example.com/plantules/${plantule.id}`;

      // Générer le code QR et le sauvegarder dans un fichier temporaire
      const filePath = `temp_qr_code_${plantuleId}.png`;
      await QRCode.toFile(filePath, content);

      // Lire les données binaires du fichier temporaire
      const qrCodeData = fs.readFileSync(filePath);

      // Stocker les données binaires dans la base de données en utilisant Sequelize
      await QRCodeModel.create({ plantule_id: plantuleId, qr_code: qrCodeData });

      // Supprimer le fichier temporaire
      fs.unlinkSync(filePath);

      console.log(`QR code generated and stored for plantule with ID ${plantuleId}`);
    } catch (error) {
      console.error('Error generating QR code for plantule:', error);
    }
  }

  async getQRCodeForPlantule(plantuleId) {
    try {
      // Récupérer les données binaires du code QR depuis la base de données en utilisant Sequelize
      const qrCodeEntry = await QRCodeModel.findOne({ where: { plantule_id: plantuleId } });

      if (!qrCodeEntry) {
        return null; // Aucun code QR trouvé pour cette plantule
      }

      return qrCodeEntry.qr_code;
    } catch (error) {
      console.error('Error retrieving QR code for plantule:', error);
      return null;
    }
  }
}

module.exports = QRCodeService;