const calcularTiempoRestante = (tiempo_entrada, minutos_a_sumar) => {
  const ahora = new Date();

  // Convertimos el tiempo de entrada a un objeto Date
  const tiempoEntrada = new Date(tiempo_entrada);

  // Sumamos los minutos adicionales al tiempo de entrada
  tiempoEntrada.setMinutes(tiempoEntrada.getMinutes() + minutos_a_sumar);

  // Calculamos la diferencia en milisegundos entre la fecha actual y el tiempo de entrada modificado
  const diferencia = tiempoEntrada.getTime() - ahora.getTime();

  // Convertimos la diferencia a días, horas, minutos y segundos
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor(
    (diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

  // Construimos la cadena de tiempo restante en un formato legible
  let tiempoRestante = "";
  if (dias !== 0) tiempoRestante += `${dias} días, `;
  if (horas !== 0) tiempoRestante += `${horas} horas, `;
  if (minutos !== 0) tiempoRestante += `${minutos} minutos y `;
  tiempoRestante += `${segundos} segundos`;

  return tiempoRestante;
};

export { calcularTiempoRestante };
