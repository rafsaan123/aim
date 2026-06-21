export const COURSE_THEME_PRESETS = [
  { id: "aim-blue", label: "AIM Blue", color: "#1d4ed8", gradient: "from-blue-700 to-blue-900" },
  { id: "aim-orange", label: "AIM Orange", color: "#ea580c", gradient: "from-orange-500 to-orange-700" },
  { id: "hsc-green", label: "Batch Green", color: "#059669", gradient: "from-emerald-600 to-teal-800" },
  { id: "science-purple", label: "Science", color: "#7c3aed", gradient: "from-violet-600 to-purple-900" },
  { id: "revision-red", label: "Revision", color: "#dc2626", gradient: "from-red-600 to-rose-900" },
] as const;

export function getCourseTheme(themeColor: string | null | undefined) {
  return (
    COURSE_THEME_PRESETS.find((p) => p.color === themeColor) ??
    COURSE_THEME_PRESETS[0]
  );
}
