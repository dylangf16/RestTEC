const calcularTiempoRestante = (tiempo_limite, descripcion) => {
  const ahora = new Date();

  // Convertimos el tiempo límite a un objeto Date
  const tiempoLimite = new Date(tiempo_limite);

  // Calculamos la diferencia en milisegundos entre la fecha actual y el tiempo límite
  const diferencia = tiempoLimite - ahora;

  // Convertimos la diferencia a días, horas, minutos y segundos
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor(
    (diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

  // Retornamos el tiempo restante en un formato legible
  return `${dias} días, ${horas} horas, ${minutos} minutos y ${segundos} segundos`;
};

export { calcularTiempoRestante };
