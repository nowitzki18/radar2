'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AlertCard from '@/components/AlertCard'

interface Alert {
  id: string
  severity: string
  status: string
  message: string
  metric: string
  value: number | null
  threshold: number | null
  createdAt: string
  resolvedAt: string | null
  dismissedAt: string | null
  campaign: {
    id: string
    name: string
  }
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    campaignId: '',
    severity: '',
    status: '',
  })
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns')
        const data = await response.json()
        setCampaigns(data.map((c: any) => ({ id: c.id, name: c.name })))
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      }
    }

    fetchCampaigns()
  }, [])

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const params = new URLSearchParams()
        if (filters.campaignId) params.append('campaignId', filters.campaignId)
        if (filters.severity) params.append('severity', filters.severity)
        if (filters.status) params.append('status', filters.status)

        const response = await fetch(`/api/alerts?${params.toString()}`)
        const data = await response.json()
        setAlerts(data)
      } catch (error) {
        console.error('Error fetching alerts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlerts()
  }, [filters])

  const handleResolveAlert = async (alertId: string, status: 'resolved' | 'dismissed') => {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, resolvedBy: 'user' }),
      })
      
      // Refresh alerts
      const params = new URLSearchParams()
      if (filters.campaignId) params.append('campaignId', filters.campaignId)
      if (filters.severity) params.append('severity', filters.severity)
      if (filters.status) params.append('status', filters.status)

      const response = await fetch(`/api/alerts?${params.toString()}`)
      const data = await response.json()
      setAlerts(data)
      setSelectedAlert(null)
    } catch (error) {
      console.error('Error resolving alert:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading alerts...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor and manage performance anomalies across all campaigns
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign
            </label>
            <select
              value={filters.campaignId}
              onChange={(e) => setFilters({ ...filters, campaignId: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Detail View */}
      {selectedAlert && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Alert Details</h2>
              <Link
                href={`/campaign/${selectedAlert.campaign.id}`}
                className="text-sm text-blue-600 hover:text-blue-800 mt-1"
              >
                View Campaign →
              </Link>
            </div>
            <button
              onClick={() => setSelectedAlert(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Message:</span>
              <p className="text-sm text-gray-900 mt-1">{selectedAlert.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Metric:</span>
                <p className="text-sm text-gray-900 mt-1">{selectedAlert.metric}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Severity:</span>
                <p className="text-sm text-gray-900 mt-1 capitalize">{selectedAlert.severity}</p>
              </div>
              {selectedAlert.value !== null && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Value:</span>
                  <p className="text-sm text-gray-900 mt-1">{selectedAlert.value}</p>
                </div>
              )}
              {selectedAlert.threshold !== null && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Threshold:</span>
                  <p className="text-sm text-gray-900 mt-1">{selectedAlert.threshold}</p>
                </div>
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Created:</span>
              <p className="text-sm text-gray-900 mt-1">
                {new Date(selectedAlert.createdAt).toLocaleString()}
              </p>
            </div>
            {selectedAlert.resolvedAt && (
              <div>
                <span className="text-sm font-medium text-gray-500">Resolved:</span>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(selectedAlert.resolvedAt).toLocaleString()}
                </p>
              </div>
            )}
            {selectedAlert.dismissedAt && (
              <div>
                <span className="text-sm font-medium text-gray-500">Dismissed:</span>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(selectedAlert.dismissedAt).toLocaleString()}
                </p>
              </div>
            )}
            {selectedAlert.status === 'open' && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolveAlert(selectedAlert.id, 'resolved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleResolveAlert(selectedAlert.id, 'dismissed')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className="cursor-pointer"
            >
              <AlertCard alert={alert as any} />
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No alerts found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

