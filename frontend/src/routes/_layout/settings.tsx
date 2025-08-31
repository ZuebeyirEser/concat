import { createFileRoute } from '@tanstack/react-router'
import { FiUser, FiLock, FiMonitor, FiAlertTriangle } from 'react-icons/fi'

import Appearance from '@/components/UserSettings/Appearance'
import ChangePassword from '@/components/UserSettings/ChangePassword'
import DeleteAccount from '@/components/UserSettings/DeleteAccount'
import UserInformation from '@/components/UserSettings/UserInformation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
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
  const finalTabs = currentUser?.is_superuser
    ? tabsConfig.slice(0, 3)
    : tabsConfig

  if (!currentUser) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and security settings
        </p>
      </div>

      <Tabs defaultValue="my-profile" className="w-full">
        {/* Ultra Modern Tab Navigation */}
        <div className="mb-8 flex justify-center">
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-r from-purple-100 to-blue-100 p-1 shadow-sm dark:border-white/5 dark:from-purple-900/40 dark:to-blue-900/40">
            {' '}
            <TabsList className="flex h-auto space-x-1 bg-transparent p-0">
              {finalTabs.map((tab, index) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="group relative flex min-w-[80px] transform flex-col items-center gap-2 rounded-xl border-0 px-6 py-4 text-xs font-medium transition-all duration-300 ease-out hover:scale-105 hover:bg-white/50 data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-xl data-[state=active]:shadow-purple-500/20 dark:hover:bg-gray-800/50 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-purple-300"
                    style={{
                      background:
                        'data-[state=active]:linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                    }}
                  >
                    <div className="relative">
                      <Icon className="h-5 w-5 transition-all duration-300 group-hover:scale-110 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400" />
                      <div className="absolute inset-0 -z-10 rounded-full bg-purple-500/20 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100 data-[state=active]:opacity-100"></div>
                    </div>
                    <span className="text-xs font-semibold tracking-wide opacity-70 transition-opacity duration-300 group-hover:opacity-100 data-[state=active]:opacity-100">
                      {tab.title}
                    </span>
                    {/* Active indicator */}
                    <div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 data-[state=active]:w-8"></div>
                  </TabsTrigger>
                )
              })}
            </TabsList>
            {/* Floating background effect */}
            <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 blur-xl"></div>
          </div>
        </div>

        {/* Tab Content */}
        {finalTabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            <Card className="overflow-hidden rounded-lg border-purple-200 bg-white/90 shadow-sm backdrop-blur-sm dark:border-purple-700 dark:bg-gray-900/90">
              <tab.component />
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
