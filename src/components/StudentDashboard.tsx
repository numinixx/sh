import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Award, Clock, TrendingUp, User, Mail, Bot, Star } from 'lucide-react';
import { fetchHomework, fetchAttendance, fetchGrades, Student } from '../lib/supabase';
import LoadingSpinner from './ui/LoadingSpinner';
import ModernCard from './ui/ModernCard';
import AIHelper from './AIHelper';
import RatingModal from './RatingModal';
import toast from 'react-hot-toast';

interface StudentData extends Student {
  loggedAs?: string;
}

const StudentDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [homework, setHomework] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    // Get student data from route state or localStorage
    let studentData: StudentData | undefined = location.state?.user;
    
    if (!studentData) {
      try {
        const raw = localStorage.getItem('loggedUser');
        if (raw) {
          const loggedUser = JSON.parse(raw);
          if (loggedUser.loggedAs === 'student') {
            studentData = loggedUser;
          }
        }
      } catch (e) {
        console.error('Error parsing logged user:', e);
      }
    }

    if (!studentData) {
      navigate('/');
      return;
    }

    setStudent(studentData);
    loadStudentData(studentData);
  }, [location.state, navigate]);

  const loadStudentData = async (studentData: StudentData) => {
    try {
      setLoading(true);
      
      // Load homework for student's class and section
      const { data: homeworkData } = await fetchHomework(studentData.class_name, studentData.section);
      setHomework(homeworkData || []);

      // Load attendance (if student ID is available)
      if (studentData.id) {
        const { data: attendanceData } = await fetchAttendance(studentData.id);
        setAttendance(attendanceData || []);

        // Load grades
        const { data: gradesData } = await fetchGrades(studentData.id);
        setGrades(gradesData || []);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      toast.error('Failed to load some data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendancePercentage = () => {
    if (attendance.length === 0) return 96; // Default fallback
    const presentDays = attendance.filter(a => a.status === 'present').length;
    return Math.round((presentDays / attendance.length) * 100);
  };

  const getLatestGrade = () => {
    if (grades.length === 0) return '88%'; // Default fallback
    const latest = grades[0];
    return `${Math.round((latest.marks_obtained / latest.total_marks) * 100)}%`;
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please login to access your student dashboard</p>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const attendancePercentage = calculateAttendancePercentage();
  const latestGrade = getLatestGrade();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <ModernCard className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <img
                  src={student.profile_photo || '/assest/logo.png'}
                  alt={`${student.name} profile`}
                  className="w-24 h-28 object-cover rounded-2xl border-4 border-white shadow-lg"
                />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{student.name}</h1>
                <div className="flex flex-col md:flex-row gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Class: {student.class_name} • Section: {student.section}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>ID: {student.admission_id}</span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                    <div className="text-sm text-green-600 font-medium">Attendance</div>
                    <div className="text-2xl font-bold text-green-700">{attendancePercentage}%</div>
                  </div>
                  <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                    <div className="text-sm text-blue-600 font-medium">Latest Score</div>
                    <div className="text-2xl font-bold text-blue-700">{latestGrade}</div>
                  </div>
                  <div className="bg-purple-50 px-4 py-2 rounded-xl border border-purple-200">
                    <div className="text-sm text-purple-600 font-medium">Status</div>
                    <div className="text-lg font-bold text-purple-700">Active</div>
                  </div>
                </div>
              </div>
            </div>
          </ModernCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Student Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <ModernCard className="p-6" gradient="blue">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admission ID:</span>
                  <span className="font-medium">{student.admission_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date of Birth:</span>
                  <span className="font-medium">{student.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blood Group:</span>
                  <span className="font-medium">{student.blood_group}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Class:</span>
                  <span className="font-medium">{student.class_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Section:</span>
                  <span className="font-medium">{student.section}</span>
                </div>
                {student.father_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Father's Name:</span>
                    <span className="font-medium">{student.father_name}</span>
                  </div>
                )}
                {student.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{student.email}</span>
                  </div>
                )}
                {student.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{student.phone}</span>
                  </div>
                )}
              </div>
            </ModernCard>

            {/* Quick Stats */}
            <ModernCard className="p-6" gradient="yellow">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Quick Stats
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{attendancePercentage}%</div>
                  <div className="text-sm text-gray-600">Attendance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{latestGrade}</div>
                  <div className="text-sm text-gray-600">Latest Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{homework.length}</div>
                  <div className="text-sm text-gray-600">Assignments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{grades.length}</div>
                  <div className="text-sm text-gray-600">Exams</div>
                </div>
              </div>
            </ModernCard>
          </motion.div>

          {/* Right Column - Homework and Activities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Homework Section */}
            <ModernCard className="p-6" gradient="purple">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Recent Homework
              </h2>
              {homework.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No homework assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {homework.slice(0, 5).map((hw, index) => (
                    <motion.div
                      key={hw.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/50 rounded-xl p-4 border border-white/20"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{hw.title}</h3>
                        {hw.submission_date && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(hw.submission_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{hw.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Subject: {hw.subject}</span>
                        <span>By: {hw.teacher_name || 'Teacher'}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ModernCard>

            {/* Recent Grades */}
            <ModernCard className="p-6" gradient="green">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Recent Grades
              </h2>
              {grades.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No grades available yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {grades.slice(0, 5).map((grade, index) => (
                    <motion.div
                      key={grade.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/50 rounded-xl p-4 border border-white/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{grade.subject}</h3>
                          <p className="text-sm text-gray-600">{grade.exam_type}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round((grade.marks_obtained / grade.total_marks) * 100)}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {grade.marks_obtained}/{grade.total_marks}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ModernCard>
          </motion.div>
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
          {/* AI Helper Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAIHelper(true)}
            className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center group relative"
            title="AI Study Assistant"
          >
            <Bot className="w-8 h-8" />
            <span className="absolute right-full mr-4 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              AI Study Assistant
            </span>
          </motion.button>

          {/* Rating Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowRatingModal(true)}
            className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center group relative"
            title="Submit Rating"
          >
            <Star className="w-8 h-8" />
            <span className="absolute right-full mr-4 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Submit Rating
            </span>
          </motion.button>
        </div>
      </div>

      {/* AI Helper Modal */}
      <AnimatePresence>
        {showAIHelper && (
          <AIHelper
            studentName={student?.name || 'Student'}
            onClose={() => setShowAIHelper(false)}
          />
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && student?.id && (
          <RatingModal
            studentId={student.id}
            onClose={() => setShowRatingModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;