import express from 'express'
import RezervacijaModel from '../models/rezervacija.model'
import VikendicaModel from '../models/vikendica.model'

// Funkcija za proveru preklapanja datuma sa tačnim vremenom
// Proverava da li se bilo koji trenutak preklapa između dve rezervacije
// VAŽNO: Ako jedna rezervacija završava u 10:00 i druga počinje u 14:00 istog dana,
// to NIJE preklapanje jer vikendica može da se oslobodi i ponovo rezerviše istog dana
function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  // Koristimo tačno vreme (sa satima i minutima), ne samo dan
  // Dva perioda se preklapaju ako postoji bilo koji zajednički trenutak između njih
  
  // Pravilna logika: preklapanje postoji ako aStart < bEnd && bStart < aEnd
  // Ovo znači: prva rezervacija počinje pre nego što se druga završi,
  // I druga rezervacija počinje pre nego što se prva završi
  
  // VAŽNO: Koristimo striktno < (ne <=) jer:
  // - Ako rezervacija završava u 10:00 i druga počinje u 14:00 istog dana, to NIJE preklapanje
  //   (vikendica se oslobađa u 10:00 i može ponovo da se rezerviše u 14:00)
  // - Ako se rezervacije dodiruju tačno (aEnd === bStart), to takođe NIJE preklapanje
  //   jer se smatra da vikendica može biti oslobođena i ponovo rezervisana u istom trenutku
  
  // Primeri:
  // - Rez 1: 5. jan 10:00 - 10. jan 10:00
  // - Rez 2: 10. jan 14:00 - 15. jan 10:00
  //   => NEMA preklapanja (10. jan 10:00 < 10. jan 14:00, ali 10. jan 14:00 < 10. jan 10:00 je false)
  
  // - Rez 1: 5. jan 10:00 - 10. jan 10:00
  // - Rez 2: 9. jan 14:00 - 15. jan 10:00
  //   => IMA preklapanja (9. jan 14:00 < 10. jan 10:00 je false, ali 5. jan 10:00 < 15. jan 10:00 je true...)
  //   WAIT, provera: aStart (5. jan 10:00) < bEnd (15. jan 10:00) = true
  //                  bStart (9. jan 14:00) < aEnd (10. jan 10:00) = true (9. jan 14:00 je pre 10. jan 10:00)
  //   => IMA preklapanja ✓
  
  const overlaps = aStart < bEnd && bStart < aEnd
  
  return overlaps
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

      // Provera da li je vikendica blokirana
      const idVikendiceNum = Number(idVikendice)
      const vikendica = await VikendicaModel.findOne({ idVikendice: idVikendiceNum })
      if(!vikendica){ res.status(404).json({message:'Vikendica nije pronađena'}); return }
      
      if(vikendica.blockedUntil && new Date(vikendica.blockedUntil) > new Date()){
        const blockedUntil = new Date(vikendica.blockedUntil)
        const formatted = blockedUntil.toLocaleString('sr-RS')
        res.status(403).json({message:`Vikendica je privremeno blokirana do ${formatted}`})
        return
      }

      // Provera preklapanja - proveravamo SVE rezervacije (i obrađene i neobrađene)
      // Čak i neobrađena rezervacija zauzima vikendicu u tom periodu
      const allExisting = await RezervacijaModel.find({ idVikendice: idVikendiceNum })
      
      let hasOverlap = false
      let overlapDetails: any[] = []
      
      for(const r of allExisting){
        let rStart: Date
        let rEnd: Date
        
        if(r.pocetak instanceof Date){
          rStart = new Date(r.pocetak)
        } else if(typeof r.pocetak === 'string'){
          rStart = new Date(r.pocetak)
        } else {
          rStart = new Date(r.pocetak as any)
        }
        
        if(r.kraj instanceof Date){
          rEnd = new Date(r.kraj)
        } else if(typeof r.kraj === 'string'){
          rEnd = new Date(r.kraj)
        } else {
          rEnd = new Date(r.kraj as any)
        }
        
        if(isNaN(rStart.getTime()) || isNaN(rEnd.getTime())){
          continue
        }
        
        const overlaps = rangesOverlap(start, end, rStart, rEnd)
        
        if(overlaps){
          hasOverlap = true
          overlapDetails.push({
            idRezervacije: r.idRezervacije,
            pocetak: rStart,
            kraj: rEnd,
            obradjena: r.obradjena,
            accepted: r.accepted
          })
        }
      }
      
      if(hasOverlap){ 
        res.status(409).json({
          message: `Vikendica je već zauzeta u izabranom periodu. Preklapanje sa rezervacijom/a: ${overlapDetails.map(o => `#${o.idRezervacije}`).join(', ')}`
        })
        return 
      }

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
    try{
      const idVikendice = Number(req.params.idVikendice)
      // Vraćamo završene rezervacije koje imaju popunjen komentar ILI ocenu
      const now = new Date()
      const list = await RezervacijaModel.find({ 
        idVikendice,
        kraj: { $lt: now }, // Završene rezervacije
        $or: [
          { touristRating: { $exists: true, $ne: null, $gte: 1, $lte: 5 } }, // Koje imaju validnu ocenu (1-5)
          { 
            $and: [
              { touristComment: { $exists: true } },
              { touristComment: { $ne: null } },
              { touristComment: { $ne: '' } }
            ]
          } // ILI ne-prazan komentar
        ]
      }).sort({kraj: -1}).lean()
      
      // Formatirajmo rezervacije za frontend i filtrirujemo prazne vrednosti
      const formatted = list
        .map((r: any) => ({
          idRezervacije: r.idRezervacije,
          usernameTuriste: r.usernameTuriste,
          pocetak: r.pocetak,
          kraj: r.kraj,
          touristComment: r.touristComment ? String(r.touristComment).trim() : '',
          touristRating: (r.touristRating && r.touristRating >= 1 && r.touristRating <= 5) ? Number(r.touristRating) : null,
          createdAt: r.createdAt || r.kraj
        }))
        // Filtrirujemo samo one koje imaju bar jedan popunjen podatak
        .filter((r: any) => (r.touristRating !== null && r.touristRating > 0) || (r.touristComment && r.touristComment.length > 0))
      
      res.json(formatted)
    }catch(err){
      console.log(err)
      res.status(500).json({message: 'Greška pri učitavanju komentara'})
    }
  }

  byUser = async (req: express.Request, res: express.Response) => {
    try{
      const username = String(req.params.username)
      const list = await RezervacijaModel.find({ usernameTuriste: username }).sort({pocetak: -1}).lean()
      
      // Eksplicitno formatirajmo podatke da bismo osigurali konzistentnost
      const formatted = list.map((r: any) => ({
        idRezervacije: r.idRezervacije,
        idVikendice: r.idVikendice,
        usernameTuriste: r.usernameTuriste,
        pocetak: r.pocetak,
        kraj: r.kraj,
        brojOdraslih: r.brojOdraslih || 0,
        brojDece: r.brojDece || 0,
        cena: r.cena || 0,
        napomena: r.napomena || '',
        obradjena: r.obradjena === true,
        accepted: r.accepted === true,
        ownerComment: r.ownerComment || '',
        touristComment: r.touristComment || null,
        touristRating: (r.touristRating && typeof r.touristRating === 'number' && r.touristRating >= 1 && r.touristRating <= 5) ? r.touristRating : null,
        createdAt: r.createdAt || new Date()
      }))
      
      res.json(formatted)
    }catch(err){
      console.log(err)
      res.status(500).json({message:'Greška pri učitavanju rezervacija'})
    }
  }

  process = async (req: express.Request, res: express.Response) => {
    const idRezervacije = Number(req.body.idRezervacije)
    // Eksplicitno proveravamo da li je accepted === true (ne Boolean() jer može konvertovati "false" string u true)
    const acceptedValue = req.body.accepted
    const accepted = acceptedValue === true || acceptedValue === 'true' || acceptedValue === 1
    const ownerCommentRaw = req.body.ownerComment
    const ownerComment = ownerCommentRaw ? String(ownerCommentRaw) : ''
    if(!accepted && ownerComment.trim().length === 0){
      res.status(400).json({message:'Komentar je obavezan kod odbijanja.'}); return
    }
    // Eksplicitno postavljamo accepted na true ili false
    await RezervacijaModel.updateOne({ idRezervacije }, { $set: { obradjena: true, accepted: accepted, ownerComment } })
    res.json({message:'Ažurirano'})
  }

  addTouristReview = async (req: express.Request, res: express.Response) => {
    try{
      const idRezervacije = Number(req.body.idRezervacije)
      const touristComment = req.body.touristComment ? String(req.body.touristComment).trim() : ''
      const touristRating = Number(req.body.touristRating)
      
      if(!idRezervacije){
        res.status(400).json({message:'idRezervacije je obavezno polje'})
        return
      }
      
      if(touristRating < 1 || touristRating > 5 || isNaN(touristRating)){
        res.status(400).json({message:'Ocena mora biti između 1 i 5'})
        return
      }
      
      // Proveri da li rezervacija postoji i da li je završena
      const rez = await RezervacijaModel.findOne({ idRezervacije })
      if(!rez){
        res.status(404).json({message:'Rezervacija nije pronađena'})
        return
      }
      
      // Proveri da li je rezervacija završena (kraj < sada)
      const kraj = new Date(rez.kraj as any)
      const now = new Date()
      if(kraj > now){
        res.status(400).json({message:'Možete ostaviti ocenu i komentar samo za završene rezervacije'})
        return
      }

      // Proveri da li je rezervacija prihvaćena (obavezno)
      if(rez.accepted !== true || rez.obradjena !== true){
        res.status(400).json({message:'Možete ostaviti ocenu i komentar samo za prihvaćene rezervacije'})
        return
      }

      // Proveri da li je već ocenio ovu rezervaciju
      const existingRating = rez.touristRating
      if(existingRating !== null && existingRating !== undefined && existingRating >= 1 && existingRating <= 5){
        res.status(400).json({message:'Već ste ocenili ovu rezervaciju. Ne možete je ponovo oceniti.'})
        return
      }
      
      const usernameTuriste = String(rez.usernameTuriste)
      const idVikendice = Number(rez.idVikendice)
      
      // Ažuriraj rezervaciju sa ocenom i komentarom
      await RezervacijaModel.updateOne(
        { idRezervacije }, 
        { $set: { touristComment, touristRating } }
      )
      
      // Dodaj ocenu u vikendicu
      await VikendicaModel.updateOne(
        { idVikendice },
        { $push: { ocene: { username: usernameTuriste, rating: touristRating } } }
      )
      
      // Ažuriraj prosečnu ocenu vikendice
      const vikendica = await VikendicaModel.findOne({ idVikendice }).lean()
      if(vikendica){
        const ocene = (vikendica as any).ocene || []
        // Filtriraj samo validne ocene (1-5)
        const validOcene = ocene.filter((o: any) => 
          o && 
          o.rating !== null && 
          o.rating !== undefined && 
          typeof o.rating === 'number' && 
          !isNaN(o.rating) && 
          o.rating >= 1 && 
          o.rating <= 5
        )
        
        let prosecnaOcena = 0
        if(validOcene.length > 0){
          const sum = validOcene.reduce((acc: number, o: any) => acc + o.rating, 0)
          prosecnaOcena = Math.round((sum / validOcene.length) * 100) / 100 // Zaokruženo na 2 decimale
        }
        
        await VikendicaModel.updateOne(
          { idVikendice },
          { $set: { prosecnaOcena } }
        )
      }
      
      res.json({message:'Ocena i komentar su uspešno sačuvani'})
    }catch(err){
      console.log(err)
      res.status(500).json({message:'Greška pri čuvanju ocene i komentara'})
    }
  }

  getStatistics = async (req: express.Request, res: express.Response) => {
    try{
      const now = new Date()
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      // Brojimo samo prihvaćene rezervacije
      const count24h = await RezervacijaModel.countDocuments({
        createdAt: { $gte: last24h },
        accepted: true,
        obradjena: true
      })
      
      const count7days = await RezervacijaModel.countDocuments({
        createdAt: { $gte: last7days },
        accepted: true,
        obradjena: true
      })
      
      const count30days = await RezervacijaModel.countDocuments({
        createdAt: { $gte: last30days },
        accepted: true,
        obradjena: true
      })
      
      res.json({
        last24h: count24h,
        last7days: count7days,
        last30days: count30days
      })
    }catch(err){
      console.log(err)
      res.status(500).json({message:'Greška pri učitavanju statistike'})
    }
  }

  cancel = async (req: express.Request, res: express.Response) => {
    try{
      const idRezervacije = Number(req.body.idRezervacije)
      
      if(!idRezervacije){
        res.status(400).json({message:'idRezervacije je obavezno polje'})
        return
      }
      
      const rez = await RezervacijaModel.findOne({ idRezervacije })
      if(!rez){
        res.status(404).json({message:'Rezervacija nije pronađena'})
        return
      }
      
      // Proveri da li je rezervacija prihvaćena
      if(rez.accepted !== true || rez.obradjena !== true){
        res.status(400).json({message:'Možete otkazati samo prihvaćene rezervacije'})
        return
      }
      
      // Proveri da li je više od 1 dana do početka
      const pocetak = new Date(rez.pocetak as any)
      const now = new Date()
      const diffTime = pocetak.getTime() - now.getTime()
      const diffDays = diffTime / (1000 * 60 * 60 * 24)
      
      if(diffDays <= 1){
        res.status(400).json({message:'Rezervaciju možete otkazati samo ako je više od 1 dana do početka'})
        return
      }
      
      // Obriši rezervaciju
      await RezervacijaModel.deleteOne({ idRezervacije })
      
      res.json({message:'Rezervacija je uspešno otkazana'})
    }catch(err){
      console.log(err)
      res.status(500).json({message:'Greška pri otkazivanju rezervacije'})
    }
  }

  byOwner = async (req: express.Request, res: express.Response) => {
    try{
      const username = String(req.params.username)
      
      const vik = await VikendicaModel.find({ ownerUsername: username }, { idVikendice: 1, ownerUsername: 1, _id:0 })
      const ids = vik.map(v=> v.idVikendice)
      
      if(ids.length === 0){
        res.json([])
        return
      }
      
      const list = await RezervacijaModel.find({ idVikendice: { $in: ids } }).sort({ createdAt: -1 })
      
      const formatted = list.map(r => {
        const obradjena = r.obradjena === true ? true : false
        const accepted = r.accepted === true ? true : false
        
        return {
          idRezervacije: r.idRezervacije,
          idVikendice: r.idVikendice,
          usernameTuriste: r.usernameTuriste,
          pocetak: r.pocetak,
          kraj: r.kraj,
          brojOdraslih: r.brojOdraslih || 0,
          brojDece: r.brojDece || 0,
          cena: r.cena || 0,
          napomena: r.napomena || '',
          obradjena: obradjena,
          accepted: accepted,
          ownerComment: r.ownerComment || '',
          createdAt: r.createdAt || new Date()
        }
      })
      
      res.json(formatted)
    }catch(err){
      console.log(err)
      res.status(500).json({message:'Greška pri učitavanju rezervacija'})
    }
  }
}


