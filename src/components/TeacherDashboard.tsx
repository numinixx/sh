import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

interface TeacherData {
  name: string;
  teacherId?: string;
  loggedAs?: string;
  profilePhoto?: string;
  classes?: string[];
  sections?: string[];
}

const TeacherDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Prefer route state, otherwise fall back to localStorage session
  let teacher: TeacherData | undefined = location.state?.user;
  let loggedUser: any = null;
  try {
    const raw = localStorage.getItem('loggedUser');
    if (raw) loggedUser = JSON.parse(raw);
  } catch (e) {
    loggedUser = null;
  }
  if (!teacher && loggedUser && loggedUser.loggedAs === 'teacher') {
    teacher = loggedUser as TeacherData;
  }

  const [className, setClassName] = useState('IX');
  const [section, setSection] = useState('NEEV');
  const [availableClasses, setAvailableClasses] = useState<string[] | null>(null);
  const [availableSections, setAvailableSections] = useState<string[] | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submissionDate, setSubmissionDate] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any | null>(null);
  const [studentsCount, setStudentsCount] = useState<number | null>(null);
  const [teacherMap, setTeacherMap] = useState<Record<string,string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('homeworks');
      if (!raw) return;
      const list = JSON.parse(raw);
      if (Array.isArray(list)) setHomeworks(list);
    } catch (e) {}
  }, []);

  // load teacher profile from public/data/teachers.json when available (use teacher.teacherId or loggedUser)
  useEffect(() => {
    (async () => {
      try {
        // find teacher id from location state or localStorage
        let rawUser: any = teacher;
        if (!rawUser) {
          const raw = localStorage.getItem('loggedUser');
          if (raw) rawUser = JSON.parse(raw);
        }
        const teacherId = rawUser?.teacherId || rawUser?.name || rawUser?.email;
        if (!teacherId) return;

  const [tRes, uRes] = await Promise.all([fetch('/data/teachers.json'), fetch('/data/users.json')]);
  if (!tRes.ok) return;
  const tList = await tRes.json();
        if (!Array.isArray(tList)) return;
        const found = tList.find((t: any) => String(t.teacherId) === String(teacherId));
        if (found) {
          setProfile(found);
          setAvailableClasses(Array.isArray(found.classes) ? found.classes.map((c: any) => String(c)) : null);
          setAvailableSections(Array.isArray(found.sections) ? found.sections.map((s: any) => String(s)) : null);
          // default selected values to first available if not already set
          if (Array.isArray(found.classes) && found.classes.length > 0) setClassName(String(found.classes[0]));
          if (Array.isArray(found.sections) && found.sections.length > 0) setSection(String(found.sections[0]));
          if (Array.isArray(found.subjects) && found.subjects.length > 0) setSubject(String(found.subjects[0]));
        }

        // also populate teacherMap for resolving createdBy
        try {
          const teachersList = Array.isArray(tList) ? tList : [];
          const map: Record<string,string> = {};
          teachersList.forEach((t: any) => {
            if (t.teacherId) map[String(t.teacherId)] = t.name || String(t.teacherId);
            if (t.email) map[String(t.email)] = t.name || String(t.email);
            if (t.name) map[String(t.name)] = t.name; // map name to itself for direct matches
          });
          setTeacherMap(map);
        } catch (e) {
          // ignore
        }

        // compute students count for classes/sections this teacher handles
        if (uRes.ok) {
          const users = await uRes.json();
          if (Array.isArray(users)) {
            if (found && Array.isArray(found.classes) && found.classes.length > 0) {
              const classesSet = new Set(found.classes.map((c: any) => String(c).trim()));
              const sectionsSet = found.sections && Array.isArray(found.sections) ? new Set(found.sections.map((s: any) => String(s).trim().toLowerCase())) : null;
              const count = users.filter((u: any) => {
                if (!u.roles || !Array.isArray(u.roles) || !u.roles.includes('student')) return false;
                if (!classesSet.has(String(u.className).trim())) return false;
                if (sectionsSet) {
                  return sectionsSet.has(String(u.section || '').trim().toLowerCase());
                }
                return true;
              }).length;
              setStudentsCount(count);
            }
          }
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [teacher]);

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!title.trim()) {
      setMessage('Please provide a title for the homework.');
      return;
    }
    // validate class/section against available lists if provided
    if (availableClasses && !availableClasses.includes(className)) {
      setMessage(`You cannot assign homework to class ${className}.`);
      return;
    }
    if (availableSections && !availableSections.includes(section)) {
      setMessage(`You cannot assign homework to section ${section}.`);
      return;
    }
    const hw = {
      id: Date.now(),
      className: String(className).trim(),
      section: String(section).trim(),
      title: title.trim(),
  subject: subject || (profile?.subjects && profile.subjects[0]) || '',
      description: description.trim(),
  submissionDate: submissionDate || null,
  createdBy: profile?.name || teacher?.name || profile?.teacherId || teacher?.teacherId || 'unknown',
      ts: Date.now(),
    };
    try {
      const raw = localStorage.getItem('homeworks');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(hw);
      localStorage.setItem('homeworks', JSON.stringify(list));
      setHomeworks(list);
      setMessage('Homework assigned. Students in the class will see it.');
      setTitle('');
      setDescription('');
  setSubmissionDate('');
    } catch (e) {
      setMessage('Could not save homework.');
    }
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this homework?')) return;
    try {
      const raw = localStorage.getItem('homeworks');
      const list = raw ? JSON.parse(raw) : [];
      const next = list.filter((h: any) => h.id !== id);
      localStorage.setItem('homeworks', JSON.stringify(next));
      setHomeworks(next);
      setMessage('Homework deleted.');
    } catch (e) {
      setMessage('Could not delete homework.');
    }
  };

  if (!teacher) {
    // If someone is logged in but as a student, show a specific message
    if (loggedUser && loggedUser.loggedAs === 'student') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">You are logged in as a student</h2>
            <p className="text-gray-600 mb-4">Use the Student Portal to access student features.</p>
            <button
              onClick={() => navigate('/student-dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Go to Student Portal
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please login to access your teacher dashboard</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-white min-h-screen px-4 py-8">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl border overflow-hidden">
        <div className="p-6 flex items-center gap-6">
          <img src={profile?.profilePhoto || teacher.profilePhoto} alt="teacher" className="w-24 h-28 object-cover rounded-md border-2 border-sky-200" />
          <div>
            <h2 className="text-2xl font-bold text-sky-700">{profile?.name || teacher.name}</h2>
            <div className="text-sm text-gray-600 mt-1">Teacher ID: <span className="font-semibold">{profile?.teacherId || teacher.teacherId}</span></div>
            <div className="mt-2 text-sm text-gray-700">
              <div>
                <span className="text-gray-500">Classes:</span>{' '}
                <span className="font-medium">{(profile?.classes && profile.classes.length > 0) ? profile.classes.join(', ') : (teacher?.classes ? teacher.classes.join(', ') : '—')}</span>
              </div>
              <div className="mt-1">
                <span className="text-gray-500">Sections:</span>{' '}
                <span className="font-medium">{(profile?.sections && profile.sections.length > 0) ? profile.sections.join(', ') : (teacher?.sections ? teacher.sections.join(', ') : '—')}</span>
              </div>
              <div className="mt-2">
                <span className="text-gray-500">Subjects:</span>{' '}
                <span className="font-medium">{(profile?.subjects && profile.subjects.length > 0) ? profile.subjects.join(', ') : '—'}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="p-3 bg-sky-50 rounded-lg text-center">
                <div className="text-xs text-gray-500">Classes</div>
                <div className="text-lg font-bold text-gray-800">{profile?.classes ? profile.classes.length : '—'}</div>
              </div>
              <div className="p-3 bg-sky-50 rounded-lg text-center">
                <div className="text-xs text-gray-500">Students</div>
                <div className="text-lg font-bold text-gray-800">{studentsCount ?? '—'}</div>
              </div>
              <div className="p-3 bg-sky-50 rounded-lg text-center">
                <div className="text-xs text-gray-500">Attendance</div>
                <div className="text-lg font-bold text-green-600">95%</div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">Assign Homework</h3>
          <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-sm text-gray-600">Class</label>
              {availableClasses ? (
                <select value={className} onChange={e => setClassName(e.target.value)} className="w-full mt-1 p-2 border rounded">
                  {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input value={className} onChange={e => setClassName(e.target.value)} className="w-full mt-1 p-2 border rounded" />
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600">Section</label>
              {availableSections ? (
                <select value={section} onChange={e => setSection(e.target.value)} className="w-full mt-1 p-2 border rounded">
                  {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <input value={section} onChange={e => setSection(e.target.value)} className="w-full mt-1 p-2 border rounded" />
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600">Submission date</label>
              <input type="date" value={submissionDate} onChange={e => setSubmissionDate(e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-gray-600">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Subject</label>
              {profile?.subjects ? (
                <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full mt-1 p-2 border rounded">
                  {profile.subjects.map((s: string) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full mt-1 p-2 border rounded" />
              )}
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-gray-600">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>
            <div className="md:col-span-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded">Assign Homework</button>
              {message && <div className="text-sm text-green-600 mt-2">{message}</div>}
            </div>
          </form>

          {homeworks.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold">Recent Homeworks</h4>
              <ul className="mt-2 space-y-2">
                {homeworks.slice(0, 8).map(hw => (
                  <li key={hw.id} className="p-3 bg-white border rounded flex justify-between items-start">
                    <div>
                      <div className="text-sm text-gray-500">Class {hw.className} • Section {hw.section} • Assigned by {teacherMap[hw.createdBy] || hw.createdBy}</div>
                      <div className="font-semibold">{hw.title}</div>
                      <div className="text-sm text-gray-700">{hw.description}</div>
                      {(hw.submissionDate || hw.dueDate) && <div className="text-xs text-gray-500">Submission: {hw.submissionDate || hw.dueDate}</div>}
                    </div>
                    <div>
                      <button onClick={() => handleDelete(hw.id)} title="Delete" className="p-1 rounded hover:bg-red-50">
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
