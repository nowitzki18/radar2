'use client'

import { useEffect, useState } from 'react'
import CampaignCard from '@/components/CampaignCard'
import AlertTicker from '@/components/AlertTicker'
import HealthScoreBadge from '@/components/HealthScoreBadge'

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

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [portfolioScore, setPortfolioScore] = useState(0)

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns')
        const data = await response.json()
        setCampaigns(data)
        
        // Calculate portfolio health score (average of all campaigns)
        if (data.length > 0) {
          const avgScore = data.reduce((sum: number, c: Campaign) => sum + c.healthScore, 0) / data.length
          setPortfolioScore(Math.round(avgScore))
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaigns()
    const interval = setInterval(fetchCampaigns, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  const totalAlerts = campaigns.reduce((sum, c) => sum + c.alertCount, 0)
  const criticalAlerts = campaigns.reduce((sum, c) => {
    return sum + (c.latestAlert?.severity === 'critical' ? 1 : 0)
  }, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Portfolio-level health monitoring and campaign performance
        </p>
      </div>

      {/* Portfolio Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500">Portfolio Health</div>
          <div className="mt-2">
            <HealthScoreBadge score={portfolioScore} size="lg" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500">Total Campaigns</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{campaigns.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500">Active Alerts</div>
          <div className="mt-2 text-2xl font-bold text-red-600">{totalAlerts}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500">Critical Alerts</div>
          <div className="mt-2 text-2xl font-bold text-red-800">{criticalAlerts}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaigns List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaigns</h2>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>

        {/* Alert Ticker */}
        <div>
          <AlertTicker />
        </div>
      </div>
    </div>
  )
}

