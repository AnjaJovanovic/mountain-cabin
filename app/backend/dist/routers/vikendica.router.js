"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vikendica_controller_1 = require("../controllers/vikendica.controller");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const vikendicaRouter = express_1.default.Router();
// Multer konfiguracija (isti obrazac kao kod usera)
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir))
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path_1.default.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    if (allowed.test(file.mimetype))
        cb(null, true);
    else
        cb(new Error('Dozvoljene su samo JPG/PNG slike!'));
};
const upload = (0, multer_1.default)({ storage, fileFilter });
vikendicaRouter.route("/getAll").get((req, res) => new vikendica_controller_1.VikendicaController().getAll(req, res));
vikendicaRouter.route("/byOwner/:username").get((req, res) => new vikendica_controller_1.VikendicaController().getByOwner(req, res));
vikendicaRouter.route("/delete").post((req, res) => new vikendica_controller_1.VikendicaController().delete(req, res));
vikendicaRouter.route("/update").post((req, res) => new vikendica_controller_1.VikendicaController().update(req, res));
vikendicaRouter.route("/create").post((req, res) => new vikendica_controller_1.VikendicaController().create(req, res));
vikendicaRouter.post("/uploadImages", upload.array('images', 10), (req, res) => new vikendica_controller_1.VikendicaController().uploadImages(req, res));
vikendicaRouter.route("/block").post((req, res) => new vikendica_controller_1.VikendicaController().blockVikendica(req, res));
exports.default = vikendicaRouter;
