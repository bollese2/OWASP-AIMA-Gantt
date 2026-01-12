<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/16hlcRLSDJm1BrPpLPStEPCHy0wUys3qf

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment

This app is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

### GitHub Pages Deployment

The app is deployed using GitHub Actions. The workflow:
1. Builds the app using `npm run build`
2. Uploads the build artifacts to GitHub Pages
3. Deploys the site

**Important:** To enable GitHub Pages deployment, ensure that:
- GitHub Pages is enabled in the repository settings
- Source is set to "GitHub Actions"
- The workflow has the necessary permissions (`pages: write`, `id-token: write`)

Once deployed, the app will be available at: `https://bollese2.github.io/OWASP-AIMA-Gantt/`
