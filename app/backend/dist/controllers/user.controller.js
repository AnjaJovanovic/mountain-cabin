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
                if (user == null || !bcrypt_1.default.compareSync(request.body.password, user.password)) {
                    response.json(null);
                    return;
                }
                if (user.isBlocked) {
                    response.json({ message: 'Blokiran' });
                    return;
                }
                if (!user.isActive) {
                    response.json({ message: 'Nalog nije aktiviran' });
                    return;
                }
                response.json(user);
            }).catch((error) => console.log(error));
        };
        this.register = (req, res) => {
            let profilePicture = '';
            if (req.file) {
                profilePicture = 'uploads/' + req.file.filename;
            }
            else {
                profilePicture = 'uploads/default.png';
            }
            let password = req.body.password;
            let creditCardNumber = req.body.creditCardNumber;
            const cardType = this.validateCreditCard(creditCardNumber || '');
            if (!this.validatePassword(password)) {
                res.json({ message: "Lozinka ne ispunjava zahteve složenosti" });
            }
            else if (cardType === "Invalid") {
                res.json({ message: "Nevažeći broj kreditne kartice" });
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
                        res.json({ message: "Korisničko ime ili e-mail već postoji" });
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
                            creditCardNumber: creditCardNumber,
                            profilePicture: profilePicture
                        };
                        new user_model_1.default(user).save().then(ok => {
                            res.json({ message: "ok" });
                        }).catch(err => {
                            console.log(err);
                            res.json({ message: "Greška pri registraciji" });
                        });
                    }
                }).catch(err => {
                    console.log(err);
                    res.json({ message: "Greška pri registraciji" });
                });
            }
        };
        this.changePassword = (req, res) => {
            const username = req.body.username;
            const oldPassword = req.body.oldPassword;
            const newPassword = req.body.newPassword;
            const confirmNewPassword = req.body.confirmNewPassword;
            if (!username || !oldPassword || !newPassword || !confirmNewPassword) {
                res.json({ message: 'Nepotpuni podaci' });
                return;
            }
            if (newPassword !== confirmNewPassword) {
                res.json({ message: 'Nova lozinka i potvrda se ne poklapaju' });
                return;
            }
            if (oldPassword === newPassword) {
                res.json({ message: 'Stara i nova lozinka ne smeju biti iste' });
                return;
            }
            if (!this.validatePassword(newPassword)) {
                res.json({ message: 'Nova lozinka nije u ispravnom formatu' });
                return;
            }
            user_model_1.default.findOne({ username: username }).then(user => {
                if (!user) {
                    res.json({ message: 'Korisnik nije pronađen' });
                    return;
                }
                if (!bcrypt_1.default.compareSync(oldPassword, user.password)) {
                    res.json({ message: 'Stara lozinka nije ispravna' });
                    return;
                }
                const saltRounds = 10;
                const hashed = bcrypt_1.default.hashSync(newPassword, saltRounds);
                user_model_1.default.updateOne({ username }, { $set: { password: hashed } })
                    .then(() => res.json({ message: 'Lozinka uspešno promenjena' }))
                    .catch(err => {
                    console.log(err);
                    res.json({ message: 'Greška pri promeni lozinke' });
                });
            }).catch(err => {
                console.log(err);
                res.json({ message: 'Greška' });
            });
        };
        this.updateFirstname = (req, res) => {
            user_model_2.default.updateOne({ username: req.body.username }, { $set: { firstname: req.body.firstname } }).then(currUser => {
                res.json({ message: "Korisnik ažuriran" });
            }).catch((err) => {
                console.log(err);
                res.json({ message: "Greška" });
            });
        };
        this.updateLastname = (req, res) => {
            user_model_2.default.updateOne({ username: req.body.username }, { $set: { lastname: req.body.lastname } }).then(currUser => {
                res.json({ message: "Korisnik ažuriran" });
            }).catch((err) => {
                console.log(err);
                res.json({ message: "Greška" });
            });
        };
        this.updateAddress = (req, res) => {
            user_model_2.default.updateOne({ username: req.body.username }, { $set: { address: req.body.address } }).then(currUser => {
                res.json({ message: "Korisnik ažuriran" });
            }).catch((err) => {
                console.log(err);
                res.json({ message: "Greška" });
            });
        };
        this.updateEmail = (req, res) => {
            user_model_2.default.updateOne({ username: req.body.username }, { $set: { email: req.body.email } }).then(currUser => {
                res.json({ message: "Korisnik ažuriran" });
            }).catch((err) => {
                console.log(err);
                res.json({ message: "Greška" });
            });
        };
        this.updatePhone = (req, res) => {
            user_model_2.default.updateOne({ username: req.body.username }, { $set: { phone: req.body.phone } }).then(currUser => {
                res.json({ message: "Korisnik ažuriran" });
            }).catch((err) => {
                console.log(err);
                res.json({ message: "Greška" });
            });
        };
        this.updateCreditCard = (req, res) => {
            const creditCardNumber = req.body.creditCardNumber || '';
            const cardType = this.validateCreditCard(creditCardNumber);
            if (cardType === "Invalid") {
                res.json({ message: "Nevažeći broj kreditne kartice" });
                return;
            }
            user_model_2.default.updateOne({ username: req.body.username }, { $set: { creditCardNumber: req.body.creditCardNumber } }).then(currUser => {
                res.json({ message: "Korisnik ažuriran" });
            }).catch((err) => {
                console.log(err);
                res.json({ message: "Greška" });
            });
        };
        this.getAll = (req, res) => {
            user_model_1.default.find({}).sort({ Ime: 1 }).then(users => {
                res.json(users);
            }).catch((err) => {
                console.log(err);
            });
        };
        this.updateProfilePicture = (req, res) => {
            const username = req.body.username;
            if (!username) {
                res.json({ message: 'Korisničko ime nije uneto' });
                return;
            }
            if (!req.file) {
                res.json({ message: 'Fajl nije učitan' });
                return;
            }
            const newPicture = 'uploads/' + req.file.filename;
            user_model_1.default.updateOne({ username }, { $set: { profilePicture: newPicture } })
                .then(() => {
                res.json({ message: 'Profilna slika ažurirana', path: newPicture });
            })
                .catch(err => {
                console.log(err);
                res.json({ message: 'Greška pri ažuriranju slike' });
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
        //const passwordRegex = /^A/
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
