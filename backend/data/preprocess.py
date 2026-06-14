# ============================================
# FRAUD DETECTION - DATA PREPROCESSING
# ============================================

import pandas as pd
import numpy as np
import re
from datetime import datetime

print("="*60)
print("FRAUD DETECTION DATA PREPROCESSING")
print("="*60)

# --------------------------------------------
# 1. Load Dataset
# --------------------------------------------

df = pd.read_csv("E:/sem8/MP/data/text_model.csv")

print("\n" + "="*60)
print("1. DATASET OVERVIEW")
print("="*60)
print(f"Dataset Shape: {df.shape[0]} rows × {df.shape[1]} columns")
print(f"\nColumn Names:\n{df.columns.tolist()}")
print(f"\nFirst 3 rows:")
print(df.head(3))

# --------------------------------------------
# 2. Data Quality Check
# --------------------------------------------

print("\n" + "="*60)
print("2. DATA QUALITY ASSESSMENT")
print("="*60)

# Missing values
print("\nMissing Values:")
missing = df.isnull().sum()
if missing.sum() == 0:
    print("✓ No missing values found")
else:
    print(missing[missing > 0])

# Duplicate rows
duplicates = df.duplicated().sum()
print(f"\nDuplicate Rows: {duplicates}")
if duplicates > 0:
    print(f"Removing {duplicates} duplicate rows...")
    df = df.drop_duplicates()

# Data types
print("\nData Types:")
print(df.dtypes)

# --------------------------------------------
# 3. Text Data Preprocessing
# --------------------------------------------

print("\n" + "="*60)
print("3. TEXT DATA PREPROCESSING")
print("="*60)

# Function to clean text
def clean_text(text):
    """Clean and normalize text data"""
    if pd.isna(text):
        return ""
    # Convert to string
    text = str(text)
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text

# Clean Return_Description column
if 'Return_Description' in df.columns:
    print("\nCleaning 'Return_Description' column...")
    df['Return_Description_Clean'] = df['Return_Description'].apply(clean_text)
    
    # Calculate text length
    df['Description_Length'] = df['Return_Description_Clean'].apply(len)
    df['Description_Word_Count'] = df['Return_Description_Clean'].apply(lambda x: len(x.split()))
    
    print(f"✓ Text cleaned and length features created")
    print(f"  - Average description length: {df['Description_Length'].mean():.0f} characters")
    print(f"  - Average word count: {df['Description_Word_Count'].mean():.0f} words")

# --------------------------------------------
# 4. Numerical Data Preprocessing
# --------------------------------------------

print("\n" + "="*60)
print("4. NUMERICAL DATA PREPROCESSING")
print("="*60)

# Identify numerical columns
numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
print(f"\nNumerical columns: {numerical_cols}")

# Check for outliers using IQR method
for col in numerical_cols:
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
    if len(outliers) > 0:
        print(f"\n{col}:")
        print(f"  - Outliers detected: {len(outliers)} ({len(outliers)/len(df)*100:.1f}%)")
        print(f"  - Range: [{df[col].min():.2f}, {df[col].max():.2f}]")
        print(f"  - IQR bounds: [{lower_bound:.2f}, {upper_bound:.2f}]")

# --------------------------------------------
# 5. Categorical Data Preprocessing
# --------------------------------------------

print("\n" + "="*60)
print("5. CATEGORICAL DATA PREPROCESSING")
print("="*60)

# Identify categorical columns
categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
# Remove text description from categorical list
if 'Return_Description' in categorical_cols:
    categorical_cols.remove('Return_Description')
if 'Return_Description_Clean' in categorical_cols:
    categorical_cols.remove('Return_Description_Clean')

print(f"\nCategorical columns: {categorical_cols}")

# Show unique values for each categorical column
for col in categorical_cols:
    unique_count = df[col].nunique()
    print(f"\n{col}:")
    print(f"  - Unique values: {unique_count}")
    print(f"  - Distribution:")
    print(df[col].value_counts().to_string())

# --------------------------------------------
# 6. Feature Engineering
# --------------------------------------------

print("\n" + "="*60)
print("6. FEATURE ENGINEERING")
print("="*60)

# Create fraud indicator features from text
if 'Return_Description_Clean' in df.columns:
    # Keywords associated with fraud
    fraud_keywords = ['multiple', 'duplicate', 'suspicious', 'fraud', 'fake', 
                      'forged', 'altered', 'phantom', 'deceased', 'unlicensed']
    
    def count_fraud_keywords(text):
        """Count fraud-related keywords in text"""
        text_lower = text.lower()
        return sum(1 for keyword in fraud_keywords if keyword in text_lower)
    
    df['Fraud_Keyword_Count'] = df['Return_Description_Clean'].apply(count_fraud_keywords)
    print(f"✓ Created 'Fraud_Keyword_Count' feature")
    print(f"  - Average fraud keywords per claim: {df['Fraud_Keyword_Count'].mean():.2f}")

# Create urgency score if Urgency_Level exists
if 'Urgency_Level' in df.columns:
    urgency_mapping = {
        'Low': 1,
        'Medium': 2,
        'High': 3,
        'Critical': 4,
        'Urgent': 3
    }
    df['Urgency_Score'] = df['Urgency_Level'].map(urgency_mapping)
    print(f"✓ Created 'Urgency_Score' feature from Urgency_Level")

# --------------------------------------------
# 7. Save Preprocessed Data
# --------------------------------------------

print("\n" + "="*60)
print("7. SAVING PREPROCESSED DATA")
print("="*60)

# Save to new CSV
output_file = "E:/sem8/MP/data/text_model_preprocessed.csv"
df.to_csv(output_file, index=False)
print(f"\n✓ Preprocessed data saved to: {output_file}")
print(f"  - Final shape: {df.shape[0]} rows × {df.shape[1]} columns")
print(f"  - New columns added: {df.shape[1] - pd.read_csv('E:/sem8/MP/data/text_model.csv').shape[1]}")

# --------------------------------------------
# 8. Summary Statistics
# --------------------------------------------

print("\n" + "="*60)
print("8. SUMMARY STATISTICS")
print("="*60)

print("\nNumerical Features Summary:")
print(df.describe())

print("\n" + "="*60)
print("PREPROCESSING COMPLETE!")
print("="*60)
