# ResumeWise AI

<h3>Video Demo Link: <a href="https://drive.google.com/file/d/1TWeAB2lsSnLss7LiY2YWAPTFMG_cdLV8/view?usp=sharing" target="_blank">Click Here</a></h3>

<h3>Deployment: <a href="https://resumewise-ai.vercel.app/" target="_blank">Click Here</a></h3>

## Overview

ResumeWise AI is a powerful, full-stack web application designed to streamline the initial stages of the recruitment process. It leverages artificial intelligence to analyze resumes against job descriptions, providing a detailed and structured comparison. This allows human resources (HR) professionals and hiring managers to quickly identify the most promising candidates.

## Features

-   **User Authentication:** Secure user registration and login system using JWT for session management.
-   **Resume Upload/Input:** Users can upload/input resumes in various formats (e.g., PDF, DOCX, text).
-   **Job Description Upload/Input:** A simple interface to upload/input the job description for the role being hired for.
-   **AI-Powered Analysis:** Utilizes Google's Generative AI to perform an in-depth analysis of the uploaded resume against the provided job description.
-   **Results Display:** Presents the analysis in a clear and structured format, highlighting the candidate's suitability for the role.
-   **Responsive UI:** A modern and responsive user interface built with React and Tailwind CSS.

## Tech Stack

### Frontend

-   **Framework:** React.js
-   **Language:** TypeScript
-   **Build Tool:** Vite
-   **Styling:** Tailwind CSS
-   **HTTP Client:** Axios
-   **Routing:** React Router DOM

### Backend

-   **Framework:** Express.js
-   **Language:** TypeScript
-   **Runtime:** Node.js
-   **AI:** Google Generative AI
-   **Authentication:** JSON Web Tokens (JWT)
-   **File Handling:** Multer
-   **Database:** MongoDB with Mongoose

## Project Structure

The project is organized into two main directories:

-   `client/`: Contains the frontend React application.
-   `server/`: Contains the backend Node.js and Express.js application, including all API routes, controllers, models, and AI integration.

## Getting Started

### Prerequisites

-   Node.js and npm
-   MongoDB
-   Gemini APi

### Installation and Running

**Backend:**

```bash
cd server
npm install
npm run dev
```

**Frontend:**

```bash
cd client
npm install
npm run dev
```
