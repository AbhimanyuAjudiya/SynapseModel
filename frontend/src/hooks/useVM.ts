import { useState, useCallback } from 'react';
import { vmService, VMInfo, ModelExecutionResponse } from '../lib/vmService';

interface UseVMReturn {
  // State
  vmInfo: VMInfo | null;
  vmList: VMInfo[];
  currentVmId: string;
  publicKey: string;
  loading: {
    fetchingInfo: boolean;
    fetchingId: boolean;
    deleting: boolean;
    executing: boolean;
    fetchingList: boolean;
  };
  error: string | null;
  executionResult: ModelExecutionResponse | null;

  // Actions
  setPublicKey: (key: string) => void;
  setCurrentVmId: (id: string) => void;
  fetchVMInfo: (vmId?: string) => Promise<void>;
  fetchVMId: (publicKey?: string) => Promise<void>;
  deleteVM: (vmId?: string, publicKey?: string) => Promise<void>;
  executeModel: (input: string, vmIp?: string) => Promise<void>;
  executeSentiment: (text: string, vmIp?: string) => Promise<void>;
  fetchAllVMs: () => Promise<void>;
  clearError: () => void;
  clearExecutionResult: () => void;
}

export const useVM = (): UseVMReturn => {
  const [vmInfo, setVmInfo] = useState<VMInfo | null>(null);
  const [vmList, setVmList] = useState<VMInfo[]>([]);
  const [currentVmId, setCurrentVmId] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>('');
  const [loading, setLoading] = useState({
    fetchingInfo: false,
    fetchingId: false,
    deleting: false,
    executing: false,
    fetchingList: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<ModelExecutionResponse | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearExecutionResult = useCallback(() => {
    setExecutionResult(null);
  }, []);

  const fetchVMInfo = useCallback(async (vmId?: string) => {
    const id = vmId || currentVmId;
    if (!id) {
      setError('VM ID is required');
      return;
    }

    setLoading(prev => ({ ...prev, fetchingInfo: true }));
    setError(null);

    try {
      const info = await vmService.getVMInfo(id);
      setVmInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch VM info');
    } finally {
      setLoading(prev => ({ ...prev, fetchingInfo: false }));
    }
  }, [currentVmId]);

  const fetchVMId = useCallback(async (key?: string) => {
    const pubKey = key || publicKey;
    if (!pubKey) {
      setError('Public key is required');
      return;
    }

    setLoading(prev => ({ ...prev, fetchingId: true }));
    setError(null);

    try {
      const result = await vmService.getVMId(pubKey);
      setCurrentVmId(result.vm_id);
      // Automatically fetch VM info after getting ID
      await fetchVMInfo(result.vm_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch VM ID');
    } finally {
      setLoading(prev => ({ ...prev, fetchingId: false }));
    }
  }, [publicKey, fetchVMInfo]);

  const deleteVM = useCallback(async (vmId?: string, pubKey?: string) => {
    const id = vmId || currentVmId;
    const key = pubKey || publicKey;
    
    if (!id || !key) {
      setError('VM ID and public key are required');
      return;
    }

    setLoading(prev => ({ ...prev, deleting: true }));
    setError(null);

    try {
      await vmService.deleteVM(id, key);
      // Clear VM info after successful deletion
      if (id === currentVmId) {
        setVmInfo(null);
        setCurrentVmId('');
      }
      // Refresh VM list
      await fetchAllVMs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete VM');
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  }, [currentVmId, publicKey]);

  const executeModel = useCallback(async (input: string, vmIp?: string) => {
    const ip = vmIp || vmInfo?.ip;
    if (!ip) {
      setError('VM IP address is required');
      return;
    }

    if (!input.trim()) {
      setError('Input text is required');
      return;
    }

    setLoading(prev => ({ ...prev, executing: true }));
    setError(null);
    setExecutionResult(null);

    try {
      const result = await vmService.executeModel(ip, { text: input });
      setExecutionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute model');
    } finally {
      setLoading(prev => ({ ...prev, executing: false }));
    }
  }, [vmInfo?.ip]);

  const executeSentiment = useCallback(async (text: string, vmIp?: string) => {
    const ip = vmIp || vmInfo?.ip;
    if (!ip) {
      setError('VM IP address is required');
      return;
    }

    if (!text.trim()) {
      setError('Input text is required');
      return;
    }

    setLoading(prev => ({ ...prev, executing: true }));
    setError(null);
    setExecutionResult(null);

    try {
      const result = await vmService.executeSentimentPrediction(ip, text);
      setExecutionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute sentiment prediction');
    } finally {
      setLoading(prev => ({ ...prev, executing: false }));
    }
  }, [vmInfo?.ip]);

  const fetchAllVMs = useCallback(async () => {
    setLoading(prev => ({ ...prev, fetchingList: true }));
    setError(null);

    try {
      const vms = await vmService.getAllVMs();
      setVmList(vms);
    } catch (err) {
      // This might fail if the endpoint doesn't exist, so we'll handle it gracefully
      console.warn('Failed to fetch VM list:', err);
    } finally {
      setLoading(prev => ({ ...prev, fetchingList: false }));
    }
  }, []);

  return {
    // State
    vmInfo,
    vmList,
    currentVmId,
    publicKey,
    loading,
    error,
    executionResult,

    // Actions
    setPublicKey,
    setCurrentVmId,
    fetchVMInfo,
    fetchVMId,
    deleteVM,
    executeModel,
    executeSentiment,
    fetchAllVMs,
    clearError,
    clearExecutionResult,
  };
};