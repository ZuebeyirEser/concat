import { useTheme } from "next-themes"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const Appearance = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="w-full max-w-full">
      <h3 className="text-lg font-semibold py-4">
        Appearance
      </h3>

      <RadioGroup
        onValueChange={setTheme}
        value={theme}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="system" id="system" />
          <Label htmlFor="system">System</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="light" id="light" />
          <Label htmlFor="light">Light Mode</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="dark" id="dark" />
          <Label htmlFor="dark">Dark Mode</Label>
        </div>
      </RadioGroup>
    </div>
  )
}
export default Appearance
