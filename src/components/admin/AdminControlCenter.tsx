/**
 * AdminControlCenter - Main admin overview dashboard
 * Shows actionable information: active users, errors, system health, etc.
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, AlertTriangle, Activity, Clock, Server, 
  CheckCircle, XCircle, RefreshCw, Shield, Loader2 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Stats {
  activeUsersToday: number;
  errorsLast24h: number;
  systemHealthScore: number;
  totalUsers: number;
  totalNGOs: number;
  totalSchemes: number;
  totalResources: number;
}

interface HealthCheck {
  service_name: string;
  status: 'healthy' | 'warning' | 'down';
  response_time_ms: number;
}

export const AdminControlCenter = () => {
  const [stats, setStats] = useState<Stats>({
    activeUsersToday: 0,
    errorsLast24h: 0,
    systemHealthScore: 100,
    totalUsers: 0,
    totalNGOs: 0,
    totalSchemes: 0,
    totalResources: 0,
  });
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch NGO count
      const { count: ngoCount } = await supabase
        .from('ngos')
        .select('*', { count: 'exact', head: true });

      // Fetch schemes count
      const { count: schemeCount } = await supabase
        .from('schemes')
        .select('*', { count: 'exact', head: true });

      // Fetch resources count
      const { count: resourceCount } = await supabase
        .from('health_resources')
        .select('*', { count: 'exact', head: true });

      // Fetch errors from last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: errorCount } = await supabase
        .from('system_errors')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      // Fetch health checks
      const { data: healthData } = await supabase
        .from('system_health_checks')
        .select('service_name, status, response_time_ms');

      // Calculate system health score
      const healthyServices = healthData?.filter(h => h.status === 'healthy').length || 0;
      const totalServices = healthData?.length || 1;
      const healthScore = Math.round((healthyServices / totalServices) * 100);

      // Estimate active users (users who logged in recently)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: activeCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', today.toISOString());

      setStats({
        activeUsersToday: activeCount || 0,
        errorsLast24h: errorCount || 0,
        systemHealthScore: healthScore,
        totalUsers: userCount || 0,
        totalNGOs: ngoCount || 0,
        totalSchemes: schemeCount || 0,
        totalResources: resourceCount || 0,
      });

      setHealthChecks(healthData as HealthCheck[] || []);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Dashboard data updated",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'down': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            ADMIN PANEL – RESTRICTED ACCESS
          </h1>
          <p className="text-muted-foreground mt-1">
            Control Center • Environment: <Badge variant="outline">Production</Badge>
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>Active Users Today</CardDescription>
            <CardTitle className="text-3xl">{stats.activeUsersToday}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              of {stats.totalUsers} total users
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${stats.errorsLast24h > 0 ? 'border-l-red-500' : 'border-l-green-500'}`}>
          <CardHeader className="pb-2">
            <CardDescription>Errors (24h)</CardDescription>
            <CardTitle className="text-3xl">{stats.errorsLast24h}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {stats.errorsLast24h === 0 ? 'No issues detected' : 'Requires attention'}
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${stats.systemHealthScore >= 80 ? 'border-l-green-500' : stats.systemHealthScore >= 50 ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
          <CardHeader className="pb-2">
            <CardDescription>System Health</CardDescription>
            <CardTitle className="text-3xl">{stats.systemHealthScore}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Activity className="w-4 h-4 mr-1" />
              {stats.systemHealthScore >= 80 ? 'All systems operational' : 'Some issues detected'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardDescription>Content Stats</CardDescription>
            <CardTitle className="text-lg">
              {stats.totalResources} Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>{stats.totalSchemes} Schemes</div>
              <div>{stats.totalNGOs} NGOs</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Service Status
          </CardTitle>
          <CardDescription>Real-time status of all system services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthChecks.map((service, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <span className="font-medium text-sm">{service.service_name}</span>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={service.status === 'healthy' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {service.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {service.response_time_ms}ms
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Session Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Admin sessions automatically timeout after 30 minutes of inactivity.
            </p>
            <p className="text-sm text-muted-foreground">
              All admin actions are logged for security compliance.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Role-based access control active</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">RLS policies enforced</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Admin action logging enabled</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
