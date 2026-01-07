'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  Copy, 
  Check, 
  ChevronRight,
  Server,
  Terminal
} from 'lucide-react';

interface EndpointInfo {
  name: string;
  method: 'GET' | 'POST';
  endpoint: string;
  description: string;
  requestBody?: string;
  responseExample: string;
}

interface ApiDocumentationProps {
  endpoints: EndpointInfo[];
  baseUrl?: string;
}

export default function ApiDocumentation({ endpoints, baseUrl = 'http://localhost:8000' }: ApiDocumentationProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const generateCurlCommand = (endpoint: EndpointInfo): string => {
    if (endpoint.method === 'GET') {
      return `curl -X GET "${baseUrl}${endpoint.endpoint}"`;
    }
    return `curl -X POST "${baseUrl}${endpoint.endpoint}" \\
  -H "Content-Type: application/json" \\
  -d '${endpoint.requestBody}'`;
  };

  const methodColors = {
    GET: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass rounded-2xl border border-claude-border overflow-hidden"
    >
      <div className="p-6 border-b border-claude-border">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-claude-orange/20 text-claude-orange">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-claude-text">API Endpoints</h3>
            <p className="text-claude-text-secondary text-sm">
              FastAPI backend documentation • Base URL: <code className="text-claude-orange">{baseUrl}</code>
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-claude-border">
        {endpoints.map((endpoint, index) => (
          <div key={index} className="p-0">
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full p-6 flex items-center justify-between hover:bg-claude-orange/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${methodColors[endpoint.method]}`}>
                  {endpoint.method}
                </span>
                <code className="text-claude-text font-mono">{endpoint.endpoint}</code>
                <span className="text-claude-text-secondary hidden sm:inline">— {endpoint.name}</span>
              </div>
              <ChevronRight 
                className={`w-5 h-5 text-claude-text-muted transition-transform ${expandedIndex === index ? 'rotate-90' : ''}`} 
              />
            </button>

            {expandedIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="px-6 pb-6"
              >
                <p className="text-claude-text-secondary mb-4">{endpoint.description}</p>

                {endpoint.requestBody && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-claude-text mb-2 flex items-center gap-2">
                      <Code className="w-4 h-4" /> Request Body
                    </p>
                    <pre className="p-4 rounded-lg bg-claude-bg border border-claude-border overflow-x-auto">
                      <code className="text-sm text-claude-text-secondary">{endpoint.requestBody}</code>
                    </pre>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm font-semibold text-claude-text mb-2 flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> Response Example
                  </p>
                  <pre className="p-4 rounded-lg bg-claude-bg border border-claude-border overflow-x-auto">
                    <code className="text-sm text-emerald-400">{endpoint.responseExample}</code>
                  </pre>
                </div>

                <div>
                  <p className="text-sm font-semibold text-claude-text mb-2 flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> cURL Example
                  </p>
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-claude-bg border border-claude-border overflow-x-auto pr-12">
                      <code className="text-sm text-claude-orange">{generateCurlCommand(endpoint)}</code>
                    </pre>
                    <button
                      onClick={() => copyToClipboard(generateCurlCommand(endpoint), index)}
                      className="absolute top-3 right-3 p-2 rounded-lg hover:bg-claude-border transition-colors"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-claude-text-muted" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
