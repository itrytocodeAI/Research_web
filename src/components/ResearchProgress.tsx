import { motion } from 'framer-motion'
import { Brain, FileText, Database, BarChart, Sparkles, CheckCircle2, Loader2 } from 'lucide-react'

interface ResearchProgressProps {
  currentStep: number
  totalSteps: number
}

const steps = [
  { icon: Brain, label: 'Analyzing Topic', description: 'Understanding research requirements' },
  { icon: Database, label: 'Research Gaps', description: 'Identifying gaps in current knowledge' },
  { icon: Sparkles, label: 'Formulating Hypotheses', description: 'Developing testable hypotheses' },
  { icon: BarChart, label: 'Planning Implementation', description: 'Creating detailed roadmap' },
  { icon: FileText, label: 'Generating Documents', description: 'Creating comprehensive reports' },
]

export function ResearchProgress({ currentStep, totalSteps }: ResearchProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold mb-4">Conducting Deep Research</h2>
        <p className="text-xl text-muted-foreground">
          AI is analyzing your topic and generating comprehensive insights...
        </p>
      </motion.div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon
          const isCompleted = idx < currentStep
          const isCurrent = idx === currentStep

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center gap-6 p-6 rounded-xl border ${
                isCurrent
                  ? 'bg-primary/5 border-primary shadow-sm'
                  : isCompleted
                  ? 'bg-green-50 border-green-200'
                  : 'bg-card border-border'
              }`}
            >
              <div
                className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-primary text-white animate-pulse'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={28} />
                ) : isCurrent ? (
                  <Loader2 size={28} className="animate-spin" />
                ) : (
                  <Icon size={28} />
                )}
              </div>
              <div className="flex-1">
                <h3
                  className={`text-lg font-bold mb-1 ${
                    idx > currentStep ? 'text-muted-foreground' : ''
                  }`}
                >
                  {step.label}
                </h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {isCurrent && (
                <div className="flex-shrink-0">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
