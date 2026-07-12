import type { ReactNode } from "react";
import { useController, type Control, type FieldValues, type FieldPath } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/utils/cn";

/**
 * RHF-bound wrappers untuk shadcn Input/Textarea. Controlled via useController agar prefilled
 * value & validasi tampil konsisten. (Bug placeholder HeroUI sudah tak relevan di shadcn.)
 */

interface FieldPassthrough {
  label?: ReactNode;
  placeholder?: string;
  description?: ReactNode;
  type?: string;
  isRequired?: boolean;
  isInvalid?: boolean;
  errorMessage?: ReactNode;
  autoComplete?: string;
  className?: string;
  /** Kelas tambahan untuk elemen kontrol di dalam (Input/Textarea/trigger). */
  inputClassName?: string;
  /** Diterima demi kompat; shadcn selalu label di atas. */
  labelPlacement?: "inside" | "outside" | "outside-left";
  minRows?: number;
}

type Bound<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
};

function FieldShell({
  name, label, description, error, className, children,
}: {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {/* penanda wajib */}
        </Label>
      )}
      {children}
      {description && !error && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function FormInput<T extends FieldValues>({ control, name, ...props }: Bound<T> & FieldPassthrough) {
  const { field, fieldState } = useController({ control, name });
  const error = props.errorMessage ?? fieldState.error?.message;
  const invalid = props.isInvalid ?? !!fieldState.error;
  const label = props.isRequired && props.label ? <>{props.label} <span className="text-destructive">*</span></> : props.label;
  return (
    <FieldShell name={name} label={label} description={props.description} error={error} className={props.className}>
      <Input
        id={name}
        type={props.type}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        name={field.name}
        value={(field.value as string | undefined) ?? ""}
        onChange={field.onChange}
        onBlur={field.onBlur}
        ref={field.ref}
        aria-invalid={invalid || undefined}
        className={cn(invalid && "border-destructive focus-visible:ring-destructive", props.inputClassName)}
      />
    </FieldShell>
  );
}

/**
 * Date picker RHF-bound (shadcn Popover + Calendar). Menyimpan value sebagai
 * string ISO tanggal (yyyy-mm-dd) agar mudah diserialisasi ke backend.
 */
export function FormDatePicker<T extends FieldValues>({
  control, name, minDate, maxDate, ...props
}: Bound<T> & FieldPassthrough & { minDate?: Date; maxDate?: Date }) {
  const { field, fieldState } = useController({ control, name });
  const error = props.errorMessage ?? fieldState.error?.message;
  const invalid = props.isInvalid ?? !!fieldState.error;
  const label = props.isRequired && props.label ? <>{props.label} <span className="text-destructive">*</span></> : props.label;
  const value = field.value ? new Date(field.value as string) : undefined;
  const display = value
    ? value.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <FieldShell name={name} label={label} description={props.description} error={error} className={props.className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            aria-invalid={invalid || undefined}
            className={cn(
              "w-full justify-start gap-2 font-normal",
              !value && "text-muted-foreground",
              invalid && "border-destructive focus-visible:ring-destructive",
              props.inputClassName,
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            {display || props.placeholder || "Pilih tanggal"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            defaultMonth={value}
            onSelect={(d) => field.onChange(d ? toISODate(d) : undefined)}
            disabled={
              minDate || maxDate
                ? (d) => (minDate ? d < minDate : false) || (maxDate ? d > maxDate : false)
                : undefined
            }
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </FieldShell>
  );
}

/** yyyy-mm-dd lokal (hindari geser tanggal karena UTC). */
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function FormTextarea<T extends FieldValues>({ control, name, ...props }: Bound<T> & FieldPassthrough) {
  const { field, fieldState } = useController({ control, name });
  const error = props.errorMessage ?? fieldState.error?.message;
  const invalid = props.isInvalid ?? !!fieldState.error;
  const label = props.isRequired && props.label ? <>{props.label} <span className="text-destructive">*</span></> : props.label;
  return (
    <FieldShell name={name} label={label} description={props.description} error={error} className={props.className}>
      <Textarea
        id={name}
        placeholder={props.placeholder}
        rows={props.minRows}
        name={field.name}
        value={(field.value as string | undefined) ?? ""}
        onChange={field.onChange}
        onBlur={field.onBlur}
        ref={field.ref}
        aria-invalid={invalid || undefined}
        className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
      />
    </FieldShell>
  );
}
