import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BRIQUES, SPRINTS, getBriqueProgress, getBriqueStatus } from '../data/planTravail'

export function PlanTravail() {
  const navigate = useNavigate()
  const totalJalons = SPRINTS.reduce((acc, s) => acc + s.jalons.length, 0)
  const doneJalons = SPRINTS.reduce((acc, s) => acc + s.jalons.filter(j => j.fait).length, 0)
  const progress = Math.round((doneJalons / totalJalons) * 100)

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* === HEADER === */}
      <header className="bg-gradient-to-br from-[#0C1E5B] to-[#1a3a8f] text-white">
        <div className="max-w-3xl mx-auto px-4 py-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate('/')} className="text-white/50 text-xs font-mono hover:text-white/80 transition-colors">
              ← Kit
            </button>
            <span className="text-white/30 text-[10px] font-mono">Wilfried & Mathilde</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight mb-1">Kit Anomalie</h1>
          <p className="text-white/50 text-sm font-mono mb-5">Roadmap — 8 briques, 6 sprints</p>

          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00A3E0] to-[#3AAA35] rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xl font-black">{progress}%</span>
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono text-white/40">
            <span>{doneJalons} jalons terminés</span>
            <span>{totalJalons - doneJalons} restants</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 lg:px-8 space-y-8">
        {/* === BRIQUES === */}
        <section>
          <h2 className="text-xs font-mono text-sncf-dark/40 tracking-widest mb-4">LES 8 BRIQUES</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BRIQUES.map(b => {
              const status = getBriqueStatus(b.numero)
              const { pct } = getBriqueProgress(b.numero)
              return (
                <div key={b.numero} className={`bg-white rounded-2xl p-3 border shadow-sm transition-all ${
                  status === 'done' ? 'border-[#3AAA35]/30' :
                  status === 'in_progress' ? 'border-[#00A3E0]/30 shadow-md' : 'border-gray-100'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${
                      status === 'done' ? 'bg-emerald-50' :
                      status === 'in_progress' ? 'bg-blue-50' : 'bg-gray-50'
                    }`}>{b.icon}</div>
                    <StatusDot status={status} />
                  </div>
                  <div className="text-xs font-bold text-sncf-dark leading-tight">{b.nom}</div>
                  <div className="text-[9px] font-mono text-gray-300 mt-0.5">{b.codename}</div>
                  {pct > 0 && (
                    <div className="mt-2">
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct === 100 ? 'bg-[#3AAA35]' : 'bg-[#00A3E0]'}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* === TIMELINE === */}
        <section>
          <h2 className="text-xs font-mono text-sncf-dark/40 tracking-widest mb-4">TIMELINE</h2>
          <div className="space-y-0">
            {SPRINTS.map((sprint, i) => (
              <SprintBlock key={i} sprint={sprint} isLast={i === SPRINTS.length - 1} />
            ))}
          </div>
        </section>
      </div>

      <footer className="text-center py-6 border-t border-gray-200 max-w-3xl mx-auto">
        <div className="text-[10px] font-mono text-gray-300 tracking-widest">
          Chantier Anomalie — {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}

// === Composants ===

function StatusDot({ status }: { status: string }) {
  const conf: Record<string, { label: string; cls: string }> = {
    done: { label: '✓', cls: 'text-[#3AAA35] bg-emerald-50' },
    in_progress: { label: '●', cls: 'text-[#00A3E0] bg-blue-50' },
    planned: { label: '○', cls: 'text-[#F7A600] bg-amber-50' },
    not_started: { label: '—', cls: 'text-gray-300 bg-gray-50' },
  }
  const c = conf[status] ?? conf.not_started
  return <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${c.cls}`}>{c.label}</span>
}

function SprintBlock({ sprint, isLast }: { sprint: typeof SPRINTS[number]; isLast: boolean }) {
  const [open, setOpen] = useState(sprint.status === 'active')
  const done = sprint.jalons.filter(j => j.fait).length
  const total = sprint.jalons.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const isActive = sprint.status === 'active'
  const isCompleted = sprint.status === 'completed'

  return (
    <div className="flex gap-3">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center pt-1">
        <div className={`w-3 h-3 rounded-full shrink-0 border-2 ${
          isCompleted ? 'bg-[#3AAA35] border-[#3AAA35]' :
          isActive ? 'bg-[#00A3E0] border-[#00A3E0] animate-pulse' :
          'bg-white border-gray-300'
        }`} />
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <button onClick={() => setOpen(!open)} className="w-full text-left">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-base">{sprint.icon}</span>
            <span className={`text-sm font-bold ${isActive ? 'text-sncf-dark' : isCompleted ? 'text-gray-500' : 'text-gray-400'}`}>
              {sprint.nom}
            </span>
            <span className="text-[9px] font-mono text-gray-300">// {sprint.codename}</span>
            {isActive && <span className="text-[8px] font-mono bg-[#00A3E0] text-white px-1.5 py-0.5 rounded-full">EN COURS</span>}
          </div>
          <div className="text-[10px] text-gray-400 font-mono">{sprint.periode}</div>
          <div className={`text-xs mt-1 ${isActive ? 'text-sncf-dark/70' : 'text-gray-400'}`}>{sprint.objectif}</div>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-[#3AAA35]' : 'bg-[#00A3E0]'}`}
                style={{ width: `${pct}%` }} />
            </div>
            <span className={`text-[10px] font-mono ${pct === 100 ? 'text-[#3AAA35]' : 'text-gray-400'}`}>
              {done}/{total}
            </span>
          </div>
        </button>

        {open && (
          <div className="mt-3 space-y-1.5">
            {sprint.jalons.map((j, k) => (
              <div key={k} className="flex items-center gap-2">
                <span className={`text-xs ${j.fait ? 'text-[#3AAA35]' : 'text-gray-300'}`}>
                  {j.fait ? '●' : '○'}
                </span>
                <span className={`text-xs ${j.fait ? 'text-gray-400 line-through' : 'text-sncf-dark/70'}`}>
                  {j.titre}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
