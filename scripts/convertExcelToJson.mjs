import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the Excel file
const excelFilePath = path.join(__dirname, '../artists-and-records-1.8.xlsx');

// Read the Excel file
const workbook = xlsx.readFile(excelFilePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = xlsx.utils.sheet_to_json(worksheet);

// Process the data to match our application's structure
const processedData = data.map((row, index) => {
  // Create skills array from Skill 1, 2, 3
  const skills = [
    row['Skill 1'],
    row['Skill 2'],
    row['Skill 3']
  ].filter(Boolean); // Remove empty skills

  return {
    id: index + 1,
    name: row['Name'] || 'Unknown Artist',
    group: row['Group'] || '',
    rank: row['Rank'] || 0,
    position: row['Position'] || '',
    genre: row['Genre'] || 'Various',
    skills: skills,
    description: row['Micks Thoughts'] || `A talented ${row['Position'] || 'artist'} from ${row['Group'] || 'various groups'}.`,
    // Calculate a rating based on rank (assuming lower rank is better)
    rating: row['Rank'] ? Math.max(1, 5 - (row['Rank'] * 0.5)) : 3.5,
    // Generate a placeholder image with the artist's name
    image: `https://via.placeholder.com/200x200?text=${encodeURIComponent((row['Name'] || 'Artist').charAt(0))}`
  };
});

// Sort by rank (lower rank first)
processedData.sort((a, b) => (a.rank || 999) - (b.rank || 999));

// Write to a JSON file
const outputPath = path.join(__dirname, '../src/data/artists.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));

console.log(`Successfully converted Excel data to JSON. Output saved to: ${outputPath}`);
console.log(`Processed ${processedData.length} artists.`);
