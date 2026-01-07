'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ArrowUpDown,
  Beaker,
  Thermometer,
  Copy,
  Check
} from 'lucide-react';

interface Prediction {
  id: number;
  smiles: string;
  Tm_pred: number;
}

interface PredictionsTableProps {
  predictions: Prediction[];
}

type SortField = 'id' | 'smiles' | 'Tm_pred';
type SortDirection = 'asc' | 'desc';

export default function PredictionsTable({ predictions }: PredictionsTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const itemsPerPage = 10;

  const filteredAndSorted = useMemo(() => {
    let result = predictions.filter(p => 
      p.smiles.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toString().includes(search) ||
      p.Tm_pred.toFixed(2).includes(search)
    );

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') comparison = a.id - b.id;
      else if (sortField === 'smiles') comparison = a.smiles.localeCompare(b.smiles);
      else if (sortField === 'Tm_pred') comparison = a.Tm_pred - b.Tm_pred;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [predictions, search, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const copyToClipboard = async (text: string, id: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-claude-orange" />
      : <ChevronDown className="w-4 h-4 text-claude-orange" />;
  };

  const getTemperatureColor = (temp: number) => {
    const min = 88;
    const max = 632;
    const normalized = (temp - min) / (max - min);
    if (normalized < 0.33) return 'text-blue-400';
    if (normalized < 0.66) return 'text-claude-text';
    return 'text-claude-orange';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass rounded-2xl border border-claude-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-claude-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-claude-text flex items-center gap-2">
              <Beaker className="w-5 h-5 text-claude-orange" />
              Predictions Table
            </h3>
            <p className="text-claude-text-secondary text-sm mt-1">
              {filteredAndSorted.length} molecules found
            </p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-claude-text-muted" />
            <input
              type="text"
              placeholder="Search by SMILES, ID, or Tm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="
                w-full sm:w-80 pl-10 pr-4 py-2.5 
                bg-claude-bg border border-claude-border rounded-xl
                text-claude-text placeholder:text-claude-text-muted
                focus:border-claude-orange focus:ring-2 focus:ring-claude-orange/20
                transition-all
              "
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-claude-border">
              <th 
                className="px-6 py-4 text-left cursor-pointer hover:bg-claude-orange/5 transition-colors"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-2">
                  ID
                  <SortIcon field="id" />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left cursor-pointer hover:bg-claude-orange/5 transition-colors"
                onClick={() => handleSort('smiles')}
              >
                <div className="flex items-center gap-2">
                  SMILES Structure
                  <SortIcon field="smiles" />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left cursor-pointer hover:bg-claude-orange/5 transition-colors"
                onClick={() => handleSort('Tm_pred')}
              >
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  Predicted Tm
                  <SortIcon field="Tm_pred" />
                </div>
              </th>
              <th className="px-6 py-4 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {paginatedData.map((prediction, index) => (
                <motion.tr
                  key={prediction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="border-b border-claude-border/50 hover:bg-claude-orange/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-claude-bg-tertiary text-claude-text font-mono font-bold">
                      {prediction.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="molecule-text text-claude-text-secondary bg-claude-bg px-3 py-1.5 rounded-lg border border-claude-border">
                      {prediction.smiles.length > 40 
                        ? `${prediction.smiles.substring(0, 40)}...` 
                        : prediction.smiles}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`text-lg font-bold ${getTemperatureColor(prediction.Tm_pred)}`}>
                        {prediction.Tm_pred.toFixed(2)} K
                      </span>
                      <span className="text-claude-text-muted text-sm">
                        {(prediction.Tm_pred - 273.15).toFixed(1)}°C
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => copyToClipboard(prediction.smiles, prediction.id)}
                      className="
                        inline-flex items-center gap-2 px-3 py-1.5 
                        rounded-lg border border-claude-border
                        hover:border-claude-orange hover:bg-claude-orange/10
                        transition-all text-sm text-claude-text-secondary
                        hover:text-claude-orange
                      "
                    >
                      {copiedId === prediction.id ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-claude-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-claude-text-secondary text-sm">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} of {filteredAndSorted.length} results
        </p>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="
              px-4 py-2 rounded-lg border border-claude-border
              text-claude-text-secondary hover:text-claude-text
              hover:border-claude-orange hover:bg-claude-orange/10
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all
            "
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`
                    w-10 h-10 rounded-lg font-medium transition-all
                    ${currentPage === pageNum 
                      ? 'bg-claude-orange text-white' 
                      : 'border border-claude-border text-claude-text-secondary hover:border-claude-orange'}
                  `}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="
              px-4 py-2 rounded-lg border border-claude-border
              text-claude-text-secondary hover:text-claude-text
              hover:border-claude-orange hover:bg-claude-orange/10
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all
            "
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );
}
