const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Entreposage = require('./Entreposage');
const ResponsableDecontamination = require('./ResponsableDecontamination');
const Modification = require('./Modification');

const Plantule = sequelize.define('Plantule', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  identification: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  etat_sante: {
    type: DataTypes.ENUM('rouge', 'orange', 'jaune', 'vert'),
    allowNull: false,
  },
  date_arrivee: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  provenance: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  stade: {
    type: DataTypes.ENUM('Initiation', 'Microdissection', 'Magenta', 'Double magenta', 'Hydroponie'),
    allowNull: false,
  },
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  date_retrait: {
    type: DataTypes.DATE,
  },
  item_retire: {
    type: DataTypes.STRING,
  },
  note: {
    type: DataTypes.TEXT,
  },
  entreposage_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Entreposage,
      key: 'id'
    }
  },
  responsable_decontamination_id: {
    type: DataTypes.INTEGER,
    references: {
      model: ResponsableDecontamination,
      key: 'id'
    }
  }
}, {
  timestamps: false,
});

Plantule.belongsTo(Entreposage, { foreignKey: 'entreposage_id', onDelete: 'CASCADE' });
Plantule.belongsTo(ResponsableDecontamination, { foreignKey: 'responsable_decontamination_id', onDelete: 'CASCADE' });
Plantule.hasMany(Modification, { foreignKey: 'plantule_id', onDelete: 'CASCADE' });

module.exports = Plantule;
