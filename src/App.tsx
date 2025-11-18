import { useState, useEffect } from 'react';
import { FaStar, FaSearch, FaMedal, FaMicrophone, FaShoePrints, FaUserTie, FaMusic } from 'react-icons/fa';
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
  image: string;
  thoughts?: string;
  build?: string;
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
  const [selectedThoughts, setSelectedThoughts] = useState('');
  const [selectedBuild, setSelectedBuild] = useState('');

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
      // Try to load from localStorage first
      const savedArtists = localStorage.getItem('apexArtists');
      if (savedArtists) {
        setArtists(JSON.parse(savedArtists));
      } else {
        // Fall back to the initial data if nothing in localStorage
        setArtists(artistsData);
        // Save the initial data to localStorage
        localStorage.setItem('apexArtists', JSON.stringify(artistsData));
      }
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

  // Get unique values for filters
  const rankOptions = [...new Set(artists.map(artist => artist.rank))];
  const roles = [...new Set(artists.map(artist => artist.position))];
  const genres = [...new Set(artists.map(artist => artist.genre))];
  const allSkills = [...new Set(artists.flatMap(artist => artist.skills).filter(Boolean))];
  const skills = allSkills; // Alias for backward compatibility
  // Group skills for dropdown headers
  const isGoodBuff = (skill: string) => {
    const t = (skill || '').toLowerCase();
    return t.includes('skill damage') || t.includes('basic attack damage') || t.includes('basic damage');
  };
  const isTerribleSkill = (skill: string) => {
    const t = (skill || '').toLowerCase();
    return t.includes('180/dps') || t.includes('200/dps') || 
           t.includes('world building guard') || t.includes('damage wg') ||
           t.includes('10 sec') || t.includes('10/sec');
  };
  const isWorstSkill = (skill: string) => {
    const t = (skill || '').toLowerCase();
    return !isTerribleSkill(skill) && (
      t.includes('gold brick gathering') ||
      t.includes('driving speed') ||
      t.includes('fan capacity')
    );
  };
  const isDirectDamage = (skill: string) => {
    const t = (skill || '').toLowerCase();
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
  
  // Calculate artist points: Best=5, Good=3, Okay=1, Worst=0, Terrible=-1
  const calculateArtistPoints = (artist: Artist) => {
    let points = 0;
    artist.skills.forEach(skill => {
      if (!skill) return;
      if (bestSkills.includes(skill)) points += 5;
      else if (goodSkills.includes(skill)) points += 3;
      else if (okaySkills.includes(skill)) points += 1;
      else if (worstSkills.includes(skill)) points += 0;
      else if (terribleSkills.includes(skill)) points += -1;
    });
    return points;
  };
  
  const thoughtsOptions = [...new Set(artists.map(artist => artist.thoughts).filter(Boolean))];
  const buildOptions = [...new Set(artists.map(artist => artist.build).filter(Boolean))];

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
    const matchesThoughts = selectedThoughts === '' || 
      (selectedThoughts === 'Yes' && artist.thoughts) || 
      (selectedThoughts === 'No' && !artist.thoughts);
    const matchesBuild = selectedBuild === '' || 
      (artist.build && artist.build.toLowerCase().includes(selectedBuild.toLowerCase()));
    
    return matchesSearch && matchesRank && matchesRole && matchesGenre && matchesSkill && matchesSkill3 && matchesThoughts && matchesBuild;
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

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white flex flex-col items-center">
      <div className="w-full flex flex-col items-center py-8 text-white gap-8">
      
      {/* Page Title */}
      <header className="flex flex-col items-center gap-4 app-header">
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg tracking-tight text-center" style={{ color: '#ffffff' }}>JustMick's Awesome Artist Helper</h1>
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
      </header>
      
      {/* Search Filter */}
      <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search artists..."
            className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-amber-500/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-md transition-all duration-200 text-center"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto w-fit bg-gradient-to-br from-violet-700/80 via-fuchsia-700/75 to-pink-600/80 rounded-2xl text-white shadow-[0_0_25px_rgba(219,39,119,0.4)] border border-pink-400/40 backdrop-blur-md ring-1 ring-fuchsia-400/30">
        <div className="overflow-x-auto">
          <table className="mx-auto table-auto table-force-white table-with-spacing italic">
            <thead className="bg-gray-800/95 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
              {/* Filter row */}
              <tr className="align-middle bg-gradient-to-r from-violet-800/70 via-fuchsia-800/70 to-pink-700/70">
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2">
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
                <th className="px-4 py-2">
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
                <th className="px-4 py-2">
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
                <th className="px-6 py-2">
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
                      {bestSkills.map(skill => (
                        <option key={`s3-best-${skill}`} value={skill}>{skill}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Good">
                      {goodSkills.map(skill => (
                        <option key={`s3-good-${skill}`} value={skill}>{skill}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Okay">
                      {okaySkills.map(skill => (
                        <option key={`s3-okay-${skill}`} value={skill}>{skill}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Worst">
                      {worstSkills.map(skill => (
                        <option key={`s3-worst-${skill}`} value={skill}>{skill}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Terrible">
                      {terribleSkills.map(skill => (
                        <option key={`s3-terrible-${skill}`} value={skill}>{skill}</option>
                      ))}
                    </optgroup>
                  </select>
                </th>
                <th className="px-6 py-2">
                  <select
                    value={selectedThoughts}
                    onChange={(e) => setSelectedThoughts(e.target.value)}
                    className="w-full px-2 py-1 rounded-md bg-violet-900/60 border border-fuchsia-400/50 text-white text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70 cursor-pointer hover:border-pink-300/70 hover:bg-violet-800/60 transition-colors not-italic"
                  >
                    <option value="">Select Thoughts</option>
                    {thoughtsOptions.map(thought => (
                      <option key={thought} value={thought}>{thought}</option>
                    ))}
                  </select>
                </th>
                <th className="px-6 py-2">
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
                <th className="px-4 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Artist</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Genre</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Ranking</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Skill 2</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Skill 3</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Mick's Thoughts</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider">Skill Based Build</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/80">
              {filteredArtists.map((artist) => (
                <tr key={artist.id} className="hover:bg-amber-400/10 transition-colors duration-200">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white" title={artist.name}>
                      {artist.name}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-amber-100" title={artist.genre}>
                      {artist.genre}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white text-center" title={artist.position}>
                      {artist.position}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white text-center" title={artist.rank}>
                      {artist.rank}
                      {artist.rating && artist.rating > 0 && (
                        <span className="ml-1 text-xs text-white/80">
                          ({(artist.rating as number).toFixed(1)})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-center" title={`Points: ${calculateArtistPoints(artist)}`}>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        calculateArtistPoints(artist) >= 10 ? 'bg-gradient-to-r from-amber-400 to-yellow-600 text-white' :
                        calculateArtistPoints(artist) >= 7 ? 'bg-gradient-to-r from-emerald-400 to-green-600 text-white' :
                        calculateArtistPoints(artist) >= 4 ? 'bg-gradient-to-r from-blue-400 to-cyan-600 text-white' :
                        calculateArtistPoints(artist) >= 1 ? 'bg-gradient-to-r from-slate-400 to-slate-600 text-white' :
                        'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                      }`}>
                        {calculateArtistPoints(artist)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      {artist.skills[1] ? (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            artist.skills[1].trim() === '50% Basic Attack Damage'
                              ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-green-400 shadow-sm border border-green-400/60 font-semibold'
                              : [
                                  '20% Skill Damage', 
                                  '12% Reduction Normal Attack Damage',
                                  '12% Skill Damage Reduction'
                                ].includes(artist.skills[1].trim())
                                ? artist.skills[1].trim() === '20% Skill Damage'
                                  ? 'bg-gradient-to-r from-emerald-400 to-green-600 text-white shadow-sm border border-emerald-300/60 font-semibold'
                                  : 'bg-gradient-to-r from-teal-400 to-cyan-600 text-white shadow-sm border border-cyan-300/50'
                                : 'bg-gradient-to-r from-slate-600 to-slate-700 text-slate-100 border border-slate-500/40'
                          }`}
                        >
                          {artist.skills[1]}
                        </span>
                      ) : (
                        <span className="text-white/50 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      {artist.skills[2] ? (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            artist.skills[2].trim() === '50% Basic Attack Damage'
                              ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-green-400 shadow-sm border border-green-400/60 font-semibold'
                              : [
                                  '20% Skill Damage', 
                                  '12% Reduction Normal Attack Damage',
                                  '12% Skill Damage Reduction'
                                ].includes(artist.skills[2].trim())
                                ? artist.skills[2].trim() === '20% Skill Damage'
                                  ? 'bg-gradient-to-r from-emerald-400 to-green-600 text-white shadow-sm border border-emerald-300/60 font-semibold'
                                  : 'bg-gradient-to-r from-teal-400 to-cyan-600 text-white shadow-sm border border-cyan-300/50'
                                : 'bg-gradient-to-r from-slate-600 to-slate-700 text-slate-100 border border-slate-500/40'
                          }`}
                        >
                          {artist.skills[2]}
                        </span>
                      ) : (
                        <span className="text-white/50 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      artist.thoughts === 'Yes' ? 'bg-gradient-to-r from-green-400 to-emerald-600 text-white shadow-sm' :
                      artist.thoughts === 'No' ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm' :
                      artist.thoughts === 'If Nothing Better' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-sm' :
                      artist.thoughts === 'Bad' ? 'bg-gradient-to-r from-rose-700 to-red-800 text-white shadow-sm' :
                      'bg-gradient-to-r from-slate-600 to-slate-700 text-slate-100'
                    }`}>
                      {artist.thoughts || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      artist.build === 'Skill Build' ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm' :
                      'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-sm'
                    }`}>
                      {artist.build || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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