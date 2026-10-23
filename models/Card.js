import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
    url: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2016/04/20/08/21/entrepreneur-1340649_960_720.jpg',
        trim: true
    },
    alt: {
        type: String,
        default: 'business card image',
        trim: true
    }
}, { _id: true });

const AddressSchema = new mongoose.Schema({
    state: { type: String, default: 'not defined', trim: true },
    country: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    houseNumber: { type: Number, required: true, min: 1 },
    zip: { type: Number, default: 0 }
}, { _id: true });

const CardSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 256 },
    subtitle: { type: String, required: true, trim: true, minlength: 2, maxlength: 256 },
    description: { type: String, required: true, trim: true, minlength: 2, maxlength: 1024 },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    web: { type: String, default: '', trim: true },
    image: { type: ImageSchema, default: () => ({}) },
    address: { type: AddressSchema, required: true },
    bizNumber: { type: Number, required: true, unique: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    versionKey: '__v'
});

export const Card = mongoose.model('Card', CardSchema);

