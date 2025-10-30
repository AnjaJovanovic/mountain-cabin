"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const all = yield vikendica_model_1.default.find({}).sort({ idVikendice: -1 }).limit(1);
                const nextId = all.length ? all[0].idVikendice + 1 : 1;
                const doc = new vikendica_model_1.default({
                    idVikendice: nextId,
                    naziv: req.body.naziv,
                    mesto: req.body.mesto,
                    telefon: req.body.telefon,
                    cenaNocenjaLetnja: req.body.cenaNocenjaLetnja,
                    cenaNocenjaZimska: req.body.cenaNocenjaZimska,
                    galerijaSlika: Array.isArray(req.body.galerijaSlika) ? req.body.galerijaSlika : [],
                    zauzeta: false,
                    usluge: req.body.usluge,
                    lat: req.body.lat,
                    lng: req.body.lng
                });
                yield doc.save();
                res.json({ message: "Vikendica kreirana", idVikendice: nextId });
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ message: "Greška pri kreiranju" });
            }
        });
        this.uploadImages = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idVikendice = Number(req.body.idVikendice);
                if (!idVikendice) {
                    res.status(400).json({ message: 'Nedostaje idVikendice' });
                    return;
                }
                const files = req.files;
                if (!files || files.length === 0) {
                    res.status(400).json({ message: 'Nema fajlova' });
                    return;
                }
                const paths = files.map(f => 'uploads/' + f.filename);
                yield vikendica_model_1.default.updateOne({ idVikendice }, { $push: { galerijaSlika: { $each: paths } } });
                res.json({ message: 'Slike dodate', paths });
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ message: 'Greška pri uploadu slika' });
            }
        });
    }
}
exports.VikendicaController = VikendicaController;
