import express from 'express'
import { AdminController } from '../controllers/admin.controller'

const adminRouter = express.Router()

adminRouter.route('/loginAdmin').post(
    (req, res)=>new AdminController().login(req, res)
)

adminRouter.route('/registerAdmin').post(
    (req, res)=>new AdminController().register(req, res)
)

adminRouter.route("/activateUser").post(
    (req, res) => new AdminController().activation(req, res)
)

adminRouter.route("/blockUser").post(
    (req, res) => new AdminController().blocking(req, res)
)


export default adminRouter;