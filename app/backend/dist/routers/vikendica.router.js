"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vikendica_controller_1 = require("../controllers/vikendica.controller");
const vikendicaRouter = express_1.default.Router();
vikendicaRouter.route("/getAll").get((req, res) => new vikendica_controller_1.VikendicaController().getAll(req, res));
vikendicaRouter.route("/delete").post((req, res) => new vikendica_controller_1.VikendicaController().delete(req, res));
vikendicaRouter.route("/update").post((req, res) => new vikendica_controller_1.VikendicaController().update(req, res));
exports.default = vikendicaRouter;
