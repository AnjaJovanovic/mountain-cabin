"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Kreiraj folder ako ne postoji
const uploadDir = path_1.default.join(__dirname, '../../../frontend/app/public/uploads');
if (!fs_1.default.existsSync(uploadDir))
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
// Konfiguracija za multer
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
const userRouter = express_1.default.Router();
userRouter.route('/login').post((req, res) => new user_controller_1.UserController().login(req, res));
userRouter.post("/register", upload.single("profilePicture"), (request, response) => new user_controller_1.UserController().register(request, response));
userRouter.post("/updateProfilePicture", upload.single("profilePicture"), (req, res) => new user_controller_1.UserController().updateProfilePicture(req, res));
userRouter.route("/updateFirstname").post((request, response) => new user_controller_1.UserController().updateFirstname(request, response));
userRouter.route("/updateLastname").post((request, response) => new user_controller_1.UserController().updateLastname(request, response));
userRouter.route("/updateAddress").post((request, response) => new user_controller_1.UserController().updateAddress(request, response));
userRouter.route("/updateEmail").post((request, response) => new user_controller_1.UserController().updateEmail(request, response));
userRouter.route("/updatePhone").post((request, response) => new user_controller_1.UserController().updatePhone(request, response));
userRouter.route("/updateCreditCard").post((request, response) => new user_controller_1.UserController().updateCreditCard(request, response));
userRouter.route("/getAllUsers").get((req, res) => new user_controller_1.UserController().getAll(req, res));
exports.default = userRouter;
