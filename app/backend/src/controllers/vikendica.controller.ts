import express from 'express'
import VikendicaModel from '../models/vikendica.model'

export class VikendicaController{
    getAll = async (req: express.Request, res: express.Response)=>{
        try{
            const vikendice = await VikendicaModel.find({}).sort({idVikendice: 1}).lean()
            // Računamo prosečnu ocenu za svaku vikendicu i proveravamo poslednje 3 ocene
            const vikendiceWithRating = []
            for(const v of vikendice){
                const ocene = v.ocene || []
                // Filtriraj samo validne ocene (1-5) - konvertuj u broj ako je string
                const validOcene = ocene.filter((o: any) => {
                    if(!o) return false
                    // Konvertuj rating u broj ako nije već broj
                    const rating = typeof o.rating === 'string' ? parseFloat(o.rating) : o.rating
                    return rating !== null && 
                           rating !== undefined && 
                           !isNaN(rating) && 
                           rating >= 1 && 
                           rating <= 5
                }).map((o: any) => ({
                    ...o,
                    rating: typeof o.rating === 'string' ? parseFloat(o.rating) : o.rating
                }))
                let prosecnaOcena = 0
                if(validOcene.length > 0){
                    const sum = validOcene.reduce((acc: number, o: any) => acc + o.rating, 0)
                    prosecnaOcena = Math.round((sum / validOcene.length) * 100) / 100 // Zaokruženo na 2 decimale
                }
                
                // Ažuriraj prosecnaOcena u bazi ako se promenila
                const currentProsecna = (v.prosecnaOcena || 0)
                if(Math.abs(currentProsecna - prosecnaOcena) > 0.01){
                    await VikendicaModel.updateOne(
                        { idVikendice: v.idVikendice },
                        { $set: { prosecnaOcena } }
                    )
                }
                
                // Proveravamo poslednje 3 ocene (ako ih ima) - samo validne
                const last3 = validOcene.slice(-3)
                const hasLowRatings = last3.length === 3 && last3.every((o: any) => o.rating < 2)
                
                vikendiceWithRating.push({
                    ...v,
                    prosecnaOcena: prosecnaOcena,
                    hasLowRatings: hasLowRatings,
                    // Proveravamo da li je blokirana (blockedUntil > sada)
                    isBlocked: v.blockedUntil ? new Date(v.blockedUntil) > new Date() : false
                })
            }
            res.json(vikendiceWithRating)
        }catch(err){
            console.log(err)
            res.status(500).json({message: 'Greška pri učitavanju vikendica'})
        }
    }

    getByOwner = async (req: express.Request, res: express.Response)=>{
        try{
            const ownerUsername = String(req.params.username)
            const vikendice = await VikendicaModel.find({ ownerUsername }).sort({idVikendice: 1}).lean()
            // Računamo prosečnu ocenu za svaku vikendicu
            const vikendiceWithRating = []
            for(const v of vikendice){
                const ocene = v.ocene || []
                // Filtriraj samo validne ocene (1-5) - konvertuj u broj ako je string
                const validOcene = ocene.filter((o: any) => {
                    if(!o) return false
                    // Konvertuj rating u broj ako nije već broj
                    const rating = typeof o.rating === 'string' ? parseFloat(o.rating) : o.rating
                    return rating !== null && 
                           rating !== undefined && 
                           !isNaN(rating) && 
                           rating >= 1 && 
                           rating <= 5
                }).map((o: any) => ({
                    ...o,
                    rating: typeof o.rating === 'string' ? parseFloat(o.rating) : o.rating
                }))
                let prosecnaOcena = 0
                if(validOcene.length > 0){
                    const sum = validOcene.reduce((acc: number, o: any) => acc + o.rating, 0)
                    prosecnaOcena = Math.round((sum / validOcene.length) * 100) / 100 // Zaokruženo na 2 decimale
                }
                
                // Ažuriraj prosecnaOcena u bazi ako se promenila
                const currentProsecna = (v.prosecnaOcena || 0)
                if(Math.abs(currentProsecna - prosecnaOcena) > 0.01){
                    await VikendicaModel.updateOne(
                        { idVikendice: v.idVikendice },
                        { $set: { prosecnaOcena } }
                    )
                }
                
                vikendiceWithRating.push({
                    ...v,
                    prosecnaOcena: prosecnaOcena
                })
            }
            res.json(vikendiceWithRating)
        }catch(err){
            console.log(err)
            res.status(500).json({message:'Greška'})
        }
    }

    delete = (req: express.Request, res: express.Response)=>{
        VikendicaModel.deleteOne({idVikendice: req.body.idVikendice}).then(vikendice=>{
            res.json({message: "Vikendica obrisana"})
        }).catch((err)=>{
            console.log(err)
            res.json({message: "Greška"})
        })
    }

    update = (req: express.Request, res: express.Response) => {
        const updateData: any = {}
        const protectedFields = ['ownerUsername', 'idVikendice'] // Polja koja ne mogu biti ažurirana

        // prolazimo kroz sva polja iz requesta
        for (const key in req.body) {
            // preskačemo zaštićena polja - ownerUsername NIKADA ne može biti ažuriran!
            if (protectedFields.includes(key)) {
                continue
            }
            // ako polje nije prazno (undefined, null, ili prazan string) — dodaj u update objekat
            if (req.body[key] !== undefined && req.body[key] !== null && req.body[key] !== "") {
                updateData[key] = req.body[key]
            }
        }
        
        // DODATNA ZAŠTITA: Eksplicitno uklanjamo ownerUsername iz updateData ako je neko pokušao da ga postavi
        if('ownerUsername' in updateData){
            delete updateData.ownerUsername
        }
        
        // ažuriramo samo ta polja - ownerUsername NIKADA neće biti uključen
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
            // Osiguravamo da ownerUsername postoji i nije prazan
            const ownerUsername = req.body.ownerUsername
            if(!ownerUsername || ownerUsername.trim() === ''){
                res.status(400).json({ message: "ownerUsername je obavezno polje." })
                return
            }
            
            const all = await VikendicaModel.find({}).sort({idVikendice: -1}).limit(1)
            const nextId = all.length ? (all[0].idVikendice as number) + 1 : 1
            
            // Koristimo sve podatke iz req.body, ali postavljamo ownerUsername na ulogovanog korisnika
            // i osiguravamo osnovne vrednosti
            const doc = new VikendicaModel({
                idVikendice: nextId,
                naziv: req.body.naziv,
                mesto: req.body.mesto,
                telefon: req.body.telefon,
                cenaNocenjaLetnja: req.body.cenaNocenjaLetnja,
                cenaNocenjaZimska: req.body.cenaNocenjaZimska,
                galerijaSlika: Array.isArray(req.body.galerijaSlika) ? req.body.galerijaSlika : (req.body.galerijaSlika ? [req.body.galerijaSlika] : []),
                zauzeta: req.body.zauzeta !== undefined ? req.body.zauzeta : false,
                usluge: req.body.usluge,
                ownerUsername: String(ownerUsername).trim(), // Uvek postavljamo ownerUsername na ulogovanog korisnika
                lat: req.body.lat,
                lng: req.body.lng,
                ocene: Array.isArray(req.body.ocene) ? req.body.ocene : [],
                prosecnaOcena: req.body.prosecnaOcena
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

    blockVikendica = async (req: express.Request, res: express.Response) => {
        try{
            const idVikendice = Number(req.body.idVikendice)
            if(!idVikendice){
                res.status(400).json({message: 'Nedostaje idVikendice'})
                return
            }

            // Blokiramo na 48 sati
            const blockedUntil = new Date()
            blockedUntil.setHours(blockedUntil.getHours() + 48)

            await VikendicaModel.updateOne(
                { idVikendice },
                { $set: { blockedUntil } }
            )

            res.json({ message: 'Vikendica je blokirana na 48 sati', blockedUntil })
        }catch(err){
            console.log(err)
            res.status(500).json({ message: 'Greška pri blokiranju vikendice' })
        }
    }

}