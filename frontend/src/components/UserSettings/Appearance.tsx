import { useTheme } from 'next-themes'
import { FiCheck, FiMonitor, FiMoon, FiSun } from 'react-icons/fi'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const Appearance = () => {
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    {
      value: 'system',
      label: 'System',
      description: "Use your system's theme setting",
      icon: FiMonitor,
    },
    {
      value: 'light',
      label: 'Light Mode',
      description: 'Clean and bright interface',
      icon: FiSun,
    },
    {
      value: 'dark',
      label: 'Dark Mode',
      description: 'Easy on the eyes in low light',
      icon: FiMoon,
    },
  ]

  const currentTheme = themeOptions.find(opt => opt.value === theme)

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        {/* Appearance Header */}
        <div className="mb-6 flex items-center gap-4 rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/10 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
            <FiMonitor className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Theme Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Choose how the interface looks and feels
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <RadioGroup
            onValueChange={setTheme}
            value={theme}
            className="space-y-4"
          >
            {themeOptions.map(option => {
              const Icon = option.icon
              return (
                <div key={option.value} className="relative">
                  <div
                    onClick={() => setTheme(option.value)}
                    className={`flex cursor-pointer items-center space-x-4 rounded-lg border p-4 transition-all duration-200 hover:border-border hover:bg-muted/20 ${
                      theme === option.value
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border/60 bg-background'
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="pointer-events-none"
                    />
                    <div className="flex flex-1 items-center space-x-4">
                      <div
                        className={`rounded-lg p-3 ${
                          theme === option.value
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                          {option.label}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </RadioGroup>

          {/* Enhanced Current Theme Status */}
          <div className="mt-8 rounded-xl border border-purple-200/30 bg-gradient-to-r from-purple-50/40 to-pink-50/20 p-5 shadow-sm dark:border-purple-800/20 dark:from-purple-950/10 dark:to-pink-950/5">
            <div className="flex items-center gap-4">
              {/* Status Icon */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100/60 dark:bg-purple-900/30">
                <FiCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>

              {/* Theme Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Active Theme
                  </span>
                  <span className="rounded-full bg-purple-100/80 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                    {currentTheme?.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Theme changes are applied instantly across your entire
                  workspace
                </p>
              </div>

              {/* Current Theme Icon */}
              {currentTheme && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100/50 dark:bg-purple-900/20">
                  <currentTheme.icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Appearance
