import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    registerUser({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-amber-50 via-white to-teal-50 px-4 py-12 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-2xl shadow-md">
                🐾
              </div>
            </Link>
            <h1 className="mt-4 text-2xl font-extrabold text-gray-900 dark:text-white">
              {t("pawmart.auth.createAccount")}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("pawmart.auth.joinDesc")}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t("pawmart.auth.fullName")}
              type="text"
              placeholder={t("pawmart.auth.namePlaceholder")}
              leftIcon={<User size={14} />}
              error={errors.fullName?.message}
              {...register("fullName")}
            />

            <Input
              label={t("pawmart.auth.email")}
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={14} />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label={t("pawmart.auth.password")}
              type={showPass ? "text" : "password"}
              placeholder={t("pawmart.auth.passwordMin")}
              leftIcon={<Lock size={14} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
              error={errors.password?.message}
              {...register("password")}
            />

            <Input
              label={t("pawmart.auth.confirmPassword")}
              type={showPass ? "text" : "password"}
              placeholder={t("pawmart.auth.reEnterPassword")}
              leftIcon={<Lock size={14} />}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("pawmart.auth.agreeTerms")}{" "}
              <span className="text-amber-500 hover:underline cursor-pointer">{t("pawmart.auth.termsOfService")}</span>{" "}
              {t("pawmart.auth.and")}{" "}
              <span className="text-amber-500 hover:underline cursor-pointer">{t("pawmart.auth.privacyPolicy")}</span>.
            </p>

            <Button type="submit" size="lg" loading={isRegistering} className="w-full">
              {t("pawmart.auth.createAccount")} 🐾
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {t("pawmart.auth.alreadyHaveAccount")}{" "}
            <Link
              to="/login"
              className="font-semibold text-amber-500 hover:underline"
            >
              {t("pawmart.auth.signIn2")}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
