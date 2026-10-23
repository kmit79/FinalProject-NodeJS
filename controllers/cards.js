import express from 'express';
import { Card } from '../models/Card.js';
import {
    createCardValidation,
    bizNumberValidation
} from '../validation/card.validation.js';
import { authGuard, businessGuard, adminGuard } from '../middlewares/guard.js';
import { generateUniqueBizNumber } from '../services/bizNumber.service.js';

const router = express.Router();

// 1. Get all cards - GET /cards (all)
router.get('/', async (req, res, next) => {
    try {
        const cards = await Card.find();
        return res.send(cards);
    } catch (err) {
        next(err);
    }
});

// 2. Get user's own cards - GET /cards/my-cards (registered user)
// NOTE: Must be registered before /:id route so 'my-cards' isn't treated as an ID
router.get('/my-cards', authGuard, async (req, res, next) => {
    try {
        const cards = await Card.find({ user_id: req.user._id });
        return res.send(cards);
    } catch (err) {
        next(err);
    }
});

// 3. Get single card - GET /cards/:id (all)
router.get('/:id', async (req, res, next) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).send({ message: 'Card not found.' });
        }
        return res.send(card);
    } catch (err) {
        next(err);
    }
});

// 4. Create card - POST /cards (Business user)
router.post('/', businessGuard, async (req, res, next) => {
    try {
        const { error } = createCardValidation(req.body);
        if (error) {
            return res.status(400).send({ message: error.details.map(d => d.message).join(', ') });
        }

        let bizNumber = req.body.bizNumber;
        if (bizNumber) {
            const existingBiz = await Card.findOne({ bizNumber });
            if (existingBiz) {
                return res.status(400).send({ message: 'bizNumber is already in use by another card.' });
            }
        } else {
            bizNumber = await generateUniqueBizNumber();
        }

        const newCard = new Card({
            title: req.body.title,
            subtitle: req.body.subtitle,
            description: req.body.description,
            phone: req.body.phone,
            email: req.body.email,
            web: req.body.web || '',
            image: req.body.image?.url ? req.body.image : undefined,
            address: req.body.address,
            bizNumber,
            user_id: req.user._id,
            likes: []
        });

        await newCard.save();
        return res.status(201).send(newCard);
    } catch (err) {
        next(err);
    }
});

// 5. Edit card - PUT /cards/:id (The user who created the card)
router.put('/:id', authGuard, async (req, res, next) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).send({ message: 'Card not found.' });
        }

        if (card.user_id.toString() !== req.user._id && !req.user.isAdmin) {
            return res.status(403).send({ message: 'Access denied. Only the card creator can edit this card.' });
        }

        const { error } = createCardValidation(req.body);
        if (error) {
            return res.status(400).send({ message: error.details.map(d => d.message).join(', ') });
        }

        card.title = req.body.title;
        card.subtitle = req.body.subtitle;
        card.description = req.body.description;
        card.phone = req.body.phone;
        card.email = req.body.email;
        card.web = req.body.web || '';
        if (req.body.image) card.image = req.body.image;
        card.address = req.body.address;

        await card.save();
        return res.send(card);
    } catch (err) {
        next(err);
    }
});

// 6. Like card - PATCH /cards/:id (A registered user)
router.patch('/:id', authGuard, async (req, res, next) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).send({ message: 'Card not found.' });
        }

        const userIdStr = req.user._id;
        const index = card.likes.findIndex(id => id.toString() === userIdStr);

        if (index === -1) {
            card.likes.push(userIdStr);
        } else {
            card.likes.splice(index, 1);
        }

        await card.save();
        return res.send(card);
    } catch (err) {
        next(err);
    }
});

// Bonus 1: Admin change bizNumber - PATCH /cards/biz-number/:id (Admin only)
router.patch('/biz-number/:id', adminGuard, async (req, res, next) => {
    try {
        const { error } = bizNumberValidation(req.body);
        if (error) {
            return res.status(400).send({ message: error.details.map(d => d.message).join(', ') });
        }

        const { bizNumber } = req.body;
        const existingCard = await Card.findOne({ bizNumber, _id: { $ne: req.params.id } });
        if (existingCard) {
            return res.status(400).send({ message: 'bizNumber is already in use by another card.' });
        }

        const card = await Card.findByIdAndUpdate(
            req.params.id,
            { bizNumber },
            { new: true }
        );

        if (!card) {
            return res.status(404).send({ message: 'Card not found.' });
        }

        return res.send(card);
    } catch (err) {
        next(err);
    }
});

// 7. Delete card - DELETE /cards/:id (The user who created the card or admin)
router.delete('/:id', authGuard, async (req, res, next) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).send({ message: 'Card not found.' });
        }

        if (card.user_id.toString() !== req.user._id && !req.user.isAdmin) {
            return res.status(403).send({ message: 'Access denied. Only the card creator or an admin can delete this card.' });
        }

        const deletedCard = await Card.findByIdAndDelete(req.params.id);
        return res.send(deletedCard);
    } catch (err) {
        next(err);
    }
});

export default router;

