export type CategoryId = 'office' | 'legal' | 'finance' | 'operations'

export type Category = {
  id: CategoryId
  label: string
}

export const CATEGORIES: Category[] = [
  { id: 'office', label: 'オフィス・一般業務' },
  { id: 'legal', label: '契約・法務' },
  { id: 'finance', label: '財務・評価' },
  { id: 'operations', label: '業務管理・運用' },
]

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
}
