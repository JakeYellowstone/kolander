# **Kolander – Guide de Démarrage**

Kolander est une application composée d’un **frontend Angular** et d’un **backend FastAPI**.
Ce guide décrit toutes les étapes nécessaires pour installer et lancer correctement le projet en local.

---

## 🚀 **1. Prérequis**

Assurez-vous d’avoir installé :

* **Node.js** (version 16+)
* **npm**
* **Python 3.10+**
* **pip**

---

# 🖥️ **2. Installation et lancement du Frontend (Angular)**

## 📂 **Se placer dans le dossier de l’interface**

```bash
cd interface
```

## 📦 **Installer les dépendances**

```bash
npm install
```

## ▶️ **Démarrer le serveur Angular**

```bash
npm start
```

Le serveur démarre généralement sur :

```
http://localhost:4200
```

---

# 🛠️ **3. Installation et lancement du Backend (FastAPI)**

## 📂 **Se déplacer dans le dossier backend**

```bash
cd interface/backend
```

## 📦 **Installer les dépendances Python**

Installez les modules requis :

```bash
pip install fastapi==0.104.1 \
    uvicorn[standard]==0.24.0 \
    pandas==2.1.3 \
    numpy==1.25.2 \
    python-multipart==0.0.6 \
    openpyxl==3.1.2 \
    xlrd==2.0.1 \
    scikit-learn==1.3.2 \
    joblib==1.3.2 \
    python-jose[cryptography]==3.3.0 \
    passlib[bcrypt]==1.7.4
```

---

## 🏗️ **Génération des modèles**

Exécuter le script suivant pour créer les modèles nécessaires :

```bash
python3 create_models.py
```

---

## ▶️ **Démarrer le serveur FastAPI**

```bash
python3 main.py
```

Le backend sera disponible sur :

```
http://localhost:8000
```

Documentation auto-générée (Swagger) :

```
http://localhost:8000/docs
```

---

# ✔️ **4. Application fonctionnelle**

Lorsque :

* Le **frontend Angular** tourne sur `http://localhost:4200`
* Le **backend FastAPI** tourne sur `http://localhost:8000`

… alors Kolander est opérationnel.

---

# 📁 **5. Architecture du projet (résumé)**

```
interface/
│── src/               # Frontend Angular
│── backend/           # Backend FastAPI
│     ├── main.py
│     ├── create_models.py
│     ├── models/
│     ├── ...
```

---

# 🤝 **6. Contributions**

Les contributions, issues et suggestions sont les bienvenues.

