"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
class AdminController {
    constructor() {
        this.login = (request, response) => {
            admin_model_1.default.findOne({
                username: request.body.username,
            }).then((user) => {
                if (user != null && bcrypt_1.default.compareSync(request.body.password, user.password)) {
                    response.json(user);
                }
                else {
                    response.json(null);
                }
            }).catch((error) => console.log(error));
        };
        this.register = (req, res) => {
            const password = req.body.password;
            const saltRounds = 10;
            const hashedPassword = bcrypt_1.default.hashSync(password, saltRounds);
            const username = req.body.username;
            const admin = {
                username: username,
                password: hashedPassword
            };
            new admin_model_1.default(admin)
                .save()
                .then(() => {
                res.json({ message: 'ok' });
            })
                .catch(err => {
                console.log(err);
                res.json({ message: 'Greška pri registraciji' });
            });
        };
        this.activation = (req, res) => {
            const username = req.body.username;
            const isActive = req.body.isActive;
            user_model_1.default.updateOne({ username: username }, { $set: { isActive: isActive } }).then(() => {
                res.json({ message: 'Aktivacija korisnika ažurirana' });
            }).catch(err => {
                console.log(err);
                res.json({ message: 'Greška' });
            });
        };
        this.blocking = (req, res) => {
            const username = req.body.username;
            const isBlocked = req.body.isBlocked;
            user_model_1.default.updateOne({ username: username }, { $set: { isBlocked: isBlocked } }).then(() => {
                res.json({ message: 'Blokiranje korisnika ažurirano' });
            }).catch(err => {
                console.log(err);
                res.json({ message: 'Greška' });
            });
        };
    }
}
exports.AdminController = AdminController;
