"""
retrain.py  -  Rebuild classifier using TF-IDF + Logistic Regression.
The Keras/LSTM model on this dataset learns nothing because ticket descriptions
are mostly template placeholder text.  A TF-IDF + LR pipeline is far superior.
"""
import re, pickle
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# ── Load & clean ──────────────────────────────────────────
df = pd.read_csv('customer_support_tickets.csv')
df = df.dropna(subset=['Ticket Description', 'Ticket Type'])

def clean(text):
    text = re.sub(r'\{[^}]+\}', '', text)          # remove {placeholders}
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)       # keep letters only
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text

df['clean'] = df['Ticket Description'].astype(str).apply(clean)

X     = df['clean'].tolist()
y_raw = df['Ticket Type'].astype(str).tolist()

# ── Encode labels ─────────────────────────────────────────
le = LabelEncoder()
y  = le.fit_transform(y_raw)
print("Classes:", list(le.classes_))

# ── Split ─────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Train: {len(X_train)}  Test: {len(X_test)}")

# ── Pipeline: TF-IDF → Logistic Regression ───────────────
pipe = Pipeline([
    ('tfidf', TfidfVectorizer(
        max_features=20000,
        ngram_range=(1, 3),
        sublinear_tf=True,
        min_df=2,
        strip_accents='unicode'
    )),
    ('clf', LogisticRegression(
        max_iter=1000,
        C=5.0,
        solver='lbfgs',
        random_state=42
    ))
])

print("\nTraining...")
pipe.fit(X_train, y_train)

# ── Evaluate ──────────────────────────────────────────────
preds = pipe.predict(X_test)
acc   = accuracy_score(y_test, preds)
print(f"\nAccuracy: {acc*100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, preds, target_names=le.classes_))

# ── Test it manually ──────────────────────────────────────
test_cases = [
    "My laptop screen is flickering and sometimes goes completely black",
    "I was charged twice on my credit card this month",
    "I cannot login to my account, forgot my password",
    "The software keeps crashing when I try to open",
    "I want to cancel my subscription immediately",
]
print("\nManual Tests:")
for tc in test_cases:
    c     = clean(tc)
    probs = pipe.predict_proba([c])[0]
    idx   = np.argmax(probs)
    print(f"  '{tc[:55]}' -> {le.classes_[idx]} ({probs[idx]*100:.1f}%)")

# ── Save ──────────────────────────────────────────────────
with open('classifier_pipeline.pkl', 'wb') as f:
    pickle.dump(pipe, f)
with open('label_encoder.pkl', 'wb') as f:
    pickle.dump(le, f)

print("\nSaved: classifier_pipeline.pkl  label_encoder.pkl")
