export type Phase = {
  id: number
  title: string
}

// 1 phase = 目安100語 x 16phase = 1600語構想(現在はPhase 1のみ収録)
export const PHASES: Phase[] = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  title: `Phase ${i + 1}`,
}))
