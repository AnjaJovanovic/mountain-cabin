"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const userRouter = express_1.default.Router();
userRouter.route('/login').post((req, res) => new user_controller_1.UserController().login(req, res));
userRouter.route("/register").post((request, response) => new user_controller_1.UserController().register(request, response));
userRouter.route("/updateFirstname").post((request, response) => new user_controller_1.UserController().updateFirstname(request, response));
userRouter.route("/updateLastname").post((request, response) => new user_controller_1.UserController().updateLastname(request, response));
exports.default = userRouter;
