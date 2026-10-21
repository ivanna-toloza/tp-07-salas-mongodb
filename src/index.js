const { leerConfiguracion } = require("./config/entorno");
const { crearServicioReservas } = require("./servicios/reservas");
const { crearApp } = require("./app");

const reservasIniciales = [
  {
    id: 1,
    estudiante: "Lucas Gómez",
    email: "lucas@example.com",
    sala: "Sala Norte",
    fecha: "2026-10-15",
    turno: "Mañana",
    personas: 3,
  },
  {
    id: 2,
    estudiante: "María Rodríguez",
    email: "maria@example.com",
    sala: "Sala Sur",
    fecha: "2026-10-15",
    turno: "Tarde",
    personas: 2,
  },
  {
    id: 3,
    estudiante: "Carlos Pérez",
    email: "carlos@example.com",
    sala: "Sala Multimedia",
    fecha: "2026-10-16",
    turno: "Noche",
    personas: 5,
  },
  {
    id: 4,
    estudiante: "Ana Martínez",
    email: "ana@example.com",
    sala: "Sala Norte",
    fecha: "2026-10-16",
    turno: "Tarde",
    personas: 1,
  },
];

function main() {
  const { puerto, formatoRegistro } = leerConfiguracion();
  const servicioReservas = crearServicioReservas(reservasIniciales);
  const app = crearApp({ servicioReservas, formatoRegistro });

  app.listen(puerto, (error) => {
    if (error) {
      console.error("No se pudo escuchar el puerto:", error.code);
      process.exitCode = 1;
      return;
    }
    console.log(`Aplicación disponible en http://localhost:${puerto}`);
  });
}

try {
  main();
} catch (error) {
  console.error("No se pudo iniciar la aplicación:", error.message);
  process.exitCode = 1;
}
