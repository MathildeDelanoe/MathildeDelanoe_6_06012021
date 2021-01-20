// Importation des dépendances
const http = require('http');
const app = require('./app');

/* Création de la fonction de normalisation de port
   Prend en paramètre un argument de type chaîne de caractères ou un nombre
   et retourne un nombre correspondant au port d'écoute du serveur
*/
function normalizePort(val)
{
  const port = parseInt(val, 10); // Conversion d'une chaîne de caractère en nombre décimal (base 10)

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

// Sélection du port de l'application Express
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/* Fonction de gestion des erreurs
   La fonction recherche les différentes erreurs et les gère de manière appropriée.
   Cette fonction est ensuite enregistrée dans le serveur ligne 53
*/
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Création du web server pour recevoir des requêtes. Les requêtes sont ensuite dirigées vers l'application Express
const server = http.createServer(app);

server.on('error', errorHandler);
// Affichage dans la console du port ou du canal d'écoute du serveur
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

// Le serveur écoute le port défini plus haut
server.listen(port);
