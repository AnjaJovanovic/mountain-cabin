"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rezervacija_controller_1 = require("../controllers/rezervacija.controller");
const rezervacijaRouter = express_1.default.Router();
rezervacijaRouter.route('/create').post((req, res) => new rezervacija_controller_1.RezervacijaController().create(req, res));
rezervacijaRouter.route('/byVikendica/:idVikendice').get((req, res) => new rezervacija_controller_1.RezervacijaController().byVikendica(req, res));
rezervacijaRouter.route('/byUser/:username').get((req, res) => new rezervacija_controller_1.RezervacijaController().byUser(req, res));
rezervacijaRouter.route('/process').post((req, res) => new rezervacija_controller_1.RezervacijaController().process(req, res));
rezervacijaRouter.route('/byOwner/:username').get((req, res) => new rezervacija_controller_1.RezervacijaController().byOwner(req, res));
exports.default = rezervacijaRouter;
