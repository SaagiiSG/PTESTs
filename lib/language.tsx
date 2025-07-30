"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'mn';

const translations = {
  en: {
    home: 'Home',
    courses: 'Courses',
    tests: 'Tests',
    profile: 'Profile',
    admin: 'Admin',
    dashboard: 'Dashboard',
    users: 'Users',
    analytics: 'Analytics',
    settings: 'Settings',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    search: 'Search',
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    welcomeBack: 'Welcome back',
    continueLearning: 'Continue Learning',
    viewCourse: 'View Course',
    startTest: 'Start Test',
    takeTest: 'Take Test',
    courseContent: 'Course Content',
    lessons: 'lessons',
    moreLessons: 'more lessons',
    createCourse: 'Create Course',
    createTest: 'Create Test',
    courseManagement: 'Course Management',
    testManagement: 'Test Management',
    userManagement: 'User Management',
    totalUsers: 'Total Users',
    totalCourses: 'Total Courses',
    totalTests: 'Total Tests',
    totalRevenue: 'Total Revenue',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    viewProfile: 'View Profile',
    editUser: 'Edit User',
    sendEmail: 'Send Email',
    deleteUser: 'Delete User',
    courseDeleted: 'Course deleted successfully!',
    testDeleted: 'Test deleted successfully!',
    userDeleted: 'User deleted successfully!',
    failedToDelete: 'Failed to delete',
    editComingSoon: 'Edit functionality coming soon!',
    noCoursesFound: 'No courses found',
    noTestsFound: 'No tests found',
    noUsersFound: 'No users found',
    createFirstCourse: 'Create Your First Course',
    createFirstTest: 'Create Your First Test',
    // Profile page translations
    testHistory: 'Test History',
    courseHistory: 'Course History',
    editProfile: 'Edit Profile',
    changePassword: 'Change Password',
    privacy: 'Privacy',
    about: 'About',
    age: 'Age',
    gender: 'Gender',
    back: 'Back',
    name: 'Name',
    email: 'Email',
    selectGender: 'Select gender',
    male: 'Male',
    female: 'Female',
    saving: 'Saving...',
    saveChanges: 'Save Changes',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    passwordsDoNotMatch: 'New passwords do not match.',
    passwordChanged: 'Password changed!',
    failedToChangePassword: 'Failed to change password.',
    continue: 'Continue',
    noPurchasedCourses: 'No purchased courses yet.',
    startLearning: 'Start your learning journey!',
  },
  mn: {
    home: 'Нүүр',
    courses: 'Курсууд',
    tests: 'Тестүүд',
    profile: 'Профайл',
    admin: 'Админ',
    dashboard: 'Хяналтын самбар',
    users: 'Хэрэглэгчид',
    analytics: 'Аналитик',
    settings: 'Тохиргоо',
    loading: 'Уншиж байна...',
    error: 'Алдаа',
    success: 'Амжилттай',
    cancel: 'Цуцлах',
    save: 'Хадгалах',
    close: 'Хаах',
    search: 'Хайх',
    view: 'Харах',
    edit: 'Засах',
    delete: 'Устгах',
    welcomeBack: 'Сайн байна уу',
    continueLearning: 'Үргэлжлүүлэх',
    viewCourse: 'Курс харах',
    startTest: 'Тест эхлэх',
    takeTest: 'Тест өгөх',
    courseContent: 'Курсын агуулга',
    lessons: 'хичээл',
    moreLessons: 'нэмэлт хичээл',
    createCourse: 'Курс үүсгэх',
    createTest: 'Тест үүсгэх',
    courseManagement: 'Курсын удирдлага',
    testManagement: 'Тестийн удирдлага',
    userManagement: 'Хэрэглэгчийн удирдлага',
    totalUsers: 'Нийт хэрэглэгч',
    totalCourses: 'Нийт курс',
    totalTests: 'Нийт тест',
    totalRevenue: 'Нийт орлого',
    recentActivity: 'Сүүлийн үйл ажиллагаа',
    quickActions: 'Шуурхай үйлдлүүд',
    viewProfile: 'Профайл харах',
    editUser: 'Хэрэглэгч засах',
    sendEmail: 'Имэйл илгээх',
    deleteUser: 'Хэрэглэгч устгах',
    courseDeleted: 'Курс амжилттай устгагдлаа!',
    testDeleted: 'Тест амжилттай устгагдлаа!',
    userDeleted: 'Хэрэглэгч амжилттай устгагдлаа!',
    failedToDelete: 'Устгахад алдаа гарлаа',
    editComingSoon: 'Засах функц удахгүй ирэх болно!',
    noCoursesFound: 'Курс олдсонгүй',
    noTestsFound: 'Тест олдсонгүй',
    noUsersFound: 'Хэрэглэгч олдсонгүй',
    createFirstCourse: 'Анхны курсаа үүсгэнэ үү',
    createFirstTest: 'Анхны тестээ үүсгэнэ үү',
    // Profile page translations
    testHistory: 'Тестийн түүх',
    courseHistory: 'Курсын түүх',
    editProfile: 'Профайл засах',
    changePassword: 'Нууц үг солих',
    privacy: 'Нууцлал',
    about: 'Тухай',
    age: 'Нас',
    gender: 'Хүйс',
    back: 'Буцах',
    name: 'Нэр',
    email: 'Имэйл',
    selectGender: 'Хүйс сонгох',
    male: 'Эрэгтэй',
    female: 'Эмэгтэй',
    saving: 'Хадгалах...',
    saveChanges: 'Хадгалах',
    currentPassword: 'Одоогийн нууц үг',
    newPassword: 'Шинэ нууц үг',
    confirmNewPassword: 'Шинэ нууц үгээ баталгаажуулах',
    passwordsDoNotMatch: 'Шинэ нууц үг таарахгүй байна.',
    passwordChanged: 'Нууц үг амжилттай солигдлоо!',
    failedToChangePassword: 'Нууц үг солиход алдаа гарлаа.',
    continue: 'Үргэлжлүүлэх',
    noPurchasedCourses: 'Харилцагдсан курс олдсонгүй.',
    startLearning: 'Сургалтын яамыг эхлэх!',
  }
};

const LanguageContext = createContext<any>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'mn')) {
      setLanguage(savedLang);
    }
  }, []);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('preferred-language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleLanguageChange, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 