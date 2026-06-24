# ACCURACY REPORT: GOOGLE GEMINI AND MANUAL LABELLING

## Objective
The objective of this analysis is to evaluate the accuracy of Google Gemini’s automated scoring against manually assigned scores for mock interview responses. The evaluation helps in understanding whether Gemini can reliably assess interview answers with consistency comparable to human evaluators.

## Dataset Description
The dataset comprises 100 mock interview responses for a Software Developer role, covering 10 technical domains with 10 questions each. The data includes questions, user responses, response times, confidence scores, domains, and evaluation scores from multiple sources. For this analysis, only the Manual Labelling and Google Gemini scores are used.

- **Dataset Size:** 100 entries (10 questions per domain × 10 domains)
- **Domains:** Backend Development, Frontend Development, Mobile Development, Cloud Computing, DevOps, Databases, AI/Machine Learning, Cybersecurity, Data Structures and Algorithms (DSA), System Design
- **Key Columns for this analysis:**
  - **Manual Labelling:** Human-annotated scores (0-10 scale)
  - **Google Gemini:** Automated scores predicted by Gemini (0-10 scale)
  - **Other Columns:** Question, User Response, Response Time, Confidence Score, Domain, ChatGPT scores

## Evaluation Metrics
The following metrics were used to evaluate Google Gemini’s performance against manual labels:

- **Accuracy:** The proportion of responses where Gemini’s score exactly matches the manual score.  
  *Formula:* (Number of exact matches / Total responses) × 100

- **Mean Absolute Error (MAE):** The average absolute difference between Gemini and manual scores, indicating typical error magnitude.  
  *Formula:* Σ|Manual - Gemini| / n

- **Root Mean Squared Error (RMSE):** The square root of the average squared difference, penalizing larger errors more heavily.  
  *Formula:* √(Σ(Manual - Gemini)² / n)

- **Tolerance-based Accuracy:** Proportion of responses where Gemini’s score is within ±1 of the manual score.

## Results
The evaluation of Google Gemini’s performance against manual labels yielded the following overall metrics:

- **Exact Match Accuracy:** 62.00% (62/100 responses where Gemini’s score exactly matched the manual score)
- **Mean Absolute Error (MAE):** 0.38 (average absolute difference between scores)
- **Root Mean Squared Error (RMSE):** 0.62 (penalizes larger errors, showing error distribution)
- **Tolerance-based Accuracy:** 100.00% (100/100 responses within ±1 of the manual score)

| Domain               | Exact Matches | Accuracy (%) | MAE  | RMSE |
|----------------------|---------------|--------------|------|------|
| Backend Development  | 4/10          | 40.00        | 0.60 | 0.77 |
| Frontend Development | 8/10          | 80.00        | 0.20 | 0.45 |
| Mobile Development   | 6/10          | 60.00        | 0.40 | 0.63 |
| Cloud Computing      | 7/10          | 70.00        | 0.30 | 0.55 |
| DevOps               | 5/10          | 50.00        | 0.50 | 0.71 |
| Databases            | 7/10          | 70.00        | 0.30 | 0.55 |
| AI / Machine Learning| 6/10          | 60.00        | 0.40 | 0.63 |
| Cybersecurity        | 7/10          | 70.00        | 0.30 | 0.55 |
| DSA                  | 5/10          | 50.00        | 0.50 | 0.71 |
| System Design        | 7/10          | 70.00        | 0.30 | 0.55 |

## Bar Chart: Domain-Specific Accuracy
The bar chart illustrates the exact match accuracy percentages across the 10 technical domains. Each bar represents a domain, with heights corresponding to accuracy levels ranging from 40% (Backend Development) to 80% (Frontend Development).

<img width="560" height="310" alt="Screenshot 2025-09-11 at 7 29 10 PM" src="https://github.com/user-attachments/assets/b35a1219-5193-4740-a218-c1514273d207" />

## Analysis & Observations
The analysis shows Google Gemini achieves a 62% exact match accuracy and 100% tolerance-based accuracy (±1), indicating reliable scoring with minimal deviations (MAE 0.38, RMSE 0.62). Frontend Development excels at 80% accuracy, while Backend Development lags at 40%, likely due to complex Node.js and API design questions. Domains like Cloud Computing, Cybersecurity, and System Design maintain 70% accuracy, suggesting strong performance in infrastructure and security topics.

## Limitations
- **Subjectivity in Manual Labelling:** Different evaluators may assign varying scores, especially for subjective questions.
- **Limited Dataset Size:** The dataset, consisting of 100 responses, is tailored only to the Software Developer role and focuses solely on technical questions, lacking diversity in other roles and non-technical aspects.

## Conclusion
Google Gemini achieved an exact match accuracy of 62.00% and a tolerance-based accuracy of 100.00% against manual labels, with an MAE of 0.38 and RMSE of 0.62. It works well in Databases but not so much in Backend Development. Expanding the dataset with diverse responses could enhance automated interview assessments.
