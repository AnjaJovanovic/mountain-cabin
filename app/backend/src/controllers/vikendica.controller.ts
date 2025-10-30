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

    getByOwner = (req: express.Request, res: express.Response)=>{
        const ownerUsername = String(req.params.username)
        VikendicaModel.find({ ownerUsername }).sort({idVikendice: 1}).then(vikendice=>{
            res.json(vikendice)
        }).catch((err)=>{
            console.log(err)
            res.status(500).json({message:'Greška'})
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

    create = async (req: express.Request, res: express.Response) => {
        try{
            const all = await VikendicaModel.find({}).sort({idVikendice: -1}).limit(1)
            const nextId = all.length ? (all[0].idVikendice as number) + 1 : 1
            const doc = new VikendicaModel({
                idVikendice: nextId,
                naziv: req.body.naziv,
                mesto: req.body.mesto,
                telefon: req.body.telefon,
                cenaNocenjaLetnja: req.body.cenaNocenjaLetnja,
                cenaNocenjaZimska: req.body.cenaNocenjaZimska,
                galerijaSlika: Array.isArray(req.body.galerijaSlika) ? req.body.galerijaSlika : [],
                zauzeta: false,
                usluge: req.body.usluge,
                ownerUsername: req.body.ownerUsername,
                lat: req.body.lat,
                lng: req.body.lng
            })
            await doc.save()
            res.json({ message: "Vikendica kreirana", idVikendice: nextId })
        }catch(err){
            console.log(err)
            res.status(500).json({ message: "Greška pri kreiranju" })
        }
    }

    uploadImages = async (req: express.Request, res: express.Response) => {
        try{
            const idVikendice = Number(req.body.idVikendice)
            if(!idVikendice){ res.status(400).json({message:'Nedostaje idVikendice'}); return }
            const files = (req as any).files as Express.Multer.File[]
            if(!files || files.length===0){ res.status(400).json({message:'Nema fajlova'}); return }
            const paths = files.map(f=> 'uploads/' + f.filename)
            await VikendicaModel.updateOne({ idVikendice }, { $push: { galerijaSlika: { $each: paths } } })
            res.json({ message: 'Slike dodate', paths })
        }catch(err){
            console.log(err)
            res.status(500).json({ message: 'Greška pri uploadu slika' })
        }
    }

}