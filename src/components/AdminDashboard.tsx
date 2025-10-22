import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Image as ImageIcon, Bell, BookOpen, LogOut, Plus, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import LoadingSpinner from './ui/LoadingSpinner';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'gallery' | 'notices'>('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminData = location.state?.user || JSON.parse(localStorage.getItem('loggedUser') || 'null');
    if (!adminData || adminData.loggedAs !== 'admin') {
      toast.error('Please login as administrator');
      navigate('/');
      return;
    }
    setAdmin(adminData);
    setLoading(false);
  }, [location, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('loggedUser');
    window.dispatchEvent(new CustomEvent('authChanged', { detail: null }));
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administrator Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {admin?.name}</p>
            </div>
            {/* normalize admin id: some older demo users may have non-UUID id (e.g., 'demo-admin') saved in localStorage */}
            {(() => {
              const normalizedAdminId = admin?.id === 'demo-admin' ? '00000000-0000-0000-0000-000000000000' : admin?.id;
              return (
                <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl shadow-xl p-6">
                  {activeTab === 'users' && <UsersManagement adminId={normalizedAdminId} />}
                  {activeTab === 'gallery' && <GalleryManagement adminId={normalizedAdminId} />}
                  {activeTab === 'notices' && <NoticesManagement adminId={normalizedAdminId} />}
                </motion.div>
              );
            })()}
          </div>
        </motion.div>

        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'users' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <Users className="w-5 h-5" />
            Manage Users
          </button>
          <button onClick={() => setActiveTab('gallery')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'gallery' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <ImageIcon className="w-5 h-5" />
            Gallery
          </button>
          <button onClick={() => setActiveTab('notices')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'notices' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <Bell className="w-5 h-5" />
            Notices
          </button>
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl shadow-xl p-6">
          {activeTab === 'users' && <UsersManagement adminId={admin?.id} />}
          {activeTab === 'gallery' && <GalleryManagement adminId={admin?.id} />}
          {activeTab === 'notices' && <NoticesManagement adminId={admin?.id} />}
        </motion.div>
      </div>
    </div>
  );
};

const UsersManagement: React.FC<{ adminId?: string }> = () => {
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [userType]);

  const loadUsers = async () => {
    setLoading(true);
    const table = userType === 'student' ? 'students' : 'teachers';
    const { data } = await supabase.from(table).select('*').order('name');
    if (data) setUsers(data);
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button onClick={() => setUserType('student')} className={`px-4 py-2 rounded-lg font-medium ${userType === 'student' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>Students</button>
          <button onClick={() => setUserType('teacher')} className={`px-4 py-2 rounded-lg font-medium ${userType === 'teacher' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>Teachers</button>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          <Plus className="w-5 h-5" />
          Add {userType === 'student' ? 'Student' : 'Teacher'}
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-600">{userType === 'student' ? `ID: ${user.admission_id}` : `ID: ${user.teacher_id}`}</p>
                {userType === 'student' && <p className="text-sm text-gray-600">Class: {user.class_name} - {user.section}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && <AddUserModal userType={userType} onClose={() => { setShowAddModal(false); loadUsers(); }} />}
    </div>
  );
};

const AddUserModal: React.FC<{ userType: 'student' | 'teacher'; onClose: () => void }> = ({ userType, onClose }) => {
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const table = userType === 'student' ? 'students' : 'teachers';
      // Normalize formData for DB insertion
      const payload: any = { ...formData };
      if (table === 'teachers') {
        // allow comma separated values for subjects/classes/sections
        if (typeof payload.subjects === 'string') {
          payload.subjects = payload.subjects.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        if (typeof payload.classes === 'string') {
          payload.classes = payload.classes.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        if (typeof payload.sections === 'string') {
          payload.sections = payload.sections.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }

      // Ensure essential defaults
      if (table === 'students') {
        payload.status = payload.status || 'active';
      } else {
        payload.status = payload.status || 'active';
      }

      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        throw new Error('No authenticated user found');
      }

      // Verify admin role
      const { data: adminProfile, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (adminError || !adminProfile) {
        console.error('Admin verification error:', adminError);
        throw new Error('Unauthorized: Only administrators can add students');
      }

      // For students table, hash the password before inserting
      if (table === 'students' && payload.password) {
        // Note: In production, use a proper password hashing method
        payload.password = btoa(payload.password); // Simple encoding for demo
      }

      const { error } = await supabase.from(table).insert(payload);
      if (error) {
        console.error('Error adding user:', error);
        toast.error(`Failed to add user: ${error.message}`);
      } else {
        toast.success(`${userType === 'student' ? 'Student' : 'Teacher'} added successfully`);
        onClose();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Failed to add user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Add {userType === 'student' ? 'Student' : 'Teacher'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder={userType === 'student' ? 'Admission ID' : 'Teacher ID'} required onChange={(e) => setFormData({ ...formData, [userType === 'student' ? 'admission_id' : 'teacher_id']: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          <input type="password" placeholder="Password" required onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          <input type="text" placeholder="Name" required onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          <input type="email" placeholder="Email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          <input type="tel" placeholder="Phone" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
          {userType === 'student' && (
            <>
              <input type="text" placeholder="Class" required onChange={(e) => setFormData({ ...formData, class_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input type="text" placeholder="Section" required onChange={(e) => setFormData({ ...formData, section: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
            </>
          )}
          {userType === 'student' && (
            <>
              <label className="text-sm text-gray-600">Date of Birth</label>
              <input type="date" placeholder="Date of Birth" required onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />

              <label className="text-sm text-gray-600">Blood Group</label>
              <select required onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>

              <input type="text" placeholder="Father's Name" onChange={(e) => setFormData({ ...formData, father_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input type="text" placeholder="Mother's Name" onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input type="text" placeholder="Address" onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input type="url" placeholder="Profile Photo URL" onChange={(e) => setFormData({ ...formData, profile_photo: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
            </>
          )}
          {userType === 'teacher' && (
            <>
              <input type="text" placeholder="Subjects (comma separated)" onChange={(e) => setFormData({ ...formData, subjects: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input type="text" placeholder="Classes (comma separated)" onChange={(e) => setFormData({ ...formData, classes: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input type="text" placeholder="Sections (comma separated)" onChange={(e) => setFormData({ ...formData, sections: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <input type="url" placeholder="Profile Photo URL" onChange={(e) => setFormData({ ...formData, profile_photo: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
            </>
          )}
          <button type="submit" disabled={submitting} className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">{submitting ? 'Adding...' : 'Add User'}</button>
        </form>
      </div>
    </div>
  );
};

const GalleryManagement: React.FC<{ adminId?: string }> = ({ adminId }) => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    const { data } = await supabase.from('gallery_images').select('*').order('display_order');
    if (data) setImages(data);
    setLoading(false);
  };

  const handleAddImage = async (imageData: any) => {
    const uploader = adminId === 'demo-admin' ? '00000000-0000-0000-0000-000000000000' : adminId;
    const { error } = await supabase.from('gallery_images').insert({ ...imageData, uploaded_by: uploader });
    if (error) {
      console.error('Error adding image:', error);
      toast.error(`Failed to add image: ${error.message}`);
    } else {
      toast.success('Image added successfully');
      loadImages();
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('gallery_images').update({ is_active: !isActive }).eq('id', id);
    if (error) {
      console.error('Error updating image:', error);
      toast.error(`Failed to update image: ${error.message}`);
    } else {
      toast.success('Image status updated');
      loadImages();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const { error } = await supabase.from('gallery_images').delete().eq('id', id);
    if (error) {
      console.error('Error deleting image:', error);
      toast.error(`Failed to delete image: ${error.message}`);
    } else {
      toast.success('Image deleted');
      loadImages();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Gallery Images</h2>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          <Plus className="w-5 h-5" />
          Add Image
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="border rounded-lg overflow-hidden">
              <img src={image.image_url} alt={image.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold">{image.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{image.description}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleToggleActive(image.id, image.is_active)} className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg ${image.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {image.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {image.is_active ? 'Active' : 'Hidden'}
                  </button>
                  <button onClick={() => handleDelete(image.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && <AddImageModal onClose={() => setShowAddModal(false)} onSubmit={handleAddImage} />}
    </div>
  );
};

const AddImageModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ image_url: imageUrl, title, description, display_order: 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Add Gallery Image</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="url" placeholder="Image URL" required value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <input type="text" placeholder="Title" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-lg" />
          <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Add Image</button>
        </form>
      </div>
    </div>
  );
};

const NoticesManagement: React.FC<{ adminId?: string }> = ({ adminId }) => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setLoading(true);
    const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
    if (data) setNotices(data);
    setLoading(false);
  };

  const handleAddNotice = async (noticeData: any) => {
    const creator = adminId === 'demo-admin' ? '00000000-0000-0000-0000-000000000000' : adminId;
    const payload = {
      ...noticeData,
      created_by: creator,
      is_active: true,
      date: noticeData.date || new Date().toISOString(),
    };

    const { error } = await supabase.from('notices').insert(payload);
    if (error) {
      console.error('Error adding notice:', error);
      toast.error(`Failed to add notice: ${error.message}`);
    } else {
      toast.success('Notice added successfully');
      loadNotices();
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('notices').update({ is_active: !isActive }).eq('id', id);
    if (error) {
      console.error('Error updating notice:', error);
      toast.error(`Failed to update notice: ${error.message}`);
    } else {
      toast.success('Notice status updated');
      loadNotices();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const { error } = await supabase.from('notices').delete().eq('id', id);
    if (error) {
      console.error('Error deleting notice:', error);
      toast.error(`Failed to delete notice: ${error.message}`);
    } else {
      toast.success('Notice deleted');
      loadNotices();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Notices</h2>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          <Plus className="w-5 h-5" />
          Add Notice
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <div key={notice.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{notice.title}</h3>
                  <p className="text-gray-600 mt-1">{notice.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded ${notice.priority === 'high' ? 'bg-red-100 text-red-700' : notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{notice.priority}</span>
                    <span>{new Date(notice.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleToggleActive(notice.id, notice.is_active)} className={`p-2 rounded-lg ${notice.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {notice.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button onClick={() => handleDelete(notice.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && <AddNoticeModal onClose={() => setShowAddModal(false)} onSubmit={handleAddNotice} />}
    </div>
  );
};

const AddNoticeModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, priority });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Add Notice</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Title" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <textarea placeholder="Content" required value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full px-4 py-2 border rounded-lg" />
          <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full px-4 py-2 border rounded-lg">
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Add Notice</button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
