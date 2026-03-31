---
trigger: always_on
---

# AI Job Applier — Project Description

> An open-source, self-hosted AI agent that automates the most tedious parts of job hunting — so you can focus on preparing for interviews, not copy-pasting resumes.

## Overview

Job hunting is broken. The modern job seeker sends out dozens — sometimes hundreds — of applications, manually tailoring their resume for each role, researching each company from scratch, and filling out the same forms over and over again. It is exhausting, repetitive, and deeply inefficient. Most of that effort is wasted on roles that were never a good fit to begin with.

**AI Job Applier** is a self-hosted automation platform that handles the entire pre-interview pipeline on your behalf. Every hour, it silently scans the top job platforms for new listings that match your profile, scores each opportunity against your resume, tailors your resume specifically for that role, researches the company, and then brings everything to your dashboard — where you make the final call. You approve, it applies. You reject, it archives. Nothing goes out without your eyes on it.

This is not a spray-and-pray bot. It is a precision tool designed to help you apply smarter, not more.

## The Problem It Solves

The average job seeker spends 11 hours per week on job applications. Most of that time is not spent doing anything that requires human judgment — it is spent on tasks that are mechanical, repetitive, and soul-draining:

- Scanning job boards multiple times a day looking for new listings
- Reading job descriptions and manually deciding if they are worth applying to
- Copying and tweaking the same resume bullet points for each role
- Googling the company to understand what they do and whether they are worth your time
- Filling out the same application forms again and again
- Keeping track of where you applied, when, and what version of your resume you used

Every single one of these tasks can be automated — and AI Job Applier automates all of them, while keeping the one thing that should stay human firmly in your hands: the final decision.

AI Job Applier is built for:

- **Active job seekers** who are applying to multiple roles simultaneously and want to maximize their reach without sacrificing quality
- **Developers and technical professionals** who want a self-hosted tool they fully control — no third-party SaaS, no data sharing, no subscription fees
- **Career switchers** who are exploring multiple domains and want the system to intelligently suggest which roles they are qualified for based on their existing experience
- **Anyone who writes their resume in LaTeX via Overleaf** and wants a seamless, automated way to generate tailored PDF versions for each application

If you have ever felt like job hunting is a second full-time job, this tool is for you.

## Core Philosophy

**Human-in-the-loop, always.** Every single application — regardless of how simple or straightforward it appears — goes through your dashboard for review before anything is submitted. The system handles research, scoring, and preparation. You handle decisions. This is non-negotiable by design.

**Quality over quantity.** The system uses AI to filter out jobs where your resume is unlikely to pass ATS screening. It only surfaces roles where there is a genuine match. You will see fewer jobs in your dashboard than exist on the internet — and that is the point.

**Open and self-hosted.** No black-box SaaS. No monthly fees. No resume data sent to a third-party service you did not choose. Everything runs on infrastructure you control, using open-weight AI models accessed via free API tiers.

**Your resume stays yours.** The system works directly with your LaTeX source file. Every tailored version is a new compiled PDF — your base resume is never permanently modified. You always have a clean original to return to.

## Key Features

### Intelligent Role Discovery

Before the system can match you to jobs, it needs to understand you. When you first set up AI Job Applier, you upload your resume and the AI reads it in full — extracting your skills, experience level, technology stack, domain expertise, and seniority signals. From this, it suggests a list of roles you are realistically qualified to apply for. You review and confirm this list, and it becomes your personal filter configuration. The system will only fetch and evaluate jobs that fall within these roles. You can update this list at any time.

### Hourly Job Scraping Across 4 Platforms

A background job runs every hour, scraping fresh listings from Naukri, Indeed, Wellfound, and Internshala. Each listing is deduplicated using Redis — if you have already seen a job (even across multiple scraping cycles), it will never appear in your dashboard again. The scraper runs with human-like timing and behavior to avoid detection. Only jobs that pass the role filter make it into the pipeline.

### AI-Powered Job Fit Scoring

Every job that passes the role filter is scored by the AI before it reaches your dashboard. The scoring engine compares your resume against the full job description and produces an ATS compatibility score along with a gap analysis — a plain-English breakdown of what your resume has that the job wants, and what it is missing. Jobs that fall below your configured minimum score threshold are silently discarded. You only see jobs worth your time.

### Automatic Resume Tailoring

For every job that reaches your dashboard, the AI generates a tailored version of your resume in two passes. The first pass handles substance — reordering bullet points to prioritize relevance, incorporating keywords from the job description, adjusting your professional summary to speak directly to the role, and surfacing skills and projects that align with what the employer is looking for. The second pass handles voice — it rewrites the tailored content to sound natural, human, and consistent with your existing writing style. The result reads like you sat down and spent an hour customizing your resume for this specific job, because effectively, the AI did exactly that.

### LaTeX Resume Pipeline

AI Job Applier works directly with your LaTeX resume source. When the AI tailors your resume, it edits the `.tex` file and pushes the changes to your GitHub repository. A GitHub Actions workflow automatically triggers a LaTeX compilation using the Tectonic compiler and produces a clean, formatted PDF. The PDF is then linked in your dashboard alongside the job listing. Your base `.tex` file is never permanently modified — every tailored version is a separate branch or file, preserving your original.

### Company Research Snapshot

Before a job reaches your dashboard, the system researches the company using SearXNG — a self-hosted, open-source search engine. The AI summarizes what it finds into a compact brief covering the company's size and stage, what they actually do, their culture and work environment based on available signals, notable red flags (mass layoffs, negative reviews, legal issues), and an overall assessment of whether this seems like a company worth your time. This saves you the 15 minutes of Googling you would otherwise do before deciding whether to apply.

### Dashboard With Full Context

The Angular-powered dashboard is where everything comes together. Each job appears as a card showing the role title, company, platform, salary range (when available), the AI's fit reasoning in plain English, the ATS score with highlighted gaps, the company research brief, and a side-by-side diff of your original resume versus the tailored version. You can see exactly what the AI changed and why. From here, you have three choices: approve the application, reject it and archive it permanently, or open the resume editor to make your own adjustments before approving. Nothing is submitted without your explicit action.

### Playwright-Powered Application Submission

Once you approve a job, it enters the application queue. A Playwright-based automation engine handles the actual submission. For Easy Apply listings on Naukri, Indeed, Wellfound, and Internshala, it fills and submits the application form using the tailored PDF resume. For roles that accept email applications, Nodemailer sends a professionally formatted email with your resume attached. The automation runs with human-like delays and behavior. Every submission is logged — platform, timestamp, resume version used, and outcome.

### Full Application Tracking

Every job you interact with is tracked in the database. You can see at a glance how many jobs were scraped, how many passed the fit filter, how many you approved, how many were successfully submitted, and the current status of each application. Statuses include Pending Review, Approved, Applied, Failed, and Archived. Over time, this gives you a clear picture of your job search pipeline.

## What Makes This Different

Most job automation tools are built around volume — apply to as many jobs as possible and hope something sticks. AI Job Applier is built around a different premise: that a well-targeted, well-tailored application to a role you genuinely fit is worth more than fifty generic applications to roles you do not.

The ATS scoring layer means you are not wasting time on jobs where your resume will be auto-rejected before a human ever sees it. The tailoring layer means every application that does go out is presenting the best possible version of your experience for that specific role. The human-in-loop layer means you are never blindly applying to something you would not actually want.

The result is a job search that is both more efficient and more effective — fewer applications, better targeting, higher response rates.

## Platforms Supported

| Platform    | Scraping | Application Method        |
| ----------- | -------- | ------------------------- |
| Naukri      | ✅       | Easy Apply via Playwright |
| Indeed      | ✅       | Easy Apply via Playwright |
| Wellfound   | ✅       | Easy Apply via Playwright |
| Internshala | ✅       | Easy Apply via Playwright |

LinkedIn, Glassdoor, and company-specific portals (Workday, Greenhouse, Lever) are explicitly out of scope for this project.

## AI Models Used

The system uses free-tier API access to state-of-the-art open-weight language models:

- **Groq** running **Llama 3.3 70B** as the primary inference engine — chosen for its exceptional speed and generous free tier
- **Google AI Studio** running **Gemini 2.0 Flash** as the fallback for high-volume periods

Model routing is handled by **LiteLLM**, an open-source proxy that automatically switches between providers based on availability and rate limits. If Groq is rate-limited, requests transparently fall over to Gemini. No manual intervention required. Both models are open-weight, meaning the architecture and weights are publicly available — there is no proprietary black box making decisions about your career.

## Privacy and Data

Because AI Job Applier is entirely self-hosted, your resume never leaves your own infrastructure unless you explicitly send it somewhere. Your resume data is stored in your own PostgreSQL database, on your own Railway or Render instance. The only external services that ever see your resume content are the LLM APIs (Groq and Google AI Studio) — which you authenticate with your own API keys under your own accounts, subject to their respective privacy policies.

Your job application history, company research, and ATS scores are all stored locally. There is no central server, no analytics collection, and no third-party that aggregates your data.
