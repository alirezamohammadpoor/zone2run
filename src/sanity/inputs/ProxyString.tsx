import {LockIcon} from '@sanity/icons'
import {Box, Text, TextInput, Tooltip} from '@sanity/ui'
import {StringInputProps, useFormValue, SanityDocument, StringSchemaType} from 'sanity'

type Props = StringInputProps<StringSchemaType & {options?: {field?: string}}>

// Helper to get nested values safely using optional chaining
function getNestedValue(obj: any, path: string): string {
  if (!path) return ''
  const parts = path.split('.')
  let current = obj
  for (const part of parts) {
    if (current?.[part] === undefined) return ''
    current = current[part]
  }
  return (current as string) || ''
}

const ProxyString = (props: Props) => {
  const {schemaType} = props

  const path = schemaType?.options?.field
  const doc = useFormValue([]) as SanityDocument

  const proxyValue = path ? getNestedValue(doc, path) : ''

  return (
    <Tooltip
      content={
        <Box padding={2}>
          <Text muted size={1}>
            This value is set in Shopify (<code>{path}</code>)
          </Text>
        </Box>
      }
      portal
    >
      <TextInput iconRight={LockIcon} readOnly={true} value={proxyValue} />
    </Tooltip>
  )
}

export default ProxyString
