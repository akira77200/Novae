# NOVAE — Activer Google OAuth
## Instructions exactes (5 minutes)

---

## ÉTAPE 1 — Google Cloud Console

1. Va sur **console.cloud.google.com**
2. Clique "Nouveau projet" → nomme-le `novae` → Créer
3. Dans le menu gauche → **API et services** → **Identifiants**
4. Clique **+ Créer des identifiants** → **ID client OAuth**
5. Type d'application : **Application Web**
6. Nom : `Novae`
7. Dans "URI de redirection autorisés", ajoute :
   ```
   https://XXXXXX.supabase.co/auth/v1/callback
   ```
   (Remplace XXXXXX par ton Project ID Supabase)
8. Clique **Créer**
9. Copie le **Client ID** et le **Client Secret**

---

## ÉTAPE 2 — Supabase

1. Va sur **supabase.com** → ton projet
2. Menu gauche → **Authentication** → **Providers**
3. Trouve **Google** → active le toggle
4. Colle ton **Client ID** et **Client Secret**
5. Copie l'**URL de callback** affichée par Supabase
6. Retourne dans Google Cloud Console et ajoute cette URL exacte dans les redirections autorisées
7. Clique **Save** dans Supabase

---

## ÉTAPE 3 — Tester

Relance ton app (`npm run dev`) et clique "Continuer avec Google".
La popup Google doit s'ouvrir correctement.

---

## En production (Netlify)

Ajoute aussi ces URLs dans Google Cloud Console :
```
https://ton-app.netlify.app/auth/v1/callback
```

Et dans .env.local :
```
NEXT_PUBLIC_APP_URL=https://ton-app.netlify.app
```
