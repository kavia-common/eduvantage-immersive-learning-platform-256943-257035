import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const InstructorDashboard = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: 0,
    thumbnail_url: '', // Using thumbnail_url to match your table
    source_url: '',
    category: 'web-development',
    level: 'beginner'
  });

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    await checkUser();
    await fetchCourses();
    setLoading(false);
  };

  const checkUser = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      
      if (authUser) {
        // Get or create profile
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          profile = await createUserProfile(authUser);
        }

        if (profile) {
          setUser(profile);
          
          // If role is unset, update to instructor
          if (!profile.role || profile.role === 'unset' || profile.role === 'student') {
            await updateUserRole(authUser.id, 'instructor');
          }
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const createUserProfile = async (authUser) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: authUser.id,
          username: authUser.email?.split('@')[0],
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
          avatar_url: authUser.user_metadata?.avatar_url || '',
          role: 'instructor'
        }
      ])
      .select()
      .single();

    if (!error) {
      return data;
    }
    console.error('Error creating profile:', error);
    return null;
  };

  const updateUserRole = async (userId, role) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (!error && data) {
      setUser(data);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching courses:', error);
        // Show specific schema error message
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          const missingColumn = error.message.match(/column \"([^\"]+)\"/)?.[1];
          alert(`Database schema error: Missing column "${missingColumn}". Please run the SQL fix.`);
        }
      } else {
        setCourses(data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      // Prepare course data with all required fields
      const courseData = {
        title: newCourse.title,
        description: newCourse.description,
        instructor_id: authUser.id,
        price: parseFloat(newCourse.price) || 0,
        thumbnail_url: newCourse.thumbnail_url, // Using thumbnail_url
        source_url: newCourse.source_url,
        category: newCourse.category,
        level: newCourse.level,
        duration: '8 weeks',
        total_lessons: 0,
        rating: 0,
        total_students: 0,
        is_published: false
      };

      console.log('Creating course with data:', courseData);

      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        // Handle specific schema errors
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          const missingColumn = error.message.match(/column \"([^\"]+)\"/)?.[1];
          throw new Error(`Database missing "${missingColumn}" column. Please run the SQL fix.`);
        }
        throw error;
      }

      // Success - update UI
      setCourses([data, ...courses]);
      setNewCourse({
        title: '',
        description: '',
        price: 0,
        thumbnail_url: '',
        source_url: '',
        category: 'web-development',
        level: 'beginner'
      });
      setShowAddCourse(false);
      
      alert('🎉 Course created successfully!');
      
    } catch (error) {
      console.error('Error adding course:', error);
      alert('❌ Error creating course: ' + error.message);
    }
    
    setLoading(false);
  };

  const togglePublish = async (courseId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: !currentStatus })
        .eq('id', courseId);

      if (error) throw error;
      await fetchCourses();
    } catch (error) {
      console.error('Error toggling publish:', error);
      alert('Error updating course: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="glass p-6 rounded-2xl mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">👨‍🏫 Instructor Dashboard</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-300">
              Your role: <span className={`font-semibold ${
                user?.role === 'instructor' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {user?.role || 'unset'}
              </span>
            </p>
            {(!user?.role || user.role !== 'instructor') && (
              <button
                onClick={() => updateUserRole(user.id, 'instructor')}
                className="bg-yellow-500 text-black px-3 py-1 rounded text-sm font-semibold hover:bg-yellow-600 transition-colors"
              >
                Set as Instructor
              </button>
            )}
          </div>
          <p className="text-gray-300 mt-2">
            Create and manage your courses. Students will discover them in the catalog.
          </p>
        </div>

        {/* Database Status */}
        <div className="glass p-4 rounded-2xl mb-6 border border-blue-500/50 bg-blue-500/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔧</span>
            <div>
              <h3 className="text-blue-300 font-semibold">Database Setup</h3>
              <p className="text-blue-200 text-sm">
                If you see schema errors, run the SQL fix in Supabase to add missing columns.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Stats & Add Course */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick Stats */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">📊 Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Total Courses</span>
                  <span className="text-white font-bold text-xl">{courses.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Published</span>
                  <span className="text-green-400 font-bold text-xl">
                    {courses.filter(c => c.is_published).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Drafts</span>
                  <span className="text-yellow-400 font-bold text-xl">
                    {courses.filter(c => !c.is_published).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Add Course Form */}
            {showAddCourse ? (
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">➕ Create New Course</h3>
                <form onSubmit={handleAddCourse} className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Title *</label>
                    <input
                      type="text"
                      required
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Java Full Stack Development"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Description *</label>
                    <textarea
                      required
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                      rows="3"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Describe what students will learn in this course..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-semibold mb-2">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newCourse.price}
                        onChange={(e) => setNewCourse({...newCourse, price: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-semibold mb-2">Level</label>
                      <select
                        value={newCourse.level}
                        onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Category</label>
                    <select
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="web-development">Web Development</option>
                      <option value="java">Java</option>
                      <option value="python">Python</option>
                      <option value="ai-ml">AI & Machine Learning</option>
                      <option value="data-science">Data Science</option>
                      <option value="mobile-dev">Mobile Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Thumbnail URL</label>
                    <input
                      type="url"
                      value={newCourse.thumbnail_url}
                      onChange={(e) => setNewCourse({...newCourse, thumbnail_url: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      Use a direct image URL (e.g., from imgur, or YouTube thumbnail)
                    </p>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      Source URL (YouTube/Udemy) *
                    </label>
                    <input
                      type="url"
                      required
                      value={newCourse.source_url}
                      onChange={(e) => setNewCourse({...newCourse, source_url: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://www.youtube.com/playlist?list=..."
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      Link to YouTube playlist, Udemy course, or other learning resources
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create Course'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCourse(false)}
                      className="bg-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowAddCourse(true)}
                className="w-full glass p-8 rounded-2xl text-center hover:bg-white/10 transition-all border-2 border-dashed border-white/20 hover:border-white/40 group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🚀</div>
                <div className="text-white font-semibold text-lg mb-2">Create New Course</div>
                <div className="text-gray-400 text-sm">Start building your first course</div>
              </button>
            )}
          </div>

          {/* Right Column - Courses List */}
          <div className="lg:col-span-2">
            <div className="glass p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Your Courses</h3>
                <span className="text-gray-400">
                  {courses.length} course{courses.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h4 className="text-xl font-semibold text-white mb-2">No courses yet</h4>
                  <p className="text-gray-400 mb-6">Create your first course to start teaching</p>
                  <button
                    onClick={() => setShowAddCourse(true)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all"
                  >
                    Create Your First Course
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map(course => (
                    <div key={course.id} className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all border border-white/10">
                      <div className="flex items-start gap-4">
                        {course.thumbnail_url ? (
                          <img 
                            src={course.thumbnail_url} 
                            alt={course.title}
                            className="w-20 h-20 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl text-white">
                            📚
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-xl font-semibold text-white mb-1">{course.title}</h4>
                              <p className="text-gray-400 text-sm line-clamp-2 mb-2">{course.description}</p>
                              {course.source_url && (
                                <a 
                                  href={course.source_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-400 text-sm hover:text-blue-300 transition-colors flex items-center gap-1"
                                >
                                  <span>🔗</span>
                                  View Source Content
                                </a>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                course.is_published 
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              }`}>
                                {course.is_published ? 'Published' : 'Draft'}
                              </span>
                              <span className="text-white font-bold text-lg">${course.price}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                            <span className="capitalize">Level: {course.level}</span>
                            <span>•</span>
                            <span className="capitalize">Category: {course.category?.replace('-', ' ') || 'web-development'}</span>
                            <span>•</span>
                            <span>Created: {new Date(course.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex gap-3">
                            <button
                              onClick={() => togglePublish(course.id, course.is_published)}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                                course.is_published
                                  ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/30'
                                  : 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30'
                              }`}
                            >
                              {course.is_published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-500/30 border border-blue-500/30 transition-all">
                              Edit Content
                            </button>
                            <button className="bg-white/10 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-white/20 border border-white/20 transition-all">
                              View Analytics
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
