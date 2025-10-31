import mongoose from "mongoose"

const rezervacijaSchema = new mongoose.Schema(
  {
    idRezervacije: Number,
    idVikendice: Number,
    usernameTuriste: String,
    pocetak: Date,
    kraj: Date,
    brojOdraslih: Number,
    brojDece: Number,
    cena: Number,
    napomena: String,
    obradjena: Boolean,
    accepted: Boolean,
    ownerComment: String,
    touristComment: String,
    touristRating: Number,
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
)

export default mongoose.model('RezervacijaModel', rezervacijaSchema, 'rezervacije')


