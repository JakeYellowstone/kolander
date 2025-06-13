Avec 1000 lignes et **887 vrais positifs**, tu as un **fort déséquilibre de classes** :

| Classe         | Nombre d'exemples |
| -------------- | ----------------- |
| Vrai positif   | 887               |
| Autres (FN/FP) | 113               |

Tu veux équilibrer (par oversampling ou autre), donc tu auras un dataset plus équilibré **après prétraitement**.

---

## ✅ Quel modèle de Machine Learning utiliser ?

### 🔹 1. **Taille du dataset : 1000 lignes** (petit dataset)

Certains modèles très puissants comme les réseaux de neurones ne sont **pas adaptés**, car ils nécessitent beaucoup de données. Il faut donc un modèle :

* **simple**
* **rapide à entraîner**
* **interprétable**
* **robuste au bruit / petit volume**

---

## 🧠 Recommandations adaptées

### 🥇 **1. RandomForestClassifier**

* **Très robuste**, fonctionne bien même sur petit dataset
* **Gère bien les déséquilibres** (avec `class_weight='balanced'`)
* Résiste au bruit
* Permet de voir l'**importance des features**

```python
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(class_weight='balanced', random_state=42)
```

---

### 🥈 **2. XGBoostClassifier**

* Très bon pour les **problèmes de classification binaire déséquilibrée**
* Performant même sur petit volume
* Prend en compte les **poids de classe** via `scale_pos_weight`
* Plus rapide que Random Forest dans certains cas

```python
from xgboost import XGBClassifier
model = XGBClassifier(scale_pos_weight=113/887, use_label_encoder=False, eval_metric='logloss')
```

---

### 🥉 **3. LogisticRegression (avec class\_weight)**

* Bonne baseline
* Facile à interpréter
* Rapide à entraîner

```python
from sklearn.linear_model import LogisticRegression
model = LogisticRegression(class_weight='balanced', solver='liblinear')
```

---

### ❌ Modèles **à éviter** ici :

* **MLPClassifier (réseau de neurones)** : trop petit jeu de données
* **KNN** : sensible à l’échelle, faible performance sur petits jeux bruités
* **SVC** : bon en théorie, mais sensible à l’échelle et lent si oversampling

---

## ⚙️ Recommandation finale :

1. **Prétraite** (balance avec SMOTE ou `class_weight`)
2. **Commence par RandomForest** ou **XGBoost**
3. **Compare avec LogisticRegression** comme baseline
4. Évalue avec **Recall, F1-score**, et **Confusion Matrix**