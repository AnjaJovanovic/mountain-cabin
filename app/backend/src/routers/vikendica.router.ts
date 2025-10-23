import express from 'express'
import { VikendicaController } from '../controllers/vikendica.controller'

const vikendicaRouter = express.Router()

vikendicaRouter.route("/getAll").get(
    (req, res) => new VikendicaController().getAll(req, res)
)

vikendicaRouter.route("/delete").post(
    (req, res) => new VikendicaController().delete(req, res)
)

vikendicaRouter.route("/update").post(
    (req, res) => new VikendicaController().update(req, res)
)

export default vikendicaRouter
