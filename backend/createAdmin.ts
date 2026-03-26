import db, { run, get } from './src/db';
import { v4 as uuidv4 } from 'uuid';

const createAdmin = async () => {
    try {
        const phone = '+admin123';
        
        let user = await get('SELECT * FROM User WHERE phone = ?', [phone]);
        
        if (!user) {
            const id = uuidv4();
            await run('INSERT INTO User (id, phone, role) VALUES (?, ?, ?)', [id, phone, 'ADMIN']);
            console.log(`Created admin user with phone ${phone} and id ${id}`);
        } else {
            await run('UPDATE User SET role = ? WHERE phone = ?', ['ADMIN', phone]);
            console.log(`Updated user ${phone} to ADMIN`);
        }
        
    } catch (e) {
        console.error(e);
    } finally {
        db.close();
    }
};

createAdmin();
