const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const uploadsDir = 'c:\\Users\\acer\\OneDrive\\Desktop\\Tatamotors_CRM\\backend\\uploads';
const files = fs.readdirSync(uploadsDir).filter(f => f.startsWith('leads_1773999')).sort();
const file = files[files.length - 1]; // most recent

console.log('Reading file:', file);
const workbook = XLSX.readFile(path.join(uploadsDir, file));
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('--- HEADERS ---');
data[0].forEach((h, i) => console.log(`${i}: [${h}]`));

console.log('--- ROW 2 (Sample Data) ---');
data[1].forEach((v, i) => console.log(`${i}: [${v}]`));
