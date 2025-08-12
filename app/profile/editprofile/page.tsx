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
        // Format dateOfBirth for input field if it exists
        const userData = res.data;
        if (userData.dateOfBirth) {
          userData.dateOfBirth = new Date(userData.dateOfBirth).toISOString().split('T')[0];
        }
        setForm(userData);
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
            <label className="block text-sm font-medium">Date of Birth</label>
            <Input
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth || ""}
              onChange={handleChange}
              placeholder="Date of Birth"
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
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Education</label>
            <select
              name="education"
              value={form.education || ""}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Education Level</option>
              <option value="High School">High School</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="PhD">PhD</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Family Status</label>
            <select
              name="family"
              value={form.family || ""}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Family Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Married with Children">Married with Children</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Position/Major</label>
            <Input
              name="position"
              value={form.position || ""}
              onChange={handleChange}
              placeholder="e.g., Software Engineer, Computer Science, Teacher"
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="inline-flex items-center justify-center w-full mt-4">
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block mr-2" />
              <span className="font-semibold">{t('saving')}</span>
            </>
          ) : (
            <span className="font-semibold">{t('saveChanges')}</span>
          )}
        </Button>
      </form>
    </div>
  );
}