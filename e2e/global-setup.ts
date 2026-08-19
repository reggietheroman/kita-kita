import { request, type FullConfig } from '@playwright/test';

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use.baseURL;
  if (typeof baseURL !== 'string' || !baseURL) {
    throw new Error('E2E server preflight failed: Playwright baseURL is not configured.');
  }

  const context = await request.newContext({ baseURL });
  try {
    const response = await context.get('/');
    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()} from ${baseURL}`);
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `E2E server preflight failed for ${baseURL}. Verify Expo Web can start on port 8081. ${detail}`,
    );
  } finally {
    await context.dispose();
  }
}
