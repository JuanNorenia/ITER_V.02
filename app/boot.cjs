import("./dist/boot.js").catch(error => {
  console.error("No se pudo iniciar la aplicación ITER.", error);
  process.exitCode = 1;
});
