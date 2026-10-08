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

### 2026-10-02 — Prompt 13
**Prompt :** « Vérifie que l'ensemble du TP1 a bien été implémenté »
**Résultat :** Vérification complète : relecture de `login-page.ts/html` et `register-page.ts/html` (confirmant que l'étudiant a bien implémenté `getErrorMessage()`, `Validators.minLength(8)`, l'affichage conditionnel `touched`/`dirty` et les boutons `[disabled]`), vérification `git log`/`git status` (tout est committé, rien en attente), exécution de `npm run build` (succès) et `npm test` (5/5 tests toujours au vert) dans `frontend-starter`. Conclusion : les 10 exigences de code de la Mission 1 sont désormais toutes satisfaites. Recherche dans le dépôt (fichiers image, documents) ne faisant apparaître aucune trace des livrables non-code du sujet : schéma annoté du flux de connexion (Mission 0), captures Network du Checkpoint, explication écrite Signal vs `localStorage`. Ces éléments ont été signalés comme restant à produire par le binôme, l'agent ne pouvant pas les produire à sa place (captures d'écran de leur propre navigateur, schéma personnel, réponses de compréhension pour l'oral). Aucun fichier de code modifié par l'agent à cette étape.

## Mission 2 / Mission 3 — Journal des échanges TP2

### 2026-10-02 — Prompt 14
**Prompt :** « Parfait on passe au TP2. Fais moi une liste détaillée de ce qu'il y a à faire »
**Résultat :** Lecture de `SUJET_ETUDIANT_TP2.md`, `track.service.ts`, `tracks-page.ts/html/css`, `track.model.ts`, `page.model.ts`. Audit détaillé Mission 2 (pagination déjà fonctionnelle côté `TrackService.list`/Signals/`@for`/`@empty`, seul le Signal d'erreur manque) et Mission 3 (mécanisme d'upload/lecture déjà fourni par le starter et correct, mais manquent : validation frontend du fichier avant envoi, état de chargement pendant l'upload, anti double-soumission, affichage des erreurs serveur et d'un message de succès, présentation en vraies cards avec format/date affichés, correction de l'unité affichée pour la taille — actuellement en octets mais libellée "Ko" —, indication de la piste en cours de lecture, gestion des erreurs audio, et révocation de l'`ObjectURL` via `OnDestroy`). Rappel des points du Checkpoint Network et des livrables non-code (captures, explication Blob/ObjectURL, réponses aux questions buffering/streaming). Aucun fichier modifié par l'agent.

### 2026-10-02 — Prompt 15
**Prompt :** « On commence la mission 2, qu'est-ce qu'il faut implémenter ? Explique moi en détail ce qu'il faut faire, sans donner la réponse »
**Résultat :** Explication méthodologique (sans code final) pour le seul point manquant de la Mission 2 : le Signal d'erreur. Guidage sur la réutilisation du pattern déjà présent dans `login-page.ts`/`register-page.ts`, le bon endroit pour réinitialiser le signal (début de `load()` plutôt que seulement dans le callback succès), l'extraction du message depuis l'objet d'erreur HTTP, l'articulation avec le Signal `loading` existant, et une question ouverte sur la cohérence entre le Signal `page` (mis à jour de façon optimiste dans `go()`) et un éventuel échec de chargement. Aucun fichier modifié par l'agent — implémentation laissée au binôme.

### 2026-10-02 — Prompt 16
**Prompt :** « Vérifie mon implémentation. Est-ce que j'ai bien tout mis en place ? Est-ce que ça te semble cohérent ? »
**Résultat :** Relecture de `tracks-page.ts/html/css` après l'ajout du Signal `error` par l'étudiant. Vérification positive : réinitialisation correcte en début de `load()`, nettoyage de `tracks` sur erreur, réutilisation cohérente du pattern et de la classe CSS `.error`, bonne anticipation du chevauchement d'états en encapsulant le bloc `@empty` dans `@if (!loading() && !error())`. Un point mineur signalé : le Signal `page` n'est pas reverté en cas d'échec de `go()`, ce qui peut afficher un numéro de page incohérent avec une liste vide. `npm run build` exécuté avec succès. Aucun fichier modifié par l'agent.

### 2026-10-02 — Prompt 17
**Prompt :** « J'ai appliqué des modifications. Cela te semble correct désormais ? »
**Résultat :** Relecture de `tracks-page.ts` après refactor de `load(requestedPage)` avec mémorisation de `previousPage` et revert de `page` en cas d'échec. Vérification positive : la solution résout le point soulevé précédemment, et la suppression de `this.tracks.set([])` dans le callback d'erreur est jugée cohérente avec cette nouvelle logique (la page revient à l'ancienne valeur, donc la liste déjà affichée reste correcte). Deux remarques mineures signalées : redondance de `this.page.set(1)` avant `this.load()` dans `upload()` (le paramètre de `load()` suffit désormais), et une indentation incohérente ligne 32. `npm run build` exécuté avec succès. Aucun fichier modifié par l'agent — Mission 2 jugée complète.

### 2026-10-02 — Prompt 18
**Prompt :** « On enchaîne sur la mission 3. Comme d'habitude, explique moi ce qu'il y a à faire »
**Résultat :** Explication méthodologique complète (sans code) découpée en 6 volets : (A) compréhension du flux upload/lecture déjà fourni par le starter et pourquoi une URL directe en `src` n'aurait pas l'en-tête JWT, (B) validation du fichier avant l'appel HTTP (type/taille, miroir des contraintes backend), (C) états d'interface pendant l'upload (chargement, anti double-soumission, erreur serveur, message de succès), (D) présentation en cards (format, date, correction de l'unité de taille actuellement erronée), (E) complément de la lecture (piste active, erreurs audio, révocation de l'`ObjectURL` via `OnDestroy`), (F) rappel des 5 questions mémoire/buffering/streaming à documenter par écrit. Aucun fichier modifié par l'agent.

### 2026-10-02 — Prompt 19
**Prompt :** « On commence par le B. Qu'est-ce que je dois faire concrètement ? Sans me donner la réponse »
**Résultat :** Déroulé concret en 7 étapes (sans code) pour la validation frontend du fichier audio : centraliser les règles (type MIME autorisés + taille max, en miroir du backend), valider dans `choose()`, décider du comportement si invalide (ne pas stocker le fichier, vider l'`<input>`, afficher un message), nettoyer l'erreur quand un fichier valide est choisi, revoir la condition de désactivation du bouton, garder une revalidation défensive dans `upload()`, et tester 3 cas concrets (fichier renommé, fichier trop lourd, fichier valide). Aucun fichier modifié par l'agent.

### 2026-10-08 — Prompt 20
**Prompt :** « On en est où ? »
**Résultat :** Relecture de `tracks-page.ts/html` après implémentation de la validation par l'étudiant (constantes `MAX_FILE_SIZE`/`ALLOWED_MIME_TYPES`, Signal `uploadError` dédié, validation dans `choose()` et revalidation défensive dans `upload()` — jugées correctes et conformes à la méthode proposée). **Bug bloquant détecté** : `tracks-page.html` contenait une balise `<article class="card">` dupliquée par erreur (lignes 9-10), décalant la fermeture des balises jusqu'au `</div>` de la grille — confirmé par `npm run build` qui échouait avec `NG5002: Unexpected closing tag "div"`. Correction signalée à l'étudiant (sans l'appliquer soi-même) pour qu'il la corrige. Aucun fichier modifié par l'agent.

### 2026-10-08 — Prompt 21
**Prompt :** « C'est patché, on passe à quoi ? »
**Résultat :** Vérification du correctif : `npm run build` relancé, compilation réussie. Point B (validation du fichier) de la Mission 3 confirmé opérationnel.

### 2026-10-08 — Prompt 22
**Prompt :** « Regarde mon implémentation, confirme que j'ai bien répondu à ce qui est attendu, et donne moi la suite »
**Résultat :** Relecture de `tracks-page.ts/html/css` pour le point C (états d'interface pendant l'upload). Vérification positive : Signal `isUploading` distinct de `loading`, remis à `false` dans les deux branches `next`/`error`, bouton protégé par une condition combinée et une garde défensive dans `upload()`, Signal `uploadSuccess` avec disparition automatique via `setTimeout` (en nettoyant tout timer précédent), et anticipation du point E en implémentant déjà `OnDestroy`/`ngOnDestroy()` pour annuler ce timer à la destruction du composant. `npm run build` exécuté avec succès. Un commentaire résiduel signalé à nettoyer (ligne 112, « Les méthodes que tu avais perdues sont bien là »). Explication méthodologique donnée ensuite pour le point D (présentation en cards : grille responsive, ajout du format/date, correction de l'unité de taille). Aucun fichier modifié par l'agent.

### 2026-10-08 — Prompt 23
**Prompt :** « Analyse mon implémentation et confirme moi si c'est bon »
**Résultat :** Relecture de `tracks-page.ts/html/css` et du nouveau fichier `shared/pipes/file-zize.pipe.ts` pour le point D. Vérification positive : grille `.tracks-grid` responsive (`repeat(auto-fill, minmax(280px, 1fr))`), cartes `.track-card` réutilisant `.card`, ajout du format via une méthode `formatMimeType()` et de la date via le `DatePipe` natif d'Angular, correction de l'unité de taille via un pipe personnalisé `FileSizePipe` (conversion octets → o/Ko/Mo/Go, logique vérifiée correcte), bonne hiérarchie sémantique des titres (`h1` > `h2` > `h3` par piste). `npm run build` exécuté avec succès. Points mineurs signalés : faute de frappe dans le nom de fichier du pipe (`file-zize` au lieu de `file-size`), commentaire résiduel toujours présent (ligne 115), indentation incohérente de la seconde balise `<article>`, et question ouverte sur l'usage de `<article>`/liste sémantique plutôt que `<div>` pour chaque piste (accessibilité). Aucun fichier modifié par l'agent.

### 2026-10-08 — Prompt 24
**Prompt :** « On passe au point E »
**Résultat :** Explication méthodologique (sans code) pour le dernier point de la Mission 3 : mémoriser l'id de la piste en cours de lecture pour l'indiquer visuellement, distinguer les deux sources d'erreur audio (échec HTTP vs échec natif de décodage de la balise `<audio>`, via l'événement `error`), et étendre `ngOnDestroy()` (déjà présent pour le timer de succès) pour révoquer la dernière `ObjectURL`. Aucun fichier modifié par l'agent.

### 2026-10-08 — Prompt 25
**Prompt :** « Mon import est en erreur, tu peux le fix ? »
**Résultat :** Diagnostic : l'étudiant avait corrigé l'import vers `file-size.pipe` sans renommer le fichier physique, resté `file-zize.pipe.ts`. Correction appliquée par l'agent : création de `shared/pipes/file-size.pipe.ts` avec le contenu identique, suppression de l'ancien fichier `file-zize.pipe.ts`. `npm run build` relancé avec succès. Signalé à l'étudiant que la logique TypeScript du point E (`playingTrackId`, `playbackError`, `onAudioError`, `cleanupAudioUrl`) était déjà écrite mais pas encore câblée dans `tracks-page.html` (aucun `@if`/`[class]`/`(error)` ne les utilisait).
**Fichiers modifiés :** `frontend-starter/src/app/shared/pipes/file-size.pipe.ts` (créé) ; `frontend-starter/src/app/shared/pipes/file-zize.pipe.ts` (supprimé).

### 2026-10-08 — Prompt 26
**Prompt :** « Est-ce que mon implémentation te semble bonne ? »
**Résultat :** Relecture de `tracks-page.html/css` après câblage du point E : `[class.active]` sur chaque card comparant `playingTrackId()` à `track.id`, bascule d'icône ▶/🔊, affichage de `playbackError()`, écouteur `(error)="onAudioError($event)"` sur `<audio>`, styles `.track-card.active` associés. Vérification positive, `npm run build` exécuté avec succès. Point mineur d'accessibilité signalé : l'`aria-label` du bouton de lecture reste statique ("Lire ...") même quand la piste est active, sans refléter l'état en cours. Mission 3 jugée complète côté code (points A à E). Aucun fichier modifié par l'agent.

### 2026-10-08 — Prompt 27
**Prompt :** « On est bon pour passer au TD3 ? (Sans prendre en compte les questions) »
**Résultat :** Lecture de `SUJET_ETUDIANT_TP3.md` pour vérifier les prérequis (TP1/TP2 fonctionnels : connexion, profil, pagination, upload, lecture audio). Exécution de `npm run build` (succès) et `npm test` (5/5 toujours au vert). Vérification `git status` : le travail de la Mission 3 (CSS/HTML/TS de `tracks-page` + nouveau dossier `shared/pipes/`) n'est pas encore commité. Conclusion : prêt pour démarrer le TP3 sur le plan du code, en excluant les questions de réflexion comme demandé ; rappel que les livrables non-code de TP1/TP2 restent en attente et qu'un commit du travail en cours est recommandé avant d'enchaîner. Aucun fichier modifié par l'agent.