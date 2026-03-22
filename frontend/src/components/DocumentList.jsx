import { FileText, Clock, CheckCircle } from 'lucide-react'

export default function DocumentList({ documents, activeDoc, onSelect }) {
  if (documents.length === 0) return null

  return (
    <div className="px-6 pb-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Your Documents
      </h3>
      <div className="space-y-2">
        {documents.map(doc => (
          <button
            key={doc.id}
            onClick={() => onSelect(doc)}
            className={`
              w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150
              flex items-center gap-3 group
              ${activeDoc?.id === doc.id
                ? 'bg-violet-600/20 border border-violet-500/40 text-violet-300'
                : 'hover:bg-slate-700/50 border border-transparent text-slate-400 hover:text-slate-200'
              }
            `}
          >
            <FileText size={15} className="shrink-0" />
            <span className="text-sm truncate flex-1">{doc.name}</span>
            {doc.processed
              ? <CheckCircle size={13} className="shrink-0 text-green-500" />
              : <Clock size={13} className="shrink-0 text-yellow-500" />
            }
          </button>
        ))}
      </div>
    </div>
  )
}