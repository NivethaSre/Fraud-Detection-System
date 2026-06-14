"""
Fraud Detection - Interactive EDA Dashboard
Displays top 5 charts in a beautiful web UI
"""

from flask import Flask, render_template, jsonify, Response, send_from_directory
import json
import plotly
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from wordcloud import WordCloud
import base64
from io import BytesIO
import warnings
import sys
import os
warnings.filterwarnings('ignore')

app = Flask(__name__)

# Load data
try:
    df = pd.read_csv("E:/sem8/MP/data/text_model_preprocessed.csv")
    print("✓ Loaded preprocessed data")
except:
    df = pd.read_csv("E:/sem8/MP/data/text_model.csv")
    print("✓ Loaded original data")

@app.route('/')
def index():
    return render_template('eda_dashboard.html')

@app.route('/static/charts/<path:filename>')
def serve_chart(filename):
    return send_from_directory(os.getcwd(), filename)

@app.route('/api/chart1')
def chart1_fraud_distribution():
    """Chart 1: Fraud Label Distribution"""
    fraud_counts = df['Fraud_Label'].value_counts()
    
    # Fill any NaNs just in case
    df_plot = df.copy()
    df_plot['Fraud_Label'] = df_plot['Fraud_Label'].fillna('Unknown')
    
    # Create subplots
    fig = make_subplots(
        rows=1, cols=2,
        specs=[[{'type': 'bar'}, {'type': 'pie'}]],
        subplot_titles=('Count Distribution', 'Percentage Distribution')
    )
    
    # Bar chart
    fig.add_trace(
        go.Bar(
            x=fraud_counts.index,
            y=fraud_counts.values,
            marker_color=['#2ecc71', '#e74c3c'],
            text=fraud_counts.values,
            textposition='auto',
            name='Count'
        ),
        row=1, col=1
    )
    
    # Pie chart
    fig.add_trace(
        go.Pie(
            labels=fraud_counts.index,
            values=fraud_counts.values,
            marker_colors=['#2ecc71', '#e74c3c'],
            textinfo='label+percent',
            name='Distribution'
        ),
        row=1, col=2
    )
    
    fig.update_layout(
        title_text='<b>Fraud Label Distribution</b>',
        title_font_size=20,
        showlegend=False,
        height=500,
        template='plotly_white'
    )
    
    return Response(json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder), mimetype='application/json')

@app.route('/api/chart2')
def chart2_correlation_heatmap():
    """Chart 2: Correlation Heatmap"""
    numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    numerical_cols = [col for col in numerical_cols if 'ID' not in col.upper() and 'Claim_ID' not in col]
    
    if len(numerical_cols) < 2:
        return jsonify({'error': 'Not enough numerical columns'})
    
    # Handle NaNs in correlation matrix
    correlation_matrix = df[numerical_cols].corr().fillna(0)
    
    fig = go.Figure(data=go.Heatmap(
        z=correlation_matrix.values,
        x=correlation_matrix.columns,
        y=correlation_matrix.columns,
        colorscale='RdBu',
        zmid=0,
        text=correlation_matrix.values.round(2),
        texttemplate='%{text}',
        textfont={"size": 10},
        colorbar=dict(title="Correlation")
    ))
    
    fig.update_layout(
        title='<b>Correlation Heatmap - Numerical Features</b>',
        title_font_size=20,
        height=600,
        template='plotly_white',
        xaxis_title='Features',
        yaxis_title='Features'
    )
    
    return Response(json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder), mimetype='application/json')

@app.route('/api/chart3')
def chart3_fraud_by_category():
    """Chart 3: Fraud Analysis by Category"""
    if 'Fraud_Label' not in df.columns:
        return jsonify({'error': 'Fraud_Label column not found'})
    
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    categorical_cols = [col for col in categorical_cols if 'Description' not in col and 'Clean' not in col and col != 'Fraud_Label']
    
    if not categorical_cols:
        return jsonify({'error': 'No categorical columns found'})
    
    # Find first suitable categorical column
    selected_col = None
    for col in categorical_cols:
        if df[col].nunique() <= 10:
            selected_col = col
            break
    
    if not selected_col:
        selected_col = categorical_cols[0]
    
    # Handle NaNs in categorical column
    df_temp = df.copy()
    df_temp[selected_col] = df_temp[selected_col].fillna('Unknown')
    cross_tab = pd.crosstab(df_temp[selected_col], df_temp['Fraud_Label'])
    
    fig = go.Figure()
    
    for fraud_label in cross_tab.columns:
        color = '#2ecc71' if fraud_label == 'Legitimate' else '#e74c3c'
        fig.add_trace(go.Bar(
            name=fraud_label,
            x=cross_tab.index,
            y=cross_tab[fraud_label],
            marker_color=color,
            text=cross_tab[fraud_label],
            textposition='auto'
        ))
    
    fig.update_layout(
        title=f'<b>Fraud Distribution by {selected_col}</b>',
        title_font_size=20,
        xaxis_title=selected_col,
        yaxis_title='Count',
        barmode='group',
        height=500,
        template='plotly_white',
        legend=dict(title='Fraud Label')
    )
    
    return Response(json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder), mimetype='application/json')

@app.route('/api/chart4')
def chart4_wordcloud():
    """Chart 4: Word Cloud Comparison"""
    text_col = None
    if 'Return_Description_Clean' in df.columns:
        text_col = 'Return_Description_Clean'
    elif 'Return_Description' in df.columns:
        text_col = 'Return_Description'
    
    if not text_col or 'Fraud_Label' not in df.columns:
        return jsonify({'error': 'Required columns not found'})
    
    # Generate word clouds
    legitimate_text = ' '.join(df[df['Fraud_Label'] == 'Legitimate'][text_col].astype(str))
    fraud_text = ' '.join(df[df['Fraud_Label'] == 'Fraud'][text_col].astype(str))
    
    wordclouds = []
    
    for text, title, colormap in [(legitimate_text, 'Legitimate Claims', 'Greens'), 
                                   (fraud_text, 'Fraudulent Claims', 'Reds')]:
        if text:
            wc = WordCloud(width=800, height=400, background_color='white', 
                          colormap=colormap, max_words=100).generate(text)
            
            # Convert to base64
            img_buffer = BytesIO()
            wc.to_image().save(img_buffer, format='PNG')
            img_str = base64.b64encode(img_buffer.getvalue()).decode()
            
            wordclouds.append({
                'title': title,
                'image': f'data:image/png;base64,{img_str}'
            })
    
    return jsonify({'wordclouds': wordclouds})

@app.route('/api/chart5')
def chart5_description_length():
    """Chart 5: Description Length Analysis"""
    if 'Description_Length' not in df.columns or 'Fraud_Label' not in df.columns:
        return jsonify({'error': 'Required columns not found'})
    
    fig = make_subplots(
        rows=1, cols=2,
        subplot_titles=('Box Plot', 'Violin Plot')
    )
    
    # Box plot
    # Use df_plot or handle NaNs
    labels = df['Fraud_Label'].dropna().unique()
    for fraud_label in labels:
        color = '#2ecc71' if fraud_label == 'Legitimate' else '#e74c3c'
        data = df[df['Fraud_Label'] == fraud_label]['Description_Length']
        
        fig.add_trace(
            go.Box(
                y=data,
                name=str(fraud_label),
                marker_color=color,
                boxmean='sd'
            ),
            row=1, col=1
        )
        
        fig.add_trace(
            go.Violin(
                y=data,
                name=str(fraud_label),
                marker_color=color,
                box_visible=True,
                meanline_visible=True
            ),
            row=1, col=2
        )
    
    fig.update_layout(
        title_text='<b>Description Length Analysis</b>',
        title_font_size=20,
        height=500,
        showlegend=True,
        template='plotly_white'
    )
    
    fig.update_yaxes(title_text="Description Length (characters)", row=1, col=1)
    fig.update_yaxes(title_text="Description Length (characters)", row=1, col=2)
    
    return Response(json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder), mimetype='application/json')

@app.route('/api/summary')
def get_summary():
    """Get dataset summary statistics"""
    numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    numerical_cols = [col for col in numerical_cols if 'ID' not in col.upper()]
    
    summary = {
        'total_records': len(df),
        'total_features': df.shape[1],
        'numerical_features': len(numerical_cols)
    }
    
    if 'Fraud_Label' in df.columns:
        fraud_rate = (df['Fraud_Label'] == 'Fraud').sum() / len(df) * 100
        summary['fraud_rate'] = round(fraud_rate, 2)
        summary['legitimate_count'] = int((df['Fraud_Label'] == 'Legitimate').sum())
        summary['fraud_count'] = int((df['Fraud_Label'] == 'Fraud').sum())
    
    return jsonify(summary)

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Starting Fraud Detection EDA Dashboard")
    print("="*60)
    print(f"\n📊 Dataset loaded: {len(df)} records")
    
    port = 5000
    if len(sys.argv) > 1:
        for i, arg in enumerate(sys.argv):
            if arg == '--port' and i + 1 < len(sys.argv):
                port = int(sys.argv[i+1])
    
    print(f"🌐 Dashboard URL: http://localhost:{port}")
    print("\n" + "="*60 + "\n")
    
    app.run(debug=True, port=port)
