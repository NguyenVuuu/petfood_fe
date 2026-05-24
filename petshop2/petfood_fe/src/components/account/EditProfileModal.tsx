import { FormEvent, useEffect, useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User } from "@/types";

interface EditProfileModalProps {
  isOpen: boolean;
  user: User | null;
  isLoading?: boolean;
  onClose: () => void;
  onSave: (payload: { fullName: string; avatarFile?: File | null }) => Promise<unknown>;
}

export function EditProfileModal({ isOpen, user, isLoading = false, onClose, onSave }: EditProfileModalProps) {
  const [fullName, setFullName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName(user?.fullName ?? "");
      setAvatarFile(null);
      setAvatarPreview(user?.avatarUrl ?? "");
    }
  }, [isOpen, user]);

  useEffect(() => {
    return () => { if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview); };
  }, [avatarPreview]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(user?.avatarUrl ?? "");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSave({ fullName: fullName.trim(), avatarFile });
  };

  const initials = (user?.fullName ?? "U").split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar picker */}
        <div>
          <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Profile Photo</p>
          <div className="flex items-center gap-4">
            {/* Preview */}
            <div className="relative h-20 w-20 shrink-0">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-amber-100 ring-2 ring-amber-200 dark:ring-amber-800">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-bold text-amber-700">
                    {initials}
                  </div>
                )}
              </div>
              {avatarFile && (
                <button
                  type="button"
                  onClick={clearAvatar}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                >
                  <X size={10} />
                </button>
              )}
            </div>

            {/* Upload area */}
            <div className="flex-1">
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-amber-600 dark:hover:bg-amber-900/20"
              >
                <Upload size={16} />
                {avatarFile ? avatarFile.name : "Choose photo (JPG, PNG, WebP)"}
              </button>
              <p className="mt-1.5 text-xs text-gray-400">Max 5MB. Click avatar to preview.</p>
            </div>
          </div>
        </div>

        {/* Name */}
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<Camera size={14} />}
          required
        />

        {/* Email (readonly) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            value={user?.email ?? ""}
            readOnly
            className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800"
          />
          <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isLoading} disabled={!fullName.trim()}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
