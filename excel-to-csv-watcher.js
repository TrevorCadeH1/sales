const fs = require('fs');
const XLSX = require('xlsx');

const excelPath = './path/to/your/file.xlsx'; // <-- UPDATE THIS PATH
const csvPath = './public/WBSC Grass Weekly avg by rep.csv'; // <-- UPDATE IF NEEDED

fs.watchFile(excelPath, (curr, prev) => {
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
  fs.writeFileSync(csvPath, csv);
  console.log('Excel file updated and CSV regenerated!');
});

console.log('Watching for changes to', excelPath);
