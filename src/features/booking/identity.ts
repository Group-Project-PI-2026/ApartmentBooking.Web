const KEY = 'identity:verified'

export function isIdentityVerified(): boolean {
  try {
    return localStorage.getItem(KEY) === 'true'
  } catch {
    return false
  }
}

export async function submitIdentityDocument(file: File): Promise<void> {
  if (!file) throw new Error('No file')
  try {
    localStorage.setItem(KEY, 'true')
  } catch {
    return
  }
}
