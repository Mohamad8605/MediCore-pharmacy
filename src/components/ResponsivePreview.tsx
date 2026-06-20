import { useState, useEffect, useCallback } from "react";
import { Monitor, Tablet, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type DeviceType = "desktop" | "tablet" | "mobile";

interface DeviceOption {
  key: DeviceType;
  label: string;
  width: number;
  icon: typeof Monitor;
}

const DEVICES: DeviceOption[] = [
  { key: "desktop", label: "Desktop", width: 1280, icon: Monitor },
  { key: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { key: "mobile", label: "Mobile", width: 375, icon: Smartphone },
];

const STORAGE_KEY = "medi-core-responsive-preview";

function loadDevice(): DeviceType | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "desktop" || stored === "tablet" || stored === "mobile") return stored;
  return null;
}

export function ResponsivePreviewProvider({ children }: { children: React.ReactNode }) {
  const [device, setDeviceState] = useState<DeviceType | null>(loadDevice);

  const setDevice = useCallback((d: DeviceType | null) => {
    setDeviceState(d);
    if (typeof window !== "undefined") {
      if (d) window.localStorage.setItem(STORAGE_KEY, d);
      else window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!device) return;
    const handler = () => setDevice(loadDevice());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [device, setDevice]);

  const activeDevice = DEVICES.find((d) => d.key === device);

  return (
    <div className="relative">
      {device && activeDevice && (
        <div className="fixed inset-0 z-50 flex flex-col bg-muted/80">
          <div className="flex items-center justify-center gap-2 border-b bg-background px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground mr-2">Preview:</span>
            {DEVICES.map((d) => {
              const Icon = d.icon;
              return (
                <Button
                  key={d.key}
                  variant={device === d.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDevice(d.key)}
                  className="gap-1.5 text-xs"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {d.label} {d.width}px
                </Button>
              );
            })}
            <div className="ml-4 h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDevice(null)}
              className="gap-1.5 text-xs text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Exit preview
            </Button>
          </div>
          <div className="flex flex-1 items-start justify-center overflow-auto p-4">
            <div
              style={{ maxWidth: activeDevice.width }}
              className="w-full min-h-full overflow-hidden rounded-2xl border-2 border-border bg-background shadow-2xl"
            >
              {children}
            </div>
          </div>
        </div>
      )}
      <div className={device ? "hidden" : ""}>{children}</div>
      {!device && (
        <button
          onClick={() => setDevice("mobile")}
          className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-xs font-medium shadow-lg hover:bg-accent"
          title="Responsive preview"
        >
          <Smartphone className="h-4 w-4" />
          Preview
        </button>
      )}
    </div>
  );
}
