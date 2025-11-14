const fs = require('fs');
const path = require('path');

// Read the artists.json file
const artistsPath = path.join(__dirname, 'src', 'data', 'artists.json');
// Check if file exists
if (!fs.existsSync(artistsPath)) {
  console.error('Error: artists.json not found at', artistsPath);
  process.exit(1);
}
const artists = require(artistsPath);

// Check for duplicate IDs
const idMap = new Map();
const nameMap = new Map();
const duplicates = [];

artists.forEach(artist => {
  // Check duplicate IDs
  if (idMap.has(artist.id)) {
    duplicates.push({
      type: 'ID',
      value: artist.id,
      entries: [idMap.get(artist.id), artist.name]
    });
  } else {
    idMap.set(artist.id, artist.name);
  }

  // Check duplicate names (case insensitive)
  const lowerName = artist.name.toLowerCase();
  if (nameMap.has(lowerName)) {
    duplicates.push({
      type: 'Name',
      value: artist.name,
      entries: [nameMap.get(lowerName), artist.group]
    });
  } else {
    nameMap.set(lowerName, artist.group);
  }
});

if (duplicates.length > 0) {
  console.log('\x1b[31m', 'Found duplicates:');
  console.log(JSON.stringify(duplicates, null, 2));
  process.exit(1);
} else {
  console.log('\x1b[32m', 'No duplicates found!');
  process.exit(0);
}
