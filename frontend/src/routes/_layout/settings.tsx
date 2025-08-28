import { createFileRoute } from "@tanstack/react-router"
import { FiUser, FiLock, FiMonitor, FiAlertTriangle } from "react-icons/fi"

import Appearance from "@/components/UserSettings/Appearance"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import UserInformation from "@/components/UserSettings/UserInformation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import useAuth from "@/hooks/useAuth"

const tabsConfig = [
  {
    value: "my-profile",
    title: "Profile",
    icon: FiUser,
    component: UserInformation
  },
  {
    value: "password",
    title: "Security",
    icon: FiLock,
    component: ChangePassword
  },
  {
    value: "appearance",
    title: "Appearance",
    icon: FiMonitor,
    component: Appearance
  },
  {
    value: "danger-zone",
    title: "Account",
    icon: FiAlertTriangle,
    component: DeleteAccount
  },
]

export const Route = createFileRoute("/_layout/settings")({
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
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and security settings
        </p>
      </div>

      <Tabs defaultValue="my-profile" className="w-full">
        {/* Ultra Modern Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="relative bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-1 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg">
            <TabsList className="flex bg-transparent p-0 h-auto space-x-1">
              {finalTabs.map((tab, index) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative flex flex-col items-center gap-2 px-6 py-4 rounded-xl text-xs font-medium transition-all duration-300 ease-out data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:shadow-purple-500/20 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-purple-300 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:scale-105 transform group min-w-[80px] border-0"
                    style={{
                      background: 'data-[state=active]:linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                    }}
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5 transition-all duration-300 group-hover:scale-110 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400" />
                      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 data-[state=active]:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </div>
                    <span className="text-xs font-semibold tracking-wide opacity-70 group-hover:opacity-100 data-[state=active]:opacity-100 transition-opacity duration-300">
                      {tab.title}
                    </span>
                    {/* Active indicator */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300 data-[state=active]:w-8"></div>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Floating background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl blur-xl -z-10"></div>
          </div>
        </div>

        {/* Tab Content */}
        {finalTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-purple-200 dark:border-purple-700 shadow-sm rounded-lg overflow-hidden">
              <tab.component />
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
