import { Octokit } from 'octokit';
import { env } from '../config/env.js';

class GitHubResumeClient {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor() {
    this.octokit = new Octokit({ auth: env.GITHUB_TOKEN });
    this.owner = env.RESUME_REPO_OWNER;
    this.repo = env.RESUME_REPO_NAME;
  }

  /**
   * Creates a new branch from 'main' and pushes the tailored TeX content.
   */
  async pushTailoredResume(branchName: string, texContent: string): Promise<string> {
    try {
      console.log(`[github-client] Pushing tailored resume to branch: ${branchName}`);

      // 1. Get the SHA of the 'main' branch
      const { data: mainRef } = await this.octokit.rest.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: 'heads/main',
      });
      const mainSha = mainRef.object.sha;

      // 2. Create a new branch
      await this.octokit.rest.git.createRef({
        owner: this.owner,
        repo: this.repo,
        ref: `refs/heads/${branchName}`,
        sha: mainSha,
      }).catch(err => {
        // If branch already exists, we ignore and just update the file
        if (err.status !== 422) throw err;
        console.log(`[github-client] Branch ${branchName} already exists. Updating file instead.`);
      });

      // 3. Get the current file's SHA if it exists (on the new branch)
      let fileSha: string | undefined;
      try {
        const { data: fileData } = await this.octokit.rest.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path: 'resume.tex',
          ref: branchName,
        });
        if (!Array.isArray(fileData)) {
          fileSha = fileData.sha;
        }
      } catch (err: any) {
        if (err.status !== 404) throw err;
      }

      // 4. Create or update the file
      const { data: commitData } = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: 'resume.tex',
        message: `Tailor resume for ${branchName}`,
        content: Buffer.from(texContent).toString('base64'),
        branch: branchName,
        sha: fileSha,
      });

      const sha = commitData.commit.sha;
      if (!sha) throw new Error('Commit SHA missing from GitHub response');
      console.log(`[github-client] Successfully pushed to ${branchName}. Commit: ${sha}`);
      return sha;
    } catch (error) {
      console.error('[github-client] Failed to push tailored resume:', error);
      throw error;
    }
  }
}

export const githubResumeClient = new GitHubResumeClient();
