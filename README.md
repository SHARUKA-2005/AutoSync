# Job Application Tracker (MERN)

 **Track your job applications efficiently, with automatic Gmail syncing.**

## Overview

This is a **Job Application Tracker** web application that allows users to:

- Add, view, update, and delete jobs they have applied to.
- Automatically **sync Gmail messages** to track application status like Applied, Rejected, or Selected.
- Visualize all jobs in a clean and interactive UI.

It’s built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js) and TailwindCSS for styling.

---

## Features

- **Manual Job Management**  
  Add job title and company manually via a simple form. Delete or update status as needed.

- **Gmail Auto-Sync**  
  Fetch emails automatically to detect application confirmations, rejections, or selection messages. Sync with a single button click.

- **Status Tracking**  
  Jobs are categorized with statuses: `Applied`, `Rejected`, `Selected`. Recent jobs appear at the top.

- **Responsive UI**  
  Clean, mobile-friendly interface using TailwindCSS.

---

## Tech Stack

- **Frontend:** React.js, TailwindCSS, Axios, React Router  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB Atlas (MERN stack)  
- **Email Integration:** Gmail API (OAuth2)  
- **Version Control & Deployment:** GitHub, optional Vercel/Netlify

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
