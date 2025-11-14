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
  const thoughtsOptions = ['Yes', 'No', 'If Nothing Better', 'Bad'];
  const buildOptions = ['Skill Build', 'Standard Build'];

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
    // Sort by genre first
    const genreCompare = a.genre.localeCompare(b.genre);
    if (genreCompare !== 0) return genreCompare;
    
    // Then by role/position
    const roleCompare = a.position.localeCompare(b.position);
    if (roleCompare !== 0) return roleCompare;
    
    // Finally by artist name
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
      <main className="mx-auto w-fit bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl text-white shadow-2xl border border-amber-500/20 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="mx-auto table-auto table-force-white table-with-spacing">
            <thead className="bg-gray-800/95 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
              {/* Filter row */}
              <tr className="align-middle">
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2">
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full px-2 py-1 rounded-md bg-gray-700/90 border border-amber-500/40 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer hover:border-amber-500/60"
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
                    className="w-full px-2 py-1 rounded-md bg-gray-700/90 border border-amber-500/40 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer hover:border-amber-500/60"
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
                    className="w-full px-2 py-1 rounded-md bg-gray-700/90 border border-amber-500/40 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer hover:border-amber-500/60"
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
                    className="w-full px-2 py-1 rounded-md bg-gray-700/90 border border-amber-500/40 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer hover:border-amber-500/60"
                  >
                    <option value="">Select Skill 2</option>
                    {skills.map(skill => (
                      <option key={skill} value={skill}>{skill || 'No Skill'}</option>
                    ))}
                  </select>
                </th>
                <th className="px-6 py-2">
                  <select
                    value={selectedSkill3}
                    onChange={(e) => setSelectedSkill3(e.target.value)}
                    className="w-full px-2 py-1 rounded-md bg-gray-700/90 border border-amber-500/40 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer hover:border-amber-500/60"
                  >
                    <option value="">Select Skill 3</option>
                    {skills.map(skill => (
                      <option key={skill + '-3'} value={skill}>{skill || 'No Skill'}</option>
                    ))}
                  </select>
                </th>
                <th className="px-6 py-2">
                  <select
                    value={selectedThoughts}
                    onChange={(e) => setSelectedThoughts(e.target.value)}
                    className="w-full px-2 py-1 rounded-md bg-gray-700/90 border border-amber-500/40 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer hover:border-amber-500/60"
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
                    className="w-full px-2 py-1 rounded-md bg-gray-700/90 border border-amber-500/40 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer hover:border-amber-500/60"
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
                <th className="px-4 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">Artist</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">Genre</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">Skill 2</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">Skill 3</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">Mick's Thoughts</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wider">Skill Based Build</th>
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
                    <div className="flex items-center justify-center">
                      {artist.position.toLowerCase() === 'vocalist' ? (
                        <FaMicrophone className="text-blue-400 flex-shrink-0" />
                      ) : artist.position.toLowerCase() === 'dancer' ? (
                        <FaShoePrints className="text-pink-400 flex-shrink-0" />
                      ) : (
                        <FaUserTie className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className="ml-1 text-sm text-white" title={artist.position}>
                        {artist.position}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <FaMedal className="text-yellow-400 flex-shrink-0" />
                      <span className="ml-1 text-sm font-medium text-white" title={artist.rank}>
                        {artist.rank}
                      </span>
                      {artist.rating && artist.rating > 0 && (
                        <div className="flex items-center ml-1">
                          <FaStar className="text-yellow-400 flex-shrink-0" />
                          <span className="ml-0.5 text-xs text-white/80">
                            {(artist.rating as number).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      {artist.skills[1] ? (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            [
                              '20% Skill Damage', 
                              '50% Basic Attack Damage',
                              '12% Reduction Normal Attack Damage',
                              '12% Skill Damage Reduction'
                            ].includes(artist.skills[1].trim())
                              ? artist.skills[1].trim() === '20% Skill Damage' || artist.skills[1].trim() === '50% Basic Attack Damage'
                                ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-100 border border-green-400/50 text-green-400 font-bold'
                                : 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-100 border border-green-400/50'
                              : 'bg-gray-700/70 text-white/90 border border-gray-500/30'
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
                            [
                              '20% Skill Damage', 
                              '50% Basic Attack Damage',
                              '12% Reduction Normal Attack Damage',
                              '12% Skill Damage Reduction'
                            ].includes(artist.skills[2].trim())
                              ? artist.skills[2].trim() === '20% Skill Damage' || artist.skills[2].trim() === '50% Basic Attack Damage'
                                ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-100 border border-green-400/50 text-green-400 font-bold'
                                : 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-100 border border-green-400/50'
                              : 'bg-gray-700/70 text-white/90 border border-gray-500/30'
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
                      artist.thoughts === 'Yes' ? 'bg-green-600/30 text-green-100' :
                      artist.thoughts === 'No' ? 'bg-red-600/30 text-red-100' :
                      artist.thoughts === 'If Nothing Better' ? 'bg-yellow-600/30 text-yellow-100' :
                      artist.thoughts === 'Bad' ? 'bg-red-700/40 text-red-100' :
                      'bg-gray-700/70 text-white/80'
                    }`}>
                      {artist.thoughts || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      artist.build === 'Skill Build' ? 'bg-blue-600/30 text-blue-100' :
                      'bg-purple-600/30 text-purple-100'
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
      <footer className="mt-8 py-4 text-center text-white text-sm">
        <p>© {new Date().getFullYear()} JustMick's Artist Helper</p>
      </footer>
      </div>
    </div>
  );
}

export default App;