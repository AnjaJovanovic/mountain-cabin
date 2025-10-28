import express from 'express'
import { UserController } from '../controllers/user.controller'

import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Kreiraj folder ako ne postoji
const uploadDir = path.join(__dirname, '../../../frontend/app/public/uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

// Konfiguracija za multer
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

const userRouter = express.Router()

userRouter.route('/login').post(
    (req, res)=>new UserController().login(req, res)
)

userRouter.post(
  "/register",
  upload.single("profilePicture"),
  (request, response) => new UserController().register(request, response)
)

userRouter.route("/updateFirstname").post(
    (request, response) => new UserController().updateFirstname(request, response)
)

userRouter.route("/updateLastname").post(
    (request, response) => new UserController().updateLastname(request, response)
)

userRouter.route("/updateAddress").post(
    (request, response) => new UserController().updateAddress(request, response)
)
userRouter.route("/updateEmail").post(
    (request, response) => new UserController().updateEmail(request, response)
)
userRouter.route("/updatePhone").post(
    (request, response) => new UserController().updatePhone(request, response)
)
userRouter.route("/updateCreditCard").post(
    (request, response) => new UserController().updateCreditCard(request, response)
)
userRouter.route("/getAllUsers").get(
    (req, res) => new UserController().getAll(req, res)
)

export default userRouter;