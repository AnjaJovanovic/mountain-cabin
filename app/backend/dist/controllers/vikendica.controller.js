"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VikendicaController = void 0;
const vikendica_model_1 = __importDefault(require("../models/vikendica.model"));
class VikendicaController {
    constructor() {
        this.getAll = (req, res) => {
            vikendica_model_1.default.find({}).sort({ idVikendice: 1 }).then(vikendice => {
                res.json(vikendice);
            }).catch((err) => {
                console.log(err);
            });
        };
        this.delete = (req, res) => {
            vikendica_model_1.default.deleteOne({ idVikendice: req.body.idVikendice }).then(vikendice => {
                res.json({ message: "Vikendica obrisana" });
            }).catch((err) => {
                console.log(err);
                res.json({ message: "Fail" });
            });
        };
        this.update = (req, res) => {
            const updateData = {};
            // prolazimo kroz sva polja iz requesta
            for (const key in req.body) {
                // ako polje nije prazno (undefined, null, ili prazan string) — dodaj u update objekat
                if (req.body[key] !== undefined && req.body[key] !== null && req.body[key] !== "") {
                    updateData[key] = req.body[key];
                }
            }
            // ažuriramo samo ta polja
            vikendica_model_1.default.updateOne({ idVikendice: req.body.idVikendice }, { $set: updateData })
                .then(result => {
                if (result.modifiedCount > 0)
                    res.json({ message: "Vikendica uspešno ažurirana." });
                else
                    res.json({ message: "Nema promena ili vikendica nije pronađena." });
            })
                .catch(err => {
                console.log(err);
                res.status(500).json({ message: "Greška pri ažuriranju." });
            });
        };
    }
}
exports.VikendicaController = VikendicaController;
