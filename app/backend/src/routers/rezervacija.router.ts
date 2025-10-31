import express from 'express'
import { RezervacijaController } from '../controllers/rezervacija.controller'

const rezervacijaRouter = express.Router()

rezervacijaRouter.route('/create').post(
  (req, res) => new RezervacijaController().create(req, res)
)

rezervacijaRouter.route('/byVikendica/:idVikendice').get(
  (req, res) => new RezervacijaController().byVikendica(req, res)
)

rezervacijaRouter.route('/byUser/:username').get(
  (req, res) => new RezervacijaController().byUser(req, res)
)

rezervacijaRouter.route('/process').post(
  (req, res) => new RezervacijaController().process(req, res)
)

rezervacijaRouter.route('/byOwner/:username').get(
  (req, res) => new RezervacijaController().byOwner(req, res)
)

rezervacijaRouter.route('/addTouristReview').post(
  (req, res) => new RezervacijaController().addTouristReview(req, res)
)

rezervacijaRouter.route('/cancel').post(
  (req, res) => new RezervacijaController().cancel(req, res)
)

export default rezervacijaRouter


