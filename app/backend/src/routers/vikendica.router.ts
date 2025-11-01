import express from 'express'
import { VikendicaController } from '../controllers/vikendica.controller'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const vikendicaRouter = express.Router()

// Multer konfiguracija (isti obrazac kao kod usera)
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})

const fileFilter = (req: any, file: any, cb: any) => {
  const allowed = /jpeg|jpg|png/
  if (allowed.test(file.mimetype)) cb(null, true)
  else cb(new Error('Dozvoljene su samo JPG/PNG slike!'))
}

const upload = multer({ storage, fileFilter })

vikendicaRouter.route("/getAll").get(
    (req, res) => new VikendicaController().getAll(req, res)
)

vikendicaRouter.route("/byOwner/:username").get(
    (req, res) => new VikendicaController().getByOwner(req, res)
)

vikendicaRouter.route("/delete").post(
    (req, res) => new VikendicaController().delete(req, res)
)

vikendicaRouter.route("/update").post(
    (req, res) => new VikendicaController().update(req, res)
)

vikendicaRouter.route("/create").post(
    (req, res) => new VikendicaController().create(req, res)
)

vikendicaRouter.post(
  "/uploadImages",
  upload.array('images', 10),
  (req, res) => new VikendicaController().uploadImages(req, res)
)

vikendicaRouter.route("/block").post(
    (req, res) => new VikendicaController().blockVikendica(req, res)
)

export default vikendicaRouter
