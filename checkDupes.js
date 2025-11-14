import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to artists.json
const artistsPath = join(__dirname, 'src', 'data', 'artists.json');

// Read and parse the file
const artists = JSON.parse(readFileSync(artistsPath, 'utf-8'));

// Track duplicates
const idMap = new Map();
const nameMap = new Map();
const duplicates = [];

artists.forEach(artist => {
  // Check for duplicate IDs
  if (idMap.has(artist.id)) {
    duplicates.push({
      type: 'DUPLICATE_ID',
      id: artist.id,
      name1: idMap.get(artist.id),
      name2: artist.name
    });
  } else {
    idMap.set(artist.id, artist.name);
  }

  // Check for duplicate names (case-insensitive)
  const lowerName = artist.name.toLowerCase();
  if (nameMap.has(lowerName)) {
    duplicates.push({
      type: 'DUPLICATE_NAME',
      name: artist.name,
      group1: nameMap.get(lowerName),
      group2: artist.group
    });
  } else {
    nameMap.set(lowerName, artist.group);
  }
});

// Output results
if (duplicates.length === 0) {
  console.log('✅ No duplicate artists found!');
} else {
  console.log('❌ Found duplicates:');
  console.log(JSON.stringify(duplicates, null, 2));
  process.exit(1);
}
