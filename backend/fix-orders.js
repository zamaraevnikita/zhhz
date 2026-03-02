const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dev.sqlite');

const oldUrl = 'photo-1518930255481-69766465d3d4';
const newUrl = 'photo-1518199266791-5375a83190b7';

db.all('SELECT id, items FROM `Order`', (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  let updated = 0;
  let remaining = 0;
  for (const row of rows) {
    if (row.items && row.items.includes(oldUrl)) {
      remaining++;
      const fixed = row.items.replace(new RegExp(oldUrl, 'g'), newUrl);
      db.run('UPDATE `Order` SET items = ? WHERE id = ?', [fixed, row.id], (err) => {
        if (err) console.error(err);
        else updated++;

        if (--remaining === 0) console.log('Fixed ' + updated + ' orders in dev.sqlite');
      });
    }
  }
  if (remaining === 0) console.log('dev.sqlite: No orders needed fixing');
});
