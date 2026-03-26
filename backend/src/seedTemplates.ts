import { v4 as uuidv4 } from 'uuid';
import db, { run, get } from './db';

const DEFAULT_TEMPLATES = [
    {
        id: 'tmpl-lookbook-minimal',
        name: 'Минимализм',
        description: 'Один крупный кадр на страницу с большим количеством «воздуха»',
        themeId: 'lookbook',
        previewUrl: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=600&auto=format&fit=crop',
        pagePresets: [
            { layoutId: 'single_photo_center' },
            { layoutId: 'single_photo_center' }
        ]
    },
    {
        id: 'tmpl-lookbook-magazine',
        name: 'Журнал',
        description: 'Чередование крупных планов и текстовых блоков',
        themeId: 'lookbook',
        previewUrl: 'https://images.unsplash.com/photo-1531303435785-3853ba035cda?q=80&w=600&auto=format&fit=crop',
        pagePresets: [
            { layoutId: 'single_photo_center' },
            { layoutId: 'two_photos_vertical' },
            { layoutId: 'text_and_photo' }
        ]
    },
    {
        id: 'tmpl-valentine-romance',
        name: 'Романтика',
        description: 'Пастельные тона и фокус на эмоции',
        themeId: 'valentine',
        previewUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop',
        pagePresets: [
            { layoutId: 'single_photo_center', backgroundColor: '#fff1f2' },
            { layoutId: 'two_photos_horizontal', backgroundColor: '#ffe4e6' },
            { layoutId: 'single_photo_center', backgroundColor: '#fff1f2' }
        ]
    },
    {
        id: 'tmpl-kavkaz-panorama',
        name: 'Панорама',
        description: 'Широкие кадры без полей для пейзажей',
        themeId: 'kavkaz',
        previewUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600&auto=format&fit=crop',
        pagePresets: [
            { layoutId: 'full_page_photo' },
            { layoutId: 'full_page_photo' }
        ]
    }
];

export const seedDesignTemplates = async () => {
    try {
        const countRow = await get<{ count: number }>('SELECT COUNT(*) as count FROM DesignTemplate');
        if (countRow && countRow.count > 0) {
            console.log('Design templates already exist, skipping seed.');
            return;
        }

        console.log('Seeding default design templates...');
        for (const tmpl of DEFAULT_TEMPLATES) {
            await run(
                'INSERT INTO DesignTemplate (id, name, description, themeId, previewUrl, pagePresets) VALUES (?, ?, ?, ?, ?, ?)',
                [tmpl.id, tmpl.name, tmpl.description, tmpl.themeId, tmpl.previewUrl, JSON.stringify(tmpl.pagePresets)]
            );
        }
        console.log('Default design templates seeded successfully.');
    } catch (err) {
        console.error('Error seeding design templates:', err);
    }
};
