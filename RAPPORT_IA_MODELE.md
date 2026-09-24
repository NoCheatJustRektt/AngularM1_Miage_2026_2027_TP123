# Rapport d'usage de l'IA - TP1

Pour chaque mission, détailler et fournir des explications concernant : objectif; prompt principal; plan proposé par l'agent; vérifications réalisées par le binôme; erreurs ou propositions rejetées; fichiers effectivement modifiés; preuve de fonctionnement; ce que chaque membre sait maintenant expliquer sans l'agent.

## Mission 0 / Mission 1 — Journal des échanges avec Claude Code

> Assistant : Claude Code (modèle Sonnet 5). Heure non fournie par l'environnement de l'outil ; seule la date est disponible.

### 2026-09-17 — Prompt 1
**Prompt :** « Lis le fichier fournis. Fais une analyse du projet complet et prévient moi quand tu es prêt »
**Résultat :** Lecture de `SUJET_ETUDIANT_TP1.md`, `API_CONTRACT.md`, du backend (`app.js`, `User.js`, `Track.js`, `server.js`) et du frontend (`auth.service.ts`, pages login/register/profile, `routes.ts`, `auth.guard.ts`, `auth.interceptor.ts`, `main.ts`). Aucun fichier modifié — analyse uniquement.

### 2026-09-17 — Prompt 2
**Prompt :** « Je dois faire la Mission 1 du TP1. Pour chacune des choses, dis moi : Si il faut complètement créer ce qui est demandé / Si ce qui est demandé existe déjà, mais est mal fait »
**Résultat :** Grille de statut point par point pour les 9 exigences de la Mission 1 : OK (formulaires réactifs, appels register/login, stockage JWT, Signal `currentUser`, redirections, `PUT /api/users/me`) ; incomplet (validations/messages d'erreur par champ, chargement manuel du profil) ; manquant (bouton de déconnexion non branché, aucune gestion du 401 dans l'intercepteur). Aucun fichier modifié.

### 2026-09-17 — Prompt 3
**Prompt :** « Pour les deux à créer entièrement, fais moi une explication détaillé »
**Résultat :** Explication détaillée (mécanisme + code d'exemple) pour (1) le bouton de déconnexion dans `app.ts`/`app.html` s'appuyant sur `AuthService.logout()` et le Signal `token`, et (2) la gestion du `401` via `catchError` dans `auth.interceptor.ts` avec nettoyage de session et redirection vers `/login`. Aucun fichier modifié par l'agent à cette étape ; proposé pour implémentation par le binôme.

### 2026-09-24 — Prompt 4
**Prompt :** message d'erreur de compilation Angular NG5002 sur `app.html` ligne 20 ("Unexpected character EOF").
**Résultat :** Diagnostic : `} else {` utilisé au lieu de `} @else {` à la ligne 11 de `app.html` (nouvelle syntaxe de contrôle de flux Angular). Correction appliquée par l'agent : remplacement de `else` par `@else`.
**Fichier modifié :** `frontend-starter/src/app/components/app/app.html`.

### 2026-09-24 — Prompt 5
**Prompt :** « J'aimerai faire évoluer ma barre de navigation. Dans celle-ci, j'aimerai inclure une phrase pour saluer l'utilisateur connecté. Y a t-il une méthode qui permet de récupérer le nom de l'utilisateur ? »
**Résultat :** Identification du Signal existant `AuthService.currentUser` comme source du nom. Repérage de deux bugs introduits par l'étudiant dans `app.ts`/`app.html` : `readonly user = this.auth.profile();` n'est jamais souscrit (Observable froid, jamais exécuté) et `{{ user. }}` référence une variable de template inexistante. Proposition de correction avec le pattern `@if (auth.currentUser(); as user) { {{ user.name }} }`, déjà utilisé dans `profile-page.html`. Mise en évidence que `currentUser` n'est pas persisté dans `localStorage` (contrairement à `token`), donc la salutation disparaît après un F5 tant que le profil n'est pas rechargé. Aucun fichier modifié par l'agent à cette étape ; proposé pour implémentation par le binôme.

### 2026-09-24 — Prompt 6
**Prompt :** « Comment et où faire l'appel de auth.profile() pour que les données de l'utilisateur soient chargées en permanence ? »
**Résultat :** Recommandation d'appeler `auth.profile()` dans le constructeur de `AppComponent`, conditionné par `if (this.auth.token())`, afin de restaurer `currentUser` après un rechargement de page sans dupliquer l'appel après un login classique (déjà couvert par `storeAuthentication`). Explication du lien avec la gestion du 401 côté intercepteur (un token périmé stocké déclenche automatiquement une déconnexion propre). Aucun fichier modifié par l'agent à cette étape ; proposé pour implémentation par le binôme.

**Vérifications à réaliser par le binôme avant rendu :** relire chaque extrait de code proposé, l'appliquer soi-même, tester dans le navigateur (connexion, F5, expiration/altération du token, déconnexion) et capturer les preuves Network demandées par le sujet.



J'aimerai faire évoluer ma barre de navigation. Dans celle-ci, j'aimerai inclure une phrase pour saluer l'utilisateur connecté. Y a t-il une méthode qui permet de récupérer le nom de l'utilisateur ?

Oui : AuthService expose déjà un Signal public pour ça, pas besoin d'appeler l'API à nouveau.


// auth.service.ts, déjà présent
readonly currentUser = signal<User | null>(null);
Ce signal est automatiquement rempli par storeAuthentication() après un login()/register(), et par profile() après un chargement de profil. Il contient l'objet User ({ id, name, email, createdAt }), donc auth.currentUser()?.name te donne le nom réactivement, sans nouvel appel HTTP.

Deux problèmes dans ce que tu as écrit dans app.ts/app.html :

app.ts:13 — readonly user = this.auth.profile(); ne fait pas ce que tu crois. profile() renvoie un Observable (pas encore exécuté tant que personne ne s'y subscribe). Ici, user devient donc littéralement l'objet Observable lui-même, jamais la donnée utilisateur — et l'appel HTTP n'est même jamais déclenché puisque rien ne souscrit dessus.
app.html:8 — {{ user. }} est incomplet et de toute façon user n'existe nulle part dans le template (ni variable locale @if...as user, ni propriété du composant correctement typée), d'où l'erreur de compilation attendue.
Le pattern à utiliser (c'est exactement celui déjà présent dans profile-page.html:4, donc cohérent avec le reste du projet) :


@if (auth.currentUser(); as user) {
  <div class="user">
    <span>Bonjour, {{ user.name }}</span>
  </div>
}
Et dans app.ts, tu peux supprimer complètement la ligne readonly user = this.auth.profile(); — elle est inutile, auth (déjà injecté) suffit.

Point à connaître pour l'oral : currentUser n'est pas persisté dans localStorage (seul le token l'est, via signal<User | null>(localStorage.getItem('gpc_token')) côté token... attention d'ailleurs, currentUser s'initialise toujours à null). Donc si l'utilisateur recharge la page (F5), le token survit mais currentUser() redevient null jusqu'à ce que /api/users/me soit rappelé quelque part. Résultat : juste après un F5, tu verrais le bouton "Déconnexion" (car token() est vrai) mais pas le message de bienvenue (car currentUser() est encore null), jusqu'à passer par /profile.

Veux-tu que je corrige app.ts/app.html maintenant, ou tu préfères l'écrire toi-même ? Si tu veux que la salutation survive aussi au F5, il faudra en plus appeler auth.profile() automatiquement au démarrage de l'app quand un token existe déjà — dis-moi si tu veux que je t'explique ce point aussi ou qu'on le traite dans un second temps.