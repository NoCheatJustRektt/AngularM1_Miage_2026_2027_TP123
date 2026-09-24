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

### 2026-09-24 — Prompt 7
**Prompt :** « Explique moi, sans donner exactement la réponse, de la manière à procéder pour traiter le 401 sur le login »
**Résultat :** Explication méthodologique (sans code final) : repérer `catchError` sur l'Observable retourné par `next(request)`, utiliser `HttpErrorResponse` pour lire le statut, distinguer un 401 sur une route protégée (session expirée → déconnexion + redirection) d'un 401 sur `/auth/login` (identifiants invalides → déjà géré localement par le composant), relancer l'erreur avec `throwError` pour ne pas casser le `.subscribe({ error })` de l'appelant, et réutiliser le pattern `inject()` déjà présent dans le fichier. Aucun fichier modifié par l'agent — l'étudiant a écrit sa propre implémentation ensuite.

### 2026-09-24 — Prompt 8
**Prompt :** « Est-ce que ma solution proposée de semble cohérente ? Réalise des tests unitaires si besoin, et inscrit les également dans le rapport »
**Résultat :** Relecture de l'implémentation de `auth.interceptor.ts` écrite par l'étudiant (gestion du 401 via `catchError`/`throwError`, exclusion de `/auth/login`, `authService.logout()` + `router.navigate(['/login'])`). Verdict : cohérent et fonctionnel, avec deux remarques mineures de style signalées (correspondance par sous-chaîne sur l'URL, `navigate` vs `navigateByUrl` utilisé ailleurs). Création du fichier de tests unitaires `frontend-starter/src/app/shared/interceptors/auth.interceptor.spec.ts` (Vitest + `TestBed.runInInjectionContext`, `AuthService`/`Router` mockés) couvrant : ajout du header `Authorization` si token présent, absence du header sinon, déconnexion + redirection sur un 401 d'une route protégée, absence de déconnexion sur un 401 de `/auth/login`, absence de déconnexion sur une erreur non-401. Exécution des tests via `npm test` : 5/5 passent.
**Fichiers modifiés :** `frontend-starter/src/app/shared/interceptors/auth.interceptor.spec.ts` (créé) ; `frontend-starter/angular.json` (ajout d'une configuration `development` manquante sur la cible `build`, requise par le nouveau runner de tests Angular 22) ; `frontend-starter/package.json` (ajout de `jsdom` en devDependency, requis par Vitest pour simuler le DOM ; ajout du flag `--isolate=false` au script `test`, nécessaire car le pool de workers "forks" de Vitest échouait à démarrer sur cette machine — vraisemblablement à cause des espaces/accents dans le chemin du projet).
**Preuve de fonctionnement :** sortie de `npm test` — `Test Files 1 passed (1)`, `Tests 5 passed (5)`.

**Vérifications à réaliser par le binôme avant rendu :** relire chaque extrait de code proposé, l'appliquer soi-même, tester dans le navigateur (connexion, F5, expiration/altération du token, déconnexion) et capturer les preuves Network demandées par le sujet. Relire aussi le fichier de tests unitaires créé par l'agent pour être capable d'expliquer ce que chaque test vérifie et pourquoi.

### 2026-09-24 — Prompt 9
**Prompt :** « Parfait, désormais il faudrait faire ce point là : Chargement du profil "lorsqu'il est demandé" — Comme tout à l'heure, explique moi sans donner la réponse de ce qu'il faut faire »
**Résultat :** Explication méthodologique (sans code final) pour rendre le chargement de `/api/users/me` automatique sur `profile-page.ts` : identifier le hook de cycle de vie Angular adapté (exécuté une fois à la création du composant) et l'interface à implémenter, réutiliser la méthode `load()` déjà existante à l'intérieur de ce hook, décider du sort du bouton "Charger mon profil" (suppression ou reconversion en bouton de rafraîchissement) au regard du libellé exact du sujet, réfléchir à la redondance avec l'appel déjà fait au démarrage de l'app dans `AppComponent`, et anticiper la condition de course entre ce chargement initial (asynchrone) et l'affichage du formulaire si l'utilisateur navigue très vite vers `/profile`. Aucun fichier modifié par l'agent — implémentation laissée au binôme.

### 2026-09-24 — Prompt 10
**Prompt :** « Maintenant il nous reste quoi à faire pour la mission 1 ? »
**Résultat :** Relecture du code actuel (`profile-page.ts`/`.html`, `login-page.ts`, `register-page.ts`, `auth.interceptor.ts`) pour dresser un état des lieux à jour. Constat : l'étudiant a bien implémenté `OnInit`/`ngOnInit()` dans `ProfilePageComponent` pour charger le profil automatiquement (bouton manuel supprimé, bonus `[disabled]="form.invalid"` ajouté sur le bouton "Enregistrer") et la gestion du 401 est en place et testée. Seul point de la Mission 1 encore ouvert identifié : validations et messages d'erreur compréhensibles (pas de `Validators.minLength(8)` sur le mot de passe, aucun message d'erreur affiché champ par champ dans `login-page.html`/`register-page.html`). Rappel des livrables non-code restants (schéma, captures Network, explication Signal vs localStorage). Aucun fichier modifié par l'agent.

### 2026-09-24 — Prompt 11
**Prompt :** « N'oublie pas d'inscrire ce prompt dans le fichier rapport_ia_modele, il faut que chaque prompt sans exception y figure »
**Résultat :** Rappel de l'étudiant sur l'exigence de traçabilité exhaustive posée par `CLAUDE.md` (racine). Ajout rétroactif du Prompt 10 manquant dans ce fichier, et enregistrement d'une mémoire persistante pour journaliser systématiquement chaque prompt à l'avenir sur ce projet. Aucun fichier modifié en dehors de `RAPPORT_IA_MODELE.md`.

### 2026-09-24 — Prompt 12
**Prompt :** « Comme avant, fais moi une explication de ce qu'il faut faire pour le point validations et message d'erreur »
**Résultat :** Explication méthodologique (sans code final) pour le dernier point ouvert de la Mission 1 : repérer les propriétés d'état d'un `FormControl` (`invalid`, `touched`, `dirty`, `errors`, `hasError()`), ajouter `Validators.minLength(8)` sur le mot de passe d'inscription (en questionnant si le login en a besoin), choisir le bon moment d'affichage (`touched`/`dirty` plutôt qu'à l'arrivée sur la page) pour ne pas agresser l'utilisateur, cibler le message précis selon la clé d'erreur active, réutiliser le pattern `@if` déjà présent dans `login-page.html` en le branchant sur l'état des contrôles, arbitrer la duplication entre 4 champs (nom, 2x email, 2x mot de passe) au regard de la consigne "garder les templates simples" de `best-practices.md`, et étendre `[disabled]="form.invalid"` (déjà utilisé sur le bouton "Enregistrer" du profil) aux boutons de connexion/inscription. Aucun fichier modifié par l'agent — implémentation laissée au binôme.