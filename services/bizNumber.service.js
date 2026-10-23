import { Card } from '../models/Card.js';

export const generateUniqueBizNumber = async () => {
    while (true) {
        const randomNum = Math.floor(1000000 + Math.random() * 9000000);
        const existingCard = await Card.findOne({ bizNumber: randomNum });
        if (!existingCard) {
            return randomNum;
        }
    }
};

