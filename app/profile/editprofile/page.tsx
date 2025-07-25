"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PersonalProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        <h1 className="text-2xl font-semibold mb-4 text-center">Edit Profile</h1>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Name</label>
        <Input
          name="name"
          value={form.name || ""}
          onChange={handleChange}
          placeholder="Name"
        />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Email</label>
        <Input
          name="email"
          type="email"
          value={form.email || ""}
          onChange={handleChange}
          placeholder="Email"
        />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Age</label>
        <Input
          name="age"
          type="number"
          value={form.age || ""}
          onChange={handleChange}
          placeholder="Age"
        />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Gender</label>
        <select
          name="gender"
          value={form.gender || ""}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full mt-4">
        {saving ? "Saving..." : "Save Changes"}
      </Button>
      </form>
    </div>
  );
}