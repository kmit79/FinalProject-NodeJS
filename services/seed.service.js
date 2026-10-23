import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { Card } from '../models/Card.js';
import chalk from 'chalk';

export const seedInitialData = async () => {
    try {
        const demoEmails = ['regular@gmail.com', 'business@gmail.com', 'admin@gmail.com'];
        const existingUsers = await User.find({ email: { $in: demoEmails } });

        let savedRegular = existingUsers.find(u => u.email === 'regular@gmail.com');
        let savedBusiness = existingUsers.find(u => u.email === 'business@gmail.com');
        let savedAdmin = existingUsers.find(u => u.email === 'admin@gmail.com');

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('Aa1234!', salt);

        if (!savedRegular) {
            savedRegular = await new User({
                name: { first: 'John', middle: 'D', last: 'Doe' },
                phone: '050-1111111',
                email: 'regular@gmail.com',
                password,
                isBusiness: false,
                isAdmin: false,
                address: {
                    state: '',
                    country: 'Israel',
                    city: 'Tel-Aviv',
                    street: 'Rothschild',
                    houseNumber: 10,
                    zip: 61000
                },
                image: {
                    url: 'https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299805_960_720.png',
                    alt: 'Regular User Avatar'
                }
            }).save();
        }

        if (!savedBusiness) {
            savedBusiness = await new User({
                name: { first: 'Bob', middle: '', last: 'Builder' },
                phone: '050-2222222',
                email: 'business@gmail.com',
                password,
                isBusiness: true,
                isAdmin: false,
                address: {
                    state: '',
                    country: 'Israel',
                    city: 'Haifa',
                    street: 'Herzl',
                    houseNumber: 25,
                    zip: 31000
                },
                image: {
                    url: 'https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299805_960_720.png',
                    alt: 'Business User Avatar'
                }
            }).save();
        }

        if (!savedAdmin) {
            savedAdmin = await new User({
                name: { first: 'Alice', middle: 'M', last: 'Admin' },
                phone: '050-3333333',
                email: 'admin@gmail.com',
                password,
                isBusiness: true,
                isAdmin: true,
                address: {
                    state: '',
                    country: 'Israel',
                    city: 'Jerusalem',
                    street: 'Jaffa',
                    houseNumber: 1,
                    zip: 91000
                },
                image: {
                    url: 'https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299805_960_720.png',
                    alt: 'Admin User Avatar'
                }
            }).save();
        }

        const cardCount = await Card.countDocuments();
        if (cardCount === 0) {
            const card1 = new Card({
                title: 'Web Development Studio',
                subtitle: 'Full-stack Web Solutions',
                description: 'Modern and responsive websites built with cutting edge technologies for your business.',
                phone: '050-2222222',
                email: 'business@gmail.com',
                web: 'https://www.webdevstudio.com',
                address: {
                    state: 'Central',
                    country: 'Israel',
                    city: 'Tel-Aviv',
                    street: 'Dizengoff',
                    houseNumber: 100,
                    zip: 64332
                },
                bizNumber: 1000001,
                user_id: savedBusiness._id,
                likes: [savedRegular._id]
            });

            const card2 = new Card({
                title: 'Gourmet Catering Co.',
                subtitle: 'Artisanal Events & Dining',
                description: 'Unforgettable culinary experiences tailored for high-end events and celebrations.',
                phone: '052-3334444',
                email: 'catering@gourmet.co.il',
                web: 'https://www.gourmetcatering.co.il',
                address: {
                    state: '',
                    country: 'Israel',
                    city: 'Herzliya',
                    street: 'Maskit',
                    houseNumber: 12,
                    zip: 46733
                },
                bizNumber: 1000002,
                user_id: savedBusiness._id,
                likes: []
            });

            const card3 = new Card({
                title: 'Digital Marketing Pro',
                subtitle: 'SEO & Social Campaigns',
                description: 'Boost your online presence and acquire real customers through targeted advertising.',
                phone: '054-5556666',
                email: 'marketing@digitalpro.com',
                web: 'https://www.digitalpro.com',
                address: {
                    state: '',
                    country: 'Israel',
                    city: 'Ramat Gan',
                    street: 'Aba Hillel',
                    houseNumber: 7,
                    zip: 52535
                },
                bizNumber: 1000003,
                user_id: savedAdmin._id,
                likes: [savedRegular._id, savedBusiness._id]
            });

            await Card.insertMany([card1, card2, card3]);
        }
    } catch (err) {
        console.error(chalk.red('Failed to seed initial data:'), err.message);
    }
};

