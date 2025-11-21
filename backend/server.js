const express = require('express');
const cors = require('cors');
require('dotenv').config();

const leadsRoutes = require('./routes/leads');
const clientsRoutes = require('./routes/clients');
const activitiesRoutes = require('./routes/activities');
const workflowsRoutes = require('./routes/workflows');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/leads', leadsRoutes);
app.use('/clients', clientsRoutes);
app.use('/activities', activitiesRoutes);
app.use('/workflows', workflowsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Lead-Client CRM API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
