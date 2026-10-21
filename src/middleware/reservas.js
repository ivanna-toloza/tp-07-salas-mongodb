const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const turnosPermitidos = ["Mañana", "Tarde", "Noche"];

function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  res.locals.salasPermitidas = salasPermitidas;
  res.locals.turnosPermitidos = turnosPermitidos;
  next();
}

function validarReserva(req, res, next) {
  const valores = req.body ?? {};
  const estudiante = String(valores.estudiante ?? "").trim();
  const email = String(valores.email ?? "").trim();
  const sala = String(valores.sala ?? "").trim();
  const fecha = String(valores.fecha ?? "").trim();
  const turno = String(valores.turno ?? "").trim();
  const personas = Number(valores.personas);

  if (
    !estudiante ||
    !email ||
    !sala ||
    !fecha ||
    !turno ||
    !email.includes("@") ||
    !salasPermitidas.includes(sala) ||
    !turnosPermitidos.includes(turno) ||
    !Number.isInteger(personas) ||
    personas < 1 ||
    personas > 6
  ) {
    return res.status(400).render("reservas/nueva", {
      titulo: "Registrar nueva reserva",
      error: "Por favor, completá todos los campos con datos válidos.",
      valores,
    });
  }

  req.reservaValidada = {
    estudiante,
    email,
    sala,
    fecha,
    turno,
    personas,
  };

  next();
}

module.exports = { prepararAreaReservas, validarReserva };
