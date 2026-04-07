export const ROOM_ID = 'default'

export function roomPath(...parts: string[]): string {
  return ['rooms', ROOM_ID, ...parts].join('/')
}

