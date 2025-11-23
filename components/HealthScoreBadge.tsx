interface HealthScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export default function HealthScoreBadge({ score, size = 'md' }: HealthScoreBadgeProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${getColor(score)} ${sizeClasses[size]}`}
    >
      {score}
    </span>
  )
}

