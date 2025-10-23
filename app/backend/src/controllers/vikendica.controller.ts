import express from 'express'
import VikendicaModel from '../models/vikendica.model'

export class VikendicaController{
    getAll = (req: express.Request, res: express.Response)=>{
        VikendicaModel.find({}).sort({idVikendice: 1}).then(vikendice=>{
            res.json(vikendice)
        }).catch((err)=>{
            console.log(err)
        })
    }

    delete = (req: express.Request, res: express.Response)=>{
        VikendicaModel.deleteOne({idVikendice: req.body.idVikendice}).then(vikendice=>{
            res.json({message: "Vikendica obrisana"})
        }).catch((err)=>{
            console.log(err)
            res.json({message: "Fail"})
        })
    }

    update = (req: express.Request, res: express.Response) => {
        const updateData: any = {}

        // prolazimo kroz sva polja iz requesta
        for (const key in req.body) {
            // ako polje nije prazno (undefined, null, ili prazan string) — dodaj u update objekat
            if (req.body[key] !== undefined && req.body[key] !== null && req.body[key] !== "") {
                updateData[key] = req.body[key]
            }
        }
        // ažuriramo samo ta polja
        VikendicaModel.updateOne({ idVikendice: req.body.idVikendice }, { $set: updateData })
            .then(result => {
                if (result.modifiedCount > 0)
                    res.json({ message: "Vikendica uspešno ažurirana." })
                else
                    res.json({ message: "Nema promena ili vikendica nije pronađena." })
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({ message: "Greška pri ažuriranju." })
            })
    }

}