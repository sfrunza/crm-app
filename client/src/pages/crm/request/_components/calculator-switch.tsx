import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRequest } from "@/hooks/use-request";
import { useRequestStore } from "@/stores/use-request-store";
import { calculateRequest } from "@/domains/requests/request.api";

export function CalculatorSwitch() {
  const { setField, draft } = useRequest();
  const setCalculatedRequest = useRequestStore((s) => s.setCalculatedRequest);

  if (!draft) return null;

  const handleToggle = async (checked: boolean) => {
    setField("is_calculator_enabled", checked);

    // When turning calculator ON, trigger calculation immediately using current draft values
    if (checked) {
      try {
        const result = await calculateRequest(draft.id, { ...draft, save: false });
        setCalculatedRequest(result);
      } catch {
        // Silently fail - user can still save manually
      }
    }
    // When turning OFF, keep the current values - don't clear anything
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="is_calculator_enabled">Calculator</Label>
      <Switch
        id="is_calculator_enabled"
        checked={draft.is_calculator_enabled}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}
