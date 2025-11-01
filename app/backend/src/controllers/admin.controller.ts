import express from 'express'
import bcrypt from 'bcrypt'

import AdminModel from '../models/admin.model'
import UserModel from '../models/user.model'

export class AdminController {

    login = (request: express.Request, response: express.Response) => {
        AdminModel.findOne({
            username: request.body.username,
        }).then((user) => {
            if (user != null && bcrypt.compareSync(request.body.password, user.password!)) {
                response.json(user)
            } else {
                response.json(null)
            }
        }).catch((error) => console.log(error))
    }

    register = (req: express.Request, res: express.Response) => {
        const password = req.body.password
        const saltRounds = 10
        const hashedPassword = bcrypt.hashSync(password, saltRounds)

        const username = req.body.username
        const admin = {
            username: username,
            password: hashedPassword
        }

        new AdminModel(admin)
            .save()
            .then(() => {
                res.json({ message: 'ok' })
            })
            .catch(err => {
                console.log(err)
                res.json({ message: 'Greška pri registraciji' })
            })
    }

    activation = (req: express.Request, res: express.Response) => {
        const username: string = req.body.username
        const isActive: boolean = req.body.isActive

        UserModel.updateOne(
            { username: username },
            { $set: { isActive: isActive } }
        ).then(() => {
            res.json({ message: 'Aktivacija korisnika ažurirana' })
        }).catch(err => {
            console.log(err)
            res.json({ message: 'Greška' })
        })
    }

    blocking = (req: express.Request, res: express.Response) => {
        const username: string = req.body.username
        const isBlocked: boolean = req.body.isBlocked

        UserModel.updateOne(
            { username: username },
            { $set: { isBlocked: isBlocked } }
        ).then(() => {
            res.json({ message: 'Blokiranje korisnika ažurirano' })
        }).catch(err => {
            console.log(err)
            res.json({ message: 'Greška' })
        })
    }
}