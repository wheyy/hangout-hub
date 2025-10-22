// Color palette for member markers and routes
// Excludes red (destination) and blue (current user)
export const MEMBER_COLORS = [
  '#10B981', // green
  '#8B5CF6', // purple
  '#F59E0B', // orange
  '#EC4899', // pink
  '#EAB308', // yellow
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#A855F7', // violet
  '#14B8A6', // teal
]

export const DESTINATION_COLOR = '#EF4444' // red
export const CURRENT_USER_COLOR = '#3B82F6' // blue

export function getMemberColor(index: number): string {
  return MEMBER_COLORS[index % MEMBER_COLORS.length]
}
