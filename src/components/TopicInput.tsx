import { useState, useMemo } from 'react'
import { ArrowRight, FileText, Lightbulb, Search, Sparkles, Telescope } from 'lucide-react'
import { motion } from 'framer-motion'

interface TopicInputProps {
  onSubmit: (topic: string) => void
  isLoading?: boolean
  quotaBanner?: {
    limitLabel: string
    remainingLabel: string
    refreshLabel: string
    blocked: boolean
  }
}

export function TopicInput({ onSubmit, isLoading, quotaBanner }: TopicInputProps) {
  const [topic, setTopic] = useState('')
  const isDisabled = Boolean(isLoading || quotaBanner?.blocked)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic.trim() && !isDisabled) {
      onSubmit(topic.trim())
    }
  }

  const exampleTopics = [
    // AI & Machine Learning
    'AI in healthcare diagnosis',
    'Deep learning for medical image analysis',
    'NLP for clinical documentation',
    'Predictive analytics in patient care',
    'Computer vision for autonomous vehicles',
    'Object detection in surveillance systems',
    'Face recognition privacy concerns',
    'Emotion recognition from facial expressions',
    'Sentiment analysis on social media',
    'Machine translation quality improvement',
    'Question answering systems',
    'Text summarization for news articles',
    'Chatbot development for customer service',
    'Speech recognition in noisy environments',
    'Reinforcement learning for game AI',
    'Transfer learning in small datasets',
    'Explainable AI in critical systems',
    'Federated learning for privacy',
    'AutoML for model optimization',
    'Neural architecture search',
    
    // Climate & Environment
    'Climate change impact on agriculture',
    'Weather prediction using deep learning',
    'Carbon footprint tracking systems',
    'Renewable energy optimization',
    'Ocean temperature monitoring',
    'Wildfire prediction models',
    'Air quality forecasting',
    'Deforestation detection from satellite imagery',
    'Water resource management with IoT',
    'Sustainable urban planning',
    
    // Blockchain & Web3
    'Blockchain for supply chain',
    'Smart contracts for real estate',
    'DeFi protocol security',
    'NFT authentication systems',
    'Cryptocurrency price prediction',
    'Blockchain in healthcare records',
    'Voting systems using blockchain',
    'Cross-chain interoperability',
    
    // Robotics & Automation
    'Autonomous drone navigation',
    'Robot manipulation in warehouses',
    'Collaborative robots in manufacturing',
    'Swarm robotics coordination',
    'Humanoid robot interaction',
    'Agricultural automation systems',
    
    // Cybersecurity
    'Intrusion detection using ML',
    'Malware classification with deep learning',
    'Phishing email detection',
    'Network anomaly detection',
    'Biometric authentication systems',
    'Zero-day exploit prediction',
    
    // IoT & Smart Systems
    'Smart home energy optimization',
    'Industrial IoT predictive maintenance',
    'Smart city traffic management',
    'Precision agriculture with sensors',
    'Wearable health monitoring devices',
    
    // Education & Research
    'Personalized learning platforms',
    'Automated essay grading',
    'Virtual reality in education',
    'MOOC completion prediction',
    
    // Finance & Economics
    'Stock market prediction with LSTM',
    'Credit risk assessment models',
    'Fraud detection in banking',
    'Algorithmic trading strategies',
    
    // Quantum & Emerging Tech
    'Quantum computing applications',
    'Quantum machine learning',
    'Edge computing optimization',
    'Neuromorphic computing research',
  ]

  const shuffledExamples = useMemo(() => {
    const shuffled = [...exampleTopics].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 4) // Show only 4 random suggestions
  }, [])

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
        {quotaBanner && (
          <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
            quotaBanner.blocked
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-blue-200 bg-blue-50 text-blue-800'
          }`}>
            <p className="font-semibold">{quotaBanner.limitLabel}</p>
            <p>{quotaBanner.remainingLabel}</p>
            <p>Refresh: {quotaBanner.refreshLabel}</p>
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your research topic..."
            className="w-full h-20 pl-16 pr-32 text-lg border-2 border-border rounded-2xl bg-card focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
            disabled={isDisabled}
          />
          <button
            type="submit"
            disabled={!topic.trim() || isDisabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-14 px-8 inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
          </button>
        </div>
      </form>

      <div className="mt-8">
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Or try one of these example topics:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {shuffledExamples.map((example, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              onClick={() => !isDisabled && onSubmit(example)}
              className="px-4 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm"
              disabled={isDisabled}
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
          <Telescope className="w-10 h-10 mx-auto mb-4 text-primary" />
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
          <Lightbulb className="w-10 h-10 mx-auto mb-4 text-primary" />
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
          <FileText className="w-10 h-10 mx-auto mb-4 text-primary" />
          <h3 className="font-semibold text-lg mb-2">Auto Documentation</h3>
          <p className="text-sm text-muted-foreground">
            Generate Word docs and Markdown files automatically
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
