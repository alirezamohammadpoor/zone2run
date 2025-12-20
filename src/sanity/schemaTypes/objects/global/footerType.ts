import {defineField} from 'sanity'

// Reusable link group schema
const linkGroup = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({
        name: 'title',
        title: 'Section Title',
        type: 'string',
      }),
      defineField({
        name: 'links',
        title: 'Links',
        type: 'array',
        of: [
          {
            type: 'object',
            name: 'link',
            fields: [
              defineField({
                name: 'label',
                title: 'Label',
                type: 'string',
                validation: (Rule) => Rule.required(),
              }),
              defineField({
                name: 'url',
                title: 'URL',
                type: 'string',
                description: 'Internal path (e.g. /about) or external URL (e.g. https://instagram.com)',
                validation: (Rule) => Rule.required(),
              }),
              defineField({
                name: 'isExternal',
                title: 'Open in new tab?',
                type: 'boolean',
                initialValue: false,
              }),
            ],
            preview: {
              select: {
                title: 'label',
                subtitle: 'url',
              },
            },
          },
        ],
      }),
    ],
  })

export const footerType = defineField({
  name: 'footerSettings',
  title: 'Footer',
  type: 'object',
  options: {
    collapsed: false,
    collapsible: true,
  },
  fields: [
    defineField({
      name: 'newsletter',
      title: 'Newsletter',
      type: 'object',
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          description: 'e.g. Subscribe to our newsletter',
        }),
        defineField({
          name: 'placeholder',
          title: 'Input Placeholder',
          type: 'string',
          description: 'e.g. Enter your email',
        }),
        defineField({
          name: 'buttonText',
          title: 'Button Text',
          type: 'string',
          description: 'e.g. Subscribe',
        }),
        defineField({
          name: 'successMessage',
          title: 'Success Message',
          type: 'string',
          description: 'e.g. Thanks for subscribing!',
        }),
      ],
    }),
    linkGroup('column1', 'Column 1 (e.g. Zone 2)'),
    linkGroup('column2', 'Column 2 (e.g. Support)'),
    linkGroup('column3', 'Column 3 (e.g. Connect)'),
    defineField({
      name: 'copyrightText',
      title: 'Copyright Text',
      type: 'string',
      description: 'e.g. © 2025 Zone2Run. All rights reserved.',
    }),
  ],
})
