import express from 'express';
import { User } from '../models/User.js';
import { editUserValidation } from '../validation/user.validation.js';
import { authGuard, adminGuard } from '../middlewares/guard.js';
import { registerUserHandler, loginUserHandler } from '../services/user.service.js';

const router = express.Router();

// 1. Register user - POST /users (all)
router.post('/', registerUserHandler);

// 2. Login - POST /users/login (all)
router.post('/login', loginUserHandler);

// 3. Get all users - GET /users (admin)
router.get('/', adminGuard, async (req, res, next) => {
    try {
        const users = await User.find().select('-password -loginAttempts -lockUntil');
        return res.send(users);
    } catch (err) {
        next(err);
    }
});

// 4. Get user - GET /users/:id (registered user or admin)
router.get('/:id', authGuard, async (req, res, next) => {
    try {
        if (req.user._id !== req.params.id && !req.user.isAdmin) {
            return res.status(403).send({ message: 'Access denied. You can only view your own user info or be an admin.' });
        }

        const user = await User.findById(req.params.id).select('-password -loginAttempts -lockUntil');
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        return res.send(user);
    } catch (err) {
        next(err);
    }
});

// 5. Edit user - PUT /users/:id (registered user)
router.put('/:id', authGuard, async (req, res, next) => {
    try {
        if (req.user._id !== req.params.id) {
            return res.status(403).send({ message: 'Access denied. You can only edit your own user info.' });
        }

        const { error } = editUserValidation(req.body);
        if (error) {
            return res.status(400).send({ message: error.details.map(d => d.message).join(', ') });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                phone: req.body.phone,
                address: req.body.address,
                ...(req.body.image ? { image: req.body.image } : {})
            },
            { new: true, runValidators: true }
        ).select('-password -loginAttempts -lockUntil');

        if (!updatedUser) {
            return res.status(404).send({ message: 'User not found.' });
        }

        return res.send(updatedUser);
    } catch (err) {
        next(err);
    }
});

// 6. Change isBusiness status - PATCH /users/:id (registered user)
router.patch('/:id', authGuard, async (req, res, next) => {
    try {
        if (req.user._id !== req.params.id) {
            return res.status(403).send({ message: 'Access denied. You can only change your own business status.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        user.isBusiness = !user.isBusiness;
        await user.save();

        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.loginAttempts;
        delete userObj.lockUntil;

        return res.send(userObj);
    } catch (err) {
        next(err);
    }
});

// 7. Delete user - DELETE /users/:id (registered user or admin)
router.delete('/:id', authGuard, async (req, res, next) => {
    try {
        if (req.user._id !== req.params.id && !req.user.isAdmin) {
            return res.status(403).send({ message: 'Access denied. You can only delete your own account or be an admin.' });
        }

        const deletedUser = await User.findByIdAndDelete(req.params.id).select('-password -loginAttempts -lockUntil');
        if (!deletedUser) {
            return res.status(404).send({ message: 'User not found.' });
        }

        return res.send(deletedUser);
    } catch (err) {
        next(err);
    }
});

export default router;

