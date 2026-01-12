require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connexion à MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/auth', require('./routes/auth'));

// Route de test
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ API FOODIUG fonctionne correctement!',
    timestamp: new Date()
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`   Serveur FOODIUG démarré avec succès`);
  console.log(`   Port: ${PORT}`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Environnement: ${process.env.NODE_ENV}`);
  console.log('========================================\n');
});
