import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        username: String,
        password: String,
        userType: String,
        firstname: String,
        lastname: String,
        gender: String,
        address: String,
        phone: String,
        email: String,
        profilePicture: String,
        creditCardNumber: String,
    },
    {
        versionKey: false
    }
);

export default mongoose.model('UserModel', userSchema, 'users');