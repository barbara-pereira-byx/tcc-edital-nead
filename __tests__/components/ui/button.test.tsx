import { render } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('deve renderizar', () => {
    render(<Button>Test</Button>)
  })
})