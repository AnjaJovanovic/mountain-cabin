import express from 'express'
import { UserController } from '../controllers/user.controller'

const userRouter = express.Router()

userRouter.route('/login').post(
    (req, res)=>new UserController().login(req, res)
)

userRouter.route("/register").post(
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

export default userRouter;