import Link from 'next/link'
import { Alert } from '@prisma/client'

interface AlertCardProps {
  alert: Alert & {
    campaign: {
      id: string
      name: string
    }
  }
  showCampaign?: boolean
}

export default function AlertCard({ alert, showCampaign = true }: AlertCardProps) {
  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  }

  const statusColors = {
    open: 'bg-gray-100 text-gray-800',
    resolved: 'bg-green-100 text-green-800',
    dismissed: 'bg-gray-200 text-gray-600',
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {showCampaign && (
            <Link
              href={`/campaign/${alert.campaign.id}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600"
            >
              {alert.campaign.name}
            </Link>
          )}
          <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${severityColors[alert.severity as keyof typeof severityColors]}`}
            >
              {alert.severity}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[alert.status as keyof typeof statusColors]}`}
            >
              {alert.status}
            </span>
            {alert.metric && (
              <span className="text-xs text-gray-500">Metric: {alert.metric}</span>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {new Date(alert.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

