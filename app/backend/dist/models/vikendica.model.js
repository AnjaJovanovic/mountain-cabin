"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const vikendicaSchema = new mongoose_1.default.Schema({
    idVikendice: Number,
    naziv: String,
    mesto: String,
    telefon: String,
    cenaNocenjaLetnja: Number,
    cenaNocenjaZimska: Number,
    galerijaSlika: [String],
    zauzeta: Boolean,
    usluge: String,
    datumRezervacije: Date,
    ownerUsername: String,
    lat: Number,
    lng: Number
}, {
    versionKey: false
});
exports.default = mongoose_1.default.model('VikendicaModel', vikendicaSchema, 'vikendice');
