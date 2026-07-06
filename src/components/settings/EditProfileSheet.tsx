import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomSheet from './BottomSheet';
import { trpc } from '@/providers/trpc';

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

// Deterministic color from a name, for the initials avatar background.
function colorFromName(name: string): string {
  const colors = ['#00C853', '#7E57C2', '#F59E0B', '#38BDF8', '#EC4899', '#F87171'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// A stock placeholder avatar (from the old build) should never be shown.
function isPlaceholder(url: string): boolean {
  return !url || url.includes('testimonial-avatar') || url.includes('child-learning');
}

export default function EditProfileSheet({ isOpen, onClose, profile, onSave }: EditProfileSheetProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  // Only treat the avatar as real if it isn't one of the old stock placeholders.
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    isPlaceholder(profile.avatar) ? null : profile.avatar,
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const updateProfile = trpc.auth.updateProfile.useMutation();
  const changePassword = trpc.auth.changePassword.useMutation();

  const handlePickImage = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      setSaveError('Please choose an image under 1.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    setSaveError(null);
    setPwError(null);
    setPwSuccess(false);

    // Handle password change only if the user filled it in.
    if (currentPassword || newPassword || confirmPassword) {
      if (newPassword.length < 8) {
        setPwError('New password must be at least 8 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPwError('New passwords do not match.');
        return;
      }
      try {
        await changePassword.mutateAsync({ currentPassword, newPassword });
        setPwSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (err) {
        setPwError(err instanceof Error ? err.message : 'Could not change password.');
        return;
      }
    }

    // Save profile fields + avatar.
    try {
      await updateProfile.mutateAsync({
        name,
        email,
        ...(avatarPreview ? { avatar: avatarPreview } : {}),
      });
      await utils.auth.me.invalidate();
      onSave({ name, email, phone });
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save profile.');
    }
  };

  const saving = updateProfile.isPending || changePassword.isPending;
  const avatarColor = colorFromName(name || 'User');

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="space-y-6 pb-8">
        {/* Avatar */}
        <div className="flex justify-center">
          <motion.button
            type="button"
            onClick={handlePickImage}
            className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl font-semibold text-white"
                style={{ backgroundColor: avatarColor }}
              >
                {initials(name || 'User')}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <p className="text-center text-xs text-mediumGray -mt-4">Tap the photo to change it</p>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-mediumGray mb-2 uppercase tracking-wide">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm focus:outline-none focus:border-vibrantGreen transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-mediumGray mb-2 uppercase tracking-wide">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm focus:outline-none focus:border-vibrantGreen transition-colors"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-mediumGray mb-2 uppercase tracking-wide">Phone</label>
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
            Change Password <span className="normal-case text-mutedSlate">(optional)</span>
          </p>
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm focus:outline-none focus:border-vibrantGreen transition-colors mb-3"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm focus:outline-none focus:border-vibrantGreen transition-colors mb-3"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm focus:outline-none focus:border-vibrantGreen transition-colors"
          />
          {pwError && <p className="text-xs text-softRed mt-2">{pwError}</p>}
          {pwSuccess && <p className="text-xs text-vibrantGreen mt-2">Password updated.</p>}
        </div>

        {saveError && <p className="text-sm text-softRed text-center">{saveError}</p>}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full glass-btn py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </BottomSheet>
  );
}
