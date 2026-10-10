/**
 * /espace/profil — compte de l'apprenant (GET/PUT /learner/profile : nom, téléphone, pays) et changement de mot de passe
 * (PUT /auth/change-password : 204, 400 si le mot de passe actuel est incorrect).
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Loader2, LogOut } from "lucide-react";

import { Button, Card } from "@/components/shared";
import { inputClass } from "@/components/admin/AdminKit";
import { LearnerShell } from "@/components/learner/LearnerShell";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLearnerProfile, useUpdateLearnerProfile } from "@/hooks/useLearner";
import { authService } from "@/services/api/authService";
import { ApiError } from "@/services/httpClient";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Saisissez votre mot de passe actuel"),
    newPassword: z.string().min(8, "Au moins 8 caractères"),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { path: ["confirm"], message: "Les deux mots de passe ne correspondent pas" })
  .refine((v) => v.newPassword !== v.currentPassword, { path: ["newPassword"], message: "Choisissez un mot de passe différent de l'actuel" });
type FormValues = z.infer<typeof schema>;

function PasswordField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
      {label}
      {children}
      {error && <span role="alert" className="text-xs font-normal text-error">{error}</span>}
    </label>
  );
}

function ProfileForm() {
  const { toast } = useToast();
  const profile = useLearnerProfile();
  const update = useUpdateLearnerProfile();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (!profile.data) return;
    setFirstName(profile.data.firstName ?? "");
    setLastName(profile.data.lastName ?? "");
    setPhone(profile.data.phone ?? "");
    setCountry(profile.data.country ?? "");
  }, [profile.data]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), country: country.trim() });
      toast({ title: "Profil mis à jour" });
    } catch (err) {
      toast({ title: "Mise à jour impossible", description: err instanceof ApiError ? err.message : "Réessayez dans un instant.", variant: "destructive" });
    }
  };

  return (
    <Card radius="stat" className="flex flex-col gap-4 border border-[#E7E0D4] p-5 lg:p-6">
      <h2 className="font-heading text-xl font-bold text-navy">Mes informations</h2>
      {profile.isLoading && <Loader2 className="h-5 w-5 animate-spin text-ink-secondary" />}
      {profile.isError && <p role="alert" className="text-sm text-error">Impossible de charger votre profil pour le moment.</p>}
      {profile.data && (
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">Prénom
            <input required maxLength={100} className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">Nom
            <input maxLength={100} className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">Téléphone / WhatsApp
            <input type="tel" maxLength={30} className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">Pays
            <input maxLength={100} className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country-name" />
          </label>
          <p className="text-xs text-ink-secondary sm:col-span-2">
            E-mail : <strong className="text-ink">{profile.data.email}</strong>{profile.data.emailVerified ? " (vérifié)" : ""}. Pour le modifier, contactez-nous.
          </p>
          <div className="sm:col-span-2">
            <Button type="submit" variant="navy" shape="rounded" className="w-fit" disabled={update.isPending || !firstName.trim()}>
              {update.isPending ? <Loader2 className="animate-spin" /> : "Enregistrer"}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

export default function EspaceProfil() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const me = useQuery({ queryKey: ["auth", "me"], queryFn: authService.getCurrentUser, staleTime: 5 * 60 * 1000 });
  const change = useMutation({ mutationFn: (v: FormValues) => authService.changePassword(v.currentPassword, v.newPassword) });
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await change.mutateAsync(values);
      reset();
      toast({ title: "Mot de passe modifié" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError("currentPassword", { message: /^Erreur \d+$/.test(err.message) ? "Mot de passe actuel incorrect" : err.message });
      } else {
        toast({ title: "Modification impossible", description: "Réessayez dans un instant.", variant: "destructive" });
      }
    }
  });

  return (
    <LearnerShell title="Mon profil" description="Votre compte apprenant">
      <div className="flex max-w-xl flex-col gap-6">
        <Card radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5 lg:p-6">
          <h2 className="font-heading text-xl font-bold text-navy">Mon compte</h2>
          {me.isLoading && <Loader2 className="h-5 w-5 animate-spin text-ink-secondary" />}
          {me.isError && <p role="alert" className="text-sm text-error">Impossible de charger votre profil pour le moment.</p>}
          {me.data && (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-ink-secondary">Nom</dt><dd className="font-semibold text-ink">{me.data.fullName}</dd></div>
              <div><dt className="text-ink-secondary">E-mail</dt><dd className="break-all font-semibold text-ink">{me.data.email}</dd></div>
            </dl>
          )}
          <Button
            type="button"
            variant="outline"
            shape="rounded"
            size="sm"
            className="w-fit"
            onClick={() => { signOut(); navigate("/connexion"); }}
          >
            <LogOut />Se déconnecter
          </Button>
        </Card>

        <ProfileForm />

        <Card radius="stat" className="flex flex-col gap-4 border border-[#E7E0D4] p-5 lg:p-6">
          <h2 className="font-heading text-xl font-bold text-navy">Changer mon mot de passe</h2>
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <PasswordField label="Mot de passe actuel" error={errors.currentPassword?.message}>
              <input type="password" autoComplete="current-password" className={inputClass} {...register("currentPassword")} />
            </PasswordField>
            <PasswordField label="Nouveau mot de passe" error={errors.newPassword?.message}>
              <input type="password" autoComplete="new-password" className={inputClass} {...register("newPassword")} />
            </PasswordField>
            <PasswordField label="Confirmer le nouveau mot de passe" error={errors.confirm?.message}>
              <input type="password" autoComplete="new-password" className={inputClass} {...register("confirm")} />
            </PasswordField>
            <Button type="submit" variant="navy" shape="rounded" className="w-fit" disabled={change.isPending}>
              {change.isPending ? <Loader2 className="animate-spin" /> : "Enregistrer"}
            </Button>
          </form>
        </Card>
      </div>
    </LearnerShell>
  );
}
