import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Activity, 
  Calendar,
  Trash2,
  RefreshCw,
  AlertCircle,
  Play,
  Terminal,
  Power
} from 'lucide-react';
import { VMInfo } from '../lib/vmService';

interface VMDashboardProps {
  vmInfo: VMInfo | null;
  loading: {
    fetchingInfo: boolean;
    deleting: boolean;
  };
  error: string | null;
  onRefresh: () => void;
  onDelete: () => void;
  onClearError: () => void;
  onStartInteractiveMode: () => void;
}

export const VMDashboard: React.FC<VMDashboardProps> = ({
  vmInfo,
  loading,
  error,
  onRefresh,
  onDelete,
  onClearError,
  onStartInteractiveMode,
}) => {
  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Error Loading VM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClearError}>
              Dismiss
            </Button>
            <Button variant="default" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading.fetchingInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Loading VM Information...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!vmInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            No VM Selected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please select a VM or enter your public key to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'running':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'stopped':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            VM Dashboard
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading.fetchingInfo}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading.fetchingInfo ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={onStartInteractiveMode}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Interactive Mode
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onDelete}
              disabled={loading.deleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {loading.deleting ? 'Deleting...' : 'Delete Instance'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* VM Status and Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">VM ID</label>
            <p className="font-mono text-sm bg-muted p-2 rounded">{vmInfo.id}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Badge className={getStatusColor(vmInfo.status)}>
              <Activity className="w-3 h-3 mr-1" />
              {vmInfo.status || 'Unknown'}
            </Badge>
          </div>
        </div>

        {/* IP Address */}
        {vmInfo.ip && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">IP Address</label>
            <p className="font-mono text-sm bg-muted p-2 rounded">{vmInfo.ip}</p>
          </div>
        )}

        {/* VM Specifications */}
        {vmInfo.specs && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Cpu className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">CPU:</span>
                  <span className="font-medium">{vmInfo.specs.cpu} cores</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Memory:</span>
                  <span className="font-medium">{vmInfo.specs.memory}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Storage:</span>
                  <span className="font-medium">{vmInfo.specs.storage}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Creation Date */}
        {vmInfo.created_at && (
          <>
            <Separator />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Created: {new Date(vmInfo.created_at).toLocaleString()}</span>
            </div>
          </>
        )}

        {/* VM Actions */}
        <Separator />
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Available Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={onStartInteractiveMode}
            >
              <Play className="w-5 h-5 text-green-600" />
              <div className="text-center">
                <p className="font-medium text-sm">Interactive Mode</p>
                <p className="text-xs text-muted-foreground">Start model execution</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-3 flex flex-col items-center gap-2 border-destructive/30 hover:bg-destructive/5"
              onClick={onDelete}
              disabled={loading.deleting}
            >
              <Power className="w-5 h-5 text-destructive" />
              <div className="text-center">
                <p className="font-medium text-sm text-destructive">
                  {loading.deleting ? 'Deleting...' : 'Delete Instance'}
                </p>
                <p className="text-xs text-muted-foreground">Permanently remove VM</p>
              </div>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ Deleting the instance will permanently remove your VM and all data
          </p>
        </div>
      </CardContent>
    </Card>
  );
};