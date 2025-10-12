import express from 'express'
import bcrypt from 'bcrypt'

import UserModel from '../models/user.model'

export class UserController{

    // Check user registration------------

    userAlredyExists(username: string, email: string) {
        return UserModel.findOne({
            $or: [{ username: username }, { email: email }]
        })
    }

    validatePassword(password: string): boolean {
        const passwordRegex = /^(?=[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z].*[a-z].*[a-z]).{6,10}$/
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
                if (user != null && bcrypt.compareSync(request.body.password, user.password!)) {
                    response.json(user)
                } else {
                    response.json(null)
                }
            }
        ).catch(
            (error) => console.log(error)
        )
    }

    register = (req: express.Request, res: express.Response) => {

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
            let firstname = req.body.name;
            let lastname = req.body.surname;
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
                        creditCardNumber: creditCardNumber
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
}