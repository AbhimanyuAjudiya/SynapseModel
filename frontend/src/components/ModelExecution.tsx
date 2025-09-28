import React, { useState, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { 
  Play, 
  Copy, 
  Download, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  Brain,
  Zap
} from 'lucide-react';
import { ModelExecutionResponse } from '../lib/vmService';

interface ModelExecutionProps {
  vmIp: string | null;
  loading: boolean;
  executionResult: ModelExecutionResponse | null;
  onExecuteModel: (input: string) => void;
  onExecuteSentiment: (text: string) => void;
  onClearResult: () => void;
}

export const ModelExecution: React.FC<ModelExecutionProps> = ({
  vmIp,
  loading,
  executionResult,
  onExecuteModel,
  onExecuteSentiment,
  onClearResult,
}) => {
  const [input, setInput] = useState('');
  const [executionType, setExecutionType] = useState<'general' | 'sentiment'>('general');

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleExecute = () => {
    if (!input.trim()) return;
    
    if (executionType === 'sentiment') {
      onExecuteSentiment(input);
    } else {
      onExecuteModel(input);
    }
  };

  const copyOutput = () => {
    if (executionResult) {
      const output = JSON.stringify(executionResult, null, 2);
      navigator.clipboard.writeText(output);
    }
  };

  const downloadOutput = () => {
    if (executionResult) {
      const output = JSON.stringify(executionResult, null, 2);
      const blob = new Blob([output], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `model-output-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getResultDisplay = () => {
    if (!executionResult) return null;

    if (executionResult.error) {
      return (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">Execution Error</p>
            <p className="text-sm text-muted-foreground mt-1">{executionResult.error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Success indicator */}
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Execution Successful</span>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {executionResult.prediction && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Prediction:</Label>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">{executionResult.prediction}</p>
              </div>
            </div>
          )}

          {executionResult.sentiment && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sentiment:</Label>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={executionResult.sentiment === 'positive' ? 'default' : 
                           executionResult.sentiment === 'negative' ? 'destructive' : 'secondary'}
                >
                  {executionResult.sentiment}
                </Badge>
                {executionResult.confidence && (
                  <span className="text-xs text-muted-foreground">
                    {(executionResult.confidence * 100).toFixed(1)}% confidence
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Raw JSON Response */}
          <details className="space-y-2">
            <summary className="text-sm font-medium cursor-pointer hover:text-primary">
              Raw Response (JSON)
            </summary>
            <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-x-auto">
              {JSON.stringify(executionResult, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  };

  if (!vmIp) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Model Execution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Please select and load a VM to start executing models
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Input & Execution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Execution Type Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Execution Type:</Label>
            <div className="flex gap-2">
              <Button
                variant={executionType === 'general' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExecutionType('general')}
              >
                General Model
              </Button>
              <Button
                variant={executionType === 'sentiment' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExecutionType('sentiment')}
              >
                Sentiment Analysis
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {executionType === 'sentiment' 
                ? 'Execute sentiment analysis on port 8080' 
                : 'Execute general model on port 8000'}
            </p>
          </div>

          <Separator />

          {/* VM Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Target VM:</span>
            <code className="bg-muted px-2 py-1 rounded text-xs">{vmIp}</code>
          </div>

          {/* Input Textarea */}
          <div className="space-y-2">
            <Label htmlFor="modelInput">Input Text:</Label>
            <Textarea
              id="modelInput"
              placeholder={executionType === 'sentiment' 
                ? 'Enter text for sentiment analysis...' 
                : 'Enter your prompt or input here...'}
              value={input}
              onChange={handleInputChange}
              className="min-h-[200px] resize-none font-mono text-sm"
            />
          </div>

          {/* Execute Button */}
          <Button 
            onClick={handleExecute} 
            disabled={!input.trim() || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Executing...' : 'Execute Model'}
          </Button>
        </CardContent>
      </Card>

      {/* Output Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Output & Results
            </div>
            {executionResult && !executionResult.error && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyOutput}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadOutput}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="ghost" size="sm" onClick={onClearResult}>
                  Clear
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Executing model...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This may take a few moments
                  </p>
                </div>
              </div>
            ) : executionResult ? (
              getResultDisplay()
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Output will appear here after model execution
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Add Label component if not available
const Label: React.FC<{ children: React.ReactNode; className?: string; htmlFor?: string }> = ({ 
  children, 
  className = '', 
  htmlFor 
}) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium ${className}`}>
    {children}
  </label>
);