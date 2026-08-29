export type TagId = 'office' | 'legal' | 'finance' | 'operations' | 'hr' | 'logistics'

export type Tag = {
  id: TagId
  label: string
  short: string
}

export const TAGS: Tag[] = [
  { id: 'office', label: 'オフィス・一般業務', short: 'オフィス' },
  { id: 'legal', label: '契約・法務', short: '法務' },
  { id: 'finance', label: '財務・会計', short: '財務' },
  { id: 'operations', label: '業務管理・運用', short: '運用' },
  { id: 'hr', label: '人事・採用', short: '人事' },
  { id: 'logistics', label: '物流・製造', short: '物流' },
]

export function tagShortLabel(id: TagId): string {
  return TAGS.find((t) => t.id === id)?.short ?? id
}

export function tagLabel(id: TagId): string {
  return TAGS.find((t) => t.id === id)?.label ?? id
}
