"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const rezervacijaSchema = new mongoose_1.default.Schema({
    idRezervacije: Number,
    idVikendice: Number,
    usernameTuriste: String,
    pocetak: Date,
    kraj: Date,
    brojOdraslih: Number,
    brojDece: Number,
    cena: Number,
    napomena: String,
    obradjena: Boolean,
    accepted: Boolean,
    ownerComment: String,
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false });
exports.default = mongoose_1.default.model('RezervacijaModel', rezervacijaSchema, 'rezervacije');
