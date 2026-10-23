import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
    url: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299805_960_720.png',
        trim: true
    },
    alt: {
        type: String,
        default: 'business card image',
        trim: true
    }
}, { _id: true });

const NameSchema = new mongoose.Schema({
    first: { type: String, required: true, trim: true, minlength: 2, maxlength: 256 },
    middle: { type: String, default: '', trim: true },
    last: { type: String, required: true, trim: true, minlength: 2, maxlength: 256 }
}, { _id: true });

const AddressSchema = new mongoose.Schema({
    state: { type: String, default: 'not defined', trim: true },
    country: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    houseNumber: { type: Number, required: true, min: 1 },
    zip: { type: Number, default: 0 }
}, { _id: true });

const UserSchema = new mongoose.Schema({
    name: { type: NameSchema, required: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    image: { type: ImageSchema, default: () => ({}) },
    address: { type: AddressSchema, required: true },
    isAdmin: { type: Boolean, default: false },
    isBusiness: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    versionKey: '__v'
});

export const User = mongoose.model('User', UserSchema);

