import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    name: String,
    email: String,
    phone: String,
    password: {
        type:String,
        minLength: 4
    },
    otpassword:{
        type: String,
        default:null
    },
    activated:{
        type: Boolean,
        default: false
    }
},{timestamps: true});

const User = model('User', userSchema);
export default User;