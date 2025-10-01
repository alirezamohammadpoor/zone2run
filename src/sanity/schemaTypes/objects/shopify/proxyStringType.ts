import {defineField} from 'sanity'

import ProxyStringInput from '../../../inputs/ProxyString'

export const proxyStringType = defineField({
  name: 'proxyString',
  title: 'Title',
  type: 'string',
  components: {
    input: ProxyStringInput,
  },
})
