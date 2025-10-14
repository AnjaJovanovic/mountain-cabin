"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../models/user.model"));
const user_model_2 = __importDefault(require("../models/user.model"));
class UserController {
    constructor() {
        // Check user registration------------
        //------------------------------------
        this.login = (request, response) => {
            user_model_1.default.findOne({
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
            let password = req.body.password;
            let creditCardNumber = req.body.creditCardNumber;
            const cardType = this.validateCreditCard(creditCardNumber || '');
            if (!this.validatePassword(password)) {
                res.json({ message: "Password does not meet complexity requirements" });
            }
            else if (cardType === "Invalid") {
                res.json({ message: "Invalid credit card number" });
            }
            else {
                const saltRounds = 10;
                const hashedPassword = bcrypt_1.default.hashSync(password, saltRounds);
                let username = req.body.username;
                let userType = req.body.userType;
                let firstname = req.body.firstname;
                let lastname = req.body.lastname;
                let gender = req.body.gender;
                let address = req.body.address;
                let phone = req.body.phone;
                let email = req.body.email;
                this.userAlredyExists(username, email).then(existingUser => {
                    if (existingUser) {
                        res.json({ message: "Username or email already exists" });
                    }
                    else {
                        let user = {
                            username: username,
                            password: hashedPassword,
                            userType: userType,
                            firstname: firstname,
                            lastname: lastname,
                            gender: gender,
                            address: address,
                            phone: phone,
                            email: email,
                            creditCardNumber: creditCardNumber
                        };
                        new user_model_1.default(user).save().then(ok => {
                            res.json({ message: "ok" });
                        }).catch(err => {
                            console.log(err);
                            res.json({ message: "fail register" });
                        });
                    }
                }).catch(err => {
                    console.log(err);
                    res.json({ message: "fail register" });
                });
            }
        };
        this.updateFirstname = (req, res) => {
            user_model_2.default.updateOne({ username: req.body.username }, { $set: { firstname: req.body.firstname } }).then(currUser => {
                res.json({ message: "User updated" });
            }).catch((err) => {
                console.log(err);
                res.json({ message: "Fail" });
            });
        };
        this.updateLastname = (req, res) => {
            user_model_2.default.updateOne({ username: req.body.username }, { $set: { lastname: req.body.lastname } }).then(currUser => {
                res.json({ message: "User updated" });
            }).catch((err) => {
                console.log(err);
                res.json({ message: "Fail" });
            });
        };
        this.updateAddress = (req, res) => {
            user_model_2.default.updateOne({ username: req.body.username }, { $set: { address: req.body.address } }).then(currUser => {
                res.json({ message: "User updated" });
            }).catch((err) => {
                console.log(err);
                res.json({ message: "Fail" });
            });
        };
        this.updateEmail = (req, res) => {
            user_model_2.default.updateOne({ username: req.body.username }, { $set: { email: req.body.email } }).then(currUser => {
                res.json({ message: "User updated" });
            }).catch((err) => {
                console.log(err);
                res.json({ message: "Fail" });
            });
        };
        this.updatePhone = (req, res) => {
            user_model_2.default.updateOne({ username: req.body.username }, { $set: { phone: req.body.phone } }).then(currUser => {
                res.json({ message: "User updated" });
            }).catch((err) => {
                console.log(err);
                res.json({ message: "Fail" });
            });
        };
        this.updateCreditCard = (req, res) => {
            console.log(req.body.username + " " + req.body.creditCardNumber);
            user_model_2.default.updateOne({ username: req.body.username }, { $set: { creditCardNumber: req.body.creditCardNumber } }).then(currUser => {
                res.json({ message: "User updated" });
            }).catch((err) => {
                console.log(err);
                res.json({ message: "Fail" });
            });
        };
    }
    userAlredyExists(username, email) {
        return user_model_1.default.findOne({
            $or: [{ username: username }, { email: email }]
        });
    }
    validatePassword(password) {
        const passwordRegex = /^(?=[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z].*[a-z].*[a-z]).{6,10}$/;
        return passwordRegex.test(password);
    }
    validateCreditCard(cardNumber) {
        const cleaned = cardNumber.replace(/\D/g, '');
        const dinersRegex = /^(300|301|302|303|36|38)\d{12}$/;
        const masterRegex = /^(51|52|53|54|55)\d{14}$/;
        const visaRegex = /^(4539|4556|4916|4532|4929|4485|4716)\d{12}$/;
        if (dinersRegex.test(cleaned))
            return "Diners";
        if (masterRegex.test(cleaned))
            return "MasterCard";
        if (visaRegex.test(cleaned))
            return "Visa";
        return "Invalid";
    }
}
exports.UserController = UserController;
