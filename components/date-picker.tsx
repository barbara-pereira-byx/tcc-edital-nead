"use client"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function DatePicker({ date, setDate, disabled }: DatePickerProps) {
  const currentDate = new Date();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          disabled={disabled} // Desabilitar o botão se a propriedade disabled for verdadeira
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {disabled ? (
            format(currentDate, "PPP", { locale: ptBR }) // Exibir a data atual quando desabilitado
          ) : (
            date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={ptBR} />
      </PopoverContent>
    </Popover>
  );
}
