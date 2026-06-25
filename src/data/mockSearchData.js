/**
 * Mock search dataset — mirrors the Figma example data.
 * In production this is replaced by an API call.
 *
 * avatarType: 'Avatar' | 'User' | 'Group' | 'Unit' | 'Role'
 * tag:        badge label shown before subText, null for plain people results
 * subText:    email for people, "N members" for groups/units/roles
 */
export const mockSearchData = [
  // People
  { id: 1,  name: 'Joanna Lee',          avatarType: 'Avatar', avatarSrc: 'https://i.pravatar.cc/84?img=9',  subText: 'joanna.lee@doxis.com',     tag: null   },
  { id: 2,  name: 'Jodie Taylor',         avatarType: 'User',   avatarSrc: '',                                subText: 'jodie.taylor@doxis.com',   tag: null   },
  { id: 3,  name: 'João Morgado',         avatarType: 'User',   avatarSrc: '',                                subText: 'joao.morgado@doxis.com',   tag: null   },
  { id: 4,  name: 'James Wilson',         avatarType: 'User',   avatarSrc: '',                                subText: 'james.wilson@doxis.com',   tag: null   },
  { id: 5,  name: 'Julia Santos',         avatarType: 'User',   avatarSrc: '',                                subText: 'julia.santos@doxis.com',   tag: null   },
  // Groups
  { id: 6,  name: 'Jolta dev ambient',    avatarType: 'Group',  avatarSrc: '',                                subText: '12 members',               tag: 'Group' },
  { id: 7,  name: 'Journey squad',        avatarType: 'Group',  avatarSrc: '',                                subText: '5 members',                tag: 'Group' },
  // Units
  { id: 8,  name: 'Jolta corp',           avatarType: 'Unit',   avatarSrc: '',                                subText: '143 members',              tag: 'Unit'  },
  { id: 9,  name: 'HR department',        avatarType: 'Unit',   avatarSrc: '',                                subText: '56 members',               tag: 'Unit'  },
  // Roles
  { id: 10, name: 'Journey manager',      avatarType: 'Role',   avatarSrc: '',                                subText: '10 members',               tag: 'Role'  },
  { id: 11, name: 'Junior developer',     avatarType: 'Role',   avatarSrc: '',                                subText: '7 members',                tag: 'Role'  },
]

/**
 * Filter the dataset by a search query.
 * Matches against name and subText, case-insensitive.
 */
export function searchMockData(query) {
  if (!query || !query.trim()) return []
  const q = query.trim().toLowerCase()
  return mockSearchData.filter(
    item =>
      item.name.toLowerCase().includes(q) ||
      item.subText.toLowerCase().includes(q)
  )
}
