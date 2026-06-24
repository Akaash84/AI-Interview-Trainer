# 🚀 Weekly Deployment Guide - InterviewTrainer

This document describes the **manual weekly deployment process** for the project.

- **Live URL**: [https://interviewtrainer-one.vercel.app/](https://interviewtrainer-one.vercel.app/)  
- **GitHub Repo**: [https://github.com/askarthikey/interviewtrainer.git](https://github.com/askarthikey/interviewtrainer.git)  

---

## 📌 Steps to Deploy Weekly

### 1. Clone & Pull Latest Code
```bash
git clone https://github.com/askarthikey/interviewtrainer.git
cd interviewtrainer
git checkout main
git pull origin main
```

### 2. Create a Weekly Deployment Branch
Use the format: `deploy-YYYY-MM-DD`
```bash
git checkout -b deploy-2025-08-20
```

### 3. Install Dependencies & Build
```bash
npm install
npm run build
npm run dev   # to test locally
```

### 4. Push Deployment Branch
```bash
git push origin deploy-2025-08-20
```

### 5. Open Pull Request
- Go to **GitHub → Pull Requests**
- Create a PR from `deploy-YYYY-MM-DD` → `main`
- Review & merge into `main`

### 6. Trigger Deployment on Vercel
- Vercel automatically builds & deploys when `main` is updated  
- Alternatively, manually trigger in [Vercel Dashboard](https://vercel.com)

### 7. Verify Deployment
- Check build logs in Vercel  
- Visit: [https://interviewtrainer-one.vercel.app/](https://interviewtrainer-one.vercel.app/)  
- Confirm latest changes are live  

---

- **Deployment Checklist**
  - [x] Branch created  
  - [x] Build successful  
  - [x] Local testing done  
  - [x] PR reviewed & merged  
  - [x] Vercel build successful  
  - [x] Live site verified  

---

📅 **Repeat this process every week** to ensure smooth, consistent deployments.