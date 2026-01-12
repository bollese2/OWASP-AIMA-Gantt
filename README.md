<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# View this application live

View this app in GitHub Pages: https://bollese2.github.io/OWASP-AIMA-Gantt/

This application is also configured for GitLab Pages deployment.

## Deploy to GitLab Pages

1. Push this repository to GitLab
2. The `.gitlab-ci.yml` configuration will automatically build and deploy to GitLab Pages
3. Once deployed, the app will be available at: `https://<your-username>.gitlab.io/OWASP-AIMA-Gantt/`

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
