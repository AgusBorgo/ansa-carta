import type { Momento } from "./schema";

const aMinutos = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Minutos desde la medianoche en la zona horaria del local (no la del celular). */
export function minutosEn(zonaHoraria: string, fecha = new Date()): number {
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: zonaHoraria,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);
  const valor = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value ?? 0);
  return valor("hour") * 60 + valor("minute");
}

function estaAbierto(m: Momento, minutos: number): boolean {
  const desde = aMinutos(m.desde);
  const hasta = aMinutos(m.hasta);
  return desde <= hasta ? minutos >= desde && minutos < hasta : minutos >= desde || minutos < hasta;
}

/**
 * Elige qué parte de la carta mostrar según la hora: la que está en curso o,
 * si el local está cerrado, la próxima en abrir.
 */
export function momentoActual(momentos: Momento[], minutos: number): string {
  const enCurso = momentos.find((m) => estaAbierto(m, minutos));
  if (enCurso) return enCurso.id;
  const faltan = (m: Momento) => (aMinutos(m.desde) - minutos + 1440) % 1440;
  return [...momentos].sort((a, b) => faltan(a) - faltan(b))[0].id;
}
