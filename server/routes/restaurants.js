const express = require('express');
const router = express.Router();
const {
  getVilles,
  getAllRestaurants,
  getRestaurantsByVille,
  getRestaurantById,
  searchRestaurants,
  getRecommendations
} = require('../controllers/restaurantController');

// Routes générales
router.get('/villes', getVilles);
router.get('/', getAllRestaurants);

// Routes par ville
router.get('/:ville', getRestaurantsByVille);
router.get('/:ville/search', searchRestaurants);
router.get('/:ville/recommendations', getRecommendations);
router.get('/:ville/:id', getRestaurantById);

module.exports = router;
