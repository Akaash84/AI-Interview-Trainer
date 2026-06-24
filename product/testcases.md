# ✅ Complete UI/UX and Functional Test Case Document

## 1. General UI/UX Test Cases

| # | Test Case | Expected Result |
|---|------------|-----------------|
| 1 | Verify all pages are fully responsive (320px to 1440px) | All components adjust layout correctly without overlapping or breaking. |
| 2 | Verify consistent use of colors, fonts, and button styles | Same design system across pages. |
| 3 | Verify hover/focus/disabled/loading states for all buttons | Proper visual feedback shown. |
| 4 | Verify animations/transitions work smoothly | No jitter or lag in UI transitions. |
| 5 | Test layout with Flexbox/Grid at different breakpoints | Proper alignment and spacing. |
| 6 | Test accessibility: tab navigation, aria labels, focus indicators | Accessible and keyboard-friendly UI. |


---

## 🎙 2. Speech / Recording Page Test Cases

### Functional

| # | Test Case | Expected Result |
|---|------------|-----------------|
| 1 | Start speech recognition | Mic permission prompt appears and recognition starts. |
| 2 | Stop speech recognition | Recognition stops and transcript displays text. |
| 3 | Timer starts on recording start | Timer increments correctly every second. |
| 4 | Timer stops when recording stops | Timer freezes on stop. |
| 5 | Reset button resets timer, transcript, and recording | All states clear to default. |
| 6 | Custom input (manual text entry) works | Typed text appears in transcript area. |
| 7 | Delete recording removes it from list | Recording disappears immediately. |
| 8 | Filter by date shows only recordings from selected date | Correct filtered list shown. |
| 9 | Download recording | Audio file downloads successfully. |
| 10 | Handle speech recognition failure | Fallback to manual input enabled. |
| 11 | AI-generated feedback after recording (clarity, tone, fluency) | Feedback section updates accurately after each answer. |
| 12 | Audio waveform visualization during recording | Real-time waveform reacts to user speech input. |

### UI/UX

| # | Test Case | Expected Result |
|---|------------|-----------------|
| 13 | Card/list layout for recordings visible | Date, time, and duration shown clearly. |
| 14 | Hover/focus effects on Play/Delete buttons | Visual feedback visible. |
| 15 | Icons and labels clear (Start, Stop, Reset) | Buttons visually distinct. |
| 16 | Loading spinner when processing | Spinner visible during save/download. |
| 17 | Responsive layout for mobile view | Cards stack vertically and text wraps properly. |


---

## 🧠 3. Interview Page Test Cases

### Functional

| # | Test Case | Expected Result |
|---|------------|-----------------|
| 1 | Start Interview button begins question flow | First question appears. |
| 2 | Recording starts after question prompt | Mic activates correctly. |
| 3 | Timer runs for each question | Timer resets and starts for each new question. |
| 4 | Next question appears after answer | Sequential question flow maintained. |
| 5 | End interview saves all responses | All data stored in backend/local DB. |
| 6 | Progress bar updates with each question | Progress % reflects correctly. |
| 7 | Handle multiple question sets (predefined/dynamic) | Correct questions fetched. |

### UI/UX

| # | Test Case | Expected Result |
|---|------------|-----------------|
| 8 | Stepper component shows current question | Active step highlighted. |
| 9 | Progress bar visible and animated | Smooth transition per question. |
| 10 | Feedback (recorded / saved) message displayed | User gets confirmation. |
| 11 | Modal/card layout responsive | Fits on mobile screens. |
| 12 | Buttons disabled during recording | Prevent accidental clicks. |


---

## 📊 4. Interview Insights Page Test Cases

| # | Test Case | Expected Result |
|---|------------|-----------------|
| 1 | Total answers count displayed correctly | Matches backend data. |
| 2 | Average response time computed correctly | Matches time logs. |
| 3 | Speech clarity score displays correctly | Metric consistent. |
| 4 | Charts render properly using Recharts/Chart.js | No blank chart or crash. |
| 5 | Hover tooltip displays exact values | Tooltip text matches chart data. |
| 6 | Color coding consistent across charts | Each metric distinct. |
| 7 | Loading skeleton visible before data loads | Smooth transition from loading to chart. |
| 8 | Responsive layout for all chart sections | Adjusts on mobile/tablet. |
| 9 | Sentiment analysis score visible for each answer | Displays correct sentiment label (Positive/Neutral/Negative). |
| 10 | Download insights report as PDF or CSV | Exports complete data file with charts and metrics intact. |


---

## 👤 5. Profile Page Test Cases

### Functional (Validation + Resume Parser)

| # | Test Case | Expected Result |
|---|------------|-----------------|
| 1 | Required fields validation triggers | “This field is required” shown. |
| 2 | Invalid email triggers validation error | “Enter valid email” shown. |
| 3 | Invalid phone format triggers validation error | “Enter valid phone number” shown. |
| 4 | Password too short triggers error | Password length >= 8 enforced. |
| 5 | Resume upload accepts only PDF/DOCX | Other formats rejected. |
| 6 | Resume file size limit validation | Files > 5MB rejected. |
| 7 | Resume parser extracts Name, Email, Skills | Fields auto-filled correctly. |
| 8 | Save button disabled until all fields valid | Button only activates on valid form. |
| 9 | Successful form save updates profile | Confirmation toast or message shown. |

### UI/UX

| # | Test Case | Expected Result |
|---|------------|-----------------|
| 10 | Error messages displayed inline under fields | Consistent error placement. |
| 11 | Responsive layout on all devices | Form resizes smoothly. |
| 12 | Focus/hover styles on input fields | Proper visual feedback. |


---

## 🧪 6. Overall Test Case Coverage Summary

| Page | Functional Tests | UI/UX Tests | Total |
|-------|------------------|--------------|--------|
| General | 6 | 0 | 6 |
| Speech/Recording | 12 | 5 | 17 |
| Interview | 7 | 5 | 12 |
| Insights | 10 | 0 | 10 |
| Profile | 9 | 3 | 12 |
| **Total** | **44** | **13** | **57 ✅** |


---

## 🌙 7. Optional Enhancements Test Cases

| # | Test Case | Expected Result |
|---|------------|-----------------|
| 1 | Toggle between dark and light mode | Theme switches instantly and persists. |
| 2 | Tooltips appear on hover of icons/buttons | Helpful hints visible. |
| 3 | Loading skeletons appear before data loads | Smooth visual transition. |
| 4 | Responsive modals scale on small screens | Fit mobile view neatly. |


---

✅ **Final Total Test Cases Covered: 57 + 4 Optional Enhancements**
