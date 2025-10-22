export const MEMBER_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#8B5CF6', // purple
  '#F59E0B', // orange
  '#EC4899', // pink
  '#EAB308', // yellow
  '#06B6D4', // cyan
  '#EF4444', // red
  '#84CC16', // lime
  '#A855F7', // violet
]

export function getMemberColor(index: number): string {
  return MEMBER_COLORS[index % MEMBER_COLORS.length]
}
