import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserRound } from "lucide-react";
import { userService } from "@/services/user.service";
import { uploadService } from "@/services/upload.service";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { updateUser } from "@/store/authSlice";
import { ProfileCard } from "@/components/account/ProfileCard";
import { EditProfileModal } from "@/components/account/EditProfileModal";
import { ChangePasswordModal } from "@/components/account/ChangePasswordModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

const PROFILE_KEY = ["account-profile"];

export default function ProfilePage() {
  const qc = useQueryClient();
  const dispatch = useAppDispatch();
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const profileQuery = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => userService.getMe(),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { fullName: string; avatarFile?: File | null }) => {
      let avatarUrl = profileQuery.data?.avatarUrl;
      if (payload.avatarFile) {
        const uploaded = await uploadService.uploadAvatar(payload.avatarFile);
        avatarUrl = uploaded.url;
      }
      return userService.updateMe({ fullName: payload.fullName, avatarUrl });
    },
    onSuccess: (user) => {
      qc.setQueryData(PROFILE_KEY, user);
      dispatch(updateUser(user));
      setEditOpen(false);
      toast.success("Profile updated!");
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e?.response?.data?.message ?? "Failed to update profile");
    },
  });

  // Quick avatar upload directly from ProfileCard click
  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploaded = await uploadService.uploadAvatar(file);
      return userService.updateMe({
        fullName: profileQuery.data?.fullName ?? "",
        avatarUrl: uploaded.url,
      });
    },
    onSuccess: (user) => {
      qc.setQueryData(PROFILE_KEY, user);
      dispatch(updateUser(user));
      toast.success("Avatar updated!");
    },
    onError: () => toast.error("Failed to upload avatar"),
  });

  const passwordMutation = useMutation({
    mutationFn: (payload: { oldPassword: string; newPassword: string }) =>
      userService.changeMyPassword(payload),
    onSuccess: () => {
      setPasswordOpen(false);
      toast.success("Password changed successfully.");
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e?.response?.data?.message ?? "Failed to change password");
    },
  });

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-56 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <EmptyState
        icon={<UserRound size={24} />}
        title="Unable to load your profile"
        description="Please refresh the page and try again."
      />
    );
  }

  return (
    <>
      <ProfileCard
        user={profileQuery.data}
        onEditProfile={() => setEditOpen(true)}
        onChangePassword={() => setPasswordOpen(true)}
        onAvatarChange={(file) => avatarMutation.mutate(file)}
        isUploadingAvatar={avatarMutation.isPending}
      />
      <EditProfileModal
        isOpen={editOpen}
        user={profileQuery.data}
        isLoading={updateMutation.isPending}
        onClose={() => setEditOpen(false)}
        onSave={(p) => updateMutation.mutateAsync(p)}
      />
      <ChangePasswordModal
        isOpen={passwordOpen}
        isLoading={passwordMutation.isPending}
        onClose={() => setPasswordOpen(false)}
        onSave={(p) => passwordMutation.mutateAsync(p)}
      />
    </>
  );
}
