const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  position: Number,
  title: String,
  address: String,
  latitude: Number,
  longitude: Number,
  rating: Number,
  ratingCount: Number,
  priceLevel: [String],
  type: [String],
  enfant: Boolean,
  halal: String,
  Vegetarien: Boolean,
  category: [String],
  ambiance: [String],
  phoneNumber: String,
  cid: String
}, {
  strict: false,
  collection: 'Rabat' // Par défaut, on peut le changer dynamiquement
});

// Fonction pour obtenir un modèle pour une ville spécifique
const getRestaurantModel = (ville) => {
  return mongoose.model('Restaurant', restaurantSchema, ville);
};

module.exports = { getRestaurantModel, restaurantSchema };
