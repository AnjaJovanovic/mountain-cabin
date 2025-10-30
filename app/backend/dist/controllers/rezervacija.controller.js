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
exports.RezervacijaController = void 0;
const rezervacija_model_1 = __importDefault(require("../models/rezervacija.model"));
const vikendica_model_1 = __importDefault(require("../models/vikendica.model"));
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
}
function isSummerMonth(monthIndex0) {
    // May(4), Jun(5), Jul(6), Avg(7)
    return [4, 5, 6, 7].includes(monthIndex0);
}
class RezervacijaController {
    constructor() {
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { idVikendice, usernameTuriste, pocetak, kraj, brojOdraslih, brojDece, cena, napomena } = req.body;
                if (!idVikendice || !usernameTuriste || !pocetak || !kraj) {
                    res.status(400).json({ message: 'Nedostaju obavezna polja' });
                    return;
                }
                const start = new Date(pocetak);
                const end = new Date(kraj);
                if (!(start instanceof Date) || isNaN(start.getTime()) || !(end instanceof Date) || isNaN(end.getTime())) {
                    res.status(400).json({ message: 'Neispravni datumi' });
                    return;
                }
                if (start >= end) {
                    res.status(400).json({ message: 'Početak mora biti pre kraja' });
                    return;
                }
                // Check-in posle 14:00, check-out do 10:00
                if (start.getHours() < 14) {
                    res.status(400).json({ message: 'Ulazak moguć od 14:00.' });
                    return;
                }
                if (end.getHours() > 10 || (end.getHours() === 10 && (end.getMinutes() || 0) > 0)) {
                    res.status(400).json({ message: 'Izlazak do 10:00.' });
                    return;
                }
                if (napomena && String(napomena).length > 500) {
                    res.status(400).json({ message: 'Napomena do 500 karaktera' });
                    return;
                }
                // Provera preklapanja
                const existing = yield rezervacija_model_1.default.find({ idVikendice });
                const hasOverlap = existing.some(r => rangesOverlap(start, end, new Date(r.pocetak), new Date(r.kraj)));
                if (hasOverlap) {
                    res.status(409).json({ message: 'Nema slobodnog mesta u izabranom periodu.' });
                    return;
                }
                // Dodeli idRezervacije
                const last = yield rezervacija_model_1.default.find({}).sort({ idRezervacije: -1 }).limit(1);
                const nextId = last.length ? last[0].idRezervacije + 1 : 1;
                const doc = new rezervacija_model_1.default({
                    idRezervacije: nextId,
                    idVikendice: Number(idVikendice),
                    usernameTuriste: String(usernameTuriste),
                    pocetak: start,
                    kraj: end,
                    brojOdraslih: Number(brojOdraslih || 0),
                    brojDece: Number(brojDece || 0),
                    cena: Number(cena || 0),
                    napomena: napomena ? String(napomena) : '',
                    obradjena: false,
                    accepted: false,
                    ownerComment: ''
                });
                yield doc.save();
                res.json({ message: 'Rezervacija uspešno kreirana', idRezervacije: nextId });
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ message: 'Greška pri kreiranju rezervacije' });
            }
        });
        this.byVikendica = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const idVikendice = Number(req.params.idVikendice);
            const list = yield rezervacija_model_1.default.find({ idVikendice }).sort({ pocetak: 1 });
            res.json(list);
        });
        this.byUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const username = String(req.params.username);
            const list = yield rezervacija_model_1.default.find({ usernameTuriste: username }).sort({ pocetak: -1 });
            res.json(list);
        });
        this.process = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const idRezervacije = Number(req.body.idRezervacije);
            const accepted = Boolean(req.body.accepted);
            const ownerCommentRaw = req.body.ownerComment;
            const ownerComment = ownerCommentRaw ? String(ownerCommentRaw) : '';
            if (!accepted && ownerComment.trim().length === 0) {
                res.status(400).json({ message: 'Komentar je obavezan kod odbijanja.' });
                return;
            }
            yield rezervacija_model_1.default.updateOne({ idRezervacije }, { $set: { obradjena: true, accepted, ownerComment } });
            res.json({ message: 'Ažurirano' });
        });
        this.byOwner = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const username = String(req.params.username);
            const vik = yield vikendica_model_1.default.find({ ownerUsername: username }, { idVikendice: 1, _id: 0 });
            const ids = vik.map(v => v.idVikendice);
            const list = yield rezervacija_model_1.default.find({ idVikendice: { $in: ids } }).sort({ createdAt: -1 });
            res.json(list);
        });
    }
}
exports.RezervacijaController = RezervacijaController;
