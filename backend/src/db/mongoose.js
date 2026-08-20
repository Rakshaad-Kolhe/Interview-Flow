"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMongoStatus = exports.connectMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectMongoDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://root:example@localhost:27017/interviewflow?authSource=admin';
    try {
        await mongoose_1.default.connect(uri);
        console.log('Connected to MongoDB');
    }
    catch (error) {
        console.error('Failed to connect to MongoDB:', error);
    }
};
exports.connectMongoDB = connectMongoDB;
const getMongoStatus = () => {
    return mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
};
exports.getMongoStatus = getMongoStatus;
//# sourceMappingURL=mongoose.js.map