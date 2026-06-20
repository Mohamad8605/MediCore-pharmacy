import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getConfirmationSetting, toggleConfirmation } from "@/lib/admin-service";

export function SettingsTab() {
  const [requireConfirmation, setRequireConfirmation] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    getConfirmationSetting()
      .then((value: boolean) => {
        setRequireConfirmation(value);
        setSettingsLoaded(true);
      })
      .catch(() => setSettingsLoaded(true));
  }, []);

  async function toggleConfirmationSetting(checked: boolean) {
    setRequireConfirmation(checked);
    try {
      await toggleConfirmation(checked);
      toast.success("Email confirmation " + (checked ? "enabled" : "disabled"));
    } catch {
      toast.error("Failed to save setting");
      setRequireConfirmation(!checked);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="email-confirmation" className="text-base font-medium">
                Require email confirmation
              </Label>
              <p className="text-sm text-muted-foreground">
                When enabled, new users must verify their email before they can sign in.
              </p>
            </div>
            <Switch
              id="email-confirmation"
              checked={requireConfirmation}
              onCheckedChange={toggleConfirmationSetting}
              disabled={!settingsLoaded}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
