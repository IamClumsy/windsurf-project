import { useState, useEffect } from 'react';
import { FaStar, FaSearch, FaMedal, FaMicrophone, FaShoePrints, FaUserTie, FaMusic, FaDownload } from 'react-icons/fa';
import artistsData from './data/artists.json';
// File saving functionality would be implemented here in a production environment

interface Artist {
  id: number;
  name: string;
  group: string;
  genre: string;
  position: string;
  rank: string;
  rating?: number | null;
  skills: string[];
  description: string;
  image?: string;
  thoughts?: string;
  build?: string;
  photos?: string;
}

function App() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  // Skill 2 and Skill 3 independent filters
  const [selectedSkill, setSelectedSkill] = useState(''); // Skill 2
  const [selectedSkill3, setSelectedSkill3] = useState(''); // Skill 3
  const [selectedBuild, setSelectedBuild] = useState('');
  const [selectedRanking, setSelectedRanking] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState('');

  // Save artists to JSON file
  const saveArtists = async (updatedArtists: Artist[]) => {
    try {
      // In a real app, you would send this to a backend API
      // For this example, we'll just update the state
      setArtists(updatedArtists);
      
      // In a real Electron app, you could use the following:
      // await writeFile(
      //   './src/data/artists.json',
      //   JSON.stringify(updatedArtists, null, 2)
      // );
      
      console.log('Artists saved successfully!');
    } catch (error) {
      console.error('Error saving artists:', error);
    }
  };

  // Handle adding a new artist
  const handleAddArtist = (artistData: Artist) => {
    const updatedArtists = [...artists, artistData];
    saveArtists(updatedArtists);
  };

  // Load artists data on component mount
  useEffect(() => {
    try {
      // Always load from artistsData to ensure we have the latest data
      setArtists(artistsData);
      // Save to localStorage
      localStorage.setItem('apexArtists', JSON.stringify(artistsData));
    } catch (error) {
      console.error('Error loading artists:', error);
      // Fall back to initial data if there's an error
      setArtists(artistsData);
    }

    // Listen for messages from the add-artist window
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ADD_ARTIST') {
        handleAddArtist(event.data.artist);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Save to localStorage whenever artists change
  useEffect(() => {
    if (artists.length > 0) {
      try {
        localStorage.setItem('apexArtists', JSON.stringify(artists));
      } catch (error) {
        console.error('Error saving artists to localStorage:', error);
      }
    }
  }, [artists]);

  // Ensure legend width matches table width so it centers visually under the table
  useEffect(() => {
    const updateLegendWidth = () => {
      const table = document.querySelector('table');
      const legend = document.getElementById('skill-legend');
      const main = document.querySelector('main');
      if (table && legend && main) {
        const tableRect = (table as HTMLElement).getBoundingClientRect();
        const mainRect = (main as HTMLElement).getBoundingClientRect();
        const width = Math.round(tableRect.width);
        const leftOffset = Math.round(tableRect.left - mainRect.left);
        const legendEl = legend as HTMLElement;
        legendEl.style.boxSizing = 'border-box';
        legendEl.style.width = 'auto';
        // position under table
        legendEl.style.marginLeft = `${leftOffset}px`;
        // helpful debug info in console
        // eslint-disable-next-line no-console
        console.log('[legend-align] tableWidth=', width, 'leftOffset=', leftOffset);
      }
    };
    // Run after a tick to ensure layout settled
    const t = setTimeout(updateLegendWidth, 50);
    window.addEventListener('resize', updateLegendWidth);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', updateLegendWidth);
    };
  }, [artists]);

  // Get unique values for filters
  const rankOptions = [...new Set(artists.map(artist => artist.rank))];
  const roles = [...new Set(artists.map(artist => artist.position))];
  const genres = [...new Set(artists.map(artist => artist.genre))];
  const allSkills = [...new Set(artists.map(artist => artist.skills[1]).filter(Boolean))]; // Only Skill 2
  const skills = allSkills; // Alias for backward compatibility
  const allSkills3 = [...new Set(artists.map(artist => artist.skills[2]).filter(Boolean))]; // Only Skill 3
  // Group skills for dropdown headers
  const isGoodBuff = (skill: string) => {
    const t = (skill || '').toLowerCase();
    // Exclude 60% basic attack damage (moved to BEST)
    if (t.includes('60%') && t.includes('basic attack damage')) return false;
    return t.includes('skill damage') || t.includes('basic attack damage') || t.includes('basic damage');
  };
  const isTerribleSkill = (skill: string) => {
    const t = (skill || '').toLowerCase();
    // Exclude damage-dealing skills like "10 sec/1800 Damage"
    const isDamageSkill = t.includes('damage') && (t.includes('sec/') || /\d+\s*damage/.test(t));
    if (isDamageSkill) return false;
    
    // Exclude 200/DPS defending buildings (HQ, GH, Club, LM)
    const is200DpsDefending = t.includes('200/dps') && (t.includes('defending') || t.includes('hq') || t.includes('gh') || t.includes('club') || t.includes('lm'));
    if (is200DpsDefending) return false;
    
    return t.includes('180/dps') || t.includes('200/dps') || 
           t.includes('world building guard') || t.includes('damage wg') ||
           (t.includes('10 sec') && !t.includes('sec/')) || t.includes('10/sec') ||
           t.includes('driving speed');
  };
  const isWorstSkill = (skill: string) => {
    const t = (skill || '').toLowerCase();
    return !isTerribleSkill(skill) && (
      t.includes('gold brick gathering') ||
      (t.includes('fan capacity') && !t.includes('10% rally fan capacity'))
    );
  };
  const isDirectDamage = (skill: string) => {
    const t = (skill || '').toLowerCase();
    // Include 60% basic attack damage as BEST
    if (t.includes('60%') && t.includes('basic attack damage')) return true;
    // Direct damage: time-based or explicit damage that isn't a reduction/taken modifier and not the Good buffs
    const mentionsDamage = t.includes('damage') && !t.includes('reduc') && !t.includes('taken');
    const timeBased = t.includes(' sec/') || /\bsec\b/.test(t);
    return (mentionsDamage || timeBased) && !isGoodBuff(skill) && !isWorstSkill(skill) && !isTerribleSkill(skill);
  };
  const terribleSkills = skills.filter(isTerribleSkill);
  const worstSkills = skills.filter(isWorstSkill);
  const bestSkills = skills.filter(isDirectDamage);
  const goodSkills = skills.filter(isGoodBuff);
  const okaySkills = skills.filter(s => !bestSkills.includes(s) && !goodSkills.includes(s) && !worstSkills.includes(s) && !terribleSkills.includes(s));
  
  // Skill 3 categorization
  const terribleSkills3 = allSkills3.filter(isTerribleSkill);
  const worstSkills3 = allSkills3.filter(isWorstSkill);
  const bestSkills3 = allSkills3.filter(isDirectDamage);
  const goodSkills3 = allSkills3.filter(isGoodBuff);
  const okaySkills3 = allSkills3.filter(s => !bestSkills3.includes(s) && !goodSkills3.includes(s) && !worstSkills3.includes(s) && !terribleSkills3.includes(s));
  
  // Calculate artist points: Best=10, Good=6, Okay=3, Worst=0, Terrible=-1
  // Skip skill 1 (index 0) when calculating ranking
  const calculateArtistPoints = (artist: Artist) => {
    let points = 0;
    artist.skills.forEach((skill, index) => {
      if (!skill || index === 0) return; // Skip skill 1
      
      // Use appropriate skill arrays based on index
      const isBest = index === 1 ? bestSkills.includes(skill) : bestSkills3.includes(skill);
      const isGood = index === 1 ? goodSkills.includes(skill) : goodSkills3.includes(skill);
      const isOkay = index === 1 ? okaySkills.includes(skill) : okaySkills3.includes(skill);
      const isWorst = index === 1 ? worstSkills.includes(skill) : worstSkills3.includes(skill);
      const isTerrible = index === 1 ? terribleSkills.includes(skill) : terribleSkills3.includes(skill);
      
      if (isBest) points += 10;
      else if (isGood) points += 6;
      else if (isOkay) points += 3;
      else if (isWorst) points += 0;
      else if (isTerrible) points += -1;
    });
    return points;
  };
  
  // Convert points to letter grade: 14+=S, 10-13=A, 5-9=B, 0-4=C, -1=F
  const getLetterGrade = (points: number) => {
    if (points >= 14) return 'S';
    if (points >= 10) return 'A';
    if (points >= 5) return 'B';
    if (points >= 0) return 'C';
    return 'F';
  };
  
  const buildOptions = [...new Set(artists.map(artist => artist.build).filter(Boolean))];
  const photosOptions = [...new Set(artists.map(artist => artist.photos).filter(Boolean))];

  // Filter artists
  const filteredArtists = artists.filter((artist: Artist) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      artist.name.toLowerCase().includes(searchLower) ||
      artist.group?.toLowerCase().includes(searchLower) ||
      artist.skills.some((skill: string) => skill && skill.toLowerCase().includes(searchLower));
    
    const matchesRank = selectedRank === '' || artist.rank === selectedRank;
    const matchesRole = selectedRole === '' || artist.position === selectedRole;
    const matchesGenre = selectedGenre === '' || artist.genre === selectedGenre;
    const matchesSkill = selectedSkill === '' || artist.skills[1] === selectedSkill; // Skill 2 filter
    const matchesSkill3 = selectedSkill3 === '' || artist.skills[2] === selectedSkill3; // Skill 3 filter
    const matchesBuild = selectedBuild === '' || 
      (artist.build && artist.build.toLowerCase().includes(selectedBuild.toLowerCase()));
    const matchesRanking = selectedRanking === '' || 
      getLetterGrade(calculateArtistPoints(artist)) === selectedRanking;
    const matchesPhotos = selectedPhotos === '' || artist.photos === selectedPhotos;
    
    return matchesSearch && matchesRank && matchesRole && matchesGenre && matchesSkill && matchesSkill3 && matchesBuild && matchesRanking && matchesPhotos;
  }).sort((a, b) => {
    const aIsUR = a.rank.startsWith('UR');
    const bIsUR = b.rank.startsWith('UR');
    if (aIsUR !== bIsUR) return aIsUR ? 1 : -1; // push UR ranks to bottom
    const genreCompare = a.genre.localeCompare(b.genre);
    if (genreCompare !== 0) return genreCompare;
    const roleCompare = a.position.localeCompare(b.position);
    if (roleCompare !== 0) return roleCompare;
    return a.name.localeCompare(b.name);
  });

  // Function to get skill badge class
  const getSkillClass = (skill: string) => {
    if (!skill) return 'bg-blue-500 text-white';
    const trimmed = skill.trim();
    if (trimmed.toLowerCase().includes('damage to player')) return 'damage-to-player bg-gradient-to-r from-slate-600 to-slate-700 shadow-lg';
    if (trimmed === '60% Basic Attack Damage') return 'basic-attack-60 bg-gradient-to-r from-slate-600 to-slate-700 shadow-lg';
    if (trimmed === '50% Basic Attack Damage') return 'basic-attack-50 bg-gradient-to-r from-slate-700 to-slate-800 shadow-sm';
    if (trimmed.includes('Gold Brick')) return 'bg-gradient-to-r from-slate-600 to-slate-700 text-orange-500 border border-slate-500/40 gold-text';
    if (trimmed.includes('Reduction Basic Attack Damage')) return 'bg-gradient-to-r from-slate-600 to-slate-700 text-blue-500 border border-slate-500/40';
    if ([
      '180/DPS Attacking Group Center, Club, Landmark',
      '30% Damage World Building Guard',
      '180/DPS Attacking Enemy Company',
      '20% Damage WG / 50% Drive Speed',
      '75% Drive Speed'
    ].includes(trimmed)) return 'skill-specific-terrible bg-gradient-to-r from-slate-600 to-slate-700 shadow-sm border border-red-500/40';
    if ([
      '20% Skill Damage',
      '30% Skill Damage',
      '12% Skill Damage Reduction'
    ].includes(trimmed)) {
      return trimmed === '20% Skill Damage' || trimmed === '30% Skill Damage'
        ? 'skill-damage-20 bg-gradient-to-r from-emerald-400 to-green-600 shadow-sm'
        : 'skill-good bg-gradient-to-r from-teal-400 to-cyan-600 shadow-sm';
    }
    return 'bg-gradient-to-r from-slate-600 to-slate-700 text-slate-100 border border-slate-500/40';
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white flex flex-col items-center">
      <div className="w-full flex flex-col items-center py-8 text-white gap-8">
      
      {/* Page Title */}
      <header className="flex flex-col items-center gap-4 app-header">
        <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-[0_0_25px_rgba(236,72,153,0.6)] tracking-tight text-center bg-gradient-to-r from-pink-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent animate-pulse" style={{ color: '#ffffff' }}>Mick's Awesome SSR Artist Helper</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              console.log('Add Artist button clicked');
              (window as any).__artistData = {
                roles: roles,
                genres: genres,
                allSkills: skills,
                nextId: Math.max(0, ...artists.map(a => a.id)) + 1
              };
              window.open('/add-artist.html', 'AddArtistModal', 'width=500,height=700,resizable=yes,scrollbars=yes');
            }}
            className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 transform"
            title="Add New Artist"
          >
            <FaMusic size={24} />
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                const dataStr = JSON.stringify(artists, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'artist-and-records-1.9.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log('Exported artist-and-records-1.9.json');
              } catch (err) {
                console.error('Failed to export artists', err);
              }
            }}
            className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 transform"
            title="Download artist-and-records-1.9.json"
          >
            <FaDownload size={22} />
          </button>
        </div>
      </header>
      
      {/* Search Filter */}
      <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4">
        <div className="relative w-full group">
          <input
            type="text"
            placeholder="Search artists..."
            className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border-2 border-amber-500/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all duration-200 text-center hover:border-pink-400/60 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute right-3 top-3 text-amber-400 group-hover:text-pink-400 transition-colors duration-200" />
        </div>
      </div>

      {/* Main Content */}
      <main className="w-fit flex flex-col items-center bg-gradient-to-br from-violet-700/90 via-fuchsia-700/85 to-pink-600/90 rounded-2xl text-white shadow-[0_0_40px_rgba(219,39,119,0.5)] border-2 border-pink-400/50 backdrop-blur-md ring-2 ring-fuchsia-400/40 hover:shadow-[0_0_60px_rgba(219,39,119,0.7)] transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="table-auto table-force-white table-with-spacing italic">
            <thead className="bg-gray-800/95 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
              {/* Filter row */}
              <tr className="align-middle bg-gradient-to-r from-violet-800/70 via-fuchsia-800/70 to-pink-700/70">
                <th className="px-2 py-2"></th>
                <th className="px-2 py-2">
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full px-2 py-1 rounded-md bg-violet-900/60 border border-fuchsia-400/50 text-white text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70 cursor-pointer hover:border-pink-300/70 hover:bg-violet-800/60 transition-colors not-italic"
                  >
                    <option value="">Select Genre</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </th>
                <th className="px-2 py-2">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-2 py-1 rounded-md bg-violet-900/60 border border-fuchsia-400/50 text-white text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70 cursor-pointer hover:border-pink-300/70 hover:bg-violet-800/60 transition-colors not-italic"
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </th>
                <th className="px-2 py-2">
                  <select
                    value={selectedRank}
                    onChange={(e) => setSelectedRank(e.target.value)}
                    className="w-full px-2 py-1 rounded-md bg-violet-900/60 border border-fuchsia-400/50 text-white text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70 cursor-pointer hover:border-pink-300/70 hover:bg-violet-800/60 transition-colors not-italic"
                  >
                    <option value="">Select Rank</option>
                    {rankOptions.map(rank => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </th>
                <th className="px-2 py-2">
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full px-2 py-1 rounded-md bg-violet-900/60 border border-fuchsia-400/50 text-white text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70 cursor-pointer hover:border-pink-300/70 hover:bg-violet-800/60 transition-colors not-italic"
                  >
                    <option value="">Select Skill 2</option>
                    <optgroup label="Best">
                      {bestSkills.map(skill => (
                        <option key={`s2-best-${skill}`} value={skill}>{skill}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Good">
                      {goodSkills.map(skill => (
                        <option key={`s2-good-${skill}`} value={skill}>{skill}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Okay">
                      {okaySkills.map(skill => (
                        <option key={`s2-okay-${skill}`} value={skill}>{skill}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Worst">
                      {worstSkills.map(skill => (
                        <option key={`s2-worst-${skill}`} value={skill}>{skill}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Terrible">
                      {terribleSkills.map(skill => (
                        <option key={`s2-terrible-${skill}`} value={skill}>{skill}</option>
                      ))}
                    </optgroup>
                  </select>
                </th>
                <th className="px-6 py-2">
                  <select
                    value={selectedSkill3}
                    onChange={(e) => setSelectedSkill3(e.target.value)}
                    className="w-full px-2 py-1 rounded-md bg-violet-900/60 border border-fuchsia-400/50 text-white text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70 cursor-pointer hover:border-pink-300/70 hover:bg-violet-800/60 transition-colors not-italic"
                  >
                    <option value="">Select Skill 3</option>
                    <optgroup label="Best">
                      {bestSkills3.map(skill => (
                        <option key={`s3-best-${skill}`} value={skill}>{skill}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Good">
                      {goodSkills3.map(skill => (
                        <option key={`s3-good-${skill}`} value={skill}>{skill}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Okay">
                      {okaySkills3.map(skill => (
                        <option key={`s3-okay-${skill}`} value={skill}>{skill}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Worst">
                      {worstSkills3.map(skill => (
                        <option key={`s3-worst-${skill}`} value={skill}>{skill}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Terrible">
                      {terribleSkills3.map(skill => (
                        <option key={`s3-terrible-${skill}`} value={skill}>{skill}</option>
                      ))}
                    </optgroup>
                  </select>
                </th>
                <th className="px-4 py-2">
                  <select
                    value={selectedRanking}
                    onChange={(e) => setSelectedRanking(e.target.value)}
                    className="w-full px-2 py-1 rounded-md bg-violet-900/60 border border-fuchsia-400/50 text-white text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70 cursor-pointer hover:border-pink-300/70 hover:bg-violet-800/60 transition-colors not-italic"
                  >
                    <option value="">Select Ranking</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                </th>
                <th className="px-2 py-2">
                  <select
                    value={selectedPhotos}
                    onChange={(e) => setSelectedPhotos(e.target.value)}
                    className="w-full px-2 py-1 rounded-md bg-violet-900/60 border border-fuchsia-400/50 text-white text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70 cursor-pointer hover:border-pink-300/70 hover:bg-violet-800/60 transition-colors not-italic"
                  >
                    <option value="">Select Photos</option>
                    {photosOptions.map(photo => (
                      <option key={photo} value={photo}>{photo}</option>
                    ))}
                  </select>
                </th>
                <th className="px-2 py-2">
                  <select
                    value={selectedBuild}
                    onChange={(e) => setSelectedBuild(e.target.value)}
                    className="w-full px-2 py-1 rounded-md bg-violet-900/60 border border-fuchsia-400/50 text-white text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70 cursor-pointer hover:border-pink-300/70 hover:bg-violet-800/60 transition-colors not-italic"
                  >
                    <option value="">Select Build</option>
                    {buildOptions.map(build => (
                      <option key={build} value={build}>{build}</option>
                    ))}
                  </select>
                </th>
              </tr>
              {/* Column header row */}
              <tr>
                <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Artist</th>
                <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Genre</th>
                <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Role</th>
                <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Rank</th>
                <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Skill 2</th>
                <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Skill 3</th>
                <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Ranking</th>
                <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Photos</th>
                <th className="px-2 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Best Usage</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/80">
              {filteredArtists.map((artist) => (
                <tr key={artist.id} className="hover:bg-amber-400/10 transition-colors duration-200">
                  <td className="px-2 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-white" title={artist.name}>
                      {artist.name}
                    </div>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <div className="text-sm text-amber-100" title={artist.genre}>
                      {artist.genre}
                    </div>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <div className="text-sm text-white text-center" title={artist.position}>
                      {artist.position}
                    </div>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-white text-center" title={artist.rank}>
                      {artist.rank}
                      {artist.rating && artist.rating > 0 && (
                        <span className="ml-1 text-xs text-white/80">
                          ({(artist.rating as number).toFixed(1)})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-center">
                      {artist.skills[1] ? (
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs shadow-sm transition-all duration-200 ${getSkillClass(artist.skills[1])}`}
                        >
                          {artist.skills[1]}
                        </span>
                      ) : (
                        <span className="text-white/50 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-center">
                      {artist.skills[2] ? (
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs shadow-sm transition-all duration-200 ${getSkillClass(artist.skills[2])}`}
                        >
                          {artist.skills[2]}
                        </span>
                      ) : (
                        <span className="text-white/50 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <div className="text-sm font-bold text-center" title={`Points: ${calculateArtistPoints(artist)}`}>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 ${
                        getLetterGrade(calculateArtistPoints(artist)) === 'S' ? 'ranking-a' :
                        getLetterGrade(calculateArtistPoints(artist)) === 'A' ? 'ranking-b' :
                        getLetterGrade(calculateArtistPoints(artist)) === 'B' ? 'ranking-c' :
                        getLetterGrade(calculateArtistPoints(artist)) === 'C' ? 'ranking-d' :
                        getLetterGrade(calculateArtistPoints(artist)) === 'F' ? 'ranking-f' :
                        'text-white'
                      }`}>
                        {getLetterGrade(calculateArtistPoints(artist))}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <span className="text-white text-sm">
                      {artist.photos || 'N/A'}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-sm`}>
                      {artist.build || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Legend (moved inside main to align with table width) */}
        <div id="skill-legend" className="mt-8 mb-4 px-6 py-4 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm rounded-xl border-2 border-fuchsia-400/40 shadow-[0_0_30px_rgba(192,38,211,0.4)] relative z-10 w-fit mx-auto hover:shadow-[0_0_40px_rgba(192,38,211,0.6)] hover:border-pink-400/60 transition-all duration-300">
          <h3 className="text-xl font-bold text-pink-100 mb-4 text-center drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]" style={{color: '#ffffff'}}>Skill Color Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 place-items-center">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 damage-to-player">
                Gold&#9;
              </span>
              <span className="text-white text-sm" style={{color: '#ffffff'}}>Best Skills (Damage to Player, 60% Basic Attack Damage)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-slate-700 to-slate-800 skill-good">
                Green&#9;
              </span>
              <span className="text-white text-sm" style={{color: '#ffffff'}}>Good Skills (50% BA Damage, Skill Damage variants, Reductions)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-slate-600 to-slate-700 skill-specific-terrible">
                Red&#9;
              </span>
              <span className="text-white text-sm" style={{color: '#ffffff'}}>Terrible Skills (DPS variants, Drive Speed, etc.)</span>
            </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 gold-text">
                  Orange&#9;
                </span>
                <span className="text-white text-sm font-bold legend-white">Gold Gathering Skill</span>
              </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700" style={{color: '#ffffff', fontWeight: '700'}}>
                White&#9;
              </span>
              <span className="text-white text-sm font-bold" style={{color: '#ffffff'}}>All Other Skills</span>
            </div>
          </div>
        </div>
      </main>

      

      {/* Footer */}
      <footer className="mt-8 py-4 w-full flex justify-center items-center text-sm relative z-10">
        <p className="text-white font-medium">© {new Date().getFullYear()} JustMick</p>
      </footer>
      </div>
    </div>
  );
}

export default App;