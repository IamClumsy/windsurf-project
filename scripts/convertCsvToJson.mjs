import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample data - in a real scenario, you would read this from a file
const csvData = `Name,Group,Rank,Position,Genre,Skill 1,Skill 2,Skill 3,Micks Thoughts are they Good,Skill Build Worthy
Kokoro,Tokyo48,SSR,Center,Electronic,10 sec/1800 Damage,20% Skill Damage,50% Basic Attack Damage,Yes,Yes
Everly,DreamCatcher,SSR,Center,Electronic,10 sec/1800 Damage,12% Reduction Normal Attack Damage,12% Skill Damage Reduction,Yes,No
Alice,Fantasy Vibes,SSR,Vocalist,Electronic,10 sec/1800 Damage,20% Skill Damage,50% Basic Attack Damage,Yes,Yes
Cindy,No Group,SSR,Center,Electronic,10 sec/1800 Damage,15% Reduction Normal Attack Damage,20% Skill Damage,Yes,Yes
Longkui,No Group,SSR,Center,Electronic,10 sec/1800 Damage,30% Skill Damage,30% Damage to Player,YES,Yes
Anya,No Group,SSR,Center,Electronic,10 sec/1800 Damage,"180/DPS Attacking Group Center, Club, Landmark",10% Fan Capacity,BAD,No
Sari,Coral,SSR,Vocalist,Electronic,10 sec/1800 Damage,10% Rally Fan Capacity,20% Damage to Player,Yes,Yes
Natassaja,No Group,SSR,Vocalist,Electronic,10 sec/1800 Damage,10% Rally Fan Capacity,20% Damage to Player,Yes,Yes
Caroline,Fantasy Vibes,SSR VIP,Dancer,Electronic,10 sec/1800 Damage,20% Skill Damage,10% Fan Capacity,If Nothing Better,No
Audrey,WildFlower,SSR,Center,Hip Hop,10 sec/1800 Damage,30% Damage World Building Guard,12% Skill Damage Reduction,If Nothing Better,No
Avery,Luna,SSR,Dancer,Hip Hop,10 sec/1800 Damage,12% Reduce Skill Damage Taken,12% Reduction Normal Attack Damage,Yes,No
Ayaka,Tokyo48,SSR,Vocalist,Hip Hop,10 sec/1800 Damage,12% Reduction Normal Attack Damage,12% Skill Damage Reduction,"Defensive Car, Reverse Vocalist",No
Bella,Luna,SSR VIP,Vocalist,Hip Hop,10 sec/1800 Damage,20% Skill Damage,10% Fan Capacity,If Nothing Better,No
Chizuru,Tokyo48,SSR,Center,Pop,10 sec/1800 Damage,10% Rally Fan Capacity,20% Damage to Player,Yes,No
Aurora,Sparkle Artists,SSR,Center,Pop,10 sec/1800 Damage,50% Basic Attack Damage,20% Skill Damage,Yes,Yes
Savannah,Echo,SSR,Dancer,Pop,10 sec/1800 Damage,180/DPS Attacking Enemy Company,10% Fan Capacity,No,No
Brooklyn,Echo,SSR,Vocalist,Pop,10 sec/1800 Damage,"200/DPS Defending HQ, GH, Club, LM",30% Damage Increase World Building Guard,NO,No
Monica,No Group,SSR,Center,Pop,10 sec/1800 Damage,30% Damage to Player,30% Damage to Player,YES,No
Moana,Coral,SSR,Vocalist,Pop,10 sec/1800 Damage,12% Reduction Normal Attack Damage,12% Skill Damage Reduction,"Defensive Car, Reverse Vocalist",No
Zendaya,Radiance,SSR,Center,R&B,10 sec/1800 Damage,20% Damage WG / 50% Drive Speed,50% Basic Attack Damage,If Nothing Better,No
Nova,DreamCatcher,SSR,Dancer,R&B,10 sec/1800 Damage,"200/DPS Defending HQ, GH, Club, LM",50% Basic Attack Damage,If Nothing Better,No
Julia,Radiance,SSR,Vocalist,R&B,10 sec/1800 Damage,20% Skill Damage,75% Drive Speed,If Nothing Better,No
Sora,Tokyo48,SSR,Vocalist,R&B,10 sec/1800 Damage,50% Basic Attack Damage,10% Fan Capacity,If Nothing Better,No
Kesnia,No Group,SSR,Vocalist,R&B,10 sec/1800 Damage,40% Gold Brick Gathering Speed,40% Gold Brick Gathering Speed,BAD,No
Ratih,Coral,SSR,Dancer,R&B,10 sec/1800 Damage,12% Reduction Normal Attack Damage,50% Basic Attack Damage,Yes,No
Claire,Sparkle Artists,SSR,Center,Rock,10 sec/1800 Damage,20% Skill Damage,50% Basic Attack Damage,Yes,Yes
Paisley,Neon,SSR,Dancer,Rock,10 sec/1800 Damage,12% Reduction Normal Attack Damage,12% Skill Damage Reduction,Yes,Yes
Yuuko,Tokyo48,SSR,Dancer,Rock,10 sec/1800 Damage,12% Reduction Normal Attack Damage,50% Basic Attack Damage,Yes,Yes
Skylar,Neon,SSR,Vocalist,Rock,10 sec/1800 Damage,30% Damage World Building Guard,20% Skill Damage,If Nothing Better,No
Kesha,No Group,SSR,Dancer,Rock,10 sec/1800 Damage,60% Basic Attack Damage Increase,24% Damage to Player,YES,Yes
Talia,Coral,SSR,Center,Rock,10 sec/1800 Damage,50% Basic Attack Damage,10% Fan Capacity,If Nothing Better,No
Leilani,Coral,SSR,Dancer,Rock,10 sec/1800 Damage,20% Skill Damage,50% Basic Attack Damage,"Offensive Car, Reverse Dancer",Yes
Alexandra,No Group,UR,Center,Pop,10 sec/1800 Damage,20% Skill Damage,50% Basic Attack Damage,Yes,No
Anastasia,No Group,UR,Dancer,Pop,10 sec/1800 Damage,12% Reduce Skill Damage Taken,12% Reduction Normal Attack Damage,Yes,No
Josephine,No Group,UR,Vocalist,Hip Hop,10 sec/1800 Damage,50% Basic Attack Damage,20% Skill Damage,Yes,No
Beatrice,No Group,UR,Center,Hip Hop,10 sec/1800 Damage,10% Fan Capacity,20% Damage to Player,If Nothing Better,No
Isadora,No Group,UR,Center,Electronic,10 sec/1800 Damage,12% Reduction Normal Attack Damage,12% Skill Damage Reduction,Yes,No
Marguerite,No Group,UR,Vocalist,R&B,10 sec/1800 Damage,20% Skill Damage,50% Basic Attack Damage,Yes,No
Elizabeth,No Group,UR,Dancer,R&B,10 sec/1800 Damage,50% Basic Attack Damage,20% Damage to Player,YES,No
Gabriella,No Group,UR,Vocalist,Rock,10 sec/1800 Damage,20% Skill Damage,20% Damage to Player,YES,No
Genevieve,No Group,UR,Dancer,Rock,10 sec/1800 Damage,12% Reduce Skill Damage Taken,12% Reduction Normal Attack Damage,Yes,No
Bunga,No Group,UR Bali,Center,Rock,10 sec/1800 Damage,20% Damage to Player,10% Fan Capacity,Yes,No
Ayuni,No Group,UR Bali,Vocalist,R&B,10 sec/1800 Damage,20% Damage to Player,10% Fan Capacity,Yes,No
Putri,No Group,UR Bali,Dancer,Pop,10 sec/1800 Damage,20% Damage to Player,10% Fan Capacity,Yes,No`;

// Parse the CSV data
const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true
});

// Process the data to match the application's structure
const processedData = records.map((row, index) => {
  // Create skills array from Skill 1, 2, 3
  const skills = [
    row['Skill 1'],
    row['Skill 2'],
    row['Skill 3']
  ].filter(Boolean); // Remove empty skills

  // Map thoughts to a more structured format
  const thoughts = row['Micks Thoughts are they Good'] || '';
  const isGood = /yes/i.test(thoughts) ? 'Yes' : 
                /no/i.test(thoughts) ? 'No' : 
                /if nothing better/i.test(thoughts) ? 'If Nothing Better' : 
                /bad/i.test(thoughts) ? 'Bad' : 
                thoughts;

  return {
    id: index + 1,
    name: row['Name'],
    group: row['Group'],
    rank: row['Rank'],
    position: row['Position'],
    genre: row['Genre'],
    skills: skills,
    description: `${row['Name']} is a talented ${row['Position']} from ${row['Group']}.`,
    rating: null,
    image: `https://via.placeholder.com/200x200?text=${row['Name'].charAt(0)}`,
    thoughts: isGood,
    build: row['Skill Build Worthy'] === 'Yes' ? 'Skill Build' : 'Standard Build'
  };
});

// Write to file
const outputPath = path.join(__dirname, '../src/data/artists.json');
fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));

console.log(`Successfully converted ${processedData.length} artists to JSON format.`);
console.log(`Output written to: ${outputPath}`);
