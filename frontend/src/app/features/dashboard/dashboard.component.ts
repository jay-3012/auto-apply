import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from './dashboard.service';
import { JobListing } from '@shared/types/job.types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash-root">

      <!-- Page Header -->
      <div class="dash-header">
        <div>
          <h2 class="dash-title">Dashboard</h2>
          <p class="dash-subtitle">Your AI-powered job pipeline at a glance.</p>
        </div>
        <button class="dash-refresh-btn" (click)="loadData()">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width:14px;height:14px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Refresh
        </button>
      </div>

      <!-- Stats Cards -->
      <section class="dash-stats-grid">
        <!-- Pending Review -->
        <div class="dash-stat-card">
          <div class="dash-stat-glow dash-stat-glow--amber"></div>
          <div class="dash-stat-inner dash-stat-inner--amber">
            <div class="dash-stat-top">
              <div class="dash-stat-icon dash-stat-icon--amber">
                <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="width:20px;height:20px;color:#fbbf24;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="dash-stat-badge dash-stat-badge--amber">
                <span class="dash-stat-badge-dot dash-stat-badge-dot--amber"></span>
                Active
              </span>
            </div>
            <div class="dash-stat-value">{{ stats().reviewCount }}</div>
            <div class="dash-stat-label">Pending Review</div>
          </div>
        </div>

        <!-- Applied -->
        <div class="dash-stat-card">
          <div class="dash-stat-glow dash-stat-glow--emerald"></div>
          <div class="dash-stat-inner dash-stat-inner--emerald">
            <div class="dash-stat-top">
              <div class="dash-stat-icon dash-stat-icon--emerald">
                <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="width:20px;height:20px;color:#34d399;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="dash-stat-badge dash-stat-badge--emerald">+12%</span>
            </div>
            <div class="dash-stat-value">{{ stats().appliedCount }}</div>
            <div class="dash-stat-label">Total Applied</div>
          </div>
        </div>

        <!-- Active Roles -->
        <div class="dash-stat-card">
          <div class="dash-stat-glow dash-stat-glow--indigo"></div>
          <div class="dash-stat-inner dash-stat-inner--indigo">
            <div class="dash-stat-top">
              <div class="dash-stat-icon dash-stat-icon--indigo">
                <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="width:20px;height:20px;color:#818cf8;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <span class="dash-stat-badge dash-stat-badge--indigo">Tracking</span>
            </div>
            <div class="dash-stat-value">3</div>
            <div class="dash-stat-label">Active Roles</div>
          </div>
        </div>

        <!-- Failed -->
        <div class="dash-stat-card">
          <div class="dash-stat-glow dash-stat-glow--rose"></div>
          <div class="dash-stat-inner dash-stat-inner--rose">
            <div class="dash-stat-top">
              <div class="dash-stat-icon dash-stat-icon--rose">
                <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="width:20px;height:20px;color:#fb7185;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <span class="dash-stat-badge dash-stat-badge--neutral">0 issues</span>
            </div>
            <div class="dash-stat-value">0</div>
            <div class="dash-stat-label">Failed Automations</div>
          </div>
        </div>
      </section>

      <!-- Review Queue Section -->
      <section>
        <div class="dash-section-header">
          <div class="dash-section-title-row">
            <h3 class="dash-section-title">Review Queue</h3>
            <div class="dash-section-divider"></div>
            <span class="dash-section-hint">AI has processed these jobs for your approval</span>
          </div>
        </div>

        <div class="dash-jobs-grid">
          @for (job of jobs(); track job.id) {
            <div class="dash-job-card">
              <!-- Card Header -->
              <div class="dash-job-header">
                <div class="dash-job-header-top">
                  <div class="dash-job-title-wrap">
                    <h4 class="dash-job-title" [title]="job.title">{{ job.title }}</h4>
                    <div class="dash-job-company">
                      <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="width:14px;height:14px;color:#64748b;flex-shrink:0;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                      </svg>
                      <span>{{ job.company }}</span>
                    </div>
                  </div>
                  <span class="dash-platform-badge" [attr.data-platform]="job.platform.toLowerCase()">
                    {{ job.platform }}
                  </span>
                </div>

                <!-- Salary if available -->
                <div *ngIf="job.salary" class="dash-job-salary">
                  <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="width:14px;height:14px;color:#34d399;flex-shrink:0;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ job.salary }}</span>
                </div>
              </div>

              <!-- Scores Section -->
              <div class="dash-job-scores">
                <div class="dash-score-row">
                  <div class="dash-score-labels">
                    <span class="dash-score-label">Fit Score</span>
                    <span class="dash-score-value" [style.color]="getScoreHex(job.application?.fitScore || 0)">
                      {{ job.application?.fitScore || 0 }}%
                    </span>
                  </div>
                  <div class="dash-score-bar-track">
                    <div class="dash-score-bar-fill"
                         [style.width.%]="job.application?.fitScore || 0"
                         [style.background]="getBarGradient(job.application?.fitScore || 0)">
                    </div>
                  </div>
                </div>

                <!-- AI Reasoning -->
                <p class="dash-job-reasoning">
                  {{ job.application?.aiReasoning || 'AI analysis in progress...' }}
                </p>
              </div>

              <!-- Actions -->
              <div class="dash-job-actions">
                <button class="dash-action-btn dash-action-btn--reject" (click)="onReject(job)">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width:14px;height:14px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
                <button class="dash-action-btn dash-action-btn--approve" (click)="onApprove(job)">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width:14px;height:14px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Approve
                </button>
              </div>
            </div>
          } @empty {
            <!-- Empty State -->
            <div class="dash-empty">
              <div class="dash-empty-icon-wrap">
                <svg fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 24 24" style="width:40px;height:40px;color:#475569;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <h4 class="dash-empty-title">Queue is empty</h4>
              <p class="dash-empty-text">All caught up! New jobs will appear here after the next scrape cycle runs.</p>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dash-root {
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      gap: 32px;
      animation: fadeInUp 0.4s ease-out both;
    }

    /* ── Header ── */
    .dash-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
    }
    .dash-title {
      font-size: 24px;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .dash-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 4px 0 0;
      font-weight: 500;
    }
    .dash-refresh-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #cbd5e1;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .dash-refresh-btn:hover {
      background: rgba(255,255,255,0.08);
      color: #fff;
    }

    /* ── Stats Grid ── */
    .dash-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    @media (max-width: 1200px) {
      .dash-stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .dash-stats-grid { grid-template-columns: 1fr; }
    }

    .dash-stat-card {
      position: relative;
    }
    .dash-stat-glow {
      position: absolute;
      inset: 0;
      border-radius: 16px;
      filter: blur(20px);
      opacity: 0;
      transition: opacity 0.5s;
      pointer-events: none;
    }
    .dash-stat-card:hover .dash-stat-glow { opacity: 1; }
    .dash-stat-glow--amber { background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.03)); }
    .dash-stat-glow--emerald { background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.03)); }
    .dash-stat-glow--indigo { background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.03)); }
    .dash-stat-glow--rose { background: linear-gradient(135deg, rgba(244,63,94,0.15), rgba(244,63,94,0.03)); }

    .dash-stat-inner {
      position: relative;
      background: rgba(30,41,59,0.5);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 20px;
      transition: border-color 0.3s;
    }
    .dash-stat-card:hover .dash-stat-inner--amber { border-color: rgba(245,158,11,0.2); }
    .dash-stat-card:hover .dash-stat-inner--emerald { border-color: rgba(16,185,129,0.2); }
    .dash-stat-card:hover .dash-stat-inner--indigo { border-color: rgba(99,102,241,0.2); }
    .dash-stat-card:hover .dash-stat-inner--rose { border-color: rgba(244,63,94,0.2); }

    .dash-stat-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .dash-stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dash-stat-icon--amber { background: rgba(245,158,11,0.1); }
    .dash-stat-icon--emerald { background: rgba(16,185,129,0.1); }
    .dash-stat-icon--indigo { background: rgba(99,102,241,0.1); }
    .dash-stat-icon--rose { background: rgba(244,63,94,0.1); }

    .dash-stat-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
      border-radius: 999px;
      text-transform: uppercase;
    }
    .dash-stat-badge--amber { background: rgba(245,158,11,0.12); color: #fbbf24; border: 1px solid rgba(245,158,11,0.2); }
    .dash-stat-badge--emerald { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
    .dash-stat-badge--indigo { background: rgba(99,102,241,0.12); color: #818cf8; border: 1px solid rgba(99,102,241,0.2); }
    .dash-stat-badge--neutral { background: rgba(100,116,139,0.12); color: #94a3b8; border: 1px solid rgba(100,116,139,0.2); }

    .dash-stat-badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
      flex-shrink: 0;
    }
    .dash-stat-badge-dot--amber { background: #fbbf24; }

    .dash-stat-value {
      font-size: 30px;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 4px;
      letter-spacing: -0.02em;
    }
    .dash-stat-label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
    }

    /* ── Section Header ── */
    .dash-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .dash-section-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .dash-section-title {
      font-size: 18px;
      font-weight: 800;
      color: #f8fafc;
      margin: 0;
    }
    .dash-section-divider {
      width: 1px;
      height: 24px;
      background: rgba(255,255,255,0.1);
    }
    .dash-section-hint {
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
    }

    /* ── Jobs Grid ── */
    .dash-jobs-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    @media (max-width: 1200px) {
      .dash-jobs-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .dash-jobs-grid { grid-template-columns: 1fr; }
    }

    /* ── Job Card ── */
    .dash-job-card {
      background: rgba(30,41,59,0.6);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    .dash-job-card:hover {
      border-color: rgba(99,102,241,0.3);
      box-shadow: 0 0 20px -6px rgba(99,102,241,0.15);
    }

    .dash-job-header {
      padding: 20px 20px 16px;
    }
    .dash-job-header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 4px;
    }
    .dash-job-title-wrap {
      flex: 1;
      min-width: 0;
    }
    .dash-job-title {
      font-size: 15px;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }
    .dash-job-company {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #94a3b8;
      font-weight: 500;
    }
    .dash-job-company span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dash-platform-badge {
      flex-shrink: 0;
      padding: 3px 10px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-radius: 999px;
      border: 1px solid;
    }
    .dash-platform-badge[data-platform="naukri"] {
      background: rgba(56,189,248,0.12);
      color: #38bdf8;
      border-color: rgba(56,189,248,0.2);
    }
    .dash-platform-badge[data-platform="indeed"] {
      background: rgba(99,102,241,0.12);
      color: #818cf8;
      border-color: rgba(99,102,241,0.2);
    }
    .dash-platform-badge[data-platform="wellfound"] {
      background: rgba(16,185,129,0.12);
      color: #34d399;
      border-color: rgba(16,185,129,0.2);
    }
    .dash-platform-badge[data-platform="internshala"] {
      background: rgba(245,158,11,0.12);
      color: #fbbf24;
      border-color: rgba(245,158,11,0.2);
    }

    .dash-job-salary {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
      font-size: 12px;
      font-weight: 600;
      color: #34d399;
    }

    /* ── Scores ── */
    .dash-job-scores {
      padding: 16px 20px;
      border-top: 1px solid rgba(255,255,255,0.04);
      background: rgba(255,255,255,0.015);
      flex: 1;
    }
    .dash-score-row {
      margin-bottom: 14px;
    }
    .dash-score-labels {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .dash-score-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .dash-score-value {
      font-size: 14px;
      font-weight: 700;
    }
    .dash-score-bar-track {
      width: 100%;
      height: 6px;
      background: rgba(51,65,85,0.5);
      border-radius: 999px;
      overflow: hidden;
    }
    .dash-score-bar-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.7s ease-out;
    }
    .dash-job-reasoning {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.6;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* ── Actions ── */
    .dash-job-actions {
      padding: 14px 20px;
      border-top: 1px solid rgba(255,255,255,0.04);
      display: flex;
      gap: 10px;
    }
    .dash-action-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px 14px;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 600;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .dash-action-btn--reject {
      background: rgba(255,255,255,0.05);
      color: #cbd5e1;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .dash-action-btn--reject:hover {
      background: rgba(255,255,255,0.1);
      color: #fff;
    }
    .dash-action-btn--approve {
      background: #6366f1;
      color: #fff;
      box-shadow: 0 4px 12px -2px rgba(99,102,241,0.35);
    }
    .dash-action-btn--approve:hover {
      background: #818cf8;
      box-shadow: 0 6px 16px -2px rgba(99,102,241,0.5);
    }

    /* ── Empty State ── */
    .dash-empty {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
    }
    .dash-empty-icon-wrap {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      background: rgba(30,41,59,0.5);
      border: 1px solid rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }
    .dash-empty-title {
      font-size: 18px;
      font-weight: 700;
      color: #94a3b8;
      margin: 0 0 8px;
    }
    .dash-empty-text {
      font-size: 14px;
      color: #475569;
      max-width: 300px;
      margin: 0;
      line-height: 1.5;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  jobs = signal<JobListing[]>([]);
  stats = signal<DashboardStats>({
    pendingCount: 0,
    reviewCount: 0,
    appliedCount: 0,
    failedCount: 0
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.dashboardService.getReviewJobs().subscribe(jobs => this.jobs.set(jobs));
    this.dashboardService.getStats().subscribe(stats => this.stats.set(stats));
  }

  getScoreHex(score: number): string {
    if (score >= 75) return '#34d399';
    if (score >= 55) return '#fbbf24';
    return '#fb7185';
  }

  getBarGradient(score: number): string {
    if (score >= 75) return 'linear-gradient(90deg, #10b981, #34d399)';
    if (score >= 55) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    return 'linear-gradient(90deg, #f43f5e, #fb7185)';
  }

  onApprove(job: JobListing): void {
    const appId = job.application?.id;
    if (appId) {
      this.dashboardService.approveApplication(appId).subscribe(success => {
        if (success) {
          this.jobs.update(current => current.filter(j => j.id !== job.id));
        }
      });
    }
  }

  onReject(job: JobListing): void {
    const appId = job.application?.id;
    if (appId) {
      this.dashboardService.rejectApplication(appId).subscribe(success => {
        if (success) {
          this.jobs.update(current => current.filter(j => j.id !== job.id));
        }
      });
    }
  }
}
