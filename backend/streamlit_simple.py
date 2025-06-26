import streamlit as st
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import time
import threading
import queue
import random

# Configure Streamlit
st.set_page_config(
    page_title="Live Audio Analysis",
    page_icon="🎤",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for iframe embedding
st.markdown("""
<style>
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}
.main .block-container {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    max-width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
}
.stPlotlyChart {
    background-color: white;
    border-radius: 8px;
    margin-bottom: 0.5rem;
}
div[data-testid="stToolbar"] {
    visibility: hidden;
}
.stApp > header {
    background-color: transparent;
}
.stApp {
    margin-top: -80px;
}
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'data_history' not in st.session_state:
    st.session_state.data_history = []
if 'is_running' not in st.session_state:
    st.session_state.is_running = False
if 'start_time' not in st.session_state:
    st.session_state.start_time = time.time()

def generate_mock_data():
    """Generate realistic mock audio data"""
    # Simulate pitch variations (human voice range)
    base_pitch = 150 + 50 * np.sin(time.time() * 0.5)
    pitch_noise = random.uniform(-20, 20)
    pitch = max(0, base_pitch + pitch_noise)
    
    # Simulate loudness variations
    base_loudness = 3 + 2 * np.sin(time.time() * 0.8)
    loudness_noise = random.uniform(-0.5, 0.5)
    loudness = max(0, base_loudness + loudness_noise)
    
    # Simulate tempo variations
    base_tempo = 120 + 20 * np.sin(time.time() * 0.3)
    tempo_noise = random.uniform(-10, 10)
    tempo = max(60, min(180, base_tempo + tempo_noise))
    
    return pitch, loudness, tempo

def create_charts(data_history):
    """Create the three main charts"""
    if not data_history:
        # Create empty charts with sample data
        sample_time = np.linspace(0, 30, 50)
        fig = make_subplots(
            rows=3, cols=1,
            subplot_titles=('🎵 Pitch (Hz)', '🔊 Loudness', '🥁 Tempo (BPM)'),
            vertical_spacing=0.12
        )
        
        # Add placeholder traces
        fig.add_trace(go.Scatter(
            x=sample_time, 
            y=np.zeros_like(sample_time), 
            name='Pitch',
            line=dict(color='#3498db', width=3),
            mode='lines'
        ), row=1, col=1)
        
        fig.add_trace(go.Scatter(
            x=sample_time, 
            y=np.zeros_like(sample_time), 
            name='Loudness',
            line=dict(color='#2ecc71', width=3),
            mode='lines'
        ), row=2, col=1)
        
        fig.add_trace(go.Scatter(
            x=sample_time, 
            y=np.full_like(sample_time, 120), 
            name='Tempo',
            line=dict(color='#e74c3c', width=3),
            mode='lines'
        ), row=3, col=1)
        
        fig.update_layout(
            height=500, 
            showlegend=False,
            margin=dict(l=60, r=20, t=60, b=20),
            plot_bgcolor='white',
            paper_bgcolor='white'
        )
        
        # Update axes
        fig.update_yaxes(title_text="Hz", range=[0, 300], row=1, col=1)
        fig.update_yaxes(title_text="Level", range=[0, 8], row=2, col=1)
        fig.update_yaxes(title_text="BPM", range=[60, 180], row=3, col=1)
        fig.update_xaxes(title_text="Time (s)", row=3, col=1)
        
        return fig
    
    # Convert data to arrays
    times = [d['time'] for d in data_history]
    pitches = [d['pitch'] for d in data_history]
    loudness = [d['loudness'] for d in data_history]
    tempos = [d['tempo'] for d in data_history]
    
    # Create subplots
    fig = make_subplots(
        rows=3, cols=1,
        subplot_titles=('🎵 Pitch (Hz)', '🔊 Loudness', '🥁 Tempo (BPM)'),
        vertical_spacing=0.12
    )
    
    # Pitch chart
    fig.add_trace(
        go.Scatter(
            x=times, 
            y=pitches,
            mode='lines+markers',
            name='Pitch',
            line=dict(color='#3498db', width=3),
            marker=dict(size=4, color='#3498db'),
            fill='tonexty',
            fillcolor='rgba(52, 152, 219, 0.1)'
        ), 
        row=1, col=1
    )
    
    # Loudness chart
    fig.add_trace(
        go.Scatter(
            x=times, 
            y=loudness,
            mode='lines+markers',
            name='Loudness',
            line=dict(color='#2ecc71', width=3),
            marker=dict(size=4, color='#2ecc71'),
            fill='tonexty',
            fillcolor='rgba(46, 204, 113, 0.1)'
        ), 
        row=2, col=1
    )
    
    # Tempo chart
    fig.add_trace(
        go.Scatter(
            x=times, 
            y=tempos,
            mode='lines+markers',
            name='Tempo',
            line=dict(color='#e74c3c', width=3),
            marker=dict(size=4, color='#e74c3c'),
            fill='tonexty',
            fillcolor='rgba(231, 76, 60, 0.1)'
        ), 
        row=3, col=1
    )
    
    # Update layout
    fig.update_layout(
        height=500,
        showlegend=False,
        margin=dict(l=60, r=20, t=60, b=20),
        plot_bgcolor='white',
        paper_bgcolor='white'
    )
    
    # Update y-axes with dynamic ranges
    pitch_max = max(max(pitches) if pitches else 0, 300)
    loudness_max = max(max(loudness) if loudness else 0, 8)
    tempo_min = max(60, min(tempos) - 20) if tempos else 60
    tempo_max = min(200, max(tempos) + 20) if tempos else 180
    
    fig.update_yaxes(title_text="Hz", range=[0, pitch_max], row=1, col=1)
    fig.update_yaxes(title_text="Level", range=[0, loudness_max], row=2, col=1)
    fig.update_yaxes(title_text="BPM", range=[tempo_min, tempo_max], row=3, col=1)
    fig.update_xaxes(title_text="Time (s)", row=3, col=1)
    
    return fig

# Main app - Compact header
st.markdown("### 🎤 Live Audio Analysis")

# Compact control buttons
col1, col2, col3, col4 = st.columns([1, 1, 1, 2])

with col1:
    if st.button("▶️ Start", type="primary", use_container_width=True):
        st.session_state.is_running = True
        st.session_state.start_time = time.time()
        st.session_state.data_history = []

with col2:
    if st.button("⏹️ Stop", use_container_width=True):
        st.session_state.is_running = False

with col3:
    if st.button("🔄 Clear", use_container_width=True):
        st.session_state.data_history = []
        st.session_state.start_time = time.time()

with col4:
    status_color = "🔴" if st.session_state.is_running else "⚫"
    status_text = "Recording..." if st.session_state.is_running else "Stopped"
    st.markdown(f"**Status:** {status_color} {status_text}")

# Charts container
chart_container = st.empty()

# Auto-start recording when page loads
if 'auto_started' not in st.session_state:
    st.session_state.auto_started = True
    st.session_state.is_running = True
    st.session_state.start_time = time.time()

# Data generation and chart updates
if st.session_state.is_running:
    # Generate new data point
    current_time = time.time() - st.session_state.start_time
    pitch, loudness, tempo = generate_mock_data()
    
    # Add to history
    st.session_state.data_history.append({
        'time': current_time,
        'pitch': pitch,
        'loudness': loudness,
        'tempo': tempo
    })
    
    # Keep only last 100 points for performance
    if len(st.session_state.data_history) > 100:
        st.session_state.data_history = st.session_state.data_history[-100:]

# Update charts
fig = create_charts(st.session_state.data_history)
chart_container.plotly_chart(fig, use_container_width=True, key="audio_charts")

# Auto-refresh for real-time updates
if st.session_state.is_running:
    time.sleep(0.2)  # Update every 200ms
    st.rerun()
