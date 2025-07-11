import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('deve combinar classes corretamente', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('deve lidar com classes condicionais', () => {
      const result = cn('base', true && 'conditional', false && 'hidden')
      expect(result).toBe('base conditional')
    })

    it('deve mesclar classes do Tailwind', () => {
      const result = cn('p-4', 'p-2')
      expect(result).toBe('p-2')
    })

    it('deve lidar com arrays de classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('deve lidar com valores undefined e null', () => {
      const result = cn('class1', undefined, null, 'class2')
      expect(result).toBe('class1 class2')
    })
  })
})