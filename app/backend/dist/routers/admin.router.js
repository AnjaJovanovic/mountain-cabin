"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
const adminRouter = express_1.default.Router();
adminRouter.route('/loginAdmin').post((req, res) => new admin_controller_1.AdminController().login(req, res));
adminRouter.route('/registerAdmin').post((req, res) => new admin_controller_1.AdminController().register(req, res));
adminRouter.route("/activateUser").post((req, res) => new admin_controller_1.AdminController().activation(req, res));
adminRouter.route("/blockUser").post((req, res) => new admin_controller_1.AdminController().blocking(req, res));
exports.default = adminRouter;
