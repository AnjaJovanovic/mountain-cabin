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
// Funkcija za proveru preklapanja datuma sa tačnim vremenom
// Proverava da li se bilo koji trenutak preklapa između dve rezervacije
// VAŽNO: Ako jedna rezervacija završava u 10:00 i druga počinje u 14:00 istog dana,
// to NIJE preklapanje jer vikendica može da se oslobodi i ponovo rezerviše istog dana
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
    // Koristimo tačno vreme (sa satima i minutima), ne samo dan
    // Dva perioda se preklapaju ako postoji bilo koji zajednički trenutak između njih
    // Pravilna logika: preklapanje postoji ako aStart < bEnd && bStart < aEnd
    // Ovo znači: prva rezervacija počinje pre nego što se druga završi,
    // I druga rezervacija počinje pre nego što se prva završi
    // VAŽNO: Koristimo striktno < (ne <=) jer:
    // - Ako rezervacija završava u 10:00 i druga počinje u 14:00 istog dana, to NIJE preklapanje
    //   (vikendica se oslobađa u 10:00 i može ponovo da se rezerviše u 14:00)
    // - Ako se rezervacije dodiruju tačno (aEnd === bStart), to takođe NIJE preklapanje
    //   jer se smatra da vikendica može biti oslobođena i ponovo rezervisana u istom trenutku
    // Primeri:
    // - Rez 1: 5. jan 10:00 - 10. jan 10:00
    // - Rez 2: 10. jan 14:00 - 15. jan 10:00
    //   => NEMA preklapanja (10. jan 10:00 < 10. jan 14:00, ali 10. jan 14:00 < 10. jan 10:00 je false)
    // - Rez 1: 5. jan 10:00 - 10. jan 10:00
    // - Rez 2: 9. jan 14:00 - 15. jan 10:00
    //   => IMA preklapanja (9. jan 14:00 < 10. jan 10:00 je false, ali 5. jan 10:00 < 15. jan 10:00 je true...)
    //   WAIT, provera: aStart (5. jan 10:00) < bEnd (15. jan 10:00) = true
    //                  bStart (9. jan 14:00) < aEnd (10. jan 10:00) = true (9. jan 14:00 je pre 10. jan 10:00)
    //   => IMA preklapanja ✓
    const overlaps = aStart < bEnd && bStart < aEnd;
    return overlaps;
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
                // Provera preklapanja - proveravamo SVE rezervacije (i obrađene i neobrađene)
                // Čak i neobrađena rezervacija zauzima vikendicu u tom periodu
                const idVikendiceNum = Number(idVikendice);
                const allExisting = yield rezervacija_model_1.default.find({ idVikendice: idVikendiceNum });
                let hasOverlap = false;
                let overlapDetails = [];
                for (const r of allExisting) {
                    let rStart;
                    let rEnd;
                    if (r.pocetak instanceof Date) {
                        rStart = new Date(r.pocetak);
                    }
                    else if (typeof r.pocetak === 'string') {
                        rStart = new Date(r.pocetak);
                    }
                    else {
                        rStart = new Date(r.pocetak);
                    }
                    if (r.kraj instanceof Date) {
                        rEnd = new Date(r.kraj);
                    }
                    else if (typeof r.kraj === 'string') {
                        rEnd = new Date(r.kraj);
                    }
                    else {
                        rEnd = new Date(r.kraj);
                    }
                    if (isNaN(rStart.getTime()) || isNaN(rEnd.getTime())) {
                        continue;
                    }
                    const overlaps = rangesOverlap(start, end, rStart, rEnd);
                    if (overlaps) {
                        hasOverlap = true;
                        overlapDetails.push({
                            idRezervacije: r.idRezervacije,
                            pocetak: rStart,
                            kraj: rEnd,
                            obradjena: r.obradjena,
                            accepted: r.accepted
                        });
                    }
                }
                if (hasOverlap) {
                    res.status(409).json({
                        message: `Vikendica je već zauzeta u izabranom periodu. Preklapanje sa rezervacijom/a: ${overlapDetails.map(o => `#${o.idRezervacije}`).join(', ')}`
                    });
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
        this.addTouristReview = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idRezervacije = Number(req.body.idRezervacije);
                const touristComment = req.body.touristComment ? String(req.body.touristComment).trim() : '';
                const touristRating = Number(req.body.touristRating);
                if (!idRezervacije) {
                    res.status(400).json({ message: 'idRezervacije je obavezno polje' });
                    return;
                }
                if (touristRating < 1 || touristRating > 5 || isNaN(touristRating)) {
                    res.status(400).json({ message: 'Ocena mora biti između 1 i 5' });
                    return;
                }
                // Proveri da li rezervacija postoji i da li je završena
                const rez = yield rezervacija_model_1.default.findOne({ idRezervacije });
                if (!rez) {
                    res.status(404).json({ message: 'Rezervacija nije pronađena' });
                    return;
                }
                // Proveri da li je rezervacija završena (kraj < sada)
                const kraj = new Date(rez.kraj);
                const now = new Date();
                if (kraj > now) {
                    res.status(400).json({ message: 'Možete ostaviti ocenu i komentar samo za završene rezervacije' });
                    return;
                }
                yield rezervacija_model_1.default.updateOne({ idRezervacije }, { $set: { touristComment, touristRating } });
                res.json({ message: 'Ocena i komentar su uspešno sačuvani' });
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ message: 'Greška pri čuvanju ocene i komentara' });
            }
        });
        this.getStatistics = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const now = new Date();
                const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                // Brojimo samo prihvaćene rezervacije
                const count24h = yield rezervacija_model_1.default.countDocuments({
                    createdAt: { $gte: last24h },
                    accepted: true,
                    obradjena: true
                });
                const count7days = yield rezervacija_model_1.default.countDocuments({
                    createdAt: { $gte: last7days },
                    accepted: true,
                    obradjena: true
                });
                const count30days = yield rezervacija_model_1.default.countDocuments({
                    createdAt: { $gte: last30days },
                    accepted: true,
                    obradjena: true
                });
                res.json({
                    last24h: count24h,
                    last7days: count7days,
                    last30days: count30days
                });
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ message: 'Greška pri učitavanju statistike' });
            }
        });
        this.cancel = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idRezervacije = Number(req.body.idRezervacije);
                if (!idRezervacije) {
                    res.status(400).json({ message: 'idRezervacije je obavezno polje' });
                    return;
                }
                const rez = yield rezervacija_model_1.default.findOne({ idRezervacije });
                if (!rez) {
                    res.status(404).json({ message: 'Rezervacija nije pronađena' });
                    return;
                }
                // Proveri da li je rezervacija prihvaćena
                if (rez.accepted !== true || rez.obradjena !== true) {
                    res.status(400).json({ message: 'Možete otkazati samo prihvaćene rezervacije' });
                    return;
                }
                // Proveri da li je više od 1 dana do početka
                const pocetak = new Date(rez.pocetak);
                const now = new Date();
                const diffTime = pocetak.getTime() - now.getTime();
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                if (diffDays <= 1) {
                    res.status(400).json({ message: 'Rezervaciju možete otkazati samo ako je više od 1 dana do početka' });
                    return;
                }
                // Obriši rezervaciju
                yield rezervacija_model_1.default.deleteOne({ idRezervacije });
                res.json({ message: 'Rezervacija je uspešno otkazana' });
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ message: 'Greška pri otkazivanju rezervacije' });
            }
        });
        this.byOwner = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const username = String(req.params.username);
                const vik = yield vikendica_model_1.default.find({ ownerUsername: username }, { idVikendice: 1, ownerUsername: 1, _id: 0 });
                const ids = vik.map(v => v.idVikendice);
                if (ids.length === 0) {
                    res.json([]);
                    return;
                }
                const list = yield rezervacija_model_1.default.find({ idVikendice: { $in: ids } }).sort({ createdAt: -1 });
                const formatted = list.map(r => {
                    const obradjena = r.obradjena === true ? true : false;
                    const accepted = r.accepted === true ? true : false;
                    return {
                        idRezervacije: r.idRezervacije,
                        idVikendice: r.idVikendice,
                        usernameTuriste: r.usernameTuriste,
                        pocetak: r.pocetak,
                        kraj: r.kraj,
                        brojOdraslih: r.brojOdraslih || 0,
                        brojDece: r.brojDece || 0,
                        cena: r.cena || 0,
                        napomena: r.napomena || '',
                        obradjena: obradjena,
                        accepted: accepted,
                        ownerComment: r.ownerComment || '',
                        createdAt: r.createdAt || new Date()
                    };
                });
                res.json(formatted);
            }
            catch (err) {
                console.log('Greška u byOwner:', err);
                res.status(500).json({ message: 'Greška pri učitavanju rezervacija' });
            }
        });
    }
}
exports.RezervacijaController = RezervacijaController;
