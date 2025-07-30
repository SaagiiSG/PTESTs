"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLanguage } from '@/lib/language';

export default function PersonalProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    api
      .get("/api/profile/me")
      .then((res) => {
        setUser(res.data);
        setForm(res.data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post("/api/profile/update", form);
      setUser(res.data);
      toast.success("Profile updated successfully!");
    } catch (e) {
      toast.error("Failed to update profile.");
    }
    setSaving(false);
  };

  return (
    <div className="flex items-center justify-center h-full w-full ">
      <form className="w-full h-full p-8 bg-white rounded-3xl shadow space-y-6 flex flex-col justify-center">
        <h1 className="text-2xl font-semibold mb-4 text-center">{t('editProfile')}</h1>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">{t('name')}</label>
        <Input
          name="name"
          value={form.name || ""}
          onChange={handleChange}
          placeholder={t('name')}
        />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">{t('email')}</label>
        <Input
          name="email"
          type="email"
          value={form.email || ""}
          onChange={handleChange}
          placeholder={t('email')}
        />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">{t('age')}</label>
        <Input
          name="age"
          type="number"
          value={form.age || ""}
          onChange={handleChange}
          placeholder={t('age')}
        />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">{t('gender')}</label>
        <select
          name="gender"
          value={form.gender || ""}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">{t('selectGender')}</option>
          <option value="male">{t('male')}</option>
          <option value="female">{t('female')}</option>
        </select>
      </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full mt-4">
        {saving ? t('saving') : t('saveChanges')}
      </Button>
      </form>
    </div>
  );
}