# ImpactFlow

> Smart Resource Allocation Platform for NGOs and Volunteers  
> Built for Google Prompt Wars Hack 2 / Google Solution Challenge

ImpactFlow is an AI-powered social impact platform designed to bridge the gap between NGOs and local volunteers by transforming scattered community-needs data into fast, intelligent action.

Our mission is simple:

## Identify Need → Prioritize Urgency → Match Right Volunteer → Deliver Impact

Instead of NGOs struggling with paper forms, Excel sheets, WhatsApp messages, and manual coordination, ImpactFlow creates one unified system powered by Gemini AI, Firebase, and Google Maps.

# Problem Statement

NGOs and local social groups often face three major challenges.

## Data Fragmentation

Critical information exists across paper surveys, Excel sheets, Google Forms, WhatsApp reports, and manual field notes. This creates delays and missed emergencies.

## Manual Volunteer Matching

Assigning the right volunteer to the right task is often slow, inconsistent, experience-dependent, and difficult during emergencies.

## Invisible Urgency Prioritization

High-priority cases like medical emergencies, food shortages, and disaster response can get buried inside operational chaos.

# Our Solution

## ImpactFlow

A real-time AI-powered NGO Resource Allocation Platform that helps organizations centralize all need reports, classify urgency automatically, visualize needs on live maps, match the best volunteers instantly, and track deployment and impact metrics.

# Core Features

## 1. Data Ingestion Layer

Supports Google Forms, Google Sheets, Excel uploads, manual NGO reports, WhatsApp-based entries, and paper survey forms.

### Special Feature: Gemini Vision

Using Gemini Vision, NGOs can scan handwritten or printed paper forms and automatically convert them into structured digital data. This removes manual data entry completely.

## 2. Needs Visualization Dashboard

Using Google Maps API, coordinators can view urgency heatmaps, critical issue markers, location clustering, category-based filters, and resource requirement visibility. This gives NGOs instant clarity on where action is needed most.

## 3. Volunteer Registration System

Volunteers register with skills, location, availability, transport capability, preferred work type, and urgency tolerance. This creates a high-quality volunteer database for matching.

## 4. Gemini-Powered Volunteer Matching Engine

This is the strongest Prompt Wars feature.

AI matches volunteers based on skills fit, distance, urgency level, availability, mission type, and historical reliability as future scope. This drastically reduces response time.

## 5. NGO Coordinator Dashboard

The operational command center for NGOs.

Features include pending requests, active missions, matched volunteers, escalation alerts, resource analytics, and mission completion tracking.

## 6. Smart Alert System

Examples include urgent medical cases left unmatched, rising food shortages in a region, and lack of available volunteers nearby. This ensures high-priority cases never get ignored.

## 7. Public Impact Dashboard

Tracks transparent social impact including lives helped, meals delivered, volunteers deployed, and successful missions completed. This is important for trust-building and donor visibility.

# System Flow

## MVP Demo Flow

Need Added  
↓  
AI Detects Urgency  
↓  
Map Pin Generated  
↓  
Gemini Suggests Best Volunteers  
↓  
Volunteer Accepts Mission  
↓  
Dashboard Updates Impact Metrics

This is the core winning demo.

# Tech Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- Framer Motion

## Backend

- Firebase
  - Firestore
  - Firebase Auth
  - Firebase Functions
  - Firebase Hosting

## AI Layer

- Gemini API
- Gemini Vision

## Maps and Visualization

- Google Maps API
- React Leaflet

## Additional Tools

- Lucide React
- Groq SDK for report generation and summaries

# Project Structure

```text
Impact-Flow/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   ├── firebase.js
│   ├── main.jsx
│   └── index.css
│
├── public/
├── scratch/
├── Impact_Resource_Nexus/
├── package.json
├── vite.config.js
└── README.md
```

# Key Pages

## LandingPage.jsx

Premium landing page with hero section, mission explanation, and login/signup modal.

## CoordinatorDashboard.jsx

NGO command center with real-time mission tracking, resource distribution, analytics, and alerts.

## VolunteerMobileApp.jsx

Mobile-first volunteer portal with task feed, mission acceptance, and impact profile.

## PublicImpactMap.jsx

Live full-screen map showing active needs, urgency markers, and deployment centers.

## VolunteerMatching.jsx

AI-powered volunteer recommendation system where the top three best-fit volunteers are suggested instantly.

## AddCommunityNeed.jsx

Fast issue reporting page for NGO coordinators.

# Firebase Schema

## users/

Stores UID, name, role, skills, and location.

## needs/

Stores issue title, description, severity, coordinates, and urgency score.

## missions/

Stores assigned volunteers, mission status, and timestamps.

## impact_stats/

Stores meals delivered, lives impacted, and missions completed.

# Installation

## Clone Repository

```bash
git clone https://github.com/codebrak07/Impact-Flow.git
cd Impact-Flow
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

# Why ImpactFlow Can Win

Hackathons reward working demos more than big promises.

We focus on fast MVP execution, strong AI differentiation, clear real-world value, and a simple but powerful demo flow instead of overengineering.

# Team Vision

We believe social impact should move at the speed of urgency.

ImpactFlow is not just a project.

It is infrastructure for faster humanitarian response.

# GitHub Repository

Repository: https://github.com/codebrak07/Impact-Flow

# Built For

Google Prompt Wars Hack 2  
Google Solution Challenge

# Final Note

When help reaches faster, lives change faster.

That is ImpactFlow.
