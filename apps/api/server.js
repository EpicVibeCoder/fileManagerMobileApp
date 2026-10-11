require('dotenv').config();
const validateEnv = require('./src/config/validateEnv');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const healthRoutes = require('./src/routes/health');
const notFoundRoutes = require('./src/routes/notFound');
const passport = require('./src/config/passport');
const authRoutes = require('./src/routes/auth');
const fileRoutes = require('./src/routes/files');
const folderRoutes = require('./src/routes/folders');
const favoriteRoutes = require('./src/routes/favorites');
const dashboardRoutes = require('./src/routes/dashboard');
const vaultRoutes = require('./src/routes/vault');
const calendarRoutes = require('./src/routes/calendar');

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
connectDB();
// Validate required environment variables
validateEnv();

// Ensure local uploads dir exists and is writable (Docker often leaves it root-owned)
const fs = require('fs');
const path = require('path');
const uploadsRoot = path.join(__dirname, 'uploads');
try {
  fs.mkdirSync(uploadsRoot, { recursive: true });
  fs.accessSync(uploadsRoot, fs.constants.W_OK);
} catch (err) {
  console.error(
    `Uploads directory is not writable (${uploadsRoot}): ${err.message}. ` +
      'Fix ownership, e.g. docker run --rm -v "$PWD/uploads:/uploads" alpine chown -R $(id -u):$(id -g) /uploads',
  );
  process.exit(1);
}
// Security middleware
app.use(helmet());

// CORS configuration
app.use(
      cors({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true,
      }),
);

app.use(passport.initialize());

// Rate limiting
const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(healthRoutes);
app.use(notFoundRoutes);
app.use(authRoutes);
app.use(fileRoutes);
app.use(folderRoutes);
app.use(favoriteRoutes);
app.use(dashboardRoutes);
app.use(vaultRoutes);
app.use(calendarRoutes);

// 404 handler
app.use((req, res) => {
      const sendResponse = require('./src/utils/response');
      sendResponse(res, 404, false, 'Route not found', null, { path: req.originalUrl });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
