const files = import.meta.glob<string>('./assets/amenities/*.svg', {
  eager: true,
  import: 'default',
})

const icons = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace('.svg', ''), url]),
)

const byName: Record<string, string> = {
  'wi-fi': 'wifi',
  кухня: 'kitchen',
  'пральна машина': 'washing-machine',
  'самостійне заселення': 'self-checkin',
}

export function amenityIcon(name: string): string | undefined {
  const key = byName[name.trim().toLowerCase()]
  return key ? icons[key] : undefined
}

const locationFiles = import.meta.glob<string>('./assets/amenities/location.svg', {
  eager: true,
  import: 'default',
})

export const locationIcon: string | undefined = Object.values(locationFiles)[0]
