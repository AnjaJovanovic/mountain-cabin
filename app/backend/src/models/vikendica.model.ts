import mongoose from "mongoose"

const vikendicaSchema = new mongoose.Schema(
    {
        idVikendice: Number,
        naziv: String,
        mesto: String,
        telefon: String,
        cenaNocenjaLetnja: Number,
        cenaNocenjaZimska: Number,
        galerijaSlika: [String],
        zauzeta: Boolean,
        usluge: String
    },
    {
        versionKey: false
    }
)

export default mongoose.model('VikendicaModel', vikendicaSchema, 'vikendice')
