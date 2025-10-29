import express from 'express'
import bcrypt from 'bcrypt'

import UserModel from '../models/user.model'
import userModel from '../models/user.model'


export class UserController{

    // Check user registration------------

    userAlredyExists(username: string, email: string) {
        return UserModel.findOne({
            $or: [{ username: username }, { email: email }]
        })
    }

    validatePassword(password: string): boolean {
        const passwordRegex = /^(?=[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z].*[a-z].*[a-z]).{6,10}$/
        //const passwordRegex = /^A/
        return passwordRegex.test(password)
    }

    validateCreditCard(cardNumber: string): string {
        const cleaned = cardNumber.replace(/\D/g, '');
        const dinersRegex = /^(300|301|302|303|36|38)\d{12}$/;
        const masterRegex = /^(51|52|53|54|55)\d{14}$/;
        const visaRegex = /^(4539|4556|4916|4532|4929|4485|4716)\d{12}$/;

        if (dinersRegex.test(cleaned)) return "Diners";
        if (masterRegex.test(cleaned)) return "MasterCard";
        if (visaRegex.test(cleaned)) return "Visa";
        return "Invalid";
    }


    //------------------------------------

    login = (request: express.Request, response: express.Response) => {
        UserModel.findOne(
            {
                username: request.body.username,
            }
        ).then(
            (user) => {
                if (user == null || !bcrypt.compareSync(request.body.password, user.password!)) {
                    response.json(null)
                    return
                }

                if (user.isBlocked) {
                    response.json({ message: 'Blokiran' })
                    return
                }

                if (!user.isActive) {
                    response.json({ message: 'Nalog nije aktiviran' })
                    return
                }

                response.json(user)
            }
        ).catch(
            (error) => console.log(error)
        )
    }

    register = (req: express.Request, res: express.Response) => {

        let profilePicture = ''
        if (req.file) {
            profilePicture = 'uploads/' + req.file.filename
        } else {
            profilePicture = 'uploads/default.png'
        }

        let password = req.body.password
        let creditCardNumber = req.body.creditCardNumber;

        const cardType = this.validateCreditCard(creditCardNumber || '')

        if (!this.validatePassword(password)) {
            res.json({ message: "Password does not meet complexity requirements" })
        } else if (cardType === "Invalid"){
            res.json({ message: "Invalid credit card number" })
        } else {

            const saltRounds = 10
            const hashedPassword = bcrypt.hashSync(password, saltRounds)

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
                    res.json({ message: "Username or email already exists" })
                } else {
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
                    }

                    new UserModel(user).save().then(ok => {
                        res.json({ message: "ok" })
                    }).catch(err => {
                        console.log(err)
                        res.json({ message: "fail register" })
                    })
                }
            }).catch(err => {
                console.log(err)
                res.json({ message: "fail register" })
            })
        }
    }

    changePassword = (req: express.Request, res: express.Response) => {
        const username: string = req.body.username
        const oldPassword: string = req.body.oldPassword
        const newPassword: string = req.body.newPassword
        const confirmNewPassword: string = req.body.confirmNewPassword

        if (!username || !oldPassword || !newPassword || !confirmNewPassword) {
            res.json({ message: 'Nepotpuni podaci' })
            return
        }

        if (newPassword !== confirmNewPassword) {
            res.json({ message: 'Nova lozinka i potvrda se ne poklapaju' })
            return
        }

        if (oldPassword === newPassword) {
            res.json({ message: 'Stara i nova lozinka ne smeju biti iste' })
            return
        }

        if (!this.validatePassword(newPassword)) {
            res.json({ message: 'Nova lozinka nije u ispravnom formatu' })
            return
        }

        UserModel.findOne({ username: username }).then(user => {
            if (!user) {
                res.json({ message: 'Korisnik nije pronađen' })
                return
            }

            if (!bcrypt.compareSync(oldPassword, user.password!)) {
                res.json({ message: 'Stara lozinka nije ispravna' })
                return
            }

            const saltRounds = 10
            const hashed = bcrypt.hashSync(newPassword, saltRounds)

            UserModel.updateOne({ username }, { $set: { password: hashed } })
                .then(() => res.json({ message: 'Lozinka uspešno promenjena' }))
                .catch(err => {
                    console.log(err)
                    res.json({ message: 'Greška pri promeni lozinke' })
                })
        }).catch(err => {
            console.log(err)
            res.json({ message: 'Greška' })
        })
    }

    updateFirstname = (req: express.Request, res: express.Response)=>{
        userModel.updateOne(
            {username: req.body.username},
            {$set: {firstname: req.body.firstname}}
        ).then(currUser=>{
            res.json({message: "User updated"})
        }).catch((err)=>{
            console.log(err)
            res.json({message: "Fail"})
        })
    }

    updateLastname = (req: express.Request, res: express.Response)=>{
        userModel.updateOne(
            {username: req.body.username},
            {$set: {lastname: req.body.lastname}}
        ).then(currUser=>{
            res.json({message: "User updated"})
        }).catch((err)=>{
            console.log(err)
            res.json({message: "Fail"})
        })
    }

    updateAddress = (req: express.Request, res: express.Response)=>{
        userModel.updateOne(
            {username: req.body.username},
            {$set: {address: req.body.address}}
        ).then(currUser=>{
            res.json({message: "User updated"})
        }).catch((err)=>{
            console.log(err)
            res.json({message: "Fail"})
        })
    }

    updateEmail = (req: express.Request, res: express.Response)=>{
        userModel.updateOne(
            {username: req.body.username},
            {$set: {email: req.body.email}}
        ).then(currUser=>{
            res.json({message: "User updated"})
        }).catch((err)=>{
            console.log(err)
            res.json({message: "Fail"})
        })
    }

    updatePhone = (req: express.Request, res: express.Response)=>{
        userModel.updateOne(
            {username: req.body.username},
            {$set: {phone: req.body.phone}}
        ).then(currUser=>{
            res.json({message: "User updated"})
        }).catch((err)=>{
            console.log(err)
            res.json({message: "Fail"})
        })
    }

    updateCreditCard = (req: express.Request, res: express.Response)=>{
        console.log(req.body.username + " " + req.body.creditCardNumber)
        userModel.updateOne(
            {username: req.body.username},
            {$set: {creditCardNumber: req.body.creditCardNumber}}
        ).then(currUser=>{
            res.json({message: "User updated"})
        }).catch((err)=>{
            console.log(err)
            res.json({message: "Fail"})
        })
    }

    getAll = (req: express.Request, res: express.Response)=>{
        UserModel.find({}).sort({Ime: 1}).then(users=>{
            res.json(users)
        }).catch((err)=>{
            console.log(err)
        })
    }

    updateProfilePicture = (req: express.Request, res: express.Response): void => {
    const username = req.body.username
    if (!username) {
        res.json({ message: 'No username provided' })
        return
    }

    if (!req.file) {
        res.json({ message: 'No file uploaded' })
        return
    }

    const newPicture = 'uploads/' + req.file.filename

    UserModel.updateOne({ username }, { $set: { profilePicture: newPicture } })
        .then(() => {
        res.json({ message: 'Profile picture updated', path: newPicture })
        })
        .catch(err => {
        console.log(err)
        res.json({ message: 'Error updating picture' })
        })
    }
}