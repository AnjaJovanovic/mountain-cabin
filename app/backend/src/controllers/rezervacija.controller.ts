import express from 'express'
import RezervacijaModel from '../models/rezervacija.model'
import VikendicaModel from '../models/vikendica.model'

function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date){
  return aStart < bEnd && bStart < aEnd
}

function isSummerMonth(monthIndex0: number){
  // May(4), Jun(5), Jul(6), Avg(7)
  return [4,5,6,7].includes(monthIndex0)
}

export class RezervacijaController {
  create = async (req: express.Request, res: express.Response) => {
    try{
      const { idVikendice, usernameTuriste, pocetak, kraj, brojOdraslih, brojDece, cena, napomena } = req.body
      if(!idVikendice || !usernameTuriste || !pocetak || !kraj) { res.status(400).json({message:'Nedostaju obavezna polja'}); return }
      const start = new Date(pocetak)
      const end = new Date(kraj)
      if(!(start instanceof Date) || isNaN(start.getTime()) || !(end instanceof Date) || isNaN(end.getTime())){ res.status(400).json({message:'Neispravni datumi'}); return }
      if(start >= end){ res.status(400).json({message:'Početak mora biti pre kraja'}); return }

      // Check-in posle 14:00, check-out do 10:00
      if(start.getHours() < 14){ res.status(400).json({message:'Ulazak moguć od 14:00.'}); return }
      if(end.getHours() > 10 || (end.getHours()===10 && (end.getMinutes()||0) > 0)){ res.status(400).json({message:'Izlazak do 10:00.'}); return }

      if(napomena && String(napomena).length > 500){ res.status(400).json({message:'Napomena do 500 karaktera'}); return }

      // Provera preklapanja
      const existing = await RezervacijaModel.find({ idVikendice })
      const hasOverlap = existing.some(r => rangesOverlap(start, end, new Date(r.pocetak as any), new Date(r.kraj as any)))
      if(hasOverlap){ res.status(409).json({message:'Nema slobodnog mesta u izabranom periodu.'}); return }

      // Dodeli idRezervacije
      const last = await RezervacijaModel.find({}).sort({idRezervacije: -1}).limit(1)
      const nextId = last.length ? (last[0].idRezervacije as number)+1 : 1

      const doc = new RezervacijaModel({
        idRezervacije: nextId,
        idVikendice: Number(idVikendice),
        usernameTuriste: String(usernameTuriste),
        pocetak: start,
        kraj: end,
        brojOdraslih: Number(brojOdraslih||0),
        brojDece: Number(brojDece||0),
        cena: Number(cena||0),
        napomena: napomena ? String(napomena) : '',
        obradjena: false,
        accepted: false,
        ownerComment: ''
      })
      await doc.save()
      res.json({message:'Rezervacija uspešno kreirana', idRezervacije: nextId})
    }catch(err){
      console.log(err)
      res.status(500).json({message:'Greška pri kreiranju rezervacije'})
    }
  }

  byVikendica = async (req: express.Request, res: express.Response) => {
    const idVikendice = Number(req.params.idVikendice)
    const list = await RezervacijaModel.find({ idVikendice }).sort({pocetak: 1})
    res.json(list)
  }

  byUser = async (req: express.Request, res: express.Response) => {
    const username = String(req.params.username)
    const list = await RezervacijaModel.find({ usernameTuriste: username }).sort({pocetak: -1})
    res.json(list)
  }

  process = async (req: express.Request, res: express.Response) => {
    const idRezervacije = Number(req.body.idRezervacije)
    const accepted = Boolean(req.body.accepted)
    const ownerCommentRaw = req.body.ownerComment
    const ownerComment = ownerCommentRaw ? String(ownerCommentRaw) : ''
    if(!accepted && ownerComment.trim().length === 0){
      res.status(400).json({message:'Komentar je obavezan kod odbijanja.'}); return
    }
    await RezervacijaModel.updateOne({ idRezervacije }, { $set: { obradjena: true, accepted, ownerComment } })
    res.json({message:'Ažurirano'})
  }

  byOwner = async (req: express.Request, res: express.Response) => {
    const username = String(req.params.username)
    const vik = await VikendicaModel.find({ ownerUsername: username }, { idVikendice: 1, _id:0 })
    const ids = vik.map(v=> v.idVikendice)
    const list = await RezervacijaModel.find({ idVikendice: { $in: ids } }).sort({ createdAt: -1 })
    res.json(list)
  }
}


