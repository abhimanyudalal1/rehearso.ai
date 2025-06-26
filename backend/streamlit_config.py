import streamlit as st
import os

def configure_streamlit():
    """Configure Streamlit for iframe embedding"""
    
    # Set page config
    st.set_page_config(
        page_title="Audio Analysis",
        page_icon="🎤",
        layout="wide",
        initial_sidebar_state="collapsed"
    )
    
    # Custom CSS to make it work better in iframe
    st.markdown("""
    <style>
    /* Hide Streamlit branding and menu */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Make content fit better in iframe */
    .main .block-container {
        padding-top: 1rem;
        padding-bottom: 1rem;
        max-width: 100%;
    }
    
    /* Improve chart visibility */
    .stPlotlyChart {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 1rem;
    }
    
    /* Better spacing */
    .row-widget {
        margin-bottom: 0.5rem;
    }
    </style>
    """, unsafe_allow_html=True)

def set_cors_headers():
    """Set CORS headers for iframe embedding"""
    st.markdown("""
    <script>
    // Allow iframe embedding
    if (window.parent !== window) {
        // We're in an iframe
        console.log('Running in iframe mode');
    }
    </script>
    """, unsafe_allow_html=True)
