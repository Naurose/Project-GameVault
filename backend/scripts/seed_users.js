const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedUsers = async () => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'gamevault'
        });

        console.log('Connected to database. Seeding users...');

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('123', salt); // Default password for all
        //uploading some pre-made login in the users table
        const users = [
            ['naurose', 'naurose@bracu.ac.bd', password, 'LA, California, USA', '+8801755577770'],
            ['anik', 'anik@x.com', password, 'Nevada, CA', '+15566737828'],
            ['retro', 'retro@x.com', password, 'Austin, Texas, USA', '+1555-0103']
        ];

        for (const user of users) {
             await connection.execute(
                'INSERT INTO users (username, email, password, address, phone) VALUES (?, ?, ?, ?, ?)',
                user
            );
        }

        console.log('Users seeded successfully!');

    } catch (err) {
        console.error('Error seeding users:', err);
    } finally {
        if (connection) await connection.end();
    }
};

seedUsers();
