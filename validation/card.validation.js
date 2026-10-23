import Joi from 'joi';

export const createCardValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(2).max(256).required(),
        subtitle: Joi.string().min(2).max(256).required(),
        description: Joi.string().min(2).max(1024).required(),
        phone: Joi.string().regex(/^0[0-9]{1,2}\-?\s?[0-9]{7}$/).required().messages({
            'string.pattern.base': 'phone must be a standard Israeli phone number format'
        }),
        email: Joi.string().email({ tlds: { allow: false } }).min(5).required(),
        web: Joi.string().uri().allow('').allow(null),
        image: Joi.object({
            url: Joi.string().uri().allow(''),
            alt: Joi.string().min(2).max(256).allow('')
        }).allow(null),
        address: Joi.object({
            state: Joi.string().allow(''),
            country: Joi.string().min(2).max(256).required(),
            city: Joi.string().min(2).max(256).required(),
            street: Joi.string().min(2).max(256).required(),
            houseNumber: Joi.number().min(1).required(),
            zip: Joi.number().allow(0, '')
        }).required(),
        bizNumber: Joi.number().min(1000000).max(9999999).allow(null)
    });

    return schema.validate(data, { abortEarly: false });
};

export const bizNumberValidation = (data) => {
    const schema = Joi.object({
        bizNumber: Joi.number().min(1000000).max(9999999).required()
    });

    return schema.validate(data, { abortEarly: false });
};

