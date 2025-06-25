import { render } from '@testing-library/react'
import { Switch } from '@/components/ui/switch'

describe('Switch', () => {
  it('deve renderizar', () => {
    render(<Switch />)
  })
})