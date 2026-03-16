# Saily Product Specification

## Overview
Saily is a grounded, daily puzzle application (NYT/Wordle style) where players participate in real-world citizen science. The "game" is the classification of actual astronomical data (TESS lightcurves) and planetary surface imagery (Mars).

The app combines a lightweight narrative layer with high-impact scientific discovery.

---

## 1. Core Loop
- **Frequency:** One mission per day.
- **Reset Time:** Melbourne/AEST Midnight (UTC+10/11).
- **Structure:**
  1. **Briefing:** A few lines of text from a character (DiceBear avatar) explaining their simple need (e.g., finding silicon, a home, or water).
  2. **The Puzzle:** The actual classification of a real-world scientific source.
  3. **The Result:** Submission of the classification to a global "Volume of Knowledge."
  4. **The Beat:** A narrative reaction from the character based on the discovery.

---

## 2. Narrative Engine
- **Structure:** 4 core storylines, each containing 5 Chapters.
- **Delivery:** 
  - Each day, a "Global Storyline" is active for all users.
  - The specific chapter a user plays is based on their individual progress in that storyline.
- **Visuals:** Simple text briefings and reactions. Characters have reacting avatars that change expression based on story beats.
- **Ambience:** Subtle environmental soundscapes (e.g., wind, ship hum) during briefings.

---

## 3. Puzzle Types (Citizen Science)
### 3.1 Planet Hunter (TESS Lightcurves)
- **Goal:** Identify transits (dips in flux) that indicate potential planets.
- **Mechanics:**
  - Interactive lightcurve (zoom/pan).
  - Tools: Phase-Fold, Binning.
  - **Hint Penalty:** Using these tools reduces the XP and score earned, as it makes the discovery "easier."
- **Verification:** There is NO automated "Correct Answer." The classifications are submitted in bulk to scientific bodies.

### 3.2 Mars Classification
- **Goal:** Identify surface features (craters, dunes, deposits).
- **Mechanics:** 
  - Surface imagery.
  - **Dictionary:** A set of template images for comparison.
  - Players tag specific entities on the image.

---

## 4. Economy & Progression
### 4.1 Data Chips (Currency/Consumables)
- **Functions:**
  - **Repair Streaks:** If a day is missed, a Data Chip can be consumed to maintain the streak count.
  - **Archive Access:** Used to play historical puzzles (no score/XP).
  - **Get Hints:** Small extra helps.
- **Earning:** Awarded for finishing 5-chapter story arcs.

### 4.2 Postcards (Referrals)
- **Function:** Personalized referral codes for inviting new players.
- **Earning:** Awarded for finishing 5-chapter story arcs.

### 4.3 Streaks & XP
- **Streak:** Daily consecutive play count.
- **XP/Score:** Earned for classifications. Higher for "No Hint" discoveries.
- **Competition:** Global leaderboards and direct comparison if multiple users analyze the same anomaly over time.

---

## 5. Technical Architecture
### 5.1 Content Strategy
- **Text:** Storyline text is stored client-side (TypeScript) to keep the database lean.
- **Data Source:** Real TESS lightcurves and Mars imagery. We will never run out of data; there is no procedural generation.

### 5.2 Social & Community
- **Forum:** A dedicated thread for each daily anomaly. 
- **Privacy:** Discussion is restricted to the scientific data (not the story). Threads are locked/hidden until the user has played to prevent "spoiling" the classification.

---

## 6. Verification & Scientific Output
- **Bulk Submission:** User classifications are aggregated and sent to scientific bodies for expert review.
- **Truth Discovery:** Grouping results based on entity identification counts to reach a consensus.
