import Link from 'next/link'
import HealthScoreBadge from './HealthScoreBadge'

interface Campaign {
  id: string
  name: string
  status: string
  healthScore: number
  alertCount: number
  latestAlert: {
    severity: string
    message: string
  } | null
}

interface CampaignCardProps {
  campaign: Campaign
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800',
  }

  return (
    <Link href={`/campaign/${campaign.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[campaign.status as keyof typeof statusColors] || statusColors.paused}`}
              >
                {campaign.status}
              </span>
            </div>
            {campaign.latestAlert && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {campaign.latestAlert.message}
              </p>
            )}
            <div className="mt-4 flex items-center gap-4">
              <div>
                <span className="text-xs text-gray-500">Health Score</span>
                <div className="mt-1">
                  <HealthScoreBadge score={campaign.healthScore} />
                </div>
              </div>
              {campaign.alertCount > 0 && (
                <div>
                  <span className="text-xs text-gray-500">Active Alerts</span>
                  <div className="mt-1 text-sm font-semibold text-red-600">
                    {campaign.alertCount}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

