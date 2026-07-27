"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Settings = Record<string, string | null>;

export function SiteSettingsForm({ initialSettings }: { initialSettings: Settings }) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>(initialSettings);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Unable to save settings");
      toast.success("Site settings updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setLoading(false);
    }
  }

  const fields: { key: string; label: string; type?: "textarea" }[] = [
    { key: "companyName", label: "Company name" },
    { key: "tagline", label: "Tagline" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "serviceArea", label: "Service area" },
    { key: "businessHours", label: "Business hours" },
    { key: "primaryColor", label: "Primary color" },
    { key: "accentColor", label: "Accent color" },
    { key: "facebookUrl", label: "Facebook URL" },
    { key: "instagramUrl", label: "Instagram URL" },
    { key: "linkedinUrl", label: "LinkedIn URL" },
    { key: "aboutStory", label: "About story", type: "textarea" },
    { key: "mission", label: "Mission", type: "textarea" },
    { key: "values", label: "Values", type: "textarea" },
    { key: "servicePhilosophy", label: "Service philosophy", type: "textarea" },
    { key: "professionalStandards", label: "Professional standards", type: "textarea" },
    { key: "licensingLanguage", label: "Licensing language", type: "textarea" },
    { key: "insuranceLanguage", label: "Insurance language", type: "textarea" },
    { key: "emergencyDisclaimer", label: "Emergency disclaimer", type: "textarea" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Brand & Contact</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.key}
                  rows={4}
                  value={settings[field.key] ?? ""}
                  onChange={(event) => setSettings({ ...settings, [field.key]: event.target.value })}
                />
              ) : (
                <Input
                  id={field.key}
                  value={settings[field.key] ?? ""}
                  onChange={(event) => setSettings({ ...settings, [field.key]: event.target.value })}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save Settings
      </Button>
    </form>
  );
}
