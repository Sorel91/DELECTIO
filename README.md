# DELECTIO

Site vitrine statique pour presenter une plateforme simple de cours en ligne destinee aux enseignants et aux eleves.

## Contenu

- `index.html` : page d'accueil du site
- `styles.css` : styles, mise en page responsive et animations
- `script.js` : menu mobile, animations au scroll et simulation d'envoi du formulaire

## Lancer le site en local

Option simple : ouvrir `index.html` dans un navigateur.

Option serveur local :

```bash
python3 -m http.server 4173
```

Puis ouvrir `http://localhost:4173`.

## Perimetre actuel

Le site est un MVP front-end sans back-end. Le formulaire de contact simule une soumission cote navigateur.

## Evolutions naturelles

- connecter le formulaire a un service d'email ou une API
- ajouter une authentification enseignant / eleve
- creer un tableau de bord de gestion des cours