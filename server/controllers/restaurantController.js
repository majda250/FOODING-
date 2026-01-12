const mongoose = require('mongoose');
const { restaurantSchema } = require('../models/Restaurant');

// Liste des villes disponibles
const VILLES_DISPONIBLES = ['Rabat', 'Tanger'];

// @desc    Obtenir les villes disponibles
// @route   GET /api/restaurants/villes
exports.getVilles = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: VILLES_DISPONIBLES
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des villes',
      error: error.message
    });
  }
};

// @desc    Récupérer tous les restaurants d'une ville
// @route   GET /api/restaurants/:ville
exports.getRestaurantsByVille = async (req, res) => {
  try {
    const { ville } = req.params;
    
    // Vérifier si la ville existe
    if (!VILLES_DISPONIBLES.includes(ville)) {
      return res.status(404).json({
        success: false,
        message: `La ville ${ville} n'est pas disponible`
      });
    }
    
    // Créer le modèle pour cette ville
    const RestaurantModel = mongoose.model('Restaurant', restaurantSchema, ville);
    
    const restaurants = await RestaurantModel.find();
    
    res.status(200).json({
      success: true,
      ville: ville,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des restaurants',
      error: error.message
    });
  }
};

// @desc    Récupérer un restaurant par ID
// @route   GET /api/restaurants/:ville/:id
exports.getRestaurantById = async (req, res) => {
  try {
    const { ville, id } = req.params;
    
    if (!VILLES_DISPONIBLES.includes(ville)) {
      return res.status(404).json({
        success: false,
        message: `La ville ${ville} n'est pas disponible`
      });
    }
    
    const RestaurantModel = mongoose.model('Restaurant', restaurantSchema, ville);
    const restaurant = await RestaurantModel.findById(id);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du restaurant',
      error: error.message
    });
  }
};

// @desc    Rechercher des restaurants avec filtres
// @route   GET /api/restaurants/:ville/search
exports.searchRestaurants = async (req, res) => {
  try {
    const { ville } = req.params;
    const {
      type,
      priceLevel,
      rating,
      category,
      halal,
      vegetarien,
      enfant,
      ambiance
    } = req.query;
   
    if (!VILLES_DISPONIBLES.includes(ville)) {
      return res.status(404).json({
        success: false,
        message: `La ville ${ville} n'est pas disponible`
      });
    }
   
    const RestaurantModel = mongoose.model('Restaurant', restaurantSchema, ville);
    let query = {};
   
    // Filtre par type de repas (multiple)
    if (type) {
      const types = Array.isArray(type) ? type : [type];
      if (types.length > 0) {
        query.type = { $in: types.map(t => new RegExp(t, 'i')) };
      }
    }
   
    // Filtre par niveau de prix (multiple)
    if (priceLevel) {
      const prices = Array.isArray(priceLevel) ? priceLevel : [priceLevel];
      if (prices.length > 0) {
        const priceRegexes = prices.map(p => new RegExp(p.replace(/\$/g, '\\$'), 'i'));
        query.$or = priceRegexes.map(regex => ({
          priceLevel: { $elemMatch: { $regex: regex } }
        }));
      }
    }
   
    // Filtre par rating (multiple - prendre le minimum)
    if (rating) {
      const ratings = Array.isArray(rating) ? rating : [rating];
      if (ratings.length > 0) {
        const minRating = Math.min(...ratings.map(r => parseFloat(r)));
        query.rating = { $gte: minRating };
      }
    }
   
    // Filtre par catégorie (multiple)
    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      if (categories.length > 0) {
        query.category = { $in: categories.map(c => new RegExp(c, 'i')) };
      }
    }
   
    // Filtre halal
    if (halal === 'true' || halal === 'Oui') {
      query.halal = 'Oui';
    }
   
    // Filtre végétarien
    if (vegetarien === 'true') {
      query.Vegetarien = true;
    }
   
    // Filtre enfants
    if (enfant === 'true') {
      query.enfant = true;
    }
   
    // Filtre ambiance (multiple)
    if (ambiance) {
      const ambiances = Array.isArray(ambiance) ? ambiance : [ambiance];
      if (ambiances.length > 0) {
        query.ambiance = { $in: ambiances.map(a => new RegExp(a, 'i')) };
      }
    }
   
    const restaurants = await RestaurantModel.find(query);
   
    res.status(200).json({
      success: true,
      ville: ville,
      count: restaurants.length,
      filters: req.query,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche',
      error: error.message
    });
  }
};

// @desc    Obtenir des recommandations personnalisées
// @route   GET /api/restaurants/:ville/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const { ville } = req.params;
    
    if (!VILLES_DISPONIBLES.includes(ville)) {
      return res.status(404).json({
        success: false,
        message: `La ville ${ville} n'est pas disponible`
      });
    }
    
    const RestaurantModel = mongoose.model('Restaurant', restaurantSchema, ville);
    
    // Recommandations basées sur le rating
    const restaurants = await RestaurantModel.aggregate([
      { $match: { rating: { $gte: 4.0 } } },
      { $sample: { size: 4 } }
    ]);
    
    res.status(200).json({
      success: true,
      ville: ville,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des recommandations',
      error: error.message
    });
  }
};

// @desc    Obtenir tous les restaurants de toutes les villes
// @route   GET /api/restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    let allRestaurants = [];
    
    for (const ville of VILLES_DISPONIBLES) {
      const RestaurantModel = mongoose.model('Restaurant', restaurantSchema, ville);
      const restaurants = await RestaurantModel.find();
      
      // Ajouter la ville à chaque restaurant
      const restaurantsWithCity = restaurants.map(r => ({
        ...r.toObject(),
        ville: ville
      }));
      
      allRestaurants = [...allRestaurants, ...restaurantsWithCity];
    }
    
    res.status(200).json({
      success: true,
      count: allRestaurants.length,
      data: allRestaurants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des restaurants',
      error: error.message
    });
  }
};
