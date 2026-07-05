import { useState } from 'react';
import { Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomSheet from './BottomSheet';

interface EditProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
  onSave: (profile: { name: string; email: string; phone: string }) => void;
}

export default function EditProfileSheet({ isOpen, onClose, profile, onSave }: EditProfileSheetProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);

  const handleSave = () => {
    onSave({ name, email, phone });
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="space-y-6 pb-8">
        {/* Avatar Upload */}
        <div className="flex justify-center">
          <motion.div
            className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={profile.avatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-mediumGray mb-2 uppercase tracking-wide">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm focus:outline-none focus:border-vibrantGreen transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-mediumGray mb-2 uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm focus:outline-none focus:border-vibrantGreen transition-colors"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-mediumGray mb-2 uppercase tracking-wide">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm focus:outline-none focus:border-vibrantGreen transition-colors"
          />
        </div>

        {/* Password Change */}
        <div className="pt-2 border-t border-[rgba(255,255,255,0.06)]">
          <p className="text-xs font-medium text-mediumGray mb-3 uppercase tracking-wide">
            Change Password
          </p>
          <input
            type="password"
            placeholder="Current password"
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm focus:outline-none focus:border-vibrantGreen transition-colors mb-3"
          />
          <input
            type="password"
            placeholder="New password"
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm focus:outline-none focus:border-vibrantGreen transition-colors mb-3"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm focus:outline-none focus:border-vibrantGreen transition-colors"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full glass-btn py-3.5 text-sm font-semibold"
        >
          Save Changes
        </button>
      </div>
    </BottomSheet>
  );
}
