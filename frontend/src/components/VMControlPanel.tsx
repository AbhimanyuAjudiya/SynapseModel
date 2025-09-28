import React, { ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { 
  Key, 
  Search, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Server
} from 'lucide-react';

interface VMControlPanelProps {
  publicKey: string;
  currentVmId: string;
  loading: {
    fetchingId: boolean;
    fetchingInfo: boolean;
  };
  error: string | null;
  onPublicKeyChange: (key: string) => void;
  onFetchVMId: () => void;
  onClearError: () => void;
}

export const VMControlPanel: React.FC<VMControlPanelProps> = ({
  publicKey,
  currentVmId,
  loading,
  error,
  onPublicKeyChange,
  onFetchVMId,
  onClearError,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          VM Control Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-destructive font-medium">Error</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClearError}>
              ×
            </Button>
          </div>
        )}

        {/* Wallet Public Key Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Wallet Authentication</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="publicKey">Enter your wallet public key:</Label>
            <div className="flex gap-2">
              <Input
                id="publicKey"
                type="password"
                placeholder="Your wallet's public key..."
                value={publicKey}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onPublicKeyChange(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={onFetchVMId} 
                disabled={!publicKey.trim() || loading.fetchingId}
                size="default"
              >
                {loading.fetchingId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This will automatically fetch your VM and connect to it
            </p>
          </div>
        </div>

        {/* VM Status Display */}
        {currentVmId && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Connected VM</h3>
              </div>
              
              <div className="space-y-2">
                <Label>VM ID:</Label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <code className="text-sm font-mono">{currentVmId}</code>
                </div>
                <p className="text-xs text-muted-foreground">
                  VM fetched successfully from your wallet
                </p>
              </div>
            </div>
          </>
        )}

        {/* Status Indicators */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${publicKey ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-muted-foreground">
                Wallet Key: {publicKey ? 'Connected' : 'Required'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${currentVmId ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-muted-foreground">
                VM: {currentVmId ? 'Connected' : 'Not Found'}
              </span>
            </div>
          </div>
          
          {currentVmId && publicKey && (
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Ready for Interaction
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};