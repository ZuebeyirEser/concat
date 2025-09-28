import { createFileRoute } from '@tanstack/react-router'
import { FiUser, FiLock, FiMonitor, FiAlertTriangle } from 'react-icons/fi'
import { useState, useTransition } from 'react'

import Appearance from '@/components/UserSettings/Appearance'
import ChangePassword from '@/components/UserSettings/ChangePassword'
import DeleteAccount from '@/components/UserSettings/DeleteAccount'
import UserInformation from '@/components/UserSettings/UserInformation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import useAuth from '@/hooks/useAuth'

const tabsConfig = [
  {
    value: 'my-profile',
    title: 'Profile',
    icon: FiUser,
    component: UserInformation,
  },
  {
    value: 'password',
    title: 'Security',
    icon: FiLock,
    component: ChangePassword,
  },
  {
    value: 'appearance',
    title: 'Appearance',
    icon: FiMonitor,
    component: Appearance,
  },
  {
    value: 'danger-zone',
    title: 'Account',
    icon: FiAlertTriangle,
    component: DeleteAccount,
  },
]

export const Route = createFileRoute('/_layout/settings')({
  component: UserSettings,
})

function UserSettings() {
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('my-profile')
  const [isPending, startTransition] = useTransition()
  const finalTabs = currentUser?.is_superuser
    ? tabsConfig.slice(0, 3)
    : tabsConfig

  const handleTabChange = (value: string) => {
    startTransition(() => {
      setActiveTab(value)
    })
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and security settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-muted p-1">
              {finalTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.value
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-background text-foreground shadow-sm border border-primary/30 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.title}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Clean sliding indicator */}
            <div
              className="absolute bottom-0 left-1 h-0.5 bg-primary transition-all duration-300 ease-out"
              style={{
                width: `calc(${100 / finalTabs.length}% - 8px)`,
                transform: `translateX(calc(${finalTabs.findIndex(tab => tab.value === activeTab) * 100}% + 4px))`
              }}
            />
          </div>
        </div>

        {finalTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            <Card className="overflow-hidden rounded-lg border bg-card shadow-sm">
              {isPending ? (
                <div className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in-50 duration-300">
                  <tab.component />
                </div>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
