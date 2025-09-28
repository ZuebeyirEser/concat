import { useTheme } from "next-themes"
import { FiMonitor, FiSun, FiMoon } from "react-icons/fi"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const Appearance = () => {
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    {
      value: "system",
      label: "System",
      description: "Use your system's theme setting",
      icon: FiMonitor
    },
    {
      value: "light",
      label: "Light Mode",
      description: "Clean and bright interface",
      icon: FiSun
    },
    {
      value: "dark",
      label: "Dark Mode", 
      description: "Easy on the eyes in low light",
      icon: FiMoon
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Appearance
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Choose how concat looks and feels to you
        </p>
      </div>

      <RadioGroup
        onValueChange={setTheme}
        value={theme}
        className="space-y-3"
      >
        {themeOptions.map((option) => {
          const Icon = option.icon
          return (
            <div key={option.value} className="relative">
              <div className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 ${
                theme === option.value 
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30" 
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}>
                <RadioGroupItem 
                  value={option.value} 
                  id={option.value}
                  className="mt-1"
                />
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    theme === option.value 
                      ? "bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300" 
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <Label 
                      htmlFor={option.value}
                      className="text-base font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}
export default Appearance
