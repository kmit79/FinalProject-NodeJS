import Joi from 'joi';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_\-]).{7,20}$/;

export const registerUserValidation = (data) => {
    const schema = Joi.object({
        name: Joi.object({
            first: Joi.string().min(2).max(256).required(),
            middle: Joi.string().min(2).max(256).allow(''),
            last: Joi.string().min(2).max(256).required()
        }).required(),
        isBusiness: Joi.boolean().required(),
        phone: Joi.string().regex(/^0[0-9]{1,2}\-?\s?[0-9]{7}$/).required().messages({
            'string.pattern.base': 'phone must be a standard Israeli phone number format'
        }),
        email: Joi.string().email({ tlds: { allow: false } }).min(5).required(),
        password: Joi.string().regex(passwordRegex).required().messages({
            'string.pattern.base': 'password must be at least 7 characters long and contain uppercase, lowercase, number, and special character (!@#$%^&*_-)'
        }),
        address: Joi.object({
            state: Joi.string().allow(''),
            country: Joi.string().min(2).max(256).required(),
            city: Joi.string().min(2).max(256).required(),
            street: Joi.string().min(2).max(256).required(),
            houseNumber: Joi.number().min(1).required(),
            zip: Joi.number().allow(0, '')
        }).required(),
        image: Joi.object({
            url: Joi.string().uri().allow(''),
            alt: Joi.string().min(2).max(256).allow('')
        }).allow(null)
    });

    return schema.validate(data, { abortEarly: false });
};

export const editUserValidation = (data) => {
    const schema = Joi.object({
        name: Joi.object({
            first: Joi.string().min(2).max(256).required(),
            middle: Joi.string().min(2).max(256).allow(''),
            last: Joi.string().min(2).max(256).required()
        }).required(),
        phone: Joi.string().regex(/^0[0-9]{1,2}\-?\s?[0-9]{7}$/).required().messages({
            'string.pattern.base': 'phone must be a standard Israeli phone number format'
        }),
        address: Joi.object({
            state: Joi.string().allow(''),
            country: Joi.string().min(2).max(256).required(),
            city: Joi.string().min(2).max(256).required(),
            street: Joi.string().min(2).max(256).required(),
            houseNumber: Joi.number().min(1).required(),
            zip: Joi.number().allow(0, '')
        }).required(),
        image: Joi.object({
            url: Joi.string().uri().allow(''),
            alt: Joi.string().min(2).max(256).allow('')
        }).allow(null)
    });

    return schema.validate(data, { abortEarly: false });
};

export const loginUserValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email({ tlds: { allow: false } }).min(5).required(),
        password: Joi.string().regex(passwordRegex).required().messages({
            'string.pattern.base': 'password must be at least 7 characters long and contain uppercase, lowercase, number, and special character (!@#$%^&*_-)'
        })
    });

    return schema.validate(data, { abortEarly: false });
};

