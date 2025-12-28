/**
 * AdminLogs - Track all admin actions for security compliance
 * Shows data deletion, feature toggles, system setting changes
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  History, Search, RefreshCw, Loader2, User, Calendar,
  Activity, Filter, Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action_type: string;
  action_description: string;
  affected_resource: string | null;
  affected_resource_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export const AdminLogs = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 20;
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      let query = supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * logsPerPage, currentPage * logsPerPage - 1);

      if (actionFilter !== 'all') {
        query = query.ilike('action_type', `%${actionFilter}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data as AdminLog[] || []);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Realtime subscription for new logs
    const channel = supabase
      .channel('admin-logs-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_logs' },
        () => fetchLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [actionFilter, currentPage]);

  const getActionBadge = (action: string) => {
    if (action.includes('DELETE')) {
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Delete</Badge>;
    }
    if (action.includes('CREATE')) {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Create</Badge>;
    }
    if (action.includes('UPDATE') || action.includes('TOGGLE')) {
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Update</Badge>;
    }
    return <Badge variant="outline">{action}</Badge>;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Admin Email', 'Action Type', 'Description', 'Resource', 'Resource ID'],
      ...logs.map(log => [
        new Date(log.created_at).toISOString(),
        log.admin_email,
        log.action_type,
        log.action_description,
        log.affected_resource || '',
        log.affected_resource_id || '',
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Admin logs exported to CSV",
    });
  };

  const filteredLogs = logs.filter(log =>
    log.action_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.admin_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get unique action types for filter
  const actionTypes = [...new Set(logs.map(l => {
    if (l.action_type.includes('DELETE')) return 'DELETE';
    if (l.action_type.includes('CREATE')) return 'CREATE';
    if (l.action_type.includes('UPDATE')) return 'UPDATE';
    if (l.action_type.includes('TOGGLE')) return 'TOGGLE';
    return l.action_type;
  }))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            Admin Activity Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete audit trail of all admin actions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportLogs}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{logs.length}</p>
                <p className="text-xs text-muted-foreground">Total Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {new Set(logs.map(l => l.admin_id)).size}
                </p>
                <p className="text-xs text-muted-foreground">Active Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {logs.filter(l => {
                    const today = new Date();
                    const logDate = new Date(l.created_at);
                    return logDate.toDateString() === today.toDateString();
                  }).length}
                </p>
                <p className="text-xs text-muted-foreground">Today's Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Filter className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-500">
                  {logs.filter(l => l.action_type.includes('DELETE')).length}
                </p>
                <p className="text-xs text-muted-foreground">Delete Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Resource</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {formatTime(log.created_at)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm truncate max-w-[150px]">
                            {log.admin_email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action_type)}</TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="text-sm truncate">{log.action_description}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.affected_resource || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled>
          Page {currentPage}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={logs.length < logsPerPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
