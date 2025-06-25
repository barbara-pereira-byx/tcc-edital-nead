import { render } from '@testing-library/react'
import { Label } from '@/components/ui/label'

describe('Label', () => {
  it('deve renderizar', () => {
    render(<Label>Test</Label>)
  })
})