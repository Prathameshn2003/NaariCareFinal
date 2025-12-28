/**
 * FeatureFlags
 * --------------------------------------------------
 * Enable / disable application features at runtime
 * without redeploying the application.
 *
 * Every change is logged for audit & safety.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Flag,
  Plus,
  RefreshCw,
  Loader2,
  Clock,
  Search,
} from "lucide-react";

/* ================= TYPES ================= */

interface FeatureFlag {
  id: string;
  feature_name: string;
  feature_key: string;
  description: string | null;
  is_enabled: boolean;
  last_toggled_by: string | null;
  last_toggled_at: string | null;
  created_at: string;
}

/* ================= COMPONENT ================= */

export const FeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<FeatureFlag | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    feature_name: "",
    description: "",
    is_enabled: true,
  });

  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  /* ================= FETCH FLAGS ================= */

  const fetchFlags = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("feature_flags")
      .select("*")
      .order("feature_name");

    if (error) {
      toast({
        title: "Failed to load feature flags",
        variant: "destructive",
      });
    }

    setFlags((data as FeatureFlag[]) || []);
    setLoading(false);
  };

  /* ================= REALTIME ================= */

  useEffect(() => {
    fetchFlags();

    const channel = supabase
      .channel("feature-flags")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feature_flags" },
        fetchFlags
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ================= ADMIN LOG ================= */

  const logAction = async (
    action: string,
    description: string,
    resourceId?: string
  ) => {
    if (!user) return;

    await supabase.from("admin_logs").insert({
      admin_id: user.id,
      admin_email: user.email,
      action_type: action,
      action_description: description,
      affected_resource: "feature_flags",
      affected_resource_id: resourceId,
    });
  };

  /* ================= TOGGLE FLAG ================= */

  const toggleFlag = async (flag: FeatureFlag) => {
    if (!isAdmin) return;

    setSaving(true);
    const newValue = !flag.is_enabled;

    const { error } = await supabase
      .from("feature_flags")
      .update({
        is_enabled: newValue,
        last_toggled_by: user?.id,
        last_toggled_at: new Date().toISOString(),
      })
      .eq("id", flag.id);

    if (error) {
      toast({
        title: "Failed to update feature",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    await logAction(
      "TOGGLE_FEATURE",
      `${newValue ? "Enabled" : "Disabled"} ${flag.feature_name}`,
      flag.id
    );

    toast({
      title: "Feature Updated",
      description: `${flag.feature_name} is now ${newValue ? "ON" : "OFF"}`,
    });

    setConfirmToggle(null);
    setSaving(false);
    fetchFlags();
  };

  /* ================= CREATE FLAG ================= */

  const createFlag = async () => {
    if (!form.feature_name.trim()) return;

    setSaving(true);

    const feature_key = form.feature_name
      .toLowerCase()
      .replace(/\s+/g, "_");

    const { data, error } = await supabase
      .from("feature_flags")
      .insert({
        feature_name: form.feature_name,
        feature_key,
        description: form.description || null,
        is_enabled: form.is_enabled,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Failed to create feature",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    await logAction(
      "CREATE_FEATURE",
      `Created feature ${form.feature_name}`,
      data.id
    );

    toast({ title: "Feature Created Successfully" });

    setOpenCreate(false);
    setForm({ feature_name: "", description: "", is_enabled: true });
    setSaving(false);
    fetchFlags();
  };

  /* ================= FILTER ================= */

  const filteredFlags = flags.filter(
    (f) =>
      f.feature_name.toLowerCase().includes(search.toLowerCase()) ||
      f.feature_key.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Flag className="w-6 h-6" />
            Feature Flags
          </h1>
          <p className="text-muted-foreground">
            Enable or disable features without redeploying
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchFlags}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Flag
          </Button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search feature flags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FLAGS GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFlags.map((flag) => (
          <Card
            key={flag.id}
            className={`border-l-4 ${
              flag.is_enabled
                ? "border-l-green-500"
                : "border-l-red-500 opacity-75"
            }`}
          >
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>{flag.feature_name}</CardTitle>
                  <CardDescription className="font-mono text-xs">
                    {flag.feature_key}
                  </CardDescription>
                </div>
                <Switch
                  checked={flag.is_enabled}
                  onCheckedChange={() => setConfirmToggle(flag)}
                />
              </div>
            </CardHeader>

            <CardContent>
              {flag.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {flag.description}
                </p>
              )}

              <div className="flex justify-between items-center">
                <Badge>{flag.is_enabled ? "ON" : "OFF"}</Badge>
                <span className="text-xs text-muted-foreground flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {flag.last_toggled_at
                    ? new Date(flag.last_toggled_at).toLocaleString()
                    : "Never"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CREATE MODAL */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Feature Flag</DialogTitle>
            <DialogDescription>
              Feature key will be auto-generated
            </DialogDescription>
          </DialogHeader>

          <Input
            placeholder="Feature Name"
            value={form.feature_name}
            onChange={(e) =>
              setForm({ ...form, feature_name: e.target.value })
            }
          />

          <Textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <div className="flex justify-between items-center">
            <span>Enabled</span>
            <Switch
              checked={form.is_enabled}
              onCheckedChange={(v) =>
                setForm({ ...form, is_enabled: v })
              }
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              Cancel
            </Button>
            <Button onClick={createFlag} disabled={saving}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM TOGGLE */}
      <AlertDialog
        open={!!confirmToggle}
        onOpenChange={() => setConfirmToggle(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Feature Toggle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {confirmToggle?.is_enabled ? "disable" : "enable"}{" "}
              <strong>{confirmToggle?.feature_name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={() =>
                confirmToggle && toggleFlag(confirmToggle)
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
