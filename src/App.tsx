import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedRank, setSelectedRank] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedThoughts, setSelectedThoughts] = useState('');
  const [selectedBuild, setSelectedBuild] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New artist form state
  const [newArtist, setNewArtist] = useState<Partial<Artist>>({
    id: Math.max(...artistsData.map(a => a.id), 0) + 1,
    name: '',
    group: '',
    genre: '',
    position: '',
    rank: '',
    skills: [],
    description: '',
    image: 'https://via.placeholder.com/200x200?text=N',
    thoughts: '',
    build: ''
  });

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
  const handleAddArtist = (e: React.FormEvent) => {
    e.preventDefault();
    const newArtistData: Artist = {
      ...newArtist as Required<Artist>,
      id: Math.max(0, ...artists.map(a => a.id)) + 1,
      skills: newArtist.skills || [],
      rating: null,
    };
    
    const updatedArtists = [...artists, newArtistData];
    saveArtists(updatedArtists);
    
    // Close the modal and reset the form
    setShowAddModal(false);
    setNewArtist({
      id: Math.max(0, ...artists.map(a => a.id)) + 2,
      name: '',
      group: '',
      genre: '',
      position: '',
      rank: '',
      skills: [],
      description: '',
      image: 'https://via.placeholder.com/200x200?text=N',
      thoughts: '',
      build: ''
    });
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
  const groupOptions = [...new Set(artists.map(artist => artist.group))];
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
    
    const matchesGroup = selectedGroup === '' || artist.group === selectedGroup;
    const matchesRank = selectedRank === '' || artist.rank === selectedRank;
    const matchesRole = selectedRole === '' || artist.position === selectedRole;
    const matchesGenre = selectedGenre === '' || artist.genre === selectedGenre;
    const matchesSkill = selectedSkill === '' || artist.skills?.includes(selectedSkill);
    const matchesThoughts = selectedThoughts === '' || 
      (selectedThoughts === 'Yes' && artist.thoughts) || 
      (selectedThoughts === 'No' && !artist.thoughts);
    const matchesBuild = selectedBuild === '' || 
      (artist.build && artist.build.toLowerCase().includes(selectedBuild.toLowerCase()));
    
    return matchesSearch && matchesGroup && matchesRank && matchesRole && matchesGenre && matchesSkill && matchesThoughts && matchesBuild;
  });

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-amber-400">Apex Girl Artist Picker</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          title="Add New Artist"
        >
          <FaMusic size={24} />
        </button>
      </header>
      <div className="max-w-[95vw] mx-auto flex-1 flex flex-col items-center py-8 text-white">
      {/* Header */}
      <header className="w-full max-w-7xl mb-8 text-center">
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search artists..."
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-amber-500/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute right-3 top-3 text-gray-400" />
          </div>
          
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-amber-500/30 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select Group</option>
            {groupOptions.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          
          <select
            value={selectedRank}
            onChange={(e) => setSelectedRank(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-amber-500/30 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select Rank</option>
            {rankOptions.map(rank => (
              <option key={rank} value={rank}>{rank}</option>
            ))}
          </select>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-amber-500/30 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select Role</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-amber-500/30 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select Genre</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-amber-500/30 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select Skill</option>
            {skills.map(skill => (
              <option key={skill} value={skill}>{skill || 'No Skill'}</option>
            ))}
          </select>

          <select
            value={selectedThoughts}
            onChange={(e) => setSelectedThoughts(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-amber-500/30 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select Thoughts</option>
            {thoughtsOptions.map(thought => (
              <option key={thought} value={thought}>{thought}</option>
            ))}
          </select>

          <select
            value={selectedBuild}
            onChange={(e) => setSelectedBuild(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-amber-500/30 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select Build</option>
            {buildOptions.map(build => (
              <option key={build} value={build}>{build}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 bg-gray-800/80 rounded-lg text-white">
        <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-amber-400/30 table-force-white">
            <thead className="bg-gray-800/95 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
              <tr className="divide-x divide-amber-400/20">
                <th className="px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider w-[12ch] min-w-[12ch] max-w-[12ch]">
                  <div className="truncate" title="Artist">Artist</div>
                </th>
                <th className="px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider w-[12ch] min-w-[12ch] max-w-[12ch]">
                  <div className="truncate" title="Genre">Genre</div>
                </th>
                <th className="px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider w-[12ch] min-w-[12ch] max-w-[12ch]">
                  <div className="truncate" title="Role">Role</div>
                </th>
                <th className="px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider w-[12ch] min-w-[12ch] max-w-[12ch]">
                  <div className="truncate" title="Rank">Rank</div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider">Skill 2</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider">Skill 3</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider">Mick's Thoughts</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider">Skill Based Build</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/80 divide-y divide-amber-400/30">
              {filteredArtists.map((artist) => (
                <tr key={artist.id} className="hover:bg-amber-400/10 transition-colors duration-200">
                  <td className="px-3 py-4 whitespace-nowrap w-[12ch] min-w-[12ch] max-w-[12ch] overflow-hidden">
                    <div className="text-sm font-medium text-white truncate" title={artist.name}>
                      {artist.name}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap w-[12ch] min-w-[12ch] max-w-[12ch] overflow-hidden">
                    <div className="text-sm text-amber-100 truncate" title={artist.genre}>
                      {artist.genre}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap w-[12ch] min-w-[12ch] max-w-[12ch] overflow-hidden">
                    <div className="flex items-center justify-center">
                      {artist.position.toLowerCase() === 'vocalist' ? (
                        <FaMicrophone className="text-blue-400 flex-shrink-0" />
                      ) : artist.position.toLowerCase() === 'dancer' ? (
                        <FaShoePrints className="text-pink-400 flex-shrink-0" />
                      ) : (
                        <FaUserTie className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className="ml-1 text-sm text-white truncate" title={artist.position}>
                        {artist.position}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap w-[12ch] min-w-[12ch] max-w-[12ch] overflow-hidden">
                    <div className="flex items-center justify-center">
                      <FaMedal className="text-yellow-400 flex-shrink-0" />
                      <span className="ml-1 text-sm font-medium text-white truncate" title={artist.rank}>
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
                  <td className="px-2 py-4">
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
                              ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-100 border border-green-400/50'
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
                  <td className="px-2 py-4">
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
                              ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-100 border border-green-400/50'
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
      <footer className="w-full max-w-7xl mt-8 py-4 text-center text-amber-400 text-sm">
        <p>© {new Date().getFullYear()} JustMick's Artist Helper</p>
      </footer>
      </div>

      {/* Add Artist Modal (rendered in a portal outside the dark root) */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-black">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Artist</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddArtist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newArtist.name}
                  onChange={(e) => setNewArtist({...newArtist, name: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group</label>
                  <input
                    type="text"
                    value={newArtist.group}
                    onChange={(e) => setNewArtist({...newArtist, group: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <select
                    value={newArtist.position}
                    onChange={(e) => setNewArtist({...newArtist, position: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Position</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rank</label>
                  <select
                    value={newArtist.rank}
                    onChange={(e) => setNewArtist({...newArtist, rank: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Rank</option>
                    {rankOptions.map((rank) => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Genre</label>
                  <select
                    value={newArtist.genre}
                    onChange={(e) => setNewArtist({...newArtist, genre: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Genre</option>
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                <input
                  type="text"
                  value={Array.isArray(newArtist.skills) ? newArtist.skills.join(', ') : ''}
                  onChange={(e) => setNewArtist({...newArtist, skills: e.target.value.split(',').map(s => s.trim())})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Skill 1, Skill 2, Skill 3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newArtist.description}
                  onChange={(e) => setNewArtist({...newArtist, description: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Artist
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default App;