# ============================================
# FRAUD DETECTION - EXPLORATORY DATA ANALYSIS
# Top 5 Most Important Charts
# ============================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from wordcloud import WordCloud
import warnings
warnings.filterwarnings('ignore')

# Set style for better visualizations
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 6)

print("="*60)
print("FRAUD DETECTION - TOP 5 CHARTS EDA")
print("="*60)

# --------------------------------------------
# Load Preprocessed Data
# --------------------------------------------

try:
    df = pd.read_csv("E:/sem8/MP/data/text_model_preprocessed.csv")
    print("\n✓ Loaded preprocessed data")
except:
    df = pd.read_csv("E:/sem8/MP/data/text_model.csv")
    print("\n✓ Loaded original data")

print(f"Dataset Shape: {df.shape[0]} rows × {df.shape[1]} columns")

# --------------------------------------------
# CHART 1: Fraud Label Distribution
# --------------------------------------------

print(f"\n{'='*60}")
print("CHART 1: FRAUD LABEL DISTRIBUTION")
print(f"{'='*60}")

if 'Fraud_Label' in df.columns:
    fraud_counts = df['Fraud_Label'].value_counts()
    fraud_pct = df['Fraud_Label'].value_counts(normalize=True) * 100
    
    print("\nFraud Label Distribution:")
    for label, count in fraud_counts.items():
        pct = fraud_pct[label]
        print(f"  {label}: {count} ({pct:.1f}%)")
    
    # Visualization
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Count plot
    fraud_counts.plot(kind='bar', ax=axes[0], color=['#2ecc71', '#e74c3c'])
    axes[0].set_title('Fraud Label Distribution (Count)', fontsize=14, fontweight='bold')
    axes[0].set_xlabel('Fraud Label', fontsize=12)
    axes[0].set_ylabel('Count', fontsize=12)
    axes[0].tick_params(axis='x', rotation=0)
    
    # Pie chart
    colors = ['#2ecc71', '#e74c3c']
    axes[1].pie(fraud_counts, labels=fraud_counts.index, autopct='%1.1f%%', 
                colors=colors, startangle=90)
    axes[1].set_title('Fraud Label Distribution (Percentage)', fontsize=14, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(r'E:\sem8\MP\data\1_fraud_distribution.png', dpi=300, bbox_inches='tight')
    print("\n✓ Saved: 1_fraud_distribution.png")
    plt.close()

# --------------------------------------------
# CHART 2: Correlation Heatmap
# --------------------------------------------

print(f"\n{'='*60}")
print("CHART 2: CORRELATION HEATMAP")
print(f"{'='*60}")

numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
# Remove ID columns
numerical_cols = [col for col in numerical_cols if 'ID' not in col.upper() and 'Claim_ID' not in col]

print(f"\nAnalyzing {len(numerical_cols)} numerical features:")
print(numerical_cols)

if len(numerical_cols) > 1:
    plt.figure(figsize=(12, 10))
    correlation_matrix = df[numerical_cols].corr()
    sns.heatmap(correlation_matrix, annot=True, fmt='.2f', cmap='coolwarm', 
                center=0, square=True, linewidths=1, cbar_kws={"shrink": 0.8})
    plt.title('Correlation Heatmap - Numerical Features', fontsize=16, fontweight='bold', pad=20)
    plt.tight_layout()
    plt.savefig(r'E:\sem8\MP\data\2_correlation_heatmap.png', dpi=300, bbox_inches='tight')
    print("\n✓ Saved: 2_correlation_heatmap.png")
    plt.close()

# --------------------------------------------
# CHART 3: Fraud Analysis by Top Category
# --------------------------------------------

print(f"\n{'='*60}")
print("CHART 3: FRAUD ANALYSIS BY CATEGORY")
print(f"{'='*60}")

categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
# Remove text description columns and fraud label
categorical_cols = [col for col in categorical_cols if 'Description' not in col and 'Clean' not in col and col != 'Fraud_Label']

if 'Fraud_Label' in df.columns and len(categorical_cols) > 0:
    # Use the first categorical column with reasonable number of categories
    for col in categorical_cols:
        if df[col].nunique() <= 10:
            print(f"\n{col} vs Fraud_Label:")
            cross_tab = pd.crosstab(df[col], df['Fraud_Label'], normalize='index') * 100
            print(cross_tab.round(2))
            
            # Grouped bar chart
            plt.figure(figsize=(14, 7))
            cross_tab_counts = pd.crosstab(df[col], df['Fraud_Label'])
            cross_tab_counts.plot(kind='bar', color=['#2ecc71', '#e74c3c'], width=0.8)
            plt.title(f'Fraud Distribution by {col}', fontsize=16, fontweight='bold', pad=20)
            plt.xlabel(col, fontsize=13)
            plt.ylabel('Count', fontsize=13)
            plt.legend(title='Fraud Label', fontsize=11, title_fontsize=12)
            plt.xticks(rotation=45, ha='right')
            plt.grid(axis='y', alpha=0.3)
            plt.tight_layout()
            plt.savefig(r'E:\sem8\MP\data\3_fraud_by_category.png', dpi=300, bbox_inches='tight')
            print(f"\n✓ Saved: 3_fraud_by_category.png")
            plt.close()
            break  # Only create one chart

# --------------------------------------------
# CHART 4: Word Cloud Comparison
# --------------------------------------------

print(f"\n{'='*60}")
print("CHART 4: TEXT ANALYSIS - WORD CLOUDS")
print(f"{'='*60}")

text_col = None
if 'Return_Description_Clean' in df.columns:
    text_col = 'Return_Description_Clean'
elif 'Return_Description' in df.columns:
    text_col = 'Return_Description'

if text_col and 'Fraud_Label' in df.columns:
    # Word cloud for legitimate and fraud claims
    legitimate_text = ' '.join(df[df['Fraud_Label'] == 'Legitimate'][text_col].astype(str))
    fraud_text = ' '.join(df[df['Fraud_Label'] == 'Fraud'][text_col].astype(str))
    
    fig, axes = plt.subplots(1, 2, figsize=(18, 7))
    
    # Legitimate claims word cloud
    if legitimate_text:
        wordcloud_legit = WordCloud(width=800, height=400, background_color='white', 
                                     colormap='Greens', max_words=100).generate(legitimate_text)
        axes[0].imshow(wordcloud_legit, interpolation='bilinear')
        axes[0].set_title('Word Cloud - Legitimate Claims', fontsize=16, fontweight='bold', pad=15)
        axes[0].axis('off')
    
    # Fraud claims word cloud
    if fraud_text:
        wordcloud_fraud = WordCloud(width=800, height=400, background_color='white', 
                                     colormap='Reds', max_words=100).generate(fraud_text)
        axes[1].imshow(wordcloud_fraud, interpolation='bilinear')
        axes[1].set_title('Word Cloud - Fraudulent Claims', fontsize=16, fontweight='bold', pad=15)
        axes[1].axis('off')
    
    plt.tight_layout()
    plt.savefig(r'E:\sem8\MP\data\4_wordcloud_comparison.png', dpi=300, bbox_inches='tight')
    print("\n✓ Saved: 4_wordcloud_comparison.png")
    plt.close()

# --------------------------------------------
# CHART 5: Description Length Analysis
# --------------------------------------------

print(f"\n{'='*60}")
print("CHART 5: DESCRIPTION LENGTH ANALYSIS")
print(f"{'='*60}")

if 'Description_Length' in df.columns and 'Fraud_Label' in df.columns:
    print("\nDescription Length Statistics by Fraud Label:")
    stats = df.groupby('Fraud_Label')['Description_Length'].describe()
    print(stats)
    
    # Combined visualization: Box plot + Violin plot
    fig, axes = plt.subplots(1, 2, figsize=(16, 6))
    
    # Box plot
    df.boxplot(column='Description_Length', by='Fraud_Label', ax=axes[0],
               patch_artist=True, grid=False)
    axes[0].set_title('Description Length Distribution (Box Plot)', fontsize=14, fontweight='bold')
    axes[0].set_xlabel('Fraud Label', fontsize=12)
    axes[0].set_ylabel('Description Length (characters)', fontsize=12)
    plt.sca(axes[0])
    plt.xticks(rotation=0)
    
    # Violin plot
    sns.violinplot(data=df, x='Fraud_Label', y='Description_Length', 
                   palette=['#2ecc71', '#e74c3c'], ax=axes[1])
    axes[1].set_title('Description Length Distribution (Violin Plot)', fontsize=14, fontweight='bold')
    axes[1].set_xlabel('Fraud Label', fontsize=12)
    axes[1].set_ylabel('Description Length (characters)', fontsize=12)
    
    plt.tight_layout()
    plt.savefig(r'E:\sem8\MP\data\5_description_length_analysis.png', dpi=300, bbox_inches='tight')
    print("\n✓ Saved: 5_description_length_analysis.png")
    plt.close()

# --------------------------------------------
# Summary Report
# --------------------------------------------

print(f"\n{'='*60}")
print("SUMMARY REPORT")
print(f"{'='*60}")

print(f"\nDataset Overview:")
print(f"  - Total Records: {len(df)}")
print(f"  - Total Features: {df.shape[1]}")
print(f"  - Numerical Features: {len(numerical_cols)}")

if 'Fraud_Label' in df.columns:
    fraud_rate = (df['Fraud_Label'] == 'Fraud').sum() / len(df) * 100
    print(f"\nFraud Statistics:")
    print(f"  - Fraud Rate: {fraud_rate:.2f}%")
    print(f"  - Legitimate Claims: {(df['Fraud_Label'] == 'Legitimate').sum()}")
    print(f"  - Fraudulent Claims: {(df['Fraud_Label'] == 'Fraud').sum()}")

print(f"\n{'='*60}")
print("TOP 5 CHARTS EDA COMPLETE!")
print("All visualizations saved with numbered prefixes (1-5)")
print(f"{'='*60}")
