"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const sites_routes_1 = __importDefault(require("./sites/sites.routes"));
const prisma_1 = require("./lib/prisma");
const sanitizeInput_1 = require("./middleware/sanitizeInput");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(sanitizeInput_1.sanitizeInput);
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/sites', sites_routes_1.default);
// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/buildspace';
mongoose_1.default.connect(mongoUri)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch((err) => console.error('MongoDB connection error:', err));
// Health check route
app.get('/health', async (req, res) => {
    try {
        // Check Prisma connection
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        // Check Mongoose connection
        const mongoStatus = mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
        res.status(200).json({
            status: 'ok',
            postgres: 'connected',
            mongodb: mongoStatus
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: String(error)
        });
    }
});
app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
