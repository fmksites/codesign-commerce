const RANGE_CONTROL_CONFIGURATION = {
  "branding.scale": {
    step: "0.01",
    label: "Artwork scale",
    valueText: (value: number) => `${Math.round(value * 100)} percent`,
  },
  "branding.rotation": {
    step: "1",
    label: "Artwork rotation",
    valueText: (value: number) => `${value} degrees`,
  },
} as const;

export function syncRangeControl(control: HTMLInputElement, controlId: string, rawValue: unknown): void {
  const configuration = RANGE_CONTROL_CONFIGURATION[controlId as keyof typeof RANGE_CONTROL_CONFIGURATION];
  const value = Number(rawValue);
  if (!configuration || !Number.isFinite(value)) return;
  control.step = configuration.step;
  control.value = String(value);
  control.setAttribute("aria-label", configuration.label);
  control.setAttribute("aria-valuenow", String(value));
  control.setAttribute("aria-valuetext", configuration.valueText(value));
}
