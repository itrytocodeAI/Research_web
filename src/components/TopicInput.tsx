import { useState } from 'react'
import { Search, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@blinkdotnew/ui'
import { motion } from 'framer-motion'

interface TopicInputProps {
  onSubmit: (topic: string) => void
  isLoading?: boolean
}

export function TopicInput({ onSubmit, isLoading }: TopicInputProps) {
  const [topic, setTopic] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic.trim() && !isLoading) {
      onSubmit(topic.trim())
    }
  }

  const exampleTopics = [
    'AI in healthcare diagnosis',
    'Climate change impact on agriculture',
    'Blockchain for supply chain',
    'Quantum computing applications',
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
        >
          <Sparkles size={16} />
          <span className="text-sm font-medium">AI-Powered Research</span>
        </motion.div>

        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Deep Research AI Toolkit
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Conduct comprehensive research analysis, identify gaps, formulate hypotheses,
          and generate complete documentation for your research projects.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your research topic..."
            className="w-full h-20 pl-16 pr-32 text-lg border-2 border-border rounded-2xl bg-card focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="lg"
            disabled={!topic.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-14 px-8"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Researching...
              </>
            ) : (
              <>
                <span>Start Research</span>
                <ArrowRight className="ml-2" size={20} />
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-8">
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Or try one of these example topics:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {exampleTopics.map((example, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              onClick={() => !isLoading && onSubmit(example)}
              className="px-4 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm"
              disabled={isLoading}
            >
              {example}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center p-6 rounded-xl bg-card border border-border"
        >
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="font-semibold text-lg mb-2">Deep Research</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered comprehensive analysis of your topic with current information
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center p-6 rounded-xl bg-card border border-border"
        >
          <div className="text-4xl mb-4">💡</div>
          <h3 className="font-semibold text-lg mb-2">Gap Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Identify research gaps and formulate testable hypotheses
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center p-6 rounded-xl bg-card border border-border"
        >
          <div className="text-4xl mb-4">📄</div>
          <h3 className="font-semibold text-lg mb-2">Auto Documentation</h3>
          <p className="text-sm text-muted-foreground">
            Generate Word docs and Markdown files automatically
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
