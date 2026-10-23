import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { registerUserValidation, loginUserValidation } from '../validation/user.validation.js';

export const registerUserHandler = async (req, res, next) => {
    try {
        const { error } = registerUserValidation(req.body);
        if (error) {
            return res.status(400).send({ message: error.details.map(d => d.message).join(', ') });
        }

        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).send({ message: 'User already registered with this email.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            password: hashedPassword,
            image: req.body.image?.url ? req.body.image : undefined,
            address: req.body.address,
            isAdmin: Boolean(req.body.isAdmin),
            isBusiness: Boolean(req.body.isBusiness)
        });

        await newUser.save();

        const userResponse = newUser.toObject();
        delete userResponse.password;
        delete userResponse.loginAttempts;
        delete userResponse.lockUntil;

        return res.status(201).send(userResponse);
    } catch (err) {
        next(err);
    }
};

export const loginUserHandler = async (req, res, next) => {
    try {
        const { error } = loginUserValidation(req.body);
        if (error) {
            return res.status(400).send({ message: error.details.map(d => d.message).join(', ') });
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).send({ message: 'Invalid email or password.' });
        }

        if (user.lockUntil && user.lockUntil > new Date()) {
            const hoursLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / (1000 * 60 * 60));
            return res.status(403).send({
                message: `Account is temporarily locked due to 3 consecutive failed login attempts. Try again in ${hoursLeft} hours.`
            });
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            if (user.loginAttempts >= 3) {
                user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
                user.loginAttempts = 0;
            }
            await user.save();
            return res.status(400).send({ message: 'Invalid email or password.' });
        }

        if (user.loginAttempts > 0 || user.lockUntil) {
            user.loginAttempts = 0;
            user.lockUntil = null;
            await user.save();
        }

        const payload = {
            _id: user._id,
            isBusiness: user.isBusiness,
            isAdmin: user.isAdmin
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.TOKEN_EXPIRES_IN || '24h'
        });

        return res.send({ token });
    } catch (err) {
        next(err);
    }
};

