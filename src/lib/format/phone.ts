// Solo presentación: no altera el destino tel: ni interpreta otros países.
export function readablePhone(value: string) {
  return value.replace(/^\+34(\d{3})(\d{3})(\d{3})$/, "+34 $1 $2 $3");
}
