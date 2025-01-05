"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const AesUtil_1 = require("./btxtiger/AesUtil");
// configures dotenv to work in your application
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.post('/api/encrypt-aes-gcm', (req, res) => {
    const { plainText, password } = req.body;
    res.json({
        message: 'Encryption successful',
        encryptedData: (0, AesUtil_1.encryptAesGcm)(plainText, password)
    });
});
app.post('/api/decrypt-aes-gcm', (req, res) => {
    const { plainText, password } = req.body;
    res.json({
        message: 'Decryption successful',
        encryptedData: (0, AesUtil_1.decryptAesGcm)(plainText, password)
    });
});
app.listen(3000, () => {
    console.log("Server running at PORT: ", 3000);
}).on("error", (error) => {
    // gracefully handle error
    throw new Error(error.message);
});
