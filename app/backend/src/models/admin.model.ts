import mongoose from "mongoose"

const adminSchema = new mongoose.Schema(
    {
        username: String,
        password: String,
    },
    {
        versionKey: false
    }
);

export default mongoose.model('AdminModel', adminSchema, 'admins');