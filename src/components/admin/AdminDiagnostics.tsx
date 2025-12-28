import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

type TestStatus = "idle" | "running" | "pass" | "fail";

interface TestResult {
  status: TestStatus;
  message?: string;
}

export const AdminDiagnostics = () => {
  const [loginTest, setLoginTest] = useState<TestResult>({ status: "idle" });
  const [dbTest, setDbTest] = useState<TestResult>({ status: "idle" });
  const [apiTest, setApiTest] = useState<TestResult>({ status: "idle" });
  const [mapTest, setMapTest] = useState<TestResult>({ status: "idle" });

  /* ================= LOGIN TEST ================= */
  const testLogin = async () => {
    setLoginTest({ status: "running" });
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setLoginTest({ status: "pass", message: "Auth service working" });
    } else {
      setLoginTest({ status: "fail", message: "No active session" });
    }
  };

  /* ================= DATABASE TEST ================= */
  const testDatabase = async () => {
    setDbTest({ status: "running" });
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (!error) {
      setDbTest({ status: "pass", message: "Database read OK" });
    } else {
      setDbTest({ status: "fail", message: error.message });
    }
  };

  /* ================= API TEST ================= */
  const testAPI = async () => {
    setApiTest({ status: "running" });
    try {
      await fetch("https://jsonplaceholder.typicode.com/posts/1");
      setApiTest({ status: "pass", message: "External API reachable" });
    } catch {
      setApiTest({ status: "fail", message: "API not reachable" });
    }
  };

  /* ================= MAP TEST ================= */
  const testMap = async () => {
    setMapTest({ status: "running" });
    try {
      await fetch("https://maps.googleapis.com");
      setMapTest({ status: "pass", message: "Maps service reachable" });
    } catch {
      setMapTest({ status: "fail", message: "Maps service failed" });
    }
  };

  const renderStatus = (test: TestResult) => {
    if (test.status === "running") return <Loader2 className="animate-spin" />;
    if (test.status === "pass") return <CheckCircle className="text-green-500" />;
    if (test.status === "fail") return <XCircle className="text-red-500" />;
    return null;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">

      {/* LOGIN TEST */}
      <Card>
        <CardHeader><CardTitle>Login Test</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={testLogin}>Run Test</Button>
          <div className="flex items-center gap-2">
            {renderStatus(loginTest)}
            <span>{loginTest.message}</span>
          </div>
        </CardContent>
      </Card>

      {/* DATABASE TEST */}
      <Card>
        <CardHeader><CardTitle>Database Test</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={testDatabase}>Run Test</Button>
          <div className="flex items-center gap-2">
            {renderStatus(dbTest)}
            <span>{dbTest.message}</span>
          </div>
        </CardContent>
      </Card>

      {/* API TEST */}
      <Card>
        <CardHeader><CardTitle>API Connectivity Test</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={testAPI}>Run Test</Button>
          <div className="flex items-center gap-2">
            {renderStatus(apiTest)}
            <span>{apiTest.message}</span>
          </div>
        </CardContent>
      </Card>

      {/* MAP TEST */}
      <Card>
        <CardHeader><CardTitle>Map Loading Test</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={testMap}>Run Test</Button>
          <div className="flex items-center gap-2">
            {renderStatus(mapTest)}
            <span>{mapTest.message}</span>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
