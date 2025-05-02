import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface EditalCardProps {
  edital: any
}

export function EditalCard({ edital }: EditalCardProps) {
  // Verificar se o edital está no período de inscrições
  const hoje = new Date()
  const dataInicio = edital.formulario?.dataInicio ? new Date(edital.formulario.dataInicio) : null
  const dataFim = edital.formulario?.dataFim ? new Date(edital.formulario.dataFim) : null

  const inscricoesAbertas = dataInicio && dataFim && hoje >= dataInicio && hoje <= dataFim

  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-2 text-lg">{edital.titulo}</CardTitle>
          {inscricoesAbertas ? (
            <Badge>Inscrições Abertas</Badge>
          ) : (
            <Badge variant="secondary">
              {dataInicio && hoje < dataInicio ? "Em Breve" : dataFim && hoje > dataFim ? "Encerrado" : "Indisponível"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {edital.secoes?.[0]?.topicos?.[0]?.texto?.substring(0, 150) || "Sem descrição disponível"}
          {edital.secoes?.[0]?.topicos?.[0]?.texto?.length > 150 ? "..." : ""}
        </p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <div className="flex flex-col w-full">
          <div className="flex justify-between">
            <span>Publicado em:</span>
            <span>{new Date(edital.dataPublicacao).toLocaleDateString("pt-BR")}</span>
          </div>
          {edital.formulario?.dataFim && (
            <div className="flex justify-between mt-1">
              <span>Inscrições até:</span>
              <span>{new Date(edital.formulario.dataFim).toLocaleDateString("pt-BR")}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
