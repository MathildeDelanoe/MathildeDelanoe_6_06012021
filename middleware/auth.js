// Importation des dépendances
const jwt = require('jsonwebtoken');

// Création du middleware qui vérifie l'authentification à l'aide du token
module.exports = (req, res, next) => {
    try
    {
      /* La variable 'authorization' de 'req.headers' est un chaîne de caractères qui contient 'bearer xxxxx' 
         où xxxx représente une chaine de caractères correspodant au token. C'est cette information
         que nous récupérons ici
      */
      const token =  req.headers.authorization.split(' ')[1];
      // Décodage du token à l'aide de la clé utilisée pendant le codage
      const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
      // Récupération du userId du token décodé
      const userId = decodedToken.userId;
      /* Comparaison du userId présent dans le token avec celui de la requête pour s'assurer
         de la bonne authentification des utilisateurs.
      */
      if (req.body.userId && req.body.userId !== userId)
      {
          throw 'User ID non valable !';
      }
      else
      {
          next(); // Appel du middleware suivant
      }
    }
    catch (error)
    {
        res.status(401).json({ error : error | 'Requête non authentifiée !'})
    }
};