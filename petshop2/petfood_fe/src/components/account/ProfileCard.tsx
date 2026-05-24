import { useRef, useState } from "react";
import { Camera, Mail, Calendar, Clock, Shield, Pencil, KeyRound, Upload } from "lucide-react";
import { User } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  user: User;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onAvatarChange?: (file: File) => void;
  isUploadingAvatar?: boolean;
}

const fmt = (v?: string | null) =>
  v ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v)) : "—";

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export function ProfileCard({ user, onEditProfile, onChangePassword, onAvatarChange, isUploadingAvatar }: ProfileCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [hoverAvatar, setHoverAvatar] = useState(false);
  const isActive = user.isActive !== false;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAvatarChange?.(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {/* ── Hero card ── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Gradient banner */}
        <div className="h-24 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="-mt-12 flex items-end gap-4">
              {/* Avatar */}
              <div
                className="relative cursor-pointer"
                onMouseEnter={() => setHoverAvatar(true)}
                onMouseLeave={() => setHoverAvatar(false)}
                onClick={() => fileRef.current?.click()}
              >
                <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-amber-100 shadow-md dark:border-gray-900">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-amber-700">
                      {getInitials(user.fullName)}
                    </div>
                  )}
                </div>
                {/* Hover overlay */}
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center rounded-full bg-black/40 transition-opacity",
                  hoverAvatar || isUploadingAvatar ? "opacity-100" : "opacity-0"
                )}>
                  {isUploadingAvatar
                    ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    : <Camera size={18} className="text-white" />
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
              </div>

              <div className="mb-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.fullName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEditProfile}>
                <Pencil size={14} /> Edit Profile
              </Button>
              <Button variant="outline" size="sm" onClick={onChangePassword}>
                <KeyRound size={14} /> Password
              </Button>
            </div>
          </div>

          {/* Status badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge type="account" value={isActive ? "active" : "inactive"} />
            <StatusBadge type="role" value={user.role} />
          </div>

          {/* Upload hint */}
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-amber-500"
          >
            <Upload size={12} />
            Click avatar to change photo
          </button>
        </div>
      </div>

      {/* ── Info grid ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={<Mail size={16} />} label="Email Address" value={user.email} />
        <InfoCard icon={<Calendar size={16} />} label="Member Since" value={fmt(user.createdAt)} />
        <InfoCard icon={<Clock size={16} />} label="Last Login" value={fmt(user.lastLoginAt)} />
        <InfoCard
          icon={<Shield size={16} />}
          label="Account Status"
          value={
            <span className={cn("font-semibold", isActive ? "text-emerald-600" : "text-red-500")}>
              {isActive ? "Active & Verified" : "Inactive"}
            </span>
          }
        />
      </div>

      {/* ── Inactive reason ── */}
      {!isActive && user.inactiveReason && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Account disabled: {user.inactiveReason}
          </p>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-900/20">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <div className="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}
