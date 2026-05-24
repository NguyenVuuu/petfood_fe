import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { userService } from "@/services/user.service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SecurityPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: { oldPassword: string; newPassword: string }) =>
      userService.changeMyPassword(payload),
    onSuccess: () => {
      toast.success("Password changed successfully.");
      setOldPassword(""); setNewPassword(""); setConfirmPassword(""); setError("");
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e?.response?.data?.message ?? "Failed to change password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError("New password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setError("");
    mutation.mutate({ oldPassword, newPassword });
  };

  const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle} className="text-gray-400 hover:text-gray-600">
      {show ? <EyeOff size={14} /> : <Eye size={14} />}
    </button>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Security</h2>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-900/20">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Change Password</h3>
            <p className="text-sm text-gray-500">Use a strong password with at least 6 characters.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <Input
            label="Current Password"
            type={showOld ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            leftIcon={<Lock size={14} />}
            rightIcon={<EyeBtn show={showOld} toggle={() => setShowOld((v) => !v)} />}
            required
          />
          <Input
            label="New Password"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock size={14} />}
            rightIcon={<EyeBtn show={showNew} toggle={() => setShowNew((v) => !v)} />}
            minLength={6}
            required
          />
          <Input
            label="Confirm New Password"
            type={showNew ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
            leftIcon={<Lock size={14} />}
            error={error || undefined}
            minLength={6}
            required
          />
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={!oldPassword || !newPassword || !confirmPassword}
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
