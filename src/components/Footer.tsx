import React from 'react';
import { TeacherProfile } from '../types';

interface FooterProps {
  profile: TeacherProfile;
}

export const Footer: React.FC<FooterProps> = ({ profile }) => {
  return (
    <footer className="bg-[#0B2D59] text-sky-100 py-3.5 px-4 sm:px-6 text-xs border-t border-sky-900 shadow-inner z-20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="font-serif">
          Ứng dụng quản lý và hỗ trợ dạy học môn Toán | {profile.school} | Giáo viên: {profile.name}
        </div>
        <div className="text-sky-300 font-semibold font-serif shrink-0">
          Năm học: {profile.academicYear}
        </div>
      </div>
    </footer>
  );
};
