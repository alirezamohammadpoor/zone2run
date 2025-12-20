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

const PlaceholderStringInput = (props: Props) => {
  const {schemaType} = props

  const path = schemaType?.options?.field
  const doc = useFormValue([]) as SanityDocument

  const proxyValue = path ? getNestedValue(doc, path) : ''

  return props.renderDefault({
    ...props,
    elementProps: {...props.elementProps, placeholder: proxyValue},
  })
}

export default PlaceholderStringInput
