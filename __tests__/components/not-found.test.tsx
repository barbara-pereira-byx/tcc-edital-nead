import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotFound from '@/app/not-found'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('NotFound', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve renderizar a página 404 corretamente', () => {
    render(<NotFound />)
    
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument()
    expect(screen.getByText('A página que você está procurando não existe ou foi movida.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /voltar para editais/i })).toBeInTheDocument()
  })

  it('deve redirecionar para editais ao clicar no botão', async () => {
    const user = userEvent.setup()
    render(<NotFound />)
    
    const button = screen.getByRole('button', { name: /voltar para editais/i })
    await user.click(button)
    
    expect(mockPush).toHaveBeenCalledWith('/editais')
  })
})