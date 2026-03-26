import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { initDb } from './db';
import { seedDesignTemplates } from './seedTemplates';

const PORT = process.env.PORT || 4000;

const start = async () => {
    await initDb();
    await seedDesignTemplates();
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
};

start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
