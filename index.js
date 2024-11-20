
import express from 'express';
import User from './user.js';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import cors from 'cors';
import validate from 'validator';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
const app = express();
dotenv.config();
const port = process.env.PORT || 5001;

// MIDDLEWARES
app.use(express.json());
app.use(cors({
    origin:['https://one-time-password-omega.vercel.app'],
    methods:['POST','OPTIONS']
}));

// DATABASE CONNECTION
mongoose.connect(process.env.DB_URI).then(() => console.log('db connected!')).catch(() => console.log('db disconnected!'))
app.get('/', (req, res) => {
    res.send('Home!')
})

//REGISTER API ROUTES
app.post('/send-otp', async (req, res) => {
    try {
        const { email, name, phone, activated, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            res.status(400).json('user already exists!')
        } else {
            if (!validate.isEmail(email)) {
                res.status(400).json('invalid email! or short password!')
            }
            else if (!validate.isLength(password, { min: 4, max: undefined })) {

                res.status(400).json('password is less than the allowed Length: {4}!')
            }
            else if (validate.isEmpty(name) && validate.isEmpty(email) && validate.isEmpty(password) && validate.isEmpty(phone)) {

                res.status(400).json('All fields must be filled!');
            }


            else {
                const otpassword = Math.floor(Math.random() * 10000).toString();
                let newOtpassword;
                if (otpassword.length < 4) {
                    newOtpassword = '0' + otpassword;
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const newUser = await User.create({
                        name,
                        email,
                        phone,
                        otpassword: newOtpassword,
                        password: hashedPassword,
                        activated
                    });
                    await newUser.save();
                }
                else if (otpassword.length < 3) {
                    newOtpassword = '00' + otpassword;
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const newUser = await User.create({
                        name,
                        email,
                        phone,
                        otpassword: newOtpassword,
                        password: hashedPassword,
                        activated
                    });
                    await newUser.save();
                }
                else if (otpassword.length < 2) {
                    newOtpassword = '000' + otpassword;
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const newUser = await User.create({
                        name,
                        email,
                        phone,
                        otpassword: newOtpassword,
                        password: hashedPassword,
                        activated
                    });
                    await newUser.save();
                } else {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const newUser = await User.create({
                        name,
                        email,
                        phone,
                        otpassword,
                        password: hashedPassword,
                        activated
                    });
                    await newUser.save();
                }
                const transport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'raymond.ogaraga@gmail.com',
                        pass: 'johbphbpyekfkzsu'
                    }
                })
                const mailOption = {
                    from: 'raymond.ogaraga@gmail.com',
                    to: email,
                    subject: `Email Activation Request`,
                    text: `To activate your email,kindly use this one-time password below: ${otpassword || newOtpassword}`
                }
                transport.sendMail(mailOption, (err, result) => {
                    if (err) {
                        res.status(400).json(err.message);

                    } else {
                        res.status(200).json('Email with OTP sent!')
                    }
                });
            }
        }

    } catch (error) {
        res.status(500).json(error.message);
    }
});


// ACCOUNT ACTIVATE API ROUTES
app.post('/activateAccount', async (req, res) => {
    try {
        const { otpassword } = req.body;
        const otp = await User.findOne({ otpassword });
        if (!otp) {
            res.status(404).json('OTP not found!');
        } else {
            let newActivated = true;
            await User.findOneAndUpdate({ activated: false }, { activated: newActivated }, { new: true });
            res.status(201).json('Account activated!');
        }

    } catch (error) {
        res.status(500).json(error.message);
    }
}); 

// LOGIN ROUTES
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).exec();
        if (!user || user.otpassword === null || user.activated === false) {
            return res.status(400).json('Email not found/activated!');
        } else {
            const isPasswordOk = await bcrypt.compare(password, user.password);
            if (!isPasswordOk)
                return res.status(400).json('Incorrect password!');
            res.status(200).json('Login successful!');
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
});

// home routes api
app.get('/', (req, res)=>{
    res.send('This is home route!')
});
app.listen(port, () => console.log(`server started on port ${port}`))