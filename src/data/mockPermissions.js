export const mockPermissions = [
  { id: 1,  name: 'Additional Items - Create and edit'                                },
  { id: 2,  name: 'Additional Items - Delete'                                         },
  { id: 3,  name: 'Administrative - Delete'                                           },
  { id: 4,  name: 'Administrative - Edit'                                             },
  { id: 5,  name: 'Administrative - Ignore permissions for the primary parent object' },
  { id: 6,  name: 'Annotations - Add foreign'                                         },
  { id: 7,  name: 'Annotations - Add own'                                             },
  { id: 8,  name: 'Annotations - Delete foreign'                                      },
  { id: 9,  name: 'Annotations - Delete own'                                          },
  { id: 10, name: 'Documents - Create'                                                },
  { id: 11, name: 'Documents - Delete'                                                },
  { id: 12, name: 'Documents - Edit'                                                  },
  { id: 13, name: 'Documents - Move'                                                  },
  { id: 14, name: 'Documents - Share'                                                 },
  { id: 15, name: 'Folders - Create'                                                  },
  { id: 16, name: 'Folders - Delete'                                                  },
]

//  allow / deny / delegate  — one entry per permission row, same order as mockPermissions
const TEMPLATES = {
  'Read/display': [
    //                                                         allow   deny  delegate
    /* Additional Items - Create and edit */                 [false,  true,  false],
    /* Additional Items - Delete          */                 [false,  true,  false],
    /* Administrative - Delete            */                 [false,  true,  false],
    /* Administrative - Edit              */                 [false,  true,  false],
    /* Administrative - Ignore perms      */                 [false,  false, false],
    /* Annotations - Add foreign          */                 [false,  false, false],
    /* Annotations - Add own              */                 [true,   false, false],
    /* Annotations - Delete foreign       */                 [false,  true,  false],
    /* Annotations - Delete own           */                 [true,   false, false],
    /* Documents - Create                 */                 [false,  true,  false],
    /* Documents - Delete                 */                 [false,  true,  false],
    /* Documents - Edit                   */                 [false,  true,  false],
    /* Documents - Move                   */                 [false,  true,  false],
    /* Documents - Share                  */                 [false,  false, false],
    /* Folders - Create                   */                 [false,  true,  false],
    /* Folders - Delete                   */                 [false,  true,  false],
  ],
  'Write/modify': [
    //                                                         allow   deny  delegate
    /* Additional Items - Create and edit */                 [true,   false, false],
    /* Additional Items - Delete          */                 [false,  true,  false],
    /* Administrative - Delete            */                 [false,  true,  false],
    /* Administrative - Edit              */                 [false,  true,  false],
    /* Administrative - Ignore perms      */                 [false,  false, false],
    /* Annotations - Add foreign          */                 [true,   false, false],
    /* Annotations - Add own              */                 [true,   false, false],
    /* Annotations - Delete foreign       */                 [true,   false, false],
    /* Annotations - Delete own           */                 [true,   false, false],
    /* Documents - Create                 */                 [true,   false, false],
    /* Documents - Delete                 */                 [false,  true,  false],
    /* Documents - Edit                   */                 [true,   false, false],
    /* Documents - Move                   */                 [true,   false, false],
    /* Documents - Share                  */                 [true,   false, false],
    /* Folders - Create                   */                 [true,   false, false],
    /* Folders - Delete                   */                 [false,  true,  false],
  ],
  'Full access': [
    //                                                         allow   deny  delegate
    /* Additional Items - Create and edit */                 [true,   false, true ],
    /* Additional Items - Delete          */                 [true,   false, true ],
    /* Administrative - Delete            */                 [true,   false, false],
    /* Administrative - Edit              */                 [true,   false, false],
    /* Administrative - Ignore perms      */                 [true,   false, false],
    /* Annotations - Add foreign          */                 [true,   false, true ],
    /* Annotations - Add own              */                 [true,   false, true ],
    /* Annotations - Delete foreign       */                 [true,   false, true ],
    /* Annotations - Delete own           */                 [true,   false, true ],
    /* Documents - Create                 */                 [true,   false, true ],
    /* Documents - Delete                 */                 [true,   false, true ],
    /* Documents - Edit                   */                 [true,   false, true ],
    /* Documents - Move                   */                 [true,   false, true ],
    /* Documents - Share                  */                 [true,   false, true ],
    /* Folders - Create                   */                 [true,   false, true ],
    /* Folders - Delete                   */                 [true,   false, true ],
  ],
}

export function getPermissionTemplate(level) {
  const tpl = TEMPLATES[level]
  return mockPermissions.map((p, i) => ({
    ...p,
    allow:    tpl ? tpl[i][0] : false,
    deny:     tpl ? tpl[i][1] : false,
    delegate: tpl ? tpl[i][2] : false,
  }))
}
